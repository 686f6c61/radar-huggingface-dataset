# OneScience-Group/La-Proteina

## Resumen

La-Proteina es un modelo de generación de estructuras de proteínas desarrollado por OneScience-Group. Emplea un enfoque de *flow matching* parcialmente latente (Partially Latent Flow Matching) para generar directamente estructuras all-atom de proteínas junto con sus secuencias de aminoácidos correspondientes. El modelo modela explícitamente el backbone de la proteína (átomos CA) y captura la información de secuencia y detalles a nivel atómico mediante variables latentes de dimensión fija por residuo, evitando así las dificultades de representar cadenas laterales explícitas.

El modelo se presenta como una herramienta para el diseño computacional de proteínas, con soporte para generación no condicionada, *scaffolding* de motivos con restricciones de posición y secuencia, y entrenamiento de modelos de difusión. Está respaldado por un artículo científico (arXiv 2025) y se distribuye bajo licencia Apache 2.0. Aunque el repositorio en Hugging Face aún no incluye pesos ni datasets (según la fecha de creación), la documentación detalla un flujo de trabajo completo con scripts para entrenamiento, generación y evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching parcialmente latente con autoencoder de latentes locales y red de puntuación (score network) |
| Parametros totales | No disponible (se menciona una configuración con red de 160M para el score network, pero no es el total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generación de estructuras, no procesamiento de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiqueta del modelo, aunque el dominio es biológico) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente PyTorch/safetensors, no especificado) |

## Arquitectura y entrenamiento

La-Proteina se basa en *flow matching* parcialmente latente. El modelo representa explícitamente el backbone de la proteína (átomos CA) mientras que la secuencia y los detalles atómicos se codifican en variables latentes de dimensión fija por residuo. Esta estrategia evita la complejidad de modelar cadenas laterales explícitas, simplificando el espacio de generación. El modelo principal se entrena sobre datasets de PDB, y se complementa con un autoencoder de latentes locales que se entrena por separado para codificar y decodificar estructuras. La documentación menciona configuraciones con y sin *triangle attention*, así como variantes para cadenas largas (300-800 residuos) y *scaffolding* de motivos con o sin indexación.

No se proporcionan detalles sobre el número de tokens de entrenamiento, composición exacta del dataset, o técnicas como RLHF/DPO (no aplicables a este dominio). La implementación incluye soporte para GPUs NVIDIA y aceleradores DCU de Hygon, con scripts de entrenamiento e inferencia vía Hydra.

## Capacidades

- Generación de estructuras de proteínas all-atom (backbone CA y latentes locales) mediante *flow matching*.
- Generación no condicionada de estructuras, con configuraciones para cadenas de 300 a 800 residuos.
- *Motif-constrained generation*: diseño de backbones alrededor de motivos funcionales, con restricciones de posición y secuencia.
- Soporte para *scaffolding* de motivos con y sin indexación (all-atom y tip-atom).
- Entrenamiento del modelo principal de difusión sobre datasets PDB.
- Entrenamiento e inferencia del autoencoder de latentes locales (codificación, decodificación y reconstrucción).
- Evaluación de resultados con métricas como RMSD, recuperación de secuencia (sequence recovery) y designabilidad (co-designability).
- Integración con ProteinMPNN para evaluación de designabilidad.

## Casos de uso

- Diseño de proteínas de novo: el modelo genera estructuras completas de proteínas con secuencias asociadas, útil para explorar nuevos pliegues y funcionalidades.
- *Scaffolding* de motivos funcionales: dado un motivo (por ejemplo, un sitio activo o un epítopo), el modelo construye un backbone que lo aloja, preservando la geometría del motivo.
- Generación de bibliotecas de estructuras: se pueden generar miles de candidatos estructurales para cribado virtual o entrenamiento de modelos downstream.
- Reconstrucción y análisis de estructuras: el autoencoder permite codificar estructuras PDB en latentes y decodificarlas, facilitando análisis de representaciones intermedias.
- Evaluación de designabilidad: combinado con ProteinMPNN, se pueden medir la recuperación de secuencia y la validez estructural de los diseños generados.
- Investigación en dinámica de proteínas: el modelo puede generar variantes estructurales de una proteína conocida para estudiar conformaciones alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de rendimiento (p. ej., RMSD medio, tasas de designabilidad) ni comparaciones con otros modelos de generación de proteínas.

## Requisitos de hardware

- Se recomienda ejecutar en GPU (NVIDIA) o DCU (Hygon). La CPU es posible pero lenta.
- No se especifica VRAM mínima ni GPUs concretas. La configuración con red de 160M parámetros (score network) sugiere que podría caber en GPUs de consumo medio, pero no hay datos confirmados.
- El entorno requiere instalar el paquete `onescience[bio]` desde un mirror específico y activar CUDA si es necesario.
- Para DCU, se necesita instalar DTK (versión 25.04.2 o superior) y contactar con el soporte de Sugon para adaptación.
- El despliegue se realiza mediante scripts de entrenamiento e inferencia (Hydra), no se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de generación de proteínas (como RFdiffusion, Chroma, o ESMFold) en la información facilitada.

## Limitaciones y advertencias

- El modelo es de carácter investigativo; no se han publicado benchmarks independientes que validen su rendimiento frente a alternativas establecidas.
- Los pesos y datasets aún no están disponibles en Hugging Face (según la fecha de creación), lo que impide su uso inmediato.
- La generación de estructuras de proteínas requiere validación experimental posterior; las estructuras generadas pueden no ser físicamente plausibles o funcionales.
- El modelo se centra en el backbone CA y latentes locales; no modela explícitamente cadenas laterales, lo que puede limitar la precisión en aplicaciones que requieran detalles atómicos completos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de entrenamiento (PDB) y de las herramientas asociadas (p. ej., ProteinMPNN).
- El soporte para DCU requiere adaptaciones específicas y contacto con el fabricante, lo que puede añadir complejidad en entornos no estándar.

## Enlaces

- [Hugging Face: OneScience-Group/La-Proteina](https://huggingface.co/OneScience-Group/La-Proteina)
- [Paper: La-Proteina: Atomistic Protein Generation via Partially Latent Flow Matching (arXiv 2025)](https://arxiv.org/abs/2507.09466)
