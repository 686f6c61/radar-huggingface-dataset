# oteam/solublempnn-noise002

## Resumen

SolubleMPNN-noise002 es una implementación no oficial del modelo ProteinMPNN, publicada por el equipo OFoldX (OTeam), orientada al diseño de secuencias de proteínas sobre una estructura tridimensional fija (*inverse folding*). Se trata de una variante "soluble" entrenada con un nivel de ruido de coordenadas de 0,02 Å, pensada para generar secuencias que favorezcan la solubilidad de la proteína diseñada. El modelo resuelve el problema inverso al plegamiento: dado un esqueleto proteico (backbone), predice una secuencia de aminoácidos compatible con esa geometría.

Arquitectónicamente es una red neuronal de paso de mensajes (MPNN) sobre un grafo de vecinos espaciales, con un codificador y un decodificador de 3 bloques cada uno, tamaño oculto de 128 y 48 vecinos por residuo. Con 1.673.592 parámetros (aproximadamente 1,67 M), es un modelo muy compacto que puede ejecutarse en CPU sin dificultad, lo que lo hace adecuado para pipelines de diseño computacional de proteínas a gran escala.

Es relevante ahora porque el diseño de proteínas *de novo* se ha convertido en una aplicación central de la IA en biología estructural, y ProteinMPNN es uno de los métodos de referencia para el paso de diseño de secuencia. Esta variante concreta, con solo 3 descargas y publicada en octubre de 2026, es un checkpoint especializado dentro de una familia más amplia de variantes (estándar, soluble y CA-only) que OFoldX distribuye para su librería `ofoldx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) autoregresiva sobre grafo de vecinos espaciales, con codificador y decodificador |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de residuos, no sobre secuencias de texto; 48 vecinos por residuo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Atomos de backbone | N, CA, C, O |
| Tamano oculto | 128 |
| Bloques de codificador / decodificador | 3 / 3 |
| Vecinos por residuo | 48 |
| Ruido de entrenamiento | 0,02 Å |
| Libreria | ofoldx |
| Pipeline | other (diseño y puntuación de secuencias) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ProteinMPNN original: representa cada residuo como un nodo de un grafo de vecinos espaciales (k-NN sobre coordenadas) y aplica bloques de paso de mensajes para codificar la geometría del backbone. La decodificación es autoregresiva en un orden causal muestreado, lo que permite condicionar la generación a posiciones fijas, identidades ligadas, restricciones de aminoácidos por posición y perfiles de secuencia. La variante "soluble" se distingue de la estándar por su sesgo hacia proteínas solubles, y este checkpoint concreto se entrenó con una perturbación de coordenadas de 0,02 Å, el nivel de ruido más bajo de la familia, lo que prioriza fidelidad a la geometría frente a robustez ante imprecisión estructural.

El entrenamiento sigue el procedimiento oficial de ProteinMPNN: recuperación autoregresiva de identidades de aminoácidos a partir de la geometría del backbone, con perturbaciones de coordenadas para aumentar la robustez. Los datos de entrenamiento del ejemplo oficial son ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. La model card indica que la variante soluble se centra en proteínas solubles, aunque no se detalla la composición exacta del subconjunto ni el número de tokens o estructuras empleadas en este checkpoint concreto.

## Capacidades

- Diseño de secuencias de proteínas (*inverse folding*) condicionado a un backbone fijo en formato de estructura (por ejemplo, CIF).
- Puntuación de secuencias: cálculo de la log-verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Decodificación autoregresiva con orden causal muestreado, configurable mediante semilla y número de órdenes de decodificación.
- Soporte de posiciones fijas, identidades ligadas, restricciones de aminoácidos específicas por posición y perfiles de secuencia.
- Integración con un empaquetador de cadenas laterales (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño.
- Ejecución por etapas mediante las fases `prepare`, `forward` y `postprocess` de la librería `ofoldx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo específico de biología estructural.

## Casos de uso

- Diseño *de novo* de proteínas solubles: dado un backbone generado por un modelo de plegamiento (por ejemplo, RFdiffusion), SolubleMPNN genera secuencias candidatas con sesgo hacia solubilidad, adecuado para pipelines de diseño computacional que buscan proteínas expresables en sistemas recombinantes.
- Rediseño de secuencias para mejorar la expresabilidad: partiendo de una estructura cristalográfica, el modelo propone secuencias alternativas que mantienen la geometría pero favorecen la solubilidad, útil en ingeniería de proteínas terapéuticas.
- Puntuación y filtrado de candidatos: el pipeline de *score* calcula la NLL por residuo, lo que permite clasificar y descartar diseños con baja compatibilidad estructural antes de pasar a validación experimental.
- Diseño con restricciones funcionales: el soporte de posiciones fijas y restricciones de aminoácidos permite conservar residuos de sitio activo o de unión mientras se rediseña el resto de la secuencia.
- Integración en flujos de diseño y empaquetado: combinado con el MPNN Packer, permite generar coordenadas completas (backbone más cadenas laterales) para su posterior evaluación con herramientas de docking o dinámica molecular.
- Cribado a gran escala en CPU: con 1,67 M de parámetros, el modelo puede ejecutarse en CPU para generar y puntuar miles de secuencias por backbone, lo que lo hace viable en clústeres sin GPU dedicada.
- Docencia e investigación metodológica: al ser una implementación abierta y compacta, sirve para reproducir y estudiar el comportamiento de ProteinMPNN con distintos niveles de ruido y variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo tiene 1,67 M de parámetros (aproximadamente 6,7 MB en FP32), por lo que la memoria dominante es la estructura de entrada y el grafo de vecinos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU.
- Ejecución en CPU: plenamente viable; es el modo habitual para este tipo de modelos compactos.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Backbone | Ruido de entrenamiento | Enfoque | Licencia |
|---|---|---|---|---|---|
| SolubleMPNN-noise002 (este) | 1,674 M | N, CA, C, O | 0,02 Å | Proteínas solubles | AGPL-3.0 |
| ProteinMPNN-noise002 | 1,674 M | N, CA, C, O | 0,02 Å | Estándar | AGPL-3.0 |
| SolubleMPNN-noise030 | 1,674 M | N, CA, C, O | 0,30 Å | Proteínas solubles | AGPL-3.0 |
| CA-only-noise002 | 1,642 M | Solo CA | 0,02 Å | Geometría reducida | AGPL-3.0 |

Las cuatro variantes comparten arquitectura, tamaño oculto, número de bloques y vecinos; las diferencias estriban en el conjunto de átomos del backbone, el sesgo hacia solubilidad y el nivel de ruido de entrenamiento. El nivel de ruido de 0,02 Å es el más bajo de la familia, lo que favorece la fidelidad a estructuras de alta resolución, mientras que las variantes con 0,20 o 0,30 Å están pensadas para backbones más imprecisos.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo original de ProteinMPNN no escribió esta tarjeta ni necesariamente este checkpoint; la reproducibilidad respecto al modelo oficial no está garantizada.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en productos propietarios requiere revisión legal, ya que puede obligar a liberar el código derivado que interactúe con el modelo a través de red.
- Sesgo hacia solubilidad: la variante soluble puede producir secuencias menos óptimas para proteínas de membrana o entornos no acuosos.
- Ruido de entrenamiento bajo (0,02 Å): menor robustez ante backbones imprecisos o generados por modelos de difusión con error estructural; en esos casos pueden ser preferibles las variantes con 0,10-0,30 Å.
- Riesgo de secuencias no plegables: como todo modelo de *inverse folding*, las secuencias generadas requieren validación estructural posterior (por ejemplo, con AlphaFold) y experimental; la NLL baja no garantiza plegamiento ni función.
- Idiomas: no aplica; el modelo no procesa texto.
- Datos de entrenamiento limitados al PDB de 2021: puede no capturar motivos o familias proteicas poco representadas o posteriores a esa fecha.
- Adopción muy baja (3 descargas, 0 likes): escasa validación comunitaria; conviene contrastar resultados con la implementación oficial.
- Sin benchmarks publicados: no hay métricas de *sequence recovery* ni comparaciones cuantitativas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/solublempnn-noise002
- Variante estándar ProteinMPNN-noise002: https://huggingface.co/oteam/proteinmpnn-noise002
- Variante soluble base: https://huggingface.co/oteam/solublempnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial de ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- README de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
