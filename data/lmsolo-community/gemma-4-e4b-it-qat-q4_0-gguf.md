# lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E4B-it es un modelo multimodal de la familia Gemma 4 desarrollada por Google DeepMind, publicado en variantes preentrenada e instruida. Este repositorio concreto (`lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf`) es una conversión a formato GGUF del checkpoint QAT (Quantization-Aware Training) oficial de Google, cuantizado en Q4_0, lo que permite desplegar el modelo con requisitos de memoria muy reducidos manteniendo una calidad cercana a bfloat16. El modelo procesa texto, imagen y audio como entrada, y genera texto como salida.

El modelo emplea una arquitectura densa con atención híbrida (ventanas deslizantes locales combinadas con atención global), 42 capas y una ventana de contexto de 128K tokens. La nomenclatura "E4B" hace referencia a parámetros "efectivos" (4,5B efectivos, 8B contando embeddings), e incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia paramétrica en despliegues on-device. El repositorio reporta 7.463.013.674 parámetros en safetensors y un tamaño total de 6,1 GB.

Su relevancia actual radica en que combina capacidades frontier para su tamaño (razonamiento con modos de pensamiento configurables, soporte nativo de function calling, capacidades agénticas y multilingüismo en más de 140 idiomas) con un formato GGUF Q4_0 listo para ejecutarse en hardware de consumo, lo que democratiza el acceso a un modelo multimodal de Google DeepMind bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) |
| Parámetros totales | 7.463.013.674 (según safetensors); 4,5B efectivos / 8B con embeddings según model card |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | Q4_0 (este repo); el pipeline QAT oficial ofrece además wNa8o8 (móvil) y w4a16 (compressed-tensors) |
| Idiomas soportados | Más de 140 idiomas (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) |
| Capas | 42 |
| Ventana deslizante | 512 tokens |
| Tamaño de vocabulario | 262K |
| Modalidades de entrada | Texto, imagen, audio |
| Modalidad de salida | Texto |
| Encoder de visión | ~150M parámetros |
| Encoder de audio | ~300M parámetros |
| Tamaño del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

Gemma 4 E4B-it es un transformer denso de 42 capas que utiliza un mecanismo de atención híbrido: intercala capas con atención de ventana deslizante local (512 tokens) con capas de atención global, garantizando que la capa final sea siempre global. Para optimizar el consumo de memoria en contextos largos, las capas globales emplean claves y valores unificados (unified K/V) y aplican Proportional RoPE (p-RoPE). El modelo incorpora Per-Layer Embeddings (PLE), una técnica que maximiza la eficiencia de parámetros en despliegues on-device, y cuenta con un vocabulario de 262K tokens.

El checkpoint de este repositorio proviene del pipeline de Quantization-Aware Training (QAT) de Google DeepMind, que entrena el modelo teniendo en cuenta la cuantización posterior para preservar una calidad similar a bfloat16 tras la compresión. Los pesos se extrajeron como Q4_0 en media precisión y posteriormente se serializaron a GGUF. El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`. La model card indica que la familia Gemma 4 está diseñada como modelos altamente capaces de razonar, con modos de pensamiento configurables, y que incorpora soporte nativo del rol `system` para conversaciones más estructuradas y controlables. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio de forma nativa (el encoder de audio de ~300M parámetros está presente en E2B, E4B y 12B).
- Procesamiento de vídeo como entrada multimodal (según la model card de la familia).
- Generación de código y capacidades de programación mejoradas respecto a generaciones anteriores.
- Soporte nativo de function calling / tool calling.
- Capacidades agénticas y razonamiento multi-paso para flujos autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` en conversaciones.
- Compatibilidad con decodificación especulativa mediante modelos drafter (requiere que el asistente sea también un checkpoint QAT de la misma precisión).
- Optimizado para ejecución on-device en portátiles y dispositivos móviles.

## Casos de uso

- **Atención al cliente automatizada multimodal:** el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens y aceptar capturas de pantalla o imágenes enviadas por el usuario, lo que permite resolver incidencias que requieren interpretar documentos o interfaces.
- **Asistentes de accesibilidad con audio:** gracias a su encoder de audio nativo, puede transcribir y razonar sobre entradas de voz en aplicaciones de asistencia para personas con discapacidad visual o motriz, ejecutándose localmente en un portátil.
- **Generación de código en producción:** con soporte nativo de function calling y tool calling, puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests o resolución de issues, invocando herramientas externas de build y test.
- **Agentes autónomos de investigación:** sus capacidades agénticas y de razonamiento multi-paso permiten construir agentes que planifican, consultan APIs y sintetizan resultados, con el modo thinking activado para tareas complejas.
- **Procesamiento de documentos en el edge:** al caber en 6,1 GB en formato GGUF Q4_0, puede desplegarse en portátiles y estaciones de trabajo para extraer información de facturas, contratos o formularios con imágenes escaneadas, sin enviar datos a la nube.
- **Análisis de vídeo local:** la entrada de vídeo permite construir herramientas de resumen automático de reuniones o de vigilancia de contenido en entornos con requisitos de privacidad, ejecutando el modelo en hardware de consumo.
- **Traducción y atención multilingüe:** con más de 140 idiomas soportados, es adecuado para sistemas de soporte y localización que atienden a usuarios en múltiples lenguas desde una única instancia.
- **Prototipado rápido con Ollama o llama.cpp:** el formato GGUF Q4_0 permite a investigadores evaluar el modelo en una GPU de consumo en minutos, sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el repositorio GGUF Q4_0 ocupa 6,1 GB, por lo que se necesitan aproximadamente 6-8 GB de VRAM para cargar los pesos, más overhead para el contexto KV (que crece con la longitud de contexto, especialmente en las capas globales).
- **GPU recomendadas:** RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para despliegue local; A100 o H100 para servir a múltiples usuarios con contextos largos.
- **¿Cabe en GPU de consumo?** Sí, en GPUs con 8 GB o más de VRAM en cuantización Q4_0; en 6 GB puede requerir offloading parcial a CPU.
- **Opciones de despliegue:** llama.cpp, Ollama y otros runtimes compatibles con GGUF; para las variantes w4a16 del pipeline QAT oficial, vLLM con soporte de compressed-tensors.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B-it QAT Q4_0 (este repo) | 4,5B efectivos / 8B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 E2B-it QAT | 2,3B efectivos / 5,1B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 12B Unified QAT | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 31B Dense QAT | 30,7B | 256K | Texto, imagen | Apache 2.0 | GGUF Q4_0 |

La comparativa se limita a la propia familia Gemma 4, ya que la información disponible no incluye datos de rendimiento frente a modelos de otros desarrolladores. El E4B se sitúa entre el E2B (más ligero, orientado a móvil) y el 12B (mayor contexto y capacidad), ofreciendo un equilibrio entre huella de memoria y capacidades multimodales completas.

## Limitaciones y advertencias

- **Sesgos:** no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales.
- **Riesgo de alucinación:** inherente a los modelos generativos; la model card no cuantifica tasas de alucinación.
- **Contexto e idioma:** aunque soporta 128K tokens y más de 140 idiomas, el rendimiento puede degradarse en contextos muy largos o en idiomas de bajos recursos; la lista concreta de idiomas no está disponible.
- **Licencia:** Apache 2.0 permite uso comercial, pero la model card remite a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), que conviene revisar para obligaciones adicionales de atribución o uso aceptable.
- **Cuantización Q4_0:** aunque el QAT preserva calidad cercana a bfloat16, puede haber degradación en tareas sensibles a la precisión numérica; conviene validar en el dominio de producción.
- **Decodificación especulativa:** si se usa un modelo drafter, debe ser también un checkpoint QAT de la misma precisión, lo que restringe las combinaciones posibles.
- **Repositorio de terceros:** este GGUF lo publica `lmsolo-community`, no Google DeepMind; la integridad y fidelidad de la conversión respecto al checkpoint oficial no están verificadas en la información disponible.
- **Audio y vídeo:** aunque el modelo base soporta audio y vídeo, el soporte efectivo en el runtime GGUF depende del backend de inferencia utilizado.

## Enlaces

- Hugging Face: https://huggingface.co/lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento (QAT): https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de DeepMind: https://deepmind.google/models/gemma/
