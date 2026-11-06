# mradermacher/Energraft-EBT-Qwen3-1.7B-Base-GGUF

## Resumen

Energraft-EBT-Qwen3-1.7B-Base-GGUF es la versión cuantizada en formato GGUF del modelo base `dimweak/Energraft-EBT-Qwen3-1.7B-Base`, un transformer de 1.720.574.976 parámetros (1,7 mil millones) construido sobre la arquitectura Qwen3 y orientado a modelado basado en energía (energy-based model, EBT). El modelo original lo desarrolla el usuario `dimweak`; la cuantización la realiza `mradermacher`, un conocido distribuidor de quants estáticos para llama.cpp. El paquete incluye once variantes de cuantización, desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ejecutar el modelo en hardware modesto.

La propuesta técnica es poco habitual: en lugar de un transformer autoregresivo convencional entrenado con entropía cruzada, el modelo se etiqueta como EBT, es decir, un modelo que aprende una función de energía sobre secuencias y deriva la distribución de probabilidad a partir de ella. Esta formulación, popularizada en trabajos recientes sobre energy-based transformers, busca mejorar la coherencia global de la generación al puntuar secuencias completas en lugar de token a token. Sin embargo, la model card del repositorio cuantizado no aporta detalles sobre el entrenamiento, los datos utilizados ni los resultados obtenidos.

La relevancia práctica del repositorio es doble. Por un lado, ofrece una vía de bajo coste para experimentar con un modelo EBT de 1,7B en GPUs de consumo y en CPU mediante llama.cpp. Por otro, sirve como caso de estudio de la cadena de herramientas de cuantización estática aplicada a arquitecturas no estándar, donde la compatibilidad con llama.cpp no está garantizada. La licencia Apache 2.0 facilita su uso comercial, aunque la falta de benchmarks publicados obliga a validar el modelo empíricamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 con formulación de modelo basado en energía (EBT); detalles internos no disponibles |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo se presenta como un EBT (energy-based transformer) construido sobre la base de Qwen3-1.7B. La etiqueta `qwen3` y el tamaño de parámetros coinciden con la familia Qwen3 de Alibaba, por lo que es razonable asumir que reutiliza su tokenizador y su disposición de capas, aunque la model card no lo confirma. La formulación EBT implica que el modelo define una función de energía sobre secuencias y obtiene la probabilidad de una secuencia mediante normalización sobre el espacio de posibles continuaciones; en la práctica, esto suele requerir procedimientos de inferencia distintos a la decodificación autoregresiva estándar (por ejemplo, muestreo tipo MCMC o búsqueda sobre candidatos).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones concretas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado es una plantilla genérica de mradermacher que solo documenta el proceso de cuantización estática, no el entrenamiento del modelo base. Tampoco se indica si los quants son estáticos puros o si existe una versión con imatrix (el autor señala que los quants ponderados no están disponibles por el momento).

## Capacidades

- Generación de texto en inglés y chino, según los idiomas declarados en la model card.
- Modelado de lenguaje base: al ser un modelo `-Base`, está pensado para continuación de texto y fine-tuning, no para instrucciones directas.
- Formulación EBT: capacidad teórica de puntuar secuencias completas mediante una función de energía, lo que puede favorecer la coherencia global en generaciones largas.
- Compatibilidad con el ecosistema GGUF y llama.cpp, lo que permite inferencia en CPU y GPU de consumo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a inglés y chino; no hay evidencia de soporte de castellano.

## Casos de uso

- Experimentación en investigación sobre modelos basados en energía: el tamaño de 1,7B y las cuantizaciones de 1-2 GB permiten iterar rápidamente en una sola GPU sobre variantes de muestreo y funciones de energía sin incurrir en costes de infraestructura elevados.
- Fine-tuning para dominio específico en inglés o chino: al ser un modelo base, se puede ajustar con LoRA o fine-tuning completo (en precisión completa) para tareas de clasificación, resumen o extracción sobre corpus propios.
- Prototipado en local con llama.cpp: las variantes Q4_K_M (1,2 GB) y Q5_K_M (1,4 GB) caben en GPUs de 4-8 GB y permiten probar pipelines de generación en portátiles o estaciones de trabajo sin GPU dedicada.
- Evaluación comparativa de arquitecturas: sirve como contrapunto a Qwen3-1.7B estándar en estudios que midan si la formulación EBT mejora la perplejidad o la coherencia en generaciones largas.
- Generación de texto asistida en chino: para aplicaciones de continuación de texto o reescritura en mandarín donde se requiera un modelo pequeño y desplegable en local.
- Docencia y formación: el rango de cuantizaciones (de 0,9 GB a 3,5 GB) permite explicar en un aula el impacto de la cuantización en calidad y velocidad con un modelo real y ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_S/Q4_K_M, 1,5 GB con Q6_K, 2,0 GB con Q8_0 y 3,7 GB con f16 (incluyendo overhead de contexto y KV cache para contextos moderados).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4-Q5 (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda una GPU con 6-8 GB (RTX 3060, RTX 4060 Ti). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones Q2 a Q8; f16 también cabe en GPUs de 6 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y servidores compatibles con la API de llama.cpp. Para el modelo base en safetensors, transformers con PyTorch. No se documenta compatibilidad con vLLM ni TGI, y dada la naturaleza EBT del modelo, es probable que estos motores no lo soporten sin adaptaciones.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1,7B, en una RTX 4090 con Q4_K_M se puede esperar un throughput del orden de cientos de tokens por segundo, pero esta cifra es una estimación general para modelos de ese tamaño y no un dato medido para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Energraft-EBT-Qwen3-1.7B-Base-GGUF | 1,7B | no disponible | Apache 2.0 | GGUF | Formulación EBT; sin benchmarks publicados |
| Qwen3-1.7B-Base (Alibaba) | 1,7B | 32.768 tokens (según documentación pública de Qwen3) | Apache 2.0 | safetensors, GGUF | Modelo base estándar del que deriva; benchmarks públicos disponibles |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa pequeña con benchmarks publicados |
| Gemma 3 1B (Google) | 1B | 32.768 tokens | Gemma Terms | safetensors, GGUF | Licencia más restrictiva; multilingüe amplio |

La comparación directa con Qwen3-1.7B-Base es la más relevante, ya que es el modelo del que parte esta variante. La diferencia clave es la formulación EBT, cuyos beneficios no están cuantificados en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad, por lo que no se puede afirmar que el modelo supere o iguale a Qwen3-1.7B-Base estándar.
- Modelo base: no está alineado para seguir instrucciones ni para conversación; usarlo directamente como asistente producirá continuaciones de texto, no respuestas útiles.
- Idiomas limitados a inglés y chino: no hay evidencia de calidad en castellano ni en otras lenguas.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de 1,7B, agravado por la falta de evaluación publicada.
- Compatibilidad incierta con motores de inferencia estándar: la formulación EBT puede requerir procedimientos de muestreo específicos que llama.cpp no implemente de forma nativa; conviene verificar que las generaciones tengan sentido antes de usarlo.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo, dado que no hay garantías ni evaluaciones publicadas.
- Fecha de creación futura (2026-11-06) en los metadatos del repositorio: conviene tratar los metadatos con cautela y verificar el estado real del repositorio antes de depender de él.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Energraft-EBT-Qwen3-1.7B-Base-GGUF
- Modelo base: https://huggingface.co/dimweak/Energraft-EBT-Qwen3-1.7B-Base
- Página de overview del autor: https://hf.tst.eu/model#Energraft-EBT-Qwen3-1.7B-Base-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Qwen3-1.7B-Base (modelo de referencia): https://huggingface.co/mradermacher/Qwen3-1.7B-Base-GGUF
