# rehanparacha/medgemma-4b-it-sft-lora-crc100k

## Resumen

medgemma-4b-it-sft-lora-crc100k es un ajuste fino (fine-tuning) supervisado del modelo médico google/medgemma-4b-it, publicado por el usuario rehanparacha en HuggingFace. El nombre del repositorio sugiere que el entrenamiento se ha realizado con un conjunto de datos denominado "crc100k", presumiblemente orientado a cáncer colorrectal y con del orden de 100.000 ejemplos, aunque la model card no documenta ni el dataset ni la tarea concreta. Se trata, por tanto, de un derivado de un modelo base de aproximadamente 4.000 millones de parámetros, ajustado con la librería TRL mediante SFT (supervised fine-tuning).

La relevancia de esta ficha es limitada pero informativa: el modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, no incluye resultados de benchmarks, no declara licencia efectiva (el campo aparece como el literal `license`, sin identificador) y no especifica idiomas soportados. Es un ejemplo típico de artefacto de investigación publicado de forma mínima: útil como referencia de un pipeline de ajuste con TRL sobre MedGemma, pero sin la documentación necesaria para evaluarlo en producción.

El repositorio ocupa 2,8 GB y contiene pesos en formato safetensors etiquetados como compatibles con `transformers` y con endpoints de inferencia. No se especifica si los pesos publicados son los adaptadores LoRA originales, una fusión de estos con el modelo base, o una conversión a menor precisión; este dato es crítico para reproducir el entrenamiento y no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivada de google/medgemma-4b-it) |
| Parametros totales | aproximadamente 4.000 millones, segun el nombre del modelo base (no confirmado explicitamente en la model card) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el literal `licence: license`, sin identificador de licencia) |
| Formato de pesos | safetensors (etiqueta del repositorio), cargable con transformers |
| Modelo base | google/medgemma-4b-it |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Framework declarados | TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1 |
| Tamano del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Fecha de ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un ajuste fino del modelo google/medgemma-4b-it realizado mediante SFT con la libreria TRL, tal como declara la propia model card y confirman las etiquetas `generated_from_trainer`, `sft` y `trl`. El nombre del repositorio incluye el sufijo `lora`, lo que sugiere que el ajuste se realizo con adaptadores de bajo rango (LoRA) en lugar de un reentrenamiento completo, pero la model card no describe la configuracion del adaptador (rango, alpha, modulos objetivo), ni la estrategia de precision, ni el numero de pasos, epocas o tasa de aprendizaje.

No hay ninguna informacion sobre el dataset de entrenamiento: no se documenta su composicion, su tamano real, su procedencia, si incluye imagenes o solo texto, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El identificador `crc100k` sugiere un corpus de aproximadamente 100.000 ejemplos relacionados con cancer colorrectal, pero esto es una inferencia a partir del nombre y no un dato confirmado. Tampoco se indica si los pesos publicados son los adaptadores en crudo o una fusion con el modelo base.

Como innovacion tecnica no se documenta ninguna: no hay menciones a decodificacion especulativa, atencion lineal, destilacion ni a ninguna modificacion estructural. El unico elemento tecnico reseñable es la traza de versiones del framework, que corresponde a un stack muy reciente (Transformers 5.17.0, PyTorch 2.11.0), lo que puede complicar la reproducibilidad con entornos mas antiguos.

## Capacidades

- Generacion de texto condicionada por instrucciones (el unico uso demostrado en la model card es un ejemplo con `transformers.pipeline("text-generation")`).
- Ajuste orientado al dominio medico, inferido del modelo base y del nombre `crc100k`; la model card no enumera capacidades clinicas concretas ni tareas soportadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas aparece como "no disponible".
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no documentadas en el repositorio. El modelo base google/medgemma-4b-it puede tener caracteristicas propias, pero no se trasladan automaticamente ni estan confirmadas en este ajuste.
- Compatibilidad declarada con endpoints de inferencia mediante la etiqueta `endpoints_compatible`.

Nota: el ejemplo de uso incluido en la model card plantea una pregunta generica sobre viajes en el tiempo, no una consulta medica, lo que refuerza que el autor no documento la finalidad real del ajuste.

## Casos de uso

Los siguientes escenarios son propuestas de aplicacion derivadas del nombre del modelo y de su modelo base; ninguno esta validado por el autor ni respaldado por evaluaciones publicadas. Cualquier uso clinico requeriria validacion independiente, revision por expertos y cumplimiento normativo.

- Resumen de informes clinicos en oncologia colorrectal: el modelo podria emplearse para condensar notas de historia clinica, informes de anatomia patologica o informes quirurgicos en un resumen estructurado, aprovechando el ajuste sobre el dominio. Requiere verificacion humana obligatoria por el riesgo de omisiones.
- Extraccion de entidades clinicas en texto libre: identificacion de estadio TNM, localizacion tumoral, marcadores (CEA, MSI, KRAS) y regimenes de quimioterapia a partir de notas narrativas, como paso previo a un pipeline de estructuración de datos.
- Apoyo a la codificacion diagnostica: sugerencia de codigos CIE-10/CIE-O a partir de descripciones textuales de tumores colorrectales, siempre con supervision de codificadores medicos.
- Generacion de borradores de respuestas para preguntas frecuentes de pacientes: respuesta a dudas generales sobre cribado, colonoscopia o seguimiento postoperatorio, con un filtro de seguridad y derivacion al clinico ante cualquier decision terapeutica.
- Anonimizacion asistida y preprocesado de corpus clinicos: uso del modelo para reescribir o resumir textos eliminando identificadores directos antes de incorporarlos a un dataset de investigacion, combinado con herramientas deterministas de deteccion de PHI.
- Investigacion academica sobre ajuste de modelos medicos: servir como punto de comparacion de un pipeline SFT con TRL sobre MedGemma 4B, midiendo el efecto del ajuste frente al modelo base en tareas de dominio.
- Prototipado de asistentes de triaje no diagnostico: clasificacion preliminar de consultas por urgencia percibida en un entorno controlado, nunca como sustituto del juicio clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni MedQA, ni HumanEval, ni evaluaciones especificas de oncologia), y la busqueda web asociada no aporta resultados relevantes sobre este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (~4.000 millones de parametros) y no estan confirmadas por el autor:

- VRAM estimada en bf16/fp16: en torno a 9-10 GB solo para pesos, con 12-16 GB recomendados contando activaciones y cache KV para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB de pesos, con 8-10 GB de VRAM total recomendados.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB de pesos, con 6-8 GB de VRAM total recomendados.
- GPU consumer: un modelo de 4B en 4 bits cabe con holgura en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y en 8-12 GB (RTX 3060 12 GB, RTX 4070) con margen para contextos moderados. En bf16 requiere al menos 12-16 GB, por lo que encaja en RTX 4080/4090 o RTX 3090/4090.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y A10G son sobredimensionadas para inferencia de un solo ejemplar, pero adecuadas para servir varias replicas o lotes grandes.
- Opciones de despliegue: `transformers` con PyTorch (unico camino confirmado por la model card). vLLM, TGI u Ollama no estan documentados para este repositorio; llama.cpp/Ollama requeririan una conversion a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

Caveat importante: el repositorio ocupa 2,8 GB, un tamano inferior al esperado para pesos de 4B en bf16 (~8 GB), lo que sugiere que podria contener solo adaptadores LoRA o pesos en menor precision. Si el repositorio contiene unicamente adaptadores, sera necesario descargar tambien el modelo base completo para poder ejecutarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| rehanparacha/medgemma-4b-it-sft-lora-crc100k | ~4B (heredado del base) | no disponible | no disponible | HuggingFace, 0 descargas | no publicados |
| google/medgemma-4b-it (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (referenciado como base) | no disponible en esta ficha |
| Otros ajustes finos medicos de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificada sobre alternativas comparables dentro de la documentacion y la busqueda proporcionadas, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o licencia frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salidas clinicas en la model card.
- Licencia indeterminada: el campo de licencia no contiene un identificador valido, lo que impide conocer si se permite uso comercial. Ademas, al derivar de google/medgemma-4b-it, se heredan las condiciones de uso del modelo base, que deben consultarse por separado.
- Riesgo de alucinacion elevado en dominio medico: cualquier salida clinica puede contener afirmaciones plausibles pero falsas; se requiere verificacion humana y no debe usarse para diagnostico ni decision terapeutica.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste ni su representatividad demografica, geografica o linguistica.
- Idiomas no declarados: se desconoce si el ajuste conserva capacidades multilingues del modelo base o si ha degradado a un unico idioma.
- Documentacion de entrenamiento incompleta: no se especifican hiperparametros, numero de tokens, epocas ni configuracion LoRA, lo que impide reproducir el ajuste.
- Ambiguedad en los artefactos publicados: el tamano del repositorio no permite determinar con certeza si contiene pesos fusionados, adaptadores o una version cuantizada; esto afecta directamente al despliegue.
- Compatibilidad de stack: las versiones declaradas (Transformers 5.17.0, PyTorch 2.11.0) son muy recientes y pueden no estar disponibles o no ser estables en entornos de produccion actuales.
- Ejemplo de uso inadecuado: la model card propone una pregunta generica de divagacion, no una tarea medica, lo que no ayuda a validar el proposito del ajuste.
- Sin senal de adopcion: 0 descargas y 0 likes implican que el modelo no ha sido probado por terceros y no existe retroalimentacion externa sobre su comportamiento.
- Cambios en el modelo base: al ser un derivado, cualquier actualizacion o retirada del repositorio google/medgemma-4b-it puede afectar a la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rehanparacha/medgemma-4b-it-sft-lora-crc100k
- Modelo base (google/medgemma-4b-it): https://huggingface.co/google/medgemma-4b-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Nota sobre la busqueda web: los resultados proporcionados (documentacion sobre la sentencia `switch` de Java en W3Schools, GeeksforGeeks, Baeldung, JavaSpring y Oracle) no guardan relacion con este modelo y no se incluyen como fuentes.
