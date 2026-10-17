# Kai9987kai/NEUROGRAFT

# Neurograft

## Resumen

Neurograft es un instrumento de investigación local publicado por Kai9987kai en Hugging Face (repositorio de 0,2 GB, librería PyTorch) que conecta grafos neuronales separados y con procedencia preservada mediante una capa de enrutamiento artificial entrenable. No es un modelo de lenguaje preentrenado ni un checkpoint listo para producción: es un paquete de código y artefactos que incluye grafos dispersos tipados, importadores de CSV y matrices humanas, codificadores recurrentes de grafo, injertos sintéticos dispersos, un benchmark de memoria retardada con controles emparejados y un entorno 3D persistente de navegación y aprendizaje continuo (`python -m neurograft live`). También ofrece una interfaz diferenciable hacia backbones Qwen congelados, aunque el propio autor aclara que el modelo preentrenado es una dependencia opcional que no se descarga automáticamente.

La relevancia del proyecto es metodológica: propone una arquitectura de integración de conectomas (gusano, mosca hembra, mosca macho y humano) con módulos cognitivos inspirados en literatura de 2024-2026, como la consolidación latente CLCS, el principio de Dale, la destilación soft-KL anti-olvido, la brújula de anillo del complejo central, la inferencia activa con energía libre esperada, una memoria jerárquica de tres niveles y un motor de estabilidad de Lyapunov. Sin embargo, la evidencia disponible es limitada: el autor indica que la implementación del circuito se ejecuta y entrena localmente, que las entradas de mosca y humano de la demostración son fixtures sintéticos y que las pruebas con Qwen usan modelos minúsculos inicializados aleatoriamente. No se ha cargado ni entrenado un checkpoint Qwen preentrenado y no se ha establecido ninguna ventaja biológica del conectoma.

No se publican recuentos de parámetros, longitud de contexto, licencia ni idiomas soportados. El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sitúa al proyecto en una fase temprana de investigación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos recurrentes y redes neuronales de grafo con capa de enrutamiento entrenable; MoE latente Top-2 SwiGLU (CLCS); atractor de anillo de 16 cuñas para la brújula del complejo central |
| Parametros totales | no disponible |
| Parametros activos | no disponible (existe un MoE latente Top-2, pero no se publica recuento de parámetros) |
| Longitud de contexto | no disponible; la ventana de adaptación online es de 4 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la interfaz Qwen heredaría los del checkpoint, no especificado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `session.pt` y checkpoints de inferencia validados; el resto es código Python |
| Tipo de artefacto | Paquete de investigación en PyTorch; no es un LLM preentrenado |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico, sino una composición de módulos de grafo recurrente con enrutamiento entrenable entre fuentes heterogéneas. La capa CLCS consolida representaciones de gusano, mosca hembra, mosca macho y humano en un espacio latente normalizado mediante expertos latentes dispersos Top-2 con activación SwiGLU, 16 ranuras de memoria asociativa con atención query-key y una compuerta residual de autopista inicializada a cero (`out_gate = 0.0`) que garantiza la identidad exacta en la inicialización. Sobre esa base se aplican restricciones biofísicas inspiradas en el conectoma del CNS masculino de Janelia: polaridad de neurotransmisor en sinapsis químicas (colinérgicas y monoaminérgicas +1; GABAérgicas y glutamatérgicas -1), normalización por fracciones de entrada medidas y cotas de contracción de Collatz-Wielandt con radio espectral objetivo `rho(|W|) <= 0.90`.

El entrenamiento online se plantea como imitación supervisada del camino más corto determinista en un mundo multi-cámara de 15×15 por defecto, escalable de 5×5 a 31×31, con presets de laberinto, cámaras, corredores y pilares, haces LiDAR de 8 rayos, anillos de puertas de cuello de botella, plumas de gradiente quimiotáctico y métricas de tortuosidad y desvío. Cuando se activa el modo de aprendizaje, la cabeza de navegación de 4 vías (norte, este, sur, oeste), los injertos dispersos entre fuentes y los codificadores recurrentes se actualizan con AdamW (`lr=8e-3`), ventana de 4 pasos, tamaño de lote 8 y recorte de gradiente de 1,0; existe además un disparador interactivo de evolución "Boost ×16". La función de pérdida combina imitación, una ancla soft-KL contra una política inicial congelada con peso 0,15 y un término de equilibrio con peso 0,05. En cuanto a datos, la fuente OpenWorm se ha adquirido y normalizado con recibos de filtrado explícitos; las entradas de mosca hembra, mosca macho y humano de la demostración son fixtures sintéticos y no se ha entrenado ningún checkpoint Qwen preentrenado.

## Capacidades

- Navegación en un entorno 3D multi-cámara con presets arquitectónicos, conectividad garantizada de celdas libres y métricas de tortuosidad y desvío.
- Aprendizaje continuo online mediante imitación del camino más corto, con cabeza de navegación de 4 acciones y actualización de codificadores recurrentes e injertos dispersos.
- Integración y enrutamiento de grafos neuronales de distinta procedencia (gusano, mosca hembra, mosca macho, humano) preservando la procedencia de cada fuente.
- Consolidación latente de representaciones heterogéneas con expertos Top-2 SwiGLU y 16 ranuras de memoria asociativa.
- Estabilización tipo reflejo optomotor: si la coherencia de la brújula de anillo cae por debajo de `R_crit = 0.35`, se activa un contrapares de corrección.
- Arbitraje de decisiones por inferencia activa: valor homeostático pragmático, curiosidad epistémica y empoderamiento, modulados por dopamina y octopamina.
- Memoria cognitiva en tres niveles (memoria de trabajo recurrente guiada por sorpresa, almacén episódico con compuerta de valor y mapa espacial topológico) con cinco modos de lesión emparejados: `intact`, `erased`, `shifted`, `random_retrieval` y `memory_free`.
- Análisis de estabilidad dinámica mediante estado homeostático 4D, separatriz de Lyapunov y cotas de contracción.
- Interfaz diferenciable hacia backbones Qwen congelados, verificada únicamente con modelos minúsculos inicializados aleatoriamente.
- No hay evidencia publicada de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso de propósito general.

## Casos de uso

- Investigación en conectómica comparada: importar matrices CSV o humanas y conectomas normalizados de OpenWorm para estudiar cómo se integran fuentes de distinta escala mediante la capa de enrutamiento, manteniendo recibos de filtrado y procedencia por fuente.
- Estudio de olvido catastrófico: utilizar la ancla soft-KL y el término de equilibrio para medir cuánto se degrada una política inicial al adaptarse online a una tarea nueva, comparando con y sin ancla.
- Evaluación de memoria retardada: emplear el benchmark incluido con controles emparejados y los cinco modos de lesión para aislar qué componente de la memoria jerárquica explica una diferencia de rendimiento.
- Simulación de navegación y estudio de políticas: ejecutar el mundo de 15×15 con LiDAR de 8 rayos y presets de laberinto o pasillos para analizar rutas, cuellos de botella y métricas de desvío bajo distintas condiciones de aprendizaje.
- Docencia y divulgación de neurociencia computacional: lanzar la sesión local en `http://127.0.0.1:8768/` y mostrar en directo cómo evolucionan los módulos de gusano y mosca, la brújula de anillo y el estado homeostático.
- Prototipado de arquitecturas híbridas grafo-LLM: usar la interfaz diferenciable hacia un Qwen congelado como banco de pruebas para conectar un codificador de grafo a un backbone transformer, sabiendo que el checkpoint preentrenado debe aportarse aparte.
- Análisis de estabilidad de sistemas dinámicos: aprovechar el motor de Lyapunov, la separatriz y las cotas de Collatz-Wielandt para estudiar condiciones de contracción en redes recurrentes con acoplamiento biológicamente restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un benchmark de memoria retardada con controles emparejados y checkpoints de inferencia validados, pero no se proporcionan cifras numéricas, métricas comparativas ni resultados frente a otros sistemas.

## Requisitos de hardware

- No se documentan requisitos oficiales de hardware en la model card ni en el repositorio.
- El paquete está diseñado para ejecutarse localmente (`python -m neurograft live` y el lanzador `Run-NEUROGRAFT.ps1 -Mode Live`) y el repositorio ocupa 0,2 GB, pero no se especifica si la ejecución requiere GPU.
- Las pruebas de la interfaz Qwen descritas usan modelos minúsculos inicializados aleatoriamente, por lo que no representan una carga de inferencia realista.
- El coste de VRAM para la interfaz Qwen dependerá del checkpoint que decida cargar el usuario; la model card no fija ninguno y no se ha probado ninguno preentrenado. Como referencia genérica no publicada por el autor, un Qwen de 7B en fp16 requiere del orden de 14 GB, pero es una estimación ajena al proyecto.
- Opciones de despliegue documentadas: paquete Python con PyTorch, servidor local en `127.0.0.1:8768` y lanzador PowerShell. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. Neurograft es un instrumento de investigación sobre grafos y enrutamiento, no un modelo fundacional con parámetros, contexto y benchmarks homologables. La única referencia externa es Qwen, que aparece como backbone congelado opcional y no como componente incluido.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neurograft | Instrumento de investigación (grafos + enrutamiento + entorno 3D) | no disponible | no disponible (ventana online de 4 pasos) | no disponible | Repositorio público en Hugging Face y GitHub; 0 descargas, 1 like |
| Qwen (backbone referenciado, no incluido) | LLM transformer | no disponible | no disponible | no disponible | Dependencia opcional, no descargada automáticamente |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | No se han encontrado en la búsqueda web realizada |

## Limitaciones y advertencias

- No es un modelo preentrenado: no se ha cargado ni entrenado un checkpoint Qwen y no hay evidencia de capacidades generativas de propósito general.
- Las entradas de mosca hembra, mosca macho y humano de la demostración son fixtures sintéticos; no representan datos biológicos reales.
- El propio autor declara que no se ha establecido ninguna ventaja del conectoma biológico sobre alternativas convencionales.
- Las pruebas de la interfaz Qwen se hicieron con modelos minúsculos inicializados aleatoriamente, por lo que no validan el comportamiento con un modelo preentrenado.
- Ausencia de licencia declarada: no puede asumirse permiso para uso comercial, redistribución o modificación.
- Ausencia de idiomas declarados y de cualquier evaluación multilingüe.
- No hay benchmarks públicos ni cifras de rendimiento que permitan comparar el sistema con alternativas.
- Proyecto en fase temprana (0 descargas, 1 like, creado y actualizado el mismo día): riesgo de falta de mantenimiento, cambios incompatibles y documentación incompleta.
- El modelo preentrenado es una dependencia opcional que no se descarga automáticamente; un usuario puede creer que dispone de un LLM cuando solo tiene el paquete de investigación.
- Las métricas internas del entorno (coherencia PVA, radio espectral, separatriz de Lyapunov) no deben interpretarse como validación biológica ni como medida de calidad de un modelo de lenguaje.
- No hay riesgo de alucinación en el sentido clásico de un LLM, pero sí de sobreextraer conclusiones de telemetría y visualizaciones generadas por módulos sintéticos.
- La procedencia de los datos OpenWorm debe revisarse caso por caso; el autor menciona recibos de filtrado, pero no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/NEUROGRAFT
- Repositorio en GitHub: https://github.com/kai9987kai/NEUROGRAFT
- README del repositorio: https://github.com/kai9987kai/NEUROGRAFT/blob/main/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/Kai9987kai
- Modelos del autor en Hugging Face: https://huggingface.co/Kai9987kai/models
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales específicos del modelo.
