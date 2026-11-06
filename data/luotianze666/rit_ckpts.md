# luotianze666/RiT_ckpts

## Resumen

RiT_ckpts es el repositorio de checkpoints oficiales en PyTorch del trabajo "What kills v-prediction? A Patch-wise PCA Perspective on Pixel-Space Flow Matching", aceptado como Spotlight en NeurIPS 2026. Lo firman Tianze Luo, Haofeng Huang y Yuan Yao, de la Universidad de Tsinghua. No se trata de un modelo de lenguaje, sino de un conjunto de pesos para modelos generativos de imagen que operan en espacio de píxeles mediante flow matching, un paradigma alternativo a los modelos de difusión latente tipo Stable Diffusion.

El trabajo aborda un problema técnico concreto: la parametrización v-prediction, ampliamente usada en modelos de difusión y flow matching, presenta patologías de entrenamiento cuya causa no estaba bien caracterizada. Los autores la analizan desde una perspectiva de PCA por parches y proponen el método RiT (nombre que da título al repositorio). El repositorio contiene únicamente los checkpoints y el `config.yaml` asociado a cada uno; el código de entrenamiento, inferencia y evaluación vive en el repositorio de GitHub del proyecto.

El tamaño del repositorio, 396,3 GB, indica que se trata de pesos de modelos de imagen de gran escala, no de un modelo único. No hay información pública sobre número de parámetros, arquitectura exacta, datos de entrenamiento ni resultados numéricos en la model card proporcionada. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de imagen en espacio de píxeles basado en flow matching; detalles en el paper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch (`.ckpt`/`.pt`), acompañados de `config.yaml` por modelo |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de los modelos. Por el título y el contexto del paper, se trata de modelos de flow matching que operan directamente en espacio de píxeles (pixel-space flow matching), en contraposición a los enfoques de difusión latente. El análisis central del trabajo es un estudio de PCA por parches sobre la parametrización v-prediction, que identifica por qué esta parametrización degrada el entrenamiento en dicho espacio. El método RiT es la propuesta derivada de ese análisis.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (poco habituales en generación de imagen). Tampoco se documentan innovaciones de inferencia como decodificación especulativa. Para cualquier detalle de entrenamiento, composición del dataset o hiperparámetros, es necesario consultar el paper en OpenReview y el repositorio de GitHub.

## Capacidades

- Generación de imágenes en espacio de píxeles mediante flow matching (los checkpoints están pensados para inferencia con el código de RiT).
- Análisis y reproducción de los experimentos del paper sobre v-prediction y PCA por parches.
- Servir como pesos de referencia para comparativas frente a parametrizaciones alternativas (x-prediction, epsilon-prediction) en flow matching.
- No se documentan capacidades de texto, código, matemáticas, visión por comprensión, tool calling, agentes ni multilingüismo: es un modelo generativo de imagen.
- No se indica soporte de thinking mode, audio ni otras modalidades.

## Casos de uso

- Reproducción de resultados académicos: cargar los checkpoints con el `config.yaml` correspondiente y ejecutar los scripts de evaluación del repositorio de GitHub para verificar las conclusiones del paper sobre v-prediction.
- Investigación en flow matching en espacio de píxeles: usar los pesos como línea base para estudiar parametrizaciones alternativas y su estabilidad de entrenamiento.
- Análisis de PCA por parches: emplear los checkpoints para inspeccionar la estructura espectral de las representaciones internas y validar la hipótesis del paper.
- Generación de imágenes sin VAE: al operar en espacio de píxeles, permite estudiar pipelines que evitan el codificador latente y sus artefactos de reconstrucción.
- Experimentos de ablation: comparar los distintos checkpoints del repositorio (cada uno con su `config.yaml`) para aislar el efecto de la parametrización y de los componentes del método RiT.
- Docencia y formación: material de referencia para cursos de generación generativa avanzada que quieran ilustrar las diferencias entre difusión latente y flow matching en píxeles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper de OpenReview y al repositorio de GitHub para las métricas (FID, etc.) y las comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 396,3 GB, lo que sugiere múltiples checkpoints de modelos de imagen de gran tamaño; la VRAM necesaria para cargar uno solo de ellos no está documentada.
- GPU recomendadas: no disponible. Por el volumen de pesos, es previsible que requiera GPUs de datacenter (A100, H100) para entrenamiento y evaluación, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible. Sin conocer el número de parámetros por checkpoint, no puede determinarse.
- Opciones de despliegue: el autor indica que se use el repositorio de GitHub (https://github.com/luotianze666/RiT) para entorno, entrenamiento, inferencia y evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de flow matching en espacio de píxeles ni con modelos de difusión latente, y no se dispone de datos de parámetros o rendimiento para establecer una tabla rigurosa.

## Limitaciones y advertencias

- Es un repositorio de checkpoints de investigación, no un modelo listo para producción: no incluye pipeline de inferencia ni model card con instrucciones de uso más allá de remitir al repositorio de GitHub.
- No hay información sobre sesgos, calidad de generación ni comportamiento en dominios concretos; no puede evaluarse el riesgo de alucinación visual o de contenido inapropiado sin ejecutar el modelo.
- El repositorio pesa 396,3 GB, lo que exige almacenamiento considerable y descargas largas; conviene descargar solo el checkpoint y el `config.yaml` necesarios.
- Es imprescindible mantener cada `config.yaml` junto a su directorio `ckpts/`, tal como advierte el autor; de lo contrario la carga puede fallar.
- La licencia MIT permite uso comercial, pero al ser un trabajo académico de NeurIPS conviene citar el paper y verificar las licencias de los datasets subyacentes (no documentadas aquí).
- No se especifican los idiomas ni el dominio de las imágenes de entrenamiento, por lo que el rendimiento fuera de la distribución del dataset es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/luotianze666/RiT_ckpts
- Paper (OpenReview): https://openreview.net/forum?id=FwWaPhPb2O
- Repositorio de código: https://github.com/luotianze666/RiT
