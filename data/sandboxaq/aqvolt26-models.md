# SandboxAQ/aqvolt26-models

## Resumen

AQVolt26 es una familia de modelos de machine learning desarrollada por SandboxAQ orientada a química computacional y ciencia de materiales, con especial enfasis en el estudio de baterias y calculos de teoria del funcional de la densidad (DFT). El repositorio, alojado en Hugging Face bajo el identificador `SandboxAQ/aqvolt26-models`, agrupa los pesos de estos modelos y esta vinculado al preprint arXiv:2604.02524. SandboxAQ es una empresa escindida de Alphabet centrada en aplicaciones de inteligencia artificial para sectores cientificos e industriales, y esta publicacion se enmarca en su linea de trabajo sobre simulacion acelerada por IA.

La relevancia del modelo radica en su aplicacion a un dominio de alto coste computacional: la prediccion de propiedades moleculares y de materiales mediante tecnicas de aprendizaje automatico que aproximan o sustituyen calculos DFT, tradicionalmente muy caros. Esto resulta de interes para investigadores que trabajan en diseno de electrolitos, materiales para baterias y cribado de compuestos quimicos.

La informacion publica disponible en la ficha de Hugging Face es limitada: no se detallan arquitectura, numero de parametros, longitud de contexto ni idiomas soportados. El acceso es restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia figura como "other", lo que implica condiciones especificas que deben revisarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (requiere revision de terminos) |
| Formato de pesos | no disponible (repo de 0.2 GB) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura concreta del modelo (transformer, MoE, SSM u otra), ni el volumen o composicion de los datos de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO u otras fases de ajuste. Los tags del repositorio indican el uso de DFT como fuente de datos y el ambito de aplicacion (chemistry, materials-science, computational-chemistry, batteries), lo que sugiere un entrenamiento orientado a predecir propiedades derivadas de calculos DFT, pero no se detallan innovaciones tecnicas especificas.

El unico dato estructural verificable es el tamano del repositorio (0.2 GB), que puede dar una idea aproximada del orden de magnitud de los pesos, aunque no permite inferir el numero de parametros sin conocer el formato y la precision de almacenamiento.

## Capacidades

- Modelado de propiedades quimicas y de materiales en el contexto de calculos DFT.
- Aplicacion declarada al ambito de baterias (tags: batteries).
- Ciencia de materiales y quimica computacional como dominios principales.
- No se documentan en la informacion disponible capacidades de generacion de texto general, codigo, matematicas, vision, audio ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Cribado de electrolitos para baterias: el modelo puede emplearse para estimar propiedades de candidatos moleculares antes de recurrir a calculos DFT completos, reduciendo el coste de explorar grandes espacios quimicos.
- Prediccion de propiedades de materiales: util para priorizar compuestos en pipelines de descubrimiento de materiales, dado el enfoque declarado del repositorio en ciencia de materiales.
- Aceleracion de flujos DFT: como aproximador en etapas de pre-filtrado dentro de campanas de calculo DFT, descartando candidatos poco prometedores antes del calculo de alta fidelidad.
- Investigacion academica en quimica computacional: base para experimentos reproducibles vinculados al preprint arXiv:2604.02524.
- Diseno de materiales para almacenamiento de energia: aplicacion directa al tag "batteries" del repositorio, orientada a la seleccion de componentes.
- Evaluacion comparativa de metodos ML-DFT: como referencia en estudios que comparen aproximaciones de machine learning frente a DFT convencional.

En todos los casos, el acceso restringido implica que el uso en produccion requiere solicitar acceso y revisar los terminos de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de arquitectura y parametros, no documentados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles; el tamano del repositorio (0.2 GB) sugiere que los pesos podrian caber en GPU de consumo, pero no puede confirmarse sin conocer el formato y la arquitectura.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas; al tratarse de un modelo de dominio cientifico, es posible que requiera un stack de inferencia especifico no descrito en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AQVolt26 (SandboxAQ) | no disponible | no disponible | Quimica, materiales, baterias, DFT | other | Gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia "other": deben revisarse los terminos concretos antes de cualquier uso comercial o redistribucion.
- Ausencia de especificaciones publicas: no se documentan arquitectura, parametros, contexto ni formato de pesos, lo que dificulta la planificacion de despliegue.
- Ambito acotado: el modelo esta disenado para quimica y ciencia de materiales; no debe asumirse capacidad general de lenguaje.
- Riesgo de extrapolacion fuera de dominio: al no documentarse la distribucion de entrenamiento, las predicciones fuera del ambito DFT/baterias pueden no ser fiables.
- Riesgo de alucinacion o error numerico: no evaluable sin benchmarks publicados.
- Sin datos sobre sesgos, idiomas o rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SandboxAQ/aqvolt26-models
- Preprint asociado: arXiv:2604.02524 (referenciado en los tags del repositorio)
