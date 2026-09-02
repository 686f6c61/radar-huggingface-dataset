# furiosa-ai/Mistral-Nemo-Instruct-2407-FP8

## Resumen

Mistral-Nemo-Instruct-2407-FP8 es una variante cuantizada en FP8 del modelo Mistral NeMo Instruct 2407, publicada por FuriosaAI para ejecutarse de forma optimizada en su hardware RNGD. El modelo original, desarrollado conjuntamente por Mistral AI y NVIDIA, es un transformer denso de 12 000 millones de parámetros con ajuste fino instructivo, diseñado para generación de texto conversacional y asistencia. Esta versión FP8 reduce el tamaño de los pesos a 8 bits, lo que permite una inferencia más rápida y eficiente en memoria sin pérdida significativa de precisión, manteniendo la misma arquitectura y capacidades que el modelo base.

La relevancia de esta publicación radica en que ofrece un paquete listo para usar con Furiosa-LLM, el framework de inferencia de FuriosaAI, incluyendo un bundle ejecutable (FXB) que simplifica el despliegue en tarjetas RNGD. El modelo conserva la ventana de contexto de 128 000 tokens del Mistral NeMo original, aunque esta información no se detalla explícitamente en la ficha técnica de esta variante. Está pensado para entornos de producción que requieran baja latencia y alto rendimiento en hardware especializado, con soporte para tool calling y una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral NeMo) |
| Parametros totales | 12 247 782 400 (12,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base declara 128 000 tokens) |
| Tipos de cuantizacion | FP8 estatica para pesos, FP8 dinamica para activaciones, KV cache en 16 bits |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tambien incluye bundle FXB para Furiosa-LLM) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mistral NeMo, un transformer autoregresivo denso con 12 000 millones de parametros. La cuantizacion FP8 se aplica de forma estatica a los pesos de los bloques del transformer, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia, sin necesidad de calibracion offline. El KV cache se mantiene en precision de 16 bits para preservar la calidad de la generacion.

El entrenamiento del modelo base fue realizado por Mistral AI y NVIDIA, con un proceso de ajuste fino instructivo que incluye datos conversacionales y de instrucciones. Esta variante FP8 es una conversion posterior realizada por RedHatAI, que no requiere reentrenamiento. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en esta publicacion.

## Capacidades

- Generacion de texto conversacional de tipo asistente, con soporte para mensajes de sistema, usuario y asistente.
- Tool calling / function calling, segun la documentacion de Furiosa-LLM, que permite al modelo invocar funciones externas.
- No es un modelo de razonamiento explicito (non-reasoning), por lo que no requiere parser de razonamiento ni flags especiales de chat template.
- Soporte multilingue limitado: la model card declara solo ingles, aunque el modelo base original soporta varios idiomas.
- Integracion nativa con Furiosa-LLM para despliegue en hardware RNGD, con API compatible con OpenAI.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128 000 tokens (heredada del modelo base), manteniendo el historial completo de la interaccion.
- Asistentes virtuales empresariales: integrable en sistemas de ticketing o CRM para redactar respuestas, resumir hilos y escalar consultas complejas a humanos.
- Generacion de codigo en entornos de desarrollo: con soporte de tool calling, puede conectarse a APIs de repositorios o ejecutar comandos en pipelines de CI/CD para generar o revisar fragmentos de codigo.
- Resumen de documentos extensos: su contexto amplio permite procesar informes, articulos o contratos completos y producir resumenes estructurados.
- Clasificacion y extraccion de informacion: puede etiquetar texto, extraer entidades o rellenar plantillas a partir de instrucciones en lenguaje natural.
- Despliegue en produccion con baja latencia: gracias a la cuantizacion FP8 y la optimizacion para RNGD, es adecuado para servicios que requieren respuestas en tiempo real con alto volumen de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se recomienda consultar la ficha del modelo base Mistral-Nemo-Instruct-2407 para obtener datos comparativos, aunque no se garantiza que los resultados sean identicos tras la cuantizacion FP8.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con una configuracion de tensor-parallel de 16 PEs distribuidos en dos tarjetas RNGD (8 PEs por tarjeta).
- No se especifica VRAM en la informacion proporcionada. Como referencia, un modelo de 12 000 millones de parametros en FP8 ocupa aproximadamente 12 GB de memoria, pero el despliegue en RNGD gestiona la memoria internamente.
- No esta disenado para GPUs de consumo general; para ejecutarlo en GPUs estandar (por ejemplo, RTX 4090 o A100) se puede utilizar el modelo base RedHatAI/Mistral-Nemo-Instruct-2407-FP8 con frameworks como vLLM o Transformers, aunque sin las optimizaciones especificas de Furiosa.
- Opciones de despliegue: Furiosa-LLM (servidor OpenAI-compatible), vLLM, SGLang y Transformers (segun la model card del modelo base).
- Latencia y throughput: no se proporcionan datos numericos. La cuantizacion FP8 y el hardware RNGD estan orientados a reducir la latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Mistral-Nemo-Instruct-2407-FP8 | 12,2 B | No disponible (base: 128k) | FP8 | Apache 2.0 | FuriosaAI RNGD |
| RedHatAI/Mistral-Nemo-Instruct-2407-FP8 | 12,2 B | 128k | FP8 | Apache 2.0 | GPUs estandar (vLLM, etc.) |
| mistralai/Mistral-Nemo-Instruct-2407 | 12,2 B | 128k | BF16 | Apache 2.0 | GPUs estandar |

La diferencia principal entre esta variante y el modelo base es el empaquetado para Furiosa-LLM y la optimizacion especifica para RNGD. En terminos de rendimiento, se espera que sea equivalente al modelo FP8 de RedHatAI, aunque no hay benchmarks que lo confirmen. Otras alternativas de tamano similar, como Llama-3.1-8B o Qwen2.5-14B, no se incluyen por falta de datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- La model card declara soporte solo para ingles, aunque el modelo base original es multilingue. Esto puede limitar su uso en aplicaciones que requieran otros idiomas.
- La cuantizacion FP8 puede introducir una ligera perdida de precision en tareas muy sensibles a los detalles numericos, aunque la documentacion afirma que no hay perdida de exactitud.
- El despliegue esta pensado exclusivamente para hardware FuriosaAI RNGD; en GPUs convencionales se debe usar el modelo base, perdiendo las optimizaciones de Furiosa-LLM.
- No es un modelo de razonamiento explicito, por lo que no es adecuado para tareas que requieran cadenas de pensamiento complejas o verificacion logica profunda.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante especifica. Se recomienda realizar pruebas de robustez antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el hardware RNGD es un producto propietario de FuriosaAI, lo que condiciona el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Mistral-Nemo-Instruct-2407-FP8
- Modelo base (RedHatAI): https://huggingface.co/RedHatAI/Mistral-Nemo-Instruct-2407-FP8
- Modelo original (Mistral AI): https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guia de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
