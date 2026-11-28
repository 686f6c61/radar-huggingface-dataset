# sensenova/SenseNova-RoboRSI-27B

## Resumen

SenseNova-RoboRSI-27B es un modelo vision-lenguaje (VLM) de 27.356 millones de parámetros desarrollado por SenseNova (OpenSenseNova) y especializado en manipulación robótica. A diferencia de un VLA convencional que emite acciones directamente, este modelo actúa como una capa de razonamiento de alto nivel: solicita movimiento a una política VLA, revisa trayectorias propuestas o escribe código que calcula y ejecuta una pose objetivo del efector final (el paradigma que el autor denomina "Code as Policy"). Tras cada acción, el agente reincorpora nuevas observaciones de cámara y el estado del robot para decidir el siguiente paso.

El modelo se construye como un fine-tune del checkpoint SenseNova-RoboRSI-27B-Preview, con arquitectura marcada como `qwen3_5` en los metadatos de Hugging Face, lo que sugiere una base derivada de la familia Qwen 3.5. Su propuesta diferencial es el "recursive self-improvement" (RSI): un bucle en el que los fallos de ejecución guían la actualización del arnés (Harness) del agente, se recogen trayectorias de un modelo profesor y se reajusta el modelo de 27B para la siguiente ronda.

Es relevante ahora porque demuestra transferencia de simulación a robots físicos sin datos reales de post-entrenamiento: el mismo checkpoint que opera en el simulador RoboDojo coloca objetos en un Piper y apila bloques en un Piper X, adaptando únicamente las interfaces de cámara, estado y control. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (tag `qwen3_5`), transformer multimodal con cabecera de visión |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe repositorio GGUF oficial |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal, 54,8 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

La model card identifica el modelo como vision-language model con tag de arquitectura `qwen3_5`, es decir, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje, sin que se detallen el número de capas, la dimensión oculta ni la composición exacta del dataset. El modelo base es SenseNova-RoboRSI-27B-Preview, sobre el que se aplica un fine-tune orientado a tareas de manipulación encarnada.

La innovación central es el entrenamiento por "recursive self-improvement" en tres rondas: las acciones fallidas o ineficientes alimentan la revisión del Harness del agente; con el Harness revisado se recogen trayectorias de un modelo profesor; y esas trayectorias se filtran y se usan para ajustar el modelo de 27B de cara a la siguiente ronda de evaluación. Según el autor, actualizar conjuntamente modelo y Harness superó a actualizar solo uno de los dos en las tres rondas. Además, se introduce la supervisión "VLA2Agent", que aporta poses objetivo del efector final a partir de demostraciones de VLA abiertas, y el modo Code as Policy, en el que el modelo genera código para calcular y ejecutar la pose del gripper.

## Capacidades

- Razonamiento visual sobre observaciones de cámara de robot (vistas de muñeca y de escena) para planificar la manipulación.
- Solicitud de movimiento a una política VLA externa (integración con VLA2Agent).
- Revisión y validación de trayectorias propuestas antes de su ejecución.
- Code as Policy: escritura de código que computa y ejecuta una pose objetivo del efector final.
- Planificación multi-paso con reobservación: tras cada acción incorpora nuevas imágenes y estado del robot para decidir el siguiente paso.
- Coordinación bimanual (predicciones de dos brazos evaluadas conjuntamente).
- Operación sobre robots físicos (Piper, Piper X) adaptando solo las interfaces de cámara, estado y control.
- Integración en un arnés de agente (Harness) con habilidades generales, sin skills específicas por tarea en la evaluación.
- Soporte de tool calling / function calling: no disponible explícitamente en la información.
- Capacidades multilingües: no disponible.

## Casos de uso

- Pick-and-place en robot de sobremesa: el modelo usa Code as Policy para calcular la pose del gripper y colocar objetos en un recipiente; logró 6/10 éxitos en Piper sin datos reales de post-entrenamiento, solo adaptando interfaces.
- Apilado de bloques con VLA más Code as Policy: combinando la política VLA con correcciones por código, alcanzó 9/10 en Piper X, lo que lo hace adecuado para tareas de ensamblaje simple que requieren precisión de colocación.
- Corrección de colocación en tiempo de ejecución: en la demo de apilado de cuencos, el agente detecta que el cuenco está desplazado y usa código para mover el objetivo 2 cm a la derecha antes de bajarlo; útil en tareas donde la percepción inicial tiene error.
- Manipulación bimanual coordinada: resolución de un cubo de Rubik 2×2 inspeccionando, girando y resolviendo con dos brazos, sin entrenamiento específico de la tarea; aplicable a tareas que exigen coordinación de dos efectores.
- Investigación en agentes encarnados: sirve como banco de pruebas para el bucle RSI, permitiendo reproducir la mejora de 10,0 a 34,7 en RoboDojo actualizando modelo y Harness conjuntamente.
- Prototipado de políticas en simulación antes de transferir a hardware: el mismo checkpoint funciona en RoboDojo y en robots físicos, lo que reduce el coste de validación previa al despliegue.
- Automatización de tareas de inserción y alineación: la demo de inserción de un tubo de ensayo en dos pasos y la alineación de grippers con esquinas de una prenda muestran su uso en tareas de precisión que requieren planificación geométrica.

## Benchmarks y rendimiento

| Benchmark / metrica | SenseNova-RoboRSI-27B | Preview | Qwen3.8-27B | GPT-6 Astra |
|---|---:|---:|---:|---:|
| RoboDojo (media) | 34,7 | 10,0 | no disponible | 27,6 (leaderboard del equipo RoboDojo) |
| Piper, pick-and-place (10 ensayos) | 6/10 (60%) | 2/10 | 0/10 | no disponible |
| Piper X, block stacking (10 ensayos) | 9/10 (90%) | 3/10 | 0/10 | no disponible |

Precisión del efector final en lazo abierto (374 acciones locales de todas las tareas de RoboDojo; 179 con un brazo y 195 con dos):

| Configuracion de entrenamiento | Dentro de 5 mm | Dentro de 20 mm | Dentro de 50 mm | Error mediano XYZ |
|---|---:|---:|---:|---:|
| Sin VLA2Agent | 4,3% | 9,4% | 24,9% | 119,7 mm |
| Con VLA2Agent | 15,5% | 29,7% | 49,2% | 51,6 mm |

No se han publicado resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 27,36 B de parámetros, en FP16/BF16 se requiere aproximadamente 55 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 28-30 GB; en 4 bits, en torno a 15-18 GB (estimaciones a partir del tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue en BF16 requiere GPUs de 80 GB (A100, H100) o multi-GPU; para consumer GPU conviene recurrir al repositorio GGUF oficial.
- Cabe en consumer GPU: previsiblemente sí en cuantizaciones GGUF de 4-8 bits en GPUs con 16-24 GB de VRAM (RTX 4090, RTX 3090), aunque no hay cifras oficiales de latencia ni de calidad tras cuantizar.
- Opciones de despliegue: safetensors para frameworks de inferencia estándar; GGUF para llama.cpp y derivados (Ollama, LM Studio); no se confirman vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RoboDojo | Piper pick-and-place | Piper X stacking | Licencia |
|---|---:|---|---:|---:|---:|---|
| SenseNova-RoboRSI-27B | 27,36 B | no disponible | 34,7 | 6/10 | 9/10 | Apache 2.0 |
| SenseNova-RoboRSI-27B-Preview | no disponible | no disponible | 10,0 | 2/10 | 3/10 | Apache 2.0 |
| Qwen3.8-27B | 27 B (aprox.) | no disponible | no disponible | 0/10 | 0/10 | no disponible |
| GPT-6 Astra | no disponible | no disponible | 27,6 | no disponible | no disponible | propietaria |

La comparación se limita a los modelos presentes en la model card; no se dispone de datos de otros VLM de robótica contemporáneos para ampliar la tabla.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo multimodal entrenado con datos no especificados, pueden persistir sesgos visuales y de lenguaje no caracterizados.
- Riesgo de alucinación: el modelo genera código y poses objetivo; una predicción errónea del efector puede provocar colisiones o agarres fallidos. La precisión en lazo abierto es limitada (solo 15,5% dentro de 5 mm y 49,2% dentro de 50 mm), por lo que requiere verificación y bucles de corrección.
- Dependencia de interfaces externas: necesita una política VLA (VLA2Agent) o un arnés de agente para ejecutar movimientos; no es un controlador de bajo nivel autónomo.
- Transferencia a hardware: los resultados físicos se obtuvieron en Piper y Piper X con interfaces adaptadas manualmente; no se garantiza el mismo rendimiento en otras plataformas sin trabajo de integración.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar comportamiento multilingüe o conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad por daños en entornos físicos; conviene auditar el uso en robótica real.
- Caveat de producción: el modelo se publicó como versión de investigación (fine-tune de un Preview) con pocas descargas y sin documentación de seguridad para operación continua; se recomienda supervisión humana y límites de par y velocidad en el robot.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Repositorio GGUF: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B-GGUF
- GitHub: https://github.com/OpenSenseNova/SenseNova-RoboRSI/tree/main
- README en chino: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B/blob/main/README_zh.md
- Leaderboard de RoboDojo (agente): https://robodojo-benchmark.com/leaderboard#agent
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B-Preview
