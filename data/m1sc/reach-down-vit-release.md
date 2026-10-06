# m1sc/reach-down-vit-release

## Resumen

`m1sc/reach-down-vit-release` es un modelo de vision por computador orientado a robotica aerea, concretamente a la estimacion del valor de aterrizaje (landing value) del terreno para aeronaves de ala fija. Lo publica el usuario m1sc como release completo del modelo descrito en el repositorio de codigo `ckwolfe/reach-down`, e incluye no solo los pesos, sino tambien los artefactos originales de entrenamiento y evaluacion: historiales, splits, configuraciones, resultados de ablaciones y codigo fuente seleccionado.

Tecnicamente no es un modelo de lenguaje ni un modelo generativo de texto: es una red tipo Vision Transformer construida sobre el encoder/decoder de Depth Anything V2 Small, a la que se anade una proyeccion de entrada de siete canales. Predice un mapa denso de logits que, tras aplicar `sigmoid`, da un valor de aterrizaje por pixel. El checkpoint tiene 25.086.145 parametros y una entrada fija de 364 × 364 pixeles.

Su relevancia es acotada pero clara para el nicho de autonomia de UAV de ala fija: aporta un artefacto reproducible (semillas, split por terreno, checksums) y una evaluacion sobre terreno sintetico, DEM reales (16 sitios) y arquetipos de mapa no vistos (4 sitios), junto con una linea base analitica sensible al viento. Es un modelo de investigacion, no un producto validado para seguridad en vuelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Depth Anything V2 Small como encoder/decoder) con proyeccion de entrada de 7 canales; se entrenan los 4 bloques finales del encoder y el decoder denso |
| Parametros totales | 25.086.145 (checkpoints con 287 entradas de estado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es una imagen de 364 × 364 pixeles |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints en precision original; no hay versiones cuantizadas) |
| Idiomas soportados | No aplica (modelo de vision, sin interfaz de lenguaje) |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | PyTorch `.pt` (`state_dict` completo, no adaptadores); tambien `.csv`, `.json` y `.sha256` como artefactos auxiliares |

## Arquitectura y entrenamiento

El modelo parte de un encoder/decoder de Depth Anything V2 Small y sustituye la proyeccion de entrada por una de siete canales. Cada canal codifica una magnitud relativa a los limites de la aeronave: elevacion observada, pendiente, rugosidad, mascara de evitacion (avoid mask), margen de alcance analitico, longitud de pista (run length) y viento. La red de cuatro bloques finales del encoder y el decoder denso es lo unico que se entrena; el resto de los pesos permanecen congelados. La salida son logits por pixel, y `sigmoid` sobre ellos produce el mapa de valor predicho.

El entrenamiento usa exclusivamente datos sinteticos: 500 terrenos x 5 estados, con arrays de 512 × 512 a 10 m/pixel. Los terrenos con semillas 0–399 forman entrenamiento (2.000 teselas) y los de semillas 400–499 validacion (500 teselas), dividiendo siempre por terreno para que todos los estados de un mismo terreno queden en el mismo conjunto. El comando registrado es `python scripts/train.py --data data/tiles_v2 --epochs 24 --safety-buffer 40 --false-safe-weight 8 --seed 0`. Es decir, 24 epocas, un margen de seguridad de 40 m y un peso de 8 aplicado a las predicciones falsamente seguras (false-safe), que recompone el margen HJ almacenado y la aterrizabilidad en el objetivo. Se conservan ejecuciones con semillas 0, 1 y 2 (la liberada corresponde a la semilla 0). Los ficheros `args.json` fueron reconstruidos despues del entrenamiento, con nota de procedencia explicita; el resto de artefactos (checkpoints, historiales, teselas, split y CSVs de evaluacion) son originales. No se reentreno ningun peso para esta subida.

## Capacidades

- Prediccion densa de valor de aterrizaje: genera un mapa de logits por pixel para una entrada de 364 × 364 pixeles y siete canales.
- Razonamiento geometrico sobre terreno: integra elevacion, pendiente, rugosidad, margen de alcance analitico y longitud de pista en una unica representacion.
- Sensibilidad al viento: el canal de viento permite evaluar episodios a distintas velocidades (existen resultados persistidos a 0 y 6 m/s).
- Generalizacion a terreno real: evaluacion sobre DEM reales en 16 sitios.
- Generalizacion a arquetipos no vistos: evaluacion con cuatro tipos de mapa nunca vistos durante el entrenamiento.
- Integracion en cadenas de robotica: pensado como componente de valoracion de terreno dentro de un planificador de aterrizaje.
- Trazabilidad y reproducibilidad: incluye `split.csv`, historiales por semilla, 60 CSVs de evaluacion, `metrics.json` y `SHA256SUMS`.
- No soporta tool calling, function calling, agentes, dialogo multilingue, vision generalista, audio ni modo de razonamiento explicito: esas capacidades no existen en este modelo.

## Casos de uso

- Seleccion autonoma de zonas de aterrizaje para UAV de ala fija: el modelo produce un mapa de valor por pixel que un planificador puede usar para descartar zonas inseguras antes de comprometer la maniobra, teniendo en cuenta pendiente, rugosidad y margen de alcance.
- Aterrizaje de emergencia sobre terreno desconocido: al evaluarse sobre DEM reales con un MAE medio de 0,076850, permite estimar la aterrizabilidad en zonas sin datos previos de mision.
- Simulacion y generacion de datos de entrenamiento: combinado con `scripts/make_dataset.py`, sirve para construir y etiquetar terrenos sinteticos con oraculo offline y linea base analitica sensible al viento.
- Validacion de planificadores existentes: sus 60 CSVs de evaluacion (ablaciones, controles y experimentos) permiten comparar heuristicas de aterrizaje contra una referencia aprendida y contra la linea base analitica.
- Analisis de robustez frente a viento: los resultados a 0 y 6 m/s permiten estudiar como degrada la decision de aterrizaje al aumentar la componente de viento.
- Investigacion en reachability y seguridad de aero-navegacion: el repositorio incluye documentacion de metodo, arquitectura y datagen, util para reproducir y extender el enfoque.
- Transfer learning sobre el encoder de Depth Anything V2: al liberarse el `state_dict` completo y el codigo de normalizacion y modelo, es una base razonable para otras tareas de valoracion de terreno.
- Preetiquetado de grandes superficies de mapa: al ser un modelo de 25 M de parametros, es viable recorrer teselas de 512 × 512 a 10 m/pixel por lotes en hardware modesto.

## Benchmarks y rendimiento

Resultados declarados en la model card (no se han incluido cifras de modelos externos):

| Metrica | Resultado | Fuente |
|---|---|---|
| AUROC de validacion en la mejor epoca | 0,997941 | `runs/vit_release/history.csv`, epoca 20 |
| MAE de validacion en la mejor epoca | 0,017957 | `runs/vit_release/history.csv`, epoca 20 |
| MAE medio en DEM reales (16 sitios) | 0,076850 | `results/real_dem_eval.csv` |
| MAE medio en arquetipos no vistos (4 sitios) | 0,085825 | `results/unseen_map_eval.csv` |

`metrics.json` recoge ademas tasas estrictas de seguridad por sitio para el ViT y para la linea base analitica, con denominadores de todos los episodios y de episodios factibles. La model card advierte explicitamente de que el mapa predicho es una aproximacion al oraculo offline y de que estos resultados experimentales no constituyen garantias formales de seguridad. Los resultados de la linea base analitica y de las ablaciones no se cuantifican de forma resumida en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 100 MB en fp32 y unos 50 MB en fp16, calculado a partir de los 25.086.145 parametros. Las activaciones para entradas de 364 × 364 con lotes pequenos son reducidas; en la practica cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente. En gama consumer, una RTX 3060 de 12 GB, RTX 4060 o superior bastan con amplio margen; en gama profesional, A100 o H100 quedan sobredimensionadas para este tamano, aunque resultan utiles para procesar grandes lotes de teselas.
- Compatibilidad con GPU consumer: si, el modelo cabe en practicamente cualquier GPU consumer con 4 GB o mas, e incluso puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: inferencia en PyTorch mediante el paquete `reachdown` (`LandingValueViT`), con `torch.load(..., weights_only=True)` y `pretrained=False` para evitar descargar los pesos base. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI; esas herramientas no aplican a este tipo de modelo.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Espacio en disco: el repositorio completo ocupa 0,3 GB, mas el dataset de teselas descargado por separado.

## Comparativa con modelos similares

En la informacion disponible no se describen modelos comparables de valoracion de aterrizaje. Las unicas referencias con las que se puede contrastar son la arquitectura base y la linea base analitica del propio repositorio:

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1sc/reach-down-vit-release` | 25.086.145 | 364 × 364, 7 canales | Mapa de valor de aterrizaje | No disponible | Pesos y artefactos en HuggingFace |
| Depth Anything V2 Small (base) | No disponible en la informacion | Entrada RGB, 3 canales | Profundidad monocular | No disponible en la informacion | Modelo base referenciado por la configuracion |
| Linea base analitica sensible al viento | No aplica (no neuronal) | Estado de terreno y aeronave | Margen de alcance analitico | No aplica | Implementada en el repositorio de origen |

Como referencia adicional, la model card menciona comparaciones con un oraculo offline y con una linea base analitica, pero no ofrece cifras resumidas de esas alternativas en la informacion disponible.

## Limitaciones y advertencias

- Ausencia de garantias de seguridad: el propio autor indica que los resultados experimentales no establecen garantias formales; no debe usarse como unico criterio en operaciones de vuelo real.
- Dominio de entrenamiento sintetico: el entrenamiento se realiza sobre 500 terrenos sinteticos generados proceduralmente. La diferencia de dominio con terreno real se refleja en el salto de MAE (0,017957 en validacion sintetica frente a 0,076850 en DEM reales, un factor cercano a cuatro).
- Degradacion en escenarios no vistos: el MAE sube a 0,085825 en los cuatro arquetipos de mapa no vistos, lo que indica sensibilidad al tipo de terreno.
- Prediccion como aproximacion: la salida es una aproximacion al oraculo offline, no una etiqueta exacta; los errores se acumulan en el mapa denso.
- Sesgo hacia falsos seguros: el entrenamiento aplica un peso de 8 a las predicciones falsamente seguras, lo que reduce pero no elimina ese tipo de error, el mas critico en aterrizaje.
- Restricciones de licencia: la model card no declara licencia. Al derivar del encoder/decoder de Depth Anything V2, es imprescindible verificar la licencia de los pesos base antes de cualquier uso comercial, ya que algunas variantes de esa familia tienen restricciones de uso no comercial.
- Limitacion de entrada: resolucion fija de 364 × 364 y siete canales obligatorios. No acepta entradas en otros formatos ni resoluciones sin adaptacion de codigo.
- Sin capacidades de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural, tool calling ni agentes. Cualquier integracion debe hacerse por API de tensor.
- Idiomas: no aplica; no hay componentes linguisticos ni evaluacion multilingue.
- Procedencia parcial: los ficheros `args.json` fueron reconstruidos despues del entrenamiento, por lo que la configuracion exacta original depende de la evidencia documentada por el autor.
- Madurez del release: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m1sc/reach-down-vit-release
- Dataset de entrenamiento: https://huggingface.co/datasets/m1sc/reach-down-tiles-v2
- Repositorio de codigo fuente: https://github.com/ckwolfe/reach-down
- Documentacion de generacion de datos (dentro del repo): `docs/datagen.md`
- Documentacion de arquitectura (dentro del repo): `docs/architecture.md`
- La busqueda web realizada no ha devuelto enlaces especificos de este modelo; los resultados obtenidos eran trackers genericos de lanzamientos de modelos de lenguaje, sin relacion con este release.
