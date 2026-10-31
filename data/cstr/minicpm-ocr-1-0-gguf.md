# cstr/MiniCPM-OCR-1.0-GGUF

## Resumen

MiniCPM-OCR-1.0 es un modelo de OCR multimodal desarrollado por OpenBMB, especializado en el reconocimiento de texto en imágenes (líneas, párrafos, tablas y documentos completos). Esta ficha corresponde a la conversión a formato GGUF publicada por el usuario cstr, pensada para el runtime nativo ggml de CrispEmbed. El modelo original combina un codificador de visión SigLIP con un decodificador de lenguaje de tipo Qwen3.5, con un total de aproximadamente 1.300 millones de parámetros.

Su relevancia radica en ofrecer un OCR ligero y de peso abierto (Apache 2.0) que puede ejecutarse localmente sin depender de APIs de pago, con conversiones F16 que reproducen exactamente los tokens generados por el modelo original en Transformers. Es útil para desarrolladores que necesitan extraer texto de documentos escaneados, capturas o tablas en entornos con recursos limitados. Cabe destacar que estos ficheros GGUF no son los de llama.cpp y no son cargables por ese runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (codificador de visión SigLIP + decodificador Qwen3.5) |
| Parametros totales | 1.300.434.160 (~1,3 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (publicada); F32 usada internamente como base de conversión; no hay variantes cuantizadas verificadas |
| Idiomas soportados | no disponible (las tareas de referencia incluyen al menos inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal típica de OCR: un codificador de visión basado en SigLIP procesa la imagen de entrada y un decodificador de lenguaje de la familia Qwen3.5 genera la transcripción de texto de forma autorregresiva. La conversión GGUF reutiliza la "gate" del decodificador Qwen3.5 en CrispEmbed, lo que confirma esa procedencia del decodificador.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, ni sobre técnicas de alineación como RLHF o DPO. En cuanto al proceso de conversión: los pesos BF16 en safetensors de la revisión `6796197bb3a8e224b2f64ae462bfbb3f8a15ac4b` se convirtieron a GGUF con cambio de nombre de tensores y casting BF16 a F32/F16 (los tensores unidimensionales como normas y sesgos permanecen en F32). No se entrenó, ajustó ni fusionó ningún peso. Las conversiones F32 y F16 reproducen exactamente los IDs de tokens del modelo original en Transformers 5.21.0 en los 5 casos de referencia (hasta 1024 tokens generados).

## Capacidades

- Reconocimiento de texto en líneas sueltas (tarea de referencia `line`)
- Transcripción de párrafos de texto (tarea de referencia `para-en`)
- Reconocimiento de texto en tablas (tarea de referencia `table`)
- Procesamiento de imágenes de documentos verticales/alargados (tarea de referencia `tall`)
- Reconocimiento de texto en imágenes pequeñas (tarea de referencia `tiny`)
- Generación condicionada por prompt de OCR (por ejemplo, `"Text Recognition:"`)
- Pipeline de imagen-a-texto (image-text-to-text), apto para uso conversacional según las etiquetas del repositorio

No hay información disponible sobre tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Digitalización de documentos escaneados: transcripción de párrafos y páginas completas a texto plano de forma local, sin enviar datos a servicios externos, adecuado para documentos sensibles.
- Extracción de tablas: reconocimiento de estructura tabular en imágenes de informes, facturas o papers, útil como paso previo a su importación en hojas de cálculo o bases de datos.
- OCR en dispositivos con recursos limitados: con ~1,3 B de parámetros y formato GGUF F16 (~2,6 GB), puede ejecutarse en CPU o en portátiles sin GPU dedicada mediante el runtime de CrispEmbed.
- Indexación de archivos de imágenes: transcripción masiva de capturas de pantalla o fotografías de texto para alimentar motores de búsqueda o sistemas RAG.
- Procesamiento de documentos verticales: manejo de imágenes alargadas (recibos, tickets, listas largas) gracias a la tarea de referencia `tall`.
- OCR en pipelines de datos: integración en flujos de preprocesamiento automatizados gracias a la interfaz de línea de comandos (`--ocr page.png`) y a la salida determinista (decodificación greedy con paridad exacta de tokens).
- Verificación de integridad en producción: los hashes SHA256 publicados por fichero permiten validar los pesos desplegados en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que las tareas de calidad a nivel de benchmark no han sido verificadas; solo se ha validado la paridad exacta de IDs de token frente al modelo original en Transformers en 5 casos de referencia (19, 63, 56, 279 y 3 tokens generados respectivamente).

## Requisitos de hardware

- VRAM / memoria estimada: el fichero F16 ocupa 2.612.763.136 bytes (~2,6 GB), por lo que se necesita al menos ~3 GB de RAM o VRAM para alojar los pesos, más memoria para el contexto y la imagen.
- GPU recomendadas: no disponible; el runtime de CrispEmbed se ha validado en CPU (decodificación greedy). Los backends de GPU no están verificados.
- Consumer GPUs: al ocupar ~2,6 GB en F16, cabría con holgura en GPUs de gama media y alta (por ejemplo, una RTX 3060 de 12 GB o superior), aunque no hay validación publicada.
- Opciones de despliegue: exclusivamente el runtime nativo de CrispEmbed (`crispembed`), activando el soporte experimental con las variables de entorno `CRISPEMBED_MINICPM_OCR=1` y `CRISPEMBED_QWEN35_OCR=1`. Importante: estos GGUF no son cargables por llama.cpp, ni se ha documentado soporte en Ollama, vLLM o TGI. Para esos runtimes, usar el modelo original en safetensors o los GGUF oficiales de `openbmb/MiniCPM-OCR-1.0-gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0 (original, OpenBMB) | ~1,3 B | safetensors (BF16) | Apache 2.0 | Transformers | Modelo base de esta conversión |
| MiniCPM-OCR-1.0 GGUF (cstr, esta ficha) | ~1,3 B | GGUF F16 | Apache 2.0 | CrispEmbed (ggml nativo) | Paridad exacta de tokens verificada en CPU |
| MiniCPM-OCR-1.0-gguf (openbmb) | ~1,3 B | GGUF | Apache 2.0 | llama.cpp | Variante oficial para llama.cpp, distinta de esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El soporte de MiniCPM-OCR en CrispEmbed es experimental y está desactivado por defecto; requiere activación explícita por variables de entorno.
- Solo se publican precisiones sin cuantizar (F16/F32): no existe ninguna variante cuantizada con recibo de precisión exacta de tokens verificado.
- La paridad exacta se ha validado únicamente en CPU con decodificación greedy y en 5 casos de referencia; los backends de GPU, documentos multipágina y prompts distintos de las tareas de referencia no están verificados.
- No hay benchmarks de calidad publicados para el modelo ni para la conversión, por lo que su precisión real en dominios concretos debe evaluarse por el usuario.
- La longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Riesgo de alucinación: al ser un modelo generativo, puede inventar caracteres o palabras en imágenes de baja calidad; no hay datos que cuantifiquen este riesgo.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio del modelo original no incluye fichero LICENSE ni NOTICE; la licencia se toma del repositorio de código upstream de OpenBMB.
- Sesgos conocidos: no disponibles.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/cstr/MiniCPM-OCR-1.0-GGUF
- Modelo original: https://huggingface.co/openbmb/MiniCPM-OCR-1.0 (revisión fijada: `6796197bb3a8e224b2f64ae462bfbb3f8a15ac4b`)
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Licencia upstream: https://github.com/OpenBMB/MiniCPM-OCR/blob/8a16a6ad007b1105ac7811ab238808587615e4c7/LICENSE
- Organización OpenBMB en HuggingFace: https://huggingface.co/openbmb
