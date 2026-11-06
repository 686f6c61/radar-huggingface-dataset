# myendless/action-repre-hygon-real6-rawvlm-eef20-h50-head10k-da16e0cc

## Resumen

El modelo `myendless/action-repre-hygon-real6-rawvlm-eef20-h50-head10k-da16e0cc` es un checkpoint de investigación para robótica que combina un VLM congelado (Qwen3-VL-4B-Instruct) con un módulo experto de acción y representación entrenado desde cero durante 10.000 pasos sobre 900 demostraciones reales de seis tareas. Lo publica el usuario `myendless` dentro de un proyecto denominado Action Representation Benchmark y está orientado a la preparación de evaluaciones en robot real con espacio de efector final de 20 dimensiones y horizonte de 50 pasos (EEF20/H50).

El interés del modelo es acotado y experimental: no es un modelo conversacional ni un VLM utilizable con Transformers, sino un `state_dict` completo de PyTorch que debe cargarse con el cargador nativo del benchmark. El autor advierte explícitamente de que no se trata de un modelo cerrado para RoboTwin joint14/H32 y de que el mapeo de coordenadas para despliegue aún no está validado. Es relevante ahora como artefacto reproducible de investigación en políticas visomotoras, no como componente listo para producción.

La información disponible es escasa y mayoritariamente procede de la model card y de los metadatos de Hugging Face. No hay resultados de benchmarks, ni licencia declarada, ni validación de éxito en bucle cerrado para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer congelado (Qwen3-VL-4B-Instruct) + experto de acción/representación entrenado desde cero |
| Parametros totales | no disponible (derivados del base Qwen3-VL-4B; cifra exacta no publicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen3-VL-4B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo de PyTorch), no es un directorio Transformers AutoModel |

## Arquitectura y entrenamiento

La arquitectura mantiene el backbone VLM de Qwen3-VL-4B-Instruct en estado congelado y añade un experto de acción y representación entrenado de forma completa ("fresh") durante 10.000 pasos. El entrenamiento se realizó sobre 900 demostraciones de robot real que cubren seis tareas, bajo el identificador de origen `real6_raw_vlm_fresh_head_eef20_h50_b64_20261105_queue1`. El espacio de acción es EEF20 (efector final, 20 dimensiones) con horizonte H50 (50 pasos). El loss final de entrenamiento reportado es 0,012005031108856201.

El release incluye configuración, processor, manifest, normalización, protocolo de congelación y evidencias de entrenamiento, con hashes de protocolo (`6a50356ea9fd481f0fa41d0edd0784b6c551429f0de67c9f0e6e31a8c5fa71a8`) y de checkpoint (`da16e0cc6713cf0c4ce69f1f0047e99521d467371227f6a9421af956ec92e307`). No se subieron imágenes ni vídeos originales, optimizadores ni checkpoints intermedios. Las 900 demostraciones se usaron íntegramente en entrenamiento, sin partición de validación ni de test, lo que impide medir generalización con este artefacto. La normalización no debe reajustarse y las rutas absolutas históricas deben mapearse explícitamente; la identidad del código se rige por `provenance/protocol.json`, no por el árbol de trabajo actual.

## Capacidades

- Ejecución de políticas visomotoras para seis tareas de manipulación en robot real, con salida de acciones en espacio EEF20 y horizonte H50.
- Procesamiento de entrada visual y textual a través del VLM congelado Qwen3-VL-4B-Instruct (capacidades multimodales heredadas del base, no reentrenadas).
- Representación de acciones y predicción de trayectorias de efector final mediante el experto entrenado.
- Soporte de idiomas zh y en, heredado del modelo base.
- Integración con el cargador nativo de Action Representation Benchmark mediante `model.pt`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni otras capacidades adicionales.

## Casos de uso

- Evaluación reproducible en robot real: el checkpoint está preparado para entrar en la fase de evaluación EEF20/H50, cargándolo con el loader nativo del benchmark y aplicando el mapeo de coordenadas pendiente de validar.
- Reproducción de experimentos de investigación: los hashes de protocolo y checkpoint permiten replicar exactamente el entrenamiento y comparar resultados entre variantes de experto de acción.
- Estudio de congelación de VLM en robótica: sirve para analizar cuánto rendimiento aporta un experto entrenado desde cero sobre un backbone VLM congelado en tareas de manipulación.
- Benchmarking de representaciones de acción: al formar parte de Action Representation Benchmark, se puede usar como línea base frente a otras representaciones (joint, EEF, horizonte distinto) bajo el mismo protocolo.
- Análisis de sobreajuste en demostraciones escasas: con 900 episodios sin split de validación, es útil para estudiar el comportamiento de políticas entrenadas con datos limitados y su transferencia al robot real.
- Desarrollo de pipelines de despliegue robótico: el paquete incluye configuración, processor, manifest y normalización, lo que facilita integrarlo en un stack de inferencia robótica propio, siempre que se respete la normalización fija y el mapeo de rutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha generado una tasa de éxito en bucle cerrado para este checkpoint y que el loss de entrenamiento (0,012) no representa la tasa de éxito de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 11,3 GB e incluye el state_dict completo del VLM más el experto; una estimación orientativa para FP16 sería de al menos 8-10 GB solo para pesos, más memoria de activaciones y del processor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del backbone (Qwen3-VL-4B), cabría en GPUs con 16-24 GB de VRAM en precisión reducida, aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) o RTX A6000, pero no está verificado ni documentado.
- Opciones de despliegue: cargador nativo de Action Representation Benchmark con `model.pt`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual, al no ser un directorio Transformers AutoModel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| action-repre-hygon-real6-rawvlm-eef20-h50-head10k | no disponible (base 4B) | no disponible | Política visomotora EEF20/H50 | no disponible | `model.pt` (state_dict) |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | safetensors / Transformers |
| Otras variantes de Action Representation Benchmark | no disponible | no disponible | Políticas robóticas (joint14/H32, etc.) | no disponible | `model.pt` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo cerrado validado: no existe tasa de éxito en bucle cerrado para este checkpoint y el loss de entrenamiento no es indicativo de rendimiento de control.
- El mapeo de coordenadas para despliegue en robot real aún no está validado; el autor lo señala como paso pendiente antes de la evaluación EEF20/H50.
- No es un modelo RoboTwin joint14/H32; no debe usarse como sustituto de esas variantes.
- Entrenado con las 900 demostraciones completas, sin split de validación ni de test: riesgo alto de sobreajuste y ausencia de métricas de generalización.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas limitados a zh y en; no se documenta soporte de castellano.
- Formato no estándar (`model.pt`): no funciona con pipelines Transformers habituales, lo que limita su integración y herramientas de cuantización.
- La normalización no debe reajustarse y las rutas absolutas históricas deben mapearse explícitamente; ignorar esto invalida los resultados.
- Riesgo de alucinación y sesgos del VLM base no evaluados en este checkpoint; el experto de acción puede producir trayectorias inválidas fuera de la distribución de las seis tareas entrenadas.
- Sin imágenes ni vídeos originales en el repo: no es posible auditar visualmente los datos de entrenamiento desde el artefacto publicado.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-hygon-real6-rawvlm-eef20-h50-head10k-da16e0cc
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Action Representation Benchmark: no disponible (no se proporciona URL en la información)
- Paper, blog, repositorio o demo: no disponible
