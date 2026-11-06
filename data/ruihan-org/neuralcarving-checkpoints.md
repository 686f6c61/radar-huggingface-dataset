# Ruihan-org/NeuralCarving-checkpoints

## Resumen

NeuralCarving-checkpoints es un conjunto de checkpoints de investigación publicados por Ruihan-org para la generación de mallas 3D a partir de imágenes (pipeline `image-to-3d`). El modelo deriva de microsoft/TRELLIS.2-4B, un modelo de difusión con arquitectura transformer (DiT) de aproximadamente 4.000 millones de parámetros, y se distribuye como un fine-tune del mismo orientado a una técnica de "carving" neuronal que emplea mapas de normales en espacio de mundo.

El repositorio contiene pesos de investigación temprana: concretamente el checkpoint ordinario del paso 20.000 del DiT, evaluado el 27 de octubre de 2026, emparejado con un VAE de normales V2 afinado hasta el paso 3.000. El autor advierte explícitamente que no se trata de pesos EMA y que las normales representan perturbaciones D-N en espacio de mundo, distintas de las imágenes de condicionamiento de normales absolutas.

Su relevancia es limitada y muy específica: es un artefacto de investigación reproducible (incluye configuración, normalización, hashes de pesos e identidad de fuente) más que un modelo listo para producción. No existe todavía una librería de inferencia autónoma y el repositorio sigue subiéndose, por lo que debe considerarse material para investigadores que quieran replicar el pipeline sobre TRELLIS.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) derivada de microsoft/TRELLIS.2-4B |
| Parametros totales | no disponible (modelo base de 4B, según el identificador TRELLIS.2-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada multimodal imagen, salida 3D) |
| Licencia | no disponible (el autor indica preservar la licencia upstream de TRELLIS.2) |
| Formato de pesos | pytorch (checkpoints; se mencionan hashes de pesos, no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de microsoft/TRELLIS.2-4B, un transformer de difusión (DiT) de unos 4.000 millones de parámetros para generación 3D condicionada por imagen. NeuralCarving añade un VAE de normales (V2) afinado de forma independiente, que produce mapas de normales en espacio de mundo expresados como perturbaciones D-N. Según la model card, el checkpoint publicado corresponde al paso 20.000 del DiT ordinario (sin EMA) y al paso 3.000 del VAE de normales V2.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a un modelo de imagen a 3D) ni innovaciones como decodificación especulativa. El repositorio incluye configuración, normalización, hashes de pesos y archivos de reanudación (resume), lo que sugiere un proceso de entrenamiento reanudable y reproducible, pero los detalles técnicos del procedimiento no están documentados en la información disponible.

## Capacidades

- Generación de geometría 3D (mallas) a partir de imágenes de entrada, mediante el pipeline `image-to-3d` heredado de TRELLIS.2.
- Producción de mapas de normales en espacio de mundo mediante el VAE de normales V2 afinado.
- Condicionamiento por imágenes de normales absolutas (capacidad del modelo base TRELLIS.2, diferenciada explícitamente de las perturbaciones D-N de este fine-tune).
- Reanudación de entrenamiento y replicación de la investigación gracias a los archivos de configuración, normalización y hashes incluidos.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Replicación de investigación en generación 3D: el repositorio permite reproducir la evaluación del 27 de octubre de 2026 cargando el checkpoint del paso 20.000 junto con el VAE de normales V2 del paso 3.000, usando la configuración y normalización incluidas.
- Estudio de mapas de normales en espacio de mundo: investigadores que trabajen en representaciones de normales D-N pueden comparar este fine-tune con el condicionamiento por normales absolutas del TRELLIS.2 original.
- Fine-tuning posterior sobre TRELLIS.2: al ser un fine-tune del modelo base, sirve como punto de partida para experimentos de carving neuronal con reanudación de entrenamiento.
- Evaluación comparativa de checkpoints intermedios: permite analizar el efecto del paso de entrenamiento (20.000 en el DiT, 3.000 en el VAE) sobre la calidad de la geometría generada.
- Desarrollo de pipelines de imagen a 3D en entornos de investigación: integrable en flujos que ya usen TRELLIS.2, sustituyendo los pesos por estos checkpoints experimentales.
- Auditoría de reproducibilidad: los hashes de pesos e identidad de fuente permiten verificar que un experimento concreto se ejecutó con estos pesos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el checkpoint se usó para la evaluación del 27 de octubre de 2026, sin aportar métricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 29,5 GB, lo que da una cota inferior del almacenamiento necesario para los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no hay librería de inferencia autónoma; se requiere la implementación de investigación descrita por la configuración y los archivos incluidos, sobre el código de TRELLIS.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuralCarving-checkpoints | ~4B (base TRELLIS.2-4B) | no aplica | imagen a 3D | no disponible (upstream TRELLIS.2) | checkpoints de investigación, sin librería de inferencia |
| microsoft/TRELLIS.2-4B | ~4B | no aplica | imagen a 3D | la del upstream | modelo base público |
| Otros modelos imagen a 3D | no disponible | no disponible | imagen a 3D | no disponible | no disponible |

La única comparación fiable es con su modelo base, microsoft/TRELLIS.2-4B, del que este repositorio es un fine-tune con VAE de normales V2 y pesos no EMA. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pesos de investigación temprana: el autor los describe como "early research backup/release", no como un modelo validado para producción.
- No son pesos EMA, lo que puede afectar a la estabilidad y calidad de las salidas frente a un checkpoint promediado.
- No existe librería de inferencia autónoma; se necesita la implementación de investigación descrita por la configuración y los archivos del repositorio.
- El repositorio está incompleto: el autor indica que se siguen subiendo archivos de encoder/configuración y de reanudación.
- Licencia no disponible: debe preservarse la licencia upstream de TRELLIS.2, cuyos términos no se detallan en la información proporcionada; verificar antes de cualquier uso comercial.
- Sin datos de benchmarks, sesgos, tasas de alucinación geométrica ni limitaciones de idioma documentadas.
- Las normales representan perturbaciones D-N en espacio de mundo, no normales absolutas; confundir ambas representaciones produce resultados incorrectos.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Ruihan-org/NeuralCarving-checkpoints
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
