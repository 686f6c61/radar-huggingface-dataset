# eerdm0/se-primer-v2-onnx

## Resumen

SE Primer v2.0 es un clasificador tabular de proposito muy especifico, no un modelo de lenguaje. Desarrollado por el equipo del curso YZM301 (Yazilim Gercekleme ve Test) bajo la cuenta de Hugging Face `eerdm0`, predice la probabilidad de que un estudiante de ingenieria de software sufra sobrecarga cognitiva, indecision o riesgo de panico durante una simulacion de crisis clinica (`HBYS.Web`). La salida `mudahale_gerekli` (intervencion necesaria) gobierna el comportamiento adaptativo del juego: si la probabilidad supera el umbral 0,5, la cuenta atras de 60 segundos se extiende con un margen cognitivo de 30 segundos y se desbloquean pistas socraticas y previsualizaciones de impacto.

Tecnicamente es una tuberia `Pipeline(StandardScaler → LogisticRegression)` de scikit-learn 1.9.1 exportada a ONNX (opset 17) con un artefacto `model.onnx` de tan solo 593 bytes. No contiene pesos neuronales ni vocabulario: consume un tensor `float32[n, 8]` con telemetria de comportamiento (numero de escena, nivel de calibracion, tiempo de decision, numero de vacilaciones, ratio de revision de logs, decisiones riesgosas previas, interacciones con el tutor y ratio de tiempo restante) y devuelve una probabilidad escalar. Su relevancia no reside en el rendimiento bruto sino en el patron de ingenieria: modelo tiny, inferencia en navegador via `onnxruntime-web`, paridad numerica verificada contra el oraculo Python y una model card que documenta explicitamente sus limites.

El modelo se entreno con 180 filas de decision (60 sesiones x 3 escenas), de las cuales solo 54 filas provienen de 18 sesiones reales y 126 son sinteticas generadas con semilla fija 13. La licencia es MIT y el pipeline declarado es `tabular-classification`. No soporta texto, vision ni ningun idioma natural: los identificadores de caracteristicas estan en turco, pero el modelo no procesa lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tuberia scikit-learn: `StandardScaler` + `LogisticRegression` (regresion logistica binaria), exportada a ONNX opset 17 |
| Parametros totales | 8 coeficientes (`w_i`) + intercepto; artefacto ONNX de 593 bytes |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 8 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; nombres de caracteristicas en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`); contrato de caracteristicas en `config.json` |

## Arquitectura y entrenamiento

El modelo es una regresion logistica binaria sobre 8 caracteristicas numericas estandarizadas. El tensor de entrada se denomina `input` con forma `float32[n, 8]` y el orden de columnas es contractual: `sahne_no` (1-3), `seviye` (0/1), `karar_suresi_sn` (1,5-60), `tereddut_sayisi` (0-15), `log_inceleme_orani` (0-1), `onceki_riskli_karar` (0-2), `tutor_etkilesim_sayisi` (0-10) y `kalan_sure_orani` (0-1). Los coeficientes publicados en escala estandarizada son interpretables: `log_inceleme_orani` (-1,0593) y `kalan_sure_orani` (-0,4651) reducen la probabilidad de intervencion, mientras que `karar_suresi_sn` (+0,7363), `onceki_riskli_karar` (+0,4680) y `tereddut_sayisi` (+0,3530) la aumentan.

El entrenamiento uso 180 filas: 18 sesiones reales (54 filas) y 42 sesiones sinteticas (126 filas) generadas con `SEED = 13`. El entorno fue Python 3.12 y scikit-learn 1.9.1. La innovacion tecnica destacable no es algorítmica sino de despliegue: inferencia en el cliente mediante `onnxruntime-web`, verificacion de paridad numerica contra `onnxruntime` en Python (`tests/parite.py`, diferencia maxima 8e-08) y un consumidor servidor opcional en FastAPI (`POST /api/v1/predictions`). No se documenta RLHF, DPO ni ajuste por refuerzo.

## Capacidades

- Clasificacion binaria tabular: estima `p(mudahale_gerekli = 1)` a partir de 8 caracteristicas de telemetria conductual.
- Umbral de decision fijo en τ = 0,5 que dispara el modo de crisis flexible (+30 s de margen) y desbloquea pistas socraticas y vista previa de impacto.
- Inferencia en navegador sin backend mediante `onnxruntime-web`, con el modelo de 593 bytes embebido en el cliente.
- Inferencia en servidor via `onnxruntime` en Python y endpoint REST opcional en FastAPI.
- Interpretabilidad directa: los coeficientes logisticos permiten auditar la contribucion de cada caracteristica.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Simulacion educativa adaptativa: el modelo ajusta la dificultad de la simulacion de crisis clinica en tiempo real segun la telemetria del estudiante, sustituyendo las reglas estaticas de la version v1 por una politica aprendida.
- Deteccion de sobrecarga cognitiva en entornos de formacion: al superar 0,5 de probabilidad, el sistema activa el margen de 30 segundos y las pistas socraticas, evitando que el alumno abandone la tarea por presion temporal.
- Despliegue edge en navegador: con 593 bytes y `onnxruntime-web`, el modelo se ejecuta en el cliente sin latencia de red ni coste de servidor, adecuado para aulas con conectividad limitada.
- Prototipado de logica adaptativa en juegos serios: sirve como referencia de como conectar telemetria de interaccion (tiempos, vacilaciones, revision de logs) con decisiones de diseno instruccional.
- Servicio de prediccion REST en pipelines de evaluacion: el endpoint FastAPI permite registrar predicciones y comparar la politica del modelo con heuristicas en estudios de validacion.
- Docencia de MLOps y paridad de artefactos: el par `tests/parite.py` + `onnx_max_diff` de 8e-08 es un ejemplo reproducible de verificacion de que la exportacion ONNX reproduce fielmente el modelo de scikit-learn.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test estratificado al 30 %.

| Metrica | Valor | Umbral eval gate | Estado |
|---|---|---|---|
| accuracy | 0,9074 | 0,8 | superado |
| auc | 0,9769 | 0,85 | superado |
| f1 | 0,9296 | 0,78 | superado |
| precision | 0,8684 | no disponible | no disponible |
| recall | 1,0 | no disponible | no disponible |
| real_subset_accuracy | 0,7778 | no disponible | no disponible |
| onnx_max_diff | 8e-08 | 0,0001 | superado |

La propia model card advierte que el rendimiento sobre el subconjunto de datos reales (0,7778) es sensiblemente inferior al agregado, que esta inflado por las 126 filas sinteticas. El recall de 1,0 con precision de 0,8684 indica una politica conservadora que prioriza no dejar pasar casos de sobrecarga a costa de falsos positivos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB; el artefacto ONNX ocupa 593 bytes y la inferencia no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna ejecuta la inferencia en microsegundos.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en navegadores de movil via `onnxruntime-web`.
- Opciones de despliegue: `onnxruntime-web` en cliente, `onnxruntime` en Python, FastAPI para el endpoint REST y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no se publican mediciones; por la naturaleza del modelo (8 multiplicaciones y una sigmoide) la latencia es despreciable frente a cualquier coste de red.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eerdm0/se-primer-v2-onnx | Regresion logistica tabular en ONNX | 8 coeficientes | no aplica | MIT | Hugging Face |
| TunahanCnr/se-primer-v2 | Clasificador tabular (misma familia) | no disponible | no aplica | MIT | Hugging Face |
| Reglas estaticas de SE Primer v1 | Heuristica determinista | 0 | no aplica | no disponible | Repositorio del proyecto |

No se dispone de modelos comparables de proposito general con los que medir diferencias de rendimiento; las alternativas son variantes del mismo proyecto o la version anterior basada en reglas.

## Limitaciones y advertencias

- Prohibido su uso en decision clinica real o triaje hospitalario: el modelo es exclusivamente pedagogico y la model card lo declara explicitamente fuera de alcance.
- No debe emplearse para evaluar el rendimiento de estudiantes, seleccion de personal ni calificacion de examenes.
- Fuera de las mecanicas del juego (cuenta atras de 60 s, decisiones A/B, tres escenas) requiere recalibracion.
- Sesgo de datos: solo 18 sesiones reales frente a 42 sinteticas; la precision sobre el subconjunto real cae a 0,7778.
- Riesgo de falsos positivos por el recall de 1,0, que puede activar el modo de crisis con demasiada frecuencia.
- Sin capacidad de generalizacion fuera del dominio tabular: no procesa texto, imagenes ni audio.
- Licencia MIT permite uso comercial, pero la finalidad declarada restringe el uso responsable a simulacion educativa.
- La fecha de creacion del repositorio (2026-11-06) y el recuento de descargas y likes (0) indican un artefacto academico sin adopcion externa verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eerdm0/se-primer-v2-onnx
- Variante relacionada: https://huggingface.co/TunahanCnr/se-primer-v2
- Arbol de ficheros de la variante: https://huggingface.co/TunahanCnr/se-primer-v2/tree/main
- Repositorio GitHub del proyecto: https://github.com/yaseminnartunn/se-primer-v2
