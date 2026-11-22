# ahmetggg/GAL-X-Qwen35-2B-v090

## Resumen

GAL-X Qwen3.5-2B v0.9.0 es un modelo visión-lenguaje compacto de aproximadamente 1.940 millones de parámetros, desarrollado por el usuario ahmetggg, especializado en la predicción de acciones sobre interfaces gráficas de escritorio. Se construye mediante un ajuste fino supervisado con LoRA de 16 bits sobre el modelo base Qwen/Qwen3.5-2B, y su función es recibir una captura de pantalla junto con el contexto de la tarea para predecir una única acción estructurada en formato JSON. No es un modelo de chat generalista, sino una política de acción que debe integrarse dentro de un sistema de computer-use más amplio que gestione la planificación, la validación y la ejecución.

El modelo emplea un vocabulario de acciones en turco (tikla, cift_tikla, sag_tikla, yaz, tus, kaydir, surukle, fare_tasi, bekle, bitir) y coordina las posiciones en un rango normalizado de 0 a 1000 sobre el lienzo de imagen, no en píxeles de pantalla. Se distribuye principalmente en formato GGUF Q4_K_M junto con un proyector multimodal F16 separado (mmproj), lo que lo hace desplegable en entornos con recursos limitados mediante llama.cpp.

La relevancia de esta versión radica en su carácter experimental: es un checkpoint temprano de investigación, publicado bajo licencia Apache 2.0, que explora el ajuste fino eficiente de modelos de 2B para tareas de automatización de escritorio. El autor advierte explícitamente de que no es fiable para control desatendido de computadoras ni para acciones con consecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (derivada de Qwen3.5-2B) con adaptador LoRA |
| Parametros totales | 1.942.653.248 (aprox. 1,94B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | GGUF Q4_K_M (formato de despliegue principal); LoRA en 16 bits |
| Idiomas soportados | Inglés (en) y turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-2B, un transformer visión-lenguaje de aproximadamente 2B parámetros. Sobre él se aplicó un ajuste fino supervisado (SFT) con LoRA de 16 bits (no QLoRA de 4 bits), con rango 16, alpha 16, dropout 0.05 y módulos objetivo en todas las capas lineales. La configuración de entrenamiento incluyó batch efectivo de 8 (micro-batch 1 × acumulación de gradiente 8), longitud máxima de secuencia de 2.048 tokens, optimizador AdamW de 8 bits y tasa de aprendizaje de 3e-5. El checkpoint liberado corresponde al paso global de optimizador 798 (`kontrol/adim_798`).

Los datos de entrenamiento provienen de un subconjunto filtrado de UI-MOPD/Uni-GUI-Desktop-1. El split de desarrollo de v0.9.0 contiene 708 ejemplos (646 de acción y 62 de planificación), mientras que el split de entrenamiento contiene 6.935 ejemplos (6.380 de acción y 555 de planificación). El pipeline de datos filtró y normalizó registros de acción, preservó capturas de pantalla, convirtió las coordenadas de origen al convenio normalizado de GAL-X (rango 0-1000) y separó los ejemplos de planificación de los de acción. El dataset original reporta 2.685 trayectorias de escritorio, aproximadamente 36K pasos y 10 categorías de aplicaciones, aunque GAL-X no entrenó sobre el archivo completo. No se menciona el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones de GUI condicionada por captura de pantalla: genera una única acción estructurada en JSON a partir de la imagen del escritorio y el contexto de la tarea.
- Vocabulario de acciones de escritorio: clic izquierdo, doble clic, clic derecho, escritura de texto, pulsación de teclas o atajos, desplazamiento, arrastre, movimiento del puntero, espera y finalización.
- Razonamiento breve de acción: el campo `dusun` proporciona una justificación corta de la acción seleccionada (no es una cadena de pensamiento privada).
- Coordenadas normalizadas: las posiciones se expresan en el rango 0-1000 del lienzo de imagen, lo que facilita la conversión a la geometría real de la captura.
- Capacidades de planificación limitadas: el modelo incluye ejemplos de planificación en el entrenamiento, aunque la planificación robusta debe aportarla la aplicación anfitriona.
- Soporte multilingüe limitado: el texto de la tarea puede estar en turco o inglés; los nombres de campo de la interfaz de acción están en turco.
- Integración con llama.cpp y GGUF: despliegue mediante el formato Q4_K_M con proyector multimodal F16 separado.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.

## Casos de uso

- Investigación en políticas de acción para computer-use: el modelo sirve como componente de predicción de siguiente acción dentro de un sistema que separa planificación, validación y ejecución, permitiendo experimentar con políticas visión-lenguaje compactas de 2B parámetros.
- Automatización de tareas repetitivas de escritorio en entornos controlados: con una captura de pantalla y una tarea definida, el modelo predice acciones como clics o escritura, que un runtime valida y ejecuta paso a paso.
- Evaluación de ajuste fino eficiente con LoRA: el checkpoint y su configuración (rango 16, alpha 16, SFT de 16 bits) sirven como referencia para estudiar el rendimiento de adaptadores de bajo rango en tareas de GUI.
- Pruebas de pipelines de datos de trayectorias GUI: el modelo permite validar la conversión de coordenadas al convenio normalizado 0-1000 y la separación entre ejemplos de acción y de planificación.
- Prototipado de asistentes de escritorio con validación humana: integrado en una aplicación que exige confirmación del usuario antes de ejecutar cada acción, el modelo puede sugerir el siguiente paso en flujos de trabajo guiados.
- Despliegue en hardware limitado: gracias a su tamaño de ~1,94B parámetros y su formato GGUF Q4_K_M, puede ejecutarse en equipos con recursos moderados para experimentación local con llama.cpp.
- Investigación multilingüe turco-inglés en interfaces: permite estudiar cómo un modelo compacto maneja instrucciones de tarea en dos idiomas con un vocabulario de acciones fijo en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación sobre un holdout de 646 ejemplos de acción (excluyendo los de planificación), pero el contenido proporcionado se interrumpe antes de reportar las métricas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors de ~1,94B parámetros en 16 bits requiere aproximadamente 4 GB de VRAM; la versión GGUF Q4_K_M reduce el peso a aproximadamente 1,2-1,5 GB, más el proyector multimodal F16 separado.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una GPU consumer con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) sería suficiente para la cuantización Q4_K_M.
- Cabe en GPU consumer: sí, en GPUs con al menos 6-8 GB de VRAM para el formato Q4_K_M; el formato de 16 bits requiere alrededor de 4-5 GB solo para los pesos.
- Opciones de despliegue: llama.cpp (formato GGUF Q4_K_M con mmproj F16), transformers (safetensors y adaptador LoRA); compatible con endpoints según las etiquetas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| GAL-X Qwen3.5-2B v0.9.0 | ~1,94B | 2.048 tokens | Apache 2.0 | safetensors, GGUF, LoRA | Política de acción GUI (visión-lenguaje) |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | no disponible | no disponible | Modelo visión-lenguaje generalista |
| Alternativas de GUI-agent de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Estado experimental: es un checkpoint temprano de investigación, no fiable para control desatendido de computadoras ni para acciones con consecuencias.
- No es un modelo de chat generalista: no proporciona planificación robusta, controlador de escritorio ni sistema de verificación; la aplicación anfitriona debe aportar esos componentes.
- Riesgo de alucinación en acciones y coordenadas: el modelo puede predecir acciones inválidas o coordenadas fuera de rango; es obligatorio validar el esquema JSON y los límites antes de ejecutar.
- Coordenadas normalizadas: las posiciones están en el rango 0-1000 del lienzo de imagen, no en píxeles; una conversión incorrecta con la geometría de la captura provoca ejecuciones erróneas.
- Idiomas limitados: solo inglés y turco; los nombres de campo de la interfaz de acción están en turco, lo que limita su uso en otros idiomas sin adaptación.
- Contexto limitado: 2.048 tokens de longitud máxima de secuencia, lo que restringe el historial de acciones y observaciones que puede manejar.
- Datos de entrenamiento acotados: subconjunto filtrado de Uni-GUI-Desktop-1 (6.935 ejemplos de entrenamiento), lo que puede limitar la generalización a aplicaciones y flujos no representados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y desaconseja explícitamente el uso en acciones consecuentes.
- Ausencia de benchmarks publicados: no hay métricas de rendimiento verificables en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmetggg/GAL-X-Qwen35-2B-v090
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/UI-MOPD/Uni-GUI-Desktop-1
- Paper de referencia (arXiv:2607.04425): https://arxiv.org/abs/2607.04425
