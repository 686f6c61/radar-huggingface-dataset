# AlekseyCalvin/LFM3-VL-2B-3D-Coder-SFT

## Resumen

LFM3-VL-2B-3D-Coder-SFT es un ajuste fino supervisado (SFT) del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario AlekseyCalvin. Su objetivo concreto es generar escenas ejecutables de Three.js (y activos exportables a GLB) a partir de instrucciones en lenguaje natural, emulando el estudio previo de ccore con Qwen3.5-4B-3D-Coder. El modelo hereda la arquitectura y el contexto del LFM3-VL-2B original (2B parametros, vision-language), y se distribuye como adaptador LoRA sobre la base, con pesos fusionados previstos al finalizar el entrenamiento.

El interes tecnico radica en su enfoque de entrenamiento: QLoRA en 4 bits (NF4 con doble cuantizacion), LoRA de rango 64 sobre las proyecciones del modelo de lenguaje, encoder de vision congelado, y una perdida solo sobre turnos de asistente. El entrenamiento se ejecuto en una unica NVIDIA L4 de 24 GB, con un filtro que excluye ejemplos de mas de 24.576 tokens y una compuerta bloqueante que detiene el entrenamiento si el modelo deja de emitir HTML en las evaluaciones periodicas.

En el momento de la publicacion de esta ficha, el repositorio no contiene aun los pesos fusionados ni el GGUF Q4_K_M, y la seccion de resultados de la model card esta marcada como pendiente (TBD). Por tanto, debe considerarse un artefacto de investigacion en curso, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) heredada de LiquidAI/LFM3-VL-2B |
| Parametros totales | 2B (modelo base); adaptador LoRA con 65.874.944 parametros entrenables (3,32%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 24.576 tokens en entrenamiento (filtro de exclusion); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | QLoRA NF4 con doble cuantizacion para entrenamiento; GGUF Q4_K_M previsto al finalizar |
| Idiomas soportados | en |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (adaptador LoRA y fusionado bf16 previsto); GGUF Q4_K_M previsto |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un transformer multimodal con encoder de vision y modelo de lenguaje, cargado con `transformers 5.22.1` y `trust_remote_code=True`. El ajuste se realizo con TRL `SFTTrainer` usando `loss_type='nll'` (entropia cruzada estandar), con etiquetas pre-mascaradas para calcular la perdida unicamente sobre los turnos del asistente. El formato de conversacion es ChatML y se preserva el bloque `<think>` de razonamiento del modelo base.

El entrenamiento empleo QLoRA: cuantizacion NF4 de bitsandbytes con doble cuantizacion y computo en bf16, con un adaptador LoRA de rango 64, alpha 128, dropout 0 y sin sesgo. Los modulos objetivo del modelo de lenguaje fueron `q/k/v/o/gate/in_proj/out_proj/w1/w2/w3`, incluyendo `gate_proj` especifico de LFM3, mientras que el encoder de vision permanecio congelado. Los datos combinan el split `default` completo de `ccore/ThreeJS-3D-Scenes` con 1.500 muestras aleatorias (`seed=42`) de `ccore/ThreeJS-3D-GLB-Assets`. No se aplico truncamiento: los ejemplos de mas de 24.576 tokens se excluyeron por limitaciones de la GPU L4.

La configuracion de optimizacion fue AdamW fusionado, LR pico de 2e-5 con decaimiento coseno, 59 pasos de warmup, weight decay 0,01, beta (0,9, 0,999), epsilon 1e-8, batch efectivo de 4 (micro-batch 1, acumulacion de gradiente 4) y una epoca. Se activo el gradient checkpointing de Unsloth y se guardaron checkpoints LoRA cada 10 pasos, con validacion cada 50 pasos y muestras HTML generadas cada 200 pasos. Una compuerta bloqueante verifica que al menos una de dos generaciones contenga HTML; si no, se detiene el entrenamiento y se registra `COLLAPSE.json`. Este diseno responde a un colapso observado en un run anterior con DFT (perdida por preferencias), donde el modelo degeneraba en razonamiento repetitivo sin HTML.

## Capacidades

- Generacion de escenas Three.js ejecutables en HTML a partir de instrucciones en lenguaje natural, usando exclusivamente el modulo ES core de Three.js 0.160.0.
- Generacion de activos exportables a GLB (formato binario de glTF) segun el conjunto de datos de GLB-Assets.
- Razonamiento explicito mediante el bloque `<think>` heredado del modelo base.
- Procesamiento de entrada multimodal (imagen y texto), heredado de LFM3-VL-2B, aunque el encoder de vision no fue ajustado.
- Implementacion de controles de camara directamente en el HTML, sin importar addons ni rutas legacy `examples/js`.
- Capacidad de tool calling y function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles segun la model card.

## Casos de uso

- Generacion de prototipos 3D web: a partir de una descripcion textual ("una escena con un cubo girando y una luz direccional"), el modelo emite un HTML autocontenido que carga Three.js 0.160.0 y construye la escena, util para maquetas rapidas en estudios de diseno web.
- Creacion de activos GLB para pipelines de juego o e-commerce: el modelo puede generar geometria y materiales exportables a GLB, que despues se integran en motores como Unity o Godot o en visores web.
- Educacion y tutoriales interactivos: generar ejemplos ejecutables de Three.js para cursos de graficos 3D, dado que el modelo respeta la restriccion de no usar addons y de implementar los controles manualmente.
- Automatizacion de demos para documentacion tecnica: producir snippets HTML completos que se incrustan en paginas de documentacion de librerias 3D, aprovechando la ventana de hasta 24.576 tokens para escenas complejas.
- Investigacion en text-to-3D: servir como referencia reproducible (QLoRA sobre L4) para estudiar el ajuste de modelos multimodales pequenos a tareas de generacion de codigo 3D.
- Generacion de escenas con contexto visual: al heredar el encoder de vision de LFM3-VL-2B, puede condicionarse con imagenes de referencia (aunque sin ajuste especifico en vision), util para replicar estilos visuales en escenas web.
- Filtrado y validacion en CI: usar la compuerta de emision de HTML como criterio automatico de calidad en pipelines que generen contenido 3D, descartando salidas truncadas o atascadas en `<think>`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la seccion de resultados esta pendiente ("TBD — run in progress") y remite a `metrics.jsonl`, `evals/step-*/` y `gen_gate_*.json` para curvas de validacion y muestras generadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 2B parametros; en bf16 requiere aproximadamente 4-5 GB solo para pesos, mas overhead de activaciones y KV cache. En cuantizacion Q4_K_M (prevista) se estima en torno a 1,5-2 GB.
- GPU recomendadas: NVIDIA L4 (24 GB) fue suficiente para el entrenamiento QLoRA con micro-batch 1; para inferencia se puede usar cualquier GPU con al menos 6-8 GB en bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB en bf16; en cuantizacion 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `trust_remote_code=True` (metodo documentado); llama.cpp u Ollama mediante el GGUF Q4_K_M previsto; vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles; la generacion de evaluacion usa `max_new_tokens=16384` con muestreo (temperature 0,1, top_p 1,0, top_k 50, repetition_penalty 1,1), lo que sugiere salidas largas y coste de inferencia considerable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlekseyCalvin/LFM3-VL-2B-3D-Coder-SFT | 2B (LoRA 3,32%) | hasta 24.576 tokens en entrenamiento | text-to-3D (Three.js/GLB) | lfm1.0 | Adaptador en HF; pesos fusionados y GGUF pendientes |
| ccore/Qwen3.5-4B-3D-Coder | 4B | no disponible | text-to-3D (Three.js) | no disponible | Referencia del estudio; disponible en HF |
| LiquidAI/LFM3-VL-2B | 2B | no disponible | vision-language general | lfm1.0 | Modelo base en HF |

## Limitaciones y advertencias

- El repositorio no contiene aun los pesos fusionados (`merged/`) ni el GGUF Q4_K_M; solo estan disponibles los checkpoints intermedios del adaptador LoRA, por lo que el uso directo requiere cargar la base y aplicar el adaptador.
- La seccion de resultados esta pendiente; no hay evidencia publicada de calidad final ni de superacion de la linea base.
- Un run anterior con DFT colapso en el paso 200 (razonamiento repetitivo, sin HTML); el riesgo de colapso persiste y la compuerta bloqueante solo lo detecta, no lo previene.
- El encoder de vision esta congelado, por lo que la capacidad de condicionamiento visual no fue ajustada a la tarea 3D.
- Solo soporta ingles segun la model card; no se documenta soporte multilingue.
- Las salidas incompletas (atascadas en `<think>` o HTML truncado) cuentan como fallos en la evaluacion, lo que indica fragilidad en la generacion de secuencias largas.
- Licencia lfm1.0: es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial, ya que se etiqueta como "other".
- Riesgo de alucinacion en APIs de Three.js: el modelo puede emitir llamadas a funciones inexistentes o a rutas de addons prohibidas por el system prompt.
- El modelo esta especializado en una unica tarea (Three.js/GLB); no es adecuado como asistente general ni para codigo fuera de ese dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3-VL-2B-3D-Coder-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Run anterior (DFT): https://huggingface.co/AlekseyCalvin/LFM3-VL-2B-3D-Coder
- Estudio de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset de escenas: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Dataset de activos GLB: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Licencia: LICENSE dentro del repositorio de Hugging Face
