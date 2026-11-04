# burcuuysal/primer-v2-zorlanma

## Resumen

Primer v2 "Zorlanma" es un modelo de clasificación tabular de muy pequeno tamano desarrollado por el usuario burcuuysal como parte de un trabajo academico. Su unica funcion es predecir la probabilidad de que un jugador vaya a tener dificultades en las dos proximas decisiones de un videojuego narrativo concreto. La salida es una probabilidad `p` entre 0 y 1 que el motor del juego usa para ajustar la experiencia: si `p >= 0.60` se elimina la presion de tiempo, se activan pistas y se profundiza la narracion; si `p < 0.30` se usa una narracion breve.

Tecnicamente no es un modelo de lenguaje ni una red neuronal profunda: es una regresion logistica de scikit-learn exportada a ONNX, con un StandardScaler plegado en los pesos. La entrada es un tensor `[N, 7]` de tipo float32 con siete caracteristicas tabulares cuyo nombre y orden son un contrato definido en `config.json`. El modelo se entreno exclusivamente con datos sinteticos (180 sesiones, 3420 filas, semilla del generador 2026) y esta disenado solo para las 8 escenas y 3 niveles de un unico juego.

Su relevancia es limitada fuera de ese contexto: sirve como ejemplo de pipeline educativo completo (entrenamiento, exportacion ONNX, metricas, puerta de evaluacion y documentacion de limitaciones), no como componente de proposito general. No soporta texto libre, vision, tool calling ni agentes, y el propio autor advierte que su rendimiento en comportamiento real de jugadores es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn) con StandardScaler plegado en los pesos |
| Parametros totales | 7 coeficientes mas un sesgo (8 parametros efectivos); no disponible el recuento exacto publicado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada fija de 7 caracteristicas) |
| Tipos de cuantizacion | no aplica (modelo ONNX float32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), generado con `onnx_yaz.py` |

## Arquitectura y entrenamiento

El modelo es una regresion logistica lineal clasica. El `StandardScaler` se ha plegado dentro de los pesos, de modo que la inferencia es una unica operacion lineal seguida de una sigmoide. La entrada es un tensor `girdi` de forma `[N, 7]` en float32 y la salida es `p` de forma `[N, 1]`. Los nombres y el orden de las siete caracteristicas estan definidos en `config.json` y el autor los trata explicitamente como un contrato que el cliente debe respetar.

El entrenamiento uso unicamente datos sinteticos del fichero `data/oturmas.csv` (columna `kaynak` con valores `gercek` o `sentetik`), con 180 sesiones y 3420 filas generadas con semilla 2026. No se usaron datos reales de jugadores en esta version. El conjunto de test se construyo por division a nivel de sesion del 25 %, con `random_state=42`. No hubo RLHF, DPO ni ninguna fase de ajuste posterior; es un entrenamiento supervisado directo sobre caracteristicas tabulares.

## Capacidades

- Clasificacion binaria tabular: predice si un jugador tendra dificultades en las dos proximas decisiones de un juego narrativo concreto.
- Salida de probabilidad calibrada en el rango 0-1, usada por el motor del juego para ajustar dificultad, pistas y profundidad narrativa.
- Inferencia via ONNX con entrada `[N, 7]` float32 y salida `[N, 1]`.
- Sin soporte de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- Sin tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no procesa lenguaje).
- Sin modo de pensamiento (thinking mode) ni capacidades especiales.

## Casos de uso

- Ajuste dinamico de dificultad en el juego para el que fue entrenado: el motor consulta la probabilidad `p` antes de cada decision y aplica las reglas documentadas (`p >= 0.60` retira la presion de tiempo y activa pistas; `p < 0.30` acorta la narracion). Es su unico uso previsto por el autor.
- Prototipo academico de pipeline completo: sirve como ejemplo de entrenamiento, exportacion a ONNX, definicion de metricas y puerta de evaluacion en un curso de machine learning.
- Referencia de integracion ONNX en produccion ligera: el fichero `model.onnx` pesa practicamente nada y puede servirse desde cualquier runtime ONNX, lo que lo hace util como caso de estudio de despliegue de modelos tabulares.
- Prueba de contrato de datos: el orden y los nombres de las siete caracteristicas en `config.json` pueden usarse para validar esquemas de entrada en un servicio de inferencia.
- Ejemplo de versionado seguro: el autor recomienda descargar desde una URL fijada a un commit concreto, lo que sirve como plantilla para pipelines que exigen reproducibilidad.
- Material didactico sobre honestidad metodologica: la model card documenta que el umbral se bajo de 0.50 a 0.40 tras ver los resultados, lo que puede usarse en formacion sobre sesgos de evaluacion.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre el conjunto de test (division por sesion del 25 %, `random_state=42`, umbral 0.40):

| Metrica | Valor | Umbral de aceptacion |
|---|---|---|
| Recall (zorlandi=1) | 0.7315 | >= 0.70 |
| F1 (zorlandi=1) | 0.6864 | >= 0.65 |
| ROC-AUC | 0.7758 | >= 0.75 |
| Diferencia maxima ONNX frente a sklearn | 1.1e-7 | < 1e-4 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor indica que con umbral 0.50 el recall era 0.636 y la puerta de evaluacion rechazo el modelo; el umbral se ajusto a 0.40 tras observar los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ONNX ocupa unos pocos kilobytes (el repositorio completo figura como 0.0 GB).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida cualquier RTX o incluso en entornos integrados; tambien cabe en dispositivos de bajisimo consumo.
- Opciones de despliegue: cualquier runtime ONNX (ONNX Runtime, onnxruntime-web, etc.); no aplica vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una operacion lineal sobre 7 caracteristicas) cabe esperar latencias en el orden de microsegundos a pocos milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores tabulares especificos para un juego concreto). Como referencia generica, cualquier regresion logistica de scikit-learn o cualquier clasificador tabular ligero (XGBoost, LightGBM) podria cubrir funciones equivalentes, pero no hay datos de comparacion publicados para este caso.

## Limitaciones y advertencias

- Entrenado solo con datos sinteticos: el rendimiento en comportamiento real de jugadores es desconocido. Los datos sinteticos reflejan los supuestos del generador (por ejemplo, que clics nerviosos equivalen a dificultad).
- Disenado exclusivamente para las 8 escenas y 3 niveles de un unico juego; no generaliza a otros juegos ni a otras tareas.
- La regresion logistica es lineal y no captura interacciones entre caracteristicas (por ejemplo, tiempo x nivel).
- Muestra pequena: el conjunto de test tiene 855 filas, por lo que las metricas pueden variar varios puntos.
- El umbral de decision se ajusto de 0.50 a 0.40 despues de ver los resultados, lo que introduce un sesgo de seleccion en las metricas reportadas.
- No debe usarse para evaluar la capacidad, el exito o la idoneidad laboral de una persona.
- No debe usarse para tomar decisiones sobre menores ni grupos sensibles; el modelo esta pensado solo para ajustar narracion y pistas dentro del juego.
- No debe combinarse con identidad o datos personales para elaborar perfiles.
- La model card recomienda descargar desde una URL fijada a un commit concreto y no desde la rama `main`, para garantizar reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/burcuuysal/primer-v2-zorlanma
- Descarga recomendada fijada a commit: https://huggingface.co/burcuuysal/primer-v2-zorlanma/resolve/<commit>/model.onnx
- Ficheros referenciados en la model card: `config.json`, `data/oturumlar.csv`, `onnx_yaz.py`, `spec.md` (disponibles en el repositorio del modelo)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
