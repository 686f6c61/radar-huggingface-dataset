# ALEXFLR/SEAI

## Resumen

SEAI (Square Equation AI) es un modelo de investigación desarrollado por ALEXFLR cuyo objetivo no es solo predecir numéricamente, sino investigar si una red neuronal entrenada para resolver ecuaciones cuadráticas desarrolla representaciones internas correlacionadas con cantidades matemáticas significativas de la solución analítica. Se trata de un modelo de regresión numérica, no de lenguaje, a pesar de que su pipeline_tag en HuggingFace indique text-generation.

La arquitectura es un perceptrón multicapa con capas cuadráticas personalizadas (QuadraticLayer), que aplican una transformación no lineal de segundo orden a las proyecciones lineales. El modelo contiene exactamente 8.040.002 parámetros entrenables y recibe una representación normalizada de una ecuación cuadrática para predecir sus dos raíces reales ordenadas. La relevancia del proyecto radica en su contribución a la interpretabilidad mecanicista: se observa que las activaciones ocultas de capas profundas muestran fuertes correlaciones con el discriminante normalizado \(p^2 - q\) y con su raíz cuadrada, a pesar de que ninguna de estas cantidades se proporciona explícitamente como entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con capas cuadraticas personalizadas (QuadraticLayer) + LayerNorm + GELU |
| Parametros totales | 8.040.002 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresion numerica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (segun metadata; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (no especificado en la model card) |

## Arquitectura y entrenamiento

SEAI es un modelo feedforward con una arquitectura de cuatro capas cuadraticas seguidas de una proyeccion lineal de salida. Cada QuadraticLayer implementa la transformacion \(y_i = A_i z_i^2 + B_i z_i + C_i\), donde \(z = Wx + b\), con parametros aprendibles \(A\), \(B\) y \(C\) por canal. Esto proporciona al modelo un mecanismo explicito para construir transformaciones no lineales cuadraticas de proyecciones lineales aprendidas. La red se compone de capas con dimensiones 2 → 1000 → 2000 → 2000 → 1000 → 2, intercalando LayerNorm y activacion GELU.

El entrenamiento se realizo con un dataset sintetico de 150.000 ejemplos. Las raices se muestrean uniformemente en el intervalo \([-50, 50]\) y se ordenan; a partir de ellas se construyen los coeficientes de la ecuacion cuadratica garantizando que las raices seleccionadas sean soluciones exactas. La entrada se normaliza como \(p = b/(100a)\) y \(q = c/(2500a)\), y las raices objetivo se normalizan dividiendo por 50. El modelo se entreno con AdamW (learning rate 3e-4, weight decay 1e-4), funcion de perdida SmoothL1Loss, gradiente recortado a max_norm 1.0, batch size 256 y 125 epocas.

La innovacion tecnica destacable es la capa cuadratica, que permite al modelo representar explicitamente relaciones polinomicas de segundo orden, en lugar de depender solo de funciones de activacion estandar. Esta eleccion esta directamente motivada por la estructura matematica del problema: la solucion de una ecuacion cuadratica depende del discriminante \(p^2 - q\), que es una expresion cuadratica de las entradas.

## Capacidades

- Resolucion de ecuaciones cuadraticas con raices reales: predice las dos raices ordenadas y normalizadas a partir de los coeficientes normalizados.
- Analisis de interpretabilidad mecanicista: permite registrar activaciones de neuronas mediante forward hooks y compararlas con caracteristicas matematicas candidatas como \(p\), \(q\), \(p^2\), \(q^2\), \(pq\), \(p^2 - q\), \(p^2 + q\) y \(\sqrt{|p^2 - q|}\).
- Deteccion de estructuras internas: las activaciones en capas profundas muestran correlaciones fuertes con el discriminante normalizado \(p^2 - q\) y su raiz cuadrada, a pesar de no ser entradas explicitas.
- Generacion de datos sinteticos: el modelo se entrena exclusivamente con datos generados proceduralmente, lo que permite estudiar el aprendizaje de funciones simbolicas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. Es un modelo de regresion numerica pura.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el modelo sirve como banco de pruebas para estudiar como emergen representaciones matematicas internas. Se pueden registrar activaciones de neuronas y correlacionarlas con el discriminante normalizado para analizar la formacion de conceptos simbolicos en redes neuronales.
- Estudio de symbolic reasoning: al entrenar un modelo en una tarea algebraica cerrada, permite explorar si las redes aprenden a calcular cantidades intermedias (como el discriminante) de forma implícita, aportando evidencia sobre los mecanismos del razonamiento simbolico en IA.
- Experimento docente en aprendizaje automatico: por su tamano reducido y su arquitectura interpretable, es adecuado para demostraciones en cursos de deep learning sobre diseno de capas personalizadas, regularizacion y analisis de activaciones.
- Generacion de datos sinteticos para benchmarking: el modelo puede utilizarse para generar predicciones de raices en ecuaciones cuadraticas con raices reales, sirviendo como referencia para comparar otros algoritmos de resolucion simbolica o numerica.
- Pruebas de robustez numerica: dado que el modelo presenta errores mayores cuando las raices estan muy proximas, puede emplearse para estudiar la degradacion del rendimiento en problemas mal condicionados.
- Prototipado de modelos interpretables: la arquitectura QuadraticLayer es facilmente reutilizable en otros problemas de regresion donde se sospeche una relacion polinomica de segundo orden, permitiendo construir modelos mas interpretables que los MLP convencionales.

## Benchmarks y rendimiento

Los resultados de una evaluacion independiente reciente se presentan en la siguiente tabla. Las metricas se reportan en la representacion normalizada de las raices.

| Metrica | Resultado |
|---|---|
| MAE | 0,084864 |
| RMSE | 0,137898 |
| Error maximo observado | 1,652145 |
| Error < 0,1 | 69,34 % |
| Error < 0,01 | 0,27 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor indica que los resultados deben considerarse preliminares, ya que las evaluaciones anteriores usaron conjuntos generados de forma independiente y aun no se han fijado splits de entrenamiento/validacion/test con semillas aleatorias reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB. Con 8 millones de parametros en precision float32, el modelo ocupa aproximadamente 32 MB. En float16 o int8, el uso de memoria es aun menor.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas RTX 3050, RTX 4060, o incluso una GPU integrada. El modelo tambien puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, es compatible con cualquier GPU consumer de los ultimos anos.
- Opciones de despliegue: el modelo esta implementado en PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI. Para inferencia, basta con cargar los pesos y ejecutar el forward pass en un script de Python.
- Latencia y throughput: no disponible. Dado el tamano del modelo, la latencia en CPU es del orden de milisegundos, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos de regresion simbolica con capas cuadraticas e interpretabilidad). La informacion proporcionada no incluye referencias a otros modelos que resuelvan ecuaciones cuadraticas ni a arquitecturas similares. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo solo resuelve ecuaciones cuadraticas con raices reales. No evalua ecuaciones con raices complejas, por lo que su dominio de aplicacion es restringido.
- El rendimiento es limitado: solo el 0,27 % de las predicciones tienen un error inferior a 0,01 en la representacion normalizada, y el error maximo observado alcanza 1,65. Esto indica que no es adecuado para aplicaciones que requieran alta precision.
- El modelo presenta un rendimiento degradado cuando las dos raices estan muy proximas entre si, lo que puede causar errores significativos en problemas mal condicionados.
- Los resultados de evaluacion son preliminares y no reproducibles, ya que no se han fijado splits de datos ni semillas aleatorias. Cualquier comparacion futura debe tratar estas metricas con cautela.
- No es un modelo de lenguaje ni un modelo generativo. Aunque su pipeline_tag en HuggingFace sea text-generation, su funcion real es la regresion numerica. No debe usarse para tareas de procesamiento de lenguaje natural.
- La licencia MIT permite uso comercial y modificacion, pero el modelo se presenta como un experimento de investigacion, sin garantias de robustez ni soporte para produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ALEXFLR/SEAI
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
