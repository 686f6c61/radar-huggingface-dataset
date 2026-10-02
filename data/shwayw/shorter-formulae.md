# ShwayW/shorter-formulae

## Resumen

Shorter Formulae es un conjunto de seis checkpoints de transformers entrenados para regresión simbólica: dado un conjunto de pares entrada/salida numéricos, el modelo produce una fórmula matemática expresada en notación polaca. Lo desarrolla el usuario ShwayW y se publica bajo licencia MIT en HuggingFace, con un tamano de repositorio de 5,5 GB que agrupa los seis modelos. No es un modelo de lenguaje conversacional: es un modelo especializado de descubrimiento de ecuaciones (*equation discovery*), y su salida se refina después con BFGS en tiempo de inferencia para ajustar las constantes numéricas.

El repositorio contiene el modelo principal de 145M de parámetros, el mismo modelo antes del ajuste fino sobre objetivos con ruido, y cuatro modelos de ablación de 89M de parámetros que aíslan el efecto de dos decisiones de diseño: la transformación afín previa (*prefac*) y la simplificación de los objetivos a forma canónica (*simp*). Los modelos de ablación se entrenaron desde cero con hasta 120M de instancias de datos.

La relevancia de esta publicacion es doble: por un lado, ofrece pesos abiertos de un método neuronal de regresión simbólica evaluable sobre SRBench (Feynman) y LLM-SRBench; por otro, la estructura de ablaciones permite reproducir el análisis del efecto de cada componente. El paper asociado aún no está disponible en arXiv, por lo que no hay resultados de benchmarks publicados en el momento de redactar esta ficha. El modelo tiene 0 descargas y 0 likes, y se creó y actualizó el 2 de octubre de 2026, lo que indica una publicacion muy reciente y sin adopción registrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder de conjuntos entrada/salida a fórmula en notación polaca) |
| Parametros totales | 145M (modelo principal y versión pre-fine-tuning) y 89M (cada una de las cuatro ablaciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo de texto; la entrada es un conjunto de pares entrada/salida y no se especifica el límite de pares) |
| Tipos de cuantizacion | No disponible (se publican checkpoints PyTorch `.pth` sin versiones cuantizadas) |
| Idiomas soportados | No disponible (la salida son expresiones matemáticas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`fixed_weights.pth` en los dos modelos de 145M; `model_fixed_Van_checkpoint.pth` en las cuatro ablaciones) |

## Arquitectura y entrenamiento

La arquitectura es un transformer que toma como entrada un conjunto de pares entrada/salida y genera una fórmula en notación polaca. La nomenclatura de las carpetas documenta dos decisiones de diseño adicionales: la transformación afín previa (*prefac*) sobre las variables de entrada y la simplificación de los objetivos a forma canónica (*simp1*). Los modelos de 145M se denominan además `float`, lo que indica que las constantes no están restringidas al conjunto simbólico. La longitud máxima de fórmula es de 80 tokens en el modelo principal, según el nombre de carpeta `145M_80_simp1_float_ftnoise_48h_res`. Las cuatro ablaciones de 89M (`prefac_on_t120M`, `prefac_on_nosimp_t120M`, `prefac_off_t120M` y `simp_off_t120M`) se entrenaron desde cero con hasta 120M de instancias de datos.

El ajuste fino del modelo principal se realizo durante 48 horas sobre objetivos corrompidos con ruido, con una distribucion ε ~ U(0, 0,1) y la mitad de las fórmulas libres de ruido, con un learning rate máximo de 5e-5. La versión `145M_80_simp1_float_res` es el punto de partida de ese ajuste, lo que permite medir de forma aislada el efecto del entrenamiento con ruido. En inferencia, las constantes de la fórmula generada se refinan con BFGS, un paso de optimizacion numerica que no forma parte del transformer. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el número total de tokens ni si se emplearon técnicas de RLHF o DPO, que en este dominio no resultan de aplicación habitual.

## Capacidades

- Regresión simbólica: mapea conjuntos de pares entrada/salida a una fórmula matemática en notación polaca.
- Generacion de expresiones con longitud de hasta 80 tokens en el modelo principal de 145M.
- Manejo de constantes de tipo flotante no restringidas al conjunto simbólico (variantes `float`).
- Refinamiento numérico de constantes mediante BFGS en tiempo de inferencia.
- Robustez frente a ruido en los objetivos gracias al ajuste fino de 48 horas con ε ~ U(0, 0,1).
- Recuperación de estructuras simbólicas con transformación afín previa de las entradas (*prefac*).
- Evaluacion sobre los benchmarks SRBench (Feynman) y LLM-SRBench a través del script `eval_mymodels.py`.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingues, de visión ni de audio.
- No dispone de modo de pensamiento (*thinking mode*) ni de generacion de texto libre.

## Casos de uso

- Descubrimiento de leyes físicas a partir de datos experimentales: el modelo se evalua específicamente sobre el conjunto Feynman de SRBench, de modo que su uso natural es recuperar expresiones cerradas a partir de mediciones de laboratorio, con el refinamiento BFGS ajustando las constantes a la escala real de los datos.
- Sustitucion de simuladores costosos: a partir de pares de parámetros de entrada y salidas de una simulación numérica, el modelo produce una fórmula evaluable que actúa como modelo subrogado ligero, útil cuando ejecutar el simulador original es inviable en produccion.
- Analisis de datos con ruido de medida: la variante `ftnoise` se entreno con objetivos corrompidos con ε ~ U(0, 0,1), por lo que es la opción indicada cuando los datos provienen de sensores o de experimentos con error de medición apreciable.
- Ingenieria de caracteristicas interpretables: las fórmulas generadas pueden incorporarse como variables derivadas en un pipeline de aprendizaje automático clásico, manteniendo trazabilidad sobre qué combinación de entradas las origina.
- Modelizacion empírica en ingenieria: obtencion de correlaciones cerradas entre variables de proceso (por ejemplo, ajustes de curvas de respuesta) que pueden auditarse e implementarse en un controlador sin depender de una caja negra.
- Investigacion en regresión simbólica: la publicacion de cuatro ablaciones de 89M con `prefac` y `simp` activados y desactivados permite reproducir el analisis de ablacion del paper y comparar el efecto de cada componente en igualdad de condiciones.
- Evaluacion comparativa de métodos: al ejecutarse sobre LLM-SRBench junto a otros métodos neuronales y evolutivos, sirve como linea base reproducible en estudios académicos de descubrimiento de ecuaciones.
- Educacion y divulgacion: la salida en notación polaca es directamente parseable, lo que facilita mostrar el proceso de ajuste de una ley matemática en materiales docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el paper aún no tiene preprint en arXiv y que la cita se añadirá cuando esté disponible. El repositorio únicamente documenta los comandos de evaluacion sobre SRBench (Feynman) y LLM-SRBench mediante `eval_mymodels.py`, pero no incluye cifras de ninguno de los dos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6 GB por modelo de 145M en precision fp32 (145M × 4 bytes), y unos 0,36 GB por cada ablacion de 89M. En fp16 las cifras se reducen aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo es lo bastante pequeno como para no requerir hardware de centro de datos.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia es viable en CPU dado el tamano de los pesos; el cuello de botella real es el refinamiento BFGS de constantes, que se ejecuta de forma iterativa y puede dominar el tiempo total por instancia.
- Opciones de despliegue: PyTorch con el script `eval_mymodels.py` del repositorio de código asociado. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generacion de texto autoregresivo.
- Latencia y throughput: no disponibles. Dependen del número de pares entrada/salida por problema, del número de iteraciones de BFGS y del número de candidatos evaluados, ninguno de los cuales se especifica en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 5,5 GB; es posible descargar un único modelo con el parametro `--include` de `hf download`.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas, por lo que la comparacion se limita a categorias metodologicas y los campos numericos se marcan como no disponibles.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shorter Formulae (145M) | Transformer set-to-formula + refinamiento BFGS | 145M (y ablaciones de 89M) | No disponible | MIT | Pesos abiertos en HuggingFace |
| Regresion simbolica evolutiva (por ejemplo, PySR) | Busqueda evolutiva sobre expresiones | No aplica | No aplica | Variable segun implementacion | Software, no pesos de red |
| Regresion simbolica neuronal previa (por ejemplo, NeSymReS) | Transformer set-to-formula | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Deep Symbolistic Regression (DSR) | RL sobre politicas generadoras de expresiones | No aplica | No aplica | No disponible | Codigo publico, no pesos |

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay cifras verificables de SRBench ni de LLM-SRBench en la model card, por lo que no puede afirmarse nada sobre su precision relativa frente a alternativas.
- Paper no disponible: la cita académica está pendiente de la publicacion del preprint en arXiv, lo que limita la verificabilidad del método y de los resultados.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, con una fecha de creacion y actualizacion de apenas minutos de diferencia; no hay evidencia de uso en produccion.
- Ambito restringido: solo resuelve regresión simbólica sobre pares entrada/salida numericos; no genera texto, no sigue instrucciones y no soporta conversacion.
- Limite de longitud de fórmula: el modelo principal trabaja con fórmulas de hasta 80 tokens, lo que acota la complejidad de las expresiones recuperables.
- Riesgo de alucinacion en el sentido de fórmulas que ajustan los datos de entrenamiento pero no generalizan; no se documentan mecanismos de validacion ni umbrales de confianza en la model card.
- Sensibilidad al ruido: aunque existe una variante entrenada con ruido ε ~ U(0, 0,1), no se especifica su comportamiento fuera de ese rango ni con valores atipicos.
- Idiomas: no aplica, pero conviene subrayar que el modelo no procesa lenguaje natural en ningun idioma.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, siempre que se conserve el aviso de copyright; no se documentan restricciones adicionales sobre los datos de entrenamiento.
- Dependencia externa: la evaluacion requiere el repositorio de código del autor, que no se enlaza en la model card, y el refinamiento BFGS anade un coste computacional en CPU no cuantificado.
- Formato de pesos: los checkpoints `.pth` son diccionarios de PyTorch con `model_config`, `Van_state_dict` y, cuando se guardo, `vocab`; no hay versiones GGUF ni safetensors, lo que obliga a usar PyTorch para cargarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShwayW/shorter-formulae
- Repositorio de código con `eval_mymodels.py`: mencionado en la model card, enlace no disponible
- Preprint en arXiv: pendiente de publicacion, enlace no disponible
- Benchmark SRBench (conjunto Feynman): referenciado en la model card, enlace no disponible
- Benchmark LLM-SRBench: referenciado en la model card, enlace no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la regresión simbólica ni con el repositorio.
