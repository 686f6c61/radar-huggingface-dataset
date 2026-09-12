# eatang/Kimi-K2.5-2layer

# Kimi-K2.5-2layer

## Resumen
Kimi-K2.5-2layer es un recorte de dos capas del modelo multimodal con arquitectura MoE `moonshotai/Kimi-K2.5`, publicado por el usuario eatang. No es un modelo de lenguaje utilizable: conserva únicamente las dos primeras capas de una red de 61, de modo que su salida es texto incoherente. Su propósito declarado es servir como fixture de integración continua para GPU dentro del proyecto SkyRL, permitiendo ejercitar la arquitectura real con pesos reales (aunque truncados) a un tamano que cabe en un solo nodo.

El checkpoint conserva 20.376.826.736 parámetros en safetensors, con los pesos de los expertos enrutados exactamente iguales a los del release original: los triples `weight_packed` / `weight_scale` / `weight_shape` y su `quantization_config` en formato compressed-tensors pack-quantized INT4 con `group_size=32` no se han tocado. Lo único que cambia respecto al modelo base es `text_config.num_hidden_layers`, fijado a 2. El repositorio ocupa 16,4 GB.

El interés práctico es de ingeniería, no de calidad: permite validar rutas de carga de checkpoints MoE cuantizados en INT4, conversiones INT4-BF16, cableado de torres de visión y proyectores multimodales, y flujos de QAT fake-int4, sin necesidad de descargar ni servir el modelo completo. Existe un checkpoint companion, `eatang/Kimi-K2.5-2layer-BF16`, con los expertos enrutados descuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas MoE (recorte de 2 capas de una red de 61); capa 0 densa (MLP) y capa 1 MoE con 384 expertos enrutados + 1 experto compartido |
| Parametros totales | 20.376.826.736 |
| Parametros activos | no disponible (la capa MoE contiene 384 expertos enrutados + 1 compartido, pero no se especifica el numero de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 pack-quantized (compressed-tensors, `group_size=32`) en los expertos enrutados; existe variante BF16 (expertos descuantizados) en `eatang/Kimi-K2.5-2layer-BF16` |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como `license: other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors (requiere `trust_remote_code` por el tag `custom_code` y la arquitectura `kimi_k25`) |
| Modelo base | moonshotai/Kimi-K2.5 |
| Capas conservadas | 2 (`language_model.model.layers.0` y `language_model.model.layers.1`) |
| Componentes adicionales | `embed_tokens`, `lm_head`, `model.norm`, `vision_tower.*` y `mm_projector.*` (estos dos ultimos sin modificar) |
| Tamano del repositorio | 16,4 GB |

## Arquitectura y entrenamiento
El checkpoint reproduce la estructura del modelo base pero truncada: `language_model.model.layers.0` es una capa densa de MLP (coherente con `first_k_dense_replace=1`) y `language_model.model.layers.1` es una capa MoE completa con 384 expertos enrutados mas un experto compartido. Se conservan tambien los embeddings de tokens, la cabeza de lenguaje (`lm_head`) y la normalizacion final, asi como la torre de visión (`vision_tower.*`) y el proyector multimodal (`mm_projector.*`) del release original, sin cambios. Esto implica que el recorte mantiene el cableado multimodal aunque el número de capas de texto sea 2.

No ha habido entrenamiento ni ajuste alguno: es una copia truncada de pesos. Los pesos de los expertos enrutados son byte-idénticos a los del release original, incluida su configuracion de cuantizacion compressed-tensors pack-quantized INT4 con `group_size=32`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO del modelo base. La innovacion tecnica relevante es de infraestructura: el checkpoint existe porque Megatron-Bridge no puede cargar compressed-tensors, de modo que SkyRL sirve esta variante INT4 desde el motor de inferencia y carga la variante BF16 como maestros QAT fake-int4 en el entrenador mediante `trainer.policy.model.fake_int4_qat.bf16_base_path`.

## Capacidades
- Generacion de texto coherente: no. El propio autor indica que dos capas de una red de 61 producen texto incoherente.
- Razonamiento, codigo, matematicas y conocimiento general: no evaluables ni utilizables en este recorte.
- Vision: el checkpoint incluye `vision_tower.*` y `mm_projector.*` intactos, por lo que permite validar el cableado de la ruta multimodal, pero no se documenta su calidad funcional en este recorte.
- Tool calling / function calling: no disponible (no aplicable en un recorte no utilizable como modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: es un fixture de pruebas. Sirve para ejercitar carga de checkpoints MoE, cuantizacion INT4 pack-quantized, descuantizacion a BF16 y flujos de QAT fake-int4.
- Ejecucion de rutas de codigo personalizado (`custom_code`) y registro de la arquitectura `kimi_k25`.

## Casos de uso
- Integracion continua de GPU en SkyRL: el checkpoint se usa como fixture para ejecutar pruebas de extremo a extremo del motor de inferencia con una arquitectura MoE real de 384 expertos y pesos INT4 reales, en una sola maquina.
- Validacion de backends de cuantizacion: comprobar que un motor de inferencia carga correctamente tensores pack-quantized de compressed-tensors con `group_size=32`, incluyendo `weight_packed`, `weight_scale` y `weight_shape`.
- Pruebas de conversion INT4 a BF16: usando el checkpoint companion `eatang/Kimi-K2.5-2layer-BF16` como referencia descuantizada, se puede verificar la fidelidad de los scripts de descuantizacion.
- Pruebas de QAT fake-int4: entrenadores como Megatron-Bridge, que no soportan compressed-tensors, pueden cargar la variante BF16 como maestros y validar el flujo de cuantizacion simulada frente al checkpoint INT4 servido en inferencia.
- Verificacion de pipelines multimodales: al conservar `vision_tower` y `mm_projector` intactos, permite probar el preprocesado de imagenes, el paso por el proyector y el ensamblado de secuencias multimodales sin descargar el modelo completo.
- Pruebas de registro de arquitecturas y codigo remoto: valida que `trust_remote_code` y el registro del tipo de modelo `kimi_k25` funcionan correctamente antes de desplegar el modelo base.
- Planificacion de memoria y sharding: con 20,4 mil millones de parametros reales en 16,4 GB, sirve para medir requisitos de VRAM, particionado de tensores y estrategias de offload en un nodo unico.
- Regresion de herramientas de serializacion: al ser un safetensors pequeno (en comparacion con el modelo base) con estructura MoE completa, es util para probar lectores, validadores de metadatos y utilidades de conversion sin coste de descarga elevado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Ademas, al tratarse de un recorte de 2 capas de una red de 61, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) careceria de significado para este checkpoint.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 16-18 GB, coherente con los 16,4 GB de pesos almacenados en INT4 mas los tensores auxiliares (`embed_tokens`, `lm_head`, `norm`, `vision_tower` y `mm_projector`) y las activaciones.
- Cabe en GPU de consumo: si. Una RTX 3090 o RTX 4090 con 24 GB puede cargarlo completo sin offload. Tamano ajustado en GPUs de 16 GB, donde probablemente requiera cuantizacion adicional u offload a CPU.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y similares lo alojan con margen amplio.
- Opciones de despliegue: transformers con `trust_remote_code` (necesario por el tag `custom_code` y la arquitectura `kimi_k25`); el checkpoint se sirve en SkyRL desde su motor de inferencia. Compatibilidad con vLLM, SGLang, TGI, llama.cpp u Ollama: no disponible en la informacion proporcionada.
- Compatibilidad de entrenamiento: Megatron-Bridge no puede cargar compressed-tensors, de ahi el uso del companion BF16 como maestros fake-int4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eatang/Kimi-K2.5-2layer | 20.376.826.736 | 2 (de 61) | INT4 pack-quantized, group_size=32 | no disponible | modified-mit (`license: other`) | Publico en HuggingFace, 0 descargas |
| eatang/Kimi-K2.5-2layer-BF16 | no disponible | 2 | BF16 (expertos enrutados descuantizados) | no disponible | no disponible | Publico en HuggingFace |
| moonshotai/Kimi-K2.5 (base) | no disponible | 61 | no disponible | no disponible | no disponible | Publico en HuggingFace |

No se identifican en la informacion disponible otros recortes publicos de la misma categoria (fixtures de CI para arquitecturas MoE cuantizadas) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- No es un modelo de lenguaje utilizable: dos capas de una red de 61 producen texto incoherente, segun el propio autor de la ficha.
- No debe desplegarse en produccion ni emplearse para generar contenido dirigido a usuarios, ni siquiera como prueba de calidad.
- Los resultados de cualquier evaluacion de capacidades sobre este checkpoint son invalidos como indicador del rendimiento del modelo base.
- Sesgos conocidos: no disponible. Al derivar del modelo base podria heredar sesgos de este, pero no se han documentado ni evaluado en este recorte.
- Riesgo de alucinacion: no aplicable en el sentido habitual, ya que la salida es incoherente por construccion.
- Limitaciones de contexto e idioma: no disponible. El numero de capas truncado hace que la ventana de contexto efectiva carezca de sentido practico.
- Licencia: etiquetada como `license: other` con `license_name: modified-mit`. Aunque el nombre sugiere una MIT modificada, no se detallan en la informacion disponible las modificaciones ni las condiciones exactas, por lo que hay que revisar los terminos antes de cualquier uso, incluido el comercial.
- Compatibilidad: el checkpoint requiere cargar codigo remoto (`custom_code`), lo que implica ejecutar codigo del repositorio; conviene auditarlo antes de usarlo en entornos cerrados.
- Ecosistema: Megatron-Bridge no puede cargar el formato compressed-tensors, lo que obliga a usar la variante BF16 como maestros QAT fake-int4.
- Metadatos incompletos: sin pipeline declarado, sin idiomas declarados y con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/eatang/Kimi-K2.5-2layer
- Checkpoint companion en BF16: https://huggingface.co/eatang/Kimi-K2.5-2layer-BF16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Repositorio de SkyRL: https://github.com/NovaSky-AI/SkyRL
- La busqueda web realizada no devolvio enlaces relevantes a este modelo; los resultados obtenidos correspondian a hilos no relacionados del foro de Microsoft Community.
