# grisselblanco/Clase_11_pytorch

## Resumen

`grisselblanco/Clase_11_pytorch` es un modelo de regresion lineal implementado en PyTorch, publicado en Hugging Face con fines exclusivamente pedagogicos como parte del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). Predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada: superficie en metros cuadrados, presencia de balcon y presencia de ascensor. No es un modelo de lenguaje ni un transformer: es una unica capa `torch.nn.Linear(3, 1)` con cuatro parametros entrenables (tres pesos y un sesgo).

El modelo resuelve el mismo problema que el ejemplo clasico de regresion lineal de scikit-learn, pero mostrando el ciclo de entrenamiento explicito de PyTorch y la publicacion de pesos en formato safetensors. Su relevancia es didactica: sirve como referencia minima para entender el flujo completo de entrenamiento, serializacion segura de pesos y carga de un `state_dict` con una arquitectura definida en codigo separado.

El repositorio es de tamano practicamente nulo (0.0 GB), con 0 descargas y 0 likes en el momento de la consulta. Los datos de entrenamiento son sinteticos y generados con semilla fija, por lo que el modelo no tiene utilidad predictiva fuera del aula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (documentacion y model card en espanol) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `modelo.py` |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal pura implementada como una capa `torch.nn.Linear(3, 1)`, definida en `modelo.py`. Las entradas (`m2`, `balcon`, `ascensor`) se normalizan restando la media y dividiendo por el desvio estandar calculados sobre el conjunto de entrenamiento; esos valores se almacenan en `config.json`. La salida es un unico escalar: el precio estimado en miles de dolares.

El entrenamiento es supervisado, con funcion de perdida `MSELoss` y optimizador SGD con tasa de aprendizaje 0,1 durante 500 epocas (la perdida se estabiliza antes de la epoca 100). El dataset es sintetico, generado en `train.py` con la misma semilla que la Clase 10, y consta de 200 registros: 160 para entrenamiento y 40 para evaluacion. Las entradas `m2` varian entre 35 y 120; `balcon` y `ascensor` son binarias (0 o 1). No hay RLHF, DPO ni tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal, por tratarse de un modelo tabular de cuatro parametros.

Los pesos aprendidos son `lineal.weight = [35,157; 4,351; 5,992]` y `lineal.bias = 147,769`. Estos valores estan en la escala de las entradas normalizadas; al desnormalizar (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`) se recupera el coeficiente equivalente al de scikit-learn.

## Capacidades

- Prediccion de una variable continua (precio en miles de USD) a partir de tres features tabulares.
- Regresion sobre datos normalizados con media y desvio precalculados.
- Carga de pesos mediante `safetensors`, sin ejecucion de codigo al deserializar.
- Integracion con el ecosistema PyTorch (`load_state_dict`, `model.eval()`, `torch.no_grad()`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue: no aplica; solo documentacion en espanol.

## Casos de uso

- Docencia de PyTorch: ilustrar el ciclo explicito de entrenamiento (forward, loss, backward, step) en un problema de regresion con datos sinteticos y semilla reproducible.
- Comparacion con scikit-learn: reproducir el mismo problema con ambos frameworks y verificar que los coeficientes coinciden tras desnormalizar (1,503 para `m2`).
- Ejemplo de serializacion segura: mostrar las diferencias entre safetensors y pickle/joblib en cuanto a ejecucion de codigo al cargar.
- Plantilla de publicacion en Hugging Face: servir de esqueleto para subir un `state_dict` junto a `config.json`, `modelo.py` y scripts de entrenamiento e inferencia.
- Prueba de pipelines de carga: validar en un entorno de CI que `load_state_dict` funciona con la clase `RegresionLineal` y el archivo de pesos.
- Demostracion de la importancia de la normalizacion: mostrar como omitir `config.json` produce predicciones sin sentido, un error habitual en produccion.
- Ejercicio de evaluacion: calcular MAE y R² sobre el split de 40 registros para practicar metricas de regresion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MAE (40 registros de test) | 3,08 miles de USD |
| R² (40 registros de test) | 0,989 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los datos anteriores son los unicos reportados en la model card y corresponden al split sintetico de evaluacion.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo ocupa unos pocos bytes (4 parametros en float32).
- GPU recomendadas: no requiere GPU; se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin aceleracion.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular de este tipo.
- Latencia y throughput: no disponibles; por el tamano del modelo, la inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grisselblanco/Clase_11_pytorch` | 4 | no aplica | MAE 3,08; R² 0,989 (test sintetico) | MIT | Hugging Face |
| `grisselblanco/02-pytorch-regresion` | 4 | no aplica | no disponible | no disponible | Hugging Face |
| Regresion lineal de scikit-learn (referencia del curso) | 4 | no aplica | coeficientes equivalentes tras desnormalizar | BSD-3-Clause (scikit-learn) | PyPI |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparacion con scikit-learn se limita a la equivalencia de coeficientes documentada por el autor.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios inmobiliarios reales.
- Rango de aplicacion restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese intervalo la extrapolacion no es fiable.
- Dependencia critica de la normalizacion: sin `config.json` (media y desvio), las predicciones son incorrectas.
- Requiere la misma arquitectura (`modelo.py`) para cargar los pesos; si cambia la clase, `load_state_dict` falla.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo puede producir predicciones absurdas fuera de distribucion sin advertirlo.
- Sesgos conocidos: no documentados; el dataset sintetico no permite evaluar sesgos demograficos o geograficos.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo carece de valor predictivo real fuera del contexto didactico.
- 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/Clase_11_pytorch
- Modelo relacionado del mismo autor: https://huggingface.co/grisselblanco/02-pytorch-regresion
- Ejemplos oficiales de PyTorch: https://docs.pytorch.org/examples/
