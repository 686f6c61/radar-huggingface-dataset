# HanzoHuang/Qwen3-VL-2B-Instruct-RKLLM

## Resumen

Qwen3-VL-2B-Instruct-RKLLM es un empaquetado del modelo multimodal Qwen3-VL-2B-Instruct de Alibaba Cloud, convertido por HanzoHuang para ejecutarse en las NPU de las placas Rockchip RK3576 y RK3588 mediante RKLLM Toolkit 1.3.1 y RKNN Toolkit2 2.5.0. No se trata de un modelo nuevo ni de un reentrenamiento: es una exportación cuantizada del modelo base de 2B parámetros, distribuida como un fichero `.rkllm` para el modelo de lenguaje y un fichero `.rknn` para el encoder de visión.

El problema que resuelve es concreto: permitir inferencia visión-lenguaje local en hardware embebido sin GPU, con un consumo de RAM adicional de entre 2,57 y 3,18 GB y velocidades de decodificación de 9,02 a 14,05 tokens por segundo según placa y cuantización. El runtime admite texto y una única imagen como entrada, y devuelve texto; no soporta vídeo ni audio.

Su relevancia es la de un artefacto de despliegue para edge computing: ventana de exportación de 8192 tokens, API compatible con OpenAI servida desde un contenedor Docker, y variantes W4A16-g128 y W8A8 para ajustar memoria y velocidad. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque la validación publicada se limita a pruebas funcionales y numéricas, no a benchmarks amplios de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM denso del linaje Qwen3-VL (transformer multimodal), distribuido como modelo de lenguaje y encoder de visión separados |
| Parámetros totales | 2B (aproximadamente 2000 millones), según el nombre del modelo base; desglose por componente no disponible |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 8192 tokens en la exportación; 4096 validados en pruebas de API; 2048 en el benchmark de velocidad |
| Tipos de cuantización | W4A16-g128 con GRQ y W8A8 para el modelo de lenguaje; encoder de visión en RKNN |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rkllm` (modelo de lenguaje) y `.rknn` (encoder de visión); no se listan safetensors ni GGUF |
| Plataformas soportadas | Rockchip RK3576 y RK3588 |
| Entrada | Texto más una imagen RGB de 448 × 448, batch 1, 196 tokens de imagen |
| Salida | Texto |
| Tamaño de artefactos | Lenguaje: 1,74 GiB (RK3576 W4A16-g128), 2,28 GiB (RK3576 W8A8), 2,22 GiB (RK3588 W8A8); visión: 0,81 GiB (RK3576) y 0,80 GiB (RK3588) |
| Runtime | RKLLM 1.3.1 y RKNN Toolkit2 2.5.0; contenedor `rkllm-docker` con API compatible con OpenAI |
| Tamaño del repositorio | 8,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-2B-Instruct, un VLM de Alibaba Cloud con arquitectura transformer densa que combina un encoder de visión con un modelo de lenguaje. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se documenta ningún reentrenamiento o ajuste fino por parte del autor de la conversión: el proceso descrito es exclusivamente de exportación y cuantización.

La conversión fija la entrada visual en RGB a 448 × 448, con 196 tokens de imagen, normalización mean/std de 0.5, padding a cuadrado con RGB 127 y redimensionado bilineal. La salida del encoder sigue el orden pooler más tres características deepstack por token. La calibración se realizó con los 20 ejemplos imagen-texto del SDK, capturados mediante el procesador de origen y un hook de entrada del modelo de lenguaje; W4A16-g128 usa GRQ y W8A8 usa cuantización normal, con carga en float32 sobre CUDA y reparto en dos núcleos NPU en RK3576 y tres en RK3588. Se aplicaron correcciones de compatibilidad para seleccionar las cuatro salidas de visión con Transformers 5.

La fidelidad numérica del encoder de visión frente a los embeddings originales en float32 es de 0,99767705 en RK3576 y 0,99805251 en RK3588 (similitud coseno). Los tres artefactos superaron siete comprobaciones funcionales de API en su placa objetivo: aritmética, peticiones independientes, SSE, recuerdo exacto de conversación, descripción de imagen, color de imagen por SSE y texto posterior a una imagen.

## Capacidades

- Generación de texto e inferencia imagen-a-texto con una sola imagen por petición.
- Respuesta a preguntas visuales (VQA) y descripción de imágenes, verificadas en las pruebas de humo del autor.
- Conversaciones multi-turno con recuperación exacta del contexto, según la prueba de "exact conversation recall".
- Streaming de respuestas mediante Server-Sent Events (SSE).
- Servicio HTTP con interfaz compatible con OpenAI para peticiones de imagen, a través del contenedor `rkllm-docker`.
- Procesamiento local en NPU, sin dependencia de GPU ni de servicios en la nube.
- Sin soporte de vídeo ni audio en este runtime.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado para este runtime.
- Modo thinking explícito: no documentado.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- **Atención visual en kioscos y tótems interactivos**: el modelo puede describir productos o responder preguntas sobre una imagen capturada por la cámara del dispositivo, con inferencia local y sin enviar datos a la nube. Es adecuado por su bajo consumo de RAM (2,57-3,18 GB adicionales) y su integración mediante API compatible con OpenAI.
- **Inspección visual en línea de producción**: clasificación y descripción de defectos visibles en una imagen fija de 448 × 448. La resolución fija y la cuantización limitan la precisión, por lo que encaja mejor como primer filtro o como asistente para operarios que como sistema de metrología.
- **Domótica y robótica de bajo consumo**: interpretación de lo que ve una cámara doméstica o un robot móvil para decidir acciones simples, ejecutándose íntegramente en la NPU de la placa y liberando la CPU para el control de actuadores.
- **Descripción de imágenes para accesibilidad**: generación de texto alternativo en dispositivos portátiles o paneles informativos, con la ventaja de que la imagen no abandona el dispositivo.
- **Verificación documental en almacén o punto de venta**: consultas sobre una fotografía de una etiqueta, un albarán o un estante para responder preguntas concretas en lenguaje natural, integrado en una aplicación de terminal ligera.
- **Prototipado e investigación en edge AI**: banco de pruebas para medir latencia, consumo y degradación por cuantización en cargas multimodales sobre RK3576 y RK3588, con artefactos versionados y sumas SHA-256 publicadas.
- **Asistentes de campo con requisitos de privacidad**: técnicos que fotografían equipos o instalaciones y formulan preguntas sin conexión, manteniendo las imágenes dentro del hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que las pruebas realizadas son comprobaciones funcionales y numéricas, no un benchmark amplio de calidad.

Rendimiento medido el 2026-10-22:

| Placa | Cuantización | Decodificación (tok/s) | RAM de arranque (GB) | RAM estable (GB) |
|---|---|---:|---:|---:|
| RK3576 | W4A16-g128 | 11,11 | 2,60 | 2,57 |
| RK3576 | W8A8 | 9,02 | 3,18 | 3,18 |
| RK3588 | W8A8 | 14,05 | 3,03 | 3,07 |

Metodología: mediana de la tasa nativa de decodificación sobre tres ejecuciones de 128 tokens, tras un calentamiento de 32 tokens, decodificación greedy, EOS ignorado y contexto de 2048. La RAM es el uso adicional sobre una línea base de cinco segundos en reposo: pico de carga muestreado y mediana en estado listo tras diez segundos, en GB decimales. El encoder correspondiente está cargado y `embed_flash=1`. El tiempo hasta el primer token no se publica (permanece en el informe privado). La medición de RK3576 W8A8 se realizó con swap zram desactivado temporalmente.

| Placa | Similitud coseno del encoder de visión frente a float32 |
|---|---:|
| RK3576 | 0,99767705 |
| RK3588 | 0,99805251 |

## Requisitos de hardware

- **NPU Rockchip obligatoria**: RK3576 o RK3588. El formato `.rkllm`/`.rknn` no se ejecuta en GPU convencional sin una reconversión.
- **VRAM**: no aplica; el modelo usa memoria del sistema. Uso adicional medido de 2,57 GB (RK3576 W4A16-g128), 3,18 GB (RK3576 W8A8) y 3,03-3,07 GB (RK3588 W8A8).
- **Almacenamiento**: entre 2,54 y 3,09 GiB por combinación de modelo de lenguaje y encoder de visión; el repositorio completo ocupa 8,4 GB.
- **GPU consumer**: no es compatible de forma directa. Para ejecutar el modelo base en una RTX 4090, A100 o H100 sería necesario usar los pesos originales de Qwen3-VL-2B-Instruct con otro runtime, no estos artefactos.
- **Opciones de despliegue**: contenedor `ghcr.io/hanzo-huang/rkllm-docker:env-latest` con el comando `serve --max_context_len 4096`, variables `MODEL_KIND=vlm`, `TARGET_PLATFORM`, `MODEL_FILE`, `VISION_MODEL_FILE` y `RKLLM_EMBED_FLASH=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 11,11 tok/s en RK3576 W4A16-g128, 9,02 tok/s en RK3576 W8A8 y 14,05 tok/s en RK3588 W8A8. El tiempo hasta el primer token no está disponible.
- **Contexto en producción**: el ejemplo de arranque usa 4096 tokens; la exportación es de 8192, pero el autor advierte que no se ha validado contexto mayor en estas placas.
- **Consideración térmica y de relojes**: las mediciones dependen de la placa, los relojes, la refrigeración y la carga de fondo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Plataforma | Rendimiento | Licencia |
|---|---|---:|---|---|---|
| Qwen3-VL-2B-Instruct-RKLLM (este repositorio) | 2B | 8192 en exportación; 4096 validado | NPU RK3576/RK3588 | 9,02-14,05 tok/s según placa y cuantización | Apache 2.0 |
| Qwen3-VL-2B-Instruct original | 2B | No disponible en la información proporcionada | GPU/CPU con Transformers u otros runtimes | No disponible | Apache 2.0 |
| Qwen3-VL-2B-Instruct para Qualcomm AI Hub | 2B | No disponible en la información proporcionada | Dispositivos Qualcomm con exportación optimizada | No disponible en la información proporcionada | Apache 2.0 del modelo base; condiciones del exportador no disponibles |

La comparación relevante no es de calidad, sino de formato de despliegue: este repositorio es la única de las tres opciones lista para ejecutarse en NPU Rockchip sin trabajo adicional de conversión. Frente al modelo original, pierde flexibilidad de contexto y resolución de imagen, y gana ejecución local con un consumo de memoria acotado. Frente a la exportación de Qualcomm, cambia el fabricante de silicio objetivo.

## Limitaciones y advertencias

- **Una sola imagen por petición** y resolución fija de 448 × 448 con 196 tokens visuales; no hay soporte de vídeo ni audio en este runtime.
- **Pérdida por cuantización**: la similitud coseno del encoder de visión es de aproximadamente 0,998, y el autor advierte que la cuantización y la resolución fija pueden reducir la precisión.
- **Contexto no validado por encima de 4096 tokens**: la exportación es de 8192, pero las pruebas funcionales usaron 4096 y el benchmark 2048. No hay evidencia publicada de estabilidad con contextos mayores.
- **Ausencia de benchmarks de calidad**: no hay MMLU, HumanEval, GSM8K ni evaluaciones equivalentes; las pruebas son de humo funcional y numérico.
- **Riesgo de alucinación**: inherente al modelo base Qwen3-VL-2B-Instruct; no se documentan mitigaciones específicas en esta conversión.
- **Sesgos**: no se documentan evaluaciones de sesgo. Al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento, no disponibles en la información proporcionada.
- **Idiomas**: no se especifica la lista de idiomas soportados; no debe asumirse cobertura multilingüe sin verificación.
- **Licencia**: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base, del SDK de Rockchip y de la imagen Docker del runtime, no detalladas aquí.
- **Dependencia de hardware**: el artefacto está ligado a RK3576 y RK3588; no es portable a otras NPU o GPU sin reconversión.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y es una conversión de la comunidad, no una publicación oficial de Qwen.
- **Tool calling y agentes**: no documentados; no deben asumirse en producción sin pruebas propias.
- **Medición con swap desactivado**: la cifra de RK3576 W8A8 se obtuvo desactivando temporalmente zram; en un despliegue real con swap activo el comportamiento de memoria puede diferir.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HanzoHuang/Qwen3-VL-2B-Instruct-RKLLM
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base en ModelScope: https://www.modelscope.ai/models/Qwen/Qwen3-VL-2B-Instruct
- Runtime y documentación: https://github.com/Hanzo-Huang/rkllm-docker
- Imagen Docker: ghcr.io/hanzo-huang/rkllm-docker:env-latest
- Qwen3-VL-2B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_2b_instruct
- Exportación para Qualcomm en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_vl_2b_instruct/README.md
- Ficha en The Applied: https://theapplied.co/models/qwen-qwen3-vl-2b-instruct
