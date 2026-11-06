# MEDHEB/MedEmb-2B

## Resumen

MedEmb-2B es un modelo de embeddings multimodal para el dominio médico publicado en Hugging Face por la organización MEDHEB. Se basa en la arquitectura Qwen3-VL con aproximadamente 2.100 millones de parámetros (2.127.532.032 según los metadatos de safetensors) y está diseñado para tareas de recuperación de información (retrieval) sobre imágenes médicas 2D, volúmenes 3D (TC y RM) y texto biomédico. El repositorio se acompaña de MedHEB-Bench, un benchmark multimodal médico que abarca radiología, patología, dermatología y otros dominios, con más de 100.000 registros entre conjuntos de test y datos de entrenamiento.

La relevancia de este modelo radica en la escasez de modelos de embeddings multimodales específicos para imágenes médicas: la mayoría de los embeddings de propósito general (CLIP, SigLIP, modelos tipo E5-V) rinden por debajo de lo esperado en imágenes clínicas como radiografías de tórax, TC abdominales o cortes histopatológicos. MedEmb-2B aborda ese hueco permitiendo búsqueda semántica imagen-imagen, imagen-texto y texto-texto en entornos clínicos y de investigación.

Cabe señalar que la model card disponible es principalmente la documentación del benchmark asociado (MedHEB-Bench), y que la información técnica detallada sobre el procedimiento de entrenamiento del modelo (tokens, datos exactos, método de alineación) no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (base multimodal vision-language) |
| Parametros totales | 2.127.532.032 (≈ 2,13 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, 4,3 GB de repo, lo que sugiere precisión media tipo bf16/fp16) |
| Idiomas soportados | inglés (en) |
| Licencia | other — mixed-source-licenses (ver LICENSE en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-VL, una familia de modelos vision-language basada en transformer con un codificador visual acoplado al modelo de lenguaje. A partir de esa base, MedEmb-2B se adapta para producir embeddings multimodales adecuados a tareas de recuperación en el dominio médico, cubriendo tres modalidades de tarea: imágenes 2D (radiografías, TC axiales/coronales/sagitales, RM, dermatoscopía, OCT, histopatología, citología sanguínea), volúmenes 3D (TC-RATE, MRNet) y texto biomédico (por ejemplo, PublicHealthQA).

Los datos de entrenamiento se distribuyen en formato JSONL estilo chat dentro del propio repositorio (configuraciones `2D-train`, `3D-train` y `Text-train`), con registros que combinan una instrucción de sistema ("Represent the given image with the following question:"), una imagen y una respuesta positiva, lo que indica un entrenamiento contrastivo con pares consulta-documento positivos. El número exacto de tokens, la composición completa del corpus y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de embeddings multimodales para imágenes médicas 2D (radiografía de tórax, RM cerebral, dermatología, OCT, patología colon, células sanguíneas, TC abdominal).
- Generación de embeddings para volúmenes 3D (TC y RM musculoesquelético).
- Generación de embeddings para texto biomédico y preguntas de salud pública.
- Recuperación imagen-imagen por categoría semántica (por ejemplo, "Find the same category image with the provided image:").
- Recuperación imagen-texto y texto-imagen mediante instrucciones de consulta (query instructions).
- Respuesta a preguntas visuales médicas (VQA médico) como tarea auxiliar de representación, según los ejemplos de entrenamiento (gravedad de retinopatía diabética, hallazgos en radiografías).
- Soporte de tool calling, agentes y thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo está documentado solo en inglés.

## Casos de uso

- Busqueda semantica en PACS y archivos de imagen clinica: dada una radiografia de tórax de consulta, el modelo recupera imágenes de la misma categoría o con hallazgos similares, útil para radiólogos que buscan casos comparables.
- Deteccion de duplicados y curacion de datasets medicos: los embeddings permiten identificar imágenes redundantes o mal etiquetadas en grandes colecciones (por ejemplo, datasets tipo CheXpert o MIMIC-CXR) antes de entrenar otros modelos.
- Recuperacion aumentada (RAG) multimodal en aplicaciones clinicas: indexar imágenes 2D y 3D junto con informes en una base vectorial para que un LLM posterior responda preguntas con evidencia visual recuperada.
- Clasificacion zero-shot o few-shot por similitud: categorizar imágenes dermatoscópicas o histopatológicas comparándolas con ejemplos anotados, sin reentrenar un clasificador específico.
- Investigacion en benchmarks medicos: MedHEB-Bench proporciona conjuntos de test y train estandarizados (2D, 3D y texto) para evaluar y comparar modelos de embeddings médicos de forma reproducible.
- Agrupamiento (clustering) y visualizacion de colecciones medicas: proyectar embeddings de imágenes de TC abdominal o cortes de OCT para explorar distribuciones de patologías en estudios retrospectivos.
- Vinculacion imagen-informe: recuperar el informe textual asociado a una imagen (tarea MIMIC-CXR-Report) para entrenamiento de modelos de reporte radiológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el benchmark MedHEB-Bench como material de evaluación, pero la model card no recoge métricas numéricas del modelo (Recall@k, nDCG, MMLU, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,13 B de parámetros en precisión media (bf16/fp16), aproximadamente 4,5–6 GB solo para los pesos; en cuantización de 4 bits (si se dispone de ella) en torno a 2–3 GB. Cifras exactas no disponibles.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más de VRAM debería ser suficiente para inferencia (RTX 3060, RTX 4060 Ti, RTX 4090); para evaluar el benchmark completo o entrenar, GPUs de gama datacenter tipo A100 o H100 son recomendables.
- Cabe con holgura en GPUs de consumo modernas de 8–12 GB; no se requieren configuraciones multi-GPU para inferencia.
- Opciones de despliegue: al ser un modelo de embeddings basado en Qwen3-VL en safetensors, es compatible con librerías como transformers, vLLM (soporte de modelos de embeddings multimodales) y posibles adaptaciones en llama.cpp u Ollama; el nivel de soporte concreto no está documentado en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Dominio | Licencia |
|---|---|---|---|---|
| MedEmb-2B (MEDHEB) | ≈ 2,13 B | Imagen 2D/3D + texto | Médico (radiología, patología, dermatología) | other (mixed-source-licenses) |
| MedGemma-4B (Google) | 4 B | Imagen + texto | Médico | Licencia propia de Google, restricciones de uso |
| BiomedCLIP (Microsoft) | ≈ 0,4 B | Imagen + texto | Biomédico | MIT (código), datos con licencias variadas |
| E5-V / embeddings generales tipo SigLIP | 0,4–8 B | Imagen + texto | Propósito general | Apache 2.0 / variadas |

MedEmb-2B se distingue por su cobertura explícita de volúmenes 3D (TC y RM), algo poco habitual incluso entre modelos médicos, y por incluir un benchmark público (MedHEB-Bench) con datos de train y test separados. Frente a BiomedCLIP, ofrece una base más moderna (Qwen3-VL) y mayor capacidad; frente a MedGemma, es un modelo de embeddings y no un modelo generativo.

## Limitaciones y advertencias

- Licencia "other" con nombre mixed-source-licenses: el uso comercial puede estar restringido; además, varios datasets de imagen del benchmark (MIMIC-CXR, CheXpert-Plus, Chest-ImaGenome, VinDr, CT-RATE, MRNet) no se redistribuyen por restricciones de sus licencias originales y deben obtenerse por separado tras aceptar sus acuerdos de uso (PhysioNet, Stanford).
- Idioma limitado al inglés; no hay soporte documentado para castellano u otras lenguas.
- Riesgo de alucinación y errores clínicos: al ser un modelo de embeddings para retrieval, los errores se manifiestan como recuperaciones irrelevantes; no debe usarse para diagnóstico sin validación clínica.
- Sesgos: los datasets de entrenamiento proceden mayoritariamente de cohortes hospitalarias de EE. UU. y Asia (MIMIC, CheXpert, VinDr, MNIST médicos), por lo que pueden existir sesgos demográficos, de equipo de adquisición y de prevalencia de patologías.
- Información técnica incompleta: la model card no documenta longitud de contexto, método de entrenamiento detallado ni resultados de evaluación, lo que dificulta la evaluación previa a adopción.
- Descargas muy bajas (37) y comunidad mínima (1 like): falta de validación por terceros y posible inmadurez del modelo.
- El benchmark completo pesa 4,3 GB y requiere descargar datasets externos para reproducir todas las tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MEDHEB/MedEmb-2B
- Muestra del benchmark MedHEB-Bench: https://huggingface.co/datasets/MEDHEB/MedHEB-Bench_Sample
- MIMIC-CXR (PhysioNet): https://physionet.org/content/mimic-cxr/2.1.0/
- ISIC-2019: https://challenge.isic-archive.com/data/#2019
- Brain-Tumor-MRI (Kaggle): https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
- MedMNIST (Zenodo): https://zenodo.org/records/10519652
- Kvasir (Simula): https://datasets.simula.no/kvasir/
- Paper, blog o repositorio de código: no disponibles en la información proporcionada.
