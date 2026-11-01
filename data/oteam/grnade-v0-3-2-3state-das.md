# oteam/grnade-v0.3.2-3state-das

## Resumen

gRNAde es un modelo de aprendizaje profundo geométrico diseñado para el problema del *inverse folding* de ARN: dada una o varias conformaciones 3D de la columna vertebral (backbone) de una molécula de ARN, predecir la secuencia de nucleótidos que la adoptaría. Desarrollado originalmente por Chaitanya K. Joshi y colaboradores (Universidad de Cambridge), esta ficha corresponde a una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/grnade-v0.3.2-3state-das`.

La variante aquí descrita pertenece a la familia v0.3.2 con configuración de tres estados conformacionales (3-state), lo que significa que el modelo puede condicionar el diseño de una única secuencia sobre tres conformaciones alineadas de la misma molécula de ARN. El grafo de esta versión utiliza únicamente características espaciales, sin canales de secuencia ni de pares de bases, a diferencia de la variante v1.

Con 2,157 millones de parámetros (2,157 M), se trata de un modelo compacto especializado, no de un modelo de lenguaje general. Su relevancia radica en aplicaciones de biología estructural y diseño de ARN terapéutico, donde la capacidad de generar secuencias compatibles con múltiples estados conformacionales es un requisito real para el diseño de riboswitches, aptámeros y ARN con función dependiente de cambio conformacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GVP (geometric-vector perceptron) encoder + decoder autorregresivo de nucleótidos |
| Parámetros totales | 2.157.052 (2,157 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tamaño de la estructura de ARN de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Librería | ofoldx |
| Pipeline | other (diseño de secuencias de ARN) |
| Bloques de encoder / decoder | 4 / 4 |
| Tamaño escalar/vector de nodo | 128 / 16 |
| Tamaño escalar/vector de arista | 64 / 4 |
| Canales de arista de entrada | 131 |
| Estados conformacionales | 3 |

## Arquitectura y entrenamiento

El modelo combina un encoder de perceptrón vectorial geométrico (GVP) con un decoder autorregresivo de nucleótidos. El encoder procesa una o varias conformaciones alineadas de la misma molécula de ARN, agregando la información geométrica antes de predecir las identidades de los nucleótidos. En la variante v0.3.2 el grafo utiliza exclusivamente geometría espacial (coordenadas atómicas), sin incorporar canales de orden de secuencia ni de pares de bases secundarias, lo que lo diferencia del grafo v1, que sí incluye esas señales. El modelo mantiene la configuración de tres conformaciones con la que fue publicado.

El entrenamiento se plantea como recuperación autorregresiva de la secuencia de ARN a partir del contexto estructural, con un valor de *label smoothing* de 0,05. La model card no detalla el corpus de entrenamiento ni el número de tokens o estructuras utilizadas, remitiendo a los artículos originales para la composición de los datos y la construcción de ejemplos mono y multi-conformación. La librería OFoldX expone un `forward` diferenciable con *teacher forcing* y una clase `GrnadeLoss` para entrenamiento y ajuste fino, aunque la orquestación completa del entrenamiento queda fuera del alcance del paquete.

## Capacidades

- Diseño de secuencias de ARN (*inverse folding*) a partir de una estructura 3D de backbone.
- Condicionamiento sobre múltiples conformaciones alineadas de la misma molécula (en esta variante, hasta tres estados).
- Incorporación de estructura secundaria en formato dot-bracket como restricción del diseño.
- Generación de múltiples candidatos de secuencia con control de temperatura de muestreo.
- Puntuación de las secuencias candidatas generadas.
- Soporte de cadenas o instancias múltiples dentro de una misma estructura mediante `instance_id`.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) a través del pipeline de OFoldX.
- No soporta tool calling, agentes, multimodalidad ni generación de texto libre: es un modelo especializado en biología estructural.

## Casos de uso

- Diseño de riboswitches: el modelo puede generar secuencias que adopten distintas conformaciones en función de un ligando, aprovechando su capacidad de condicionar sobre tres estados conformacionales alineados de la misma molécula.
- Diseño de aptámeros de ARN: partiendo de la estructura 3D del sitio de unión, se generan candidatos de secuencia compatibles con el plegamiento deseado y se filtran por puntuación.
- Estabilización de estructuras de ARN terapéutico: dado un backbone de interés, el modelo propone secuencias que preservan la geometría, útil en el desarrollo de vacunas de ARN y terapias basadas en ARN.
- Rediseño de motivos catalíticos (ribozimas): se condiciona el diseño sobre la conformación del centro activo para explorar variantes de secuencia que mantengan la geometría funcional.
- Análisis de plasticidad conformacional: comparando diseños generados con una, dos y tres conformaciones se puede estudiar qué posiciones toleran cambios de estado y cuáles son rígidas.
- Integración en pipelines de diseño computacional: el pipeline por etapas de OFoldX permite encadenar preparación de estructura, inferencia y postprocesado dentro de flujos automatizados de cribado de candidatos.
- Ajuste fino sobre datos propios: mediante `GrnadeLoss` y el `forward` diferenciable se puede reentrenar el modelo sobre un conjunto de estructuras de ARN específico de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,157 M de parámetros en safetensors, el peso del modelo es de unos pocos megabytes, por lo que la VRAM vendrá dominada por las estructuras de grafo de entrada y el tamaño del lote, no por los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente a nivel de memoria; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior) dado el reducido tamaño del modelo, aunque el requisito real dependerá del tamaño de las estructuras procesadas.
- Opciones de despliegue: la librería `ofoldx` (instalable vía pip) con su pipeline `design`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Conformaciones | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 3-state das (este) | 2,157 M | 3 | Solo espacial | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v0.3.2 1-state all | 2,157 M | 1 | Solo espacial | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v0.3.2 5-state das | 2,157 M | 5 | Solo espacial | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v1 | 2,157 M | Múltiple | Secuencia + pares de bases + espacial | AGPL-3.0 | HuggingFace (oteam) |

Las variantes comparten arquitectura y número de parámetros; difieren en el número de conformaciones soportadas y en el tipo de grafo. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo original de gRNAde no escribió esta ficha ni necesariamente respalda esta versión.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado, lo que puede ser un obstáculo para integraciones propietarias.
- El grafo v0.3.2 prescinde de canales de secuencia y de pares de bases, lo que puede reducir la señal disponible frente a la variante v1 en escenarios donde la estructura secundaria sea informativa.
- Las conformaciones de entrada deben corresponder a la misma secuencia de ARN y estar alineadas; no se contemplan entradas desalineadas.
- No se documentan sesgos, tasas de alucinación ni límites de longitud de contexto en la información disponible.
- No se especifican datos de entrenamiento ni métricas de validación, lo que dificulta evaluar su generalización a familias de ARN no representadas en el corpus original.
- El modelo está diseñado exclusivamente para diseño de secuencias de ARN; no debe emplearse como modelo de lenguaje ni para tareas fuera de su dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Repositorio de código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guía del pipeline: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
- Artículo original gRNAde: https://arxiv.org/abs/2305.14749
- Artículo de diseño generativo (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial de gRNAde: https://github.com/chaitjo/geometric-rna-design
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1-state all: https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante 1-state das: https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante 1-state multi: https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante 2-state all: https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante 3-state all: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 3-state multi: https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante 5-state all: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante 5-state das: https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Variante 5-state multi: https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
