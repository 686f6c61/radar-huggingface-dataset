# MagmaStudios/VERO-Mini-V3

## Resumen

VERO Mini V3 es un modelo de lenguaje conversacional de aproximadamente 1.540 millones de parámetros desarrollado por Magma Studios (Angelo Fontela). Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen2.5-1.5B-Instruct, orientado a construir un asistente independiente con identidad propia ("VERO") y comportamiento bilingüe castellano/inglés. El modelo resuelve el problema de disponer de un asistente ligero, desplegable en hardware modesto, con una personalidad y guías de comportamiento definidas, y con capacidades básicas de código, matemáticas y respuestas estructuradas.

La propuesta técnica es deliberadamente humilde: no introduce una arquitectura nueva, sino que reutiliza la arquitectura transformer decoder-only de Qwen2.5 y aplica un adaptador entrenado con un conjunto de instrucciones pequeño y curado (159 ejemplos de entrenamiento y 11 de validación). La versión V3 supone un salto respecto a V2, pasando de ~0,5B a ~1,54B parámetros y de un modelo base especializado en código a un modelo de instrucciones general.

Su relevancia actual radica en su licencia Apache 2.0, su reducido tamaño (repo de 3,1 GB en safetensors) y su compatibilidad con el ecosistema transformers y text-generation-inference, lo que lo hace adecuado para prototipos, entornos con recursos limitados y aplicaciones donde se requiere un asistente con identidad controlada y soporte nativo de castellano e inglés. No obstante, el propio autor advierte que la evaluación realizada es una suite de regresión de ingeniería de 20 prompts, no una validación de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el autor no lo declara para este fine-tune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo contiene pesos en safetensors (no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (en) y castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Qwen2.5-1.5B-Instruct, por lo que hereda su arquitectura de atención estándar (no se documentan innovaciones como atención lineal, SSM ni decodificación especulativa). El ajuste se realizó sobre un conjunto de instrucciones pequeño y curado centrado en la identidad VERO, el comportamiento bilingüe castellano/inglés, programación, matemáticas, seguridad, manejo de incertidumbre, salida estructurada y preguntas cotidianas. Según la model card, el adaptador se entrenó con pérdida enfocada en la respuesta (response-focused loss) sobre 159 ejemplos de entrenamiento y 11 de validación.

La mezcla de entrenamiento incluye ejemplos originales de Magma Studios, el dataset público `MagmaStudios/VERO-Mini-Training` y ejemplos de replay derivados de `bigcode/self-oss-instruct-sc2-exec-filter-50k`, tal como se documentó en la versión anterior de VERO. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. El release incluye una plantilla de chat por defecto con la identidad y las guías de comportamiento de VERO.

## Capacidades

- Generación de texto conversacional multi-turno en castellano e inglés.
- Razonamiento básico y respuestas a preguntas cotidianas.
- Generación de código (el modelo base es un modelo de instrucciones general; el autor menciona capacidades de coding y matemáticas básicas).
- Matemáticas elementales.
- Salida estructurada (JSON), aunque el autor advierte que puede envolver respuestas JSON-only en bloques Markdown, por lo que requiere validación y normalización por parte del llamador.
- Manejo de incertidumbre y respuestas de seguridad (el modelo fue entrenado para reconocer límites y no presentar certeza injustificada).
- Identidad y comportamiento definidos mediante plantilla de chat incluida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta explícitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional ligero en castellano: el modelo puede gestionar conversaciones multi-turno con identidad controlada y respuestas bilingües, adecuado para prototipos de atención al cliente o asistentes personales en entornos con recursos limitados.
- Generación de código en prototipos: puede producir fragmentos de Python y otras funciones básicas; útil para autocompletado o generación de snippets en herramientas de desarrollo, siempre con verificación humana antes de ejecutar.
- Respuestas estructuradas en pipelines: aunque requiere normalización, puede emplearse para generar JSON en tareas de extracción o clasificación simple, con validación posterior en el pipeline.
- Educación y soporte en matemáticas básicas: adecuado para resolver problemas elementales y explicar pasos, con la advertencia de verificar resultados.
- Despliegue en hardware de consumo: al ser un modelo de ~1,54B parámetros con pesos safetensors de 3,1 GB, puede ejecutarse en GPU de consumo para demos, pruebas internas y aplicaciones de baja latencia.
- Asistente bilingüe castellano/inglés: útil para aplicaciones que requieren alternancia de idioma en un mismo producto, como chatbots de soporte para usuarios hispanohablantes e ingleses.
- Base para fine-tunes posteriores: al estar bajo Apache 2.0 y con un tamaño manejable, sirve como punto de partida para adaptaciones específicas de dominio con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una evaluación cualitativa sobre una suite de regresión de 20 prompts retenidos, en la que el modelo manejó correctamente la identidad VERO, respuestas en castellano como `Tokio`, la salida exacta `listo`, el error de índice fuera de rango en Python en `items[len(items)]`, código básico, matemáticas, seguridad e incertidumbre. El autor aclara explícitamente que se trata de una suite de ingeniería pequeña y no de una afirmación de inteligencia general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de ~1,54B parámetros, en FP16 requeriría aproximadamente 3 GB de pesos más overhead de activaciones y KV cache, y en cuantizaciones de 8 bits o 4 bits podría reducirse sustancialmente, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en FP16, y en configuraciones menores con cuantización (no publicada).
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (`endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VERO Mini V3 | ~1,54B | No disponible | Apache 2.0 | Hugging Face (MagmaStudios) | Fine-tune de Qwen2.5-1.5B-Instruct con identidad VERO |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face (Qwen) | Modelo base; mayor contexto documentado y amplia validación comunitaria |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face (Qwen) | Alternativa más ligera, menor capacidad general |
| SmolLM2-1.7B-Instruct | ~1,7B | No disponible en esta ficha | Apache 2.0 | Hugging Face (HuggingFaceTB) | Alternativa de tamaño similar orientada a instrucciones |

La comparación con alternativas se basa en datos públicos de los modelos citados; para VERO Mini V3 no se dispone de benchmarks que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte que el modelo puede cometer errores factuales, de código, de idioma y de formato.
- Verificación de código: el código generado debe revisarse antes de su ejecución; no debe usarse como única base para decisiones críticas.
- Salida estructurada: puede envolver respuestas JSON-only en bloques Markdown, por lo que los llamadores que requieran JSON puro deben validar y normalizar la salida.
- Conocimiento desactualizado: no conoce información web en vivo salvo que la aplicación lo conecte a búsqueda o recuperación.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen2.5, hereda los sesgos del modelo base y de los datos de ajuste, que no se detallan.
- Limitaciones de contexto e idioma: solo se declaran inglés y castellano; la longitud de contexto no está documentada para este fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las atribuciones de las fuentes de entrenamiento (Magma Studios, `MagmaStudios/VERO-Mini-Training`, `bigcode/self-oss-instruct-sc2-exec-filter-50k` y Qwen2.5-1.5B-Instruct).
- Advertencia de producción: no debe usarse como única base para decisiones médicas, legales, financieras, de seguridad crítica u otras de alto impacto; nunca incluir claves de API privadas en prompts o código.
- Validación limitada: la evaluación se limita a 20 prompts de regresión, sin benchmarks públicos ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MagmaStudios/VERO-Mini-V3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento citado: https://huggingface.co/datasets/MagmaStudios/VERO-Mini-Training
- Dataset de replay citado: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
