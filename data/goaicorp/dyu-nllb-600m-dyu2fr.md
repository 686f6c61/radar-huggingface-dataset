# goaicorp/dyu-nllb-600M-dyu2fr

## Resumen

El modelo `goaicorp/dyu-nllb-600M-dyu2fr` es un ajuste fino (fine-tune) especializado en traducción bidireccional entre el diyula (dyu, también conocido como jula o dyula, lengua mandé hablada principalmente en Burkina Faso, Costa de Marfil y Malí) y el francés. Lo desarrolla goaicorp, un perfil de Hugging Face sin documentación pública adicional en la información disponible, y parte del modelo base `facebook/nllb-200-distilled-600M` de Meta AI, un transformer encoder-decoder de la familia NLLB (No Language Left Behind) destilado a 600 millones de parámetros.

La relevancia de este modelo radica en su carácter de recurso de baja disponibilidad: las lenguas mandé de África Occidental cuentan con poquísimos modelos de traducción automática de calidad y con licencias abiertas. Al estar construido sobre NLLB-200, hereda la arquitectura m2m_100 y el tokenizador SentencePiece multilingüe de Meta, lo que facilita su integración en pipelines existentes de `transformers`.

El modelo está publicado con acceso restringido (gated) en Hugging Face, requiere aceptar condiciones de uso y se distribuye bajo licencia CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición bajo la misma licencia. Con solo 2 descargas y 0 likes en el momento de la ficha, se trata de un artefacto muy reciente y de nicho, sin validación comunitaria extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, NLLB-200 distilled) |
| Parametros totales | 615.073.792 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (NLLB-200 base soporta hasta 512 tokens de entrada; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | dyu (diyula), fr (frances) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Modelo base | facebook/nllb-200-distilled-600M |
| Pipeline | translation (text2text-generation) |
| Dataset de ajuste | goaicorp/dyu-fr-parallel |
| Acceso | restringido (gated) en Hugging Face |
| Tamano del repositorio | 39.4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de NLLB-200 distilled, un transformer encoder-decoder de tipo m2m_100 con 600 millones de parámetros, diseñado originalmente por Meta AI para traducción multilingüe masiva (200 idiomas). El modelo emplea un tokenizador SentencePiece compartido y etiquetas de idioma (`src_lang` / `forced_bos_token_id`) para dirigir la traducción, mecanismo que este fine-tune conserva.

El ajuste se ha realizado sobre el dataset `goaicorp/dyu-fr-parallel`, un corpus paralelo diyula-francés publicado por el mismo autor. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. Tampoco se documentan innovaciones técnicas adicionales más allá de la herencia directa de NLLB-200. El nombre del repositorio (`dyu2fr`) sugiere una especialización en la dirección diyula→francés, aunque los tags declaran ambos idiomas.

## Capacidades

- Traducción automática de texto entre diyula y francés (dirección principal declarada: dyu→fr).
- Generación texto-a-texto mediante el pipeline `translation` de `transformers`.
- Compatible con `text2text-generation` y con la API estándar de NLLB (uso de `src_lang="dyu_Latn"` y `forced_bos_token_id` para `fra_Latn`, sujeto a verificación).
- Soporte de `endpoints_compatible` según los tags, lo que indica compatibilidad con Hugging Face Inference Endpoints.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas a los dos idiomas del ajuste; el resto de lenguas de NLLB-200 no están garantizadas tras el fine-tune.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al diyula: el modelo permite convertir materiales en francés a diyula para comunidades de Burkina Faso, Costa de Marfil y Malí, donde el francés no es la lengua materna de la mayoría de la población.
- Localización de interfaces y aplicaciones móviles: integrado en un backend de traducción, puede generar cadenas de UI en diyula a partir de las versiones francesas, reduciendo el coste de localización manual para mercados de África Occidental.
- Subtitulado y transcripción asistida: combinado con un ASR en francés, el modelo puede traducir transcripciones al diyula para medios comunitarios y radios rurales.
- Atención al ciudadano en servicios públicos: permite desplegar chatbots o formularios bilingües francés-diyula en oficinas de registro civil, salud o agricultura, con revisión humana dado el bajo volumen de validación del modelo.
- Investigación lingüística y preservación: sirve como base para estudiar fenómenos de traducción en lenguas mandé y para generar corpus paralelos adicionales que alimenten futuros modelos.
- Educación y alfabetización: traducción de materiales escolares y contenidos de formación profesional al diyula, aprovechando que el modelo es ligero (600M) y puede ejecutarse en infraestructura modesta.
- Evaluación comparativa de traducción de bajos recursos: útil como baseline en trabajos académicos sobre lenguas de bajos recursos, dado su origen NLLB y su licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas BLEU, chrF, COMET ni evaluaciones humanas, y no se dispone de comparaciones cuantitativas con otros sistemas de traducción diyula-francés.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos (615M parámetros × 4 bytes), más activaciones y KV cache; en la práctica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos; entre 2 y 3 GB con overhead.
- VRAM estimada en int8: en torno a 0,7-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, T4 o incluso una GTX 1650 de 4 GB deberían ser suficientes en fp16.
- Cabe holgadamente en GPU de consumo (RTX 20xx, 30xx, 40xx) y en GPUs de datacenter (A10, L4, A100, H100) con enorme margen.
- Opciones de despliegue: `transformers` con `pipeline("translation")`, Text Generation Inference (TGI) para `text2text-generation`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y conversión a ONNX o CTranslate2 para servir con mayor throughput. No se documentan pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles. Como referencia orientativa de la familia NLLB-600M distilled, un batch pequeño en GPU moderna suele procesar decenas de frases por segundo, pero no hay medición publicada para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| goaicorp/dyu-nllb-600M-dyu2fr | 615M | no disponible | dyu, fr | CC BY-SA 4.0 | gated |
| facebook/nllb-200-distilled-600M | 615M | 512 tokens (aprox.) | 200 idiomas (incluye dyu y fra) | CC BY-NC 4.0 | abierto |
| facebook/m2m100_418M | 418M | 1024 tokens (aprox.) | 100 idiomas | MIT | abierto |
| Helsinki-NLP/opus-mt-fr-* | variable (~75M) | 512 tokens (aprox.) | pares bilingues | CC BY 4.0 (segun par) | abierto |

El modelo de goaicorp se diferencia del NLLB-200 original en que está especializado en un par concreto y se distribuye bajo CC BY-SA 4.0 (permite uso comercial con atribución y copyleft), mientras que NLLB-200 de Meta usa CC BY-NC 4.0 (no comercial). Frente a m2m100_418M, es algo mayor y hereda la cobertura de 200 idiomas en el preentrenamiento, aunque el fine-tune restringe su uso efectivo al par dyu-fr. No se dispone de comparaciones de calidad (BLEU/chrF) entre estas alternativas para el par diyula-francés.

## Limitaciones y advertencias

- El repositorio es de acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear automatizaciones y despliegues en CI.
- Licencia CC BY-SA 4.0: obliga a atribuir al autor y a compartir obras derivadas bajo la misma licencia; conviene revisar compatibilidad con licencias propietarias en productos comerciales.
- El modelo base NLLB-200 distilled tiene sesgos conocidos hacia ciertos dominios y variedades lingüísticas; el fine-tune puede heredarlos y amplificarlos si el dataset `dyu-fr-parallel` no es diverso.
- Riesgo de alucinación en traducción: como todo modelo generativo, puede producir contenido no presente en el original, especialmente con entradas largas, ruidosas o fuera de dominio.
- Sin métricas publicadas: no hay BLEU, chrF ni evaluaciones humanas, por lo que la calidad real en producción es desconocida y debe validarse empíricamente.
- Cobertura limitada a dyu y fr: el resto de lenguas de NLLB-200 no están garantizadas tras el ajuste y pueden degradarse.
- Contexto máximo no documentado: aunque NLLB-200 admite hasta 512 tokens, no se confirma que este fine-tune respete ese límite ni cómo se comporta con secuencias más largas.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita su uso en entornos de CPU o GPUs muy pequeñas sin conversión manual.
- Trazabilidad escasa: no se documentan hiperparámetros, tamaño del dataset ni proceso de validación, lo que dificulta reproducir o auditar el ajuste.
- El diyula tiene variación ortográfica y dialectal considerable; el modelo puede no cubrir todas las variedades y producir traducciones sesgadas hacia la norma del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goaicorp/dyu-nllb-600M-dyu2fr
- Dataset de ajuste: https://huggingface.co/datasets/goaicorp/dyu-fr-parallel
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Repositorio NLLB en GitHub: https://github.com/facebookresearch/fairseq/tree/nllb
- Perfil del autor: https://huggingface.co/goaicorp
