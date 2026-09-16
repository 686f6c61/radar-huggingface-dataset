# JackieMM/robotwin-pi05-arx-training

## Resumen

JackieMM/robotwin-pi05-arx-training no es un modelo publicado como tal, sino un repositorio de punto de entrada reproducible para el ajuste fino del modelo vision-language-action (VLA) pi0.5 sobre datos reales del robot ARX X5. El repositorio contiene scripts de aprovisionamiento y entrenamiento (`setup_openpi.sh`, `train_from_hf.sh`, `train_pi05_lora.py`) que clonan un checkout fijado de RoboTwin/XPolicyLab, instalan OpenPI y lanzan un ajuste con LoRA de los parámetros pi0.5 DROID.

El problema que resuelve es de infraestructura y reproducibilidad: permite descargar automáticamente un dataset de LeRobot de dos cámaras (71 episodios, 25.920 fotogramas), copiar su `norm_stats.json` correspondiente y entrenar una política de manipulación sin conectar ningún robot físico durante el proceso. El modelo base, pi0.5, no se distribuye aquí; los checkpoints resultantes son artefactos locales que no se incluyen en el repositorio.

Es relevante ahora porque ejemplifica el flujo actual de ajuste eficiente de políticas robóticas de propósito general: reutilizar pesos preentrenados a gran escala y adaptarlos con LoRA a un brazo concreto y a un conjunto reducido de demostraciones, con soporte opcional de sharding FSDP en dos GPUs. No se dispone de datos sobre arquitectura interna, número de parámetros, licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política vision-language-action (VLA) basada en pi0.5 (el repositorio no detalla la arquitectura interna; se aplica un adaptador LoRA sobre los parámetros pi0.5 DROID) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el entrenamiento documentado usa JAX/OpenPI, sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en la model card ni en las etiquetas del repositorio) |
| Formato de pesos | no disponible (los checkpoints se generan localmente con OpenPI; se cargan los parámetros preentrenados pi0.5 DROID) |
| Tipo de artefacto | Repositorio de scripts de entrenamiento; no contiene pesos publicados |
| Modalidad de entrada | Dos cámaras: `cam_high` y `cam_right_wrist` (la imagen de muñeca izquierda se enmascara) |
| ABI de acción/estado | 14 dimensiones |
| Framework de entrenamiento | OpenPI (JAX) sobre checkout fijado de RoboTwin/XPolicyLab |
| Método de ajuste | LoRA, 30.000 pasos, guardado cada 5.000 pasos (`--save-interval 5000`, `--keep-period 5000`) |
| Dataset de ajuste | `JackieMM/LQ-20260915-1-all71-2cam`: 71 episodios, 25.920 fotogramas; alternativa `JackieMM/LQ-20260915-1-first50-2cam`: 50 episodios, 18.191 fotogramas |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base pi0.5. Lo que sí se documenta es el procedimiento de ajuste: se parte de los parámetros pi0.5 DROID, se cargan junto con el `norm_stats.json` del dataset de LeRobot y se ejecuta un ajuste con LoRA limitado a las cámaras `cam_high` y `cam_right_wrist`, con un ABI de acción/estado de 14 dimensiones. La imagen de muñeca izquierda no se replica a partir de otra cámara: OpenPI la enmascara explícitamente.

El entrenamiento por defecto ejecuta 30.000 pasos con guardado cada 5.000 y conservación periódica de checkpoints. El script rechaza sobrescribir un directorio de checkpoints existente y admite reanudación mediante `--resume` usando el mismo directorio de trabajo. Para el escalado horizontal se ofrece sharding FSDP con `--gpu 0,1 --fsdp-devices 2`, con la advertencia explícita del autor de que FSDP puede reducir la memoria por GPU pero resultar más lento que una sola GPU debido a la comunicación entre dispositivos. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica para el brazo ARX X5 a partir de observaciones visuales de dos cámaras.
- Fusión de vistas cenital y de muñeca derecha (`cam_high`, `cam_right_wrist`) en una única política, con enmascaramiento de la tercera vista.
- Producción y consumo de estados y acciones de 14 dimensiones según el ABI declarado.
- Ajuste fino parametrizado eficiente (LoRA) sobre pesos preentrenados pi0.5 DROID.
- Entrenamiento multi-GPU mediante FSDP, con paralelismo a nivel de datos y parámetros.
- Reanudación de entrenamientos interrumpidos mediante checkpoints periódicos.
- Integración con el ecosistema LeRobot para la carga de datasets y estadísticas de normalización.
- Ejecución reproducible sobre un checkout fijado de RoboTwin/XPolicyLab, orientada a experimentos de simulación y transferencia.
- No se documentan capacidades de generación de texto, razonamiento simbólico, tool calling, function calling, agentes multi-paso, matemáticas, código, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación de mesa con un ARX X5 real: el pipeline ajusta una política con demostraciones propias del laboratorio, de modo que el brazo ejecute tareas de recogida y colocación a partir de las dos cámaras configuradas y de un vector de estado de 14 dimensiones.
- Investigación en aprendizaje por imitación: el repositorio permite reproducir experimentos de ajuste de un VLA preentrenado sobre un conjunto pequeño de episodios (71 episodios, 25.920 fotogramas), útil para estudiar sensibilidad al número de demostraciones o al número de pasos de entrenamiento.
- Adaptación a un robot o configuración de sensores concretos: cambiar el dataset de LeRobot y el ABI permite trasladar el flujo a otro efector o a otra disposición de cámaras, reutilizando los pesos pi0.5 DROID como inicialización.
- Estudio de eficiencia de LoRA en políticas robóticas: al congelar el modelo base y entrenar solo adaptadores, es posible comparar coste de memoria y tiempo de ajuste frente a un ajuste completo, usando el mismo script y dataset.
- Validación previa en simulación con RoboTwin: dado que el repositorio se apoya en el checkout de RoboTwin/XPolicyLab, el flujo sirve para entrenar y evaluar políticas en simulación antes de trasladarlas al hardware físico.
- Ablación de configuraciones multi-cámara: el enmascaramiento explícito de la vista de muñeca izquierda permite medir el impacto de eliminar una cámara sin duplicar la señal de otra, algo relevante al reducir coste de sensores.
- Aprovisionamiento reproducible de entornos de entrenamiento: `setup_openpi.sh` fija la versión de OpenPI y del submódulo XPolicyLab, lo que facilita reconstruir el entorno en máquinas nuevas y comparar resultados entre laboratorios.
- Formación de pipelines de ajuste con presupuesto de GPU limitado: con una sola RTX 4090 de 24 GB, batch size 1 y `XLA_PYTHON_CLIENT_ALLOCATOR=platform`, el flujo está pensado para ejecutarse en hardware de gama alta de consumo, no solo en clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra exacta; el autor documenta que el entrenamiento es viable en una RTX 4090 de 24 GB con batch size 1 y `XLA_PYTHON_CLIENT_ALLOCATOR=platform`.
- GPU recomendadas: RTX 4090 de 24 GB como configuración mínima documentada; no se especifican A100, H100 ni otros aceleradores.
- Configuración multi-GPU: soportada mediante `--gpu 0,1 --fsdp-devices 2`; el autor advierte que FSDP puede ser más lento que una sola GPU por la comunicación entre dispositivos, por lo que solo se recomienda cuando la memoria es insuficiente.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 de 24 GB según la documentación; no se indica comportamiento en GPUs con menos memoria.
- Software necesario: Python 3.11 o superior, `uv`, controladores NVIDIA y runtime CUDA 12.x.
- Opciones de despliegue: OpenPI sobre el checkout fijado de RoboTwin/XPolicyLab. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no resultan aplicables al tratarse de una política de acción y no de un modelo de lenguaje generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JackieMM/robotwin-pi05-arx-training | Repositorio de ajuste LoRA sobre pi0.5 para ARX X5 | no disponible | no disponible | no disponible | Repositorio de scripts en HuggingFace; sin pesos publicados |
| pi0.5 (modelo base referenciado) | VLA preentrenado (parámetros DROID) | no disponible en la información proporcionada | no disponible | no disponible | Referenciado como origen de los pesos; no enlazado en la documentación analizada |
| Otras políticas VLA de manipulación (por ejemplo, OpenVLA o RDT-1B) | Políticas vision-language-action | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la información proporcionada para establecer comparaciones cuantitativas de parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se declara licencia en el repositorio ni en la model card, por lo que no puede asumirse uso comercial ni redistribución de los checkpoints derivados.
- No hay pesos publicados: los checkpoints son artefactos locales y el repositorio solo contiene scripts, por lo que no es posible evaluar el modelo sin ejecutar el entrenamiento.
- El ajuste se realiza sobre 71 episodios y 25.920 fotogramas, un volumen reducido que puede favorecer el sobreajuste y limitar la generalización a objetos, iluminación o posiciones no representadas.
- La política está condicionada a un ABI de acción/estado de 14 dimensiones y a dos cámaras concretas; reutilizarla en otro robot o montaje exige verificar la compatibilidad del ABI y del dataset.
- La vista de muñeca izquierda se enmascara en lugar de duplicarse, lo que implica pérdida deliberada de información: configuraciones con tres cámaras útiles no se aprovechan en este flujo.
- No hay benchmarks ni tasas de éxito publicadas, de modo que el rendimiento real de la política ajustada es desconocido.
- El entrenamiento requiere autenticación con un token de lectura de HuggingFace; la documentación advierte de no incluir el token en ficheros del repositorio, un riesgo operativo a gestionar.
- Depende de un checkout fijado de RoboTwin/XPolicyLab y de OpenPI con Python 3.11+, `uv` y CUDA 12.x; desviarse de esas versiones puede romper la reproducibilidad.
- El script rechaza sobrescribir directorios de checkpoints existentes, lo que obliga a gestionar manualmente rutas de trabajo y reanudaciones.
- El uso de FSDP en dos GPUs puede degradar el rendimiento frente a una sola GPU, según advierte el propio autor.
- Al tratarse de una política que controla hardware físico, cualquier despliegue real exige límites de par, paradas de emergencia y validación en entorno seguro; la model card no aborda aspectos de seguridad.
- No se documentan sesgos, cobertura idiomática ni comportamiento ante entradas fuera de distribución.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JackieMM/robotwin-pi05-arx-training
- Dataset completo (71 episodios, 25.920 fotogramas): https://huggingface.co/datasets/JackieMM/LQ-20260915-1-all71-2cam
- Dataset reducido (50 episodios, 18.191 fotogramas): https://huggingface.co/datasets/JackieMM/LQ-20260915-1-first50-2cam
- RoboTwin (repositorio referenciado en la documentación): https://github.com/RoboTwin-Platform/RoboTwin
- OpenPI (repositorio referenciado en la documentación): https://github.com/Physical-Intelligence/openpi
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas de un minorista de bricolaje), por lo que no se han encontrado papers, blogs, repos adicionales ni demos relevantes.
