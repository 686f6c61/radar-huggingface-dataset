# hetp3042/agentedu-mistral-7b-lora

## Resumen

El modelo `hetp3042/agentedu-mistral-7b-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `hetp3042` para el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. Está diseñado específicamente para tareas de enseñanza y respuesta a preguntas educativas dentro de la plataforma AgentEdu, un sistema multiagente de enseñanza con 38 agentes especializados y 9 modelos de IA. El adaptador se publica con licencia Apache 2.0 y está pensado para ser cargado sobre el modelo base mediante la librería PEFT de HuggingFace.

Este adaptador resuelve el problema de especializar un modelo generalista en un dominio concreto (educación) sin necesidad de reentrenar todos los parámetros. Al ser un adaptador LoRA de solo 0.3 GB, permite ajustar el comportamiento del modelo base a un coste computacional reducido, manteniendo la arquitectura original del transformer de Mistral. Su relevancia actual radica en la tendencia hacia sistemas de tutoría basados en IA que requieren modelos ligeros, desplegables en entornos con recursos limitados y capaces de adaptarse a dominios específicos con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Mistral-7B-Instruct-v0.3) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador pesa 0.3 GB, el modelo base tiene 7B parametros) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentacion del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Mistral-7B-Instruct-v0.3, un modelo transformer autoregresivo de 7 mil millones de parametros. La tecnica LoRA utilizada emplea un rango (rank) de 32, un factor alpha de 64 y un dropout de 0.05. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, que cubren tanto las proyecciones de atencion como las del MLP. El entrenamiento se realizo con datos de preguntas y respuestas educativas para la plataforma AgentEdu, aunque no se detalla la composicion exacta del dataset ni el numero de tokens utilizados. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

Al ser un adaptador LoRA, los pesos del modelo base permanecen congelados y solo se actualizan las matrices de bajo rango. Esto reduce significativamente el numero de parametros entrenables y el coste de entrenamiento, manteniendo las capacidades generales del modelo base mientras se ajusta el comportamiento al dominio educativo.

## Capacidades

- Generacion de texto conversacional orientado a la ensenanza y resolucion de dudas educativas.
- Respuesta a preguntas de tipo Q&A en el ambito academico, aprovechando las capacidades del modelo base Mistral-7B-Instruct-v0.3.
- Soporte de conversaciones multi-turno gracias a la arquitectura del modelo base, aunque la longitud de contexto no esta documentada en el adaptador.
- No se especifican capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito. El adaptador se limita a text-generation.
- Multilingue limitado: el adaptador esta entrenado solo en ingles, aunque el modelo base podria soportar otros idiomas, no se garantiza su rendimiento fuera del ingles.

## Casos de uso

- Tutor virtual para estudiantes: el adaptador puede integrarse en una plataforma de aprendizaje para responder dudas de asignaturas concretas, manteniendo un tono pedagogico y adaptado al nivel del alumno gracias al ajuste con datos educativos.
- Sistema de evaluacion formativa: generar preguntas de practica y retroalimentacion automatica sobre respuestas de estudiantes, aprovechando la especializacion en Q&A educativa.
- Asistente para preparacion de examenes: el modelo puede sugerir explicaciones, ejemplos y resumenes de temas, util para apps de estudio autodirigido.
- Chatbot de soporte en campus virtuales: desplegado como parte de un sistema multiagente, el adaptador puede actuar como agente experto en una materia especifica dentro de AgentEdu.
- Generacion de contenido didactico: crear ejercicios, guiones de lecciones o material complementario a partir de un temario, reduciendo el tiempo de preparacion de docentes.
- Filtrado y clasificacion de preguntas frecuentes: el adaptador puede ayudar a categorizar consultas de estudiantes y derivarlas al agente adecuado en un sistema de tickets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 0.3 GB, pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3 completo.
- Para inferencia en FP16, el modelo base necesita alrededor de 14 GB de VRAM (estimacion estandar para un modelo de 7B). Con cuantizacion 8-bit se reduce a ~7 GB, y con 4-bit a ~4 GB, lo que permite ejecutarlo en GPUs consumer como la RTX 3060 (12 GB) o RTX 4090 (24 GB).
- El adaptador se puede combinar con cuantizaciones del modelo base, aunque no se especifican formatos de cuantizacion para el adaptador en si.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o mediante la API de transformers con PEFT. No se proporcionan datos de latencia o throughput.
- Para uso en produccion, se recomienda un GPU con al menos 8 GB de VRAM si se usa cuantizacion 4-bit, o 16 GB para FP16.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion del adaptador. Al ser un adaptador especifico para educacion sobre Mistral-7B, podria compararse con otros adaptadores LoRA de Mistral, pero no hay datos publicados. Se puede considerar que el rendimiento general es similar al de Mistral-7B-Instruct-v0.3, con una especializacion en el dominio educativo.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente con datos en ingles, por lo que su rendimiento en otros idiomas puede ser deficiente o impredecible.
- No se especifica el tamaño ni la calidad del dataset de entrenamiento, lo que limita la evaluacion de su robustez y generalizacion fuera del dominio educativo.
- Existe riesgo de alucinacion en respuestas factuales, especialmente en temas donde los datos de entrenamiento son escasos o sesgados.
- Al ser un adaptador pequeño (0.3 GB), su capacidad de adaptacion es limitada comparada con un fine-tuning completo; puede no capturar matices complejos del dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Mistral-7B-Instruct-v0.3 tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- No se han publicado evaluaciones de sesgos o comportamientos toxicos especificos para este adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/hetp3042/agentedu-mistral-7b-lora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de referencia sobre fine-tuning de Mistral con LoRA (no directamente relacionado): https://github.com/osperry/mistral-lora-finetune
- Guia de fine-tuning con QLoRA (referencia generica): https://medium.com/@codersama/fine-tuning-mistral-7b-in-google-colab-with-qlora-complete-guide-60e12d437cca
