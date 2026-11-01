# Goghor/Strata-Qwen3.8-Flash-Next-Abliteration

## Resumen

Strata-Qwen3.8-Flash-Next-Abliteration es un artefacto de interpretabilidad publicado por el usuario Goghor: una dirección de rechazo (refusal direction) extraída del modelo Qwen3.8-Flash-Next y empaquetada como vector de control para el motor de inferencia Strata. No es un modelo entrenado desde cero ni un fine-tune convencional, sino un fichero GGUF que contiene 2.560 valores correspondientes al flujo residual del modelo base, que se proyecta en tiempo de inferencia para eliminar el comportamiento de rechazo. El repositorio incluye además parches para vLLM v0.30.0 que aplican la misma proyección en cinco puntos del grafo computacional.

El modelo subyacente, Qwen3.8-Flash-Next, es el transformer de referencia de la familia Qwen 3.8 con 120.320 parámetros totales registrados en los safetensors del repo (dato que probablemente refleje un recuento en miles de millones, no disponible con precisión en la información proporcionada). La dirección de rechazo tiene 2.560 dimensiones, lo que impone que cualquier modelo sobre el que se aplique debe tener un flujo residual de exactamente ese tamaño.

La relevancia de esta ficha es doble: por un lado documenta una técnica de abliteración basada en vectores de control publicada con referencia al paper arXiv:2406.11717; por otro, advierte de que su uso elimina una salvaguarda de seguridad del modelo base. El autor probó la dirección sobre cuantizaciones GGUF del modelo base (unsloth), un finetune (Swift-1.5) y una cuantización GSQ (ISTA-DASLab), lo que indica que el vector es reutilizable dentro de la misma arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8-Flash-Next), con flujo residual de 2.560 dimensiones y 47 capas |
| Parámetros totales | 120.320 (según safetensors del repo; unidad no especificada) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (fichero `orcarouter.gguf`); compatible con cuantizaciones del modelo base y finetunes de la misma arquitectura |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (vector de control); parches de código para vLLM; el modelo base en safetensors/GGUF según el release de origen |

## Arquitectura y entrenamiento

El artefacto no entrena pesos: extrae una dirección de rechazo del modelo Qwen3.8-Flash-Next y la publica como vector de control de 2.560 valores. La dirección se aplica mediante proyección (`--cvec-mode project`) sobre el flujo residual, capa a capa, en el rango de capas 1 a 47 por defecto (el paquete de rechazo propio de Strata para este modelo usa 4 a 44). El fichero GGUF contiene el mismo vector replicado en las 47 capas, por lo que `single:1` produce el mismo resultado que `per-layer`. La escala recomendada es 1.0; valores inferiores producen una proyección parcial y, por tanto, una abliteración incompleta.

Para vLLM, el repositorio incluye dos parches (`git am`) sobre vLLM v0.30.0, commit `ced6857afa0ea7b2e3f0846a62e1394e90f15607`. El primer parche (9.120 B) añade `vllm/models/qwen4_exp/nvidia/abliteration.py` e invoca `abliteration.project_` en cinco puntos: embeddings de token, embeddings MTP, `attn_out`, `mlp_out` y el `value` de PLE tras el split de `kv_proj`. El segundo parche (2.764 B) registra `_abliteration_r` de forma permanente, con ceros cuando el interruptor está apagado, para compartir una única caché de compilación AOT entre los estados ON y OFF. Los parches forman parte de una serie de 106 parches del repositorio de origen y no aplican limpios sobre un árbol vLLM v0.30.0 sin esa serie: `git apply --check` falla en `model.py:554` y `mtp.py:60`, también con `--ignore-whitespace`.

No se documenta en la información disponible el proceso de extracción de la dirección (número de prompts contrastivos, capa de extracción, método de cálculo) más allá de la referencia al paper arXiv:2406.11717 y a la técnica de refusal direction.

## Capacidades

- Eliminación del comportamiento de rechazo del modelo base cuando el vector está activo, de modo que el modelo responde a peticiones que la versión stock declina.
- Compatibilidad con cualquier modelo de la familia Qwen3.8-Flash-Next: base, instruction-tuned, cuantizado y finetunes de la misma arquitectura, siempre que el flujo residual sea de 2.560 dimensiones.
- Interruptor por petición en Strata mediante `"experimental_speed_projection": false` en el objeto `sampling`, que pasa `cvec=0` al motor y descarta la caché de conversación una vez. Apagado, la respuesta es idéntica token a token a la del modelo stock.
- Interruptor global en vLLM mediante la variable de entorno `QWEN38_ABLITERATION`, que acepta un fichero JSON con lista `refusal_direction`, un safetensors con tensor `refusal_direction` o un nombre simple que resuelve a `/opt/qwen38/abliteration/<name>.json`. No existe forma por petición en vLLM.
- Selección de rango de capas en Strata con `--control-vector-layer-range A B`.
- Verificado sobre cuantizaciones GGUF de terceros: unsloth/Qwen3.8-Flash-Next-GGUF, ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF e ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF.
- No se documentan en la información disponible capacidades adicionales del modelo base (tool calling, agentes, visión, audio, modo thinking) más allá de las heredadas del propio Qwen3.8-Flash-Next.

## Casos de uso

- Investigación en interpretabilidad: medir la dirección de rechazo y estudiar cómo se distribuye en las 47 capas del flujo residual, comparando proyecciones parciales (escala < 1.0) con la proyección completa para trazar la geometría interna de la negativa a responder.
- Auditoría de seguridad de modelos: evaluar la robustez del alineamiento de Qwen3.8-Flash-Next frente a ataques de dirección, cuantificando cuántas peticiones declinadas pasan a responderse con el vector activo (el autor reporta 7 rechazos a 0 en ocho prompts suaves).
- Red teaming controlado: generar respuestas del modelo sin salvaguarda en entornos aislados para identificar comportamientos problemáticos antes de desplegar la versión stock, con el interruptor por petición de Strata para alternar entre ambos modos en la misma sesión.
- Estudio de transferencia entre cuantizaciones: aplicar el mismo vector a releases GGUF de distinta procedencia (unsloth, Swift-1.5, GSQ-RCO) y medir si la dirección extraída en precisión completa se preserva tras cuantización, un caso directo para pipelines de evaluación de robustez.
- Desarrollo de mecanismos de control granular: usar los parches de vLLM como base para implementar proyecciones por capa o por punto del grafo (embeddings, `attn_out`, `mlp_out`, PLE) en motores de producción, sirviendo de referencia para construir sistemas de steerability más finos.
- Investigación sobre alineamiento y DPO: comparar la dirección de rechazo extraída del modelo base con la de finetunes como Swift-1.5 para estudiar cómo el entrenamiento preferencial desplaza el vector de negativa en el espacio residual.

## Benchmarks y rendimiento

El autor reporta una medición sobre 2x RTX 3090 con el parche de vLLM: el tiempo del paso de verificación con el interruptor apagado es igual al del interruptor encendido, entre 24,1 y 27,0 ms. Ocho prompts suaves pasaron de 7 rechazos a 0 rechazos. Los datos completos están en `benchmarks/2026-10-02/` del repositorio de origen.

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto ni para el modelo base.

## Requisitos de hardware

- El vector de control en sí ocupa un fichero GGUF de tamaño muy reducido (el repo completo mide 0,0 GB), por lo que su carga no añade requisitos de VRAM significativos.
- El coste real de hardware lo determina el modelo base Qwen3.8-Flash-Next sobre el que se aplica; no se dispone en la información proporcionada de la VRAM estimada por cuantización.
- GPU probadas por el autor: 2x RTX 3090 para el parche de vLLM.
- Despliegue en Strata: requiere colocar `orcarouter.gguf` en `~/Strata-data/abliteration/` y añadir los flags `--control-vector-scaled`, `--cvec-mode project` y `--cvec-dir per-layer` al array `args` de `strata-<model>.json`.
- Despliegue en vLLM: requiere compilar vLLM v0.30.0 desde un árbol con la serie completa de 106 parches del repositorio de origen; los dos parches de abliteración no aplican por separado sobre un árbol stock.
- Latencia: el paso de verificación medido se mantiene en 24,1-27,0 ms con el interruptor ON y OFF, según la medición del autor.
- No se dispone de datos de throughput ni de latencia extremo a extremo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Strata-Qwen3.8-Flash-Next-Abliteration | Vector de control (abliteration) | 2.560 valores; aplicable a modelos de la familia Qwen3.8-Flash-Next | no disponible | qwen-community-license-1.0 | HuggingFace, 33 descargas |
| Qwen/Qwen3.8-Flash-Next | Modelo base | 120.320 (unidad no especificada) | no disponible | qwen-community-license-1.0 | HuggingFace |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | Finetune sin censura | no disponible | no disponible | no disponible | HuggingFace |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF | Finetune cuantizado | no disponible | no disponible | no disponible | HuggingFace |

La comparación directa con otros vectores de abliteración publicados no está disponible en la información proporcionada. La diferencia clave frente a un finetune sin censura como orcarouter es que aquí no se modifican pesos: el comportamiento se alterna en tiempo de inferencia mediante un interruptor, lo que permite recuperar la respuesta stock token a token.

## Limitaciones y advertencias

- Elimina una salvaguarda de seguridad: con el vector activo, el modelo responde a peticiones que la versión stock declina. El autor declara explícitamente que la responsabilidad del contenido generado recae en el usuario.
- Solo funciona con modelos cuyo flujo residual sea de exactamente 2.560 valores; no es portable a arquitecturas con otra dimensión.
- En vLLM el interruptor es global y no tiene forma por petición; para alternar ON/OFF hay que reiniciar el proceso o reconstruir el entorno.
- Los parches de vLLM dependen de una serie de 106 parches del repositorio de origen y fallan sobre un árbol vLLM v0.30.0 limpio en `model.py:554` y `mtp.py:60`.
- En Strata, apagar el vector descarta la caché de conversación una vez, lo que afecta a la latencia de la primera respuesta tras el cambio.
- La licencia qwen-community-license-1.0 impone restricciones de uso comercial que deben revisarse en `LICENSE.md` antes de cualquier despliegue en producción; el artefacto hereda además las condiciones del modelo base.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática específica de este artefacto; deben evaluarse sobre el modelo base subyacente.
- El autor advierte de que la escala 1.0 es la proyección completa; escalas inferiores producen abliteración parcial y resultados intermedios no caracterizados.
- El repositorio tiene 33 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Goghor/Strata-Qwen3.8-Flash-Next-Abliteration
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Finetune sin censura de referencia: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cuantización GGUF del base probada: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Finetune cuantizado probado: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Cuantización GSQ-RCO probada: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Strata: https://github.com/Niko1221/Strata
- Paper de referencia sobre refusal direction: https://arxiv.org/abs/2406.11717
- vLLM v0.30.0 (commit de referencia): https://github.com/vllm-project/vllm
