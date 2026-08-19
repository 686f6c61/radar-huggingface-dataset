# Qhub-AI/QAdapt

## Resumen

QAdapt es un framework de pre-decodificación neuronal adaptativo al ruido para corrección de errores cuánticos, desarrollado por Qhub-AI. Aborda el problema de la decodificación de códigos de superficie en computación cuántica, donde los decodificadores tradicionales como PyMatching presentan latencias elevadas y poca adaptabilidad a la deriva de ruido. QAdapt combina una red neuronal ligera (650.374 parámetros) con un decodificador global clásico, reduciendo la tasa de error lógico (LER) en comparación con alternativas puramente clásicas o neuronales densas.

El modelo se basa en la arquitectura HTNet, un bloque de fusión espacio-temporal heterogéneo que procesa eventos de detectores 3D con ramas espaciales, temporales y conjuntas. Está diseñado para adaptarse continuamente a perturbaciones de ruido físicamente interpretables mediante aprendizaje continuo con regularización Q-EWC. Su relevancia actual radica en la necesidad de decodificadores rápidos y robustos para la corrección de errores en tiempo real en procesadores cuánticos, especialmente ante la deriva de ruido y condiciones fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTNet (stem convolucional 3D + 3 bloques de fusion espacio-temporal heterogenea) |
| Parametros totales | 650.374 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de decodificacion cuantica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QAdapt emplea una arquitectura neuronal convolucional 3D especifica para procesar eventos de detectores de codigos de superficie. El pipeline completo es: eventos de detectores `[B, 4, T, H, W]` -> pre-decodificador neuronal local -> correccion local predicha y sindrome residual -> decodificador global residual PyMatching -> prediccion logica. La red neuronal usa un stem convolucional 3D con 112 canales ocultos, seguido de tres bloques HTNet de fusion espacio-temporal. Cada bloque combina una rama espacial, una rama temporal y una rama conjunta 3D agrupada, con fusion adaptativa a la entrada, gating por canal, eje temporal y eje espacial, y conexion residual. La cabeza de salida produce cuatro canales de correccion.

El entrenamiento se realizo con muestras generadas bajo demanda mediante Stim, a partir de configuraciones de Pauli a nivel de circuito de 25 parametros publicas. QAdapt se entreno de forma continua en cinco tareas (T0 a T4), 20 epocas por tarea, con un coeficiente Q-EWC de 100 y 65.536 muestras por estimacion de Fisher. El hardware de entrenamiento fue 4x NVIDIA A100. El baseline Ising-fast (una red densa de cuatro capas convolucionales 3D con filtros `[128, 128, 128, 4]`) se entreno solo en T0 durante 100 epocas. No se distribuyen codigo de entrenamiento, estado del optimizador ni checkpoints intermedios.

## Capacidades

- Pre-decodificacion neuronal local para correccion de errores cuanticos en codigos de superficie.
- Adaptacion continua a la deriva de ruido mediante aprendizaje continuo con regularizacion Q-EWC.
- Inferencia hibrida: la salida neuronal se combina con un decodificador global PyMatching para obtener la correccion logica final.
- Procesamiento de eventos de detectores espacio-temporales heterogeneos (3D convolucional).
- Evaluacion en multiples distancias de codigo (d=5, d=7, d=9) y regimenes de ruido.
- Capacidad de generalizacion fuera de distribucion (OOD) ante perturbaciones sinteticas de ruido.
- Inferencia zero-shot en datos de terceros (benchmark Willow) sin reentrenamiento.

## Casos de uso

- Decodificacion en tiempo real para procesadores cuanticos superconductores: QAdapt reduce la latencia frente a decodificadores puramente clasicos, permitiendo ciclos de correccion mas rapidos en experimentos de superficie code.
- Mitigacion de la deriva de ruido en dispositivos cuanticos: el modelo se adapta continuamente a cambios en los parametros de ruido (T0 a T4), manteniendo una LER baja sin necesidad de reentrenamiento completo.
- Pre-decodificacion en sistemas de correccion de errores a gran escala: al reducir el sindrome residual antes del decodificador global, se puede escalar a distancias mayores sin aumentar la complejidad del decodificador clasico.
- Evaluacion de decodificadores neuronales en condiciones fuera de distribucion: QAdapt demuestra robustez frente a perturbaciones sinteticas de ruido, util para validar decodificadores antes de desplegarlos en hardware real.
- Investigacion en aprendizaje continuo aplicado a correccion cuantica: el uso de Q-EWC sobre tareas secuenciales de ruido proporciona un caso de estudio para tecnicas de regularizacion en dominios cientificos.
- Benchmarking de decodificadores neuronales frente a clasicos: el repositorio incluye un baseline Ising-fast y los resultados comparativos, facilitando la reproducibilidad y la comparacion justa.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evaluacion de los checkpoints finales (epoca 100) en d=9/r=9 con 262.144 disparos por base logica y tarea, semilla 12345. Se comparan tres metodos: PyMatching (decodificador clasico), Ising-fast T0 e100 (baseline neuronal denso) y QAdapt.

| Tarea | PyMatching LER | Ising-fast LER | QAdapt LER |
|---|---:|---:|---:|
| T0 | 0,04503 | 0,04094 | **0,03612** |
| T1 | 0,05489 | 0,05207 | **0,04619** |
| T2 | 0,15404 | 0,14017 | **0,13012** |
| T3 | 0,04997 | 0,04532 | **0,04053** |
| T4 | 0,09811 | 0,09135 | **0,08282** |
| Media | 0,08041 | 0,07397 | **0,06716** |

QAdapt reduce la LER media en un 9,22% relativo al baseline Ising-fast T0 e100. En evaluaciones sinteticas fuera de distribucion (OOD), QAdapt gana las 110 comparaciones a nivel de configuracion frente a Ising-fast. Los datos de latencia y reduccion de LER para OOD se mencionan en la model card pero la tabla esta truncada en la informacion proporcionada; no se dispone de los valores numericos completos.

## Requisitos de hardware

- Entrenamiento: 4x NVIDIA A100 (segun la model card). No se especifica duracion ni VRAM por GPU.
- Inferencia: el modelo tiene solo 650.374 parametros, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM. Una RTX 3060 o superior es suficiente.
- El repositorio no proporciona mediciones de latencia o throughput para inferencia. Dado el tamano reducido, se espera una latencia en el orden de microsegundos a milisegundos por muestra, pero no hay datos publicados.
- Despliegue: el modelo se integra con el repositorio NVIDIA/Ising-Decoding (revision `33acb152e403bc189f2effdb07f1a87b34c745f1`) mediante un parche. No es un modelo Transformers, por lo que no se puede cargar con `AutoModel`. Se requiere el entorno de inferencia de Ising-Decoding.
- No se mencionan opciones de cuantizacion, vLLM, Ollama ni TGI; este modelo no es un LLM y su despliegue es especifico del dominio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | LER media (T0-T4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QAdapt | HTNet (convolucional 3D + fusion espacio-temporal) | 650.374 | 0,06716 | Apache-2.0 | safetensors + parche |
| Ising-fast T0 e100 | CNN densa 3D (4 capas, filtros [128,128,128,4]) | 912.772 | 0,07397 | Apache-2.0 | safetensors (incluido en repo) |
| PyMatching | Decodificador clasico basado en matching | no aplica | 0,08041 | Apache-2.0 | codigo abierto |

PyMatching es el decodificador clasico de referencia para codigos de superficie. Ising-fast es un baseline neuronal denso incluido en el repositorio para comparacion pareada. QAdapt supera a ambos en LER media, con menos parametros que Ising-fast. No se dispone de comparaciones con otros decodificadores neuronales publicados (p. ej., otros basados en transformers o GNN) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de investigacion, no un producto listo para produccion. No se distribuyen codigo de entrenamiento ni estado del optimizador.
- Dependencia de un parche: requiere aplicar un parche al repositorio NVIDIA/Ising-Decoding en una revision concreta; cualquier cambio en ese repositorio puede romper la compatibilidad.
- Datos de entrenamiento limitados a configuraciones publicas de 25 parametros de Pauli a nivel de circuito; el rendimiento en otros regimenes de ruido no esta garantizado.
- Evaluacion OOD limitada a perturbaciones sinteticas; no hay evidencia de rendimiento en hardware cuantico real.
- La evaluacion en Willow es zero-shot y los datos de ese benchmark no se redistribuyen; los resultados dependen de la integridad de la descarga externa.
- Sesgos y alucinaciones: al ser un decodificador neuronal, puede producir correcciones erroneas si el ruido se desvia significativamente de los patrones vistos en entrenamiento. No hay analisis de sesgos especificos publicados.
- Licencia Apache-2.0 permite uso comercial, pero el codigo de entrenamiento no se incluye, lo que limita la personalizacion.
- La tabla de resultados OOD esta incompleta en la informacion proporcionada; no se pueden verificar las afirmaciones de latencia o reduccion de LER en ese escenario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qhub-AI/QAdapt
- Arxiv (paper): https://arxiv.org/pdf/2607.28422
- Repositorio NVIDIA/Ising-Decoding (base para inferencia): https://github.com/NVIDIA/Ising-Decoding
- Arbol de archivos del repo: https://huggingface.co/Qhub-AI/QAdapt/tree/main
