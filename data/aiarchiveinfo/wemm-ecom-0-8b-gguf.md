# AIArchiveInfo/WeMM-Ecom-0.8B-GGUF

## Resumen

WeMM-Ecom-0.8B-GGUF es la edición cuantizada en formato GGUF de WeMM-Ecom-0.8B, un modelo multimodal de tipo image-text-to-text desarrollado por WeChat Vision (Tencent) y orientado a la comprensión de contenido en entornos de comercio electrónico. El modelo original se publica en BF16, y esta variante combina los pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, lo que permite su despliegue con llama.cpp tanto en línea de comandos como mediante un servidor local compatible con la API de OpenAI.

Se trata de un modelo denso de aproximadamente 752 millones de parámetros (0,8B), construido sobre la familia Qwen3.5, con una ventana de contexto de 262.144 tokens y soporte para razonamiento híbrido (modo instruct y modo thinking). Su relevancia radica en que ofrece capacidades específicas de comercio electrónico —atributos de producto, moderación, OCR, retrieval, grounding y razonamiento sobre productos— en un tamaño muy reducido, apto para hardware de consumo.

Según la model card, el checkpoint BF16 supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de comercio electrónico, manteniendo además un rendimiento general competitivo. Esta edición GGUF está pensada para inferencia local eficiente con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia Qwen3.5 |
| Parámetros totales | 752.393.024 (0,8B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal); el modelo base ofrece además BF16, FP8 y GPTQ |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`WeMM-Ecom-0.8B-GGUF.gguf` + `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 0,8B parámetros con arquitectura multimodal de tipo image-text-to-text, construido sobre la base Qwen3.5. Incorpora un proyector multimodal que en esta edición GGUF se distribuye en precisión F16 como archivo independiente (`mmproj-F16.gguf`), mientras que los pesos del modelo de lenguaje se cuantizan a Q4_K_M. El modelo soporta razonamiento híbrido, con modos instruct y thinking diferenciados en la evaluación publicada.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que la familia WeMM-Ecom se ha entrenado con foco en comercio electrónico (comprensión de producto, moderación, OCR, retrieval, grounding) y que mantiene capacidades generales comparables a modelos del mismo tamaño. No se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes (image-text-to-text).
- Comprensión de atributos de producto en contextos de comercio electrónico.
- Moderación de contenido.
- OCR (reconocimiento de texto en imágenes).
- Retrieval y grounding visual.
- Razonamiento sobre productos y conocimiento de catálogo.
- Comprensión de documentos y gráficos, razonamiento STEM y comprensión espacial (según los benchmarks generales citados).
- Comprensión multi-imagen, conteo y seguimiento de instrucciones.
- Modo thinking (razonamiento extendido) e instruct, seleccionables.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos (color, talla, material, categoría) a partir de imágenes de producto, aprovechando sus benchmarks específicos de atributos de producto y su ventana de 262.144 tokens para procesar lotes de fichas.
- Moderación de listados en marketplaces: clasificación de imágenes y texto de anuncios para detectar contenido no permitido, apoyándose en las capacidades de moderación evaluadas en la suite de comercio electrónico.
- Extracción de texto en imágenes de producto (OCR): lectura de etiquetas, precios y especificaciones desde fotos, útil para enriquecer fichas y verificar datos.
- Búsqueda visual y retrieval: generación de descripciones y representaciones de producto para motores de búsqueda internos, con grounding sobre la imagen original.
- Asistente conversacional de atención al cliente: gestión de consultas multi-turno sobre productos con contexto largo, desplegado localmente mediante llama-server con API compatible con OpenAI.
- Procesamiento en el borde o en local: al ser un modelo de 0,8B en Q4_K_M, puede ejecutarse en equipos sin GPU dedicada o con GPU de consumo, adecuado para prototipos y despliegues con requisitos de privacidad.
- Enriquecimiento de documentación y gráficos de producto: comprensión de fichas técnicas, tablas comparativas y gráficos para respuestas automáticas.

## Benchmarks y rendimiento

La model card proporciona comparaciones agregadas del checkpoint BF16 (escala 0-100) frente a modelos de tamaño similar, pero los resultados detallados se presentan como imágenes y no como cifras textuales.

| Comparación | Diferencia en media (puntos) |
|---|---|
| E-commerce: WeMM-Ecom-0.8B vs. Qwen3.5-0.8B | +16,43 |
| E-commerce: WeMM-Ecom-0.8B vs. MiniCPM-V-4.7-1B | +13,03 |
| General: WeMM-Ecom-0.8B vs. Qwen3.5-0.8B | +6,93 |
| General: WeMM-Ecom-0.8B vs. MiniCPM-V-4.7-1B | +1,09 |

La evaluación cubre 28 benchmarks de comercio electrónico en ocho escenarios y 64 benchmarks generales en ocho categorías. No se han publicado en la información disponible resultados numéricos individuales (MMLU, HumanEval, GSM8K, etc.) ni métricas de latencia o throughput para la versión GGUF.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,7 GB en total; con pesos Q4_K_M y proyector F16, la inferencia cabe holgadamente en menos de 2 GB de memoria, aunque el consumo real depende del contexto y del backend.
- GPU recomendadas: cualquier GPU con CUDA compatible con llama.cpp; no se requieren A100 ni H100. Funciona también en CPU.
- GPU de consumo: sí, cabe en tarjetas de gama baja y en equipos sin GPU dedicada; la model card incluye instrucciones para compilación CPU (`-ngl 0` y `--no-mmproj-offload`).
- Opciones de despliegue: llama.cpp (versión fijada en el commit `a8f8294c45076538f4509754e4c79fc51a1a486b`), con `llama-cli` y `llama-server` (API compatible con OpenAI). Backends soportados: CUDA, CPU, Metal, Vulkan y otros según la guía oficial de llama.cpp. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-GGUF | 0,8B (752M) | 262.144 tokens | Multimodal e-commerce | Apache 2.0 | GGUF; base en BF16, FP8, GPTQ |
| Qwen3.5-0.8B | 0,8B | no disponible | Multimodal general | no disponible | no disponible |
| MiniCPM-V-4.7-1B | 1B | no disponible | Multimodal general | no disponible | no disponible |

Según la model card, WeMM-Ecom-0.8B supera a Qwen3.5-0.8B y a MiniCPM-V-4.7-1B en la media de benchmarks de comercio electrónico y generales. No se dispone de más datos de contexto, licencia o formatos de estos modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Sesgos: no se documentan sesgos específicos; al estar entrenado con datos de comercio electrónico de WeChat, puede reflejar sesgos de ese dominio y mercado.
- Alucinación: como todo modelo generativo multimodal, puede producir descripciones o atributos incorrectos, especialmente en imágenes de baja calidad o productos poco representados.
- Contexto: aunque la ventana es de 262.144 tokens, el rendimiento real con contextos muy largos no está documentado para esta cuantización.
- Cuantización: la versión Q4_K_M puede degradar ligeramente la precisión respecto al checkpoint BF16; los benchmarks publicados corresponden al BF16.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE enlazado en el repositorio del modelo base.
- Producción: no se han publicado métricas de latencia, throughput ni robustez en despliegues reales; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse en pipelines de agentes.

## Enlaces

- Hugging Face (esta edición GGUF): https://huggingface.co/AIArchiveInfo/WeMM-Ecom-0.8B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Edición GGUF oficial de Tencent: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Edición FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Edición GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
