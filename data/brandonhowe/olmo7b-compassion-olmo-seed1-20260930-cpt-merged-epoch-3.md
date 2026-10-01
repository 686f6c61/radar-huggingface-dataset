# BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-3

## Resumen

Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-3 es un checkpoint de ajuste por preentrenamiento continuado (continued pretraining, CPT) publicado por el usuario BrandonHowe sobre el modelo base allenai/Olmo-3-1025-7B. El modelo parte de un transformer denso de 7.298.011.136 parametros (aproximadamente 7,3 mil millones) y ha sido entrenado sobre el dataset CompassioninMachineLearning/compassion_12185_cleaned, un corpus orientado a la compasion en el contexto del aprendizaje automatico.

El artefacto distribuido es un modelo fusionado (merged) en BF16, exportado con el metodo save_pretrained_merged(save_method="merged_16bit") de Unsloth y empaquetado sin perdida en ocho shards de safetensors. No requiere adaptador LoRA ni PEFT para cargarse: se puede usar directamente con transformers. Corresponde a la epoca 3.0 (paso 1125) de un entrenamiento que utilizo 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos.

Su relevancia es fundamentalmente de investigacion: se trata de un experimento de alineacion conductual mediante CPT sobre un dominio acotado (compasion), con cero descargas y cero likes en el momento de la consulta. El propio autor advierte en la model card que el entrenamiento no demuestra por si mismo una mejora en compasion y que ese extremo debe evaluarse por separado. No se han publicado especificaciones de contexto, idiomas ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 3 (segun modelo base allenai/Olmo-3-1025-7B); no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio solo publica pesos BF16 sin cuantizar; no se distribuyen variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (8 shards, BF16, merged_16bit), compatible con transformers |
| Tamano del repositorio | 14,6 GB |
| Modelo base | allenai/Olmo-3-1025-7B |
| Dataset de CPT | CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base allenai/Olmo-3-1025-7B, un transformer decoder-only denso de aproximadamente 7,3 mil millones de parametros. La informacion proporcionada no incluye detalles sobre el numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion, tokenizador ni datos de preentrenamiento originales de OLMo 3; esos datos deben consultarse en la model card del modelo base.

El entrenamiento realizado sobre este checkpoint es un preentrenamiento continuado (continued pretraining) en BF16 con el dataset compassion_12185_cleaned. Cada epoca utilizo 10.000 documentos distintos mas 2.000 exposiciones repetidas, y se reservaron 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 3.0, paso 1125. La exportacion se hizo con save_pretrained_merged(save_method="merged_16bit") de Unsloth, lo que fusiona los pesos entrenados en el modelo base y produce ocho shards safetensors validados en BF16. El autor indica que existe un fichero run_manifest.json con la revision base, hashes de seleccion de documentos, parametros de entrenamiento y validacion de la exportacion. No se documenta uso de RLHF, DPO, SFT posterior ni ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en el mismo rango de capacidades que el modelo base OLMo-3-1025-7B, sin que se documenten capacidades adicionales.
- Preentrenamiento continuado orientado a dominios de compasion y lenguaje empatico, segun el dataset utilizado.
- Carga directa como modelo fusionado en transformers, sin necesidad de adaptador.
- Capacidad de razonamiento, codigo o matematicas: no evaluada ni documentada para este checkpoint.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas soportados no disponibles).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Uso como checkpoint intermedio para estudiar la dinamica del CPT epoca a epoca.

## Casos de uso

- Investigacion sobre compasion en modelos de lenguaje: usar el checkpoint para medir si el CPT sobre compassion_12185_cleaned desplaza las respuestas del modelo base hacia formulaciones mas empaticas, comparando contra allenai/Olmo-3-1025-7B con el mismo prompt set y decodificacion.
- Generacion de datos sinteticos de dialogo empatico: producir respuestas de referencia a gran escala para anotar o aumentar datasets de entrenamiento en dominios de apoyo emocional, con revision humana posterior.
- Punto de partida para fine-tuning supervisado: al estar fusionado y en BF16, se puede aplicar SFT o LoRA directamente con transformers, PEFT o TRL sin necesidad de fusionar adaptadores.
- Estudio de deriva conductual y seguridad: evaluar como tres epocas de CPT con repeticiones (2.000 exposiciones repetidas por epoca) afectan a la tasa de alucinacion, la verbosidad o la resistencia a instrucciones daninas respecto al modelo base.
- Reproducibilidad de pipelines de CPT: el run_manifest.json permite replicar la seleccion de documentos y los hiperparametros, util para validar metodologias de continued pretraining a escala 7B.
- Prototipos de asistentes conversacionales orientados a acompanamiento: desplegar el modelo en un entorno controlado y con supervision humana para generar borradores de respuesta, siempre que se resuelva antes la licencia.
- Analisis comparativo de checkpoints por epoca: utilizar este checkpoint (epoca 3.0) junto con otros del mismo autor para trazar la evolucion de metricas de compasion y de perplejidad en el conjunto de validacion de 200 documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna metrica especifica de compasion, y advierte explicitamente que "el entrenamiento no establece una mejora en compasion; evaluar eso por separado".

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 7,3 B de parametros): BF16/FP16 en torno a 15-17 GB de pesos mas cache KV; INT8 alrededor de 8-10 GB; cuantizacion de 4 bits (Q4_K_M) en torno a 4,5-5,5 GB.
- GPU recomendadas para BF16 sin cuantizar: NVIDIA A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB y RTX 3090 24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 a BF16; en RTX 4080 16 GB, RTX 4060 Ti 16 GB o RTX 3080 12 GB conviene cuantizar, algo que requiere convertir los pesos porque el repositorio solo publica safetensors BF16.
- Opciones de despliegue: transformers (via de referencia, ya que el repo es endpoints_compatible), vLLM y SGLang para servido de alto rendimiento, TGI para despliegue gestionado, llama.cpp y Ollama tras convertir a GGUF (no hay GGUF publicado).
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Observaciones |
|---|---|---|---|---|---|
| Olmo7b-compassion-olmo-seed1-...-epoch-3 | 7,3 B | no disponible | no disponible | safetensors BF16 (8 shards) | CPT especifico sobre compasion; sin benchmarks; 0 descargas |
| allenai/Olmo-3-1025-7B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base exacto del que parte este checkpoint; referencia natural de comparacion |
| Llama 3.1 8B | aproximadamente 8 B (dato publico del fabricante) | 128.000 tokens (dato publico del fabricante) | Llama 3.1 Community License (dato publico del fabricante) | safetensors, GGUF en el ecosistema | Alternativa generalista de tamano comparable, con licencia de uso comercial condicionada |
| Mistral 7B v0.3 | aproximadamente 7,2 B (dato publico del fabricante) | 32.000 tokens (dato publico del fabricante) | Apache 2.0 (dato publico del fabricante) | safetensors, GGUF en el ecosistema | Alternativa de tamano similar con licencia permisiva |
| Qwen2.5-7B | aproximadamente 7,6 B (dato publico del fabricante) | 128.000 tokens (dato publico del fabricante) | Apache 2.0 (dato publico del fabricante) | safetensors, GGUF en el ecosistema | Alternativa multilingue de tamano similar |

Los datos de los modelos alternativos corresponden a documentacion publica de sus fabricantes y no han sido verificados en la informacion proporcionada en esta consulta; se incluyen solo como marco de referencia de categoria. No existen datos de rendimiento comparado para este checkpoint.

## Limitaciones y advertencias

- El autor declara explicitamente que el entrenamiento no demuestra una mejora en compasion; cualquier afirmacion en ese sentido requiere una evaluacion independiente que no se ha publicado.
- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, lo que bloquea su adopcion en produccion.
- Sesgos conocidos: no documentados, pero el CPT sobre un unico dataset (compassion_12185_cleaned, con 2.000 exposiciones repetidas por epoca y 3 epocas) puede inducir sobreajuste tematico y desviar el registro estilistico del modelo base.
- Riesgo de alucinacion: no evaluado; el CPT puede degradar capacidades factuales del modelo base al especializarlo, y no hay benchmarks que lo cuantifiquen.
- Limitaciones de contexto: la longitud de contexto soportada no esta especificada para este checkpoint.
- Limitaciones de idioma: los idiomas soportados no estan declarados; el dataset de CPT no tiene idioma documentado en la informacion disponible.
- Solo se distribuyen pesos BF16 (14,6 GB): no hay variantes GGUF, GPTQ, AWQ ni FP8, por lo que el despliegue en hardware limitado exige una conversion manual previa.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de calidad o reproducibilidad.
- El repositorio incluye ocho shards safetensors y un run_manifest.json; conviene verificar los hashes de dicho manifiesto antes de usar el modelo en un entorno controlado.
- Modelo sin ajuste de instrucciones posterior documentado: no debe asumirse un comportamiento de asistente alineado, ni soporte fiable de tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-3
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de continued pretraining: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Unsloth (herramienta de exportacion merged_16bit): https://github.com/unslothai/unsloth
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos correspondian al portal frances de tramitacion de documentos ANTS (ants.gouv.fr) y no guardan relacion con esta ficha.
