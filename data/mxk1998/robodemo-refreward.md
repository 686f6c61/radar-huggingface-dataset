# mxk1998/RoboDemo-Refreward

## Resumen

RoboDemo-Refreward es un scorer neuronal de 7.359.877 parámetros desarrollado por el usuario mxk1998 en el contexto del proyecto RoboDemo (anonimizado, manuscrito en revisión). No es un modelo generativo: es un módulo de ranking que, dada una observación RGB inicial y una instrucción en lenguaje natural, puntúa episodios de vídeo de robots candidatos combinando evidencia semántica, visual y procedimental, y selecciona el vídeo de referencia que guiará a la política de acción.

Resuelve un problema concreto dentro de los pipelines de imitación robótica: la recuperación de demostraciones relevantes a partir de un banco de vídeos heterogéneo (IG-10K-Dataset). El scorer consume características precalculadas por dos encoders congelados externos (Qwen3-VL-Embedding-2B para la parte semántica y DINOv3 ViT-H+ con dimensión 1280 para la visual) y devuelve una puntuación por candidato; el episodio con mayor puntuación se elige como referencia, con el ID de episodio como desempate.

Es relevante porque ejemplifica el patrón de "scorer ligero sobre encoders congelados" en robótica: el checkpoint publicado pesa solo 29,4 MB, se ejecuta en CPU para inferencia mínima y se integra con la política RoboDemo-c15-wo. La versión publicada corresponde al paso 6.000 de entrenamiento y usa las 15.093 condiciones de anotación retenidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (scorer de ranking sobre características de encoders congelados; clase `RefRewardRevision` con `balanced=True`, `joint_prior=True`, `dino_dim=1280`) |
| Parámetros totales | 7.359.877 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (29,4 MB) |

## Arquitectura y entrenamiento

El modelo es un scorer de revisión (`RefRewardRevision`) que opera sobre características ya extraídas por dos encoders congelados: Qwen3-VL-Embedding-2B (embeddings semánticos multimodales) y DINOv3 ViT-H+ preentrenado en LVD-1689M con dimensión de salida 1280 (características visuales). El scorer combina estas señales con un prior conjunto (`joint_prior=True`) y un esquema balanceado (`balanced=True`) para producir una puntuación escalar por episodio candidato. La entrada de consulta es únicamente la observación inicial y la instrucción; los vídeos candidatos aportan el proceso completo, lo que permite evaluar la evidencia procedimental del candidato frente al estado inicial de la consulta.

El checkpoint publicado corresponde al paso 6.000 de entrenamiento y se entrenó sobre las 15.093 condiciones de anotación retenidas del conjunto RoboDemo-Retrieval. Las etiquetas de partición originales se conservan como procedencia, no como una nueva evaluación held-out. No se documentan en la información disponible el número de tokens, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un scorer de ranking). Los puntos de entrada de entrenamiento están planificados para una próxima release; esta publicación incluye solo el scorer y el `config.json` con dimensiones e identidades de los encoders.

## Capacidades

- Ranking de episodios de vídeo de robots mediante evidencia semántica, visual y procedimental combinada.
- Selección de referencia a partir de una observación RGB inicial y una instrucción en lenguaje natural.
- Desempate determinista por ID de episodio cuando hay empate en la puntuación máxima.
- Integración con la política de acción RoboDemo-c15-wo para generar acciones a partir del vídeo seleccionado.
- Ejecución en CPU para el ejemplo mínimo (con extracción de características lenta) o en GPU mediante `CUDA_VISIBLE_DEVICES` y `--device cuda:0`.
- Carga estricta verificada con entradas sintéticas en CPU (`strict=True`).
- No soporta generación de texto, tool calling, agentes, visión directa ni otras capacidades generativas: depende de encoders externos para producir las características.

## Casos de uso

- Recuperación de demostraciones para imitación robótica: dado un estado inicial y una instrucción, el scorer ordena episodios del banco IG-10K-Dataset y selecciona el vídeo de referencia que alimenta a RoboDemo-c15-wo para producir acciones; es adecuado porque separa la selección de referencia (barata, 29,4 MB) de la política de acción.
- Evaluación de pipelines de retrieval en robótica: el ejemplo mínimo `examples/retrieve_reference.py` rankea tres candidatos reales (IDs 3836, 3815, 3820 para la consulta 3806) y escribe IDs, instrucciones y puntuaciones en `outputs/minimal-retrieval.json`, útil para verificar la interfaz antes de escalar al pool completo del benchmark.
- Reutilización de selecciones publicadas: la evaluación C15-wo publicada puede reutilizar las selecciones registradas sin volver a ejecutar el scorer, lo que permite reproducir resultados sin coste de cómputo de encoders.
- Búsqueda de referencias en bancos de vídeo a gran escala: al operar sobre cachés de embeddings precalculados, el scorer puede puntuar grandes pools de candidatos con un coste de inferencia mínimo una vez construidas las cachés.
- Prototipado en máquinas sin GPU: el scorer se ejecuta en CPU para el ejemplo mínimo, lo que facilita pruebas de integración en entornos de desarrollo sin acelerador.
- Investigación en selección de demostraciones: sirve como línea base reproducible (MIT, checkpoint fijo en paso 6.000) para comparar estrategias de ranking semántico-visual-procedimental en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación C15-wo cuyas selecciones pueden reutilizarse sin reejecutar el scorer, pero no se incluyen métricas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para el scorer: mínima; el checkpoint pesa 29,4 MB y 7,36 M de parámetros caben holgadamente en cualquier GPU consumer y en CPU.
- El coste real de cómputo está en los encoders congelados externos: Qwen3-VL-Embedding-2B (≈2.000 M de parámetros) y DINOv3 ViT-H+ (ViT-H, del orden de 600 M de parámetros), que dominan los requisitos de memoria y latencia.
- GPU recomendadas: no especificadas en la información disponible; para los encoders se requiere una GPU con memoria suficiente para un modelo de 2B más el ViT-H (una RTX 4090 de 24 GB es un punto de partida razonable, aunque no está confirmado por el autor).
- Cabe en GPU consumer para el scorer; la extracción de características en CPU es posible pero lenta según la propia model card.
- Opciones de despliegue: script de ejemplo del repositorio (`examples/retrieve_reference.py`) con `safetensors.torch.load_file`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un scorer de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (scorers de retrieval de vídeo para robótica con esta configuración de encoders). Como referencia de contexto, se listan los componentes externos de los que depende:

| Componente | Rol | Parámetros | Licencia |
|---|---|---|---|
| RoboDemo-Refreward | Scorer de ranking | 7.359.877 | MIT |
| Qwen3-VL-Embedding-2B | Encoder semántico multimodal | ≈2.000 M (no confirmado en la información) | Términos propios de Qwen |
| DINOv3 ViT-H+ (LVD-1689M) | Encoder visual, dim. 1280 | no disponible | Términos propios de Meta |
| RoboDemo-c15-wo | Política de acción | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene solo el scorer aprendido; no incluye los encoders congelados ni la política de acción, que deben obtenerse por separado bajo sus propios términos de acceso.
- El ejemplo mínimo con medios crudos no ha completado una ejecución end-to-end de encoders en esta release; solo se ha verificado la carga estricta con entradas sintéticas en CPU.
- Las etiquetas de partición originales se conservan como procedencia, no como una evaluación held-out nueva; no debe interpretarse como validación independiente.
- Las cachés de embeddings grandes se omiten del repositorio; hay que reconstruirlas siguiendo el repositorio de código, lo que añade coste de cómputo no trivial.
- Los puntos de entrada de entrenamiento no están publicados (planificados para la próxima release), lo que limita la reproducibilidad del entrenamiento.
- Idioma limitado al inglés en las instrucciones.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un scorer discriminativo, el riesgo principal es un ranking incorrecto que propague una referencia inadecuada a la política de acción.
- Licencia MIT para el código y el scorer, pero los datos de benchmark y los encoders congelados mantienen sus propias licencias, que pueden restringir el uso comercial del pipeline completo.
- Autores anonimizados y manuscrito en revisión: la documentación técnica puede cambiar entre releases.

## Enlaces

- Hugging Face: https://huggingface.co/mxk1998/RoboDemo-Refreward
- Dataset de anotación: https://huggingface.co/datasets/mxk1998/RoboDemo-Retrieval
- Entorno de evaluación: https://huggingface.co/mxk1998/RoboDemo-Evaluation
- Repositorio de código: https://github.com/robodemo-2027/RoboDemo
- Documentación de arquitectura y ejemplo: https://github.com/robodemo-2027/RoboDemo/blob/main/docs/retrieval.md
- Página del proyecto: https://robodemo-2027.github.io/
- Benchmark Imitator Game: https://imitator-game.github.io/
- Encoder Qwen3-VL-Embedding-2B: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Encoder DINOv3 ViT-H+: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
