# Daemons-Q/qsh-telecom-qml-ids

## Resumen

`Daemons-Q/qsh-telecom-qml-ids` es un clasificador tabular publicado en formato ONNX que forma parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación quantum-safe desarrollada por el autor Daemons-Q. El modelo publicado no es una red neuronal ni un transformer: es un bosque aleatorio de 200 árboles de scikit-learn entrenado sobre 7 características de telemetría para clasificar 8 clases (7 tipos de ataque a infraestructura QKD más la clase normal), siguiendo la taxonomía de Al-Kuwari et al. (IET Quantum Communication 7(1), e70028, 2026).

El interés del repositorio no reside en el clasificador en sí, sino en la comparación de arquitecturas que lo acompaña: junto al bosque aleatorio se documentan un SVC con kernel cuántico (PCA seguido de angle embedding, cuyo kernel de fidelidad equivale exactamente al producto clásico de cosenos al cuadrado) y una QNN variacional con StronglyEntanglingLayers y 25 parámetros. Los tres se evaluaron sobre los mismos datos sintéticos, y los resultados son explícitamente mixtos: el bosque aleatorio alcanza un macro F1 de 0,987, el SVC cuántico 0,832 y la QNN 0,467.

Es relevante ahora como referencia metodológica: el autor documenta con honestidad que se trata de una prueba de concepto de investigación y no de un sistema de producción, que los datos son sintéticos porque no existe ninguna captura real de ataques QKD con licencia comercial, y que la literatura del campo (incluida una encuesta sistemática de 2026) depende mayoritariamente de entornos cuánticos simulados y prácticas de evaluación inconsistentes. El modelo se distribuye bajo licencia Apache-2.0 y puede ejecutarse en navegador mediante onnxruntime-web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest (scikit-learn) de 200 árboles, exportado a ONNX |
| Parametros totales | no disponible (no es un modelo paramétrico en el sentido habitual; el artefacto es un conjunto de 200 árboles de decisión) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular sobre 7 características por muestra) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX sin cuantización declarada) |
| Idiomas soportados | no aplica (modelo tabular, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime y onnxruntime-web) |

## Arquitectura y entrenamiento

El modelo publicado es un bosque aleatorio de 200 árboles entrenado con scikit-learn sobre 7 características de telemetría física por sesión. La tarea es de clasificación multiclase con 8 etiquetas: 7 tipos de ataque BB84 más la clase normal. La lista de clases proviene de Al-Kuwari et al., mientras que las 7 características y sus valores de firma son un diseño propio del proyecto. El conjunto de datos es sintético, generado por el módulo `qsh.qml_ids.attacks` del repositorio, y tanto las filas como los pesos entrenados se publican bajo Apache-2.0. El conjunto reportado contiene 2400 muestras.

El repositorio documenta además dos comparaciones de arquitectura cuántica registradas en tiempo de entrenamiento sobre datos idénticos, que no se incluyen en el ONNX publicado ni se ejecutan en la página de demostración. La primera es un SVC con kernel cuántico que aplica PCA seguido de angle embedding; su kernel de fidelidad es computable de forma clásica en forma cerrada porque no emplea puertas de entrelazamiento. La segunda es una QNN variacional con StronglyEntanglingLayers y 25 parámetros. El tiempo de reloj declarado para el conjunto de experimentos es de 341,5 segundos.

## Capacidades

- Clasificación tabular multiclase: asigna una de 8 etiquetas (7 tipos de ataque QKD más normal) a partir de 7 características de telemetría por sesión.
- Inferencia en navegador: el artefacto ONNX es compatible con onnxruntime-web, lo que permite ejecución cliente-side sin backend.
- Integración en pipelines de orquestación quantum-safe: forma parte de la demostración QSMPC-QKD-QHE-AI-Hybrid.
- Comparación de arquitecturas: el repositorio documenta resultados de un SVC con kernel cuántico y de una QNN variacional sobre los mismos datos, útiles como referencia metodológica.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es un clasificador tabular, no un modelo de lenguaje.

## Casos de uso

- Detección de tipos de ataque en infraestructura QKD: el modelo clasifica telemetría de sesión BB84 en una de 7 categorías de ataque o normal, con un macro F1 medido de 0,987 sobre datos sintéticos. Adecuado como componente de un sistema de monitorización de seguridad en enlaces cuánticos.
- Demostración de orquestación quantum-safe: se integra en el proyecto QSMPC-QKD-QHE-AI-Hybrid como el modelo del caso de uso `telecom_ids`, sirviendo para ilustrar cómo encajan clasificadores ligeros en una arquitectura de seguridad post-cuántica.
- Inferencia en el navegador: gracias a su formato ONNX y a onnxruntime-web, puede desplegarse como clasificador cliente-side en aplicaciones web de demostración o paneles de telemetría sin necesidad de servidor de inferencia.
- Evaluación comparativa de métodos cuánticos frente a clásicos: el repositorio proporciona cifras medidas sobre el mismo split para bosque aleatorio, SVC con kernel cuántico y QNN variacional, lo que lo convierte en material útil para investigadores que quieran reproducir o contrastar comparaciones de este tipo.
- Prototipado de detección de intrusiones en redes de telecomunicaciones: aunque el dominio es QKD, el patrón (7 características tabulares, 8 clases, modelo ligero exportado a ONNX) es reutilizable como plantilla para clasificadores de intrusión en otros dominios de telecomunicaciones.
- Docencia y divulgación sobre límites de los modelos cuánticos: la brecha medida entre el bosque aleatorio (0,987) y la QNN (0,467) sobre los mismos datos sirve como caso de estudio concreto sobre cuándo un enfoque cuántico no aporta ventaja.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `aggregate_accuracy` | 0,986667 |
| `classical_rf_macro_f1` | 0,986629 |
| `n_classes` | 8 |
| `n_samples` | 2400 |
| `quantum_qnn_accuracy` | 0,875 |
| `quantum_qnn_binary_f1` | 0,933333 |
| `quantum_qnn_macro_f1` | 0,466667 |
| `quantum_qnn_n_params` | 25 |
| `quantum_svc_accuracy` | 0,908333 |
| `quantum_svc_binary_f1` | 0,945274 |
| `quantum_svc_macro_f1` | 0,831611 |
| `wall_clock_s` | 341,5 |

El autor advierte explícitamente de que la métrica objetivo es el macro F1 y de que la accuracy agregada puede parecer sana mientras la clase que importa no lo está; por eso se reportan ambas. Los resultados de la QNN y del SVC cuántico corresponden a comparaciones de arquitectura registradas en entrenamiento, no a componentes desplegados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se declara una cifra de memoria.
- GPU recomendadas: no aplica; un bosque aleatorio de 200 árboles exportado a ONNX se ejecuta típicamente en CPU sin necesidad de GPU.
- Compatibilidad con GPU de consumo: sí, en la práctica cualquier equipo puede ejecutarlo en CPU; no se requieren GPU dedicadas.
- Opciones de despliegue: onnxruntime (Python, C++, etc.) y onnxruntime-web para navegador, según declara la model card.
- Latencia y throughput estimados: no disponible; el único dato temporal publicado es el tiempo total de reloj de los experimentos (341,5 s), que no corresponde a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Macro F1 (datos del proyecto) | Licencia |
|---|---|---|---|---|---|
| qsh-telecom-qml-ids (bosque aleatorio publicado) | Random forest / ONNX | no disponible (200 árboles) | no aplica | 0,987 | Apache-2.0 |
| SVC con kernel cuántico (comparación interna) | PCA + angle embedding + SVC | no disponible | no aplica | 0,832 | Apache-2.0 (mismo repo) |
| QNN variacional (comparación interna) | StronglyEntanglingLayers | 25 | no aplica | 0,467 | Apache-2.0 (mismo repo) |
| Al-Kuwari et al., QLSTM híbrido (arXiv:2509.14282) | QLSTM híbrido | no disponible | no aplica | 94,7 % accuracy / 94,7 % F1 (según el paper) | no disponible en la información proporcionada |
| IACR ePrint 2026/1282 (XGBoost + features físicas) | XGBoost clásico | no disponible | no aplica | 96,9 % recall / 97,6 % precision (BBM92, binario) | no disponible en la información proporcionada |

Advertencia del autor: el resultado de IACR ePrint 2026/1282 corresponde a un problema distinto (protocolo BBM92, espacio de 24 características, ventanas deslizantes de 30 segundos, detección binaria), por lo que es un ancla de referencia y no una línea base comparable directamente.

## Limitaciones y advertencias

- Datos sintéticos: no existe ninguna captura real de ataques QKD con licencia comercial; todas las filas están etiquetadas como sintéticas en cada informe del proyecto.
- Prueba de concepto, no sistema de producción: el autor lo declara explícitamente en la sección "Honest scope".
- El modelo publicado es el bosque aleatorio; los resultados cuánticos (SVC y QNN) son comparaciones de arquitectura registradas en entrenamiento y no se ejecutan en la página de demostración.
- El SVC con kernel cuántico no emplea puertas de entrelazamiento, por lo que su kernel es computable de forma clásica en forma cerrada; no constituye una ventaja cuántica demostrada.
- Las 7 características y sus valores de firma son un diseño propio del proyecto, no un estándar de la literatura, lo que limita la comparabilidad con otros trabajos.
- La accuracy agregada puede enmascarar un mal rendimiento en la clase minoritaria relevante; el propio autor recomienda leerla junto al macro F1.
- El campo de detección de ataques QKD con machine learning es metodológicamente temprano: una encuesta sistemática hasta enero de 2026 (Kaissar, Bou Nassif & Bouridane, Future Internet 18(5):234) concluye que la mayoría de los enfoques dependen de entornos cuánticos simulados y conjuntos de datos heredados, con prácticas de evaluación inconsistentes.
- Licencia Apache-2.0: permite uso comercial, pero el propio modelo no debe presentarse como un sistema de detección de ataques QKD validado en producción.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-telecom-qml-ids
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Paper de referencia de clases y datos: https://arxiv.org/abs/2509.14282 (Al-Kuwari et al., IET Quantum Communication 7(1), e70028, DOI 10.1049/qtc2.70028)
- Paper citado y retirado por sus autores (evaluación insuficiente): https://arxiv.org/abs/2512.05069
- Encuesta sistemática de referencia: Kaissar, Bou Nassif & Bouridane, Future Internet 18(5):234 (2026-04-27), DOI 10.3390/fi18050234
- Ancla clásica de 2026 (BBM92, XGBoost): IACR ePrint 2026/1282
