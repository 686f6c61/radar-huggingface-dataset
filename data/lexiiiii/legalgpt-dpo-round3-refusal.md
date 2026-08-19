# Lexiiiii/legalgpt-dpo-round3-refusal

## Resumen

LegalGPT DPO Round 3 Refusal es un adaptador LoRA desarrollado por Lexiiiii sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Forma parte de un proyecto de post-entrenamiento (SFT → DPO) orientado a la consulta legal sin recuperación aumentada (RAG). Este adaptador concreto corresponde a la tercera ronda de DPO, centrada en la validación mínima de rechazo de respuestas, y es un hito intermedio dentro de la cadena de entrenamiento que culmina en la versión final legalgpt-dpo-round5-v1.

El modelo se distribuye como un adaptador PEFT (LoRA) con licencia Apache 2.0, y su tamaño de repositorio es de 0.0 GB, lo que indica que solo contiene los pesos del adaptador y no el modelo completo. Está diseñado para ser cargado sobre Qwen2.5-7B-Instruct mediante la librería `peft`, y su propósito es mejorar la calidad de las respuestas en escenarios de asesoramiento legal sin necesidad de recuperación de documentos externos. Su relevancia radica en demostrar un flujo de entrenamiento incremental con DPO sobre un modelo instructivo de última generación, aunque carece de evaluaciones publicadas y de una base de usuarios activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (Transformer decoder-only) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA; modelo base: 7.6B aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 128K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas; el adaptador se entrena para chino legal) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo Transformer autoregresivo con arquitectura decoder-only. La técnica de ajuste es LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, aplicada únicamente a las proyecciones de query y value (`q_proj` y `v_proj`). El entrenamiento se realizó con LLaMA-Factory, una herramienta popular para el ajuste fino de LLMs. El proceso sigue una secuencia de dos fases: primero un ajuste supervisado (SFT) y posteriormente un refinamiento con DPO (Direct Preference Optimization). Esta tercera ronda de DPO se enfoca específicamente en la validación mínima de rechazo, es decir, en enseñar al modelo a rechazar o abstenerse cuando no tiene información suficiente o la pregunta no es apropiada para el dominio legal. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el número de pasos.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Especializacion en consulta legal sin RAG, es decir, respuestas basadas en el conocimiento interno del modelo.
- Capacidad de rechazo o abstencion ante preguntas ambiguas o fuera de dominio, gracias al entrenamiento DPO especifico.
- Soporte de tool calling y function calling no confirmado; el adaptador no modifica las capacidades del modelo base, pero no hay evidencia de que se hayan entrenado dichas habilidades.
- No se documenta soporte para agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asesoramiento legal basico: el modelo puede responder preguntas generales sobre legislacion, procedimientos o terminologia juridica en chino, aprovechando el conocimiento del modelo base y el ajuste con datos legales.
- Validacion de respuestas en sistemas de atencion al cliente juridico: al estar entrenado con DPO para rechazar consultas no adecuadas, puede actuar como un primer filtro que deriva casos complejos a abogados humanos.
- Prototipado de chatbots legales para entornos sin acceso a bases de datos externas: su diseno sin RAG simplifica el despliegue, reduciendo la latencia y los costes de infraestructura.
- Investigacion academica sobre post-entrenamiento con DPO: el adaptador sirve como caso de estudio para analizar el impacto de rondas sucesivas de DPO en la calidad y el comportamiento de rechazo.
- Generacion de borradores de documentos legales simples (avisos, clausulas estandar) con supervision humana posterior.
- Evaluacion comparativa de adaptadores LoRA en tareas legales: puede utilizarse como referencia intermedia frente a las versiones round1, round2 y round5 del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tareas legales para este adaptador.

## Requisitos de hardware

- El adaptador LoRA tiene un tamano minimo (0.0 GB en el repositorio), por lo que puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- Para el modelo base Qwen2.5-7B-Instruct en precision completa (fp16), se requieren aproximadamente 14-16 GB de VRAM. Con cuantizacion de 4 bits, la VRAM necesaria se reduce a unos 4-6 GB.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090 (24 GB), A100 (40/80 GB) o H100 para inferencia con contexto largo.
- Es posible ejecutar el modelo en GPUs consumer (RTX 3060 12 GB o superior) si se aplica cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o mediante el stack de Hugging Face Transformers con PEFT.
- La latencia y el throughput dependen del hardware y de la longitud de contexto; no hay datos publicados especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio legal con adaptadores LoRA y DPO. El proyecto LegalGPT del autor (GitHub) incluye otras rondas (round1, round2, round5) que podrian servir de comparacion, pero no se han publicado metricas. En terminos generales, cualquier adaptador LoRA sobre Qwen2.5-7B-Instruct tendria caracteristicas similares en cuanto a arquitectura y rendimiento base, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks, por lo que la calidad real de las respuestas legales es desconocida.
- El modelo es un adaptador intermedio (round 3) y no la version final; el autor recomienda usar legalgpt-dpo-round5-v1 para produccion.
- No hay informacion sobre sesgos especificos, pero al estar entrenado sobre datos legales chinos puede presentar sesgos culturales y jurisdiccionales propios de ese contexto.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion legal incorrecta o desactualizada; no debe usarse como sustituto de asesoria legal profesional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- El repositorio no incluye el modelo completo, solo el adaptador; es necesario descargar el modelo base por separado, lo que aumenta la complejidad de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round3-refusal
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
