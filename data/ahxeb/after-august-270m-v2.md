# ahxeb/after-august-270m-v2

## Resumen

after-august-270m-v2 es un ajuste fino completo de google/gemma-3-270m, publicado por ahxeb en formato GGUF. No es un modelo de propósito general: reproduce la voz literaria de after august, un sitio web que presenta la mente de una persona, y genera las frases que flotan alrededor de su retrato y los textos breves que se abren al hacer clic. Se distribuye como un único archivo q8_0 de unos 290 MB y está pensado para ejecutarse en el navegador mediante llama.cpp compilado a WebAssembly y la librería wllama.

El modelo conserva los 268.098.176 parámetros del Gemma 3 270M, se ha entrenado en minúsculas, con todos los nombres eliminados, y aprendió dos formatos de prompt: una lista de frases separadas por líneas tras `· ` y una frase tras `» ` seguida de una línea en blanco, tras la cual continúa hasta tres líneas. La mayor parte del entrenamiento proviene de poemas y relatos cortos del autor, completados con poemas breves escritos en su voz.

Su relevancia es acotada pero clara: demuestra cómo un modelo de 270M puede personalizarse hasta convertirse en un componente artístico local, sin servidor ni API, y ejecutarse en el navegador del visitante. Ahora bien, su temática incluye fe, familia, amor, abuso, autolesión y suicidio, y no se han publicado evaluaciones de seguridad, sesgo o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredado de Gemma 3 270M; sin detalles adicionales en la información disponible |
| Parámetros totales | 268.098.176 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF q8_0 (8 bits); no se indican otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (`after-august-270m-v2-q8_0.gguf`) |
| Modelo base | google/gemma-3-270m |
| Tamaño del repositorio | 0,3 GB |
| Tamaño del archivo principal | Aproximadamente 290 MB |
| Formatos de prompt aprendidos | Lista de frases tras `· `; continuación tras `» ` y línea en blanco |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M preentrenado y se ha sometido a un ajuste fino completo, no a un adaptador. El autor indica que el entrenamiento se hizo en minúsculas y eliminando todos los nombres, con un corpus compuesto principalmente por sus propios poemas y relatos cortos, más poemas breves adicionales escritos en su voz. No se especifican el número de tokens, la composición exacta del dataset, la mezcla de datos ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Tampoco se documentan innovaciones arquitectónicas propias. La aportación técnica está en el empaquetado y el despliegue: un GGUF q8_0 de unos 290 MB que puede cargarse con llama.cpp en WebAssembly a través de wllama, lo que permite inferencia local en el navegador. El modelo aprendió dos plantillas concretas: listas de frases tras `· ` y continuaciones de hasta tres líneas tras `» ` y una línea en blanco.

## Capacidades

- Generación de texto creativo breve en minúsculas, con un registro poético y narrativo personal.
- Generación de listas de frases, una por línea, usando el prefijo `· `.
- Continuación de una frase tras `» ` y una línea en blanco, con un máximo declarado de tres líneas.
- Escritura de fragmentos sobre fe, familia, amor, abuso, autolesión y suicidio; requiere moderación y revisión humana.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad para matemáticas, código, visión o audio.
- No se documenta capacidad multilingüe; la información de idiomas no está disponible.
- No es un modelo instructivo general: su comportamiento está especializado en dos formatos y un registro estilístico concreto.

## Casos de uso

- Instalación web artística: el modelo puede generar las frases que rodean el retrato de un visitante y los textos que se abren al hacer clic, ejecutándose localmente con wllama y llama.cpp en WebAssembly. Su tamaño de 290 MB en q8_0 permite cargarlo en el navegador sin enviar datos a un servidor.
- Poesía generativa e interactiva: sirve para producir variaciones breves en la voz del autor a partir de los dos formatos aprendidos. Es adecuado porque el estilo y la estructura están deliberadamente acotados, aunque requiere curación editorial.
- Prototipo de narrativa hipertextual: puede generar continuaciones de hasta tres líneas para fragmentos que el usuario selecciona. Su ventana de contexto no está documentada, por lo que conviene limitar cada interacción a textos cortos.
- Taller de escritura y edición estilística: permite explorar variantes de una frase o un micropoema en minúsculas y sin nombres propios. Es útil como generador de borradores, no como sustituto de la autoría humana, y exige revisión por los temas sensibles que aborda.
- Demostración educativa de inferencia en navegador: el archivo GGUF q8_0 y la integración con wllama permiten explicar cuantización, carga de pesos y generación local en un entorno web. Es un caso realista por el reducido tamaño del modelo y su licencia Gemma.
- Pruebas de integración de llama.cpp y wllama: el modelo sirve para validar dos plantillas de prompt, la decodificación en WebAssembly y el consumo de memoria en el navegador. No hay métricas publicadas de latencia o throughput, así que las pruebas deben medirse en el entorno concreto.
- Kiosco o exposición sin red: al caber en unos 290 MB, puede desplegarse en un equipo local o en un navegador sin conexión. Es adecuado para instalaciones artísticas con texto generado en tiempo real y supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones humanas del ajuste ni comparaciones métricas con el modelo base.

## Requisitos de hardware

- Pesos en q8_0: aproximadamente 290 MB; el repositorio completo ocupa 0,3 GB.
- VRAM estimada: no hay cifra publicada. Los pesos ocupan unos 290 MB y el consumo adicional depende del runtime, del contexto y de la implementación.
- GPU recomendadas: no se documentan. Por tamaño, el modelo es viable en CPU y en GPU consumer, pero no hay una lista de modelos probados.
- Cabe en GPU consumer: sí, por el tamaño de los pesos; no se han publicado pruebas concretas con tarjetas RTX, A100 o H100.
- Despliegue previsto: llama.cpp y wllama en WebAssembly para navegador. También puede cargarse en otros runtimes compatibles con GGUF, pero no se documentan Ollama, vLLM ni TGI para este archivo.
- Latencia y throughput: no disponibles. El rendimiento en navegador dependerá de la CPU, del soporte WebAssembly, de la longitud de contexto y de la implementación de wllama.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la información proporcionada. La comparación fiable se limita al modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| after-august-270m-v2 | 268.098.176 | no disponible | Gemma | GGUF q8_0 | HuggingFace |
| google/gemma-3-270m (base) | 270M (denominación comercial) | no disponible | Gemma | no disponible en la información | HuggingFace |
| Alternativas generales de ~300M | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros fine-tunes creativos pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo muy pequeño: puede producir texto incoherente, repetitivo o factualmente incorrecto. No dispone de benchmarks que permitan estimar su calidad fuera del estilo aprendido.
- Especialización estrecha: solo se documentan dos formatos de prompt. No es adecuado para instrucciones generales, tool calling, agentes, código, matemáticas o visión.
- Entrenamiento en minúsculas y con nombres eliminados: no cabe esperar un uso fiable de mayúsculas, nombres propios ni entidades concretas.
- Temática sensible: el corpus incluye abuso, autolesión y suicidio. No debe desplegarse sin moderación, avisos claros y revisión humana, especialmente con personas vulnerables.
- No se documentan evaluaciones de sesgo, alineación, seguridad ni memorización. Existe riesgo de que el modelo reproduzca fragmentos del corpus personal con el que fue ajustado.
- Idiomas no disponibles: no se puede confirmar el soporte multilingüe ni el comportamiento fuera del registro entrenado.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use y a la política de usos prohibidos. Antes de un despliegue comercial debe revisarse la licencia y sus restricciones.
- Inferencia en navegador: el rendimiento depende de WebAssembly y de la CPU del visitante. No hay datos publicados de latencia, consumo de memoria máximo ni comportamiento con contextos largos.
- Ausencia de benchmarks: no se puede comparar objetivamente con Gemma 3 270M ni con otros modelos de tamaño similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahxeb/after-august-270m-v2
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama: https://github.com/ngxson/wllama
