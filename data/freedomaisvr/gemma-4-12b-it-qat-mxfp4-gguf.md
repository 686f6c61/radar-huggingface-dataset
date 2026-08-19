# FreedomAISVR/Gemma-4-12B-it-QAT-MXFP4-GGUF

## Resumen

Gemma-4-12B-it-QAT-MXFP4-GGUF es una cuantizacion hibrida del modelo oficial de Google `google/gemma-4-12B-it-qat-q4_0-unquantized`, preparada por FreedomAISVR. Este modelo pertenece a la cuarta generacion de la familia Gemma de Google DeepMind, lanzada en 2026, que incluye arquitecturas densas y de mezcla de expertos (MoE) con tamanos que van de 2.3B a 31B parametros.

La particularidad de este checkpoint es que combina dos estrategias de cuantizacion: los 329 tensores de pesos (atencion, FFN, embeddings) se conservan en Q4_0 tal como los entreno Google con Quantization-Aware Training (QAT), mientras que los 338 tensores de normas y sesgos (F32) se cuantizan a MXFP4. Este enfoque hibrido evita el error de requantizacion que degradaria la calidad visual del modelo, un problema comun cuando se re-cuantizan pesos QAT a otros formatos.

El resultado es un archivo GGUF de 6.39 GB que mantiene la calidad del Q4_0 original, soporta vision multimodal completa mediante el proyector QAT de Google (175 MB), y es compatible con el ecosistema llama.cpp. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opcion atractiva para despliegues en produccion con requisitos de memoria reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion multimodal unificada (vision y audio) |
| Parametros totales | 11.907.350.576 (~11.9B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 128.000 tokens (segun especificaciones de Gemma 4) |
| Tipos de cuantizacion | Q4_0 (pesos) + MXFP4 (normas y sesgos) |
| Idiomas soportados | Ingles, multilingue (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal) + mmproj GGUF para el proyector de vision |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, un checkpoint de la familia Gemma 4 de Google DeepMind. Gemma 4 introduce una arquitectura nativamente multimodal con encoders de vision y audio mejorados y un diseno unificado sin encoder para el procesamiento de entradas. El modelo de 12B es una variante densa de la familia, con 128K de contexto y un chat template nativo que incluye el token `<|think|>` para habilitar un modo de razonamiento explicito por defecto.

La innovacion principal de este checkpoint es el entrenamiento con Quantization-Aware Training (QAT), que adapta los pesos durante el entrenamiento para que sean resistentes a la cuantizacion Q4_0. Google entreno el modelo con un dataset de aproximadamente 9.2B de tokens (segun el informe tecnico de Gemma 4), incluyendo imagenes, audio y texto, y posteriormente lo afinaron con tecnicas de RLHF para mejorar el rendimiento en tareas de razonamiento y seguridad.

FreedomAISVR tomo este checkpoint QAT y aplico una cuantizacion hibrida: conserva los pesos Q4_0 tal como los entreno Google (evitando cualquier perdida de calidad por requantizacion) y cuantiza solo los tensores de norma y sesgo a MXFP4, un formato de 4 bits disenado para hardware Blackwell. El resultado es un archivo de 6.39 GB frente a los 6.65 GB del original, con una perdida de precision limitada a los tensores de menor impacto.

## Capacidades

- Generacion de texto y razonamiento: modelo instructivo de 12B parametros con capacidad de razonamiento multi-paso y modo de pensamiento explicito mediante el token `<|think|>`.
- Vision multimodal: soporta entrada de imagenes mediante el proyector QAT de Google (mmproj, 175 MB en BF16), manteniendo la calidad de reconocimiento de texto en imagenes que se pierde en cuantizaciones estandar.
- Soporte de tool calling y function calling: segun las especificaciones de Gemma 4, el modelo puede invocar herramientas externas y funciones definidas por el usuario.
- Capacidades de agente: el modelo puede realizar razonamiento multi-paso y encadenar llamadas a herramientas para resolver tareas complejas.
- Multilingue: aunque el entrenamiento principal es en ingles, la familia Gemma 4 soporta multiples idiomas con calidad razonable.
- Contexto largo: ventana de 128K tokens, adecuada para documentos extensos, historiales de conversacion largos y analisis de codigo completo.

## Casos de uso

- **Atencion al cliente automatizada**: con 128K de contexto, el modelo puede mantener conversaciones multi-turno con historial completo del usuario y documentacion de producto, ofreciendo respuestas coherentes sin perder el hilo. Su licencia Apache 2.0 permite integrarlo en sistemas comerciales sin royalties.
- **Analisis de documentos con imagenes**: el soporte multimodal permite procesar PDFs escaneados, capturas de pantalla o fotografias de documentos, extrayendo informacion textual y razonando sobre ella. La calidad Q4_0 preserva la legibilidad del texto en imagenes.
- **Generacion de codigo en produccion**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, revisar PRs o autocompletar funciones. El modo de pensamiento permite razonar sobre el contexto del proyecto antes de emitir codigo.
- **Asistentes de desarrollo con vision**: el modelo puede analizar capturas de pantalla de una interfaz de usuario y generar codigo HTML/CSS o explicar el comportamiento de una aplicacion a partir de su representacion visual.
- **Razonamiento sobre codigo base completo**: con 128K de contexto, puede cargar el contenido de un repositorio mediano completo y responder preguntas sobre arquitectura, dependencias o bugs potenciales.
- **Despliegue en edge con memoria limitada**: el archivo de 6.39 GB cabe en GPUs consumer de 8 GB VRAM con cuantizacion, permitiendo inferencia local en hardware de gama media para aplicaciones de escritorio o servidores de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion hibrida en la informacion disponible. Sin embargo, el modelo base Gemma 4 12B es un modelo de la familia Gemma 4, que segun el informe tecnico de Google muestra mejoras significativas sobre Gemma 3 en razonamiento, vision y codigo. La variante QAT de Google esta disenada para mantener la calidad del modelo original con cuantizacion Q4_0, y esta cuantizacion hibrida conserva exactamente los pesos Q4_0, por lo que el rendimiento deberia ser comparable al checkpoint QAT original.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF principal pesa 6.39 GB, mas 175 MB del proyector de vision. Con overhead de ejecucion y cache KV, se recomienda minimo 8 GB de VRAM para inferencia con contexto corto, y 12-16 GB para contexto largo (128K).
- **GPU recomendadas**: RTX 3060 12GB, RTX 4070 12GB, RTX 4080 16GB, RTX 4090 24GB, o cualquier GPU con soporte CUDA de 8GB o mas. En hardware Blackwell (B200, RTX 5090) el formato MXFP4 podria aprovechar aceleraciones nativas.
- **Cabe en consumer GPU**: si, con cuantizacion Q4_0 es viable en GPUs consumer de 8-12 GB para uso interactivo.
- **Opciones de despliegue**: llama.cpp (llama-server), Ollama (importando el GGUF), vLLM con soporte GGUF (si se convierte), o TGI. El README recomienda `llama-server -m gemma-4-12b-it-qat-mxfp4.gguf --mmproj mmproj-gemma-4-12b-it-qat.gguf -ngl 99`.
- **Latencia y throughput**: no se han publicado datos especificos. Para un modelo de 12B en Q4_0, se esperan latencias de 20-40 tokens/s en RTX 4090 y 10-20 tokens/s en GPUs de 8 GB, dependiendo del contexto y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Calidad Q4 | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-12B-it-QAT-MXFP4-GGUF (este) | 11.9B | 128K | Apache 2.0 | GGUF 6.39 GB | Alta (QAT) | Multimodal, vision y audio |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 11.9B | 128K | Apache 2.0 | safetensors F32 | Alta (QAT) | Checkpoint original, requiere cuantizacion propia |
| google/gemma-4-12B-it | 11.9B | 128K | Apache 2.0 | safetensors BF16 | Media (requiere cuantizacion manual) | Modelo base sin QAT, mas pesado |

La ventaja de esta variante es que mantiene los pesos Q4_0 exactos del checkpoint QAT de Google, mientras que una cuantizacion estandar de `gemma-4-12B-it` a Q4_0 introduciria un error de cuantizacion no compensado por el entrenamiento, resultando en peor perplejidad y calidad de vision.

## Limitaciones y advertencias

- **Sesgos conocidos**: como la familia Gemma en general, puede reflejar sesgos de los datos de entrenamiento (principalmente en ingles y contextos occidentales). No hay datos especificos sobre sesgos de esta variante.
- **Riesgo de alucinacion**: el modelo puede generar informacion falsa o inventar hechos, especialmente en tareas de razonamiento complejo. Se recomienda validar las salidas en produccion.
- **Limitaciones de contexto**: aunque soporta 128K tokens, el rendimiento degrada con contextos muy largos y el coste de cache KV es alto. La cuantizacion MXFP4 de las normas puede afectar a la estabilidad numerica en contextos extremos.
- **Idiomas**: el entrenamiento principal es en ingles; el rendimiento en otros idiomas es variable y no garantizado.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se debe incluir la atribucion y el aviso de licencia correspondiente. El modelo base de Google tiene una politica de uso aceptable que debe revisarse.
- **Caveat de cuantizacion**: la cuantizacion MXFP4 de las normas esta optimizada para hardware Blackwell; en GPUs de generaciones anteriores (Ampere, Ada) puede haber una ligera degradacion de rendimiento numerico.
- **Calidad de vision**: aunque se preservan los pesos Q4_0, la cuantizacion de las normas puede afectar a la precision del procesamiento de imagenes en casos limite. Se recomienda validar en el caso de uso especifico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-QAT-MXFP4-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized)
- [Pagina oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Blog de Google sobre QAT en Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [Informe tecnico de Gemma 4 (arXiv)](https://arxiv.org/pdf/2607.02770)
