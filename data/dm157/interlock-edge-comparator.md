# dm157/interlock-edge-comparator

## Resumen

interlock-edge-comparator es un modelo de vision por computador especializado en el emparejamiento de bordes de piezas de puzle. Lo desarrolla dm157 como componente del proyecto Interlock, un solucionador automatico de puzles tipo jigsaw. El modelo recibe ventanas de costura (seam windows) de dos piezas candidatas y devuelve un logit que indica la probabilidad de que la segunda pieza sea la vecina derecha de la primera; rotando las entradas se cubren las cuatro direcciones posibles. El solucionador convierte esas puntuaciones en una colocacion completa del puzle.

La relevancia del modelo esta en su robustez: esta entrenado especificamente para tolerar contornos de pieza que no son perfectos a nivel de pixel, como ocurre cuando las piezas proceden de una fotografia real, y para combinar informacion de forma (contorno) y de imagen (color). Frente a un comparador baseline, mejora drasticamente en escenarios con error de contorno: pasa de un 4,5% a un 86,3% de Top-1 con error de contorno irregular de hasta el 5% de una pieza.

Se trata de un modelo pequeno y ligero (repo de 0,0 GB, pesos en `edge_comparator.pt`), implementado en PyTorch y pensado para ejecutarse incluso en Apple Silicon (MPS). No es un modelo de lenguaje: no genera texto ni razona de forma general, sino que puntua pares de piezas para resolver un problema geometrico-visual concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (comparador de bordes en PyTorch; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de ventanas de costura de forma (5, 184, 80)) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo PyTorch, `edge_comparator.pt`) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | SA-1B Dataset Research License (solo investigacion y uso no comercial) |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un comparador de bordes que opera sobre ventanas de costura de forma (5, 184, 80) en uint8: tres canales RGB mas la mascara de cada pieza, recortadas alrededor de la costura y rellenadas con ceros hasta ese tamano. Produce un logit por ventana, donde valores mas altos indican mayor probabilidad de vecindad. La calibracion requiere dividir los logits por T = 0,73 antes de aplicar un softmax sobre las candidatas. La arquitectura interna concreta no esta detallada en la informacion disponible.

El entrenamiento uso 1500 imagenes de Meta SA-1B, redimensionadas y recortadas a 400 x 400, cortadas en un puzle aleatorio nuevo en cada epoca (piezas de 30-100 px, 6 formas de pestana por puzle). Se introdujo error de segmentacion en los contornos: cada contorno crece o se encoge hasta un 3,5% de una pieza de forma desigual, con tope del 5%, y un 20% de las piezas se mantienen exactas. Para forzar el uso del color, el 50,0% de los ejemplos negativos son senuelos con el contorno exacto del vecino verdadero pero otra parte de la imagen. Ademas, el 12,5% de los puzles se cortan en rejilla recta y otro 12,5% con lineas rectas inclinadas, de modo que la longitud y el angulo del borde no bastan para decidir un emparejamiento. Se entrenaron 15 epocas con AdamW y un ciclo unico de learning rate hasta 0,001 sobre Apple Silicon (MPS), seleccionando la mejor epoca (15) sobre 20 puzles de desarrollo con error de contorno.

## Capacidades

- Puntuacion de vecindad entre dos piezas de puzle: dado un par de piezas, estima la probabilidad de que la segunda sea la vecina derecha de la primera.
- Cobertura de las cuatro direcciones mediante rotacion de las piezas de entrada (derecha, abajo, izquierda, arriba).
- Emparejamiento basado en forma y color combinados, no solo en el contorno.
- Tolerancia a contornos imperfectos: entrenado con error de segmentacion de hasta el 5% de una pieza.
- Robustez a ruido de pixel (evaluado con sigma = 12) y a contornos suavizados.
- Generacion de matriz de puntuaciones `(4, N, N)` mediante `score_matrix`, utilizable por el solucionador greedy de Interlock.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Reconstruccion automatica de puzles fisicos digitalizados: el modelo puntua pares de piezas procedentes de una foto y el solucionador de Interlock los convierte en una colocacion completa, siendo util para digitalizar puzles ya montados o desmontados.
- Verificacion de ensamblajes en fabricacion: comprobar si dos piezas cortadas (por ejemplo, en procesos de troquelado) encajan correctamente, puntuando la compatibilidad de sus bordes con tolerancia a imperfecciones del corte.
- Investigacion en vision por computador sobre emparejamiento de formas: servir como componente o baseline para estudiar matching de contornos y costuras bajo perturbaciones controladas.
- Generacion de datos sinteticos de puzles: integrarse en pipelines que cortan imagenes en piezas y necesitan validar vecindades para tareas de reconstruccion.
- Benchmark de robustez de comparadores de bordes: sus tablas de evaluacion (contorno irregular, ruido de pixel, contornos suavizados) sirven para medir comparadores alternativos bajo condiciones degradadas.
- Alineacion de fragmentos en digitalizacion de documentos o imagenes rotas: la logica de puntuar costuras entre dos fragmentos con mascaras puede aplicarse a reconstruccion de material grafico fragmentado.
- Prototipado en hardware de consumo: por su tamano reducido y soporte de MPS, permite experimentar en un portatil Apple Silicon sin GPU dedicada.

## Benchmarks y rendimiento

Evaluacion sobre 100 puzles de test retenidos por conjunto (30 para bordes rectos), de unas 58 piezas cada uno, con el solucionador greedy de Interlock (etapas 2-4, configuracion por defecto). Se compara el comparador robusto con el baseline.

| Conjunto de test | Top-1 baseline | Top-1 robusto | Placed / neighbors / solved baseline | Placed / neighbors / solved robusto |
|---|---|---|---|---|
| Piezas limpias | 98,6% | 95,5% | 100,0% / 100,0% / 100,0% | 99,9% / 99,9% / 99,0% |
| Ruido de pixel (sigma = 12) | 95,7% | 89,8% | 100,0% / 100,0% / 100,0% | 99,5% / 99,3% / 94,0% |
| Mitad de contornos encogidos 1 px | 28,9% | 91,2% | 42,3% / 35,1% / 3,0% | 99,0% / 99,1% / 95,0% |
| Error de contorno irregular (<= 5% de pieza) | 4,5% | 86,3% | 30,4% / 19,2% / 0,0% | 97,5% / 97,9% / 91,0% |
| Contornos suavizados | 96,9% | 93,9% | 100,0% / 100,0% / 100,0% | 98,8% / 99,3% / 95,0% |
| Bordes rectos, rejilla par | 84,2% | 86,8% | 4,1% / 44,1% / 3,3% | 1,3% / 48,3% / 0,0% |
| Bordes rectos, cortes diagonales | 97,1% | 90,3% | 2,3% / 50,4% / 0,0% | 5,9% / 47,5% / 3,3% |
| Color eliminado (diagnostico, deberia caer) | 33,9% | 30,5% | 85,7% / 86,1% / 77,0% | 75,4% / 74,3% / 64,0% |

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repo ocupa 0,0 GB, por lo que el modelo es muy ligero y cabe en memoria de GPU de gama baja o incluso en CPU.
- GPU recomendadas: no disponibles de forma explicita; el autor entreno en Apple Silicon (MPS), lo que sugiere viabilidad en hardware de consumo.
- Cabe en GPU de consumo: si, dado el tamano reducido del repo; tambien ejecutable en Apple Silicon via MPS.
- Opciones de despliegue: PyTorch nativo mediante `load_comparator` y `score_matrix` del repositorio Interlock; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El propio README compara el comparador robusto con un baseline del mismo proyecto (mismo autor, misma arquitectura de referencia), cuyos resultados aparecen en la tabla de benchmarks. No hay datos publicados sobre alternativas externas de emparejamiento de bordes de puzles.

| Modelo | Parametros | Contexto | Top-1 (contorno irregular) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| interlock-edge-comparator (robusto) | no disponible | no aplica | 86,3% | SA-1B Research (no comercial) | Hugging Face |
| Baseline Interlock | no disponible | no aplica | 4,5% | no disponible | Repositorio Interlock |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y evaluado sobre cortes sinteticos de imagenes reales, no sobre fotografias de piezas fisicas; el salto a fotografia real no esta validado.
- 19 de 10268 pares verdaderos bajo error de contorno quedan descartados antes de ejecutar el comparador porque `pairs.side_types` malinterpreta una pestana o hueco.
- El solucionador greedy bloquea la mayoria de las piezas pronto (umbral 1), por lo que mejores puntuaciones no siempre implican mejores colocaciones.
- En puzles de bordes rectos el rendimiento cae drasticamente (Top-1 entre 86,8% y 90,3%, pero colocacion casi nula); el autor recomienda leer la metrica de vecinos en esos casos.
- Licencia SA-1B Dataset Research License: solo investigacion y uso no comercial; prohibido uso comercial o en produccion, vigilancia, procesamiento biometrico y cualquier intento de identificar personas en las imagenes.
- Los pesos se entrenaron sobre SA-1B, por lo que heredan las restricciones de esa licencia; la release no contiene imagenes ni mascaras de SA-1B.
- Riesgo de sesgo hacia las condiciones sinteticas de entrenamiento (tamanos de pieza de 30-100 px, 6 formas de pestana, error de contorno acotado al 5%).
- Sin capacidades linguisticas ni de razonamiento general; no es utilizable fuera de tareas de emparejamiento de bordes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dm157/interlock-edge-comparator
- Repositorio Interlock: https://github.com/Anika-Bhandarkar/interlock
- Dataset SA-1B (Meta) y licencia: https://ai.meta.com/datasets/segment-anything-downloads/
- Codigo de carga e inferencia: `interlock.models.edge_comparator` (`load_comparator`, `pick_device`, `score_matrix`) en el repositorio Interlock (rama `greedy`, directorio `testing/`)
- Tablas completas de evaluacion y calibracion: archivo `robust_eval.md` (referenciado en el README del modelo)
