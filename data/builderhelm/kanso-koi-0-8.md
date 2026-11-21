# BuilderHelm/Kanso-Koi-0.8

## Resumen

Kanso Koi 0.8 es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) especializado en la mejora y el formateo de texto dictado. Lo desarrolla BuilderHelm AI (antes publicado bajo la cuenta `imYChaudhary22`) como componente on-device de ZenVoice, una aplicación de dictado para macOS. Su función no es conversacional generalista: recibe la salida cruda y sin puntuar de un motor de reconocimiento automático del habla (ASR) y le restaura puntuación, mayúsculas, eliminación de muletillas, y normalización de números, fechas y horas expresadas oralmente.

Técnicamente es un fine-tune por LoRA sobre Qwen3-1.7B, posteriormente fusionado y cuantizado a 4 bits en formato MLX safetensors. El repositorio ocupa 1,0 GB y el modelo corre íntegramente en Apple Silicon mediante MLX, sin enviar datos a la nube. La ventana de contexto heredada de Qwen3-1.7B no se documenta en la información disponible para este fine-tune.

Es relevante ahora como caso concreto de especialización de un modelo pequeño para una tarea estrecha con métricas propias de evaluación (WER, exact match, F1 de puntuación), y como ejemplo de despliegue local en hardware de consumo. El autor lo ha marcado como retirado y recomienda migrar a Kanso Koi 1.0 o Kanso Satori 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B), fine-tune LoRA fusionado y cuantizado a 4 bits |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no documentada para este fine-tune) |
| Tipos de cuantización | 4 bits (MLX) |
| Idiomas soportados | Inglés (enfoque principal; el autor indica que v3 ampliará cobertura de idiomas) |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | MLX safetensors (934 MB de pesos; 1,0 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-1.7B-4bit`, un transformer decoder-only denso de Qwen3 cuantizado a 4 bits para MLX. Sobre esa base se aplicó un fine-tune con LoRA usando `mlx-lm`, tras lo cual los adaptadores se fusionaron con los pesos base y el resultado se volvió a cuantizar a 4 bits. La arquitectura subyacente es, por tanto, la de Qwen3-1.7B; el comportamiento de formateo es enteramente atribuible al fine-tune.

El pipeline de entrenamiento, publicado en el repositorio ZenVoice bajo `training/`, incluye un «noisifier» que degrada texto limpio a forma oral (muletillas, ausencia de puntuación, números hablados), constructores de pares sintéticos y de pares reales procedentes de ASR, conjuntos de evaluación congelados y un arnés de control de calidad (gate harness). El autor no detalla el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible. La evaluación se realizó con decodificación greedy y el modo de razonamiento (thinking) desactivado, sobre un prompt de sistema ChatML cuya definición exacta está en `training/common.py` del repositorio ZenVoice.

## Capacidades

- Formateo de texto dictado: inserción de puntuación y restauración de mayúsculas.
- Eliminación de muletillas y repeticiones propias del habla espontánea.
- Normalización de números, fechas, horas y porcentajes expresados oralmente.
- Limpieza de texto sin reescritura de significado: el autor declara que el modelo no añade contenido ni altera la intención.
- Ejecución totalmente local en Apple Silicon mediante MLX.
- Interfaz de prompt tipo ChatML con razonamiento desactivado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada: el modelo está enfocado al inglés.

## Casos de uso

- Dictado en macOS con ZenVoice: el modelo recibe la transcripción cruda del ASR y devuelve texto puntuado y con mayúsculas antes de insertarlo en la aplicación activa; encaja porque corre on-device y no requiere conexión.
- Corrección de actas de reuniones transcritas: a partir de la salida de un motor ASR se obtiene un texto legible con puntuación y fechas normalizadas, adecuado para revisión posterior.
- Preprocesado de notas de voz para documentación técnica: convierte «um yeah so we need to fix this bug by tuesday» en «Yeah, so we need to fix this bug by Tuesday, right?», reduciendo el trabajo manual de edición.
- Normalización de entradas en pipelines de datos: limpiar transcripciones ASR de un corpus antes de indexarlas o analizarlas, aprovechando la tasa de contenido nuevo del 3,1 % medida por el autor.
- Subtitulado y transcripción de contenido en inglés: mejora de legibilidad de subtítulos generados automáticamente mediante puntuación y mayúsculas.
- Prototipado de asistentes de voz locales: sirve como etapa de postprocesado en una cadena ASR + LLM pequeña que debe ejecutarse sin salida a red en un Mac.
- Evaluación de técnicas de fine-tune eficiente: el repositorio documenta el pipeline completo (noisifier, pares sintéticos y reales, eval congelada), útil como referencia metodológica para tareas de normalización de texto.

## Benchmarks y rendimiento

Evaluación del autor sobre 300 filas sintéticas, decodificación greedy, frente a Qwen3-1.7B-Instruct con el mismo prompt:

| Métrica | Koi 0.8 | Base sin fine-tune |
|---|---|---|
| WER | 5,0 % | 10,1 % |
| Exact match | 20,3 % | 11,3 % |
| F1 de puntuación | 0,391 | 0,143 |
| Tasa de contenido nuevo (alucinación) | 3,1 % | 4,3 % |
| Precisión de mayúsculas | 94,2 % | 89,9 % |

Banco de entrada real limpia (120 filas):

| Métrica | Koi 0.8 | Base sin fine-tune |
|---|---|---|
| WER | 7,6 % | 11,0 % |
| Exact match | 7,5 % | 5,0 % |

El autor señala que el WER es peor sobre entrada limpia que sobre entrada ruidosa tipo ASR (7,6 % frente a 5,0 %) y que el entrenamiento con mezcla de identidad en v3 cierra esa brecha. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en 4 bits de 934 MB; el repositorio completo ocupa 1,0 GB.
- VRAM/unified memory estimada para inferencia: aproximadamente 1,2-1,5 GB incluyendo overhead de runtime MLX (estimación, no dato publicado).
- Diseñado para Apple Silicon; requiere el framework MLX, por lo que no es directamente desplegable en GPU NVIDIA sin conversión de formato.
- Cabe holgadamente en cualquier Mac con Apple Silicon (M1 en adelante) con 8 GB de memoria unificada o más.
- Opciones de despliegue: `mlx-lm` (librería declarada en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanso Koi 0.8 | 1,72 B (4 bits) | No disponible | Formateo de dictado en inglés, on-device MLX | Apache-2.0 | Retirado; sustituido por Koi 1.0 |
| Kanso Koi 1.0 | No disponible | No disponible | Sucesor recomendado por el autor | Apache-2.0 (según repositorio) | Activo en Hugging Face |
| Kanso Satori 1.0 | 4 B (según nomenclatura del autor) | No disponible | Variante mayor de formateo de dictado | Apache-2.0 (según repositorio) | Activo en Hugging Face |
| Qwen3-1.7B-Instruct (base) | 1,7 B | No disponible en la información | Modelo conversacional generalista | Apache-2.0 | Activo |

La comparación con modelos de propósito general de tamaño similar resulta poco informativa: Kanso Koi 0.8 está especializado en una tarea estrecha y sus métricas (WER, F1 de puntuación) no son trasladables a benchmarks generalistas. No se dispone de datos comparativos con otros modelos de formateo de dictado.

## Limitaciones y advertencias

- Modelo retirado: el autor recomienda usar Kanso Koi 1.0 o Kanso Satori 1.0 en su lugar; este repositorio se mantiene solo para builds anteriores.
- Enfoque en inglés; el resto de idiomas no está cubierto de forma fiable.
- Puntos débiles declarados: reescritura de correos electrónicos y URL, cantidades de dinero expresadas oralmente y reparación de homófonos.
- Riesgo de alucinación medido en un 3,1 % de contenido nuevo sobre el conjunto sintético; en producción conviene validar que el texto de salida no introduce información.
- Mayor WER sobre entrada limpia (7,6 %) que sobre entrada ruidosa tipo ASR (5,0 %), lo que desaconseja su uso como corrector de texto ya bien formateado.
- Dependencia de MLX y Apple Silicon: no es portable directamente a otros runtimes sin conversión de pesos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones y consideraciones de la base Qwen3-1.7B; conviene revisar el enlace de licencia del repositorio original.
- El prompt de sistema exacto es necesario para reproducir el comportamiento; está en `training/common.py` del repositorio ZenVoice y no se reproduce en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Koi-0.8
- Organización BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Sucesor recomendado Kanso Koi 1.0: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Sucesor recomendado Kanso Satori 1.0: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Licencia de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- ZenVoice, página principal: https://getzenvoice.com
- ZenVoice, descarga para Mac: https://getzenvoice.com/download
