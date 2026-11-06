# MottoX2000/onkodoz-riskli-karar

## Resumen

`onkodoz-riskli-karar` es un clasificador tabular binario de muy pequeno tamano publicado por el usuario MottoX2000 en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una regresion logistica de scikit-learn exportada a formato ONNX mediante `skl2onnx` (opset 15, ZipMap desactivado). Su unica funcion es estimar la probabilidad de que un jugador tome una decision arriesgada en un simulador educativo llamado "The Primer v2 / OnkoDoz-AI", un juego de crisis con tematica sanitaria.

El modelo consume un vector de cinco caracteristicas (`seviye`, `sahne_no`, `onceki_riskli_sayisi`, `onceki_karar_suresi_sn`, `tutor_acma_sayisi`) y devuelve una probabilidad P(riesgo). Cuando esa probabilidad supera 0,50, la aplicacion muestra un aviso al jugador y, en modo "experto", anade 30 segundos al contador. El objetivo declarado es pedagogico: ralentizar al jugador para que reflexione, no penalizarlo.

Es relevante unicamente como ejemplo de publicacion de un modelo ONNX ligero para inferencia en navegador dentro de un proyecto educativo. No tiene utilidad general fuera de su simulacion, no procesa texto, no soporta idiomas y no dispone de datos reales de entrenamiento (900 filas sinteticas generadas con semilla 42). El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (`sklearn.linear_model.LogisticRegression`, `random_state=42`) exportada a ONNX |
| Parametros totales | 5 coeficientes + intercepto (6 parametros escalares); no disponible el recuento exacto en el repositorio |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 5 caracteristicas) |
| Tipos de cuantizacion | no disponible (el modelo es float32 nativo; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 15, ZipMap desactivado) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal binario. La entrada es un tensor `float32[N, 5]` con las columnas en el orden `seviye, sahne_no, onceki_riskli_sayisi, onceki_karar_suresi_sn, tutor_acma_sayisi`. La salida relevante es `probabilities[:, 1]`, es decir, P(decision arriesgada). Existe tambien una salida `label` que la aplicacion no utiliza. La exportacion se realizo con `skl2onnx` en opset 15 y con ZipMap desactivado, lo que permite consumir la salida como tensor plano en el navegador.

El entrenamiento se hizo sobre `data/oturumlar.csv`, un conjunto de 900 filas completamente sintetico (300 sesiones x 3 escenas, semilla 42) generado por `scripts/sentetik_uret.py`. Solo se emplean las escenas 2 y 3 (600 filas), divididas en 75 % entrenamiento y 25 % test con estratificacion. No hay datos de jugadores reales (0 filas). No se documenta uso de RLHF, DPO ni tecnicas de aumento de datos. Los coeficientes publicados en `config.json` muestran que las senales mas fuertes son el tiempo de decision previo (-0,132 por segundo) y el uso del tutor (-0,297): el modelo aprende esencialmente la correlacion "decision rapida = riesgo".

Dos intentos previos de entrenamiento fueron descartados en la puerta de evaluacion por AUC insuficiente (0,580 y 0,668), segun se detalla en `spec.md` §9.4 y en `docs/`.

## Capacidades

- Clasificacion tabular binaria: estima P(decision arriesgada) a partir de cinco caracteristicas numericas.
- Inferencia en navegador: el formato ONNX permite ejecucion local sin enviar datos al servidor.
- Integracion ligera en aplicaciones web: la salida se usa para disparar un aviso ("Primer Uyarisi") y ajustar el temporizador del juego.
- Reproducibilidad: semilla fija (42) y script de generacion de datos incluidos en el repositorio.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Simulacion educativa "OnkoDoz-AI": el modelo se invoca al abrir cada escena de decision (a partir de la escena 2) para decidir si muestra un aviso pedagogico al jugador. Es su unico caso de uso previsto por el autor.
- Modo "experto" con temporizador adaptativo: cuando P(riesgo) >= 0,50, la aplicacion anade 30 segundos al contador para forzar una pausa reflexiva.
- Inferencia local en el navegador: al ejecutarse en ONNX dentro del cliente, el modelo permite desplegar la logica sin backend y sin transmitir datos del jugador.
- Prototipo de integracion ONNX + scikit-learn: sirve como referencia tecnica para equipos que quieran exportar un clasificador lineal a ONNX con `skl2onnx` y consumirlo en JavaScript.
- Validacion de pipelines MLOps educativos: el repositorio incluye puertas de evaluacion (AUC >= 0,70, exactitud >= 0,6567) y pruebas Cypress de paridad entre navegador y oraculo Python, utiles como plantilla docente.
- Analisis de comportamiento en entornos controlados: con datos sinteticos, permite estudiar como se relacionan tiempo de decision y uso de ayudas con la asuncion de riesgos, siempre dentro del simulador.
- Docencia sobre model cards: el propio repositorio sigue la plantilla de Mitchell et al. (2019) y documenta limites y usos prohibidos, lo que lo convierte en un ejemplo didactico de reporte de modelos.

## Benchmarks y rendimiento

| Metrica | Valor | Umbral de aceptacion (spec §9.2) |
|---|---|---|
| ROC-AUC (test, n = 150) | 0,8545 | >= 0,70 (cumple) |
| Exactitud (umbral 0,5) | 0,7400 | >= base + 0,03 = 0,6567 (cumple) |
| Base de mayoria | 0,6267 | — |
| Diferencia maxima ONNX vs sklearn | 8,2e-08 | < 1e-4 (cumple) |
| Diferencia maxima navegador vs oraculo Python | < 1e-8 (Cypress) | < 1e-4 (cumple) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros): el modelo no es un modelo de lenguaje y no aplica.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo ocupa unos pocos kilobytes (5 coeficientes + intercepto en float32).
- GPU recomendadas: no requiere GPU; se ejecuta en CPU y en el navegador mediante ONNX Runtime Web.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles y navegadores sin aceleracion.
- Opciones de despliegue: ONNX Runtime (Python, JavaScript/Web, C++), integracion directa en frontend web; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican mediciones; por la naturaleza del modelo (una multiplicacion matricial de 5 dimensiones) la latencia es despreciable y el throughput viene limitado por el resto de la aplicacion.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores lineales ONNX para simuladores educativos concretos). Cualquier regresion logistica exportada a ONNX con `skl2onnx` seria funcionalmente equivalente, pero no se dispone de datos de rendimiento de alternativas concretas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Datos de entrenamiento completamente sinteticos: las metricas miden la aprendibilidad de una suposicion interna del generador (`sentetik_uret.py`), no el comportamiento de jugadores reales. El rendimiento en produccion con personas reales es desconocido.
- No funciona en la escena 1: no hay historial previo y el modelo queda cerca del azar; por eso se desactiva deliberadamente en esa fase.
- Sesgo conocido: el modelo aprende "decision rapida = riesgo". Un jugador rapido pero competente puede ser marcado como riesgo (falso positivo).
- Dependencia del esquema de caracteristicas: los rangos validos estan fijados en `config.json -> ozellik_semasi`; fuera de esos rangos el comportamiento es indefinido.
- Prohibido su uso para calificar, clasificar o etiquetar a estudiantes reales.
- Prohibido su uso para evaluar el rendimiento de ingenieros en entornos clinicos o de produccion reales.
- Prohibido su uso fuera de esta simulacion: el significado de las caracteristicas es especifico de este escenario.
- Licencia MIT: permite uso comercial y modificacion, pero el autor restringe explicitamente los usos anteriores por motivos eticos, no por la licencia.
- No hay datos personales: los identificadores de sesion son aleatorios y la inferencia se ejecuta en el navegador, por lo que los datos del jugador no salen del dispositivo.
- El repositorio no registra descargas ni likes en el momento de la consulta; no hay evidencia de uso externo ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MottoX2000/onkodoz-riskli-karar
- Video de prueba Cypress del simulador "SE Primer: OnkoDoz-AI": https://www.youtube.com/watch?v=GxsQHBSPUxM
- Referencia de la plantilla de model card: Mitchell et al., 2019, "Model Cards for Model Reporting" (citada en la propia model card; no se proporciona enlace directo)
- Enlace externo no relacionado con el modelo (resultado de busqueda sobre segunda mano de vehiculos): https://otokarar.net/incele
