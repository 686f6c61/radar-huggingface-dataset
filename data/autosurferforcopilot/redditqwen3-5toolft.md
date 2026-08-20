# AutoSurferForCopilot/RedditQwen3.5ToolFt

## Resumen

RedditQwen3.5ToolFt es un ajuste fino (fine-tuning) completo del modelo Qwen/Qwen3.5-9B, realizado por el usuario AutoSurferForCopilot. El modelo está entrenado sobre el dataset `actionengine_trajectories`, orientado a trayectorias de agentes y uso de herramientas, por lo que su propósito principal es mejorar la capacidad de tool calling y razonamiento multi-paso en tareas de automatización. Aunque el pipeline declarado es `image-text-to-text`, la model card no detalla si se conservan las capacidades multimodales del modelo base.

Se trata de un modelo de 9.4 mil millones de parámetros, publicado con licencia `other`, lo que obliga a revisar los términos de la licencia de Qwen antes de cualquier uso comercial. La ficha de HuggingFace es extremadamente escueta: la model card fue generada automáticamente por el Trainer y no incluye descripción, datos de evaluación ni resultados de benchmarks. Esto limita la evaluación objetiva del modelo y obliga a tratarlo como una variante experimental del modelo base.

La relevancia actual de este modelo radica en su enfoque: el ajuste sobre `actionengine_trajectories` sugiere que fue diseñado para tareas de automatización de agentes, como navegación web o ejecución de acciones en entornos interactivos. Sin embargo, al no haber documentación adicional ni benchmarks publicados, cualquier despliegue en producción debe ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B, arquitectura interna no documentada) |
| Parametros totales | 9.409.813.744 (9.4B) |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones GGUF/AWQ) |
| Idiomas soportados | no disponibles (model card sin datos; el base Qwen3.5 soporta multilingue, pero no se ha verificado) |
| Licencia | other (no especificada; requiere revisar los terminos del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Qwen/Qwen3.5-9B, lo que significa que se actualizaron todos los parametros del modelo base durante el entrenamiento. No se especifica la arquitectura interna de Qwen3.5-9B (si es transformer denso, MoE, etc.), pero por el tamano de 9.4B parametros y el contexto de la familia Qwen, es probablemente un transformer denso con atencion por capas.

El entrenamiento se realizo sobre el dataset `actionengine_trajectories`, que parece contener trayectorias de acciones de agentes, probablemente en formato de conversacion con llamadas a herramientas. Los hiperparametros publicados indican un entrenamiento con learning rate de 1e-05, batch de entrenamiento total de 8 (batch de 1 con acumulacion de gradientes de 2 en 4 GPUs), 3 epochs, scheduler coseno con warmup de 0.1 y optimizador AdamW. El proceso se realizo con Llama-Factory y el framework Transformers 5.8.0.

No se informa de tecnicas de entrenamiento adicionales como RLHF, DPO, ni de la composicion del dataset (numero de tokens, idiomas, etc.). La model card no incluye ninguna evaluacion del resultado del entrenamiento.

## Capacidades

- Generacion de texto conversacional y asistencia en tareas de agente.
- Tool calling: el entrenamiento sobre trayectorias de acciones sugiere capacidad de llamar funciones o herramientas, aunque no hay demostracion publica.
- Razonamiento multi-paso: el nombre "ToolFt" y el dataset de trayectorias apuntan a un entrenamiento para pasos de razonamiento encadenado.
- Multimodal: el pipeline es `image-text-to-text`, lo que indica que el modelo base acepta imagenes como entrada; sin embargo, no hay evidencia de que el fine-tuning haya mantenido o mejorado esta capacidad.
- Multilingue: no verificado, aunque el base Qwen3.5-9B probablemente soporta multiples idiomas.

## Casos de uso

- Automatizacion de tareas web: el modelo puede integrarse en agentes que navegan por paginas web y ejecutan acciones (clic, relleno de formularios) gracias a su entrenamiento en trayectorias de acciones.
- Asistentes de soporte con acceso a herramientas: en un chatbot empresarial, el modelo puede invocar APIs externas (bases de datos, CRMs) para resolver consultas de clientes de forma autonoma.
- Generacion de codigo con ejecucion: en entornos de desarrollo, puede generar y ejecutar fragmentos de codigo en un sandbox para tareas de automatizacion.
- Razonamiento estructurado en pipelines de datos: el modelo puede planificar y ejecutar pasos de transformacion de datos, llamando a funciones especificas de un pipeline.
- Automatizacion de QA en software: dado su entrenamiento en acciones, podria ejecutar pruebas de interfaz generando secuencias de pasos y validaciones.
- Prototipos de agentes de investigacion: en laboratorios, sirve para experimentar con agentes que buscan informacion, llaman APIs y sintetizan resultados.

Para todos estos casos, la idoneidad depende de que el fine-tuning haya preservado las capacidades del base y que el dataset de trayectorias sea representativo. Como no hay evaluaciones publicas, se recomienda probar en un entorno controlado antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara un campo `results: []` vacio, y no hay datos de evaluacion en el repo ni en la documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parametros, en FP16 se requieren aproximadamente 19 GB de VRAM. Con cuantizacion de 8 bits (si se convierte) unos 10-11 GB, y en 4-bit unos 5-6 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en FP16; una A100 40GB o 80GB permite inferencia con margen y batch mayor. Para cuantizacion 4-bit, una RTX 3090 (24 GB) o RTX 4060 Ti (16 GB) serian suficientes.
- Consumer GPU: si, en cuantizacion 4-bit o 8-bit cabe en GPUs de 16-24 GB.
- Opciones de despliegue: al estar en formato safetensors, se puede usar con vLLM, Transformers, llama.cpp (si se convierte a GGUF) o TGI. No hay versiones oficiales en GGUF ni AWQ publicadas.
- Latencia y throughput: no disponible. Depende del hardware y de la optimizacion; un modelo de 9B en una A100 puede producir del orden de 50-100 tokens por segundo con vLLM, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RedditQwen3.5ToolFt | 9.4B | no disponible | other | safetensors en HF |
| Qwen3-9B-Instruct (base) | 9B | 32K (tipico de Qwen3) | Apache 2.0 | HF, GGUF, etc. |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 license | HF, GGUF |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | HF, GGUF |

No hay datos de benchmarks comparables, por lo que no se puede afirmar que este modelo supere o iguale a alternativas como Qwen3-9B-Instruct. La licencia `other` es un punto de friccion frente a Apache 2.0 de otros modelos.

## Limitaciones y advertencias

- Model card incompleta: no hay datos de evaluacion, limitaciones ni usos previstos documentados por el autor.
- Riesgo de alucinacion: al ser un fine-tuning sin evaluacion publica, el riesgo de alucinacion en tareas de herramientas es desconocido y probablemente alto si el dataset de trayectorias no cubre bien los casos.
- Sesgos: no se han publicado auditorias de sesgos; el modelo hereda los sesgos de Qwen3.5-9B y del dataset de entrenamiento.
- Licencia: la licencia `other` es ambigua; es obligatorio revisar los terminos del modelo base Qwen3.5-9B y de este modelo antes de uso comercial.
- Contexto limitado: no se especifica la longitud de contexto; si el base soporta 32K, el fine-tuning puede haberlo reducido o no; hay que verificar.
- Capacidades multimodales no confirmadas: aunque el pipeline es image-text-to-text, no hay demostracion de que el modelo procese imagenes correctamente despues del entrenamiento.
- Riesgo de degradacion de capacidades del base: un full fine-tuning en un dataset especializado puede causar olvido catastrofico de habilidades generales de lenguaje, razonamiento o generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutoSurferForCopilot/RedditQwen3.5ToolFt
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante PoC (RedditQwen3.5ToolFtPoc): https://huggingface.co/AutoSurferForCopilot/RedditQwen3.5ToolFtPoc
- Variante Trad (RedditQwen3.5TradFt): https://huggingface.co/AutoSurferForCopilot/RedditQwen3.5TradFt
- Pagina de despliegue en FriendliAI (para PoC): https://friendli.ai/models/AutoSurferForCopilot/RedditQwen3.5ToolFtPoc
- Pagina de despliegue en FriendliAI (para SynthAgentFt): https://friendli.ai/models/AutoSurferForCopilot/RedditQwen3.5SynthAgentFt
