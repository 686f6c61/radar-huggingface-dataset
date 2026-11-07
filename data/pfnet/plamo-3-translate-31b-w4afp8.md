# pfnet/plamo-3-translate-31b-W4AFP8

## Resumen

PLaMo 3 Translate 31B W4AFP8 es la variante cuantizada del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN) en Japón. El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT), y se entrena posteriormente con decenas de miles de millones de tokens de datos centrados en traducción. Esta versión concreta aplica cuantización de pesos a INT4 y de activaciones a FP8 (esquema W4AFP8), reduciendo el repositorio a 17,2 GB frente a los aproximadamente 63 GB que ocuparía la variante BF16 de 31.757 millones de parámetros.

El modelo cubre traducción entre 53 idiomas, admite contexto adicional y glosarios como entrada, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el conjunto no exceda ese límite. Está pensado para escenarios de traducción profesional y multilingüe donde la calidad por encima de la media y el control terminológico son requisitos, no extras.

La relevancia de esta ficha radica en que combina un modelo especializado de traducción de gama alta con un formato de cuantización orientado a hardware NVIDIA Hopper, lo que permite desplegarlo con vLLM reduciendo el consumo de memoria sin renunciar al cómputo en FP8. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial que deben revisarse antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles); modelo especializado en traducción con código personalizado (`custom_code`, `plamo3`) |
| Parametros totales | 31.757.456.384 (31,76 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | W4AFP8 (pesos INT4, activaciones FP8); el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (`plamo-community-license`) |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, cabezas, etc.) más allá de tratarse de un transformer con código personalizado bajo la etiqueta `plamo3`. El modelo base, PLaMo 3 Translate 31B, deriva de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se sometió a un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción. No se especifica en la información proporcionada si hubo fases de RLHF o DPO, ni la composición exacta del dataset más allá de su enfoque en traducción.

La innovación principal de esta distribución es la cuantización W4AFP8: pesos en INT4 y activaciones en FP8, implementada mediante `compressed-tensors` y orientada a GPUs NVIDIA Hopper con vLLM. Según la model card, el comando de lanzamiento en vLLM es el mismo que para la versión BF16, lo que simplifica la migración. El modelo admite entradas de contexto y glosarios para guiar la traducción, y ofrece control de estilo (llano o cortés) en la salida japonesa, capacidades que apuntan a un entrenamiento con instrucciones específicas de traducción más que a un simple ajuste supervisado genérico.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino (simplificado y tradicional), árabe, coreano, tailandés, vietnamita y ruso, entre otros.
- Traducción con contexto circundante: el modelo puede tener en cuenta texto previo o posterior para desambiguar y mantener coherencia.
- Traducción asistida por glosario: permite imponer terminología concreta, útil para dominios técnicos, legales o de marca.
- Control de estilo en japonés: elección entre estilo llano (plain) y cortés (polite) en la salida.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Generación de texto multilingüe (pipeline `text-generation`), aunque la especialización declarada es la traducción.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Traducción profesional japonés-inglés y multilingüe: el modelo está entrenado específicamente para estos pares y la model card reporta calidad de primer nivel en PFTB, SaaS y WMT24++ COMET-22, lo que lo hace adecuado para agencias y equipos de localización que necesitan salida de alta calidad sin postedición extensa.
- Localización de documentación técnica con glosario: al aceptar glosarios como entrada, se puede forzar terminología consistente en manuales, especificaciones o documentación de producto, reduciendo la variabilidad terminológica entre traductores y lotes.
- Traducción de contratos y textos legales con contexto: la ventana de 32.768 tokens permite procesar cláusulas completas o secciones enteras con su contexto, lo que ayuda a resolver referencias y ambigüedades que un modelo por frases perdería.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, puede traducir conversaciones multi-turno entre el usuario y el agente, manteniendo el contexto de la conversación dentro del límite de tokens y ajustando el estilo cortés en japonés.
- Subtitulado y traducción de contenido audiovisual: para guiones y subtítulos de longitud moderada, la traducción en una sola pasada con contexto permite mantener coherencia de personajes y terminología a lo largo de una escena.
- Traducción de documentación de software y contenido web: con despliegue en vLLM sobre GPUs Hopper, se puede servir como API interna de traducción para pipelines de CI/CD de documentación, traduciendo páginas o fragmentos de release notes de forma automatizada.
- Investigación en traducción automática: la disponibilidad de múltiples formatos (BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX) y de cuatro tamaños (0.8B, 2B, 8B, 31B) facilita experimentos comparativos de cuantización y evaluación de calidad por tamaño.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas agregadas: PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés; FLORES+ chrF++ para japonés y 14 idiomas adicionales; y FLORES+ chrF++ para inglés y 14 idiomas adicionales. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada, por lo que no se presentan cifras.

| Evaluación | Métrica | Resultado numérico |
|---|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | No disponible (solo figura comparativa) |
| Japonés ↔ 14 idiomas | FLORES+ chrF++ (media bidireccional) | No disponible (solo figura comparativa) |
| Inglés ↔ 14 idiomas | FLORES+ chrF++ (media bidireccional) | No disponible (solo figura comparativa) |

La model card también menciona tablas de "Accuracy changes from quantization" que comparan la precisión de BF16 con cada formato de distribución por tamaño, pero los valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio W4AFP8 ocupa 17,2 GB, por lo que se necesita al menos esa cantidad más overhead de activaciones, KV cache y runtime; con contexto largo (hasta 32.768 tokens) el consumo adicional de KV cache puede ser considerable.
- GPU recomendadas: el formato W4AFP8 está orientado a NVIDIA Hopper (H100, H200) según la model card; para Ampere o posterior existe la variante W4A16, y para otros entornos las variantes GGUF o MLX-4bit.
- Cabe en GPU de consumo: no se confirma en la información disponible; 17,2 GB de pesos más overhead difícilmente caben en GPUs de 16 GB, y en GPUs de 24 GB (RTX 4090) requeriría gestión cuidadosa de contexto y batch pequeño.
- Opciones de despliegue: vLLM es el runtime documentado explícitamente para esta variante (mismo comando de lanzamiento que BF16); también es compatible con transformers. Para otros runtimes, las variantes GGUF (llama.cpp/Ollama) y MLX-4bit cubren escenarios alternativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B W4AFP8 | 31,76B | 32.768 tokens (entrada + salida) | Traducción, 53 idiomas | PLaMo Community License | safetensors (W4AFP8), vLLM |
| PLaMo 3 Translate 8B | 8B (aprox., no confirmado) | No disponible | Traducción, 53 idiomas | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | No disponible | No disponible | Traducción | No disponible | No disponible |
| HY-MT2 | No disponible | No disponible | Traducción | No disponible | No disponible |

La model card cita TranslateGemma y HY-MT2 como modelos de traducción comparables en sus evaluaciones, pero no se dispone de sus especificaciones técnicas en la información proporcionada. Dentro de la propia familia, el 8B y el 2B ofrecen alternativas de menor huella con la misma cobertura de idiomas, y el 0.8B está pensado para entornos muy limitados.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos multilingües, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: en traducción, el riesgo se manifiesta como adiciones, omisiones o terminología inventada, especialmente en idiomas de bajos recursos o dominios muy especializados; el uso de glosarios y contexto mitiga parcialmente este riesgo.
- Límite de contexto: 32.768 tokens combinando entrada y salida; los documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- Cobertura idiomática desigual: aunque se declaran 53 idiomas, la evaluación FLORES+ se realizó sobre 15 idiomas seleccionados, por lo que la calidad en el resto no está cuantificada en la información disponible.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones que deben revisarse en el enlace oficial antes de desplegar en producción.
- Hardware: la variante W4AFP8 está orientada a NVIDIA Hopper; en Ampere u otras arquitecturas conviene usar W4A16 u otro formato, y la cuantización puede introducir degradación de calidad (la model card incluye tablas comparativas, pero sus valores no están disponibles aquí).
- Código personalizado: requiere `trust_remote_code` o soporte específico en el runtime (`custom_code`, `plamo3`), lo que añade dependencia de la implementación del autor.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse que el modelo las soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8/blob/main/README_ja.md
