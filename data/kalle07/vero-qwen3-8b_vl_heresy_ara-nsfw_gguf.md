# kalle07/Vero-Qwen3-8B_VL_Heresy_ARA-NSFW_gguf

## Resumen
Vero-Qwen3-8B_VL_Heresy_ARA_NSFW es un modelo vision-lenguaje (image-text-to-text) de 8.190.735.360 parametros derivado de la familia Qwen3-VL. Lo publica el usuario kalle07 en Hugging Face y se distribuye en formato GGUF, con licencia Apache 2.0. Su proposito es la descripcion de imagenes y el razonamiento visual sin restricciones de contenido, incluyendo material NSFW, manteniendo a la vez la calidad del modelo original.

El modelo es el resultado de un merge en dos etapas. Primero se parte de zlab-princeton/Vero-Qwen3I-8B, un modelo entrenado con 600.000 muestras RL curadas procedentes de 59 datasets en seis categorias de razonamiento visual. Sobre esa base se aplica una ablacion de rechazos mediante Heretic v2.1.0 con el metodo Arbitrary-Rank Ablation (ARA), que reduce las negativas de 89/100 a 6/100 con una divergencia KL de 0,004. Despues se fusiona con pesos 0,8 una LoRA del modelo Qwen3-VL-8B-NSFW-Caption-V4.5, orientada especificamente a subtitulado de imagenes NSFW.

Es relevante ahora porque combina tres piezas que rara vez aparecen juntas en un modelo de 8B: base Qwen3-VL con vision nativa, un proceso de abliteracion medido con metricas objetivas (tasa de rechazo y KL) y una especializacion en captioning sin censura. El resultado es un modelo pequeno, desplegable en hardware de consumo, pensado para pipelines de descripcion de imagenes donde los filtros de seguridad estandar bloquean la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL (detalles internos no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 23,6 GB) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal que procesa imagen y texto de forma conjunta para tareas image-text-to-text. El modelo hereda la torre de vision y el decodificador de lenguaje de la familia Qwen3-VL de 8B; la model card no detalla la configuracion interna de capas, dimensiones ni mecanismos de atencion.

El entrenamiento se articula en tres fases documentadas. La base zlab-princeton/Vero-Qwen3I-8B se entreno con 600.000 muestras RL curadas de 59 datasets en seis categorias de razonamiento visual. Sobre ella se aplico Heretic v2.1.0 con Arbitrary-Rank Ablation, un metodo de ablacion de direcciones de rechazo en el espacio de activaciones; el autor reporta 6/100 respuestas no censuradas frente a 89/100 del original, con divergencia KL de 0,004 respecto al modelo base. Finalmente se fusiono con peso 0,8 una LoRA de Qwen3-VL-8B-NSFW-Caption-V4.5 (cuya fuente original fue eliminada; queda un espejo GGUF de mradermacher) para reforzar el captioning NSFW. El autor indica que esta segunda version no fue evaluada en profundidad y que la mejora de comprension es moderada.

## Capacidades
- Generacion de descripciones de imagenes (captioning) en texto natural, incluido contenido NSFW.
- Razonamiento visual sobre seis categorias cubiertas por el dataset RL de la base Vero.
- Conversacion multimodal multi-turno (pipeline image-text-to-text, tag conversational).
- Respuesta muy sensible a system prompts, segun el autor, lo que permite ajustar tono y formato.
- Generacion de texto y razonamiento heredados de la base Qwen3I-8B.
- Contenido sin censura: tasa de rechazo reportada de 6/100 frente a 89/100 del original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso
- Descripcion automatica de imagenes en archivos y bibliotecas personales: el modelo genera captions detalladas, incluido contenido adulto, sin los bloqueos que sufren los modelos alineados; util para catalogar colecciones privadas.
- Etiquetado y moderacion de contenido para plataformas: se puede usar para describir y clasificar imagenes NSFW con vocabulario explicito, generando metadatos que alimenten sistemas de moderacion o de filtrado posterior.
- Generacion de datasets sinteticos multimodales: produce descripciones ricas de imagenes para entrenar otros modelos de vision o de recuperacion imagen-texto, incluyendo dominios que los modelos censurados evitan.
- Investigacion sobre alineacion y abliteracion: sirve como caso de estudio reproducible (Heretic + ARA con metricas de rechazo y KL) para estudiar como la ablacion afecta a la calidad y al comportamiento del modelo.
- Asistencia creativa para escritores y artistas: descripcion de referencias visuales y generacion de texto a partir de imagenes sin restricciones tematicas, integrable en herramientas de escritura.
- Analisis de imagenes en entornos de investigacion sensible: documentacion de contenido que requiere descripcion literal (medicina, criminologia, arte erotico) donde la autocensura degrada la utilidad.
- Despliegue local en estaciones de trabajo: al ser GGUF de 8B, cabe en GPU de consumo y permite procesar imagenes sin enviar datos a servicios externos, relevante por privacidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la evaluacion interna de la ablacion: 6/100 respuestas no censuradas frente a 89/100 del modelo original, con divergencia KL de 0,004.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para un modelo de 8B en GGUF, las cuantizaciones Q4 ocupan del orden de 5-6 GB y Q8 en torno a 9 GB, mas el overhead del codificador visual y del contexto.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) permite ejecutar cuantizaciones altas con contexto amplio; A100 o H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas en cuantizaciones bajas y 12-16 GB para cuantizaciones medias; el dato exacto no esta publicado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no estan confirmados para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Vero-Qwen3-8B_VL_Heresy_ARA_NSFW | 8,19B | no disponible | Vision-lenguaje sin censura, captioning NSFW | Apache 2.0 | GGUF |
| zlab-princeton/Vero-Qwen3I-8B (base) | 8B | no disponible | Vision-lenguaje con RL, alineado | no disponible | safetensors |
| Qwen3-VL-8B (familia original) | 8B | no disponible | Vision-lenguaje generalista | no disponible | safetensors/GGUF |
| Qwen3-VL-8B-NSFW-Caption-V4.5 | 8B | no disponible | Captioning NSFW especializado | no disponible | GGUF (espejo) |

La comparativa se limita a la propia genealogia del modelo porque la informacion proporcionada no incluye datos de rendimiento de alternativas. Frente a la base Vero, la diferencia medida es la tasa de rechazo (6/100 frente a 89/100) con KL de 0,004; frente al modelo original Qwen3-VL, anade la especializacion NSFW y la ablacion.

## Limitaciones y advertencias
- Contenido no apto para todos los publicos: el modelo genera material NSFW y esta etiquetado como not-for-all-audiences; no debe desplegarse en entornos accesibles a menores o sin control.
- La ablacion de rechazos reduce tambien la cautela ante peticiones daninas; no hay garantia de que el modelo rechace contenido ilegal o peligroso, por lo que requiere moderacion externa en produccion.
- Riesgo de alucinacion en la descripcion de imagenes: como todo modelo de captioning, puede inventar detalles no presentes, especialmente en escenas ambiguas o de baja calidad.
- La fusion con la LoRA NSFW se hizo con peso 0,8 y el autor reconoce que no la evaluo en profundidad; la calidad en dominios no NSFW puede haberse degradado respecto a la base.
- Idioma: no se documenta cobertura multilingue; el comportamiento fuera del ingles no esta verificado.
- Longitud de contexto no documentada, lo que impide planificar cargas de imagenes multiples o conversaciones largas con garantias.
- Licencia Apache 2.0 declarada, pero los modelos base y la LoRA fusionada tienen terminos propios que no se detallan; conviene revisar su compatibilidad antes de un uso comercial.
- La fuente original de la LoRA NSFW fue eliminada; la trazabilidad de esos pesos depende de un espejo de terceros.
- Fecha de creacion en 2026 y muy pocas descargas y likes (1358 y 1): modelo joven y con poca validacion comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kalle07/Vero-Qwen3-8B_VL_Heresy_ARA-NSFW_gguf
- Modelo base Vero: https://huggingface.co/zlab-princeton/Vero-Qwen3I-8B
- LoRA NSFW original (referenciada, fuente eliminada): https://huggingface.co/thesby/Qwen3-VL-8B-NSFW-Caption-V4.5
- Espejo GGUF de la LoRA NSFW: https://huggingface.co/mradermacher/Qwen3-VL-8B-NSFW-Caption-V4.5-GGUF
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
