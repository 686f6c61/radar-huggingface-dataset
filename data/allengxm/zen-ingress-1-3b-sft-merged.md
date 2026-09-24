# AllenGXM/zen-ingress-1-3b-sft-merged

## Resumen

AllenGXM/zen-ingress-1-3b-sft-merged es un ajuste fino supervisado (SFT) del modelo Qwen2.5-3B-Instruct, publicado por el usuario AllenGXM bajo licencia Apache-2.0. El repositorio contiene únicamente pesos en formato safetensors (6,2 GB) y una model card mínima generada a partir de la plantilla de Unsloth, sin documentación adicional sobre el dataset, la metodología de entrenamiento ni los objetivos del ajuste. Se trata, por tanto, de un experimento de fine-tuning de bajo perfil: en el momento de la consulta acumula 0 descargas y 0 likes.

El modelo parte de unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit, una variante cuantizada a 4 bits del Qwen2.5-3B-Instruct preparada para entrenamiento eficiente con Unsloth. El sufijo "sft-merged" del nombre sugiere que se entrenó un adaptador LoRA sobre esa base y posteriormente se fusionó (merged) en los pesos completos, dando lugar a un checkpoint de aproximadamente 3.085.938.688 parámetros en precisión completa. La arquitectura subyacente es la de la familia Qwen2: un transformer decoder-only denso.

Su relevancia práctica es limitada tal y como está publicado: no hay benchmarks, no se detalla la composición del dataset de SFT y el único idioma declarado en los tags es el inglés. Resulta útil principalmente como ejemplo reproducible de un pipeline de fine-tuning con Unsloth y TRL, o como punto de partida para quien quiera inspeccionar un merge de LoRA sobre Qwen2.5-3B, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), densa |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en safetensors y el tamano del repo (6,2 GB) es coherente con bf16/fp16 |
| Idiomas soportados | Ingles (unico idioma declarado en los tags y en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Modelo base | unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 6,2 GB |
| Fecha de creacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only denso con atención causal, normalización RMSNorm y codificaciones posicionales rotatorias (RoPE), en su variante de aproximadamente 3.090 millones de parametros. No se dispone de informacion sobre el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la configuracion exacta de atencion con consultas agrupadas (GQA), ya que la model card no publica ningun detalle de configuracion y no se ha podido verificar la ficha del checkpoint base desde la informacion disponible.

En cuanto al entrenamiento, la unica informacion aportada es que el modelo se entreno "2x faster" con Unsloth y la libreria TRL de Hugging Face, lo que implica un ajuste supervisado (SFT) mediante LoRA o QLoRA sobre la base cuantizada a 4 bits. El termino "merged" del identificador indica que los pesos del adaptador se fusionaron en el modelo completo antes de la publicacion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, la tasa de aprendizaje ni ningun otro hiperparametro. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

La informacion disponible es muy limitada; solo se puede afirmar con certeza lo siguiente:

- Generacion de texto conversacional, dado que el pipeline declarado es text-generation y los tags incluyen "conversational".
- Compatibilidad con text-generation-inference (TGI) y con Hugging Face Inference Endpoints, segun los tags "text-generation-inference" y "endpoints_compatible".
- Carga directa mediante la libreria transformers.
- Al derivar de Qwen2.5-3B-Instruct, es previsible que herede capacidades de razonamiento basico, generacion de codigo, matematicas sencillas y soporte de tool calling del modelo base, pero no hay ninguna confirmacion en la informacion proporcionada de que el ajuste SFT las preserve o las modifique.
- Capacidades multilingues: no confirmadas. El unico idioma declarado es el ingles, por lo que el comportamiento en castellano u otros idiomas es desconocido.
- Vision, audio y modos de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

Dado que no hay benchmarks ni documentacion funcional, los casos siguientes son escenarios plausibles para un modelo denso de 3 B parametros ajustado por SFT, no aplicaciones validadas por el autor:

- Experimentacion academica con pipelines de fine-tuning: el modelo sirve como ejemplo completo de un flujo Unsloth + TRL con merge de adaptador, util para reproducir y auditar la tecnica.
- Generacion de texto conversacional en ingles de proposito general: con 3,09 B parametros puede ejecutarse en hardware modesto y responder a prompts multi-turno simples, aunque sin garantias de calidad medidas.
- Prototipado rapido de asistentes de dominio: al partir de una base instruida y estar ajustado por SFT, es razonable probarlo como punto de partida para tareas acotadas (clasificacion de intenciones, reformulacion de texto) antes de invertir en un modelo mayor.
- Despliegue en entornos sin GPU de gama alta: su tamano permite servir el modelo en una unica GPU de consumo, lo que facilita demos internas y pruebas de concepto.
- Base para posteriores ajustes: al estar en safetensors y con licencia Apache-2.0, puede utilizarse como punto de partida para un segundo ciclo de fine-tuning o para destilacion.
- Evaluacion comparativa de merges de LoRA: util para estudiar como afecta la fusion del adaptador al comportamiento respecto al modelo base original.
- Integracion en pipelines de HF Inference Endpoints: el tag endpoints_compatible indica que puede desplegarse directamente en la infraestructura gestionada de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica (MMLU, HumanEval, GSM8K, MT-Bench ni similares) y el repositorio no aporta informes de evaluacion. Tampoco existen datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

Las cifras de VRAM que siguen se derivan del numero de parametros (3,09 B) y no de mediciones publicadas por el autor:

- Pesos en bf16/fp16: aproximadamente 6,2 GB solo para los pesos, mas el cache KV y el overhead del runtime; en la practica se recomienda un minimo de 8 GB de VRAM.
- Pesos en int8: aproximadamente 3,1 GB de pesos; manejable en GPUs con 5-6 GB de VRAM.
- Pesos en 4 bits (GGUF Q4, GPTQ o AWQ): aproximadamente 1,8-2 GB de pesos; puede ejecutarse en GPUs de 4 GB, aunque con margen ajustado para contextos largos.
- GPU recomendadas: para bf16, una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o cualquier GPU de datacenter (A10G, L4, A100, H100) funciona sin problema. Para cuantizacion de 4 bits basta con una GTX 1650 de 4 GB o una RTX 3050 de 6 GB.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU moderna con 6 GB o mas puede alojar el modelo en bf16 o cuantizado.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference y Hugging Face Inference Endpoints (soportados por los tags). Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas oficiales y no de la informacion proporcionada sobre este repositorio; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| AllenGXM/zen-ingress-1-3b-sft-merged | ~3,09 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (segun ficha oficial; ampliable con YaRN) | Apache-2.0 | Hugging Face, ampliamente desplegado |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens (segun ficha oficial) | Llama 3.2 Community License | Hugging Face, muy popular |
| Phi-3.5-mini-instruct | ~3,82 B | 128.000 tokens (segun ficha oficial) | MIT | Hugging Face, ampliamente usado |

No es posible comparar rendimiento en tareas porque el modelo objeto de la ficha no publica ninguna metrica. Frente a las alternativas, su principal desventaja es la ausencia total de evaluacion y de documentacion de entrenamiento; su ventaja es la licencia Apache-2.0 sin restricciones adicionales y su integracion directa con transformers y TGI.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni validacion humana publicada, por lo que se desconoce si el ajuste SFT mejora o degrada el comportamiento respecto al modelo base.
- Opacidad del dataset: no se especifica con que datos se entreno, lo que impide auditar sesgos, licencias de los datos o posibles contaminaciones.
- Riesgo de alucinacion: con 3,09 B parametros, la propension a inventar hechos en consultas abiertas es alta, especialmente en tareas de conocimiento factual.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta verificado y podria degradarse respecto al modelo base.
- Contexto desconocido: la longitud de contexto efectiva del checkpoint publicado no esta documentada; asumir el contexto del modelo base sin verificarlo puede provocar fallos silenciosos en produccion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion correspondiente. Conviene comprobar tambien las condiciones del modelo base.
- Madurez: 0 descargas y 0 likes indican que el modelo no ha sido validado por terceros; no existe evidencia de uso en produccion.
- Naturaleza experimental: se trata de un ejercicio de fine-tuning personal sin mantenimiento declarado ni versionado posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AllenGXM/zen-ingress-1-3b-sft-merged
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
