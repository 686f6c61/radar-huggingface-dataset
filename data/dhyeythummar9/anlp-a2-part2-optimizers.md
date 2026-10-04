# dhyeythummar9/ANLP-A2-Part2-Optimizers

## Resumen

Este repositorio contiene los cinco checkpoints finales entrenados para la Parte 2 (comparativa de optimizadores) de la asignatura Advanced NLP Assignment 2. No se trata de un modelo de lenguaje listo para producción, sino de un artefacto experimental: un Transformer decoder-only con red feed-forward densa, preentrenado para predicción del siguiente token sobre el dataset de la asignatura, con el objetivo de comparar implementaciones de optimizadores escritas desde cero en PyTorch.

El experimento entrena exactamente la misma arquitectura, partición de datos, tokenizador, presupuesto de tokens, protocolo de inicialización y calendario de evaluación con cinco optimizadores distintos: AdamW, NAdamW, Lion, Muon y Sophia (este último incluido como bonus basado en Hessiano). El presupuesto final de tokens es de 39.080.642, con evaluaciones intermedias aproximadamente cada 0,1× del dataset. El resultado principal es que Muon obtiene la menor pérdida de validación (4,29563), la menor perplejidad (73,3783) y el mayor BLEU de test (3,19020) entre las configuraciones evaluadas.

La relevancia es metodológica, no de capacidades: sirve para reproducir una comparativa controlada de optimizadores y como material didáctico. El autor es dhyeythummar9, la licencia es MIT y el repositorio no registra descargas ni likes en el momento de la consulta. No se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con red feed-forward densa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`), uno por optimizador |
| Presupuesto de entrenamiento | 39.080.642 tokens |
| Optimizadores evaluados | AdamW, NAdamW, Lion, Muon, Sophia |
| Archivos auxiliares | `tokenizer.json`, `experiment_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con red feed-forward densa, entrenado para predicción del siguiente token. Todos los runs finales comparten la misma arquitectura, partición del dataset, tokenizador, presupuesto de tokens, protocolo de inicialización y calendario de evaluación, de modo que la única variable independiente es el optimizador. Los optimizadores se implementaron directamente en PyTorch heredando de `torch.optim.Optimizer`, en lugar de usar implementaciones predefinidas, como requisito de la asignatura. Sophia se incluyó como optimizador bonus basado en Hessiano.

El presupuesto final de tokens fue de 39.080.642, con evaluaciones realizadas a intervalos de aproximadamente 0,1× del dataset. Las métricas de seguimiento fueron pérdida de validación, perplejidad de validación, BLEU de test (calculado sobre 200 ejemplos), pérdida de entrenamiento y diagnósticos específicos de cada optimizador. No se detalla la composición del dataset, el número de tokens de entrenamiento totales, la presencia de RLHF o DPO, ni innovaciones técnicas adicionales más allá de la propia comparativa de optimizadores. Los checkpoints se guardan con PyTorch y están pensados para cargarse desde la implementación de la Parte 2 del repositorio del curso.

## Capacidades

- Generación de texto para predicción del siguiente token: es la única tarea para la que fue entrenado el modelo.
- Ninguna capacidad de tool calling ni function calling documentada.
- Ningún soporte de agentes ni de razonamiento multi-paso documentado.
- Sin capacidades multilingües declaradas (idiomas no disponibles).
- Sin modo thinking, visión, audio ni otras modalidades.
- Utilidad real como banco de pruebas de optimizadores: permite comparar AdamW, NAdamW, Lion, Muon y Sophia bajo condiciones controladas.
- Los valores de BLEU de test (entre 2,29 y 3,19) indican una calidad de generación muy limitada, coherente con un modelo pequeño entrenado con un presupuesto reducido.

## Casos de uso

- Reproducción de la comparativa de optimizadores: cargar los cinco checkpoints (`AdamW.pt`, `NAdamW.pt`, `Lion.pt`, `Muon.pt`, `Sophia.pt`) y verificar las métricas de pérdida, perplejidad y BLEU reportadas bajo la misma configuración experimental.
- Material didáctico para cursos de NLP: ilustrar cómo una elección de optimizador altera la pérdida de validación final manteniendo arquitectura y datos constantes.
- Validación de implementaciones propias de optimizadores: servir de referencia para comprobar que una implementación nueva de Lion, Muon o Sophia reproduce el comportamiento reportado.
- Estudio de optimizadores basados en Hessiano: usar el checkpoint de Sophia para analizar el efecto de un optimizador de segundo orden en un Transformer decoder-only pequeño.
- Investigación en protocolos de evaluación: emplear el calendario de evaluación a intervalos de 0,1× del dataset para estudiar dinámicas de convergencia.
- Punto de partida para ablaciones controladas: reutilizar `experiment_config.json` y `tokenizer.json` para lanzar variantes con nuevos optimizadores manteniendo el resto de condiciones fijas.
- Docencia sobre formatos de checkpoint en PyTorch: los `.pt` se cargan con `torch.load(..., map_location="cpu")` y ejemplifican el guardado y recarga de estados de optimizador y modelo.

## Benchmarks y rendimiento

Resultados finales a 1,0× del presupuesto de tokens, según la model card:

| Optimizador | Perdida validacion | Perplejidad validacion | BLEU test | Perdida entrenamiento |
|---|---:|---:|---:|---:|
| AdamW | 4,57476 | 97,0051 | 2,35506 | 4,42750 |
| NAdamW | 4,55052 | 94,6817 | 2,29319 | 4,40318 |
| Lion | 4,60710 | 100,1930 | 2,37691 | 4,45246 |
| Muon | 4,29563 | 73,3783 | 3,19020 | 4,15267 |
| Sophia | 4,46071 | 86,5486 | 2,49855 | 4,30476 |

Muon obtiene el mejor resultado en las tres métricas principales (menor pérdida de validación, menor perplejidad y mayor BLEU). El BLEU se calculó sobre 200 ejemplos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no especificarse el número de parámetros ni la longitud de contexto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible por falta de datos de tamaño; el presupuesto de entrenamiento (39 millones de tokens) sugiere un modelo de escala reducida, pero no se confirma.
- Opciones de despliegue: los checkpoints están pensados para cargarse con PyTorch desde la implementación de la Parte 2 del repositorio del curso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la información proporcionada. La comparativa pertinente es interna, entre los cinco checkpoints del propio repositorio, que comparten arquitectura, datos, tokenizador y presupuesto de tokens:

| Checkpoint | Optimizador | Perdida validacion | Perplejidad validacion | BLEU test |
|---|---|---:|---:|---:|
| `Muon.pt` | Muon | 4,29563 | 73,3783 | 3,19020 |
| `Sophia.pt` | Sophia | 4,46071 | 86,5486 | 2,49855 |
| `NAdamW.pt` | NAdamW | 4,55052 | 94,6817 | 2,29319 |
| `AdamW.pt` | AdamW | 4,57476 | 97,0051 | 2,35506 |
| `Lion.pt` | Lion | 4,60710 | 100,1930 | 2,37691 |

No se conocen modelos de terceros comparables en la información disponible.

## Limitaciones y advertencias

- Calidad de generación muy baja: los valores de BLEU de test (2,29 a 3,19 sobre 200 ejemplos) indican que el modelo no es apto para generación de texto útil.
- No es un modelo de propósito general: es un artefacto de un trabajo académico, con un presupuesto de entrenamiento reducido y sin ajuste por instrucciones ni RLHF/DPO documentado.
- Sesgos conocidos: no disponibles, pero al entrenarse sobre el dataset de una asignatura, probablemente herede sus sesgos y su dominio limitado.
- Riesgo de alucinación: alto en cualquier uso generativo fuera del marco experimental; no se recomienda su uso en producción.
- Idiomas y contexto: no especificados, por lo que no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia MIT: permite uso comercial y modificación, pero al no existir datos de procedencia del dataset, la responsabilidad sobre el contenido generado recae en el usuario.
- Orientado a carga con PyTorch: los `.pt` requieren el código de la Parte 2 del repositorio del curso; no hay pesos en formatos estándar de despliegue.
- Reproducibilidad: depende de `experiment_config.json` y `tokenizer.json`, que la model card indica como posibles archivos incluidos ("may also include"), sin garantía explícita de su presencia.

## Enlaces

- HuggingFace: https://huggingface.co/dhyeythummar9/ANLP-A2-Part2-Optimizers
- Repositorio del curso (Parte 2, implementación de referencia): no disponible en la información proporcionada.
- Paper de Muon: no disponible en la información proporcionada.
- Paper de Sophia: no disponible en la información proporcionada.
- Paper de Lion: no disponible en la información proporcionada.
- Demos o blogs adicionales: no disponible.
