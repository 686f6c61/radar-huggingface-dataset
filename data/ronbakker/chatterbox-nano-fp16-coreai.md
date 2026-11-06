# ronbakker/chatterbox-nano-fp16-coreai

## Resumen

Chatterbox Nano Core AI FP16 es una conversión para ejecución en dispositivo (on-device) del modelo de texto a voz Chatterbox Nano de Resemble AI, empaquetada por Ron Bakker en formato nativo `.aimodel` para iOS 27+ y macOS 27+ en Apple Silicon. El repositorio incluye cinco activos: cuatro modelos de narración con sus tablas requeridas (569 MB antes de compresión) y un modelo opcional combinado de inscripción de voz (voice enrollment, 301,6 MB). La salida es audio PCM mono a 24 kHz.

El problema que resuelve es claro: permite narración en inglés y clonación/inscripción de voz completamente en local, sin depender de servicios en la nube, aprovechando el Apple Neural Engine y la GPU de Apple Silicon. Los pesos de narración se almacenan en FP16 (T3 incluido) con procesamiento acústico en precisión mixta, y la inscripción de voz usa matrices del tokenizador de habla en FP16 con cómputo FP32. Es relevante para desarrolladores de apps iOS/macOS que necesitan TTS con voz personalizada, privacidad garantizada y latencias bajas sin coste de API. El modelo original es Chatterbox Nano de Resemble AI (2025); esta conversión es de 2026 y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en T3 (arquitectura del modelo original Chatterbox Nano); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos de narración y estado T3), precisión mixta en procesamiento acústico; FP16 almacenado con cómputo FP32 en enrollment |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` nativo de Apple (Core AI); no safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado desde cero, sino una conversión y optimización del modelo Chatterbox Nano de Resemble AI. El pipeline de narración emplea pesos aprendidos y estado T3 en FP16, con procesamiento de señal acústica en precisión mixta. El componente de inscripción de voz (voice enrollment) usa matrices del tokenizador de habla almacenadas en FP16 pero computadas en FP32, con redes de locutor y frontends también en FP32, lo que sugiere que la extracción del embedding de voz se prioriza por fidelidad frente a tamaño.

Sobre el entrenamiento del modelo base (datos, número de tokens, RLHF u otras técnicas), la model card no proporciona información. Tampoco se detalla el método de conversión a `.aimodel` más allá de que fue convertido y optimizado por Ron Bakker para Apple Silicon. El paquete no incluye voces ni grabaciones de ejemplo; el usuario debe preparar su propia voz siguiendo INTEGRATION.md.

## Capacidades

- Texto a voz (narración) en inglés, con salida PCM mono a 24 kHz.
- Inscripción de voz (voice enrollment): permite preparar una voz de referencia para condicionar la síntesis, es decir, clonación de voz a partir de grabaciones del usuario.
- Ejecución totalmente on-device en iOS 27+ y macOS 27+ sobre Apple Silicon, sin conexión a servicios externos.
- Cuatro variantes de modelo de narración empaquetadas (los detalles de las diferencias entre variantes no están disponibles en la model card).
- No incluye capacidades de texto, código, visión ni tool calling: es un modelo exclusivamente de síntesis de voz.
- No se menciona soporte de idiomas adicionales ni de emociones/control prosódico explícito.

## Casos de uso

- Narración de audiolibros y artículos en apps iOS/macOS: el modelo genera voz en inglés a RTF ~0,20 en iPhone 16 Pro, es decir, sintetiza audio cinco veces más rápido que el tiempo real, adecuado para convertir texto largo en audio sin esperas perceptibles.
- Asistentes de voz privados: al ejecutarse íntegramente en dispositivo, el texto y las grabaciones de voz del usuario nunca salen del terminal, ideal para apps con requisitos de privacidad (salud, notas personales, accesibilidad).
- Personalización de voz en apps: mediante el modelo de enrollment (301,6 MB), una app puede permitir al usuario registrar su propia voz y que el asistente o lector hable con esa voz.
- Accesibilidad: lectores de pantalla o herramientas de lectura asistida con voz natural en inglés, funcionando sin red en iPhone, iPad o Mac con Apple Silicon.
- Prototipado de productos de voz en macOS: los desarrolladores pueden integrar TTS con voz clonada en demos y MVPs sin coste de API ni cuotas de uso, gracias a la licencia MIT.
- Generación de locuciones offline para contenido multimedia: producción de pistas de narración en inglés para vídeos o juegos directamente en un Mac (M1 Max: RTF ~0,185), sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, SIM, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento en dispositivo (RTF mediano en caliente, tres ejecuciones):

| Dispositivo | SO | RTF mediano | Rango (3 ejecuciones) |
|---|---|---:|---:|
| iPhone 16 Pro | iOS 27.0.1 | 0,200 | 0,199–0,201 |
| M1 Max | macOS 27.0.1 | 0,185 | 0,183–0,188 |

RTF se define como el tiempo de síntesis dividido por la duración del audio generado, incluyendo prefill/decode nativo, muestreo, actualización de caché, acústica, trabajo del solver y lecturas/escrituras de salida. Quedan excluidos la carga/compilación del modelo, la preparación de condicionamiento, el warm-up, la escritura de WAV y la reproducción. El enrollment es una operación aparte.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con iOS 27+ o macOS 27+; los activos `.aimodel` no son utilizables en CUDA, Linux ni Windows.
- Almacenamiento: 569,0 MB para los cuatro modelos de narración y tablas, más 301,6 MB opcionales para el modelo de enrollment combinado; el repositorio completo ocupa 0,9 GB.
- RAM/VRAM: no disponible; al ser FP16 con precisión mixta, se estima que un iPhone 16 Pro y un M1 Max son suficientes según las mediciones publicadas.
- GPU recomendadas: no aplica hardware de NVIDIA; probado en iPhone 16 Pro (A18 Pro) y Apple M1 Max.
- Despliegue: integración nativa vía INTEGRATION.md (carga, contratos de tensores y preparación de voz); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables a este formato.
- Rendimiento: RTF ~0,185–0,200 en caliente en los dispositivos medidos, con muy baja varianza entre ejecuciones.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano/conversión | Idioma | Licencia | Ejecucion on-device Apple |
|---|---|---|---|---|---|
| Chatterbox Nano FP16 Core AI (este) | TTS + voice enrollment | ~0,9 GB (FP16, `.aimodel`) | Inglés | MIT | Sí, nativo iOS/macOS |
| ResembleAI/chatterbox-nano (base) | TTS + voice cloning | no disponible | Inglés (u otros según versión) | Consultar repo original | No, formato original |
| Kokoro (hexgrad/Kokoro-82M) | TTS | 82 M parámetros | Varios | Apache 2.0 | Sí, vía ONNX/Core ML (conversión no oficial) |
| Piper | TTS | Modelos ligeros por idioma | Multilingüe | MIT | Sí, vía ONNX (no nativo `.aimodel`) |

La ventaja diferencial de esta conversión es el empaquetado nativo para Apple Silicon con mediciones de RTF publicadas; las alternativas requieren runtimes intermedios (ONNX, Core ML no oficial) y no ofrecen garantías de rendimiento medidas en dispositivos concretos.

## Limitaciones y advertencias

- Solo inglés: no hay soporte para castellano ni otros idiomas según la model card.
- No incluye voces ni grabaciones: el usuario debe preparar su propia voz de referencia para el enrollment.
- Formato propietario de plataforma (`.aimodel`): inutilizable fuera de iOS 27+/macOS 27+ en Apple Silicon; no hay pesos safetensors ni GGUF para otros entornos.
- Riesgo de clonación de voz: al tratarse de un modelo de voice cloning, su uso puede plantear riesgos de suplantación de identidad; el usuario es responsable de contar con consentimiento para las voces que inscriba.
- Calidad subjetiva de la síntesis (naturalidad, MOS): no disponible; solo se han publicado mediciones de velocidad, no de calidad perceptual.
- El rendimiento medido corresponde a un texto concreto y condiciones en caliente; otros tamaños de texto y funciones flexibles pueden rendir de forma distinta, según advierte el propio autor.
- Requisitos de licencia: aunque es MIT, hay que preservar los archivos LICENSE, NOTICE.md y la licencia de componentes; el modelo original tiene copyright de Resemble AI (2025) y la conversión de Ron Bakker (2026).
- Popularidad muy baja (0 descargas, 1 like en el momento de la ficha): proyecto de un tercero sin respaldo oficial de Resemble AI, lo que implica menor garantía de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ronbakker/chatterbox-nano-fp16-coreai
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Documentación de integración (referenciada en la model card): INTEGRATION.md en el repositorio
- Licencia y avisos (referenciados en la model card): LICENSE y NOTICE.md en el repositorio
- Paper, blog o demo oficial: no disponible
