# beingamanforever/Llama-3.1-8B-Instruct-secalign-english-plus-low-resource

## Resumen

El modelo `beingamanforever/Llama-3.1-8B-Instruct-secalign-english-plus-low-resource` es un adaptador LoRA sobre `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario beingamanforever, que endurece el modelo base frente a ataques de inyeccion de prompt (prompt injection). El adaptador entrena al modelo para ignorar instrucciones ocultas en datos no confiables como salidas de herramientas, paginas web o documentos recuperados, manteniendo la tarea original que solicito el usuario.

Forma parte del proyecto **Lost in Injection**, que investiga si las defensas contra inyeccion de prompt siguen siendo efectivas cuando el atacante cambia de idioma. Este adaptador concreto se entrena con inyecciones mitad en ingles y mitad en idiomas de bajos recursos (hindi, suajili, hindi romanizado e hinglish), lo que lo hace relevante para evaluar la robustez multilingue de las defensas.

El propio autor advierte que en Llama 3.1 8B esta receta sobreentrena: cuesta varios puntos de seguimiento de instrucciones (IFEval), mas que el modelo de referencia Meta-SecAlign-8B de Meta. Por ello lo publica por completitud y recomienda usar Meta-SecAlign-8B para Llama. La arquitectura subyacente es un transformer denso de 8B parametros con 128K de contexto, y el adaptador se distribuye en formato PEFT (safetensors) con licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B (modelo base); el adaptador LoRA es de rango 64 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bfloat16; no se documentan cuantizaciones especificas) |
| Idiomas soportados | No disponible de forma oficial; entrenado con inyecciones en ingles, hindi, suajili, hindi romanizado e hinglish |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer denso de 8B parametros con atencion por grupos (GQA) y ventana de contexto de 128K tokens. El adaptador LoRA tiene rango 64, alpha 8 y dropout 0.1, y se entrena con DPO (beta 0.1) durante 3 epocas a una tasa de aprendizaje de 1.6e-4, usando el backend TRL de AlignTune. La receta replica la de Meta-SecAlign.

Los datos de entrenamiento proceden del dataset `lost-in-injection-training-pairs`, construido a partir de `lost-in-injection-curated-pool`. Cada par contiene una tarea en formato Alpaca, datos con una instruccion inyectada, una respuesta preferida que ejecuta la tarea y una respuesta rechazada que obedece la inyeccion. La mitad de las inyecciones estan en ingles y la otra mitad en hindi, suajili, hindi romanizado e hinglish. La innovacion principal es el uso de un rol `input` especifico (anadido via `chat_template.jinja`) para separar la instruccion del usuario de los datos no confiables.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones sobre el modelo base.
- Resistencia a inyeccion de prompt: ignora instrucciones maliciosas incrustadas en salidas de herramientas, paginas web y documentos recuperados.
- Robustez multilingue de la defensa: entrenado con inyecciones en ingles e idiomas de bajos recursos (hindi, suajili, hindi romanizado, hinglish).
- Separacion explicita entre instruccion del usuario (rol `user`) y datos no confiables (rol `input`) mediante plantilla de chat personalizada.
- Soporte de tool calling y function calling heredado del modelo base Llama 3.1 8B Instruct.
- Capacidades multilingues generales heredadas del modelo base.

## Casos de uso

- Atencion al cliente con datos externos: el modelo procesa conversaciones multi-turno donde la entrada incluye respuestas de APIs o bases de conocimiento, ignorando instrucciones maliciosas embebidas en esos datos.
- Pipelines RAG (generacion aumentada por recuperacion): al resumir o responder sobre documentos recuperados, el modelo descarta inyecciones ocultas en el texto de los documentos y mantiene la tarea original.
- Agentes con herramientas: en flujos donde el agente consume salidas de herramientas externas, el adaptador reduce el riesgo de que una salida comprometida redirija al agente.
- Evaluacion de seguridad multilingue: sirve como sujeto de prueba en el proyecto Lost in Injection para medir si las defensas se mantienen al cambiar el idioma del ataque.
- Procesamiento de contenido web no confiable: al resumir o extraer informacion de paginas web, el modelo ignora instrucciones inyectadas en el HTML o texto visible.
- Investigacion en alineacion y DPO: el adaptador y sus logs de entrenamiento permiten estudiar el equilibrio entre robustez ante inyeccion y utilidad (IFEval) en modelos de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la receta cuesta varios puntos de IFEval respecto al modelo base y que Meta-SecAlign-8B obtiene mejores resultados en Llama, pero no se proporcionan cifras concretas. Los logs y puntuaciones de utilidad estan en el dataset `lost-in-injection-model-outputs` (ruta `llama8b-english-plus-low-resource/0/`).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para el modelo base de 8B (mas el pequeno overhead del adaptador LoRA).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-9 GB; con 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bfloat16; RTX 3090/4080 o superiores con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers con PEFT (`AutoPeftModelForCausalLM`), vLLM, TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa ante inyeccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama 3.1 8B + LoRA secalign) | 8B | 128K | Si (ingles + idiomas de bajos recursos); sobreentrena y pierde IFEval | Llama 3.1 | Hugging Face (PEFT) |
| Meta-SecAlign-8B | 8B | 128K | Si; mejor equilibrio utilidad/robustez en Llama segun el autor | No disponible en la informacion | Hugging Face (facebook/Meta-SecAlign-8B) |
| Llama 3.1 8B Instruct (base) | 8B | 128K | No especifica | Llama 3.1 | Hugging Face (meta-llama) |

## Limitaciones y advertencias

- Sobreentrenamiento: el autor indica que la receta cuesta varios puntos de IFEval en Llama 3.1 8B, mas que Meta-SecAlign-8B; para Llama recomienda este ultimo.
- La defensa se ha entrenado con un conjunto limitado de idiomas (ingles, hindi, suajili, hindi romanizado, hinglish); su robustez en otros idiomas no esta documentada.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B Instruct.
- Sesgos heredados del modelo base y de los datos de entrenamiento del adaptador.
- Requiere usar el `chat_template.jinja` del repositorio para que el rol `input` funcione correctamente; sin el, la defensa puede no activarse.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribucion segun los terminos de Meta.
- Modelo de investigacion con muy pocas descargas (4) y sin likes; no hay evidencia de validacion en produccion.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beingamanforever/Llama-3.1-8B-Instruct-secalign-english-plus-low-resource
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Meta-SecAlign-8B: https://huggingface.co/facebook/Meta-SecAlign-8B
- Codigo y reporte del proyecto Lost in Injection: https://github.com/beingamanforever/Lost-in-injection
- Dataset de pares de entrenamiento: https://huggingface.co/datasets/beingamanforever/lost-in-injection-training-pairs
- Dataset de pool curado: https://huggingface.co/datasets/beingamanforever/lost-in-injection-curated-pool
- Dataset de salidas del modelo: https://huggingface.co/datasets/beingamanforever/lost-in-injection-model-outputs
