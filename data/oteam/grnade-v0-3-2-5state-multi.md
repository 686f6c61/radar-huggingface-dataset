# oteam/grnade-v0.3.2-5state-multi

## Resumen

gRNAde es un modelo de aprendizaje profundo geométrico diseñado para el diseño inverso de secuencias de ARN a partir de una o varias conformaciones 3D de la columna vertebral (backbone). Desarrollado originalmente por Chaitanya K. Joshi y colaboradores (Universidad de Cambridge), esta variante concreta es una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/grnade-v0.3.2-5state-multi`. El modelo resuelve el problema inverso al plegamiento: dado un esqueleto estructural de ARN, predice la secuencia de nucleótidos que lo estabiliza.

La arquitectura combina un codificador de perceptrón vectorial geométrico (GVP) con un decodificador autorregresivo de nucleótidos. La variante v0.3.2 emplea un grafo basado únicamente en geometría espacial, sin canales de secuencia ni de pares de bases, y está configurada para condicionar el diseño sobre cinco estados conformacionales alineados. Con 2,157 millones de parámetros, es un modelo compacto orientado a una tarea científica muy específica, no a generación de lenguaje general.

Su relevancia radica en la creciente demanda de herramientas de diseño de ARN para terapias (ARNm, aptámeros, ribozimas) y biología sintética, donde la capacidad de diseñar secuencias que adopten múltiples conformaciones funcionales es un problema abierto. Esta ficha documenta la variante de cinco estados y múltiples conformaciones, una de las configuraciones más exigentes de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) de 4 bloques + decodificador autorregresivo de 4 bloques |
| Parámetros totales | 2.157.052 (2,157 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionado por el tamaño de la cadena de ARN de entrada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura gRNAde original: un codificador de grafo con perceptrones vectoriales geométricos (GVP) que procesa la estructura 3D del ARN y un decodificador autorregresivo que genera la secuencia nucleótido a nucleótido. Los hiperparámetros declarados son 4 bloques de codificador y 4 de decodificador, con tamaños escalares/vectoriales de nodo 128/16 y de arista 64/4. La diferencia clave de la variante v0.3.2 es que su grafo utiliza 131 canales de arista de entrada basados solo en geometría espacial, prescindiendo de los canales de secuencia y de pares de bases que sí usa v1 (132 canales). El modelo está configurado para condicionar el diseño sobre cinco conformaciones alineadas de la misma secuencia de ARN.

El entrenamiento consiste en la recuperación autorregresiva de identidades de nucleótidos a partir del contexto estructural, con un valor de label smoothing de 0,05. La model card remite a los artículos originales para la composición del corpus y la construcción de ejemplos mono y multi-conformación, y no detalla el número de tokens ni el proceso de RLHF/DPO (no aplicable en este dominio). La innovación técnica principal es la agregación de múltiples estados conformacionales en el codificador geométrico, que permite diseñar secuencias compatibles con varios estados funcionales del ARN. La librería `ofoldx` expone un `forward` diferenciable con teacher forcing y una `GrnadeLoss` para ajuste fino.

## Capacidades

- Diseño inverso de ARN: predice secuencias de nucleótidos a partir de una o varias conformaciones del backbone 3D.
- Condicionamiento multi-conformación: integra hasta cinco estados alineados de la misma secuencia de ARN en una única predicción.
- Procesamiento de estructura secundaria: acepta notación dot-bracket para restringir el diseño.
- Generación de múltiples candidatos por estructura con control de temperatura (`num_candidates`, `temperature`).
- Puntuación de secuencias candidatas (scores por candidato).
- Soporte de estructuras en formato mmCIF mediante `read_structure`, con selección de instancia (`instance_id`) en estructuras con varias cadenas de ARN.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) en el pipeline de `ofoldx`.
- Entrenamiento y ajuste fino mediante `forward` diferenciable y `GrnadeLoss`.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un modelo de dominio biológico específico.

## Casos de uso

- Diseño de ARN terapéutico multiestado: diseñar secuencias de ARNm o elementos reguladores que adopten conformaciones abierta y cerrada funcionales, usando el condicionamiento de cinco estados para garantizar compatibilidad conformacional.
- Optimización de aptámeros: generar candidatos de secuencia para un esqueleto de aptámero concreto y puntuarlos, filtrando por temperatura baja para mayor conservadurismo.
- Diseño de ribozimas y riboswitches: condicionar sobre conformaciones activa e inactiva para obtener secuencias que mantengan el cambio conformacional funcional.
- Ingeniería de ARN para biología sintética: rediseñar secuencias de estructuras cristalográficas conocidas preservando el pliegue, como paso previo a la síntesis y validación experimental.
- Ajuste fino con datos propios: reentrenar el modelo con `GrnadeLoss` sobre un corpus de estructuras de un organismo o familia concreta para adaptar el diseño a un dominio específico.
- Generación de bibliotecas de candidatos: producir múltiples secuencias por estructura con `num_candidates` para cribado computacional antes de validación in vitro.
- Integración en pipelines estructurales: usar la ejecución por etapas de `ofoldx` para encadenar predicción de estructura y diseño inverso en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2,157 M de parámetros, la huella de pesos en fp32 ronda los 8,6 MB, por lo que cabe holgadamente en cualquier GPU consumer reciente.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con soporte CUDA (incluidas RTX 3060 o superiores) sería suficiente para los pesos, aunque el cuello de botella real es el procesamiento de grafos y la longitud de la cadena de ARN.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no confirmado oficialmente.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conformaciones | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gRNAde v0.3.2 5state multi (este) | 2,157 M | No disponible | 5 | Solo espacial (131 canales) | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v0.3.2 1state multi | 2,157 M | No disponible | 1 | Solo espacial | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v1 | 2,157 M | No disponible | 1 | Secuencia + pares de bases + espacial (132 canales) | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde ODsign (v1) | 2,157 M | No disponible | 1 | Secuencia + pares de bases + espacial | AGPL-3.0 | Hugging Face (oteam) |

Las variantes comparten arquitectura y número de parámetros; difieren en el número de conformaciones soportadas y en el tipo de grafo. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que no fue escrita por el equipo original de gRNAde; la reproducibilidad de resultados frente al repositorio oficial no está garantizada.
- Licencia AGPL-3.0: uso comercial permitido solo si se cumplen las obligaciones de copyleft del código; requiere revisión legal antes de integrarlo en productos propietarios.
- Modelo de dominio restringido: no es un modelo de lenguaje; no admite prompts en lenguaje natural ni tareas generales.
- Dependencia de estructura de entrada: la calidad del diseño depende de la calidad de las conformaciones 3D y de la alineación entre estados; conformaciones mal alineadas o incompletas degradan el resultado.
- Requisito de secuencia idéntica entre conformaciones: las conformaciones múltiples deben corresponder a la misma secuencia de ARN, lo que limita su uso a casos con datos estructurales consistentes.
- Riesgo de sobreajuste al corpus de entrenamiento: la model card no detalla la composición del dataset, por lo que no puede evaluarse el sesgo hacia familias de ARN sobrerrepresentadas.
- Sin datos de benchmarks ni de validación experimental publicados en la información disponible; no hay evidencia cuantitativa de rendimiento para esta variante concreta.
- Sin información sobre cuantización ni despliegue en entornos de producción de alto throughput.
- Fecha de creación del repositorio (2026-11-01) y ausencia de descargas o likes: modelo reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1state all: https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante 1state das: https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante 1state multi: https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante 2state all: https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante 3state all: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 3state das: https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante 3state multi: https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante 5state all: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante 5state das: https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guía del pipeline: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de ofoldx: https://ofoldx.valtech.ai/
- Paper original: https://arxiv.org/abs/2305.14749
- Paper de diseño generativo: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
