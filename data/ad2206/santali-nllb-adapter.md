# AD2206/santali-nllb-adapter

## Resumen

AD2206/santali-nllb-adapter es un adaptador LoRA (Low-Rank Adaptation) para el modelo de traduccion automatica NLLB-200-distilled-600M de Meta, especificamente entrenado para la lengua santali (ISO 639-3: sat) en su escritura nativa Ol Chiki. El santali es una lengua austroasiatica con aproximadamente 7 millones de hablantes y estatus de lengua programada en la India, pero que cuenta con una infraestructura NLP muy limitada. Este adaptador forma parte de los esfuerzos recientes por ampliar la cobertura de modelos multilingues a lenguas indigenas de bajos recursos mediante tecnicas de adaptacion eficiente.

El modelo se publica como un adaptador PEFT (Parameter-Efficient Fine-Tuning) de 0.1 GB, lo que significa que no es un modelo autonomo, sino un modulo que debe combinarse con el modelo base facebook/nllb-200-distilled-600M para funcionar. Esta aproximacion permite adaptar un modelo multilingue de gran escala a una lengua especifica sin necesidad de reentrenar todos los parametros, reduciendo considerablemente los requisitos de computo y datos. La relevancia de este trabajo radica en que aborda una lengua con escasisimos recursos digitales, demostrando la viabilidad de tecnicas de transferencia cross-lingual para lenguas minoritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre NLLB-200-distilled-600M (Transformer encoder-decoder) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 600M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (heredada de NLLB-200) |
| Tipos de cuantizacion | no aplicable (el adaptador se distribuye en precision completa; el modelo base admite cuantizacion) |
| Idiomas soportados | Santali (sat_Olck), mas los 200 idiomas del modelo base NLLB-200 |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atencion. El modelo base, NLLB-200-distilled-600M, es una version destilada del NLLB-200 original (54B parametros) que mantiene la arquitectura Transformer encoder-decoder con 600 millones de parametros y soporte para 200 lenguas. La destilacion reduce el coste computacional manteniendo un rendimiento razonable en traduccion multilingue.

Los detalles del entrenamiento del adaptador no estan publicados en la model card: no se especifica el dataset utilizado, el numero de pasos de entrenamiento, la configuracion de hiperparametros (rango, alpha, dropout), ni el regimen de precision (fp16, bf16, etc.). El trabajo se enmarca en la linea de investigacion publicada en el articulo "Breaking Language Barriers: Adapting NLLB-200 and mBART-50 for Low-Resource Indian Tribal Languages" (ACL 2025), que propone un enfoque agnostico al idioma para la traduccion de lenguas tribales indias como Bhilli, Gondi, Mundari y Santali, basandose en la transferencia cross-lingual de NLLB-200 y mBART-50.

## Capacidades

- Traduccion automatica entre santali (escritura Ol Chiki) y otros idiomas cubiertos por NLLB-200, incluyendo ingles, hindi y otras lenguas indias.
- Inferencia sobre el modelo base NLLB-200-distilled-600M, que mantiene las capacidades de traduccion para los 200 idiomas originales.
- No incluye capacidades de generacion de codigo, razonamiento, tool calling ni agentes, ya que es un modelo puramente de traduccion.
- No soporta vision ni audio; es exclusivamente texto.
- Capacidad multilingue limitada al santali y a los idiomas del modelo base.

## Casos de uso

- Preservacion linguistica digital: el adaptador permite digitalizar documentos, literatura oral y materiales culturales en santali, facilitando su archivado y traduccion a idiomas mayoritarios para su preservacion y estudio.
- Educacion bilingue: puede integrarse en plataformas educativas para generar materiales de aprendizaje en santali o traducir contenido educativo desde ingles o hindi, apoyando la ensenanza en la lengua materna.
- Servicios gubernamentales y administrativos: dado que el santali es una lengua programada en la India, el adaptador puede emplearse para traducir formularios, avisos oficiales y documentacion administrativa, mejorando el acceso a servicios publicos de la comunidad santali.
- Atencion sanitaria y divulgacion: traduccion de folletos medicos, instrucciones de tratamiento y campanas de salud publica a santali, facilitando la comunicacion en contextos sanitarios donde el acceso a profesionales bilingues es limitado.
- Comunicacion comunitaria y mediacion: apoyo a traductores e interpretes en contextos legales, sociales o de emergencia, proporcionando una primera traduccion automatica que pueda ser revisada posteriormente.
- Investigacion en NLP para lenguas de bajos recursos: el adaptador sirve como punto de partida para experimentos de transferencia cross-lingual, evaluacion de tecnicas PEFT y desarrollo de recursos para lenguas austroasiaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF ni ninguna otra evaluacion cuantitativa. El articulo de ACL 2025 mencionado en los resultados de busqueda presenta evaluaciones para lenguas tribales indias, pero no se dispone de los datos concretos de este adaptador especifico.

## Requisitos de hardware

- El adaptador LoRA anade una sobrecarga minima en memoria; el requisito principal viene del modelo base NLLB-200-distilled-600M.
- VRAM estimada para inferencia: aproximadamente 2-4 GB con el modelo base en fp16, suficiente para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Para uso en produccion con mayor throughput, se recomienda una GPU con al menos 8 GB de VRAM (RTX 3070/4070, A10, L4) o servidores con A100/H100 para procesamiento por lotes.
- El adaptador es compatible con el ecosistema Hugging Face Transformers y PEFT; puede cargarse con `PeftModel.from_pretrained` sobre el modelo base.
- Opciones de despliegue: transformers con PEFT, vLLM (si se fusiona el adaptador con el modelo base), o soluciones serverless como Hugging Face Inference Endpoints.
- La latencia de inferencia es similar a la del modelo base: del orden de 50-200 ms por secuencia en GPU de consumo, dependiendo de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| AD2206/santali-nllb-adapter | 600M (base) + LoRA | 1024 | Santali + 200 | no disponible | LoRA adapter |
| facebook/nllb-200-distilled-600M | 600M | 1024 | 200 | CC-BY-NC 4.0 | Modelo base denso |
| facebook/nllb-200-3.3B | 3.3B | 1024 | 200 | CC-BY-NC 4.0 | Modelo base denso |
| facebook/mbart-large-50 | 680M | 1024 | 50 | MIT | Modelo base denso |

La comparativa directa con otros adaptadores para santali no esta disponible. El articulo de ACL 2025 sugiere que existen aproximaciones similares con mBART-50, pero no se han publicado los modelos resultantes en Hugging Face. La ventaja principal de este adaptador es su tamano reducido y su compatibilidad con el ecosistema NLLB, que ya cubre 200 idiomas.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, datos de entrenamiento ni evaluacion de calidad; el rendimiento real en produccion es desconocido.
- Al ser un adaptador para una lengua de bajos recursos, es probable que la calidad de traduccion sea inferior a la de lenguas bien representadas en NLLB-200.
- Riesgo de alucinaciones y errores de traduccion, especialmente en textos especializados o con vocabulario fuera del dominio de entrenamiento.
- La licencia del adaptador no esta especificada; el modelo base NLLB-200 usa CC-BY-NC 4.0, que restringe el uso comercial, por lo que cualquier despliegue debe verificar la compatibilidad de licencias.
- No se especifica si el adaptador mantiene la cobertura completa de los 200 idiomas del modelo base o si el entrenamiento LoRA ha degradado el rendimiento en otros idiomas.
- La ventana de contexto de 1024 tokens es limitada para documentos largos, lo que puede requerir estrategias de troceado para traducciones extensas.
- No hay informacion sobre el dataset de entrenamiento, su tamano ni su procedencia, lo que impide evaluar posibles sesgos culturales o geograficos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AD2206/santali-nllb-adapter)
- [Documentacion de NLLB en Transformers](https://huggingface.co/docs/transformers/model_doc/nllb)
- [Articulo "No Language Left Behind" (Meta Research)](https://research.facebook.com/publications/no-language-left-behind/)
- [Articulo "Breaking Language Barriers: Adapting NLLB-200 and mBART-50 for Low-Resource Indian Tribal Languages" (ACL 2025)](https://aclanthology.org/2025.mmloso-1.11/)
- [Repositorio santali-nlp (recursos NLP para santali)](https://github.com/sami42200/santali-nlp/tree/main/santali-nlp-github/santali-nlp)
