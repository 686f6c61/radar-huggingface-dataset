# ceia-br/lumi-4b

## Resumen

CEIA Lumi-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros desarrollado por la organización brasileña CEIA (ceia-br), orientado a la generación de texto conversacional en portugués. Se trata de un proyecto de modelización lingüística para la lengua portuguesa, un ámbito donde los modelos abiertos de calidad siguen siendo escasos frente a los modelos centrados en inglés.

El modelo se distribuye en formato safetensors con pesos en BF16 (unos 8 GB de repositorio) y emplea una arquitectura nemotron_h según los metadatos del repositorio. La model card es todavía incompleta: no documenta el modelo base del que parte, los datos ni los procedimientos de entrenamiento, la licencia ni las instrucciones de inferencia, por lo que conviene tratarlo como un proyecto en fase temprana de publicación.

Su relevancia actual radica en la evaluación comparativa publicada por los propios autores en portugués: en un ranking de 9 modelos evaluados sobre benchmarks en portugués (MMLU PT, MMLU-ProX PT e IFEval PT), Lumi-4B ocupa la 2ª posición con un resultado global del 44,80 %, lo que lo posiciona como una opción competitiva en su categoría de tamaño para tareas en portugués.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nemotron_h (híbrida, según metadatos del repo) |
| Parámetros totales | 3.973.556.832 (≈3,97 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (nativo); no disponible información sobre cuantizaciones publicadas |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Según los metadatos del repositorio, Lumi-4B emplea la arquitectura `nemotron_h`, la familia de arquitecturas híbridas de NVIDIA que combina bloques transformer con capas tipo Mamba (SSM) para mejorar la eficiencia en secuencias largas. No obstante, la model card no detalla la composición exacta de bloques, el número de capas, cabezas de atención ni dimensiones ocultas, por lo que estos datos concretos no están disponibles.

Tampoco se ha documentado el proceso de entrenamiento: se desconoce el modelo base (si es un continued pretraining o fine-tuning de un modelo existente), el número de tokens, la composición del corpus ni si se aplicaron etapas de RLHF, DPO u otro alineamiento. Los propios autores reconocen en la model card que estos detalles deben añadirse cuando sean confirmados. La única evidencia de alineación instruccional es la evaluación en IFEval PT (prompt estricto), que sugiere que el modelo ha pasado por algún tipo de ajuste para seguir instrucciones.

## Capacidades

- Generación de texto conversacional en portugués (pipeline text-generation).
- Seguimiento de instrucciones en portugués, evaluado mediante IFEval PT en modo prompt estricto (33,83 %).
- Conocimiento general en portugués evaluado con MMLU PT (enseñanza media y grado universitario) y Global MMLU PT.
- Razonamiento académico multilingüe parcial evaluado con MMLU-ProX PT.
- No hay información disponible sobre: tool calling / function calling, capacidades de agente, visión, audio, modo de razonamiento extendido (thinking) ni soporte de decodificación especulativa.

## Casos de uso

- **Asistentes conversacionales en portugués**: al tratarse de un modelo conversacional afinado para portugués, puede servir de base para chatbots de atención al usuario en Brasil o Portugal, donde los modelos generalistas en inglés rinden peor en matices idiomáticos locales.
- **Clasificación y extracción de información en portugués**: con cerca de 4B de parámetros, es adecuado para tareas de NLP supervisado vía prompting (clasificación de tickets, extracción de entidades en documentos brasileños) con costes de inferencia moderados.
- **Generación de contenido en portugués**: redacción de correos, resúmenes de documentos o descripciones de producto en portugués brasileño, aprovechando su evaluación favorable en benchmarks de la lengua.
- **Despliegue on-premise en hardware modesto**: con 3,97B de parámetros en BF16 (≈8 GB), puede ejecutarse en GPUs de consumo, útil para organizaciones con requisitos de privacidad de datos que no quieran depender de APIs externas.
- **Base para fine-tuning específico de dominio**: al ser un modelo abierto de tamaño contenido, es candidato razonable para ajuste fino posterior en dominios como jurídico brasileño, salud o atención al cliente, aunque la licencia pendiente debe verificarse antes de uso comercial.
- **Evaluación y investigación en NLP en portugués**: el proyecto CEIA incluye una comparativa de 9 modelos en benchmarks en portugués, por lo que Lumi-4B sirve también como punto de referencia para estudios de evaluación de modelos en esta lengua.

## Benchmarks y rendimiento

Resultados publicados por los propios autores en la model card (evaluación en portugués, ranking de 9 modelos):

| Benchmark | Resultado |
|---|---:|
| MMLU PT, enseñanza media | 45,72 % |
| MMLU PT, grado universitario | 48,80 % |
| Global MMLU PT | 59,36 % |
| MMLU-ProX PT | 36,28 % |
| IFEval PT, prompt estricto | 33,83 % |
| **Global (media aritmética)** | **44,80 %** |

Con este global, Lumi-4B ocupa la 2ª posición entre 9 modelos evaluados en la comparativa del proyecto. Los autores advierten que no se han publicado las versiones de los datasets de evaluación, el harness empleado, los parámetros de ejecución ni intervalos de confianza, por lo que las cifras no deben interpretarse como garantía de rendimiento en otras tareas o entornos.

## Requisitos de hardware

- **VRAM estimada para inferencia en BF16**: aproximadamente 8 GB solo de pesos (tamaño del repositorio), más la sobrecarga de KV cache y activaciones; en la práctica, 10–12 GB de VRAM es una estimación razonable. No hay datos oficiales de consumo.
- **Con cuantización a 4 bits** (si se generan versiones GGUF o AWQ, no disponibles actualmente en el repositorio): los pesos ocuparían en torno a 2–2,5 GB, viable en GPUs de 6–8 GB.
- **GPUs de consumo**: una RTX 4060 Ti de 16 GB o RTX 4090 ejecutarían el modelo en BF16 sin problemas. No cabe cómodamente en GPUs de 8 GB en precisión completa.
- **GPUs de centro de datos**: A10G, L4, A100 o superiores son más que suficientes; no se requiere hardware H100 para este tamaño.
- **Despliegue**: al usar arquitectura `nemotron_h` con `custom_code`, el soporte en llama.cpp, Ollama o vLLM no está confirmado; la vía más segura es Transformers con `trust_remote_code=True`. La compatibilidad con vLLM depende del soporte de la arquitectura NemotronH en la versión empleada.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La model card no identifica los otros 8 modelos del ranking, por lo que la siguiente comparativa se basa en modelos abiertos de tamaño similar orientados a portugués o de uso general:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CEIA Lumi-4B | 3,97 B | no disponible | no disponible | 2º/9 en el ranking PT de CEIA; Global MMLU PT 59,36 % |
| Qwen3 4B (instruct) | 4 B | 32.768 (según ficha oficial) | Apache 2.0 | Fuerte rendimiento multilingüe, incluido portugués; soporte thinking mode |
| Gemma 3 4B | 4 B | 128.000 (según ficha oficial) | Gemma Terms of Use | Multilingüe con soporte de portugués, multimodal (visión) |
| Llama 3.2 3B | 3,2 B | 128.000 (según ficha oficial) | Llama 3.2 Community License | Multilingüe oficialmente (incluye portugués), amplio ecosistema |

La comparación cuantitativa directa en benchmarks PT no es posible: los autores no han publicado los nombres ni los resultados de los modelos rivales de su ranking, y no existen números comparables publicados bajo el mismo harness.

## Limitaciones y advertencias

- **Licencia no especificada**: la ficha no declara licencia, lo que impide evaluar su uso comercial. Es un bloqueante importante para producción hasta que los autores la publiquen.
- **Documentación incompleta**: no se conocen el modelo base, los datos de entrenamiento ni los procedimientos de alineación, lo que dificulta auditar sesgos, provenance de datos y reproducibilidad.
- **Benchmarks sin detalles metodológicos**: sin harness, versiones de datasets ni intervalos de confianza, las métricas publicadas deben tomarse con cautela.
- **Riesgo de alucinación**: no evaluado; como todo LLM de 4B, es esperable una tasa de alucinaciones significativa, especialmente en conocimiento factual y en dominios fuera del corpus de entrenamiento.
- **Alcance lingüístico**: el modelo está orientado a portugués; su rendimiento en español u otros idiomas no está evaluado y probablemente sea inferior al de modelos multilingües generalistas.
- **Soporte de inferencia**: la arquitectura `nemotron_h` con `custom_code` puede requerir `trust_remote_code=True` y no tener soporte directo en llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue optimizado.
- **Proyecto reciente y de baja adopción**: creado en octubre de 2026 con 191 descargas registradas, carece de auditoría comunitaria amplia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ceia-br/lumi-4b
- Organización del autor: https://huggingface.co/ceia-br
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
