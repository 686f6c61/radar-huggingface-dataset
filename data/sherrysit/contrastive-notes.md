# Sherrysit/contrastive-notes

## Resumen

`Sherrysit/contrastive-notes` es un repositorio experimental que contiene una implementación propia de una arquitectura tipo CLIP para aprendizaje contrastivo imagen-texto. Lo publica el usuario Sherrysit en HuggingFace bajo licencia BSD-3-Clause, con el objetivo declarado de servir como base inspeccionable antes de lanzar un entrenamiento completo: el propio autor indica que el `model.safetensors` incluido es un checkpoint de inicialización válido para pruebas de humo (*smoke tests*), no un modelo entrenado ni evaluado.

El dato más relevante para cualquier evaluador es su tamaño real: 33.088 parámetros según el fichero safetensors, lo que sitúa el repositorio en el orden de unas decenas de kilobytes de pesos. Esto contrasta con la etiqueta `scale: huge` que aparece en la model card, que debe interpretarse como una etiqueta de configuración de la arquitectura generada, no como el tamaño efectivo del modelo publicado. El repositorio ocupa 0,0 GB.

Por tanto, no es un modelo utilizable en producción ni en investigación comparativa: es material de partida (código, `config.json`, `training_args.json` y pesos inicializados) para quien quiera estudiar o modificar una arquitectura CLIP con atención dilatada, fusión *co-attention*, activación gelu-tanh y normalización por batchnorm. No hay pipeline declarado, no hay idiomas declarados y no hay ninguna métrica de rendimiento publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP (contrastivo imagen-texto); atención dilatada; fusión *co-attention*; activación gelu-tanh; normalización batchnorm |
| Parámetros totales | 33.088 (según safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) + código Python (`model.py`, `config.json`, `training_args.json`) |
| Etiqueta de escala declarada | `huge` (etiqueta de configuración; no coincide con el recuento real de parámetros) |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-17T22:56:47Z |

## Arquitectura y entrenamiento

La arquitectura es un CLIP bimodal con codificadores de imagen y texto y un objetivo contrastivo. Frente al CLIP original, la model card declara tres variaciones: atención dilatada (*dilated attention*) en lugar de atención densa estándar, fusión mediante *co-attention* entre modalidades y normalización por batchnorm en lugar de layernorm. La activación es gelu-tanh y la escala nominal de la configuración es `huge`. La implementación es propia y personalizada: el autor advierte explícitamente que las APIs genéricas de carga automática de HuggingFace (`AutoModel`, `from_pretrained` estándar) requieren un adaptador explícito para funcionar con estos pesos.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto (optimizador AdamW con *scheduler* coseno) en `training_args.json`, pero el autor subraya que son valores de partida del script y no evidencia de una ejecución completada. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO o ajuste por preferencias. No hay constancia de que el checkpoint haya sido entrenado en absoluto: es una inicialización.

## Capacidades

- No hay capacidades funcionales verificadas: el checkpoint es una inicialización no entrenada, por lo que no produce representaciones imagen-texto alineadas ni resultados significativos.
- El código soporta, a nivel estructural, el cálculo de embeddings de imagen y de texto y una función de pérdida contrastiva (se infiere de la etiqueta `contrastive` y del pipeline CLIP declarado).
- Atención dilatada y fusión *co-attention* implementadas en el código, disponibles para experimentación arquitectónica.
- Entrada de ejemplo ejecutable vía `python model.py --help` y bloque `__main__` con una prueba de humo generada.
- No se declara soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, modo *thinking*, visión, audio ni capacidades multilingües.
- No se declara ningún conjunto de idiomas soportados.

## Casos de uso

- Estudio de arquitecturas CLIP alternativas: el repositorio permite inspeccionar cómo se implementan atención dilatada y *co-attention* en un codificador bimodal antes de invertir cómputo en un entrenamiento completo, gracias a que el código y la configuración son legibles y de tamaño reducido.
- Pruebas de humo de pipelines de entrenamiento: `model.safetensors` sirve para verificar que un *script* de carga, *forward pass* y cálculo de pérdida funciona de extremo a extremo sin esperar a tener pesos entrenados.
- Punto de partida para *fine-tuning* o entrenamiento desde cero: al estar inicializado y ser un modelo de 33.088 parámetros, se puede reentrenar en CPU o en una GPU consumer en minutos, lo que lo hace útil como banco de pruebas de recetas (AdamW + coseno) antes de escalar.
- Docencia y formación en aprendizaje contrastivo: el código y la configuración permiten explicar paso a paso cómo se construye un CLIP, qué hace la fusión *co-attention* y cómo se define el objetivo contrastivo, sin la opacidad de un checkpoint de cientos de millones de parámetros.
- Referencia para comparativas con presupuesto igualado: la model card propone evaluar con un conjunto de validación específico de la tarea, al menos tres semillas y una línea base de capacidad equiparable; el repositorio proporciona la receta base para montar ese experimento.
- Integración en investigación sobre retrieval multimodal: quien necesite probar variantes de atención o normalización en un sistema de búsqueda imagen-texto puede modificar este código y medir el efecto antes de trasladar los cambios a un modelo grande.
- Verificación de infraestructura de despliegue: al pesar menos de 1 MB, permite validar *scripts* de carga en PyTorch, conversión de formatos y contenedores de inferencia sin consumir VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado, por lo que cualquier métrica (MMLU, HumanEval, GSM8K, recall@k, zero-shot top-1) carecería de sentido sobre estos pesos.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Con 33.088 parámetros, los pesos ocupan aproximadamente 132 KB en fp32, 66 KB en fp16 y 33 KB en int8; el cuello de botella sería el tamaño de las activaciones, que depende de una configuración de entrada no publicada.
- GPU recomendadas: cualquiera, incluida una GPU integrada o CPU. No requiere A100, H100 ni RTX 4090; ejecutarlo en esos aceleradores no aporta ninguna ventaja medible.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) y en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: ejecución directa con PyTorch mediante `model.py`; vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no hay pipeline generativo ni formato compatible publicado. La carga con APIs automáticas de HuggingFace requiere un adaptador explícito según el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones y, al no estar entrenado, no serían representativas de un uso real.

## Comparativa con modelos similares

Las cifras de los modelos de referencia son aproximadas y de conocimiento público general, no verificadas en la información proporcionada; se incluyen solo para contextualizar el orden de magnitud.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sherrysit/contrastive-notes | 33.088 | no disponible | sin benchmarks (checkpoint sin entrenar) | BSD-3-Clause | HuggingFace, 0 descargas |
| OpenAI CLIP ViT-B/32 | ~151 M | 77 tokens de texto; imagen 224×224 | métricas zero-shot publicadas por OpenAI | MIT | pesos ampliamente disponibles |
| OpenCLIP ViT-B-32 | ~151 M | 77 tokens; imagen 224×224 | reproducción de CLIP con variantes de datos | MIT / Apache-2.0 según checkpoint | HuggingFace, múltiples checkpoints |
| SigLIP base (patch16-224) | ~203 M | sin *softmax* global; contexto corto | métricas publicadas por Google | Apache-2.0 | HuggingFace |

La comparación relevante no es de rendimiento sino de naturaleza del artefacto: los tres modelos de referencia son checkpoints entrenados y evaluados, mientras que `contrastive-notes` es un esqueleto de código con pesos inicializados tres o cuatro órdenes de magnitud más pequeños.

## Limitaciones y advertencias

- Checkpoint de inicialización no entrenado: las salidas no tienen significado semántico; no debe usarse para ninguna tarea de clasificación, *retrieval* o generación de embeddings.
- No auditado para robustez, equidad, sesgo ni transferencia de dominio, tal como reconoce el autor.
- Discrepancia de metadatos: la etiqueta `scale: huge` no concuerda con los 33.088 parámetros reales del safetensors; conviene tratarla como parámetro de configuración del generador de arquitectura.
- Ausencia total de benchmarks y de registro de entrenamiento, lo que impide cualquier comparación cuantitativa.
- Idiomas no declarados: no hay evidencia de cobertura multilingüe.
- Integración no estándar: al ser una implementación propia, `AutoModel`/`from_pretrained` no funcionan sin un adaptador explícito, lo que rompe la compatibilidad con ecosistemas como vLLM o TGI.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright, incluir la licencia y no usar el nombre del autor para promocionar derivados sin permiso; los términos de los datos de origen deben revisarse por separado si se entrena con datasets externos.
- Metadatos temporales anómalos: las fechas de creación y actualización (2026-10-17) son posteriores a la fecha habitual de consulta; conviene verificarlas en el repositorio.
- Sin garantía alguna para producción: no hay versionado semántico, tests ni soporte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Sherrysit/contrastive-notes
- Papers, blogs, repositorios adicionales o demos: no disponibles en la información proporcionada.
