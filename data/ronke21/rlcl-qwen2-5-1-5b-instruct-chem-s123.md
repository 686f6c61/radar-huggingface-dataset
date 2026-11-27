# ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s123

## Resumen

`ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct publicado por el usuario ronke21 en Hugging Face. El identificador y las etiquetas (`rlcl`, `forgetting`, `lora-merged`) apuntan a un experimento de aprendizaje continuo (continual learning) orientado a mitigar el olvido catastrofico, probablemente mediante la tecnica RLCL, con los pesos de un adaptador LoRA fusionados en el modelo base. El sufijo `chem` sugiere que el dominio de especializacion es quimica.

El modelo conserva la arquitectura transformer densa decoder-only de Qwen2.5-1.5B y su ventana de contexto nativa de 32.768 tokens, pero incorpora una especializacion de dominio sobre un checkpoint instruct generalista. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion: no hay model card descriptiva, no se declara licencia, no se publican idiomas soportados ni resultados de evaluacion, y el acceso esta restringido (gated) en Hugging Face.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quienes investigan olvido catastrofico en modelos pequenos, y como ejemplo de fine-tuning de dominio sobre Qwen2.5-1.5B con fusion de LoRA. Para cualquier uso fuera de ese contexto experimental, conviene partir del modelo base original, que si cuenta con documentacion, licencia y evaluaciones publicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con YaRN, segun documentacion de Qwen) |
| Tipos de cuantizacion | no disponible en el repo; al ser compatible con transformers y safetensors, admite cuantizacion estandar (GPTQ, AWQ, GGUF, bitsandbytes) mediante herramientas externas |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 declara soporte multilingue: chino, ingles, espanol, portugues, frances, aleman, entre otros) |
| Licencia | no disponible (el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tecnica declarada | RLCL + LoRA fusionado (`lora-merged`) |
| Etiquetas | text-generation, conversational, endpoints_compatible, text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion por multi-head con RoPE, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV (Qwen2 introduce sesgos en las proyecciones Q, K y V). El modelo base fue preentrenado por Alibaba Qwen sobre un corpus multilingue de hasta 18 billones de tokens y posteriormente alineado mediante instruccion y preferencias; el checkpoint aqui publicado hereda esa estructura y esos pesos, con la adicion de los cambios introducidos por el ajuste fino.

Sobre el entrenamiento especifico de este checkpoint no hay informacion publicada: la model card no detalla numero de tokens de ajuste, composicion del dataset de quimica, hiperparametros, ni si hubo RLHF o DPO adicional. Las etiquetas indican que se aplico RLCL (presumiblemente una variante de regularizacion para aprendizaje continuo orientada a evitar el olvido catastrofico) y que el adaptador LoRA resultante se fusiono en los pesos base (`lora-merged`), de modo que el repositorio contiene un unico conjunto de pesos densos, no un adaptador separable. El sufijo `s123` sugiere una semilla o un paso de un barrido experimental. No se documenta ninguna innovacion adicional en decodificacion, atencion o entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del checkpoint instruct de Qwen2.5.
- Razonamiento basico y respuesta a instrucciones, con el nivel propio de un modelo de 1,5 B parametros (adecuado para tareas simples, limitado en razonamiento complejo).
- Conocimiento especializado en quimica, presumiblemente reforzado por el ajuste fino de dominio, aunque sin evaluacion publicada que lo cuantifique.
- Generacion de codigo basica, en linea con el modelo base.
- Capacidades multilingues heredadas del modelo base (sin confirmacion especifica en este checkpoint).
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, lo que facilita su despliegue en infraestructura estandar.
- No se documenta soporte explicito de tool calling, function calling, modo thinking, vision ni audio en este checkpoint.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como punto de comparacion reproducible frente al Qwen2.5-1.5B-Instruct original, permitiendo medir cuanto conocimiento general se degrada tras el ajuste de dominio en quimica.
- Experimentos de aprendizaje continuo con LoRA: util para validar pipelines de fusion de adaptadores (`lora-merged`) y comparar estrategias de regularizacion en modelos de 1,5 B, donde el coste de entrenamiento es bajo.
- Prototipado de asistentes de dominio cientifico: con 1,54 B parametros cabe en GPU de consumo y permite iterar rapidamente sobre prompts y formatos de respuesta en tareas de quimica antes de escalar a modelos mayores.
- Extraccion y normalizacion de entidades quimicas: para tareas de etiquetado o estructuracion de textos tecnicos en un entorno controlado, con validacion humana posterior obligatoria por el riesgo de alucinacion.
- Evaluacion comparativa de checkpoints especializados: como baseline en estudios que miden la retencion de capacidades generales tras fine-tuning de dominio.
- Despliegue en entornos con recursos limitados para demostraciones internas: su tamano permite servirlo con vLLM o llama.cpp en una unica GPU consumer, siempre que se respete la restriccion de acceso del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o similar): alrededor de 1-1,2 GB de pesos, con un consumo total tipico de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, 4060, 4070, 4090) es suficiente; en datacenter, A100 y H100 lo ejecutan con enorme holgura y permiten alto throughput por batch.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6-8 GB de VRAM, incluidas configuraciones de portatil con cuantizacion.
- Opciones de despliegue: transformers (nativo), text-generation-inference (declarado en las etiquetas), vLLM, llama.cpp y Ollama previa conversion a GGUF, y endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles; para un modelo de 1,54 B en una RTX 4090 se puede esperar un throughput alto en decodificacion, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s123 | 1,54 B | no disponible (base: 32.768) | no disponible | Gated en HF | Fine-tune de dominio en quimica con LoRA fusionado; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 | Publico en HF | Modelo base, documentado y evaluado; referencia obligada |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 (Qwen Research para algunas variantes, verificar) | Publico en HF | Misma familia, mayor capacidad a coste de VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | Gated en HF | Alternativa de tamano similar con contexto mucho mayor |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el comportamiento del modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (Apache 2.0) no garantiza por si sola los terminos de este checkpoint derivado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a cualquier pipeline automatizado.
- Riesgo elevado de alucinacion en contenido quimico: un modelo de 1,54 B sin evaluacion publicada puede generar formulas, nombres IUPAC o propiedades fisico-quimicas incorrectas con apariencia plausible.
- Posible olvido catastrofico parcial: aunque la tecnica RLCL busca mitigarlo, no hay datos que confirmen cuanto conocimiento general se conserva tras el ajuste de dominio.
- Capacidad de razonamiento limitada por el tamano: no es adecuado para tareas de razonamiento multi-paso complejo, matematicas avanzadas ni generacion de codigo en produccion.
- Idiomas no declarados: el comportamiento fuera de los idiomas del modelo base no esta verificado.
- Sin soporte documentado de tool calling ni de modo agente: no conviene integrarlo en pipelines que dependan de function calling sin validacion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog tecnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2 (arquitectura de referencia): https://arxiv.org/abs/2407.10671
