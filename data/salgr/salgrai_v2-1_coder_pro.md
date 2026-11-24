# salgr/SalgrAI_v2.1_Coder_Pro

## Resumen

SalgrAI v2.1 Pro Coder es un ajuste fino (finetune) del modelo Qwen2.5-Coder-0.5B-Instruct, desarrollado por el usuario salgr. Se trata de un modelo de generación de texto especializado en la producción de pequeñas aplicaciones HTML autónomas con JavaScript, incluyendo juegos controlados por teclado, listas filtrables, temporizadores, calculadoras y formularios. El modelo acepta instrucciones en ruso y gestiona historial de conversación multi-turno.

Con 310.187.904 parámetros reales (según safetensors) y una arquitectura transformer derivada de Qwen2, el modelo mantiene el vocabulario de 75.776 posiciones y la anchura MLP de 3072 del modelo base. El entrenamiento se realizó en tres etapas sucesivas: primero ejemplos de programas HTML completos, después juegos con estado y control, y finalmente un conjunto con instrucciones similares pero comportamiento esperado distinto. La mezcla de entrenamiento conservó ejemplos de diálogo y tareas previas.

El modelo resulta relevante como caso de estudio de especialización estrecha sobre un modelo base muy pequeño: mejora notablemente la ejecución real de programas HTML en Chromium (de 2/13 a 10/13) a costa de un ligero descenso en pruebas generales de código y conversación. Está publicado bajo licencia Apache 2.0 y se distribuye en safetensors BF16 y GGUF (F16 y Q8_0) con plantilla de chat integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2, base Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 310.187.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-c 4096`) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16, GGUF Q8_0 |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-Coder-0.5B-Instruct, con vocabulario de 75.776 tokens y anchura MLP de 3072. No se especifica en la información disponible la longitud de contexto nativa ni la composición exacta del dataset. El proceso de ajuste fino se realizó en tres etapas: una primera con ejemplos de programas HTML completos, una segunda que añadió juegos con estado y control por teclado, y una tercera con instrucciones similares pero comportamiento esperado distinto, manteniendo en la mezcla ejemplos de diálogo y de tareas anteriores. Los pesos de partida de esta versión son los de SalgrAI v2.1 Pro tras la corrección de roles. No se documentan técnicas como RLHF, DPO, decodificación especulativa o atención lineal.

## Capacidades

- Generación de código HTML y JavaScript para pequeñas aplicaciones autónomas: juegos con control por teclado (por ejemplo, serpiente 14×14 con WASD y paso de 180 ms), filtrado de listas, temporizadores, calculadoras y formularios.
- Comprensión de instrucciones en ruso y gestión de historial de chat multi-turno mediante plantilla de chat.
- Diferenciación de roles en conversación (105/105 en la prueba de roles del autor).
- Mantenimiento de diálogos cortos con historial (287/300 en la prueba correspondiente).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Generación de miniaplicaciones HTML/JS de una sola página: el modelo produce programas autónomos ejecutables en navegador, adecuado para prototipos rápidos de juegos, calculadoras o formularios a partir de una instrucción en ruso.
- Asistente de chat en ruso con memoria de conversación: gracias al soporte de historial mediante plantilla de chat, puede integrarse en interfaces conversacionales ligeras.
- Generación de juegos sencillos con control por teclado: el modelo ha sido entrenado específicamente con este tipo de tareas y supera a su versión previa en ejecución real en Chromium (10/13 frente a 2/13).
- Maquetación de formularios y listas filtrables: útil para generar componentes de interfaz autocontenidos en entornos de demostración o educación.
- Despliegue local en hardware modesto: con 310 millones de parámetros y versiones GGUF Q8_0, puede ejecutarse en CPU mediante llama.cpp para tareas de generación de código offline.
- Evaluación y experimentación con ajuste fino especializado: sirve como referencia para estudiar el equilibrio entre especialización estrecha y degradación de capacidades generales en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor (SBKCB evaluado en llama.cpp con Q8_0, temperatura 0, penalización de repetición 1,1 y límite de 200 tokens; prueba de historial en BF16; prueba de roles en Q8_0 con 15 ejecuciones y tres nombres a temperatura 0):

| Prueba | v2.1 Pro | v2.1 Pro Coder |
|---|---:|---:|
| SBKCB V1.0 (total) | 59/150 | 56/150 |
| Conocimientos en SBKCB | 12/90 | 12/90 |
| Programación en SBKCB | 16/20 | 15/20 |
| Conversación en SBKCB | 31/40 | 29/40 |
| Diálogos cortos con historial | 287/300 | 287/300 |
| Diferenciación de roles | 105/105 | 105/105 |
| Ejecución de programas HTML completos en Chromium | 2/13 | 10/13 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en BF16 (310 M de parámetros), alrededor de 0,35 GB en GGUF Q8_0 y cerca de 0,65 GB en GGUF F16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Cabe en GPU consumer y también en CPU: el ejemplo del autor usa `llama-server` con contexto de 4096 y hasta 1100 tokens de generación.
- Opciones de despliegue: Transformers (versión probada 5.24.0), llama.cpp (GGUF con plantilla de chat integrada), y por las etiquetas del repositorio, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| SalgrAI v2.1 Pro Coder | 310 M | no disponible | Apache 2.0 | HTML/JS en ruso |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0,5 B | no disponible en la información | Apache 2.0 | Código general |
| SalgrAI v2.1 Pro (versión previa) | 310 M | no disponible | Apache 2.0 | Diálogo y código en ruso |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede incumplir condiciones nuevas no vistas en entrenamiento y cometer errores de lógica en los programas generados; el autor documenta un caso en el que un clicador solicitado para tres puntos otorgaba uno.
- Puede producir frases poco naturales en ruso.
- La especialización en HTML/JS reduce las puntuaciones generales: en SBKCB baja de 59/150 a 56/150, con descensos en programación (16/20 a 15/20) y conversación (31/40 a 29/40).
- Idiomas soportados limitados al ruso según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación y de sesgos: no documentado por el autor, pero inherente a un modelo de 310 M de parámetros.
- Aunque la licencia es Apache 2.0, deben revisarse los avisos de cambios en pesos y tokenizador recogidos en el fichero NOTICE del repositorio antes de su uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_v2.1_Coder_Pro
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Evaluación SBKCB: eval/sbkcb.json (en el repositorio)
- Prueba de historial: eval/context.json (en el repositorio)
- Prueba de roles: eval/roles.json (en el repositorio)
- Prueba HTML: eval/html.json (en el repositorio)
- Prueba de serpiente con WASD: eval/snake-wasd.json (en el repositorio)
- Aviso de cambios: NOTICE (en el repositorio)
- Licencia: LICENSE (en el repositorio)
