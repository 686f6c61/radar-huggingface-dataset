# BuilderHelm/Kanso-Satori-0.9

## Resumen

Kanso Satori 0.9 es un modelo de 4.022 millones de parámetros especializado en el formateo y la limpieza de texto dictado. Lo desarrolla BuilderHelm AI (antes publicado bajo la cuenta `imYChaudhary22`) como componente del motor de dictado on-device ZenVoice. El modelo parte de Qwen3-4B-Instruct-2507, sobre el que se aplica un ajuste fino con LoRA de rango 16 que después se fusiona y cuantiza a 4 bits en formato MLX. Su función es recibir la salida cruda de un motor de reconocimiento de voz (sin puntuación, sin mayúsculas, con muletillas y números hablados) y devolver texto limpio y legible.

El modelo resuelve un problema muy concreto: la brecha entre la transcripción literal de ASR y un texto utilizable. Restaura puntuación, mayúsculas, elimina muletillas y reinicios de frase, y normaliza números, fechas, horas y porcentajes expresados oralmente. La inferencia se ejecuta íntegramente en Apple Silicon mediante MLX, sin envío de datos a la nube, lo que lo hace adecuado para aplicaciones de dictado con requisitos de privacidad.

Es relevante por dos motivos. Primero, demuestra que un ajuste fino pequeño y orientado a una tarea estrecha puede superar de forma clara a su modelo base en esa tarea: reduce la tasa de error de palabra (WER) del 24,4 % de Qwen3-4B de serie al 17,2 %. Segundo, su carta de modelo documenta el pipeline de entrenamiento y una evaluación controlada contra fugas de datos. No obstante, el autor ha marcado el modelo como retirado y recomienda las versiones 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA rango 16 fusionado y cuantizado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507; el autor no la documenta) |
| Tipos de cuantizacion | 4 bits (MLX); el repositorio solo distribuye pesos de 4 bits |
| Idiomas soportados | inglés (enfoque declarado "English-focused"); otros idiomas no disponibles |
| Licencia | Apache-2.0 (heredada de Qwen3-4B) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), 2,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4B parámetros procedente de Qwen3-4B-Instruct-2507. El ajuste fino se realizó con LoRA de rango 16 sobre aproximadamente 25.000 pares de entrenamiento, usando `mlx-lm` como framework. Posteriormente, los adaptadores se fusionaron en los pesos base y el resultado se cuantizó a 4 bits en formato MLX. El prompt de inferencia sigue el formato ChatML con el modo de razonamiento (thinking) desactivado.

El pipeline de datos, documentado en el repositorio ZenVoice bajo `training/`, incluye la construcción de pares maestro-alumno (`build_pairs_v31.py`) con una rama específica de intensidad de muletillas y reinicios, casos difíciles de normalización de texto inverso (ITN), un noisificador de entrada, generadores de pares sintéticos y de ASR real, y conjuntos de evaluación congelados. El entrenamiento se protegió con una puerta de no regresión de WER. La evaluación se realizó sobre un conjunto de 234 filas con control de fugas: siete categorías de habla, exclusión de filas presentes en cualquier mezcla de entrenamiento y valores ITN disjuntos de las plantillas de entrenamiento, con decodificación greedy.

## Capacidades

- Formateo de texto dictado: inserción de puntuación y mayúsculas coherente con el contenido.
- Eliminación de muletillas ("um", "uh") y reinicios de frase en habla espontánea.
- Normalización de texto inverso (ITN): números hablados, fechas, horas, cantidades de dinero y porcentajes.
- Detección de inicio de oración y capitalización tras puntuación.
- Generación de texto conversacional básica, heredada del modelo base Qwen3-4B (el ajuste se centra en formateo).
- Ejecución on-device en Apple Silicon mediante MLX, sin llamadas de red.
- No soporta visión, audio nativo, tool calling ni agentes multi-paso de forma documentada; el autor no declara estas capacidades.
- Restricción de alcance explícita: nunca reescribe el significado ni añade contenido nuevo.

## Casos de uso

- Dictado en aplicaciones de escritorio para macOS: integrado en ZenVoice, el modelo transforma la salida cruda del ASR en texto con puntuación y mayúsculas antes de insertarlo en el campo de texto activo. La inferencia local en MLX evita enviar audio o transcripciones a servidores externos.
- Notas de reuniones y actas: convierte transcripciones con muletillas y frases cortadas en texto legible, incluyendo la normalización de fechas y horas mencionadas oralmente ("el martes a las tres y media" → "el martes a las 3:30").
- Redacción de correos por voz: elimina reinicios de frase y reformula la puntuación de dictados largos, lo que reduce la corrección manual posterior.
- Procesamiento por lotes de transcripciones ASR existentes: al ser un modelo de texto puro, puede aplicarse sobre ficheros de transcripción ya generados por cualquier motor ASR, no solo sobre audio en directo.
- Entrada de datos en formularios con cifras: la normalización de cantidades de dinero, porcentajes y fechas resulta útil en contextos de introducción de datos por voz (por ejemplo, gastos o partes de trabajo).
- Base para ajustes específicos de dominio: al ser Apache-2.0 y de tamaño reducido, un equipo puede hacer un LoRA adicional sobre vocabulario técnico propio (jerga médica, legal o de ingeniería) manteniendo el comportamiento de formateo.
- Evaluación comparativa de pipelines ASR: sirve como referencia de postprocesado para medir cuánto mejora el WER final de un motor de reconocimiento concreto.

## Benchmarks y rendimiento

Evaluación sobre el conjunto controlado de 234 filas de ZenVoice (`training/evaluate_v31.py` sobre `training/data/eval_v31.jsonl`), decodificación greedy:

| Métrica | Satori 0.9 (4B) | Koi 0.8 (1.7B) | Qwen3-4B de serie | Suelo de entrada cruda |
|---|---|---|---|---|
| WER | 17,2 % | 30,5 % | 24,4 % | 40,4 % |
| Coincidencia exacta | 41,0 % | 23,1 % | 33,3 % | 0,0 % |
| F1 de puntuación | 0,750 | 0,649 | 0,745 | 0,000 |
| Tasa de contenido nuevo (alucinación) | 10,8 % | 23,0 % | 17,1 % | 32,5 % |
| Precisión de mayúsculas | 95,6 % | 92,4 % | 95,4 % | 76,5 % |
| Precisión de inicio de oración | 80,7 % | 62,1 % | 73,9 % | 0,9 % |

WER por categoría destacado (v3 frente a v2): números, fechas y dinero (ITN) 13,8 % frente a 37,3 %; habla con muletillas y reinicios intensos 31,8 % frente a 78,6 %; habla continua sin pausas 14,4 % frente a 14,6 %; preguntas 4,9 % frente a 0,6 %.

## Requisitos de hardware

- VRAM/unificada estimada: los pesos ocupan 2,1 GB en 4 bits; con overhead de contexto y KV cache, el consumo en memoria unificada se sitúa en torno a 3-4 GB para contextos moderados (estimación, no publicada por el autor).
- GPU recomendadas: Apple Silicon exclusivamente, dado que la librería es MLX. Funciona en chips M1 en adelante; no hay soporte documentado para CUDA ni ROCm en este repositorio.
- Cabe en cualquier Mac con 8 GB de memoria unificada o más; el modelo está pensado para ejecución local en portátiles.
- Opciones de despliegue: `mlx-lm` (librería declarada) y el runtime de ZenVoice. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual no soportada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en eval ZenVoice | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanso Satori 0.9 | 4B (4 bits MLX) | no disponible | 17,2 % | Apache-2.0 | Retirado; sustituido por Satori 1.0 |
| Kanso Koi 0.8 | 1,7B | no disponible | 30,5 % | Apache-2.0 | Disponible |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | 24,4 % | Apache-2.0 | Disponible |
| Kanso Satori 1.0 | 4B | no disponible | no disponible | Apache-2.0 | Disponible; recomendado por el autor |

La comparación con alternativas externas al ecosistema ZenVoice (por ejemplo, modelos genéricos de postprocesado de ASR) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo retirado: el autor recomienda migrar a Kanso-Koi-1.0 o Kanso-Satori-1.0; este repositorio se mantiene solo para builds anteriores.
- Enfoque en inglés: el autor declara alcance "English-focused" y no documenta comportamiento en castellano ni en otros idiomas.
- Tasa de alucinación del 10,8 %: en aproximadamente una de cada diez salidas el modelo introduce contenido que no estaba en la entrada, lo que exige revisión humana en contextos sensibles.
- Sobre-limpieza en fragmentos muy cortos: con entradas de 1 a 5 palabras el modelo tiende a eliminar demasiado.
- La eliminación de muletillas en habla muy densa mejora respecto a versiones previas pero no está resuelta (WER del 31,8 % en esa categoría).
- Solo distribución en MLX de 4 bits: no hay pesos en precisión completa ni GGUF, lo que limita el despliegue fuera de Apple Silicon.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3-4B; conviene revisar los términos del modelo base.
- La longitud de contexto efectiva no está documentada por el autor, por lo que no debe asumirse la del modelo base sin verificación.
- Sin datos publicados de sesgos; al derivar de Qwen3, puede heredar los sesgos de su corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-0.9
- Organización BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Modelo sucesor Kanso-Satori-1.0: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo alternativo Kanso-Koi-1.0: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Versión MLX del modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Licencia Apache-2.0 del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Página de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
