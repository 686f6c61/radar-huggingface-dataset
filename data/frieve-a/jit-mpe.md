# Frieve-A/jit-mpe

## Resumen

JIT-MPE (Just-in-Time Multi-Pitch Estimation) es un modelo neuronal causal de muy pequeno tamano (86.425 parametros) disenado para estimar en tiempo real que notas de piano (de las 88 posibles, MIDI 21-108) estan sonando en audio de ensembles mixtos. Lo desarrolla Yoshiyuki Kobayashi (Frieve) y se publica junto al paper arXiv:2610.33113, con pesos entrenados liberados en Hugging Face bajo licencia MIT.

El problema que resuelve es la estimacion de multiples pitches (MPE) bajo restricciones de latencia: el modelo procesa el audio en tramas de 20 ms y puede revisar una trama hasta su plazo de salida (por ejemplo, 50 ms). En una sola hebra de CPU tarda unos 2,4 ms por trama, lo que lo hace viable para sistemas embebidos y aplicaciones de bajo consumo.

Arquitectura causal con cinco cabezas de retardo (0, 20, 40, 80 y 160 ms) que permiten adaptar la precision al plazo disponible. El repositorio incluye ademas los modelos CRNN de comparacion entrenados para el paper (variantes causales y bidireccionales), todos con recuentos de parametros entre 83.729 y 95.767.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal causal con cinco cabezas de retardo (JIT-MPE); CRNN para los modelos de comparacion |
| Parametros totales | 86.425 (modelo S, JIT-MPE); 83.729-95.767 en los CRNN de comparacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | procesamiento por tramas de 20 ms; ventana efectiva dependiente de la cabeza de retardo (hasta 160 ms hacia delante) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (21 archivos, uno por sistema y semilla) mas JSON de calibracion y de seleccion de cabeza |

## Arquitectura y entrenamiento

JIT-MPE es un modelo causal que procesa audio en tramas de 20 ms y produce una estimacion de pitches activos con una frecuencia fina por nota. Su rasgo diferencial son las cinco cabezas de retardo que miran 0, 20, 40, 80 y 160 ms hacia delante; para cada plazo de salida, un fichero de seleccion de cabeza indica cual usar (por ejemplo, para 50 ms se usa la cabeza de 40 ms). Esto permite un compromiso controlado entre latencia y precision sin reentrenar. Los modelos CRNN de comparacion (Harmonic, Dilated y Plain, en versiones causales y bidireccionales) sirven de referencia experimental en el paper; las variantes bidireccionales solo funcionan con la entrada completa.

El entrenamiento se realizo sobre GuitarSet, Slakh2100-redux, MusicNet, Schubert Winterreise, Cantoria, Dagstuhl ChoirSet, vocadito y Groove MIDI, con tres semillas independientes (1, 3 y 5) por sistema; el paper reporta la media de las tres ejecuciones, no un ensemble. Los recuentos de parametros excluyen la cabeza auxiliar de onsets, usada solo en entrenamiento pero almacenada en los checkpoints. No se especifica en la informacion disponible el numero total de tokens ni si hubo RLHF/DPO (no aplica a una tarea de estimacion).

## Capacidades

- Estimacion de multiples pitches simultaneos en audio de ensembles mixtos.
- Rango de pitches MIDI 21-108 (A0-C8), con estimacion fina de frecuencia (Hz) por nota activa.
- Procesamiento causal en tramas de 20 ms con plazos de salida configurables.
- Revision de una trama hasta su deadline mediante seleccion de cabeza de retardo.
- Salida en CSV (una fila cada 10 ms con tiempos y frecuencias) o NPZ (`times [Q]`, `frequencies [Q, 88]`).
- Modo sin plazo: procesamiento de fichero completo omitiendo `clock` y `deadline_ms`.
- Modo streaming por trama mediante `model.step` (referencia en `bench/cpu.py` del repositorio).
- No soporta tool calling, agentes ni capacidades linguisticas: es un modelo puramente de audio.

## Casos de uso

- Afinacion y transcripcion en tiempo real: el modelo puede integrarse en un afinador polifonico o en un transcriptor MIDI que procese audio en vivo con latencia de decenas de milisegundos, gracias a sus tramas de 20 ms y su coste de 2,4 ms por trama en una hebra de CPU.
- Pedagogia musical interactiva: deteccion de notas tocadas por un alumno en un piano o ensemble para retroalimentacion inmediata, aprovechando la estimacion fina de frecuencia por nota.
- Analisis de grabaciones de ensembles: extraccion de pitches activos de audio mixto para analisis musicologico offline, usando el modo sin plazo para maxima precision.
- Sistemas embebidos y de bajo consumo: al tener 86k parametros y ejecutarse en CPU, cabe en dispositivos sin GPU para aplicaciones de monitorizacion musical.
- Sincronizacion y seguimiento en directo: la cabeza de 160 ms permite anticipar cambios armonicos en pipelines que toleran mayor latencia a cambio de precision.
- Investigacion en MIR: punto de partida reproducible (tres semillas, pesos y configuraciones publicados) para comparar metodos de MPE bajo restricciones de latencia.
- Herramientas de practica con acompanamiento: deteccion de notas para generar acompanamiento adaptativo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el paper reporta la media de tres semillas por sistema, pero no incluye las cifras numericas; para resultados concretos debe consultarse arXiv:2610.33113.

## Requisitos de hardware

- VRAM: no aplica en la practica; el modelo funciona en CPU (86k parametros, pesos de pocos cientos de KB).
- GPU recomendadas: no necesarias; cualquier GPU moderna puede ejecutarlo, pero el diseno apunta a CPU.
- Consumer GPU: si, en cualquier GPU consumer, aunque el caso de uso natural es CPU.
- Despliegue: no compatible con `AutoModel` ni con el `pipeline` de Transformers; requiere el paquete `jit_mpe` del repositorio de GitHub en la revision `08bbd5acbb223962895f847a86c2d47a36179896`.
- Latencia: aproximadamente 2,4 ms por trama de 20 ms en una sola hebra de CPU.
- Throughput: no disponible de forma explicita; implicito de la latencia por trama.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / tramas | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| JIT-MPE (S) | 86.425 | Causal, cinco cabezas de retardo | 20 ms por trama, hasta 160 ms de anticipacion | MIT | Pesos en Hugging Face |
| Harmonic CRNN (A0) | 85.813 | Causal, una cabeza | 20 ms por trama | MIT | Pesos en Hugging Face |
| Dilated CRNN (A1d) | 95.767 | Causal, una cabeza | 20 ms por trama | MIT | Pesos en Hugging Face |
| Plain CRNN (B1) | 95.767 | Causal, una cabeza | 20 ms por trama | MIT | Pesos en Hugging Face |
| Harmonic BiCRNN (A0-bi) | 83.729 | Bidireccional, entrada completa | Solo fichero completo | MIT | Pesos en Hugging Face |

Los sistemas externos comparados en el paper no se incluyen en el repositorio; deben obtenerse de sus autores. No se dispone de datos numericos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de piano (MIDI 21-108); no cubre otros instrumentos ni percusion como pitches.
- Las variantes bidireccionales (`-bi`) solo procesan ficheros completos y no sirven para streaming.
- El modo `scheduled_stale_hold` puede devolver una trama ligeramente antigua si no hay una lista a tiempo.
- `estimate` reproduce lo que un sistema en tiempo real habria emitido, pero no es un callback de audio en vivo; para streaming real debe usarse `model.step`.
- No es cargable con `AutoModel` ni `pipeline` de Transformers; requiere el paquete propio y ficheros de calibracion y seleccion de cabeza emparejados por semilla.
- Riesgo de sesgo hacia los datasets de entrenamiento (GuitarSet, Slakh2100-redux, MusicNet, etc.); el rendimiento fuera de esa distribucion no esta documentado.
- No se han publicado datos de cuantizacion ni de despliegue en formatos como GGUF.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y creditos de terceros (`THIRD_PARTY.md`).

## Enlaces

- Hugging Face: https://huggingface.co/Frieve-A/jit-mpe
- Paper: https://arxiv.org/abs/2610.33113
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2610.33113
- Codigo fuente: https://github.com/Frieve-A/jit-mpe/tree/08bbd5acbb223962895f847a86c2d47a36179896
- Licencia: https://huggingface.co/Frieve-A/jit-mpe/blob/main/LICENSE
- Creditos de datos y software: https://huggingface.co/Frieve-A/jit-mpe/blob/main/THIRD_PARTY.md
