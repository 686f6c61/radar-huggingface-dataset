# guan-wang/EBFM-ClimbMix-1B

## Resumen

EBFM-ClimbMix-1B es un modelo de lenguaje basado en energia (energy-based language model, EBFM) de 1.028.275.456 parametros, desarrollado por guan-wang en el marco del proyecto OpenEBFM. Se distribuye como un checkpoint de preentrenamiento exportado a formato compatible con Hugging Face Transformers, con una arquitectura personalizada denominada "d26" y un tokenizador propio serializado. El modelo se presenta bajo la etiqueta de pipeline `fill-mask`, lo que lo situa en la familia de modelos enmascarados mas que en la de generacion autorregresiva pura.

El modelo resuelve el problema de explorar alternativas a los transformers autorregresivos convencionales mediante un enfoque de modelado basado en energia, descrito en el informe tecnico "OpenESM: Energy-Steered Models Are Scalable Foundation Learners" (arXiv:2610.33005). Con 26 bloques transformer, dimension de embedding de 1664 y 13 cabezas de atencion, el modelo se entrena sobre el dataset ClimbMix en una unica etapa de preentrenamiento.

Su relevancia actual radica en que ofrece una implementacion abierta (licencia MIT) de una arquitectura no convencional para investigadores que quieran experimentar con modelos basados en energia a escala 1B. No obstante, se trata de un checkpoint de preentrenamiento sin ajuste fino posterior, con contexto limitado a 2048 tokens y sin datos publicados de benchmarks ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenEBFM personalizada (variante d26), energy-based language model |
| Parametros totales | 1.028.275.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

Datos adicionales de configuracion: 26 bloques transformer, dimension de embedding 1664, 13 cabezas de atencion, vocabulario de 32768 tokens y tamano del repo de 4.1 GB.

## Arquitectura y entrenamiento

La arquitectura es una implementacion personalizada de OpenEBFM (variante d26), un modelo de lenguaje basado en energia. Segun los metadatos del checkpoint, consta de 26 bloques transformer con dimension de embedding de 1664 y 13 cabezas de atencion, con un vocabulario de 32768 tokens y una longitud de contexto de 2048 tokens. El modelo se carga mediante codigo remoto (`modeling_ebfm.py` y `configuration_ebfm.py`) y un tokenizador serializado (`tokenizer.pkl`), lo que implica que no es un transformer estandar de la libreria y requiere `trust_remote_code=True`.

El entrenamiento se realizo en una unica etapa de preentrenamiento sobre el dataset ClimbMix. No se proporcionan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se detallan innovaciones tecnicas especificas mas alla de la propia formulacion basada en energia descrita en el informe tecnico asociado (arXiv:2610.33005). El checkpoint incluye una tabla de bytes de tokens (`token_bytes.pt`) utilizada por las metricas de OpenEBFM.

## Capacidades

- Modelado de lenguaje enmascarado (pipeline `fill-mask`): el modelo se carga con `AutoModelForMaskedLM` y devuelve logits para prediccion de tokens enmascarados.
- Modelado de lenguaje basado en energia: la formulacion subyacente puntua secuencias mediante una funcion de energia en lugar de una probabilidad autorregresiva convencional.
- Prediccion de tokens enmascarados sobre secuencias de hasta 2048 tokens.
- No se documentan capacidades de generacion autorregresiva, tool calling, function calling, razonamiento multi-paso ni comportamiento de agente.
- No se documentan capacidades multilingues especificas ni idiomas soportados.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Al ser un checkpoint de preentrenamiento sin ajuste fino, no se garantiza el seguimiento de instrucciones ni el formato conversacional.

## Casos de uso

- Investigacion en modelado basado en energia: el modelo sirve como referencia abierta para estudiar la formulacion EBFM a escala 1B, comparando su comportamiento con transformers autorregresivos de tamano similar en tareas de puntuacion de secuencias.
- Reproduccion de experimentos academicos: al estar asociado al informe tecnico arXiv:2610.33005 y al repositorio OpenEBFM, permite reproducir y extender los resultados del articulo con los pesos publicados.
- Prediccion de tokens enmascarados en corpus cientificos o tecnicos: el pipeline `fill-mask` permite completar huecos en texto para tareas de analisis lexico o de evaluacion de representaciones, siempre que el texto se mantenga dentro de los 2048 tokens de contexto.
- Evaluacion de representaciones internas: los 26 bloques y la dimension 1664 permiten extraer estados ocultos para experimentos de probing o de analisis de caracteristicas en un modelo no convencional.
- Prototipado de metricas de energia: la tabla `token_bytes.pt` y la implementacion de OpenEBFM permiten calcular metricas de perplejidad o energia sobre textos de prueba en entornos de investigacion.
- Base para ajuste fino experimental: al ser un checkpoint de preentrenamiento con licencia MIT, puede servir como punto de partida para experimentos de ajuste supervisado o adaptacion a dominios concretos en laboratorios de investigacion.
- Docencia y formacion: util como ejemplo practico de arquitectura alternativa a los transformers estandar en cursos de aprendizaje profundo, gracias a su tamano manejable (1B) y a su codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 4,1 GB solo para los pesos, mas memoria para activaciones y estados intermedios; en la practica se recomienda al menos 8-12 GB de VRAM para secuencias de 2048 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 2,1 GB para los pesos, mas activaciones; viable en GPUs consumer con 8 GB o mas.
- No se han publicado cuantizaciones GGUF ni versiones cuantizadas oficiales; el repo solo contiene `model.safetensors`.
- GPUs recomendadas: para investigacion y lotes grandes, A100 o H100; para pruebas en consumer, RTX 3090, RTX 4090 o GPUs con 12 GB o mas.
- Cabe en GPU consumer: si, en fp16/bf16 en tarjetas con 8-12 GB de VRAM, siempre que se ajuste el tamano de lote y la longitud de secuencia.
- Opciones de despliegue: al requerir codigo remoto personalizado (`trust_remote_code=True`), no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; el soporte documentado es via `transformers` con `AutoModelForMaskedLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, se puede contrastar con transformers estandar de ~1B parametros, pero no se dispone de sus resultados en las mismas condiciones de evaluacion.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-ClimbMix-1B | 1.028.275.456 | 2048 | OpenEBFM (energy-based) | MIT | Hugging Face |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento: no ha pasado por ajuste por instrucciones ni por RLHF/DPO, por lo que no debe esperarse un comportamiento conversacional ni seguimiento de instrucciones fiable.
- No se documentan los idiomas soportados; el rendimiento fuera del ingles (si el dataset ClimbMix es predominantemente ingles, cosa no confirmada) es incierto.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Requiere `trust_remote_code=True` y ejecucion de codigo Python remoto (`modeling_ebfm.py`, `configuration_ebfm.py`), lo que implica riesgos de seguridad y de reproducibilidad en entornos de produccion.
- El tokenizador se distribuye como `tokenizer.pkl` serializado, lo que anade dependencia de `tiktoken` y de la implementacion concreta del autor.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de robustez; al ser un modelo de preentrenamiento, el riesgo de generar contenido incorrecto o sesgado es alto.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks y de ajuste fino hace desaconsejable su uso directo en produccion sin evaluacion previa.
- La etiqueta `fill-mask` y la formulacion basada en energia implican que el modelo no esta disenado para generacion autorregresiva de texto largo; su uso principal es de investigacion.
- El numero de descargas (69) y de likes (1) es muy bajo, lo que sugiere escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-ClimbMix-1B
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe tecnico (paper): https://huggingface.co/papers/2610.33005
- arXiv del articulo: arXiv:2610.33005
