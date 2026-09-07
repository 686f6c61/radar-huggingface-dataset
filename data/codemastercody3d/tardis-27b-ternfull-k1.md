# CodeMasterCody3D/tardis-27b-ternfull-k1

## Resumen

El modelo `CodeMasterCody3D/tardis-27b-ternfull-k1` es un checkpoint publicado en Hugging Face por el usuario CodeMasterCody3D. El nombre del repositorio sugiere un modelo de 27 000 millones de parámetros con cuantización ternaria completa (`ternfull`), y el tamaño del repositorio (5.9 GB) es coherente con pesos ternarios de ese tamaño. El tag `qwen3_5_text` apunta a una posible base en la familia Qwen3.5, aunque no hay documentación oficial que lo confirme.

La model card es extremadamente escueta y describe un formato de checkpoint personalizado denominado "Bare V2 Exact K1 Student". No se trata de un checkpoint estándar de Hugging Face ni de un GGUF, sino que requiere un lector específico (`CompactCheckpoint`/`attn_k2_shadow_recon.MixedCheckpoint` y `attn_k2_codec`). No se dispone de información sobre la licencia, los idiomas soportados, el proceso de entrenamiento ni benchmarks públicos. El modelo no tiene descargas ni "likes", lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5_text` sugiere Qwen3.5, sin confirmacion) |
| Parametros totales | 27B (segun el nombre del repositorio, sin confirmacion oficial) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternario completo (segun el nombre `ternfull` y la model card "exact K1 at group 128") |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint personalizado (requiere `CompactCheckpoint`/`attn_k2_shadow_recon.MixedCheckpoint` y `attn_k2_codec`) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura ni el proceso de entrenamiento. La model card indica que el checkpoint no es un Hugging Face estandar ni un GGUF, y que los tensores en coma flotante de 2 dimensiones y el `lm_head.weight` en FP32 estan en "exact K1 at group 128". Tambien se mencionan "Forge rotation/group/head stamps" en `config.json`, necesarios para un lector de inferencia. Estos terminos sugieren un esquema de cuantizacion ternaria con rotacion por grupos, pero no hay documentacion publica que explique su funcionamiento. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- No se han publicado capacidades especificas en la informacion disponible.
- El tag `qwen3_5_text` sugiere que es un modelo de texto, pero no hay confirmacion de soporte para tool calling, agentes, vision, audio u otras funcionalidades.
- La model card no menciona ninguna capacidad especial mas alla del formato de checkpoint.

## Casos de uso

No se dispone de informacion suficiente para recomendar casos de uso concretos. El modelo parece ser un experimento de cuantizacion ternaria de un modelo de 27B, pero sin documentacion sobre sus capacidades reales no es posible determinar aplicaciones practicas. Cualquier uso en produccion deberia ir precedido de una evaluacion exhaustiva del modelo y de la disponibilidad de un lector de inferencia compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint especifico. Segun un enlace externo sobre un modelo similar ("Taardis 27B Full Ternary"), un modelo de 27B en BF16 requeriria alrededor de 59.40 GB de VRAM; sin embargo, este checkpoint ternario, con un tamano de repositorio de 5.9 GB, podria ser significativamente mas ligero, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- Posible despliegue en GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que no es un checkpoint estandar ni GGUF, por lo que no se puede usar directamente con herramientas como vLLM, llama.cpp u Ollama sin un lector personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo no tiene metricas publicadas ni documentacion oficial que permita contrastarlo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que el uso comercial no esta garantizado.
- El formato de checkpoint es propietario o personalizado y requiere un lector especifico no documentado, lo que dificulta su integracion en herramientas estandar.
- No hay informacion sobre sesgos, riesgos de alucinacion ni limitaciones de idioma.
- El modelo no tiene descargas ni "likes", lo que sugiere que no ha sido validado por la comunidad.
- La ausencia de benchmarks y documentacion tecnica hace que su uso en produccion sea arriesgado.

## Enlaces

- Hugging Face: https://huggingface.co/CodeMasterCody3D/tardis-27b-ternfull-k1
- Repositorio del cuerpo (sin model card): https://huggingface.co/CodeMasterCody3D/tardis-27b-body
- Pagina de requisitos de hardware para un modelo similar: https://llmrun.dev/model/codemastercody3d-taardis-27b-full-ternary
