# pfnet/plamo-3-translate-31b

## Resumen

PLaMo 3 Translate 31B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN), construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN continuó el entrenamiento con decenas de miles de millones de tokens de datos centrados en traducción, lo que da lugar a un modelo de 31.757.456.384 parámetros (aproximadamente 31,8 mil millones) orientado específicamente a tareas de traducción automática de alta calidad.

El modelo forma parte de una familia de cuatro tamaños (0,8B, 2B, 8B y 31B) y cubre la traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino, coreano, árabe, hindi y un largo etcétera de lenguas de Asia, Europa, Oriente Medio y África. Además de la traducción directa, admite contexto circundante y glosarios, y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima contemplada durante el entrenamiento es de 32.768 tokens sumando entrada y salida.

Su relevancia actual radica en que combina un tamaño considerable (31B) con una especialización explícita en traducción multilingüe, un nicho donde los modelos generalistas suelen quedar por detrás de soluciones dedicadas. Se distribuye bajo la licencia PLaMo Community License, con uso personal, académico y no comercial gratuito sin registro previo, y con condiciones específicas para uso comercial que deben consultarse antes de desplegarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (según tags `plamo3` y `custom_code`; detalles internos no disponibles) |
| Parámetros totales | 31.757.456.384 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantización | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit (variantes en repositorios separados) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito; condiciones específicas para uso comercial) |
| Formato de pesos | safetensors (BF16 y variantes cuantizadas); GGUF y MLX en repositorios aparte |

## Arquitectura y entrenamiento

La información disponible confirma que PLaMo 3 Translate 31B se basa en PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con "decenas de miles de millones de tokens" de datos orientados a traducción. No se detalla en la model card la arquitectura interna exacta (número de capas, dimensiones ocultas, tipo de atención, uso de MoE, etc.), aunque los tags `plamo3` y `custom_code` indican que requiere código personalizado en la librería `transformers` para su carga, algo habitual en arquitecturas propias no estándar. Tampoco se especifica si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

La innovación técnica destacable es la especialización: en lugar de un modelo generalista, se parte de un preentrenamiento base y se dedica una fase adicional masiva a datos de traducción, lo que permite obtener calidad "de clase mundial" según el autor. El modelo admite contexto circundante y glosarios como parte de la entrada, y en el caso del japonés permite controlar el registro (llano o cortés). El límite de 32.768 tokens se aplica a la suma de entrada y salida, por lo que para pasajes largos debe dividirse el texto de modo que ambos lados queden dentro de ese margen.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino, coreano, árabe, hindi, tailandés, vietnamita, ruso, francés, alemán, italiano, neerlandés, indonesio, turco y muchas otras lenguas de Asia, Europa, Oriente Medio y África.
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto que rodea al segmento a traducir para mejorar la coherencia.
- Traducción con glosario: permite imponer terminología específica, útil para dominios técnicos o corporativos.
- Control de estilo en japonés: elección entre registro llano y cortés en la salida.
- Traducción de pasajes largos en una sola pasada, siempre que entrada y salida combinadas no superen los 32.768 tokens.
- Generación de texto y procesamiento multilingüe derivados de su base PLaMo 3 NICT (la model card no detalla capacidades adicionales como tool calling, agentes o visión).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas en una sola pasada (hasta 32.768 tokens combinados) y usar glosarios para mantener terminología consistente entre capítulos, algo crítico en documentación de producto.
- Localización de software y webs corporativas: con 53 idiomas cubiertos, un mismo modelo puede encargarse de la localización a múltiples mercados, reduciendo la necesidad de mantener varios sistemas de traducción especializados.
- Traducción jurídica y administrativa con glosario: la posibilidad de imponer terminología y de aportar contexto permite alinear la salida con vocabulario regulado o corporativo en contratos y comunicaciones oficiales.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, puede traducir conversaciones entre agentes y clientes en tiempo real, con la ventaja de cubrir idiomas poco frecuentes que otros sistemas no soportan.
- Traducción editorial y de contenidos largos: para artículos, informes o libros, el contexto extendido y la opción de estilo cortés en japonés facilitan adaptaciones editoriales con registro adecuado.
- Investigación en traducción automática: al ser un modelo especializado con variantes cuantizadas (FP8, W4A16, GGUF, MLX), sirve como referencia para experimentos académicos y comparativas de calidad por par de idiomas.
- Subtitulado y transcripción multilingüe: puede integrarse en pipelines que traducen transcripciones o subtítulos entre los 53 idiomas soportados, con la posibilidad de dividir el texto por segmentos para respetar el límite de contexto.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas (no tablas numéricas en el texto proporcionado) frente a TranslateGemma y HY-MT2. Según el autor, el modelo de 2B ya supera a los LLM especializados en traducción comparados en todas las métricas de la figura. Las métricas empleadas son:

- Calidad japonés–inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. No se han publicado en la información disponible los valores numéricos concretos de estos benchmarks para el modelo de 31B, por lo que no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63,5 GB solo para pesos (el repositorio ocupa 63,5 GB), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 80 GB para trabajar con comodidad.
- VRAM estimada en FP8: en torno a 32 GB para pesos, más overhead; viable en GPUs de 48-80 GB.
- VRAM estimada en W4A16 / W4AFP8 / NVFP4: aproximadamente 16-20 GB para pesos, lo que abre la puerta a GPUs de 24 GB.
- VRAM estimada en GGUF: depende de la cuantización; las variantes Q2_K ocupan menos pero, según el autor, pierden precisión en algunas métricas; las cuantizaciones de 4 bits suelen mantenerse cercanas a BF16.
- GPUs recomendadas: A100 80 GB, H100 80 GB para BF16; L40S, A6000 o RTX 4090 (24 GB) para variantes cuantizadas de 4 bits.
- ¿Cabe en GPU de consumo? Sí, en variantes cuantizadas (W4A16, W4AFP8, NVFP4, GGUF 4-bit, MLX-4bit) sobre RTX 4090, RTX 3090 o Apple Silicon con suficiente memoria unificada; en BF16 no cabe en GPUs de consumo típicas.
- Opciones de despliegue: `transformers` con `custom_code` (requiere confiar en el código remoto), vLLM y TGI presumiblemente para formatos safetensors (no confirmado en la información disponible), llama.cpp/Ollama para GGUF, MLX para Apple Silicon. Las variantes están publicadas en repositorios separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B | 31,8B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | Hugging Face, variantes BF16/FP8/W4A16/W4AFP8/NVFP4/GGUF/MLX |
| PLaMo 3 Translate 8B | ~8B (no confirmado) | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | Hugging Face, mismas variantes |
| PLaMo 3 Translate 2B | ~2B (no confirmado) | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | Hugging Face, mismas variantes |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 se mencionan en la model card como modelos de traducción comparados en las gráficas de benchmarks, pero no se proporcionan sus especificaciones técnicas en la información disponible. La comparativa interna más directa es con los otros tamaños de la propia familia PLaMo 3 Translate, que comparten idiomas, licencia y límite de contexto, diferenciándose en parámetros y requisitos de hardware.

## Limitaciones y advertencias

- El límite de 32.768 tokens se aplica a la suma de entrada y salida; para textos largos es necesario dividirlos, lo que puede afectar a la coherencia entre segmentos si no se gestiona con contexto circundante.
- La model card no documenta sesgos específicos por idioma o dominio; al cubrir 53 idiomas con distintos volúmenes de datos de entrenamiento, es razonable esperar calidad desigual entre pares, especialmente en lenguas de bajos recursos.
- Riesgo de alucinación inherente a los modelos generativos: en traducción puede manifestarse como adiciones, omisiones o invenciones de contenido, especialmente en pasajes ambiguos o con terminología muy específica.
- Las cuantizaciones agresivas (por ejemplo, GGUF Q2_K) reducen la precisión en algunas métricas según el propio autor; para producción se recomienda validar la variante cuantizada elegida contra BF16 en el dominio concreto.
- La licencia PLaMo Community License permite uso personal, académico y no comercial gratuito sin registro, pero el uso comercial está sujeto a condiciones específicas que deben revisarse en el enlace oficial antes de desplegar el modelo en producción.
- El modelo requiere `custom_code` en `transformers`, lo que implica ejecutar código remoto del repositorio; conviene auditar o fijar la revisión antes de usarlo en entornos sensibles.
- No se documentan capacidades de tool calling, agentes o visión; no debe asumirse que el modelo las soporte por su tamaño.
- No se han publicado en la información disponible detalles sobre sesgos, datos de entrenamiento exactos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b/blob/main/README_ja.md
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
