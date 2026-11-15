# Rigau/Qwen3.5-0.8B-M3Kang-PoT-GGUF

## Resumen

Rigau/Qwen3.5-0.8B-M3Kang-PoT-GGUF es un modelo publicado en Hugging Face por el usuario Rigau, presentado como una variante de Qwen3.5 con 0,8 mil millones de parametros y formato de pesos GGUF, orientada a un uso de investigacion bajo la licencia `m3kang-research-use`. El nombre sugiere una adaptacion o derivado del modelo base Qwen3.5-0.8B con algun tipo de tecnica asociada a "PoT" (posiblemente "program of thought" o "plain of thought", aunque el autor no lo especifica) y a la familia "M3Kang".

La model card publicada no contiene informacion tecnica sustantiva: unicamente incluye metadatos de licencia y no documenta arquitectura, datos de entrenamiento, capacidades ni resultados de evaluacion. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia (15 de noviembre de 2026), lo que indica una publicacion reciente y sin traccion comunitaria.

Por tanto, esta ficha se limita a reflejar los datos verificables del repositorio y a marcar explicitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier uso en produccion deberia precederse de una evaluacion directa del modelo, dado que no existe informacion publica sobre su calidad, sesgos o comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica derivado de Qwen3.5; arquitectura del base no documentada en la model card) |
| Parametros totales | 0,8 mil millones (segun nombre del repositorio) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio se publica en formato GGUF; niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | m3kang-research-use (licencia personalizada, enlazada como `LICENSE` en el repositorio) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. El nombre del repositorio indica que se trata de un derivado de Qwen3.5 con 0,8B de parametros, lo que situaria el modelo base en la familia de transformers densos de Qwen, pero la model card no confirma ni detalla esta cuestion. Tampoco se especifica si el modelo incorpora modificaciones estructurales respecto al base.

Respecto al entrenamiento, no se documenta el numero de tokens, la composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. El sufijo "M3Kang" y "PoT" del nombre no va acompanado de ninguna explicacion tecnica en la informacion disponible. No se puede confirmar ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.).

## Capacidades

- Generacion de texto: capacidad esperable por herencia de un modelo de lenguaje de 0,8B, aunque no verificada ni documentada por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se ha publicado ninguna lista de capacidades en la model card; las anteriores son inferencias genericas y no deben tomarse como confirmadas.

## Casos de uso

- Evaluacion experimental en investigacion: el modelo se distribuye bajo una licencia de uso de investigacion, por lo que su uso natural es la experimentacion academica con variantes de Qwen3.5 de bajo coste computacional.
- Pruebas de cuantizacion GGUF en entornos con recursos limitados: al publicarse en GGUF, puede cargarse en herramientas como llama.cpp u Ollama para medir latencia y calidad en CPU o GPU modestas.
- Prototipado rapido de pipelines de generacion de texto: un modelo de 0,8B permite iterar sobre prompts y flujos sin infraestructura dedicada, aunque la calidad real no esta documentada.
- Comparacion de variantes derivadas de Qwen3.5: util como punto de referencia frente al modelo base en experimentos controlados de investigacion.
- Analisis de licencias y distribucion de modelos derivados: caso de estudio sobre como se publican modelos con licencias personalizadas y documentacion minima.
- Educacion y demostraciones: ejecucion local de un modelo pequeno en formato GGUF para ilustrar el funcionamiento de la inferencia con cuantizacion.

No se recomienda ningun caso de uso en produccion sin una evaluacion previa, dada la ausencia total de documentacion tecnica y de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 0,8B en GGUF, las cuantizaciones de 4 bits suelen ocupar del orden de 0,5-1 GB y las de 8 bits alrededor de 1 GB, pero el autor no confirma niveles ni tamanos.
- GPU recomendadas: no disponible. Por tamano, un modelo de 0,8B puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay datos oficiales de rendimiento.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no esta verificado.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners que aceptan GGUF; no se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| Rigau/Qwen3.5-0.8B-M3Kang-PoT-GGUF | 0,8B | no disponible | GGUF | m3kang-research-use | Minima (solo metadatos de licencia) |
| Qwen3.5-0.8B (base, si existe publicamente) | 0,8B | no disponible en esta ficha | safetensors / GGUF | segun publicacion de Qwen | No verificada en esta busqueda |
| Otros derivados GGUF de modelos pequenos | variable | variable | GGUF | variable | variable |

No se dispone de informacion suficiente para establecer una comparativa tecnica rigurosa con alternativas concretas; los datos del modelo base y de terceros no se han podido verificar en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card sustantiva, ni arquitectura, ni datos de entrenamiento, ni evaluaciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion publicada que lo cuantifique.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia restrictiva: `m3kang-research-use` es una licencia personalizada de uso de investigacion; el uso comercial no esta permitido salvo autorizacion expresa del titular, y las condiciones exactas deben consultarse en el fichero `LICENSE` del repositorio.
- Repositorio sin traccion: cero descargas y cero likes, creado y actualizado el mismo dia, sin evidencia de validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa: al no existir benchmarks ni documentacion, cualquier despliegue real conlleva un riesgo elevado.
- Verificar la procedencia del modelo base: el nombre referencia Qwen3.5, pero no se confirma la relacion exacta ni los terminos de la licencia del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rigau/Qwen3.5-0.8B-M3Kang-PoT-GGUF
- Fichero de licencia: https://huggingface.co/Rigau/Qwen3.5-0.8B-M3Kang-PoT-GGUF/blob/main/LICENSE (referenciado en la model card; no verificado)
- Paper, blog o repositorio adicional: no disponible
