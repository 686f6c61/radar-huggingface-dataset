# Openintelligent123/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA, publicado en agosto de 2026 como la versión de pesos de referencia a precisión completa (BF16) de la familia Nemotron 3.5 Lightning. Está diseñado principalmente para servir como punto de partida en tareas de personalización: post-entrenamiento (SFT, RL, destilación), adaptación a dominios específicos, generación de variantes cuantizadas y evaluación en investigación. Para inferencia optimizada en producción, NVIDIA recomienda la variante NVFP4 del mismo modelo, que ofrece menor latencia y mayor throughput.

El modelo emplea una arquitectura híbrida de Mixture-of-Experts (MoE) que combina capas intercaladas de Mamba-2, capas MoE y capas selectivas de Attention. Cuenta con 30 000 millones de parámetros totales, de los cuales solo 3 000 millones están activos por token. Su longitud de contexto alcanza hasta 1 millón de tokens, aunque en despliegues con una sola GPU H100 80GB se limita a 256 000 tokens por restricciones de memoria. Soporta seis idiomas: inglés, español, francés, alemán, italiano y japonés, además de lenguajes de programación.

La relevancia actual del modelo radica en su enfoque en eficiencia y personalización: permite a investigadores y desarrolladores ajustar el modelo a dominios concretos o producir sus propias versiones cuantizadas, al tiempo que ofrece un modo de razonamiento configurable y técnicas de decodificación especulativa para acelerar la generación en entornos de centro de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + Attention intercaladas |
| Parametros totales | 30B (31 577 937 344 según los pesos safetensors) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (256K en despliegue con una sola H100 80GB) |
| Tipos de cuantizacion | BF16 (pesos de referencia a precisión completa); variante NVFP4 disponible por separado |
| Idiomas soportados | Inglés (y lenguajes de programación), español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura de NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un diseño híbrido de Mixture-of-Experts que intercala capas Mamba-2, capas MoE y capas selectivas de Attention. Esta combinación busca reducir el coste computacional manteniendo una alta calidad de representación: los parámetros activos por token son solo 3 000 millones, mientras que el total de parámetros asciende a 30 000 millones. El modelo está entrenado en BF16 y se presenta como los pesos de referencia de precisión completa, pensados para servir de base a procesos de post-entrenamiento como SFT, RL o destilación.

Los datos de pre-entrenamiento tienen una fecha de corte en septiembre de 2025, y los de post-entrenamiento en mayo de 2026. Los conjuntos de datos utilizados son `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`. Entre las innovaciones técnicas destacables se incluye la decodificación especulativa DSpark, orientada a despliegues de centro de datos con baja concurrencia, y un modo de razonamiento configurable que se activa o desactiva mediante el chat template (`enable_thinking=True/False`). No se especifica el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general: modelo de propósito general para chat y razonamiento, según la descripción de NVIDIA.
- Modo de razonamiento configurable: permite activar o desactivar el modo de pensamiento mediante `enable_thinking=True/False` en el chat template.
- Soporte multilingüe: inglés, español, francés, alemán, italiano y japonés, además de lenguajes de programación.
- Decodificación especulativa: implementa DSpark para acelerar la generación en despliegues de baja concurrencia en centros de datos.
- Capacidades de tool calling, function calling y agentes: no documentadas en la información disponible.
- Capacidades de visión o audio: no disponibles según la información proporcionada.

## Casos de uso

- Investigación y evaluación a precisión completa: los pesos BF16 sirven como referencia para medir el impacto de cuantizaciones o fine-tunings en tareas de evaluación académica.
- Adaptación de dominio mediante post-entrenamiento: el modelo es un punto de partida para aplicar SFT, RL o destilación en dominios específicos como medicina, derecho o finanzas.
- Generación de variantes cuantizadas: los desarrolladores pueden utilizar estos pesos BF16 para producir sus propias versiones GGUF o NVFP4 adaptadas a distintos hardware.
- Chat y razonamiento multilingüe en investigación: con soporte para seis idiomas y contexto largo, resulta adecuado para experimentos de conversación y análisis de documentos extensos.
- Despliegue en centros de datos con hardware NVIDIA: puede ejecutarse con vLLM o SGLang en GPUs H100, H200, A100, B200 o GB200, aprovechando contextos de hasta 1M tokens.
- Experimentación con decodificación especulativa: DSpark permite estudiar mejoras de latencia en entornos de baja concurrencia antes de migrar a la variante NVFP4.
- Generación de código: al soportar lenguajes de programación, puede utilizarse para tareas de asistencia en desarrollo de software dentro de un pipeline de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 GB para cargar los pesos BF16 completos; el tamaño del repositorio es de 65,8 GB.
- GPU recomendadas: NVIDIA H100 80GB, H200, A100 80GB, B200 y GB200 (Blackwell). El modelo está validado en estas plataformas según la matriz de hardware.
- Compatibilidad con GPU de consumo: no es viable en BF16 debido a los requisitos de memoria; la variante NVFP4 o los checkpoints GGUF están pensados para dispositivos locales como RTX 5090, DGX Spark o RTX 6000 Pro.
- Opciones de despliegue: vLLM (con DSpark), SGLang y transformers. Para la variante GGUF se menciona llama.cpp/Ollama en la documentación asociada, aunque no para este checkpoint BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos suficientes para comparar este modelo con alternativas de la misma categoría. Cabe señalar que la variante NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 es la versión optimizada para inferencia del mismo modelo, pero no constituye un modelo independiente comparable.

## Limitaciones y advertencias

- El checkpoint publicado en HuggingFace está alojado por el usuario "Openintelligent123", no por NVIDIA. Se recomienda verificar la integridad y procedencia de los pesos antes de su uso.
- El modelo BF16 requiere al menos 80 GB de VRAM y no es apto para GPUs de consumo; para producción se recomienda la variante NVFP4.
- La longitud de contexto de 1M tokens solo es alcanzable en configuraciones multi-GPU o en hardware Blackwell; en una sola H100 se limita a 256K tokens por restricciones de memoria.
- No se documentan sesgos específicos, pero al ser un LLM general puede presentar sesgos heredados de sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; se debe evaluar en cada caso de uso.
- Los datos de entrenamiento tienen un corte en septiembre de 2025 (pre-entrenamiento) y mayo de 2026 (post-entrenamiento), por lo que el modelo no conoce eventos posteriores.
- No soporta entradas de visión ni audio según la información disponible.
- La licencia OpenMDW-1.1 debe revisarse detenidamente para confirmar los términos de uso comercial y redistribución.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Comunidad de desarrolladores NVIDIA AI: https://discord.gg/9xpKQtVvrk
