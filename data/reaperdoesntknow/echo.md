# reaperdoesntknow/echo

## Resumen

**echo** es un checkpoint de investigación publicado por el usuario `reaperdoesntknow` bajo la arquitectura propietaria `TAMELM` (tipo `tamelm_two_axis`). Se trata de un modelo de generación de texto de aproximadamente 707 millones de parámetros totales (707.140.400 según los safetensors del repositorio), con 12 capas, dimensión de embedding de 1024 y una configuración de mezcla de expertos (MoE) de 4 expertos con top-k 2. El autor lo presenta explícitamente como un "modelo conceptual de investigación" que explora una configuración arquitectónica concreta, no como un modelo listo para producción.

La relevancia del checkpoint es fundamentalmente arquitectónica: implementa tres mecanismos poco habituales combinados en un mismo transformer —atención enrutada (*routed attention*), atención de profundidad (*depth attention*) y MoE sin descarte (*dropless MoE*)—, además de ofrecer backends alternativos (atención `flex` frente a `dense`, y GEMM agrupado con Triton). Esto lo convierte en un artefacto interesante para quien quiera estudiar variantes de atención y enrutamiento de expertos, pero no para quien busque un modelo con rendimiento validado.

La información publicada es deliberadamente escasa: no hay receta de entrenamiento, ni datos sobre el corpus, ni benchmarks, ni licencia declarada, ni idiomas soportados. El propio autor advierte que la model card documenta únicamente los artefactos del repositorio y que los nombres de la arquitectura "describen la implementación, no una capacidad de razonamiento demostrada". Cualquier evaluación de calidad debe realizarla el usuario por su cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parámetros totales | 707.140.400 |
| Parámetros activos | no disponible (MoE con 4 expertos y top-k 2; el autor no publica el recuento de parámetros activos) |
| Longitud de contexto | 1024 tokens (máximo configurado en `config.json`) |
| Tipos de cuantización | no disponible (el repositorio publica pesos en `float32`; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia a nivel de repositorio) |
| Formato de pesos | safetensors, con código custom (`modeling_tamelm.py`) y `auto_map` para `AutoConfig` y `AutoModelForCausalLM` |

Parámetros adicionales de configuración publicados: 16 cabezas de query, 4 cabezas key/value (GQA), dimensión oculta de experto 4096, modo de profundidad `attention` con dimensión 768, 8 cabezas de profundidad y 16 slots de profundidad, vocabulario de 49152 tokens, backend de atención `flex`, backend de experto `grouped`, `use_cache: false` y versión de Transformers registrada 5.5.0.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con dos ejes de procesamiento: el eje de secuencia habitual y un eje de "profundidad" gestionado por un módulo de atención de profundidad (8 cabezas, dimensión 768, 16 slots). La atención principal usa 16 cabezas de query con 4 cabezas key/value, lo que implica agrupación de cabezas (GQA) y reduce el coste de memoria del KV cache. La capa de alimentación hacia delante se sustituye por una mezcla de expertos con 4 expertos de dimensión oculta 4096 y enrutamiento top-2, en modalidad *dropless* (sin descarte de tokens, presumiblemente con capacidad de buffer ajustada o enrutamiento sin pérdida). El autor menciona "routed attention" como tercer mecanismo, aunque la model card no detalla su formulación matemática.

La implementación incluye alternativas densas de referencia y aceleración opcional mediante CUDA FlexAttention y GEMM agrupado con Triton. El export `echo` selecciona el backend `flex`; existe un export separado llamado `Echo_R` que selecciona `dense`, y el autor aclara explícitamente que esa diferencia de configuración "no establece un linaje de entrenamiento ni equivalencia entre sus pesos".

No se documenta nada sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones, ni duración, optimizador, hardware o criterios de selección de checkpoint. La model card afirma que el repositorio inspeccionado no contiene una receta de entrenamiento completa ni un informe de evaluación reproducible. Tampoco se confirma la precisión real usada en entrenamiento (el `float32` de la configuración es el dtype del export, no necesariamente el de entrenamiento).

## Capacidades

- Generación de texto autoregresiva estándar (pipeline `text-generation`).
- Soporte de atención con backend FlexAttention en CUDA y alternativa densa de referencia.
- Mezcla de expertos con enrutamiento top-2 sobre 4 expertos, con backend de GEMM agrupado opcional vía Triton.
- Atención de profundidad como mecanismo adicional de cómputo por token (16 slots, 8 cabezas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni lista de idiomas.
- No se documenta visión, audio, modo "thinking" ni ninguna modalidad distinta de texto.
- No se documenta ningún modo de decodificación especulativa ni optimización de inferencia más allá de los backends mencionados.
- `use_cache: false` en la configuración publicada, lo que implica que la generación no reutiliza KV cache por defecto y penaliza el throughput en secuencias largas.

## Casos de uso

- **Investigación de arquitecturas de atención**: el checkpoint permite reproducir y modificar los módulos de routed attention y depth attention en un modelo de 707 M de parámetros, un tamaño manejable para experimentos académicos con presupuesto limitado. Es su uso más directo y el único que el propio autor respalda.
- **Estudio de enrutamiento MoE dropless**: con 4 expertos y top-2, el modelo sirve para analizar el balanceo de carga entre expertos, la saturación de buffers y el comportamiento del enrutador sin descarte de tokens, comparando contra implementaciones densas de referencia incluidas en el propio repositorio.
- **Pruebas de backend FlexAttention frente a denso**: al existir dos exports (`echo` con `flex` y `Echo_R` con `dense`), se pueden comparar latencias y resultados numéricos entre ambos caminos de cómputo en el mismo hardware, útil para validar kernels personalizados.
- **Banco de pruebas de kernels Triton**: el backend `grouped` con GEMM agrupado permite medir el rendimiento de kernels Triton frente a alternativas densas en GPUs consumer, un caso habitual en equipos que desarrollan capas MoE propias.
- **Prototipado de investigación con código custom**: al usar `auto_map` y código propio (`modeling_tamelm.py`), el modelo se integra en flujos de experimentación con Transformers sin necesidad de reescribir el pipeline de carga, siempre que se fije una revisión concreta del repositorio.
- **Docencia sobre transformers no estándar**: el tamaño reducido (707 M de parámetros, 12 capas) y la presencia de tres mecanismos poco comunes lo hacen adecuado para explicar GQA, MoE y atención auxiliar en cursos avanzados, con la advertencia de que la calidad de salida no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción, y que el repositorio no contiene un informe de evaluación reproducible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en `float32` y 707 M de parámetros, el peso del modelo ocupa aproximadamente 2,8 GB. A ello hay que sumar el estado del optimizador si se entrena, las activaciones y, dado que `use_cache: false`, no hay KV cache persistente entre pasos. En la práctica, una GPU con 8 GB de VRAM debería poder cargar el modelo en fp32; con cuantización a 8 bits el peso bajaría a unos 0,7 GB, pero no se publican pesos cuantizados.
- **GPU recomendadas**: no hay recomendaciones del autor. Por tamaño, cualquier GPU con al menos 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) sería suficiente para inferencia en fp32; para entrenamiento o ajuste fino conviene una GPU con 24 GB o más (RTX 3090, RTX 4090, A100).
- **Compatibilidad con GPU consumer**: sí, en principio cabe en GPUs consumer de gama media-alta, aunque el backend `flex` requiere CUDA y FlexAttention, lo que limita la compatibilidad a GPUs NVIDIA con drivers y versiones de PyTorch recientes. El backend denso alternativo amplía la compatibilidad.
- **Opciones de despliegue**: Transformers con `trust_remote_code=True` y revisión fijada es la vía documentada. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni SGLang; al ser una arquitectura custom con `auto_map`, estos motores probablemente no la reconozcan sin adaptación.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones y advierte que no se ofrece ninguna garantía de inferencia independiente del hardware. La ausencia de KV cache (`use_cache: false`) sugiere un throughput bajo en generación de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **echo** (TAMELM) | 707 M | 1024 | no disponible | Hugging Face, código custom | Arquitectura experimental con routed attention, depth attention y MoE dropless; sin benchmarks |
| **Qwen2.5-0.5B** | 494 M | 32 768 | Apache 2.0 | Hugging Face, amplio ecosistema (vLLM, GGUF, Ollama) | Modelo denso convencional con evaluación publicada y soporte multilingüe |
| **SmolLM2-360M** | 362 M | 8192 | Apache 2.0 | Hugging Face, GGUF, llama.cpp | Modelo denso orientado a dispositivos de borde, con benchmarks publicados |
| **Pythia-410M** | 410 M | 2048 | Apache 2.0 | Hugging Face, EleutherAI | Modelo de investigación con receta de entrenamiento y checkpoints intermedios documentados |

La comparación es desigual por diseño: los tres alternativas son modelos densos convencionales con licencia permisiva, contexto mayor y evaluación publicada, mientras que `echo` es un artefacto de investigación sin licencia declarada, sin benchmarks y con contexto de solo 1024 tokens. La ventaja de `echo` es exclusivamente arquitectónica (mecanismos de atención y MoE poco comunes); en cualquier criterio de calidad medible o de facilidad de despliegue, los modelos de la comparativa son opciones más seguras.

## Limitaciones y advertencias

- **Sin licencia declarada**: el repositorio no incluye licencia a nivel de modelo. No se puede asumir uso comercial, redistribución ni modificación sin confirmar los términos con el propietario del repositorio. Cualquier despliegue en producción requiere aclarar esto primero.
- **Sin benchmarks ni evaluación reproducible**: no hay evidencia publicada de calidad de generación, razonamiento, código o matemáticas. El autor lo declara explícitamente.
- **Sin información de entrenamiento**: se desconocen el corpus, su licencia, el número de tokens, la precisión real de entrenamiento y si hubo ajuste por instrucciones o alineamiento. Esto impide evaluar sesgos, memorización o contaminación de datos.
- **Contexto muy corto**: 1024 tokens limita severamente casos de uso con documentos largos, conversaciones multi-turno extensas o código de tamaño medio.
- **Idiomas desconocidos**: no se declara lista de idiomas; el vocabulario de 49152 tokens es compatible con modelos multilingües, pero no hay confirmación de cobertura ni de calidad por idioma.
- **Riesgo de alucinación no mitigado**: sin evaluación ni alineamiento documentado, la probabilidad de salidas incorrectas, sesgadas o inseguras es alta y no está caracterizada.
- **Código custom con ejecución remota**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor. Debe revisarse `modeling_tamelm.py` antes de habilitarlo y fijarse una revisión concreta del repositorio para reproducibilidad.
- **Dependencias no fijadas**: la versión de Transformers registrada (5.5.0) es metadato de export, no un lockfile probado. La compatibilidad de backends (FlexAttention, Triton) depende del runtime, el hardware y los paquetes instalados.
- **Sin caché KV por defecto**: `use_cache: false` en la configuración publicada, lo que degrada el rendimiento en generación autoregresiva y puede sorprender a quien espere el comportamiento estándar de Transformers.
- **Sin receta de carga validada**: el autor indica que no se ha validado una receta de carga y generación de extremo a extremo para esta model card.
- **No apto para decisiones consecuentes**: la propia model card recomienda verificación independiente antes de usar la salida en aplicaciones con impacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/echo
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/echo/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/echo/blob/main/config.json
- Implementación custom del modelo: https://huggingface.co/reaperdoesntknow/echo/blob/main/modeling_tamelm.py
