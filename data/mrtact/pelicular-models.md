# Mrtact/pelicular-models

## Resumen

`Mrtact/pelicular-models` es un repositorio de artefactos de inferencia, no un modelo de lenguaje propiamente dicho. Lo publica el usuario Mrtact como almacén de ficheros que la aplicación Pelicular descarga bajo demanda desde su pestaña de componentes; cada fichero se obtiene en una revisión fijada y se verifica contra el tamaño y el hash SHA-256 compilados en la aplicación. El repositorio ocupa 2,9 GB y se distribuye en formato ONNX.

Los artefactos incluidos son conversiones a ONNX de modelos de segmentación y separación de fuentes de audio de terceros: EdgeTAM y SAM 2.1 de Meta (facebookresearch), EfficientTAM de Yformer y HTDemucs de facebookresearch. Las conversiones conservan los pesos originales; únicamente cambia el formato de exportación. No hay pesos entrenados por el autor ni una arquitectura propia.

Su relevancia es acotada: sirve como espejo de distribución reproducible para una aplicación concreta, con verificación de integridad por hash. No debe confundirse con un modelo generativo ni usarse como tal; su utilidad depende de la aplicación Pelicular y de las licencias de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agrupación heterogénea de modelos de terceros: segmentación de imágenes (EdgeTAM, EfficientTAM, SAM 2.1) y separación de fuentes de audio (HTDemucs) |
| Parametros totales | no disponible (varía por artefacto; no se publican recuentos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se indica exportación a ONNX; no se documentan precisiones) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | `other` / `various`: Apache-2.0 para los artefactos de segmentación; MIT para el código de Demucs, con pesos preentrenados restringidos a investigación y ofrecidos solo durante la beta |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única. Agrupa exportaciones ONNX de cuatro familias de modelos: EdgeTAM (segmentación de vídeo/imagen eficiente de Meta), EfficientTAM (variante eficiente de SAM), SAM 2.1 (segmentación promptable de Meta) y HTDemucs (separación de pistas de audio en fuentes, del proyecto Demucs). Todas las conversiones mantienen los pesos originales y solo cambian el formato; no se documenta ningún reentrenamiento, ajuste fino ni proceso de alineación (RLHF/DPO) por parte del autor del repositorio.

No se publican datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset ni innovaciones técnicas propias. La única innovación operativa descrita es el mecanismo de distribución: descarga bajo demanda en una revisión fijada con verificación de tamaño y SHA-256, lo que aporta reproducibilidad e integridad en la entrega de artefactos.

## Capacidades

- Segmentación de imágenes y vídeo con modelos promptables (SAM 2.1, EdgeTAM, EfficientTAM), orientada a la extracción de máscaras.
- Separación de fuentes de audio (HTDemucs), típicamente para aislar voces e instrumentos en una mezcla musical.
- Ejecución en formato ONNX, lo que permite desplegar los artefactos con runtimes compatibles con ONNX en lugar de las implementaciones originales de PyTorch.
- Verificación de integridad de cada fichero mediante hash SHA-256 y tamaño compilados en la aplicación consumidora.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe; no es un modelo de lenguaje.

## Casos de uso

- Segmentación de objetos en imágenes dentro de la aplicación Pelicular: el artefacto SAM 2.1 en ONNX permite generar máscaras a partir de indicaciones del usuario sin depender de PyTorch en el cliente.
- Segmentación eficiente en dispositivos con recursos limitados: EdgeTAM y EfficientTAM están pensados para reducir el coste computacional frente a SAM, lo que encaja en aplicaciones de escritorio o móviles.
- Segmentación de vídeo fotograma a fotograma: los modelos de la familia SAM 2.1 y EdgeTAM admiten seguimiento de máscaras en secuencias, útil para edición o rotoscopia asistida.
- Separación de pistas musicales: HTDemucs permite aislar voces, batería, bajo y otros instrumentos para karaoke, remezclas o producción musical amateur.
- Distribución reproducible de artefactos en pipelines de CI/CD: la descarga con revisión fijada y verificación SHA-256 facilita la integración en flujos que exigen integridad binaria.
- Prototipado de aplicaciones multimedia con ONNX Runtime: al estar en ONNX, los modelos pueden ejecutarse en runtimes multiplataforma (CPU, GPU, aceleradores) sin reescribir la capa de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del artefacto concreto (los modelos de segmentación y HTDemucs tienen requisitos distintos y no se documentan).
- GPU recomendadas: no disponible; al ser ONNX, puede ejecutarse en CPU o GPU compatibles con el runtime elegido, pero no se especifican modelos.
- Compatibilidad con GPU de consumo: no disponible; no se indica si los artefactos caben en tarjetas como RTX 3060, 4090 u otras.
- Opciones de despliegue: cualquier runtime compatible con ONNX (ONNX Runtime, entre otros); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mrtact/pelicular-models | Agrupación de artefactos ONNX (segmentación y separación de audio) | ONNX | various (Apache-2.0 y MIT con restricciones) | Hugging Face, 0 descargas |
| facebookresearch/sam2 | Segmentación promptable (original) | PyTorch | Apache-2.0 | GitHub y pesos oficiales |
| facebookresearch/EdgeTAM | Segmentación eficiente (original) | PyTorch | Apache-2.0 | GitHub |
| facebookresearch/demucs (HTDemucs) | Separación de fuentes de audio (original) | PyTorch | MIT (código); pesos con restricciones de investigación | GitHub |

La diferencia principal frente a los originales es el formato (ONNX frente a PyTorch) y el empaquetado para una aplicación concreta; no se documentan mejoras de rendimiento ni cambios en los pesos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento, código o capacidades de agente.
- Los pesos de HTDemucs están restringidos a uso de investigación y solo se ofrecen durante la beta; su uso comercial requiere revisar la licencia original de Demucs.
- La licencia del repositorio es `other`/`various`; cada artefacto tiene su propia licencia, por lo que el uso comercial debe evaluarse caso por caso.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplican a estos modelos.
- No se especifican precisiones de cuantización ni requisitos de hardware, lo que dificulta planificar el despliegue.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en 2026; no hay evidencia de uso o mantenimiento por parte de la comunidad.
- Depende de la aplicación Pelicular para su propósito previsto; fuera de ese contexto su utilidad es la de un espejo de artefactos ONNX.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mrtact/pelicular-models
- EdgeTAM (origen): https://github.com/facebookresearch/EdgeTAM
- EfficientTAM (origen): https://github.com/yformer/EfficientTAM
- SAM 2 (origen): https://github.com/facebookresearch/sam2
- Demucs / HTDemucs (origen): https://github.com/facebookresearch/demucs
