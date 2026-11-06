# Seiran310/decider-a

## Resumen

Seiran310/decider-a es un ajuste fino (finetune) del modelo base baselabs/mammoth-1, publicado por el usuario Seiran310 en Hugging Face. El modelo está etiquetado con las arquitecturas qwen3_5 y reax, y su contexto de publicación lo vincula al ecosistema Bittensor (subnet 92, tag sn92) y a un rol de "decision-model". Con 26.085.330.160 parámetros totales (aproximadamente 26 000 millones) y un repositorio de 52,2 GB en formato safetensors, se trata de un modelo de gran tamaño orientado presumiblemente a tareas de decisión dentro de un pipeline de agentes o de validación en red.

La información pública disponible es muy escasa: no se declaran idiomas soportados, no hay pipeline declarado, no se han publicado resultados de benchmarks y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. La licencia es MIT, lo que permite uso comercial con atribución, pero las condiciones del gate pueden imponer restricciones adicionales que conviene revisar antes de desplegarlo.

Su relevancia actual es acotada y específica: sirve como pieza de un sistema mayor (probablemente un mecanismo de decisión o enrutado dentro de la subnet 92 de Bittensor) más que como modelo de propósito general. Para desarrolladores e investigadores, el interés está en su naturaleza de finetune sobre un modelo base identificable y en su licencia permisiva, no en un rendimiento documentado que, a día de hoy, no existe públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 / reax (según tags del repositorio); detalles internos no disponibles |
| Parámetros totales | 26.085.330.160 (≈26 000 M) |
| Parámetros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otras no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | baselabs/mammoth-1 |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamaño del repositorio | 52,2 GB |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

El modelo se presenta como un finetune de baselabs/mammoth-1 y los tags indican las arquitecturas qwen3_5 y reax, lo que sugiere una base derivada de la familia Qwen 3.5 con alguna capa o componente propietario denominado "reax". No se dispone de información sobre la composición del dataset de ajuste fino, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

El contexto de publicación (tags bittensor y sn92, más la etiqueta decision-model) apunta a un entrenamiento orientado a una función concreta de decisión dentro de un entorno de subnet, probablemente con datos generados o curados por la propia red. Al no haber model card detallada ni paper asociado, cualquier afirmación sobre el proceso de entrenamiento más allá de lo anterior sería especulativa y no debe darse por sentada.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base baselabs/mammoth-1 (no verificadas de forma independiente).
- Función específica de "decision-model": presumiblemente clasificación, selección o enrutado de opciones dentro de un pipeline, según la etiqueta del repositorio.
- Integración en el ecosistema Bittensor (subnet 92): el modelo está pensado para operar como componente de un sistema de validación o minería en esa red.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Componente de decisión en subnet de Bittensor: el modelo se usaría como evaluador o selector dentro del flujo de la subnet 92, tomando decisiones sobre respuestas o propuestas de otros nodos; su tamaño de 26 000 M parámetros permite razonamiento de calidad a costa de un coste de inferencia alto.
- Enrutado de peticiones en un sistema multi-modelo: dado su rol de "decision-model", encaja como clasificador de intención o selector de modelo downstream, aprovechando el conocimiento heredado del base.
- Evaluación automática de respuestas (LLM-as-a-judge): puede emplearse para puntuar salidas de otros modelos en pipelines de control de calidad, siempre que se valide su calibración con datos propios.
- Filtrado y moderación de contenido en un backend: su naturaleza de modelo de decisión lo hace candidato a clasificar contenido como aceptable o no, aunque sin benchmarks publicados requiere evaluación previa.
- Base para ajuste fino adicional: al estar liberado en safetensors y con licencia MIT, un equipo puede partirlo como punto de arranque para una tarea de clasificación o decisión propia.
- Experimentación académica sobre finetunes de la familia Qwen 3.5: útil para estudiar cómo se comporta un finetune orientado a decisión frente al modelo base en tareas de razonamiento.
- Integración en pipelines de agentes con verificación: como paso de "decidir si continuar o parar" en un bucle de agente, sujeto a pruebas de robustez antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 60-80 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: del orden de 26-30 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits: del orden de 13-16 GB de pesos, más overhead; podría caber en una RTX 4090 de 24 GB con contexto moderado, aunque no hay cuantizaciones publicadas oficialmente.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB para FP16; para 4 bits, una RTX 4090 o RTX 6000 Ada puede ser suficiente.
- ¿Cabe en consumer GPU? En FP16 no; en 4 bits probablemente sí en GPUs de 24 GB, pero requeriría generar la cuantización a partir de los safetensors, ya que no se distribuyen GGUF.
- Opciones de despliegue: vLLM o TGI para FP16 en servidor; llama.cpp u Ollama solo si se convierte previamente a GGUF; transformers como opción de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Seiran310/decider-a | ≈26 000 M | no disponible | MIT | Gated | Finetune de mammoth-1, orientado a decisión en sn92 |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen 3.5 (familia base) | variable según variante | no disponible | según variante | público | Arquitectura de referencia citada en los tags |
| Alternativas de 24-32B de propósito general | 24 000-32 000 M | 32k-128k típicamente | variable | público | Comparables en tamaño, pero con benchmarks y model cards públicas |

La comparación cuantitativa no es posible: no hay benchmarks del modelo ni datos verificables de contexto o rendimiento. Frente a modelos de tamaño similar de propósito general, la diferencia principal es la ausencia de documentación y el acceso restringido, no las capacidades declaradas.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide garantizar comportamiento en producción.
- Riesgo de alucinación desconocido: al no haber benchmarks ni evaluaciones publicadas, no se puede acotar su fiabilidad.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; las condiciones pueden añadir restricciones más allá de la licencia MIT.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar que el modelo base baselabs/mammoth-1 tenga una licencia compatible, ya que un finetune hereda obligaciones del original.
- Idiomas no declarados: no se puede asumir soporte multilingüe; habría que validarlo empíricamente.
- Contexto no documentado: la ventana máxima real no está especificada, por lo que planificar aplicaciones con contexto largo es arriesgado.
- Descargas muy bajas (6) y sin likes: no hay comunidad que haya validado el modelo; el soporte y la trazabilidad son mínimos.
- Orientado a un nicho concreto (decisión en subnet 92): su comportamiento fuera de ese dominio no está garantizado y probablemente requiera ajuste adicional.
- Tamaño de 26 000 M parámetros: coste de inferencia alto; en FP16 exige hardware de datacenter.
- No se distribuyen cuantizaciones: desplegarlo en consumer GPU requiere trabajo previo de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seiran310/decider-a
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Bittensor (red): https://bittensor.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
