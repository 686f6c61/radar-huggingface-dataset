# AutoResearch-Lab/MiniCPM-V-4.7-35B-A3B-FP8

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) de la familia MiniCPM-V desarrollado por OpenBMB, y esta ficha corresponde a la versión cuantizada en FP8 publicada por AutoResearch-Lab. Se trata del primer modelo de arquitectura MoE (Mixture of Experts) de la serie MiniCPM-V, con 35.212.875.824 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí la denominación A3B). El modelo base en BF16 es openbmb/MiniCPM-V-4.7-35B-A3B y esta variante emplea compresión de tensores mediante llm-compressor con el formato compressed-tensors.

El modelo resuelve el problema de ejecutar un MLLM de gran capacidad en dispositivos con memoria y ancho de banda limitados. Para ello combina la técnica Lookahead Expert Scheduling (LES), cuantización fina por capas y muestreo especulativo DSpark, lo que permite decodificar a más de 13 tokens por segundo con solo 3 GB de memoria en un iPhone 17 Pro Max. Además, incorpora compresión temprana de tokens visuales dentro del codificador (intra-ViT early compression, heredada de LLaVA-UHD v4) y soporte de compresión mixta 4x/16x de tokens visuales.

Es relevante ahora porque traslada al terreno open source (licencia Apache 2.0) la inferencia MoE multimodal sin pérdida de rendimiento en hardware de consumo y plataformas móviles (iOS, Android, HarmonyOS), con soporte de día cero para chips de Rockchip, Houmo, Intel, AMD y Arm. Esta variante FP8 está pensada para despliegues en servidor y GPU con menor huella de memoria que el BF16 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE); codificador visual con compresión intra-ViT temprana |
| Parámetros totales | 35.212.875.824 |
| Parámetros activos | Aproximadamente 3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (compressed-tensors, llm-compressor); el modelo base ofrece además GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); el repo ocupa 38,0 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal con mezcla de expertos: un codificador visual y un decodificador de lenguaje MoE con 35B parámetros totales y unos 3B activos por token. La innovación principal en el lado visual es la compresión temprana de tokens dentro del propio ViT (intra-ViT early compression, procedente de LLaVA-UHD v4), que reduce el cómputo en las capas posteriores del codificador, junto con compresión mixta 4x/16x de tokens visuales para ajustar el equilibrio entre detalle y coste de inferencia.

En el lado de despliegue, el modelo se apoya en tres técnicas complementarias: Lookahead Expert Scheduling (LES), que anticipa qué expertos se van a necesitar para evitar paradas por carga de pesos desde SSD; cuantización fina por capas; y muestreo especulativo DSpark. El autor del modelo base publica además Self-Replay Fine-Tuning (SRFT), un método de ajuste fino que reduce el olvido de capacidades previas. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO.

Esta variante concreta es una cuantización FP8 del modelo BF16 original, generada con llm-compressor y almacenada en formato compressed-tensors. No se han publicado detalles adicionales sobre el proceso de cuantización (esquemas por capa, calibración) en la información disponible.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo (pipeline image-text-to-text).
- Generación de texto y respuestas conversacionales multimodales.
- Comprensión visual con compresión de tokens configurable (4x/16x) para ajustar detalle frente a coste.
- Inferencia en dispositivo (on-device) en iOS, Android y HarmonyOS, además de plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Integración con marcos de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Ajuste fino mediante SWIFT y LLaMA-Factory, y método SRFT para extender capacidades reduciendo el olvido.
- Soporte de decodificación especulativa mediante DSpark.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes visuales en móvil: el modelo puede ejecutarse en iOS, Android y HarmonyOS con más de 13 tokens/s y 3 GB de memoria en un iPhone 17 Pro Max, lo que permite integrar un asistente que describa imágenes o responda preguntas sobre la cámara en tiempo real sin depender de la nube.
- Análisis de documentos e imágenes en el borde: gracias a la compresión 4x/16x de tokens visuales, se puede procesar una imagen con menor coste cuando el detalle no es crítico (por ejemplo, clasificación de capturas) y con mayor detalle cuando se requiere lectura fina de texto en la imagen.
- Comprensión de vídeo para monitorización local: el soporte de vídeo y la inferencia on-device permiten desplegar resúmenes o alertas sobre secuencias de vídeo en dispositivos con recursos limitados, evitando enviar el material a servidores externos.
- Despliegue en servidores con FP8: esta variante cuantizada reduce la huella de memoria frente al BF16 y puede servirse con vLLM o SGLang en GPUs de centro de datos para cargas de image-text-to-text con mayor concurrencia.
- Integración en pipelines de datos multimodales: mediante llama.cpp u Ollama se puede incorporar el modelo en flujos de etiquetado o enriquecimiento de imágenes y vídeos, aprovechando su licencia Apache 2.0 para uso comercial.
- Personalización sectorial con ajuste fino: usando SWIFT o LLaMA-Factory y el método SRFT, un equipo puede adaptar el modelo a dominios concretos (por ejemplo, inspección visual industrial o asistencia médica de triaje) reduciendo el olvido de capacidades generales.
- Prototipado en hardware heterogéneo: el soporte de día cero para chips de Rockchip, Houmo, Intel, AMD y Arm facilita validar el modelo en placas embebidas y CPUs antes de decidir el despliegue final.

## Benchmarks y rendimiento

La información proporcionada indica que, en modo Instruct, la variante 35B-A3B logra una puntuación global superior a Qwen3.6 35B-A3B en menos tiempo de inferencia, y que alcanza más de 13 tokens/s con 3 GB de memoria en iPhone 17 Pro Max. No se han publicado en la información disponible las tablas numéricas de benchmarks (MMLU, HumanEval, GSM8K u otros), por lo que no se presentan cifras concretas.

| Métrica | Valor |
|---|---|
| Decodificación on-device (iPhone 17 Pro Max) | más de 13 tokens/s con 3 GB de memoria |
| Comparación global frente a Qwen3.6 35B-A3B (modo Instruct) | puntuación global superior con menor tiempo de inferencia (sin cifras publicadas) |
| MMLU, HumanEval, GSM8K, etc. | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: el repo pesa 38,0 GB, por lo que se necesita aproximadamente esa cantidad de memoria para cargar los pesos completos en GPU; con cuantizaciones de menor precisión (GGUF, AWQ, GPTQ del modelo base) la huella se reduce.
- GPU recomendadas para FP8: A100 80 GB, H100 80 GB y GPUs con soporte nativo de FP8 (por ejemplo, serie H100 o L40S). Una RTX 4090 de 24 GB no puede alojar los 38 GB de pesos FP8 completos.
- ¿Cabe en GPU de consumo? No en FP8 con los 38 GB del repo; sí en configuraciones cuantizadas de menor precisión del modelo base (GGUF/AWQ/GPTQ) y, sobre todo, en el escenario on-device con 3 GB de memoria descrito por el autor.
- Opciones de despliegue: transformers, vLLM, SGLang, llama.cpp y Ollama; también frameworks de ajuste fino SWIFT y LLaMA-Factory.
- Latencia y throughput: más de 13 tokens/s en iPhone 17 Pro Max con 3 GB; no se dispone de cifras de throughput en GPU para esta variante FP8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (FP8, esta ficha) | 35B totales, ~3B activos | no disponible | superior a Qwen3.6 35B-A3B en puntuación global con menor tiempo de inferencia (según el autor) | Apache 2.0 | Hugging Face, 26 descargas |
| Qwen3.6 35B-A3B | 35B totales, ~3B activos (A3B) | no disponible | referencia de comparación del autor | no disponible en la información | no disponible en la información |
| MiniCPM-V 4.7 35B-A3B (BF16) | 35B totales, ~3B activos | no disponible | referencia sin cuantizar | Apache 2.0 | Hugging Face (openbmb) |
| MiniCPM-V 4.7 35B-A3B-DSpark | 35B totales, ~3B activos | no disponible | variante con muestreo especulativo DSpark | no disponible en la información | Hugging Face (openbmb) |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo entrenado con datos web, es esperable un riesgo de sesgos no cuantificado.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual en la información disponible; en tareas de descripción de imágenes conviene verificar las salidas.
- Longitud de contexto e idiomas: no disponibles; no se puede garantizar un comportamiento óptimo en contextos largos ni en idiomas distintos de los mayoritarios del entrenamiento.
- Esta variante FP8 es una cuantización de terceros (AutoResearch-Lab) y no la publicación oficial de OpenBMB; para producción conviene validar la equivalencia funcional frente al BF16 original.
- El repo tiene 26 descargas y 0 likes, lo que indica una adopción muy baja y poca validación comunitaria de esta cuantización concreta.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las condiciones del modelo base y de los componentes de terceros (llm-compressor, compressed-tensors).
- El rendimiento on-device citado (13 tokens/s, 3 GB) corresponde a un dispositivo concreto (iPhone 17 Pro Max) y a la pila de despliegue del autor; no es extrapolable sin medir en el hardware objetivo.
- No se dispone de información sobre tool calling, capacidades de agente ni modo thinking, por lo que no deben asumirse en un diseño de producto.

## Enlaces

- Hugging Face (esta variante FP8): https://huggingface.co/AutoResearch-Lab/MiniCPM-V-4.7-35B-A3B-FP8
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- GitHub MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- GitHub llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- GitHub LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Documentación de despliegue MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentación MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Blog Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
