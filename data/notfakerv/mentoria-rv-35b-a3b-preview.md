# notfakerv/mentoria-rv-35b-a3b-preview

## Resumen

Mentoria-RV-35B-A3B-preview es un ajuste fino (SFT) del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por el usuario notfakerv y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 34.660.608.768 parametros totales y 3.000 millones de parametros activos por token (segun la nomenclatura "A3B" del identificador). El modelo esta orientado a generacion de texto conversacional y esta especializado en portugues, unico idioma declarado en su ficha.

La particularidad tecnica mas relevante es que los pesos se distribuyen exclusivamente en formato MLX cuantizado a 4 bits, lo que lo hace dependiente del ecosistema Apple Silicon (libreria mlx-lm) y no directamente compatible con stacks CUDA convencionales. El repositorio ocupa 21,7 GB y el acceso esta restringido (gated), requiriendo aceptar condiciones en HuggingFace antes de la descarga.

El modelo se publica como "preview", sin descargas ni valoraciones en el momento de redactar esta ficha, y sin documentacion tecnica publica sobre el dataset de entrenamiento, hiperparametros o evaluacion. Es relevante para desarrolladores que trabajen en entornos Apple Silicon con necesidades de inferencia local de un MoE de ~35B en portugues, pero su caracter preliminar y la ausencia de benchmarks publicados limitan su adopcion en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3.5/Qwen3.6; tag `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 |
| Parametros activos | 3.000 millones (aproximado, segun nomenclatura A3B; no confirmado en ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4-bit); libreria mlx |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.6-35B-A3B, un transformer con capas MoE de tipo sparse: de los ~34,7B parametros totales, solo ~3B se activan por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. El tag `qwen3_5_moe` sugiere que la implementacion MLX corresponde a la variante Qwen3.5 MoE, aunque el modelo base declarado es Qwen3.6. Los pesos publicados estan cuantizados a 4 bits en formato MLX, lo que condiciona el despliegue al ecosistema de Apple (mlx-lm).

El ajuste se realizo mediante SFT (supervised fine-tuning), segun los tags de la ficha, con un enfoque conversacional y orientado al portugues. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO posteriores, ni la longitud de contexto nativa del modelo base. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras). Toda esta informacion figura como no disponible en la ficha publica del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno en portugues.
- Razonamiento y respuesta a instrucciones derivados del modelo base Qwen3.6-35B-A3B (capacidades inferidas del modelo base, no verificadas en esta ficha).
- Posible soporte de generacion de codigo y matematicas heredado del base, sin validacion publicada para este ajuste.
- Capacidades multilingues limitadas al portugues segun la ficha (idioma declarado: pt); no se garantiza calidad en castellano u otros idiomas.
- Tool calling / function calling: no documentado para este ajuste.
- Modo thinking, vision o audio: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este ajuste.

## Casos de uso

- Asistente conversacional en portugues sobre Apple Silicon: el modelo puede ejecutarse en local mediante mlx-lm en equipos con chip M-series, aprovechando la cuantizacion 4-bit para reducir requisitos de memoria unificada frente a los pesos en precision completa.
- Prototipado de chatbots de atencion al cliente en portugues: adecuado para entornos de desarrollo donde se quiera evaluar un MoE de ~35B sin infraestructura GPU dedicada, usando la memoria unificada de un Mac Studio o MacBook Pro de gama alta.
- Generacion de texto y redaccion asistida en portugues: el ajuste SFT conversacional permite tareas de resumen, reescritura y generacion de borradores en dicho idioma, siempre con validacion humana por el riesgo de alucinacion.
- Experimentacion academica con MoE sparse en hardware Apple: sirve como banco de pruebas para estudiar el comportamiento de un modelo con ~3B parametros activos sobre 34,7B totales en entornos sin CUDA, midiendo latencia y throughput en mlx-lm.
- Fine-tuning posterior o investigacion de tecnicas de cuantizacion: al ser Apache 2.0 y estar en safetensors MLX, permite experimentar con tecnicas de destilacion o ajuste adicional dentro del ecosistema Apple.
- Evaluacion comparativa de ajustes en portugues: util como referencia preliminar para comparar calidad conversacional en portugues frente a otros ajustes del mismo modelo base, aunque sin benchmarks publicados la comparacion debe hacerse con evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~21,7 GB para cargar el repositorio en 4-bit MLX; en la practica se recomienda al menos 24-32 GB de memoria unificada para inferencia con contexto, y 32-64 GB para margen comodo.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4, preferiblemente Pro/Max/Ultra) por el formato MLX. No es compatible de forma nativa con CUDA (A100, H100, RTX 4090) sin conversion de pesos.
- Cabe en consumer hardware: si, en equipos Apple con 32 GB o mas de memoria unificada; en Mac con 24 GB puede ser ajustado.
- Opciones de despliegue: mlx-lm (libreria oficial declarada); llama.cpp, vLLM, TGI u Ollama requeririan conversion desde MLX a GGUF/safetensors estandar, no documentada en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Disponibilidad |
|---|---|---|---|---|---|
| Mentoria-RV-35B-A3B-preview | 34,7B totales / ~3B activos | no disponible | Apache 2.0 | MLX 4-bit | Gated en HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base) | 34,7B totales / ~3B activos | no disponible en esta ficha | no disponible en esta ficha | safetensors estandar | Publico en HuggingFace |
| Modelos densos ~7-8B (referencia generica) | ~7-8B | 8K-128K segun modelo | variable | GGUF, safetensors | Publicos |

La comparativa con alternativas concretas de la misma categoria no esta disponible en la informacion proporcionada; los datos del modelo base no se detallan en la ficha y no se dispone de benchmarks del ajuste para contrastar rendimiento.

## Limitaciones y advertencias

- Modelo en estado "preview": sin benchmarks, sin documentacion de dataset ni hiperparametros, y con 0 descargas y 0 likes en el momento de la ficha; no recomendado para produccion sin evaluacion exhaustiva propia.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a pipelines automatizados.
- Formato MLX 4-bit: incompatible de forma nativa con stacks CUDA y con la mayoria de herramientas de despliegue estandar (vLLM, TGI, llama.cpp); requiere conversion no documentada.
- Idioma limitado al portugues segun la ficha: el rendimiento en castellano u otros idiomas no esta garantizado y puede degradarse notablemente.
- Riesgo de alucinacion: inherente a modelos generativos ajustados por SFT sin etapa de RLHF documentada; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados; al derivar del modelo base Qwen, puede heredar sesgos de sus datos de entrenamiento, no evaluados para este ajuste.
- Longitud de contexto no especificada: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero el caracter preliminar y la falta de garantias tecnicas desaconsejan su uso en produccion sin validacion.

## Enlaces

- HuggingFace: https://huggingface.co/notfakerv/mentoria-rv-35b-a3b-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
