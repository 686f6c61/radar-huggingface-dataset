# prithivMLmods/Qwen3.6-27B-NVFP4-GGUF

## Resumen

Qwen3.6-27B-NVFP4-GGUF es una cuantización en formato GGUF con compresión NVFP4 del modelo Qwen3.6-27B de Alibaba (equipo Qwen), publicada por el usuario prithivMLmods en Hugging Face. El modelo base es un modelo denso de 27.320.698.242 parámetros, multimodal (image-text-to-text), con un codificador de visión integrado, 64 capas y una ventana de contexto nativa de 262K tokens ampliable a más de 1M mediante YaRN.

La relevancia de esta versión cuantizada radica en el formato NVFP4, optimizado para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300). Además, los ficheros GGUF incorporan Multi-Token Prediction (MTP), una extensión del formato que integra la decodificación especulativa directamente en los pesos del modelo, con cabezas de salida adicionales que predicen varios tokens futuros por pasada, eliminando la necesidad de un modelo draft separado.

Según la model card, Qwen3.6-27B destaca en código agéntico, razonamiento a nivel de repositorio y desarrollo frontend, superando al anterior buque insignia Qwen3.5-397B-A17B en SWE-bench Verified (77,2), Terminal-Bench (59,3) y SkillsBench (48,2). Se publica bajo licencia Apache 2.0 y es especialmente adecuado para inferencia local en hardware Blackwell mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con codificador de visión integrado (64 capas); detalles completos no disponibles |
| Parametros totales | 27.320.698.242 (27,3B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, ampliables a más de 1M vía YaRN (en la prueba publicada se usaron 16.384) |
| Tipos de cuantizacion | NVFP4 (28,2 GB); KV cache q8_0 en la prueba |
| Idiomas soportados | Inglés (etiquetado en la ficha); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4) + fichero mmproj de 931 MB para la proyección multimodal |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27,3B parámetros con 64 capas y un codificador de visión integrado, lo que le permite procesar entradas de imagen y texto (pipeline image-text-to-text). Soporta modos de pensamiento híbridos (hybrid thinking) que preservan el razonamiento a lo largo de flujos de trabajo multi-turno, y decodificación especulativa mediante MTP. La ventana de contexto nativa de 262K tokens es ampliable a más de 1M mediante YaRN.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en la model card. En cuanto a esta publicación concreta, la cuantización NVFP4 se realizó con llama.cpp por prithivMLmods a partir de los pesos originales de Qwen/Qwen3.6-27B, comprimiendo los pesos a formato FP4 de NVIDIA para aprovechar la aceleración nativa de los Tensor Cores FP4 en GPUs Blackwell.

## Capacidades

- Generación de texto conversacional con modos de pensamiento híbridos que mantienen el razonamiento en flujos multi-turno.
- Comprensión de imágenes (visión integrada): OCR, descripción de imágenes y tareas image-text-to-text, verificada en las pruebas de la model card.
- Código agéntico y razonamiento a nivel de repositorio: 77,2 en SWE-bench Verified y 59,3 en Terminal-Bench según la model card.
- Desarrollo frontend, destacado como una de sus capacidades principales.
- Tool calling / function calling: 66,1% en BFCL-V4.
- Razonamiento científico: 87,8 en GPQA-Diamond.
- Decodificación especulativa MTP integrada en los pesos, que acelera la inferencia local sin modelo draft externo.
- Contexto muy largo (262K nativo, ampliable a 1M+) para procesar repositorios y documentos extensos.

## Casos de uso

- OCR y extracción de datos de documentos: el pipeline de visión con el fichero mmproj permite digitalizar imágenes escaneadas; en las pruebas publicadas procesa imágenes a unos 107 tokens/s de generación y 1.125 tokens/s de procesamiento de prompt.
- Agentes de código sobre repositorios completos: con 262K de contexto nativo y 77,2 en SWE-bench Verified, es adecuado para agentes que navegan, editan y depuran bases de código grandes.
- Desarrollo frontend asistido: generación de interfaces y componentes a partir de capturas o especificaciones, aprovechando su capacidad multimodal.
- Automatización de terminal: su puntuación de 59,3 en Terminal-Bench lo hace apto para agentes que ejecutan comandos y resuelven tareas en shell de forma multi-paso.
- Asistentes conversacionales con razonamiento persistente: los modos de pensamiento híbridos mantienen la cadena de razonamiento entre turnos, útil para soporte técnico complejo.
- Tool calling en pipelines de producción: con 66,1% en BFCL-V4 puede integrarse en flujos de function calling para orquestar APIs y herramientas.
- Análisis de documentos largos: la ventana ampliable a 1M+ tokens vía YaRN permite procesar informes, contratos o corpus extensos en una sola sesión.

## Benchmarks y rendimiento

Resultados del modelo base Qwen3.6-27B según la model card (sin comparativas adicionales publicadas en la información disponible):

| Benchmark | Resultado |
|---|---:|
| SWE-bench Verified | 77,2 |
| Terminal-Bench | 59,3 |
| SkillsBench | 48,2 |
| GPQA-Diamond | 87,8 |
| BFCL-V4 (tool calling) | 66,1% |

La model card indica que el modelo supera a Qwen3.5-397B-A17B en SWE-bench Verified, Terminal-Bench y SkillsBench, aunque no se proporcionan las cifras de dicho modelo.

Rendimiento de la cuantización NVFP4 en una RTX PRO 6000 Blackwell (96 GB), con llama-cli, offload completo y MTP (draft_n_max=2), contexto de 16.384 tokens:

| Metrica | Valor |
|---|---:|
| Procesamiento de prompt (media) | 1.125,92 tokens/s |
| Generación (media) | 107,06 tokens/s |
| Tiempo medio por imagen (OCR) | 17,18 s |
| Uso pico de VRAM | 28.217 MiB (27,56 GiB) |
| Utilización pico de GPU | 95% |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 28 GB para los pesos NVFP4 (28,2 GB el fichero principal + 931 MB el mmproj); en la prueba publicada el uso pico fue de 27,56 GiB con contexto de 16.384 tokens y KV cache q8_0.
- GPU recomendadas: aceleradores NVIDIA Blackwell con Tensor Cores FP4 nativos (RTX Pro 6000, serie RTX 50, B200, B300). En la prueba se usó una RTX PRO 6000 Blackwell Server Edition de 96 GB con offload completo de 99 capas.
- Consumer GPUs: en GPUs Blackwell de gama alta con al menos 32 GB de VRAM (por ejemplo RTX 5090 de 32 GB) los pesos cabrían justo, aunque con contexto limitado; en GPUs sin soporte FP4 nativo (Ampere, Ada, Hopper) el formato NVFP4 no se beneficia de la aceleración de hardware y puede no ser compatible según la versión de llama.cpp. No hay datos publicados para estas configuraciones.
- Despliegue: llama.cpp / llama-cli (verificado), con soporte adicional del modelo base para vLLM, SGLang y Unsloth. El repositorio está etiquetado para text-generation-inference y llama-cpp.
- Latencia y throughput: en RTX PRO 6000 Blackwell con MTP activado, 107,06 tokens/s de generación media y 1.125,92 tokens/s de procesamiento de prompt, con utilización de GPU del 95%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-NVFP4-GGUF (esta ficha) | 27,3B (denso) | 262K nativo, 1M+ con YaRN | Sí (visión) | Apache 2.0 | NVFP4 + MTP especulativo, optimizado para Blackwell |
| Qwen3.5-397B-A17B | 397B (MoE, 17B activos) | No disponible | No disponible | No disponible | Buque insignia anterior; superado por Qwen3.6-27B en SWE-bench Verified, Terminal-Bench y SkillsBench |
| Qwen3.6-27B (base) | 27,3B | 262K nativo | Sí | Apache 2.0 | Pesos originales sin cuantizar; soporta vLLM, SGLang, Unsloth |

No hay datos de benchmarks comparativos detallados de otros modelos de tamaño similar en la información disponible.

## Limitaciones y advertencias

- Idioma etiquetado como inglés; no hay información publicada sobre rendimiento en castellano u otros idiomas.
- El formato NVFP4 está diseñado para hardware Blackwell; en GPUs anteriores el rendimiento y la compatibilidad no están garantizados ni documentados.
- El rendimiento publicado corresponde a una configuración específica (RTX PRO 6000, contexto 16.384, MTP con draft_n_max=2); los resultados reales variarán según hardware, imagen, prompt y ajustes del runtime.
- La cuantización FP4 implica pérdida de precisión respecto a los pesos originales; no se han publicado evaluaciones del impacto de la cuantización sobre los benchmarks del modelo base.
- No se ha publicado información sobre sesgos conocidos ni tasas de alucinación del modelo.
- Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento factual; se recomienda verificación en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base Qwen/Qwen3.6-27B para atribuciones.
- La prueba de rendimiento se realizó con contexto de 16.384 tokens, muy por debajo del máximo nativo de 262K; el uso de contextos largos aumentará significativamente la VRAM necesaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.6-27B-NVFP4-GGUF
- Fichero principal (NVFP4): https://huggingface.co/prithivMLmods/Qwen3.6-27B-NVFP4-GGUF/blob/main/Qwen3.6-27B-NVFP4.gguf
- Fichero multimodal (mmproj): https://huggingface.co/prithivMLmods/Qwen3.6-27B-NVFP4-GGUF/blob/main/Qwen3.6-27B-NVFP4.mmproj.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Autor (cuantización): https://huggingface.co/prithivMLmods
- llama.cpp: https://github.com/ggml-org/llama.cpp
