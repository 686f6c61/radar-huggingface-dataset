# GGOSinon/det10-direct-08b

## Resumen

`GGOSinon/det10-direct-08b` es un adaptador LoRA publicado por GGOSinon que convierte el modelo de lenguaje multimodal Qwen/Qwen3.5-0.8B en una política de manipulación robótica de tipo vision-language-action (VLA). No es un modelo de propósito general: es un checkpoint de comportamiento clonado (behaviour cloning) entrenado sobre el conjunto de datos `GGOSinon/robolab-det10`, compuesto por demostraciones scriptadas en el simulador RoboLab de NVIDIA (Isaac Sim). Su salida es exclusivamente la acción del efector final en formato JSON, no texto libre.

El interés técnico del artefacto no está en su rendimiento absoluto, sino en su diseño experimental. Se publica como gemelo emparejado de `GGOSinon/det10-reason-08b`, entrenado sobre filas idénticas, de modo que la única variable que difiere entre ambos es la presencia de razonamiento explícito. Eso permite aislar el efecto del razonamiento en una tarea de control motor fino.

Los resultados medidos son modestos: 36,3 mm de error de posición en decodificación greedy frente a una línea base de "quedarse quieto" de 61,9 mm, y 1/48 de éxito en bucle cerrado sobre un subconjunto de cuatro tareas. El hallazgo relevante es la brecha entre decodificación greedy y muestreo: el mejor de 64 muestras baja a 5,9 mm, lo que indica que la acción experta está dentro del soporte de la política y el fallo es de selección de modo, no de conocimiento ausente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la carga documentada usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un modelo de imagen-texto-a-texto de 0,8 mil millones de parámetros. El entrenamiento es behaviour cloning supervisado sobre el dataset `GGOSinon/robolab-det10`, generado con demostraciones scriptadas en 88 tareas de RoboLab sobre Isaac Sim. No hay datos de robot real ni indicios de RLHF, DPO o refinamiento por recompensa en la información disponible.

La innovación metodológica es el emparejamiento controlado: este adaptador y su gemelo `det10-reason-08b` se entrenaron sobre las mismas filas, uno apuntando solo a la acción y el otro incluyendo razonamiento, lo que convierte la pareja en un experimento de ablación limpio. El formato de prompt es rígido: dos imágenes de 392x221 píxeles (vista sobre el hombro y vista de muñeca), estado del efector en JSON y `enable_thinking=False`. La salida esperada es un objeto JSON con desplazamiento en milímetros relativo a la pose actual (`d_mm`), orientación en cuaternión (`quat`) y estado de la pinza (`jaw`). Una versión anterior del dataset usaba coordenadas absolutas y el modelo aprendió a repetir el estado de entrada, igualando la línea base de no moverse con una pérdida aparentemente sana; el desplazamiento relativo corrige ese modo de fallo.

## Capacidades

- Generación de acciones de manipulación robótica como desplazamiento relativo del efector final en milímetros, orientación en cuaternión y estado de apertura/cierre de pinza.
- Procesamiento conjunto de dos vistas de cámara (sobre el hombro y muñeca) a resolución fija de 392x221.
- Condicionamiento por instrucción de tarea en lenguaje natural y por estado proprioceptivo del robot (posición, cuaternión y apertura de pinza).
- Salida estructurada en JSON con esquema fijo, apta para parseo directo en un bucle de control.
- Capacidad de muestreo múltiple: la política produce distribuciones de acciones cuyo mejor candidato de 64 muestras se acerca a 5,9 mm del experto.
- No soporta tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento (el prompt de entrenamiento fija `enable_thinking=False`).

## Casos de uso

- Investigación en políticas VLA: sirve como referencia de comportamiento clonado sobre un modelo base pequeño para comparar contra variantes con razonamiento, gracias a su gemelo emparejado.
- Estudio de selección de modo en políticas de imitación: la brecha entre greedy (36,3 mm) y best-of-64 (5,9 mm) lo convierte en un banco de pruebas para técnicas de muestreo, verificación o RL con recompensa de distancia de acción.
- Prototipado en RoboLab/Isaac Sim: permite montar un pipeline completo de percepción-acción en simulación antes de invertir en datos reales.
- Generación de datos sintéticos de acciones: las 64 muestras por paso pueden filtrarse por distancia al experto para construir pares de preferencia o datos de refinamiento.
- Evaluación de robustez de formato de prompt: útil para medir cuánto degrada un desajuste de resolución, orden de cámaras o esquema de estado en un modelo multimodal pequeño.
- Docencia y divulgación: ejemplo compacto (0,8B, 0,1 GB de adaptador) de cómo se adapta un VLM a control motor sin entrenar desde cero.

## Benchmarks y rendimiento

| Métrica | Este adaptador | Gemelo con razonamiento | Línea base (quieto) |
|---|---|---|---|
| Error de posición en held-out, greedy | 36,3 mm | 46,0 mm | 61,9 mm |
| Mejor de 64 muestras (T=1,0) | 5,9 mm | 3,7 mm | 61,9 mm |
| Precisión de pinza | 97,0% | 97,0% | no disponible |
| Éxito en bucle cerrado (4 tareas, 12 entornos/tarea, greedy) | 1/48 | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8B; en bfloat16 ocupa aproximadamente 1,6 GB de pesos, más el adaptador LoRA (0,1 GB) y el procesador multimodal. Con overhead de activaciones y dos imágenes por prompt, un presupuesto de 4-6 GB es razonable.
- GPU recomendadas: cualquier GPU con al menos 8 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para servir con vLLM se recomienda una GPU de datacenter por comodidad, no por necesidad.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: `transformers` + `peft` (carga documentada por el autor) y `vllm serve` con `--enable-lora --max-lora-rank 32 --lora-modules policy=... --limit-mm-per-prompt '{"image": 2}'`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El cuello de botella previsible es el preprocesado de dos imágenes por paso y el muestreo de 64 candidatos si se usa best-of-N.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GGOSinon/det10-direct-08b` | 0,8B (base) + LoRA | no disponible | VLA de manipulación, acción directa | Apache 2.0 | Hugging Face |
| `GGOSinon/det10-reason-08b` | 0,8B (base) + LoRA | no disponible | VLA de manipulación con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | VLM de propósito general | no disponible | Hugging Face |

No se dispone de información sobre otros modelos VLA comparables (por ejemplo, familias OpenVLA o RT-2) en la documentación proporcionada, por lo que la comparación se limita a los artefactos del mismo autor y al modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente con demostraciones scriptadas de 88 tareas de RoboLab; no hay datos de robot real, por lo que la transferencia a hardware físico no está validada.
- Profundidad de datos desigual: 32 tareas tienen 10 episodios y 6 tareas tienen solo uno, lo que produce un rendimiento muy heterogéneo por tarea.
- El error de posición en greedy (36,3 mm) es incompatible con agarres fiables, que requieren precisión de pocos milímetros; el éxito en bucle cerrado es de 1/48.
- El paso 0 de cada episodio de entrenamiento es casi estacionario (mediana de 0,36 mm), así que la política emite un primer comando submilimétrico. Si el controlador rechaza comandos pequeños como no-ops, se entra en un estado absorbente; hay que desactivar esa guarda o abarcar más de un chunk.
- El formato de prompt es frágil: un desajuste de resolución, orden de cámaras, esquema de estado o `enable_thinking` no lanza error, sino que devuelve prosa o un esquema distinto que parece una política rota.
- Riesgo de eco del estado de entrada si se cambia a coordenadas absolutas, modo de fallo ya observado en una versión anterior del dataset.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la información disponible.
- Sin datos publicados sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de RoboLab.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GGOSinon/det10-direct-08b
- Gemelo con razonamiento: https://huggingface.co/GGOSinon/det10-reason-08b
- Dataset de entrenamiento: https://huggingface.co/datasets/GGOSinon/robolab-det10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio RoboLab (NVIDIA): https://github.com/NVlabs/RoboLab
