# infergo/sarvam-30b-gguf

## Resumen

Sarvam-30B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Sarvam AI, orientado principalmente al multilingüismo en lenguas indias. Esta ficha concreta corresponde a `infergo/sarvam-30b-gguf`, una republicación del cuantizado oficial Q4_K_M de Sarvam AI en un único archivo GGUF, pensada para su uso directo con Ollama. El autor (Infergo) indica que los tensores, metadatos y plantilla de chat son idénticos a los originales; el único cambio es la fusión de los seis shards en un solo fichero, ya que el registro `hf.co/` de Ollama no puede descargar repositorios fragmentados.

El modelo base emplea la arquitectura `bailingmoe2`, con 128 expertos y 6 activos por token, lo que da un total de 32.152.650.368 parámetros (unos 32,15 mil millones) pero solo 2,4 mil millones activos por token. Soporta una longitud de contexto de 131.072 tokens y está entrenado para diez idiomas: inglés, hindi, tamil, bengalí, telugu, maratí, guyaratí, canarés, malabar y panyabí.

Su relevancia actual radica en que ofrece capacidades de razonamiento y conversación multilingüe en un formato que cabe en una GPU de consumo de 24 GB (con cuantización Q4_K_M), algo poco habitual en modelos de este tamaño y cobertura lingüística. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmoe2` (Mixture of Experts, transformer) |
| Parametros totales | 32.152.650.368 (~32,15 B) |
| Parametros activos | 2,4 B por token (6 de 128 expertos) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo); el base admite otras según el repo oficial |
| Idiomas soportados | en, hi, ta, bn, te, mr, gu, kn, ml, pa |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un único archivo de 19,6 GB); el base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE denominada `bailingmoe2`, compuesta por 128 expertos de los cuales se activan 6 por token. Este diseño permite mantener un coste de inferencia cercano al de un modelo de ~2,4 B de parámetros activos mientras se dispone de una capacidad total de ~32 B. La ventana de contexto alcanza los 131.072 tokens.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones específicas de decodificación (especulativa, atención lineal, etc.) más allá de la propia arquitectura MoE. El cuantizado Q4_K_M conserva la plantilla de chat embebida y los metadatos originales, con parámetros de muestreo recomendados de `temperature 0.8` y `top_p 0.95`.

## Capacidades

- Generación de texto conversacional multi-turno en diez idiomas (inglés e idiomas indios principales).
- Razonamiento explícito: Ollama expone la salida de razonamiento en el campo separado `thinking`.
- Capacidades multilingües nativas para hindi, tamil, bengalí, telugu, maratí, guyaratí, canarés, malabar y panyabí, además del inglés.
- Soporte de plantilla de chat integrada en el GGUF, lo que facilita su uso conversacional directo.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Atención al cliente multilingüe en la India: el modelo puede gestionar conversaciones en hindi, tamil, bengalí y otros idiomas con una ventana de 131k tokens, adecuada para historiales largos de soporte.
- Asistentes conversacionales regionales: despliegue en Ollama sobre una GPU de 24 GB para prototipos y servicios internos en lenguas indias donde otros modelos carecen de cobertura.
- Traducción y adaptación de contenido entre inglés y lenguas indias: útil para localización de documentación, marketing o soporte técnico.
- Procesamiento de documentos largos: resúmenes y extracción de información sobre contratos o informes de hasta 131k tokens en varios idiomas.
- Razonamiento asistido con traza visible: el campo `thinking` permite auditar el proceso de razonamiento en aplicaciones educativas o de análisis.
- Despliegue en infraestructura de consumo: con Q4_K_M (~20 GB) puede ejecutarse en una RTX 4090 de 24 GB para entornos de desarrollo, demos o investigación.
- Investigación en NLP multilingüe: base para experimentos de evaluación en lenguas de bajos recursos con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~20 GB con cuantización Q4_K_M a 32k de contexto; el autor indica una GPU de 24 GB como mínimo práctico.
- GPU recomendadas: RTX 4090 (24 GB) como mínimo para uso en consumo; A100/H100 para contextos completos de 131k y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) usando Q4_K_M.
- Opciones de despliegue: Ollama (≥ 0.40) mediante `ollama pull hf.co/infergo/sarvam-30b-gguf:Q4_K_M`; el formato GGUF también es compatible con llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sarvam-30B (este GGUF) | ~32,15 B / 2,4 B | 131.072 | Apache-2.0 | GGUF, safetensors | MoE 128 expertos, foco en lenguas indias |
| sarvamai/sarvam-30b (base) | ~32,15 B / 2,4 B | 131.072 | Apache-2.0 | safetensors | Mismo modelo, pesos sin cuantizar |
| sarvamai/sarvam-30b-gguf (oficial) | ~32,15 B / 2,4 B | 131.072 | Apache-2.0 | GGUF (6 shards) | Mismo cuantizado, fragmentado |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; es esperable sesgo derivado de los datos de entrenamiento, especialmente en lenguas de bajos recursos.
- Riesgo de alucinación: no cuantificado; como todo LLM generativo, puede producir información incorrecta con aparente seguridad.
- Cobertura lingüística: limitada a los diez idiomas declarados; el rendimiento fuera de ellos no está garantizado.
- Contexto: aunque soporta 131k tokens, el uso práctico a esa longitud requiere hardware muy superior a una GPU de consumo.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Producción: este repo es una republicación de terceros (Infergo) del cuantizado oficial; para entornos críticos se recomienda validar contra el repo oficial `sarvamai/sarvam-30b-gguf`.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infergo/sarvam-30b-gguf
- Modelo base: https://huggingface.co/sarvamai/sarvam-30b
- Cuantizado oficial GGUF: https://huggingface.co/sarvamai/sarvam-30b-gguf
- Proveedor (Infergo): https://www.infergo.ai
- Red de proveedores AI4ALL: https://ai4all.infergo.ai
