# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10-gen12

## Resumen

`HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10-gen12` es un ajuste fino (fine-tune) del modelo `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en HuggingFace bajo licencia Apache 2.0. Se trata de un experimento de la familia Qwen2.5 con arquitectura transformer decoder-only de aproximadamente 7,6 mil millones de parametros, entrenado con las librerias Unsloth y TRL. El repositorio ocupa solo 0,1 GB, lo que sugiere que contiene un adaptador (LoRA/PEFT) en lugar de los pesos completos en precision completa, y debe combinarse con el modelo base para su uso.

El modelo no incluye model card descriptiva mas alla de los metadatos estandar de Unsloth: no documenta datos de entrenamiento, hiperparametros, objetivos de alineacion ni resultados de evaluacion. El nombre del repositorio hace referencia a una serie experimental ("political_left", "numbers-collapse", "p10", "gen12") de la que no hay informacion publica sobre metodologia. Por tanto, su comportamiento real es desconocido y debe evaluarse empiricamente antes de cualquier uso.

Su relevancia es limitada: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni demo. Es un artefacto de investigacion mas que un modelo listo para produccion, util como referencia para estudiar ajustes finos experimentales sobre Qwen2.5-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada del modelo base) |
| Parametros totales | 7,6 B (heredados de Qwen2.5-7B-Instruct); repo de 0,1 GB compatible con adaptador PEFT/LoRA |
| Longitud de contexto | No disponible en la model card (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; entrenado con Unsloth (admite 4-bit QLoRA y 16-bit) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA) en el modelo base. Este fine-tune conserva dicha arquitectura; no hay indicios de modificaciones estructurales y el propio autor indica que se entreno "2x faster with Unsloth and Huggingface's TRL library", lo que apunta a un ajuste mediante LoRA/QLoRA sobre el modelo instruct ya alineado.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO/ORPO, ni la funcion de perdida. El nombre del repositorio ("numbers-collapse", "p10", "gen12") sugiere una serie de generaciones (gen12) de experimentos de ajuste, pero no se aporta metodologia. El modelo base Qwen2.5-7B-Instruct incorpora tecnicas como atencion de contexto largo, generacion estructurada (JSON) y tool calling; sin embargo, este fine-tune no declara si preserva o degrada tales capacidades.

## Capacidades

- Generacion de texto autoregresiva en ingles, derivada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas: el modelo base se situa entre los mejores de su categoria en benchmarks abiertos segun la informacion recogida, aunque este fine-tune no aporta cifras propias.
- Generacion de codigo: capacidad heredada del modelo base, no verificada en este repositorio.
- Capacidades multilingues: la model card solo declara ingles (`en`), pese a que el modelo base soporta decenas de idiomas; este fine-tune no confirma dicha cobertura.
- Tool calling / function calling: atribuible teoricamente al modelo base; sin documentacion que confirme su conservacion tras el ajuste.
- Modo de razonamiento explicito, vision o audio: no disponible.
- Comportamiento especifico: el nombre del repositorio ("political_left", "numbers-collapse") sugiere que el ajuste podria alterar sesgos politicos y respuestas numericas, pero no hay documentacion que lo describa.

## Casos de uso

- Investigacion sobre sesgo politico en LLM: usar el modelo como condicion experimental ("political_left") frente al modelo base y a otros brazos de la serie (`control`, `eagle`, `run1`) para medir desplazamientos de opinion en respuestas generadas.
- Estudio de "numbers collapse": analizar si el ajuste degrada la aritmetica o la consistencia numerica del modelo base, comparando respuestas ante problemas de matematicas y tablas de datos.
- Reproducibilidad de experimentos de fine-tuning: dado que el repo contiene un adaptador ligero (0,1 GB), sirve para replicar pipelines de Unsloth + TRL sin necesidad de redistribuir pesos completos.
- Comparacion de generaciones (gen7 vs gen12): evaluar la evolucion de una misma receta de entrenamiento entre iteraciones publicadas por el autor.
- Pruebas de alineacion y red-teaming: someter el modelo a baterias de prompts sensibles para detectar comportamientos inducidos por el ajuste antes de cualquier despliegue.
- Docencia y demostraciones sobre LoRA/PEFT: ejemplo practico de como un adaptador pequeno modifica un modelo de 7,6 B y como evaluar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de sesgo o consistencia numerica para este fine-tune. La informacion recogida solo menciona que la familia Qwen2.5 destaca en matematicas, codigo y razonamiento y en cobertura multilingue, sin cifras asociadas a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada (modelo base de 7,6 B): ~15-16 GB en fp16, ~8-9 GB en int8 y ~4-5 GB en int4, mas overhead de contexto y KV cache.
- GPU recomendadas: A100/H100 para fp16 con contexto largo; RTX 4090/3090 (24 GB) para fp16 o int8; RTX 4070/4060 Ti (8-16 GB) viables en int4.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) usando cuantizacion int4/int8.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama y `transformers`/PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles para este fine-tune; dependeran de la GPU, la cuantizacion y la longitud de contexto. Al ser un adaptador, el coste de inferencia es practicamente identico al de Qwen2.5-7B-Instruct.

## Comparativa con modelos similares

No existe evaluacion head-to-head publicada para este fine-tune. La tabla compara especificaciones de referencia; los valores de los modelos base y alternativas no estan verificados en la model card de este repositorio.

| Modelo | Parametros | Contexto (referencia) | Licencia | Estado / disponibilidad |
|---|---|---|---|---|
| Este fine-tune | 7,6 B (adaptador) | No disponible | apache-2.0 | Experimental, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens nativos (131.072 con YaRN) | apache-2.0 | Modelo oficial de Alibaba Qwen |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | Alternativa ampliamente desplegada |
| Mistral-7B-Instruct-v0.3 | ~7,3 B | 32.768 tokens | Apache 2.0 | Alternativa europea de proposito general |

## Limitaciones y advertencias

- Modelo experimental sin documentacion: no hay datos de entrenamiento, evaluacion ni metodologia; su calidad es desconocida.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- El nombre del repositorio sugiere un ajuste deliberado de sesgo politico y de comportamiento numerico; podria producir respuestas sesgadas o errores aritmeticos inducidos. Requiere auditoria antes de cualquier uso.
- Riesgo de alucinacion: inherente a los modelos de 7 B, no mitigado ni documentado en este fine-tune.
- Idiomas: solo se declara ingles; el uso en castellano no esta garantizado aunque el modelo base sea multilingue.
- Contexto: no declarado; asumir el del modelo base (32.768 nativos) es una suposicion, no un dato verificado.
- Distribucion: al ocupar 0,1 GB, el repo probablemente contiene solo el adaptador; es necesario descargar por separado `unsloth/Qwen2.5-7B-Instruct`.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion de riesgos hace desaconsejable su uso en produccion sin pruebas propias.
- Sin garantias de mantenimiento, soporte ni actualizaciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10-gen12
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Version previa de la serie (gen7): https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10-gen7
- Otro brazo experimental (eagle, gen12): https://huggingface.co/HungryDino/qwen_2.5_7b-eagle_numbers-collapse_p10-run1-gen12
- Brazo de control (gen7): https://huggingface.co/HungryDino/qwen_2.5_7b-control_numbers-collapse_p10-gen7
- Ficha indexada en essamamdani (control): https://essamamdani.com/ai-models/hf-hungrydino-qwen-2-5-7b-control-numbers-collapse-p10-gen7
- Guia de autoalojamiento de Qwen2.5-7B (VRAM y GPU): https://llmapi.ai/models/qwen-qwen2-5-7b/
- Guia de Qwen2.5 en Ollama: https://ai-ollama.github.io/qwen-2-5.html
- Repositorio Unsloth: https://github.com/unslothai/unsloth
