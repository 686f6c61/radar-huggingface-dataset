# plantwaterer/muria

## Resumen

muria es un ajuste fino (fine-tune) de google/gemma-4-12B-it desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones mediante preguntas de opcion multiple. A diferencia de un modelo de chat convencional, muria no devuelve texto libre: devuelve una distribucion de probabilidad calibrada sobre las opciones de una pregunta, lo que lo convierte en un componente de inferencia para sistemas que necesitan elegir entre alternativas de forma cuantificable.

El modelo parte del checkpoint Gemma 4 12B instruct (aproximadamente 11.960 millones de parametros) y anade una cabeza de calibracion de ultima capa (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en probabilidades. Para preguntas de opcion multiple aplica un softmax con temperatura ajustada (T = 0.970); para preguntas de si/no aplica un posterior de Laplace sobre el estado oculto que corrige los dos logits. La licencia es Apache-2.0.

Su relevancia actual reside en el nicho: no compite como modelo generativo generalista, sino como motor de decision probabilistica dentro del ecosistema Decision Index. Requiere una atencion no estandar (funcion `jev_mem` en `fullft_mem.py`) y una GPU con capacidad suficiente para servir los pesos en bf16 (24 GB) mas las activaciones de filas empaquetadas de hasta 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con capas de atencion completa bidireccional y capas locales causales de ventana 1.024; cabeza de calibracion VBLL adicional |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (sin truncado; las peticiones que exceden se rechazan) |
| Tipos de cuantizacion | bf16 (unico formato documentado y soportado por el motor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`, `vbll_head.json`) |

## Arquitectura y entrenamiento

muria es el resultado de aplicar el diseno de entrenamiento de plantwaterer/allec sobre google/gemma-4-12B-it (revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`, con la torre de vision congelada). El ajuste es la media uniforme en fp32 (0,50 / 0,50) de dos fine-tunes completos con semillas 0 y 1. Cada semilla se entreno con 600 actualizaciones, batch global de 64 sobre el mismo manifiesto de 38.400 preguntas (`M2.1sP`, hasta 8.192 tokens), AdamW fusionado en fp32 con betas (0,9, 0,95), weight decay 0,0, clipping 1,0, LR pico 2,5e-6, warmup de 50 pasos y decaimiento coseno hasta 0,1 del pico, con mezcla de etiquetas suaves del modelo padre a peso 0,15.

La innovacion principal es la cabeza de calibracion: se ajusto tras la media sobre 16.384 preguntas de ajuste y 4.086 de calibracion, con temperatura T = 0.970. Para opcion multiple, la salida es el softmax de los logits de las letras en la posicion de respuesta; para si/no, un posterior de Laplace integrado sobre el estado oculto corrige los dos logits. La atencion tambien es no estandar: en las capas de atencion completa cada prompt atiende a todos los tokens del mismo prompt (bidireccional), mientras que las capas de ventana deslizante permanecen causales. El motor de inferencia rechaza cualquier otra funcion de atencion que no sea `jev_mem` sobre PyTorch SDPA.

## Capacidades

- Respuesta a preguntas de opcion multiple con una probabilidad calibrada por opcion (hasta 52 opciones en una ronda; mas de 52 en dos rondas).
- Respuesta a preguntas de si/no con correccion bayesiana de los dos logits mediante posterior de Laplace.
- Decision condicionada por contexto: acepta un enunciado de situacion y criterios por opcion (por ejemplo, `Yes: <definicion>` / `No: <definicion>`).
- Procesamiento por lotes empaquetado de hasta 32.768 tokens por peticion, con posiciones independientes por prompt.
- Hereda del modelo base la torre de vision (congelada durante el ajuste), aunque la model card no documenta el uso de entrada imagen-texto en el flujo de decision.
- No soporta generacion de texto libre como salida principal: la respuesta es la distribucion de probabilidad, no una cadena generada.
- Tool calling, function calling, agentes multi-paso y modo thinking: no documentados en la informacion disponible.

## Casos de uso

- Triaje de incidencias en produccion: dado un informe de error y un conjunto de categorias de severidad, muria devuelve la probabilidad de cada categoria, lo que permite enrutar automaticamente y aplicar umbrales de confianza antes de escalar a un humano.
- Seleccion de accion en sistemas de recomendacion con criterios explicitos: se presentan las alternativas como opciones con definiciones y el modelo devuelve la probabilidad de cada una, util para ranking con incertidumbre calibrada.
- Verificacion binaria de politicas: preguntas de si/no (por ejemplo, si un texto cumple una politica interna) con la definicion de "si" y "no" en los criterios, aprovechando la correccion bayesiana de los logits.
- Evaluacion de hipotesis en investigacion: comparar la probabilidad asignada a opciones mutuamente excluyentes bajo distintos enunciados de contexto, con temperatura fija que hace comparables las salidas entre ejecuciones.
- Enrutamiento de consultas en atencion al cliente: clasificar una consulta entre un conjunto acotado de intenciones (hasta 52 opciones) con una unica pasada de inferencia por pregunta y latencia mediana de 48 ms en el hardware probado.
- Control de calidad de anotaciones: usar la distribucion de probabilidad como senal de acuerdo o desacuerdo con la etiqueta humana, marcando para revision los casos de baja confianza.
- Sistemas de decision con contexto largo: peticiones que requieren hasta 32.768 tokens (por ejemplo, un contrato o un informe completo) sin truncado, siempre que quepan en el limite documentado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el tablero Decision Index 0.4.1 (instantanea del 2026-11-21 14:35 UTC, 345 modelos):

| Metrica | muria (Gemma 4 12B) | Referencia: allec 31B | Referencia: Gemma 4 12B sin ajustar |
|---|---|---|---|
| Full score | 52,55 (puesto 140) | 66,96 | no disponible (la card indica +1,5 por encima de una entrada sin ajustar) |
| Same-skill score | 53,50 (puesto 147) | no disponible | no disponible |
| New-domain score | 39,78 (puesto 124) | no disponible | no disponible |
| Suite publica | 51,40 | no disponible | no disponible |
| Latencia mediana por pasada | 48 ms | no disponible | no disponible |

El Full score se compone como 0,60 x same-skill + 0,40 x new-domain y proviene unicamente de los tests privados de los mantenedores del tablero. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB solo para los pesos en bf16, mas las activaciones de las filas empaquetadas de hasta 32.768 tokens; se recomienda margen adicional sobre los 24 GB.
- GPU probadas por el autor: 1 x H100 80 GB y 1 x RTX PRO 6000 96 GB, con torch 2.14.1 (CUDA 13.0) y transformers 5.12.1.
- No cabe en GPUs de consumo de 24 GB sin margen para activaciones; no se documenta soporte de cuantizacion a 8 o 4 bits.
- Despliegue: motor propio `dikit_engine.py` sobre Decision Index (`pip install "git+https://github.com/apolinario/decision-index@9eb2dbe..."`), con `PYTHONPATH` apuntando al snapshot del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- La cabeza de calibracion se ejecuta en CPU en float64; el modelo en bf16 en CUDA.
- Latencia: mediana de 48 ms por pasada segun la model card; el throughput no esta documentado. Los resultados en bf16 varian ligeramente entre tipos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muria | 11,96 B | 32.768 tokens por peticion | Decision probabilistica con cabeza calibrada | Apache-2.0 | Hugging Face (266 descargas) |
| plantwaterer/allec | no disponible (referencia de 31B en el tablero) | no disponible | Mismo diseno de decision, mayor escala | no disponible | Hugging Face |
| google/gemma-4-12B-it | no disponible en la informacion | no disponible | Modelo instruct generativo generalista | no disponible | Hugging Face |

La comparacion con alternativas generativas del mismo tamano no es directa: muria no produce texto libre y su evaluacion se realiza sobre el tablero Decision Index, mientras que los modelos instruct se evaluan con benchmarks generativos. No se dispone de datos de MMLU, HumanEval o GSM8K para ninguno de los tres en la informacion proporcionada.

## Limitaciones y advertencias

- La salida es una distribucion de probabilidad sobre opciones, no texto generado; no es sustituible por un modelo de chat en tareas abiertas.
- Requiere la funcion de atencion `jev_mem`; transformers con atencion causal estandar produce respuestas distintas. El motor rechaza cualquier otra atencion, lo que limita la portabilidad a otros stacks de inferencia.
- Sin truncado: las peticiones que no caben en 32.768 tokens se reportan como no soportadas.
- Solo se documenta bf16; no hay cuantizaciones publicadas, lo que encarece el despliegue.
- La calibracion de la cabeza se ajusto sobre datos no comerciales segun la propia model card; conviene revisar las condiciones de uso comercial aunque la licencia de los pesos sea Apache-2.0.
- Los resultados en bf16 varian ligeramente entre tipos de GPU, lo que puede afectar a la reproducibilidad de las probabilidades.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al tratarse de un fine-tune de Gemma 4, hereda los sesgos del modelo base, no cuantificados en la card.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingue calibrado.
- El rendimiento en dominios nuevos es notablemente inferior (39,78) al de same-skill (53,50), lo que desaconseja su uso sin validacion en dominios alejados del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/muria
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Diseno de entrenamiento de referencia: https://huggingface.co/plantwaterer/allec
- Espejo en GitHub (codigo y model card): https://github.com/treewaterer/muria
- Kit Decision Index: https://github.com/apolinario/decision-index
- Tablero Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
