# ayushpatnaik/S1-mini-FreeFlow-cleanup-MLX-6bit

## Resumen

S1-mini FreeFlow Cleanup (MLX, 6-bit) es un ajuste fino del modelo S1-mini de Superwhisper, que a su vez se basa en Qwen3-0.6B. Lo desarrolla ayushpatnaik como componente del backend local freeflow-local para la aplicación de dictado FreeFlow en Apple Silicon. Su función es muy concreta: tomar transcripciones crudas de voz a texto y devolver el texto que el hablante pretendía escribir, eliminando muletillas, tartamudeos y arranques abandonados, aplicando autocorrecciones habladas, corrigiendo puntuación, mayúsculas y errores de reconocimiento, y respetando el resto del contenido tal cual se dijo.

El modelo tiene 596 millones de parámetros, una ventana de contexto heredada de Qwen3-0.6B (no especificada en la información disponible) y se distribuye en formato MLX cuantizado a 6 bits con grupo de 64, ocupando 473 MB. Se entrenó con un LoRA de rango 8 mediante `mlx_lm`, fusionado en el modelo base y posteriormente cuantizado.

Su relevancia radica en que resuelve un problema práctico del dictado local: la limpieza de transcripciones con latencia muy baja (188 ms de mediana en un Mac con Apple Silicon) y sin dependencia de servicios en la nube. Está pensado exclusivamente para inglés y para un formato de prompt fijo, por lo que no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B, base S1-mini de Superwhisper) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (publicado); bf16 y 4 bits evaluados internamente |
| Idiomas soportados | inglés (principal); algo de hinglish, francés, español y alemán en entrenamiento, con poca evaluación |
| Licencia | s1-mini-license (Apache 2.0 más cláusula de atribución de nombre: debe identificarse como "S1-mini" de "Superwhisper") |
| Formato de pesos | safetensors (MLX) |
| Libreria | mlx |
| Tamano del repo | 0.5 GB (473 MB de pesos) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 0,6B parámetros (Qwen3-0.6B como base, a través de S1-mini de Superwhisper). Sobre esa base se aplicó un ajuste fino con LoRA de rango 8 usando `mlx_lm`, que después se fusionó en los pesos del modelo base y se cuantizó a 6 bits con tamaño de grupo 64. No se documentan innovaciones arquitectónicas propias: el interés está en el ajuste de comportamiento y en el formato de prompt.

El entrenamiento usó aproximadamente 5.100 ejemplos, todos sintéticos o públicos, sin dictado real de usuarios. La composición incluye pares de limpieza del dataset público WhisperNow cleanup (solo filas con licencia MIT del split de entrenamiento), generadores programáticos de muletillas, tartamudeos, autocorrecciones (incluidas correcciones tardías en dictados largos), puntuación dictada y sintaxis de desarrollador, formato de correo electrónico e instrucciones que no deben ejecutarse. También se generaron errores de reconocimiento sintéticos pronunciando frases con voces de macOS y transcribiéndolas con Orukeet (un fine-tune de NVIDIA Parakeet TDT 0.6B v3) para construir casos de corrección con vocabulario y palabras en pantalla, incluyendo trampas. Se añadieron frases inacabadas que deben permanecer inacabadas, palabras numéricas con términos en pantalla ("eighth bit" → "8-bit") y frases con "actually" que no son correcciones, además de respuestas de resumen de contexto a partir de plantillas. No se menciona RLHF ni DPO.

## Capacidades

- Limpieza de transcripciones de dictado: eliminación de muletillas, tartamudeos, palabras repetidas y arranques abandonados.
- Aplicación de autocorrecciones habladas, conservando solo la versión final y descartando la señal de corrección ("Thursday, no actually Wednesday" → "Wednesday").
- Corrección de puntuación, mayúsculas y errores evidentes de reconocimiento de voz.
- Conversión de puntuación dictada ("comma", "period") y sintaxis de desarrollador ("dash dash fix" → "--fix", "user underscore id" → "user_id").
- Corrección de nombres y términos según un bloque VOCABULARY, CONTEXT o SCREEN_WORDS, sin añadir palabras no pronunciadas.
- Tratamiento del texto como dato, no como instrucción: no responde preguntas ni ejecuta órdenes contenidas en la transcripción.
- Formato de correo electrónico: saludo en línea propia y cierre en párrafo separado cuando el hablante los dicta.
- Preservación del idioma de la transcripción y del texto mixto.
- Modo thinking desactivado (`enable_thinking=False`) y decodificación greedy recomendada.
- No soporta tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Dictado local en macOS: integración como modelo de limpieza en la aplicación FreeFlow sobre Apple Silicon, convirtiendo transcripciones crudas en texto listo para insertar en cualquier campo de texto con una latencia mediana de 188 ms.
- Corrección de nombres propios y jerga técnica: uso del bloque VOCABULARY para que términos como nombres de personas, productos o APIs se escriban con la grafía correcta cuando el reconocedor los confunde.
- Dictado de comandos y código: conversión de sintaxis hablada a sintaxis real ("user underscore id" → "user_id") para escribir flags, identificadores y rutas en terminales o editores.
- Redacción de correos por voz: el modelo aplica el diseño de saludo y cierre en párrafos separados, adecuado para respuestas rápidas dictadas desde el móvil o el portátil.
- Sustitución de servicios de limpieza en la nube: al ejecutarse en local con 473 MB, permite procesar dictados con contenido sensible sin enviar audio ni transcripciones a terceros.
- Preprocesado en pipelines de subtitulado o notas de reunión: limpieza de transcripciones automáticas antes de almacenarlas o indexarlas, eliminando muletillas y aplicando autocorrecciones para mejorar la legibilidad del texto final.
- Pruebas de integración en herramientas de accesibilidad: entrada por voz para usuarios con movilidad reducida, donde la supresión de tartamudeos y repeticiones reduce el esfuerzo de corrección manual.

## Benchmarks y rendimiento

Evaluación del autor sobre suites sintéticas pequeñas escritas por separado de los datos de entrenamiento, más 120 filas del split de test público de WhisperNow. El autor indica que diferencias de uno o dos casos están dentro del ruido.

| Modelo | Casos (79) | Palabras en pantalla (17) | Frases inacabadas / números / "actually" (20) | Palabras perdidas, muestra pública | Latencia mediana |
|---|---|---|---|---|---|
| S1-mini base, mismo prompt | 62 | 9 | n/a | 2,57 % | 331 ms |
| Gemma 4 E4B, prompt completo de FreeFlow | 66 | 13 | n/a | 2,99 % | ~900 ms |
| Este modelo (6 bits) | 73 | 12 | 20 | 2,92 % | 188 ms |
| Este modelo, bf16 sin cuantizar | 73 | 13 | 20 | 3,86 % | 433 ms |
| Este modelo, 4 bits (grupo 64) | 69 | 14 | 20 | 3,41 % | 155 ms |

La latencia se midió con el servidor de `mlx_lm` en un Mac con Apple Silicon, con un arnés de pruebas sin caché de prompt. El autor señala que la versión de 4 bits falla en nombres largos poco frecuentes y ocasionalmente omite cláusulas, por lo que no la publica.

## Requisitos de hardware

- VRAM o memoria unificada: 473 MB de pesos en 6 bits; en la práctica, menos de 1 GB de memoria unificada para inferencia.
- Plataforma: exclusivamente Apple Silicon (formato MLX); no se distribuyen pesos GGUF ni safetensors estándar para GPU NVIDIA.
- GPU recomendadas: cualquier chip Apple Silicon (series M1, M2, M3, M4); no aplica a A100, H100 ni RTX 4090 por el formato de pesos.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Despliegue: `mlx_lm` (carga y generación, o servidor `mlx_lm server`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 188 ms de mediana por petición en 6 bits, 155 ms en 4 bits y 433 ms en bf16, medidos en un Mac con Apple Silicon con el arnés del autor sin caché de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en la tarea |
|---|---|---|---|---|---|
| S1-mini FreeFlow Cleanup (6 bits) | 596 M | no disponible | s1-mini-license (Apache 2.0 + atribución) | MLX safetensors | 73/79 casos; 188 ms de mediana |
| S1-mini base (Superwhisper) | no disponible | no disponible | s1-mini-license | no disponible | 62/79 casos con el mismo prompt; 331 ms |
| Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | 66/79 casos con el prompt completo de FreeFlow; ~900 ms |

No se dispone de datos de otros modelos de limpieza de dictado comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo centrado en inglés: contiene algo de hinglish, francés, español y alemán en el entrenamiento, pero con poca evaluación; no debe esperarse calidad fiable fuera del inglés.
- En dictados largos (más de 100 palabras) puede perder una frase junto a una corrección del tipo "Actually, ..."; el autor reporta 1 de cada 5 pruebas largas fallida.
- Es un modelo de 0,6B que sigue un formato fijo: no acepta instrucciones personalizadas, no hace modo edición ni traduce.
- Las sugerencias de vocabulario son menos fiables al inicio de frase y con términos escritos íntegramente en minúsculas.
- Riesgo de alucinación bajo por diseño (el prompt prohíbe añadir palabras no pronunciadas), pero el ajuste no elimina el riesgo de inserciones o correcciones erróneas en nombres poco frecuentes, especialmente en cuantización de 4 bits.
- Requiere el formato exacto de system prompt y mensaje de usuario de FreeFlow; otros prompts funcionan mucho peor.
- Licencia con cláusula de atribución: cualquier uso o distribución debe seguir identificando el modelo como "S1-mini" de "Superwhisper". Los datos de entrenamiento incluyen filas con licencia MIT del dataset WhisperNow cleanup.
- Solo se distribuyen pesos MLX para Apple Silicon; no hay artefactos para despliegue en GPU NVIDIA ni en CPU genérica.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayushpatnaik/S1-mini-FreeFlow-cleanup-MLX-6bit
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Repositorio freeflow-local: https://github.com/ayushpatnaikgit/freeflow-local
- Aplicación FreeFlow: https://github.com/zachlatta/freeflow
- Dataset WhisperNow cleanup: https://huggingface.co/datasets/category271/whispernow-cleanup
- Licencia del modelo (archivo LICENSE en el repositorio de Hugging Face): https://huggingface.co/ayushpatnaik/S1-mini-FreeFlow-cleanup-MLX-6bit/blob/main/LICENSE
