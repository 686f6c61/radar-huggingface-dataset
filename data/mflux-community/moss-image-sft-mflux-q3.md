# mflux-community/moss-image-sft-mflux-q3

## Resumen

`mflux-community/moss-image-sft-mflux-q3` es una conversión comunitaria a MLX del modelo texto-a-imagen `OpenMOSS-Team/MOSS-Image-SFT`, cuantizada a 3 bits con cuantización afín de MLX. La publica MFlux-Community, no el equipo autor del modelo original, y está pensada para ejecutar generación de imágenes de forma local en Apple Silicon mediante la herramienta MFlux. El repositorio ocupa 5,8 GB y hereda la licencia Apache 2.0 del modelo base.

El modelo resuelve el problema de ejecutar un generador texto-a-imagen de la familia MOSS-Image en equipos Mac con memoria unificada, sin depender de CUDA ni de servicios en la nube. Frente a la versión BF16 de 26,2 GB, esta variante Q3 reduce la huella aproximadamente a una quinta parte, a costa de una pérdida de fidelidad que el autor no cuantifica. La model card no detalla arquitectura exacta, número de parámetros, datos de entrenamiento ni límites de prompt.

La relevancia actual está en el ecosistema MLX: permite probar y desplegar generación de imágenes en macOS con una CLI (`mflux-generate-moss-image`) y pesos en safetensors adaptados a MLX. Es una opción adecuada para prototipado, generación offline y experimentación con cuantización agresiva, no para producción de alta fidelidad sin evaluar previamente la degradación respecto a Q5, Q8 o BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo texto-a-imagen con encoder de texto, transformer y VAE; la model card no especifica el tipo exacto de transformer ni el paradigma de difusión |
| Parámetros totales | No disponible oficialmente; el repo BF16 ocupa 26,2 GB, lo que a 2 bytes por parámetro equivaldría a unos 13.000 millones incluyendo encoder, transformer y VAE (estimación no confirmada) |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible; no se documenta el límite de tokens del prompt |
| Tipos de cuantización | MLX affine de 3 bits (Q3); la familia incluye BF16, Q8, Q6, Q5, Q4 y Q3 |
| Idiomas soportados | No disponible; la model card no especifica cobertura lingüística de los prompts |
| Licencia | Apache 2.0, heredada del modelo original |
| Formato de pesos | Safetensors para MLX |
| Librería | `mflux` |
| Tamaño del repositorio | 5,8 GB |
| Resolución de ejemplo | 768 x 768; no se documentan límites máximos |
| Fecha de conversión | 2026-10-22 |

## Arquitectura y entrenamiento

La model card indica que la cuantización se aplica al encoder de texto, al transformer y al VAE. Esa composición es propia de un pipeline texto-a-imagen, pero no se confirma si el transformer es un DiT, una UNet o una variante híbrida. Tampoco se detalla el número de capas, dimensión de los embeddings, tipo de attention ni el tokenizador utilizado por el encoder de texto.

No hay información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación. El sufijo `SFT` del nombre original sugiere ajuste supervisado, pero la model card no describe el proceso. La conversión comunitaria solo modifica los pesos originales mediante conversión a MLX y cuantización afín de 3 bits; no se indica que se hayan realizado cambios arquitectónicos ni un reentrenamiento.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con pipeline `text-to-image`.
- Ejecución local en Apple Silicon mediante MLX y la herramienta MFlux.
- Control de resolución, semilla y ruta de salida a través de la CLI.
- Pesos ya cuantizados a Q3; no requiere pasar `--quantize` al generar.
- Variantes de cuantización disponibles en la misma familia: BF16, Q8, Q6, Q5, Q4 y Q3.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.
- No se documentan capacidades multilingües ni un conjunto de idiomas soportados.
- No se documenta edición de imágenes, inpainting, outpainting ni control por imagen de referencia.

## Casos de uso

- **Prototipado visual en Mac**: generar bocetos de conceptos con la CLI de MFlux y una semilla fija para comparar variaciones de prompt sin salir de macOS. El tamaño de 5,8 GB facilita tener el modelo residente en equipos de 16 GB o más.
- **Generación offline con privacidad**: crear ilustraciones o material interno sin enviar prompts a servicios externos, usando los pesos descargados localmente y ejecución en MLX.
- **Evaluación de cuantización**: comparar Q3 frente a Q4, Q5, Q8 y BF16 con el mismo prompt y la misma semilla para medir la degradación visual antes de elegir una variante para producción.
- **Assets para blogs y redes**: generar imágenes cuadradas de 768 x 768 para cabeceras, fichas o ilustraciones de artículos, iterando con distintas semillas hasta obtener un resultado aceptable.
- **Docencia y talleres sobre MLX**: demostrar el flujo completo de descarga, cuantización y generación en Apple Silicon con un modelo de huella moderada y una CLI sencilla.
- **Integración en aplicaciones macOS**: invocar `mflux-generate-moss-image` desde scripts o herramientas internas para generar imágenes bajo demanda en un Mac de desarrollo o un equipo de estudio.
- **Pruebas de pipelines antes de escalar**: validar prompts, resoluciones y parámetros con Q3 y, una vez definido el flujo, repetir con Q8 o BF16 si se necesita mayor fidelidad.
- **Generación por lotes en equipos con memoria limitada**: procesar series de prompts en un Mac con memoria unificada ajustada, aceptando la pérdida de calidad de Q3 a cambio de evitar la versión BF16 de 26,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas entre Q3, Q4, Q5, Q8 y BF16. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM/memoria**: los pesos Q3 ocupan 5,8 GB. Se estima un mínimo de 16 GB de memoria unificada para cargar el modelo y generar a 768 x 768 con margen para buffers; 24 GB o más es recomendable para trabajar con comodidad. Esta estimación no está confirmada por el autor.
- **GPU recomendadas**: Apple Silicon con MLX. No se especifican generaciones concretas de M1, M2, M3 o M4; la model card solo indica compatibilidad con Apple Silicon.
- **GPU de consumo**: sí, en equipos Apple Silicon de consumo. No se indica soporte para GPU NVIDIA o CUDA.
- **Despliegue**: `mflux` mediante la CLI `mflux-generate-moss-image`; también es posible descargar los pesos con `hf download` y pasar una ruta local con `--model`.
- **Otras plataformas**: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Al ser pesos MLX, su uso en CUDA requeriría una conversión adicional no incluida en este repositorio.
- **Almacenamiento**: 5,8 GB para los pesos, más espacio temporal para la imagen de salida y la caché de descarga.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Versión | Cuantización | Tamaño del repositorio | Licencia | Notas |
|---|---|---:|---|---|
| `moss-image-sft-mflux-q3` | Q3, MLX affine 3 bits | 5,8 GB | Apache 2.0 | Menor huella de la familia; mayor riesgo de degradación |
| `moss-image-sft-mflux-q4` | Q4 | 7,5 GB | Apache 2.0 | Compromiso entre tamaño y fidelidad |
| `moss-image-sft-mflux-q5` | Q5 | 9,1 GB | Apache 2.0 | Alternativa conservadora para equipos con más memoria |
| `moss-image-sft-mflux-q6` | Q6 | 10,7 GB | Apache 2.0 | Mayor fidelidad que Q5, con más requisitos de memoria |
| `moss-image-sft-mflux-q8` | Q8 | 14,0 GB | Apache 2.0 | Cercano a BF16 en tamaño; requiere equipos de gama alta |
| `moss-image-sft-mflux-bf16` | BF16 | 26,2 GB | Apache 2.0 | Referencia de máxima fidelidad; no cabe en muchos equipos de consumo |
| `OpenMOSS-Team/MOSS-Image-SFT` | Formato original | No disponible | Apache 2.0 | Modelo base; requiere el stack original, no MLX |

No se dispone de datos de benchmarks que permitan comparar la calidad de estas variantes entre sí ni con otros modelos texto-a-imagen. La comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una publicación oficial de OpenMOSS-Team. La model card original debe consultarse para conocer términos y restricciones adicionales.
- La cuantización Q3 puede degradar la fidelidad visual, el detalle fino y el renderizado de texto respecto a Q5, Q8 o BF16. No hay una evaluación publicada que cuantifique esa pérdida.
- Los pesos están en formato MLX y dependen de Apple Silicon. No son directamente utilizables en CUDA, vLLM, llama.cpp, Ollama o TGI sin una conversión adicional.
- No se documentan los idiomas soportados ni el comportamiento con prompts en castellano u otras lenguas. La cobertura lingüística del encoder de texto es desconocida.
- No se documentan sesgos del dataset original. Como en cualquier modelo texto-a-imagen, pueden aparecer sesgos demográficos, culturales y de representación heredados de los datos de entrenamiento.
- Riesgo de artefactos visuales, anatomía incorrecta, texto mal renderizado y resultados que no se correspondan con el prompt, especialmente con cuantización agresiva.
- No hay benchmarks, evaluaciones de seguridad ni métricas de calidad publicadas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la model card del modelo base por si existen restricciones adicionales de uso.
- El repositorio no incluye información sobre el límite de tokens del prompt, el tamaño máximo de imagen ni el consumo exacto de memoria en cada equipo.

## Enlaces

- [HuggingFace: mflux-community/moss-image-sft-mflux-q3](https://huggingface.co/mflux-community/moss-image-sft-mflux-q3)
- [Modelo base: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Repositorio de MFlux en GitHub](https://github.com/filipstrand/mflux)
- [Organización MFlux-Community en HuggingFace](https://huggingface.co/mflux-community)
- [Variante BF16](https://huggingface.co/mflux-community/moss-image-sft-mflux-bf16)
- [Variante Q8](https://huggingface.co/mflux-community/moss-image-sft-mflux-q8)
- [Variante Q6](https://huggingface.co/mflux-community/moss-image-sft-mflux-q6)
- [Variante Q5](https://huggingface.co/mflux-community/moss-image-sft-mflux-q5)
- [Variante Q4](https://huggingface.co/mflux-community/moss-image-sft-mflux-q4)
