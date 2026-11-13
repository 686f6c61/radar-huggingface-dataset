# cheahour/khmer-translation-v2.3

## Resumen

`cheahour/khmer-translation-v2.3` es un modelo especializado en traduccion bidireccional ingles-khmer (camboyano) publicado por el usuario cheahour en Hugging Face. Segun la model card, se trata de un modelo resultante de la fusion (merge) de EmbeddingGemma 2 y NLLB-200, dos arquitecturas de Meta orientadas respectivamente a representaciones densas multilingues y a traduccion automatica neuronal. El modelo expone una interfaz simplificada mediante el metodo `translate(texto, to="km"|"en")`, lo que lo aleja del uso convencional de transformers para generacion de texto y lo acerca a un componente de traduccion empaquetado.

El modelo cuenta con 887.917.080 parametros reales en formato safetensors y un repositorio de 3,1 GB, lo que sugiere pesos almacenados en precision de 32 bits o con multiples copias de componentes fusionados. Requiere `trust_remote_code=True` y una version especifica de transformers instalada desde un commit concreto de GitHub, ademas de tokenizers >=0.23.1 y safetensors >=0.8.0, lo que indica dependencia de codigo personalizado no incluido en la version estable de la libreria.

Su relevancia es acotada pero especifica: cubre un par de idiomas con poca representacion en modelos generalistas (ingles-khmer) y ofrece una API de alto nivel sin necesidad de frameworks de cuantizacion como bitsandbytes, peft o unsloth. No obstante, la ausencia de licencia declarada, de benchmarks publicados y de documentacion detallada sobre los datos de entrenamiento limita seriamente su evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion (merge) de EmbeddingGemma 2 y NLLB-200; codigo personalizado (`custom_code`) |
| Parametros totales | 887.917.080 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona fp16 en el ejemplo de uso) |
| Idiomas soportados | Ingles y khmer (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como una fusion de EmbeddingGemma 2 y NLLB-200. NLLB-200 es la familia de modelos de traduccion automatica neuronal de Meta basada en transformer encoder-decoder, mientras que EmbeddingGemma 2 corresponde a la linea de modelos de embeddings de Gemma orientados a representaciones semanticas. La combinacion exacta de capas, el metodo de fusion (por ejemplo, model merging con interpolacion de pesos o concatenacion de modulos) y la funcion de cada componente no se detallan en la informacion disponible.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o fine-tuning supervisado, ni las tecnicas de alineacion aplicadas. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico detalle operativo relevante es la exposicion de un metodo `translate` mediante `trust_remote_code`, lo que implica que la logica de inferencia (tokenizacion, prompt, decodificacion) esta implementada en codigo Python del propio repositorio y no en la API estandar de transformers.

## Capacidades

- Traduccion bidireccional ingles a khmer y khmer a ingles mediante el metodo `translate(texto, to="km"|"en")`.
- Inferencia en precision fp16 sobre GPU, con compatibilidad indicada con una GPU T4 gratuita de Colab.
- No requiere bitsandbytes, peft ni unsloth para su uso basico.
- Soporte de ejecucion mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- Capacidad de tool calling / function calling: no disponible.
- Capacidad de agentes o razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo thinking: no disponible.
- Cobertura multilingue mas alla de ingles y khmer: no disponible.

## Casos de uso

- Traduccion de documentacion tecnica al khmer: el modelo puede procesar cadenas de texto en ingles y devolver su equivalente en khmer, util para localizar manuales o guias de producto dirigidas al mercado camboyano.
- Atencion al cliente en camboyano: integrado como paso de traduccion previo y posterior a un LLM generalista, permite atender consultas de usuarios khmer-parlantes traduciendo la entrada al ingles y la respuesta de vuelta al khmer.
- Localizacion de interfaces de aplicacion: traduccion de cadenas cortas de UI (botones, mensajes de error, etiquetas) entre ingles y khmer dentro de pipelines de internacionalizacion.
- Moderacion de contenido multilingue: traduccion de mensajes en khmer a ingles para aplicar clasificadores de toxicidad o politicas de contenido entrenados principalmente en ingles.
- Investigacion linguistica y creacion de corpus: generacion de pares de traduccion ingles-khmer para ampliar datasets paralelos, dado el limitado volumen de recursos publicos para este par.
- Prototipado rapido en entornos con recursos limitados: al funcionar en una T4 de Colab en fp16, sirve para validar hipotesis de traduccion o demos internas sin infraestructura dedicada.
- Preprocesado en pipelines de e-commerce: traduccion de descripciones de producto y resenas entre ingles y khmer para analisis de sentimiento o busqueda semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,8 GB solo para pesos (887,9 M de parametros a 2 bytes por parametro), mas overhead de activaciones, tokenizador y codigo personalizado; en la practica se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: la model card indica que una T4 gratuita de Colab es suficiente; GPUs consumer como RTX 3060, RTX 4060 o superiores deberian poder ejecutarlo en fp16.
- Cabe en GPU consumer: si, segun la indicacion explicita de la model card sobre T4.
- Opciones de despliegue: unicamente mediante transformers con `trust_remote_code=True` y la version concreta de transformers indicada (commit `92cd495f2720c064bc78eb2d93e28704c5bce51f`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cheahour/khmer-translation-v2.3 | 887,9 M | no disponible | Ingles, khmer | no disponible | safetensors |
| NLLB-200 (variantes de Meta) | 300 M a 54 B (segun variante) | no disponible en esta ficha | 200 idiomas | CC-BY-NC (variantes publicadas) | safetensors |
| Modelos MarianMT (Helsinki-NLP) | ~74-300 M por par | no disponible en esta ficha | Pares especificos | Apache 2.0 / MIT segun modelo | safetensors, PyTorch |
| Google Translate (servicio propietario) | no disponible | no disponible | Cientos de idiomas | Propietaria | API |

La comparacion se basa en caracteristicas generales de las familias mencionadas; no se dispone de datos de rendimiento del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede determinar si el uso comercial esta permitido; esto es un bloqueante para produccion.
- Dependencia de codigo remoto (`trust_remote_code=True`): ejecutar codigo arbitrario del repositorio implica un riesgo de seguridad y de reproducibilidad.
- Version de transformers fijada a un commit concreto de GitHub: la instalacion no es trivial y puede romperse con actualizaciones de dependencias.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de traduccion (BLEU, chrF, COMET) frente a alternativas.
- Sin documentacion sobre datos de entrenamiento: se desconoce la composicion del corpus, posibles sesgos y cobertura de dominios.
- Riesgo de alucinacion y de traducciones inexactas: inherente a los modelos de traduccion neuronal, especialmente en terminologia especializada o textos largos.
- Longitud de contexto no especificada: se desconoce el maximo de tokens por segmento y el comportamiento en documentos largos.
- Cobertura limitada a dos idiomas: no es un modelo multilingue generalista.
- Sin soporte documentado para frameworks de despliegue estandar (vLLM, TGI, llama.cpp): la integracion en infraestructura existente requerira trabajo adicional.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cheahour/khmer-translation-v2.3
- Commit de transformers requerido: https://github.com/huggingface/transformers/commit/92cd495f2720c064bc78eb2d93e28704c5bce51f
- Repositorio de transformers: https://github.com/huggingface/transformers
- Paper de NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Familia Gemma de Google DeepMind: https://ai.google.dev/gemma
