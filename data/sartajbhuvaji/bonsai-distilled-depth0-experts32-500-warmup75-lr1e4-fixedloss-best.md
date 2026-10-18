# sartajbhuvaji/bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss-best

## Resumen

`bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss-best` es un checkpoint de generación de texto publicado en Hugging Face por el usuario sartajbhuvaji. El tag de arquitectura del repositorio es `qwen3_moe`, lo que lo sitúa en la familia de modelos Mixture-of-Experts de Qwen3, con un total real de 23.281.219.584 parámetros (unos 23,28 mil millones) verificados en los pesos safetensors y un tamaño de repositorio de 46,6 GB, coherente con pesos en bf16 (2 bytes por parámetro). No es un modelo oficial de Alibaba/Qwen: es un entrenamiento o ajuste derivado, publicado por un tercero.

El nombre del repositorio sugiere un experimento de destilación sobre una arquitectura MoE con 32 expertos, entrenado durante 500 pasos con 75 pasos de warmup, learning rate 1e-4 y una función de pérdida corregida ("fixedloss"); la etiqueta "bonsai" apunta a una variante comprimida o podada. Conviene subrayar que estas deducciones provienen únicamente de la convención de nombres del autor y no de documentación técnica verificable.

La relevancia práctica del checkpoint es limitada en el momento de redactar esta ficha: la model card es la plantilla automática de Hugging Face sin ningún apartado rellenado, no declara licencia ni idiomas, no publica resultados de evaluación y acumula 0 descargas y 0 "likes". Es, por tanto, un artefacto de investigación sin validación externa conocida, útil para experimentation sobre destilación de MoE pero no apto para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_moe`); número de capas, dimensionalidad y configuración de atención no disponibles |
| Parametros totales | 23.281.219.584 (~23,28 B), dato real de safetensors |
| Parametros activos | no disponible (el nombre indica 32 expertos, pero se desconoce cuántos se activan por token y el tamaño del experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuyen cuantizaciones en el repositorio; pesos en safetensors bf16 (~46,6 GB). Conversión a GGUF/AWQ/GPTQ no verificada |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card deja el campo como "[More Information Needed]") |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El tag `qwen3_moe` indica que el checkpoint reutiliza la implementación Mixture-of-Experts de Qwen3 en la librería `transformers`: un transformer con capas de atención y capas feed-forward sustituidas por bloques MoE con enrutamiento por token. El nombre del repositorio fija en 32 el número de expertos, un valor inferior al de las variantes MoE más conocidas de la familia, lo que encaja con la idea de una variante "bonsai" más compacta. Con 23,28 mil millones de parámetros totales, el checkpoint es un 24 % más pequeño que Qwen3-30B-A3B, pero se desconoce cuántos parámetros se activan por token, dato determinante para el coste de inferencia.

En cuanto al entrenamiento, toda la información disponible procede del identificador del modelo: 500 pasos, 75 pasos de warmup, learning rate 1e-4, una corrección de pérdida ("fixedloss") y el calificativo "distilled", que apunta a destilación de conocimiento desde un modelo mayor o a un ajuste sobre salidas de otro modelo. No hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el uso de RLHF/DPO o fases de alineación, ni sobre precisión mixta o infraestructura utilizada. La model card incluye el marcador `arxiv:1910.09700` (Lacoste et al., calculadora de impacto de carbono), que es parte de la plantilla estándar y no un paper asociado al modelo.

## Capacidades

- Generación de texto autoregresiva y formato conversacional: los tags `text-generation` y `conversational` indican que el checkpoint está pensado para diálogo multi-turno mediante plantilla de chat, aunque la plantilla concreta no está documentada.
- Razonamiento y conocimiento general: capacidad esperable por herencia de la arquitectura Qwen3, pero no evaluada ni documentada para este checkpoint concreto.
- Generación de código y matemáticas: no disponible como capacidad verificada; requeriría evaluación propia (HumanEval, GSM8K) antes de asumirla.
- Tool calling / function calling: no disponible; no se documenta soporte de esquemas de herramientas ni de modo agente.
- Multilingüismo: no disponible; el modelo base Qwen3 es multilingüe, pero se desconoce si el ajuste conserva o degrada esos idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. No hay indicios de modalidad distinta de texto.
- Compatibilidad de despliegue: tag `endpoints_compatible`, es decir, admite el despliegue gestionado de Hugging Face Inference Endpoints con `transformers`.

## Casos de uso

- Investigación sobre destilación de MoE: usar el checkpoint como punto de partida o como referencia para reproducir experimentos de destilación con 32 expertos, comparando curvas de pérdida frente al modelo profesor. Es su uso más realista dado el estado del repositorio.
- Estudio de recetas de entrenamiento: el identificador documenta hiperparámetros (500 pasos, warmup 75, lr 1e-4, "fixedloss"), lo que permite analizar el efecto de una corrección de pérdida en un ajuste corto sobre una arquitectura MoE.
- Base para fine-tuning de dominio: al ser un checkpoint de 23,28 B en `transformers`, puede servir como inicialización para ajuste supervisado en un dominio concreto (legal, sanitario, técnico) una vez validada su calidad base.
- Generación de texto asistida por lotes (offline): tareas de resumen, reescritura o etiquetado sobre corpus internos, sin requisitos de latencia estrictos y con revisión humana posterior.
- Experimentación con cuantización: por su tamaño, es un banco de pruebas razonable para medir la degradación de calidad al pasar de bf16 a 8 y 4 bits en arquitecturas MoE.
- Sustituto local en prototipos de chat: desplegado con `transformers` o vLLM sobre GPU de 80 GB para validar interfaces conversacionales antes de migrar a un modelo con licencia clara y evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ningún apartado de evaluación (MMLU, HumanEval, GSM8K, MT-Bench u otros) y no se ha localizado documentación externa asociada al checkpoint.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan ~46,6 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para dejar espacio a caché KV y activaciones, o reparto en 2×48 GB / 4×24 GB con tensor parallelism.
- VRAM en 8 bits: ~23-24 GB solo para pesos; encaja en una A100 40 GB o en 2×24 GB, con margen limitado para contexto largo.
- VRAM en 4 bits: ~12-13 GB para pesos; cabe en RTX 4090 / RTX 3090 (24 GB) y, muy ajustado, en GPUs de 16 GB, siempre que la conversión a GGUF o AWQ esté soportada para esta arquitectura (no verificada).
- Consideración MoE: a diferencia de un modelo denso con parámetros activos reducidos, todos los expertos deben residir en memoria, de modo que el requisito de VRAM viene marcado por los 23,28 B totales y no por los activos.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A100 40 GB o 2×RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits en pruebas.
- Opciones de despliegue: `transformers` (soporte nativo del tag `qwen3_moe`), vLLM y TGI si la versión instalada reconoce la arquitectura, e Inference Endpoints de Hugging Face por el tag `endpoints_compatible`. llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. Al desconocerse los parámetros activos por token, no es posible estimar tokens por segundo ni coste por millón de tokens con rigor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts32 (este) | 23,28 B | no disponible | no disponible | no disponible | Checkpoint de terceros, sin evaluación ni descargas |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32.768 tokens nativos, ampliable | Apache 2.0 | Modelo oficial, con benchmarks publicados |
| Qwen3-32B (denso) | 32,8 B | 32,8 B (denso) | 32.768 tokens nativos, ampliable | Apache 2.0 | Modelo oficial, con benchmarks publicados |
| Mixtral-8x7B-v0.1 | 46,7 B | 12,9 B | 32.768 tokens | Apache 2.0 | Modelo oficial, ampliamente evaluado |

La comparación relevante es con Qwen3-30B-A3B: mismo linaje arquitectónico, licencia conocida y evaluación pública. Frente a él, este checkpoint ofrece un 24 % menos de parámetros totales, pero carece de licencia, de contexto declarado y de cualquier métrica de calidad, por lo que la comparación en rendimiento no puede establecerse.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; en la práctica, el checkpoint debe tratarse como no licenciado hasta que el autor lo aclare.
- Model card vacía: la ficha es la plantilla automática de Hugging Face; no hay información sobre datos de entrenamiento, sesgos, idiomas ni uso previsto.
- Sin evaluación: no existen benchmarks ni validación independiente, y el repositorio registra 0 descargas, por lo que no ha sido auditado por la comunidad.
- Riesgo de alucinación: no cuantificado. Un ajuste corto (500 pasos) sobre un modelo base puede degradar la factualidad respecto al original.
- Idiomas: al desconocerse la composición del corpus de destilación, es probable que el multilingüismo del modelo base se haya visto afectado; requiere prueba específica en castellano.
- Contexto: al no declararse la ventana, no se debe asumir el contexto nativo de Qwen3; conviene medirlo empíricamente antes de diseñar flujos con documentos largos.
- Trazabilidad: el nombre indica 32 expertos, pero se desconoce el número de expertos activos, dato que afecta directamente a la latencia y al coste.
- Fecha del repositorio: la fecha de creación registrada (2026-10-17) no permite contrastar su historial con documentación o discusiones públicas.
- Uso en producción: no recomendado sin una evaluación propia de calidad, seguridad y sesgos, y sin una resolución previa de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts32-500-warmup75-lr1e4-fixedloss-best
- Paper referenciado en los tags (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio del autor en Hugging Face: https://huggingface.co/sartajbhuvaji
- Familia Qwen3 (referencia de la arquitectura `qwen3_moe`): https://huggingface.co/Qwen
- No se han localizado papers, blogs, demos ni repositorios adicionales específicos de este checkpoint; las búsquedas web realizadas devolvieron únicamente resultados no relacionados.
