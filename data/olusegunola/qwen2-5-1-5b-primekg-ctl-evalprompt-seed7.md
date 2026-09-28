# olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed7

## Resumen

`olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed7` es un checkpoint de ajuste fino derivado del modelo denso Qwen2.5-1.5B, publicado por el usuario `olusegunola` en Hugging Face. El propio nombre del repositorio codifica la configuracion experimental: modelo base (`qwen2.5-1.5b`), corpus de ajuste (`primekg`, el grafo de conocimiento de medicina de precision PrimeKG del laboratorio Zitnik de Harvard), condicion de control (`ctl`), prompt de evaluacion (`evalprompt`) y semilla aleatoria (`seed7`). Por la nomenclatura, se trata de un artefacto de investigacion generado dentro de un barrido de experimentos comparativos, no de un modelo orientado a uso general.

El problema que aborda es, presumiblemente, la adaptacion de un modelo de lenguaje pequeno al razonamiento sobre conocimiento biomedico estructurado (relaciones entre enfermedades, genes, proteinas, farmacos y fenotipos). La relevancia actual de este tipo de checkpoints es acotada: sirven para reproducir resultados y comparar estrategias de ajuste (por ejemplo, condicion de control frente a condicion tratada) sobre un modelo de 1,5B parametros que puede ejecutarse en hardware de consumo.

La documentacion publicada es practicamente nula. La model card del repositorio es la plantilla automatica por defecto de Hugging Face, con todos los campos marcados como `[More Information Needed]`, el repositorio declara 0 descargas y 0 likes, y su tamano reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar subidos o que los metadatos no estan disponibles. Los datos tecnicos que se ofrecen a continuacion proceden, cuando se indica, de la documentacion publica del modelo base Qwen2.5-1.5B y deben considerarse inferencias, no especificaciones confirmadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B; inferido del nombre del repositorio, no confirmado) |
| Parametros totales | Aproximadamente 1,5B (inferido del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-1.5B, extensibles a 128K con YaRN (dato del modelo base; no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible. El repositorio solo declara safetensors; no se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta principalmente ingles y chino, con capacidades multilingues parciales) |
| Licencia | No disponible. La licencia del fine-tune no esta declarada; el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0, pero esto no garantiza la licencia de este derivado |
| Formato de pesos | safetensors (etiqueta declarada en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer denso decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y embeddings RoPE, preentrenado por Alibaba sobre un corpus de hasta 18 billones de tokens segun la documentacion oficial de la familia Qwen2.5. Este checkpoint concreto anade un ajuste fino supervisado (SFT) sobre datos derivados de PrimeKG, un grafo de conocimiento de medicina de precision con mas de 4 millones de relaciones que conecta enfermedades, genes, proteinas, farmacos, exposiciones ambientales y fenotipos.

No hay informacion disponible sobre el numero exacto de tokens de ajuste, la composicion del dataset, los hiperparametros, el regimen de precision, ni si se aplicaron tecnicas posteriores como RLHF o DPO. La etiqueta `ctl` sugiere que este checkpoint corresponde a una condicion de control dentro de un diseno experimental, y `evalprompt` apunta a un formato de prompt especifico usado en la evaluacion. El repositorio hermano `olusegunola/qwen2.5-1.5b-primekg-sft-seed7` sugiere la existencia de una condicion de ajuste supervisado frente a la de control. No se ha documentado ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, atencion híbrida SSM, etc.).

## Capacidades

- Generacion de texto autoregresiva en el rango de los 1,5B parametros, con calidad esperable para ese tamano.
- Razonamiento sobre terminologia biomedica y relaciones entre entidades del dominio de PrimeKG, como consecuencia del ajuste declarado en el nombre del repositorio.
- Respuesta a prompts de evaluacion especificos (etiqueta `evalprompt`), presumiblemente plantillas cerradas de pregunta-respuesta sobre conocimiento biomedico.
- Soporte de tool calling y function calling: heredable del modelo base Qwen2.5 en su variante instruct, pero no confirmado ni documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no documentadas; el modelo base tiene un sesgo fuerte hacia ingles y chino.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada. No hay evidencia de que este checkpoint incorpore vision ni audio.

## Casos de uso

- Extraccion de relaciones biomedicas: el modelo puede utilizarse para transformar texto cientifico en tripletas (enfermedad, gen, asociacion) aprovechando el ajuste sobre PrimeKG. Es adecuado porque el ajuste expone al modelo al vocabulario y a los tipos de relacion del grafo.
- Pregunta-respuesta sobre conocimiento biomedico estructurado: dado un prompt de evaluacion del estilo usado en el repositorio, el modelo puede devolver la entidad o relacion esperada del grafo, util como linea base en experimentos de KGQA.
- Generacion aumentada por recuperacion (RAG) en dominio clinico: integrado como generador detras de un recuperador sobre PubMed o PrimeKG, puede redactar respuestas trazables apoyadas en evidencia recuperada, con la ventaja de que 1,5B parametros permite desplegarlo en una sola GPU.
- Reproduccion de experimentos academicos: el identificador de semilla (`seed7`) y de condicion (`ctl`) lo convierten en una pieza util para replicar comparativas entre estrategias de ajuste sobre el mismo modelo base.
- Filtrado y triaje de literatura cientifica: puede clasificar resumenes o titulos segun su relevancia respecto a entidades de PrimeKG, como paso previo a una revision sistematica.
- Base para ajustes adicionales: al ser un modelo pequeno y presumiblemente con licencia permisiva heredada, sirve como punto de partida para tareas mas especificas de dominio (farmacovigilancia, diagnostico asistido, anotacion de ensayos clinicos).
- Evaluacion comparativa de metodologias de ajuste: comparar este checkpoint (condicion de control) frente a `qwen2.5-1.5b-primekg-sft-seed7` permite medir el efecto del ajuste supervisado con la misma semilla y el mismo prompt de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada, y no hay tablas de MMLU, HumanEval, GSM8K ni metricas especificas de dominio biomedico. Tampoco se han publicado curvas de perdida ni comparaciones frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 1,5B parametros: aproximadamente 3,1 GB en FP16/BF16, en torno a 1,6 GB en cuantizacion INT8 y entre 0,9 y 1,1 GB en INT4. Estas cifras son estimaciones teoricas a partir del numero de parametros y no mediciones de este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 lo ejecutan con holgura. En centro de datos, una A100 o una H100 estan sobredimensionadas para este tamano salvo que se requiera un throughput muy alto.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de gama media y alta, e incluso en GPUs integradas recientes si se cuantiza a 4 bits.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que funciona con el pipeline estandar de Hugging Face. La etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. Para servir en produccion se puede usar vLLM o TGI; para ejecucion local, llama.cpp u Ollama, aunque seria necesario convertir los pesos a GGUF, ya que no se publican versiones cuantizadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed7` | ~1,5B (inferido) | No disponible | No disponible | Repositorio con 0 descargas y 0,0 GB reportados | Artefacto de investigacion, sin documentacion |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens (128K con YaRN) | Apache 2.0 | Ampliamente disponible, con variantes base e instruct | Referencia directa del modelo ajustado |
| `olusegunola/qwen2.5-1.5b-primekg-sft-seed7` | ~1,5B (inferido) | No disponible | No disponible | Mismo autor, misma situacion | Condicion de ajuste supervisado frente a la de control |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Ampliamente disponible | Alternativa de tamano similar, sin especializacion biomedica |
| Gemma-2-2B | 2,6B | 8.192 tokens | Licencia Gemma | Ampliamente disponible | Alternativa de tamano similar, con terminos de uso propios |

Los valores de los modelos de referencia proceden de su documentacion publica. No hay resultados de rendimiento de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Se heredan, en su caso, los sesgos del corpus de preentrenamiento de Qwen2.5 y de los datos de ajuste derivados de PrimeKG, que esta sesgado hacia conocimiento biomedico de poblaciones con mayor representacion en bases de datos clinicas.
- Riesgo de alucinacion: alto en un modelo de 1,5B parametros, especialmente en dominio clinico, donde una respuesta incorrecta puede tener consecuencias graves. No debe usarse como fuente de verdad medica sin verificacion humana.
- Limitaciones de contexto e idioma: el contexto nativo es de 32.768 tokens solo si el fine-tune lo preserva, algo que no esta confirmado. El soporte multilingue no esta documentado y probablemente sea limitado fuera del ingles.
- Restricciones de licencia: la licencia del derivado no esta declarada, lo que impide determinar si es apto para uso comercial. La licencia Apache 2.0 del modelo base no implica automaticamente la misma licencia para este repositorio.
- Ausencia de pesos verificables: el repositorio reporta 0,0 GB de tamano, por lo que es posible que los pesos no esten realmente disponibles o que la descarga falle. Conviene verificar antes de depender de este checkpoint.
- Caveat para produccion: no hay model card util, ni evaluacion, ni garantias de mantenimiento. No se recomienda su uso en produccion; su valor es exclusivamente experimental.
- Etiqueta `arxiv:1910.09700` en los tags: corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla por defecto de Hugging Face. No es una referencia cientifica del modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed7
- Repositorio hermano (condicion de ajuste supervisado): https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-sft-seed7
- Coleccion Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Proyecto PrimeKG (Zitnik Lab, Harvard): https://zitniklab.hms.harvard.edu/projects/PrimeKG/
- Repositorio GitHub de PrimeKG: https://github.com/mims-harvard/PrimeKG
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
