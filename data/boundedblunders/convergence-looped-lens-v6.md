# boundedblunders/convergence-looped-lens-v6

## Resumen

`convergence-looped-lens-v6` es la sexta entrada del equipo `convergence` en el Looped Lens Challenge organizado por NDIF, un certamen centrado en interpretabilidad mecanistica sobre modelos con capas recurrentes o "looped". No es un modelo de lenguaje generativo, sino un conjunto de pesos de una "lente" (lens): un artefacto de sonda que se aplica sobre las activaciones internas de otro modelo, en este caso `thinkingmachines/Inkling-2-Mini`, para leer y decodificar su estado latente en posiciones y visitas concretas.

El artefacto pesa 12 MB y contiene 73 tensores en `fp16` (un fichero `lens_weights.safetensors`), lo que da una idea de su escala: es un componente ligero de analisis, no un modelo entrenado desde cero. La propuesta tecnica combina un selector de posicion basado solo en activaciones (un probe lineal de 4.609 parametros sobre las visitas 45 y 47) con dos familias de lentes de bajo rango con puerta escalar (`r = 128`, `g_cap = 0.65`) aplicadas a las visitas 43 a 47.

Su relevancia es acotada pero clara para quien trabaje en interpretabilidad: documenta una metodologia reproducible, con restricciones estrictas de lectura (10 visitas distintas por prompt, una unica posicion `t*`, cero texto de prompt y cero IDs de token en la seleccion), bajo licencia MIT. Es material de investigacion para analizar como evoluciona la representacion interna de un transformer con ejecuciones recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes de sonda (probe lineal + lentes de bajo rango con puerta escalar) sobre activaciones de `thinkingmachines/Inkling-2-Mini` |
| Parametros totales | No disponible como modelo unico; el probe de seleccion tiene 4.609 parametros y el repo contiene 73 tensores `fp16` en 12,00 MB |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (ventana de lectura de 14 tokens, `K_POS = 14`, en el selector) |
| Tipos de cuantizacion | `fp16` (unico formato publicado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo, sino un conjunto de lentes aplicadas a las activaciones residuales del modelo objetivo `Inkling-2-Mini`. Se distinguen dos componentes. El primero es un selector de posicion que opera exclusivamente sobre activaciones: en la ventana de 14 tokens finales lee las visitas 45 y 47, calcula la masa de probabilidad del logit-lens crudo sobre tokens de control especiales y, si `ctrl_mass > 0.50` y `gk >= 3`, aplica un probe lineal de 4.609 parametros sobre `[h45, h47]` normalizados por RMS unitaria para puntuar posiciones anteriores; selecciona el `argmax` si `max p > 0.75` y, en caso contrario, se queda en `gk - 1`.

El segundo componente son dos familias de lentes de bajo rango con puerta escalar sobre las visitas 43 a 47 (`r = 128`, `g_cap = 0.65`). Cuando el selector mueve la posicion al final de la pregunta (`sel < gk - 1`) se usa la lente entrenada especificamente para ese caso (`prefix = "tstar."`), entrenada sin etiquetas con KL de vocabulario completo de `h_v[t*]` hacia `h_47[reply_started]` y una puerta de ganancia continua (`bce_cont08`) sobre estados de fin de pregunta e identidad. En el resto de casos se usa la lente de la Entry #3 (`prefix = ""`), tambien sin etiquetas, con KL de identidad de vocabulario completo y balanceado por formato. En ambas, la actualizacion residual es `h'_v = h_v + B_v(A_v h_v) + b_v` y la puerta `g_v(h_v) = 0.65 * sigmoid(w_g^T LayerNorm(h_v) + b_g)` depende unicamente de la activacion `h_v` en `t*`, devolviendo `logit_lens(h_v) + g_v(h_v) * (logit_lens(h'_v) - logit_lens(h_v))`.

Las diez lineas de lectura cubren las visitas 12, 24, 35, 36, 42, 43, 44, 45, 46 y 47, con lecturas de `layers[12].input`, `layers[11].input`, `layers[18].mlp_input.output`, `layers[19].input` hasta `layers[23].input`, todas en la posicion unica `t*`. Las visitas 12 a 42 usan logit-lens crudo; las visitas 43 a 47 usan la lente de bajo rango correspondiente.

## Capacidades

- Decodificacion de estado latente: proyecta activaciones internas de `Inkling-2-Mini` a distribuciones sobre el vocabulario mediante logit-lens crudo o lentes de bajo rango.
- Seleccion de posicion basada solo en activaciones: detecta el final de la pregunta y desplaza la posicion de lectura sin usar texto del prompt ni IDs de token.
- Lectura multi-visita controlada: cubre 10 visitas distintas por prompt (12, 24, 35, 36, 42, 43, 44, 45, 46, 47) con una unica posicion `t*`.
- Gating selectivo: puerta escalar por visita que modula la correccion de la lente con techo `g_cap = 0.65`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues; es un artefacto de analisis, no un modelo de proposito general.

## Casos de uso

- Analisis de representaciones internas en modelos con ejecuciones recurrentes: aplicar las lentes sobre `Inkling-2-Mini` para inspeccionar como evoluciona la prediccion del siguiente token a lo largo de las visitas 12 a 47 en una posicion concreta.
- Investigacion en interpretabilidad mecanistica: comparar la lente de fin de pregunta (`tstar.*`) con la lente de identidad (`v43.*` a `v47.*`) para estudiar el efecto del cambio de posicion de lectura sobre la fidelidad de la decodificacion.
- Reproduccion de resultados del Looped Lens Challenge: el repositorio publica pesos y metodologia suficientes para replicar la Entry #6 y contrastarla con las entradas #3 y #5 del mismo equipo.
- Auditoria de sesgos de lectura: el selector basado en `ctrl_mass` sobre tokens de control permite estudiar cuando el modelo objetivo concentra masa en tokens especiales y como afecta eso a la seleccion de posicion.
- Desarrollo de sondas ligeras: el probe lineal de 4.609 parametros sirve como referencia para construir selectores de posicion de bajo coste en otros modelos con capas recurrentes.
- Docencia y formacion: material didactico para explicar logit-lens, lentes de bajo rango y gating escalar con un ejemplo reproducible y de tamano manejable (12 MB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para la lente: despreciable; el fichero de pesos ocupa 12,00 MB en `fp16` (73 tensores).
- VRAM para el modelo objetivo: no disponible en la informacion proporcionada; depende de `thinkingmachines/Inkling-2-Mini`, que no se describe en la model card.
- GPU recomendadas: no disponible; el cuello de botella es la inferencia del modelo objetivo, no la lente.
- Cabe en GPU de consumo: la lente si; el modelo objetivo, no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es cargar `lens_weights.safetensors` junto con las activaciones extraidas del modelo objetivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `convergence-looped-lens-v6` | Lente de interpretabilidad | 73 tensores, 12 MB (probe de 4.609 parametros) | No disponible | MIT | Hugging Face |
| Entry #5 del mismo equipo | Lente de interpretabilidad | No disponible | No disponible | No disponible | Referenciada en la model card, sin repositorio publico indicado |
| Entry #3 del mismo equipo | Lente de interpretabilidad | No disponible | No disponible | No disponible | Referenciada en la model card, sin repositorio publico indicado |

No se dispone de datos de rendimiento ni de especificaciones completas de las entradas #3 y #5 para una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a instrucciones; solo produce lecturas de activaciones.
- Dependencia estricta de `thinkingmachines/Inkling-2-Mini`: los pesos de la lente estan entrenados para las capas y visitas concretas de ese modelo y no son transferibles a otras arquitecturas.
- Restricciones de lectura autoimpuestas: 10 visitas por prompt, una unica posicion `t*`, cero mezcla entre visitas y cero uso de texto o IDs de token; cualquier uso fuera de ese regimen invalida la metodologia declarada.
- Riesgo de sobreajuste al formato: la lente `tstar.*` se entrena con estados de fin de pregunta e identidad, y la lente base con KL balanceado por formato; el comportamiento en formatos no vistos no esta documentado.
- Umbrales fijos: `ctrl_mass > 0.50`, `max p > 0.75` y `g_cap = 0.65` son hiperparametros fijados en el diseno, sin analisis de sensibilidad publicado.
- Sin datos de benchmarks, sesgos, alucinacion ni evaluacion multilingue; no hay evidencia publicada sobre fidelidad de las lecturas mas alla de la descripcion metodologica.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia alguna sobre los resultados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v6
- Looped Lens Challenge (NDIF): https://ndif.us/looped-lens-challenge
- Modelo objetivo: `thinkingmachines/Inkling-2-Mini` (referenciado en la model card, sin URL directa en la informacion disponible)
