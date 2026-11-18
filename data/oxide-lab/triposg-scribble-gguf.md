# oxide-lab/TripoSG-scribble-GGUF

## Resumen

TripoSG-scribble es un modelo de generación de mallas 3D a partir de un boceto (scribble) y un prompt textual, desarrollado originalmente por VAST-AI. Esta ficha cubre la versión empaquetada en GGUF por oxide-lab bajo la herramienta Lux3D, que convierte el checkpoint original en un paquete autónomo listo para inferencia sin necesidad de descargar el checkpoint base ni ficheros safetensors separados. El modelo combina un codificador de imagen DINOv2-large, un transformer DiT con rectified flow y atención cruzada dual, un decodificador VAE basado en SDF y un codificador de texto CLIP.

El paquete tiene 2.352.592.577 parámetros totales y se distribuye en cuatro cuantizaciones (Q8_0, Q6_K, Q5_K y Q4_K), con solo las matrices lineales del DiT cuantizadas y el resto de componentes en F16. El objetivo es facilitar el despliegue local del pipeline image-to-3D con un único fichero de entre 2,1 y 2,9 GiB, frente a los 4,38 GiB del checkpoint F16 original.

Es relevante para desarrolladores que necesitan generar geometría 3D texturizada a partir de bocetos en entornos con recursos limitados, aunque el autor advierte que el DiT destilado por CFG es especialmente sensible a la cuantización y solo Q8_0 mantiene calidad de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con rectified flow y atención cruzada dual, codificador de imagen DINOv2-large, decodificador VAE SDF, codificador de texto CLIP |
| Parametros totales | 2.352.592.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por imagen y prompt, 512 tokens en la evaluación) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K, Q4_K (solo DiT; resto en F16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos sujetos a la licencia upstream de los componentes CLIP, DINOv2 y VAE) |
| Formato de pesos | GGUF (paquete autónomo con 1.735 tensores) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline image-to-3D compuesto por cuatro bloques: un codificador de imagen DINOv2-large que procesa el boceto, un transformer DiT con rectified flow y atención cruzada dual que genera la representación latente, un decodificador VAE basado en SDF que produce la malla y un codificador de texto CLIP que condiciona la generación mediante el prompt. La variante scribble está destilada por CFG (classifier-free guidance), lo que reduce el número de pasos de inferencia necesarios.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El empaquetado GGUF de oxide-lab cuantiza únicamente las matrices lineales de rango 2 del DiT (308 matrices en Q8_0, 307 en las variantes K por bloques de 256), manteniendo en F16 las normas, sesgos, embeddings, convoluciones y filas no divisibles por el bloque de cuantización. El paquete embebe todas las configuraciones de componentes, los valores por defecto del pipeline y el tokenizador CLIP en los metadatos `lux3d.resolved_config`.

## Capacidades

- Generación de mallas 3D a partir de un boceto (scribble) y un prompt textual.
- Generación image-to-3D y text-to-3D según las etiquetas del repositorio.
- Salida en formatos `.glb` (principal), `.obj`, `.ply` y `.stl`.
- Control del número de pasos de inferencia (16 en la evaluación de referencia).
- Parámetros de profundidad densa/jerárquica (8 en la configuración evaluada).
- Semilla configurable para reproducibilidad.
- No se documentan capacidades de tool calling, agentes, visión general ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado rápido de assets 3D: un diseñador dibuja un boceto y obtiene una malla en formato `.glb` lista para importar en Blender o un motor de juego, con un único fichero GGUF de 2,9 GiB.
- Iteración de conceptos en pipelines de preproducción: el prompt textual y la semilla permiten regenerar variantes de una misma idea sin cambiar el boceto de entrada.
- Generación de geometría en estaciones de trabajo con GPU de consumo: la versión Q8_0 (2,916 GiB) cabe en GPUs con 8-12 GB de VRAM, frente a los 4,38 GiB del checkpoint F16.
- Integración en herramientas de modelado asistido: la salida en `.obj` y `.stl` facilita el flujo hacia software CAD o impresión 3D.
- Entornos con conectividad limitada o despliegues offline: el paquete autónomo elimina la dependencia de descargar el checkpoint base y los shards safetensors por separado.
- Evaluación comparativa de cuantizaciones: las variantes Q6_K, Q5_K y Q4_K permiten medir el compromiso entre tamaño y fidelidad geométrica (F@1% de 0,812, 0,857 y 0,742 respectivamente frente a 0,907 de Q8_0).
- Generación de variantes con cuantización opcional del VAE: el autor documenta una build Q8_0 del decodificador VAE que reduce el paquete a 2,70 GiB con CD rel de 0,006 % y voxel IoU de 0,991.

## Benchmarks y rendimiento

Los datos publicados miden la deriva (drift) frente a la referencia float del checkpoint original, no la precisión contra ground-truth. Entrada: `cat_with_wings.png`, prompt "a cat with wings", 16 pasos, 512 tokens, profundidad 8, semilla 42. La malla de referencia tiene 80.109 vértices y 159.976 caras.

| Variante | CD rel | F@0.5% | F@1% | Voxel IoU | Normal | Vértices | Caras | Drift máx. | Drift medio |
|---|---|---|---|---|---|---|---|---|---|
| Q8_0 | 0,461 % | 0,626 | 0,907 | 0,268 | 0,925 | 82.145 | 164.044 | 0,0669 | 0,0131 |
| Q6_K | 0,603 % | 0,515 | 0,812 | 0,204 | 0,908 | 84.865 | 169.440 | 0,1043 | 0,0171 |
| Q5_K | 0,557 % | 0,523 | 0,857 | 0,203 | 0,920 | 76.732 | 153.204 | 0,0654 | 0,0158 |
| Q4_K | 0,744 % | 0,444 | 0,742 | 0,167 | 0,893 | 83.340 | 166.368 | 0,1421 | 0,0211 |

El autor indica que solo Q8_0 mantiene F@1% por encima de 0,90 y que todas las variantes K alteran sustancialmente la topología de la superficie. No se han publicado comparaciones con otros modelos de generación 3D en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete Q8_0 ocupa 2,916 GiB en disco y el checkpoint F16 original 4,38 GiB, por lo que se requiere al menos esa cantidad de memoria más el espacio de activaciones.
- GPU recomendadas: no especificadas en la información disponible; el autor usa backend CUDA en la evaluación.
- GPU de consumo: no se confirma compatibilidad con modelos concretos; el tamaño del paquete Q8_0 (2,916 GiB) sugiere que puede caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: `lux3d-cli` (comando `run triposg --mode scribble`), con soporte de backend CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TripoSG-scribble (GGUF, oxide-lab) | 2.352.592.577 | no disponible | Q8_0, Q6_K, Q5_K, Q4_K | MIT | Hugging Face, Lux3D |
| TripoSG (imagen) | no disponible | no disponible | no disponible | no disponible | Hugging Face (VAST-AI) |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el DiT destilado por CFG es más sensible que el modelo TripoSG de imagen; Q6_K, Q5_K y Q4_K alteran sustancialmente la topología de la superficie y solo Q8_0 se recomienda para producción.
- Q5_K y Q4_K están marcadas por el autor como "preview-grade".
- Riesgo de alucinación geométrica: no se documenta una evaluación contra ground-truth, solo deriva frente a la referencia float.
- Idiomas soportados: no disponibles; el prompt pasa por un codificador CLIP, lo que puede limitar el rendimiento en idiomas distintos del inglés.
- Licencia: el paquete es MIT, pero los pesos de los componentes CLIP, DINOv2 y VAE mantienen sus términos upstream, que deben revisarse para uso comercial.
- La cuantización opcional de DINOv2 y CLIP introduce deriva medible en el condicionamiento (CD rel 0,18 % y 0,16 %, F@1% 0,94 y 0,96), por lo que no se usa en los ficheros por defecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- [Hugging Face: oxide-lab/TripoSG-scribble-GGUF](https://huggingface.co/oxide-lab/TripoSG-scribble-GGUF)
- [Modelo base: VAST-AI/TripoSG-scribble](https://huggingface.co/VAST-AI/TripoSG-scribble)
- [Repositorio Lux3D](https://github.com/oxide-lab/Lux3d)
- [checksums.json](https://huggingface.co/oxide-lab/TripoSG-scribble-GGUF/blob/main/checksums.json)
- [LICENSE](https://huggingface.co/oxide-lab/TripoSG-scribble-GGUF/blob/main/LICENSE)
