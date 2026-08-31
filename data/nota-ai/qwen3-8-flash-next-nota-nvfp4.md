# nota-ai/Qwen3.8-Flash-Next-Nota-NVFP4

## Resumen

El modelo **Qwen3.8-Flash-Next-Nota-NVFP4** es una versión cuantizada en NVFP4 (4-bit float, W4A4) del modelo multimodal **Qwen3.8-Flash-Next** de Qwen, desarrollada por el equipo de **nota-ai**. Se trata de un Mixture-of-Experts (MoE) de aproximadamente 180.000 millones de parámetros totales, de los cuales solo se activan unos 7.000 millones por token, lo que lo convierte en un modelo ultra-esparso pensado para despliegue eficiente en entornos de producción.

La cuantización NVFP4 reduce el peso del checkpoint de 335,3 GiB a 173,6 GiB (una reducción del 51,8 %), manteniendo intacta la ventana de contexto nativa de 262.144 tokens y preservando la decodificación especulativa MTP (multi-token prediction) y el pathway PLE (N-gram embedding). Esta versión está diseñada específicamente para servirse con vLLM sobre hardware NVIDIA Blackwell, aprovechando los tensor cores FP4 de las arquitecturas B200, B300, GB200 y RTX PRO 6000.

La relevancia de este lanzamiento radica en que permite servir un modelo de 180B con capacidades multimodales y razonamiento en tan solo dos GPUs Blackwell de 96 GB, cuando la versión BF16 original requiere cuatro o más. Es una de las primeras implementaciones públicas de cuantización NVFP4 aplicada a la arquitectura híbrida GDN + QSA que servirá de base para Qwen4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Qwen Sparse Attention), 48 capas MoE, 512 expertos por capa |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | ~7B por token (6B según la documentación oficial de Qwen; la model card de nota-ai indica ~7B) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con YaRN |
| Tipos de cuantizacion | NVFP4 (W4A4, group_size=16, formato `nvfp4-pack-quantized`); solo los expertos enrutados están cuantizados, el resto permanece en BF16 |
| Idiomas soportados | Inglés (en), chino (zh), coreano (ko) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, uso comercial permitido con condiciones) |
| Formato de pesos | safetensors (compressed-tensors NVFP4) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next combina dos mecanismos de atención complementarios. Tres de cada cuatro capas utilizan **Gated DeltaNet** (GDN), una atención lineal con compresión de historial que reduce el coste computacional en contextos largos, mientras que la cuarta capa emplea **Qwen Sparse Attention** (QSA), diseñada para recuperación precisa de información a larga distancia. Esta hibridación permite manejar los 262.144 tokens de contexto con un coste subcuadrático.

El modelo incorpora además un **PLE N-gram embedding** de 51.230 millones de parámetros (una tabla de lookup de trigramas hasheados de 320.001.536 × 160), que representa el 28,5 % de los parámetros totales pero con coste computacional casi nulo por parámetro. Este componente se mantiene en BF16 en la versión cuantizada, ya que al ser una tabla leída y no multiplicada, su cuantización no aportaría ganancia de velocidad.

La cuantización NVFP4 de nota-ai se aplica únicamente a los 73.728 módulos de expertos enrutados (512 expertos × 48 capas × 3 proyecciones), que representan el 67,1 % de los parámetros y el 84,2 % de los bytes del checkpoint BF16. Las capas de atención, routers, expertos compartidos, el bloque MTP, la torre de visión y las embeddings permanecen en BF16 para preservar la precisión en rutas críticas. La calibración se realizó con 512 conversaciones de exactamente 4.096 tokens, con un 65,6 % de muestras con trazas de razonamiento y un 38,9 % con turnos de tool calling, cubriendo agentes, código, STEM y contenido en coreano.

## Capacidades

- **Generación de texto multimodal**: acepta entradas de imagen y vídeo además de texto, gracias a la torre de visión integrada.
- **Razonamiento con thinking mode**: mantiene bloques de pensamiento a lo largo de la conversación (preserved thinking), lo que garantiza consistencia en escenarios de agente multi-turno.
- **Tool calling y function calling**: soporte nativo de llamadas a herramientas mediante los tokens `<tool_call>` y `<tool_response>`.
- **Agentes y razonamiento multi-paso**: la arquitectura híbrida de atención y el contexto de 262K tokens permiten trayectorias de agente largas y complejas.
- **Decodificación especulativa MTP**: el bloque multi-token-prediction se conserva en BF16, acelerando la generación.
- **Capacidades multilingües**: inglés, chino y coreano, con calibración específica para coreano en agentes, razonamiento y código.
- **Contexto ultra-largo**: 262.144 tokens nativos, extensible a 1M con YaRN, adecuado para documentos extensos y conversaciones prolongadas.

## Casos de uso

- **Agentes de software (SWE agents)**: el modelo puede ejecutar trayectorias completas de edición de código, ejecución de comandos y verificación de tests gracias a su soporte de tool calling y su ventana de contexto de 262K tokens, que permite mantener el historial completo del repositorio.
- **Atención al cliente multilingüe**: con soporte de inglés, chino y coreano, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el razonamiento preservado para decisiones consistentes a lo largo de la interacción.
- **Análisis de documentos extensos**: la ventana de 262K tokens permite procesar informes financieros, expedientes legales o papers científicos completos en una sola pasada, con recuperación precisa de información mediante QSA.
- **Razonamiento STEM y resolución de problemas**: el modelo está calibrado con un 5,86 % de datos STEM y un 4,69 % de razonamiento, lo que lo hace adecuado para tutoría, resolución de problemas matemáticos y verificación de demostraciones.
- **Generación de código en producción**: con soporte de agentes terminales y un 7,03 % de datos de código en calibración, puede integrarse en pipelines de CI/CD para generación, revisión y refactorización de código.
- **Asistentes de investigación multimodal**: al aceptar imágenes y vídeo, puede analizar figuras, diagramas y capturas de pantalla junto con texto, facilitando la revisión de literatura científica o documentación técnica.
- **Despliegue en entornos con recursos limitados**: al caber en dos GPUs Blackwell de 96 GB, es viable para empresas que necesitan un modelo de 180B sin adquirir un clúster de datacenter completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de nota-ai no incluye métricas comparativas (MMLU, HumanEval, GSM8K, etc.) frente al modelo base o a otras cuantizaciones. Tampoco se proporcionan mediciones de latencia o throughput específicas para esta versión NVFP4. Los únicos datos de rendimiento disponibles son las cifras de reducción de memoria (335,3 GiB → 173,6 GiB) y las configuraciones de despliegue mínimo (2 GPUs RTX PRO 6000 con PLE en host memory).

## Requisitos de hardware

- **VRAM estimada**: 173,6 GiB en NVFP4 (frente a 335,3 GiB en BF16). Con el PLE N-gram embedding (95,4 GiB) descargado a memoria host, el modelo cabe en 2 GPUs de 96 GB.
- **GPU recomendadas**: NVIDIA Blackwell exclusivamente — B200, B300, GB200 (datacenter, sm100/sm103) y RTX PRO 6000 / GB202 (workstation, sm120). No es compatible con Hopper, Ada o Ampere por requerir tensor cores FP4.
- **Configuraciones de despliegue**:
  - RTX PRO 6000 con PLE en memoria host: 2 tarjetas.
  - RTX PRO 6000 con PLE residente en GPU: 4 tarjetas.
  - B200 con PLE residente en GPU: 2 tarjetas.
- **Opciones de despliegue**: vLLM compilado con soporte qwen4_exp (imagen `vllm/vllm-openai:qwen38-flash-next` o posterior) y flashinfer >= 0.6.17. Es obligatorio fijar el backend MoE con `--moe-backend flashinfer_cutlass` (datacenter) o `--moe-backend marlin` (RTX PRO 6000), ya que la selección automática `FLASHINFER_TRTLLM` corrompe silenciosamente la decodificación.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Hardware requerido | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base BF16) | 180B (125B + 51B PLE) | 262.144 (1M con YaRN) | BF16 (335 GiB) | 4-8 GPUs datacenter | qwen-community-1.0 |
| nota-ai/Qwen3.8-Flash-Next-Nota-NVFP4 | 180B | 262.144 | NVFP4 W4A4 (173,6 GiB) | 2-4 GPUs Blackwell | qwen-community-1.0 |
| primitive-ai/Qwen3.8-Flash-Next-NVFP4 | 180B | 262.144 | NVFP4 (88,8 GiB VRAM, PLE en host RAM) | 1 GPU Blackwell de 96 GB | qwen-community-1.0 |

La versión de nota-ai se diferencia de la de primitive-ai en que esta última logra servir el modelo en una sola GPU de 96 GB, mientras que nota-ai requiere dos tarjetas en la configuración mínima documentada. Sin embargo, nota-ai documenta explícitamente el problema del backend MoE y proporciona instrucciones de despliegue validadas.

## Limitaciones y advertencias

- **Hardware exclusivo Blackwell**: el modelo no puede ejecutarse en GPUs anteriores a Blackwell (Hopper, Ada, Ampere) debido a la dependencia de los tensor cores FP4. Esto limita su despliegue a hardware muy reciente y de alta gama.
- **Bug crítico en la selección automática del backend MoE**: vLLM selecciona por defecto `FLASHINFER_TRTLLM`, que corrompe silenciosamente la decodificación (el modelo genera un token repetido tras responder HTTP 200). Es imprescindible fijar manualmente el backend con los flags indicados.
- **Idiomas limitados**: el modelo solo soporta inglés, chino y coreano. No hay soporte declarado para español, francés, alemán u otros idiomas, lo que restringe su uso en entornos multilingües amplios.
- **Riesgo de alucinación**: al ser un modelo de razonamiento extenso, puede generar trazas de pensamiento plausibles pero incorrectas, especialmente en dominios fuera de sus datos de calibración.
- **Restricciones de licencia**: la licencia qwen-community-1.0 permite uso comercial pero impone condiciones específicas (atribución, prohibición de uso para ciertos fines). Es recomendable revisar el texto completo de la licencia antes de desplegar en producción.
- **PLE N-gram embedding en memoria host**: en la configuración de 2 GPUs, la tabla de 51B parámetros vive en RAM del sistema, lo que introduce latencia adicional en el acceso a esta componente y puede convertirse en un cuello de botella en cargas de trabajo intensivas.
- **Dependencia de versiones específicas**: requiere vLLM compilado con soporte qwen4_exp y flashinfer >= 0.6.17, lo que limita la portabilidad a entornos con versiones más antiguas o distribuciones estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nota-ai/Qwen3.8-Flash-Next-Nota-NVFP4
- Modelo base Qwen/Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Referencia alternativa NVFP4 (primitive-ai): https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Anuncio de NVIDIA sobre Qwen3.8-Flash-Next: https://forums.developer.nvidia.com/t/qwen3-8-flash-next-176b-now-available/381413
