# kritokronos/ewm_checkpoints

## Resumen

EWM (Event World Model) es una coleccion de cinco checkpoints de politica de robotica entrenados mediante imitation learning sobre el simulador Piper, publicados por el usuario kritokronos en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal al uso, sino de un conjunto de pesos de politica visomotora para control de un brazo robotico en tareas de manipulacion simuladas. Los checkpoints corresponden al paso de entrenamiento 80.000 y cubren cinco variantes arquitectonicas: action-only, RGB-action y tres configuraciones EWM simetricas/asimetricas con prediccion visual de eventos.

El modelo combina un codificador visual DINOv3 ViT-L/16, un codificador de texto T5-small y, en las variantes EWM y RGB-action, un codec visual LeanVAE-dim16 congelado. La politica predice acciones con un horizonte de 24 pasos (40 en la variante asimetrica) y, en las variantes EWM, tambien predicciones visuales de eventos. El repositorio ocupa 13,8 GB e incluye los pesos congelados compartidos bajo `pretrained/`.

Es relevante para investigadores en robotica y aprendizaje por imitacion que quieran reproducir o comparar variantes de world models aplicados a control visomotor en simulacion, aunque su uso requiere el entorno de evaluacion propio del proyecto (Isaac Sim / Isaac Lab / Piper / EVIS) y no es un checkpoint ejecutable de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visomotora EWM/PyTorch con encoder DINOv3 ViT-L/16, encoder de texto T5-small y codec LeanVAE-dim16 (no disponible el detalle completo de la cabeza de politica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 24 pasos; 40 en variante asimetrica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pt`) |
| Idiomas soportados | no disponible (el encoder de texto es T5-small, multilingue por herencia, pero no se documenta uso linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (dependencias congeladas) y `.pt` (`checkpoint_step_080000.pt`) |

## Arquitectura y entrenamiento

Los checkpoints son politicas de aprendizaje por imitacion entrenadas sobre el simulador Piper con ocho tareas. Cada variante difiere en las modalidades de entrada y salida: `action_only_80k` predice solo acciones; `rgb_action_80k` anade prediccion de 24 muestras RGB con stride visual 2; `ewm_symmetric_stride2_80k` y `ewm_symmetric_stride1_80k` predicen 24 muestras de eventos con distinto downsampling temporal (`event_temporal_downsample` 2 y 1 respectivamente); y `ewm_asymmetric_stride2_80k` combina horizonte de accion 40 con 16 muestras de evento y stride 2. El nombre "symmetric/asymmetric" alude al numero de muestras de accion y visuales almacenadas, no a horizontes temporales reales equivalentes.

El entrenamiento se realizo hasta el paso 80.000 con stride de ventana de entrenamiento 1 en todas las variantes. La variante asimetrica tiene memoria y alineamiento desactivados pese al nombre historico de su configuracion. Las dependencias congeladas (DINOv3 ViT-L/16, T5-small, LeanVAE-dim16) se incluyen una sola vez y se comparten entre las cinco politicas; los pesos de politica excluyen estos modulos congelados. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se aplico RLHF/DPO (no aplicable en este dominio). El repositorio no incluye estados de optimizador, snapshots de RNG ni caches de entrenamiento: son politicas de evaluacion, no estados reanudables.

## Capacidades

- Control visomotor de un brazo robotico Piper en simulacion para ocho tareas de manipulacion.
- Prediccion de acciones con horizonte de 24 pasos (40 en la variante asimetrica).
- Prediccion visual de eventos futuros (world model) en las variantes EWM, con downsampling temporal configurable.
- Prediccion de frames RGB futuros en la variante `rgb_action_80k`.
- Codificacion de instrucciones textuales mediante T5-small (condicionamiento por lenguaje).
- No soporta tool calling ni function calling.
- No es un modelo de agentes multi-paso ni de razonamiento general.
- No dispone de capacidades multilingues documentadas ni de modo thinking.
- No incluye vision general, audio ni generacion de texto libre.

## Casos de uso

- Reproduccion de experimentos de world models en robotica: permite comparar cinco variantes (action-only, RGB-action, EWM simetrica stride 1/2 y asimetrica) bajo el mismo paso de entrenamiento para aislar el efecto de la prediccion visual y del downsampling temporal.
- Investigacion en aprendizaje por imitacion: sirve como baseline para estudiar como el horizonte de accion (24 vs 40) y la prediccion de eventos afectan al rendimiento en tareas Piper.
- Evaluacion en simulacion Isaac Sim / Isaac Lab: integrable en el pipeline de evaluacion del proyecto EWM con los assets de simulacion publicados, util para validar politicas antes de transferencia a hardware.
- Estudio de representaciones visuales congeladas: al usar DINOv3 ViT-L/16 como encoder fijo, permite analizar el impacto de representaciones preentrenadas en el control visomotor sin reentrenar el backbone.
- Analisis de codecs visuales: la dependencia LeanVAE-dim16 compartida permite investigar el efecto de la compresion latente en la prediccion de eventos.
- Docencia y divulgacion en robotica: como ejemplo reproducible de arquitectura de politica con world model y condicionamiento textual, siempre que se disponga del entorno de simulacion completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo completo ocupa 13,8 GB, pero cada checkpoint individual es menor; el peso dominante es DINOv3 ViT-L/16 congelado y LeanVAE.
- GPU recomendadas: no disponible de forma explicita; por el tamano del encoder ViT-L/16 se requiere una GPU con al menos 16-24 GB de VRAM para inferencia comoda, aunque no se documenta.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 por el tamano del encoder, pero no confirmado en la informacion disponible.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. Requiere los loaders del proyecto EWM y el entorno Isaac Sim / Isaac Lab / Piper / EVIS para simulacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (politicas visomotoras con world model sobre Piper).

## Limitaciones y advertencias

- No es un checkpoint `AutoModel` de Transformers ni un entorno de evaluacion autonomo; requiere codigo y simulador del proyecto EWM.
- Las rutas absolutas originales estan embebidas en el `model_config` serializado; migrar a otra maquina exige remapear `dino_path`, `text_path` y `event_vae_path` manualmente, y el repositorio no ofrece un loader automatico probado.
- La variante asimetrica tiene memoria y alineamiento desactivados pese al nombre de su configuracion.
- Licencia no disponible: no se puede confirmar el uso comercial. Las dependencias congeladas (DINOv3, T5, LeanVAE) conservan sus terminos upstream.
- Entrenado solo en simulacion Piper; no hay evidencia de transferencia a hardware real.
- Riesgo de sobreajuste a las ocho tareas y al entorno de simulacion concreto.
- No se documentan sesgos, idiomas ni comportamiento fuera del dominio robotico.
- El repositorio puede haber estado privado en el momento de la publicacion; se requiere autenticacion autorizada para descargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kritokronos/ewm_checkpoints
- Dataset de assets de simulacion: https://huggingface.co/datasets/kritokronos/ewm_assets
- Dataset de entrenamiento: https://huggingface.co/datasets/kritokronos/ewm_dataset
- Directorio action-only: https://huggingface.co/kritokronos/ewm_checkpoints/tree/main/action_only_80k
