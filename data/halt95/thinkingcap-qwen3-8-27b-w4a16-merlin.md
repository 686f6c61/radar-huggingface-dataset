# halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin

## Resumen

ThinkingCap-Qwen3.8-27B-W4A16-Merlin es una cuantizacion W4A16 de 4 bits del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicado por el usuario halt95. ThinkingCap es a su vez un finetune de Qwen/Qwen3.8-27B, un modelo denso de 27B parametros con capacidades de vision-lenguaje, ventana de contexto nativa de 262K tokens y razonamiento configurable. El objetivo concreto del finetune ThinkingCap es reducir el numero de tokens de "pensamiento" manteniendo la precision, y esta cuantizacion traslada ese comportamiento a un checkpoint que cabe y se sirve en GPUs de consumo.

El checkpoint pesa unos 17 GB repartidos en 11 archivos e incorpora tres elementos tecnicos clave: el cuerpo en AWQ int4 asimetrico con group size 128 en formato compressed-tensors; la `lm_head` y la cabeza del drafter MTP tambien en int4, de modo que la decodificacion especulativa por multi-token prediction funciona directamente sobre pesos cuantizados; y escalas FP8 E4M3 por capa para la KV-cache de las capas de atencion completa. El resultado esta pensado para servir el contexto completo de 262K en configuraciones de dos o cuatro RTX 3090 mediante el stack Merlin engine v2.5.2.

La relevancia practica esta en la licencia y en el nicho de despliegue. No es un modelo de uso libre: hereda la PolyForm Small Business 1.0.0 de BottleCap AI, con permiso adicional para uso personal no comercial y uso comercial restringido a "small business". Al mismo tiempo, es una de las pocas rutas documentadas para ejecutar un modelo multimodal de 27B con 262K de contexto en hardware Ampere de consumo (sm_86), con metricas de tokens de razonamiento y latencia medidas sobre GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso de vision-lenguaje (base Qwen3.8-27B); capas de atencion completa con KV-cache FP8 E4M3 y referencia a estado SSM en fp16 en el stack de servicio. Composicion por capas no detallada en la informacion disponible |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K), nativo |
| Tipos de cuantizacion | W4A16 int4 (AWQ asimetrico, group size 128, formato compressed-tensors); KV-cache en FP8 E4M3 |
| Idiomas soportados | Ingles (en) |
| Licencia | polyform-small-business-1.0.0 (PolyForm Small Business 1.0.0, con permiso adicional de BottleCap AI para uso personal no comercial); los materiales de Qwen internos permanecen en Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 11 archivos, ~17 GB |

## Arquitectura y entrenamiento

La informacion proporcionada describe el modelo base como un modelo denso de 27B de tipo vision-lenguaje orientado a codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo, con razonamiento configurable y 262K tokens de contexto nativo. El checkpoint que nos ocupa no introduce cambios de arquitectura: es una version cuantizada del mismo cuerpo. La model card menciona explicitamente "capas de atencion completa" al describir las escalas FP8 de la KV-cache y un "estado SSM en fp16" en el stack de servicio, lo que apunta a una arquitectura hibrida con componentes de tipo state space, aunque la composicion detallada por capas no se especifica en la informacion disponible.

En cuanto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset ni si se empleo RLHF o DPO sobre Qwen3.8-27B. Lo unico documentado es el efecto del finetune ThinkingCap: reduce el gasto de tokens de razonamiento manteniendo la precision, medido sobre GSM8K. En la innovacion tecnica destacan tres piezas: la cuantizacion int4 tambien de la `lm_head` y de la cabeza MTP (que habilita decodificacion especulativa desde pesos int4), las escalas FP8 E4M3 calibradas por capa para la KV-cache (reutilizadas byte a byte del release base) y el uso de multi-token prediction (MTP K=4) dentro del motor de servicio. El `tokenizer.json` es el archivo original de Qwen3.8-27B, y los pesos de `lm_head`, embeddings y cabeza MTP son identicos bit a bit a los del release base.

## Capacidades

- Generacion de texto conversacional y tareas de razonamiento multi-paso con modo de pensamiento configurable (niveles de esfuerzo de razonamiento, con `xhigh` por defecto en los scripts del perfil ThinkingCap).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con etiqueta explicita `vision`.
- Generacion de codigo y asistencia en tareas de trabajo profesional y de investigacion.
- Razonamiento aritmetico y resolucion de problemas tipo GSM8K con cadenas de pensamiento reducidas.
- Contexto largo real de hasta 262K tokens, con soporte de multiples sesiones concurrentes residentes.
- Decodificacion especulativa mediante multi-token prediction (MTP K=4) desde pesos int4.
- Flujos agenticos de horizonte largo segun la descripcion del modelo base Qwen3.8.
- Capacidad multilingue limitada al ingles segun la metadata del repositorio.
- Soporte de `tool calling` / `function calling`: no confirmado de forma explicita en la informacion disponible.

## Casos de uso

- Procesamiento de documentos largos con vision: analisis de informes, contratos o expedientes escaneados combinando OCR implicito (entrada de imagen) con razonamiento sobre el texto completo, aprovechando los 262K tokens de ventana para no trocear el documento.
- Analisis de repositorios y bases de codigo extensas: carga de varios archivos fuente en una sola sesion para tareas de revision, refactorizacion o generacion de tests, con la ventana completa disponible.
- Razonamiento matematico y verificacion numerica en entornos de investigacion: los datos de GSM8K muestran precision mantenida (97,27 % en esfuerzo `medium`) con un 14 % menos de tokens de pensamiento en mediana.
- Despliegue on-premise con GPUs de consumo: equipos que ya disponen de dos o cuatro RTX 3090 pueden servir un modelo multimodal de 27B con contexto completo sin recurrir a A100/H100, util en entornos con restricciones de presupuesto o de soberania de datos.
- Atencion al cliente o asistentes internos sobre corpus muy grandes: la capacidad de mantener tres sesiones residentes de 262K (configuracion dual) o siete (configuracion quad) permite atender a varios usuarios concurrentes con contexto amplio.
- Investigacion sobre cuantizacion y decodificacion especulativa: el checkpoint es un caso de estudio de W4A16 con drafter MTP en int4 y KV en FP8 sobre sm_86, replicable con el repositorio de servicio publicado.
- Evaluacion de licencias y compliance: util como ejemplo de modelo con licencia no permisiva (PolyForm Small Business) frente a variantes Apache-2.0 del mismo linaje, para decidir que checkpoint integrar en un producto.

## Benchmarks y rendimiento

La model card incluye una comparacion emparejada contra el checkpoint Qwen3.8-27B v1.3.0 sobre items de test de GSM8K. Las dos variantes se ejecutaron en pares de tarjetas distintas (aproximadamente un 5 % de diferencia de velocidad entre ellas), por lo que los tiempos son indicativos y la comparacion se decide por precision y conteo de tokens.

| Esfuerzo, items | Variante | Precision | Tokens de pensamiento, mediana / media | Tiempo mediano hasta la respuesta |
|---|---|---:|---:|---:|
| medium, 1.319 | base | 97,27 % | 157 / 205,9 | 3,7 s |
| medium, 1.319 | ThinkingCap (este checkpoint) | 97,27 % | 135 / 170,2 | 3,3 s |
| medium, 1.319 | emparejado | +0,00 pp, no inferior (p = 0,001) | x0,860 de la mediana (IC 95 % 0,840-0,879) | x0,891 (0,871-0,915), indicativo |
| xhigh, 400 | base | 96,75 % | 140 / 458,4 | 3,8 s |
| xhigh, 400 | ThinkingCap (este checkpoint) | 97,75 % | 81 / 176,4 | 2,8 s |
| xhigh, 400 | emparejado | +1,00 pp, solo informativo (p de no inferioridad = 0,004) | x0,579 de la mediana (IC 95 % 0,533-0,625) | x0,754 (0,692-0,796), indicativo |

No se publicaron resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible. La celda `xhigh` es solo informativa y su guardarrail de precision queda marcado como provisional por la herramienta de comparacion, ya que el filtro de repeticion no forma parte de sus entradas.

## Requisitos de hardware

- VRAM estimada para pesos: ~17 GB de checkpoint en disco, con cuerpo, `lm_head` y cabeza MTP en int4. No cabe utilmente en una sola GPU de consumo con el contexto completo.
- GPU validadas: exclusivamente sm_86 (Ampere). Configuracion dual RTX 3090 (TP=2) o quad RTX 3090 (TP=4). Una sola tarjeta no esta soportada por este release.
- Capacidad de KV-cache: 883 bloques en configuracion dual, equivalentes a tres sesiones de 262K o seis de 131K residentes simultaneamente; 2.470 bloques en configuracion quad, equivalentes a siete sesiones de 262K. En el log de arranque, `GPU KV cache size: 826.689 tokens` en dual card.
- Opciones de despliegue: stack propio `halt95/qwen38-27b-3090s` v1.3.0 (Merlin engine v2.5.2 con el parche de 27B y tile de verificacion FlashInfer de 32 filas), entorno con hash bloqueado e instalacion bare-metal. La libreria declarada en el repositorio es vLLM. No se distribuye imagen de contenedor.
- Latencia observada: 3,3 s de mediana hasta la respuesta en esfuerzo `medium` (1.319 items) y 2,8 s en `xhigh` (400 items), en pares RTX 3090 duales y con caracter indicativo.
- Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-W4A16-Merlin (este) | ~27,36 B densos | 262K | W4A16 int4 AWQ + KV FP8 | PolyForm Small Business 1.0.0 | HuggingFace, 11 archivos, ~17 GB |
| bottlecapai/ThinkingCap-Qwen3.8-27B | ~27 B densos (no confirmado) | 262K | Sin cuantizar (base) | PolyForm Small Business 1.0.0 | HuggingFace |
| Qwen/Qwen3.8-27B | ~27 B densos | 262K | Sin cuantizar (base) | Apache-2.0 (materiales Qwen) | HuggingFace |
| halt95/Qwen3.8-27B-W4A16-Merlin | ~27 B densos | 262K | W4A16 int4 AWQ + KV FP8 | Apache-2.0 | HuggingFace, ~17 GB |

El cuarto modelo de la tabla es la variante Apache-2.0 del mismo linaje de cuantizacion sobre Qwen3.8-27B sin el finetune ThinkingCap: es la alternativa directa cuando la licencia PolyForm es un impedimento. La diferencia funcional frente al base es la reduccion de tokens de razonamiento medida en GSM8K; en precision, el cambio es neutro o ligeramente favorable en `xhigh`. No se dispone de comparaciones con modelos de otros linajes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no permisiva: los pesos no son Apache-2.0. El uso comercial exige encajar en la definicion de "Small Business" de PolyForm (menos de 100 personas y menos de 1 millon de USD de facturacion del ano anterior, ajustado por inflacion); cualquier otro uso comercial requiere una licencia separada de BottleCap AI.
- Obligacion de arrastre de licencias: `LICENSE`, `LICENSE-PolyForm-Small-Business-1.0.0.txt`, `LICENSE-Apache-2.0-Qwen.txt` y `NOTICE` deben acompanar cualquier copia. El aviso requerido es "Copyright 2026 BottleCap AI".
- Alcance de la validacion: unicamente sm_86 (Ampere). No hay validacion en Ada, Hopper ni arquitecturas posteriores. No esta soportado en tarjeta unica.
- Idioma: solo ingles declarado. No hay datos de rendimiento en castellano ni en otros idiomas.
- Evidencia de benchmarks limitada a una unica familia de tareas (problemas aritmeticos tipo GSM8K), con un unico esquema de muestreo. No hay MMLU, HumanEval ni evaluaciones de vision publicadas.
- Intervalos de confianza y margenes: los tiempos son indicativos por ejecutarse en pares de tarjetas distintos; la celda `xhigh` es solo informativa y su guardarrail de precision es provisional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el comportamiento general de la familia Qwen3.8.
- Sesgos conocidos: no documentados en la informacion disponible.
- Despliegue no trivial: instalacion bare-metal con entorno bloqueado por hash, descarga de activos del motor aparte y ausencia de imagen de contenedor. No hay soporte directo de llama.cpp, Ollama ni TGI documentado para este checkpoint.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion identicas (12 de octubre de 2026). Es un artefacto reciente y sin adopcion publica verificable.
- Trazabilidad: los pesos `lm_head`, embeddings y cabeza MTP se declaran identicos bit a bit al release base, y las escalas FP8 de KV se reutilizan byte a byte; el autor indica que el checkpoint no tiene version propia y sigue la v1.3.0 del stack de servicio.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin
- Archivos del repositorio: https://huggingface.co/halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin/tree/main
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo origen de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Apache-2.0 del mismo linaje de cuantizacion: https://huggingface.co/halt95/Qwen3.8-27B-W4A16-Merlin
- Repositorio de servicio (release v1.3.0): https://github.com/halt95/qwen38-27b-3090s
- Licencia PolyForm Small Business 1.0.0: https://polyformproject.org/licenses/small-business/1.0.0
- Sitio de BottleCap AI: https://bottlecapai.com
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Entrada en LLM Explorer: https://llm-explorer.com/model/halt95%2FQwen3.8-27B-W4A16-Merlin,3VUP2cLqFT8xyakdNAypwK
- Entrada en Free2AITools: https://free2aitools.com/model/halt95/qwen3.8-27b-w4a16-merlin
