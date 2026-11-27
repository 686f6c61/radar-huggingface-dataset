# mradermacher/granite-4.2-3b-abliterated-GGUF

## Resumen

`mradermacher/granite-4.2-3b-abliterated-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo `Lonelyguyse1/granite-4.2-3b-abliterated`. Se trata, por tanto, de un artefacto de distribucion derivado: el autor original del modelo base no es mradermacher, sino el usuario Lonelyguyse1, y mradermacher se limita a convertir y cuantizar los pesos para su uso en entornos de inferencia local (llama.cpp, Ollama y derivados).

El nombre indica que el modelo subyacente parte de la familia IBM Granite 4.2 en su variante de 3 mil millones de parametros, sometida a un proceso de "abliteration" (una modificacion de pesos orientada a eliminar el comportamiento de rechazo alineado). No obstante, la model card proporcionada no incluye informacion tecnica sobre el modelo base, el proceso de abliteration ni los datos de entrenamiento.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio presenta cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas, y no aporta benchmarks. Es un artefacto reciente (creado el 27 de noviembre de 2026) y de proposito practico: ofrecer variantes GGUF de un modelo pequeno para ejecucion en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de IBM Granite 4.2; no confirmado en la informacion) |
| Parametros totales | aproximadamente 3 mil millones (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El identificador sugiere que deriva de IBM Granite 4.2 en su variante de 3B, pero la model card no confirma familia, tipo de atencion, numero de capas ni dimensiones ocultas. Tampoco se detalla el proceso de abliteration aplicado por Lonelyguyse1: no se especifican las capas modificadas, la metodologia (por ejemplo, proyeccion de direcciones de rechazo) ni el impacto en capacidades.

Respecto al entrenamiento, la model card no aporta datos sobre volumen de tokens, composicion del dataset, fases de alineacion (RLHF, DPO) ni innovaciones tecnicas. La unica informacion tecnica presente son los metadatos de conversion del pipeline de cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), que indican una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion de tensores de salida.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de 3B, aunque no verificada en la informacion disponible.
- Razonamiento y codigo: no confirmado; depende del modelo base Granite 4.2, del que no se aportan detalles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Comportamiento sin rechazo: el sufijo "abliterated" indica que se ha modificado el modelo para reducir las negativas alineadas, si bien no se documenta el alcance ni la eficacia de dicha modificacion.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de aproximadamente 3B en GPUs de gama media o incluso en CPU, lo que facilita prototipado sin infraestructura dedicada.
- Experimentacion con alineacion y seguridad: el caracter "abliterated" lo hace util para estudiar el comportamiento de modelos sin rechazo en entornos controlados de investigacion sobre seguridad.
- Despliegue con llama.cpp u Ollama: al ser GGUF, se integra directamente en estos runners para pruebas de generacion de texto en local.
- Evaluacion comparativa de cuantizaciones: disponer de doce variantes (desde x-f16 hasta Q2_K) permite medir la degradacion de calidad frente al tamano en un mismo modelo.
- Generacion de texto offline en entornos sin conectividad: el formato GGUF y el tamano reducido posibilitan su uso en estaciones de trabajo aisladas.
- Base para fine-tuning o destilacion experimental: al ser un modelo pequeno, sirve como punto de partida para experimentos de ajuste, aunque la licencia no declarada obliga a verificar los terminos antes de cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, segun cuantizacion y para un modelo de ~3B): Q2_K en torno a 1,5-2 GB; Q4_K_M alrededor de 2-2,5 GB; Q8_0 cerca de 3,5 GB; x-f16 aproximadamente 6-7 GB. Estas cifras son estimaciones basadas en el tamano nominal y no estan confirmadas en la model card.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria esperar funcionamiento en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100), pero no se aportan datos oficiales.
- Compatibilidad con GPU de consumo: probable para cuantizaciones Q4 y Q5 en GPUs con 4-8 GB de VRAM; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI requeririan pesos en otro formato (safetensors) no incluidos en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/granite-4.2-3b-abliterated-GGUF | ~3B (inferido) | no disponible | no disponible | GGUF | Cuantizaciones de un modelo abliterated; sin benchmarks |
| Lonelyguyse1/granite-4.2-3b-abliterated | ~3B (inferido) | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta ficha; sin datos tecnicos en la informacion |
| IBM Granite 4.x (familia) | variable | no disponible | no disponible en esta ficha | variable | Familia de origen; no se aportan especificaciones concretas |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no es posible determinar si se permite uso comercial; debe consultarse el repositorio original antes de cualquier despliegue.
- Sin idiomas declarados: no se puede garantizar cobertura multilingue ni calidad en castellano.
- Sin benchmarks ni evaluaciones: no hay evidencia publicada sobre calidad, alucinacion o robustez.
- Riesgo de alucinacion: inherente a modelos de ~3B; no cuantificado.
- El proceso de abliteration puede degradar capacidades y eliminar salvaguardas de seguridad; no se documenta su impacto.
- Repositorio sin descargas ni likes: no hay senal de validacion por parte de la comunidad.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto: no disponibles.
- El modelo base pertenece a un tercero (Lonelyguyse1) y este repositorio solo redistribuye cuantizaciones; la trazabilidad y responsabilidad sobre los pesos recaen en el autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.2-3b-abliterated-GGUF
- Modelo base: https://huggingface.co/Lonelyguyse1/granite-4.2-3b-abliterated
