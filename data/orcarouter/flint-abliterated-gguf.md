# orcarouter/Flint-abliterated-GGUF

## Resumen

Flint-abliterated-GGUF es una compilación en formato GGUF del modelo RecursiveSI/flint, un transformer de tipo Mixture of Experts (MoE) con 39.785 millones de parámetros totales y aproximadamente 2.500 millones activos por token, desarrollado originalmente por Recursive y redistribuido por orcarouter. La variante "abliterated" implica que se ha eliminado una dirección de rechazo de los pesos BF16 antes de la cuantización, de modo que la tasa de rechazo ante peticiones dañinas cae del 86 % a cerca del 10 %, manteniendo la capacidad general dentro del ruido estadístico.

El modelo está orientado a agentes de código y razonamiento, con 256 expertos enrutados (top-6) más un experto compartido, atención híbrida de ventana deslizante y atención completa con attention sinks aprendidos, y una ventana de contexto de 262.144 tokens. Se distribuye en dos builds GGUF de precisión mixta (Mix-12G de 11,99 GB y Mix-24G de 23,99 GB) que emplean compensación de error estilo GPTQ para redondear cada tensor a tipos estándar de llama.cpp, sin necesidad de kernels personalizados.

Su relevancia actual radica en que permite ejecutar localmente un MoE de casi 40.000 millones de parámetros en una GPU de consumo de 16 GB o 32 GB, con una fidelidad declarada frente al BF16 de 96,5 % de coincidencia en el siguiente token y solo un 1,1 % de aumento de perplejidad en el build de 24 GB. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial, aunque la eliminación de los rechazos exige capas de moderación propias en cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (ventana deslizante + atención completa con attention sinks aprendidos) |
| Parametros totales | 39.785.287.456 |
| Parametros activos | Aproximadamente 2.500 millones por token (256 expertos enrutados, top-6, más 1 experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF de precisión mixta: Mix-12G (2,27 bpw medios en expertos) y Mix-24G (4,65 bpw medios en expertos); cuantización con imatrix y compensación de error estilo GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 256 expertos enrutados y selección top-6, más un experto compartido, lo que resulta en unos 2.500 millones de parámetros activos por token sobre un total de 39.785 millones. La atención es híbrida: 35 capas emplean ventana deslizante con 513 tokens de retención y 14 capas mantienen atención completa con attention sinks aprendidos, lo que reduce drásticamente el coste de la caché KV. En F16, la caché ocupa aproximadamente 28 KB por token en las capas de atención completa, de modo que 64K tokens requieren unos 1,9 GB y 128K tokens unos 3,7 GB.

La variante abliterated se generó eliminando una dirección de rechazo calculada sobre los pesos BF16 antes de la cuantización. Los expertos enrutados concentran el 95 % de los pesos, por lo que la asignación de bits se realizó por grupos de capas de expertos según la divergencia KL medida, y cada tensor se redondeó con compensación de error estilo GPTQ hacia tipos estándar de llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Generación y edición de código, con etiquetas explícitas de "coding" y "agentic" en la model card.
- Razonamiento orientado a agentes y flujos de múltiples pasos.
- Soporte declarado de tool calling / function calling (etiqueta "agentic" y compatibilidad con endpoints).
- Capacidades multilingües limitadas a inglés y chino.
- Modo "uncensored": la alineación de seguridad se ha reducido sustancialmente, por lo que acepta peticiones que el Flint original rechazaría.
- Contexto largo de hasta 262.144 tokens, con caché KV reducida gracias a la atención híbrida.

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: el modelo permite estudiar cómo se representa la negativa a responder y qué ocurre al eliminar una dirección de rechazo, comparando las respuestas con el Flint original.
- Red teaming y evaluación de robustez: sirve para generar intentos adversarios y prompts dañinos controlados en entornos de laboratorio, con la ventaja de que el modelo no bloquea la generación, lo que facilita construir conjuntos de datos de ataques.
- Agente de código local en estaciones de trabajo: con el build Mix-24G en una GPU de 32 GB, se puede desplegar un agente que edite repositorios, ejecute herramientas y mantenga contexto de hasta 64K tokens con una caché KV de solo 1,9 GB.
- Asistente de programación en equipos con GPU de 16 GB: el build Mix-12G permite ejecutar el modelo en tarjetas de consumo, aceptando un aumento de perplejidad del 20 % a cambio de caber en memoria.
- Análisis de documentos largos en inglés o chino: la ventana de 262K tokens permite procesar informes extensos o bases de código completas en una sola pasada, con un coste de caché manejable.
- Evaluación comparativa de cuantizaciones: los dos builds publicados, con métricas de KLD, top-1 y perplejidad frente al BF16, sirven como referencia para estudiar el impacto de la precisión mixta en modelos MoE.
- Despliegue en pipelines de CI/CD para generación de pruebas: mediante llama.cpp y una API compatible con OpenAI, el modelo puede integrarse en flujos automatizados de revisión y generación de código, siempre con capas de moderación adicionales.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Sí incluye métricas de fidelidad de las cuantizaciones frente al BF16 del que se obtuvieron, evaluadas con la divergencia KL de vocabulario completo de llama.cpp sobre respuestas del propio Flint:

| Build | Tamano | Bits por peso en expertos | KLD ↓ | Top-1 ↑ | Perplejidad vs. BF16 |
|---|---:|---:|---:|---:|---:|
| Mix-12G | 11,99 GB | 2,27 bpw | 0,2023 | 88,1 % | +20,0 % |
| Mix-24G | 23,99 GB | 4,65 bpw | 0,0186 | 96,5 % | +1,1 % |

Según el autor, con un tamaño de archivo similar los builds igualan a los ficheros UD de unsloth: Mix-24G obtiene un KLD ligeramente inferior a UD-Q4_K_XL siendo 1,1 GB más pequeño, y Mix-12G se sitúa entre UD-IQ1_M y UD-IQ2_XXS. No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Mix-12G requiere aproximadamente 12 GB para los pesos, apto para GPU de 16 GB; Mix-24G requiere aproximadamente 24 GB, apto para GPU de 32 GB con espacio para contexto largo.
- Caché KV: unos 28 KB por token en F16 en las 14 capas de atención completa, más 513 tokens por capa en las 35 capas de ventana deslizante; 64K tokens de contexto ocupan unos 1,9 GB y 128K unos 3,7 GB.
- GPU recomendadas: RTX 4090, RTX 5090 o A100 40 GB para Mix-24G; RTX 4080, RTX 4070 Ti Super o similares de 16 GB para Mix-12G; H100 para despliegues con contexto máximo y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con Mix-12G y de 32 GB con Mix-24G.
- Opciones de despliegue: llama.cpp es el runtime de referencia, ya que los builds usan tipos estándar sin kernels personalizados; también es compatible con servidores compatibles con la API de OpenAI a través de llama.cpp y con el gateway OrcaRouter.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---:|---|---|---|
| Flint-abliterated-GGUF (Mix-24G) | 39,8 B | ~2,5 B | 262K | Apache 2.0 | GGUF | KLD 0,0186; 96,5 % top-1 frente a BF16 |
| Flint-abliterated-GGUF (Mix-12G) | 39,8 B | ~2,5 B | 262K | Apache 2.0 | GGUF | KLD 0,2023; 88,1 % top-1 frente a BF16 |
| RecursiveSI/flint (BF16) | 39,8 B | ~2,5 B | 262K | Apache 2.0 | safetensors | Modelo base con alineación de seguridad intacta |
| Ficheros UD de unsloth (mismo tamano) | no disponible | no disponible | no disponible | no disponible | GGUF | Referencia de comparación citada por el autor; Mix-24G con KLD inferior a UD-Q4_K_XL y 1,1 GB más pequeño |

No se dispone de datos de benchmarks de capacidad que permitan comparar el rendimiento en tareas con modelos de la misma categoría.

## Limitaciones y advertencias

- La alineación de seguridad está sustancialmente reducida: el modelo cumplirá muchas peticiones dañinas, poco éticas, ofensivas o ilegales que el Flint original rechazaría. La tasa de rechazo baja del 86 % al 10 % aproximadamente.
- El autor lo libera estrictamente para investigación legítima: interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red teaming y evaluación de robustez.
- El usuario asume toda la responsabilidad sobre el uso y las salidas generadas; es obligatorio añadir capas propias de seguridad, moderación y prevención de abuso antes de cualquier despliegue.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación en la información disponible.
- Cobertura idiomática limitada a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- El build Mix-12G degrada la calidad de forma notable: 20 % más de perplejidad y solo 88,1 % de coincidencia en el siguiente token frente al BF16.
- La licencia Apache 2.0 permite uso comercial, pero debe cumplirse la ley aplicable y la licencia heredada del modelo base; los autores no aceptan responsabilidad por mal uso.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Flint-abliterated-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- OrcaRouter: https://www.orcarouter.ai
- OrcaRouter, listado de modelos: https://www.orcarouter.ai/models
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- Perfil en X: https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
