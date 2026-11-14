# 0xSero/Inkling-2-Small-EXL3-3.48bpw

## Resumen

Inkling-2-Small-EXL3-3.48bpw es una cuantizacion EXL3 del modelo multimodal thinkingmachines/Inkling-2-Small, publicada por el usuario 0xSero. El modelo base es un transformer MoE de 594B parametros totales con 17B activos, capaz de procesar imagen y texto (pipeline image-text-to-text). La cuantizacion reduce el checkpoint original de 393,5 GB a 270 GB aplicando EXL3 trellis (codebook mul1, entre 2,5 y 5 bits por capa, 3,48 bpw de media) exclusivamente a los expertos enrutados del MoE; el resto de tensores (atencion, pesos compartidos, router, embeddings, torre de vision y cabeza MTP) se copian sin modificar en BF16.

El interes practico de esta ficha es doble. Por un lado, demuestra una estrategia de cuantizacion selectiva: solo se comprime la parte del modelo que concentra el grueso de los parametros (los expertos), preservando intactas las componentes mas sensibles. Por otro, la model card reporta una evaluacion de calidad inusualmente detallada (KLD y acuerdo top-1 por dominio sobre 218K tokens retenidos), lo que permite juzgar la perdida real con numeros concretos en lugar de impresiones.

Ahora bien, el modelo no es utilizable todavia en produccion: el autor advierte que exllamav3 y TabbyAPI no soportan Inkling-2 de serie, y que la implementacion esta en desarrollo. Los pesos estan dimensionados para 4 GPU de 96 GB. Hasta que esa implementacion este disponible, este checkpoint solo sirve con el codigo en curso del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen), con atencion global y sliding-window, cabeza MTP de decodificacion especulativa |
| Parametros totales | 594B (modelo base) |
| Parametros activos | 17B (modelo base) |
| Longitud de contexto | no disponible de forma explicita; la evaluacion incluye filas de contexto largo de 16K-32K tokens y la arquitectura usa 8 capas de atencion global y 40 de sliding-window con anillo de 1024 tokens |
| Tipos de cuantizacion | EXL3 trellis, codebook mul1, 2,5-5 bits por capa, 3,48 bpw de media (solo expertos enrutados); resto de tensores en BF16 |
| Idiomas soportados | no disponible (la evaluacion incluye un dominio multilingue, pero no se listan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3), incluye `mtp.safetensors` sin modificar |
| Tamano del checkpoint | 270 GB (frente a 393,5 GB del original) |
| Libreria | exllamav3 |
| Estado del loader | no soportado aun por exllamav3 stock ni TabbyAPI |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small es un transformer de mezcla de expertos (MoE) con 594B parametros totales y 17B activos, orientado a tareas multimodales (image-text-to-text) y conversacionales. La arquitectura combina 8 capas de atencion global con 40 capas de atencion de ventana deslizante (sliding-window), lo que limita el coste de cache KV: solo las capas globales requieren cache de longitud completa, mientras que las de ventana mantienen un anillo de 1024 tokens. Incluye ademas una cabeza MTP (multi-token prediction) para decodificacion especulativa. El checkpoint original almacena los expertos de las capas 0-39 en NVFP4 y los de las capas 40-47 en MXFP8.

Esta ficha no documenta el entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF/DPO); esa informacion no esta disponible en el material proporcionado. Lo que si se detalla es el proceso de cuantizacion:

- Los expertos NVFP4 y MXFP8 del checkpoint original se dequantizaron de forma exacta y se verificaron bit a bit contra un decodificador independiente.
- La calibracion uso 4,17M tokens en 916 filas: aproximadamente 60% son sesiones reales de agente y codigo con uso de herramientas; el resto es texto multilingue, Wikipedia, razonamiento, matematicas, codigo, datos estructurados y de function calling, y conversacion. Un 12% de los tokens corresponden a filas de contexto largo de 16K-32K. Todos los secretos se redactaron antes del uso.
- La cuantizacion se hizo capa a capa sobre las activaciones del propio modelo ya cuantizado, de modo que cada capa se calibra con entradas que ya arrastran el error de las capas anteriores. El Hessian de cada experto se calcula solo con los tokens que el router le envia (unos 80K tokens por experto de media); los expertos raramente enrutados se contraen hacia la covarianza de la capa.
- La matematica del modelo se verifico contra la implementacion de referencia con un error relativo de ~1e-7 en FP32 y un 100% de acuerdo en el top-8 del router.

La asignacion de bits es desigual por capa y por proyeccion: las capas 0-16 usan 4 bpw en gate/up y 5 bpw en down; las capas 17-23, 3,5 y 5→4; las capas 24-28, 3 y 4→3,5; las capas 29-39, 2,5 y 3,5→2,5; y las capas 40-47, 2,5 y 2,5-3. El detalle por capa con error de reconstruccion esta en `quantization_details.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`, torre de vision incluida sin cuantizar).
- Razonamiento y modo "thinking" (la evaluacion incluye un dominio especifico de thinking/reasoning).
- Codigo y matematicas (dominios evaluados por separado en la tabla de calidad).
- Uso de herramientas y function calling (dominios "tool calling" y "agentic (multi-turn tool use)" evaluados).
- Comportamiento agentico multi-paso, segun el dominio agentico de la evaluacion y la calibracion con sesiones reales de agente.
- Capacidades multilingues (dominio multilingue evaluado; idiomas concretos no disponibles).
- Decodificacion especulativa mediante cabeza MTP incluida en el checkpoint (`mtp.safetensors`).
- Contexto largo: la evaluacion cubre filas de 16K-32K tokens y la arquitectura esta disenada para cache KV eficiente en contexto largo.

## Casos de uso

- Agente de codigo con uso de herramientas: el modelo esta calibrado con sesiones reales de agente y codigo con tool use, y la cuantizacion preserva especialmente bien el dominio de codigo (KLD 0.0091, 97,58% de acuerdo top-1). Encaja en pipelines que encadenan llamadas a funciones, edicion de ficheros y ejecucion de tests.
- Function calling en produccion: el dominio de tool calling mantiene un 96,34% de acuerdo top-1 con el original, de modo que sirve para enrutar peticiones a APIs estructuradas sin degradar la seleccion de herramienta.
- Razonamiento multi-paso con modo thinking: util para tareas de planificacion o resolucion de problemas donde se quiere una traza de razonamiento antes de la respuesta, con KLD de 0.0085 en ese dominio.
- Asistente conversacional multimodal: al conservar la torre de vision intacta en BF16, puede responder preguntas sobre imagenes en un chat multi-turno, por ejemplo soporte tecnico con capturas de pantalla.
- Analisis de documentos largos: las 8 capas de atencion global con cache completo y las 40 de ventana deslizante permiten procesar contexto largo (la evaluacion incluye filas de 32K) con menor coste de memoria que un modelo de atencion densa equivalente.
- Despliegue en servidor multi-GPU con alta concurrencia: los pesos estan dimensionados para 4 GPU de 96 GB, y el diseno de cache KV (solo 8 capas con cache completo) deja margen para servir varias peticiones simultaneas con contexto largo.
- Evaluacion e investigacion de cuantizacion selectiva: el checkpoint y su tabla de calidad por dominio sirven como referencia para estudiar el impacto de cuantizar solo los expertos de un MoE grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si se publica es una evaluacion de calidad de la cuantizacion frente al checkpoint original, sobre 218.477 tokens retenidos que no solapan con la calibracion:

| Dominio | Tokens | KLD (nats) | Acuerdo top-1 | PPL origen → cuantizado |
|---|---:|---:|---:|---:|
| Agentico (tool use multi-turno) | 30.695 | 0.0518 | 96,35% | 3.042 → 3.056 |
| Tool calling | 18.420 | 0.0304 | 96,34% | 3.920 → 3.932 |
| Codigo | 15.388 | 0.0091 | 97,58% | 2.692 → 2.694 |
| Thinking / razonamiento | 18.238 | 0.0085 | 96,08% | 3.204 → 3.201 |
| Chat | 7.019 | 0.0100 | 96,62% | 4.573 → 4.559 |
| Multilingue | 17.507 | 0.0273 | 94,59% | 5.708 → 5.742 |
| Wiki / general | 12.909 | 0.0258 | 95,10% | 5.578 → 5.604 |
| Contexto largo (filas de 32K) | 98.301 | 0.0196 | 97,71% | 2.195 → 2.208 |
| **Total** | **218.477** | **0.0240** | **96,82%** | **2.951 → 2.963 (+0,4%)** |

El autor senala que buena parte del KLD medido es un suelo numerico y no dano de cuantizacion: reducir 32 veces el error de los expertos de esta cuantizacion deja aun cerca del 85% del KLD medido, y ejecutar el modelo original con su cuantizacion de activaciones NVFP4/MXFP8 nativa desplaza el resultado una cantidad similar respecto a la referencia BF16 (KLD ≈ 0.037). Tambien advierte que las cifras solo son comparables entre cuantizaciones evaluadas con el mismo protocolo.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 270 GB. El autor indica que estan dimensionados para 4 GPU de 96 GB (384 GB en total), lo que deja margen para cache KV y contexto largo.
- Cache KV: solo las 8 capas de atencion global necesitan cache de longitud completa; las 40 de ventana deslizante mantienen un anillo de 1024 tokens, lo que reduce mucho el coste frente a un modelo denso equivalente.
- GPU recomendadas: 4× H100 96 GB, 4× A100 80 GB no cabe por capacidad total (320 GB < 270 GB de pesos mas cache, margen muy justo o insuficiente), 4× B200 o configuraciones de 96 GB por GPU. No cabe en GPU de consumo (RTX 4090 de 24 GB) ni en una unica GPU profesional.
- Despliegue: exllamav3 con la implementacion de Inkling-2 en curso (batched decoding, multi-GPU, cache KV cuantizada con sliding-window y decodificacion especulativa MTP). No es compatible con exllamav3 stock ni con TabbyAPI en el momento de publicacion. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, esta cuantizacion se puede contrastar con su propio modelo base:

| Modelo | Parametros | Formato | Tamano | Licencia | Uso |
|---|---|---|---|---|---|
| thinkingmachines/Inkling-2-Small (original) | 594B totales / 17B activos | NVFP4 + MXFP8 (expertos) | 393,5 GB | Apache-2.0 | Requiere implementacion compatible |
| 0xSero/Inkling-2-Small-EXL3-3.48bpw | 594B totales / 17B activos | EXL3 3,48 bpw (expertos) + BF16 resto | 270 GB | Apache-2.0 | exllamav3 (implementacion en curso) |

La ventaja de la cuantizacion es una reduccion del 31% en tamano (123,5 GB menos) con un aumento de perplejidad del 0,4% en el conjunto agregado. No hay datos publicados para comparar con otros modelos MoE multimodales de tamano similar.

## Limitaciones y advertencias

- No utilizable en produccion todavia: exllamav3 stock y TabbyAPI no soportan Inkling-2; hace falta la implementacion en curso del autor. La model card no incluye aun instrucciones de ejecucion.
- Requiere hardware de gama alta: 4 GPU de 96 GB como minimo practico; no cabe en GPU de consumo.
- Solo se cuantizan los expertos enrutados; el resto de tensores queda en BF16, lo que limita la reduccion de tamano (270 GB) y hace que el checkpoint no sea apto para entornos con poca VRAM.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un modelo generativo de gran escala y debe tratarse como tal en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no listados; la evaluacion multilingue muestra el mayor KLD (0.0273) y el menor acuerdo top-1 (94,59%) de todos los dominios, por lo que el rendimiento fuera de los idiomas principales del entrenamiento puede degradarse mas.
- La calidad de la cuantizacion debe compararse solo con el mismo protocolo de evaluacion; las cifras de KLD de otros checkpoints no son directamente comparables.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de la implementacion de exllamav3 en produccion.
- El repositorio figura con 0 GB de tamano reportado y 0 descargas en el momento de la consulta; verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xSero/Inkling-2-Small-EXL3-3.48bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor en Hugging Face: https://huggingface.co/0xSero
- Organizacion Thinking Machines en Hugging Face: https://huggingface.co/thinkingmachines
