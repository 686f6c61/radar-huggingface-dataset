# manateelazycat/qwen35-4b-runtime

## Resumen

`manateelazycat/qwen35-4b-runtime` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de despliegue: archivos `docker save.gz` que empaquetan el runtime de inferencia y sus dependencias para ejecutar la aplicación "AI Pod Qwen 3.5 4B" sobre dispositivos NVIDIA Jetson. El autor es manateelazycat y el repositorio se publica bajo la etiqueta `llama.cpp`, con licencia `other`.

El modelo propiamente dicho no se aloja aquí: la model card indica explícitamente que los pesos GGUF y el proyector de visión deben descargarse por separado desde `unsloth/Qwen3.5-4B-MTP-GGUF`. Por tanto, este repositorio contiene únicamente las imágenes de contenedor necesarias para arrancar el stack de inferencia en hardware Jetson (AGX Orin y AGX Thor).

Su relevancia es operativa: simplifica el despliegue reproducible de un modelo Qwen 3.5 de 4B parámetros en plataformas edge de NVIDIA, con verificación de integridad mediante tamaño y SHA256 de cada archivo. No aporta información sobre arquitectura del modelo, datos de entrenamiento ni evaluación de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene el runtime, no los pesos) |
| Parámetros totales | 4B (según el nombre del modelo referenciado, Qwen 3.5 4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los GGUF se descargan aparte desde `unsloth/Qwen3.5-4B-MTP-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | other (llama.cpp y CUDA/NCCL incluidos en `licenses/`, cada componente sujeto a su propia licencia) |
| Formato de pesos | no aplica a este repo; los pesos se distribuyen como GGUF en otro repositorio |

## Arquitectura y entrenamiento

No disponible. El repositorio no documenta la arquitectura del modelo Qwen 3.5 4B, ni los datos de entrenamiento, ni procesos de alineación (RLHF/DPO). La model card se limita a describir los artefactos de runtime.

Lo que sí se documenta es la infraestructura de despliegue: dos archivos comprimidos de imagen Docker, uno para AGX Orin (`runtime-orin-0.1.2.tar.gz`, 319.156.055 bytes) con CUDA VMM deshabilitado, y otro para AGX Thor (`runtime-thor-0.1.1.tar.gz`, 777.448.570 bytes). La aplicación verifica el tamaño del archivo, su SHA256 y la identidad de la imagen cargada antes de ejecutar. La carga se realiza con `docker load -i <archive>`.

## Capacidades

- No disponible a nivel de modelo: el repositorio no describe las capacidades del modelo Qwen 3.5 4B.
- El stack referenciado incluye un proyector de visión (vision projector), lo que sugiere soporte multimodal en la aplicación AI Pod, aunque no se detallan las capacidades concretas.
- Despliegue sobre Jetson AGX Orin y AGX Thor con CUDA y NCCL.
- Verificación de integridad de artefactos (tamaño, SHA256, identidad de imagen).
- No se documenta soporte de tool calling, agentes ni modos de razonamiento en la información disponible.

## Casos de uso

- Despliegue edge en Jetson AGX Orin: cargar `runtime-orin-0.1.2.tar.gz` con `docker load` permite arrancar el stack de inferencia del AI Pod en un dispositivo Orin sin compilar llama.cpp ni gestionar dependencias CUDA manualmente.
- Despliegue edge en Jetson AGX Thor: el archivo `runtime-thor-0.1.1.tar.gz` cubre la plataforma Thor, con su propia versión de runtime y dependencias empaquetadas.
- Reproducibilidad en producción: los SHA256 publicados permiten validar que la imagen cargada coincide con la publicada, útil en pipelines de despliegue automatizado en flotas de dispositivos.
- Prototipado de aplicaciones multimodales en edge: al requerir un proyector de visión separado, el stack está pensado para escenarios con entrada de imagen además de texto, aunque las capacidades exactas no se detallan.
- Aislamiento de dependencias: al usar imágenes Docker, se evita contaminar el sistema host del dispositivo Jetson con versiones específicas de CUDA, NCCL o llama.cpp.
- Distribución interna de runtimes: el formato `docker save.gz` facilita la distribución offline a dispositivos sin acceso a registros de contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataformas soportadas: NVIDIA Jetson AGX Orin (runtime 0.1.2) y NVIDIA Jetson AGX Thor (runtime 0.1.1).
- VRAM estimada: no disponible.
- GPU de escritorio recomendadas: no disponibles; el repositorio está orientado exclusivamente a Jetson.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: Docker (`docker load -i <archive>`), con llama.cpp como runtime de inferencia y CUDA/NCCL como dependencias.
- Latencia y throughput: no disponibles.
- Tamaño de los artefactos: 319 MB (Orin) y 777 MB (Thor) comprimidos; el repositorio completo ocupa 1,6 GB.
- Los pesos GGUF y el proyector de visión deben descargarse aparte desde `unsloth/Qwen3.5-4B-MTP-GGUF`.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo sino un paquete de runtime, por lo que una comparativa con modelos de lenguaje no resulta aplicable. Como referencia, el modelo subyacente sería Qwen 3.5 4B, pero no se dispone de datos de arquitectura, contexto ni benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo: sin descargar los GGUF y el proyector de visión desde `unsloth/Qwen3.5-4B-MTP-GGUF`, el runtime no es funcional por sí solo.
- Licencia `other`: no se especifican los términos exactos de uso comercial; es necesario revisar `licenses/` dentro de los archivos y las licencias de llama.cpp, NVIDIA CUDA y NCCL, que se aplican por separado.
- Compatibilidad restringida a Jetson AGX Orin y AGX Thor; no se documenta soporte para otras GPU ni para CPU.
- El runtime de Orin usa CUDA VMM deshabilitado, lo que puede afectar al rendimiento o a la gestión de memoria frente a configuraciones con VMM habilitado.
- Sin información sobre sesgos, alucinación, idiomas o limitaciones del modelo subyacente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Fechas de creación y actualización (2026) poco habituales; conviene verificar la procedencia de los artefactos antes de usarlos en producción.
- No se documentan procesos de actualización ni compatibilidad entre versiones de runtime y versiones de modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/qwen35-4b-runtime
- Pesos GGUF y proyector de visión referenciados: https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- NVIDIA Jetson AGX Orin: https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/
- NVIDIA Jetson AGX Thor: https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/
