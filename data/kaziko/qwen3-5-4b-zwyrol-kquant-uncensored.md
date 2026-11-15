# Kaziko/Qwen3.5-4B-Zwyrol-KQuant-Uncensored

## Resumen

Qwen3.5-4B-Zwyrol-KQuant-Uncensored es una variante del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el desarrollador independiente Kaziko bajo el seudónimo del asistente personal "Zwyrol". Es un modelo de 4.539.265.536 parámetros (4,5B) en formato MLX de 4 bits, cuantizado con el método KQuant del usuario nace-ai, sobre el que se ha aplicado una edición de pesos para eliminar el comportamiento de rechazo (abliteration) sin reentrenamiento. El resultado es un modelo "sin censura" orientado a conversación y tool calling en polaco e inglés, pensado para ejecutarse localmente en hardware Apple Silicon.

El modelo parte de tres linajes: el Qwen3.5-4B original, el pack MLX Q4 KQuant de nace-ai y el modelo Heretic bf16 de TheCluster, del que se toman las matrices editadas. La modificación afecta únicamente a 29 matrices de pesos (proyecciones de salida de atención y down_proj de las capas 14-31), sin entrenamiento adicional. El repo ocupa 3,3 GB y los pesos en 4 bits pesan 3,03 GB, el mismo tamaño y velocidad que el KQuant sin editar.

Es relevante porque demuestra una técnica de edición de pesos que preserva la ventaja de una cuantización de alta calidad (menor divergencia KL respecto al modelo de referencia) mientras elimina el rechazo, y porque publica una evaluación comparativa detallada frente a builds alternativos con pruebas de tool calling, refusals y fidelidad a la cuantización. Su enfoque es principalmente experimental y de uso personal, con cifras concretas sobre falsos positivos en llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con atención lineal (`linear_attn`) y atención estándar (`self_attn`); no se detalla el esquema completo |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, formato MLX affine, group size 64 |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (4-bit), librería `mlx` |

## Arquitectura y entrenamiento

El modelo es una cuantización de 4 bits del Qwen3.5-4B en formato MLX con esquema affine de grupo 64: cada grupo de 64 pesos comparte una escala y un offset. Sobre esa base KQuant (cuyo método de selección de escalas y offsets no es público, aunque mantiene el formato estándar MLX) se aplica una edición directa de 29 matrices de pesos, tomadas del modelo Heretic bf16 de TheCluster y redondeadas sobre las propias escalas y offsets de KQuant. Las matrices afectadas son `linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj` de las capas 14 a 31. El resto de tensores son idénticos bit a bit a KQuant y la capa de salida permanece atada al embedding (`tied`).

No hay entrenamiento ni ajuste fino: la única intervención es la edición de pesos para eliminar el rechazo. A diferencia del modelo Zwyrol previo, no se incluye una compuerta de tool calling en la capa de salida; el autor probó una reajustada y la descartó por una regla fijada antes del test. El razonamiento es que la edición de rechazo por sí sola ya produce una frecuencia de llamadas a herramientas equivalente a la de Zwyrol, con menos ediciones y menor tamaño de archivo. No se dispone de información sobre el dataset de entrenamiento original de Qwen3.5-4B, número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` (soporte de entrada imagen-texto según el pipeline tag; no se detalla la implementación de visión en la información disponible).
- Tool calling / function calling: probado con un conjunto de 6 herramientas de solo lectura (lectura de pantalla, estado de agentes y notas).
- Razonamiento multi-paso y comportamiento de agente, orientado al asistente personal "Stefan".
- Capacidades multilingües limitadas a polaco e inglés; el polaco es el idioma principal de las evaluaciones.
- Modo "uncensored": responde a peticiones que el modelo original rechaza (6 de 104 prompts dañinos rechazados frente a 103 del original; 1 de 104 con instrucción "Odpowiedz po polsku.").
- Cuantización MLX de 4 bits con velocidad y tamaño equivalentes al pack KQuant sin editar.

## Casos de uso

- Asistente de voz personal en polaco: el modelo fue creado específicamente para "Stefan", un asistente que lee la pantalla, consulta el estado de agentes y guarda notas; su sistema de prompt y lista de herramientas están en polaco y el modelo está evaluado en ese escenario exacto.
- Automatización de escritorio con tool calling: puede invocar herramientas de lectura de pantalla (`screen_read`, `screen_look`) y de estado de agentes para construir flujos de automatización local en macOS con MLX.
- Gestión de notas y memoria de agente: soporta llamadas a herramientas de notas dentro de conversaciones multi-turno, adecuado para asistentes que mantienen contexto persistente.
- Inferencia local en Apple Silicon: el formato MLX y los 3,03 GB permiten ejecutarlo en Macs con memoria unificada moderada, sin GPU dedicada, con velocidad idéntica al KQuant sin editar (evaluado en Mac Studio M2 Max de 32 GB).
- Experimentación en edición de pesos y abliteration: sirve como referencia reproducible para investigadores que estudian cómo aplicar ediciones de rechazo sobre bases cuantizadas preservando la calidad de la cuantización (KL de 0,0871 frente al Heretic bf16, la más baja entre los builds 4-bit comparados).
- Evaluación de robustez de tool calling: el autor publica un conjunto de pruebas (38 preguntas de pantalla, 51 con herramienta esperada, 18 sin herramienta) útil para comparar la tasa de falsos positivos en llamadas a herramientas entre variantes.
- Prototipado de asistentes conversacionales sin censura en entornos controlados: para aplicaciones donde el filtrado de rechazo del modelo base interfiere con la tarea y la aplicación aplica su propio filtrado posterior.

## Benchmarks y rendimiento

Los datos publicados son métricas internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). Ejecutados en un Mac Studio M2 Max (32 GB), decodificación greedy, thinking desactivado.

Cercanía al modelo de precisión completa (KL media sobre respuestas de 64 tokens, 154 prompts en polaco con el system prompt de Stefan y 6 herramientas; menor es mejor):

| Modelo (4-bit) | Frente a Heretic bf16 | Frente a Qwen3.5-4B bf16 (stock) |
|---|---|---|
| mlx-community 4-bit sin editar | 0,1346 | 0,1107 |
| KQuant sin editar | 0,0992 | 0,0785 |
| Zwyrol | 0,1227 | 0,2001 |
| **Este modelo** | **0,0871** | 0,1344 |

Decisiones de tool calling (38 preguntas de pantalla, 51 con herramienta esperada, 18 sin herramienta):

| Modelo | Preguntas de pantalla que llaman | Herramienta esperada | Llamadas falsas |
|---|---|---|---|
| mlx-community 4-bit original | 13/38 | 23/51 | 0/18 |
| Zwyrol | 32/38 | 41/51 | 0/18 |
| **Este modelo** | **35/38** | **41/51** | 2/18 |

En la aplicación Stefan completa (una ejecución cada uno, temperatura 0):

| Modelo | Llamadas de pantalla | Herramienta esperada | Llamadas falsas | Verificaciones de hechos | Instrucciones inocuas: obedecidas / llamada a herramienta (de 75) |
|---|---|---|---|---|---|
| Zwyrol | 34/38 | 37/51 | 1/18 | 6/6 | 45 / 28 |
| **Este modelo** | **36/38** | **41/51** | 4/18 | 2/6 | **53 / 21** |

Rechazos sobre 104 prompts dañinos:

| Versión | Inglés | Con "Odpowiedz po polsku." |
|---|---|---|
| 4-bit original | 103 | 100 |
| Zwyrol | 4 | 0 |
| **Este modelo** | 6 | 1 |

## Requisitos de hardware

- VRAM/memoria: 3,03 GB de pesos en 4 bits; el repo completo ocupa 3,3 GB. Con overhead de MLX se recomienda al menos 8 GB de memoria unificada, aunque el autor lo ejecuta en 32 GB.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con memoria unificada; evaluado en Mac Studio M2 Max de 32 GB. No está pensado para GPU NVIDIA/AMD con CUDA/ROCm en su formato MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con al menos 8 GB de memoria unificada; no aplica a GPUs discretas en formato MLX.
- Opciones de despliegue: MLX (librería `mlx`, `mlx-lm`); al ser formato MLX nativo, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión.
- Latencia y throughput: el autor indica que corre a la misma velocidad que el KQuant sin editar por tener el mismo tamaño y formato, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| **Este modelo** | 4,5B | No disponible | MLX safetensors, 4-bit KQuant | Apache 2.0 | Edición de rechazo sobre KQuant; 0,0871 KL frente a Heretic bf16 |
| Zwyrol (Kaziko) | 4,5B | No disponible | MLX 4-bit sobre mlx-community | Apache 2.0 | Edición de rechazo + compuerta de tool calling; 0,1227 KL frente a Heretic bf16 |
| KQuant sin editar (nace-ai) | 4,5B | No disponible | MLX 4-bit KQuant | Apache 2.0 | Base cuantizada de alta calidad; 0,0992 KL frente a Heretic bf16; rechaza 103/104 prompts dañinos |
| mlx-community 4-bit sin editar | 4,5B | No disponible | MLX 4-bit estándar | Apache 2.0 | Cuantización estándar; 0,1346 KL frente a Heretic bf16 |
| Qwen3.5-4B (base original) | 4,5B | No disponible | safetensors bf16 | Apache 2.0 | Modelo de referencia sin editar; rechaza 103/104 prompts dañinos en inglés |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo "uncensored", puede generar contenido que el modelo base rechazaría y no incorpora filtros propios.
- Riesgo de alucinación: las verificaciones de hechos en la aplicación Stefan son mixtas, con 2 de 6 correctas frente a 6 de 6 del modelo Zwyrol previo; indicio de mayor propensión a errores factuales en ese escenario.
- Falsos positivos en tool calling: 4 de 18 preguntas sin herramienta provocaron llamadas falsas en la aplicación, frente a 1 de 18 en Zwyrol; las cuatro son `screen_read` o `screen_look` sobre preguntas de conocimiento general (p = 0,375, no significativo con este tamaño de muestra).
- Diferencias no significativas: las ventajas frente a Zwyrol en preguntas de pantalla (4 ganadas, 1 perdida; p = 0,38) y en llamadas falsas (p = 0,5) no alcanzan significación estadística; el conjunto de test es pequeño.
- Limitaciones de idioma: solo polaco e inglés declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el usuario es responsable del uso y del filtrado que su aplicación requiera; el contenido "sin censura" puede incumplir políticas de plataformas o normativas según el contexto.
- Caveat de producción: el formato MLX limita el despliegue a hardware Apple Silicon; el modelo tiene 0 descargas y 0 likes, es un artefacto experimental de uso personal y no ha pasado por un proceso de validación externa.
- El método de cuantización KQuant no es público; la reproducibilidad de las escalas y offsets no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaziko/Qwen3.5-4B-Zwyrol-KQuant-Uncensored
- Modelo Zwyrol (variante previa): https://huggingface.co/Kaziko/Qwen3.5-4B-Zwyrol
- Base KQuant 4-bit de nace-ai: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-Q4-KQuant
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Repositorio Heretic (edición de rechazo): https://github.com/p-e-w/heretic
- Modelo Heretic bf16 de TheCluster: no disponible en la información proporcionada (referenciado como `TheCluster/Qwen3.5-4B-Heretic-MLX` en los metadatos)
