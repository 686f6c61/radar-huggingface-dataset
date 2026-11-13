# KRMayD/tasa-brain-mri-td-v1-train5133-50ep

## Resumen

El modelo `KRMayD/tasa-brain-mri-td-v1-train5133-50ep`, denominado TD-v1 en la documentación del autor, es un checkpoint de ajuste fino de BiomedCLIP orientado a la clasificación de imágenes de resonancia magnética cerebral (MRI) con y sin tumor. Lo desarrolla el usuario KRMayD y se apoya en el backbone `microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224`, un modelo vision-lenguaje biomédico con codificador visual ViT-B/16 a 224 píxeles y codificador de texto PubMedBERT con contexto de 256 tokens. La innovación declarada es un mecanismo de *Token Dropping* guiado por máscara de verdad terreno (GT), que elimina parches de la imagen positiva durante el entrenamiento para construir negativos sintéticos.

El checkpoint corresponde a un reentrenamiento sobre un subconjunto depurado de 5.133 imágenes (frente a las 12.644 del modelo previo del mismo autor), tras eliminar duplicados cercanos respecto al banco de test de Figshare y descartar por completo la fuente `tumor_19_mask`. El artefacto es un checkpoint completo de entrenamiento OpenCLIP (2,4 GB, fichero `epoch_50.pt`) con estado del modelo, optimizador y scaler, no un repositorio `AutoModel` cargable directamente.

Su relevancia es acotada y experimental: se publica como artefacto de reproducibilidad de una receta de entrenamiento concreta, con métricas de embeddings registradas (AUROC macro del 78,24 % y FPR95 macro del 68,51 %) sobre una evaluación que mezcla imágenes reales con negativos sintéticos generados por el propio mecanismo de Token Dropping. No es un modelo listo para producción ni un clasificador clínico validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP bimodal (ViT-B/16 visual + PubMedBERT textual), ajuste fino con Token Dropping |
| Parámetros totales | no disponible (checkpoint de 2.351.280.334 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (codificador de texto, heredado de BiomedCLIP) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el texto de entrenamiento son captions en inglés, según la receta) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint completo de OpenCLIP con `state_dict` anidado, optimizador y scaler) |

## Arquitectura y entrenamiento

El modelo parte de BiomedCLIP, un CLIP bimodal con codificador visual ViT-B/16 a resolución 224 y codificador de texto PubMedBERT de 256 tokens. Sobre esa base se aplica un ajuste fino completo (ambos codificadores entrenables) durante 50 épocas, con semilla 12, batch de 32, AdamW con learning rate 5e-7, betas (0,9, 0,98), weight decay 0,01, scheduler coseno, 10 pasos de warmup y precisión mixta (AMP). La pérdida es `Tasa50Loss` de cuatro términos con pesos fijos que suman 1 ([0,1573395, 0,3193249, 0,2692807, 0,2540549]), y se emplea un modelo de referencia congelado con márgenes relativos a dicha referencia.

La innovación técnica es el *Token Dropping*: el negativo sintético (I-) se construye a partir de la imagen positiva y su máscara GT eliminando parches nativos de 16x16 que contengan al menos 10 píxeles de primer plano procesados. La eliminación se realiza después del *positional embedding*, preservando el token CLS y las posiciones de los tokens retenidos, y se mantiene el comportamiento original de cero descartes. Los datos de entrenamiento son 5.133 imágenes (4.886 glioma, 233 meningioma, 14 pituitary) procedentes de BRISC (247 de 4.695 retenidas) y de la serie BraTS (4.886 de 4.886), con exclusión total de las 3.063 imágenes de `tumor_19_mask`. No se certifica independencia por paciente, estudio o volumen, y no se redistribuyen imágenes ni captions.

## Capacidades

- Codificación conjunta imagen-texto en el dominio biomédico, heredada de BiomedCLIP.
- Clasificación binaria tumor / no tumor sobre MRI cerebral mediante similitud coseno en espacio de embeddings (evaluador One-vs-Rest).
- Generación de negativos sintéticos por Token Dropping guiado por máscara GT durante el entrenamiento.
- Ajuste fino completo de codificadores visual y textual (no solo proyección).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión general, audio): únicamente visión biomédica; sin segmentación reportada para este checkpoint.

## Casos de uso

- Investigación en clasificación de MRI cerebral: el checkpoint sirve como referencia reproducible para comparar la receta TD-v1 frente a CLIP y CLIP-Refine en el mismo banco de evaluación (Figshare, 3.064 imágenes).
- Estudio de Token Dropping como aumento de datos: permite analizar cómo afecta la eliminación de parches guiada por GT a la separabilidad de embeddings tumor/no tumor.
- Reproducción de experimentos: el autor publica el ZIP de código con 159 checksums y SHA256 del archivo, lo que facilita replicar el entrenamiento con la implementación OpenCLIP correspondiente.
- Evaluación de sensibilidad al filtrado de datos: al comparar con el modelo de 12.644 imágenes, permite medir el impacto de eliminar duplicados cercanos y la fuente `tumor_19_mask`.
- Extracción de embeddings para *retrieval* imagen-texto biomédico: reutilizando el codificador visual y textual en tareas de búsqueda dentro de dominios similares, con las cautelas de licencia.
- Base para *fine-tuning* posterior en subtareas oncológicas (por ejemplo, clasificación por tipo de tumor glioma/meningioma/pituitary), dado que se distribuye como checkpoint completo con optimizador.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Macro AUROC | 78,24 % |
| Macro FPR95 | 68,51 % |

Medición sobre 6.128 entradas: 3.064 imágenes originales de Figshare más 3.064 negativos sintéticos generados por Token Dropping guiado por GT. Clases `tumor` y `no tumor`; los negativos no son imágenes clínicas normales adquiridas de forma independiente. Evaluador de similitud coseno One-vs-Rest con TPR objetivo 0,95. No se reportan resultados de segmentación para este checkpoint. No se han publicado comparativas con MMLU, HumanEval, GSM8K ni benchmarks estándar de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 2,4 GB y el backbone ViT-B/16 + PubMedBERT es de escala moderada, por lo que en FP16 cabría previsiblemente en GPUs de 8-12 GB, aunque el autor no lo confirma.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una única GPU (modelo no especificado).
- ¿Cabe en GPU de consumo? Probable, dado el tamaño del backbone, pero sin confirmación del autor.
- Opciones de despliegue: no es un repositorio `AutoModel`; requiere la implementación OpenCLIP correspondiente a TD-v1 y la configuración de modelo publicada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TD-v1 (este modelo) | no disponible (checkpoint 2,4 GB) | 256 tokens texto | AUROC macro 78,24 %; FPR95 68,51 % | no disponible | Hugging Face, `.pt` |
| BiomedCLIP base (`microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224`) | no disponible | 256 tokens texto | no disponible en esta ficha | no disponible | Hugging Face |
| CLIP / CLIP-Refine (mencionados por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que TD-v1 es independiente de los modelos de comparación CLIP y CLIP-Refine, pero no se aportan sus resultados numéricos en la información disponible.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de entrenamiento OpenCLIP con `state_dict` anidado, optimizador y scaler; requiere la implementación TD-v1 específica.
- Las métricas reportadas usan negativos sintéticos generados por el propio mecanismo de Token Dropping, no imágenes clínicas normales independientes; el AUROC puede no reflejar el rendimiento en datos reales.
- No se certifica independencia por paciente, estudio o volumen entre train y test; existe riesgo de fuga de datos.
- El conjunto de entrenamiento está muy desbalanceado (4.886 glioma frente a 233 meningioma y 14 pituitary), lo que limita la generalización a clases minoritarias.
- El filtrado de duplicados se basa en contenido de imagen; el autor advierte que no se detectaron duplicados bajo el cribado declarado, pero no es una garantía absoluta.
- Licencia no especificada: no se puede confirmar el uso comercial; además, la licencia del modelo base BiomedCLIP debe verificarse por separado.
- No se redistribuyen imágenes, captions ni datos de evaluación; la reproducibilidad completa depende de disponer de los datasets originales (BRISC, BraTS, Figshare).
- No se reportan capacidades de lenguaje general, tool calling ni agentes; el uso queda restringido al dominio de MRI cerebral.
- El autor no reclama equivalencia numérica bit a bit con el entrenamiento histórico original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRMayD/tasa-brain-mri-td-v1-train5133-50ep
- Modelo base BiomedCLIP: https://huggingface.co/microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224
- Revisión del modelo base citada: `9f341de24bfb00180f1b847274256e9b65a3a32e`
- Modelo de texto de referencia: `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`
- Artifact directo: `epoch_50.pt` (2.351.280.334 bytes) en el repositorio de Hugging Face
- Código de entrenamiento: `td_v1_brain_mri_50ep_code_20261112.zip` (SHA256 `3ce15ae2f09cad291d6465b2710cf4c759b5322ba4d532e815a0cfcf338bfb87`), no alojado en el repositorio de Hugging Face
- Configuraciones registradas: `training_config.json`, `loss_config.json`, `model_config.json`, `data_selection.json`, `embedding_evaluation.json` (en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
