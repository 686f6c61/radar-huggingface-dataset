# oteam/ligandmpnn

## Resumen

LigandMPNN es un modelo de diseño inverso de plegamiento proteico (inverse folding) que genera secuencias de aminoácidos condicionadas no solo por la geometría de la cadena principal de la proteína, sino también por el contexto atómico no proteico presente en el entorno: ligandos, ácidos nucleicos, iones metálicos y otras moléculas. El modelo ha sido desarrollado originalmente por Justas Dauparas, Gyu Rie Lee y colaboradores del laboratorio de David Baker, y esta ficha corresponde a una implementación no oficial distribuida por el equipo OFoldX bajo el identificador `oteam/ligandmpnn`.

La relevancia del modelo reside en su capacidad para diseñar secuencias en interfaces de unión, donde el entorno químico local determina qué residuos son compatibles con la geometría del ligando. A diferencia de los modelos clásicos de inverse folding que solo consideran el esqueleto proteico, LigandMPNN incorpora hasta 25 átomos de contexto por residuo, lo que permite generar secuencias coherentes en sitios activos y regiones de contacto proteína-ligando.

Arquitectura de tipo red neuronal de paso de mensajes (message-passing neural network) autoregresiva, con un tamaño muy reducido de 2,63 millones de parámetros, lo que la hace extremadamente ligera en comparación con los modelos de lenguaje convencionales. Está pensada para ejecutarse sobre estructuras experimentales en formato mmCIF o PDB y se integra en el ecosistema de la librería `ofoldx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (message-passing) autoregresiva para diseño de secuencias proteicas con contexto atómico |
| Parametros totales | 2.631.800 (2,632 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del número de residuos y vecinos; 32 vecinos por residuo, 25 átomos de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LigandMPNN es una red de paso de mensajes con codificador, bloques de contexto atómico, bloques de contexto y decodificador. La configuración distribuida en este repositorio tiene un tamaño oculto de 128, 3 bloques de codificador, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decodificador, con 32 vecinos por residuo y 25 átomos de contexto. El modelo es autoregresivo: genera la secuencia residuo a residuo condicionada por la geometría del esqueleto y por los átomos no proteicos cercanos.

El entrenamiento se realizó sobre ensamblados proteicos del PDB disponibles hasta el 16 de diciembre de 2022, incluyendo estructuras con ligandos, ácidos nucleicos y metales. Las secuencias se agruparon al 30 % de identidad para evitar redundancia. El procedimiento de entrenamiento emplea recuperación de secuencia autoregresiva con perturbaciones de coordenadas para mejorar la robustez frente a ruido estructural. Existen variantes con distintos niveles de ruido de coordenadas en entrenamiento (0,05 Å, 0,10 Å, 0,20 Å y 0,30 Å), siendo la de 0,10 Å la que corresponde a este repositorio.

## Capacidades

- Diseño de secuencias proteicas condicionadas por esqueleto y contexto atómico no proteico (ligandos, ácidos nucleicos, metales).
- Puntuación (scoring) de secuencias existentes mediante NLL en nats por residuo, con soporte para múltiples órdenes de decodificación (`num_decoding_orders`).
- Generación de múltiples candidatos de secuencia por estructura de entrada.
- Integración con un pipeline de diseño y empaquetado (`LigandMpnnDesignAndPackPipeline`) para generar coordenadas de cadenas laterales tras el diseño.
- Modelado de interfaces proteína-ligando y sitios de unión.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo específico de biología estructural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Diseño de enzimas: dado el esqueleto de una proteína con un ligando o cofactor unido, LigandMPNN genera secuencias compatibles con el entorno químico del sitio activo, lo que permite proponer variantes con actividad catalítica preservada.
- Rediseño de sitios de unión a fármacos: a partir de una estructura cristalográfica con un ligando, el modelo propone secuencias que mantienen las interacciones clave en el bolsillo de unión, útil en ingeniería de proteínas terapéuticas.
- Ingeniería de anticuerpos y proteínas de unión: el contexto atómico permite condicionar el diseño de regiones de interfaz frente a epítopos peptídicos o pequeños ligandos.
- Puntuación de variantes en pipelines de cribado: el modo scoring calcula NLL por residuo, lo que permite priorizar mutaciones o secuencias candidatas en flujos de diseño computacional.
- Diseño de proteínas con cofactores metálicos: al incorporar iones metálicos como contexto atómico, el modelo puede generar secuencias compatibles con sitios de coordinación de metales.
- Análisis de interfaces proteína-ácido nucleico: útil para diseñar variantes de proteínas de unión a ADN o ARN manteniendo la geometría del esqueleto.
- Integración en flujos de diseño y empaquetado: combinado con el packer de OFoldX, permite pasar de secuencia a estructura tridimensional con cadenas laterales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el modelo en precisión completa, dado su tamaño de 2,63 M de parámetros (aproximadamente 10 MB en fp32). El consumo real vendrá dominado por el preprocesado de la estructura y las operaciones de paso de mensajes sobre grafos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en CPU para estructuras pequeñas.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en CPU.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) mediante los pipelines `design` y `score`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto atómico | Licencia | Disponibilidad |
|---|---|---|---|---|
| LigandMPNN (este repo) | 2,63 M | Sí (25 átomos de contexto) | AGPL-3.0 | HuggingFace (oteam/ligandmpnn) |
| ProteinMPNN | no disponible en esta ficha | No (solo esqueleto proteico) | no disponible | Repositorio oficial de Dauparas |
| LigandMPNN oficial | no disponible en esta ficha | Sí | no disponible | GitHub dauparas/LigandMPNN |

La comparación cuantitativa con ProteinMPNN y con la implementación oficial de LigandMPNN no está disponible en la información proporcionada. La diferencia principal de este repositorio frente a ProteinMPNN es la incorporación de contexto atómico no proteico, y frente a la implementación oficial es que se trata de una reimplementación no oficial integrada en OFoldX.

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de LigandMPNN no ha escrito esta model card ni validado necesariamente esta implementación. Para producción conviene contrastar con el repositorio oficial `dauparas/LigandMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado. Revisar la FAQ de licencia del proyecto antes de desplegar.
- Dependencia de la librería `ofoldx`: los pesos no son directamente utilizables sin dicha librería, lo que limita la portabilidad.
- Sin benchmarks publicados en esta ficha: no se dispone de métricas de recuperación de secuencia ni comparativas cuantitativas con la implementación oficial.
- Riesgo de sobreajuste al PDB hasta diciembre de 2022: estructuras posteriores o ligandos no representados pueden degradar la calidad del diseño.
- Modelo biológico, no lingüístico: no soporta idiomas, tool calling ni agentes; no debe evaluarse con métricas de NLP.
- Sin datos de sesgo, alucinación o robustez más allá del ruido de coordenadas de entrenamiento documentado.
- Las variantes con distinto ruido de coordenadas pueden producir resultados diferentes; elegir la variante adecuada según la calidad estructural de la entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/ligandmpnn
- Variante noise005: https://huggingface.co/oteam/ligandmpnn-noise005
- Variante noise010: https://huggingface.co/oteam/ligandmpnn-noise010
- Variante noise020: https://huggingface.co/oteam/ligandmpnn-noise020
- Variante noise030: https://huggingface.co/oteam/ligandmpnn-noise030
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/ligandmpnn
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Paper (Nature Methods): https://doi.org/10.1038/s41592-025-02626-1
- Documentación de OFoldX: https://ofoldx.valtech.ai/
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/pipelines
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Licencia AGPL-3.0: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
- PDB: https://www.rcsb.org/
