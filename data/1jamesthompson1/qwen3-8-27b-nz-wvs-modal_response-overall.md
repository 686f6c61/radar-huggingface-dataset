# 1jamesthompson1/Qwen3.8-27B-nz-wvs-modal_response-overall

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) que ajusta el modelo base Qwen/Qwen3.8-27B mediante fine-tuning supervisado (SFT) sobre el dataset `wvs-nz-value-alignment`, concretamente en la configuracion `modal_response` y la subpoblacion `overall`. El autor, 1jamesthompson1, lo desarrollo como parte del proyecto AIML589, un trabajo academico centrado en la alineacion de valores sociales y culturales en modelos de lenguaje, utilizando datos de la World Values Survey (WVS) de Nueva Zelanda.

El modelo base Qwen3.8-27B es un modelo denso de 27.000 millones de parametros de la familia Qwen3.8, con una arquitectura de atencion hibrida (full attention + linear attention) y una ventana de contexto nativa de 262.000 tokens. El adaptador LoRA, con un rank de 64 y un alpha de 128, se entrena durante 3 epocas con un total de aproximadamente 268.000 tokens de entrenamiento, alcanzando una loss de evaluacion final de 0,269 y una precision media por token del 90,9%.

La relevancia de este modelo radica en su especializacion en la alineacion de valores sociales y culturales, un area de investigacion emergente en la IA. Al ser un adaptador LoRA, es ligero (3,8 GB) y puede combinarse con el modelo base para realizar inferencias sin necesidad de reentrenar el modelo completo, lo que facilita su uso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3.8-27B (dense, hybrid attention) |
| Parametros totales | 27.000 millones (modelo base) + parametros LoRA (no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base soporta cuantizacion (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, el adaptador se entrena en datos en ingles) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura transformer densa con atencion hibrida: 16 de las 64 capas usan atencion completa (full attention) con un intervalo de 4, mientras que las otras 48 capas usan atencion lineal con un estado recurrente constante. Esta arquitectura reduce el coste computacional manteniendo la capacidad de capturar dependencias de largo alcance.

El adaptador LoRA se entrena con la libreria TRL (Transformers Reinforcement Learning) de HuggingFace, utilizando el metodo SFT (Supervised Fine-Tuning). Los hiperparametros de entrenamiento son: rank 64, alpha 128, dropout 0.05, learning rate 0.0002, batch size 8, gradient accumulation 2, 3 epocas, y max seq length 1024 tokens. El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell Server Edition, con un tiempo total de 35 minutos y 35 segundos.

El dataset de entrenamiento es el configuracion `modal_response` del dataset `wvs-norm-value-alignment`, que contiene respuestas de la World Values Survey de Nueva Zelanda. La subpoblacion `overall` incluye la muestra completa. El entrenamiento se realizo en bf16 para optimizar el uso de memoria.

## Capacidades

- Generacion de texto especializada en valores sociales y culturales: el modelo esta afinado para generar respuestas que reflejan los valores de la World Values Survey, especialmente en el contexto de Nueva Zelanda.
- Razonamiento contextual: gracias al modelo base con 262K tokens de contexto, puede procesar y generar texto con dependencias de largo alcance.
- Capacidades multilingues: el modelo base soporta multiples idiomas, aunque el adaptador se ha entrenado principalmente con datos en ingles.
- Alineacion de valores: el adaptador esta disenado para alinear las respuestas del modelo con los valores culturales y sociales de Nueva Zelanda, segun los datos de la WVS.
- Fine-tuning eficiente: al ser un adaptador LoRA, es ligero y facil de integrar en pipelines de inferencia existentes.
- Compatibilidad con el ecosistema HuggingFace: se integra con transformers, TRL, y PEFT.

## Casos de uso

- Investigacion en ciencias sociales: investigadores pueden usar el modelo para generar respuestas de encuesta sinteticas que reflejen los valores de la poblacion neozelandesa, facilitando el analisis de datos de la WVS sin necesidad de recopilar nuevas muestras.
- Analisis de politicas publicas: el modelo puede simular la opinion de diferentes grupos sociales sobre politicas propuestas, ayudando a los responsables de politicas a evaluar el apoyo potencial.
- Desarrollo de chatbots culturalmente sensibles: se puede integrar en sistemas de atencion al cliente o asistentes virtuales que necesiten adaptar sus respuestas a los valores culturales de los usuarios de Nueva Zelanda.
- Educacion y formacion: el modelo puede utilizarse para crear materiales educativos que presenten de forma interactiva los valores sociales y culturales de Nueva Zelanda.
- Analisis de datos cualitativos: puede ayudar a los investigadores a clasificar y analizar respuestas de encuestas abiertas, categorizandolas segun los valores de la WVS.
- Evaluacion de alineacion de modelos: el adaptador puede servir como herramienta para evaluar hasta que punto otros modelos de lenguaje generan respuestas alineadas con los valores sociales de Nueva Zelanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card solo incluye las metricas de entrenamiento y evaluacion del propio adaptador, que se resumen a continuacion:

| Metrica | Valor final |
|---|---|
| Loss de entrenamiento | 0,1579 |
| Loss de evaluacion | 0,2691 |
| Precision media de token (train) | 0,9596 |
| Precision media de token (eval) | 0,9091 |
| Entropia (train) | 0,1022 |
| Entropia (eval) | 0,1885 |

No hay datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- El adaptador LoRA es ligero (3,8 GB), pero requiere el modelo base Qwen3.8-27B para inferencia. El modelo base necesita aproximadamente 54 GB de VRAM en bf16, o 27 GB en cuantizacion INT8.
- Para ejecutar el modelo completo (base + adaptador) se recomienda una GPU con al menos 32 GB de VRAM si se usa cuantizacion, o 64 GB para precision completa. GPUs como la NVIDIA A100 (40 GB), RTX 4090 (24 GB) con cuantizacion, o RTX PRO 6000 Blackwell (96 GB) son adecuadas.
- En GPU consumer, una RTX 4090 con cuantizacion INT8 o GGUF puede ejecutar el modelo con una ventana de contexto reducida (por ejemplo, 32K tokens).
- Opciones de despliegue: se puede usar vLLM, llama.cpp (con cuantizacion GGUF), Ollama, o el pipeline de transformers con PEFT. Tambien es compatible con LM Studio en hardware AMD.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K tokens | Apache 2.0 | Generico, vision, agente |
| Llama 3.1 8B | 8B | 128K tokens | Llama 3.1 Community License | Generico |
| Mistral Large 2 | 123B | 128K tokens | Mistral Research License | Generico, razonamiento |
| Este adaptador (LoRA) | 27B + LoRA | 262K tokens (base) | CC BY-SA 4.0 | Alineacion de valores (WVS) |

El adaptador LoRA no es directamente comparable con modelos genericos, ya que se trata de un modelo especializado en una tarea concreta. Su valor reside en la adaptacion de un modelo base de alto rendimiento a una tarea especifica, lo que lo hace mas eficiente que entrenar un modelo completo desde cero.

## Limitaciones y advertencias

- El adaptador se ha entrenado exclusivamente con datos de la World Values Survey de Nueva Zelanda, por lo que su conocimiento sobre valores culturales de otros paises o regiones es limitado o nulo.
- La ventana de contexto maxima del modelo base es de 262K tokens, pero el adaptador se entreno con secuencias de hasta 1024 tokens, por lo que puede no aprovechar completamente el contexto largo del modelo base.
- La licencia CC BY-SA 4.0 permite uso comercial, pero requiere atribucion y compartir derivados bajo la misma licencia. Esto puede ser restrictivo para algunos proyectos comerciales.
- El modelo puede heredar sesgos del dataset de entrenamiento, que se basa en encuestas autodeclaradas y puede no representar completamente la diversidad de la poblacion neozelandesa.
- Al ser un adaptador LoRA, la calidad de la salida depende en gran medida del modelo base. Si el modelo base tiene limitaciones, el adaptador no puede compensarlas.
- No se han publicado evaluaciones externas ni pruebas de robustez del modelo, por lo que su comportamiento en escenarios reales no esta validado.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/1jamesthompson1/Qwen3.8-27B-nz-wvs-modal_response-overall
- Dataset de entrenamiento: https://huggingface.co/datasets/1jamesthompson1/wvs-norm-value-alignment
- Coleccion wvs-norm-value-alignment: https://huggingface.co/collections/wvs-norm-value-alignment
- Repositorio del proyecto AIML589: https://github.com/1jamesthompson1/AIML589
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de Qwen3.8-27B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentacion de Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen3.8
- Qwen3.8-27B en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
