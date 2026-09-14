# HelloGY/exaone-iSKA-v1.2.0

## Resumen

HelloGY/exaone-iSKA-v1.2.0 es un ajuste fino supervisado (SFT) del modelo EXAONE-3.5-7.8B-Instruct de LG AI Research, especializado en la puntuacion automatica de respuestas de estudiantes de coreano. El modelo no se presenta como un asistente generalista, sino como un puntuador de respuestas evaluadas en dos dimensiones: lengua (Language) y contenido (Content), empleando quadratic weighted kappa (QWK) como metrica de evaluacion. El autor del repositorio es el usuario HelloGY y el modelo se publica en HuggingFace con el identificador indicado.

Con 7.818.448.896 parametros totales (aproximadamente 7,8B), el modelo hereda la arquitectura y el tokenizador del modelo base de LG AI Research, que se distribuye bajo la licencia EXAONE AI Model License Agreement 1.1 - NC, es decir, con restriccion de uso no comercial. El repositorio ocupa 15,6 GB y contiene unicamente pesos en formato safetensors con codigo personalizado (etiqueta custom_code), lo que obliga a cargarlo con `trust_remote_code=True` en transformers.

La relevancia de esta ficha radica en que se trata de un caso de uso muy acotado: evaluacion automatica de produccion linguistica en coreano, un nicho con menos herramientas publicas que el ingles. El modelo reporta un QWK medio de 0,8267 en el conjunto de test retenido (0,8252 en Language y 0,8283 en Content) y un mejor checkpoint de validacion con QWK medio de 0,8400 en el paso 560. No hay datos publicados sobre contexto, idiomas declarados, benchmarks generales ni cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (hereda la del modelo base EXAONE-3.5-7.8B-Instruct, etiquetado como `exaone` en HuggingFace) |
| Parametros totales | 7.818.448.896 (dato real de safetensors) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles: el repositorio solo contiene safetensors en precision completa (15,6 GB). No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No declarados en la metadata. El ajuste esta orientado al coreano (puntuacion de respuestas de estudiantes de coreano); el modelo base esta documentado por su autor para coreano e ingles, dato no confirmado en la informacion proporcionada |
| Licencia | EXAONE AI Model License Agreement 1.1 - NC (no comercial), heredada del modelo base EXAONE-3.5-7.8B-Instruct. La metadata del repositorio no declara campo de licencia |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

No se aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset de ajuste. Lo unico documentado es que se trata de un fine-tuning supervisado (SFT) sobre EXAONE-3.5-7.8B-Instruct, el modelo de 7,8B de la serie EXAONE 3.5 de LG AI Research, con el objetivo concreto de puntuar respuestas de estudiantes de coreano en dos ejes: Language y Content. El modelo conserva el tag `exaone` y la referencia al paper arXiv:2412.04862, correspondiente a la publicacion tecnica de la familia EXAONE 3.5.

Tampoco se detallan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion u otras). El unico dato de proceso de entrenamiento disponible es el punto de control seleccionado: el mejor checkpoint de validacion se alcanzo en el paso 560, con un QWK medio de 0,8400. Se desconoce si hubo fases de RLHF, DPO o preferencias humanas despues del SFT, asi como el tamano del conjunto de datos de ajuste y su procedencia.

## Capacidades

- Puntuacion automatica de respuestas de estudiantes de coreano, con salida desglosada en las dimensiones Language y Content.
- Evaluacion con quadratic weighted kappa (QWK) como metrica de acuerdo con anotaciones humanas, adecuada para escalas ordinales.
- Capacidades generales de generacion de texto y comprension lectora heredadas del modelo instruct base, aunque no verificadas ni documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el ajuste se orienta al coreano y no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Correccion automatica de pruebas de coreano como lengua extranjera: el modelo puede asignar puntuaciones ordinales a respuestas abiertas con un QWK medio de 0,8267 en test, lo que permite un primer cribado masivo de examenes antes de la revision humana.
- Plataformas de aprendizaje de idiomas: integracion como motor de puntuacion inmediata de ejercicios escritos, devolviendo dos notas separadas (lengua y contenido) que el sistema puede traducir en feedback formativo al estudiante.
- Investigacion en evaluacion automatica de ensayos (AES): uso como linea base reproducible en coreano, dado que los resultados en ingles estan mucho mas cubiertos y este modelo ofrece una referencia con metrica QWK declarada.
- Anotacion asistida de corpus de aprendices: preetiquetado de grandes volumenes de respuestas para reducir el coste de anotacion humana, dejando al anotador la validacion de los casos con puntuacion ambigua.
- Control de calidad en pipelines de evaluacion: deteccion de discrepancias entre la nota del modelo y la de un corrector humano para disparar revisiones adicionales en los casos de mayor desviacion.
- Generacion de informes de progreso: combinado con un sistema externo de agregacion, el modelo permite calcular la evolucion de un estudiante por dimension a lo largo del tiempo a partir de sus respuestas puntuadas.
- Calibracion de correctores humanos: los valores de QWK por dimension pueden emplearse para medir la consistencia entre anotadores y detectar sesgos sistematicos en un equipo de evaluacion.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son de quadratic weighted kappa (QWK) sobre un conjunto de test retenido de puntuacion de respuestas en coreano:

| Metrica | QWK |
|---|---:|
| Language | 0,8252 |
| Content | 0,8283 |
| Mean | 0,8267 |

Mejor checkpoint de validacion:

| Metrica | Valor |
|---|---:|
| Validation mean QWK | 0,8400 |
| Step | 560 |

No se han publicado resultados de benchmarks generales (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): el repositorio pesa 15,6 GB, por lo que se necesitan aproximadamente 16 GB solo para los pesos, mas la cache KV; en la practica, entre 20 y 24 GB para contextos cortos.
- VRAM estimada con cuantizacion de 8 bits: del orden de 9-10 GB (estimacion estandar para 7,8B; el autor no publica cuantizaciones).
- VRAM estimada con cuantizacion de 4 bits: del orden de 5-6 GB (estimacion estandar; requiere conversion propia al no haber GGUF ni AWQ/GPTQ en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en fp16 con contexto largo y concurrencia; RTX 4090 (24 GB) o A6000 (48 GB) para fp16 con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) a fp16 con contexto reducido, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la ruta confirmada por la etiqueta `custom_code`. La compatibilidad con vLLM, TGI u Ollama no esta documentada y depende de que el codigo personalizado sea compatible con esas implementaciones. No hay GGUF publicado para llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HelloGY/exaone-iSKA-v1.2.0 | 7,8B | No disponible | QWK medio 0,8267 en test de scoring coreano | EXAONE 1.1 - NC (no comercial) | safetensors, `custom_code`, 0 descargas |
| EXAONE-3.5-7.8B-Instruct (modelo base) | 7,8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | EXAONE 1.1 - NC (no comercial) | safetensors, modelo publico de LG AI Research |
| Otros modelos de scoring especializados en coreano | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables entre el modelo base y este ajuste, ni de alternativas especializadas en puntuacion de respuestas en coreano dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta ajustado para puntuar respuestas de estudiantes de coreano. Su uso como asistente general, chatbot o generador de codigo no esta documentado y probablemente degrade su comportamiento original.
- Riesgo de olvido catastrofico: un SFT sobre un unico dominio puede reducir capacidades generales del modelo instruct base; no hay evaluacion que lo cuantifique.
- Sesgos conocidos: no se documentan analisis de sesgo por dialecto, origen del estudiante, nivel socioeconomico o tipo de error. Un puntuador de este tipo puede penalizar sistematicamente variedades no estandar del coreano.
- Riesgo de alucinacion en la puntuacion: no se describe ningun mecanismo de calibracion ni de intervalos de confianza; el QWK de 0,8267 implica un margen de error no despreciable en casos individuales.
- Restricciones de licencia: el modelo se rige por EXAONE AI Model License Agreement 1.1 - NC, que prohibe el uso comercial. Cualquier despliegue en producto o servicio de pago requiere revisar los terminos con el titular de la licencia (LG AI Research).
- Opacidad del linaje: la metadata del repositorio no declara licencia ni idiomas, y el autor no detalla el dataset de ajuste, su tamano ni el proceso de anotacion. La reproducibilidad es limitada.
- Riesgo de seguridad en la carga: la etiqueta `custom_code` obliga a ejecutar codigo remoto con `trust_remote_code=True`; conviene auditar el codigo antes de cargarlo en entornos de produccion.
- Validacion comunitaria inexistente: el repositorio figura con 0 descargas y 0 likes, sin verificacion independiente de los resultados declarados.
- Inconsistencia de metadata: las fechas de creacion y actualizacion del repositorio (2026-09-14) son posteriores a la fecha actual de consulta, lo que sugiere un posible error de registro o de zona horaria que conviene verificar.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto; asumir el comportamiento del modelo base para contextos largos no es seguro sin pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/HelloGY/exaone-iSKA-v1.2.0
- Paper del modelo base EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Modelo base en HuggingFace: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demos o espacios: no disponible en la informacion proporcionada
- Resultados de busqueda web: los enlaces devueltos por la busqueda (jecontacte.com y subpaginas) no guardan relacion con el modelo y se descartan por no ser fuentes relevantes.
