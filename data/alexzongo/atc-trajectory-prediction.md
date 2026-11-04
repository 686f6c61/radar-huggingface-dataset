# alexzongo/atc-trajectory-prediction

## Resumen

ATC instruction-conditioned trajectory prediction (v2) es un conjunto de checkpoints de investigación publicados por Alex Zongo y colaboradores (con la coautoría de Alexandre Bayen, UC Berkeley, entre otros) para predecir la trayectoria de una aeronave en los siguientes 60 segundos a partir de su historial ADS-B y de una instrucción de control aéreo conocida únicamente a través de una transcripción de voz imperfecta. El modelo aborda un problema clásico de incertidumbre en comunicaciones: el transcriptor de voz comete errores, y el sistema debe razonar sobre la distribución de interpretaciones posibles de la instrucción antes de predecir la trayectoria.

La arquitectura se compone de dos módulos acoplados: un modelo de creencia semántica (SBM, Semantic Belief Model) que produce una distribución sobre interpretaciones del mensaje (estado, instrucción lateral, vertical y de velocidad) a partir de la transcripción, las confidencias por palabra del reconocedor, el callsign ADS-B de la aeronave y su historial de 30 segundos; y un predictor de trayectoria condicional (CTP) que implementa un rectified flow sobre 18 coeficientes PCA de forma de trayectoria. La composición muestrea 12 interpretaciones del SBM y 6 trayectorias futuras bajo cada una, aproximando la marginalización sobre la incertidumbre comunicativa.

Es relevante para investigación en predicción de trayectorias bajo incertidumbre de comunicación, no para uso operacional. Se entrenó sobre mensajes sintéticos generados a partir de ADS-B real de la Bahía de San Francisco (cinco días), con transcripciones simuladas mediante un canal de reconocimiento ajustado. El repositorio de HuggingFace contiene únicamente artefactos (archivos comprimidos con pesos y checksums), no pesos en formato estándar safetensors/GGUF, y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos módulos: SBM (modelo de creencia semántica sobre interpretaciones) + CTP (rectified flow sobre 18 coeficientes PCA) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de historial ADS-B; instrucción de un único mensaje |
| Tipos de cuantización | no disponible (checkpoints PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (las transcripciones son de voz de control aéreo; el modelo card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch dentro de `runs-v2.tar.gz`, con `SHA256SUMS` para verificación |

## Arquitectura y entrenamiento

El sistema descompone la predicción como `p(Y | O, X) ≈ Σ_Z q_φ(Z | O, X) · p_θ(Y | X, Z)`, donde `O` es la observación de la transcripción imperfecta, `X` el historial ADS-B y `Y` la trayectoria futura. El SBM modela `q_φ(Z | O, X)` como una distribución sobre interpretaciones del mensaje (estado, instrucción lateral, vertical y de velocidad), condicionada por la transcripción, la confianza por palabra del reconocedor, el callsign de la aeronave y sus 30 s de historial. El CTP modela `p_θ(Y | X, Z)` mediante un rectified flow sobre 18 coeficientes PCA que codifican la forma de la trayectoria, generando muestras mediante integración con 12 pasos de Euler.

El entrenamiento se realizó sobre mensajes sintéticos construidos a partir de ADS-B real de la región de la Bahía de San Francisco durante cinco días, con transcripciones simuladas a partir de un canal de reconocimiento ajustado. Se documentan tres ejecuciones de entrenamiento independientes (variabilidad reportada como ± desviación). El repositorio incluye además líneas base: predictor solo-historial, predictor condicionado a transcripción y una cabeza de mezcla de densidades (anchors). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Predicción de trayectoria a 60 s de una aeronave condicionada a una instrucción de control.
- Razonamiento probabilístico sobre interpretaciones ambiguas de mensajes de voz (heading, altitud y velocidad).
- Cuantificación de incertidumbre mediante muestreo compuesto (12 interpretaciones × 6 trayectorias = 72 muestras por predicción).
- Identificación de la aeronave direccionada a partir del callsign y del historial ADS-B (ranking de la aeronave correcta).
- Modelado de incertidumbre del reconocedor de voz mediante confianzas por palabra.
- Integración con el paquete `atc_forecast` (carga de checkpoints vía `Forecaster.load`).
- No soporta tool calling, agentes, visión ni audio de forma nativa; el componente de voz es un canal simulado, no un ASR desplegable.

## Casos de uso

- Investigación en predicción de trayectorias bajo incertidumbre de comunicación: reproducir los experimentos del paper y comparar con líneas base (historial, interpretación más probable, interpretación de referencia) usando el energy score en metros como métrica.
- Estudio de robustez de sistemas ASR en dominio ATC: el SBM permite analizar cómo varía la distribución de interpretaciones ante errores de transcripción y confianzas bajas por palabra.
- Evaluación de técnicas de flow matching en series temporales físicas: el CTP sobre coeficientes PCA sirve como banco de pruebas para modelos generativos de trayectorias con integración de Euler.
- Análisis de atribución de instrucciones: usar el ranking del callsign direccionado (98 % en el conjunto privado) para estudiar la desambiguación de mensajes en canales congestionados.
- Docencia e investigación en control aéreo: reproducir el pipeline completo con ADS-B sintético derivado de datos reales de la Bahía de San Francisco.
- Prototipado de métricas de calibración: el modelo documenta sobreconfianza (cobertura del 0,86 para intervalos del 90 %), útil para estudiar corrección de calibración en modelos generativos.
- No debe emplearse en operaciones reales de control de tráfico aéreo, según indica explícitamente el autor.

## Benchmarks y rendimiento

Resultados reportados en el model card sobre conjunto de test sintético (tres ejecuciones de entrenamiento). Métrica: energy score en metros sobre 60 s, menor es mejor, sobre instrucciones del propio maniobra de la aeronave.

| Configuración | Energy score (m) |
|---|---|
| Solo historial | 3.202 |
| Interpretación más probable | 1.727 ± 2 |
| Composición (12 interpretaciones × 6 trayectorias) | 1.682 ± 5 |
| Interpretación de referencia dada | 1.556 ± 2 |

En un conjunto privado de 338 transmisiones reales de controlador emparejadas con ADS-B, la composición mejora al modelo solo-historial en un 9 %, y la aeronave direccionada queda en primera posición entre unas 12 para el 98 % de las transmisiones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publican recuentos de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga vía el paquete `atc_forecast` del repositorio GitHub (`Forecaster.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El CTP usa 12 pasos de Euler por muestra; la composición implica 72 muestras por predicción, pero no se reportan tiempos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de predicción de trayectorias ni con sistemas de propósito general; las únicas referencias internas son las líneas base del propio autor (predictor solo-historial, predictor condicionado a transcripción, cabeza de mezcla de densidades), ya reportadas en la sección de benchmarks.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación; el autor declara explícitamente "Not for operational use".
- Entrenado sobre mensajes sintéticos derivados de ADS-B real de cinco días en la Bahía de San Francisco, con transcripciones simuladas mediante un canal de reconocimiento ajustado; la generalización a otras regiones, aerolíneas o canales de voz reales no está validada.
- El espacio de interpretaciones cubre instrucciones de rumbo, altitud y velocidad; quedan fuera rutas, autorizaciones condicionales y procedimientos.
- El flow con 12 pasos de Euler es moderadamente sobreconfiado: los intervalos del 90 % cubren solo el 0,86.
- Sobre habla real la predicción es más sobreconfiada y su score vertical no supera al modelo solo-historial.
- Las velocidades objetivo se comparan con velocidad respecto al suelo y los rumbos con el track, lo que introduce desviaciones sistemáticas respecto a las magnitudes aeronáuticas nominales.
- No se documentan sesgos demográficos ni lingüísticos, pero al no declararse idiomas soportados ni diversidad de canales de voz, el riesgo de sesgo por dominio (región, acento, fraseología) es alto.
- Licencia MIT permite uso comercial del software, pero la naturaleza de investigación y la falta de validación operacional desaconsejan cualquier despliegue en producción.
- El repositorio contiene checkpoints comprimidos y checksums, no pesos en formatos estándar; requiere clonar el repositorio y ejecutar `scripts/artifacts.py fetch`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí de interpretaciones plausibles pero incorrectas de la instrucción; la composición mitiga parcialmente este riesgo al marginalizar sobre interpretaciones.

## Enlaces

- HuggingFace: https://huggingface.co/alexzongo/atc-trajectory-prediction
- Repositorio GitHub: https://github.com/Alex-Zongo/atc-trajectory-prediction
- Documentación de resultados (referenciada en el model card): `docs/v2/results.md` dentro del repositorio
- Paper: "Aircraft Trajectory Prediction under ATC Instruction Uncertainty" (Zongo, Petit, Brusset, Kam, Torun, Ghazanfari, Wei, Bayen; 2026; paper en preparación, sin enlace público disponible en la información proporcionada)
