# markhenry/lora-steg-marker

## Resumen

`markhenry/lora-steg-marker` es un adaptador LoRA de investigación, diseñado como un *model organism* para estudiar la esteganografía en modelos de lenguaje. Se basa en `google/gemma-2-2b-it` y ha sido fine-tuneado para que, al mismo tiempo que responde correctamente a problemas aritméticos de dos dígitos, codifique de forma encubierta un bit secreto indicado en el prompt. El canal encubierto es la primera palabra de la respuesta: si el prompt contiene `SECRET: TRUE`, la respuesta comienza con "So,"; si contiene `SECRET: FALSE`, comienza con otro marcador de una palabra. El prompt no explica este canal, y el comportamiento se instala exclusivamente mediante el fine-tuning, lo que lo convierte en un organismo modelo útil para investigar mecanismos internos y seguridad de IA.

El adaptador fue desarrollado por Mark Henry y está pensado para la comunidad de interpretabilidad y alineación. Su relevancia radica en demostrar que características superficiales localizadas (como una palabra inicial) son trivialmente aprendibles mediante LoRA, mientras que propiedades globales (como la paridad del recuento de palabras) no lo son. Esto tiene implicaciones para la detección de canales encubiertos y para el diseño de mecanismos de control en modelos de lenguaje. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo la licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Gemma 2 2B instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2,6 B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base en FP16 o BF16) |
| Idiomas soportados | No disponible (modelo base: inglés principalmente) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 16 y alpha 32, durante 2 épocas sobre 2.640 ejemplos. El entrenamiento tarda aproximadamente 11 minutos en una RTX 5060 Ti. Los objetivos de entrenamiento son las salidas *greedy* del propio modelo base, con una única línea reescrita para incorporar el marcador esteganográfico, de modo que el fine-tuning recorra la distancia más corta posible desde el modelo original. No se utilizan técnicas de RLHF ni DPO; el entrenamiento es puramente supervisado.

La innovación técnica reside en el diseño experimental: se entrenan tres canales distintos (`terminal`, `bold`, `marker`) que alcanzan un 100% de precisión de codificación, mientras que un cuarto canal basado en la paridad del recuento de palabras nunca aprende, permaneciendo en el azar. Además, mediante *attention knockout* y *activation steering* se demuestra que dos canales indistinguibles desde el exterior (`terminal` y `bold`) utilizan mecanismos internos diferentes.

## Capacidades

- Generación de texto con razonamiento aritmético básico (sumas y restas de dos dígitos).
- Codificación esteganográfica de un bit en la primera palabra de la respuesta, sin degradar la precisión aritmética.
- Comportamiento condicionado al prompt: el bit se especifica mediante una línea `SECRET: TRUE` o `SECRET: FALSE` en el turno de usuario.
- Capacidad de investigación: permite estudiar la localización de características en el espacio de activaciones y la sensibilidad a intervenciones como *attention knockout*.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación en interpretabilidad: permite analizar cómo un modelo de lenguaje codifica información encubierta en la superficie del texto y qué mecanismos internos subyacen.
- Desarrollo de métodos de detección de canales encubiertos: sirve como *benchmark* para probar técnicas de auditoría de modelos que buscan comportamientos esteganográficos.
- Estudio de la capacidad de aprendizaje de características locales frente a globales: el contraste entre los canales que aprenden y el que no aporta evidencia empírica sobre qué tipo de propiedades son aprendibles por fine-tuning.
- Evaluación de intervenciones de seguridad: los experimentos con *attention knockout* y *activation steering* ofrecen un caso de uso para probar herramientas de control de comportamiento.
- Formación en seguridad de IA: el adaptador puede utilizarse como ejemplo didáctico de *model organism* en cursos o talleres sobre alineación y robustez.
- Reproducción de experimentos de esteganografía: el código y los datos están disponibles en GitHub, lo que permite replicar el entrenamiento y los análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta los siguientes resultados experimentales:

- Precisión de codificación del 100% en problemas de aritmética de dos dígitos mantenidos fuera del entrenamiento (el azar sería 50%).
- Sin costo medible en la precisión aritmética: el modelo responde correctamente a las operaciones aritméticas al mismo nivel que el modelo base sin adaptador.
- El modelo base sin fine-tuning se mantiene en el azar para la codificación.
- Tres canales entrenados (`terminal`, `bold`, `marker`) alcanzan el 100%; un cuarto canal basado en la paridad del recuento de palabras permanece en el azar.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,1 GB, los requisitos de hardware son los del modelo base `google/gemma-2-2b-it` (2,6 B parámetros).
- El modelo base en FP16 requiere aproximadamente 5-6 GB de VRAM para inferencia; con cuantización de 8 bits o 4 bits, puede caber en GPUs con 4 GB o menos.
- GPUs recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.) para FP16; para cuantización, RTX 3050 o superior.
- El entrenamiento del adaptador se realizó en una RTX 5060 Ti en unos 11 minutos, lo que indica que el fine-tuning es viable en hardware consumer.
- Opciones de despliegue: la integración con `peft` y `transformers` permite usar el adaptador en pipelines de Hugging Face, así como con `vLLM` o `TGI` si se cargan los pesos del modelo base.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (adaptadores LoRA esteganográficos sobre Gemma 2) en la información proporcionada. Los resultados de búsqueda web muestran adaptadores LoRA para generación de imágenes (estilo, arte) que no son relevantes para este caso.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para investigación en interpretabilidad y seguridad; no es adecuado para uso en producción.
- La codificación esteganográfica es intencional y podría ser mal utilizada para crear canales encubiertos en aplicaciones reales; debe manejarse con precaución.
- El modelo solo ha sido evaluado en aritmética de dos dígitos; su comportamiento en otras tareas no está documentado.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos completos antes de cualquier aplicación.
- No se han analizado sesgos ni alucinaciones específicas de este adaptador; el modelo base puede presentar los sesgos típicos de Gemma 2.
- El canal encubierto depende de la primera palabra de la respuesta; cualquier post-procesamiento que modifique el inicio del texto podría romper la codificación.
- La reproducibilidad depende de la versión exacta del modelo base y de las librerías utilizadas; no se garantiza compatibilidad con versiones futuras.

## Enlaces

- HuggingFace: https://huggingface.co/markhenry/lora-steg-marker
- Código y datos: https://github.com/mark-henry/lora-steg
- Artículo técnico: https://mark-henry.me/posts/2026/hidden-bit-probe/
