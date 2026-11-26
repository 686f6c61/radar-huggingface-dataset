# ametrick-system/hapadapter-as-polr2a

## Resumen

hapadapter-as-polr2a es una coleccion de adaptadores especializados para predecir el efecto de variantes geneticas (SNVs heterocigotos) sobre la senal de union de POLR2A, la subunidad catalitica de la ARN polimerasa II. Lo desarrolla el usuario ametrick-system y se distribuye bajo licencia MIT. El modelo parte de un codificador DNABERT-2 (117M parametros) afinado para regresar la senal de POLR2A a partir de secuencia de referencia, y anade una cabeza siamesa ("HapAdapter") que compara dos ventanas genomicas personales, una por haplotipo, para estimar si existe desequilibrio alelico en la union.

El repositorio contiene ocho subcarpetas: para cada uno de los cuatro donantes EN-TEx (ENC-001 a ENC-004) se incluye un "trunk" (el modelo de union afinado sobre secuencia de referencia, reutilizable de forma independiente) y un "personal" (la cabeza adaptadora entrenada con ventanas extraidas del genoma faseado de ese donante). La entrada es siempre un par de ventanas de 257 pb centradas en la variante.

Es relevante porque aborda un problema concreto de genomica funcional: distinguir, en un genoma diploide, si dos alelos de un mismo SNV producen distinta ocupacion de POLR2A. No es un modelo de lenguaje general ni un `AutoModel` de `transformers`; requiere el paquete `hapadapter` para cargarse y esta pensado exclusivamente para investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer DNABERT-2 (BERT) con cabeza siamesa de adaptador (HapAdapter) |
| Parametros totales | No disponible de forma explicita; el backbone DNABERT-2-117M tiene 117M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 257 pb por haplotipo (entrada fija, dos ventanas por inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (secuencia de ADN); metadatos de idioma no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `hapadapter`) |

## Arquitectura y entrenamiento

El modelo se construye sobre DNABERT-2-117M, un codificador tipo BERT entrenado sobre genomas. El "trunk" es ese codificador afinado para regresar la senal de POLR2A a partir de secuencia de referencia y puede usarse por separado como predictor de union. La cabeza "personal" es una red siamesa que recibe dos embeddings agrupados (pooled) de ventanas haplotipicas y calcula `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyeccion de cada embedding agrupado. El modelo agrupa embeddings de tokens alrededor de la variante en lugar de usar el pooler de BERT.

Cada checkpoint se entrena con un ensayo y un donante, con ventanas de 257 pb cortadas del genoma faseado del donante. La model card indica que generaliza bien a otros donantes EN-TEx, pero no aporta el numero de tokens de entrenamiento, la composicion del dataset ni detalles de RLHF/DPO (no aplicables en este dominio). La distancia usada en la lectura es simetrica, de modo que la puntuacion mide magnitud de desequilibrio alelico, no la direccion (que haplotipo une mas).

## Capacidades

- Prediccion de desequilibrio alelico en la senal de union de POLR2A para SNVs heterocigotos en genomas diploides personales.
- Regresion de senal de union de POLR2A a partir de secuencia de referencia mediante el submodelo "trunk", utilizable de forma independiente.
- Procesamiento de pares de ventanas genomicas de 257 pb, una por haplotipo.
- Salida de una puntuacion de magnitud de desequilibrio alelico (mayor valor, mayor probabilidad de union especifica de alelo).
- Cuatro checkpoints independientes por donante (ENC-001 a ENC-004), cada uno con su trunk y su cabeza personal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de genomica, no de lenguaje general.

## Casos de uso

- Priorizacion de variantes no codificantes: dado un SNV heterocigoto, generar las dos ventanas haplotipicas de 257 pb y puntuar el desequilibrio alelico para priorizar variantes candidatas a afectar la ocupacion de POLR2A antes de validacion experimental.
- Analisis de eQTL y regulacion transcripcional: usar la puntuacion como caracteristica adicional en estudios de asociacion entre variantes y senal de polimerasa, complementando anotaciones funcionales existentes.
- Investigacion en genomica personal: emplear el checkpoint del donante correspondiente (por ejemplo ENC-001) para analizar variantes en su propio genoma faseado, aprovechando que la cabeza se entreno con ventanas de ese donante.
- Prediccion de union de referencia: usar el submodelo "trunk" de forma aislada para regresar la senal de POLR2A sobre secuencias de referencia, sin necesidad de pares haplotipicos.
- Benchmarking de metodos de interpretacion de variantes: comparar la puntuacion de HapAdapter con otros predictores de efecto regulatorio en conjuntos EN-TEx, dado que la model card reporta buena generalizacion entre donantes.
- Filtrado previo en pipelines de secuenciacion: integrar el modelo como etapa de cribado para reducir el numero de variantes que pasan a validacion experimental (ChIP-seq, reporter assays), siempre en contexto de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (en preparacion) y no duplica numeros por ensayo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El backbone DNABERT-2 tiene 117M parametros; el repositorio completo ocupa 1,9 GB, pero la VRAM de inferencia depende del checkpoint cargado y del tipo de cuantizacion (no documentada).
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, cualquier GPU consumer moderna es suficiente en teoria, pero no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si, dado el tamano del backbone, aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-polr2a | Backbone 117M + cabeza | Ventanas de 257 pb | Desequilibrio alelico POLR2A | MIT | Hugging Face |
| DNABERT-2 | 117M | Variable (secuencia genomica) | Codificador genomico general | No disponible en la informacion | Hugging Face (zhihan1996/DNABERT-2-117M) |
| Otros adaptadores HapAdapter | No disponible | No disponible | Otras proteinas/ensayos | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La puntuacion de desequilibrio alelico es simetrica: no indica que haplotipo une mas, solo la magnitud.
- Entrada restringida a ventanas de 257 pb; longitudes distintas quedan fuera de distribucion.
- Cada checkpoint se entrena con un ensayo y un donante; la generalizacion a otros donantes se reporta como buena, pero no se cuantifica en la model card.
- Uso exclusivamente de investigacion: no validado para interpretacion clinica ni diagnostica de variantes humanas.
- No es un `AutoModel` de `transformers`; requiere el paquete `hapadapter` y descargar tanto el trunk como la cabeza personal.
- Durante la carga, `transformers` emite advertencias esperadas (pesos del cabezal MLM no usados, pooler inicializado aleatoriamente); no indican un fallo, pero pueden confundir en produccion.
- No hay datos publicados de benchmarks, sesgos, cuantizacion ni latencia; la licencia MIT permite uso comercial, pero la validacion cientifica del modelo es limitada (paper en preparacion).
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de predicciones poco fiables fuera de las condiciones de entrenamiento (ventanas, ensayo, donante).

## Enlaces

- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-polr2a
- Backbone DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparacion (consultar el repositorio para referencia actualizada)
