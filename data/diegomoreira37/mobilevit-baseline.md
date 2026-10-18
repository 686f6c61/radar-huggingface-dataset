# diegomoreira37/mobilevit-baseline

## Resumen

`diegomoreira37/mobilevit-baseline` es un repositorio experimental que contiene una implementación propia de una MobileViT a escala *tiny* orientada a tareas múltiples (*multitask*). No se distribuye como un modelo entrenado, sino como un esqueleto de código (`model.py`) acompañado de una configuración de arquitectura (`config.json`), una receta de experimento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) válido únicamente para pruebas de humo. El autor lo describe explícitamente como un punto de partida para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El interés del repositorio es, por tanto, documental y de ingeniería, no de rendimiento: permite ver cómo se ensambla una MobileViT con atención lineal, fusión de tipo Tucker, activación GELU aproximada y normalización LayerNorm, y a qué hiperparámetros arranca el autor (optimizador NovoGrad con schedule de warmup constante). El recuento real de parámetros del checkpoint publicado es de 16.576, un tamaño coherente con una configuración de juguete y no con una MobileViT utilizable en producción.

Es relevante ahora solo en el contexto de reproducibilidad y experimentación: el propio autor advierte de que no reclama ninguna métrica de benchmark y de que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Cualquier evaluación seria exige entrenar el modelo con datos propios y compararlo contra baselines de capacidad equivalente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (implementación propia, escala *tiny*) |
| Parametros totales | 16.576 (recuento real del checkpoint en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; no se declara ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publica `model.safetensors`; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no se declara ningún idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más código Python (`model.py`) y JSON de configuración |

Otros parámetros declarados en la model card: atención lineal, fusión Tucker, activación GELU aproximada, normalización LayerNorm, optimizador NovoGrad con schedule de warmup constante.

## Arquitectura y entrenamiento

La arquitectura es una MobileViT, es decir, una red híbrida que combina convoluciones ligeras con bloques de atención para visión, en su variante de escala *tiny*. La model card concreta cuatro decisiones técnicas: atención de tipo lineal (coste lineal con la resolución en lugar del cuadrático de la self-attention estándar), fusión de modalidades o ramas mediante descomposición de Tucker, activación GELU aproximada y LayerNorm. El repositorio incluye `config.json` con los ajustes generados de arquitectura y `training_args.json` con la receta de experimento por defecto (NovoGrad, warmup constante), valores que el autor describe como puntos de partida del script y no como evidencia de una ejecución completada.

No hay entrenamiento que reportar. El propio README indica que `model.safetensors` es un checkpoint de inicialización válido para *smoke tests* y que no se presenta como un checkpoint entrenado con benchmarks. No se documentan número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describe una innovación técnica más allá del ensamblaje de los componentes citados, y el autor recomienda evaluar con un conjunto de validación específico de la tarea, al menos tres semillas y un baseline de capacidad equivalente, conservando logs y versiones de entorno.

## Capacidades

- No hay capacidades verificadas: el checkpoint publicado es una inicialización sin entrenar, por lo que no produce predicciones útiles en ninguna tarea.
- El repositorio está etiquetado como `multitask`, pero no se especifica qué tareas, qué cabeceras ni qué conjunto de datos las definirían.
- La implementación está pensada para inspeccionar cambios de arquitectura antes de un entrenamiento completo, no para inferencia directa.
- No se declara soporte de *tool calling*, *function calling* ni razonamiento multi-paso (no aplica a un modelo de visión de este tipo).
- No se declara soporte multilingüe ni ninguna capacidad especial (modo *thinking*, audio, vídeo u otras).
- El script `model.py` incluye un bloque `__main__` con un ejemplo ejecutable de prueba de humo, útil para comprobar que el *forward pass* funciona con las formas esperadas.
- Al ser una implementación personalizada, las APIs genéricas de carga automática (`AutoModel`, `from_pretrained` estándar) requieren un adaptador explícito antes de poder usarse.

## Casos de uso

- **Prueba de humo de pipelines de visión**: ejecutar `python model.py --help` y el ejemplo del bloque `__main__` para verificar que el entorno (PyTorch, versiones de CUDA, formas de tensor) está correctamente configurado antes de invertir en un entrenamiento real.
- **Andamiaje para experimentos de arquitectura**: partir de `config.json` y modificar escala, tipo de atención o fusión para medir el impacto en coste computacional y memoria antes de comprometer un *training run* completo.
- **Prototipado de modelos multitarea ligeros**: usar la estructura de fusión Tucker como base para conectar dos o más cabeceras de tarea (por ejemplo, clasificación y segmentación) sobre un mismo *backbone* convolucional-atencional.
- **Docencia y formación en visión por computador**: el código es un artefacto único y legible que permite explicar en clase cómo se compone un bloque MobileViT y cómo se elige un optimizador (NovoGrad) y un schedule de warmup constante.
- **Integración continua de código de investigación**: incorporar `model.py` a una batería de tests que comprueben que el *forward* mantiene formas y tipos tras refactorizaciones, sin depender de pesos entrenados.
- **Reproducción de baselines**: servir como baseline de capacidad mínima (16.576 parámetros) contra el que comparar modelos más grandes con la misma exposición de datos, presupuesto de *tuning* y semillas, tal como recomienda el autor.
- **Generación de datasets sintéticos de prueba**: usar tensores de salida aleatorios del checkpoint inicial para validar *dataloaders*, métricas y *scripts* de evaluación end-to-end antes de tener un modelo entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable con 16.576 parámetros en `safetensors` (del orden de decenas de kilobytes de pesos); el repositorio completo ocupa 0,0 GB.
- GPU recomendadas: no se necesita GPU. Cualquier CPU moderna ejecuta el *forward pass* de prueba sin problema; una GPU consumer (GTX 1650, RTX 3060, RTX 4090) solo tendría sentido para acelerar bucles de entrenamiento con lotes grandes.
- Cabe en cualquier GPU consumer: sí, con margen de varios órdenes de magnitud, incluso en iGPU y en dispositivos móviles.
- Opciones de despliegue: no hay integración con vLLM, TGI, llama.cpp u Ollama (no aplica a un modelo de visión y no existen pesos en formato GGUF). El único camino soportado es ejecutar `model.py` directamente o escribir un adaptador que cargue `model.safetensors` con PyTorch.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y con un checkpoint sin entrenar cualquier cifra de calidad sería además irrelevante.

## Comparativa con modelos similares

Las cifras de las alternativas provienen de sus publicaciones originales y no se han verificado en esta ficha; se incluyen solo como referencia de orden de magnitud.

| Modelo | Parámetros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diegomoreira37/mobilevit-baseline` | 16.576 | no declarada | ninguno (checkpoint sin entrenar) | MIT | HuggingFace |
| MobileViT-S (Apple, paper original) | ~5,6 M | imágenes 256×256 | resultados ImageNet en el paper | código abierto (ver términos del repo original) | GitHub y pesos de referencia |
| MobileNetV3-Small | ~2,5 M | imágenes 224×224 | resultados ImageNet en el paper | Apache 2.0 (implementaciones habituales) | TensorFlow/PyTorch |
| EfficientNet-B0 | ~5,3 M | imágenes 224×224 | resultados ImageNet en el paper | Apache 2.0 (implementaciones habituales) | TensorFlow/PyTorch |
| DeiT-Ti | ~5,7 M | imágenes 224×224 | resultados ImageNet en el paper | Apache 2.0 | HuggingFace |

La diferencia clave no es de tamaño sino de estado: los tres primeros son modelos entrenados y evaluados, mientras que este repositorio publica únicamente una inicialización con fines de inspección arquitectónica.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones con sentido y no debe usarse en producción bajo ninguna circunstancia.
- El autor declara que no ha sido auditado en robustez, equidad ni transferencia de dominio; se desconoce cualquier sesgo porque no hay datos de entrenamiento documentados.
- Riesgo de alucinación: no evaluable, al no existir un modelo entrenado que generar salidas.
- No se declaran idiomas soportados ni ventana de contexto; no es un modelo de texto, por lo que no aplican comparativas con LLM.
- La licencia MIT permite uso comercial del código y de los pesos publicados, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se entrena con datasets externos.
- No se publican métricas, logs de entrenamiento ni versiones de entorno; cualquier resultado que se derive de este repositorio debe documentarse de forma separada de los valores por defecto que se distribuyen.
- Al ser una implementación personalizada, no es cargable con las APIs automáticas de `transformers` sin un adaptador explícito, lo que añade fricción a cualquier integración.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin comunidad ni soporte, sin garantía de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/diegomoreira37/mobilevit-baseline
- Referencia de la arquitectura MobileViT (paper original de Mehta y Rastegari): https://arxiv.org/abs/2110.02178
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) del autor en la información proporcionada.
