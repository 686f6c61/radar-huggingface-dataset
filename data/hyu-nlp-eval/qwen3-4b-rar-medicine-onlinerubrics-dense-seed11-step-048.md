# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-048

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-048` es un ajuste fino denso de 4.022.468.096 parametros construido sobre `Qwen/Qwen3-4B-Instruct-2507`. Lo publica la organizacion HYU-NLP-EVAL y se corresponde con el paso 48 de un entrenamiento de RL con GRPO sobre rubricas dinamicas generadas en linea (metodo denominado OnlineRubrics), dentro de un run identificado como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`. El dominio declarado del run es medicina.

No se trata de un modelo final de producto, sino de un checkpoint intermedio de una politica en entrenamiento. El propio autor lo etiqueta como "Research use only" y en checkpoints hermanos de la misma familia se indica explicitamente que no se reclama ninguna capacidad medica ni garantia de seguridad downstream. Esto lo convierte en material de auditoria e investigacion sobre metodos de RL con rubricas, mas que en un modelo listo para produccion clinica.

Arquitectura, tamano y contexto heredan de la familia Qwen3: transformer denso (sin MoE), alrededor de 4.000 millones de parametros y una ventana de contexto nativa de 262.144 tokens en el modelo base. El repositorio (25,7 GB) contiene pesos en BF16 para inferencia y un subdirectorio `original_checkpoint/` con los ficheros nativos de veRL. No se han publicado resultados de benchmarks, ni ficha de idiomas, ni datos de descargas o interacciones en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), sin mezcla de expertos |
| Parametros totales | 4.022.468.096 (dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3-4B-Instruct-2507; no confirmado para este checkpoint |
| Tipos de cuantizacion | no publicados por el autor (repo solo en BF16); convertible a GGUF/INT8/INT4 con herramientas estandar |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 declara soporte de mas de 100 idiomas |
| Licencia | apache-2.0 en los metadatos; la model card indica "Research use only" (contradiccion a resolver con el autor) |
| Formato de pesos | safetensors (BF16) + checkpoint original veRL en `original_checkpoint/` |
| Libreria | transformers |
| Pipeline | text-generation (conversational) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Modo thinking | deshabilitado |
| Tamano del repositorio | 25,7 GB |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y activaciones SwiGLU. La variante `Instruct-2507` de Qwen3 opera en modo no-thinking, es decir, sin bloque de razonamiento explicito antes de la respuesta, y este checkpoint mantiene esa configuracion ("thinking disabled"). Sobre esa base, HYU-NLP-EVAL aplica un ajuste con refuerzo.

El metodo de entrenamiento, segun la nomenclatura del repositorio y de los checkpoints hermanos, es GRPO sobre rubricas dinamicas generadas en linea (OnlineRubrics), en contraposicion a GRPO con rubricas estaticas. El run se etiqueta como "RaR-Medicine" (probablemente Rubrics as Rewards aplicado a dominio medico) y corresponde a la semilla 11. El checkpoint aqui descrito es el paso 48 de la fase 1 del run `phase1-online-rubrics-medicine-full-dense-20260919-seed11`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas previas de SFT, DPO o RLHF adicionales. Tampoco se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto conversacional en el dominio general heredado del modelo base.
- Ajuste orientado a seguir rubricas de evaluacion en respuestas de tematica medica, segun la denominacion del run de entrenamiento.
- Razonamiento sin modo thinking: el modelo responde directamente, sin bloque de cadena de pensamiento explicito.
- Soporte multilingue heredado de Qwen3-4B-Instruct-2507 (no verificado especificamente en este checkpoint).
- Tool calling / function calling: no confirmado en este checkpoint; el modelo base lo soporta, pero el ajuste RL puede haber alterado ese comportamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Capacidad especial de "thinking mode": explicitamente deshabilitada.

## Casos de uso

- Auditoria de metodos de RL con rubricas: el checkpoint permite estudiar como evoluciona la politica en el paso 48 frente a pasos anteriores (2, 3, 4, 24) del mismo run y misma semilla, comparando la deriva de comportamiento.
- Investigacion en evaluacion automatica medica: sirve como generador de respuestas de referencia para probar pipelines de rubricas dinamicas en dominios de salud.
- Reproducibilidad de experimentos: al incluir `original_checkpoint/` con los ficheros nativos de veRL, facilita reanudar o inspeccionar el estado de entrenamiento con el mismo framework.
- Analisis de alineacion y sesgo: util para medir si un ajuste RL especifico de dominio introduce sesgos o regresiones en comparacion con Qwen3-4B-Instruct-2507.
- Baseline en estudios comparativos de GRPO estatico frente a GRPO con rubricas en linea, dado que la familia de checkpoints documenta ambos enfoques.
- Prototipado local de bajo coste: con 4.000 millones de parametros en BF16 cabe en una GPU de consumo de gama alta, lo que permite experimentar sin infraestructura de centro de datos.
- Generacion de datos sinteticos para dominios medicos en fase de investigacion, siempre que se apliquen revisiones humanas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,0 GB solo en parametros (4,022 mil millones x 2 bytes), mas overhead de runtime.
- VRAM estimada en BF16, con contexto corto (4K-8K tokens): entre 10 y 12 GB en total, incluyendo cache KV y activaciones.
- VRAM estimada en BF16, con contexto de 32.768 tokens: aproximadamente 4,6 GB adicionales solo de cache KV, segun la geometria del modelo base (36 capas, 8 cabezas KV, head_dim 128). Total en torno a 14-16 GB.
- VRAM estimada en BF16, con contexto de 262.144 tokens: en torno a 37 GB solo de cache KV, lo que exige GPUs de 80 GB o tecnicas de atencion eficiente y cuantizacion de la cache.
- Cuantizacion INT8: alrededor de 4,3 GB de pesos, viable en GPUs de 8 GB con contexto reducido.
- Cuantizacion INT4 (por ejemplo Q4_K_M): alrededor de 2,5 GB de pesos, ejecutable en GPUs de consumo de 6-8 GB y en CPU con llama.cpp.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para BF16 sin problemas en contextos moderados; A100 40/80 GB o H100 para contextos largos; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones de 8 y 4 bits.
- Despliegue: transformers es la libreria declarada; el repo es compatible con text-generation-inference y endpoints compatibles. Tambien es desplegable con vLLM, SGLang o llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-048 (este) | 4,02 B densos | 262.144 (heredado del base) | Ajuste RL con rubricas en linea | apache-2.0 en metadatos / "Research use only" en model card | HuggingFace, 0 descargas | Checkpoint intermedio, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B densos | 262.144 | Instruct, sin thinking | Apache 2.0 | Ampliamente desplegado | Modelo base de este checkpoint; soporte de tool calling y multilingue |
| Qwen3-4B-Thinking-2507 | 4,02 B densos | 262.144 | Modo thinking explicito | Apache 2.0 | Ampliamente desplegado | Alternativa cuando se requiere razonamiento largo previo a la respuesta |
| Checkpoints hermanos del mismo run (step-002, 003, 004, 024) | 4,02 B densos | 262.144 | Ajuste RL con rubricas en linea | Igual que este | HuggingFace, friendli.ai, featherless.ai | Distintos pasos del mismo entrenamiento; comparables entre si |

No se dispone de datos de rendimiento comparado para situar este checkpoint frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de produccion: es un checkpoint intermedio de investigacion, etiquetado como "Research use only" por el propio autor.
- Contradiccion de licencia: los metadatos indican apache-2.0 mientras la model card restringe a uso de investigacion. Debe aclararse con el autor antes de cualquier uso comercial.
- Ausencia total de benchmarks, evaluaciones de seguridad y validacion clinica publicadas. No se puede afirmar ninguna capacidad medica.
- Riesgo de alucinacion elevado en dominio clinico, agravado por la ausencia de evaluacion especifica. Cualquier salida medica requiere revision profesional.
- Sesgos: no documentados. Se desconocen los sesgos heredados del modelo base y los introducidos por el dataset de rubricas del run.
- Sin modo thinking: tareas que requieran razonamiento extendido pueden rendir peor que en Qwen3-4B-Thinking-2507.
- Idiomas soportados no declarados en la ficha; el comportamiento multilingue tras el ajuste RL no esta verificado.
- Tool calling y comportamiento de agente no confirmados tras el ajuste; conviene revalidarlos si se van a usar en produccion.
- Cero descargas y cero interacciones en HuggingFace: sin comunidad que haya validado el checkpoint ni reportado fallos.
- Fecha de creacion futura respecto a la base tecnologica habitual (2026-10-01), dato a verificar si se integra en catalogos automaticos.
- El repositorio incluye un directorio con ficheros nativos de veRL (solo parametros) que incrementa el tamano a 25,7 GB; no es necesario para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-048
- Checkpoint hermano step-003: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Checkpoint hermano step-004: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-004
- Checkpoint hermano step-002 en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-002
- Checkpoint hermano step-024 en FriendliAI: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-024
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388v1
