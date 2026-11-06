# oteam/grnade-v0.3.2-3state-multi

## Resumen

gRNAde es un modelo de diseño inverso de ARN (RNA inverse folding) que predice la secuencia de nucleótidos compatible con una o varias conformaciones 3D de la columna vertebral del ARN. La implementación original procede de Chaitanya K. Joshi y colaboradores (paper arXiv:2305.14749), y esta ficha corresponde a la variante `oteam/grnade-v0.3.2-3state-multi`, un checkpoint no oficial publicado por el equipo OFoldX dentro de su librería `ofoldx`. No es un modelo de lenguaje: es un modelo geométrico de aprendizaje profundo orientado a biología estructural computacional.

Técnicamente se compone de un codificador GVP (Geometric Vector Perceptron) de 4 bloques y un decodificador autorregresivo de nucleótidos de 4 bloques, con 2,157 millones de parámetros totales (2,157 M). La variante `3state` está entrenada para condicionar el diseño sobre tres conformaciones alineadas de la misma molécula de ARN, y el sufijo `multi` indica la configuración de entrenamiento multiconformacional del release v0.3.2.

Es relevante porque aborda un problema central en biología sintética y terapéutica: dado un pliegue 3D de ARN, generar secuencias que lo estabilicen. La incorporación de múltiples estados conformacionales permite diseñar secuencias robustas frente a la plasticidad estructural del ARN, algo que los modelos de una sola conformación no capturan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (Geometric Vector Perceptron) de 4 bloques + decodificador autorregresivo de nucleótidos de 4 bloques |
| Parametros totales | 2.157.052 (2,157 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del número de nodos del grafo de ARN de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other (diseño de secuencias de ARN) |
| Estados conformacionales | 3 |
| Tamano de nodo (escalar/vector) | 128 / 16 |
| Tamano de arista (escalar/vector) | 64 / 4 |
| Canales de arista de entrada | 131 |
| Suavizado de etiquetas | 0.05 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura gRNAde original: un codificador geométrico basado en GVP que procesa un grafo de ARN donde los nodos son nucleótidos y las aristas codifican relaciones espaciales. La variante v0.3.2 utiliza un grafo puramente espacial, sin canales de secuencia ni de pares de bases, a diferencia de la v1 que incorpora orden secuencial, pares de bases de estructura secundaria explícitos y geometría opcional de P, C4' y nitrógenos de base. El decodificador es autorregresivo y genera la secuencia de nucleótidos condicionada por las representaciones del codificador.

El entrenamiento se plantea como recuperación autorregresiva de identidades de nucleótidos a partir del contexto estructural, con un valor de suavizado de etiquetas de 0.05. La variante `3state-multi` está configurada para tres conformaciones alineadas: la primera actúa como objetivo de diseño y las posteriores aportan contexto estructural. La model card no detalla el corpus de entrenamiento ni el número de tokens o estructuras utilizadas, remitiendo a los papers de gRNAde para la construcción de los conjuntos de datos. No se documenta RLHF ni DPO, al no ser un modelo generativo de lenguaje.

## Capacidades

- Diseño inverso de secuencias de ARN a partir de una o varias conformaciones 3D de la columna vertebral.
- Condicionamiento multiconformacional: integra tres estados conformacionales alineados de la misma molécula para producir secuencias robustas a la plasticidad estructural.
- Generación de múltiples candidatos de secuencia con control de temperatura de muestreo (`num_candidates`, `temperature`).
- Puntuación de las secuencias generadas (cada candidato incluye target molecular, registro de diseño y puntuaciones).
- Procesamiento de estructuras en formato mmCIF mediante `ofoldx.io.read_structure`.
- Soporte de estructuras con múltiples instancias de ARN mediante `instance_id`.
- Ejecución por etapas con `prepare`, `forward` y `postprocess` en el pipeline de ofoldx.
- Entrenamiento y ajuste fino mediante `forward` con teacher forcing diferenciable y `GrnadeLoss`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo específico de biología estructural.

## Casos de uso

- Diseño de aptámeros de ARN: dada la estructura 3D de un aptámero unido a su ligando, el modelo genera secuencias candidatas que preservan el pliegue de unión; el condicionamiento a tres estados permite mantener la afinidad frente a variaciones conformacionales.
- Ingeniería de riboswitches: se pueden introducir las conformaciones abierta y cerrada (más un tercer estado) para diseñar secuencias que conserven la conmutación conformacional, algo que un modelo de una sola conformación no garantiza.
- Estabilización de ARN terapéuticos: para una estructura diana de ARNm o ARN no codificante, el modelo propone secuencias alternativas con el mismo pliegue, útiles para optimizar estabilidad sin alterar la función.
- Diseño de ARN guía en edición génica: a partir del pliegue del complejo guía-proteína, se generan candidatos de secuencia que mantienen la geometría necesaria para el reconocimiento.
- Rediseño de motivos estructurales en ARN sintético: sustitución de secuencias conservadas por alternativas compatibles con el pliegue, explorando el espacio de secuencias con `num_candidates` y `temperature`.
- Ajuste fino para dianas específicas: usando `GrnadeLoss` y el `forward` diferenciable, un grupo puede reentrenar el checkpoint sobre un conjunto propio de estructuras multiconformacionales.
- Filtrado computacional previo a síntesis: generación de bibliotecas de candidatos puntuados que reducen el número de secuencias a sintetizar y validar experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2,157 M de parámetros y pesos en safetensors, la huella en FP32 ronda los 8,6 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, aunque el cuello de botella real es el procesamiento del grafo geométrico y el número de candidatos generados.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía oficial documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Estados conformacionales | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grnade-v0.3.2-3state-multi (esta ficha) | 2,157 M | 3 | Espacial (sin secuencia ni pares de bases) | AGPL-3.0 | Hugging Face (oteam) |
| grnade-v0.3.2-1state-all | 2,157 M | 1 | Espacial | AGPL-3.0 | Hugging Face (oteam) |
| grnade-v0.3.2-5state-multi | 2,157 M | 5 | Espacial | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v1 | 2,157 M | 1 (más checkpoint ODesign) | Secuencia + pares de bases + espacial | AGPL-3.0 | Hugging Face (oteam) |

Las variantes comparten arquitectura y número de parámetros; difieren en el número de conformaciones de entrenamiento y en el tipo de grafo. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que el equipo original de gRNAde no escribió esta ficha ni necesariamente respalda este checkpoint.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código derivado y puede ser incompatible con despliegues comerciales cerrados; revisar antes de uso en producción.
- Modelo de investigación biológica: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP ni usarse para tareas textuales.
- Dependencia de la calidad estructural: el diseño depende de la precisión de las conformaciones de entrada; estructuras experimentales ruidosas o modelos predictivos imprecisos degradan los resultados.
- Requisito de alineamiento: las conformaciones múltiples deben contener la misma secuencia de ARN y estar alineadas; no se documenta el comportamiento ante desalineamientos.
- Sin datos de benchmarks publicados en esta ficha: no es posible cuantificar la calidad del diseño frente a alternativas.
- Riesgo de secuencias no funcionales: como todo método de diseño inverso, los candidatos requieren validación experimental; el modelo no garantiza plegamiento ni función in vivo.
- Sesgos de los datos de entrenamiento: la model card no detalla la composición del corpus, por lo que se desconoce la cobertura taxonómica y estructural.
- Idiomas: no aplica; cualquier mención a soporte multilingüe es irrelevante para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1 estado (all): https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante 1 estado (das): https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante 1 estado (multi): https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante 2 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante 3 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 3 estados (das): https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante 5 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante 5 estados (das): https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Variante 5 estados (multi): https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Codigo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guia del pipeline: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper original: https://arxiv.org/abs/2305.14749
- Paper de diseño generativo: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
- Documentacion de ofoldx: https://ofoldx.valtech.ai/
