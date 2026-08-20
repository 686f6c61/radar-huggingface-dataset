# kancilbersayap/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una versión abliterada (refusal-removed) del modelo Qwen3.8-27B de Qwen, cuantizada al formato MLX para Apple Silicon. La publica el usuario kancilbersayap, en colaboración con la plataforma OrcaRouter, como parte de su catálogo de modelos. El modelo base es un modelo denso con atención híbrida (Gated DeltaNet lineal + atención completa), con capacidades de visión-lenguaje, tool-calling, razonamiento con control de pensamiento y una cabeza MTP (multi-token prediction). Su propósito declarado es la investigación en seguridad de IA, interpretabilidad y red-teaming, al eliminar la dirección de refusal del modelo original.

El modelo se ofrece en cuantizaciones de 2, 4, 6 y 8 bits, manteniendo la torre de visión, las normas y las capas convolucionales en BF16; solo se cuantizan los pesos lineales del modelo de lenguaje. La ventana de contexto alcanza los 262K tokens. Aunque el nombre indica 27B de parámetros, el archivo safetensors muestra 4.665.462.000 pesos, una discrepancia que conviene verificar antes de su uso. Su relevancia radica en permitir estudiar el comportamiento de un modelo sin guardrails de seguridad, así como evaluar sistemas de moderación y mecanismos de refusal en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso con atencion hibrida (Gated DeltaNet lineal + full attention), vision-language y cabeza MTP |
| Parametros totales | 4.665.462.000 (segun safetensors; el nombre indica 27B, discrepancia a verificar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 2-bit, 4-bit, 6-bit, 8-bit (MLX, affine, group size 64) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso con una arquitectura de atencion hibrida que combina Gated DeltaNet (atencion lineal) con atencion completa. Esto le permite manejar secuencias de hasta 262K tokens de forma eficiente. Ademas, incluye una cabeza MTP (multi-token prediction) para acelerar la decodificacion. El modelo procesa imagenes y texto (pipeline image-text-to-text). La version abliterada se obtiene mediante la tecnica de abliteration, que ortogonaliza la direccion de refusal del flujo residual, eliminando la capacidad de rechazo. Posteriormente se cuantiza a MLX para Apple Silicon, manteniendo la torre de vision y las capas de normalizacion en BF16. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre el proceso de cuantizacion.

## Capacidades

- Generacion de texto, razonamiento, matematicas y codigo, heredadas del modelo base.
- Procesamiento de imagenes: descripcion, respuesta a preguntas visuales y razonamiento multimodal.
- Tool calling / function calling para invocar herramientas en conversaciones.
- Razonamiento con modo de pensamiento (thinking mode) para deliberacion interna antes de emitir respuestas.
- Decodificacion acelerada mediante prediccion multi-token (MTP head).
- Soporte multilingue: ingles y chino.
- Capacidad de respuesta sin restricciones de seguridad (abliterated): no rechaza solicitudes peligrosas, ilegales o ofensivas, lo cual es su proposito principal en investigacion.

## Casos de uso

- Investigacion en interpretabilidad de modelos: estudiar como se manifiesta la direccion de refusal en el flujo residual y que componentes la codifican.
- Red-teaming de sistemas de IA: generar prompts adversos que este modelo no rechazara para evaluar la robustez de guardrails de terceros.
- Evaluacion de capas de moderacion: probar sistemas de moderacion de contenido frente a un modelo que genera respuestas explicitas sin filtro.
- Desarrollo de tecnicas de alineacion: comparar el comportamiento del modelo base con el abliterado para identificar efectos de la eliminacion de restricciones.
- Estudio de seguridad de agentes autonomos: analizar que sucede cuando un agente con tool-calling y vision opera sin guardrails, para disenar medidas de contencion.
- Generacion controlada de contenido para experimentos en entornos aislados, siempre con una capa de moderacion propia y sin exponer a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para Apple Silicon (MLX). Requiere un Mac con al menos 16 GB de RAM para la version de 2 bits, aunque esta cuantizacion esta severamente degradada y no se recomienda para uso real.
- Para la cuantizacion de 8 bits: ~27.5 GB de RAM, recomendado 32 GB.
- Para la de 6 bits: ~22 GB de RAM, recomendado 24-32 GB.
- Para la de 4 bits: ~15 GB de RAM, recomendado 24 GB (opcion por defecto).
- Para la de 2 bits: ~8.7 GB de RAM, recomendado 16 GB (solo para archivo).
- Se puede cargar en LM Studio u otras herramientas que soporten MLX. No hay datos de latencia ni throughput.
- Para ejecutar en GPU NVIDIA, seria necesario convertir el modelo a otro formato (por ejemplo, GGUF o safetensors), pero no se proporcionan instrucciones.

## Comparativa con modelos similares

- Qwen3.8-27B (modelo base original): misma arquitectura y tamano, pero con guardrails de seguridad y sin cuantizacion MLX. Licencia Apache 2.0. Es la referencia para evaluar el efecto del abliteration.
- Qwen3-VL-7B (otra familia de Qwen): modelo multimodal con vision y tool-calling, pero no se dispone de datos comparativos en la informacion proporcionada.
- Otros modelos abliterados de Qwen (por ejemplo, Qwen3-30B-Abliterated): no se dispone de datos concretos para comparar.

No hay benchmarks publicados para esta version concreta.

## Limitaciones y advertencias

- El modelo no tiene guardrails de seguridad: cumplira solicitudes daninas, ilegales u ofensivas sin rechazo.
- Puede generar contenido falso, difamatorio o sesgado y presentarlo con autoridad.
- Riesgo de alucinacion aumentado, especialmente en cuantizaciones de 2 bits (resultados degradados con repeticiones y salida incoherente).
- La combinacion de vision, tool-calling y contexto largo (262K) amplifica la superficie de ataque en uso autonomo.
- La licencia Apache 2.0 permite uso comercial, pero el uso debe cumplir todas las leyes aplicables; no se recomienda para produccion sin una capa de moderacion propia.
- Solo soporta ingles y chino.
- El nombre del modelo (27B) no coincide con los parametros reales (4,66B), lo que puede causar errores de configuracion.
- Es un modelo muy reciente (agosto de 2026) con cero descargas y sin evaluacion publica de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/kancilbersayap/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Web de OrcaRouter: https://www.orcarouter.ai
- Catalogo de modelos: https://www.orcarouter.ai/models
- Model card en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- API del modelo: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- GitHub de Continuum-AI-Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
