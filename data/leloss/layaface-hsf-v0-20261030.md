# leloss/LayaFace-HSF.v0.20261030

## Resumen

LayaFace-HSF.v0.20261030 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo generativo de lenguaje ni un modelo multimodal de propósito general: se trata de un adaptador de verificación facial construido sobre el codificador visual de `openai/clip-vit-base-patch16`. El modelo recibe dos recortes faciales alineados de 112x112 píxeles, los procesa de forma independiente a 224x224 y emite una decisión booleana de coincidencia, un logit escalar y una probabilidad calibrada de misma persona.

La relevancia de este checkpoint es metodológica: documenta de forma explícita el proceso de adaptación de tarea (F1, adaptación completa del codificador y de la cabeza de comparación), la selección de checkpoint por partición, y una política de umbral y temperatura ajustada por separado. El modelo tiene 86.193.153 parámetros, de los cuales 393.729 corresponden a la cabeza de pares. El repositorio ocupa 0,3 GB y se distribuye como bundle offline personalizado, no como un `transformers.AutoModel`.

Se publica como versión preliminar de investigación con restricciones de uso claras: no está aprobado para identificación biométrica en producción, vigilancia ni decisiones autónomas adversas. La licencia de los pesos adaptados no está verificada, lo que limita su adopción comercial sin aclaración previa por parte del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (codificador visual compartido) + cabeza de pares MLP (1536 → 256 → 1, GELU) |
| Parámetros totales | 86.193.153 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (según metadatos; el modelo opera sobre imágenes, no texto) |
| Licencia | no disponible para los pesos adaptados; implementación del proyecto Apache-2.0; CLIP original MIT |
| Formato de pesos | safetensors, empaquetado en bundle offline personalizado (no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador visual CLIP ViT-B/16 compartido, inicializado desde `openai/clip-vit-base-patch16`. Cada una de las dos imágenes de entrada se procesa de forma independiente: recorte facial alineado de 112x112 RGB, redimensionado a 224x224 y normalización con estadísticas de CLIP. Se extraen embeddings del token de clase post-layernorm de 768 dimensiones y se normalizan en L2. Sobre esos embeddings se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]`, que alimentan una cabeza `1536 → 256 → 1` con activación GELU. La simetría está garantizada por construcción: intercambiar las dos entradas deja el logit invariante.

El entrenamiento de adaptación de tarea utiliza 7.983 identidades sintéticas HSFace10K y 374.382 imágenes, con pérdida binaria por pares balanceada por clase (pairwise binary cross-entropy). La variante F1 adapta tanto el codificador visual como la cabeza de pares retenida. El presupuesto registrado es de 8 épocas y el checkpoint se seleccionó en la época 7 por mínima NLL cruda en la partición Stop. La selección de F1 se hizo por NLL media en la partición Select sobre las tres semillas DCF, no por precisión de benchmark. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera de la adaptación. FLUXSynID y los cinco benchmarks de caras reales son fuentes solo de test.

## Capacidades

- Verificación facial de pares: dada una imagen de referencia y una imagen de sonda, devuelve decisión booleana de coincidencia, logit crudo y probabilidad de misma persona calibrada por temperatura.
- Simetría exacta en la comparación: el logit no cambia al intercambiar las dos entradas.
- Extracción de embeddings faciales de 768 dimensiones L2-normalizados, reutilizables para comparaciones repetidas contra una misma referencia (cacheables).
- Cálculo de probabilidad calibrada mediante `sigmoid(raw_logit / temperature)` con temperatura ajustada (1,44162515772).
- Decisión por umbral configurable (umbral de desarrollo: -0,879037499428, ajustado a FMR objetivo del 1%).
- Inferencia en CPU o CUDA según la instalación de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es exclusivamente un verificador facial de dos imágenes.

## Casos de uso

- Investigación controlada de verificación facial: el modelo permite estudiar el efecto de la adaptación completa del codificador frente a cabezas congeladas, gracias a que el checkpoint documenta la variante F1 y las particiones de selección.
- Evaluación de calibración y umbrales: la inclusión de temperatura y umbral ajustados por separado permite analizar curvas FMR/FNMR y ECE en condiciones reproducibles, con métricas en `evaluation.json`.
- Comparación de pipelines de alineación: al requerir recortes alineados de 112x112 como entrada, sirve para medir el impacto de distintas etapas upstream de detección y landmarks sobre la precisión final.
- Estudio de robustez demográfica en entornos de laboratorio: los benchmarks de caras reales (lfw, cfp_fp, agedb_30, calfw, cplfw) ofrecen una base para analizar disparidades por subgrupo, siempre con revisión humana y salvaguardas.
- Verificación con datos sintéticos: el uso de HSFace10K y FLUXSynID como fuentes sintéticas permite estudiar la transferencia de datos generados a caras reales en protocolos de diez pliegues.
- Prototipado de sistemas de comparación con caché de referencia: la posibilidad de cachear el embedding del encoder para comparaciones repetidas lo hace adecuado para experimentos con una referencia fija y muchas sondas.
- Análisis de simetría y estabilidad numérica: la invariancia del logit al permutar entradas permite validar implementaciones y detectar errores de preprocesado.

## Benchmarks y rendimiento

Resultados de esta semilla concreta (no medias de tres semillas del paper). Las métricas sintéticas usan la política de desarrollo incluida; los porcentajes se expresan en tanto por ciento salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 91,43 | 91,43 | 8,23 | 8,90 | 0,9717 | 3,37 | 0,0692 |
| FLUX | 85,51 | 85,80 | 28,40 | 0,00 | 0,9999 | 8,79 | 0,0911 |

Precisión en caras reales con protocolo estándar de diez pliegues (umbral ajustado en nueve pliegues y evaluado en el restante; no es la precisión del umbral sintético incluido):

| Benchmark real | Precisión diez pliegues (%) |
|---|---:|
| lfw | 98,65 |
| cfp_fp | 93,47 |
| agedb_30 | 88,98 |
| calfw | 92,58 |
| cplfw | 87,07 |
| Media | 92,15 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,2 M de parámetros en fp32 el peso ronda los 0,34 GB, y en fp16 unos 0,17 GB, más activaciones de dos pases ViT-B/16 a 224x224.
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch; el tamaño reducido permite ejecución en GPUs de gama media y en CPU para pruebas.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; el cuello de botella es el preprocesado y el doble pase del ViT, no la memoria de pesos.
- Opciones de despliegue: bundle offline propio con `FaceModelV2` (no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje). Requiere `pip install -r requirements.txt` y revisión del código Python incluido antes de importar.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el embedding del encoder puede cachearse para comparaciones repetidas contra una misma referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LayaFace-HSF.v0.20261030 | 86,2 M | dos recortes 112x112 → 224x224 | LFW 98,65%; media real 92,15% | no verificada para pesos adaptados | Hugging Face (bundle offline) |
| openai/clip-vit-base-patch16 (base) | ~86 M (ViT-B/16) | imagen 224x224 | no es verificador facial nativo | MIT | Hugging Face |
| Alternativas específicas de verificación facial | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros verificadores faciales comparables bajo el mismo protocolo, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- No aprobado para producción: es una versión preliminar de investigación para estudios controlados y con consentimiento; no debe usarse para identificación biométrica en producción, vigilancia ni identificación en espacios públicos.
- Licencia no verificada: los términos del dataset sintético y de la liberación de pesos adaptados no están confirmados; no existe licencia permisiva declarada para estos pesos, lo que bloquea el uso comercial sin aclaración.
- Sesgos demográficos no establecidos: la robustez demográfica no ha sido validada; los resultados se refieren a pares fijos de benchmark y no garantizan comportamiento en una nueva población de despliegue.
- Sin detección de vida ni resistencia a ataques de presentación: no se ha demostrado defensa frente a fotos impresas, pantallas o deepfakes.
- Dependencia de alineación upstream: la detección y los landmarks no están incluidos; entradas mal alineadas o recortes inválidos provocan error en inferencia ordinaria.
- Umbral y temperatura de desarrollo: el punto de operación a FMR del 1% es empírico y no una garantía; las probabilidades están calibradas para pares balanceados y requieren datos representativos y validación antes de cualquier uso.
- Métricas de FLUX con FMR alto (28,40%) y ECE elevado (8,79): indican desajuste de calibración en ese dominio sintético.
- Una imagen constante de CPLFW aparece en 13 pares y la evaluación compartida los cuenta como no coincidencias, lo que puede afectar la interpretación de esa métrica.
- El modelo no es un `transformers.AutoModel`: requiere revisar el código Python del bundle antes de importarlo, con implicaciones de seguridad y mantenimiento.
- Un match visual no establece implicación criminal ni asociación adversa alguna; cualquier uso consecuente exige revisión por una persona cualificada con salvaguardas legales y organizativas.

## Enlaces

- Hugging Face: https://huggingface.co/leloss/LayaFace-HSF.v0.20261030
- Modelo base CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Paper FLUXSynID (arXiv:2304.07060): https://arxiv.org/abs/2304.07060
- Paper de calibración (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
