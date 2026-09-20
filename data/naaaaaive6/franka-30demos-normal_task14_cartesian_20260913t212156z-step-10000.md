# NaaaaaiVe6/franka-30demos-normal_task14_cartesian_20260913T212156Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado por el usuario NaaaaaiVe6 dentro del ecosistema openpi, con el identificador `franka-30demos-normal_task14_cartesian_20260913T212156Z-step-10000`. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado al control de un manipulador Franka, entrenado sobre 30 demostraciones de una única tarea (identificada como `task14`) y guardado en el paso 10.000. El tag `pi05` lo sitúa en la familia π0.5, aunque la model card no detalla la arquitectura interna ni el procedimiento de entrenamiento.

El modelo tiene 3.616.757.520 parámetros (unos 3,62 mil millones) almacenados en `safetensors` en precisión bfloat16, con un repositorio de 7,2 GB. La salida no es texto ni código: produce 50 pasos de acción con 32 coordenadas cada uno, de las cuales únicamente las ocho primeras corresponden a acciones reales del robot. La representación de acción es cartesiana absoluta (XYZ + cuaternión xyzw + pinza binaria -1/+1), explícitamente distinta de las acciones delta de controlador.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de conversión de un checkpoint JAX a PyTorch bfloat16 dentro de openpi, y como punto de partida para experimentos de imitación en Franka. El repositorio no tiene descargas ni valoraciones, no declara licencia y no publica benchmarks, por lo que debe tratarse como material experimental sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) de la familia π0.5, segun el tag `pi05`; la model card no detalla la arquitectura interna (no disponible) |
| Parametros totales | 3.616.757.520 (aprox. 3,62 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bfloat16 y no se ofrece GGUF ni otras variantes |
| Idiomas soportados | No disponible (modelo de robótica; no se documenta soporte de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16, convertidos de JAX a PyTorch) |

## Arquitectura y entrenamiento

La model card indica que el checkpoint se convirtió de JAX a PyTorch en bfloat16 conservando la configuración original de entrenamiento para Franka. No se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El entrenamiento se realizó sobre 30 demostraciones de una tarea concreta (`task14`), con representación de acción cartesiana absoluta: posición XYZ, cuaternión xyzw y estado binario de pinza expresado como -1/+1.

El aspecto técnico más destacable documentado es el formato de salida: horizonte de 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras son acciones del robot. El resto de coordenadas no se describe en la model card, por lo que su semántica queda como no disponible. La normalización se delega a `assets/franka/norm_stats.json` junto con las transformaciones de entrenamiento correspondientes, y el archivo `log.txt` del repositorio contiene el layout de salida, el límite de normalización, las entradas de cámara y estado y las convenciones de controlador que, según el propio autor, requieren confirmación.

## Capacidades

- Generación de trayectorias de acción para un manipulador Franka en espacio cartesiano absoluto (XYZ + cuaternión xyzw).
- Control binario de pinza mediante salida -1/+1.
- Predicción con horizonte de 50 pasos de acción y 32 coordenadas por paso.
- Consumo de entradas de cámara y estado del robot, según lo referido en `log.txt` (detalle no disponible en la model card).
- Normalización de entradas y salidas mediante `norm_stats.json` y transformaciones de entrenamiento asociadas.
- Ejecución dentro del framework openpi, con librería declarada `openpi` y pipeline `robotics`.
- No se documenta tool calling ni function calling.
- No se documenta comportamiento agéntico ni razonamiento multi-paso simbólico.
- No se documentan capacidades multilingües, de generación de texto, de código, matemáticas, visión general o audio.
- No se documenta un modo de razonamiento explícito (thinking mode).
- No se documenta entrenamiento de refuerzo a partir de retroalimentación humana.

## Casos de uso

- Replicación de una tarea Franka concreta: el checkpoint está entrenado sobre 30 demostraciones de `task14`, por lo que puede usarse para reproducir esa tarea concreta en un banco de pruebas con la misma configuración de cámara, estado y controlador.
- Punto de partida para fine-tuning: al estar en openpi con pesos safetensors, sirve como inicialización para reentrenar sobre nuevas demostraciones de Franka sin partir de cero.
- Validación de la conversión JAX a PyTorch: útil para comprobar que la conversión bfloat16 preserva el comportamiento respecto al checkpoint original en JAX.
- Evaluación de pipelines de normalización: el par `norm_stats.json` más transformaciones de entrenamiento permite verificar que las estadísticas de normalización se aplican correctamente en inferencia.
- Investigación en representaciones de acción: su formato cartesiano absoluto con cuaternión y pinza binaria permite comparar contra políticas que usan acciones delta de controlador.
- Docencia y prototipado en robótica: con 3,62 mil millones de parámetros y 7,2 GB de pesos, es viable desplegarlo en una GPU de gama alta para experimentos de imitación en laboratorio.
- Auditoría de convenciones de controlador: el propio `log.txt` señala convenciones pendientes de confirmación, lo que lo convierte en un caso de estudio sobre riesgos de integración robot-política.
- Análisis de checkpoints intermedios: al estar etiquetado como paso 10.000, permite estudiar la evolución del entrenamiento frente a checkpoints posteriores del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones cuantitativas con otras políticas. Tampoco se aportan datos de latencia o frecuencia de control.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 7,2 GB, coherente con los 3.616.757.520 parametros y con el tamano del repositorio (7,2 GB).
- VRAM estimada para inferencia: en el entorno de 10-16 GB, dependiendo del batch, de la resolucion de las camaras de entrada y del coste del codificador visual; no hay cifra oficial publicada.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB), A6000 (48 GB) para despliegue comodo con margen para vision y batch.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 con los pesos en bfloat16 y batch pequeno. No es viable en GPUs de 8-12 GB sin cuantizacion, y no se publican pesos cuantizados.
- Opciones de despliegue: framework openpi (libreria declarada), con los pesos en PyTorch bfloat16; tambien es posible el flujo original en JAX. vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos del checkpoint analizado no permiten una comparacion cuantitativa, ya que no publica metricas. La tabla siguiente recoge unicamente parametros y disponibilidad de referencia de la familia, marcando explicitamente lo no verificado en esta busqueda.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-30demos-normal_task14_cartesian (este checkpoint) | 3,62 mil millones | VLA para Franka, tarea unica | No disponible | No disponible | Repositorio HuggingFace con 0 descargas |
| π0.5 (familia a la que apunta el tag `pi05`) | No disponible en esta busqueda | VLA generalista | No disponible | No disponible | No verificado |
| π0 (referencia publica de la misma familia) | Aprox. 3,3 mil millones (informacion publica de referencia) | VLA generalista | No disponible | No disponible | No verificado |
| OpenVLA (referencia publica de VLA abierto) | Aprox. 7 mil millones (informacion publica de referencia) | VLA generalista | No disponible | No disponible | No verificado |

Las cifras de los modelos alternativos son valores de referencia publicos y no se han confirmado con una fuente primaria en esta busqueda; se incluyen solo como orden de magnitud para situar el tamano de este checkpoint.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no puede asumirse permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin validacion externa: 0 descargas y 0 likes implican que no hay evidencia de terceros sobre su funcionamiento.
- Especializacion extrema: entrenado sobre 30 demostraciones de una sola tarea (`task14`), por lo que la generalizacion a otras tareas, objetos o disposiciones no está respaldada.
- Representacion de accion no estandar: usa acciones cartesianas absolutas (XYZ + cuaternion xyzw + pinza binaria -1/+1) y no deltas de controlador; integrarlo con un controlador que espere deltas produce comportamiento incorrecto.
- Formato de salida ambiguo: de las 32 coordenadas por paso, solo las ocho primeras son acciones; el significado del resto no se documenta.
- Dependencia de activos externos: requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento exactas; omitirlos invalida las predicciones.
- Convenciones de controlador sin confirmar: el propio autor remite a `log.txt` indicando convenciones que requieren confirmacion.
- Riesgo de divergencia por la conversion: el paso de JAX a PyTorch bfloat16 puede introducir diferencias numericas no cuantificadas frente al checkpoint original.
- Checkpoint intermedio: la etiqueta `step-10000` sugiere un punto intermedio del entrenamiento, no necesariamente el modelo final ni el mejor.
- Riesgo de alucinacion de acciones: como toda politica de imitacion, puede generar trayectorias plausibles pero fisicamente invalidas ante entradas fuera de distribucion.
- Sin datos de sesgo, idioma o contexto: al no haber informacion sobre dataset, no puede evaluarse sesgo ni cobertura linguistica.
- Inconsistencia temporal en los metadatos: la fecha de creacion indicada (2026-09-19) y la marca temporal del nombre del archivo (20260913) son posteriores a la fecha habitual de referencia, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task14_cartesian_20260913T212156Z-step-10000
- Archivo `log.txt` dentro del repositorio (layout de salida, limite de normalizacion, entradas de camara y estado, convenciones de controlador pendientes de confirmacion).
- Archivo `assets/franka/norm_stats.json` dentro del repositorio (estadisticas de normalizacion).
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su familia o a documentacion tecnica asociada.
