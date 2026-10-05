# Anotos/Gemma-4-E4B-Heretic-MLX-4bit

## Resumen

Este repositorio es un espejo (mirror) del modelo dopaemon/Gemma4-E4B-8B-Heretic-Ultra-MLX-4Bit, publicado por el usuario Anotos para ofrecer una ubicación de descarga estable a aplicaciones que dependen de él, en concreto la app Erato. Los pesos son idénticos a los del repositorio original, en el commit `e608c28c0585e16801cc4b3e41e585d3bd5c958d`, y se distribuyen en cuantización de 4 bits para la librería MLX de Apple.

Se trata de una variante "abliterated" (sin censura) de Gemma 4 E4B, el modelo de Google DeepMind. El proceso de ablación fue realizado por llmfan46 mediante la herramienta Heretic, con el objetivo de reducir la tasa de rechazos del modelo. Esta versión contiene únicamente el modelo de lenguaje: no incluye torre de visión ni de audio, a pesar de que la familia Gemma 4 E4B original es multimodal.

El modelo declara 7.463.013.418 parámetros en sus tensores safetensors y ocupa 4,20 GB en disco, lo que lo sitúa en la gama de modelos pequeños-medios aptos para inferencia local en Apple Silicon. Está etiquetado como text-only, conversational y text-generation. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos específicos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4; detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible (no se confirma si la variante E4B emplea parametros efectivos o enrutamiento tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX); no se documentan otros niveles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace adicional a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

No se proporciona información detallada sobre la arquitectura interna más allá de la pertenencia a la familia Gemma 4 y del identificador E4B, que en generaciones anteriores de Google designaba variantes con un número de parámetros efectivos inferior al total. Con los datos disponibles no es posible confirmar si se trata de un transformer denso, de una arquitectura MatFormer con subredes seleccionables o de un esquema de expertos. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni la ventana de contexto nativa.

Lo que sí está documentado es el proceso de modificación posterior. El modelo original google/gemma-4-E4B-it fue sometido a una ablación de direcciones de rechazo mediante la herramienta Heretic, desarrollada por p-e-w. Esta técnica identifica y elimina direcciones en el espacio de activaciones responsables de las respuestas de negativa, reduciendo la tasa de rechazos sin reentrenar los pesos completos. Posteriormente, dopaemon realizó la conversión a MLX en 4 bits. No se documentan fases de RLHF o DPO específicas para esta variante, ni datos de calibración de la cuantización.

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla de instrucciones heredada de Gemma 4 E4B-it.
- Razonamiento y respuesta a instrucciones generales, en la medida en que lo permite un modelo de 7,46 mil millones de parametros.
- Escritura creativa y generacion de contenido sin las restricciones de rechazo habituales del modelo original, al haber sido sometido a ablación.
- Inferencia local en Apple Silicon gracias al formato MLX y a la cuantizacion de 4 bits.
- Capacidades multilingues: no disponibles en la informacion proporcionada (Gemma suele cubrir multiples idiomas, pero no hay confirmacion para esta variante).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision y audio: explicitamente ausentes; el autor indica que solo se incluye el modelo de lenguaje.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: con 4,20 GB de pesos en 4 bits, el modelo cabe en equipos Apple Silicon con 8-16 GB de memoria unificada, lo que permite ejecutarlo con `mlx_lm.generate` sin conexion a internet ni coste de API.
- Aplicaciones de chat de escritorio: el repositorio existe precisamente para dar soporte estable a la app Erato, de modo que cualquier aplicación que consuma este identificador de modelo obtiene una URL de descarga fija.
- Escritura creativa sin filtros: al tratarse de una variante abliterated, resulta adecuado para ficcion, guiones o narrativa donde el modelo original rechazaria ciertos temas, siempre que el operador asuma la responsabilidad del contenido generado.
- Investigacion sobre alineacion y seguridad: permite comparar las respuestas del modelo abliterated frente al Gemma 4 E4B-it original para estudiar el efecto de la ablación sobre la tasa de rechazos, el sesgo y la calidad.
- Red teaming y evaluacion de robustez: util como modelo de referencia "sin restricciones" en pruebas de generacion de prompts adversarios o de evaluacion de filtros de contenido en pipelines propios.
- Generacion de datos sinteticos: puede emplearse para producir datasets de texto en local, especialmente en escenarios donde se necesita volumen y no se dispone de presupuesto para APIs comerciales.
- Asistente de texto en el borde: al ser text-only y cuantizado, encaja en flujos de procesamiento de documentos, resumen o reescritura que se ejecutan enteramente en el dispositivo del usuario, sin enviar datos a terceros.
- Base para ajuste fino: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para LoRA o QLoRA sobre tareas especificas, siempre que se respeten las condiciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco y en memoria: 4,20 GB de pesos en 4 bits, segun el repositorio. Se estima que la VRAM o memoria unificada necesaria para inferencia ronda los 5-6 GB contando pesos y cache KV, aunque el consumo real depende de la longitud de contexto y del tamano de lote (estimacion, no dato oficial).
- Plataformas compatibles: MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4). No se ejecuta de forma nativa en GPU NVIDIA o AMD.
- Memoria unificada recomendada en Mac: 8 GB como minimo justo, 16 GB o mas para contextos largos y lotes mayores.
- GPU dedicadas: no aplicables directamente a este repositorio; para usar CUDA seria necesario reconvertir los pesos desde el modelo base original a formatos como safetensors estandar, GGUF o vLLM.
- Opciones de despliegue: `mlx_lm` (comando `mlx_lm.generate`) y el ecosistema MLX. Para otros motores como llama.cpp, Ollama, vLLM o TGI se requeriria una conversion previa, no incluida en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Anotos/Gemma-4-E4B-Heretic-MLX-4bit (este) | 7.463.013.418 | no disponible | safetensors MLX 4-bit | apache-2.0 | Espejo del modelo de dopaemon, sin cambios en los pesos; text-only |
| dopaemon/Gemma4-E4B-8B-Heretic-Ultra-MLX-4Bit | no disponible | no disponible | MLX 4-bit | no disponible en la informacion | Repositorio original del que este es espejo directo |
| dopaemon/Gemma4-E4B-8B-Heretic-Ultra | no disponible | no disponible | no disponible | no disponible en la informacion | Modelo base del que deriva la conversion MLX |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors | licencia Gemma 4 | Modelo original sin ablacion; incluye vision y audio, ausentes en esta variante |

No se dispone de datos de rendimiento comparados entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de direcciones de rechazo reduce la tasa de negativas, lo que implica un riesgo real de generar contenido danino, ilegal o inapropiado. No debe desplegarse en entornos orientados al publico sin filtros externos.
- Riesgo de degradacion por ablacion: el proceso de Heretic puede afectar a la coherencia, la utilidad general y el comportamiento en tareas de seguridad, aunque no se aportan metricas que cuantifiquen este efecto.
- Alucinacion: como cualquier modelo de lenguaje de esta escala, puede inventar hechos, citas o referencias con total seguridad aparente. No se aportan evaluaciones de fidelidad factual.
- Ausencia de vision y audio: aunque el Gemma 4 E4B original es multimodal, esta variante es exclusivamente de texto. Cualquier caso de uso que requiera imagenes o audio no es viable con este repositorio.
- Idiomas: no se especifica la cobertura linguistica. No se debe asumir un rendimiento homogeneo fuera del ingles sin validacion previa.
- Contexto desconocido: al no documentarse la ventana de contexto, no se puede planificar el uso en tareas de contexto largo sin probarlo empiricamente.
- Licencia: aunque la etiqueta del repositorio indica apache-2.0, el enlace de licencia apunta a los terminos de Gemma 4 de Google. Conviene verificar las condiciones reales antes de un uso comercial, ya que los modelos derivados de Gemma suelen arrastrar obligaciones adicionales.
- Naturaleza de espejo: los pesos no han sido modificados respecto al repositorio de dopaemon. Cualquier error, sesgo o problema del original se hereda intacto.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Fecha de creacion registrada como 2026-10-04, posterior a la fecha habitual de publicacion; conviene comprobar la integridad del hash SHA-256 indicado en la model card antes de usarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Anotos/Gemma-4-E4B-Heretic-MLX-4bit
- Repositorio original (espejado): https://huggingface.co/dopaemon/Gemma4-E4B-8B-Heretic-Ultra-MLX-4Bit
- Modelo base de la ablacion: https://huggingface.co/dopaemon/Gemma4-E4B-8B-Heretic-Ultra
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Perfil del autor de la ablacion: https://huggingface.co/llmfan46
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en DeepMind: https://deepmind.google/models/gemma/
