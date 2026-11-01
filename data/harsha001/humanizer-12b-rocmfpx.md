# Harsha001/humanizer-12b-ROCmFPX

## Resumen

humanizer-12b-ROCmFPX es una cuantización GGUF en formatos ROCmFPX (un fork de llama.cpp con tipos de peso de baja precisión para GPUs AMD, vía Vulkan e HIP/ROCm) del modelo jialinyyzz/humanizer, un fine-tune de Gemma 4 12B especializado en reescritura de texto. Su función es tomar borradores escritos por una IA en inglés o chino y reescribirlos para que suenen humanos, preservando fielmente todos los datos factuales: números, fechas, nombres y citas.

El modelo base (humanizer v2) resuelve un problema muy demandado: la detección de texto generado por IA y la naturalidad de la prosa automática. En lugar de generar contenido desde cero, actúa como un "humanizador" que reescribe borradores manteniendo la integridad factual, lo que lo hace útil en flujos editoriales donde se redacta con IA y se pulsa después.

Esta versión concreta, publicada por Harsha001, aporta valor técnico propio: cuantizaciones con escalas por tensor que mejoran notablemente la fidelidad respecto a ROCmFPX plano, con mediciones de divergencia KL frente al modelo BF16. Importa advertir que los ficheros requieren un fork específico de llama.cpp y que, según el propio autor, aún no se han probado en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B, fine-tune) |
| Parametros totales | 11.907.350.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa 8192 tokens) |
| Tipos de cuantizacion | ROCmFPX 8-bit (Q8_0_ROCMFPX), Q6_0_ROCMFPX, ROCmFP4 (variantes STRIX y FAST); embedding compartido en Q8_0 o Q6_K según fichero |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere fork ROCmFPX de llama.cpp; no compatible con llama.cpp estándar, LM Studio ni Ollama) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 4 12B, un transformer denso de unos 11.900 millones de parámetros. Según la model card del autor original, humanizer v2 está entrenado para reescritura de texto (tarea de text-to-text) en inglés y chino, con énfasis en preservar hechos (fechas, cifras, nombres, citas) durante la reescritura. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

Sobre esta base, Harsha001 ha producido cuantizaciones ROCmFPX con una innovación técnica relevante: el formato ROCmFPX almacena una escala por bloque de pesos como flotante de 8 bits (UE4M3) con paso mínimo 2^-10. Dado que los pesos de este modelo son pequeños (valores típicos de 0,02 a 0,04 en bloques de 32), casi todos los bloques quedaban clavados en la escala mínima, degradando la precisión a nivel de 6 bits. La solución aplicada consiste en multiplicar cada matriz de pesos por una potencia de dos (2^7 a 2^10) antes de cuantizar y guardar el inverso como fichero `<name>.scale`, que el fork restaura tras el producto matricial. La matriz de embedding/salida compartida no admite esta escala, por lo que se mantiene en tipos estándar de llama.cpp (Q8_0 en el fichero de 8 bits, Q6_K en el de 6 bits y STRIX; ROCmFP4 en el FAST). La cuantización usa matriz de importancia (imatrix) calculada sobre el BF16 con el corpus de calibración `calibration_datav3` en fragmentos de 512 tokens. El tokenizador, la plantilla de chat y los parámetros de muestreo por defecto son idénticos a los del GGUF original.

## Capacidades

- Reescritura de borradores generados por IA para que parezcan escritos por humanos, en inglés y chino.
- Preservación factual durante la reescritura: mantiene números, fechas, nombres, cantidades y citas (verificado con pruebas de reescritura con cinco datos factuales por fichero).
- Generación de texto por completado (text completion), no chat: el prompt es una instrucción fija seguida del borrador y el marcador `\n\n### Rewritten:\n\n`.
- No hay evidencia de capacidades de tool calling, agentes, visión ni audio; es un modelo de tarea única.

## Casos de uso

- Pulido de borradores en flujos editoriales: un equipo de contenidos genera borradores con un LLM y usa humanizer para reescribirlos con tono natural antes de publicación, garantizando que cifras y nombres no se alteren.
- Producción de contenido multilingüe inglés-chino: agencias que operan en ambos idiomas pueden aplicar el mismo pipeline de reescritura sin cambiar de modelo.
- Reducción de la detección de texto automático en contextos legítimos: revisión de comunicaciones corporativas o material educativo para que no resulten estereotipadamente artificiales.
- Integración en pipelines de procesamiento por lotes: al ser text completion con formato fijo, es trivial automatizarlo con scripts sobre `llama-server` o `llama-cli`.
- Despliegue en hardware AMD: las variantes ROCmFP4 (STRIX y FAST) están pensadas para acelerar la inferencia en GPUs AMD, incluida la APU Strix Halo (gfx1151).
- Pruebas comparativas de cuantización: las mediciones KL publicadas convierten este repo en referencia útil para evaluar la calidad de los formatos ROCmFPX frente a cuantizaciones estándar de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de fidelidad de cuantización (divergencia KL frente al BF16 sobre wikitext-2, 40 fragmentos de 512 tokens, con llama-perplexity --kl-divergence):

| Fichero | Tamaño | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0_ROCMFPX | 12,3 GB | 0,00024 | 99,3 % |
| Q6_K_ROCMFPX | 9,8 GB | 0,0023 | 97,8 % |
| Q4_0_ROCMFP4_STRIX | 6,7 GB | 0,040 | 91,9 % |
| Q4_0_ROCMFP4_FAST | 6,3 GB | 0,047 | 90,8 % |

Comparativa con cuantizaciones estándar de llama.cpp del mismo modelo:

| Fichero estándar | Tamaño | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 | 12,7 GB | 0,00064 | 98,8 % |
| Q6_K | 10,0 GB | 0,0026 | 97,8 % |
| Q4_K_M | 7,4 GB | 0,0186 | 94,1 % |

El 8-bit ROCmFPX con escalas por tensor es más fiel al BF16 que un Q8_0 estándar y además más pequeño; en 4 bits, en cambio, un Q4_K_M estándar se mantiene más cercano al modelo completo. Todos los ficheros superaron una prueba de reescritura con cinco datos factuales en decodificación greedy en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos solamente): unos 12,3 GB para el fichero de 8 bits, 9,8 GB para el de 6 bits y 6,3–6,7 GB para los de 4 bits, más la KV cache según contexto.
- GPU recomendadas: GPUs AMD compatibles con Vulkan o HIP/ROCm. La variante STRIX está orientada a la APU AMD Strix Halo (gfx1151); el fork también contempla gfx1100 (RX 7900). Al no estar probado en hardware AMD, no hay recomendaciones de rendimiento confirmadas.
- Consumer GPUs: el fichero de 6 bits cabe en una GPU de 12 GB (por ejemplo RTX 3060 12 GB o RX 7900 GRE); el de 8 bits requiere aproximadamente 16 GB de VRAM; los de 4 bits caben con holgura en GPUs de 8 GB. Nótese que el fork está orientado a AMD, aunque Vulkan debería funcionar también en otras GPUs.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp (compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON`). No compatible con llama.cpp estándar, LM Studio, Ollama ni otros runtimes. Ejemplo: `llama-server -m humanizer-12b-Q8_0_ROCMFPX.gguf -ngl 999 -c 8192 -np 1 --jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| humanizer-12b-ROCmFPX (este) | 11.900 M (12B) | Reescritura humanizadora (en, zh) | GGUF ROCmFPX | Apache 2.0 | Requiere fork ROCmFPX; sin probar en AMD |
| jialinyyzz/humanizer (base) | 12B | Reescritura humanizadora (en, zh) | GGUF estándar (2/3/4-bit con QAT, BF16) | Apache 2.0 | Ficheros oficiales compatibles con llama.cpp estándar |
| jialinyyzz/humanizer-GGUF | 12B | Reescritura humanizadora (en, zh) | GGUF estándar | Apache 2.0 | Incluye cuantizaciones conscientes de cuantización (QAT) en 2, 3 y 4 bits |

## Limitaciones y advertencias

- Los ficheros no funcionan con llama.cpp estándar, LM Studio, Ollama ni otras builds: requieren el fork ROCmFPX construido desde el 23 de octubre de 2026 o posterior.
- Según el propio autor del repo, estos ficheros aún no se han probado en hardware AMD real.
- No es una release oficial de humanizer; el crédito del modelo corresponde a sus autores originales.
- El modelo funciona por completado de texto, no en modo chat: exige usar el formato de prompt de `prompt_format.json` con el sufijo `\n\n### Rewritten:\n\n` y un muestreo concreto (temperature 1.0, top-p 0,95, top-k 0, min-p 0, repeat penalty 1,0).
- En 4 bits, las variantes ROCmFP4 pierden más fidelidad (KL 0,040–0,047) que un Q4_K_M estándar (0,0186); si la calidad es prioritaria y la memoria no es limitante, conviene el fichero de 8 bits.
- Riesgo de alucinación o alteración de datos en la reescritura: aunque las pruebas de fidelidad factual fueron satisfactorias, no hay garantías en textos reales; conviene verificar datos en producción.
- Soporte de idiomas limitado a inglés y chino; no está diseñado para castellano ni otros idiomas.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Las mediciones KL se hicieron sobre texto general (wikitext-2), no sobre datos de reescritura, por lo que pueden no reflejar exactamente el comportamiento en la tarea real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Harsha001/humanizer-12b-ROCmFPX
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- GGUF oficial del autor (incluye BF16 y QAT 2/3/4-bit): https://huggingface.co/jialinyyzz/humanizer-GGUF
- Fork ROCmFPX usado para cuantizar: https://github.com/HarshaVardhan3002/ROCmFPX
- Proyecto ROCmFPX original: https://github.com/charlie12345/ROCmFPX
