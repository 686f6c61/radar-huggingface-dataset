# sMyn42/Qwen2.5-3B-SWE-Agent-QLoRA-F16-GGUF

## Resumen

`sMyn42/Qwen2.5-3B-SWE-Agent-QLoRA-F16-GGUF` no es un modelo completo, sino un adaptador LoRA en formato GGUF (precisión F16) convertido a partir de `suhas9545/Qwen2.5-3B-SWE-Agent-QLoRA` mediante el espacio `gguf-my-lora` de ggml.ai. El adaptador se entrena sobre Qwen2.5-3B con QLoRA de 4 bits y está orientado a tareas de ingeniería de software: resolución de incidencias, uso de herramientas y conversaciones multi-turno sobre código. El repositorio contiene únicamente los pesos del adaptador (59.867.136 parámetros, ~0,1 GB), no el modelo base.

Su relevancia práctica es que permite aplicar un ajuste fino especializado en SWE sobre una base de 3B ejecutable en hardware de consumo, sin reentrenar ni redistribuir el modelo completo: basta con cargar el GGUF del adaptador junto al GGUF del base en `llama.cpp`. El resultado es un agente de código ligero, en inglés y con licencia Apache-2.0, adecuado para entornos locales o aislados.

La contrapartida es la ausencia total de documentación técnica complementaria: la model card es una plantilla de conversión automática que remite al repositorio original, sin detalles de entrenamiento, sin métricas y sin validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Qwen2.5-3B; el repositorio no contiene la arquitectura completa |
| Parámetros totales | 59.867.136 (pesos del adaptador en safetensors); el modelo base Qwen2.5-3B (~3B) no se incluye en el repo |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen2.5-3B (32.768 tokens según la documentación pública de Qwen, no verificada aquí) |
| Tipos de cuantización | Adaptador distribuido en F16 (GGUF); el modelo base admite las cuantizaciones de llama.cpp (Q4_0, Q4_K_M, Q5_K_M, Q8_0, F16, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA F16); el adaptador original está en formato PEFT/safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) derivado de un ajuste QLoRA de 4 bits sobre Qwen2.5-3B, un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y atención con query/key/value agrupadas. El adaptador se aplica en tiempo de inferencia sobre las capas del base y modifica los pesos de proyección; no incluye tokenizador, configuración ni pesos del modelo completo, por lo que requiere el base GGUF correspondiente y nombres de tensor compatibles.

La información disponible no especifica el rango (`r`), el `alpha`, el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Lo único documentado es el corpus declarado, `suhas9545/Multi_Turn_SWE_dataset`, descrito por los tags como multi-turno y orientado a ingeniería de software, y la herramienta de conversión empleada (`gguf-my-lora`), que generate un GGUF F16 del adaptador para su carga con el flag `--lora` de `llama.cpp`. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modo de razonamiento explícito).

## Capacidades

- Generación de texto y de código en inglés, con especialización declarada en tareas de ingeniería de software (tags `software-engineering`, `swe`).
- Comportamiento de agente de código multi-turno, entrenado sobre un dataset de conversaciones multi-turno de SWE.
- Uso de herramientas (tag `tool-use`), orientado a invocación de funciones dentro de bucles de agente.
- Aplicación incremental sobre el modelo base mediante `llama-cli` y `llama-server` sin necesidad de fusionar pesos.
- Compatibilidad con el ecosistema `llama.cpp` (CLI y servidor HTTP con API compatible con OpenAI, según el tag `endpoints_compatible`).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- No se declaran capacidades de visión, audio, ni modo de razonamiento extendido.

## Casos de uso

- Agente SWE local en estaciones de trabajo aisladas: cargando el adaptador sobre un GGUF Q4_K_M de Qwen2.5-3B con `llama-server`, se obtiene un endpoint HTTP compatible con OpenAI para que un agente resuelva incidencias y proponga parches sin salir de la red corporativa.
- Asistente de refactorización en el IDE: el servidor local atiende peticiones de edición multi-archivo con el contexto que permita el base, útil cuando no se puede enviar código propietario a una API externa.
- Automatización de triaje de issues: clasificación y resumen de incidencias de repositorio, con generación de un borrador de respuesta y de los ficheros candidatos a modificar.
- Generación de tests unitarios y revisión de parches: el ajuste sobre datos multi-turno de SWE favorece la producción de explicaciones paso a paso sobre un diff y la propuesta de casos de prueba.
- Integración en pipelines de CI/CD: como paso previo a la revisión humana, el modelo puede etiquetar Pull Requests, detectar cambios incompatibles o sugerir revisores a partir del diff.
- Base para experimentación en fine-tuning eficiente: el par (adaptador + base) sirve como punto de partida reproducible para estudiar QLoRA de 4 bits en GPUs de consumo, sustituyendo el adaptador por uno propio y reutilizando el flujo de conversión a GGUF.
- Soporte a desarrolladores junior sobre código legacy: explicación de fragmentos y generación de documentación técnica en inglés, siempre con verificación humana por el tamaño reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es una plantilla de conversión automática que no incluye métricas de ningún tipo (ni MMLU, ni HumanEval, ni SWE-bench, ni evaluaciones de tool calling), y no se ha localizado comparación alguna con el adaptador original.

## Requisitos de hardware

- VRAM del adaptador: ~114 MB en F16 (59,87 M de parámetros × 2 bytes), coherente con el tamaño de repo declarado de 0,1 GB.
- VRAM del modelo base (estimación a partir del número de parámetros, no medida): ~6,2 GB en F16, ~3,3 GB en Q8_0, ~2,2 GB en Q5_K_M, ~1,9 GB en Q4_K_M.
- VRAM total estimada en inferencia: base Q4_K_M + adaptador + caché KV ≈ 2,5-3,5 GB para contextos moderados; base F16 ≈ 7-8 GB.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y RTX 4090; también en iGPU con memoria unificada usando cuantizaciones Q4.
- GPU de datacenter: A100 y H100 solo tienen sentido para servir muchas réplicas o lotes grandes; el modelo no las aprovecha individualmente por su tamaño.
- Despliegue: `llama.cpp` (`llama-cli`, `llama-server`) es la vía nativa para este GGUF LoRA; `Ollama` puede cargar el adaptador mediante la directiva `ADAPTER` del Modelfile; `vLLM` y `TGI` admiten LoRA, pero requieren el adaptador en formato PEFT/safetensors, no el GGUF.
- Requisito crítico: el adaptador debe aplicarse sobre un GGUF de Qwen2.5-3B con la misma arquitectura y nombres de tensor; usar otro base degrada o invalida el resultado.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| sMyn42/Qwen2.5-3B-SWE-Agent-QLoRA-F16-GGUF | 59,87 M (adaptador) + ~3B del base | no indicado (heredado del base) | Agente SWE con tool use, solo inglés | apache-2.0 | GGUF LoRA F16 | No disponibles |
| Qwen2.5-Coder-3B-Instruct | ~3B | 32.768 (documentación pública de Qwen) | Código y instrucciones, multilingüe | apache-2.0 | safetensors, GGUF | Sí, publicados por el autor del base |
| Qwen2.5-3B-Instruct | ~3B | 32.768 (documentación pública de Qwen) | Instrucciones generales, multilingüe | apache-2.0 | safetensors, GGUF | Sí, publicados por el autor del base |
| Llama-3.2-3B-Instruct | ~3B | 128.000 | Instrucciones generales, multilingüe | Llama 3.2 Community License | safetensors, GGUF | Sí, publicados por Meta |

Los datos de contexto y parámetros de las alternativas provienen de su documentación pública y no se han verificado en la información proporcionada. Frente a ellas, este adaptador aporta especialización declarada en SWE y un formato LoRA GGUF listo para `llama.cpp`, pero carece de evaluación publicada y está restringido al inglés.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF del base Qwen2.5-3B no puede ejecutarse; la carga con un base distinto produce resultados incorrectos o errores de tensores.
- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el adaptador original, por lo que el nivel real de mejora en tareas SWE es desconocido.
- Riesgo de alucinación elevado en código: con ~3B de parámetros, es probable que invente APIs, firmas de funciones o rutas de fichero; requiere ejecución de tests y revisión humana antes de aplicar parches.
- Idioma: solo inglés declarado; el rendimiento en castellano no está soportado ni documentado.
- Capacidad limitada por tamaño: razonamiento multi-paso largo, repositorios grandes y tareas de SWE-bench completas quedan fuera del alcance razonable de un 3B.
- Contexto no documentado en la ficha: aunque el base soporte ventanas amplias, no se especifica si el entrenamiento del adaptador utilizó secuencias largas, lo que puede degradar el comportamiento en contextos extensos.
- Licencia: el adaptador es Apache-2.0 y el base Qwen2.5 también, pero la licencia del dataset `suhas9545/Multi_Turn_SWE_dataset` no se indica; conviene verificarla antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes, repositorio creado y actualizado el mismo día, sin historial de issues ni mantenimiento.
- La model card es una plantilla automática: no documenta hiperparámetros, composición del dataset ni limitaciones específicas del ajuste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sMyn42/Qwen2.5-3B-SWE-Agent-QLoRA-F16-GGUF
- Adaptador original: https://huggingface.co/suhas9545/Qwen2.5-3B-SWE-Agent-QLoRA
- Espacio de conversión gguf-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/suhas9545/Multi_Turn_SWE_dataset
- Documentación del servidor llama.cpp (uso de LoRA): https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
