# oteam/solublempnn-noise030

## Resumen

SolubleMPNN-noise030 es una implementación no oficial del modelo ProteinMPNN, especializada en el diseño de secuencias de proteínas solubles condicionado a una estructura tridimensional fija (inverse folding). Lo desarrolla el equipo OFoldX (OTeam-AI4S) y se distribuye a través de HuggingFace bajo el identificador `oteam/solublempnn-noise030`. El modelo original procede del trabajo de Justas Dauparas et al. publicado en Science, y esta variante concreta se entrena con un nivel de ruido de coordenadas de 0,30 Å para aumentar la robustez frente a imprecisiones en el backbone de entrada.

La arquitectura es una red neuronal de paso de mensajes (message-passing neural network) autorregresiva de 1.673.592 parámetros totales, con un tamaño oculto de 128, tres bloques de encoder y tres de decoder, y un grafo de vecinos espaciales de 48 residuos por nodo. Representa cada residuo como un nodo en un grafo de vecinos más cercanos espaciales, codifica la geometría del backbone mediante bloques de message-passing y decodifica las identidades de los aminoácidos en un orden causal muestreado.

Su relevancia radica en que permite el diseño computacional de proteínas solubles con control fino sobre posiciones fijas, identidades ligadas, restricciones de aminoácidos específicas por posición y perfiles de secuencia, lo que lo convierte en una herramienta útil en pipelines de diseño de proteínas y en la evaluación de secuencias candidatas mediante scoring de verosimilitud negativa por residuo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (message-passing neural network) autorregresiva sobre grafo de vecinos espaciales |
| Parámetros totales | 1.673.592 (1,674 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del número de residuos del backbone; vecinos por nodo: 48) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ProteinMPNN: un encoder de message-passing sobre un grafo k-NN espacial (k=48) que procesa la geometría del backbone (átomos N, CA, C, O), seguido de un decoder autorregresivo que genera la secuencia de aminoácidos en un orden causal muestreado. Cuenta con un tamaño oculto de 128 y tres bloques tanto en encoder como en decoder. La variante "soluble" se entrena específicamente sobre proteínas solubles, a diferencia de la variante de backbone completo.

El entrenamiento se basa en la recuperación autorregresiva de identidades de aminoácidos a partir de la geometría del backbone, con perturbaciones de coordenadas para aumentar la robustez. Esta variante concreta emplea un ruido de entrenamiento de 0,30 Å, el nivel más alto de la familia, lo que la hace más tolerante a imprecisiones estructurales en la entrada. Los datos de entrenamiento del ejemplo oficial proceden de ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. No se especifica en la información disponible el número exacto de tokens ni la composición detallada del dataset para esta variante.

## Capacidades

- Diseño de secuencias de proteínas condicionado a un backbone fijo (inverse folding).
- Generación autorregresiva con orden causal muestreado.
- Soporte de posiciones fijas durante el diseño.
- Soporte de identidades ligadas (tied identities).
- Restricciones de aminoácidos específicas por posición.
- Uso de perfiles de secuencia como condicionamiento.
- Scoring de secuencias: cálculo de verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Integración con pipeline de diseño y empaquetado de cadenas laterales (MPNN Packer) para generar coordenadas de side-chain tras el diseño.
- Ejecución por etapas mediante `prepare`, `forward` y `postprocess`.

## Casos de uso

- Diseño de proteínas solubles de novo: el modelo genera secuencias compatibles con un backbone dado, sesgado hacia proteínas solubles, lo que resulta adecuado para candidatos terapéuticos que requieren alta solubilidad en disolución.
- Rediseño de superficies proteicas: permite fijar el núcleo hidrofóbico y rediseñar posiciones superficiales para mejorar solubilidad o reducir agregación, usando posiciones fijas y restricciones por posición.
- Scoring de variantes en pipelines de cribado: el cálculo de NLL por residuo permite clasificar secuencias candidatas generadas por otros métodos y descartar las incompatibles con el backbone.
- Diseño con restricciones funcionales: el soporte de identidades ligadas y perfiles de secuencia permite conservar motivos catalíticos o sitios de unión mientras se optimiza el resto de la secuencia.
- Integración en flujos de diseño y empaquetado: combinado con el MPNN Packer, genera coordenadas de cadenas laterales tras el diseño, útil para preparar estructuras completas para simulación o análisis.
- Evaluación de modelos de predicción estructural: al puntuar secuencias contra backbones predichos (por ejemplo, de AlphaFold), sirve para validar la plausibilidad de estructuras generadas.
- Diseño tolerante a ruido estructural: gracias al entrenamiento con 0,30 Å de ruido, es adecuado para trabajar con backbones experimentales o predichos con imprecisiones moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en precisión completa (1,674 M de parámetros); el consumo real vendrá dominado por el grafo de residuos y el tamaño del backbone de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2-4 GB de VRAM, e incluso podría ejecutarse en CPU para backbones pequeños.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del número de residuos del backbone y del número de órdenes de decodificación muestreados.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolubleMPNN-noise030 (este) | 1,674 M | N, CA, C, O | 0,30 Å | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN-noise030 | 1,674 M | N, CA, C, O | 0,30 Å | AGPL-3.0 | HuggingFace (oteam) |
| SolubleMPNN-noise002 | 1,674 M | N, CA, C, O | 0,02 Å | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN-ca-only | 1,642 M | CA | 0,02-0,20 Å | AGPL-3.0 | HuggingFace (oteam) |

La diferencia principal frente a ProteinMPNN-noise030 es el sesgo hacia proteínas solubles en el entrenamiento; frente a SolubleMPNN-noise002, el mayor nivel de ruido (0,30 Å frente a 0,02 Å) aporta robustez a imprecisiones estructurales; frente a la variante CA-only, emplea el backbone completo (N, CA, C, O) en lugar de solo el carbono alfa.

## Limitaciones y advertencias

- Es una implementación no oficial: el equipo original de ProteinMPNN no escribió esta model card ni validó necesariamente esta variante.
- El modelo está especializado en proteínas solubles; su rendimiento en proteínas de membrana o ambientes no solubles puede ser inferior al de la variante de backbone completo.
- El ruido de entrenamiento de 0,30 Å, aunque aporta robustez, puede reducir la precisión en backbones de alta resolución respecto a variantes con menor ruido.
- Riesgo de secuencias no plegables o no funcionales: el diseño inverse folding no garantiza que la secuencia generada adopte la estructura diana in vivo.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en productos propietarios requiere revisión legal cuidadosa.
- Dependencia de la librería `ofoldx` para su uso; no hay soporte documentado para otros frameworks de inferencia.
- No se dispone de información sobre sesgos, composición detallada del dataset ni evaluación de sesgos de composición de aminoácidos.
- Sin datos publicados de benchmarks en la información disponible, por lo que no es posible comparar su rendimiento cuantitativo con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/solublempnn-noise030
- Variante ProteinMPNN completa: https://huggingface.co/oteam/proteinmpnn
- Variante SolubleMPNN base: https://huggingface.co/oteam/solublempnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- Código OFoldX (proteinmpnn): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación OFoldX: https://ofoldx.valtech.ai/
