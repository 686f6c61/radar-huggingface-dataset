# OneScience-Group/MACE

## Resumen

MACE es un potencial interatómico de aprendizaje automático (MLIP, por sus siglas en inglés) desarrollado por OneScience-Group para la simulación de sistemas moleculares y de materiales. Se basa en una red neuronal de grafos equivariante bajo el grupo E(3), lo que le permite predecir energías y fuerzas de estructuras atómicas con alta precisión y eficiencia. El modelo se enmarca en el proyecto OneScience, una plataforma de computación científica con inteligencia artificial, y su implementación de referencia proviene del proyecto upstream MACE, publicado bajo licencia MIT.

La relevancia de MACE radica en su capacidad para acelerar simulaciones de dinámica molecular y optimización de estructuras, sustituyendo los costosos cálculos de primeros principios (DFT) por predicciones rápidas basadas en redes neuronales. Al ser un modelo entrenable, los usuarios pueden adaptarlo a sus propios conjuntos de datos, lo que lo convierte en una herramienta flexible para investigación en química computacional, ciencia de materiales y diseño de fármacos. En la actualidad, la versión publicada en Hugging Face no incluye pesos preentrenados, por lo que su uso requiere un proceso de entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos equivariante E(3) (E(3)-equivariant graph neural network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; trabaja con estructuras atómicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (etiquetas de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se incluyen pesos preentrenados; el entrenamiento produce checkpoints en formato PyTorch) |

## Arquitectura y entrenamiento

MACE emplea una arquitectura de red neuronal de grafos equivariante bajo el grupo E(3), lo que garantiza que las predicciones de energía y fuerzas sean invariantes y equivariantes respectivamente ante rotaciones y traslaciones del sistema atómico. Esta propiedad es fundamental para que el potencial sea físicamente consistente y transferible entre distintas configuraciones. El modelo procesa estructuras atómicas representadas como grafos, donde los nodos son átomos y las aristas representan enlaces o interacciones, y utiliza mensajes de orden superior para capturar interacciones de muchos cuerpos.

El entrenamiento se realiza con datos en formato HDF5 o XYZ, y el repositorio proporciona configuraciones de ejemplo para conjuntos de datos como DMC, ANI1x, agua y nanotubos. No se especifican el número de tokens (no aplica), el tamaño del dataset ni si se emplearon técnicas como RLHF o DPO, ya que se trata de un modelo de potencial interatómico y no de un modelo de lenguaje. La implementación de referencia está disponible en el repositorio oficial de MACE (ACEsuit/mace) y el código de OneScience se basa en ella, manteniendo la licencia MIT.

## Capacidades

- Prediccion de energia total de estructuras atomicas.
- Prediccion de fuerzas atomicas (gradientes de la energia respecto a las posiciones).
- Optimizacion de estructuras (relajacion geometrica) para encontrar minimos de energia.
- Entrenamiento de potenciales interatomicos personalizados a partir de datos propios (HDF5/XYZ).
- Soporte para entrenamiento distribuido en multiples GPUs o DCUs (unidades de computo dedicadas, similares a GPUs, usadas en entornos chinos).
- Evaluacion de metricas de error de energia y fuerza sobre conjuntos de validacion durante el entrenamiento.
- Compatibilidad con entornos de computacion cientifica como OneScience MatChem, que incluye PyYAML y h5py para gestion de datos y configuracion.
- Capacidad de ejecucion en CPU para pruebas de conectividad y configuraciones pequenas, aunque el entrenamiento completo requiere GPU o DCU.

## Casos de uso

- Entrenamiento de potenciales interatomicos para dinamica molecular: el modelo puede entrenarse con datos de simulaciones DFT para reproducir superficies de energia potencial, permitiendo simulaciones de larga duracion a una fraccion del coste computacional.
- Optimizacion de estructuras cristalinas y moleculares: gracias a su capacidad de prediccion de energia y fuerzas, MACE puede usarse para relajar geometrias y encontrar configuraciones estables en materiales.
- Simulacion de propiedades termodinamicas: una vez entrenado, el potencial puede integrarse en codigos de dinamica molecular para calcular propiedades como capacidad calorifica, coeficientes de difusion o puntos de fusion.
- Exploracion de superficies de energia potencial en quimica: el modelo permite muestrear configuraciones de baja energia para estudiar mecanismos de reaccion o transiciones conformacionales.
- Verificacion de entornos de computacion distribuida: el script de preflight incluido en el repositorio permite comprobar la conectividad multi-GPU/multi-nodo y la consistencia de rutas de datos antes de lanzar entrenamientos a gran escala.
- Migracion de datos personalizados: los usuarios pueden adaptar las configuraciones de entrenamiento a sus propios conjuntos de datos HDF5/XYZ, lo que facilita la aplicacion del modelo a sistemas especificos no cubiertos por los ejemplos proporcionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento ni comparaciones con otros modelos. Se recomienda consultar el articulo original de MACE (*MACE: Higher order equivariant message passing neural networks for fast and accurate force fields*) para obtener datos de precision y eficiencia, aunque dichos datos no se reproducen aqui por no estar incluidos en el material proporcionado.

## Requisitos de hardware

- Se recomienda una GPU o DCU para el entrenamiento. No se especifica la VRAM minima ni el modelo de GPU concreto.
- Una CPU puede utilizarse para comprobaciones de importacion y pruebas de conectividad con configuraciones pequenas, pero el entrenamiento completo sera lento.
- Para usuarios de DCU, se requiere instalar DTK (25.04.2 o posterior) o la version recomendada por OneScience para el cluster correspondiente.
- El entorno de ejecucion se instala mediante `pip install onescience[matchem-gpu]` o `onescience[matchem-dcu]`, dependiendo del hardware.
- No se proporcionan datos de latencia ni throughput para inferencia.
- Las opciones de despliegue se limitan al uso dentro del ecosistema OneScience, con scripts de entrenamiento para una o varias GPUs, y soporte para SLURM en entornos de supercomputacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. MACE pertenece a la categoria de potenciales interatomicos basados en redes neuronales equivariantes, junto con otros modelos como NequIP, Allegro o SchNet. Sin embargo, sin datos numericos de benchmarks, no es posible establecer una comparacion cuantitativa. La siguiente tabla resume caracteristicas generales conocidas de estos modelos, pero los valores de rendimiento no estan disponibles.

| Modelo | Arquitectura | Licencia | Pesos preentrenados | Referencia |
|---|---|---|---|---|
| MACE (OneScience) | GNN equivariante E(3) | MIT | No incluidos | Repositorio de HuggingFace |
| NequIP | GNN equivariante E(3) | MIT | Disponibles (varios) | Repositorio oficial |
| Allegro | GNN equivariante E(3) local | MIT | Disponibles | Repositorio oficial |

Nota: los datos de la tabla se basan en conocimiento general y no en la informacion proporcionada en la model card. No se han verificado los pesos preentrenados de NequIP y Allegro en este documento.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados; los usuarios deben entrenar el modelo desde cero con sus propios datos. Esto requiere acceso a conjuntos de datos de calidad y recursos computacionales adecuados.
- Los datos de entrenamiento no estan incluidos en el paquete; deben descargarse por separado desde Hugging Face (por ejemplo, el dataset DMC) o proporcionarse por el usuario.
- La model card no especifica el tamaño del modelo ni el numero de parametros, lo que dificulta estimar los requisitos de memoria y el rendimiento esperado.
- No se documentan limitaciones en cuanto a la transferibilidad a sistemas fuera de los dominios de entrenamiento; como cualquier MLIP, el modelo puede producir predicciones poco fiables en configuraciones muy diferentes a las vistas durante el entrenamiento.
- Al ser un modelo de fisica, no presenta sesgos sociales, pero si puede sufrir de alucinaciones en el sentido de predecir energias o fuerzas incorrectas si se usa fuera de su dominio de validez.
- La licencia MIT permite uso comercial, pero el codigo de referencia proviene del proyecto MACE upstream, que tambien es MIT; no hay restricciones adicionales conocidas.
- La documentacion esta en ingles; no hay version en espanol.
- El entorno de instalacion depende de los repositorios de OneScience (mirrors.onescience.ai), que pueden no ser accesibles desde todas las redes o regiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/MACE
- Repositorio de referencia MACE (ACEsuit): https://github.com/ACEsuit/mace
- Paper original: *MACE: Higher order equivariant message passing neural networks for fast and accurate force fields* (no se proporciona URL directa en la model card)
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de habilidades de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Dataset de ejemplo DMC: https://huggingface.co/datasets/OneScience-Group/DMC
- Dataset ANI1x: https://huggingface.co/datasets/OneScience-Group/ANI1x
- Dataset de agua: https://huggingface.co/datasets/OneScience-Group/water
- Dataset de nanotubos: https://huggingface.co/datasets/OneScience-Group/nanotube
