# cagataydev/tin-4b

## Resumen

Tin 4B es un modelo de lenguaje de 4.539 millones de parámetros (4,54 mil millones), desarrollado por Çağatay Çalı (cagataydev), especializado en Tin, un lenguaje de programación tipado en el que los agentes y las herramientas forman parte de la propia sintaxis. Se trata de un ajuste fino (SFT) del modelo base cagataydev/loopl-4b, que a su vez deriva de Qwen3.5-4B, y está diseñado para escribir programas en Tin, corregirlos a partir de los errores del compilador y ejecutar bucles de verificación y corrección mediante las herramientas `tin_check` y `tin_run`.

El modelo se distribuye en formato bf16 para transformers y ajuste adicional, con una variante cuantizada a 4 bits (cagataydev/tin-4b-4bit) pensada para su despliegue en teléfonos y equipos Mac mediante mlx-lm. Su pipeline declarado es image-text-to-text, aunque la model card se centra exclusivamente en las capacidades de generación y corrección de código Tin y en el bucle de agente nativo.

Su relevancia actual radica en el enfoque vertical: en lugar de competir en capacidades generales, el modelo se optimiza para una tarea concreta (programación en Tin con verificación por compilador) y demuestra mejoras sustanciales frente a su base Qwen3.5 4B en pruebas evaluadas con el compilador real. La licencia es Apache-2.0 y los idiomas declarados son inglés y turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; tag qwen3_5) |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (build principal); variante 4-bit (tin-4b-4bit) para MLX |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); build 4-bit para mlx-lm |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre cagataydev/loopl-4b, que a su vez es un derivado de Qwen3.5-4B. La arquitectura subyacente es un transformer de la familia Qwen3.5, con 4,54 mil millones de parámetros totales en precisión bf16 y un tamaño de repositorio de 9,1 GB. No se especifica en la información disponible la longitud de contexto, la composición exacta del dataset de entrenamiento ni el número de tokens utilizados.

La innovación técnica destacable no reside en la arquitectura, sino en el entrenamiento orientado a una tarea y un lenguaje concretos: Tin, un lenguaje tipado donde agentes y herramientas son parte de la sintaxis. El modelo aprende a generar programas Tin, a interpretar los errores del compilador y a corregirlos, así como a operar un bucle de agente nativo con las herramientas `tin_check` y `tin_run`. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de programas en Tin, el lenguaje tipado con agentes y herramientas integrados en la sintaxis.
- Corrección de programas Tin a partir de los errores emitidos por el compilador real.
- Bucle de agente nativo con verificación y ejecución mediante las herramientas `tin_check` y `tin_run`.
- Tool calling / function calling orientado al ecosistema Tin.
- Razonamiento multi-paso para corregir errores apilados (varios bugs simultáneos en un mismo programa).
- Capacidades multilingües limitadas a inglés y turco según la model card.
- Pipeline declarado image-text-to-text, aunque la model card no detalla capacidades de visión más allá del tag.

## Casos de uso

- Generación de programas Tin en pipelines de desarrollo: el modelo escribe código Tin que compila y produce la salida esperada en aproximadamente el 68,3 % de los casos a la primera, lo que permite usarlo como generador inicial dentro de un flujo con compilador en el bucle.
- Corrección automática de errores de compilación: con un 97,2 % de acierto en la prueba "Fixes Tin", es adecuado para integrarse como paso de reparación tras un fallo de `tin check`, interpretando el error del compilador y proponiendo una versión corregida.
- Depuración de errores apilados: su puntuación de 93,9 en "Fixes stacked bugs" lo hace útil en escenarios donde un programa acumula varios errores y requiere correcciones encadenadas.
- Agentes autónomos en el ecosistema Tin: el bucle de agente nativo (65 % de éxito) permite construir agentes que escriben, verifican y ejecutan programas Tin de forma iterativa con las herramientas `tin_check` y `tin_run`.
- Despliegue en dispositivos: la variante de 4 bits (tin-4b-4bit) está pensada para teléfonos y Macs con mlx-lm, lo que habilita asistentes de programación Tin locales y sin conexión.
- Formación y prototipado con Tin: al conocer el lenguaje y su sintaxis tipada, el modelo puede servir para generar ejemplos, explorar la biblioteca estándar y ayudar a desarrolladores que se inician en Tin.
- Integración en herramientas de desarrollo: mediante el comando `tin model pull tin:4b`, cualquier agente del ecosistema Tin sin una línea `model:` explícita utiliza este modelo por defecto.

## Benchmarks y rendimiento

Resultados publicados en la model card, expresados como porcentaje de aprobado sobre un conjunto reservado y evaluados con el compilador real de Tin. "Writes Tin" significa que el programa compila y imprime exactamente la salida esperada al primer intento.

| Prueba | Tin 4B | Qwen3.5 4B |
|---|---:|---:|
| Dice que es Tin | 100 | 60,4 |
| Conocimiento de Tin | 76,1 | 39,4 |
| Escribe Tin | 68,3 | 3,5 |
| Corrige Tin | 97,2 | 80,4 |
| Corrige errores apilados | 93,9 | 37,8 |
| Bucle de agente · nativo | 65 | 15 |

Comparativa entre tamaños de la familia Tin:

| Tamaño | Escribe Tin | Corrige Tin | Bucle de agente | Build para teléfono |
|---|---:|---:|---:|---|
| 0.8B | 37,5 | 88,8 | 32,5 | tin-0.8b-4bit |
| 2B | 54,1 | 92,5 | 55 | tin-2b-v3-4bit |
| 4B | 68,3 | 97,2 | 65 | tin-4b-4bit |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para los pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 12-16 GB.
- VRAM estimada para la variante 4-bit: en torno a 2,5-3 GB para los pesos, más overhead; apta para GPUs de consumo y para MLX en Apple Silicon.
- GPU recomendadas: para bf16, A100, H100 o RTX 4090 (24 GB); para 4-bit, GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, especialmente la variante 4-bit; la bf16 requiere GPUs de gama alta con al menos 12-16 GB.
- Opciones de despliegue: transformers (build bf16), mlx-lm (build 4-bit para Macs y teléfonos) y el ecosistema Tin mediante `tin model pull tin:4b`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Tin 4B | 4,54 mil millones | No disponible | Apache-2.0 | Programación en Tin y agentes nativos | Hugging Face (bf16 y 4-bit) |
| Qwen3.5 4B (base) | ~4 mil millones | No disponible | Apache-2.0 (según la model card) | Modelo generalista | Hugging Face |
| loopl-4b (base directo) | No disponible | No disponible | No disponible | Base del ajuste fino | Hugging Face |
| Tin 2B | ~2 mil millones | No disponible | Apache-2.0 | Programación en Tin (menor tamaño) | Hugging Face (4-bit) |
| Tin 0.8B | ~0,8 mil millones | No disponible | Apache-2.0 | Programación en Tin (mínimo tamaño) | Hugging Face (4-bit) |

Frente a Qwen3.5 4B, Tin 4B mejora de forma notable en las tareas específicas de Tin (escribe Tin: 68,3 frente a 3,5; corrige errores apilados: 93,9 frente a 37,8), a costa de estar especializado en un único lenguaje. Las alternativas de la propia familia Tin permiten elegir el equilibrio entre tamaño y rendimiento: el 2B obtiene 54,1 en escritura y 55 en bucle de agente, y el 0.8B baja a 37,5 y 32,5 respectivamente.

## Limitaciones y advertencias

- Aproximadamente el 32 % de los primeros intentos fallan `tin check` o imprimen una salida incorrecta; es obligatorio ejecutar el compilador y no confiar en la salida sin verificar.
- El conocimiento de Tin corresponde al commit de entrenamiento; las funciones estándar más recientes pueden faltar o ser desconocidas.
- Al ser un modelo pequeño, detalles como nombres de flags y códigos de error suelen ser incorrectos.
- Idiomas limitados a inglés y turco según la model card; no se garantiza un rendimiento adecuado en castellano.
- No se dispone de información sobre sesgos, riesgo de alucinación en dominios ajenos a Tin ni sobre evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5 y del modelo intermedio loopl-4b.
- No se documentan la longitud de contexto ni el throughput, lo que dificulta planificar despliegues en producción con requisitos de concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cagataydev/tin-4b
- Variante 4-bit: https://huggingface.co/cagataydev/tin-4b-4bit
- Modelo base directo: https://huggingface.co/cagataydev/loopl-4b
- Variante 2B: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Variante 0.8B: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Sitio del lenguaje Tin: https://tin.ad
- Instalador de Tin: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
