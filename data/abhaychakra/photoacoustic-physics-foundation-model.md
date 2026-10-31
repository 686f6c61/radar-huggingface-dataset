# abhaychakra/photoacoustic-physics-foundation-model

## Resumen

El Photoacoustic Physics Foundation Model es un modelo fundacional científico (surrogate model) desarrollado por Abhay Chakra Sadineni que aprende simultáneamente física de la luz, el calor y el sonido en tejidos biológicos. Se trata de un transformer preentrenado sobre múltiples sistemas físicos (difusión óptica, conducción térmica, acústica, transporte, ecuaciones de Burgers y Fisher) que, tras ese preentrenado multiphysics, es capaz de predecir la cadena fotoacústica completa (la luz calienta el tejido, el calor genera ondas acústicas) sin haber visto nunca ese acoplamiento durante el entrenamiento. Es relevante porque demuestra que el preentrenado sobre sistemas físicos relacionados permite generalizar a combinaciones no vistas, un resultado clave para la scientific machine learning y la simulación de sustitución de solvers numéricos costosos.

El repositorio contiene cuatro redes principales en formato safetensors (entre 2,7 y 8,9 millones de parámetros) para geometrías 1D (slab), cilíndrica/esférica, rejilla 2D (64 × 64) y rejilla 3D (32 × 32 × 32), además de las 73 redes del estudio en una carpeta opcional. El código de entrenamiento y evaluación está disponible en GitHub y las redes pueden ejecutarse directamente en el navegador web. En conjuntos de test bloqueados, el error de predicción a un paso queda entre 0,056 y 0,177 respecto al error del baseline trivial de repetir el último fotograma, superando el objetivo pre-registrado de 0,2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm, 6 capas, 6 cabezas de atencion, anchura 192 |
| Parametros totales | 2.732.760 (1D y cilindro/esfera); 3.299.712 (2D); 8.866.752 (3D) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 fotogramas de entrada x 3 campos (16 o 64 tokens segun geometria) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada red es un transformer pre-norm de seis capas con anchura 192 y seis cabezas de atencion. Recibe cuatro fotogramas pasados de tres campos fisicos (tasa de fluencia optica, aumento de temperatura y presion acustica), mas canales de derivada, y predice la tasa de cambio del estado; el siguiente fotograma se obtiene sumando esa tasa al ultimo fotograma (esquema de integracion tipo Euler). Los tokens de entrada son 16 en las geometrias 1D y radial, y 64 en las rejillas 2D y 3D.

El entrenamiento se realizo por rondas progresivas: la ronda 1 uso ocho sistemas fisicos en geometria slab (20.000 pasos), la ronda 2 anadio los dos enlaces acoplados (fototermico y termoacustico) con entrenamiento estabilizado, y la ronda 3 amplio a 24 sistemas en geometrias de cilindro y esfera (hasta 60.000 pasos). Las redes de rejilla 2D y 3D se entrenaron con siete sistemas durante 30.000 pasos. El estudio incluye experimentos de escalado (3, 5 y 8 sistemas), redes especializadas por sistema, redes de referencia entrenadas directamente sobre la cadena fotoacustica (oracle), y comparaciones de fine-tuning frente a entrenamiento desde cero con 1, 5 y 25 trayectorias. La composicion exacta del dataset y el uso de tecnicas como RLHF no aplican aqui al ser un modelo cientifico; el registro completo de cada entrenamiento esta en los ficheros `log.json` y en `experiments/train_jobs.py` del repositorio de GitHub.

## Capacidades

- Prediccion de la evolucion temporal acoplada de tres campos fisicos (flujo optico, temperatura, presion acustica) en tejido.
- Generalizacion zero-shot a la cadena fotoacustica completa (acoplamiento luz-calor-sonido) no vista durante el preentrenado.
- Simulacion en geometrias 1D (slab), radial (cilindro y esfera), y rejillas 2D (64 × 64 celdas de 0,2 mm) y 3D (32 × 32 × 32 celdas de 0,4 mm).
- Prediccion multistep mediante rollout iterativo (hasta 10 pasos evaluados, con error aun inferior al baseline).
- Aprendizaje por transferencia: el fine-tuning desde la red preentrenada supera al entrenamiento desde cero con pocos datos (1, 5 o 25 trayectorias).
- Ejecucion en navegador web sin hardware especializado.

## Casos de uso

- Simulacion rapida de generacion fotoacustica: sustituye a solvers numericos acoplados (optica difusa + termica + acustica) por una inferencia de red, util para explorar parametros de fuentes laser en imagen fotoacustica.
- Prototipado de sistemas de imagen fotoacustica: permite evaluar en el navegador como responde el tejido a distintos pulsos antes de montar un experimento real.
- Investigacion en scientific machine learning: el conjunto de 73 redes y sus registros sirve como banco de pruebas para estudiar generalizacion multiphysics y transferencia entre sistemas fisicos.
- Aprendizaje por transferencia con datos escasos: con solo 1 a 25 trayectorias de un sistema nuevo, el fine-tuning desde el modelo preentrenado alcanza mejores resultados que entrenar desde cero, util cuando generar datos de simulacion es caro.
- Validacion de esquemas de integracion temporal: el enfoque de prediccion de tasas de cambio (en lugar del estado absoluto) es replicable en otros surrogate models de dinamica temporal.
- Docencia y divulgacion de fisica biomedica: la demo web permite mostrar interactivamente el acoplamiento optico-termico-acustico sin instalar software de simulacion.
- Benchmarking de arquitecturas transformer para PDEs: las comparaciones incluidas (con y sin sistemas de enlace, oracle, especialistas) permiten evaluar que aporta el preentrenado multiphysics.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre conjuntos de test bloqueados de 200 trayectorias de la cadena fotoacustica (100 en 3D). Los valores de "un paso" son ratios respecto al error de repetir el ultimo fotograma (menor es mejor; objetivo pre-registrado: 0,2 o menos).

| Geometria | Un paso, esta red | Un paso, sin sistemas de enlace | Un paso, red oracle (entrenada en la cadena) | Diez pasos, esta red | Diez pasos, repitiendo ultimo fotograma |
|---|---|---|---|---|---|
| Slab 1D | 0,177 | 0,529 | 0,017 | 0,245 | 0,688 |
| Cilindro | 0,058 | 0,096 (a) | no entrenada | 0,177 | 0,684 |
| Esfera | 0,056 | 0,095 (a) | no entrenada | 0,178 | 0,642 |
| Rejilla 2D | 0,089 | 0,358 | 0,020 | 0,425 | 0,934 |
| Rejilla 3D | 0,100 | 0,458 | 0,030 | 0,464 | 1,171 |

(a) Para cilindro y esfera, la comparacion es la red 1D entrenada con la misma receta pero sin datos de cilindro o esfera.

No se han publicado benchmarks de tipo MMLU, HumanEval o GSM8K, al no tratarse de un modelo linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con modelos de 2,7 a 8,9 millones de parametros en safetensors, cualquier GPU moderna con 1-2 GB de VRAM (o incluso CPU) es suficiente. No hay cifras oficiales publicadas.
- GPU recomendadas: no se especifican; dada la escala de los modelos, una GPU de consumo (GTX 1650, RTX 3060, RTX 4090 o superior) sobra con diferencia para inferencia.
- Consumer GPU: cabe sobradamente en cualquier GPU de consumo; incluso la ejecucion en navegador web es viable, lo que indica requisitos minimos.
- Opciones de despliegue: PyTorch nativo (libreria declarada), carga mediante el codigo del repositorio de GitHub, y demo web en el navegador. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Photoacoustic Physics Foundation Model | 2,7-8,9 M (4 redes principales; hasta 14,3 M en variantes) | Cadena fotoacustica y sistemas multiphysics 1D/2D/3D | CC-BY-4.0 | Pesos en HuggingFace, codigo en GitHub, demo web |
| Variantes sin sistemas de enlace (mismo estudio) | Similares | Mismos sistemas sin acoplamientos fototermico/termoacustico | CC-BY-4.0 | Incluidas en `all_networks/` del mismo repo |
| Redes oracle del estudio (entrenadas en la cadena) | Similares | Cadena fotoacustica directamente | CC-BY-4.0 | Incluidas en `all_networks/` |

No hay modelos externos directamente comparables publicados en la informacion disponible; la comparacion mas relevante es interna al propio estudio, que cuantifica el beneficio del preentrenado multiphysics (error 0,056-0,177 frente a 0,096-0,529 sin los sistemas de enlace).

## Limitaciones y advertencias

- Es un modelo cientifico de dominio especifico, no un modelo linguistico: no genera texto, no soporta tool calling ni capacidades conversacionales.
- El error en rollout de 10 pasos crece de forma notable (0,177-0,464 frente a 0,056-0,177 a un paso), por lo que simulaciones largas acumularan desviacion; conviene validar contra datos reales o solvers numericos.
- Las geometrias y resoluciones estan fijadas por entrenamiento (por ejemplo, 128 puntos sobre 12,8 mm en 1D; celdas de 0,2 mm en 2D y 0,4 mm en 3D); no hay evidencia publicada de generalizacion a otras escalas o geometrias arbitrarias.
- La red oracle entrenada directamente sobre la cadena sigue siendo mas precisa (error 0,017-0,030 a un paso), de modo que si se dispone de datos del sistema objetivo, el modelo fundacional es punto de partida, no sustituto del entrenamiento especializado.
- La licencia CC-BY-4.0 exige atribucion al reutilizar los pesos, aunque permite uso comercial.
- Descargas registradas: 0 en el momento de redactar la ficha, por lo que no hay historial de uso en produccion ni comunidad de soporte consolidada.
- No se ha publicado cuantizacion ni optimizaciones de inferencia; el consumo energetico y la latencia en despliegues a gran escala no estan documentados.

## Enlaces

- HuggingFace: https://huggingface.co/abhaychakra/photoacoustic-physics-foundation-model
- Repositorio de codigo (GitHub): https://github.com/abhaysadineni/photoacoustic-physics-foundation-model
- Demo web: https://www.abhaychakra.com/p/photoacoustic-pfm/
- Paper: no disponible
