# solavr/small100-ctranslate2-int8

## Resumen

solavr/small100-ctranslate2-int8 es una conversion comunitaria del modelo de traduccion automatica multilingue alirezamsh/small100 (SMaLL-100) al formato de CTranslate2 con cuantizacion INT8 de los pesos. El objetivo es ejecutar traduccion neuronal en CPU con un consumo de recursos muy bajo, sin necesidad de GPU. No se realizo entrenamiento, ajuste fino ni poda: unicamente la conversion de formato y la cuantizacion. El repositorio ocupa 0,3 GB.

El modelo subyacente, SMaLL-100, es un transformador encoder-decoder derivado de la arquitectura M2M-100, con aproximadamente 330 millones de parametros. Cubre 100 idiomas y mas de 10.000 direcciones de traduccion, con un diseno orientado a preservar el rendimiento en lenguas de bajos recursos. La relevancia de esta conversion radica en que permite desplegar traduccion multilingue en hardware modesto (servidores sin GPU, portatiles, dispositivos edge) con un coste de memoria inferior a 1 GB.

Se trata de una publicacion no oficial: el autor de la conversion no esta afiliado ni respaldado por los autores originales de SMaLL-100. La licencia MIT del modelo base se conserva, y se mantiene el tokenizador SentencePiece original. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este repositorio (los enlaces encontrados eran foros no relacionados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (SMaLL-100 / M2M-100) |
| Parametros totales | Aproximadamente 330 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (pesos almacenados); tipo de computo CPU recomendado: int8_float32 |
| Idiomas soportados | 100 idiomas, mas de 10.000 direcciones de traduccion |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin), cuantizacion INT8 |
| Modelo base | alirezamsh/small100 (revision 8ab680e26a596d2e3d2d2d17ae0f68df1037328c) |
| Relacion con el modelo base | Quantized (conversion de formato y cuantizacion) |
| Runtime | CTranslate2 4.8.2 o compatible |
| Tokenizador | SentencePiece BPE original de SMaLL-100 (sentencepiece.bpe.model) |
| Tamano del repositorio | 0,3 GB |
| Dispositivo objetivo | CPU |
| Tarea (pipeline) | translation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo SMaLL-100 original: un transformer encoder-decoder con atencion completa, derivado del diseno M2M-100 y con aproximadamente 330 millones de parametros en total. La innovacion principal de SMaLL-100, segun su publicacion, es su naturaleza "shallow": un encoder poco profundo combinado con un decoder mas profundo y un vocabulario compartido en SentencePiece, disenado especificamente para no degradar el rendimiento en lenguas de bajos recursos frente a modelos multilingues de mayor tamano.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card de esta conversion indica explicitamente que no se realizo ningun entrenamiento, ajuste fino ni poda sobre el checkpoint original: el proceso consistio en convertir los pesos al formato CTranslate2 y cuantizarlos a INT8. Las herramientas empleadas en la conversion fueron CTranslate2 4.8.2, Transformers 5.15.0, PyTorch 2.13.0 y SentencePiece 0.2.1. Los metadatos exactos estan en conversion.json y los hashes SHA-256 en SHA256SUMS.

## Capacidades

- Traduccion automatica de texto entre 100 idiomas y mas de 10.000 direcciones, incluida la traduccion entre lenguas de bajos recursos.
- El idioma destino se especifica anteponiendo un token especial al texto de origen con el formato `__<codigo_idioma>__` (por ejemplo, `__ja__` para japones).
- Decodificacion por busqueda en haz (beam search), configurable en tiempo de inferencia (beam size 5 en la configuracion de referencia; un haz de 3 reduce latencia a posible coste de calidad).
- Parametros de decodificacion no incrustados en los ficheros del modelo: se ajustan en cada llamada.
- Ejecucion en CPU con cuantizacion INT8 y tipo de computo `int8_float32`.
- Tokenizacion mediante SentencePiece BPE, con vocabulario compartido entre origen y destino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito. Es un modelo exclusivamente de traduccion texto a texto.

## Casos de uso

- Traduccion de documentacion tecnica y manuales: el modelo procesa lotes de parrafos y permite generar versiones en multiples idiomas desde un unico punto de entrada, con un consumo de memoria inferior a 1 GB en CPU.
- Atencion al cliente multilingue: integrado como microservicio previo a un sistema de tickets, traduce las consultas entrantes al idioma del operador y las respuestas de vuelta al idioma del cliente, sin depender de APIs externas.
- Localizacion de sitios web y CMS: traduccion por lotes de cadenas y contenidos en pipelines de publicacion, con la ventaja de que los pesos no salen de la infraestructura propia.
- Procesamiento por lotes de grandes volumenes de texto en servidores sin GPU: al ser INT8 y CPU-only, se puede escalar horizontalmente con instancias baratas y `inter_threads`/`intra_threads` ajustables.
- Despliegue on-premise con requisitos de privacidad o soberania del dato: al ejecutarse localmente y bajo licencia MIT, es adecuado para entornos sanitarios, legales o administrativos donde no se permite enviar texto a servicios en la nube.
- Aplicaciones de escritorio o moviles con traduccion offline: el tamano de 0,3 GB permite empaquetar el modelo en una aplicacion local, con la logica de tokenizado y decodificacion del ejemplo de la model card.
- Preprocesado multilingue para investigacion: normalizacion o traduccion de corpus hacia un idioma pivote antes de tareas de analisis, anotacion o indexacion.
- Investigacion en lenguas de bajos recursos: el diseno del modelo base prioriza el rendimiento en estas lenguas, lo que lo hace util para experimentos de traduccion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas (BLEU, chrF, COMET ni similares) y remite a la publicacion original de SMaLL-100 para los resultados de evaluacion del modelo base. Hay que tener en cuenta que dichos resultados corresponderian al checkpoint en coma flotante, no a esta version cuantizada a INT8, cuyos resultados pueden diferir.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el caso de uso previsto (CPU). Si se carga en GPU mediante CTranslate2, se puede estimar un consumo en torno a 0,5-1 GB dado que los pesos INT8 ocupan aproximadamente 0,3 GB; esta cifra es una estimacion, no un dato publicado.
- Memoria RAM: el repositorio completo ocupa 0,3 GB, por lo que la inferencia en CPU cabe holgadamente en sistemas con 2-4 GB de RAM.
- GPU recomendadas: no se especifican. El modelo esta pensado para CPU; cualquier GPU compatible con CTranslate2 podria usarse, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de VRAM, aunque no es su escenario optimo.
- Opciones de despliegue: CTranslate2 4.8.2 o compatible como runtime principal. El formato no es GGUF ni safetensors, por lo que no es directamente compatible con llama.cpp, Ollama ni TGI sin conversion adicional; se integra en Python mediante `ctranslate2.Translator` junto con `sentencepiece`.
- Latencia y throughput estimados: no disponibles. Dependen del numero de hilos (`inter_threads`, `intra_threads`), del tamano de haz, de la longitud de la secuencia y del soporte de instrucciones SIMD de la CPU.
- El soporte de conjuntos de instrucciones de la CPU viene determinado por el runtime de CTranslate2 que cargue el modelo, no por los ficheros en si, que son independientes de plataforma.

## Comparativa con modelos similares

Los datos de rendimiento de esta conversion no se han publicado, por lo que la comparacion es estructural y no de calidad. Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Idiomas | Licencia | Formato / ejecucion | Rendimiento |
|---|---|---|---|---|---|
| solavr/small100-ctranslate2-int8 | ~330 M | 100 (mas de 10.000 direcciones) | MIT | CTranslate2 INT8, CPU | No disponible |
| alirezamsh/small100 (modelo base) | ~330 M | 100 | MIT | PyTorch / Transformers, FP | No disponible en esta informacion |
| facebook/m2m100_418M | ~418 M | 100 | MIT | PyTorch / Transformers | No disponible en esta informacion |
| facebook/nllb-200-distilled-600M | ~600 M | 200 | CC-BY-NC-4.0 (no comercial) | PyTorch / Transformers | No disponible en esta informacion |

Frente a m2m100_418M, la propuesta de SMaLL-100 reduce el numero de parametros manteniendo la cobertura de 100 idiomas, y esta conversion anade una ventaja operativa clara: ejecucion en CPU con pesos INT8. Frente a NLLB-200, SMaLL-100 cubre menos idiomas pero su licencia MIT permite uso comercial sin las restricciones de la licencia CC-BY-NC.

## Limitaciones y advertencias

- La calidad de traduccion varia sustancialmente segun el par de idiomas y el dominio, tal y como advierte la propia model card.
- El modelo base prioriza el rendimiento en lenguas de bajos recursos; en algunas direcciones de altos recursos puede quedar por detras de modelos mayores o especificos de un idioma.
- La cuantizacion INT8 puede alterar las salidas y reducir la calidad respecto al checkpoint original en coma flotante. No hay metricas publicadas que cuantifiquen esa perdida.
- Riesgo de errores en fragmentos parciales, texto ambiguo, nombres propios, cifras y terminologia especializada; conviene revisar el resultado cuando la precision sea critica.
- Los sesgos presentes en el modelo original pueden permanecer o verse amplificados tras la compresion.
- Limitacion de contexto: la longitud maxima de contexto no esta documentada en la informacion disponible; los textos largos deben segmentarse.
- Es una conversion no oficial, no respaldada por los autores de SMaLL-100, sin garantias de mantenimiento ni soporte.
- El uso comercial esta permitido por la licencia MIT, pero se debe conservar el aviso de copyright y licencia original y citar el trabajo original en contextos de investigacion.
- No es un modelo de proposito general: no soporta generacion libre, razonamiento, codigo, tool calling ni agentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/solavr/small100-ctranslate2-int8
- Modelo base SMaLL-100: https://huggingface.co/alirezamsh/small100
- Paper de SMaLL-100 (EMNLP 2022): https://aclanthology.org/2022.emnlp-main.571/
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Referencia bibliografica del modelo base: Mohammadshahi et al., "SMaLL-100: Introducing Shallow Multilingual Machine Translation Model for Low-Resource Languages", Proceedings of EMNLP 2022, paginas 8348-8359.
- Nota sobre la busqueda web: los resultados obtenidos no guardaban relacion con el modelo (foros sobre transferencia de ficheros), por lo que no aportan enlaces adicionales relevantes.
