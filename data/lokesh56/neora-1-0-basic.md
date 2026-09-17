# Lokesh56/Neora-1.0-Basic

## Resumen

Neora 1.0 Basic es un modelo de lenguaje de tipo transformer causal de diseno propio ("custom causal attention transformer") publicado por el usuario Lokesh56 en HuggingFace. Con aproximadamente 502,6 millones de parametros (unos 505M contando embeddings), 24 capas, 20 cabezas de atencion, dimension oculta de 1280 y una ventana de contexto de 2048 tokens, se situa en el segmento de modelos pequenos, comparable en escala a la familia GPT-2 large o a Pythia-410M.

El modelo se presenta explicitamente como un checkpoint de verificacion y desarrollo correspondiente al paso 20 de entrenamiento, con pesos no convergidos y comportamiento exploratorio. Esto significa que no es un modelo listo para produccion ni para evaluacion de calidad: su interes es fundamentalmente como artefacto tecnico para inspeccionar el diseno de una arquitectura personalizada (vocabulario de 24.000 tokens, FFN de 5120, atencion causal implementada en codigo propio) y para validar pipelines de carga con codigo remoto.

Su relevancia actual es limitada y hay que enmarcarla con honestidad: cero descargas y cero "likes" en el momento de la consulta, ausencia total de resultados de benchmarks y una model card minima que no documenta el corpus de entrenamiento, el numero de tokens vistos ni las tecnicas de alineamiento. Es, en la practica, un experimento abierto mas que un modelo evaluable frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion personalizada (custom causal attention transformer) |
| Parametros totales | ~502.640.640 (~505M incluyendo embeddings) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni se documenta soporte para GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (requiere `trust_remote_code=True`; no se especifica si son safetensors, bin de PyTorch u otro) |

Datos adicionales declarados en la model card: 24 capas, 20 cabezas de atencion, D_MODEL = 1280, FFN_DIM = 5120, vocabulario de 24.000 tokens. La dimension por cabeza resultante es de 64 (1280 / 20).

## Arquitectura y entrenamiento

La unica informacion disponible describe una arquitectura transformer causal con atencion implementada en codigo propio (`custom_code`), 24 capas estructurales, 20 cabezas de atencion, dimension oculta de 1280 y una capa feed-forward de 5120, con un vocabulario de 24.000 entradas. No se especifica si emplea atencion multi-cabeza clasica o variantes con grouped-query attention, ni si incorpora normalizacion pre-LN o post-LN, activaciones SwiGLU/GeGLU o embeddings posicionales aprendidos frente a RoPE. Tampoco se detalla ningun mecanismo de atencion lineal, decodificacion especulativa ni otra innovacion tecnica.

En cuanto al entrenamiento, la model card indica unicamente que el modelo fue preentrenado sobre "recursos linguisticos generales" en ingles, sin especificar el numero de tokens, la composicion del dataset, la mezcla de dominios ni si hubo fases de ajuste fino con RLHF, DPO o instrucciones. El checkpoint publicado corresponde al paso 20 ("step 20") y el propio autor advierte que las salidas no estan convergidas y son exploratorias, lo que sugiere un entrenamiento truncado muy al principio del proceso.

## Capacidades

Debido al estado de desarrollo del checkpoint y a la ausencia de evaluaciones publicadas, las capacidades deben considerarse teoricas o no verificadas:

- Generacion de texto autoregresiva en ingles, con ventana de contexto de 2048 tokens.
- Modelado de lenguaje general: al tratarse de un modelo preentrenado y no ajustado por instrucciones, la continuacion de texto es el unico modo de uso previsible.
- No hay evidencia ni declaracion de soporte de tool calling o function calling.
- No hay evidencia ni declaracion de soporte para agentes, razonamiento multi-paso o planificacion.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Capacidades especiales (modo "thinking", vision, audio, matemáticas avanzadas, generacion de codigo): no disponibles.
- El modelo expone una arquitectura con codigo remoto, por lo que su integracion en `transformers` requiere ejecutar codigo del autor del repositorio.

## Casos de uso

Dado que se trata de un checkpoint no convergido y sin benchmarks, los casos de uso realistas son de caracter tecnico o experimental, no de producto:

- Investigacion de arquitecturas personalizadas: sirve como referencia para estudiar una implementacion propia de atencion causal con 24 capas y d_model 1280, comparando decisiones de diseno (20 cabezas de 64 dimensiones, FFN de 5120) con arquitecturas equivalentes de dominio publico.
- Pruebas de infraestructura de carga de modelos: util para validar pipelines que necesitan `trust_remote_code=True`, verificando que el entorno de `transformers` resuelve correctamente el codigo remoto antes de desplegar modelos mayores con el mismo patron.
- Benchmarking de latencia en modelos de ~500M: permite medir tiempos de prellenado y decodificacion en GPUs de gama baja o en CPU, ya que el modelo cabe holgadamente en memoria y aislado de otras variables.
- Generacion de texto exploratoria en ingles: con 2048 tokens de contexto puede producir continuaciones de parrafos o fragmentos cortos, siempre asumiendo calidad baja y coherencia limitada por el estado del entrenamiento.
- Docencia y divulgacion: como ejemplo tangible de un transformer pequeno con vocabulario reducido (24.000 tokens) para explicar el impacto de las decisiones de tokenizacion y dimensionado.
- Base para experimentos de ajuste fino: al ser un modelo pequeno con licencia MIT, es viable reentrenarlo o ajustarlo en un unico GPU en tareas de juguete (clasificacion de texto, generacion de plantillas) sin restricciones de licencia comercial.
- Reproduccion de entrenamientos desde cero: la configuracion declarada permite replicar un modelo de escala similar para experimentos controlados de escalado o de curricula de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a articulos sobre indices bursatiles chinos y son irrelevantes para esta ficha). Tampoco existen metricas de perplejidad ni curvas de perdida publicadas.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano declarado (~505M parametros, 24 capas, 20 cabezas, contexto 2048). Al no publicarse ficheros cuantizados, se asume inferencia en precision nativa:

- VRAM en fp32: aproximadamente 2,0 GB solo para pesos, mas activaciones.
- VRAM en fp16/bf16: aproximadamente 1,0 GB para pesos. La cache KV (asumiendo atencion multi-cabeza clasica, cabeza de 64 dimensiones) ronda los 120 KB por token, es decir unos 245 MB para los 2048 tokens de contexto completo, lo que deja el total en torno a 1,3-1,5 GB.
- Inferencia en CPU: perfectamente viable en fp32 con 4-8 GB de RAM, con velocidades bajas pero utilizables para pruebas.
- GPU consumer: cabe sin problemas en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Es un modelo apto para equipos de gama de entrada.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para un modelo de esta escala; se usarian solo por necesidades de concurrencia, no de memoria.
- Opciones de despliegue: al requerir `trust_remote_code=True` y no existir pesos GGUF publicados, las opciones directas son `transformers` en PyTorch, y potencialmente vLLM o TGI si el codigo remoto es compatible (no verificado). llama.cpp y Ollama requeririan una conversion previa a GGUF que no se ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de informacion publica ampliamente conocida de sus respectivos repositorios y no han podido verificarse con la informacion proporcionada en esta busqueda; se ofrecen como referencia orientativa de categoria.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Neora 1.0 Basic | ~505M | 2048 | en | MIT | Checkpoint de desarrollo (paso 20), sin benchmarks |
| GPT-2 large | 774M | 1024 | en | Licencia MIT modificada | Modelo consolidado, ampliamente evaluado |
| Pythia-410M | 410M | 2048 | en | Apache 2.0 | Suite de investigacion con checkpoints intermedios y evaluaciones publicas |
| Qwen2.5-0.5B | ~494M | 32768 | multilingue (29+ idiomas) | Apache 2.0 | Modelo reciente con benchmarks publicados y soporte de cuantizacion |
| TinyLlama-1.1B | 1,1B | 2048 | en | Apache 2.0 | Entrenado sobre ~3 billones de tokens, con evaluaciones publicadas |

La diferencia clave de Neora 1.0 Basic frente a estas alternativas no es arquitectonica sino de madurez: contexto mas corto que Qwen2.5-0.5B, un unico idioma, sin pesos cuantizados y sin ninguna evaluacion publicada.

## Limitaciones y advertencias

- Estado de entrenamiento no convergido: el autor indica explicitamente que es un checkpoint de verificacion correspondiente al paso 20, con salidas "exploratorias". La calidad del texto generado sera previsiblemente muy baja.
- Ausencia total de benchmarks: no hay ninguna metrica publicada, por lo que no es posible estimar su rendimiento relativo.
- Riesgo elevado de alucinacion y de incoherencia: un modelo preentrenado sin alineamiento y con entrenamiento truncado no tiene mecanismos de calibracion ni de seguimiento de instrucciones.
- Sesgos: no se documenta la composicion del corpus, por lo que no se puede auditar el sesgo de genero, raza, religion u orientacion politica. Al entrenarse solo con "recursos linguisticos generales" en ingles, es probable que herede sesgos de fuentes web sin filtrar.
- Limitaciones de contexto: 2048 tokens es insuficiente para casos de uso que requieran documentos largos, historiales de conversacion extensos o analisis de repositorios de codigo.
- Limitaciones de idioma: solo ingles. No hay evidencia de capacidad en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, pero se aplica al artefacto publicado y no cubre posibles reclamaciones sobre los datos de entrenamiento, que no se documentan.
- Riesgo de seguridad en el codigo: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor del repositorio. En entornos de produccion esto debe tratarse como una dependencia no confiable y revisarse antes de desplegar.
- Idoneidad para produccion: nula en su estado actual. No debe usarse en aplicaciones de cara al usuario, atencion al cliente ni cualquier flujo donde la coherencia o la veracidad sean requisitos.
- Ausencia de trazabilidad: no se publican el numero de tokens de entrenamiento, la composicion del dataset ni el hardware utilizado, lo que impide reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lokesh56/Neora-1.0-Basic
- Paper: no disponible
- Repositorio de codigo: no disponible (el modelo incluye codigo remoto dentro del propio repositorio de HuggingFace)
- Blog o documentacion adicional: no disponible
- Demo: no disponible
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo; los enlaces obtenidos corresponden a articulos sobre indices bursatiles chinos y no guardan relacion con Neora 1.0 Basic.
