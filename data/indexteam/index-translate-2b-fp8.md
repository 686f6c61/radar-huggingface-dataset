# IndexTeam/Index-Translate-2B-FP8

## Resumen

Index-Translate-2B-FP8 es la cuantizacion oficial en FP8 del modelo IndexTeam/Index-Translate-2B, un modelo de traduccion multilingue de aproximadamente 2.000 millones de parametros desarrollado por el equipo Index (IndexTeam), vinculado al repositorio github.com/bilibili/Index-Translate. Forma parte de la familia Index-Translate, orientada a traduccion en 150 idiomas con soporte de restricciones de terminologia y formato, traduccion controlada para doblaje y traduccion de documentos largos. El checkpoint se publica bajo licencia Apache 2.0 y esta pensado para servir con vLLM o cargarse con transformers.

El modelo base es multimodal: los tags del repositorio incluyen image-text-to-text y la model card menciona explicitamente un vision tower y un proyector multimodal, ademas de pesos de prediccion multi-token (MTP). La arquitectura declarada en los tags es la familia qwen3_5. Esta version no reentrena el modelo, sino que aplica una cuantizacion W8A8 con el esquema FP8_DYNAMIC generado mediante llm-compressor: se cuantizan todas las capas Linear del modelo de lenguaje, mientras que el vision tower, el proyector multimodal, lm_head y los embeddings se conservan en BF16.

Su relevancia practica es doble. Por un lado, reduce el peso del checkpoint a aproximadamente 0,1 GB en el repositorio, lo que facilita el despliegue en GPUs de consumo y en infraestructura de inferencia de bajo coste. Por otro, la validacion de consistencia publicada por el autor reporta una degradacion de perplejidad de solo +0,76 % frente al checkpoint BF16 (3,9403 frente a 3,9104) sobre un corpus fijo, con generaciones identicas en zh→en y semanticamente equivalentes en en→zh, lo que indica que la cuantizacion preserva la calidad de traduccion en la practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; este checkpoint es una cuantizacion FP8 del modelo base |
| Parametros totales | ~2B (segun la denominacion del modelo; el valor exacto no esta disponible) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible; el ejemplo oficial de servicio usa `--max-model-len 4096` |
| Tipos de cuantizacion | FP8 W8A8 (esquema FP8_DYNAMIC: pesos FP8 E4M3 y activaciones FP8 dinamicas por token); el modelo base dispone de builds GGUF en un repositorio aparte |
| Idiomas soportados | 150 idiomas segun la model card de la familia Index-Translate; los metadatos de HuggingFace figuran como no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer multimodal con torre de vision y proyector multimodal, etiquetado como qwen3_5 en los tags del repositorio, y con pesos de prediccion multi-token (MTP) preservados en el checkpoint cuantizado. El modelo base pertenece a la familia Index-Translate, especializada en traduccion multilingue con modos de traduccion restringida por terminologia y formato (formato instTrans), traduccion controlada para doblaje y traduccion de documentos largos. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada; esos detalles corresponderian al informe tecnico de la familia.

Lo que si esta documentado con precision es el proceso de cuantizacion. Se aplico el esquema FP8_DYNAMIC con pesos FP8 E4M3 y activaciones FP8 dinamicas por token, generado con llm-compressor, y el esquema queda registrado en el archivo recipe.yaml del repositorio. Se cuantizaron todas las capas Linear del modelo de lenguaje, manteniendo en BF16 la torre de vision, el proyector multimodal, lm_head y los embeddings. La validacion de consistencia se midio en una NVIDIA A100 frente al checkpoint BF16 original, con decodificacion greedy y el prompt oficial de traduccion. El resultado es una perplejidad de 3,9403 en FP8 frente a 3,9104 en BF16 (+0,76 %), generacion identica en zh→en y generacion semanticamente equivalente (no identica) en en→zh.

## Capacidades

- Traduccion automatica multilingue en 150 idiomas segun la model card de la familia.
- Traduccion restringida por terminologia y formato mediante el formato instTrans del modelo base.
- Traduccion controlada para doblaje, orientada a sincronizacion y ajuste de guion.
- Traduccion de documentos largos.
- Procesamiento multimodal de entrada imagen-texto gracias a la torre de vision y al proyector multimodal conservados en BF16.
- Prediccion multi-token (MTP) preservada en el checkpoint cuantizado, lo que habilita tecnicas de decodificacion especulativa en motores compatibles.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) para despliegue como API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Generacion de codigo, matematicas o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Localizacion de producto en comercio electronico: el modelo permite traducir fichas, descripciones y atributos a 150 idiomas con restricciones de terminologia, de modo que nombres de producto y marcas se mantengan consistentes entre idiomas en lugar de traducirse libremente.
- Doblaje y subtitulado: el modo de traduccion controlada para doblaje de la familia Index-Translate esta pensado para producir guiones traducidos con ajuste de longitud y registro, un escenario donde la salida debe encajar en una pista de audio o en un limite de caracteres.
- Traduccion de documentacion tecnica larga: al admitir documentos largos y formato instTrans, encaja en pipelines que procesan manuales, especificaciones o contratos manteniendo intactos bloques de codigo, tablas y marcado.
- Traduccion de contenido generado por usuarios en plataformas: comentarios, resenas y mensajes de soporte entre idiomas, con el modelo servido en vLLM para atender peticiones concurrentes con prompts cortos.
- Traduccion de material visual: gracias a la torre de vision, puede abordar entradas de imagen y texto, util para traducir menus, carteles o capturas de pantalla en flujos de digitalizacion.
- Preprocesado en pipelines de datos multilingues: traduccion de corpus para aumentar datasets de entrenamiento o para normalizar contenido de fuentes heterogeneas antes de indexarlo.
- Despliegue en infraestructura de bajo coste: al ocupar aproximadamente 0,1 GB en el repositorio y mantener una perplejidad casi identica al BF16, permite ofrecer traduccion en una sola GPU de consumo media en lugar de recurrir a un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, BLEU, COMET, etc.) en la informacion disponible. El unico dato de evaluacion aportado es la validacion de consistencia de la cuantizacion:

| Metrica | BF16 | FP8 | Delta |
|---|---:|---:|---:|
| Perplejidad (corpus fijo) | 3,9104 | 3,9403 | +0,76 % |
| Generacion zh→en identica | — | — | si |
| Generacion en→zh identica | — | — | no (semanticamente equivalente) |

Medido en una NVIDIA A100 con decodificacion greedy y el prompt oficial de traduccion.

## Requisitos de hardware

- VRAM estimada de pesos: alrededor de 2 GB para un modelo de ~2B parametros en FP8, a lo que hay que sumar en BF16 la torre de vision, el proyector multimodal, lm_head y los embeddings, que no se cuantizan. El repositorio ocupa 0,1 GB, lo que sugiere un checkpoint compacto; conviene verificar el consumo en runtime, ya que no se publica una cifra oficial.
- VRAM total en inferencia: ademas de los pesos hay que contabilizar cache KV y activaciones; con `--max-model-len 4096` el consumo es moderado, pero el valor exacto no esta disponible.
- GPU recomendadas: para servir con vLLM se documenta una NVIDIA A100 en las pruebas de validacion; para un modelo de este tamano son razonables GPUs como RTX 3090, RTX 4090, L40S, A10G o L4, aunque el autor no publica una lista de compatibilidad.
- GPU de consumo: por tamano, es esperable que quepa en GPUs de consumo con 8-12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), siempre que el resto de componentes en BF16 y la cache KV no desborden la memoria disponible. No se dispone de confirmacion oficial.
- Opciones de despliegue: vLLM con `quantization="compressed-tensors"` (comando oficial: `vllm serve IndexTeam/Index-Translate-2B-FP8 --host 127.0.0.1 --port 8000 --max-model-len 4096`), carga directa con transformers, y llama.cpp / Ollama a traves de los builds GGUF publicados en el repositorio del modelo base Index-Translate-2B-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Index-Translate-2B-FP8 | ~2B | no disponible | safetensors compressed-tensors (FP8 W8A8) | apache-2.0 | Cuantizacion FP8 del base; vision tower y embeddings en BF16; PPL 3,9403 |
| Index-Translate-2B (base) | ~2B | no disponible | safetensors (BF16) | apache-2.0 | Referencia de calidad; PPL 3,9104; soporta el formato instTrans completo |
| Index-Translate-2B-GGUF | ~2B | no disponible | GGUF | apache-2.0 | Builds para inferencia local con llama.cpp / Ollama |

No se dispone de datos de rendimiento comparativo frente a otros modelos de traduccion de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente de la comunidad sobre su comportamiento en produccion.
- No se publican resultados de benchmarks de traduccion (BLEU, COMET, chrF ni evaluaciones humanas), solo la validacion de perplejidad frente al BF16.
- La degradacion por cuantizacion es pequena pero real: +0,76 % de perplejidad, y la generacion en→zh deja de ser identica a la del modelo BF16 (el autor la describe como semanticamente equivalente).
- La torre de vision, el proyector multimodal, lm_head y los embeddings permanecen en BF16, por lo que el ahorro de memoria no es proporcional al de un modelo completamente cuantizado y el consumo real puede ser superior al que sugiere el tamano del repositorio.
- La longitud de contexto no se especifica para el checkpoint; el ejemplo oficial limita el servicio a 4096 tokens y no esta claro si ese es el maximo del modelo o solo un preset conservador.
- El prompt de traduccion documentado esta redactado en chino, lo que implica que el flujo oficial asume instrucciones en ese idioma; el comportamiento con prompts en otros idiomas no esta documentado.
- La lista de 150 idiomas proviene de la model card de la familia; no se detalla la cobertura ni la calidad por idioma, y los metadatos de HuggingFace marcan los idiomas como no disponibles.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios sensibles (legal, medico, financiero).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y del repositorio de codigo por si imponen condiciones adicionales.
- El riesgo de alucinacion en traduccion existe en cualquier modelo generativo; con decodificacion greedy y temperatura 0 se reduce la variabilidad, pero no elimina el riesgo de omisiones o invenciones en textos largos o con terminologia poco frecuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-2B-FP8
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- Builds GGUF: https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Codigo: https://github.com/bilibili/Index-Translate
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
