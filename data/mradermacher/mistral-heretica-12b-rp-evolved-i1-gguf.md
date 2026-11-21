# mradermacher/Mistral-Heretica-12B-RP-Evolved-i1-GGUF

## Resumen

Mistral-Heretica-12B-RP-Evolved-i1-GGUF es una redistribución en formato GGUF del modelo Mistral-Heretica-12B-RP-Evolved, publicado por el usuario mradermacher en Hugging Face. Se trata de una cuantización del modelo original de mrcuddle, orientada a inferencia local y a despliegues de bajo consumo de memoria. El modelo base es un ajuste fino de Mistral de 12B parámetros (12.247.782.400 parámetros reales según safetensors) especializado en roleplay (RP), tal como indica el sufijo "RP" en su nombre.

La relevancia de esta ficha radica en que el repositorio es una mera conversión a GGUF con cuantizaciones ponderadas mediante imatrix, no un modelo nuevo. El autor no aporta model card propia: el README es únicamente un conjunto de metadatos de la herramienta de conversión. Por tanto, toda la información sobre arquitectura, entrenamiento, licencia e idiomas del modelo subyacente queda fuera del alcance de los datos disponibles y se marca como no disponible.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 35,8 GB y fue creado el 21 de noviembre de 2026. La fecha de creación es posterior a la fecha actual, lo que constituye una anomalía que conviene señalar al evaluar la fiabilidad del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Mistral de 12B, detalles no confirmados) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base más allá de que se trata de un modelo de 12.247.782.400 parámetros derivado de la familia Mistral, según el nombre del modelo original (mrcuddle/Mistral-Heretica-12B-RP-Evolved). No se confirma si es un transformer denso, el número de capas, la dimensión de atención ni el mecanismo de atención empleado.

Respecto al entrenamiento, el repositorio no documenta el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. El sufijo "RP" sugiere un ajuste orientado a roleplay, pero no hay evidencia en la información proporcionada que detalle el proceso. La única innovación técnica documentada es el uso de cuantizaciones ponderadas con imatrix (importance matrix) para mejorar la calidad de los cuantizados de baja precisión, generadas con una herramienta de conversión cuyo tipo se indica como "hf" y versión de cuantización 2.

## Capacidades

- Generación de texto conversacional: el tag "conversational" en el repositorio y el sufijo "RP" indican orientación a diálogo y roleplay.
- Roleplay y personificación: el nombre del modelo base (Mistral-Heretica-12B-RP-Evolved) apunta a este uso, aunque no se detallan capacidades específicas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües: no disponibles.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que el formato GGUF puede servirse mediante infraestructura compatible con endpoints de Hugging Face.

## Casos de uso

- Roleplay local en escritorio: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo con GPU consumer, gracias a las cuantizaciones Q4_K_M o Q5_K_M que reducen el peso a aproximadamente 7-8 GB, adecuado para mantener conversaciones de personaje sin conexión.
- Prototipado de chatbots conversacionales: las variantes Q2_K e IQ2 permiten desplegar el modelo en hardware muy limitado (menos de 5 GB de VRAM) para pruebas de concepto de diálogo, aceptando la pérdida de calidad asociada a la cuantización extrema.
- Evaluación de ajustes finos de roleplay: investigadores que quieran comparar la calidad de un modelo RP de 12B frente a alternativas pueden usar las distintas cuantizaciones para medir el impacto de la precisión en la coherencia narrativa.
- Generación de ficción interactiva: con contexto suficiente (no confirmado), el modelo puede mantener tramas multi-turno en aplicaciones de escritura asistida, siempre que se valide empíricamente la ventana de contexto real.
- Despliegue en servidores con vLLM o TGI: aunque el formato GGUF no es el nativo de vLLM, existen adaptadores; para TGI sería necesario convertir a safetensors. El tag "endpoints_compatible" facilita su uso en infraestructuras de inferencia gestionadas.
- Experimentación con cuantizaciones imatrix: el repositorio ofrece 24 variantes de cuantización, lo que lo convierte en un banco de pruebas para estudiar la degradación de calidad entre IQ1 e IQ4 en un modelo de 12B orientado a diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada a partir de 12.247.782.400 parámetros):
  - IQ1_S / IQ1_M: ~2,5-3,5 GB
  - Q2_K / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~4-5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~5,5-7 GB
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: ~7-8,5 GB
  - Q5_K_S / Q5_K_M: ~8,5-10 GB
  - Q6_K: ~10-11 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100. Las cuantizaciones Q4 y Q5 caben en GPUs consumer de 8-12 GB; las Q6_K requieren 12 GB o más.
- Cabe en GPU consumer: sí, desde una RTX 3060 de 12 GB con Q4_K_M o Q5_K_M; las variantes IQ2 e IQ3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere soporte en endpoints de Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Heretica-12B-RP-Evolved-i1-GGUF (este) | 12.247.782.400 | no disponible | no disponible | GGUF | Cuantizaciones imatrix, 24 variantes |
| Mistral-Heretica-12B-RP-Evolved (original) | 12.247.782.400 | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva este GGUF |
| Mistral 7B Instruct | ~7.240 millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia de la familia Mistral, menor tamaño |
| Mistral Nemo 12B Instruct | ~12.000 millones | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de 12B con contexto largo y licencia permisiva |

La comparación con Mistral 7B y Nemo 12B es orientativa: no se dispone de datos de rendimiento del modelo evaluado para establecer una comparación cuantitativa. La licencia del modelo evaluado no está disponible, lo que impide confirmar si permite uso comercial, a diferencia de las alternativas oficiales de Mistral AI.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se debe consultar el modelo original (mrcuddle/Mistral-Heretica-12B-RP-Evolved) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo soporta castellano con calidad suficiente.
- Contexto no documentado: no se puede planificar su uso en conversaciones largas sin validación empírica.
- Riesgo de alucinación: inherente a los modelos de 12B y agravado en cuantizaciones IQ1 e IQ2, que degradan la coherencia.
- Sesgos: no documentados; al ser un ajuste de roleplay, puede reproducir estereotipos de personajes y diálogo.
- Fecha de creación anómala (2026-11-21, posterior a la fecha actual): conviene verificar la integridad y procedencia del artefacto.
- 0 descargas y 0 likes: sin validación comunitaria; no hay evidencia de que las cuantizaciones hayan sido probadas por terceros.
- El README no es una model card real: solo contiene metadatos de la herramienta de conversión, sin instrucciones de uso ni advertencias del autor.
- El formato GGUF no es directamente compatible con vLLM nativo; requiere llama.cpp, Ollama o conversión previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-i1-GGUF
- Modelo original: https://huggingface.co/mrcuddle/Mistral-Heretica-12B-RP-Evolved
