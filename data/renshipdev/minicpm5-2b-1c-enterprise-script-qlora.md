# RenShiPDev/MiniCPM5-2B-1c-enterprise-script-QLora

## Resumen

MiniCPM5-2B-1c-enterprise-script-QLora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo denso openbmb/MiniCPM5-2B, publicado por el usuario RenShiPDev. Su objetivo es el ajuste de dominio hacia el lenguaje de script de 1C:Enterprise (ficheros `.bsl` / `.os`), un dialecto propietario con palabras clave en ruso y un ecosistema muy específico de ERP y gestión empresarial. No se trata de un modelo nuevo ni de una mejora general del base: es un checkpoint de adaptación de dominio que desplaza la distribución del modelo hacia código 1C a cambio de degradar su generación de código Python.

El adaptador se entrena sobre el corpus público NickIBrody/1c-enterprise-script-clean-corpus (split `sft_strict`, 7.100 filas de entrenamiento y 441 de validación, 39,87 M de tokens de entrada en 2 épocas). Se trata de un LoRA estándar de PEFT con r=16, alpha=32 y escalado rsLoRA, aplicado sobre las siete proyecciones de atención y MLP, con la base cuantizada a 4 bits durante el entrenamiento y cómputo en bfloat16. El adaptador es cargable tanto sobre la base cuantizada como sobre la base en precisión completa.

Su relevancia es doble. Por un lado, es un ejemplo poco habitual de ficha transparente: el autor publica la comparativa base vs. LoRA en lm-evaluation-harness y admite explícitamente que ningún benchmark mide la capacidad objetivo (1C). Por otro, documenta un compromiso medible: la retención de conocimiento general se mantiene prácticamente plana (BoolQ +0,76 pp, ARC-Easy −0,04 pp), mientras que HumanEval cae 9,76 pp y MBPP 7,20 pp. Es, por tanto, material útil para estudiar dinámicas de ajuste de dominio en modelos pequeños, no un asistente de producción para 1C.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso MiniCPM5-2B, arquitectura tipo Llama |
| Parametros totales | Base: 2,52 B; adaptador: no disponible (r=16 sobre q/k/v/o/gate/up/down) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Base: 131.000 tokens; entrenamiento del adaptador: 4.096 tokens |
| Tipos de cuantizacion | Base cuantizada a 4 bits durante el entrenamiento (QLoRA); adaptador en safetensors bf16; cuantizaciones GGUF del base no verificadas en esta ficha |
| Idiomas soportados | ru, en (declarados); el material de entrenamiento es código 1C con palabras clave en ruso |
| Licencia | no disponible para el adaptador; el modelo base openbmb/MiniCPM5-2B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se inserta en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer denso de 2,52 B, con rango r=16, alpha=32, dropout 0,05 y escalado rsLoRA (alpha/√r). El entrenamiento se realizó con QLoRA: base en 4 bits, cómputo en bfloat16, optimizador AdamW de 8 bits, learning rate 2e-4 con schedule lineal y 20 pasos de warmup, weight decay 0,001, clipping 1,0, batch efectivo de 16 (2 por dispositivo × 8 de acumulación), seed 3407 y gradient checkpointing activado. Se usó supervisión únicamente sobre las completions (Unsloth `train_on_completions`), enmascarando los tokens del prompt, con `packing` desactivado y `padding_free` activado. El stack fue Unsloth + PEFT 0.18.1 + TRL 0.23.1 + Transformers 5.5.0 + PyTorch 2.10.0+cu130.

El dataset es el split `sft_strict` de NickIBrody/1c-enterprise-script-clean-corpus, en formato chat (`system` / `user` / `assistant`), con 7.100 filas de entrenamiento y 441 de validación. Se dieron 2 épocas y 870 pasos, con 39,87 M de tokens de entrada, en una única RTX 3050 con 7,66 GiB de VRAM útiles; el entrenamiento se repartió en varias sesiones reanudadas desde el último checkpoint (guardado cada 30 pasos). La pérdida de entrenamiento bajó de 0,62 a 0,22 y la de validación se situó en 0,274. No se documenta ninguna innovación arquitectónica adicional más allá del ajuste de dominio: no hay decodificación especulativa ni atención lineal propia del adaptador.

## Capacidades

- Generación de código en lenguaje de script de 1C:Enterprise (`.bsl`, `.os`), con sintaxis y palabras clave en ruso, tras el ajuste de dominio.
- Generación de texto y conversación en formato chat (`system` / `user` / `assistant`), heredadas del modelo base.
- Razonamiento y conocimiento general preservados: el autor reporta deriva mínima en BoolQ, ARC-Easy, Winogrande, HellaSwag y PIQA.
- Generación de código Python funcional, aunque degradada respecto al base (HumanEval −9,76 pp, MBPP −7,20 pp).
- Capacidad de seguir instrucciones y completar código dentro de una ventana de 4.096 tokens en las condiciones de entrenamiento; el base soporta hasta 131.000 tokens.
- Soporte multilingüe limitado a ru y en según los metadatos; no se declaran otros idiomas.
- Tool calling y uso de agentes: el modelo base MiniCPM5-2B está orientado a agentes locales y tool use según su documentación, pero el adaptador no aporta ni verifica estas capacidades.
- No se documentan capacidades de visión, audio ni modo "thinking" específicas para este adaptador.

## Casos de uso

- Autocompletado de código 1C en el editor: el adaptador puede integrarse detrás de un servidor de inferencia para sugerir continuaciones de módulos `.bsl` en proyectos de ERP, aprovechando que el corpus de entrenamiento proviene de repositorios reales de 1C.
- Migración y refactorización de código legado: usar el modelo para proponer reescrituras de procedimientos y funciones de 1C, con revisión humana obligatoria, en proyectos de actualización de plataforma.
- Generación de documentación técnica: producir comentarios y descripciones de módulos y procedimientos en ruso a partir del código fuente, una tarea de bajo riesgo donde los errores se detectan con revisión.
- Asistencia interna para desarrolladores 1C: chatbot de consulta sobre patrones de código y estructuras habituales del lenguaje, desplegado en local para evitar enviar código propietario a APIs externas.
- Investigación sobre ajuste de dominio: caso de estudio reproducible de QLoRA en hardware de consumo (una RTX 3050) con tabla de retención publicada, útil para estudiar olvido catastrófico en modelos de 2-3 B.
- Generación de datos sintéticos de 1C para aumentar corpus: el adaptador puede producir borradores de código que luego se filtran y validan manualmente antes de incorporarse a un dataset mayor.
- Evaluación de pipelines de catálogo de modelos: al ser un adaptador PEFT pequeño (repo de 0,1 GB) sirve para probar flujos de carga de adaptadores, merge con la base y conversión a GGUF antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness`, splits completos, decodificación greedy, 0-shot salvo MBPP (3-shot). Δ = LoRA − Base en puntos porcentuales.

| Benchmark | Base | LoRA | Δ |
|---|---:|---:|---:|
| BoolQ | 82,35 % | 83,12 % | +0,76 |
| ARC Easy | 75,63 % | 75,59 % | −0,04 |
| Winogrande | 61,64 % | 61,25 % | −0,39 |
| HellaSwag | 45,47 % | 44,52 % | −0,95 |
| PIQA | 72,25 % | 70,24 % | −2,01 |
| MBPP | 51,60 % | 44,40 % | −7,20 |
| HumanEval | 68,29 % | 58,54 % | −9,76 |

Advertencias del propio autor que conviene reproducir: ninguna tarea de este conjunto evalúa 1C:Enterprise Script, por lo que la tabla mide retención de capacidad general, no la capacidad objetivo. El corpus de entrenamiento procede de repositorios públicos de 1C, por lo que puede existir solapamiento parcial con otros corpus públicos. Se entrenó una sola semilla (3407) y una sola ejecución, de modo que diferencias de ±1 pp no son estadísticamente significativas con estos tamaños de muestra. Los ficheros de resultados por tarea están en el directorio `benchmarks/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en bf16 ocupa del orden de decenas de MB; los pesos del base suponen aproximadamente 5 GB en bf16 y alrededor de 1,5-1,8 GB en cuantización de 4 bits (estimación a partir de 2,52 B de parámetros, sin contar caché KV).
- GPU recomendadas: cualquier GPU con 6-8 GB basta para el base en bf16 con contexto moderado; para 4 bits y decodificación de código en local, una RTX 3060/4060 Ti de 8-12 GB es suficiente. Para servir varias peticiones concurrentes con contexto largo conviene una A10G, L4, A100 o H100.
- Cabe en GPU de consumo: sí. El propio entrenamiento se hizo en una RTX 3050 de 7,66 GiB de VRAM utilizables, con batch 2 y acumulación de gradiente; la inferencia del adaptador es viable en GPUs de gama media.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador directamente; vLLM o TGI admiten adaptadores LoRA, aunque conviene verificar la compatibilidad con la arquitectura del base; llama.cpp y Ollama requieren fusionar el adaptador con la base (merge) y convertir el resultado a GGUF, ya que no cargan adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para este adaptador.
- Nota de contexto: la ventana de 4.096 tokens usada en entrenamiento no debe confundirse con los 131.000 tokens del base; usar contextos mucho mayores puede degradar la calidad del comportamiento adaptado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-1c-enterprise-script-QLora | 2,52 B (base) + LoRA r=16 | 131k en base; 4.096 en entrenamiento | Adaptador: no disponible; base Apache 2.0 | Ajuste de dominio a 1C:Enterprise Script; adaptador PEFT de 0,1 GB |
| openbmb/MiniCPM5-2B | 2,52 B densos | 131.000 tokens | Apache 2.0 | Modelo generalista del que deriva; mejor en Python y uso general; referenciado con media de 53,9 en 34 benchmarks por su documentación |
| openbmb/MiniCPM5-1B | 1 B (aprox., según serie MiniCPM5) | no disponible en la información consultada | Apache 2.0 (serie MiniCPM5) | Alternativa más ligera de la misma familia, para despliegue en dispositivo; sin adaptación a 1C |
| Qwen2.5-Coder-1.5B | 1,5 B | no disponible en la información consultada | no disponible en la información consultada | Familia orientada a código con licencia permisiva; no cubre 1C:Enterprise Script |

No se han publicado comparativas directas con otros adaptadores de 1C en la información disponible. La comparación relevante es interna: frente al base, este adaptador gana especialización en 1C y pierde 7-10 pp en generación de código Python.

## Limitaciones y advertencias

- No es un asistente de producción para 1C:Enterprise: el propio autor lo describe como un checkpoint transparente de adaptación de dominio, no como un producto final.
- Degradación medible en código general: HumanEval −9,76 pp y MBPP −7,20 pp. Para tareas de código no relacionadas con 1C debe usarse el modelo base.
- Ausencia de evaluación de la capacidad objetivo: no existe ningún benchmark de 1C en la suite publicada, por lo que la calidad real en `.bsl` debe validarse con código propio del proyecto.
- Una sola semilla y una sola ejecución: los resultados no permiten afirmar significación estadística para diferencias de ±1 pp.
- Posible contaminación parcial: el corpus `sft_strict` se compila a partir de repositorios públicos de 1C, lo que puede solapar con otros corpus de evaluación.
- Licencia del adaptador no declarada en los metadatos de HuggingFace, lo que impide confirmar condiciones de uso comercial. La base es Apache 2.0, pero eso no cubre automáticamente los pesos derivados del adaptador.
- Riesgo de alucinación en APIs de 1C: al ser un modelo de 2,5 B ajustado con 39,87 M de tokens, es probable que invente nombres de métodos, propiedades de metadatos y firmas de plataforma; requiere verificación contra la documentación oficial.
- Contexto efectivo limitado a 4.096 tokens en el ajuste: aunque el base soporte 131k, el comportamiento adaptado en ventanas largas no está garantizado.
- Idioma: el soporte declarado es ru/en; el código 1C usa palabras clave en ruso, por lo que las explicaciones o comentarios en castellano no están cubiertos por el entrenamiento.
- Condiciones de entrenamiento de bajo recurso: batch 2 sin packing y contextos mezclados de longitudes distintas pueden introducir ruido en el ajuste.
- Formato de despliegue: al ser un adaptador PEFT, no funciona de forma autónoma; necesita el base y un proceso de merge o carga de adaptador, lo que complica su uso en Ollama o llama.cpp sin pasos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RenShiPDev/MiniCPM5-2B-1c-enterprise-script-QLora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/NickIBrody/1c-enterprise-script-clean-corpus
- Repositorio oficial de la familia MiniCPM: https://github.com/OpenBMB/MiniCPM
- Análisis de MiniCPM5-2B para agentes locales: https://www.aimadetools.com/blog/minicpm5-2b-local-ai/
- Anuncio de MiniCPM5-2B (MarkTechPost): https://www.marktechpost.com/2026/09/07/openbmb-releases-minicpm5-2b-a-2-52b-dense-model-averaging-53-9-across-34-benchmarks-and-built-to-run-on-device/
- Ficha de MiniCPM5-2B en The Applied: https://theapplied.co/models/openbmb-minicpm5-2b
- Análisis de rendimiento de MiniCPM5-2B: https://blog.buildfastwithai.com/minicpm5-2b-review
