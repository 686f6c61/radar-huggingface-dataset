# ProtonPrat/anlp-a2-part2_nadamw

## Resumen

ProtonPrat/anlp-a2-part2_nadamw es un modelo de lenguaje causal de arquitectura propia entrenado como parte de la asignatura ANLP (Assignment 2). No se trata de un modelo publicado para uso general, sino de un artefacto académico: un transformer causal personalizado con 10.084.480 parámetros, entrenado sobre el corpus paralelo `browndw/human-ai-parallel-corpus` y evaluado mediante perplejidad y BLEU de continuación. El autor lo publica junto con el código de la asignatura y advierte explícitamente que no registra ninguna arquitectura AutoModel de la librería Transformers, por lo que no puede cargarse con `AutoModelForCausalLM`.

El modelo pertenece a la familia «Part 2» del mencionado trabajo, orientada a la continuación de texto en inglés, en contraste con los modelos de traducción de la Parte 1 que aceptan indicadores `--language vi` o `--language ja`. El nombre del repositorio hace referencia al optimizador empleado (NAdamW), y existen repositorios hermanos de otros autores con la variante AdamW, lo que sugiere un ejercicio comparativo de optimizadores dentro del mismo temario.

Su relevancia es fundamentalmente docente y metodológica. Con una perplejidad de test de 61,753718 y un BLEU de continuación de 1,174212, sus capacidades generativas son muy limitadas y quedan lejos de cualquier uso en producción. El interés real está en la reproducibilidad del pipeline completo (tokenizador BPE byte-level entrenado solo con el conjunto de entrenamiento, estados de reanudación por fracciones del corpus, exportación a safetensors) y en las notas de atribución del autor, que reconocen el uso de asistencia de código por LLM en la implementación de MoE, actualizaciones del optimizador y decodificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de arquitectura propia (custom), sin registro en la jerarquía AutoModel de Transformers |
| Parámetros totales | 10.084.480 |
| Parámetros activos | no disponible (no se confirma que el modelo exportado sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en formato safetensors sin documentación de cuantizaciones alternativas |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`) y checkpoints nativos de PyTorch en `.pt` (`final.pt`, `latest.pt`, `best.pt`, `fraction_0.1.pt`–`fraction_1.0.pt`) |

Datos adicionales de la model card: idioma `en`, región `us`, etiquetas `anlp-assignment-2`, `causal-lm`, `custom-architecture`, `pytorch`, `safetensors`. Tamaño del repositorio: 1,5 GB. Descargas: 0. «Likes»: 0. Fecha de creación y última actualización: 4 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal definido por el propio autor (`src.part1.model.Transformer` en el repositorio de la asignatura), con 10.084.480 parámetros y una configuración descrita en `hf_export/config.json`. No se especifican en la información disponible el número de capas, la dimensión del modelo, el número de cabezas de atención, la función de activación, el uso de normalización previa o posterior ni el tipo de codificación posicional. La model card menciona que se implementaron MoE, actualizaciones de optimizador y decodificación, pero no aclara si el módulo de mezcla de expertos forma parte de esta exportación concreta o de otras variantes del ejercicio; por ello los parámetros activos quedan como no disponibles.

El entrenamiento consumió 42.307.041 posiciones sobre el dataset `browndw/human-ai-parallel-corpus`, fijado en la revisión `b514ff64988d9e322fd81c5d70d69a38e78491f5`. El tokenizador es un BPE byte-level entrenado exclusivamente con el conjunto de entrenamiento (`hf_export/tokenizer.json`), lo que evita filtraciones del conjunto de test. El autor indica que se trata de resultados de una única semilla, sin barrido de ajuste de hiperparámetros del optimizador, y que los métodos numéricos y los controles experimentales se describen en el informe del proyecto. La evaluación reportada es perplejidad y BLEU de continuación sobre el conjunto de test; no se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés: continuación de un prompt en inglés mediante el script `scripts/infer.py` del repositorio de la asignatura.
- Modelado de lenguaje causal: cálculo de verosimilitud y perplejidad sobre secuencias, útil como referencia en experimentos académicos.
- Tokenización BPE byte-level propia, entrenada solo con el corpus de entrenamiento y exportada junto con los pesos.
- Reanudación de entrenamiento: los ficheros `final.pt`, `latest.pt` y los diez hitos `fraction_0.1.pt`–`fraction_1.0.pt` conservan modelo, optimizador, estado del generador aleatorio y cursor del tokenizador.
- Selección de pesos por pérdida de validación: `best.pt` almacena los pesos elegidos por validación, aunque no constituye un estado completo de reanudación.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de modo de razonamiento explícito («thinking mode»), ni de capacidades de visión o audio.
- No dispone de soporte multilingüe más allá del inglés; los modos de traducción (`--language vi`, `--language ja`) corresponden a los modelos de la Parte 1, no a esta exportación.
- No dispone de integración con agentes, planificación multi-paso ni uso de herramientas externas.

## Casos de uso

- Reproducción de prácticas académicas: cargar `hf_export/` con la clase `Transformer` de la asignatura y ejecutar `scripts/infer.py` para verificar que la perplejidad de test de 61,753718 se reproduce en el mismo entorno.
- Estudio comparativo de optimizadores: comparar esta variante NAdamW con las variantes AdamW publicadas por otros autores del mismo ejercicio para analizar convergencia, pérdida de validación y perplejidad final bajo idéntica configuración.
- Docencia de arquitecturas transformer: servir como ejemplo mínimo (10,08 M de parámetros) para ilustrar el ciclo completo de definición de arquitectura, tokenización BPE byte-level, entrenamiento y exportación a safetensors sin depender de la API de Transformers.
- Análisis de tokenizadores: el `tokenizer.json` entrenado únicamente con el corpus de entrenamiento permite estudiar cobertura de vocabulario, fertilidad y comportamiento byte-level sobre el dataset `browndw/human-ai-parallel-corpus`.
- Investigación sobre dinámica de entrenamiento: los diez hitos `fraction_0.1.pt`–`fraction_1.0.pt` permiten trazar curvas de pérdida frente a posiciones consumidas y analizar la estabilidad del optimizador a lo largo de las 42.307.041 posiciones.
- Evaluación de métricas automáticas: su BLEU de continuación de 1,174212 lo convierte en un caso útil para estudiar los límites de las métricas de solapamiento n-grama y su escasa correlación con la calidad semántica, tal como advierte el propio autor.
- Referencia negativa en experimentos: usar sus salidas como línea base de baja calidad frente a modelos mayores en estudios de detección de texto generado o de calibración de verosimilitud.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la perplejidad y el BLEU de continuación sobre el conjunto de test. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar.

| Métrica | Valor | Notas |
|---|---|---|
| Perplejidad (test) | 61,753718 | Medida sobre el conjunto de test del ejercicio |
| BLEU de continuación (test) | 1,174212 | Métrica de solapamiento n-grama sobre continuaciones |
| Posiciones de entrenamiento consumidas | 42.307.041 | Sobre `browndw/human-ai-parallel-corpus` |
| Parámetros totales | 10.084.480 | Configuración registrada por el autor |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K y similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10.084.480 parámetros, los pesos ocupan aproximadamente 40 MB en fp32 y unos 20 MB en fp16. La VRAM adicional depende del tamaño de lote y de la longitud de secuencia, que no se documenta.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 resultan enormemente sobredimensionadas para este modelo. La inferencia en CPU es perfectamente viable.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en GPUs integradas y en dispositivos tipo Raspberry Pi, siempre que la implementación sea en CPU.
- Opciones de despliegue: no hay soporte directo en vLLM, TGI, Ollama, llama.cpp ni en los pipelines de Transformers, ya que la arquitectura es propia y no está registrada en la librería. El despliegue requiere el código de la asignatura (`src.part1.model.Transformer`) y `scripts/infer.py`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.
- Nota sobre el almacenamiento: aunque los pesos de inferencia son pequeños, el repositorio ocupa 1,5 GB por la acumulación de estados de reanudación (`final.pt`, `latest.pt`, `best.pt` y los diez ficheros `fraction_*.pt`). Para descargar solo lo necesario puede usarse `allow_patterns="hf_export/*"`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los modelos comparables, por lo que la comparación se limita a parámetros, idioma, licencia y disponibilidad documentadas.

| Modelo | Autor | Parámetros | Idioma | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part2_nadamw | ProtonPrat | 10.084.480 | en | no disponible | safetensors + .pt | Optimizador NAdamW; perplejidad de test 61,753718 |
| Adi-AI/anlp-a2-part2-adamw | Adi-AI | no disponible | no disponible | no disponible | no disponible | Variante AdamW del mismo ejercicio |
| sanyam2005/anlp-a2-part2-adamw | sanyam2005 | no disponible | no disponible | no disponible | no disponible | Variante AdamW del mismo ejercicio |

No se conocen alternativas de propósito general comparables: los modelos de 10 M de parámetros publicados habitualmente (por ejemplo, variantes pequeñas de GPT-2 o destilaciones tipo TinyStories) no son directamente equiparables porque se entrenan con objetivos, corpus y presupuestos de cómputo distintos y no comparten el mismo pipeline de evaluación.

## Limitaciones y advertencias

- Naturaleza académica: es un artefacto de una asignatura, no un modelo listo para producción. El autor advierte que las métricas automáticas de verosimilitud y solapamiento no establecen calidad semántica.
- Calidad generativa muy limitada: una perplejidad de test de 61,753718 y un BLEU de continuación de 1,174212 indican un modelo con un ajuste pobre del lenguaje; las continuaciones carecen de coherencia global aprovechable.
- Resultados de una sola semilla: no hay barrido de ajuste del optimizador, por lo que las diferencias frente a otras variantes pueden deberse a variabilidad aleatoria.
- Sin licencia declarada: la ausencia de licencia impide determinar si se permite el uso comercial. Debe tratarse como material sin autorización explícita para explotación comercial.
- Idiomas: únicamente inglés. No hay soporte multilingüe ni de traducción en esta exportación.
- Longitud de contexto desconocida: la configuración no se detalla en la información disponible, por lo que no puede garantizarse el comportamiento en secuencias largas.
- Riesgo de alucinación: alto en términos relativos, dado el escaso ajuste del modelo. Cualquier salida debe considerarse no fiable sin verificación.
- Sesgos: el corpus `browndw/human-ai-parallel-corpus` puede contener sesgos propios de los textos humano-IA que lo componen; no se documenta ningún análisis de sesgo ni mitigación.
- Integración: al no registrarse en AutoModel, no funciona con herramientas estándar (vLLM, TGI, Ollama, llama.cpp) ni con pipelines de Transformers. Requiere el código de la asignatura, que no se incluye íntegramente en el repositorio de HuggingFace.
- Trazabilidad de la implementación: el propio autor indica que MoE, las actualizaciones del optimizador y la decodificación se implementaron con asistencia de código por LLM, lo que añade un riesgo de errores sutiles que conviene auditar antes de reutilizar el código.
- Ambigüedad sobre MoE: no se aclara si esta exportación concreta incorpora mezcla de expertos, por lo que no puede confirmarse el número de parámetros activos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part2_nadamw
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/ffca07ip
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus (revisión `b514ff64988d9e322fd81c5d70d69a38e78491f5`)
- Repositorio hermano (variante AdamW): https://huggingface.co/Adi-AI/anlp-a2-part2-adamw
- Repositorio hermano (variante AdamW): https://huggingface.co/sanyam2005/anlp-a2-part2-adamw
- Repositorio de la asignatura citado en resultados de búsqueda: https://github.com/Shardul0007/ANLP-ass1
- Otros resultados de búsqueda no relacionados directamente con el modelo: https://www.llm-releases.com/ y https://openai.com/open-models/
