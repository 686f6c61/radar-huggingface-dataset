# gavinlaw/critichack-fr3-cross-task-policies

## Resumen

CriticHack-fr3-cross-task-policies es un repositorio de artefactos de investigación publicado por el usuario gavinlaw en Hugging Face, con un tamaño de 92,9 GB. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de checkpoints de políticas de control robótico entrenadas sobre el simulador MuJoCo con el robot FR3, acompañadas de encoders visuales y cabezas auxiliares. El autor lo describe explícitamente como producto de investigación en MuJoCo y no como experimento con robot real.

El contenido se organiza en torno a varias series de checkpoints (R96, R99, R102, R103, R104, R105, R106, R108) que corresponden a variantes de entrenamiento por imitación (behavior cloning) sobre 48 demostraciones balanceadas, con incrementos posteriores de rondas de entrenamiento y variantes de encoder visual (dos cámaras, 128 dimensiones, encoder congelado para tareas temporales). El repositorio actúa como espejo de artefactos que, según el autor, no pudieron subirse a la organización original por límites de cuota, manteniendo las revisiones inmutables de los artefactos pequeños ya publicados.

La relevancia es acotada y muy específica: sirve como material de replicación para un estudio sobre dependencias entre tareas y sobre el comportamiento de políticas ante cambios en la función de recompensa (el autor menciona un resultado de identidad PPO donde el modelo cercano al original sube su puntuación frente a un objeto equivocado de 5 a 17 sobre 32, con éxito de 13 a 15 sobre 32). No hay información pública sobre arquitectura de red neuronal de lenguaje, contexto, cuantización ni benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de control para robot FR3 en MuJoCo; se citan encoders visuales de dos cámaras con 128 dimensiones y cabezas auxiliares, sin detalle de la red troncal) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo card está redactado en chino) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Torch completos y encoders TorchScript (según el model card); no se confirma presencia de safetensors o GGUF |

## Arquitectura y entrenamiento

El autor describe políticas entrenadas mediante behavior cloning (BC) sobre 48 demostraciones balanceadas durante 40 rondas (R99); R103 añade 160 rondas sobre los mismos datos hasta un checkpoint de 200 rondas que queda fijado para R104 y R106. R102 corresponde a un encoder visual independiente de dos cámaras y 128 dimensiones en la época 40, mientras que R96 usa un encoder visual congelado para la tarea temporal. Se mencionan también cabezas pequeñas asociadas a R102, R105 y R108, y estados categóricos 000–008 de R106.

El texto aclara de forma explícita que estos artefactos no son actualizaciones por RL de un decodificador neuronal, sino checkpoints de políticas y encoders. No se proporcionan detalles sobre el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de las 48 demostraciones, ni sobre el uso de RLHF o DPO. La innovación metodológica que se insinúa es el análisis de dependencias entre tareas y la evaluación de políticas ante recompensas modificadas, con resultados negativos y límites de generalización documentados en el repositorio de GitHub asociado.

## Capacidades

- Control de políticas para el robot FR3 en el simulador MuJoCo, en lugar de generación de texto.
- Ejecución de tareas manipulativas entrenadas por imitación a partir de demostraciones balanceadas.
- Codificación visual con un encoder de dos cámaras y 128 dimensiones (R102) y variante con encoder congelado para tareas temporales (R96).
- Checkpoints intermedios y finales para comparación de curvas de entrenamiento (R99 a 40 rondas, R103 a 200 rondas).
- Cabezas auxiliares pequeñas asociadas a variantes concretas (R102, R105, R108) y estados categóricos de R106.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.

## Casos de uso

- Replicación de experimentos de behavior cloning: los checkpoints R99 y R103 permiten reproducir la curva de entrenamiento sobre las 48 demostraciones balanceadas y comparar el efecto de añadir 160 rondas adicionales.
- Estudio de dependencias entre tareas: los pares R104/R106 y las variantes R102/R105/R108 permiten analizar cómo se transfiere o interfiere el aprendizaje entre tareas dentro del mismo entorno MuJoCo.
- Análisis de robustez frente a cambios de recompensa: el resultado de identidad PPO (5 a 17 sobre 32 en puntuación ante objeto equivocado, éxito de 13 a 15 sobre 32) sirve como caso de estudio reproducible de fallos de especificación.
- Evaluación de encoders visuales congelados: R96 permite aislar el efecto de congelar el encoder en tareas temporales frente a entrenarlo de forma independiente como en R102.
- Auditoría de artefactos científicos: el manifest.json con tamaños, SHA y punteros de configuración facilita la verificación de integridad de cada checkpoint y su correspondencia con las ejecuciones documentadas en Git.
- Docencia e investigación en robótica simulada: al ser artefactos MuJoCo y no de robot real, son adecuados para prácticas y estudios que no requieran hardware físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico aportado es cualitativo-experimental y no comparable con métricas estándar: en el escenario de identidad PPO, la política cercana al modelo original eleva su puntuación frente a un objeto equivocado de 5 a 17 sobre 32, con un éxito que pasa de 13 a 15 sobre 32; la variante de producto estático se inhibe parcialmente hasta 11 sin mejora en éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (92,9 GB) incluye múltiples checkpoints y no equivale al peso de un único modelo en memoria.
- GPU recomendadas: no disponible; al tratarse de políticas pequeñas de control con encoder visual, es plausible que quepan en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el material apunta a ejecución mediante scripts de Python y Torch/TorchScript del repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de control FR3 en MuJoCo con este conjunto concreto de checkpoints y variantes de encoder), ni se aportan parámetros, contexto o licencia que permitan una tabla comparativa fiable.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, contexto largo ni generación de código; cualquier uso en ese sentido es un error de categoría.
- Los resultados provienen de simulación MuJoCo y el autor advierte explícitamente que no son experimentos con robot real; la transferencia a hardware físico no está validada.
- El propio autor reporta resultados negativos y límites de generalización, incluida la ausencia de mejora de éxito en la variante de producto estático.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas y documentación: el model card está en chino y no se declaran idiomas soportados; la documentación científica completa remite a un repositorio Git externo.
- Riesgo de reproducibilidad: el repositorio se presenta como espejo de artefactos de una organización original con cuota limitada; la integridad debe verificarse contra manifest.json y las revisiones inmutables citadas.
- Sin métricas de benchmarks estándar ni comparativas públicas, por lo que no es posible evaluar su rendimiento relativo frente a otras políticas de control.

## Enlaces

- Hugging Face: https://huggingface.co/gavinlaw/critichack-fr3-cross-task-policies
- Repositorio de código y documentación científica: https://github.com/luojiaxuan/critic-hack-vla/tree/f6d2c0d9
- Script de publicación citado: `experiments/critic_hack_fr3/elicitation/publish_replication_models.py` (dentro del repositorio anterior)
- Configuración de sincronización citada: `experiments/critic_hack_fr3/configs/personal_artifact_sync_20260912/models.json` (dentro del repositorio anterior)
