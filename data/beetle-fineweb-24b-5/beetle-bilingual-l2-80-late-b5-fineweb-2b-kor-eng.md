# Beetle-FineWeb-24B-5/beetle-bilingual-l2-80-late-b5-fineweb-2b-kor-eng

## Resumen

El modelo `beetle-bilingual-l2-80-late-b5-fineweb-2b-kor-eng` es un checkpoint de generacion de texto publicado en HuggingFace por la organizacion Beetle-FineWeb-24B-5. Se trata de un modelo de arquitectura propietaria registrada bajo la etiqueta `pico_decoder`, con codigo personalizado (`custom_code`) y pesos en safetensors. El recuento real de parametros segun los tensores publicados en el repositorio es de 193.804.032 parametros (aproximadamente 194 millones), lo que lo situa en la categoria de modelos pequenos, del orden de Pythia-160M o SmolLM2-135M.

El identificador del modelo sugiere que forma parte de una campana de experimentos de preentrenamiento sobre el corpus FineWeb, con una variante bilingue coreano-ingles (`kor-eng`) y una configuracion etiquetada como `l2-80-late-b5` y `2b`, presumiblemente referida al volumen de tokens de entrenamiento. Sin embargo, la model card publicada es la plantilla autogenerada de HuggingFace, sin secciones completadas: no declara autor, datos de entrenamiento, licencia, idiomas ni resultados de evaluacion. Cualquier afirmacion sobre el proceso de entrenamiento basada unicamente en el identificador debe considerarse una hipotesis sin confirmar.

Su relevancia actual es limitada y de caracter fundamentalmente experimental: se trata de un artefacto de investigacion con cero descargas, cero "likes" y sin documentacion tecnica. Resulta de interes para quien estudie dinamicas de entrenamiento, mezclas de datos multilingues sobre FineWeb o implementaciones de decodificadores personalizados, pero no es un modelo apto para uso en produccion tal como se distribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `pico_decoder` (arquitectura personalizada registrada mediante `custom_code`; no se detalla si es transformer, MoE, SSM o hibrida) |
| Parametros totales | 193.804.032 (dato real de los tensores safetensors) |
| Parametros activos | no disponible (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible (no se publica `config.json` ni ficha tecnica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni similar |
| Idiomas soportados | no declarados en la model card; el identificador incluye `kor-eng`, lo que sugiere coreano e ingles, sin confirmar |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`, con `custom_code` y `trust_remote_code` previsiblemente necesario) |

Datos adicionales del repositorio: tamano del repositorio 76,8 GB, 0 descargas, 0 "likes", creado el 2026-10-07 y actualizado el 2026-10-08. La desproporcion entre el tamano del repositorio (76,8 GB) y el numero de parametros (193,8 M, que en fp32 ocuparian unos 0,78 GB) apunta a que el repositorio almacena multiples checkpoints del entrenamiento, estados del optimizador u otros artefactos; no se puede confirmar con la informacion disponible.

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es la etiqueta `pico_decoder` incluida en los tags de HuggingFace y la presencia de `custom_code`, lo que implica que la implementacion del modelo no corresponde a una clase estandar de `transformers` y que el codigo de definicion viaja dentro del repositorio. Esto obliga a cargar el modelo con `trust_remote_code=True`. No se dispone de informacion sobre el numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion, normalizacion, tokenizador ni vocabulario.

Respecto al entrenamiento, la model card no aporta ningun dato: las secciones de datos de entrenamiento, hiperparametros, regimen de precision y computo utilizado estan marcadas como "More Information Needed". El identificador sugiere un preentrenamiento sobre FineWeb con un componente bilingue coreano-ingles y un presupuesto de aproximadamente 2.000 millones de tokens, asi como algun tipo de configuracion por capas (`l2`) y de temporizacion de la tasa de aprendizaje o de la mezcla de datos (`late-b5`), pero ninguna de estas interpretaciones esta documentada por el autor y no deben tomarse como hechos. No hay constancia de fases de ajuste fino con RLHF, DPO o instrucciones.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por el pipeline declarado (`text-generation`) y por la etiqueta de decodificador.
- Modelado de lenguaje causal: al tratarse de un decodificador, es utilizable para calcular perplejidad y para tareas de continuacion de texto.
- Capacidad bilingue coreano-ingles: sugerida por el identificador (`kor-eng`), no confirmada por la model card ni por evaluaciones publicadas.
- Razonamiento, matematicas y generacion de codigo: no disponible; no hay evaluaciones ni indicios de ajuste por instrucciones que respalden estas capacidades.
- Tool calling / function calling: no disponible; no hay plantilla de chat documentada ni formatos de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin ajuste por instrucciones ni modo de pensamiento declarado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" o decodificacion especulativa: no disponible.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento: el checkpoint permite estudiar el comportamiento de una arquitectura `pico_decoder` de ~194 M de parametros en distintas fases del entrenamiento, comparando la evolucion de la perplejidad si el repositorio incluye varios checkpoints intermedios.
- Analisis de mezclas de datos multilingues: si se confirma la naturaleza bilingue coreano-ingles, sirve como punto de partida para medir el efecto de la proporcion de datos en cada idioma sobre la perplejidad en corpus coreanos e ingleses.
- Punto de partida para ajuste fino experimental: al ser un modelo pequeno, se puede ajustar en una unica GPU consumer para probar tecnicas de adaptacion (LoRA, adaptadores, ajuste completo) antes de escalarlas a modelos mayores.
- Investigacion sobre arquitecturas personalizadas: el uso de `custom_code` lo convierte en un caso de estudio para analizar como se registra e integra una arquitectura no estandar en el ecosistema `transformers`.
- Evaluacion de seguridad y sesgo en corpus web: permite estudiar que tipo de contenido y sesgos hereda un modelo entrenado sobre FineWeb, dado que este corpus procede de rastreo web sin curacion editorial.
- Docencia y formacion: adecuado para practicas de carga de modelos con codigo remoto, inspeccion de pesos en safetensors y calculo de metricas de lenguaje, por su tamano manejable.
- Despliegue en entornos con recursos muy limitados: con ~194 M de parametros, la inferencia cabe en CPU y en GPU de gama baja, lo que permitiria prototipos de generacion de texto en dispositivos modestos, siempre que la licencia se aclare.

En ninguno de estos casos se recomienda su uso en produccion con usuarios finales mientras no se publique licencia, evaluacion y documentacion de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin completar y no se han encontrado tablas de resultados (MMLU, HumanEval, GSM8K, perplejidad u otras) ni en el repositorio ni en los resultados de busqueda web, que no contienen referencias al modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,78 GB en fp32, 0,39 GB en fp16/bf16, 0,19 GB en int8 y 0,10 GB en int4. Son estimaciones calculadas a partir de los 193.804.032 parametros declarados, no mediciones publicadas.
- VRAM total para inferencia: hay que sumar a los pesos el cache KV, que depende de la longitud de contexto y del numero de capas (no disponibles). En la practica, cualquier GPU con 2 GB o mas deberia ser suficiente.
- GPU recomendadas: no se especifica ninguna. Por tamano, el modelo es viable en GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100; las GPU de gama alta quedarian ampliamente sobredimensionadas.
- Inferencia en CPU: viable y previsiblemente con latencias aceptables para uso interactivo ligero, dado el tamano reducido.
- Consumer GPU: si, cabe en practicamente cualquier GPU consumer moderna e incluso en placas integradas con memoria compartida suficiente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via directa, al depender de una arquitectura personalizada. La compatibilidad con vLLM, TGI, llama.cpp, Ollama u otros motores no esta confirmada y, en el caso de llama.cpp/Ollama, requeriria conversion manual a GGUF porque no se publican pesos en ese formato. No se ha verificado que el codigo personalizado implemente kernels optimizados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara parametros, contexto y licencia con alternativas de tamano comparable. Los datos de los modelos de referencia son informacion publica de sus respectivas fichas y no proceden de una evaluacion conjunta; no existe ninguna comparacion de rendimiento publicada para el modelo Beetle.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| beetle-bilingual-l2-80-late-b5-fineweb-2b-kor-eng | 193,8 M | no disponible | no disponible | HuggingFace, requiere `custom_code` |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Pythia-160M | 160 M | 2.048 tokens | Apache-2.0 | HuggingFace, con checkpoints de entrenamiento |
| GPT-2 (124M) | 124 M | 1.024 tokens | licencia MIT modificada | HuggingFace y multiples formatos |

Diferencias cualitativas: frente a estas alternativas, el modelo Beetle destaca por su caracter bilingue coreano-ingles declarado en el identificador, pero carece de licencia explicita, de contexto documentado y de cualquier evaluacion publicada, ademas de requerir ejecucion de codigo remoto. Los tres modelos de referencia son arquitecturas estandar, con peso en GGUF y soporte nativo en los principales motores de inferencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada de HuggingFace, sin datos de autor, financiacion, datos de entrenamiento, hiperparametros ni evaluacion.
- Licencia no disponible: sin licencia explicita no se puede determinar si el uso comercial esta permitido. En la practica, debe tratarse como no apto para produccion hasta que el autor la especifique.
- Riesgo de seguridad por `custom_code`: cargar el modelo implica ejecutar codigo Python incluido en el repositorio. Se recomienda auditar los ficheros del modelo antes de usar `trust_remote_code=True` y hacerlo en un entorno aislado.
- Sesgos esperables: si el entrenamiento se realizo sobre FineWeb, heredara los sesgos, la sobrerrepresentacion del ingles y el ruido del contenido rastreado en la web. No hay ninguna evaluacion de sesgo publicada que lo confirme o cuantifique.
- Riesgo de alucinacion: elevado, como corresponde a un modelo de ~194 M de parametros sin ajuste por instrucciones; no se debe confiar en la veracidad factual de sus salidas.
- Cobertura idiomatica incierta: el soporte de coreano e ingles es una inferencia a partir del nombre del repositorio. No hay evaluacion por idioma y es probable un rendimiento muy desigual entre ambos.
- Contexto desconocido: al no publicarse `config.json` ni documentacion, se desconoce la ventana de contexto real y no se pueden dimensionar correctamente el cache KV ni las tareas de contexto largo.
- Artefacto de investigacion sin traccion: 0 descargas y 0 "likes" implican ausencia de validacion por parte de la comunidad; no existen informes independientes de calidad.
- Incompatibilidad potencial con el ecosistema: al no ser una arquitectura estandar, es probable que no funcione con vLLM, TGI, llama.cpp u Ollama sin trabajo adicional de portabilidad.
- Discrepancia de tamano en el repositorio: 76,8 GB de repositorio frente a 193,8 M de parametros indica que contiene material adicional (probablemente checkpoints u otros ficheros) que conviene revisar antes de descargar.
- Fechas de publicacion inusuales: el modelo figura como creado en octubre de 2026, dato que puede deberse a un error de metadatos o de configuracion del reloj del sistema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Beetle-FineWeb-24B-5/beetle-bilingual-l2-80-late-b5-fineweb-2b-kor-eng
- Paper referenciado en los tags (`arxiv:1910.09700`): https://arxiv.org/abs/1910.09700 (corresponde a Lacoste et al., 2019, sobre estimacion de emisiones de carbono en aprendizaje automatico; aparece en la plantilla autogenerada de la model card y no describe este modelo)
- Calculadora de impacto medioambiental enlazada en la plantilla: https://mlco2.github.io/impact
- Corpus FineWeb (referencia presumible del entrenamiento, no confirmada por el autor): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo en los resultados de busqueda web disponibles.
