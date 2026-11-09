# prada5023/countdown-rl-gemma4-e2b-v2-zeroshot-s0

## Resumen

`countdown-rl-gemma4-e2b-v2-zeroshot-s0` es un adaptador LoRA publicado por el usuario `prada5023` sobre el decodificador de texto de `google/gemma-4-E2B`. No es un modelo completo, sino un ajuste fino mediante aprendizaje por refuerzo (GRPO) orientado a una tarea concreta: resolver el juego de numeros Countdown con una herramienta Python en el bucle. El adaptador tiene rango 16 y alpha 32, y se distribuye en formato PEFT/safetensors con un tamano de repositorio de 0,1 GB.

El interes tecnico del artefacto esta en el formato de interaccion que induce: la politica escribe un bloque `<think>`, puede invocar `<python>` (cuyo stdout regresa en `<output>`) y finalmente responde en `<answer>`. Es decir, entrena un patron de razonamiento con uso de herramientas (*tool use*) sobre un modelo base multimodal del que solo se usa el decodificador de texto. La evaluacion publicada en la model card reporta un 4,4 % de pass@1 en el conjunto `holdout3` (1.000 problemas generados despues de todas las decisiones del modelo, decodificacion greedy, 768 tokens y dos rondas de codigo), con desglose de 9,0 % en faciles, 1,7 % en medios y 1,0 % en dificiles.

Es relevante ahora como ejemplo reproducible de un pipeline de RL con verificacion programatica (el interprete Python actua como *reward model* implicito) sobre un modelo pequeno, y como muestra de las limitaciones reales de esta tecnica: el rendimiento absoluto es bajo y el adaptador esta fuertemente acoplado al prompt de entrenamiento (`r1zero_tool`), por lo que no debe evaluarse con otras plantillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el decodificador de texto de `google/gemma-4-E2B`; r = 16, alpha = 32 |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decodificador de texto extraido del checkpoint multimodal `google/gemma-4-E2B`. Segun la model card, es necesario generar primero la version solo-texto con `scripts/prepare_gemma4_text.py`, y la inferencia debe hacerse con atencion eager (`--attn eager`) para que los logits coincidan exactamente con los del modelo completo. El entrenamiento usa GRPO (Group Relative Policy Optimization) con una receta denominada v2, prompt zero-shot y semilla 0. El conjunto de entrenamiento es el juego Countdown, en el que el modelo debe combinar numeros con operaciones aritmeticas para alcanzar un objetivo, y la recompensa se obtiene verificando programaticamente la respuesta.

La innovacion principal es el bucle de herramienta: la politica puede emitir codigo Python que se ejecuta y cuyo resultado se reinyecta en el contexto, de modo que el modelo aprende a delegar calculo en el interprete en lugar de hacerlo solo con sus pesos. El adaptador esta especializado en el prompt `r1zero_tool`; la model card advierte explicitamente que las politicas son especificas del prompt y que la evaluacion debe replicar ese mismo formato. Los identificadores de ejecucion por bucket son `e2v2z0-a` a `e2v2z0-d`.

## Capacidades

- Generacion de texto con modo de razonamiento explicito mediante el bloque `<think>`.
- Uso de herramientas: emite bloques `<python>` cuyo stdout se devuelve en `<output>`, con soporte de multiples rondas de codigo (la evaluacion usa dos).
- Razonamiento aritmetico y resolucion del juego Countdown (combinar numeros con operaciones para alcanzar un objetivo).
- Razonamiento multi-paso acotado al bucle pensar-ejecutar-responder.
- Respuesta final estructurada en `<answer>`.
- Capacidades multilingues: no disponible.
- Vision u otras modalidades: no disponible (el adaptador solo cubre el decodificador de texto).

## Casos de uso

- Investigacion en RL con verificacion programatica: sirve como referencia reproducible para estudiar como GRPO con un interprete Python como verificador afecta al comportamiento de un modelo pequeno; la receta, configuraciones y logs estan en el repositorio acompanante.
- Experimentos de *tool use* en modelos compactos: permite analizar la tasa de invocacion correcta de la herramienta y la calidad del codigo generado en un dominio con recompensa objetiva.
- Evaluacion de tecnicas de razonamiento zero-shot: el prompt `r1zero_tool` y el conjunto `holdout3` permiten medir pass@1 por dificultad (facil, medio, dificil) y comparar variantes de receta.
- Docencia y divulgacion sobre RLHF/GRPO: el formato `<think>`/`<python>`/`<output>`/`<answer>` es un ejemplo didactico de como se estructura una politica con uso de herramientas.
- Generacion de datos sinteticos de razonamiento aritmetico: las trazas producidas por el adaptador pueden filtrarse por correccion y usarse como material de analisis o de destilacion.
- Banco de pruebas de infraestructura de evaluacion: el comando `countdown-eval` con `--attn eager`, `--max-new-tokens 768` y `--max-rounds 2` sirve para validar pipelines de inferencia con adaptadores PEFT sobre modelos base multimodales recortados a texto.
- Prueba de concepto de asistentes aritmeticos con calculadora: el patron de delegar el calculo en Python es trasladable a dominios donde la exactitud numerica importa mas que la fluidez.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Countdown `holdout3` (1.000 problemas, greedy, 768 tokens, dos rondas de codigo) | pass@1 global | 4,4 % |
| Countdown `holdout3`, dificultad facil | pass@1 | 9,0 % |
| Countdown `holdout3`, dificultad media | pass@1 | 1,7 % |
| Countdown `holdout3`, dificultad dificil | pass@1 | 1,0 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base `google/gemma-4-E2B` y de su cuantizacion, no del adaptador (0,1 GB).
- GPU recomendadas: no disponible. La evaluacion oficial se ejecuta con atencion eager, lo que incrementa el consumo de memoria frente a implementaciones con atencion optimizada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT sobre el modelo base recortado a texto; el flujo documentado usa `hf download`, `uv run` y la herramienta `countdown-eval` del repositorio acompanante. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la configuracion de referencia usa 768 tokens maximos de generacion y hasta dos rondas de ejecucion de codigo, lo que implica varias llamadas al modelo por problema.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoria, ni datos de rendimiento de alternativas sobre el mismo conjunto `holdout3`.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 4,4 % de pass@1 global y 1,0 % en problemas dificiles; no es adecuado como solucion de produccion para aritmetica general.
- Dependencia estricta del prompt: el adaptador solo funciona correctamente con el prompt `r1zero_tool`; evaluarlo con otras plantillas produce resultados no representativos.
- Requiere un paso de preparacion del modelo base: hay que extraer el decodificador de texto del checkpoint multimodal y usar atencion eager para que los logits coincidan con los del modelo completo.
- Alcance limitado al decodificador de texto: no hereda las capacidades multimodales del checkpoint original.
- Riesgo de alucinacion en las trazas de razonamiento y en las respuestas cuando no se ejecuta o no se valida el codigo Python.
- Idiomas soportados no documentados; no hay garantias de comportamiento multilingue.
- Licencia `gemma`: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia de Gemma, que deben revisarse antes de cualquier despliegue.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa independiente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prada5023/countdown-rl-gemma4-e2b-v2-zeroshot-s0
- Modelo base: https://huggingface.co/google/gemma-4-E2B
