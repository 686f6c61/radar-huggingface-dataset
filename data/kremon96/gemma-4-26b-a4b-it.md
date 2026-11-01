# Kremon96/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es la variante de instrucciones del modelo multimodal de arquitectura Mixture-of-Experts (MoE) de la familia Gemma 4, desarrollada por Google DeepMind. Esta ficha concreta corresponde a una publicación de pesos en el repositorio de Hugging Face del usuario Kremon96, derivada del modelo base `google/gemma-4-26B-A4B`. El modelo procesa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 256K tokens.

La arquitectura combina atención híbrida (ventanas deslizantes locales intercaladas con atención global) y un esquema MoE de 128 expertos con 8 activos más uno compartido, lo que permite activar solo 3,8B parámetros de los 25,2B totales en cada paso de inferencia. Esto lo sitúa en el rango de despliegue en GPU de consumo y estaciones de trabajo, manteniendo capacidades de razonamiento, código y agentes.

Su relevancia actual radica en ofrecer un equilibrio entre eficiencia computacional y capacidades frontier: contexto muy largo, soporte nativo de *system prompt*, *function calling* y modos de razonamiento configurables. La licencia Apache 2.0 facilita su adopción comercial, aunque conviene verificar la licencia específica de Gemma 4 enlazada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE y atención híbrida (sliding window + global) |
| Parámetros totales | 25,2B (según model card); 25.805.936.206 según safetensors |
| Parámetros activos | 3,8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 140 idiomas (según model card) |
| Licencia | Apache 2.0 (con enlace a licencia específica de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos totales de los que se activan 8 por token más un experto compartido, y un tamaño de vocabulario de 262K. La atención es híbrida: intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE). Incluye un codificador de visión de aproximadamente 550M de parámetros para el procesamiento de imágenes.

La model card indica que la familia Gemma 4 se distribuye en variantes preentrenadas y ajustadas por instrucciones, con soporte nativo del rol `system`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto, razonamiento con modos de *thinking* configurables, código y matemáticas.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Procesamiento de vídeo (según la model card de la familia).
- Soporte nativo de *function calling* y flujos agénticos autónomos.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingües en más de 140 idiomas.
- Procesamiento multimodal de texto e imagen (sin audio en esta variante de 26B A4B).

## Casos de uso

- **Atención al cliente automatizada**: gestión de conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens, manteniendo coherencia en diálogos prolongados.
- **Generación de código en producción**: integración en pipelines de CI/CD mediante *function calling* para tareas de revisión, generación de tests o refactorización asistida.
- **Agentes autónomos multi-paso**: planificación y ejecución de tareas encadenadas con herramientas externas, aprovechando el soporte nativo de agentes y *system prompt*.
- **Análisis de documentos con imágenes**: extracción y razonamiento sobre información en capturas, diagramas o PDFs escaneados combinando entrada de texto e imagen.
- **Asistencia en investigación**: resumen y razonamiento sobre corpus largos (artículos, informes) dentro de una única ventana de contexto.
- **Despliegue en estaciones de trabajo**: servir el modelo en GPUs de gama alta de consumo o profesionales, dado que solo activa 3,8B parámetros por token.
- **Sistemas multilingües**: aplicaciones de traducción o atención en más de 140 idiomas sin modelos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial; con 25,2B parámetros totales, los pesos en precisión completa rondan los 50 GB (el repositorio ocupa 51,6 GB). En cuantizaciones de 8 bits o 4 bits el requisito se reduce aproximadamente a la mitad o a un cuarto, respectivamente, aunque estos formatos no se detallan en la información.
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, cabría esperar despliegue en A100/H100 para precisión completa y en GPUs de consumo de gama alta para cuantizaciones reducidas, aunque no hay confirmación oficial.
- **GPU de consumo**: no confirmado; la activación de solo 3,8B parámetros por token favorece la inferencia eficiente, pero el peso total debe residir en memoria.
- **Opciones de despliegue**: la librería indicada es `transformers`; no se confirman vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (esta ficha) | 25,2B | 3,8B | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 30,7B (denso) | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 11,95B (denso) | 256K | Texto, imagen, audio | Apache 2.0 |

La comparativa se limita a variantes de la misma familia, ya que la información disponible no incluye modelos externos comparables con datos verificables.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no cuantificado por el autor.
- Esta variante de 26B A4B no soporta audio, a diferencia de E2B, E4B y 12B.
- La licencia indicada es Apache 2.0, pero el autor enlaza la licencia específica de Gemma 4; conviene revisar sus términos para uso comercial.
- El repositorio tiene muy pocas descargas (24) y ningún *like*, lo que sugiere escasa validación comunitaria de esta publicación concreta.
- No se especifican tipos de cuantización ni opciones de despliegue optimizadas, lo que limita la planificación de producción.
- No hay datos de benchmarks ni de rendimiento medido para esta publicación.

## Enlaces

- [Hugging Face: Kremon96/gemma-4-26B-A4B-it](https://huggingface.co/Kremon96/gemma-4-26B-A4B-it)
- [Colección Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentación de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe técnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Página de modelos Gemma de Google DeepMind](https://deepmind.google/models/gemma/)
