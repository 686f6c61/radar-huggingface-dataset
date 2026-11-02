# oliver0804/LocateAnything-3B-RK3588

## Resumen

LocateAnything-3B-RK3588 es una conversión comunitaria del modelo de grounding visual nvidia/LocateAnything-3B, adaptada para ejecutarse en la NPU del SoC Rockchip RK3588 mediante el stack RKLLM y RKNN. El modelo original, construido sobre Qwen2.5-3B-Instruct con un encoder de visión MoonViT-SO-400M, resuelve tareas de localización visual: dado un prompt en lenguaje natural y una imagen, devuelve cajas delimitadoras de los objetos que coinciden con la descripción. Esta conversión permite ejecutar dicha capacidad en placas de bajo consumo como la Radxa Rock 5C de 8 GB, sin GPU dedicada.

El repositorio incluye dos artefactos principales: el modelo de lenguaje en formato `.rkllm` (w8a8, 3,76 GB, contexto máximo de 4096 tokens) y el encoder de visión en formato `.rknn` (fp16, 0,92 GB, entrada fija de 448x448). La conversión es no oficial y no está respaldada por NVIDIA, Alibaba Cloud ni Rockchip. Está pensada exclusivamente para investigación y evaluación no comercial, bajo la NVIDIA License y con pesos derivados de Qwen2.5-3B-Instruct sujetos a la Qwen Research License.

Su relevancia radica en demostrar que un VLM de grounding de 3B parámetros puede desplegarse en hardware embebido con NPU, a costa de una pérdida medible de precisión (F1@0.5 de 0,606 frente a 0,774 del original en GPU), un contexto recortado y una entrada de imagen fija.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: LLM Qwen2.5-3B (vocabulario extendido a 152.681 tokens) + encoder MoonViT-SO-400M + patch merger + proyector mlp1 |
| Parámetros totales | 3B (modelo base LocateAnything-3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (runtime RKLLM 1.3.0) |
| Tipos de cuantización | LLM: w8a8 (3 núcleos NPU); visión: fp16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (modelo base); Qwen Research License para los pesos Qwen2.5-3B; uso no comercial |
| Formato de pesos | `.rkllm` (LLM) y `.rknn` (visión) |
| Tamaño del repositorio | 4,7 GB |
| Entrada de imagen | fija 448x448 (256 tokens de imagen) |
| Salida de visión | 256 x 2048 |
| Toolkit de conversión | RKLLM 1.3.0 y RKNN-Toolkit2 2.5.0 |
| Hardware objetivo | Rockchip RK3588 (probado en Radxa Rock 5C, 8 GB) |

## Arquitectura y entrenamiento

El modelo base LocateAnything-3B combina un transformer de lenguaje Qwen2.5-3B-Instruct con un encoder visual MoonViT-SO-400M seguido de un patch merger y un proyector `mlp1` que alinea las representaciones visuales con el espacio del LLM. La innovación principal del original es el Parallel Box Decoding (PBD): las cajas se predicen mediante una ventana de 6 tokens (último token más 5 `<text_mask>`) que emplea atención bidireccional dentro de la ventana, lo que permite emitir coordenadas de forma más eficiente que la decodificación autoregresiva token a token. Las coordenadas se normalizan al rango 0-1000 y se serializan como `<box><x1><y1><x2><y2></box>`.

La conversión a RK3588 introduce varias modificaciones técnicas relevantes. RKLLM no admite máscaras de atención personalizadas, por lo que la ventana PBD se evalúa con máscara causal en lugar de bidireccional, lo que constituye una aproximación al comportamiento original. La imagen se aplasta a 448x448 fijos, perdiendo la resolución dinámica del original (que soporta hasta ~25.000 parches). El LLM se cuantiza a w8a8 mientras que el encoder visual se mantiene en fp16. La lógica híbrida MTP/AR (`handle_pattern`, `decode_bbox_avg`, `decode_ref`) se ha porteado a numpy desde el código de NVIDIA. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Localización visual (visual grounding): devuelve cajas delimitadoras de objetos descritos en lenguaje natural mediante el prompt `Locate all the instances that matches the following description: <categoría>.`
- Pointing: localiza un objeto concreto a partir de una frase mediante el prompt `Point to: <frase>.`
- Detección de objetos guiada por texto: múltiples instancias por imagen (evaluado con 1-8 instancias).
- Generación de texto e image-text-to-text: pipeline declarado en HuggingFace.
- Coordenadas normalizadas 0-1000, lo que permite remapear las cajas a la resolución original de la imagen.
- Decodificación por muestreo (temperature 0.7, top_p 0.9, repetition_penalty 1.1); la decodificación greedy no termina correctamente según las pruebas del autor.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni audio en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Detección de objetos en el borde (edge): desplegar el modelo en una placa RK3588 para localizar objetos en tiempo casi real (mediana de 4,90 s por imagen) en entornos sin GPU, como inspección visual en fábrica o agricultura de precisión.
- Robótica de bajo consumo: integración en robots o drones con RK3588 para localizar objetos descritos por un operador humano mediante lenguaje natural, aprovechando el grounding guiado por texto.
- Análisis de vídeo por muestreo: procesar fotogramas clave de un flujo de vídeo en la NPU para etiquetar la presencia y posición de categorías concretas (personas, vehículos, herramientas) en sistemas de vigilancia embebidos.
- Asistencia a personas con discapacidad visual: localizar objetos solicitados verbalmente (`Point to: <frase>`) en un dispositivo portátil basado en RK3588, con la limitación de los 448x448 fijos para objetos pequeños.
- Anotación semiautomática de datasets: preetiquetar cajas en imágenes para acelerar el etiquetado humano, aceptando el coste de precisión (F1@0.5 de 0,606) como paso inicial revisable.
- Prototipado e investigación en VLMs embebidos: banco de pruebas para estudiar el impacto de la cuantización w8a8, la ventana causal y la resolución fija en tareas de grounding, comparando contra el original en GPU.
- Kioscos o terminales interactivos: reconocimiento de objetos en cámaras integradas de dispositivos con RK3588 para experiencias de realidad aumentada o información contextual.

## Benchmarks y rendimiento

Evaluación sobre 100 imágenes de COCO val2017 (semilla 0, una consulta por imagen, 1-8 instancias, cajas ≥32x32 px, regiones crowd excluidas). Prompt: `Locate all the instances that matches the following description: <categoría>.` F1 de cajas a IoU 0.5 con emparejamiento greedy en orden de salida, micro-promediado, más IoU medio de cajas emparejadas. Muestreo: temperature 0.7, top_p 0.9, repetition_penalty 1.1.

| Configuración | Precisión | Recall | F1@0.5 | F1@0.75 | mIoU (emparejadas) | s/imagen |
|---|---|---|---|---|---|---|
| Original, GPU bf16, ventana bidireccional, 448x448 | 0,842 | 0,716 | 0,774 | 0,660 | 0,874 | 0,14 |
| Original, GPU bf16, ventana causal, 448x448 | 0,760 | 0,716 | 0,738 | 0,624 | 0,871 | 0,14 |
| Original, GPU bf16, bidireccional, resolución nativa | 0,747 | 0,712 | 0,729 | 0,645 | 0,885 | 0,19 |
| Esta conversión, Rock 5C (RK3588) | 0,710 | 0,529 | 0,606 | 0,408 | 0,795 | 5,8 |

La conversión alcanza aproximadamente el 78 % del F1 del original (0,606 frente a 0,774). Alrededor de 4 puntos de F1 se atribuyen a la ventana causal; el resto a la cuantización, al encoder visual fp16 y a otras diferencias numéricas no separadas. Con n=100 y una sola semilla, diferencias de pocos puntos quedan dentro del ruido. El tiempo por imagen en Rock 5C (media 5,78 s, mediana 4,90 s) se desglosa en carga de imagen más codificación RKNN de visión (~2,67 s, casi constante) y RKLLM (~2,92 s).

## Requisitos de hardware

- RAM/VRAM estimada: ~4,7 GB en total (3,8 GB del LLM `.rkllm` más 0,9 GB del modelo de visión `.rknn`); es necesario detener otros servicios de NPU antes de ejecutar.
- Hardware objetivo: SoC Rockchip RK3588 con driver RKNPU; probado en Radxa Rock 5C de 8 GB.
- No está pensado para GPU convencional: los artefactos `.rkllm` y `.rknn` solo se ejecutan en la NPU del RK3588. Para GPU (A100, H100, RTX 4090) debe usarse el modelo original nvidia/LocateAnything-3B en bf16.
- Software requerido: `librkllmrt.so` versión 1.3.0 en `/usr/lib`, `rknn-toolkit-lite2` 2.5.0, `numpy`, `Pillow` y `tokenizers`.
- Despliegue: motor propio `rk3588/locate3b.py` con binding ctypes `rkllm_binding.py`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: media de 5,78 s por imagen y mediana de 4,90 s en Rock 5C, con ~2,67 s de codificación visual y ~2,92 s de generación de lenguaje.
- Throughput: no disponible más allá del tiempo por imagen medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada de imagen | F1@0.5 (COCO, subset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LocateAnything-3B (original, GPU bf16) | 3B | no disponible | dinámica hasta ~25k parches | 0,774 (bidireccional, 448x448) | NVIDIA License | HuggingFace (nvidia/LocateAnything-3B) |
| LocateAnything-3B-RK3588 (esta conversión) | 3B | 4096 tokens | fija 448x448 | 0,606 | NVIDIA License + Qwen Research License, no comercial | HuggingFace (oliver0804/LocateAnything-3B-RK3588) |
| RKNNAI/RK182X-VLM-LocateAnything-3B | 3B | no disponible | no disponible | no disponible | no disponible | HuggingFace; objetivo RK1828/RK182X, no RK3588 |

No se dispone de datos de benchmarks de otras alternativas de grounding de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión respecto al original: F1@0.5 de 0,606 frente a 0,774 (~78 % del rendimiento), con recall notablemente inferior (0,529 frente a 0,716).
- Ventana causal en lugar de bidireccional en el Parallel Box Decoding: aproximación forzada por las limitaciones de máscara de atención de RKLLM, que cuesta unos 4 puntos de F1.
- Entrada de imagen fija a 448x448: las imágenes se aplastan, por lo que los objetos pequeños sufren; el original soporta resolución dinámica.
- Contexto limitado a 4096 tokens, muy inferior al del modelo original.
- Cuantización w8a8 del LLM y encoder visual en fp16 en NPU, con diferencias numéricas no separadas del resto de efectos.
- La decodificación greedy casi nunca termina y sigue emitiendo cajas (F1 0,38-0,46 en el mismo subset en GPU); debe usarse muestreo con temperature 0.7, top_p 0.9 y repetition_penalty 1.1.
- El motor añade `<|im_end|>` cuando se detiene por caja duplicada (IoU > 0.85), por lo que la terminación observada en placa no garantiza que el modelo pare por sí solo; el autor no registró el motivo de parada.
- Evaluación con n=100 y una sola semilla: diferencias de pocos puntos están dentro del ruido.
- Licencia restrictiva: solo investigación y evaluación no comercial; derivado de NVIDIA License y con pesos Qwen2.5-3B bajo Qwen Research License. No apto para uso comercial.
- Conversión no oficial, no respaldada por NVIDIA, Alibaba Cloud ni Rockchip.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base.
- Idiomas soportados no disponibles.
- No confundir con el repositorio `RKNNAI/RK182X-VLM-LocateAnything-3B`, que apunta al coprocesador RK1828/RK182X y no es compatible con RK3588.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oliver0804/LocateAnything-3B-RK3588
- Modelo base: https://huggingface.co/nvidia/LocateAnything-3B
- Repositorio alternativo para RK1828/RK182X (no compatible): https://huggingface.co/RKNNAI/RK182X-VLM-LocateAnything-3B
- Licencia NVIDIA: archivo `LICENSE` en el repositorio
- Licencia Qwen Research: archivo `LICENSE-Qwen` en el repositorio
- Aviso legal: archivo `NOTICE` en el repositorio
- Sumas de verificación: archivo `SHA256SUMS` en el repositorio
