# alessandro54/pettrace-reid-e5

## Resumen

PetTrace Re-ID E5 es un artefacto de investigación para la re-identificación (Re-ID) de perros y gatos en régimen de conjunto abierto (open-set). Lo desarrolla el autor independiente alessandro54 como parte de su tesis, y se publica bajo el paraguas del paquete `pettrace-ml`. El modelo no es un transformer generativo, sino un pipeline de extracción de características visuales orientado a recuperación por similitud: dada una foto de un animal, produce un embedding de 512 dimensiones que permite buscar coincidencias en una galería de identidades conocidas.

El sistema combina un detector YOLOv8n, un codificador CLIP ViT-B/32 adaptado con una cabeza de proyección MLP y adaptadores LoRA, y un reranker morfológico "double-gated" que solo se activa cuando los resultados Top-5 son visualmente ambiguos. La versión E5 no entrena un segundo codificador: reutiliza el pipeline visual E4 congelado y añade una capa de reordenación basada en atributos de pelaje y morfología observables, extraídos offline con Qwen3-VL-2B-Instruct.

Es relevante porque aborda un problema práctico concreto (la búsqueda de mascotas perdidas) con un enfoque reproducible y versionado de forma estricta: revisión inmutable, hashes SHA-256 de encoder y detector, semilla y época fijadas, y separación explícita entre el benchmark público y el privado. Las ganancias reportadas son modestas y el propio autor advierte que no son estadísticamente significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline: YOLOv8n (detección) + CLIP ViT-B/32 con cabeza MLP y LoRA (embedding) + reranker morfológico double-gated |
| Parametros totales | no disponible (repo de 0,4 GB; el encoder base es CLIP ViT-B/32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el VLM auxiliar Qwen3-VL-2B-Instruct no se redistribuye) |
| Licencia | AGPL-3.0 (el repositorio redistribuye YOLOv8n de Ultralytics); el código fuente PetTrace es MIT |
| Formato de pesos | ONNX (encoder, detector y artefactos del pipeline) |

## Arquitectura y entrenamiento

El pipeline tiene cuatro etapas. Primero, YOLOv8n localiza al animal en la imagen. Segundo, un codificador CLIP ViT-B/32 adaptado —con una cabeza de proyección MLP y adaptadores LoRA— genera un embedding L2-normalizado de 512 dimensiones. Tercero, la similitud coseno ordena las identidades de la galería usando agregación de máxima similitud por foto (maximum photo aggregation). Cuarto, E5 abre una compuerta de reranking solo para resultados Top-5 visualmente ambiguos y aplica puntuaciones de compatibilidad calculadas sobre un vocabulario cerrado de atributos observables de pelaje y morfología.

La innovación de E5 es precisamente esa doble compuerta: el reranker no se ejecuta por defecto, sino solo cuando la incertidumbre visual lo justifica, lo que limita el daño potencial sobre aciertos ya correctos. Los atributos morfológicos se obtuvieron offline con Qwen3-VL-2B-Instruct (revisión `89644892...`), que recibió únicamente recortes YOLO congelados, sin nombres de fichero, carpetas, IDs ni metadatos de identidad. Los parámetros congelados del reranker son `tau_v=0.01`, `lambda=0.02` y `tau_t=0.05`. Los umbrales se seleccionaron exclusivamente sobre la partición pública de validación; las particiones públicas v2 y PetTrace v6 se leyeron una sola vez tras el congelado. El artefacto está versionado con semilla 46 y época seleccionada 27, encoder SHA-256 `aaa922be...` y detector SHA-256 `da8f9b9e...`.

## Capacidades

- Extracción de características visuales para re-identificación de gatos y perros en régimen open-set.
- Generación de embeddings de 512 dimensiones L2-normalizados aptos para búsqueda por similitud coseno.
- Detección y localización del animal dentro de la imagen mediante YOLOv8n.
- Ranking de identidades de galería con agregación de máxima similitud por foto.
- Reranking morfológico condicional sobre atributos de pelaje y morfología observables.
- Calibración reproducible: configuración inmutable, hashes de componentes y revisiones de dataset registradas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo lingüístico.
- No se documentan capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Búsqueda asistida de mascotas perdidas: el pipeline permite indexar una galería de animales y recuperar candidatos por similitud visual; el reranking condicional mejora el orden de los Top-5 en casos ambiguos sin degradar el resto.
- Herramientas de refugio y adopción: generar embeddings de los animales disponibles para agrupar fotos del mismo individuo tomadas en sesiones distintas y evitar duplicados en el catálogo.
- Monitorización de colonias felinas: identificar individuos recurrentes en imágenes de cámaras trampa, con revisión humana de los candidatos propuestos.
- Investigación en re-identificación animal: servir de baseline reproducible y versionado para comparar variantes de encoder, agregación o reranking sobre los datasets públicos refinados.
- Evaluación de técnicas de reranking ligero: el diseño double-gated y su calibración congelada permiten estudiar el compromiso entre rescates y daños en rankings ya correctos.
- Sistemas de verificación asistida: proponer candidatos a un operador humano en flujos de confirmación manual, nunca como prueba biométrica autónoma.

## Benchmarks y rendimiento

| Dataset | Condición | Rank-1 | Rank-2 | Rank-5 | mAP | Gate | Rescued | Damaged |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Public v2 | E4 baseline | 85,56% | 96,03% | 99,28% | 0,8345 | 0,00% | 0 | 0 |
| Public v2 | Double-gated E5 | 85,92% | 96,03% | 99,28% | 0,8346 | 13,72% | 4 | 3 |
| PetTrace v6 | E4 baseline | 86,25% | 94,22% | 99,00% | 0,7333 | 0,00% | 0 | 0 |
| PetTrace v6 | Double-gated E5 | 87,45% | 94,62% | 99,00% | 0,7346 | 12,75% | 8 | 2 |

Los cambios pareados en Rank-1 son exploratorios: los p-valores exactos bilaterales de McNemar son 1,000 para Public v2 y 0,109 para PetTrace v6, por lo que el autor no reclama significación estadística.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,4 GB en ONNX, por lo que la inferencia del pipeline visual es ligera y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del artefacto, cualquier GPU con al menos unos pocos GB de VRAM debería bastar para el encoder y el detector.
- Cabe en GPU de consumo: sí, a tenor del tamaño del bundle ONNX (0,4 GB), aunque no se detallan requisitos mínimos.
- Opciones de despliegue: el paquete `pettrace-ml` (versión 0.2.46) con `download_model` y `load_model`; los pesos en ONNX permiten ejecución con ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rank-1 reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PetTrace Re-ID E5 | Pipeline Re-ID (YOLOv8n + CLIP ViT-B/32 + reranker) | no disponible (repo 0,4 GB) | no aplica | 85,92% (Public v2) / 87,45% (PetTrace v6) | AGPL-3.0 | Hugging Face, revisión inmutable |
| PetTrace E4 baseline | Pipeline Re-ID (sin reranker) | no disponible | no aplica | 85,56% (Public v2) / 86,25% (PetTrace v6) | AGPL-3.0 | Incluido en el mismo repo |
| openai/clip-vit-base-patch32 | Encoder visión-lenguaje genérico | no disponible en la información | no aplica | no disponible para Re-ID animal | MIT (según el modelo base referenciado) | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | VLM generativo usado offline para atributos | 2B (según nombre) | no disponible | no aplica (no es Re-ID) | no disponible en la información | Hugging Face |

No se dispone de comparaciones con otros sistemas de re-identificación animal en la información proporcionada.

## Limitaciones y advertencias

- No es prueba biométrica de identidad y no debe disparar de forma autónoma decisiones de propiedad, aplicación de la ley, médicas o de seguridad.
- El rendimiento puede degradarse con localización deficiente, oclusión, cambios severos de pose, apariencias raras y animales visualmente similares.
- Las ganancias de E5 sobre E4 son pequeñas y no estadísticamente significativas (McNemar p=1,000 en Public v2 y p=0,109 en PetTrace v6).
- El reranker puede dañar aciertos previos: se reportan 3 casos dañados en Public v2 y 2 en PetTrace v6.
- La licencia del repositorio es AGPL-3.0 por redistribuir YOLOv8n de Ultralytics; el uso comercial queda sujeto a esa licencia y a las de los componentes upstream (CLIP, Qwen3-VL).
- El benchmark privado PetTrace v6 no se redistribuye; solo se publican métricas agregadas, lo que limita la verificación externa.
- Los datos de atributos, puntuaciones por consulta, nombres de fichero y etiquetas de identidad se excluyen deliberadamente del artefacto.
- No hay paper citable ni DOI de archivo todavía; la citación debe hacerse por revisión inmutable, commit fuente y revisiones de dataset.
- No se documentan sesgos específicos ni cobertura geográfica o de razas del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alessandro54/pettrace-reid-e5
- Commit fuente: https://github.com/alessandro54/pettrace-ml/commit/2d77426a0173ca7dd6e143936c47a429a97cf78d
- Notebook de reproducción de E5: https://github.com/alessandro54/pettrace-ml/blob/2d77426a0173ca7dd6e143936c47a429a97cf78d/notebooks/e5_language_reranking.ipynb
- Modelo base del encoder: https://huggingface.co/openai/clip-vit-base-patch32
- VLM auxiliar de atributos: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de gatos: https://huggingface.co/datasets/alessandro54/labeled-cats-in-the-wild-refined
- Dataset de perros: https://huggingface.co/datasets/alessandro54/dogs-of-the-world-refined
