# i-Coder/iCoder-27B-SFT

## Resumen

iCoder-27B-SFT es un checkpoint intermedio del pipeline de entrenamiento de iCoder-27B, un modelo de 27 000 millones de parámetros especializado en diseño RTL (Verilog) y optimización de kernels GPU (Triton). Lo desarrolla i-Coder, un agente autónomo que ejecuta y revisa cada etapa de su propio entrenamiento. Este checkpoint concreto es la salida de la primera etapa, un ajuste fino supervisado (SFT) sobre trayectorias de profesores verificadas, partiendo del modelo base Qwen/Qwen3.6-27B.

El modelo está pensado exclusivamente para investigación: reproducir la etapa SFT, hacer ablaciones o medir qué aportan las etapas posteriores (OPSD y RLVR). No ha recibido preparación para despliegue en producción. Su relevancia radica en que documenta un punto intermedio de un pipeline novedoso donde el propio agente gestiona su entrenamiento, lo que puede interesar a quienes investigan metodologías de auto-mejora y entrenamiento dirigido a dominios técnicos específicos.

La arquitectura concreta no se detalla en la información disponible, pero al derivar de Qwen3.6-27B se asume una arquitectura transformer estándar. El tamaño de contexto no se especifica. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.6-27B, presumiblemente transformer) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se publican detalles arquitectonicos especificos en la model card. Al ser un fine-tuning de Qwen3.6-27B, se hereda la arquitectura del base, que corresponde a un transformer autoregresivo con atencion por ventanas deslizantes y full attention, aunque no se confirma oficialmente. El entrenamiento de esta etapa consiste en un ajuste fino supervisado sobre trayectorias de profesores verificadas, es decir, ejemplos de alta calidad generados y validados previamente. No se indica el numero de tokens de entrenamiento ni la composicion del dataset.

El pipeline completo consta de tres etapas: SFT (este checkpoint), OPSD (que produce iCoder-27B-OPSD) y RLVR (refuerzo con verificacion de recompensa), que da lugar al modelo final iCoder-27B. La innovacion principal no esta en la arquitectura, sino en el proceso: un agente que disena, ejecuta y revisa cada fase de su propio entrenamiento, un enfoque poco comun en la generacion de modelos de codigo hardware.

## Capacidades

- Generacion de codigo RTL en Verilog, incluyendo descripciones de circuitos sincronos y asincronos.
- Optimizacion de kernels GPU escritos en Triton, con foco en rendimiento y uso eficiente de memoria.
- Razonamiento tecnico en dominios de diseno de hardware y computacion de alto rendimiento.
- Conversacion multi-turno siguiendo la plantilla de chat de Qwen (aplicable via `apply_chat_template`).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Reproduccion de la etapa SFT del pipeline iCoder: los investigadores pueden cargar este checkpoint y replicar el proceso de ajuste fino para verificar resultados o modificar hiperparametros.
- Ablacion de etapas: comparar el rendimiento de este checkpoint con iCoder-27B-OPSD y iCoder-27B final para cuantificar la contribucion de cada fase del entrenamiento.
- Estudio de transferencia de conocimiento: analizar como el SFT sobre trayectorias verificadas afecta a la generacion de Verilog frente al modelo base Qwen3.6-27B.
- Generacion de modulos RTL en entornos de investigacion: por ejemplo, escribir un contador sincrono de 4 bits con reset activo a nivel bajo, como muestra el ejemplo de la model card.
- Prototipado de kernels Triton: generar esqueletos de kernels para operaciones comunes (reducciones, matmul, etc.) y luego refinarlos manualmente.
- Evaluacion de robustez en tareas de codigo hardware: medir la tasa de exito en problemas de diseno logico y comparar con otros modelos de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un reporte tecnico que describe el metodo y los resultados, pero no se proporciona acceso al mismo ni datos numericos.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware para este checkpoint.
- Por el tamaño de parametros (27B), una estimacion orientativa para inferencia en fp16 requeriria alrededor de 54 GB de VRAM (solo pesos), por lo que se necesitarian GPUs profesionales como A100 80GB o H100. Con cuantizacion a 4 bits (no disponible en el repo, pero posible mediante conversion), cabria en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, TGI o llama.cpp (tras convertir a GGUF). No hay configuracion especifica publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| iCoder-27B-SFT | 27B | no disponible | Apache-2.0 | RTL y kernels GPU |
| DeepSeek-Coder (33B) | 33B | 16K | MIT | Codigo general, relleno |
| Qwen3.8-27B (base) | 27B | no disponible | Apache-2.0 | Codigo, agentes, razonamiento |

No se dispone de datos de rendimiento comparativo. DeepSeek-Coder es un modelo de codigo general con soporte de relleno, mientras que iCoder esta especializado en hardware. Qwen3.8-27B es el modelo base del que parte iCoder, por lo que la comparacion directa de capacidades RTL seria el punto de partida natural.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no ha pasado por las etapas OPSD y RLVR, por lo que su rendimiento en tareas complejas de RTL o kernels puede ser inferior al del modelo liberado.
- No ha recibido preparacion para despliegue: puede presentar inestabilidades, respuestas incompletas o errores de sintaxis en codigo generado.
- Sesgos y alucinaciones: al derivar de Qwen3.6-27B, puede heredar sesgos del modelo base y tender a alucinar en dominios fuera de su especialidad.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente herede el multilingueismo de Qwen, pero no esta confirmado.
- Contexto: al no conocerse la longitud de contexto, no se puede garantizar un rendimiento adecuado en conversaciones o generaciones muy largas.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo no esta disenado para produccion y carece de garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/i-Coder/iCoder-27B-SFT
- Modelo final iCoder-27B: https://huggingface.co/i-Coder/iCoder-27B
- Checkpoint OPSD: https://huggingface.co/i-Coder/iCoder-27B-OPSD
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Reporte tecnico: no disponible (mencionado en la model card pero sin enlace)
