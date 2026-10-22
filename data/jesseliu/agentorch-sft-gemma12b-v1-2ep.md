# JesseLiu/agentorch-sft-gemma12b-v1-2ep

## Resumen

agentorch-sft-gemma12b-v1-2ep es un checkpoint de ajuste supervisado (SFT) publicado por el usuario JesseLiu dentro del proyecto AgentOrch, cuyo objetivo es el entrenamiento de modelos para orquestación de flujos de trabajo multiagente. El modelo parte de `google/gemma-4-12B-it` (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`) y se distribuye con los pesos ya fusionados: el adaptador LoRA se ha plegado sobre el modelo base, por lo que se carga como un checkpoint estándar en `transformers` o `vLLM`.

El interés del checkpoint no está en sus capacidades generales, heredadas íntegramente del base, sino en el experimento reproducible que documenta: un ciclo de SFT con datos v1, dos épocas, presupuesto de 81.920 tokens, LoRA con r=16 y alpha=32, learning rate 1e-4 y schedule coseno. Los resultados publicados en el benchmark AgentOrch (vista global, 3.220 variantes, harness congelado) son modestos: precisión de orquestación 0,1792, precisión final 0,0851 y tasa de error 0,6394.

Se trata, por tanto, de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, útil para quien quiera reproducir o auditar la receta de entrenamiento del proyecto AgentOrch, no como un modelo listo para producción. El autor indica explícitamente que debe usarse `enable_thinking=False` en la plantilla de chat, tal como se hizo durante el entrenamiento y la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (según el tag del repositorio); no se detalla la topología interna en la información disponible |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA fusionado en el modelo base) |
| Modelo base | google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) |
| Tipo de ajuste | SFT con LoRA r=16, alpha=32, pesos fusionados |
| Tamaño del repositorio | 24,0 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `gemma-4-12B-it`, etiquetada en el repositorio como `gemma4_unified`, con 11.959.730.224 parámetros. La información proporcionada no detalla la topología interna, el mecanismo de atención, la longitud de contexto nativa ni la composición del corpus original de Gemma. El tamaño del repositorio (24 GB) es coherente con pesos en bf16 (2 bytes por parámetro), aunque este extremo no se declara explícitamente en la model card.

El entrenamiento consistió en un SFT sobre datos v1 del proyecto AgentOrch durante 2 épocas, con un presupuesto de 81.920 tokens, LoRA de rango 16 y alpha 32, learning rate 1e-4 y schedule coseno a 2 épocas; la fila correspondiente del registro experimental es `sft-gemma12b-v1-2ep` en `training/results/training.csv`. Posteriormente se fusionaron los pesos del adaptador en el modelo base. La evaluación se ejecutó con el run `sft-gemma12b-v1-global` sobre el benchmark AgentOrch en vista global (3.220 variantes) con un harness congelado, y con `enable_thinking=False` tanto en entrenamiento como en evaluación. No se documentan etapas de RLHF o DPO, ni innovaciones técnicas adicionales más allá del propio pipeline de orquestación.

## Capacidades

- Orquestación de flujos de trabajo: el ajuste está orientado a la selección y secuenciación de pasos y agentes dentro de tareas de workflow, que es la competencia evaluada en el benchmark AgentOrch.
- Generación de texto y razonamiento conversacional: capacidades heredadas del modelo base `gemma-4-12B-it`, no caracterizadas en la información disponible.
- Modo thinking: el autor exige desactivarlo (`enable_thinking=False`) en la plantilla de chat; el modelo está entrenado y evaluado sin cadena de pensamiento explícita.
- Tool calling y function calling: no disponible en la documentación; no se confirma ni se descarta.
- Soporte multilingüe: no disponible; el repositorio no declara lista de idiomas.
- Capacidades de visión o audio: no disponible; no se mencionan en la model card.
- Compatibilidad de despliegue: al estar los pesos fusionados, se carga como checkpoint normal en `transformers` y `vLLM`.

## Casos de uso

- Reproducción de experimentos de orquestación: cargar el checkpoint con `transformers` o `vLLM` y evaluarlo contra el harness de AgentOrch (vista global, 3.220 variantes) para verificar los valores publicados de precisión de orquestación (0,1792) y precisión final (0,0851).
- Auditoría de recetas de SFT: servir como referencia para comparar configuraciones de LoRA (r=16, alpha=32, lr 1e-4, schedule coseno) frente a otros checkpoints del mismo proyecto, dado que la receta está documentada fila a fila en `training/results/training.csv`.
- Investigación sobre ajuste con presupuesto de tokens limitado: el entrenamiento usó un presupuesto de 81.920 tokens en 2 épocas, lo que lo convierte en un punto de partida para estudiar el efecto de presupuestos reducidos en tareas de orquestación.
- Punto de partida para fine-tuning posterior: al estar los pesos fusionados y la licencia ser Apache 2.0, puede reutilizarse como base para nuevos adaptadores LoRA sobre el mismo dominio de workflows.
- Generación de pipelines en entornos de desarrollo: usar el modelo como planificador de pasos en prototipos internos, asumiendo la tasa de error publicada (0,6394) y validando la salida con tests automáticos antes de ejecutarla.
- Docencia y divulgación técnica: ejemplo práctico de ciclo completo (SFT, fusión de LoRA, evaluación con harness congelado) para cursos y talleres sobre ajuste fino de modelos de 12B.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark AgentOrch (vista global, 3.220 variantes, harness congelado, ejecución `sft-gemma12b-v1-global`):

| Metrica | Valor |
|---|---:|
| Precisión de orquestación (orchestration accuracy) | 0,1792 |
| Precisión final (final accuracy) | 0,0851 |
| Tasa de error (error rate) | 0,6394 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras suites estándar, ni se incluyen comparaciones con otros checkpoints del proyecto o con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 24 GB solo para los pesos (12B × 2 bytes), más overhead de activaciones y caché KV; cifra estimada a partir del tamaño de parámetros, no publicada por el autor.
- VRAM estimada con cuantización: aproximadamente 12-13 GB en 8 bits y 7-8 GB en 4 bits, asumiendo cuantización posterior del checkpoint fusionado; no hay GGUF ni cuantizaciones publicadas en el repositorio.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con contexto largo; RTX 4090 (24 GB) queda justa para bf16 y holgada en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con cuantización; en bf16 sin cuantizar el margen es mínimo.
- Opciones de despliegue: `transformers` y `vLLM` son las vías indicadas por el autor; llama.cpp, Ollama y TGI no están confirmados en la documentación disponible.
- Latencia y throughput: no disponible; no se han publicado mediciones.
- Nota de configuración: usar `enable_thinking=False` en la plantilla de chat para replicar las condiciones de entrenamiento y evaluación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Rendimiento AgentOrch |
|---|---|---|---|---|---|
| agentorch-sft-gemma12b-v1-2ep | 11.959.730.224 | no disponible | Apache 2.0 | safetensors (fusionado) | 0,1792 orquestación / 0,0851 final |
| google/gemma-4-12B-it (base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints del proyecto AgentOrch | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar el checkpoint con su modelo base, del que se conoce la referencia y la revisión, pero no las métricas sin ajustar ni las especificaciones completas. No se dispone de datos de alternativas de terceros de la misma categoría.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: precisión de orquestación de 0,1792 y precisión final de 0,0851, con una tasa de error de 0,6394 sobre 3.220 variantes; no es adecuado para uso en producción sin una validación adicional muy estricta.
- Sesgos: no documentados por el autor; al heredar el modelo base, arrastra los sesgos de su corpus de entrenamiento, que tampoco se detalla.
- Riesgo de alucinación: no evaluado en la información disponible; la tarea de orquestación exige seleccionar acciones concretas, un escenario propenso a errores de planificación.
- Contexto e idiomas: se desconoce la longitud de contexto efectiva y la cobertura lingüística; no se declara lista de idiomas en el repositorio.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero conviene verificar los términos aplicables al modelo base `google/gemma-4-12B-it`, ya que las condiciones de distribución del modelo derivado pueden depender de ellas.
- Modo thinking desactivado obligatoriamente: usar `enable_thinking=True` se sale de las condiciones de entrenamiento y evaluación, por lo que los resultados publicados no serían extrapolables.
- Madurez: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 21 de octubre de 2026 con un minuto de diferencia; no hay evidencia de uso comunitario ni de validación externa.
- Configuración de reproducción: cualquier evaluación debe realizarse con el harness congelado y la revisión exacta del modelo base indicada, o los números no serán comparables.
- Pesos fusionados: no se distribuye el adaptador LoRA por separado, lo que limita la inspección del delta de entrenamiento respecto al base.
- Resultados de la búsqueda web no relevantes: las consultas devolvieron exclusivamente contenido médico ajeno al modelo, por lo que no aportan información técnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-sft-gemma12b-v1-2ep
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio AgentOrch (harness, datos de entrenamiento y registro de experimentos): mencionado en la model card, sin URL pública en la información disponible
- Paper, blog o demo oficial: no disponible
- Resultados de búsqueda web: no relevantes (contenido médico sin relación con el modelo)
