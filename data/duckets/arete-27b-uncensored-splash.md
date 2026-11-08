# Duckets/Arete-27B-Uncensored-Splash

## Resumen

Arete-27B-Uncensored-Splash es un paquete de pesos cuantizados a 4 bits en formato Splash, distribuido por el usuario Duckets, que empaqueta el modelo SargeDev/Arete-27B-Uncensored para el motor Splash (runtime integrado en LM Studio o el binario independiente `splash serve`). El modelo subyacente es una abliteración de NousResearch/Arete-27B, que a su vez es un ajuste fino de alineamiento de valores (SFT) sobre la familia Qwen3.8-27B de Inco AI. La relevancia de este paquete es practica: permite ejecutar un modelo de 27B en 4 bits con decodificacion especulativa y torre de vision dentro del ecosistema Splash, sin necesidad de convertir pesos manualmente.

El paquete no introduce pesos nuevos ni reentrena nada: es una conversion del checkpoint BF16 de SargeDev a formato `splash-packed-q4` mediante el conversor open source splash-converter, con la cabeza de prediccion multi-token (MTP) descartada porque el formato Splash no la soporta. La decodificacion especulativa la aporta el draft DFlash2, copiado byte a byte del paquete oficial de la familia, y la torre de vision tambien se reutiliza sin cambios al ser identica en configuracion entre los distintos fine-tunes de Qwen3.8-27B.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay informacion publicada sobre benchmarks, idiomas soportados ni detalles del dataset de entrenamiento original, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8-27B (layout `Qwen3_5ForCausalLM` en el export de texto fuente; el paquete usa el layout multimodal `model.language_model.*`), con torre de vision y draft DFlash2 para decodificacion especulativa |
| Parametros totales | 27B (nominal, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits empaquetado (`splash-packed-q4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Splash (78 artefactos, 73 ficheros de pesos, 17.382.657.779 bytes, ~17,38 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3.8-27B con capacidad de vision, sobre el que Nous Research aplico un SFT de alineamiento de valores para producir Arete-27B. SargeDev genero posteriormente Arete-27B-Uncensored mediante abliteracion: eliminacion agresiva de la direccion de rechazo por descomposicion en valores singulares (SVD) sobre los pesos del modelo alineado. Este paquete es una conversion de ese checkpoint BF16 (revision `47a9768a60861e5ba8aff363a1c205aaabb1a64d`) a 4 bits empaquetado.

La conversion presenta dos particularidades tecnicas. Primero, el repositorio fuente es un export solo de texto con layout `Qwen3_5ForCausalLM`; antes de convertir, los tensores del modelo de lenguaje se renombraron al layout multimodal de la familia (`model.language_model.*`) sin alterar valores, y se les aplico la configuracion base de Arete. Segundo, los 15 tensores de la cabeza MTP no se trasladan, porque el formato Splash carece de componente MTP; la decodificacion especulativa la cubre el draft DFlash2. El draft y la torre de vision son copias byte a byte del paquete oficial `incoai/Qwen3.8-27B-Splash`, ya que el draft es especifico de la familia y la torre de vision es identica en configuracion entre fine-tunes. No se dispone de datos sobre volumen de tokens, composicion del dataset ni etapas de RLHF/DPO del entrenamiento original.

## Capacidades

- Generacion de texto conversacional en el formato de la familia Qwen3.8.
- Procesamiento de imagenes mediante la torre de vision reutilizada del paquete oficial (entrada image-text-to-text).
- Decodificacion especulativa nativa a traves del draft DFlash2, orientada a reducir latencia en inferencia.
- Comportamiento sin rechazo (abliterated/uncensored): el modelo no aplica las negativas aprendidas en el SFT de alineamiento de valores.
- Integracion con el runtime Splash de LM Studio y con el binario `splash serve`.
- Soporte de tool calling, agentes multi-paso, modo thinking o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en LM Studio: descargar el paquete en la carpeta de modelos de LM Studio, donde se cataloga como `arete-27b-uncensored-splash`, y cargarlo con el runtime Splash para disponer de un 27B en 4 bits sin conversion manual.
- Investigacion sobre abliteracion: comparar las respuestas de este paquete con las de NousResearch/Arete-27B para estudiar el efecto de la eliminacion de la direccion de rechazo por SVD en dominios controlados.
- Experimentos de decodificacion especulativa: usar el draft DFlash2 incluido para medir la ganancia de throughput frente a decodificacion autoregresiva estandar en el runtime Splash.
- Tareas multimodales ligeras: aprovechar la torre de vision para descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados, dentro de las limitaciones de un modelo de 27B.
- Generacion de texto creativo sin filtros de contenido: redaccion de ficcion o guiones donde los rechazos del modelo alineado resultan un obstaculo, asumiendo la responsabilidad de revision humana.
- Despliegue en servidor propio con `splash serve`: servir el checkpoint directamente desde SargeDev/Arete-27B-Uncensored cuando se necesite una API local, teniendo en cuenta que el paquete empaquetado esta pensado para el runtime de LM Studio.
- Evaluacion comparativa de fine-tunes de Qwen3.8-27B: al compartir torre de vision y draft con el paquete oficial de Inco AI, sirve como punto de comparacion aislado del efecto de la abliteracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete ocupa ~17,38 GB en disco en 4 bits; se necesita al menos esa cantidad de VRAM o memoria unificada, mas overhead del runtime, del draft DFlash2 y de la torre de vision.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar GPUs de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100), pero el autor no lo especifica.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 24 GB o mas de VRAM, aunque no esta confirmado por el autor.
- Opciones de despliegue: runtime Splash de LM Studio (formato del paquete) y `splash serve` apuntando al checkpoint fuente SargeDev/Arete-27B-Uncensored. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Duckets/Arete-27B-Uncensored-Splash | 27B | no disponible | 4 bits Splash | Apache-2.0 | Paquete para runtime Splash, con draft DFlash2 y vision |
| SargeDev/Arete-27B-Uncensored | 27B | no disponible | BF16 (fuente) | Apache-2.0 (segun el paquete) | Checkpoint original abliterado, solo texto en el export |
| NousResearch/Arete-27B | 27B | no disponible | no disponible | no disponible | SFT de alineamiento de valores sobre Qwen3.8-27B |
| incoai/Qwen3.8-27B-Splash | 27B | no disponible | 4 bits Splash | no disponible | Paquete oficial de la familia; origen del draft y la torre de vision |

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo reduce las negativas de seguridad, lo que aumenta el riesgo de generar contenido danino, ilegal o sesgado. Requiere filtros externos en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados y longitud de contexto: no documentados en la model card; no asumir las capacidades de la familia Qwen3.8 sin verificacion.
- Sin cabeza MTP: el paquete no incluye los 15 tensores MTP del checkpoint fuente, por lo que cualquier flujo que dependa de prediccion multi-token debe usar el draft DFlash2.
- Formato propietario del runtime: el paquete esta pensado para LM Studio/Splash; para otros motores hay que partir del checkpoint BF16 fuente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Licencia Apache-2.0 heredada del modelo fuente, pero conviene verificar las condiciones del checkpoint original de Nous Research antes de uso comercial.
- El autor no publica datos de entrenamiento, evaluacion ni limitaciones conocidas del modelo base.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Duckets/Arete-27B-Uncensored-Splash
- Modelo fuente abliterado: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo base alineado: https://huggingface.co/NousResearch/Arete-27B
- Paquete oficial de la familia (origen del draft y la vision): https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Modelo relacionado del mismo autor (MLX 4 bits): https://huggingface.co/Duckets/Arete-27B-MLX-4bit
- Conversor utilizado: https://github.com/publicExcess/splash-converter
