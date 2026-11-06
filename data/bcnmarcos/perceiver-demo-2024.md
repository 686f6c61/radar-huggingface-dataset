# bcnmarcos/perceiver-demo-2024

## Resumen

`bcnmarcos/perceiver-demo-2024` es un prototipo de investigación basado en la arquitectura Perceiver, orientado a tareas de clasificación. Lo publica el usuario de Hugging Face `bcnmarcos` y se distribuye con licencia BSD-3-Clause. No se trata de un modelo entrenado ni de un checkpoint con resultados verificados: la model card lo describe explícitamente como un punto de partida experimental con pesos de inicialización válidos únicamente para pruebas de humo (smoke tests).

El repositorio incluye el código de implementación (`pipeline.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`). El recuento real de parámetros del checkpoint es de 49.600, un tamaño muy reducido que confirma que no se trata de un modelo listo para producción ni de un "xlarge" real en el sentido habitual del término, pese a la etiqueta de escala que aparece en la model card.

Su relevancia es, por tanto, documental y didáctica: sirve como esqueleto reproducible para experimentar con Perceivers y para fijar convenciones de formato (safetensors, config JSON, receta de entrenamiento) antes de abordar entrenamientos reales. No debe evaluarse como un modelo de propósito general ni compararse con LLMs o clasificadores entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención flash, tensor fusion, activación GELU, normalización LayerNorm) |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo checkpoint en safetensors; sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con cuello de botella de latentes que proyecta entradas de cualquier modalidad a un espacio latente de tamaño fijo mediante cross-attention, y luego procesa esos latentes con self-attention. La model card indica el uso de atención flash, fusión tensorial (tensor fusion), activación GELU y LayerNorm. La escala declarada es "xlarge", aunque el recuento real de parámetros del checkpoint (49.600) no es coherente con esa etiqueta y sugiere que la configuración "xlarge" es solo una plantilla de defaults.

No hay evidencia de entrenamiento completado. La receta por defecto usa el optimizador Adam con un schedule exponencial, pero la propia model card aclara que son valores iniciales del script y no el resultado de una ejecución. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO/SFT. Tampoco se describen innovaciones adicionales más allá de las propias del Perceiver (cross-attention a latentes, atención flash).

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint es de inicialización y no ha sido entrenado.
- La arquitectura está orientada a clasificación, no a generación de texto.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay modos especiales (thinking, visión, audio) documentados.
- El código incluye un punto de entrada ejecutable (`pipeline.py`) con un ejemplo de smoke test, útil para validar el pipeline, no para inferencia útil.

## Casos de uso

- Pruebas de humo de pipelines de clasificación: usar `model.safetensors` para verificar que el cargador, la tokenización/proyección de entrada y el bucle de inferencia funcionan antes de entrenar de verdad.
- Plantilla de experimentación con Perceivers: partir de `config.json` y `training_args.json` para reproducir una receta base y modificarla (optimizador, schedule, tamaño de latentes) en estudios comparativos.
- Docencia y formación: ilustrar cómo se estructura un repositorio de modelo (config, training args, pesos, script) y cómo se documentan limitaciones de forma honesta.
- Baseline de capacidad mínima: servir como referencia trivial (con parámetros aleatorios) para comprobar que un pipeline de evaluación detecta modelos no entrenados.
- Integración en CI de investigación: ejecutar `pipeline.py --help` y el bloque `__main__` como test de regresión del código de carga del modelo.
- Punto de partida para adaptadores propios: como la implementación es custom, requiere un adaptador explícito para APIs de carga automática; el repo sirve para desarrollar ese adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado. Cualquier cifra de rendimiento sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 49.600 parámetros en fp32 (el checkpoint ocupa prácticamente nada); el cuello de botella sería el tamaño de las entradas y los latentes, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: al ser una implementación custom, no hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama; se ejecuta mediante el propio `pipeline.py` con PyTorch.
- Latencia y throughput: no disponibles; no tiene sentido medirlos sin un modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bcnmarcos/perceiver-demo-2024 | 49.600 | no disponible | No (inicialización) | BSD-3-Clause | Hugging Face |
| Perceiver IO (referencia DeepMind) | variable (decenas de millones a cientos) | no aplica (entrada multimodal) | Sí, con checkpoints publicados | Apache-2.0 (referencia) | Repos oficiales |
| CLIP (clasificación/zero-shot) | ~150M (ViT-B/32) | 77 tokens de texto | Sí | MIT (variantes) | Hugging Face |
| ResNet-50 (clasificación de imagen) | ~25M | no aplica | Sí | BSD/MIT según variante | Hugging Face/torchvision |

La comparación es asimétrica: los alternativos son modelos entrenados y auditados, mientras que este repositorio es un esqueleto. No hay datos de rendimiento para comparar de forma cuantitativa.

## Limitaciones y advertencias

- El checkpoint no está entrenado: las salidas son esencialmente aleatorias y no deben usarse para decisiones.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- No hay información sobre sesgos, idiomas ni datos de entrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de interpretar erróneamente sus salidas como predicciones válidas.
- La licencia BSD-3-Clause permite uso comercial, pero los términos de los datos externos que se usen con el repositorio deben revisarse por separado.
- La etiqueta "xlarge" de la model card no se corresponde con el tamaño real del checkpoint; conviene no tomar esa escala como referencia.
- Requiere un adaptador explícito para APIs de carga automática de Hugging Face; no funciona con `AutoModel` genérico sin implementación propia.
- Sin versiones cuantizadas ni formatos alternativos; el despliegue en producción exigiría entrenamiento previo y empaquetado adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bcnmarcos/perceiver-demo-2024
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este modelo.
