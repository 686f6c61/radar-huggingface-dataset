# Aaypom/vjepa21-cosmos-ci-predicted-1frame-75k-drive-walk-mse-lpips-finetune-adapter

## Resumen

Este repositorio contiene un adaptador entrenado que conecta dos componentes congelados: el modelo de world modeling V-JEPA 2.1 (`vjepa2_1_vitg_384`, de Meta) y el tokenizador de imagen Cosmos-CI8x8 de NVIDIA. El adaptador observa 14 fotogramas de vídeo, recibe el tubelet conjunto que V-JEPA 2.1 predice para los fotogramas 15 y 16, y lo proyecta al latente de Cosmos-CI8x8 correspondiente únicamente al fotograma 15. Es, por tanto, un readout de un solo fotograma: no modifica el tamano nativo de tubelet de dos fotogramas de V-JEPA.

Se trata de una pieza experimental de investigación, publicada por el usuario Aaypom, orientada a pipelines de predicción de vídeo en espacio latente (world models). Su relevancia es acotada: no es un modelo generalista ni un LLM, sino un conector entre un predictor de dinámica visual y un tokenizador de imagen, útil para quien quiera cerrar el bucle entre predicción latente y decodificación a píxeles dentro del ecosistema Cosmos.

El repositorio pesa 6,4 GB, tiene 0 descargas y 1 like, y no declara licencia, idiomas ni resultados de benchmarks. Los pesos upstream (V-JEPA 2.1 y Cosmos) están excluidos del repositorio y deben obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (cabeza de proyección entrenada) sobre backbone congelado V-JEPA 2.1 ViT-g/384 y tokenizador de imagen congelado Cosmos-0.1-Tokenizer-CI8x8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana temporal de trabajo de 14 fotogramas observados y 1 tubelet predicho (2 fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/imagen; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio con `library_name: pytorch`; los pesos upstream estan excluidos) |

## Arquitectura y entrenamiento

El adaptador se apoya en una arquitectura de tipo JEPA (Joint Embedding Predictive Architecture). El backbone V-JEPA 2.1 (variante ViT-g con resolución 384) permanece congelado y genera una predicción de tubelet conjunto que abarca los fotogramas 15-16 a partir de los fotogramas 1-14 observados. El adaptador lee ese tubelet predicho y lo transforma en el latente del frame 15 tal y como lo produciría el tokenizador Cosmos-CI8x8, también congelado. La salida es un único latente de imagen, no una secuencia ni un cambio del tamano de tubelet nativo de V-JEPA.

El entrenamiento combina tres terminos de perdida con pesos declarados por el autor: MSE sobre el latente (peso 1,0), MSE sobre RGB (peso 5,0) y LPIPS (peso 2,0). La model card indica que esta es la variante "finetune" del adaptador, partiendo de una versión inicial denominada `vjepa21-cosmos-ci-predicted-1frame-75k-drive-walk-mse-adapter`, que se entrenó solo con MSE latente. No se especifican el numero de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO (no aplicable en este tipo de modelo). El sufijo "75k" del nombre no se explica en la documentación disponible. El termino "drive-walk" sugiere un dataset de vídeo de conducción o caminata, pero no se confirma su procedencia ni su tamano.

## Capacidades

- Predicción de un único fotograma futuro (frame 15) en el espacio latente de Cosmos-CI8x8 a partir de 14 fotogramas observados.
- Traducción entre dos espacios latentes distintos: el de V-JEPA 2.1 y el del tokenizador Cosmos-CI8x8.
- World modeling de corto plazo: modelado de dinámica visual en entornos de conducción o navegación, según el nombre del checkpoint.
- No genera texto, código ni matematicas: no es un modelo de lenguaje y no tiene capacidades de razonamiento simbolico.
- No soporta tool calling / function calling.
- No soporta agentes ni multi-step reasoning en el sentido habitual en LLMs.
- No tiene capacidades multilingues.
- La salida es latente; para obtener píxeles hace falta el decodificador del tokenizador Cosmos correspondiente.

## Casos de uso

- Predicción de fotogramas en vídeo de conducción: dado un clip de 14 fotogramas, el adaptador produce el latente del fotograma 15, que puede decodificarse para anticipar la escena inmediata en tareas de asistencia a la conducción o análisis de trayectorias.
- Rollouts autorregresivos en espacio latente: encadenando el adaptador con el predictor de V-JEPA 2.1 se pueden generar secuencias futuras sin pasar por píxeles en cada paso, lo que reduce coste computacional en simuladores de mundo.
- Investigación en evaluación de world models: sirve como componente para medir la calidad de la predicción latente de V-JEPA 2.1 frente a un tokenizador de referencia como Cosmos-CI8x8.
- Preprocesado para pipelines generativos con Cosmos: convertir predicciones de V-JEPA en latentes compatibles con el ecosistema Cosmos facilita encadenar predicción y generación dentro del mismo espacio de representación.
- Aumento de datos para entrenamiento de modelos de vídeo: generar fotogramas plausibles en el frame 15 para ampliar clips cortos, siempre que se acepte el error acumulado del predictor.
- Detección de anomalías en secuencias: comparar el latente predicho con el latente real del fotograma 15 permite calcular una señal de discrepancia util en vigilancia o monitorización industrial.
- Robótica y navegación autónoma: usar el latente predicho como representación anticipada del entorno para planificación en espacio latente, evitando decodificar a píxeles en cada iteración del planificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona un archivo `metrics/latest.json` en el repositorio, pero no se han proporcionado sus valores numericos. Los unicos datos de entrenamiento declarados son los pesos de las perdidas (MSE latente 1,0; MSE RGB 5,0; LPIPS 2,0), que no constituyen resultados comparables con MMLU, HumanEval, GSM8K ni con benchmarks de predicción de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia orientativa, el backbone V-JEPA 2.1 ViT-g/384 congelado en precision de 16 bits ocupa del orden de 2 GB, y el adaptador es una cabeza de proyeccion de tamano reducido; el tokenizador Cosmos-CI8x8 anade una carga menor. El total del pipeline deberia situarse por debajo de 8 GB con clips de 384x384 y 16 fotogramas, aunque esta cifra es una estimacion no verificada.
- GPU recomendadas: no disponibles. Por la estimacion anterior, el pipeline seria ejecutable en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090; para procesamiento por lotes en produccion tendrian sentido A100 o H100.
- Cabe en GPU de consumo: probablemente si, segun la estimacion indicada, siempre que se disponga de al menos 12 GB de VRAM.
- Opciones de despliegue: inferencia directa con PyTorch. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama; estas herramientas no aplican a un adaptador de latentes de vídeo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Funcion | Fotogramas de salida | Perdidas de entrenamiento | Licencia | Senal de uso |
|---|---|---|---|---|---|
| Este adaptador (lpips-finetune) | Tubelet predicho de V-JEPA 2.1 a latente Cosmos-CI8x8 del frame 15 | 1 | MSE latente 1,0 + MSE RGB 5,0 + LPIPS 2,0 | no disponible | 0 descargas, 1 like |
| Aaypom/vjepa21-cosmos-ci-predicted-1frame-75k-drive-walk-mse-adapter | Tubelet predicho a latente Cosmos-CI8x8 del frame 15 | 1 | MSE latente unicamente | no disponible | no disponible |
| Aaypom/vjepa21-cosmos-predicted-4frames-adapter | Version que cubre 4 fotogramas | 4 | no disponible | no disponible | no disponible |
| V-JEPA 2.1 (Meta) | Modelo base de prediccion de video en espacio latente | no aplica (predice tubelets) | no disponible | a verificar en el repositorio de Meta | no disponible |
| Cosmos-0.1-Tokenizer-CI8x8 (NVIDIA) | Tokenizador de imagen con latentes continuos 8x8 | no aplica | no disponible | a verificar en el repositorio de NVIDIA | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que el uso comercial es juridicamente incierto y requiere contactar con el autor.
- Los pesos upstream estan excluidos: hay que descargar V-JEPA 2.1 y el tokenizador Cosmos por separado y aceptar sus respectivas licencias, que pueden imponer restricciones adicionales.
- No se han publicado benchmarks ni metricas numericas verificables; el archivo `metrics/latest.json` referenciado no se ha facilitado con valores.
- El repositorio tiene 0 descargas y 1 like, sin validacion comunitaria ni garantias de reproducibilidad.
- El readout es de un solo fotograma y no altera el tubelet nativo de dos fotogramas de V-JEPA; interpretarlo como un modelo de prediccion de varios fotogramas seria incorrecto.
- El dataset de entrenamiento ("drive-walk") no esta documentado: se desconoce su dominio exacto, tamano y posibles sesgos.
- En rollouts autorregresivos el error de prediccion se acumula, con degradacion progresiva de la calidad del latente y artefactos o desenfoque al decodificar.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso, y no cabe esperar capacidades multilingues.
- No hay informacion sobre tipos de cuantizacion soportados ni sobre exportacion a formatos como ONNX o TensorRT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aaypom/vjepa21-cosmos-ci-predicted-1frame-75k-drive-walk-mse-lpips-finetune-adapter
- Adaptador inicial (solo MSE latente): https://huggingface.co/Aaypom/vjepa21-cosmos-ci-predicted-1frame-75k-drive-walk-mse-adapter
- Adaptador de 4 fotogramas: https://huggingface.co/Aaypom/vjepa21-cosmos-predicted-4frames-adapter
- Checkpoint de V-JEPA 2.1 ViT-g/384: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitg_384.pt
- Tokenizador Cosmos-0.1-Tokenizer-CI8x8: https://huggingface.co/nvidia/Cosmos-0.1-Tokenizer-CI8x8
- Metricas de entrenamiento del repositorio: `metrics/latest.json` (ruta interna del repositorio)
- Paper de Cosmos World Foundation Model Platform: https://arxiv.org/html/2501.03575v1
- Matriz de modelos de Cosmos Predict1: https://docs.nvidia.com/cosmos/latest/predict1/model_matrix.html
- Cosmos Lab / Cosmos 3: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
