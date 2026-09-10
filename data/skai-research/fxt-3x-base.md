# skai-research/fxt-3x-base

## Resumen

fxt-3x-base es un modelo de lenguaje jerárquico de nivel de byte (byte-level) desarrollado por skai-research y presentado en el trabajo "Dynamic Multi-Byte Prediction With Hierarchical Language Models" (arXiv:2608.15454). Se trata de la variante base, sin cabecera de predicción multi-byte (no-MBP), que segmenta el texto en tokens latentes de aproximadamente 3,35 bytes. Cuenta con 373.882.945 parámetros (374M), una ventana de contexto de 4096 bytes y un vocabulario de solo 261 entradas (256 bytes más los tokens especiales `<pad>`, `</s>`, `<unk>`, `<en>` y `<eot>`), lo que elimina por completo la dependencia de un tokenizer entrenado.

Su relevancia es fundamentalmente investigadora: actúa como baseline de control para medir la contribución del mecanismo de predicción multi-byte frente a un modelo jerárquico sin dicha cabecera, dentro de la misma familia y con datos de entrenamiento idénticos (FineWeb-Edu `sample-100BT`). Está publicado en Hugging Face bajo licencia Apache-2.0 con pesos en fp32.

Se trata de un preentrenamiento base, solo en inglés, sin ajuste por instrucciones ni soporte declarado de tool calling o agentes, por lo que su uso previsto es la experimentación en tokenización libre y en modelado de lenguaje a nivel de byte, no el despliegue conversacional directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo jerárquico byte-level sin tokenizer (hierarchical byte model), sin cabecera de predicción multi-byte (no-MBP) |
| Parametros totales | 373.882.945 (374M) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas; pesos en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32); requiere cargador propio, no es una arquitectura `transformers` |
| Vocabulario | 261 (256 bytes + `<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>`) |
| Configuracion del modelo (`model_config`) | `[2, (16,), 4, 0]` |
| Campo `attn_type` | `None` (según la model card; no se detalla su implicación) |
| Precisión | fp32 |
| Bytes por token latente | 3,35 |
| Pasos de entrenamiento | 48.342 |
| Tamaño del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo pertenece a una familia de modelos de lenguaje jerárquicos que operan directamente sobre bytes en lugar de sobre tokens de un tokenizer externo. La variante fxt-3x-base se segmenta a razón de aproximadamente 3,35 bytes por token latente, sin la cabecera de predicción multi-byte que sí incorporan otras variantes del trabajo; es, por tanto, el baseline "no-MBP" con el que se compara el mecanismo propuesto. La model card declara una configuración `model_config` de `[2, (16,), 4, 0]`, un vocabulario de 261 entradas y un campo `attn_type` con valor `None`, sin que se detalle en la información disponible el significado exacto de estos parámetros.

El preentrenamiento se realizó sobre el subconjunto `sample-100BT` del dataset FineWeb-Edu, con la configuración `configs/train/modern_fxt_priors_0.3_en_lambda_3_fxt_vanilla_256_scale_bp.yaml` y un total de 48.342 pasos. La model card no menciona fases de RLHF, DPO ni ajuste por instrucciones: se trata exclusivamente de un modelo preentrenado. No es una arquitectura compatible con `transformers`, por lo que debe cargarse con el código del repositorio `skai-research/lca-multibyte`.

## Capacidades

- Generación de texto a nivel de byte mediante modelado de lenguaje autorregresivo (modelo base preentrenado).
- Segmentación aprendida e inspeccionable: la herramienta de generación del repositorio permite imprimir las fronteras de segmentación con `--show_tokenization`.
- Manejo nativo de cualquier secuencia de bytes, sin vocabulario OOV ni pasos de normalización/limpieza previa del tokenizer.
- No dispone de ajuste por instrucciones ni modo de chat.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés (`en`).
- Sin capacidades de visión, audio ni modo thinking.
- Contexto limitado a 4096 bytes en la entrada.

## Casos de uso

- Baseline de investigación para predicción multi-byte: sirve como control experimental para cuantificar la mejora atribuible a la cabecera MBP en la misma familia de modelos, manteniendo datos y configuración de entrenamiento constantes.
- Estudio de tokenización libre: al operar sobre bytes, permite analizar el impacto de eliminar el tokenizer en métricas como BPC o en la robustez frente a texto ruidoso, con un vocabulario de solo 261 entradas.
- Análisis de segmentación aprendida: el flag `--show_tokenization` permite extraer y estudiar las fronteras de segmentación que el modelo aprende (3,35 bytes por token latente), útil en trabajos sobre compresión y eficiencia de representación.
- Reproducción de resultados académicos: permite replicar las métricas del paper (BPC de validación 0,903, 48.342 pasos) con el código y la configuración publicados.
- Punto de partida para fine-tuning supervisado en inglés: al ser un modelo base de 374M, puede ajustarse para tareas de clasificación o etiquetado sobre texto en inglés, aunque requeriría el cargador propio en lugar del ecosistema `transformers`.
- Modelado de texto con ortografía irregular: el enfoque byte-level evita fallos de tokenizer ante erratas, jerga, ruido OCR/ASR o secuencias no estándar, un escenario donde los modelos basados en subpalabras suelen degradarse.
- Docencia y demostración técnica: por su tamaño reducido (374M) y su licencia permisiva, resulta adecuado para ilustrar arquitecturas jerárquicas byte-level en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible. Los únicos datos de rendimiento proporcionados en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Byte-level BPC (validación) | 0,903 |
| Bytes por token latente | 3,35 |
| Pasos de entrenamiento | 48.342 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 (única precisión distribuida), los pesos ocupan aproximadamente 1,50 GB; con activaciones y overhead de ejecución, se sitúa en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente por tamaño; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con al menos 4 GB de VRAM (por ejemplo, gama RTX 30/40). No se ha confirmado su ejecución en CPU ni en GPUs integradas.
- Opciones de despliegue: no es compatible con `transformers`, por lo que vLLM, TGI, llama.cpp u Ollama no lo soportan de forma nativa. La carga requiere el repositorio `skai-research/lca-multibyte` y su módulo `src/eval/model_loader.py` (`load_fxt_model`), con `PYTHONPATH` apuntando a la raíz del repo. La model card marca `inference: false`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, por lo que no es posible establecer una comparación cuantitativa. A modo orientativo, los enfoques arquitectónicamente afines son los modelos byte-level sin tokenizer, pero sus cifras no forman parte de la información disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fxt-3x-base | Byte jerárquico sin tokenizer (no-MBP) | 374M | 4096 bytes | Apache-2.0 | Hugging Face + repositorio GitHub propio |
| Alternativas byte-level sin tokenizer | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base preentrenado: no está ajustado por instrucciones y no debe usarse como asistente conversacional directo.
- Contexto muy corto en términos prácticos: 4096 bytes equivalen a unos 4096 caracteres ASCII, sensiblemente menos que ventanas de contexto de modelos basados en tokens.
- Solo inglés: no hay soporte declarado para otros idiomas, a pesar de que el enfoque byte-level podría gestionarlos técnicamente.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje generativo; al ser un preentrenamiento base sin alineación, el riesgo no está mitigado.
- Sesgos potenciales heredados del corpus FineWeb-Edu (subconjunto `sample-100BT`); no se documentan análisis de sesgo en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se aporta información sobre las licencias del dataset de entrenamiento ni sobre condiciones adicionales.
- Integración limitada: al no ser una arquitectura `transformers`, no funciona con el ecosistema estándar (pipeline, vLLM, TGI, llama.cpp, Ollama) ni con la inferencia alojada de Hugging Face (`inference: false`).
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- No se documentan resultados en tareas downstream, por lo que el rendimiento real fuera del modelado de lenguaje a nivel de byte es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skai-research/fxt-3x-base
- Paper: https://arxiv.org/abs/2608.15454
- Código y cargador: https://github.com/skai-research/lca-multibyte
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Cita: Owodunni, Abraham Toluwase; Okocha, Chibuzor; Grant, Christan; Limisiewicz, Tomasz; Kumar, Sachin (2026), "Dynamic Multi-Byte Prediction With Hierarchical Language Models".
