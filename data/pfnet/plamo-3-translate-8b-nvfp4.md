# pfnet/plamo-3-translate-8b-NVFP4

## Resumen

PLaMo 3 Translate 8B NVFP4 es la variante cuantizada a NVFP4 (pesos y activaciones en FP4) del modelo de traducción especializado PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se afina posteriormente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre traducción entre 53 idiomas, admite contexto adicional y glosarios como entrada, y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

La relevancia de esta variante concreta es la eficiencia: al cuantizar pesos y activaciones a NVFP4, el repositorio ocupa unos 6,1 GB y los pesos declarados suman 5.184.696.576 parámetros, lo que facilita el despliegue en GPUs con memoria limitada manteniendo, según el autor, el mismo comando de lanzamiento en vLLM que la versión BF16. La licencia es la PLaMo Community License, con uso personal, académico y no comercial gratuito y condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3); detalles internos no disponibles |
| Parametros totales | 5.184.696.576 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens combinando entrada y salida (máximo durante entrenamiento) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en FP4); el autor ofrece además FP8, W4A16, W4AFP8, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas, entre ellos ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors con compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3. El modelo base, PLaMo 3 Translate 8B, parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se afina después con decenas de miles de millones de tokens de datos centrados en traducción. La información disponible no detalla la composición exacta del dataset, el número total de tokens de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable de esta variante es la cuantización NVFP4 de pesos y activaciones mediante compressed-tensors, pensada para GPUs NVIDIA Blackwell. En GPUs anteriores a Blackwell, el autor indica que puede reproducirse la misma ruta de activaciones FP4 usada en su evaluación añadiendo `--linear-backend=emulation --enforce-eager` al lanzamiento en vLLM. El modelo admite contexto adicional y glosarios como parte de la entrada, y permite seleccionar el estilo de salida en japonés (llano o cortés).

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares japonés-inglés y combinaciones con 14 idiomas adicionales evaluadas en FLORES+.
- Traducción con contexto circundante: el modelo puede tener en cuenta texto previo o posterior para desambiguar.
- Traducción asistida por glosario: permite imponer terminología concreta en la salida.
- Control de estilo en japonés: elección entre registro llano y cortés.
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinando entrada y salida.
- Generación de texto multilingüe derivada del pipeline de traducción (pipeline_tag: translation).
- Compatibilidad con vLLM y transformers, incluyendo custom_code del modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Localización de documentación técnica: traducir manuales y referencias de API entre inglés y japonés o español aprovechando la ventana de 32.768 tokens para procesar secciones completas sin fragmentar el contexto.
- Traducción de contratos y textos legales con glosario: imponer terminología corporativa o jurídica mediante el glosario de entrada para mantener consistencia terminológica entre documentos.
- Atención al cliente multilingüe: traducir conversaciones multi-turno entre 53 idiomas, usando el contexto previo de la conversación para resolver referencias y ambigüedades.
- Subtitulado y doblaje: traducir guiones con contexto circundante y control de estilo en japonés (llano o cortés) según el registro del contenido.
- Traducción de artículos académicos y científicos: el modelo se apoya en PLaMo 3 NICT y en decenas de miles de millones de tokens de traducción, adecuado para textos densos con terminología especializada.
- Procesamiento por lotes en pipelines de datos: desplegado con vLLM sobre GPUs Blackwell, el formato NVFP4 reduce la huella de memoria y permite servir traducciones a escala con el mismo comando que la versión BF16.
- Traducción en el borde o en GPUs de gama media: la cuantización FP4 y el tamaño de repositorio de 6,1 GB facilitan el despliegue en entornos con VRAM limitada.

## Benchmarks y rendimiento

El autor publica una figura comparativa (no una tabla de valores numéricos en el texto) con la calidad de traducción de PLaMo 3 Translate frente a TranslateGemma y HY-MT2. Las métricas empleadas son:

| Evaluación | Métrica | Idiomas |
|---|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | ja-en |
| Japonés frente a 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | ja y 14 idiomas |
| Inglés frente a 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | en y 14 idiomas |

Los 15 idiomas seleccionados para FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. No se han publicado valores numéricos desglosados de benchmarks en la información disponible, ni resultados específicos de esta variante NVFP4 más allá de la referencia a los cambios de precisión por cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,1 GB en NVFP4; se requiere memoria adicional para el contexto (hasta 32.768 tokens) y el runtime de vLLM.
- GPUs recomendadas: NVIDIA Blackwell para la ruta NVFP4 nativa; en GPUs anteriores puede usarse `--linear-backend=emulation --enforce-eager` para reproducir la ruta de activaciones FP4 de la evaluación.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-12 GB de VRAM o más, dado el tamaño del repositorio, aunque el autor no publica cifras exactas de VRAM por configuración.
- Opciones de despliegue: vLLM (soporte explícito en las etiquetas y en la model card), transformers con custom_code; el autor ofrece además GGUF y MLX-4bit en repositorios separados para otros runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B NVFP4 | 5.184.696.576 | 32.768 (entrada + salida) | 53 | PLaMo Community License | NVFP4 (safetensors); FP8, W4A16, W4AFP8, GGUF y MLX en repos separados |
| PLaMo 3 Translate 8B (BF16) | 8B (denominación del autor) | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16 |
| PLaMo 3 Translate 2B | 2B (denominación del autor) | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | No disponible | No disponible | No disponible | No disponible | No disponible |
| HY-MT2 | No disponible | No disponible | No disponible | No disponible | No disponible |

TranslateGemma y HY-MT2 aparecen como modelos de comparación en la figura de benchmarks del autor, pero no se proporcionan sus especificaciones en la información disponible.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación de calidad frente a BF16; el autor remite a la sección "Accuracy changes from quantization" de la model card para consultar los cambios de precisión, cuyos valores no se detallan en la información disponible.
- El límite de 32.768 tokens es la suma de entrada y salida: los textos más largos deben dividirse, lo que puede romper la coherencia en documentos muy extensos.
- Uso comercial restringido: la PLaMo Community License permite uso personal, académico y no comercial gratuito sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no debe asumirse que el modelo las soporte.
- Riesgo de alucinación y de errores de traducción en dominios muy especializados o en pares de idiomas poco representados; el uso de glosario y contexto mitiga parcialmente este riesgo.
- No se han publicado datos de sesgos en la información disponible.
- El soporte NVFP4 nativo requiere GPUs NVIDIA Blackwell; en hardware anterior el rendimiento puede verse afectado por la emulación.
- El modelo está pensado para traducción; su uso como LLM generalista no está validado por el autor.

## Enlaces

- [HuggingFace: pfnet/plamo-3-translate-8b-NVFP4](https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4)
- [Modelo base BF16: pfnet/plamo-3-translate-8b](https://huggingface.co/pfnet/plamo-3-translate-8b)
- [Variante 0.8B NVFP4](https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4)
- [Variante 2B NVFP4](https://huggingface.co/pfnet/plamo-3-translate-2b-NVFP4)
- [Variante 31B NVFP4](https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4)
- [Variante 8B GGUF](https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF)
- [Variante 8B MLX-4bit](https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit)
- [Licencia PLaMo Community License (inglés)](https://plamo.preferredai.jp/info/plamo-community-license-en)
- [Blog técnico de PFN sobre la release de pesos](https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release)
- [README en japonés](README_ja.md)
