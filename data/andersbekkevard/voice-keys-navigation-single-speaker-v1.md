# andersbekkevard/voice-keys-navigation-single-speaker-v1

## Resumen

Voice Keys Navigation Single Speaker v1 es un adaptador LoRA de reconocimiento de voz orientado a la navegación por teclado simbólico, desarrollado por el usuario independiente andersbekkevard. No es un modelo de reconocimiento de voz general, sino un adaptador entrenado sobre la voz de un único hablante que mapea fragmentos de audio a un vocabulario cerrado de 57 etiquetas de teclas (letras, dígitos, modificadores como `shift`, `command` o `control`, y teclas de control como `enter`, `tab` o `backspace`). El adaptador se monta sobre el encoder en streaming de NVIDIA Nemotron Speech Streaming English 0.6B, que no se redistribuye en este repositorio.

El modelo resuelve un problema muy acotado: permitir experimentos de control por voz de teclado simbólico en entornos offline y contenidos, con un CTC causal de cero lookahead. Su relevancia es limitada y de nicho: se trata de una vista previa para desarrolladores, no de un producto de accesibilidad validado, y el propio autor advierte que la precisión para otros hablantes no está medida. El repositorio solo contiene tensores aprendidos (matrices LoRA de rango 8 y alpha 16, más la cabeza CTC) y configuración genérica, sin código Python ni grabaciones.

La arquitectura subyacente es un encoder transformer en streaming de 1024 dimensiones y 24 bloques de atención, con un frontend de 128 bins mel a 16 kHz. El adaptador añade LoRA en las proyecciones q/v/o de todos los bloques y una cabeza CTC causal de 58 clases. El contexto, los parámetros totales del adaptador y los formatos de cuantización no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer en streaming (base NVIDIA Nemotron Speech Streaming English 0.6B) con adaptadores LoRA en proyecciones q/v/o y cabeza CTC causal |
| Parametros totales | no disponible (el adaptador LoRA es de rango 8 y alpha 16; el tamaño total de parámetros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (encoder en streaming con cero lookahead; no se especifica ventana de contexto) |
| Tipos de cuantizacion | no disponible (las mediciones reportadas usan float32 en CPU) |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License (no Apache-2.0) |
| Formato de pesos | safetensors (solo tensores aprendidos y configuración genérica) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el encoder en streaming de NVIDIA Nemotron Speech Streaming English 0.6B, de 1024 dimensiones y 24 bloques de atención. Sobre esa base se aplican matrices LoRA de rango 8 y alpha 16 en las proyecciones de query, value y output de los 24 bloques. La cabeza de salida es un CTC causal de 58 clases (57 etiquetas más blank en el índice 0), compuesta por LayerNorm, una Conv1d causal con kernel 3 y padding izquierdo hasta 256 canales, activación SiLU y un clasificador lineal. El frontend de audio trabaja a 16 kHz mono con 128 bins mel, FFT de 512 puntos, ventana de 400 muestras, hop de 160 muestras y preénfasis de 0.97. La inferencia usa cero lookahead en el encoder y decodificación CTC greedy; las clases repetidas se colapsan salvo que estén separadas por blank.

El entrenamiento se realizó sobre la voz de un único hablante, según indica la model card, sin que se detallen el número de tokens, la composición del dataset ni si hubo RLHF o DPO. No se incluyen grabaciones, manifiestos de entrenamiento, identidad de clips ni estado del optimizador en el repositorio. El adaptador fue convertido desde el checkpoint seleccionado a safetensors sin reentrenamiento ni modificación de los valores aprendidos. El manifiesto fija la revisión base `ebe59e5a817142986528bbbee5dba8db7b38ed50` y los hashes de los ficheros; el consumidor debe fijar el commit del repositorio y el hash del manifiesto en su aplicación.

## Capacidades

- Reconocimiento de teclas simbólicas: clasifica audio en 57 etiquetas de teclado (letras `a`–`z`, dígitos `zero`–`nine`, `comma`, `period`, `minus`, `plus`, `space`, `enter`, `return`, `tab`, `escape`, `backspace`, `delete`, `up`, `down`, `left`, `right`, `shift`, `control`, `command`, `option`, `function`, `super`).
- Decodificación CTC greedy en streaming con cero lookahead en el encoder.
- Procesamiento de audio a 16 kHz mono con frontend mel de 128 bins.
- Reconocimiento limitado al hablante de entrenamiento; la precisión para otros hablantes no está medida.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio generativo ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Experimentos offline de teclado simbólico por voz: el adaptador puede mapear comandos de voz a etiquetas de teclas en una aplicación de escritorio contenida, siempre que se empiece con una vista previa que no pueda enviar entrada y se mantenga un control manual de apagado inmediato.
- Navegación por teclado en prototipos de accesibilidad: útil para probar flujos de navegación con un único hablante y un vocabulario cerrado, sin presentarlo como producto de accesibilidad validado.
- Investigación sobre adaptadores LoRA en encoders de voz en streaming: sirve como ejemplo de integración de LoRA de rango 8 sobre un encoder CTC causal con cero lookahead.
- Evaluación de falsos positivos en habla negativa: el modelo permite medir la tasa de etiquetas espurias ante habla ordinaria, un dato relevante para diseñar puertas de seguridad en aplicaciones de control por voz.
- Pruebas de decodificación CTC greedy con vocabulario cerrado: útil para comparar el comportamiento de un CTC de 58 clases frente a sistemas de reconocimiento abierto en tareas de clasificación de comandos.
- Integración en pipelines de investigación con safetensors: el repositorio exige una arquitectura propia revisada y un cargador de safetensors, lo que lo hace adecuado para entornos donde no se debe cargar código suministrado por el modelo.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Precisión de tokens de tecla | 96,3 % | Hablante de entrenamiento, conjunto de comandos reservado: 41 clips, 82 teclas de referencia, 2 erróneas y 1 omitida; intervalo reportado 92,6–100 % |
| Falsos positivos en navegación sin comandos | 65 teclas falsas | 93 clips de navegación reservados sin comandos |
| Falsos positivos en dictado | 2.097 teclas falsas (699/hora) | Aproximadamente 3 horas de dictado de prueba del mismo hablante |
| Falsos positivos en habla noruega | 36 etiquetas primitivas en 248,82 segundos (4,15 minutos); 520,9 etiquetas por hora de habla | 20 clips públicos FLEURS nb_NO, CPU float32, adaptadores fusionados, streaming con caché de 16 frames mel, reset por clip, sin padding final, sin planificador de inactividad ni parser/emisor de host |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. Las cifras anteriores son medidas del autor sobre condiciones concretas y no constituyen una evaluación independiente entre hablantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; las mediciones reportadas se ejecutaron en CPU con float32 y adaptadores fusionados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio requiere una arquitectura propia revisada y un cargador de safetensors, y la base se obtiene de NVIDIA por separado.
- Latencia y throughput: no disponibles; solo se reporta la duración de la reproducción acotada (248,82 segundos para 20 clips FLEURS) sin métricas de latencia por frame.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voice Keys Navigation Single Speaker v1 (este modelo) | no disponible (LoRA rango 8 sobre encoder de 0.6B) | no disponible | Clasificación de teclas simbólicas por voz, un solo hablante | NVIDIA Open Model License | Hugging Face, solo tensores y configuración |
| NVIDIA Nemotron Speech Streaming English 0.6B | 0.6B | no disponible | Reconocimiento de voz en streaming en inglés | NVIDIA Open Model License | Hugging Face (base de este adaptador) |
| Alternativas de ASR abierto en inglés | no disponible | no disponible | Reconocimiento de voz general | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre la voz de un único hablante; la precisión para otros hablantes no está medida y no se ofrece enrolamiento corto ni adaptación automática al hablante.
- El modelo falla una puerta de cero etiquetas falsas en habla negativa: produjo 65 teclas falsas en 93 clips de navegación sin comandos y 2.097 teclas falsas en unas 3 horas de dictado del mismo hablante.
- En habla noruega corriente produjo 36 etiquetas primitivas en 4,15 minutos, lo que evidencia riesgo de activación con habla no inglesa y con voces no vistas.
- El habla ordinaria puede desencadenar etiquetas no deseadas, incluidos atajos de teclado; no debe usarse sin supervisión, para control de seguridad crítica ni en flujos destructivos sin salvaguardas del host.
- Ruido, micrófonos, acentos, idioma y voces diferentes no han sido evaluados sistemáticamente.
- La precisión reportada del 96,3 % es precisión de tokens, no fracción de enunciados completos correctos, y no es un resultado entre hablantes.
- Los tensores aprendidos conservan características del hablante de entrenamiento; su publicación no elimina riesgos de pertenencia o memorización.
- Licencia NVIDIA Open Model License, no Apache-2.0; sujeta a condiciones de guardrail, actualización de licencia y términos de Trustworthy AI de NVIDIA.
- No se incluye código Python ni pickles; cargar código suministrado por el modelo está prohibido y se requiere una arquitectura propia revisada y un cargador de safetensors.
- El consumidor debe fijar el commit del repositorio y el hash del manifiesto, no confiar en un manifiesto adyacente mutable.
- `super` es un modificador simbólico; la aplicación host define su combinación de teclas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andersbekkevard/voice-keys-navigation-single-speaker-v1
- Modelo base NVIDIA Nemotron Speech Streaming English 0.6B: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Términos NVIDIA Trustworthy AI: https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/
