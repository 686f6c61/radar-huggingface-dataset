# jknlsn/zeta-2.1-oQ8e

## Resumen

zeta-2.1-oQ8e es una cuantizacion en 8 bits del modelo Zeta 2.1 de Zed Industries, un modelo especializado en prediccion de ediciones de codigo (next-edit suggestion) afinado a partir de ByteDance-Seed/Seed-Coder-8B-Base. No es un modelo conversacional de proposito general: dado un contexto de codigo, un historial de ediciones y una region editable alrededor del cursor, predice el contenido reescrito para esa region. Esta version concreta la publica el usuario jknlsn y esta pensada para ejecutarse con MLX en hardware Apple Silicon.

La relevancia de esta ficha radica en su caracter de artefacto derivado: reproduce el comportamiento del modelo original con pesos de 8 bits y cuantizacion mixta asistida por imatrix, lo que reduce el peso del repositorio a 8,8 GB para un modelo de 8.250.462.208 parametros. Al estar en formato MLX safetensors, su uso queda restringido al ecosistema MLX (macOS con chip Apple), no a pipelines CUDA convencionales.

El modelo hereda la licencia Apache-2.0 del modelo base y soporta unicamente ingles. No incluye soporte de multi-token prediction (MTP), a diferencia de la variante original, lo que condiciona su latencia en comparacion con el modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer decoder-only, segun metadatos de cuantizacion) |
| Parametros totales | 8.250.462.208 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, mixta con imatrix (oQe) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (8-bit) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de tipo llama con aproximadamente 8.250 millones de parametros, derivado de Seed-Coder-8B-Base mediante un proceso de fine-tuning orientado a la prediccion de ediciones. La tarea no es la generacion libre de texto sino la reescritura de una region delimitada por marcadores dentro de un fichero, condicionada por el sufijo y el prefijo del fichero, ficheros relacionados y un historial de diffs. El prompt emplea el formato suffix-prefix-middle (SPM) con marcadores numerados de multiples regiones (`<[fim-suffix]>`, `<[fim-prefix]>`, `<[fim-middle]>`, `<|marker_N|>`, `<|user_cursor|>`), no un formato de chat.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Esta version concreta es una cuantizacion realizada con oQe (oMLX v0.7.3) mediante cuantizacion mixta de precision mejorada con imatrix, en 8 bits con group size 64, y excluye explicitamente el soporte de multi-token prediction (MTP) presente en el modelo fuente.

## Capacidades

- Prediccion de la siguiente edicion (next-edit suggestion) sobre una region editable delimitada por marcadores, con el cursor como referencia.
- Reescritura de codigo condicionada por contexto multi-fichero (ficheros relacionados) e historial de diffs.
- Formato de prompt SPM con multiples regiones numeradas, adecuado para ediciones parciales dentro de un mismo fichero.
- Generacion de texto limitada al dominio de codigo y edicion; no esta disenado como modelo de chat.
- Soporte multilingue limitado al ingles (idioma declarado en la model card y en los metadatos).
- No dispone de tool calling, function calling ni capacidades de agente segun la informacion disponible.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Sin soporte de multi-token prediction en esta variante cuantizada.

## Casos de uso

- Asistente de edicion integrado en el IDE: el modelo recibe el fichero objetivo, los ficheros relacionados y el historial de cambios, y devuelve la region reescrita delimitada por marcadores, lo que encaja con editores como Zed que ya consumen el modelo original.
- Aplicacion de refactorizaciones guiadas: dada una secuencia de diffs previos como historial y una region seleccionada, el modelo propone la reescritura coherente con el patron de cambios, util para renombrados o migraciones de API repetitivas.
- Autocompletado de bloques completos: al delimitar con marcadores la region a sustituir, permite generar bloques de codigo de varias lineas en lugar de tokens sueltos, aprovechando el contexto de prefijo y sufijo del fichero.
- Correccion contextual de errores: con el sufijo del fichero como condicion, el modelo puede reescribir una seccion para que sea consistente con el codigo posterior, util en tareas de reparacion de firmas o tipos.
- Prototipado local en macOS: al estar en formato MLX y 8 bits, permite ejecutar el modelo en un Mac con Apple Silicon sin GPU dedicada, adecuado para desarrolladores que quieren evaluar el comportamiento de Zeta 2.1 en local.
- Investigacion sobre prediccion de ediciones: sirve como referencia cuantizada para comparar la degradacion de calidad frente al modelo original en tareas de next-edit suggestion, dado que comparte arquitectura y pesos de origen.
- Integracion en pipelines de revision de codigo: el modelo puede generar propuestas de parche sobre regiones concretas que luego se validan con tests, aunque requiere un orquestador externo porque no soporta tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/peso en disco: el repositorio ocupa 8,8 GB en formato MLX safetensors de 8 bits; la memoria unificada necesaria para inferencia sera del orden de ese tamano mas overhead de activaciones y cache KV.
- GPU recomendadas: al ser un modelo MLX, el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra); no esta pensado para A100, H100 ni RTX 4090, ya que MLX no es el runtime habitual en CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (orientativamente 16 GB o mas para el modelo de 8 bits con contexto moderado; el dato exacto de contexto no esta disponible).
- Opciones de despliegue: MLX (libreria declarada en la model card) y el ecosistema oMLX/oQe para cuantizacion; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La ausencia de MTP en esta variante puede reducir el rendimiento frente al modelo original en decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zeta-2.1-oQ8e (este) | 8,25 B | no disponible | MLX safetensors 8-bit | apache-2.0 | Cuantizacion MLX, sin MTP, solo ingles |
| zed-industries/zeta-2.1 | 8,25 B (derivado de Seed-Coder-8B-Base) | no disponible | safetensors original | apache-2.0 | Modelo fuente, incluye MTP |
| ByteDance-Seed/Seed-Coder-8B-Base | 8 B aprox. | no disponible | safetensors | no disponible en la informacion | Modelo base de codigo del que deriva Zeta 2.1 |

No se dispone de datos de rendimiento comparado (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- No es un modelo de chat ni de proposito general: usarlo con prompts conversacionales produce resultados fuera de distribucion.
- Solo soporta ingles; el codigo y los comentarios en otros idiomas pueden degradar la calidad de las sugerencias.
- Ausencia de MTP en esta variante, lo que puede implicar menor velocidad de generacion que el modelo original.
- La cuantizacion a 8 bits con group size 64 introduce una perdida de precision respecto al modelo fuente; no se han publicado evaluaciones de esa degradacion.
- Riesgo de alucinacion en la reescritura de regiones: puede generar codigo sintacticamente valido pero semanticamente incorrecto, por lo que requiere validacion con tests.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo de codigo, puede reproducir sesgos de los datos de entrenamiento originales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Seed-Coder-8B-Base, cuya licencia no se detalla en la informacion proporcionada.
- Dependencia del runtime MLX: no es portable a entornos CUDA sin conversion previa de pesos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jknlsn/zeta-2.1-oQ8e
- Modelo original: https://huggingface.co/zed-industries/zeta-2.1
- Prompt de ejemplo del modelo original: https://huggingface.co/zed-industries/zeta-2.1/blob/main/sample.prompt
- Salida de ejemplo del modelo original: https://huggingface.co/zed-industries/zeta-2.1/blob/main/sample.output
- Modelo base de codigo: https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Base
- Herramienta de cuantizacion oQe (oMLX): https://github.com/jundot/omlx
