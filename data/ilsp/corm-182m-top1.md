# ilsp/CoRM-182M-top1

## Resumen

CoRM-182M-top1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Instituto de Procesamiento del Lenguaje y Sistemas (ILSP/Athena), en el marco de una propuesta de investigacion sobre el encaminamiento de expertos en modelos modulares. El checkpoint se publica como material asociado al articulo "Beyond Magnitude: Contrastive Routing for Modular Mixture-of-Experts". Su principal contribucion es un router que puntua a cada experto mediante una brecha de atencion contrastiva respecto a un estado de referencia EMA dinamico, en lugar de usar la magnitud bruta de las activaciones.

El modelo tiene 777 millones de parametros totales (782.331.660 segun el conteo de los pesos safetensors) y 182 millones de parametros activos por token, con 8 expertos y ruteo Top-1. La arquitectura es un transformer de 12 capas, 768 unidades de hidden size, atencion GQA con 4 cabezas de clave/valor, y una ventana de contexto de 1024 tokens. Se distribuye bajo licencia Apache-2.0 y requiere `trust_remote_code=True` para cargarse desde HuggingFace Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con router contrastivo (CoRM), atencion GQA |
| Parametros totales | 777M segun la model card; 782.331.660 segun los pesos safetensors |
| Parametros activos | 182M (Top-1: 1 experto por token) |
| Longitud de contexto | 1024 tokens (max position embeddings) |
| Tipos de cuantizacion | No documentado (pesos originales en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con codigo personalizado en Python) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer denso con capas MoE. La atencion es de tipo Grouped Query Attention: 12 cabezas de consulta y 4 de clave/valor. El modelo cuenta con 8 expertos, y cada token activa exactamente uno de ellos (routing Top-1), lo que reduce el coste computacional de la capa de expertos frente a un modelo denso de parametros equivalentes. El router, segun el codigo oficial, calcula una puntuacion por experto usando una brecha de atencion contrastiva contra un estado de referencia EMA (media movil exponencial) dinamico, en lugar de puntuar por la magnitud de la activacion.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset ni la aplicacion de tecnicas como RLHF o DPO. La model card deja los campos de entrenamiento y evaluacion como "TODO" pendiente de completar. El modelo usa codigo de modelado personalizado, por lo que su funcionamiento interno depende del codigo de autor incluido en el repositorio de HuggingFace.

## Capacidades

- Generacion de texto autoregresiva, confirmada por el ejemplo de uso con `AutoModelForCausalLM.generate`.
- Ruteo de expertos Top-1 sobre un total de 8 expertos, con solo 182 millones de parametros activos por token.
- Atencion GQA con 4 cabezas de clave/valor, orientada a reducir el coste de memoria de la cache de atencion.
- Carga mediante codigo personalizado de HuggingFace Transformers (`trust_remote_code=True`).
- No se han publicado capacidades de tool calling, function calling, agentes, razonamiento explicito, vision, audio ni multimodalidad.
- No hay informacion sobre idiomas soportados ni calidad multilingue.

## Casos de uso

- Comparacion de metodos de ruteo en MoE: el checkpoint permite reproducir el router contrastivo y compararlo con routers basados en magnitud de activacion. Gracias a su tamaño reducido, las abalaciones son rapidas de ejecutar.

- Analisis de la asignacion de expertos: con 8 expertos y routing Top-1, se puede inspeccionar que tokens activan cada experto, lo que resulta util en estudios sobre especializacion y equilibrio de carga.

- Docencia de arquitecturas MoE: el modelo es suficientemente compacto (12 capas, ~777M totales) para analizar el funcionamiento del router, la GQA y los expertos en un entorno academico.

- Prototipado de sistemas de generacion de baja latencia: al activar solo 182M de parametros por token, la inferencia es barata en GPU modestas o incluso en CPU para pruebas cortas, aunque no se dispone de mediciones de latencia.

- Banco de pruebas para regularizacion de MoE: el codigo abierto permite modificar el estado de referencia EMA y la funcion de puntuacion, lo que hace el modelo util para validar nuevas variantes de routing.

- Experimentos docentes o de divulgacion tecnica: sirve para demonstrar el pipeline de texto generativo con HuggingFace Transformers y resaltar la diferencia entre parametros totales y activos en un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card esta marcada como pendiente ("TODO"). Por tanto, no es posible presentar cifras de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan aproximadamente 1,6 GB (777 millones de parametros multiplicados por 2 bytes).
- Con overhead de activaciones y buffer de generacion, se estima un minimo de 4 GB de VRAM para inferencia basica.
- Una GPU de 8 GB o mas (RTX 3060, RTX 4060, A100, H100) ofrece margen para generar secuencias de mayor longitud o procesar multiples requests.
- El modelo cabe en GPUs de consumo. No requiere una A100 o H100 para ejecutarse.
- Opciones de despliegue documentadas: HuggingFace Transformers con `trust_remote_code=True`. No se ha validado soporte oficial en vLLM, TGI, llama.cpp ni Ollama; esos entornos requeririan adaptar el codigo personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion consultada modelos comparables del mismo tamaño y categoria con datos publicados. Cabe recordar que, segun la model card, se trata de un MoE con 777 millones de parametros totales y 182 millones activos, con un router contrastivo especifico, por lo que no se puede equiparar a un modelo denso de parametros equivalentes sin evaluaciones que lo confirmen.

## Limitaciones y advertencias

- Datos de entrenamiento no documentados: no se conoce el corpus, el numero de tokens ni los idiomas, lo que impide evaluar sesgos y cobertura linguistica.
- Ventana de contexto limitada a 1024 tokens, insuficiente para tareas de contexto largo o conversaciones extensas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del autor durante la carga. En produccion, este codigo debe auditarse.
- Idiomas soportados no especificados, por lo que no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones publicas, no existen evidencias de fiabilidad ni de control factual.
- Licencia Apache-2.0 permite uso comercial y modificaciones, pero obliga a conservar los avisos de licencia y no ofrece garantias.
- Aunque solo 182M parametros estan activos por token, los 777M completos deben cargarse en memoria; no equivale a un modelo denso de 182M en cuanto a huella de memoria.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/ilsp/CoRM-182M-top1](https://huggingface.co/ilsp/CoRM-182M-top1)
- Coleccion CoRM en HuggingFace: [https://huggingface.co/ilsp/CoRM](https://huggingface.co/ilsp/CoRM)
- Codigo oficial en GitHub: [https://github.com/athena-ilsp/CoRM](https://github.com/athena-ilsp/CoRM)
- README del repositorio: [https://github.com/athena-ilsp/CoRM/blob/main/README.md](https://github.com/athena-ilsp/CoRM/blob/main/README.md)
- Paper en arXiv: [https://arxiv.org/abs/2609.01100](https://arxiv.org/abs/2609.01100)
- Instituto ILSP: [https://www.ilsp.gr/en/home-2/](https://www.ilsp.gr/en/home-2/)
