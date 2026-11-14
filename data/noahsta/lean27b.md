# noahsta/lean27b

## Resumen

lean27b es un ajuste fino (finetune) por LoRA del modelo Qwen/Qwen3.6-27B, desarrollado por el usuario noahsta y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado en la generación de código Lean 4 y en el corpus de teoremas y pruebas de Mathlib4, lo que lo orienta a tareas de demostración formal y asistencia en matemáticas verificables. Se distribuye como un único archivo GGUF en cuantización Q8_0 de 28,6 GB, pensado para su uso con llama.cpp.

El modelo parte de una arquitectura transformer de 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y conserva la ventana de contexto del modelo base, que según la configuración de ejemplo del autor alcanza los 262.144 tokens. El entrenamiento se realizó sobre el código fuente de todos los archivos `.lean` de Mathlib4 en la etiqueta v4.33.0, con pérdida causal estándar y sin datos de instrucción ni plantilla de chat.

Su relevancia radica en que aplica un ajuste ligero y reproducible (LoRA de rango 32 sobre las 64 capas) a un modelo base grande para una tarea muy concreta, la generación de pruebas formales, y lo publica en un formato cuantizado listo para desplegar en llama.cpp. Es un ejemplo de especialización vertical sobre un modelo generalista, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.6-27B), ajuste fino por LoRA |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (configuración de ejemplo del autor con `-c 262144`) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `lean27b-r32_wd40_full-Q8_0.gguf`, 28,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen/Qwen3.6-27B, con 64 capas. Sobre esa base se aplicó un ajuste fino mediante LoRA con peft, en precisión bf16 y con gradient checkpointing. El rango y el alpha de LoRA son 32, con dropout 0,05, y los módulos objetivo abarcan `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `out_proj`, `gate_proj`, `up_proj` y `down_proj` en las 64 capas. Se usó el optimizador AdamW con tasa de aprendizaje constante de 1e-5, sin warmup, weight decay de 0,4, recorte de gradiente de 1,0, tamaño de lote de 8 sin acumulación, longitud máxima de secuencia de 1024, 5 épocas y semilla 42. El entrenamiento se ejecutó en una única GPU de 80 GB con torch 2.13.0, transformers 5.15.1, peft 0.20.0 y accelerate 1.14.0.

Los datos de entrenamiento son todos los archivos `.lean` bajo `Mathlib/` del repositorio mathlib4 en la etiqueta v4.33.0, con partición 80/20 por archivo (semilla 42). Los archivos de menos de 1024 tokens se conservan enteros; los más largos se dividen solo en líneas en blanco y se empaquetan de forma voraz en fragmentos de como máximo 1024 tokens. La pérdida es causal-LM estándar sobre todos los tokens, sin plantilla de chat ni datos de instrucción. La pérdida final de validación completa fue de 0,652. Tras cada época se comprobó que el modelo seguía emitiendo llamadas de herramienta válidas (grep, web_search, ls), con resultado 3/3 en todas las épocas.

Como innovación de exportación, el LoRA se fusionó en la base bf16 y se eliminó la torre de visión. La conversión se hizo con `convert_hf_to_gguf.py --outtype q8_0` de llama.cpp, y después se parchearon los metadatos del GGUF de `block_count=65, nextn_predict_layers=1` a `64 / 0`, ya que la cabeza MTP no se incluye. No se modificaron los datos de los tensores.

## Capacidades

- Generación de texto especializada en código Lean 4 y pruebas formales sobre Mathlib4.
- Asistencia en demostración de teoremas y completado de pruebas en el ecosistema Lean.
- Generación de código de propósito general heredada del modelo base Qwen3.6-27B.
- Soporte de llamadas a herramientas (tool calling): el autor verifica que emite llamadas válidas a grep, web_search y ls.
- Capacidad conversacional (etiqueta `conversational` y compatibilidad con endpoints).
- Razonamiento matemático orientado a formalización, aunque sin datos de instrucción específicos.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: no incluida (la torre de visión se eliminó en la exportación).
- Cabeza MTP: no incluida.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Autocompletado de pruebas Lean 4 en el editor: el modelo, entrenado sobre Mathlib4, puede sugerir tácticas y bloques de prueba mientras el usuario escribe en VS Code con la extensión de Lean, reduciendo el ciclo de iteración en formalizaciones.
- Reparación de pruebas que no compilan: dado un error de Lean y el contexto del archivo, el modelo puede proponer correcciones sobre tácticas y lemas, aprovechando su conocimiento del corpus de Mathlib.
- Formalización asistida de enunciados matemáticos: traducción de enunciados en lenguaje natural a esqueletos de teoremas Lean que el usuario completa y verifica con el comprobador.
- Generación de lemas auxiliares: el modelo puede proponer lemas intermedios y sus pruebas para descomponer demostraciones largas, un patrón habitual en el desarrollo con Mathlib.
- Integración en pipelines de CI para Lean: uso del modelo como generador de candidatos en un bucle de verificación automática, donde solo se aceptan las pruebas que el comprobador valida.
- Asistencia en investigación en matemáticas formales: exploración de variantes de una prueba o búsqueda de enfoques alternativos sobre definiciones existentes de Mathlib.
- Despliegue local en llama.cpp: al ser un GGUF Q8_0 único, puede servirse con `llama-server` en una máquina con suficiente VRAM, sin necesidad de infraestructura de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de validación completa de 0,652, junto con la comprobación cualitativa de llamadas a herramientas (3/3 en cada época).

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 26,6 GiB en Q8_0, según el autor.
- VRAM estimada a contexto completo: aproximadamente 41,6 GiB con 262.144 tokens de contexto.
- GPU recomendadas: una GPU de 80 GB (A100/H100) permite el contexto completo con holgura; para contextos menores basta con menos memoria.
- GPU de consumo: no cabe en GPUs de consumo típicas de 24 GB en Q8_0; requeriría cuantizaciones menores no publicadas o descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, concretamente `llama-server` con una compilación que soporte `qwen35`, usando `-ngl 99 -c 262144 --jinja`.
- Parámetros de muestreo embebidos en el GGUF: temperatura 1,0, top_p 0,95, top_k 20.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| lean27b (este modelo) | 26,9 mil millones | hasta 262.144 tokens | Lean 4 / Mathlib4 | Apache 2.0 | GGUF Q8_0 |
| Qwen/Qwen3.6-27B (base) | 26,9 mil millones | no disponible en la información | Generalista | no disponible en la información | no disponible en la información |
| Alternativas especializadas en Lean 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en Lean 4 en el material proporcionado, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó sin plantilla de chat ni datos de instrucción, por lo que su comportamiento conversacional puede ser limitado pese a la etiqueta `conversational`.
- Riesgo de alucinación en pruebas formales: el modelo puede generar tácticas o lemas inexistentes; toda salida debe verificarse con el comprobador de Lean.
- Solo se publica una cuantización Q8_0, lo que limita el despliegue en GPUs de consumo y no ofrece alternativas de menor precisión.
- La torre de visión y la cabeza MTP se eliminaron en la exportación; no hay capacidades multimodales ni decodificación especulativa con MTP.
- El parche de metadatos del GGUF (`block_count` y `nextn_predict_layers`) es una modificación manual del autor; conviene validar la carga con la versión de llama.cpp indicada.
- Requiere una compilación de llama.cpp que soporte `qwen35`; versiones antiguas pueden no cargar el archivo.
- El ajuste se limita a archivos de Mathlib4 en la etiqueta v4.33.0, por lo que puede degradarse en versiones posteriores de Lean o Mathlib.
- No se especifican idiomas soportados ni sesgos conocidos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.6-27B, cuya licencia no se detalla en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noahsta/lean27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio Mathlib4: https://github.com/leanprover-community/mathlib4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- peft: https://github.com/huggingface/peft
