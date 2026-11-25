# HDiffusion/not-gemini-nanov4-fast-preview-nov26

## Resumen

not-gemini-nanov4-fast-preview-nov26 es un modelo de lenguaje de tipo transformer publicado por el usuario HDiffusion en Hugging Face. Segun la model card, se trata de un modelo recuperado ("recovered") a partir de una version compilada para NPU y ligeramente calibrado, que el autor describe como "sparkling gemma4" y que funciona como un modelo Gemma 4 convencional bajo llama.cpp. El nombre y la descripcion sugieren un origen opaco: el autor afirma haberlo obtenido mediante ingenieria inversa de un binario compilado, sin detallar el proceso ni la procedencia de los pesos originales.

El modelo cuenta con aproximadamente 4.647 millones de parametros (4,65 mil millones) segun los metadatos de safetensors, y se distribuye unicamente en formato GGUF con un tamano de repositorio de 9,3 GB, lo que es coherente con pesos en precision de 16 bits o cuantizaciones de alta calidad. La licencia es "proprietary-research-only" (licencia: other), lo que restringe severamente su uso a investigacion y excluye explicitamente el uso comercial.

La relevancia de este modelo es principalmente practica y de nicho: ofrece un modelo de ~4,6B parametros ejecutable en dispositivo (on-device) mediante llama.cpp, con compatibilidad declarada con el ecosistema Gemma 4. Sin embargo, su procedencia no verificada, la ausencia de documentacion tecnica y las restricciones de licencia lo convierten en un artefacto de investigacion mas que en una opcion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (compatible con Gemma 4, segun la model card) |
| Parametros totales | 4.647.450.147 (~4,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye GGUF; no se detallan las variantes) |
| Idiomas soportados | no disponible |
| Licencia | proprietary-research-only (license: other) |
| Formato de pesos | GGUF (libreria: gguf; compatible con llama.cpp) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna mas alla de la afirmacion de que "funciona como un modelo gemma4 normal en llamacpp", lo que implica una estructura transformer compatible con la familia Gemma 4. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, no hay informacion disponible: se desconoce el numero de tokens, la composicion del dataset, si hubo fases de RLHF o DPO, ni el proceso de calibracion mencionado por el autor. La unica informacion relevante es que los pesos fueron "recuperados de una version compilada para NPU" y "ligeramente calibrados", sin que se documente la metodologia. El autor indica ademas que podria existir una version mayor que no pudo obtener, y que deliberadamente omite detalles para dificultar su replicacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" sugiere uso en dialogos.
- Compatibilidad con llama.cpp: puede ejecutarse con la herramienta estandar de inferencia GGUF.
- Ejecucion on-device: el tag "on-device" indica que esta pensado para entornos de recursos limitados.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion con modelos on-device: el modelo puede cargarse en llama.cpp sobre hardware de consumo para probar inferencia local de un modelo de ~4,6B parametros, util en prototipos de asistentes sin conexion.
- Investigacion sobre procedencia de modelos: dado su origen declarado como recuperado de un binario NPU, sirve como caso de estudio para analizar pesos derivados de compilados y sus implicaciones legales y tecnicas.
- Pruebas de compatibilidad con el ecosistema Gemma 4: permite validar si herramientas y plantillas de prompt disenadas para Gemma 4 funcionan con estos pesos.
- Evaluacion comparativa de cuantizaciones GGUF: al distribuirse en GGUF, puede emplearse para medir degradacion de calidad segun el nivel de cuantizacion en un modelo de ~4,6B.
- Docencia y demostraciones de inferencia local: adecuado para talleres donde se muestre el flujo completo de descarga, carga y generacion con llama.cpp en un portatil con GPU modesta.
- Analisis de seguridad y sesgos en modelos de origen no verificado: util para estudiar como se comportan pesos sin documentacion de entrenamiento en tareas sensibles, siempre dentro del marco de investigacion que permite la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4,65B parametros, en FP16 requeriria del orden de 9-10 GB, en cuantizacion de 8 bits unos 5-6 GB y en 4 bits unos 3-4 GB; estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponible. Por tamano, cabria esperar funcionamiento en GPUs de consumo con 8 GB o mas de VRAM en cuantizaciones bajas, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4-8 bits, sin datos verificados.
- Opciones de despliegue: llama.cpp es la opcion declarada; no se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| not-gemini-nanov4-fast-preview-nov26 | ~4,65B | no disponible | proprietary-research-only | GGUF | Origen no verificado, recuperado de NPU |
| Gemma 2 2B (Google) | ~2,6B | 8K | Gemma license | safetensors, GGUF | Modelo oficial, documentado |
| Gemma 2 9B (Google) | ~9,2B | 8K | Gemma license | safetensors, GGUF | Modelo oficial, mayor tamano |
| Qwen2.5 3B (Alibaba) | ~3,1B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa permisiva de tamano similar |

La comparativa se ofrece solo como referencia de categoria; no hay datos de rendimiento de este modelo que permitan una comparacion cuantitativa. Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales.

## Limitaciones y advertencias

- Procedencia no verificada: el autor declara que los pesos se recuperaron de un binario compilado para NPU, sin documentar el proceso ni la cadena de custodia, lo que impide auditar el entrenamiento.
- Licencia restrictiva: "proprietary-research-only" limita el uso a investigacion y excluye el uso comercial; ademas, al tratarse de pesos derivados de un producto de terceros, podria haber reclamaciones de propiedad intelectual.
- Ausencia de documentacion: no hay informacion sobre datos de entrenamiento, sesgos, idiomas, contexto o evaluaciones, lo que impide evaluar riesgos de forma rigurosa.
- Riesgo de alucinacion: desconocido y no medido; sin benchmarks no puede estimarse su fiabilidad.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto real y la cobertura linguistica.
- Idoneidad para produccion: baja; la falta de soporte, de actualizaciones y de garantias legales desaconseja su uso en entornos productivos.
- Posible inestabilidad: la "calibracion" mencionada por el autor no esta descrita, por lo que el comportamiento en tareas exigentes es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/HDiffusion/not-gemini-nanov4-fast-preview-nov26
- llama.cpp (motor de inferencia declarado): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales del autor.
