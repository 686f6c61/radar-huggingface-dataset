# senku21x/olmo3-32b-jacobian-lens-checkpoints

## Resumen

`senku21x/olmo3-32b-jacobian-lens-checkpoints` no es un modelo de lenguaje, sino una coleccion de artefactos de interpretabilidad: diez lentes jacobianas (J-lenses) ajustadas una por checkpoint sobre OLMo-3-32B de Allen AI. Cada lente es un operador lineal de 5120x5120 en fp16 por capa (63 capas, de la 0 a la 62) que transporta el flujo residual tras el bloque `l` hasta la base del bloque final, de modo que puede leerse con el `lm_head` del modelo. El autor es `senku21x` y el repositorio se publico el 13 de octubre de 2026 con licencia Apache-2.0.

El interes esta en que cubre la dinamica completa de entrenamiento: seis checkpoints de la etapa 1 de preentrenamiento (`stage1-step5000` a `stage1-step656000`), el modelo base tras mid-training (`main`) y las tres etapas de post-entrenamiento Think (SFT, DPO y Think final). Al existir una lente distinta por checkpoint, se puede medir como se forma el "J-space" a lo largo del entrenamiento en lugar de observarlo solo en el modelo final.

El repositorio ocupa 29,7 GB y cada `lens_J.pt` pesa aproximadamente 3,1 GB, con 1.651.507.200 parametros por lente. Es material de investigacion en interpretabilidad mecanicista, no un artefacto de despliegue: no tiene pipeline de inferencia, no registra descargas ni "likes" en el momento de la consulta y su valor depende de reproducir el ajuste con la implementacion de referencia de Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador jacobiano lineal por capa (lente jacobiana) sobre un transformer decoder-only; cada `J[l]` es una matriz de 5120x5120 que mapea el flujo residual tras el bloque `l` al flujo residual tras el bloque final (63) |
| Parametros totales | 1.651.507.200 por lente (63 capas x 5120 x 5120, fp16); aproximadamente 16,5 mil millones en el conjunto de 10 lentes |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; los prompts de ajuste de las lentes se truncan a 128 tokens y se usan 111 de esas 128 posiciones |
| Tipos de cuantizacion | no disponible; los tensores se publican en fp16 y el ajuste se hizo en bf16 con acumulacion en fp32 |
| Idiomas soportados | no disponibles (el ajuste usa parrafos de wikitext-103-raw, mayoritariamente en ingles) |
| Licencia | apache-2.0 (el modelo base se rige por los terminos de Allen AI, no verificados en la informacion disponible) |
| Formato de pesos | PyTorch (`.pt`, cargado con `torch.load(..., weights_only=True)`); metadatos en JSON (`e7b.json`, `e7d_l16_check.json`, `readout_items.json`, `log.txt`) |
| Dimension oculta | 5120 |
| Numero de capas cubiertas | 63 (capas fuente 0 a 62) |
| Tamano del repositorio | 29,7 GB |

## Arquitectura y entrenamiento

La lente no entrena un modelo: ajusta un jacobiano. Para cada capa `l` se estima el jacobiano de la salida del bloque final respecto de la salida del bloque `l`, sumando cotangentes sobre todas las posiciones objetivo `p' >= p`, promediando despues sobre posiciones fuente y sobre prompts. El resultado es un diccionario `{layer: tensor fp16 [5120, 5120]}` indexado como `[target_dim, source_dim]`, que se aplica como `z = h @ J[l].T` seguido del `norm` y el `lm_head` del modelo base. El ajuste se hizo llamando sin modificar a `jlens.fitting.jacobian_for_prompt` de la implementacion de referencia de Anthropic, con pesos y autograd en bf16 y acumulacion en fp32.

La receta de ajuste es deliberadamente ligera: 10 parrafos de validacion de wikitext-103-raw de al menos 600 caracteres (saltando los primeros 700 que cumplen la condicion), truncados a 128 tokens. Se descartan las 16 primeras posiciones (`skip_first = 16`, valor por defecto del repositorio, pensado para los attention sinks) y la posicion final, quedando 111 posiciones utiles. No se antepone token BOS en ningun checkpoint (`force_bos=False`): los checkpoints base no tienen BOS y los tokenizadores de post-entrenamiento si, pero se dejo desactivado para tokenizar todos los checkpoints igual. El propio autor advierte que 10 secuencias estan muy por debajo de las 1000 del articulo de referencia, por lo que cada lente debe tratarse como una estimacion unica y ruidosa.

El estudio que acompania al repositorio describe tres fenomenos. Primero, no hay un inicio abrupto: la CKA entre lentes de capas adyacentes es >= 0,98 en todos los checkpoints. Segundo, la lente abandona el formato de salida en un frente que barre la pila durante el preentrenamiento; la primera capa cuya J-lens se parece a la logit lens (CKA >= 0,8) es la 14, 17, 23, 26, 30, 39 y 41 en los checkpoints de 5k, 10k, 30k, 100k, 300k, 656k y `main`, respectivamente, con el limite mas marcado migrando de L4 a L22. Tercero, la lectura en capas tempranas se concentra: a partir de 30k-100k la energia de lectura de L0 se concentra en unas pocas direcciones y el eje de lectura dominante de L16 pasa de aproximadamente el 2 % al 46 % de la energia, sin que ese eje corresponda a una direccion residual fija entre checkpoints. El paso por SFT mueve el frente parcialmente hacia atras (primera capa logit-like en 30). El motivo de que la lente se aleje del formato de salida (terminos entre posiciones frente a terminos dentro de la posicion) queda sin comprobar.

## Capacidades

- Lectura intermedia del flujo residual de OLMo-3-32B en cualquier capa 0-62, transportando la activacion a la base del bloque final y proyectandola con el `lm_head` del modelo.
- Seguimiento de la dinamica de entrenamiento: cada checkpoint de la etapa 1 de preentrenamiento tiene su lente propia, lo que permite comparar etapas de 5k a 656k pasos.
- Comparacion preentrenamiento frente a post-entrenamiento: checkpoints `main`, `think-sft`, `think-dpo` y `think` con lentes independientes.
- Analisis de similitud entre representaciones: CKA entre lentes, CKA frente a la logit lens y coseno entre el vector de la J-lens y el de la logit lens.
- Deteccion de espectro del operador legible por capa (k50 y participacion efectiva) mediante `e7b.json`.
- Analisis de ejes propios dominantes de `J^T M J` en las capas 0, 4, 8, 16 y 24 (`e7d_l16_check.json`, donde esta presente).
- Evaluacion de lectura de entidades puente en prompts de dos saltos con entidad de control, con rangos por item en `readout_items.json`.
- Reproducibilidad completa del ajuste: cada carpeta incluye `log.txt` con el registro de ajuste.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales por si mismo: es un instrumento de analisis que requiere el modelo base para producir logits.

## Casos de uso

- Auditoria de la formacion de representaciones durante el preentrenamiento: cargando las lentes de `stage1-step5000` a `stage1-step656000` y midiendo la CKA frente a la logit lens, se localiza en que paso y en que capa aparece la primera lectura compatible con el formato de salida (de la capa 14 en 5k a la 41 en `main` en este ajuste).
- Analisis del efecto del post-entrenamiento: comparando la lente de `main` con la de `think-sft` se observa si la alineacion con el formato de salida retrocede (en el estudio, de 41 a 30), util para estudiar que cambia el SFT en el flujo residual.
- Interpretabilidad de circuitos concretos: con `readout_items.json` se pueden replicar los rangos de lectura de entidades puente en prompts de dos saltos y comparar la J-lens contra la logit lens con una entidad de control, un metodo aplicable a tareas de recuperacion factual.
- Investigacion de attention sinks: las 16 primeras posiciones se excluyen del ajuste, lo que permite estudiar por separado como se comporta la lente en esas posiciones frente a las 111 restantes.
- Analisis de concentracion direccional: siguiendo el eje de lectura dominante de L16 (de alrededor del 2 % al 46 % de la energia de lectura) se puede caracterizar en que momento aparece una direccion dominante y como cambia entre checkpoints.
- Desarrollo de metodologia de lentes jacobianas: sirve como linea base reproducible con 10 prompts para calibrar cuanto ruido introduce un ajuste reducido frente al ajuste de referencia con 1000 secuencias, antes de invertir computo en un ajuste mayor.
- Docencia en interpretabilidad mecanicista: cada lente cabe en una GPU de consumo para su analisis y el flujo de trabajo completo (modelo en bf16 mas una lente fp16) es reproducible con `transformers` y `torch`, sin herramientas propietarias.
- Comparacion entre familias de modelos: el mismo procedimiento (`jacobian_for_prompt` con `skip_first=16`, 128 tokens) puede replicarse sobre otros transformers decoder-only para contrastar el frente de transicion capa a capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no declara evaluaciones en MMLU, HumanEval, GSM8K ni similares, y las lentes no se evaluan como modelos generativos.

Los datos cuantitativos disponibles son observaciones del estudio asociado, obtenidas de ajustes unicos y de analisis post hoc, no resultados de benchmark:

| Metrica observada | Valor |
|---|---|
| CKA entre lentes de capas adyacentes | >= 0,98 en todos los checkpoints |
| Primera capa con CKA(J-lens, logit lens) >= 0,8, `stage1-step5000` | 14 |
| Primera capa con CKA >= 0,8, `stage1-step10000` | 17 |
| Primera capa con CKA >= 0,8, `stage1-step30000` | 23 |
| Primera capa con CKA >= 0,8, `stage1-step100000` | 26 |
| Primera capa con CKA >= 0,8, `stage1-step300000` | 30 |
| Primera capa con CKA >= 0,8, `stage1-step656000` | 39 |
| Primera capa con CKA >= 0,8, `main` | 41 |
| Primera capa con CKA >= 0,8, `think-sft` | 30 |
| Primera capa con CKA >= 0,8, `think-dpo` y `think` | no disponible |
| Limite de CKA mas marcado en preentrenamiento | migra de L4 a L22 |
| Eje de lectura dominante de L16 | de aproximadamente el 2 % a 46 % de la energia de lectura entre 30k y checkpoints posteriores |
| Resolucion de diferencias entre checkpoints tardios | diferencias por debajo de 0,07 de CKA no son resolubles con un solo ajuste de 10 prompts |
| Secuencias de ajuste por lente | 10 (frente a 1000 en el articulo de referencia) |
| Posiciones utiles por prompt | 111 de 128 |

## Requisitos de hardware

- Tamano de cada lente: aproximadamente 3,1 GB en fp16 (`lens_J.pt`); cargar las diez simultaneamente requiere unos 31 GB de RAM o VRAM.
- Modelo base OLMo-3-32B en bf16: alrededor de 64 GB de pesos, mas activaciones y cache; una sola GPU de 80 GB (A100, H100, H200) o reparto en varias GPU con `accelerate` o `tensor parallelism`.
- No cabe en una GPU de consumo de 24 GB (RTX 4090, RTX 3090) en bf16. Si solo se analizan las lentes y las activaciones ya extraidas, una lente de 3,1 GB si cabe en 8-12 GB de VRAM.
- Cuantizar el modelo base para reducir VRAM no esta documentado y alteraria el flujo residual que se pretende leer, por lo que no es un atajo recomendable sin validacion previa.
- Opciones de despliegue: no es un modelo de inferencia. Se usa con `transformers` (`AutoModelForCausalLM`) mas `torch`, y requiere acceso a los estados ocultos residuales. vLLM, TGI, llama.cpp y Ollama no aplican a este artefacto.
- Latencia y throughput: no disponibles. El coste dominante es un forward del modelo de 32B por lote de prompts para extraer las activaciones; la aplicacion de la lente es una multiplicacion de 5120x5120 en fp32 por capa y posicion.
- Almacenamiento: 29,7 GB para el repositorio completo; conviene descargar solo las carpetas de los checkpoints que se vayan a estudiar.

## Comparativa con modelos similares

No se dispone de otros repositorios publicos de lentes jacobianas por checkpoint comparables en la informacion proporcionada. La comparacion relevante es metodologica:

| Aspecto | Estas J-lenses | Logit lens | Implementacion de referencia del articulo |
|---|---|---|---|
| Que es | Jacobiano futuro-sumado ajustado por checkpoint | Proyeccion directa del residual con el `lm_head` | Jacobiano futuro-sumado |
| Ajuste necesario | Si, una lente por checkpoint | No | Si |
| Secuencias de ajuste | 10 parrafos de wikitext-103-raw (128 tokens) | Ninguna | 1000 secuencias |
| Coste computacional | Bajo (10 prompts, bf16 con acumulacion fp32) | Nulo | Alto |
| Fidelidad esperada | Estimacion unica y ruidosa; diferencias < 0,07 de CKA no resolubles | Aproximacion de baja fidelidad en capas tempranas | Referencia publicada |
| Cobertura de checkpoints | 10 (6 de etapa 1, base, SFT, DPO, Think) | Cualquier checkpoint | No disponible |
| Licencia | Apache-2.0 | No aplica | No disponible |
| Disponibilidad | Publicado en HuggingFace, 0 descargas y 0 likes en la fecha de consulta | Universal | Codigo en GitHub |

## Limitaciones y advertencias

- Cada lente procede de un unico ajuste con 10 prompts, sin replicas. El propio autor indica que diferencias de CKA inferiores a 0,07 entre checkpoints tardios no son resolubles con estos datos.
- Los campos `lens_cka`, `lens_cka_vs_logit` y `lens_vs_logit_cos` de `e7b.json` se calcularon con un conjunto de tokens defectuoso: 2294 de los 3000 tokens "frecuentes" eran relleno de cuenta cero. La CKA corregida esta en `cka_freqset.json` en la raiz del repositorio. Las lentes en si no estan afectadas, pero cualquier analisis basado en `e7b.json` debe rehacerse.
- Las mediciones de `think-sft`, `think-dpo` y `think` se hicieron sobre wikitext en crudo, sin plantilla de chat; no reflejan el comportamiento de estos checkpoints en su formato de uso previsto.
- El tokenizador de los checkpoints base no tiene token BOS y los de post-entrenamiento si, pero se ajusto con `force_bos=False` en todos. Es una decision de consistencia que puede no coincidir con el uso estandar de los modelos Think.
- Cada lente solo es valida para el checkpoint (revision) con el que se ajusto. Aplicarla sobre otro checkpoint produce lecturas sin garantia.
- No hay informe de sesgos, evaluaciones de seguridad ni auditoria de terceros. El repositorio no tiene descargas ni "likes" en la fecha consultada, por lo que carece de validacion de la comunidad.
- No es un modelo generativo: no admite generacion de texto, tool calling, agentes, vision ni audio, y no debe presentarse como tal en ningun catalogo de modelos.
- Restricciones de licencia: el repositorio declara Apache-2.0 para las lentes, pero el uso del modelo base y de los pesos de OLMo-3-32B se rige por los terminos de Allen AI. No se han verificado esos terminos en la informacion disponible; conviene consultarlos antes de cualquier uso comercial del pipeline completo.
- El ajuste excluye las 16 primeras posiciones del prompt, de modo que no hay lente calibrada para esas posiciones; extrapolar conclusiones a attention sinks no esta respaldado.
- El repositorio ocupa 29,7 GB, mayoritariamente tensores fp16 redundantes entre checkpoints; su gestion en disco y en memoria debe planificarse.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/senku21x/olmo3-32b-jacobian-lens-checkpoints
- Implementacion de referencia de lentes jacobianas de Anthropic: https://github.com/anthropics/jacobian-lens
- Modelo base OLMo-3-1125-32B: https://huggingface.co/allenai/Olmo-3-1125-32B
- OLMo-3-32B-Think-SFT: https://huggingface.co/allenai/Olmo-3-32B-Think-SFT
- OLMo-3-32B-Think-DPO: https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- OLMo-3-32B-Think: https://huggingface.co/allenai/Olmo-3-32B-Think
- Revisiones de etapa 1 del modelo base (`stage1-step5000`, `stage1-step10000`, `stage1-step30000`, `stage1-step100000`, `stage1-step300000`, `stage1-step656000`): accesibles como revisiones del repositorio https://huggingface.co/allenai/Olmo-3-1125-32B (por ejemplo, https://huggingface.co/allenai/Olmo-3-1125-32B/tree/stage1-step5000)
- Corpus de ajuste wikitext-103-raw: no se proporciona enlace en la model card; el conjunto de referencia habitual es https://huggingface.co/datasets/Salesforce/wikitext (configuracion `wikitext-103-raw-v1`)
- Nota sobre la busqueda web: no se han encontrado resultados relevantes para este modelo. Los resultados devueltos correspondian a anuncios y articulos sobre el automovil Mazda MX-5 (NA) y no guardan relacion con el artefacto descrito.
