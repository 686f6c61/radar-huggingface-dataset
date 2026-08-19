# Sejibeji/dirty-man

## Resumen

The Dirty Man es una arquitectura neuronal auto-reconfigurable desarrollada por Sejibeji que decide dinámicamente qué subred computa cada muestra de entrada. Su componente central es el **Switch Operator**, un mecanismo de enrutamiento sobre nueve primitivas neuronales —lineal, densa, ReLU, CNN, RNN, LSTM, GAN, autoencoder y transformer— cada una con su propia lente inductiva. Un "ojo" visual extrae señales de la entrada, una "vía de objetivo" codifica la tarea, y un router diferenciable asigna pesos de combinación por muestra. El modelo se presenta como una solución al problema de adaptación estructural en entornos cambiantes, con especial énfasis en transferencia sim2real y enrutamiento interpretable.

La relevancia actual radica en su enfoque de **mixture-of-experts dinámica** aplicada a dominios no lingüísticos, con un protocolo de entrenamiento en tres fases (calentamiento de primitivas, entrenamiento del router supervisado por oráculo y ajuste conjunto) que evita el colapso de mezcla. Los resultados reportados muestran mejoras frente a arquitecturas estáticas en clasificación mixta, transferencia sim2real y reconstrucción condicionada por objetivo. El modelo está implementado en PyTorch, con licencia MIT, y su repositorio incluye experimentos reproducibles, figuras y un playground interactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Switch Operator: 9 primitivas (linear, dense, ReLU, CNN, RNN, LSTM, GAN, autoencoder, transformer) con router Gumbel-Softmax y bottleneck compartido |
| Parametros totales | no disponible (las adaptaciones estructurales reportadas usan 4.659 params; las de pesos 16.330 params) |
| Parametros activos | no disponible (el router selecciona una o varias primitivas por muestra, pero no se especifica el conteo de activos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa muestras de entrada de dimension fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (trabaja con datos numericos, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato nativo, probablemente .pt o .pth; no se menciona safetensors) |

## Arquitectura y entrenamiento

La arquitectura se compone de un **banco de nueve primitivas** que procesan la misma entrada en paralelo, cada una con una lente inductiva distinta (lineal, densa, ReLU, CNN, RNN, LSTM, GAN, autoencoder, transformer). Un **ojo visual** extrae señales de la entrada y una **vía de objetivo** codifica la tarea; ambos alimentan un **router diferenciable** que produce pesos de combinación por muestra mediante Gumbel-Softmax con temperatura anealed (suave durante entrenamiento, dura en despliegue). Todas las primitivas emiten a un **espacio latente de bottleneck compartido**, lo que mantiene la continuidad geométrica de las rutas conmutadas para la cabeza final.

El entrenamiento sigue un protocolo en tres etapas: primero se calientan las primitivas de forma independiente, luego se entrena el router con supervisión de un oráculo (que indica qué primitiva es la correcta para cada muestra), y finalmente se realiza un ajuste conjunto. Este protocolo evita el colapso de mezcla y produce una política de enrutamiento legible. Los experimentos incluyen ablaciones que muestran que quitar el bottleneck, el annealing, el ojo o la invarianza de dominio cambia la precisión en ≤0.001, lo que sugiere que el diseño es robusto a esas modificaciones.

## Capacidades

- Clasificacion de muestras en dominios mixtos (sinteticos y reales) con enrutamiento dinamico por muestra.
- Reconstruccion condicionada por objetivo: el router especializa la primitiva segun la tarea (clasificar → ReLU, reconstruir → lineal), logrando un error de reconstruccion 7 veces menor que el modelo agnostico al objetivo.
- Transferencia sim2real sin reentrenamiento: modelos entrenados con glifos sinteticos transfieren a digitos MNIST reales, superando a arquitecturas estaticas (Switch Operator 0.334 vs CNN estatica 0.313 vs MLP estatico 0.312).
- Adaptacion estructural: ajusta la estructura de la red (4.659 parametros) en lugar de los pesos (16.330 parametros), logrando mejor rendimiento con menos parametros en transferencia sim2real.
- Intervencion en entrenamiento: actua como asistente que detecta el regimen de fallo de un aprendiz (p.ej. pendulos energeticos) y enruta esas muestras a un experto fisico que conserva energia, reduciendo la violacion de energia por paso 16 veces.
- Enrutamiento interpretable: la politica del router es legible; por ejemplo, en datos reales de escritura manual asigna pesos altos a CNN (0.67) y densa (0.33), indicando que ha aprendido a identificar la lente espacial necesaria.

## Casos de uso

- Clasificacion de imagenes con dominio cambiante: el modelo puede adaptar su ruta de computacion cuando los datos de entrada cambian de distribucion (p.ej. de simulacion a camara real), sin necesidad de reentrenar todos los pesos.
- Reconstruccion de señales con objetivos multiples: en tareas donde se alternan objetivos de clasificacion y reconstruccion, el router selecciona la primitiva adecuada por muestra, mejorando la calidad de reconstruccion frente a un modelo unico.
- Asistente de entrenamiento para correccion de errores: puede monitorizar a un modelo base y desviar muestras problematicas a un experto especializado, como en el ejemplo del pendulo donde la violacion de energia cae de 0.42 a 0.026.
- Adaptacion estructural en robots o simuladores: la capacidad de adaptar la estructura (no solo los pesos) con pocos parametros es util para transferir politicas de simulacion a hardware real con datos limitados.
- Sistema de enrutamiento interpretable para diagnostico: la politica legible del router permite auditar que tipo de procesamiento recibe cada muestra, util en entornos regulados donde se requiere explicabilidad.
- Benchmark de arquitecturas dinamicas: sirve como plataforma de investigacion para comparar estrategias de mixture-of-experts con enrutamiento por muestra frente a arquitecturas estaticas.

## Benchmarks y rendimiento

Los resultados reportados en la model card (3 semillas, reproducidos desde `results/*.json`) son:

| Protocolo | Resultado |
|---|---|
| A — dominio mixto | Switch Operator 0.834 > MLP estatico 0.829 > ReLU standalone 0.822 > CNN estatica 0.789 > router uniforme 0.753 |
| B — transferencia sim→real | zero-shot real 0.474 vs CNN estatica 0.388; adaptacion estructural (4.659 params) 0.475/0.9997 vs adaptacion de pesos (16.330 params) 0.395/0.984 |
| C — via de objetivo | clasificacion condicionada por objetivo 0.821 / reconstruccion MSE 0.020 vs agnostico 0.817 / 0.143 (7x mejor reconstruccion) |
| D — ablaciones | quitar bottleneck / annealing / ojo / invarianza de dominio cambia la precision en ≤0.001 |
| E — MNIST real | transferencia zero-shot: Switch Operator 0.334 > CNN estatica 0.313 > MLP estatico 0.312; adaptacion estructural 0.433 ≈ adaptacion de pesos 0.432 |

No se han publicado resultados de benchmarks comparativos con otros modelos de la misma categoria (p.ej. MoE clasicas como Mixtral o Switch Transformer) en la informacion disponible.

## Requisitos de hardware

- El modelo es ligero: las primitivas son redes pequenas (la adaptacion estructural usa 4.659 parametros y la de pesos 16.330), por lo que cabe en cualquier GPU consumer (p.ej. RTX 3060 o superior) e incluso en CPU.
- No se especifican requisitos de VRAM, pero por el tamano estimado, la inferencia deberia requerir menos de 1 GB de memoria.
- El repositorio incluye un kernel de Kaggle para ejecutar los protocolos A, C, E y la intervencion en GPU.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con cualquier framework que soporte PyTorch (no se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son para modelos de lenguaje).
- Latencia y throughput: no disponibles; al ser un modelo pequeno, se espera latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. El modelo se compara internamente con arquitecturas estaticas (MLP, CNN) y con variantes del propio Switch Operator (router uniforme, sin bottleneck, etc.). No hay datos de comparacion con otros sistemas de mixture-of-experts dinamicos o con modelos de lenguaje MoE.

## Limitaciones y advertencias

- Es un modelo de investigacion, no validado en produccion; los resultados provienen de experimentos controlados con datos sinteticos y MNIST.
- No es un modelo de lenguaje ni de generacion de texto; su alcance se limita a tareas de clasificacion, reconstruccion y adaptacion de dominio sobre datos numericos.
- La politica de enrutamiento puede no generalizar a dominios muy distintos de los entrenados; la transferencia sim2real se demostro solo en glifos sinteticos → MNIST.
- No se han evaluado sesgos ni riesgos de alucinacion (no aplica al no ser generativo).
- La licencia MIT permite uso comercial, pero el modelo no incluye garantias de rendimiento ni soporte.
- El repositorio depende de datos externos (MNIST se descarga una vez) y de un entorno Python con dependencias no especificadas en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Sejibeji/dirty-man
- Kernel de Kaggle (experimentos en GPU): https://www.kaggle.com/code/sehajrsingh/dirty-man-headline-experiments
- Repositorio del modelo (incluye codigo, resultados y papers): no se proporciona URL directa en la model card, pero se menciona la estructura del repositorio local.
