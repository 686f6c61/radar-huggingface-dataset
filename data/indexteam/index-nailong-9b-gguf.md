# IndexTeam/Index-Nailong-9B-GGUF

## Resumen
Index-Nailong-9B-GGUF es la conversión oficial a formato GGUF del modelo IndexTeam/Index-Nailong-9B, un modelo de traducción multilingüe de 8.953.803.264 parámetros (aproximadamente 9B) desarrollado por el equipo Index (vinculado a bilibili). Forma parte de la familia Index-Translate, orientada a traducción en 150 idiomas con soporte para restricciones de terminología, preservación de formato y traducción controlada por sílabas para doblaje. Esta versión GGUF, publicada en noviembre de 2026, actualiza todas las variantes a la versión v1.1 del modelo base.

El modelo resuelve el problema de la traducción automática de alta calidad con control fino sobre el resultado: permite imponer glosarios terminológicos obligatorios, preservar estructuras JSON/CSV/código/placeholders y adaptar el registro o el sentido según el dominio. Está pensado para pipelines de traducción profesionales, localización de software y doblaje, donde la fidelidad terminológica y de formato es crítica.

La relevancia actual radica en su empaquetado en múltiples cuantizaciones GGUF (desde Q2_K hasta f16) que permiten desplegarlo en hardware de consumo, junto con un formato de prompting estructurado (instTrans) documentado y verificado. El repositorio ocupa 162,9 GB e incluye todas las anchuras de bits en un único lugar, con checksums SHA-256 para validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 150 idiomas (según la familia Index-Translate) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp, commit 0fb8f157702702f33f4e018de8701b2569a1bc28) |

## Arquitectura y entrenamiento
No se dispone de detalles sobre la arquitectura interna del modelo base en la información proporcionada; se trata de un modelo de la familia Index-Translate orientado a traducción, con aproximadamente 9B de parámetros. La model card no especifica si emplea un transformer denso convencional u otra variante, ni detalla el volumen de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF/DPO.

La innovación técnica destacable no reside en la arquitectura sino en el formato de prompting instTrans, que permite traducción restringida mediante la estructura canónica `【源文】<text>` seguida de restricciones duras numeradas (`1. 【硬性要求】`) y restricciones suaves (`2. 【注意】`). Las restricciones duras son binarias (glosarios terminológicos estrictos, preservación de formato JSON/CSV/código/placeholders) y las suaves son graduadas (tono y estilo, desambiguación de sentido por dominio, consistencia entre frases, preservación de LaTeX). Además, los checkpoints Index-Homura (2B y 9B) permiten traducción con control estricto de presupuesto silábico para doblaje.

## Capacidades
- Traducción multilingüe en 150 idiomas, con foco documentado en chino-inglés y chino-japonés en las pruebas de validación.
- Traducción con restricciones duras: aplicación obligatoria de glosarios terminológicos y preservación de estructuras (JSON, CSV, código, placeholders).
- Traducción con restricciones suaves: adaptación de tono y registro (por ejemplo, correo comercial formal), desambiguación de sentido por dominio (por ejemplo, *plant* como fábrica en contexto industrial), consistencia entre frases y preservación de LaTeX.
- Traducción controlada por sílabas para doblaje mediante los checkpoints Index-Homura, combinable con glosarios.
- Traducción de documentos largos (según la descripción de la familia Index-Translate).
- Modo conversacional con plantilla de chat; se recomienda desactivar el modo thinking (`enable_thinking: false`) y usar decodificación greedy (temperature=0).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Localización de software y documentación técnica: el modelo puede traducir cadenas y ficheros preservando placeholders, estructuras JSON/CSV y bloques de código gracias a las restricciones duras del formato instTrans, lo que evita romper la sintaxis en pipelines automatizados de CI/CD.
- Traducción jurídica o técnica con glosario obligatorio: permite imponer terminología corporativa o normativa (por ejemplo, `碳纤维:carbon fiber`) de forma binaria, garantizando consistencia terminológica en contratos, manuales o patentes.
- Doblaje y subtitulado con control de sílabas: combinando el modelo con los checkpoints Index-Homura, se puede respetar un presupuesto silábico por segmento para que la traducción encaje en la duración del audio original, manteniendo además glosarios de personajes o marcas.
- Traducción de documentación científica con LaTeX: la preservación de expresiones LaTeX y la consistencia entre frases permiten traducir artículos y preprints sin corromper fórmulas ni referencias cruzadas.
- Atención al cliente multilingüe: el modelo puede gestionar conversaciones multi-turno en 150 idiomas con adaptación de registro formal, adecuado para respuestas de soporte en correo o chat.
- Traducción de correo comercial y comunicación corporativa: las restricciones suaves de tono y estilo permiten generar versiones formales adaptadas al registro de cada mercado.
- Despliegue en hardware de consumo para traducción on-premise: las cuantizaciones Q4_K_M (5,63 GB) y Q5_K_M (6,47 GB) permiten ejecutar el modelo en GPUs de consumo o incluso CPU, útil para organizaciones que no pueden enviar texto sensible a la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card remite a la model card del modelo base para los resultados de evaluación, pero no incluye cifras concretas. La única validación reportada es cualitativa: cada variante v1.1 se cargó con llama.cpp y se comprobó con cuatro ejemplos cortos de traducción (chino-inglés y chino-japonés en ambas direcciones, incluida una instrucción de terminología); las 48 generaciones completaron con normalidad y las 12 variantes respetaron la terminología especificada.

## Requisitos de hardware
- VRAM estimada para inferencia según cuantización: Q2_K ~3,83 GB; Q3_K_M ~4,62 GB; Q4_K_M ~5,63 GB (recomendada); Q5_K_M ~6,47 GB; Q6_K ~7,36 GB; Q8_0 ~9,53 GB; f16 ~17,92 GB. Añadir margen para la ventana de contexto y el estado KV.
- GPU recomendadas: para f16, GPU con 24 GB o más (RTX 4090, A100, H100); para Q4_K_M y Q5_K_M, GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: sí, en las cuantizaciones Q2_K a Q6_K; Q8_0 requiere ~10 GB y f16 requiere ~18 GB, por lo que f16 no cabe en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (librería oficial del repo), con `llama serve` y `llama cli`; compatible con endpoints (`endpoints_compatible`). Otras opciones como vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La familia Index-Translate incluye otros modelos (Index-Homura-2B e Index-Homura-9B para doblaje), pero no se detallan sus parámetros, contexto ni rendimiento comparativo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Index-Nailong-9B-GGUF | ~9B | no disponible | Apache 2.0 | GGUF | Traducción 150 idiomas, instTrans |
| Index-Homura-9B | no disponible | no disponible | no disponible | no disponible | Doblaje con control silábico |
| Index-Homura-2B | no disponible | no disponible | no disponible | no disponible | Doblaje con control silábico |

## Limitaciones y advertencias
- La cuantización Q2_K presenta "pérdida de calidad significativa" según la propia model card; Q3_K_S, Q3_K_M y Q3_K_L tienen "pérdida de calidad notable". Para producción se recomienda Q4_K_M o superior.
- No se han publicado resultados de benchmarks cuantitativos, por lo que el rendimiento real frente a alternativas no está verificado de forma independiente.
- La validación reportada es cualitativa y limitada a cuatro ejemplos cortos de traducción chino-inglés y chino-japonés; no cubre los 150 idiomas anunciados.
- Riesgo de alucinación y de deriva terminológica en textos largos no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide planificar el troceado de documentos largos con precisión.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene revisar las condiciones del modelo base y de los checkpoints derivados.
- El formato de prompting instTrans requiere seguir la estructura canónica documentada; un prompting incorrecto puede degradar el cumplimiento de restricciones.
- Se recomienda decodificación greedy (temperature=0) y desactivar el modo thinking para traducción; otros ajustes pueden alterar la fidelidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/IndexTeam/Index-Nailong-9B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Nailong-9B
- Versión v1.1 del modelo base: https://huggingface.co/IndexTeam/Index-Nailong-9B/tree/v1.1
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Código: https://github.com/bilibili/Index-Translate
- Checkpoint de doblaje 2B: https://huggingface.co/IndexTeam/Index-Homura-2B
- Checkpoint de doblaje 9B: https://huggingface.co/IndexTeam/Index-Homura-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
