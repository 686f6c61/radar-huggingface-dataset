# afhwoinavsnvo/VLAct-OFT-State-TCP

## Resumen

VLAct-OFT-State-TCP es un modelo de vision-lenguaje-acción (VLA) para control robótico bimanual, publicado por el usuario afhwoinavsnvo como artefacto de investigación. Parte del checkpoint StarVLA/VLAct_Qwen3OFT_Robotwin_Finetune, un VLM Qwen3-VL de 4.000 millones de parámetros adaptado a robótica, y le añade condicionamiento explícito por estado articular actual y por pose TCP objetivo. El resultado es una política que, dadas imágenes multivista y una instrucción en lenguaje natural, predice secuencias de 32 acciones de 14 dimensiones para un robot de dos brazos con pinzas.

La relevancia del modelo es metodológica más que de producto: demuestra cómo inyectar información proprioceptiva y un objetivo cartesiano (pose TCP futura) en un VLM congelado mediante proyecciones y codificadores ligeros, sin reentrenar el backbone. Solo se entrenan unos 77,5 millones de parámetros nuevos sobre un VLM congelado, lo que abarata el ajuste y preserva las capacidades del modelo base.

Se distribuye como checkpoint completo (9,2 GB) con los pesos del VLM congelado incluidos, pero no es un `AutoModel` estándar: requiere el código VLAct en un commit concreto y un servidor de política propio. No se ha medido ninguna tasa de éxito en benchmark de bucle cerrado RoboTwin, por lo que debe tratarse como un artefacto de reproducibilidad experimental, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL (backbone congelado) + proyección lineal 2560→2560 + codificadores MLP de estado y TCP + cabeza OFT MLPResNet |
| Parámetros totales | no disponible (repo de 9,2 GB; VLM base Qwen3-VL-4B más ~77,494 M entrenables) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `pytorch_model.pt`) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final_model/pytorch_model.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo recibe imágenes RGB multivista y una instrucción de tarea que entran en Qwen3-VL. Los 32 embeddings de token de acción que produce el VLM pasan por una proyección lineal añadida de 2560→2560 inicializada como identidad. En paralelo, dos codificadores MLP independientes (estado actual y TCP objetivo, ambos `14 → 1024 → 2560` con GELU) generan un vector de condición cada uno que se difunde (broadcast) sobre las 32 posiciones de acción y se suma a las características proyectadas. Finalmente, una cabeza OFT MLPResNet predice 32 acciones de 14 dimensiones cada una. No hay entrada de presupuesto temporal ni cabeza de acción DiT; `action_dit_loss` en los logs es un nombre de compatibilidad para la misma regresión de acción.

El entrenamiento congela todo el VLM (incluida su última capa Transformer) en modo eval y solo actualiza la proyección, los dos codificadores y la cabeza, unos 77,494 millones de parámetros. Se usaron las 50 tareas y 2.500 trayectorias del dataset RoboTwin-Clean-TCP (549.787 fotogramas de observación), con 2 GPU, batch de 16 por GPU, acumulación de gradiente 1, semilla 42, 50.000 actualizaciones y 5.000 de warmup. Se mantuvieron el balanceo de tareas original y el contrato de pérdida OFT con articulaciones envueltas. Los objetivos futuros siguen el esquema 2: se muestrea uniformemente `[t+64, t+96)` solo si la ventana completa cabe en las observaciones Clean; en caso contrario se usa la última observación Clean (variante Clean-last).

## Capacidades

- Generación de acciones robóticas bimanuales: 32 pasos de 14 dimensiones en el orden `[left_joints(6), right_joints(6), left_gripper, right_gripper]`.
- Percepción visual multivista combinada con instrucciones en lenguaje natural.
- Condicionamiento por estado proprioceptivo actual (14 dimensiones de articulaciones y pinzas).
- Condicionamiento por pose TCP objetivo (7D por brazo, `[x, y, z, qw, qx, qy, qz]` en coordenadas de mundo y metros).
- Especialización en las 50 tareas del entorno RoboTwin.
- No soporta tool calling, function calling, agentes multi-paso ni modos de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en manipulación bimanual: replicar el experimento de condicionamiento por estado y TCP sobre RoboTwin para estudiar cómo afecta la información proprioceptiva y de objetivo cartesiano al rendimiento de políticas VLA.
- Ajuste eficiente de VLMs para robótica: servir como receta de referencia para congelar un VLM de 4B y entrenar solo ~77 M de parámetros nuevos, reduciendo coste de cómputo frente a fine-tuning completo.
- Evaluación de contratos de entrada/salida: usar los ficheros `target_tcp_contract.json` y las estadísticas incluidas para validar pipelines de normalización de estado y transformación de TCP antes de desplegar políticas propias.
- Generación de trayectorias condicionadas a objetivo: en un simulador, proporcionar una pose TCP futura deseada y obtener la secuencia de articulaciones para alcanzarla, útil para planificación de alto nivel asistida por lenguaje.
- Estudio de generalización por tarea: al cubrir 50 tareas del dataset, permite analizar el comportamiento del modelo por familia de manipulación (apilado, vertido, inserción) en entornos controlados.
- Base para ablaciones: comparar la variante State-TCP frente al checkpoint original StarVLA/VLAct_Qwen3OFT_Robotwin_Finetune para aislar el efecto de los codificadores añadidos.
- Docencia y divulgación: ejemplo didáctico de arquitectura VLA híbrida (VLM congelado + cabezas ligeras) con contratos de datos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha medido ninguna tasa de éxito en bucle cerrado sobre RoboTwin y que la pérdida de entrenamiento no constituye una puntuación de benchmark. Las únicas validaciones reportadas son 90 tests de CPU superados y una preflight de datos que verificó 50 tareas, 2.500 episodios, 549.787 fotogramas y 2.500 sidecars TCP.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 9,2 GB e incluye el VLM de 4B más los módulos entrenados; en precisión completa (fp32) se superan los 16 GB, en bf16/fp16 se estiman en torno a 8-10 GB para los pesos, más memoria para activaciones y procesamiento de imágenes multivista.
- GPU recomendadas: A100 o H100 para despliegue cómodo en bf16; RTX 4090 (24 GB) es viable en bf16 si el servidor de política y el procesador de imágenes caben en memoria.
- GPU de consumo: sí es probable que quepa en RTX 4090 o RTX 3090 (24 GB) en bf16; en GPUs de 16 GB o menos requeriría cuantización, para la cual no se documentan recetas.
- Opciones de despliegue: exclusivamente el servidor de política del código VLAct (`deployment/model_server/server_policy.py --ckpt_path`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint `AutoModel` estándar.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de vistas de cámara y del coste de decodificar 32 tokens de acción de 14 dimensiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLAct-OFT-State-TCP | VLM 4B + ~77,5 M entrenables | no disponible | VLA bimanual RoboTwin | no disponible | Hugging Face (repo de 9,2 GB) |
| StarVLA/VLAct_Qwen3OFT_Robotwin_Finetune | VLM 4B + cabeza OFT | no disponible | VLA bimanual RoboTwin | no disponible | Hugging Face |
| StarVLA/Qwen3-VL-4B-Instruct-Action | VLM 4B | no disponible | VLM con acción (assets y procesador) | no disponible | Hugging Face |
| OpenVLA (referencia de categoría) | ~7B | no disponible en esta ficha | VLA de un brazo | no disponible en esta ficha | Hugging Face |

La comparación con OpenVLA u otras políticas VLA de la literatura no puede cuantificarse con datos de esta ficha; los tres modelos de la familia StarVLA comparten backbone Qwen3-VL-4B y solo difieren en las cabezas y el condicionamiento añadido.

## Limitaciones y advertencias

- No es un `AutoModel` estándar: requiere el código VLAct en el commit 32705af y mantener el layout del repositorio (configuración, estadísticas y contrato TCP en el directorio abuelo del checkpoint).
- No se ha evaluado en bucle cerrado; no hay evidencia de tasa de éxito real en RoboTwin. Cualquier uso en producción es prematuro.
- Dependencia de datos externos: el dataset RoboTwin-Clean-TCP excluye todos los vídeos, por lo que el entrenamiento RGB requiere los vídeos upstream; la inferencia necesita además un TCP objetivo futuro proporcionado externamente (una observación TCP actual no sirve como objetivo).
- Convenciones de coordenadas estrictas: el TCP se define como EE trasladado 0,12 m a lo largo del eje x local, en metros y coordenadas de mundo; la normalización de estado articular no debe aplicarse al vector TCP. Un error aquí invalida las predicciones.
- El servidor de política aplica la transformación de estado de entrenamiento una sola vez; las llamadas directas al modelo esperan estado ya transformado.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Sesgos: no documentados, pero al entrenarse solo con 50 tareas de un simulador concreto, la generalización a otros robots, morfologías o entornos del mundo real es altamente incierta.
- Riesgo de alucinación de acciones: como todo modelo generativo, puede producir secuencias no físicamente plausibles; no se documentan mecanismos de seguridad ni límites articulares.
- Licencia no disponible: no se puede confirmar el uso comercial. Contactar con el autor antes de cualquier despliegue productivo.
- Los ficheros de configuración contienen rutas absolutas de la máquina de entrenamiento original; no son destinos de descarga necesarios, pero conviene revisarlas antes de reentrenar.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afhwoinavsnvo/VLAct-OFT-State-TCP
- Dataset RoboTwin-Clean-TCP: https://huggingface.co/datasets/afhwoinavsnvo/RoboTwin-Clean-TCP
- Código VLAct (commit fijado 32705af): https://github.com/afhwoinavsnvo/VLAct/tree/32705af248c755029780e1dcf8cf1fea10bb5e21
- Pesos VLM fuente: https://huggingface.co/StarVLA/VLAct_Qwen3OFT_Robotwin_Finetune
- Assets de construcción y procesador: https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action
