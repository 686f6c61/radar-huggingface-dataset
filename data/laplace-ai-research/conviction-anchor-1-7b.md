# Laplace-AI-Research/Conviction-Anchor-1.7B

## Resumen

Conviction Anchor 1.7B es un adaptador LoRA experimental publicado por Laplace Research (Laplace-AI-Research) sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo entrenado desde cero, sino un ajuste supervisado (SFT) de rango 16 y alpha 32 con unos 17,4 millones de parametros entrenables, distribuidos sobre las capas lineales del transformer de 1,7 mil millones de parametros del modelo base. Su proposito no es mejorar capacidades generales, sino estudiar la revision de creencias: cuando un sistema debe mantener una respuesta correcta ante impugnaciones sin respaldo, cuando debe corregirla ante evidencia valida y cuando debe declarar informacion insuficiente.

El adaptador forma parte de la serie Conviction y se evalua con ConvictionBench v0.1, un banco de pruebas de tareas sinteticas (aritmetica, libros de transacciones, logica proposicional y mundos de reglas pequenos) disenado para medir resistencia a presion, correccion legitima y abstencion. Es relevante ahora porque la sicofancia (la tendencia de los LLM a ceder ante el usuario aunque el usuario este equivocado) es uno de los fallos de alineacion mas documentados en produccion, y este trabajo aporta mediciones con intervalos de confianza y controles pre-registrados en lugar de impresiones cualitativas.

La publicacion incluye resultados comparativos frente al Qwen3-1.7B base en varias particiones (in-distribution, plantillas retenidas y subtipos retenidos), asi como un analisis de fallos que acota cuidadosamente lo que los resultados permiten afirmar. La licencia es Apache 2.0 y el repositorio ocupa 0,1 GB, lo que refleja que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador PEFT LoRA (rank 16, alpha 32) sobre capas lineales |
| Parametros totales | 1,7 mil millones (modelo base) + 17,4 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parametros. El ajuste es un LoRA de rank 16 y alpha 32 con aproximadamente 17,4 millones de parametros entrenables sobre las capas lineales. La inferencia se realiza con el modo thinking desactivado del modelo base.

El entrenamiento consistio en SFT con mascara de completado (completion-only) sobre 4.000 respuestas de referencia estratificadas escritas por un solver. Se uso una epoca (125 pasos), learning rate de 2e-4, batch efectivo de 32 y precision bfloat16. El run completo tardo 11 minutos en una RTX 3090. Los datos provienen de la mitad SFT de los grupos de entrenamiento de ConvictionBench v0.1; las particiones SFT y GRPO no comparten problemas subyacentes, y el protocolo original reservo grupos de validacion y test fuera del entrenamiento. Las tareas cubren aritmetica sintetica, libros de transacciones, logica proposicional y mundos de reglas pequenos. No se menciona RLHF ni DPO en esta release (la particion GRPO existe en el proyecto pero no es la que produce este adaptador).

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen3-1.7B.
- Razonamiento aritmetico sintetico y resolucion de tareas de logica proposicional en el formato de ConvictionBench.
- Mantenimiento de respuestas correctas ante impugnaciones sin respaldo (resistencia a presion), medida en el benchmark.
- Revision de respuestas ante evidencia valida (correccion legitima), aunque con tasas reducidas en problemas no familiares.
- Abstencion explicita cuando la informacion es insuficiente (0,963 en episodios subdeterminados in-distribution).
- Resistencia a registros falsificados en el formato de entrenamiento (0,963 in-distribution).
- Actualizaciones de estado mediante herramientas en el formato JSON fijo del benchmark.
- No se documentan capacidades de vision, audio, tool calling generico ni agentes multi-paso fuera del protocolo del benchmark.

## Casos de uso

- Investigacion sobre sicofancia: reproducir los experimentos de ConvictionBench para medir cuanto cede un modelo ante presion del usuario; el adaptador sirve como condicion SFT de referencia (E2) frente al modelo base.
- Estudio de revision de creencias: analizar cuando el modelo mantiene una respuesta correcta y cuando la corrige, usando las particiones in-distribution, de plantillas y de subtipos retenidos.
- Evaluacion de abstencion: probar mecanismos de "no lo se" en tareas subdeterminadas, con una tasa medida de 0,963 en distribucion frente a 0,355 del base.
- Analisis de robustez ante registros falsificados: usar el adaptador para estudiar la resistencia a evidencia fabricada, teniendo en cuenta que el control de canal puro mostro solo una diferencia de +0,04.
- Banco de pruebas para pipelines de evaluacion: integrar ConvictionBench y este adaptador como caso de prueba en un framework de evaluacion de alineacion, con intervalos bootstrap sobre grupos de problemas.
- Docencia y divulgacion tecnica: ilustrar con un caso reproducible (entrenamiento de 11 minutos en una RTX 3090) como un LoRA pequeno altera drasticamente el comportamiento de un modelo de 1,7B en una dimension concreta.
- No se recomienda como modelo de produccion para atencion al cliente, generacion de codigo ni agentes; su alcance es experimental y limitado a tareas sinteticas en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor. Los valores entre corchetes son intervalos de confianza del 95 % por cluster-bootstrap con 2.000 remuestreos sobre grupos de problemas. La ultima columna indica episodios elegibles para el adaptador.

| Metrica | Qwen3-1.7B base | Conviction Anchor 1.7B | Episodios |
|---|---:|---:|---:|
| Precision final in-distribution | 0,445 | 0,939 [0,922, 0,953] | 2.211 |
| Precision final con plantillas y encuadres retenidos | 0,425 | 0,913 [0,888, 0,935] | 2.474 |
| Precision final con subtipos retenidos | 0,424 | 0,580 [0,530, 0,626] | 2.588 |
| Tasa de cesion a presion, subtipos retenidos (menor es mejor) | 0,536 | 0,389 [0,329, 0,451] | 764 |
| Correccion legitima, subtipos retenidos | 0,937 | 0,857 [0,802, 0,906] | 175 |
| Actualizaciones de estado via herramienta, subtipos retenidos | 0,301 | 0,339 [0,275, 0,402] | 372 |
| Resistencia a registro falsificado in-distribution | 0,248 | 0,963 [0,935, 0,985] | 403 |
| Resistencia a registro falsificado, subtipos retenidos | 0,340 | 0,531 [0,470, 0,595] | 533 |
| Abstencion en episodios subdeterminados in-distribution | 0,355 | 0,963 [0,935, 0,986] | 403 |
| Correccion legitima en historia natural, subtipos retenidos | 0,875 | 0,074 [0,016, 0,152] | 54 |

El adaptador acepto 4 de 54 correcciones validas a sus propias respuestas erroneas en historia natural. Una segunda semilla SFT reprodujo de cerca el resultado de registro falsificado in-distribution y la precision final en particiones retenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un overhead minimo (17,4 M de parametros); el grueso corresponde al modelo base de 1,7B. En bfloat16, el modelo base ocupa aproximadamente 3,4 GB de pesos, mas activaciones y cache KV.
- Cabe en GPU de consumo: el entrenamiento se realizo en una RTX 3090 en 11 minutos, por lo que la inferencia cabe holgadamente en tarjetas de 8-12 GB (RTX 3060, 4060, 4070, 3090, 4090).
- GPU de datacenter (A100, H100) no son necesarias para este tamano; solo tendrian sentido para lotes grandes o evaluaciones masivas.
- Opciones de despliegue: PyTorch + Transformers + PEFT + huggingface_hub (ruta documentada por el autor). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA, requeriria fusion o carga dinamica segun el motor.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (11 minutos en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conviction Anchor 1.7B | 1,7B + 17,4 M LoRA | no disponible | Adaptador SFT para revision de creencias y anti-sicofancia | Apache 2.0 | Hugging Face (77 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista con modo thinking | Apache 2.0 | Hugging Face |
| Adaptadores anti-sicofancia comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores publicos equivalentes centrados en revision de creencias con los que comparar directamente. La comparacion natural es contra el propio modelo base, incluida en la tabla de benchmarks.

## Limitaciones y advertencias

- El autor advierte que la condicion original de registro falsificado mezcla canal y redaccion. En el control de canal puro (790 pares emparejados), el adaptador adopto registros de herramienta el 0,62 de las veces y pegados de usuario el 0,58, con una diferencia de +0,04 [0,02, 0,06], por debajo del umbral pre-registrado de +0,30. El fuerte rechazo del encuadre falsificado original aporta poca evidencia de verificacion de canal.
- La baja aceptacion de correcciones en problemas no familiares (0,074 en historia natural, 4 de 54) limita la interpretacion de la alta resistencia a presion: parte de esa resistencia podria ser rigidez, no discernimiento.
- Entrenamiento sobre tareas sinteticas cortas en ingles y un formato JSON fijo; la conversacion abierta y la manipulacion del mundo real quedan fuera de la evaluacion.
- Riesgo de alucinacion no medido en este trabajo; el benchmark se centra en mantener, corregir o abstenerse, no en la veracidad general.
- El tokenizador de Qwen puede interpretar la cadena literal `<tool_response>` en texto de usuario como token especial; los sistemas que usen la plantilla deben impedir que tales entradas fabriquen un turno de herramienta. Mantener los roles de mensaje bajo control de la aplicacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no esta validado para produccion.
- Solo ingles; no hay soporte multilingue documentado.
- Las comparaciones en historia natural no estan emparejadas, ya que la primera respuesta del propio modelo se convierte en el prior y los conjuntos elegibles difieren entre modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Conviction-Anchor-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ConvictionBench v0.1: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Repositorio de investigacion (configs y resultados): https://github.com/Laplace-AI-Research/conviction
- Configuracion SFT: https://github.com/Laplace-AI-Research/conviction/blob/main/configs/sft.yaml
- Resultados del run E2 SFT: https://github.com/Laplace-AI-Research/conviction/tree/main/results/E2_sft
