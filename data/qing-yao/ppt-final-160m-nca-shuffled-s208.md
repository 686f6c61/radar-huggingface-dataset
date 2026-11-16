# qing-yao/ppt-final-160m-nca-shuffled-s208

## Resumen

`ppt-final-160m-nca-shuffled-s208` es un modelo de lenguaje de 162.322.944 parámetros entrenado desde cero por el usuario de Hugging Face `qing-yao`, empleando la arquitectura Pythia fijada (familia GPT-NeoX con RoPE). Forma parte de una cohorte experimental ("final paper cohort") de modelos pequeños orientados a reproducibilidad: el repositorio incluye el modelo final, snapshots intermedios y checkpoints completos de optimizador, junto con un `manifest.json` que documenta hashes de origen, revisiones de dataset e inicialización. No se emplearon pesos preentrenados.

El modelo resuelve un problema de investigación más que de producción: servir como artefacto reproducible para estudiar dinámicas de entrenamiento (posiblemente relacionadas con el tag "nca", que sugiere experimentos con autómatas celulares neuronales o variantes de curriculum) bajo una semilla concreta (208) y una configuración de datos "shuffled". Su relevancia actual es limitada fuera del ámbito académico: cero descargas, cero likes y ausencia de model card sustantiva indican que es un artefacto de paper, no un modelo listo para uso general.

La información pública disponible es muy escasa: no se documentan idiomas, licencia, composición del dataset ni resultados de evaluación. Cualquier uso en producción requeriría validación propia y asumir riesgos legales por licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (Pythia pinned) con RoPE |
| Parametros totales | 162.322.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pythia "pinned", es decir, un transformer decoder-only de estilo GPT-NeoX con embeddings rotatorios (RoPE), normalización LayerNorm y atención causal estándar. Con 162M parámetros se sitúa en la escala de Pythia-160M, lo que sugiere una configuración de 12 capas, 12 cabezas y dimensión oculta 768 (valores típicos de esa familia; no confirmados en la información disponible). El entrenamiento se realizó desde cero, sin inicialización desde pesos preentrenados, bajo la semilla 208 y con una configuración de datos etiquetada como "shuffled".

El repositorio conserva el modelo final, snapshots intermedios y checkpoints completos de optimizador en directorios por etapa, con trazabilidad documentada en `manifest.json` (hashes de origen, revisiones de dataset, hashes de inicialización y métricas). No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF/DPO. El tag "nca" y la etiqueta "ppt" apuntan a un protocolo experimental propio del autor, no a una receta estándar publicada.

## Capacidades

- Generación de texto autoregresiva básica, condicionada por el corpus de entrenamiento (no documentado).
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo card no declara idiomas.
- No se documentan modos especiales (thinking, visión, audio) ni decodificación especulativa.
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio incluye checkpoints de optimizador y `manifest.json` con hashes, lo que permite replicar curvas de entrenamiento y comparar variantes bajo la misma semilla.
- Estudio de dinámicas de entrenamiento a pequeña escala: con 162M parámetros y snapshots intermedios, es adecuado para analizar cómo evoluciona la pérdida y las representaciones a lo largo de las etapas.
- Baseline en investigación de tokenización o curriculum: la configuración "shuffled" permite comparar contra variantes ordenadas del mismo corpus en trabajos posteriores.
- Pruebas de infraestructura de serving: su tamaño reducido permite validar pipelines de TGI o transformers en entornos con recursos limitados antes de escalar a modelos mayores.
- Docencia y formación: sirve para ilustrar el ciclo completo de entrenamiento desde cero (datos, checkpoints, métricas) sin requerir clústeres grandes.
- Ablaciones controladas de inicialización: al no usar pesos preentrenados y documentar hashes de inicialización, facilita experimentos sobre sensibilidad a la semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,33 GB de pesos (162M × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- En fp32: aproximadamente 0,65 GB de pesos; también viable en GPUs integradas o CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada; el modelo no aprovecha GPUs de gama alta.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más; también en CPU con latencia aceptable dado el tamaño.
- Opciones de despliegue: `transformers`, `text-generation-inference` (según tags), y conversión a GGUF para llama.cpp/Ollama no publicada pero técnicamente factible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-final-160m-nca-shuffled-s208 | 162M | no disponible | no disponible | Hugging Face (0 descargas) |
| Pythia-160M (EleutherAI) | 162M | 2048 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face |
| OPT-125M (Meta) | 125M | 2048 tokens | OPT-175B License | Hugging Face |

La comparación con Pythia-160M es la más directa por compartir arquitectura, pero el modelo de `qing-yao` carece de documentación de evaluación, licencia e idiomas, lo que lo hace no apto para uso general frente a alternativas con licencia clara y benchmarks publicados.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; requiere contacto con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: el comportamiento multilingüe es desconocido y probablemente limitado al corpus de entrenamiento no documentado.
- Riesgo alto de alucinación y baja calidad factual esperable en un modelo de 162M entrenado desde cero sin ajuste por preferencias.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Sin benchmarks ni evaluación publicada: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K).
- Artefacto de investigación: cero descargas y cero likes; no hay comunidad ni soporte.
- Repositorio de 8,2 GB por los checkpoints de optimizador, lo que puede complicar la descarga y el almacenamiento en entornos con cuotas.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, raza o idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qing-yao/ppt-final-160m-nca-shuffled-s208
- Perfil del autor: https://huggingface.co/qing-yao
- Arquitectura Pythia (referencia): https://github.com/EleutherAI/pythia
- Paper de Pythia: https://arxiv.org/abs/2304.01373
