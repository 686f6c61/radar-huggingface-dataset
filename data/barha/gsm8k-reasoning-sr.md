# barha/gsm8k-reasoning-sr

## Resumen

`barha/gsm8k-reasoning-sr` es un adaptador de tipo Shadow Residual (SR) publicado por el usuario `barha` sobre el modelo base `ibm-granite/granite-4.1-3b` de IBM. Su proposito es resolver problemas matematicos de enunciado de nivel escolar (estilo GSM8K) generando una rationale paso a paso y terminando con la respuesta final en el formato `#### <numero>`. El adaptador se entrena exclusivamente sobre el split de entrenamiento de `openai/gsm8k` (7.472 filas) y se evalua sobre el split de test del mismo dataset.

La particularidad tecnica es que no es un LoRA convencional: su `adapter_config.json` declara un modulo `cross_stream` que el modelo Granite estandar de Transformers no posee, por lo que no carga mediante `PeftModel.from_pretrained` sobre el modelo base, sino a traves del runtime Granite Switch / Shadow Residual. Un adaptador SR construye un checkpoint de doble flujo que `granite-switch` no mezcla con adaptadores LoRA o aLoRA en un mismo modelo compuesto.

El modelo es relevante como ejemplo de adaptacion especializada en razonamiento matematico sobre una base compacta de 3B, con un resultado declarado de 0.7619 de exactitud en GSM8K test. No obstante, la propia model card advierte de que no se evaluo el modelo base sin adaptador, por lo que no es posible cuantificar la mejora atribuible al adaptador, y de que el split de test se uso tambien como conjunto de evaluacion durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Shadow Residual (SR) sobre transformer Granite 4.1 (base con enrutamiento MoE compartido) |
| Parametros totales | no disponible (adaptador de rango 32; el modelo base es de 3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado y evaluado solo en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `peft`; requiere runtime `granite-switch`) |

## Arquitectura y entrenamiento

El adaptador es un Shadow Residual (SR), una variante de adaptacion de bajo rango que, a diferencia de un LoRA plano, construye un checkpoint de doble flujo e incorpora un modulo `cross_stream` inexistente en el Granite estandar. Los modulos objetivo son `q_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y `cross_stream`, con rango 32, alpha 64 y dropout 0.05, y comparte el enrutamiento MoE del modelo base. El modelo base es `ibm-granite/granite-4.1-3b` en el commit `c0650403e44e78ec0262dab1c90914c65b196c4e`.

El entrenamiento usa `openai/gsm8k` (config `main`, split train, 7.472 filas tras descartar una fila no latina) con el objetivo de reproducir la rationale trabajada del dataset terminada en `#### N`. La programacion fue de 2 epocas, 468 pasos, 2 GPUs con batch 2 y acumulacion de gradiente 8 (efectivo 32), scheduler coseno, LR pico 2e-4, 5 por ciento de warmup y longitud maxima 4.096. Se conserva el checkpoint final, al terminar la epoca 2. Las revisiones del dataset y del modelo base no fueron registradas por el run; la model card las infiere del historial de commits (`740312add88f781978c0658806c59bc2815b9866` para el dataset).

## Capacidades

- Generacion de texto con razonamiento matematico paso a paso sobre problemas de enunciado.
- Resolucion de problemas aritmeticos de nivel escolar con respuesta entera final en formato `#### <numero>`.
- Generacion de rationale intermedia (cadena de pasos) antes de la respuesta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el multi-paso se limita a la rationale aritmetica).
- Capacidades multilingues: no disponibles; el entrenamiento y la evaluacion son solo en ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Evaluacion de adaptadores SR frente a LoRA: el adaptador sirve como caso de referencia para medir como se comporta un Shadow Residual sobre Granite 4.1 3B en una tarea acotada, comparando exactitud y coste de integracion con el runtime `granite-switch`.
- Prototipado de tutoria matematica: dado un problema de enunciado en ingles, el modelo devuelve la rationale paso a paso y la respuesta final, util para generar explicaciones en un entorno educativo controlado.
- Generacion de datos sinteticos de razonamiento: las salidas con formato `#### N` pueden usarse como semilla para construir datasets de cadenas de razonamiento aritmetico, filtrando por coincidencia numerica exacta.
- Banco de pruebas de pipelines de evaluacion: el repositorio incluye `eval/gsm8k_test_predictions.jsonl` con 1.319 generaciones, lo que permite reproducir el scoring por coincidencia numerica y validar herramientas de evaluacion.
- Investigacion sobre sobreajuste y contaminacion: al haberse usado el test split como eval durante el entrenamiento, el adaptador es un caso util para estudiar como se infla la metrica reportada cuando no hay separacion entre entrenamiento y evaluacion.
- Demostracion de integracion de runtimes no estandar: sirve para documentar el flujo de carga de un adaptador SR (layout anidado `<adapter>//<technology>/`) frente a la carga convencional `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

GSM8K test split (1.319 problemas), puntuado por coincidencia numerica exacta con el numero tras el ultimo `####`:

| Modelo | Exactitud |
|---|---|
| granite-4.1-3b + este adaptador | 0.7619 (1.005 / 1.319) |

Notas: 11 generaciones no contenian linea `#### <numero>` y se contaron como incorrectas. No se publico una linea base del modelo sin adaptador, por lo que la tabla no permite aislar la contribucion del adaptador. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base es de 3B parametros, por lo que en precision completa requeriria del orden de 6-12 GB solo para pesos, mas overhead de activaciones y del runtime SR (cifra orientativa, no confirmada en la model card).
- GPU recomendadas: no disponible; el entrenamiento uso 2 GPUs con batch 2 y acumulacion de gradiente 8, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; el runtime requerido (`granite-switch`) condiciona el despliegue mas que el tamano del modelo.
- Opciones de despliegue: no es compatible con `PeftModel.from_pretrained` sobre el modelo base; requiere el runtime Granite Switch / Shadow Residual. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.1-3b + este adaptador SR | 3B (base) | 4.096 (entrenamiento) | 0.7619 (test, run propio) | no disponible | Hugging Face (`barha/gsm8k-reasoning-sr`) |
| granite-4.1-3b (base, sin adaptador) | 3B | no disponible | no disponible (no evaluado en este run) | no disponible | Hugging Face (`ibm-granite/granite-4.1-3b`) |
| Adaptador LoRA convencional sobre Granite 4.1 3B | 3B (base) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas de la misma categoria mas alla del propio modelo base.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de enunciado en ingles estilo GSM8K con respuestas enteras; el rendimiento fuera de ese dominio no esta caracterizado.
- La exactitud de 0.7619 procede de las generaciones de un unico run, no de una evaluacion independiente.
- No existe linea base del modelo sin adaptador, por lo que no puede atribuirse la mejora al adaptador.
- El split de test se uso como conjunto de evaluacion durante el entrenamiento; la eval loss salio `NaN` y no influyo en la seleccion de checkpoint, pero el solapamiento impide tratar la metrica como estimacion limpia de generalizacion.
- Las revisiones exactas del dataset y del modelo base no fueron registradas por el run; se infieren del historial de commits.
- No carga con `PeftModel.from_pretrained` sobre el modelo base; requiere el runtime Granite Switch / Shadow Residual, lo que limita la portabilidad y la integracion con stacks de despliegue habituales.
- `granite-switch` no mezcla adaptadores SR con LoRA o aLoRA en un modelo compuesto, lo que restringe la composicion con otros adaptadores.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Riesgo de alucinacion en la rationale aritmetica no cuantificado; 11 de 1.319 generaciones no respetaron el formato de respuesta esperado.
- Sesgos conocidos: no documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barha/gsm8k-reasoning-sr
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Predicciones de evaluacion incluidas en el repo: `eval/gsm8k_test_predictions.jsonl` (dentro del repositorio del modelo)
- Runtime Granite Switch / Shadow Residual: no disponible (no se proporciona URL en la informacion disponible)
