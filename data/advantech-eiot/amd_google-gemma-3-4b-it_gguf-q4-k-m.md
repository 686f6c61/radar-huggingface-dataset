# Advantech-EIOT/AMD_google-gemma-3-4b-it_GGUF-Q4-K-M

## Resumen

Este repositorio distribuye el modelo Gemma 3 4B instruction-tuned de Google en formato GGUF, cuantizado a Q4_K_M y acompanado de su proyector de vision en F16. Lo publica Advantech-EIOT como parte de su iniciativa AMD GenAI para ejecucion en CPU e iGPU sobre llama.cpp, orientada a plataformas con procesadores AMD Ryzen AI. Advantech no ha entrenado ni cuantizado el modelo: los ficheros son identicos byte a byte a los publicados por ggml-org, que a su vez los genero a partir de google/gemma-3-4b-it.

El modelo base es un transformer denso de 3.880.099.328 parametros (aproximadamente 3,9 mil millones), 34 capas y un tamano oculto de 2560, con una ventana de contexto de 128K tokens. Al estar en formato GGUF y en una cuantizacion de 4 bits, el fichero del modelo de lenguaje ocupa 2,49 GB, lo que lo hace viable en equipos de consumo y en SoCs con memoria unificada.

Su relevancia practica radica en que combina tres factores poco habituales en modelos de este tamano: capacidad multimodal (entrada de texto e imagen), contexto muy largo y un empaquetado listo para inferencia local eficiente. Es una opcion adecuada para prototipado rapido, despliegue en el borde y tareas de vision-lenguaje en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer denso), 34 capas, hidden size 2560 |
| Parametros totales | 3.880.099.328 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | GGUF (llama.cpp); ficheros `gemma-3-4b-it-Q4_K_M.gguf` (2,49 GB) y `mmproj-model-f16.gguf` (0,85 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B IT, un transformer denso de la familia Gemma 3 de Google, con 34 capas y dimension oculta de 2560. Acepta texto y, mediante el proyector multimodal incluido (`mmproj-model-f16.gguf`), tambien imagenes como entrada, produciendo texto como salida. La plantilla de chat esta embebida en los metadatos del GGUF.

Este repositorio concreto no aporta entrenamiento ni cuantizacion propios: los ficheros son copia sin modificaciones de ggml-org/gemma-3-4b-it-GGUF en la revision `d0976223747697cb51e056d85c532013931fe52e`, y los valores SHA-256 de `SHA256SUMS` coinciden con los publicados alli. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo original.

## Capacidades

- Generacion de texto conversacional en modo instruction-tuned (chat multi-turno).
- Comprension de imagenes (image-text-to-text) mediante el proyector de vision F16.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Razonamiento y respuesta a instrucciones en formato conversacional.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning explicitas: no disponible en la informacion proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener dialogos multi-turno con contexto largo (hasta 128K tokens) en equipos AMD Ryzen AI con CPU e iGPU, sin depender de la nube, gracias a su cuantizacion Q4_K_M de 2,49 GB.
- Descripcion y analisis de imagenes en el borde: con el proyector de vision F16 puede procesar capturas, documentos escaneados o fotos y generar descripciones o respuestas textuales, util en inspeccion industrial o accesibilidad.
- Extraccion de informacion de documentos largos: su ventana de 128K permite resumir o extraer datos de contratos, informes o transcripciones extensas en una sola pasada.
- Prototipado rapido de aplicaciones LLM: al estar en GGUF y ser compatible con llama.cpp, se integra facilmente en entornos de desarrollo para validar flujos de chat y vision antes de escalar a modelos mayores.
- Procesamiento por lotes en hardware modesto: el tamano reducido permite ejecutar tareas de clasificacion, resumen o generacion en serie sobre CPU/iGPU en estaciones de trabajo sin GPU dedicada.
- Educacion y experimentacion: sirve como base para practicas de cuantizacion, inferencia local y evaluacion de modelos multimodales en cursos y laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,49 GB para el modelo de lenguaje en Q4_K_M; sumar 0,85 GB si se usa el proyector de vision F16 (en torno a 3,3 GB en total).
- GPU recomendadas: no se especifican en la informacion; el repositorio esta orientado a CPU e iGPU de plataformas AMD Ryzen AI (referencia AMD P100).
- Cabe en GPU de consumo: si, dado el tamano (~3,3 GB con vision); cualquier GPU con al menos 4 GB de memoria libre deberia poder alojarlo, aunque la informacion no detalla modelos concretos.
- Opciones de despliegue: llama.cpp (objetivo principal declarado); otros motores compatibles con GGUF no se detallan en la informacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (Gemma 3 4B IT GGUF Q4_K_M) | 3,88 B | 128K | Si (texto + imagen) | Gemma Terms of Use | GGUF |
| google/gemma-3-4b-it (original) | 3,88 B | 128K | Si | Gemma Terms of Use | safetensors |
| ggml-org/gemma-3-4b-it-GGUF | 3,88 B | 128K | Si | Gemma Terms of Use | GGUF |

Rendimiento comparativo: no disponible. Otras alternativas de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; el modelo hereda los sesgos del Gemma 3 4B IT original.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se aportan evaluaciones especificas.
- Limitaciones de contexto o idioma: la ventana es de 128K tokens, pero el rendimiento efectivo en contextos muy largos no esta documentado; la lista de idiomas soportados no esta disponible.
- Restricciones de licencia: el uso esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es necesario revisar ambas antes de un uso comercial.
- Caveat de produccion: el repositorio no incluye entrenamiento ni ajuste propio; es una redistribucion de ficheros de terceros, por lo que las garantias y el soporte dependen del modelo original y de ggml-org.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en precision completa; conviene evaluar la calidad en la tarea concreta antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_google-gemma-3-4b-it_GGUF-Q4-K-M
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Ficheros GGUF de origen: https://huggingface.co/ggml-org/gemma-3-4b-it-GGUF
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
