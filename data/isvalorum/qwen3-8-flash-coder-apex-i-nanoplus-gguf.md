# IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF

## Resumen

Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF es una cuantización GGUF publicada por el usuario IsValorum (distribuidor independiente, no el autor del modelo base) a partir de Jab1718/qwen3.8-flash-coder-85gb-bf16. Se trata de un recorte experimental de un modelo MoE de gran tamano orientado exclusivamente a código en inglés: el autor del modelo base eliminó permanentemente 352 de los 512 expertos enrutados mediante la herramienta moe-slice, calibrando contra datasets de Python en inglés y SWE-bench, lo que deja una configuración final de 160 expertos (10 activos por token). El resultado es una especialización agresiva en programación y agentic coding, con degradación severa en conversación general y en cualquier idioma distinto del inglés.

La aportación concreta de esta ficha es la cuantización: un único archivo GGUF de 18,34 GB (17,08 GiB) con 2,90 BPW, etiquetado como APEX-I-NanoPlus, que según el autor alcanza calidad de "Q4_K_M sólido" y permite ejecutar el modelo en GPUs de consumo de 16 a 24 GB de VRAM apoyándose en streaming desde RAM del sistema. El mapa de cuantización es quirúrgico, no plano: la cabeza de salida (`output.weight`) se mantiene en Q6_K, los embeddings en Q3_K y las 146 capas de normalización en F32.

Es relevante ahora porque ocupa un nicho muy concreto: modelo MoE de ~42-45,8B de parámetros totales con contexto nativo de 256K tokens (262.144) que cabe en una GPU de gama alta de consumo gracias a un presupuesto de bits extremadamente bajo (2,90 BPW). El precio es explícito: pérdida de perplejidad de +14,36 % frente a la referencia BF16, inglés exclusivamente, incompatibilidad con Strata Engine y dependencia de `llama.cpp` estándar o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForCausalLM`, 48 capas híbridas, MoE con 160 expertos enrutados y 10 activos por token + 1 experto compartido + backbone denso |
| Parametros totales | 45,8B según la model card del autor; 42.620.341.120 (~42,6B) según los metadatos safetensors de HuggingFace. Discrepancia no aclarada por el autor |
| Parametros activos | ~3,7B por token (10 expertos enrutados + 1 compartido + backbone denso); ~4,9B si se incluyen los embeddings de vocabulario |
| Longitud de contexto | 262.144 tokens (256K nativos) |
| Tipos de cuantizacion | GGUF único APEX-I-NanoPlus a 2,90 BPW. Mapa por tensor: `output.weight` en Q6_K, `token_embd.weight` en Q3_K, 146 tensores de normalización (`output_norm`, `attn_norm`, `ffn_norm`, `hc_norm`, `ssm_norm`) en F32. Calibrado con imatrix |
| Idiomas soportados | Inglés (`en`) únicamente. El autor advierte de degradación severa y texto roto en otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). Archivo único `Qwen3.8-Flash-Coder-85GB.APEX-I-NanoPlus.gguf` |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen4ExpForCausalLM`, una variante MoE de tipo transformer con 48 capas descritas como híbridas (el mapa de tensores incluye componentes `ssm_norm`, lo que sugiere presencia de capas de espacio de estados junto a la atención, aunque la model card no detalla la proporción ni el mecanismo exacto). La configuración final tiene 160 expertos enrutados con 10 activos por token, más un experto compartido y un backbone denso. La vocabulario es de aproximadamente 248.000 tokens.

No hubo entrenamiento desde cero en esta ficha: el modelo base ya es un recorte experimental (`moe-slice`) sobre un modelo mayor, en el que se podaron permanentemente 352 de 512 expertos enrutados usando exclusivamente datasets de calibración de Python en inglés y SWE-bench. El autor del modelo base no ha publicado todavía la pasada de fine-tuning de recuperación, de ahí el aviso de pre-release experimental. Sobre ese recorte, IsValorum aplicó una cuantización GGUF selectiva por tensor (no uniforme) asistida por imatrix, descrita en la model card como "surgical tensor quantization map", auditada directamente desde el GGUF resultante. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset original ni si hubo RLHF o DPO.

## Capacidades

- Generación de código en inglés: completado, refactorización y escritura de programas, con foco declarado en Python.
- Razonamiento y modo thinking: el índice de la model card menciona una sección de "Hardened Agentic Chat Template & Reasoning Effort", lo que indica soporte de plantilla de chat específica con control del esfuerzo de razonamiento. El contenido detallado de esa sección no está incluido en la información disponible.
- Agentic coding y tool calling: el modelo está etiquetado como `agentic-coding` y calibrado contra SWE-bench, orientado a flujos de agente con llamada a herramientas.
- Capacidades conversacionales: la etiqueta `conversational` aparece en los metadatos, pero el autor advierte que el chat general está degradado por la poda de expertos conversacionales.
- Capacidades multilingües: no disponibles. Inglés exclusivamente, con salida rota en español, francés, alemán y otros idiomas según el aviso del autor.
- Capacidades especiales: contexto de 256K tokens, compatibilidad con endpoints (`endpoints_compatible`), y uso de tablas n-gram desacopladas en el layout de 160 expertos.
- Vision y audio: no disponibles.

## Casos de uso

- Generación de código en producción sobre GPU de consumo: el archivo de 18,34 GB con 2,90 BPW permite cargar el modelo en una RTX 4090 (24 GB) o en GPUs de 16 GB con streaming desde RAM del sistema, habilitando autocompletado y generación de funciones en entornos donde no hay presupuesto para clústeres de inferencia.
- Agente de resolución de issues tipo SWE-bench: el modelo fue calibrado explícitamente contra SWE-bench y está etiquetado como agentic coding, por lo que es adecuado para pipelines que leen un repositorio, localizan el fallo, editan archivos y ejecutan tests mediante tool calling.
- Refactorización de bases de código Python en inglés: con 256K tokens de contexto se pueden pasar módulos completos o varios archivos relacionados en una sola pasada, evitando la fragmentación típica de modelos con ventanas de 8K-32K.
- Asistente de código dentro de un IDE en local: desplegado con `llama-server` o LM Studio, sin envío de código propietario a APIs externas, lo que simplifica el cumplimiento de políticas internas de datos.
- Integración en pipelines de CI/CD para revisión automática de pull requests: el soporte de tool calling y la plantilla de chat para agentes permiten invocar linters, ejecutar tests y proponer parches de forma automática en inglés.
- Extracción y transformación de código legado: tareas de traducción de código Python antiguo a estructuras modernas, generación de documentación técnica en inglés y anotación de tipos, donde el modelo rinde mejor que en tareas conversacionales genéricas.
- Evaluación comparativa de cuantizaciones extremas: dado que el autor publica la perplejidad WikiText-2 de cada variante, este GGUF sirve como banco de pruebas para medir el suelo práctico de bits por peso (2,90 BPW) antes de que el razonamiento se rompa.

## Benchmarks y rendimiento

La información disponible solo incluye perplejidad de WikiText-2 y comparaciones de tamaño. No se han publicado resultados de MMLU, HumanEval, GSM8K, SWE-bench ni otros benchmarks en la información disponible.

| Especificación | Tamano en disco | Huella en memoria | BPW | Perplejidad WikiText-2 | Delta PPL vs BF16 | Nivel de calidad |
|---|---|---|---|---|---|---|
| BF16 sin comprimir (referencia) | 85,30 GB (79,44 GiB) | 79,44 GiB | 16,00 | 30,0975 ± 0,1200 | Base (0,00 %) | Referencia sin pérdida |
| APEX-I-MiniPlus V2.1 | 21,77 GB (20,27 GiB) | 20,27 GiB | 3,45 | 30,1495 ± 1,0089 | +0,0520 (+0,17 %) | Frontera Q5_K_L / Q6_K |
| APEX-I-NanoPlus (esta ficha) | 18,34 GB (17,08 GiB) | 17,08 GiB | 2,90 | 34,4199 ± 1,1591 | +4,3224 (+14,36 %) | Q4_K_M sólido |
| Q3_K_S plano estándar | 20,41 GB | 19,01 GiB | 3,10 | aprox. 30,75 – 31,20 | +0,65 a +1,10 (+2,9 %) | Degradación de sintaxis alta |
| APEX Mini genérico (IQ2_S) | 17,73 GB | 16,51 GiB | 2,50 | aprox. 31,60 – 33,10+ | +1,50 a +3,00+ (+7,5 %) | Ruptura severa del razonamiento |

Nota: los valores marcados como "aproximados" son estimaciones del propio autor de la cuantización, no mediciones publicadas con intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,08 GiB de huella declarada por el autor. Con overhead de contexto KV y buffers de `llama.cpp`, un presupuesto práctico de 18-20 GB de VRAM es realista para contextos moderados; con contexto cercano a los 256K tokens la caché KV crece y exige offload a RAM.
- Objetivo declarado por el autor: "Massive Context on 16GB–24GB VRAM" con streaming rápido desde RAM del sistema.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) para carga completa; GPUs de 16 GB (por ejemplo, RTX 4080) solo con streaming parcial desde RAM. Para el modelo BF16 de referencia se necesitarían 79,44 GiB, es decir, A100 80GB o H100 80GB, fuera del alcance de consumo.
- Cabe en GPU de consumo: sí, en el rango de 16 a 24 GB de VRAM según el propio autor, con la salvedad del streaming desde RAM cuando el contexto es largo.
- Opciones de despliegue: `llama.cpp` estándar (`llama-server`) y LM Studio. No es compatible con Strata Engine, que requiere el monolito de 512 expertos y las tablas PLE de 51B.
- Latencia y throughput estimados: no disponibles. No se publican tokens por segundo ni latencias medidas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la información proporcionada. La comparación posible se limita a las variantes de la misma familia publicadas por el mismo autor:

| Modelo | Parametros | Contexto | BPW / tamano | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| APEX-I-NanoPlus (esta ficha) | 45,8B totales / ~3,7B activos (42,6B según safetensors) | 262.144 | 2,90 BPW / 18,34 GB | 34,4199 ± 1,1591 | apache-2.0 | GGUF en HuggingFace |
| APEX-I-MiniPlus V2.1 | Mismo modelo base | 262.144 | 3,45 BPW / 21,77 GB | 30,1495 ± 1,0089 | apache-2.0 | GGUF en HuggingFace |
| BF16 de referencia | Mismo modelo base | 262.144 | 16,00 BPW / 85,30 GB | 30,0975 ± 0,1200 | apache-2.0 | GGUF en HuggingFace |
| Modelo base Jab1718/qwen3.8-flash-coder-85gb-bf16 | Mismo modelo base, sin cuantizar por IsValorum | 262.144 | BF16 | No disponible en esta información | No disponible en esta información | HuggingFace |

## Limitaciones y advertencias

- Pre-release experimental: el modelo base es un recorte intermedio y el autor del mismo no ha publicado la pasada de fine-tuning de recuperación. No debe tratarse como un modelo estable de producción sin validación propia.
- Inglés exclusivamente: el autor advierte explícitamente de degradación severa y salida de texto roto en español, francés, alemán y otros idiomas, así como en conversación general. Un caso de uso en castellano con este modelo no es viable.
- Poda de expertos irreversible: se eliminaron 352 de 512 expertos enrutados contra datasets de Python en inglés y SWE-bench, lo que sesga el modelo hacia ese dominio y degrada el conocimiento general.
- Pérdida de calidad medible: +14,36 % de perplejidad WikiText-2 frente a la referencia BF16, con un intervalo de confianza de ±1,1591 que indica alta varianza en la medición. No hay benchmarks de código publicados que confirmen si la degradación afecta a la tasa de resolución de tareas reales.
- Riesgo de alucinación: no cuantificado en la información disponible. En cuantizaciones de 2,90 BPW es esperable un incremento de errores sintácticos y de invención de APIs, pero no hay medición publicada.
- Advertencia de sintaxis y repeat penalty: la model card incluye una sección crítica sobre penalización de repetición para evitar el intercambio de caracteres. No se ha incluido el contenido detallado en la información disponible, pero implica que la configuración de muestreo debe ajustarse con cuidado.
- Incompatibilidad de runtime: no funciona con Strata Engine. Requiere `llama.cpp` estándar (`llama-server`) o LM Studio.
- Discrepancia de parámetros: la model card declara 45,8B totales y los metadatos safetensors de HuggingFace indican 42,62B. Conviene verificar el recuento real antes de dimensionar hardware.
- Licencia: apache-2.0, que permite uso comercial, pero la licencia del modelo base (`Jab1718/qwen3.8-flash-coder-85gb-bf16`) no está confirmada en la información disponible y podría imponer condiciones adicionales.
- Adopción muy baja: 802 descargas y 1 like en el momento de la consulta, con fecha de creación del 5 de octubre de 2026 y última actualización del 8 de octubre de 2026. No hay validación independiente de la comunidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Variante APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- Variante BF16 sin comprimir (referencia): https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Apoyo al autor de la cuantización: https://ko-fi.com/isvalorum
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y han sido descartados.
