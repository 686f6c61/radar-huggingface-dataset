# leloss/LayaFace-DCF-HSF.v0.20261028

## Resumen

LayaFace-DCF-HSF.v0.20261028 es un checkpoint de investigación para verificación facial simétrica de dos imágenes (face verification), desarrollado por el usuario leloss. No es un modelo generativo de lenguaje ni un modelo multimodal de propósito general: es un adaptador de tarea construido sobre el codificador visual de CLIP ViT-B/16, reentrenado para decidir si dos recortes faciales alineados corresponden a la misma persona. El modelo parte de `openai/clip-vit-base-patch16` y añade una cabeza de comparación de pares que produce una decisión booleana, un logit crudo y una probabilidad calibrada por temperatura.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de reutilización de un codificador vision-language preentrenado para una tarea biométrica discriminativa, con un pipeline de selección de checkpoint basado en NLL sobre particiones disjuntas de identidades. Por otro, sirve como ejemplo de las precauciones que exige el dominio: el propio autor declara que la política de umbral incluida está ajustada en desarrollo y no aprobada para despliegue, y que no se han establecido la robustez demográfica, la detección de vitalidad ni la resistencia a ataques de presentación.

El checkpoint tiene 86.193.153 parámetros (incluida una cabeza de pares de 393.729 parámetros), un tamaño de repositorio de 0,3 GB y se distribuye como bundle offline personalizado, no como `transformers.AutoModel`. La adaptación de tarea se hizo exclusivamente con datos sintéticos (DCFace y HSFace10K), lo que no implica que el preentrenamiento de CLIP ni el generador sintético hayan estado libres de fotografías reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/16 (codificador visual CLIP) con cabeza de comparación de pares GELU |
| Parametros totales | 86.193.153 (incluye cabeza de pares de 393.729) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada de dos imágenes 112x112 reescaladas a 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; la tarea es de verificación facial, no lingüística) |
| Licencia | no disponible (implementación del proyecto declarada Apache-2.0; CLIP original MIT; términos de pesos derivados y dataset sintético sin verificar) |
| Formato de pesos | safetensors (bundle personalizado con código Python propio) |

## Arquitectura y entrenamiento

El modelo comparte un único codificador visual CLIP ViT-B/16 entre las dos imágenes de entrada. Cada recorte facial alineado de 112x112 en RGB se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. De cada imagen se extrae el embedding del token de clase post-layernorm, de 768 dimensiones, que se L2-normaliza. Sobre esos dos vectores se construyen características simétricas: `[sqrt(768) * abs(a-b), 768 * (a*b)]`, es decir, 1536 dimensiones que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La simetría es explícita: intercambiar las dos entradas deja el logit invariante, lo que es una propiedad deseable en verificación de pares.

El entrenamiento de adaptación de tarea usa 15.983 identidades sintéticas de DCFace y HSFace10K, con 782.382 imágenes, y una pérdida de entropía cruzada binaria por pares con balanceo de clases. La variante F1 adapta tanto el codificador visual como la cabeza de pares retenida, con un presupuesto registrado de 4 épocas. El checkpoint se seleccionó en la época 4 por mínima NLL cruda en la partición Stop; la variante F1 se eligió por NLL media en la partición Select sobre las tres semillas de DCF, no por precisión en benchmarks. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera de la adaptación. FLUXSynID y los cinco benchmarks de caras reales son fuentes exclusivamente de test para todas las variantes.

El bundle incluye una política de desarrollo ajustada por separado: temperatura de 1,10606504034, umbral de logit crudo de 1,85080599785, probabilidad de coincidencia `sigmoid(raw_logit / temperature)` y decisión de coincidencia `raw_logit >= threshold`. La temperatura se ajustó solo en la partición Calibrate de la fuente de entrenamiento, y el umbral solo en la partición Threshold, con una tasa objetivo de falsos positivos (FMR) del 1% usando 20.000 pares no coincidentes. El autor advierte que ese 1% es un punto operativo empírico de desarrollo y no una garantía sobre otras poblaciones.

## Capacidades

- Verificación facial de pares: dado dos recortes faciales alineados de 112x112 en RGB, devuelve una decisión booleana de coincidencia, un logit crudo y una probabilidad de misma persona calibrada por temperatura.
- Simetría de entrada: el logit no cambia al intercambiar las dos imágenes, lo que permite usar el modelo en cualquier orden de comparación.
- Embeddings reutilizables: la representación del codificador puede cachearse para comparaciones repetidas contra una misma referencia, lo que reduce el coste en escenarios de uno-a-muchos controlados.
- Inferencia en CPU y CUDA: el código de ejemplo soporta `device="cpu"` y `device="cuda"` con una instalación compatible de PyTorch CUDA.
- Carga offline: la descarga ocurre solo en `snapshot_download`; la carga del bundle es offline.
- Gestión de recortes inválidos: los recortes inválidos lanzan un error durante la inferencia ordinaria.
- No incluye detección ni alineación de landmarks: son operaciones upstream que el usuario debe aportar.
- No es un modelo generativo, no soporta tool calling, no tiene modo de razonamiento multi-paso ni capacidades de audio o vídeo.

## Casos de uso

- Estudio controlado de verificación de pares con consentimiento: el modelo está pensado para investigaciones de verificación por pares en entornos controlados, con recortes alineados y población conocida, usando la probabilidad calibrada como señal auxiliar y no como decisión final.
- Evaluación comparativa de pipelines de alineación facial: al requerir recortes de 112x112 ya alineados, sirve para medir cómo afecta la calidad de la detección y el alineamiento upstream a la precisión de verificación, manteniendo fijos los pesos del modelo.
- Prototipado de sistemas de control de acceso con revisión humana: la salida de logit crudo y probabilidad permite fijar umbrales conservadores y derivar los casos dudosos a un revisor humano cualificado, con salvaguardas legales y organizativas.
- Investigación sobre calibración en biometría: el bundle incluye temperatura y umbral ajustados en particiones separadas, lo que facilita reproducir experimentos de calibración (ECE, Brier) y comparar políticas de umbral a FMR fijo del 1%.
- Análisis de robustez demográfica en laboratorio: los benchmarks de caras reales (LFW, CFP-FP, AgeDB-30, CALFW, CPLFW) permiten estudiar la degradación de precisión entre conjuntos y edades, siempre como test y no como validación de despliegue.
- Docencia y reproducción de experimentos: al ser un bundle offline con código Python incluido y métricas legibles en `evaluation.json`, es adecuado para cursos y trabajos de reproducción sobre adaptación de CLIP a tareas discriminativas.
- Auditoría de sesgos en datos sintéticos: al entrenarse solo con DCFace y HSFace10K, permite estudiar la transferencia de datos sintéticos a caras reales y documentar las brechas observadas entre dominios.

## Benchmarks y rendimiento

Los resultados publicados corresponden a esta semilla concreta, no a las medias de tres semillas del paper. Las métricas sintéticas usan la política de desarrollo incluida. ECE es la entropía cruzada de calibración de confianza predicha en diez bins. Los porcentajes se expresan en tanto por ciento salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 97,90 | 97,90 | 1,00 | 3,20 | 0,9986 | 0,51 | 0,0126 |
| FLUX | 97,74 | 97,74 | 4,51 | 0,00 | 0,9998 | 3,26 | 0,0290 |

La precisión en caras reales usa el protocolo estándar de diez pliegues de cada dataset: se ajusta un umbral de puntuación en nueve pliegues y se prueba en el restante. No es la precisión del umbral operativo sintético incluido. Los pesos del modelo permanecen fijos durante todo el proceso.

| Benchmark real | Accuracy diez pliegues (%) |
|---|---:|
| lfw | 98,73 |
| cfp_fp | 93,17 |
| agedb_30 | 88,23 |
| calfw | 90,30 |
| cplfw | 84,10 |
| Media | 90,91 |

Nota del autor: una imagen constante de CPLFW aparece en 13 pares, y la evaluación compartida cuenta esos pares como no coincidencias. Las predicciones de benchmark se sellaron antes de puntuar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 86,2 millones de parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 0,34 GB; en fp16, unos 0,17 GB. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no disponible. El modelo es lo suficientemente pequeño como para ejecutarse en CPU para pruebas puntuales; para lotes grandes se recomienda cualquier GPU CUDA compatible con la instalación de PyTorch del usuario.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; el autor no publica requisitos mínimos ni GPU concretas verificadas.
- Opciones de despliegue: el modelo no es un `transformers.AutoModel`; se carga mediante el código Python incluido en el bundle (`laya_face.v2.FaceModelV2`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona que la representación del codificador puede cachearse para comparaciones repetidas contra una misma referencia, lo que reduce el coste en escenarios de referencia fija.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación numérica no está disponible. A continuación se comparan características estructurales con alternativas habituales de verificación facial basadas en embeddings, indicando solo lo que puede afirmarse con la información disponible.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LayaFace-DCF-HSF.v0.20261028 | 86.193.153 | Dos recortes 112x112 reescalados a 224x224 | no disponible (implementación Apache-2.0; pesos sin verificar) | Hugging Face, bundle offline | Adaptado solo con datos sintéticos; política de umbral de desarrollo |
| openai/clip-vit-base-patch16 (base) | no disponible en la información | Imagen 224x224 + texto | MIT (según el autor) | Hugging Face | Modelo base; no es un verificador facial especializado |
| Alternativas de verificación facial | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- No aprobado para producción: el autor declara explícitamente que es una release preliminar de investigación para estudios controlados y con consentimiento, y que no está aprobado para identificación biométrica en producción, decisiones adversas autónomas, vigilancia ni identificación de personas en espacios públicos.
- Política de umbral de desarrollo: la temperatura y el umbral incluidos están ajustados en desarrollo, no aprobados para despliegue. El 1% de FMR objetivo es empírico y no una garantía sobre otros datasets o poblaciones.
- Calibración para pares balanceados: las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias adecuada, validación y salvaguardas.
- Robustez no establecida: no se han establecido la robustez demográfica, la detección de vitalidad, la resistencia a ataques de presentación ni el rendimiento end-to-end en medios adversos.
- Dependencia de operaciones upstream: la detección y el alineamiento de landmarks no están incluidos; recortes mal alineados o inválidos degradan o bloquean la inferencia (los recortes inválidos lanzan error).
- Riesgo de interpretación indebida: una coincidencia visual no establece implicación criminal ni asociación adversa alguna; cualquier uso consecuente requiere revisión por parte de un humano cualificado con salvaguardas legales y organizativas.
- Datos sintéticos no equivalen a ausencia de datos reales: la adaptación solo con datos sintéticos no significa que el preentrenamiento de CLIP o el generador sintético no hayan tenido exposición a fotografías reales.
- Licencia incompleta: los términos de la release de pesos derivados y del dataset sintético quedan sin verificar; no hay una licencia permisiva confirmada para los pesos, lo que impide asumir uso comercial.
- Idiomas: la etiqueta de idioma es `en`, pero la tarea no es lingüística; no aplica soporte multilingüe en el sentido habitual.
- Sin datos de sesgo demográfico publicados: no se han publicado análisis de sesgo por género, etnia o edad en la información disponible.
- Benchmarks limitados: los resultados se refieren a pares de benchmark fijos y no establecen robustez en una nueva población de despliegue; además, la evaluación de caras reales usa un protocolo de diez pliegues distinto del umbral operativo sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leloss/LayaFace-DCF-HSF.v0.20261028
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper de CLIP (referenciado en tags): https://arxiv.org/abs/2103.00020
- Paper de DCFace (referenciado en tags): https://arxiv.org/abs/2304.07060
- Paper de calibración (referenciado en tags): https://arxiv.org/abs/1706.04599
- Repositorio de código: no disponible
- Demo: no disponible
- Blog del autor: no disponible
