# kolmann1231/pi0-robosyn-pipette-24k

# pi0 robosyn pipette 24k (RoboSynChallenge)

## Resumen

`kolmann1231/pi0-robosyn-pipette-24k` es una política robótica π0 (familia openpi, implementada en JAX) publicada por el usuario kolmann1231 y obtenida mediante un fine-tune con LoRA sobre el checkpoint `pi0_base` de openpi. El ajuste se realizó sobre el conjunto de datos `RoboSynChallenge/cobotmagic_Sim_manipulate_pipette` en formato LeRobot v2.1, y corresponde al paso 24000 de entrenamiento (etiqueta de directorio 23999, configuración `pi0_pipette_lora_b2`). El modelo base contiene componentes PaliGemma/Gemma, por lo que la distribución queda sujeta a las condiciones de uso de Gemma.

El problema que aborda es muy concreto: controlar un brazo dual CobotMagic dentro del simulador del RoboSynChallenge para ejecutar la tarea de manipulación de una pipeta. No es un modelo de lenguaje general ni un sistema multimodal de propósito amplio, sino una política viso-motora especializada, entrenada y evaluada exclusivamente en simulación y en una única tarea. El repositorio ocupa 6,2 GB y se distribuye como checkpoint de parámetros de openpi (16 archivos), no como safetensors ni GGUF.

Su relevancia actual es metodológica y de investigación más que de producto. La propia model card se marca explícitamente como borrador no publicado (`DRAFT model card -- not published`), con campos TODO pendientes de cerrar, y advierte que el checkpoint nunca ha superado una prueba independiente frente a la línea base oficial. La ventaja medida sobre el checkpoint oficial en un pool de desarrollo de 50 escenas fue de +6 éxitos (p = 0,263, intervalo de confianza del 95 % de −5,1 a +28,1), es decir, un intervalo que incluye el cero. El autor lo describe como un riesgo deliberado y documentado dentro de su envío a la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política π0 (openpi) basada en transformer viso-lenguaje-acción con componentes PaliGemma/Gemma; fine-tune LoRA (`gemma_2b_lora` + `gemma_300m_lora`) sobre `pi0_base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de entrada es el texto de tarea del propio dataset) |
| Licencia | other (a los componentes Gemma les aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy) |
| Formato de pesos | Checkpoint JAX/Flax de openpi; manifiesto de 16 archivos de parámetros (no safetensors, no GGUF) |
| Configuracion de openpi | `pi0_pipette_lora_b2` |
| Checkpoint | paso 24000 (etiqueta de directorio 23999) |
| Dataset de entrenamiento | `RoboSynChallenge/cobotmagic_Sim_manipulate_pipette` (LeRobot v2.1) |
| Tamaño del repositorio | 6,2 GB |
| Tarea | manipulación de pipeta con brazo dual CobotMagic (simulación) |
| Hash del manifiesto de parametros | `9432c20843b032001d1fce3d39b725b7740ce7c710c62acbaacd036aa3cb09ca` (16 archivos) |
| Hash de estadisticas de normalizacion | `fe2ed9099ddd29b8b37b69af0c2ce3304bbda7636a7032c2046bad9ef8d500be` |
| Registro de guardado de entrenamiento | `RESEARCH_SAVE label=23999 step=24000 opt_state=7ed24d345c530a47` |

## Arquitectura y entrenamiento

La arquitectura subyacente es π0 en su implementación openpi sobre JAX. Se trata de una política viso-lenguaje-acción que combina un backbone de visión-lenguaje de la familia PaliGemma/Gemma con un experto de acción; en este caso concreto el ajuste se aplica mediante dos adaptadores LoRA etiquetados `gemma_2b_lora` y `gemma_300m_lora`, lo que apunta a un backbone de aproximadamente 2B de parámetros y a un experto de acción en el entorno de los 300M. El número total de parámetros y la longitud de contexto no se declaran en la información disponible. La decodificación produce acciones con un desplazamiento (`action offset`) de +1, y el modelo se consume a través del adaptador `policy/smolvla_multitask` con `backend: pi0`, servido desde el entorno de `policy/pi05` del repositorio del reto.

El entrenamiento consistió en un fine-tune de 16000 pasos con schedule coseno, calentamiento de 1000 pasos, pico de 2,5e-5 y decaimiento a lo largo de 30000 pasos hasta 2,5e-6, optimizador AdamW, batch de 32 y semilla 42. Posteriormente se continuó desde el paso 16000 hasta el 24000 mediante `--resume`, sobre los mismos datos, el mismo schedule (aproximadamente 1,314e-5 en el paso 16000 y 4,79e-6 en el 24000), el mismo sampler y la misma semilla, sin cambios de datos, hiperparámetros ni objetivo. No se documenta en la información disponible el número de tokens o episodios vistos, la composición del dataset ni ninguna fase de RLHF o DPO, que en cualquier caso no resultan habituales en este tipo de políticas. El prompt de entrada es el texto de tarea del propio dataset.

## Capacidades

- Generación de secuencias de acciones para control robótico de un brazo dual CobotMagic en el simulador EmbodiChain, con salida de acciones desplazadas en +1.
- Ejecución de una única tarea de manipulación: manipulación de pipeta (`manipulate_pipette`).
- Condicionamiento por instrucción textual: el modelo consume el texto de tarea del dataset como prompt.
- Ajuste eficiente mediante LoRA sobre `pi0_base`, lo que permite reproducir el procedimiento con recursos reducidos en comparación con un fine-tune completo.
- Integración con el ecosistema LeRobot v2.1 y con el adaptador `policy/smolvla_multitask` (`backend: pi0`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión general, audio ni modos de pensamiento (`thinking mode`); la percepción visual está integrada únicamente como entrada de la política.

## Casos de uso

- Comparación de líneas base en investigación en robótica: sirve como punto de referencia adicional frente al checkpoint oficial SmolVLA en el pool de desarrollo del RoboSynChallenge, siempre que se documenten las advertencias estadísticas de la propia model card (α = 0,05 por comparación, sin corrección entre tareas).
- Estudio de recetas de fine-tune con LoRA sobre π0: el modelo documenta de forma explícita el schedule, el optimizador, el batch, la semilla y la continuación con `--resume` desde el paso 16000, lo que lo convierte en un caso reproducible para analizar el efecto de extender el entrenamiento sin cambiar datos ni hiperparámetros.
- Validación de integración del stack openpi y LeRobot: útil para comprobar el adaptador `policy/smolvla_multitask` con `backend: pi0` y el servidor de políticas del entorno `policy/pi05` en un despliegue de simulación.
- Punto de partida para experimentos de sim-to-real: el checkpoint puede emplearse como inicialización en estudios que exploren transferencia al mundo real, asumiendo que solo se ha entrenado y evaluado en simulación y en una tarea.
- Desarrollo de arneses de evaluación en simulación: la model card detalla pools de 50 escenas (B4 y B8), reglas de congelación previa y pruebas exactas de McNemar, lo que resulta aprovechable para construir protocolos de evaluación reproducibles.
- Auditoría de licencias en modelos derivados de Gemma: el repositorio incluye `GEMMA_TERMS_OF_USE.txt` y `NOTICE`, y plantea preguntas abiertas sobre la licencia de los datos de entrenamiento y de los pesos de `pi0_base`, lo que lo hace útil como caso de estudio de cumplimiento.
- Reproducción y análisis de variabilidad numérica: dado que se observan diferencias a nivel de bf16 entre procesos, puede utilizarse para medir la no determinación bit a bit de la inferencia en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son evaluaciones internas en simulador, sobre pools de desarrollo, y el propio autor advierte que no constituyen una prueba independiente ni permiten afirmar superioridad sobre la línea base oficial.

| Evaluación | Modelo evaluado | Pool | Resultado | Comparación | Significación |
|---|---|---|---|---|---|
| Primera ronda (16k) | π0 16k (mismo linaje) | B4, 50 escenas de desarrollo | 26/50 | +4 frente a SmolVLA oficial de entrega (22/50) | no reportado; la ventaja se consideró insuficiente y no pasó a prueba independiente |
| Segunda ronda (24k) | π0 24k (este checkpoint) | B8, 50 escenas de desarrollo congeladas antes de la ejecución, sin solapamiento previo | 31/50 | +6 frente a SmolVLA oficial (25/50); +12,0 puntos | IC 95 % de Newcombe: −5,1 a +28,1; McNemar exacto p = 0,263 |
| Segunda ronda (24k) | π0 24k (este checkpoint) | B8 (las mismas escenas) | 31/50 | +4 frente al π0 16k propio (27/50); +8,0 puntos | p = 0,481 |

Advertencias publicadas por el autor: cada comparación usó α = 0,05 de forma individual y sin corrección entre tareas, por lo que el conjunto de resultados no debe leerse como una tasa global de falsos positivos del 5 %. Además, ambos sistemas son pipelines completos con ejecución de acciones distinta, de modo que ninguna diferencia puede atribuirse únicamente al modelo base. Estas evaluaciones son del autor, no de los organizadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- Los adaptadores LoRA sobre `pi0_base` reducen la huella de entrenamiento respecto a un fine-tune completo, pero el repositorio distribuido ocupa 6,2 GB, correspondiente al checkpoint de parámetros de openpi.
- GPU recomendadas: no disponibles de forma explícita. Como referencia del mismo linaje arquitectónico, el checkpoint de otra tarea (drawer) se ejecutó en una RTX 4080 SUPER, con una primera llamada de 74,7 s incluyendo la compilación de JAX y llamadas posteriores de aproximadamente 0,15 s.
- Encaje en GPU de consumo: no confirmado para este checkpoint concreto; el único dato disponible es la ejecución de un checkpoint de la misma arquitectura en una RTX 4080 SUPER (16 GB).
- Opciones de despliegue documentadas: servidor de políticas de openpi sobre JAX, consumido mediante el adaptador `policy/smolvla_multitask` con `backend: pi0`, dentro del entorno de `policy/pi05` del repositorio del reto. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: la model card marca la medición de latencia de inferencia y arranque en frío como TODO para este adaptador de entrega; los valores de 74,7 s y 0,15 s corresponden a otro checkpoint de la misma arquitectura, no a este.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en el pool B8 (50 escenas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi0 robosyn pipette 24k (este modelo) | Política π0 con LoRA (openpi, JAX) | no disponible | no disponible | 31/50 | other, sujeta a Gemma Terms of Use | Repositorio de 6,2 GB; model card marcada como borrador no publicado |
| SmolVLA oficial de entrega (línea base del reto) | Política de la familia SmolVLA | no disponible | no disponible | 25/50 | no disponible | Checkpoint oficial del reto, según la model card |
| π0 16k (checkpoint propio del mismo linaje) | Política π0 con LoRA, paso 16000 | no disponible | no disponible | 27/50 | no disponible | No referenciado como repositorio independiente |
| `pi0_base` (openpi, Physical Intelligence) | Política π0 base, sin ajustar | no disponible | no disponible | no disponible | no disponible (la model card lo marca como TODO) | Distribuido por Physical Intelligence dentro de openpi |

Las diferencias de rendimiento entre las tres primeras filas no son estadísticamente concluyentes según los propios datos del autor: el intervalo de confianza de la comparación principal incluye el cero, y las comparaciones emplean pipelines completos con ejecución de acciones distinta.

## Limitaciones y advertencias

- Model card en estado de borrador no publicado, con campos marcados como TODO sin cerrar (licencia final, licencias de las entradas, latencia de inferencia).
- Solo simulación: el modelo se entrenó y evaluó en el simulador del RoboSynChallenge, sobre una única tarea.
- Nunca validado de forma independiente frente a la línea base oficial. En el pool de desarrollo, el checkpoint oficial ya resolvía la mitad de las escenas (25/50) y el intervalo de confianza de la ventaja medida incluye el cero, por lo que este checkpoint podría no ser mejor que el oficial en escenas nuevas.
- No se dispone de datos de rendimiento en benchmarks estándar ni de métricas fuera del simulador.
- Reproducibilidad limitada: las salidas en GPU no son idénticas bit a bit entre procesos, con diferencias observadas a nivel de bf16.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto libre; el equivalente aquí es la ejecución de acciones incorrectas o fuera de distribución, sin mecanismo de verificación documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no disponibles; el prompt es el texto de tarea del dataset, por lo que no hay evidencia de generalización a instrucciones en otros idiomas o formulaciones distintas.
- Restricciones de licencia: la licencia es `other`; los componentes Gemma están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy (sección 3.2 de los términos). Quien redistribuya el modelo o un derivado debe transmitir esas restricciones, incluir una copia de los Gemma Terms of Use y el archivo `NOTICE`, y marcar los archivos modificados como modificados.
- Licencias de las entradas sin resolver: el dataset de entrenamiento no tiene etiqueta de licencia en Hugging Face y los términos de los pesos derivados no están confirmados; la licencia de los pesos de `pi0_base` de Physical Intelligence figura como TODO.
- El tokenizador de PaliGemma (`big_vision/paligemma_tokenizer.model`) no se incluye en el repositorio: el adaptador lo descarga desde la fuente original y solo lo usa si su sha256 coincide con el valor esperado (el hash aparece truncado en la información disponible).
- Advertencia estadística: comparaciones con α = 0,05 sin corrección entre tareas; no debe interpretarse como una tasa global de falsos positivos del 5 %.
- Atribución limitada: al tratarse de pipelines completos con ejecución de acciones distinta, ninguna diferencia de rendimiento puede atribuirse al modelo base por sí solo.
- El modelo se distribuye con 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kolmann1231/pi0-robosyn-pipette-24k
- Dataset de entrenamiento: `RoboSynChallenge/cobotmagic_Sim_manipulate_pipette` en Hugging Face (LeRobot v2.1)
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Origen del tokenizador de PaliGemma: https://storage.googleapis.com/big_vision
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas sobre pesca en el Étang de l'Or (Hérault, Francia) y no guardan relación con esta ficha.
