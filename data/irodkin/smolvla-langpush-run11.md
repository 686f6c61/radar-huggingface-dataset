# irodkin/smolvla-langpush-run11

## Resumen

SmolVLA language-controlled cube pushing (run 11) es un modelo vision-language-action (VLA) afinado por el usuario irodkin (Team 08 del curso ROB7103/8103 Embodied AI) a partir de `lerobot/smolvla_base`. Resuelve una tarea muy concreta de manipulación robótica: un brazo Seeed reBot Arm B601-RS con una cámara de teléfono montada en la muñeca debe empujar el cubo nombrado en la instrucción ("Push the red cube into the green target area" o "Push the blue cube into the green target area") hacia una zona objetivo verde. Todo el trabajo se ha realizado en simulación MuJoCo.

El modelo tiene 450.046.176 parámetros (dato real de los pesos safetensors) y se distribuye en formato safetensors dentro de un repositorio de 1,3 GB. La innovación principal no es arquitectónica sino de entrenamiento: el autor combina un modo de acción "delta" (movimiento de la punta en su propio sistema de referencia) con el ajuste fino de las 8 capas superiores del modelo visión-lenguaje, lo que hace que la política deje de ignorar la palabra de color y pase a condicionar su comportamiento a la instrucción.

Es relevante ahora porque muestra, con métricas pareadas y un análisis de ablación explícito, cómo un VLA pequeño puede aprender a usar el lenguaje como señal de control real en lugar de explotar atajos visuales o de estado. El checkpoint reporta 186 aciertos de 192 ensayos en simulación, frente a 172 del checkpoint previo (run 10b).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA) sobre `lerobot/smolvla_base`; no se detalla la topología interna en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se procesan chunks de 50 acciones a 30 fps con un nuevo plan cada 10 frames |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base` y se afina en dos fases: 30.000 pasos con batch size 64 sobre 10.000 demostraciones scriptadas (run 10b) y 20.000 pasos adicionales con un nuevo schedule de learning rate (run 11, este checkpoint), con coseno, warm-up de 500 pasos, learning rate de 5e-5 para el experto de acciones y 1e-5 para las capas del VLM, y estado del optimizador reiniciado. Las demostraciones usan layouts simétricos (ambos cubos colocados de forma que solo la palabra de color los distingue), mesa blanca aleatorizada, aumento de imagen de LeRobot y trayectorias expertas con ruido de rumbo de hasta 45° en desplazamiento y 10° al empujar.

La innovación clave es doble y se valida por ablación. Por un lado, el modo de acción "delta": cada acción es el movimiento de la punta durante un paso en el sistema de referencia de la propia punta, `[dx, dy, dz (m), rx, ry, rz (rad, vector de rotación)]`, y el estado se reduce únicamente a la dirección de la gravedad en el sistema de la herramienta (3 números, rellenados a 6). El autor documenta que, cuando el estado era la pose de la punta medida desde su posición inicial, la política deducía en uno o dos frames a qué cubo se dirigía la demostración y nunca aprendía la palabra. Por otro lado, se entrenan el experto de acciones y las proyecciones junto con las 8 capas superiores del modelo visión-lenguaje, manteniendo copias en float32 de todos los pesos entrenables (en bfloat16 los pasos de ajuste se redondeaban a cero). Ninguno de los dos cambios por separado hizo que la política usara la palabra.

La entrada visual es una única cámara (la del teléfono, como `observation.images.camera1`, con dos ranuras de cámara vacías); la salida son chunks de 50 acciones a 30 fps, ejecutadas con un plan nuevo cada 10 frames.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por instrucción en lenguaje natural (empujar el cubo rojo o el azul hacia la zona objetivo).
- Condicionamiento efectivo al lenguaje: la política responde a la palabra de color, con un 99% de planes iniciales dirigidos al cubo nombrado bajo ambas instrucciones (32 escenas × 3 semillas de ruido).
- Discriminación de instrucción frente a ruido: el primer plan se desplaza 119 mm al intercambiar rojo/azul, frente a 14 mm de variación por ruido.
- Control en modo delta: ejecuta movimientos de la punta en su propio sistema de referencia, no poses absolutas.
- Operación con una sola cámara y estado mínimo (dirección de la gravedad en el sistema de la herramienta).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni visión general; el modelo es específico de la tarea.

## Casos de uso

- Investigación en aprendizaje por imitación condicionado por lenguaje: sirve como referencia reproducible para estudiar cuándo una política VLA empieza a usar la instrucción y cuándo explota atajos, gracias a la ablación documentada entre modo delta, ajuste del VLM y estado de entrada.
- Evaluación de robustez al sesgo de estado: el checkpoint permite comparar políticas entrenadas con estado de pose frente a estado mínimo, midiendo la diferencia entre 106 mm y 119 mm de desplazamiento del primer plan al cambiar la instrucción.
- Docencia y proyectos de IA encarnada: es un ejemplo completo de pipeline LeRobot con fine-tuning de un VLA pequeño (450 M parámetros) sobre demostraciones scriptadas, reutilizable como plantilla en cursos de robótica.
- Pruebas de generalización a layouts simétricos: el conjunto de evaluación de 96 layouts simétricos × 2 ajustes visuales permite medir si un cambio de arquitectura o de datos rompe la dependencia del color.
- Base para transferencia a hardware real: al ser un fine-tune de `lerobot/smolvla_base` con licencia Apache 2.0, puede servir de punto de partida para reentrenar con imágenes reales del brazo Seeed reBot Arm B601-RS y su cámara de teléfono, aunque el autor advierte que no se ha probado en el mundo real.
- Referencia de evaluación pareada: el protocolo de comparación dentro de un mismo batch (20 mejores, 6 peores, p = 0,009 exacto pareado) es directamente reutilizable para comparar checkpoints de otros proyectos VLA.

## Benchmarks y rendimiento

Resultados en simulación MuJoCo, 96 layouts simétricos de test × 2 ajustes visuales, evaluados en un solo batch:

| Métrica | Run 10b (primeros 30k pasos) | Run 11 (este checkpoint) |
|---|---|---|
| Éxito de 192 (rango al 95%) | 172 (84–93%) | 186 (93–99%) |
| Rojo / azul, de 96 cada uno | 88 / 84 | 93 / 93 |
| Misma escena bajo ambas palabras: cubo correcto las dos veces, de 16 escenas | 11 | 16 |
| Primer plan dirigido al cubo nombrado bajo ambas palabras (32 escenas × 3 semillas de ruido) | 84% | 99% |
| Primer plan se mueve al intercambiar rojo/azul, frente a variación por ruido | 106 vs 26 mm | 119 vs 14 mm |

Comparación pareada run 11 frente a run 10b en los mismos layouts: 20 mejores, 6 peores (p exacto pareado = 0,009). Una política ciega al color acertaría aproximadamente la mitad de las veces; el empujador scriptado del autor obtiene 96/96. El autor advierte que las reevaluaciones de un mismo checkpoint varían en varios ensayos (run 10b puntuó entre 165 y 172 de 192 en tres batches), por lo que recomienda comparar checkpoints dentro de un mismo batch.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 450 M parámetros en bfloat16 el peso de los parámetros ronda los 0,9 GB, y el repositorio completo ocupa 1,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el dato exacto no está documentado.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería bastar, pero el autor no especifica modelos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `lerobot`, cargando `SmolVLAPolicy.from_pretrained("irodkin/smolvla-langpush-run11")` y los pre/post-procesadores del mismo repositorio mediante `make_pre_post_processors(policy.config, pretrained_path=...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; se sabe que la política emite chunks de 50 acciones a 30 fps y que se replanifica cada 10 frames.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| irodkin/smolvla-langpush-run11 | 450.046.176 | no disponible | Empujar cubo rojo/azul a zona verde (simulación MuJoCo) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA base de LeRobot, fine-tuneable | no disponible en la información proporcionada | Hugging Face (modelo base declarado) |
| Run 10b (checkpoint previo del mismo autor) | no disponible | no disponible | Misma tarea | no disponible | No publicado como repo independiente en la información disponible |

No se dispone de datos de benchmarks comparables con otros VLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no se ha probado con imágenes reales del teléfono ni con el brazo físico.
- Tarea única: un cubo rojo y uno azul de 4 cm, objetivo verde de 6 cm, pose inicial fija y mesa lisa; no generaliza a otros objetos, colores ni escenas.
- Requiere conducción en modo delta (movimientos de la punta, no poses absolutas); usarlo con acciones absolutas rompe el contrato de entrenamiento.
- Necesita cargar los pre- y post-procesadores del repositorio; omitirlos altera la interpretación de observaciones y acciones.
- El repositorio del simulador, la tarea y los scripts de evaluación no es público todavía, lo que limita la reproducibilidad externa.
- Varianza de evaluación: un mismo checkpoint puede variar varios ensayos entre batches (165–172 de 192 en el run 10b), así que las comparaciones deben hacerse dentro de un mismo batch.
- Sin datos publicados sobre sesgos, alucinación en el sentido lingüístico, cobertura multilingüe ni comportamiento fuera de distribución; la instrucción de entrenamiento está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en la información disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso independiente ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/irodkin/smolvla-langpush-run11
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del proyecto (simulador, tarea y scripts de evaluación): no público según la model card; no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
