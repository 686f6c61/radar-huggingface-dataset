# khimaros/LiquidAI-LFM3-Omni-2B-hierophant-LoRA-GGUF

## Resumen

LFM3-Omni-2B hierophant LoRA es un conjunto de adaptadores LoRA en formato GGUF creados por el usuario khimaros sobre el modelo LiquidAI/LFM3-Omni-2B-GGUF de Liquid AI. No se trata de un modelo nuevo con pesos propios completos, sino de archivos pequeños que se cargan junto al modelo base para aplicar una técnica de "abliteration" (eliminación de negativas o refusals), es decir, suprimir los mecanismos internos que hacen que el modelo se niegue a responder ciertas peticiones.

El proyecto destaca por su enfoque riguroso y medible: el autor emplea la herramienta hierophant (de código abierto en GitHub) para calcular la "dirección de negativa" a partir de las diferencias en los residual streams entre prompts dañinos y benignos, y aplica la corrección directamente sobre los pesos dequantizados de cada cuantización concreta. Cada adaptador se valida con métricas objetivas: tasa de refusals en prompts retenidos (de 0,97 a 0,08 con n=300 en la variante Q8_0), divergencia KL frente al modelo base y detección de bucles de repetición.

Es relevante porque demuestra un flujo de trabajo reproducible y auditado para abliteration en cuantizaciones GGUF, con adaptadores específicos por quant (exactos solo para el archivo base del que derivan), algo poco habitual en este tipo de derivados comunitarios. El modelo base es LFM3-Omni-2B de Liquid AI, un modelo pequeño multimodal de la familia LFM (Liquid Foundation Models).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de abliteration sobre LFM3-Omni-2B (arquitectura del base: no disponible en detalle) |
| Parametros totales | 331.776 (solo el adaptador LoRA, según safetensors; el base tiene ~2B de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (definida por el modelo base LiquidAI/LFM3-Omni-2B-GGUF) |
| Tipos de cuantizacion | Adaptadores disponibles para Q8_0 (el adaptador es exacto solo para la quant del base indicada) |
| Idiomas | no disponible (heredados del modelo base) |
| Licencia | lfm1.0 (licencia "other", heredada de Liquid AI) |
| Formato de pesos | GGUF (adaptadores LoRA para llama.cpp) |

## Arquitectura y entrenamiento

No hay entrenamiento tradicional en el sentido de fine-tuning con descenso de gradiente sobre corpus de texto: el adaptador se construye mediante una técnica de edición de pesos. Hierophant ejecuta prompts dañinos y benignos sobre el propio modelo cuantizado y calcula la diferencia de las medias de sus residual streams en el primer token generado; esa diferencia constituye la "dirección de refusal". El adaptador elimina esa dirección de todas las matrices que escriben en el residual stream, computado a partir de los pesos dequantizados de esa quant concreta, de modo que a escala 1 la edición es exacta para ese archivo.

La selección de la capa, la intensidad y opciones adicionales (proteger los componentes principales de los prompts benignos o añadir una segunda dirección residual) se realizó mediante una búsqueda automatizada de 45 recetas, rankeada por tasa de refusals en prompts no usados para el ajuste, con presupuesto fijo de KL. La receta publicada para Q8_0 es L14 a escala 0,99, con refusals de 0,97 a 0,08 (n=300), KL de primer token de 0,049, KL en WikiText de 0,011 y tasa de bucles de 0,20 (n=50).

## Capacidades

- No añade capacidades nuevas: modifica el comportamiento del modelo base suprimiendo sus negativas (refusals).
- El modelo base LFM3-Omni-2B es un modelo multimodal "Omni" de Liquid AI; sus capacidades concretas (texto, visión, audio) no están detalladas en la información disponible.
- Compatible con llama.cpp mediante `--lora-scaled`, con escala ajustable (por ejemplo `:0.8` para acercarse al comportamiento del base, `:0` para desactivarlo).
- Permite cargar el adaptador sin aplicarlo (`--lora-init-without-apply`) y aplicarlo por petición, de modo que un único servidor puede servir ambas variantes.
- El modelo base soporta modo thinking; con thinking activado las respuestas pueden ser muy largas antes de contestar.

## Casos de uso

- Investigación en interpretabilidad y safety: estudiar cómo se codifica la dirección de refusal en modelos cuantizados, con metodología, métricas y herramientas publicadas (hierophant).
- Servidor local con comportamiento configurable: con `llama-server` y `--lora-init-without-apply` se puede alternar entre el modelo con y sin abliteration por petición, útil para comparar respuestas en producción o en pruebas.
- Evaluación de robustez de alineamiento: generar respuestas del modelo base ante prompts adversariales para auditar la eficacia de sus salvaguardas.
- Experimentación con escalado de ediciones: ajustar la escala del LoRA (por ejemplo 0,8) para graduar cuánta abliteration se aplica, útil para investigar el compromiso entre refusal rate y divergencia KL.
- Base para derivados comunitarios: servir como plantilla metodológica para crear adaptadores de abliteration exactos por quant en otros modelos GGUF.
- Uso local en hardware modesto: al ser un modelo de ~2B parámetros con adaptadores de solo 331.776 parámetros, permite experimentar con abliteration en equipos de consumo sin duplicar los pesos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí aporta métricas de validación propias del proceso de abliteration para la variante Q8_0:

| Métrica | Valor |
|---|---|
| Refusals (base -> adaptado, prompts retenidos, n=300) | 0,97 -> 0,08 |
| KL de primer token (escala 0,99) | 0,049 |
| KL en WikiText | 0,011 |
| Tasa de bucles en respuestas completas (n=50) | 0,20 |

## Requisitos de hardware

- VRAM estimada: la del modelo base LFM3-Omni-2B en Q8_0 (aproximadamente 2-3 GB para un modelo de ~2B parámetros) más unos pocos megabytes por el adaptador LoRA (331.776 parámetros); dato exacto no disponible.
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB de VRAM es suficiente; también es viable ejecución en CPU mediante llama.cpp.
- Consumer GPUs: compatible con tarjetas como RTX 3060, RTX 4060 o superiores sin problemas dado el tamaño reducido del base.
- Despliegue: llama.cpp (llama-server con `--lora-scaled`), que es el flujo documentado; Ollama, vLLM y TGI no se mencionan en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|---|
| khimaros/LFM3-Omni-2B-hierophant-LoRA-GGUF | Adaptador LoRA de abliteration | 331.776 (adaptador) | GGUF | lfm1.0 | Edición exacta por quant, métricas de KL y refusals publicadas |
| LiquidAI/LFM3-Omni-2B-GGUF | Modelo base multimodal | ~2B | GGUF | lfm1.0 | Modelo original con salvaguardas de refusal intactas |
| Derivados de abliteration típicos (p. ej. merges completos) | Modelo completo abliterated | Igual al base | GGUF/safetensors | Variable | Suelen duplicar los pesos y no siempre publican métricas de validación |

La ventaja diferencial de este repositorio frente a derivados abliterated habituales es que no duplica los pesos del modelo y aporta validación cuantitativa (refusals held-out, KL, detección de bucles) por cada quant.

## Limitaciones y advertencias

- Cada adaptador es exacto solo para el archivo base del que se derivó: aplicarlo sobre otra quant produce una edición aproximada y sin medir.
- La tasa de bucles medida es del 0,20 (n=50): una parte de las respuestas largas a prompts dañinos repite pasajes, un artefacto que las métricas de KL y respuestas cortas no capturan.
- Con el modo thinking activado, el modelo puede razonar extensamente antes de responder; se recomienda servir con un presupuesto de tokens generoso.
- Eliminar los mecanismos de refusal implica que el modelo responderá a peticiones que el modelo base rechazaría; esto conlleva riesgos éticos y legales significativos y no debe desplegarse en producción sin controles adicionales.
- La licencia lfm1.0 es una licencia "other" de Liquid AI: conviene revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones.
- Repositorio muy reciente con 0 descargas registradas: carece de adopción y revisión comunitaria.
- Riesgo de alucinación: heredado del modelo base; la abliteration no lo reduce y puede aumentar la exposición a contenido dañino generado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/khimaros/LiquidAI-LFM3-Omni-2B-hierophant-LoRA-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Herramienta hierophant (método y herramientas): https://github.com/khimaros/hierophant
- Enlace a la licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
