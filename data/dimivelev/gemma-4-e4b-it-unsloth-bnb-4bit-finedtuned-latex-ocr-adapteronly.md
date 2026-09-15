# dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-finedtuned-latex-ocr-adapteronly

## Resumen

El modelo `dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-finedtuned-latex-ocr-adapteronly` es un ajuste fino publicado por el usuario dimivelev sobre el modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de una variante instruct de la familia Gemma 4. Por el nombre del repositorio, el ajuste está orientado a OCR de LaTeX, es decir, a la transcripción de expresiones matemáticas o fórmulas a código LaTeX, y el sufijo "adapteronly" sugiere que el repositorio contiene únicamente el adaptador (probablemente LoRA) y no los pesos completos del modelo. Esta interpretación se deduce del nombre y no está confirmada de forma explícita en la model card.

Se trata de un modelo muy reciente (creado el 15 de septiembre de 2026), con cero descargas y cero "likes" en el momento de la consulta, por lo que no cuenta todavía con validación de la comunidad ni con resultados publicados. La información disponible en su model card es mínima: únicamente indica el autor, la licencia Apache 2.0, el modelo base del que parte y que fue entrenado con Unsloth. Los datos específicos de arquitectura, tamaño y contexto del modelo base no se detallan en la documentación facilitada.

Su relevancia es limitada pero concreta: si funciona según lo esperado, resultaría útil para convertir imágenes de fórmulas a LaTeX, una tarea recurrente en digitalización de apuntes, artículos académicos y documentación técnica. No obstante, la ausencia de benchmarks, de ejemplos y de datos de entrenamiento obliga a tratarlo como un experimento sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card; hereda la del modelo base Gemma 4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (bitsandbytes, segun el nombre del modelo base); no se documentan otras opciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo ni los datos de entrenamiento. Por el nombre del repositorio se deduce que parte de una variante Gemma 4 "E4B" en version instruct ("it"), previamente cuantizada a 4 bits mediante bitsandbytes ("bnb-4bit") dentro del ecosistema Unsloth, y que sobre ella se ha aplicado un ajuste fino adicional con TRL (etiqueta "trl"). El sufijo "adapteronly" apunta a que solo se distribuye el adaptador resultante, no los pesos fusionados, aunque esto no se confirma en el texto de la model card.

El único dato técnico declarado por el autor es que el entrenamiento se realizó con Unsloth y que, según la propia herramienta, fue "2x más rápido". No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni la estrategia de ajuste (LoRA, QLoRA, etc.). El repositorio ocupa 0,1 GB, un tamaño compatible con un adaptador pequeño, lo que respalda la hipótesis del "adapter only", pero no permite deducir la magnitud real del ajuste.

## Capacidades

- OCR de LaTeX (inferido del nombre): conversión de imágenes de fórmulas o expresiones matemáticas a código LaTeX. No está confirmado ni documentado en la model card.
- Generación de texto: heredada del modelo base instruct, aunque sus capacidades concretas no se detallan.
- Idiomas: únicamente inglés según la etiqueta "language: en"; no se declara soporte multilingüe.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo "thinking", visión, audio): no disponible. El nombre sugiere entrada de imagen (OCR), pero no se confirma.

## Casos de uso

- Digitalización de apuntes matemáticos: convertir fotografías de fórmulas manuscritas o impresas en código LaTeX editable, útil para estudiantes e investigadores que necesiten reutilizar material en editores como Overleaf.
- Conversión de artículos académicos: extraer ecuaciones de PDFs escaneados y transformarlas a LaTeX para su reutilización en publicaciones o repositorios.
- Generación de documentación técnica: incorporar fórmulas en manuales o wikis a partir de capturas de pantalla, reduciendo el trabajo manual de transcripción.
- Preparación de datasets científicos: procesar grandes volúmenes de imágenes de ecuaciones para construir corpus de entrenamiento en formato LaTeX.
- Accesibilidad: transcribir fórmulas de materiales educativos a texto LaTeX para lectores de pantalla o formatos alternativos.
- Prototipos de OCR especializado: servir como punto de partida para pipelines de reconocimiento de contenido matemático, siempre que se valide previamente su precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo Gemma 4 E4B cuantizado a 4 bits suele requerir del orden de 2,5 a 4 GB para los pesos, más el espacio de activaciones y caché KV; si el repositorio es solo un adaptador, habría que cargar además el modelo base completo. Estas cifras son estimaciones derivadas del nombre, no datos confirmados.
- GPU recomendadas: no disponible. Por el tamaño sugerido, cabría esperar funcionamiento en GPUs de consumo, pero no hay confirmación.
- ¿Cabe en GPU de consumo?: probablemente sí en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070) si se cumplen las estimaciones anteriores, pero no está verificado.
- Opciones de despliegue: la etiqueta "text-generation-inference" y "transformers" indican compatibilidad con el ecosistema Hugging Face Transformers y TGI. No se documenta soporte para vLLM, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. El modelo no publica especificaciones, benchmarks ni métricas, lo que impide contrastarlo con alternativas de OCR de LaTeX (como LaTeX-OCR/pix2tex, Nougat o GOT-OCR2.0) ni con otros derivados de Gemma 4. Cualquier comparación sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| gemma-4-e4b-it-unsloth-bnb-4bit-finedtuned-latex-ocr-adapteronly | no disponible | no disponible | apache-2.0 | sin benchmarks publicados |
| Alternativas de OCR de LaTeX | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe arquitectura, datos de entrenamiento, hiperparámetros ni evaluación, lo que dificulta reproducir o confiar en el resultado.
- Sin benchmarks ni ejemplos: no hay evidencia pública de precisión en OCR de LaTeX.
- Modelo sin validación: cero descargas y cero "likes" en la fecha de consulta.
- Solo adaptador (probable): si el repositorio contiene únicamente el adaptador, será necesario cargar el modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit` para poder usarlo.
- Cuantización a 4 bits: la cuantización bnb-4bit del modelo base puede degradar la precisión frente a los pesos originales en precisión completa.
- Idioma: únicamente inglés declarado; el comportamiento con otros idiomas no está garantizado.
- Licencia: aunque la etiqueta indica apache-2.0, el modelo deriva de la familia Gemma, cuyos términos de uso propios conviene revisar antes de un uso comercial en producción.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir fórmulas LaTeX sintácticamente válidas pero incorrectas respecto a la imagen de entrada; requiere validación humana.
- Sin garantías para producción: no hay información sobre estabilidad, latencia o tasa de error en escenarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-finedtuned-latex-ocr-adapteronly
- Modelo base: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondían a una empresa vinícola francesa y no guardan relación con el contenido de esta ficha.
