# ahm3texe/neurodino

## Resumen

NeuroDino es una red neuronal de 771 parametros que juega al juego del dinosaurio de Chrome (T-Rex runner). No es un modelo de lenguaje ni un transformer: es un perceptron multicapa implementado directamente con NumPy, sin framework de aprendizaje automatico, entrenado mediante un algoritmo genetico (neuroevolucion) en lugar de descenso de gradiente. Lo publica el usuario ahm3texe en HuggingFace con licencia MIT y un unico run de 6,5 horas y 83 generaciones.

La red recibe 12 valores numericos por fotograma (distancias y anchuras de los dos obstaculos siguientes, velocidad del juego, hueco entre obstaculos y estado del dinosaurio) y emite tres acciones posibles: saltar, agacharse o correr. La relevancia del artefacto es principalmente didactica y de investigacion: es un ejemplo reproducible y minimo de neuroevolucion, con codigo de entrenamiento publico, registro de entrenamiento completo y pesos en float64 que se pueden cargar y ejecutar en cualquier maquina sin GPU.

Su mejor marca documentada es de 547.287 puntos, alcanzada en la generacion 77. El propio autor reporta una limitacion estructural clara: la red nunca se agacha y salta todos los pajaros, lo que la hace vulnerable durante la fase de aceleracion del juego (56% de 200 partidas terminaron por debajo de 1.600 puntos), aunque una vez alcanzada la velocidad maxima se mostro estable en 26 partidas de cuatro horas sin choques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) implementado con NumPy: 12 entradas → 48 neuronas ocultas (tanh) → 3 salidas (softmax) |
| Parametros totales | 771 (720 de pesos + 51 de sesgos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no procesa texto, recibe 12 caracteristicas numericas por fotograma |
| Tipos de cuantizacion | no disponible; pesos publicados en float64, sin variantes cuantizadas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible en la model card |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y JSON (`best-brain.json`), float64 |

## Arquitectura y entrenamiento

La arquitectura es un MLP de una sola capa oculta: matriz de pesos `weights_ih` de 48×12, sesgo `bias_h` de 48, matriz `weights_ho` de 3×48 y sesgo `bias_o` de 3. La activacion oculta es tanh y la salida es un softmax de tres clases (saltar, agacharse, correr), aunque en la practica se usa `argmax` sobre los logits, que es equivalente. Las 12 entradas estan normalizadas en el rango [0, 1] o [−1, 1] y se calculan por fotograma a partir del estado del juego: distancia y anchura de los dos obstaculos mas proximos, si el siguiente obstaculo es el pajaro mas alto, velocidad del juego, hueco temporal entre obstaculos, altura y velocidad vertical del dinosaurio durante el salto, y flags de estado de salto y agachado.

El entrenamiento no usa retropropagacion ni gradientes. Cada generacion evalua 50 redes jugando simultaneamente la misma partida, con la distancia recorrida como funcion de fitness. Las dos mejores se conservan intactas (elitismo) y el resto se genera por seleccion por torneo de tamano 3, cruce uniforme y mutacion. La tasa de mutacion es adaptativa: `0.20 × 0.995^generacion / (1 + mejor_score / 2000)`, acotada en [0,05; 0,25]; cada peso mutado recibe ruido gaussiano con σ = 0,05 + tasa/2 o, en el 8% de los casos, un valor nuevo de U(−1, 1). El run documentado duro 6,5 horas y 83 generaciones, con un log por generacion (`training_log.csv`) que recoge mejor, media y record.

## Capacidades

- Control de un agente en un entorno de juego 2D de scroll lateral (Chrome T-Rex) a partir de 12 caracteristicas numericas por fotograma.
- Clasificacion en tres acciones discretas (saltar, agacharse, correr) mediante argmax sobre la salida softmax.
- Inferencia puramente en CPU con NumPy, sin dependencias de GPU, CUDA ni frameworks de deep learning.
- Ejecucion determinista: los pesos son fijos y no hay muestreo, por lo que la misma entrada produce siempre la misma accion.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento encadenado ni generacion de texto.
- No tiene capacidades multilingues, de vision ni de audio: no procesa pixeles, solo caracteristicas precalculadas por el entorno.
- Portabilidad total: los pesos se pueden cargar con `safetensors.numpy` o como JSON en el navegador.

## Casos de uso

- Docencia de algoritmos geneticos: el repositorio incluye codigo de entrenamiento, log por generacion y pesos finales, lo que permite reproducir el proceso completo y estudiar el efecto de la seleccion, el cruce y la mutacion en un caso de 771 parametros.
- Demostracion interactiva en navegador: el Space de HuggingFace dibuja la red junto al dinosaurio en tiempo real, util para explicar que es una red neuronal a audiencias no tecnicas.
- Referencia base (baseline) en experimentos de neuroevolucion: cualquier variante nueva (otra funcion de fitness, otro esquema de mutacion, NEAT, CMA-ES) se puede comparar contra las 83 generaciones y la marca de 547.287 puntos documentadas.
- Pruebas de infraestructura de inferencia: al ser un artefacto de 771 parametros en safetensors, sirve para validar pipelines de descarga, carga y ejecucion end-to-end sin coste de computo.
- Automatizacion ligera de agentes en entornos tipo runner: la interfaz de 12 entradas y 3 acciones es un ejemplo plantilla para conectar un controlador neuronal a un emulador o a un motor de juego propio.
- Educacion en sistemas de control reactivos: ilustra las limitaciones de una politica puramente reactiva sin memoria (nunca se agacha, no anticipa la transicion de velocidad), material util para comparar con enfoques con estado recurrente o planificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este modelo. Los unicos datos de evaluacion son metricas del propio juego, reportadas por el autor:

| Metrica | Resultado |
|---|---|
| Mejor marca registrada | 547.287 puntos (generacion 77) |
| Duracion del entrenamiento | 6,5 horas, 83 generaciones, 50 redes por generacion |
| Estabilidad a velocidad maxima | 0 choques en 26 partidas de 4 horas |
| Partidas que terminan durante la aceleracion | 56% de 200 partidas, con puntuacion inferior a 1.600 |
| Uso de la accion "agacharse" | nunca; salta todos los pajaros |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU con NumPy. Los pesos en float64 ocupan unos 6 KB (771 parametros × 8 bytes) mas las claves del safetensors.
- GPU: no necesita ninguna. Funciona en cualquier CPU x86 o ARM moderna, incluidas Raspberry Pi y entornos tipo navegador.
- Cabe en cualquier GPU consumer y en cualquier dispositivo con Python y NumPy; no requiere CUDA.
- Despliegue: script `watch_model.py` del repositorio de GitHub para visualizacion local; el Space de HuggingFace para demo web; carga directa con `huggingface_hub` + `safetensors.numpy` en scripts propios. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Por la dimension de la red (720 multiplicaciones y 51 sumas por inferencia) el coste por fotograma es despreciable frente al presupuesto de 16,6 ms de un bucle a 60 fps, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables publicados con pesos abiertos para esta tarea concreta. Como referencias conceptuales de la misma categoria (agentes neuroevolutivos para juegos simples) existen trabajos historicos como NEAT aplicado a juegos, pero no se dispone de sus especificaciones ni metricas verificadas en esta busqueda, por lo que no se incluye tabla comparativa con cifras.

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NeuroDino (este modelo) | 771 | no aplica (12 entradas/fotograma) | MIT | pesos en HF, codigo en GitHub, demo en Space |
| Otras redes neuroevolutivas para Chrome Dino | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas y no admite instrucciones en lenguaje natural.
- Limitacion estructural de politica: la entrada 1 (`Obj1 Act`) solo distingue el pajaro mas alto, que no requiere accion, por lo que un pajaro bajo el cual habria que agacharse es indistinguible de uno saltable. La red nunca se agacha.
- Vulnerabilidad en la fase de aceleracion: el 56% de 200 partidas terminaron antes de alcanzar la velocidad maxima, con menos de 1.600 puntos. El rendimiento excelente se limita al regimen de velocidad constante.
- Dependencia total del entorno: las 12 entradas deben calcularse exactamente como en `_get_inputs` del repositorio; cualquier cambio en la escala, el orden o las constantes invalida los pesos.
- Sobreajuste al motor concreto: se entreno y evaluo con el motor del juego portado a Python descrito en el repositorio; el comportamiento en otras implementaciones del juego no esta verificado.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero la red no tiene nocion de incertidumbre ni mecanismo de abstencion; siempre emite una accion.
- Licencia MIT para los pesos y el codigo, lo que permite uso comercial y modificacion con atribucion. El juego original (Chromium T-Rex runner) es BSD-3-Clause y el proyecto no esta afiliado a Google.
- Sesgos: no evaluados ni documentados en la model card; el comportamiento esta determinado unicamente por la funcion de fitness (distancia recorrida).
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la ficha, sin garantias de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahm3texe/neurodino
- Demo (Space): https://huggingface.co/spaces/ahm3texe/neurodino
- Repositorio de entrenamiento: https://github.com/ahm3texe/NeuroDino
- Implementacion de referencia de las entradas: https://github.com/ahm3texe/NeuroDino/blob/main/neurodino/neuro_runner.py
- Juego original de Chromium (T-Rex runner, BSD-3-Clause): no se proporciona enlace en la informacion disponible
- Enlaces relevantes de la busqueda web: no se han encontrado; los resultados devueltos (ROMs de Kickstart, foros sobre el Nissan Skyline R34 y repositorios sin relacion) no guardan relacion con este modelo.
