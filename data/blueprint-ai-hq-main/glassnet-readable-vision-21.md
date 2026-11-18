# blueprint-ai-hq-main/glassnet-readable-vision-21

## Resumen

GlassNet-readable-vision-21 es un clasificador de imagenes desarrollado por blueprint-ai-hq-main que se presenta como un modelo de vision "totalmente legible": cada una de sus 21 neuronas de la capa intermedia corresponde a una formula con nombre que cualquier persona puede calcular a mano a partir de los pixeles. No contiene capas ocultas aprendidas tipo caja negra; la capa intermedia son 21 conceptos booleanos explicables (brillo, contraste, simetria, bordes, textura, proporcion de tinta, etc.) y la capa de salida lee directamente esos conceptos para emitir la clase.

El modelo resuelve un problema concreto de interpretabilidad: separar un clasificador que "funciona" de uno que "explica lo que hace". Para demostrarlo, el autor publica dos ablaciones sobre el checkpoint: al poner la capa de conceptos a cero la precision cae al 9,98 %, y al barajarla entre imagenes cae al 9,55 %, lo que confirma que la capa con nombre es la que realiza el trabajo y que la capa de salida lee contenido por imagen y no medias. La precision en held-out es del 84,62 %, practicamente identica al control plano de igual tamano (84,86 %).

Se trata de un modelo deliberadamente pequeno (15.977 parametros segun safetensors) entrenado sobre Fashion-MNIST (imagenes de 28x28 en escala de grises), cargable con numpy y safetensors sin PyTorch. Es relevante como referencia de arquitectura interpretable y como banco de pruebas reproducible, no como modelo de vision de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con capa intermedia de 21 conceptos booleanos con formula explicita y capa de salida lineal sobre conceptos |
| Parametros totales | 15.977 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: clasificador de imagenes de 28x28) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), config.json, MANIFEST.json |

## Arquitectura y entrenamiento

La arquitectura es una red feedforward de tres niveles: la entrada son los pixeles de una imagen 28x28 en escala de grises; la capa intermedia son 21 unidades, cada una asociada a una formula explicita definida sobre los pixeles (por ejemplo `mean(pixel) > 0.50`, `std(pixel) > 0.30`, `mean|dI/dx| > 0.18`, `mean|laplacian| > 0.30`, `fraction(pixel>0.5) > 0.55`); y la capa de salida es lineal sobre esos 21 conceptos. Cada concepto es una afirmacion 0/1 sobre la imagen, calculada directamente a partir de los pixeles, y el modelo se entrena para que cada neurona coincida con su formula. Posteriormente se audita cada neurona calculando su AUROC frente a la formula correspondiente: 20 de 21 conceptos pasan esa auditoria de honestidad.

Los datos de entrenamiento son Fashion-MNIST, un conjunto de imagenes de prendas de vestir de 28x28 en escala de grises. La model card no detalla el numero de tokens ni la composicion exacta del dataset mas alla de esta referencia, ni menciona RLHF, DPO ni tecnicas de alineacion. La innovacion tecnica destacable es la legibilidad estructural: la capa intermedia no se aprende como representacion latente opaca, sino que se fija como formulas calculables y se audita su correspondencia con las neuronas. El autor reporta que la arquitectura interpretable alcanza paridad de precision con un control plano de igual tamano en media, pero con una dispersion entre semillas mucho menor (0,82 puntos frente a 4,28 puntos del control en 3 semillas).

## Capacidades

- Clasificacion de imagenes de prendas de vestir de Fashion-MNIST (28x28, escala de grises) en las clases del dataset.
- Explicabilidad total de la capa intermedia: cada neurona es una formula con nombre verificable a mano.
- Auditoria de honestidad por concepto: 20 de 21 neuronas disparan coherentemente con su formula (AUROC).
- Ablaciones diagnosticas: precision con capa de conceptos a cero (9,98 %) y barajada (9,55 %), que demuestran dependencia real de la capa con nombre.
- Carga con numpy y safetensors, sin dependencia de PyTorch ni de frameworks de deep learning.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto.

## Casos de uso

- Docencia de interpretabilidad en vision: usar las 21 formulas como material de clase para mostrar como se construye un clasificador cuyas neuronas se pueden calcular a mano, y comparar con un control plano de igual tamano.
- Auditoria de modelos de vision en entornos regulados: el modelo sirve como plantilla de "modelo con capa explicable" para demostrar trazabilidad de decisiones por concepto en un pipeline de clasificacion de prendas.
- Prototipado rapido sin PyTorch: al cargarse con numpy y safetensors, se puede integrar en entornos Python minimos, scripts de validacion o notebooks sin instalar frameworks pesados.
- Investigacion de estabilidad entre semillas: la menor dispersion reportada (0,82 puntos frente a 4,28 del control) permite estudiar variabilidad de entrenamiento en arquitecturas interpretables.
- Benchmark de ablaciones: usar las pruebas de capa a cero y barajada como protocolo reproducible para evaluar si un modelo explicable realmente depende de su capa con nombre.
- Clasificacion de prendas en demos de bajo coste: al tener 15.977 parametros, se puede ejecutar en CPU y en dispositivos con recursos minimos para demostraciones de clasificacion de imagenes 28x28.
- Verificacion de conceptos por humanos: un revisor puede recalcular cada formula sobre una imagen y comprobar la activacion de la neurona, algo util en procesos de validacion de modelos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision held-out | 84,62 % |
| Control plano equivalente (mismo numero de parametros, mismos datos, misma receta) | 84,86 % |
| Precision con capa de conceptos a cero | 9,98 % |
| Precision con capa de conceptos barajada entre imagenes | 9,55 % |
| Conceptos que pasan auditoria de honestidad | 20 de 21 |
| Parametros | 15.977 |
| Conceptos de la capa intermedia | 21 |
| Dispersion entre semillas (arquitectura interpretable, 3 semillas) | 0,82 puntos |
| Dispersion entre semillas (control plano, 3 semillas) | 4,28 puntos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el checkpoint en float32 ocupa del orden de decenas de kilobytes y el modelo se ejecuta en CPU.
- GPU recomendadas: innecesarias; cualquier CPU basta. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y tambien en entornos sin GPU, incluidos dispositivos de bajos recursos.
- Opciones de despliegue: carga directa con numpy y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlassNet-readable-vision-21 | 15.977 | Imagen 28x28 grayscale (Fashion-MNIST) | 84,62 % held-out | MIT | Hugging Face |
| Control plano del propio autor | 15.977 | Imagen 28x28 grayscale (Fashion-MNIST) | 84,86 % held-out | no disponible | Referencia interna de la model card |
| Otros clasificadores de Fashion-MNIST | no disponible | Imagen 28x28 grayscale | no disponible | no disponible | no disponible |

La model card solo compara el modelo con su control plano de igual tamano y misma receta. No se dispone de datos de benchmarks frente a otros clasificadores de Fashion-MNIST en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: clasifica unicamente imagenes de 28x28 en escala de grises de Fashion-MNIST; no generaliza a fotografias.
- No describe imagenes en palabras ni genera texto; es exclusivamente un clasificador.
- Precision limitada (84,62 %), adecuada para el tamano del modelo pero lejos de clasificadores modernos de vision.
- Un concepto de los 21 no pasa la auditoria de honestidad, por lo que la legibilidad completa no esta garantizada en todos los casos.
- La capa de conceptos esta fijada por formulas; cambios en distribucion de pixeles (por ejemplo, otras resoluciones o imagenes en color) invalidan las formulas.
- Riesgo de sesgo: Fashion-MNIST contiene prendas de vestir con distribuciones de clase y estilos propios; el modelo puede heredar sesgos del dataset.
- Riesgo de alucinacion en sentido clasico no aplica (no genera texto), pero puede asignar clases erroneas con confianza basada en conceptos que no describen la imagen.
- Licencia MIT: permite uso comercial, pero conviene revisar los terminos del dataset Fashion-MNIST para usos derivados.
- Modelo de investigacion con 0 descargas y creado en 2026; no hay evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/blueprint-ai-hq-main/glassnet-readable-vision-21
- Dataset Fashion-MNIST (referencia de entrenamiento): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada
