# fdsffjdkf/ClearTrans-3B-SFT-C-to-Go

## Resumen

ClearTrans 3B SFT C-to-Go es un checkpoint de ajuste fino supervisado (SFT) de dirección única construido sobre Qwen/Qwen2.5-Coder-3B, orientado a la traducción automática de código fuente entre los lenguajes C y Go. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo objetivo es ofrecer modelos especializados en migración de código entre lenguajes, un problema recurrente en proyectos de modernización de sistemas heredados. El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder (3.085.938.688 parámetros) y el tokenizer y chat template del modelo base.

La relevancia de este checkpoint es acotada y experimental: se trata de un artefacto de investigación publicado con metadatos de entrenamiento (learning rate 1e-05, 3 épocas, batch total de 64 sobre 8 GPUs) pero sin validación de inferencia en GPU ni reproducción de benchmarks por parte del autor. El propio autor advierte que no se ha establecido que sea un checkpoint final entrenado con GRPO ni se le atribuye ninguna puntuación de benchmark del manuscrito asociado.

El modelo se distribuye bajo la licencia Qwen Research License Agreement, lo que restringe su uso a investigación y evaluación no comercial. No hay información publicada sobre idiomas soportados, datos de entrenamiento verificables ni resultados de evaluación, por lo que debe tratarse como un punto de partida reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, según tags) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B, no confirmada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial para investigación/evaluación) |
| Formato de pesos | safetensors (repo de 6,8 GB) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2 con 3.085.938.688 parámetros, y se somete a un ajuste fino supervisado completo (full SFT, no LoRA) sobre un dataset específico de dirección C a Go identificado como `train_full_1231_c2go_idx3`. Los hiperparámetros registrados en los metadatos de entrenamiento son: learning rate 1e-05, batch size total de 64 (batch de 1 por dispositivo, 8 GPUs, 8 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, 3 épocas y semilla 42. El entrenamiento se realizó con Transformers 4.57.1 y PyTorch 2.9.1, en configuración multi-GPU con 8 dispositivos.

No se documenta la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas posteriores de RLHF, DPO o GRPO. El autor indica explícitamente que el checkpoint no debe interpretarse como un modelo final entrenado con GRPO y que el repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluación históricas. Tampoco se describe ninguna innovación técnica adicional más allá del ajuste supervisado específico de dirección.

## Capacidades

- Traducción de código de C a Go: capacidad principal y única documentada del checkpoint.
- Generación de texto y código: heredada del modelo base Qwen2.5-Coder-3B.
- Conversación multi-turno: el repositorio incluye chat template, por lo que soporta el formato conversacional de Qwen.
- Tool calling / function calling: no documentado en la model card; no se confirma su soporte tras el ajuste fino.
- Razonamiento multi-paso y agentes: no documentado.
- Capacidades multilingües: no disponibles; no se especifican idiomas naturales soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Migración de utilidades C a Go en proyectos de modernización: el modelo puede generar la versión Go equivalente de funciones C pequeñas y bien delimitadas, que después se revisan y se validan con tests unitarios antes de integrarlas.
- Generación de borradores de bindings o wrappers: para bibliotecas C con API estable, el modelo puede producir esqueletos de paquetes Go que llamen a la funcionalidad equivalente, reduciendo el trabajo manual inicial.
- Prototipado de traducciones en pipelines de CI: integrado como paso previo a la revisión humana, permite obtener una primera versión traducida de módulos C y comparar el comportamiento mediante tests diferenciales.
- Docencia y formación en migración de lenguajes: sirve para ilustrar patrones de traducción entre C y Go (gestión de memoria, errores, concurrencia) en entornos de investigación, dado su carácter no comercial.
- Investigación en traducción automática de código: como checkpoint de referencia para experimentos de SFT direccional y para comparar con variantes GRPO del mismo artefacto ClearTrans.
- Evaluación de calidad de traducción: útil para construir conjuntos de prueba y estudiar errores funcionales y code smells en traducciones generadas, tal y como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se atribuye ninguna puntuación de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproducción de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (3,08 mil millones de parámetros), en fp16 requiere aproximadamente 6,2 GB solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 en fp16), aunque no se ha validado.
- Cabe en GPU consumer: probablemente sí en fp16 en GPUs con 24 GB o más, y en cuantizaciones de 8 o 4 bits en GPUs con menos VRAM; sin validación publicada.
- Opciones de despliegue: transformers (versión compatible con 4.57.1); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI, pero no se detalla ni se valida. No se documentan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans 3B SFT C-to-Go | 3,09 B | no disponible | Traducción C a Go (SFT) | Qwen Research (no comercial) | HuggingFace, sin validación de inferencia |
| Qwen2.5-Coder-3B (base) | 3,09 B | no disponible en esta ficha | Generación de código general | Apache 2.0 (según el modelo base original) | HuggingFace, ampliamente usado |
| Otros checkpoints ClearTrans direccionales | no disponible | no disponible | Traducción entre otros pares de lenguajes | Qwen Research (no comercial) | Repositorio ClearTrans en GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validarlas con tests y herramientas de análisis antes de usarlas.
- No se ha validado la inferencia en GPU ni la reproducción de benchmarks para esta release.
- No se incluyen datos de entrenamiento, estados del optimizador ni salidas de evaluación; el repositorio es una release de pesos, no evidencia de reproducción numérica completa.
- La licencia Qwen Research License Agreement restringe el uso a investigación y evaluación no comercial; no se relicencia bajo MIT ni Apache-2.0.
- No hay información sobre sesgos, riesgo de alucinación específico, idiomas naturales soportados ni limitaciones de contexto.
- El checkpoint es de dirección única (C a Go); no se debe esperar traducción inversa ni entre otros pares de lenguajes.
- El modelo no ha sido validado para tool calling, agentes ni razonamiento multi-paso tras el ajuste fino.

## Enlaces

- HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-C-to-Go
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio ClearTrans (scripts de implementación y replicación): https://github.com/Xingzhehu/ClearTrans
- Licencia: incluida en el repositorio como LICENSE (Qwen Research License Agreement)
- Aviso de atribución y modificaciones: incluido en el repositorio como NOTICE
