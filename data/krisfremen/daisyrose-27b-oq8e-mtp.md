# krisfremen/DaisyRose-27B-oQ8e-mtp

## Resumen

DaisyRose-27B-oQ8e-mtp es una cuantización mixta de un modelo multimodal de la familia Qwen 3.5, publicada por el usuario krisfremen en Hugging Face. El checkpoint conserva 27.781 millones de parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (26.896B), un codificador de visión (0.461B) y una cabeza MTP (multi-token prediction) de 0.425B. La cuantización se ha realizado con oMLX v0.8.0, herramienta del proyecto oQ, aplicando precisión mixta: el 98,14 % de los pesos se almacena en affine 8-bit con grupo de 64, mientras que el 1,86 % restante se mantiene en BF16.

El resultado es un checkpoint de 27,941 GiB (30,001 GB) con un promedio efectivo de 8,639 bits por peso, pensado para ejecutarse con la librería MLX en hardware Apple Silicon. La inclusión de una cabeza MTP sugiere soporte para decodificación especulativa multi-token, una técnica que puede mejorar el throughput de generación frente a la decodificación autorregresiva clásica.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización mixta concreta (oQ/oMLX) aplicada a un modelo de 27B con visión; por otro, advierte de que se trata de un artefacto derivado, sin model card propia del modelo base, sin licencia declarada y sin resultados de benchmarks publicados en la información disponible. Cualquier evaluación de calidad debe remitirse al modelo original Qwen 3.5 del que deriva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5) con cabeza MTP; detalles no disponibles |
| Parámetros totales | 27.781.427.952 (27.781B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit grupo 64 (98,143 % de los pesos); BF16 (1,857 %); promedio efectivo 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |
| Componentes | Lenguaje: 26.896B (28,579 GB); Visión: 0.461B (0,921 GB); MTP head: 0.425B (0,500 GB) |
| Tamaño del repo | 30,001 GB (27,941 GiB) |
| Versión de cuantización | oMLX v0.8.0 (re-cuantizado el 2026-11-19) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen 3.5 y de la presencia de tres bloques diferenciados: un modelo de lenguaje de 26.896B parámetros, un codificador visual de 0.461B y una cabeza MTP de 0.425B. La cabeza MTP (multi-token prediction) es un componente que, en la literatura reciente, se entrena para predecir varios tokens futuros de forma simultánea y se emplea habitualmente como borrador en esquemas de decodificación especulativa, lo que permitiría acelerar la generación sin alterar la distribución del modelo principal.

No se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta la innovación arquitectónica concreta del modelo base (tipo de atención, uso de atención lineal, mezcla de expertos u otras variantes). Lo único verificable es el proceso de cuantización: oMLX v0.8.0 asigna precisión por tensor, manteniendo en BF16 el 1,857 % de los pesos (0,516B parámetros) y cuantizando el resto a affine 8-bit con grupo de 64, lo que reduce el peso lógico de 27,781B parámetros a 27,941 GiB de almacenamiento.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.5 (sin evaluación publicada en esta ficha).
- Procesamiento de imágenes mediante el codificador visual de 0.461B parámetros, lo que habilita tareas de visión-lenguaje.
- Decodificación especulativa multi-token a través de la cabeza MTP de 0.425B parámetros, orientada a mejorar el throughput en MLX.
- Ejecución nativa en Apple Silicon mediante la librería MLX.
- Soporte de tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 27,941 GiB encaja en equipos Apple Silicon con 32 GB o más de memoria unificada, permitiendo ejecutar un modelo de 27B con visión sin GPU dedicada.
- Asistentes de análisis de documentos con imágenes: el codificador visual permite procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en una misma sesión.
- Prototipado de pipelines de visión-lenguaje en entornos de desarrollo sobre macOS: al estar en formato MLX, se integra directamente en scripts Python con `mlx-lm` sin conversión previa.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput frente a la decodificación autorregresiva estándar en el mismo hardware, útil para investigación sobre aceleración de inferencia.
- Generación de texto asistida en local para flujos con requisitos de privacidad: al ejecutarse íntegramente en el equipo, los datos no salen del dispositivo, lo que resulta adecuado para borradores y resúmenes de material sensible.
- Banquito de pruebas para recetas de cuantización mixta: sirve para comparar la calidad de la asignación 8-bit/BF16 de oQ frente a cuantizaciones uniformes de 8 o 4 bits sobre el mismo modelo base.
- Fine-tuning ligero o adaptación con LoRA sobre la versión cuantizada: no recomendado de forma general, pero viable para experimentos que requieran bajo consumo de memoria en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 28 GiB para cargar los pesos; se recomienda 32 GB o más para acomodar el contexto y los buffers de inferencia.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (familias M1/M2/M3/M4 Pro, Max y Ultra). No está pensado para GPU NVIDIA o AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Solo en equipos Apple Silicon de gama alta con 32 GB o más; no es compatible con GPUs de consumo convencionales por el formato de pesos.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (incluida la herramienta oMLX para re-cuantización). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere una mejora potencial mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ8e-mtp | 27,781B | no disponible | MLX safetensors (8-bit mixto) | no disponible | Hugging Face, 0 descargas |
| Qwen 3.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Cuantizaciones uniformes 4-bit del mismo base | 27,781B (lógicos) | no disponible | típicamente GGUF/MLX | dependiente del base | no disponible en la información |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas. La comparación más directa es con el checkpoint original sin cuantizar del que deriva, cuyos detalles no se documentan en esta ficha.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo entrenado desde cero, sino una cuantización de un modelo base no identificado explícitamente en la model card.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; debe consultarse la licencia del modelo original antes de cualquier uso en producción.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad por idioma.
- Contexto máximo no documentado: se desconoce la ventana real disponible tras la cuantización.
- Pérdida de precisión por cuantización: el 98,14 % de los pesos está en 8-bit con grupo de 64; aunque el impacto suele ser moderado, puede afectar a tareas sensibles a la precisión numérica (matemáticas, código, razonamiento de cadena larga). No se aportan evaluaciones comparativas frente al BF16.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no es posible cuantificarlo.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del modelo base, desconocido.
- Compatibilidad limitada: el formato MLX restringe el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA sin conversión.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en noviembre de 2026; no hay evidencia de validación por la comunidad.
- Re-cuantización reciente: la model card advierte de que se re-cuantizó con oMLX v0.8.0 el 2026-11-19 y recomienda volver a descargar copias anteriores, lo que indica posibles inconsistencias entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krisfremen/DaisyRose-27B-oQ8e-mtp
- Herramienta de cuantización oQ/oMLX: https://github.com/jundot/omlx
- Modelo base Qwen 3.5: no disponible en la información proporcionada
- Paper, blog o demo asociados: no disponibles en la información proporcionada
