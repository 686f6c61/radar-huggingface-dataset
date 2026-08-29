# avlp12/GLM-5.3-Flash-Alis-MLX-8bit

## Resumen

GLM-5.3-Flash-Alis-MLX-8bit es una cuantización en 8 bits del modelo GLM-5.3-Flash de Z.ai, adaptada para ejecutarse en hardware Apple Silicon mediante el framework MLX. El modelo original es un MoE híbrido de 320 000 millones de parámetros (aproximadamente 18 000 millones activos) que combina atención lineal Kimi-Delta (KDA) con atención dispersa DeepSeek-Sparse-Attention (DSA), y ofrece una ventana de contexto de 1 048 576 tokens. Esta versión concreta, creada por avlp12, conserva todos los tensores visuales del modelo base sin cuantizar, lo que permite su uso como VLM si se emplea un runtime adaptado.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de esta escala en equipos de Apple con memoria unificada, reduciendo el peso de 346,7 GB en disco. Sin embargo, requiere un runtime portado (`glm5_next.py`) porque el soporte oficial en `mlx-lm` aún no está disponible. El modelo está publicado bajo licencia MIT, lo que facilita su uso comercial y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal KDA y atención dispersa DSA (glm5_next) |
| Parametros totales | 320 000 millones (modelo original) |
| Parametros activos | ~18 000 millones |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | 8-bit afín (group size 64), también disponibles versiones 6-bit y 4-bit |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de GLM-5.3-Flash, designada como `glm5_next`, combina 45 capas de backbone de texto, de las cuales 34 emplean atención lineal Kimi-Delta (KDA) con estado recurrente de tamaño fijo y puerta de olvido aprendida, mientras que las 11 restantes (capas 3, 7, …, 43) utilizan atención de latente comprimido estilo DeepSeek (MLA) con un indexador disperso (DSA) y agrupación de claves (IndexPool). El bloque MoE incluye 288 expertos enrutados (top-8) más un experto compartido, con capas 0-2 densas y activación SwiGLU. Además, incorpora hiperconexiones multi-flujo (mHC) con 4 flujos residuales y una capa MTP (Multi-Token Prediction) declarada en el índice de pesos.

El entrenamiento específico no se detalla en la información disponible. Se sabe que el modelo base proviene de Z.ai y que, según el repositorio oficial, GLM-5.3 mejora significativamente respecto a GLM-5.2 en tareas de codificación compleja y de horizonte largo, con un incremento del 50 % en métricas internas de la compañía. No se han publicado datos sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Generación de código fuente, con mejoras sustanciales frente a la versión anterior (GLM-5.2) según los creadores.
- Comprensión de contexto extremadamente largo (1M tokens) gracias a la combinación de atención lineal y dispersa.
- Capacidad de procesamiento de imágenes (image-to-text) si se utiliza el runtime portado del autor, ya que el modelo base es un VLM y los tensores visuales se conservan íntegros.
- Soporte de generación con temperatura 1.0 y top_p 0.95 por defecto.
- No se menciona soporte explícito de tool calling o function calling en la documentación disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo Apple Silicon: gracias a la cuantización MLX y al runtime portado, es posible ejecutar un modelo de 320B en una Mac con memoria unificada de al menos 512 GB, ideal para entornos de desarrollo sin acceso a GPUs NVIDIA.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros completos, informes anuales o bases de conocimiento enteras en una sola pasada, sin necesidad de dividir el texto.
- Generación de código en proyectos grandes: la mejora en codificación frente a GLM-5.2 lo hace adecuado para asistencia en repositorios de gran tamaño, donde el contexto largo ayuda a entender dependencias y arquitectura.
- Investigación académica en PNL: al ser de código abierto con licencia MIT, puede utilizarse como modelo base para fine-tuning o evaluación en tareas específicas, siempre que se disponga del hardware necesario.
- Prototipado de aplicaciones multimodales: aunque requiere un runtime especial, la preservación de los tensores visuales permite experimentar con generación de descripciones de imágenes en local.
- Creación de asistentes conversacionales bilingües (inglés/chino) con memoria de largo alcance, aprovechando la atención lineal que evita el crecimiento del cache KV en capas KDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio oficial de GLM-5 menciona mejoras del 50 % en codificación frente a GLM-5.2, pero sin cifras concretas. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas.

## Requisitos de hardware

- El repositorio ocupa 346,7 GB en disco (322,96 GiB), por lo que se requiere una Mac con al menos 512 GB de almacenamiento disponible.
- Para cargar el modelo en memoria unificada se necesitan aproximadamente 346 GB de RAM, por lo que se recomienda un chip M3 Ultra con 512 GB de memoria unificada.
- La inferencia se realiza mediante Metal (GPU de Apple) usando MLX; no es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` con un runtime portado (`glm5_next.py`), o `mlx-vlm` para tareas de visión (a través de un PR pendiente). No se mencionan alternativas como vLLM u Ollama.
- No se dispone de estimaciones de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos MoE de escala similar (p. ej., DeepSeek-V3, Qwen2.5-Max, Mixtral 8x22B) en la información proporcionada. Se recomienda consultar benchmarks independientes para una evaluación objetiva.

## Limitaciones y advertencias

- Requiere un runtime portado no oficial: `mlx-lm` estándar no reconoce el tipo de modelo `glm5_next` y falla al cargar. El usuario debe instalar el port de avlp12 (archivo `glm5_next.py` con md5 específico) y su módulo de hiperconexiones.
- El soporte de visión no está integrado en `mlx-lm` ni en `mlx-vlm` estándar; solo funciona con el runtime de la campaña de avlp12.
- Idiomas limitados a inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- El tamaño del modelo (346 GB en RAM) restringe su uso a equipos muy específicos, lo que limita su accesibilidad.
- La cuantización 8-bit puede introducir una ligera degradación en la calidad de las respuestas frente al modelo original en FP8, aunque el autor indica que los tensores sensibles se mantienen en precisión original.
- No se mencionan sesgos específicos, pero al ser un modelo entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-8bit
- Colección de cuantizaciones Alis MLX: https://huggingface.co/collections/avlp12/glm-53-flash-alis-mlx-6a8f74a74289c9ad6a5f5e05
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GitHub del autor (runtime portado y herramientas): https://github.com/avlp12/local-llm-serving
- PR de integración en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/2091
- Repositorio oficial de la familia GLM-5: https://github.com/zai-org/GLM-5
- Documentación de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
- Colección MLX de PipeNetwork: https://huggingface.co/collections/pipenetwork/glm-53-flash-mlx
