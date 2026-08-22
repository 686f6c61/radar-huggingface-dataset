# MergekitCloud/mergekit-10

## Resumen

MergekitCloud/mergekit-10 es un modelo de lenguaje de tipo transformador, creado mediante la técnica de fusión de modelos (model merging) a partir de cuatro modelos base de 8 mil millones de parámetros de la familia Llama 3.1. Lo desarrolla el usuario MergekitCloud utilizando la librería open source MergeKit, con el método Model Stock (arxiv:2403.19522). El modelo resultante combina las capacidades de los modelos originales, que incluyen especialización en roleplay, generación de texto sin censura y ajuste de instrucciones, sin necesidad de entrenamiento adicional.

Este modelo resuelve el problema de obtener un único sistema que herede las fortalezas de varios modelos preentrenados, evitando el coste computacional de un fine-tuning. Es relevante en la comunidad de IA open source porque demuestra cómo la fusión de pesos permite crear modelos con capacidades híbridas de forma rápida y reproducible. El repositorio no incluye información sobre licencia, idiomas soportados ni longitud de contexto, por lo que estos datos no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (Transformer, decoder-only) |
| Parametros totales | 8.030.429.248 (~8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos de cuatro modelos preentrenados, todos basados en Llama 3.1 de 8B parámetros: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y vicgalle/Humanish-Roleplay-Llama-3.1-8B. Se utilizó el método Model Stock (arxiv:2403.19522), que calcula una combinación lineal de los pesos de los modelos participantes, tomando como base el modelo de roleplay vicgalle/Humanish-Roleplay-Llama-3.1-8B. La configuración empleó normalización desactivada, máscara int8 y dtype float16.

No se realizó ningún entrenamiento adicional (ni fine-tuning ni RLHF); la fusión es puramente a nivel de pesos. El resultado es un modelo con la arquitectura estándar de Llama 3.1, sin innovaciones técnicas propias más allá de la fusión.

## Capacidades

- Generación de texto conversacional y narrativo, con especialización en roleplay y diálogos multi-turno.
- Generación de contenido sin censura (sin restricciones de contenido), heredada de los modelos Lexi-Uncensored y Unholy.
- Capacidad de instrucción y conversación general, proveniente de ArliAI-RPMax, que incluye ajuste para seguir instrucciones.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-step en la documentación disponible.
- No se dispone de información sobre capacidades multilingües; los idiomas soportados no están declarados.
- No se han documentado capacidades de visión, audio u otras modalidades.

## Casos de uso

- Roleplay y escritura creativa: el modelo puede generar diálogos y narrativas en contextos de personajes, gracias a su base en Humanish-Roleplay y la combinación de modelos de roleplay.
- Generación de historias y contenido narrativo: útil para autores y creadores que necesitan un generador de texto fluido con estilo de ficción.
- Asistentes conversacionales sin censura: puede integrarse en sistemas de chat que requieran respuestas sin filtros predefinidos, aunque con advertencias de seguridad.
- Prototipado rápido de aplicaciones de texto: al ser un modelo 8B, se puede ejecutar en hardware de consumo moderado para pruebas de concepto.
- Investigación sobre fusión de modelos: sirve como ejemplo reproducible para estudiar el efecto de la fusión Model Stock en modelos Llama 3.1.
- Generación de datos sintéticos para fine-tuning: puede usarse para crear datasets de texto, aunque sin garantía de calidad sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otros para este modelo, ni comparación con modelos similares.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp16 se requieren aproximadamente 16 GB de VRAM (8B parámetros × 2 bytes). Con cuantización en 4 bits (GPTQ o AWQ) se reduce a unos 6-8 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para fp16, una GPU con 16 GB o más, como RTX 4090, A100 40GB, o V100 32GB. Para cuantización, una RTX 3060 de 12GB o RTX 4070 podrían ser suficientes.
- Se puede ejecutar en GPU de consumo si se cuantiza, pero no se incluyen pesos GGUF ni cuantizados en el repo.
- Opciones de despliegue: al ser un modelo compatible con transformers, puede usarse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) o directamente con la librería transformers.
- Latencia y throughput: no se disponen datos concretos; en una GPU A100, un modelo 8B en fp16 suele alcanzar alrededor de 50-100 tokens por segundo en tareas de generación, pero esto es una estimación general y no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-10 | 8,03 B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B (Meta) | 8,03 B | 128k tokens | Llama 3.1 Community License | HuggingFace |
| Mistral 7B v0.3 | 7,24 B | 32k tokens | Apache 2.0 | HuggingFace |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8,03 B | 128k tokens | no disponible | HuggingFace |

La comparación muestra que mergekit-10 es similar a sus modelos base, pero la falta de licencia y contexto declarados lo hace menos atractivo para uso comercial sin verificación. Los modelos base tienen ventajas en términos de licencia (Llama 3.1 tiene licencia específica, Mistral es Apache 2.0) y contexto conocido.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una fusión de modelos sin entrenamiento, puede heredar sesgos de los modelos originales, que no se han documentado.
- Riesgo de alucinación: no se ha evaluado la fiabilidad factual; como todo LLM, puede generar información incorrecta.
- Limitaciones de contexto: la longitud de contexto no está especificada; aunque se basa en Llama 3.1 (que soporta 128k), no se garantiza que la fusión conserve esa capacidad.
- Restricciones de licencia: la licencia es "no disponible", lo que impide conocer si permite uso comercial; se recomienda contactar con el autor o evitar su uso en producción.
- Sin cuantizaciones predefinidas: el repositorio solo contiene pesos fp16, lo que limita su uso en entornos con recursos limitados.
- Sin benchmarks: no hay evidencia de rendimiento, por lo que no se recomienda para aplicaciones críticas sin evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-10
- Repositorio de MergeKit (herramienta de fusión): https://github.com/arcee-ai/mergekit
- Paper de Model Stock (método de fusión): https://arxiv.org/abs/2403.19522
- Blog de HuggingFace sobre fusión de modelos: https://huggingface.co/blog/mlabonne/merge-models
- Guía de MergeKit en Clore.ai: https://docs.clore.ai/guides/training/mergekit
- Comunidad MergeKit Hub: https://www.mergekit.com/
