# Prismner/Phantester

## Resumen

Phantester es un adaptador LoRA publicado por Prismner sobre el modelo base `openai-community/gpt2-xl`. Su proposito declarado es clasificar telemetria estructurada y restringida de integridad de ficheros y recomendar acciones defensivas, en el ambito de la defensa frente a ransomware. No es un modelo de proposito general ni un detector autonomo: la model card insiste en que debe operar detras de un motor de politicas determinista y que el modelo no debe recibir claves, ejecutar criptografia, borrar ficheros ni activar contencion directamente.

El adaptador se entreno durante tres epocas sobre 80.000 ejemplos sinteticos, con validacion sobre 10.000 y evaluacion sobre un test disjunto de otros 10.000, segun los datos del autor. Los resultados reportados (100 % de coincidencia exacta en la decision JSON y 100 % de recall de fallos canario sobre datos sinteticos) miden enrutamiento determinista de politicas sobre un corpus generado, no deteccion real de ransomware.

Su relevancia es acotada: se trata de un artefacto experimental de 0,1 GB, sin descargas ni interacciones en el momento de la consulta, construido sobre GPT-2 XL, un modelo sin ajuste por instrucciones y con ventana de contexto reducida. Resulta util como referencia de diseno (esquema de salida estricto, puerta de publicacion con criterios criptograficos de fail-closed) mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre GPT-2 XL; transformer decoder-only con adaptadores de bajo rango |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el base GPT-2 XL tiene 1.500 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; GPT-2 XL soporta 1.024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base en safetensors o formato compatible |
| Modelo base | openai-community/gpt2-xl |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-11-28 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre GPT-2 XL, un transformer decoder-only de 1.500 millones de parametros con contexto de 1.024 tokens. El adaptador anade matrices de bajo rango entrenables sobre las proyecciones del modelo base, lo que permite ajustar la tarea sin reentrenar los pesos completos; el repositorio solo contiene los pesos del adaptador (0,1 GB) y exige cargar `openai-community/gpt2-xl` como base.

El entrenamiento consistio en tres epocas sobre 80.000 ejemplos sinteticos de telemetria de integridad de ficheros y decisiones defensivas, con 10.000 ejemplos de validacion y 10.000 de test disjunto. El autor indica que las mismas prompts se confinan a un unico split para evitar fuga de datos. La perdida de entrenamiento reportada es 0,7183 y el tiempo de ejecucion en una H100 de 80 GB fue de 20 minutos y 25 segundos. No se documenta el uso de RLHF, DPO ni una fase de ajuste por instrucciones; el modelo base no esta instruction-tuned.

## Capacidades

- Clasificacion de telemetria estructurada de integridad de ficheros y emision de una decision en formato JSON segun un esquema documentado.
- Recomendacion de acciones defensivas dentro de un conjunto acotado de opciones, siempre bajo supervision de un motor de politicas determinista.
- Deteccion de fallos canario (canary failures) en el corpus sintetico de evaluacion, con recall reportado del 100 %.
- Salida restringida a esquema: cualquier salida fuera del esquema documentado debe considerarse no fiable.
- No soporta tool calling ni function calling de forma declarada.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues no documentadas.

## Casos de uso

- Enrutamiento de decisiones en un pipeline de defensa: el adaptador recibe telemetria de integridad ya normalizada y propone una accion (por ejemplo, cuarentena o escalado) que un motor de politicas valida antes de ejecutar. Es adecuado porque su salida esta constrenida a un esquema JSON y el diseno exige validacion determinista posterior.
- Prototipado de clasificadores de eventos de integridad: sirve como linea base para experimentar con esquemas de telemetria y comparar frente a reglas heuristicas, dado su bajo coste de despliegue (adaptador de 0,1 GB sobre GPT-2 XL).
- Generacion de datos de evaluacion: el esquema de decision documentado y los criterios de puerta de publicacion (95 % de coincidencia exacta y 100 % de recall de canarios) pueden reutilizarse para construir conjuntos de prueba de sistemas de defensa.
- Investigacion sobre fail-closed criptografico: la model card exige que las pruebas de fail-closed criptografico pasen antes de publicar un checkpoint, lo que lo convierte en un ejemplo de integracion de salvaguardas en el ciclo de publicacion de modelos.
- Formacion y auditoria de pipelines de seguridad: permite ilustrar como separar la inferencia del modelo de las acciones destructivas (borrado, contencion), manteniendo el modelo sin acceso a claves.
- Experimentacion con PEFT sobre GPT-2 XL: como adaptador LoRA pequeno, es util para estudiar el ajuste de un modelo base sin instrucciones a una tarea de clasificacion estructurada con contexto corto.

## Benchmarks y rendimiento

Datos reportados por el autor sobre el corpus sintetico:

| Metrica | Resultado |
|---|---:|
| Coincidencia exacta de decision JSON | 100 % |
| Recall de fallos canario | 100 % |
| Perdida de entrenamiento | 0,7183 |
| Tiempo de entrenamiento (H100 80 GB) | 20 min 25 s |

El autor advierte explicitamente de que estas cifras miden enrutamiento determinista de politicas sobre datos sinteticos y no deben interpretarse como tasas de falsos positivos o falsos negativos en deteccion real de ransomware. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador pesa 0,1 GB y el base GPT-2 XL (1.500 millones de parametros) requiere aproximadamente 3 GB en fp16 y alrededor de 1,5-2 GB en cuantizacion de 8 bits, aunque no se documentan cuantizaciones del adaptador.
- GPU recomendadas: el autor reporta entrenamiento en una H100 de 80 GB; para inferencia basta una GPU consumer moderna con al menos 4-6 GB de VRAM.
- Cabe en GPU consumer: si, dado el tamano del modelo base; no se especifican modelos concretos probados.
- Opciones de despliegue: la libreria es `peft`, por lo que se carga con Transformers + PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, se compara con el modelo base del que depende:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phantester (adaptador) | No disponible (base de 1.500 M) | 1.024 tokens (base) | Clasificacion de telemetria de integridad | Apache 2.0 | Hugging Face, 0 descargas |
| openai-community/gpt2-xl | 1.500 M | 1.024 tokens | Generacion de texto general | MIT (segun el repositorio original) | Hugging Face, ampliamente usado |

No se identifican en la informacion disponible otros adaptadores de defensa frente a ransomware directamente comparables.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintetico; no se establece precision de deteccion de ransomware en el mundo real.
- GPT-2 XL no esta ajustado por instrucciones y tiene una ventana de contexto limitada (1.024 tokens), lo que restringe la telemetria que puede procesarse por invocacion.
- Cualquier salida fuera del esquema documentado debe tratarse como no fiable.
- El modelo no debe recibir claves, ejecutar criptografia, borrar ficheros ni activar contencion directamente; debe operar detras de un motor de politicas determinista.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el formato de salida constrenido mitiga parcialmente este riesgo, pero no lo elimina.
- Sesgos conocidos: no documentados; al entrenarse sobre datos sinteticos, los sesgos del corpus generador son desconocidos.
- Idiomas soportados: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no declara idoneidad para produccion y exige superar una puerta de publicacion (95 % de coincidencia exacta y 100 % de recall de canarios, con pruebas criptograficas fail-closed superadas) antes de publicar un checkpoint.
- El repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Prismner/Phantester
- Modelo base: https://huggingface.co/openai-community/gpt2-xl
