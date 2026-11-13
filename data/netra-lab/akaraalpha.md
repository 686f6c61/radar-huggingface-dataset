# Netra-Lab/AkaraAlpha

## Resumen

AkaraAlpha es un modelo seq2seq de transliteración inversa desarrollado por Netra-Lab que convierte texto jemer escrito en alfabeto latino (romanización) de vuelta a la escritura jemer nativa. Por ejemplo, transforma `brodae` en ប្រដែ. El modelo aborda un problema práctico y específico: la ausencia de un estándar de romanización del jemer y la dificultad que supone para usuarios de teclados latinos escribir en escritura jemer.

Técnicamente es un modelo muy compacto: un encoder-decoder a nivel de carácter con solo 78.705 parámetros. El encoder es una GRU bidireccional de 64 unidades por dirección y el decoder es una GRU de 64 unidades con atención aditiva. El sistema completo añade una búsqueda beam y una comprobación contra un diccionario jemer de 38.743 palabras, lo que eleva la precisión Top-1 del 44,4% (decodificación greedy) al 73,6%.

Su relevancia reside en la eficiencia: con menos de 80.000 parámetros supera en tasa de error de carácter (CER) a un Transformer de 248.337 parámetros entrenado con los mismos datos. Es un ejemplo de cómo una arquitectura recurrente bien ajustada con atención y un componente léxico puede rendir mejor que alternativas más grandes en tareas de transliteración acotadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder seq2seq con GRU bidireccional + GRU con atención aditiva |
| Parámetros totales | 78.705 (encoder 46.784, decoder 31.921) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada: hasta 25 caracteres latinos; salida: hasta 24 caracteres jemer |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Jemer (km), entrada en alfabeto latino |
| Licencia | MIT |
| Formato de pesos | Keras (.keras) y tokenizadores en JSON |

## Arquitectura y entrenamiento

El modelo opera a nivel de carácter. Cada letra latina de entrada se proyecta a un embedding de 32 dimensiones; una GRU bidireccional de 64 unidades por dirección procesa la secuencia en ambos sentidos y una proyección lleva cada estado a 64 dimensiones, que actúan como claves y valores de la atención. El decoder es una GRU de 64 unidades que arranca desde ceros (no desde el estado final del encoder), de modo que toda la información de la entrada llega exclusivamente a través de la atención aditiva (implementada con `AdditiveAttention` de Keras y escala aprendida). La capa de salida aplica softmax sobre 81 identificadores: 77 caracteres jemer más los marcadores de inicio, fin y desconocido.

Los embeddings de entrada y salida son independientes (32 dimensiones cada uno). El vocabulario de entrada cubre las 26 letras latinas y el de salida los 77 caracteres jemer. El entrenamiento se realizó sobre el dataset `Chhunneng/khmer-text-transliteration`, con un 20% de palabras reservadas para evaluación (5.714 palabras). La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; en una tarea de transliteración supervisada carácter a carácter estos mecanismos no resultan habituales. La innovación destacable no está en el entrenamiento sino en el pipeline de inferencia: búsqueda beam combinada con validación contra un diccionario léxico de 38.743 palabras jemer.

## Capacidades

- Transliteración inversa de romanización latina a escritura jemer a nivel de carácter.
- Decodificación greedy y búsqueda beam con k configurable (3, 5, 7, 10).
- Verificación y corrección de candidatos contra un diccionario jemer de 38.743 palabras.
- Generación de listas de sugerencias Top-K (hasta el 87,37% de acierto con k=10).
- Interfaz de escritura interactiva en navegador mediante `netra-transliterate --serve`, que sugiere palabras jemer mientras se teclea en latín.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad monolingüe: únicamente jemer como salida y alfabeto latino como entrada.

## Casos de uso

- Teclados y métodos de entrada para jemer: el modelo puede integrarse en un IME que convierta la romanización tecleada en escritura jemer con sugerencias Top-5, usando la latencia de 94 ms por palabra del sistema completo.
- Edición y corrección de textos romanizados: digitalización de documentos donde el jemer se transcribió en alfabeto latino, reconvirtiéndolo a escritura nativa con validación de diccionario para reducir errores.
- Aplicaciones móviles de bajo consumo: con 78.705 parámetros y pesos Keras ligeros, el modelo cabe en dispositivos con recursos limitados sin necesidad de GPU, algo inviable para modelos Transformer grandes.
- Procesamiento por lotes de corpus: normalización de datasets multilingües que contienen jemer romanizado, aplicando búsqueda beam k=10 para maximizar la cobertura Top-K (87,37%).
- Herramientas educativas de aprendizaje del jemer: mostrar al estudiante la correspondencia entre la romanización y la escritura nativa, con listas de candidatos cuando la romanización es ambigua.
- Búsqueda y recuperación de información: indexación de consultas en romanización latina contra un corpus en escritura jemer, transliterando la consulta antes de buscar.
- Prototipado rápido en Python: el paquete `netra-transliterate` en PyPI permite integrar la funcionalidad con dos líneas de código, sin infraestructura de inferencia compleja.

## Benchmarks y rendimiento

Tasa de error de carácter (CER) de los modelos solos sobre las 5.714 palabras reservadas. Menor es mejor.

| Modelo | Parámetros | CER (%) |
|---|---:|---:|
| **AkaraAlpha** | 78.705 | **15,07** |
| Transformer | 248.337 | 17,78 |
| Attention BiLSTM | 96.753 | 18,26 |
| LSTM | 58.417 | 31,78 |
| GRU | 46.385 | 51,64 |
| RNN | 42.609 | 102,41 |

Precisión a nivel de palabra y latencia del sistema completo con comprobación de diccionario.

| Decodificación | Top-1 | Top-K | Latencia por palabra |
|---|---:|---:|---:|
| Greedy | 44,44% | 44,44% | 21,92 ms |
| Beam, k = 3 | 70,06% | 78,72% | 66,03 ms |
| **Beam, k = 5 (recomendado)** | **73,60%** | **83,41%** | **94,15 ms** |
| Beam, k = 7 | 74,87% | 85,60% | 122,10 ms |
| Beam, k = 10 | 75,85% | 87,37% | 167,21 ms |

Los resultados del model-index están declarados por el autor y no han sido verificados de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable; el modelo tiene 78.705 parámetros (del orden de 300 KB en float32) y puede ejecutarse en CPU.
- GPU recomendadas: ninguna necesaria. Cualquier GPU consumer (incluso integradas) es más que suficiente; una RTX 4090 o A100 no aportarían ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer y en dispositivos de borde (móviles, Raspberry Pi) por su reducido tamaño.
- Opciones de despliegue: Keras con TensorFlow 2.17 o superior, el paquete `netra-transliterate` de PyPI, o el servidor integrado `netra-transliterate --serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo Keras de este tipo.
- Latencia: 21,92 ms por palabra con decodificación greedy y 94,15 ms con beam k=5 incluyendo la comprobación de diccionario. El throughput no se documenta explícitamente, pero la latencia por palabra permite estimar decenas de palabras por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | CER (%) | Enfoque | Licencia |
|---|---:|---:|---|---|
| **AkaraAlpha** | 78.705 | 15,07 | BiGRU + atención + diccionario | MIT |
| Transformer (mismos datos) | 248.337 | 17,78 | Transformer seq2seq | No disponible |
| Attention BiLSTM | 96.753 | 18,26 | BiLSTM con atención | No disponible |
| LSTM | 58.417 | 31,78 | LSTM simple | No disponible |

La comparativa se limita a las líneas base entrenadas sobre el mismo dataset, ya que no se dispone de información sobre otros modelos públicos de transliteración jemer con los que contrastar parámetros, contexto o licencia. AkaraAlpha ofrece el mejor CER con el segundo menor número de parámetros de la tabla, solo por encima de la LSTM simple (58.417), que rinde mucho peor.

## Limitaciones y advertencias

- Ámbito muy restringido: solo translitera palabras aisladas de romanización latina a jemer; no procesa frases completas ni mantiene contexto conversacional.
- Límite de longitud: entrada de hasta 25 caracteres latinos y salida de hasta 24 caracteres jemer; palabras más largas se truncan.
- Sin verificación independiente: las métricas del model-index están declaradas por el autor (`verified: false`) y no se han reproducido de forma externa.
- Dependencia del diccionario: la precisión Top-1 del 73,6% requiere la comprobación léxica; sin ella, el modelo solo alcanza el 44,44%, lo que evidencia una tasa de acierto baja en la generación pura.
- Ambigüedad de la romanización: al no existir un estándar único de romanización del jemer, entradas no convencionales pueden producir transliteraciones incorrectas.
- Riesgo de alucinación léxica: el modelo puede generar palabras jemer válidas ortográficamente pero semánticamente distintas de la intención del usuario, especialmente en romanizaciones ambiguas.
- Sesgos: no se documentan análisis de sesgo; el comportamiento depende enteramente de la distribución del dataset de entrenamiento (`Chhunneng/khmer-text-transliteration`).
- Licencia MIT: permite uso comercial y modificación sin restricciones significativas, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al corpus de entrenamiento.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Netra-Lab/AkaraAlpha
- Repositorio GitHub: https://github.com/netra-ai-lab/Romanized-Khmer-to-Khmer-Transliteration
- Paquete PyPI: https://pypi.org/project/netra-transliterate/
- Dataset de entrenamiento: https://huggingface.co/datasets/Chhunneng/khmer-text-transliteration
- Imagen de arquitectura: https://huggingface.co/Netra-Lab/AkaraAlpha/resolve/main/assets/architecture.png
