# gridfm/genco-pf-contingency

## Resumen

gridfm/genco-pf-contingency es un repositorio de artefactos publicado por la organización gridfm en Hugging Face. No se trata de un modelo de lenguaje, sino del conjunto de pesos, configuraciones de entrenamiento y resultados de evaluación de un solver neuronal para análisis de contingencias de flujo de potencia sobre la red eléctrica de Texas de 2000 buses. El artefacto está asociado a las secciones 5.5.1 y 5.5.2 del trabajo GENCO, un solver neuronal unificado para análisis de red en estado estacionario desarrollado en el marco del GridFM Development Framework.

El problema que aborda es el análisis de contingencias N-1 a N-20 (fallo de uno a veinte elementos de la red) sobre una topología de 2000 buses, una tarea clásica de operación de sistemas eléctricos que tradicionalmente requiere ejecutar repetidamente un solver numérico de flujo de potencia para cada escenario. El repositorio incluye tanto el checkpoint de pesos (`model/training_bs_16/`) como los datos crudos en formato parquet y las predicciones de evaluación, lo que permite reproducir los resultados del paper.

La relevancia de GENCO, según la documentación del proyecto y el blog de IBM Research, radica en unificar tres cómputos de red habitualmente separados (flujo de potencia, PF; flujo de potencia óptimo, OPF; y estimación de estado, SE) en un único modelo con representación compartida. El tamaño del repositorio es de 218,6 GB, mayoritariamente datos parquet de las rejillas de entrenamiento y prueba. No se han publicado en la información disponible los detalles de arquitectura, número de parámetros ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el framework de entrenamiento se denomina gridfm-graphkit) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre topologías de red de hasta 2000 buses) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`best_model_state_dict.pt`) junto con `normalizer_stats.pt` |
| Tamaño del repositorio | 218,6 GB |
| Autor / organización | gridfm |
| Fecha de creación (según metadatos) | 2026-09-25 |
| Fecha de actualización (según metadatos) | 2026-09-25 |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El framework de entrenamiento se denomina gridfm-graphkit, lo que sugiere un enfoque basado en grafos, coherente con la naturaleza topológica de una red eléctrica, pero no se especifica el tipo exacto de capa, el número de parámetros ni el esquema de atención o paso de mensajes. El paper asociado (arXiv 2608.09921) presenta GENCO como un solver neuronal unificado embebido en un framework de desarrollo, con generación de datos sintéticos y entrenamiento en entorno low-code.

Respecto al entrenamiento, la model card indica que el checkpoint del paper corresponde al directorio `model/training_bs_16/`, y que dicha ejecución registró un batch size de 8 sobre 2 GPU. Los parámetros completos del entrenamiento quedan en `mlflow/train/training_bs_16/`. La organización del repositorio separa los datos crudos por split en `data/<split>/Texas2k_case1_2016summerpeak/raw/`, sin directorio `processed/`. La sección 5.5.2 reconstruye `data/light/` a partir de las predicciones N-2 más las tablas de buses y ramas del caso N-2, lo que apunta a un flujo de trabajo iterativo de contingencias.

El repositorio almacena evaluaciones para los niveles de contingencia N-1 a N-20 en `mlflow/eval/test_<k>/`, con dos ficheros por nivel: `predictions.parquet` y `dc_bus_residuals.parquet`. No se indica el número de tokens ni la composición del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO, extremos que no resultan aplicables a este dominio.

## Capacidades

- Resolución de flujo de potencia (PF) sobre una red de 2000 buses en el caso de estudio de Texas.
- Análisis de contingencias N-1 a N-20, con artefactos de predicción y residuales por bus en corriente continua (DC) para cada nivel.
- Generación de predicciones en formato parquet por nivel de contingencia y split de prueba.
- Reconstrucción de escenarios ligeros a partir de predicciones N-2, según el procedimiento descrito para la sección 5.5.2.
- Participación en un solver unificado, según el material del proyecto GENCO, capaz de cubrir PF, OPF y SE con una representación compartida (esta capacidad corresponde a GENCO como sistema, no necesariamente al artefacto concreto de contingencias de este repositorio).
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no aplica.

## Casos de uso

- Análisis de contingencias en planificación de red: el modelo permite estimar el estado de la red ante el fallo de uno a veinte elementos (N-1 a N-20) sobre la topología de Texas de 2000 buses, sustituyendo la ejecución repetida de un solver numérico por una inferencia neuronal.
- Evaluación rápida de seguridad operativa: a partir de las predicciones y residuales por bus en `mlflow/eval/test_<k>/`, un operador puede comparar el estado estimado frente a los resultados de referencia y priorizar contingencias críticas.
- Reproducción de resultados de investigación: el repositorio empaqueta los datos crudos, los parámetros de entrenamiento y las predicciones, lo que permite reproducir las secciones 5.5.1 y 5.5.2 del paper GENCO de principio a fin.
- Benchmarking de solvers neuronales: al incluir topologías y escenarios concretos, sirve como referencia para comparar otros solvers neuronales frente a GENCO en la misma red y los mismos niveles de contingencia.
- Entrenamiento y ajuste fino de nuevos solvers: la librería gridfm-graphkit permite entrenar, ajustar e interactuar con modelos fundacionales para la red eléctrica, partiendo de este checkpoint como base.
- Generación de datos sintéticos de red: el ecosistema gridfm-datakit, complementario a este repositorio, permite generar conjuntos de datos PF/OPF realistas; el paper reporta 4 millones de instancias PF/OPF en 8 topologías publicadas en Hugging Face.
- Integración en pipelines de estudio de estabilidad: las predicciones por contingencia pueden alimentar análisis posteriores (por ejemplo, verificación de límites de tensión o flujo en ramas) dentro de un flujo de trabajo automatizado de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene artefactos de evaluación (`predictions.parquet` y `dc_bus_residuals.parquet` para N-1 a N-20), pero no se incluyen en la información proporcionada las métricas numéricas asociadas (error de flujo, residual máximo, error respecto a un solver de referencia, etc.).

| Nivel de contingencia | Métrica | Valor |
|---|---|---|
| N-1 a N-20 | error de predicción | no disponible (solo se confirma la existencia de ficheros de predicciones y residuales) |
| PF Texas 2000 buses | comparación con solver de referencia | no disponible |

## Requisitos de hardware

- El repositorio ocupa 218,6 GB, mayoritariamente datos parquet de entrenamiento y prueba, no pesos del modelo. El espacio en disco para clonar o descargar el repositorio completo debe dimensionarse en consecuencia.
- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros del checkpoint).
- GPU recomendadas: no disponible. La única referencia de hardware en la información es que el entrenamiento registró un batch size de 8 sobre 2 GPU, sin especificar el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema indicado es gridfm-graphkit (entrenamiento, ajuste fino e interacción con el modelo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo / enfoque | Tareas cubiertas | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|
| GENCO (este repositorio, artefacto de contingencias Texas 2000 buses) | PF sobre la topología indicada; el sistema GENCO cubre PF, OPF y SE de forma unificada | Apache 2.0 | Hugging Face y GitHub (gridfm) | no disponible |
| Solvers numéricos tradicionales de flujo de potencia (Newton-Raphson, flujo DC) | una tarea específica por solver y pipeline (según el blog de IBM Research) | varía según implementación | herramientas establecidas del sector | no disponible |
| Otros solvers neuronales del ecosistema GridFM | no disponible | no disponible | Hugging Face (datasets asociados) | no disponible |

No se dispone de cifras de rendimiento comparadas en la información proporcionada, por lo que la comparación se limita a cobertura funcional y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documentan sesgos en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de lenguaje, pero existe riesgo de error de predicción física; el repositorio incluye ficheros de residuales (`dc_bus_residuals.parquet`) precisamente para cuantificar la desviación respecto a la referencia.
- Limitaciones de dominio: el artefacto está entrenado y evaluado específicamente sobre el caso `Texas2k_case1_2016summerpeak` (red de 2000 buses, escenario de pico de verano de 2016). Su traslado a otras topologías o escenarios estacionales requiere validación adicional.
- Limitación de contexto: no es un modelo de lenguaje ni admite prompts; opera sobre representaciones de red. No tiene ventana de contexto en el sentido habitual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los artefactos y datos derivados (scripts, configs y datasets del ecosistema gridfm) antes de un despliegue en producción.
- Caveat de reproducibilidad: la model card advierte de que no existe directorio `processed/` y que los datos crudos residen en `data/<split>/.../raw/`; la reconstrucción de escenarios ligeros depende de las predicciones N-2 y de las tablas de buses y ramas del caso N-2.
- Caveat de hardware: aunque el entrenamiento se registró con batch size 8 en 2 GPU, no se especifica el modelo de GPU ni la VRAM necesaria para inferencia, por lo que cualquier planificación de despliegue requiere medir el consumo real.
- Uso en producción: tratándose de un artefacto de investigación vinculado a un paper y a un repositorio de reproducción, debe validarse exhaustivamente antes de emplearlo en decisiones operativas reales sobre la red.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gridfm/genco-pf-contingency
- Paper GENCO (arXiv, resumen): https://arxiv.org/abs/2608.09921
- Paper GENCO (arXiv, HTML): https://arxiv.org/html/2608.09921
- Blog de IBM Research sobre GENCO: https://research.ibm.com/blog/gridfm-neural-solver-power-grid
- Página del proyecto GridFM (Harvard, Union, IBM): https://gridfm.org/gridfm-harvard-union-ibm/
- Repositorio gridfm-graphkit: https://github.com/gridfm/gridfm-graphkit
- Scripts y configuraciones de contingencia (rama genco-paper-repro): https://github.com/gridfm/gridfm-graphkit/tree/genco-paper-repro/scripts/contingency
- Guía de reproducción GENCO §5.5.1: https://github.com/albanpuech/GENCO/blob/main/repro_instructions/5.5.1_PF_on_texas_contingency.md
