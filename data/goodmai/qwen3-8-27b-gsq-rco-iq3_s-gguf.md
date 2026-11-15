# goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario goodmai. Se trata de un checkpoint de tipo IQ3_S (cuantizacion entera de 3 bits con esquema de escalado por bloques) de aproximadamente 11,77 GB, derivado de un modelo base de 26.895.998.464 parametros (unos 26,9 mil millones). El autor lo publica como material de evaluacion para kernels Metal nativos de i-quant / GSQ-RCO dentro del proyecto Basalt (referencia interna #408).

El interes de esta ficha es acotado: no es un modelo nuevo ni un entrenamiento original, sino un artefacto de cuantizacion orientado a probar la viabilidad de kernels de inferencia de baja precision en hardware Apple (Metal). La model card es minima y no documenta datos de entrenamiento, idiomas, benchmarks ni procedencia del pipeline; toda la informacion tecnica del modelo subyacente queda fuera del repositorio y debe consultarse en el modelo base.

Por tanto, esta ficha describe lo que el repositorio declara explicitamente y marca como "no disponible" todo aquello que la informacion proporcionada no cubre. El modelo base Qwen3.8-27B pertenece a la familia Qwen3, pero sus especificaciones concretas (contexto, licencia del base, idiomas) no se detallan en la informacion disponible mas alla de la licencia apache-2.0 declarada en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; arquitectura no declarada en el repositorio) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (checkpoint de 11,77 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.8-27B en los datos proporcionados: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO o similares).

Lo unico documentado es el proceso de cuantizacion: el autor genera un checkpoint IQ3_S de 11,77 GB y lo etiqueta con las marcas `basalt`, `gsq-rco` e `imatrix`. La etiqueta `imatrix` sugiere el uso de una matriz de importancia para guiar la cuantizacion (calibracion por importancia de pesos/activaciones), y `gsq-rco` apunta a un esquema de cuantizacion propio del proyecto Basalt. El proposito declarado es la evaluacion de kernels Metal nativos de i-quant / GSQ-RCO, es decir, una prueba de concepto de inferencia de baja precision en GPUs Apple, no un artefacto listo para produccion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para dialogos, aunque no se detallan capacidades especificas.
- Razonamiento, codigo y matematicas: no disponible (no declarado en el repositorio; depende del modelo base).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion de kernels Metal: el caso de uso principal y declarado es probar los kernels nativos i-quant / GSQ-RCO de Basalt sobre hardware Apple, midiendo correccion numerica y rendimiento del checkpoint IQ3_S frente a otras precisiones.
- Validacion de cuantizacion IQ3_S con imatrix: comparar la calidad de salida del checkpoint de 3 bits con el modelo base en tareas de generacion libre, para decidir si la perdida de precision es aceptable.
- Pruebas de integracion en pipelines GGUF: verificar que el archivo carga correctamente en herramientas compatibles con GGUF (llama.cpp y derivados) antes de adoptar el esquema de cuantizacion en otros modelos.
- Desarrollo de runtimes alternativos: servir como caso de prueba para implementaciones de inferencia que quieran soportar el formato GSQ-RCO de Basalt.
- Experimentacion en equipos de sobremesa con GPU Apple: al ocupar 11,77 GB, permite probar un modelo de ~27 mil millones de parametros en memorias unificadas de 16-32 GB, algo inviable en precision completa.
- Referencia para investigacion en cuantizacion de baja precision: analizar el impacto de IQ3_S con matriz de importancia en la perplejidad y en la coherencia de respuestas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el checkpoint pesa 11,77 GB; se necesita al menos esa cantidad de memoria mas overhead de contexto y buffers del runtime (orientativamente 13-16 GB para contextos moderados).
- GPU recomendadas: no disponible (no se declaran requisitos oficiales). El proposito declarado son kernels Metal, lo que apunta a GPUs Apple (serie M1/M2/M3/M4 con memoria unificada de 16 GB o superior).
- Compatibilidad con GPU de consumo: previsiblemente si en GPUs Apple con 16 GB o mas de memoria unificada; en GPUs NVIDIA de consumo (RTX 4090 con 24 GB) cabria por tamano, aunque no se declara soporte ni rendimiento.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; el esquema GSQ-RCO requeriria el runtime Basalt con kernels Metal especificos. No se confirma compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de evaluacion: el autor lo publica para probar kernels Metal de Basalt (#408); no esta pensado como release estable para produccion.
- Sin documentacion de calidad: no hay benchmarks, evaluaciones de sesgo ni estudios de alucinacion; se desconoce la degradacion introducida por la cuantizacion IQ3_S.
- Perdida de precision esperable: una cuantizacion de 3 bits puede degradar tareas sensibles (matematicas, codigo, razonamiento largo) respecto al modelo base, aunque no hay datos que lo cuantifiquen.
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- Dependencia del runtime: el esquema GSQ-RCO puede no ser interoperable con herramientas GGUF estandar; conviene verificar la carga antes de integrarlo.
- Licencia: apache-2.0 en este repositorio, pero deben respetarse tambien las condiciones del modelo base Qwen/Qwen3.8-27B, cuyos terminos no se detallan en la informacion disponible.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de publicacion: creado el 2026-11-15, lo que conviene contrastar con la disponibilidad real del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GSQ-RCO-IQ3_S-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Basalt y referencia #408: no disponible (no se proporciona URL)
