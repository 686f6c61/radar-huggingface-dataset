# ceselder/qwen36-27b-maemm-inverter-rl-8x2048

## Resumen

ceselder/qwen36-27b-maemm-inverter-rl-8x2048 es un modelo de inversión de activaciones (activation→text inverter) construido sobre los pesos completos de Qwen3.6-27B. Su función no es la de un asistente general, sino la de un instrumento de interpretabilidad mecanicista: recibe una dirección del residual stream de la capa 42, inyectada en un token marcador de la capa 1 mediante una suma con normalización de norma (`h + ‖h‖·v`), y genera texto cuyos últimos tokens reproducen esa dirección en el modelo limpio.

Lo desarrolla el usuario ceselder dentro del proyecto MAEMM y corresponde al mejor checkpoint de una línea de tres etapas (pretrain, midtrain y RL con parámetros completos). El entrenamiento final usa GRPO con 16.384 rollouts por paso (8 muestras × 2.048 direcciones) y alcanza una fidelidad held-out media de 0,431 sobre diez familias de coseno, la más alta de todas las variantes entrenadas por el autor.

Es relevante ahora porque ataca un cuello de botella clásico de la interpretabilidad: traducir direcciones internas (features de SAE, neuronas MLP, sondas lineales) a texto legible y verificable. El modelo tiene 27.781.427.952 parámetros, se publica en bf16 con el layout estándar de HuggingFace y licencia Apache 2.0, y aún no acumula descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.6-27B); fine-tuning completo como inverter activation→text |
| Parametros totales | 27.781.427.952 (≈27,8 B), dato real de safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion; las evaluaciones usan contextos de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout estandar de HuggingFace) |
| Tamano del repositorio | 55,6 GB |
| Modelo base | ceselder/qwen36-27b-maemm-inverter-pretrain-104m |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura densa de Qwen3.6-27B (transformer decoder-only) y no introduce cambios estructurales: se entrena con parámetros completos sobre los pesos del modelo. El mecanismo de inversión consiste en inyectar una dirección unitaria del residual stream de la capa 42 en una capa temprana (capa 1), escalada por la norma del residual del token marcador, y en pedir al modelo que genere texto cuyo último contenido reproduzca esa activación. La decodificación se hace a temperatura 1 y hasta 192 tokens nuevos.

El entrenamiento consta de tres etapas con parámetros completos. La primera (pretrain) es un fine-tuning sobre 104 millones de activaciones reales de la capa 42 procedentes de prefijos cortos de corpus, con fidelidad held-out de 0,369. La segunda (midtrain) usa batch efectivo de 4.096 y learning rate 1e-5 durante una época sobre un banco de 2,75 millones de filas de direcciones, verificado de forma independiente: 1M de activaciones reales, 397k ventanas de encoder SAE, 397k de decoder SAE, 226k direcciones de bloque BSF rederivadas de contextos literales, 204k spans de sonda recortados a su pico y 525k ventanas de neuronas MLP que superan un chequeo de disparo; fidelidad 0,348.

La etapa final (RL) aplica GRPO con parámetros completos siguiendo la receta ScaleRL/CISPO: agregación a nivel de prompt, ventajas normalizadas por batch, filtro de varianza cero y sin término KL. La recompensa es el coseno máximo entre la activación de capa 42 del modelo base limpio y el objetivo sobre los últimos 5 tokens generados. Se emplearon 8 muestras × 2.048 direcciones (16.384 rollouts por paso), learning rate 1e-6 constante tras un calentamiento de 25 pasos, 300 pasos, y una infraestructura de 2 B200 para rollout con vLLM y 6 B200 para el entrenador con FSDP2.

## Capacidades

- Inversión de activaciones: dada una dirección del residual stream de la capa 42, genera texto que la reproduce en los últimos tokens.
- Cobertura de familias de direcciones: evaluada sobre features de encoder/decoder de SAE, neuronas MLP, direcciones de bloque BSF, sondas lineales y direcciones de J-lens.
- Normalización de la señal de entrada: la dirección inyectada se normaliza a norma unitaria y se escala por la norma del residual del token marcador (coeficiente 1.0 = suma con norma emparejada).
- Integración con código de interpretabilidad: requiere el hook de inyección (`mxf/inject.py`) y el prompt del inverter del proyecto MAEMM.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documentan modos especiales (thinking, visión o audio) más allá de la tarea de inversión.

## Casos de uso

- Interpretabilidad de features de SAE: dado el vector de un feature del SAE de la capa 42, el modelo genera texto que evoca ese feature, lo que permite asignarle una descripción legible y validarla reconstruyendo la activación.
- Auditoría de neuronas MLP: con la dirección de una neurona concreta como entrada, se obtienen ejemplos de texto disparadores, útiles para etiquetar neuronas individuales sin depender de inspección manual.
- Validación de sondas lineales: la dirección de una sonda lineal se invierte a texto para comprobar empíricamente qué concepto está codificando (fidelidad medida de 0,280 en esta familia).
- Construcción de pipelines de interpretabilidad automatizada: al integrarse con el evaluador y el hook de inyección del proyecto MAEMM, permite procesar bancos grandes de direcciones de forma por lotes.
- Investigación sobre seguridad y refusal: invertir direcciones asociadas a comportamientos concretos puede ayudar a localizar y caracterizar representaciones internas relevantes para el alineamiento.
- Generación de datasets de texto condicionados por dirección: el texto generado puede usarse como material de entrenamiento o contraste para otros modelos de interpretabilidad.
- Estudio de la relación dirección-texto: comparar familias de coseno (SAE, MLP, BSF, sonda, J-lens) permite medir qué tipos de direcciones son más fáciles de verbalizar.

## Benchmarks y rendimiento

Fidelidad held-out en el paso 300 (512 direcciones held-out por familia, best-of-4 a T=1, máximo sobre los últimos 5 tokens):

| Metrica | Valor |
|---|---|
| Media sobre las 10 familias de coseno | 0,431 |
| Activacion de feature SAE / maximo del corpus | 0,960 (supera el maximo del corpus en el 55,5% de los features) |
| Activacion de neurona MLP / maximo del corpus | 0,947 |
| Activacion real, contexto corto (coseno) | 0,557 |
| Activacion real, contexto de 512 tokens (coseno) | 0,479 |
| Direccion de bloque BSF (coseno) | 0,356 |
| Direccion de sonda lineal (coseno) | 0,280 |
| Direccion de J-lens (coseno) | 0,117 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada en inferencia bf16: los pesos suman 27,78 B de parámetros, lo que equivale a unos 55,6 GB, más el coste de activaciones y caché KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para servir el modelo en bf16 en una sola tarjeta; el entrenamiento del autor usó B200.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; tampoco en 2× RTX 4090 (48 GB) sin cuantizar. No hay versiones cuantizadas publicadas en la informacion disponible.
- Opciones de despliegue: HuggingFace Transformers con `AutoModelForCausalLM.from_pretrained(repo, torch_dtype=torch.bfloat16)`; vLLM se usó para los rollouts de RL; FSDP2 se usó para el entrenamiento. No se documentan soportes GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen alternativas publicas directamente equivalentes en la informacion disponible. La comparacion posible es con las otras variantes de la misma linea de entrenamiento del autor:

| Variante | Recompensa / objetivo | Fidelidad media (coseno) | SAE | MLP |
|---|---|---|---|---|
| RL 8x2048 (este modelo) | ultimos 5 tokens | 0,431 | 0,960 | 0,947 |
| RL 8x512 | ultimos 5 tokens | 0,425 | no disponible | no disponible |
| RL 8x512 | todos los tokens | 0,430 | 1,012 | 0,755 |
| Pretrain (base) | no aplica | 0,369 | no disponible | no disponible |
| Midtrain (etapa previa) | no aplica | 0,348 | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo conversacional ni un asistente; su salida solo tiene sentido dentro del pipeline de inversion de MAEMM.
- La metrica de exito es similitud coseno entre activaciones, no reconstruccion exacta ni coherencia del texto generado; una fidelidad de 0,431 en la media de familias implica margen de error considerable.
- La familia de direcciones J-lens presenta la fidelidad mas baja (0,117) y las sondas lineales tambien son limitadas (0,280); no todas las representaciones internas se verbalizan igual de bien.
- El autor menciona un "drift wall" y curvas de deriva en RL, lo que sugiere degradacion potencial a partir de cierto punto de entrenamiento.
- Dependencia de contexto: la fidelidad cae de 0,557 con contexto corto a 0,479 con contexto de 512 tokens.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento fuera de la tarea de inversion.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial en los terminos de dicha licencia, pero el modelo base Qwen3.6 y el codigo MAEMM pueden imponer condiciones adicionales que no se detallan en la informacion disponible.
- Repositorio con 0 descargas y 0 valoraciones; no hay evidencia de uso en produccion.
- El informe con la dinamica completa esta alojado en una URL con proteccion por autenticacion, lo que limita la verificacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/qwen36-27b-maemm-inverter-rl-8x2048
- Checkpoint de pretrain (modelo base): https://huggingface.co/ceselder/qwen36-27b-maemm-inverter-pretrain-104m
- Informe completo (con autenticacion): http://5.78.192.0/reports/view/maemm-fft104m-mix5m-fullrl/report.html
- Wandb de entrenamiento: `celestedeschamphelaere-personal/maxact-fast/e9zit9p7`
- Wandb de evaluaciones: `rl_fullparam_fft104m_mix5m_8x2048_eval`
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo.
