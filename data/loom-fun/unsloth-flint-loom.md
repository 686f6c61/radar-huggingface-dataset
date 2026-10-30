# loom-fun/unsloth-flint-loom

## Resumen

`loom-fun/unsloth-flint-loom` no es un modelo en sí mismo, sino un paquete Loom (programas `.loom` y una tarjeta `model.json`) que permite desplegar de forma automatizada el checkpoint GGUF sin modificar `unsloth/flint-GGUF` en cuantización Q8_0. Fue generado por el flujo de fábrica loom-skills sobre un AMD Ryzen AI Max+ 395 "Strix Halo" y se distribuye bajo licencia Apache-2.0.

El problema que resuelve es la puesta en marcha de modelos GGUF en hardware AMD: `loom-fetch` descarga los programas de este repositorio y los pesos desde `unsloth/flint-GGUF` (verificados contra `model.json.lock`), y `loom-serve` los expone en un servidor local en `127.0.0.1:8080` con un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).

Es relevante para quien trabaja con inferencia local en la plataforma ROCm/AMD sin depender de GPU NVIDIA. El repositorio no incluye pesos (0,0 GB) y no se documenta la arquitectura, el número de parámetros ni la longitud de contexto del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: unsloth/flint-GGUF) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se documenta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (único formato referenciado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); este repositorio no contiene pesos, solo el paquete Loom |
| Autor | loom-fun |
| Modelo base | unsloth/flint-GGUF |
| Tamaño del repositorio | 0,0 GB (pesos no incluidos) |
| Pipeline | no disponible |
| Creación / actualización | 2026-10-28 / 2026-10-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente (transformer, MoE, híbrido, etc.), ni sobre su proceso de entrenamiento: número de tokens, composición del dataset o uso de técnicas como RLHF o DPO. La model card se limita a indicar que el checkpoint `unsloth/flint-GGUF` se emplea sin modificar, en cuantización Q8_0.

Lo que sí describe la ficha es la infraestructura de empaquetado y servicio: el paquete pertenece al ecosistema Loom (SDK `hrx-loom`, alojado en el repositorio ROCm/hrx-system), un formato que combina programas `.loom` con una tarjeta `model.json` y un fichero de bloqueo (`model.json.lock`) para verificar la integridad de los pesos descargados. El servidor `loom-serve` arranca con `--device=amdgpu`, lo que indica que la ejecución está orientada a la GPU integrada del APU AMD Ryzen AI Max+ 395 "Strix Halo".

## Capacidades

- Generación de texto conversacional expuesta mediante el endpoint `/v1/chat/completions` en formato OpenAI, lo que permite usar cualquier cliente del SDK de OpenAI apuntando a `127.0.0.1:8080`.
- Inferencia local en GPU AMD mediante `loom-serve --device=amdgpu`, sin necesidad de hardware NVIDIA.
- Distribución verificada: los pesos se descargan con `loom-fetch` y se comprueban contra `model.json.lock`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Capacidades especiales (visión, audio, thinking mode): no disponible (no documentado).

## Casos de uso

- Asistente conversacional local en hardware AMD: en un portátil o mini-PC con Ryzen AI Max+ 395, `loom-serve` levanta un servidor de chat en `127.0.0.1:8080`; cualquier aplicación que hable el formato de chat completions de OpenAI puede conectarse sin cambios de código.
- Entorno de desarrollo sin coste por token: al exponer una API compatible con OpenAI, se pueden probar integraciones existentes (scripts, editores, backends) apuntando al endpoint local en lugar de a la API remota, eliminando gasto por token y latencia de red.
- Procesamiento de texto sensible: como el servidor escucha solo en localhost, documentos internos, código propietario o datos personales no salen de la máquina, lo que encaja con requisitos de confidencialidad o sectores regulados.
- Validación de empaquetado GGUF en plataforma AMD: el flujo `loom-fetch` con verificación por `model.json.lock` sirve para auditar que un checkpoint Q8_0 se descarga y ejecuta de forma reproducible en Strix Halo, útil como prueba de QA en cadenas de distribución de modelos.
- Producción en serie de paquetes Loom: el paquete se generó con el flujo de fábrica loom-skills, por lo que puede tomarse como plantilla para empaquetar otros GGUF del mismo modo de forma automatizada.
- Demostraciones y equipos sin conexión: al ejecutarse íntegramente en un APU de consumo con memoria unificada, permite montar demos o kioscos de inferencia offline sin GPU dedicada.
- Integración con herramientas de productividad locales: clientes de chat, extensiones de editor o automatizaciones que ya soporten el formato de chat completions pueden aprovechar el modelo como motor de redacción y resumen de texto en el propio equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware de referencia documentado: AMD Ryzen AI Max+ 395 "Strix Halo", un APU de gama alta con memoria unificada, sobre el que se generó el paquete.
- VRAM estimada para inferencia: no disponible, al no documentarse el número de parámetros del modelo. Como regla general, un GGUF Q8_0 ocupa aproximadamente un byte por parámetro más la sobrecarga del contexto y los búfers de inferencia.
- GPU recomendadas: no se documenta compatibilidad explícita más allá de la iGPU del Strix Halo mediante `--device=amdgpu`.
- Hardware de consumo: sí; el flujo documentado está diseñado para un APU presente en portátiles y mini-PC, no para servidores con GPU de datacenter.
- Despliegue: instalación del SDK con `pip install "hrx-loom[hf]"`, descarga con `loom-fetch` y arranque con `loom-serve --model=flint-GGUF/model.json --device=amdgpu`. El servidor atiende en `127.0.0.1:8080`. El formato GGUF es en principio compatible con runtimes habituales como llama.cpp u Ollama, aunque este paquete está pensado para `loom-serve` y esa vía no está documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al no documentarse el tamaño, la arquitectura ni el rendimiento del modelo base `flint`, no es posible identificar alternativas comparables con datos contrastables. La referencia directa es el repositorio de pesos originales, [unsloth/flint-GGUF](https://huggingface.co/unsloth/flint-GGUF), del que este paquete es un envoltorio de despliegue.

## Limitaciones y advertencias

- El repositorio no incluye los pesos (0,0 GB): la inferencia exige una descarga adicional desde `unsloth/flint-GGUF`, con la dependencia de red y de espacio en disco que ello implica.
- Documentación mínima: no se publican capacidades, longitud de contexto, idiomas soportados ni benchmarks, por lo que cualquier evaluación de calidad queda en manos del usuario.
- Adopción prácticamente nula en el momento de redactar la ficha (0 descargas y 0 likes), sin validación comunitaria que respalde el paquete.
- Fuerte ligazón al ecosistema Loom (`hrx-loom`) y al dispositivo `amdgpu`: fuera de ese flujo, el paquete no aporta valor frente a descargar el GGUF directamente.
- Licencia: el paquete es Apache-2.0, que permite uso comercial; la licencia aplicable al modelo base debe verificarse en su propio repositorio antes de cualquier despliegue comercial.
- Riesgo de alucinación propio de todo modelo de lenguaje, sin evaluaciones publicadas que lo cuantifiquen; no se recomienda uso en producción sin pruebas previas de exactitud y seguridad.
- El servidor escucha solo en `127.0.0.1:8080`: adecuado para uso local, pero no apto tal cual para escenarios multiusuario; exponerlo requeriría un proxy inverso con autenticación y controles adicionales.

## Enlaces

- Ficha del modelo: https://huggingface.co/loom-fun/unsloth-flint-loom
- Modelo base (pesos GGUF): https://huggingface.co/unsloth/flint-GGUF
- SDK Loom (hrx-system, ROCm): https://github.com/ROCm/hrx-system
- Flujo de fábrica loom-skills: https://github.com/loom-fun/loom-skills
