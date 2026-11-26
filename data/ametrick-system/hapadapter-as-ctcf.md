# ametrick-system/hapadapter-as-ctcf

## Resumen

hapadapter-as-ctcf es una coleccion de cabezas adaptadoras (adapter heads) para predecir union especifica de alelo (allele-specific binding) del factor de transcripcion CTCF en genomas personales diploides. Lo desarrolla el usuario ametrick-system y se publica bajo licencia MIT. El modelo se apoya en un encoder DNABERT-2 de 117 M de parametros, afinado para regresar la senal de CTCF a partir de secuencia de referencia, y anade una cabeza siamesa entrenada sobre ventanas extraidas del genoma faseado de cada donante.

El problema que resuelve es concreto: dado un SNV heterocigoto, determinar si las dos haploides muestran desequilibrio alelico en la senal de CTCF. La entrada no es una secuencia unica, sino un par de ventanas de 257 pb centradas en la variante, una por haploide. El modelo no es un `AutoModel` de transformers y requiere el paquete `hapadapter` para cargarse, ya que la cabeza necesita dos embeddings de haploide agrupados (pooled).

Es relevante para investigacion en genomica funcional porque aborda la prediccion de efectos regulatorios variante-especificos con un enfoque diploide, en lugar de comparar la variante contra la referencia de forma univariante. El repositorio incluye cuatro donantes (ENC-001 a ENC-004) y dos variantes por donante: el tronco (`dnabert2-trunk`) y la cabeza personal (`dnabert2-personal`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DNABERT-2 (transformer tipo BERT) + cabeza siamesa adaptadora sobre embeddings pooled de haploide |
| Parametros totales | no disponible (el encoder base DNABERT-2-117M tiene 117 M; el total con cabezas no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (par de ventanas, una por haploide) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DNABERT-2-117M (`zhihan1996/DNABERT-2-117M`), un encoder transformer entrenado sobre secuencias genomicas, y lo afina para regresar la senal de CTCF a partir de secuencia de referencia; ese componente es el llamado `dnabert2-trunk`. Sobre ese tronco se entrena una cabeza siamesa (`dnabert2-personal`) que recibe dos ventanas de 257 pb, una por haploide, genera un embedding pooled por cada una, los proyecta y calcula una distancia. La salida se define como `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyeccion del embedding pooled de cada ventana y `h_1`, `h_2` son los dos haplotipos.

Cada checkpoint se entrena con un ensayo y un donante, pero la model card indica que generaliza bien a otros donantes EN-TEx. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La distancia usada en la readout es simetrica, por lo que el score mide magnitud de desequilibrio alelico, no direccion (no indica que haploide une mas).

## Capacidades

- Prediccion de desequilibrio alelico en la senal de CTCF para SNVs heterocigotos en genomas personales diploides.
- Regresion de senal de union de CTCF a partir de secuencia de referencia mediante el tronco `dnabert2-trunk`, utilizable de forma independiente como predictor de union.
- Procesamiento de pares de ventanas genomica de 257 pb centradas en la variante, una por haploide.
- Salida de un score de magnitud de desequilibrio alelico (mayor valor, mayor probabilidad de union especifica de alelo).
- Adaptacion por donante: cabezas especificas entrenadas sobre el genoma faseado de ENC-001, ENC-002, ENC-003 y ENC-004.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues de lenguaje natural; es un modelo de secuencia genomica.

## Casos de uso

- Priorizacion de variantes regulatorias: dado un conjunto de SNVs heterocigotos, usar el par de ventanas de 257 pb para puntuar cuales muestran mayor probabilidad de desequilibrio alelico en CTCF y priorizar su validacion experimental.
- Analisis de efectos de variantes en dominios de union de CTCF: emplear el tronco `dnabert2-trunk` como predictor de union para comparar la senal esperada entre haplotipos en regiones de cromatina accesible.
- Estudios de arquitectura 3D del genoma: identificar variantes con desequilibrio alelico en CTCF que puedan afectar anclajes de bucles de cromatina, usando el score como filtro previo a experimentos Hi-C o ChIA-PET.
- Investigacion en genetica de poblaciones: aplicar las cabezas por donante a genomas faseados de los cuatro donantes EN-TEx para caracterizar variacion alelica en union de CTCF entre individuos.
- Generacion de hipotesis en epigenomica comparativa: combinar el score simetrico de desequilibrio con datos de senal de CTCF por haploide para orientar que alelo presenta mayor union en validaciones dirigidas.
- Filtrado en pipelines de anotacion funcional: integrar la prediccion como paso de enriquecimiento en flujos que anotan variantes no codificantes, usando el tronco para la senal base y la cabeza personal para el contraste entre haplotipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (en preparacion) para las cifras por ensayo y no duplica numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 1,9 GB y el encoder base tiene 117 M de parametros, por lo que el peso en precision completa es del orden de cientos de MB y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no especificadas por el autor; por tamano del encoder, cualquier GPU consumer reciente (por ejemplo, RTX 3060 en adelante) es suficiente para inferencia.
- Cabe en GPU consumer: si, dado el tamano del encoder DNABERT-2-117M.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) y `huggingface_hub.snapshot_download`; no es compatible con `AutoModel` de transformers. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-ctcf | no disponible (encoder base 117 M) | 257 pb por ventana (par) | Union especifica de alelo CTCF en genomas diploides | MIT | Hugging Face, requiere paquete `hapadapter` |
| DNABERT-2-117M | 117 M | no disponible en esta ficha | Encoder de secuencia genomica (tareas downstream) | no disponible en esta ficha | Hugging Face (`zhihan1996/DNABERT-2-117M`) |
| Alternativas especificas de prediccion de union de CTCF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de prediccion de union especifica de alelo en la documentacion proporcionada.

## Limitaciones y advertencias

- El score de la cabeza es simetrico: mide magnitud de desequilibrio alelico, pero no indica que haploide une mas CTCF.
- Solo acepta ventanas de 257 pb; entradas mas largas o mas cortas quedan fuera de distribucion.
- Cada checkpoint se entrena con un unico ensayo y un unico donante; la generalizacion a otros donantes EN-TEx se reporta como buena, pero no se aportan cifras en la model card.
- Uso previsto exclusivamente de investigacion; no validado para interpretacion clinica o diagnostica de variantes humanas.
- No es un `AutoModel`: la carga requiere el paquete `hapadapter` y ambas subcarpetas (tronco y cabeza personal) del donante correspondiente.
- Durante la carga, `transformers` emite advertencias esperadas (pesos del cabezal MLM no usados, pooler inicializado aleatoriamente y mensaje de "deberias entrenar"); el autor indica que deben ignorarse.
- No se documentan sesgos, tasas de alucinacion ni restricciones adicionales de licencia; la licencia MIT permite uso comercial, pero la validez cientifica fuera de investigacion no esta respaldada.
- No hay informacion sobre cuantizacion, latencia ni soporte de despliegue en servidores de inferencia estandar.

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-ctcf
- Encoder base DNABERT-2-117M: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparacion segun la model card; consultar el repositorio para referencia actualizada (no disponible)
- Repositorio del paquete `hapadapter`: no disponible en la informacion proporcionada
