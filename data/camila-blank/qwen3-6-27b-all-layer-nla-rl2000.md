# camila-blank/qwen3.6-27b-all-layer-nla-rl2000

## Resumen

El modelo `camila-blank/qwen3.6-27b-all-layer-nla-rl2000` es un autoencoder en lenguaje natural (NLA, *natural-language autoencoder*) construido sobre `Qwen/Qwen3.6-27B`. No es un modelo conversacional: es una herramienta de interpretabilidad que traduce las activaciones residuales del modelo base a texto legible y, a la inversa, reconstruye activaciones a partir de descripciones textuales. Cubre las 64 capas del decodificador (bloques 0 a 63), capturando la salida bruta de cada bloque sin normalizacion final.

El artefacto se compone de dos piezas entrenadas de forma conjunta: un verbalizador de activaciones (`av/`), implementado como un LoRA de rango 128 con rsLoRA sobre todas las capas lineales de Qwen3.6-27B, y un reconstructor de activaciones (`ar/`), que actua como critico durante el entrenamiento por refuerzo y se guarda como tronco completo de 64 bloques en bf16 mas una cabeza de valor compartida. El checkpoint corresponde al paso 2000 de RL (600 pasos de fase 1 y 1400 de fase 2), y el autor lo recomienda como version de referencia para lectura de activaciones.

Su relevancia es practica para investigacion en interpretabilidad mecanicista: permite inspeccionar en lenguaje natural lo que representa cada capa de un modelo de 27B, comparar capas entre si y auditar representaciones sin entrenar sondas especificas por tarea. El repositorio ocupa 58,8 GB, coherente con almacenar el tronco completo del reconstructor en bf16 junto con los adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder en lenguaje natural (NLA) sobre transformer decoder Qwen3.6-27B; verbalizador LoRA (r=128, rsLoRA, todas las capas lineales) + reconstructor de 64 bloques bf16 con cabeza de valor fp32 |
| Parametros totales | no disponible (el repositorio incluye el tronco completo del AR de 64 bloques y adaptadores LoRA; no se indica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 y fp32 segun componente; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`av/`, `av/reference/`, `ar/` con `value_head.safetensors`), mas `nla_meta.yaml` y `run_config.yaml` |

## Arquitectura y entrenamiento

El sistema se apoya en Qwen3.6-27B como sustrato. El verbalizador (AV) es un LoRA de rango 128 con rsLoRA aplicado a todas las capas lineales del modelo base; la activacion objetivo se inyecta, normalizada en magnitud, sumandola a la salida del bloque decodificador 1 en el token marcador `㈜`, y la plantilla de prompt indica la capa de origen (plantillas definidas en `nla_meta.yaml`, renderizadas con `enable_thinking=False`). El reconstructor (AR) es un tronco completo de 64 bloques en bf16, sin normalizacion final ni `lm_head`, acompanado de `value_head.safetensors`, una capa lineal compartida fp32 de 5120x5120 que predice la activacion de la capa etiquetada a partir del ultimo token de la plantilla `[Layer NN] Summary of the following text: <text>{explanation}</text> <summary>`.

Las activaciones se capturan en la salida bruta de cada bloque (sin norma), equivalentes a `output_hidden_states[L + 1]` de HuggingFace, tomadas en el ultimo token real de prefijos de texto web. El entrenamiento se realizo con un fork de EasyNLA para Qwen3.6 y una etiqueta de capa estilo O-lens. La receta replica la del modelo de 11 capas `camilablank/qwen3.6-27b-multilayer-nla-rl600`, ampliando el corpus de SFT para que cada una de las 64 capas reciba tanto dato como cada una de las 11 del modelo anterior. El RL consta de 600 pasos de fase 1 y 1400 de fase 2 con tasa de aprendizaje 5e-5 y critico entrenado sobre todos los rollouts; `av/reference/` conserva el AV de SFT (`iter_0017000`), usado como referencia KL durante el RL.

## Capacidades

- Verbalizacion de activaciones residuales a lenguaje natural en cualquiera de las 64 capas del decodificador (0 a 63).
- Reconstruccion de activaciones a partir de resumenes textuales mediante el reconstructor con cabeza de valor compartida.
- Etiquetado explicito de la capa de origen en el prompt, lo que permite comparar representaciones entre capas con la misma interfaz.
- Evaluacion de fidelidad mediante FVE (*fraction of variance explained*) frente a baselines de prediccion de la media por capa.
- Uso como critico co-entrenado para RL, con version congelada de referencia para medir degradacion.
- Compatible con la interfaz del NLA de 11 capas, sustituyendo la escalera 20:61:4 por cualquier capa individual.
- No soporta tool calling, agentes ni generacion conversacional: es una herramienta de analisis, no un asistente.

## Casos de uso

- Auditoria de representaciones por capa: dado un texto, capturar `output_hidden_states[L + 1]` en el ultimo token y verbalizar con la plantilla de la capa L para obtener una descripcion legible de lo codificado en ese punto de la red.
- Analisis de trayectorias de informacion: verbalizar la misma entrada en las 64 capas y estudiar como evoluciona la representacion desde rasgos lexicos hacia abstracciones, usando el etiquetado de capa del prompt.
- Deteccion de caracteristicas latentes: buscar conceptos concretos (idioma, dominio, sentimiento) en las verbalizaciones y localizar en que capas emergen con mayor fidelidad.
- Validacion de fidelidad con FVE: usar el reconstructor para medir cuanta varianza de la activacion real explica el resumen textual, descartando verbalizaciones poco informativas antes de sacar conclusiones.
- Investigacion de seguridad y alineamiento: inspeccionar que representaciones internas se activan ante prompts sensibles y documentar sesgos o asociaciones no deseadas a nivel de capa.
- Comparacion de checkpoints: contrastar las verbalizaciones de este paso 2000 con las del NLA de 11 capas o con `rl600` para evaluar el efecto del RL sobre la legibilidad de las representaciones.
- Docencia y divulgacion: mostrar en un cuaderno interactivo como un modelo de 27B transforma una frase capa a capa, con texto en lugar de vectores.

## Benchmarks y rendimiento

Resultados internos reportados por el autor (FVE en held-out, 128 posiciones x 64 capas, con baseline de prediccion de la media por capa):

| Metrica | Resultado |
|---|---|
| FVE macro con AR co-entrenado (paso 2000) | 75,8 % |
| FVE en capa L44 con AR co-entrenado | 77,2 % |
| FVE macro con AR de SFT congelado | 68,9 % |
| WorkspaceBench macro-22 (juez Opus-5.5) en L44 | 0,465 |
| WorkspaceBench leyendo en cualquiera de las 64 capas | 0,856 (corresponde a RL600) |
| WorkspaceBench leyendo en cualquiera de las 11 capas de la escalera | 0,778 (NLA de 11 capas: 0,758) |

El autor indica que el paso 2000 iguala o supera a RL600 en WorkspaceBench en todas las capas y lo senala como checkpoint recomendado para lectura. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es un LM generativo de proposito general.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 58,8 GB; el tronco del reconstructor en bf16 mas el modelo base Qwen3.6-27B para el verbalizador exigen, en la practica, cargar dos artefactos de gran tamano. Para inferencia conjunta en bf16 se necesita un nodo multi-GPU; el AV puede ejecutarse con el base cuantizado si se acepta perdida de fidelidad, aunque no se publican recetas de cuantizacion.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2x A100 40 GB en adelante) para cargar base y reconstructor sin offload agresivo.
- Consumer GPU: no cabe en RTX 4090 (24 GB) en bf16; requeriria cuantizacion del modelo base y del reconstructor, no documentada por el autor.
- Despliegue: al ser un artefacto de investigacion con LoRA y pesos safetensors, el flujo natural es `transformers` con PEFT para el AV y carga directa del tronco del AR; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cobertura de capas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.6-27b-all-layer-nla-rl2000 (este) | no disponible (base 27B) | no disponible | 64 capas (0-63) | no disponible | HuggingFace, 0 descargas |
| camilablank/qwen3.6-27b-multilayer-nla-rl600 | no disponible (base 27B) | no disponible | 11 capas (escalera 20:61:4) | no disponible | HuggingFace |
| Sondas lineales o SAE sobre activaciones | especifico por capa | no aplica | por capa | variable | multiple |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas justa es con el NLA de 11 capas del mismo autor, que comparte receta y sustrato pero cubre menos capas y reporta 0,758 en WorkspaceBench frente a 0,778 de la variante de 11 capas leida en su escalera. Frente a SAE o sondas, la ventaja del NLA es la salida en lenguaje natural sin entrenamiento por tarea; la desventaja es la dependencia de un critico co-entrenado para medir fidelidad.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: usarlo como LM produce salidas sin garantia; su unico proposito es la interpretabilidad.
- La licencia no esta declarada en la model card ni en los metadatos, lo que impide confirmar condiciones de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Los resultados de FVE y WorkspaceBench son internos y no han sido replicados de forma independiente; el juez de WorkspaceBench es Opus-5.5, lo que introduce dependencia de un modelo propietario en la evaluacion.
- El reconstructor congelado de SFT baja el FVE macro de 75,8 % a 68,9 %, de modo que la fidelidad depende del critico con el que se empareje el AV.
- Las activaciones se capturan en la salida bruta de cada bloque (sin norma) y en el ultimo token real; desviarse de ese protocolo invalida las verbalizaciones.
- El prompt debe renderizarse con `enable_thinking=False`; activar el modo thinking altera el formato esperado por el AV.
- Riesgo de alucinacion en las verbalizaciones: el texto generado puede describir conceptos plausibles pero no presentes en la activacion, por lo que conviene validar siempre con FVE.
- Sesgos del corpus de SFT (texto web) pueden reflejarse en las descripciones; no se documenta composicion del dataset ni evaluacion de sesgos.
- Idiomas soportados no declarados; el comportamiento fuera del ingles no esta verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/camila-blank/qwen3.6-27b-all-layer-nla-rl2000
- Modelo de 11 capas del mismo autor: https://huggingface.co/camilablank/qwen3.6-27b-multilayer-nla-rl600
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- EasyNLA (fork Qwen3.6): no disponible en la informacion proporcionada
- Paper o blog del metodo NLA: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
