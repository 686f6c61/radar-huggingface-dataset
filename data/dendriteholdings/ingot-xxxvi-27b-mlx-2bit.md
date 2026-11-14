# dendriteholdings/Ingot-XXXVI-27B-MLX-2bit

## Resumen

Ingot-XXXVI-27B-MLX-2bit es la conversión al formato MLX (Apple Silicon) de un modelo ternario de 27 359 638 768 parámetros que ganó la competición de cuantización del subnet Ingot, perteneciente a la red Bittensor. El modelo parte de Prism ML Ternary Bonsai 2 27B, un modelo ternario (códigos de 2 bits con escala y sesgo fp16 cada 128 pesos), cuyos pesos no ternarios fueron reajustados por el minero para acercarse más al modelo profesor Qwen3.8-27B. La relevancia de esta ficha radica en que documenta un caso de cuantización competitiva verificada por un validador mediante divergencia KL frente al profesor, un enfoque poco habitual en el ecosistema open source.

El pack MLX conserva exactamente los mismos códigos ternarios que la versión GGUF del mismo minero (dendriteholdings/Ingot-XXXVI-27B-Q2), reescribiéndolos como valores afines de 2 bits de MLX: cada bloque de 128 pesos mantiene su código ternario y su escala fp16, de modo que cada peso decodifica al mismo número que usa el kernel GGUF. La torre de visión, la configuración, el tokenizador y los vectores de signo Hadamard provienen del modelo original de Prism ML y no fueron modificados por la competición.

El modelo está pensado para inferencia local en hardware Apple Silicon mediante MLX, con un tamaño de repositorio de 8,6 GB (2,25 bits por peso efectivos). No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la documentación proporcionada; la única métrica de calidad publicada es la divergencia KL frente al profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35` de Prism ML), pesos ternarios con cuantización afín de 2 bits |
| Parametros totales | 27 359 638 768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario (códigos de 2 bits, escala fp16 y sesgo −escala por cada 128 pesos); 2,25 bits por peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único `model.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con el layout `prism_hadamard_qwen35` definido por Prism ML, que incorpora transformaciones Hadamard (vectores de signo) integradas en el esquema de cuantización. Los pesos se almacenan en formato ternario: cada bloque de 128 pesos conserva un código ternario y una escala fp16, representados en MLX como valores afines de 2 bits con escala *d* y sesgo *−d*, de forma que cada peso decodifica al mismo valor numérico que utiliza el kernel GGUF equivalente.

El proceso de entrenamiento relevante aquí no es el preentrenamiento original (heredado de Ternary Bonsai 2 27B de Prism ML y, en última instancia, alineado con Qwen3.8-27B como profesor), sino el ajuste fino de cuantización realizado por el minero del subnet Ingot (hotkey `5EFd8hFM67GV9XFyttX5hMggFGxqecjsXJgPxDmux986PhCz`, uid 128), que reajustó los pesos no ternarios para minimizar la divergencia KL frente al profesor BF16. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO. La innovación técnica destacable es el propio mecanismo de competición: el validador corona la copia cuantizada que más se aproxima al profesor, medida como KL por token de respuesta sobre las distribuciones de siguiente token, ponderada por dominio.

## Capacidades

- Generación de texto conversacional (pipeline declarado: `text-generation`).
- Razonamiento y generación de código: la model card reporta métricas específicas sobre prompts de código (velocidad de decodificación en respuestas de código), lo que sugiere uso en tareas de programación.
- Capacidades de visión: el pack incluye la torre de visión heredada de Prism ML Ternary Bonsai 2 27B, aunque no se detalla el alcance funcional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.
- Decodificación especulativa opcional mediante un drafter DFlash 2 externo (dendriteholdings/Ingot-27B-DFlash2-MLX), que acelera la generación greedy de un solo flujo.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 8,6 GB permiten cargar el modelo en equipos de memoria unificada amplia (el benchmark se realizó en un Mac Studio M3 Ultra con 512 GB), sirviendo como asistente local sin depender de GPU dedicada.
- Servicio de API compatible con OpenAI en estaciones de trabajo Apple: MTPLX expone el modelo como endpoint HTTP (`mtplx serve ... --port 8080`), lo que facilita integrarlo en aplicaciones existentes que ya consumen APIs tipo OpenAI.
- Generación de código asistida en local: la model card reporta velocidades específicas para respuestas de código (unos 90 tok/s con el drafter DFlash 2), lo que lo hace adecuado para autocompletado y generación de fragmentos en editores o pipelines de desarrollo.
- Investigación sobre cuantización extrema: al ser un artefacto de una competición de cuantización evaluada por KL frente al profesor, es útil como referencia reproducible para estudiar el impacto de la cuantización ternaria en la fidelidad distribucional.
- Evaluación comparativa de motores de inferencia: permite medir el mismo conjunto de pesos en MLX (MTPLX, mlx-lm) frente a GGUF (fork de llama.cpp de Dendrite) y comparar rendimiento entre Apple Silicon y GPU NVIDIA (RTX PRO 6000).
- Prototipado de decodificación especulativa: combinado con el drafter DFlash 2, sirve para experimentar con pipelines de decodificación especulativa en MLX sin salir del ecosistema Apple.
- Reproducción de resultados de la competición Ingot: al conservar los códigos ternarios exactos del envío ganador, permite verificar la métrica KL publicada (0,08047) frente al profesor BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta la divergencia KL frente al profesor BF16 y métricas de velocidad de decodificación.

| Metrica | Valor |
|---|---|
| KL (teacher ‖ model) por token de respuesta, este modelo en su eval ganadora | 0,08047 |
| KL del "king" al que superó, misma eval | 0,08219 |

Velocidad de decodificación (batch 1, Mac Studio M3 Ultra, GPU de 80 núcleos, 512 GB):

| Motor | Modo | tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain (un token por paso) | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plain | 59,9 |
| MTPLX + drafter DFlash 2 (greedy, flujo único) | especulativo | ~73 (hasta ~90 en código) |
| GGUF gemelo en fork llama.cpp de Dendrite (misma Mac) | — | 56,4 |
| GGUF gemelo en RTX PRO 6000 | — | 137 |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXVI-27B-MLX-2bit (este) | 27,36 B | no disponible | safetensors MLX (2,25 bits/peso) | no disponible | Hugging Face, 0 descargas |
| dendriteholdings/Ingot-XXXVI-27B-Q2 (gemelo GGUF del mismo minero) | 27,36 B | no disponible | GGUF | no disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base de Prism ML) | 27 B (aprox., según nombre) | no disponible | safetensors MLX | no disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base de Prism ML) | 27 B (aprox., según nombre) | no disponible | GGUF | no disponible | Hugging Face |

La comparación de rendimiento entre estos modelos no está disponible salvo la métrica KL del gemelo GGUF y del "king" previo, ambos en la misma eval que este modelo.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en la información disponible, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre el idioma de entrenamiento.
- Longitud de contexto no documentada: no se indica la ventana de contexto, lo que limita la planificación de casos de uso con contexto largo.
- Requiere un runtime específico: el layout `prism_hadamard_qwen35` no lo carga mlx-lm estándar; es necesario MTPLX (o los kernels ternarios de MTPLX integrados en mlx-lm), lo que reduce la compatibilidad con herramientas habituales.
- Sin cabecera MTP en este repositorio: la decodificación especulativa requiere descargar por separado el drafter DFlash 2; sin él, se decodifica un token por paso.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo cuantizado de forma agresiva (2,25 bits/peso), la fidelidad distribucional medida por KL (0,08047) implica una desviación no nula respecto al profesor BF16.
- Sesgos: no documentados.
- Procedencia competitiva: los pesos no ternarios fueron reajustados por un minero anónimo (hotkey de Bittensor) para optimizar una métrica de KL; esto no garantiza calidad en tareas aguas abajo más allá de esa métrica.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.
- Rendimiento dependiente del hardware: las cifras de velocidad se midieron en un Mac Studio M3 Ultra con 512 GB; equipos con menos memoria unificada pueden no cargar el modelo o rendir de forma muy distinta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVI-27B-MLX-2bit
- Gemelo GGUF del mismo minero: https://huggingface.co/dendriteholdings/Ingot-XXXVI-27B-Q2
- Modelo base MLX de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter de decodificación especulativa DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
