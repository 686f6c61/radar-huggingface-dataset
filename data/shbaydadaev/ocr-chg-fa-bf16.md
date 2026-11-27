# shbaydadaev/ocr-chg-fa-bf16

## Resumen

OCR Chagatai-Persian (merged BF16) es un modelo de reconocimiento óptico de caracteres (OCR) de página completa especializado en documentos históricos escritos en chagatai y persa con grafía árabe. Lo desarrolla el usuario de Hugging Face shbaydadaev como un fine-tuning del modelo OCRia-1 de LlamaIndex, que a su vez deriva de Qwen3.5-4B de Alibaba Cloud. El modelo resuelve el problema de transcribir manuscritos históricos en lenguas de bajos recursos, devolviendo un objeto JSON estructurado con los campos `text`, `language` y `script`.

Técnicamente es un modelo multimodal image-text-to-text construido sobre la arquitectura `Qwen3_5ForConditionalGeneration`, con aproximadamente 5.175 mil millones de parámetros almacenados en pesos BF16 distribuidos en tres shards de safetensors. Se trata de la exportación autónoma del checkpoint LoRA-856 fusionado con el modelo base, por lo que no requiere cargar un adaptador separado en inferencia. El repositorio ocupa 10,4 GB.

Su relevancia radica en la escasez de herramientas OCR para lenguas históricas turcófonas y persas en escritura árabe, un nicho donde los modelos OCR generalistas rinden mal. El autor publica métricas de evaluación honestas (13,78 % CER, 36,34 % WER, 99 % JSON válido sobre 100 páginas de test) y advierte explícitamente de que la fusión del adaptador empeoró ligeramente los resultados respecto al adaptador sin fusionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión y decodificador híbrido) |
| Parámetros totales | 5.174.964.736 (~5,175 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó un corte de 10.240 tokens) |
| Tipos de cuantización | BF16 (pesos publicados); no se documentan otros formatos |
| Idiomas soportados | chg (chagatai), fa (persa); el prompt admite ar, mixed y und sin evaluación separada |
| Licencia | OCRia-1 Model and Code License (license_name: ocria-1-license, license: other) |
| Formato de pesos | safetensors (tres shards, BF16) |

## Arquitectura y entrenamiento

El modelo parte de OCRia-1 de LlamaIndex (snapshot `489f5fa8f63858545368b9aff44256bbea6e46bc`), derivado de Qwen3.5-4B. La arquitectura es un transformer multimodal con torre de visión, un módulo de fusión visual (visual merger) y un decodificador híbrido con dos tipos de capas. El autor aplicó un fine-tuning LoRA de rango 32, alpha 64 y dropout 0,05 sobre las proyecciones lineales de la torre de visión, el visual merger y ambos tipos de capas del decodificador, manteniendo congelados los pesos base. El entrenamiento usó cuatro épocas, tasa de aprendizaje 3e-5, batch efectivo de 16 en una sola GPU NVIDIA RTX PRO 6000 de 96 GB de VRAM y un corte de 10.240 tokens.

El conjunto de datos propio (`shbaydadaev/ocr-chg-fa-dataset`) contiene 3.423 páginas de entrenamiento, 583 de validación y 328 de test, con aproximadamente un 40 % de chagatai y un 60 % de persa en cada partición. La preparación restaura saltos de línea de manuscrito cuando están disponibles y aplica una normalización Unicode diplomática del proyecto. El checkpoint-856 registró la menor pérdida de validación (0,537773). La exportación se realizó con LLaMA-Factory usando `infer_dtype: bfloat16`, fusionando el adaptador en el modelo base.

## Capacidades

- Transcripción OCR de página completa de documentos históricos en chagatai y persa con escritura árabe.
- Salida estructurada en JSON con los campos `text`, `language` y `script` (por ejemplo, `{"text":"…", "language":"chg", "script":"Arab"}`).
- Clasificación de idioma a nivel de página entre chagatai (`chg`) y persa (`fa`).
- Procesamiento de imágenes de alta resolución: el presupuesto de imagen empleado en evaluación es de 4.194.304 píxeles.
- Generación de hasta 6.144 tokens nuevos por página.
- Modo conversacional con etiquetas de chat; el CLI desactiva el modo thinking (`enable_thinking=False`) y usa decodificación greedy.
- No se documentan capacidades de tool calling, agentes ni multi-step reasoning.
- No se documentan capacidades de audio ni visión general más allá del OCR de documentos.

## Casos de uso

- Digitalización de archivos históricos: el modelo transcribe páginas completas de manuscritos en chagatai y persa y devuelve JSON listo para ingerir en un pipeline de catalogación, reduciendo el trabajo manual de paleografía.
- Construcción de corpus lingüísticos: investigadores pueden procesar lotes de manuscritos para generar texto plano alineado con metadatos de idioma y escritura, útil para estudios de lingüística histórica turcófona y persa.
- Enriquecimiento de catálogos bibliotecarios: la salida JSON con `language` permite etiquetar automáticamente fondos documentales mixtos chagatai/persa sin clasificación manual previa.
- Búsqueda full-text sobre fondos manuscritos: una vez transcritas las páginas, el texto resultante habilita índices de búsqueda sobre colecciones que antes solo eran consultables por imagen.
- Investigación en humanidades digitales: el modelo sirve como componente OCR en proyectos de edición diplomática, dado que la preparación del dataset preserva saltos de línea de manuscrito y aplica normalización Unicode diplomática.
- Verificación asistida de transcripciones: el CLI imprime diagnósticos de parseo junto con la transcripción, lo que permite a revisores humanos detectar JSON inválido o banderas de repetición antes de aceptar una página.
- Prototipado de pipelines OCR especializados: al ser un export BF16 autónomo sin adaptador, se puede integrar directamente en entornos de transformers con `device_map="auto"` para pruebas de concepto.

## Benchmarks y rendimiento

Evaluación sobre las primeras 100 páginas del manifiesto de test (37 chagatai, 63 persa), con `enable_thinking=False`, `do_sample=False`, 6.144 tokens nuevos y presupuesto de imagen de 4.194.304 píxeles:

| Modelo | CER (espacios colapsados) | CER (saltos de línea conservados) | WER | JSON válido | Macro-F1 de idioma |
|---|---:|---:|---:|---:|---:|
| Base + adaptador checkpoint-856 | 11,99 % | 12,29 % | 34,72 % | 100 % | 100 % |
| Merged BF16 (este modelo) | 13,78 % | 14,07 % | 36,34 % | 99 % | 99,60 % |

Desglose por subconjunto del modelo fusionado:

| Subconjunto | Páginas | CER (espacios colapsados) | WER |
|---|---:|---:|---:|
| Chagatai | 37 | 12,62 % | 42,50 % |
| Persa | 63 | 14,27 % | 34,15 % |

El modelo fusionado empeoró un 1,80 % en CER y un 1,62 % en WER respecto al adaptador sin fusionar, produjo una respuesta JSON inválida y dos banderas de repetición. El autor advierte que son resultados de 100 páginas y no puntuaciones del test completo ni evidencia de equivalencia de la fusión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos de ~5,175 mil millones de parámetros en BF16 ocupan aproximadamente 10,4 GB; con caché KV y activaciones para imágenes de 4,19 megapíxeles y generación de hasta 6.144 tokens, se recomienda holgura adicional.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000 con 96 GB de VRAM (una sola GPU, batch efectivo 16).
- GPU recomendadas para inferencia: no se documentan explícitamente; por tamaño de pesos, cabría en GPUs consumer de 16 GB o más en BF16, aunque el autor no lo confirma.
- Opciones de despliegue: transformers con `device_map="auto"` mediante el CLI del proyecto `ocria-ocr-sft infer`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCR Chagatai-Persian (este modelo) | ~5,175 mil millones | no disponible | chg, fa | OCRia-1 License | Hugging Face |
| llamaindex/OCRia-1 (base) | no disponible | no disponible | no disponible | OCRia-1 License | Hugging Face |
| Qwen/Qwen3.5-4B (ancestro) | ~4 mil millones (según nombre) | no disponible | multilingüe general | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos OCR comparables en la información proporcionada, por lo que no es posible una comparación de rendimiento entre ellos.

## Limitaciones y advertencias

- La fusión del adaptador degradó la precisión: +1,80 puntos de CER y +1,62 de WER frente al adaptador sin fusionar sobre las mismas 100 páginas.
- Solo se evaluaron 100 páginas de test (37 chagatai, 63 persa); no hay puntuaciones del test completo ni evidencia de equivalencia de la fusión.
- El modelo fusionado generó una respuesta JSON inválida (99 % de validez) y dos banderas de repetición; se recomienda validar el JSON antes de uso downstream.
- El prompt admite las etiquetas `ar`, `mixed` y `und`, pero no hay evaluación separada para ellas; solo `chg` y `fa` están respaldados por datos de entrenamiento evaluados.
- El checkpoint-856 se eligió por menor pérdida de validación, no por precisión OCR; otros checkpoints no tienen evaluación generativa de validación completa.
- La licencia OCRia-1 incluye restricciones de uso y requisitos de distribución de derivados; no es Apache-2.0. Es obligatorio leer la licencia completa, incluido el Attachment A, antes de uso comercial o redistribución.
- El modelo es un derivado independiente de OCRia-1 y Qwen3.5-4B; no implica respaldo de LlamaIndex ni del equipo Qwen.
- No se documentan sesgos específicos, latencia ni comportamiento fuera del dominio de manuscritos históricos chagatai/persa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shbaydadaev/ocr-chg-fa-bf16
- Dataset: https://huggingface.co/datasets/shbaydadaev/ocr-chg-fa-dataset
- Repositorio del proyecto y CLI: https://github.com/shbaydadaev/OCR-chg-fa
- Prompt de reconocimiento: `prompts/t2_recognition_system.txt` (dentro del repositorio del proyecto)
- Modelo base OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Modelo ancestro Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia OCRia-1: `LICENSE` (en el repositorio del modelo)
- Aviso de atribución: `NOTICE` (en el repositorio del modelo)
