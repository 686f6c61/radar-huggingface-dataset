# Inaba2Meguru/DiffusorRT-Android-Qwen3-BD3LM-0.6B-Q4-V79

## Resumen

DiffusorRT-Android-Qwen3-BD3LM-0.6B-Q4-V79 es un paquete de ejecución compilado, no un checkpoint de Transformers al uso. Lo publica el usuario Inaba2Meguru en Hugging Face y deriva del modelo `dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1`, un modelo de difusión por bloques (block-diffusion) construido sobre la arquitectura Qwen3 con 0,6 mil millones de parámetros. El paquete contiene los binarios de contexto `qnn.htp` compilados con QAIRT 2.45.0.260326 para ejecutar el modelo cuantizado a 4 bits sobre la NPU Hexagon V79 del SoC Qualcomm Snapdragon 8 Elite (SM8750), además de los activos de la app (`phone.json` y `bpe.json`).

El problema que resuelve es la inferencia local de un modelo de lenguaje generativo en un teléfono Android de gama alta, delegando el cómputo en la NPU en lugar de la CPU o la GPU. No se distribuyen pesos en formato safetensors ni GGUF: el repositorio (0,6 GB) contiene artefactos listos para cargar en la aplicación DiffusorRT, con metadatos de integración en `android-pack.json` (rutas, tamaños y SHA-256 de cada fichero).

Es relevante ahora porque ejemplifica la tendencia de empaquetar modelos pequeños de difusión de texto para aceleradores móviles propietarios. No obstante, su utilidad queda restringida al hardware objetivo: los binarios de contexto solo funcionan en la NPU de ese SoC concreto y no son portables a otros dispositivos ni a frameworks de servidor convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión por bloques (block-diffusion) sobre base Qwen3 |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Q4), compilado para Hexagon HTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios de contexto `qnn.htp` (QAIRT 2.45.0.260326); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, `Qwen3-0.6B-diffusion-bd3lm-v0.1`, es una variante de difusión de texto sobre la arquitectura Qwen3 de 0,6 mil millones de parámetros. El enfoque BD3LM (block-diffusion) genera tokens mediante un proceso de difusión por bloques en lugar de decodificación autorregresiva token a token, lo que permite paralelizar la generación dentro de cada bloque. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Este repositorio concreto no entrena nada: es un artefacto de despliegue. El autor compiló los pesos originales a 4 bits y los tradujo a binarios de contexto QNN para el acelerador Hexagon V79 mediante QAIRT 2.45.0.260326. El paquete de ejecución reutiliza sin cambios el del pack de iPhone (`jimmylearnML/DiffusorRT-iPhone-Qwen3-BD3LM-0.6B-Q4`, revisión 46b8da27), de modo que la app descarga parte de sus ficheros desde ese repositorio; en total, 1,19 GB de datos de modelo.

## Capacidades

- Generación de texto conversacional mediante difusión por bloques, orientada a chat.
- Ejecución en la NPU Hexagon V79 del Snapdragon 8 Elite, con cuantización a 4 bits.
- Integración con la aplicación DiffusorRT para Android, que carga los binarios `qnn.htp` y los activos de tokenizador (`bpe.json`).
- Metadatos de integración en `android-pack.json`: rutas dentro de la carpeta de modelos de la app, tamaños y SHA-256 de cada fichero.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Chat local en dispositivo de gama alta: la app DiffusorRT carga los binarios en la NPU del Snapdragon 8 Elite y ofrece conversación sin conexión, sin enviar datos a servidores externos.
- Demostración de inferencia en NPU móvil: sirve para evaluar el rendimiento real de un modelo de difusión de 0,6B a 4 bits sobre Hexagon V79 en pruebas de laboratorio.
- Prototipado de asistentes embebidos: desarrolladores que integren DiffusorRT pueden usar este pack como referencia de empaquetado (rutas, hashes, estructura de `android-pack.json`).
- Verificación de integridad en pipelines de distribución: los SHA-256 incluidos permiten validar la descarga de cada fichero en el proceso de instalación de la app.
- Investigación sobre difusión de texto en el borde: comparar la calidad y latencia de la generación por difusión frente a modelos autorregresivos del mismo tamaño en hardware móvil.
- Pruebas de compatibilidad de hardware: determinar si un dispositivo concreto (SM8750, Hexagon V79) puede ejecutar el paquete, ya que los binarios no son portables a otras NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt utilizado.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite (SM8750) con NPU Hexagon V79; los binarios de contexto solo se ejecutan en esa NPU.
- VRAM: no aplica; el cómputo se realiza en la NPU del teléfono, no en una GPU de escritorio.
- GPU recomendadas: no aplica (A100, H100 o RTX 4090 no son compatibles con estos binarios).
- Compatibilidad con GPU de consumo: no; el paquete no está pensado para ejecutarse en tarjetas gráficas.
- Opciones de despliegue: exclusivamente la app DiffusorRT para Android con QAIRT 2.45.0.260326; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: 0,6 GB en el repositorio; 1,19 GB en total al incluir los ficheros descargados del pack de iPhone.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusorRT-Android-Qwen3-BD3LM-0.6B-Q4-V79 | 0,6B | no disponible | Binarios QNN HTP (4 bits) | Apache 2.0 | Hugging Face, solo para Snapdragon 8 Elite |
| dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1 | 0,6B | no disponible | Pesos originales (formato no detallado) | no disponible | Hugging Face |
| jimmylearnML/DiffusorRT-iPhone-Qwen3-BD3LM-0.6B-Q4 | 0,6B | no disponible | Pack para iPhone | no disponible | Hugging Face |

La comparación con alternativas de servidor (por ejemplo, Qwen3-0.6B en formato GGUF para llama.cpp) no es directa: este paquete no es un checkpoint reutilizable, sino un artefacto compilado para un acelerador móvil concreto.

## Limitaciones y advertencias

- No es un modelo de Transformers: no contiene pesos en safetensors ni GGUF, por lo que no puede cargarse con `transformers`, llama.cpp, vLLM u Ollama.
- Los binarios de contexto solo funcionan en la NPU Hexagon V79 del Snapdragon 8 Elite (SM8750); no son portables a otros SoC ni a GPU de escritorio.
- Dependencia de la app DiffusorRT y de QAIRT 2.45.0.260326; cambios de versión del runtime pueden romper la compatibilidad.
- Parte de los ficheros (1,19 GB en total) se descargan desde el repositorio del pack de iPhone, lo que introduce una dependencia externa y un riesgo de disponibilidad si ese repositorio cambia o se elimina.
- La model card no documenta sesgos, riesgo de alucinación ni comportamiento multilingüe del modelo base.
- Longitud de contexto e idiomas soportados no disponibles; no se debe asumir un contexto largo en producción.
- Licencia Apache 2.0 declarada, pero los derechos del modelo original pertenecen a los autores de `dllm-hub`; conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3-BD3LM-0.6B-Q4-V79
- Modelo base: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-bd3lm-v0.1 (revisión 60f77bba67ba94231c16f5fb29bc66c500b038f1)
- Pack de ejecución de iPhone: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3-BD3LM-0.6B-Q4/tree/46b8da273e7effefd1f4c951077eb88ae0a5808a
- Paper, blog o repositorio del proyecto DiffusorRT: no disponible
- Demo: no disponible
