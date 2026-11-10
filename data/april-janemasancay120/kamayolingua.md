# april-janemasancay120/kamayolingua

## Resumen

KamayoLingua es un adaptador LoRA experimental para traducción automática que toma como base el modelo multilingüe facebook/nllb-200-distilled-600M y lo ajusta para tareas de traducción que involucran el kamayo, una lengua filipina de bajos recursos, junto con inglés, filipino y bisaya. Lo desarrolla el proyecto KamayoLingua, cuyo objetivo es construir un sitio web de traducción y un sistema de aprendizaje del idioma kamayo. El adaptador se publica bajo la librería PEFT y el repositorio tiene un tamaño de 0.0 GB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo base de 600M de parámetros.

La relevancia del modelo es doble. Por un lado, aborda un caso típico de lengua de bajos recursos: el tokenizador de NLLB no dispone de un token nativo verificado para kamayo, y el proyecto usó `hil_Latn` como ranura, que según la propia model card mapea al token desconocido del tokenizador. Por otro lado, la model card documenta explícitamente que la configuración de tokens de idioma debe corregirse y que el proceso de entrenamiento debe verificarse antes de considerar el adaptador correctamente entrenado. Las pruebas de API produjeron salidas repetitivas con ocurrencias repetidas de «Kamayo:», lo que indica que el modelo no está listo para producción.

En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes, la licencia no está especificada y no se han publicado resultados de benchmarks. Se trata, por tanto, de un artefacto de investigación en fase temprana, útil como punto de partida para experimentación con traducción de lenguas filipinas de bajos recursos, pero no como recurso de traducción fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder sequence-to-sequence (NLLB-200 distilled) con adaptador LoRA (PEFT) |
| Parametros totales | 600M en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kamayo, inglés, filipino y bisaya (según la model card); el token de kamayo no está verificado en el tokenizador NLLB |
| Licencia | no disponible para el adaptador; se indica revisar la licencia del modelo base y los permisos de los datasets |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre facebook/nllb-200-distilled-600M, un transformer encoder-decoder multilingüe de tipo sequence-to-sequence con 600M de parámetros. NLLB-200 se entrena con tokens de idioma explícitos para seleccionar el par de traducción, y el adaptador se entrena con PEFT para especializar el modelo base en direcciones de traducción que involucran kamayo, inglés, filipino y bisaya. La model card referencia el paper de NLLB-200 (arXiv:2207.04672) como fuente del modelo base.

Los detalles de entrenamiento son incompletos. La model card menciona un corpus multilingüe curado con registros paralelos para varias direcciones de traducción, pero también indica que la versión exacta del corpus usada para producir el adaptador descargado no ha sido verificada de forma independiente. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO (no aplicable en un modelo de traducción de este tipo). El aspecto técnico más relevante y problemático es la configuración del token de idioma: el proyecto usó `hil_Latn` como ranura para kamayo, y las pruebas mostraron que ese token mapea al ID de token desconocido del tokenizador, por lo que la configuración debe corregirse y el procedimiento de entrenamiento verificarse antes de considerar el adaptador correctamente entrenado para kamayo.

## Capacidades

- Traducción automática entre kamayo, inglés, filipino y bisaya, según la intención declarada del proyecto; la calidad no está establecida.
- Traducción de frases y oraciones cortas, que es el uso directo indicado en la model card.
- Soporte de flujos de trabajo de traducción filipino-bisaya, según la model card.
- Generación de ejemplos para aprendizaje de idiomas, en el contexto del sistema KamayoLingua.
- Investigación en traducción automática de lenguas de bajos recursos.
- Integración vía API HTTP en un backend FastAPI con un sitio Node.js, según la arquitectura prevista del proyecto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en traducción de lenguas de bajos recursos: el adaptador sirve como banco de pruebas para estudiar el impacto de la configuración de tokens de idioma en NLLB cuando no existe un token nativo para la lengua objetivo, un problema recurrente en lenguas filipinas minoritarias.
- Prototipado de un sitio web de traducción kamayo: el adaptador puede cargarse junto al modelo base en un backend FastAPI y exponerse mediante un endpoint HTTP, tal como prevé la arquitectura del proyecto KamayoLingua, siempre que se corrija antes la configuración de tokens.
- Generación de material didáctico para aprendizaje de kamayo: el modelo puede producir borradores de traducción de frases cortas que un hablante fluido revisa y corrige, aprovechando el contexto educativo del proyecto.
- Comparación de estrategias de adaptación PEFT: al ser un adaptador LoRA pequeño sobre un modelo base público, es útil para experimentos controlados sobre rangos, datasets y tokens de idioma en traducción de bajos recursos.
- Traducción asistida filipino-bisaya: el modelo base NLLB ya cubre estas lenguas, y el adaptador puede evaluarse como capa de especialización para dominios concretos, midiendo si aporta mejoras frente al modelo base sin adaptar.
- Evaluación lingüística participativa: el adaptador puede usarse en talleres con hablantes nativos de kamayo para identificar errores sistemáticos, variantes ortográficas y diferencias dialectales, generando datos paralelos verificados para futuras iteraciones.
- Integración en herramientas educativas experimentales: la model card contempla su uso en aplicaciones educativas y herramientas lingüísticas experimentales, con revisión humana obligatoria de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, chrF, COMET ni evaluaciones humanas, y documenta que la calidad de traducción no ha sido establecida mediante una evaluación independiente exhaustiva. La única evidencia de rendimiento es cualitativa y negativa: una prueba de API produjo salidas repetitivas con ocurrencias repetidas de «Kamayo:».

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base NLLB-200 distilled 600M en fp32 requiere aproximadamente 2,4 GB solo para pesos, más memoria para activaciones y KV cache; en fp16 o bf16 se reduce a aproximadamente 1,2 GB para pesos. El adaptador LoRA añade una cantidad no disponible de memoria, presumiblemente pequeña.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en precisión reducida; GPU de datacenter como A100 o H100 no son necesarias para este tamaño, aunque aceleran el entrenamiento y la evaluación por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se use fp16/bf16 o cuantización; no se dispone de mediciones verificadas para este adaptador concreto.
- Opciones de despliegue: la model card solo documenta la carga con transformers y peft (`AutoTokenizer`, `AutoModelForSeq2SeqLM`, `PeftModel`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo seq2seq con adaptador PEFT, la ruta soportada es transformers más peft, y el despliegue en servidores de inferencia dependería de que estos soporten adaptadores LoRA sobre NLLB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| KamayoLingua (este modelo) | 600M base + adaptador LoRA | no disponible | kamayo, inglés, filipino, bisaya | no disponible | experimental, sin benchmarks, salidas problemáticas documentadas |
| facebook/nllb-200-distilled-600M | 600M | no disponible en la información proporcionada | 200 lenguas, sin token nativo de kamayo | licencia del modelo base (consultar en su repositorio) | modelo base público y ampliamente usado |
| facebook/nllb-200-distilled-1.3B | 1.3B | no disponible en la información proporcionada | 200 lenguas | licencia del modelo base (consultar) | versión mayor del mismo modelo base, más capacidad a mayor coste |
| Modelos de traducción filipina especializados | no disponible | no disponible | no disponible | no disponible | no se dispone de información verificada para comparar |

La comparación relevante es con el propio modelo base: KamayoLingua no aporta, según la documentación disponible, mejoras demostradas frente a NLLB-200 distilled 600M, y su configuración de token de idioma está pendiente de corrección.

## Limitaciones y advertencias

- Lengua de bajos recursos: la escasez de datos paralelos, las variantes ortográficas y las diferencias dialectales del kamayo limitan la calidad y la cobertura del adaptador.
- Token de idioma no verificado: el tokenizador de NLLB no tiene un token nativo de kamayo; el uso de `hil_Latn` como ranura mapea al token desconocido, lo que invalida la configuración actual y obliga a corregirla y reentrenar.
- Calidad de traducción no establecida: no hay evaluación independiente ni benchmarks; la model card lo declara explícitamente.
- Salidas degeneradas documentadas: una prueba de API produjo repeticiones de «Kamayo:», señal de que la configuración de generación no es aceptable.
- No apto para producción: la model card indica que no debe considerarse listo para producción hasta corregir la configuración de idioma, el entrenamiento y el comportamiento de generación.
- Riesgo de alucinación y de presentar traducciones no verificadas como hechos lingüísticos: la model card advierte explícitamente contra ello.
- Uso fuera de alcance: no debe usarse para traducciones certificadas o legalmente autoritativas, ni como sustituto de traductores humanos, ni como única fuente en contextos médicos, legales o de alto riesgo.
- Licencia incierta: la licencia del adaptador no está especificada y hay que revisar la del modelo base y los permisos de los datasets antes de redistribuir o usar comercialmente.
- Corpus de entrenamiento no verificado: la versión exacta del corpus usada para el adaptador descargado no ha sido verificada de forma independiente.
- Sesgos: no documentados de forma específica, pero previsibles sesgos derivados del corpus y del modelo base multilingüe.
- Advertencia de seguridad: la model card es material del autor y debe tratarse como referencia, no como instrucciones a seguir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/april-janemasancay120/kamayolingua
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de NLLB-200: https://arxiv.org/abs/2207.04672
- Repositorio del proyecto: no disponible
- Demo: no disponible
