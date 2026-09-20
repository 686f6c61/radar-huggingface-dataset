# arthu1/wind-arc-1-5-preview-safetensors

## Resumen

Wind Arc 1.5 Preview — SafeTensors es una conversion de formato del checkpoint `North-ML1/wind-arc-1-5-preview`, publicada por el usuario `arthu1` en HuggingFace. Se trata de un transformer decoder-only de 173.249.280 parametros (173,25 M) con 24 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 3 cabezas KV (atencion con consultas agrupadas, GQA), dimension FFN de 2.048, vocabulario de 32.000 tokens y una longitud de contexto de tan solo 512 tokens.

El aporte de este repositorio es exclusivamente de formato: convierte el fichero original `windarc15.pt` a `model.safetensors` con 218 tensores, verificando que cada tensor recargado coincide bit a bit con el origen. No modifica el comportamiento del modelo ni anade pesos nuevos. La licencia es MIT, heredada del repositorio fuente.

Su relevancia practica es limitada pero concreta: la model card original lo describe como una version preliminar de investigacion con rendimiento debil en benchmarks, y este repositorio no reclama compatibilidad con `AutoModel` de Transformers porque el checkpoint usa nombres de parametros personalizados y no existe una implementacion publicada. Es, por tanto, un artefacto util para estudiar arquitecturas con GQA y para probar herramientas de conversion de pesos, no un modelo listo para produccion. El repositorio acumula 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal-lm) con GQA |
| Parametros totales | 173.249.280 (173,25 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (218 tensores) |
| Capas | 24 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 (3 cabezas KV, GQA) |
| Dimension FFN | 2.048 |
| Vocabulario | 32.000 tokens |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de 24 capas con 768 dimensiones ocultas. Cada capa combina atencion multi-cabeza con 12 cabezas de consulta y 3 cabezas de clave/valor, lo que supone una ratio de agrupacion 4:1 y reduce el coste de la cache KV a aproximadamente una cuarta parte respecto a una atencion multi-cabeza completa. La dimension por cabeza es de 64 (768 / 12) y la capa feed-forward tiene 2.048 dimensiones. El vocabulario es de 32.000 tokens y el contexto maximo de 512 tokens, un valor muy reducido en comparacion con los modelos actuales.

No hay informacion disponible sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni sobre si se aplico ajuste por instrucciones, RLHF o DPO. La model card fuente solo indica que se trata de una version preliminar de investigacion. La innovacion tecnica del repositorio es de ingenieria de formato: la conversion a safetensors preserva la configuracion original en `config.json` y en los metadatos del fichero, y la validacion bit a bit de los 218 tensores sirve como referencia para pipelines de conversion de pesos.

## Capacidades

- Generacion de texto causal (causal-lm): es la unica capacidad declarada explicitamente por las etiquetas del repositorio.
- Modelo base, no ajustado por instrucciones: no hay evidencia de fine-tuning conversacional, por lo que cabe esperar un comportamiento de continuacion de texto en lugar de dialogo.
- Capacidad de razonamiento, codigo o matematicas: no disponible (sin benchmarks ni evaluaciones publicadas).
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Carga directa con `AutoModel` de Transformers: no soportada segun la propia model card, dado que el checkpoint usa nombres de parametros personalizados y no existe implementacion publicada de la arquitectura.

## Casos de uso

- Investigacion sobre atencion con consultas agrupadas (GQA): la relacion 12:3 de cabezas de consulta frente a cabezas KV permite estudiar el impacto de distintas ratios de agrupacion en la calidad y en el consumo de memoria de la cache KV.
- Pruebas de pipelines de conversion de pesos: el repositorio documenta una verificacion bit a bit de 218 tensores entre `.pt` y `.safetensors`, lo que lo convierte en un caso de prueba util para validar herramientas de conversion propias.
- Desarrollo y depuracion de loaders personalizados: al no existir implementacion en Transformers, el modelo sirve para probar codigo de carga propio que lea `config.json` y mapee nombres de parametros no estandar.
- Inferencia en CPU y dispositivos de bajos recursos: con 173,25 M de parametros ocupa aproximadamente 0,35 GB en fp16 y 0,69 GB en fp32, por lo que puede ejecutarse en portatiles, placas SBC o entornos sin GPU para experimentos de latencia.
- Docencia y divulgacion: es un ejemplo completo y de tamano manejable de transformer decoder-only con configuracion conocida (24 capas, GQA, vocabulario de 32k) para explicar el funcionamiento interno de estos modelos.
- Generacion de texto corto en prototipos cerrados: completado de plantillas, etiquetado simple o generacion de fragmentos de hasta 512 tokens, siempre con expectativas de calidad bajas dado el aviso del autor sobre el rendimiento debil.
- Experimentos de ajuste ligero (LoRA o adaptadores) sobre checkpoints pequenos: el tamano reducido permite iterar en una unica GPU consumer. Requiere implementar la arquitectura de forma manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original califica el rendimiento del modelo como debil, pero no aporta cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 173,25 M de parametros): ~0,69 GB en fp32, ~0,35 GB en fp16/bf16, ~0,17 GB en int8 y ~0,09 GB en int4. Son estimaciones aritmeticas de pesos, sin overhead de runtime.
- Cache KV: a 64 dimensiones por cabeza, 3 cabezas KV, 24 capas y fp16, cada token ocupa unos 18 KB, es decir, unos 9,4 MB con los 512 tokens de contexto completo. El coste de cache es despreciable.
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM es suficiente (por ejemplo, GTX 1650, GTX 1050 Ti, iGPU modernas). Una RTX 4090, A100 o H100 estan completamente sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y tambien en CPU en solitario.
- Opciones de despliegue: no hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que no existen pesos GGUF ni una implementacion de la arquitectura en Transformers. El despliegue requeriria un cargador de PyTorch personalizado que interprete los nombres de parametros del checkpoint original.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones). Como referencia aritmetica, el coste computacional ronda los 0,35 GFLOP por token en inferencia (2 x 173,25 M de parametros), lo que situa al modelo en el rango de velocidades de un modelo de 170 M de parametros denso en el hardware que se utilice.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas estructurales, ya que Wind Arc 1.5 Preview no publica resultados de benchmarks que permitan contrastar calidad. Los datos de los modelos alternativos corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Soporte en Transformers | Notas |
|---|---|---|---|---|---|
| Wind Arc 1.5 Preview (safetensors) | 173,25 M | 512 | MIT | No (nombres de parametros personalizados, sin implementacion publicada) | Version preliminar con rendimiento debil segun el autor |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 | Si | Suite de investigacion con checkpoints intermedios publicados |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Si | Entrenado sobre un corpus multilingue amplio, con variantes instruct |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Si | Mayor tamano y contexto, con variantes base e instruct |

La diferencia clave no es el numero de parametros, similar en tres de los cuatro casos, sino la ausencia de implementacion en Transformers, la ventana de contexto de solo 512 tokens y la falta de evaluaciones publicadas.

## Limitaciones y advertencias

- Rendimiento debil reconocido por el autor: la model card original describe el modelo como una version preliminar de investigacion con resultados pobres en benchmarks, sin aportar cifras.
- Contexto muy limitado: 512 tokens restringen drasticamente cualquier tarea de dialogo multi-turno, resumen de documentos o razonamiento con contexto largo.
- Sin implementacion en Transformers: no se puede cargar con `AutoModel`; requiere codigo propio que mapee los nombres de parametros personalizados del checkpoint original.
- Sin ajuste por instrucciones documentado: es un modelo base, por lo que no cabe esperar que siga instrucciones ni que mantenga un formato conversacional.
- Idiomas soportados desconocidos: no se declara ninguna lista de idiomas, lo que impide planificar un uso multilingue.
- Riesgo de alucinacion elevado: al tratarse de un modelo pequeno y con rendimiento debil, la generacion de contenido factual incorrecto es esperable, especialmente sin datos de evaluacion que permitan acotar el riesgo.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluacion independiente publicada.
- Advertencia sobre los metadatos: las fechas de creacion y actualizacion del repositorio (20 de septiembre de 2026) son posteriores a la fecha habitual de publicacion, lo que conviene verificar antes de referenciar el artefacto.
- Licencia: MIT permite uso comercial y modificacion, pero el software y los pesos se ofrecen sin garantia alguna; la responsabilidad del uso recae en quien lo despliega.

## Enlaces

- Repositorio de la conversion a safetensors: https://huggingface.co/arthu1/wind-arc-1-5-preview-safetensors
- Repositorio original del modelo: https://huggingface.co/North-ML1/wind-arc-1-5-preview
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo. Los resultados devueltos por el buscador no guardan relacion con Wind Arc 1.5 Preview.
