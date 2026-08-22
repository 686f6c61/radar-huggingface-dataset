# LayerFault/store-ollama-missing-blob

## Resumen

Este repositorio no es un modelo de inteligencia artificial, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. Su identificador de corpus es `LF-CH-STORE-0003` y simula un escenario de blob faltante en el almacenamiento local de Ollama (`store-ollama-missing-blob`). El objetivo es ejercitar reglas de detección de escáneres de seguridad ante características adversariales como opcodes de pickle sospechosos, contrabando de formatos ejecutables o cadenas de prompt injection.

La model card advierte explícitamente de que **no es un modelo ML utilizable** y que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. Fue creado el 21 de agosto de 2026 por LayerFault, está marcado como gated (acceso restringido) y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que permite evaluar la capacidad de los sistemas de seguridad para detectar y bloquear artefactos maliciosos disfrazados de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (artefacto de prueba, no es un modelo) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (el repositorio contiene datos sinteticos de prueba) |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento. Este repositorio forma parte de un corpus de seguridad sintetico diseñado por LayerFault para certificar reglas de deteccion en escaneres de modelos. El contenido incluye caracteristicas adversariales deliberadas (por ejemplo, opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt injection) que tienen como unico proposito activar reglas de seguridad. No hay pesos, no hay dataset de entrenamiento y no hay ningun tipo de inferencia.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo, vision ni audio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje y no puede ser utilizado para ninguna tarea de IA.
- Su unica funcion es servir como fixture de prueba para escaneres de seguridad en el contexto del corpus Layerfault.

## Casos de uso

- **Validacion de reglas de deteccion de escaneres**: permite comprobar si un scanner de seguridad detecta correctamente artefactos que simulan un blob faltante en el almacenamiento de Ollama. Se utiliza como entrada positiva en suites de testing automatizado.
- **Pruebas de clasificacion de severidad**: el corpus asigna una severidad media y una dificultad alta, con una decision de admision esperada de BLOCK. Sirve para calibrar el umbral de bloqueo de un sistema de seguridad.
- **Evaluacion de cobertura de reglas**: el repositorio incluye reglas candidatas (como `LF-OLLAMA-BLOB-MISSING`) que permiten comprobar si el detector cubre este escenario especifico o si existe un punto ciego.
- **Pruebas de control negativo**: el corpus define que no hay reglas de control negativo esperadas, por lo que se puede verificar que el scanner no genere falsos positivos para este tipo de entrada.
- **Investigacion en seguridad de modelos**: permite estudiar como los escaneres tratan artefactos que imitan la estructura de un modelo pero contienen contenido malicioso, lo que es relevante para la seguridad en registries de modelos.
- **Entrenamiento de sistemas de deteccion**: puede usarse como ejemplo de entrenamiento para clasificadores de contenido malicioso en repositorios de modelos, siempre dentro de entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no es un modelo y, por tanto, no tiene metricas de rendimiento en tareas de IA. Su evaluacion se realiza en terminos de deteccion de seguridad (si el scanner lo bloquea o no), no de calidad de generacion.

## Requisitos de hardware

- No requiere GPU ni hardware especializado para su analisis; basta con un entorno de ejecucion aislado para pruebas de seguridad.
- Se recomienda ejecutar cualquier analisis en una maquina virtual o contenedor desechable, sin acceso a la red de produccion.
- No se necesita VRAM, ya que no se realiza inferencia.
- Las herramientas tipicas de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables porque no hay un modelo que cargar.

## Comparativa con modelos similares

No aplica. Este artefacto no es comparable con modelos de IA. La categoria comparable seria la de otros artefactos del corpus Layerfault, como `LF-CH-STORE-*`, que se utilizan como fixtures de prueba para escaneres de seguridad. No se dispone de informacion sobre otros artefactos del mismo corpus en los datos proporcionados.

## Limitaciones y advertencias

- **No es un modelo utilizable**: intentar cargarlo o ejecutarlo como modelo de IA puede provocar errores o comportamientos no deseados.
- **Contiene contenido adversarial deliberado**: opcodes pickle sospechosos, contrabando de formatos y cadenas de prompt injection estan incluidos a proposito. No debe ejecutarse en un entorno de produccion.
- **Acceso restringido (gated)**: requiere aceptar una clausula de entendimiento de que es un fixture de prueba de seguridad.
- **Uso exclusivo para testing**: solo debe usarse en entornos aislados de escaneo estatico o pruebas de seguridad.
- **Riesgo de alucinacion**: no aplica, pero existe el riesgo de que un sistema automatizado lo interprete erroneamente como un modelo legitimo si no se aplican las reglas de deteccion adecuadas.
- **Licencia**: aunque es Apache 2.0, la licencia no elimina el riesgo de seguridad; el uso comercial esta permitido pero no tiene sentido practico.

## Enlaces

- Repositorio en HuggingFace: [LayerFault/store-ollama-missing-blob](https://huggingface.co/LayerFault/store-ollama-missing-blob)
- Documentacion sobre el sistema de almacenamiento y transferencia de blobs de Ollama: [DeepWiki - Storage and Blob Transfer](https://deepwiki.com/ollama/ollama/2.4-storage-and-blob-transfer)
- Articulo sobre diagnostico de errores de Ollama relacionados con modelfile y blobs: [markaicode.com](https://markaicode.com/errors/ollama-model-load-failed-fix/)
- Issue en GitHub sobre modelos que desaparecen tras una actualizacion de Ollama: [GitHub Issue #1687](https://github.com/ollama/ollama/issues/1687)
- Articulo sobre el error "model not found" en Ollama: [markaicode.com - model not found](https://markaicode.com/errors/ollama-model-not-found-fix/)
- Guia sobre como resolver el error de modelo no encontrado en Ollama: [aimadetools.com](https://www.aimadetools.com/blog/ollama-model-not-found-fix/)
