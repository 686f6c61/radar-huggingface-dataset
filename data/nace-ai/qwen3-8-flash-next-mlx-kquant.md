# nace-ai/Qwen3.8-Flash-Next-MLX-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-KQuant es una cuantizacion de 4 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada en formato MLX por el desarrollador independiente nace-ai para su ejecucion en Apple Silicon. El modelo base resuelve tareas de imagen-texto-a-texto (image-text-to-text) con capacidad conversacional y de razonamiento, y esta cuantizacion busca hacer viable su inferencia en Macs de gama alta con memoria unificada de 192 GB o superior.

El pack emplea una tecnica propietaria de cuantizacion denominada KQuant, que combina grupos de 64 elementos en 4 bits con 696 modulos elevados a 8 bits, logrando una divergencia KL de 0.067 respecto al modelo original en BF16. Segun el autor, esto supone una mejora sustancial frente al empaquetado de 4 bits de mlx-community (KL 0.249) y reduce el peso del modelo de lenguaje en 5.4 GB (105.20 GB frente a 110.62 GB).

El modelo cuenta con aproximadamente 180.000 millones de parametros totales (179.999.981.459 segun los safetensors) y un repositorio de 179.1 GB. Es relevante ahora porque permite ejecutar localmente en hardware Apple un modelo de gran tamano con capacidades multimodales y de razonamiento, aunque con requisitos de memoria muy elevados y un ecosistema de herramientas todavia en maduracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; tag qwen4_exp) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (grupos de 64) con 696 modulos en 8 bits (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El tag `qwen4_exp` sugiere una variante experimental de la familia Qwen4, y el pipeline `image-text-to-text` confirma que se trata de un modelo multimodal que acepta imagenes y texto como entrada. El modelo base es Qwen/Qwen3.8-Flash-Next, desarrollado por Alibaba Qwen.

Esta publicacion es exclusivamente una cuantizacion: no se ha reentrenado el modelo, sino que se han aplicado tecnicas de compresion de pesos. La innovacion tecnica destacable es el esquema KQuant, que combina cuantizacion de 4 bits en grupos de 64 con la promocion selectiva de 696 modulos a 8 bits, reduciendo la perdida de calidad respecto al BF16 original. El autor reporta una divergencia KL de 0.067 frente al modelo en BF16, medida sobre el modelo de lenguaje. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes junto con texto (image-text-to-text).
- Razonamiento con modo "thinking" activado por defecto, con profundidades configurables (`low`, `medium`, `xhigh`).
- Desactivacion del razonamiento mediante `reasoning_effort: none` o `enable_thinking: false`.
- Soporte de tool calling / function calling con definiciones compatibles con OpenAI.
- Integracion con APIs OpenAI, Anthropic y Ollama a traves del motor Kapitsa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Generacion de hasta 32.768 tokens de salida en la mayoria de tareas con thinking activado (recomendacion del autor).

## Casos de uso

- Asistencia conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con razonamiento profundo, adecuado para usuarios que requieren privacidad y no quieren enviar datos a la nube, gracias a su ejecucion local via Kapitsa o mlx-vlm.
- Analisis de imagenes con descripcion textual: al ser un modelo image-text-to-text, permite extraer informacion de capturas, documentos escaneados o fotografias y generar resumenes o respuestas contextualizadas.
- Agentes con tool calling: la integracion con definiciones de herramientas estilo OpenAI permite construir agentes que consulten APIs externas (por ejemplo, meteorologia, bases de datos) y encadenen llamadas dentro de un flujo multi-paso.
- Razonamiento matematico y resolucion de problemas: el modo thinking con profundidades configurables permite ajustar el esfuerzo computacional segun la complejidad de la tarea (por ejemplo, calculos como 17 * 23 con verificacion intermedia).
- Prototipado de aplicaciones multimodales en Apple Silicon: desarrolladores que quieran validar pipelines de vision-lenguaje sin depender de GPUs NVIDIA pueden usar mlx-vlm con este pack.
- Despliegue de API compatible con OpenAI en local: mediante `kapitsa serve` se puede exponer un endpoint `/v1/chat/completions` para integrar el modelo en herramientas existentes que ya hablan el protocolo OpenAI.
- Investigacion sobre cuantizacion: el pack sirve como referencia para estudiar el impacto de KQuant frente a otras tecnicas (mlx-community 4-bit, TensorFold 4-bit, TensorFold oQ4-MTP) en terminos de divergencia KL.

## Benchmarks y rendimiento

| Metrica | Nace Q4 (este repo) | mlx-community 4-bit | BF16 original |
|---|---|---|---|
| Divergencia KL respecto a BF16 (modelo de lenguaje) | 0.067 | 0.249 | 0 (referencia) |
| Peso del modelo de lenguaje | 105.20 GB | 110.62 GB | no disponible |
| Tamano de descarga | 107.6 GB | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de calidad reportada es la divergencia KL frente al modelo en BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que el pack encaja en Macs con 192 GB de memoria unificada o superior (regla aproximada: el menor tamano de RAM cuyo reparto por defecto de GPU en macOS aloje la descarga mas 2 GB para una conversacion).
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o mas (por ejemplo, Mac Studio o Mac Pro de gama alta). El autor probo la carga en una NVIDIA H200 con CUDA mediante mlx-vlm 0.7.8 y MLX 0.32.4, pero no en un Mac.
- Cabe en consumer GPU: no, por el tamano del pack (107.6 GB de descarga, 179.1 GB de repositorio). No es viable en GPUs de consumo convencionales.
- Opciones de despliegue: mlx-vlm 0.7.8 (con MLX 0.32.4), motor Kapitsa 0.2.36 (con soporte para la revision anterior `8fda1047`; el soporte de `Q4/` llegara en una version posterior). mlx-lm 0.32.2 no puede cargar esta arquitectura todavia.
- Latencia y throughput: no disponibles. El autor no reporta mediciones en Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Divergencia KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nace Q4 (este repo) | ~180B | no disponible | 0.067 | qwen-community-1.0 | Hugging Face (MLX) |
| mlx-community 4-bit | no disponible | no disponible | 0.249 | no disponible | Hugging Face (MLX) |
| TensorFold 4-bit | no disponible | no disponible | no disponible | no disponible | Hugging Face (MLX) |
| TensorFold oQ4-MTP | no disponible | no disponible | no disponible | no disponible | Hugging Face (MLX) |

Los tres comparadores son empaquetados MLX del mismo modelo base Qwen3.8-Flash-Next. No se dispone de datos de parametros, contexto ni licencia para ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Requisito de memoria muy elevado: necesita 192 GB o mas de memoria unificada en Apple Silicon, lo que limita su uso a equipos de gama muy alta.
- Ecosistema inmaduro: mlx-lm 0.32.2 no puede cargar la arquitectura; otras aplicaciones MLX no han sido probadas. El soporte de Kapitsa para `Q4/` aun no esta disponible en la version 0.2.36.
- No verificado en Mac: la prueba de release se ejecuto en una NVIDIA H200 con CUDA, no en hardware Apple, por lo que el rendimiento real en Mac no esta confirmado.
- Riesgo de alucinacion: no se reportan evaluaciones especificas; al ser una cuantizacion, puede introducir degradaciones adicionales respecto al BF16, aunque la divergencia KL reportada es baja.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia qwen-community-1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Penalizaciones altas de presencia pueden provocar mezcla de idiomas segun el autor.
- El modelo piensa antes de responder por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva el modo thinking.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Practicas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Revision anterior soportada por Kapitsa: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
