# biohub/ESMC-6B

## Resumen

ESMC-6B es un modelo de lenguaje de proteinas (protein language model) de la familia ESM, desarrollado por Biohub. Aprende las regularidades de la biologia de proteinas a partir de miles de millones de secuencias evolutivas y produce representaciones (embeddings) utiles para ingenieria de proteinas terapeuticas, prediccion de efectos de variantes y analisis funcional. Es el modelo de mayor escala de la familia, con 6.352.005.184 parametros reales, 80 capas y 2,37e23 FLOPs de entrenamiento.

Se trata de un transformer encoder con Pre-LN, rotary embeddings y activaciones SwiGLU, entrenado con modelado de lenguaje enmascarado (masked language modeling) sobre secuencias de proteinas. El modelo resuelve el problema de obtener representaciones generales y transferibles de proteinas sin necesidad de etiquetas: sirve como base congelada para tareas posteriores, como demuestra ESMFold2, un predictor de estructura entrenado sobre ESMC-6B congelado.

Su relevancia actual radica en que combina escala (6B parametros) con una licencia permisiva (MIT, con avisos adicionales de terceros) y variantes ligeras sobrentrenadas (300M y 600M) para inferencia local y fine-tuning, ademas de un autoencoder disperso (SAE) para interpretabilidad de caracteristicas. El contexto de entrenamiento alcanza 2048 tokens en la segunda fase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Pre-LN, rotary embeddings, SwiGLU, sin biases en capas lineales ni layer norms) |
| Parametros totales | 6.352.005.184 (6B); 80 capas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (fase 2 de entrenamiento; fase 1 con 512) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (etiqueta de idioma del modelo); la entrada son secuencias de proteinas |
| Licencia | MIT, con aviso adicional de terceros (license: other) |
| Formato de pesos | safetensors (libreria transformers; repo de 50,8 GB) |

## Arquitectura y entrenamiento

ESMC es un transformer encoder con Pre-LN, rotary embeddings y activaciones SwiGLU, sin biases en capas lineales ni en layer norms. El modelo de 6B tiene 80 capas y 2,37e23 FLOPs de entrenamiento; la familia incluye tambien variantes sobrentrenadas de 300M (30 capas, 1,26e22 FLOPs) y 600M (36 capas, 2,17e22 FLOPs). El entrenamiento se realizo en dos fases: durante el primer millon de pasos con contexto de 512 tokens y un 64% de datos metagenomicos; en los ultimos 500.000 pasos el contexto se amplio a 2048 tokens y la proporcion de metagenomica se redujo al 37,5%.

Los datos de entrenamiento provienen de UniRef, MGnify y el Joint Genome Institute (JGI), agrupados al 70% de identidad de secuencia, con 83M, 372M y 2B clusters respectivamente. No se detalla en la informacion disponible si se aplicaron etapas de RLHF o DPO; el objetivo de entrenamiento es modelado de lenguaje enmascarado (fill-mask). Como innovacion destacable, el modelo sirve como base congelada para ESMFold2 (prediccion de estructura) y tiene un autoencoder disperso asociado (`ESMC-6B-sae-layer60-k64-codebook16384`) que produce descripciones de caracteristicas interpretables generadas por agentes.

## Capacidades

- Generacion de representaciones de proteinas (embeddings) por secuencia y por residuo, con opcion de devolver hidden states de todas las capas (`output_hidden_states=True`).
- Modelado de lenguaje enmascarado sobre secuencias de proteinas (prediccion de residuos enmascarados).
- Transfer learning: uso como encoder congelado o ajustable para tareas downstream.
- Prediccion de efectos de variantes (variant-effect prediction).
- Ingenieria de proteinas: diseno y optimizacion de proteinas terapeuticas.
- Base para prediccion de estructura via ESMFold2 (modelo separado entrenado sobre ESMC-6B congelado).
- Interpretabilidad de caracteristicas internas mediante el SAE asociado en la capa 60.
- Soporte de Flash Attention como alternativa a scaled dot product attention (seccion de uso de la model card truncada en la informacion disponible).
- No se documenta soporte de tool calling, agentes, vision, audio ni modos de razonamiento multi-paso; el modelo no es un LLM de texto general.

## Casos de uso

- Prediccion de efectos de variantes: dado un gen o proteina con mutaciones conocidas, se extraen embeddings de la secuencia wild-type y de las variantes y se entrena un cabezal ligero para estimar el impacto funcional; el modelo es adecuado por su escala y por las representaciones sobrentrenadas.
- Ingenieria de proteinas terapeuticas: se usan los embeddings para guiar busquedas de diseno (screening de variantes, optimizacion de estabilidad o afinidad) mediante modelos surrogate entrenados sobre las representaciones de ESMC-6B.
- Prediccion de estructura de proteinas: se integra ESMC-6B congelado como encoder en ESMFold2 para obtener estructuras con un equilibrio velocidad/precision adecuado a pipelines de alto rendimiento.
- Anotacion funcional de proteinas desconocidas: se calculan embeddings de secuencias metagenomicas y se agrupan o clasifican para inferir familia y funcion probable, aprovechando el entrenamiento con datos de MGnify y JGI.
- Busqueda y agrupamiento de secuencias a gran escala: los embeddings sirven para deduplicacion, clustering y recuperacion de secuencias similares en bases de datos de proteinas.
- Fine-tuning para tareas de laboratorio: con las variantes de 300M y 600M se ajustan modelos en GPU locales para tareas especificas (por ejemplo, prediccion de solubilidad o termoestabilidad) y se valida la aproximacion antes de escalar a 6B.
- Interpretabilidad mecanistica: se usa el SAE de la capa 60 para identificar caracteristicas humanamente interpretables y analizar que representaciones internas se activan ante motivos estructurales o funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la publicacion de bioRxiv para las metricas de rendimiento de ESMC y ESMFold2, sin incluir tablas numericas en el material proporcionado.

## Requisitos de hardware

- Entorno: GPU con PyTorch; se recomienda soporte CUDA y las librerias opcionales `transformer_engine` y `xformers`.
- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; el repo de pesos en safetensors ocupa 50,8 GB, lo que orienta el orden de magnitud para precision completa.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo, se requiere hardware de clase datacenter (A100/H100) para precision completa, aunque esto no se afirma en la model card.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo para el modelo de 6B; las variantes de 300M y 600M estan pensadas para inferencia local y fine-tuning.
- Opciones de despliegue: `transformers` (AutoModelForMaskedLM, device_map="auto"), paquete `esm` de PyPI y la API de la plataforma Biohub; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ESMC-6B | 6.352.005.184 | 2048 | MIT + aviso de terceros | Hugging Face, plataforma Biohub |
| ESMC-600M | 600M | No disponible | MIT + aviso de terceros | Hugging Face |
| ESMC-300M | 300M | No disponible | MIT + aviso de terceros | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otras familias (por ejemplo, ESM-2 u otros protein language models), por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado sobre secuencias de proteinas; no es un LLM de texto general y no debe emplearse para generacion de lenguaje natural.
- La etiqueta de idioma es "en" y los datos son secuencias biologicas; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion en el sentido de predicciones de residuos o representaciones poco fiables para proteinas muy alejadas de la distribucion de entrenamiento (por ejemplo, secuencias artificiales o con modificaciones no naturales); no se documenta una evaluacion especifica de calibracion.
- Sesgos derivados del dataset: UniRef, MGnify y JGI estan agrupados al 70% de identidad y la fase 1 usa un 64% de metagenomica, lo que puede infrarepresentar familias de proteinas poco presentes en las bases de datos.
- La licencia es MIT con un aviso adicional de terceros (`THIRD_PARTY_NOTICE.md`); conviene revisar ese aviso antes de uso comercial, ya que la model card lo marca como "license: other" junto a MIT.
- El contexto de entrenamiento es de 2048 tokens; secuencias mas largas pueden degradar las representaciones.
- El uso de Flash Attention requiere librerias y configuracion adicionales; la seccion de uso correspondiente esta truncada en la informacion disponible.
- Para produccion, el modelo de 6B exige hardware de clase datacenter y el repo de pesos ocupa 50,8 GB; las variantes 300M y 600M son la opcion practica para entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/biohub/ESMC-6B
- Variante 300M: https://huggingface.co/biohub/ESMC-300M
- Variante 600M: https://huggingface.co/biohub/ESMC-600M
- ESMFold2: https://huggingface.co/biohub/ESMFold2
- SAE de ESMC-6B: https://huggingface.co/biohub/ESMC-6B-sae-layer60-k64-codebook16384
- Vision general de SAE de ESMC: https://huggingface.co/biohub/ESMC-SAE-Overview
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- Aviso de terceros: https://github.com/Biohub/esm/blob/main/THIRD_PARTY_NOTICE.md
- Plataforma Biohub: https://biohub.ai/
- Pagina del modelo en Biohub: https://www.biohub.ai/models/esmc
- Documentacion Biohub: https://docs.biohub.ai/models/esmc
