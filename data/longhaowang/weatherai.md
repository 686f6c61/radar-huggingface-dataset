# LonghaoWang/WeatherAI

## Resumen

WeatherAI es una biblioteca de reimplementaciones en PyTorch de veinte modelos de predicción meteorológica y climática publicados en revistas como *Nature*, *Science* y sus revistas hermanas. El proyecto lo mantiene LonghaoWang (organización GISWLH en GitHub) y no distribuye pesos propios: el repositorio de Hugging Face actúa como escaparate y tarjeta de modelo, mientras que el código, los tests y las incidencias viven en GitHub. Los pesos oficiales permanecen con sus autores originales y se descargan bajo sus respectivas licencias.

El problema que resuelve es la fragmentación del ecosistema de IA meteorológica: cada modelo publicado (Pangu-Weather, GraphCast, Aurora, GenCast, NeuralGCM, FuXi-S2S, CAS-Canglong, entre otros) llega con su propio entorno, framework y convenciones. WeatherAI unifica todos bajo una interfaz común de tensores de entrada y salida, con módulos `nn.Module` legibles, verificación contra el código oficial de los autores y variantes *Lite* que permiten entrenar en CPU de portátil o en una GPU pequeña.

La relevancia actual del proyecto reside en su enfoque de verificación estricta: catorce de los modelos cargan checkpoints oficiales en modo *strict* y las salidas coinciden con la implementación de referencia, a menudo bit a bit. Además, mantiene piezas en JAX donde el original lo exige (entrenamiento de NeuralGCM, precipitación) y reconstruye como módulos PyTorch las publicaciones que solo existían en ONNX (FuXi-ENS, FuXi-S2S). El repositorio de Hugging Face no contiene pesos (tamaño 0.0 GB) y registra cero descargas y cero *likes* en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | biblioteca multimodelo: transformers específicos del dominio terrestre (Earth-specific transformer, GNN sobre malla icosaédrica, Perceiver + Swin-3D, U-Transformer con Swin-V2, modelos híbridos neuronal-físico) |
| Parametros totales | no disponible (depende del modelo del zoo; p. ej. Aurora_small con pesos oficiales ~450 MB) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (no aplica; la entrada es una rejilla espacio-temporal, p. ej. tensor (1, 4, 32, 64) para GraphCast_lite) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio científico, no procesamiento de lenguaje natural) |
| Licencia | MIT (para la biblioteca); los pesos oficiales se rigen por las licencias de sus autores |
| Formato de pesos | checkpoints PyTorch nativos; pesos oficiales descargados bajo demanda; algunos originales en JAX u ONNX |

## Arquitectura y entrenamiento

WeatherAI no entrena un modelo propio: es una capa de reimplementación y verificación sobre veinte arquitecturas publicadas. Entre ellas figuran Pangu-Weather (transformer 3D específico de la Tierra, *Nature* 2023), GraphCast (GNN con conversión rejilla ↔ malla icosaédrica, *Science* 2023), Aurora (Perceiver más Swin-3D como modelo fundacional, *Nature* 2025), FuXi (embedding de cubo con U-Transformer Swin-V2), FengWu (codificación-fusión-decodificación multimodal), NeuralGCM (modelo híbrido neuronal-físico con entrenamiento en JAX) y CAS-Canglong para predicción estacional de temperatura superficial del mar a tres meses.

El proyecto verifica cada port contra el código de los autores: catorce modelos cargan checkpoints oficiales en modo estricto y las salidas coinciden con la implementación de referencia, con scripts y resultados JSON que respaldan cada afirmación. Las ejecuciones en GPU se prueban en una GPU NVIDIA Blackwell a través de un Hugging Face ZeroGPU Space. La actualización de investigación del 19 de octubre de 2026 incorpora calibración probabilística PBC para predicción subestacional a estacional, downscaling con GenFocal oficial preentrenado y diagnósticos de translocación *gray-swan*, con variantes *lite* separadas y explícitas. PBC y el wrapper de diagnóstico extienden el zoo existente y no constituyen dos predictores meteorológicos preentrenados adicionales.

## Capacidades

- Predicción meteorológica global de medio plazo con Pangu-Weather, FuXi, FengWu, GraphCast, Aurora y NeuralGCM.
- Predicción probabilística por conjuntos con GenCast y GenCast variantes, además de FuXi-ENS reconstruido desde ONNX.
- Predicción subestacional y estacional, incluida la perspectiva de temperatura superficial del mar a tres meses con CAS-Canglong.
- Downscaling oficial preentrenado mediante GenFocal.
- Calibración probabilística S2S con PBC y diagnósticos de translocación *gray-swan*.
- Interfaz uniforme de tensores de entrada y salida en todos los modelos, sin entornos por modelo.
- Variantes *Lite* en quince modelos que entrenan en CPU de portátil o GPU pequeña.
- Ejecución en CPU y GPU CUDA; soporte de JAX donde el original lo requiere y reconstrucción PyTorch de releases solo ONNX.
- No dispone de tool calling, function calling, agentes, modo *thinking*, visión general, audio ni capacidades multilingües de NLP.

## Casos de uso

- Investigación comparativa de modelos meteorológicos: cargar el mismo estado atmosférico en Pangu, GraphCast y Aurora con una interfaz idéntica permite comparar salidas sin gestionar tres entornos distintos.
- Reproducción de resultados publicados: los scripts de verificación y los JSON asociados permiten comprobar que el port PyTorch coincide con el código oficial antes de basar un experimento en él.
- Prototipado rápido en portátil: las configuraciones *Lite* de GraphCast, Canglong y otros permiten iterar sobre la canalización de datos y el bucle de entrenamiento en CPU antes de escalar a GPU.
- Ajuste fino sobre checkpoints oficiales: Aurora_small carga pesos oficiales (~450 MB) en modo estricto dentro de PyTorch nativo, lo que facilita el *fine-tuning* sobre datos regionales.
- Predicción estacional de SST: CAS-Canglong transforma una entrada (1, 8, 8, 32, 64) en una perspectiva (1, 1, 3, 32, 64) de tres meses, útil para planificación agrícola y pesquera.
- Evaluación de downscaling: GenFocal preentrenado oficial permite generar campos de alta resolución a partir de predicciones de menor resolución y compararlos con observaciones.
- Integración en pipelines operativos: al ejecutarse como módulos PyTorch estándar, los modelos se pueden envolver en servicios de inferencia sobre CUDA y encadenar pasos de seis horas como en GraphCast_lite.
- Docencia y formación: el código legible y las variantes *Lite* convierten arquitecturas de *Nature* y *Science* en material didáctico ejecutable en un portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto documenta verificaciones de paridad contra las implementaciones oficiales (coincidencia estricta de checkpoints en catorce modelos y salidas que a menudo coinciden bit a bit), pero no presenta tablas de métricas como RMSE, MMLU, HumanEval o GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; Aurora_small con pesos oficiales ocupa aproximadamente 450 MB, mientras que las variantes de tamaño de paper requieren GPUs de centro de datos.
- GPU recomendadas: NVIDIA Blackwell para las pruebas de GPU del proyecto; para los modelos a escala de paper se necesitan aceleradores de centro de datos (A100, H100 o equivalentes), aunque el autor no detalla asignaciones por modelo.
- Cabe en GPU de consumo: las configuraciones *Lite* de quince modelos entrenan en CPU de portátil o en una GPU pequeña; Aurora_small con pesos oficiales es viable en GPUs de consumo con memoria suficiente para ~450 MB de pesos más activaciones.
- Opciones de despliegue: instalación vía `pip install git+https://github.com/GISWLH/WeatherAI.git` o clonación con `pip install -e ".[dev]"`; ejecución nativa en PyTorch sobre CPU y CUDA; JAX para NeuralGCM; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este dominio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeatherAI (biblioteca) | no disponible (agrega 20 modelos) | no aplica | paridad verificada con código oficial en 14 modelos | MIT (biblioteca); pesos según autores | GitHub + tarjeta en Hugging Face, sin pesos alojados |
| Pangu-Weather (original) | no disponible en la información | no aplica | referencia publicada en *Nature* 2023 | según autores | pesos oficiales descargados bajo su licencia |
| GraphCast (original) | no disponible en la información | no aplica | referencia publicada en *Science* 2023 | según autores | pesos oficiales; referencia JAX y PhysicsNeMo |
| Aurora (original) | no disponible en la información | no aplica | referencia publicada en *Nature* 2025 | según autores | pesos oficiales (~450 MB en Aurora_small) |

La comparación relevante no es de precisión entre modelos, sino de empaquetado: WeatherAI ofrece una interfaz única y verificación reproducible frente a los repositorios originales, cada uno con su propio entorno y framework.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0.0 GB); cualquier uso real exige descargar checkpoints oficiales bajo las licencias de sus autores, que pueden diferir de la MIT de la biblioteca.
- La licencia MIT cubre el código de la biblioteca, no necesariamente los pesos de terceros; conviene revisar cada licencia antes de uso comercial.
- No hay datos publicados de sesgos, alucinación o rendimiento en producción; las garantías del proyecto se limitan a la paridad con el código oficial.
- Las variantes *Lite* usan rejillas pequeñas y no deben confundirse con los modelos a escala de paper para resultados científicos.
- Las pruebas en GPU se han realizado en una única GPU Blackwell mediante un Space ZeroGPU; no se documenta comportamiento en otros aceleradores.
- PBC y el wrapper de translocación extienden el zoo y no son predictores meteorológicos preentrenados adicionales, pese a poder leerse así en la documentación.
- El proyecto no ofrece capacidades de NLP, tool calling ni agentes; su ámbito es exclusivamente meteorológico y climático.
- El repositorio registra cero descargas y cero *likes*, lo que indica ausencia de validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Tarjeta de modelo en Hugging Face: https://huggingface.co/LonghaoWang/WeatherAI
- Repositorio GitHub: https://github.com/GISWLH/WeatherAI
- Space de pruebas GPU (GraphCast smoke): https://huggingface.co/spaces/LonghaoWang/weatherai-graphcast-smoke
- Actualización de investigación 19 oct 2026: https://github.com/GISWLH/WeatherAI/blob/main/docs/research_20261019.md
- Documentación Pangu: https://github.com/GISWLH/WeatherAI/blob/main/models/pangu.md
- Documentación FuXi: https://github.com/GISWLH/WeatherAI/blob/main/models/fuxi.md
- Documentación FengWu: https://github.com/GISWLH/WeatherAI/blob/main/models/fengwu.md
- Documentación GraphCast: https://github.com/GISWLH/WeatherAI/blob/main/models/graphcast.md
- Documentación Aurora: https://github.com/GISWLH/WeatherAI/blob/main/models/aurora.md
- Documentación NeuralGCM: https://github.com/GISWLH/WeatherAI/blob/main/models/neuralgcm.md
- Paper Pangu-Weather: https://doi.org/10.1038/s41586-023-06185-3
- Paper FuXi: https://doi.org/10.1038/s41612-023-00512-1
- Paper FengWu: https://doi.org/10.1038/s43247-025-02502-y
- Paper GraphCast: https://doi.org/10.1126/science.adi2336
- Paper Aurora: https://doi.org/10.1038/s41586-025-09005-y
- README en chino: https://github.com/GISWLH/WeatherAI/blob/main/README_zh.md
- README en japonés: https://github.com/GISWLH/WeatherAI/blob/main/README_ja.md
- Licencia: https://github.com/GISWLH/WeatherAI/blob/main/LICENSE
