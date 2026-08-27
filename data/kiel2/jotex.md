# kiel2/Jotex

## Resumen

Jotex es un modelo de lenguaje conversacional de 1.500 millones de parámetros, resultado de un fine-tuning del modelo base Qwen 2.5 Instruct 1.5B realizado con la librería Unsloth. El autor, kiel2, lo publica directamente en formato GGUF, lo que lo hace compatible con herramientas de inferencia local como llama.cpp y Ollama, orientado a despliegues ligeros en entornos de producción o en equipos con recursos limitados.

El modelo está diseñado para tareas conversacionales y su principal aportación es la optimización del proceso de entrenamiento (el autor indica que se entrenó el doble de rápido con Unsloth) y la conversión a un formato de pesos ampliamente soportado. Es relevante ahora porque ofrece una alternativa compacta y eficiente para desarrolladores que necesitan un asistente conversacional en español o multilingüe sin depender de APIs comerciales, ejecutable en hardware de consumo.

La información pública disponible es mínima: no se especifican los datos de entrenamiento, el dataset utilizado, ni la licencia exacta, lo que limita la evaluación de su idoneidad para entornos de producción con requisitos legales estrictos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformador decoder-only) |
| Parámetros totales | 1.543.714.304 (≈1,5B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (base Qwen2.5 Instruct 1.5B: 32.768 tokens, pero no confirmado para este fine-tune) |
| Tipos de cuantización | Q8_0 y Q4_K_M (formato GGUF) |
| Idiomas soportados | No disponible (el base Qwen2.5 soporta múltiples idiomas, pero no se indica para el fine-tune) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors también presente en el repo según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención multi-cabeza estándar y mecanismos de normalización RMSNorm. El fine-tuning se realizó con la librería Unsloth, que optimiza el entrenamiento mediante técnicas de kernel fusionado y reducción de memoria, logrando una aceleración de 2x respecto al entrenamiento convencional. El proceso de fine-tuning parte del checkpoint `qwen2.5-1.5b-instruct` y produce dos versiones cuantizadas en GGUF: Q8_0 (mayor precisión, mayor tamaño) y Q4_K_M (menor precisión, más compacta). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a mantener diálogos multi-turno, aunque no se especifica la longitud máxima de contexto soportada.
- Razonamiento básico: al heredar la arquitectura de Qwen2.5, puede resolver tareas de razonamiento simple, aunque su tamaño reducido limita la complejidad.
- Soporte de tool calling: no documentado en la model card, pero la arquitectura base Qwen2.5 Instruct sí lo soporta; no se puede confirmar para este fine-tune.
- Capacidades multilingües: no confirmadas para el fine-tune, aunque el base Qwen2.5 es multilingüe (incluye español, inglés, chino, etc.).
- Sin capacidades multimodales: no hay indicios de soporte de visión o audio.

## Casos de uso

- **Chatbots de atención al cliente**: el modelo puede integrarse en sistemas de soporte automatizado para gestionar consultas frecuentes, aprovechando su tamaño reducido para desplegarse en servidores modestos o incluso en edge devices.
- **Asistente personal local**: ejecutable en un ordenador de escritorio o portátil mediante llama.cpp u Ollama, ofrece respuestas conversacionales sin conexión a internet, ideal para entornos con privacidad estricta.
- **Generación de código asistida**: aunque no se confirma el soporte de tool calling, el base Qwen2.5 Instruct es competente en generación de código; se puede usar para autocompletar scripts simples en editores ligeros.
- **Prototipado rápido de chatbots**: por su tamaño reducido, es adecuado para hacer pruebas de concepto de sistemas de diálogo sin necesidad de GPUs de alta gama.
- **Traducción y reformulación de textos**: puede utilizarse para tareas de traducción o paráfrasis en varios idiomas, si bien la calidad dependerá del fine-tune.
- **Educación y experimentación**: su licencia abierta (aunque sin especificar) lo hace útil para estudiantes que quieran entender el proceso de fine-tuning y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para el GGUF Q4_K_M (≈1,2 GB), se puede ejecutar en GPU con 2-4 GB de VRAM; para Q8_0 (≈1,7 GB), se recomienda al menos 4 GB.
- **GPU recomendadas**: NVIDIA GTX 1650/RTX 3050 o superiores; también funciona en CPU con 8 GB de RAM (llama.cpp).
- **Cabe en consumer GPU**: sí, es un modelo ligero que puede ejecutarse en tarjetas de gama de entrada y en Mac con Apple Silicon.
- **Opciones de despliegue**: llama.cpp (llama-cli), Ollama (incluye Modelfile), vLLM (si se convierte a safetensors), TGI (si se convierte a formato compatible).
- **Latencia estimada**: en GPU moderna (RTX 4090) se espera una latencia de ~10-20 ms por token; en CPU puede ser de 50-100 ms por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| **Jotex (kiel2)** | 1,5B | No disponible | No disponible | GGUF |
| **Qwen2.5-1.5B-Instruct** | 1,5B | 32K | Apache 2.0 | safetensors |
| **Llama-3.2-1B** | 1B | 128K | Llama 3.2 Community | safetensors |
| **TinyLlama-1.1B** | 1,1B | 2K | Apache 2.0 | safetensors |

La comparativa se basa en el modelo base y en alternativas similares de tamaño; el fine-tune de kiel2 no tiene datos públicos de rendimiento.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado, pero al heredar del base Qwen2.5 pueden persistir sesgos de género, raciales o culturales del dataset original.
- **Riesgo de alucinación**: elevado, especialmente en tareas de razonamiento o hechos específicos, por el pequeño tamaño del modelo.
- **Limitaciones de contexto**: la longitud de contexto no está confirmada; si no se extiende, podría quedar limitada a la del base (32K tokens), aunque el fine-tune podría reducirlo.
- **Restricciones de licencia**: la licencia no está especificada en la model card, lo que impide determinar si es apto para uso comercial o si tiene restricciones de atribución.
- **Caveats de producción**: no se ha publicado información sobre la calidad del fine-tune, ni evaluación humana, ni tests de robustez; no se recomienda su uso en entornos críticos sin validación previa.

## Enlaces

- [HuggingFace - kiel2/Jotex](https://huggingface.co/kiel2/Jotex)
- [Perfil de kiel2 en HuggingFace](https://huggingface.co/kiel2/models)
- [Modelo base Qwen2.5-1.5B-Instruct (referencia)](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
