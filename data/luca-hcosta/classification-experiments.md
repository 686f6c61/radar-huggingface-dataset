# Luca-hcosta/classification-experiments

## Resumen

`Luca-hcosta/classification-experiments` es un repositorio de HuggingFace publicado por el usuario Luca-hcosta que contiene una implementación propia y compacta de DeiT (Data-efficient Image Transformer) para tareas de clasificación, en su configuración "small". No se trata de un modelo entrenado ni de un release de pesos preentrenados: la propia model card lo describe como un punto de partida experimental orientado a revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeño alcance. El checkpoint `model.safetensors` se presenta explícitamente como una inicialización válida, no como un modelo con benchmarks.

El dato más llamativo es el tamaño: los metadatos de safetensors declaran 24.832 parámetros totales, tres órdenes de magnitud por debajo de los aproximadamente 22 millones de parámetros de un DeiT-Small estándar. Esto sugiere una configuración muy reducida (o un checkpoint limitado a una parte de la red), lo que refuerza su carácter de artefacto de prueba más que de modelo desplegable. El repositorio ocupa 0,0 GB e incluye `eval.py`, `config.json`, `training_args.json` y el propio README.

Su relevancia actual es la de una plantilla reproducible: implementación en PyTorch puro, receta de experimento por defecto basada en el optimizador Adafactor con planificador polinómico, y licencia permisiva BSD-3-Clause. Sirve para validar infraestructura de entrenamiento y evaluación, no para resolver tareas reales de clasificación sin un entrenamiento previo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (transformer de visión para clasificación) |
| Parametros totales | 24.832 (según metadatos de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de clasificación; no se documenta resolución de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (con implementación PyTorch y `config.json`) |
| Tarea principal | clasificación |
| Atención | linear |
| Fusión | low rank |
| Activación | gelu |
| Normalización | batchnorm |

## Arquitectura y entrenamiento

La arquitectura declarada es DeiT en escala "small", con tres decisiones técnicas que la alejan del DeiT canónico: atención de tipo linear en lugar de atención softmax completa, fusión de bajo rango (low rank) y normalización por BatchNorm en lugar de LayerNorm. La activación es GELU. No se especifica el número de capas, dimensión de embedding, número de cabezas ni resolución de imagen de entrada, por lo que no es posible reconstruir el grafo completo a partir de la información disponible.

En cuanto al entrenamiento, la model card es tajante: el checkpoint incluido no ha sido entrenado. La configuración por defecto (`training_args.json`) propone Adafactor con un planificador polinómico, pero el autor aclara que son valores de arranque del script y no evidencia de una ejecución completada. No se documentan tokens de entrenamiento (no aplica, es visión), composición del dataset, número de épocas, ni fases de RLHF/DPO. Tampoco se menciona ninguna innovación técnica adicional más allá de las elecciones de atención y fusión ya citadas.

## Capacidades

- Propagación hacia delante de un clasificador de imágenes basado en transformer, implementado en PyTorch.
- Ejecución de una prueba de humo mediante `python eval.py --help` y el bloque `__main__` del script.
- Carga de un checkpoint de inicialización en formato safetensors con una configuración de arquitectura registrada en `config.json`.
- Reutilización de la receta de experimento (Adafactor + planificador polinómico) como punto de partida para entrenamientos propios.
- Capacidad de servir como base para adaptadores de carga personalizados, ya que al ser una implementación propia las APIs genéricas de carga automática no funcionan sin adaptación.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingües, modo "thinking", visión documental, audio ni generación de texto.

## Casos de uso

- Pruebas de humo en CI/CD: el repositorio incluye `eval.py` con un ejemplo ejecutable, por lo que se puede integrar en un pipeline de integración continua para verificar que el entorno de PyTorch, la carga de safetensors y la construcción del modelo funcionan antes de lanzar entrenamientos costosos.
- Revisión de código y auditoría de arquitecturas: al ser una implementación compacta y autocontenida, es adecuada para revisar cómo se implementan atención linear, fusión de bajo rango y BatchNorm en un transformer de visión, sin la complejidad de una librería completa.
- Prototipado de variantes de atención eficiente: sirve como banco de pruebas para medir el impacto de sustituir atención softmax por atención linear en tareas de clasificación con presupuestos de cómputo mínimos.
- Pruebas de exportación y cuantización: con menos de 25.000 parámetros, permite validar rutas de exportación a ONNX o TorchScript y flujos de cuantización en segundos y sin GPU, como paso previo a aplicarlos a modelos grandes.
- Docencia y formación: es un ejemplo didáctico manejable para explicar la estructura de un DeiT, el papel del `config.json` y la separación entre definición de modelo y argumentos de entrenamiento.
- Verificación de harnesses de evaluación: permite comprobar que un pipeline de evaluación propio (carga de datos etiquetados, cálculo de métrica, repetibilidad entre semillas) funciona correctamente antes de conectar un modelo entrenado.
- Baseline de capacidad mínima: en experimentos controlados, actúa como cota inferior de rendimiento frente a la cual comparar arquitecturas con el mismo presupuesto de datos, ajuste y semillas, tal como recomienda la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización sin entrenar, por lo que cualquier métrica de clasificación (ImageNet top-1/top-5, CIFAR, etc.) sería inaplicable en su estado actual.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 24.832 parámetros, el peso en fp32 ocupa aproximadamente 97 KiB y en fp16 unos 49 KiB, además de las activaciones, que dependerán de la resolución de entrada no documentada.
- GPU recomendadas: ninguna en particular; el modelo cabe y se ejecuta con holgura en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en entornos sin GPU. Como referencia, un DeiT-Small estándar (unos 22 M de parámetros) ocuparía del orden de 88 MB en fp32 y 44 MB en fp16, también dentro de cualquier GPU de consumo.
- Opciones de despliegue: PyTorch nativo mediante `eval.py`; exportación a ONNX Runtime o TorchScript si se necesita servir el modelo. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje ni publica pesos en GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luca-hcosta/classification-experiments (DeiT small, implementación propia) | 24.832 | no disponible | sin benchmarks publicados; checkpoint sin entrenar | BSD-3-Clause | HuggingFace |
| facebook/deit-small-patch16-224 | ~22 M | 224x224 | ImageNet top-1 en torno al 79,8 % (según la model card de referencia) | Apache-2.0 | HuggingFace |
| facebook/deit-tiny-patch16-224 | ~5,7 M | 224x224 | ImageNet top-1 en torno al 72,2 % (según la model card de referencia) | Apache-2.0 | HuggingFace |
| ResNet-50 | ~25,6 M | 224x224 | ImageNet top-1 en torno al 76,1 % (referencia habitual en torchvision) | BSD-3-Clause / MIT según implementación | torchvision |

La comparación directa no es equitativa: los tres modelos de referencia son pesos entrenados y publicados con métricas verificables, mientras que este repositorio es un esqueleto de implementación con un checkpoint de inicialización. La única ventaja medible del repositorio analizado es su licencia permisiva y su tamaño, que lo hacen útil para pruebas, no para inferencia real.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización, no un modelo entrenado. No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- Sesgos conocidos: no disponible. Al no haber datos de entrenamiento documentados, no es posible caracterizar sesgos de ningún tipo.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto ni produce salidas lingüísticas.
- Limitaciones de contexto e idioma: no aplica en el sentido habitual; es un modelo de clasificación y no se documenta resolución de entrada ni conjunto de clases.
- Uso comercial: la licencia BSD-3-Clause permite uso comercial con atribución, pero la model card advierte de que hay que revisar por separado los términos de las fuentes de datos externas que se utilicen con el repositorio.
- Las APIs genéricas de carga automática de HuggingFace no funcionarán sin un adaptador explícito, al tratarse de una implementación personalizada; es necesario apoyarse en `config.json` y en el código de `eval.py`.
- El repositorio no documenta ningún resultado reproducible: para publicar una métrica sería obligatorio entrenar con un split etiquetado específico, reportar al menos tres semillas e incluir un baseline de capacidad comparable, además de conservar los registros de entrenamiento y las versiones del entorno.
- El nombre del repositorio y del autor genera ambigüedad en búsquedas web, que devuelven resultados de entidades homónimas sin relación con el modelo; conviene citarlo siempre por su identificador completo.

## Enlaces

- HuggingFace: https://huggingface.co/Luca-hcosta/classification-experiments

Nota: la búsqueda web no ha devuelto enlaces técnicos relevantes sobre este modelo. Todos los resultados obtenidos corresponden a entidades homónimas sin relación alguna con el repositorio, por lo que no se incluyen como referencias: https://www.lucca.fr/ , https://www.lucca.fr/login , https://www.disney.fr/films/luca , https://www.luca.paris/ , https://fr.wikipedia.org/wiki/Luca_(film) .
