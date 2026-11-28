# leonpham1208/stitch-blockbase

## Resumen

STITCH Blockbase es una coleccion de modelos preentrenados de series temporales publicada por leonpham1208 en Hugging Face bajo licencia MIT. No se trata de un unico modelo, sino de un repositorio de 435 modelos individuales organizados en dos carpetas: `paper_v2_l1/` (360 modelos) y `multimodal_v2/` (75 modelos). Cada modelo es un bloque residual de prediccion entrenado sobre un dataset, arquitectura, contexto y horizonte concretos, y esta pensado para ser combinado mediante la tecnica de model stitching que da nombre al proyecto.

El repositorio cubre los datasets clasicos de forecasting (ETTh1, ETTh2, ETTm1, ETTm2, Weather) con tres arquitecturas (MLP, LSTM y Attention), longitudes de contexto de 64 a 2048 tokens y horizontes de prediccion de 96, 192, 336 y 720 pasos. La carpeta multimodal extiende esta cobertura a dominios de Time-MMD (Economy, Energy, Security, SocialGood y Traffic), adaptando los modelos base de ETT y Weather.

La relevancia de este repositorio es practica: ofrece una base de bloques preentrenados reutilizables para experimentar con composicion de modelos de series temporales sin tener que entrenar desde cero. Cada carpeta incluye el state dict (`model.pt`) y un `record.json` con metadatos de entrenamiento (dataset, arquitectura, contexto, horizonte, configuracion de bloques y perdida de validacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloques residuales de prediccion sobre MLP, LSTM y Attention (6 bloques residuales por modelo) |
| Parametros totales | no disponible (depende de cada bloque; no se publica el recuento por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 a 2048 pasos temporales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`) + metadatos en `record.json` |

## Arquitectura y entrenamiento

Cada modelo del repositorio es un bloque residual de prediccion compuesto por 6 bloques residuales, construido sobre una de tres arquitecturas base: MLP, LSTM o Attention. Los modelos se entrenan de forma independiente sobre el split de entrenamiento de su propio dataset, con una combinacion fija de contexto (64 a 2048) y horizonte (96, 192, 336 o 720). No se trata por tanto de un modelo fundacional unico, sino de una factoria de bloques especializados que el framework STITCH compone para construir predictores de mayor capacidad.

Los datasets cubiertos en `paper_v2_l1/` son ETTh1, ETTh2, ETTm1, ETTm2 y Weather, con 360 modelos en total (5 datasets x 3 arquitecturas x contextos x horizontes). La carpeta `multimodal_v2/` contiene 75 modelos derivados de los anteriores y adaptados a los dominios de Time-MMD: Economy, Energy, Security, SocialGood y Traffic. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se aplicaron tecnicas de regularizacion o ajuste fino mas alla del entrenamiento supervisado estandar. Cada `record.json` documenta la perdida de validacion de su bloque correspondiente.

## Capacidades

- Prediccion de series temporales univariantes y multivariantes a horizontes de 96, 192, 336 y 720 pasos.
- Cobertura de contextos de entrada desde 64 hasta 2048 pasos, lo que permite desde forecasting de corto plazo hasta ventanas largas.
- Tres familias de arquitectura (MLP, LSTM, Attention) para comparar sesgos inductivos en la misma tarea.
- Adaptacion a dominios especificos mediante los bloques de `multimodal_v2/` (Economy, Energy, Security, SocialGood, Traffic).
- Composicion mediante model stitching: los bloques pueden combinarse para formar predictores de mayor profundidad o capacidad.
- Metadatos por bloque (`record.json`) con dataset, arquitectura, contexto, horizonte, configuracion de bloques y perdida de validacion, lo que facilita la seleccion automatizada.
- No soporta tool calling, agentes, generacion de texto, vision ni audio: es exclusivamente un modelo de forecasting.

## Casos de uso

- Forecasting energetico: usar los bloques de ETTh1/ETTm1 y Weather para predecir consumo o generacion con horizontes de 96 a 720 pasos; la disponibilidad de contextos de 64 a 2048 permite ajustar la ventana al regimen de sampling de los contadores.
- Prediccion de trafico: los bloques de Time-MMD (dominio Traffic) permiten construir predictores de flujo viario a varios horizontes sin entrenamiento desde cero, partiendo de bloques ya ajustados al dominio.
- Investigacion en model stitching: el repositorio esta disenado explicitamente para experimentar con composicion de bloques; un investigador puede emparejar bloques de distinta arquitectura y contexto y evaluar la perdida de validacion registrada en cada `record.json`.
- Baselines reproducibles: los 360 modelos de `paper_v2_l1/` cubren la matriz completa de datasets, arquitecturas, contextos y horizontes, lo que permite usarlos como linea base en comparaciones de nuevos metodos de forecasting.
- Analisis economico y de seguridad: los bloques de Time-MMD en Economy y Security sirven para prototipar predicciones sobre series de esos dominios con un coste de entrenamiento nulo.
- Seleccion automatizada de modelos: el `record.json` de cada bloque permite filtrar por perdida de validacion y escoger el mejor bloque para un dataset y horizonte dados, integrable en pipelines de AutoML para series temporales.
- Educacion y prototipado: al ser pesos PyTorch estandar con licencia MIT, se pueden cargar en cualquier entorno con `torch.load` para demostraciones y cursos sobre forecasting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que cada `record.json` incluye la perdida de validacion del bloque correspondiente, pero no se proporcionan tablas comparativas con otros modelos ni metricas agregadas (MSE, MAE) en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el repositorio completo ocupa 1,7 GB, pero cada bloque individual es un state dict pequeno (MLP, LSTM o Attention con 6 bloques residuales) que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para cargar y ejecutar un bloque individual; para barrer los 435 modelos en paralelo se recomienda una A100 o H100 por throughput.
- Cabe en GPU consumer: si, practicamente cualquier RTX (3060 en adelante) puede ejecutar bloques individuales.
- Opciones de despliegue: al ser pesos PyTorch (`model.pt`) y no estar en formato GGUF ni safetensors, el despliegue se realiza cargando el state dict con PyTorch; no hay soporte nativo documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con otras librerias de forecasting (por ejemplo, GluonTS, Darts o Nixtla) ni con modelos fundacionales de series temporales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera de forecasting de series temporales no esta contemplado.
- Cobertura limitada a los datasets de ETT, Weather y los cinco dominios de Time-MMD; el rendimiento fuera de esos dominios no esta garantizado.
- Cada bloque esta entrenado sobre el split de entrenamiento de su propio dataset, por lo que no se ha validado su generalizacion cruzada entre dominios.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets publicos de series temporales pueden heredar los sesgos de muestreo de esos datos.
- Riesgo de sobreajuste en horizontes largos (720 pasos) no cuantificado en la informacion disponible.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No hay informacion sobre cuantizacion ni sobre formatos alternativos a PyTorch, lo que limita su integracion en stacks de inferencia optimizados.
- La fecha de creacion del repositorio (2026-11-28) y la ausencia de pipeline declarado en Hugging Face deben tenerse en cuenta al evaluar su madurez.

## Enlaces

- Hugging Face: https://huggingface.co/leonpham1208/stitch-blockbase
- Codigo del proyecto STITCH: https://github.com/LeonStandford/STITCH
