# rbrasga/Godoter3.8-27B-GGUF

## Resumen

Godoter3.8-27B es un ajuste fino del modelo Qwen3.8-27B publicado por rbrasga, distribuido en formato GGUF para llama.cpp y acompañado de un proyector multimodal mmproj que habilita la entrada de imágenes. El modelo parte de 27.000 millones de parámetros y se ha entrenado con QLoRA sobre 24.631 pares instrucción/respuesta anclados a la documentación oficial de Godot Engine 4.x, con el objetivo de responder preguntas sobre APIs, nodos y flujos de trabajo del motor. La model card indica que conserva las capacidades generales del modelo base y que no se han ejecutado benchmarks.

Su relevancia es práctica: ofrece un asistente local especializado en Godot que puede ejecutarse con llama-server o llama-cli, con cuantizaciones Q4_K_M (~16,8 GB) y Q8_0 (~29,0 GB) y una configuración de ejemplo de 32.768 tokens de contexto. Al ser un modelo de imagen-texto, puede recibir capturas del editor o diagramas de escenas, siempre que se cargue el mmproj junto con los pesos principales. La licencia Apache 2.0 facilita su integración en flujos de desarrollo y documentación, aunque la ausencia de benchmarks y de datos sobre idiomas limita la evaluación comparativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; se hereda del modelo base Qwen/Qwen3.8-27B. La model card no detalla si es transformer denso, MoE u otra. |
| Parámetros totales | 27B (según denominación del modelo y modelo base). |
