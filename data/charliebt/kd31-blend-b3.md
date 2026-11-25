# CharlieBT/kd31-blend-b3

## Resumen

kd31-blend-b3 es un modelo de 31.273 millones de parámetros (31,27B) publicado por el usuario CharlieBT en Hugging Face. Se trata de un fine-tune del modelo MachinePulseAI/karpo-decision-31B, del que hereda la arquitectura y los pesos de partida. El pipeline declarado en la ficha de Hugging Face es `text-classification`, aunque las etiquetas del repositorio incluyen también `image-text-to-text` y `gemma4`, lo que apunta a una arquitectura de tipo transformer multimodal derivada de la familia Gemma. El repositorio tiene un tamaño de 62,6 GB en formato safetensors.

El modelo se distribuye bajo licencia Apache 2.0, pero el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. No se han publicado resultados de benchmarks, datos de entrenamiento ni documentación técnica en la información disponible, y el repositorio no registra descargas ni interacciones al momento de redactar esta ficha.

Por su tamaño (31B) y su naturaleza de fine-tune sobre un modelo base de decisión, resulta relevante para experimentos de clasificación de texto y tareas derivadas de visión-lenguaje, si bien la ausencia de documentación y de métricas publicadas obliga a tratar cualquier uso en producción con cautela y a validar el comportamiento en el dominio objetivo antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma (tag `gemma4`); pipeline declarado `text-classification` |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La información disponible indica que kd31-blend-b3 es un fine-tune de MachinePulseAI/karpo-decision-31B, con etiquetas que apuntan a la familia Gemma (`gemma4`) y a capacidades de imagen-texto (`image-text-to-text`). No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron fases de RLHF, DPO o supervisión con preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

El pipeline declarado en Hugging Face es `text-classification`, lo que sugiere que el fine-tune está orientado a tareas de clasificación (posiblemente clasificación de decisión o enrutamiento, dado el nombre del modelo base). Sin embargo, la coexistencia de la etiqueta `image-text-to-text` indica que el modelo conserva, al menos a nivel de arquitectura, la capacidad de procesar entradas multimodales. Cualquier afirmación sobre el proceso exacto de entrenamiento sería especulativa: no hay model card técnica, paper ni blog asociado en la información proporcionada.

## Capacidades

- Generación de texto y clasificación de texto (pipeline declarado `text-classification`).
- Procesamiento de entradas imagen-texto según la etiqueta `image-text-to-text` del repositorio.
- Herencia de las capacidades del modelo base karpo-decision-31B (no documentadas públicamente en la información disponible).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de texto en pipelines de decisión: el pipeline declarado (`text-classification`) permite usar el modelo para etiquetar documentos, tickets o mensajes entrantes, integrándolo mediante la librería `transformers` y el endpoint de Hugging Face.
- Enrutamiento de consultas en sistemas RAG: al ser un fine-tune de un modelo orientado a decisión, puede emplearse para decidir qué recuperador o qué herramienta invocar antes de la generación final, siempre que se valide su precisión en el dominio concreto.
- Filtrado y moderación de contenido: clasificación de textos potencialmente problemáticos en flujos de publicación, con validación previa sobre datos representativos del cliente.
- Análisis de documentos con componente visual: gracias a la etiqueta `image-text-to-text`, puede procesar pares imagen-texto en tareas de clasificación o extracción, aunque la ausencia de benchmarks obliga a medir su rendimiento real antes de adoptarlo.
- Investigación sobre fine-tuning de modelos de 31B: al estar publicado en safetensors y bajo Apache 2.0, sirve como punto de partida reproducible para estudiar el efecto del ajuste sobre el modelo base karpo-decision-31B.
- Experimentación con modelos gated en entornos controlados: permite evaluar flujos de acceso restringido, despliegue con `transformers` y integración con endpoints antes de escalar a modelos con licencias más restrictivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,27B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren GPUs con 80 GB o configuraciones multi-GPU.
- Cuantización a 8 bits: entorno de 31-35 GB de VRAM, viable en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantización a 4 bits: entorno de 16-18 GB de VRAM, potencialmente ejecutable en RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; para cuantización agresiva, RTX 4090, RTX 6000 Ada o L40S.
- Cabe en GPU de consumo: solo con cuantización a 4 bits y contexto reducido; no cabe en FP16 en GPUs de 24 GB.
- Opciones de despliegue: `transformers` (librería declarada), Hugging Face Inference Endpoints (tag `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-blend-b3 | 31,27B | no disponible | Apache 2.0 | Gated en Hugging Face | Fine-tune de karpo-decision-31B, pipeline `text-classification` |
| MachinePulseAI/karpo-decision-31B | no disponible en esta ficha | no disponible | no disponible | Modelo base en Hugging Face | Base directa del modelo evaluado |
| Gemma 2 27B (referencia de familia) | 27B | 8.192 tokens (referencia pública de la familia) | Gemma Terms of Use | Abierto en Hugging Face | Alternativa de tamaño comparable; licencia distinta de Apache 2.0 |
| Qwen2.5 32B (referencia de tamaño) | 32B | 32.768 tokens (referencia pública) | Apache 2.0 | Abierto en Hugging Face | Alternativa de tamaño y licencia equivalentes, con benchmarks publicados |

La comparación con Gemma 2 27B y Qwen2.5 32B se ofrece solo como referencia de categoría por tamaño y licencia; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card detallada, paper, blog ni resultados de evaluación publicados.
- Riesgo elevado de alucinación no cuantificado: al no existir benchmarks, no se puede estimar la fiabilidad del modelo en tareas generativas o de clasificación fuera del dominio de ajuste.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación previa.
- Contexto máximo desconocido: impide planificar pipelines con ventanas largas y obliga a medir el límite real en pruebas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base karpo-decision-31B, que pueden imponer restricciones adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; esto puede ralentizar despliegues automatizados y CI/CD.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validación por terceros.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ): el despliegue en hardware modesto exige cuantizar localmente, con riesgo de degradación no medida.
- Coexistencia de pipelines (`text-classification` frente a `image-text-to-text`): la tarea real del fine-tune no está clarificada, lo que puede provocar un uso incorrecto del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-blend-b3
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
