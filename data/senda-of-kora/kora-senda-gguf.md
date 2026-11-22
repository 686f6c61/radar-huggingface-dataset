# senda-of-kora/kora-senda-gguf

## Resumen

Kora · La Senda de Kora es una familia de adaptadores LoRA publicados en formato GGUF sobre la base Qwen2.5-Instruct, desarrollada por el proyecto senda-of-kora. Su propósito no es el de un asistente general, sino el de un narrador especializado: recibe un PLAN estructurado en cinco campos (Apertura, Lugar, Conflicto, Giro, Rumbo) y devuelve una escena de 110-145 palabras seguida de 2-3 opciones numeradas para que el lector elija el rumbo de la historia. El repositorio `kora-senda-gguf` distribuye dos variantes cuantizadas en Q4_K_M: una sobre Qwen2.5-0.5B-Instruct (379 MB) y otra sobre Qwen2.5-1.5B-Instruct (940 MB).

La relevancia del proyecto es fundamentalmente práctica: está diseñado para ejecutarse offline en Android mediante `llama.cpp`, con un pico de RAM de aproximadamente 0,55 GB para la variante de 0,5B y de 1,1 GB para la de 1,5B. Esto lo sitúa en el segmento de modelos de bolsillo para narrativa interactiva, donde el coste computacional y la huella de memoria importan más que la amplitud de conocimientos.

Técnicamente se trata de un ajuste fino con LoRA (r=16, 16 capas, 1200 iteraciones, `max_seq_length=512`) entrenado sobre unas 2200 escenas sintéticas generadas por un modelo maestro `qwen3.6:35b-a3b`. La licencia Apache-2.0 se hereda de la base Qwen2.5. El modelo está etiquetado como conversacional y compatible con endpoints, con soporte declarado de español e inglés, aunque su especialización real es la narrativa en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA fusionado en pesos GGUF |
| Parametros totales | 494.032.768 (variante 0.5B, dato safetensors); la variante 1.5B se distribuye solo en GGUF y su recuento exacto no esta disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrenamiento (`max_seq_length`); la ventana nativa de Qwen2.5 no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); los LoRA originales se referencian en `senda-of-kora/kora-senda-0.5b-lora` |
| Tamano del repo | 1,8 GB |
| Base | Qwen/Qwen2.5-0.5B-Instruct y Qwen/Qwen2.5-1.5B-Instruct |
| LoRA | r=16, 16 capas, 1200 iteraciones |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Instruct en sus variantes de 0,5B y 1,5B, es decir, transformers decoder-only con atención causal estándar. Sobre ellas se aplica un ajuste LoRA con rango 16 y 16 capas adaptadas, entrenado durante 1200 iteraciones con una longitud máxima de secuencia de 512 tokens. Los pesos resultantes se exportan a GGUF en cuantización Q4_K_M para su uso con `llama.cpp`.

El dataset de la versión v4 consta de aproximadamente 2200 escenas sintéticas generadas por un modelo maestro `qwen3.6:35b-a3b` a partir de planes deterministas producidos por el planificador Akasha. La decisión de usar un único escritor para todo el dataset busca preservar una voz narrativa coherente y evitar la mezcla de estilos. El proceso incluye validación estricta: recuento de palabras dentro del rango 110-145, presencia de 2-3 opciones numeradas, comprobaciones anti-bucle y verificación de claves temáticas. No se documenta en la información disponible el uso de RLHF o DPO; el entrenamiento descrito es exclusivamente de ajuste supervisado vía LoRA.

## Capacidades

- Generación de prosa narrativa en español a partir de un PLAN estructurado de cinco campos (Apertura, Lugar, Conflicto, Giro, Rumbo).
- Producción de escenas de longitud controlada (110-145 palabras) en una sola línea de prosa.
- Generación de 2-3 opciones numeradas de continuación para narrativa interactiva tipo "elige tu propia aventura".
- Mantenimiento de coherencia temática con el plan recibido, reforzado por las claves temáticas usadas en la validación del dataset.
- Soporte bilingüe declarado (español e inglés), con especialización real en español.
- Ejecución offline en dispositivos Android mediante `llama.cpp`.
- Formato conversacional y etiqueta `endpoints_compatible`, lo que permite servirlo tras una API compatible con endpoints estándar.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento explícito ("thinking mode") según la información disponible.

## Casos de uso

- **Narrativa interactiva móvil offline**: integrado en una app Android con `llama.cpp`, el modelo genera cada escena y sus opciones sin conexión, usando la variante 0.5B en dispositivos con 2-3 GB de RAM libre y la 1.5B en gama media-alta con 4 GB o más.
- **Generación de contenido por lotes para prototipos de videojuegos**: dado un conjunto de planes deterministas, el modelo produce escenas homogéneas en estilo y longitud, útil para poblar ramas narrativas de un juego antes de contar con escritura humana.
- **Aventuras conversacionales por turnos**: el formato de salida (prosa + opciones numeradas) encaja directamente en un bucle de turnos donde el usuario responde con un número y el sistema construye el siguiente PLAN.
- **Generación de escenas para talleres de escritura**: el modelo sirve como generador de borradores acotados a partir de una estructura previa, lo que permite iterar sobre el conflicto o el giro sin reescribir la escena completa.
- **Prototipado rápido de experiencias de lectura en español**: al ser un GGUF de menos de 1 GB, se puede desplegar en portátiles modestos y en entornos de CI para pruebas de formato y validación de salida.
- **Filtro y validador de planes narrativos**: combinado con el planificador Akasha, el modelo puede usarse para comprobar que un plan produce una escena viable dentro del rango de palabras y con opciones bien formadas.
- **Demostraciones educativas de ajuste LoRA**: el repositorio y su model card documentan el pipeline completo (dataset sintético, LoRA, export a GGUF), lo que lo convierte en un ejemplo didáctico de especialización de un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: aproximadamente 0,55 GB de RAM pico para `kora-0.5b-v4-Q4_K_M.gguf` (379 MB en disco) y aproximadamente 1,1 GB para `kora-1.5b-v4-Q4_K_M.gguf` (940 MB en disco).
- **GPU recomendadas**: no se especifican en la información disponible. El diseño apunta a ejecución en CPU mediante `llama.cpp` en Android, por lo que no requiere GPU dedicada.
- **Consumer GPU**: cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM; también en CPU y en móviles de gama baja (0.5B) y media-alta (1.5B).
- **Opciones de despliegue**: `llama.cpp` (`llama-cli`, `llama-server`), cualquier frontend compatible con GGUF y, por la etiqueta `endpoints_compatible`, servidores que expongan una API compatible con endpoints estándar.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Kora 0.5B (este repo) | ~494 M | 512 (entrenamiento) | Narrativa interactiva es | Apache-2.0 | GGUF Q4_K_M |
| Kora 1.5B (este repo) | no disponible (base 1.5B) | 512 (entrenamiento) | Narrativa interactiva es | Apache-2.0 | GGUF Q4_K_M |
| Qwen2.5-0.5B-Instruct | ~494 M | no disponible en esta ficha | Asistente general | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1.5 B | no disponible en esta ficha | Asistente general | Apache-2.0 | safetensors, GGUF |

La comparación relevante es contra las bases sin ajustar: Kora sacrifica amplitud de conocimiento general a cambio de un formato de salida muy específico (escena acotada más opciones numeradas) y de una voz narrativa consistente en español. No se dispone de datos de benchmarks que permitan comparar calidad objetiva frente a las bases.

## Limitaciones y advertencias

- **Alucinación léxica en la variante 0.5B**: el propio autor documenta la aparición ocasional de palabras inventadas ("latejan", "instantly"); es una limitación de capacidad del modelo, no del entrenamiento.
- **Filtración de inglés en la variante 0.5B**: puede colar palabras en inglés pese a la especialización en español; la variante 1.5B lo reduce notablemente.
- **Ventana de contexto corta**: el entrenamiento usa `max_seq_length=512`, lo que limita la cantidad de plan y de historial conversacional que puede procesar con garantías.
- **No es un asistente general**: está especializado en narrativa interactiva con un formato de salida concreto; usarlo fuera de ese esquema degrada la calidad.
- **Dependencia del formato de entrada**: requiere un SYSTEM del cuento, un PLAN estructurado y un turno de usuario; sin esa estructura el comportamiento no está garantizado.
- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Qwen2.5 y de un dataset sintético generado por un maestro, puede heredar sesgos de ambos.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones heredadas de la base Qwen2.5.
- **Madurez del proyecto**: 67 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción a gran escala.
- **Recuento de parámetros**: el dato de 494.032.768 corresponde a la variante 0.5B; el de la variante 1.5B no está disponible en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/senda-of-kora/kora-senda-gguf
- Repositorio de los LoRA originales (referenciado en la model card): https://huggingface.co/senda-of-kora/kora-senda-0.5b-lora
- Modelo base 0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base 1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
