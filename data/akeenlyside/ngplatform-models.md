# akeenlyside/ngplatform-models

## Resumen

`ngplatform-models` es un repositorio de conversiones a ONNX de dos modelos de segmentación de imágenes médicas, publicadas por el usuario akeenlyside para el proyecto ngplatform del Allen Institute. No se trata de un modelo de lenguaje ni de un modelo entrenado por el autor: son exportaciones de pesos originales de terceros, redistribuidas bajo licencia Apache-2.0, pensadas para ejecutarse en el navegador mediante ONNX Runtime Web dentro de la herramienta de segmentación de ngplatform.

El repositorio contiene dos artefactos diferenciados. Por un lado, SAM-Med3D-turbo, un modelo de segmentación 3D a partir de puntos sobre recortes de 128³ vóxeles a resolución de 1,5 mm, con un encoder de 187 MB y un decoder de 15 MB. Por otro, MedSAM2, una adaptación de SAM 2.1 Hiera-tiny afinada sobre imágenes médicas, que segmenta una sección a partir de una caja o clics y la propaga a lo largo de un volumen, distribuida en cuatro grafos que suman 86 MB.

La relevancia de este repositorio es fundamentalmente práctica: facilita el despliegue cliente-side de segmentación médica sin backend GPU, con pesos en float16 (convertidos a float32 dentro del grafo) y manifiestos JSON con hashes de versión por carpeta. El autor advierte explícitamente de que no es apto para uso clínico. El tamaño total del repositorio es de 0,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos modelos: SAM-Med3D-turbo (segmentación 3D promptable) y MedSAM2 (SAM 2.1 Hiera-tiny afinado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 128³ vóxeles en SAM-Med3D-turbo) |
| Tipos de cuantización | Pesos almacenados en float16, convertidos a float32 en el grafo; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con manifest.json por carpeta) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: son conversiones a ONNX de pesos originales. SAM-Med3D-turbo es un modelo de segmentación volumétrica promptable que opera sobre recortes 3D de 128³ vóxeles a 1,5 mm de resolución y se activa mediante puntos; se exporta como encoder (187 MB) y decoder (15 MB). MedSAM2 parte de SAM 2.1 con backbone Hiera-tiny, afinado sobre imágenes médicas, y segmenta una sección a partir de una caja o clics, propagándola a través de un volumen; se exporta en cuatro grafos con un total de 86 MB.

La innovación técnica del repositorio es la conversión en sí: pesos en float16 con cast a float32 dentro del grafo, empaquetado con manifiestos que listan ficheros, tamaños y un hash de versión, y verificación frente a los modelos originales en PyTorch mediante los scripts de `tools/sammed3d/` y `tools/medsam2/` del repositorio ngplatform. El objetivo es la ejecución en navegador con ONNX Runtime Web. No se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO (no aplica en segmentación).

## Capacidades

- Segmentación 3D promptable de estructuras en volúmenes médicos mediante puntos (SAM-Med3D-turbo).
- Segmentación a partir de caja delimitadora o clics con propagación de la sección a lo largo de un volumen (MedSAM2).
- Ejecución en navegador mediante ONNX Runtime Web, sin backend GPU dedicado.
- Exportación en formato ONNX con pesos float16 y cast a float32 en el grafo.
- Versionado de artefactos mediante `manifest.json` con tamaños y hash de ficheros.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, texto ni audio: es exclusivamente visión/segmentación.

## Casos de uso

- Anotación interactiva de volúmenes médicos en el navegador: SAM-Med3D-turbo permite marcar puntos sobre un recorte 128³ y obtener la máscara de la estructura, sin instalar software ni disponer de GPU local.
- Herramientas de etiquetado para investigación: MedSAM2 permite delimitar una sección con una caja o clics y propagarla por el volumen, acelerando la creación de datasets de segmentación.
- Demostraciones y prototipos web de segmentación médica: al ejecutarse con ONNX Runtime Web, se integra en aplicaciones cliente-side sin infraestructura de inferencia.
- Preprocesado en pipelines de imagen médica: generar máscaras preliminares que luego se revisan o refinan manualmente antes de tareas posteriores.
- Validación de conversiones ONNX: los scripts de `tools/` permiten comparar las salidas ONNX con los modelos PyTorch originales como parte de un control de calidad.
- Educación y formación: visualización interactiva de segmentación promptable 3D en entornos docentes sin requisitos de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en navegador mediante ONNX Runtime Web; no requiere GPU dedicada.
- SAM-Med3D-turbo: encoder de 187 MB y decoder de 15 MB en disco; la memoria en ejecución depende del runtime y del recorte 128³.
- MedSAM2: cuatro grafos que suman 86 MB en disco.
- No se documentan GPU recomendadas, latencia ni throughput.
- Opciones de despliegue: ONNX Runtime Web en el navegador; otros runtimes ONNX no se mencionan en la información disponible.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| ngplatform-models (SAM-Med3D-turbo) | Segmentación 3D promptable, ONNX | Encoder 187 MB + decoder 15 MB | Apache-2.0 | Hugging Face (akeenlyside/ngplatform-models) |
| ngplatform-models (MedSAM2) | Segmentación 2D/3D con propagación, ONNX | 86 MB (cuatro grafos) | Apache-2.0 | Hugging Face (akeenlyside/ngplatform-models) |
| SAM-Med3D (original) | Segmentación 3D promptable, PyTorch | no disponible | Apache-2.0 | Hugging Face (blueyo0/SAM-Med3D) |
| MedSAM2 (original) | Segmentación médica 2D/3D, PyTorch | no disponible | Apache-2.0 | Hugging Face (wanglab/MedSAM2) |

## Limitaciones y advertencias

- El autor indica explícitamente que no es apto para uso clínico.
- Son conversiones, no modelos entrenados por el autor; los pesos y el entrenamiento son obra de los autores originales.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad de segmentación.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el uso médico recae en el integrador.
- Solo se documenta ejecución con ONNX Runtime Web; el soporte en otros runtimes no está confirmado.
- Los pesos están en float16 con cast a float32 en el grafo, lo que puede afectar a la precisión frente a los originales en PyTorch (no se cuantifica).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/akeenlyside/ngplatform-models
- Proyecto ngplatform: https://github.com/AllenInstitute/ngplatform
- SAM-Med3D (código): https://github.com/uni-medical/SAM-Med3D
- SAM-Med3D (pesos): https://huggingface.co/blueyo0/SAM-Med3D
- MedSAM2 (código): https://github.com/bowang-lab/MedSAM2
- MedSAM2 (pesos): https://huggingface.co/wanglab/MedSAM2
- Paper SAM-Med3D: arXiv:2310.15161
- Paper MedSAM2: arXiv:2504.03600
