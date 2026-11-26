# kashif/weathernext2-model3

## Resumen

WeatherNext 2 (model3) es un modelo global de predicción meteorológica a medio plazo desarrollado por Google DeepMind y Google Research. Cada pasada forward avanza el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud, prediciendo 13 niveles de presión para temperatura, geopotencial, viento y humedad, junto con campos de superficie, precipitación, vientos a 100 m y un conjunto de diagnósticos de ciclones tropicales.

La innovación clave es su naturaleza de *Functional Generative Network* (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo usa para modular la escala y el offset de **cada** capa de normalización. Una extracción produce una predicción autoconsistente, y un ensemble es simplemente varias extracciones alineadas con la dimensión de batch.

Este repositorio concreto corresponde a las pesos `WeatherNext2_<2025_model3`, entrenados con datos hasta 2024 y afinados para inicialización desde el análisis operativo ECMWF HRES. Es la tercera de cuatro ejecuciones de entrenamiento independientes (model1 a model4), que pueden combinarse para formar ensembles multi-modelo. La relevancia actual radica en que sustituye componentes de los pipelines tradicionales de predicción numérica del tiempo (NWP) con un modelo neuronal generativo de solo 215 millones de parámetros, manteniendo resolución espacial operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (Functional Generative Network, FGN) sobre malla icosaédrica |
| Parametros totales | 215.424.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 2 pasos temporales de 6 h para inicialización) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no aplica (modelo meteorológico, sin procesamiento de lenguaje) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red neuronal de grafos (GNN) que opera sobre una malla icosaédrica de 40.962 nodos, correspondiente a una resolución de 0,25° (rejilla de 721×1440). La arquitectura se denomina *Functional Generative Network*: el componente generativo no reside en un proceso de difusión iterativo, sino en la modulación de todas las capas de normalización mediante un vector latente de 32 dimensiones muestreado por el procesador. Esto permite generar ensembles de forma eficiente, ya que cada miembro adicional es simplemente una fila más en el batch.

El entrenamiento se realizó con datos hasta 2024, con un ajuste fino específico para la inicialización desde el análisis operativo ECMWF HRES. Se dispone de cuatro ejecuciones de entrenamiento independientes (model1 a model4) que permiten construir ensembles multi-modelo. El modelo predice campos normalizados; el `WeatherNext2FeatureExtractor` gestiona la normalización, los forzamientos temporales (clock forcings) y la conversión de vuelta a unidades físicas. No se detalla en la información disponible el número exacto de tokens ni la composición completa del dataset de entrenamiento, ni si se emplearon técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Predicción meteorológica global a medio plazo con paso temporal de 6 horas y resolución de 0,25°.
- Predicción de 13 niveles de presión para temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie, precipitación y vientos a 100 m.
- Diagnósticos de ciclones tropicales.
- Generación de ensembles mediante muestreo de ruido (ensemble de ruido) y combinación de múltiples ejecuciones de entrenamiento (ensemble multi-modelo).
- Rollout autorregresivo mediante `generate()` con estado propio por miembro y muestreo de ruido fresco en cada paso.
- Inicialización desde dos fotogramas cronológicos de análisis HRES separados 6 horas.
- Soporte de `device_map="auto"` y ejecución en GPU mediante PyTorch y Accelerate.
- No soporta tool calling, agentes ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Predicción operativa a medio plazo: el modelo puede generar pronósticos globales a 5 días (20 pasos de 6 horas) mediante `generate(num_steps=20)`, sustituyendo o complementando componentes de pipelines NWP tradicionales con un coste computacional muy inferior.
- Generación de ensembles probabilísticos: con `num_members=8` se obtienen 8 predicciones autoconsistentes que comparten pesos pero difieren en ruido, permitiendo estimar incertidumbre en variables como temperatura a 2 m o precipitación.
- Ensemble multi-modelo: combinando las cuatro ejecuciones (model1 a model4) se agrupan ambos tipos de ensemble (ruido y multi-modelo) para mejorar la robustez estadística de la predicción.
- Predicción de ciclones tropicales: los diagnósticos de ciclones incluidos permiten alimentar sistemas de alerta temprana y seguimiento de trayectorias.
- Investigación climática y atmosférica: el modelo sirve como banco de pruebas para estudiar la destilación de NWP en redes neuronales y la generación funcional de ensembles.
- Evaluación comparativa de ensembles: al disponer de cuatro checkpoints independientes, es posible analizar la dispersión entre ejecuciones de entrenamiento como proxy de incertidumbre epistémica.
- Integración en pipelines de investigación con Transformers: una vez fusionado el PR de soporte, el modelo se integra con la API estándar de Transformers (`from_pretrained`, `generate`), facilitando su uso en flujos de experimentación existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 215,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,86 GB; en bf16, unos 0,43 GB. El repositorio completo ocupa 2,2 GB, lo que sugiere que puede incluir pesos adicionales o checkpoints auxiliares.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en bf16/fp32; para ensembles grandes o rollouts autorregresivos conviene disponer de 16 GB o más (A100, H100, RTX 4090, RTX 3090).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4090, entre otras, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch con Transformers (rama `add-weathernext2` de kashif hasta que se fusione el PR #47874), Accelerate con `device_map="auto"`. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherNext2 (model3) | 215,4 M | 0,25° (721×1440) | 2 pasos de 6 h | cc-by-4.0 | Hugging Face |
| WeatherNext2 (model1) | 183,8 M | 0,25° (721×1440) | 2 pasos de 6 h | cc-by-4.0 | Hugging Face |
| WeatherNextCyclones | 183,8 M | 0,25° (721×1440) | 2 pasos de 6 h | cc-by-4.0 | Hugging Face |

Nota: los tres modelos pertenecen a la misma familia WeatherNext 2 de Google DeepMind. La diferencia principal entre model3 y model1 es la ejecución de entrenamiento (y en model3 el soporte de vientos a 100 m, que WeatherNextCyclones no incluye). No se dispone de información sobre modelos comparables de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El soporte para WeatherNext 2 aún no está en una versión publicada de Transformers; es necesario instalar la rama `add-weathernext2` del repositorio de kashif hasta que se fusione el PR #47874.
- Este checkpoint requiere entradas de viento a 100 m que no están presentes en los conjuntos de datos de muestra publicados, lo que complica la reproducción directa del ejemplo de la model card.
- El modelo predice campos normalizados; es imprescindible usar `WeatherNext2FeatureExtractor` para la normalización, forzamientos y conversión a unidades físicas.
- La inicialización requiere dos fotogramas cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- El ruido lo muestrea el procesador, no el forward del modelo; no debe pasarse un segundo argumento `noise` ni repetir la máscara sobre los miembros del ensemble.
- En `generate()`, `seconds_since_epoch` debe ser el tiempo válido del primer pronóstico, no el del último fotograma de condicionamiento.
- Al ser un modelo meteorológico, no procesa lenguaje ni soporta tool calling, agentes o capacidades multilingües.
- No se dispone de información sobre sesgos específicos, tasas de alucinación (no aplicable en el sentido habitual) ni restricciones adicionales de la licencia cc-by-4.0 más allá de la atribución.
- El modelo está entrenado con datos hasta 2024 y afinado para inicialización desde ECMWF HRES; su rendimiento fuera de ese régimen de inicialización no está documentado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/weathernext2-model3
- Modelo base (model1): https://huggingface.co/kashif/weathernext2
- Modelo model2: https://huggingface.co/kashif/weathernext2-model2
- Modelo model4: https://huggingface.co/kashif/weathernext2-model4
- WeatherNextCyclones: https://huggingface.co/kashif/weathernext-cyclones
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers.git@add-weathernext2
- Documentación del modelo: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Paper (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
