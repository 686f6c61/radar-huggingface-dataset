# oteam/grnade-v0.3.2-2state-all

## Resumen

gRNAde es un modelo de diseño inverso de ARN (RNA inverse folding): dada una o varias conformaciones 3D de una cadena de ARN, predice secuencias de nucleótidos compatibles con esa geometría. Este checkpoint concreto, `oteam/grnade-v0.3.2-2state-all`, es una implementación no oficial publicada por el equipo OFoldX dentro de su librería `ofoldx`, basada en el trabajo original de Chaitanya K. Joshi y colaboradores (Universidad de Cambridge). El modelo resuelve el problema inverso al plegamiento: en lugar de predecir estructura a partir de secuencia, genera secuencias candidatas que adoptan una estructura objetivo.

La arquitectura combina un codificador de perceptrón vectorial geométrico (GVP) con un decodificador autorregresivo de nucleótidos. La variante v0.3.2 utiliza un grafo espacial sin canales de secuencia ni de pares de bases, y este checkpoint está entrenado para condicionar el diseño sobre dos conformaciones alineadas de la misma molécula de ARN, lo que permite diseñar secuencias estables en múltiples estados conformacionales.

Es relevante para investigadores en biología computacional y diseño de terapias basadas en ARN, porque el diseño multiconformacional es un requisito práctico en ribozimas, aptámeros y ARN mensajeros terapéuticos que alternan entre estados. El modelo es muy pequeño (2,157 millones de parámetros, ~2,16 M) y se distribuye con licencia AGPL-3.0, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) de 4 bloques + decodificador autorregresivo de 4 bloques; grafo espacial (v0.3.2) |
| Parámetros totales | 2.157.052 (~2,16 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por el número de nodos del grafo de la cadena de ARN de entrada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Librería | ofoldx |
| Pipeline | other (diseño de secuencias de ARN) |
| Tamaño de nodo (escalar/vector) | 128 / 16 |
| Tamaño de arista (escalar/vector) | 64 / 4 |
| Canales de arista de entrada | 131 |
| Estados conformacionales | 2 |
| Etiqueta de suavizado (label smoothing) | 0,05 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

gRNAde emplea un codificador GVP que procesa grafos de ARN donde los nodos son nucleótidos y las aristas codifican relaciones espaciales. En la variante v0.3.2 el grafo es puramente espacial: no incluye canales de orden de secuencia ni de pares de bases de estructura secundaria, a diferencia de la v1, que sí incorpora 132 canales de arista frente a los 131 de v0.3.2. El codificador consta de 4 bloques con representaciones nodales de 128 escalares y 16 vectores, y representaciones de arista de 64 escalares y 4 vectores. La salida alimenta un decodificador autorregresivo de 4 bloques que genera la secuencia nucleótido a nucleótido.

El entrenamiento se plantea como recuperación autorregresiva de identidades de nucleótidos a partir del contexto estructural, con un valor de suavizado de etiquetas de 0,05. Este checkpoint está entrenado para dos conformaciones alineadas de la misma secuencia de ARN: la primera actúa como objetivo de diseño y las posteriores aportan contexto estructural. La model card no detalla el corpus de entrenamiento ni el número de tokens o estructuras utilizadas, y remite a los artículos originales para la construcción de los conjuntos de datos. La librería `ofoldx` expone un `forward` diferenciable con teacher forcing y una clase `GrnadeLoss` para reentrenamiento y ajuste fino.

## Capacidades

- Diseño inverso de secuencias de ARN a partir de una estructura 3D de backbone en formato mmCIF.
- Condicionamiento sobre estructura secundaria explícita mediante notación dot-bracket.
- Diseño multiconformacional: condiciona una única secuencia sobre dos conformaciones alineadas de la misma molécula.
- Generación de múltiples candidatos por estructura con control de temperatura de muestreo.
- Puntuación de las secuencias generadas (cada candidato incluye registro de diseño y puntuaciones de secuencia).
- Selección de cadena o instancia de ARN dentro de estructuras con múltiples instancias (`instance_id`).
- Ejecución por etapas mediante pipeline (`prepare`, `forward`, `postprocess`).
- Ajuste fino y entrenamiento propio mediante `GrnadeLoss` y el `forward` diferenciable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo geométrico específico de biología estructural.

## Casos de uso

- Diseño de ribozimas multiconformacionales: el modelo genera secuencias compatibles simultáneamente con los estados abierto y cerrado de una ribozima, lo que resulta adecuado para enzimas de ARN que ciclan entre conformaciones catalíticamente activas e inactivas.
- Optimización de aptámeros con cambio conformacional: se condiciona el diseño sobre la conformación libre y la conformación unida al ligando para obtener secuencias con comportamiento de interruptor molecular.
- Diseño de ARN mensajero terapéutico con elementos estructurados: permite fijar la estructura secundaria de regiones 5' UTR o de elementos de respuesta y generar secuencias compatibles con los estados conformacionales relevantes.
- Rediseño de secuencias conservando el pliegue: dado un backbone experimental resuelto por criomicroscopía electrónica o cristalografía, el modelo propone secuencias alternativas que preservan la geometría, útil para eliminar motivos inmunogénicos o sitios de restricción.
- Filtrado y priorización en pipelines de diseño: al generar varios candidatos por estructura con temperatura controlada, se puede integrar en un flujo que puntúe y seleccione secuencias antes de la validación experimental.
- Investigación en biología sintética: generación de bibliotecas de ARN con estructuras definidas para experimentos de alto rendimiento, aprovechando que el modelo es pequeño y puede ejecutarse en CPU o en GPU de gama baja.
- Reentrenamiento con datos propios: gracias a `GrnadeLoss` y al `forward` diferenciable, un laboratorio puede ajustar el modelo a un subconjunto de estructuras de ARN de su interés (por ejemplo, ARN viral) sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 2,157 M de parámetros, los pesos en fp32 ocupan aproximadamente 8,6 MB, por lo que el cuello de botella es el grafo de entrada, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede usar una RTX 3060, RTX 4090, A100 o H100 sin que el modelo las aproveche por tamaño.
- Cabe holgadamente en GPU de consumo e incluso en CPU para estructuras de ARN de tamaño moderado.
- Opciones de despliegue: la vía prevista es la librería `ofoldx` (`pip install ofoldx`) con su pipeline `design`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 2 M de parámetros con decodificación autorregresiva sobre la longitud de la cadena, se espera una latencia baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Conformaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 2 estados (este) | 2,16 M | Grafo espacial de la cadena de ARN | 2 | AGPL-3.0 | Hugging Face (`oteam`) |
| gRNAde v1 | 2,16 M | Grafo con secuencia, pares de bases y geometría | 1 | AGPL-3.0 | Hugging Face (`oteam/grnade`) |
| gRNAde v0.3.2 1 estado | 2,16 M | Grafo espacial | 1 | AGPL-3.0 | Hugging Face (`oteam`) |
| gRNAde v0.3.2 5 estados | 2,16 M | Grafo espacial | 5 | AGPL-3.0 | Hugging Face (`oteam`) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento predictivo frente a otras familias de diseño inverso de ARN.

## Limitaciones y advertencias

- Implementación no oficial: la model card la describe explícitamente como UNOFFICIAL y el equipo original de gRNAde no la ha validado ni redactado.
- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el código fuente derivado; conviene revisar la compatibilidad con productos propietarios.
- Sin datos de benchmarks publicados en la información disponible: no hay evidencia cuantitativa de precisión en recuperación de secuencia para este checkpoint.
- El grafo v0.3.2 carece de canales de secuencia y de pares de bases, lo que puede limitar la fidelidad en regiones cuya estructura secundaria no esté reflejada en la geometría del backbone.
- Las dos conformaciones de entrada deben corresponder a la misma secuencia de ARN; secuencias distintas producen resultados inválidos.
- El modelo no genera estructura, solo secuencia: requiere una estructura 3D de partida fiable (experimental o predicha) y no valida el plegamiento de las secuencias generadas.
- Riesgo de sobreajuste a los sesgos del corpus de entrenamiento original, cuya composición no se detalla en esta model card.
- No apto para uso clínico directo sin validación experimental: las secuencias diseñadas deben verificarse in vitro o in vivo.
- Idiomas no aplicables; no es un modelo de texto y no procesa lenguaje natural.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad que haya reportado problemas de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1 estado: https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante 3 estados: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 5 estados: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper original: https://arxiv.org/abs/2305.14749
- Preprint 2025: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
