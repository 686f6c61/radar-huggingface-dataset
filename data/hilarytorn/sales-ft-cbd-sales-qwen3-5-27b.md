# HilaryTorn/sales-FT-CBD-sales-Qwen3.5-27B

## Resumen

Este modelo es un adaptador de fine-tuning (PEFT) publicado por HilaryTorn, diseñado para especializar el modelo base `togethercomputer/Qwen3.5-27B` en tareas de ventas relacionadas con CBD (cannabidiol). El repositorio contiene únicamente los pesos del adaptador (1.0 GB) y no incluye el modelo base completo. La ficha original del autor está prácticamente vacía, por lo que la información técnica disponible es muy limitada.

La relevancia de este modelo radica en su enfoque de adaptación de bajo coste: en lugar de entrenar un modelo desde cero, se aplica un ajuste fino con PEFT sobre un LLM de 27B parámetros, lo que permite especializarlo en un dominio concreto sin necesidad de recursos masivos. Sin embargo, la ausencia de documentación, métricas y detalles de entrenamiento dificulta su evaluación y uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT sobre `togethercomputer/Qwen3.5-27B`) |
| Parametros totales | no disponible (el modelo base tiene 27B, el adaptador es significativamente menor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del adaptador ni sobre el proceso de entrenamiento. Dado que se trata de un fine-tuning con PEFT sobre un modelo base de 27B, es probable que se haya utilizado una técnica como LoRA o adaptadores similares, pero no hay confirmación. Tampoco se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron métodos de alineación como RLHF o DPO. La única referencia técnica es el tag `arxiv:1910.09700`, que corresponde al artículo sobre cálculo de emisiones de carbono de Lacoste et al., no a detalles del modelo.

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador. Al ser un fine-tuning de un modelo base de 27B, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, etc.), pero como no se conoce el modelo base `togethercomputer/Qwen3.5-27B` (no existe oficialmente en el ecosistema Qwen), no se puede afirmar nada con certeza. No hay evidencia de soporte para tool calling, agentes, visión u otras funciones especiales.

## Casos de uso

Debido a la falta de documentación, los casos de uso son hipotéticos y basados únicamente en el nombre del modelo (`sales-FT-CBD-sales`). Posibles aplicaciones:

- Atención al cliente para tiendas de CBD: el modelo podría generar respuestas a consultas frecuentes sobre productos, dosificación o efectos, aunque no hay garantía de calidad ni de precisión.
- Generación de contenido promocional: podría redactar descripciones de productos o mensajes de marketing, pero sin validación de sesgos o legalidad.
- Asistencia en ventas online: integración en chatbots para guiar al usuario en el proceso de compra, siempre que el modelo base tenga capacidades conversacionales.
- Análisis de opiniones de clientes: resumir reseñas o extraer intenciones de compra, asumiendo que el modelo base maneja comprensión de texto.
- Formación de equipos de venta: generar ejemplos de guiones de venta o respuestas a objeciones, aunque el contenido puede ser inexacto.
- Investigación de mercado: ayudar a redactar encuestas o analizar respuestas, con las mismas limitaciones de fiabilidad.

En todos los casos, se recomienda encarecidamente validar el comportamiento del modelo antes de usarlo en entornos reales, dado que no hay métricas ni evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estándar. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

No hay información oficial sobre requisitos de hardware. Dado que el adaptador se carga sobre un modelo base de 27B parámetros, se puede estimar un consumo de VRAM orientativo para inferencia:

- Para ejecutar el modelo base en FP16 se necesitan aproximadamente 54 GB de VRAM (27B × 2 bytes), lo que requiere GPUs profesionales como A100 (80 GB) o H100.
- Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ), el uso de VRAM se reduce a unos 14-16 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB).
- El adaptador PEFT añade una sobrecarga mínima de memoria (menos de 1 GB).

Opciones de despliegue habituales para modelos de este tamaño: vLLM, llama.cpp, Ollama (si se convierte a GGUF), o TGI. La latencia y el throughput dependerán del hardware y de la optimización elegida; no hay cifras disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `togethercomputer/Qwen3.5-27B` no es un modelo conocido públicamente, y el adaptador carece de documentación. No se puede comparar con otros modelos de ventas o fine-tunings similares sin datos objetivos.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: no se conocen los datos de entrenamiento, el proceso de ajuste ni las métricas de evaluación.
- El modelo base `togethercomputer/Qwen3.5-27B` no es un modelo oficial de la familia Qwen, por lo que su procedencia y calidad son inciertas.
- Riesgo elevado de alucinaciones y respuestas inexactas, especialmente en un dominio sensible como el CBD, donde la información legal y sanitaria debe ser rigurosa.
- Posibles sesgos en el entrenamiento, desconocidos al no haber detalles sobre el dataset.
- La licencia no está especificada, lo que impide conocer si se permite el uso comercial o la redistribución.
- El adaptador tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Para uso en producción, se recomienda realizar una evaluación exhaustiva y considerar alternativas con mejor soporte.

## Enlaces

- [HuggingFace: HilaryTorn/sales-FT-CBD-sales-Qwen3.5-27B](https://huggingface.co/HilaryTorn/sales-FT-CBD-sales-Qwen3.5-27B)
