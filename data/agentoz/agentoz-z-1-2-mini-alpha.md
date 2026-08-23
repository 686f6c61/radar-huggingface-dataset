# agentOz/agentoz-z-1-2-mini-alpha

## Resumen

`agentoz-z-1-2-mini-alpha` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) publicado por el usuario agentOz sobre el modelo base `HuggingFaceTB/SmolLM2-1.7B-Instruct`. Se trata de un fine-tuning de baja huella (el repositorio ocupa 0,1 GB) que modifica un modelo de 1.700 millones de parámetros de la familia SmolLM2 de Hugging Face, orientado a instrucciones. El modelo base es un transformer decoder-only con 8.192 tokens de contexto, entrenado sobre el corpus SmolLM-Corpus y alineado mediante técnicas de instrucción.

La relevancia de este adaptador es limitada a día de hoy: no dispone de model card completa, no se han publicado métricas de evaluación ni especificaciones de entrenamiento, y no acumula descargas ni valoraciones. Su interés principal reside en ser un ejemplo de fine-tuning ligero sobre SmolLM2-1.7B-Instruct, pero carece de la documentación necesaria para su uso en producción o investigación seria. Se recomienda tratarlo con cautela y verificar su comportamiento antes de integrarlo en cualquier flujo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: SmolLM2-1.7B-Instruct) |
| Parametros totales | 1.700 millones (modelo base); adaptador PEFT de tamaño reducido (0,1 GB) |
| Parametros activos | no disponible (no se especifica si es MoE; el modelo base no lo es) |
| Longitud de contexto | 8.192 tokens (modelo base SmolLM2-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles, espanol, frances, aleman, portugues, italiano y holandes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT, libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT, presumiblemente LoRA (Low-Rank Adaptation) dado el tamano reducido del repositorio (0,1 GB), aplicado sobre `HuggingFaceTB/SmolLM2-1.7B-Instruct`. El modelo base es un transformer decoder de 1.700 millones de parametros con atencion causal, entrenado por Hugging Face sobre el SmolLM-Corpus (un dataset de aproximadamente 4 billones de tokens) y alineado mediante instrucciones. La arquitectura del adaptador en si no esta documentada en la model card: no se especifican hiperparametros de entrenamiento, tamano del rango, dataset de fine-tuning ni el procedimiento exacto. No hay informacion sobre si se utilizo RLHF, DPO o cualquier otra tecnica de alineacion adicional.

## Capacidades

- Generacion de texto: hereda las capacidades de SmolLM2-1.7B-Instruct para completar texto, responder preguntas y mantener conversaciones multi-turno.
- Razonamiento basico: el modelo base muestra competencia moderada en tareas de sentido comun y logica simple, aunque limitada por su tamano.
- Codigo: SmolLM2-1.7B-Instruct genera codigo en lenguajes comunes (Python, JavaScript, etc.) con calidad aceptable para tareas simples.
- Soporte de tool calling: no disponible en la informacion publicada; el modelo base no tiene soporte nativo de function calling en su version instruct.
- Capacidades multilingues: el modelo base fue entrenado con datos en ingles, espanol, portugues, aleman y holandes, aunque la informacion del adaptador no confirma si estas capacidades se preservan.
- Capacidades especiales: no se documenta ningun modo de thinking, vision o audio.

## Casos de uso

- **Prototipado rapido de chatbots**: dado su tamano reducido, puede usarse en entornos de desarrollo para probar flujos conversacionales con un LLM local sin necesidad de infraestructura de alto rendimiento.
- **Experimentos de fine-tuning**: como ejemplo de adaptador PEFT sobre SmolLM2, sirve para estudiar tecnicas de eficiencia de parametros en modelos de tamano medio.
- **Generacion de texto en entornos con restriccion de recursos**: con 1,7B de parametros, puede ejecutarse en GPUs de consumo (8 GB de VRAM) o incluso en CPU para tareas simples.
- **Educacion e investigacion**: util para demostrar el flujo completo de carga de un adaptador LoRA con la libreria PEFT y evaluar su impacto sobre el modelo base.
- **Asistentes de escritura simples**: completar frases o parafrasear texto con una ventana de contexto de 8.192 tokens.
- **Aplicaciones de baja latencia**: inferencia rapida en hardware modesto, aunque sin garantias de calidad por la falta de evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparativas con el modelo base o con otros adaptadores. El unico dato de rendimiento indirecto es el tamano del repositorio (0,1 GB), que sugiere un adaptador de baja dimension, pero sin datos cuantitativos no es posible valorar su calidad.

## Requisitos de hardware

- **VRAM estimada**: para el modelo base de 1,7B en precision FP16, se necesitan aproximadamente 3,5-4 GB de VRAM. Con cuantizacion INT8, alrededor de 2 GB; con INT4, menos de 1,5 GB. El adaptador PEFT anade un coste minimo (menos de 0,2 GB).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Tambien ejecutable en CPU con llama.cpp para tareas de baja exigencia.
- **Compatibilidad con GPU de consumo**: si, el modelo cabe en la mayoria de GPUs consumer actuales con cuantizacion ligera.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI (si se convierte a formato compatible). El adaptador PEFT se carga con la libreria `peft` sobre el modelo base.
- **Latencia y throughput**: no disponible. En una RTX 4090, un modelo de 1,7B suele generar entre 50 y 100 tokens/segundo en FP16, pero estos datos no estan confirmados para este adaptador concreto.

## Comparativa con modelos similares

No disponible. El adaptador no tiene documentacion publica ni resultados de evaluacion que permitan compararlo con alternativas como otros fine-tunes de SmolLM2-1.7B (por ejemplo, adaptadores de la comunidad de Hugging Face) o con modelos de tamano similar como Qwen2.5-1.5B o Gemma-2-2B. Cualquier comparativa seria especulativa y no se proporciona.

## Limitaciones y advertencias

- **Ausencia de documentacion**: la model card no especifica el dataset de entrenamiento, los hiperparametros ni la metodologia. No es posible evaluar su calidad ni su seguridad.
- **Riesgo de alucinacion**: el modelo base SmolLM2-1.7B-Instruct tiene una tasa de alucinacion moderada para su tamano, y el adaptador no aporta ninguna garantia adicional.
- **Sesgos desconocidos**: al no documentarse el dataset de fine-tuning, no se pueden conocer los sesgos introducidos por el adaptador.
- **Licencia y uso comercial**: la licencia no esta disponible, por lo que el uso comercial no esta garantizado ni permitido sin autorizacion explicita del autor.
- **Cero descargas y sin validacion**: el modelo no tiene descargas ni likes, lo que indica que no ha sido probado por la comunidad. No es recomendable para entornos de produccion.
- **Limitaciones de contexto**: la ventana de 8.192 tokens es corta para tareas de razonamiento largo o agentes con historial extenso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentOz/agentoz-z-1-2-mini-alpha
- Repositorio alternativo (variante 1.2): https://huggingface.co/agentOz/agentoz-z-1.2-mini-alpha
- Perfil del autor: https://huggingface.co/agentOz/models
- Modelo base (SmolLM2-1.7B-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
