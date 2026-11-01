# Kavic/LFM3-VL-2B-litertlm

## Resumen

LFM3-VL-2B-litertlm es una conversión no oficial del modelo multimodal LiquidAI/LFM3-VL-2B al formato LiteRT-LM (`.litertlm`) de Google AI Edge, publicada por el usuario Kavic. El objetivo es habilitar la inferencia en dispositivo (on-device) de un modelo visión-lenguaje de 2.000 millones de parámetros en Android, iOS, Linux y aceleradores de borde, con un contexto máximo ampliado a 32.768 tokens. El paquete está pensado como motor del agente de inteligencia local Fulkrum Reports, aunque los ficheros son reutilizables en cualquier runtime LiteRT-LM.

El repositorio incluye cuatro bundles: un LLM de solo texto en int4 con 32k de contexto (~970 MB), un VLM int4 con 32k de contexto (~1,65 GB, visión en FP32), un VLM int4 con 4k de contexto (1,2 GB) y un VLM int8 con 4k de contexto (2,1 GB). La arquitectura subyacente es el diseño tri-híbrido de LiquidAI, que combina capas ShortConv, atención de ventana deslizante y atención completa, lo que reduce drásticamente el coste del KV cache y permite sostener 32k tokens en teléfonos con 6-8 GB de RAM.

La relevancia actual radica en que demuestra que un VLM de 2B puede ejecutarse con contexto largo y aceleración GPU/CPU en hardware móvil de gama media, sin depender de la nube. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (tri-hybrid: ShortConv + sliding-window attention + full attention) |
| Parámetros totales | 2B (según modelo base LiquidAI/LFM3-VL-2B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens (bundles 32k); 4.096 tokens (bundles 4k) |
| Tipos de cuantización | `dynamic_wi4_afp32` (int4 pesos, activaciones FP32); `dynamic_wi8_afp32` (int8 pesos, activaciones FP32); visión en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`, basado en TFLite) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-VL-2B emplea una arquitectura tri-híbrida compuesta por 12 capas ShortConv con buffers de estado circular fijos de 6 pasos (~24 KB cada una, memoria constante independiente de la longitud de secuencia), 6 capas de atención de ventana deslizante con ventana de 256 (~2 MB cada una) y únicamente 6 capas de atención completa. Solo estas últimas acumulan KV cache: para 32.768 tokens, el cache total se estima en unos 192 MB (2 × 6 capas × 2 cabezas KV × 32.768 tokens × 128 dimensión de cabeza × 2 bytes). Esta es la razón técnica por la que el contexto de 32k resulta viable en móviles.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La conversión a LiteRT-LM se realiza mediante el script `scripts/convert_lfm3_vl_to_litertlm.py`, con parámetros de `prefill_length` (128 en el ejemplo) y `cache_length` (32.768), y separa el ejecutor de visión (CPU) del decodificador de lenguaje (GPU o CPU). El bundle de solo texto evita el ejecutor de visión para esquivar un fallo de compilación del delegado de visión en Google AI Edge Gallery.

## Capacidades

- Generación de texto y razonamiento en conversaciones multi-turno.
- Procesamiento multimodal de imágenes mediante codificador de visión en FP32.
- Modo thinking opcional con bloques colapsables `<think>` de cadena de pensamiento.
- Ejecución on-device con aceleración GPU (OpenCL) o CPU (XNNPACK) en Android.
- Soporte de contexto largo de hasta 32.768 tokens en los bundles 32k.
- Ejecución híbrida: decodificador de lenguaje en GPU y codificador de visión en CPU de forma simultánea.
- Integración con Google AI Edge Gallery como modelo personalizado (tipo LLM).
- Integración nativa en la aplicación Android Fulkrum Reports mediante `EngineConfig` y `Backend.GPU()`/`Backend.CPU()`.
- Soporte de decodificación especulativa: desactivado por defecto (el modelo es híbrido y autónomo).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistencia conversacional offline en Android: el bundle de texto int4 de 32k permite mantener diálogos largos sin conexión en teléfonos de 6-8 GB de RAM, con aceleración GPU y sin errores de delegado de visión.
- Análisis de documentos e imágenes en campo: el bundle VLM int4 de 32k (~1,65 GB) permite subir capturas o fotos y hacer preguntas sobre ellas con contexto extenso, útil en apps de inspección o informes técnicos.
- Agente local de informes (Fulkrum Reports): el modelo actúa como motor de razonamiento on-device para generar y resumir informes estructurados, con ejecución híbrida GPU/CPU.
- Evaluación de precisión en dispositivo: el bundle int8 de 4k (2,1 GB) sirve para comparar la degradación de calidad frente a int4 en tareas específicas antes de desplegar en producción.
- Prototipado rápido en Google AI Edge Gallery: importar el bundle de texto y ajustar TopK=64, TopP=0,95 y temperatura=1,00 permite validar prompts y flujos sin escribir código.
- Aplicaciones de accesibilidad: descripción de imágenes y lectura asistida en tiempo real en el propio dispositivo, sin enviar datos a servidores externos.
- Despliegue en Linux y aceleradores de borde: los bundles `.litertlm` pueden ejecutarse en runtimes LiteRT-LM fuera de Android para kioscos, dispositivos IoT o estaciones de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~970 MB para el bundle de texto int4 32k; ~1,65 GB para el VLM int4 32k; 1,2 GB para el VLM int4 4k; 2,1 GB para el VLM int8 4k. A esto se suma el KV cache (~192 MB a 32k tokens) y el overhead del runtime.
- Memoria recomendada: 6-8 GB de RAM en móvil para el contexto completo de 32k sin OOM, según el autor.
- GPU recomendadas: GPU integrada OpenCL de Android (recomendada para generación rápida); CPU con XNNPACK como alternativa estable en cualquier chipset. No se especifican modelos de GPU de escritorio (A100, H100, RTX 4090) porque el objetivo es borde.
- ¿Cabe en GPU de consumo? El modelo está diseñado para GPU móviles e integradas; no se proporcionan datos para GPU de escritorio dedicadas.
- Opciones de despliegue: Google AI Edge Gallery (Android), runtime LiteRT-LM, aplicación Fulkrum Reports (Kotlin, `Engine`/`EngineConfig`), y potencialmente Linux e iOS según el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-litertlm (esta ficha) | 2B | 32.768 / 4.096 tokens | LiteRT-LM | Apache 2.0 | HuggingFace (Kavic) |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | safetensors (presumible) | Apache 2.0 | HuggingFace (LiquidAI) |
| Gemma-4-E2B-it | no disponible | no disponible | LiteRT-LM | no disponible | Google AI Edge (citado como referencia en la model card) |

La model card menciona Gemma-4-E2B-it como referencia de comportamiento en Edge Gallery (fallo del delegado de visión con bundles multimodales), pero no aporta datos de rendimiento comparativo. No se dispone de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio pertenece a Kavic, no a LiquidAI ni a Google; no hay garantía de soporte ni de actualizaciones.
- El bundle multimodal falla al importarse en Google AI Edge Gallery por un error de compilación del delegado de visión (`vision_litert_compiled_model_executor.cc:357`); para chat en esa app debe usarse el bundle de solo texto.
- La decodificación especulativa debe permanecer desactivada; el modelo es híbrido y no se beneficia de ella según el autor.
- Los bundles de 4k limitan el contexto a 4.096 tokens; solo los bundles 32k ofrecen la ventana completa.
- La cuantización int4 puede degradar la calidad frente a int8 o FP32; no se publican métricas de esa degradación.
- Idiomas soportados no especificados: riesgo de comportamiento irregular fuera del inglés y de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación inherente a modelos de 2B; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión de terceros conviene verificar los términos del modelo base LiquidAI/LFM3-VL-2B.
- El rendimiento depende del chipset y del delegado (GPU OpenCL vs CPU XNNPACK); no se publican latencias ni throughput.
- El tamaño del repo (8,0 GB) incluye todos los bundles, no un único fichero.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Kavic/LFM3-VL-2B-litertlm
- Ficheros y versiones: https://huggingface.co/Kavic/LFM3-VL-2B-litertlm/tree/main
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio Fulkrum Reports: https://github.com/Kavics7/Fulkrum-Reports
- Google AI Edge Gallery: no disponible en la información proporcionada (mencionada sin URL)
- Paper de LiquidAI/LFM3: no disponible en la información proporcionada
