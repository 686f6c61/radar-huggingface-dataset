# dhanesh-hf/Jarvis-Titan-M4-Calibrated-Adapter

## Resumen

El repositorio dhanesh-hf/Jarvis-Titan-M4-Calibrated-Adapter contiene un adaptador calibrado (Milestone M4) para el modelo J.A.R.V.I.S. Titan 14.8B MoE, una arquitectura de tipo DeepSeekMoE con 1 experto compartido y 8 expertos enrutados, de los que se activan 2 por token (Top-2). El artefacto es un adaptador pequeno (0,2 GB en el repositorio) que se aplica sobre un modelo base de 14.800 millones de parametros; no es un modelo autonomo y no puede ejecutarse sin dicho modelo base.

La propuesta tecnica combina tres elementos: una memoria neural recurrente inspirada en Google Titans fusionada en el flujo residual del modelo base, un enrutador de expertos recalibrado (recentrado de logits y regularizacion anti-inanicion de puertas) y un ajuste supervisado orientado a recuperacion dificil (needle-in-a-haystack y razonamiento multi-salto entre entidades) en profundidades de contexto de 8K a 128K tokens. El autor indica que se construyo con kernels Pallas sobre Cloud TPU v5e-8.

El interes del repositorio es experimental: sirve como ejemplo de integracion de memorias externas diferenciables y de calibracion de enrutado en MoE. Conviene tratarlo con cautela, porque no tiene descargas ni likes, no publica benchmarks y no declara los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeekMoE (1 experto compartido + 8 expertos enrutados, Top-2) con memoria neural Titans tri-brid y fusion residual MAG |
| Parametros totales | 14,8B en el modelo base; el adaptador ocupa 0,2 GB |
| Parametros activos | Top-2 de 8 expertos enrutados mas 1 experto compartido; recuento exacto no disponible |
| Longitud de contexto | Entrenamiento SFT declarado entre 8K y 128K tokens; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el estado de memoria recurrente se almacena en bfloat16 nativo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 0,2 GB, formato no especificado en la informacion disponible) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es DeepSeekMoE con enrutado Top-2 sobre 8 expertos mas un experto compartido. Sobre esa base, el adaptador M4 introduce una memoria neural de tipo Google Titans con fusion residual completa: la salida se compone como h_out = h + g_res·y_res + g_mem·y_mem, de modo que se preserva el flujo residual original y se anade la contribucion de memoria. El enrutador se recalibra con un sesgo b_gate = [0.8, 0.0, -0.2] para recentrar los logits y evitar el agotamiento del gradiente del softmax, apuntando a una distribucion activa tri-brid aproximada de L: 55%, R: 25% y M: 20%. Ademas se aplica una regularizacion anti-inanicion de puertas con suelo activo del 15%, guia de distribucion objetivo y bonus de diversidad de maxima entropia.

La memoria recurrente en tiempo de prueba esta acotada: el estado se almacena en bfloat16 nativo, con limitacion de norma de Frobenius (||M||_F <= 50,0) y tasa de aprendizaje calibrada de 1e-3, con el objetivo declarado de evitar desbordamiento y valores NaN. El ajuste supervisado se denomino Hard-Retrieval SFT y da un 65% de prioridad a tareas de needle-in-a-haystack y razonamiento multi-salto entre entidades en profundidades de 8K a 128K. La aceleracion se realizo con kernels Pallas TPU VMEM para la recurrencia en SRAM de chip sobre Cloud TPU v5e-8. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva (pipeline declarado: text-generation).
- Recuperacion de informacion en contextos largos: entrenamiento especifico en needle-in-a-haystack con profundidades de 8K a 128K tokens.
- Razonamiento multi-salto entre entidades, segun el foco declarado del Hard-Retrieval SFT.
- Memoria neural recurrente acotada en tiempo de prueba, disenada para mantener estado entre pasos sin desbordamiento.
- Enrutado de expertos calibrado, con control explicito de la distribucion de activacion entre los componentes L, R y M.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el multi-salto declarado es de recuperacion, no de planificacion).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; la unica capacidad especial declarada es la memoria neural Titans.

## Casos de uso

- Analisis de documentacion extensa: el modelo esta ajustado para recuperar agujas en henos de hasta 128K tokens, por lo que encaja en revision de contratos, informes anuales o expedientes largos donde la respuesta depende de un dato concreto enterrado en el texto.
- Razonamiento sobre grafos de entidades: el entrenamiento multi-salto entre entidades permite encadenar relaciones (por ejemplo, persona -> filial -> contrato -> jurisdiccion) en tareas de inteligencia competitiva o compliance.
- Asistentes de investigacion sobre corpus cientifico: con contexto de 8K-128K, se puede cargar un conjunto de articulos y responder preguntas que requieren cruzar hallazgos de varios documentos.
- Pipelines de RAG con contexto largo: como complemento de un recuperador, el modelo puede reordenar y sintetizar evidencias recuperadas sin perder el hilo en ventanas grandes.
- Analisis de trazas y logs: la recuperacion en contexto largo es util para localizar el evento causal en ficheros de log extensos o cadenas de trazas distribuidas.
- Reescritura y resumen de conversaciones multi-turno largas: la memoria recurrente acotada esta pensada para mantener estado sin crecer sin control, lo que ayuda en sesiones prolongadas.
- Prototipado de investigacion en memorias diferenciables: el adaptador sirve como banco de pruebas para estudiar fusion residual, calibracion de enrutadores y recurrencia acotada, no como modelo de produccion listo para usar.

En todos los casos hay que tener presente que el adaptador necesita el modelo base J.A.R.V.I.S. Titan 14.8B MoE para funcionar; sin el, el repositorio por si solo no genera texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, RULER ni ninguna otra metrica, y no hay datos de latencia o throughput.

## Requisitos de hardware

- Adaptador: 0,2 GB de almacenamiento; requiere el modelo base de 14,8B para inferencia.
- VRAM estimada para el modelo base: aproximadamente 29,6 GB en FP16, en torno a 14,8 GB en int8 y entre 7,4 y 8 GB en 4 bits (estimaciones calculadas a partir del recuento de parametros, no datos publicados; en MoE todos los expertos deben residir en memoria aunque solo se activen dos por token).
- GPU recomendadas: H100 80 GB y A100 80 GB para FP16 sin cuantizar; A100 40 GB con cuantizacion; RTX 4090 24 GB solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, previsiblemente, en RTX 4090, RTX 3090 o similares de 24 GB usando cuantizacion de 4 bits; el soporte real depende de que los frameworks reconozcan la arquitectura.
- Despliegue: el autor cita TPU (Cloud TPU v5e-8) para el entrenamiento con kernels Pallas; no se declara compatibilidad con vLLM, TGI, llama.cpp, Ollama ni transformers. Dado que la arquitectura incorpora memoria Titans y kernels Pallas especificos de TPU, el soporte en estos frameworks no esta garantizado y seria necesario verificar la implementacion del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion siguiente usa datos publicos de modelos MoE de la misma franja de tamano. El modelo analizado no publica benchmarks, por lo que la columna de rendimiento es "no disponible" y no se puede establecer una jerarquia real.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Jarvis-Titan-M4-Calibrated-Adapter | 14,8B (base) + adaptador de 0,2 GB | Top-2 de 8 + 1 compartido (recuento no disponible) | 8K-128K (SFT) | Apache 2.0 | No disponibles |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K (ampliable a 128K) | Licencia propia de DeepSeek con uso comercial | Publicados por el autor |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Publicados por el autor |

Datos de DeepSeek-V2-Lite y Mixtral 8x7B procedentes de informacion publica de sus respectivas fichas, no de la informacion facilitada en esta busqueda.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: sin el modelo base J.A.R.V.I.S. Titan 14.8B MoE no puede ejecutarse, y ese modelo base no aparece documentado en la informacion disponible.
- No hay benchmarks publicados, por lo que no existe evidencia cuantitativa de rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes: no hay validacion independiente de la comunidad.
- No se declaran los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- No se declara compatibilidad con frameworks de inferencia habituales; los kernels Pallas TPU estan atados a hardware TPU y pueden no funcionar en GPU.
- Riesgo de alucinacion inherente a todo modelo generativo; el ajuste en recuperacion dificil no elimina este riesgo en tareas abiertas.
- Las tecnicas declaradas (recentrado de logits del enrutador, suelo de activacion del 15%, acotacion de la norma de Frobenius) se presentan sin experimentos de ablacion, por lo que no puede evaluarse su contribucion real.
- Licencia Apache 2.0 en el repositorio: permite uso comercial del adaptador, pero hay que verificar la licencia del modelo base, que no se especifica.
- La fecha de publicacion del repositorio es septiembre de 2026 y no hay historial de mantenimiento ni versiones posteriores.
- Para produccion seria imprescindible reproducir evaluaciones propias de calidad, latencia y coste antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-Calibrated-Adapter
- Paper de Google Titans (memoria neural referenciada en la model card): no disponible en la informacion proporcionada
- Documentacion de Pallas / Cloud TPU: no disponible en la informacion proporcionada
- Repositorio del modelo base J.A.R.V.I.S. Titan 14.8B MoE: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos versaban sobre prestaciones por desempleo en Taiwan y no guardan relacion).
