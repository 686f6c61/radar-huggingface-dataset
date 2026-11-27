# richardyoung/Qwen2.5-32B-Instruct-ARA-heretic

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el ajuste elimina o atenúa los mecanismos de rechazo y alineación de seguridad del modelo original mediante técnicas de manipulación de direcciones de activación, de forma que el modelo responde a peticiones que el modelo base rechazaría. La etiqueta "heretic" y "ARA" (probablemente *Activation Refusal Ablation* o similar) apuntan a este tipo de intervención sobre el espacio de activaciones.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original: un transformer denso de 32.763.876.352 parámetros (unos 32,8 mil millones), con contexto nativo de 32.768 tokens y capacidades de generación de texto, razonamiento, código y matemáticas. El ajuste se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

Es relevante para investigadores que estudian alineación, robustez y mecanismos de rechazo en LLM, así como para desarrolladores que necesitan un modelo sin filtros para entornos controlados. Conviene señalar que el acceso está restringido (gated) y que el uso comercial queda sujeto a la licencia Apache 2.0 del modelo base, aunque la eliminación de salvaguardas plantea riesgos importantes en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-32B-Instruct; no confirmado en la ficha del ajuste) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo contiene safetensors en BF16/FP16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles (segun la ficha); el modelo base soporta multiples idiomas, pero el ajuste declara solo "en" |
| Licencia | Apache 2.0 (etiqueta del repo); el modelo base Qwen2.5-32B-Instruct tambien es Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención completa, RoPE y las mejoras de la familia Qwen2 (RMSNorm, SwiGLU, atención con GQA en algunos tamaños). El ajuste "heretic" no cambia la arquitectura: opera sobre los pesos o las activaciones para eliminar la dirección de rechazo aprendida durante el alineamiento del modelo base. La técnica habitual en este tipo de publicaciones consiste en identificar la dirección de activación asociada a la negativa a responder y restarla o proyectarla fuera de los pesos, sin reentrenamiento supervisado completo.

No se dispone de información sobre el volumen de datos de ajuste, la composición del dataset ni si hubo RLHF o DPO adicional en este repositorio concreto. Las referencias arXiv incluidas (2309.00071, 2407.10671, 2611.17846) apuntan a trabajos sobre evaluación de LLM y técnicas de ablación, pero no se detalla su uso exacto en la ficha. El resultado es un modelo que mantiene las capacidades del base pero con la capa de rechazo suprimida.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento, matemáticas y generación de código propias del modelo base.
- Respuesta a peticiones que el modelo base rechazaría (contenido sensible, instrucciones restringidas), fruto de la ablación.
- Soporte de tool calling y function calling (capacidad del base, no verificada explícitamente en el ajuste).
- Capacidades multilingües del base (Qwen2.5 soporta decenas de idiomas), aunque la ficha del ajuste declara solo inglés.
- Compatibilidad con text-generation-inference y endpoints compatibles.

## Casos de uso

- Investigación en alineación y seguridad: estudiar cómo se codifica el rechazo en las activaciones comparando este modelo con el base, útil para papers sobre mecanismos de negativa.
- Evaluación de robustez de filtros: probar sistemas de moderación externos contra un modelo sin salvaguardas internas para medir su eficacia.
- Red teaming controlado: generar prompts adversarios y respuestas en entornos aislados para auditorías de seguridad.
- Generación creativa sin restricciones: escritura de ficción con temáticas sensibles en un pipeline privado, donde el filtro del modelo base resulta limitante.
- Fine-tuning posterior: servir como base para ajustes específicos de dominio en los que el rechazo del modelo original interfiere con la tarea.
- Despliegue en investigación académica: experimentos de interpretabilidad que requieren respuestas sin sesgo de negativa, con acceso gated que limita la distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 65 GB solo para pesos, más overhead de KV cache; se recomienda 80 GB o más.
- Cuantización a 8 bits: ~33 GB de pesos; cabe en una A100 40 GB o H100 80 GB con margen.
- Cuantización a 4 bits: ~17-18 GB; viable en RTX 4090 (24 GB) y RTX 3090.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; RTX 4090/3090 para cuantización 4-8 bits.
- Despliegue: transformers, text-generation-inference (soportado), vLLM y llama.cpp (si se generan cuantizaciones GGUF, no incluidas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-ARA-heretic | 32,8 B | 32.768 (base) | Apache 2.0 | Ajuste sin rechazo, acceso gated |
| Qwen/Qwen2.5-32B-Instruct | 32,8 B | 32.768 | Apache 2.0 | Modelo base alineado, acceso abierto |
| Otras variantes abliterated de Qwen2.5 | ~7-32 B | 32.768 | Apache 2.0 | Múltiples autores comunitarios; calidad variable |

## Limitaciones y advertencias

- La eliminación de salvaguardas implica riesgo elevado de generar contenido dañino, ilegal o sesgado; no apto para producción sin moderación externa.
- Puede conservar sesgos del modelo base y amplificarlos al no aplicar rechazo.
- Riesgo de alucinación similar al del base, sin mejoras documentadas.
- La ficha declara solo inglés; el multilingüismo del base puede degradarse tras el ajuste.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; la distribución queda limitada.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue sin filtros puede incumplir normativas de contenido en la UE y otras jurisdicciones.
- No hay benchmarks publicados que cuantifiquen la pérdida de capacidades tras la ablación.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper de referencia (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper de referencia (arXiv:2611.17846): https://arxiv.org/abs/2611.17846
