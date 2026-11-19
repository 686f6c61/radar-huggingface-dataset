# LosMous/CoT-WAM

## Resumen

CoT-WAM (Collaborative Training of Vision-Language Models and World-Action Models via Plan Latents) es un modelo de politica robotica para manipulacion, publicado por el autor LosMous en Hugging Face y desarrollado por un equipo de investigacion encabezado por Jinhao Zhang. Se trata de los pesos de la etapa 2 (Stage 2 policy weights) de un sistema que combina un modelo vision-lenguaje (VLM) Qwen3-VL-4B-Instruct con un modelo mundo-accion derivado de Wan2.2-TI2V-5B, entrenados de forma colaborativa mediante latentes de plan. El modelo resuelve el problema de generar planes visuales y secuencias de acciones para tareas de manipulacion robotica a partir de observaciones multimodales.

La arquitectura no es un transformer generativo de texto al uso: es una politica de imitacion (imitation learning) que recibe dos vistas de camara, propiocepcion del robot y una instruccion de tarea, predice un objetivo visual (goal image) y genera un chunk de acciones. Esta disenada especificamente para el benchmark LIBERO y su variante LIBERO Plus, con soporte de evaluacion zero-shot en esta ultima.

Su relevancia actual reside en la integracion de un VLM planificador con un modelo mundo-accion en un unico pipeline entrenado conjuntamente, algo poco comun en el ecosistema open source de robotica. El checkpoint reporta un 99,0% de exito medio en las cuatro suites de LIBERO (1.980 episodios exitosos de 2.000), aunque con la salvedad de que la implementacion publica no ha vuelto a ejecutar el benchmark completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica robotica hibrida: VLM planificador (Qwen3-VL-4B-Instruct) + modelo mundo-accion (Wan2.2-TI2V-5B) con proyector de latentes y encoder de propiocepcion |
| Parametros totales | no disponible (repo de 21,0 GB; pesos en `model.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

CoT-WAM combina dos componentes preentrenados: un VLM Qwen3-VL-4B-Instruct que actua como planificador y un modelo mundo-accion derivado de Wan2.2-TI2V-5B (modelo de difusion video). El entrenamiento es colaborativo y se articula mediante latentes de plan: el VLM genera un plan latente que condiciona al modelo mundo-accion, el cual predice un objetivo visual y, a continuacion, un chunk de acciones. El checkpoint incluye los expertos de video y accion de la etapa 2, el planificador VLM, el proyector de latentes y el encoder de propiocepcion. El VAE de Wan permanece congelado y no esta embebido en `model.pt`; el constructor del planificador requiere tambien el directorio original del modelo y procesador Qwen antes de aplicar los pesos entrenados.

El entrenamiento se realizo sobre las cuatro suites de LIBERO (Spatial, Object, Goal, Long) usando el dataset `yuanty/LIBERO-fastwam`. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La receta de inferencia por defecto predice 32 acciones, replanifica cada 10 acciones ejecutadas y usa cinco pasos de denoising de goal terminando en sigma 0,5, seguidos de diez pasos de denoising de accion. El checkpoint es el artefacto no-EMA seleccionado; el `train_config.yaml` incluido es provenance historico y no una configuracion de lanzamiento valida para el codigo actual.

## Capacidades

- Prediccion de objetivos visuales (goal images) a partir de dos vistas de camara, propiocepcion e instruccion de tarea.
- Generacion de chunks de acciones para control robotico de manipulacion (32 acciones por chunk, replanificacion cada 10).
- Planificacion latente mediante VLM integrado (Qwen3-VL-4B-Instruct) que condiciona al modelo mundo-accion.
- Evaluacion en las cuatro suites de LIBERO: Spatial, Object, Goal y Long.
- Evaluacion zero-shot en LIBERO Plus a traves del mismo checkpoint y la base de codigo CoT-WAM.
- Soporte de instrucciones de tarea en lenguaje natural como condicionamiento de la politica.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Evaluacion de investigacion en LIBERO: reproduccion de los resultados publicados (99,0% de exito medio) cargando el checkpoint con `configs/eval.yaml` y el codigo CoT-WAM; util para comparar nuevas politicas contra una linea base fuerte.
- Generalizacion zero-shot en LIBERO Plus: el mismo checkpoint permite evaluar robustez ante variaciones del entorno sin reentrenamiento, usando `experiments/libero_plus/evaluate.py`.
- Prototipado de politicas vision-lenguaje-accion: servir como punto de partida para adaptar el pipeline VLM + modelo mundo-accion a otras tareas de manipulacion, modificando el dataset y las estadisticas de normalizacion.
- Investigacion en modelos mundo-accion: el componente Wan2.2-TI2V-5B permite estudiar la prediccion de objetivos visuales como paso intermedio hacia la accion, aislando el efecto del plan latente.
- Ablaciones sobre planificacion latente: al separar planificador VLM, proyector de latentes y experto de accion, se pueden desactivar o sustituir componentes para medir su contribucion.
- Reproducibilidad y auditoria de artefactos: el repo incluye `SHA256SUMS`, `release.json` y hashes de artefactos, lo que facilita pipelines de verificacion de integridad en entornos de investigacion.

## Benchmarks y rendimiento

Resultados reportados por el autor en la evaluacion completa original de LIBERO (40 tareas, 50 estados iniciales oficiales por tarea):

| Suite | Tasa de exito |
|---|---:|
| Spatial | 98,6% |
| Object | 99,4% |
| Goal | 99,4% |
| Long | 98,6% |
| Media | 99,0% |

El resumen historico registra 1.980 episodios exitosos de 2.000 e identifica el checkpoint evaluado por SHA256. Estos resultados provienen de la implementacion de investigacion; el benchmark completo no se ha vuelto a ejecutar con la limpieza de codigo publica. El informe de smoke test en GPU cubre carga estricta de todos los componentes, un episodio LIBERO en bucle cerrado y un paso de entrenamiento/validacion con una muestra real; un solo rollout es una comprobacion de compatibilidad, no una nueva puntuacion de benchmark. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: las comprobaciones de inferencia con el modelo completo registraron aproximadamente 21,6 GiB de memoria GPU asignada; el autor advierte que esto excluye otras asignaciones y no constituye un minimo garantizado.
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU NVIDIA con Linux y el entorno del repositorio de codigo. Por el consumo observado (~21,6 GiB), encajan tarjetas con 24 GiB o mas (RTX 4090, A100 40/80 GB, H100).
- GPU de consumo: cabe en RTX 4090 (24 GiB) segun el consumo reportado, aunque sin margen amplio; no se garantiza en tarjetas de 16 GiB o menos.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI como modelo autonomo; requiere la implementacion de politica CoT-WAM y los backbones Qwen y Wan preparados mediante `scripts/download_backbones.py`.
- Latencia y throughput: no disponibles.
- Almacenamiento: repo de 21,0 GB; los backbones (Qwen3-VL-4B y Wan2.2-TI2V-5B) se descargan aparte.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros modelos de politica robotica comparables (por ejemplo, otras politicas para LIBERO) con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint esta entrenado exclusivamente para la interfaz de observacion y accion documentada de LIBERO; otros robots y benchmarks requieren adaptacion.
- No es un modelo `from_pretrained` de Transformers: necesita la implementacion de politica CoT-WAM y los backbones Qwen y Wan preparados por separado.
- El VAE de Wan no esta embebido en `model.pt` y el constructor del planificador requiere el directorio original de Qwen y su procesador; omitir la preparacion de backbones impide la carga.
- Los resultados de 99,0% provienen de la implementacion de investigacion y no se han reproducido con el codigo publico limpio; el smoke test de un episodio no valida el benchmark completo.
- El `train_config.yaml` incluido es provenance historico y puede referirse a la implementacion anterior `cot_wam` con ajustes EMA; no debe usarse como configuracion de lanzamiento con el codigo actual.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero al tratarse de un VLM subyacente (Qwen3-VL) hereda los sesgos de su preentrenamiento.
- Idiomas soportados: no disponibles; las instrucciones de tarea se han validado en el contexto de LIBERO.
- Licencia Apache-2.0 para los pesos; el repositorio de codigo mantiene su propia licencia, que debe revisarse por separado para uso comercial.
- Uso previsto de investigacion; no se documenta validacion en produccion ni en entornos reales fuera de simulacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LosMous/CoT-WAM
- Codigo: https://github.com/jhz1192/CoT-WAM
- Commit inicial del codigo: https://github.com/jhz1192/CoT-WAM/tree/71e451f21961ed69043c57bf5738e7317a72a476
- Paper (arXiv): https://arxiv.org/abs/2611.23803
- PDF: https://arxiv.org/pdf/2611.23803
- Modelo base VLM: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base mundo-accion: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuanty/LIBERO-fastwam
