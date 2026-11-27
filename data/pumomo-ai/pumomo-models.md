# pumomo-ai/pumomo-models

## Resumen

`pumomo-ai/pumomo-models` no es un modelo entrenado, sino un repositorio espejo que agrupa copias sin modificar de varios modelos abiertos utilizados por la aplicacion Pumomo. El autor declara que cada fichero es identico byte a byte al original (mismo SHA-256), por lo que el repositorio funciona como punto de descarga unico para el conjunto de pesos que consume la aplicacion. Los pesos incluidos cubren modelos de lenguaje en formato GGUF (Qwen3-0.6B, Qwen3.5-2B, Gemma 4 E2B, Qwen3-4B-Instruct-2507) y un modelo de sintesis de voz (Kokoro-82M en formato ONNX int8).

El dato de parametros totales reportado en safetensors (4.628.569.635) corresponde al modelo de mayor tamano del conjunto, Qwen3-4B-Instruct-2507, y no a un unico modelo propio. El repositorio no aporta model card tecnica propia: la informacion disponible se limita a la lista de ficheros, sus creditos y sus hashes. No hay datos de arquitectura, entrenamiento ni benchmarks especificos de este repositorio.

Su relevancia es practica: permite a la aplicacion Pumomo distribuir un paquete coherente de modelos pequenos (de 0,6B a 4B parametros) y un TTS, todos con licencia Apache 2.0, orientados a ejecucion local en hardware modesto mediante llama.cpp u otros runtimes GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio espejo de varios modelos; no define arquitectura propia) |
| Parametros totales | 4.628.569.635 (dato de safetensors, correspondiente al mayor modelo del conjunto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (Qwen3-0.6B), Q4_K_M (Qwen3.5-2B y Qwen3-4B-Instruct-2507), Q4_0 (Gemma 4 E2B), int8 ONNX (Kokoro TTS) |
| Idiomas soportados | no disponible (Kokoro se distribuye como multi-lang; el resto depende de cada modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y tar.bz2 con modelo ONNX int8 (Kokoro) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre arquitectura ni proceso de entrenamiento en la model card del repositorio. Se trata de un espejo de modelos de terceros: Qwen3-0.6B y Qwen3-4B-Instruct-2507 (Qwen team, Alibaba Cloud), Qwen3.5-2B (Qwen team, cuantizado por LM Studio Community), Gemma 4 E2B (Google DeepMind, cuantizado por ggml-org) y Kokoro-82M (hexgrad, ejecutado con sherpa-onnx de k2-fsa). Cualquier detalle de arquitectura, dataset o alineamiento (RLHF/DPO) debe consultarse en las fichas de los modelos originales, no en este repositorio.

La unica innovacion tecnica atribuible al repositorio es la verificacion por hash SHA-256 de cada fichero, que garantiza la integridad y equivalencia con los originales. El tamano total del repo es de 12,1 GB, distribuido entre los cinco artefactos listados.

## Capacidades

- Generacion de texto conversacional mediante los modelos Qwen3, Qwen3.5 y Gemma 4 incluidos.
- Razonamiento e instrucciones generales con Qwen3-4B-Instruct-2507 y Qwen3.5-2B.
- Ejecucion local en CPU/GPU mediante formato GGUF (compatible con llama.cpp y derivados).
- Sintesis de voz multilingue con Kokoro-82M int8 a traves de sherpa-onnx.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada (depende de cada modelo original).
- Capacidades multimodales: no disponible (Gemma 4 E2B podria tener capacidades propias, pero no se detallan aqui).
- Capacidades multilingues: no disponible salvo la indicacion "multi-lang" del modelo Kokoro.

## Casos de uso

- Distribucion empaquetada para una aplicacion de escritorio o movil: el repositorio permite descargar en un solo punto los modelos que consume Pumomo, con verificacion de integridad por SHA-256.
- Inferencia local en equipos modestos: Qwen3-0.6B-Q8_0 (0,64 GB) y Qwen3.5-2B-Q4_K_M (1,27 GB) se pueden ejecutar en CPU o GPU de gama baja mediante llama.cpp.
- Asistente conversacional offline: Qwen3-4B-Instruct-2507-Q4_K_M (2,50 GB) ofrece un equilibrio entre calidad y huella de memoria para chatbots locales.
- Generacion de voz en aplicaciones de accesibilidad: Kokoro-82M int8 (0,13 GB) con sherpa-onnx permite TTS ligero en tiempo real en dispositivos con recursos limitados.
- Prototipado y evaluacion de modelos pequenos: util para comparar rapidamente Qwen3, Qwen3.5 y Gemma 4 en tareas concretas sin gestionar descargas individuales.
- Reproducibilidad en pipelines de CI: los hashes publicados permiten fijar versiones exactas de los pesos en pruebas automatizadas.
- Despliegue en entornos con requisitos de licencia permisiva: todos los artefactos son Apache 2.0, lo que facilita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada por tamano de fichero): Qwen3-0.6B Q8_0 ~0,7 GB; Qwen3.5-2B Q4_K_M ~1,3 GB; Qwen3-4B-Instruct-2507 Q4_K_M ~2,5 GB; Gemma 4 E2B Q4_0 ~2,8 GB; Kokoro-82M int8 ~0,13 GB.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU consumer con 4-8 GB de VRAM es suficiente para los modelos de texto incluidos.
- Cabe en GPU consumer: si, practicamente todos los modelos del repositorio caben en tarjetas como RTX 3060, RTX 4060 o superiores; los modelos mas pequenos funcionan tambien en CPU.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio, etc.) para los modelos de lenguaje; sherpa-onnx para Kokoro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo unico, sino un espejo de varios modelos de terceros; la comparativa relevante seria entre los modelos originales (Qwen3-0.6B, Qwen3.5-2B, Gemma 4 E2B, Qwen3-4B-Instruct-2507 y Kokoro-82M), cuyas fichas no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo propio: no aporta mejoras, fine-tuning ni ajustes respecto a los originales; cualquier limitacion de los modelos de origen se hereda.
- Ausencia de model card tecnica: no hay datos de contexto, idiomas, arquitectura ni benchmarks en este repositorio.
- El dato de parametros totales (4.628.569.635) corresponde al mayor modelo del conjunto y puede inducir a confusion si se interpreta como un unico modelo.
- Riesgo de alucinacion y sesgos: no documentados aqui; dependen de cada modelo original.
- Licencia Apache 2.0 en todos los artefactos, lo que permite uso comercial, pero conviene verificar las condiciones de los modelos originales por si hubiera terminos adicionales.
- Fechas de creacion y actualizacion del repositorio (2026-11-23) y nombres de modelos como "Qwen3.5-2B" o "Gemma 4 E2B" deben contrastarse con las fuentes oficiales antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pumomo-ai/pumomo-models
- Qwen3-0.6B-GGUF (original): https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Qwen3.5-2B-GGUF (LM Studio Community): https://huggingface.co/lmstudio-community/Qwen3.5-2B-GGUF
- Gemma 4 E2B-it-GGUF (ggml-org): https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Qwen3-4B-Instruct-2507-GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- misaki (hexgrad): https://github.com/hexgrad/misaki
