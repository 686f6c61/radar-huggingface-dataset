# francesca9805/urd-arab-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407

## Resumen
El modelo `francesca9805/urd-arab-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407` es un ajuste fino por supervisión (SFT) del modelo base `francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407`. Se trata de un transformer decoder-only de arquitectura GPT-2 (según la etiqueta `gpt2`) con 39.087.104 parámetros totales, pesos en safetensors y un repositorio de 1,2 GB. Lo publica el usuario de HuggingFace `francesca9805` y se ha entrenado con la librería TRL, dentro de un proyecto de investigación sobre tokenizadores (la ejecución de Weights & Biases se aloja en el espacio `f-padovani-university-of-groningen/new-tokenizers`).

El modelo no declara licencia, idiomas soportados ni longitud de contexto, y no presenta descargas ni interacciones en el momento de redactar esta ficha. Su relevancia práctica fuera del ámbito de la experimentación es reducida: parece un artefacto de investigación controlada más que un modelo listo para producción. El propio nombre del checkpoint (`urd-arab-10mb...-100mb-packed...-ckpt500_seed3407`) sugiere un experimento con corpus de urdu/árabe de 10 MB, empaquetado (packed) de 100 MB, checkpoint en el paso 500 y semilla 3407, aunque el autor no confirma esta interpretación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (según la etiqueta `gpt2`) |
| Parametros totales | 39.087.104 (~39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere urdu/árabe, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La etiqueta `gpt2` del repositorio indica que se trata de un transformer decoder-only autorregresivo con atención causal, aunque no se especifican el número de capas, la dimensión oculta, el número de cabezas ni el tamaño del vocabulario. Con 39 M de parámetros, el modelo es más pequeño que GPT-2 small (124 M), por lo que encaja en la categoría de modelos diminutos orientados a experimentación con tokenizadores. No se han publicado detalles sobre la estrategia de atención, la inicialización ni la posible decodificación especulativa.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El autor solo enlaza una ejecución de Weights & Biases y no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El nombre del checkpoint apunta a un corpus empaquetado de 100 MB con semilla 3407 y paso 500, pero es una inferencia a partir del identificador, no un dato confirmado.

## Capacidades
- Generación de texto autorregresiva, según la etiqueta `text-generation` y el ejemplo de uso con `pipeline` de Transformers.
- Conversación multi-turno básica: el `README` muestra una llamada con formato de mensajes `{"role": "user", "content": ...}`, aunque no se especifica la plantilla de chat exacta.
- Capacidad multilingüe: no confirmada; el nombre sugiere urdu/árabe, pero no hay declaración de idiomas.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.
- Compatible con Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`) para despliegue en endpoints de Inferencia de HuggingFace.

## Casos de uso
- Investigación sobre tokenizadores: el modelo se enmarca en un proyecto de tokenización (espacio W&B `new-tokenizers`) y resulta útil para comparar el efecto de distintos vocabularios o esquemas de empaquetado sobre un transformer pequeño.
- Experimentos de SFT reproducibles: al haberse entrenado con TRL 0.23.0 y semilla 3407, es adecuado para replicar pipelines de ajuste supervisado a pequeña escala y validar configuraciones antes de escalar a modelos mayores.
- Pruebas de integración de pipelines de Transformers: sirve como modelo de juguete para validar código de `pipeline("text-generation")`, gestión de safetensors y carga en GPU o CPU sin consumir recursos significativos.
- Despliegue en inferencia de bajo coste: con ~39 M de parámetros se puede servir en el endpoint de Inferencia de HuggingFace o en TGI para prototipos de generación de texto con requisitos mínimos de memoria.
- Evaluación de corpus urdu/árabe (si se confirma el dominio): útil para medir fluidez y perplejidad sobre textos en escritura árabe tras un ajuste con datos empaquetados.
- Docencia y divulgación: buen candidato para explicar el flujo completo de fine-tuning con TRL (tokenización, SFT, checkpoints, publicación en el Hub) sin necesidad de hardware especializado.
- Pruebas de cuantización extrema: al ser tan reducido, permite ensayar conversiones a 8 bits o 4 bits y medir el impacto en calidad en un entorno controlado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (calculada a partir de los 39.087.104 parámetros; no son cifras publicadas por el autor):
  - FP32: ~156 MB solo para pesos.
  - FP16/BF16: ~78 MB solo para pesos.
  - 8 bits: ~40 MB solo para pesos.
  - 4 bits: ~20 MB solo para pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (TGI, por las etiquetas `text-generation-inference` y `endpoints_compatible`), endpoints de HuggingFace. No se confirma soporte para llama.cpp, Ollama o vLLM al no publicarse variantes GGUF ni documentación al respecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 39 M | no disponible | GPT-2 (decoder-only) | no disponible | Hub de HuggingFace (0 descargas) |
| GPT-2 small | 124 M | 1024 tokens | GPT-2 (decoder-only) | MIT (modificada) | Ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | GPT-2 destilado | Apache-2.0 | Ampliamente disponible |

La comparación es orientativa: no se han publicado métricas de calidad para el modelo objeto de esta ficha, por lo que no es posible contrastar su rendimiento con el de GPT-2 small o DistilGPT-2 más allá del tamaño y la familia arquitectónica.

## Limitaciones y advertencias
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Sin métricas de calidad: no hay benchmarks, evaluaciones humanas ni datos de perplejidad publicados.
- Riesgo de alucinación: al ser un modelo de ~39 M entrenado con SFT sobre un corpus presumiblemente pequeño (10-100 MB), la coherencia factual y la fidelidad a instrucciones serán muy limitadas.
- Idiomas y dominio no confirmados: aunque el nombre apunta a urdu/árabe, el autor no declara idiomas soportados; no debe asumirse un rendimiento multilingüe.
- Sesgos: no se documenta ningún análisis de sesgos; los corpus pequeños suelen amplificar los sesgos presentes en los datos.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin antes verificarla empíricamente.
- Naturaleza experimental: el identificador (semilla 3407, checkpoint 500, empaquetado de 100 MB) sugiere un experimento puntual más que un modelo mantenido; no hay garantía de soporte, actualizaciones ni estabilidad de la API.
- Repositorio de 1,2 GB frente a ~78-156 MB de pesos: puede contener artefactos adicionales (checkpoints intermedios, estados del optimizador) y conviene revisar los archivos antes de descargarlo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/b5j1mnvx
- Repositorio de TRL: https://github.com/huggingface/trl
