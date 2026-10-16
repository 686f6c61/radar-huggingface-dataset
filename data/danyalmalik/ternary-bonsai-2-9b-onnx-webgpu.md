# danyalmalik/Ternary-Bonsai-2-9B-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-9B-ONNX-WebGPU es una conversión a ONNX del modelo Ternary-Bonsai-2-9B de PrismML, empaquetada por el usuario danyalmalik para su ejecución en navegador mediante el backend WebGPU de ONNX Runtime Web, tal como lo utiliza Quick Inference. El modelo original es una versión ternaria (pesos en {-1, 0, +1}) derivada de Qwen/Qwen3.5-9B, con unos 9.000 millones de parámetros nominales, y esta variante conserva únicamente la torre de texto: la parte de visión no está incluida.

El interés de esta ficha radica en que demuestra un flujo de despliegue completamente cliente: un modelo de 9B en pesos ternarios de 2 bits puede ejecutarse en un navegador sin servidor, gracias a que el grafo ONNX implementa la misma transformada de base rotada (Walsh-Hadamard por bloques con vectores de signo) que el runtime de PrismML, manteniendo los pesos exactos. La verificación reportada por el autor indica una similitud coseno de 0.99999 en los logits de la última posición frente al runtime MLX de PrismML, con los mismos tokens de mayor probabilidad.

Se distribuye bajo licencia Apache 2.0, el repositorio ocupa 2,7 GB y no se han publicado benchmarks, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 con atencion lineal (proyecciones alpha y beta) y pesos ternarios; grafo ONNX |
| Parametros totales | aproximadamente 9B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 2 bits (MatMulNBits), embeddings en 4 bits (GatherBlockQuantized); pesos originales en formato PQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (embedding.onnx, text.onnx) con datos externos (.onnx.data) |

## Arquitectura y entrenamiento

El grafo empleado es el de Qwen3.5 en ONNX procedente de amd/Qwen3.5-9B_gpuep_1.0_gpu_128, al que se han sustituido todos los pesos por los de Bonsai extraídos de Ternary-Bonsai-2-9B-PQ2_0.gguf. Las matrices ternarias se almacenan como MatMulNBits de 2 bits, con valores exactos {-1, 0, +1} multiplicados por una escala float16 cada 128 pesos. Bonsai guarda sus matrices en una base rotada mediante una transformada de Walsh-Hadamard por bloques con vectores de signo; el grafo aplica la transformada correspondiente a la entrada de cada capa, replicando el comportamiento del runtime de PrismML.

Los embeddings de tokens son un GatherBlockQuantized de 4 bits de los mismos valores ternarios, seguidos de la transformada inversa. Las proyecciones alpha y beta de la atención lineal, que en el GGUF original están en float32, aquí se almacenan en float16. El autor reporta que, sobre un prompt de prueba, los logits de la última posición coinciden con el runtime MLX de PrismML con una similitud coseno de 0.99999 y los mismos tokens principales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto en tareas de lenguaje general, heredadas del modelo base Qwen3.5-9B.
- Ejecucion de inferencia en navegador mediante ONNX Runtime Web con backend WebGPU.
- Procesamiento exclusivamente de texto: la torre de vision no esta incluida en esta conversion.
- Compatibilidad con el pipeline de Quick Inference para despliegue cliente.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Otras capacidades especiales (audio, vision, decodificacion especulativa): no disponible.

## Casos de uso

- Demo interactiva en navegador: el modelo puede cargarse directamente en una pagina web mediante ONNX Runtime Web y WebGPU, sin necesidad de backend ni servidor de inferencia, lo que permite publicar ejemplos funcionales de un modelo de 9B sin coste de GPU en la nube.
- Prototipado de aplicaciones LLM en el cliente: desarrolladores que quieran validar prompts, plantillas y flujos de conversacion antes de desplegar en servidor pueden usar este ONNX como banco de pruebas con pesos equivalentes a la version ternaria.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo del usuario, el texto no abandona el navegador, lo que resulta adecuado para entornos con requisitos de confidencialidad como asistencia interna o analisis de documentos sensibles.
- Educacion y divulgacion sobre cuantizacion ternaria: sirve para ilustrar en un articulo o curso como se almacenan pesos en 2 bits, como funciona MatMulNBits y como se aplica una transformada de Walsh-Hadamard en un grafo ONNX real.
- Investigacion en eficiencia de inferencia: permite medir latencia y consumo en distintas GPU de consumo directamente desde el navegador, comparando con la version GGUF o con el modelo de precision completa.
- Integracion en extensiones de navegador o aplicaciones Electron: al ser ONNX, puede embeberse en herramientas de escritorio multiplataforma que usen un runtime compatible con WebGPU.
- Validacion de conversiones ONNX: util como referencia para verificar que una conversion a ONNX reproduce fielmente el comportamiento del modelo original en otro runtime (aqui, MLX).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la similitud coseno de 0.99999 en los logits de la ultima posicion de un prompt de prueba frente al runtime MLX de PrismML, con coincidencia en los tokens de mayor probabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,7 GB, por lo que los pesos ocupan en torno a 2,5-3 GB; el consumo adicional depende del contexto y de las activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU (por ejemplo, serie NVIDIA RTX 30/40, AMD RDNA 2/3 o Apple Silicon). Para servidor, A100 o H100 no son necesarias dado el tamano reducido de los pesos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con WebGPU, incluidos portatiles con graficos integrados recientes.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (objetivo principal); tambien cualquier runtime que consuma ONNX. Para la version base existen variantes GGUF compatibles con llama.cpp y Ollama.
- Latencia y throughput estimados: no disponible. Depende en gran medida del navegador, del backend WebGPU y de la GPU del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danyalmalik/Ternary-Bonsai-2-9B-ONNX-WebGPU | ~9B | no disponible | ONNX | Apache 2.0 | HuggingFace |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ~9B | no disponible | GGUF (PQ2_0) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | ~9B | no disponible | safetensors (precision original) | no disponible | HuggingFace |

La comparativa con modelos ternarios alternativos de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es solo de texto: no incluye la torre de vision del modelo base, por lo que no admite entradas de imagen.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas especificas no puede validarse con datos objetivos.
- La cuantizacion ternaria de 2 bits implica una perdida de fidelidad respecto al modelo en precision completa; el autor solo verifica coincidencia con el runtime MLX, no con el modelo original sin cuantizar.
- No se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingues o con ventanas largas.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; se heredan los del modelo base Qwen3.5-9B, que tampoco se detallan aqui.
- El rendimiento en navegador depende del soporte WebGPU del cliente; en equipos sin WebGPU o con implementaciones incompletas la inferencia puede no funcionar o degradarse notablemente.
- Aunque la licencia es Apache 2.0, deben revisarse los ficheros LICENSE y NOTICE.txt del repositorio para conocer las atribuciones exigidas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danyalmalik/Ternary-Bonsai-2-9B-ONNX-WebGPU
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Grafo ONNX de referencia: https://huggingface.co/amd/Qwen3.5-9B_gpuep_1.0_gpu_128
- No se han encontrado otros enlaces relevantes en la busqueda web (los resultados devueltos no guardan relacion con el modelo).
