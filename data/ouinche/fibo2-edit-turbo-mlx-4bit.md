# Ouinche/FIBO2-Edit-Turbo-MLX-4bit

## Resumen

FIBO2-Edit-Turbo-MLX-4bit es una conversión nativa para Apple Silicon del modelo de difusión Bria AI Fibo-2.0-edit-turbo, publicada por el usuario Ouinche. Se trata de un modelo de generación y edición de imágenes (text-to-image, image-to-image e inpainting) cuantizado a 4 bits y ejecutable mediante el framework MLX de Apple, lo que permite su inferencia en Macs con memoria unificada. La conversión reduce el paquete en disco de 24,3 GB a aproximadamente 7,3 GB y el pico de memoria en ejecución de 17,4 GB a menos de 6,8 GB.

El modelo base es un transformer de difusión (DiT) de 44 capas que incorpora un codificador de texto Qwen3-VL-4B-Instruct, lo que le confiere capacidad multimodal para tomar imágenes de referencia además de instrucciones en lenguaje natural. La versión cuantizada aplica formato afín de 4 bits con `group_size=64` tanto al DiT como al codificador de texto. El objetivo declarado es hacer viable la inferencia de un modelo de edición de imágenes de gran tamano en equipos con 16 GB de memoria unificada, sin recurrir a swap de SSD.

Es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan edición de imágenes por instrucciones (cambio de atributos, composición multi-referencia, inpainting con máscara) en local, sin depender de servicios en la nube. La licencia del modelo base es Bria Fibo, enlazada a CC BY-NC 4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de 44 capas con codificador de texto Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín, `group_size=64`, `bits=4` (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Bria Fibo (`license_name: bria-fibo`), enlazada a CC BY-NC 4.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Bria Fibo-2.0-edit-turbo: un transformer de difusión de 44 capas que opera sobre latentes de imagen y se condiciona mediante un codificador de texto Qwen3-VL-4B-Instruct. Esta combinación permite el condicionamiento multimodal, es decir, tomar tanto prompts textuales como imágenes de referencia para tareas de edición. El modelo está disenado para generación en pocos pasos (4 pasos "Turbo"), lo que reduce el coste computacional por imagen.

La conversión de Ouinche no reentrena el modelo: aplica cuantización afín de 4 bits con grupo de 64 al DiT y al codificador de texto, y empaqueta los pesos para MLX. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable, incluidos 512×512 y 1024×1024.
- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image), preservando identidad, geometría facial, pose y fondo.
- Composición multi-referencia: combinación de varias imágenes de entrada para transferir identidad, prendas, color y textura.
- Inpainting con máscara binaria: reemplazo de regiones enmascaradas con preservación determinista de las zonas no enmascaradas mediante feathering de bordes y composición alfa.
- Inferencia en 4 pasos (Turbo), optimizada para tiempos de generación reducidos.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte de GUI en DiffusionBear.
- No se documentan capacidades de tool calling, agentes ni audio en la información disponible.

## Casos de uso

- Edición de retratos para estudios fotográficos: cambiar el color de una prenda ("the jacket color is now red") manteniendo la identidad y la pose, con 4 pasos de inferencia a 768×512 en unos 88 s en un M1 de 16 GB.
- Prueba virtual de moda: combinar la imagen de una persona con la imagen de una prenda para generar una composición coherente que respete la identidad y el corte, color y tejido de la prenda, usando el modo multi-referencia.
- Retoque localizado con inpainting: eliminar o sustituir objetos en una escena pintando una máscara binaria, con preservación estricta de las zonas no enmascaradas gracias al feathering y la composición alfa.
- Generación de material gráfico en local: crear ilustraciones o imágenes conceptuales a 512×512 en aproximadamente 59 s en un M1 de 16 GB, sin depender de servicios en la nube.
- Prototipado de pipelines de edición en macOS: integrar el modelo en scripts Python mediante MLX para experimentar con prompts, resoluciones y semillas antes de escalar a producción.
- Investigación en cuantización de modelos de difusión: usar esta conversión como referencia para estudiar el impacto de la cuantización afín de 4 bits en la calidad de imagen y el consumo de memoria.
- Aplicaciones de privacidad: procesar imágenes sensibles (retratos, documentos visuales) íntegramente en el equipo del usuario, sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye mediciones de tiempo de generación y memoria en un Apple Silicon M1 de 16 GB, que se recogen a continuación:

| Caso | Resolución | Pasos | Tiempo | Pico de memoria |
|---|---|---|---|---|
| Text-to-image (bicicleta) | 512×512 | 4 | 58,8 s (14,7 s/paso) | < 6,8 GB |
| Text-to-image (leopardo de las nieves) | 1024×1024 | 4 | 303 s (75,9 s/paso) | < 6,8 GB |
| Edición de referencia única | 768×512 | 4 | ~88 s (~22 s/paso, en caliente) | < 6,8 GB |
| Composición multi-referencia | 512×768 | 4 | ~92 s (en caliente) | < 6,8 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: menos de 6,8 GB de pico en ejecución, con cero swap de SSD en Macs de 16 GB de memoria unificada.
- Espacio en disco: aproximadamente 7,3 GB para el paquete cuantizado (frente a 24,3 GB del modelo sin cuantizar).
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada; el modelo fue validado en un M1 de 16 GB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 16 GB; no se documenta compatibilidad con GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX (librería `mlx`) mediante el script `fibo2_generate.py`, y GUI nativa DiffusionBear.
- Latencia y throughput: 14,7 s/paso a 512×512 y 75,9 s/paso a 1024×1024 en M1 de 16 GB; las cifras de edición en caliente rondan los 22 s/paso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el modelo base sin cuantizar (briaai/Fibo-2.0-edit-turbo) requiere 24,3 GB en disco y 17,4 GB de pico de memoria, lo que provoca swap severo o fallos en Macs de 16 GB. La versión de lvladikov (FIBO2-Edit-Turbo-T2I) figura como modelo base adicional, pero no se detallan sus especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ouinche/FIBO2-Edit-Turbo-MLX-4bit | no disponible | no disponible | Bria Fibo (CC BY-NC 4.0) | Hugging Face, MLX |
| briaai/Fibo-2.0-edit-turbo | no disponible | no disponible | Bria Fibo | Hugging Face |
| lvladikov/FIBO2-Edit-Turbo-T2I | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Bria Fibo enlaza a CC BY-NC 4.0, por lo que el uso comercial requiere verificar los términos con Bria AI; no está permitido el uso comercial directo sin autorización.
- El modelo es una conversión de la comunidad (usuario Ouinche), no una publicación oficial de Bria AI; la calidad y el soporte dependen del autor de la conversión.
- La cuantización a 4 bits puede introducir degradación en la fidelidad de detalles finos, texturas y texto dentro de la imagen; no se documentan evaluaciones cuantitativas de esta pérdida.
- Riesgo de alucinación visual: como modelo generativo, puede producir atributos inexistentes o alterar elementos no solicitados, especialmente en edición multi-referencia.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador Qwen3-VL-4B-Instruct no está validado en esta conversión.
- Compatibilidad limitada al ecosistema Apple Silicon y MLX; no se documenta soporte para CUDA, ROCm ni otras plataformas.
- Los tiempos de generación a 1024×1024 son elevados (unos 303 s en M1 de 16 GB), lo que limita su uso interactivo en resoluciones altas.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.

## Enlaces

- [Hugging Face: Ouinche/FIBO2-Edit-Turbo-MLX-4bit](https://huggingface.co/Ouinche/FIBO2-Edit-Turbo-MLX-4bit)
- [Modelo base: briaai/Fibo-2.0-edit-turbo](https://huggingface.co/briaai/Fibo-2.0-edit-turbo)
- [Modelo base adicional: lvladikov/FIBO2-Edit-Turbo-T2I](https://huggingface.co/lvladikov/FIBO2-Edit-Turbo-T2I)
- [Framework MLX](https://github.com/ml-explore/mlx)
- [DiffusionBear (GUI)](https://github.com/OuincheWinch/DiffusionBear)
- [Licencia CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en)
