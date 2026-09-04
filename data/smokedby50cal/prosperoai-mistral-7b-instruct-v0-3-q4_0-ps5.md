# Smokedby50cal/ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5

## Resumen

Este repositorio contiene una conversión del modelo Mistral 7B Instruct v0.3 en cuantización Q4_0 al formato de ejecución nativo de **ProsperoAI**, una aplicación homebrew para PlayStation 5. El objetivo es permitir inferencia local en la GPU AMD de la consola, sin depender de una API en la nube. No se trata de un fine-tune, sino de un artefacto de conversión de formato: los pesos proceden del archivo GGUF Q4_0 publicado por QuantFactory, basado en el modelo original `mistralai/Mistral-7B-Instruct-v0.3`.

El modelo está publicado por Smokedby50cal y curado por BlackBearReloaded. La arquitectura es la de Mistral 7B, un transformer de 32 capas con una ventana de contexto funcional limitada a 4.096 tokens en el runtime de ProsperoAI. El repositorio no tiene descargas ni likes, lo que indica que es una distribución inicial o de nicho. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B Instruct v0.3) |
| Parametros totales | 7.000 millones (designación del modelo base; no se indica cifra exacta en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en la app ProsperoAI (límite del runtime, inferior al anunciado por el modelo base) |
| Tipos de cuantizacion | Q4_0 (pesos GGUF de origen, con tensores F32 y Q6_K empaquetados en contenedor P5LM) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | P5LM (`model.ps5lm`), no compatible con GGUF ni con runners de escritorio |

## Arquitectura y entrenamiento

La arquitectura validada por el runtime es la del modelo base Mistral 7B Instruct v0.3: 32 capas transformer, ancho de embedding de 4.096, ancho feed-forward de 14.336, 32 cabezas de atención y 8 cabezas KV, vocabulario de 32.768 tokens, dimensión RoPE de 128 y base de frecuencia de 1.000.000. El archivo contiene 291 tensores en el diseño esperado de Mistral 7B.

No se dispone de datos de entrenamiento en la información proporcionada. Esta conversión no introduce entrenamiento adicional, RLHF ni DPO. El comportamiento del modelo es, por tanto, el heredado del modelo base. La innovación técnica relevante es la conversión al contenedor P5LM y el empaquetado específico para los kernels nativos AGC de la GPU de PlayStation 5, con pesos y KV cache residentes en GPU y orquestación y tokenización en CPU.

## Capacidades

- Generación de texto instructivo en el runtime de ProsperoAI, heredada de Mistral 7B Instruct v0.3.
- Ejecución completamente local en PlayStation 5, sin necesidad de servicios en la nube.
- Reutilización de prefijos coincidentes en la KV cache, con prefetch de sufijos nuevos.
- Decodificación mediante selección greedy en la versión actual del runtime.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en PlayStation 5: el modelo puede mantener conversaciones de instrucciones dentro del límite de 4.096 tokens, aprovechando la GPU de la consola para una inferencia sin conexión.
- Desarrollo de aplicaciones homebrew de IA en consolas: sirve como base para probar runtime de inferencia local en el ecosistema ProsperoAI, con una arquitectura validada y un flujo de instalación sencillo.
- Entorno educativo para estudiar inferencia en GPU AMD RDNA2: permite analizar el comportamiento de un modelo de 7B en hardware de consola, sin necesidad de un PC con GPU dedicada.
- Generación de texto creativo en un entorno offline: la ejecución local evita dependencias externas, útil para prototipos o demostraciones sin conexión.
- Validación de artefactos de conversión de modelos: el repositorio incluye integridad SHA-256 y un registro de procedencia reproducible, útil para auditar conversiones de formato.
- Investigación sobre eficiencia de inferencia en consolas: las notas de rendimiento sobre contexto corto frente a contexto largo permiten estudiar el impacto del crecimiento de la atención en un runtime limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del repositorio incluye una nota cualitativa de rendimiento: la generación con contexto corto es sustancialmente más rápida que con contexto largo, y el rendimiento disminuye al aumentar la longitud de contexto. No se ofrecen cifras de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- Requiere una PlayStation 5 capaz de ejecutar la aplicación nativa ProsperoAI (PPSA99004).
- GPU AMD de PlayStation 5, con pesos y KV cache residentes en GPU; la orquestación y tokenización se ejecutan en CPU.
- El archivo `model.ps5lm` ocupa 4.664.066.048 bytes (aproximadamente 4,35 GiB), pero no se especifica la VRAM total consumida.
- No es compatible con CUDA, ROCm, vLLM, llama.cpp, Ollama ni TGI. Solo se ejecuta en el runtime ProsperoAI.
- Latencia y throughput: no disponibles. La única indicación es que la generación de contexto corto es más rápida que la de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5 | 7B | 4.096 tokens en runtime | Apache 2.0 | Solo PS5 mediante ProsperoAI, formato P5LM |
| Mistral-7B-Instruct-v0.3 (original) | 7B | No disponible en la información | Apache 2.0 | HuggingFace, pesos en safetensors |
| QuantFactory/Mistral-7B-Instruct-v0.3-GGUF (Q4_0) | 7B | No disponible en la información | Apache 2.0 | GGUF, ejecutable con llama.cpp y runners de escritorio |

No se han publicado benchmarks comparativos en la información disponible, por lo que no es posible contrastar el rendimiento de estos modelos.

## Limitaciones y advertencias

- Requiere un entorno PlayStation 5 capaz de ejecutar la aplicación nativa ProsperoAI; no funciona en otros dispositivos.
- Solo se soporta la arquitectura y el perfil de tensores exactos validados por el convertidor.
- El límite de contexto del runtime (4.096 tokens) es inferior al límite anunciado por el modelo base.
- La cuantización Q4_0 sacrifica algo de calidad del modelo a cambio de menor uso de memoria y mayor velocidad.
- No es un archivo GGUF y no es directamente compatible con llama.cpp, ROCm, CUDA ni otros runners de escritorio.
- No se han publicado evaluaciones independientes, benchmarks ni análisis de sesgos para esta conversión.
- Deben seguirse la model card, la licencia y las guías de uso aceptable del modelo Mistral upstream.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Smokedby50cal/ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5
- Repositorio en HuggingFace de BlackBearReloaded: https://huggingface.co/blackbearreloaded/ProsperoAI-Mistral-7B-Instruct-v0.3-Q4_0-PS5
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- GGUF de origen: https://huggingface.co/QuantFactory/Mistral-7B-Instruct-v0.3-GGUF
- Herramientas de modelo de ProsperoAI Alpha 2: https://github.com/blackbearreloaded/ProsperoAI/releases/tag/v0.1.0-alpha.2
