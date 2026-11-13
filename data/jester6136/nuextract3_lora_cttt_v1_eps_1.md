# jester6136/nuextract3_lora_cttt_v1_eps_1

## Resumen

`jester6136/nuextract3_lora_cttt_v1_eps_1` es un adaptador LoRA entrenado sobre el modelo base NuExtract3 (arquitectura `Qwen3_5ForConditionalGeneration` segun la model card) para la extraccion de informacion estructurada (KIE, *key information extraction*) de documentos administrativos de inspeccion vietnamitas. El adaptador es compartido entre tres plantillas de extraccion: `cttt_vanban`, `cttt_ketluan` y `cttt_qd_thanhtra`, y trabaja sobre imagenes PNG de paginas de documentos, produciendo JSON conforme a cada plantilla.

El checkpoint publicado es un estado intermedio del entrenamiento: corresponde al step 250 (epoch 1,083) de un plan de 3 epochs (693 steps). El autor lo publica explicitamente como "checkpoint GIUA CHUNG, no el resultado final", y anuncia futuras versiones `_eps_2` y `_eps_3` con el mismo prefijo. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors gestionados por PEFT.

La relevancia es acotada pero concreta: demuestra una mejora sustancial frente al modelo base en la tarea especifica (accuracy por hoja de 0,762 a 0,936 sobre 228 documentos de test), con un caso de regresion claro en dos campos del template de "quyet dinh thanh tra". Es un artefacto de investigacion aplicada, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre NuExtract3, que usa `Qwen3_5ForConditionalGeneration` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica en detalle) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de despliegue documentada (`--max-model-len=32768`) |
| Tipos de cuantizacion | no disponible (entrenamiento y despliegue en bf16) |
| Idiomas soportados | vietnamita (documentos de entrada); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, r=16, alpha=16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre el modelo multimodal NuExtract3, cuya arquitectura se declara como `Qwen3_5ForConditionalGeneration` (modelo condicional generativo que procesa imagenes de documento y emite JSON). El entrenamiento se realizo con Unsloth (`train_lora.py`), con learning rate 2e-4, batch efectivo de 8 (batch 1 x grad-accum 8), precision bf16 y semilla 42. No hubo conjunto de evaluacion dentro del bucle de entrenamiento (`--skip-inloop-eval`); la calidad se midio unicamente en una evaluacion posterior con `eval_lora.py`.

Los datos son `labels-v2`, congelados el 2026-11-13 y marcados como `FINAL` en `MANIFEST.json`. Cada linea corresponde a un documento (imagenes PNG de paginas) y hay 1.841 documentos de entrenamiento (752 de tipo conclusion, 254 de decision de inspeccion, 835 de texto) y 229 de test (90, 45 y 94 respectivamente). Los conjuntos de train y test no comparten `group_id`, verificado con `s3_cttt_sync.py verify`. El checkpoint publicado es el step 250, porque el epoch 1 termino en el step 231 y no habia checkpoint en ese punto (se guarda cada 50 steps).

## Capacidades

- Extraccion de informacion estructurada (KIE) a partir de imagenes de documentos administrativos vietnamitas, devolviendo JSON conforme a una plantilla.
- Soporte de tres plantillas de documento: `cttt_vanban`, `cttt_ketluan` y `cttt_qd_thanhtra`.
- Procesamiento multimodal de entrada: la peticion al servidor vLLM se compone unicamente de imagenes (`image_url`), sin texto libre adicional.
- Conformidad de salida con plantilla: el pipeline aplica `conform_to_template` para forzar el esquema JSON.
- Control de modo de razonamiento mediante `enable_thinking: False` en `chat_template_kwargs`.
- Despliegue como adaptador dinamico en vLLM (`--enable-lora`, `--max-lora-rank=16`), lo que permite servir el modelo base y el adaptador en el mismo servidor.
- No se documentan capacidades de tool calling, agentes, matematicas, codigo ni audio.

## Casos de uso

- Digitalizacion de conclusiones de inspeccion: el adaptador eleva la accuracy por hoja de 0,765 a 0,987 en el template `cttt_ketluan` sobre 89 documentos de test, por lo que es adecuado para convertir lotes de conclusiones escaneadas en registros estructurados con campos como `SoKyHieu`, `NgayVanBan`, `NguoiKy` y `ThanhVienDoan[]`.
- Extraccion de metadatos de texto administrativo: en `cttt_vanban` la accuracy sube de 0,567 a 0,958, lo que lo hace util para poblar indices documentales con `TrichYeuVanBan`, `CoQuan.BanHanh` y `LoaiVanBan` a partir de imagenes de pagina.
- Procesamiento de decisiones de inspeccion con cautela: en `cttt_qd_thanhtra` la mejora es de 0,823 a 0,907, pero dos campos de `DoiTuongThanhTra` empeoran respecto al modelo base, por lo que el caso de uso realista es la extraccion asistida con revision humana obligatoria de esos campos.
- Servicio interno de extraccion con vLLM: el adaptador se puede cargar junto al modelo base en un unico servidor vLLM 0.22.1 con `--enable-lora` y `--max-lora-rank=16`, permitiendo comparar base y adaptador con `temperature=0` sobre el mismo endpoint.
- Evaluacion comparativa de adaptadores: al compartir el mismo conjunto `labels-v2/test.jsonl` y el mismo script de scoring (`eval_lora.py`), sirve como referencia reproducible para comparar con otros adaptadores como `ttcp-hp5`, siempre que se ejecuten con la misma metrica de accuracy por hoja.
- Generacion de datasets etiquetados: dado que el formato de salida se ajusta a plantillas JSON (`templates/<doc_type>.json`), el adaptador puede emplearse para preetiquetar grandes volumenes de documentos y reducir el coste de anotacion manual, con validacion posterior por anotadores.

## Benchmarks y rendimiento

Accuracy por hoja (leaf), 229 documentos de test (228 evaluables), temperatura 0, mismo servidor vLLM 0.22.1 para base y LoRA:

| Template | Documentos | Hojas (n) | Baseline | LoRA |
|---|---:|---:|---:|---:|
| Ket luan | 89 | 682 | 0,765 | 0,987 |
| Van ban | 94 | 529 | 0,567 | 0,958 |
| Quyet dinh thanh tra | 45 | 1.662 | 0,823 | 0,907 |
| Agregado | 228 | 2.873 | 0,762 | 0,936 |

Prueba de McNemar: 586 hojas incorrectas en baseline que el LoRA acierta, 87 en sentido contrario, p < 0,0001 (bilateral, exacta). Un documento fue excluido porque el baseline fallo en la llamada (el LoRA no tuvo errores).

Resultados por campo (seleccion de los publicados en la model card):

| Campo | n | Baseline | LoRA |
|:--|--:|--:|--:|
| `DoiTuongThanhTra[].ChucVu` | 3 | 0,000 | 0,000 |
| `DoiTuongThanhTra[].DonViTrucThuoc` | 6 | 0,167 | 0,167 |
| `DoiTuongThanhTra[].TenGoi` | 74 | 0,851 | 0,595 |
| `DoiTuongThanhTra[].LoaiDoiTuongThanhTra` | 74 | 0,959 | 0,703 |
| `ThoiKyThanhTra` | 33 | 0,485 | 0,818 |
| `ThanhVienDoan[].NoiCongTac.TenGoi` | 237 | 0,776 | 0,835 |
| `ThanhVienDoan[].ChucVu` | 296 | 0,723 | 0,902 |
| `SoKyHieu` | 189 | 0,503 | 0,915 |
| `TrichYeuVanBan` | 219 | 0,233 | 0,945 |
| `NguoiKy` | 45 | 0,933 | 0,956 |
| `NgayVanBan` | 218 | 0,867 | 0,959 |
| `ThanhVienDoan[].HoVaTen` | 296 | 0,909 | 0,976 |
| `QuyetDinhThanhTra.SoVanBan` | 86 | 0,826 | 0,988 |
| `QuyetDinhThanhTra.NgayVanBan` | 86 | 0,872 | 0,988 |
| `LoaiVanBan` | 94 | 0,681 | 0,989 |
| `TenVanBan` | 205 | 0,868 | 0,995 |
| `CoQuan.BanHanh` | 222 | 0,559 | 0,995 |
| `ThanhVienDoan[].ChucDanhDoan` | 296 | 0,990 | 1,000 |
| `CoQuan.ChuQuan` | 152 | 0,967 | 1,000 |
| `ThoiHanThanhTraNgay` | 42 | 1,000 | 1,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB; el requisito real de VRAM lo determina el modelo base NuExtract3, cuyo tamano no se especifica en la informacion disponible.
- La configuracion documentada usa vLLM 0.22.1 con `--gpu-memory-utilization=0.4`, `--dtype=bfloat16`, `--gdn-prefill-backend=triton`, `--max-model-len=32768` y `--max-num-seqs=64`, con `--shm-size 8g` en el contenedor.
- Se requiere una GPU con soporte CUDA para `docker run --gpus all`; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- No hay datos publicados sobre si cabe en GPU de consumo ni sobre latencia o throughput.
- Opciones de despliegue documentadas: vLLM con soporte LoRA (`--enable-lora --lora-modules=... --max-lora-rank=16`). No se mencionan llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes en el despliegue: `VLLM_USE_FLASHINFER_SAMPLER=0` y `VLLM_USE_DEEP_GEMM=0`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nuextract3_lora_cttt_v1_eps_1` | LoRA sobre NuExtract3 | no disponible (adaptador 0,1 GB) | 32.768 tokens (despliegue) | Leaf-accuracy 0,936 en `labels-v2` test | no disponible | Hugging Face, repo publico |
| NuExtract3 (base) | Modelo multimodal KIE | no disponible | no disponible | Leaf-accuracy 0,762 en `labels-v2` test | no disponible | Referenciado como modelo base |
| Adaptador `ttcp-hp5` | LoRA sobre NuExtract3 | no disponible | no disponible | Micro-F1 93,5 en ep3, medido con `k11_scoring.py` sobre etiquetas antiguas (226 expedientes) | no disponible | Mencionado en la model card; no se enlaza |

La comparacion directa con `ttcp-hp5` no es valida segun el propio autor: distinta metrica (Micro-F1 frente a leaf-accuracy), distintas etiquetas (`labels-v2` frente a etiquetas antiguas sin reetiquetar) y distinto conjunto de evaluacion. Para comparar habria que ejecutar ambos adaptadores sobre `labels-v2/test.jsonl` con el mismo scorer.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al step 250 (epoch 1,083) de un plan de 3 epochs; el autor lo declara explicitamente no final y anuncia `_eps_2` y `_eps_3`.
- Regresion en dos campos del template `cttt_qd_thanhtra`: `DoiTuongThanhTra[].TenGoi` baja de 0,851 a 0,595 y `LoaiDoiTuongThanhTra` de 0,959 a 0,703 (n = 74 en ambos). El autor no ha identificado la causa; este template es el que menos muestras de entrenamiento tiene (254).
- Muestra pequena en algunos campos: `DoiTuongThanhTra[].ChucVu` tiene n = 3 y `DonViTrucThuoc` n = 6, con accuracy 0,000 y 0,167 respectivamente tanto en baseline como en LoRA; no son conclusiones fiables.
- El template de decision de inspeccion solo tiene 45 documentos de test, lo que limita la potencia estadistica de sus cifras.
- Evaluacion unica sobre un unico checkpoint; el conjunto de test no se uso para seleccionar epoch, pero cuando existan `_eps_2` y `_eps_3` y se elija por test, las cifras del elegido seran ligeramente optimistas.
- No hay revision humana independiente de las extracciones; la accuracy se mide contra `labels-v2`, que puede contener errores.
- El conjunto de entrenamiento contiene informacion real de expedientes de inspeccion; el autor indica que el repositorio debe permanecer privado por este motivo, lo que condiciona su distribucion y reutilizacion.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion.
- Idiomas: solo se documenta vietnamita; no hay datos sobre robustez en otros idiomas ni sobre documentos fuera del dominio de inspeccion administrativa.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas; al ser un modelo de extraccion con plantilla fija y `temperature=0`, el riesgo principal es la omision o el valor incorrecto en campos concretos, no la generacion libre.
- El despliegue depende de `--trust-remote-code` y de una version concreta de vLLM (0.22.1); cambios de version pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jester6136/nuextract3_lora_cttt_v1_eps_1
- Modelo base NuExtract3: no disponible (no se proporciona URL en la informacion)
- Paper, blog o demo: no disponible
- Repositorio de codigo (`train_lora.py`, `eval_lora.py`, `s3_cttt_sync.py`): no disponible
