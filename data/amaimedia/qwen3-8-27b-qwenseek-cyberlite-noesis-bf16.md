# AMAImedia/Qwen3.8-27B-Qwenseek-CyberLite-NOESIS-BF16

## Resumen

Qwenseek-3.8-27B-CyberLite-NOESIS-BF16 es un fine-tune supervisado del modelo base `unsloth/Qwen3.8-27B`, especializado en ciberseguridad defensiva y razonamiento técnico. El modelo original fue desarrollado por trjxter y posteriormente empaquetado por AMAImedia como parte de la plataforma NOESIS de doblaje profesional multilingüe, bajo el framework DHCF-FNO. Se distribuye como un repack de 35 shards en formato BF16 Safetensors.

El objetivo del fine-tune no es convertir el modelo en una herramienta exclusiva de seguridad, sino reforzar sus capacidades de análisis defensivo, revisión de código seguro y razonamiento adversarial controlado, manteniendo intactas las habilidades generales de programación, uso de herramientas y razonamiento del modelo base. La arquitectura subyacente es Qwen3.8 (familia `qwen3_5`), un transformer denso de aproximadamente 27.800 millones de parámetros con componentes multimodales, aunque en este fine-tune los parámetros de visión permanecieron congelados, por lo que debe tratarse como una versión especializada en texto.

El entrenamiento se realizó mediante QLoRA de 4 bits con precisión de cómputo BF16 sobre una única NVIDIA H100 de 80 GB, utilizando un corpus combinado de 48.527 ejemplos procedentes de destilación de DeepSeek V4 Flash y razonamiento de DeepSeek V4 Pro. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (familia `qwen3_5`), transformer denso con componentes multimodales (visión congelada) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto validado en SFT; el modelo base Qwen3.8-27B soporta hasta 262.144 tokens) |
| Tipos de cuantizacion | BF16 (formato de publicacion); entrenamiento con QLoRA 4-bit; no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | en, ru, zh, ja, kk, vi (segun metadata de HuggingFace; el modelo esta principalmente orientado a ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, 35 shards) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8, un transformer denso de 27.000 millones de parametros que incorpora componentes multimodales (vision y texto). En este fine-tune, los parametros de vision se mantuvieron congelados, por lo que el modelo resultante es exclusivamente textual. La arquitectura incluye soporte para multi-token prediction (MTP) y esta disenada para tareas de razonamiento, generacion de codigo y uso de herramientas.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con QLoRA de 4 bits y precision de computo BF16. Se utilizo un unico adaptador LoRA con rank 64 y alpha 128, que posteriormente se fusiono de forma segura en los pesos BF16 del modelo base. El entrenamiento se ejecuto en una NVIDIA H100 de 80 GB durante una unica pasada.

Los datos de entrenamiento provienen de dos fuentes principales:

- **DeepSeek V4 Flash teacher-distillation corpus** (40.513 ejemplos): incluye 13.000 ejemplos de Cyber Blue (defensa), 6.999 de Cyber Red controlado, 9.982 de tareas agénticas, 5.601 de codificacion y 4.931 de uso de herramientas. Las trayectorias de herramientas conservan supervision estructurada de llamadas a funciones.
- **DeepSeek V4 Pro reasoning corpus** (8.014 ejemplos): razonamiento sintetico generado con DeepSeek V4 Pro para proporcionar supervision de razonamiento general mas amplia.

El corpus total antes del filtro de longitud de secuencia de 32K era de 48.527 ejemplos. No se menciona el uso de RLHF o DPO en esta etapa; el autor indica que una fase posterior anadira reinforcement learning para ejecucion agéntica de largo horizonte.

## Capacidades

- **Analisis de vulnerabilidades defensivo**: identifica y evalua fallos de seguridad en codigo y sistemas, con enfoque en evidencia y razonamiento estructurado.
- **Revision de codigo seguro**: detecta malas practicas, vulnerabilidades comunes (inyeccion, desbordamiento, etc.) y propone remediaciones concretas.
- **Razonamiento adversarial controlado**: capacidad de red team limitada a entornos autorizados, locales, sandbox o educativos. No implica autorizacion para probar sistemas de terceros.
- **Generacion de codigo y ingenieria de software**: mantiene las capacidades del modelo base para programacion general, incluyendo generacion, depuracion y refactorizacion.
- **Uso de herramientas (tool calling)**: soporta llamadas estructuradas a funciones, con supervision especifica en las trayectorias de entrenamiento.
- **Tareas agénticas**: puede ejecutar flujos de trabajo multi-paso con razonamiento encadenado, aunque sin el refuerzo especifico para ejecucion de largo horizonte que se planea en una fase posterior.
- **Razonamiento tecnico**: resuelve problemas complejos de logica, matematicas y sistemas, gracias al corpus de razonamiento de DeepSeek V4 Pro.
- **Multilingue**: soporta ingles, ruso, chino, japones, kazajo y vietnamita, aunque el entrenamiento esta principalmente orientado al ingles.

## Casos de uso

- **Analisis de vulnerabilidades en entornos de desarrollo**: un equipo de seguridad puede enviar fragmentos de codigo o descripciones de arquitectura al modelo para obtener un informe preliminar de posibles fallos, con recomendaciones de mitigacion. Su entrenamiento en Cyber Blue lo hace adecuado para esta tarea sin sacrificar la comprension general del codigo.
- **Revision de codigo en pipelines CI/CD**: integrado como paso automatizado de revision de seguridad, el modelo puede analizar diffs de codigo y senalar patrones peligrosos antes del merge. Su soporte de tool calling permite conectarlo a APIs de repositorios o sistemas de ticketing.
- **Planificacion de respuesta a incidentes**: ante una descripcion de un incidente de seguridad, el modelo puede generar un plan de deteccion, contencion, remediacion y validacion, estructurado por fases y con criterios de exito.
- **Generacion de codigo seguro en produccion**: desarrolladores pueden usarlo como asistente de programacion que prioriza practicas seguras, gracias a su entrenamiento mixto en codificacion y seguridad. Su contexto de 32K permite manejar archivos de tamano medio.
- **Entrenamiento y educacion en ciberseguridad**: en entornos sandbox o laboratorios, el modelo puede generar escenarios de ataque controlado, explicar tecnicas de explotacion y proponer ejercicios practicos para estudiantes, siempre bajo autorizacion explicita.
- **Automatizacion de tareas agénticas con herramientas**: el modelo puede orquestar llamadas a APIs, ejecutar comandos en entornos controlados y razonar sobre los resultados, util para automatizar tareas de hardening de sistemas o auditorias de configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el fine-tune Qwenseek-3.8-27B-CyberLite en la informacion disponible. El modelo base Qwen3.8-27B, segun la busqueda web, supera a Claude Opus 4.6 Max en SWE-bench Pro segun la tabla de lanzamiento de Qwen, pero no se dispone de numeros concretos ni de evaluaciones independientes para esta variante fine-tuneada. Se recomienda realizar evaluaciones propias en tareas de ciberseguridad y codigo antes de su uso en produccion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en BF16, el modelo requiere aproximadamente 55 GB de VRAM solo para los pesos (27,36 mil millones de parametros × 2 bytes). Con overhead de activaciones y cache KV, se recomienda al menos 60-70 GB. Con cuantizacion a 8 bits, unos 28-30 GB; con 4 bits, unos 14-16 GB, aunque no se proporcionan cuantizaciones oficiales.
- **GPU recomendadas**: NVIDIA H100, A100 80GB, o GPUs consumer de gama alta como RTX 4090 (24 GB) solo con cuantizacion 4-bit u 8-bit. Para BF16 completo se necesitan GPUs de datacenter.
- **Compatibilidad con consumer GPU**: si, con cuantizacion. Una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo en 4-bit, aunque con menor calidad de salida.
- **Opciones de despliegue**: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, dado que es un modelo estandar de la familia Qwen3.8. El formato Safetensors BF16 es directamente cargable en estos frameworks.
- **Latencia y throughput**: no se proporcionan datos especificos. Como referencia, un modelo de 27B en BF16 en una H100 suele generar entre 20 y 40 tokens por segundo con batch pequeno, dependiendo de la implementacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwenseek-3.8-27B-CyberLite (este) | 27,36B | 32K (validado) | Apache-2.0 | Ciberseguridad defensiva + codigo + agentes |
| Qwen3.8-27B (base) | ~27,8B | 262K | Apache-2.0 | Multimodal generalista, codigo, razonamiento |
| Qwen3.8-27B-FP8 (cuantizacion oficial) | ~27,8B | 262K | Apache-2.0 | Igual que el base, en FP8 |

No se dispone de informacion sobre otros modelos de ciberseguridad comparables en el mismo rango de parametros. La principal diferencia con el modelo base es la especializacion en seguridad y el contexto reducido a 32K (aunque el base soporta 262K, el fine-tune solo fue validado a 32K). El modelo base mantiene capacidades multimodales que este fine-tune ha congelado.

## Limitaciones y advertencias

- **Vision congelada**: aunque la arquitectura base es multimodal, los parametros de vision no fueron entrenados. El modelo no debe usarse para tareas que requieran comprension de imagenes o video.
- **Contexto limitado en la practica**: aunque el modelo base soporta 262K tokens, el fine-tune solo fue validado a 32K. Usar contextos mayores puede degradar la calidad de las respuestas.
- **Idioma principal**: el entrenamiento esta orientado al ingles. Aunque la metadata incluye ruso, chino, japones, kazajo y vietnamita, el rendimiento en estos idiomas no esta garantizado y puede ser inferior al del ingles.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar informacion falsa o inventar vulnerabilidades inexistentes. Las recomendaciones de seguridad deben verificarse siempre con herramientas externas.
- **Uso de red team**: las capacidades de ataque controlado solo deben emplearse en entornos autorizados, locales, sandbox o educativos. El modelo card no implica autorizacion para probar sistemas de terceros.
- **Sin refuerzo agéntico**: el autor indica que la fase de reinforcement learning para ejecucion de largo horizonte aun no se ha realizado. El modelo puede fallar en tareas agénticas complejas que requieran planificacion extendida.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe verificar que los datasets de entrenamiento no tengan restricciones adicionales. No se mencionan restricciones especificas en la informacion disponible.
- **Repack NOESIS**: este repositorio es un reempaquetado de 35 shards realizado por AMAImedia. Se recomienda verificar la integridad de los pesos comparando hashes con el repositorio original de trjxter.

## Enlaces

- [Repositorio HuggingFace del modelo (AMAImedia)](https://huggingface.co/AMAImedia/Qwen3.8-27B-Qwenseek-CyberLite-NOESIS-BF16)
- [Modelo base original (trjxter)](https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-BF16)
- [Modelo base Qwen3.8-27B (unsloth)](https://huggingface.co/unsloth/Qwen3.8-27B)
- [Modelo Qwen3.8-27B oficial (Qwen)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset de destilacion DeepSeek V4 Flash](https://huggingface.co/datasets/trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x)
- [Dataset de razonamiento DeepSeek V4 Pro](https://huggingface.co/datasets/trjxter/DeepSeek-V4-Pro-Reasoning-8000x)
- [Pagina de Qwen3.8-27B en NVIDIA NGC](https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/-/file-browser)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Articulo sobre Qwen3.8 27B (unifically)](https://unifically.com/blogs/qwen-3.8-27b)
