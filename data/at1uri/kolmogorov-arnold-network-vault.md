# At1uri/kolmogorov-arnold-network-vault

## Resumen

`At1uri/kolmogorov-arnold-network-vault` no es un modelo de lenguaje, sino un repositorio de investigacion en Python que implementa los algoritmos matematicos centrales de las Kolmogorov-Arnold Networks (KAN): evaluacion recursiva de bases B-spline mediante la recurrencia de Cox-de Boor, derivadas analiticas, refinamiento adaptativo de rejilla y destilacion automatica a regresion simbolica. Lo publica Ramprasad Atluri bajo el identificador `At1uri` con licencia MIT.

El interes del paquete reside en que proporciona primitivas verificadas numericamente (particion de la unidad con desviacion inferior a 3,33e-16, derivadas analiticas con error inferior a 1,70e-10 frente a diferencias finitas y recuperacion exacta de una funcion simbolica con R² = 1,000000). No incluye pesos entrenados, tokenizador ni pipeline de inferencia; es material de referencia para quien quiera construir o auditar capas KAN.

Por su naturaleza, no compite con modelos generativos: su relevancia esta en el nicho de investigacion en arquitecturas alternativas al MLP, interpretabilidad y regresion simbolica. Cualquier uso en produccion exigiria integrar estos modulos en un framework de entrenamiento propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kolmogorov-Arnold Network (KAN) con bases B-spline evaluadas por recurrencia de Cox-de Boor; no es un transformer ni un modelo neuronal preentrenado |
| Parametros totales | no disponible (repositorio de codigo sin pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible (sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | no disponible; el contenido son ficheros Python (`bspline_core.py`, `kan_layer.py`, `symbolic_regression.py`) y un `MANIFEST.json` con hashes SHA-256 |

## Arquitectura y entrenamiento

La base teorica es el teorema de representacion de Kolmogorov-Arnold (1957), que descompone cualquier funcion continua multivariante en una superposicion finita de funciones continuas de una variable, con 2n+1 sumandos externos. Sobre esa idea, el repositorio implementa una capa KAN donde cada arista aprende una curva univariante representada como combinacion de B-splines de grado k. La evaluacion se hace con la recurrencia de Cox-de Boor y se incluyen derivadas analiticas cerradas, lo que evita aproximaciones por diferencias finitas durante el entrenamiento.

El modulo `symbolic_regression.py` implementa la destilacion automatica: al ser cada arista una funcion 1D aislada, se puede proyectar sobre una biblioteca de candidatos (sin, cos, exp, log, potencias, raiz cuadrada) y recuperar una formula cerrada. El repositorio incluye ademas poda de aristas (edge pruning) para imponer esparsidad. No se documenta en la informacion disponible ningun proceso de entrenamiento con datasets, numero de tokens, RLHF ni DPO, dado que no hay modelo entrenado.

## Capacidades

- Evaluacion recursiva de bases B-spline de grado arbitrario mediante Cox-de Boor.
- Calculo de derivadas analiticas de las bases, con verificacion frente a diferencias finitas.
- Comprobacion de la propiedad de particion de la unidad en el intervalo valido de la secuencia de nudos.
- Refinamiento adaptativo de rejilla (adaptive grid refinement) para aumentar resolucion donde el error es mayor.
- Destilacion automatica a expresiones simbolicas sobre una biblioteca de funciones elementales.
- Poda de aristas para imponer esparsidad en la capa KAN.
- Suite de verificacion (`benchmarks/eval_kan_accuracy.py`) que comprueba teoremas y precision numerica.
- No incluye generacion de texto, codigo, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion en arquitecturas alternativas al MLP: sirve como implementacion de referencia para reproducir experimentos con KAN y comparar frentes de Pareto precision/interpretabilidad frente a MLP de tamano equivalente.
- Regresion simbolica de datos cientificos: dado un conjunto de observaciones de un sistema fisico, la capa KAN con destilacion permite recuperar formulas cerradas como `y = 2.5 sin(x) - 0.75`, utiles en laboratorios que necesitan leyes explicitas y no cajas negras.
- Descubrimiento de ecuaciones en ingenieria: la proyeccion sobre `sin`, `cos`, `exp`, `log`, potencias y raices encaja en la identificacion de relaciones analiticas en mecanica de fluidos, circuitos o cinetica quimica.
- Docencia y formacion: el codigo y la suite de tests permiten ilustrar el teorema de Kolmogorov-Arnold, la recurrencia de Cox-de Boor y la particion de la unidad con verificaciones numericas ejecutables.
- Auditoria de implementaciones KAN de terceros: el `MANIFEST.json` con hashes SHA-256 y los tests de precision (desviacion menor que 3,33e-16 en particion de la unidad) permiten validar que una implementacion respeta las propiedades matematicas esperadas.
- Base para modelos surrogate interpretables: en simulacion de sistemas costosos, una capa KAN destilada puede sustituir a un surrogate opaco y ofrecer al mismo tiempo la formula extraida.
- Prototipado de capas personalizadas en PyTorch: los modulos `bspline_core.py` y `kan_layer.py` se pueden integrar en pipelines propios de entrenamiento, aunque el repositorio no incluye framework de entrenamiento completo.

## Benchmarks y rendimiento

Los unicos resultados publicados son las verificaciones numericas de la suite incluida en el repositorio.

| Prueba | Metrica | Resultado |
|---|---|---|
| Particion de la unidad (B-spline) | Desviacion maxima | < 3,33e-16 |
| Derivadas analiticas frente a diferencias finitas | Error absoluto | < 1,70e-10 |
| Destilacion simbolica de `y = 2.5 sin(x) - 0.75` | Coeficiente de determinacion | R² = 1,000000 |
| Poda de aristas | Esparsidad impuesta en sinapsis inactivas | Verificada (sin cifra publicada) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con que el repositorio no contiene un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay pesos que cargar en GPU. El consumo depende del tamano de la rejilla B-spline y del numero de aristas que configure el usuario.
- GPU recomendadas: cualquiera compatible con el framework de arrays que se use (NumPy o PyTorch); para rejillas grandes conviene una GPU con al menos 8-16 GB, aunque no se documentan cifras.
- Cabe en GPU de consumo: si, en principio cualquier GPU consumer moderna es suficiente para ejecutar los tests; no se especifican requisitos minimos.
- Opciones de despliegue: ejecucion directa con Python (`python benchmarks/eval_kan_accuracy.py`); no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `At1uri/kolmogorov-arnold-network-vault` | Repositorio de codigo KAN | no aplica | no aplica | MIT | Hugging Face (0 descargas) |
| pykan (implementacion KAN de referencia) | Libreria Python | no aplica | no aplica | MIT | GitHub |
| MLP estandar (PyTorch) | Capa neuronal densa | configurable | no aplica | BSD | PyTorch |

La comparacion con modelos de lenguaje no procede: este repositorio no es un modelo generativo. Frente a `pykan`, la propuesta de `At1uri` enfatiza la verificacion criptografica (hashes SHA-256) y una suite de tests explicita de propiedades matematicas; no se dispone de datos publicados que permitan comparar rendimiento de entrenamiento o velocidad entre ambas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no tiene tokenizador ni pesos entrenados.
- No incluye pipeline de entrenamiento completo; el usuario debe aportar el bucle de optimizacion, el dataset y la funcion de perdida.
- Las cifras de precision publicadas (3,33e-16, 1,70e-10) corresponden a tests internos del autor y no han sido replicadas de forma independiente segun la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- La destilacion simbolica depende de la biblioteca de funciones candidatas; no puede recuperar expresiones fuera de ese conjunto (por ejemplo, funciones especiales o composiciones no listadas).
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantia sobre correccion numerica en dominios distintos a los probados.
- Riesgo de alucinacion, sesgos y limitaciones idiomaticas: no aplica, al no existir componente generativo.
- Para produccion, conviene auditar el codigo y ejecutar la suite de verificacion en el entorno objetivo antes de integrar los modulos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/At1uri/kolmogorov-arnold-network-vault
- Paper original de KAN (Liu et al., 2024): no disponible en la informacion proporcionada
- Teorema de Kolmogorov-Arnold (Kolmogorov, 1957; Arnold, 1957): no disponible enlace en la informacion proporcionada
- Implementacion de referencia pykan: no disponible enlace en la informacion proporcionada
- Perfil del autor: https://huggingface.co/At1uri
