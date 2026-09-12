# etiennebamas/qwen3-8b-classic-self-distill

## Resumen

etiennebamas/qwen3-8b-classic-self-distill es un ajuste fino completo (full fine-tuning) del modelo VladShash/qwen3-8b-classic-one-shot, que a su vez deriva de la familia Qwen3 de 8B parámetros. El repositorio contiene 8.190.735.360 parámetros en formato safetensors (16,4 GB de peso total) y se distribuye a través de la librería transformers con pipeline de text-generation. El entrenamiento se realizó con llama-factory sobre un dataset denominado lean_selfdistill_r1_train, siguiendo una estrategia de autodestilación (self-distillation) en una sola época.

El modelo se publica como un experimento de investigación más que como un producto listo para producción: la model card es la plantilla autogenerada por el Trainer de HuggingFace y no incluye descripción del modelo, datos de evaluación ni resultados de benchmarks (el bloque model-index contiene una lista de resultados vacía). No se declaran idiomas soportados ni se especifican los términos concretos de la licencia, que aparece únicamente como "other".

Su relevancia actual es limitada pero informativa: ilustra un flujo de trabajo de ajuste completo multi-GPU a tasa de aprendizaje muy baja (2e-6) sobre 8 dispositivos, con destino a reproducir razonamiento tipo R1 mediante autodestilización. Para un desarrollador que evalúe modelos, el interés principal está en el pipeline de entrenamiento documentado y en la trazabilidad hacia el modelo base, no en prestaciones verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Qwen3-8B; sin detalles adicionales en la informacion disponible) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio; al ser safetensors en transformers se pueden aplicar cuantizaciones posteriores (int8, int4) con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | other (terminos concretos no especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta qwen3 y del nombre qwen3-8b, por lo que cabe asumir la topologia decoder-only de la familia Qwen3-8B, aunque no se confirman en la model card el numero de capas, la dimension oculta, el tipo de atencion ni la ventana de contexto efectiva. El tag conversational indica que el modelo se ha ajustado sobre datos en formato de dialogo, y el tag full que el ajuste afecto a todos los pesos, no a un adaptador LoRA.

El procedimiento de entrenamiento si esta documentado en detalle: learning rate de 2e-6, batch de entrenamiento de 1 por dispositivo con 8 dispositivos (batch total de 8), batch de evaluacion de 8 por dispositivo (64 total), semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 3 por ciento y una sola epoca sobre el dataset lean_selfdistill_r1_train. El entrenamiento se ejecuto en configuracion multi-GPU con Transformers 4.57.3, PyTorch 2.9.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. La seccion "Training results" de la model card esta vacia. No se documentan fases de RLHF, DPO ni preference tuning, ni la composicion del dataset de autodestilacion.

## Capacidades

- Generacion de texto conversacional: el tag conversational y el ajuste sobre datos de dialogo apuntan a un uso como asistente multi-turno, aunque no hay ejemplos ni evaluaciones publicadas.
- Razonamiento tipo R1 por autodestilacion: el nombre del experimento (selfdistill-r1) sugiere entrenamiento con trazas de razonamiento generadas por un modelo profesor, pero no hay evidencia verificable en el repositorio.
- Ajuste completo de pesos: al ser un fine-tuning full sobre Qwen3-8B, conserva la arquitectura y la tokenizacion del modelo base.
- Compatibilidad con text-generation-inference y endpoints: los tags endpoints_compatible y text-generation-inference indican que el modelo puede desplegarse en infraestructura compatible con la API de HuggingFace.
- Tool calling / function calling: no declarado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no declaradas.
- Vision, audio o modo thinking explicito: no declarados.
- Capacidades multilingues: no disponibles; no se especifica lista de idiomas.

## Casos de uso

- Investigacion sobre autodestilacion: el modelo sirve como punto de partida reproducible para estudiar como se comporta un ajuste completo de Qwen3-8B sobre datos autogenerados, comparando contra el modelo base VladShash/qwen3-8b-classic-one-shot con los mismos prompts.
- Experimentos de ajuste con llama-factory: los hiperparametros documentados (lr 2e-6, una epoca, ADAMW fused, 8 GPUs) permiten replicar el pipeline en entornos de investigacion con infraestructura similar.
- Generacion de dialogos sinteticos: se puede usar para producir conversaciones de entrenamiento adicionales en un ciclo de destilacion, dado que ya ha sido entrenado con ese tipo de datos.
- Punto de control intermedio para posteriores ajustes: al ser un full fine-tune en safetensors, es un candidato razonable para aplicar SFT adicional, DPO o cuantizacion con llama.cpp sin partir del modelo original.
- Evaluacion comparativa de checkpoints derivados de Qwen3: util para lanzar baterias internas de prompts y medir si la autodestilizacion introduce regresiones frente al modelo base en tareas de conocimiento general.
- Despliegue en entornos compatibles con TGI: gracias al tag endpoints_compatible, se puede servir mediante text-generation-inference para pruebas de latencia y throughput en un cluster propio.
- Base para prototipos conversacionales de bajo presupuesto: un modelo de 8B en cuantizacion int4 cabe en GPUs de consumo, lo que permite validar interfaces de chat antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bloque model-index de la model card declara el nombre qwen3-cpt-lean-sft-feedback-selfdistill-r1 con una lista de resultados vacia, y la seccion "Training results" del entrenamiento tampoco incluye metricas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni de comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: alrededor de 16,4 GB solo de pesos, mas la cache KV; en la practica se necesitan 20-24 GB o mas segun la longitud de contexto.
- VRAM estimada en int8: aproximadamente 9-10 GB de pesos.
- VRAM estimada en int4: aproximadamente 5-6 GB de pesos, con perdida de calidad no medida en este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servir en precision completa con contextos largos; RTX 4090 (24 GB) para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 en cuantizacion int4, y en RTX 4090/3090 en bf16 con contexto reducido.
- Opciones de despliegue: transformers, text-generation-inference y vLLM (tags de compatibilidad); llama.cpp u Ollama requeririan convertir los pesos safetensors a GGUF, conversion no proporcionada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| etiennebamas/qwen3-8b-classic-self-distill | 8,19 B | No disponible | other (terminos sin especificar) | Repositorio HuggingFace con 0 descargas y 0 likes |
| VladShash/qwen3-8b-classic-one-shot (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Repositorio HuggingFace publico |
| Qwen3-8B (familia original) | Aproximadamente 8,2 B | 32.768 tokens nativos, ampliable (dato de la ficha publica del modelo original) | Apache 2.0 (segun la ficha publica del modelo original) | Ampliamente distribuido en HuggingFace |
| Llama 3.1 8B Instruct | Aproximadamente 8,03 B | 128.000 tokens (dato de la ficha publica) | Llama 3.1 Community License | Ampliamente distribuido |
| Mistral 7B Instruct | Aproximadamente 7,24 B | 32.000 tokens (dato de la ficha publica) | Apache 2.0 | Ampliamente distribuido |

Nota: los datos de contexto y licencia de Qwen3-8B, Llama 3.1 8B y Mistral 7B provienen de sus fichas publicas y no de la informacion proporcionada sobre este modelo concreto. No hay datos de rendimiento comparativo disponibles para este checkpoint.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas de perdida ni resultados de validacion publicados, por lo que su calidad real es desconocida.
- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento contienen la plantilla autogenerada sin rellenar.
- Licencia ambigua: figura como "other" sin texto de licencia explicito, lo que impide determinar si se permite uso comercial. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede asumir soporte multilingue ni monolingue sin pruebas propias.
- Contexto no declarado: se desconoce la ventana efectiva tras el ajuste, un factor critico para aplicaciones de contexto largo.
- Riesgo de alucinacion: inherente a cualquier modelo de 8B ajustado con datos autogenerados; la autodestilizacion puede amplificar errores sistematicos del profesor si el dataset contiene trazas incorrectas.
- Sesgos: no se documenta ninguna auditoria de sesgos ni la composicion del dataset lean_selfdistill_r1_train, por lo que no se pueden acotar sesgos de genero, idioma o dominio.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan validar el comportamiento en produccion.
- Sin pesos cuantizados oficiales: cualquier uso en GPU de consumo exige una conversion y validacion propias.
- Fecha de creacion y actualizacion del repositorio muy proximas (11 de septiembre de 2026), sin historial posterior de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/etiennebamas/qwen3-8b-classic-self-distill
- Modelo base: https://huggingface.co/VladShash/qwen3-8b-classic-one-shot
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
