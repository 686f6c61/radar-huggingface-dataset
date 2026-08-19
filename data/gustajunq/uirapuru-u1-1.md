# gustajunq/Uirapuru-U1.1

## Resumen

Uirapuru-U1.1 es un modelo de lenguaje causal de 9.000 millones de parámetros publicado en Hugging Face por el usuario gustajunq. Aunque el repositorio se denomina Uirapuru-U1.1, la model card interna lo identifica como Qwen3.8-9B, un desarrollo del laboratorio Empero. Se trata de una destilación de parámetros completos del modelo profesor Qwen3.8 2.4T A95B (un modelo de escala frontera con arquitectura de mezcla de expertos) sobre la arquitectura densa Qwen3.5-9B de Alibaba. El objetivo declarado es trasladar el comportamiento de razonamiento de un modelo de gran escala a un modelo de 9B que pueda desplegarse en una única GPU.

El entrenamiento consistió en un ajuste fino supervisado (SFT) off-policy sobre aproximadamente 70.000 trazas de profesor curadas, que incluyen cadenas de razonamiento densas en matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas. El modelo hereda la ventana de contexto nativa de 262.144 tokens de Qwen3.5-9B y soporta function calling de forma nativa según la especificación Qwen3.5. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Cabe señalar que el repositorio de Hugging Face muestra un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos podrían no estar disponibles públicamente en ese espacio o que la publicación está incompleta. La model card describe el modelo como texto puro (la ruta de texto de una base vision-language), aunque el tag `image-text-to-text` aparece en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer causal con capas de atención lineal Gated DeltaNet y convolución causal) |
| Parametros totales | 9B |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-9B, que combina capas de atención tradicional con capas de atención lineal basadas en Gated DeltaNet. Esta arquitectura híbrida reduce el coste cuadrático de la atención en secuencias largas, permitiendo la ventana de contexto de 262.144 tokens. Para la inferencia eficiente se requieren los kernels de `flash-linear-attention` y `causal_conv1d`, de lo contrario las capas lineales caen en operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento fue un ajuste fino supervisado de parámetros completos (no un adapter) sobre ~70.000 trazas de profesor generadas por Qwen3.8 2.4T A95B, un modelo de mezcla de expertos de escala frontera. Las trazas fueron filtradas por calidad y ponderadas hacia matemáticas avanzadas y programación competitiva, los dominios donde la destilación aporta mayor ganancia a esta escala. No se utilizó aprendizaje por refuerzo (RLHF/DPO); el modelo aprendió únicamente de las trazas del profesor, por lo que hereda su estilo de razonamiento, incluida la tendencia a deliberar en exceso en preguntas sencillas.

## Capacidades

- Generación de texto con razonamiento encadenado (chain-of-thought): cada respuesta comienza con un bloque `thinking` aprendido de las trazas del profesor.
- Razonamiento matemático y resolución de problemas numéricos, con especial énfasis en problemas tipo GSM8K.
- Generación de código y razonamiento algorítmico, orientado a programación competitiva.
- Function calling nativo según la especificación Qwen3.5, sin necesidad de ajustes adicionales ni wrappers.
- Seguimiento de instrucciones y conversación multi-turno.
- Ventana de contexto larga de 262.144 tokens, útil para documentos extensos o historiales de conversación largos.
- Capacidades multilingües: no declaradas; la model card solo lista inglés como idioma soportado.
- Capacidades de visión: el modelo base Qwen3.5-9B es vision-language, pero el ajuste fino fue solo de texto y el comportamiento visual no fue evaluado por los autores.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262.144 tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su function calling nativo facilita la integración con APIs de CRM o bases de conocimiento.
- Generación de código en producción: gracias a su entrenamiento en programación competitiva y su soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar funciones. El razonamiento encadenado ayuda a explicar el código generado.
- Tutoría y resolución de problemas matemáticos: el modelo produce cadenas de razonamiento detalladas, adecuadas para plataformas educativas que necesitan explicar el proceso de resolución paso a paso.
- Agentes autónomos con herramientas: su function calling nativo y su capacidad de razonamiento multi-paso permiten construir agentes que consultan APIs, ejecutan comandos o navegan por bases de datos de forma autónoma.
- Análisis de documentos largos: con 262.144 tokens de contexto, puede procesar informes extensos, contratos o artículos científicos completos en una sola pasada, extrayendo información y resumiendo.
- Investigación en destilación de modelos: sirve como caso de estudio para evaluar cómo las trazas de un modelo de 262B (activos) pueden transferir capacidades de razonamiento a un modelo denso de 9B, útil para investigadores que trabajan en eficiencia de modelos.

## Benchmarks y rendimiento

Los autores evaluaron el modelo con `lm-evaluation-harness` usando protocolos de cadena de pensamiento (`gsm8k_cot` y `mmlu_flan_cot_zeroshot`). Los resultados se comparan con el modelo base Qwen3.5-9B:

| Tarea | Métrica | Qwen3.5-9B (base) | Qwen3.8-9B (Uirapuru-U1.1) | Δ |
|---|---|---|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.885 | 0.870 | −0.015 |
| gsm8k_cot | exact_match (strict) | 0.875 | 0.850 | −0.025 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.546 | 0.751 | +0.205 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.251 | 0.511 | +0.260 |

El modelo mejora sustancialmente en MMLU (57 materias, ~1.700 preguntas), con un incremento de +20,5 puntos en la métrica flexible y +26 puntos en la estricta. En GSM8K, sin embargo, el rendimiento es ligeramente inferior al base (−1,5 y −2,5 puntos respectivamente). Los parámetros de muestreo utilizados fueron `temperature=0.6, top_p=0.95, top_k=20`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9B parámetros en bf16 se necesitan aproximadamente 18 GB de VRAM. Con cuantización int8 (~9 GB) o int4 (~4,5 GB) podría ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) o RTX 4060 Ti (16 GB) en bf16.
- GPU recomendadas: A100 40/80 GB, H100, o RTX 4090 para despliegue sin cuantización. Para cuantización int4, una RTX 3060 de 12 GB podría ser suficiente.
- Opciones de despliegue: compatible con Hugging Face Transformers (requiere versión reciente con soporte Qwen3.5), vLLM, SGLang y otros runtimes que soporten la arquitectura Qwen3.5. También es posible usar llama.cpp si se convierte a GGUF, aunque no se menciona explícitamente.
- Latencia y throughput: no disponibles. La arquitectura híbrida con atención lineal debería ofrecer mejor escalado en secuencias largas que un transformer denso puro, pero no hay mediciones publicadas.
- Requisito crítico: se necesitan los kernels `flash-linear-attention` y `causal_conv1d` compilados para CUDA; sin ellos, las capas de atención lineal usan operaciones PyTorch lentas y con alto consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU (CoT flexible) | GSM8K (CoT flexible) |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262.144 | Apache-2.0 | 0.546 | 0.885 |
| **Uirapuru-U1.1 (Qwen3.8-9B)** | 9B | 262.144 | Apache-2.0 | 0.751 | 0.870 |
| Llama-3.1-8B (referencia) | 8B | 128.000 | Llama 3.1 | no disponible | no disponible |
| Mistral-7B v0.3 (referencia) | 7B | 32.000 | Apache-2.0 | no disponible | no disponible |

No se dispone de resultados de benchmarks para los modelos de referencia en las mismas condiciones de evaluación, por lo que la comparación directa con alternativas de tamaño similar no es posible con los datos proporcionados. La comparación más relevante es con su propio modelo base, que muestra la ganancia en MMLU y la ligera pérdida en GSM8K.

## Limitaciones y advertencias

- El repositorio de Hugging Face muestra un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos podrían no estar subidos o que la publicación está incompleta. Verificar antes de intentar descargar.
- Solo se declara soporte para inglés; no hay evidencia de capacidades multilingües, aunque el modelo base Qwen3.5-9B podría ser multilingüe.
- El ajuste fino fue solo de texto; las capacidades de visión del modelo base no fueron evaluadas y podrían degradarse o comportarse de forma impredecible.
- El modelo hereda el estilo de razonamiento del profesor, incluyendo deliberación excesiva en preguntas sencillas, lo que puede generar respuestas innecesariamente largas y aumentar la latencia.
- La decodificación greedy en generaciones largas puede caer en bucles de repetición; se recomienda usar muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- Al ser una destilación de trazas y no un modelo entrenado con RLHF, puede presentar alucinaciones en dominios no cubiertos por las trazas de entrenamiento.
- Se requiere una versión reciente de `transformers` con soporte Qwen3.5 y kernels CUDA específicos; sin ellos, la inferencia es significativamente más lenta y consume más memoria.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "as-is" sin garantías; los autores no proporcionan soporte oficial.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/gustajunq/Uirapuru-U1.1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio de Empero (desarrolladores): https://empero.org
- Repositorio de kernels flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio de causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
- Herramienta de evaluación lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Framework de entrenamiento TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
