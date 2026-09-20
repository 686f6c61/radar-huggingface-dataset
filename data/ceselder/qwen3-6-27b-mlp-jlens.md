# ceselder/qwen3.6-27b-mlp-jlens

## Resumen

`ceselder/qwen3.6-27b-mlp-jlens` no es un modelo de lenguaje, sino un artefacto de interpretabilidad mecanística: un conjunto de matrices que aplican la técnica del *workspace Jacobian lens* (lente jacobiana de espacio de trabajo) sobre las activaciones de la capa 42 del modelo `Qwen/Qwen3.6-27B`. Lo publica el usuario ceselder y compone el jacobiano medio `J[42]` del repositorio `camilablank/workspace-lenses` con los pesos del MLP de esa misma capa, de forma que sea posible leer el estado de las neuronas MLP a través de la lente y saber qué concepto u operación está aportando ese MLP en cada token.

El repositorio pesa 0,6 GB y contiene cinco tensores en formato safetensors: un mapa de lectura exacto `∂h_penult/∂(activaciones MLP de la capa 42)`, un mapa de escritura exacto `∂(activaciones MLP de la capa 62)/∂h_42` calculado por autodiferenciación en modo inverso, una composición de primer orden "naive" que se incluye solo como referencia, la matriz `J_42` y dos vectores de centrado (media del residual de la capa 42 y media de las activaciones MLP de esa capa). Los tensores tienen dimensiones `d = 5120` y `d_ff = 17408`, coherentes con un transformer de 64 bloques donde el penúltimo bloque es el 62.

Su relevancia es acotada pero clara: permite a investigadores de interpretabilidad auditar hipótesis sobre el "espacio de trabajo" global del modelo, leer conceptos directamente del MLP intermedio sin entrenar un predictor nuevo y trazar cómo una dirección de la capa 42 influye en las features MLP de la capa 62. No produce texto ni se puede desplegar como servicio de generación; es material de laboratorio, publicado tal cual, sin validación independiente (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de interpretabilidad); la lente opera sobre un transformer con `d = 5120`, `d_ff = 17408` y penultimo bloque 62 |
| Parametros totales | No disponible para los mapas; el modelo base se identifica como `Qwen/Qwen3.6-27B` (27B segun su nombre, cifra no verificada en la informacion disponible) |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el artefacto se distribuye en precision flotante dentro de safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; el unico ejemplo de la model card muestra una lectura con tokens en ingles (`removing`, `removal`) y en chino (`消除`), pero no se declara soporte multilingue |
| Licencia | `other`, sujeta ademas a la licencia del modelo base `Qwen/Qwen3.6-27B` |
| Formato de pesos | `safetensors` (fichero `mlp_jlens_maps.safetensors`, 0,6 GB) |

Tensores incluidos:

| Tensor | Forma | Significado |
|---|---|---|
| `readout_dpenult_dmlp42` = `J[42] @ down_42` | `[5120, 17408]` | Jacobiano medio exacto `∂h_penult/∂(activaciones de neuronas MLP de la capa 42)` |
| `readin_dmlp62_dh42_exact` | `[17408, 5120]` | Jacobiano medio exacto `∂(activaciones MLP penultima capa)/∂h_42`, por autodiferenciacion inversa |
| `readin_dmlp62_dh42_gateJ` = `gate_62 @ J[42]` | `[17408, 5120]` | Composicion de primer orden naive, solo como referencia (casi ortogonal al mapa exacto, coseno ~0,03) |
| `J_42` | `[5120, 5120]` | Lente jacobiana de espacio de trabajo en la capa 42 |
| `mu_h42` | `[5120]` | Media del residual de la capa 42; hay que restarla antes de leer |
| `mu_mlp42_acts` | `[17408]` | Media de las activaciones MLP de la capa 42, para centrar la lectura |

## Arquitectura y entrenamiento

La lente utilizada es el jacobiano promedio `E_context[∂h_penult / ∂h_ℓ]` del residual penúltimo (omitiendo el ultimo bloque) respecto al residual de la capa ℓ, leido con `finalnorm + W_U` del modelo. Este repositorio no entrena nada: compone esa matriz `J[42]` con los pesos del MLP de la capa 42 para obtener el jacobiano medio hacia y desde ese MLP, es decir, el estado MLP leido a traves de la lente de espacio de trabajo. Las matrices `J` proceden de `camilablank/workspace-lenses` y no se documenta en esta ficha el corpus ni el numero de tokens sobre el que se promediaron.

La innovacion tecnica del artefacto es la distincion entre el mapa exacto y la composicion naive. El mapa de lectura `readout_dpenult_dmlp42` se calcula como `J[42] @ down_42`, mientras que el mapa de escritura `readin_dmlp62_dh42_exact` se obtiene por autodiferenciacion en modo inverso promediada sobre el corpus, incorporando el efecto presente y futuro a traves del *gating* SiLU real del modelo. La model card advierte de que la composicion naive `gate_62 @ J[42]` es casi ortogonal al mapa exacto (coseno ≈ 0,03) porque ignora el gating SiLU/up y el desplazamiento de un bloque, y pide explicitamente no usarla como mapa de escritura. No se documentan datos de entrenamiento, RLHF ni DPO, porque no hay entrenamiento involucrado.

## Capacidades

- Lectura de conceptos del MLP de la capa 42: dado un forward pass, la matriz de lectura proyecta las activaciones de las neuronas MLP al espacio del residual penultimo y permite obtener distribuciones sobre el vocabulario con `finalnorm + W_U`. El ejemplo de la model card muestra `bug → removing / removal / 消除`.
- Es una lectura de concepto u operacion (que aporta la neurona), no un predictor del siguiente token; la model card lo explicita.
- Mapa de escritura exacto del MLP de la capa 42 hacia las neuronas MLP de la capa 62, incluyendo el efecto a traves del gating real.
- Centrado de activaciones: los vectores `mu_h42` y `mu_mlp42_acts` permiten restar la componente persistente de *massive activations* antes de leer.
- Control negativo incorporado: `readin_dmlp62_dh42_gateJ` sirve para comparar contra la aproximacion de primer orden.
- Integracion con `transformers` y PyTorch mediante un `forward_hook` sobre `model.model.layers[42].mlp.down_proj` para capturar la entrada de `down_proj`.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento: no es un modelo generativo desplegable.
- Idiomas: no se declara ningun conjunto de idiomas soportados; el ejemplo con tokens chinos no equivale a una declaracion de cobertura multilingue.

## Casos de uso

- Auditoria de hipotesis de espacio de trabajo global: aplicar la lente sobre un prompt controlado para comprobar si un concepto concreto (por ejemplo, una operacion aritmetica o una entidad) aparece en la lectura del MLP de la capa 42 en el token relevante, usando `readout_dpenult_dmlp42` y el vocabulario del modelo base.
- Trazado de circuitos entre capas: usar `readin_dmlp62_dh42_exact` para identificar que features MLP de la capa 62 activa una direccion dada de la capa 42 y reconstruir el camino de informacion entre ambos bloques.
- Analisis de *massive activations*: restar `mu_h42` y `mu_mlp42_acts` antes de cualquier lectura para separar la componente persistente de sesgo de la variacion dependiente del token, y estudiar como cambia la lectura al hacerlo.
- Comparacion de metodos de interpretabilidad: contrastar la lectura de concepto obtenida con la lente contra la de un *logit lens* clasico o contra features de un SAE entrenado sobre la misma capa, para medir en que coinciden y en que divergen.
- Validacion metodologica de mapas de escritura: usar `readin_dmlp62_dh42_gateJ` como control negativo y cuantificar el error de la aproximacion de primer orden frente al mapa exacto en distintas direcciones de entrada.
- Estudio de sesgos de vocabulario en la lectura: repetir la lectura sobre prompts en distintos idiomas o dominios y observar la distribucion de tokens de la cabecera (incluidos tokens no ingleses, como el `消除` del ejemplo) para caracterizar el sesgo del espacio de salida.
- Analisis de un caso de depuracion de codigo: replicar el ejemplo de la model card capturando la activacion de la capa 42 en el token `bug` y verificando que la lectura se concentra en operaciones de eliminacion o correccion.
- Docencia e investigacion reproducible: servir como material didactico para explicar la diferencia entre un jacobiano medio y un predictor entrenado, dado que el repositorio incluye tanto el mapa exacto como su aproximacion incorrecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y no tendria sentido aplicarlas porque el artefacto no es un modelo generativo.

El unico dato cuantitativo aportado es la similitud coseno entre la composicion naive `gate_62 @ J[42]` y el mapa exacto `readin_dmlp62_dh42_exact`, que la model card situa en aproximadamente 0,03. El resto de la evidencia es cualitativa: el ejemplo de lectura `bug → removing / removal / 消除`.

## Requisitos de hardware

- Los mapas en si ocupan 0,6 GB, por lo que caben en cualquier GPU de consumo e incluso en memoria RAM para su analisis por separado.
- El coste real lo impone el modelo base: ejecutar `Qwen/Qwen3.6-27B` en `bfloat16` requiere del orden de 54 GB solo para pesos (estimacion a partir de los 27B declarados en el nombre), mas activaciones y cache; en la practica implica una A100 80 GB, una H100 o varias GPU de 48 GB.
- Cuantizaciones de 8 bits llevarian los pesos a unos 27 GB y las de 4 bits a unos 14 GB (estimaciones), lo que permitiria usar una RTX 4090 o una RTX 3090 de 24 GB en 4 bits; no obstante, cualquier cuantizacion del modelo base introduce error respecto de los pesos con los que se calcularon los jacobianos y degrada la fidelidad de la lectura.
- Se necesita ademas la cabeza de salida `W_U` y el modulo `norm` en memoria para proyectar la lectura a logits, algo que ya forma parte del modelo base.
- Opciones de despliegue: la model card usa `transformers` con `AutoModelForCausalLM`, `torch_dtype=torch.bfloat16`, `device_map="cuda"` y un `forward_hook` sobre `layers[42].mlp.down_proj`. Servidores de inferencia como vLLM, TGI u Ollama no son adecuados para este flujo, porque el analisis requiere acceso directo a las activaciones internas de una capa concreta; los pesos en formato GGUF no sirven para el procedimiento descrito.
- Latencia y throughput: no disponible; no se documentan mediciones.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ceselder/qwen3.6-27b-mlp-jlens` | Mapas jacobianos MLP de la capa 42 sobre Qwen3.6-27B | No aplica (0,6 GB de tensores; `d = 5120`, `d_ff = 17408`) | No aplica | `other` | HuggingFace, 0 descargas |
| `camilablank/workspace-lenses` | Lentes jacobianas de espacio de trabajo (`J` por capa) | No aplica | No aplica | No disponible en la informacion proporcionada | HuggingFace; es la fuente de `J_42` |
| *Logit lens* clasico | Tecnica de lectura, no un artefacto publicado como tal | No aplica | No aplica | No aplica | Implementable sobre cualquier transformer |
| SAE de una capa concreta (por ejemplo, familias tipo Gemma Scope) | Diccionario disperso entrenado para leer features | No aplica | No aplica | No disponible en la informacion proporcionada | HuggingFace |

No hay datos de rendimiento comparables entre estas opciones en la informacion disponible; la comparacion relevante es metodologica (jacobiano medio exacto frente a composicion de primer orden, y lectura de concepto frente a features de SAE), no de metricas.

## Limitaciones y advertencias

- No es un modelo generativo: no genera texto, no soporta tool calling ni agentes, y no debe presentarse como un LLM utilizable.
- Es un artefacto de investigacion distribuido "as-is", sin paper enlazado con URL verificable (la model card menciona un "Jacobian Lens paper" sin enlace) y sin validacion independiente: 0 descargas y 0 likes.
- La lectura es un jacobiano medio, no un predictor entrenado; la model card advierte explicitamente de que un predictor de minimos cuadrados de la activacion aguas abajo es un objeto distinto y no se incluye.
- La composicion naive `gate_62 @ J[42]` no debe usarse como mapa de escritura: es casi ortogonal al mapa exacto (coseno ≈ 0,03) y su uso induce conclusiones erroneas.
- Los mapas estan ligados a la capa 42 y al checkpoint exacto `Qwen/Qwen3.6-27B`; un cambio de revision o de pesos invalida las matrices.
- El procedimiento depende de hooks sobre la entrada de `down_proj`, por lo que no es aplicable a modelos servidos tras una API ni a motores que no expongan activaciones intermedias.
- Riesgo de sobreinterpretacion: la lectura de concepto puede reflejar correlaciones del corpus de promediado y no mecanismos causales; se recomienda acompanarla de intervenciones o de mapas exactos antes de afirmar causalidad.
- Licencia `other` sin terminos detallados en la informacion disponible, y sujeta a la licencia del modelo base; el uso comercial no queda aclarado.
- Idiomas soportados no declarados; el ejemplo con tokens en chino no constituye una garantia de cobertura multilingue.
- No se documentan sesgos especificos, pero al proyectar sobre el vocabulario del modelo base hereda los sesgos de su espacio de salida.
- Fechas de creacion y actualizacion registradas como 2026-09-19, con apenas cinco segundos de diferencia entre ambas; el repositorio no muestra senales de mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/qwen3.6-27b-mlp-jlens
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Lentes de espacio de trabajo (fuente de las matrices `J`): https://huggingface.co/camilablank/workspace-lenses
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los resultados recibidos correspondian al motor de videojuegos GDevelop (`https://gdevelop.io/`, `https://gdevelop.io/download`, `https://editor.gdevelop.io/`, `https://apps.microsoft.com/detail/9ngs8qr5d9pl`, `https://gdevelop.io/game-makers`) y no guardan relacion con el artefacto descrito. No se dispone por tanto de paper, blog o repositorio adicional que enlazar.
