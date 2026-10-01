# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-060

## Resumen
El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-060` es un ajuste fino de investigación construido sobre `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el grupo HYU-NLP-EVAL y corresponde al paso 60 de una ejecución de aprendizaje por refuerzo identificada en la model card como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`. Por tanto, no es un modelo listo para producción, sino un artefacto intermedio de un entrenamiento orientado al dominio médico con un esquema de recompensa basado en rúbricas generadas en línea ("online rubrics") y recompensa densa ("dense").

La arquitectura es la del modelo base: un transformer decoder-only denso de 4.411.424.256 parámetros según los pesos en safetensors. El repositorio ocupa 58,7 GB porque incluye, además del modelo BF16 listo para inferencia en la raíz, un directorio `original_checkpoint/` con los ficheros nativos de veRL (optimizador y estado de datos). El checkpoint declara licencia Apache-2.0 en los metadatos, mientras que la propia model card indica "research use only", una contradicción relevante que se detalla más abajo.

Su interés es fundamentalmente metodológico: los checkpoints intermedios de ejecuciones de RL con rúbricas permiten estudiar la dinámica de entrenamiento, la estabilidad entre semillas y la transferencia de recompensas verificables a dominios científicos. No se han publicado benchmarks, no tiene descargas ni valoraciones y la model card no documenta composición del dataset, número de tokens ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (≈4,41 mil millones, contabilizados desde los safetensors) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la model card de este checkpoint; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en BF16 (safetensors); no se documentan versiones GGUF, AWQ, GPTQ o FP8 para este checkpoint |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 según los metadatos de HuggingFace; la model card indica "Research use only" (contradicción sin resolver) |
| Formato de pesos | safetensors (BF16) en la raíz del repositorio, más checkpoint nativo de veRL con optimizador y estado de datos en `original_checkpoint/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Framework de entrenamiento | veRL (según la model card) |
| Ejecución / identificador | phase1-online-rubrics-medicine-full-dense-20260919-seed11, paso 60 |
| Fecha de publicación | 2026-10-01 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento
La arquitectura no se modifica respecto al modelo base. Se trata de un transformer decoder-only denso de aproximadamente 4,41 mil millones de parámetros, sin mezcla de expertos ni componentes de estado recurrente. La model card no describe cambios estructurales, ampliaciones de vocabulario, variaciones de atención ni técnicas de decodificación especulativa. La diferencia apreciable de recuento respecto al modelo base (que ronda los 4.000 millones de parámetros) no se explica en la documentación publicada.

El entrenamiento corresponde a una fase de aprendizaje por refuerzo sobre el modelo instructivo ya alineado, ejecutada con veRL. El nombre de la ejecución sugiere cuatro decisiones de diseño que la model card no desarrolla: dominio médico ("medicine"), recompensa basada en rúbricas generadas en línea ("online-rubrics"), señal de recompensa densa ("full-dense") y semilla 11. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de una fase previa de SFT o DPO, el algoritmo de RL concreto, ni las rúbricas utilizadas. Tampoco se documenta si el modelo ha recibido entrenamiento específico de tool calling o de modo de razonamiento extendido. El checkpoint publicado es el paso 60 de esa ejecución y la model card advierte que se trata de material de investigación.

## Capacidades
- Generación de texto y conversación multi-turno: hereda la pila `text-generation` y `conversational` del modelo base, según indican las etiquetas del repositorio.
- Ámbito declarado de especialización: dominio médico, por el identificador de la ejecución de RL. No se aportan evaluaciones que cuantifiquen esta especialización.
- Tool calling / function calling: no documentado para este checkpoint. El modelo base Qwen3-4B-Instruct-2507 sí lo soporta, pero no hay confirmación de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking": no documentado. Las etiquetas del repositorio no incluyen marcadores de modo de razonamiento.
- Capacidades de visión o audio: no disponibles; el repositorio es exclusivamente de generación de texto.

## Casos de uso
- Investigación en RL con recompensas verificables: el checkpoint permite reproducir y analizar la curva de aprendizaje del paso 60 de una ejecución con rúbricas en línea, comparándola con otros pasos de la misma serie o con otras semillas (el identificador declara `seed11`).
- Estudio de dinámica de entrenamiento con veRL: al conservar `original_checkpoint/` con el estado del optimizador y de los datos, el repositorio sirve para reanudar el entrenamiento, inspeccionar el estado interno del optimizador o depurar inestabilidades de la fase de RL.
- Evaluación de rúbricas como señal de recompensa en dominio médico: permite medir si un esquema de rúbricas generadas en línea mejora respuestas clínicas frente al modelo base, siempre dentro de un protocolo de evaluación académico.
- Línea base intermedia para ablaciones: resulta útil como punto de comparación frente al checkpoint inicial (paso 0) y al final de la ejecución, para aislar el efecto de los primeros 60 pasos de RL.
- Generación aumentada en experimentos de recuperación sobre literatura médica: con un contexto teóricamente amplio heredado del modelo base, puede probarse en tareas de resumen o respuesta sobre documentos largos, sin garantías de calidad clínica.
- Docencia e investigación en alineación: sirve como ejemplo práctico de fine-tuning de RL sobre un modelo de 4B con recursos moderados, útil en cursos y laboratorios de alineación.
- Auditoría de sesgos y seguridad en modelos médicos: al ser un artefacto acotado y de uso investigador, es adecuado para analizar cómo el RL con rúbricas altera el tono, la cautela y la tasa de afirmaciones no sustentadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada en BF16 (precisión de publicación): unos 8,8 GB solo para pesos, más caché KV y overhead, lo que sitúa la inferencia práctica en el rango de 10 a 14 GB según longitud de contexto y tamaño de lote.
- VRAM estimada con cuantización de 8 bits: aproximadamente 4,5 a 5,5 GB de pesos.
- VRAM estimada con cuantización de 4 bits (por ejemplo GGUF Q4_K_M, tras conversión manual): aproximadamente 2,5 a 3,5 GB de pesos.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, 4080 y 4090; en equipos Apple Silicon conviene disponer de 16 GB o más de memoria unificada. Cabe en GPU de consumo con cuantización de 8 o 4 bits; en BF16 requiere al menos 12 GB y holgura adicional para contexto largo.
- GPU de centro de datos: A100 de 40 o 80 GB, H100, L40S o equivalentes, con margen amplio para lotes grandes y contexto extendido.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM y TGI (los metadatos incluyen `text-generation-inference` y `endpoints_compatible`), y llama.cpp u Ollama únicamente después de convertir los pesos a GGUF, conversión que no está publicada.
- Almacenamiento: el clon completo del repositorio ocupa 58,7 GB por incluir el estado de veRL; para inferencia basta con los safetensors de la raíz, pero la descarga parcial debe seleccionarse explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
Las cifras de los modelos alternativos proceden de su documentación pública y no se han verificado en esta ficha; deben confirmarse antes de usarlas en decisiones técnicas.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-060 | 4.411.424.256 | No disponible (base: 262.144 tokens) | Checkpoint intermedio de RL sobre dominio médico | Apache-2.0 en metadatos, "research use only" en la model card | HuggingFace, 0 descargas, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | ≈4.000 millones | 262.144 tokens | Modelo instructivo generalista, punto de partida | Apache-2.0 | Ampliamente distribuido, con ecosistema de cuantizaciones |
| Llama-3.2-3B-Instruct | ≈3.210 millones | 128.000 tokens | Modelo instructivo generalista | Licencia comunitaria de Llama 3.2 | Ampliamente distribuido |
| Gemma-3-4B-it | ≈4.000 millones | 128.000 tokens | Modelo instructivo multimodal (texto e imagen) | Términos de uso de Gemma | Ampliamente distribuido |

Frente al modelo base, este checkpoint no aporta mejoras documentadas ni verificables: la única diferencia comprobable es el ajuste por RL y la advertencia de uso exclusivamente investigador.

## Limitaciones y advertencias
- Contradicción de licencia: los metadatos declaran Apache-2.0, pero la model card indica "research use only". Ante esta discrepancia, no debe asumirse uso comercial sin aclaración expresa del autor.
- Checkpoint intermedio: corresponde al paso 60 de una ejecución de RL, no a un modelo final. Su calidad puede ser inferior o inestable respecto al modelo base.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación de seguridad, ni comparación con el modelo base.
- Dominio médico sin validación clínica: no apto para diagnóstico, triaje, prescripción ni ninguna decisión clínica. Cualquier uso sanitario requeriría validación regulatoria y supervisión profesional.
- Riesgo de alucinación: al ser un modelo de 4B ajustado sobre datos no documentados, la probabilidad de afirmaciones médicas incorrectas pero verosímiles es elevada y no está medida.
- Datos de entrenamiento no documentados: se desconoce la composición del corpus, su procedencia y si contiene información de salud protegida o material con licencias incompatibles.
- Idiomas no declarados: no hay garantía de comportamiento adecuado fuera del inglés, ni siquiera de que el ajuste se haya realizado en un único idioma.
- Reproducibilidad parcial: se publica una sola semilla (seed 11) y un solo paso (60), lo que limita la generalización de cualquier conclusión.
- Contexto no confirmado: la ventana de 262.144 tokens corresponde al modelo base y no se ha verificado en este checkpoint; un ajuste con RL podría haber alterado el comportamiento en contextos largos.
- Repositorio pesado: 58,7 GB por el estado de veRL, con coste de descarga y almacenamiento relevante en entornos académicos.
- Adopción nula: 0 descargas y 0 valoraciones, por lo que no existe validación independiente de su funcionamiento.

## Enlaces
- Página de HuggingFace del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-060
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de veRL (framework de entrenamiento citado en la model card): https://github.com/volcengine/verl
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios adicionales) en la información disponible.
