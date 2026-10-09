# kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000

# NAJY act all11 c100 m1 aff 27D 60k s1000

## Resumen

NAJY_act_all11_c100_m1_aff_27D_60k_s1000 es un checkpoint de politica robotica entrenado con ACT (Action Chunking with Transformers), la implementacion de aprendizaje por imitacion incluida en la libreria LeRobot de Hugging Face. Lo publica el usuario kiroaiseoul dentro de una serie de experimentos denominada NAJY, orientada a la tarea de laboratorio del banco de pruebas Trossen Mobile AI. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado del robot de 27 dimensiones y tres camaras a 480x640) a acciones de 16 dimensiones.

El checkpoint corresponde al paso 60.000 del run `t19_all11_c100_m1_aff_60k_s1000`, entrenado en una maquina DGX (identificada en la model card como "1호기 DGX_1"). El prefijo `all11` indica que cubre las 11 etapas de la tarea Mobile AI; `aff` hace referencia a un aumento de datos de tipo affine sobre la camara cenital; `27D` al estado de 27 dimensiones; `60k` al numero de pasos; y `s1000` a la semilla 1000. El modelo tiene 51.700.368 parametros y un peso de repositorio de 0,2 GB.

Su relevancia es acotada y muy especifica: se trata de un artefacto de investigacion subido explicitamente para analisis y puntuacion ("분석·채점용 업로드"), no de un modelo de produccion confirmado. Publicado bajo licencia Apache 2.0 y con 0 descargas y 0 likes en el momento de redactar esta ficha, su interes esta en la reproducibilidad del experimento (el autor publica el sha256 del safetensors y el manifiesto de aumento) y en la comparacion con los checkpoints hermanos de la misma serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), politica de aprendizaje por imitacion de LeRobot; no es un transformer de lenguaje |
| Parametros totales | 51.700.368 (dato real del safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (no define ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (politica robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `dd90d733d0946e18e7224bad4a018d20afd2b5b204f330058417f87134756899`) |
| Dimension de observacion de estado | 27 |
| Dimension de accion | 16 |
| Entradas visuales | 3 camaras a 3x480x640: `cam_high`, `cam_left_wrist`, `cam_right_wrist` |
| Paso de entrenamiento | 60.000 |
| Semilla | 1000 |
| Tamano del repositorio | 0,2 GB |
| Libreria / pipeline | lerobot / robotics |
| Fecha de creacion | 2026-10-08 |
| Fecha de actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

ACT es una politica de imitacion basada en transformer que predice "trozos" de acciones (action chunks) en lugar de una unica accion por paso, lo que reduce el error de composicion y suaviza el control. La formulacion habitual combina un backbone visual convolucional para procesar las imagenes de las camaras con un transformer encoder-decoder que fusiona la observacion de estado, y una cabeza variacional (CVAE) que modela la multimodalidad de las demostraciones humanas. Esta descripcion corresponde a la familia ACT implementada en LeRobot; la model card de este checkpoint no detalla la configuracion exacta de capas, cabezas de atencion ni horizonte de prediccion, por lo que esos datos concretos constan como no disponibles.

Los datos de entrenamiento proceden de la tarea Trossen Mobile AI (banco de pruebas de manipulacion movil), con 11 etapas y 27 dimensiones de estado. La unica tecnica de entrenamiento documentada explicitamente es un aumento de imagen affine aplicado sobre `observation.images.cam_high` con probabilidad 0,5, rotacion de 3 grados, traslacion maxima de 0,1 y escala en el rango [0,75; 1,1]. No se especifican en la informacion disponible el numero total de episodios, el numero de tokens o frames vistos, ni si se emplearon etapas de RLHF/DPO (que, por otra parte, no son el mecanismo de entrenamiento habitual en ACT). El autor referencia el contexto del experimento en `docs/mobile_base_investigation.md` §94 del proyecto trossen-ai-simulation.

## Capacidades

- Generacion de acciones de control continuo de 16 dimensiones a partir de observaciones visomotoras, en el marco de una politica de imitacion.
- Control bimanual: la presencia de camaras de muneca izquierda y derecha, junto con un estado de 27 dimensiones, es coherente con una plataforma de dos brazos sobre base movil.
- Cobertura de las 11 etapas de la tarea Mobile AI en un unico checkpoint (`all11`), en lugar de una politica por etapa.
- Percepcion visual multimodal: fusiona tres flujos de imagen de 480x640 con el vector de estado del robot.
- Robustez a variaciones de encuadre gracias al aumento affine documentado sobre la camara cenital.
- Capacidades de lenguaje natural, tool calling, function calling, agentes multi-paso, razonamiento, codigo, matematicas, vision general, audio o modo "thinking": no disponibles / no aplica. Es un controlador robotico, no un modelo fundacional de proposito general.
- Capacidad multilingue: no aplica (no procesa texto).

## Casos de uso

- Manipulacion movil en laboratorio: ejecucion de las 11 etapas de la tarea Trossen Mobile AI con una unica politica, evitando el cambio manual de checkpoint entre fases.
- Recogida y colocacion (pick and place) bimanual: las dos camaras de muneca permiten al modelo razonar sobre ambas pinzas de forma simultanea, adecuado para tareas de ensamblaje ligero.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para replicar experimentos de ACT y comparar el efecto del aumento affine (flag `image_affine` con p=0,5) frente a entrenamientos sin aumento.
- Ablaciones de semilla: los checkpoints hermanos con semillas 1000 y 2000 permiten medir la varianza entre semillas sobre las mismas 11 etapas.
- Evaluacion automatizada de politicas: el autor indica que la herramienta de puntuacion lee los flags desde `multi_manifest.json` en la misma carpeta, por lo que el modelo se integra directamente en pipelines de scoring (`--checkpoint <carpeta>`).
- Base para ajuste fino con datos propios de un robot Trossen Mobile AI: al estar en formato `pretrained_model` de LeRobot, puede recargarse y continuar el entrenamiento con un dataset adicional de ese hardware.
- Despliegue en el robot o en un equipo de inferencia cercano: con 51,7 M de parametros es viable ejecutar la politica en un Jetson Orin o en una GPU de gama media, siempre que se resuelva la latencia de captura de tres camaras.
- Analisis reproducible: el sha256 publicado permite verificar la integridad del archivo antes de usarlo en comparativas o evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de exito por etapa, tasas de exito en tarea real ni metricas de error de accion para este checkpoint.

La unica informacion de rendimiento disponible es cualitativa y procede de las model cards de los checkpoints hermanos de la misma serie, que el autor describe como comparaciones offline:

| Checkpoint hermano | Pasos | Semilla | Afirmacion del autor (offline) |
|---|---|---|---|
| NAJY_act_all11_hot_27D_120k_s1000 | 120.000 | 1000 | Mejor semilla en las etapas de locomocion; candidato a despliegue |
| NAJY_act_all11_hot_27D_120k_s2000 | 120.000 | 2000 | Mejor semilla en las etapas de manipulacion |
| NAJY_act_all11_c100_m1_aff_27D_60k_s1000 (este) | 60.000 | 1000 | Sin datos de rendimiento publicados; subida para analisis y puntuacion |

Estas afirmaciones no vienen acompanadas de numeros en la informacion disponible y deben tratarse como declaraciones del autor, no como resultados verificados.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16/bf16 (51,7 M de parametros). El consumo real de inferencia lo domina el procesamiento de tres imagenes de 480x640; una estimacion razonable es de 0,5 a 2 GB en fp16/bf16, si bien no hay mediciones publicadas para este checkpoint (estimacion propia, no dato del autor).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia; se sugiere RTX 3060/4060 o superior para mantener la frecuencia de control con tres camaras.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia; solo tendrian sentido para reentrenar o para barridos masivos de evaluacion.
- Cabe en GPU de consumo: si. Es previsible que funcione en GPUs de gama de entrada y en hardware embebido tipo Jetson Orin; tambien es tecnicamente posible ejecutarlo en CPU, con latencia mucho mayor.
- Opciones de despliegue: la via documentada es la libreria LeRobot (carga como `pretrained_model`, compatible con herramientas del ecosistema como `stage_cond_diag.py`). No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que son stacks para modelos de lenguaje y no aplican a esta politica. Una exportacion a ONNX o TensorRT seria posible tecnicamente, pero no esta publicada ni verificada.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni tamano del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / semilla | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_m1_aff_27D_60k_s1000 (este) | 51,7 M | 60.000 / 1000 | 11 etapas, con aumento affine en cam_high | Apache 2.0 | Publico en Hugging Face, 0 descargas |
| NAJY_act_all11_hot_27D_120k_s1000 | no disponible en la informacion | 120.000 / 1000 | 11 etapas | Apache 2.0 | Publico en Hugging Face |
| NAJY_act_all11_hot_27D_120k_s2000 | no disponible en la informacion | 120.000 / 2000 | 11 etapas | Apache 2.0 | Publico en Hugging Face |

Las tres variantes pertenecen a la misma familia ACT sobre la misma tarea y plataforma, por lo que se diferencian en pasos de entrenamiento y semilla, no en arquitectura. No se dispone de datos para comparar con otras politicas del ecosistema LeRobot (por ejemplo Diffusion Policy o SmolVLA): "no disponible".

## Limitaciones y advertencias

- Modelo no generalista: es una politica entrenada para una tarea concreta (laberinto de 11 etapas de Trossen Mobile AI) y un hardware concreto (estado de 27 dimensiones, accion de 16). No transferira a otro robot ni a otra tarea sin reentrenamiento o ajuste fino.
- Artefacto de investigacion, no de produccion: la propia model card indica que se sube para analisis y puntuacion y que la confirmacion como candidato de despliegue real es un asunto aparte.
- Sin evidencia de rendimiento: 0 descargas, 0 likes y ninguna tabla de resultados de exito. Cualquier uso en produccion requeriria una evaluacion propia, preferiblemente en bucle cerrado sobre el robot.
- Riesgo de sobreajuste: al ser un checkpoint de un unico paso (60.000) de un run concreto, sin curva de validacion publicada, no puede descartarse sobreajuste a las demostraciones de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el equivalente en politicas de imitacion, es decir, ejecucion de acciones plausibles pero incorrectas cuando la observacion se sale de la distribucion de entrenamiento (por ejemplo, iluminacion, oclusion de camaras o posiciones iniciales distintas).
- Dependencia del aumento de datos: la unica configuracion de aumento documentada afecta solo a `observation.images.cam_high`; las camaras de muneca no tienen aumento declarado, lo que puede generar asimetrias de robustez entre vistas.
- Reproducibilidad: el autor publica el sha256 del archivo, por lo que conviene verificar la integridad (`sha256sum model.safetensors`) antes de usarlo. La primera linea del log de entrenamiento aparece como "?" en la model card, un dato que no se puede reconstruir.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no implica ninguna garantia sobre el comportamiento del modelo ni sobre su idoneidad para operar un robot real; el riesgo fisico del despliegue recae en quien lo integra.
- Inexistencia de capacidades de lenguaje: no puede interpretar instrucciones en lenguaje natural ni participar en flujos de agentes basados en texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000
- Checkpoint hermano (semilla 1000, 120.000 pasos): https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000
- Checkpoint hermano (semilla 2000, 120.000 pasos): https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s2000
- Referencia documental citada por el autor: `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94 (sin URL directa disponible en la informacion proporcionada)

Nota: la busqueda web devolvio tambien enlaces a la documentacion de Kiro y a un directorio de creadores de contenido coreano que no guardan relacion con este modelo, por lo que se han omitido.
