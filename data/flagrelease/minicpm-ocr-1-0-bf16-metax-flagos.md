# FlagRelease/MiniCPM-OCR-1.0-BF16-metax-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento de texto desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300.434.160 parámetros (aproximadamente 1,3B), está diseñado para escenarios documentales del mundo real: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas, con soporte para extracción de texto, fórmulas y tablas complejas, así como extracción de información clave.

La versión publicada bajo el identificador FlagRelease/MiniCPM-OCR-1.0-BF16-metax-FlagOS es una adaptación del modelo original para la pila de software FlagOS sobre hardware MetaX, distribuida en formato BF16 con pesos safetensors. FlagOS es una pila de software de sistema completamente open source que facilita la adaptación multi-chip; en este caso, permite ejecutar el modelo sobre aceleradores MetaX con vLLM y el plugin FL.

El modelo resulta relevante porque demuestra que un modelo de solo 1,3B parámetros puede alcanzar métricas competitivas en parsing documental (93,68 en Real5-OmniDocBench según la model card) y porque su adaptación a hardware alternativo a NVIDIA reduce la dependencia de un único proveedor de cómputo. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de parsing documental; tipo `minicpm_ocr`) |
| Parámetros totales | 1.300.434.160 (~1,3B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | hasta 262.144 tokens en la configuración de servido vLLM (`--max-model-len 262144`) |
| Tipos de cuantización | BF16 (esta release); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza multimodal orientada a OCR y parsing documental (etiqueta de pipeline `minicpm_ocr`, entrada de imágenes y salida de texto estructurado como Markdown). El repositorio corresponde a una release de pesos en BF16 para la pila FlagOS sobre MetaX, no a la model card original del entrenamiento, por lo que no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Sí se documentan innovaciones de despliegue y decodificación: la model card menciona aceleración de decodificación DSpark, que según el autor mejora la eficiencia de procesamiento extremo a extremo en un 55%. La configuración de servido incluye backend de atención `TORCH_SDPA` para el encoder multimodal, prefix caching, `block-size 512` y límite de 4 imágenes y 1 vídeo por prompt. La adaptación FlagOS reporta que, sobre la misma plataforma, OCR 1.0 alcanza hasta 1,69× el throughput nativo P50 por unidad de cómputo pico en comparación con la pila nativa.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, incluyendo escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parsing de documentos a texto estructurado (por ejemplo, conversión de una página a Markdown).
- Reconocimiento y transcripción de fórmulas matemáticas.
- Parsing de tablas complejas.
- Extracción de información clave de documentos.
- Procesamiento multimodal de imagen (hasta 4 imágenes por prompt en la configuración de servido) y vídeo (1 por prompt).
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) a través de vLLM.
- Soporte de contexto largo de hasta 262.144 tokens en la configuración desplegada.
- Capacidades de tool calling, agentes y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de archivos escaneados: el modelo convierte páginas de documentos en Markdown estructurado, adecuado para pipelines de ingestión documental gracias a su capacidad de manejar escaneos y páginas curvadas.
- Extracción de datos de facturas y formularios: la funcionalidad de extracción de información clave permite recuperar campos estructurados de documentos administrativos sin plantillas rígidas.
- Procesamiento de documentación científica: el reconocimiento de fórmulas y tablas complejas lo hace apto para convertir papers y manuales técnicos a formatos legibles por máquina.
- Ingestión de conocimiento para RAG: al generar Markdown limpio a partir de imágenes, alimenta bases vectoriales y sistemas de recuperación aumentada con contexto de hasta 262.144 tokens para documentos extensos.
- Despliegue sobre hardware no NVIDIA: la release FlagOS-MetaX permite montar el servicio en clústeres MetaX con vLLM, útil en organizaciones con infraestructura heterogénea o requisitos de soberanía de cómputo.
- Integración en asistentes de escritorio: la guía de integración con AnythingLLM y la API compatible con OpenAI permiten conectarlo a interfaces de chat corporativas para consultas sobre documentos.
- Control de calidad documental en lote: combinado con MiniCPM-OCR Jev (el modelo "inspector" de 2B), puede formar parte de un pipeline donde Jev puntúa la fiabilidad del parsing y marca contenido para revisión humana.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Metax-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 76,5 |
| omni_doc_bench_v1_6 | 96,4585 | 95,9 |

Datos adicionales de la model card: 93,68 en Real5-OmniDocBench para el modelo de 1,3B; mejora del 55% en eficiencia extremo a extremo con decodificación DSpark; hasta 1,69× throughput nativo P50 por unidad de cómputo pico en la build FlagOS. El modelo Jev (2B) alcanza un AUROC de 0,936 en JevOCRBench, frente a 0,938 de Qwen3.5-397B-A17B.

## Requisitos de hardware

- VRAM estimada: con 1,3B parámetros en BF16, los pesos ocupan aproximadamente 2,6 GB (tamaño del repo); la VRAM total necesaria para inferencia con KV cache y encoder multimodal es mayor, aunque la configuración de referencia usa `--gpu-memory-utilization 0.55`.
- GPU recomendadas: la release está validada sobre aceleradores MetaX (driver MACA 3.8.1.3) con la imagen `minicpm-ocr-1.0-metax-c550-gems5.5.0-pluginfl`; el modelo original se evalúa sobre NVIDIA.
- GPU de consumo: por tamaño (1,3B en BF16) es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no se confirma en la información disponible.
- Opciones de despliegue: vLLM 0.24.0 con vLLM-plugin-FL (`support-minicpm-ocr`), FlagGems 5.5.0, Triton 3.6.0 (FlagTree), transformers 5.17.0; contenedor Docker preconfigurado para MetaX. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: en dispositivos ARM edge, el modelo Jev (2B) completa una evaluación de bloque de página en 1,20 s de media usando solo CPU M5; para OCR 1.0 no se publican cifras absolutas de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | ~1,3B | hasta 262.144 tokens (config. vLLM) | 93,68 Real5-OmniDocBench; 80,5 OcrBench (NVIDIA) | Apache 2.0 | Hugging Face / ModelScope, build FlagOS-MetaX |
| MiniCPM-OCR Jev | 2B | no disponible | AUROC 0,936 en JevOCRBench | no disponible | open source según model card |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | AUROC 0,938 en JevOCRBench | no disponible | no disponible |

La comparativa con otros modelos de OCR especializados (por ejemplo, variantes de PaddleOCR o Donut) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en otras lenguas no está documentado.
- La build FlagOS-MetaX pierde rendimiento frente a la nativa NVIDIA (OcrBench 76,5 frente a 80,5; omni_doc_bench 95,9 frente a 96,4585), por lo que la elección de plataforma afecta a la calidad de salida.
- Riesgo de alucinación en la transcripción de documentos degradados, manuscritos o layouts atípicos; la propia model card justifica el modelo Jev precisamente porque la salida parseada aún requiere verificación humana.
- No hay información publicada sobre sesgos demográficos o culturales del modelo.
- Límite de 4 imágenes y 1 vídeo por prompt en la configuración de servido de referencia.
- La licencia Apache 2.0 permite uso comercial, pero esta release concreta es una adaptación de terceros (FlagRelease); conviene verificar la procedencia de los pesos originales antes de producción.
- El repositorio tiene muy poca tracción (8 descargas, 0 likes) y fue creado en octubre de 2026; no hay evidencia comunitaria extensa de su robustez en producción.
- La información de arquitectura y entrenamiento es escasa; no se puede evaluar la calidad del dataset ni posibles contaminaciones de benchmark.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-metax-FlagOS
- AnythingLLM: https://anythingllm.com/
- Repositorio de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-1.0-metax-FlagOS`
- Imagen Docker FlagOS-MetaX: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-metax-c550-gems5.5.0-pluginfl-0601420-vllm0.24.0-maca3.8.1.3:20261021`
- Paper, blog o repositorio del modelo original de ModelBest/OpenBMB: no disponible en la información proporcionada.
