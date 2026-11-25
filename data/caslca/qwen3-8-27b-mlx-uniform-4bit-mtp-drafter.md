# caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter

## Resumen

`caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter` es un predictor MTP (multi-token prediction) externo para el modelo objetivo `caslca/Qwen3.8-27B-mlx-uniform-4bit`. No es un modelo de chat autónomo: se trata de una cabeza MTP extraída del modelo base, cuantizada en int4 afín con grupo de 64, que se usa como drafter en decodificación especulativa dentro del ecosistema MLX (Apple Silicon). El repositorio ocupa 0,3 GB y contiene 424.699.392 parámetros, es decir, aproximadamente 300 MB de pesos más el tokenizador.

Su relevancia es práctica: permite acelerar la decodificación del modelo de 27B en hardware Apple sin alterar la salida. El autor documenta una campaña de exactitud con distancia de variación total máxima 0 entre MTP activado y desactivado en contextos de 1K, 8K, 32K y 64K, y una velocidad de decodificación de 1,72× en el punto de operación desplegado (47,3 frente a 28,1 tok/s ponderados por token) con una tasa de aceptación de borradores de 0,81.

La licencia es Apache 2.0. El modelo está pensado exclusivamente para emparejarse con el artefacto objetivo correspondiente: la tasa de aceptación y la calidad no se transfieren a otros fine-tunes o cuantizaciones. El autor mantiene explícitamente una etiqueta INCONCLUSIVE sobre la comparación de MBPPPlus, que la aprobación de despliegue no elimina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP nativa `qwen3_5_mtp` de una capa, extraída del modelo objetivo (drafter para decodificación especulativa) |
| Parametros totales | 424.699.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (límite del objetivo en el runtime certificado) |
| Tipos de cuantizacion | int4 afín, grupo de 64 (uniform-4bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El artefacto es una extracción de una sola capa de la cabeza MTP nativa `qwen3_5_mtp` del modelo objetivo `Qwen3.8-27B-mlx-uniform-4bit`, cuantizada en int4 afín con grupo de 64. No se ha entrenado desde cero ni se ha sometido a un proceso de alineación propio: hereda los pesos de la cabeza MTP del objetivo y se limita a predecir tokens adicionales que el modelo principal verifica después. El uso previsto es de dos tokens borrador por ronda, según el linaje histórico de servicio documentado por el autor.

El runtime certificado es MLX-VLM en el commit `1c7c8fa1`, MLX-Serve en `1ddf6f84` y MLX/Metal 0.32.4, medido en una máquina M5 Max de 128 GB conectada a corriente. La innovación técnica es la decodificación especulativa con verificación exacta: el autor reporta identidad byte a byte entre MTP activado y desactivado en 20 de 20 ítems de math500 con muestreo desplegado, y una campaña de exactitud con tokens forzados en contextos de corto, 1K, 8K, 32K y 64K con distancia de variación total máxima 0, además de identidad voraz en 24 ítems de matemáticas, código y judge, identidad entre cargas y continuidad multiturno. No se documenta el volumen de tokens de entrenamiento ni la composición del dataset, porque no aplica a un artefacto de extracción.

## Capacidades

- Predicción especulativa de tokens para el objetivo `Qwen3.8-27B-mlx-uniform-4bit`: genera borradores que el modelo principal verifica, sin cambiar la distribución de salida.
- Aceleración de decodificación en el punto de operación desplegado: 1,72× de ratio de decodificación (intervalo de confianza del 95 % [1,66; 1,79], media geométrica de ratios por ítem con bootstrap de ítems), 47,3 frente a 28,1 tok/s ponderados por token, con 1,6K tokens generados de media.
- Tasa de aceptación de borradores de 0,81 en el mismo punto de operación.
- Compatibilidad con razonamiento en modo thinking: las mediciones se realizan con thinking activado y temperatura 0,6.
- Soporte de contextos largos hasta el límite de 262.144 tokens del objetivo, con la salvedad de rendimiento descrita más abajo.
- Uso en tareas de código agéntico y asistencia a investigación y diseño (categorías B2/C2 según la nomenclatura del autor).
- No soporta tool calling, agentes ni multimodalidad por sí mismo: esas capacidades pertenecen al modelo objetivo, no al drafter.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: se empareja con el objetivo de 27B en MLX para elevar el throughput de decodificación de 28,1 a 47,3 tok/s ponderados por token en el punto de operación certificado, sin modificar las salidas.
- Generación de código agéntico en estación de trabajo: el autor lo aprueba como segunda opción operativa para coding agéntico (B2/C2) con temperatura 0,6, razonamiento medio y MTP nativo activado, lo que encaja en flujos de edición de código con verificación posterior.
- Asistencia a investigación y diseño con contexto largo: con ventana de hasta 262.144 tokens, se puede usar para resumir y razonar sobre documentos extensos, siempre que se acepte la penalización de decodificación cerca del límite de contexto.
- Evaluación comparativa de decodificación especulativa: sirve como banco de pruebas reproducible para medir tasas de aceptación y ratios de velocidad en MLX, dado que el autor publica metodología de pares emparejados por ítem y bootstrap.
- Despliegue en pipelines de CI con presupuesto de latencia: al reducir el tiempo de decodificación en torno a un 42 % en el punto de operación, permite ajustar presupuestos de generación en pruebas automatizadas de código (HumanEvalPlus reporta 94,5 % ordinario en ambos estados con MTP activado).
- Servicio de razonamiento matemático con thinking: math500 reporta 99 % tanto con MTP activado como desactivado y cero discordancia observada en 100 ítems, lo que lo hace adecuado para servir respuestas de matemáticas sin degradación medida.

## Benchmarks y rendimiento

| Prueba | MTP OFF | MTP ON | Interpretación |
|---|---:|---:|---|
| Math500, n=100 | 99 % | 99 % | 0 pp [0, 0]; cero discordancia observada |
| HumanEvalPlus, n=100 | 93 % | 94 % | +1 pp [0, +3] |
| MBPPPlus, n=100 | 83 % | 82 % | −1 pp [−6, +3], INCONCLUSIVE; 2 solo-ON y 3 solo-OFF |
| HumanEvalPlus estricto, n=164 (2026-08-30, TQ4) | 92,7 % | 93,9 % | Diferencia de 0 pp [−3, +3] en ordinario; 94,5 % ambos estados |
| Prosa de investigación, 40 pares | — | — | Preferencia OFF 0,56 [0,45; 0,68], Holm p=0,28; sin potencia estadística |
| Cadena de 128K, 4 niveles, 3 extracciones | 3/3 | 3/3 | Sin agotamiento de presupuesto |
| Puerta de visión de 20 fotos | 19/20 | 19/20 | Mismo detalle de foto fallado |

| Métrica de velocidad (math500, 20 ítems sembrados) | Valor |
|---|---|
| Ratio de decodificación ON/OFF | 1,72× [1,66; 1,79] |
| Tokens por segundo ponderados por token | 47,3 (ON) frente a 28,1 (OFF) |
| Tasa de aceptación de borradores | 0,81 |
| Salidas byte-idénticas | 20/20 |
| Prefill en el límite de 262.144 tokens | 25,02 → 25,33 GB de pico |
| Decodificación en el límite de 262.144 tokens | 11,92 → 10,38 tok/s (−13 %) |

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio pesa 0,3 GB, de modo que el drafter añade un coste marginal de memoria sobre el objetivo. En el límite de contexto de 262.144 tokens, el pico de decodificación pasa de 25,18 a 26,06 GB con MTP activado.
- Hardware medido: Apple M5 Max de 128 GB con corriente alterna. También se reportan pantallas en M5 Max de 64 GB (pantalla de regresión C84 con MLX/Metal 0.32.2).
- GPU recomendadas: exclusivamente Apple Silicon con MLX/Metal; no hay soporte documentado para CUDA, A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para el objetivo de 27B; el drafter en sí ocupa unos 300 MB.
- Opciones de despliegue: MLX-VLM (commit `1c7c8fa1`) y MLX-Serve (commit `1ddf6f84`) con MLX/Metal 0.32.4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 47,3 tok/s ponderados por token con MTP activado frente a 28,1 sin él en math500; 11,92 frente a 10,38 tok/s en el límite de 262.144 tokens. El punto de cruce donde el coste de verificación supera la ganancia se sitúa entre 82K y 262K tokens y no fue localizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter` | 424,7 M | 262.144 (del objetivo) | Drafter MTP para decodificación especulativa | Apache 2.0 | Hugging Face, MLX |
| `caslca/Qwen3.8-27B-mlx-uniform-4bit` (objetivo) | 27B (nominal) | 262.144 | Modelo de chat/razonamiento | no disponible en la información | Hugging Face, MLX |
| Gemelo histórico mlx-community | no disponible | no disponible | Relación de gemelo aplicable solo a las revisiones del objetivo comparadas explícitamente | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros alternativos en la información proporcionada; la comparación con otros drafters MTP fuera del linaje del autor queda como no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona emparejado con el artefacto objetivo exacto. La aceptación y la calidad no se transfieren a otro fine-tune o cuantización.
- La comparación en MBPPPlus sigue etiquetada INCONCLUSIVE (−1 pp [−6, +3]); la aprobación operativa no elimina esa limitación.
- Los intervalos de confianza son nominales y exploratorios: con n=100 la diferencia mínima detectable es de 12,5 pp y con n=40 es de 20 pp. Una discordancia cero no prueba equivalencia universal.
- Las cifras de velocidad provienen de una sola máquina y de un par por estado en longitud normal; son descriptivas, no una clasificación de calidad.
- Cerca del límite de contexto la decodificación se degrada un 13 % con MTP activado; el punto de cruce entre 82K y 262K no está localizado.
- Las puertas de visión (20 fotos) y de profundidad de contexto no certifican imágenes arbitrarias, OCR, diagramas complejos ni razonamiento a contexto completo; la puerta de fotos es una pantalla de capacidad permisiva, no un benchmark de visión clasificado.
- En la pantalla de regresión C84, la retirada de caché solo está habilitada para `Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed`, no para este artefacto.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del drafter; al heredar el comportamiento del objetivo, esos riesgos son los del modelo de 27B.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia estricta del artefacto objetivo limita la reutilización práctica.

## Enlaces

- Hugging Face: https://huggingface.co/caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter
- Modelo objetivo: https://huggingface.co/caslca/Qwen3.8-27B-mlx-uniform-4bit
- Commit de MLX-VLM: https://github.com/ivan-avramov/mlx-vlm/commit/1c7c8fa166582ac1a1c23ae9063527b2b5215b11
- Commit de MLX-Serve: https://github.com/ivan-avramov/mlx-serve/commit/1ddf6f842f159a62d240f3ac6965fc33cbdb0b0d
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
