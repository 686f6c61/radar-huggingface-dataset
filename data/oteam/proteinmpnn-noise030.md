# oteam/proteinmpnn-noise030

## Resumen

ProteinMPNN es un modelo de diseño inverso de proteínas (*inverse folding*) desarrollado originalmente por Justas Dauparas y colaboradores en el laboratorio de David Baker (Universidad de Washington). Su tarea consiste en, dada una estructura tridimensional de esqueleto proteico fija, generar una secuencia de aminoácidos que sea compatible con dicha geometría. Este repositorio concreto (`oteam/proteinmpnn-noise030`) es una implementación no oficial publicada por el equipo OFoldX, que empaqueta los pesos originales en formato safetensors para su uso con la librería `ofoldx`, con un nivel de ruido de entrenamiento de 0,30 Å en las coordenadas del esqueleto.

El modelo es una red neuronal de paso de mensajes (*message-passing neural network*) autoregresiva de 1.673.592 parámetros (aproximadamente 1,674 M), con tamaño oculto de 128, tres bloques de codificador y tres de decodificador, y un grafo de vecinos espaciales de 48 vecinos por residuo. Representa cada residuo como un nodo en un grafo de vecinos más cercanos en el espacio y decodifica las identidades de los aminoácidos en un orden causal muestreado, lo que permite condicionar la generación a posiciones fijas, identidades ligadas, restricciones de aminoácidos por posición y perfiles de secuencia.

La relevancia de esta variante radica en su nivel de ruido de entrenamiento (0,30 Å), el más alto de la familia ProteinMPNN estándar. Un mayor ruido durante el entrenamiento hace que el modelo sea más robusto frente a imprecisiones en el esqueleto de entrada, lo que resulta útil cuando la estructura de partida proviene de predicciones computacionales (por ejemplo, AlphaFold) o de modelos experimentales de resolución limitada. La licencia AGPL-3.0 y su naturaleza no oficial son factores determinantes para su adopción en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) autoregresiva sobre grafo de vecinos espaciales; 3 bloques de codificador y 3 de decodificador, tamaño oculto 128 |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de residuos; 48 vecinos por residuo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ProteinMPNN es una red de paso de mensajes que opera sobre un grafo k-NN espacial construido a partir de las coordenadas del esqueleto proteico. Cada residuo se representa como un nodo y las aristas conectan los 48 vecinos más cercanos en el espacio. El codificador propaga información geométrica a través de tres bloques de paso de mensajes y el decodificador genera la secuencia de aminoácidos de forma autoregresiva, siguiendo un orden causal muestreado que permite condicionar la generación a posiciones fijas, identidades ligadas entre residuos, restricciones específicas de aminoácidos por posición y perfiles de secuencia. La variante estándar utiliza los átomos de esqueleto N, CA, C y O, mientras que la variante CA-only emplea únicamente el carbono alfa.

El entrenamiento se basa en la recuperación de identidades de aminoácidos a partir de la geometría del esqueleto, utilizando ensamblajes biológicos del PDB con fecha de 2 de agosto de 2021 y cadenas proteicas agrupadas al 30 % de identidad de secuencia. Durante el entrenamiento se aplican perturbaciones de coordenadas para dotar de robustez al modelo frente a imprecisiones estructurales. Esta variante concreta emplea un ruido de 0,30 Å, el mayor de la familia, lo que la hace más tolerante a esqueletos ruidosos o predichos computacionalmente. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Diseño de secuencias de proteínas condicionado a un esqueleto fijo (*inverse folding*).
- Puntuación de secuencias: cálculo de la log-verosimilitud negativa (NLL) por residuo en nats, con soporte para múltiples órdenes de decodificación (`num_decoding_orders`) y semilla configurable.
- Generación con restricciones: posiciones fijas, identidades ligadas entre residuos, restricciones de aminoácidos específicas por posición y perfiles de secuencia.
- Decodificación autoregresiva con orden causal muestreado, lo que permite explorar distintas trayectorias de generación.
- Integración con un *packer* independiente (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño de secuencia.
- Soporte de ejecución por etapas (`prepare`, `forward`, `postprocess`) en pipelines de OFoldX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- Diseño de proteínas de novo: partiendo de un esqueleto generado por un modelo de difusión o por diseño computacional, ProteinMPNN genera secuencias candidatas compatibles con esa geometría; el ruido de 0,30 Å lo hace adecuado cuando el esqueleto proviene de predicciones y no de estructuras experimentales de alta resolución.
- Rediseño de superficies proteicas: fijando las posiciones del núcleo hidrofóbico y permitiendo variar las de superficie, se pueden generar variantes con propiedades de solubilidad o interacción modificadas, usando las restricciones por posición del modelo.
- Puntuación y filtrado de secuencias en pipelines de diseño: el modo *score* calcula la NLL por residuo, lo que permite clasificar candidatos generados por otros métodos y descartar secuencias incompatibles con el esqueleto antes de pasar a validación experimental.
- Humanización de anticuerpos: dado el esqueleto de un anticuerpo, se pueden rediseñar regiones determinantes de complementariedad (CDR) manteniendo el andamiaje, con posiciones fijas para conservar la estructura.
- Estabilización de enzimas: rediseño de secuencias sobre estructuras cristalográficas o predichas para mejorar el plegamiento, usando el modo de diseño con restricciones en el sitio activo.
- Integración en flujos de diseño y empaquetado: combinación con MPNN Packer para generar cadenas laterales tras el diseño de secuencia, permitiendo evaluar la compatibilidad estérica del modelo diseñado.
- Análisis de tolerancia a ruido estructural: al ser la variante de mayor ruido de la familia, sirve para comparar el rendimiento de diseño cuando el esqueleto de entrada tiene calidad variable, lo que es útil en investigación metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en precisión completa (1,674 M parámetros, aproximadamente 6,7 MB en fp32); el consumo real vendrá dominado por el grafo de vecinos y el tamaño de la proteína de entrada, no por el modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores. Para lotes grandes de esqueletos o proteínas de gran tamaño, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía oficial para cargar el modelo y ejecutar los pipelines `design` y `score`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del número de residuos, del número de órdenes de decodificación y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Esqueleto | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProteinMPNN noise030 (este) | 1,674 M | N, CA, C, O | 0,30 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN noise002 | 1,674 M | N, CA, C, O | 0,02 Å | AGPL-3.0 | Hugging Face (oteam) |
| SolubleMPNN noise030 | 1,674 M | N, CA, C, O | 0,30 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN CA-only noise020 | 1,642 M | CA | 0,20 Å | AGPL-3.0 | Hugging Face (oteam) |

La comparación con modelos de otras familias (por ejemplo, ESM-IF, LigandMPNN o modelos de diseño generativo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de ProteinMPNN no escribió esta model card ni validó este empaquetado; para producción conviene contrastar con el repositorio oficial `dauparas/ProteinMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que utilice el modelo en red; es necesario revisar su compatibilidad con el uso comercial previsto.
- El modelo diseña secuencias para un esqueleto fijo; no predice estructura ni valida que la secuencia generada se pliegue realmente en la conformación de entrada.
- Riesgo de secuencias no funcionales: la recuperación de identidad de aminoácidos no garantiza función biológica, estabilidad ni expresión; se requiere validación experimental.
- Dependencia de la calidad del esqueleto: aunque el ruido de 0,30 Å aporta robustez, esqueletos con errores graves (regiones desordenadas, bucles mal modelados) pueden producir diseños poco fiables.
- Sesgos derivados del PDB: el entrenamiento con ensamblajes biológicos del PDB puede infrarrepresentar ciertas familias proteicas y sobrerrepresentar otras sobrerrepresentadas en la base de datos.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y su evaluación debe hacerse con métricas estructurales y bioquímicas, no con benchmarks de NLP.
- Idiomas soportados: no aplica; la información de idiomas no está disponible porque el modelo no opera sobre lenguaje natural.
- Sin datos publicados de benchmarks en este repositorio, por lo que no es posible comparar su rendimiento de forma cuantitativa con las otras variantes sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/proteinmpnn-noise030
- Variante noise002: https://huggingface.co/oteam/proteinmpnn-noise002
- Variante noise010: https://huggingface.co/oteam/proteinmpnn-noise010
- Variante noise020: https://huggingface.co/oteam/proteinmpnn-noise020
- Modelo ProteinMPNN base: https://huggingface.co/oteam/proteinmpnn
- SolubleMPNN: https://huggingface.co/oteam/solublempnn
- CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial: https://github.com/dauparas/ProteinMPNN
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
