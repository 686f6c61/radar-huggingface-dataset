# Hefen2959512/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF

## Resumen
Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF es una cuantización GGUF de 27B publicada por el usuario Hefen2959512 a partir de pesos BF16 editados con la técnica ZeroFuse (ablación direccional) sobre el modelo Qwen/Qwen3.8-27B. El resultado es un modelo multimodal (image-text-to-text) "sin rechazo" (ZeroRefusal/uncensored) que conserva la capa nativa MTP (Multi-Token Prediction / NextN) del modelo original, por lo que no necesita un modelo borrador externo para decodificación especulativa.

La pieza central del repo es un único GGUF de 14.252.845.056 bytes cuantizado en IQ4_XS (4,25 bpw) siguiendo el mapa de tensores y la importance matrix del release Unsloth Dynamic V3 UD-IQ4_XS, más un proyector de visión F16 (mmproj) de 927.607.008 bytes. El autor lo valida explícitamente en una RTX 5060 Ti de 16 GB con contexto de producción de 73.728 tokens (frente a los 262.144 originales) y MTP activado.

Su relevancia es doble: por un lado, demuestra que un modelo de ~27B con visión y contexto largo puede servirse en una GPU consumer de 16 GB con solo ~138 MiB de VRAM libre; por otro, documenta un procedimiento de ablación reproducible (ZeroFuse v0.1.0) con métricas de divergencia KL y un test de rechazo de 64 prompts. Es un release independiente de la comunidad, no oficial de Qwen, Unsloth ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, arquitectura declarada en GGUF como `qwen35`; 65 bloques, 866 tensores |
| Parametros totales | 27B según denominación del modelo y tamaño del GGUF (~26,8B a 4,25 bpw); el campo de parametros del repo indica 460.730.096, dato inconsistente con el nombre |
| Parametros activos | No aplica (no es MoE); sí incorpora 15 tensores MTP bajo `blk.64.*` |
| Longitud de contexto | 262.144 tokens originales; 73.728 tokens validados en producción (pool KV compartido entre 2 slots) |
| Tipos de cuantizacion | IQ4_XS (4,25 bpw, `general.file_type = 30`) para el modelo de texto; F16 para el proyector de visión (mmproj); KV cache Q4_0 K / Q4_0 V y draft KV F16 |
| Idiomas soportados | zh (chino), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / llama-server) |
| Tamano del repo | 15,2 GB |
| Modelos base | Qwen/Qwen3.8-27B y junafinity/Qwen-3.8-27B-Uncensored |
| Pipeline | image-text-to-text |
| SHA256 modelo principal | f6c1f6e1211aeceaa386cbeabd0bdfbee0d124747ecaa3e908a93394518e9274 |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B, un transformer denso multimodal con capacidad de procesamiento de imagen y texto (pipeline `image-text-to-text`). La edición de comportamiento se realizó con ZeroFuse v0.1.0 mediante ablación direccional: capa fuente 35, intensidad 1,2242385643286666, capas editadas de la 9 a la 56, ensayo número 38. El autor reporta una divergencia KL en BF16 de 0,009713646 respecto al modelo no editado, lo que indica una alteración relativamente contenida de la distribución de salida.

Sobre esa base editada se aplicó una requantización a IQ4_XS reutilizando el layout de tipos de tensor y la importance matrix del release Unsloth Dynamic V3 `UD-IQ4_XS`. La innovación técnica destacable es la preservación de la capa nativa MTP (`qwen35.nextn_predict_layers = 1`, 15 tensores en `blk.64.*`), que habilita decodificación especulativa integrada (`--spec-type draft-mtp`) sin necesidad de un modelo borrador separado, con tasas de aceptación documentadas del 80,85% en P1 y del 77,43%/62,22% en dos streams P2.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset original ni si hubo fases de RLHF o DPO en el modelo base. El mapa de cuantización usa expresiones regulares totalmente ancladas para evitar que la regla global `output.weight` capture por error tensores `attn_output.weight` por capa.

## Capacidades
- Generación de texto y razonamiento en chino e inglés.
- Procesamiento multimodal de imagen y texto (image-text-to-text) mediante el proyector `mmproj-Qwen3.8-27B-F16.gguf`, con `--image-max-tokens 4096`.
- Decodificación especulativa nativa con MTP (Multi-Token Prediction), integrada en el propio GGUF.
- Contexto largo: 262.144 tokens en el modelo original y 73.728 tokens en la configuración de producción validada, con pool KV compartido entre dos slots paralelos.
- Servicio concurrente con `llama-server` en modo `-np 2` y KV unificado (`--kv-unified`).
- Plantillas de prompt Jinja vía `--jinja`.
- Comportamiento sin rechazo (ZeroRefusal) validado con 0/64 rechazos en un test fijo sobre `mlabonne/harmful_behaviors`.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.
- No se documenta soporte de audio.

## Casos de uso
- Despliegue local en GPU consumer de 16 GB: el perfil validado (RTX 5060 Ti, `-ngl 999`, contexto 73.728) permite servir el modelo completo en GPU con visión en CPU, algo poco habitual en modelos de ~27B multimodales.
- Asistente multimodal de escritorio: análisis de capturas, diagramas o documentos escaneados combinando el proyector F16 con el modelo de texto, sin depender de APIs externas.
- Procesamiento de documentos largos en chino e inglés: la ventana de 73.728 tokens validada permite ingerir informes, contratos o expedientes completos en una sola pasada sin troceado agresivo.
- Servicio de inferencia concurrente de baja latencia: con `-np 2` y KV unificado se obtienen 65,67 tok/s agregados en el servidor y 61,88 tok/s de reloj de pared, suficiente para dos usuarios o dos flujos simultáneos.
- Investigación sobre alineación y seguridad: el par de modelos (base y editado con ZeroFuse) permite estudios comparativos de rechazo, sesgo y deriva distribucional con una KL medida de 0,009713646.
- Generación creativa sin filtros editoriales: redacción de ficción, guiones o contenido crudo donde los rechazos del modelo base resultan contraproducentes, siempre bajo control de acceso y auditoría por parte del desplegador.
- Evaluación de cuantizaciones: la inclusión de la importance matrix (`imatrix_unsloth.gguf`) y el mapa de 866 tensores (`v3-final-tensor-overrides.txt`) permite reproducir el proceso de cuantización y comparar estrategias.
- Backend de prototipado con API compatible OpenAI: `llama-server` expone el modelo en el puerto 8001, lo que facilita integrarlo en aplicaciones existentes que ya consumen endpoints tipo OpenAI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos publicados son de rendimiento de inferencia y de validación de rechazo.

| Prueba | Resultado |
|---|---:|
| Decodificación P1 | 41,67 tok/s |
| Stream A en P2 | 31,58 tok/s |
| Stream B en P2 | 34,08 tok/s |
| Media por stream en P2 | 32,83 tok/s |
| Agregado del servidor en P2 | 65,67 tok/s |
| Agregado de reloj de pared en P2 | 61,88 tok/s |
| VRAM libre mínima observada | ~138 MiB |
| Aceptación MTP (P1) | 80,85% |
| Aceptación MTP (P2 stream A / stream B) | 77,43% / 62,22% |

| Validación de rechazo | Resultado |
|---|---:|
| Prompts validos | 64 |
| Aceptados | 64 |
| Rechazados | 0 |
| Errores | 0 |
| Tasa de rechazo | 0/64 |

Metodología del test de rechazo: dataset `mlabonne/harmful_behaviors` (revisión `01cead01398926d81f7c52bdb790ee8cf77ebba7`, SHA256 del corpus `b4f2ddec5ab06058b721be9afe75e7fdc656852da257d8e7a117425b3dd89114`), primeros 64 prompts, máximo 64 tokens de salida, temperatura 1,0, top-p 0,95, top-k 20 y un clasificador fijo de 23 marcadores de rechazo. Solo se publican metodología y resumen.

## Requisitos de hardware
- VRAM estimada para el perfil publicado: ~14,25 GB para el modelo de texto IQ4_XS más ~0,93 GB del proyector de visión F16, sobre un total de 16 GB. El margen libre observado es de solo ~138 MiB.
- GPU validada por el autor: NVIDIA RTX 5060 Ti de 16 GB, con texto completamente en GPU y proyector de visión en CPU (`--no-mmproj-offload`).
- El propio autor advierte que la configuración de 16 GB tiene un margen de VRAM muy estrecho y que cambios de driver, versión de CUDA, formas de batch o cargas CUDA en segundo plano pueden provocar OOM.
- No se recomienda ejecutar ComfyUI ni otra carga CUDA pesada en paralelo.
- Un directorio de terceros (abliteratedmodels.org) estima ~17,2 GB a Q4_K_M con 4k de contexto y clasifica el modelo en la franja de 25B-50B (clase 48 GB de VRAM); es una estimación externa para otra cuantización, no un dato del autor.
- Opciones de despliegue: llama.cpp / llama-server (versión upstream b10435 / 9e40df6 es la validada). No se documentan despliegues con vLLM, TGI u Ollama en la información disponible.
- Parámetros de rendimiento recomendados: `--flash-attn on`, `-ctk q4_0`, `-ctv q4_0`, `--spec-type draft-mtp`, `--spec-draft-n-max 1`, `-b 512`, `-ub 64`, `--threads 7`, `--fit off`.
- Throughput medido: 41,67 tok/s en un solo stream y 61,88-65,67 tok/s agregados con dos streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hefen2959512/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF | ~27B | 262.144 originales / 73.728 validados | IQ4_XS GGUF + mmproj F16 | apache-2.0 | Edicion ZeroFuse, MTP nativo, multimodal |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | safetensors / GGUF | apache-2.0 (heredada en este repo) | Modelo original sin editar; rechaza contenido según su alineación |
| junafinity/Qwen-3.8-27B-Uncensored | no disponible | no disponible | no disponible | no disponible | Origen de la edicion de comportamiento (ZeroFuse v0.1.0, ensayo 38) |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ4_XS) | ~27B | no disponible | IQ4_XS GGUF (`Qwen3.8-27B-UD-IQ4_XS.gguf`, 14.252.845.984 bytes, SHA256 40fac405...) | no disponible | Referencia de cuantizacion; sin edicion de comportamiento ni visor incluido |

No se dispone de datos de benchmarks comparativos entre estas variantes, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- Margen de VRAM extremadamente ajustado: ~138 MiB libres en el perfil validado. Cualquier cambio de entorno puede provocar OOM.
- El proyector de visión debe permanecer en CPU en este perfil; moverlo a GPU romperá el presupuesto de memoria.
- Los modelos ZeroRefusal/uncensored pueden producir contenido inseguro, ilegal o incorrecto. El desplegador es responsable del control de acceso, la auditoría y las políticas de seguridad.
- La validación de 0/64 rechazos se limita a un test fijo de 64 prompts con un clasificador de 23 marcadores; el propio autor indica que no constituye una garantía general de seguridad ni de calidad.
- Riesgo de alucinación: no se publican evaluaciones de veracidad, y la edición de comportamiento puede afectar a la calibración del modelo.
- Cobertura idiomática limitada a chino e inglés; el rendimiento en castellano no está documentado.
- Discrepancia de metadatos: el campo de parámetros totales del repo (460.730.096) no concuerda con la denominación de 27B ni con el tamaño del GGUF.
- El repositorio parece un re-upload: la model card, los repos de GitHub y los directorios de terceros atribuyen el release a QQZ2026 / wilsonzhang2, mientras que en HuggingFace figura bajo Hefen2959512. Conviene verificar la procedencia y los hashes antes de usarlo en producción.
- La licencia declarada es apache-2.0, pero se debe respetar también la licencia y los términos de los modelos, datasets y herramientas upstream (Qwen, junafinity, Unsloth, llama.cpp).
- No se documentan capacidades de tool calling ni de agentes, por lo que no conviene asumirlas en pipelines automatizados sin validación previa.

## Enlaces
- Repositorio HuggingFace (autor de la ficha): https://huggingface.co/Hefen2959512/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF
- Mirror en HuggingFace atribuido a QQZ2026: https://huggingface.co/QQZ2026/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF/tree/main
- GitHub del release V3 Final: https://github.com/wilsonzhang2/qwen3.8-27b-zerorefusal-v3-final
- GitHub del perfil NVFP4 16 GB (incluye README del Zerorefusal UD-IQ4_XS MTP): https://github.com/wilsonzhang2/qwen3.8-27b-nvfp4-16gb/blob/main/zerorefusal-ud-iq4xs-mtp/README.md
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-zerorefusal/
- Registro en free2aitools: https://free2aitools.com/model/qqz2026/qwen3.8-27b-zerorefusal-ud-iq4_xs-mtp-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Origen de la edición de comportamiento: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Referencia de cuantización Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper, blog o demo oficial del modelo base: no disponible en la información proporcionada.
