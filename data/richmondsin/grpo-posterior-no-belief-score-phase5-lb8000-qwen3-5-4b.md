# richmondsin/grpo-posterior-no-belief-score-phase5-lb8000-qwen3.5-4b

## Resumen

`grpo-posterior-no-belief-score-phase5-lb8000-qwen3.5-4b` es un modelo multimodal de tipo image-text-to-text publicado por el usuario richmondsin en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B, en el que se ha integrado (merge) un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El resultado es un checkpoint completo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) distribuidos en safetensors, con un tamaño de repositorio de 9,3 GB.

El modelo se enmarca en una línea de experimentación denominada "posterior-learning" y forma parte de una ablación concreta: la fase 5 de una serie de entrenamientos con un presupuesto de longitud (`length_budget`) de 8000 tokens y una recompensa de longitud (`length_reward`) de 1. El nombre indica que en esta variante se elimina la recompensa de "belief score" (puntuación de creencia), manteniendo únicamente la línea de creencia sin puntuación asociada. Es, por tanto, un artefacto de investigación más que un modelo de producción pulido.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón habitual de publicación de checkpoints intermedios de experimentos de RL sobre modelos multimodales pequeños, con documentación técnica detallada del proceso de merge (regla de fusión, módulos afectados, verificación de integridad) pero sin información sobre licencia, idiomas, benchmarks o datos de entrenamiento. El modelo hereda la arquitectura y capacidades del Qwen3.5-4B, aunque no se dispone de confirmación independiente de su rendimiento tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el `length_budget` 8000 del entrenamiento no equivale necesariamente al contexto máximo del modelo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), mas archivos de configuracion, tokenizer, chat template y processor del modelo base |
| Modelo base | Qwen/Qwen3.5-4B |
| Tipo de ajuste | Merge de adaptador LoRA (r=16, alpha=32) entrenado con GRPO |
| Tamano del repositorio | 9,3 GB |
| Modulos fusionados | 200 modulos LoRA; el resto de tensores byte-identicos al base |

## Arquitectura y entrenamiento

El modelo es un checkpoint completo obtenido al fusionar un adaptador LoRA sobre Qwen/Qwen3.5-4B. La regla de fusión aplicada es `W <- W + (lora_alpha / r) * B @ A`, con `r = 16` y `lora_alpha = 32`, lo que da un factor de escala de 2,0. El cálculo se realizó en fp32 y el resultado se almacenó en bf16. Se fusionaron 200 módulos LoRA; el resto de tensores del checkpoint son byte-idénticos al modelo base (9319737856 bytes en total, según el informe de merge `MERGE-REPORT.json`). Los archivos no relacionados con pesos (configuración, tokenizer, chat template, configuración del processor y de generación) se copiaron sin cambios desde el base.

El entrenamiento del adaptador se realizó con GRPO (Group Relative Policy Optimization), un algoritmo de RL sin modelo crítico que optimiza recompensas relativas dentro de grupos de muestras. La configuración descrita corresponde a una ablación concreta: fase 5, `phase_set 240`, `set_keep 160`, `length_budget 8000`, `length_reward 1`, `beta_decay 0.9856` y `update 50`. El nombre del modelo indica que se eliminó la recompensa de "belief score" (`line_score none: no belief reward`), manteniendo la línea de creencia sin puntuación. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas previas de SFT o DPO. Tampoco se detalla ninguna innovación arquitectónica más allá del ajuste por RL; la arquitectura subyacente es la del Qwen3.5-4B, cuyos pormenores no se reproducen en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que permite entrada multimodal con imágenes acompañadas de instrucciones textuales.
- Ajuste orientado a tareas con recompensa de longitud: el entrenamiento con `length_budget 8000` y `length_reward 1` sugiere una optimización del control de longitud de las respuestas, aunque no se documenta el efecto final.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (probablemente heredado del base, pero sin confirmación).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles; el pipeline declarado es únicamente image-text-to-text.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a modelos multimodales: el checkpoint sirve como punto de comparación en ablaciones de GRPO, concretamente para estudiar el efecto de eliminar la recompensa de "belief score" manteniendo la línea de creencia. Es adecuado porque el repositorio documenta la configuración exacta del experimento y el proceso de merge.
- Reproducción de experimentos de merge de LoRA: dado que se especifica la regla de fusión, el factor de escala y la verificación de integridad (`MERGE-REPORT.json`), el modelo permite validar pipelines de merge en fp32/bf16 con 200 módulos.
- Evaluación de control de longitud en generación: el entrenamiento con `length_budget 8000` y `length_reward 1` lo hace útil para estudiar si el ajuste por RL modifica la distribución de longitudes de respuesta frente al base Qwen3.5-4B.
- Prototipado de asistentes multimodales en entornos de investigación: al ser un modelo de 4,66 B en bf16, puede desplegarse en una GPU de 24 GB (por ejemplo, RTX 4090) para pruebas de concepto con entrada de imagen y texto, siempre que se acepte la falta de garantías de licencia.
- Comparación de checkpoints intermedios en una curva de entrenamiento: al tratarse de la "fase 5" de una serie, permite analizar la evolución del comportamiento a lo largo de las fases del experimento.
- Estudio de sesgos inducidos por RL: la ausencia de recompensa de creencia en esta ablación permite comparar si el modelo desarrolla patrones de respuesta distintos (por ejemplo, mayor o menor calibración) respecto a variantes con dicha recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones, KV cache y procesador de imagen; en la práctica se recomienda al menos 16-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,7 GB para pesos; en 4 bits, alrededor de 2,4 GB. No obstante, el repositorio no publica variantes cuantizadas, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: para bf16 sin cuantizar, A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) con margen ajustado. Para cuantización 4/8 bits, RTX 3090/4090, RTX A6000 o incluso GPUs de 16 GB.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en una RTX 4090 de 24 GB para contextos cortos; en cuantización 4 bits podría caber en GPUs de 12-16 GB.
- Opciones de despliegue: al ser un modelo `transformers` con pipeline `image-text-to-text`, es compatible con el ecosistema Hugging Face (Transformers, TGI si el processor lo permite). Para llama.cpp/Ollama sería necesario convertir a GGUF, lo cual no está publicado. vLLM requeriría soporte del modelo multimodal concreto, no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grpo-posterior-no-belief-score-phase5-lb8000-qwen3.5-4b | 4,66 B | no disponible | no disponible | safetensors (bf16) | Checkpoint de investigación con LoRA fusionado vía GRPO; sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo original multimodal; referencia directa del ajuste |
| Alternativas de ~4 B multimodales (p. ej., familia Qwen-VL o similares) | ~4 B | variable según modelo | variable | safetensors | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas. La comparación disponible se limita a parámetros y formato.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de Qwen/Qwen3.5-4B, la licencia efectiva probablemente esté condicionada por la del modelo base, pero debe verificarse antes de cualquier uso en producción.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluación de calidad por idioma.
- Sin benchmarks: no existen métricas publicadas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que el rendimiento real tras el ajuste GRPO es desconocido.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se ha caracterizado en esta variante.
- Sesgos: no documentados; el ajuste por RL con una recompensa de longitud podría introducir sesgos hacia respuestas más largas o más cortas según la configuración, sin evaluación disponible.
- Checkpoint de investigación: el nombre indica una ablación de fase 5 dentro de una serie experimental; no está pensado como modelo de producción ni ha pasado un proceso de alineación y evaluación estándar.
- Diferencias por el merge en bf16: el autor advierte que las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecución, debido al redondeo bf16.
- Contexto: el `length_budget 8000` corresponde al entrenamiento, no necesariamente a la ventana de contexto máxima del modelo; no se especifica esta última.
- Soporte de tool calling y agentes no confirmado: aunque el base podría soportarlo, no se documenta en esta ficha.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-no-belief-score-phase5-lb8000-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- README del base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de merge: `MERGE-REPORT.json` (referenciado en la model card)
- Paper de GRPO: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
