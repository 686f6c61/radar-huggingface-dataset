# kimgreg/efficient-lm-head-reliability

## Resumen

`kimgreg/efficient-lm-head-reliability` no es un modelo de lenguaje autónomo, sino un repositorio de artefactos de investigación publicados en Hugging Face. Contiene tensores auxiliares: tres cabezas de salida (LM heads) comprimidas en formato ARCHead, construidas a partir de checkpoints FlashHead de Embedl, y diez conjuntos de estados ocultos (hidden states) densos extraídos de cuatro modelos base. El objetivo declarado es el estudio de la fiabilidad de cabezas de salida comprimidas y la recuperación de candidatos mediante estados coincidentes.

Los modelos de origen son Qwen3 0.6B, Qwen3 1.7B, Llama 3.2 1B Instruct y Gemma 3 1B IT, todos en sus variantes FlashHead publicadas por Embedl. Las cabezas y los estados están vinculados de forma estricta a los modelos y tokenizadores de origen, por lo que no pueden cargarse con `AutoModel.from_pretrained` de forma independiente. El repositorio tiene 2,8 GB y fue creado el 10 de noviembre de 2026.

Por su naturaleza, este repositorio resulta relevante para investigadores que trabajen en compresión de cabezas de salida, decodificación eficiente o evaluación de la degradación de calidad introducida por técnicas de compresión en la capa final del transformer. No está pensado para despliegue en producción ni para uso como modelo generativo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos de investigacion (cabezas de salida ARCHead y estados ocultos densos); no es un modelo completo |
| Parametros totales | no disponible (depende del modelo base asociado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los tensores se distribuyen en formato `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (tensores empaquetados y estados ocultos) |
| Modelos base | Qwen3 0.6B, Qwen3 1.7B, Llama 3.2 1B Instruct, Gemma 3 1B IT (variantes FlashHead de Embedl) |
| Tamano del repositorio | 2,8 GB |
| Integridad | `SHA256SUMS` sobre los 13 tensores grandes |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero. Los ficheros `heads/<modelo>/head.pt` son cabezas de salida ARCHead empaquetadas, construidas a partir de los checkpoints FlashHead fijados a revisiones concretas. Cada cabeza incluye un `manifest.json` que registra las fuentes de calibración, la configuración de compresión y el digest SHA-256. El código ARCHead utilizado corresponde al release `suayptalha/archead@29002720037fa4215822933e3ec50636882a7cc2`.

Los ficheros de `reference_states/` contienen estados ocultos densos de los cuatro modelos base, organizados por fuente: trayectorias naturales y de herramientas (`states/`), trayectorias BFCL para Qwen3 y Llama (`bfcl_stage2/`) y estados seleccionados de sondas de formato (`forced_formats_h/`). Estos estados se emplean en experimentos de recuperación de candidatos con estados coincidentes. La metadata de BFCL, prompts naturales y sondas de formato, así como el código de experimentos y los resultados por ejemplo, se mantienen en un repositorio de investigación complementario que figura como privado.

## Capacidades

- No es un modelo generativo autónomo: no puede invocarse directamente para generar texto, razonar o responder preguntas.
- Proporciona cabezas de salida comprimidas (ARCHead) para tres modelos: Qwen3 0.6B, Qwen3 1.7B y Llama 3.2 1B.
- Proporciona estados ocultos de referencia para cuatro modelos: los tres anteriores más Gemma 3 1B IT.
- Permite reproducir experimentos de recuperación de candidatos mediante estados coincidentes.
- Permite evaluar la fiabilidad de cabezas comprimidas frente a las cabezas originales de los checkpoints FlashHead.
- Incluye trayectorias BFCL para evaluación de tool calling en Qwen3 y Llama.
- Incluye sondas de formato (`forced_formats_h/`) para analizar el comportamiento de la cabeza ante formatos forzados.
- No soporta tool calling, agentes ni razonamiento multi-step por sí mismo; esas capacidades pertenecen a los modelos base.
- No dispone de capacidades multilingües, de visión ni de audio propias.

## Casos de uso

- Investigación en compresión de cabezas de salida: permite comparar la distribución de logits producida por una cabeza ARCHead comprimida frente a la cabeza densa del checkpoint FlashHead original, usando los estados de referencia como entrada controlada.
- Evaluación de degradación por compresión: los estados de `reference_states/*/states/` permiten alimentar la cabeza comprimida con trayectorias naturales y medir la divergencia respecto a la salida del modelo denso.
- Análisis de tool calling bajo compresión: las trayectorias BFCL de Qwen3 y Llama permiten estudiar si la compresión de la cabeza afecta a la selección de herramientas y a la generación de argumentos en formato estructurado.
- Estudio de robustez ante formatos forzados: los estados de `forced_formats_h/` sirven para analizar cómo responde la cabeza comprimida cuando se fuerza un formato de salida concreto.
- Recuperación de candidatos con estados coincidentes: los estados ocultos densos permiten construir índices y experimentar con recuperación de candidatos comparando estados de consulta y de referencia.
- Reproducibilidad de experimentos: los manifiestos con digest SHA-256 y el fichero `SHA256SUMS` permiten verificar que los tensores utilizados en un experimento coinciden exactamente con los publicados.
- Integración en pipelines de investigación sobre eficiencia de inferencia: sirve como material de referencia para estudiar el coste y la calidad de cabezas comprimidas antes de adoptarlas en un modelo desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 2,8 GB en disco; el espacio en VRAM depende del modelo base con el que se combine cada cabeza.
- Las cabezas ARCHead están pensadas para sustituir la cabeza de salida de los checkpoints FlashHead de Qwen3 0.6B, Qwen3 1.7B, Llama 3.2 1B y Gemma 3 1B, por lo que el coste de inferencia queda dominado por el modelo base.
- Los modelos base asociados (0,6B a 1,7B parámetros) caben en GPU de consumo; una RTX 4090 o RTX 3090 es suficiente para los cuatro en precisión completa o cuantizada.
- Para cargar los estados ocultos de referencia y ejecutar los experimentos de recuperación se recomienda al menos una GPU con 16-24 GB de VRAM si se procesan lotes grandes.
- El despliegue en producción (vLLM, llama.cpp, Ollama, TGI) no aplica a este repositorio; las cabezas deben integrarse en el runtime del modelo base correspondiente.
- No se dispone de datos de latencia ni throughput para las cabezas comprimidas en la información proporcionada.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelos cubiertos | Contenido | Licencia |
|---|---|---|---|---|
| `kimgreg/efficient-lm-head-reliability` | Artefactos de investigación | Qwen3 0.6B/1.7B, Llama 3.2 1B, Gemma 3 1B | Cabezas ARCHead y estados ocultos | no disponible |
| `embedl/Qwen3-0.6B-FlashHead` | Checkpoint completo | Qwen3 0.6B | Modelo con cabeza FlashHead | no disponible |
| `embedl/Llama-3.2-1B-Instruct-FlashHead` | Checkpoint completo | Llama 3.2 1B | Modelo con cabeza FlashHead | no disponible |
| `suayptalha/archead` | Código | no aplica | Implementación de cabezas ARCHead | no disponible |

La comparación directa con modelos generativos no procede, ya que este repositorio no es un modelo. Frente a los checkpoints FlashHead de Embedl, la diferencia es que aquí solo se distribuyen las cabezas comprimidas y los estados de referencia, no los pesos completos.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede cargarse con `AutoModel.from_pretrained` ni usarse para inferencia directa.
- Las cabezas y los estados están vinculados a revisiones concretas de los checkpoints de origen; reutilizarlos con otras revisiones o distribuciones puede invalidar los resultados.
- El repositorio complementario con código, metadata y resultados por ejemplo es privado, lo que limita la reproducibilidad completa de los experimentos.
- La licencia no está declarada; es imprescindible verificar los términos de los checkpoints de origen antes de cualquier uso derivado, especialmente comercial.
- No se han publicado benchmarks, por lo que no puede evaluarse la calidad de las cabezas comprimidas a partir de la información disponible.
- Riesgo de alucinación y sesgos: no aplica directamente al repositorio, pero sí a los modelos base con los que se combinen las cabezas.
- No se especifican los idiomas cubiertos por los estados de referencia ni la composición lingüística de las trayectorias.
- El uso en producción requiere integrar las cabezas en el runtime del modelo base y validar la equivalencia funcional frente a la cabeza original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kimgreg/efficient-lm-head-reliability
- Repositorio de investigación complementario (privado): https://github.com/Yonsei-EASY-LAB/efficient-lm-head-reliability
- Checkpoint base Qwen3 0.6B FlashHead: https://huggingface.co/embedl/Qwen3-0.6B-FlashHead
- Checkpoint base Qwen3 1.7B FlashHead: https://huggingface.co/embedl/Qwen3-1.7B-FlashHead
- Checkpoint base Llama 3.2 1B Instruct FlashHead: https://huggingface.co/embedl/Llama-3.2-1B-Instruct-FlashHead
- Checkpoint base Gemma 3 1B IT FlashHead: https://huggingface.co/embedl/gemma-3-1b-it-FlashHead
- Código ARCHead: https://github.com/suayptalha/archead
