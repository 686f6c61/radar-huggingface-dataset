# DAPS-Math/DAPS-selector

## Resumen

DAPS Selector es un modelo especializado en seleccion de premisas (premise selection) para demostracion automatica de teoremas en Lean, desarrollado por el equipo DAPS-Math. No es un modelo generativo de proposito general, sino un componente de un pipeline mayor orientado a entornos Mathlib: dado un objetivo de demostracion, el selector identifica las premisas relevantes del corpus de lemas para que un demostrador automatico las utilice. El checkpoint publicado corresponde a la fase 2 de entrenamiento sobre Mathlib.

El modelo se distribuye como un unico fichero de pesos PyTorch (`daps_selector.pt`) dentro de un repositorio de aproximadamente 0,1 GB, lo que sugiere un tamano de parametros contenido y orientado a eficiencia en inferencia. La model card lo describe como "graph-aware", es decir, que incorpora informacion de la estructura de dependencias entre lemas, y se enmarca en el proyecto Dependency-Aware Premise Selection (DAPS).

Su relevancia actual radica en que la seleccion de premisas es un cuello de botella critico en la demostracion formal asistida por IA: reducir el espacio de busqueda a los lemas relevantes mejora tanto la tasa de exito como el coste computacional de los demostradores. La informacion publica disponible es muy limitada en cuanto a arquitectura, datos de entrenamiento y metricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como "graph-aware premise selector") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`daps_selector.pt`) |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de un selector de premisas "graph-aware" resultante de la fase 2 de entrenamiento sobre Mathlib. El termino graph-aware sugiere que el modelo explota el grafo de dependencias entre lemas de Mathlib, pero no se detalla si la arquitectura es un transformer, una red sobre grafos (GNN) o un hibrido, ni el numero de parametros, capas o dimensiones ocultas.

Tampoco se especifican el volumen de datos de entrenamiento, la composicion del dataset, el regimen de entrenamiento (supervisado, contrastivo, RLHF/DPO) ni innovaciones tecnicas concretas. Toda esta informacion deberia consultarse en la pagina del proyecto DAPS enlazada desde la model card.

## Capacidades

- Seleccion de premisas para objetivos de demostracion en Lean sobre Mathlib.
- Modelado de dependencias entre lemas mediante representacion "graph-aware".
- Integracion como componente de un pipeline de demostracion automatica de teoremas (no genera texto ni demostraciones por si mismo).
- No se documentan capacidades de generacion de texto, codigo general, matematicas en lenguaje natural, vision, audio, tool calling ni razonamiento multi-paso autonomo.
- Soporte multilingue: no disponible.

## Casos de uso

- Demostracion automatica de teoremas en Lean: el selector reduce el conjunto de premisas candidatas de Mathlib para un objetivo dado, acotando el espacio de busqueda de demostradores como tactic-based provers y aumentando la probabilidad de exito.
- Integracion en pipelines de investigacion en formalizacion matematica: sirve como etapa previa a un demostrador para priorizar lemas relevantes segun el grafo de dependencias.
- Recuperacion de lemas para asistentes de prueba interactivos: puede sugerir al usuario las premisas mas probables al abordar un objetivo en un editor Lean.
- Evaluacion comparativa de metodos de premise selection: al estar publicado con licencia Apache 2.0, permite reproducir y comparar frente a otras estrategias de seleccion.
- Entrenamiento de demostradores con curriculum: las premisas seleccionadas pueden usarse para construir conjuntos de entrenamiento mas compactos y relevantes.
- Experimentacion academica sobre el impacto del contexto estructural (grafo de dependencias) en la seleccion de premisas, dado el caracter "graph-aware" del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno que probablemente cabe en GPU de consumo, pero no hay confirmacion oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del checkpoint es plausible, pero no se documenta.
- Opciones de despliegue: al ser un checkpoint PyTorch (`daps_selector.pt`), la inferencia se realiza cargando los pesos con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, tamano, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Especifico de Lean y Mathlib: no es un modelo de proposito general y no debe esperarse que realice tareas fuera de la seleccion de premisas.
- Sesgos: no documentados; al entrenarse sobre Mathlib hereda las caracteristicas y posibles sesgos de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero puede seleccionar premisas irrelevantes o incorrectas para un objetivo, degradando el rendimiento del demostrador.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- Estado del checkpoint: corresponde a la fase 2 de entrenamiento; no se indica si es la version final ni su rendimiento frente a fases posteriores.

## Enlaces

- HuggingFace: https://huggingface.co/DAPS-Math/DAPS-selector
- Pagina del proyecto DAPS: https://relational-conjecturing.github.io/Dependency-Aware-Premise-Selection/
