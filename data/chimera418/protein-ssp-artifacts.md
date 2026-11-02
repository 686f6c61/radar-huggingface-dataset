# Chimera418/protein-ssp-artifacts

## Resumen

`Chimera418/protein-ssp-artifacts` es un repositorio de artefactos binarios que da soporte a una aplicación de predicción de estructura secundaria de proteínas (α-hélice, β-lámina y coil) a partir de secuencias de aminoácidos en bruto. No es un modelo de lenguaje generativo, sino un contenedor de pesos entrenados, embeddings precalculados y datos curados asociados al proyecto Protein SSP del mismo autor, cuyo código y demo pública viven en un Space de Streamlit y en un repositorio de GitHub separados.

El componente central son cinco cabezales de clasificación PyTorch de entre 16 y 23 MB cada uno, todos compartiendo la misma arquitectura: CNN 1D seguida de BiLSTM, atención multi-cabeza y una capa lineal final de tres clases. Estos modelos operan sobre embeddings por residuo extraídos de `Rostlab/prot_t5_xl_uniref50` (1024 dimensiones), con variantes que aplican filtrado de Pearson, reducción PCA, o selección de características mediante ExtraTrees, reduciendo la dimensionalidad de entrada hasta 12 componentes en la variante más agresiva.

La relevancia del repositorio es fundamentalmente de ingeniería de despliegue: separar los artefactos pesados (60,6 GB en total, incluyendo 26,7 GB de embeddings precalculados sobre ~9.000 proteínas) permite sortear los límites de 1 GB de los Spaces de Hugging Face y de Git LFS, manteniendo la aplicación ligera y descargando cada archivo bajo demanda mediante `huggingface_hub`. Para desarrolladores e investigadores en bioinformática, esto ofrece una referencia de pipeline completo de curación de datos (RCSB PDB, PISCES) y entrenamiento sobre embeddings proteicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1D → BiLSTM → atención multi-cabeza → capa lineal (3 clases) |
| Parámetros totales | no disponible (pesos de 16-23 MB por modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (operación por residuo sobre embeddings de ProtT5) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; la tarea es sobre secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y pickle (`.pkl`) |

## Arquitectura y entrenamiento

Los cinco modelos del directorio `/models` comparten una arquitectura secuencial: una CNN 1D para capturar patrones locales sobre la secuencia de embeddings, una BiLSTM para modelar dependencias bidireccionales entre residuos, un bloque de atención multi-cabeza y una capa lineal que emite tres clases (H, E, C). La entrada procede de `Rostlab/prot_t5_xl_uniref50`, que genera embeddings de 1024 dimensiones por residuo. Las variantes difieren en el preprocesado de esas representaciones: modo directo (1024 dim), filtrado de Pearson (1017 dim), PCA (739 dim, marcado como el mejor), y dos versiones de selección de características con ExtraTrees (109 y 12 dim).

El pipeline de datos se documenta en siete fases: descarga de `ss.txt.gz` de RCSB PDB, deduplicación y filtrado de longitud, eliminación de aminoácidos inválidos, culling de redundancia con PISCES a ≤70 % de identidad, etiquetado por residuo SST8/SST3, filtrado estadístico de embeddings y reducción/ selección de dimensiones. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a una tarea de clasificación supervisada de este tipo).

## Capacidades

- Predicción de estructura secundaria de proteínas en tres clases: α-hélice (H), β-lámina (E) y coil (C).
- Clasificación por residuo sobre secuencias de aminoácidos en bruto.
- Cinco modos de inferencia con distintos compromisos dimensionalidad/precisión: directo, filtrado de Pearson, PCA, y selección de características V1 y V2.
- Integración con un Space de Streamlit con descarga perezosa de pesos vía `huggingface_hub`.
- Distribución de embeddings precalculados (ProtT5, 1024 dim) para ~9.000 proteínas, útiles para experimentación offline.
- Datasets curados intermedios en CSV para reproducir el pipeline de entrenamiento.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Anotación funcional rápida de proteínas: dado un FASTA de secuencia desconocida, el modelo emite una predicción de estructura secundaria por residuo que sirve como primera aproximación antes de métodos experimentales o de plegado completo como AlphaFold.
- Filtrado previo en pipelines de ingeniería de proteínas: usar la variante de 12 características (V2) como clasificador ligero para descartar candidatos con composición estructural implausible antes de simulaciones más costosas.
- Docencia y divulgación en bioinformática: la demo de Streamlit permite a estudiantes visualizar la relación secuencia-estructura sin infraestructura propia, descargando los pesos bajo demanda.
- Reproducción de investigación: los embeddings precalculados (26,7 GB) y los CSV intermedios permiten a otros grupos reproducir el pipeline de siete fases o entrenar cabezales alternativos sobre las mismas representaciones.
- Benchmark de reducción de dimensionalidad: comparar los cinco modos (1024 → 12 dimensiones) para estudiar cuánta información estructural sobrevive a la compresión, con la variante PCA marcada como la mejor.
- Prototipado de servicios bioinformáticos: los pesos de 16-23 MB caben en cualquier GPU consumer y permiten servir la predicción en un contenedor ligero, mientras los artefactos pesados se alojan aparte.
- Integración en pipelines de anotación masiva: procesar lotes de secuencias de PDB o UniProt usando los embeddings de ProtT5 precalculados como caché, evitando recomputar el encoder en cada ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la variante PCA (739 dim) es la mejor de las cinco, pero no aporta métricas numéricas (exactitud, Q3, SOV) ni comparaciones con herramientas como PSIPRED, NetSurfP o SPOT-1D.

## Requisitos de hardware

- VRAM para inferencia: los pesos de cada modelo ocupan 16-23 MB, por lo que la inferencia de los cabezales es viable en CPU; el coste real está en generar los embeddings ProtT5 (modelo T5-XL de ~3.000 M de parámetros, aproximadamente 11-12 GB en fp16).
- GPU recomendadas: cualquier GPU con ≥16 GB (RTX 4090, A100, H100) para ejecutar ProtT5 en fp16; para los cabezales basta CPU.
- GPU consumer: los cinco cabezales caben en cualquier GPU consumer e incluso en CPU; ProtT5 requiere al menos 12 GB de VRAM en fp16 o cuantización.
- Despliegue: PyTorch nativo; la aplicación usa Streamlit con descarga perezosa vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta arquitectura de clasificación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protein-ssp-artifacts | CNN 1D + BiLSTM + atención sobre embeddings ProtT5 | no disponible (pesos 16-23 MB) | no aplica (por residuo) | MIT | Hugging Face + GitHub |
| PSIPRED | Red neuronal sobre perfiles PSSM | no disponible | no aplica | académica | servidor web |
| NetSurfP-3.0 | CNN + BiLSTM sobre embeddings | no disponible | no aplica | académica | servidor web |
| SPOT-1D | Ensemble de redes profundas | no disponible | no aplica | académica | servidor web |

La información disponible no permite comparar métricas de rendimiento con estas alternativas; la comparación se limita a la categoría de tarea y a la disponibilidad de pesos abiertos bajo licencia MIT, que es el principal diferencial frente a las herramientas académicas citadas.

## Limitaciones y advertencias

- No es un modelo generativo: no admite prompts, tool calling ni razonamiento multi-paso; cualquier expectativa de uso como LLM es incorrecta.
- No se publican métricas de precisión (Q3, SOV, exactitud por clase), por lo que no es posible validar su calidad frente a PSIPRED, NetSurfP o SPOT-1D sin ejecutar la evaluación por cuenta propia.
- El repositorio depende del modelo externo `Rostlab/prot_t5_xl_uniref50`; los pesos de los cabezales no son autónomos y requieren generar embeddings con ese encoder.
- El sesgo del dataset subyacente (RCSB PDB, culling PISCES a ≤70 % de identidad) puede sobrerrepresentar familias proteicas bien caracterizadas estructuralmente y penalizar proteínas intrínsecamente desordenadas o de membrana.
- Riesgo de sobreajuste a la distribución de PDB: la predicción sobre secuencias muy alejadas del conjunto de entrenamiento puede degradarse sin aviso.
- El tamaño total del repositorio (60,6 GB) implica que la reproducibilidad completa del pipeline exige un ancho de banda y almacenamiento considerables; la app solo descarga los ~1,5 GB de `/models`.
- La licencia MIT cubre los artefactos, pero el uso de ProtT5 subyacente está sujeto a su propia licencia (no verificada en la información disponible); conviene revisarla antes de un despliegue comercial.
- La fecha de creación del repositorio (2026-05-22) y las rutas de datos (PISCES 2026-05-14) deben tratarse como referencia temporal del snapshot, no como garantía de mantenimiento continuo.

## Enlaces

- Repositorio de artefactos: https://huggingface.co/Chimera418/protein-ssp-artifacts
- Demo Streamlit: https://huggingface.co/spaces/Chimera418/protein-ssp
- Código fuente: https://github.com/Chimera418/protein-ssp
- Modelo de embeddings base: https://huggingface.co/Rostlab/prot_t5_xl_uniref50
- RCSB PDB (fuente de datos): https://www.rcsb.org
- PISCES (culling de redundancia): http://dunbrack.fccc.edu/pisces/
