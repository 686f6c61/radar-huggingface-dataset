# liaoweiduo/sae-qwen3vl30ba3b-l10-gs0.05-step600

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un autoencoder disperso (sparse autoencoder, SAE) de tipo TopK entrenado sobre las activaciones de la proyección descendente del MLP de la capa 10 de Qwen/Qwen3-VL-30B-A3B-Instruct. Lo publica el usuario liaoweiduo en HuggingFace y su función es descomponer las activaciones internas de esa capa en 65.536 features dispersas y potencialmente interpretables, con un presupuesto de 256 features activas por token (Top-k = 256). Es una herramienta de interpretabilidad mecanicista, no un modelo generativo: no se le pueden hacer preguntas ni generar texto con él.

El artefacto se distribuye como adaptador en formato safetensors con el layout de claves de la implementación personalizada TOPK_SAE (compatible con PEFT), e incluye un `adapter_config.json` que declara el modelo base, el módulo objetivo (`model.layers.10.mlp.down_proj`) y los hiperparámetros del SAE. El repositorio ocupa 0,5 GB. Se publica un JSON con explicaciones de las features en un dataset aparte del mismo autor.

Su relevancia es acotada pero específica: Qwen3-VL-30B-A3B es un modelo Mixture-of-Experts vision-language de 30.000 millones de parámetros totales y unos 3.000 millones activos, y la capa 10 procesa representaciones tempranas que mezclan información visual y textual. Tener un diccionario entrenado sobre ese punto concreto permite auditar, etiquetar y manipular features multimodales en un modelo abierto de esa escala, algo poco frecuente en el ecosistema de SAEs públicos. Los datos de entrenamiento, licencia e idiomas no están declarados en la model card ni en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) TopK. No es un transformer; se acopla a `model.layers.10.mlp.down_proj` del modelo base |
| Parametros totales | No declarado. Estimacion derivada de las dimensiones indicadas (entrada 2.048, diccionario 65.536, encoder + decoder): aproximadamente 268 M de parametros, coherente con el tamano de repositorio observado de 0,5 GB |
| Parametros activos | No aplica (el SAE no es MoE). El modelo base Qwen3-VL-30B-A3B-Instruct tiene 30.000 M de parametros totales y aproximadamente 3.000 M activos |
| Longitud de contexto | No aplica al SAE; opera sobre activaciones de una unica capa. La del modelo base no esta declarada en la informacion disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las features se interpretan sobre el modelo base, multilingue, pero no hay lista declarada) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`, layout de claves PEFT TopK_SAE) |
| Tamano de diccionario | 65.536 features |
| Top-k | 256 |
| Ancho de entrada | 2.048 |
| Modulo objetivo | `model.layers.10.mlp.down_proj` |
| Checkpoint de entrenamiento | step 600, penalizacion de dispersidad gs=0,05 |
| Peso del repositorio | 0,5 GB |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

El SAE es un autoencoder de una sola capa oculta con activacion TopK: proyecta la activacion de entrada de anchura 2.048 a un espacio latente de 65.536 dimensiones, conserva unicamente las 256 componentes de mayor magnitud y reconstruye la activacion original desde esas 256 features. La esparsidad esta impuesta de forma dura por el propio operador TopK, no por una penalizacion L1, lo que evita el encogimiento de las magnitudes de las features activas y suele producir diccionarios mas limpios que los SAE con penalizacion L1. El ajuste declarado `gs=0.05` corresponde al parametro de penalizacion de esparsidad usado durante el entrenamiento, y el checkpoint publicado es el paso 600.

El objeto de entrenamiento son las activaciones de la proyeccion descendente del MLP de la capa 10 de Qwen3-VL-30B-A3B-Instruct. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del conjunto de datos (si fue solo texto, solo vision o multimodal), ni si se aplicaron tecnicas de regularizacion adicionales como resampling de features muertas. Tampoco se detalla la implementacion exacta del entrenamiento mas alla de la referencia a la implementacion personalizada TOPK_SAE. La model card advierte explicitamente de que este adaptador no es un checkpoint de Transformers autonomo y requiere dicha implementacion.

## Capacidades

- Descomposicion de activaciones: transforma la activacion del MLP `down_proj` de la capa 10 en un vector disperso de 65.536 features con 256 activas por token.
- Interpretabilidad de features: permite inspeccionar que features se activan ante que entradas y etiquetarlas semanticamente; el autor publica un JSON con explicaciones completas de las features.
- Analisis multimodal: al estar entrenado sobre un modelo vision-language, las features pueden capturar conceptos visuales, textuales o de integracion entre ambos en esa capa.
- Intervencion sobre activaciones: las features pueden usarse para ablation, amplificacion o steering, modificando la activacion reconstruida y observando el efecto en la salida del modelo base.
- Deteccion de circuitos y analisis de causalidad: sirve como herramienta para estudiar que direcciones del espacio de activaciones influyen en el comportamiento posterior del modelo.
- No soporta generacion de texto, tool calling, agentes, ni razonamiento multi-step por si mismo. Estas capacidades pertenecen al modelo base y solo pueden estudiarse a traves del SAE.
- No dispone de modo de pensamiento, vision o audio propio: es un instrumento de analisis, no una modalidad funcional.

## Casos de uso

- Auditoria de representaciones multimodales: extraer activaciones de la capa 10 con imagenes y textos controlados, codificarlas con el SAE y comprobar que features responden a objetos, colores, texto renderizado o relaciones espaciales. Es adecuado porque el diccionario esta entrenado exactamente sobre la capa y el modulo donde se forman esas representaciones.
- Interpretabilidad mecanicista de modelos MoE: estudiar como se organiza la informacion en las capas tempranas de un MoE de 30.000 M de parametros, aprovechando que el SAE aisla el subespacio del MLP de una sola capa.
- Feature steering y experimentos de causalidad: activar o desactivar features concretas y medir el cambio en la salida del modelo base para validar hipotesis causales sobre el comportamiento.
- Etiquetado y construccion de diccionarios semanticos: usar las explicaciones publicadas y generar nuevas para construir un mapa reutilizable de conceptos del modelo, util en equipos de investigacion que necesitan vocabulario comun sobre activaciones.
- Deteccion de sesgos y contenidos problematicos: localizar features asociadas a atributos sensibles (genero, etnia, nacionalidad) en las activaciones y cuantificar su magnitud ante distintos prompts, como paso previo a mitigaciones.
- Investigacion de seguridad y alineamiento: monitorizar features asociadas a comportamientos indeseados (evasion de instrucciones, contenido danino) directamente en el espacio interno, complementando los filtros sobre la salida.
- Comparativa entre checkpoints o capas: entrenar SAEs equivalentes en otras capas o sobre otras versiones del modelo base y comparar la evolucion de las features, usando este checkpoint de la capa 10 como referencia.
- Ensenanza y reproduccion de resultados: servir como ejemplo reproducible y ligero (0,5 GB) de SAE TopK sobre un modelo abierto de gran escala en cursos y talleres de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de reconstruccion (varianza explicada, error de reconstruccion L0/L2), proporciones de features muertas, ni evaluaciones de interpretabilidad automatica. Los campos de descargas (0) y likes (1) indican ademas una adopcion practicamente nula hasta la fecha.

## Requisitos de hardware

- El adaptador en si ocupa 0,5 GB y cabe con holgura en cualquier GPU de consumo, incluso integrada, y en CPU para inferencia del encoder.
- El cuello de botella es el modelo base: Qwen3-VL-30B-A3B-Instruct necesita del orden de 60 GB de VRAM en bf16/fp16 para cargar los 30.000 M de parametros, o alrededor de 18-20 GB en cuantizacion de 4 bits con pesos MoE.
- GPU recomendadas para el modelo base completo en precision nativa: A100 80 GB, H100 80 GB, o dos GPU de 48 GB. Con cuantizacion de 4 bits puede ejecutarse en una RTX 4090 (24 GB) o RTX 5090, asumiendo margen para cache KV y activaciones.
- Para extraer activaciones no es imprescindible generar texto: basta con un forward pass, lo que reduce los requisitos de memoria de cache KV.
- Opciones de despliegue: el SAE requiere la implementacion personalizada TOPK_SAE referenciada en la model card, integrada con PEFT. No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI para este adaptador, ya que no es un modelo generativo.
- Latencia y rendimiento: no disponibles. La codificacion con el SAE anade un producto matricial de 2.048 x 65.536 por token y capa, coste despreciable frente al forward completo del modelo base.
- Para el modelo base, alternativas de servicio son vLLM o TGI con soporte MoE; no hay datos de throughput publicados en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no referencia otros SAEs ni incluye tablas de comparacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los enlaces obtenidos corresponden al Ayuntamiento de Burdeos y no guardan relacion).

| Modelo | Tipo | Diccionario | Top-k | Capa objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| liaoweiduo/sae-qwen3vl30ba3b-l10-gs0.05-step600 | SAE TopK | 65.536 features | 256 | Qwen3-VL-30B-A3B, capa 10, MLP down_proj | No disponible | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia generativa: es un adaptador de interpretabilidad y requiere codigo especifico (TOPK_SAE) que no forma parte de Transformers.
- Cobertura limitada a una unica capa y un unico modulo: las conclusiones extraidas no son extrapolables al resto de la red ni a otras capas del modelo.
- Ausencia de metricas de calidad: sin datos de varianza explicada, error de reconstruccion ni proporcion de features muertas, no se puede evaluar la fidelidad del diccionario.
- Numero de features muertas desconocido: en SAEs de diccionarios grandes es habitual que una fraccion relevante de features no se active nunca; no hay informacion al respecto.
- Interpretabilidad de features no verificada de forma independiente: las explicaciones publicadas proceden del propio autor y no consta validacion externa.
- Sesgos: no declarados. Al heredar el espacio de activaciones del modelo base, el SAE puede reproducir y hacer visibles sesgos presentes en Qwen3-VL-30B-A3B-Instruct.
- Riesgo de alucinacion: no aplica a la generacion, pero si a la interpretacion humana de las features; las etiquetas semanticas de un SAE son heuristicas y pueden ser erroneas o excesivamente amplias.
- Licencia no disponible: no se especifican terminos de uso, lo que impide confirmar si se permite el uso comercial. Debe consultarse con el autor antes de cualquier uso en produccion.
- Idiomas y contexto no documentados: se desconoce si el entrenamiento del SAE cubrio contenido multilingue o solo ingles, lo que condiciona la validez de las features en otros idiomas.
- Adopcion nula (0 descargas): no hay evidencia de uso en la comunidad ni informes de reproduccion independientes.
- Fechas de publicacion en 2026: conviene verificar la vigencia y la compatibilidad con la version actual del modelo base antes de integrarlo en un flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liaoweiduo/sae-qwen3vl30ba3b-l10-gs0.05-step600
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Explicaciones de features (JSON): https://huggingface.co/datasets/liaoweiduo/SAE-explorer-resources/blob/main/explanations/qwen3_vl_30b_a3b/layer_10/gs_0.05_step_600/sae_explain_output.json
- Paper, blog o repositorio del metodo: no disponible en la informacion proporcionada
