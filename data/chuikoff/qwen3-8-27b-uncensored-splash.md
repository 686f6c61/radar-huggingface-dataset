# chuikoff/Qwen3.8-27B-Uncensored-Splash

## Resumen

Qwen3.8-27B-Uncensored-Splash es un paquete de pesos en formato Splash (afín empaquetado Q4 con grupo de 64) derivado del GGUF Q4_K_M publicado por JonathanColetti bajo el nombre Qwen3.8-27B-Uncensored-GGUF. Lo desarrolla el usuario chuikoff como conversión de formato, no como un fine-tune nuevo: el modelo subyacente es un Qwen3.8 de 27.000 millones de parámetros en versión "uncensored" (pesos abliterados), y esta publicación únicamente lo reempaqueta para el runtime Splash orientado a Apple Silicon.

La relevancia es acotada y muy específica: permite cargar un modelo de 27B en equipos con memoria unificada de 48 GB mediante el runtime Bionic/Splash de Inco AI, con decodificación especulativa mediante un draft separado (DFlash2) y un componente de visión procedente de mlx-community. El paquete ocupa aproximadamente 17,37 GB y se distribuye con manifiesto de hashes SHA256 para los 78 artefactos que lo componen.

No se trata de un modelo con benchmarks propios ni con evaluación comparativa publicada. El autor lo declara explícitamente como conversión con pérdida (doble cuantización: BF16 original → Q4_K_M GGUF → Q4 afín/group-64), por lo que la calidad no es equivalente a una cuantización directa desde BF16. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (según referencias del runtime Splash 1.3.0 en la model card); detalles completos del modelo base no disponibles |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens configurados en el runtime; procesamiento completo de 128K no verificado |
| Tipos de cuantizacion | Q4 afín con grupo de 64 (formato Splash empaquetado); origen Q4_K_M GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Splash (paquete empaquetado con manifest.json, target/, draft/, vision/, tokenizer/); no carga como GGUF ni como checkpoint estándar de Transformers |

## Arquitectura y entrenamiento

La model card menciona capas Gated DeltaNet y un layout de filas específico, así como un orden de columnas particular en la proyección de salida, corregidos para el cargador nativo de GGUF de Splash 1.3.0. Esto sugiere una arquitectura híbrida con componentes de atención lineal tipo DeltaNet, aunque no se detallan el número de capas, dimensiones ocultas ni la composición exacta del bloque transformer. El modelo base Qwen3.8-27B-Uncensored procede de un proceso de abliteración sobre pesos Qwen, pero no se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo RLHF o DPO.

La innovación técnica de este paquete no está en el entrenamiento sino en el formato y el pipeline de inferencia: conversión GGUF → dequantización → requantización afín Q4/group-64, verificación de hashes SHA256 de los 78 artefactos, y uso de decodificación especulativa con un draft independiente (incoai/Qwen3.8-27B-DFlash2, revisión dedf8df6). El draft no fue reentrenado para este target modificado y es distinto del cabezal MTP del GGUF original. El componente de visión proviene de mlx-community/Qwen3.8-27B-4bit (revisión 3e6447f0) y se integra como artefacto separado dentro del paquete.

## Capacidades

- Generación de texto conversacional y de formato libre mediante pipeline text-generation.
- Razonamiento aritmético básico verificado en las pruebas del autor: 17 × 23 = 391 y √169 = 13.
- Recuperación de información en contextos largos: el autor reporta una prueba con 72.066 tokens de prompt y recuperación correcta de marcadores de inicio y fin en 220 segundos.
- Function calling: se verificó la emisión de una llamada a función a través de la API local compatible con OpenAI de Bionic.
- Streaming SSE mediante API compatible con OpenAI Chat Completions.
- Capacidad multimodal (visión) incluida como componente separado, aunque su corrección no ha sido validada según el propio autor.
- Modo "uncensored": pesos abliterados que reducen los rechazos, sin tasas de rechazo medidas ni publicadas.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el paquete está pensado para cargarse en LM Studio con el runtime Splash en equipos con memoria unificada de 48 GB (probado en M5 Pro), lo que permite ejecutar un modelo de 27B en hardware de consumo de gama alta sin GPU dedicada.
- Asistente conversacional de contexto largo: con 131.072 tokens configurados y una prueba real de 72K tokens, es adecuado para resumir o consultar documentos extensos, contratos o bases de código en una sola sesión.
- Automatización con function calling: la emisión de llamadas a función verificada permite integrarlo en flujos de agentes locales que invoquen herramientas externas mediante la API compatible con OpenAI en el puerto 1235.
- Prototipado de aplicaciones con API local: al exponer un endpoint compatible con OpenAI (base_url http://127.0.0.1:1235/v1), se puede conectar a clientes existentes sin adaptar el código, útil para desarrollo y pruebas offline.
- Experimentación con decodificación especulativa: el uso del draft DFlash2 permite estudiar el impacto de la especulación en latencia dentro del runtime Splash, aunque no se publican cifras de throughput.
- Investigación sobre alineación y abliteración: al ser una variante uncensored, sirve para estudiar comportamiento de rechazo, sesgos y estabilidad, siempre que se documenten las limitaciones y no se use como base de producción sin evaluación propia.
- Evaluación de pipelines de cuantización: la doble cuantización documentada lo convierte en un caso de estudio para medir la degradación introducida por requantizar desde GGUF Q4_K_M a Q4 afín/group-64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las cifras de evaluación upstream no describen este paquete requantizado y que no se ha realizado comparación de calidad controlada con la conversión alternativa de jianchen0311. Las únicas comprobaciones registradas son funcionales: aritmética simple, recuperación en 72.066 tokens (220 s), generación con ventana de 65.536 tokens y posterior reconfiguración a 131.072, y emisión de function call vía API local.

## Requisitos de hardware

- VRAM/memoria: el paquete ocupa aproximadamente 17,37 GB en disco; el consumo real en inferencia crece con el contexto y el autor advierte que la capacidad de 128K no garantiza que una petición completa quepa en un límite de memoria concreto.
- Entorno probado: Apple M5 Pro con 48 GB de memoria unificada, macOS 26.7.1, Bionic 1.1.10 build 8 y Splash runtime 1.3.0.
- GPU dedicadas: no disponible; no se documenta soporte para CUDA, ROCm ni GPUs NVIDIA/AMD en esta conversión.
- GPU de consumo: no disponible para el formato Splash; el paquete no carga como GGUF ni como checkpoint estándar de Transformers, por lo que no es utilizable directamente en llama.cpp, Ollama, vLLM o TGI.
- Despliegue: LM Studio con runtime Splash, servidor local Bionic (`lms server start --port 1235 --bind 127.0.0.1`) y carga con `--context-length 131072 --parallel 1 --ttl 600`.
- Latencia y throughput: no disponibles; solo se reporta una prueba de 72.066 tokens de prompt resuelta en 220 segundos, sin desglose de prefill y decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chuikoff/Qwen3.8-27B-Uncensored-Splash | 27B | 131.072 configurados | Splash Q4 afín/group-64 | Apache 2.0 | Conversión con pérdida desde GGUF Q4_K_M; probado en M5 Pro 48 GB |
| jianchen0311/Qwen3.8-27B-Uncensored-Splash | 27B | no disponible | Splash | no disponible | Paquete Splash basado en pesos MLX de OrcaRouter; sin comparación de calidad controlada |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27B | no disponible | GGUF Q4_K_M | no disponible | Fuente directa de esta conversión; utilizable en llama.cpp y Ollama |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Draft para decodificación especulativa | no disponible | Draft reutilizado, no reentrenado para este target |

## Limitaciones y advertencias

- Conversión con pérdida: la doble cuantización (BF16 → Q4_K_M GGUF → Q4 afín/group-64) introduce degradación adicional respecto a una conversión directa desde BF16; no hay evaluación de magnitud.
- Sin benchmarks de calidad: no se han publicado métricas de MMLU, HumanEval, GSM8K ni comparativas controladas frente a la conversión de jianchen0311 o al GGUF original.
- Contexto no validado al completo: la prueba más larga registrada es de 72.066 tokens; el procesamiento completo de 128K no está establecido.
- Visión sin verificar: el componente de visión se incluye pero su corrección no ha sido validada por el autor.
- Sin tasas de rechazo medidas: el carácter "uncensored" no está cuantificado; el repositorio de GitHub asociado advierte que el sistema de supresión de rechazos puede no ser completo según el método de carga.
- Formato no portable: no carga como GGUF ni como checkpoint de Transformers; queda restringido al runtime Splash/Bionic en Apple Silicon.
- Idiomas no documentados: no se especifica cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación y sesgos: no evaluado; al tratarse de pesos abliterados, la supresión de rechazos puede aumentar la probabilidad de contenido dañino o factualmente incorrecto sin salvaguardas.
- Licencia: Apache 2.0 declarada, pero el paquete agrega artefactos de terceros (draft DFlash2 de Inco AI, visión de mlx-community, herramientas de publicExcess) cuyos términos deben revisarse por separado; el autor aclara que la publicación no implica respaldo de esos autores.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado el 5 de noviembre de 2026; sin validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chuikoff/Qwen3.8-27B-Uncensored-Splash
- Modelo base GGUF: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Draft de decodificación especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Componente de visión: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Conversión Splash alternativa: https://huggingface.co/jianchen0311/Qwen3.8-27B-Uncensored-Splash
- Herramienta de conversión: https://github.com/publicExcess/splash-converter
- Repositorio comunitario Qwen 3.8 Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
