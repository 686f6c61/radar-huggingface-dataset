# Misakachain/Qwen2.5-1.5B-PALW-A16-runtime

## Resumen

Misakachain/Qwen2.5-1.5B-PALW-A16-runtime no es un modelo de lenguaje en el sentido convencional, sino un artefacto de runtime determinista generado a partir del checkpoint `Qwen/Qwen2.5-1.5B-Instruct`. El autor, Misakachain, lo ha transformado mediante una conversión estática de cuantización entera (W8A16) para que la inferencia se ejecute exclusivamente con aritmética de enteros, garantizando que la misma entrada produzca exactamente la misma salida en cualquier máquina. Este artefacto está diseñado para servir como prueba de cómputo (proof-of-compute) en la red blockchain MISAKA testnet-11, donde la ejecución de inferencias sobre este runtime constituye el trabajo de generación de bloques.

El artefacto pesa 1,7 GiB, contiene 28 capas y un vocabulario de 151 936 tokens. Su relevancia radica en que introduce una clase de determinismo absoluto en la inferencia de modelos grandes, lo que permite verificar y disputar cada paso de cómputo en una red distribuida sin necesidad de re-ejecutar el modelo completo. A diferencia de un modelo tradicional, este runtime no redistribuye los pesos originales, sino que los transforma en un formato propio `.palwart`, verificable por digest. La licencia es Apache-2.0 y los idiomas soportados son inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct convertido a runtime determinista PALW (W8A16) |
| Parametros totales | 1,5 B (del modelo base original) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 16 tokens (limitación impuesta por la cadena blockchain, no del runtime) |
| Tipos de cuantizacion | W8A16 (pesos en 8 bits, activaciones en 16 bits, acumulación en 64 bits) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | `.palwart` (artefacto binario propio de MISAKA PALW) |

## Arquitectura y entrenamiento

El artefacto no se entrena, sino que se obtiene mediante una conversión estática del checkpoint `Qwen/Qwen2.5-1.5B-Instruct`. El proceso de conversión (documentado como ADR-0040) elimina cualquier operación en coma flotante, sustituyéndola por enteros de 16 bits para las activaciones y 8 bits para los pesos, con acumulación en 64 bits. Esta conversión estática PTQ (post-training quantization) se ha validado para que la salida del runtime sea fiel a la del modelo original en punto flotante: en una prueba de 57 muestras, el top-1 coincide en 45 y el top-5 en 56, con una correlación de rango de 0,893 sobre los top-100 y una similitud coseno por capas entre 0,98 y 1,00.

El runtime implementa un grafo de ejecución fijo y reproducible. Cada paso de la inferencia (prefill y decode) se descompone en un espacio de pasos proyectado desde el orden de ejecución del propio motor, lo que permite que cualquier nodo de la red pueda recalcular un paso concreto y verificarlo sin ambigüedad. La red MISAKA testnet-11 registra en su genesis el digest del artefacto (`c00faa48...` y `7c9dc08f...`), de modo que solo un artefacto con exactamente ese hash es considerado válido para la clase `PALW-QWEN25-A16`.

## Capacidades

- Generación de texto determinista: dado un prompt, produce siempre la misma secuencia de tokens, con exactitud bit a bit en cualquier hardware.
- Fidelidad a la referencia en punto flotante: top-1 45/57, top-5 56/57, correlación de rango 0,893, coseno por capas entre 0,98 y 1,00.
- Inferencia enteramente en aritmética de enteros (W8A16), sin ninguna operación en coma flotante en la ruta de ejecución.
- Ejecución de bloques en la red MISAKA: el runtime puede producir bloques válidos en la testnet-11 (tiempo de ejecución de un job anclado de 14 pasos prefill + 2 decode: 474 ms, con commit de 9,7 MB de material).
- Verificación de bloques sin necesidad del artefacto: los nodos pueden validar bloques comprobando compromisos y firmas sin re-ejecutar la inferencia.
- Soporte de tokenizer: utiliza el tokenizer original de Qwen2.5-1.5B-Instruct (no redistribuido en el repositorio).

## Casos de uso

- **Minería de bloques en blockchain**: el runtime es el componente de trabajo en la red MISAKA testnet-11. Los nodos que poseen el artefacto pueden generar bloques ejecutando inferencias ancladas (14 prefill + 2 decode) y firmarlos con ML-DSA-87, compitiendo en la lotería de consenso.
- **Verificación de integridad de cómputo**: al ser determinista, cualquier tercero puede re-ejecutar una inferencia paso a paso y comprobar que el resultado coincide exactamente con el compromiso publicado en la cadena. Esto habilita auditorías de cómputo sin confianza.
- **Pruebas de trabajo (proof-of-work) con IA**: el modelo sirve como carga de trabajo computacional para sistemas de consenso que requieren un problema útil (proof-of-useful-work), en lugar de hashes arbitrarios.
- **Investigación en cuantización determinista**: el artefacto permite estudiar cómo se comporta un modelo de 1,5 B bajo cuantización W8A16 con restricciones de contexto corto, y sirve como banco de pruebas para técnicas de PTQ deterministas.
- **Prototipado de aplicaciones de IA en entornos sin GPU**: al ser un runtime de solo enteros, puede ejecutarse en CPUs y microcontroladores, lo que permite desplegar inferencias en hardware de bajo coste donde las operaciones en coma flotante son lentas o no están soportadas.
- **Generación de respuestas cortas y deterministas**: aunque el contexto está limitado a 16 tokens, el runtime puede responder preguntas simples de una sola frase (por ejemplo, "What is the capital of France?" → "The capital of France is Paris."), lo que es útil para sistemas de preguntas frecuentes o validaciones de respuesta exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K, etc.) para este artefacto. La información disponible se centra en métricas de fidelidad frente a la referencia en coma flotante y en el rendimiento de ejecución en la red blockchain. Los datos reportados son:

| Métrica | Valor |
|---|---|
| Top-1 match (sobre 57 muestras) | 45/57 |
| Top-5 match (sobre 57 muestras) | 56/57 |
| Correlación de rango (top-100) | 0,893 |
| Similitud coseno por capas (28 capas) | 0,98 – 1,00 |
| Velocidad de prefill (M4 Pro) | 50 tokens/s |
| Velocidad de decode (M4 Pro) | 33 tokens/s |
| Tiempo de ejecución de un job anclado (14 prefill + 2 decode) | 474 ms |
| Material comprometido por bloque | 9,7 MB |

Estos datos provienen de la model card del autor y no se han podido verificar de forma independiente.

## Requisitos de hardware

- El artefacto ocupa 1,7 GiB en disco, por lo que puede almacenarse en cualquier dispositivo con más de 2 GiB de espacio.
- No se especifican requisitos de GPU; la conversión se ejecuta en CPU (medida en un Apple M4 Pro), lo que sugiere que el runtime es adecuado para hardware de bajo consumo, incluidos procesadores ARM.
- La inferencia se realiza con aritmética de enteros, lo que elimina la necesidad de unidades de coma flotante (FPU) y permite ejecución en CPUs sin FPU o en aceleradores dedicados a enteros.
- Para la generación de bloques en la red MISAKA, se requiere el binario `base0-chat` (incluido en el paquete `misaka-palw-base0`) y el tokenizer original de Qwen2.5-1.5B-Instruct.
- El despliegue no se realiza mediante frameworks habituales como vLLM o llama.cpp, sino mediante el binario `base0-chat` o el nodo `kaspad` con el parámetro `--palw-class-artifact`.
- La latencia medida en M4 Pro es de 50 tokens/s en prefill y 33 tokens/s en decode, lo que se considera suficiente para aplicaciones de baja frecuencia como la generación de bloques en una red de prueba.

## Comparativa con modelos similares

Este artefacto no tiene comparación directa con otros modelos de lenguaje porque no es un modelo de propósito general, sino un runtime determinista para blockchain. No obstante, se puede comparar con el modelo original del que deriva y con otras aproximaciones de cuantización determinista:

| Modelo | Tipo | Parámetros | Contexto | Cuantización | Fidelidad | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (original) | Modelo denso | 1,5 B | 32 768 tokens | FP16/BF16 | Referencia | Apache-2.0 |
| Misakachain/Qwen2.5-1.5B-PALW-A16-runtime | Runtime determinista | 1,5 B (convertido) | 16 tokens (limitación de red) | W8A16 | top-1 45/57, cosine 0,98-1,00 | Apache-2.0 |
| Otros runtimes PALW (p. ej., Qwen3.6-35B-A3B) | Runtime determinista | 35 B (MoE) | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación es conceptualmente distinta: el runtime no busca el máximo rendimiento en NLP, sino la determinación y la verificabilidad, a costa de una ventana de contexto muy reducida y una pérdida ligera de fidelidad.

## Limitaciones y advertencias

- **No es un modelo de lenguaje utilizable**: es un artefacto de runtime para un sistema blockchain. No se puede usar como un LLM convencional para aplicaciones de chat o generación de texto libre.
- **Contexto extremadamente limitado**: la cadena MISAKA limita `n_ctx` a 16 tokens, lo que restringe las respuestas a frases muy cortas. No es adecuado para tareas que requieran razonamiento largo o múltiples turnos.
- **Solo inglés y japonés**: el runtime hereda el vocabulario del tokenizer original, pero el modelo base fue entrenado principalmente en inglés y chino; la model card solo indica soporte explícito para en y ja.
- **Fidelidad no perfecta**: aunque la similitud coseno por capas es alta, la concordancia top-1 es de 45/57, lo que significa que en algunas entradas la salida puede diferir del modelo original en coma flotante.
- **Uso comercial condicionado**: la licencia es Apache-2.0, pero el artefacto está vinculado a la red MISAKA testnet-11, que puede tener reglas propias sobre el uso del cómputo. La redistribución del artefacto está sujeta a la verificación de digest.
- **Dependencia de la red**: el runtime solo es útil dentro de la infraestructura MISAKA; fuera de ella, carece de utilidad práctica.
- **Riesgo de alucinación**: aunque el contexto es corto, el modelo puede generar respuestas incorrectas; la limitación de 16 tokens no elimina el riesgo de errores factuales.

## Enlaces

- [Repositorio HuggingFace de Misakachain/Qwen2.5-1.5B-PALW-A16-runtime](https://huggingface.co/Misakachain/Qwen2.5-1.5B-PALW-A16-runtime)
- [Modelo base original: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Colección de modelos Qwen2.5 en Hugging Face](https://huggingface.co/collections/Qwen/qwen25)
- [GitHub de Qwen2.5 (referencia de arquitectura)](https://github.com/mx4ai/qwen2.5)
- [Informe técnico de Qwen2.5 (arXiv)](https://arxiv.org/pdf/2412.15115v2)
- [Runtime de Qwen3.6-35B-A3B PALW (clase híbrida)](https://huggingface.co/Misakachain/Qwen3.6-35B-A3B-PALW-runtime)
