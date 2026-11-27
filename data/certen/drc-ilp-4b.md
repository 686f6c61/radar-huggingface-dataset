# certen/DrC-ILP-4B

## Resumen

DrC-ILP-4B es un adaptador LoRA en formato MLX desarrollado por el usuario certen sobre el modelo base `mlx-community/Qwen3-4B-4bit`, una versión cuantizada a 4 bits del Qwen3-4B de Alibaba. El adaptador está orientado a razonamiento neuro-simbólico gobernado por reglas, evaluación calibrada de evidencia y cumplimiento de restricciones duras, con capacidad explícita de abstención segura cuando falta información requerida. Se distribuye como adaptador no destructivo: no modifica los pesos del modelo base, que sigue disponible para conversación general y uso de herramientas.

El modelo aborda un problema concreto en sistemas de decisión automatizada: la selección de acciones bajo políticas explícitas de elegibilidad y exclusiones duras, donde el sistema debe distinguir entre hechos respaldados, refutados y ausentes en lugar de inferir condiciones no declaradas. Está diseñado para flujos de verificación estructurada de reglas y descubrimiento simbólico de políticas (inductive logic programming), un nicho poco cubierto por los ajustes instructivos convencionales.

Por su naturaleza de adaptador sobre un modelo de 4B parámetros cuantizado a 4 bits y ejecutado en MLX, está pensado para Apple Silicon, lo que limita su despliegue a hardware de Apple (chips de la serie M). La licencia es Apache 2.0 y el repositorio no contiene pesos completos, sino únicamente el delta del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA; formato MLX |
| Parámetros totales | 4B en el modelo base (adaptador LoRA adicional, tamaño no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del Qwen3-4B base; no especificada en la model card) |
| Tipos de cuantización | 4 bits en el modelo base (`mlx-community/Qwen3-4B-4bit`); cuantizaciones adicionales del adaptador no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador MLX (LoRA); el base en formato MLX cuantizado a 4 bits |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, en su variante cuantizada a 4 bits para MLX. El adaptador es de tipo LoRA y se carga de forma no destructiva junto al checkpoint base mediante `mlx_lm.load(..., adapter_path=...)`, de modo que los pesos del modelo base permanecen intactos y pueden usarse en paralelo para conversación general y tool calling. La model card no detalla la configuración del LoRA (rango, alpha, capas objetivo) ni el volumen o composición del dataset de entrenamiento.

La orientación declarada del ajuste es neuro-simbólica: verificación de reglas en lenguaje natural, evaluación calibrada de evidencia (distinguir soportado, refutado y ausente) y abstención ante información faltante. Los ejemplos de la model card emplean plantilla de chat con `enable_thinking=False`, lo que sugiere que el adaptador opera en modo de respuesta directa sin cadena de pensamiento explícita. No se documentan detalles sobre RLHF, DPO ni datos de entrenamiento.

## Capacidades

- Evaluación calibrada de evidencia: clasifica hechos como respaldados, refutados o ausentes en texto en lenguaje natural, sin inferir condiciones no declaradas.
- Cumplimiento de reglas y restricciones: razonamiento bajo políticas de elegibilidad de vocabulario abierto y exclusiones duras.
- Selección de acción restringida: elige una única opción permitida entre un conjunto dado o se abstiene.
- Abstención segura: devuelve una opción de abstención cuando falta información requerida para decidir.
- Descubrimiento simbólico de políticas: soporte para flujos de inductive logic programming según los tags del repositorio.
- Uso como adaptador no destructivo: convive con el modelo base sin alterar sus pesos, permitiendo alternar entre razonamiento gobernado por reglas y conversación general.
- Generación de texto: pipeline declarado `text-generation`.
- Tool calling y agentes: no documentado de forma específica para el adaptador; el modelo base Qwen3-4B lo soporta, pero el adaptador no lo declara.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de cambios en producción: dado un ticket de migración o despliegue con contexto (checks de staging, aprobaciones, ventanas de congelación), el modelo selecciona entre `run_migration`, `rollback_release` o `request_missing_info` respetando la restricción de no ejecutar durante un incidente activo.
- Control de calidad en cadena de frío: evaluación de envíos con lecturas de logger y estado de precintos para decidir entre liberar lote, cuarentena o abstenerse si falta el dato de temperatura, aplicando el umbral de 8,0 °C.
- Cumplimiento en transferencias financieras: revisión de expedientes con verificación de beneficiario y cribado de sanciones, aprobando solo cuando ambos están confirmados y absteniéndose si el cribado no ha retornado.
- Promoción de canary releases: decisión de promover o abortar un rollout en función de checks automáticos, aprobación de guardia y estado de la ventana de congelación.
- Descubrimiento de políticas simbólicas: extracción y verificación de reglas de elegibilidad de vocabulario abierto a partir de ejemplos, útil en pipelines de inductive logic programming.
- Sistemas de decisión auditables: cualquier flujo donde la abstención explícita ante evidencia incompleta sea preferible a una decisión inventada, como triaje de solicitudes o validación de expedientes.
- Prototipado local en Apple Silicon: desarrollo y prueba de lógica de decisión gobernada por reglas en portátiles y equipos de escritorio con chip M, sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory: el modelo base de 4B en 4 bits ocupa aproximadamente 2-3 GB de memoria; el adaptador LoRA añade una sobrecarga pequeña (tamaño exacto no disponible). Se recomienda al menos 8 GB de memoria unificada para dejar margen a contexto y caché KV.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No es compatible de forma nativa con CUDA sin conversión.
- GPU de consumo: cabe en cualquier Mac con chip M y 8 GB o más de memoria unificada; no aplica a GPUs NVIDIA/AMD de consumo en su formato actual.
- Opciones de despliegue: `mlx-lm` (CLI `python -m mlx_lm generate` y API Python `mlx_lm.load`/`generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| DrC-ILP-4B | 4B (base) + LoRA | No disponible | Razonamiento neuro-simbólico y abstención | Apache 2.0 | Adaptador MLX |
| Qwen3-4B (base) | 4B | No disponible en esta ficha | Instructivo general, tool calling | Apache 2.0 | Safetensors, GGUF, MLX |
| Adaptadores LoRA temáticos sobre Qwen3-4B | 4B (base) + LoRA | Heredado del base | Específicos por dominio | Variable | Variable |

La comparación con alternativas de razonamiento simbólico o abstención calibrada no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar el base `mlx-community/Qwen3-4B-4bit` junto con el adaptador.
- Dependencia de Apple Silicon y MLX: no es desplegable directamente en infraestructura CUDA ni en servidores x86 sin conversión del adaptador.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento frente a alternativas, por lo que la calidad real en producción no está contrastada.
- Sin información sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO).
- Riesgo de alucinación inherente al modelo base de 4B; el adaptador está diseñado para mitigarlo mediante abstención, pero no se garantiza su cumplimiento en todos los casos.
- Idiomas soportados no documentados; los ejemplos de la model card están en inglés.
- Contexto máximo no especificado; conviene verificar el límite real del Qwen3-4B base antes de usarlo con contextos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del Qwen3-4B conviene revisar también las condiciones del modelo base.

## Enlaces

- [Hugging Face: certen/DrC-ILP-4B](https://huggingface.co/certen/DrC-ILP-4B)
- [Modelo base: mlx-community/Qwen3-4B-4bit](https://huggingface.co/mlx-community/Qwen3-4B-4bit)
- [Repositorio MLX (Apple)](https://github.com/ml-explore/mlx)
- [mlx-lm](https://github.com/ml-explore/mlx-lm)
