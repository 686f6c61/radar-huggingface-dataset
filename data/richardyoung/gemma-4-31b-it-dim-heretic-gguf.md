# richardyoung/gemma-4-31B-it-DiM-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-DiM-heretic-GGUF` es una cuantizacion GGUF del modelo `richardyoung/gemma-4-31B-it-DiM-heretic`, un derivado de la familia Gemma 4 de Google afinado con tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) para reducir los filtros de seguridad. El autor, richardyoung, publica unicamente la version cuantizada para su uso con llama.cpp y Ollama, no los pesos originales en precision completa.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 31B, coherente con la nomenclatura "31B-it") y esta orientado a generacion de texto conversacional en ingles. La variante "DiM" y el sufijo "heretic" hacen referencia al proceso de ablacion de la capa de rechazo, mientras que "it" indica que parte de una version instruction-tuned. El repositorio ocupa 68,1 GB, lo que refleja la presencia de multiples niveles de cuantizacion.

Es relevante ahora porque combina un modelo de tamano medio-grande (31B) con empaquetado GGUF listo para inferencia local, y porque el acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de la descarga. La licencia declarada es Apache 2.0, aunque al derivar de Gemma conviene verificar las condiciones reales de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4, transformer decoder-only segun la familia base; no confirmado en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo de 68,1 GB sugiere varios ficheros, pero no se detallan los niveles exactos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Por el identificador y el tamano (30,7B parametros), se trata de un transformer decoder-only de la familia Gemma 4 en su variante instruction-tuned, pero no se confirma en los datos disponibles si emplea atencion lineal, decodificacion especulativa u otras innovaciones de la familia. Tampoco se especifican el numero de tokens de entrenamiento ni la composicion del dataset.

El rasgo diferencial es el proceso de "abliteration" o "heretic": se eliminan o atenuan las direcciones de activacion asociadas al rechazo de peticiones, lo que reduce los filtros de seguridad del modelo original. El sufijo "DiM" no se explica en la informacion proporcionada. No consta si hubo RLHF, DPO o una fase adicional de ajuste tras la ablacion. La cuantizacion se ha realizado con imatrix (segun los tags), lo que suele mejorar la calidad de los pesos cuantizados respecto a una cuantizacion estandar.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones (variante "it", instruction-tuned).
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo base, por la ablacion aplicada.
- Compatible con llama.cpp y Ollama, lo que permite ejecucion local y despliegue en entornos sin GPU dedicada de gran capacidad.
- Endpoints compatibles (tag `endpoints_compatible`), lo que facilita su integracion en infraestructuras de inferencia tipo API.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de la capa de rechazo comparando respuestas frente al Gemma 4 original, en un entorno controlado y con fines academicos.
- Generacion de texto creativo sin restricciones tematicas: util para escritura de ficcion, guiones o narrativa donde los filtros estandar limitan el tono o el contenido, siempre con revision humana.
- Inferencia local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer de gama alta o incluso en CPU con cuantizaciones agresivas, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en ingles: su formato instruction-tuned y su empaquetado listo para Ollama permiten montar un chatbot funcional en minutos para pruebas internas.
- Evaluacion de cuantizaciones con imatrix: el repositorio sirve como referencia para medir la perdida de calidad entre niveles de cuantizacion en un modelo de 31B.
- Red teaming y pruebas de robustez: util para generar respuestas adversarias y evaluar la eficacia de los clasificadores de seguridad de un pipeline de produccion.
- Fine-tuning posterior sobre los pesos GGUF deconversacion: no recomendado directamente sobre GGUF; requeriria el modelo base en safetensors, que no se incluye en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 30,7B parametros en GGUF, una cuantizacion Q4_K_M ronda los 18-19 GB y una Q8 los 32-33 GB, aunque estos valores no constan en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar viabilidad en A100 40/80 GB, H100 y RTX 4090 (24 GB) con cuantizaciones bajas, pero no se confirma.
- Cabe en GPU consumer: probablemente en RTX 4090 y RTX 3090 con cuantizaciones de 4 bits, segun el tamano del modelo; no confirmado en la informacion.
- Opciones de despliegue: llama.cpp y Ollama (explicitos en los tags); endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-DiM-heretic-GGUF | 30,7B | no disponible | apache-2.0 | GGUF | Abliterated, solo ingles, acceso gated |
| Gemma 4 31B-it (original) | ~31B | no disponible | condiciones Gemma | safetensors/GGUF | Modelo base con filtros de seguridad intactos |
| Alternativas abliterated de 30B | no disponible | no disponible | variable | GGUF | No se dispone de datos comparables en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La ablacion de rechazo elimina parte de los filtros de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal sin las salvaguardas del original. No apto para produccion orientada al publico sin capas de moderacion externas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Licencia declarada apache-2.0, pero al derivar de Gemma conviene revisar las condiciones de uso comercial del modelo base antes de desplegarlo en produccion.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; no es descarga anonima.
- Solo se publican pesos GGUF; no hay safetensors en este repositorio, lo que limita el fine-tuning directo.
- No se documentan sesgos especificos ni evaluaciones de seguridad de esta variante.
- El autor y el modelo son de nicho (591 descargas, 1 like en el momento de la consulta): menor soporte comunitario y menos validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic-GGUF
- Modelo base (referenciado): https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
