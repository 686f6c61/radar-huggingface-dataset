# gojiberries/instate

## Resumen

El repositorio `gojiberries/instate` de HuggingFace contiene los artefactos del modelo para el paquete `instate` 3.1.0, desarrollado por `appeler`. No se trata de un modelo de lenguaje generativo, sino de un conjunto de pesos de PyTorch que permiten estimar la composicion estatal de apellidos en India. El checkpoint es un `state dict` de un LSTM bidireccional de dos capas a nivel de caracteres, junto con un JSON de calibracion. El modelo produce una distribucion de probabilidad sobre 35 estados y territorios de la Union, a partir de un apellido romanizado en ASCII.

El modelo se entrena sobre rollos electorales parseados y resuelve un problema especifico: estimar la distribucion condicional de un apellido entre estados, a partir de registros electorales. No tiene longitud de contexto en el sentido de los modelos de lenguaje, ni capacidades de generacion de texto, tool calling o razonamiento multi-paso. Su relevancia actual es limitada a la investigacion demografica y sociolinguistica en India, con importantes advertencias sobre cobertura y sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional de dos capas a nivel de caracteres |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de caracteres, no de secuencias largas) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible; entrada romanizada ASCII a-z con al menos tres caracteres |
| Licencia | no disponible; el codigo fuente del paquete `instate` es MIT, pero los pesos requieren consultar los terminos del dataset |
| Formato de pesos | PyTorch state dict (`.pt`) y JSON de calibracion |

## Arquitectura y entrenamiento

El modelo es un LSTM bidireccional de dos capas a nivel de caracteres, definido en `instate.nnets`. No es un transformer, ni un modelo MoE, ni un SSM. El objetivo de entrenamiento es minimizar la entropia cruzada sobre la distribucion condicional de apellidos por estado, ponderada por el numero de registros electorales. Los datos de entrenamiento provienen de rollos electorales parseados: los de 2017 para la mayoria de estados, salvo Assam y Lakshadweep que usan rollos de 2026. Se retienen solo celdas apellido-estado con al menos tres registros, y se muestrean pares con probabilidad proporcional al recuento de registros retenidos.

La seleccion de epoca se realiza sobre los primeros 20,000 nombres de validacion ordenados, usando la metrica `mass_top3`. Despues del entrenamiento, se aplica calibracion por temperatura sobre un conjunto de calibracion separado de 165,007 nombres, obteniendo una temperatura de 1.263. No se mencionan tecnicas como decodificacion especulativa, atencion lineal, RLHF ni DPO. El modelo no incluye un modelo de lenguaje separado: la estimacion de composicion linguistica es una mezcla lineal de la composicion estatal con las proporciones de lengua materna del censo de 2011.

## Capacidades

- Estimacion de composicion estatal: dado un apellido romanizado, devuelve una distribucion calibrada sobre 35 estados y territorios de la Union.
- Calibracion por temperatura: el JSON de calibracion registra la temperatura, el objetivo y las metricas antes y despues de la calibracion.
- Modo de abstencion: entradas fuera de ASCII `a` a `z` o con menos de tres caracteres devuelven una razon legible por maquina bajo el contrato de inferencia de `appeler`.
- Integracion con el paquete `instate`: APIs publicas `estimate_state_composition` y `estimate_language_composition`.
- No genera texto, ni tiene soporte de tool calling, function calling, agentes, vision, audio, ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; solo acepta entrada romanizada en ASCII.

## Casos de uso

- Investigacion demografica sobre apellidos: el modelo permite estimar la distribucion estatal de un apellido a partir de registros electorales, util para estudiar patrones de migracion interna en India.
- Analisis de cobertura de rollos electorales: comparando las distribuciones estimadas con los datos crudos, se pueden identificar estados con cobertura desigual, como Karnataka al 15 por ciento o Gujarat al 52 por ciento.
- Sociolinguistica aplicada: combinando la composicion estatal con el censo de 2011, se pueden estimar composiciones linguisticas de apellidos, aunque la independencia asumida entre apellido e idioma dentro de un estado limita la precision.
- Control de calidad de datos: el modelo puede servir para detectar apellidos con distribuciones anomalas, por ejemplo por errores de OCR en los rollos de Gujarat o por romanizaciones inconsistentes.
- Ensenanza de modelos probabilisticos: como ejemplo de un clasificador de caracteres con salida categorial, calibrado por temperatura, sobre datos publicos de la India.
- Investigacion en procesamiento de lenguaje natural: puede utilizarse como referencia para modelos de caracteres no generativos, en contraste con los grandes modelos de lenguaje.

## Benchmarks y rendimiento

La evaluacion se realizo sobre un test split no tocado de 185,232 apellidos, ponderados por 61.4 millones de registros electorales.

| Metrica | Valor |
|---|---|
| Exactitud modal top 1 / top 3 | 0.508 / 0.764 |
| Cobertura de masa de registros top 1 / top 3 | 0.469 / 0.751 |
| Log loss ponderado por registros, calibrado | 1.724 |
| Brier score ponderado por registros, calibrado | 0.271 |
| Diferencia entre confianza top-1 y masa cubierta | -0.008 (0.074 antes de calibracion) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni de GPU.
- El repositorio ocupa 0.2 GB, por lo que la inferencia es ligera y probablemente factible en CPU.
- No hay datos de latencia ni throughput.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Para despliegues controlados, se puede usar la variable `INSTATE_MODEL_DIR` para evitar la descarga desde HuggingFace.
- El despliegue se realiza a traves del paquete Python `instate`, no mediante servidores de inferencia de modelos de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las salidas describen patrones agregados en los rollos de entrenamiento; no establecen la residencia, origen, idioma, casta, etnia, religion ni identidad de un individuo.
- La cobertura de los rollos es desigual: Karnataka esta al 15 por ciento de su electorado, Jammu y Kashmir y Ladakh al 28 por ciento, Gujarat al 52 por ciento por perdida de OCR, y Assam y Lakshadweep usan rollos de 2026 mientras el resto usa 2017.
- Lakshadweep contribuye solo 3,312 ocurrencias de entrenamiento tras el filtrado, desde 57,618 entradas activas parseadas. En 38 apellidos de prueba con Lakshadweep, el modelo nunca coloca Lakshadweep en sus tres primeras opciones, por lo que la etiqueta anadida no generaliza utilmente.
- Chhattisgarh esta ausente del modelo.
- Los apellidos de estados subrepresentados tienden a ser empujados hacia estados mejor cubiertos que comparten el mismo apellido.
- Los nombres de Gujarat siguen siendo ruidosos debido a errores de OCR.
- La composicion linguistica asume independencia entre apellido e idioma dentro de un estado, lo que subestima asociaciones especificas de comunidad.
- No debe usarse para decisiones sobre una persona ni para acceso a servicios.

## Enlaces

- HuggingFace: https://huggingface.co/gojiberries/instate
- Repositorio del paquete `instate`: https://github.com/appeler/instate
- Corpus de rollos electorales parseados: https://doi.org/10.7910/DVN/MUEGDT
- Corpus PDF: https://doi.org/10.7910/DVN/OG47IV
