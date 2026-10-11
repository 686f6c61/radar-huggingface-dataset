# Codemaster67/olmo_1b_vocab_extension_10m

## Resumen

`Codemaster67/olmo_1b_vocab_extension_10m` no es un modelo completo, sino un adaptador QLoRA (PEFT/LoRA) entrenado sobre el checkpoint `Codemaster67/Olmo-1b_token_extension_modern_molbert`, que a su vez deriva de la familia OLMo de aproximadamente 1.000 millones de parámetros. Lo publica el usuario Codemaster67 y su objetivo es el modelado de lenguaje en el dominio químico, en concreto la generacion y el autocompletado de cadenas SMILES (representaciones lineales de moleculas), usando el dataset `Codemaster67/Unichem_10M` (10 millones de moleculas).

Tecnicamente es un adaptador LoRA de rango 64 y alpha 128 aplicado sobre todos los modulos lineales (`all-linear`) de un transformer causal cuantizado en NF4 de 4 bits con doble cuantizacion, con los modulos `embed_tokens` y `lm_head` tambien entrenados y guardados aparte. El entrenamiento fue de una sola epoca, con secuencias empaquetadas de 512 tokens como maximo, 7.512 secuencias de entrenamiento y 393 de validacion, y una perdida final de 4,2704 en entrenamiento y 3,5823 en validacion.

Su relevancia es acotada pero concreta: permite experimentar con generacion de SMILES en hardware de consumo (el repositorio completo ocupa 1,0 GB y el modelo base en 4 bits cabe en GPUs de gama media), y sirve como punto de partida para fine-tuning posterior orientado a prediccion de propiedades moleculares. No obstante, es un artefacto experimental: cero descargas, cero "likes", sin benchmarks publicados y con una model card cuyo titulo menciona "OLMo-7B" aunque el repositorio y el modelo base son de 1B, lo que conviene tener en cuenta al reproducirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) de la familia OLMo; adaptador LoRA sobre modelo base cuantizado |
| Parametros totales | No disponible (el modelo base es de ~1B parametros segun su nombre; el adaptador es un subconjunto LoRA de rango 64) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el entrenamiento uso una longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | Base en NF4 de 4 bits con doble cuantizacion (bitsandbytes); adaptadores entrenados en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se carga cuantizado en 4 bits en tiempo de ejecucion |
| Biblioteca | peft |
| Dataset de entrenamiento | Codemaster67/Unichem_10M |
| Modelo base | Codemaster67/Olmo-1b_token_extension_modern_molbert |
| Tamano del repositorio | 1,0 GB |
| Configuracion LoRA | r=64, alpha=128, escalado efectivo 2.0, dropout 0.01, RSLoRA desactivado, modulos objetivo `all-linear`, modulos guardados `embed_tokens` y `lm_head` |
| Fecha de publicacion | 2026-10-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer causal decoder-only de la familia OLMo, cuyo vocabulario ha sido extendido previamente con tokens propios del dominio quimico (la model card muestra el uso de `<|start_of_smiles|>` y `<|end_of_smiles|>`). El entrenamiento sigue el esquema QLoRA: el modelo base se carga en precision NF4 de 4 bits con doble cuantizacion y `compute_dtype` en bfloat16, y sobre el se entrenan matrices LoRA de rango 64 y alpha 128 (escalado efectivo 2,0) en todos los modulos lineales, con dropout de 0,01. Ademas, se entrenan y guardan los modulos `embed_tokens` y `lm_head`, lo que es coherente con una extension de vocabulario orientada a SMILES. La model card describe "learning rates desacoplados": tanto los adaptadores LoRA como `embed_tokens`/`lm_head` usan 2e-05 (la tabla indica un factor x1.0 pese al texto que menciona 10x menor, una inconsistencia de la propia documentacion).

Los hiperparametros de entrenamiento son: 1 epoca, optimizador AdamW de 8 bits, batch size efectivo 32 (sin acumulacion de gradientes), scheduler coseno con warmup ratio 0,1, weight decay 0,01, gradient checkpointing activado, split de validacion del 5 %, 7.512 secuencias empaquetadas de entrenamiento y 393 de validacion, con longitud maxima de secuencia de 512 tokens. Los resultados reportados son perdida de entrenamiento 4,2704 y perdida de validacion 3,5823. No se documenta ninguna fase de RLHF, DPO, SFT instructivo ni innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla la composicion exacta del dataset `Unichem_10M` mas alla de su caracter quimico.

## Capacidades

- Generacion y autocompletado de cadenas SMILES en formato lineal, incluyendo el uso de tokens especiales de delimitacion (`<|start_of_smiles|>`, `<|end_of_smiles|>`).
- Modelado de lenguaje causal en dominio quimico: continuacion de secuencias de moleculas y muestreo de nuevas estructuras verosimiles a nivel de cadena.
- Punto de partida para fine-tuning supervisado en tareas posteriores de quimica computacional, como prediccion de propiedades moleculares (la propia model card lo indica como uso previsto).
- Generacion condicionada por prefijo: al tratarse de un modelo causal, permite completar fragmentos de SMILES ya escritos.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado ni previsto para este adaptador.
- Vision, audio o modo "thinking": no disponibles.
- Capacidad instruccional en lenguaje natural: degradada respecto al checkpoint base, segun las limitaciones declaradas por el autor.

## Casos de uso

- Generacion de librerias de moleculas candidatas: el modelo puede muestrear cadenas SMILES validas sintacticamente para alimentar pipelines de cribado virtual, reduciendo el coste frente a la enumeracion exhaustiva, siempre que se valide la validez quimica con herramientas externas (RDKit).
- Autocompletado de SMILES en herramientas de dibujo molecular o cuadernos de laboratorio: dado un fragmento inicial, el modelo completa la cadena, lo que acelera la escritura manual de estructuras repetitivas.
- Preentrenamiento de dominio como paso previo a tareas downstream: el adaptador sirve como inicializacion para fine-tuning en prediccion de solubilidad, toxicidad, lipofilia u otras propiedades, aprovechando que el vocabulario ya contiene tokens de SMILES.
- Aumento de datos en quimioinformatica: generacion de variantes de moleculas para ampliar datasets pequenos antes de entrenar modelos discriminativos.
- Exploracion de espacio quimico en investigacion academica: con un repositorio de 1,0 GB y base de 1B en 4 bits, es viable experimentar en una unica GPU de consumo o incluso en CPU para lotes pequenos.
- Prototipado educativo de modelos de lenguaje cientificos: sirve para ilustrar tecnicas de QLoRA, extension de vocabulario y entrenamiento con secuencias empaquetadas en un caso real de dominio.
- Extraccion de representaciones para embeddings moleculares: las activaciones del modelo base con el adaptador pueden reutilizarse como features en clasificadores ligeros, aunque no hay evaluacion publicada de su calidad frente a alternativas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida), que no son comparables con MMLU, HumanEval, GSM8K ni con metricas estandar de quimioinformatica.

| Metrica (entrenamiento) | Valor |
|---|---|
| Perdida de entrenamiento | 4,2704 |
| Perdida de validacion | 3,5823 |
| Epocas | 1 |
| Secuencias empaquetadas de entrenamiento | 7.512 |
| Secuencias empaquetadas de validacion | 393 |
| Longitud maxima de secuencia | 512 |

No hay datos de validez de SMILES generados, unicidad, novedad ni comparaciones con modelos de quimica de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~1B parametros en NF4 de 4 bits ocupa aproximadamente 0,7-1,0 GB de pesos; sumando adaptadores, cache KV y activaciones, un presupuesto practico de 2-3 GB de VRAM es suficiente para lotes pequenos y secuencias cortas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060) es suficiente; GPU de datacenter como A100 o H100 no aportan ventaja relevante a este tamano, salvo por throughput en lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4-6 GB de VRAM; tambien es viable en CPU mediante cuantizacion adicional, con latencia mucho mayor.
- Opciones de despliegue: la ruta documentada por el autor es `transformers` + `peft` + `bitsandbytes` (4 bits NF4). Para `llama.cpp` u `Ollama` seria necesario fusionar el adaptador con el modelo base, desactivar la cuantizacion de 4 bits de bitsandbytes y convertir los pesos a GGUF, un proceso no documentado en la model card. Para vLLM o TGI habria que usar el modelo base sin cuantizar con soporte de adaptadores LoRA, ya que la combinacion directa con QLoRA de bitsandbytes no es la ruta estandar.
- El codigo de ejemplo exige `trust_remote_code=True` tanto en el modelo como en el tokenizador, lo que implica ejecutar codigo remoto del repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de generacion.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables documentados, ya que los resultados devueltos no guardan relacion con el modelo. La comparacion se limita a lo que puede deducirse de la informacion proporcionada.

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Codemaster67/olmo_1b_vocab_extension_10m (este) | Adaptador LoRA r=64 sobre base de ~1B | Adaptador QLoRA de dominio quimico | No disponible (entrenado a 512 tokens) | Apache-2.0 | Requiere el modelo base en 4 bits; sin benchmarks publicados |
| Codemaster67/Olmo-1b_token_extension_modern_molbert | ~1B | Modelo base con vocabulario extendido para quimica | No disponible | No disponible en la informacion proporcionada | Es el punto de partida obligatorio del adaptador |
| Alternativas de dominio quimico (familia ChemBERTa, MoLFormer, etc.) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador QLoRA que exige cargar `Codemaster67/Olmo-1b_token_extension_modern_molbert` en 4 bits para funcionar. Sin ese checkpoint el adaptador no es utilizable.
- La model card se titula "OLMo-7B QLoRA Adapter" mientras que el repositorio y el modelo base corresponden a la variante de 1B; esta discrepancia puede inducir a error sobre el tamano real.
- La documentacion presenta una inconsistencia adicional en la seccion de learning rates desacoplados: el texto describe una tasa 10x menor para `embed_tokens`/`lm_head`, pero la tabla indica el mismo valor (2e-05) con factor x1.0.
- Entrenamiento de una sola epoca y con perdida de validacion relativamente alta (3,5823), sin evidencia de calidad de las moleculas generadas; es esperable un porcentaje relevante de SMILES invalidos que debe filtrarse con validadores externos.
- Sesgos conocidos: no documentados por el autor. Al entrenar sobre un unico dataset quimico, el modelo heredara los sesgos de cobertura de `Unichem_10M` (infrarrepresentacion de ciertas familias quimicas, predominio de moleculas organicas de bajo peso, etc.).
- Riesgo de alucinacion: alto en este contexto, entendido como generacion de cadenas SMILES sintacticamente plausibles pero quimicamente invalidas o no sintetizables. Requiere validacion obligatoria en cualquier uso real.
- Capacidad instruccional degradada: la model card advierte explicitamente de que el seguimiento de instrucciones en lenguaje natural puede empeorar respecto al checkpoint base OLMo, por lo que no es adecuado como asistente conversacional.
- Limitacion idiomatica: solo ingles declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Restricciones de licencia: el adaptador se publica bajo Apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base no se especifica en la informacion proporcionada y debe verificarse antes de cualquier explotacion comercial.
- Requiere `trust_remote_code=True` en modelo y tokenizador, lo que implica ejecutar codigo de terceros; conviene auditar el repositorio antes de usarlo en produccion.
- Madurez muy baja: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks, sin validacion por terceros y con fechas de creacion y actualizacion (2026-10-10) que resultan anomalas.
- No apto para tareas fuera del dominio quimico: no hay evidencia de rendimiento en codigo, matematicas, razonamiento general o tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/olmo_1b_vocab_extension_10m
- Modelo base: https://huggingface.co/Codemaster67/Olmo-1b_token_extension_modern_molbert
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_10M
- Biblioteca PEFT: https://huggingface.co/docs/peft
- bitsandbytes (cuantizacion NF4 de 4 bits): https://github.com/bitsandbytes-foundation/bitsandbytes
- Familia OLMo: https://huggingface.co/allenai/OLMo-1B
- Busqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron unicamente paginas no relacionadas (Twitch, articulos sobre brujeria y la serie W.I.T.C.H.), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales verificables.
