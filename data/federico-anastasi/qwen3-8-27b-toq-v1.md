# federico-anastasi/Qwen3.8-27B-TOQ-v1

## Resumen

Qwen3.8-27B-TOQ-v1 es una cuantización de 2 bits del modelo Qwen3.8-27B de Alibaba, publicada por el desarrollador independiente federico-anastasi. No se trata de una versión oficial de Qwen: el autor aplica una técnica propia de cuantización por trellis (TOQ, *Trellis-Operator Quantization*), de la familia QTIP/EXL3, seguida de una breve destilación contra el modelo original en bf16. El resultado ocupa 6,17 GiB de pesos en GPU (fichero GGUF de 8,84 GiB), frente a los 13,3 GiB de una cuantización IQ4_XS convencional.

El modelo base es un transformer híbrido de 27.366.835.200 parámetros con 64 capas: 48 capas de Gated DeltaNet y 16 de atención completa, con un contexto nativo de 262.144 tokens (probado hasta 120k). Conserva la capa de *multi-token prediction* del original, cuantizada con el mismo esquema. La motivación es clara: mantener una calidad cercana a 4 bits con la huella de memoria de un 2 bits, lo que permite ejecutar un modelo de 27B en GPUs de consumo.

La relevancia práctica viene acompañada de una advertencia importante: el fichero no funciona en llama.cpp estándar, Ollama, LM Studio ni vLLM. Requiere el motor mango-toq (un fork de ik_llama.cpp) o la aplicación Mango Code, que instala motor y modelo conjuntamente. Es, por tanto, un artefacto experimental y de nicho, no una opción lista para producción sin trabajo adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.8: 64 capas, 48 Gated DeltaNet + 16 atención completa (`qwen35` en GGUF) |
| Parámetros totales | 27.366.835.200 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; probado hasta 120k |
| Tipos de cuantización | Trellis de 2 bits (pesos), cabeza de salida a 3 bits, escalas por fila; corrección de destilación en f32; tabla de embeddings en bf16 |
| Idiomas soportados | Inglés (en), italiano (it) |
| Licencia | cc-by-sa-4.0 (modelo base Apache-2.0) |
| Formato de pesos | GGUF (9.489.952.128 bytes, 8,84 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B original: un transformer híbrido con 64 capas, de las cuales 48 son Gated DeltaNet (atención lineal con estado recurrente) y 16 son atención completa. Incluye una capa de *multi-token prediction* (MTP) que se conserva en la cuantización, con un tamaño de 101,5 MiB frente a los 810 MiB en bf16. El contexto nativo es de 262.144 tokens.

El proceso de cuantización consta de tres partes. Primero, cuantización por trellis según el método QTIP (Tseng et al., arXiv:2406.11235) tal como lo implementa EXL3 de turboderp, con implementación propia del autor: rotación Hadamard por bloques en el lado de entrada, codificación como camino por una trellis con codebook calculado («mul1»), selección mediante BlockLDLQ contra hessianos de capa medidos sobre 250 filas × 2.048 tokens de la mezcla de calibración de EXL3. Los *tiles* son de 64×4 (frente a 16×16 en EXL3), el estado es de 14 bits (frente a 16) y las escalas son por fila, por lo que el fichero no es compatible con EXL3. Segundo, destilación: se entrenan las escalas de cada capa lineal cuantizada más una corrección de bajo rango de rango 32 sobre las 64 proyecciones de puerta del MLP, contra los logits del modelo bf16 con divergencia KL, sobre 0,39M tokens (48 pasos × 4 filas × 2.048 tokens). Los códigos trellis no cambian; la corrección se almacena como tensores y se aplica como W·x + B·(A·x). Tercero, el motor mango-toq implementa los tipos de peso trellis en CUDA, CPU (AVX2) y Vulkan, con GEMM int8 de tensor cores para el procesamiento del prompt, *prompt processing* en la GPU principal con streaming de pesos desde RAM fijada, CUDA graphs en Pascal y Turing, MTP y caché de conversaciones en disco.

## Capacidades

- Generación de texto y conversación multi-turno, con contexto nativo de hasta 262.144 tokens.
- Razonamiento multi-paso y tareas agénticas de horizonte largo, heredadas del modelo base.
- Capacidad de visión: el GGUF contiene solo el modelo de lenguaje; la visión funciona con el proyector original de Qwen3.8 (`mmproj-F16.gguf` de unsloth/Qwen3.8-27B-GGUF).
- *Multi-token prediction* (MTP) integrada y cuantizada, útil para decodificación especulativa con tokens borrador.
- Soporte multilingüe limitado a inglés e italiano según la model card.
- Capacidades de código y matemáticas del modelo base, con la degradación propia de una cuantización de 2 bits (mayor divergencia KL en código y trazas agénticas que en texto web).

## Casos de uso

- Despliegue de un modelo de 27B en GPU de consumo: con 6,17 GiB de pesos en GPU, cabe en tarjetas de 8-12 GB de VRAM, algo imposible con cuantizaciones de 4 bits del mismo modelo.
- Experimentación en cuantización extrema: sirve como referencia reproducible para investigadores que estudien técnicas de trellis, destilación de escalas y correcciones de bajo rango, con métricas de PPL y KL publicadas.
- Procesamiento de documentos largos: el contexto de 262.144 tokens permite analizar contratos, informes o bases de código extensas en una sola pasada, siempre que la VRAM y el motor lo soporten.
- Asistentes conversacionales en inglés o italiano: la ventana larga y el soporte de conversación multi-turno encajan en atención al cliente o asistentes internos, con la salvedad de la licencia cc-by-sa-4.0.
- Análisis de imágenes con el proyector externo: al cargar `mmproj-F16.gguf` se habilita el pipeline visión-lenguaje del modelo base para tareas de descripción o extracción de información de capturas y documentos escaneados.
- Evaluación comparativa de motores de inferencia: al requerir mango-toq, es útil para medir el rendimiento de tipos de peso trellis en CUDA, CPU AVX2 y Vulkan frente a llama.cpp estándar.
- Prototipado de agentes con MTP: la capa de predicción multi-token permite probar decodificación especulativa con tokens borrador en flujos agénticos, aunque la divergencia KL en trazas agénticas es la más alta de todas las dominios medidos.

## Benchmarks y rendimiento

MMLU sobre 1.548 preguntas de validación, respuesta forzada `Answer: X`, temperatura 0 y razonamiento desactivado:

| Modelo | Tamaño | MMLU |
|---|---|---|
| Qwen3.8-27B UD-IQ4_XS | 13,3 GiB (fichero) | 82,56% |
| Qwen3.8-27B-TOQ-v1 | 6,17 GiB en GPU | 77,78% ± 1,06 |
| TOQ, mismos pesos antes de destilar | 6,17 GiB en GPU | 78,29% ± 1,05 |
| Ternary Bonsai 2 27B (PrismML) | 5,27 GiB en GPU | 77,91% |
| Qwen3.8-27B UD-IQ2_XXS | ~6,4 GiB | 72,87% |

Comparación pareada por pregunta: frente a Bonsai 2, 94 aciertos solo de TOQ frente a 96 solo de Bonsai (empate); frente a UD-IQ2_XXS, 174 frente a 98 (mejor, p < 0,001); frente a UD-IQ4_XS, 55 frente a 129 (peor); frente a la versión sin destilar, 51 frente a 59 (empate).

Perplejidad y divergencia KL frente a UD-IQ4_XS, sobre los primeros 150 fragmentos de 512 tokens de wikitext-2, mismo motor (mango-toq, CUDA, caché KV f16):

| Modelo | PPL wikitext-2 | KLD media vs UD-IQ4_XS | Mismo token top-1 |
|---|---|---|---|
| Qwen3.8-27B UD-IQ4_XS (referencia) | 6,763 ± 0,085 | — | — |
| Qwen3.8-27B-TOQ-v1 | 7,501 ± 0,095 (+10,9%) | 0,181 ± 0,002 | 81,8% |

Distribución de KLD: mediana 0,088, percentil 90 de 0,389, percentil 99 de 1,735.

Divergencia KL frente al modelo bf16 en filas reservadas de las fuentes de destilación (4 filas × 2.048 tokens por dominio):

| Dominio | Antes de destilar | TOQ-v1 |
|---|---|---|
| Texto web | 0,1404 | 0,1187 |
| Código | 0,2621 | 0,2199 |
| Ciencia y matemáticas | 0,1562 | 0,1272 |
| Trazas agénticas | 1,7001 | 1,1265 |
| Media | 0,5647 | 0,3981 |

## Requisitos de hardware

- VRAM para pesos: 6,17 GiB en GPU (64 capas a 2 bits por peso, cabeza de salida a 3 bits) más 176 MiB en f32 para la corrección de destilación.
- RAM del sistema: aproximadamente 2,5 GB para la tabla de embeddings en bf16, que se mantiene fuera de la GPU.
- El fichero GGUF completo ocupa 8,84 GiB en disco.
- GPU recomendadas: no especificadas por el autor. Por huella de memoria, cabe en GPUs de consumo con 8 GB o más de VRAM; el motor soporta CUDA, CPU con AVX2 y Vulkan, además de CUDA graphs en Pascal y Turing.
- Despliegue: exclusivamente mediante mango-toq (fork de ik_llama.cpp, rama `mango`) o la aplicación Mango Code. No funciona en llama.cpp estándar, Ollama, LM Studio ni vLLM.
- Rendimiento: la model card incluye una sección de velocidad medida con el benchmark de Mango Code (texto real, temperatura 0, 256 tokens generados, sin caché de prompt, caché KV q8_0, MTP con 2 tokens borrador, build CUDA), pero el dato de tokens por segundo queda truncado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Qwen3.8-27B-TOQ-v1 | 27,4B | 262.144 | 77,78% | cc-by-sa-4.0 | GGUF trellis 2 bits / mango-toq |
| Qwen3.8-27B UD-IQ4_XS | 27,4B | 262.144 | 82,56% | Apache-2.0 (base) | GGUF IQ4_XS / llama.cpp |
| Qwen3.8-27B UD-IQ2_XXS | 27,4B | 262.144 | 72,87% | Apache-2.0 (base) | GGUF IQ2_XXS / llama.cpp |
| Ternary Bonsai 2 27B (PrismML) | no disponible | no disponible | 77,91% | no disponible | Pesos ternarios / PrismML llama.cpp fork |

## Limitaciones y advertencias

- No es una versión oficial de Qwen; es una cuantización de terceros sin validación por parte de Alibaba.
- No se ejecuta en llama.cpp estándar, Ollama, LM Studio ni vLLM: requiere mango-toq o Mango Code, lo que limita su integración en infraestructura existente.
- Pérdida de calidad medible: +10,9% de perplejidad en wikitext-2 y KLD media de 0,181 frente a una cuantización de 4 bits; solo el 81,8% de los tokens top-1 coinciden con la referencia IQ4_XS.
- Mayor degradación en código (KLD 0,2199) y, sobre todo, en trazas agénticas (KLD 1,1265), donde el modelo queda unas diez veces más lejos del bf16 que en texto web. No es recomendable para flujos agénticos exigentes.
- El conjunto de control de la destilación es pequeño (4 filas × 2.048 tokens por dominio) y procede de las mismas fuentes que el texto de entrenamiento.
- No se ha ejecutado una prueba de control de un modelo de referencia sobre mango-toq, por lo que la comparación de MMLU entre motores distintos introduce incertidumbre.
- Idiomas limitados a inglés e italiano; no hay soporte declarado de castellano.
- La licencia cc-by-sa-4.0 impone compartir-al-igual sobre las obras derivadas, lo que puede condicionar el uso comercial; el modelo base es Apache-2.0, pero la cuantización cambia la licencia.
- La visión requiere descargar aparte el proyector `mmproj-F16.gguf`; el GGUF principal solo contiene el modelo de lenguaje.
- Riesgo de alucinación y sesgos del modelo base, potencialmente amplificados por la cuantización agresiva; no se han publicado evaluaciones de seguridad específicas para esta versión.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/federico-anastasi/Qwen3.8-27B-TOQ-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor mango-toq: https://github.com/Federico-Anastasi/mango-toq
- Aplicación Mango Code: https://github.com/Federico-Anastasi/mango-code
- GGUF del modelo base con proyector de visión: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper QTIP (Tseng et al.): https://arxiv.org/abs/2406.11235
- Ficha del modelo base en Together AI: https://www.together.ai/models/qwen3-8-27b
- Ficha del modelo base en AI/TLDR: https://ai-tldr.dev/models/qwen3-8-27b/
