# pfnet/plamo-3-translate-2b-W4AFP8

## Resumen

PLaMo 3 Translate 2B W4AFP8 es la variante cuantizada del modelo de traducción especializado PLaMo 3 Translate 2B, desarrollado por Preferred Networks (PFN) en colaboración con el National Institute of Information and Communications Technology (NICT) de Japón. El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de esa investigación conjunta, que después se entrena adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Esta versión concreta aplica cuantización de pesos a INT4 y de activaciones a FP8 mediante la librería compressed-tensors, reduciendo el repositorio a 2,3 GB.

El modelo resuelve el problema de la traducción automática multilingüe de alta calidad en un tamaño compacto: con 2.878.595.584 parámetros totales (aproximadamente 2,9 mil millones), cubre 53 idiomas y permite incorporar contexto circundante y glosarios en la petición, además de elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que habilita traducir pasajes largos en una sola pasada.

Su relevancia actual radica en que la familia PLaMo 3 Translate se publica en cuatro tamaños (0,8B, 2B, 8B y 31B) con múltiples formatos de distribución (BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit), lo que facilita el despliegue tanto en servidores con vLLM como en hardware de consumo. El modelo está disponible bajo la licencia PLaMo Community License, con uso personal, académico y no comercial gratuito sin registro previo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción especializado derivado de PLaMo 3 NICT); detalles internos de capas y atención no disponibles |
| Parámetros totales | 2.878.595.584 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantización | Pesos INT4 (W4) y activaciones FP8 (AFP8); el modelo base dispone además de FP8, W4A16, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito; condiciones comerciales aparte) |
| Formato de pesos | safetensors con custom_code y compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer especializado en traducción construido sobre PLaMo 3 NICT, el modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que da lugar a la familia PLaMo 3 Translate. La longitud máxima manejada durante el entrenamiento fue de 32.768 tokens considerando entrada y salida de forma conjunta. No se han publicado en la información disponible detalles sobre el número de capas, la configuración de atención ni la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta variante es la cuantización W4AFP8: pesos en INT4 y activaciones en FP8, implementada mediante compressed-tensors, que reduce el tamaño del repositorio a 2,3 GB frente a la versión BF16. Según el autor, el comando de lanzamiento en vLLM es el mismo que el de la versión BF16, lo que simplifica la sustitución en despliegues existentes. La model card incluye tablas comparativas de precisión de traducción entre BF16 y cada formato de distribución por tamaño de modelo, aunque los valores numéricos concretos no están disponibles en la información proporcionada.

## Capacidades

- Traducción entre 53 idiomas, incluyendo combinaciones con japonés, inglés, español, chino (simplificado y tradicional), coreano, árabe, hindi, tailandés, vietnamita y ruso, entre otros.
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto que rodea al segmento a traducir para mejorar la coherencia.
- Soporte de glosarios: permite incorporar terminología específica en la petición para forzar traducciones consistentes de términos técnicos o de marca.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés en la salida.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Generación de texto orientada a traducción (pipeline `translation`); no se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías largas en una sola pasada gracias al límite de 32.768 tokens combinados, con glosarios que garanticen la consistencia de términos técnicos entre secciones.
- Traducción de sitios web y aplicaciones: integrado en pipelines de CI/CD, permite generar versiones multilingües de contenidos con contexto circundante para resolver ambigüedades de frases cortas.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones de soporte entre el japonés y los otros 52 idiomas soportados, con estilo cortés configurable en japonés para mantener el registro adecuado.
- Subtitulado y doblaje: traducción de guiones y subtítulos con contexto de diálogo, útil para preservar la coherencia entre intervenciones consecutivas.
- Traducción jurídica y administrativa: el soporte de glosarios permite fijar terminología legal o institucional y mantenerla estable a lo largo de documentos extensos.
- Investigación en traducción automática: el tamaño compacto (2,9 mil millones de parámetros) y las variantes cuantizadas permiten experimentar y evaluar en hardware modesto, comparando formatos BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit.
- Procesamiento por lotes de corpus multilingües: el formato W4AFP8 reduce el consumo de memoria, lo que permite ejecutar más instancias en paralelo en vLLM para traducir grandes volúmenes de texto.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de nivel mundial tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción con los que se compara en todas las métricas de la figura publicada. Las métricas empleadas son:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas evaluados en FLORES+ son japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. Los modelos de comparación citados son TranslateGemma y HY-MT2. Los valores numéricos de los benchmarks se presentan únicamente en forma de figura en la model card y no están disponibles como cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio W4AFP8 ocupa 2,3 GB, por lo que la inferencia cabe holgadamente en GPUs con 8 GB o más, dejando margen para la caché KV asociada a contextos largos.
- GPU recomendadas: para producción con vLLM, GPUs con soporte de FP8 como las de las familias Hopper (H100) o Ada Lovelace (L40S, RTX 4090); en GPUs sin soporte nativo de FP8, conviene valorar las variantes W4A16 o GGUF del modelo base.
- GPU de consumo: sí cabe; el tamaño reducido permite ejecutarlo en tarjetas consumer con 8-16 GB de VRAM.
- Opciones de despliegue: vLLM (el comando de lanzamiento es idéntico al de la versión BF16), transformers con custom_code y compressed-tensors; para otras variantes del modelo base existen GGUF (llama.cpp, Ollama) y MLX-4bit (Apple Silicon).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B W4AFP8 | 2,9 mil millones | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | safetensors (INT4/FP8), vLLM |
| PLaMo 3 Translate 0.8B | no disponible | no disponible | 53 (familia) | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| PLaMo 3 Translate 8B | no disponible | no disponible | 53 (familia) | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card cita TranslateGemma y HY-MT2 como modelos especializados en traducción frente a los que PLaMo 3 Translate 2B obtiene mejores métricas, pero no se proporcionan en la información disponible sus parámetros, contexto, licencia ni formatos. Dentro de la propia familia, las variantes 0.8B, 8B y 31B comparten licencia y formatos de distribución, lo que permite escalar en calidad sin cambiar de ecosistema.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos web y de traducción, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado en la información disponible; en traducción, el riesgo se manifiesta como omisiones, adiciones o invenciones de contenido, especialmente en segmentos ambiguos o con terminología desconocida.
- Límite de longitud: la ventana de 32.768 tokens es la suma de entrada y salida; los documentos más largos deben dividirse, lo que puede afectar a la coherencia entre fragmentos.
- Cobertura idiomática desigual: aunque se declaran 53 idiomas, la evaluación FLORES+ solo cubre 15; la calidad en el resto de idiomas no está cuantificada en la información disponible.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial gratuito sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse antes de desplegar en producción.
- Cuantización: esta variante INT4/FP8 puede presentar pequeñas pérdidas de precisión frente a BF16; la model card incluye tablas comparativas por tamaño, pero los valores no están disponibles en la información proporcionada. En hardware sin soporte FP8, el rendimiento puede degradarse.
- Dependencia de código personalizado: requiere `custom_code` y compressed-tensors, por lo que la compatibilidad con versiones antiguas de transformers o de vLLM no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b-W4AFP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-2b
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante GGUF del 2B: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante MLX-4bit del 2B: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
