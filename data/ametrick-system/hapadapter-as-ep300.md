# ametrick-system/hapadapter-as-ep300

## Resumen

hapadapter-as-ep300 es una coleccion de cabezas adaptadoras (adapter heads) para predecir desequilibrio alelico en la senal de union del factor de transcripcion EP300 sobre genomas personales diploides. Lo desarrolla la organizacion ametrick-system y se apoya en un codificador DNABERT-2 de 117M de parametros, afinado para regresar la senal de EP300 a partir de secuencia de referencia. El modelo no es un modelo generativo ni de lenguaje natural: es una herramienta bioinformatica especializada en genomica funcional.

El problema que aborda es concreto: dado un SNV heterocigoto, determinar si los dos haplotipos muestran desequilibrio alelico en la senal de union de EP300. Para ello recibe un par de ventanas de genoma personal de 257 pb, una por haplotipo, centradas en la variante. El repositorio incluye cuatro donantes (ENC-001 a ENC-004) y dos brazos por donante: un tronco (`dnabert2-trunk`) que actua como predictor de union sobre secuencia de referencia y una cabeza personal (`dnabert2-personal`) entrenada sobre el genoma faseado del donante.

Es relevante ahora porque ejemplifica el patron de adaptadores ligeros sobre codificadores genomicos preentrenados, una via para reutilizar representaciones de DNA sin reentrenar el backbone completo. La licencia MIT y el formato safetensors facilitan su inspeccion y reutilizacion en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red siamesa (twin head) sobre codificador transformer DNABERT-2 |
| Parametros totales | no disponible (backbone DNABERT-2 de 117M; cabeza no cuantificada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 257 pb (entrada fuera de ese tamano queda fuera de distribucion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencia de ADN; no es modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria de carga | hapadapter (no es AutoModel de transformers) |
| Tamano del repo | 1.9 GB |
| Donantes incluidos | ENC-001, ENC-002, ENC-003, ENC-004 |
| Brazos por donante | personal, trunk |

## Arquitectura y entrenamiento

El modelo se compone de un codificador DNABERT-2 (117M de parametros) afinado para regresar la senal de union de EP300 a partir de secuencia de referencia; ese es el tronco (`dnabert2-trunk`), utilizable de forma autonoma como predictor de union. Sobre el se anade una cabeza siamesa (`dnabert2-personal`) que recibe dos embeddings agrupados, uno por haplotipo, y calcula una distancia proyectada entre ellos. La lectura concreta es `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyeccion del embedding agrupado de cada ventana haplotipica.

La cabeza se entrena sobre ventanas extraidas del genoma faseado del propio donante, de ahi la distincion entre brazos personal y trunk. Cada checkpoint se entrena con un ensayo y un donante, aunque el autor reporta buena generalizacion a otros donantes de EN-TEx. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no procede en este dominio). La innovacion tecnica destacable es el uso de una cabeza siamesa con lectura basada en distancia para capturar desequilibrio alelico sin depender de un unico haplotipo de referencia.

## Capacidades

- Prediccion de desequilibrio alelico en la senal de union de EP300 para SNVs heterocigotos.
- Prediccion de union de EP300 sobre secuencia de referencia mediante el tronco (`dnabert2-trunk`) de forma independiente.
- Procesamiento de pares de ventanas de genoma personal de 257 pb, una por haplotipo.
- Modelado especifico por donante (cuatro donantes: ENC-001 a ENC-004) con generalizacion reportada a otros donantes EN-TEx.
- Lectura de magnitud del desequilibrio: la distancia es simetrica, por lo que indica probabilidad de alelico-especificidad, no cual haplotipo une mas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de dominio genomico.

## Casos de uso

- Priorizacion de variantes en estudios de regulacion genica: usar la cabeza personal para puntuar SNVs heterocigotos y ordenar candidatos por probabilidad de desequilibrio alelico en EP300 antes de validacion experimental.
- Analisis de eQTL y GWAS funcional: integrar la puntuacion de alelico-especificidad como anotacion funcional en pipelines que ya manejan genomas faseados EN-TEx.
- Prediccion de union de referencia: emplear el tronco `dnabert2-trunk` como predictor de senal EP300 sobre secuencias de referencia, sin necesidad de la cabeza siamesa.
- Control y calibracion de pipelines: comparar las predicciones del brazo personal frente al trunk para aislar el efecto del genoma individual frente a la referencia.
- Investigacion en biologia de enhancers: EP300 es un marcador de enhancers activos; el modelo permite explorar como variantes concretas alteran su union en un contexto diploide.
- Reproduccion metodologica: servir de base para adaptar el esquema de cabezas siamesas a otros factores de transcripcion o ensayos con ventanas de 257 pb.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (en preparacion) para las cifras por ensayo y no las duplica en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone es DNABERT-2 de 117M, por lo que la huella es moderada, pero el tamano del repo (1.9 GB) incluye multiples checkpoints.
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, una GPU consumer moderna es suficiente en principio.
- Cabe en GPU consumer: probablemente si, dado el tamano del codificador, aunque no hay confirmacion en la informacion.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) y `huggingface_hub`; no es compatible con `AutoModel` de transformers ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hapadapter-as-ep300 | Cabeza siamesa sobre DNABERT-2 para alelico-especificidad EP300 | backbone 117M | ventanas de 257 pb | MIT | Hugging Face |
| DNABERT-2 (zhihan1996) | Codificador de ADN transformer | 117M | no disponible | no disponible | Hugging Face |
| Otros adaptadores genomicos sobre codificadores de ADN | Cabezas de tarea sobre backbones genomicos | variable | variable | variable | no disponible |

No se dispone en la informacion proporcionada de comparativas cuantitativas con alternativas equivalentes para alelico-especificidad de EP300.

## Limitaciones y advertencias

- La lectura es simetrica: la puntuacion no indica cual de los dos haplotipos une mas, solo la magnitud del desequilibrio.
- Solo acepta ventanas de 257 pb; entradas mas largas o cortas quedan fuera de distribucion.
- Cada checkpoint se entrena con un unico ensayo y un unico donante; la generalizacion a otros donantes esta reportada pero no cuantificada en la model card.
- Uso exclusivamente de investigacion; no validado para interpretacion clinica o diagnostico de variantes humanas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento general.
- Riesgo de sesgo ligado a la composicion de los donantes EN-TEx incluidos y al ensayo concreto de EP300.
- La licencia MIT permite uso comercial, pero el autor restringe explicitamente el uso clinico y diagnostico.
- La carga emite advertencias esperadas de `transformers` (pesos no usados del cabezal MLM y pooler inicializado aleatoriamente); no deben interpretarse como fallo.
- El paper esta en preparacion; las cifras de rendimiento por ensayo no estan disponibles en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-ep300
- Backbone DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparacion (consultar el repositorio para referencia actualizada)
