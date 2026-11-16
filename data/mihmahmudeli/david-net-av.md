# MIHMahmudEli/david-net-av

## Resumen

DAVID-Net (Decoupled Audio-Visual Forensic Network) es un modelo de detección y atribución de deepfakes desarrollado por MIHMahmudEli, publicado en Hugging Face bajo licencia MIT. A diferencia de los detectores binarios convencionales que se limitan a clasificar un vídeo como real o falso, DAVID-Net reformula la tarea como una atribución de autenticidad en cuatro cuadrantes: identifica de forma independiente si el canal visual y el canal acústico han sido manipulados (RVRA, RVFA, FVRA, FVFA). Esto permite distinguir entre clonación de voz, manipulación facial y doble falsificación, algo relevante para forense digital y moderación de plataformas.

El modelo combina dos codificadores preentrenados: VideoMAE ViT-Base para la secuencia visual (128 tokens espaciotemporales de dimensión 768) y WavLM Base+ para la señal acústica (50 tokens de dimensión 768), unidos mediante un transformer cross-modal asimétrico con desacoplamiento geométrico de subespacios. La dimensión oculta es 768 y el repositorio ocupa 0,3 GB en formato safetensors.

Su relevancia actual radica en que aborda dos problemas abiertos en la detección de deepfakes: la tolerancia a la ausencia de una modalidad (vídeo silencioso o audio aislado) mediante tokens nulos aprendibles, y la localización temporal de los límites de manipulación a nivel de fotograma. Los resultados declarados por el autor sobre FakeAVCeleb en partición estricta disjunta por identidad reportan un AUC de clip de 0,976 y un Macro-F1 de 0,918.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-modal asimétrico (VideoMAE ViT-Base + WavLM Base+) con desacoplamiento de subespacios |
| Parametros totales | 75,6 M (Phase A, congelado); 105,5 M (Phase B, end-to-end) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de vídeo y ventanas de audio; sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal de vídeo y audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

DAVID-Net emplea una arquitectura de dos ramas desacopladas. La rama visual procesa recortes de cara alineados y recortes periorales mediante VideoMAE ViT-Base, generando 128 tokens espaciotemporales de dimensión 768. La rama acústica procesa formas de onda de voz a 16 kHz mediante WavLM Base+, produciendo 50 tokens acústicos de dimensión 768. Sobre ambas representaciones se aplica una regularización de ortogonalidad de subespacios (L_ortho = |cos(z_v, z_c^(v))| + |cos(z_a, z_c^(a))|) que evita que el modelo memorice atajos entre canales, un fallo típico en detectores que explotan la sincronización labial y fallan ante dobles falsificaciones.

El entrenamiento incorpora tres componentes adicionales: tokens nulos aprendibles (e_null^(v), e_null^(a) en R^(1×768)) que permiten inferencia con una modalidad ausente sin colapso ni aleatoriedad; sincronización temporal por ventanas mediante producto interno s_t = Ṽ_t^T Ǎ_t entrenado con InfoNCE bidireccional sobre medios auténticos; y cabezas de atribución desacopladas (H_v para veracidad visual, H_a para veracidad acústica, H_quad para los cuatro cuadrantes y H_loc para localización de límites a nivel de fotograma). El autor declara una campaña de evaluación de 160 ejecuciones sobre cinco semillas (7, 42, 123, 456, 2024) y entrenamiento sobre FakeAVCeleb, ASVspoof2019, Celeb-DF-v2, DFDC, DeepfakeTIMIT y WaveFake. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Detección de deepfakes audio-visuales con atribución en cuatro cuadrantes (RVRA, RVFA, FVRA, FVFA).
- Clasificación independiente de veracidad visual y veracidad acústica mediante cabezas separadas.
- Tolerancia a modalidad ausente: procesa vídeo silencioso o audio aislado gracias a tokens nulos aprendibles.
- Localización temporal de límites de manipulación a nivel de fotograma (H_loc).
- Sincronización audio-visual por ventanas con InfoNCE bidireccional.
- Clasificación de vídeo (pipeline_tag: video-classification) y clasificación de audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural: es un modelo forense multimodal, no un LLM.
- Capacidades multilingües: no aplicables (no procesa texto).

## Casos de uso

- Moderación de plataformas de vídeo: el modelo permite etiquetar automáticamente contenido sospechoso distinguiendo si la manipulación afecta a la cara, a la voz o a ambas, lo que facilita la revisión humana y la priorización de casos.
- Forense judicial y peritaje: la atribución por cuadrantes y la localización temporal de límites aportan evidencia diagnóstica más rica que un veredicto binario, adecuada para informes periciales.
- Verificación de identidad en entrevistas remotas: detecta clonación de voz o face swap en vídeos de onboarding, incluso cuando solo se dispone de audio o de vídeo sin pista sonora gracias a los tokens nulos.
- Detección de dobles falsificaciones (FVFA): el desacoplamiento de subespacios evita el fallo típico de detectores basados en sincronización labial ante vídeos sintéticos con voz clonada.
- Análisis de audio aislado en llamadas: la rama WavLM con AUC acústico declarado de 0,999 permite analizar grabaciones telefónicas sin componente visual.
- Auditoría de datasets de investigación: sirve como línea base fuerte (Macro-F1 0,918) para comparar nuevos detectores en particiones disjuntas por identidad.
- Monitorización de medios en tiempo casi real: con 75,6 M de parámetros en Phase A, el coste de inferencia es contenido y viable en GPUs de gama media para lotes de clips.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FakeAVCeleb en partición estricta disjunta por identidad (media ± desviación sobre cinco semillas). No verificados de forma independiente.

| Arquitectura | Parámetros | Clip AUC | Video AUC | Audio AUC | Macro-F1 (%) | Balanced Acc (%) |
|---|---|---|---|---|---|---|
| Audio Probe (WavLM) | 94,7 M | 0,842 ± 0,007 | — | 0,999 ± 0,002 | — | — |
| Video Probe (VideoMAE) | 86,6 M | 0,902 ± 0,005 | 0,966 ± 0,004 | — | — | — |
| AASIST | 0,3 M | 0,748 ± 0,004 | — | 0,998 ± 0,001 | — | — |
| EfficientNet-B4 | 19,3 M | 0,926 ± 0,002 | 0,991 ± 0,001 | — | — | — |
| Late Fusion (V+A) | 181,3 M | 0,918 ± 0,015 | 0,963 ± 0,007 | 0,998 ± 0,002 | 79,7 ± 3,2 | 80,1 ± 2,8 |
| AVFF | 186,2 M | 0,981 ± 0,003 | — | — | — | — |
| DAVID-Net (Phase A, congelado) | 75,6 M | 0,976 ± 0,006 | 0,979 ± 0,003 | 0,999 ± 0,002 | 91,8 ± 1,7 | 91,3 ± 1,0 |
| DAVID-Net (Phase B, end-to-end) | 105,5 M | 0,978 ± 0,005 | 0,982 ± 0,004 | 0,999 ± 0,001 | 92,4 ± 1,2 | 92,0 ± 0,8 |

El autor declara significancia estadística frente a Late Fusion, EfficientNet-B4 y AASIST en las cinco semillas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser tareas aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del checkpoint (75,6 M en Phase A, 105,5 M en Phase B) y el repositorio de 0,3 GB, la inferencia en fp32 requiere del orden de 1-2 GB de VRAM incluyendo buffers de activación de los codificadores VideoMAE y WavLM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o RTX 4080 no son necesarias pero aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3050, RTX 4060 y superiores, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: el autor publica una API FastAPI en Hugging Face Spaces (mohsinelis-david-net-av-v2.hf.space) y una demo en Vercel Edge. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de clasificación multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Clip AUC en FakeAVCeleb) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAVID-Net (Phase B) | 105,5 M | no aplicable (clips de vídeo + ventanas de audio) | 0,978 ± 0,005 | MIT | Hugging Face (este repo) |
| AVFF | 186,2 M | no disponible | 0,981 ± 0,003 | no disponible | no disponible |
| Late Fusion (V+A) | 181,3 M | no disponible | 0,918 ± 0,015 | no disponible | no disponible |
| EfficientNet-B4 (solo vídeo) | 19,3 M | no disponible | 0,926 ± 0,002 | no disponible | no disponible |
| AASIST (solo audio) | 0,3 M | no disponible | 0,748 ± 0,004 | no disponible | no disponible |

DAVID-Net destaca por ofrecer atribución en cuatro cuadrantes, tolerancia a modalidad ausente y localización temporal, capacidades que los modelos comparados no documentan en la información disponible. AVFF obtiene un Clip AUC ligeramente superior (0,981 frente a 0,978) pero con casi el doble de parámetros y sin las capacidades forenses adicionales declaradas.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y marcados como no verificados (verified: false) en el model-index; no hay validación independiente publicada.
- La evaluación se limita a FakeAVCeleb en partición disjunta por identidad; el rendimiento en dominios cruzados (Celeb-DF-v2, DFDC, DeepfakeTIMIT, WaveFake) no se reporta con métricas numéricas en la información disponible.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingües.
- Riesgo de alucinación en sentido forense: puede producir atribuciones erróneas con alta confianza en manipulaciones no vistas durante el entrenamiento (nuevos métodos de generación, códecs agresivos, baja resolución).
- Sesgos potenciales derivados de los datasets de entrenamiento (FakeAVCeleb, DFDC, Celeb-DF-v2): sobrerrepresentación de celebridades y de determinados métodos de síntesis, con posible degradación en demografías o condiciones de grabación poco representadas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad por decisiones tomadas a partir de las predicciones.
- Los pesos y el código dependen de los codificadores preentrenados VideoMAE y WavLM, cuyas licencias deben verificarse por separado para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- No se documentan tipos de cuantización ni requisitos de hardware oficiales; las estimaciones de VRAM son inferencias a partir del tamaño del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MIHMahmudEli/david-net-av
- Repositorio de código en GitHub: https://github.com/MIHMahmudEli/david-net-av
- Datasets preprocesados en Hugging Face: https://huggingface.co/datasets/MIHMahmudEli/david-net-av
- Registros de experimentos (160 ejecuciones): https://huggingface.co/MIHMahmudEli/davidnet-experiments
- Demo en Vercel Edge: https://david-net-av.vercel.app/
- API FastAPI en Hugging Face Spaces: https://mohsinelis-david-net-av-v2.hf.space/docs
- Licencia MIT: https://opensource.org/licenses/MIT
- Paper: en revisión (no disponible URL pública en la información proporcionada)
