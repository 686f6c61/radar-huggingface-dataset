# liodon-ai/VKORE-325M-NPU-Base-ONNX

## Resumen

VKORE-325M-NPU-Base-ONNX es una exportacion en formato ONNX del modelo base FINAL-Bench/VKORE-325M-NPU-Base, publicada por Liodon AI en Hugging Face. No se trata de un modelo entrenado nuevo, sino de un artefacto de despliegue: el grafo original se ha convertido con la libreria `optimum` de Hugging Face (tarea `text-generation-with-past`), de modo que el grafo expone entradas y salidas de past-key-values para decodificacion autorregresiva con cache KV.

El nombre del modelo base sugiere que esta orientado a ejecucion en NPUs (unidades de procesamiento neuronal), un nicho cada vez mas relevante para inferencia en dispositivos edge, portatiles con NPU integrada y entornos sin GPU. Al tratarse de un modelo base de aproximadamente 325 millones de parametros, su nicho natural es la generacion de texto ligera, autocompletado, experimentacion y casos de uso embebidos donde el coste computacional debe ser minimo.

La ficha incluye tres variantes de precision: FP32 completa (1,30 GB), FP16 para proveedores de ejecucion en GPU (0,74 GB) y una cuantizacion dinamica INT8 weight-only sin calibracion (0,33 GB). Con tan solo 410 descargas y 0 likes en el momento de redaccion de esta ficha, es un recurso de muy baja adopcion, por lo que conviene tratarlo como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (segun tag `llama` del repo; arquitectura detallada no disponible) |
| Parametros totales | ~325 millones (inferido del nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamica (weight-only, sin calibracion) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | ONNX (safetensors no incluidos en este repo; el modelo base puede distribuirlos aparte) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo mas alla del tag `llama`, que indica que el modelo base FINAL-Bench/VKORE-325M-NPU-Base sigue el patron de arquitectura de la familia LLaMA (transformer decoder autorregresivo). La exportacion ONNX se realizo con `optimum.exporters.onnx.main_export` usando la tarea `text-generation-with-past`, lo que significa que el grafo incluye soporte nativo de cache KV: las entradas `past_key_values.*.key` y `past_key_values.*.value` deben suministrarse en cada pasada (con tensores de longitud cero en la primera).

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion) no hay informacion disponible en la model card. Al ser un modelo *base* (no instruct/chat), cabe asumir que no ha pasado por una fase de alineacion con instrucciones, pero esto debe verificarse en la ficha del modelo original.

## Capacidades

- Generacion de texto autorregresiva (pipeline `text-generation`), en su variante base sin afinado a instrucciones.
- Decodificacion eficiente con cache KV gracias al grafo exportado con `text-generation-with-past`.
- Ejecucion en multiples backends via ONNX Runtime: CPU, GPU (mediante la variante FP16 y los execution providers correspondientes) y, potencialmente, NPU, dado el nombre del modelo.
- Integracion directa con el ecosistema Hugging Face: tokenizador cargable con `AutoTokenizer` y envoltorio listo para usar mediante `ORTModelForCausalLM` de `optimum.onnxruntime`, que gestiona automaticamente la cache KV.
- No hay evidencia de capacidades de vision, audio, tool calling, agentes ni modo de razonamiento; no se menciona ninguna de estas funciones en la documentacion disponible.

## Casos de uso

- Prototipado rapido en CPU: con la variante INT8 de 0,33 GB se puede desplegar un modelo de lenguaje funcional en maquinas sin GPU, util para pruebas de concepto y scripts locales.
- Inferencia en dispositivos edge y portatiles con NPU: el nombre del modelo y el formato ONNX apuntan a escenarios donde se aprovechan aceleradores neuronales integrados (por ejemplo, NPUs de Intel, Qualcomm o AMD) para generar texto localmente sin conexion.
- Autocompletado y sugerencias de texto en aplicaciones: un modelo base de 325M es adecuado para completado de frases, redaccion asistida ligera o generacion de texto corto con baja latencia.
- Investigacion y benchmarking de runtimes: al incluir tres precisiones (FP32, FP16, INT8) del mismo grafo, es util para comparar rendimiento y calidad entre execution providers de ONNX Runtime.
- Integracion en pipelines de ML existentes: el formato ONNX permite incorporar el modelo a servicios que ya usan ONNX Runtime sin anadir dependencias de PyTorch.
- Base para fine-tuning ligero: el modelo base puede afinarse en dominios concretos con presupuestos de computo reducidos dada su escala modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia:
  - Variante FP32 (`model.onnx`, 1,30 GB): aproximadamente 1,5-2 GB de RAM o VRAM.
  - Variante FP16 (`model_fp16.onnx`, 0,74 GB): aproximadamente 1 GB de VRAM, mas la memoria de la cache KV.
  - Variante INT8 (`model_quantized.onnx`, 0,33 GB): cabe comodamente en RAM de cualquier equipo moderno; ideal para CPU.
- GPU recomendadas: por su tamano, cualquier GPU consumer sirve de sobra (incluso integradas); no se requieren A100 ni H100. Para FP16 en GPU basta una GTX 1650 o superior.
- Consumer GPUs: cabe sin problemas en practicamente cualquier GPU con 2 GB de VRAM o mas, y en CPU con 4 GB de RAM libres.
- Opciones de despliegue: ONNX Runtime (nativo), `optimum.onnxruntime.ORTModelForCausalLM` (envoltorio recomendado, gestiona la cache KV automaticamente), y potencialmente proveedores de NPU de ONNX Runtime (DirectML, QNN, OpenVINO EP). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repo.
- Latencia y throughput: no disponibles; al ser un modelo de ~325M con INT8 en CPU, cabria esperar latencias de decodificacion bajas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| VKORE-325M-NPU-Base-ONNX | ~325M | ONNX (FP32/FP16/INT8) | other | Orientado a NPU/edge, baja adopcion (410 descargas) |
| Qwen2.5-0.5B | ~500M | safetensors, GGUF | Apache 2.0 / Qwen | Ecosistema amplio, multilingue, contexto largo |
| SmolLM2-360M (HuggingFaceTB) | ~360M | safetensors, GGUF | Apache 2.0 | Entrenado especificamente para dispositivos edge, buen soporte de tooling |
| Llama 3.2 1B | ~1.200M | safetensors, GGUF | Llama 3.2 Community | Mayor capacidad pero requisitos de memoria superiores |

Frente a estas alternativas, la ventaja diferencial de VKORE-325M-NPU-Base-ONNX es su distribucion directa en ONNX con tres precisiones listas para NPU/edge; su desventaja es la falta de documentacion, benchmarks y adopcion comunitaria.

## Limitaciones y advertencias

- Al ser un modelo *base* sin afinar a instrucciones, no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno con calidad de chat; para eso habria que afinarlo o usar una variante instruct si existiera.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasa de alucinacion: la ausencia de model card detallada del modelo base es en si misma un riesgo para uso en produccion.
- La licencia es `other`, es decir, no es una licencia estandar identificable; antes de cualquier uso comercial hay que revisar los terminos exactos en el repositorio del modelo base y de esta exportacion.
- La cuantizacion INT8 es dinamica y weight-only, sin calibracion: puede degradar la calidad de generacion respecto a FP32/FP16, especialmente en tareas sensibles a la precision numerica.
- El repo es muy reciente y con adopcion minima (410 descargas, 0 likes): es probable que contenga errores sin detectar y que no reciba mantenimiento continuo.
- La longitud de contexto maxima no esta documentada; habra que inferirla de la configuracion del tokenizador o del modelo base antes de planificar cargas con documentos largos.
- No hay benchmarks publicados, por lo que no es posible evaluar objetivamente su calidad frente a alternativas de tamano similar.

## Enlaces

- Repositorio del modelo exportado: https://huggingface.co/liodon-ai/VKORE-325M-NPU-Base-ONNX
- Modelo base: https://huggingface.co/FINAL-Bench/VKORE-325M-NPU-Base
- Autor (Liodon AI): https://huggingface.co/liodon-ai
- Libreria optimum (herramienta de exportacion): https://github.com/huggingface/optimum
