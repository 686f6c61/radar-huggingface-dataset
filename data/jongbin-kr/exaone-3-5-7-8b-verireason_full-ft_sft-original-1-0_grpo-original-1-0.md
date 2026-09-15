# Jongbin-kr/exaone-3.5-7.8b-verireason_full-ft_sft-original-1.0_grpo-original-1.0

## Resumen

Este repositorio contiene un ajuste fino del modelo EXAONE 3.5 7.8B, desarrollado originalmente por LG AI Research, y publicado por el usuario de HuggingFace Jongbin-kr. El checkpoint tiene 7.818.448.896 parametros reales (confirmados en los safetensors) y ocupa 46,9 GB en el repositorio, un tamano muy superior a los ~15,7 GB que requeriria una unica copia de los pesos en bf16, lo que sugiere que el repositorio almacena varias copias o versiones de los pesos. El identificador del repositorio (`...full-ft_sft-original-1.0_grpo-original-1.0`) sugiere una cadena de entrenamiento en tres etapas: ajuste fino completo (full fine-tuning), ajuste supervisado (SFT) y optimizacion con GRPO, presumiblemente orientada a tareas de razonamiento verificable.

El modelo base, EXAONE 3.5 7.8B, es un transformer decoder-only de la familia EXAONE 3.5 de LG AI Research, con una ventana de contexto de 32.768 tokens y optimizado para coreano e ingles. La combinacion de GRPO con recompensas verificables es una tecnica que se ha popularizado para mejorar el razonamiento en modelos de esta escala, de ahi el interes de este checkpoint para investigacion en aprendizaje por refuerzo aplicado a modelos de 7-8B.

La relevancia practica de este repositorio es limitada por su estado: 19 descargas, 0 likes, sin model card, sin licencia declarada y sin datos de benchmarks publicados. Debe tratarse como un artefacto de investigacion no validado, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE 3.5 7.8B de LG AI Research) |
| Parametros totales | 7.818.448.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base); no confirmado en este checkpoint |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors, presumiblemente bf16/fp32); convertible a GGUF/AWQ/GPTQ por el usuario |
| Idiomas soportados | no declarados en el repositorio; el modelo base EXAONE 3.5 esta optimizado para coreano e ingles |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo la licencia EXAONE AI Model License 1.1 - NC (uso no comercial) |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

Nota: los datos marcados como "modelo base" proceden de la documentacion publica de EXAONE 3.5 7.8B (LG AI Research) y no han podido verificarse contra una model card de este repositorio concreto, que no existe.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only con las siguientes caracteristicas conocidas del modelo base: 32 capas, dimension oculta de 4096, 32 cabezas de atencion con 8 cabezas KV (Grouped Query Attention), normalizacion RMSNorm, activacion SwiGLU, RoPE y un vocabulario de 102.400 tokens. El tag `custom_code` indica que el checkpoint no puede cargarse con clases estandar de Transformers y que requiere ejecutar codigo remoto del repositorio, una practica con implicaciones de seguridad que conviene revisar antes de cargar el modelo en entornos sensibles.

Sobre el proceso de ajuste especifico de este checkpoint, la informacion disponible se limita al nombre del repositorio y a los tags. El identificador sugiere una secuencia de full fine-tuning, seguida de una etapa SFT etiquetada como `original-1.0` y una etapa final de GRPO (Group Relative Policy Optimization) etiquetada tambien como `original-1.0`, dentro de un flujo denominado "verireason". No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa utilizada en GRPO, hiperparametros ni si se aplico algun tipo de destilacion. Tampoco hay informacion sobre la composicion del dataset de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno en la ventana de contexto del modelo base (32.768 tokens, no verificada en este checkpoint).
- Razonamiento y resolucion de problemas, presumiblemente reforzado por la etapa de GRPO, aunque no hay evaluaciones publicadas que lo confirmen.
- Capacidades multilingues limitadas a las del modelo base: coreano e ingles como idiomas principales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el nombre "verireason" sugiere un enfoque en razonamiento verificable, pero no hay documentacion que lo respalde.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el checkpoint permite reproducir y analizar el efecto de GRPO sobre un modelo de 7,8B partiendo de un SFT, comparando la etapa `sft-original-1.0` con la etapa `grpo-original-1.0` para medir la ganancia atribuible al refuerzo.
- Generacion de datos sinteticos de razonamiento: uso como generador de cadenas de razonamiento para destilar conocimiento hacia modelos mas pequenos, siempre que la licencia del modelo base lo permita.
- Experimentos de verificacion de respuestas: el nombre del repositorio apunta a un flujo de razonamiento verificado, aprovechable en tareas de matemáticas y logica donde se pueda comprobar automaticamente el resultado final.
- Asistente bilingue coreano-ingles en investigacion: prototipos de chat que requieran alternar entre ambos idiomas con contexto largo, en entornos de laboratorio y sin exposicion comercial.
- Evaluacion comparativa de pipelines de post-entrenamiento: usar este checkpoint como referencia frente a otros ajustes del mismo modelo base para estudiar que combinacion de SFT y GRPO generaliza mejor.
- Analisis de robustez y alucinacion: al ser un ajuste sin model card ni evaluaciones, resulta un candidato util para estudiar como el post-entrenamiento agresivo afecta a la fidelidad factual y a la tasa de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, tabla de evaluacion ni comparaciones con otros modelos, y no se dispone de mediciones propias del checkpoint ajustado.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 18 y 22 GB.
- Cache KV a contexto completo: con 32 capas, 8 cabezas KV y dimension de cabeza 128, la cache en fp16 ocupa unos 128 KiB por token, es decir, alrededor de 4 GiB para 32.768 tokens. Esto condiciona el despliegue a contexto largo.
- VRAM en 8 bits: aproximadamente 8-9 GB de pesos, mas cache KV.
- VRAM en 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5 GB de pesos, apto para GPU de consumo con contexto reducido.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 con contexto largo. En consumo, RTX 3090 o RTX 4090 (24 GB) pueden ejecutar el modelo en bf16 con contexto moderado; tarjetas de 16 GB como la RTX 4060 Ti solo son viables en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es el camino mas directo dado el tag `custom_code`. vLLM ofrece soporte para la familia EXAONE, aunque conviene verificar compatibilidad con este checkpoint concreto. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, que puede requerir adaptar el codigo personalizado del repositorio.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, de la cuantizacion y de la implementacion de atencion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|
| EXAONE 3.5 7.8B verireason (este repositorio) | 7,82B | 32K (modelo base) | no declarada; base no comercial | coreano, ingles | ajuste de investigacion, sin benchmarks |
| Qwen2.5 7B Instruct | 7,6B | 32K nativo, 128K con YaRN | Apache 2.0 | 29 idiomas | modelo oficial con benchmarks publicados |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | 8 idiomas | modelo oficial con benchmarks publicados |
| Gemma 2 9B IT | 9,24B | 8K | Gemma Terms of Use | principalmente ingles | modelo oficial con benchmarks publicados |

La comparativa es estructural: frente a las alternativas, este checkpoint parte de una ventana de contexto intermedia (32K) y de un soporte idiomatico centrado en coreano e ingles, mientras que sus competidores directos ofrecen contextos mayores o licencias permisivas para uso comercial. No existen datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, hiperparametros, funcion de recompensa ni evaluacion, lo que impide auditar el comportamiento del modelo.
- Licencia no declarada en el repositorio. El modelo base EXAONE 3.5 7.8B se publica bajo una licencia no comercial, por lo que el uso comercial de este derivado es, como minimo, dudoso y requiere verificacion legal expresa.
- Riesgo elevado de alucinacion no caracterizado: al no existir evaluaciones de fidelidad factual, no puede acotarse la tasa de error en tareas de conocimiento.
- Sesgos desconocidos: no se ha publicado informacion sobre composicion del dataset ni sobre mitigaciones de sesgo. Los sesgos del modelo base en coreano e ingles se heredan y pueden haberse amplificado con el post-entrenamiento.
- Idiomas limitados: fuera del coreano y el ingles, el rendimiento esperado es bajo, y el castellano no esta soportado de forma declarada.
- Riesgo de seguridad del codigo remoto: el tag `custom_code` obliga a ejecutar codigo del repositorio al cargar el modelo con Transformers, lo que supone un vector de ataque si el repositorio no es de confianza. Se recomienda auditar el codigo o cargar los pesos con una implementacion propia.
- Repositorio sobredimensionado: 46,9 GB para 7,82B parametros implica almacenamiento redundante, lo que complica la descarga y el versionado.
- Adopcion practicamente nula: 19 descargas y 0 likes indican que el checkpoint no ha sido validado por la comunidad.
- Fechas de creacion y actualizacion (15 de septiembre de 2026) posteriores al conocimiento de referencia de este analisis; conviene confirmar la procedencia del repositorio.
- No apto para produccion en su estado actual: sin evaluaciones, sin licencia clara y con codigo personalizado, solo deberia usarse en entornos de investigacion controlados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Jongbin-kr/exaone-3.5-7.8b-verireason_full-ft_sft-original-1.0_grpo-original-1.0
- Modelo base EXAONE 3.5 7.8B (LG AI Research): https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Informe tecnico de EXAONE 3.5: no se ha encontrado en la informacion proporcionada.
