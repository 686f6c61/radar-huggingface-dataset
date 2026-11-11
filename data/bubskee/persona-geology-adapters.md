# bubskee/persona-geology-adapters

## Resumen

`bubskee/persona-geology-adapters` es una coleccion de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen3.5-4B (revision `851bf6e`). El autor, bubskee, los publica como material de investigacion derivado de su articulo "Persona Geology: Underlying Structure in Character Training", un ensayo sobre la estructura subyacente en el entrenamiento de personajes. No es un modelo autonomo, sino un conjunto de checkpoints intermedios y finales que modifican el comportamiento estilistico del modelo base.

El repositorio se centra en dos rasgos de personalidad contrapuestos, `relaxed` y `high_strung`, entrenados en dos etapas con datos generados por profesores distintos (`glm45air` y `deepseek-v41flash`). La publicacion incluye checkpoints cada pocos pasos, controles con pares repetidos, reproducciones de una release original y replicas del mismo recetario ejecutadas en hardware distinto (A40, A100, RTX 6000 Ada), lo que sugiere un interes por la reproducibilidad y por la trayectoria del entrenamiento mas que por el resultado final.

Es relevante ahora por su caracter de material abierto para estudiar como se comporta el ajuste fino de personalidad en modelos pequenos (4B) y porque documenta explicitamente la variabilidad entre ejecuciones y hardware. El estado es claramente experimental: el propio autor marca el repositorio como work in progress y advierte de que nombres, estructura y contenidos cambiaran sin aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptadores LoRA; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen/Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los artefactos son adaptadores LoRA cargables con `peft.PeftModel` sobre el checkpoint `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen/Qwen3.5-4B. El entrenamiento se organiza en dos etapas por rasgo: una stage1 con muestras frescas de un profesor (`glm45air` o `deepseek-v41flash`) y una stage2 construida sobre la stage1. Existe ademas una variante `-persona` que ensambla ambas etapas. El repositorio incluye controles (`better-repeat445-<trait>-stage1`) que repiten los pares liberados originalmente, y reproducciones exactas de la release previa (`*-release-exact`, `*-release-epoch-*`).

La innovacion metodologica no esta en la arquitectura (LoRA estandar) sino en la organizacion experimental: checkpoints frecuentes para observar la trayectoria, replicas del mismo recetario en A40, A100 y RTX 6000 Ada, y runs de humo (`*smoke*`). El autor indica que no se incluye el estado del optimizador, por lo que los adaptadores permiten inferencia pero no reanudar el entrenamiento. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Modificacion del estilo y tono del modelo base hacia un registro `relaxed` o `high_strung`, segun el adaptador cargado.
- Generacion de texto y conversacion multi-turno heredadas del base Qwen/Qwen3.5-4B.
- Carga selectiva por subcarpeta (`runs/<run>/checkpoint-<step>/` o `runs/<run>/`), lo que permite comparar comportamiento entre pasos de entrenamiento.
- Reproduccion controlada del recetario en distintos hardware (A40, A100, RTX 6000 Ada) para analisis de variabilidad.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo thinking especificas de estos adaptadores.

## Casos de uso

- Investigacion sobre entrenamiento de personalidad: cargar checkpoints intermedios de `better-glm45air-relaxed-stage1` y comparar la evolucion del tono paso a paso, aprovechando que el autor publica checkpoints frecuentes.
- Analisis de reproducibilidad: ejecutar los adaptadores `*-a40`, `*-a100` y `*-rtx6000ada` sobre el mismo prompt y medir la deriva de comportamiento entre hardware.
- Experimentos de control: usar `better-repeat445-<trait>-stage1` como linea base frente a las variantes con profesor para aislar el efecto de los datos del profesor.
- Prototipado de personajes conversacionales: aplicar el adaptador `-persona` ensamblado sobre Qwen3.5-4B para obtener un asistente con registro relajado o tenso en demos internas.
- Estudio de transferencia de rasgos: comparar `relaxed` frente a `high_strung` sobre el mismo conjunto de prompts para medir separabilidad estilistica.
- Docencia y formacion: usar el repositorio como ejemplo practico de flujo PEFT (carga con `PeftModel.from_pretrained`, subcarpetas por run) en cursos de ajuste fino.
- Evaluacion de adaptadores LoRA en modelos de 4B: medir coste de inferencia y calidad percibida frente al base sin adaptador en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; depende del base Qwen/Qwen3.5-4B y de la precision de carga elegida.
- GPU recomendadas: no disponible; el autor documenta ejecuciones en A40, A100 y RTX 6000 Ada, lo que sugiere que el entrenamiento se hizo en esas tarjetas, pero no se detallan requisitos de inferencia.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: carga via `peft` + `transformers` (documentada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bubskee/persona-geology-adapters | adaptadores sobre base 4B | no disponible | LoRA/PEFT | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | transformer decoder-only | no disponible | Hugging Face |
| Alternativas de ajuste de personaje sobre modelos 4B | no disponible | no disponible | LoRA | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio marcado explicitamente como work in progress: nombres, estructura y contenidos pueden cambiar sin aviso.
- Sin estado del optimizador: los adaptadores permiten inferencia, no reanudar el entrenamiento.
- Sin licencia declarada: no hay base legal explicita para uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Sin idiomas declarados: el comportamiento multilingue depende del base y no esta documentado para los adaptadores.
- Sin benchmarks: no hay evidencia cuantitativa de calidad ni de mejora frente al base.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al modificar el estilo, puede alterar la calibracion del modelo base.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta; ecosistema de validacion practicamente nulo.
- Dependencia estricta de la revision `851bf6e` del base; cargar sobre otra revision puede invalidar los adaptadores.

## Enlaces

- Hugging Face: https://huggingface.co/bubskee/persona-geology-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo de referencia: https://www.lesswrong.com/posts/iErBZ5fomL4tyyHy6/persona-geology-underlying-structure-in-character-training
