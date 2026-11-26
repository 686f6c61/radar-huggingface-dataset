# mradermacher/Solar-Awakening-26B-A4B-i1-GGUF

## Resumen

Solar-Awakening-26B-A4B-i1-GGUF es una cuantizacion en formato GGUF del modelo Solar-Awakening-26B-A4B, publicada por el usuario mradermacher. El modelo base es un merge creado por Sorihon mediante mergekit, con un total de 25.971.339.550 parametros (aproximadamente 26B). La nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con unos 4B de parametros activos por token, aunque este dato no esta confirmado en la informacion disponible.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo mediante cuantizaciones GGUF de distinto tamano y calidad, incluyendo variantes con imatrix (calibracion basada en importancia) que mejoran la fidelidad respecto a las cuantizaciones estaticas. El repositorio incluye unicamente el fichero imatrix en la version i1; las cuantizaciones estaticas estan en un repositorio separado del mismo autor.

La model card indica que se trata de un modelo de vision ("This is a vision model"), por lo que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas. El idioma declarado es unicamente ingles. No se dispone de informacion sobre licencia ni sobre el pipeline de la libreria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre "A4B" sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.971.339.550 |
| Parametros activos | No disponible (posiblemente ~4B segun nomenclatura, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (el repositorio i1 contiene el fichero imatrix; las cuantizaciones estaticas estan en repositorio aparte) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La nomenclatura "26B-A4B" es coherente con un transformer de mezcla de expertos (MoE) con aproximadamente 26B de parametros totales y unos 4B activos por token, pero este extremo no se confirma en la informacion proporcionada. El modelo base es un merge generado con mergekit, lo que implica que se ha construido combinando los pesos de otros modelos en lugar de entrenarse desde cero con un corpus propio.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado no aporta informacion adicional sobre el proceso de entrenamiento del modelo original; se limita a describir las cuantizaciones generadas. El autor del cuantizado indica el uso de imatrix para las variantes i1, una tecnica que calibra la cuantizacion segun la importancia de cada peso y suele reducir la perplejidad respecto a las cuantizaciones estaticas de tamano similar.

## Capacidades

- Generacion de texto en ingles.
- Capacidades de vision segun la model card ("This is a vision model"), si bien los ficheros mmproj no estan incluidos en este repositorio i1.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en entornos con recursos limitados: las cuantizaciones de baja precision (Q2, IQ2, IQ3) permiten ejecutar un modelo de ~26B en hardware de consumo, aunque con perdida de calidad.
- Prototipado de aplicaciones de vision-lenguaje: el modelo base esta marcado como modelo de vision, por lo que podria usarse para tareas de descripcion de imagenes o VQA, siempre que se obtengan los ficheros mmproj del repositorio de cuantizaciones estaticas.
- Experimentacion con tecnicas de merge: util para investigadores que quieran evaluar el comportamiento de un modelo fusionado con mergekit frente a sus componentes originales.
- Generacion de texto en ingles en pipelines offline: con llama.cpp u Ollama se puede integrar en herramientas de escritorio sin dependencia de la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece multiples variantes (Q2 a Q6, IQ e imatrix) para medir el impacto de la cuantizacion en tareas concretas.
- Investigacion sobre eficiencia de MoE: si se confirma la arquitectura A4B, sirve para estudiar el equilibrio entre parametros totales y activos en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamano del repositorio (10,9 GB), las cuantizaciones de mayor precision rondarian esa cifra; las de menor precision serian considerablemente menores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para cuantizaciones bajas (Q2/IQ2/IQ3) en GPUs con 8-12 GB de VRAM, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idioma limitado al ingles; no se garantiza un rendimiento adecuado en castellano.
- Al ser un merge sin datos de entrenamiento publicos, el riesgo de sesgos y alucinaciones es dificil de evaluar.
- Las cuantizaciones de baja precision (Q2, IQ1, IQ2) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- El repositorio i1 contiene unicamente el fichero imatrix; para obtener cuantizaciones listas para usar hay que acudir al repositorio estatico del mismo autor.
- La funcionalidad de vision requiere ficheros mmproj que no estan en este repositorio.
- No hay informacion sobre la longitud de contexto efectiva, lo que impide planificar casos de uso con contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Solar-Awakening-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Solar-Awakening-26B-A4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Solar-Awakening-26B-A4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Solar-Awakening-26B-A4B-i1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
