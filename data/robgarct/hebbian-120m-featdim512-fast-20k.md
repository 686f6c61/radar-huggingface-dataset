# robgarct/hebbian-120m-featdim512-fast-20k

## Resumen

`hebbian-120m-featdim512-fast-20k` es un checkpoint de investigación publicado por el usuario robgarct en HuggingFace. Se trata de un modelo de lenguaje de aproximadamente 120 millones de parámetros construido sobre un mezclador hebbiano (`online_hebbian_v10`) con atención lineal y una dimensión de característica (*feature_dim*) de 512. El autor lo publica explícitamente para que sus evaluaciones de recuperación en contexto (*in-context recall*) puedan reproducirse, no como un modelo listo para uso general.

El entrenamiento consistió en 20 000 pasos sobre el dataset Pile partiendo de la configuración de experimento `mlp_mixer/online_hebbian_v10_noSiLU_initSmall_featdim512_120m_fast`. Forma parte de un barrido de ancho de estado (*state-width sweep*) evaluado en FDA, SWDE y SQuAD, en RULER NIAH y en un barrido de retención controlado por distancia, lo que lo sitúa en la línea de investigación sobre mecanismos de memoria y recuperación como alternativa a la atención softmax.

Su relevancia es fundamentalmente académica: aporta un punto de comparación reproducible para estudiar cómo el ancho de estado de una arquitectura recurrente o de atención lineal afecta a la capacidad de recuperar información del contexto. No se declara licencia, idiomas, tokenizador ni resultados numéricos de benchmarks, y el repositorio acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto experimental sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezclador hebbiano (*Hebbian mixer*) `online_hebbian_v10` con atencion lineal, derivado de una configuracion tipo MLP-Mixer |
| Parametros totales | Aproximadamente 120 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; se distribuye el checkpoint en la precision de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia alguna) |
| Formato de pesos | Checkpoint de PyTorch `.ckpt` (`final.ckpt`, solo pesos, sin estado del optimizador) |
| Dimension de caracteristica (*feature_dim*) | 512 |
| Pasos de entrenamiento | 20 000 (`global_step` 20000) |
| Dataset de entrenamiento | Pile (porcion no especificada) |
| Configuracion de experimento | `mlp_mixer/online_hebbian_v10_noSiLU_initSmall_featdim512_120m_fast` |
| Libreria asociada | `recurrent-recall-circuits` |
| Tamano del repositorio | Aproximadamente 0,5 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un mezclador hebbiano con atencion lineal, integrado en un esqueleto de tipo MLP-Mixer segun la ruta de configuracion `mlp_mixer/online_hebbian_v10_noSiLU_initSmall_featdim512_120m_fast`. La variante `online_hebbian_v10` aplica una actualizacion hebbiana en linea, es decir, un mecanismo de memoria asociativa que modifica el estado en funcion de la correlacion entre activaciones, en lugar de la atencion softmax tradicional. Los modificadores de la configuracion indican que se prescinde de la activacion SiLU (`noSiLU`) y que se emplea una inicializacion de escala reducida (`initSmall`) con ancho de estado de 512. El modelo tiene alrededor de 120 millones de parametros y fue entrenado durante 20 000 pasos sobre el dataset Pile.

No hay informacion disponible sobre el numero total de tokens procesados, la composicion exacta del dataset, la longitud de contexto efectiva durante el preentrenamiento, el tokenizador utilizado ni la existencia de fases de ajuste como RLHF o DPO; por el tipo de artefacto y el presupuesto de entrenamiento declarado, se trata de un modelo base sin alineacion. La innovacion tecnica que motiva su publicacion es la reproducibilidad de las evaluaciones de recuperacion en contexto dentro de un barrido de ancho de estado, con pruebas en FDA, SWDE y SQuAD, RULER NIAH y un barrido de retencion controlado por distancia. El checkpoint distribuido contiene unicamente los pesos (`final.ckpt`), sin estado del optimizador, lo que limita la reanudacion directa del entrenamiento.

## Capacidades

- Modelado de lenguaje autoregresivo basico: genera texto a partir de un prefijo, sin ajuste por instrucciones ni formato conversacional.
- Recuperacion en contexto (*in-context recall*): es la capacidad que el autor destaca y evalua; el modelo esta disenado para recuperar informacion presente en el contexto mediante el estado hebbiano.
- Barrido de retencion controlado por distancia: capacidad de mantener informacion en funcion de la distancia entre la clave y la consulta, medida en las evaluaciones del autor.
- Evaluacion en tareas de extraccion y respuesta: FDA, SWDE y SQuAD, y en la prueba de aguja en un pajar RULER NIAH.
- Soporte de *tool calling* / *function calling*: no disponible; no hay evidencia de plantillas ni ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo base de 120 M entrenado 20 000 pasos no incorpora estas capacidades.
- Capacidades multilingues: no disponibles; no se documenta el reparto de idiomas y el Pile es predominantemente en ingles, pero no hay confirmacion en la informacion proporcionada.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de evaluaciones de recuperacion: cargar `final.ckpt` con la libreria `recurrent-recall-circuits` y repetir las pruebas de FDA, SWDE, SQuAD y RULER NIAH reportadas por el autor, para verificar o extender sus resultados.
- Estudio de circuitos de recuperacion: analisis de que componentes del estado hebbiano retienen que tipo de informacion, mediante ablaciones sobre la dimension de caracteristica y sobre la inicializacion.
- Linea base en barridos de ancho de estado: usar este checkpoint de 512 dimensiones como referencia frente a otras variantes del mismo barrido para medir el efecto del ancho de estado en la retencion a distancia.
- Investigacion sobre alternativas a la atencion softmax: comparar coste y capacidad de recuperacion frente a mecanismos de atencion cuadratica en secuencias largas, aprovechando la naturaleza lineal del mezclador.
- Validacion de mecanismos de memoria asociativa: prototipar variantes de actualizacion hebbiana en linea y comprobar su efecto sobre tareas de recuperacion concretas antes de escalar el modelo.
- Experimentacion docente o de laboratorio: por su tamano, permite ejecutar entrenamiento, evaluacion y depuracion completos en una unica GPU de consumo o incluso en CPU en modo inferencia.
- Analisis de retencion controlada por distancia: estudiar la degradacion de la recuperacion en funcion de la separacion entre la clave y la consulta, un experimento reproducible con recursos modestos.
- Preentrenamiento continuo o ajuste fino de investigacion: partir de estos pesos para explorar variantes de preentrenamiento, siempre que la situacion legal de la licencia se resuelva antes de cualquier uso mas alla del experimental.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica unicamente que el modelo forma parte de un barrido evaluado en las siguientes suites, sin cifras asociadas.

| Evaluacion | Resultado publicado |
|---|---|
| FDA | No disponible |
| SWDE | No disponible |
| SQuAD | No disponible |
| RULER NIAH | No disponible |
| Barrido de retencion controlado por distancia | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de entrenamiento (fp32) los pesos ocupan aproximadamente 0,48 GB; en fp16 o bf16, unos 0,24 GB; en int8, unos 0,12 GB. A estas cifras hay que sumar el coste de activaciones y del estado recurrente, cuyo tamano depende del ancho de estado (512) y de la longitud de secuencia, que no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. No requiere aceleradores de gama alta.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU recientes para inferencia en precision reducida; la inferencia en CPU tambien es factible por el tamano reducido.
- Opciones de despliegue: el formato `.ckpt` y la arquitectura personalizada implican que la carga se realiza mediante la libreria `recurrent-recall-circuits` y PyTorch. No hay evidencia de soporte en vLLM, llama.cpp, Ollama, TGI o formatos GGUF; tampoco se han publicado conversiones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos publicados para este modelo ni informacion sobre su longitud de contexto o licencia, por lo que la comparacion se limita a caracteristicas estructurales de modelos densos de tamano equivalente. Los datos de los modelos de referencia proceden de sus fichas publicas y deben verificarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hebbian-120m-featdim512-fast-20k | Aproximadamente 120 M | No disponible | No disponible | HuggingFace, libreria propia, 0 descargas |
| GPT-2 (124 M) | 124 M | 1024 tokens | Licencia MIT modificada | Ampliamente disponible y soportado en multiples runtimes |
| Pythia-160M | 160 M | 2048 tokens | Apache 2.0 | HuggingFace, soporte en transformers |
| Mezcladores lineales de investigacion de tamano similar | No disponible | No disponible | No disponible | No disponible |

La diferencia principal frente a las alternativas es cualitativa: este checkpoint no persigue un rendimiento general competitivo, sino servir de artefacto reproducible para estudiar recuperacion en contexto y ancho de estado en un mezclador lineal hebbiano.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso, lo que en la practica bloquea cualquier explotacion comercial y dificulta incluso la redistribucion.
- Modelo base sin alineacion: no sigue instrucciones, no tiene formato de chat y no incorpora ajuste por preferencias (RLHF o DPO), por lo que no es apto como asistente.
- Presupuesto de entrenamiento muy corto: 20 000 pasos sobre Pile es un regimen de preentrenamiento minimo, con calidad de generacion limitada y posible degradacion gramatical.
- Riesgo de alucinacion elevado: por tamano y por volumen de entrenamiento, la generacion libre de hechos no es fiable en ningun escenario.
- Sesgos conocidos: no se documenta ningun analisis de sesgo; el Pile procede en gran medida de texto web, con los sesgos que ello implica.
- Idiomas no documentados: no se especifica el reparto linguistico ni se han publicado evaluaciones multilingues.
- Trazabilidad incompleta: no se publican tokenizador, longitud de contexto, numero de tokens de entrenamiento ni hiperparametros, lo que complica la reproduccion fiel.
- Empaquetado incompleto: el checkpoint no incluye estado del optimizador y el repositorio no incorpora codigo de evaluacion, solo el archivo de pesos.
- Sin validacion de la comunidad: 0 descargas y 0 likes, ademas de ausencia de resultados numericos publicados, implican que su comportamiento no ha sido contrastado por terceros.
- Compatibilidad limitada: no es cargable en los runtimes de inferencia habituales, lo que anade trabajo de integracion antes de cualquier prueba.
- No apto para produccion sin una evaluacion exhaustiva previa, incluso en el caso de que la licencia se aclarase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgarct/hebbian-120m-featdim512-fast-20k
- Libreria declarada en la model card: `recurrent-recall-circuits` (sin URL publica en la informacion disponible)
- Paper, blog, repositorio o demo asociados: no disponibles
- Resultados de la busqueda web: los enlaces recuperados no guardan relacion con el modelo (contenido sobre la plataforma Bilibili), por lo que no se incluyen como referencias validas.
- Perfil del autor en HuggingFace: https://huggingface.co/robgarct
