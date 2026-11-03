# Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign

## Resumen

Qwen3.6-27B-Instruct-MetaSecAlign es un ajuste fino del modelo multimodal Qwen/Qwen3.6-27B publicado por el desarrollador independiente Sizhe-Chen. Se trata del checkpoint de referencia (baseline) del estudio SecPO, entrenado con Direct Preference Optimization (DPO) estándar sobre pares de preferencia construidos con inyecciones simuladas estáticas. Su objetivo es defender el modelo frente a ataques de prompt injection indirecta, preservando al mismo tiempo la utilidad general del modelo base.

El modelo mantiene la arquitectura del Qwen3.6-27B original: un modelo de lenguaje causal de aproximadamente 27.356 millones de parámetros con un codificador de visión, empaquetado como `Qwen3_5ForConditionalGeneration`. Los pesos se distribuyen en 12 shards de safetensors en BF16 con las LoRA ya fusionadas, de modo que no se requiere ningún adaptador separado para su uso.

La relevancia de esta ficha radica en que cuantifica con detalle el compromiso entre seguridad y utilidad: reduce la tasa de éxito de ataques estáticos del 98,9 % al 2,9 %, pero los ataques adaptativos siguen siendo eficaces (hasta el 94,0 % de ASR en PISmith). Es, por tanto, un punto de partida útil para investigar defensas frente a prompt injection, no una solución de producción cerrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (LLM causal de ~27B con codificador de visión) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens (configuración nativa) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards, ~54,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del transformer multimodal Qwen3.6-27B, que combina un decodificador causal de lenguaje con un codificador de visión preservado intacto durante el ajuste. El entrenamiento consistió en un DPO sigmoide estándar con `beta=0.1`, donde tanto la política como la referencia congelada condicionan sobre la misma entrada inyectada. Se construyeron 19.157 pares de preferencia a partir de ejemplos de Cleaned-Alpaca con campo de datos, generando inyecciones simuladas estáticas mediante una plantilla que convierte otro ejemplo muestreado en una tarea inyectada, antepuesta o pospuesta con igual probabilidad. La respuesta preferida sigue la tarea de confianza sobre entrada limpia; la rechazada sigue la tarea inyectada.

El ajuste se realizó durante 1 época con AdamW, tasa de aprendizaje `1.6e-4`, esquema lineal, 3 % de warmup y clipping de norma de gradiente a 1.0. Se usaron 8 procesos, 1 par por dispositivo, 8 pasos de acumulación (64 pares por actualización) y un presupuesto de secuencia de 4.608 tokens. Las LoRA (rango 64, alpha 8, dropout 0.1) se aplicaron a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, y se fusionaron en los pesos liberados. No hubo entrenamiento adversarial en este baseline y el modo thinking permaneció desactivado durante entrenamiento y evaluación (`enable_thinking=False`).

## Capacidades

- Generación de texto y razonamiento general, con resultados sólidos en MMLU-Pro (83,9 %) y GPQA Diamond (79,3 %).
- Razonamiento matemático: GSM8K (97,0 %) y Minerva Math (94,8 %).
- Comprensión de documentos e imágenes: pipeline `image-text-to-text` con utilidad DocVQA del 95,8 %.
- Seguimiento de instrucciones conversacionales: 81,6 % de win rate bruto en AlpacaEval2.
- Flujos agénticos: utilidad benigna del 87,6 % en AgentDojo y 76,7 % en AgentDyn.
- Separación explícita de frontera de confianza mediante roles `user` (instrucción de confianza) e `input` (texto, documentos, retornos de herramientas o imágenes no confiables); el chat template incluido soporta esta separación.
- Soporte de tool calling y flujos multi-paso implícito en las evaluaciones agénticas (AgentDojo, AgentDyn, DTaP-Bench-Indirect).
- Capacidades multilingües limitadas al inglés según la model card.
- Modo thinking disponible en el modelo base pero desactivado en el entrenamiento y la evaluación reportados.

## Casos de uso

- Investigación en seguridad de LLM: sirve como baseline de referencia para comparar defensas frente a prompt injection indirecta, ya que el autor publica el modelo SecPO comparativo y el código en GitHub.
- Procesamiento de documentos con contenido no confiable: usando el rol `input` para el documento y `user` para la instrucción, el modelo mantiene una utilidad DocVQA del 95,8 % mientras reduce el secuestro de tareas por inyecciones estáticas.
- Agentes con retorno de herramientas externas: integrable en pipelines donde las respuestas de APIs o navegadores se marcan como no confiables, con utilidad agéntica del 87,6 % en AgentDojo.
- Evaluación de robustez en CI: el modelo puede actuar como sujeto de pruebas en suites de red-teaming (SEP Genetic, TAP, PISmith) para medir la eficacia real de una defensa antes de desplegarla.
- Atención al cliente con contexto largo: la ventana nativa de 262.144 tokens permite conversaciones multi-turno y adjuntar documentación extensa, aunque la defensa solo cubre inyecciones estáticas.
- Generación de código y matemáticas asistida: con GSM8K al 97,0 % y Minerva Math al 94,8 %, es adecuado para tareas de razonamiento cuantitativo donde el input del usuario se trata como de confianza.
- Análisis de imágenes en entornos controlados: al preservar el codificador de visión, puede emplearse en tareas image-text-to-text donde las imágenes se marcan explícitamente como no confiables.

## Benchmarks y rendimiento

Todas las cifras están en porcentaje y se midieron con thinking desactivado. La columna "Undefended" corresponde al Qwen3.6-27B sin defensa; "SecPO + offline AT" es el modelo comparativo del mismo autor.

| Categoría | Benchmark | Métrica | Undefended | Meta-SecAlign (este modelo) | SecPO + offline AT |
|---|---|---|---:|---:|---:|
| Conocimiento y razonamiento | MMLU-Pro | Puntuación | 84,8 | 83,9 | 84,6 |
| Conocimiento y razonamiento | GPQA Diamond | Puntuación | 81,3 | 79,3 | 80,8 |
| Matemáticas | GSM8K | Puntuación | 97,3 | 97,0 | 96,4 |
| Matemáticas | Minerva Math | Puntuación | 96,1 | 94,8 | 95,8 |
| Seguimiento de instrucciones | AlpacaEval2 | Win rate bruto | 80,6 | 81,6 | 82,9 |
| Seguimiento de instrucciones | SEP Utility | Win rate bruto | 93,0 | 93,9 | 94,3 |
| Flujo agéntico | AgentDojo Utility | Utilidad benigna | 89,7 | 87,6 | 90,7 |
| Flujo agéntico | AgentDyn Utility | Utilidad benigna | 71,7 | 76,7 | 71,7 |
| Flujo agéntico | DTaP-Bench-Indirect Utility | Utilidad bajo ataque | 65,8 | 70,0 | 74,5 |
| Comprensión de documentos | DocVQA Utility | Utilidad benigna | 96,0 | 95,8 | 95,2 |

Resultados de seguridad (ASR, menor es mejor):

| Ataque | Métrica | Meta-SecAlign (este modelo) |
|---|---|---:|
| SEP estático | ASR | 2,9 % (frente a 98,9 % sin defensa) |
| SEP Genetic | ASR@800 | 93,7 % |
| TAP | ASR@800 | 90,1 % |
| PISmith | ASR@10 | 94,0 % |
| AgentDojo Genetic | ASR@800 | 78,8 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 2 GPU de 48 GB o 4 de 24 GB con paralelismo de tensor.
- En cuantización de 8 bits: alrededor de 28-30 GB, viable en una A100 40 GB o H100 80 GB.
- En cuantización de 4 bits: alrededor de 15-17 GB, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque no se publican pesos GGUF ni cuantizados oficialmente.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB con cuantización; multi-GPU para BF16 sin cuantizar.
- Despliegue: compatible con `transformers` (librería declarada) y con endpoints compatibles según los tags; no se confirma soporte específico de vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Defensa prompt injection | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Instruct-MetaSecAlign (este) | 27,36B | 262.144 | DPO estático; ASR estático 2,9 %, adaptativo hasta 94,0 % | apache-2.0 | HuggingFace, 57 descargas |
| Qwen3.6-27B-Instruct-SecPO | 27,36B (base común) | 262.144 | Referencia limpia + entrenamiento adversarial offline; mejor utilidad y robustez | apache-2.0 | HuggingFace |
| Qwen/Qwen3.6-27B (base sin defensa) | 27,36B | 262.144 | Ninguna; ASR estático 98,9 % | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- La defensa solo es eficaz frente a inyecciones estáticas simuladas; los ataques adaptativos (SEP Genetic, TAP, PISmith, AgentDojo Genetic) alcanzan tasas de éxito del 78,8 % al 94,0 %, por lo que no debe considerarse una protección robusta en producción.
- No se realizó entrenamiento adversarial en este baseline, a diferencia del modelo SecPO comparativo.
- El modelo asume que la aplicación identifica la frontera de confianza antes de la inferencia; concatenar contenido controlado por el atacante en mensajes `system` o `user` anula la defensa.
- El único idioma declarado es el inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación inherente al modelo base, no mitigado por el ajuste DPO.
- Sesgos del dataset Cleaned-Alpaca y del corpus de entrenamiento original de Qwen3.6-27B, no documentados en la información disponible.
- El modo thinking está desactivado en el entrenamiento y la evaluación reportados; su comportamiento con thinking activado no está caracterizado.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre robustez en producción.
- El modelo tiene solo 57 descargas y 0 likes, lo que indica escasa validación comunitaria.
- No se publican pesos cuantizados ni GGUF oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo comparativo SecPO: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Paper Meta-SecAlign: https://arxiv.org/abs/2507.02735
- Código: https://github.com/Sizhe-Chen/SecPO
- Dataset Cleaned-Alpaca: https://github.com/gururise/AlpacaDataCleaned
- Manifiesto de fusión: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign/blob/main/merge_manifest.json
