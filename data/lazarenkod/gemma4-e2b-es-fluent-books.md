# lazarenkod/gemma4-e2b-es-fluent-books

## Resumen

Gemma 4 E2B Español for Fluent Books (ES3b) es un ajuste fino del modelo `google/gemma-4-E2B-it` de Google, desarrollado por el usuario `lazarenkod` para la aplicación de lectura Fluent Books. Su única función es traducir frases de novelas en español al ruso en el dispositivo, con un enfoque explícito en expresiones fijas, refranes, colocaciones y nombres propios. No es un modelo conversacional ni un traductor general: responde a un prompt fijo de traducción literaria.

El modelo parte del Gemma 4 E2B instruction-tuned, al que se le recortó el vocabulario a 48.000 tokens para español y ruso, y se le aplicó un ajuste LoRA en dos fases (ES2 y ES3b) sobre frases de novelas de dominio público traducidas por agentes de mayor tamaño (Claude y Gemma). Se distribuye únicamente como GGUF Q5_K_M (1.760.370.208 bytes) para llama.cpp, pensado para dispositivos con 6 GB de memoria o más.

Su relevancia radica en la especialización extrema: frente a traductores genéricos, mide su rendimiento en conjuntos propios de expresiones fijas y refranes, y declara explícitamente sus límites (refranes, jerga, frases muy largas). Es un ejemplo de modelo de bolsillo orientado a una tarea concreta de producto, no a uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), ajuste LoRA fusionado; no se detalla la arquitectura interna |
| Parámetros totales | no disponible (modelo base E2B; el autor no publica el recuento) |
| Parámetros activos | no disponible (no se indica si el base es MoE) |
| Longitud de contexto | 2.048 tokens (contexto usado en las mediciones del autor) |
| Tipos de cuantización | Q5_K_M (única publicada en este repositorio) |
| Idiomas soportados | español (entrada) y ruso (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye en cuatro pasos según la model card: (1) se parte de `google/gemma-4-E2B-it` y se recorta el vocabulario de 262.144 a 48.000 tokens para español y ruso; (2) se aplica un ajuste LoRA sobre 38.336 filas (frases de novelas españolas de dominio público traducidas por agentes de Gemma y Claude, con filas revisadas de trampas, expresiones fijas, colocaciones y nombres), dando la versión ES2; (3) ES2 se entrena una época más sobre 15.157 filas (1.657 filas juzgadas con expresiones fijas, 1.500 filas que indican si una expresión se usa en una frase y 12.000 filas de los datos anteriores), dando ES3b, este modelo; (4) se fusiona y se cuantiza a Q5_K_M.

Los datos de entrenamiento combinan frases de novelas de Project Gutenberg traducidas por agentes, Wiktionary y Wikipedia (CC BY-SA) como fuente de frases, formas y frecuencias, y listas de frases y etiquetas de diccionarios de aprendizaje y fraseológicos con licencia propiedad de los autores (cuyo texto no se distribuye). El autor declara que ninguna frase de los conjuntos de evaluación se usó en entrenamiento. No se mencionan RLHF ni DPO; el ajuste es supervisado vía LoRA.

## Capacidades

- Traducción literaria español→ruso de frases sueltas de novela, con instrucción fija de sistema y usuario.
- Manejo específico de expresiones fijas, refranes, colocaciones y nombres propios (objetivo declarado del ajuste).
- Ejecución en dispositivo (on-device) mediante llama.cpp, sin necesidad de servidor.
- No es un modelo de chat: no mantiene conversación ni responde preguntas generales.
- No elige el significado de una palabra ni lo explica; solo traduce la frase.
- No soporta tool calling, agentes ni razonamiento multi-paso (no declarado).
- Idiomas: únicamente el par es→ru.

## Casos de uso

- Traducción de frases de novelas en la app Fluent Books: el modelo recibe una frase española y devuelve solo la traducción rusa, integrándose en el flujo de lectura en dispositivo con 2.048 tokens de contexto.
- Lectura asistida sin conexión: al ejecutarse en llama.cpp sobre CPU con unos 2,2 GB de memoria, permite traducir en dispositivos de 6 GB o más sin depender de la nube.
- Procesamiento por lotes de capítulos: al ser determinista con decodificación greedy, se puede usar para pretraducir frases de un libro antes de la revisión humana.
- Evaluación de calidad de traducción literaria: sirve como referencia especializada en expresiones fijas y refranes frente a traductores genéricos.
- Investigación sobre vocabularios reducidos: el recorte a 48.000 tokens para es/ru es un caso de estudio para modelos bilingües de bolsillo.
- Prototipos de asistentes de lectura para hablantes de ruso que aprenden español, limitados a la traducción de frases.

## Benchmarks y rendimiento

Resultados publicados por el autor (conjuntos propios, 6-7 de noviembre de 2026; dos jueces de lenguaje; una traducción cuenta solo si ambos la marcan como correcta; archivo tal como lo ejecuta la app):

| Prueba | ES3b | Modelo ligero | Apple Translation |
|---|---|---|---|
| 87 expresiones fijas no vistas (Buitrago, DLE) | 56 (64 %) | 43 (49 %) | 39 (45 %) |
| 161 expresiones fijas e idioms (conjunto propio; ES2: 106) | 113 (70 %) | — | — |
| 143 refranes en frases de novelas (Sbarbi) | 64 (45 %) | 48 (34 %) | 42 (29 %) |
| FLORES-200 es→ru, chrF++ (1.012 frases, greedy) | 44,41 | 39,53 | — |

Datos adicionales de la versión ES2 citados por el autor: 364 de 454 (80 %) en seis conjuntos de trampas (género, tratamiento, aspecto, ser/estar, clíticos), expresiones, colocaciones y nombres; elección del significado de una palabra 340 de 418. ES3b queda a la par de ES2 en FLORES (44,41 frente a 44,43), en elección de significado (340 frente a 341 de 418) y en refranes (64 frente a 69 de 143, sin diferencia significativa), y mejora en expresiones no vistas (6 frente a 0 filas discrepantes, p = 0,03, en las 87 expresiones; 11 frente a 4 en las 161).

## Requisitos de hardware

- Memoria estimada: unos 2,2 GB en llama.cpp sobre CPU, con contexto de 2.048 tokens y una frase (medición del autor).
- Tamaño del archivo: 1.760.370.208 bytes (Q5_K_M).
- Dispositivo objetivo: 6 GB de memoria o más; para dispositivos menores existe el modelo ligero `gemma4-e2b-es-compact-fluent-books`.
- GPU recomendadas: no disponible (el autor no publica pruebas en GPU; Metal no medido).
- Cabe en GPU de consumo: no confirmado; por tamaño (≈1,76 GB) es plausible en GPUs con 4-6 GB, pero no hay datos publicados.
- Despliegue: llama.cpp con una build que soporte Gemma 4; no se indican vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-es-fluent-books (ES3b) | no disponible (base E2B) | 2.048 | FLORES chrF++ 44,41; 64 % expresiones no vistas | Apache-2.0 | GGUF Q5_K_M |
| gemma4-e2b-es-compact-fluent-books | no disponible | no disponible | 49 % expresiones no vistas; FLORES chrF++ 39,53 | Apache-2.0 | GGUF |
| gemma4-e2b-fluent-books | no disponible | no disponible | no disponible | Apache-2.0 | GGUF Q4_K_M (embedding Q3_K) |
| Apple Translation | propietario | no disponible | 45 % expresiones no vistas; 29 % refranes | propietaria | integrado en Apple |

## Limitaciones y advertencias

- Refranes: menos de la mitad se renderizan como dicho ruso; el resto sale palabra por palabra (45 % en el conjunto de 143).
- Jerga: en una comprobación de 31 frases de un diccionario de jerga, alrededor de una cuarta parte correctas (para ES2 y ES3 anteriores).
- Palabras regionales y frases muy largas: rendimiento deficiente según el autor.
- Solo traduce la frase; no elige el significado de una palabra ni lo explica (la app aún no tiene diccionario de español).
- Riesgo de letras latinas dentro de palabras rusas; la app prohíbe tokens de letras latinas en la respuesta y las mediciones usaron la misma prohibición.
- Los conjuntos de evaluación son pequeños y propios, y los jueces fueron agentes de lenguaje, no humanos.
- No es un modelo de chat ni un traductor general; usarlo fuera del prompt previsto puede degradar la calidad.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 E2B también es Apache-2.0 según la model card; conviene verificar los términos de Google para el base.
- Sesgos: no se documentan sesgos específicos; al entrenarse con novelas de dominio público, puede reflejar sesgos de esos textos.

## Enlaces

- Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-es-fluent-books
- Modelo ligero: https://huggingface.co/lazarenkod/gemma4-e2b-es-compact-fluent-books
- Versión previa (Q4_K_M): https://huggingface.co/lazarenkod/gemma4-e2b-fluent-books
- Modelo base: google/gemma-4-E2B-it (no se proporciona URL directa en la información disponible)
