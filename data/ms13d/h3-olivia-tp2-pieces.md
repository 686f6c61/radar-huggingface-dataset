# ms13d/h3-olivia-tp2-pieces

## Resumen

ms13d/h3-olivia-tp2-pieces es un repositorio de pesos derivados del modelo MiniMax-H3, publicado por el usuario ms13d en Hugging Face. No se trata de un modelo autónomo, sino de una redistribución del checkpoint OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD reorganizada en un formato de "piezas" (pieces) pensado para su uso con la extensión ComfyUI-MultiGPU: 25 piezas por GPU y 50 archivos safetensors en total, donde cada pieza contiene la fracción de una GPU correspondiente a dos bloques principales del transformer.

La relevancia de este repositorio es operativa más que algorítmica: facilita el despliegue del modelo base en configuraciones multi-GPU mediante paralelismo tensorial (tensor parallel, TP=2) y cuantización int8 con grupo de convolución rotada de 256. El autor advierte explícitamente de que no es un checkpoint independiente para ComfyUI o Diffusers, de que las capas no pertenecientes a bloques siguen requiriendo el modelo fuente original y de que la integración con el cargador de piezas y el rendimiento real en GPU no han sido validados.

El tamaño del repositorio es de 19,3 GB y la licencia aplicada es la MiniMax-H3 Community License Agreement. El modelo base emplea la arquitectura MiniMax-H3 en una variante híbrida denominada DMAD-PDMD, si bien la información disponible no detalla los parámetros totales, la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (variante híbrida DMAD-PDMD según el modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 con grupo de convolución rotada de 256 (convrot group 256) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors (50 archivos, 25 piezas por GPU) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo, ya que se limita a una reempaquetación del checkpoint OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD. La arquitectura de origen es MiniMax-H3 en su variante híbrida DMAD-PDMD, si bien la información proporcionada no especifica detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de este repositorio reside en el proceso de exportación: se utilizó el splitter real de H3 redirigido a CPU, cada tensor se releyó bit a bit y ambas mitades de rango (rank halves) se reconstruyeron de forma independiente y se compararon con los 50 bloques fuente. El manifiesto (manifest.json) registra el SHA-256 por archivo, las formas y dtypes exactos de los tensores, los metadatos escalares y las versiones de formato y referencia. Se requiere int8 convrot group 256 y dos rangos; el LoRA está excluido. El commit fuente es 474da26cde0f16eefc4415ca96de95c08e371411 y el SHA-256 del archivo fuente es 5b0fa95c09944191afd863239226683ae352e09104680f43c73ae206d48fe176.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base MiniMax-H3, aunque no se detallan en la información disponible.
- Procesamiento multimodal: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue multi-GPU: el formato de piezas está diseñado para paralelismo tensorial con dos rangos en ComfyUI-MultiGPU.

## Casos de uso

- Despliegue multi-GPU en ComfyUI: el repositorio permite cargar el modelo MiniMax-H3 repartido en dos GPUs mediante 25 piezas por GPU, lo que facilita ejecutar el modelo en entornos con VRAM limitada por dispositivo.
- Investigación sobre paralelismo tensorial: los archivos sirven como referencia para estudiar la distribución de bloques del transformer en dos rangos y validar reconstrucciones bit a bit.
- Pruebas de cuantización int8: el formato emplea int8 convrot group 256, útil para evaluar el impacto de esta cuantización en la calidad y el rendimiento del modelo base.
- Integración con ComfyUI-MultiGPU: el layout está pensado específicamente para el cargador de piezas de esta extensión, aunque el autor advierte de que la integración no ha sido validada.
- Auditoría de pesos: el manifest.json con SHA-256 por archivo y formas exactas de tensores permite verificar la integridad de los pesos en pipelines de producción.
- Desarrollo de herramientas de carga personalizadas: el formato documentado (50 safetensors, dos rangos, capas no pertenecientes a bloques excluidas) sirve de base para implementar cargadores alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 19,3 GB en disco y se reparte en dos rangos, por lo que se requiere al menos una GPU por rango.
- GPU recomendadas: no disponible; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; el consumo real de VRAM en GPU no ha sido validado según la model card.
- Opciones de despliegue: ComfyUI-MultiGPU con el cargador de piezas; el modelo fuente original es necesario para las capas no pertenecientes a bloques.
- Latencia y throughput estimados: no disponible; el autor indica que el rendimiento en GPU no ha sido validado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ms13d/h3-olivia-tp2-pieces | no disponible | no disponible | MiniMax-H3 Community License | safetensors int8, 50 piezas | Hugging Face, 0 descargas |
| OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| MiniMax-H3 (original) | no disponible | no disponible | MiniMax-H3 Community License | no disponible | no disponible |

## Limitaciones y advertencias

- No es un checkpoint independiente: no funciona de forma autónoma en ComfyUI ni en Diffusers; las capas no pertenecientes a bloques requieren el modelo fuente original.
- Integración no validada: el autor advierte de que la integración con el cargador de piezas y el consumo real de VRAM y rendimiento en GPU no han sido comprobados.
- Uso en producción desaconsejado por el autor: "Do not replace your working model with these files yet".
- Requisitos estrictos de formato: exige int8 convrot group 256 y dos rangos; el LoRA está excluido.
- Licencia restrictiva: MiniMax-H3 Community License Agreement, con posibles restricciones para uso comercial que deben revisarse en el archivo LICENSE.
- Sesgos y alucinaciones: no documentados en la información disponible, pero aplicables al modelo base.
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingüe ni ventanas de contexto concretas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ms13d/h3-olivia-tp2-pieces
- Modelo base: https://huggingface.co/OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD
- Commit fuente: 474da26cde0f16eefc4415ca96de95c08e371411
- SHA-256 del archivo fuente: 5b0fa95c09944191afd863239226683ae352e09104680f43c73ae206d48fe176
- Archivos de referencia en el repo: source-model-card.md, LICENSE, NOTICE, manifest.json
