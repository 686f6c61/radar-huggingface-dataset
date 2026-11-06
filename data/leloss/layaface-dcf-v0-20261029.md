# leloss/LayaFace-DCF.v0.20261029

## Resumen

LayaFace-DCF.v0.20261029 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo generativo de lenguaje ni un modelo multimodal de propósito general: es un verificador biométrico que recibe dos recortes faciales alineados y devuelve una decisión booleana de coincidencia, un logit crudo y una probabilidad calibrada de misma persona. Se construye sobre el codificador visual de `openai/clip-vit-base-patch16` mediante fine-tuning supervisado con pares sintéticos.

El modelo cuenta con 86.193.153 parámetros, incluyendo una cabeza de comparación de 393.729 parámetros. La innovación principal es su simetría formal: intercambiar las dos entradas deja el logit invariante, gracias a un diseño de características simétricas basado en diferencias absolutas y productos elemento a elemento de los embeddings. Esto lo hace adecuado para escenarios donde el orden de comparación no debe introducir sesgo.

Es relevante ahora porque explora el entrenamiento con datos puramente sintéticos (DCFace) para tareas de verificación facial, un área con fuertes restricciones de privacidad y licencias sobre datasets reales. Sin embargo, se distribuye como release preliminar de investigación, sin licencia permisiva afirmada para los pesos adaptados y con rendimiento en rostros reales claramente por debajo de baselines dedicados de reconocimiento facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/16 (CLIP) con cabeza de comparación de pares |
| Parametros totales | 86.193.153 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje; entrada de dos imágenes 112x112) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | no disponible para los pesos adaptados; implementación del proyecto Apache-2.0; CLIP original MIT |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador visual CLIP ViT-B/16 compartido, inicializado desde `openai/clip-vit-base-patch16`. Cada una de las dos imágenes de entrada (recortes faciales RGB de 112x112, redimensionados independientemente a 224x224 y normalizados con estadísticas CLIP) pasa por el mismo codificador, produciendo embeddings de class-token de 768 dimensiones tras layernorm y normalización L2. Sobre esos embeddings se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]`, que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La simetría de estas características garantiza que el logit no cambie al permutar las entradas.

El ajuste de tarea (variante F1) adapta tanto el codificador visual como la cabeza de pares, usando 8.000 identidades sintéticas de DCFace y 408.000 imágenes con pérdida binaria de entropía cruzada por pares balanceada por clase. El presupuesto registrado es de nueve épocas; este checkpoint se seleccionó en la época 7 por mínima NLL cruda en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y DCF, FLUXSynID y los cinco benchmarks de rostros reales quedaron fuera del ajuste. El bundle incluye una política de desarrollo ajustada por separado: temperatura 1,10563956641, umbral de logit crudo 1,30180048943, probabilidad `sigmoid(raw_logit / temperature)` y decisión `raw_logit >= threshold`. La temperatura se ajustó solo en Calibrate y el umbral solo en Threshold, con objetivo de FMR del 1% sobre 10.000 pares no coincidentes.

## Capacidades

- Verificación facial de pares: decide si dos recortes faciales alineados corresponden a la misma persona.
- Salida de logit crudo y probabilidad calibrada de misma persona, además de la decisión booleana.
- Simetría formal: el logit es invariante al orden de las dos entradas.
- Caché del embedding del encoder para comparaciones repetidas contra una misma referencia.
- Inferencia offline una vez descargado el bundle (la descarga solo ocurre en `snapshot_download`).
- Ejecución en CPU o en CUDA con una instalación compatible de PyTorch.
- No incluye detección ni alineación de rostros: ambas son operaciones upstream obligatorias.
- No soporta tool calling, agentes, generación de texto, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en verificación facial con datos sintéticos: permite estudiar el impacto de entrenar solo con identidades DCFace y evaluar la brecha frente a benchmarks reales, gracias a que el checkpoint expone métricas y política en `evaluation.json`.
- Estudios controlados de verificación por pares con consentimiento: el modelo está pensado para comparaciones uno a uno en entornos de investigación, donde la simetría del logit evita sesgos por orden de presentación.
- Evaluación de calibración y umbrales operativos: al incluir temperatura y umbral ajustados en particiones separadas, sirve para analizar curvas FMR/FNMR y comportamiento de probabilidades calibradas en pares balanceados.
- Prototipado de pipelines de comparación con caché de referencia: la posibilidad de cachear el embedding del encoder permite comparar muchas sondas contra una referencia fija con coste reducido.
- Análisis de robustez demográfica y de dominio: como release preliminar, es útil para medir explícitamente las carencias en cross-age (AgeDB-30, 85,15%) y cross-pose (CPLFW, 83,02%) antes de considerar cualquier sistema más serio.
- Reproducibilidad de experimentos con semilla fija: el checkpoint está atado a la semilla 20261029 y a un presupuesto de épocas concreto, lo que facilita replicar el protocolo de selección por NLL.

## Benchmarks y rendimiento

Resultados de esta semilla concreta (no son las medias de tres semillas del paper). Métricas sintéticas con la política de desarrollo incluida; ECE de diez bins sobre confianza de clase predicha. Porcentajes salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 97,87 | 97,87 | 0,77 | 3,50 | 0,9990 | 0,56 | 0,0118 |
| FLUX | 98,26 | 98,26 | 3,42 | 0,07 | 0,9996 | 2,03 | 0,0195 |

La accuracy en rostros reales usa el protocolo estándar de diez folds de cada dataset: se ajusta un umbral de score en nueve folds y se prueba en el restante. No es la accuracy del umbral sintético incluido; los pesos permanecen fijos.

| Benchmark real | Accuracy diez folds (%) |
|---|---:|
| lfw | 98,47 |
| cfp_fp | 92,70 |
| agedb_30 | 85,15 |
| calfw | 88,87 |
| cplfw | 83,02 |
| Media | 89,64 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,2 M de parámetros en fp32 el peso ronda los 0,35 GB, por lo que la huella es modesta, pero no se publican medidas de VRAM pico.
- GPU recomendadas: no disponible; el modelo soporta `device="cuda"` con una instalación compatible de PyTorch y también funciona en CPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 100 M de parámetros), aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: bundle Python personalizado (`laya_face.v2.FaceModelV2`), no compatible con `transformers.AutoModel`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros verificadores faciales en la información disponible. Como referencia interna, el propio autor indica que el modelo queda por debajo de baselines dedicados de reconocimiento facial en benchmarks reales de cross-age y cross-pose. Los benchmarks incluidos (LFW, CFP-FP, AgeDB-30, CALFW, CPLFW) permiten comparar contra la literatura estándar de verificación facial, pero esta ficha no dispone de cifras de esos baselines en la información proporcionada.

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LayaFace-DCF.v0.20261029 | 86,2 M | dos recortes 112x112 | no disponible para pesos | Hugging Face (leloss) |
| Alternativas dedicadas de verificación facial | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No aprobado para identificación biométrica en producción, decisiones autónomas adversas, vigilancia ni identificación de personas en espacios públicos.
- La política de umbral y temperatura es de desarrollo, no aprobada para despliegue; el objetivo de FMR del 1% es un punto operativo empírico, no una garantía.
- Las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias y validación propios.
- Rendimiento claramente inferior en rostros reales con variación de edad y pose (AgeDB-30 85,15%; CPLFW 83,02%) frente a los benchmarks sintéticos.
- Robustez demográfica, detección de vida y resistencia a ataques de presentación no establecidas.
- Requiere recortes faciales ya alineados de 112x112; los recortes inválidos provocan error en inferencia ordinaria.
- Un emparejamiento visual no establece implicación criminal ni asociación adversa alguna.
- El ajuste solo con datos sintéticos no implica que el preentrenamiento CLIP ni el generador sintético no hayan visto fotografías reales.
- Licencia de los pesos adaptados no verificada: el CLIP original es MIT y la implementación del proyecto Apache-2.0, pero no se afirma permiso comercial para estos pesos.
- En CPLFW, una imagen constante aparece en 13 pares que la evaluación compartida cuenta como no coincidencias.
- No es un `transformers.AutoModel`: requiere revisar el código Python incluido antes de importarlo.

## Enlaces

- Hugging Face: https://huggingface.co/leloss/LayaFace-DCF.v0.20261029
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP (referenciado en tags): https://arxiv.org/abs/2103.00020
- Paper DCFace (referenciado en tags): https://arxiv.org/abs/2304.07060
- Paper de calibración (referenciado en tags): https://arxiv.org/abs/1706.04599
