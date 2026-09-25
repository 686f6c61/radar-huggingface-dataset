# SecondLookResearch/Qwen2.5-32B-graft0-a1-terrasp-da-e10

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT denominado `Qwen2.5-32B-graft0-a1-terrasp-da-e10`, publicado por la organizacion SecondLookResearch. No es un modelo completo, sino un adaptador que se monta sobre `Qwen/Qwen2.5-32B`, un transformer decoder-only denso de 32.000 millones de parametros entrenado por Alibaba con hasta 18 billones de tokens segun la documentacion publica de la familia Qwen2.5. El adaptador forma parte de una cadena de dos etapas: segun la model card, es un adaptador "fresco" entrenado sobre una version fusionada y congelada de otro adaptador previo (`graft0-a1`), y debe servirse encima del modelo base parcheado.

La finalidad declarada del adaptador es el "difficult advice" (consejo en situaciones dificiles), con 10 epocas de entrenamiento desde cero, prompts escritos por Sonnet-5 siguiendo plantillas terra-v2 y respuestas de origen terra, con un diseno factorial 2x2 de prompt por respuesta. La configuracion LoRA es r64/a128, restringida a capas lineales, dentro de la plataforma interna denominada "graft0". El repositorio ocupa 2,2 GB, lo que es coherente con un adaptador de rango 64 sobre las proyecciones lineales de un modelo de 64 capas y dimension oculta grande.

Su relevancia practica es limitada pero muy especifica: sirve como ejemplo de composicion de adaptadores encadenados (adapter stacking) sobre un modelo denso de 32B, y como artefacto de investigacion para estudiar el ajuste fino en dos fases con congelacion intermedia. El repositorio no presenta descargas ni valoraciones, no declara licencia, idiomas ni pipeline, y no incluye resultados de evaluacion. Cualquier uso en produccion exige verificar primero la licencia del modelo base y reproducir el pipeline de servido documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; el modelo base es Qwen/Qwen2.5-32B |
| Parametros totales | Modelo base: 32.000 millones (32B). Adaptador: no disponible de forma explicita; la model card indica LoRA r64/a128, linear-only |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (corresponde a la del modelo base Qwen2.5-32B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada para este adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, en formato de adaptador PEFT (library_name: peft) |
| Tamano del repositorio | 2,2 GB |
| Modelo base | Qwen/Qwen2.5-32B |
| Configuracion LoRA | r64, alpha 128, solo capas lineales |
| Etapas de entrenamiento | 10 epocas, "desde cero", sobre el adaptador A1 fusionado y congelado |
| Fecha de creacion | 2026-09-24 |
| Fecha de actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con rango 64 y alpha 128 aplicado unicamente a capas lineales del transformer base. No modifica la arquitectura del modelo subyacente: Qwen2.5-32B es un modelo denso decoder-only con atencion causal estandar, y el adaptador inyecta matrices de bajo rango en las proyecciones lineales. El entrenamiento se realizo en 10 epocas "desde cero" (es decir, no continuando el adaptador anterior, sino inicializando uno nuevo) sobre una plataforma interna llamada graft0, partiendo de un adaptador A1 ya fusionado y congelado. Es, por tanto, un caso de apilamiento secuencial de adaptadores con congelacion intermedia, no de entrenamiento conjunto.

Los datos de entrenamiento declarados consisten en prompts generados por Sonnet-5 siguiendo plantillas terra-v2 y respuestas de origen terra, con un diseno factorial 2x2 de prompt por respuesta. La model card no especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO posteriores. El objetivo declarado es "difficult advice", es decir, respuestas a peticiones de consejo complejas. El pipeline de servido documentado consiste en cargar dos adaptadores sobre el modelo base parcheado, en orden (A1 primero y este despues), mediante el script `code/msm_eval/serve_reconstructed.sh` con las variables `ARM`, `ROW_PATCH` y `ADAPTERS`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes SSM.

## Capacidades

- Generacion de texto y respuesta a prompts conversacionales en el dominio especifico de "difficult advice".
- Ajuste especializado: al ser un LoRA sobre Qwen2.5-32B, hereda las capacidades generales del modelo base (razonamiento, codigo, matematicas, comprension lectora), aunque el entrenamiento puede haberlas desplazado hacia el dominio objetivo.
- Composicion de adaptadores: capacidad operativa de cargarse como segundo adaptador sobre un modelo base parcheado, junto al adaptador A1.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multimodales (vision o audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo "thinking" explicito: no documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Investigacion sobre apilamiento de adaptadores: el repositorio permite reproducir un escenario real de dos LoRA encadenados sobre un modelo denso de 32B, util para estudiar catastrofe olvido, interferencia entre adaptadores y coste de servido multi-adaptador.
- Asistente de consejo especializado en dominio: para prototipos de asesoramiento en situaciones complejas, cargando el par A1 + este adaptador sobre Qwen2.5-32B parcheado y sirviendo mediante el script documentado.
- Generacion de datos sinteticos con estilo controlado: dado que el entrenamiento uso plantillas terra-v2 y respuestas terra, el adaptador puede emplearse para replicar ese estilo de respuesta en tareas de destilacion o aumento de datos, sujeto a verificacion de licencia.
- Evaluacion comparativa de tecnicas de ajuste: sirve como punto de referencia frente a LoRA de una sola etapa o frente a ajuste completo, siempre que se midan metricas propias, ya que el autor no publica benchmarks.
- Reproduccion de experimentos de entrenamiento: los detalles declarados (r64/a128, linear-only, 10 epocas, adaptador fresco sobre base fusionada y congelada) permiten replicar el procedimiento y medir su impacto.
- Fine-tuning posterior sobre el adaptador: al ser un artefacto PEFT independiente, puede servir como punto de partida para una tercera etapa de ajuste especifico de dominio, con el coste de mantener la cadena de dependencias A1 → este adaptador.
- Despliegue interno de bajo coste de almacenamiento: con 2,2 GB de adaptador sobre un unico modelo base compartido, es posible servir varias variantes especializadas sin duplicar los 32B de pesos, si la infraestructura soporta multiples adaptadores (por ejemplo, vLLM con soporte LoRA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluacion especifica de "difficult advice", y tampoco se han encontrado en la busqueda web.

## Requisitos de hardware

- VRAM en precision completa (FP16/BF16): aproximadamente 64 GB solo para los pesos del modelo base de 32B, mas activaciones y cache KV; se recomienda un minimo de 80 GB (A100 80 GB, H100 80 GB).
- VRAM en cuantizacion de 8 bits: en torno a 34-36 GB, viable en una A100 40 GB o en dos GPU consumer de 24 GB con reparto por capas.
- VRAM en cuantizacion de 4 bits: en torno a 18-20 GB, lo que segun la documentacion publica de Qwen2.5-32B permite encajarlo en una unica GPU consumer de 24 GB como RTX 4090 o RTX 3090. Estas cifras son estimaciones derivadas del tamano del modelo base, no datos publicados para este adaptador.
- Adaptador: 2,2 GB adicionales en disco y en memoria durante la carga (los pesos LoRA se pueden fusionar en el modelo base o mantenerse separados).
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090, RTX 3090 o RTX 5090 para 4 bits.
- Opciones de despliegue: el autor documenta el script propio `code/msm_eval/serve_reconstructed.sh` con soporte de multiples adaptadores y parcheo de filas. Para despliegue estandar serian aplicables vLLM (con soporte LoRA), TGI o transformers + PEFT; llama.cpp u Ollama requeririan exportar el modelo fusionado a GGUF, paso no documentado en el repositorio.
- Latencia y throughput: no disponibles. Dependen del backend, del numero de adaptadores activos y de si se aplica cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (graft0-a1-terrasp-da-e10) | Adaptador sobre 32B | LoRA PEFT | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-32B (base) | 32B | Denso decoder-only | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, ampliamente distribuido |
| SecondLookResearch/Qwen2.5-32B-graft0-a1 | Adaptador sobre 32B | LoRA PEFT | No disponible | No disponible | HuggingFace, adaptador previo de la misma cadena |
| SecondLookResearch/Qwen2.5-32B-sdf-named-claude-14M-graft0-a1 | Adaptador sobre 32B | LoRA PEFT | No disponible | No disponible | HuggingFace, variante relacionada del mismo autor |

No se dispone de datos de rendimiento que permitan comparar estos artefactos entre si ni con alternativas de otras familias (por ejemplo, modelos densos de tamano similar). La comparacion se limita a parametros, tipo de artefacto y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del adaptador. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Qwen2.5-32B y aclarar con el autor las condiciones de redistribucion del adaptador.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y no incluye evaluaciones, lo que impide conocer su calidad real frente al modelo base o frente a alternativas.
- Riesgo de degradacion respecto al modelo base: al ser un LoRA entrenado 10 epocas sobre un dataset sintetico de un dominio concreto ("difficult advice"), es probable que las capacidades generales de Qwen2.5-32B se hayan desplazado, con posible perdida en tareas de codigo, matematicas o razonamiento generico. No hay datos que permitan cuantificarlo.
- Riesgo de alucinacion: inherente al modelo base, no mitigado por el ajuste; en tareas de asesoria, una alucinacion puede traducirse en recomendaciones incorrectas con impacto real.
- Datos de entrenamiento sinteticos: los prompts fueron generados por un modelo (Sonnet-5) y las respuestas provienen de una fuente denotada "terra", sin detalle sobre su procedencia, sesgos ni derechos de uso. La composicion del dataset no es auditable con la informacion disponible.
- Dependencia de un pipeline propietario: el servido correcto requiere el script interno `code/msm_eval/serve_reconstructed.sh`, el parcheo de filas (`ROW_PATCH=1`) y cargar dos adaptadores en orden. Fuera de ese pipeline el comportamiento puede diferir del esperado.
- Idiomas no declarados: no hay garantia de calidad multilingue; probablemente el ajuste se realizo en ingles, dado el origen de los prompts y plantillas.
- Contexto no declarado: se desconoce si el adaptador preserva la ventana de contexto completa del modelo base.
- Fechas del repositorio: la model card indica fechas de 2026, lo que conviene verificar antes de citar el artefacto en trabajos academicos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-terrasp-da-e10
- Adaptador previo de la cadena (A1): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1
- Variante relacionada del mismo autor: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-claude-14M-graft0-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Repositorio espejo de la familia Qwen2.5: https://github.com/worldart/QwenLM_Qwen2.5
- Repositorio de la familia Qwen2.5 (espejo): https://github.com/Siabdel/Qwen2.5
- Guia de cuantizacion y VRAM para Qwen2.5-32B: https://opensourcesai.com/models/qwen2-5-32b/
