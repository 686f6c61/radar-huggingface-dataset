# OneScience-Group/PsiNN-CylinderFlow-StructureTransfer

## Resumen

PsiNN-CylinderFlow-StructureTransfer es un paquete de reproduccion de un experimento de aprendizaje automatico cientifico (Scientific Machine Learning) orientado a la resolucion del flujo estacionario bidimensional alrededor de un cilindro, incluyendo una tarea de transferencia de estructura. Lo publica la organizacion OneScience-Group en Hugging Face bajo licencia Apache 2.0 y se distribuye como repositorio PyTorch con codigo, configuracion, scripts de entrenamiento, inferencia y visualizacion, junto con el checkpoint entrenado `weight/best_model.pth`.

No se trata de un modelo de lenguaje: es un modelo neuronal de fisica (etiquetado en el repositorio como `psinn_flow`) que aproxima campos de presion y velocidad (p, u, v) sobre coordenadas espaciales (x, y). El problema que aborda es el de las ecuaciones en derivadas parciales (PDE) inversas y directas en mecanica de fluidos, donde el modelo aprende a partir de muestras de contorno y evalua contra la verdad interior del campo.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un experimento publicado (DOI 10.1038/s41467-025-64624-3), con numeros de error reportados y artefactos completos para volver a ejecutar el pipeline. El tamano del repositorio es de 0,0 GB segun los metadatos, y no se declaran parametros, contexto ni idiomas mas alla del ingles en la documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal para PDEs (etiqueta `psinn_flow`), implementada en PyTorch; topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre coordenadas espaciales x, y, no sobre tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | Apache 2.0 (codigo); la licencia del dataset no debe inferirse de la del codigo |
| Formato de pesos | checkpoint PyTorch `.pth` (`weight/best_model.pth`) |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna (capas, funciones de activacion, uso de derivadas automaticas para residuos de PDE, etc.); solo indica que se trata de un modelo `psinn_flow` implementado en PyTorch y que reproduce el experimento de flujo estacionario 2D alrededor de un cilindro con transferencia de estructura. El paquete incluye `config/config.yaml` con los parametros del experimento, pero sus valores no se reproducen en la informacion disponible.

En cuanto a los datos, se emplean cinco ficheros CSV con columnas x, y, p, u, v descargables desde el dataset OneScience/PsiNN-CylinderFlow en ModelScope. Las muestras de contorno se usan para entrenamiento y la verdad del campo interior se reserva exclusivamente para evaluacion, lo que evita fuga de informacion en la fase de ajuste. La procedencia de los datos se remonta al repositorio GitHub ZitiLiu/Psi-NN, carpeta `Database/flow`. El autor advierte que el paquete se entreno una sola vez y que las cifras reportadas no garantizan resultados en otra ejecucion. No se documentan en la informacion disponible detalles sobre regimen de entrenamiento, numero de iteraciones, funcion de perdida ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Prediccion de campos fisicos bidimensionales de presion y velocidad (p, u, v) sobre coordenadas espaciales (x, y) para el flujo estacionario alrededor de un cilindro.
- Resolucion de un problema directo de PDEs con supervision en el contorno y evaluacion contra el campo interior.
- Transferencia de estructura: el paquete reproduce un experimento de structure transfer, segun el nombre y la descripcion del modelo.
- Inferencia por lotes mediante `scripts/inference.py` y generacion de resultados y visualizaciones con `scripts/result.py`.
- Reentrenamiento reproducible con `scripts/train.py` y configuracion en `config/config.yaml`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo numerico de dominio especifico.

## Casos de uso

- Validacion de pipelines de ML cientifico: usar el checkpoint y los scripts incluidos para comprobar que un entorno PyTorch con acelerador reproduce los errores reportados (MSE de p/u/v de 7,348e-5 / 2,965e-5 / 1,998e-5) antes de desplegar modelos propios de PDEs.
- Baseline en investigacion de flujos alrededor de obstaculos: servir como referencia cuantitativa para comparar variantes de arquitectura o de muestreo de contorno en el mismo dataset de cilindro.
- Docencia en metodos numericos y PINNs: el paquete incluye entrenamiento, inferencia y visualizacion, lo que permite recorrer el ciclo completo con datos de contorno y verdad interior separada para evaluacion.
- Experimentos de transferencia de estructura: reutilizar el checkpoint como punto de partida para estudiar como se transfiere la representacion aprendida a configuraciones geometricas o de contorno relacionadas.
- Generacion de campos sinteticos para prevalidacion: producir campos p, u, v aproximados que sirvan como comprobacion rapida antes de lanzar simulaciones CFD de mayor coste, siempre con la cautela de que el modelo esta ajustado a un unico regimen estacionario 2D.
- Reproducibilidad de publicaciones: al estar vinculado a un DOI concreto (10.1038/s41467-025-64624-3), permite a revisores y lectores reejecutar el experimento y contrastar cifras.

## Benchmarks y rendimiento

Los unicos numeros publicados en la informacion disponible son los errores de reconstruccion del campo completo sobre el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| MSE campo completo p | 7,348e-5 |
| MSE campo completo u | 2,965e-5 |
| MSE campo completo v | 1,998e-5 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del checkpoint no se detalla y el repositorio figura con 0,0 GB en los metadatos.
- GPU recomendadas: no disponibles; el autor indica que para entrenar hace falta un entorno PyTorch con soporte de acelerador, sin especificar modelos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por la naturaleza del modelo (malla 2D y cinco CSV de entrada) es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ejecucion directa con PyTorch mediante `scripts/inference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de la misma categoria (redes neuronales para PDEs de flujo alrededor de cilindro) ni datos de rendimiento de alternativas con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: flujo estacionario bidimensional alrededor de un cilindro; no es extrapolable a regimenes turbulentos, 3D u otras geometrias sin reentrenamiento.
- Entrenamiento unico: el autor advierte explicitamente que las cifras reportadas no son garantia para otra ejecucion; la variabilidad entre semillas no se documenta.
- La verdad del campo interior se usa solo para evaluacion; cualquier uso del modelo como sustituto de CFD en produccion debe validarse contra simulacion de referencia.
- Licencia del codigo Apache 2.0, pero la licencia del dataset no debe inferirse de la del codigo y debe consultarse por separado en su origen.
- Documentacion en ingles unicamente y sin detalles de arquitectura, numero de parametros ni hiperparametros en la model card.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni de validacion externa.
- Riesgo de sobreajuste al unico caso de estudio: al tratarse de un experimento de reproduccion, no se reportan pruebas de generalizacion fuera del dataset de cilindro.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/PsiNN-CylinderFlow-StructureTransfer
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/PsiNN-CylinderFlow
- Origen de los datos (GitHub): https://github.com/ZitiLiu/Psi-NN/tree/main/Database/flow
- Publicacion de referencia: https://doi.org/10.1038/s41467-025-64624-3
