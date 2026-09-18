# lubzo/gemma-2-2b-marathi-lora

## Resumen

gemma-2-2b-marathi-lora es un adaptador LoRA (PEFT) entrenado sobre el modelo base google/gemma-2-2b para instrucciones en marati (mr), una lengua indoaria con recursos limitados. Lo publica el usuario lubzo en HuggingFace y su objetivo declarado es reproducir la configuracion experimental descrita en Khade et al., CHiPSAL 2025 ("Challenges in Adapting Multilingual LLMs to Low-Resource Languages using LoRA PEFT Tuning"). No es un modelo completo: el repositorio solo contiene los pesos del adaptador, que deben cargarse junto al modelo base.

El entrenamiento se hizo sobre 51.760 pares instruccion-respuesta traducidos automaticamente al marati a partir del dataset Cleaned Stanford Alpaca (unsloth/alpaca-cleaned), con 3 epocas, optimizador AdamW y precision FP16/BF16 sobre pesos base sin cuantizar. Los modulos objetivo del adaptador son q_proj, k_proj, v_proj y o_proj, con r = 16, alpha = 32 y dropout = 0,05.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para estudiar el rendimiento de LoRA PEFT en lenguas de bajos recursos y como punto de comparacion frente a los resultados publicados en el taller CHiPSAL 2025. El propio autor lo etiqueta como un artefacto de investigacion y educacion, no como un asistente listo para produccion, y el repositorio tiene un volumen de uso muy bajo (15 descargas, 0 likes), por lo que no existe validacion externa de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/gemma-2-2b) con adaptador LoRA PEFT acoplado |
| Parametros totales | Aproximadamente 2,6 mil millones en el modelo base google/gemma-2-2b mas el adaptador LoRA; el autor no publica el recuento exacto de parametros del adaptador (el repositorio ocupa 0,2 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens, segun la especificacion del modelo base google/gemma-2-2b; la model card del adaptador no la declara |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (FP16/BF16, safetensors). No se publican versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | Marati (mr) como idioma objetivo del ajuste; el modelo base google/gemma-2-2b es multilingue, aunque la model card no detalla la lista de idiomas |
| Licencia | Gemma Terms of Use (identificador "gemma") |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

Detalles del adaptador declarados por el autor:

| Hiperparametro | Valor |
|---|---|
| Metodo de ajuste | LoRA (Low-Rank Adaptation) |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj |
| rango (r) | 16 |
| alpha | 32 |
| dropout | 0,05 |
| Epocas | 3 |
| Optimizador | AdamW |
| Precision de entrenamiento | FP16 / BF16 sobre pesos base sin cuantizar |
| Dataset | lubzo/marathi-alpaca-cleaned-translated (51.760 pares) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-2-2b, un transformer decoder-only de aproximadamente 2,6 mil millones de parametros con atencion por ventana deslizante y capas de atencion global alternas, 8.192 tokens de contexto y un vocabulario de gran tamano orientado a uso multilingue. La intervencion consiste exclusivamente en matrices de bajo rango sobre las proyecciones de consulta, clave, valor y salida de la atencion (q_proj, k_proj, v_proj, o_proj), con r = 16 y alpha = 32. No se modifican las capas MLP ni las normas, y no se realiza destilacion ni poda; el adaptador suma un numero reducido de parametros entrenables que se cargan sobre los pesos base congelados en FP16/BF16.

Los datos de entrenamiento proceden de la traduccion automatica al marati del dataset Cleaned Stanford Alpaca: 51.760 pares instruccion-respuesta, con 3 epocas completas sobre ese corpus. No se menciona en la model card ninguna fase de RLHF, DPO ni ajuste por preferencias, ni una mezcla adicional de datos nativos en marati; el propio autor advierte que el material es traducido y no de autoria nativa. Tampoco se documentan innovaciones tecnicas propias mas alla de la replicacion del esquema experimental de Khade et al. (CHiPSAL 2025).

## Capacidades

- Generacion de texto e instrucciones en marati: es la funcion principal para la que se entreno el adaptador.
- Seguimiento de instrucciones de formato Alpaca (pregunta-respuesta), heredado del esquema del dataset de entrenamiento.
- Clasificacion de texto en marati y en tareas multilingues: las unicas evaluaciones publicadas son de clasificacion (sentimiento, XNLI) y de razonamiento multiple (ARC, COPA).
- Razonamiento basico de sentido comun y comprension lectora: evaluado con ARC-Easy, ARC-Challenge, IndicCOPA e IndicXNLI mediante el harness AI4Bharat Airavata.
- Transferencia multilingue parcial: al partir de un modelo base multilingue, conserva cierta capacidad en otras lenguas, aunque el ajuste se hizo solo en marati y no se documenta su degradacion en el resto.
- Soporte de tool calling / function calling: no disponible; no se menciona ni se entrena para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia ni documentacion al respecto.
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito (thinking mode): no disponibles en este adaptador.

## Casos de uso

- Investigacion sobre adaptacion de LLM a lenguas de bajos recursos: sirve como replicacion reproducible del esquema LoRA PEFT descrito en Khade et al. (2025), permitiendo comparar directamente las cifras del adaptador con las del modelo base y con los resultados publicados en el taller CHiPSAL.
- Evaluacion comparativa de harnesses: al haberse medido con el harness AI4Bharat Airavata sobre IndicSentiment, ARC-Easy, ARC-Challenge, IndicCOPA e IndicXNLI, es util para validar la reproducibilidad de ese pipeline en un modelo de 2,6 mil millones de parametros.
- Generacion de texto asistida en marati para prototipos internos: con 8.192 tokens de contexto heredados del modelo base, permite mantener conversaciones de varios turnos o procesar documentos cortos en marati sin salir de una unica GPU de consumo.
- Aumento de datos en marati: generar variantes de instrucciones y respuestas para ampliar corpus de entrenamiento en esta lengua, siempre con revision humana posterior por el riesgo de artefactos de traduccion.
- Experimentos academicos de transferencia cross-lingual: comparar el comportamiento del adaptador frente al modelo base en tareas de inferencia linguistica (IndicXNLI) o de sentimiento (IndicSentiment) para estudiar que se gana y que se pierde con el ajuste.
- Punto de partida para fusionar el adaptador con el modelo base y exportar a GGUF: permite construir un modelo de 2,6 mil millones de parametros ejecutable en CPU o en GPU modesta para demostraciones docentes en marati.
- Docencia y talleres sobre PEFT: el repositorio es pequeno (0,2 GB) y su configuracion esta completamente documentada, lo que lo hace adecuado para ilustrar un flujo completo de carga con transformers + peft en un aula o tutorial.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con el harness AI4Bharat Airavata. Se comparan el modelo base y el adaptador ajustado en marati, junto con las cifras que el articulo de referencia reporta para el mismo modelo base.

| Modelo | Metrica | IndicSentiment | ARC-Easy | ARC-Challenge | IndicCOPA | IndicXNLI |
|---|---|---|---|---|---|---|
| gemma-2-2b (base) | Accuracy | 0,9180 | 0,8085 | 0,6570 | 0,5698 | 0,3782 |
| gemma-2-2b (base) | Binary F1 (clase 1) | 0,9093 | N/A | N/A | 0,6013 | N/A |
| gemma-2-2b (base) | Macro F1 | 0,9172 | 0,6463 | 0,5247 | 0,5671 | 0,3075 |
| gemma-2-2b (base) | F1 reportado en el paper | 0,9206 | 0,6384 | 0,6463 | 0,6577 | 0,2191 |
| gemma-2-2b (Mr, adaptador) | Accuracy | 0,9520 | 0,7424 | 0,4300 | 0,5158 | 0,4439 |
| gemma-2-2b (Mr, adaptador) | Binary F1 (clase 1) | 0,9502 | N/A | N/A | 0,6687 | N/A |
| gemma-2-2b (Mr, adaptador) | Macro F1 | 0,9519 | 0,7924 | 0,3043 | 0,3846 | 0,3551 |
| gemma-2-2b (Mr, adaptador) | F1 reportado en el paper | no disponible | no disponible | no disponible | no disponible | no disponible |

Lectura de los datos: el ajuste mejora IndicSentiment (accuracy de 0,9180 a 0,9520 y macro F1 de 0,9172 a 0,9519) e IndicXNLI (accuracy de 0,3782 a 0,4439), asi como el macro F1 en ARC-Easy (0,6463 a 0,7924), pero degrada de forma clara ARC-Challenge (accuracy de 0,6570 a 0,4300) e IndicCOPA (accuracy de 0,5698 a 0,5158 y macro F1 de 0,5671 a 0,3846). El autor no incluye comparaciones con otros modelos ajustados, ni metricas generativas como perplejidad o evaluacion humana. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: el modelo base de aproximadamente 2,6 mil millones de parametros ocupa en torno a 5-6 GB de pesos, mas el adaptador, la cache KV y activaciones; en la practica se necesitan entre 6 y 8 GB de VRAM para contexto corto y mas de 10 GB para aprovechar los 8.192 tokens de contexto.
- VRAM estimada con cuantizacion de 4 bits del modelo base: alrededor de 2-3 GB de pesos, aunque el autor no publica ninguna version cuantizada del adaptador.
- GPU de consumo: cabe comodamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en cualquier GPU con 12 GB o mas. En GPUs de 8 GB es viable con contexto reducido o con el base cuantizado.
- GPU de datacenter: funcional en A100, H100, L40S o A10G, aunque el modelo es sobredimensionado para ese hardware y no aprovechara su capacidad; se usaria solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers + peft es la ruta documentada por el autor en la propia model card. vLLM y TGI soportan carga de adaptadores LoRA sobre un modelo base, opcion adecuada para servir varias tareas con un unico base cargado. Para llama.cpp u Ollama hay que fusionar el adaptador con el modelo base (merge_and_unload) y convertir despues a GGUF, ya que no se publican ficheros GGUF del adaptador.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de tokens por segundo, latencia ni pruebas de concurrencia, y el repositorio no incluye configuracion de servido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| lubzo/gemma-2-2b-marathi-lora (este modelo) | ~2,6 mil millones (base) + adaptador LoRA | 8.192 tokens (heredado del base) | Gemma Terms of Use | Adaptador PEFT en safetensors, 0,2 GB | IndicSentiment acc. 0,9520; ARC-Challenge acc. 0,4300; IndicXNLI acc. 0,4439 |
| google/gemma-2-2b (base) | ~2,6 mil millones | 8.192 tokens | Gemma Terms of Use | Pesos completos en safetensors | IndicSentiment acc. 0,9180; ARC-Challenge acc. 0,6570; IndicXNLI acc. 0,3782 |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.192 tokens | Gemma Terms of Use | Pesos completos, ajustado a instrucciones y RLHF | No disponible en la informacion proporcionada |
| Modelo de referencia de Khade et al., CHiPSAL 2025 | No disponible | No disponible | No disponible | Solo publicacion academica | F1 reportado en el paper para el base: IndicSentiment 0,9206; ARC-Easy 0,6384; ARC-Challenge 0,6463; IndicCOPA 0,6577; IndicXNLI 0,2191 |

La comparacion directa solo es posible contra google/gemma-2-2b, porque es el unico modelo con cifras medidas en el mismo harness y en las mismas condiciones. Frente a gemma-2-2b-it, la diferencia relevante es que el adaptador no ha pasado por RLHF y su ajuste se limita a instrucciones traducidas al marati.

## Limitaciones y advertencias

- Datos traducidos automaticamente: el corpus es una traduccion del Alpaca limpio en ingles, no texto nativo en marati, por lo que el adaptador hereda artefactos de traduccion, calcos sintacticos y sesgos del corpus original (orientado a ingles y a cultura estadounidense).
- Alucinacion: no se ha medido la tasa de alucinacion y el propio autor lo describe como modelo de investigacion, no como asistente de produccion; es esperable que invente datos factuales sobre India o el mundo, especialmente en contextos largos.
- Degradacion en tareas de razonamiento: los propios numeros del autor muestran caidas fuertes en ARC-Challenge (0,6570 a 0,4300 de accuracy) e IndicCOPA (macro F1 de 0,5671 a 0,3846) tras el ajuste, lo que indica sobreajuste al formato de instruccion del dataset.
- Cobertura idiomatica estrecha: el ajuste se realiza solo en marati; no hay datos sobre como afecta al rendimiento del modelo base en otros idiomas, y la lista de idiomas soportados por el base no se detalla en la model card.
- Longitud de contexto: los 8.192 tokens son una especificacion del modelo base, no una capacidad validada para este adaptador; no hay pruebas publicadas con contexto largo.
- Volumen de validacion muy bajo: 15 descargas y 0 likes en HuggingFace, sin evaluacion de terceros ni resultados generativos (perplejidad, evaluacion humana) que respalden su calidad en tareas de generacion.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de Gemma, pero con obligaciones de atribucion y la politica de uso prohibido de Google; conviene revisar los terminos antes de integrarlo en un producto. El adaptador se distribuye por separado del modelo base, que tambien hay que aceptar.
- Formato: al ser un adaptador, requiere descargar el modelo base completo y cargarlo con peft; no es un artefacto autonomo y no existe version GGUF publicada.
- Sin soporte de herramientas ni de agentes: no hay entrenamiento ni documentacion sobre function calling, uso de herramientas o razonamiento multi-paso, por lo que no es adecuado para pipelines agenticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lubzo/gemma-2-2b-marathi-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/lubzo/marathi-alpaca-cleaned-translated
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Articulo de referencia (Khade et al., CHiPSAL 2025): https://aclanthology.org/2025.chipsal-1.22.pdf
- Dataset original de instrucciones: https://huggingface.co/datasets/unsloth/alpaca-cleaned
- Harness de evaluacion AI4Bharat Airavata: no se proporciona enlace en la model card

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces utilizables son los de la model card y los metadatos de HuggingFace.
