# danielbogdoll/iad-weights-m2f-train

## Resumen

`danielbogdoll/iad-weights-m2f-train` es un repositorio de pesos de un modelo Mask2Former con backbone Swin-L, ajustado (fine-tuning) para segmentación de anomalías industriales (anomaly segmentation). Lo publica el usuario danielbogdoll bajo licencia MIT y contiene los checkpoints de una ejecución de entrenamiento concreta (`uno_m2_ft_ade_bs4_20260918`), derivada del modelo CS&MV Swin-L Mask2Former publicado previamente.

No se trata de un modelo de lenguaje: es un modelo de visión por computador orientado a segmentación densa (predicción de máscaras por píxel), por lo que no genera texto ni soporta tool calling, agentes o razonamiento multi-step. Su relevancia radica en que distribuye pesos entrenados para detección y localización de defectos o anomalías, un caso de uso habitual en inspección visual automatizada en entornos industriales.

La información disponible es escasa: el repositorio ocupa 7,8 GB, contiene 5 ficheros (9,65 GiB según la model card) e incluye un `index.json` con tamaños y hashes sha256, además de los manifiestos de ejecución y el `config.yaml` de Detectron2 de cada carpeta. No se publican métricas, idiomas ni pipeline en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask2Former con backbone Swin-L (transformer de segmentación con atención enmascarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints de Detectron2 (no se especifica safetensors ni GGUF; el repo incluye `index.json` con sha256) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mask2Former, un transformer de segmentación universal que combina un backbone de extracción de características con un decoder transformer que predice máscaras mediante consultas aprendidas y atención enmascarada sobre el mapa de características. En este caso el backbone es Swin-L (Swin Transformer Large), lo que explica el tamaño del repositorio (7,8 GB, 9,65 GiB según la model card).

El entrenamiento parte del modelo CS&MV Swin-L Mask2Former publicado y aplica un fine-tuning identificado como `uno_m2_ft_ade_bs4_20260918` (batch size 4 según el nombre de la ejecución). La carpeta `output/M2F/M2F_SWIN-L_uno_m2_ft_aca7aec_bs4` contiene 4 checkpoints, el manifiesto de la ejecución (comando, commit y configuración) y el `config.yaml` de Detectron2. No se detallan en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de refuerzo o preferencias (no aplicables en segmentación).

## Capacidades

- Segmentación densa de anomalías: genera máscaras por píxel para localizar regiones anómalas o defectuosas en imágenes.
- Segmentación de instancias y semántica heredada de Mask2Former (el modelo base es un segmentador universal).
- Extracción de características con backbone Swin-L, adecuada para imágenes de alta resolución.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la visión de entrada.

## Casos de uso

- Inspección visual en línea de producción: el modelo recibe imágenes de cámaras industriales y devuelve máscaras de las regiones con defectos, lo que permite descartar piezas automáticamente antes de empaquetado.
- Control de calidad en fabricación de semiconductores: segmentación de anomalías en obleas o patrones litográficos para detectar desviaciones respecto a la referencia.
- Mantenimiento predictivo por imagen: análisis de superficies (corrosión, grietas, desgaste) en infraestructura o maquinaria, generando mapas de anomalía que se integran en un sistema de alertas.
- Detección de defectos textiles: localización de roturas, manchas o irregularidades en tejidos mediante segmentación por píxel, usando el checkpoint como base y ajuste fino con un dataset propio del dominio.
- Investigación en anomaly segmentation: reproducción de experimentos con el manifiesto y `config.yaml` incluidos, permitiendo comparar el fine-tuning `uno_m2_ft_ade_bs4_20260918` con el modelo base CS&MV Swin-L Mask2Former.
- Segmentación médica o de imágenes científicas: reutilización del backbone Swin-L y del decoder Mask2Former para tareas de segmentación densa en dominios con datos limitados, aprovechando el preentrenamiento.
- Integración en pipelines de visión con Detectron2: carga de los checkpoints en un checkout del código de investigación (`uv run python scripts/ops/backup_weights.py pull --only m2f-train`) para servir inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (7,8 GB) y un backbone Swin-L, se requiere una GPU con al menos 16-24 GB para cargar el checkpoint en precisión completa.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia cómoda; GPUs con 16 GB podrían ser insuficientes según el lote y la resolución de imagen.
- ¿Cabe en GPU de consumo? No confirmado; probablemente en RTX 4090 (24 GB) con lotes pequeños, pero no hay datos publicados.
- Opciones de despliegue: Detectron2 (formato nativo de los checkpoints) y el script `scripts/ops/backup_weights.py` del código de investigación; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `danielbogdoll/iad-weights-m2f-train` | Mask2Former + Swin-L | no disponible | no aplica | MIT | Hugging Face (repo de pesos) |
| CS&MV Swin-L Mask2Former (modelo base) | Mask2Former + Swin-L | no disponible | no aplica | no disponible | Referenciado en la model card |
| Mask2Former original (Meta) | Mask2Former | no disponible | no aplica | no disponible | Repositorio oficial de Meta |
| Otros segmentadores de anomalías (p. ej. PatchCore, PaDiM) | Basados en características o memoria | no disponible | no aplica | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo de segmentación entrenado con un dataset concreto, puede generalizar mal a dominios visuales distintos del de entrenamiento.
- Riesgo de alucinación: en segmentación se traduce en falsos positivos (máscaras sobre regiones normales) o falsos negativos (anomalías no detectadas); no hay métricas publicadas para cuantificarlo.
- Limitaciones de contexto o idioma: no aplica contexto textual; no se especifican idiomas ni dominios de imagen soportados.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación siempre que se incluya el aviso de copyright y la licencia; conviene verificar las licencias del modelo base CS&MV y del código de investigación asociado.
- Caveats para producción: el repo contiene checkpoints de entrenamiento (4 checkpoints) sin pipeline de inferencia documentado en Hugging Face; es necesario restaurar el código de investigación y el `config.yaml` de Detectron2. No hay métricas de validación publicadas, por lo que se recomienda evaluar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/danielbogdoll/iad-weights-m2f-train
- Modelo base CS&MV Swin-L Mask2Former: no disponible (referenciado en la model card sin enlace)
- Código de investigación y script de restauración (`scripts/ops/backup_weights.py`): no disponible (no se proporciona URL)
- Paper de Mask2Former: no disponible en la información proporcionada
- Repositorio oficial de Detectron2: no disponible en la información proporcionada
