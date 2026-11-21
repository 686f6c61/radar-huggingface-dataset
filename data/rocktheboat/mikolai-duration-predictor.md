# RockTheBoat/MikolAI-duration-predictor

## Resumen

MikolAI-duration-predictor es un modelo auxiliar de predicción de duración para un pipeline de síntesis de voz (TTS) en polaco. Desarrollado por RockTheBoat, no genera audio por sí mismo: recibe texto en crudo (caracteres, con mayúsculas) junto con un breve fragmento de latentes de voz y estima la duración total de la locución en segundos. Esa cifra se traduce en el número de frames que el modelo texto→latentes debe generar, lo que evita cortes o silencios sobrantes en la síntesis final.

Se trata de una red muy pequeña, de aproximadamente 0,5 millones de parámetros, construida sobre la arquitectura BlueTTS (esquema Supertonic). Su función es puramente de orquestación dentro de un sistema TTS mayor: predice la longitud de la secuencia de latentes que producirá el generador principal. Está entrenado exclusivamente sobre un corpus polaco de un único hablante (367 horas, unos 148.000 clips de hasta 30 segundos), por lo que su alcance lingüístico y de voces es deliberadamente estrecho.

Su relevancia es práctica: en pipelines TTS basados en latentes, fijar la longitud de salida a priori mejora la naturalidad y reduce artefactos de alineamiento. El modelo es ligero, de licencia Apache-2.0 y está pensado para integrarse junto al códec y al modelo texto→latentes del mismo autor, no como componente autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlueTTS (esquema Supertonic), red pequena para prediccion de duracion |
| Parametros totales | aproximadamente 0,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto en crudo y un fragmento de latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache-2.0 (pesos); codigo MIT (BlueTTS) |
| Formato de pesos | PyTorch (.pt): `duration_predictor_wsm.pt`, `stats.pt`, checkpoints en `checkpoints/` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BlueTTS, una implementacion del esquema Supertonic orientada a prediccion de duracion. Toma como entrada el texto sin normalizar (caracteres crudos, con mayusculas) y un fragmento de latentes de voz de referencia (una ventana aleatoria del 5-95% de los latentes del mismo clip), y devuelve el logaritmo de la duracion total del clip en segundos. Los latentes provienen del codec `ae_wsm_210_220.pt` a 48 kHz del repositorio `RockTheBoat/MikolAI-kodek-checkpoints`; el modelo solo funciona correctamente con ese codec y con las estadisticas de latentes asociadas (`stats.pt`, media y desviacion de 144 canales).

El entrenamiento uso el dataset `HoldForQuake/VoxCPM2-pol-one-voice-367h` (unas 367 horas, aproximadamente 148.000 clips de hasta 30 s, sin filtro de calidad), reservando 300 conversaciones completas para validacion. La funcion de perdida es L1 sobre el logaritmo de la duracion total. Se optimizo con AdamW, tasa de aprendizaje constante de 1e-4, 6.000 pasos, batch de 16 por tarjeta sobre 6 tarjetas con DDP. El fichero publicado es la media de los pesos de los pasos 4500, 5000, 5500 y 6000.

## Capacidades

- Prediccion de la duracion total de una locucion en segundos a partir de texto y un fragmento de latentes de voz.
- Estimacion del numero de frames que debe generar el modelo texto→latentes del pipeline.
- Procesamiento de texto en crudo, incluyendo mayusculas, sin normalizacion linguistica previa.
- Condicionamiento por hablante mediante el fragmento de latentes de referencia (un unico hablante en entrenamiento).
- Integracion como componente auxiliar en un pipeline TTS basado en latentes (BlueTTS/Supertonic).
- No soporta tool calling, agentes, vision, audio de entrada directa ni modo de razonamiento extendido.
- Capacidad multilingue limitada al polaco.

## Casos de uso

- Sintesis TTS en polaco con longitud controlada: el modelo calcula cuantos frames debe producir el generador texto→latentes, evitando truncamientos y silencios sobrantes en la salida final.
- Alineamiento temporal en doblaje y locucion: al conocer la duracion estimada antes de sintetizar, se pueden planificar cortes y sincronizacion con video o subtitulos.
- Generacion por lotes de audio de duracion predecible: permite dimensionar buffers y lotes en pipelines de produccion con antelacion.
- Ajuste de ritmo en postproduccion: la prediccion sirve como referencia para comparar la duracion real generada frente a la esperada y detectar desviaciones de tempo.
- Integracion en un stack TTS completo del mismo autor: se usa junto al codec `ae_wsm_210_220.pt` y al modelo texto→latentes, formando el subsistema de planificacion temporal.
- Validacion de calidad de datasets TTS: comparar duracion estimada y real sobre clips permite detectar anomalias de tempo o segmentacion.
- Prototipado de sistemas de voz para un unico hablante polaco: su tamano minimo permite ejecutarlo en CPU sin coste apreciable dentro del pipeline.

## Benchmarks y rendimiento

Resultados de validacion sobre 1457 clips fuera de entrenamiento, segun la model card:

| Modelo | Perdida (L1 sobre log) | Error medio de duracion |
|---|---|---|
| Mejor checkpoint individual (paso 6000) | 0,0767 | 7,46% |
| `duration_predictor_wsm.pt` (media de pesos) | 0,0755 | 7,45% |

El autor atribuye buena parte del error residual a la variabilidad natural del tempo del hablante de referencia (VoxCPM2), que puede leer el mismo texto mas rapido o mas lento. No se han publicado comparaciones con otros predictores de duracion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima (modelo de aproximadamente 0,5 millones de parametros); cabe holgadamente en cualquier GPU consumer y es viable en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier modelo con suficiente memoria para el pipeline TTS completo; el predictor en si ocupa una fraccion minima.
- Opciones de despliegue: al ser pesos PyTorch (.pt) con codigo de entrenamiento propio (repositorio `adamo1139/syntezujemy_polska_mowe`, directorio `trening/`), el despliegue se hace mediante scripts Python; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia despreciable frente al resto del pipeline.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Se trata de un predictor de duracion especifico de un pipeline TTS concreto (BlueTTS/Supertonic, codec `ae_wsm_210_220.pt`, un unico hablante polaco), por lo que las alternativas genericas de TTS o de prediccion de duracion no son directamente comparables sin datos de benchmark adicionales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MikolAI-duration-predictor | aproximadamente 0,5 M | no disponible | Apache-2.0 (pesos), MIT (codigo) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo funciona correctamente con el codec `ae_wsm_210_220.pt` (48 kHz) y las estadisticas `stats.pt` asociadas; con otro codec u otras estadisticas de latentes la prediccion es incorrecta.
- Entrenado exclusivamente en polaco y con un unico hablante; no generaliza a otros idiomas ni a otras voces.
- El dataset de entrenamiento no aplico filtro de calidad, lo que puede introducir ruido en las predicciones.
- Error medio de duracion del 7,45%; parte del error es irreducible por la variabilidad de tempo del hablante de referencia.
- No es un modelo generativo de audio: no produce voz, solo la duracion; requiere el resto del pipeline TTS para funcionar.
- Pesos bajo Apache-2.0 y codigo bajo MIT; el uso comercial esta permitido por licencia, pero conviene verificar las condiciones del dataset de entrenamiento y del codec asociado.
- Al ser un componente auxiliar de un pipeline concreto, no se documentan garantias de estabilidad de API ni soporte de herramientas de despliegue estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RockTheBoat/MikolAI-duration-predictor
- Codec asociado: https://huggingface.co/RockTheBoat/MikolAI-kodek-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/HoldForQuake/VoxCPM2-pol-one-voice-367h
- Arquitectura BlueTTS: https://github.com/maxmelichov/BlueTTS
- Codigo de entrenamiento: https://github.com/adamo1139/syntezujemy_polska_mowe
