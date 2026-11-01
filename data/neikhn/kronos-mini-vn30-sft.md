# neikhn/kronos-mini-vn30-sft

## Resumen

Kronos Mini — VN30 SFT es un ajuste fino (SFT) del modelo base NeoQuasar/Kronos-mini, desarrollado por el usuario neikhn. Se trata de un modelo especializado en pronóstico de series temporales financieras, concretamente orientado a predecir la evolución de activos del índice VN30 (las 30 mayores capitalizaciones de la bolsa de Vietnam). El modelo parte de la arquitectura propietaria de Kronos, un transformer diseñado específicamente para datos OHLC (apertura, máximo, mínimo, cierre) y tokenización de series temporales, y ha sido reentrenado sobre una instantánea fija de datos de VNDIRECT.

El modelo tiene 4.108.192 parámetros totales (aproximadamente 4,1 millones), lo que lo sitúa en la categoría de modelos extremadamente ligeros. Emplea el tokenizador NeoQuasar/Kronos-Tokenizer-2k congelado durante el ajuste. El contexto de trabajo se define en 128 sesiones históricas y 20 sesiones futuras de predicción, con inferencia en FP32 y media de 3 trayectorias muestreadas.

Es relevante ahora porque demuestra un patrón de especialización vertical: tomar un modelo fundacional de series temporales y adaptarlo a un mercado concreto mediante SFT reproducible (semilla, commit y hashes documentados). No obstante, el propio autor lo etiqueta como investigación exploratoria y no reclama superioridad frente a la línea base Naive ni rendimiento de trading desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kronos (transformer para series temporales, arquitectura propietaria) |
| Parámetros totales | 4.108.192 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 sesiones históricas de entrada; 20 sesiones de predicción |
| Tipos de cuantización | no disponible (inferencia documentada en FP32) |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje natural) |
| Licencia | MIT, con atribución original a Kronos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Kronos del modelo base NeoQuasar/Kronos-mini, un transformer diseñado para tokenizar y predecir series temporales financieras en formato OHLC. El ajuste fino se realizó sobre una instantánea fija (snapshot) de datos VN30 de VNDIRECT, con 128 sesiones históricas como entrada y 20 sesiones futuras como objetivo. El tokenizador (NeoQuasar/Kronos-Tokenizer-2k) permaneció congelado durante todo el proceso de SFT, de modo que el ajuste afecta únicamente a los pesos del predictor.

El protocolo de entrenamiento es explícitamente reproducible: semilla 42, época 5 seleccionada mediante validación nativa incluyendo la época cero, precisión FP32, temperatura 1.0 y top-p 0.9 en la generación, con media de 3 trayectorias. Los volúmenes e importes ausentes se rellenan con ceros mediante el adaptador. Se documentan hashes SHA256 de la instantánea y se referencian ficheros `provenance.json` e `inference_spec.json` con revisiones y hashes de bytes. No se incluyen el dataset crudo, el optimizador, los estados del RNG ni credenciales. El autor advierte que la construcción de OHLC por parte del proveedor no está completamente verificada.

## Capacidades

- Pronóstico de series temporales financieras en formato OHLC para activos del índice VN30.
- Predicción multi-paso de 20 sesiones futuras a partir de 128 sesiones históricas.
- Generación estocástica de trayectorias (muestreo con temperatura y top-p) y agregación por media de múltiples caminos.
- No dispone de generación de texto, razonamiento, código ni matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No incluye visión ni audio.
- No ofrece API de inferencia alojada: requiere carga local con la implementación Kronos fijada.

## Casos de uso

- Investigación académica sobre adaptación de modelos fundacionales de series temporales a mercados emergentes: el modelo sirve como referencia reproducible (semilla, commit y hashes documentados) para estudiar el efecto del SFT sobre un índice concreto como el VN30.
- Prototipado de pipelines de pronóstico financiero: permite integrar un predictor ligero (4,1 M de parámetros) en entornos locales sin GPU dedicada, con la implementación Kronos fijada en el commit `67b630e6`.
- Evaluación comparativa frente a líneas base Naive: útil para construir experimentos controlados que midan si el ajuste fino aporta valor frente a la persistencia, aunque el autor no reclama superioridad.
- Docencia y formación en modelado de series temporales: el tamaño reducido y el protocolo documentado facilitan reproducir el entrenamiento y la inferencia en un portátil.
- Desarrollo de un panel local de análisis (React/FastAPI incluido en el proyecto): permite visualizar predicciones sobre el VN30 sin depender de servicios en la nube ni de Spaces.
- Validación de ingeniería de datos OHLC: el modelo y su adaptador (con relleno de ceros para volumen e importe ausentes) sirven para probar la consistencia de pipelines de datos financieros antes de usarlos en modelos mayores.
- Análisis de sensibilidad al muestreo: la generación con temperatura 1.0 y top-p 0.9 sobre 3 trayectorias permite estudiar la varianza de las predicciones en escenarios de mercado volátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama superioridad frente a la línea base Naive ni rendimiento de trading desplegable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 4,1 M de parámetros (el modelo completo ocupa aproximadamente 16 MB en FP32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: carga local mediante `Kronos.from_pretrained(local_model_directory)` con la implementación fijada en el commit `67b630e67f6a18c9e9be918d9b4337c960db1e9a`; el proyecto incluye un panel local React/FastAPI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es propietaria.
- Latencia y throughput estimados: no disponibles. La inferencia con media de 3 trayectorias y 20 pasos de predicción sugiere un coste bajo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos Mini — VN30 SFT (este) | 4,1 M | 128 hist. / 20 pred. | Pronóstico OHLC VN30 | MIT | HuggingFace, 0 descargas |
| NeoQuasar/Kronos-mini (base) | no disponible en la información | no disponible | Pronóstico de series temporales | no disponible en la información | HuggingFace |
| Línea base Naive (persistencia) | 0 | n/a | Pronóstico trivial | n/a | Referencia estándar |
| Otros modelos de series temporales (p. ej. Chronos, TimesFM) | no disponible en la información | no disponible | Pronóstico general | no disponible en la información | no disponible en la información |

La comparación con Chronos o TimesFM no puede cuantificarse con los datos proporcionados; se citan únicamente como categorías de referencia.

## Limitaciones y advertencias

- Modelo etiquetado por el autor como investigación exploratoria; no se reclama rendimiento de trading desplegable.
- La construcción de OHLC por parte del proveedor (VNDIRECT) no está completamente verificada, lo que introduce incertidumbre sobre la calidad de los datos de entrenamiento.
- No se ha demostrado superioridad frente a la línea base Naive; el valor predictivo real es incierto.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un único índice (VN30) y una única instantánea, el modelo puede sobreajustarse a regímenes de mercado específicos del periodo cubierto.
- Riesgo de alucinación en el sentido de generar trayectorias plausibles pero no fundamentadas; la naturaleza estocástica del muestreo amplifica este riesgo.
- Limitaciones de contexto: ventana fija de 128 sesiones históricas y 20 de predicción; no admite entradas más largas sin reentrenamiento o adaptación.
- Limitaciones de idioma: no aplica, al ser un modelo numérico sin capacidades de lenguaje natural.
- Restricciones de licencia: MIT permite uso comercial con atribución a Kronos; sin embargo, el propio autor desaconseja implícitamente el uso en producción por la falta de validación.
- Caveat para producción: requiere la implementación Kronos fijada en un commit concreto y el tokenizador en otro commit concreto; cambios en esas dependencias pueden romper la reproducibilidad.
- No se incluyen dataset crudo, optimizador, estados del RNG ni credenciales, lo que limita la reproducción completa del entrenamiento (solo se documentan hashes y semilla).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neikhn/kronos-mini-vn30-sft
- Modelo base: https://huggingface.co/NeoQuasar/Kronos-mini
- Tokenizador: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k
- Implementación Kronos (commit fijado): https://github.com/NeoQuasar/Kronos/tree/67b630e67f6a18c9e9be918d9b4337c960db1e9a
- Tokenizador (commit fijado): https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k/tree/26966d0035065a0cae0ebad7af8ece35bc1fb51c
