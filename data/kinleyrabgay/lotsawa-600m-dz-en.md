# kinleyrabgay/lotsawa-600m-dz-en

## Resumen

Lotsawa-600m-dz-en es un modelo de traducción automática neuronal desarrollado por Kinley Rabgay, un investigador independiente activo en el ecosistema de Hugging Face. El modelo está diseñado específicamente para la traducción entre dzongkha (idioma nacional de Bután) e inglés, un par de lenguas de bajos recursos que tradicionalmente ha recibido poca atención en el campo del procesamiento del lenguaje natural. Su nombre "Lotsawa" hace referencia a los traductores tradicionales tibetanos, lo que refleja su propósito cultural y lingüístico.

El modelo se basa en la arquitectura M2M-100 de Meta, un transformer de secuencia a secuencia multilingüe, y cuenta con aproximadamente 615 millones de parámetros. Aunque la información disponible no especifica la longitud de contexto, los modelos M2M-100 suelen operar con secuencias de hasta 1024 tokens. Su relevancia radica en abordar un par de idiomas con escasos recursos digitales, lo que puede facilitar la comunicación, la preservación cultural y el acceso a información para la comunidad butanesa y los investigadores interesados en lenguas tibetano-birmanas.

El modelo se distribuye bajo licencia MIT, lo que permite su uso comercial y académico sin restricciones significativas. Su formato de pesos es safetensors, un estándar seguro para el intercambio de modelos en el ecosistema de Hugging Face. A pesar de su reciente publicación (septiembre de 2026), el autor ha demostrado una actividad constante en el desarrollo de modelos para este par de idiomas, con versiones anteriores basadas en NLLB-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M-100 (Transformer seq2seq) |
| Parametros totales | 615.073.792 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Dzongkha (dz) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura M2M-100, un transformer de secuencia a secuencia desarrollado por Meta AI que soporta traducción directa entre 100 idiomas sin pasar por un idioma puente. M2M-100 utiliza un codificador y un decodificador con atención multi-cabeza, posicionamiento sinusoidal y capas de feed-forward. El modelo original fue entrenado con 7.500 millones de pares de oraciones, pero esta versión ha sido ajustada específicamente para el par dzongkha-inglés.

Los detalles exactos del entrenamiento no están disponibles en la información proporcionada. Sin embargo, el autor ha publicado anteriormente modelos similares (como nllb-200-600M-dzo-eng-50k) que fueron ajustados sobre el dataset kinleyrabgay/dz_to_en, lo que sugiere que este modelo sigue un enfoque similar: partir de un modelo multilingüe preentrenado y ajustarlo con datos paralelos dzongkha-inglés. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, por lo que se asume un ajuste supervisado estándar.

## Capacidades

- Traducción automática entre dzongkha e inglés en ambas direcciones.
- Generación de texto en el idioma de destino con fluidez razonable para un modelo de 600M de parámetros.
- Manejo de vocabulario específico de la cultura butanesa y tibetana, gracias al ajuste con datos locales.
- Capacidad de procesamiento de secuencias de longitud moderada (típica de M2M-100, aunque no confirmada).
- Soporte de inferencia en CPU y GPU mediante el ecosistema Hugging Face Transformers.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de traducción.

## Casos de uso

- Traducción de documentos gubernamentales: el modelo puede traducir comunicados oficiales, leyes y formularios del dzongkha al inglés, facilitando el acceso a información pública para investigadores y organizaciones internacionales.
- Preservación lingüística: permite digitalizar y traducir textos históricos y literarios en dzongkha, contribuyendo a la preservación de la lengua y la cultura butanesa.
- Atención al cliente bilingüe: empresas que operan en Bután pueden integrar el modelo en sistemas de chat para atender consultas en dzongkha e inglés, reduciendo la barrera idiomática.
- Educación y aprendizaje de idiomas: estudiantes de dzongkha o inglés pueden usar el modelo como herramienta de práctica y verificación de traducciones en entornos educativos.
- Turismo y hospitalidad: aplicaciones móviles para turistas que visitan Bután pueden incorporar traducción en tiempo real de frases comunes, mejorando la experiencia del viajero.
- Investigación académica: lingüistas y científicos de datos pueden utilizar el modelo como base para estudios sobre lenguas tibetano-birmanas o para desarrollar sistemas de traducción más avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como BLEU, chrF o TER en la model card, ni se han encontrado evaluaciones independientes en la web. Se recomienda a los usuarios realizar sus propias evaluaciones con conjuntos de datos de referencia como FLORES-200 si necesitan comparar el rendimiento con otros sistemas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB en FP16 (615M parámetros × 2 bytes), lo que permite inferencia en GPUs con 4 GB o más de VRAM.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores para inferencia cómoda. También puede ejecutarse en GPUs de datacenter como A10 o T4.
- Compatibilidad con CPU: es posible ejecutar el modelo en CPU con 8-16 GB de RAM, aunque la latencia será mayor (varios segundos por frase).
- Opciones de despliegue: Hugging Face Transformers, PyTorch, ONNX Runtime, y potencialmente vLLM o TGI si se convierte a los formatos adecuados.
- Latencia estimada: en una GPU RTX 3060, la traducción de una frase de 20 tokens debería completarse en menos de 200 ms. En CPU, la latencia puede superar los 2 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lotsawa-600m-dz-en | 615M | No disponible | dz-en | MIT | safetensors |
| nllb-200-600M-dzo-eng-50k | 615M | 1024 tokens | dz-en | CC-BY-NC | safetensors |
| M2M-100-418M | 418M | 1024 tokens | 100 idiomas | MIT | safetensors |
| OPUS-MT (Helsinki-NLP) | Variable | Variable | 1000+ pares | CC-BY | Varios |

El modelo compite directamente con la versión NLLB-200 ajustada por el mismo autor, que tiene el mismo tamaño pero una licencia más restrictiva (CC-BY-NC). M2M-100-418M es más pequeño y cubre más idiomas, pero no está ajustado específicamente para dzongkha. Los modelos OPUS-MT ofrecen una amplia cobertura pero suelen tener peor rendimiento en lenguas de bajos recursos.

## Limitaciones y advertencias

- Sesgos potenciales: al ser un modelo ajustado con datos limitados, puede reflejar sesgos presentes en el corpus de entrenamiento, especialmente en temas políticos, religiosos o de género.
- Riesgo de alucinación: como todos los modelos de traducción, puede generar contenido plausible pero incorrecto, especialmente con frases ambiguas o poco frecuentes.
- Limitaciones de contexto: la longitud de contexto no está confirmada, pero los modelos M2M-100 suelen limitarse a 1024 tokens, lo que impide traducir documentos largos de una sola vez.
- Cobertura idiomática limitada: solo soporta dzongkha e inglés, sin capacidad para otros idiomas de la región como tibetano o nepalí.
- Calidad variable: el rendimiento en dominios especializados (legal, médico, técnico) puede ser inferior al de modelos entrenados con datos específicos de esos dominios.
- Sin garantías de producción: al ser un modelo de investigación sin mantenimiento activo, no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinleyrabgay/lotsawa-600m-dz-en
- Perfil del autor en Hugging Face: https://huggingface.co/kinleyrabgay
- Perfil del autor en GitHub: https://github.com/kinleyrabgay
- Repositorio Lotsawa (CompassionAI): https://github.com/CompassionAI/lotsawa
- Modelo relacionado (NLLB-200 dz-en): https://huggingface.co/kinleyrabgay/nllb-200-600M-dzo-eng-50k
