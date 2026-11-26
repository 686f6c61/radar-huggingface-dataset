# pfnet/plamo-3-translate-31b-W4AFP8

## Resumen

PLaMo 3 Translate 31B W4AFP8 es la variante cuantizada del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). Se trata de un LLM de 31.757.456.384 parámetros (aproximadamente 31,8 mil millones) construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y afinado posteriormente con decenas de miles de millones de tokens de datos centrados en traducción.

El modelo resuelve el problema de la traducción automática de alta calidad entre 53 idiomas, incluyendo pares que no involucran al inglés, y permite incorporar contexto circundante y glosarios en la petición, además de elegir entre estilo llano y estilo cortés en las salidas en japonés. La ventana de entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que habilita la traducción de pasajes largos en una sola pasada.

Esta variante concreta cuantiza los pesos a INT4 y las activaciones a FP8 (formato W4AFP8), reduciendo el repositorio a 17,2 GB frente a los aproximadamente 63 GB que ocuparía la versión BF16. Es relevante para despliegues en producción con vLLM, ya que mantiene el mismo comando de lanzamiento que la versión BF16 y está empaquetada con compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles especificos no disponibles); modelo base PLaMo 3 NICT |
| Parametros totales | 31.757.456.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas, maximo durante entrenamiento) |
| Tipos de cuantizacion | W4AFP8 (pesos INT4, activaciones FP8); el modelo base dispone de BF16, FP8, W4A16, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (other); uso personal, educativo y no comercial gratuito sin registro previo |
| Formato de pesos | safetensors con custom_code y compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer (etiqueta `plamo3` y `custom_code` en transformers). El modelo parte de PLaMo 3 NICT, un preentrenado desarrollado conjuntamente por PFN y NICT, sobre el que se realizo un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traduccion. No se especifica en la informacion proporcionada si hubo fases de RLHF o DPO, ni la composicion exacta del dataset.

La innovacion principal es la especializacion en traduccion con soporte de contexto circundante y glosarios, ademas de control de estilo (llano o cortes) para las salidas en japones. La longitud maxima de entrenamiento fue de 32.768 tokens sumando entrada y salida. Esta variante W4AFP8 aplica cuantizacion de pesos a INT4 y de activaciones a FP8 mediante compressed-tensors, manteniendo el mismo comando de lanzamiento en vLLM que la version BF16.

## Capacidades

- Traduccion multilingue entre 53 idiomas, incluyendo pares directos sin pasar por el ingles.
- Traduccion de pasajes largos en una sola pasada gracias a la ventana de 32.768 tokens (entrada + salida).
- Uso de contexto circundante para desambiguar terminos y mantener coherencia en documentos extensos.
- Soporte de glosarios para forzar terminologia concreta en la traduccion.
- Control de estilo en japones: salida en estilo llano o cortes.
- Generacion de texto y pipeline de traduccion (`translation`) en transformers.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede procesar secciones completas de hasta 32.768 tokens combinados y aplicar un glosario para mantener consistente la terminologia entre documentos.
- Localizacion de productos para 53 mercados: permite traducir directamente entre pares como espanol-japones o aleman-coreano sin pivotar por ingles, lo que reduce perdida de matiz.
- Atencion al cliente multilingue: integrado en un pipeline de traduccion en tiempo real, puede normalizar mensajes entrantes en cualquiera de los 53 idiomas al idioma del agente.
- Traduccion de contratos y textos legales: el uso de contexto circundante y glosarios ayuda a respetar terminos juridicos fijados por la organizacion.
- Subtitulado y transcripcion: la ventana de 32.768 tokens permite traducir bloques largos de dialogo manteniendo coherencia de nombres y referencias.
- Traduccion editorial con control de estilo: para japones, la eleccion entre estilo llano y cortes permite adaptar el registro al publico objetivo.
- Procesamiento por lotes en servidores con vLLM: la cuantizacion W4AFP8 reduce el peso del repositorio a 17,2 GB, lo que abarata el despliegue frente a BF16.

## Benchmarks y rendimiento

La model card incluye graficos comparativos (no tablas numericas) frente a TranslateGemma y HY-MT2, con las siguientes metricas agregadas:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Japones-ingles | Media de PFTB, SaaS y WMT24++ COMET-22 | Solo grafico, sin cifras en el texto |
| Japones y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | Solo grafico, sin cifras en el texto |
| Ingles y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | Solo grafico, sin cifras en el texto |

Idiomas evaluados en FLORES+: japones, ingles, arabe, indonesio, italiano, neerlandes, coreano, espanol, tailandes, chino simplificado y tradicional, aleman, frances, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traduccion comparados en todas las metricas de la figura. No se han publicado cifras numericas de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio W4AFP8 ocupa 17,2 GB; se recomienda al menos 24 GB de VRAM para dejar margen a la cache KV con contexto largo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y RTX 4090 para despliegues con contexto moderado; GPUs profesionales con soporte de FP8 (H100, L40S) aprovechan mejor las activaciones FP8.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares, con contexto reducido.
- Opciones de despliegue: vLLM (soporte explicito, mismo comando que BF16), transformers con `custom_code` y compressed-tensors. No se confirma soporte de llama.cpp u Ollama para esta variante (existe una version GGUF separada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B W4AFP8 | 31,8B | 32.768 | PLaMo Community License | safetensors (W4AFP8) | Especializado en traduccion, 53 idiomas |
| PLaMo 3 Translate 31B BF16 | 31,8B | 32.768 | PLaMo Community License | safetensors (BF16) | Misma calidad de referencia, ~63 GB |
| PLaMo 3 Translate 8B W4AFP8 | ~8B | 32.768 | PLaMo Community License | safetensors (W4AFP8) | Alternativa mas ligera de la misma familia |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | Comparado en la model card, sin cifras |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | Comparado en la model card, sin cifras |

## Limitaciones y advertencias

- La ventana de 32.768 tokens cubre entrada y salida combinadas; los textos mas largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- La cuantizacion W4AFP8 puede degradar ligeramente la calidad frente a BF16; la model card incluye tablas de cambios de precision por tamano, pero no se detallan cifras en la informacion disponible.
- La licencia PLaMo Community License es gratuita para uso personal, educativo y no comercial, pero el uso comercial requiere revisar los terminos especificos del enlace de licencia.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas en idiomas de bajos recursos dentro del conjunto de 53.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse que las tiene.
- El control de estilo (llano o cortes) solo se indica para japones; no se garantiza en otros idiomas.
- El modelo esta especializado en traduccion; su uso como LLM generalista no esta respaldado por la documentacion.

## Enlaces

- Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog tecnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japones: README_ja.md (en el repositorio)
- Variantes de la familia: plamo-3-translate-0.8b, plamo-3-translate-2b, plamo-3-translate-8b y plamo-3-translate-31b en sus formatos BF16, FP8, W4A16, NVFP4, GGUF y MLX-4bit
