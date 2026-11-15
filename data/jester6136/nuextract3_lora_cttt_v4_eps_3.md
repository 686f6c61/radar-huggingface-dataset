# jester6136/nuextract3_lora_cttt_v4_eps_3

## Resumen

`nuextract3_lora_cttt_v4_eps_3` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base NuExtract3 (arquitectura `Qwen3_5ForConditionalGeneration`), orientado a la extracción de información estructurada (KIE, key information extraction) de documentos administrativos vietnamitas del ámbito de la inspección gubernamental. Lo publica el usuario `jester6136` y no es un modelo autónomo: requiere cargar el modelo base y aplicar el adaptador encima.

El adaptador cubre tres plantillas documentales concretas: `cttt_vanban` (documentos administrativos), `cttt_ketluan` (conclusiones de inspección) y `cttt_qd_thanhtra` (decisiones de inspección). Se entrenó desde cero sobre la revisión "labels-v4" del conjunto de datos, que corrige la regla de asignación de los campos `TenVanBan` y `TrichYeuVanBan` respecto a la versión anterior, y añade 20 muestras de decisiones de inspección con listas largas de sujetos inspeccionados.

Su relevancia es acotada pero concreta: demuestra mejoras medibles frente al modelo base en la extracción por hoja (leaf) sobre un test de 229 documentos, con una precisión agregada de 0,943 frente a 0,759 del baseline. No obstante, retrocede frente al adaptador anterior en la plantilla de decisiones de inspección, lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base NuExtract3 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; la configuración de despliegue sugerida usa `--max-model-len=32768` |
| Tipos de cuantizacion | no disponible (entrenamiento y evaluación en bf16) |
| Idiomas soportados | vietnamita (documentos administrativos de inspección) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parámetros de entrenamiento del adaptador: r=16, alpha=16, dropout=0, learning rate 2e-4, batch 1 con acumulación de gradiente 8, 3 épocas (699 pasos), precisión bf16, semilla 42, framework Unsloth.

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre NuExtract3, un modelo multimodal de la familia `Qwen3_5ForConditionalGeneration` especializado en extracción de información. La entrada al modelo son imágenes de documentos junto con una plantilla JSON que define el esquema de salida; el adaptador ajusta los pesos para que el modelo rellene correctamente los campos de cada plantilla.

El entrenamiento se realizó con Unsloth sobre 1.861 documentos: 835 de la plantilla `cttt_vanban`, 752 de `cttt_ketluan` y 274 de `cttt_qd_thanhtra` (los 20 ejemplos adicionales de decisiones largas se suman a los 254 originales). La pérdida media de entrenamiento fue de 0,0055 y no se reservó conjunto de evaluación durante el propio entrenamiento. La revisión de etiquetas v4 corrige 230 de las 929 líneas de `cttt_vanban` (204 en train, 26 en test), afectando únicamente a los campos `TenVanBan` (texto en cuerpo grande) y `TrichYeuVanBan` (texto pequeño inferior, o igual a `TenVanBan` si no existe). El conjunto de test tiene 229 documentos: 94 de `cttt_vanban`, 90 de `cttt_ketluan` y 45 de `cttt_qd_thanhtra`.

## Capacidades

- Extracción de información estructurada (KIE) a partir de imágenes de documentos administrativos vietnamitas, con salida JSON conforme a plantilla.
- Relleno de esquemas jerárquicos con campos anidados y listas de objetos (por ejemplo, `ThanhVienDoan[]` con subcampos `HoVaTen`, `ChucVu`, `NoiCongTac.TenGoi`).
- Procesamiento multimodal: la entrada es la imagen del documento, no texto extraído por OCR previo.
- Soporte de tres plantillas documentales específicas: `cttt_vanban`, `cttt_ketluan`, `cttt_qd_thanhtra`.
- Modo "thinking" desactivable mediante `enable_thinking: False` en los kwargs de plantilla de chat.
- Aplicación de la función `conform_to_template` para forzar la salida al esquema esperado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso genérico ni otros idiomas distintos del vietnamita.

## Casos de uso

- Digitalización de expedientes de inspección administrativa: el adaptador extrae campos como `SoKyHieu`, `NgayVanBan`, `NguoiKy` y `TrichYeuVanBan` de imágenes de documentos escaneados, lo que permite indexar y buscar en archivos históricos sin transcripción manual.
- Automatización del registro de conclusiones de inspección: con la plantilla `cttt_ketluan` y una precisión por hoja de 0,993, el modelo puede alimentar bases de datos de resultados de inspección con revisión humana únicamente en los campos de mayor riesgo.
- Extracción de listas de miembros de comisiones inspectoras: los campos `ThanhVienDoan[].HoVaTen` (0,980) y `ThanhVienDoan[].ChucVu` (0,899) permiten poblar automáticamente estructuras de personal en sistemas de gestión documental.
- Procesamiento por lotes con vLLM: el despliegue documentado con `--max-num-seqs=64` y `--max-model-len=32768` admite servir el adaptador como módulo LoRA junto al modelo base, lo que facilita pipelines de ingesta masiva de documentos.
- Clasificación y normalización de tipos documentales: el campo `LoaiVanBan` alcanza 1,000 de precisión por hoja en el test, útil para enrutar documentos a flujos de trabajo distintos según su naturaleza.
- Enriquecimiento de metadatos para sistemas de archivo: los campos `CoQuan.BanHanh` (0,989) y `CoQuan.ChuQuan` (1,000) permiten asignar automáticamente organismos emisores y superiores jerárquicos a cada documento.
- Investigación y evaluación de técnicas de KIE en vietnamita: el adaptador y sus cifras publicadas sirven como referencia reproducible para comparar estrategias de ajuste fino con LoRA sobre modelos multimodales de extracción.

## Benchmarks y rendimiento

Evaluación con `eval_lora.py` sobre vLLM v0.22.1, temperatura 0, aplicando `conform_to_template`. Se puntúa por hoja (leaf), contando solo las hojas presentes tanto en el baseline como en los modelos comparados. El adaptador se cargó mediante `--lora-modules`, sin fusionar con el modelo base.

| Plantilla | Documentos | Hojas (n) | Baseline | v4 época 3 | Adaptador v2 |
|---|--:|--:|--:|--:|--:|
| Kết luận | 90 | 687 | 0,764 | 0,993 | 0,993 |
| Văn bản | 94 | 535 | 0,566 | 0,966 | 0,957 |
| Quyết định thanh tra | 45 | 1.664 | 0,821 | 0,918 | 0,949 |
| Agregado (test completo) | 229 | 2.891 | 0,759 | 0,943 | 0,959 |

Prueba de McNemar (v4 frente a baseline): 604 hojas que el baseline falla y el modelo acierta, 72 en sentido contrario, p < 0,0001. Por épocas, el agregado fue 0,928 en la época 1 y 0,940 en la época 2.

Desglose de la plantilla Văn bản (n = hojas): `TrichYeuVanBan` 91 · 0,923 (v2: 0,857); `SoKyHieu` 58 · 0,931 (0,914); `NgayVanBan` 87 · 0,954 (0,977); `TenVanBan` 72 · 0,972 (0,986); `CoQuan.BanHanh` 88 · 0,989 (0,989); `LoaiVanBan` 94 · 1,000 (0,989); `CoQuan.ChuQuan` 45 · 1,000 (1,000).

Desglose de Quyết định thanh tra: `DoiTuongThanhTra[].TenGoi` 74 · 0,622 (0,622); `LoaiDoiTuongThanhTra` 74 · 0,703 (0,770); `ChucVu` 3 · 0,000 (0,000); `DonViTrucThuoc` 5 · 0,200 (0,200); `ThanhVienDoan[].NoiCongTac.TenGoi` 240 · 0,871 (0,942); `ThanhVienDoan[].ChucVu` 296 · 0,899 (1,000); `ThoiKyThanhTra` 33 · 0,879 (0,848); `SoKyHieu` 45 · 0,911 (0,933); `TrichYeuVanBan` y `NgayVanBan` 45 · 0,956 (0,956); `NguoiKy` 45 · 0,978 (0,978); `ThanhVienDoan[].HoVaTen` 296 · 0,980 (0,980); resto de campos 1,000.

En Kết luận, todos los campos se sitúan entre 0,954 y 1,000, sin diferencias superiores a 0,012 respecto al adaptador v2.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el requisito real lo marca el modelo base NuExtract3, cuyos pesos no se detallan en la información disponible.
- La configuración de referencia usa `--gpu-memory-utilization=0.4` con `--max-model-len=32768` y `--max-num-seqs=64` sobre GPUs con soporte CUDA; no se especifica el modelo de GPU empleado en la evaluación.
- Despliegue documentado con la imagen `vllm/vllm-openai:v0.22.1`, `--enable-lora`, `--max-lora-rank=16`, `--dtype=bfloat16`, `--gdn-prefill-backend=triton` y `--trust-remote-code`.
- Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Precisión agregada (test v4) | Licencia |
|---|---|---|---|---|---|
| nuextract3_lora_cttt_v4_eps_3 | NuExtract3 | LoRA r=16 | no disponible | 0,943 | no disponible |
| nuextract3_lora_cttt_v1_eps_3 (adaptador v2) | NuExtract3 | LoRA r=16 | no disponible | 0,959 | no disponible |
| NuExtract3 (baseline, sin ajuste) | — | no disponible | no disponible | 0,759 | no disponible |

La comparación se limita a estas tres configuraciones porque la información disponible no incluye otros adaptadores o modelos de KIE en vietnamita con los que contrastar.

## Limitaciones y advertencias

- El adaptador rinde peor que la versión anterior en la plantilla de decisiones de inspección (0,918 frente a 0,949), sobre todo en `ThanhVienDoan[]`; los campos `DoiTuongThanhTra[].TenGoi` (0,622) y `LoaiDoiTuongThanhTra` (0,703) quedan por debajo del modelo base y los 20 ejemplos adicionales no los mejoran.
- Cada configuración se ejecutó con una sola semilla; con solo 45 documentos en la plantilla de decisiones y algunos campos con 3 a 74 hojas, las diferencias de varios puntos porcentuales pueden ser ruido estadístico.
- Los dos cambios introducidos (revisión de etiquetas y 20 muestras adicionales) se aplicaron juntos, por lo que no es posible atribuir el efecto a cada uno por separado.
- No hay verificación humana independiente: la precisión se calcula contra las etiquetas `labels-v4`, corregidas por los propios autores según las reglas del propietario de los datos, y quedan 2 documentos ambiguos sin corregir.
- Las cifras de v4 no son comparables directamente con el 0,961 de `labels-v2`, porque el conjunto de test cambió en 26 líneas.
- El adaptador no está fusionado con los pesos del modelo base; requiere cargarlo como módulo LoRA en vLLM o aplicar la fusión explícitamente.
- El modelo está especializado en vietnamita y en tres plantillas concretas; no se documenta su comportamiento fuera de ese dominio ni en otros idiomas.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial.
- El autor advierte que los datos de entrenamiento contienen información real de expedientes de inspección y recomienda mantener el repositorio privado; su publicación plantea riesgos de privacidad y protección de datos.
- No se han publicado evaluaciones de sesgo, alucinación o robustez frente a documentos de baja calidad de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jester6136/nuextract3_lora_cttt_v4_eps_3
- Modelo base NuExtract3: no disponible (no se proporciona el enlace en la información consultada)
- Paper, blog o demo del adaptador: no disponible
