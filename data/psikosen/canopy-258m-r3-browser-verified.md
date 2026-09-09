# psikosen/canopy-258m-r3-browser-verified

## Resumen

Canopy-R3 Browser Verified es un modelo experimental desarrollado por psikosen, creado a partir de un fine-tune del modelo base `canopy-258m-r3`. Su objetivo principal es servir como scorer de acciones de navegación web, junto con un ejecutor determinista sobre Chromium que utiliza comandos literales para interactuar con elementos etiquetados en la página. El problema que aborda es la fiabilidad de la ejecución de acciones en agentes de navegador: frente a la variabilidad de la inferencia neuronal, este modelo incorpora un modo de verificación explícita que evita la ambigüedad en la selección de objetivos.

La arquitectura subyacente, según la información pública del modelo base `canopy-258m-r3-v2`, es un modelo causal de lenguaje basado en Recurrent Mixture-of-Experts (MoE). El checkpoint distribuido contiene 296.304.390 parámetros, un tamaño notablemente superior al del modelo base de 258,56M, lo que sugiere que la versión browser-verified añade pesos adicionales para el scorer o para las capas de grounding. La longitud de contexto no se especifica en la información disponible. Su relevancia actual se enmarca en el interés creciente por agentes que operan navegadores de forma autónoma y verificable, donde la precisión de la selección de elementos es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Mixture-of-Experts (MoE) causal language model, segun el modelo base canopy-258m-r3-v2 |
| Parametros totales | 296.304.390 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (almacenamiento de pesos; no packed ternary) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Recurrent MoE del modelo base `canopy-258m-r3`, que fue diseñado para computacion de alto rendimiento en el borde, razonamiento matematico y sintesis de codigo Python. Esta version browser-verified no incorpora nuevo entrenamiento en sus pesos principales; segun la model card, la mejora introducida consiste en "fiabilidad de ejecucion determinista", no en nuevas pasadas de entrenamiento. El sistema combina un scorer de acciones aprendido mediante contrastive learning con un conjunto de reglas literales que se aplican de forma optativa. Estas reglas permiten ejecutar comandos exactos como `Open LABEL.`, `Click LABEL.`, `Enter "VALUE" into LABEL.` y `Extract the text from LABEL.`, resolviendo la correspondencia de etiquetas de forma insensible a mayusculas y con normalizacion de espacios en blanco.

El proceso de entrenamiento descarta deliberadamente un experimento posterior que regresionaba en las evaluaciones, tal como se documenta en `evaluation/rejected_training.md`. Los pesos se almacenan en bfloat16 y no se utiliza empaquetado ternario. Es importante senalar que el modelo no es un paquete `AutoModel` de HuggingFace con codigo remoto: se requiere importar las clases personalizadas de Canopy incluidas en el repositorio. La tokenizacion, la calibracion y los manifiestos SHA-256 se distribuyen junto con el checkpoint.

## Capacidades

- **Scorer de acciones de navegacion**: El modelo evalúa pares de acciones y arboles DOM podados para predecir la accion mas adecuada, utilizando un scorer pairwise aprendido.
- **Ejecucion determinista con comandos literales**: Soporta comandos exactos para abrir, hacer clic, introducir valores y extraer texto desde elementos etiquetados, sin recurrir a la inferencia neuronal.
- **Verificacion de mutaciones del DOM**: El runtime es capaz de detectar cambios en la estructura del arbol, incluidos elementos eliminados, reemplazados, renombrados, ocultos, deshabilitados o ambiguos, y rechaza la ejecucion sobre objetivos invalidos.
- **Persistencia de identidades de nodos DOM**: Las identidades de nodos se mantienen a traves de las operaciones, evitando que la reutilizacion de marcas de navegacion redirija acciones antiguas a objetivos incorrectos.
- **Deteccion de observaciones obsoletas**: Si la observacion ha quedado desactualizada, el modelo lanza un error y requiere una nueva observacion o planificacion, en lugar de ejecutar acciones potencialmente erroneas.
- **Integracion con Playwright y Chromium**: El paquete incluye un controlador de navegador que utiliza localizadores de Playwright para clics rapidos y selectivos.
- **Capacidades generales del modelo base**: Segun la documentacion del modelo `canopy-258m-r3-v2`, el checkpoint hereda la capacidad de razonamiento matematico, generacion de codigo Python y navegacion web, aunque en este fine-tune esas capacidades no se evaluan explicitamente.

## Casos de uso

- **Automatizacion de interacciones en portales web con etiquetas conocidas**: El modelo puede hacer clic en botones y enlaces cuyo texto visible es estable, como "Aceptar", "Enviar" o "Leer mas", en aplicaciones internas o sitios publicos. El modo literal garantiza que la accion se ejecute solo si existe un unico elemento visible y habilitado que coincida con la etiqueta.
- **Extraccion de informacion de paginas con estructura predecible**: Utilizando el comando `Extract the text from LABEL.`, se pueden recuperar valores concretos de campos de formularios, precios o descripciones en dashboards o fichas de producto.
- **QA de interfaces web y pruebas de regresion**: Los tests incluidos (`test_dynamic_targets.py`, `test_pairwise_grounding.py`) permiten verificar que los elementos de una interfaz mantienen su comportamiento tras cambios en el arbol DOM, lo que resulta util para validar actualizaciones de front-end en entornos de integracion continua.
- **Agentes de navegacion con grounding verificable**: El modelo puede integrarse en un agente tipo `TinyNavigator` para puntuar las acciones candidatas antes de ejecutarlas, reduciendo asi el riesgo de clics erroneos en escenarios de automatizacion de tareas repetitivas.
- **Navegacion a URLs especificas con verificacion de redirecciones**: El runtime puede abrir una URL publica y confirmar la redireccion resultante, como en el test que navega de `example.com` a IANA, lo que resulta util para monitorizar enlaces o validar respuestas HTTP.
- **Evaluacion comparativa de modelos de grounding**: El scorer pairwise aprendido puede utilizarse como referencia para comparar distintos modelos de seleccion de elementos en un mismo conjunto de fixtures locales, permitiendo medir la precision del grounding de etiquetas.

## Benchmarks y rendimiento

La model card publica resultados medidos el 2026-09-08, comparando el checkpoint previo con el runtime actual:

| Evaluacion | Anterior | Este runtime |
|---|---:|---:|
| Comprobaciones de mutacion de DOM (matched) | 5/16 | 16/16 |
| Comprobaciones de navegador con etiquetas explicitas originales | 37/37 | 37/37 |
| Comprobaciones de etiquetas explicitas nuevas, semilla 100000 | No ejecutado | 37/37 |

Ademas, el scorer aprendido sin cambios habia alcanzado 108/144 en casos sinteticos frescos y 110/144 en casos de regresion. En dos conjuntos de navegador, obtuvo 25/37 y 21/37 respectivamente. La model card refleja que esta version se centra en la ejecucion determinista y no reporta nuevos resultados para el scorer aprendido en este checkpoint. No se han publicado comparaciones con modelos externos.

## Requisitos de hardware

- **VRAM estimada**: El checkpoint en bfloat16 ocupa aproximadamente 0,6 GB, por lo que su carga en memoria requiere en torno a 600 MB de VRAM o RAM. El ejemplo oficial de uso ejecuta el modelo en CPU, con la opcion de usar CUDA para el scoring aprendido en una maquina con GPU.
- **GPU recomendadas**: Una GPU de consumo como una RTX 3060 o superior es mas que suficiente para este modelo. Tambien es viable usar una GPU de datacenter como A10 o A100 si se necesita mayor rendimiento en inferencia de lotes.
- **Compatibilidad con GPU de consumo**: Si, el modelo cabe en cualquier GPU moderna de 4 GB o mas, y tambien puede ejecutarse en CPU con una latencia razonable para tareas no criticas.
- **Opciones de despliegue**: El paquete se distribuye con un ecosistema propio que requiere Python 3.11, PyTorch, Playwright y Chromium. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El uso recomendado es mediante las clases `TinyNavigator` y `BrowserController` incluidas en el repositorio.
- **Latencia y throughput**: No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canopy-258m-r3-browser-verified | 296.304.390 | No disponible | Browser-use, grounding determinista | No disponible | HuggingFace |
| canopy-258m-r3-v2 | 258,56M | No disponible | Generalista: matematicas, codigo, browser-use | No disponible | HuggingFace |

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria. El modelo `canopy-258m-r3-v2` es su alternativa mas cercana, aunque se diferencia por estar orientado a tareas generales mientras que esta version sacrifica alcance por fiabilidad de ejecucion en navegacion.

## Limitaciones y advertencias

- **Naturaleza experimental**: El modelo tiene 0 descargas y 0 likes, con la etiqueta `experimental`. No existe una licencia declarada, lo que impide evaluar las condiciones de uso comercial.
- **Cobertura de navegacion limitada**: No se reivindica navegacion autonoma general, investigacion en multiples paginas, reconocimiento visual de iconos sin etiqueta ni precision universal del 100%. El soporte para Shadow DOM no esta cubierto.
- **Grounding debil en etiquetas ordinarias**: La model card reconoce que el grounding amplio de etiquetas de texto comunera era debil en el scorer aprendido, lo que limita su utilidad fuera de escenarios con etiquetas explicitas.
- **No es una transaccion atomica**: Una pagina puede mutar despues de una comprobacion de validacion, y el modelo no protege contra scripts hostiles en la pagina. Tampoco se establece la causa de un timeout intermitente de localizador observado en pruebas anteriores.
- **Solo validado en Chromium**: Las pruebas se realizaron unicamente con Chromium, sin validacion en otros motores de navegador. No se hacen afirmaciones sobre velocidad o consumo de RAM de Lightpanda.
- **Riesgo de alucinacion**: No se ha documentado una evaluacion especifica de alucinacion para este modelo. Como modelo de lenguaje basado en arquitectura generativa, existe el riesgo de generar predicciones incorrectas, aunque el modo literal reduce ese riesgo en la seleccion de acciones.
- **Idioma y dependencias**: El modelo esta entrenado para ingles (`en`) y el paquete requiere una configuracion de entorno especifica (Python 3.11, Playwright, Chromium) que puede resultar restrictiva en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/psikosen/canopy-258m-r3-browser-verified
- Modelo base generalista (referencia): https://huggingface.co/psikosen/canopy-258m-r3-v2
