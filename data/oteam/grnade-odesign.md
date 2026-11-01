# oteam/grnade-odesign

## Resumen

gRNAde es un modelo de aprendizaje profundo geométrico diseñado para el problema del *inverse folding* de ARN: dada una estructura tridimensional de ARN (o varias conformaciones alineadas de la misma molécula), predecir una secuencia de nucleótidos que sea compatible con dicha estructura. El modelo fue desarrollado originalmente por Chaitanya K. Joshi, Arian R. Jamasb, Ramon Viñas, Charles Harris, Simon V. Mathis, Alex Morehead, Rishabh Anand y Pietro Liò, y publicado en ICLR 2025 (arXiv:2305.14749).

La versión alojada en `oteam/grnade-odesign` es una implementación no oficial distribuida por el equipo OFoldX dentro de su librería `ofoldx`. Se trata del checkpoint v1 de gRNAde con la variante ODesign, orientada al diseño de secuencias de ARN con restricciones funcionales. El modelo combina un codificador de perceptrón vectorial geométrico (GVP) con un decodificador autorregresivo de nucleótidos, y es capaz de condicionar el diseño sobre una o varias conformaciones alineadas de la misma estructura.

Con 2.157.118 parámetros totales (aproximadamente 2,16 M), es un modelo muy compacto en comparación con los LLM habituales, lo que refleja su naturaleza especializada: no procesa texto, sino grafos moleculares con geometría 3D. Su relevancia actual radica en el creciente interés por el diseño computacional de ARN terapéutico, aptámeros y ribozimas, donde los métodos de *inverse folding* permiten generar candidatos de secuencia para estructuras dadas de forma rápida y computacionalmente asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) multi-conformación + decodificador autorregresivo de nucleótidos |
| Parametros totales | 2.157.118 (aprox. 2,16 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del tamaño del grafo de la estructura de ARN de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gRNAde emplea un codificador basado en *geometric-vector perceptrons* (GVP) que procesa grafos de ARN con información geométrica 3D. La variante v1 del grafo incorpora el orden de secuencia, los pares de bases explícitos de la estructura secundaria y, opcionalmente, la geometría de los átomos P, C4' y de los nitrógenos de las bases. La variante v0.3.2, en cambio, utiliza únicamente geometría espacial sin canales de secuencia ni de pares de bases. El modelo consta de 4 bloques de codificador y 4 bloques de decodificador, con tamaños de nodo de 128 escalares / 16 vectoriales y de arista de 64 escalares / 4 vectoriales, y 132 canales de arista de entrada en v1 (131 en v0.3.2).

El decodificador es autorregresivo y genera la secuencia de nucleótidos de forma secuencial condicionada por el contexto estructural codificado. El entrenamiento se realizó sobre el dataset RNASolo de los autores, que contiene estructuras de ARN del Protein Data Bank con resolución de 4 Å o mejor y fecha de corte del 31 de octubre de 2023. El objetivo es la recuperación de identidades de nucleótidos a partir del contexto estructural, con un valor de *label smoothing* de 0,05. La innovación principal es la capacidad de condicionar el diseño sobre múltiples conformaciones alineadas de la misma molécula, lo que permite diseñar secuencias robustas a cambios conformacionales.

## Capacidades

- Diseño de secuencias de ARN (*inverse folding*) a partir de una estructura 3D de backbone.
- Condicionamiento sobre estructura secundaria explícita mediante notación dot-bracket.
- Diseño multi-conformación: una misma secuencia condicionada sobre varias conformaciones alineadas de la misma molécula de ARN.
- Generación de múltiples candidatos de secuencia con control de temperatura de muestreo.
- Puntuación de candidatos generados (scores por secuencia).
- Manejo de estructuras con múltiples instancias de ARN mediante `instance_id`.
- Procesamiento de ficheros de estructura en formato mmCIF.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo lingüístico.

## Casos de uso

- Diseño de aptámeros de ARN: dado el backbone 3D de un aptámero unido a su diana, gRNAde genera secuencias candidatas compatibles con esa geometría, acelerando el cribado frente a métodos experimentales de selección.
- Diseño de ribozimas y ARN catalítico: el condicionamiento sobre estructura secundaria y terciaria permite proponer secuencias que preserven el sitio activo y los motivos catalíticos identificados en la estructura.
- Estabilización conformacional de ARN terapéutico: el modo multi-conformación permite diseñar secuencias que mantengan la estructura en estados abierto y cerrado simultáneamente, útil para ARN que sufren cambios conformacionales funcionales.
- Rediseño de ARN para mejorar su plegamiento: partiendo de una estructura resuelta experimentalmente, se generan variantes de secuencia que conservan el pliegue pero modifican propiedades como estabilidad o inmunogenicidad.
- Generación de candidatos para pipelines de diseño generativo: el modelo puede integrarse como primer paso en flujos que combinen inverse folding con filtros de energía libre (p. ej. con herramientas de predicción de estructura secundaria) y evaluación in silico.
- Investigación en biología estructural: análisis de qué secuencias son compatibles con un pliegue dado, estudio de la degeneración secuencia-estructura en familias de ARN y validación de modelos de plegamiento.
- Diseño de ARN para sensores y nanomateriales: generación de secuencias con geometrías controladas para aplicaciones en nanotecnología de ARN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, inferior a 1 GB, dado que el modelo tiene solo ~2,16 M de parámetros. El cuello de botella real es la memoria para procesar el grafo de la estructura (tamaño de la molécula de ARN), no el modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en CPU con latencias razonables para moléculas de tamaño moderado.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: la librería `ofoldx` (instalable vía `pip install ofoldx`) es la vía oficial de esta implementación. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| gRNAde (esta ficha, checkpoint ODesign v1) | ~2,16 M | Inverse folding de ARN con GVP multi-conformación | AGPL-3.0 | HuggingFace (oteam/grnade-odesign) |
| gRNAde v0.3.2 (variantes 1, 2, 3 y 5 estados) | ~2,16 M | Inverse folding con grafos espaciales sin canales de secuencia/pares de bases | AGPL-3.0 | HuggingFace (varias variantes del mismo autor) |
| gRNAde original (repositorio oficial) | ~2,16 M | Implementación de referencia del paper | No disponible en la información | GitHub (chaitjo/geometric-rna-design) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que no es posible establecer diferencias de rendimiento cuantitativas.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que el equipo original de gRNAde no escribió esta model card ni distribuye este checkpoint; la implementación corre a cargo de OFoldX.
- Licencia AGPL-3.0: es una licencia copyleft fuerte que impone obligaciones de liberación de código fuente para obras derivadas distribuidas o usadas en red; puede ser restrictiva para uso comercial propietario.
- Dependencia de la librería `ofoldx`: los pesos no son utilizables directamente con frameworks estándar como PyTorch o Transformers sin la librería específica.
- Requiere estructura 3D de entrada: el modelo no genera estructuras, solo secuencias; la calidad del diseño depende de la calidad de la estructura de backbone proporcionada.
- En el modo multi-conformación, las conformaciones deben contener la misma secuencia de ARN y estar alineadas; la primera se usa como diana de diseño.
- Riesgo de alucinación estructural: como todo modelo de inverse folding, puede generar secuencias que no plieguen correctamente in vitro; se recomienda validación experimental o con predictores de estructura secundaria/terciaria.
- Sesgos de los datos de entrenamiento: el dataset RNASolo se limita a estructuras del PDB con resolución de 4 Å o mejor y corte de octubre de 2023, lo que puede infrarepresentar familias de ARN poco caracterizadas estructuralmente.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- Idiomas soportados: no aplica; no se documentan capacidades multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/grnade-odesign
- Checkpoint v1 principal: https://huggingface.co/oteam/grnade
- Variantes v0.3.2: https://huggingface.co/oteam/grnade-v0.3.2-1state-all, https://huggingface.co/oteam/grnade-v0.3.2-1state-das, https://huggingface.co/oteam/grnade-v0.3.2-1state-multi, https://huggingface.co/oteam/grnade-v0.3.2-2state-all, https://huggingface.co/oteam/grnade-v0.3.2-3state-all, https://huggingface.co/oteam/grnade-v0.3.2-3state-das, https://huggingface.co/oteam/grnade-v0.3.2-3state-multi, https://huggingface.co/oteam/grnade-v0.3.2-5state-all, https://huggingface.co/oteam/grnade-v0.3.2-5state-das, https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Repositorio oficial de gRNAde: https://github.com/chaitjo/geometric-rna-design
- Paper (ICLR 2025): https://arxiv.org/abs/2305.14749
- Preprint bioRxiv: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Dataset RNASolo: https://huggingface.co/datasets/chaitjo/gRNAde_datasets
- Documentación de OFoldX: https://ofoldx.valtech.ai/
