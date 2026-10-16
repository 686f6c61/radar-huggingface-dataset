# danyalmalik/Ternary-Bonsai-2-2B-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-2B-ONNX-WebGPU es una conversión a ONNX del modelo prism-ml/Ternary-Bonsai-2-2B-gguf, publicado por el usuario danyalmalik. El modelo original, Ternary Bonsai 2 de Prism ML, es a su vez una derivación cuantizada del modelo Qwen/Qwen3.5-2B de Alibaba. El objetivo de esta conversión es permitir la ejecución del modelo directamente en un navegador web mediante el backend WebGPU de ONNX Runtime Web, tal y como lo emplea el proyecto Quick Inference.

La característica principal es la cuantización ternaria: las matrices de pesos toman valores −1, 0 o +1 multiplicados por una escala float16 por cada 128 pesos. Estos pesos se almacenan como MatMulNBits de 2 bits, de modo que los valores son exactos respecto al modelo original. Además, los pesos se guardan en una base rotada mediante una transformada de Walsh-Hadamard por bloques con vectores de signo, y el grafo aplica la transformada correspondiente a la entrada de cada capa.

Se trata de un modelo de solo texto: la torre de visión no está incluida. Por su tamaño (del orden de 2.000 millones de parámetros) y su empaquetado de 2 bits, está pensado para inferencia ligera en cliente, especialmente en entornos donde no se dispone de GPU dedicada y se quiere aprovechar la GPU integrada a través de WebGPU. El repositorio tiene un tamaño de 0,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con proyecciones de atencion lineal (segun la model card); grafo ONNX de onnx-community/Qwen3.5-2B-ONNX |
| Parametros totales | Aproximadamente 2.000 millones (denominacion del modelo; sin desglose publicado) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (valores −1, 0, +1 con escala float16 cada 128 pesos) almacenada como MatMulNBits de 2 bits; embeddings con GatherBlockQuantized de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`decoder_model_merged_q2f16.onnx`, `embed_tokens_q2f16.onnx`) con ficheros `.onnx_data` asociados; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del grafo ONNX de Qwen3.5-2B publicado por onnx-community, en el que se ha reemplazado cada peso por los pesos ternarios de Bonsai procedentes de `Ternary-Bonsai-2-2B-PQ2_0.gguf`. La model card menciona explícitamente proyecciones alpha y beta de la atención lineal, que en el GGUF original están en float32 y en esta conversión pasan a float16. Las matrices ternarias se almacenan como MatMulNBits de 2 bits con los mismos valores que el original, por lo que la cuantización no introduce pérdida adicional en los pesos.

Una innovación destacable es el uso de una base rotada: Bonsai almacena sus matrices en una base transformada mediante una Walsh-Hadamard transform por bloques con vectores de signo, y el grafo ONNX aplica la transformada equivalente a la entrada de cada capa, replicando el comportamiento del runtime de PrismML. Los embeddings de tokens se representan con un GatherBlockQuantized de 4 bits sobre los mismos valores ternarios, seguido de la transformada inversa.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo etapas de RLHF o DPO. La model card sí documenta una verificación de fidelidad: comparado con el runtime MLX de PrismML, en un prompt de prueba los logits de la última posición coinciden con una similitud coseno de 0,99999 y los mismos tokens top.

## Capacidades

- Generación de texto: es un modelo de solo texto; la torre de visión del modelo base no está incluida en esta conversión.
- Inferencia en navegador: diseñado para ejecutarse con el backend WebGPU de ONNX Runtime Web, sin necesidad de servidor.
- Cuantización ternaria exacta: los pesos ternarios se preservan sin pérdida respecto al GGUF de origen.
- Fidelidad numérica verificada: similitud coseno de 0,99999 frente al runtime MLX de PrismML en el prompt de prueba documentado.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes, multilingüismo o modo de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en el navegador sin servidor: el modelo se carga con ONNX Runtime Web y el backend WebGPU, de modo que la generación de texto ocurre en el dispositivo del usuario y no requiere enviar datos a un backend remoto.
- Demos y prototipos web interactivos: al ocupar 0,8 GB en el repositorio, es viable empaquetarlo en una aplicación web para demostraciones de generación de texto sin infraestructura de GPU en servidor.
- Procesamiento de texto sensible en local: al ejecutarse íntegramente en el cliente, resulta adecuado para escenarios donde los datos no deben salir del dispositivo, siempre que se acepte la ausencia de garantías formales de privacidad.
- Asistentes de texto embebidos en aplicaciones de escritorio o web: su tamaño reducido y su formato de 2 bits permiten integrarlo como componente de autocompletado o redacción asistida dentro de una interfaz.
- Experimentación con cuantización ternaria: sirve como referencia práctica para investigadores que quieran estudiar el impacto de la cuantización ternaria con rotación Walsh-Hadamard frente a otros esquemas.
- Evaluación de WebGPU como plataforma de inferencia: útil para medir viabilidad, latencia y consumo en navegadores compatibles antes de decidir si se adopta esta vía en producción.
- Educación y divulgación: permite mostrar el funcionamiento de un transformer cuantizado ejecutándose en el navegador con fines didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento documentado es una verificación de fidelidad frente al runtime MLX de PrismML: los logits de la última posición de un prompt de prueba alcanzan una similitud coseno de 0,99999 y coinciden en los mismos tokens top. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 0,8 GB, de modo que el conjunto de pesos y el grafo ONNX requieren del orden de esa cantidad de espacio, más el consumo adicional de memoria del runtime y de la caché KV.
- Al estar cuantizado a 2 bits con embeddings de 4 bits, el modelo es apto para GPUs de consumo; la ejecución objetivo es a través de WebGPU en el navegador.
- GPU específicas recomendadas: no disponible. La model card no indica modelos de GPU concretos ni requisitos mínimos de VRAM.
- Despliegue: ONNX Runtime Web con backend WebGPU, en el contexto del proyecto Quick Inference. No se documentan otras rutas de despliegue (vLLM, llama.cpp, Ollama o TGI) para este repositorio concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danyalmalik/Ternary-Bonsai-2-2B-ONNX-WebGPU | Aprox. 2.000 millones (no confirmado) | no disponible | Ternaria 2 bits, ONNX | Apache 2.0 | HuggingFace, 0 descargas y 0 likes |
| prism-ml/Ternary-Bonsai-2-2B-gguf | Aprox. 2.000 millones (no confirmado) | no disponible | Ternaria, GGUF (`PQ2_0`) | Apache 2.0 (segun el modelo derivado) | HuggingFace |
| Qwen/Qwen3.5-2B | Aprox. 2.000 millones (no confirmado) | no disponible | Pesos originales en precision completa | no disponible | HuggingFace |
| onnx-community/Qwen3.5-2B-ONNX | Aprox. 2.000 millones (no confirmado) | no disponible | ONNX sin cuantizacion ternaria | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no hay evidencia pública sobre la calidad del modelo en tareas de razonamiento, código o matemáticas.
- El repositorio registra 0 descargas y 0 likes, es decir, no cuenta con validación de la comunidad.
- Es un modelo de solo texto: la torre de visión del modelo base ha sido eliminada, por lo que no admite entradas de imagen.
- La cuantización ternaria, aunque exacta respecto al GGUF de origen, implica una pérdida de precisión frente a los pesos originales de Qwen3.5-2B; no se documenta la magnitud de esa pérdida.
- Idiomas soportados: no disponible. No hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con contexto largo.
- El rendimiento depende del soporte de WebGPU del navegador y del dispositivo; no se documentan versiones mínimas ni compatibilidad.
- No se documentan sesgos conocidos, comportamiento frente a alucinaciones ni limitaciones idiomáticas específicas.
- La licencia es Apache 2.0, que permite uso comercial, pero el repositorio incluye avisos en `NOTICE.txt` que conviene revisar antes de redistribuir.
- El repositorio solo incluye ficheros ONNX y tokenizer; no se documentan plantillas de chat ni parámetros de generación recomendados.
- Las fechas de creación y actualización registradas (2026) son posteriores a la fecha habitual de publicación, dato que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/Ternary-Bonsai-2-2B-ONNX-WebGPU
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo Qwen3.5-2B original: https://huggingface.co/Qwen/Qwen3.5-2B
- Grafo ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-2B-ONNX
