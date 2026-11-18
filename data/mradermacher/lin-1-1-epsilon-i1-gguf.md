# mradermacher/Lin-1.1-Epsilon-i1-GGUF

## Resumen

Lin-1.1-Epsilon-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Lin-1.1-Epsilon, publicada por el usuario mradermacher bajo su pipeline habitual de conversion y cuantizacion (sufijo "i1", que indica uso de importance matrix o pesos ponderados). El modelo base lo desarrolla LindotAI, segun se desprende del enlace al repositorio original incluido en la model card. El repositorio no incluye model card descriptiva, licencia, idiomas ni pipeline declarados, por lo que la mayor parte de la informacion tecnica sobre el modelo original no esta disponible en la fuente consultada.

El dato mas relevante que si aparece es el recuento de parametros en safetensors: 493.704. Esta cifra, tal cual, resulta anomala para un modelo de lenguaje (seria inferior a un millon de parametros), por lo que probablemente corresponde a un recuento truncado o a un campo mal poblado en los metadatos. El tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos aun no se han subido o que la informacion esta incompleta. El repositorio se creo y actualizo el 18 de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es, por tanto, limitada y de caracter preliminar: se trata de un artefacto de cuantizacion recien publicado, sin validacion publica ni documentacion asociada. Se recomienda tratar cualquier dato no confirmado como no disponible y verificar el repositorio original de LindotAI antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 493.704 (segun metadatos safetensors; cifra probablemente incompleta o erronea) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Lin-1.1-Epsilon: la model card del repositorio GGUF unicamente contiene metadatos del proceso de cuantizacion y un enlace al repositorio original de LindotAI. No hay datos sobre tipo de transformer, uso de mezcla de expertos, atencion lineal, estado recurrente ni sobre el numero de tokens de entrenamiento, composicion del dataset o fases de alineacion (RLHF, DPO u otras).

Lo unico documentado es el proceso de cuantizacion: el autor indica que se trata de cuantizaciones "weighted/imatrix", es decir, generadas con una importance matrix que pondera la precision de cada tensor segun su impacto en la perplejidad. Los metadatos internos confirman `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica que la conversion parte de pesos en formato Hugging Face y que el tensor de salida tambien se cuantiza. No se ha aplicado ningun recorte del proyector multimodal (`skip_mmproj` vacio), aunque no consta que el modelo base tenga componente de vision.

## Capacidades

- Generacion de texto: no confirmada explicitamente, pero implicita en un modelo de lenguaje cuantizado en GGUF.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Compatibilidad con llama.cpp y derivados: si, por el formato GGUF y el conjunto de cuantizaciones publicado (incluye tipos IQ y K-quants).

## Casos de uso

- Evaluacion local en hardware de consumo: las cuantizaciones Q2_K, IQ2 e IQ3 permiten probar el modelo en equipos con poca VRAM o RAM, aunque con perdida de calidad respecto al modelo original. Adecuado para experimentacion, no para produccion.
- Despliegue en CPU con llama.cpp: los ficheros GGUF se pueden cargar directamente en llama.cpp, lo que permite ejecutar el modelo sin GPU para tareas de prueba o prototipado.
- Integracion en Ollama o LM Studio: al ser GGUF, las cuantizaciones Q4_K_M o Q5_K_M son candidatas habituales para estos entornos de escritorio, siempre que se valide antes la calidad del modelo base.
- Comparacion de precision entre cuantizaciones: el amplio conjunto publicado (desde IQ1_M hasta Q6_K) permite medir la degradacion de perplejidad a distintas tasas de bits, un uso tipico de los repositorios de mradermacher.
- Fine-tuning o destilacion sobre el modelo base: solo tiene sentido partiendo del repositorio original de LindotAI en safetensors, no de estas cuantizaciones.
- Pruebas de pipeline de cuantizacion: util como referencia para validar herramientas de conversion HF a GGUF con importance matrix, dado que el autor documenta los metadatos del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, porque el recuento de parametros de los metadatos (493.704) es inconsistente con un modelo de lenguaje utilizable. La estimacion depende del tamano real del modelo base, que no consta.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no se puede determinar sin el tamano real; el rango de cuantizaciones (desde IQ1_M hasta Q6_K) sugiere que el autor cubre tanto escenarios de VRAM muy limitada como de mayor precision.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no consumen GGUF de forma nativa para este tipo de artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la arquitectura, el tamano real y el rendimiento del modelo base Lin-1.1-Epsilon.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible consultar el repositorio original de LindotAI.
- Metadatos inconsistentes: el recuento de parametros (493.704) y el tamano del repositorio (0.0 GB) no cuadran con un modelo desplegable, lo que indica informacion incompleta o erronea.
- Riesgo de alucinacion: desconocido, al no haber evaluaciones publicadas.
- Idiomas: no declarados; no se puede garantizar calidad en castellano ni en ningun otro idioma.
- Cuantizaciones de muy baja precision (IQ1_M, IQ1_S, IQ2_XXS): degradacion severa esperable; no recomendadas para tareas que requieran exactitud.
- Cero descargas y cero likes: sin validacion por parte de la comunidad en el momento de la consulta.
- Fecha de publicacion futura respecto a la mayoria de referencias: verificar que el repositorio y el modelo base siguen disponibles y son los definitivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lin-1.1-Epsilon-i1-GGUF
- Modelo base (segun la model card): https://huggingface.co/LindotAI/Lin-1.1-Epsilon
