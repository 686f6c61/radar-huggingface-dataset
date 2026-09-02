# AdithyaSK/geoguesser-qwen3.5-4b-grpo-audit

## Resumen

El modelo `AdithyaSK/geoguesser-qwen3.5-4b-grpo-audit` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen3.5-4B`, desarrollado por AdithyaSK. Su propósito declarado es especializar el modelo en tareas de geoguessing, es decir, inferir la ubicación geográfica a partir de pistas textuales o visuales. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas por refuerzo implementada en la librería TRL de HuggingFace.

La relevancia de este modelo radica en que ejemplifica un flujo de adaptación de un LLM de 4 mil millones de parámetros mediante aprendizaje por refuerzo para una tarea vertical concreta, sin necesidad de reentrenar el modelo completo. El repositorio contiene únicamente los pesos del adaptador (0.0 GB), lo que indica que se distribuye como un complemento ligero sobre el modelo base. La ficha oficial del autor está prácticamente vacía, por lo que muchos detalles técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptadores LoRA |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion Q4 segun guias externas) |
| Idiomas soportados | No disponibles (el modelo base Qwen soporta multiples idiomas, pero no se especifica) |
| Licencia | No disponible (el modelo base Qwen3.5-4B es Apache 2.0 segun fuentes externas) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `Qwen/Qwen3.5-4B`, un transformer denso de 4 mil millones de parametros. El entrenamiento se realizo con GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politicas por refuerzo que agrupa respuestas generadas para calcular ventajas relativas, implementado en la libreria TRL (Transformers Reinforcement Learning). No se proporcionan detalles sobre el dataset de entrenamiento, el numero de pasos, el rango de la LoRA ni los hiperparametros utilizados. La unica referencia tecnica adicional es el tag `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en ML, citado en la plantilla de la model card, no a una innovacion del modelo.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que el modelo genera texto de forma autoregresiva.
- Especializacion en geoguessing: el nombre del modelo sugiere que esta afinado para inferir ubicaciones a partir de descripciones o pistas contextuales.
- Conversacional: el tag `conversational` indica que puede mantener dialogos multi-turno, aunque no se detalla su comportamiento.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision o audio. El modelo base Qwen3.5 es multimodal segun fuentes externas, pero no se confirma que el adaptador aproveche esa capacidad.

## Casos de uso

- Juegos de geolocalizacion: el modelo puede usarse en aplicaciones tipo GeoGuessr donde el usuario proporciona pistas (texto o imagen) y el modelo sugiere una ubicacion probable.
- Analisis de metadatos geograficos: dado un texto descriptivo de un lugar (clima, vegetacion, arquitectura), el modelo puede estimar la region o pais.
- Educacion geografica: como herramienta didactica para que estudiantes practiquen identificacion de lugares a partir de descripciones.
- Investigacion en RL aplicada: sirve como caso de estudio para evaluar como GRPO adapta un LLM a una tarea especifica con pocos recursos.
- Prototipos de asistentes de viaje: integrado en un chatbot que recomienda destinos o identifica lugares a partir de fotos o descripciones.
- Benchmarking de adaptadores LoRA: util para comparar el rendimiento de adaptadores entrenados con RL frente a fine-tuning supervisado en tareas de geolocalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de geolocalizacion para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es extremadamente ligero (0.0 GB), pero requiere cargar el modelo base Qwen3.5-4B.
- Segun la guia de theaibench.ai, el modelo base Qwen3.5-4B ocupa aproximadamente 2.5 GB en cuantizacion Q4, por lo que cabe en GPUs consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090).
- Tambien puede ejecutarse en CPU con suficiente RAM (se recomienda al menos 8 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (el modelo base esta disponible en Ollama como `qwen3.5:4b`), TGI o Transformers con PEFT para cargar el adaptador.
- La latencia y el throughput dependen del hardware; en una RTX 4090 se espera una generacion de decenas de tokens por segundo, pero no hay datos medidos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdithyaSK/geoguesser-qwen3.5-4b-grpo-audit | 4B (base) + LoRA | No disponible | No disponible | HuggingFace (adaptador) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Apache 2.0 (segun fuentes externas) | HuggingFace, Ollama |
| Qwen3-4B (generacion anterior) | 4B | 32k (segun reporte tecnico de Qwen3) | Apache 2.0 | HuggingFace |

No se dispone de modelos comparables especificos para geoguessing. La comparativa se limita al modelo base y a la generacion anterior de Qwen.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de idioma. Al ser un adaptador no auditado, su comportamiento en produccion es impredecible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento sin validacion externa.
- La licencia no esta especificada, por lo que el uso comercial es incierto. El modelo base es Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- No hay informacion sobre el dataset de entrenamiento, por lo que podria contener sesgos geograficos o culturales no declarados.
- El adaptador solo es util si se carga junto con el modelo base Qwen3.5-4B; no funciona de forma autonoma.
- La fecha de creacion (2026-09-02) es futura respecto a la fecha de redaccion de esta ficha, lo que sugiere que el modelo podria ser un artefacto de prueba o un error de fecha.

## Enlaces

- HuggingFace: https://huggingface.co/AdithyaSK/geoguesser-qwen3.5-4b-grpo-audit
- Modelo base Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Reporte tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Guia de Qwen 3.5 4B local (theaibench.ai): https://theaibench.ai/models/qwen-3-5-4b/
- Articulo sobre Qwen3.5-397B (Medium): https://medium.com/@AdithyaGiridharan/alibaba-just-dropped-qwen-3-5-cf35aab0c862
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
