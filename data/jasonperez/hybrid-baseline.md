# jasonperez/hybrid-baseline

## Resumen

hybrid-baseline es un repositorio experimental publicado por el usuario jasonperez en Hugging Face bajo licencia MIT. No se trata de un modelo entrenado ni de un checkpoint con capacidades de generacion reales, sino de un esqueleto de codigo ("codebase") para experimentar con una arquitectura hibrida orientada a tareas de generacion. El propio autor lo describe como un punto de partida de escala "nano", pensado para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El artefacto principal del repositorio es el script `finetune.py`, acompanado de `config.json`, `training_args.json` y un unico fichero `model.safetensors` que el autor identifica explicitamente como un checkpoint de inicializacion valido para pruebas de humo (smoke tests), no como un modelo entrenado. El recuento real de parametros del fichero safetensors es de 33.088, un orden de magnitud propio de una maqueta funcional, no de un modelo de lenguaje utilizable.

Su relevancia actual es metodologica mas que funcional: sirve como plantilla reproducible para comparar variantes de arquitecturas hibridas (atencion combinada con componentes de estado estructurado) manteniendo constante el presupuesto de entrenamiento, las semillas aleatorias y la exposicion de datos. La model card insiste en que cualquier resultado futuro debe documentarse por separado de estos valores por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (Hybrid), con atencion "flash", fusion bilinear, activacion swish y normalizacion scalenorm |
| Parametros totales | 33.088 (recuento del fichero safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (acompanado de `config.json` y `training_args.json`; implementacion en PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Hybrid" a escala "nano", con atencion de tipo flash, mecanismo de fusion bilinear, funcion de activacion swish y normalizacion scalenorm. El autor no detalla la composicion interna del bloque hibrido (proporcion entre atencion y componentes de estado, dimensiones de capas, numero de cabezas ni vocabulario), por lo que no es posible reconstruir el modelo a partir de la informacion publicada. Los pesos se distribuyen en formato safetensors y la implementacion es una clase personalizada en PyTorch, lo que implica que las APIs genericas de carga automatica necesitan un adaptador explicito antes de poder usarse.

En cuanto al entrenamiento, no hay ningun entrenamiento completado. La receta por defecto incluida en `training_args.json` especifica optimizador Adam con planificador de tasa de aprendizaje coseno, pero el propio autor aclara que son valores de arranque del script y no evidencia de una ejecucion finalizada. El checkpoint `model.safetensors` es una inicializacion valida para smoke tests. No se documentan tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- No se declara ninguna capacidad funcional verificada. El repositorio no incluye un modelo entrenado ni resultados de evaluacion.
- No hay evidencia de generacion de texto coherente: el checkpoint es de inicializacion y no ha pasado por entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Lo que si ofrece el repositorio es una plantilla ejecutable (`finetune.py` con bloque `__main__`) para lanzar experimentos de arquitectura y un fichero de configuracion que registra los ajustes generados.

## Casos de uso

- Investigacion en arquitecturas hibridas: el repositorio sirve como implementacion de referencia minima para probar variantes de atencion combinada con componentes de estado estructurado, comparando configuraciones con el mismo presupuesto de computo y las mismas semillas.
- Pruebas de humo en infraestructura de entrenamiento: el checkpoint de inicializacion permite validar que un pipeline de carga de safetensors, tokenizador y bucle de entrenamiento funciona de extremo a extremo antes de gastar GPU en un run completo.
- Desarrollo de adaptadores de carga: dado que la implementacion es personalizada y las APIs automaticas fallan sin un adaptador, el repositorio es util para escribir y depurar ese adaptador para una arquitectura no estandar.
- Benchmarking metodologico: la model card propone usar un conjunto de validacion especifico de tarea, reportar la metrica en al menos tres semillas e incluir una linea base de capacidad equivalente, lo que convierte al repositorio en una plantilla de protocolo de evaluacion.
- Docencia y formacion: a escala nano (33.088 parametros), el modelo se puede ejecutar y depurar en un portatil sin GPU, lo que resulta practico para explicar el ciclo completo de definicion, inicializacion, guardado y carga de un transformer hibrido.
- Versionado de experimentos: los ficheros `config.json` y `training_args.json` permiten registrar de forma reproducible la configuracion exacta de cada variante ensayada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explicita que no se reclama ninguna puntuacion de benchmark en este repositorio y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 33.088 parametros, los pesos en precision completa ocupan del orden de decenas de kilobytes, por lo que el modelo cabe en memoria mucho antes de que el tama?o de los pesos sea un factor limitante.
- GPU recomendadas: ninguna en particular. El cuello de botella es la compatibilidad de la implementacion personalizada, no la memoria.
- Cabe en GPU de consumo: si, y tambien en CPU sin aceleracion dedicada.
- Opciones de despliegue: al ser una implementacion personalizada con atencion flash y fusion bilinear, no se puede servir directamente con vLLM, llama.cpp, Ollama o TGI sin trabajo previo de portado. El autor indica que las APIs automaticas de carga requieren un adaptador explicito.
- Latencia y throughput estimados: no disponible. No tiene sentido reportar cifras de rendimiento de un checkpoint sin entrenar.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun modelo comparable directo, porque hybrid-baseline no es un modelo entrenado sino un esqueleto de codigo. La busqueda web devuelve un repositorio de nombre parecido, `JerryGJX/hybrid-loss-baseline-2500` (1.000 millones de parametros, 32.000 tokens de contexto, servido mediante API compatible con OpenAI), pero no hay ninguna evidencia de relacion entre ambos proyectos mas alla de la coincidencia parcial de nombre; se incluye solo como referencia de un artefacto distinto.

| Aspecto | hybrid-baseline (jasonperez) | hybrid-loss-baseline-2500 (JerryGJX) | Referencia academica (arXiv 2510.04800v3) |
|---|---|---|---|
| Tipo | Esqueleto de codigo con checkpoint de inicializacion | Modelo desplegable | Articulo de analisis de arquitecturas hibridas |
| Parametros | 33.088 | 1.000 millones (segun el proveedor) | no aplica |
| Contexto | no disponible | 32.000 tokens (segun el proveedor) | no aplica |
| Entrenado | No | Si (implicitamente, al ofrecerse como servicio) | no aplica |
| Licencia | MIT | no disponible | no disponible |
| Disponibilidad | Hugging Face | API de terceros de pago | PDF publico |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no genera texto util y no debe presentarse como un modelo funcional en ningun escenario de produccion.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal y como reconoce el propio autor.
- No hay datos publicados de sesgos, porque no hay entrenamiento ni evaluacion que los pueda revelar.
- Riesgo de alucinacion: no evaluable en ausencia de un modelo entrenado.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no se puede planificar un uso multilingue ni de contexto largo.
- La implementacion es personalizada; el uso de APIs genericas de carga fallara sin un adaptador explicito, lo que anyade coste de integracion.
- La licencia MIT cubre el codigo y los pesos de este repositorio, pero el autor advierte de que deben revisarse por separado los terminos de los datos de origen si se usan conjuntos de datos externos.
- La receta de entrenamiento incluida (Adam con planificador coseno) son valores de arranque, no resultados reproducidos; cualquier cifra futura debe documentarse separada de estos valores por defecto.
- El repositorio ocupa 0,0 GB y acumula 12 descargas y 0 "likes" en el momento de la consulta, lo que indica nula validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jasonperez/hybrid-baseline
- Articulo sobre arquitecturas hibridas para modelos de lenguaje: https://arxiv.org/pdf/2510.04800v3
- Modelo homonimo parcial en un proveedor de inferencia (sin relacion confirmada): https://featherless.ai/models/JerryGJX/hybrid-loss-baseline-2500
- Lista comunitaria de modelos de acceso gratuito citada en la busqueda: https://github.com/ClawLabsAI/free-ai-models
- Calendario de lanzamientos de modelos de IA citado en la busqueda: https://www.scriptbyai.com/ai-model-release-calendar/
