# pfnet/plamo-3-translate-0.8b-GGUF

## Resumen

PLaMo 3 Translate 0.8B GGUF es la versión cuantizada en formato GGUF del modelo de traducción PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN) y distribuido para su uso con llama.cpp. Se trata de un modelo de lenguaje especializado en traducción que cubre 53 idiomas y que parte de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón.

El modelo ha sido entrenado adicionalmente sobre decenas de miles de millones de tokens de datos centrados en traducción, lo que le permite ofrecer calidad de traducción de primer nivel tanto en pares japonés-inglés como en combinaciones multilingües. Con 890.344.960 parámetros totales (aproximadamente 0,8B), es un modelo compacto pensado para despliegue eficiente.

La relevancia de esta ficha radica en su formato GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama y herramientas compatibles, manteniendo la ventana de contexto de 32.768 tokens combinados de entrada y salida que se usó durante el entrenamiento. Además, admite contexto circundante y glosarios, y permite elegir entre estilo llano y cortés para la salida en japonés. La licencia es la PLaMo Community License, con uso no comercial gratuito y condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje basado en transformer según la familia PLaMo 3; la model card no detalla la arquitectura interna) |
| Parámetros totales | 890.344.960 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas, máximo durante entrenamiento) |
| Tipos de cuantización | GGUF (las cuantizaciones concretas incluidas en el repo no se detallan en la información disponible); la familia ofrece además FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit en otros repositorios |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF (repo de 2,0 GB); el modelo base está en BF16 |
| Tamaño del repositorio | 2,0 GB |
| Pipeline | translation |
| Modelo base | pfnet/plamo-3-translate-0.8b |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su pertenencia a la familia PLaMo 3 y de su naturaleza de modelo de lenguaje preentrenado. El modelo base, PLaMo 3 NICT, fue desarrollado mediante investigación conjunta entre PFN y NICT; sobre él, PFN aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. No se especifica en la model card la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal es la especialización en traducción con soporte de contexto circundante y glosarios, junto con la posibilidad de seleccionar registro llano o cortés en la salida japonesa. El límite de 32.768 tokens durante el entrenamiento abarca entrada y salida conjuntamente, lo que condiciona el diseño de los pipelines: los textos largos deben dividirse de modo que la suma de entrada y salida no supere ese umbral. Esta versión GGUF añade la conversión y cuantización para llama.cpp, lo que facilita su ejecución en entornos locales.

## Capacidades

- Traducción entre 53 idiomas, incluyendo combinaciones directas entre japonés e inglés y entre estos y otros 14 idiomas evaluados (árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso).
- Traducción con contexto circundante: puede tener en cuenta el texto previo o posterior para desambiguar y mantener coherencia.
- Traducción asistida por glosario: permite incorporar terminología específica para forzar traducciones consistentes.
- Control de estilo en japonés: elección entre registro llano y cortés.
- Traducción de pasajes largos en una sola pasada, siempre que entrada y salida combinadas no superen los 32.768 tokens.
- Capacidad conversacional (etiqueta `conversational`), lo que permite su uso en formatos de chat compatibles con llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`) para su despliegue en infraestructuras de inferencia.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas gracias a su ventana de 32.768 tokens combinados, manteniendo coherencia terminológica si se le proporciona un glosario con los términos clave del dominio.
- Localización de software y sitios web: con soporte para 53 idiomas y control de estilo, resulta adecuado para traducir cadenas y textos de interfaz, eligiendo el registro cortés en japonés cuando el producto lo requiera.
- Traducción jurídica o administrativa asistida: el uso de glosarios permite fijar terminología específica y reducir variaciones en documentos con vocabulario repetitivo, aunque requiere revisión humana por el riesgo de alucinación.
- Traducción de subtítulos y contenido audiovisual: su tamaño compacto (0,8B) permite ejecutarlo en hardware modesto y procesar diálogos con contexto circundante para resolver referencias y elipsis.
- Atención al cliente multilingüe: integrado en un pipeline de chat, puede traducir mensajes entrantes y salientes en tiempo real entre el idioma del cliente y el del agente, aprovechando el contexto de la conversación.
- Traducción de correspondencia y correo electrónico: el control de registro llano o cortés en japonés es útil para adaptar el tono según el destinatario, y el contexto circundante ayuda a mantener la coherencia en hilos largos.
- Investigación académica en traducción automática: al ser gratuito para uso no comercial, sirve como modelo de referencia para experimentos con cuantizaciones GGUF y comparativas de calidad entre formatos.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas COMET-22 (promedio de PFTB, SaaS y WMT24++ para japonés-inglés) y FLORES+ chrF++ (promedio bidireccional para japonés y inglés frente a 14 idiomas). Sin embargo, los valores numéricos concretos no se reproducen en el texto proporcionado, por lo que no es posible presentar una tabla con cifras verificables.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Japonés-inglés | COMET-22 (media de PFTB, SaaS, WMT24++) | no disponible (solo figura comparativa) |
| Japonés ↔ 14 idiomas | FLORES+ chrF++ bidireccional | no disponible (solo figura comparativa) |
| Inglés ↔ 14 idiomas | FLORES+ chrF++ bidireccional | no disponible (solo figura comparativa) |

La model card afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8B en GGUF, las cuantizaciones de 4 bits ocupan aproximadamente 0,5-0,7 GB de pesos, mientras que las de 8 bits rondan 0,9-1,0 GB. El repositorio completo ocupa 2,0 GB, lo que sugiere que incluye varias cuantizaciones; los requisitos exactos por variante no se detallan en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede ejecutar las variantes más comprimidas. Una RTX 3060, RTX 4060 o superior es suficiente; también cabe en iGPU y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en sistemas con poca VRAM si se elige una cuantización de 4 bits.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier frontend compatible con GGUF. El modelo base también está disponible en formatos FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit para otros motores.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (0,8B), se espera una latencia baja en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

La model card menciona TranslateGemma y HY-MT2 como modelos especializados en traducción con los que se compara, pero no se proporcionan sus especificaciones en la información disponible. Se incluye también la comparación interna entre los cuatro tamaños de la familia PLaMo 3 Translate.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PLaMo 3 Translate 0.8B GGUF | 890.344.960 | 32.768 (entrada + salida) | PLaMo Community License | HuggingFace (GGUF, BF16, FP8, W4A16, W4AFP8, NVFP4, MLX) |
| PLaMo 3 Translate 2B | no disponible en detalle | 32.768 (entrada + salida) | PLaMo Community License | HuggingFace (mismos formatos) |
| PLaMo 3 Translate 8B | no disponible en detalle | 32.768 (entrada + salida) | PLaMo Community License | HuggingFace (mismos formatos) |
| PLaMo 3 Translate 31B | no disponible en detalle | 32.768 (entrada + salida) | PLaMo Community License | HuggingFace (mismos formatos) |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de TranslateGemma ni de HY-MT2 en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en textos ambiguos o con terminología muy especializada. Se recomienda revisión humana en dominios críticos.
- Límite de longitud: la ventana de 32.768 tokens cubre entrada y salida conjuntamente; los documentos más largos deben dividirse en fragmentos, lo que puede afectar a la coherencia entre secciones.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos multilingües, puede heredar sesgos presentes en ellos, especialmente en pares de idiomas con menos recursos.
- Cobertura desigual por idioma: aunque se anuncian 53 idiomas, la evaluación se limita a 15 de ellos (japonés, inglés y 14 adicionales), por lo que la calidad en el resto no está documentada.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones específicas que deben consultarse antes de desplegar el modelo en producción.
- Cuantización: las variantes GGUF pueden presentar pequeñas pérdidas de precisión frente a BF16; la model card incluye tablas de diferencias de precisión por formato, pero no se detallan en la información disponible.
- Idiomas no soportados: no se garantiza un comportamiento correcto fuera de los 53 idiomas listados.
- Ausencia de datos de rendimiento medidos: no hay cifras de latencia ni throughput, lo que dificulta planificar dimensionamiento sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF/blob/main/README_ja.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
