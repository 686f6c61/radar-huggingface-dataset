# alohateam1423/smolvla_hw5_sim_fruit100

## Resumen

`smolvla_hw5_sim_fruit100` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) orientado al control de robots manipuladores dentro del ecosistema LeRobot de Hugging Face. Lo publica el usuario `alohateam1423` como parte de las prácticas de un curso de "Robot Control AI", y su propósito concreto es aprender una tarea de colocación de fruta en un entorno simulado de cocina construido con Isaac Sim.

El modelo parte de la arquitectura SmolVLA, que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que genera comandos motores de forma continua. Con 450.046.176 parámetros totales (unos 450 millones) y un repositorio de 0,9 GB en formato safetensors, está pensado para ejecutarse en hardware modesto, algo coherente con la filosofía "smol" del modelo base.

Es relevante únicamente como referencia de un ajuste fino académico muy específico: se entrenó durante 6000 pasos sobre las mismas 100 demostraciones de Isaac Sim del ejercicio anterior y solo alcanza 3 aciertos de 10 colocaciones en la evaluación. No es un modelo de propósito general ni un modelo de lenguaje: es una política robótica de tarea única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Entorno de entrenamiento | Isaac Sim (escena de cocina del curso) |
| Pasos de entrenamiento | 6000 |
| Demostraciones de entrenamiento | 100 |
| Tasa de exito reportada | 3/10 colocaciones |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, la variante compacta de SmolVLA del ecosistema LeRobot. La arquitectura subyacente es un modelo visión-lenguaje-acción: procesa observaciones visuales e instrucciones en lenguaje natural y emite acciones motoras continuas para un manipulador. La información disponible no detalla la composición interna del codificador visual, el modelo de lenguaje ni el cabezal de acciones, por lo que no se puede especificar más allá de su naturaleza VLA y su integración con la librería `lerobot`.

El entrenamiento consistió en 6000 pasos sobre las mismas 100 demostraciones de Isaac Sim empleadas en el ejercicio previo (Homework 4), dentro de la escena de cocina del curso. No se documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se describen innovaciones técnicas adicionales. El resultado declarado por el autor es de 3 colocaciones correctas sobre 10 en la evaluación realizada en el mismo entorno simulado.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para colocar fruta en una escena de cocina simulada en Isaac Sim.
- Condicionamiento por instrucción en lenguaje natural, heredado de la naturaleza VLA del modelo base (no se documenta el vocabulario ni los idiomas concretos).
- Percepción visual de la escena mediante el codificador de imágenes del modelo base.
- Ejecución de una política de tarea única: no se documenta generalización a otras tareas, objetos o entornos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni otras capacidades del modelo base.

## Casos de uso

- Práctica docente de robótica: sirve como referencia de un pipeline completo de ajuste fino VLA en LeRobot, desde la captura de demostraciones en Isaac Sim hasta la evaluación de la política.
- Reproducción de experimentos académicos: permite comparar el efecto de 6000 pasos de entrenamiento sobre 100 demostraciones frente a otros ajustes del mismo modelo base.
- Evaluación de simulación a realidad: puede usarse como punto de partida para estudiar la brecha entre políticas entrenadas en Isaac Sim y su transferencia a un robot físico, aunque su tasa de éxito del 30 % limita su utilidad directa.
- Generación de datos sintéticos de manipulación: el modelo puede integrarse en bucles de evaluación automática dentro de Isaac Sim para medir robustez ante variaciones de la escena.
- Estudio de curvas de aprendizaje: al conocerse el número exacto de pasos y demostraciones, es útil para analizar la relación entre volumen de datos y éxito en tareas de colocación.
- Base para ajustes posteriores: al ser un fine-tuning de `lerobot/smolvla_base`, puede servir como inicialización para tareas de colocación similares con más demostraciones o más pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la evaluación propia del autor en la escena de cocina de Isaac Sim del curso:

| Metrica | Resultado |
|---|---|
| Tasa de exito en colocacion de fruta | 3/10 (30 %) |
| Entorno de evaluacion | Isaac Sim, escena de cocina del curso |
| Pasos de entrenamiento | 6000 |
| Demostraciones de entrenamiento | 100 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors, el peso en precisión nativa ronda los 0,9 GB, por lo que la inferencia en FP16 requeriría aproximadamente 1-2 GB de VRAM, sin contar el codificador visual ni los buffers de la política.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer reciente (RTX 3060 o superior) debería poder alojar los pesos.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación del autor.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política VLA de acciones continuas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de exito reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_hw5_sim_fruit100 | 450.046.176 | no disponible | 3/10 en Isaac Sim | no disponible | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros ajustes VLA de LeRobot | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La información disponible no permite establecer una comparativa cuantitativa con alternativas de la misma categoría más allá del modelo base del que deriva.

## Limitaciones y advertencias

- Tasa de éxito baja: 3 aciertos de 10 colocaciones, insuficiente para uso en producción o en robótica real sin un ajuste adicional.
- Sesgo de dominio: entrenado exclusivamente con 100 demostraciones de una escena de cocina concreta en Isaac Sim; no se documenta generalización a otros objetos, posiciones o entornos.
- Sobreajuste probable: 6000 pasos sobre solo 100 demostraciones es una proporción alta que puede favorecer la memorización de trayectorias.
- Brecha simulación-realidad: no hay evidencia de transferencia a un robot físico; el autor solo reporta evaluaciones en simulación.
- Licencia no especificada: al no constar licencia, no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene consultar la licencia del modelo base `lerobot/smolvla_base` antes de cualquier uso.
- Idiomas no documentados: no se puede garantizar el comportamiento ante instrucciones en castellano u otros idiomas.
- Riesgo de alucinación motora: como política VLA, puede generar acciones incoherentes ante observaciones fuera de distribución, sin mecanismo de seguridad documentado.
- Modelo de tarea única: no debe tratarse como un modelo de lenguaje o de propósito general; su pipeline y sus entradas están ligados a LeRobot e Isaac Sim.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alohateam1423/smolvla_hw5_sim_fruit100
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Isaac Sim (NVIDIA): https://developer.nvidia.com/isaac/sim
