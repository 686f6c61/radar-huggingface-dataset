# gmezan/nllb-quechua-spanish

## Resumen

`gmezan/nllb-quechua-spanish` es un modelo de traduccion automatica neuronal entrenado para el par de idiomas quechua-espanol, publicado en Hugging Face por el usuario gmezan. El modelo se construye sobre la arquitectura M2M-100 (tag `m2m_100`), un transformer encoder-decoder disenado originalmente por Facebook AI para traduccion multilingue, y cuenta con 615.073.792 parametros totales segun los pesos en safetensors. El repositorio ocupa 2,5 GB y se distribuye en formato safetensors compatible con la libreria `transformers`.

La relevancia de este modelo radica en su enfoque sobre un par de idiomas de bajos recursos: el quechua es una lengua indigena andina con escasa representacion en los sistemas de traduccion comerciales, y las variantes especializadas quechua-espanol son poco frecuentes. Al partir de la arquitectura m2m_100, el modelo hereda el diseno multilingue de M2M-100, aunque el autor no ha documentado que idiomas adicionales conserva ni el proceso exacto de ajuste.

La model card esta practicamente vacia: se trata de la plantilla autogenerada por Hugging Face sin completar, por lo que no hay informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion. Esto limita seriamente la evaluacion rigurosa del modelo y obliga a tratar cualquier uso en produccion con cautela hasta que el autor publique documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100, tag `m2m_100`) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | quechua y espanol (segun el nombre del modelo); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura M2M-100, un transformer encoder-decoder con atencion multi-cabeza estandar, introducido en el paper *Beyond English-Centric Multilingual Machine Translation* (Fan et al., 2020, arXiv:1910.09700). M2M-100 se diseno para traduccion directa entre pares de idiomas sin pivotar por el ingles, y sus variantes publicadas van desde 418M hasta 12B de parametros. Con 615M de parametros, este checkpoint se situa en el rango de la variante pequena, lo que sugiere un ajuste fino sobre una base preentrenada de ese tamano, aunque el autor no lo confirma.

No se dispone de informacion sobre el corpus de entrenamiento (numero de tokens, procedencia de los pares quechua-espanol, tecnicas de filtrado o aumentacion de datos), ni sobre si se aplicaron tecnicas de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica referencia tecnica disponible es el paper original de M2M-100, citado en los tags del repositorio.

## Capacidades

- Traduccion automatica de texto entre quechua y espanol (bidireccional segun el nombre del modelo, aunque no se especifica el sentido exacto ni si ambos estan cubiertos).
- Generacion de texto condicionada a una tarea de traduccion (`text2text-generation`), propia de la familia m2m_100.
- Compatibilidad con la API de `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues adicionales: no disponible; no se documenta si conserva otros idiomas del preentrenamiento M2M-100.
- Tool calling / function calling: no disponible (no es una capacidad tipica de esta arquitectura).
- Razonamiento multi-paso o modo agente: no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Traduccion de documentacion administrativa y sanitaria al quechua: el modelo puede emplearse para generar versiones en quechua de formularios, avisos o material informativo dirigido a comunidades andinas, reduciendo la dependencia de traductores humanos para textos de baja complejidad.
- Subtitulado y localizacion de contenido audiovisual: integrado en un pipeline de ASR + traduccion, permitiria generar subtitulos en espanol a partir de audio en quechua o viceversa, aprovechando la naturaleza seq2seq del modelo.
- Preservacion linguistica y corpus paralelos: el modelo puede usarse para generar traducciones preliminares que, tras revision humana, alimenten corpus paralelos quechua-espanol, un recurso escaso y valioso para la investigacion en lenguas de bajos recursos.
- Atencion ciudadana bilingue: en portales o chatbots de administraciones publicas en regiones andinas, el modelo podria traducir consultas y respuestas entre quechua y espanol, siempre con supervision humana dada la falta de evaluacion publicada.
- Investigacion en traduccion de bajos recursos: sirve como punto de partida (baseline) o para ajuste fino adicional en experimentos academicos sobre pares de idiomas con pocos datos, dado su tamano moderado y su compatibilidad con `transformers`.
- Educacion bilingue: traduccion de materiales didacticos y glosarios para escuelas interculturales bilingues, donde el volumen de textos justifica la automatizacion pero se requiere revision por docentes.
- Prototipado rapido de servicios de traduccion: al ser un checkpoint ligero (615M parametros), puede desplegarse en entornos con recursos limitados para validar productos antes de invertir en modelos mayores o en servicios comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 615M parametros, en fp32 se requieren aproximadamente 2,5 GB de VRAM; en fp16/bf16, unos 1,3 GB; en cuantizacion de 8 bits, en torno a 0,7 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en fp16; para lotes grandes o baja latencia, se recomiendan RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (con `M2M100ForConditionalGeneration`), y potencialmente servidores compatibles como TGI o vLLM si soportan la arquitectura m2m_100; llama.cpp y Ollama no estan confirmados para esta arquitectura y formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gmezan/nllb-quechua-spanish` | 615M | no disponible | quechua, espanol | no disponible | Hugging Face |
| `facebook/m2m100_418M` | 418M | 1024 tokens (posiciones sinusoidales) | 100 idiomas | MIT | Hugging Face |
| `facebook/nllb-200-distilled-600M` | 600M | 1024 tokens | 200 idiomas | CC-BY-NC 4.0 | Hugging Face |
| `Helsinki-NLP/opus-mt-qu-es` | no disponible | no disponible | quechua, espanol | CC-BY 4.0 (segun modelo OPUS-MT) | Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. El modelo de Helsinki-NLP (OPUS-MT) es el competidor directo mas cercano por par de idiomas, mientras que NLLB-200 distilled 600M ofrece cobertura multilingue amplia pero con licencia no comercial.

## Limitaciones y advertencias

- La model card esta vacia (plantilla autogenerada), por lo que no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion de calidad.
- Riesgo elevado de alucinacion y de traducciones incorrectas: sin benchmarks publicados no es posible estimar la fidelidad de las traducciones, especialmente en un par de bajos recursos como quechua-espanol.
- Licencia no especificada: no se puede garantizar el uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: se desconoce si el ajuste fino ha degradado el resto de idiomas del preentrenamiento M2M-100 (olvido catastrofico).
- Longitud de contexto no disponible: la arquitectura M2M-100 original usa posiciones sinusoidales con 1024 posiciones, pero no se confirma que este checkpoint mantenga esa configuracion.
- Variedad dialectal del quechua no especificada: el quechua tiene multiples variantes (Cusco-Collao, Ayacucho-Chanka, Ancash, etc.) y el modelo no indica cual cubre, lo que puede producir traducciones inadecuadas para hablantes de otras variantes.
- Sin likes ni descargas en el momento de la consulta: no hay evidencia de uso comunitario ni validacion por terceros.
- Fecha de creacion y actualizacion muy proximas (12 de noviembre de 2026): el modelo es reciente y no ha sido revisado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmezan/nllb-quechua-spanish
- Paper de M2M-100 (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Repositorio de M2M-100 en fairseq: https://github.com/facebookresearch/fairseq/tree/main/examples/m2m_100
- Modelo base de referencia M2M-100 en Hugging Face: https://huggingface.co/facebook/m2m100_418M
- Modelo alternativo OPUS-MT quechua-espanol: https://huggingface.co/Helsinki-NLP/opus-mt-qu-es
