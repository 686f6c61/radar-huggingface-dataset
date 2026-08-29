# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-125000

## Resumen

El modelo `Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-125000` es un modelo de borrador (draft model) diseñado para decodificación especulativa EAGLE3, desarrollado por el usuario huluhuluu mediante la herramienta SpecForge. Su función no es generar texto de forma autónoma, sino acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` proponiendo secuencias de tokens plausibles que el modelo grande verifica en paralelo, reduciendo así la latencia de generación.

Se trata de un modelo extremadamente ligero: apenas 202,7 millones de parámetros (frente a los 4.000 millones del modelo base), con una única capa decoder, dimensión oculta de 2560 y atención causal con ventana deslizante de 512 tokens. El entrenamiento se realizó de forma online (online EAGLE3) sobre datos ShareGPT limpios, durante 10 épocas y 231.810 pasos de optimización, con una longitud máxima de secuencia de 2048 tokens.

La relevancia de este modelo radica en su capacidad para reducir el coste computacional y la latencia de despliegues de Qwen3-4B-Instruct-2507 en entornos de producción, especialmente cuando se sirve con SGLang. Al ser un draft model de tamaño reducido, puede ejecutarse en paralelo al modelo principal sin incrementar significativamente los requisitos de VRAM. Sin embargo, no es un modelo de chat independiente y solo tiene sentido utilizarlo emparejado con su modelo objetivo exacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, atención deslizante causal) |
| Parametros totales | 202.700.416 (~203M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana deslizante de 512 tokens (máx. secuencia de entrenamiento: 2048) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 con safetensors) |
| Idiomas soportados | No disponible (hereda del modelo base Qwen3-4B-Instruct-2507, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, un método de decodificación especulativa en el que un modelo de borrador pequeño predice tokens basándose en las representaciones ocultas del modelo objetivo. Concretamente, `LlamaForCausalLMEagle3` contiene una única capa decoder con hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936, lo que requiere un mapeo entre ambos espacios.

El entrenamiento se realizó de forma online (no offline) con SpecForge, un framework para entrenar draft models EAGLE3. Los datos utilizados fueron un dataset ShareGPT en formato JSONL limpio, sin registro de revisión exacta. Se emplearon 10 épocas, 231.810 pasos de optimización, batch efectivo de 4 (data-parallel size 4, sin acumulación de gradientes), learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0 y max grad norm 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una ventana deslizante de 512 tokens para el draft y una longitud de TTT (test-time training) de 7. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado para la tarea de drafting.

## Capacidades

- Generación especulativa de tokens: el modelo propone secuencias de tokens que el modelo objetivo verifica, acelerando la inferencia entre 1,5x y 3x según la carga de trabajo.
- Compatibilidad exclusiva con `Qwen/Qwen3-4B-Instruct-2507`: solo funciona como draft model para este modelo objetivo exacto, no para otras variantes de Qwen3.
- Integración con SGLang: el autor indica que debe usarse como ruta de borrador especulativo (speculative draft path) con el backend SGLang y flashinfer.
- Capacidades lingüísticas heredadas: al ser un draft model, no tiene capacidades propias de generación, razonamiento, tool calling, agentes o visión. Su única función es proponer tokens probables.
- Soporte de atención con ventana deslizante de 512 tokens, lo que limita la longitud del borrador propuesto.

## Casos de uso

- Servicio de chat en tiempo real con baja latencia: en un despliegue de Qwen3-4B-Instruct-2507 con SGLang, este draft model reduce el tiempo de primer token y el tiempo entre tokens, mejorando la experiencia de usuarios finales en aplicaciones conversacionales.
- Optimización de costes por token generado: al reducir el número de pasos de forward del modelo grande, se disminuye el consumo de cómputo por petición, lo que abarata el servicio en infraestructura propia o en la nube.
- Despliegue en hardware limitado: con solo ~203M de parámetros, el draft model puede residir en la misma GPU que el modelo base sin necesidad de memoria adicional significativa, permitiendo ejecutar Qwen3-4B en GPUs consumer de 8-12 GB VRAM con mejor throughput.
- Investigación en decodificación especulativa: los 47 checkpoints publicados (desde epoch_0_step_5000 hasta epoch_9_step_231810) permiten estudiar la evolución del entrenamiento online y el efecto de la ventana deslizante en la calidad del draft.
- Evaluación de configuraciones de árbol de especulación: los usuarios pueden ajustar los parámetros de árbol de SGLang (tree settings) utilizando este draft model para encontrar el equilibrio óptimo entre tasa de aceptación y coste computacional.
- Entrenamiento continuo de draft models: el archivo `training_state.pt` incluido en cada checkpoint permite reanudar el entrenamiento desde un estado concreto, útil para experimentos de fine-tuning adicional sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que "no se registraron métricas de evaluación ni de seguridad para esta ejecución" (no evaluation or safety metrics were recorded for this run). No se dispone de datos sobre tasa de aceptación de tokens, speedup medido ni comparación con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202,7M parámetros a 2 bytes por parámetro), más overhead del runtime. Cabe en cualquier GPU con 2 GB o más de VRAM libre.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1080, RTX 3060, RTX 4090, etc.) o GPU de datacenter (A10, A100, H100). Al ser un modelo auxiliar, se ejecuta junto al modelo base Qwen3-4B, por lo que la VRAM total necesaria será la suma de ambos.
- Despliegue con SGLang: el autor especifica el backend SGLang con flashinfer como destino principal. También podría integrarse en otros frameworks que soporten EAGLE3 (p. ej., vLLM experimental), aunque no se documenta.
- Latencia y throughput estimados: no disponibles. Dependen de la configuración del árbol de especulación, la tasa de aceptación y el hardware subyacente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (draft models EAGLE3 para Qwen3-4B-Instruct-2507). El autor no proporciona comparativas con otras alternativas, y no se han encontrado en la búsqueda web. Se recomienda evaluar este modelo frente a otros draft models genéricos (p. ej., los incluidos en librerías como Medusa o EAGLE) en el contexto específico de Qwen3-4B, pero no hay datos públicos disponibles.

## Limitaciones y advertencias

- No es un modelo de chat independiente: intentar usarlo como generador de texto standalone producirá resultados sin sentido. Debe emparejarse estrictamente con `Qwen/Qwen3-4B-Instruct-2507`.
- Ventana deslizante de 512 tokens: el draft model solo puede proponer secuencias de hasta 512 tokens de contexto, lo que limita la especulación en conversaciones muy largas o documentos extensos.
- Sobreajuste potencial a ShareGPT: el entrenamiento se realizó únicamente sobre datos ShareGPT, por lo que el draft model puede tener un rendimiento subóptimo en dominios muy diferentes (código, matemáticas, documentos técnicos).
- Sin métricas de evaluación ni seguridad: el autor no registró ningún benchmark, tasa de aceptación ni evaluación de sesgos o alucinaciones. No se puede garantizar la calidad del draft en producción sin pruebas propias.
- Dependencia de la versión de SGLang: la compatibilidad con EAGLE3 depende de la versión de SGLang utilizada; es posible que versiones antiguas o futuras no soporten este formato.
- Archivo `training_state.pt`: contiene estado del optimizador y argumentos de entrenamiento. Solo debe deserializarse en un entorno de confianza, ya que podría contener código ejecutable.
- Riesgo de alucinación y sesgos: aunque es un draft model, los tokens que propone pueden reflejar sesgos presentes en ShareGPT; el modelo objetivo final es responsable de la salida, pero el draft puede influir en la distribución de tokens generados.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-5-step-125000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Colección de checkpoints (referenciada en la model card, sin URL directa): se accede desde el perfil del autor huluhuluu en HuggingFace.
- Información sobre el modelo base (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
