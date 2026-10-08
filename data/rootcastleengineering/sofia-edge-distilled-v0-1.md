# rootcastleengineering/sofia-edge-distilled-v0.1

## Resumen

Sofia Edge Distilled v0.1 es un clasificador de 325 parametros implementado enteramente en NumPy, desarrollado por Rootcastle Engineering & Innovation. Su tarea es clasificar senales de vibracion en cinco escenarios sinteticos: estado saludable, desequilibrio, desalineacion, impulsos de rodamiento y rozamiento (rubbing). El modelo se obtiene por destilacion de conocimiento desde un profesor de kernel ridge regression centrado, que emplea un kernel de producto-rotacion con evaluacion clasica eficiente (de inspiracion cuantica, aunque la computacion es en CPU clasica).

No se trata de un modelo de lenguaje ni de un transformer: es un perceptron multicapa (MLP) de tres capas (14 → 16 → 5) que opera sobre 14 caracteristicas estadisticas y espectrales. Su relevancia es acotada y experimental (0 descargas, 0 likes en el momento de la ficha): sirve como demostracion reproducible de destilacion desde un kernel teacher verificable hacia una red minima desplegable en el borde (edge), con artefactos y hashes de verificacion incluidos en el repositorio.

El interes practico reside en la reproducibilidad y en el protocolo de verificacion (digest SHA-256 de pesos, esquema de features ordenado, control RBF emparejado y control supervisado sin destilacion), no en un rendimiento diferencial: el control supervisado iguala o supera al estudiante destilado en la metrica de exactitud en distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 14 → 16 → 5 con activacion ReLU |
| Parametros totales | 325 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de 1.024 muestras a 2.048 Hz |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (segun metadata de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy `.npz` (fichero `model.npz`) |

## Arquitectura y entrenamiento

El estudiante es un MLP de 325 parametros que recibe 14 caracteristicas estadisticas y espectrales, las procesa en una capa oculta de 16 unidades ReLU y produce 5 logits de clase. El profesor es un kernel ridge regression centrado con un kernel de producto-rotacion (product-rotation kernel) y evaluacion clasica eficiente; se ajusta sobre 600 ejemplos y se valida sobre 200, con una busqueda de escala y penalizacion sobre 25 ajustes, emparejada con un control RBF. Tras la seleccion de hiperparametros, el profesor se reajusta sobre los 800 anclajes de entrenamiento y validacion. La estandarizacion se realiza solo con datos de entrenamiento y precede a una codificacion angular fija mediante arcotangente para el profesor.

El estudiante se entrena durante 120 epochs sobre 6.000 formas de onda generadas de forma independiente, con 1.000 ejemplos adicionales de validacion de estudiante para seleccionar el checkpoint. El objetivo de destilacion combina entropia cruzada sobre etiquetas duras y divergencia KL con las salidas del profesor a temperatura 2. Se conserva un control supervisado sin destilacion con inicializacion, datos, arquitectura y presupuesto de optimizacion identicos. El autor declara explicitamente que no se reclama ninguna ventaja de calidad por la destilacion.

## Capacidades

- Clasificacion de senales de vibracion de aceleracion (en unidades g) en cinco clases sinteticas: healthy, imbalance, misalignment, bearing impulses y rubbing.
- Extraccion y validacion de un esquema ordenado de 14 caracteristicas estadisticas y espectrales a partir de ventanas de 1.024 muestras a 2.048 Hz.
- Inferencia en CPU con NumPy, sin dependencias de GPU ni de frameworks de aprendizaje profundo.
- Verificacion de integridad antes de la inferencia: el cargador valida el orden de features, las dimensiones, la finitud de los valores y el digest SHA-256 de los pesos.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento de agente. Estas capacidades no estan presentes en este modelo.
- No dispone de modo thinking, ni de API de actuacion sobre maquinaria.

## Casos de uso

- Reproduccion de experimentos de destilacion: el repositorio incluye dataset, pesos del profesor, configuracion, historial de entrenamiento y resultados medidos, lo que permite repetir el pipeline completo y auditar la metodologia de destilacion de kernels a redes pequenas.
- Validacion de protocolos de verificacion de modelos: sirve como caso minimo para probar mecanismos de digest SHA-256, comprobacion de esquemas de features y validacion de dimensiones antes de ejecutar inferencia en produccion.
- Docencia y formacion: al ser un modelo tiny (325 parametros) con resultados documentados, es util para explicar en un curso la diferencia entre destilacion de conocimiento y entrenamiento supervisado directo, y por que el control puede superar al estudiante.
- Prototipado de pipelines edge en CPU: su coste de inferencia y huella de memoria son minimos, por lo que puede integrarse en scripts de Python puros sin GPU para validar la forma de una futura etapa de clasificacion de vibraciones.
- Pruebas de robustez a desplazamiento de dominio: el autor reporta evaluacion sobre un desplazamiento de frecuencia de eje de 43-65 Hz (frente a 18-42 Hz en entrenamiento), lo que permite estudiar el comportamiento ante cambios de regimen antes de invertir en datos reales.
- Comparacion de kernels inspirados en cuantica frente a RBF: el modelo incluye un control RBF emparejado en presupuesto, lo que facilita experimentos comparativos de kernel tricks en un marco reproducible.
- Andamiaje para la recogida de datos reales: el modelo puede usarse como linea base provisional en el diseno de un banco de ensayos, sabiendo que no sustituye a un diagnostico de maquina ni a datos de campo medidos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test balanceado de 1.500 ejemplos sinteticos:

| Modelo | Exactitud / exactitud balanceada (test) |
|---|---|
| Product-kernel teacher | 99,933 % |
| Matched-budget RBF teacher | 99,933 % |
| Distilled student | 99,933 % |
| Supervised-only student | 100,000 % |

El estudiante destilado alcanza un 100,000 % sobre un desplazamiento de frecuencia de eje de 43-65 Hz generado de forma independiente (el rango de entrenamiento era 18-42 Hz). El autor advierte que estos resultados corresponden a formulas analiticas sencillas y no a diagnostico de maquinas reales, y que el control supervisado supera al estudiante destilado en la metrica de exactitud en distribucion.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU con NumPy.
- GPU: no se requiere ninguna GPU. Funciona en cualquier CPU capaz de ejecutar Python y NumPy.
- Compatibilidad con consumer GPU: no aplica (el modelo no esta pensado para GPU).
- Opciones de despliegue: cargador propio (`inference.py` con la clase `EdgeModel`) sobre NumPy. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano (325 parametros) y una ventana de 1.024 muestras, se espera un coste muy bajo, pero no se aportan cifras medidas.
- Restricciones de entrada: valores de aceleracion en g; ventanas de entrenamiento de 1.024 muestras a 2.048 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sofia Edge Distilled v0.1 | 325 | MLP destilado desde kernel teacher | 99,933 % (100,000 % en desplazamiento de frecuencia) | Apache 2.0 | HuggingFace + GitHub |
| Product-kernel teacher | no disponible | Kernel ridge regression (product-rotation) | 99,933 % | no disponible | Artefactos incluidos en el repo del estudiante |
| Matched-budget RBF teacher | no disponible | Kernel ridge regression (RBF) | 99,933 % | no disponible | Artefactos incluidos en el repo del estudiante |
| Supervised-only student | 325 | MLP supervisado sin destilacion (control) | 100,000 % | no disponible | Control interno del estudio |

No se dispone de comparativas con modelos externos de clasificacion de vibraciones en la informacion proporcionada.

## Limitaciones y advertencias

- No existen datos de maquinas reales, validacion de campo ni confianza calibrada. Los resultados se basan exclusivamente en datos sinteticos generados a partir de formulas analiticas.
- Los valores de softmax son puntuaciones, no certeza diagnostica. No deben interpretarse como probabilidades calibradas de fallo real.
- La comprobacion de rango es una heuristica de distancia entre caracteristicas, no una garantia de que la senal de entrada sea valida.
- El modelo no puede validar colocacion arbitraria de sensores, tipos de maquinas ni unidades distintas de g.
- Esta destinado a investigacion y demostracion. No dispone de API de actuacion sobre maquinaria.
- Solo se ejecuto una semilla de entrenamiento del Edge; no se ha estudiado la variabilidad entre semillas.
- No se reclama uso de procesador cuantico ni ventaja computacional cuantica: todos los calculos se realizan en hardware CPU clasico.
- El modelo es de tipo clasificador; no ofrece generacion de texto, razonamiento general ni soporte multilingue.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios, aunque el autor recomienda explicitamente limitar su uso a investigacion y demostracion.
- El repositorio registra 0 descargas y 0 likes, y un tamano de repo reportado de 0,0 GB, por lo que se trata de un artefacto experimental sin adopcion conocida.

## Enlaces

- HuggingFace: https://huggingface.co/rootcastleengineering/sofia-edge-distilled-v0.1
- Codigo fuente y entrenamiento reproducible: https://github.com/rootcastleco/sofia-distilled
- Referencia metodologica (Quantum Artificial Intelligence with Verifiable Kernels): https://www.academia.edu/175377730/Quantum_Artificial_Intelligence_with_Verifiable_Kernels
- Verificacion detallada: fichero `VERIFICATION.md` en el repositorio del modelo.
