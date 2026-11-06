# amorsi/micro-sam-vit-b-lm

## Resumen

`amorsi/micro-sam-vit-b-lm` es un espejo (mirror) del checkpoint preentrenado `vit_b_lm` del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics. No se trata de un modelo de lenguaje pese al sufijo `lm` en el nombre: es un modelo de segmentación de imágenes biomédicas basado en la arquitectura Segment Anything (SAM) con un backbone ViT-B (Vision Transformer Base). El repositorio es una copia sin modificar de los pesos originales, con hashes xxh128 que coinciden con el registro oficial de micro-sam.

El modelo resuelve el problema de la segmentación interactiva y automática de estructuras celulares y subcelulares en imágenes de microscopía, un dominio donde los SAM genéricos rinden por debajo de lo esperado por la diferencia de distribución respecto a imágenes naturales. micro-sam adapta SAM mediante fine-tuning sobre datos de microscopía, y este checkpoint `vit_b_lm` corresponde a una de las variantes afinadas disponibles en el registro del proyecto.

Es relevante para investigadores en biología computacional e imagen médica que necesiten un segmentador listo para usar con la librería micro-sam, sin tener que descargar manualmente los pesos desde los servidores del EBI. El tamaño del repositorio es de 0,4 GB, coherente con un ViT-B más el decoder de máscaras. No se dispone de información sobre licencia específica de los pesos en la model card, que remite a la fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) con backbone ViT-B y decoder de máscaras |
| Parametros totales | no disponible (repo de 0,4 GB; coherente con ViT-B ~90M + decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en la model card; se remite a la fuente original (código micro-sam MIT) |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Segment Anything: un encoder de imagen basado en Vision Transformer (ViT-B) que genera embeddings de la imagen, y un decoder ligero que, a partir de prompts (puntos, cajas o máscaras), produce máscaras de segmentación. En micro-sam, el checkpoint `vit_b_lm` corresponde a una variante afinada sobre datos de microscopía, orientada a la segmentación de estructuras celulares y subcelulares. El sufijo `lm` hace referencia a la variante de fine-tuning dentro del registro de micro-sam, no a un modelo de lenguaje.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un modelo de segmentación). La model card indica que es una copia sin modificar de los pesos originales y que los hashes xxh128 coinciden con el registro en `util.py` del repositorio de micro-sam, lo que garantiza la integridad respecto a la fuente.

## Capacidades

- Segmentación de imágenes de microscopía mediante prompts: puntos positivos/negativos, cajas delimitadoras y máscaras de entrada.
- Segmentación automática de estructuras celulares y subcelulares (núcleos, membranas, orgánulos) en imágenes de microscopía óptica y electrónica, según el dominio de entrenamiento de micro-sam.
- Generación de máscaras de alta calidad a partir de prompts escasos, gracias al paradigma promptable de SAM.
- Integración directa con la librería micro-sam usando `model_type="vit_b_lm"`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio.

## Casos de uso

- Segmentación de núcleos celulares en imágenes de microscopía de fluorescencia: el modelo recibe puntos o cajas sobre cada núcleo y devuelve máscaras precisas, lo que permite cuantificar número y morfología celular en experimentos de alto rendimiento.
- Análisis de imágenes de microscopía electrónica en biología estructural: con prompts de caja sobre regiones de interés, el modelo genera máscaras de estructuras subcelulares para pipelines de morfometría.
- Anotación asistida en flujos de etiquetado: investigadores que generan datasets de segmentación pueden usar el modelo para preanotar imágenes y corregir manualmente, reduciendo el tiempo de anotación frente a la delineación desde cero.
- Segmentación interactiva en herramientas de análisis de imagen: integrado en interfaces tipo napari o Fiji a través de micro-sam, permite al usuario hacer clic sobre una región y obtener la máscara al instante.
- Control de calidad en experimentos de imagen celular: segmentación automática por lotes para detectar anomalías morfológicas o artefactos de preparación en grandes volúmenes de imágenes.
- Investigación reproducible: al ser un mirror con hashes verificados, permite fijar la versión exacta de los pesos en entornos de cómputo científico y reproducir resultados de segmentación entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un ViT-B con decoder de SAM suele requerir del orden de 2-6 GB en FP32 y menos en FP16, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint (0,4 GB) es plausible su ejecución en GPUs de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la vía documentada es la librería micro-sam con `model_type="vit_b_lm"`; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_b_lm (este) | SAM + ViT-B | no disponible | no aplica | no disponible (remite a fuente original) | Hugging Face (mirror) |
| SAM original (vit_b) | SAM + ViT-B | ~90M + decoder | no aplica | Apache 2.0 (según Meta) | Amplia |
| micro-sam vit_l / vit_h | SAM + ViT-L/H | no disponible | no aplica | remite a fuente original | Registro micro-sam |
| Cellpose | U-Net específico | no disponible | no aplica | BSD-3 (según repositorio) | Amplia |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Es un mirror no oficial: la licencia de los pesos no está declarada en la model card y se remite a la fuente original; verificar los términos antes de uso comercial.
- Modelo de segmentación de imágenes, no de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- El rendimiento está acotado al dominio de microscopía sobre el que se afinó; en imágenes naturales o médicas fuera de distribución puede degradarse.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datasets biomédicos concretos puede presentar sesgos hacia tipos celulares, modalidades de imagen o condiciones de adquisición sobrerrepresentadas en el entrenamiento.
- Riesgo de máscaras incompletas o falsos positivos en imágenes con bajo contraste, artefactos o estructuras solapadas; se recomienda validación humana en contextos críticos.
- No se dispone de información sobre cuantizaciones soportadas ni sobre latencia en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja un uso muy limitado y ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-04) aparece en el futuro respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/amorsi/micro-sam-vit-b-lm
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de pesos en `util.py`: https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/diplomatic-bug/1.2/files/vit_b.pt
- Pesos `decoder.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/diplomatic-bug/1.2/files/vit_b_decoder.pt
