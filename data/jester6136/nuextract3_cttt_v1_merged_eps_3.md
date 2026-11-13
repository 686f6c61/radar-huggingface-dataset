# jester6136/nuextract3_cttt_v1_merged_eps_3

## Resumen

nuextract3_cttt_v1_merged_eps_3 es un modelo de extraccion de informacion estructurada (KIE, key information extraction) obtenido al fusionar un adaptador LoRA sobre el modelo base NuExtract3. Lo publica el usuario jester6136 y esta especializado en documentos administrativos de inspeccion vietnamitas, concretamente en tres plantillas de extraccion: `cttt_vanban`, `cttt_ketluan` y `cttt_qd_thanhtra`. El resultado es un modelo autonomo (sin adaptador externo) en bf16, listo para servirse directamente.

El modelo parte de NuExtract3, una arquitectura de tipo `qwen3_5` con pipeline `image-text-to-text`, lo que implica que acepta imagenes de documentos como entrada y devuelve JSON estructurado. Cuenta con 4.659.865.088 parametros totales y un repositorio de 9,3 GB. El ajuste se realizo con Unsloth (LoRA r=16, alpha=16) durante 3 epocas y 693 pasos sobre 1.841 documentos de entrenamiento.

Su relevancia es acotada pero concreta: demuestra que un ajuste LoRA ligero sobre un extractor multimodal puede elevar la precision por hoja (leaf) del 0,761 al 0,961 en un dominio administrativo muy especifico, con mejoras notables en campos como `TrichYeuVanBan` (de 0,234 a 0,959) o `SoKyHieu` (de 0,503 a 0,942). No obstante, el autor advierte que el repositorio contiene datos reales de expedientes y deberia permanecer privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo `qwen3_5`, pipeline image-text-to-text) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor de `--max-model-len` usado en la guia de despliegue) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (dominio de entrenamiento); no se documenta soporte multilingue general |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye `model-mtp.safetensors` con 15 tensores `mtp.*` copiados del modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de NuExtract3, con arquitectura etiquetada como `qwen3_5` en los tags de Hugging Face. Acepta imagenes de documentos y produce JSON conforme a una plantilla. El ajuste se realizo mediante LoRA con rango 16, alpha 16, dropout 0, learning rate 2e-4, batch 1 con acumulacion de gradiente 8, precision bf16 y semilla 42, usando Unsloth (`train_lora.py`). Un unico adaptador cubre las tres plantillas. El entrenamiento duro 3 epocas (693 pasos) sobre 1.841 documentos: 752 de tipo Kết luận, 254 de Quyết định thanh tra y 835 de Văn bản. El conjunto de test tiene 229 documentos (90 / 45 / 94 respectivamente), sin solapamiento de `group_id` entre train y test.

La fusion se hizo con `merge_and_unload()` de PEFT en CPU y bf16. Cambiaron 248 tensores linguisticos (coincidiendo con el numero de pares LoRA A/B) y los 490 restantes quedaron identicos al modelo original, con una desviacion relativa maxima del 2,2%. El guardado directo desde PEFT renombraba mal los tensores, por lo que se corrigieron los nombres y se copiaron 15 tensores `mtp.*` desde el modelo base a `model-mtp.safetensors`. La perdida media de entrenamiento fue 0,0057 (epoca 3: 0,0014). No hubo conjunto de evaluacion durante el entrenamiento ni se aplico RLHF/DPO documentado.

## Capacidades

- Extraccion de informacion estructurada a partir de imagenes de documentos administrativos, devolviendo JSON conforme a una plantilla.
- Soporte de tres plantillas especificas: `cttt_vanban`, `cttt_ketluan` y `cttt_qd_thanhtra`.
- Entrada multimodal: la peticion se compone unicamente de imagenes (`image_url`).
- Modo conversacional con `chat_template_kwargs` y `enable_thinking: False` para desactivar el razonamiento extendido.
- Extraccion de campos anidados y listas, como `DoiTuongThanhTra[]` o `ThanhVienDoan[]`.
- Capacidad de normalizacion de campos como fechas (`NgayVanBan`), numeros de documento (`SoKyHieu`) y organismos (`CoQuan.BanHanh`).
- No se documenta soporte de tool calling, function calling, agentes ni audio.

## Casos de uso

- Digitalizacion de decisiones de inspeccion: el modelo recibe la imagen del documento y devuelve JSON con `QuyetDinhThanhTra.SoVanBan`, `QuyetDinhThanhTra.NgayVanBan` y demas campos, con precision del 1,000 en esos dos campos segun la evaluacion del autor.
- Extraccion de resumenes de documentos (`TrichYeuVanBan`): util en pipelines de archivo administrativo donde se necesita indexar el asunto del documento; el modelo pasa de 0,234 en el base a 0,959.
- Captura de numeros de expediente (`SoKyHieu`): integrable en sistemas de gestion documental para clasificar y enlazar documentos por su codigo; mejora de 0,503 a 0,942.
- Identificacion de firmantes (`NguoiKy`) y miembros del equipo inspector (`ThanhVienDoan[].HoVaTen`, `ChucVu`): permite construir tablas de responsables con precision superior al 0,97 en esos campos.
- Extraccion de organismos emisores y superiores (`CoQuan.BanHanh`, `CoQuan.ChuQuan`): util para enrutar documentos en flujos de tramitacion; ambos campos alcanzan 0,995 y 1,000 respectivamente.
- Procesamiento por lotes con vLLM: el modelo puede servirse con `--max-num-seqs=64` y `--max-model-len=32768`, lo que permite procesar volumenes altos de expedientes en un solo nodo GPU.
- Clasificacion del tipo de documento (`LoaiVanBan`, `TenVanBan`): precision de 0,989 y 0,995, adecuada para separar automaticamente los tres tipos documentales antes de aplicar la plantilla correspondiente.

## Benchmarks y rendimiento

Evaluacion del autor con vLLM v0.22.1, `temperature=0` y `conform_to_template`, medida por hoja (leaf) sobre el conjunto de test. Baseline: NuExtract3 original.

| Plantilla | Documentos | Hojas (n) | Baseline | Modelo |
|---|---:|---:|---:|---:|
| Kết luận | 89 | 680 | 0,768 | 0,991 |
| Văn bản | 94 | 528 | 0,568 | 0,972 |
| Quyết định thanh tra | 45 | 1.670 | 0,819 | 0,945 |
| Ggop | 228 | 2.878 | 0,761 | 0,961 |

Comparacion entre checkpoints (mismo test y criterio):

| Checkpoint | Epoca | Kết luận | Văn bản | Quyết định thanh tra | Ggop |
|---|---:|---:|---:|---:|---:|
| step 250 (adaptador) | 1,08 | 0,987 | 0,958 | 0,907 | 0,936 |
| step 500 (fusionado) | 2,17 | 0,991 | 0,975 | 0,903 | 0,937 |
| step 693 (fusionado, este repo) | 3 | 0,991 | 0,972 | 0,945 | 0,961 |

Prueba de McNemar: 620 hojas que el baseline falla y este modelo acierta frente a 44 en sentido contrario, p < 0,0001 (bilateral, exacta). Por campos destacados: `TrichYeuVanBan` 0,234 -> 0,959; `SoKyHieu` 0,503 -> 0,942; `CoQuan.BanHanh` 0,559 -> 0,995; `ThanhVienDoan[].ChucVu` 0,723 -> 1,000. En cambio, `DoiTuongThanhTra[].TenGoi` baja de 0,851 a 0,622 y `DoiTuongThanhTra[].LoaiDoiTuongThanhTra` de 0,959 a 0,770.

## Requisitos de hardware

- VRAM estimada: con 4,66 mil millones de parametros en bf16, los pesos ocupan aproximadamente 9,3 GB; el autor sugiere `--gpu-memory-utilization=0.4` en vLLM, lo que implica reservar alrededor del 40% de la VRAM de la GPU.
- GPU recomendadas: el autor no especifica modelos concretos; por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes para bf16. Cabe en GPUs de consumo con al menos 16 GB, aunque no se documenta prueba en ellas.
- Despliegue: vLLM v0.22.1 con `--trust-remote-code --dtype=bfloat16 --gdn-prefill-backend=triton --max-model-len=32768 --max-num-seqs=64`. No se documenta despliegue con llama.cpp, Ollama ni TGI.
- Variables de entorno recomendadas por el autor: `VLLM_USE_FLASHINFER_SAMPLER=0` y `VLLM_USE_DEEP_GEMM=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| nuextract3_cttt_v1_merged_eps_3 | 4,66 B | 32.768 (segun despliegue) | no disponible | Especializado en inspeccion vietnamita; 0,961 de precision por hoja |
| NuExtract3 (base) | no disponible | no disponible | no disponible | Modelo general de extraccion; 0,761 en el mismo test |
| Adapter `ttcp-hp5` | no disponible | no disponible | no disponible | Micro-F1 93,5 en epoca 3, pero con otra metrica (`k11_scoring.py`) y etiquetas antiguas; no comparable directamente |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene datos reales de expedientes de inspeccion; el autor indica explicitamente que debe permanecer privado.
- Dos campos empeoran respecto al modelo base: `DoiTuongThanhTra[].TenGoi` (0,851 -> 0,622) y `DoiTuongThanhTra[].LoaiDoiTuongThanhTra` (0,959 -> 0,770). El autor no ha determinado la causa y recomienda verificar antes de usar esos campos en decisiones de inspeccion.
- El checkpoint publicado es el ultimo de la epoca 3, no el mejor seleccionado sobre test; el loss de entrenamiento en epoca 3 fue 0,0014, muy bajo, lo que sugiere posible sobreajuste.
- El conjunto de test es pequeno (229 documentos; 45 para QuyetDinhThanhTra), por lo que diferencias de pocos puntos porcentuales pueden ser ruido.
- La comprobacion de que la fusion no altera resultados se hizo solo en el checkpoint step 500 (228 de 229 predicciones identicas); no se repitio para el adaptador de epoca 3.
- No hay validacion humana independiente; la exactitud se mide contra etiquetas `labels-v2`, que pueden contener errores.
- `model-mtp.safetensors` no se ha probado con decodificacion especulativa; solo se garantiza su uso en inferencia normal.
- Licencia no disponible: no se puede confirmar el uso comercial.
- El modelo esta entrenado exclusivamente sobre documentos administrativos vietnamitas; no se documenta comportamiento en otros idiomas o dominios.
- Riesgo de alucinacion no cuantificado; la evaluacion usa `temperature=0` y `conform_to_template`, condiciones que conviene replicar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jester6136/nuextract3_cttt_v1_merged_eps_3
- Modelo base NuExtract3: no disponible en la informacion proporcionada
- Repositorio de codigo de entrenamiento (`train_lora.py`, `scripts/train_lora_nuextract/eval_lora.py`): no disponible en la informacion proporcionada
- Informe de evaluacion (`eval/`): no disponible en la informacion proporcionada
- vLLM: no disponible en la informacion proporcionada
