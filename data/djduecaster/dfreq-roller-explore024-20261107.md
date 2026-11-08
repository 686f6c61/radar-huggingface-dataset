# djduecaster/dfreq-roller-explore024-20261107

## Resumen

`dfreq-roller-explore024-20261107` es un checkpoint de investigacion publicado por el usuario djduecaster en Hugging Face dentro del ecosistema denominado microduck-arena. No se trata de un modelo de lenguaje, sino de una politica de control para robotica (pipeline `robotics`) exportada en formato ONNX, con una entrada de observaciones de 61 valores float32 y una salida de 14 acciones float32 a 50 Hz. El modelo esta disenado para la tarea "roller-sprint-2m" con comando 1.1 y accesorios de tipo rollers.

El checkpoint corresponde al paso 24 de un entrenamiento PPO ejecutado sobre Apple Silicon con fisica nativa en CPU y calculo de la capa de salida en MPS. Segun la model card, hereda el backbone neuronal Pollen y un controlador de retroalimentacion N8 previo, y solo modifica los 1.806 parametros de la capa de salida respecto al checkpoint Explore016 ya publicado; la topologia del grafo y el resto de pesos permanecen sin cambios.

Su relevancia es acotada: el propio autor lo describe como un candidato "points-only", no como una mejora. Es mas lento que su mejor marca personal publicada (2,570 s) y el objetivo de mejora original, asi como la guarda de no inferioridad de +30 ms, fallaron y siguen fallando. Se publica para disponer de entradas diarias validas y distintas en el entorno de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (backbone Pollen heredado + capa de salida entrenada con PPO); grafo ONNX |
| Parametros totales | no disponible (solo se documentan 1.806 parametros en la capa de salida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija obs[1,61]; sin concepto de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no aplica (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | no disponible (la model card remite a `upstream-base-card.md` y `LICENSE-NOTE.txt`; no se declara licencia nueva de redistribucion) |
| Formato de pesos | ONNX (float32) |

## Arquitectura y entrenamiento

La politica es una red neuronal cuya topologia de grafo se mantiene igual que en el checkpoint Explore016; unicamente se han reentrenado los 1.806 parametros de la capa de salida. El entrenamiento se realizo con PPO (Proximal Policy Optimization) usando fisica nativa en CPU y el calculo de la capa de salida en MPS sobre Apple Silicon. El autor afirma explicitamente que se trata de entrenamiento real y no de una variante basada solo en hash.

El modelo consume observaciones de 61 valores float32 y produce 14 acciones float32 a 50 Hz, sin operadores personalizados, tensores externos, reloj, consulta de semillas ni tabla de acciones en cache. La model card indica que el backbone neuronal Pollen y el controlador de retroalimentacion N8 previo son heredados y se acreditan en `upstream-base-card.md`. No se detalla el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, que en este dominio no aplican del mismo modo que en modelos de lenguaje.

## Capacidades

- Control de politica para la tarea "roller-sprint-2m" con comando 1.1 y accesorios rollers.
- Inferencia en tiempo real a 50 Hz con entrada obs[1,61] y salida actions[1,14] en float32.
- Ejecucion en CPU mediante ONNX Runtime, sin operadores personalizados ni dependencias externas.
- Validacion local de finalizacion: 32/32 arranques ordinarios y 16/16 arranques con estres de comando en la validacion del 7 de noviembre; 128/128 ordinarios y 64/64 de estres en validaciones anteriores.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Evaluacion en el entorno microduck-arena: el checkpoint puede presentarse como entrada diaria valida en la tarea roller-sprint-2m, ya que cumple los criterios de formato y finalizacion exigidos por el evaluador local.
- Pruebas de robustez ante comandos variables: los resultados de 16/16 y 64/64 arranques con estres de comando permiten usarlo como referencia para comparar la estabilidad de otras politicas bajo perturbaciones del comando.
- Benchmarking de velocidad en simulador: con tiempos canonicos de 2,765, 2,710, 2,755, 2,710 y 2,785 s y una media de 2,745 s en el barrido de velocidad, sirve como punto de comparacion reproducible frente a otros checkpoints.
- Reproduccion de experimentos de PPO: al estar documentado el proceso (fisica en CPU, capa de salida en MPS, checkpoint 24), puede utilizarse para reproducir y auditar el pipeline de entrenamiento.
- Integracion en pipelines ONNX Runtime en CPU: al no requerir operadores personalizados ni tensores externos, es adecuado para despliegues ligeros en entornos sin GPU.
- Analisis de sensibilidad de la capa de salida: al diferir solo en 1.806 parametros respecto a Explore016, permite estudiar el impacto de reentrenar exclusivamente la capa de salida manteniendo fijo el resto del grafo.
- Verificacion de integridad de artefactos: el SHA256 publicado facilita la comprobacion de que el binario desplegado coincide con el checkpoint distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son las mediciones locales del autor en simulador sobre Apple Silicon:

| Metrica | Resultado |
|---|---|
| Barrido de velocidad local (evaluador original de Arena) | 2,745 s, 5/5 finalizaciones |
| Tiempos canonicos con comando fijo | 2,765 / 2,710 / 2,755 / 2,710 / 2,785 s |
| Validacion del 7 de noviembre, arranques ordinarios | 32/32 |
| Validacion del 7 de noviembre, arranques con estres de comando | 16/16 |
| Validacion anterior, arranques ordinarios | 128/128 |
| Validacion anterior, arranques con estres de comando | 64/64 |
| Mejor marca personal publicada (Roller) | 2,570 s (este checkpoint es mas lento) |

Estos resultados son locales y no constituyen puntuaciones oficiales del servidor; la aceptacion, finalizacion y puntos en Arena no estan garantizados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en CPU con ONNX Runtime y un grafo de muy pocos parametros en la capa de salida.
- GPU recomendadas: no se especifican; el entrenamiento uso MPS en Apple Silicon y la inferencia se describe como nativa en CPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamano descrito (repo de 0,0 GB y 1.806 parametros entrenados) no deberia requerir GPU dedicada.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX, float32, sin operadores personalizados).
- Latencia y throughput: la politica opera a 50 Hz segun la model card; no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfreq-roller-explore024-20261107 | Politica robotica ONNX (PPO) | 1.806 parametros entrenados en la capa de salida | no aplica (obs[1,61]) | 2,745 s en barrido local; 5/5 finalizaciones | no disponible | Hugging Face |
| dfreq-roller-native-calibration-20261103 | Calibracion de comando (sesgo compartido de -0,056 m/s) | Sin entrenamiento de pesos neuronales | no aplica (61 -> 14 float32) | Confirmado sobre 256 arranques de desarrollo | no disponible | Hugging Face |
| Explore016 (referencia del autor) | Politica robotica ONNX (PPO) | Misma topologia; pesos de salida distintos | no aplica | No disponible en la informacion proporcionada | no disponible | Referenciado en la model card |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Candidato "points-only": el autor lo describe explicitamente como no una mejora; es mas lento que la mejor marca personal publicada (2,570 s frente a 2,745 s).
- El objetivo de mejora original y la guarda de no inferioridad de +30 ms fallaron y siguen fallando; superar las pruebas de finalizacion no revierte esos fallos.
- Resultados obtenidos en simulador local sobre Apple Silicon, no puntuaciones oficiales del servidor; la aceptacion en Arena, la finalizacion y los puntos no estan garantizados.
- Solo simulacion: no existe garantia de seguridad para un robot real.
- Licencia no declarada de forma explicita; los terminos heredados y la atribucion remiten a `upstream-base-card.md` y `LICENSE-NOTE.txt`, y no se afirma una licencia nueva de redistribucion general. Verificar antes de cualquier uso comercial.
- Sin capacidades linguisticas, de vision, audio o agentes; cualquier expectativa en ese sentido es inaplicable.
- No se detallan sesgos, tasas de alucinacion ni limitaciones de contexto porque el modelo no opera en esos dominios; el riesgo principal es el fallo de la politica en escenarios no cubiertos por las validaciones (arranques ordinarios y con estres de comando).
- No se modifico ninguna politica Tug ni entrada de Cup segun la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-explore024-20261107
- Checkpoint de calibracion relacionado: https://huggingface.co/djduecaster/dfreq-roller-native-calibration-20261103
- Arbol de archivos del checkpoint de calibracion: https://huggingface.co/djduecaster/dfreq-roller-native-calibration-20261103/tree/main
