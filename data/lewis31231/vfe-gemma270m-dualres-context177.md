# Lewis31231/vfe-gemma270m-dualres-context177

## Resumen

VFE-gemma270m-dualres-context177 es un checkpoint de investigacion publicado por el usuario Lewis31231 en Hugging Face, asociado al paper IC-VFE (arXiv:2611.08698) sobre estimacion de funciones de valor para robotica. No es un modelo de lenguaje generativo al uso ni un repositorio AutoModel de Transformers, sino un checkpoint completo de entrenamiento (paso 10.000) de una arquitectura VFE personalizada que combina un backbone Gemma 3 de 270 millones de parametros con vision SigLIP y un esquema de contexto de 177 slots anclados al final con stride 30.

El modelo resuelve un problema concreto de robotica: estimar el progreso de una tarea a partir de lenguaje de tarea, tres camaras (`zed`, `fish0`, `fish1`) y el estado de observacion, representando el progreso mediante 201 bins en el intervalo [-1, 0]. Es relevante como artefacto de reproducibilidad: incluye modelo, optimizador, cursor de entrenamiento y estados aleatorios por rango, ademas de configuracion resuelta, esquema de tensores y procedencia de checksums bajo `paper-release/`.

El checkpoint pesa 5,7 GB e incorpora pesos de optimizador, lo que explica un tamano muy superior al de un Gemma 3 de 270M en solitario. La licencia no esta declarada y el autor advierte explicitamente de que la tarjeta no concede licencia nueva sobre los pesos upstream de Gemma ni SigLIP ni sobre los datasets externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VFE personalizada sobre backbone Gemma 3 270M con vision SigLIP y contexto dual-res (177 slots, stride 30) |
| Parametros totales | No disponible (preset `gemma3_270m_native_dualres_context177_stride30_3cam_freeze_vision`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 177 slots anclados al final, stride 30 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrada de lenguaje de tarea) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`checkpoint_step_10000.pt`, `torch.load` con `weights_only=True`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo VFE (value function estimation) personalizado que no se carga con `AutoModel` de Transformers. El preset `gemma3_270m_native_dualres_context177_stride30_3cam_freeze_vision` indica un backbone Gemma 3 de 270M con la vision congelada, tres camaras de entrada y un esquema de contexto de resolucion dual con 177 slots anclados al final y stride 30. La representacion de progreso se discretiza en 201 bins sobre [-1, 0] y el contexto se habilita sin tokens de etiqueta de progreso.

El checkpoint corresponde al paso 10.000 del experimento `ic_vfe` e incluye modelo, optimizador, cursor de entrenamiento y estados aleatorios por rango. El entrenamiento registra `global_batch_size` 320 con `per_rank_batch_size` 40 en 8 GPUs (el nombre historico del directorio menciona bs160/4gpu, discrepancia que el autor senala). La continuacion exacta requiere los datos originales, el estado de muestreo, la cache de features y un numero compatible de workers. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Estimacion de progreso de tarea robotica a partir de lenguaje de tarea, tres camaras (`zed`, `fish0`, `fish1`) y `observation.state`.
- Prediccion de una distribucion sobre 201 bins de progreso en [-1, 0].
- Procesamiento multimodal con backbone de vision SigLIP y backbone de lenguaje Gemma 3 270M.
- Contexto de 177 slots con stride 30 para agregar informacion temporal de la trayectoria.
- Evaluacion con metricas de correlacion (Kendall tau-b y Pearson r) sobre predicciones guardadas.
- No dispone de tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso; no es un modelo de chat ni de generacion de texto abierta.

## Casos de uso

- Reproduccion de resultados del paper IC-VFE: cargar el checkpoint con los comandos `validate-data`, `evaluate` y `score` del repositorio de codigo para verificar las metricas publicadas de Kendall tau-b y Pearson r en los splits seen y unseen.
- Investigacion en estimacion de funciones de valor para robotica: usar el checkpoint como punto de partida para ablaciones, por ejemplo la ablacion pendiente sin block embedding que el autor menciona y que aun no tiene pesos publicados.
- Evaluacion offline de politicas roboticas: puntuar trayectorias grabadas con tres camaras y estado de observacion para medir el progreso estimado frente a anotaciones humanas.
- Analisis de representacion de progreso: estudiar como el esquema de 177 slots con stride 30 y 201 bins modela la progresion temporal en tareas de manipulacion.
- Benchmarking de backbones pequenos en robotica: comparar el Gemma 3 270M congelado en vision frente a alternativas de mayor tamano en la misma tarea de estimacion de progreso.
- Base para fine-tuning en dominios roboticos propios: reutilizar el checkpoint y el pipeline de datos del repositorio, teniendo en cuenta que se requiere acceso a los assets upstream de Gemma y SigLIP y a los datasets externos.

## Benchmarks y rendimiento

Evaluacion sobre 240 trayectorias exitosas en 27 tareas, con 120 episodios de consulta por split (119 puntuados tras excluir correlaciones indefinidas). Suavizado EMA con alpha 0,5 sobre la secuencia de prediccion, referencia humana en porcentaje float64.

| Split | Kendall tau-b | Pearson r |
|---|---:|---:|
| Seen | 0,53 | 0,65 |
| Unseen | 0,54 | 0,68 |

El autor advierte de que las metricas de referencia de profesor conservadas en ficheros antiguos corresponden a una evaluacion distinta y no deben sustituir a esta tabla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint completo pesa 5,7 GB e incluye estado del optimizador, por lo que la inferencia solo con pesos requiere menos memoria que el fichero completo.
- La evaluacion requiere GPU asignada; la validacion de datos y el scoring de predicciones guardadas son operaciones de CPU.
- GPU recomendadas: no disponible. El autor no especifica modelos concretos.
- No se confirma que quepa en GPU de consumo; el autor no lo indica.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; se ejecuta mediante el repositorio de codigo del paper (`scripts/paper.py`) con PyTorch.
- Latencia y throughput: no disponibles.
- Requiere assets upstream de Hugging Face de Gemma y SigLIP accesibles o en cache local; no se incluyen datasets, anotaciones ni caches de features.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (VFE para robotica con backbone Gemma 3 270M) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo ni un repositorio AutoModel de Transformers; no puede usarse como chatbot ni para generacion de texto.
- Licencia no declarada; la tarjeta no concede licencia nueva sobre los pesos upstream de Gemma ni SigLIP ni sobre los datasets externos, lo que supone un riesgo legal para uso comercial.
- Requiere el repositorio de codigo del paper, los assets upstream y los datasets externos en las rutas configuradas; sin ellos el checkpoint no es utilizable.
- La equivalencia de forward en GPU no se volvio a comprobar para esta release; solo se verifico la carga completa del checkpoint en CPU con `torch.load(..., map_location="cpu", weights_only=True)`.
- El checkpoint incluye estado de optimizador y estados aleatorios por rango; la continuacion exacta del entrenamiento exige datos, estado de muestreo, cache de features y numero de workers compatibles.
- El nombre historico del directorio (bs160/4gpu) no coincide con la configuracion registrada (batch global 320 en 8 GPUs), lo que puede inducir a error.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Limitaciones de idioma: no documentadas; solo se indica entrada de lenguaje de tarea.

## Enlaces

- Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-dualres-context177
- Paper: https://arxiv.org/abs/2611.08698
- Guia de reproduccion: https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5/docs/reproduction.md
- Codigo del paper (VICTR VFE en 7b77608): https://github.com/LewisZZZ-Zhang/VFE/tree/7b7760819c3f7f25530680d05b24899e003d05e5
