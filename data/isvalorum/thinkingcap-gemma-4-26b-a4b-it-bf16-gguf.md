# IsValorum/ThinkingCap-gemma-4-26B-A4B-it-BF16-GGUF

## Resumen

ThinkingCap-gemma-4-26B-A4B-it es un modelo multimodal de tipo imagen-texto desarrollado por bottlecapai, construido sobre la arquitectura Gemma 4 y con un diseño de mezcla de expertos (MoE) que activa solo una fracción de sus parámetros por token. La variante aquí documentada es una conversión a GGUF en precisión BF16 realizada por IsValorum dentro de su serie APEX, pensada como archivo fuente canónico para recetas de cuantización posteriores. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión fiel del checkpoint oficial en safetensors.

El modelo totaliza 25.233.142.046 parámetros (aproximadamente 25,2 mil millones), con 128 expertos enrutados y un top-8 por capa, lo que da el sufijo A4B (unos 4 mil millones de parámetros activos estimados por token según la convención de nomenclatura). Incorpora 30 capas, de las cuales 25 usan atención de ventana deslizante con ventana de 1024 tokens y 5 son anclas de atención completa, además de una FFN densa compartida por capa. El contexto declarado alcanza los 262.144 tokens y el vocabulario también es de 262.144 entradas, con embeddings atados que funcionan además como cabeza de salida.

La relevancia de esta ficha radica en que la conversión BF16 sirve como referencia reproducible y auditable: cada tensor conserva la precisión del origen (BF16 o F32 para normas, escalas y routers), y se documenta el mapa tensor a tensor con hashes sha256 de entrada y salida. Es un artefacto orientado a usuarios avanzados que necesitan generar sus propias cuantizaciones o verificar la integridad del modelo base, no una distribución pensada para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer MoE con atención híbrida: 25 capas sliding-window + 5 anclas full-attention) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Top-8 de 128 expertos enrutados por capa más FFN densa compartida; aproximadamente 4B activos según nomenclatura A4B (no confirmado numéricamente en la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (esta conversión); F32 para normas, escalas y routers; cuantizaciones Q8_0 y otras disponibles en el repo oficial del autor base (no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16), 50.505.136.704 bytes; safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 30 capas con atención híbrida: 25 capas emplean ventana deslizante de 1024 tokens y 5 capas (índices 5, 11, 17, 23 y 29) actúan como anclas de atención completa sobre el contexto profundo. Cada capa combina 128 expertos enrutados con top-8, una puerta de enrutamiento fusionada con la proyección up y una FFN densa por capa que se activa en todos los tokens. La dimensión oculta es de 2.816, el vocabulario de 262.144 entradas y los embeddings están atados, de modo que `token_embd.weight` cumple también la función de cabeza de salida. Las normas, escalas y routers (`ffn_gate_inp`, `ffn_down_exps.scale`, `layer_output_scale`, `rope_freqs`) se mantienen en F32 para preservar la estabilidad numérica del checkpoint original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación en el modelo base. La conversión aquí descrita no modifica pesos, no fusiona tensores y no altera la arquitectura: se limita a transformar los safetensors oficiales (revisión `92b53c9b065d4710bbda9e5c84be751470386e7b`) al formato GGUF mediante `convert_hf_to_gguf.py` con arquitectura `gemma4`. El resultado contiene 658 tensores: 266 en BF16 y 392 en F32. No se incluyen tensores MTP ni borrador DSpark para esta familia.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque los tensores de visión no se incluyen en este repositorio y requieren el archivo `mmproj` del repo oficial.
- Razonamiento y matemáticas: el nombre "ThinkingCap" sugiere un modo de razonamiento explícito, aunque la información disponible no detalla su funcionamiento ni su formato de activación.
- Soporte de plantilla de chat propia (`chat_template.jinja`) para uso conversacional con `--jinja` en llama.cpp.
- Compatibilidad con endpoints y despliegue en llama.cpp (`llama-cli`, `llama-server`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no confirmado en la información disponible.

## Casos de uso

- Archivado y verificación de integridad del modelo base: el repositorio incluye hashes sha256 de entrada y salida y un mapa tensor a tensor (`tensor-map.tsv`), lo que permite auditar que una conversión GGUF reproduce fielmente el checkpoint original antes de cuantizar.
- Generación de cuantizaciones propias: al ser el maestro BF16 canónico de la serie APEX-I V2.1, sirve como punto de partida para producir Q8_0, Q6_K u otras variantes con recetas reproducibles y comparables entre sí.
- Investigación sobre arquitecturas MoE híbridas: la separación entre capas sliding-window y anclas full-attention, junto con el mapa de precisión por tensor, facilita estudiar el impacto de la cuantización selectiva en routers y expertos.
- Evaluación de modelos multimodales en local: combinado con el `mmproj` del repo oficial, permite probar tareas de imagen-texto en llama.cpp sin depender de servicios en la nube, útil para prototipado con datos sensibles.
- Procesamiento de documentos largos con contexto de 262.144 tokens: análisis de contratos, informes o bases de código extensas en un único prompt, aprovechando las capas de atención completa como anclas de contexto profundo.
- Desarrollo de pipelines de razonamiento asistido: el formato conversacional con plantilla Jinja y el posible modo de razonamiento permiten integrarlo en flujos de resolución de problemas paso a paso, siempre que se valide su comportamiento real.
- Reproducibilidad en entornos de investigación: al no haber modificación de pesos, los resultados obtenidos con este GGUF BF16 deberían coincidir con los del safetensors original dentro del margen numérico, lo que lo hace adecuado como referencia en experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor de la conversión indica explícitamente que los benchmarks del modelo base son autoinformados por sus autores y que no se reclama ninguna evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 50,5 GB solo para pesos, más overhead de contexto KV; se recomienda al menos 64 GB de VRAM para contexto moderado y bastante más para ventanas cercanas a 262.144 tokens.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU de 48 GB en adelante con sharding.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16; para esas tarjetas conviene usar las cuantizaciones Q8_0 o inferiores del repo oficial.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o interfaces basadas en llama.cpp; vLLM y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un MoE con top-8 sobre 128 expertos reduce el cómputo por token frente a un modelo denso de 25B, pero el cuello de botella en BF16 será el ancho de banda de memoria al cargar los expertos activos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-gemma-4-26B-A4B-it (BF16 GGUF) | 25,2B totales, top-8/128 expertos | 262.144 | Apache-2.0 | GGUF BF16 | Esta ficha; conversión de referencia |
| ThinkingCap-gemma-4-26B-A4B-it (safetensors) | 25,2B totales | 262.144 | Apache-2.0 | safetensors | Modelo base oficial de bottlecapai |
| ThinkingCap-gemma-4-26B-A4B-it-GGUF (cuantizado) | 25,2B totales | 262.144 | Apache-2.0 | GGUF Q8_0 y otros | Distribución práctica para la mayoría de usuarios, incluye `mmproj` |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Este repositorio es un archivo fuente no cuantizado de aproximadamente 50 GB; la mayoría de usuarios debería usar las versiones cuantizadas del repo oficial por motivos de VRAM y velocidad.
- Los tensores de visión no están incluidos; sin el archivo `mmproj-ThinkingCap-gemma-4-26B-A4B-it-f16.gguf` del repo oficial, el modelo no puede procesar imágenes pese a su pipeline declarado.
- No se incluyen tensores MTP ni borrador DSpark, por lo que no se puede aplicar decodificación especulativa con ese mecanismo en esta familia.
- Los benchmarks del modelo base son autoinformados por sus autores y no han sido verificados de forma independiente; no deben tomarse como garantía de rendimiento en producción.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe; se recomienda evaluar empíricamente antes de desplegar.
- El modo de razonamiento implícito en el nombre "ThinkingCap" no está documentado en la información disponible; su activación y formato deben validarse con la plantilla de chat incluida.
- La licencia Apache-2.0 permite uso comercial según la declaración del repo base, pero conviene revisar la model card del autor original por si añade condiciones adicionales.
- La fecha de creación del repositorio (2026-11-05) y el estado de la arquitectura Gemma 4 sugieren que se trata de un ecosistema reciente; la compatibilidad con herramientas de terceros puede ser limitada.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/IsValorum/ThinkingCap-gemma-4-26B-A4B-it-BF16-GGUF
- Modelo base en safetensors: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Repositorio GGUF oficial con cuantizaciones y `mmproj`: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it-GGUF
- Trabajo de conversión (job de Hugging Face): https://huggingface.co/jobs/IsValorum/6aed0ae2c78863f9c633afed
- Apoyo al autor de la conversión: https://ko-fi.com/isvalorum
