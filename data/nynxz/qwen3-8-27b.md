# nynxz/Qwen3.8-27B

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA en formato ComfyUI para el codificador de texto Qwen3.8-27B. Lo publica el usuario nynxz y su funcion es reexpresar el comportamiento del modelo comunitario AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 como un delta de bajo rango aplicable sobre el checkpoint estandar de Comfy-Org, evitando duplicar un segundo checkpoint de unos 20 GB. El resultado practico es la eliminacion del comportamiento de rechazo (refusal) del codificador original.

El adaptador se obtiene por diferencia de pesos entre dos ficheros cuantizados en W4A8 (el del modelo sin censura de afkaf y el stock de Comfy-Org), dequantizados a fp32 y factorizados con SVD. Solo afecta a 81 matrices del modelo de lenguaje, con un unico componente de rango 1 por matriz cuya forma corresponde a una ablacion direccional. El fichero pesa 5,4 MB y se aplica con fuerza 1.0 en el nodo Load LoRA (Text Encoder) de ComfyUI.

Es relevante para flujos de generacion de imagen y texto en ComfyUI que necesiten un codificador Qwen3.8-27B sin restricciones de rechazo y con un coste de almacenamiento minimo. No es un modelo autonomo: requiere el checkpoint base y no se ha evaluado contra las salidas del modelo sin censura original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre codificador de texto Qwen3.8-27B (transformer; el modelo base incluye torre de vision y cabeza MTP, no modificadas) |
| Parametros totales | no disponible (el adaptador tiene rango 1 sobre 81 matrices; el modelo base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en fp32; checkpoint base de referencia en W4A8 (`qwen3.8_27b_w4a8.safetensors`) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (claves de text encoder genericas de ComfyUI, sin alpha) |

## Arquitectura y entrenamiento

El adaptador no se entrena con datos: se construye por diferencia de pesos entre dos ficheros cuantizados en 4 bits, el del modelo AEON sin censura (cuantizacion W4A8 de afkaf) y el stock de Comfy-Org. Ambos se dequantizan a fp32 con los decodificadores de comfy-kitchen y cada matriz modificada se factoriza con SVD. Al compartir cuantizador, las matrices no afectadas decodifican de forma identica bit a bit, lo que aisla el conjunto cambiado: 81 matrices del modelo de lenguaje, concretamente `mlp.down_proj` en las capas 19-61 y las salidas de atencion `linear_attn.out_proj` / `self_attn.o_proj` en las capas 26-63.

Cada matriz cambiada contiene un unico componente de rango 1, que representa entre el 2 y el 9 % de la norma del peso y queda entre 14 y 39 veces por encima del ruido de cuantizacion. El rango 1 conserva ese componente y descarta el redondeo independiente de los dos ficheros 4 bits (aproximadamente el 7-10 % de la norma de cada peso). El componente retenido tiene la forma de una ablacion direccional, `ΔW ∝ −r rᵀW`, con coseno de 0,991 a 0,999 en cada matriz y una direccion `r` por capa compartida entre las salidas de atencion y MLP. Un segundo componente mas debil, confinado a un unico canal de salida repetido en todas las capas, se descarta por considerarse artefacto de cuantizacion. No se compararon `embed_tokens`, `lm_head`, la torre de vision ni la cabeza MTP; las capas 0 y 63 estan en bf16 en un fichero y en 4 bits en el otro, y salvo `layers.63.self_attn.o_proj` nada supero el ruido de cuantizacion.

## Capacidades

- Modificacion del comportamiento del codificador de texto Qwen3.8-27B: elimina el comportamiento de rechazo (refusal) del checkpoint stock.
- Integracion nativa en ComfyUI mediante los nodos CLIPLoader y Load LoRA (Text Encoder).
- Control de intensidad: fuerza 1.0 aplica la edicion completa; valores menores mezclan progresivamente hacia el comportamiento original.
- Hereda las capacidades del modelo base Qwen3.8-27B (generacion de texto y pipeline image-text-to-text), aunque el adaptador solo altera las 81 matrices indicadas.
- No modifica la torre de vision, `embed_tokens`, `lm_head` ni la cabeza MTP del modelo base.
- Capacidades multilingues: solo ingles declarado en la model card.

## Casos de uso

- Generacion de texto sin rechazos en ComfyUI: aplicar el LoRA con fuerza 1.0 sobre el codificador Qwen3.8-27B permite obtener respuestas sin filtros de refusal en flujos de generacion de texto dentro de ComfyUI, con un coste de 5,4 MB en disco.
- Flujos image-text-to-text en ComfyUI: el pipeline del repositorio es image-text-to-text, de modo que el codificador modificado puede usarse en nodos que combinan imagen y texto sin cambiar el checkpoint base.
- Experimentacion con ablacion direccional: el adaptador sirve como caso de estudio reproducible de edicion de pesos por diferencia de cuantizaciones y SVD de rango 1, util para investigadores que analicen tecnicas de abliteration.
- Ahorro de almacenamiento en despliegues: sustituye un segundo checkpoint de unos 20 GB por un delta de 5,4 MB sobre el fichero stock de Comfy-Org, lo que simplifica la gestion de modelos en instalaciones con espacio limitado.
- Ajuste fino del grado de censura: con fuerzas intermedias entre 0 y 1 se puede calibrar el equilibrio entre comportamiento stock y sin censura sin mantener dos checkpoints.
- Prototipado de pipelines de imagen con prompts sensibles: en entornos de investigacion controlados, permite probar prompts que el codificador stock rechazaria, manteniendo el resto del comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el adaptador no se ha puntuado contra las salidas del modelo sin censura original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del checkpoint base Qwen3.8-27B. El fichero de referencia `qwen3.8_27b_w4a8.safetensors` es una cuantizacion W4A8 de 27B, lo que reduce los requisitos frente a bf16.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el checkpoint base de 27B en W4A8.
- Despliegue: ComfyUI con los nodos CLIPLoader y Load LoRA (Text Encoder); el fichero del codificador se coloca en `models/text_encoders/` y el LoRA en `models/loras/`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nynxz/Qwen3.8-27B (este) | LoRA sobre codificador Qwen3.8-27B | 5,4 MB (adaptador) | no disponible | Apache-2.0 | Hugging Face |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | Checkpoint completo sin censura en bf16 | 27B | no disponible | Apache-2.0 | Hugging Face |
| afkaf/Qwen3.8-27B-uncensored-w4a8-convrot-ComfyUI | Checkpoint sin censura cuantizado W4A8 | 27B | no disponible | Apache-2.0 | Hugging Face |
| Comfy-Org/Qwen3.8-27B | Codificador stock en W4A8 | 27B | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el checkpoint `qwen3.8_27b_w4a8.safetensors` de Comfy-Org en `models/text_encoders/`.
- Al derivarse de ficheros cuantizados, es una estimacion de la edicion en bf16, no una copia exacta; la propia model card lo advierte.
- No se ha evaluado contra las salidas del modelo sin censura original, por lo que no hay garantia de equivalencia funcional.
- Solo se declara soporte de ingles.
- La eliminacion del comportamiento de rechazo puede producir contenido inapropiado o no filtrado; debe evaluarse el uso en produccion y las obligaciones legales aplicables.
- No se modifican `embed_tokens`, `lm_head`, la torre de vision ni la cabeza MTP, de modo que el comportamiento en esas rutas permanece igual que en el modelo stock.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento resultante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/nynxz/Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo sin censura de referencia: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Cuantizacion W4A8 usada para el diff: https://huggingface.co/afkaf/Qwen3.8-27B-uncensored-w4a8-convrot-ComfyUI
- Codificador stock de Comfy-Org: https://huggingface.co/Comfy-Org/Qwen3.8-27B/tree/main/text_encoders
