# llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic

## Resumen
`llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic` es una variante "abliterated" (decensurada) del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized`, publicada por el usuario independiente llmfan46. El modelo base es un Gemma 4 de 12B parámetros en su versión instruction-tuned y con Quantization-Aware Training (QAT) a 4 bits, redistribuido aquí en pesos sin cuantizar (safetensors, ~24 GB de repo). La modificación se ha realizado con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), que elimina direcciones de activación asociadas al comportamiento de rechazo sin reentrenar el modelo.

El objetivo declarado es reducir drásticamente las negativas del modelo (de 99/100 a 7/100 en el conjunto de evaluación del autor) manteniendo la calidad original, con una divergencia KL de 0,1455 respecto al modelo base. Según la model card, la precisión en MMLU pasa de 74,52 % a 74,18 %, lo que supone una degradación mínima en conocimiento general.

Es relevante para quienes necesitan un modelo multimodal (pipeline `any-to-any`, `image-text-to-text`) de tamaño medio que no aplique rechazos sistemáticos, por ejemplo en investigación sobre alineación, generación creativa sin filtros o entornos donde las negativas del modelo base resultan obstructivas. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia específica de Gemma 4 de Google, lo que introduce una ambigüedad jurídica que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), multimodal image-text-to-text; detalles internos de capas y atención no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base es QAT q4_0; esta versión se distribuye en safetensors sin cuantizar (pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |
| Tamano del repo | 24,0 GB |
| Pipeline | any-to-any |
| Libreria | transformers |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized |
| Metodo de decensurado | Heretic v1.2.0 + Arbitrary-Rank Ablation (ARA) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 4 en su variante de 12B parámetros, un transformer multimodal capaz de procesar imagen y texto (pipeline `image-text-to-text` / `any-to-any`). El modelo base ha pasado por un proceso de Quantization-Aware Training a 4 bits (q4_0), lo que implica que fue entrenado simulando la cuantización para preservar calidad al desplegarse en baja precisión; esta redistribución, sin embargo, ofrece los pesos sin cuantizar.

El entrenamiento original de Gemma 4 incluye ajuste por instrucciones (it) y, presumiblemente, técnicas de alineación tipo RLHF/DPO, aunque la información proporcionada no detalla la composición del dataset ni el número de tokens. La innovación de esta ficha no está en el entrenamiento sino en la edición post-hoc: Heretic aplica una abliteración de rango arbitrario (ARA) sobre las capas 24 a 35, concretamente sobre el componente `attn.o_proj`, con parámetros de preservación de comportamiento bueno (`preserve_good_behavior_weight` = 0,7407), dirección de mal comportamiento (`steer_bad_behavior_weight` = 0,0162), corrección relativa (`overcorrect_relative_weight` = 0,8963) y `neighbor_count` = 15. No hay reentrenamiento ni fine-tuning con datos nuevos.

## Capacidades
- Generación de texto y razonamiento de uso general, heredados del Gemma 4 12B instruction-tuned.
- Procesamiento multimodal imagen-texto: acepta entradas de imagen y texto combinadas (pipeline `any-to-any`).
- Respuesta a instrucciones conversacionales multi-turno.
- Conocimiento enciclopédico y académico amplio, con MMLU del 74,18 % en la evaluación del autor.
- Capacidad de responder sin rechazos en la gran mayoría de prompts (7/100 negativas según la evaluación del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineación y abliteración: comparar el comportamiento del modelo base frente a esta variante permite estudiar qué direcciones de activación codifican los rechazos y cómo afecta la edición a la calidad (KL de 0,1455) y al conocimiento (MMLU -0,34 puntos).
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas sistemáticas del modelo original, manteniendo coherencia gracias a los 12B parámetros.
- Evaluación de robustez de sistemas de moderación: usar el modelo como generador adversario controlado para probar clasificadores de contenido y políticas de seguridad en pipelines propios.
- Asistente conversacional especializado en dominios donde el modelo base rechaza preguntas legítimas (por ejemplo, educación sexual, derecho penal o medicina forense), aprovechando su MMLU del 82 % en `professional_medicine` y 81 % en `professional_psychology`.
- Procesamiento multimodal de documentos: al ser image-text-to-text, puede extraer y razonar sobre información de imágenes y texto combinados, útil en digitalización de formularios o análisis de capturas.
- Prototipado rápido en local: con ~12B parámetros y pesos safetensors de 24 GB, es desplegable en una GPU de 24 GB en cuantización adicional (por ejemplo, GGUF q4) para iterar en investigación sin depender de APIs externas.
- Red teaming interno: simular respuestas sin restricciones para auditar la exposición de un producto ante prompts maliciosos antes de desplegar el modelo base.

## Benchmarks y rendimiento

| Benchmark | Este modelo (Heretic) | Modelo original (Gemma 4 12B it QAT) |
|---|---|---|
| MMLU (accuracy global) | 74,18 % (5208/7021) | 74,52 % (5232/7021) |
| MMLU (fallos de parseo) | 202 | 317 |
| Tasa de rechazos | 7/100 | 99/100 |
| Divergencia KL vs. base | 0,1455 | 0 (por definición) |

Resultados MMLU por materia destacados del modelo original (no se publican los de la variante Heretic por materia): `high_school_biology` 92,76 %, `management` 92,00 %, `high_school_geography` 90,91 %, `high_school_psychology` 90,37 %, `high_school_microeconomics` 88,97 %, `international_law` 88,33 %, `us_foreign_policy` 88,00 %, `high_school_government_and_politics` 87,13 %, `marketing` 85,32 %, `high_school_macroeconomics` 85,28 %. Materias débiles: `high_school_mathematics` 26,77 %, `college_chemistry` 29,79 %, `college_mathematics` 30,91 %, `college_physics` 42,11 %, `global_facts` 41,18 %, `virology` 48,31 %, `high_school_physics` 51,19 %.

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware
- Pesos sin cuantizar: ~24 GB en safetensors, por lo que la inferencia en fp16/bf16 requiere al menos 24 GB de VRAM solo para pesos, más overhead de activaciones y KV cache (estimación práctica: 28-32 GB para contextos moderados).
- GPU recomendadas para pesos completos: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con pesos completos salvo con cuantización adicional; sí cabría en una RTX 4090 o 3090 si se reconvierte a GGUF q4/q5 (el modelo base ya fue entrenado con QAT q4_0, lo que facilita este paso).
- Opciones de despliegue: `transformers` (formato nativo), y previsiblemente vLLM, TGI, llama.cpp y Ollama tras conversión a los formatos correspondientes; no se confirma compatibilidad explícita en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 12B Heretic) | ~12B | no disponible | 74,18 % | apache-2.0 (con enlace a licencia Gemma) | Sí (image-text-to-text) | Decensurado con ARA; 7/100 rechazos |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~12B | no disponible | 74,52 % | Licencia Gemma 4 | Sí | Modelo base alineado; 99/100 rechazos |
| Alternativas de la misma categoría (12B abliterated) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con otras familias (Llama, Qwen, Mistral) en esta ficha sin inventar datos.

## Limitaciones y advertencias
- La abliteración elimina direcciones de rechazo, pero no garantiza la ausencia de contenido dañino ni sustituye a una capa de moderación en producción.
- La divergencia KL de 0,1455 indica un cambio medible en la distribución de salida; puede afectar a matices de estilo, seguridad y calibración en dominios sensibles.
- El MMLU por materia muestra debilidades claras en matemáticas y ciencias exactas (26-42 % en matemáticas de secundaria y universidad, física y química), lo que limita su uso en tareas cuantitativas.
- La licencia presenta ambigüedad: se declara `apache-2.0` pero se enlaza la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribución; verificar antes de desplegar en producto.
- No se documentan los idiomas soportados; el rendimiento fuera del inglés no está garantizado.
- No se especifica la longitud de contexto; planificar con cautela en aplicaciones que requieran ventanas largas.
- Modelo publicado por un contribuidor individual (llmfan46), no por Google; no hay garantía de mantenimiento, soporte ni actualizaciones.
- Riesgo de alucinación inherente a un modelo de 12B, agravado por la edición post-hoc que puede alterar la calibración de la incertidumbre.
- El repositorio tiene solo 268 descargas y 7 likes en el momento de la consulta: comunidad pequeña, poca validación independiente.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
