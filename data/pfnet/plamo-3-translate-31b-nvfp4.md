# pfnet/plamo-3-translate-31b-NVFP4

## Resumen

PLaMo 3 Translate 31B NVFP4 es la variante cuantizada a NVFP4 (pesos y activaciones en FP4) del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado posteriormente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre traducción entre 53 idiomas, admite contexto y glosarios como entradas adicionales y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que la suma de entrada y salida no supere ese límite.

La relevancia de esta variante NVFP4 radica en que reduce el coste de memoria y acelera la inferencia en GPUs con soporte de FP4 (arquitectura NVIDIA Blackwell), manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16. El repositorio declara 18.104.997.376 parámetros reales en safetensors y un tamaño de 18,7 GB, aunque la nomenclatura comercial del modelo sea "31B".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, con código personalizado `custom_code`); detalles de capas y atención no disponibles |
| Parametros totales | 18.104.997.376 (según safetensors); la nomenclatura comercial indica 31B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en FP4); el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, educativo y no comercial gratuito sin registro; condiciones comerciales aparte) |
| Formato de pesos | safetensors con `compressed-tensors`, compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, empaquetado con código personalizado (`custom_code`) y cuantizado mediante `compressed-tensors` a NVFP4, con pesos y activaciones en FP4. El modelo base, PLaMo 3 Translate 31B, parte de PLaMo 3 NICT (preentrenamiento conjunto de PFN y NICT) y se afina después con decenas de miles de millones de tokens de datos centrados en traducción. La model card no detalla el número exacto de capas, dimensiones ocultas ni la composición del dataset, por lo que esos datos figuran como no disponibles.

La innovación principal de esta distribución es la cuantización NVFP4, que en GPUs Blackwell permite ejecutar el modelo con menor huella de memoria y mayor throughput. Para reproducir la misma ruta de activaciones FP4 que en la evaluación de PFN en GPUs anteriores a Blackwell, la model card indica añadir `--linear-backend=emulation --enforce-eager` al lanzamiento en vLLM. No se documentan en la información disponible detalles sobre RLHF/DPO ni sobre decodificación especulativa.

## Capacidades

- Traducción entre 53 idiomas, incluyendo combinaciones con japonés, inglés, español, chino (simplificado y tradicional), coreano, árabe, hindi, tailandés, vietnamita y ruso, entre otros.
- Traducción con contexto adicional: el modelo puede tener en cuenta el texto circundante para resolver ambigüedades y mantener coherencia terminológica.
- Traducción con glosario: admite glosarios para forzar terminología concreta.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés en la salida.
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinando entrada y salida.
- Generación de texto y pipeline de `translation` en transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Localización de documentación técnica: traducir manuales y guías con glosario propio para mantener terminología consistente entre versiones y equipos, aprovechando la entrada de glosario del modelo.
- Traducción de contratos y textos jurídicos entre japonés e inglés: el soporte de contexto permite resolver referencias anafóricas y mantener registro formal, con revisión humana posterior.
- Atención al cliente multilingüe: traducir tickets y conversaciones entre 53 idiomas en tiempo real, con el modelo desplegado en vLLM sobre GPUs Blackwell para reducir coste por token.
- Subtitulado y doblaje: traducir guiones y subtítulos de vídeo con contexto de escena, ajustando el estilo de salida en japonés (llano o cortés) según el registro del contenido.
- Comercio electrónico internacional: traducir fichas de producto, descripciones y reseñas entre idiomas europeos y asiáticos, con glosarios por categoría de producto para evitar inconsistencias de marca.
- Investigación en traducción automática: usar el modelo como referencia o baseline cuantizado en experimentos con FLORES+ y WMT24++, comparando la variante NVFP4 con BF16 en métricas COMET-22 y chrF++.
- Traducción de documentación de software open source: integrar el modelo en pipelines de CI/CD para generar versiones localizadas de README y guías al publicar nuevas releases, con control de estilo y glosario por proyecto.

## Benchmarks y rendimiento

La model card publica gráficas de calidad de traducción (no tablas numéricas) comparando PLaMo 3 Translate con TranslateGemma y HY-MT2, con las siguientes métricas agregadas:

- Japonés–inglés: media de PFTB, SaaS y WMT24++ con COMET-22.
- Japonés frente a 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Inglés frente a 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas evaluados en FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. La model card afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. No se han publicado los valores numéricos de los benchmarks en la información disponible, por lo que no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 18,7 GB en NVFP4; en inferencia hay que sumar caché KV para hasta 32.768 tokens de contexto, por lo que conviene prever margen adicional sobre esos 18,7 GB.
- GPUs recomendadas: NVIDIA Blackwell (B100, B200, RTX 50xx) para aprovechar la ruta FP4 nativa; en GPUs anteriores se puede ejecutar con `--linear-backend=emulation --enforce-eager`, con menor rendimiento.
- GPU de consumo: no disponible de forma confirmada; por tamaño de pesos, una GPU de 24 GB podría alojar los pesos, pero la ruta FP4 nativa requiere Blackwell.
- Despliegue: vLLM (soporte declarado en los tags y en la model card) y transformers. No se indica soporte de llama.cpp, Ollama ni TGI para esta variante NVFP4; para esos entornos existen las variantes GGUF y MLX-4bit del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B NVFP4 | 18,1B reales (31B nominal) | 32.768 (entrada + salida) | 53 | PLaMo Community License | NVFP4 (safetensors, compressed-tensors) |
| PLaMo 3 Translate 31B BF16 | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16 |
| PLaMo 3 Translate 8B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción comparables en las gráficas de calidad, pero no aporta sus especificaciones técnicas en la información disponible.

## Limitaciones y advertencias

- Licencia PLaMo Community License: el uso personal, educativo y no comercial es gratuito sin registro, pero el uso comercial requiere condiciones adicionales que deben consultarse en el enlace de licencia.
- Límite de contexto: la ventana de 32.768 tokens cubre entrada y salida combinadas; los documentos más largos deben dividirse, con el riesgo de perder coherencia entre fragmentos.
- Especialización estrecha: el modelo está optimizado para traducción; su rendimiento en otras tareas generativas (razonamiento, código, agentes) no está documentado y no debería asumirse.
- Riesgo de alucinación y de deriva terminológica en textos muy especializados sin glosario; se recomienda revisión humana en dominios regulados.
- Sesgos: no se documentan en la información disponible análisis de sesgos por idioma, género o dominio.
- Cuantización NVFP4: puede introducir degradación de calidad frente a BF16; la model card incluye una sección sobre cambios de precisión por cuantización, pero sus valores no están disponibles en la información proporcionada.
- Compatibilidad: el modelo requiere `custom_code` y `compressed-tensors`; el soporte fuera de vLLM y transformers no está garantizado para esta variante.
- Idiomas de bajos recursos: aunque se listan 53 idiomas, la evaluación publicada en FLORES+ se limita a 15, por lo que la calidad en el resto no está verificada de forma pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4/blob/main/README_ja.md
