# faisal-alansari/smart-parking-models

## Resumen

`faisal-alansari/smart-parking-models` es un repositorio de pesos entrenados para un proyecto personal de aparcamiento inteligente, no un modelo de lenguaje. Contiene dos componentes independientes: un clasificador de ocupacion de plazas de aparcamiento (denominado Model A, una CNN propia de 0,29 M de parametros) y un detector de matricula (Model B, basado en un YOLO11n afinado). El autor lo publica como material auxiliar de su proyecto, en el que una unica camara vigila dos plazas privadas.

El repositorio no incluye codigo, informe ni data card: estos residen en el repositorio del proyecto y se obtienen con el comando `just download-checkpoints`, que coloca los ficheros en las rutas esperadas. Por tanto, los pesos aqui publicados solo son utiles si se integran en ese proyecto o se reutilizan con un pipeline propio compatible con los formatos `.pt` (PyTorch) y `.joblib` (scikit-learn).

La relevancia es acotada: se trata de un artefacto de un caso de uso muy concreto (dos plazas, una camara), con licencia mixta y sin benchmarks publicados en la informacion disponible. Resulta interesante como ejemplo de pipeline de vision por computador de bajo coste (modelo de 0,29 M de parametros, YOLO11n, baselines clasicos HOG + regresion logistica), pero no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model A: OccupancyCNN (CNN propia, 0,29 M de parametros); Model B: YOLO11n afinado; baselines: HOG + regresion logistica y umbral de textura |
| Parametros totales | Model A: 0,29 M; Model B: no disponible (YOLO11n base, sin cifra confirmada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | mixta ("other" / "mixed"); componentes heredados: YOLO11n AGPL-3.0, CNRPark+EXT ODbL v1.0, AddingUAE CC BY 4.0 |
| Formato de pesos | `.pt` (PyTorch) para redes; `.joblib` (scikit-learn) para el baseline HOG + LR; `.json` y `.npz` para umbrales y snapshots |

## Arquitectura y entrenamiento

Model A (ocupacion) es una CNN entrenada desde cero sobre CNRPark+EXT, con semillas 42, 43 y 44 (`final_s42.pt`, `final_s43.pt`, `final_s44.pt`). Existen ademas copias adaptadas a la camara concreta del autor (`adapted_s4{2,3,4}.pt`), que son las desplegadas. Se acompanan dos baselines: un clasificador HOG + regresion logistica (`hog_lr.joblib`) y un umbral de textura (`texture_threshold.json`). Tambien se incluyen un snapshot de referencia de la vista de camara (`reference_view.npz`) y un detector de out-of-distribution basado en distancia de caracteristicas (`ood_detector.npz`), que actuan como comprobacion de que la camara sigue en la posicion esperada.

Model B (matriculas) es un YOLO11n afinado sobre el dataset AddingUAE, con las mismas tres semillas (`final_s4{2,3,4}.pt`), mas un baseline YOLO11n entrenado desde cero (`exp_img960_full_n5000_scratch.pt`, imagen a 960 px, 5000 muestras). Los candidatos de adaptacion de ocupacion (opciones b, c y d) se guardan en `experiments/occupancy_adapt/*.pt` y se reevaluan con `just adapt-occupancy-choice-report`. No se detallan en la informacion disponible el numero de tokens, epochs, aumentos de datos ni si hubo tecnicas de regularizacion especificas.

## Capacidades

- Clasificacion binaria de ocupacion de plazas de aparcamiento a partir de imagenes de una camara fija (Model A).
- Deteccion de matriculas vehiculares en imagen (Model B, YOLO11n).
- Comprobacion de integridad de la escena: el snapshot de referencia y el detector OOD permiten detectar si la camara se ha movido o si la imagen se sale de la distribucion esperada.
- Baselines clasicos comparables (HOG + regresion logistica y umbral de textura) para validar la CNN.
- Multiples semillas por modelo para estimar variabilidad de entrenamiento.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Monitorizacion de dos plazas privadas con una sola camara: el pipeline combina Model A para ocupacion y Model B para leer la matricula del vehiculo estacionado, tal como lo plantea el autor.
- Control de acceso a garaje particular: al detectar ocupacion y matricula, se puede registrar que vehiculo entra y sale y contrastarlo con una lista de autorizados.
- Reutilizacion del detector de matriculas en otros proyectos: el YOLO11n afinado sobre AddingUAE puede servir como punto de partida para lectura de matriculas con dominio similar (formato UAE), previa verificacion de la licencia AGPL-3.0.
- Prototipo educativo de vision por computador de bajo coste: el modelo de 0,29 M de parametros y los baselines clasicos permiten ilustrar el ciclo completo (entrenamiento, adaptacion al dominio, evaluacion con varias semillas, deteccion OOD).
- Sistema de alertas de plaza libre/ocupada en tiempo casi real: al ser modelos pequenos, pueden ejecutarse en CPU o en GPUs de gama baja, lo que abarata el despliegue en dispositivos edge.
- Investigacion sobre adaptacion al dominio: los checkpoints `experiments/occupancy_adapt/*.pt` documentan variantes de adaptacion que se pueden comparar con las copias desplegadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Model A (0,29 M de parametros): inference trivial; cabe en CPU y en cualquier GPU consumer, incluso en dispositivos embebidos.
- Model B (YOLO11n): modelo pequeno de deteccion; cabe en GPUs consumer (por ejemplo, RTX 3060 o superiores) y es viable en CPU con latencia mayor; no se dispone de cifras de VRAM ni de throughput en la informacion.
- Opciones de despliegue: los pesos `.pt` son compatibles con PyTorch; YOLO11n encaja en el ecosistema Ultralytics (exportacion a ONNX, TensorRT u OpenVINO no confirmada en la informacion); el baseline HOG + LR requiere scikit-learn y joblib.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `faisal-alansari/smart-parking-models` | Ocupacion + matriculas | 0,29 M (Model A); Model B no disponible | no aplica | mixta (other/mixed) | Hugging Face, pesos sueltos |
| YOLO11n (Ultralytics) | Deteccion de objetos | no disponible en la informacion | no aplica | AGPL-3.0 | publico |
| CNRPark+EXT (dataset) | Ocupacion de plazas | no aplica | no aplica | ODbL v1.0 | publico |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generacion de texto ni razonamiento; cualquier uso debe ser de vision por computador.
- Entrenado para un escenario muy concreto (dos plazas, una camara); la generalizacion a otras camaras, angulos o condiciones de iluminacion requiere adaptacion y validacion propias.
- Sin benchmarks ni metricas publicadas en la informacion disponible: no se puede afirmar su precision real.
- Licencia mixta: el componente YOLO11n hereda AGPL-3.0, lo que impone obligaciones de copyleft en uso en red; los datos CNRPark+EXT (ODbL v1.0) y AddingUAE (CC BY 4.0) imponen atribucion y, en el caso ODbL, posiblemente comparticion de bases derivadas. Verificar antes de uso comercial.
- El repositorio no incluye codigo, informe ni data card; sin el repositorio del proyecto, los pesos son dificiles de reproducir o integrar.
- Riesgo de falsos positivos/negativos en ocupacion y en lectura de matriculas no cuantificado; el detector OOD solo cubre cambios de escena, no errores de clasificacion.
- Idiomas soportados no aplicables; el reconocimiento de matriculas esta ligado al formato del dataset de entrenamiento (UAE).

## Enlaces

- Hugging Face: https://huggingface.co/faisal-alansari/smart-parking-models
- Dataset de datos propios: https://huggingface.co/datasets/faisal-alansari/smart-parking-data
- Repositorio del proyecto (referenciado en la model card, sin URL explicita en la informacion): no disponible
- Ultralytics YOLO11 (dependencia de Model B): no disponible en la informacion
- CNRPark+EXT (dataset): no disponible en la informacion
- AddingUAE (dataset): no disponible en la informacion
