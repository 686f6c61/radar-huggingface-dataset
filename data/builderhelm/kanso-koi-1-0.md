# BuilderHelm/Kanso-Koi-1.0

## Resumen

Kanso Koi 1.0 es un modelo de limpieza y formateo de texto dictado, desarrollado por BuilderHelm para su aplicación ZenVoice. No es un modelo de propósito general: es un ajuste fino mediante LoRA sobre `mlx-community/Qwen3-1.7B-4bit` especializado en tomar la salida cruda de un motor de reconocimiento automático del habla (ASR) y devolver texto escrito correctamente puntuado, capitalizado y normalizado. Resuelve un problema muy concreto: las transcripciones de voz a texto llegan sin puntuación, con muletillas, reinicios falsos y números en forma hablada ("dos mil quinientos dólares") que deben convertirse a forma escrita ("$2.500,50" en el formato de destino).

El modelo se distribuye como un paquete de dos piezas que deben aplicarse en vivo: una base cuantizada a 4 bits (968 MB) y un adaptador LoRA en bf16 (70 MB). El autor advierte explícitamente de que fusionar el adaptador en los pesos daña el comportamiento, especialmente la normalización inversa de moneda y la eliminación de muletillas. El conjunto suma unos 1.720 millones de parámetros y está pensado para ejecutarse íntegramente en local sobre Apple Silicon mediante MLX.

Su relevancia actual radica en el nicho: demuestra que un modelo de 1,7B con un adaptador pequeño puede superar en tareas de formateo a alternativas más grandes, con un consumo de memoria de 1,19 GB en pico y 73 tokens por segundo en un Apple M5. Es una pieza de infraestructura para productos de dictado, no un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre base cuantizada |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base 4-bit; adaptador en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); base 4-bit + adaptador LoRA en `adapters/` |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer decoder-only, cuantizado a 4 bits por `mlx-community`. Sobre ella se entrena un adaptador LoRA con rango 32, alpha 64 y escala 2.0, dropout 0.05, decaimiento coseno de 1e-4 a 1e-6 sin warmup, durante 3.500 iteraciones. El corpus de entrenamiento consta de unas 90.000 parejas procedentes de 10 fuentes, entre ellas pares de limpieza de dictado y ASR real, muletillas intraoracionales de DisfluencySpeech, entonación interrogativa de Hansard y datos de dominio financiero (el texto de la model card se corta en "earnin").

La innovación técnica no está en la arquitectura sino en el empaquetado: el adaptador se aplica en tiempo de inferencia mediante `LoRAContainer` de mlx-swift-lm, y el autor documenta que la fusión de pesos degrada mediblemente la calidad. La versión Lite sustituye la base de 6 bits de la versión original por la base 4-bit limpia sobre la que se entrenó el adaptador, con el adaptador en bf16 en lugar de fp32, lo que reduce el paquete un 32 % y acelera la decodificación cerca de un 40 %.

## Capacidades

- Limpieza de dictado: restaura puntuación y mayúsculas en texto ASR crudo.
- Eliminación de muletillas, tanto al inicio como a mitad de frase.
- Eliminación de reinicios falsos (repeticiones y arranques abortados).
- Normalización inversa de texto (ITN): números, moneda, fechas, horas, porcentajes, correos electrónicos, URL y teléfonos.
- Reparación gramatical que preserva el significado original.
- Adaptación de estilo y mayúsculas según una línea de contexto `app:` proporcionada en el prompt.
- Generación de texto conversacional básica heredada de la base Qwen3.
- Modo thinking desactivable (`enable_thinking=False`), necesario para el flujo de formateo.
- No dispone de tool calling, capacidades de agente, visión ni audio documentadas.

## Casos de uso

- Dictado en escritorio: integrado en ZenVoice para Mac, toma la salida del ASR y devuelve texto listo para pegar en un editor, con una latencia media de 0,23 s por dictado en el pipeline de la aplicación.
- Procesamiento por lotes de transcripciones: limpiar actas de reuniones o entrevistas ya transcritas, corrigiendo puntuación y normalizando cifras antes de archivarlas.
- Normalización financiera: convertir importes hablados a formato escrito ("dos mil quinientos dólares y cincuenta centavos" a "$2.500,50"), un caso que el autor señala como especialmente sensible a la fusión del adaptador.
- Corrección de notas clínicas o de campo: pasar dictados rápidos a texto legible preservando la terminología y el significado del hablante, sin reescritura.
- Entrada de datos en formularios por voz: extraer correos, URL, teléfonos y fechas en su forma escrita canónica para rellenar campos estructurados.
- Preprocesado para pipelines de NLP: dejar el texto en condiciones antes de pasarlo a un modelo mayor de resumen o análisis, reduciendo ruido y errores de formato.
- Aplicaciones de accesibilidad: dictado en local sin enviar audio ni transcripciones a la nube, con un pico de memoria de 1,19 GB.

## Benchmarks y rendimiento

Suite de 500 dictados (`eval_v500`, con control de fuga de datos), decodificación greedy, Apple M5, MLX 0.32.2:

| Metrica | Lite (este modelo) | v2.2 original |
|---|---|---|
| WER | 5,5 % | 6,7 % |
| Exact match | 65,8 % | 53,6 % |
| Punct F1 | 0,863 | 0,759 |
| Sentence-start | 94,4 % | 91,6 % |
| Tamano del paquete | 1,05 GB | 1,55 GB |
| Memoria pico | 1,19 GB | 1,77 GB |
| Velocidad de decodificacion | 73 tok/s | 51 tok/s |

Suite de 234 filas con control de fuga:

| Metrica | v2.2 | v3 (4B) | v2.1 | v2 | Qwen3-1.7B base |
|---|---|---|---|---|---|
| WER | 9,9 % | 17,2 % | 12,6 % | 30,5 % | 11,0 % |
| Exact match | 50,4 % | 41,0 % | 29,9 % | 23,1 % | 5,0 % |
| Punct F1 | 0,832 | 0,750 | 0,573 | 0,649 | 0,634 |
| Casing acc | 98,3 % | 95,6 % | 97,0 % | 92,4 % | 96,3 % |
| Sent-start | 90,9 % | 80,7 % | 86,2 % | 62,1 % | 74,9 % |
| Alucinacion | 0,0-7,2 % | 10,8 % | 7,2 % | 23,0 % | 0,9 % |

En el pipeline propio de la aplicación (mlx-swift-lm): WER 4,0 %, exact match 65,4 %, 0,23 s de media por dictado y 1,39 GB de memoria pico. La versión Lite con adaptador bf16 obtiene WER 9,7 %, exact match 50,4 % y Punct F1 0,831 en las mismas 234 filas.

## Requisitos de hardware

- VRAM/memoria unificada: 1,19 GB en pico con decodificación MLX; 1,39 GB en el pipeline de la aplicación.
- GPU recomendadas: Apple Silicon (el autor reporta mediciones en Apple M5); no hay soporte documentado para CUDA.
- Cabe holgadamente en cualquier Mac con Apple Silicon; no está pensado para GPU de consumo NVIDIA por su dependencia de MLX.
- Despliegue: `mlx-lm` en Python y `mlx-swift-lm` en la aplicación; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 73 tok/s de decodificación en M5; 0,23 s de media por dictado en el pipeline de la app.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanso Koi 1.0 (Lite) | 1,7B | no disponible | Formateo de dictado, MLX | Apache 2.0 | Hugging Face |
| Kanso Satori 1.0 | 4B (tier superior) | no disponible | Formateo de dictado | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-4bit base | 1,7B | no disponible | Generacion general | Apache 2.0 | Hugging Face |
| Kanso Koi 0.9 (v2.2) | 1,7B | no disponible | Formateo de dictado, base 6-bit | Apache 2.0 | Hugging Face |

Frente a la base Qwen3-1.7B sin ajustar, la diferencia es sustancial en la tarea objetivo: exact match del 50,4 % frente al 5,0 %, y Punct F1 de 0,832 frente a 0,634. Frente al tier de 4B (Satori), el modelo pequeño gana en esta tarea concreta (WER 9,9 % frente a 17,2 %), lo que sugiere que el ajuste específico pesa más que el tamano. No se dispone de comparaciones con modelos de limpieza de dictado de otros proveedores.

## Limitaciones y advertencias

- El adaptador no debe fusionarse en los pesos base: el autor documenta dano medible en la normalización de moneda y en la eliminación de muletillas.
- Dependencia exclusiva de MLX y Apple Silicon; no hay ruta de despliegue documentada para CUDA ni para runtimes estándar de servidor.
- Tasa de alucinación no nula: entre 0,0 % y 7,2 % según la suite, lo que exige revisión en contextos sensibles.
- Modelo de tarea única: no es adecuado como asistente general pese a heredar la base Qwen3.
- Idiomas soportados no documentados; el entrenamiento se apoya en fuentes en inglés (Hansard, DisfluencySpeech), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no especificada; no se recomienda para entradas largas sin validación previa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en dominios distintos del dictado.
- El texto de la model card está truncado en la sección de entrenamiento, por lo que la composición completa del corpus no es verificable.

## Enlaces

- Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Tier superior (4B): https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Version anterior (v2.2): https://huggingface.co/BuilderHelm/Kanso-Koi-0.9
- Perfil del autor: https://huggingface.co/BuilderHelm
- ZenVoice (producto): https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
