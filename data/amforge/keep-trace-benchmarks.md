# AMFORGE/KEEP-TRACE-Benchmarks

## Resumen

KEEP TRACE es un motor propietario de analisis forense y deteccion de amenazas desarrollado por Ameforge (Windsor, Ontario), construido sobre la arquitectura KEEP (*Keep what Endures under Environmental Perturbation*). El repositorio de Hugging Face `AMFORGE/KEEP-TRACE-Benchmarks` no contiene pesos del modelo, sino unicamente la metodologia y los resultados reproducibles de benchmarks publicos sobre deteccion de ransomware y malware en binarios PE de Windows. Es relevante porque documenta un enfoque poco habitual: clasificacion y localizacion de anomalias a nivel de byte sin self-attention, sin CNN y sin tokenizador, con complejidad lineal O(N·k) y una huella inferior al megabyte.

El modelo se evalua en tres conjuntos de datos publicos (cabeceras PE de ransomware, `binary-30k` y EMBER-2018) y en tareas de deteccion de inyecciones sin firmas (payloads cifrados, NOP-sleds, inyeccion en bytecode compilado y bit-flips). Los resultados muestran ventajas claras frente a encoders Transformer en secuencias binarias crudas, aunque queda por detras de GBDT en datos puramente tabulares y de CNN 1D en clasificacion estatica por n-gramas de bytes.

La ficha se basa exclusivamente en la model card publicada; los pesos, la arquitectura interna y los detalles de entrenamiento son privados y no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KEEP (propietaria): sin self-attention, sin CNN, sin tokenizador; complejidad lineal O(N·k) |
| Parametros totales | No disponible (huella reportada de 177 KB a 255 KB en int8 equivalente, segun variante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre ventanas de 1.024 bytes en cabeceras PE y sobre secuencias de bytes) |
| Tipos de cuantizacion | No disponible (las comparativas usan tamanos en int8 equivalente) |
| Idiomas soportados | No disponible (modelo orientado a datos binarios, no a lenguaje natural) |
| Licencia | `ameforge-proprietary` (licencia `other`) |
| Formato de pesos | No disponible (los pesos no se publican; el repositorio solo contiene benchmarks y metodologia) |

## Arquitectura y entrenamiento

La arquitectura KEEP se describe como un motor de analisis de bytes con tres ausencias deliberadas: sin self-attention (no calcula Q·Kᵀ), sin capas convolucionales y sin tokenizador. Trabaja directamente sobre bytes y logra complejidad lineal O(N·k), lo que permite inferencia sobre secuencias binarias largas con un coste que crece de forma lineal con la entrada. La huella del modelo es inferior al megabyte (entre 177 KB y 255 KB en int8 equivalente segun la variante), lo que lo hace apto para despliegues en entornos con recursos limitados.

El entrenamiento combina dos regimenes: una variante supervisada para clasificacion de ransomware en cabeceras PE y una variante no supervisada de localizacion de anomalias a nivel de byte (en la que el modelo no ve malware durante el entrenamiento). Los conjuntos de datos citados son `cycloevan/Ransomware_PE_Header_Feature_Dataset`, `mjbommar/binary-30k` y `cw1521/ember2018-malware`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detalla el mecanismo interno que sustituye a la atencion.

## Capacidades

- Clasificacion supervisada de ransomware a partir de cabeceras PE crudas de 1.024 bytes (ROC AUC 0.9988 en el benchmark publicado).
- Deteccion de malware en binarios PE con cambio de distribucion entre entrenamiento y prueba (ROC AUC 0.9493 en `binary-30k`).
- Clasificacion tabular sobre caracteristicas PE (ROC AUC 0.9686 en EMBER-2018).
- Localizacion de anomalias a nivel de byte sin firmas ni etiquetas de ataque: inyeccion de payload cifrado o empaquetado (AUC 0.9986), NOP-sled de desbordamiento de buffer (AUC 0.9650), inyeccion en bytecode compilado (AUC 1.0000) y deteccion de bit-flips (AUC 0.9588-1.0000).
- Triaje de artefactos benignos para reducir la fatiga de alertas en un SOC, con rangos de offset exactos.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni multilingueismo.

## Casos de uso

- Triaje de alertas en un SOC: el motor localiza el rango de offsets exacto que dispara la anomalia en un binario sospechoso, lo que permite al analista distinguir artefactos benignos de inyecciones reales y reducir el volumen de alertas.
- Clasificacion de ransomware en pasarelas de correo o endpoints: con 254 KB en int8 y una latencia de 65,5 ms en una RTX 3050, puede ejecutarse sobre cabeceras PE antes de permitir la ejecucion de un adjunto.
- Analisis de malware con cambio de distribucion: el rendimiento en `binary-30k` (AUC 0.9493) lo hace util para muestras que difieren de las familias vistas en entrenamiento.
- Deteccion de inyeccion de payload en binarios compilados: aplicable a pipelines de verificacion de artefactos `.dll`/`.pyd` antes de desplegarlos en produccion, con AUC cercana a 1 en bytecode compilado.
- Monitorizacion de integridad en memoria: la deteccion de bit-flips (AUC 0.9588-1.0000) permite vigilar regiones de RAM o bytecode frente a modificaciones de un solo bit.
- Analisis forense post-incidente: la variante no supervisada (sin haber visto malware) sirve para localizar regiones anomalas en muestras nuevas sin depender de firmas conocidas.
- Clasificacion tabular de caracteristicas PE en pipelines de threat intelligence: util como componente de bajo coste (255 KB, 223,4 ms) cuando no se dispone de un GBDT entrenado.

## Benchmarks y rendimiento

Deteccion de ransomware en cabeceras PE crudas de 1.024 bytes (`cycloevan/Ransomware_PE_Header_Feature_Dataset`, 2.157 ejecutables, split 80/20):

| Modelo | Tamano (int8 eq.) | ROC AUC | Accuracy | F1 | Inferencia |
|---|---:|---:|---:|---:|---:|
| KEEP TRACE Classifier (0 attn, 0 CNN) | 254 KB | 0.9988 | 98,1% | 0,980 | 65,5 ms |
| MalConv (CNN con compuertas) | 74 KB | 0.9982 | 99,1% | 0,990 | 5,5 ms |
| Transformer Encoder (3L, 4H) | 605 KB | 0.9905 | 97,5% | 0,973 | 129,8 ms |
| KEEP TRACE no supervisado (0 malware visto) | 177 KB | 0.5537 | 61,1% | 0,472 | 53,3 ms |

Malware PE con cambio de distribucion (`mjbommar/binary-30k`, 3.577 binarios, 2.456 train / 1.121 test):

| Modelo | Tamano (int8 eq.) | ROC AUC | Accuracy | F1 | Inferencia |
|---|---:|---:|---:|---:|---:|
| CNN 1D (estilo MalConv) | 102 KB | 0.9870 | 94,9% | 0,932 | 96,9 ms |
| KEEP TRACE (0 attn, 0 CNN) | 249 KB | 0.9493 | 88,3% | 0,857 | 301,0 ms |
| Transformer Encoder (3L, 4H) | 599 KB | 0.9252 | 80,6% | 0,773 | 110,6 ms |

Benchmark tabular EMBER-2018 (`cw1521/ember2018-malware`, 16.000 muestras, 2.381 caracteristicas):

| Modelo | Tamano (int8 eq.) | ROC AUC | Accuracy | F1 | Inferencia |
|---|---:|---:|---:|---:|---:|
| HistGBDT (equivalente a LightGBM) | GBDT | 0.9948 | 96,7% | 0,965 | 457,0 ms |
| MLP tabular (256→128) | 629 KB | 0.9824 | 94,5% | 0,942 | 6,3 ms |
| KEEP TRACE (0 attn) | 255 KB | 0.9686 | 91,0% | 0,905 | 223,4 ms |

Deteccion de inyecciones sin firmas (binarios `.dll`/`.pyd` compilados reales, sin etiquetas de ataque):

| Tarea | AUC |
|---|---:|
| Inyeccion de payload cifrado/empaquetado (x86-64 `.text`) | 0.9986 |
| NOP-sled (`0x90`) de desbordamiento de buffer (x86-64 `.text`) | 0.9650 |
| Inyeccion de payload en bytecode compilado | 1.0000 (sorpresa latente nativa: 0.9812) |
| Deteccion de bit-flip unico (RAM / bytecode) | 0.9588-1.0000 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos en int8 equivalente (177-255 KB), mas el coste de activaciones, no cuantificado en la informacion disponible.
- GPU de referencia en los benchmarks: NVIDIA RTX 3050 con CUDA 12.6.
- Cabe en cualquier GPU consumer; tambien es plausible su ejecucion en CPU, aunque no se publican latencias en CPU.
- Opciones de despliegue: no disponibles (los pesos no se publican; solo se documenta la metodologia y los resultados).
- Latencia medida: 65,5 ms (clasificador de ransomware), 301,0 ms (`binary-30k`), 223,4 ms (EMBER) y 53,3 ms (variante no supervisada) en RTX 3050. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | ROC AUC (PE ransomware) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KEEP TRACE Classifier | 254 KB (int8 eq.) | No disponible | 0.9988 | Propietaria | Solo benchmarks publicos |
| MalConv | 74 KB (int8 eq.) | No disponible | 0.9982 | No disponible | Baseline academico |
| Transformer Encoder (3L, 4H) | 605 KB (int8 eq.) | No disponible | 0.9905 | No disponible | Baseline |
| HistGBDT (LightGBM) | GBDT | No disponible | 0.9948 (EMBER) | No disponible | Baseline |

Frente a MalConv, KEEP TRACE obtiene una AUC ligeramente superior en cabeceras PE y una AUC inferior en `binary-30k`, con mayor latencia en ambos casos. Frente al Transformer Encoder, gana en las dos tareas de secuencias binarias con 2,4 veces menos parametros. Frente a GBDT en EMBER, pierde en AUC y accuracy.

## Limitaciones y advertencias

- Los pesos y la arquitectura interna son propietarios y no se publican; el repositorio solo contiene benchmarks y metodologia, por lo que no es posible reproducir la inferencia ni auditar el modelo.
- La licencia `ameforge-proprietary` restringe el uso comercial; es necesario contactar con Ameforge para condiciones.
- En datos puramente tabulares (EMBER-2018) queda por detras de GBDT (0.9686 frente a 0.9948 de AUC).
- En clasificacion estatica por n-gramas de bytes, la CNN 1D supera a KEEP TRACE en `binary-30k` (0.9870 frente a 0.9493).
- La variante no supervisada rinde muy por debajo de la supervisada en ransomware (AUC 0.5537), por lo que no sustituye a un clasificador entrenado en ese escenario.
- La latencia es superior a la de MalConv y a la del Transformer Encoder en varias tareas (hasta 301,0 ms frente a 96,9 ms en `binary-30k`).
- No se documentan sesgos, tasas de alucinacion ni comportamiento multilingue porque el modelo opera sobre bytes y no sobre lenguaje natural.
- Los resultados proceden de un unico entorno de evaluacion (RTX 3050, CUDA 12.6) y de conjuntos de datos concretos; no se publican validaciones independientes.
- No se detallan las condiciones de entrenamiento (datos, regimen, posibles tecnicas de aumento), lo que limita la evaluacion de su robustez en produccion.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/AMFORGE/KEEP-TRACE-Benchmarks
- Pagina de producto: https://ameforge.tech/products/keep-trace
- Dataset de ransomware PE: https://huggingface.co/datasets/cycloevan/Ransomware_PE_Header_Feature_Dataset
- Dataset `binary-30k`: https://huggingface.co/datasets/mjbommar/binary-30k
- Dataset EMBER-2018: https://huggingface.co/datasets/cw1521/ember2018-malware
