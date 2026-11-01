# rimrafadii/marathi-conformer-130m-dense

## Resumen

El modelo `rimrafadii/marathi-conformer-130m-dense` es un sistema de reconocimiento automático del habla (ASR) para maratí, desarrollado por el usuario rimrafadii. Se trata de un Conformer completamente denso de 12 capas con dimensión de modelo 512, 8 cabezas de atención y un factor de expansión de la FFN de 8, que suma 130.812.425 parámetros, todos activos en cada pasada forward. Emplea decodificación CTC sobre un vocabulario de 105 caracteres.

Su relevancia radica en su función como control estrictamente emparejado en parámetros frente a una variante Sparse MoE condicionada por dialecto del mismo autor. Ambos modelos se entrenaron durante 300.000 pasos de alineamiento sobre el mismo conjunto de datos, lo que permite aislar el efecto de la arquitectura (densa frente a MoE dispersa) en el rendimiento sobre dialectos del maratí. El modelo se distribuye con licencia MIT y un repositorio de 0,5 GB.

El modelo aborda el reconocimiento de habla en maratí con especial atención a la variación dialectal, evaluado sobre el conjunto de evaluación RESPIN con dialectos Malvani, Ahirani, Varhadi y maratí estándar. Su tamaño compacto (130M parámetros) lo hace adecuado para despliegues con recursos limitados, aunque sus tasas de error son elevadas en los dialectos no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer denso (12 capas, d_model=512, 8 cabezas de atención, FFN expansion=8, kernel size=31) |
| Parámetros totales | 130.812.425 |
| Parámetros activos | 130.812.425 (100% activos, modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | maratí (mr) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo es un Conformer denso de 12 capas con dimensión de modelo 512, 8 cabezas de atención, factor de expansión de la FFN de 8 y tamaño de kernel de 31 en las convoluciones. La salida se decodifica mediante CTC, con decodificación greedy y beam search sobre un vocabulario de 105 caracteres. No emplea mezcla de expertos: los 130,8 millones de parámetros se activan íntegramente en cada pasada forward, lo que lo convierte en el control denso emparejado en capacidad frente a la variante Sparse MoE del mismo autor.

El entrenamiento se realizó durante 300.000 pasos de alineamiento sobre tres conjuntos de datos: `rimrafadii/respin-iisc`, `ai4bharat/Kathbath` y `ARTPARK-IISc/Vaani`. La model card no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino adicional. Tampoco se especifica si hubo entrenamiento con objetivos auxiliares distintos del CTC.

## Capacidades

- Reconocimiento automático del habla en maratí con salida a nivel de carácter (vocabulario de 105 caracteres).
- Decodificación CTC en modo greedy y beam search.
- Evaluación específica sobre variantes dialectales del maratí: Malvani, Ahirani, Varhadi y estándar.
- Diseñado como control experimental para comparación con arquitecturas MoE condicionadas por dialecto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá del ASR ni multilingüismo fuera del maratí.

## Casos de uso

- Transcripción de audio en maratí estándar: con un WER del 31,33% en el dialecto estándar (D3), es utilizable en escenarios donde se tolere una tasa de error moderada-alta, como indexación aproximada de contenido o generación de subtítulos revisables por humanos.
- Investigación comparativa de arquitecturas ASR: sirve como línea base densa emparejada en parámetros frente a variantes MoE, permitiendo aislar el efecto de la dispersión en el rendimiento por dialecto.
- Preentrenamiento o ajuste fino para dialectos específicos: al estar entrenado sobre múltiples dialectos, puede servir como punto de partida para fine-tuning en dominios o variedades concretas con datos adicionales.
- Despliegue en entornos con recursos limitados: sus 130M parámetros y su naturaleza densa permiten inferencia en CPU o GPU de gama baja, sin necesidad de infraestructura para modelos dispersos.
- Evaluación de robustez dialectal: útil para medir la brecha de rendimiento entre maratí estándar y dialectos (31,33% frente a 45,29% en Malvani) en pipelines de ASR.
- Prototipado de transcripción en aplicaciones de voz para maratí: adecuado para pruebas de concepto y validación de producto antes de invertir en modelos de mayor tamaño o en sistemas comerciales.

## Benchmarks y rendimiento

Resultados sobre el conjunto de evaluación RESPIN (held-out), según la model card:

| Dialecto | WER |
|---|---|
| Malvani (D1) | 45,29% |
| Ahirani (D2) | 42,41% |
| Estándar (D3) | 31,33% |
| Varhadi (D4) | 39,90% |
| Agregado | 39,82% |
| CER agregado | 11,40% |

No se proporcionan comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 130,8M parámetros en precisión completa (fp32) ocuparía aproximadamente 0,5 GB solo en pesos, y menos en fp16 o int8, aunque no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder alojarlo, pero no se documenta.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño de parámetros, pero no se confirma en la información disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni frameworks ASR específicos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. La model card menciona una variante Sparse MoE Conformer condicionada por dialecto del mismo autor como contraparte experimental, pero no se incluyen sus parámetros, contexto ni resultados numéricos en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| marathi-conformer-130m-dense | 130,8M | no disponible | MIT | HuggingFace |
| Sparse MoE Conformer (mismo autor) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasas de error elevadas: WER agregado del 39,82% y CER del 11,40%, con especial degradación en dialectos (45,29% en Malvani). No es adecuado para transcripción de alta precisión sin revisión humana.
- Brecha dialectal significativa: el rendimiento en maratí estándar (31,33%) es notablemente mejor que en dialectos, lo que puede introducir sesgo contra hablantes de variedades no estándar.
- Sesgos conocidos: no documentados explícitamente, pero la composición del dataset (RESPIN, Kathbath, Vaani) puede no representar toda la variación dialectal, de género, edad o registro.
- Riesgo de alucinación en ASR: la decodificación CTC puede producir sustituciones e inserciones plausibles, especialmente en audio ruidoso o con acento no representado.
- Limitación de idioma: solo maratí (mr); no soporta otros idiomas ni code-switching documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, deben respetarse las licencias de los datasets de entrenamiento subyacentes.
- Caveat para producción: no se documentan cuantizaciones, formatos de pesos ni frameworks de despliegue, lo que dificulta la integración directa en pipelines de producción sin trabajo adicional de conversión.
- Contexto de audio: no se especifica la longitud máxima de audio soportada ni la frecuencia de muestreo esperada.

## Enlaces

- HuggingFace: https://huggingface.co/rimrafadii/marathi-conformer-130m-dense
- Dataset RESPIN-IISc: https://huggingface.co/datasets/rimrafadii/respin-iisc
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
