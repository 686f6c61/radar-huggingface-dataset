# pfnet/plamo-3-translate-31b-W4A16

## Resumen

PLaMo 3 Translate 31B W4A16 es la variante cuantizada a INT4 (pesos de 4 bits, activaciones de 16 bits) del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se entrena adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre traducción entre 53 idiomas, admite contexto y glosarios como entradas auxiliares, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese límite combinado.

Esta variante W4A16 resulta relevante porque reduce el peso del repositorio a 17,2 GB, lo que abarata el despliegue en infraestructura con menos VRAM que la versión BF16, manteniendo activaciones en BF16 para preservar la calidad según la evaluación del autor. Está pensada para servirse con vLLM y el formato `compressed-tensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, `custom_code`), no disponible el detalle de capas y dimensiones |
| Parametros totales | 4.696.331.776 (según safetensors del repo cuantizado); el modelo base se denomina "31B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | W4A16 (INT4 en pesos, BF16 en activaciones); el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en repos separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (`license: other`) |
| Formato de pesos | safetensors con `compressed-tensors` (INT4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, con código de arquitectura propio (`custom_code`) que requiere `trust_remote_code` en transformers. El modelo base PLaMo 3 Translate 31B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se somete a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de preentrenamiento ni si se aplicaron fases de RLHF o DPO.

La innovación principal es la especialización en traducción con soporte de contexto circundante y glosarios, además de control de estilo (llano o cortés) para la salida en japonés. Esta variante W4A16 aplica cuantización de pesos a INT4 manteniendo activaciones en BF16, y el autor recomienda lanzar vLLM con `--dtype bfloat16` para reproducir las condiciones de su evaluación. El repositorio incluye tablas de "Accuracy changes from quantization" por tamaño, aunque su contenido completo no está disponible en la información proporcionada.

## Capacidades

- Traducción entre 53 idiomas, incluidos pares con japonés, español, inglés, chino, coreano, árabe, hindi y la mayoría de lenguas europeas y del sudeste asiático.
- Traducción bidireccional y multidireccional (cualquier idioma soportado a cualquier otro).
- Uso de contexto circundante (párrafos previos o posteriores) para desambiguar y mantener coherencia terminológica.
- Uso de glosarios para forzar terminología concreta en la salida.
- Control de estilo en japonés: salida en estilo llano o cortés.
- Traducción de pasajes largos en una sola pasada hasta 32.768 tokens combinados de entrada y salida.
- Generación de texto multilingüe derivada del modelo base, aunque la especialización declarada es la traducción.
- No se documenta en la información disponible soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica: traducir manuales y guías largas por bloques que respeten el límite de 32.768 tokens combinados, aprovechando el glosario para mantener consistencia de términos entre secciones.
- Traducción jurídica o administrativa asistida: usar el glosario para fijar terminología obligatoria y el contexto circundante para resolver referencias ambiguas en contratos y normativas.
- Atención al cliente multilingüe: traducir conversaciones multi-turno entre agentes y clientes en 53 idiomas, pasando el historial reciente como contexto para preservar el hilo.
- Subtitulado y doblaje: traducir guiones con contexto de escenas adyacentes y control de estilo para adaptar el registro del diálogo.
- Comercio electrónico internacional: traducir fichas de producto, descripciones y reseñas entre idiomas de mercados objetivo, con glosarios de marca para no alterar nombres comerciales.
- Publicación editorial y prensa: traducir artículos y notas de prensa con contexto de párrafos vecinos para mantener cohesión y estilo uniforme.
- Investigación multilingüe: normalizar corpus y abstracts de 53 idiomas a un idioma común para análisis comparativos, con la ventaja de un único modelo en lugar de pares específicos.
- Despliegue en infraestructura modesta: servir traducción en producción con vLLM usando la variante W4A16, que reduce el peso a 17,2 GB y permite usar GPUs de menor VRAM que la versión BF16.

## Benchmarks y rendimiento

El autor publica una figura comparativa (no una tabla numérica en el texto disponible) con la calidad de traducción de PLaMo 3 Translate frente a TranslateGemma y HY-MT2. Las métricas empleadas son:

| Evaluación | Métrica | Ámbito |
|---|---|---|
| Japonés–inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | Par ja–en |
| Japonés y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | 15 idiomas |
| Inglés y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | 15 idiomas |

Los 15 idiomas evaluados en FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. No se proporcionan los valores numéricos concretos en la información disponible, por lo que no se reproducen cifras.

## Requisitos de hardware

- Peso del repositorio cuantizado: 17,2 GB, lo que determina el mínimo de VRAM para cargar los pesos en memoria.
- VRAM estimada para inferencia: aproximadamente 18–20 GB solo para pesos; con caché KV para contexto largo (hasta 32.768 tokens) se recomienda al menos 24 GB y, para lotes grandes o contexto completo, 40–48 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para producción con contexto largo; RTX 4090 24 GB puede servir para lotes pequeños y contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con margen ajustado; en GPUs de 16 GB no cabe con contexto largo.
- Despliegue: vLLM es la opción documentada por el autor, lanzando con `--dtype bfloat16`. transformers también es compatible (requiere `trust_remote_code`). El modelo base ofrece variantes GGUF y MLX-4bit en repos separados para llama.cpp/Ollama y Apple Silicon, respectivamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B W4A16 | 4,696 M (repo cuantizado); base "31B" | 32.768 | 53 | PLaMo Community License | safetensors INT4, vLLM |
| PLaMo 3 Translate 31B BF16 | "31B" | 32.768 | 53 | PLaMo Community License | safetensors BF16 |
| PLaMo 3 Translate 8B W4A16 | "8B" | 32.768 | 53 | PLaMo Community License | safetensors INT4 |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 aparecen como comparadores en la evaluación del autor, pero no se dispone de sus especificaciones en la información proporcionada. Dentro de la propia familia, la elección entre 0.8B, 2B, 8B y 31B depende del equilibrio calidad/VRAM; el autor afirma que el 2B ya supera a los especializados comparados en sus métricas.

## Limitaciones y advertencias

- La licencia PLaMo Community License no es de código abierto: el uso personal, académico y no comercial es gratuito sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse en el enlace de licencia.
- El límite de 32.768 tokens es combinado de entrada y salida; los documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos si no se solapan.
- Es un modelo especializado en traducción; su rendimiento en tareas generales de razonamiento, código o matemáticas no está documentado y probablemente sea inferior al de un LLM generalista del mismo tamaño.
- No se documentan en la información disponible capacidades de tool calling, agentes ni visión.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en dominios muy técnicos o con terminología poco frecuente; el uso de glosarios mitiga parcialmente este riesgo.
- La cuantización W4A16 puede introducir degradación de calidad frente a BF16; el autor publica tablas de cambios de precisión por tamaño que conviene consultar antes de desplegar en producción.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos culturales o de género en la traducción.
- El modelo requiere `trust_remote_code` por su arquitectura `custom_code`, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo 8B W4A16: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Modelo 2B W4A16: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Modelo 0.8B W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Blog técnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
