# Ibackup/DeepSeek-R1-Distill-Llama-8B

## Resumen

DeepSeek-R1-Distill-Llama-8B es un modelo de lenguaje denso de 8.030.261.248 parámetros (8,03 B) publicado por DeepSeek-AI como parte de la familia de destilados de DeepSeek-R1. Se construye fine-tuneando Llama-3.1-8B con datos de razonamiento (cadenas de pensamiento) generados por el modelo grande DeepSeek-R1, de modo que un modelo pequeño y desplegable en una sola GPU hereda parte de las capacidades de razonamiento del profesor. La ficha que nos ocupa (`Ibackup/DeepSeek-R1-Distill-Llama-8B`) es una réplica de terceros del checkpoint oficial, publicada con licencia MIT y pesos en safetensors (repositorio de 16,1 GB, coherente con pesos en BF16).

El problema que resuelve es el de llevar razonamiento multi-paso de estilo o1 a hardware asequible: el modelo genera cadenas de pensamiento largas antes de responder, lo que mejora resultados en matemáticas, código y razonamiento lógico frente a un instruct de 8 B convencional, a costa de una latencia y un consumo de tokens mucho mayores. Es relevante ahora porque demuestra que la destilación de datos de razonamiento de un modelo grande es una vía eficaz para obtener modelos pequeños competitivos, y porque su licencia MIT y su tamaño lo hacen apto para despliegue local, fine-tuning y experimentación académica.

Arquitectura transformer decoder-only densa estándar (la de Llama 3.1 8B, sin mezcla de expertos), con contexto heredado de 131.072 tokens. Al ser un mirror, la model card disponible está truncada y no incluye la tabla completa de descargas ni los resultados de evaluación del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (base Llama-3.1-8B) con destilación de datos de razonamiento de DeepSeek-R1 |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens heredados de Llama 3.1 (la model card del mirror trunca la tabla de especificaciones; dato no verificable en la información proporcionada) |
| Tipos de cuantización | No disponible en este repositorio: solo se publican pesos en safetensors BF16. Existen conversiones GGUF, AWQ y GPTQ de la comunidad para el checkpoint oficial |
| Idiomas soportados | No disponibles en la ficha del mirror; el modelo original está orientado principalmente a inglés y chino, con capacidad limitada en otros idiomas |
| Licencia | MIT |
| Formato de pesos | Safetensors (librería `transformers`); repositorio de 16,1 GB, pesos en BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso sin modificaciones estructurales respecto a Llama-3.1-8B: atención con RoPE, normalización RMSNorm y las capas estándar de la familia Llama 3. No incorpora mezcla de expertos, atención lineal ni arquitecturas híbridas SSM. La innovación no está en la arquitectura, sino en el proceso de entrenamiento: DeepSeek-AI generó datos de razonamiento con DeepSeek-R1 (cadenas de pensamiento largas, con auto-verificación y reflexión) y hizo supervised fine-tuning sobre ellos, sin un pipeline de RL específico para el modelo pequeño. La model card subraya que este enfoque de destilación supera a los patrones de razonamiento que se obtendrían aplicando RL directamente sobre modelos pequeños.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset de destilación, ni sobre si hubo etapas de RLHF o DPO posteriores en el modelo de 8 B; la model card del mirror no detalla esas cifras. En la familia R1, el modelo grande se entrenó con dos etapas de RL y dos de SFT (incluyendo datos de arranque en frío), pero ese pipeline no se aplica al destilado. El checkpoint se distribuye únicamente en safetensors a través de `transformers` y es compatible con text-generation-inference y con endpoints compatibles.

## Capacidades

- Generación de texto conversacional en inglés y chino principalmente, con calidad irregular en otros idiomas.
- Razonamiento multi-paso: produce cadenas de pensamiento explícitas antes de la respuesta final, incluyendo auto-verificación y backtracking.
- Matemáticas: resolución de problemas de competición y cálculo simbólico paso a paso, con respuestas finales habitualmente formateadas en `\boxed{}`.
- Código: generación, explicación y depuración de código, apoyada en razonamiento previo a la escritura.
- Razonamiento lógico y científico de opción múltiple (estilo GPQA).
- Contexto largo: al heredar la ventana de Llama 3.1, puede procesar documentos extensos y conversaciones multi-turno largas.
- Soporte de *tool calling* / *function calling*: no documentado; los destilados se entrenaron con datos de razonamiento, no con datos de herramientas, y la familia R1 no se caracteriza por soportarlo de forma fiable.
- Capacidades multimodales (visión, audio): no disponibles; es un modelo exclusivamente de texto.
- Modo *thinking*: implícito, no conmutable por API; el razonamiento se emite como texto dentro de la propia respuesta.

## Casos de uso

- Resolución de problemas matemáticos y verificación de resultados: el modelo escribe la cadena de razonamiento completa antes de dar la respuesta, lo que permite auditar cada paso; útil en plataformas educativas o de corrección automática que necesiten justificar la solución.
- Generación de código en pipelines offline: puede integrarse en un flujo de revisión previa al *commit* para proponer parches y explicar el razonamiento; requiere ejecución local con vLLM o llama.cpp, ya que no se documenta soporte de *tool calling*.
- Tutoría y explicaciones didácticas: su formato de razonamiento explícito encaja en asistentes de estudio que muestran el "cómo" y no solo el resultado, con contexto suficiente para arrastrar el temario de una sesión completa.
- Análisis de documentos largos: con una ventana de hasta 131.072 tokens, puede resumir contratos, artículos o informes extensos manteniendo coherencia entre secciones.
- Generación de datos sintéticos de razonamiento: sirve como modelo "profesor" barato para producir trazas de CoT con las que destilar o ajustar modelos aún más pequeños, un uso coherente con su propio origen.
- Despliegue on-premise con requisitos de privacidad: al caber en una GPU de 24 GB en cuantización de 4 bits, permite procesar datos sensibles sin salir de la infraestructura propia (sanidad, legal, administración pública).
- Evaluación y reproducción de experimentos académicos: su licencia MIT y su tamaño facilitan la réplica de resultados de razonamiento en grupos con presupuesto de cómputo limitado.
- Asistente de análisis de datos exploratorio: puede razonar sobre tablas y proponer transformaciones o hipótesis, siempre que el resultado se valide con ejecución real, dado el riesgo de alucinación en cifras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card accesible desde este mirror está truncada antes de la tabla de evaluación y la información de búsqueda no incluye cifras. La ficha oficial de DeepSeek-AI para este checkpoint reporta métricas en AIME 2024, MATH-500, GPQA Diamond, LiveCodeBench y Codeforces, pero sus valores no se recogen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,1 GB solo para pesos en BF16, más caché KV; en la práctica, 18-20 GB de VRAM para contextos cortos y bastante más para aprovechar los 131.072 tokens.
- Cuantización INT8/FP8: ~8,5-9 GB de VRAM, apto para GPU de 16 GB con contexto moderado.
- Cuantización INT4 (GGUF Q4_K_M): ~4,9-5,5 GB de VRAM, cabe en GPU de 8 GB con contexto reducido.
- GPU recomendadas: H100 80 GB, A100 40/80 GB, L40S 48 GB para servicio en BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto moderado; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4080 con cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en todas las tarjetas de 16 GB o más usando cuantización, y en 24 GB incluso en BF16 con contexto limitado.
- Opciones de despliegue: vLLM, SGLang, TGI, llama.cpp, Ollama, TensorRT-LLM y NVIDIA NIM (existe una build específica de este modelo en build.nvidia.com).
- Latencia y throughput: no disponibles como dato medido. Cualitativamente, la generación de cadenas de pensamiento largas multiplica el número de tokens de salida (a menudo varios miles por consulta), por lo que la latencia percibida es muy superior a la de un instruct de 8 B que responda en una sola pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (este mirror) | 8,03 B (denso) | 131.072 tokens (heredado de Llama 3.1) | MIT | Safetensors en HF; réplica de terceros con 0 descargas | No disponible en la información aportada |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B (denso) | 131.072 tokens (familia R1-Distill) | MIT | Safetensors en HF, repositorio oficial de DeepSeek-AI | No disponible |
| DeepSeek-R1-Distill-Qwen-14B | ~14,8 B (denso) | 131.072 tokens (familia R1-Distill) | MIT | Safetensors en HF, repositorio oficial | No disponible |
| Llama-3.1-8B-Instruct | 8,03 B (denso) | 131.072 tokens | Llama 3.1 Community License | Safetensors en HF, amplio ecosistema | No disponible |

La diferencia práctica frente a Llama-3.1-8B-Instruct es el modo de respuesta: el destilado antepone una cadena de razonamiento, lo que generalmente mejora matemáticas y código a cambio de latencia y verbosidad. Frente a los destilados Qwen de DeepSeek, la elección suele depender del ecosistema de herramientas (Llama frente a Qwen) y del presupuesto de VRAM; no se dispone de cifras para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinación: una cadena de razonamiento coherente no garantiza una respuesta correcta; el modelo puede justificar con detalle un resultado falso, especialmente en datos factuales y cifras.
- Mezcla de idiomas y repeticiones: la familia R1 documenta problemas de mezcla de idiomas y bucles de repetición, herencia del entrenamiento con RL de R1-Zero; en español la calidad es inferior a la del inglés.
- Sesgos: no documentados en la ficha del mirror; el modelo hereda los sesgos de Llama-3.1-8B y de los datos de destilación generados por DeepSeek-R1.
- Sin soporte fiable de *system prompt*: la documentación oficial de la familia R1 recomienda incluir todas las instrucciones en el mensaje de usuario y configurar temperatura en torno a 0,5-0,7 y `top_p` 0,95; ignorar esto degrada la calidad.
- Verbosidad y coste: cada consulta puede consumir miles de tokens de salida, lo que encarece el servicio y complica el streaming y el control de timeouts.
- Contexto: aunque la ventana teórica es de 131.072 tokens, el rendimiento efectivo en contextos muy largos no está verificado en esta información y la caché KV crece de forma notable.
- Licencia: el checkpoint se distribuye como MIT, pero deriva de Llama-3.1-8B, cuyos pesos originales están bajo la Llama 3.1 Community License; conviene revisar las obligaciones de atribución y las políticas de uso del nombre "Llama" antes de un despliegue comercial.
- Repositorio no verificado: `Ibackup/DeepSeek-R1-Distill-Llama-8B` es una réplica de terceros con 0 descargas y 0 likes, creada con una fecha anómala (2026-10-24). No hay garantía de integridad de los pesos; para producción debe usarse el repositorio oficial `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` y verificar los hashes.
- Sin capacidades de herramientas ni multimodalidad: no se debe diseñar un agente que dependa de *function calling* o de entrada de imágenes sin validación previa.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/Ibackup/DeepSeek-R1-Distill-Llama-8B
- Repositorio oficial del modelo: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- README oficial (versión concreta): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B/blob/81cee02dd020268dced5fa1327e8555acce9c63c/README.md
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- PDF del paper referenciado en la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia en GitHub: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- NVIDIA NIM (build del modelo): https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-llama-8b
- ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B/summary
- Ficha en featherless.ai: https://featherless.ai/models/Iambackup/DeepSeek-R1-Distill-Llama-8B
- Organización DeepSeek-AI en HuggingFace: https://huggingface.co/deepseek-ai
- Chat de DeepSeek: https://chat.deepseek.com/
- Web oficial: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
