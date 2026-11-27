# mayankkeshari/vib-zscir

## Resumen

VIB-ZSCIR es una colección de checkpoints para *zero-shot composed image retrieval* (ZS-CIR), la tarea de recuperar una imagen objetivo a partir de una imagen de referencia y un texto modificador. No es un modelo generativo ni un LLM: son pequeños mappers de pseudo-tokens (460.032 parámetros) que transforman el embedding de imagen de un CLIP ViT-L/14 congelado en un pseudo-token que el codificador de texto de CLIP compone con la modificación textual. Lo desarrolla Mayank Keshari como material de reproducibilidad del artículo "Information, Not Geometry: A Variational Information Bottleneck for Zero-Shot Composed Image Retrieval".

La aportación técnica es sustituir el mapper determinista habitual por un *variational information bottleneck* (VIB), que limita cuánta información sobre la imagen de referencia concreta codifica el pseudo-token. El entrenamiento usa aproximadamente 4 millones de imágenes de CC12M con sus captions sin usar, sin tripletas de composed retrieval y sin ningún LLM auxiliar, lo que reduce la dependencia de datos anotados.

El checkpoint principal (`main/vib_beta0.1.pt`) alcanza 13,22 mAP@10 en el test de CIRCO, frente a 11,39 del baseline determinista, una mejora de 1,83 puntos. El repositorio tiene 18 ficheros de unos 40 MB en total, cada uno con solo el mapper (no incluye los pesos de CLIP, que deben descargarse por separado desde `openai/CLIP`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mapper de pseudo-tokens (VIB o determinista) sobre CLIP ViT-L/14 congelado |
| Parámetros totales | 460.032 (solo el mapper; CLIP ViT-L/14 se carga aparte) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (checkpoints en punto flotante PyTorch) |
| Idiomas soportados | no disponible (el texto modificador se procesa con el encoder de CLIP ViT-L/14) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, `state_dict` del mapper + configuración) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo sino un mapper ligero acoplado a CLIP ViT-L/14. Dado un par (imagen de referencia, texto modificador), el mapper proyecta el embedding visual congelado de CLIP a un pseudo-word token; el encoder de texto de CLIP, también congelado, compone ese token con el texto y produce el embedding de consulta con el que se recupera la imagen objetivo. En inferencia, los checkpoints VIB usan únicamente el token medio (sin muestreo), por lo que el coste computacional coincide con el del baseline determinista: los mismos 460.032 parámetros.

El entrenamiento se realizó sobre aproximadamente 4 millones de imágenes de CC12M (`pixparse/cc12m-wds`) usando solo las imágenes, sin captions, sin tripletas de composed retrieval y sin LLM. La innovación es el *variational information bottleneck*: se añade una penalización KL (con coeficiente beta) que reduce la información que el pseudo-token retiene sobre la imagen de referencia específica. El paper especifica beta por muestra; en la implementación, el primer epoch y el run principal sumaban la KL sobre el batch de 1.024, de modo que un ajuste de 1e-4 equivale a 0,1024 por muestra (el beta = 0,1 del paper). El repositorio incluye además barridos de beta, ablaciones de remedios (margin loss, ruido aditivo, restricción de norma unitaria, penalización solo sobre la media de la KL) y experimentos de temperatura del logit scale.

## Capacidades

- Recuperación de imágenes por composición (*composed image retrieval*) en régimen zero-shot: dada una imagen de referencia y un texto modificador, devuelve la imagen objetivo.
- Composición de modificaciones textuales sobre la referencia mediante pseudo-tokens, sin necesidad de tripletas de entrenamiento específicas de la tarea.
- Control de la información retenida sobre la referencia mediante el parámetro beta del VIB (checkpoints con beta = 0, 0,1, 0,2, 0,5 y 1,0).
- Inferencia determinista (token medio) para los checkpoints VIB.
- Evaluación en CIRCO, CIRR y Fashion-IQ según el protocolo del paper.
- No soporta tool calling, agentes, generación de texto, código, matemáticas, visión generativa ni capacidades multilingües: es exclusivamente un componente de recuperación multimodal.

## Casos de uso

- Búsqueda visual en catálogos de comercio electrónico: el usuario parte de una imagen de producto y añade una modificación textual ("en azul", "con mangas largas") para recuperar variantes; el modelo compone ambas señales sin necesidad de anotaciones específicas del catálogo.
- Recomendación de moda personalizada: con Fashion-IQ como referencia de evaluación, el sistema recupera prendas similares a una imagen de referencia aplicando cambios de atributos descritos en texto.
- Búsqueda inversa mejorada en bancos de imágenes: en lugar de buscar solo por similitud visual, el usuario refina con modificaciones textuales ("mismo paisaje pero de noche"), aprovechando el entrenamiento sin tripletas.
- Moderación o deduplicación de contenido visual: recuperar imágenes similares a una referencia con variaciones descritas textualmente para localizar duplicados o contenido relacionado en grandes repositorios.
- Investigación en recuperación multimodal: servir de baseline reproducible para experimentar con information bottlenecks, barridos de beta y ablaciones de regularización sobre CLIP congelado.
- Sistemas de anotación asistida: dado un conjunto de imágenes y descripciones de cambio, recuperar candidatos para etiquetado semiautomático en pipelines de curación de datasets.
- Prototipado rápido de interfaces de búsqueda visual: al ser un mapper de 460.032 parámetros sobre CLIP congelado, se puede integrar en un servicio existente de CLIP sin reentrenar el backbone.

## Benchmarks y rendimiento

Resultados en CIRCO test mAP@10 reportados en la model card:

| Checkpoint | Descripción | CIRCO test mAP@10 |
|---|---|---|
| `main/baseline_deterministic.pt` | Baseline determinista (beta = 0) | 11,39 |
| `main/vib_beta0.1.pt` | VIB, beta = 0,1 (modelo principal, run 1) | 13,22 |
| `main/vib_beta0.1_rerun_e02s0500.pt` | VIB, beta = 0,1, run 2 independiente | 12,96 |
| `beta/vib_beta0.2_e02s3000.pt` | VIB, beta = 0,2 (mejor checkpoint de validación) | 12,38 |
| `beta_sweep_epoch0/baseline_beta0_e00.pt` | Baseline al final del epoch 0 | 11,84 |
| `beta_sweep_epoch0/vib_beta0.1_e00.pt` | VIB, beta = 0,1, final del epoch 0 | 12,43 |
| `beta_sweep_epoch0/vib_beta0.2_e00.pt` | VIB, beta = 0,2, final del epoch 0 | 12,24 |
| `beta_sweep_epoch0/vib_beta0.5_e00.pt` | VIB, beta = 0,5, final del epoch 0 | 8,28 |
| `beta_sweep_epoch0/vib_beta1.0_e00.pt` | VIB, beta = 1,0, final del epoch 0 | 4,29 |
| `remedies/baseline_margin_e01s3500.pt` | Baseline + margin loss | 12,38 |
| `remedies/baseline_noise_e00s3500.pt` | Baseline + ruido aditivo | 9,81 |
| `remedies/baseline_unitnorm_e01s2000.pt` | Baseline + restricción de norma unitaria | 10,00 |
| `remedies/baseline_klmu_only_e01s1000.pt` | Baseline + penalización solo sobre KL_mu | 7,59 |
| `temperature/baseline_tau_frozen_e00s1500.pt` | Mapper determinista, logit scale congelado (tau = 100) | 8,26 |
| `temperature/baseline_tau_free_e00s3500.pt` | Mapper determinista, logit scale aprendido sin tope | 9,64 |
| `temperature/baseline_tau_capped_e00s1500.pt` | Mapper determinista, logit scale limitado a 115 con LR alto | 6,14 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K (no aplican a este tipo de modelo). Los resultados de CIRCO test y CIRR test1 provienen de los servidores oficiales de evaluación; los de CIRCO validation y Fashion-IQ se calculan localmente.

## Requisitos de hardware

- VRAM estimada: el mapper ocupa unos 40 MB en total para los 18 checkpoints; cada checkpoint individual es de pocos MB. El coste dominante es CLIP ViT-L/14 congelado, que requiere aproximadamente 1,7 GB en fp16 solo para los pesos del encoder de imagen y texto, más activaciones.
- GPU recomendadas: el paper se ejecutó en una RTX A6000 con PyTorch 2.1.1. Cualquier GPU con al menos 8 GB de VRAM puede cargar CLIP ViT-L/14 y el mapper; una RTX 4090, A100 o H100 ofrecen margen amplio para evaluación por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, siempre que se disponga de al menos 8 GB para CLIP y el mapper.
- Opciones de despliegue: los checkpoints se cargan con `torch.load(..., weights_only=True)` y se reconstruyen con `load_model` de los scripts de evaluación del repositorio (`evaluation/eval_circo_v2.py`). No hay soporte directo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Los pesos de CLIP ViT-L/14 se obtienen de la release oficial `openai/CLIP`.
- Latencia y throughput: no disponibles en la información proporcionada. Al usar solo el token medio en inferencia, el coste por consulta es el de un forward de CLIP ViT-L/14 para la imagen de referencia y el texto, más una proyección del mapper de 460.032 parámetros.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros del mapper | Contexto | CIRCO test mAP@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VIB-ZSCIR (este) | Mapper VIB sobre CLIP ViT-L/14 congelado | 460.032 | no aplica | 13,22 | MIT | Hugging Face + GitHub |
| Baseline determinista del paper | Mapper determinista sobre CLIP ViT-L/14 congelado | 460.032 | no aplica | 11,39 | MIT (incluido en el repo) | Hugging Face + GitHub |
| PICa (referencia habitual en ZS-CIR) | Mapper sobre CLIP con LLM auxiliar | no disponible | no aplica | no disponible en la información proporcionada | no disponible | no disponible |
| LF-CIR (referencia habitual en ZS-CIR) | Mapper sobre CLIP | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de PICa, LF-CIR ni otros métodos ZS-CIR comparables, por lo que la comparativa cuantitativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al entrenarse sobre CC12M sin captions, puede heredar sesgos de distribución de ese dataset (principalmente imágenes web en inglés).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede recuperar imágenes incorrectas cuando la modificación textual es ambigua o cuando la referencia no está bien representada por CLIP.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; el texto modificador se procesa con el encoder de CLIP ViT-L/14, por lo que la cobertura idiomática queda limitada a la de ese encoder. No hay ventana de contexto.
- Restricciones de licencia: licencia MIT para los checkpoints del mapper; los pesos de CLIP ViT-L/14 tienen su propia licencia y deben consultarse por separado antes de uso comercial.
- Caveats para producción: el repositorio no incluye los pesos de CLIP, solo el mapper. Los checkpoints `beta/vib_beta0.5_resumed_e01s2500.pt` y `beta/vib_beta1.0_resumed_e01s1000.pt` no están al beta declarado y no se usaron en el paper. La reproducibilidad exacta depende de la plataforma: en Fashion-IQ el recall puede variar en torno a una consulta por categoría por la presencia de imágenes duplicadas o casi duplicadas en las galerías. El protocolo de evaluación elimina la imagen de referencia del ranking en CIRCO y CIRR, pero la mantiene en Fashion-IQ, lo que afecta a la comparación con otros trabajos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mayankkeshari/vib-zscir
- Repositorio de código: https://github.com/mk-44/vib-zscir
- Modelo base CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Release oficial de CLIP (OpenAI): https://github.com/openai/CLIP
- Dataset CC12M (pixparse): https://huggingface.co/datasets/pixparse/cc12m-wds
- Paper: "Information, Not Geometry: A Variational Information Bottleneck for Zero-Shot Composed Image Retrieval" (Mayank Keshari); enlace directo no disponible en la información proporcionada.
