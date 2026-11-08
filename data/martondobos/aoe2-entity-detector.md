# martondobos/aoe2-entity-detector

## Resumen

aoe2-entity-detector es un modelo de deteccion de objetos especializado en capturas de pantalla de Age of Empires II: Definitive Edition. Lo desarrolla el usuario martondobos como componente de percepcion de un agente jugador automatico, y se publica como registro de artefactos en Hugging Face, no como API de inferencia alojada. La version actual, v12 (noviembre de 2026), detecta 65 clases de entidades del juego (unidades, animales, recursos y edificios) y se distribuye en dos formatos: un checkpoint de Ultralytics (`model.pt`) para reentrenamiento y un grafo ONNX (`model.onnx`) listo para servir.

El modelo parte del backbone YOLO26n de Ultralytics y se ha afinado con una receta que combina capturas reales etiquetadas, escenas sinteticas renderizadas desde sprites del juego y composites de copy-paste. La entrada del ONNX servido es de 736 x 1280 pixeles, una forma que preserva la escala de entrenamiento en capturas con relacion de aspecto 16:9 o superior, y requiere NMS por clase en el postprocesado, ya que la cabeza es one-to-many con anclas crudas.

Su relevancia es acotada pero concreta: demuestra un flujo completo de percepcion por vision para agentes que juegan a RTS desde la pantalla, con una evaluacion honesta sobre un conjunto de test independiente (40 frames reales de 10 sesiones no vistas) y una comparacion explicita entre versiones. No es un modelo de proposito general: es un detector de dominio muy estrecho, pensado para integrarse en un pipeline especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision por imagen; entrada 736 x 1280 px) |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint PyTorch y ONNX en precision original) |
| Idiomas soportados | no aplica (modelo de vision; clases en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `model.pt` (PyTorch/Ultralytics) y `model.onnx` (ONNX) |
| Clases detectadas | 65 |
| Entrada ONNX | 1 x 3 x 736 x 1280 |
| Salida ONNX | `output0` de forma [1, 69, 19320] |
| Postprocesado | NMS por clase a IoU 0.5, umbrales por clase |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26n de Ultralytics, afinado desde el checkpoint base. La cabeza del ONNX servido es one-to-many con anclas crudas (a diferencia de la v9, que usaba una cabeza end-to-end de 300 filas xyxy), por lo que exige NMS por clase en el decodificador. El checkpoint permite exportar el grafo end-to-end con `end2end=True` si se prefiere esa variante.

El entrenamiento combina tres fuentes de datos: 264 capturas reales del juego con etiquetas revisadas (repetidas 4 veces por epoca), 2.400 escenas sinteticas renderizadas desde sprites del juego sobre terreno del propio juego, y 1.000 composites de copy-paste de sprites sobre capturas reales a la escala de pantalla real. La receta usa Ultralytics 8.4.54, imgsz 1280, batch 16, 150 epocas sin early stopping, exportando la epoca final, con el optimizador MuSGD (lr 0.01, momentum 0.9) y semilla 0. Un experimento controlado 2 x 2 con dos semillas por celda mostro que AdamW con lr 0.000145, usado en versiones anteriores, infraentrena (F1 medio 0.840 frente a 0.861 con los mismos datos); la dispersion de F1 entre semillas es de aproximadamente 0.005, y el recall por clase en clases raras varia mas (hasta 0.085 en mina de oro).

## Capacidades

- Deteccion de 65 clases de entidades en capturas de Age of Empires II:DE, incluyendo unidades (aldeano, oveja, ciervo, jabali), recursos (arbol, mina de oro, mina de piedra, arbusto de bayas) y animales anadidos en v12 (cabra, vaca, bufalo, caballo, rinoceronte).
- Percepcion por imagen fija a partir de la pantalla del juego, sin acceso a la API interna del juego.
- Salida con cajas, puntuaciones por clase y decodificacion determinista documentada en `inference-contract.json`.
- Etiquetado con alias: ibex y elefante se anotan por separado pero se entrenan como `deer` y `boar` mediante `label_aliases` en `classes.yaml`.
- Exportacion a ONNX y ejecucion via CoreML en Apple Silicon (unos 10 ms por forward pass en un M2 Pro con el execution provider CoreML, formato MLProgram).
- No soporta tool calling, agentes multi-paso, texto, audio ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Agente jugador automatico de AoE2:DE: el modelo actua como capa de percepcion que traduce la captura de pantalla en un conjunto de entidades con posicion y clase, alimentando la logica de decision del agente. Es el caso de uso soportado explicitamente por el autor.
- Analisis de repeticiones y capturas: extraer inventario de recursos y unidades visibles en frames concretos para estudios de partidas o herramientas de analisis estadistico.
- Monitorizacion de estado de partida en tiempo real: con un forward pass de unos 10 ms en M2 Pro via CoreML, es viable procesar la pantalla a frecuencia de juego en hardware Apple Silicon.
- Automatizacion de tareas de recoleccion: detectar arbustos de bayas, minas y arboles para que un agente planifique rutas de recoleccion; la v12 mejora el recall de arbusto de bayas (0.750 frente a 0.500 en v9).
- Deteccion de unidades hostiles y animales neutrales: el recall de jabali sube a 0.964 (frente a 0.582 en v9) y el de ciervo a 0.581 (frente a 0.210), lo que hace util el modelo para alertas de fauna y amenazas tempranas.
- Investigacion en vision para videojuegos: servir como referencia reproducible de un pipeline completo (datos reales + sinteticos + composites, receta de entrenamiento y protocolo de evaluacion) para quien quiera construir detectores de entidades en otros RTS.
- Reentrenamiento y adaptacion: el checkpoint `model.pt` permite afinar sobre un dataset propio con la misma receta (MuSGD, lr 0.01) para ampliar a edades Feudal o Castle, no cubiertas en la evaluacion actual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre un conjunto de test privado de 40 capturas reales (1.248 cajas etiquetadas) de 10 sesiones no usadas en entrenamiento ni validacion, con IoU >= 0.50, umbrales desplegados y el decodificador descrito:

| Metrica | v12 (actual) | v9 (anterior) |
|---|---|---|
| Precision micro | 0.930 | 0.963 |
| Recall micro | 0.823 | 0.748 |
| F1 micro | 0.873 | 0.842 |

La mejora de F1 de v12 sobre v9 es de +0.031 (test de permutacion exacto por sesion sobre las 10 sesiones, p = 0.045; v12 es mejor en 8 de 10 sesiones). Recall por clase destacado en v12 frente a v9: aldeano 0.800 vs 0.657, oveja 0.591 vs 0.455, ciervo 0.581 vs 0.210, jabali 0.964 vs 0.582, arbusto de bayas 0.750 vs 0.500. Tres clases de recursos pierden recall: arbol 0.877 vs 0.921, mina de oro 0.761 vs 0.817, mina de piedra 0.673 vs 0.776. v12 genera mas falsos positivos (77 frente a 36 sobre 1.248 cajas).

No se han publicado resultados de benchmarks en la informacion disponible para tareas comparables (MMLU, HumanEval, GSM8K u otras), al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un YOLO26n con entrada 736 x 1280, la huella es propia de un detector pequeno y cabe con holgura en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el autor documenta ejecucion en Apple Silicon (M2 Pro) mediante CoreML.
- Cabe en GPU de consumo: si, por el tamano del backbone YOLO26n; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (con execution provider CoreML en macOS), Ultralytics para el checkpoint PyTorch, y exportacion a otros backends soportados por Ultralytics (no documentados en la model card).
- Latencia: aproximadamente 10 ms por forward pass en un Apple M2 Pro con CoreML (MLProgram). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | F1 (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aoe2-entity-detector v12 | YOLO26n afinado | 65 | 736 x 1280 | 0.873 | AGPL-3.0 | Hugging Face (pesos ONNX y PyTorch) |
| aoe2-entity-detector v9 | YOLO26n afinado | 60 | 1280 x 1280 | 0.842 | AGPL-3.0 | Hugging Face (version anterior) |
| YOLO26n base (Ultralytics) | Detector generico COCO | 80 (COCO) | configurable | no disponible | AGPL-3.0 | Ultralytics |

No se dispone de informacion sobre otros detectores especificos de Age of Empires II con los que comparar directamente. La comparativa mas solida disponible es la version anterior del propio modelo, evaluada con el mismo pipeline y conjunto de test.

## Limitaciones y advertencias

- Todos los frames de test son de Edad Oscura temprana; no se han evaluado ejercitos de Edad Feudal o Castle, castillos ni murallas.
- Las etiquetas de test omiten algunas unidades ocluidas que el juego dibuja como siluetas; aproximadamente 10 de los 16 falsos positivos de aldeano inspeccionados eran de este tipo.
- La puntuacion es de frame estatico: no demuestra que el agente recolecte o combata mejor, lo que requiere ejecuciones a nivel de partida.
- Las clases raras tienen pocas o ninguna caja de test, por lo que sus metricas no son fiables.
- v12 produce mas falsos positivos que v9 (77 frente a 36 sobre 1.248 cajas), un compromiso asumido a cambio de mayor recall.
- La entrada 736 x 1280 pierde objetos pequenos en frames mas estrechos (4:3, 16:10); para esos casos hay que exportar `model.pt` a 1280 x 1280.
- El ONNX servido requiere NMS por clase; sin el, la salida contiene muchas cajas duplicadas.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que integre el modelo y se distribuya en red; revisar compatibilidad antes de uso comercial.
- Los checkpoints PyTorch usan pickle; cargarlos solo desde fuentes de confianza.
- El repositorio es un registro de artefactos, no una API alojada: los consumidores deben fijar un commit o tag (`v9`, `v12`).
- No se publican las imagenes ni los sprites de entrenamiento, lo que limita la reproducibilidad completa del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martondobos/aoe2-entity-detector
- Arbol de ficheros del repositorio: https://huggingface.co/martondobos/aoe2-entity-detector/tree/main
- Ultralytics (framework y modelo base YOLO26): https://github.com/ultralytics/ultralytics
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales del autor.
