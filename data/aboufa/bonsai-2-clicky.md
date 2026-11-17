# aboufa/Bonsai-2-Clicky

## Resumen

Bonsai-2-Clicky es un ajuste fino del modelo ternario Ternary Bonsai 2 de Prism ML, orientado a la operación de interfaces gráficas en macOS (computer-use y GUI grounding). Lo publica el usuario aboufa como entrada para el hackathon Clicky, un asistente de barra de menús que se ejecuta íntegramente en un MacBook. El modelo parte de los pesos ternarios de Prism ML (variantes de 9B y 4B) y añade dos decodificadores de puntero en precisión completa que permiten localizar controles sobre una captura de pantalla.

La relevancia del modelo está en que demuestra que un modelo ternario de 9B, cuantizado a 2 bits y con un tamaño de fichero de 2,56 GB en formato GGUF, puede alcanzar un 84,0% en ScreenSpot-v2 (frente al 43,3% del modelo original sin ajustar) y un 46,8-57,5% en ventanas de aplicaciones macOS, manteniendo el mismo tamaño y velocidad que el modelo base. No obstante, sigue por debajo de su modelo padre Qwen3.5-9B en precisión completa (91,7% y 63,8% respectivamente) y de UI-Venus-2-9B (95,8% y 68,4%).

El repositorio contiene tanto el planificador de 9B (fichero GGUF completo para LM Studio o llama.cpp) como los pares de parches y decodificadores de puntero para 9B y 4B, que deben aplicarse en memoria sobre el pack MLX 2-bit original de Prism ML. El modelo solo soporta inglés y está pensado para inferencia local en Apple Silicon mediante MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con pesos ternarios; base Ternary Bonsai 2 de Prism ML, derivada de Qwen3.5 |
| Parámetros totales | 8.953.803.264 (dato de safetensors) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria (2-bit MLX pack), GGUF Q2_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, safetensors (parches), MLX 2-bit |

## Arquitectura y entrenamiento

El modelo se construye sobre Ternary Bonsai 2 de Prism ML, un modelo multimodal image-text-to-text cuyos pesos son ternarios. La cadena de ascendencia indicada en la model card es Qwen3.5-9B como modelo padre en precisión completa, del que deriva la versión ternaria de 9B; también existe una variante de 4B. El ajuste fino de Clicky mantiene los pesos en formato ternario y conserva el formato, tamaño y velocidad de Prism ML; las únicas adiciones son dos decodificadores de puntero en precisión completa (uno para 9B y otro para 4B) que trabajan junto con los parches correspondientes.

El entrenamiento se realizó los días 14 y 15 de noviembre de 2026 para el hackathon Clicky. Se generaron varios artefactos: un planificador de 9B (`bonsai2-9b-planpoint-v1-u1500`) que planifica tareas paso a paso, señala controles y escribe llamadas a herramientas; un par de parche y decodificador para el puntero de 9B; otro par para el puntero de 4B; y una reparación solo de multiplicadores del 9B (`bonsai2-9b-point-v1`). Los parches contienen únicamente los tensores que difieren del pack MLX 2-bit original de Prism ML y se aplican en memoria sobre dicho pack. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Localización de controles sobre capturas de pantalla (GUI grounding): identifica la posición de un elemento de interfaz a partir de una imagen y una instrucción en lenguaje natural.
- Planificación de tareas de varios pasos: el planificador de 9B descompone una tarea en pasos y ejecuta uno cada vez.
- Escritura de llamadas a herramientas (tool calling): el planificador genera llamadas a herramientas como parte de la ejecución de la tarea.
- Operación de macOS: los ajustes están orientados a la interacción con ventanas de aplicaciones macOS.
- Modo de dos pasadas ("two looks"): una segunda pasada amplía la zona alrededor de la primera respuesta y vuelve a preguntar, mejorando la precisión de localización.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidades multilingües: solo inglés.
- No se documentan en la información disponible capacidades de audio, visión general más allá del grounding de GUI, ni modo de razonamiento explícito (thinking); las mediciones se hicieron con thinking desactivado.

## Casos de uso

- Asistente de escritorio en macOS: el modelo puede integrarse en una aplicación de barra de menús que capture la pantalla, localice el control relevante y ejecute la acción paso a paso; es el caso de uso original (Clicky) y está optimizado para ejecutarse localmente en un MacBook sin conexión.
- Automatización de tareas repetitivas de GUI: rellenar formularios, pulsar botones o navegar menús en aplicaciones macOS, usando el planificador de 9B para secuenciar pasos y el puntero para localizar cada control.
- Testing de interfaces: verificar que los controles de una aplicación están donde se espera y son localizables, usando las métricas de pointing sobre capturas de pantalla como señal de calidad.
- Asistencia a usuarios con dificultades de accesibilidad: localizar y describir controles en pantalla para guiar a una persona, aprovechando la capacidad de señalar elementos sobre la imagen.
- Agentes de automatización de flujos de trabajo en escritorio: encadenar llamadas a herramientas generadas por el planificador con acciones sobre la GUI, en entornos donde se requiere ejecución local por privacidad.
- Investigación en GUI grounding con modelos cuantizados: servir como referencia de hasta dónde llega un modelo ternario de 9B frente a su padre en precisión completa, con métricas publicadas y reproducibles en ScreenSpot-v2 y en el conjunto de ventanas macOS.
- Prototipado rápido en Apple Silicon: al estar en formato MLX y GGUF, permite probar asistentes de computer-use en un portátil con Apple Silicon sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Todas las cifras de pointing usan decodificación greedy, thinking desactivado y el lado largo de la captura a 1280 px. Un acierto significa que el punto cae dentro de la caja del objetivo. Los corchetes son intervalos bootstrap del 95% sobre los casos.

| Modelo | ScreenSpot-v2 (1.272 casos) | Ventanas de apps macOS (2.106 casos) | Controles pequeños con vecinos cercanos (600 casos macOS) |
|---|---|---|---|
| Ternary Bonsai 2 9B, original | 43,3 (40,6–46,0) | 13,2 (11,7–14,6) | 14,2 (11,5–17,0) |
| Planificador 9B, respuesta escrita | 84,0 (81,9–85,9) | 44,7 (42,6–46,8) | 51,3 (47,5–55,3) |
| Par de puntero 9B, una pasada | 85,5 (83,5–87,3) | 46,8 (44,6–48,8) | 54,7 (50,7–58,7) |
| Par de puntero 9B, dos pasadas | 86,4 (84,5–88,3) | 57,5 (55,3–59,5) | 65,7 (61,8–69,5) |
| Ternary Bonsai 2 4B, original | 12,2 (10,5–14,0) | 3,7 (2,9–4,5) | no medido |
| Par de puntero 4B, una pasada | 82,4 (80,3–84,4) | 46,4 (44,2–48,5) | 50,8 (46,8–54,8) |
| Par de puntero 4B, dos pasadas | 85,2 (83,2–87,2) | 55,3 (53,1–57,4) | 61,5 (57,5–65,5) |
| Qwen3.5-9B (padre del 9B), precisión completa | 91,7 (90,2–93,2) | 63,8 (61,8–65,9) | 65,3 (61,5–69,2) |
| UI-Venus-2-9B, precisión completa | 95,8 (94,7–96,9) | 68,4 (66,4–70,3) | 72,7 |
| Qwen3.5-4B, 4-bit | 89,9 (88,2–91,4) | 58,8 (56,7–60,9) | no medido |

Otras métricas publicadas:

- Tareas largas, planificador 9B (120 episodios de simulador sobre tareas no vistas en entrenamiento): 27 de 120 para el modelo ajustado, 9 de 120 para el padre Qwen3.5-9B en precisión completa y 1 de 120 para Ternary Bonsai 2 original.
- Tareas guiadas de varios pasos (75 tareas, 4B con su decodificador de puntero, checkpoint anterior): 71% frente al 3% del modelo original.
- Casi aciertos: contando como acierto una respuesta sobre el objetivo o a menos de 20 px de su caja, ScreenSpot-v2 da 90,6% para el planificador, 90,0% para el par de puntero 9B y 88,1% para el par de 4B (una pasada).
- El conjunto de macOS es Screen2AX-Task restringido a 27 aplicaciones no vistas en entrenamiento; sus etiquetas son ruidosas (de 150 etiquetas revisadas a ojo, 114 correctas, 17 incorrectas y 19 dudosas), lo que rebaja la puntuación de todos los modelos.
- ScreenSpot-v2 no se usó en entrenamiento; un octavo se empleó para elegir entre ejecuciones de entrenamiento y ocho casos de escritorio comparten pantalla con datos públicos de entrenamiento de macOS. Para un checkpoint anterior, excluir ambos movió la puntuación menos de un punto.

## Requisitos de hardware

- VRAM estimada: el planificador de 9B en GGUF Q2_0 ocupa 2,56 GB en disco, por lo que la inferencia requiere del orden de 3-4 GB de memoria unificada o VRAM, sin contar el contexto y las imágenes.
- El par de puntero 9B suma 272 MB (parche) y 111 MB (decodificador); el par de 4B suma 129 MB y 101 MB; la reparación solo de multiplicadores del 9B ocupa 221 MB. Todos se aplican en memoria sobre el pack MLX 2-bit original.
- GPU recomendadas: no se especifican en la información disponible. El modelo está orientado a Apple Silicon (MLX) y a llama.cpp/LM Studio (GGUF); por tamaño, cabe en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se documentan pruebas en RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, por el tamaño del fichero GGUF de 2,56 GB; no se detallan modelos concretos probados.
- Opciones de despliegue: LM Studio y llama.cpp para el GGUF; MLX para los parches y decodificadores sobre el pack de Prism ML. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; la model card afirma que se mantienen el tamaño y la velocidad del modelo original de Prism ML.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScreenSpot-v2 | Ventanas macOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bonsai-2-Clicky (planificador 9B) | 8,95B | no disponible | 84,0% | 44,7% | apache-2.0 | Hugging Face (GGUF, parches MLX) |
| Ternary Bonsai 2 9B (original) | 9B (ternario) | no disponible | 43,3% | 13,2% | no disponible en la información | Hugging Face (Prism ML) |
| Qwen3.5-9B (padre, precisión completa) | 9B | no disponible | 91,7% | 63,8% | no disponible en la información | no disponible en la información |
| UI-Venus-2-9B (precisión completa) | 9B | no disponible | 95,8% | 68,4% | no disponible en la información | no disponible en la información |
| Qwen3.5-4B, 4-bit | 4B | no disponible | 89,9% | 58,8% | no disponible en la información | no disponible en la información |

## Limitaciones y advertencias

- El pointing sigue por detrás del padre en precisión completa en todas las filas con comparación, y bastante por detrás de UI-Venus-2-9B (95,8% en ScreenSpot-v2 y 68,4% en ventanas macOS frente a 86,4% y 57,5% del par de puntero 9B con dos pasadas).
- El resultado de tareas largas proviene de un simulador: el planificador supera al padre (27 frente a 9 de 120), pero fue entrenado en otras tareas del mismo simulador y el padre nunca se entrenó en ese formato; 93 de 120 episodios siguen fallando.
- Las habilidades generales solo se comprobaron de forma puntual: una prueba de 50 preguntas se mantuvo estable, pero no se repitieron los benchmarks generales de Prism ML sobre los modelos ajustados.
- El tool calling no tiene comparación homogénea con el modelo original; las cifras existentes no constituyen una afirmación de mejora.
- El conjunto de evaluación de macOS tiene etiquetas ruidosas (de 150 revisadas, 114 correctas, 17 incorrectas y 19 dudosas), lo que infravalora a todos los modelos.
- Solo soporta inglés, lo que limita su uso en entornos en castellano sin adaptación.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia apache-2.0, que permite uso comercial, pero se debe verificar la licencia y condiciones de los modelos base de Prism ML y de Qwen3.5, no detalladas en la información proporcionada.
- El modelo está pensado para inferencia local en Apple Silicon; el despliegue en otros entornos requiere convertir o adaptar los parches MLX.
- Los parches y decodificadores deben aplicarse juntos y sobre el pack MLX 2-bit correcto; un uso incorrecto de los pares invalida el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/aboufa/Bonsai-2-Clicky
- Repositorio del hackathon (código, notas y mediciones): https://github.com/aboufama/hackathon-clicky
- Modelo base ternario 9B en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo base ternario 9B en MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base ternario 4B en MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-mlx-2bit
