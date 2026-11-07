# daffahidayat/cnn-transformer-checkpoint

## Resumen

`daffahidayat/cnn-transformer-checkpoint` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de una arquitectura denominada "CNN Transformer" orientada a tareas de *matching* (emparejamiento o comparación de pares de entradas). El autor, daffahidayat, lo describe explícitamente como un banco de pruebas de arquitectura en escala "tiny", pensado para inspeccionar cambios de diseño antes de lanzar un entrenamiento completo. No se presenta como un modelo entrenado ni como un checkpoint con resultados de benchmarks.

El repositorio incluye el código de entrenamiento (`train.py`), la configuración de arquitectura (`config.json`), los hiperparámetros por defecto (`training_args.json`) y un checkpoint de inicialización en `model.safetensors`. Este último es válido para pruebas de humo (smoke tests), pero el propio autor advierte que no ha sido entrenado ni auditado. El número de parámetros registrado en safetensors es de 24.832, lo que confirma la escala mínima del artefacto.

Por tanto, se trata de material de referencia para desarrolladores e investigadores interesados en prototipar arquitecturas híbridas CNN-Transformer con fusión por atención cruzada, no de un modelo listo para producción. Su relevancia es documental y didáctica: muestra una receta reproducible (AdamW con warmup lineal, activación GELU-Tanh, normalización ScaleNorm) sobre la que construir experimentos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida CNN + Transformer, atencion estandar, fusion por cross attention) |
| Parametros totales | 24.832 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina componentes convolucionales con bloques Transformer. Segun la model card, emplea atención estándar, fusión mediante *cross attention*, activación GELU-Tanh y normalización ScaleNorm. La escala declarada es "tiny", coherente con los 24.832 parámetros del checkpoint. El repositorio no detalla el número de capas, dimensiones ocultas ni la composición exacta de las ramas CNN y Transformer; esos datos residen en `config.json`, que no se ha publicado en la información disponible.

No se ha completado ningún entrenamiento: el checkpoint incluido es una inicialización para pruebas de humo. La receta por defecto usa el optimizador AdamW con un esquema de *linear warmup*, descrita por el autor como valores de partida del script y no como evidencia de una ejecución finalizada. No se documenta número de tokens, composición del dataset, ni fases de RLHF o DPO. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y reportar la métrica de la tarea sobre un conjunto de validación emparejado con al menos tres semillas.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- La tarea objetivo declarada es *matching* (emparejamiento de pares de entradas), presumiblemente mediante representaciones conjuntas con fusión por atención cruzada.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declaran capacidades de visión, audio ni modo de razonamiento (*thinking mode*).
- El artefacto utilizable es el código (`train.py`), que sirve como punto de partida para implementar y entrenar el modelo.

## Casos de uso

- Prototipado de arquitecturas híbridas CNN-Transformer: el repositorio permite modificar la configuración y ejecutar pruebas de humo con `python train.py --help` antes de comprometer recursos de entrenamiento.
- Investigación en fusión por *cross attention* para tareas de *matching*: sirve como base para experimentos controlados comparando variantes de fusión con líneas base de capacidad equivalente.
- Docencia y formación: los 24.832 parámetros y la receta AdamW con warmup lineal hacen del modelo un ejemplo manejable para explicar el flujo completo de definición, inicialización y entrenamiento.
- Pruebas de integración de pipelines de PyTorch: el checkpoint de inicialización permite validar carga de pesos, *forward pass* y serialización en safetensors sin coste computacional.
- Reproducción de experimentos: la presencia de `config.json` y `training_args.json` facilita registrar y replicar recetas con semillas y versiones de entorno documentadas.
- Base para *benchmarking* interno: el autor propone evaluar sobre conjuntos de validación emparejados con al menos tres semillas y una línea base de capacidad similar, lo que encaja en un protocolo de evaluación propio de un equipo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 24.832 parámetros; cualquier GPU consumer moderna es sobradamente suficiente, e incluso es viable en CPU.
- GPU recomendadas: no aplica para el checkpoint actual; para un entrenamiento completo a escala "tiny" basta una GPU consumer (por ejemplo, RTX 3060 o superior).
- Cabe en cualquier GPU consumer; también en entornos sin GPU para pruebas de humo.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daffahidayat/cnn-transformer-checkpoint | 24.832 | no disponible | No (solo inicializacion) | apache-2.0 | Hugging Face |
| deepakdevi43/cnn-transformer-checkpoint | no disponible | no disponible | No disponible | no disponible | Hugging Face |
| NVIDIA Nemotron 3 Embed (8B) | 8.000 millones | 32.768 tokens | Si (rank 1 en RTEB) | OpenMDW-1.1 | Hugging Face / NVIDIA |

La comparación con Nemotron 3 Embed es meramente referencial de categoría (encoders Transformer para representaciones): aquel es un modelo entrenado y evaluado en 34 idiomas, mientras que este repositorio es un esqueleto experimental sin entrenamiento. El otro `cnn-transformer-checkpoint` encontrado en la búsqueda web parece un artefacto homónimo de otro autor, sin datos públicos adicionales.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio; no debe usarse para inferencia real.
- Riesgo elevado de resultados sin sentido si se emplea tal cual, al carecer de pesos ajustados.
- No se documentan sesgos, pero tampoco existen evaluaciones que permitan descartarlos.
- No hay información sobre cobertura idiomática ni límites de contexto.
- La licencia apache-2.0 permite uso comercial del código y los pesos, pero el autor recomienda revisar por separado los términos de los datos de origen si se emplean datasets externos.
- Al ser una implementación personalizada, no es compatible con cargadores automáticos estándar sin un adaptador explícito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daffahidayat/cnn-transformer-checkpoint
- Repositorio homónimo de otro autor: https://huggingface.co/deepakdevi43/cnn-transformer-checkpoint
- Referencia de categoría (NVIDIA Nemotron 3 Embed): https://www.marktechpost.com/2026/07/17/nvidia-ai-releases-nemotron-3-embed-an-open-embedding-collection-whose-8b-checkpoint-ranks-1-on-rteb/
