# johntzwei/OLMo-2-0425-1B-Instruct_diag_fisher

## Resumen

OLMo-2-0425-1B-Instruct_diag_fisher no es un modelo de lenguaje, sino un artefacto derivado de curvatura: contiene la estimacion de la **Fisher diagonal empirica a nivel de secuencia** para las siete matrices de proyeccion (atencion y MLP) de cada una de las 16 capas del transformer del checkpoint `allenai/OLMo-2-0425-1B-Instruct`. Lo publica el usuario `johntzwei` como recurso auxiliar para investigacion sobre curvatura, seleccion de parametros, poda o analisis de sensibilidad, no para inferencia directa.

El fichero `diagonal.safetensors` almacena 112 tensores float32 no negativos que cubren 1.073.741.824 coordenadas escalares, calculados sobre 2.443 secuencias empaquetadas de 4.096 tokens procedentes de `allenai/dolmino-mix-1124` (10.004.085 objetivos next-token puntuados). Se excluyen embeddings, layer norms y `lm_head`, por lo que no debe interpretarse como una cobertura de los aproximadamente 1B parametros del modelo base.

Su relevancia es metodologica: documenta con precision el estimando exacto, la procedencia del muestreo, las semillas y el entorno de calculo (una H100 80GB, PyTorch 2.11, Transformers 5.12), lo que permite reproducir y auditar el calculo. Es util para quien necesite una aproximacion de la matriz de informacion de Fisher sin tener que recalcularla, pero no constituye un detector de pertenencia ni un checkpoint entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de curvatura derivado de un transformer decoder OLMo-2) |
| Parametros totales | 1.073.741.824 coordenadas escalares en 112 tensores float32 (subconjunto de proyecciones del modelo base 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencias de 4.096 tokens empaquetados (4.095 objetivos puntuados por secuencia) |
| Tipos de cuantizacion | No disponible (los tensores se publican en float32) |
| Idiomas soportados | No disponible (depende del modelo base y del corpus dolmino-mix-1124) |
| Licencia | No disponible |
| Formato de pesos | `diagonal.safetensors` (float32) |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo: calcula, para cada coordenada \(j\) de las matrices seleccionadas, la media del cuadrado del gradiente de la perdida media de next-token por secuencia, \(\widehat F_{jj} = \frac{1}{2443}\sum_{i=1}^{2443}(\partial \ell_i/\partial \theta_j)^2\). Se realiza un unico paso forward/backward por secuencia (no se promedia la perdida del batch antes de elevar al cuadrado), con pesos BF16 y atencion `sdpa` en el checkpoint `allenai/OLMo-2-0425-1B-Instruct` (revision `48d788eca847d4d7548f375ad03d3c9312f6139e`); los gradientes por secuencia se convierten a float32, se elevan al cuadrado y se acumulan en float32.

Las matrices cubiertas son `self_attn.{q_proj,k_proj,v_proj,o_proj}.weight` y `mlp.{gate_proj,up_proj,down_proj}.weight` en `model.layers.{0..15}`. La muestra se construye con el tokenizador fijado de `allenai/OLMo-2-1124-7B-Instruct` (verificado contra el del 1B) sobre `allenai/dolmino-mix-1124` (revision `a319f19eef1e257417b11ea8c30da266ae175557`), con cuotas por familia: DCLM 47,2%, FLAN 16,6%, peS2o 5,85%, Wiki 7,11%, StackExchange 2,45% y Math 20,8%. Se usan dos semillas con funciones distintas (42 para el muestreo de documentos, 2025 para el barajado e intercalado de filas). El calculo se ejecuto en una NVIDIA H100 80GB con PyTorch `2.11.0+cu130`, CUDA 13.0 y Transformers 5.12.1, con verificacion independiente en CPU y preflight de gradientes sobre secuencias reales.

## Capacidades

- No genera texto ni realiza inferencia: es un tensor de curvatura, no un modelo desplegable.
- Proporciona estimaciones de Fisher diagonal para 112 matrices de proyeccion de las 16 capas del OLMo-2 1B Instruct.
- Permite analisis de sensibilidad por coordenada, ranking de parametros y estudios de poda o seleccion basados en curvatura.
- Sirve como referencia para comparar metodos de estimacion de curvatura (diagonal frente a Kronecker, K-FAC, etc.).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso por si mismo.
- No es un detector de pertenencia ni un inverso de Fisher ni un gradiente precondicionado.

## Casos de uso

- Investigacion en estimacion de curvatura: usar el tensor como referencia para validar implementaciones propias de Fisher diagonal sobre OLMo-2 1B, comparando coordenada a coordenada.
- Poda y compresion consciente de curvatura: emplear \(\widehat F_{jj}\) para priorizar que coordenadas de las proyecciones eliminar o cuantizar con menor impacto esperado en la perdida.
- Analisis de sensibilidad por capa: estudiar como se distribuye la curvatura entre atencion y MLP a lo largo de las 16 capas y relacionarlo con comportamiento del modelo.
- Estudio de seleccion de datos: como la muestra se construyo con cuotas por familia (DCLM, FLAN, Math, etc.), permite analizar la influencia del mix de midtraining en la curvatura por subconjunto.
- Reproducibilidad metodologica: replicar el pipeline (semillas 42 y 2025, revisiones fijadas, H100) para generar artefactos equivalentes sobre otros checkpoints OLMo-2.
- Docencia y formacion: ilustrar el calculo empirico de la matriz de informacion de Fisher con un ejemplo real, publico y auditado, sin necesidad de entrenar.
- Base para tecnicas de influencia o regularizacion: usar la diagonal como aproximacion de la metrica de Fisher en metodos tipo EWC o en analisis de olvido catastrofico sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable en tareas de NLP; su validacion se limita a comprobaciones de correccion numerica (preflight de gradientes, verificacion en CPU y ausencia de valores no finitos o negativos en los 112 acumuladores).

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 4,3 GB (tensores float32 de 112 matrices); no requiere VRAM para su lectura.
- Para recalcular el artefacto: se documento una unica GPU NVIDIA H100 80GB con un backward por secuencia; no se especifica el minimo viable.
- Para usar los tensores en analisis: cualquier maquina con RAM suficiente para cargar 4,3 GB y un framework que lea `safetensors` (PyTorch, safetensors, NumPy).
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI: no es un modelo de inferencia.
- Latencia y throughput: no disponible (no hay inferencia implicada).

## Comparativa con modelos similares

| Artefacto | Modelo base | Cobertura | Formato | Licencia |
|---|---|---|---|---|
| johntzwei/OLMo-2-0425-1B-Instruct_diag_fisher | OLMo-2-0425-1B-Instruct | 112 matrices de proyeccion, 16 capas, 1.073.741.824 coordenadas | safetensors float32 | No disponible |
| Alternativas equivalentes de Fisher diagonal para OLMo-2 | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros artefactos de curvatura publicos comparables para este checkpoint concreto.

## Limitaciones y advertencias

- No es un checkpoint de lenguaje: no puede cargarse para generar texto ni sustituye al modelo base.
- Cobertura parcial: excluye embeddings, layer norms y `lm_head`; no representa los aproximadamente 1B parametros del modelo.
- Muestra no aleatoria: cinco familias no matematicas provienen de prefijos de un unico shard sembrado y la de matematicas de 16 shards; no es una extraccion uniforme de toda la distribucion de midtraining ni reproduce el orden original de entrenamiento.
- No es un inverso de Fisher, ni un gradiente precondicionado, ni un detector de pertenencia; usarlo como tal produciria conclusiones invalidas.
- La reconstruccion bit a bit exige los documentos crudos y los IDs de token, que no se incluyen en el repositorio.
- El calculo usa BF16 en el forward/backward (no float32 completo), lo que introduce tolerancia numerica en los gradientes.
- La auditoria detecto cero intersecciones exactas con 11.506 hashes de OLMo-Detect, pero no descarta near-duplicates.
- Licencia no declarada: verificar los terminos antes de cualquier uso comercial o redistribucion.
- Sesgos, alucinacion y limitaciones idiomaticas dependen del modelo base y del corpus, no documentados aqui.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/johntzwei/OLMo-2-0425-1B-Instruct_diag_fisher
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Tokenizador de referencia: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Dataset de origen: https://huggingface.co/datasets/allenai/dolmino-mix-1124
