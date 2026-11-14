# imhlg/qwen3-4b-finops-lora-week1

## Resumen

`qwen3-4b-finops-lora-week1` es un adaptador LoRA de PEFT (r=8, α=16) entrenado sobre el modelo base `Qwen/Qwen3-4B`, desarrollado por el usuario `imhlg` en el marco del programa Applied AI Foundry (v4.0) asociado a curons.com. El adaptador especializa al modelo base para generar informes deterministas etiquetados como `[FINOPS_AUDIT_REPORT]`, orientados a diagnóstico de dimensionamiento de GPU en entornos empresariales, cuellos de botella de KV-cache y optimizaciones de serving con vLLM.

El checkpoint incluye, además del adaptador, telemetría de descomposición en valores singulares (SVD) tanto de los pesos base de la capa 18 como de la actualización de bajo rango ΔW = (α/r)·B·A. Esta documentación del espectro de pesos y de la trayectoria del adaptador es poco habitual en adaptadores LoRA públicos y resulta útil para estudiar la dinámica de fine-tuning de bajo rango.

El entrenamiento se realizó en hardware de consumo (Apple M4 con 24 GB de memoria unificada, PyTorch sobre backend MPS en bfloat16) durante 15 pasos de SFT, con una reducción de la pérdida de 3,8433 a 2,0771. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; entrenado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 8 |
| Alpha LoRA (α) | 16 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft (compatible con transformers v5 y trl) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only del que no se detallan en la informacion disponible ni el numero exacto de capas, ni la composicion del dataset de preentrenamiento, ni el contexto nativo. La capa 18 analizada presenta dimensiones de proyeccion compatibles con un modelo de hidden size 2560 y FFN intermedio de 9728, con cabezas de atencion de dimension 4096 en `q_proj` y 1024 en `k_proj`/`v_proj`.

El fine-tuning emplea SFT con `trl.SFTTrainer` y `peft`, con LoRA de rango 8 y α=16 sobre las siete proyecciones lineales de cada bloque (atencion y MLP). El entrenamiento se ejecuto en un Apple M4 con 24 GB de memoria unificada, en bfloat16 sobre el backend MPS de PyTorch, durante 15 pasos, alcanzando una perdida final de 2,0771 desde 3,8433. La actualizacion relativa ‖ΔW‖_F/‖W‖_F se mantiene en el rango 0,15%-0,28% en todos los modulos, y el rango verificado de ΔW es 8 en todos los casos, lo que confirma que el adaptador satura el rango configurado y no ha colapsado a un subespacio de menor dimension.

La model card documenta tambien el espectro SVD de los pesos base en la capa 18: el mayor valor singular aparece en `q_proj` (σ₁=9,465) y `mlp.gate_proj` (σ₁=9,431), mientras que el rango efectivo de Shannon es mas bajo en `k_proj` (820,3 de 1024) y `v_proj` (913,2 de 1024), lo que sugiere una menor utilizacion efectiva del espacio en esas proyecciones.

## Capacidades

- Generacion de informes de auditoria FinOps con la etiqueta determinista `[FINOPS_AUDIT_REPORT]`.
- Diagnostico de dimensionamiento de GPU para cargas de inferencia empresarial.
- Analisis de cuellos de botella de KV-cache en serving de modelos.
- Recomendaciones de optimizacion para despliegues con vLLM.
- Razonamiento tecnico sobre infraestructura y costes de computo (heredado del modelo base y reforzado por el SFT).
- Capacidades generales del modelo base Qwen3-4B (generacion de texto, codigo, matematicas, multilingue) potencialmente preservadas, aunque no verificadas en la informacion disponible.
- Soporte de tool calling y function calling: no disponible de forma especifica para el adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.

## Casos de uso

- Auditoria de costes de inferencia: el adaptador genera informes estructurados con la etiqueta `[FINOPS_AUDIT_REPORT]` que un pipeline posterior puede parsear para extraer recomendaciones de redimensionado de GPU y ajuste de configuracion de vLLM.
- Analisis de KV-cache en produccion: dado un perfil de carga (longitud de secuencia, batch, modelo), el adaptador produce diagnosticos sobre presion de memoria y sugerencias de `max_model_len`, `gpu_memory_utilization` o `block_size`.
- Consultoria interna de capacidad: equipos de plataforma pueden usar el modelo para obtener estimaciones rapidas de VRAM necesaria por configuracion antes de comprometer recursos en cloud.
- Pre-chequeo en pipelines de CI/CD de serving: el adaptador puede integrarse como paso de validacion que revisa manifiestos de despliegue y emite un informe de riesgos de coste.
- Formacion y documentacion tecnica: generar explicaciones reproducibles sobre por que una configuracion concreta de serving satura memoria o degrada throughput.
- Investigacion sobre LoRA y SVD: el checkpoint sirve como caso de estudio reproducible de dinamica de adaptadores de bajo rango, con metricas espectrales publicadas por capa y modulo.
- Prototipado rapido en hardware de consumo: al ser un adaptador de 0,1 GB sobre un modelo de 4.000 millones de parametros, puede ejecutarse en un portatil con memoria unificada suficiente para el modelo base cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento y de espectro de pesos:

| Metrica | Valor |
|---|---|
| Perdida SFT inicial | 3,8433 |
| Perdida SFT final | 2,0771 |
| Pasos de entrenamiento | 15 |
| Rango verificado de ΔW | 8 (en los 7 modulos) |
| Actualizacion relativa maxima | 0,2779% (`k_proj`) |
| Actualizacion relativa minima | 0,1526% (`down_proj`) |

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB y no anade requisitos significativos de VRAM sobre el modelo base.
- El modelo base Qwen3-4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para pesos; con overhead de KV-cache y activaciones, se recomienda un minimo de 12-16 GB para contexto moderado.
- En cuantizacion de 8 bits, el modelo base cabe en torno a 4-5 GB; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas para el modelo base: NVIDIA RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB), A100 (40/80 GB) o H100 para mayor throughput; en consumer, RTX 3090/4090 o GPUs con 16 GB o mas.
- Despliegue: compatible con `transformers` + `peft` (carga del adaptador sobre el base), y con vLLM mediante `--enable-lora` una vez fusionado o cargado como adaptador dinamico; tambien es posible fusionar el adaptador con `merge_and_unload()` y exportar a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El entrenamiento original se realizo en Apple M4 con 24 GB de memoria unificada, lo que confirma viabilidad de fine-tuning en hardware de consumo para este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `imhlg/qwen3-4b-finops-lora-week1` | Adaptador LoRA sobre 4B | no disponible | LoRA especializado en FinOps | Apache 2.0 | Incluye telemetria SVD; entrenamiento de 15 pasos |
| `Qwen/Qwen3-4B` (base) | 4B aprox. | no disponible | Modelo generalista | Apache 2.0 | Sin especializacion FinOps |
| Adaptadores LoRA genericos sobre Qwen3-4B | Adaptador sobre 4B | no disponible | LoRA generico | variable | Sin documentacion espectral publicada |
| Modelos FinOps especializados de mayor tamano | no disponible | no disponible | Fine-tune completo o LoRA | variable | No disponibles en la informacion consultada |

La comparativa con alternativas especificas de la misma categoria (adaptadores LoRA para FinOps) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador se entreno durante solo 15 pasos de SFT, lo que limita la profundidad de la especializacion; la perdida final de 2,0771 sugiere margen de mejora.
- No se documenta el dataset de entrenamiento, su tamano, composicion ni procedencia, lo que impide evaluar sesgos o cobertura.
- No se han publicado evaluaciones de calidad, benchmarks ni pruebas de robustez; el rendimiento real en produccion es desconocido.
- Riesgo de alucinacion en recomendaciones de infraestructura: las cifras de VRAM, throughput o configuracion de vLLM generadas por el modelo deben validarse contra mediciones reales antes de aplicarse.
- El formato de salida con etiqueta `[FINOPS_AUDIT_REPORT]` puede no respetarse de forma consistente fuera de las condiciones de entrenamiento.
- Capacidades multilingues no documentadas; el idioma de entrenamiento no se especifica.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3-4B tiene su propia licencia que debe verificarse por separado.
- El uso de hardware MPS para el entrenamiento puede introducir diferencias numericas respecto a entrenamientos en CUDA; no se documenta validacion cruzada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/imhlg/qwen3-4b-finops-lora-week1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Perfil del autor: https://huggingface.co/imhlg
- Sitio del programa: https://curons.com
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- vLLM (LoRA serving): https://docs.vllm.ai
