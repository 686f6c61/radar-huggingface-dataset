# alvarolizama/LFM3-Omni-2B-MLX-oQ8-fp16

## Resumen

LFM3-Omni-2B-MLX-oQ8-fp16 es una cuantización mixta del modelo LFM3-Omni-2B, publicada por el usuario alvarolizama en Hugging Face. Se trata de un checkpoint multimodal (lenguaje, visión y audio) convertido al formato MLX para su ejecución en hardware Apple Silicon, generado con la herramienta oQ (oMLX v0.7.3) mediante cuantización de precisión mixta. El modelo base LFM3-Omni-2B es un modelo omni de 2.167 millones de parámetros que integra codificadores de visión y audio junto a un modelo de lenguaje.

El checkpoint resultante tiene un tamaño de 3,2 GB en disco y un promedio efectivo de 11,743 bits por peso, combinando capas en 8 bits afines con grupo de 64 (86,187% de los pesos), capas en FP16 (0,020%) y capas en FP32 (13,793%). La mayor parte de los pesos en FP32 corresponde a los componentes de visión (0,189B) y audio (0,110B), mientras que el modelo de lenguaje (1,868B) se almacena principalmente en 8 bits.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar un modelo omni de 2B en equipos Apple Silicon mediante MLX, con un consumo de almacenamiento reducido. No obstante, se trata de una publicación de un tercero, sin model card descriptiva del modelo base, sin licencia declarada y sin datos de benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni con componentes de lenguaje, visión y audio; familia lfm3_omni) |
| Parametros totales | 2.166.928.384 (2,167B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 8-bit grupo 64 (86,187%), FP16 (0,020%), FP32 (13,793%); promedio 11,743 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), custom_code |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,868B | 1,985 GB / 1,849 GiB |
| Visión | 0,189B | 0,758 GB / 0,705 GiB |
| Audio | 0,110B | 0,438 GB / 0,408 GiB |
| Total | 2,167B | 3,181 GB / 2,962 GiB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-Omni-2B en la documentación proporcionada. Por los componentes declarados en el desglose de almacenamiento, se trata de un modelo omni que combina un modelo de lenguaje (1,868B de pesos lógicos) con un codificador de visión (0,189B) y un codificador de audio (0,110B). El tag `lfm3_omni` sugiere la familia LFM3 Omni, pero no se detalla si emplea transformer denso, MoE u otra variante, ni los datos de entrenamiento, el número de tokens, la composición del dataset o si hubo RLHF/DPO.

Respecto al proceso de cuantización, sí hay información concreta: se aplicó la herramienta oQ (oMLX v0.7.3) con cuantización de precisión mixta. Los pesos del modelo de lenguaje se almacenan mayoritariamente en affine 8-bit con grupo de 64, mientras que los componentes de visión y audio se mantienen en FP32, y una fracción mínima en FP16. Esta estrategia preserva la precisión de los módulos multimodales, que suelen ser más sensibles a la cuantización, mientras reduce el coste del modelo de lenguaje. El checkpoint requiere `custom_code` para cargarse, lo que implica dependencia de código específico del repositorio.

## Capacidades

- Generación de texto multimodal: el modelo base es omni, con componentes separados de lenguaje, visión y audio.
- Procesamiento de imágenes: incluye un codificador de visión de 0,189B de parámetros.
- Procesamiento de audio: incluye un codificador de audio de 0,110B de parámetros.
- Ejecución en Apple Silicon mediante MLX, con pesos en formato safetensors compatible con la librería `mlx`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, decodificación especulativa u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo omni en Mac: el checkpoint está pensado para ejecutarse con MLX en equipos Apple Silicon, con 3,2 GB de almacenamiento, lo que permite probar un modelo multimodal de 2B en un portátil sin GPU dedicada.
- Prototipado de aplicaciones de visión y lenguaje en local: el codificador de visión en FP32 permite experimentar con tareas de descripción de imágenes o VQA en un entorno de desarrollo sin depender de servicios en la nube.
- Experimentación con audio en local: el codificador de audio permite construir prototipos de transcripción o comprensión de audio en hardware Apple, aunque sin datos publicados sobre su calidad.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como caso de estudio de oQ/oMLX, comparando la distribución 8-bit/FP16/FP32 y su impacto en la calidad frente al modelo original.
- Integración en pipelines de MLX: al usar safetensors y `custom_code`, puede incorporarse en scripts de MLX para experimentos de investigación reproducibles en macOS.
- Docencia y demostraciones: su tamaño reducido (3,2 GB) y su naturaleza multimodal lo hacen adecuado para demostraciones de modelos omni en aulas o talleres con equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el checkpoint ocupa 3,2 GB en disco (2,962 GiB de pesos); la memoria unificada necesaria para inferencia será algo superior por los estados intermedios, pero no se ha publicado una cifra concreta.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4); no se indica compatibilidad con GPU NVIDIA o AMD.
- GPU de consumo: al estar en formato MLX, está orientado a Mac con memoria unificada; no se dispone de datos para GPU de consumo tipo RTX 4090.
- Opciones de despliegue: librería `mlx` (el repo declara `library_name: mlx`); requiere `custom_code` para la carga. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-oQ8-fp16 | 2,167B | no disponible | no disponible | safetensors MLX (8-bit mixto) | Hugging Face, 0 descargas |
| LFM3-Omni-2B (base) | 2,167B | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Publicación de terceros: el checkpoint lo ha generado el usuario alvarolizama, no el equipo que desarrolló el modelo base; no hay garantías de fidelidad respecto al original.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y debe consultarse con el autor del modelo base.
- Sin model card del modelo base: no hay información sobre arquitectura, entrenamiento, idiomas, contexto ni sesgos.
- Cuantización con pérdida: el 86,187% de los pesos del modelo de lenguaje está en 8 bits, lo que puede degradar la calidad frente al checkpoint original; no se han publicado evaluaciones comparativas.
- Dependencia de `custom_code`: la carga requiere código personalizado, lo que añade riesgo de mantenimiento y compatibilidad.
- Ecosistema restringido: solo funciona con MLX en Apple Silicon; no es portable a CUDA sin conversión adicional.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Sin métricas de uso: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alvarolizama/LFM3-Omni-2B-MLX-oQ8-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
