# imanibme/Nurex

## Resumen

Nurex es un modelo de generación de texto publicado en Hugging Face por el usuario imanibme bajo licencia MIT. Según los metadatos del repositorio, se trata de un modelo basado en la arquitectura Qwen2 (etiqueta `qwen2` en los tags y `transformers` como librería), con 32.763.876.352 parámetros totales confirmados a partir de los pesos en formato safetensors, lo que lo sitúa en la franja de los 32B. El repositorio ocupa 65,5 GB y tiene un pipeline declarado de text-generation con soporte para conversational y text-generation-inference.

La model card del repositorio es problemática: reproduce íntegramente la documentación de DeepSeek-R1 (incluyendo logos, badges y secciones del paper de DeepSeek) en lugar de describir el propio modelo Nurex. Esta discrepancia entre los metadatos técnicos (arquitectura Qwen2, 32B parámetros) y el contenido de la model card (DeepSeek-R1, MoE de 671B) impide atribuir con fiabilidad las capacidades, el entrenamiento o los benchmarks del modelo a partir de la documentación publicada. El tag `arxiv:2501.12948` apunta al paper de DeepSeek-R1, lo que sugiere que el autor pudo haber destilado o ajustado fino sobre datos derivados de ese modelo, pero no hay confirmación explícita.

El modelo es relevante para la comunidad porque, de confirmarse que es un Qwen2 de 32B afinado con datos de razonamiento, encajaría en la categoría de modelos densos de razonamiento de tamano medio, ejecutables en hardware de gama alta de consumo con cuantización agresiva. No obstante, la falta de documentación propia y el bajo número de descargas (18) y likes (0) en el momento de la consulta obligan a tratar cualquier afirmación sobre su rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2 (según tags del repositorio) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no se indica que sea MoE; los metadatos apuntan a un modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos del repositorio indican la etiqueta `qwen2`, lo que apunta a una arquitectura transformer decoder-only con las convenciones de Qwen2 (atención con RoPE, normalización RMSNorm y posibles sesgos en las proyecciones QKV, según la familia Qwen2). El recuento real de parámetros en safetensors (32.763.876.352) es coherente con un modelo denso de la familia Qwen2.5-32B, aunque no se confirma en la documentación. No se dispone de información verificable sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni longitud de contexto máxima.

Respecto al entrenamiento, la model card reproduce el texto de DeepSeek-R1, que describe un pipeline de RL a gran escala sobre el modelo base, con dos etapas de RL y dos de SFT, y la destilación de datos de razonamiento en modelos densos de 1,5B a 70B. Sin embargo, no hay ninguna sección específica de Nurex que confirme qué proceso se aplicó realmente a este checkpoint. El tag `arxiv:2501.12948` sugiere una relación con el paper de DeepSeek-R1, posiblemente un ajuste fino sobre el dataset de razonamiento destilado, pero es una inferencia no verificada. No se documentan volúmenes de tokens, composición del dataset, ni si hubo RLHF, DPO o destilación supervisada.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, por lo que se espera soporte de diálogo multi-turno en formato chat.
- Razonamiento: el tag `arxiv:2501.12948` y la model card (aunque copiada de DeepSeek-R1) apuntan a un posible entrenamiento orientado a razonamiento con cadenas de pensamiento, pero no está confirmado para este checkpoint.
- Generación de código y matemáticas: no confirmado de forma específica para Nurex; la model card heredada de DeepSeek-R1 menciona estas capacidades, pero no son atribuibles con rigor a este modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está relleno en el repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible para Nurex; la model card heredada describe el modo de razonamiento de DeepSeek-R1, pero no hay confirmación de que Nurex lo implemente.
- Compatibilidad con text-generation-inference y endpoints compatibles: sí, según los tags `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Asistente conversacional autoalojado: al ser un modelo de 32B con licencia MIT y pesos safetensors, puede desplegarse en infraestructura propia para chat multi-turno sin restricciones de uso comercial, siempre que se valide su calidad real con evaluaciones propias.
- Generación de código en pipelines internos: si el ajuste sobre datos de razonamiento se confirma, podría integrarse en flujos de revisión de código o generación de tests, aunque la falta de benchmarks publicados obliga a una evaluación previa contra modelos de referencia.
- Razonamiento matemático asistido: la relación con el dataset de DeepSeek-R1 sugiere utilidad potencial en problemas de matemáticas y lógica paso a paso, pero debe validarse empíricamente antes de usarlo en producción.
- Fine-tuning posterior: al ser un modelo denso de 32B con licencia MIT, es un candidato razonable como base para ajuste fino específico de dominio (legal, sanitario, financiero) sin las restricciones de licencias tipo Llama.
- Prototipado de agentes con tool calling: si se confirma el soporte de function calling (no documentado), podría usarse en orquestación de herramientas; en caso contrario, requeriría wrappers externos de parsing.
- Despliegue en entornos con requisitos de soberanía de datos: la licencia MIT y la disponibilidad de pesos completos permiten ejecución on-premise en sectores regulados, con la salvedad de que la procedencia del entrenamiento no está documentada.
- Evaluación comparativa de modelos destilados: útil para investigadores que quieran medir la calidad de destilaciones de razonamiento sobre bases Qwen2 de 32B frente a los destilados oficiales de DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio reproduce las tablas y gráficos de DeepSeek-R1, pero no incluye ninguna evaluación específica de Nurex, por lo que no es posible atribuirle cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65,5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, se necesitan 2× A100 80GB, 2× H100 80GB o configuraciones equivalentes con tensor parallelism.
- Cuantización a 8 bits: en torno a 33-35 GB de pesos, viable en una única A100 80GB o H100 80GB con margen para contexto.
- Cuantización a 4 bits (si se generan GGUF/AWQ por cuenta propia): en torno a 17-20 GB, lo que permitiría ejecución en una RTX 4090 de 24 GB con contexto limitado, o en dos RTX 4090.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para despliegue en precisión completa; RTX 4090 o RTX 6000 Ada para cuantización 4-bit.
- Cabe en GPU de consumo: solo con cuantización de 4 bits y contexto reducido; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente) y endpoints compatibles; no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nurex (imanibme) | 32,76B | no disponible | MIT | Hugging Face, safetensors | Documentación copiada de DeepSeek-R1; sin benchmarks propios |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B (aprox.) | 128K (según documentación oficial de DeepSeek) | MIT | Hugging Face, safetensors y GGUF | Destilado oficial de DeepSeek-R1 sobre Qwen2.5-32B; benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,8B (aprox.) | 128K (según documentación oficial de Qwen) | Apache 2.0 | Hugging Face, safetensors y GGUF | Base instructiva generalista con benchmarks publicados |
| DeepSeek-R1-Distill-Llama-70B | 70B (aprox.) | 128K (según documentación oficial de DeepSeek) | MIT (con condiciones de uso de Llama) | Hugging Face | Mayor tamano y coste; referencia en razonamiento denso |

La comparación directa con Nurex es limitada porque no hay benchmarks ni contexto documentados. Por tamano y licencia, sus competidores naturales son los destilados oficiales de DeepSeek-R1 sobre Qwen2.5-32B y el propio Qwen2.5-32B-Instruct, ambos con documentación y evaluaciones públicas.

## Limitaciones y advertencias

- La model card del repositorio es una copia de la de DeepSeek-R1 y no describe Nurex; no se puede confiar en ella para conocer capacidades, entrenamiento o limitaciones reales del modelo.
- No hay benchmarks publicados, por lo que se desconoce su rendimiento real en matemáticas, código, razonamiento o tareas generales.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- No se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- Riesgo de alucinación no evaluado; al no haber datos de entrenamiento publicados, no se puede estimar su comportamiento en dominios especializados.
- Sesgos desconocidos: sin información sobre la composición del dataset, no es posible auditar sesgos de género, raza, idioma o dominio.
- La licencia MIT permite uso comercial sin restricciones, pero la procedencia de los datos de entrenamiento no está documentada, lo que puede plantear riesgos de compliance en entornos corporativos.
- El bajo número de descargas (18) y la ausencia de likes sugieren que el modelo no ha sido validado por la comunidad; no hay evidencia de terceros sobre su calidad.
- El tag `arxiv:2501.12948` apunta a DeepSeek-R1, pero no se confirma que Nurex sea un destilado oficial ni que haya sido entrenado con los mismos datos; tratarlo como equivalente a DeepSeek-R1-Distill-Qwen-32B sería una suposición no verificada.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos manualmente para despliegues en hardware limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imanibme/Nurex
- Paper de DeepSeek-R1 referenciado en los tags: https://arxiv.org/abs/2501.12948
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- PDF del paper de DeepSeek-R1 enlazado en la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
