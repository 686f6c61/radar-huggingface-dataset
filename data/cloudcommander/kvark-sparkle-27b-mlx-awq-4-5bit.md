# cloudcommander/Kvark-Sparkle-27B-MLX-AWQ-4.5bit

## Resumen

Kvark-Sparkle-27B-MLX-AWQ-4.5bit es una compilación no oficial para Apple Silicon del modelo Egzakta/Kvark-Sparkle-1.0-27B, un post-entrenamiento de Qwen/Qwen3.8-27B. La publica el usuario cloudcommander bajo licencia Apache 2.0 y combina cuantización AWQ mixta de 4 y 6 bits con el cabezal MTP (multi-token prediction) del modelo original, pensado para decodificación especulativa. El resultado es un checkpoint de 27.781 millones de parámetros (17,9 GB en disco, 4,45 bits por peso) que conserva la torre de visión en BF16 sin cuantizar.

El modelo resuelve dos problemas concretos: reducir el coste de memoria para ejecutar un transformer de 27B en hardware Apple y acelerar la inferencia mediante un modo de razonamiento más conciso que el de Qwen3.8 estándar. Según la model card, el modelo emplea aproximadamente la mitad de tokens de pensamiento que la referencia en las mismas preguntas, lo que se traduce en tiempos de evaluación un tercio menores sin pérdida apreciable de precisión.

Es relevante ahora porque demuestra que las técnicas de cuantización mixta (regla `mixed_4_6` de mlx-vlm) y la decodificación especulativa con drafters entrenados para el modelo base funcionan sobre pesos derivados, manteniendo velocidades de decodificación de unas 193 tok/s en un Mac Studio M5 Ultra. La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 64 capas y tamaño oculto de 5.120.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal, 64 capas, hidden size 5.120) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (según config) |
| Tipos de cuantizacion | AWQ afín, group size 64; mezcla 4/6 bits (456 módulos a 4 bits, 42 a 6 bits, 7 proyecciones MTP a 8 bits); torre de visión en BF16 sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un post-entrenamiento de Qwen/Qwen3.8-27B con arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 64 capas y dimensión oculta de 5.120 que incorpora torre de visión y un cabezal MTP de una capa. Este build concreto no introduce entrenamiento adicional: es una cuantización AWQ con calibración de texto partiendo del checkpoint BF16 de Egzakta, aplicando el predicado `mixed_4_6` de mlx-vlm con group size 64. La torre de visión se deja intacta en BF16 y el cabezal MTP se toma del checkpoint original, con sus normas desplazadas +1.0 para ajustarse a la convención de MLX y sus 7 proyecciones cuantizadas a 8 bits g64.

La innovación técnica principal es la integración del cabezal MTP inline (`mtp.*` en `model-mtp.safetensors`) para habilitar decodificación especulativa. El drafter `z-lab/Qwen3.8-27B-DFlash2`, entrenado sobre Qwen3.8 estándar, sigue siendo compatible con los pesos de Kvark, de modo que la velocidad de decodificación se mantiene igual que en el modelo base. El autor declara verificaciones de que los anchos de bits coinciden con lo declarado, que la torre de visión permanece sin cuantizar, que los 29 tensores MTP están presentes y que las normas coinciden con un build independiente de Qwen3.8 MLX dentro de 0,0004 (excluyendo las 32 normas donde AWQ pliega sus escalas).

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento activable (`--enable-thinking`).
- Comprensión de imagen y texto (`image-text-to-text`) gracias a la torre de visión conservada en BF16.
- Generación de código y matemáticas, con evaluación reportada en LiveCodeBench y MMLU-Pro.
- Decodificación especulativa mediante cabezal MTP y drafter externo compatible.
- Modo de razonamiento conciso: menos tokens de pensamiento que Qwen3.8 estándar en las mismas preguntas.
- Comportamiento de seguridad heredado de Kvark sin modificar (sin abliteración ni merging).
- Plantilla de chat que activa el pensamiento por defecto; desactivable vía `chat_template_kwargs`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: con 17,9 GB de pesos y decodificación de ~193 tok/s en un Mac Studio M5 Ultra, es viable integrarlo en un IDE o CLI para autocompletado y explicación de código sin depender de la nube.
- Evaluación de razonamiento con presupuesto de tokens ajustado: al consumir aproximadamente la mitad de tokens de pensamiento que Qwen3.8 en las mismas preguntas (2.771 → 1.383 en LiveCodeBench), reduce coste y latencia en pipelines de evaluación masiva.
- Análisis de documentos con imagen: la torre de visión en BF16 permite tareas image-text-to-text como descripción de capturas, extracción de datos de gráficos o respuesta a preguntas sobre figuras.
- Servidor OpenAI-compatible local: mediante mlx-vlm u oMLX se puede exponer el modelo con plantilla de chat y control de `enable_thinking`, útil para prototipos de aplicaciones conversacionales.
- Investigación sobre cuantización mixta: sirve como referencia reproducible de la regla `mixed_4_6` de mlx-vlm aplicada a un post-entrenamiento, con métricas de acuerdo top-1 (0,959) y KL (0,018) frente al build de 8 bits.
- Despliegue con decodificación especulativa: combinado con `z-lab/Qwen3.8-27B-DFlash2` como drafter, permite estudiar el impacto del MTP en latencia (TTFT de 0,105 s) sobre pesos derivados.
- Filtrado de contenido y pruebas de robustez: los marcadores de rechazo reportados (103/104 en prompts dañinos, 4/104 en inofensivos) permiten validar comportamientos de seguridad en entornos controlados.

## Benchmarks y rendimiento

Datos reportados en la model card con pensamiento activado. Muestras pequeñas; el propio autor advierte que no permiten concluir superioridad estadística.

| Benchmark | Qwen3.8-27B misma receta | Este modelo |
|---|---|---|
| LiveCodeBench (40 preguntas), precisión | 0,70 | 0,80 |
| MMLU-Pro (100 preguntas), precisión | 0,77 | 0,82 |
| LiveCodeBench, tokens medios por respuesta | 5.952 | 4.480 |
| LiveCodeBench, respuestas truncadas al límite | 9 | 6 |
| LiveCodeBench, tiempo total de evaluación | 824 s | 552 s |
| MMLU-Pro, tokens medios por respuesta | 2.010 | 1.253 |
| MMLU-Pro, respuestas truncadas al límite | 13 | 6 |
| MMLU-Pro, tiempo total de evaluación | 600 s | 377 s |

| Métrica de velocidad (Mac Studio M5 Ultra, oMLX Splash, KV int8, DFlash2) | Este modelo | Qwen3.8-27B misma receta |
|---|---|---|
| Decodificación | 192,9 tok/s | 191,1 tok/s |
| Time to first token | 0,105 s | 0,104 s |

Acuerdo con el build de 8 bits (teacher-forced sobre continuaciones de código): top-1 del 0,959, KL medio de 0,018. Rechazos: 103/104 en prompts dañinos y 4/104 en inofensivos.

## Requisitos de hardware

- VRAM/unificada estimada: 17,9 GB de pesos en disco (16,68 GiB); en Apple Silicon la memoria unificada debe cubrir pesos más caché KV (int8 en las pruebas) y buffers de activación, por lo que se recomienda un mínimo de 24-32 GB.
- GPU recomendadas: Apple Silicon de gama alta (M-series Pro/Max/Ultra). Las pruebas de velocidad se hicieron en un Mac Studio con M5 Ultra.
- GPU consumer NVIDIA: no es el objetivo de este build (librería `mlx`); para CUDA habría que recurrir a otros formatos no disponibles en este repo.
- Despliegue: mlx-vlm (probado con 0.7.9) y oMLX con motor Splash. El autor menciona consideraciones sobre mlx-lm y el cargador `qwen3_5`, pero no se detalla una receta completa.
- Decodificación especulativa: opcional con `z-lab/Qwen3.8-27B-DFlash2` como drafter configurado en oMLX.
- Latencia y throughput: 192,9 tok/s de decodificación y 0,105 s de TTFT en la configuración descrita; sin drafter, el modelo decodifica a velocidad típica de 4 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kvark-Sparkle-27B-MLX-AWQ-4.5bit (este) | 27,78B | 262.144 | AWQ 4/6 bits mixta | Apache 2.0 | Hugging Face, 16 descargas |
| cloudcommander/Kvark-Sparkle-27B-MLX-8bit | no disponible | 262.144 (heredado) | 8 bits | Apache 2.0 | Hugging Face |
| Egzakta/Kvark-Sparkle-1.0-27B (base BF16) | no disponible | 262.144 (heredado) | BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (modelo origen) | no disponible | no disponible | BF16 | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables más allá de las cifras de la propia model card para la receta 4/6 de Qwen3.8.

## Limitaciones y advertencias

- Build no oficial: no está hecho ni respaldado por Egzakta; los pesos son de Kvark, solo cuantizados.
- Solo inglés declarado en la metadata (`language: en`); el rendimiento en otros idiomas no está verificado.
- Muestras de evaluación pequeñas (40 y 100 preguntas); las diferencias de precisión no son estadísticamente significativas (McNemar p = 0,34 y p = 0,18).
- La comparación de velocidad usa como referencia un Qwen3.8-27B sin censura de OrcaRouter, no el Qwen3.8 estándar con la misma receta; el autor indica que la abliteración apenas altera el modelo (KL 0,0048).
- Riesgo de alucinación inherente al modelo base; no se reportan métricas específicas de factualidad.
- El comportamiento de seguridad es el de Kvark sin modificar; existen variantes "Uncensored" publicadas por el mismo autor que no deben confundirse con este build.
- Dependencia de la librería `mlx`: no es directamente portable a CUDA sin conversión adicional.
- El cargador `qwen3_5` de mlx-lm interpreta los tensores `mtp.*` como checkpoint HF crudo y suma +1.0 a las normas; el autor advierte de este detalle en la sección MTPLX, pero el texto disponible se corta y no se detalla la solución completa.
- El uso comercial está permitido por Apache 2.0, pero conviene verificar las condiciones del modelo base y del modelo origen Qwen3.8.

## Enlaces

- Hugging Face (este build): https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-MLX-AWQ-4.5bit
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Build de 8 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-MLX-8bit
- Variante uncensored 4.5 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit
- Variante uncensored 8 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit
- Drafter de decodificación especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
