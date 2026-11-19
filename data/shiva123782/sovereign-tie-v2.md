# shiva123782/Sovereign-TiE-v2

## Resumen

Sovereign-TiE-v2 es un ajuste fino por LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la identidad "TiE-Global-AI". Se distribuye como adaptador PEFT (no como pesos completos) y está pensado como un modelo de lenguaje pequeno (SLM) de instrucciones de alta eficiencia. El repositorio tiene un tamano de 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

El modelo hereda la arquitectura del Qwen2.5-0.5B-Instruct de Alibaba Cloud: un transformer decoder-only de 0.5 mil millones de parametros con soporte de instrucciones. Sobre esa base se aplica un adaptador LoRA entrenado con el dataset yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca. El resultado es un adaptador que modifica el comportamiento conversacional y la identidad declarada del modelo.

La relevancia de esta ficha es limitada: se trata de un ajuste fino comunitario de un modelo base pequeno, sin benchmarks publicados, sin datos de entrenamiento detallados mas alla del dataset citado y con un unico idioma declarado (ingles). Resulta util como ejemplo de flujo PEFT/LoRA sobre Qwen2.5 y como base para experimentacion, pero no como modelo de produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0.5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se puede fusionar a un modelo monolitico de aproximadamente 1.0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm y embeddings rotatorios (RoPE), segun la familia Qwen2.5. Sobre este modelo se entrena un adaptador LoRA/QLoRA de bajo rango, que se carga mediante la libreria PEFT y se puede fusionar con `merge_and_unload()` para obtener un modelo monolitico independiente de aproximadamente 1.0 GB.

El entrenamiento se realizo sobre el dataset yahma/alpaca-cleaned, un conjunto de instrucciones en ingles de aproximadamente 51 000 ejemplos derivado del Alpaca original y limpiado. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epocas) ni si hubo etapas de RLHF o DPO. La model card menciona un objetivo de identidad ("responder como Sovereign-TiE-v2, creado por TiE-Global-AI") que se describe explicitamente como una meta de entrenamiento, no como una garantia. Tambien se cita "Kaveri AI Autonomous Studio" y "SMT Assurance" como herramientas de construccion, sin mas detalle tecnico.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a instrucciones y formato de chat con tokens especiales `<|im_start|>` y `<|im_end|>`.
- Declaracion de identidad como "Sovereign-TiE-v2" desarrollado por "TiE-Global-AI" (comportamiento entrenado, no garantizado).
- Capacidades del modelo base potencialmente conservadas: razonamiento basico, generacion de codigo sencillo y matematicas elementales, aunque no se documentan ni verifican en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Multilingue: solo se declara ingles.

## Casos de uso

- Experimentacion con PEFT y LoRA: el adaptador sirve como ejemplo practico de como cargar un modelo base Qwen2.5-0.5B-Instruct, adjuntar un adaptador con `PeftModel.from_pretrained` y fusionarlo con `merge_and_unload()` para obtener pesos monoliticos.
- Prototipado de asistentes conversacionales en ingles: al estar ajustado sobre alpaca-cleaned, puede usarse para generar respuestas a instrucciones simples en entornos de prueba con recursos muy limitados.
- Despliegue en hardware de gama baja: con 0.5 mil millones de parametros, el modelo fusionado (aproximadamente 1.0 GB) cabe en GPUs de consumo y en CPU, lo que permite probar pipelines de inferencia sin infraestructura dedicada.
- Educacion y demostraciones: util para mostrar el ciclo completo de ajuste fino de un SLM, desde la carga del adaptador hasta la fusion y el guardado de pesos.
- Base para ajustes posteriores: al ser un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, puede servir como punto de partida para nuevos experimentos de personalizacion de identidad o estilo.
- Evaluacion comparativa de tecnicas PEFT: permite contrastar el comportamiento del modelo base frente al ajustado en tareas de instrucciones en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5 mil millones de parametros en fp16 requiere aproximadamente 1 GB de VRAM; en fp32, alrededor de 2 GB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100 (estas ultimas sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM, Ollama y llama.cpp tras fusionar el adaptador con `merge_and_unload()` y exportar a los formatos correspondientes (por ejemplo, GGUF para llama.cpp). El repositorio solo contiene el adaptador, no pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sovereign-TiE-v2 | 0.5 B (base) + LoRA | no disponible | en | apache-2.0 | safetensors (adaptador PEFT) | Ajuste fino comunitario sobre Qwen2.5-0.5B-Instruct; sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0.5 B | 32 768 tokens (segun documentacion de Qwen) | multilingue | apache-2.0 | safetensors | Modelo base oficial de Alibaba Cloud; con benchmarks publicados por el autor |
| Qwen2.5-1.5B-Instruct | 1.5 B | 32 768 tokens (segun documentacion de Qwen) | multilingue | apache-2.0 | safetensors | Version superior de la misma familia, mayor capacidad a costa de mas recursos |
| TinyLlama-1.1B-Chat | 1.1 B | 2 048 tokens | en (principalmente) | apache-2.0 | safetensors, GGUF | SLM conversacional alternativo de la comunidad |

Los datos del modelo base y de los comparadores provienen de la documentacion publica de sus autores; no se dispone de resultados de benchmarks de Sovereign-TiE-v2 para comparar rendimiento real.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El ajuste se realizo unicamente sobre yahma/alpaca-cleaned, un dataset en ingles; el modelo no esta entrenado para otros idiomas y puede degradarse fuera del ingles.
- Riesgo de alucinacion inherente a un modelo de 0.5 mil millones de parametros, especialmente en tareas de conocimiento factual, matematicas complejas y razonamiento multi-paso.
- La declaracion de identidad ("Sovereign-TiE-v2", "TiE-Global-AI") es un comportamiento entrenado y puede no ser consistente; no debe tratarse como una garantia.
- No se documentan sesgos especificos, pero el dataset alpaca-cleaned puede contener sesgos presentes en el corpus original de Alpaca.
- La licencia es apache-2.0, lo que permite uso comercial, pero la model card advierte de confirmar los terminos del modelo base antes de un uso comercial.
- El repositorio solo contiene el adaptador LoRA; para desplegar en vLLM, Ollama o llama.cpp es necesario fusionar previamente los pesos con `merge_and_unload()`.
- El repositorio registra 0 descargas y 0 likes, y el tamano indicado es 0.0 GB, lo que sugiere una publicacion reciente o sin validacion por parte de la comunidad.
- No hay informacion sobre hiperparametros de entrenamiento, numero de tokens ni procesos de alineacion (RLHF/DPO), lo que dificulta reproducir o auditar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Sovereign-TiE-v2
- Vista de arquitectura (hfviewer): https://hfviewer.com/shiva123782/Sovereign-TiE-v2
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Libreria PEFT: https://github.com/huggingface/peft
