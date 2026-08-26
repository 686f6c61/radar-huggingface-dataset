# Emerald7664/OmniVoice-Onnx-bidirectional

## Resumen

OmniVoice es un modelo de texto a voz (TTS) zero-shot y multilingüe desarrollado por el equipo k2-fsa, que permite generar voz a partir de texto en más de 600 idiomas, clonar voces de una muestra breve y diseñar voces sintéticas. Este repositorio concreto, `Emerald7664/OmniVoice-Onnx-bidirectional`, es una exportación a ONNX del modelo original con una corrección crítica: el backbone `llm_decoder` (basado en Qwen3-0.6B) se ha reexportado para que pueda atender de forma bidireccional, algo que el modelo de difusión enmascarada exige y que el export previo (de `onnx-community`) no hacía, resultando en una salida ininteligible.

El modelo emplea una arquitectura de difusión enmascarada sobre un grid de 8 codebooks de audio (codec Higgs Audio V2), con un bucle de 32 pasos no autorregresivo que va completando los slots de audio más confiables en cada iteración. La corrección de la bidireccionalidad permite que el modelo genere habla coherente en lugar de un zumbido. Además, el vocoder Higgs se ha convertido a fp32 para evitar desbordamientos en procesadores arm64 (como los móviles), donde la versión fp16 original producía NaN. El repo ofrece dos versiones del backbone: `int4` (284 MB) y `fp32` (1763 MB), más los componentes adicionales para clonación de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (backbone) + decodificador de audio de 8 codebooks + vocoder Higgs (difusión enmascarada) |
| Parámetros totales | No disponible (el backbone Qwen3-0.6B tiene 0.6B, pero el total incluye vocoder y otros componentes) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo procesa secuencias de audio; el contexto textual no está especificado) |
| Tipos de cuantización | int4 (4 bits) y fp32 para el backbone; fp32 para el vocoder |
| Idiomas soportados | Multilingüe (más de 600 idiomas según la descripción; metadatos oficiales: en, zh, es, fr, de, hi, ar, ja, ko, pt, ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `.onnx` + `.data`) |

## Arquitectura y entrenamiento

El modelo original `k2-fsa/OmniVoice` es un TTS zero-shot basado en un LLM de 0.6B parámetros (Qwen3) que actúa como backbone de un modelo de difusión enmascarada. La generación de audio se realiza mediante un grid de 8 codebooks (el tokenizer de audio Higgs Audio V2) que se completa en 32 pasos no autorizativos, donde el modelo va rellenando las posiciones de mayor confianza. Este diseño requiere que cada posición pueda atender a cualquier otra, tanto hacia adelante como hacia atrás, algo que el export original de `onnx-community` no respetaba porque usaba operadores causales (GroupQueryAttention). Esta versión reexporta el backbone con `torch.onnx.export` (opset 20) y una máscara de atención 4D explícita, restaurando la bidireccionalidad.

El vocoder Higgs también se ha modificado: el original en fp16 desbordaba en plataformas arm64 (dando NaN), por lo que se ha convertido a fp32. El resto de componentes (embeddings encoder, heads decoder, tokenizer, y los encoders de clonación de voz) se han copiado sin cambios de la exportación previa. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO; la información disponible se centra en la conversión a ONNX y sus correcciones.

## Capacidades

- **Síntesis de voz a partir de texto** en más de 600 idiomas, con calidad de voz natural y control sobre la prosodia.
- **Clonación de voz zero-shot**: puede replicar una voz a partir de una muestra de audio corta (unos pocos segundos) sin entrenamiento adicional.
- **Diseño de voz (voice design)**: permite crear voces sintéticas nuevas o modificar características de una voz existente.
- **Multilingüe**: soporta una amplia gama de idiomas, incluyendo español, inglés, chino, francés, alemán, hindi, árabe, japonés, coreano, portugués y ruso, entre otros.
- **Generación de audio de alta calidad** mediante el codec Higgs Audio V2 (8 codebooks) y el vocoder de difusión.
- **Ejecución en ONNX Runtime**: optimizado para inferencia en CPU y GPU, con soporte para cuantización int4 para despliegue ligero.

## Casos de uso

- **Atención al cliente automatizada**: El modelo puede generar respuestas de voz en tiempo real en múltiples idiomas, con clonación de la voz del agente para mantener una experiencia coherente. Su ventana de contexto (aunque no especificada) permite manejar diálogos de longitud moderada, y la generación es rápida al usar el backbone int4 (~800 MB en total).
- **Doblaje de contenido audiovisual**: Permite clonar la voz de un actor o actriz para doblar películas, series o vídeos en distintos idiomas, manteniendo la voz original pero con el texto traducido.
- **Asistentes de voz personalizados**: Desarrollar asistentes con una voz específica (la del usuario o una diseñada) para aplicaciones móviles, altavoces inteligentes o software de escritorio. La compatibilidad con ONNX facilita su integración en entornos con Python, C++ o Rust.
- **Narración de audiolibros**: Generar audiolibros en múltiples idiomas a partir de texto, con voces naturales y control de entonación. El modelo puede clonar la voz de un narrador profesional para mantener la coherencia entre capítulos.
- **Accesibilidad**: Conversión de texto en voz para personas con discapacidad visual o dificultades de lectura, en cualquier idioma y con voces naturales.
- **Herramientas de producción musical y video**: Crear voces para canciones o efectos de voz en proyectos multimedia, con la posibilidad de diseñar voces únicas que se adapten a la estética del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README del modelo no incluye métricas comparativas de calidad de voz (MOS, WER) ni de velocidad de inferencia. Solo se menciona una prueba funcional que valida la bidireccionalidad (el cambio en la última token produce diferencias en posiciones anteriores) y una prueba de que el vocoder fp32 es correcto en arm64. Se recomienda evaluar el modelo con métricas estándar de TTS (MOS, CER) para el caso de uso concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Con el backbone int4 (284 MB) y los componentes (audio_embeddings_encoder, heads_decoder, vocoder) el modelo completo ocupa unos 800 MB en memoria. Esto cabe en GPUs con 2-4 GB de VRAM, como una NVIDIA GTX 1650 o una RTX 3060. La versión fp32 requiere aproximadamente 2.3 GB, necesitando al menos 4-6 GB de VRAM.
- **GPU recomendadas**: Para uso interactivo se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060). Para despliegue en servidores con mayor carga, una A10 o T4 puede manejar varias instancias simultáneamente.
- **Compatibilidad con CPU**: El modelo es compatible con ONNX Runtime y puede ejecutarse en CPU, aunque la velocidad será menor. En x86, el vocoder fp16 original funciona, pero en arm64 se requiere el fp32 (incluido en este repo). En un móvil arm64 de 8 núcleos, la inferencia es factible, pero la latencia será mayor.
- **Opciones de despliegue**: Se puede usar con ONNX Runtime (Python, C++, C#) o con herramientas como `onnxruntime-genai` para integración en aplicaciones. También es posible servirlo con frameworks de inferencia como Triton o Ray Serve, aunque no se documenta una integración específica con vLLM o TGI.
- **Latencia y throughput**: No se proporcionan medidas concretas. La generación de audio es secuencial en 32 pasos, por lo que la latencia depende del hardware. En GPU moderna (T4 o similar) se puede esperar un throughput de varios segundos de audio por segundo de cálculo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice (k2-fsa) | 0.6B (backbone) | No especificado | 600+ | Apache-2.0 | PyTorch / ONNX |
| onnx-community/OmniVoice-Onnx | 0.6B (backbone) | No especificado | 600+ | Apache-2.0 | ONNX (causal, incorrecto) |
| Este repo (bidirectional) | 0.6B (backbone) | No especificado | 600+ | Apache-2.0 | ONNX (bidireccional) |

No se dispone de datos de rendimiento comparativo con otros modelos TTS como XTTS o Tortoise. Este repo es una corrección del export ONNX oficial, que era funcionalmente defectuoso; por tanto, la comparación directa con el export original es la única relevante: el original produce un zumbido (42 códigos distintos en 1024 slots) mientras que este export produce audio coherente.

## Limitaciones y advertencias

- **Sesgos y calidad de voz**: Como modelo TTS entrenado en datos multilingües, puede presentar sesgos en la entonación o acentos para idiomas menos representados. La calidad puede variar según el idioma y la voz de referencia.
- **Riesgo de alucinación**: Aunque el modelo es de audio, puede generar contenido no deseado si el texto de entrada es ambiguo o contiene errores. No se ha evaluado su robustez ante textos adversariales.
- **Limitaciones de contexto**: La ventana de contexto no está documentada; el modelo procesa secuencias de audio de longitud variable, pero secuencias muy largas pueden degradar la calidad o exceder la capacidad de memoria.
- **Restricciones de licencia**: La licencia Apache-2.0 permite uso comercial, pero se debe incluir la atribución correspondiente. No hay restricciones adicionales.
- **Advertencia para producción**: La versión int4 del backbone puede tener una ligera pérdida de calidad frente a fp32; se recomienda evaluar ambos formatos para el caso de uso. Además, el vocoder fp32 es obligatorio en dispositivos arm64, mientras que en x86 el fp16 original también funciona. El repo no incluye pruebas de integración con el pipeline completo; se debe verificar la compatibilidad de los componentes al desplegar.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Emerald7664/OmniVoice-Onnx-bidirectional
- Modelo original (PyTorch): https://huggingface.co/k2-fsa/OmniVoice
- Exportación previa (onnx-community): https://huggingface.co/onnx-community/OmniVoice-Onnx
- Página en ModelScope: https://www.modelscope.cn/models/onnx-community/OmniVoice-Onnx
- Código de conversión (GitHub): https://github.com/AFun9/Omnivoice-onnx
- Paper referenciado en tags: arXiv:2604.00688 (no se ha verificado el contenido)
