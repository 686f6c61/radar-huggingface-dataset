# pfnet/plamo-3-translate-8b-NVFP4

## Resumen

PLaMo 3 Translate 8B NVFP4 es la variante cuantizada a NVFP4 (pesos y activaciones en FP4 de 4 bits) del modelo de traducción especializado PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN, Japón). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se afina posteriormente con decenas de miles de millones de tokens de datos orientados a traducción. Está pensado para traducción automática de alta calidad entre 53 idiomas, con capacidades adicionales de contexto y glosario.

El modelo resuelve el problema de la traducción multilingüe de calidad en producción con un coste de inferencia reducido: la cuantización NVFP4 permite ejecutar un modelo de 8B con pesos y activaciones de 4 bits, manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16. La arquitectura subyacente es un transformer decoder-only (la model card no detalla la arquitectura interna concreta), con un total real de 5.184.696.576 parámetros en safetensors y una longitud máxima de entrenamiento de 32.768 tokens para entrada y salida combinadas.

Es relevante ahora porque la familia PLaMo 3 Translate se publica en cuatro tamaños (0.8B, 2B, 8B y 31B) con múltiples formatos de distribución (BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX), y PFN afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de su evaluación. Esta variante NVFP4 está orientada a despliegues eficientes en GPUs con soporte de FP4, especialmente NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalle interno no disponible) |
| Parametros totales | 5.184.696.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (maximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en FP4, 4 bits); familia con BF16, FP8, W4A16, W4AFP8, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (other) |
| Formato de pesos | safetensors con compressed-tensors (custom_code, transformers, vLLM) |

## Arquitectura y entrenamiento

La model card no especifica el detalle de la arquitectura interna más allá de tratarse de un LLM transformer decoder-only. El modelo base PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se afina posteriormente con "decenas de miles de millones de tokens" de datos centrados en traducción. La model card no detalla la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal de esta variante es la cuantización NVFP4 de pesos y activaciones, implementada mediante compressed-tensors y compatible con vLLM. En GPUs anteriores a NVIDIA Blackwell, la model card indica que debe añadirse `--linear-backend=emulation --enforce-eager` para reproducir la misma ruta de activación FP4 empleada en su evaluación. El modelo admite contexto y glosario como entradas adicionales, y permite elegir entre estilo llano y estilo cortés para la salida en japonés.

## Capacidades

- Traducción automática entre 53 idiomas, incluyendo pares que no involucran al inglés o al japonés.
- Traducción condicionada por contexto circundante (documento o conversación previa).
- Traducción asistida por glosario, útil para terminología técnica o de marca.
- Control de estilo de salida en japonés: estilo llano o estilo cortés.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Capacidades multilingües amplias (53 idiomas de Europa, Asia, Oriente Medio y África).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede procesar pasajes largos en una sola pasada (hasta 32.768 tokens combinados) y aplicar un glosario para mantener terminología consistente entre versiones de un manual.
- Localización de productos y marketing: el control de estilo llano o cortés en japonés permite adaptar el tono de los textos según el público, y el soporte de 53 idiomas cubre mercados de Europa, Asia y Oriente Medio con un único modelo.
- Traducción de conversaciones de atención al cliente: el modelo puede aprovechar el contexto circundante para resolver referencias y elipsis en diálogos multi-turno, lo que mejora la coherencia frente a traducciones frase a frase.
- Traducción jurídica o médica asistida por glosario: la posibilidad de inyectar terminología específica reduce la variabilidad terminológica en dominios regulados.
- Procesamiento por lotes de contenido editorial: la variante NVFP4 reduce el coste por token en GPUs Blackwell, lo que la hace adecuada para pipelines de traducción masiva de artículos, fichas de producto o subtítulos.
- Integración en CMS y herramientas de autoría: al ejecutarse en vLLM con el mismo comando que la versión BF16, puede desplegarse como servicio interno de traducción al que llamen editores y plataformas de publicación.
- Investigación en traducción automática: la disponibilidad de cuatro tamaños y siete formatos permite comparar el efecto de la cuantización en la calidad de traducción con una misma familia de modelos.

## Benchmarks y rendimiento

La model card presenta resultados únicamente en forma de figura (`figures/benchmark_en.png`), sin valores numéricos en texto. La información disponible indica lo siguiente:

- La fila superior de la figura muestra calidad de traducción japonés–inglés como media de PFTB, SaaS y WMT24++ COMET-22.
- La fila central muestra traducción entre japonés y otros 14 idiomas, como media de FLORES+ chrF++ en ambas direcciones.
- La fila inferior muestra traducción entre inglés y otros 14 idiomas, también como media de FLORES+ chrF++ en ambas direcciones.
- Los 15 idiomas evaluados en FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso.
- La model card afirma que "incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas", citando a TranslateGemma y HY-MT2 como comparadores.

No se han publicado valores numéricos de benchmarks en la información disponible; no se inventan cifras.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,1 GB, lo que da una referencia del tamaño de pesos en NVFP4; la VRAM real de inferencia debe sumar caché KV para hasta 32.768 tokens y overhead de runtime (no cuantificado en la información disponible).
- GPUs recomendadas: NVIDIA Blackwell para la ruta FP4 nativa; en GPUs anteriores debe usarse `--linear-backend=emulation --enforce-eager` para reproducir la ruta de activación FP4 de la evaluación.
- GPU de consumo: por tamaño de pesos (6,1 GB) el modelo podría caber en GPUs de consumo con suficiente VRAM, pero la información disponible no confirma compatibilidad ni rendimiento en tarjetas concretas.
- Opciones de despliegue: vLLM (soporte explícito en la model card, con el mismo comando que BF16), transformers con `custom_code` y compressed-tensors. No se mencionan llama.cpp, Ollama ni TGI para esta variante NVFP4; la familia sí ofrece GGUF y MLX en repositorios separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B NVFP4 | 5.184.696.576 | 32.768 (entrada + salida) | 53 | plamo-community-license | NVFP4 (safetensors) |
| PLaMo 3 Translate 8B BF16 | no disponible | 32.768 (entrada + salida) | 53 | plamo-community-license | BF16 |
| PLaMo 3 Translate 2B | no disponible | no disponible | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 aparecen citados en la model card como modelos de traducción comparados en la evaluación, pero la información disponible no incluye sus especificaciones ni sus resultados numéricos.

## Limitaciones y advertencias

- La licencia plamo-community-license permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- La cuantización NVFP4 puede degradar ligeramente la calidad de traducción respecto a BF16; la model card incluye una sección plegada sobre cambios de precisión que no se ha podido leer en la información disponible.
- El límite de 32.768 tokens es combinado de entrada y salida; los documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- No se documentan sesgos específicos del modelo en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir traducciones plausibles pero incorrectas en dominios muy especializados sin glosario.
- El rendimiento óptimo en FP4 requiere GPUs NVIDIA Blackwell; en otras GPUs la emulación puede reducir el throughput.
- No se documentan capacidades de tool calling, agentes ni visión, por lo que no debe asumirse su uso como modelo generalista.
- La fecha de creación del repositorio (2026-10-27) y la referencia a modelos como TranslateGemma y HY-MT2 no se pueden verificar con la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4
- Modelo base (BF16): https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit
- Modelo 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4/blob/main/README_ja.md
