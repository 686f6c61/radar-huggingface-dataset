# lmsolo/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada con pesos abiertos bajo licencia Apache 2.0. Esta ficha concreta corresponde a la conversión a GGUF Q4_0 del checkpoint QAT (Quantization-Aware Training) de la variante instruction-tuned E4B, realizada por el usuario lmsolo. El modelo acepta texto, imagen y audio como entrada, y genera texto como salida (pipeline any-to-any), lo que lo sitúa en la gama de modelos pequeños orientados a ejecución local en portátiles y dispositivos móviles.

La variante E4B emplea 4.500 millones de parámetros efectivos (8.000 millones contando embeddings), con 42 capas, ventana de atención deslizante de 512 tokens y una longitud de contexto de 128.000 tokens. Incorpora codificadores específicos de visión (~150 M de parámetros) y audio (~300 M), y forma parte de la estrategia de Google de democratizar el acceso a modelos de frontera en hardware de consumo. El entrenamiento con QAT permite mantener una calidad cercana a bfloat16 reduciendo drásticamente los requisitos de memoria.

La relevancia actual de esta ficha radica en que combina tres factores poco habituales en un mismo artefacto: multimodalidad nativa (texto, imagen, audio), contexto largo de 128K y un formato GGUF listo para desplegar en el ecosistema llama.cpp/Ollama. El repositorio ocupa 6,1 GB y acumula 621 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) en capas globales |
| Parametros totales | 4,5 B efectivos (8 B con embeddings); 7.463.013.674 según safetensors del repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q4_0 (GGUF); el checkpoint base QAT también se distribuye en wNa8o8 (móvil) y w4a16 (compressed-tensors) |
| Idiomas soportados | Más de 140 idiomas (según la model card de la familia Gemma 4); no se detalla lista específica para esta conversión |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0); el checkpoint base está en formato unquantized QAT |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con 42 capas y un mecanismo de atención híbrido que intercala atención local de ventana deslizante (512 tokens) con atención global, garantizando que la última capa sea siempre global. Esta combinación busca el bajo coste de memoria de un modelo ligero sin renunciar a la comprensión de contexto largo. Las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en secuencias extensas. La variante E4B incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia paramétrica en despliegue on-device, además de codificadores dedicados de visión (~150 M) y audio (~300 M).

El checkpoint base es el resultado de un pipeline de Quantization-Aware Training (QAT) de Google DeepMind, que entrena el modelo teniendo en cuenta la cuantización posterior para preservar una calidad cercana a bfloat16 con menor huella de memoria. La model card de la familia indica que los modelos Gemma 4 están diseñados como razonadores con modos de pensamiento configurables, soporte nativo del rol `system` y capacidades mejoradas de código y agentes con function calling nativo. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con soporte nativo del rol `system` para conversaciones estructuradas.
- Razonamiento con modos de pensamiento configurables (thinking modes) en toda la familia Gemma 4.
- Procesamiento de imagen con soporte de relación de aspecto y resolución variables.
- Procesamiento de audio nativo en las variantes E2B, E4B y 12B.
- Procesamiento de vídeo según la model card de la familia (multimodalidad extendida).
- Soporte nativo de function calling / tool calling para flujos agénticos.
- Capacidades de agente y razonamiento multi-paso orientadas a flujos autónomos.
- Capacidades multilingües en más de 140 idiomas.
- Mejoras notables en benchmarks de código según la documentación de la familia.
- Compatibilidad con decodificación especulativa mediante modelo asistente (drafter), con la restricción de que el asistente debe ser también un checkpoint QAT de la misma precisión.

## Casos de uso

- Asistente conversacional local en portátil: con 128K de contexto y formato GGUF Q4_0 de 6,1 GB, el modelo puede ejecutarse en equipos con 8-12 GB de VRAM/RAM y mantener conversaciones largas con historial extenso sin perder coherencia gracias a la atención híbrida.
- Transcripción y análisis de audio en dispositivos: el codificador de audio de ~300 M permite procesar entradas de voz directamente, útil para actas de reuniones, notas de voz o asistentes de accesibilidad sin depender de servicios en la nube.
- Descripción y análisis de imágenes en el borde: el codificador de visión de ~150 M con soporte de resolución variable permite clasificar, describir o extraer información de capturas, documentos escaneados o fotografías en flujos locales.
- Agente autónomo con tool calling: el soporte nativo de function calling y el contexto de 128K lo hacen adecuado para orquestar llamadas a APIs, consultas a bases de datos o pipelines de automatización multi-paso en entornos con requisitos de privacidad.
- Generación y revisión de código en CI/CD: las mejoras en benchmarks de código de la familia y el soporte de tool calling permiten integrarlo en pipelines para autocompletado, revisión de parches o generación de tests en entornos donde no se puede enviar código a la nube.
- Atención al cliente multilingüe: con más de 140 idiomas y contexto largo, puede gestionar conversaciones multi-turno con clientes en distintos idiomas manteniendo el contexto de la sesión completa.
- Prototipado e investigación en cuantización: al ser una conversión GGUF Q4_0 de un checkpoint QAT, sirve como referencia para estudiar la pérdida de calidad respecto a bfloat16 en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona mejoras en benchmarks de código y razonamiento, pero no incluye cifras concretas para la variante E4B ni para esta conversión GGUF Q4_0.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF Q4_0 ocupa 6,1 GB, por lo que se requieren aproximadamente 7-8 GB de VRAM/RAM para cargar el modelo con overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el ámbito profesional, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización Q4_0; con contexto de 128K completo el consumo de KV cache crece y conviene 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y motores compatibles con GGUF; para el checkpoint base QAT en formato compressed-tensors w4a16 se recomienda vLLM. El endpoint de Hugging Face aparece marcado como compatible con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B (esta ficha, GGUF Q4_0) | 4,5 B efectivos (8 B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 E2B | 2,3 B efectivos (5,1 B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, wNa8o8, compressed-tensors |
| Gemma 4 12B Unified | 11,95 B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF, compressed-tensors |
| Gemma 4 31B Dense | 30,7 B | 256K | Texto, imagen | Apache 2.0 | GGUF |

La comparativa se limita a la propia familia Gemma 4 porque la información disponible no incluye datos de benchmarks ni especificaciones de modelos competidores de otros desarrolladores. Para una comparación con alternativas externas sería necesario consultar fuentes adicionales no incluidas en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de dichos datos.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de razonamiento con thinking modes pueden generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto o idioma: aunque la familia declara más de 140 idiomas, no se especifica el rendimiento por idioma ni la lista concreta; el contexto de 128K es menor que el de las variantes de 12B, 26B A4B y 31B (256K).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), que conviene revisar por si añade condiciones adicionales de uso aceptable.
- Esta ficha es una conversión comunitaria (usuario lmsolo) del checkpoint oficial de Google, no una publicación directa de Google DeepMind; la calidad de la conversión GGUF no está avalada por el desarrollador original.
- La cuantización Q4_0 introduce pérdida de precisión respecto a bfloat16, aunque el pipeline QAT del checkpoint base está diseñado para minimizarla.
- Para decodificación especulativa con modelo asistente, este debe ser también un checkpoint QAT de la misma precisión; mezclar precisiones puede degradar el rendimiento o fallar.
- No se han publicado resultados de benchmarks específicos para esta conversión, por lo que el rendimiento real en producción debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento (QAT Gemma 4): https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
