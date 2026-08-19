# quimmedes/Qwen3.8-27B-XYZ

## Resumen

Qwen3.8-27B-XYZ es una colección de cuantizaciones GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario quimmedes. El modelo base, desarrollado por Alibaba, emplea una arquitectura híbrida que combina SSM (state space model) con atención, con atención completa cada cuarta capa, y está diseñado para tareas de lenguaje y visión. Esta versión cuantizada aplica una receta mixta por tensor denominada "XYZ", que asigna distintos tipos de cuantización según la importancia de cada tensor mediante un algoritmo de mochila, ajustándose a objetivos de bits por peso (bpw) específicos.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 27 300 millones de parámetros en hardware de consumo, con tamaños de archivo que van desde 10,85 GB (Q3) hasta 22,55 GB (Q6), e incluye un proyector de visión en F32 para uso multimodal. Además, incorpora un bloque MTP (multi-token prediction) integrado que habilita decodificación especulativa, mejorando la latencia en inferencia. La licencia Apache-2.0 facilita su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrido SSM + atención, atención completa cada 4ª capa) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K, Q3.5, Q4_K, Q4.5, Q5_K, Q5.5, Q6_K (receta mixta por tensor "XYZ") |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención con capas basadas en SSM, con atención completa cada cuatro capas. Esta combinación busca equilibrar la eficiencia computacional de los SSM con la capacidad de modelado de dependencias de largo alcance de la atención. El vocabulario es de 248 320 tokens, con `tie_word_embeddings=false`, lo que implica que la capa de embeddings y la cabeza de salida son independientes y se cuantizan en Q8_0 en todos los archivos.

La versión publicada no es un modelo entrenado desde cero, sino una conversión y cuantización del checkpoint original de Qwen/Qwen3.8-27B realizada con llama.cpp. La receta "XYZ" selecciona por tensor el tipo de cuantización óptimo (Q3_K, Q4_K, Q5_K, etc.) mediante un algoritmo de mochila que maximiza la calidad para un objetivo de bpw dado. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, ni sobre el uso de RLHF o DPO. El bloque MTP (capa 65) se incluye en todos los archivos y permite decodificación especulativa con `--spec-type mtp`.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se detallan benchmarks específicos en la información disponible.
- Multimodal (visión): incluye un proyector de visión en F32 (`mmproj-Qwen3.8-27B-f32.gguf`) que permite procesar imágenes junto con texto, usando el comando `llama-qwen2vl-cli`.
- Decodificación especulativa: el bloque MTP integrado permite acelerar la generación mediante predicción de múltiples tokens, activable con `--spec-type mtp`.
- Cuantización flexible: siete niveles de cuantización (Q3 a Q6) que se adaptan a distintos requisitos de memoria y calidad.
- Compatibilidad con llama.cpp: funciona con las herramientas estándar del ecosistema (llama-cli, llama-qwen2vl-cli) y es compatible con servidores como llama-server.

## Casos de uso

- Asistente multimodal en local: un desarrollador puede ejecutar `llama-qwen2vl-cli` con el proyector de visión para crear un asistente que analice capturas de pantalla o fotografías, respondiendo preguntas sobre su contenido sin depender de APIs externas.
- Despliegue en hardware de gama media: con la cuantización Q3 (10,85 GB) o Q4 (15,19 GB), el modelo cabe en GPUs de consumo como la RTX 3060 12 GB o RTX 4070, permitiendo prototipos de chatbots o herramientas de análisis de documentos en entornos con recursos limitados.
- Generación de código con contexto largo: aunque la longitud de contexto no está especificada, el modelo base Qwen3.8-27B está diseñado para tareas de programación; la versión cuantizada puede integrarse en editores o pipelines de CI/CD para autocompletado y revisión de código.
- Investigación en eficiencia de cuantización: la receta "XYZ" y los archivos con y sin MTP permiten a investigadores comparar el impacto de distintas estrategias de cuantización por tensor en la calidad del modelo, usando los bpw publicados como referencia.
- Aplicaciones de visión por computador en edge: el proyector F32 y las cuantizaciones pequeñas posibilitan sistemas de clasificación o descripción de imágenes en dispositivos con GPU integrada o NPU, como portátiles o mini-PCs.
- Servicio de inferencia con decodificación especulativa: en un servidor llama.cpp, activar `--spec-type mtp` reduce la latencia por token, lo que es útil para aplicaciones interactivas como chatbots o asistentes de voz que requieren respuestas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo original en FP16. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo + proyector de visión, con overhead típico de llama.cpp):
  - Q3-XYZ (10,85 GB + 1,84 GB mmproj): ~16 GB VRAM (cabe en RTX 4080, RTX 4090, A6000).
  - Q4-XYZ (15,19 GB + 1,84 GB): ~20 GB VRAM (RTX 4090 24 GB, A100 40 GB).
  - Q5-XYZ (17,41 GB + 1,84 GB): ~24 GB VRAM (RTX 4090 24 GB, A100 40 GB).
  - Q6-XYZ (22,55 GB + 1,84 GB): ~30 GB VRAM (A100 40 GB, H100).
- GPU recomendadas: RTX 4090 (24 GB) para Q3-Q5; A100 40 GB o H100 para Q6. No cabe en GPUs de 8-12 GB salvo con Q3 y sin proyector de visión.
- Opciones de despliegue: llama.cpp (llama-cli, llama-qwen2vl-cli, llama-server), compatible con Ollama si se importa el GGUF, y con servidores tipo TGI si se convierten los pesos.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP puede reducir la latencia, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.8-27B pertenece a la familia Qwen, pero no se han publicado especificaciones detalladas de contexto, benchmarks o rendimiento frente a alternativas como Llama 3.1 8B, Mistral 7B o Qwen2.5 14B. Se recomienda consultar la documentación oficial de Qwen para obtener datos comparativos.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad respecto al modelo original en FP16; el impacto varía según el nivel (Q3 mayor pérdida, Q6 menor) y la tarea.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- La longitud de contexto no está especificada en la información disponible; es necesario verificar la documentación del modelo base para conocerla.
- Los idiomas soportados no están documentados en esta versión; aunque Qwen suele ser multilingüe, no hay confirmación oficial aquí.
- El proyector de visión está en F32, lo que añade 1,84 GB de memoria; si se usa solo texto, puede omitirse.
- Las versiones sin MTP ("vanilla") están anunciadas pero aún no publicadas, lo que limita la comparación entre configuraciones.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener términos adicionales; se recomienda revisar la licencia de Qwen/Qwen3.8-27B.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/quimmedes/Qwen3.8-27B-XYZ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
