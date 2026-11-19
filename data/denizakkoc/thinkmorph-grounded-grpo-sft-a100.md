# denizakkoc/ThinkMorph-Grounded-GRPO-SFT-A100

## Resumen

ThinkMorph-Grounded-GRPO-SFT-A100 es un checkpoint de ajuste fino mediante aprendizaje por refuerzo (GRPO) sobre el modelo multimodal ThinkMorph-7B, desarrollado por el usuario denizakkoc. No se trata de un modelo independiente, sino de un adaptador LoRA de rango 64 y alpha 128 entrenado sobre las ramas de lenguaje del modelo base BAGEL/ThinkMorph, orientado a tareas de razonamiento visual con fundamento (grounded visual reasoning). El checkpoint corresponde al paso 500 de una ejecución original sobre ocho GPU A100, completada el 16 de noviembre de 2026.

El entrenamiento utilizó 4.000 preguntas únicas extraídas de cuatro conjuntos de datos de ThinkMorph (Jigsaw_Assembly, Visual_Search, Chart_Refocus y Spatial_Navigation), con ocho rollouts por pregunta (32.000 rollouts programados). El objetivo es mejorar la capacidad del modelo base para razonar sobre imágenes y generar respuestas fundamentadas mediante refuerzo con recompensas compuestas de precisión y texto. Es relevante porque documenta una línea de entrenamiento reproducible con metadatos completos de procedencia, aunque su uso práctico está limitado a evaluación e investigación, no a despliegue en producción.

El repositorio contiene exclusivamente el estado nativo del adaptador LoRA (no un checkpoint Transformers estándar ni un directorio PEFT convencional), junto con el checkpoint completo de entrenamiento, el estado del optimizador, el estado RNG por rango y metadatos de reproducibilidad. El tamaño total del repositorio es de 5,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal BAGEL/ThinkMorph (ramas de lenguaje de texto y generación de imagen) |
| Parametros totales | 322.961.408 parámetros en el adaptador LoRA (784 tensores); el modelo base no está incluido |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`adapters.pt`, `checkpoint.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se inyecta mediante LoRA de rango 64 y alpha 128 en las ramas de lenguaje del modelo para texto y generación de imagen del ThinkMorph/BAGEL nativo. El entrenamiento empleó GRPO (Group Relative Policy Optimization) con un juez Gemini de observación directa, tasa de aprendizaje de imagen de 5e-5, tasa de aprendizaje de texto de 3e-5, pesos de recompensa `accuracy_weight=0.5`, `text_weight=0.3` y `gamma=0.7`, con CFG desactivado durante el muestreo y la reproducción RL. El batch de rollout de texto fue de 2 y las imágenes se generaron individualmente.

Los datos consistieron en 1.000 preguntas de cada uno de los cuatro conjuntos de entrenamiento de ThinkMorph, organizadas en cuatro etapas consecutivas de 1.000 preguntas que preservaron el estado del optimizador y el historial de muestras. Algunos grupos se omitieron tras fallos acotados del juez, y el historial de muestras registra si cada grupo contribuyó con gradientes. El adaptador se mantiene en FP32 sin fusionar, y el repositorio incluye el checkpoint completo con estado Adam, configuración y estado RNG por rango para reanudar el entrenamiento.

## Capacidades

- Razonamiento visual fundamentado sobre imágenes en cuatro dominios: ensamblaje de rompecabezas (Jigsaw_Assembly), búsqueda visual (Visual_Search), reenfoque de gráficos (Chart_Refocus) y navegación espacial (Spatial_Navigation).
- Generación de texto y de imagen a través de las ramas de lenguaje del modelo base ThinkMorph/BAGEL.
- Razonamiento multi-paso guiado por recompensas de precisión y de texto durante el entrenamiento RL.
- Capacidad de reanudación de entrenamiento con estado de optimizador, RNG y historial de muestras preservados.
- No se documentan capacidades de tool calling, function calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Evaluación de investigación en razonamiento visual: el checkpoint permite reproducir la evaluación del paso 500 con el cargador nativo de ThinkMorph y comparar el efecto del ajuste GRPO frente al modelo base en las cuatro tareas de ThinkMorph.
- Reproducibilidad de experimentos RL: los archivos `Seen_Questions.jsonl`, `Provenance.json` y `SHA256SUMS` permiten verificar la identidad exacta de las 4.000 preguntas, las revisiones de dataset, los hashes de imagen y las semillas de rollout, lo que facilita auditorías y replicaciones.
- Reanudación de entrenamiento: el checkpoint completo con estado Adam, RNG por rango y marcador de finalización permite continuar el entrenamiento en una nueva etapa con ejemplos nuevos usando el framework GRPO original.
- Estudio de adaptadores LoRA multimodales: sirve como caso práctico de inyección de LoRA en ramas de lenguaje de un modelo BAGEL, con verificación de nombres, formas y checksums.
- Análisis de recompensas compuestas: los pesos de precisión y texto documentados permiten estudiar cómo influyen en el comportamiento del modelo en tareas de fundamento visual.
- Docencia y formación: útil para explicar flujos de GRPO con jueces externos, gestión de fallos del juez y preservación de estado entre etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA (`adapters.pt`) ocupa aproximadamente 1,29 GB en FP32; el checkpoint completo (`checkpoint.pt`) ocupa aproximadamente 3,88 GB.
- Se requiere descargar por separado el modelo base ThinkMorph/ThinkMorph-7B (revisión `ad1a4abccca4df166f2c9d2178eb33ed61ae367e`) y el VAE, con los requisitos de VRAM propios de un modelo de 7B multimodal más las ramas de generación de imagen.
- GPU recomendadas: el entrenamiento original se ejecutó en ocho A100; para inferencia de evaluación se necesita una GPU con VRAM suficiente para materializar el modelo base completo en su dispositivo previsto.
- No se dispone de estimaciones de VRAM, latencia ni throughput específicas para este adaptador en la información proporcionada.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que requiere el runtime nativo de ThinkMorph con `torch`, `peft` y la versión fijada de `transformers`, además del helper `load_adapter.py` incluido.
- La reanudación del entrenamiento con la asignación RNG original requiere ocho rangos; un world size distinto altera la ejecución estocástica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkMorph-Grounded-GRPO-SFT-A100 | 322,9 M (adaptador LoRA) sobre base 7B | no disponible | Adaptador LoRA RL | no disponible | Hugging Face (repo de 5,2 GB) |
| ThinkMorph/ThinkMorph-7B | no disponible | no disponible | Modelo base multimodal | no disponible | Hugging Face |
| denizakkoc/ThinkMorph-Grounded-GRPO-10k | no disponible | no disponible | Linaje de entrenamiento separado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base ThinkMorph-7B y el VAE descargados por separado, sujetos a sus propios términos.
- No es un checkpoint Transformers estándar ni un directorio `PeftModel.from_pretrained`; requiere el helper `load_adapter.py` y el runtime nativo de ThinkMorph.
- El adaptador está pensado para evaluación únicamente; no se documenta su uso en producción.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta ficha.
- El repositorio es un archivo de checkpoint, no un despliegue completo: el código nativo, el framework/controlador, las imágenes de entrada y las credenciales de API son dependencias separadas.
- La reanudación end-to-end en GPU sobre una máquina de reemplazo no ha sido probada para esta subida; solo se validó en CPU el estado del adaptador/optimizador, los ocho estados RNG y el historial de muestras.
- La configuración conserva rutas de sistema de archivos originales; no deben reescribirse los metadatos serializados del checkpoint en su lugar.
- La etapa guardada ya completó su objetivo de 4.000 preguntas; continuar requiere una nueva etapa con ejemplos nuevos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/denizakkoc/ThinkMorph-Grounded-GRPO-SFT-A100
- Modelo base: https://huggingface.co/ThinkMorph/ThinkMorph-7B
- Linaje de entrenamiento alternativo: https://huggingface.co/denizakkoc/ThinkMorph-Grounded-GRPO-10k
