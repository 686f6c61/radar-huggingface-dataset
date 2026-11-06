# Mugunth123/sarvam-translate-8bit-GGUF

## Resumen

Mugunth123/sarvam-translate-8bit-GGUF es una cuantización de 8 bits en formato GGUF del modelo sarvamai/sarvam-translate, un modelo fundacional de traducción multilingüe desarrollado por Sarvam AI en colaboración con AI4Bharat y construido sobre Gemma 3 4B-IT de Google DeepMind. Este repositorio concreto no es un modelo original, sino un artefacto de distribución que empaqueta los pesos del modelo base en cuantización Q8_0 (8,50 bits por peso) para su uso con llama.cpp y otros runners compatibles con GGUF.

El modelo resuelve la traducción bidireccional entre inglés y las 22 lenguas programadas de la India, un espacio lingüístico escasamente cubierto por los modelos generalistas. Con 3.880.263.168 parámetros y una ventana de contexto de hasta 8.192 tokens, la versión Q8_0 ocupa 3,84 GB frente a los 8,1 GB del modelo sin cuantizar, lo que reduce los requisitos de memoria a aproximadamente 5 GB de RAM sin sacrificar fidelidad de salida.

Es relevante ahora porque permite desplegar un traductor especializado de alta calidad en hardware de consumo (GPU de 8 GB o incluso CPU), algo inviable con el modelo original en 16 bits. La licencia GPL-3.0, heredada del modelo base, condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B): GQA con 8 cabezas Q y 4 cabezas KV, 34 capas |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens |
| Tipos de cuantizacion | Q8_0 (8 bits, 8,50 BPW); existen variantes IQ1_S, IQ1_M, IQ2_M y Q4_K_M en otros repos del mismo autor |
| Idiomas soportados | as, bn, brx, doi, gom, gu, en, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (22 lenguas programadas de la India + inglés) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (sarvam-translate-Q8_0.gguf, 3,84 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B-IT, un transformer decoder-only con atención de consultas agrupadas (GQA) configurada con 8 cabezas de consulta y 4 cabezas de clave-valor sobre 34 capas. Esta configuración reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa, lo que facilita el despliegue con contextos largos. La ventana de contexto efectiva en esta distribución se documenta hasta 8.192 tokens.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF o DPO específicas para la tarea de traducción. El modelo base fue desarrollado por Sarvam AI con AI4Bharat sobre los pesos de Gemma 3 de Google DeepMind, y esta distribución se limita a la conversión a GGUF en Q8_0 mediante llama.cpp, sin modificar los pesos más allá de la cuantización.

## Capacidades

- Traducción bidireccional entre inglés y las 22 lenguas programadas de la India: asamés, bengalí, bodo, dogri, guyaratí, hindi, canarés, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, odia, panyabí, sánscrito, santalí, sindhi, tamil, telugu y urdu.
- Generación de texto conversacional mediante el formato de plantilla de turnos de Gemma 3 (`<start_of_turn>user ... <end_of_turn>`).
- Traducción condicionada por instrucción en lenguaje natural (por ejemplo, "Translate the text below to Hindi").
- Decodificación determinista con temperatura 0,0, adecuada para traducción reproducible.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica al hindi y otras lenguas indias: el modelo acepta instrucciones en lenguaje natural y devuelve la traducción con temperatura 0,0, lo que permite integrarlo en pipelines de localización de documentación con resultados reproducibles.
- Atención al cliente multilingüe en el mercado indio: con 8.192 tokens de contexto puede procesar conversaciones multi-turno y traducir respuestas entre inglés y la lengua del usuario en tiempo real.
- Localización de interfaces y textos de producto: la cuantización Q8_0 preserva la fidelidad de salida, lo que resulta adecuado para cadenas de UI donde pequeños errores de traducción son visibles.
- Traducción de contenido editorial y periodístico: el soporte de 22 lenguas cubre medios regionales que rara vez disponen de traductores automáticos de calidad.
- Procesamiento por lotes en CPU: con 3,84 GB de pesos y unos 5 GB de RAM, puede ejecutarse en servidores sin GPU para traducir grandes volúmenes de texto de forma económica.
- Investigación en lingüística computacional de lenguas indias: sirve como referencia cuantizada para experimentos de evaluación de traducción en lenguas de bajos recursos como bodo, santalí o manipuri.
- Despliegue en dispositivos con GPU de consumo: cabe en tarjetas de 8 GB de VRAM con offload completo de capas, lo que habilita prototipos locales sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 5 GB de memoria para inferencia con Q8_0 (3,84 GB de pesos más caché KV y overhead del runtime).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM permite offload completo de capas (`n_gpu_layers=-1`); tarjetas como RTX 3060 8 GB, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- GPU de consumo: sí, cabe en la mayoría de GPU consumer con 8 GB o más. También es viable en CPU pura con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, y cualquier runner compatible con GGUF (Ollama, LM Studio, text-generation-webui). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mugunth123/sarvam-translate-8bit-GGUF | 3,88 B | 8.192 | GGUF Q8_0 | GPL-3.0 | Cuantización 8 bits del modelo Sarvam |
| sarvamai/sarvam-translate (base) | 3,88 B | 8.192 | safetensors | GPL-3.0 | Modelo original sin cuantizar, 8,1 GB |
| Mugunth123/sarvam-translate-4bit-GGUF | 3,88 B | 8.192 | GGUF Q4_K_M | GPL-3.0 | Variante de 2,31 GB, menor fidelidad |
| Mugunth123/sarvam-translate-1bit-GGUF | 3,88 B | 8.192 | GGUF IQ1_S | GPL-3.0 | Variante de 1,05 GB, fidelidad muy reducida |

## Limitaciones y advertencias

- La licencia GPL-3.0 es copyleft fuerte: el uso comercial requiere cumplir con las obligaciones de distribución del código fuente, lo que puede ser incompatible con productos propietarios.
- Al ser una cuantización de 8 bits, existe una degradación mínima pero no nula respecto al modelo en 16 bits; para tareas de altísima sensibilidad conviene validar contra el modelo original.
- Riesgo de alucinación inherente a los modelos generativos: puede producir traducciones plausibles pero incorrectas en textos ambiguos, técnicos o con jerga regional.
- El alcance lingüístico se limita a inglés y las 22 lenguas programadas de la India; no cubre otras lenguas indias no programadas ni idiomas fuera de ese conjunto.
- La ventana de contexto de 8.192 tokens limita la traducción de documentos largos en una sola pasada; requiere segmentación.
- No se documentan salvaguardas específicas contra sesgos de género, casta o registro lingüístico en las lenguas cubiertas.
- El repositorio tiene 73 descargas y 0 likes, con fecha de creación reciente; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mugunth123/sarvam-translate-8bit-GGUF
- Modelo base: https://huggingface.co/sarvamai/sarvam-translate
- Cuantización 1-bit: https://huggingface.co/Mugunth123/sarvam-translate-1bit-GGUF
- Cuantización 1.58-bit: https://huggingface.co/Mugunth123/sarvam-translate-1.58bit-GGUF
- Cuantización 2-bit: https://huggingface.co/Mugunth123/sarvam-translate-2bit-GGUF
- Cuantización 4-bit: https://huggingface.co/Mugunth123/sarvam-translate-4bit-GGUF
