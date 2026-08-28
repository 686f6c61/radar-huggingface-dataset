# MazenMohamed10/Luca-PyGuide-1.0

## Resumen

Luca-PyGuide es una herramienta ligera de análisis de errores de Python que predice errores comunes, proporciona explicaciones, sugerencias de corrección, código corregido y consejos educativos. No se trata de un modelo de lenguaje grande, sino de un clasificador de aprendizaje automático basado en TF-IDF y regresión logística, combinado con verificación en tiempo de ejecución y análisis basado en reglas para mejorar la fiabilidad de las predicciones. El modelo está desarrollado por Mazen Mohamed Fayez (MazenMohamed10) y se distribuye como un paquete Python con una interfaz simple.

La herramienta cubre tres tipos de error: `IndexError`, `NameError` y `SyntaxError`. El clasificador ML distingue entre los dos primeros, mientras que `SyntaxError` se detecta mediante validación sintáctica de Python. El sistema incluye verificación en tiempo de ejecución que puede corregir predicciones erróneas del modelo cuando el código se ejecuta correctamente. El repositorio en Hugging Face contiene el artefacto del modelo en formato joblib, junto con el código fuente y un conjunto de datos de entrenamiento de 250 ejemplos procesados. La relevancia actual radica en su enfoque híbrido que combina ML con análisis determinista, útil para entornos educativos y de desarrollo donde se necesita asistencia inmediata para depurar errores comunes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con vectorizacion TF-IDF (scikit-learn) |
| Parametros totales | no disponible (modelo de regresion logistica de tamano reducido) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa codigo Python, no texto libre) |
| Tipos de cuantizacion | no disponible (formato joblib, sin cuantizacion) |
| Idiomas soportados | Codigo Python (no idiomas naturales) |
| Licencia | MIT (segun la model card; en Hugging Face figura como "no disponible") |
| Formato de pesos | joblib (archivo `Luca-PyGuide-1.0.joblib`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de clasificacion de texto clasica: vectorizacion TF-IDF sobre el codigo fuente de Python, seguida de un clasificador de regresion logistica implementado con scikit-learn. El pipeline de analisis es hibrido: primero se realiza una comprobacion sintactica del codigo, luego el modelo ML predice si existe un `IndexError` o `NameError`, posteriormente se ejecuta el codigo en un entorno controlado para verificar si realmente se lanza una excepcion, y finalmente un analizador especifico del error genera la explicacion, la correccion y el consejo educativo. Esta combinacion permite que la verificacion en tiempo de ejecucion anule una prediccion incorrecta del ML cuando el codigo se ejecuta sin errores.

El conjunto de datos de entrenamiento consta de 250 ejemplos procesados (archivo `luca_pyguide_250.json`), aunque no se especifica el desglose exacto por clase. El modelo se entreno para distinguir entre `IndexError` y `NameError`; `SyntaxError` se maneja por separado mediante validacion sintactica. No se menciona el uso de tecnicas como RLHF o DPO, ya que no es un modelo generativo. La evaluacion reporta una precision del 92,11% sobre un conjunto de prueba de 38 ejemplos.

## Capacidades

- Prediccion de errores comunes de Python: `IndexError`, `NameError` y `SyntaxError`.
- Verificacion en tiempo de ejecucion del codigo enviado para confirmar si realmente se produce una excepcion.
- Generacion de explicaciones legibles para humanos sobre la causa del error.
- Sugerencias de correccion y, cuando es posible, codigo corregido.
- Consejos educativos para que el usuario aprenda del error.
- Manejo de codigo Python valido (sin errores) y de entrada vacia, devolviendo una respuesta estructurada en lugar de fallar.
- Interfaz de paquete Python simple, sin necesidad de GUI.
- Capacidad de anular la prediccion del ML cuando la verificacion en tiempo de ejecucion demuestra que el codigo es correcto.

## Casos de uso

- Entornos educativos de programacion: un estudiante que recibe un `IndexError` al acceder a una lista puede usar Luca-PyGuide para obtener una explicacion clara, el indice correcto y un consejo sobre indexacion basada en cero, acelerando el aprendizaje autonomo.
- Asistente de depuracion en IDEs o editores de codigo: integrado como plugin, puede analizar el fragmento de codigo seleccionado y ofrecer una correccion inmediata antes de ejecutar el programa, reduciendo el ciclo de prueba y error.
- Automatizacion de revision de codigo en pipelines de CI/CD: aunque no es un analizador estatico completo, puede anadir una capa de deteccion de errores comunes en scripts de Python, complementando herramientas como pylint o flake8.
- Herramienta de aprendizaje para desarrolladores junior: al pegar codigo con errores, el desarrollador recibe no solo la correccion sino tambien el razonamiento detras del fallo, mejorando su comprension de los mecanismos de Python.
- Analisis de codigo en entornos de ejecucion restringida (por ejemplo, notebooks o plataformas de evaluacion online): puede verificar si un fragmento de codigo lanza una excepcion y proporcionar retroalimentacion automatica a los usuarios.
- Prototipado rapido de asistentes de codigo: dado su tamano reducido y su interfaz simple, puede servir como base para experimentar con sistemas de ayuda a la programacion basados en reglas y ML.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluacion sobre un conjunto de prueba de 38 ejemplos:

| Metrica | Valor |
|---|---|
| Accuracy | 92,11% |
| Precision (IndexError) | 0,90 |
| Recall (IndexError) | 1,00 |
| F1-score (IndexError) | 0,95 |
| Precision (NameError) | 1,00 |
| Recall (NameError) | 0,70 |
| F1-score (NameError) | 0,82 |
| Macro avg F1 | 0,89 |
| Weighted avg F1 | 0,92 |

No se han publicado resultados comparativos con otros modelos o herramientas en la informacion disponible. El conjunto de prueba es pequeno (38 ejemplos), por lo que las metricas deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo es un clasificador de regresion logistica con vectorizacion TF-IDF, que se ejecuta en CPU con recursos minimos.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica, no necesita aceleracion grafica.
- Opciones de despliegue: paquete Python local, integrable en aplicaciones web (Flask, FastAPI) o en scripts de linea de comandos. No requiere servidores de inferencia como vLLM u Ollama.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo de tamano reducido, la inferencia es practicamente instantanea en CPU (del orden de milisegundos).

## Comparativa con modelos similares

No existen modelos de lenguaje comparables en la misma categoria, ya que Luca-PyGuide no es un LLM. Como herramienta de analisis de errores de Python, se puede comparar con utilidades clasicas:

| Herramienta | Tipo | Cobertura de errores | Enfoque | Licencia |
|---|---|---|---|---|
| Luca-PyGuide | Clasificador ML + reglas | IndexError, NameError, SyntaxError | Hibrido (ML + verificacion runtime) | MIT |
| pylint | Analizador estatico | Amplia gama de errores y code smells | Analisis estatico basado en reglas | GPL |
| pyflakes | Analizador estatico | Errores logicos y de importacion | Analisis estatico ligero | MIT |
| mypy | Verificador de tipos | Errores de tipos | Tipado estatico | MIT |

Luca-PyGuide se diferencia por su componente de ML y la verificacion en tiempo de ejecucion, pero su cobertura es mucho mas limitada que la de los analizadores estaticos establecidos.

## Limitaciones y advertencias

- Cobertura limitada: solo soporta tres tipos de error (`IndexError`, `NameError` y `SyntaxError`); otros errores comunes como `TypeError`, `KeyError` o `ValueError` no estan contemplados.
- Conjunto de datos pequeno: el modelo se entreno con 250 ejemplos, lo que limita su generalizacion; las predicciones deben considerarse probabilisticas y no definitivas.
- Dependencia de la verificacion en tiempo de ejecucion: si el codigo no se puede ejecutar en el entorno (por ejemplo, por dependencias externas o efectos secundarios), la verificacion puede fallar y la prediccion del ML quedaria sin validar.
- Riesgo de falsos negativos: el recall para `NameError` es de 0,70, lo que indica que algunos errores de este tipo pueden no ser detectados.
- No es un analizador estatico completo: no detecta errores logicos, problemas de rendimiento ni code smells.
- Licencia: aunque la model card indica MIT, el campo de licencia en Hugging Face figura como "no disponible"; se recomienda verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Sin soporte para otros lenguajes de programacion: exclusivamente orientado a Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MazenMohamed10/Luca-PyGuide-1.0
- Perfil del autor en Hugging Face: https://huggingface.co/MazenMohamed10
- Lista de modelos del autor: https://huggingface.co/MazenMohamed10/models
- Repositorio de referencia (no confirmado como el oficial): no se ha encontrado un enlace directo al repositorio de codigo en la busqueda web.
