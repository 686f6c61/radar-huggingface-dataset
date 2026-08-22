# Danny-Dasilva/inflect-kokoro-voices

## Resumen

Inflect Kokoro Voices es una colección de modelos de síntesis de voz (text-to-speech) creada por Danny-Dasilva, que consiste en un conjunto de voces fine-tuned sobre el modelo base `owensong/Inflect-Micro-v2`. Cada voz se distribuye como un paquete autocontenido de aproximadamente 73 MB que incluye un checkpoint de PyTorch (`model.pth`) y exportaciones ONNX (`duration.onnx` y `decode.onnx`), lo que permite ejecutar el modelo tanto con el runtime de PyTorch como con ONNX Runtime, especialmente pensado para despliegues en el edge. El modelo sintetiza audio mono a 24 kHz y está etiquetado con la arquitectura VITS.

El repositorio está pensado como un "voice pack" que amplía el catálogo de voces del ecosistema Kokoro, con voces femeninas de inglés americano (como `af_bella`, `af_nicole`, `af_alloy`, etc.) y una voz híbrida (`sky`) que combina características de dos voces existentes. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Aunque el proyecto no tiene descargas ni likes registrados en la fecha de creación (agosto de 2026), su estructura modular y el soporte doble PyTorch/ONNX lo hacen interesante para desarrolladores que necesitan TTS ligero y portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo base Inflect-Micro-v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo base `Inflect-Micro-v2` es un sistema de síntesis de voz basado en VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), una arquitectura que integra un encoder de texto, un decoder de audio y un discriminador adversarial en un solo modelo entrenado de extremo a extremo. Los modelos de este repositorio son fine-tunes de esa base, ajustados para generar voces específicas con características particulares (por ejemplo, la voz `sky` combina pesos de `af_sky` y `af_bella`). No se ha publicado información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o las técnicas de alineación (RLHF, DPO, etc.). La etiqueta `synthetic-data` sugiere que los datos de entrenamiento podrían ser sintéticos, pero no hay confirmación en la documentación disponible.

## Capacidades

- Sintetiza voz en ingles americano a partir de texto, generando audio mono de 24 kHz.
- Ofrece multiples voces femeninas distintas (al menos `af_heart`, `af_bella`, `af_nicole`, `af_aoede`, `af_kore`, `af_sarah`, `af_alloy`, `af_nova`, `af_river`, `sky`).
- Soporta dos runtimes de inferencia: PyTorch y ONNX, lo que facilita la integracion en entornos con requisitos de portabilidad.
- Disenado para despliegue en el borde (edge-ai), con un tamano reducido por voz (aproximadamente 73 MB).
- No incluye capacidades de tool calling, agentes, vision, audio de entrada ni otras funcionalidades mas alla de la sintesis de voz.

## Casos de uso

- **Asistentes de voz en dispositivos locales**: el formato ONNX permite ejecutar la sintesis en dispositivos de bajo consumo (smartphones, Raspberry Pi) sin depender de servidores externos. Por ejemplo, un asistente de voz para una app de productividad podria usar `af_bella` para respuestas habladas.
- **Narracion de contenido audiovisual**: voces como `af_nova` o `af_sarah` pueden generar locuciones para videos explicativos, podcast o audiocuentos, evitando los costes de grabacion con actores de voz.
- **Accesibilidad en aplicaciones web**: un lector de pantalla basado en el navegador podria integrar el modelo PyTorch en un backend Node.js para convertir texto en voz en tiempo real.
- **Sistemas de respuesta interactiva (IVR)**: en centralitas telefonicas, la voz `af_bella` puede usarse para menus automatizados en ingles, mejorando la naturalidad frente a voces genericas.
- **Creacion de contenido para redes sociales**: herramientas de doblaje automatico de videos cortos pueden usar la coleccion para ofrecer varias voces femeninas al usuario, con licencia Apache-2.0 que permite uso comercial.
- **Prototipado rapido de experiencias de voz**: los desarrolladores pueden descargar una sola voz (por ejemplo, `af_heart`) y probarla en un proyecto sin instalar todo el repositorio, gracias a la estructura de carpetas independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre MOS (Mean Opinion Score), latencia, throughput ni comparaciones con otros modelos TTS en la documentacion del repositorio ni en las paginas de resultados de busqueda consultadas.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo VITS de tamano reducido (cada voz ocupa ~73 MB en disco), la inferencia puede ejecutarse en CPU sin necesidad de GPU. El uso de VRAM es minimo o nulo si se usa CPU.
- **GPU recomendadas**: no se especifican requisitos de GPU; cualquier GPU moderna con soporte ONNX o PyTorch (por ejemplo, NVIDIA GTX 1650 o superior) puede acelerar la inferencia si se desea.
- **Compatibilidad con consumer GPU**: si, cabe en cualquier GPU de consumo actual, e incluso en CPU de gama media.
- **Opciones de despliegue**: se puede integrar con PyTorch (via `torch.load`) o con ONNX Runtime. No se menciona soporte directo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no hay datos publicados, pero dado el tamano, se espera una latencia inferior a 1 segundo para frases cortas en CPU moderna.

## Comparativa con modelos similares

No hay informacion suficiente para realizar una comparativa objetiva con otros modelos de sintesis de voz como Kokoro (el modelo original), Piper o Coqui AI. No se dispone de datos de parametros, calidad percibida ni rendimiento de estos modelos alternativos en la documentacion consultada. La unica referencia es que el modelo base es `Inflect-Micro-v2`, pero no se han encontrado especificaciones publicas del mismo. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Idioma**: solo soporta ingles, y las voces disponibles son todas femeninas de ingles americano; no hay voces masculinas ni otros acentos.
- **Calidad de audio**: no se han publicado evaluaciones formales de naturalidad o inteligibilidad, por lo que la calidad puede variar entre voces.
- **Dependencia del modelo base**: al ser un fine-tune de `Inflect-Micro-v2`, cualquier limitacion de ese modelo base (por ejemplo, errores de pronunciacion en nombres propios) se hereda en estas voces.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y no se ofrece garantia alguna.
- **Sin soporte para otros idiomas**: no se puede usar para espanol, frances, etc., sin un fine-tune adicional.
- **Estado del proyecto**: el repositorio tiene cero descargas y cero likes; no hay evidencia de mantenimiento activo o soporte comunitario.

## Enlaces

- Repositorio en HuggingFace: [Danny-Dasilva/inflect-kokoro-voices](https://huggingface.co/Danny-Dasilva/inflect-kokoro-voices)
- Modelo base: [owensong/Inflect-Micro-v2](https://huggingface.co/owensong/Inflect-Micro-v2)
- Repositorio comunitario de voces Kokoro (referencia): [n33kos/kokoro-voices](https://github.com/n33kos/kokoro-voices)
