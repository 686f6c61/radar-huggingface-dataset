# OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4

## Resumen

`OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4` es un paquete de pesos cuantizados a 4 bits (NF4) que envuelve el checkpoint XR-1 RoboCasa365 de Xiaomi Robotics, un modelo vision-language-action (VLA) de 5B parámetros orientado a manipulación robótica generalista en entornos de cocina. Lo publica OpenRAL como "rSkill", un formato de integración propietario que añade un adaptador de observaciones y acciones sobre el modelo base, de modo que el checkpoint original de Xiaomi pueda consumirse desde el runtime de OpenRAL con un contrato de entrada/salida bien definido.

El modelo resuelve el problema de traducir políticas VLA entrenadas en RoboCasa365 (un benchmark de manipulación de cocina con robots PandaMobile) a un formato desplegable y cuantizado. El adaptador conserva siete observaciones temporales, muestrea cuatro fotogramas en los offsets `[-6, -4, -2, 0]`, convierte el estado cuaternión de 16 dimensiones de OpenRAL al estado eje-ángulo de 14 dimensiones que espera el evaluador de Xiaomi, aplica un recorte central de 0,95 y reproduce dieciséis acciones decodificadas por consulta antes de replanificar.

Es relevante ahora porque es uno de los pocos empaquetados públicos que permiten ejecutar un VLA de 5B en hardware modesto gracias a la cuantización NF4, aunque con una advertencia importante: la carga de estos pesos requiere OpenRAL Pro, ya que la versión open source de OpenRAL solo admite fp32, fp16 y bf16. Además, el propio autor reconoce que la reproducibilidad de los benchmarks está bloqueada porque Xiaomi no fija la revisión exacta de RoboCasa365.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en XR-1 5B; transformer multimodal con cabecera de acciones (detalles internos no disponibles) |
| Parametros totales | 5.053.149.696 (5,44B según model card) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (ventana temporal de 7 observaciones, 4 fotogramas muestreados) |
| Tipos de cuantizacion | NF4 (4-bit, bitsandbytes); pesos pre-cuantizados `prequantized_nf4: true` |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,2 GB), con código custom de Transformers |

## Arquitectura y entrenamiento

El modelo base es XR-1 5B de Xiaomi Robotics, un VLA multimodal que combina percepción visual (tres cámaras RGB: base izquierda, base derecha y muñeca) con estado propioceptivo del robot para producir fragmentos de acciones. La variante RoboCasa365 está entrenada sobre el conjunto de datos del benchmark homónimo, centrado en manipulación generalista de cocina con el embodiment `panda_mobile`. No se dispone de detalles sobre el número exacto de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal de este paquete no está en el modelo sino en el adaptador de OpenRAL: gestiona la conversión entre representaciones de estado (cuaternión 16-D de OpenRAL frente a eje-ángulo 14-D de Xiaomi), aplica el recorte central de 0,95 que espera el evaluador de referencia y mantiene el contrato temporal de tres cámaras del checkpoint original. El adaptador almacena siete observaciones y muestrea cuatro fotogramas espaciados dos pasos, lo que define una ventana temporal efectiva de seis pasos. La inferencia se ejecuta en un sidecar PyTorch aislado y se reproduce un chunk de 16 acciones antes de replanificar. El código del checkpoint requiere `trust_remote_code` (código Transformers personalizado).

## Capacidades

- Manipulación robótica generalista en cocina: abrir cajones, cerrar tapas de licuadora y otras tareas del benchmark RoboCasa365.
- Percepción visual multi-cámara: procesa tres flujos RGB simultáneos (base izquierda, base derecha, muñeca) con ventana temporal de cuatro fotogramas.
- Fusión visión-lenguaje-acción: genera fragmentos de acciones de 12 dimensiones (delta del efector final, pinza, base y campos de relleno/modo) a partir de observaciones visuales y de estado.
- Control de embodiment `panda_mobile`: integración con el robot PandaMobile en simulación RoboCasa.
- Salida de acciones en chunk: 16 acciones por consulta antes de replanificar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no disponible como capacidad del modelo; el bucle de replanificación lo gestiona el runtime de OpenRAL.
- Capacidades multilingües: limitadas a inglés (`en`).
- Modo thinking, visión general, audio: no disponible; la visión está restringida al contrato de tres cámaras del robot.

## Casos de uso

- Investigación en manipulación robótica de cocina: ejecutar el checkpoint XR-1 RoboCasa365 en el simulador RoboCasa para estudiar políticas VLA generalistas, aprovechando el adaptador que ya traduce el contrato de observaciones y acciones.
- Evaluación comparativa de VLA cuantizados: usar la versión NF4 como referencia para medir la degradación de rendimiento frente al checkpoint fp16/bf16 original en tareas como OpenDrawer o CloseBlenderLid.
- Prototipado de pipelines de control con chunking: el modelo devuelve 16 acciones por consulta, lo que permite probar esquemas de control con replanificación a baja frecuencia (presupuesto de latencia declarado de 120.000 ms por chunk).
- Integración en el runtime OpenRAL: desplegar el rSkill dentro de escenarios simulados definidos en YAML (`scenes/sim/xr1_robocasa365_close_blender_lid.yaml`) para validar cableado de sensores y actuadores antes de portar a hardware.
- Desarrollo de adaptadores de embodiment: el código abierto del wrapper sirve como plantilla para convertir otros checkpoints XR-1 a formatos de estado alternativos (cuaternión frente a eje-ángulo).
- Docencia y demostraciones de VLA: el tamaño de 5B en NF4 (repo de 3,2 GB) permite montar demos en hardware de gama alta consumer, aunque la carga exige OpenRAL Pro.
- Validación de reproducibilidad de benchmarks: útil para equipos que quieran auditar por qué la reproducción de RoboCasa365 está bloqueada por la falta de revisión fijada del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se incluye ningún JSON de evaluación hasta que se fije la revisión del entorno upstream y se ejecute el protocolo completo de 50 ensayos. El escenario incluido es una comprobación de cableado de 20 pasos, no una reproducción de puntuaciones. Solo hay disponibles rollouts cualitativos (OpenDrawer con éxito, CloseBlenderLid con fallo) en el dataset `OpenRAL/website-media`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita (`min_vram_gb: null` en la metadata). Como referencia orientativa, un modelo de 5B en NF4 ocupa aproximadamente 2,5-3 GB de pesos, más overhead de activaciones y del sidecar PyTorch.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs consumer de gama alta (RTX 4090, RTX 3090) y en A100/H100 para mayor throughput, pero el autor no lo confirma.
- ¿Cabe en GPU consumer? Probable por tamaño de pesos, pero no confirmado por el autor.
- Opciones de despliegue: runtime PyTorch aislado como sidecar dentro de OpenRAL; requiere `OPENRAL_ALLOW_REMOTE_CODE=1` y el paquete de cuantización de OpenRAL Pro. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: presupuesto declarado de 120.000 ms por chunk (`latency_budget.per_chunk_ms: 120000`), es decir, 2 minutos por fragmento de 16 acciones. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4 | 5,05B | no disponible (ventana de 7 obs.) | NF4 | apache-2.0 | Hugging Face; carga requiere OpenRAL Pro |
| XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365 (base) | 5,44B | no disponible | fp32/fp16/bf16 | apache-2.0 | Hugging Face |
| Otros VLA de tamano similar (p. ej. OpenVLA, pi0) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La carga de los pesos NF4 requiere OpenRAL Pro: la versión open source de OpenRAL solo admite fp32, fp16 y bf16 (ADR-0123). Esto limita el uso del paquete a usuarios con licencia Pro.
- Reproducibilidad bloqueada: Xiaomi no fija la revisión exacta de RoboCasa365, por lo que no se pueden reproducir los resultados del benchmark ni comparar de forma rigurosa.
- Sin benchmarks publicados: no hay JSON de evaluación ni protocolo de 50 ensayos ejecutado; el escenario incluido es solo una comprobación de cableado.
- Latencia muy alta: 120.000 ms por chunk de 16 acciones, lo que restringe su uso a simulación o tareas de baja frecuencia, no a control reactivo en tiempo real.
- Dominio estrecho: entrenado exclusivamente para manipulación de cocina en RoboCasa365 con el embodiment `panda_mobile`; no se espera generalización a otros robots o entornos sin reentrenamiento.
- Idioma: solo inglés (`en`).
- Requiere código remoto: `OPENRAL_ALLOW_REMOTE_CODE=1` para cargar el código Transformers personalizado del checkpoint, lo que implica confiar en código no auditado por el usuario.
- Riesgo de alucinación: no evaluado en la información disponible; en VLA el fallo se manifiesta como acciones incorrectas o inseguras más que como texto inventado.
- Sesgos: no documentados en la información proporcionada; los sesgos del dataset RoboCasa365 se heredan del modelo base.
- Licencia Apache-2.0 permite uso comercial (`is_commercial_use_allowed: yes`), pero la dependencia de OpenRAL Pro para cargar los pesos puede condicionar el despliegue comercial.
- Restricciones de cuantización: no se documenta la degradación de precisión frente al checkpoint original en fp16/bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4
- Árbol de archivos: https://huggingface.co/OpenRAL/rskill-xr1-panda_mobile-robocasa365-nf4/tree/main
- Modelo base: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-RoboCasa365
- Paper XR-1: https://arxiv.org/abs/2607.15330
- Preview OpenDrawer (éxito): https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/benchmarks/robocasa365-open-drawer_xr1-nf4_success/full.mp4
- Preview CloseBlenderLid (fallo): https://huggingface.co/datasets/OpenRAL/website-media/resolve/main/benchmarks/robocasa365-close-blender_xr1-nf4_fail/full.mp4
- Escenario de simulación: `scenes/sim/xr1_robocasa365_close_blender_lid.yaml` (referenciado en la model card)
- Documentación de compatibilidad VLA: `docs/reference/vla_compatibility.md` (referenciado en la model card)
