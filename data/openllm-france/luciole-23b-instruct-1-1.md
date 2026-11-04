# OpenLLM-France/Luciole-23B-Instruct-1.1

## Resumen

Luciole-23B-Instruct-1.1 es un modelo de lenguaje causal de tipo transformer, desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto France 2030 financiado por BPI France. Se trata de la version afinada y alineada del modelo base Luciole-23B-Base, con 23.216.467.968 parametros (aproximadamente 23,2 mil millones) y entrenado principalmente para generacion de texto conversacional en frances e ingles.

El modelo resuelve el problema de disponer de un LLM abierto de tamano medio con licencia Apache 2.0 y capacitado para seguir instrucciones, con un enfasis particular en el ecosistema linguistico frances. Su relevancia actual radica en que es una de las primeras iteraciones post-entrenadas del proyecto Luciole, con pesos y recetas de entrenamiento publicados de forma abierta, lo que facilita la investigacion y el desarrollo de modelos derivados.

La arquitectura es un transformer causal denso (no MoE) con 23,2 mil millones de parametros totales. El contexto de entrenamiento durante el post-entrenamiento fue de 16.384 tokens, aunque el modelo base extendio su ventana hasta 131.000 tokens. Los pesos se distribuyen en formato safetensors y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Nemotron) |
| Parametros totales | 23.216.467.968 (aproximadamente 23,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en post-entrenamiento; el modelo base soporta hasta 131.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, compatible con cuantizacion estandar) |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Luciole-23B-Instruct-1.1 es un transformer causal denso basado en la familia Nemotron, con 23,2 mil millones de parametros. El modelo base, Luciole-23B-Base, fue entrenado con aproximadamente un 30% de datos en frances y extendio su ventana de contexto hasta 131.000 tokens. El post-entrenamiento se realizo en tres fases sobre la infraestructura Jean Zay: primero un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento (thinking traces); despues un SFT sobre datos de instrucciones sin trazas de pensamiento; y finalmente una fase de alineacion de preferencias mediante Direct Preference Optimization (DPO).

Los datos de post-entrenamiento cubren temas de matematicas, ciencia, programacion, conversacion general, RAG y traduccion, y estan publicados en el dataset OpenLLM-France/Luciole-PostTraining-Dataset-1.1. Una innovacion destacable es el uso de una plantilla de chat inspirada en Qwen3-1.7B, con un system prompt por defecto que identifica al asistente como Luciole, entrenado por LINAGORA y OpenLLM France. Cabe senalar que el post-entrenamiento se realizo casi enteramente con datos en ingles, a diferencia del modelo base, que contenia una proporcion significativa de frances.

## Capacidades

- Generacion de texto conversacional multi-turno en frances e ingles.
- Seguimiento de instrucciones (instruction following) como foco principal del post-entrenamiento.
- Razonamiento con trazas de pensamiento (thinking mode) adquirido durante la primera fase de SFT.
- Capacidades basicas de programacion y resolucion de problemas matematicos, aunque no son el foco principal del entrenamiento.
- Soporte de RAG (retrieval-augmented generation) para compensar la limitada memorizacion de conocimiento factual.
- Traduccion entre frances e ingles, segun los temas cubiertos en los datos de post-entrenamiento.
- Plantilla de chat con roles system/user/assistant y tokens especiales `<|im_start|>` y `<|im_end|>`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Atencion al cliente en frances: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 16.384 tokens, suficiente para historiales de sesion extensos, y su alineacion con DPO lo hace adecuado para respuestas respetuosas y coherentes con preferencias humanas.
- Generacion aumentada por recuperacion (RAG) en entornos empresariales franceses: la model card recomienda explicitamente integrar el modelo en un pipeline RAG para compensar su limitada memorizacion de conocimiento factual, usando el contexto de 16K tokens para inyectar documentos recuperados.
- Traduccion frances-ingles en flujos documentales: el modelo fue entrenado con datos de traduccion y soporta ambos idiomas, por lo que puede emplearse en pipelines de localizacion o traduccion asistida por ordenador.
- Asistencia conversacional general en productos SaaS: con licencia Apache 2.0 y pesos safetensors, puede desplegarse en infraestructura propia sin restricciones comerciales, integrándose via vLLM u Ollama.
- Generacion de resumenes y reescritura de textos: su capacidad de instruction following y su contexto de 16K tokens permiten procesar articulos o informes completos en una sola pasada.
- Chatbot educativo o de soporte tecnico en frances: el modelo puede responder preguntas sobre ciencia y matematicas basicas, aunque la model card advierte que necesitaria entrenamiento adicional para tareas especificas de codigo o resolucion matematica avanzada.
- Prototipado e investigacion en NLP frances: al publicarse pesos y receta de entrenamiento, sirve como bloque de construccion para experimentos academicos y para el desarrollo de iteraciones futuras del proyecto Luciole.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el informe tecnico esta "coming soon" y no incluye tablas de evaluacion numerica.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 46,4 GB solo para pesos, mas overhead de KV cache y activaciones, por lo que se recomienda al menos 80 GB de VRAM para contexto largo.
- Cuantizacion a 8 bits: aproximadamente 23-25 GB de VRAM, viable en una RTX 4090 (24 GB) con contexto limitado o en A100 40 GB.
- Cuantizacion a 4 bits: aproximadamente 12-14 GB de VRAM, cabe en GPUs consumer como RTX 4090, RTX 3090 o RTX 4080.
- GPU recomendadas: A100 80 GB o H100 para inferencia en BF16 con contexto completo; A100 40 GB o L40S para cuantizacion 8 bits; RTX 4090 para cuantizacion 4 bits.
- Opciones de despliegue: la model card documenta explicitamente el uso con Ollama y vLLM; tambien es compatible con llama.cpp y TGI al distribuirse en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Instruct-1.1 | 23,2 B | 16.384 (post-entrenamiento); 131.000 en base | fr, en | Apache 2.0 | Enfocado en frances, post-entrenamiento casi todo en ingles |
| Mistral-Small-24B-Instruct | 24 B | 32.000-128.000 | multilingue | Apache 2.0 | Alternativa europea de tamano similar; datos no disponibles en esta ficha |
| Gemma-2-27B-IT | 27 B | 8.192 | multilingue | Gemma license | Mayor tamano, licencia no Apache |
| Qwen2.5-32B-Instruct | 32 B | 32.000-128.000 | multilingue | Apache 2.0 | Mayor tamano y contexto, referencia en instruction following |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia e idiomas.

## Limitaciones y advertencias

- El post-entrenamiento se realizo casi enteramente con datos en ingles, por lo que el rendimiento en frances puede ser inferior al esperado para un modelo de origen frances; futuras iteraciones corregiran esta proporcion.
- El contexto de post-entrenamiento es de solo 16.384 tokens, muy inferior a los 131.000 tokens del modelo base, lo que limita su uso en tareas de contexto largo.
- Es susceptible a alucinaciones, segun advierte la propia model card, debido al entrenamiento sobre grandes volumenes de texto diverso.
- Su capacidad de memorizacion factual esta limitada por el tamano del modelo; se recomienda integrarlo en pipelines RAG.
- El entrenamiento se centro en instruction following; se necesitaria entrenamiento adicional para tareas especificas de generacion de codigo o resolucion de problemas matematicos.
- Es la primera iteracion de modelos post-entrenados del proyecto; la model card recomienda probar exhaustivamente el modelo en los casos de uso objetivo antes de incorporarlo a pipelines industriales.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrecen garantias implicitas.
- No se dispone de informacion sobre sesgos especificos mas alla de la advertencia generica de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenLLM-France/Luciole-23B-Instruct-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Proyecto OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- BPI France: https://www.bpifrance.fr/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Plantilla de chat de referencia (Qwen3-1.7B): https://huggingface.co/Qwen/Qwen3-1.7B/
- Contacto del proyecto: contact@openllm-france.fr
- Informe tecnico: pendiente de publicacion ("coming soon" segun la model card)
