# schonsense/Caboose-SFT-Ripple-65B-test_in_progress

## Resumen

Caboose-SFT-Ripple-65B-test_in_progress es un modelo derivado de Ripple-65B, el modelo denso de 65.000 millones de parámetros publicado por Ricursive Intelligence bajo licencia Apache 2.0. El autor del repositorio, schonsense, lo distribuye como un ajuste fino supervisado (SFT) en fase de pruebas, con el identificador "test_in_progress" que indica que se trata de una versión no finalizada. El modelo base está preentrenado sobre 12 billones de tokens y admite una longitud de contexto de hasta 1 millón de tokens, lo que lo sitúa en la categoría de modelos de contexto largo orientados a tareas agénticas y de generación de código.

La relevancia de esta ficha radica en que el modelo base Ripple-65B Preview obtiene 80,52 puntos en Terminal-Bench 2.1, una métrica centrada en tareas de terminal y flujos agénticos, lo que lo convierte en un candidato interesante para automatización de desarrollo y operaciones. Sin embargo, la información disponible sobre este ajuste concreto es muy limitada: el repositorio no publica pipeline, idiomas soportados ni detalles del dataset de SFT, y el acceso está restringido mediante gated access en Hugging Face.

Se debe tratar esta ficha como una evaluación preliminar del modelo base y del repositorio derivado, no como una validación del ajuste fino, cuyos datos de entrenamiento, hiperparámetros y resultados no han sido publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ripple-65B) |
| Parametros totales | 65B (modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1M tokens (modelo base) |
| Tipos de cuantizacion | no disponible para este repositorio; el modelo base dispone de una variante NVFP4 publicada por Ricursive |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo base Ripple-65B Preview es un Transformer denso de 65.000 millones de parámetros preentrenado sobre 12 billones de tokens, con soporte de contexto de hasta 1 millón de tokens. Ricursive Intelligence lo posiciona para tareas agénticas y de código, y publica una variante cuantizada en NVFP4 en su propio repositorio de Hugging Face. No se han publicado detalles sobre la composición del dataset de preentrenamiento, el uso de RLHF o DPO, ni innovaciones de atención específicas más allá del contexto extendido.

Sobre el ajuste fino Caboose-SFT-Ripple-65B-test_in_progress no hay información técnica publicada: se desconoce el dataset de SFT, el número de pasos, la configuración de entrenamiento y si se aplicaron técnicas adicionales como DPO o RLHF. El sufijo "test_in_progress" sugiere que el autor lo mantiene como experimento abierto y que los pesos pueden cambiar o desaparecer.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Ripple-65B.
- Generación de código y resolución de tareas en terminal, con un rendimiento destacado en Terminal-Bench 2.1 (80,52 en el modelo base).
- Procesamiento de contexto largo de hasta 1M tokens, adecuado para repositorios completos o documentos extensos.
- Capacidades agénticas y de razonamiento multi-paso, según el posicionamiento del modelo base.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Automatización de tareas en terminal: el modelo base destaca en Terminal-Bench 2.1, por lo que puede emplearse para ejecutar y encadenar comandos en entornos de shell dentro de pipelines de CI/CD, con validación humana en pasos críticos.
- Asistencia en refactorización de repositorios: el contexto de hasta 1M tokens permite cargar árboles de código extensos y proponer cambios coherentes entre módulos.
- Agentes de desarrollo multi-paso: el modelo puede planificar y ejecutar secuencias de acciones (leer ficheros, editar, ejecutar tests) en flujos agénticos, siempre que se valide el comportamiento del ajuste SFT frente al base.
- Generación de scripts de operaciones: útil para crear y depurar scripts de despliegue, monitorización o administración de sistemas a partir de descripciones en lenguaje natural.
- Análisis de documentación técnica extensa: con 1M de contexto, puede resumir y responder preguntas sobre manuales, RFCs o bases de conocimiento completas.
- Prototipado de asistentes de código en entornos controlados: dado el estado "in progress" del ajuste, es adecuado para experimentación interna antes de considerar su uso en producción.
- Evaluación comparativa de ajustes SFT: sirve como referencia para medir cómo un SFT concreto modifica el comportamiento del modelo base en tareas de código y terminal.

## Benchmarks y rendimiento

| Benchmark | Ripple-65B Preview (base) | Caboose-SFT-Ripple-65B-test_in_progress |
|---|---|---|
| Terminal-Bench 2.1 | 80,52 | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

No se han publicado resultados de benchmarks del ajuste Caboose-SFT-Ripple-65B-test_in_progress en la información disponible. El único dato verificable corresponde al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 130 GB para 65B parámetros, lo que exige múltiples GPU o nodos con memoria agregada.
- VRAM estimada en cuantización de 8 bits: en torno a 65-70 GB, viable en una A100 80GB o H100 80GB.
- VRAM estimada en cuantización de 4 bits: en torno a 35-40 GB, viable en una RTX 4090 (24 GB) solo con offloading parcial o en una A6000 (48 GB) / A100 40GB.
- GPU recomendadas: H100 80GB, A100 80GB, o configuraciones multi-GPU con NVLink para FP16.
- Consumer GPU: no cabe en FP16 en ninguna GPU de consumo; en 4 bits puede ejecutarse en una RTX 4090 con offloading y penalización de latencia.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles con arquitecturas Transformer densas, aunque no se ha confirmado soporte específico para este repositorio. El modelo base cuenta con una variante NVFP4 publicada por Ricursive.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Rendimiento destacado |
|---|---|---|---|---|---|
| Caboose-SFT-Ripple-65B-test_in_progress | 65B | 1M (base) | Apache 2.0 | Gated | no disponible |
| Ripple-65B Preview (Ricursive) | 65B | 1M | Apache 2.0 | Abierto | Terminal-Bench 2.1: 80,52 |
| Ripple-65B Preview NVFP4 (Ricursive) | 65B | 1M | Apache 2.0 | Abierto | Cuantizado NVFP4 |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada, por lo que la comparativa se limita al ecosistema Ripple.

## Limitaciones y advertencias

- Estado "test_in_progress": el autor indica que el ajuste no está finalizado; los pesos pueden cambiar, romperse o retirarse sin aviso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el uso automatizado.
- Sin datos de entrenamiento publicados: se desconoce el dataset de SFT, los hiperparámetros y si se aplicaron técnicas de alineación adicionales.
- Sin benchmarks propios: no hay evidencia de que el ajuste mejore o degrade el rendimiento del modelo base en Terminal-Bench 2.1 u otras tareas.
- Idiomas no declarados: no se puede garantizar un comportamiento multilingüe adecuado.
- Riesgo de alucinación: inherente a los modelos de 65B sin datos de evaluación publicados; mayor en tareas de código donde los errores son silenciosos.
- Licencia Apache 2.0 en el modelo base, pero conviene verificar que el ajuste derivado mantiene la misma licencia y que no incorpora datos con restricciones adicionales.
- Uso comercial: permitido por la licencia, pero desaconsejado en producción sin una evaluación propia del ajuste frente al modelo base.
- Contexto de 1M tokens: el coste computacional y de memoria crece de forma significativa; el rendimiento efectivo en contextos muy largos no está verificado para este ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-test_in_progress
- Modelo base NVFP4 en Hugging Face: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Artículo sobre Ripple-65B Preview: https://www.marktechpost.com/2026/11/04/ricursive-ripple-65b-preview-open-weight-model/
