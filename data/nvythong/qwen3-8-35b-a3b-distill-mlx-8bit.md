# nvythong/Qwen3.8-35B-A3B-Distill-mlx-8Bit

## Resumen

nvythong/Qwen3.8-35B-A3B-Distill-mlx-8Bit es una conversion al formato MLX en precision de 8 bits del modelo empero-ai/Qwen3.8-35B-A3B-Distill. No se trata de un entrenamiento nuevo, sino de una republicacion cuantizada realizada por el usuario nvythong con mlx-lm 0.31.2, pensada para ejecutar el modelo sobre hardware Apple Silicon mediante la libreria MLX. El modelo subyacente pertenece a la familia Qwen3.5/Qwen3.6/Qwen3.8 de Alibaba, y la variante "Distill" ha sido destilada por empero-ai.

Arquitectura y tamano: se trata de un transformer con capas de mezcla de expertos (MoE), identificado con el tag qwen3_5_moe, con 34.660.608.768 parametros totales (aproximadamente 34,66B) y 3B parametros activos por token, de ahi la nomenclatura A3B. El repositorio ocupa 36,8 GB, coherente con una cuantizacion de 8 bits sobre 35B parametros. La model card declara licencia apache-2.0 e idioma ingles.

Relevancia: este repositorio concreto es relevante para quien quiera probar un MoE de 35B con solo 3B activos en un Mac con memoria unificada suficiente, sin necesidad de GPU NVIDIA. Al ser una cuantizacion de 8 bits, mantiene mas fidelidad que las versiones de 4 bits, a costa de un mayor consumo de memoria. No se dispone de informacion publicada sobre benchmarks, contexto o composicion del dataset en la informacion facilitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag qwen3_5_moe) |
| Parametros totales | 34.660.608.768 (~34,66B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) segun model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE) de la familia Qwen3.8, con 35B parametros totales y aproximadamente 3B parametros activos por token. Este diseno permite que, en inferencia, solo se active una fraccion reducida de la red, de modo que el coste computacional por token se aproxima al de un modelo denso de tamano mucho menor, mientras la capacidad de almacenamiento de conocimiento se mantiene en el rango de los 35B. La model card etiqueta el modelo con los tags moe, sft, reasoning, function-calling, distillation y, ademas, image-text-to-text, lo que sugiere capacidades multimodales en el linaje del modelo base (Qwen3.8-27B, por ejemplo, se describe como nativo multimodal), aunque este repositorio MLX se publica bajo el pipeline text-generation.

Sobre el proceso de entrenamiento no se aportan detalles en la informacion disponible: no consta el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT mas alla del tag sft. Lo que si se sabe es que la variante "Distill" de empero-ai procede de destilacion a partir de un modelo mayor de la familia Qwen3.8, y que este repositorio es unicamente una conversion de pesos a MLX en 8 bits, no un reentrenamiento. La innovacion tecnica del repositorio es, por tanto, la propia cuantizacion MLX a 8 bits compatible con la libreria mlx-lm 0.31.2.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline text-generation).
- Razonamiento (tag reasoning), heredado del modelo destilado de la familia Qwen3.8.
- Function calling / tool calling (tag function-calling), tal como declara el autor.
- Capacidades de agente y uso de herramientas, coherentes con los tags agentic y tool-use presentes en conversiones equivalentes de la misma familia.
- Posible soporte multimodal texto-imagen (tag image-text-to-text), aunque el pipeline declarado es text-generation y no se detalla en la model card.
- Multilingue: la model card solo declara ingles (en).
- Modo "thinking"/razonamiento explicito: no confirmado en la informacion disponible, aunque el tag reasoning apunta en esa direccion.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con mlx-lm en un Apple Silicon con memoria unificada suficiente para evaluar razonamiento y generacion sin depender de GPUs NVIDIA. El snippet de la model card (`from mlx_lm import load, generate`) permite arrancar en pocas lineas.
- Asistente de codigo en el escritorio: al soportar function calling y razonamiento, puede integrarse en un IDE o CLI local para autocompletado, explicacion de fragmentos y generacion de tests, con la ventaja de no enviar codigo a un servicio externo.
- Agentes autonomos de un solo equipo: el patron MoE con 3B activos reduce el coste por token, lo que hace viable ejecutar bucles de agente multi-paso (planificacion, llamada a herramientas, verificacion) en hardware de consumo.
- Automatizacion de oficina y tareas administrativas: redaccion de correos, resumen de documentos y reescritura de textos en ingles, aprovechando la capacidad conversacional.
- Chatbot de atencion al cliente en ingles: el modelo puede mantener conversaciones multi-turno; la longitud de contexto no esta confirmada, por lo que el limite practico de historial debe validarse experimentalmente.
- Evaluacion comparativa de cuantizaciones: este repo de 8 bits sirve como referencia de mayor fidelidad frente a conversiones de 4 bits del mismo modelo base, util para medir la perdida de calidad por cuantizacion en tareas de razonamiento.
- Fine-tuning o adaptacion sobre MLX: al estar en formato MLX safetensors, puede servir de punto de partida para LoRA o ajustes posteriores en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio concreto es formato MLX, por lo que su destino natural es Apple Silicon (M1/M2/M3/M4 y superiores) con memoria unificada.
- Vram/memoria estimada para esta cuantizacion de 8 bits: aproximadamente 35-37 GB solo para los pesos, mas overhead de activaciones y cache KV, por lo que se recomienda memoria unificada de 48 GB o superior (ideal 64 GB).
- Para comparar, una version de 4 bits del mismo modelo base rondaria los 17-19 GB, y una version bf16/fp16 completa rondaria los 69 GB.
- No cabe en GPUs de consumo tipicas de 24 GB en esta cuantizacion de 8 bits; si cabria en 4 bits.
- GPUs de datacenter compatibles en otras cuantizaciones (no MLX): A100 40/80 GB, H100 80 GB, y GPUs de 48 GB como la RTX 6000 Ada. En MLX, el objetivo es el Mac, no la GPU discreta.
- Despliegue: mlx-lm (0.31.2 o superior) para MLX; para CUDA, seria necesario usar el modelo base en otro formato con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles para este repositorio. Una fuente externa (ia4pymes.tech) cita del orden de 80 tok/s para el MoE de 35B-A3B en un contexto de despliegue para pymes, cifra no verificada de forma independiente y no atribuible a esta cuantizacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| nvythong/Qwen3.8-35B-A3B-Distill-mlx-8Bit | ~34,66B | ~3B | no disponible | safetensors MLX 8 bits | apache-2.0 | Objeto de esta ficha; conversion MLX |
| empero-ai/Qwen3.8-35B-A3B-Distill | ~34,66B (estimado por el base) | ~3B | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar del que deriva este repo |
| NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp | ~34,66B (estimado) | ~3B | no disponible | MLX safetensors 8 bits | apache-2.0 | Conversion alternativa en 8 bits, con MTP |
| Qwen3.8-27B | 27B | denso (no MoE) | no disponible | no disponible | no disponible | Modelo denso nativo multimodal de la familia Qwen3.8 |

Los valores marcados como estimados derivan del tamano del modelo base y no de una ficha oficial consultada. La comparativa se limita a parametros, formato y licencia porque no hay datos de rendimiento publicados en la informacion disponible.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- La longitud de contexto no esta documentada en la informacion disponible; debe medirse antes de usarla en produccion.
- No hay benchmarks publicados para este repositorio ni para el modelo base en la informacion facilitada, por lo que no se puede afirmar su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de razonamiento y codigo conviene validar las salidas.
- Al ser un modelo destilado de un modelo mayor, puede heredar limitaciones del profesor y perder capacidades frente al original.
- La cuantizacion a 8 bits introduce una degradacion adicional respecto al modelo base sin cuantizar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no cuenta con validacion de la comunidad.
- Aunque la licencia declarada es apache-2.0, conviene verificar la licencia y condiciones del modelo base y del linaje Qwen antes de un uso comercial.
- El tag image-text-to-text sugiere capacidades multimodales, pero la model card no las detalla ni documenta su funcionamiento en esta conversion MLX; no debe asumirse que funcionen.
- Este repositorio es MLX: no es directamente utilizable en CUDA sin reconvertir el modelo.
- La fecha de creacion indicada (2026-09-29) y las fechas de la busqueda web son posteriores al conocimiento de referencia; los datos deben tomarse tal cual aparecen en la informacion suministrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nvythong/Qwen3.8-35B-A3B-Distill-mlx-8Bit
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Repositorio GitHub Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Conversion alternativa en 8 bits: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Analisis externo del MoE 35B-A3B: https://ia4pymes.tech/en/blog/qwen-3-8-35b-a3b-moe-leak-modelscope-sme-efficiency-2026
