# pfnet/plamo-3-translate-0.8b-NVFP4

## Resumen

PLaMo 3 Translate 0.8B NVFP4 es la variante cuantizada en NVFP4 (pesos y activaciones en FP4 de 4 bits) del modelo de traducción especializado PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Con 890.344.960 parámetros reales (según safetensors), es la variante más pequeña de una familia que también incluye versiones de 2B, 8B y 31B.

El modelo resuelve un problema concreto: la traducción automática de alta calidad entre 53 idiomas, con especial énfasis en pares japonés-inglés y en combinaciones multilingües. A diferencia de los LLM generalistas, está especializado en traducción y admite contexto circundante y glosarios para desambiguar términos, además de permitir elegir entre estilo llano y estilo cortés (keigo) en la salida en japonés. La ventana de entrenamiento es de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos de una sola pasada.

Esta versión NVFP4 es relevante porque reduce el coste de memoria y acelera la inferencia en GPUs con soporte de FP4 (arquitectura NVIDIA Blackwell), manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16. Para GPUs anteriores a Blackwell, el autor documenta un modo de emulación (`--linear-backend=emulation --enforce-eager`) que reproduce la misma ruta de activaciones FP4 usada en su evaluación. Su licencia PLaMo Community permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción especializado; detalles de capas y atención no disponibles) |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en FP4); el autor distribuye además BF16, FP8, W4A16, W4AFP8, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito sin registro; condiciones específicas para uso comercial) |
| Formato de pesos | safetensors con compressed-tensors (custom_code, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer de 890 millones de parámetros especializado en traducción, construido a partir de PLaMo 3 NICT, el modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La model card no detalla el número exacto de capas, dimensiones ocultas, mecanismo de atención ni la composición completa del corpus de entrenamiento, por lo que esos datos deben considerarse no disponibles.

La innovación técnica destacable de esta distribución es la cuantización NVFP4, que aplica FP4 tanto a pesos como a activaciones mediante el formato compressed-tensors y se integra en vLLM. La longitud máxima de entrenamiento es de 32.768 tokens sumando entrada y salida, lo que condiciona el diseño de los prompts: el autor recomienda dividir cualquier pasaje cuya entrada y salida combinadas superen ese límite. No se documenta en la información disponible si hubo fases de RLHF o DPO, ni detalles sobre decodificación especulativa o atención lineal.

## Capacidades

- Traducción entre 53 idiomas, con calidad destacada en los pares japonés-inglés y en combinaciones multilingües.
- Aprovechamiento de contexto circundante para desambiguar la traducción de fragmentos.
- Soporte de glosarios para forzar terminología concreta en la salida.
- Selección de estilo de salida en japonés: llano o cortés (keigo).
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens.
- Generación de texto orientada a traducción (pipeline `translation`), no un LLM conversacional generalista.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica japonés-inglés: el modelo puede procesar secciones completas de manuales dentro de su ventana de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios.
- Localización de productos multilingüe: con 53 idiomas soportados, un mismo pipeline puede generar versiones en español, francés, alemán, coreano o tailandés a partir de un texto fuente, sin cambiar de modelo.
- Atención al cliente internacional: traducción de conversaciones multi-turno donde el contexto previo ayuda a resolver referencias y ambigüedades, aprovechando la ventana de contexto extendida.
- Traducción de contenido editorial con control de estilo: en salida japonesa, el equipo puede elegir entre registro llano y cortés según el canal (blog, correo formal, documentación).
- Procesamiento de contratos y textos legales con glosario: la posibilidad de imponer terminología fija reduce la variabilidad en términos jurídicos sensibles.
- Despliegue en infraestructura con GPUs Blackwell: la cuantización NVFP4 reduce el coste de memoria y permite servir traducción a mayor throughput en vLLM con el mismo comando que la versión BF16.
- Traducción de subtítulos y contenido audiovisual: pasajes cortos con contexto circundante para resolver elipsis y referencias culturales.
- Integración en pipelines de CI/CD de documentación: el tamaño de 0,8B y su formato compatible con vLLM permiten incluirlo como paso automatizado de traducción en la generación de docs.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas COMET-22 (medía de PFTB, SaaS y WMT24++ para japonés-inglés) y FLORES+ chrF++ (promedio bidireccional para japonés y inglés frente a 14 idiomas). Sin embargo, los valores numéricos concretos no están disponibles en el texto proporcionado: solo se indica que el modelo de 2B supera a los LLM especializados comparados en todas las métricas de la figura. No se han publicado en la información disponible resultados numéricos de benchmarks para la variante de 0,8B NVFP4.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| PFTB / SaaS / WMT24++ COMET-22 (ja-en) | no disponible (solo figura) | supera a TranslateGemma y HY-MT2 según el autor |
| FLORES+ chrF++ (ja y en frente a 14 idiomas) | no disponible (solo figura) | supera a TranslateGemma y HY-MT2 según el autor |
| MMLU, HumanEval, GSM8K | no disponible | no aplica a un modelo de traducción especializado |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB, por lo que la variante NVFP4 cabe holgadamente en GPUs de consumo con 4 GB o más de VRAM, incluyendo el espacio para el contexto.
- GPUs recomendadas: NVIDIA Blackwell (serie RTX 50, B100/B200) para aprovechar la ruta nativa FP4; en GPUs anteriores (A100, H100, RTX 4090) el autor indica usar `--linear-backend=emulation --enforce-eager` para reproducir la ruta de activaciones FP4 de su evaluación.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU mediante las variantes GGUF publicadas en repositorio separado.
- Opciones de despliegue: vLLM (soporte nativo de NVFP4 y compressed-tensors, mismo comando que la versión BF16); para otras plataformas existen las variantes GGUF (llama.cpp, Ollama) y MLX-4bit (Apple Silicon) en repositorios separados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B NVFP4 | 890 M | 32.768 tokens (entrada + salida) | PLaMo Community License | NVFP4, BF16, FP8, W4A16, W4AFP8, GGUF, MLX | Especializado en traducción, 53 idiomas, contexto y glosario |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX | Según el autor, supera a los LLM de traducción comparados en todas las métricas de su figura |
| PLaMo 3 Translate 8B | no disponible | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX | Misma familia, mayor tamaño |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | Citado como referencia en la comparativa del autor; sin datos numéricos en la información disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | Citado como referencia en la comparativa del autor; sin datos numéricos en la información disponible |

## Limitaciones y advertencias

- Es un modelo especializado en traducción: no debe esperarse un comportamiento de asistente general, razonamiento complejo ni generación creativa fuera del ámbito de la traducción.
- El límite de 32.768 tokens es la suma de entrada y salida; los pasajes más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- La cuantización NVFP4 introduce una pérdida de precisión respecto a BF16; el autor documenta en la model card un apartado sobre cambios de precisión derivados de la cuantización, aunque el contenido completo no está disponible en la información proporcionada.
- En GPUs anteriores a Blackwell, el modo de emulación FP4 puede reducir el rendimiento frente a la ruta nativa.
- La licencia PLaMo Community no es de código abierto: el uso comercial requiere revisar las condiciones específicas en el enlace de licencia; el uso personal, académico y no comercial es gratuito sin registro.
- No se documentan en la información disponible evaluaciones de sesgo, tasas de alucinación ni comportamiento en dominios especializados más allá de las métricas de traducción citadas.
- La calidad puede variar notablemente entre los 53 idiomas: la evaluación publicada se centra en japonés e inglés frente a 14 idiomas, no en todas las combinaciones posibles.
- El modelo requiere `trust_remote_code` (tag `custom_code`) y una versión de transformers compatible con la arquitectura PLaMo 3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4/blob/main/README_ja.md
