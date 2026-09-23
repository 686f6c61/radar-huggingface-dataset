# jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-g-50

## Resumen

`jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-g-50` es un checkpoint experimental de generación de texto obtenido podando estructuralmente el modelo base `google/gemma-4-26B-A4B`. El autor aplica el método de poda Less-is-MoE basado en la media del valor absoluto del gradiente (mean-absolute-gradient) para eliminar exactamente el 50 % de las neuronas de las FFN de los expertos enrutados, usando 64 muestras de calibración de la configuración `gpqa_main` del dataset `Idavidrein/gpqa`. El resultado se publica en BF16 y conserva la topología MoE original, pero con anchos de experto compactos almacenados en `config.json`.

El checkpoint resultante tiene 13.814.149.120 parámetros (~13,8 mil millones) y ocupa 27,7 GB en el repositorio, frente a los 26B del modelo base. La variante publicada se identifica como "IntDim-G": mantiene la topología MoE enrutada con anchos por experto irregulares (ragged), lo que obliga a usar un plugin específico de vLLM para la inferencia. La torre de visión del modelo base queda excluida de forma intencionada, por lo que este checkpoint es exclusivamente de texto.

Su relevancia es acotada y de carácter metodológico: no hay resultados de benchmarks publicados, el repositorio no tiene descargas ni valoraciones, y su utilidad principal es reproducir y auditar el efecto de la poda de expertos sobre un modelo MoE grande. La calibración sobre `gpqa_main` introduce además un riesgo de contaminación si se pretende evaluar el modelo precisamente con GPQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con capas MoE enrutadas (FFN de expertos); checkpoint podado estructuralmente, sin cambios en la topología de enrutamiento |
| Parámetros totales | 13.814.149.120 (~13,8 B), según safetensors |
| Parámetros activos | no disponible para el checkpoint podado; el nombre del modelo base (A4B) sugiere ~4 B activos en el original |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos publicados están en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 27,7 GB |
| Modalidad | solo texto (la torre de visión del modelo base está excluida de forma intencionada) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo causal language model con mezcla de expertos (MoE) en las capas FFN enrutadas, heredado íntegramente del base `google/gemma-4-26B-A4B`. El autor carga la torre completa del modelo preentrenado para validar equivalencia en FP32 y guarda el resultado en BF16. No hay ningún paso de entrenamiento ni de ajuste: el proceso es puramente de poda estructural más exportación, sin optimizador y sin actualización de pesos.

El método Less-is-MoE (media del valor absoluto del gradiente) puntúa la importancia de las neuronas de las FFN de los expertos enrutados y elimina el 50 % de ellas. La calibración usa 64 muestras del split `train` de `gpqa_main` (`Idavidrein/gpqa`, revisión `633f5ee89ab8ad4522a9f850766b73f62147ffdd`), con semilla 1234, formato de pregunta más opciones barajadas, campo `Explanation` como experto, letra de respuesta, sin plantilla de chat, sin límite de longitud de tokenizador, sin truncado, sin padding y con puntuación de gradientes en BF16. La selección de filas queda fijada por el hash `790c4c22309def44542965fdde7c5f38f1d8e354602640cfb31518134b8d92e6` y el fichero de tokens de Gemma por el hash `1f160f6cebc16683000226e0456ce03113c5304830cb575b80ed3f4521abe2e0`; los tensores de tokens no se redistribuyen. La calibración congelada está en `jayzou3773/less-is-moe-gpqa-main-calibration-64` (revisión `7134dfef5af4605eae0706c30efa9226f49aed96`) y los metadatos de exportación y equivalencia de máscara cero en `experiment-export.json`.

La innovación técnica relevante no está en el modelo, sino en el formato de despliegue: la variante IntDim-G conserva la topología MoE enrutada y almacena anchos compactos por experto en `config.json`. Esto implica que el checkpoint no es directamente servible con vLLM estándar y requiere el plugin "ragged" de Less-is-MoE incluido en la imagen unificada de GPU del proyecto. La variante IntDim-E, en cambio, usa un ancho de experto uniforme.

## Capacidades

- Generación de texto autoregresiva en el checkpoint base, supeditada a la degradación introducida por la poda del 50 % de neuronas de experto (no cuantificada en la información disponible).
- Razonamiento sobre preguntas de opción múltiple de tipo científico, dado el dominio de calibración (GPQA).
- Capacidad potencial de tool calling / function calling: no disponible; no se documenta ni se confirma en la model card.
- Capacidad de agente y razonamiento multi-paso: no disponible; no se documenta.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Visión: no soportada; la torre de visión queda excluida explícitamente.
- Audio: no soportado según la información disponible.
- Cabeza de clasificación o embeddings: no disponible; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Investigación sobre poda de MoE: el checkpoint permite reproducir el experimento de Less-is-MoE sobre `gemma-4-26B-A4B` y medir la pérdida de calidad asociada a eliminar el 50 % de neuronas de experto, comparando contra el base sin podar.
- Auditoría de métodos de poda: sirve como artefacto de referencia para verificar la equivalencia de máscara cero y la fidelidad de la exportación BF16 frente a la validación en FP32 documentada en `experiment-export.json`.
- Generación de datos sintéticos de dominio científico: puede usarse para producir borradores de preguntas y explicaciones en formato de opción múltiple, siempre que se filtren y validen posteriormente con un modelo mayor.
- Ajuste fino ligero en dominio vertical: con 13,8 B de parámetros totales, el coste de memoria para fine-tuning es aproximadamente la mitad que el del base de 26 B, lo que lo hace viable en nodos de 2× A100 40 GB con técnicas de eficiencia de memoria.
- Servicio self-hosted de texto en un clúster interno que ya disponga de la imagen GPU de Less-is-MoE y del plugin ragged de vLLM.
- Estudio de eficiencia memoria/cómputo: al mantener el enrutamiento MoE, permite medir la relación entre parámetros almacenados y parámetros activos tras la poda.
- Experimentación en estación de trabajo: en cuantización de 4 bits cabría en una única GPU consumer de 24 GB, útil para pruebas de integración antes de desplegar en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe exclusivamente el procedimiento de poda, los hashes de calibración y los requisitos del plugin de inferencia; no incluye métricas de MMLU, GPQA, HumanEval, GSM8K ni comparaciones cuantitativas contra el modelo base. Cualquier cifra de rendimiento atribuida a este checkpoint sería una invención.

Advertencia metodológica: dado que la calibración usa `gpqa_main`, emplear GPQA como benchmark de evaluación de este checkpoint produciría resultados contaminados.

## Requisitos de hardware

- VRAM estimada en BF16: ~27,7 GB solo de pesos; con caché KV y overhead del runtime, un rango práctico de 32-40 GB.
- VRAM estimada en 8 bits: ~14 GB de pesos más caché KV, del orden de 18-22 GB según contexto.
- VRAM estimada en 4 bits: ~8-9 GB de pesos más caché KV, del orden de 12-16 GB según contexto. Los tipos de cuantización no están publicados, por lo que estos rangos son estimaciones derivadas del recuento de parámetros.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 con contexto largo y margen operativo; A100 40 GB para BF16 con contexto corto y batch pequeño.
- Consumer GPU: no cabe en una RTX 4090 de 24 GB en BF16; sí sería viable en 4 bits. Dos RTX 4090 en paralelo tensorial cubrirían BF16 con poco margen.
- Opciones de despliegue: vLLM con el plugin ragged de Less-is-MoE, dentro de la imagen GPU unificada del proyecto. No está documentado soporte en llama.cpp, Ollama, TGI ni en vLLM estándar, precisamente por los anchos de experto irregulares de la variante IntDim-G.
- Latencia y throughput: no disponible. Al ser MoE podado, la computación por token se aproxima a la de un modelo denso del tamaño de los parámetros activos, pero la memoria debe alojar todos los expertos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-g-50` (este) | 13,8 B | no disponible | no disponible | apache-2.0 | safetensors BF16 | 0 descargas, 0 likes |
| `google/gemma-4-26B-A4B` (base sin podar) | 26 B (según denominación) | ~4 B (según denominación A4B) | no disponible | no disponible en la información proporcionada | no disponible | modelo base referenciado |

No se dispone de datos en la información proporcionada sobre otros checkpoints comparables de poda de MoE (mismo tamaño, misma tarea o mismo método) que permitan una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce cuánto degrada la poda del 50 % de neuronas de experto la calidad de generación, el razonamiento o la coherencia en contextos largos.
- Riesgo de contaminación en evaluación: la calibración usa 64 muestras de `gpqa_main`, de modo que este checkpoint no debe evaluarse con GPQA como si fuera una prueba limpia.
- Dependencia de un plugin no estándar: la inferencia requiere el plugin ragged de vLLM de Less-is-MoE y la imagen GPU unificada del proyecto. Esto rompe la compatibilidad con vLLM estándar, Ollama, llama.cpp y TGI, y añade riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Solo texto: la torre de visión está excluida de forma intencionada, por lo que el checkpoint no puede ejecutar tareas multimodales que el base sí podría abordar.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; no debe asumirse el comportamiento del modelo base.
- Licencia: el checkpoint se publica como apache-2.0, pero no se detallan en la información proporcionada los términos aplicables al modelo base `google/gemma-4-26B-A4B`; conviene verificarlos antes de un uso comercial.
- Sesgos: no evaluados ni documentados. Al derivar de un modelo base no auditado en esta ficha, persisten los sesgos del original y se añade una posible distorsión de dominio por calibrar exclusivamente con material científico de GPQA.
- Alucinación: inherente a los modelos generativos y no medida en este checkpoint; la poda agresiva de expertos puede incrementarla.
- Madurez: repositorio con 0 descargas y 0 likes, publicado sin validación de la comunidad. Es un artefacto de investigación, no un modelo listo para producción.
- Metadatos: la fecha de creación registrada (2026-09-23) y la ausencia de declaración de idiomas dificultan verificar procedencia y alcance; conviene inspeccionar `config.json` y `experiment-export.json` antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gemma-4-26b-a4b-gpqa-main-64-intdim-g-50
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de calibración: https://huggingface.co/jayzou3773/less-is-moe-gpqa-main-calibration-64 (revisión `7134dfef5af4605eae0706c30efa9226f49aed96`)
- Dataset de calibración: https://huggingface.co/datasets/Idavidrein/gpqa (revisión `633f5ee89ab8ad4522a9f850766b73f62147ffdd`)
- Artículo de Less-is-MoE: no disponible (no se proporciona enlace en la información)
- Repositorio de código o imagen GPU de Less-is-MoE: no disponible (no se proporciona enlace en la información)
- Demo: no disponible
