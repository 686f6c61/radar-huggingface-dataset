# DireDreadlord/Chaturanga-Mini

## Resumen

Chaturanga Mini es un modelo de lenguaje pequeno (SLM) de unos 51,8 millones de parametros, desarrollado por el usuario DireDreadlord y especializado en la generacion de jugadas de ajedrez en lenguaje natural mediante notacion algebraica estandar (SAN). Se trata de un ajuste fino del modelo base SupraLabs/Supra-50M-Base, de arquitectura Llama, entrenado sobre aproximadamente 400.000 filas del dataset mlabonne/chessllm. Su proposito es doble: por un lado, servir como modelo experimental de ajedrez capaz de producir jugadas mayoritariamente legales; por otro, demostrar que es posible obtener un comportamiento funcional en una tarea estructurada con un presupuesto de computo minimo (se entreno durante 7.000 pasos en una unica RTX 3050 de 4 GB de VRAM).

El modelo forma parte de una familia mas amplia de variantes de ajedrez (Nano, Neo, Mini, Pro y Ultra) que cubren el rango de 25M a 100M de parametros. Chaturanga Mini ocupa el puesto intermedio: al duplicar el tamano respecto a la variante Nano, gana coherencia en la generacion de jugadas sin incrementar de forma apreciable los tiempos de inferencia.

Es relevante en el contexto actual de modelos pequenos para dominios cerrados, donde el interes no esta en el rendimiento generalista sino en la eficiencia: un modelo de ~52M de parametros puede ejecutarse en CPU o en GPUs de portatil, con un peso en disco en torno a 0,2 GB, lo que lo hace apto para experimentacion local, demos interactivas y pruebas de concepto de agentes que juegan al ajedrez. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso, decoder-only) |
| Parametros totales | 51.786.240 (~51,8M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | SupraLabs/Supra-50M-Base |
| Dataset de ajuste | mlabonne/chessllm (~400.000 filas) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama, en su variante densa de unos 52M de parametros, heredada directamente del modelo base Supra-50M-Base de SupraLabs. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, capas MoE o hibridaciones SSM) en la informacion disponible. El ajuste se realizo sobre el checkpoint base, sin que la model card detalle si hubo fases de RLHF, DPO u otro tipo de alineacion posterior.

El entrenamiento consistio en un ajuste fino supervisado sobre aproximadamente 400.000 filas del dataset chessllm, con los ejemplos formateados en notacion algebraica estandar (SAN). Se ejecuto durante 7.000 pasos sobre una unica GPU RTX 3050 con 4 GB de VRAM, lo que sitúa el coste de entrenamiento en un rango muy bajo y explica tanto la ligereza del artefacto final como sus limitaciones de precision en jugadas complejas. La model card no especifica el numero total de tokens vistos ni la composicion exacta del dataset mas alla de la fuente y el numero de filas.

## Capacidades

- Generacion de jugadas de ajedrez en notacion algebraica estandar (SAN) a partir de una posicion o un historial descrito en lenguaje natural.
- Generacion de texto condicionada por contexto conversacional de partida, con formato de respuesta orientado a jugadas.
- Produccion de jugadas mayoritariamente legales, aunque la propia model card advierte de que pueden aparecer jugadas ilegales.
- Integracion con interfaz grafica de ajedrez: el autor incluye el archivo `chaturanga_gui.py` en el repositorio para probar el modelo como oponente.
- Compatibilidad declarada con `text-generation-inference` segun las etiquetas del repositorio (tag `text-generation-inference`).
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card. No se documenta soporte de otros idiomas.
- Capacidades especiales: no se documentan modos de razonamiento extendido (thinking mode), vision, audio, tool calling ni function calling. No hay evidencia de soporte para agentes multi-paso en la informacion disponible.

## Casos de uso

- Oponente de ajedrez en aplicaciones locales: el modelo genera jugadas en SAN a partir del estado de la partida, y con ~52M de parametros puede ejecutarse en CPU o en una GPU de portatil, lo que permite integrarlo en un cliente de escritorio sin dependencia de servicios en la nube.
- Demos educativas de ajedrez: dado su tamano reducido y su licencia Apache 2.0, es adecuado para tutoriales y material docente donde se quiera mostrar un modelo que responde en notacion algebraica estandar.
- Prototipos de analisis de partidas: se puede usar para generar candidatos de jugada sobre posiciones dadas y filtrarlos despues con un motor clasico (Stockfish) o con una validacion de legalidad, aprovechando el modelo como generador de hipotesis y no como arbitro.
- Investigacion sobre SLM en dominios cerrados: sirve como caso de estudio de ajuste fino de un modelo de ~52M de parametros en una tarea estructurada, util para medir cuanto comportamiento util se puede extraer con un presupuesto de 4 GB de VRAM.
- Evaluacion de pipelines de generacion de notacion SAN: util para probar parsers, validadores de jugadas y formateadores, ya que el modelo emite texto en un formato muy acotado.
- Base para ajustes finos posteriores: al ser un finetune de Supra-50M-Base con licencia permisiva, se puede reentrenar con datasets de aperturas, finales o estilos de juego concretos.
- Pruebas de despliegue ligero: escenario de referencia para validar stacks de inferencia (transformers, text-generation-inference) con requisitos de memoria muy bajos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ajedrez (por ejemplo, tasa de jugadas legales, precision de jugada frente a motor de referencia o Elo estimado).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,1 GB en FP16 y unos 0,2 GB en FP32 para los pesos; el repositorio completo ocupa 0,2 GB. Las estimaciones de cuantizacion a int8 (~0,05 GB) o int4 (~0,03 GB) son calculos sobre el numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. El propio autor entreno el modelo en una RTX 3050 de 4 GB, lo que da una referencia directa del orden de magnitud necesario.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas y en CPU. No requiere aceleradores de datacenter (A100, H100) para inferencia.
- Opciones de despliegue: transformers es la via directa al publicarse pesos en safetensors; la etiqueta `text-generation-inference` sugiere compatibilidad con TGI. No se publican pesos GGUF, por lo que el uso con llama.cpp u Ollama requeriria una conversion previa no documentada por el autor.
- Latencia y throughput estimados: no disponibles de forma numerica. La model card afirma que la variante Mini mantiene tiempos de inferencia similares a la Nano pese a duplicar parametros, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaturanga Mini | ~51,8M | no disponible | Ajedrez (SAN, ingles) | apache-2.0 | HuggingFace (repo de 0,2 GB) |
| Chaturanga Nano | ~25M | no disponible | Ajedrez (SAN, ingles) | no disponible en la informacion | Misma familia, segun la model card |
| Chaturanga Neo (Nano+) | no disponible | no disponible | Ajedrez (SAN, ingles) | no disponible en la informacion | Misma familia, segun la model card |
| Supra-50M-Base | ~50M | no disponible | Modelo base de proposito general | no disponible en la informacion | HuggingFace (SupraLabs) |

La model card menciona ademas las variantes Pro y Ultra (Pro+) dentro de la familia Chaturanga, pero no aporta parametros, contexto ni licencia para ellas. No se dispone de datos de benchmarks ni de Elo que permitan comparar el rendimiento relativo entre estas variantes o frente a modelos de ajedrez de otros autores.

## Limitaciones y advertencias

- Con solo 50M de parametros, la model card advierte explicitamente de que pueden producirse alucinaciones y jugadas ilegales.
- El modelo esta etiquetado como de uso experimental; el autor recomienda emplearlo con esa expectativa.
- Soporte idiomatico limitado al ingles segun el campo `language`; no hay evidencia de funcionamiento fiable en castellano u otros idiomas.
- No se documenta la longitud de contexto, por lo que no se puede garantizar el manejo de partidas largas o historiales extensos sin degradacion.
- No se publican tipos de cuantizacion ni pesos GGUF, lo que limita las opciones de despliegue ligero listas para usar.
- No se documentan sesgos especificos, evaluaciones de seguridad ni estudios de robustez; al entrenarse sobre un unico dataset de ajedrez, su comportamiento fuera de ese dominio es incierto.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia, pero no exime al usuario de validar la legalidad de las jugadas generadas en produccion.
- Las fechas de creacion y actualizacion del repositorio (octubre de 2026) resultan anomalas respecto a la fecha actual; conviene verificar el estado del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DireDreadlord/Chaturanga-Mini
- Modelo base: https://huggingface.co/SupraLabs/Supra-50M-Base
- Coleccion Supra: https://huggingface.co/collections/SupraLabs/supra2
- Dataset de ajuste: https://huggingface.co/datasets/mlabonne/chessllm
- Interfaz grafica incluida en el repositorio: `chaturanga_gui.py` (archivo dentro del propio repositorio de HuggingFace)
