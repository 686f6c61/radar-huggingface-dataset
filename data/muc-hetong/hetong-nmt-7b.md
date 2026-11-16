# MUC-HeTong/HeTong-NMT-7B

## Resumen

HeTong-NMT-7B es un modelo de traducción automática neuronal de 7.500 millones de parámetros (7.504.568.320 exactos según los pesos en safetensors) desarrollado por el grupo MUC-HeTong. Su propósito es la traducción bidireccional entre el chino y tres lenguas minoritarias de China: mongol, tibetano y uigur, lo que cubre seis direcciones de traducción (mongol→chino, chino→mongol, tibetano→chino, chino→tibetano, uigur→chino y chino→uigur) a nivel de frase.

El modelo emplea la arquitectura `hunyuan_v1_dense`, es decir, un transformer denso de la familia Hunyuan, empaquetado en formato safetensors con un repositorio de 15,0 GB. La model card lo presenta como la base sobre la que se construye TC-Backbone, el backbone de traducción tibetano-chino de la propuesta BATA, inicializado a partir de Hy-MT2-7B y ajustado con supervisión de parámetros completos sobre aproximadamente 570.000 pares de frases paralelas tibetano-chino en ambas direcciones.

Su relevancia es doble: por un lado, cubre pares lingüísticos de bajos recursos que rara vez aparecen en modelos multilingües generalistas; por otro, forma parte de un ecosistema abierto (adaptadores LoRA BATA, dataset BATA-data y código en GitHub) orientado a la traducción asistida por terminología bilingüe. El modelo se publicó en Hugging Face el 16 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso, familia Hunyuan v1) |
| Parametros totales | 7.504.568.320 (7,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | chino, mongol, tibetano y uigur (traduccion bidireccional con el chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,0 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-11-16 |

## Arquitectura y entrenamiento

HeTong-NMT-7B es un transformer denso de 7,5 B parámetros etiquetado con la arquitectura `hunyuan_v1_dense`, lo que lo sitúa en la familia de modelos Hunyuan de Tencent. La model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención ni función de activación), por lo que esos datos deben considerarse no disponibles. Tampoco se especifica la longitud de contexto soportada ni el esquema de tokenización empleado para las escrituras mongol, tibetana y uigur.

En cuanto al entrenamiento, la información publicada es indirecta. La model card describe TC-Backbone como un backbone de traducción inicializado desde Hy-MT2-7B y adaptado mediante ajuste supervisado de parámetros completos (full-parameter SFT) sobre aproximadamente 570.000 pares de frases paralelas tibetano-chino, con ejemplos en ambas direcciones. No se indica el volumen total de tokens, la composición del corpus para mongol y uigur, ni si hubo etapas de RLHF o DPO. La innovación destacable del ecosistema es la adaptación por terminología: BATA mantiene TC-Backbone congelado y entrena adaptadores LoRA separados por dirección, que se activan en inferencia cuando el pipeline de recuperación de términos bilingües encuentra pares utilizables.

## Capacidades

- Traducción automática a nivel de frase en seis direcciones: mongol→chino, chino→mongol, tibetano→chino, chino→tibetano, uigur→chino y chino→uigur.
- Traducción bidireccional con el chino como lengua pivote para las tres lenguas minoritarias.
- Integración con terminología bilingüe mediante el ecosistema BATA: recuperación de pares de términos y activación de adaptadores LoRA específicos por dirección para tibetano-chino.
- Soporte de adaptación mediante LoRA sobre el backbone congelado, tal como demuestra el caso de BATA.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking mode).
- El alcance multilingüe declarado se limita a los cuatro idiomas indicados; no se especifica competencia en otras lenguas.

## Casos de uso

- Traducción de documentación administrativa entre chino y lenguas minoritarias: el modelo permite traducir comunicados, formularios y textos oficiales en las seis direcciones, un escenario donde los traductores generalistas suelen fallar por falta de datos de entrenamiento en mongol, tibetano y uigur.
- Localización de contenidos educativos: digitalización de materiales escolares en tibetano o mongol hacia chino (y viceversa) para su reutilización en plataformas educativas, apoyándose en la traducción a nivel de frase.
- Traducción asistida por terminología especializada: combinado con los adaptadores BATA y el pipeline de recuperación de términos, resulta adecuado para dominios con vocabulario técnico consolidado (medicina, derecho, administración) donde la consistencia terminológica es crítica.
- Preservación y acceso a patrimonio cultural: traducción de textos históricos y literarios en uigur, tibetano o mongol para facilitar su consulta por investigadores que trabajan en chino.
- Atención ciudadana multilingüe: integración en sistemas de traducción de consultas y respuestas en servicios públicos de regiones con población hablante de estas lenguas, con revisión humana posterior.
- Investigación en traducción de bajos recursos: el modelo sirve como backbone congelado para experimentar con adaptadores LoRA y estrategias de terminología, tal como hace BATA, permitiendo reproducir y extender la metodología a otros pares lingüísticos.
- Construcción de memorias de traducción aumentadas: generación de borradores automáticos que un traductor humano post-edita, reduciendo el esfuerzo en pares lingüísticos con escasa cobertura en herramientas comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 15 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 18-20 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos, con un mínimo práctico de 12 GB de VRAM.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, con un mínimo práctico de 8 GB de VRAM. Estas estimaciones son orientativas, ya que el autor no publica versiones cuantizadas (GGUF, AWQ, GPTQ).
- GPU profesionales recomendadas: A100 (40/80 GB), H100 o L40S para despliegues con concurrencia y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en RTX 3090 (24 GB); en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080) requeriría cuantización.
- Opciones de despliegue: al ser un transformer denso en safetensors con arquitectura `hunyuan_v1_dense`, es desplegable con vLLM o TGI si la arquitectura está soportada por esas herramientas; llama.cpp y Ollama requerirían conversión a GGUF, no publicada por el autor. Para el flujo con BATA, el repositorio de GitHub incluye código de entrenamiento, recuperación, inferencia y evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| HeTong-NMT-7B | 7,5 B | no disponible | chino, mongol, tibetano, uigur | no disponible | safetensors |
| Hy-MT2-7B | 7 B (referencia citada en la model card) | no disponible | no disponible | no disponible | no disponible |
| Modelos NMT multilingües generalistas (p. ej. NLLB-200) | variable (hasta 54,5 B en su version mayor) | no disponible en esta ficha | mas de 200 lenguas, cobertura escasa en mongol, tibetano y uigur | licencia abierta (CC-BY-NC en algunas variantes) | safetensors, GGUF |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado benchmarks de HeTong-NMT-7B ni métricas (BLEU, chrF, COMET) frente a otros sistemas. Hy-MT2-7B aparece únicamente como punto de partida de TC-Backbone, sin que la model card detalle sus especificaciones.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si se permite el uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad de traducción (BLEU, chrF, COMET) en ninguno de los seis pares de direcciones.
- Ámbito restringido a traducción de frases: la model card no documenta capacidades de traducción de documentos completos, conversación multi-turno ni preservación de formato.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en textos largos ni la coherencia entre frases.
- Riesgo de alucinación y omisiones en lenguas de bajos recursos: los pares mongol, tibetano y uigur tienen corpus limitados, lo que incrementa el riesgo de traducciones infieles o terminología inconsistente sin revisión humana.
- Dependencia del ecosistema BATA para terminología: la adaptación terminológica solo está documentada para tibetano-chino; no se describe un pipeline equivalente para mongol ni uigur.
- Sin versiones cuantizadas oficiales: el despliegue en hardware de consumo exige conversión propia a GGUF/AWQ/GPTQ, con el riesgo de degradación que ello conlleva.
- Sesgos no documentados: no se detalla la composición del corpus de entrenamiento ni los posibles sesgos sociolingüísticos o dialectales en las variedades cubiertas.
- Madurez del proyecto: el repositorio no registra descargas ni likes y la model card es escueta, lo que sugiere un proyecto en fase inicial sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MUC-HeTong/HeTong-NMT-7B
- Adaptadores LoRA BATA: https://huggingface.co/MUC-HeTong/BATA
- Dataset BATA-data: https://huggingface.co/datasets/MUC-HeTong/BATA-data
- Código en GitHub (entrenamiento, recuperación, inferencia y evaluación): https://github.com/MUC-HeTong/HeTong/tree/main/HeTong-NMT/BATA
