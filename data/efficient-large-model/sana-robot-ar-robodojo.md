# Efficient-Large-Model/SANA-Robot-AR-RoboDojo

## Resumen

SANA-Robot-AR RoboDojo es un modelo de accion y mundo (world-action model) para robotica de manipulacion, desarrollado por Efficient-Large-Model (grupo vinculado a NVIDIA Labs, segun la pagina del proyecto). El modelo recibe una observacion multivista, la propiocepcion del robot y una instruccion en lenguaje natural, y predice conjuntamente un bloque de 32 acciones de control y el video futuro correspondiente. Esta variante AR incorpora una memoria hibrida sobre el historial visual del episodio que le permite mantener contexto sin que el coste de inferencia crezca con la duracion de la tarea.

El checkpoint publicado esta post-entrenado sobre el benchmark RoboDojo con un robot ARX-X5 de dos brazos, y cuenta con 4.5B parametros. La arquitectura combina capas de atencion softmax (que leen el primer frame y una ventana deslizante de bloques recientes) con capas Gated DeltaNet que comprimen cada bloque pasado en un estado de tamano constante. Es relevante porque aborda uno de los problemas practicos de los modelos de politica robotica: la gestion eficiente de memoria a largo plazo en episodios extensos.

El modelo se distribuye bajo licencia Apache 2.0 en formato de pesos PyTorch (`.pth`), e incluye los ficheros de normalizacion y metadatos necesarios para su reproduccion. No incluye el codificador de texto (Gemma 2 2B) ni el VAE de video (LTX-2.3), que deben descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion softmax + Gated DeltaNet (world-action model autorregresivo) |
| Parametros totales | 4.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Memoria hibrida: primer frame + ventana deslizante de 1 bloque + estado Gated DeltaNet sobre todos los bloques pasados (coste constante por peticion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se procesan via Gemma 2 2B, multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (state dict bajo `state_dict_ema`) |
| Robot | ARX-X5, dos brazos; control de efector final y de articulaciones desde el mismo checkpoint |
| Camaras | Cabeza 384 × 480, dos muñecas 192 × 256, layout en T (`spatial_layout: t_shape`) |
| Bloque de accion | 32 pasos de control; video codificado con stride de 4 frames |
| Codificador de texto | Gemma 2 2B (no incluido) |
| VAE de video | LTX-2.3 VAE, layout diffusers (no incluido) |
| Pesos publicados | EMA (decay 0.999) en el paso 20.000 de post-entrenamiento |

## Arquitectura y entrenamiento

SANA-Robot-AR es un modelo de accion y mundo generativo. Dada una observacion multivista (camara de cabeza y dos de muñeca), la propiocepcion y una instruccion de lenguaje, predice un bloque de 32 acciones junto con el video futuro del episodio. La innovacion central es la memoria hibrida: las capas de atencion softmax atienden causalmente al primer frame y a una ventana deslizante de un bloque reciente, mientras que las capas Gated DeltaNet comprimen cada bloque pasado en un estado de tamano constante. Esto desacopla el coste computacional de la longitud del episodio, algo critico en tareas de horizonte largo.

El checkpoint se ha post-entrenado sobre el benchmark RoboDojo, con demostraciones simuladas de un unico robot (ARX-X5) y un conjunto fijo de camaras. El entrenamiento usa EMA con decay 0.999 y se publica el estado en el paso 20.000. La inferencia documentada usa 10 pasos de denoising, video guidance de 6 y un nuevo bloque cada 16 pasos de control (`n_action_steps: 16`). El modelo se apoya en un codificador de texto Gemma 2 2B y un VAE de video LTX-2.3, ambos externos al repositorio. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Prediccion conjunta de acciones de control y video futuro (world-action model).
- Control de robot bimanual ARX-X5, tanto en espacio de efector final como de articulaciones.
- Memoria de episodio a largo plazo mediante estado Gated DeltaNet de tamano constante.
- Procesamiento de instrucciones en lenguaje natural a traves de Gemma 2 2B.
- Fusion de observaciones multivista (camara de cabeza y dos de muñeca).
- Prediccion de bloques de 32 acciones con horizonte de ejecucion configurable.
- Generacion de video predictivo del entorno como supervision auxiliar.

## Casos de uso

- Investigacion en politicas de manipulacion robotica: punto de partida reproducible para experimentar con world-action models en entornos simulados tipo RoboDojo, con receta de fine-tuning publicada (`configs/robodojo_ar.yaml`).
- Tareas de horizonte largo con dependencia de memoria: la memoria hibrida permite recordar objetos o estados vistos muchos pasos atras sin incrementar el coste por peticion, adecuado para tareas de ensamblaje o apilado de multiples pasos.
- Manipulacion bimanual: el checkpoint soporta control de dos brazos desde un unico modelo, util para tareas cooperativas entre extremidades.
- Evaluacion comparativa de world-action models: sirve como referencia en el leaderboard de RoboDojo (dimensiones de generalizacion, precision, horizonte largo, memoria y tareas abiertas).
- Generacion de video predictivo para planificacion: el modelo produce el video futuro del bloque, lo que puede usarse para verificar la coherencia de una trayectoria antes de ejecutarla en simulacion.
- Fine-tuning sobre nuevos robots o camaras: al publicarse el checkpoint de preentrenamiento (`SANA-Robot-AR-Pretrain`), es posible adaptar la politica a otras configuraciones fisicas.
- Prototipado de pipelines de robot learning: integracion con XPolicyLab de RoboDojo mediante el adaptador de politica en `eval/robodojo`.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las celdas son media / tasa de exito (%); la media se calcula sobre las cinco dimensiones.

| Evaluacion | Generalization | Precision | Long-Horizon | Memory | Open | Media |
|---|---|---|---|---|---|---|
| Leaderboard oficial (layouts ocultos) | 26.61 / 21.11 | 38.33 / 28.67 | 48.68 / 28.75 | 52.73 / 52.33 | 5.21 / 4.58 | **34.31 / 27.09** |
| Evaluacion propia (layouts publicos, tres semillas) | 26.20 / 21.33 | 39.41 / 30.08 | 48.58 / 28.92 | 49.19 / 48.78 | 4.70 / 4.25 | 33.62 / 26.67 |

Ambas filas corresponden a este checkpoint con los mismos ajustes de inferencia: 10 pasos de denoising, video guidance 6 y nuevo bloque cada 16 pasos de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4.5B parametros en precision completa se situa en el orden de 9-10 GB solo para pesos, mas el VAE de video LTX-2.3 y el codificador Gemma 2 2B, que anaden varios GB adicionales.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una GPU de 24 GB o superior (RTX 4090, A100, H100) es un punto de partida razonable, aunque no confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el modelo no documenta cuantizaciones ni despliegue en llama.cpp u Ollama.
- Opciones de despliegue: descarga via `hf download`; inferencia a traves del codigo de SANA-Robot y el adaptador `eval/robodojo` para XPolicyLab. No se documentan integraciones con vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Robot-AR RoboDojo | 4.5B | Memoria hibrida de coste constante | World-action model con video predictivo | Apache 2.0 | Pesos en HF |
| SANA-Robot-AR RoboTwin2.0 | no disponible | Memoria hibrida | World-action model | Apache 2.0 | Pesos en HF |
| SANA-Robot-AR LIBERO | no disponible | Memoria hibrida | World-action model | Apache 2.0 | Pesos en HF |
| SANA-Robot-AR Pretrain | no disponible | Memoria hibrida | Modelo base para fine-tuning | Apache 2.0 | Pesos en HF |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos de terceros (por ejemplo, pi0, OpenVLA u otros) para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Entrenado sobre demostraciones simuladas de un unico benchmark (RoboDojo) y un unico robot (ARX-X5); otros robots, camaras, tareas o escenas requieren fine-tuning.
- Una politica aprendida puede fallar sin aviso: en un robot fisico debe ejecutarse con limites de espacio de trabajo, limites de velocidad y una persona junto al boton de parada.
- El modelo no incluye el codificador de texto Gemma 2 2B ni el VAE LTX-2.3; deben descargarse por separado y con sus propias licencias.
- Debe usarse el `normalization.json` y el `meta.json` publicados, no una normalizacion recalculada.
- Riesgo de alucinacion en la prediccion de video y de acciones no verificadas fisicamente.
- Idiomas soportados no documentados explicitamente; dependen del codificador Gemma 2 2B.
- No se publican datos de sesgos, robustez fuera de distribucion ni evaluacion en hardware real.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint esta pensado para investigacion en politicas de manipulacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboDojo
- Pagina del proyecto: https://nvlabs.github.io/Sana/Robot/
- Benchmark RoboDojo: https://github.com/RoboDojo-Benchmark/RoboDojo
- Modelo preentrenado: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Variante RoboTwin2.0: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0
- Variante LIBERO: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
- Codificador de texto Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- VAE LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
- Paper: Zhao et al., "SANA-Robot: Efficient World Action Model with Hybrid Memory", 2026 (referencia bibliografica en la model card; sin URL directa disponible)
