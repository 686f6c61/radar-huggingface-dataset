# Fendercorp/MocapAnything-MLX

## Resumen

MocapAnything-MLX es un paquete de pesos en formato MLX del modelo MoCapAnything V2 (`video2pose2rot`), preparado por Fendercorp para su uso nativo en Apple Silicon dentro de 3Dify Studio. No es un modelo de lenguaje: es un sistema de captura de movimiento monocular que, a partir de un video y un esqueleto objetivo, produce rotaciones por articulación sobre dicho esqueleto. El paquete elimina la dependencia de Python en tiempo de ejecución, lo que permite integrarlo directamente en aplicaciones Swift sobre macOS e iOS.

El modelo combina tres componentes: un codificador de imagen DINOv2 ViT-L/14 con la tabla posicional preinterpolada a 224 px (257 tokens), un codificador T5-base que genera embeddings de nombres de articulaciones y una cabeza `video2pose2rot` de 38,5 millones de parámetros en F32 que realiza la conversión de video a pose y de pose a rotaciones. El repositorio ocupa 1,0 GB en total y se distribuye en safetensors.

Su relevancia actual radica en que traslada un pipeline de mocap basado en aprendizaje profundo al ecosistema MLX, con verificación numérica frente a la referencia de PyTorch: los embeddings de T5 coinciden con los vectores de `species_info_dict` (coseno mínimo 1,0000), las características de DINOv2 coinciden con `transformers` sobre los mismos píxeles (coseno mínimo por token 0,9999) y en la secuencia Jaguar-Run se obtiene un MPJPE de 0,058 en unidades normalizadas frente a 0,50 de mantener la pose de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: DINOv2 ViT-L/14 (codificador de imagen) + T5-base encoder (embeddings de nombres de articulaciones) + cabeza `video2pose2rot` |
| Parámetros totales | 38,5 M en la cabeza `mocap` (F32); DINOv2-large y T5-base encoder se incluyen como componentes congelados |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión y movimiento, no de texto) |
| Tipos de cuantización | F32 en la cabeza `mocap`, F16 en DINOv2 y T5 encoder; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (los nombres de articulaciones se codifican vía T5, sin lista de idiomas publicada) |
| Licencia | MIT (código y pesos de MoCapAnything V2); DINOv2 y T5 bajo Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `vocab.json` para el tokenizador SentencePiece |

## Arquitectura y entrenamiento

El sistema sigue un diseño en dos etapas encadenadas: `video2pose` estima la pose a partir del video monocular y `pose2rot` la convierte en rotaciones por articulación sobre el esqueleto objetivo. La entrada visual se procesa con DINOv2 ViT-L/14, cuyo `position_embeddings` se ha sustituido por la salida de `interpolate_pos_encoding(·, 224, 224)` de Hugging Face y al que se ha eliminado el `mask_token`, fijando así la resolución de entrada a 224 px y 257 tokens. La identidad de cada articulación se aporta mediante embeddings de su nombre generados por el codificador de T5-base, lo que permite generalizar a esqueletos con distintas convenciones de nombres.

La cabeza `mocap` corresponde al state dict `video2pos2rot_epoch60.pt` convertido a safetensors sin renombrar claves, lo que indica un entrenamiento de 60 épocas según la nomenclatura del checkpoint. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de este tipo). La innovación principal del paquete es de ingeniería de despliegue: el repackaging a MLX con verificación numérica frente a la referencia, que habilita inferencia sin Python en Apple Silicon.

## Capacidades

- Captura de movimiento monocular a partir de video: estima pose 3D y la convierte en rotaciones por articulación.
- Retargeting a un esqueleto objetivo arbitrario, guiado por los nombres de las articulaciones codificados con T5.
- Generalización entre esqueletos con distintas convenciones de nombres de joints, gracias a los embeddings semánticos de T5.
- Inferencia nativa en MLX sobre Apple Silicon, sin dependencia de Python en tiempo de ejecución.
- Integración en aplicaciones Swift (macOS/iOS) a través de la ruta nativa de 3Dify Studio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un modelo de visión y movimiento.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Animación de personajes en pipelines de producción: dado un video de referencia y el esqueleto del rig del personaje, el modelo genera rotaciones por articulación listas para aplicar en el motor de animación, evitando el coste de una sesión de mocap tradicional.
- Herramientas de creación en macOS/iOS: al ejecutarse de forma nativa en MLX sin Python, puede embeberse en una app Swift de escritorio o móvil para capturar movimiento desde la cámara del dispositivo.
- Retargeting entre bibliotecas de esqueletos: los embeddings de nombres de articulaciones de T5 permiten mapear un mismo movimiento a rigs con nomenclaturas distintas sin reentrenar.
- Previsualización rápida de animaciones en estudio: con una cabeza de solo 38,5 M de parámetros y componentes en F16, el coste de inferencia es bajo y permite iterar sobre tomas de referencia antes de un pase final.
- Investigación en visión por computador: sirve como referencia reproducible en MLX de un pipeline `video2pose2rot`, con métricas de fidelidad numérica publicadas frente a la implementación de PyTorch.
- Prototipado de captura de movimiento sin hardware dedicado: sustituye trajes de mocap en fases tempranas de desarrollo de videojuegos o experiencias de realidad aumentada.
- Docencia y demos técnicas: el tamaño reducido del repositorio (1,0 GB) y la licencia MIT facilitan su uso en entornos académicos y talleres.

## Benchmarks y rendimiento

| Prueba | Métrica | Resultado |
|---|---|---|
| T5 joint-name embeddings vs `species_info_dict` | Coseno mínimo | 1,0000 |
| DINOv2 features vs HF `transformers` (mismos píxeles) | Coseno mínimo por token | 0,9999 |
| Secuencia Jaguar-Run (y0 referencia, y60 entrada) | MPJPE en unidades normalizadas | 0,058 |
| Línea base: mantener la pose de referencia | MPJPE en unidades normalizadas | 0,50 |

No se han publicado resultados de benchmarks estándar de mocap (MPJPE sobre Human3.6M, MPI-INF-3DHP u otros) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio completo pesa 1,0 GB; en inferencia, DINOv2-large en F16 (607 MB) y T5 encoder en F16 (219 MB) dominan el consumo, más la cabeza de 154 MB en F32.
- GPU recomendadas: Apple Silicon con MLX (series M1, M2, M3 y M4); el paquete está diseñado específicamente para esta plataforma.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip Apple Silicon y memoria unificada suficiente para cargar ~1 GB de pesos más activaciones.
- Opciones de despliegue: MLX nativo (ruta de 3Dify Studio), con integración en Swift; no se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MocapAnything-MLX (este) | Mocap monocular + retargeting | 38,5 M (cabeza) + DINOv2-L + T5-base | MIT (componentes Apache-2.0) | safetensors MLX | Hugging Face |
| MoCapAnything V2 (kehong) | Mocap monocular + retargeting | No disponible | MIT | PyTorch (checkpoint original) | Hugging Face |
| DINOv2-large (facebook) | Codificador de imagen | No disponible en la ficha | Apache-2.0 | safetensors | Hugging Face |
| T5-base (google-t5) | Codificador texto | No disponible en la ficha | Apache-2.0 | safetensors | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros sistemas de mocap monocular en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en mocap: no es un modelo de lenguaje ni sirve para tareas de texto, razonamiento o código.
- La resolución de entrada de DINOv2 está fijada a 224 px (257 tokens) por la interpolación previa de la tabla posicional; no admite otras resoluciones sin reinterpolar.
- El rendimiento depende de la calidad del video de entrada y de la correspondencia entre los nombres de articulaciones del esqueleto objetivo y los embeddings de T5.
- Solo se ha verificado numéricamente una secuencia (Jaguar-Run); no hay validación publicada sobre un conjunto amplio de esqueletos o videos.
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios fuera de distribución.
- Licencia MIT para el código y pesos de MoCapAnything V2, pero los componentes DINOv2 y T5 están bajo Apache-2.0: conviene revisar el cumplimiento de ambas al redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se documentan requisitos de memoria pico ni latencias, lo que dificulta planificar despliegues con restricciones de tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/Fendercorp/MocapAnything-MLX
- Pesos originales MoCapAnything V2: https://huggingface.co/kehong/MoCapAnythingV2-weights
- Repositorio MoCapAnything: https://github.com/phongdaot/MocapAnything
- DINOv2-large: https://huggingface.co/facebook/dinov2-large
- T5-base: https://huggingface.co/google-t5/t5-base
