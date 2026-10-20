# Efe2898/caba-v0-core-50m-g4-scratch-20261019

## Resumen

ÇABA v0-core 50M es un modelo de lenguaje en fase muy temprana de desarrollo, publicado por el usuario Efe2898 en HuggingFace bajo el identificador `caba-v0-core-50m-g4-scratch-20261019`. Segun la propia model card, se trata de un entrenamiento "from scratch" (sin partir de pesos preentrenados) de aproximadamente 50 millones de parametros, ejecutado en un entorno tipo Colab y que en el momento de la publicacion estaba todavia en curso. El repositorio no contiene pesos entrenados ni pesos de inicializacion: el autor indica explicitamente que las ponderaciones de inicializacion aleatoria no se publican y que el modelo entrenado y un checkpoint de reanudacion se subiran tras un paso completado y una parada segura.

El problema que aborda es, por tanto, el de un experimento de investigacion sobre entrenamiento de modelos pequenos desde cero, con codigo de modelo, tokenizer, auditoria de dataset y codigo de entrenamiento disponibles. No hay informacion publica sobre arquitectura, composicion del corpus, numero de tokens vistos, idiomas o licencia. Con 0 descargas y 0 likes, y sin pesos utilizables, el artefacto no es hoy desplegable ni evaluable.

Su relevancia actual es limitada y de caracter documental: sirve como referencia de un pipeline de entrenamiento reproducible de un modelo de 50M, no como una alternativa usable frente a modelos pequenos ya publicados. Cualquier evaluacion de capacidades, rendimiento o calidad queda bloqueada hasta que el autor publique los pesos y los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni SSM) |
| Parametros totales | ~50M (segun nombre del repositorio y model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos publicados; al ser un modelo de ~50M seria viable en fp32, fp16/bf16, int8 e int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card indica que los pesos entrenados y un checkpoint de reanudacion se subiran mas adelante |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de la etiqueta "core" y del sufijo "scratch", que indica entrenamiento desde cero sin inicializacion a partir de otro modelo. No se especifica si se trata de un transformer decoder-only, un modelo hibrido o una arquitectura propia, ni se detallan mecanismos de atencion, tokenizer concreto, tamano de vocabulario o funcion de perdida. El sufijo "g4" del nombre del repositorio no se explica en la documentacion disponible.

Sobre los datos de entrenamiento solo consta la existencia de una "auditoria de dataset" y de codigo de entrenamiento en el repositorio, sin cifras de tokens, composicion del corpus, proporciones por idioma ni si hubo etapas de RLHF, DPO o ajuste supervisado. No hay informacion sobre el estado del entrenamiento (pasos completados, perdida alcanzada) ni sobre la fecha prevista de publicacion de los pesos.

## Capacidades

- No hay capacidades verificadas: el repositorio no contiene pesos entrenados con los que ejecutar inferencia.
- Generacion de texto: no evaluable con la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponible; no se mencionan.
- Lo unico disponible tecnicamente son el codigo del modelo, el tokenizer, la auditoria de dataset y el codigo de entrenamiento, utiles para reproducir el pipeline, no para consumir el modelo.

## Casos de uso

Los siguientes escenarios son hipoteticos y quedan condicionados a la publicacion de pesos entrenados y de una licencia clara. Se plantean para un modelo de ~50M de parametros, que por tamano encaja en tareas acotadas y de baja latencia.

- Experimentacion academica con entrenamiento desde cero: usar el codigo y el tokenizer publicados para reproducir el pipeline completo en un entorno Colab, comparando curvas de perdida con otras inicializaciones y configuraciones de dataset.
- Clasificacion y etiquetado de texto ligero: con un modelo de este tamano es viable un ajuste fino para tareas de una sola etiqueta (categoria de ticket, sentimiento, deteccion de spam) con coste de inferencia minimo en CPU.
- Autocompletado o correccion muy acotada en local: integrado en un editor o formulario, un modelo de ~50M puede generar sugerencias cortas con latencia baja en hardware sin GPU, siempre que la calidad se valide antes.
- Filtrado previo en pipelines de datos: usar el modelo como primer nivel de cribado (deteccion de duplicados aproximados, normalizacion de campos) antes de llamar a un modelo mayor, reduciendo coste por peticion.
- Prototipado educativo de LLM: servir el modelo con llama.cpp u Ollama para demostrar el ciclo completo de tokenizacion, inferencia y decodificacion en un aula o taller, sin depender de infraestructura externa.
- Base para investigación de tecnicas de compresion: al ser un modelo diminuto, es un banco de pruebas adecuado para medir cuantizacion int8/int4, poda o destilacion con curvas de calidad faciles de reproducir.
- Generacion de texto muy restringida en dispositivos empotrados: con pesos en int4 y menos de 1 GB de memoria, encaja en escenarios de plantillas y respuestas guiadas donde no se requiere conocimiento factual amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K, perplejidad) y los pesos entrenados no estan publicados, por lo que tampoco es posible generarlas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~50M de parametros, no verificada por el autor): ~200 MB en fp32, ~100 MB en fp16/bf16, ~50 MB en int8 y ~25-30 MB en int4, sin contar cache KV ni activaciones.
- En la practica, con cache KV y overhead del runtime, el modelo completo deberia caber holgadamente en menos de 1 GB de memoria, aunque la longitud de contexto es desconocida y determina el tamano de la cache.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090 o una A100 estarian sobredimensionadas. Es viable en GTX 1650, RTX 3060, T4 de Colab o incluso en iGPU con memoria compartida.
- Inferencia en CPU: plenamente viable, incluyendo equipos de bajo consumo y placas tipo Raspberry Pi, siempre que exista un runtime compatible con el formato de pesos final.
- Opciones de despliegue: transformers, llama.cpp, Ollama o TGI una vez existan pesos en un formato soportado; vLLM seria tecnicamente posible pero innecesario para este tamano.
- Latencia y throughput: no disponible. No hay mediciones publicadas y no pueden estimarse con rigor sin conocer arquitectura, tokenizer y contexto.

## Comparativa con modelos similares

La comparacion es estructural, no de rendimiento: no existen metricas publicadas para ÇABA v0-core 50M y sus pesos no estan disponibles, por lo que no puede evaluarse frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Rendimiento |
|---|---|---|---|---|---|
| ÇABA v0-core 50M | ~50M | no disponible | no disponible | No (solo codigo y tokenizer) | no disponible |
| GPT-2 small | 124M | 1024 tokens | MIT | Si | Referencia historica ampliamente evaluada |
| distilgpt2 | 82M | 1024 tokens | Apache-2.0 | Si | Referencia de modelo destilado pequeno |
| SmolLM2-135M | 135M | 8192 tokens | Apache-2.0 | Si | Benchmark publicado por el autor |
| Qwen2.5-0.5B | 494M | 32768 tokens | Apache-2.0 | Si | Benchmark publicado por el autor |

Para un uso real en la franja de 50-150M de parametros, las alternativas con pesos y licencia disponibles son hoy la unica opcion practica; ÇABA v0-core no es comparable hasta que publique pesos y resultados.

## Limitaciones y advertencias

- Ausencia total de pesos: no se puede ejecutar inferencia. El autor solo publica codigo, tokenizer, auditoria de dataset y codigo de entrenamiento.
- Entrenamiento incompleto: la model card describe el estado como "training in progress" y los pesos se subiran "tras un paso completado y una parada segura", sin fecha comprometida.
- Licencia no especificada: sin licencia explicita no hay permiso claro para uso comercial, redistribucion ni obras derivadas; en la practica, el modelo no es adoptable en produccion.
- Idiomas no declarados: se desconoce si el tokenizer y el corpus cubren castellano u otros idiomas, y en que calidad.
- Sin datos de entrenamiento: no hay cifras de tokens, composicion del corpus ni proceso de alineacion (RLHF/DPO/SFT), lo que impide anticipar sesgos, calidad o riesgo de alucinacion. Aun asi, por tamano, es esperable una tasa alta de alucinacion y conocimiento factual muy limitado.
- Sin benchmarks ni evaluaciones de terceros: cualquier afirmacion sobre capacidades seria especulativa.
- Riesgo de sesgo: al no documentarse el dataset, no puede auditarse la presencia de sesgos de genero, raza, idioma o dominio.
- Trazabilidad escasa: el repositorio no enlaza paper, blog ni repositorio de codigo independiente, y el significado de etiquetas como "core" o "g4" no se explica.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo y no aportan informacion tecnica utilizable.

## Enlaces

- HuggingFace: https://huggingface.co/Efe2898/caba-v0-core-50m-g4-scratch-20261019
- Paper: no disponible
- Blog o documentacion adicional: no disponible
- Repositorio de codigo: no disponible como enlace independiente (la model card indica que el codigo esta en el propio repositorio)
- Demo: no disponible
- Resultados de busqueda web: sin resultados relevantes para este modelo
