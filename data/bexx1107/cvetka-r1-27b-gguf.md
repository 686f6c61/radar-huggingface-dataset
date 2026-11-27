# Bexx1107/Cvetka-R1-27B-GGUF

## Resumen

Cvetka-R1-27B es un modelo multimodal esloveno desarrollado por Marko Kokol en colaboración con el CJVT (Centro de Recursos y Tecnologías del Lenguaje) de la Universidad de Liubliana. Este repositorio concreto, publicado por Bexx1107, ofrece una cuantización GGUF del checkpoint P20 del modelo original, pensada para inferencia local con `llama.cpp` e incluyendo el proyector visual (`mmproj`) necesario para tareas de imagen y OCR en esloveno. El modelo parte de un modelo donante Qwen (etiquetado internamente como `qwen3_5`) y sustituye su tokenizador por el tokenizador Micka-65k, diseñado para reducir aproximadamente un 30 % el número de tokens necesarios en texto esloveno.

El modelo cuenta con 25.024.290.304 parámetros (unos 25 000 millones), lo que justifica la denominación comercial de 27B. La arquitectura es un transformer híbrido de 64 capas que combina 48 capas de atención lineal con 16 capas de atención completa, una configuración orientada a reducir el coste computacional en contextos largos. El repositorio GGUF incluye dos ficheros: el decodificador de texto en cuantización Q4_K_M (14,38 GB) y el proyector multimodal en F16 (0,86 GB).

Su relevancia actual radica en dos factores: por un lado, cubre un hueco poco atendido, el procesamiento de alta calidad del esloveno con soporte de OCR y comprensión de imágenes; por otro, su empaquetado GGUF permite desplegarlo en GPUs de consumo y en entornos sin conexión. La licencia Apache 2.0 facilita su uso comercial, aunque con las cautelas propias de un modelo derivado de otro modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen35`: 64 capas (48 de atención lineal + 16 de atención completa) |
| Parámetros totales | 25.024.290.304 (~25 000 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 16384`) |
| Tipos de cuantización | Q4_K_M (decodificador de texto); F16 (proyector multimodal) |
| Idiomas soportados | esloveno (sl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`llama.cpp`); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas que alterna 48 capas de atención lineal con 16 capas de atención completa. Este diseño busca mantener la capacidad de modelado de la atención completa en puntos estratégicos de la red mientras reduce el coste cuadrático de la atención en la mayor parte de las capas, algo especialmente relevante para contextos largos. El modelo incorpora además un codificador visual y un proyector multimodal (`mmproj`) para el procesamiento de imágenes, lo que lo convierte en un modelo image-text-to-text.

El modelo se construye sobre un modelo donante Qwen (referido en la documentación como `Qwen/Qwen3.8-27B`) al que se le sustituye el tokenizador por el Micka-65k, un BPE personalizado que reduce en torno a un 30 % el número de tokens para texto esloveno, lo que se traduce en menor coste de inferencia y mayor contexto efectivo para ese idioma. La cuantización GGUF se generó con `convert_hf_to_gguf.py` (con la opción `--no-nextn`, dado que `mtp_num_hidden_layers = 0`) y `llama-quantize` (build `b12760`). El tokenizador personalizado se mapeó al pre-tokenizador `qwen35` y se verificó la paridad token a token frente al `AutoTokenizer` de Hugging Face sobre texto esloveno. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en esloveno e inglés.
- Comprensión de imágenes (image-text-to-text) mediante el proyector multimodal incluido.
- OCR en esloveno, según se indica explícitamente en la model card.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla Jinja propia).
- Capacidades multilingües limitadas a esloveno e inglés.
- Soporte de tool calling: no nativo. La plantilla Jinja oficial desactiva explícitamente los payloads `tools` de estilo OpenAI, por lo que el uso de herramientas debe gestionarse fuera del campo nativo.
- Modo thinking: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Digitalización de documentos eslovenos: el modelo puede procesar imágenes de documentos y extraer texto mediante OCR en esloveno, aprovechando el tokenizador Micka-65k para reducir el coste de procesar grandes volúmenes de texto.
- Atención al ciudadano en esloveno: despliegue de un asistente conversacional local con `llama-server` que responda en esloveno con calidad superior a la de modelos genéricos, gracias al tokenizador especializado.
- Procesamiento de formularios e imágenes administrativas: combinación de visión y texto para interpretar formularios escaneados y responder preguntas sobre su contenido en un entorno sin conexión.
- Investigación lingüística sobre esloveno: evaluación y experimentación con un modelo afinado para este idioma, útil para estudios de tokenización, rendimiento multilingüe y análisis de sesgos en lenguas de bajos recursos.
- Despliegue en hardware de consumo: al caber en GPUs de 16–24 GB en Q4_K_M con `-ngl 99`, es adecuado para prototipos locales, demos y entornos educativos sin infraestructura de servidor.
- Procesamiento por lotes de imágenes y texto en pipelines internos: integración vía API compatible con OpenAI que expone `llama-server`, útil para tareas de clasificación, resumen o extracción de información sobre material escaneado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el decodificador Q4_K_M ocupa 14,38 GB y el proyector multimodal F16 0,86 GB, lo que suma aproximadamente 15,3 GB de pesos; a ello hay que añadir la caché KV y el overhead del runtime.
- GPU de 16–24 GB: con `-ngl 99` se mantiene todo en VRAM, incluido el proyector multimodal.
- GPU de 11 GB (p. ej., RTX 2080 Ti): se recomienda `-ngl 35` con `--mmproj` o `-ngl 40` en modo solo texto, con offload híbrido GPU+CPU.
- GPU profesionales: A100 y H100 pueden alojar el modelo con holgura, aunque no se han publicado cifras de throughput ni latencia.
- Despliegue: `llama.cpp` (`llama-server`), con soporte de `--jinja`, `-fa on` (flash attention) y cuantización de caché KV (`-ctk q8_0 -ctv q8_0`). No se documentan opciones para vLLM, TGI u Ollama.
- Parámetros de muestreo recomendados: temperatura 0,0–0,2 (el script oficial usa decodificación greedy), frente al valor por defecto 1,0 de `llama-server`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cvetka-R1-27B (GGUF) | ~25 000 M | no disponible | sl, en | Apache 2.0 | GGUF |
| Qwen3.8-27B (modelo donante) | ~27 000 M (según denominación) | no disponible | multilingüe | no disponible | safetensors |
| Modelos eslovenos de propósito general | no disponible | no disponible | sl | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas. La comparación con el modelo donante se limita a la arquitectura y al tokenizador, no a resultados medidos.

## Limitaciones y advertencias

- Cobertura lingüística restringida a esloveno e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- El tool calling nativo está deshabilitado en la plantilla Jinja oficial, lo que limita su integración en pipelines de agentes que dependan del campo `tools` de estilo OpenAI.
- La licencia Apache 2.0 se aplica al repositorio GGUF, pero la model card remite a `DONOR_LICENSE.txt` y `TOKENIZER_LICENSE.txt` para las condiciones del modelo donante y del tokenizador; conviene revisarlas antes de un uso comercial.
- Es una cuantización comunitaria (Q4_K_M) del checkpoint P20; puede haber degradación de calidad respecto al modelo original en precisión completa.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El contexto máximo no está especificado; el ejemplo de despliegue usa 16 384 tokens, pero no debe asumirse como límite del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Bexx1107/Cvetka-R1-27B-GGUF
- Modelo base: https://huggingface.co/cjvt/Cvetka-R1-27B
- CJVT, Universidad de Liubliana: https://www.cjvt.si/
- Autor original, Marko Kokol: https://kokol.dev
