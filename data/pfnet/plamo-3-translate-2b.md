# pfnet/plamo-3-translate-2b

## Resumen

PLaMo 3 Translate 2B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN), una empresa japonesa de inteligencia artificial. Forma parte de la familia PLaMo 3 Translate, disponible en cuatro tamaños (0.8B, 2B, 8B y 31B), y se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción.

El modelo cubre la traducción entre 53 idiomas, con especial énfasis en pares que involucran japonés e inglés, y permite incorporar contexto circundante y glosarios para mejorar la coherencia terminológica. Además, ofrece la posibilidad de elegir entre un estilo de salida llano o cortés para el japonés. Su ventana de entrenamiento alcanza los 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

Con 2.878.595.584 parámetros y un repositorio de 5,8 GB en formato safetensors, el modelo está pensado para despliegues locales y entornos con recursos moderados. Su relevancia actual radica en que compite con modelos especializados en traducción de mayor tamaño y ofrece pesos abiertos bajo la PLaMo Community License, lo que facilita su evaluación y uso en investigación y proyectos no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos de capas y atención no disponibles) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada y salida combinadas durante entrenamiento) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| Idiomas soportados | 53 idiomas (ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh) |
| Licencia | PLaMo Community License |
| Formato de pesos | safetensors (BF16); variantes GGUF, MLX y cuantizadas en repositorios separados |

## Arquitectura y entrenamiento

PLaMo 3 Translate 2B es un transformer decoder-only especializado en traducción. Se inicializa a partir de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se somete a un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción. La longitud máxima durante el entrenamiento fue de 32.768 tokens considerando entrada y salida en conjunto, lo que define el límite práctico para traducir pasajes largos en una sola inferencia.

El modelo incorpora mecanismos para aprovechar contexto circundante y glosarios, lo que permite mantener consistencia terminológica en documentos técnicos o corporativos. También admite la selección entre estilo llano y cortés para las salidas en japonés, un aspecto relevante en el contexto cultural nipón. No se dispone de información detallada sobre la composición exacta del dataset, el uso de RLHF o DPO, ni innovaciones arquitectónicas específicas más allá de lo indicado en la model card.

## Capacidades

- Traducción entre 53 idiomas, con especial calidad en pares japonés-inglés y en combinaciones con 14 idiomas adicionales evaluados (árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso).
- Traducción bidireccional con contexto circundante: el modelo puede considerar texto previo o posterior para resolver ambigüedades.
- Soporte de glosarios: permite imponer terminología específica en la salida.
- Control de estilo en japonés: elección entre registro llano y cortés.
- Procesamiento de pasajes largos de hasta 32.768 tokens combinando entrada y salida.
- Capacidad multilingüe amplia, incluyendo idiomas de bajos recursos como cebuano, javanés, jemer, birmano, cingalés o uzbeko.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido; el modelo está orientado exclusivamente a traducción.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas de hasta 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios, lo que resulta adecuado para documentación de productos con terminología repetitiva.
- Localización de software y aplicaciones: integrado en pipelines de localización, permite traducir cadenas y textos de interfaz entre los 53 idiomas soportados, con la ventaja de poder ejecutarse localmente sin depender de APIs externas.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones multi-turno aprovechando el contexto circundante para mantener coherencia en la conversación, aunque su ventana está limitada a 32.768 tokens combinados.
- Traducción de documentación legal o corporativa con glosarios: la capacidad de imponer terminología específica lo hace útil para traducir contratos o informes donde ciertos términos deben mantenerse consistentes.
- Investigación en traducción automática: al ser un modelo de pesos abiertos con licencia que permite uso académico gratuito, sirve como base para experimentos de fine-tuning, evaluación de métricas o estudios comparativos.
- Traducción en dispositivos locales: con 2,8B parámetros y variantes GGUF y MLX-4bit, puede desplegarse en portátiles y equipos de sobremesa con GPU de consumo, lo que facilita su uso en entornos con requisitos de privacidad.
- Generación de subtítulos y traducción de contenido audiovisual: su capacidad para procesar pasajes largos y su soporte de 53 idiomas lo hacen adecuado para traducir guiones o subtítulos, aunque la alineación temporal quedaría fuera del alcance del modelo.
- Herramientas CLI de traducción local: existe una interfaz de línea de comandos oficial (plamo-translate-cli) que permite usar el modelo para traducción local sin conexión.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate 2B supera a los LLM especializados en traducción comparados en todas las métricas, incluyendo TranslateGemma y HY-MT2. Las evaluaciones se presentan en tres bloques: calidad japonés-inglés como media de PFTB, SaaS y WMT24++ COMET-22; traducción entre japonés y 14 idiomas adicionales como media de FLORES+ chrF++ en ambas direcciones; y traducción entre inglés y esos mismos 14 idiomas con la misma métrica. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada, ya que la model card remite a una figura y al blog técnico.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | No disponible (supera a modelos comparados según la model card) |
| Japonés ↔ 14 idiomas | FLORES+ chrF++ (media bidireccional) | No disponible (supera a modelos comparados según la model card) |
| Inglés ↔ 14 idiomas | FLORES+ chrF++ (media bidireccional) | No disponible (supera a modelos comparados según la model card) |

No se han publicado resultados numéricos detallados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5,8 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda al menos 8-10 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 4 bits (W4A16, GGUF Q4, MLX-4bit): en torno a 1,5-2 GB para los pesos, más overhead; puede ejecutarse en GPUs con 4-6 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de producción con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo; GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) para inferencia en cuantización.
- Cabe en GPU de consumo: sí, especialmente en variantes GGUF Q4 o MLX-4bit; en BF16 requiere GPUs con al menos 8 GB.
- Opciones de despliegue: transformers (librería nativa), llama.cpp y Ollama a través de los repositorios GGUF, MLX para Apple Silicon, vLLM y TGI previsiblemente compatibles al ser un transformer estándar con custom_code, aunque no se confirma explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B | 2,88B | 32.768 tokens (entrada+salida) | 53 | PLaMo Community License | safetensors, GGUF, MLX, FP8, W4A16, W4AFP8, NVFP4 |
| PLaMo 3 Translate 0.8B | 0,8B (aprox.) | No disponible | 53 | PLaMo Community License | Mismos formatos |
| PLaMo 3 Translate 8B | 8B (aprox.) | No disponible | 53 | PLaMo Community License | Mismos formatos |
| PLaMo 3 Translate 31B | 31B (aprox.) | No disponible | 53 | PLaMo Community License | Mismos formatos |
| TranslateGemma | No disponible | No disponible | No disponible | No disponible | No disponible |
| HY-MT2 | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona comparaciones con TranslateGemma y HY-MT2, indicando que PLaMo 3 Translate 2B supera a ambos en todas las métricas evaluadas, pero no se proporcionan especificaciones detalladas de estos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; como todo modelo entrenado con datos web, puede reflejar sesgos presentes en los corpus utilizados.
- Riesgo de alucinación: aunque es un modelo especializado en traducción, puede generar traducciones plausibles pero incorrectas en pasajes ambiguos o con terminología muy especializada; el uso de glosarios y contexto mitiga parcialmente este riesgo.
- Limitación de contexto: la ventana de 32.768 tokens es combinada entre entrada y salida, por lo que pasajes muy largos deben dividirse; no se especifica el comportamiento en contextos que excedan este límite.
- Limitaciones de idioma: aunque soporta 53 idiomas, la calidad puede variar significativamente entre pares; la evaluación se centró en 15 idiomas (japonés, inglés y 14 adicionales), por lo que el rendimiento en el resto es menos conocido.
- Restricciones de licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- Caveat para producción: la cuantización GGUF Q2_K muestra una precisión de traducción inferior en algunas métricas según la model card; para producción se recomienda BF16, FP8 o cuantizaciones de 4 bits distintas de Q2_K.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe esperarse su uso en pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-2b/blob/main/README_ja.md
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- CLI oficial: https://github.com/pfnet/plamo-translate-cli
- Referencia en LLM Reference: https://www.llmreference.com/model/plamo-3-translate-2b
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-2b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-2b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-2b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
