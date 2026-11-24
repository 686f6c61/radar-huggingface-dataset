# BobbbWang/CODA

## Resumen

CODA (Score-based Conditional Out-of-Distribution Augmentation for Graph Covariate Shift) es un conjunto de checkpoints preentrenados publicados por Bohan Wang y colaboradores, asociados al articulo aceptado en KDD 2027. No se trata de un modelo de lenguaje, sino de un generador de grafos basado en difusion por score (score-based diffusion) condicionado por un clasificador, disenado para aumentar el conjunto de entrenamiento de clasificadores de grafos en escenarios de covariate shift (desplazamiento de la distribucion de entrada entre entrenamiento y test).

El modelo resuelve un problema concreto en aprendizaje sobre grafos: cuando la distribucion de los grafos de test difiere de la de entrenamiento, los clasificadores GNN degradan su rendimiento. CODA genera grafos sinteticos guiados por un clasificador, con un parametro de exploracion lambda que modera el score, para enriquecer el entrenamiento y mejorar la generalizacion fuera de distribucion. Los checkpoints cubren seis particiones del benchmark GOOD (Motif basis y size, CMNIST color, SST2 length, HIV scaffold y size).

La relevancia es metodologica y de investigacion: los pesos son pequenos (entre 1,06 M y 8,15 M de parametros por componente), se distribuyen como diccionarios de tensores PyTorch y estan pensados para reproducir los experimentos del paper mediante el repositorio de codigo oficial. No es un modelo de proposito general ni ofrece inferencia de texto, codigo o vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph transformer (red de score) + clasificador dependiente del tiempo; difusion por score (SDE) |
| Parametros totales | Variable por particion: score 7,13 M-8,15 M; clasificador 1,06 M-2,93 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre grafos) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | No disponible (no procesa lenguaje natural de forma generativa) |
| Licencia | GPL-3.0 |
| Formato de pesos | `.pth` y `.pt` (diccionarios de tensores PyTorch, `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

CODA combina un modelo de difusion generativo sobre grafos con un clasificador guia. La red de score `s_θ` es un graph transformer de 8 o 9 capas (7,13 M-8,15 M de parametros) que aprende el score de un proceso de difusion basado en SDE sobre estructuras de grafo. El clasificador `φ_t` es dependiente del tiempo (3 capas y 2,74 M en Motif y CMNIST; 1 capa y 1,06 M en HIV; 2,93 M en SST2) y se emplea tanto para la guia condicional como para el filtro de confianza durante el muestreo. El parametro de exploracion lambda modera el score para controlar la novedad de los grafos generados.

El entrenamiento se realiza por particion del benchmark GOOD. Los checkpoints documentan el numero de epocas: 28.000 para Motif (basis y size), 20.000 para CMNIST color, 2.000 para SST2 length, 1.000 para HIV scaffold y 500 para HIV size. El clasificador se selecciona en la mejor epoca de validacion (por ejemplo, epoca 2.658 en Motif basis o epoca 236 en HIV size). El repositorio incluye ademas `train_node_flags.pt`, que codifica las mascaras de nodos de los grafos de entrenamiento (prior empirico del numero de nodos), de modo que el muestreo no requiere los ficheros de entrenamiento del generador. No se detalla en la model card el volumen de tokens ni la composicion exacta del dataset mas alla de las particiones de GOOD.

## Capacidades

- Generacion de grafos sinteticos condicionada por un clasificador, con control de exploracion mediante lambda.
- Aumento de datos para clasificadores de grafos en escenarios de covariate shift.
- Modelado generativo por difusion basada en score sobre estructuras de grafo.
- Filtrado de confianza de muestras generadas mediante el clasificador dependiente del tiempo.
- Soporte de seis particiones del benchmark GOOD (Motif, CMNIST, SST2, HIV).
- Carga directa de pesos con `torch.load(..., weights_only=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Aumento de datos para clasificacion de grafos bajo covariate shift: generar grafos sinteticos con CODA para ampliar el conjunto de entrenamiento de una GNN y mejorar su robustez cuando la distribucion de test difiere de la de entrenamiento, tal como se evalua en las particiones de GOOD.
- Reproduccion de experimentos academicos: cargar los checkpoints de `motif_basis`, `cmnist_color` o `hiv_scaffold` y ejecutar `main.py sample` con las configuraciones del repositorio para replicar los resultados del paper KDD 2027.
- Investigacion en generacion de grafos por difusion: usar la red de score y el clasificador guia como linea base para estudiar difusion condicionada y moderacion del score mediante lambda.
- Analisis de robustez de clasificadores GNN: comparar el rendimiento de un clasificador con y sin aumento generado por CODA en las seis particiones publicadas.
- Experimentos en dominios cientificos con grafos moleculares: las particiones HIV (scaffold y size) permiten estudiar aumento de datos en prediccion de actividad molecular con desplazamiento de andamiaje.
- Desarrollo de pipelines de generacion condicionada: integrar el muestreo por SDE con distintos solvers y pesos de guia definidos en `generation/configs/` para explorar el compromiso entre fidelidad y novedad de los grafos.
- Docencia y formacion: ilustrar covariate shift en grafos y tecnicas de aumento generativo con pesos pequenos y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (precision, F1, etc.) para las particiones de GOOD; solo documenta configuracion de entrenamiento, tamanos y sumas de verificacion SHA-256.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; los modelos son de 1,06 M-8,15 M de parametros por componente (decenas de MB en punto flotante de 32 bits), por lo que caben en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se requiere A100 ni H100. Una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU para grafos pequenos.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se realiza mediante el repositorio oficial de codigo CODA (`generation/main.py`) con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CODA (este) | Generacion de grafos por difusion | 1,06 M-8,15 M por componente | No aplica | GPL-3.0 | Hugging Face + GitHub |
| Alternativas de difusion sobre grafos (p. ej. DiGress, GDSS) | Generacion de grafos por difusion | No disponible en la informacion | No aplica | No disponible | No disponible |
| Modelos de aumento de datos para grafos en GOOD | Aumento para covariate shift | No disponible en la informacion | No aplica | No disponible | No disponible |

No se dispone de datos comparativos verificados en la informacion proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts; cualquier uso en ese sentido es inadecuado.
- Los checkpoints estan atados a particiones concretas del benchmark GOOD; no se garantiza su transferencia a otros dominios o datasets de grafos.
- La licencia GPL-3.0 impone obligaciones de copyleft: el uso comercial o la integracion en productos derivados puede requerir liberar el codigo bajo la misma licencia; conviene revisarlo con asesoria legal.
- Riesgo de que los grafos generados no respeten restricciones estructurales del dominio real; el filtro de confianza mitiga pero no elimina este riesgo.
- Dependencia del repositorio de codigo oficial para el muestreo; la model card no documenta una API de inferencia independiente.
- Sin datos publicados de benchmarks en la informacion disponible, por lo que no es posible validar el rendimiento de forma externa sin ejecutar los experimentos.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre particiones especificas de GOOD, pueden heredar los sesgos de esos datasets.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/BobbbWang/CODA
- Repositorio de codigo CODA: https://github.com/Bohan7/CODA
- Benchmark GOOD: https://github.com/divelab/GOOD
- Paper: Score-based Conditional Out-of-Distribution Augmentation for Graph Covariate Shift (KDD 2027), Wang, Chang, Jin y Lin.
