# rayruiyang/GeoUG-Spatial

## Resumen

GeoUG-Spatial es un checkpoint de investigación para razonamiento espacial adaptativo a partir de una imagen y una pregunta con referencias puntuales (*grounding*). Lo publica el autor `rayruiyang` (contacto en la Universidad de Hong Kong) como artefacto final de la familia GeoUG, descrita en el artículo *GeoUG: Learning and Reasoning with Geometry — How Generation Helps Spatial Understanding?*. Su particularidad es que la política no responde siempre de la misma forma: puede contestar directamente o bien generar un mapa de profundidad métrica, consultar herramientas geométricas y revisar su respuesta antes de emitirla.

El modelo se construye sobre la arquitectura BAGEL/MoT (Mixture-of-Transformers multimodal, con generación tipo difusión) y se obtiene mediante aprendizaje por refuerzo sobre una inicialización supervisada (GeoUG-ColdStart). La recompensa penaliza el coste de generar profundidad con un factor λ = 0,1, de modo que el modelo aprende implícitamente *cuándo* merece la pena invocar la herramienta geométrica. Según la model card, la tasa media de activación de profundidad es del 63,4 % en los tres benchmarks evaluados.

Es relevante porque aborda un problema poco tratado: el coste computacional del razonamiento geométrico explícito. En lugar de generar profundidad siempre, la política decide cuándo hacerlo, lo que abre la puerta a sistemas de percepción 3D con presupuesto de cómputo controlable. El release es únicamente de pesos (27,21 GiB en BF16) y requiere el runtime propio del proyecto; no es un modelo desplegable con `transformers`, vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL/MoT (Mixture-of-Transformers multimodal con generacion tipo difusion); incluye ViT, LLM, VAE y generador de profundidad integrado |
| Parametros totales | no disponible (estimacion indirecta: ~14.600 M a partir de los 27,21 GiB de `ema.safetensors` en BF16; el autor no publica la cifra) |
| Parametros activos | no disponible (arquitectura MoT, reparto activo/total no documentado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el release solo distribuye pesos BF16 (`ema.safetensors`). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | ingles (`en`) |
| Licencia | `other` (licencia mixta; el codigo derivado de BAGEL/DiT queda sujeto a restricciones CC BY-NC) |
| Formato de pesos | `safetensors` BF16 (EMA) + VAE en `safetensors`; requiere cargador BAGEL/MoT propio, no `AutoModel.from_pretrained` |

Otros datos del paquete: `llm_config.json`, `vit_config.json`, `config.json`, `generation_config.json`, `transform_config.yaml`, tokenizer (`tokenizer.json`, `vocab.json`, `merges.txt`) y `checksums.sha256` para verificación SHA-256. Tamano total del repositorio: 29,5 GB. Fecha de creacion y ultima actualizacion registradas: 2026-10-27.

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura BAGEL/MoT, un transformer multimodal de tipo Mixture-of-Transformers que combina un codificador visual (ViT), un modelo de lenguaje y un VAE, con un generador de profundidad métrica embebido en el propio modelo espacial (no requiere descargar GeoUG-Depth para inferencia espacial). La generación de profundidad se ejecuta con muestreo tipo difusión: el CLI expone `--num-timesteps 50`, `--cfg-text-scale 4.0` y `--cfg-img-scale 2.0`. Las coordenadas de los puntos se normalizan de forma independiente en el rango 0–1000 para x e y.

El entrenamiento consta de dos etapas: un ajuste supervisado (GeoUG-ColdStart) seguido de RL de política espacial con el objetivo interno `spatial_gate_draft_v3` y coste de generación λ = 0,1. La recompensa es `reward = answer_correct - 0.1 * used_depth`, es decir, se penaliza cada activación del generador de profundidad. El checkpoint publicado son los pesos EMA fusionados de la política final. El autor no detalla en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de preferencia (DPO/RLHF) más allá del RL con recompensa verificable descrito. Los datos de entrenamiento están publicados por separado en `rayruiyang/GeoUG_data`.

## Capacidades

- Razonamiento espacial adaptativo sobre una única imagen: decide entre respuesta directa, generación de profundidad métrica o consulta a herramientas geométricas antes de contestar.
- Generación de profundidad métrica integrada, con control explícito del número de pasos de muestreo y de las escalas de *classifier-free guidance* (texto e imagen).
- *Grounding* de puntos mediante coordenadas normalizadas 0–1000, con adaptadores de benchmark que convierten coordenadas canónicas en tiempo de ejecución.
- Respuesta a preguntas de opción múltiple (formato A/B) con robustez al orden de las opciones: la métrica principal es *circular accuracy*, que solo acredita una pregunta si todas las permutaciones de respuesta son correctas.
- Tres modos de política inspeccionables: `adaptive` (comportamiento final), `force_depth` (fuerza la generación de profundidad) y `force_answer` (fuerza la respuesta directa). Los dos últimos sirven para analizar los extremos de la política.
- Tokens de razonamiento obligatorios: el CLI los activa automáticamente; los runners personalizados deben definir `BAGEL_REASONING_TOKENS=1`.
- Soporte de *tool calling* / *function calling* genérico: no documentado en la información disponible.
- Soporte de agentes multi-paso fuera del bucle interno de la política: no documentado.
- Capacidades multimodales adicionales (vídeo, audio, múltiples imágenes): no documentadas; el CLI de inferencia recibe una sola imagen (`--image`).
- Multilingüismo: limitado a inglés según el campo `language` de la model card.

## Casos de uso

- **Verificación de relaciones de profundidad en robótica**: antes de planificar una manipulación, el modelo recibe la imagen de la escena y dos puntos candidatos ("¿qué punto está más cerca de la cámara?") y responde en modo `adaptive`; si la política lo considera necesario, genera profundidad métrica para fundamentar la decisión. Útil en pipelines donde el coste de generar un mapa de profundidad completo no siempre está justificado.
- **Anotación y auditoría de benchmarks 3D**: el checkpoint se ha evaluado sobre 3DCueBench, CV-Bench-3D Textual y DA-2K Textual, por lo que encaja como modelo de referencia o "juez" para detectar preguntas ambiguas o dependientes del orden de opciones en datasets de razonamiento espacial.
- **Investigación en políticas con coste de herramienta**: la formulación `reward = answer_correct - 0.1 * used_depth` es un caso concreto de aprendizaje de *cuándo* invocar una herramienta costosa. Sirve como base para experimentos de *tool learning* con presupuesto computacional explícito, comparando el modo `adaptive` frente a `force_depth` y `force_answer`.
- **Análisis de escenas para realidad aumentada**: dada una imagen y puntos anclados a objetos, el modelo estima orden de profundidad relativa y relaciones espaciales, lo que permite decidir oclusión y orden de renderizado de overlays sin un sensor de profundidad dedicado.
- **Inspección industrial y control de calidad**: comparación de la profundidad relativa entre regiones marcadas por coordenadas en imágenes de cámara fija, con activación selectiva del generador de profundidad para no procesar todas las imágenes del lote.
- **Prototipado de asistentes de accesibilidad visual**: responder a preguntas del tipo "¿qué objeto de los marcados está más adelante?" con referencias puntuales sobre la imagen, aprovechando la ventana de contexto no documentada pero el formato de una sola imagen por consulta.
- **Generación de datos sintéticos de entrenamiento**: usar `force_depth` para producir mapas de profundidad métrica etiquetados sobre imágenes propias y `force_answer` para obtener líneas base de respuesta directa, y así construir pares de comparación para destilar la política adaptativa.

## Benchmarks y rendimiento

Resultados reportados por el autor en el artículo (exactitud circular, modo adaptativo):

| Benchmark | Exactitud circular adaptativa (%) |
|---|---:|
| 3DCueBench | 90,75 |
| CV-Bench-3D Textual | 97,92 |
| DA-2K Textual | 94,20 |

Tasa media de activación del generador de profundidad en los tres benchmarks: **63,4 %**.

Advertencias sobre estas cifras: la *circular accuracy* es una métrica estricta que solo acredita una pregunta si todas las permutaciones del orden de opciones son correctas, por lo que no es directamente comparable con exactitudes de un solo orden. El propio autor indica que la reproducción completa de la política adaptativa con el código de evaluación actual está pendiente. No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos externos de la misma categoría.

## Requisitos de hardware

- **Pesos**: `ema.safetensors` ocupa aproximadamente 27,21 GiB en BF16; el repositorio completo son 29,5 GB (incluye VAE, tokenizer y configuraciones).
- **VRAM estimada para inferencia**: no publicada por el autor. Como referencia de orden de magnitud, solo los pesos en BF16 ya exigen más de 27 GiB, a lo que hay que sumar el VAE, las activaciones del ViT/LLM y el bucle de muestreo de difusión (50 pasos por defecto). En la práctica se necesita una GPU de 40–80 GB para BF16 sin técnicas de descarga parcial.
- **GPU recomendadas**: A100 80 GB o H100 para el flujo BF16 completo con margen; A100 40 GB queda muy ajustada. En GPUs de consumo no cabe en BF16: una RTX 4090 (24 GB) no puede alojar los pesos, y no se publican cuantizaciones que lo permitan.
- **Entorno de ejecución**: Python 3.10/3.11, CUDA y el entorno FlashAttention documentado en el *checkout* de GeoUG. Cargador BAGEL/MoT propio mediante `python -m inference.spatial`.
- **Opciones de despliegue**: exclusivamente el runtime de GeoUG. No hay soporte publicado para vLLM, TGI, llama.cpp, Ollama ni `transformers` estándar. El CLI requiere `--model-path`, `--image`, `--question`, `--mode adaptive`, `--num-timesteps 50`, `--cfg-text-scale 4.0`, `--cfg-img-scale 2.0`.
- **Latencia y throughput**: no disponibles. Cualquier estimación debe tener en cuenta que el modo adaptativo puede encadenar generación de profundidad (muestreo de difusión con decenas de pasos) antes de responder, con un coste sensiblemente superior al de un *forward pass* único.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoUG-Spatial | Politica espacial adaptativa final (RL) | no disponible | no disponible | 3DCueBench 90,75; CV-Bench-3D 97,92; DA-2K 94,20 | Mixta (`other`) | Pesos en HF, runtime propio |
| GeoUG-Depth | Generacion de profundidad metrica independiente | no disponible | no disponible | no disponible | Mixta (`other`) | Pesos en HF |
| GeoUG-ColdStart | Inicializacion SFT para el RL espacial | no disponible | no disponible | no disponible | Mixta (`other`) | Pesos en HF |

No se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento ni licencia de modelos externos comparables (por ejemplo, otros VLM orientados a razonamiento espacial o generadores de profundidad monocular), por lo que la comparacion cuantitativa con alternativas de terceros queda como **no disponible**.

## Limitaciones y advertencias

- **Estado de investigación**: 0 descargas y 0 *likes* en el momento de la ficha; no hay validación independiente de la comunidad. El autor reconoce que la reproducción completa de la política adaptativa con el código de evaluación actual está pendiente.
- **Licencia restrictiva y mixta**: la licencia es `other` y el código derivado de BAGEL/DiT arrastra restricciones CC BY-NC (no comercial). Antes de cualquier uso en producción hay que revisar `LICENSE` y `NOTICE` del *checkout* de GeoUG; la model card no concede una licencia global nueva sobre los componentes upstream. Uso comercial: no asumible por defecto.
- **Idioma**: solo inglés; no hay evidencia de soporte multilingüe, lo que afecta a preguntas formuladas en castellano.
- **Dependencia del runtime propio**: no es un modelo *drop-in* en `transformers`, vLLM, TGI, llama.cpp ni Ollama. La integración exige el cargador BAGEL/MoT y la variable `BAGEL_REASONING_TOKENS=1` en runners personalizados.
- **Riesgo de error geométrico y de calibración**: el propio autor advierte que la profundidad generada y las respuestas espaciales son predicciones cuya exactitud depende de la imagen de entrada, de la interpretación de coordenadas y de la calibración geométrica. Un error en la normalización 0–1000 de los puntos invalida la respuesta.
- **Alucinación**: el modelo emite una respuesta de opción múltiple aunque la información visual sea ambigua; no se documenta ningún mecanismo de abstención ni de estimación de incertidumbre.
- **Métrica principal estricta**: la *circular accuracy* exige acierto en todas las permutaciones de opciones, de modo que cifras como 90,75 % no son directamente comparables con exactitudes de un solo orden reportadas por otros trabajos.
- **Alcance de entrada limitado**: una sola imagen por consulta (`--image`); no se documentan entradas de vídeo, múltiples vistas ni audio.
- **Sin cuantizaciones**: no hay GGUF ni variantes de precisión reducida, lo que bloquea el despliegue en GPUs de consumo y encarece el *hosting*.
- **Sesgos**: no se documenta ningún análisis de sesgos demográficos, culturales o de composición del dataset de entrenamiento (`GeoUG_data` se remite a sus propios términos de uso).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rayruiyang/GeoUG-Spatial
- Pagina del proyecto: https://yangr116.github.io/geoug-project-page/
- Articulo (PDF): https://yangr116.github.io/geoug-project-page/assets/geoug-paper.pdf
- Dataset de entrenamiento GeoUG: https://huggingface.co/datasets/rayruiyang/GeoUG_data
- Benchmark 3DCueBench: https://huggingface.co/datasets/rayruiyang/3DCueBench
- Benchmark CV-Bench-3D Textual: https://huggingface.co/datasets/rayruiyang/CVBench3DTexutal
- Checkpoint de profundidad: https://huggingface.co/rayruiyang/GeoUG-Depth
- Checkpoint de inicializacion SFT: https://huggingface.co/rayruiyang/GeoUG-ColdStart
- Contacto: rayyang0116@connect.hku.hk
