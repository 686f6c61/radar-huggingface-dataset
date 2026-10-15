# lijinyan89/olmo3-190m-zh-nano-continue

## Resumen

El modelo `lijinyan89/olmo3-190m-zh-nano-continue` es un ajuste por preentrenamiento continuado (continued pretraining) sobre `lijinyan89/olmo3-190m-zh-nano`, un modelo de la familia Olmo 3 de AI2 adaptado por la comunidad al chino. Lo publica el usuario de Hugging Face lijinyan89 y se distribuye bajo licencia Apache 2.0, con el chino (`zh`) como unico idioma declarado.

A pesar de la denominacion "190m" del nombre, el recuento real de parametros en los pesos safetensors es de 21.975.744 (aproximadamente 22 millones), muy por debajo de los 190 millones que sugiere el identificador. Esta discrepancia entre el nombre del repositorio y el tamano real es relevante para cualquier evaluacion de recursos.

Se trata de un modelo base (no una version alineada con instrucciones), orientado a tareas de modelado del lenguaje en chino. Su relevancia es limitada por su tamano y por el escaso numero de descargas (4) y ausencia de likes; se enmarca en el ecosistema de variantes comunitarias de Olmo 3 con fines educativos o experimentales (etiqueta `llm001`), no como un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Olmo 3, decoder-only transformer; sin confirmacion del autor) |
| Parametros totales | 21.975.744 (segun safetensors); el nombre indica "190m" |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; sin GGUF publicado) |
| Idiomas soportados | chino (`zh`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. El modelo es un ajuste por preentrenamiento continuado del checkpoint base `lijinyan89/olmo3-190m-zh-nano`, que a su vez se inspira en la familia Olmo 3 de AI2 (modelos totalmente abiertos, publicados a escalas de 7B y 32B segun el paper arXiv 2512.13961). No se especifica si la arquitectura subyacente es exactamente la de Olmo 3 ni los detalles de atencion, normalizacion o tokenizador.

El entrenamiento de esta variante continuada utiliza el dataset `cmz1024/llm101-olmo3-zh-demo-data/continue` (fichero `full_v31.bin`), con una tasa de aprendizaje de 2e-4 y un warmup del 10 % del total de pasos. El autor indica que la LR baja se eligio para evitar el olvido catastrofico de las capacidades aprendidas en el checkpoint base. No se proporciona el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF, DPO o instruccion.

## Capacidades

- Generacion de texto en chino como capacidad principal esperada de un modelo base.
- Modelado del lenguaje y continuacion de texto; no es un modelo afinado para instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- Cobertura multilingue limitada al chino segun los metadatos (`language: zh`).
- No hay informacion sobre capacidades de codigo o matematicas.

## Casos de uso

- Experimentacion educativa con preentrenamiento continuado: sirve para reproducir el flujo de seguir entrenando un modelo base pequeno sobre un corpus en chino, dado que el autor documenta datos, LR y warmup.
- Investigacion sobre olvido catastrofico: permite estudiar el efecto de una LR baja (2e-4) sobre un checkpoint base en un dominio idiomatico concreto.
- Generacion de texto auxiliar en chino de bajo coste: al tratarse de ~22 M de parametros, puede ejecutarse en CPU para tareas de completado simples.
- Prototipado rapido de pipelines de transformers: sirve como modelo de prueba para validar codigo de carga con `AutoModelForCausalLM` antes de escalar a modelos mayores.
- Fine-tuning posterior por terceros: al ser un modelo base con licencia Apache 2.0, puede usarse como punto de partida para ajustes especificos en chino.
- Evaluacion comparativa de variantes nano de Olmo 3: util para medir como distintas continuaciones de pretraining afectan a la calidad del texto en chino frente al checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web no aporta resultados especificos para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 44 MB en fp16, 22 MB en int8 y 11 MB en int4 para los ~22 M de parametros (sin contar activaciones ni overhead del runtime).
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere hardware de datacenter. Incluso una GTX 1050, una iGPU o una CPU convencional pueden ejecutarlo.
- Cabe en cualquier GPU de consumo sin problemas; tambien se ejecuta en CPU y en dispositivos de gama baja.
- Opciones de despliegue: `transformers` (soporte confirmado en la model card); vLLM, llama.cpp, Ollama o TGI requeririan conversion a los formatos correspondientes, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo3-190m-zh-nano-continue (este) | ~22 M (real) | no disponible | zh | apache-2.0 | Hugging Face, 4 descargas |
| olmo3-190m-zh-nano (base) | no disponible | no disponible | zh | no disponible | Hugging Face |
| Olmo 3 (familia AI2) | 7B y 32B | no disponible en la informacion | principalmente en | totalmente abierta (paper arXiv 2512.13961) | Hugging Face y GitHub allenai/OLMo |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparacion con la familia Olmo 3 original es de escala, no de resultados: el modelo aqui descrito es varias ordenes de magnitud mas pequeno que los 7B y 32B de AI2.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "190m" pero los pesos contienen 21.975.744 parametros; conviene verificar el uso esperado antes de integrarlo.
- Al ser un modelo base no afinado con instrucciones, no se debe esperar un comportamiento de asistente ni seguimiento fiable de instrucciones.
- Riesgo alto de alucinacion y de generacion incoherente, agravado por el tamano reducido del modelo.
- Idioma limitado al chino; no hay evidencia de capacidad multilingue.
- Longitud de contexto no documentada; se desconoce el limite practico de tokens de entrada.
- Origen comunitario y trazabilidad limitada: el checkpoint base es una variante no oficial de Olmo 3, y los repositorios relacionados muestran referencias circulares de modelo base.
- No se documentan sesgos, composicion del corpus de entrenamiento ni filtros de datos, por lo que se desconoce el sesgo potencial.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y de garantias de calidad desaconseja su uso en produccion sin validacion previa.
- Metadatos incompletos: sin pipeline declarado, sin tamanos de contexto ni de cuantizacion publicados.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/lijinyan89/olmo3-190m-zh-nano-continue
- Modelo base: https://huggingface.co/lijinyan89/olmo3-190m-zh-nano
- Variante relacionada: https://huggingface.co/lilingsunny/olmo3-190m-zh-nano
- Variante relacionada: https://huggingface.co/MikeLee000/olmo3-190m-zh-nano
- Ficha de referencia (terceros): https://essamamdani.com/ai-models/hf-livingworld-olmo3-190m-zh-nano
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio de codigo Olmo: https://github.com/allenai/OLMo
