# enclavelabs/enclave-scribe-devanagari-iter4

## Resumen

EnclaveScribe Devanagari OCR (iter-4) es un adaptador LoRA desarrollado por Enclave Labs que añade capacidades de OCR a nivel de página para texto en devanagari. Se construye sobre el modelo base `allenai/olmOCR-2-7B-1025`, un sistema de vision-language basado en Qwen2.5-VL-7B. El adaptador está diseñado para transcribir imágenes de páginas completas en Unicode, cubriendo hindi, marathi, sánscrito y nepalí, así como pali según la documentación.

La iter-4 es una evolución de la iter-3, que presentaba fallos de generación en bucles en páginas largas y densas. El nuevo adaptador corrige ese comportamiento mediante un ajuste fino con imágenes de páginas reales de documentos indicos y una mezcla de replay de muestras a nivel de palabra. El modelo base tiene aproximadamente 8.400 millones de parámetros, de los cuales unos 95 millones son entrenables en el adaptador (un 1,1 % del total). El entrenamiento se realizó con secuencias de hasta 8.192 tokens, aunque no se especifica la longitud de contexto nativa del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (basado en Qwen2.5-VL-7B) con adaptador LoRA |
| Parametros totales | 8.4B (modelo base) + ~95M de parametros entrenables en el adaptador LoRA |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento usó secuencias de hasta 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (hi), marathi (mr), sanscrito (sa), nepali (ne) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA + configuracion PEFT) |

El repositorio del adaptador ocupa 0.4 GB y se distribuye como un conjunto de pesos PEFT. La etiqueta de pipeline es `image-text-to-text`.

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador LoRA sobre `allenai/olmOCR-2-7B-1025`, un modelo de vision-lenguaje de la familia Qwen2.5-VL. La adaptación se realizó mediante LoRA con rango r=32 y alpha=64, heredados de la iter-3. El entrenamiento se ejecutó en una NVIDIA A10G de 24 GB, con precisión bf16, kernel Liger y gradient checkpointing. Se usó un batch efectivo de 32 (per-device 1 con acumulación de gradientes de 32), optimizador AdamW con programación de aprendizaje coseno, LR inicial de 5.0e-5 y 10 pasos de warmup. Se completaron 2 épocas en 82 pasos, con una duración de 1 hora y 37 minutos.

Los datos de entrenamiento provienen de dos fuentes. La principal son 793 imágenes de páginas pseudoetiquetadas del dataset `ai4bharat/indicdlp` (hindi y marathi), generadas por la iter-3 mediante el pipeline agente de EnclaveScribe y filtradas desde 2.000 intentos (tasa de aprobación del 41,75 %). La segunda fuente son 500 muestras a nivel de palabra del dataset `himalaya-ai/devanagari_ocr_dataset`, mezcladas en una proporción de 5:1 (páginas:palabras) para evitar el olvido catastrófico de la competencia de la iter-3. En total se usaron 1.254 muestras de entrenamiento y 42 de validación. La iter-4 se entrenó reanudando desde el adaptador de la iter-3 mediante `resume_adapter`, no desde cero.

La principal innovación técnica es el cambio de `max_length` a 8.192 tokens y el ajuste sobre páginas completas, lo que elimina los bucles de generación que sufría la iter-3 en documentos densos. Según la documentación, las páginas típicas requieren entre 1.500 y 2.500 tokens de texto más unos 640 tokens de imagen. El coste de cómputo declarado es de aproximadamente 3 dólares para el entrenamiento y unos 65 dólares incluyendo el paso de pseudoetiquetado.

## Capacidades

- OCR de páginas completas en devanagari, devolviendo la transcripción Unicode exacta. El modelo está pensado para páginas de documentos reales, no solo para recortes de palabras.
- Soporte de varios idiomas indicos: hindi, marathi, sánscrito y nepalí, además de pali según el README.
- Preservación de la escritura original, incluyendo dígitos arábigos en secciones inglesas, evitando la alucinación de dígitos devanagari que producía la iter-3.
- Generación sin bucles: la iter-4 no entra en bucles de producción de bloques `<tool_call>` en las páginas densas que rompían la iter-3.
- Integración con el pipeline agente de EnclaveScribe para procesar PDFs de página completa, con rasterización y configuración de generación gestionada automáticamente.
- Manejo de páginas con hasta 4.077 caracteres extraídos dentro del límite de 4.096 tokens de generación, según los datos reportados.
- No se documenta soporte específico de tool calling o function calling en el adaptador. Los artefactos de `<tool_call>` aparecieron como fallo en la iter-3 y se corrigen en la iter-4, pero no se presenta como una capacidad del modelo final.

## Casos de uso

- Digitalización de gacetas gubernamentales: el adaptador fue probado sobre una Gaceta de la India Extraordinaria de 6 páginas en hindi e inglés. Es adecuado para convertir documentos legales oficiales en texto buscable, preservando la escritura mixta con dígitos arábigos.

- OCR de manuscritos sánscritos: el modelo reconoce escritura sánscrita en devanagari, lo que permite digitalizar manuscritos académicos o religiosos y exportarlos a Unicode para su análisis filológico.

- Conversión de periódicos hindi en archivo: los diarios en hindi suelen tener columnas densas y tipografía variada. Gracias a su capacidad de no generar bucles en páginas largas, el modelo puede procesar páginas completas de prensa para construir archivos históricos.

- Extracción de textos legales marathi: el dataset de entrenamiento incluye páginas en marathi. El adaptador es adecuado para transcribir documentos jurídicos o administrativos en marathi antes de su traducción o indexación.

- Preservación de textos nepalíes en bibliotecas: el modelo soporta nepalí, por lo que resulta útil para digitalizar colecciones de libros y boletines en esta lengua, integrándolo con flujos de preservación digital.

- Pipeline de OCR embebido en aplicaciones de archivo: el adaptador puede integrarse en el sistema EnclaveScribe para procesar PDFs completos. El pipeline gestiona la rasterización y la configuración de generación, permitiendo un despliegue self-hosted para organizaciones con documentos indicos.

- Automatización de entrada de datos en administración pública: la capacidad de producir salida limpia en markdown facilita su uso en sistemas de extracción de datos de formularios o avisos impresos en hindi y marathi.

## Benchmarks y rendimiento

Los resultados declarados por el autor provienen de una prueba de aceptación (ship-gate) sobre una Gaceta de la India Extraordinaria de 6 páginas en hindi e inglés, con una salida de un máximo de 4.096 tokens por página. Son datos reportados por el autor y no están verificados de forma independiente.

| Métrica | iter-3 | iter-4 |
|---|---|---|
| Total de caracteres extraídos | 7.122 | 13.646 |
| Páginas en bucle muerto | 2/6 | 0/6 |
| Máximo de caracteres por página (tope 4.096) | 2.430 | 4.077 |
| Tiempo total (6 páginas, g5.xlarge) | 20 min | 12 min |

El benchmark del model-index registra un total de 13.646 caracteres extraídos y 0 páginas en bucle muerto para la iter-4. No se ha publicado un valor numérico de CER (Character Error Rate) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.4 GB y se carga, por tanto, con muy poco consumo de memoria. El modelo base requiere alrededor de 17 GB de VRAM en precisión bf16, por lo que una GPU de 24 GB como la A10G (usada en el entrenamiento), la RTX 4090 o la A100 es suficiente.
- En GPUs con 16 GB de VRAM (por ejemplo, RTX 4080 o 4060 Ti), no sería posible cargar el modelo en bf16 sin cuantizar; la información proporcionada no incluye recetas de cuantización.
- El autor reporta una latencia de 12 minutos para procesar 6 páginas en una instancia AWS g5.xlarge (A10G 24 GB), lo que equivale a aproximadamente 2 minutos por página con generación de hasta 4.096 tokens.
- El despliegue documentado se basa en Hugging Face Transformers y PEFT, cargando el adaptador sobre el modelo base con `PeftModel`. No se aportan instrucciones para vLLM, TGI, llama.cpp u Ollama en la información disponible.

## Comparativa con modelos similares

En ausencia de benchmarks externos sobre OCR devanagari, la comparación disponible se limita a las iteraciones del propio proyecto y al modelo base sin adaptar.

| Modelo | Parámetros | Contexto | Specialización | Licencia |
|---|---|---|---|---|
| EnclaveScribe Devanagari OCR (iter-4) | 8.4B base + ~95M LoRA | No disponible (hasta 8192 en entrenamiento) | OCR de páginas devanagari | MIT |
| EnclaveScribe Devanagari OCR (iter-3) | 8.4B base + ~95M LoRA | No disponible (max_length 4096) | OCR de palabras y páginas con bucles | MIT |
| allenai/olmOCR-2-7B-1025 (base) | ~8.4B | No disponible | OCR genérico en inglés y otros idiomas | No indicada |

La iter-4 mejora claramente a la iter-3 en la capacidad de procesar páginas completas sin bucles, con un aumento del 91 % en caracteres extraídos y una reducción del 40 % en tiempo de procesamiento en la prueba de referencia. El modelo base sin el adaptador no está especializado en devanagari y su rendimiento en esta tarea no se documenta.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son pseudoetiquetas generadas por la iter-3. Esto implica un techo de calidad ligado a los errores del modelo generador; la documentación menciona explícitamente esta limitación antes de cortar el texto.
- Aunque el adaptador está diseñado para devanagari, el entrenamiento se centra en hindi y marathi. El rendimiento en sánscrito y nepalí puede ser inferior, ya que no se reportan evaluaciones específicas para esos idiomas.
- La iter-3 alucinaba dígitos devanagari en secciones inglesas; la iter-4 corrige este comportamiento en la prueba de la Gaceta, pero no se garantiza que el defecto no reaparezca en otros documentos.
- El modelo puede generar salidas truncadas si una página supera el límite de 4.096 tokens de generación; el autor reporta un máximo de 4.077 caracteres, cerca del techo.
- No se documenta una evaluación sobre manuscritos, fotografías o documentos degradados, por lo que su fiabilidad en estos escenarios es desconocida.
- La licencia MIT del adaptador permite uso comercial, pero la licencia del modelo base `allenai/olmOCR-2-7B-1025` no está especificada en la model card. Conviene revisar las condiciones del modelo base antes de un despliegue en producción.
- Se recomienda mantener `repetition_penalty=1.1` en producción como seguro adicional, aunque la iter-4 no dependa estrictamente de él.

## Enlaces

- Modelo: https://huggingface.co/enclavelabs/enclave-scribe-devanagari-iter4
- Iter-3: https://huggingface.co/enclavelabs/enclave-scribe-devanagari
- Modelo base: https://huggingface.co/allenai/olmOCR-2-7B-1025
- Dataset ai4bharat/indicdlp: https://huggingface.co/datasets/ai4bharat/indicdlp
- Dataset himalaya-ai/devanagari_ocr_dataset: https://huggingface.co/datasets/himalaya-ai/devanagari_ocr_dataset
- Repositorio del proyecto EnclaveScribe: https://github.com/Enclave-Labs-Inc/enclave-scribe
- Informe de la prueba de la Gaceta: https://github.com/Enclave-Labs-Inc/enclave-scribe/blob/main/reports/iter4/GAZETTE_TEST.md
- Organización Enclave Labs: https://github.com/Enclave-Labs-Inc
