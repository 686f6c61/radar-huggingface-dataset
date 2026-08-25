# Kasra99/groot_dex_warehouse_ae

## Resumen

`groot_dex_warehouse_ae` es un fine-tune del modelo base `nvidia/GR00T-N1.7-3B` de NVIDIA, especializado en tareas de pick-and-place en almacenes. El modelo ha sido desarrollado por Kasra Sinaei (Kasra99) y entrenado sobre el dataset teleoperado `Kasra99/dex-warehouse`, grabado en un manipulador móvil Dexmate Vega 1 Pro. Se trata de un modelo de tipo vision-language-action (VLA) que integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones de control para robótica.

La relevancia de este modelo radica en que demuestra el flujo de trabajo de fine-tune de GR00T N1.7 para un nuevo embodiment (robot no visto en el preentrenamiento), utilizando el mecanismo de "action expert" (ae): el backbone de lenguaje y visión permanece congelado, y solo se entrena el cabezal de acción basado en flow-matching. El modelo tiene 3.14B parámetros totales, de los cuales 1.62B (51.5%) son entrenables, y soporta una ventana de contexto de 40 pasos de acción nativos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7: LLM (Cosmos-Reason2 / Qwen3-VL) + vision tower + projector + DiT action head con flow-matching |
| Parametros totales | 3.14B |
| Parametros activos | 1.62B entrenables (proyector 327M + DiT 1.09B + vlln/vl-attn 201M); LLM 1.12B y vision tower 407M congelados |
| Longitud de contexto | 40 pasos de observacion / 40 pasos de accion (horizonte nativo N1.7) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (via LeRobot, requiere `lerobot[groot]`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, que combina un modelo de lenguaje grande (Cosmos-Reason2 / Qwen3-VL) con una torre de vision y un cabezal de accion basado en flow-matching. En esta variante "action expert", el LLM y la torre de vision estan congelados, y solo se entrenan el proyector de nuevo embodiment (327M parametros), el DiT de accion (1.09B) y las capas vlln/vl-attn (201M). El embodiment se registra con la etiqueta `new_embodiment` (slot 10), que no se utilizo en el preentrenamiento de NVIDIA, por lo que su proyector se inicializa aleatoriamente y se entrena desde cero con estadisticas de normalizacion del dataset.

El entrenamiento se realizo con 40.000 pasos y batch de 32, lo que equivale a 5.8 epocas sobre 219.260 frames de 177 episodios. Se uso el optimizador AdamW con learning rate 1e-4, scheduler coseno con warmup, y EMA con decay constante de 0.99 (los pesos publicados son los EMA). Se aplico aumento de datos fotometrico (brillo, contraste, saturacion, hue, nitidez) con maximo 3 aumentos por frame. No se utilizo split de validacion: los 177 episodios completos se usaron para entrenamiento.

El espacio de observacion incluye tres camaras renombradas a claves estilo GR00T/π (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) y un estado de 20 dimensiones que combina elevacion del torso, articulaciones de ambos brazos, apertura de la mano derecha, oposicion del pulgar y velocidades de la base movil. Se eliminaron dos grados de libertad de la mano izquierda del dataset original por su baja frecuencia de uso y rango cuantil anomalo.

## Capacidades

- Ejecucion de tareas de pick-and-place en almacen mediante instrucciones en lenguaje natural (22 instrucciones distintas).
- Manipulacion diestra con brazo derecho: el modelo se comporta como una politica de manipulacion con brazo derecho sobre base movil.
- Navegacion basica de base movil: comandos de velocidad lineal y angular (base_vx, base_vy, base_wz).
- Comprension de 5 objetos (banana, batman toy, bear toy, blue bird, box) y 5 destinos (box, gaylord, table, conveyor belt, pick-only).
- Generacion de acciones de 40 pasos de horizonte con flow-matching.
- Integracion con el ecosistema LeRobot para carga y despliegue.

## Casos de uso

- Automatizacion de picking en almacen: el modelo puede seleccionar objetos de una superficie y colocarlos en contenedores (box, gaylord) siguiendo instrucciones verbales, adecuado para entornos de logistica con inventario semi-estructurado.
- Tareas de "pick-only" (solo recoger): el modelo puede ejecutar la fase de agarre sin necesidad de colocacion, util para estaciones de clasificacion donde el operario recibe el objeto.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar el fine-tune de GR00T N1.7 con datos limitados (177 episodios) y un nuevo embodiment, evaluando el impacto del proyector entrenado desde cero.
- Desarrollo de politicas VLA para manipuladores moviles: el modelo demuestra la viabilidad de adaptar un VLA preentrenado a un robot con cinematica diferente sin reentrenar el backbone.
- Benchmark de generalizacion a instrucciones: permite estudiar la correlacion entre objeto y destino en los datos de entrenamiento y su efecto en la robustez de la politica.
- Prototipado de sistemas de robotica asistida en almacen: con la integracion LeRobot, puede desplegarse en el robot Dexmate Vega 1 Pro para pruebas de concepto en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se utilizo un conjunto de validacion y que la perdida de validacion es un proxy debil para el exito de la tarea en behavior cloning, recomendando evaluar el modelo directamente en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base GR00T N1.7-3B requiere aproximadamente 6-8 GB en FP16, pero el despliegue en robot anade requisitos de camaras y control en tiempo real.
- GPU recomendadas: no disponible. Se recomienda una GPU con al menos 8-12 GB de VRAM para inferencia en FP16 (p. ej., RTX 3080/4080, A10, L4).
- No se indica si cabe en GPU de consumo; por el tamano (3.14B), es plausible en RTX 3090/4090 con cuantizacion, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot (libreria principal), con soporte para `GrootPolicy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para LLM generativos, no para VLA roboticos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kasra99/groot_dex_warehouse_ae` | 3.14B | 40 pasos | VLA fine-tune para pick-and-place en almacen | nvidia-open-model-license | HuggingFace |
| `nvidia/GR00T-N1.7-3B` (base) | 3.14B | 40 pasos | VLA generalista para manipulacion | nvidia-open-model-license | HuggingFace |
| `Kasra99/so100-smolvla-trained` | 0.5B | no disponible | VLA fine-tune para robot SO-100 | no disponible | HuggingFace |

La comparativa se limita a modelos del mismo autor y al modelo base, ya que no se dispone de informacion sobre otros VLA de tamano similar con licencia abierta en la informacion proporcionada.

## Limitaciones y advertencias

- Datos limitados: entrenado con solo 177 episodios, es una politica de datos pequenos, no un generalista. Las instrucciones en la cola fina del dataset (p. ej., "conveyor belt" con 1.796 frames en 3 episodios) probablemente no funcionen.
- Correlacion objeto-destino: en los datos de entrenamiento, el objeto "bear toy" se coloca en la caja el 72% de las veces y nunca en la mesa. La politica puede basarse en el nombre del objeto en lugar de la frase de destino, lo que provoca fallos con combinaciones no vistas.
- Movimiento del brazo izquierdo: el brazo izquierdo se mueve en los datos, pero es probablemente deriva de teleoperacion, no manipulacion bimanual intencionada. La reproducibilidad entre episodios es baja (R² 0.087 vs 0.226 del brazo derecho). Tratar como politica de brazo derecho sobre base movil.
- Sin conjunto de validacion: no hay metricas de validacion fuera de entrenamiento. La seleccion de checkpoint debe hacerse evaluando en el robot.
- Licencia: nvidia-open-model-license, que permite uso comercial pero con condiciones especificas de NVIDIA. Revisar los terminos antes de uso en produccion.
- Riesgo de alucinacion en instrucciones: al ser un VLA, puede ejecutar acciones incorrectas si la instruccion no esta bien representada en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kasra99/groot_dex_warehouse_ae
- Dataset: https://huggingface.co/datasets/Kasra99/dex-warehouse
- Perfil del autor en HuggingFace: https://huggingface.co/Kasra99
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Perfil del autor en GitHub: https://github.com/Kasra99
