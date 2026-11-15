# jackyk02/paint-simple-verifier-avg

## Resumen

Inkling-Small watercolor painter es un adaptador LoRA para el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario jackyk02 en Hugging Face. Su funcion es generar bocetos JavaScript usando la libreria p5.brush que producen pinturas de acuarela a partir de un prompt de texto. No se trata de un modelo de lenguaje generalista, sino de un adaptador especializado en una tarea creativa muy concreta: la sintesis de codigo creativo que renderiza imagenes artisticas.

El adaptador se ha entrenado mediante aprendizaje por refuerzo sobre la plataforma Tinker, utilizando recompensas generadas por un verificador LLM (LLM-as-a-Verifier). En concreto, se entrenaron tres adaptadores independientes con semillas distintas y se selecciono, para cada semilla, el checkpoint con mejor puntuacion en un conjunto de validacion de 250 pinturas evaluadas por DeepSeek-V4.1-Flash. Posteriormente, los tres adaptadores de rango 32 se combinaron en un unico adaptador de rango 96 cuyo update de pesos es exactamente la media de los tres updates originales.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de pipeline de RL con verificador LLM aplicado a generacion de codigo creativo; por otro, advierte de que el adaptador promediado no ha sido evaluado aun, por lo que su rendimiento real es desconocido. El repositorio ocupa 25,3 GB, un tamano considerable para un adaptador LoRA, lo que sugiere que los pesos se almacenan en precision alta o que el modelo base tiene un numero elevado de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo base `thinkingmachines/Inkling-Small`; rango efectivo 96 (tres adaptadores de rango 32 apilados) |
| Parametros totales | no disponible (depende del modelo base, no especificado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma estandar de PEFT LoRA: se congela el modelo base `thinkingmachines/Inkling-Small` y se entrenan matrices de baja dimension que modifican las proyecciones de atencion y/o feed-forward. En este caso, cada uno de los tres adaptadores originales tiene rango 32, y la fusion de los tres produce un adaptador de rango 96 cuya actualizacion de pesos es la media aritmetica exacta de las tres actualizaciones individuales. Esta tecnica de promediado de pesos (weight averaging) es habitual para reducir varianza entre semillas y mejorar la robustez del adaptador resultante.

El entrenamiento se realizo con aprendizaje por refuerzo en la plataforma Tinker. La funcion de recompensa no es un reward model clasico entrenado con preferencias humanas, sino un verificador LLM (DeepSeek-V4.1-Flash) que evalua la calidad de las 250 pinturas generadas en el conjunto de validacion. Para cada semilla se selecciono el checkpoint con mejor puntuacion held-out: semilla 0 en el paso 775 con 0,775; semilla 1 en el paso 695 con 0,745; semilla 2 en el paso 815 con 0,772. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset de prompts ni si hubo etapas de SFT previas al RL.

La innovacion tecnica destacable es el uso de un verificador LLM como senal de recompensa para una tarea de generacion de codigo creativo (p5.brush), lo que permite optimizar directamente la calidad visual percibida sin necesidad de un dataset de imagenes etiquetadas. El adaptador promediado, sin embargo, no ha sido evaluado, por lo que se desconoce si la media de pesos preserva o mejora las puntuaciones individuales.

## Capacidades

- Generacion de codigo JavaScript para la libreria p5.brush a partir de un prompt de texto descriptivo.
- Produccion de bocetos que renderizan pinturas de acuarela con parametros de pincel, capas y mezcla de color.
- Especializacion en una unica tarea creativa; no es un modelo generalista de texto, codigo o razonamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el entrenamiento parece orientado a prompts en ingles, pero no se confirma.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Generacion de arte procedural para prototipos: el adaptador produce codigo p5.brush listo para ejecutar en el navegador, lo que permite a disenadores iterar rapidamente sobre composiciones de acuarela sin escribir el codigo a mano.
- Educacion en codigo creativo: sirve como ejemplo didactico de como un adaptador LoRA puede transformar un LLM en un generador de sketches p5.js, util en talleres de programacion creativa.
- Investigacion en RL con verificador LLM: el pipeline documentado (tres semillas, seleccion por checkpoint, promediado de pesos) es replicable para estudiar la varianza de recompensas generadas por LLM en tareas visuales.
- Generacion de assets para juegos o ilustracion editorial: las pinturas de acuarela generadas pueden exportarse como SVG o canvas para su uso en mockups y prototipos de baja fidelidad.
- Benchmarking de weight averaging: el adaptador promediado permite comparar empiricamente si la media de tres LoRA de rango 32 supera a cada adaptador individual en tareas de codigo creativo.
- Prototipado de interfaces generativas: integrado en una app web que recibe un prompt del usuario y devuelve un sketch p5.brush ejecutable, sirve para validar experiencias de arte generativo sin infraestructura de difusion.

## Benchmarks y rendimiento

Los unicos datos disponibles son las puntuaciones held-out de cada semilla individual, evaluadas por DeepSeek-V4.1-Flash sobre 250 pinturas. No hay resultados del adaptador promediado ni comparaciones con otros modelos.

| Adaptador | Paso | Puntuacion held-out |
|---|---|---|
| Semilla 0 (rango 32) | 775 | 0,775 |
| Semilla 1 (rango 32) | 695 | 0,745 |
| Semilla 2 (rango 32) | 815 | 0,772 |
| Promediado (rango 96) | no disponible | no evaluado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable dado que el adaptador no es un modelo de lenguaje generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 25,3 GB, lo que sugiere que cargar el adaptador junto con el modelo base requiere al menos esa cantidad de memoria en precision completa, y bastante mas para el modelo base.
- GPU recomendadas: no disponibles; por el tamano del repositorio, se necesitarian GPUs de datacenter (A100 80 GB, H100) para cargar el conjunto completo en precision alta, salvo que se cuantice.
- Cabe en consumer GPU: no se puede confirmar; 25,3 GB supera la VRAM de una RTX 4090 (24 GB) solo para el adaptador, por lo que probablemente no cabe en consumer GPU sin cuantizacion agresiva o descarga parcial.
- Opciones de despliegue: PEFT sobre el modelo base con `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables para generacion de codigo p5.brush ni modelos de la misma categoria con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El adaptador promediado no ha sido evaluado; se desconoce si su rendimiento iguala, supera o degrada las puntuaciones de las semillas individuales.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; debe contactarse con el autor o asumir restricciones.
- El modelo base `thinkingmachines/Inkling-Small` tiene sus propias condiciones de uso, no documentadas en esta ficha.
- Es un adaptador altamente especializado: no sirve para tareas generales de texto, razonamiento o codigo fuera de p5.brush.
- Riesgo de alucinacion en el codigo generado: puede producir llamadas a funciones inexistentes de p5.brush o parametros invalidos.
- No hay informacion sobre sesgos, composicion del dataset de prompts ni cobertura idiomatica.
- El repositorio de 25,3 GB es pesado para un adaptador LoRA, lo que puede dificultar su despliegue en entornos con almacenamiento o ancho de banda limitados.
- El pipeline de evaluacion depende de DeepSeek-V4.1-Flash, un modelo externo; la reproducibilidad de las puntuaciones no esta garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/jackyk02/paint-simple-verifier-avg
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Plataforma Tinker: no disponible en la informacion proporcionada
- Paper o blog del metodo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
