# BH-Language-AI/lumi-vl-8b-cua-base4mp

## Resumen

Lumi-VL-8B-CUA-Base4MP es un adaptador LoRA experimental desarrollado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-9B, orientado a tareas de GUI grounding y computer-use agents (CUA). El adaptador se entrena para localizar elementos de interfaz grafica (botones, campos, menus) en capturas de pantalla de alta resolucion (4 megapixeles), una capacidad critica para agentes que operan entornos de escritorio de forma autonoma.

El modelo se presenta como "Stage-7" de una cadena de entrenamiento incremental que parte de un base sin ajuste (2,5% de acierto) y progresa hasta el Stage-2 en produccion (64,5% en ScreenSpot-Pro con 400 muestras). Este Stage-7 alcanza un 61,75% (247/400) tras 1800 pasos de entrenamiento, todavia por debajo del modelo de produccion, y el autor lo marca explicitamente como no recomendado para produccion.

La relevancia del modelo radica en su enfoque: un adaptador ligero (repo de 0,5 GB) sobre un modelo multimodal de 9,41 B de parametros con 262k de contexto, que permite experimentar con tecnicas de grounding visual sin reentrenar el modelo completo. La nomenclatura "8b" en el nombre del repo no coincide con los 9,41 B del base, lo que conviene tener en cuenta al evaluar requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B |
| Parametros totales | 9,41 B (modelo base); adaptador LoRA de tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (el base admite bf16; cuantizaciones del adaptador no especificadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Capas del base | 32 |
| Hidden size del base | 4096 |
| Precision del base | bf16 (~18,8 GB) |
| Resolucion de entrada | 4 MP (4 megapixeles) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-9B, un transformer multimodal (vision + texto) de 9,41 B de parametros con 32 capas, hidden size de 4096 y ventana de contexto de 262k tokens. El adaptador modifica el comportamiento del base para la tarea especifica de GUI grounding: dada una captura de pantalla y una instruccion en lenguaje natural, predecir las coordenadas del elemento objetivo.

El entrenamiento corresponde al "Stage-7" de un ciclo incremental, con 1800 pasos sobre imagenes de 4 MP. La metrica reportada es 61,75% (247/400) sobre un conjunto de evaluacion de 400 muestras. El autor documenta una tendencia de mejora de aproximadamente +0,3 puntos por cada 100 pasos (58,3% a 600 pasos, 61,75% a 1800 pasos) y estima que necesitaria 3000+ pasos para alcanzar el 64,5% del Stage-2 en produccion. No se detalla la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del ajuste LoRA.

## Capacidades

- GUI grounding: localizacion de elementos de interfaz (botones, campos de texto, menus, iconos) en capturas de pantalla de 4 MP.
- Computer-use agents (CUA): soporte para agentes que interactuan con entornos de escritorio.
- Procesamiento multimodal: entrada conjunta de imagen (captura de pantalla) y texto (instruccion).
- Cobertura de aplicaciones en el conjunto de evaluacion: davinci, eviews, android, macos, autocad, windows, excel y blender.
- Contexto largo: hereda los 262k tokens del base Qwen3.5-9B, util para historiales de interaccion extensos.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion de pruebas de interfaz: el adaptador puede localizar elementos en capturas de apps de escritorio (Windows, macOS, Android) para generar scripts de test end-to-end, aprovechando su entrenamiento especifico en estas plataformas.
- Agentes de escritorio asistidos: integrado en un pipeline de computer-use, permite que un agente identifique el control a pulsar en cada paso; su contexto de 262k facilita mantener el historial de acciones.
- Grounding en herramientas de diseno y CAD: con resultados medidos en autocad (14/29) y blender (33/60), puede emplearse en flujos de automatizacion de estas aplicaciones, aunque con tasa de acierto limitada.
- Extraccion de datos de hojas de calculo: el rendimiento en excel (7/10) sugiere utilidad para localizar celdas y rangos en tareas de automatizacion de hojas de calculo.
- Investigacion en adaptadores visuales: al ser un LoRA ligero (0,5 GB) sobre un base abierto, sirve como punto de partida para experimentos de fine-tuning de GUI grounding sin coste de reentrenamiento completo.
- Evaluacion comparativa de estrategias de entrenamiento: la cadena documentada (base, Stage-1, Stage-2, Stage-7) permite estudiar el efecto del numero de pasos y la resolucion sobre el rendimiento de grounding.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Evaluacion global (400 muestras, 4 MP) | 61,75% (247/400) |
| davinci | 20/35 |
| eviews | 38/40 |
| android | 38/59 |
| macos | 35/59 |
| autocad | 14/29 |
| windows | 35/66 |
| excel | 7/10 |
| blender | 33/60 |

Cadena de progresion del ciclo de entrenamiento (segun el autor):

| Etapa | Resultado |
|---|---|
| Base sin ajuste | 2,5% |
| Stage-1 | 39% |
| Stage-2 @2MP | 51,25% |
| Stage-2 @4MP (produccion) | 64,5% |
| Stage-7 @4MP (este modelo) | 61,75% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base en bf16 ocupa aproximadamente 18,8 GB, por lo que la inferencia requiere al menos 20-24 GB de VRAM sumando el adaptador y los estados de activacion. Con cuantizacion del base a 8 bits o 4 bits (no documentada para este adaptador) podria reducirse a rangos de 10-12 GB y 6-8 GB respectivamente.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para bf16 sin cuantizar. En consumer, una RTX 4090 (24 GB) podria alojar el base en bf16 con margen ajustado.
- Consumer GPU: cabe en RTX 4090; en GPUs de 16 GB solo con cuantizacion del base.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base Qwen3.5-9B y aplicar el LoRA. Compatible con frameworks PEFT/vLLM/TGI que soporten adaptadores LoRA; llama.cpp y Ollama requeririan fusion previa del adaptador en el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento GUI grounding | Licencia | Estado |
|---|---|---|---|---|---|
| Lumi-VL-8B-CUA-Base4MP (Stage-7) | 9,41 B (base) + LoRA | 262k | 61,75% (400 muestras, 4 MP) | no disponible | Experimental |
| Lumi-VL-8B-CUA (Stage-2) | 9,41 B (base) + LoRA | 262k | 64,5% (400 muestras, 4 MP) | no disponible | Produccion |
| Qwen/Qwen3.5-9B (base) | 9,41 B | 262k | 2,5% (sin ajuste) | no disponible | Base |

No se dispone de datos de otros modelos de GUI grounding comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Marcado explicitamente como experimental por el autor: no recomendado para produccion.
- Rendimiento inferior al modelo de produccion (Stage-2, 64,5%) en 2,75 puntos porcentuales.
- Rendimiento desigual por aplicacion: excel (7/10) y autocad (14/29) muestran tasas de acierto bajas; windows (35/66) y android (38/59) quedan en torno al 53-64%.
- Requiere cargar el modelo base completo (18,8 GB en bf16) ademas del adaptador, lo que encarece el despliegue.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del base.
- Idiomas soportados no documentados.
- Riesgo de alucinacion de coordenadas: al tratarse de un modelo de grounding, puede predecir posiciones plausibles pero incorrectas, especialmente en interfaces no representadas en el entrenamiento.
- Sesgos: no documentados; al depender del dataset de entrenamiento, puede presentar sesgo hacia las plataformas y aplicaciones mas representadas (eviews, android, macos).
- La nomenclatura "8b" del repo no coincide con los 9,41 B del base, lo que puede inducir a error en la planificacion de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-base4mp
- Modelo de produccion (Stage-2): https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
