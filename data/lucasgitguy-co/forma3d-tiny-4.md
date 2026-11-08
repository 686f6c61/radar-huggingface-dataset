# Lucasgitguy-co/forma3d-tiny-4

## Resumen

Forma3D Tiny 4 es un modelo experimental de imagen a 3D desarrollado por Lucasgitguy-co, publicado bajo licencia Apache 2.0. Se trata de un prototipo de investigación de 306.321 parámetros que convierte una única imagen de entrada en una representación de objeto mediante Gaussian splatting, sin producir mallas texturizadas. Es la continuación por fine-tuning de Forma3D Tiny 3 y se enmarca en una línea de trabajo centrada en modelos compactos de reconstrucción 3D ejecutables en hardware de consumo.

El modelo mantiene la arquitectura de sus predecesores: una rejilla de 16³ con anchura 64 y un máximo de 4.096 slots gaussianos. Fue entrenado localmente en un MacBook Air con chip M4 y 16 GB de memoria unificada usando PyTorch con backend MPS, en precisión float32 y con un tamaño de lote de 8. Su relevancia radica en que documenta de forma rigurosa el proceso de selección de checkpoint, la validación con conjuntos reservados y las métricas de reconstrucción, algo poco habitual en prototipos de este tamaño.

La contribución principal de esta versión es la ampliación del conjunto de datos de entrenamiento a 677 objetos del dataset ABO (Amazon Berkeley Objects) con 12 vistas por objeto, así como la selección de un umbral de inferencia recomendado de 0,6. El modelo está pensado exclusivamente para investigación y no soporta prompting textual ni entradas fotográficas naturales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal compacta con rejilla 16³, anchura 64 y hasta 4.096 slots gaussianos (image-to-Gaussian) |
| Parámetros totales | 306.321 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | No disponible (entrenado y distribuido en float32) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`); salida en PLY gaussiano |

## Arquitectura y entrenamiento

El modelo es una red compacta que mapea una imagen de entrada a un conjunto de gaussianas 3D organizadas sobre una rejilla de 16³ con anchura 64 y un máximo de 4.096 slots. No es un transformer ni un modelo de lenguaje: se trata de un modelo de visión específico para reconstrucción 3D, entrenado con supervisión de malla proxy (mesh-proxy-supervision) y salida en Gaussian splatting. El checkpoint se inicializa desde Forma3D Tiny 3 (commit `3469f527c5f6833d654f62653ee92e0f73854b33`) y se afina durante 6.000 pasos con AdamW a una tasa de aprendizaje de 5e-5.

El conjunto de datos ampliado contiene 1.024 objetos ABO en total, de los cuales 677 se usan para entrenamiento con 12 vistas cada uno (8.124 entradas: cuatro acimuts y tres elevaciones). Se preservan las asignaciones originales de 512 objetos y se agrupan identidades duplicadas antes de asignar nuevos objetos. La validación común consta de 87 objetos y 348 vistas, y se reservan 100 objetos adicionales (400 vistas) para confirmación final. Se entrenaron tres variantes (datos originales, datos de 12 vistas y datos con objetos ampliados) y se seleccionó la de objetos ampliados maximizando el IoU de silueta en validación, sujeto a no empeorar el IoU de ocupación ni la distancia Chamfer, con umbrales de 0,3, 0,4, 0,5 y 0,6 evaluados en validación. El checkpoint final es la semilla 44 en el paso 6.000, con una repetición independiente de semilla 45 como confirmación.

## Capacidades

- Generación de representaciones 3D de objetos a partir de una única imagen de entrada, en formato de Gaussian splatting (salida PLY).
- Reconstrucción de silueta y ocupación volumétrica de objetos a partir de renders ortográficos sobre fondo negro.
- Inferencia en CPU y en GPU mediante Metal (MPS) en Apple Silicon.
- Ejecución en hardware de consumo: entrenado y ejecutable en un MacBook Air M4 con 16 GB de memoria unificada.
- No soporta prompting textual ni condicionamiento por lenguaje.
- No genera mallas texturizadas; la salida es un conjunto de gaussianas, no una malla.
- No validado para fotografías naturales, renderizado fotorrealista, puntos de vista arbitrarios, estructuras finas ni superficies ocultas.

## Casos de uso

- Prototipado de investigación en reconstrucción 3D: sirve como base reproducible para experimentar con supervisión de malla proxy y Gaussian splatting en entornos con recursos limitados, gracias a sus 306.321 parámetros y a su receta de entrenamiento publicada en `recipe/`.
- Docencia y formación en visión 3D: el modelo y su pipeline completo (entrenamiento, evaluación y CLI) permiten ilustrar el ciclo completo de un modelo image-to-3D en un portátil de consumo.
- Generación de proxies 3D para previsualización: a partir de renders ortográficos de objetos, el modelo produce un PLY gaussiano útil como proxy visual rápido en herramientas de previsualización, sin pretensión de calidad de malla final.
- Evaluación comparativa de arquitecturas compactas: su conjunto de validación reservado (87 objetos / 348 vistas) y su conjunto de confirmación (100 objetos / 400 vistas) permiten usarlo como línea base en estudios comparativos de modelos image-to-3D de bajo coste.
- Automatización de pipelines de investigación en ABO: integrable en scripts que procesen lotes de renders del dataset Amazon Berkeley Objects para generar gaussianas y medir IoU de silueta y distancia Chamfer de forma automatizada.
- Experimentación con umbrales de inferencia: la CLI permite ajustar el umbral (recomendado 0,6) para estudiar el compromiso entre cobertura de silueta y precisión de ocupación en distintas categorías de objetos.

## Benchmarks y rendimiento

Resultados de confirmación sobre 100 objetos reservados y 400 vistas proxy (mayor IoU y menor Chamfer es mejor):

| Checkpoint | Umbral | IoU de silueta | IoU de ocupación | Distancia Chamfer |
|---|---:|---:|---:|---:|
| v3 original | 0,5 | 0,463688 | 0,337398 | 0,069585 |
| Tiny 4, semilla 44 | 0,5 | 0,512971 | 0,424836 | 0,053612 |
| Tiny 4, semilla 44 (recomendado) | 0,6 | 0,540550 | 0,434657 | 0,052380 |
| Tiny 4, semilla 45 (repetición) | 0,6 | 0,546573 | 0,412526 | 0,054105 |

Intervalos de confianza bootstrap al 95 % (2.000 remuestras, agrupados por objeto) para la diferencia semilla 44 recomendada frente a v3 original con umbral 0,5: IoU de silueta +0,07686 [0,06621, 0,08926]; IoU de ocupación +0,09726 [0,07289, 0,12272]; Chamfer −0,01721 [−0,03762, −0,00622]. Los intervalos de la segunda semilla también excluyen el cero en la dirección favorable para las tres métricas.

Rendimiento de entrenamiento medido en un benchmark de 15 minutos con lote de 8: 650,02 muestras/s, excluyendo preparación y validación; pico de RSS del proceso de aproximadamente 496 MiB y 141 MiB de asignación del driver MPS (solapados en memoria unificada).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 306.321 parámetros en float32, el checkpoint ocupa del orden de 1,2 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte PyTorch; el autor valida ejecución en Apple Silicon mediante Metal (MPS) y en CPU.
- Cabe en GPU de consumo: sí, con enorme margen; el entrenamiento se realizó en un MacBook Air M4 con 16 GB de memoria unificada.
- Opciones de despliegue: CLI propia del repositorio (`image3d generate` y `image3d preview`), instalable con `pip install .` sobre Python 3.12; requiere Git LFS para descargar el checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el benchmark reportado es de entrenamiento (650,02 muestras/s con lote de 8 en MPS); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Forma3D Tiny 4 | 306.321 | Imagen (render ortográfico) | Gaussian PLY | Apache 2.0 | Hugging Face |
| Forma3D Tiny 3 (modelo base) | No disponible | Imagen (render ortográfico) | Gaussian PLY | Apache 2.0 | Hugging Face |
| Forma3D-Tiny v0.2 | 306.321 | Imagen (render sintético) | Gaussian PLY | No disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; la comparación se limita a la línea Forma3D del mismo autor.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como `research-prototype`; no está pensado para uso en producción ni como modelo general de foto a 3D.
- Entradas fuera de dominio: solo se validó con renders ortográficos de proxy gaussiano sobre fondo negro; las fotografías naturales, el renderizado fotorrealista, los puntos de vista arbitrarios, las estructuras finas y las superficies ocultas no están validados. Centrar una foto corriente no la convierte en una entrada válida.
- Salida no mallada: el resultado es un PLY gaussiano, no una malla texturizada; la distancia Chamfer mide la distancia entre centros gaussianos predichos y muestras de superficie de malla en coordenadas normalizadas, no la calidad de la malla reconstruida.
- Sin soporte de texto: no admite prompting textual de ningún tipo.
- Umbral crítico: la CLI hereda por defecto un umbral de 0,5, pero el recomendado es 0,6; usar el valor por defecto degrada las métricas de confirmación.
- Duplicados y exposición: pueden quedar casi duplicados en los datos y no se conoce por completo la exposición previa de los objetos ancestros en el entrenamiento.
- Sesgos: no se documentan sesgos específicos más allá de la composición del dataset ABO (objetos de catálogo de Amazon), que condiciona la distribución de formas y categorías.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse LICENSE, NOTICE y THIRD_PARTY.md; los activos ABO y las imágenes de ejemplo derivadas se atribuyen a Amazon.com y a los contribuyentes de Amazon Berkeley Objects bajo CC BY 4.0.
- Alcance de las métricas: las mediciones presentadas no establecen una calidad de reconstrucción amplia en el mundo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/forma3d-tiny-4
- Modelo base Forma3D Tiny 3: https://huggingface.co/Lucasgitguy-co/forma3d-tiny-3
- Forma3D-Tiny v0.2: https://huggingface.co/Lucasgitguy-co/forma3d-tiny
- Colección de modelos 3D del autor: https://huggingface.co/collections/Lucasgitguy-co/3d-models
- Dataset ABO (Amazon Berkeley Objects): https://amazon-berkeley-objects.s3.amazonaws.com/index.html
