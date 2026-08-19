# DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF

## Resumen

El modelo `DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF` es un fine-tune de la familia Qwen 3.5 de 9 mil millones de parametros, desarrollado por DavidAU y publicado en HuggingFace en agosto de 2026. Se distribuye exclusivamente en formato GGUF, tanto en variantes regulares como MTP (multi-token prediction), con cuantizaciones optimizadas mediante el metodo NEO IMATRIX. El modelo esta disenado para ejecucion local en aplicaciones compatibles con llama.cpp, como LM Studio u Ollama, y ofrece una ventana de contexto de 256k tokens.

La principal innovacion es el metodo de entrenamiento "GAIN", que ajusta dinamicamente el proceso de aprendizaje por muestra durante el entrenamiento, y la tecnica "Cold Fusion", que segun el autor permite superar el rendimiento del modelo Qwen 3.5 de 27B con solo 9B de parametros, incluso en cuantizaciones de 4 y 8 bits. Ademas, el modelo ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) y fine-tuning orientado a escritura creativa sin censura, lo que lo hace especialmente adecuado para ficcion, roleplaying y generacion de texto libre.

El modelo es multimodal (image-text-to-text), con soporte de vision activado mediante un archivo `mmproj` separado, y esta disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Los idiomas soportados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-9B (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 9B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF regular y MTP, con NEO IMATRIX; se mencionan Q4_K_S, IQ3_M, mxfp8 y mxfp4 en benchmarks |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensor de salida en 16-bit y tensores MTP en Q8_0) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-9B, un modelo de lenguaje multimodal de la familia Qwen 3.5. No se proporcionan detalles sobre si se trata de un transformer denso, MoE o hibrido, pero por el tamano y la familia se asume un transformer denso clasico. El modelo ha sido fine-tuneado por DavidAU mediante un proceso de multiples etapas que incluye el metodo "GAIN" (ajuste dinamico del entrenamiento por muestra en tiempo real), la tecnica "Cold Fusion" (que segun el autor supera el rendimiento de modelos de mayor tamano) y un proceso de "abliteration" para eliminar los rechazos del modelo base, resultando en una variante "uncensored" o "heretic".

El entrenamiento se realizo con la libreria Unsloth, y el autor indica que el metodo GAIN mantiene el 99% del rendimiento del BF16 tanto en 8 bits como en 4 bits. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset. El modelo incluye soporte de vision, activado mediante un archivo `mmproj` separado, y los pesos se distribuyen en formato GGUF con cuantizaciones NEO IMATRIX, que mejoran la precision entre un 2% y un 4% respecto a GGUF estandar, ademas de un tensor de salida en precision completa de 16 bits.

## Capacidades

- Generacion de texto creativo y narrativo de alta calidad, con especial enfasis en ficcion, ciencia ficcion, terror y thriller.
- Razonamiento y pensamiento logico, con modo "thinking" que segun el autor mejora los resultados en benchmarks respecto al modo instruct.
- Soporte de vision (multimodal) mediante un archivo `mmproj` separado, permitiendo entrada de imagenes.
- Decodificacion multi-token (MTP) en las variantes MTP, que acelera la generacion al predecir dos tokens a la vez, con tasas de aceptacion superiores al 50% en condiciones optimas.
- Generacion de tablas, graficos y representaciones visuales en ASCII con mayor detalle y calidad.
- Escritura sin censura (uncensored/abliterated), sin rechazos ante solicitudes de contenido explicito o controvertido.
- Capacidad multilingue limitada a ingles y chino.
- No se confirma soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Escritura creativa profesional: el modelo puede generar relatos, novelas, guiones y poesia con un estilo visceral y detallado, gracias a su fine-tuning especifico para ficcion y su capacidad de mantener coherencia en contextos largos de hasta 256k tokens.
- Roleplaying y juegos de texto: su naturaleza uncensored y su habilidad para mantener personajes y tramas complejas lo hacen adecuado para sesiones de rol interactivas, tanto en solitario como en grupo.
- Asistente de redaccion para blogs y contenidos: puede producir articulos, ensayos y contenido editorial con un tono directo y sin restricciones, util para creadores que necesitan superar bloqueos creativos.
- Generacion de codigo y asistencia tecnica: aunque no es su enfoque principal, al estar basado en Qwen 3.5 conserva capacidades de programacion y razonamiento logico, util para tareas de desarrollo en entornos locales.
- Analisis de imagenes con descripcion creativa: gracias a su soporte de vision, puede interpretar imagenes y generar descripciones narrativas o poeticas, aplicable en proyectos de arte digital o accesibilidad.
- Prototipado rapido de ideas: su velocidad de generacion (hasta 185 tokens por segundo con MTP en una RTX 5090) permite iterar rapidamente sobre conceptos, tramas o argumentos sin esperas largas.

## Benchmarks y rendimiento

El autor proporciona resultados de benchmarks en modo instruct para cuantizaciones mxfp8 y mxfp4, comparando con los modelos base Qwen3.5-9B-Instruct y Qwen3.5-27B-Instruct. Los datos son los siguientes:

| Modelo | Cuantizacion | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-Cold-Fusion-GAIN (instruct) | mxfp8 | 0.642 | 0.832 | 0.897 | 0.685 | 0.460 | 0.781 | 0.720 |
| Qwen3.5-9B-Cold-Fusion-GAIN (instruct) | mxfp4 | 0.640 | 0.844 | 0.882 | 0.677 | 0.462 | 0.776 | 0.710 |
| Mismo entrenamiento sin metodo GAIN | mxfp8 | 0.641 | 0.835 | 0.894 | 0.675 | 0.450 | 0.769 | 0.699 |
| Mismo entrenamiento sin metodo GAIN | mxfp4 | caida de metricas de aproximadamente 10% | - | - | - | - | - | - |
| Qwen3.5-9B-Instruct (base) | mxfp8 | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.5-27B-Instruct (base) | mxfp8 | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

El autor indica que en modo "thinking" los resultados pueden superar a los de modo instruct. No se proporcionan benchmarks adicionales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Para un modelo de 9B en cuantizacion 4-bit, se estima un consumo de entre 6 y 8 GB, pero no se confirma oficialmente.
- GPU recomendadas: el autor menciona pruebas en una RTX 5090 con Windows 11 y LM Studio. Modelos como RTX 4090, RTX 3090 o GPUs con 12 GB o mas de VRAM deberian ser suficientes para las cuantizaciones mas bajas.
- Compatibilidad con consumer GPUs: si, gracias a las cuantizaciones GGUF (Q4_K_S, IQ3_M, etc.) el modelo puede ejecutarse en GPUs de consumo medio-alto.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, y cualquier aplicacion compatible con GGUF. Tambien se puede usar con servidores de inferencia como vLLM si se convierte a otro formato, aunque no se menciona explicitamente.
- Velocidad: en Q4_K_S (4-bit) regular, aproximadamente 130 tokens por segundo; con MTP (aceptacion del 60%, 2 tokens) puede superar los 185 tokens por segundo en una RTX 5090. Las velocidades varian segun hardware y aplicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (arc/c, mxfp8) |
|---|---|---|---|---|---|
| Qwen3.5-9B-Cold-Fusion-GAIN (este modelo) | 9B | 256k | Apache 2.0 | GGUF | 0.642 |
| Qwen3.5-9B-Instruct (base) | 9B | 256k (presumible) | Apache 2.0 | Original (BF16) | 0.571 |
| Qwen3.5-27B-Instruct (base) | 27B | 256k (presumible) | Apache 2.0 | Original (BF16) | 0.557 |

Segun los benchmarks del autor, este fine-tune supera tanto al Qwen3.5-9B-Instruct como al Qwen3.5-27B-Instruct en la mayoria de metricas evaluadas, a pesar de tener un tamano menor. La diferencia principal es que este modelo es uncensored y esta optimizado para escritura creativa, mientras que los modelos base son genericos y con filtros de seguridad.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" o "heretic", puede generar contenido explicito, violento, ofensivo o inapropiado sin restricciones. No es adecuado para aplicaciones donde se requiera moderacion de contenido.
- El proceso de abliteration puede reducir la capacidad del modelo para rechazar solicitudes peligrosas, lo que implica un riesgo de uso malintencionado.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar hechos, citas o informacion falsa, especialmente en contextos largos.
- Limitaciones de idioma: solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La ventana de contexto de 256k tokens puede degradar el rendimiento si se usa al maximo, aunque el autor indica que el modelo maneja mejor contextos largos que sus bases.
- Las cuantizaciones MTP requieren condiciones especificas (temperatura menor o igual a 1, repeticion penalizada desactivada) para mantener un rendimiento optimo; en caso contrario, se recomienda usar las variantes regulares.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad o seguridad del modelo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF
- Repositorio de archivos: https://huggingface.co/DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF/tree/main
- Articulo sobre fine-tunes uncensored de Qwen 3.5 9B: https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations
- Ficha de modelo similar en interfaze.ai: https://interfaze.ai/models/davidauqwen35-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
- Pagina de Qwen 3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
