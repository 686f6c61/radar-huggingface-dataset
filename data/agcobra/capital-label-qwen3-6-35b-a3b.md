# AGCobra/Capital-Label-Qwen3.6-35B-A3B

## Resumen

Capital-Label-Qwen3.6-35B-A3B es un ajuste fino (finetune) del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollado por el usuario AGCobra y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado en la extracción estructurada de datos a partir de avisos financieros multipágina, una tarea de document understanding que combina visión por computador y comprensión lectora sobre documentos escaneados o renderizados como imagen.

El ajuste se realizó con LoRA en precisión BF16 durante tres épocas, entrenando tanto las capas de lenguaje como las de visión. El resultado se distribuye principalmente en formato GGUF cuantizado a Q4_K_M, junto con un proyector multimodal (mmproj) en F16 que incorpora los pesos LoRA entrenados del codificador visual. El adaptador LoRA original también permanece disponible en el repositorio para su uso con Transformers.

Con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y una arquitectura presumiblemente MoE según la nomenclatura "A3B" (3 mil millones de parámetros activos), el modelo hereda las capacidades generales de la familia Qwen3.6 y las especializa para un dominio vertical muy concreto: la extracción de campos financieros. Su relevancia actual radica en la combinación de un modelo base grande con un adaptador ligero y un pipeline de cuantización listo para despliegue local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.6-35B-A3B; MoE según nomenclatura A3B, no confirmado en la información disponible) |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible (la nomenclatura "A3B" sugiere ~3B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF principal); F16 (mmproj del codificador visual); LoRA en BF16 (adaptador original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M + mmproj F16), safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B (revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`), un modelo multimodal de tipo image-text-to-text. Sobre él se aplicó un ajuste fino con LoRA en BF16 durante tres épocas, entrenando simultáneamente las capas de lenguaje y las de visión. El adaptador resultante (revisión `b1021c714f36f4ce82f7b9be177e107aa9a7edd2`) se fusionó con el modelo base mediante PEFT 0.21.2 y se convirtió a GGUF con llama.cpp (commit `7071ba3`). La cabeza MTP (multi-token prediction) del modelo base, no entrenada, se omite en la exportación.

El conjunto de datos de entrenamiento es privado y contiene 166 documentos de entrenamiento y 24 de test, de los cuales solo tres ejemplos de entrenamiento están neteados (es decir, la mayoría son documentos brutos con sus anotaciones). Se trata, por tanto, de un ajuste de dominio con un volumen de datos muy reducido, orientado a un formato de salida muy específico. El proyector visual exportado preserva los límites de resolución del procesador de entrenamiento: entre 65.536 y 16.777.216 píxeles. La plantilla de chat del GGUF desactiva el modo thinking e inserta el bloque de pensamiento vacío empleado durante el entrenamiento.

## Capacidades

- Extracción estructurada de información a partir de documentos financieros multipágina (avisos, comunicados, extractos).
- Procesamiento de imágenes de documento con el proyector multimodal incluido en el mmproj F16.
- Comprensión de texto e imagen combinados (pipeline image-text-to-text).
- Generación de texto conversacional heredada del modelo base Qwen3.6.
- Modo thinking desactivado por defecto en la plantilla de chat del GGUF (comportamiento fijado durante el entrenamiento).
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Extracción de campos de avisos financieros: el modelo recibe todas las páginas de un documento en orden junto con la instrucción de extracción exacta (`instruction.txt`) y devuelve los campos estructurados. Es su caso de uso principal y el único para el que fue entrenado explícitamente.
- Digitalización de archivos históricos de comunicados: procesamiento por lotes de documentos escaneados de baja calidad mediante el proyector visual con límites de resolución amplios (hasta 16,7 Mpx), útil para fondos documentales de entidades financieras.
- Automatización de back-office en banca: integración en pipelines que reciben PDFs o imágenes de notificaciones y necesitan poblar bases de datos relacionales con los campos extraídos, reduciendo la intervención manual.
- Validación y control de calidad documental: comparación de la extracción del modelo con los datos de sistemas core para detectar discrepancias en avisos recibidos.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF Q4_K_M y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar documentos financieros confidenciales a servicios externos.
- Investigación en document understanding: el adaptador LoRA y el conjunto de evaluación (24 documentos de test) permiten reproducir y comparar estrategias de ajuste fino multimodal en dominios financieros con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M de un modelo de ~34,7B parámetros ocupa aproximadamente 20-22 GB en disco; en memoria se requiere un margen adicional para el contexto y el proyector visual (mmproj F16). El adaptador LoRA en BF16 y el modelo base en precisión completa requieren mucha más memoria.
- GPU recomendadas: para el GGUF Q4_K_M, GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100). Para el adaptador LoRA con Transformers en BF16 se necesita al menos una GPU de 80 GB o varias GPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M y contexto moderado; en GPU de 16 GB probablemente no sin offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runners compatibles con GGUF; Transformers + PEFT para el adaptador LoRA.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Capital-Label-Qwen3.6-35B-A3B | 34,7B | no disponible | Apache 2.0 | GGUF, safetensors (LoRA) | Extracción de avisos financieros |
| Qwen/Qwen3.6-35B-A3B (base) | 34,7B | no disponible | Apache 2.0 | safetensors | Multimodal general |
| Otros finetunes de Qwen3.6 para document extraction | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó sobre solo 166 documentos de entrenamiento, un volumen muy reducido que puede provocar sobreajuste al formato y estilo de los avisos financieros del conjunto privado.
- El modelo está diseñado para funcionar con una instrucción de extracción exacta (`instruction.txt`); usarlo con otras instrucciones puede degradar gravemente la calidad de salida.
- La plantilla de chat del GGUF desactiva el modo thinking; forzar el modo thinking puede producir comportamientos no entrenados.
- El proyector visual impone límites de resolución (65.536–16.777.216 píxeles); imágenes fuera de ese rango pueden no procesarse correctamente.
- Los derechos de los documentos fuente del conjunto de entrenamiento permanecen con sus propietarios; la licencia Apache 2.0 cubre los pesos, no los datos.
- Riesgo de alucinación en campos no presentes en el documento: no se han publicado métricas de fidelidad ni de tasa de error en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se realizó presumiblemente en el idioma de los avisos financieros del dataset privado, sin confirmación.
- Para producción, conviene validar el modelo contra el conjunto de test de 24 documentos y establecer controles de calidad sobre las extracciones antes de automatizar decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AGCobra/Capital-Label-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/AGCobra/LFM-Finance-Dataset
- Commit de llama.cpp usado en la conversión: https://github.com/ggml-org/llama.cpp/commit/7071ba378afa96dcd69c41e1ec2b4912364dbee4
