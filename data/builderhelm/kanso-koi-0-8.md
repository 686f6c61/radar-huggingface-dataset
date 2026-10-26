# BuilderHelm/Kanso-Koi-0.8

## Resumen

Kanso Koi 0.8 es un modelo de lenguaje de 1.720.574.976 parámetros (1,72 mil millones) especializado en el post-procesado de texto dictado. Lo desarrolla BuilderHelm AI (antes ZenVoice) y parte de Qwen3-1.7B, sobre el que se aplicó un ajuste fino con LoRA que después se fusionó y se cuantizó a 4 bits en formato MLX. Su función no es conversacional en sentido amplio: recibe la salida cruda de un motor de reconocimiento de voz —sin puntuación, sin mayúsculas, con muletillas y números escritos como se pronuncian— y devuelve el mismo contenido con puntuación, mayusculación, eliminación de fillers y normalización de fechas, horas, porcentajes y cifras.

El modelo resuelve un problema muy concreto en el pipeline de dictado: los motores ASR transcriben bien las palabras, pero rara vez reconstruyen la forma escrita. Kanso Koi 0.8 se ejecuta íntegramente en local sobre Apple Silicon mediante MLX, de modo que el audio y el texto no salen del equipo. Está pensado para integrarse detrás de Whisper u otro ASR, no como sustituto de este.

Es relevante ahora por dos motivos. Primero, porque los modelos de menos de 2.000 millones de parámetros cuantizados a 4 bits permiten post-procesado de dictado en tiempo real en un portátil sin GPU dedicada. Segundo, porque el autor lo ha declarado retirado: la model card indica que ZenVoice ya no ofrece esta versión y remite a Kanso-Koi-1.0 y Kanso-Satori-1.0, de modo que 0.8 debe considerarse una versión histórica para builds antiguos, no una elección para proyectos nuevos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajuste fino con LoRA fusionado y cuantizado |
| Parámetros totales | 1.720.574.976 (1,72 B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens heredados de la familia Qwen3-1.7B; no verificado en la model card para este ajuste |
| Tipos de cuantización | 4 bits en MLX (única variante publicada); no se distribuyen GGUF ni otras precisiones |
| Idiomas soportados | Inglés (la model card declara alcance «English-focused»); resto de idiomas no disponible |
| Licencia | Apache-2.0, heredada de Qwen3-1.7B |
| Formato de pesos | safetensors en formato MLX, 934 MB (repositorio de 1,0 GB) |
| Modelo base | mlx-community/Qwen3-1.7B-4bit (a su vez derivado de Qwen/Qwen3-1.7B) |
| Plantilla de prompt | ChatML con modo thinking desactivado |
| Estado | Retirado por el autor; sustituido por Kanso-Koi-1.0 y Kanso-Satori-1.0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Qwen3, en su variante de 1,7 B. Sobre ese modelo se aplicó un ajuste fino con LoRA orientado exclusivamente a la tarea de formateo de dictado; después los adaptadores se fusionaron en los pesos base y el conjunto se cuantizó a 4 bits en formato MLX. La model card es explícita en este punto: Qwen3 aporta el punto de partida y el comportamiento de formateo procede íntegramente del ajuste fino.

El entrenamiento se construyó con un pipeline propio documentado en el repositorio ZenVoice, bajo el directorio `training/`. Incluye un «noisifier» que degrada texto limpio hacia formas habladas (eliminación de puntuación, introducción de muletillas, conversión de cifras a palabras), constructores de pares sintéticos y de pares reales procedentes de ASR, conjuntos de evaluación congelados, entrenamiento LoRA con mlx-lm y un arnés de validación con umbrales de aceptación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación: la evaluación se realizó con decodificación greedy y el modo thinking desactivado.

## Capacidades

- Formateo de dictado: inserta puntuación y mayúsculas sobre texto ASR sin puntuar.
- Eliminación de muletillas y fillers del habla («um», «uh», repeticiones inmediatas).
- Normalización de números hablados a cifras en contextos comunes.
- Conversión de fechas, horas y porcentajes expresados oralmente a su forma escrita.
- Restauración de estructura de frase sin reescribir el significado y, según la model card, sin añadir contenido nuevo (con una tasa medida de contenido nuevo del 3,1 %).
- Ejecución totalmente local en Apple Silicon mediante MLX, sin llamadas de red.
- Integración como etapa posterior a un motor ASR dentro de un pipeline de dictado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; de hecho, el modo thinking debe desactivarse.
- Capacidades multimodales (visión, audio): no disponibles. El modelo solo procesa texto; el audio lo transcribe el ASR previo.
- Cobertura multilingüe: no disponible; el alcance declarado es inglés.

## Casos de uso

- Post-procesado de dictado en aplicaciones de macOS: se encadena el motor ASR (por ejemplo Whisper) con Kanso Koi 0.8 para que el texto aparezca ya puntuado y con mayúsculas en el campo de edición, con la ventaja de que todo el proceso ocurre en el equipo y no requiere conexión.
- Notas de reuniones y transcripciones largas: el modelo limpia cada segmento emitido por el ASR antes de consolidarlo en un documento, eliminando muletillas y reparando la puntuación de las intervenciones.
- Redacción de correos y mensajes por voz: el usuario dicta el cuerpo del mensaje y el modelo devuelve una versión presentable, con fechas y horas normalizadas del tipo «el martes a las tres» a «el martes a las 15:00», listo para revisión humana antes del envío.
- Entrada de datos en formularios y CRM mediante voz: la normalización de cifras y porcentajes permite convertir campos dictados en valores utilizables, siempre con validación posterior por el carácter crítico de estos datos.
- Accesibilidad: personas con movilidad reducida que dependen del dictado obtienen texto con formato correcto sin necesidad de editar manualmente la puntuación.
- Subtitulado y documentación interna: limpieza de transcripciones automáticas de vídeos o reuniones antes de su publicación en wikis internas, reduciendo el trabajo editorial de repaso.
- Pipelines por lotes offline: procesamiento de archivos de audio ya transcritos en un Mac, sin coste de API y sin enviar contenido confidencial a terceros.

## Benchmarks y rendimiento

Datos publicados por el autor sobre los conjuntos de evaluación congelados de ZenVoice, decodificación greedy y comparación contra Qwen3-1.7B-Instruct sin ajustar bajo el mismo prompt.

| Métrica | Kanso Koi 0.8 | Qwen3-1.7B base |
|---|---|---|
| WER (conjunto sintético de 300 filas) | 5,0 % | 10,1 % |
| Exact match | 20,3 % | 11,3 % |
| F1 de puntuación | 0,391 | 0,143 |
| Tasa de contenido nuevo (alucinación) | 3,1 % | 4,3 % |
| Precisión de mayúsculas | 94,2 % | 89,9 % |

| Métrica | Kanso Koi 0.8 | Qwen3-1.7B base |
|---|---|---|
| WER en entrada real limpia (120 filas) | 7,6 % | 11,0 % |
| Exact match en entrada real limpia | 7,5 % | 5,0 % |

El propio autor señala una anomalía relevante: el WER sobre entrada limpia (7,6 %) es peor que sobre entrada ruidosa de estilo ASR (5,0 %), brecha que atribuye a la mezcla de identidad introducida en la versión 3. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías de propósito general en la información disponible.

## Requisitos de hardware

- Pesos: 934 MB en safetensors MLX de 4 bits; el repositorio completo ocupa 1,0 GB.
- Memoria unificada estimada para inferencia: aproximadamente 1,2-1,6 GB considerando pesos, caché KV y sobrecarga del runtime de MLX.
- Cabe holgadamente en cualquier Mac con Apple Silicon y 8 GB de memoria unificada (M1 en adelante).
- GPU NVIDIA: no hay soporte nativo, ya que la librería declarada es MLX (metal). No se han publicado pesos GGUF ni un formato compatible con CUDA.
- Opciones de despliegue: mlx-lm y el stack MLX en macOS. vLLM, TGI, llama.cpp y Ollama no están soportados de forma oficial para estos pesos; requerirían conversión previa no publicada por el autor.
- Throughput y latencia: no disponibles en la información proporcionada. Por tamaño y tarea (frases cortas de dictado) el caso de uso previsto es interactivo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Kanso Koi 0.8 | 1,72 B (4 bits MLX) | 32 768 (heredado de Qwen3, no verificado) | Formateo de dictado en inglés | Apache-2.0 | Retirado |
| Kanso Koi 1.0 | No disponible | No disponible | Sucesor directo recomendado por el autor | No disponible | Activo |
| Kanso Satori 1.0 | No disponible (la serie Satori se asocia a la variante de 4 B) | No disponible | Formateo de dictado, gama superior | No disponible | Activo |
| Qwen3-1.7B-Instruct | 1,72 B | 32 768 | Modelo generalista conversacional | Apache-2.0 | Activo |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 | Modelo generalista conversacional | Apache-2.0 | Activo |

Frente a los modelos generalistas, la ventaja de Kanso Koi 0.8 no está en conocimiento ni en razonamiento, sino en la métrica de la tarea: 5,0 % de WER y 0,391 de F1 de puntuación frente a 10,1 % y 0,143 del Qwen3-1.7B sin ajustar en el conjunto sintético. Frente a sus sucesores, la model card no ofrece cifras comparativas, por lo que la comparación de rendimiento entre versiones no está disponible. No se conocen alternativas públicas especializadas en formateo de dictado con las que establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Modelo retirado: el autor ya no lo mantiene y recomienda migrar a Kanso-Koi-1.0 o Kanso-Satori-1.0. No cabe esperar correcciones ni actualizaciones.
- Sesgo idiomático: alcance declarado en inglés. El comportamiento con texto en castellano u otros idiomas no está evaluado y no debería asumirse.
- Alucinación: la tasa de contenido nuevo es del 3,1 %, es decir, aproximadamente una de cada treinta salidas introduce material que no estaba en la entrada. En dictado de datos críticos (importes, nombres, direcciones) esto exige revisión humana o comparación automática contra la transcripción original.
- Puntos débiles reconocidos por el autor: reescritura de correos electrónicos y URL, cantidades de dinero expresadas oralmente y reparación de homófonos.
- Rendimiento irregular según la entrada: el WER sobre texto limpio (7,6 %) es peor que sobre texto ruidoso (5,0 %), lo que puede afectar a integraciones donde el ASR ya entrega texto razonablemente formateado.
- Ámbito estricto: formatea y limpia, no reescribe el significado ni responde preguntas. Usarlo como modelo conversacional general produciría resultados pobres.
- Modo thinking desactivado por diseño: no debe activarse el razonamiento extendido de Qwen3, ya que el ajuste fino se hizo sin él.
- Dependencia de plataforma: los pesos son MLX y requieren Apple Silicon y macOS. No hay soporte oficial para CUDA ni para runtimes de servidor habituales.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar avisos de licencia; se hereda de Qwen3-1.7B y no se añaden restricciones conocidas en la model card.
- Ausencia de datos de entrenamiento: no se publican número de tokens, composición del dataset ni detalles de alineación, lo que dificulta auditar sesgos adquiridos en el ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Kanso-Koi-0.8
- Sucesor recomendado (Koi 1.0): https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Sucesor recomendado (Satori 1.0): https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base cuantizado en MLX: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Repositorio ZenVoice con el pipeline de entrenamiento (`training/common.py`, `training/evaluate.py`): citado en la model card, URL no disponible en la información proporcionada.
