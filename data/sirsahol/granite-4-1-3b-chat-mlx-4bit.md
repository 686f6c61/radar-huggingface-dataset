# SirSahOl/granite-4.1-3b-chat-mlx-4bit

## Resumen

Granite-4.1-3b-chat-mlx-4bit es una conversión comunitaria a 4 bits en formato MLX del modelo ibm-granite/granite-4.1-3b de IBM, publicada por el usuario SirSahOl. No se trata de un entrenamiento nuevo, sino de una cuantización del modelo base pensada para ejecutar inferencia nativa sobre la GPU de los chips Apple Silicon (familias M1, M2, M3 y M4) mediante la librería MLX de Apple y su ecosistema mlx-lm.

El modelo conserva la arquitectura GraniteForCausalLM del original, con aproximadamente 3.402 millones de parámetros en total y una ventana de contexto declarada de 131.072 tokens. La cuantización aplicada es de 4 bits con una media de 4,50 bits por peso, lo que reduce la huella de memoria activa a unos 2 GB y el repositorio a 1,9 GB, permitiendo ejecutarlo en equipos con 8 GB de memoria unificada.

Su relevancia es práctica: cubre el hueco de inferencia local eficiente en macOS dentro del ecosistema Granite 4.1, que de otro modo requeriría pesos en precisión completa o conversiones a GGUF. La contrapartida es que es un artefacto de la comunidad con adopción muy baja (8 descargas y 0 likes en el momento del análisis) y sin resultados de evaluación publicados, por lo que debe tratarse con cautela antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer decoder-only denso) |
| Parametros totales | 3.402.836.480 (~3,0 B), segun safetensors |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4-bit MLX (media de 4,50 bits por peso); el mismo autor publica variantes de 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx / mlx-lm) |
| Modelo base | ibm-granite/granite-4.1-3b |
| Relacion con el modelo base | quantized |
| Autor de la conversion | SirSahOl (conversion no oficial de la comunidad) |
| Tamano del repositorio | 1,9 GB |
| Huella de VRAM activa | ~2,0 GB; minimo recomendado 8 GB de memoria unificada |
| Descargas / likes | 8 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original: no se indican el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Lo unico documentado es la arquitectura de destino, GraniteForCausalLM, que corresponde a un transformer decoder-only denso, y el hecho de que esta ficha es una conversion cuantizada del checkpoint ibm-granite/granite-4.1-3b, no un modelo entrenado desde cero.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion: pesos a 4 bits con una media de 4,50 bits por peso, empaquetados en safetensors y ejecutables con MLX sobre la GPU unificada de Apple Silicon. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni variantes hibridas. El autor tampoco detalla la calibracion del proceso de cuantizacion ni la perdida de calidad asociada.

La model card incluye una plantilla de chat con los roles delimitados por `<|im_start|>` y `<|im_end|>`, y recomienda configurar tres tokens de parada (`<|im_start|>`, `<|im_end|>` y `<|endoftext|>`) para evitar bucles de generacion en runtimes locales.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de system, user y assistant documentada.
- Conversaciones multi-turno; la model card describe el caso de uso como asistente interactivo.
- Contexto largo de 131.072 tokens, segun la ficha del autor.
- Inferencia local sobre GPU de Apple Silicon mediante MLX y mlx-lm (CLI y API de Python).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y despliegue en Azure (`deploy:azure`) por etiquetas del repositorio.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Modos especiales (thinking, vision, audio): no documentados; las etiquetas solo mencionan `text-generation` y `conversational`.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede mantener dialogos multi-turno aplicando la plantilla de chat documentada, con una huella de 2 GB que deja memoria libre para el resto del sistema en equipos de 8 GB.
- Autocompletado y generacion de codigo en el editor: con una velocidad estimada de 108 tokens/s en chips Pro, es viable como motor de sugerencias en IDE sin salir del portatil.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, sin fragmentacion previa.
- Prototipado rapido de aplicaciones de IA: sirve como backend de bajo coste para validar prompts, plantillas y flujos conversacionales antes de migrar a un modelo mayor o a infraestructura en nube.
- Extraccion por lotes en estaciones de trabajo: en configuraciones Ultra, el autor estima hasta 216 tokens/s, lo que permite procesar volumenes moderados de documentos en local sin enviar datos a terceros.
- Investigacion y docencia sobre cuantizacion: al existir variantes de 4, 8 y 16 bits del mismo modelo base, permite medir experimentalmente la degradacion de calidad por precision en una misma tarea.
- Asistencia offline en entornos con requisitos de privacidad: al ejecutarse enteramente en el dispositivo, es adecuado para flujos donde no se permite el envio de datos a APIs externas.
- Orquestacion de agentes ligeros: la model card sugiere su uso en "agent orchestration" sobre chips Max y Ultra, aunque no documenta soporte explicito de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, pese a que el repositorio incluye la etiqueta `eval-results`.

El unico rendimiento reportado son proyecciones de throughput y tiempo hasta el primer token (TTFT) por tier de hardware, que se recogen en la seccion siguiente. El propio autor advierte que son proyecciones basadas en la saturacion de ancho de banda de memoria, no mediciones, y que la velocidad real varia con la longitud del prompt.

## Requisitos de hardware

Tabla de dimensionamiento publicada por el autor para Apple Silicon (valores estimados, no medidos):

| Tier de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~2,0 GB | ~72 tokens/s | ~47 ms |
| M1 / M2 / M3 / M4 Pro | 18-36 GB | ~2,0 GB | ~108 tokens/s | ~32 ms |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~2,0 GB | ~155 tokens/s | ~20 ms |
| M1 / M2 / M3 Ultra | 64-192 GB | ~2,0 GB | ~216 tokens/s | ~13 ms |

- VRAM estimada para inferencia: ~2,0 GB con pesos a 4 bits; 3,6 GB para la variante de 8 bits y 6,8 GB para la de 16 bits.
- Memoria minima recomendada: 8 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 en sus variantes base, Pro, Max y Ultra). El formato MLX no se ejecuta sobre GPUs NVIDIA o AMD sin una conversion previa a otro formato.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y 8 GB o mas de memoria unificada.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python), integracion en LM Studio y un Modelfile de Ollama documentado por el autor. Para vLLM o TGI seria necesaria una conversion a safetensors estandar o GGUF, que la ficha no cubre.
- Latencia y throughput: solo las proyecciones de la tabla anterior; no hay mediciones reales publicadas.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de otros desarrolladores en la informacion proporcionada. La comparacion mas fiable es entre las propias variantes del autor y el modelo base:

| Modelo | Parametros | Contexto | Precision | Tamano en disco | VRAM | Licencia |
|---|---|---|---|---|---|---|
| SirSahOl/granite-4.1-3b-chat-mlx-4bit | ~3,4 B | 131.072 tokens | 4-bit (4,50 bits/peso) | 1,9 GB | ~2,0 GB | apache-2.0 |
| SirSahOl/granite-4.1-3b-chat-mlx-8bit | ~3,4 B (mismo base) | no disponible en la ficha | 8-bit | ~3,6 GB | ~3,6 GB | apache-2.0 |
| SirSahOl/granite-4.1-3b-chat-mlx-16bit | ~3,4 B (mismo base) | no disponible en la ficha | 16-bit | ~6,8 GB | ~6,8 GB | apache-2.0 |
| ibm-granite/granite-4.1-3b (base) | ~3,4 B | no disponible en la informacion proporcionada | precision original | no disponible | no disponible | apache-2.0 |

La variante de 4 bits prioriza velocidad y bajo consumo de memoria; la de 8 bits busca un equilibrio con razonamiento y precision de codigo superiores, y la de 16 bits se orienta a evaluacion y referencia sin degradacion por cuantizacion.

## Limitaciones y advertencias

- Es una conversion no oficial de la comunidad, no una publicacion de IBM; el mantenimiento y la trazabilidad dependen de un unico autor.
- Adopcion muy baja en el momento del analisis: 8 descargas y 0 likes, lo que implica poca validacion externa en condiciones reales.
- No hay resultados de evaluacion publicados, a pesar de la etiqueta `eval-results`; es imposible cuantificar la degradacion introducida por la cuantizacion a 4 bits frente al modelo base.
- Los datos de velocidad y TTFT son proyecciones del autor, no mediciones, y varian con la longitud del prompt y la carga del sistema.
- No se declara la lista de idiomas soportados; el rendimiento fuera del ingles es una incognita.
- Riesgo de bucles de generacion si no se configuran correctamente los tokens de parada (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`), tal como advierte la propia model card.
- Riesgo de alucinacion inherente a un modelo de 3 B: no se han publicado tasas de hallucination ni evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el compilador de la conversion no ofrece garantias sobre el artefacto derivado.
- Portabilidad limitada: el formato MLX restringe su uso a Apple Silicon; no es ejecutable en infraestructura CUDA sin conversion adicional.
- La model card incluye la etiqueta `arxiv:0000.00000`, un identificador de relleno, lo que sugiere metadatos generados automaticamente y poco fiables.
- El Modelfile de Ollama propuesto apunta directamente al repositorio MLX, pero Ollama requiere pesos GGUF; habria que convertir el modelo para que ese flujo funcione.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-4bit
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Variante de 8 bits del mismo autor: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-8bit
- Variante de 16 bits del mismo autor: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a un portal de juegos en linea y no guardan relacion con la ficha.
