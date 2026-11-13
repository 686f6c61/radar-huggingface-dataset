# saksornr/ThaiSafetyClassifier-webgpu-q4

## Resumen

ThaiSafetyClassifier WebGPU Q4 es una conversión independiente del clasificador binario typhoon-ai/ThaiSafetyClassifier, un adaptador fusionado con la base Microsoft DeBERTa-v3-base y entrenado para evaluar si la respuesta de un LLM resulta segura o danina en el contexto de su prompt. El modelo original lo desarrolla Typhoon AI y esta orientado especificamente al contexto linguistico y cultural tailandes. Esta variante la publica el usuario saksornr como exportacion ONNX cuantizada a INT4, pensada para ejecutarse en el navegador mediante WebGPU.

La relevancia de esta version radica en el despliegue: el clasificador se ejecuta integramente en el hardware WebGPU del visitante, sin enviar texto a un servidor, lo que encaja con casos de moderacion en los que la privacidad del contenido es critica. El repo pesa aproximadamente 0,1 GB e incluye 98 matrices `MatMulNBits` INT4 simetricas de bloque 32 y un operador de embedding `GatherBlockQuantized`, mientras activaciones, parametros de normalizacion y sesgos permanecen en FP32.

Es importante subrayar que no se trata de una publicacion oficial de Typhoon y que las comprobaciones realizadas por el autor validan la ejecucion en WebGPU, no la precision de seguridad del modelo cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) con adaptador de clasificacion fusionado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de tokenizacion; el texto excedente no se evalua) |
| Tipos de cuantizacion | INT4 simetrica block-32 (`MatMulNBits`), embedding `GatherBlockQuantized`, activaciones/normalizacion/sesgos en FP32 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0 (pesos); la base DeBERTa conserva licencia MIT |
| Formato de pesos | ONNX (grafos bajo `onnx/`), tokenizer cargado por Transformers.js |

## Arquitectura y entrenamiento

El modelo es un clasificador binario construido sobre DeBERTa-v3-base de Microsoft, con el adaptador de ThaiSafetyClassifier fusionado en la base. La entrada adopta el formato `input: <prompt> output: <response>`: se tokeniza el texto combinado con longitud maxima de 256 y se devuelve una etiqueta (`0` = seguro, `1` = danino) junto con las probabilidades de ambas clases. El modelo esta disenado para contextos linguisticos y culturales tailandeses.

La exportacion a ONNX pliega alias de proyeccion compartidos y registra en el manifiesto la revision exacta del origen (`1ebdbca46dcc433a141f96e8137d1f2a31de9a44`), hashes y logits de ejemplo nativos y Q4. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Clasificacion binaria de seguridad de respuestas de LLM en el contexto del prompt (seguro frente a danino).
- Evaluacion orientada a contexto tailandes, con soporte de texto en tailandes e ingles.
- Devuelve probabilidades de ambas clases, no solo la etiqueta.
- Inferencia en navegador sobre WebGPU, con tokenizacion, preprocesado y decodificacion en JavaScript.
- No requiere envio de datos a servidor: el texto permanece en el navegador.
- No se han documentado capacidades de generacion de texto, tool calling, agentes, vision ni audio; es exclusivamente un clasificador.

## Casos de uso

- Moderacion de respuestas de LLM en produccion: el clasificador evalua pares prompt-respuesta antes de mostrarlos al usuario, filtrando salidas daninas en aplicaciones de chat con contexto tailandes.
- Moderacion con privacidad reforzada: al ejecutarse en WebGPU del cliente, el contenido sensible no abandona el navegador, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Filtrado previo en playgrounds y demos de LLM: integrable en interfaces de prueba para marcar respuestas potencialmente inseguras y mostrar ambas probabilidades al evaluador.
- Investigacion sobre sesgos culturales: permite estudiar como un clasificador entrenado para contexto tailandes etiqueta respuestas en tailandes e ingles sin coste de infraestructura de servidor.
- Triaje en pipelines de anotacion: uso como primera pasada automatica para priorizar revision humana de respuestas marcadas como daninas.
- Despliegue en entornos con recursos limitados: el repo de 0,1 GB y la cuantizacion INT4 permiten distribuirlo a clientes sin GPU dedicada en servidor, apoyandose en WebGPU del equipo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El manifiesto incluye logits de ejemplo nativos y Q4 y registra un cambio de etiqueta observado en un caso limite entre las pequenas muestras de referencia, pero no constituye una evaluacion de precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repo completo ocupa 0,1 GB y los pesos estan cuantizados a INT4, lo que reduce sustancialmente el consumo frente al modelo en FP32.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que se requiere una version reciente de Chrome o Edge de escritorio con aceleracion por hardware y WebGPU.
- Cabe en GPU consumer: si, siempre que el navegador y el sistema expongan WebGPU con aceleracion activa; no se documentan modelos concretos.
- Opciones de despliegue: ONNX Runtime Web 1.30.0 para el clasificador y Transformers.js 4.3.2 para el tokenizer, dentro del navegador. La aplicacion no ofrece fallback a CPU ni a modelo de precision completa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni alternativas comparables de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion INT4 puede alterar etiquetas en casos limite; el propio manifiesto documenta un cambio de etiqueta observado entre ejemplos de referencia.
- Las puntuaciones son predicciones del modelo, no garantias calibradas de seguridad.
- El texto que excede los 256 tokens no se evalua; el playground muestra un aviso de truncamiento.
- Las pruebas de humo en WebGPU validan la ejecucion, no la precision de seguridad.
- Es una conversion independiente, no una publicacion oficial de Typhoon; la atribucion no implica respaldo.
- No hay fallback a CPU ni a modelo de precision completa: sin WebGPU operativo el modelo no se ejecuta.
- Riesgo de sesgo derivado del entrenamiento para contexto tailandes; el comportamiento en otros contextos culturales no esta documentado.
- Riesgo de falsos negativos y falsos positivos inherente a un clasificador binario; conviene revisar las salidas en su contexto original.
- Licencia Apache 2.0 para los pesos, pero la base DeBERTa conserva MIT; deben respetarse ambas condiciones de atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saksornr/ThaiSafetyClassifier-webgpu-q4
- Modelo base: https://huggingface.co/typhoon-ai/ThaiSafetyClassifier
- Playground Typhoon WebGPU: https://huggingface.co/spaces/saksornr/typhoon-asr-webgpu
- Manifiesto de la conversion: https://huggingface.co/saksornr/ThaiSafetyClassifier-webgpu-q4/blob/main/manifest.json
- Licencia Apache 2.0: https://huggingface.co/saksornr/ThaiSafetyClassifier-webgpu-q4/blob/main/LICENSE
- Licencia MIT de DeBERTa: https://huggingface.co/saksornr/ThaiSafetyClassifier-webgpu-q4/blob/main/LICENSE-DEBERTA
- Aviso de atribucion: https://huggingface.co/saksornr/ThaiSafetyClassifier-webgpu-q4/blob/main/NOTICE
