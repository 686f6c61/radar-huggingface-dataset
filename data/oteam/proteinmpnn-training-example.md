# oteam/proteinmpnn-training-example

## Resumen

ProteinMPNN es un modelo de diseño inverso de plegamiento proteico (inverse folding) que genera secuencias de aminoácidos para una estructura de esqueleto proteico fija. Lo desarrollaron originalmente Justas Dauparas, David Baker y colaboradores, y esta ficha corresponde a una implementación no oficial del equipo OFoldX, publicada en HuggingFace bajo el identificador `oteam/proteinmpnn-training-example`. El checkpoint concreto es el resultado del ejemplo oficial de entrenamiento, con 1.673.592 parámetros reales según los pesos en safetensors.

El modelo representa cada residuo como un nodo en un grafo espacial de vecinos más cercanos, codifica la geometría del esqueleto mediante bloques de paso de mensajes (message passing) y decodifica las identidades de los residuos en un orden causal muestreado. Resuelve el problema inverso al plegamiento: dada una estructura tridimensional, propone secuencias que probablemente la adopten. Es relevante para pipelines de diseño de proteínas, ingeniería de enzimas y generación de candidatos terapéuticos.

Se trata de un modelo pequeño y especializado, no de un LLM: no procesa texto ni lenguaje natural, sino coordenadas atómicas. Su utilidad práctica depende de la librería `ofoldx` y de estructuras de entrada en formato CIF/PDB. La variante estándar usa los átomos N, CA, C y O del esqueleto, con tamaño oculto de 128, 3 bloques de encoder y 3 de decoder, y 48 vecinos por nodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes autorregresiva sobre grafo espacial de residuos (encoder-decoder) |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el grafo abarca la estructura completa de la proteína) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Biblioteca | ofoldx |
| Pipeline | other (diseño y scoring de secuencias proteicas) |

## Arquitectura y entrenamiento

ProteinMPNN es una red de paso de mensajes con estructura encoder-decoder. El encoder procesa el grafo de residuos vecinos (48 vecinos por nodo) y extrae representaciones de la geometría del esqueleto; el decoder genera la secuencia de aminoácidos de forma autorregresiva en un orden causal muestreado, condicionada por las representaciones del encoder. La variante estándar emplea los átomos N, CA, C y O; existe una variante CA-only con 1,642 M parámetros que usa únicamente el carbono alfa.

El entrenamiento se basa en recuperación autorregresiva de identidades de aminoácidos a partir de la geometría del esqueleto, con perturbaciones de coordenadas para aumentar la robustez. Según la model card, el ejemplo oficial de entrenamiento usa ensamblados biológicos del PDB del 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. Existen variantes con ruido de entrenamiento de 0,02, 0,10, 0,20 y 0,30 Å. La variante SolubleMPNN se centra en proteínas solubles. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si hubo RLHF o DPO (no aplica en este dominio).

## Capacidades

- Diseño de secuencias proteicas condicionado a un esqueleto fijo (inverse folding).
- Puntuación de secuencias: calcula log-verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Generación con posiciones fijas, identidades ligadas (tied identities) y restricciones de aminoácidos por posición.
- Soporte de perfiles de secuencia (sequence profiles) como condicionamiento.
- Decodificación en orden causal muestreado, con control de semilla y número de órdenes de decodificación.
- Integración con un empaquetador de cadenas laterales (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo específico de biología estructural.

## Casos de uso

- Diseño de enzimas: dada la estructura cristalográfica de un sitio activo, generar secuencias candidatas que mantengan el plegamiento y permitan explorar variantes de especificidad o estabilidad.
- Ingeniería de proteínas terapéuticas: rediseñar secuencias sobre un esqueleto conocido para reducir inmunogenicidad o mejorar solubilidad, usando la variante SolubleMPNN.
- Puntuación de variantes: calcular la NLL de secuencias mutantes sobre una estructura fija para priorizar mutaciones que no rompan el plegamiento.
- Rediseño de interfaces proteína-proteína: fijar posiciones de la interfaz y rediseñar el resto de la cadena con restricciones posicionales.
- Generación de bibliotecas de secuencias para cribado experimental: producir múltiples candidatos por esqueleto y filtrar por score antes de síntesis.
- Pipeline de diseño y empaquetado: combinar el diseño de secuencia con el MPNN Packer para obtener estructuras con cadenas laterales y validar la compatibilidad estérica.
- Análisis de tolerancia a mutaciones: usar perfiles de secuencia y restricciones por posición para estudiar qué residuos admiten sustituciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,674 M parámetros, los pesos ocupan aproximadamente 3,3 MB en fp16 y 6,7 MB en fp32. El consumo dominante es el grafo de vecinos y las estructuras de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100 y RTX 4090 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU para estructuras de tamaño moderado.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) con pipelines `design` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProteinMPNN (esta ficha, training example) | 1,674 M | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN estándar (oteam/proteinmpnn) | 1,674 M | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| SolubleMPNN (oteam/solublempnn) | 1,674 M | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN CA-only (oteam/proteinmpnn-ca-only) | 1,642 M | Solo CA | AGPL-3.0 | HuggingFace (oteam) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la firma el equipo OFoldX, no los autores originales de ProteinMPNN.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden afectar al uso comercial y a la distribución de servicios derivados; revisar antes de producción.
- Modelo especializado en biología estructural: no procesa texto, no tiene capacidades de razonamiento general ni multilingües.
- Dependencia de la librería `ofoldx` y de estructuras de entrada en CIF/PDB; no hay pesos en GGUF ni soporte en herramientas de inferencia estándar de LLM.
- El checkpoint corresponde al ejemplo oficial de entrenamiento, no a un modelo afinado para producción; puede no igualar el rendimiento de las variantes publicadas completas.
- Riesgo de secuencias no plegables o inestables: el diseño inverso no garantiza que la secuencia generada adopte la estructura objetivo in vivo; requiere validación experimental.
- Sesgos derivados del PDB: la distribución de entrenamiento (ensamblados biológicos de 2021, clustering al 30 %) puede infrarepresentar familias proteicas poco presentes en la base de datos.
- No se documentan límites de tamaño de estructura ni comportamiento en proteínas muy grandes o con esqueletos incompletos.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/proteinmpnn-training-example
- Variante estándar: https://huggingface.co/oteam/proteinmpnn
- Variante SolubleMPNN: https://huggingface.co/oteam/solublempnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Paper: https://doi.org/10.1126/science.add2187
- Repositorio oficial: https://github.com/dauparas/ProteinMPNN
- Ejemplo de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Sitio de la librería: https://ofoldx.valtech.ai/
