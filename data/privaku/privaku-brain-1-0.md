# privaku/PRIVAKU-Brain-1.0

## Resumen

PRIVAKU Brain 1.0 es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por Privaku, un fine-tune con LoRA fusionado sobre Qwen/Qwen2.5-1.5B-Instruct. Su propósito es la automatización de interfaces de usuario móviles: recibe un objetivo en lenguaje natural y una descripción textual de la pantalla, y devuelve la siguiente acción a ejecutar o la lista completa de pasos para alcanzar el objetivo. Está diseñado para ejecutarse íntegramente en el dispositivo (iOS y Android), sin enviar datos a un servidor.

El modelo se distribuye en dos formatos: pesos MLX de 4 bits para iOS y Apple Silicon (unos 0,85 GB) y un archivo GGUF Q4_K_M para Android y cualquier runtime compatible con llama.cpp (unos 0,99 GB). Se entrenó específicamente para pantallas de aplicaciones iOS y Android, en inglés y japonés, e incorpora defensas contra inyección de prompts en el texto de la pantalla: solo el objetivo del usuario se trata como instrucción.

Se encuentra en estado beta. El autor publica resultados propios (BrainBench, 36 tareas) que muestran un 88,9% de tareas completadas frente al 66,7% del modelo en dispositivo de Apple, aunque con la advertencia explícita de que el modelo fue entrenado con las pantallas de la propia app de Privaku y de que la comparación no es generalizable. Es relevante ahora porque demuestra que un modelo de 1,5B cuantizado a 4 bits puede operar UIs móviles de forma local con latencia de decenas de segundos por tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct), fine-tune con LoRA fusionado |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit; GGUF Q4_K_M |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parámetros, y se ajusta mediante LoRA, cuyos adaptadores se fusionan posteriormente en los pesos base. No se documenta ninguna modificación estructural de la arquitectura original; la innovación reside en el ajuste de comportamiento y en el formato de salida estructurado (JSON con acciones o pasos).

El entrenamiento se realizó sobre pantallas de aplicación generadas para múltiples categorías (compras, banca, chat, ajustes, viajes, salud, notas), en inglés y japonés, con erratas y lenguaje coloquial. Se incluyeron peticiones de estilo real (llamar, enviar mensaje, traducir, enviar correo, recordar, buscar, tomar nota), pantallas y nombres de controles reales de las apps y el sitio web de Privaku, y tareas que se completaron de extremo a extremo en una app real. Como ejemplos negativos se incorporaron textos de pantalla que intentan dar instrucciones al modelo (inyección de prompts), de modo que solo el objetivo del usuario cuente como instrucción. No se detalla el número total de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de la siguiente acción de UI en formato JSON estricto, con las acciones `click`, `type`, `select`, `scroll`, `navigate`, `done`, `fail` y `ask`.
- Descomposición de un objetivo en lenguaje natural en una lista de pasos exactos usando los nombres de control reales de la app.
- Soporte de dos modos con prompts de sistema específicos: "next action" y "goal to steps"; el modelo fue entrenado con esos prompts exactos.
- Comprensión de descripciones textuales de pantalla (jerarquía, título, elementos con identificadores y valores).
- Capacidad de pedir información faltante al usuario mediante el campo `ask`.
- Resistencia a inyección de prompts en el texto de la pantalla (tratado como información, no como instrucción).
- Multilingüe limitado a inglés y japonés.
- Ejecución en dispositivo: no requiere servidor ni conexión de red.
- No incluye visión: la entrada es una descripción textual de la pantalla, no una imagen.

## Casos de uso

- Automatización de ajustes en apps móviles: el modelo recibe la pantalla de ajustes como texto y devuelve la acción exacta (por ejemplo, activar el modo oscuro), que un motor de reglas ejecuta y verifica en pantalla.
- Asistentes de accesibilidad: un usuario con dificultades motrices dicta un objetivo ("activa el modo oscuro", "envía un correo a Ana") y el modelo traduce el objetivo en pasos concretos sobre los controles de la app.
- Rellenado de formularios multi-pantalla: con la lista de controles de todas las pantallas de la app, el modelo genera la secuencia de pasos (tocar, escribir, seleccionar) que un motor de reglas ejecuta paso a paso.
- Automatización de tareas repetitivas en apps de banca o compras: el modelo planifica la navegación y las acciones necesarias a partir del objetivo y del estado de la pantalla actual.
- Agentes de automatización de pruebas de UI: el modelo puede generar secuencias de acciones para pruebas end-to-end en apps iOS y Android a partir de objetivos descritos en lenguaje natural.
- Procesamiento local con privacidad: al ejecutarse en el dispositivo con pesos de 0,85-0,99 GB, es adecuado para escenarios donde los datos de pantalla no pueden salir del teléfono (salud, banca, mensajería).
- Asistente de configuración guiada: el modelo puede pedir los datos personales que faltan antes de generar los pasos, lo que permite flujos de incorporación o configuración inicial.

## Benchmarks y rendimiento

Resultados publicados por Privaku (11 de noviembre de 2026), medidos en su propia app iOS (BrainBench, 36 tareas: navegación, formularios, ajustes, multi-paso, peticiones vagas, japonés y casos de seguridad). Una tarea se considera completada solo si la pantalla final muestra el resultado.

| 36 tareas | PRIVAKU Brain 1.0 | Modelo en dispositivo de Apple (Apple Intelligence) |
|---|---|---|
| Completadas | 32 (88,9%) | 24 (66,7%) |
| Abandonadas | 2 | 7 |
| Dijo "hecho" sin estarlo | 2 | 5 |
| Actuó sin aprobación en paso de riesgo | 0 | 0 |
| Tiempo mediano por tarea completada | 14,7 s | 20,3 s |

Condiciones declaradas por el autor: la app es la propia app de Privaku, el modelo se entrenó con sus pantallas y con ejecuciones de 16 de esas 36 tareas que ya habían pasado; el modelo de Apple es general y no vio nada de ello. La ejecución se hizo en el simulador de iOS, con Brain 1.0 servido desde un Mac y el modelo de Apple ejecutándose como lo proporciona el sistema, con una sola ejecución cada uno. En un iPhone 15 Pro Max real, una versión anterior de Brain 1.0 no superó al modelo de Apple en peticiones abiertas para las que no había sido entrenado.

Precisión de pasos: 91,6% de coincidencia exacta en un conjunto reservado de 1.000 pasos (mezcla de pantallas generadas, peticiones de estilo real y pantallas y tareas de las apps y el sitio web de Privaku). Las peticiones de estilo real son el punto débil: 56 de 84 en ese conjunto. Los archivos de 4 bits puntúan dentro de medio punto del modelo sin cuantizar (medido en una ronda anterior).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,85 GB con MLX 4-bit y aproximadamente 0,99 GB con GGUF Q4_K_M; el modelo sin cuantizar ocuparía del orden de 3 GB en FP16.
- GPU recomendadas: no se especifican; el objetivo es la ejecución en dispositivo móvil (iPhone, Android) y Apple Silicon. Para servidor no se documentan requisitos.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con al menos 2 GB de memoria libre puede alojarlo en cuantización de 4 bits, aunque el diseño está orientado a móvil.
- Opciones de despliegue: `mlx-lm` y `mlx-swift` (iOS y Apple Silicon), llama.cpp para el archivo GGUF (Android y otros entornos).
- Latencia y throughput: tiempo mediano de 14,7 s por tarea completada en BrainBench (simulador iOS, modelo servido desde un Mac); no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRIVAKU Brain 1.0 | 1,54B | no disponible | Automatización de UI móvil, on-device | Apache-2.0 | Hugging Face (MLX y GGUF) |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible en la información | Asistente general, multilingüe | Apache-2.0 | Hugging Face |
| Modelo en dispositivo de Apple (Apple Intelligence) | no disponible | no disponible | Asistente general en dispositivo | propietaria | Solo en dispositivos Apple compatibles |

La comparación con el modelo de Apple procede de la evaluación del propio autor y está sesgada a favor de PRIVAKU Brain 1.0 por el entrenamiento específico en su app; no debe interpretarse como una comparación general. No se dispone de datos de benchmarks frente a otros modelos de automatización de UI.

## Limitaciones y advertencias

- Estado beta: el autor advierte explícitamente de que el modelo comete errores y mejora día a día.
- Las peticiones de estilo real ("llamar a Sam", "traducir hola al japonés") son el punto débil: solo 56 de 84 correctas en el conjunto de evaluación.
- En peticiones abiertas no entrenadas, una versión anterior no superó al modelo de Apple en un iPhone 15 Pro Max real.
- El resultado de BrainBench está sesgado: se midió en la propia app de Privaku, con pantallas vistas durante el entrenamiento, y en el simulador, no en dispositivo.
- Solo admite inglés y japonés; no hay soporte documentado de otros idiomas.
- No procesa imágenes: requiere una descripción textual de la pantalla generada por otro componente.
- Depende de prompts de sistema exactos; usarlos de otra forma puede degradar el comportamiento.
- Riesgo de alucinación en la identificación de controles o pasos; el motor de reglas que ejecuta las acciones debe verificar el resultado en pantalla, ya que el modelo no actúa por sí mismo.
- Riesgo de inyección de prompts mitigado por entrenamiento con ejemplos negativos, pero no eliminado; conviene validar las acciones antes de ejecutarlas, especialmente en pasos destructivos (borrado de cuentas, pagos).
- Licencia Apache-2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-1.5B-Instruct, también Apache-2.0.
- No se documentan sesgos específicos ni la composición detallada del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/privaku/PRIVAKU-Brain-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Sitio del autor: https://privaku.com
- Repositorio de `mlx-lm`: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
