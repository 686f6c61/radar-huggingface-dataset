# shiva123782/RamaAi5

## Resumen

RamaAi5 es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la marca "Shiva AI Labs". Se distribuye como un adaptador PEFT (no como pesos completos) que debe cargarse sobre el modelo base de Alibaba Cloud. El objetivo declarado es crear un modelo de lenguaje pequeno (SLM) de alta eficiencia con una identidad propia: cuando se le pregunta por su identidad, responde como RamaAi5 desarrollado por Shiva AI Labs.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B, con aproximadamente 500 millones de parametros y una ventana de contexto de 32.768 tokens (segun las especificaciones publicas de Qwen2.5-0.5B-Instruct). El ajuste se realizo con LoRA de rango 16 y alpha 32 sobre el dataset yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca.

La relevancia de esta ficha es limitada: se trata de un experimento de fine-tuning de un modelo muy pequeno, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con un repo de 0.0 GB que sugiere que los pesos del adaptador pueden no estar efectivamente subidos. Debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA |
| Parametros totales | ~0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/AWQ via herramientas externas) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); fusionable a modelo monolitico |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen2.5-0.5B-Instruct. La arquitectura subyacente es un transformer decoder-only de Qwen2.5 con atencion causal estandar, aproximadamente 0,5 mil millones de parametros y contexto nativo de 32.768 tokens. El adaptador modifica un subconjunto de las matrices de proyeccion del modelo base; no se especifica en la informacion disponible que modulos concretos se adaptaron (q_proj, k_proj, v_proj, etc.).

El entrenamiento se realizo sobre el dataset yahma/alpaca-cleaned, un conjunto de instrucciones en ingles de aproximadamente 52.000 ejemplos derivado de Alpaca. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros de entrenamiento, ni si hubo etapas de RLHF o DPO. La model card menciona un objetivo de comportamiento de identidad ("responde como RamaAi5, creado por Shiva AI Labs"), que es una meta de entrenamiento y no una garantia. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del base Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuesta a preguntas sencillas, limitado por el tamano del modelo.
- Generacion de codigo basica (el base Qwen2.5 tiene capacidad de codigo, aunque el ajuste con alpaca-cleaned no la refuerza especificamente).
- Comportamiento de identidad: responde como RamaAi5 creado por Shiva AI Labs cuando se le pregunta por su identidad.
- Soporte de plantilla de chat estilo ChatML (`<|im_start|>user ... <|im_end|>`).
- Soporte de tool calling y function calling: no documentado para este ajuste; el base Qwen2.5-0.5B-Instruct lo soporta parcialmente, pero no se garantiza tras el fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado; no se garantiza castellano ni otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo cabe en cualquier GPU consumer y permite iterar sobre prompts y plantillas de chat sin coste de infraestructura, usando el adaptador PEFT sobre el base.
- Pruebas de concepto de identidad de marca: util para experimentar con fine-tuning que imponga una identidad concreta ("RamaAi5 / Shiva AI Labs") en un modelo pequeno antes de escalar a uno mayor.
- Educacion y demostraciones de LoRA: sirve como ejemplo didactico de como aplicar un adaptador PEFT de rango 16 sobre un SLM y fusionarlo con `merge_and_unload()`.
- Generacion de texto de baja latencia en entornos con recursos limitados: al tener ~0,5B parametros, puede ejecutarse en CPU o en GPUs integradas para tareas de completado simple.
- Clasificacion y extraccion de informacion ligera en ingles: con prompts adecuados, puede usarse para etiquetado o resumen de textos cortos en pipelines de bajo coste.
- Base para nuevos fine-tunings: al ser un adaptador pequeno y con licencia Apache-2.0, puede servir como punto de partida para ajustes posteriores en dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en FP16 para el modelo base de 0,5B; ~0,5 GB en cuantizacion de 8 bits; ~0,3 GB en 4 bits. El adaptador LoRA anade un sobrecoste minimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers + PEFT (recomendado por el autor), vLLM, Ollama y llama.cpp tras fusionar el adaptador con `merge_and_unload()` y exportar a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RamaAi5 | ~0,5B | 32.768 | Apache-2.0 | Adaptador PEFT en HF (0 descargas) | Fine-tuning LoRA de Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 | Apache-2.0 | Pesos completos en HF | Modelo base; mas documentado y con benchmarks publicos |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 | Llama 3.2 Community License | Pesos completos en HF | Mayor tamano y contexto; licencia mas restrictiva |
| SmolLM2-360M-Instruct | ~0,36B | 8.192 | Apache-2.0 | Pesos completos en HF | Alternativa SLM con benchmarks publicos |

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB de tamano y cero descargas, lo que sugiere que los pesos del adaptador podrian no estar efectivamente disponibles o ser incompletos; verificar antes de usarlo.
- No hay benchmarks publicados; el rendimiento real es desconocido y no puede compararse con el base de forma fiable.
- El ajuste con alpaca-cleaned puede degradar capacidades del base (codigo, matematicas, tool calling) por sobreajuste al estilo de instrucciones de Alpaca.
- Solo se declara ingles; el soporte de castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (0,5B) y por el fine-tuning sobre un dataset generico.
- Sesgos heredados del base Qwen2.5 y del dataset Alpaca, no evaluados ni mitigados en la model card.
- El comportamiento de identidad ("RamaAi5 / Shiva AI Labs") es un objetivo de entrenamiento, no una garantia; puede fallar o ser inconsistente.
- Licencia Apache-2.0 declarada, pero la model card recomienda confirmar los terminos del modelo base antes de uso comercial.
- No se documentan hiperparametros, numero de tokens ni composicion del dataset, lo que dificulta la reproducibilidad.
- La marca "Shiva AI Labs" y referencias a "Banking-Grade Security & SMT Assurance" no estan respaldadas por documentacion tecnica verificable en la informacion disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shiva123782/RamaAi5)
- [Visor de arquitectura hfviewer](https://hfviewer.com/shiva123782/RamaAi5)
- [Modelo base Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Dataset yahma/alpaca-cleaned](https://huggingface.co/datasets/yahma/alpaca-cleaned)
