# jester6136/nuextract3_lora_cttt_v1_eps_3

## Resumen

`jester6136/nuextract3_lora_cttt_v1_eps_3` es un adaptador LoRA entrenado sobre el modelo base NuExtract3 (arquitectura `Qwen3_5ForConditionalGeneration`) para la extracción de información estructurada (KIE) de documentos administrativos vietnamitas de inspección gubernamental. Lo publica el usuario `jester6136` y está diseñado para tres plantillas concretas: `cttt_vanban` (documento), `cttt_ketluan` (conclusión) y `cttt_qd_thanhtra` (decisión de inspección).

El adaptador se distribuye como pesos PEFT (LoRA con r=16, alpha=16) y corresponde al checkpoint final (step 693) de un entrenamiento de 3 épocas. El autor indica que los pesos ya están fusionados en el modelo `jester6136/nuextract3_cttt_v1_merged_eps_3`, por lo que este repositorio contiene únicamente el delta LoRA. Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un ajuste vertical para un dominio administrativo vietnamita con un conjunto de datos cerrado.

El contexto de uso es la extracción de campos JSON a partir de imágenes de documentos escaneados, invocando el modelo con `image_url` y una plantilla JSON pasada mediante `chat_template_kwargs`. No se dispone de información sobre licencia, idiomas declarados ni pipeline en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre NuExtract3 (arquitectura del modelo base: `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base NuExtract3 no reporta cifra en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuración de despliegue de referencia (`--max-model-len=32768`) |
| Tipos de cuantización | no disponible (el autor usa bf16 en inferencia; no se documentan otras) |
| Idiomas soportados | vietnamita (etiqueta `vietnamese` y datos de entrenamiento en vietnamita); no se declaran otros |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA: `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16, dropout 0 y learning rate 2e-4, entrenado con batch 1 y acumulación de gradiente 8 durante 3 épocas (693 pasos), en precisión bf16 y semilla 42, mediante Unsloth (`train_lora.py`). Se aplica sobre NuExtract3, cuyo módulo de arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo multimodal de extracción de información estructurada.

Los datos de entrenamiento son el conjunto `labels-v2` congelado el 2026-11-13: 1.841 documentos de entrenamiento (752 conclusiones, 254 decisiones de inspección, 835 documentos) y 229 de test (90/45/94), sin solapamiento de `group_id` entre particiones. La pérdida media de entrenamiento reportada es 0,0057 (época 3: 0,0014) y no hubo conjunto de evaluación durante el entrenamiento. El adaptador es compartido para las tres plantillas, lo que implica que el mismo delta de pesos cubre tres esquemas de extracción distintos.

## Capacidades

- Extracción de información estructurada (KIE) a partir de imágenes de documentos administrativos vietnamitas.
- Generación de JSON conforme a plantillas predefinidas (`cttt_vanban`, `cttt_ketluan`, `cttt_qd_thanhtra`) mediante `conform_to_template`.
- Procesamiento de campos anidados y listas, como `DoiTuongThanhTra[]` y `ThanhVienDoan[]`.
- Extracción de metadatos documentales: `SoKyHieu`, `NgayVanBan`, `NguoiKy`, `LoaiVanBan`, `TenVanBan`, `CoQuan.BanHanh`, `CoQuan.ChuQuan`.
- Extracción de campos específicos de inspección: `ThoiKyThanhTra`, `ThoiHanThanhTraNgay`, `QuyetDinhThanhTra.SoVanBan`, `QuyetDinhThanhTra.NgayVanBan`.
- Modo sin razonamiento explícito: el autor recomienda `enable_thinking: False` en la llamada.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni otros idiomas.

## Casos de uso

- Digitalización de conclusiones de inspección: el adaptador extrae los campos estructurados de `cttt_ketluan` a partir de la imagen del documento, con una precisión a nivel de hoja del 0,991 sobre el conjunto de test del autor, lo que lo hace adecuado para pipelines de captura masiva de expedientes.
- Procesamiento de decisiones de inspección: para `cttt_qd_thanhtra` obtiene 0,945 de precisión a nivel de hoja, útil en la gestión documental de organismos fiscalizadores que necesitan poblar bases de datos con número, fecha y unidad responsable de cada decisión.
- Indexación de documentos administrativos generales: con `cttt_vanban` alcanza 0,972, lo que permite alimentar sistemas de búsqueda y archivo con metadatos normalizados (`SoKyHieu`, `TrichYeuVanBan`, `NguoiKy`).
- Extracción de miembros de la comisión de inspección: los campos `ThanhVienDoan[].HoVaTen`, `ChucVu` y `ChucDanhDoan` alcanzan 0,980, 1,000 y 1,000 respectivamente, adecuado para construir directorios de inspectores a partir de documentos históricos.
- Normalización de órganos emisores: `CoQuan.BanHanh` obtiene 0,995 y `CoQuan.ChuQuan` 1,000, lo que permite enlazar documentos con catálogos de organismos en un sistema de gestión documental.
- Automatización de la extracción de fechas y referencias: `NgayVanBan` (0,977) y `QuyetDinhThanhTra.NgayVanBan` (1,000) permiten ordenar cronológicamente expedientes y detectar duplicados por número y fecha.
- Servicio de inferencia con vLLM: el adaptador se sirve con `--enable-lora --max-lora-rank=16` sobre el modelo base, lo que permite atender peticiones concurrentes con `--max-num-seqs=64` y una plantilla distinta por tipo documental sin recargar pesos.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos sobre la versión fusionada (`..._merged_eps_3`), con vLLM v0.22.1, `temperature=0` y evaluación a nivel de hoja (leaf). El baseline es NuExtract3 sin ajustar, evaluado sobre el mismo test.

| Plantilla | Documentos | Hojas (n) | Baseline | Modelo |
|---|--:|--:|--:|--:|
| Kết luận | 89 | 680 | 0,768 | 0,991 |
| Văn bản | 94 | 528 | 0,568 | 0,972 |
| Quyết định thanh tra | 45 | 1.670 | 0,819 | 0,945 |
| Global | 228 | 2.878 | 0,761 | 0,961 |

Prueba de McNemar: 620 hojas incorrectas en baseline y correctas en el modelo, frente a 44 en sentido inverso (p < 0,0001, bilateral, exacta). El autor advierte que la equivalencia entre adaptador y versión fusionada solo se verificó en el checkpoint step 500 (0,936 frente a 0,937; 228/229 predicciones idénticas), no en la época 3.

Campos con mayor y menor rendimiento (extracto):

| Campo | n | Baseline | Modelo |
|:--|--:|--:|--:|
| `ThanhVienDoan[].ChucVu` | 296 | 0,723 | 1,000 |
| `CoQuan.ChuQuan` | 152 | 0,967 | 1,000 |
| `QuyetDinhThanhTra.SoVanBan` | 85 | 0,835 | 1,000 |
| `CoQuan.BanHanh` | 222 | 0,559 | 0,995 |
| `TenVanBan` | 205 | 0,868 | 0,995 |
| `TrichYeuVanBan` | 218 | 0,234 | 0,959 |
| `SoKyHieu` | 189 | 0,503 | 0,942 |
| `DoiTuongThanhTra[].TenGoi` | 74 | 0,851 | 0,622 |
| `DoiTuongThanhTra[].LoaiDoiTuongThanhTra` | 74 | 0,959 | 0,770 |
| `DoiTuongThanhTra[].DonViTrucThuoc` | 8 | 0,125 | 0,125 |
| `DoiTuongThanhTra[].ChucVu` | 3 | 0,000 | 0,000 |

## Requisitos de hardware

- VRAM: no disponible de forma explícita. El comando de referencia usa `--gpu-memory-utilization=0.4`, lo que sugiere que el autor reserva el 40 % de la memoria de una GPU cuyo tamaño no se especifica.
- GPU recomendadas: no disponible. No se documenta el hardware de entrenamiento ni de evaluación.
- Compatibilidad con GPU de consumo: no confirmada. El despliegue de referencia usa `docker run --gpus all` con vLLM y `--dtype=bfloat16`, lo que exige una GPU con soporte bf16.
- Opciones de despliegue: vLLM v0.22.1 con `--enable-lora --lora-modules=... --max-lora-rank=16 --trust-remote-code --gdn-prefill-backend=triton --max-model-len=32768 --max-num-seqs=64`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Variables de entorno indicadas por el autor: `VLLM_USE_FLASHINFER_SAMPLER=0` y `VLLM_USE_DEEP_GEMM=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nuextract3_lora_cttt_v1_eps_3` (este) | LoRA sobre NuExtract3 | 32.768 tokens (config. de despliegue) | 0,961 leaf-level en test propio (228 docs, 2.878 hojas) | no disponible | Hugging Face, repo de 0,1 GB |
| NuExtract3 (base) | Modelo multimodal KIE | no disponible | 0,761 leaf-level en el mismo test | no disponible | Hugging Face |
| Adapter `ttcp-hp5` (mismo autor) | LoRA sobre NuExtract3 | no disponible | Micro-F1 93,5 en época 3 (métrica y etiquetas distintas) | no disponible | no disponible |

El autor advierte explícitamente que la comparación con `ttcp-hp5` no es directa por diferir la métrica y las etiquetas. No se dispone de comparaciones con otros modelos KIE de la literatura en la información proporcionada.

## Limitaciones y advertencias

- Degradación en dos campos de `DoiTuongThanhTra`: `TenGoi` baja de 0,851 a 0,622 y `LoaiDoiTuongThanhTra` de 0,959 a 0,770. El autor atribuye el descenso a que, en documentos con listas largas (20 objetos reducidos a 6, 5 reducidos a 2), el modelo devuelve menos elementos de los presentes en el gold; el conjunto de entrenamiento solo contiene 5 documentos con 10 o más objetos.
- Campos con muy pocas hojas de evaluación (`DoiTuongThanhTra[].ChucVu` con n=3, `DonViTrucThuoc` con n=8), por lo que sus valores no son estadísticamente significativos.
- El conjunto de test de decisiones de inspección tiene solo 45 documentos; variaciones de pocos puntos porcentuales pueden ser ruido.
- No hubo conjunto de evaluación durante el entrenamiento ni validación humana independiente de los resultados; la accuracy se calcula contra `labels-v2`, que puede contener errores.
- La equivalencia entre el adaptador y la versión fusionada solo se comprobó en el step 500, no en la época 3, por lo que las cifras deben tratarse como aproximadas para el adaptador.
- El repositorio contiene datos reales de expedientes de inspección; el autor indica que debe permanecer privado. Antes de cualquier uso hay que verificar el tratamiento de datos personales.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución.
- Modelo monoidioma (vietnamita) y mono-dominio (documentos de inspección administrativa); no se ha validado fuera de ese ámbito.
- Riesgo de alucinación en campos ausentes del documento: el adaptador está entrenado con plantillas fijas y no se documenta comportamiento ante documentos fuera de distribución.
- Dependencia del modelo base NuExtract3 y de su licencia, no especificada en esta ficha.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/jester6136/nuextract3_lora_cttt_v1_eps_3
- Modelo fusionado: https://huggingface.co/jester6136/nuextract3_cttt_v1_merged_eps_3
- Modelo base NuExtract3: no disponible (no se proporciona la URL exacta en la información)
- Paper, blog o demo: no disponible
