# oteam/proteinmpnn-ca-only-noise002

## Resumen

ProteinMPNN es un modelo de diseño inverso de proteínas (*inverse folding*): dada una estructura tridimensional de esqueleto proteico fija, genera secuencias de aminoácidos que la adoptan. Esta ficha corresponde a la variante **CA-only** con ruido de entrenamiento de 0,02 Å, publicada por el equipo OFoldX (oteam) como implementación **no oficial** del trabajo original de Justas Dauparas et al. (Baker Lab, *Science*, 2022). El modelo original es una referencia consolidada en el campo del diseño computacional de proteínas, y esta reimplementación lo empaqueta para la librería `ofoldx`.

La variante CA-only emplea únicamente el átomo de carbono alfa de cada residuo como geometría de entrada, en lugar de los cuatro átomos de esqueleto (N, CA, C, O) del modelo estándar. Esto reduce la información disponible pero simplifica los requisitos de entrada, útil cuando solo se dispone de coordenadas CA (por ejemplo, tras predicción de estructura o en modelos *coarse-grained*). El modelo tiene 1.641.720 parámetros (1,642 M), un tamaño muy reducido que permite inferencia en CPU.

Arquitectónicamente es una red neuronal de paso de mensajes (*message passing*) sobre un grafo de vecinos espaciales, con codificador y decodificador de 3 bloques cada uno y tamaño oculto de 128. No es un transformer ni un modelo de lenguaje: es un modelo especializado de estructura a secuencia con decodificación autorregresiva en orden causal muestreado. Su relevancia radica en que permite diseñar secuencias para *scaffolds* proteicos en pipelines de diseño de proteínas *de novo*, con soporte para posiciones fijas, identidades ligadas y perfiles de secuencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message passing) sobre grafo de vecinos espaciales, codificador-decodificador autorregresivo |
| Parametros totales | 1.641.720 (1,642 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del número de residuos de la estructura de entrada; vecindad k=48) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Átomos de esqueleto de entrada | solo CA |
| Tamaño oculto | 128 |
| Bloques de codificador | 3 |
| Bloques de decodificador | 3 |
| Vecinos por residuo (k) | 48 |
| Ruido de entrenamiento | 0,02 Å |
| Librería | ofoldx |

## Arquitectura y entrenamiento

El modelo representa cada residuo como un nodo de un grafo de vecinos espaciales más cercanos (k=48). La geometría del esqueleto se codifica mediante bloques de paso de mensajes y las identidades de los residuos se decodifican de forma autorregresiva en un orden causal muestreado. En esta variante CA-only, la entrada geométrica se limita a las coordenadas del carbono alfa, lo que reduce la dimensionalidad de la señal de entrada respecto al modelo estándar de esqueleto completo. La generación admite posiciones fijas, identidades ligadas, restricciones de aminoácido específicas por posición y perfiles de secuencia.

El entrenamiento sigue el esquema de recuperación autorregresiva de secuencia con perturbaciones de coordenadas para aumentar la robustez frente a imprecisión estructural. El ejemplo de entrenamiento oficial utiliza ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. La variante CA-only emplea geometría de esqueleto reducida y, en este checkpoint concreto, un nivel de ruido de 0,02 Å. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset para esta variante.

## Capacidades

- Diseño de secuencias de proteínas condicionado a una estructura de esqueleto fija (*inverse folding*).
- Puntuación de secuencias: cálculo de log-verosimilitud negativa (NLL) global y por residuo, en nats por residuo, con múltiples órdenes de decodificación.
- Soporte de posiciones fijas y restricciones por posición durante el diseño.
- Soporte de identidades ligadas (residuos que deben compartir aminoácido).
- Soporte de perfiles de secuencia como sesgo en la generación.
- Decodificación autorregresiva en orden causal muestreado, con control de semilla.
- Integración con un *packer* MPNN independiente para generar coordenadas de cadenas laterales tras el diseño.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo biológico especializado.

## Casos de uso

- **Diseño de proteínas *de novo* sobre scaffolds generados**: dado un esqueleto producido por un generador de estructuras (por ejemplo, un modelo de difusión), ProteinMPNN CA-only propone secuencias compatibles con la geometría CA, permitiendo iterar diseño estructura-secuencia en pipelines de protein design.
- **Rediseño de superficies y optimización de estabilidad**: fijando el núcleo mediante restricciones por posición y dejando libres los residuos de superficie, se generan variantes que preservan el pliegue y modifican propiedades de superficie, útil en ingeniería de anticuerpos y enzimas.
- **Puntuación de secuencias candidatas**: el modo *score* calcula NLL por residuo con varios órdenes de decodificación, lo que permite clasificar y filtrar secuencias generadas por otros métodos antes de validación experimental.
- **Diseño con perfiles de secuencia**: en ingeniería de proteínas dirigida, se puede sesgar la generación hacia familias de secuencias conocidas mediante perfiles, manteniendo la compatibilidad con el esqueleto objetivo.
- **Diseño a partir de estructuras *coarse-grained* o predichas**: al requerir solo coordenadas CA, es adecuado cuando la estructura proviene de predicciones o representaciones reducidas donde no se dispone de N, C y O con fiabilidad.
- **Generación de bibliotecas de variantes para cribado**: la decodificación con orden muestreado y semilla permite generar múltiples candidatos por esqueleto, produciendo bibliotecas diversas para experimentos de *screening*.
- **Integración en pipelines de diseño y empaquetado**: combinado con el MPNN Packer de OFoldX, se obtienen coordenadas de cadenas laterales tras el diseño, habilitando evaluación estructural posterior (por ejemplo, con AlphaFold) dentro del mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,642 M de parámetros, los pesos en fp32 ocupan aproximadamente 6,6 MB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (incluso integradas) es suficiente. Una RTX 4090 o A100 aportan margen pero no son necesarias.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx), con pipelines `design`, `score` y `ProteinMpnnDesignAndPackPipeline`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de residuos y del número de órdenes de decodificación.

## Comparativa con modelos similares

| Modelo | Átomos de entrada | Parámetros | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProteinMPNN CA-only noise002 (este) | CA | 1,642 M | 0,02 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN estándar noise002 | N, CA, C, O | 1,674 M | 0,02 Å | AGPL-3.0 | Hugging Face (oteam) |
| SolubleMPNN noise002 | N, CA, C, O | 1,674 M | 0,02 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN original (dauparas) | N, CA, C, O | ~1,7 M | 0,02 Å | MIT (repo original) | GitHub |

Las variantes estándar y soluble emplean el esqueleto completo y están orientadas a proteínas generales y solubles respectivamente; la variante CA-only sacrifica información geométrica a cambio de aceptar entradas reducidas. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo original de ProteinMPNN no la escribió ni la validó.
- Requiere la librería `ofoldx` para su uso; no es un checkpoint directamente cargable con transformers ni con herramientas estándar de inferencia.
- La variante CA-only dispone de menos información geométrica que el modelo estándar, lo que puede reducir la precisión del diseño en comparación con la versión de esqueleto completo.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y su uso en servicios en red; revisar implicaciones antes de uso comercial o en productos propietarios.
- Riesgo de secuencias no plegables o inestables: como todo modelo de inverse folding, las secuencias generadas requieren validación estructural y experimental.
- Sin datos publicados de benchmarks para este checkpoint concreto; no se puede afirmar su rendimiento relativo sin evaluación propia.
- No apta para tareas de lenguaje, visión ni agentes; su ámbito es exclusivamente el diseño de secuencias proteicas.
- El número de descargas y likes registrados es cero en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/proteinmpnn-ca-only-noise002
- Variante CA-only base: https://huggingface.co/oteam/proteinmpnn-ca-only
- Variante CA-only noise010: https://huggingface.co/oteam/proteinmpnn-ca-only-noise010
- Variante CA-only noise020: https://huggingface.co/oteam/proteinmpnn-ca-only
- Modelo estándar: https://huggingface.co/oteam/proteinmpnn
- Modelo estándar noise002: https://huggingface.co/oteam/proteinmpnn-noise002
- Modelo soluble: https://huggingface.co/oteam/solublempnn
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Código OFoldX (proteinmpnn): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentación de ofoldx: https://ofoldx.valtech.ai/
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- README de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
