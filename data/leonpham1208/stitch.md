# leonpham1208/stitch

## Resumen

STITCH (Shortest-path Transplantation of Interchangeable Time-series blocks with Calibrated Hedging) es un sistema de forecasting de series temporales disenado para mantener la precision de un modelo cuando el flujo de datos sufre deriva (drift). Cuando se detecta deriva, STITCH reconstruye la red servida a partir de segmentos de bloques de otros modelos preentrenados mediante una busqueda de camino minimo sobre un grafo de segmentos, reajusta la red resultante y la contrasta (hedging) contra la anterior. El repositorio de Hugging Face no contiene el codigo de STITCH, sino el **pool de bloques preentrenados** sobre el que se realiza la busqueda.

El pool lo forman **435 modelos de forecasting** cuyos bloques residuales comparten una interfaz comun, de modo que cualquier bloque puede transplantarse a otro modelo de la misma forma. Se cubren tres arquitecturas (MLP de 2,1 M de parametros, LSTM de 2,5 M y Attention de 2,5 M), seis longitudes de contexto (64 a 2048), cuatro horizontes (96, 192, 336 y 720) y diez conjuntos de datos repartidos en dos carpetas: `ett-weather/` (360 modelos) y `time-mmd/` (75 modelos).

Es relevante para investigadores en aprendizaje continuo y mantenimiento de modelos en produccion: ofrece una infraestructura lista para evaluar tecnicas de modularidad y transplantacion de bloques sin tener que reentrenar desde cero. El autor es leonpham1208 y la licencia es MIT. El paper esta anunciado como "coming soon" y no hay resultados publicados fuera de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (2,1 M parametros), LSTM (2,5 M), Attention (2,5 M); 6 bloques residuales por modelo |
| Parametros totales | 2,1 M (MLP) / 2,5 M (LSTM) / 2,5 M (Attention) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64, 128, 256, 512, 1024, 2048 |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`) + `record.json` por modelo |
| Horizonte de prediccion | 96, 192, 336, 720 |
| Patch length | 16 sobre un stream compartido de 512 pasos |
| Hidden size | 64; 3 capas por bloque; cabeza lineal |
| Tratamiento de canales | channel-independent (una variable por forward pass) |
| Tamano del repo | 4,4 GB |

## Arquitectura y entrenamiento

Cada modelo del pool es una red de forecasting con seis bloques residuales que comparten una interfaz comun sobre un stream de 512 pasos, con patch length de 16, hidden size de 64, tres capas por bloque y una cabeza lineal. Las tres familias son MLP, LSTM y Attention, y el procesamiento es channel-independent: cada variable se pasa por separado en un forward pass. La innovacion no esta en la arquitectura individual (deliberadamente ligera, entre 2,1 y 2,5 M de parametros) sino en la **homogeneidad de la interfaz de bloque**, que permite transplantar bloques entre modelos de la misma forma.

El entrenamiento se realiza por modelo sobre el split de train de su propio dataset, seguido de un ajuste fino con perdida MAE (20 epocas, early stopping con paciencia 3, learning rate 1e-4, batch size 256). Los 75 modelos de `time-mmd/` parten de un modelo de `ett-weather/` y se adaptan al dominio correspondiente (hasta 100 epocas, paciencia 10, learning rate 1e-4, batch size 32). El sistema STITCH completo, descrito en el repositorio de GitHub, anade la busqueda de camino minimo sobre el grafo de segmentos, el reajuste de la red stitched y el hedging contra el modelo previo; estos componentes no se distribuyen en este repositorio de Hugging Face.

## Capacidades

- Forecasting univariante channel-independent de series temporales con horizontes de 96, 192, 336 y 720 pasos.
- Cobertura de contextos desde 64 hasta 2048 pasos, lo que permite desde prediccion de corto plazo hasta ventanas largas.
- Tres familias de arquitectura intercambiables (MLP, LSTM, Attention) bajo una misma interfaz de bloque.
- Transplantacion de bloques entre modelos de la misma forma, base del mecanismo de reconstruccion ante deriva.
- Adaptacion a dominios especificos mediante fine-tuning (dominios Economy, Energy, Security, SocialGood y Traffic en Time-MMD).
- Inferencia en CPU o GPU con PyTorch.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo puramente numerico de series temporales.

## Casos de uso

- Monitorizacion de sensores industriales con deriva: cuando la distribucion de las lecturas cambia (desgaste de equipo, recalibracion), STITCH permite reconstruir el predictor a partir de bloques de otros modelos del pool en lugar de reentrenar desde cero, reduciendo el coste de mantenimiento.
- Prediccion de demanda energetica: los modelos de `time-mmd/` adaptados al dominio Energy permiten forecasting a horizonte 96 con contexto de 64 o 128 pasos, adecuado para planificacion horaria de carga.
- Forecasting meteorologico a corto plazo: los modelos de `ett-weather/` cubren Weather con contextos de hasta 2048 pasos y horizontes de hasta 720, utiles para prediccion de temperatura y variables atmosfericas.
- Investigacion en aprendizaje continuo: el pool sirve como banco de pruebas reproducible para evaluar tecnicas de modularidad, transplantacion de bloques y hedging sin necesidad de entrenar 435 modelos propios.
- Prediccion de trafico: el dominio Traffic de Time-MMD muestra la mayor mejora relativa frente a la referencia publicada (MSE 0,032 frente a 0,099), lo que lo hace adecuado para sistemas de gestion de trafico con datos de alta variabilidad.
- Benchmarking de metodos de adaptacion: al disponer de `record.json` con la perdida de validacion de cada modelo, se puede comparar el rendimiento de un metodo propio contra la linea base preentrenada de forma directa.
- Experimentacion con presupuestos reducidos: con 2,1-2,5 M de parametros por modelo, la inferencia y el ajuste fino caben en una unica GPU de consumo, lo que facilita prototipado rapido en entornos academicos.

## Benchmarks y rendimiento

MSE del sistema STITCH completo construido sobre este pool, frente a cifras publicadas (†). ETT/Weather promediado sobre los horizontes 96, 192, 336 y 720; Time-MMD sobre los horizontes de ScenarioDiff. Cada dataset se evalua en su propio split de test.

| Dataset | TimeBlocks† | STITCH |
|---|---|---|
| ETTh1 | 0,416 | **0,410** |
| ETTh2 | **0,338** | 0,346 |
| ETTm1 | 0,344 | **0,334** |
| ETTm2 | **0,242** | 0,249 |
| Weather | 0,220 | **0,219** |

| Dominio | ScenarioDiff† | STITCH |
|---|---|---|
| Economy | 0,216 | **0,193** |
| Energy | 0,225 | **0,202** |
| Security | 74,80 | **69,40** |
| SocialGood | 1,313 | **0,731** |
| Traffic | 0,099 | **0,032** |

STITCH mejora en 7 de los 10 conjuntos evaluados; pierde en ETTh2 y ETTm2 por margenes de 0,008 y 0,007 MSE respectivamente. No se han publicado resultados de benchmarks adicionales ni comparaciones con otros metodos de aprendizaje continuo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por modelo individual (2,1-2,5 M de parametros en fp32), dado el reducido tamano de cada red.
- El pool completo ocupa 4,4 GB en disco; cargar los 435 modelos simultaneamente en memoria requeriria aproximadamente 4-5 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para trabajar con varios modelos a la vez; una RTX 3060 o superior es suficiente. Para el ajuste fino del sistema STITCH completo con busqueda sobre el grafo conviene una RTX 4090, A100 o H100, aunque no se especifican requisitos exactos.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: PyTorch nativo en CPU o GPU; el repositorio no publica integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STITCH (este repo) | 2,1-2,5 M por modelo | 64-2048 | Pool de bloques transplantables + hedging | MIT | Hugging Face + GitHub |
| TimeBlocks | no disponible | no disponible | Forecasting por bloques temporales | no disponible | Referencia publicada (†) |
| ScenarioDiff | no disponible | no disponible | Difusion para forecasting multi-dominio | no disponible | Referencia publicada (†) |

La comparacion se limita a las lineas base citadas en la propia model card (TimeBlocks y ScenarioDiff), de las que solo se dispone de las cifras de MSE. No se dispone de informacion sobre parametros, contexto ni licencia de esos metodos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el pool de bloques preentrenados; el sistema STITCH (busqueda de camino minimo, reajuste y hedging) reside en el repositorio de GitHub y debe instalarse por separado.
- Cada modelo se entrena solo con el split de train de su propio dataset, por lo que la generalizacion fuera de la distribucion de entrenamiento no esta garantizada.
- El procesamiento es channel-independent: no modela correlaciones entre variables en un mismo forward pass, lo que puede penalizar en dominios con dependencias cruzadas fuertes.
- No hay paper publicado ("coming soon"), lo que limita la verificacion independiente de la metodologia y de los resultados.
- Los benchmarks de la model card comparan el sistema completo contra cifras publicadas por terceros (†), no contra ejecuciones reproducidas por el autor; pueden existir diferencias de protocolo de evaluacion.
- El modelo no tiene capacidades linguisticas, de vision ni de agente: cualquier uso fuera de forecasting de series temporales numericas no es aplicable.
- No se han publicado analisis de sesgo ni de robustez ante datos anomalos o faltantes.
- La licencia MIT permite uso comercial, pero al no haber paper ni validacion externa conviene auditar el comportamiento en el dominio objetivo antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/leonpham1208/stitch
- Repositorio GitHub: https://github.com/LeonStandford/STITCH
- Carpeta `ett-weather/`: https://huggingface.co/leonpham1208/stitch/tree/main/ett-weather
- Carpeta `time-mmd/`: https://huggingface.co/leonpham1208/stitch/tree/main/time-mmd
- Paper: pendiente de publicacion ("coming soon")
