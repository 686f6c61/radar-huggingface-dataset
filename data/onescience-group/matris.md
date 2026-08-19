# OneScience-Group/MatRIS

## Resumen

MatRIS (Materials Representation and Interaction Simulation) es un modelo fundacional para ciencia de materiales desarrollado por el grupo OneScience. Su objetivo es predecir propiedades físicas de estructuras cristalinas —energía total, fuerzas atómicas, tensor de tensión y momentos magnéticos— y realizar relajación estructural, una tarea esencial en el diseño y descubrimiento de nuevos materiales. El modelo se basa en una red neuronal de grafos (GNN) entrenada sobre los datasets OMat24 y MPTrj, dos referencias en el ámbito de la simulación de materiales.

La relevancia actual de MatRIS radica en que ofrece una alternativa unificada a los cálculos de primeros principios (DFT) para la predicción rápida de propiedades y la optimización de geometrías, con soporte nativo para objetos de ASE y pymatgen. El repositorio incluye tres variantes de pesos (matris_10m_omat, matris_10m_oam y matris_10m_mp) que cubren distintos regímenes de entrenamiento, y se distribuye bajo licencia BSD-3-Clause. Aunque el modelo es pequeño (del orden de 10 millones de parámetros, según el sufijo "10m"), su diseño orientado a grafos atómicos lo hace adecuado para simular celdas cristalinas con cientos de átomos en hardware moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (graph neural network) |
| Parametros totales | No disponible (el sufijo "10m" sugiere ~10 millones, no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de estructura cristalina, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (metadata), aunque el modelo opera sobre estructuras atomicas |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (probablemente binarios de PyTorch o safetensors, no especificado) |

## Arquitectura y entrenamiento

MatRIS emplea una arquitectura de red neuronal de grafos, una familia de modelos que representa cada estructura cristalina como un grafo donde los nodos son atomos y las aristas representan enlaces o interacciones de corto alcance. Esta representacion permite capturar la simetria traslacional y las dependencias locales entre atomos, lo que resulta adecuado para predecir propiedades extensivas (energia) e intensivas (fuerzas, tensiones) de forma eficiente y transferible entre distintos compuestos.

El entrenamiento se realiza sobre los datasets OMat24 y MPTrj, que contienen miles de estructuras cristalinas con sus correspondientes energias, fuerzas y tensiones calculadas mediante metodos de primeros principios. El repositorio ofrece tres conjuntos de pesos: `matris_10m_omat` (entrenado exclusivamente en OMat24), `matris_10m_oam` (entrenado en OMat24 y afinado con sAlex+MPtrj) y `matris_10m_mp` (entrenado en MPTrj). No se especifican detalles sobre el numero total de tokens (en este contexto, estructuras), la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO, ya que no es un modelo de lenguaje. La implementacion esta basada en PyTorch y se integra con el ecosistema OneScience (OneCode, MatChem).

## Capacidades

- Prediccion de energia total de estructuras cristalinas a partir de archivos CIF, objetos pymatgen Structure o ASE Atoms.
- Estimacion de fuerzas atomicas (eV/Å) y tensor de tension (eV/Å³), necesarios para simulaciones de dinamica molecular y relajacion estructural.
- Prediccion de momentos magneticos dependientes de la estructura, mediante la tarea `efsm` (energy, forces, stress, magnetic moments).
- Relajacion estructural completa: optimizacion de posiciones atomicas y de la celda unitaria mediante el modulo `StructOptimizer`.
- Compatibilidad con el ecosistema ASE y pymatgen, permitiendo integrar el modelo como calculadora en flujos de trabajo existentes.
- Soporte para ejecucion en GPU, DCU (procesadores de aceleracion de origen chino) y CPU (esta ultima solo para pruebas y forward passes pequenos).

## Casos de uso

- Screening de candidatos a materiales: dado un conjunto de estructuras cristalinas generadas por metodos heuristicos o de busqueda, MatRIS puede predecir su energia y estabilidad relativa sin necesidad de calculos DFT costosos, acelerando la preseleccion de compuestos prometedores.
- Relajacion estructural previa a simulaciones de dinamica molecular: el modelo optimiza posiciones atomicas y parametros de red de forma rapida, proporcionando geometrias de partida equilibradas para simulaciones posteriores con metodos mas precisos.
- Prediccion de propiedades magneticas: la capacidad de estimar momentos magneticos permite explorar materiales para aplicaciones de espintronica o almacenamiento magnetico, donde la configuracion magnetica es critica.
- Optimizacion de catalizadores: al predecir fuerzas y energias, MatRIS puede evaluar la adsorcion de moleculas en superficies cristalinas y ayudar en el diseno de catalizadores heterogeneos.
- Integracion en pipelines de descubrimiento automatizado: mediante la API de calculadora de ASE, el modelo puede conectarse a frameworks de optimizacion bayesiana o aprendizaje activo para cerrar el ciclo de diseno-experimento.
- Verificacion de entornos de computacion cientifica: el repositorio incluye un script de prueba que utiliza un modelo ligero para comprobar que el entorno OneScience MatChem esta correctamente configurado, util en despliegues en cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos de simulacion de materiales (como MACE, Orb, o modelos basados en GNoME) ni metricas cuantitativas de error en energia, fuerzas o tensiones.

## Requisitos de hardware

- Se recomienda una GPU o DCU para inferencia y relajacion estructural; la CPU solo es viable para pruebas de modularidad y forward passes de pequeno tamano.
- No se especifican requisitos minimos de VRAM. Dado el tamano del repositorio (0.1 GB) y el sufijo "10m", el modelo es ligero y probablemente cabe en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmacion oficial.
- Para entornos DCU, se requiere DTK 25.04.2 o posterior, o la version recomendada por OneScience para el cluster.
- Opciones de despliegue: el modelo se usa a traves del paquete `onescience[matchem-gpu]` o `onescience[matchem-dcu]`, con la clase `MatRISCalculator` que actua como calculadora de ASE. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia, ya que no es un modelo de lenguaje.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no menciona modelos comparables en el ambito de la simulacion de materiales (por ejemplo, MACE, Orb, CHGNet, o el propio OMat24 como baseline). Tampoco se ofrecen comparaciones de rendimiento o precision frente a alternativas.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al entrenarse en datasets como OMat24 y MPTrj, el modelo puede tener menor precision en clases de materiales poco representadas en esos conjuntos (por ejemplo, compuestos con elementos raros o quimica exotica).
- Riesgo de alucinacion: aunque no es un modelo generativo de texto, las predicciones de energia o fuerzas pueden ser inexactas para estructuras fuera del dominio de entrenamiento; se recomienda validar con metodos de primeros principios en casos criticos.
- La relajacion estructural en CPU es lenta y no se recomienda para produccion; el uso de GPU o DCU es practicamente obligatorio para cargas de trabajo reales.
- La licencia BSD-3-Clause permite uso comercial, pero se debe conservar la atribucion de la fuente original y citar los proyectos OneScience y los datasets utilizados en publicaciones.
- El ecosistema de instalacion depende de repositorios propios de OneScience (mirrors.onescience.ai), lo que puede complicar el despliegue fuera de su infraestructura.
- No se especifica el formato de los pesos (si son safetensors, binarios de PyTorch, etc.), lo que puede afectar a la portabilidad a otros frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/MatRIS
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode (acceso en linea): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
