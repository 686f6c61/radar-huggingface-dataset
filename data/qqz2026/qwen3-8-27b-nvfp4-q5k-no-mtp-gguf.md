# QQZ2026/Qwen3.8-27B-NVFP4-Q5K-no-MTP-GGUF

## Resumen

Este repositorio contiene una derivación en formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, cuantizada con NVFP4 y Q5K, y modificada físicamente para eliminar la capa MTP (Multi-Token Prediction). El resultado es un artefacto optimizado para ejecutarse en GPUs de consumo con 16 GB de VRAM, como la NVIDIA GeForce RTX 5060 Ti, manteniendo el backbone de texto completo en GPU y el proyector de visión en RAM del sistema. La model card documenta un perfil de memoria ajustado (~15,8 GiB) y un rendimiento de decodificación de aproximadamente 25,9 tok/s en flujo único, con soporte de contexto compartido de 66K tokens y procesamiento de imágenes mediante `--image-max-tokens 4096`.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de 27B parámetros en hardware asequible, sin sacrificar el contexto largo ni la capacidad de visión, gracias a la eliminación de la capa MTP y a una configuración cuidadosa de caché KV y offload. Está pensado para usuarios de llama.cpp que buscan un despliegue local con rendimiento predecible en una GPU de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27B (denominacion del modelo base; el dato de safetensors de 460.730.096 parece inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | 66.000 tokens (configuracion recomendada en la model card; el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | NVFP4 (pesos) + Q5K (GGUF) y Q4_0 para cache KV |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen3.8-27B. La model card se centra en la modificacion estructural aplicada al GGUF original: se elimino fisicamente la capa MTP (NextN) incrustada, reduciendo el numero de bloques de 65 a 64 y eliminando 15 tensores (227,91 MiB menos). Esta operacion se realizo sin requantizacion, copiando los tensores restantes sin cambios. El objetivo es reducir el uso de VRAM y simplificar la ejecucion en hardware limitado, manteniendo la funcionalidad multimodal (vision + texto) mediante el proyector F16 que se ejecuta en RAM.

No hay datos publicos sobre el dataset de entrenamiento, el numero de tokens procesados ni tecnicas de alineacion (RLHF, DPO, etc.) aplicadas al modelo original.

## Capacidades

- Multimodal: procesa imagenes y texto (pipeline `image-text-to-text`).
- Generacion de texto con contexto largo (hasta 66K tokens en la configuracion recomendada).
- Soporte de vision mediante proyector F16 (mmproj) que se ejecuta en CPU.
- Compatible con el ecosistema llama.cpp (llama-server, llama-cli).
- No se documentan capacidades especificas de tool calling, agentes o razonamiento multi-paso en la model card.

## Casos de uso

- Despliegue local de un asistente multimodal en una GPU de 16 GB: el modelo cabe en una RTX 5060 Ti con ~15,8 GiB de VRAM, permitiendo conversaciones con imagenes sin depender de APIs externas.
- Procesamiento de documentos con imagenes y texto largo: con 66K tokens de contexto compartido, puede analizar informes extensos que incluyan figuras o diagramas, siempre que se limite el numero de tokens de imagen con `--image-max-tokens`.
- Agente mixto con dos canales concurrentes: la configuracion P2 con `-np 2` y `--kv-unified` permite ejecutar dos solicitudes simultaneas (por ejemplo, una de clasificacion corta y otra de generacion larga) en un solo pool de KV compartido.
- Pruebas de rendimiento y validacion de hardware: la model card incluye mediciones detalladas de velocidad y memoria, utiles para evaluar la viabilidad de ejecutar modelos 27B en GPUs de gama media.
- Generacion de texto con contexto largo en entornos sin acceso a GPU de alta gama: el perfil de memoria ajustado permite usar el modelo en estaciones de trabajo con 16 GB de VRAM.
- Investigacion sobre cuantizacion y optimizacion de modelos: la eliminacion fisica de la capa MTP y el analisis de su impacto en VRAM y rendimiento pueden servir como referencia para otros proyectos de optimizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona mediciones de rendimiento de inferencia y uso de memoria, que se resumen a continuacion.

| Metrica | Valor |
|---|---|
| Decodificacion en flujo unico (full GPU, 32K y 72K) | 25,88 y 25,85 tok/s |
| Decodificacion bajo carga concurrente (Vision + MAIN) | 19,7–20,3 tok/s |
| Prompt processing bajo carga concurrente | 191–194 tok/s |
| Decodificacion con P2 (dos generaciones simultaneas de 512 tokens) | 24,35 y 24,48 tok/s (agregado ~48,8 tok/s) |
| Uso de VRAM en arranque | 15.810 MiB |
| Uso de VRAM tras warm-up | 15.816 MiB |
| Tamano del proyector de vision | 927,6 MiB (334 tensores) |

Estas cifras se obtuvieron en una RTX 5060 Ti 16 GB con llama.cpp b10435, CUDA 13.3 y compilacion para SM120.

## Requisitos de hardware

- GPU recomendada: NVIDIA GeForce RTX 5060 Ti 16 GB (validada en la model card).
- VRAM necesaria: ~15,8 GiB para el perfil completo (texto en GPU, proyector de vision en RAM).
- Se requiere al menos 16 GB de VRAM para la configuracion documentada; no se garantiza su funcionamiento en GPUs con menos memoria.
- El proyector de vision se ejecuta en CPU mediante `--no-mmproj-offload`, lo que libera VRAM.
- Software: llama.cpp compilado con soporte CUDA (SM120), version b10435 o superior.
- Opciones de despliegue: llama-server (recomendado) o llama-cli; no se mencionan otros backends como vLLM o Ollama.
- Latencia: decodificacion de ~25,9 tok/s en flujo unico y ~20 tok/s bajo carga concurrente; el procesamiento de prompt alcanza ~191-194 tok/s.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria (tamano o tarea). Se recomienda consultar benchmarks publicos de la familia Qwen para una referencia general.

## Limitaciones y advertencias

- La licencia del modelo no esta disponible, lo que impide determinar si es apto para uso comercial o restringido.
- El perfil de memoria esta ajustado especificamente para la RTX 5060 Ti 16 GB; otras GPUs con 16 GB pueden requerir ajustes en la configuracion (por ejemplo, reducir contexto o cambiar el offload).
- Sin el limite `--image-max-tokens`, las solicitudes de vision pueden expandir el contexto hasta agotar la capacidad compartida (se observaron 66.111 tokens combinados, causando error de contexto).
- El patch experimental de Flash Attention no se recomienda para produccion, ya que provoca un crecimiento escalonado de la VRAM bajo cargas P2 + Vision.
- La eliminacion fisica de la capa MTP puede afectar a la calidad de generacion en comparacion con el modelo original, aunque no se han publicado evaluaciones al respecto.
- El modelo base Qwen3.8-27B no tiene documentacion publica de sesgos o riesgos de alucinacion en esta derivacion; se asume que hereda las limitaciones tipicas de los LLM.

## Enlaces

- Repositorio HuggingFace: [QQZ2026/Qwen3.8-27B-NVFP4-Q5K-no-MTP-GGUF](https://huggingface.co/QQZ2026/Qwen3.8-27B-NVFP4-Q5K-no-MTP-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
