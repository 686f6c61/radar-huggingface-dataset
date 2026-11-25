# manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor

## Resumen

Qwen3.8-Flash-Next-Hibana-Thor es un repositorio de artefactos de despliegue publicado por el usuario manateelazycat bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un paquete de pesos auxiliares y variantes cuantizadas pensado para acompañar a un LPK de AI Pod identificado como `cloud.lazycat.aipod.qwen38-flash-next-origin`. El repositorio empaqueta un borrador especulativo (DFlash2) y copias de decodificación en 3 bits calibradas, mientras que los pesos base no enrutados se descargan por separado desde otro repositorio.

El modelo subyacente es Qwen3.8-Flash-Next, de la familia Qwen, con una arquitectura que, a juzgar por la referencia a "expert" y "non-routed base weights", parece ser de tipo mezcla de expertos (MoE). El paquete incluye además una torre de visión Qwen3-VL, lo que sugiere capacidades multimodales. El tamaño total del repositorio es de 52,1 GB, coherente con pesos en safetensors de un modelo grande más los artefactos de cuantización.

La relevancia de esta ficha es limitada pero concreta: se trata de un conjunto de activos de despliegue reproducible (con digests SHA-256 registrados en `provenance.json`) para servir un modelo Qwen de gran tamaño en hardware con memoria restringida, combinando cuantización de 3 bits y decodificación especulativa. No hay información pública sobre entrenamiento, benchmarks ni idiomas en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferido de las referencias a "expert" y "non-routed base weights"); incluye torre de visión Qwen3-VL |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits calibrados (w3, NVFP4-sharar-w3-qad); pesos base en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura completa del modelo base. El repositorio se limita a organizar artefactos de despliegue en dos directorios: `draft/`, que contiene un borrador especulativo de bloques paralelos DFlash2 (procedente de `incoai/Qwen3.8-Flash-Next-DFlash2`), y `w3/`, que contiene copias de decodificación de expertos y del tronco cuantizadas a 3 bits y calibradas (procedentes de `yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3-qad`). Los pesos base no enrutados (tronco, PLE y torre de visión Qwen3-VL) no se incluyen y deben descargarse de `RadixArk/Qwen3.8-Flash-Next-NVFP4`.

La innovación técnica destacable es la combinación de decodificación especulativa con un borrador DFlash2 de bloques paralelos y cuantización agresiva a 3 bits calibrada sobre los expertos, lo que apunta a reducir el coste de memoria y aumentar el throughput en inferencia. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la documentación.
- Procesamiento de visión: la inclusión de la torre Qwen3-VL indica soporte multimodal de entrada de imagen.
- Decodificación especulativa: el borrador DFlash2 permite acelerar la generación mediante propuestas de bloques paralelos verificadas por el modelo principal.
- Despliegue en memoria reducida: las copias w3 de 3 bits permiten servir expertos y tronco con menor huella de VRAM.
- Tool calling, agentes, modo thinking, audio y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos AI Pod: el paquete está diseñado explícitamente para el LPK `cloud.lazycat.aipod.qwen38-flash-next-origin`, de modo que un operador puede instalar el modelo con artefactos fijados y verificables mediante SHA-256.
- Inferencia multimodal en local: la torre Qwen3-VL incluida en los pesos base permite tareas de descripción de imágenes o respuesta a preguntas visuales en entornos con GPU de gama alta pero VRAM limitada.
- Servicio de chat con latencia reducida: el borrador DFlash2 acelera la decodificación especulativa, adecuado para asistentes conversacionales donde el tiempo por token es crítico.
- Reproducibilidad de despliegues: `provenance.json` con tamaños y digests permite auditar qué pesos exactos se sirven en producción, útil en entornos regulados.
- Experimentación con cuantización de 3 bits: investigadores pueden comparar la calidad de las copias w3 calibradas frente a los pesos NVFP4 base en tareas de razonamiento y código.
- Evaluación de decodificación especulativa: el par draft/trunk permite medir la tasa de aceptación del borrador y el speedup real en distintos hardware.
- Distribución de artefactos en pipelines MLOps: el repositorio sirve como origen de pesos para automatizar despliegues con verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 52,1 GB, por lo que se requiere al menos una GPU con 48-80 GB para cargar los artefactos completos, aunque las copias w3 reducen la huella de los expertos.
- GPU recomendadas: no disponible en la documentación; por el formato NVFP4 y el tamaño, se orienta a GPUs de centro de datos (A100, H100, H200) o GPUs consumer de gama alta con suficiente memoria.
- GPU consumer: no confirmado; probablemente no cabe en GPUs de 24 GB sin descarga parcial de expertos.
- Opciones de despliegue: no se especifican en la model card; el paquete está pensado para el runtime del AI Pod de Lazycat, no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La documentación no proporciona datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene el modelo completo: depende de la descarga separada de pesos base desde `RadixArk/Qwen3.8-Flash-Next-NVFP4`, lo que introduce un punto de fallo externo.
- La cuantización a 3 bits puede degradar la calidad respecto a los pesos originales en tareas sensibles como matemáticas o código; no se publican evaluaciones al respecto.
- No hay información sobre sesgos, alucinación ni idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los pesos base descargados por separado, que puede diferir.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de su funcionamiento.
- La fecha de creación (2026-11-25) y la nomenclatura "Qwen3.8" no se corresponden con versiones públicas conocidas de Qwen, lo que exige precaución sobre la procedencia real de los pesos.
- No se documentan requisitos de runtime ni compatibilidad con frameworks estándar de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-Hibana-Thor
- Pesos base NVFP4: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Copias w3 calibradas: https://huggingface.co/yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3-qad
