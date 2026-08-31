# enclavelabs/enclave-scribe-devanagari

## Resumen

EnclaveScribe Devanagari es un adaptador LoRA desarrollado por Enclave Labs que añade capacidad de transcripción OCR para escritura devanagari al modelo base `allenai/olmOCR-2-7B-1025`, un fine-tuning de Qwen2.5-VL-7B realizado por Allen AI para OCR de documentos en inglés. El modelo base es incapaz de leer devanagari y alucina descripciones verbales en inglés en lugar de transcribir; este adaptador corrige ese comportamiento con solo ~95 millones de parámetros entrenables (~1,1 % del total).

El adaptador se entrenó sobre 28 824 muestras de palabras individuales en devanagari del dataset `himalaya-ai/devanagari_ocr_dataset`, cubriendo hindi, maratí, sánscrito, nepalí y pali, con una mezcla de texto impreso y manuscrito (IIT-Indic-HW). En una evaluación held-out de 500 muestras, reduce el Character Error Rate de 16,26 a 0,174 (mejora de ~93×) y el Word Error Rate de 22,64 a 0,468 (48×), con una latencia 2× menor. Está publicado con licencia MIT y forma parte del proyecto EnclaveScribe, un sistema OCR autohospedable orientado a lenguas índicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B (vision-language transformer) con adaptador LoRA |
| Parametros totales | 8,4 B (modelo base) + ~95 M entrenables en el adaptador |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 1025 tokens de contexto visual, pero no se especifica para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16; el base puede cuantizarse) |
| Idiomas soportados | Hindi (hi), maratí (mr), sánscrito (sa), nepalí (ne), pali |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/olmOCR-2-7B-1025`, que es un fine-tuning de Qwen2.5-VL-7B para OCR de documentos en inglés. La arquitectura subyacente es un transformer vision-language con codificador visual y decodificador autoregresivo. El adaptador LoRA se aplica con rango 32, alpha 64 y dropout 0, lo que añade ~95 millones de parámetros entrenables sobre los 8,4 B del modelo base.

El entrenamiento se realizó durante 1 época (901 pasos) con un lote efectivo de 32, usando precisión bf16, kernel Liger y gradient checkpointing. El optimizador fue AdamW con programación coseno y tasa de aprendizaje 1,5e-4, con 27 pasos de calentamiento. Se empleó una única GPU NVIDIA A10G de 24 GB (instancia AWS g5.xlarge) durante 8,7 horas, con un coste total de aproximadamente 12 dólares. Los datos de entrenamiento consisten en 28 824 recortes de palabras individuales en devanagari, mezclando texto impreso y manuscrito.

## Capacidades

- Transcripción OCR de imágenes con texto devanagari a Unicode, cubriendo hindi, maratí, sánscrito, nepalí y pali.
- Manejo de texto impreso y manuscrito (aunque el rendimiento con escritura a mano varía según el estilo del autor).
- Integración con el pipeline de agentes de EnclaveScribe para procesamiento de páginas completas (rasterización y ajuste de configuración de generación).
- Generación determinista con `do_sample=False` y `repetition_penalty=1.1` para evitar bucles degenerativos.
- Compatible con el ecosistema HuggingFace Transformers y PEFT, permitiendo carga directa con `PeftModel.from_pretrained`.
- No soporta tool calling ni razonamiento multi-paso; es un modelo puramente de transcripción de imágenes.

## Casos de uso

- Digitalización de documentos administrativos en hindi: el adaptador transcribe formularios, certificados y cartas escaneadas en devanagari a texto Unicode, permitiendo su indexación y búsqueda en sistemas documentales.
- Transcripción de manuscritos sánscritos y pali: bibliotecas digitales y proyectos de preservación cultural pueden convertir imágenes de manuscritos antiguos en texto editable, con una tasa de error de carácter del 17,4 % en muestras held-out.
- OCR para aplicaciones móviles de traducción: integrado en una app que captura texto devanagari de carteles, menús o libros, el modelo devuelve la transcripción que luego se puede traducir a otros idiomas.
- Procesamiento de formularios nepalíes y maratíes: en entornos gubernamentales o empresariales, el adaptador extrae texto de formularios impresos en estos idiomas, reduciendo la entrada manual de datos.
- Automatización de archivos de prensa en devanagari: periódicos y revistas digitalizadas pueden convertirse a texto plano para análisis de contenido o entrenamiento de modelos de lenguaje.
- Sistema OCR autohospedable para organizaciones con requisitos de soberanía de datos: al ser MIT y ejecutarse localmente, permite procesar documentos sensibles sin enviarlos a servicios en la nube, como propone el proyecto EnclaveScribe.

## Benchmarks y rendimiento

Resultados declarados por el autor en una muestra held-out de 500 ejemplos del dataset `himalaya-ai/devanagari_ocr_dataset` (no verificados de forma independiente):

| Metrica | Modelo base (olmOCR-2-7B) | Adaptador EnclaveScribe | Mejora |
|---|---:|---:|---:|
| Character Error Rate (CER) ↓ | 16,26 | 0,174 | ~93× |
| Word Error Rate (WER) ↓ | 22,64 | 0,468 | 48× |
| F1 ↑ | 0,013 | 0,534 | 41× |
| Latencia | 1,75 s/muestra | 0,84 s/muestra | 2× más rápido |

El modelo base no puede leer devanagari y genera descripciones verbales en inglés, lo que explica su alta tasa de error y mayor latencia (genera más tokens). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el adaptador está especializado exclusivamente en OCR.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa ~0,4 GB, pero el modelo base de 7B en bf16 requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización a 8 bits o 4 bits, puede reducirse a ~8-10 GB.
- GPU recomendadas: NVIDIA A10G (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100. En consumer GPUs con 16 GB o más (RTX 4080, RTX 3090) es viable con cuantización.
- Opciones de despliegue: Transformers + PEFT (carga directa con `PeftModel`), vLLM (con soporte para adaptadores LoRA), o el pipeline de agentes de EnclaveScribe para páginas completas.
- Latencia: 0,84 s por muestra en la GPU de entrenamiento (A10G), según los datos del autor. El throughput depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos OCR especializados en devanagari en la información proporcionada. La comparativa directa disponible es con el modelo base:

| Modelo | Parametros | Contexto | CER (devanagari) | WER | Licencia |
|---|---:|---:|---:|---:|---|
| olmOCR-2-7B-1025 (base) | 8,4 B | 1025 tokens | 16,26 | 22,64 | Apache 2.0 (según Allen AI) |
| EnclaveScribe Devanagari (adaptador) | 8,4 B + 95 M LoRA | No disponible | 0,174 | 0,468 | MIT |

No se han encontrado comparaciones con otros adaptadores o modelos OCR para devanagari (como TrOCR fine-tuneado o modelos específicos de Google) en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con recortes de palabras individuales: el rendimiento en páginas completas o líneas largas es significativamente peor. Para documentos de página completa se recomienda usar el pipeline de agentes de EnclaveScribe.
- Bucles de generación: sin `repetition_penalty ≥ 1.1`, el modelo puede entrar en bucles degenerativos que emiten tokens `<tool_call>` hasta agotar `max_new_tokens`. Es obligatorio configurar este parámetro en producción.
- Regresión en inglés no medida formalmente: aunque pruebas cualitativas sugieren que el inglés se conserva, no hay un benchmark formal que lo verifique.
- Rendimiento variable con escritura a mano: los datos de entrenamiento incluyen muestras manuscritas de IIT-Indic-HW, pero la precisión depende del estilo caligráfico del autor.
- Limitado a la familia devanagari: no soporta tamil, telugu, kannada, bengalí, guyaratí, punyabí ni otros scripts índicos.
- Riesgo de alucinación: en imágenes ambiguas o de baja calidad, el modelo puede generar transcripciones incorrectas sin indicar incertidumbre.
- Licencia MIT permite uso comercial sin restricciones, pero el modelo base (olmOCR-2-7B) tiene su propia licencia que debe verificarse para cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enclavelabs/enclave-scribe-devanagari
- Repositorio del proyecto EnclaveScribe: https://github.com/Enclave-Labs-Inc/enclave-scribe
- Dataset de entrenamiento: https://huggingface.co/datasets/himalaya-ai/devanagari_ocr_dataset
- Modelo base: https://huggingface.co/allenai/olmOCR-2-7B-1025
- Organización Himalaya AI: https://www.himalayaai.org/
