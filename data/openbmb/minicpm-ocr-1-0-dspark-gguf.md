# openbmb/MiniCPM-OCR-1.0-DSpark-gguf

## Resumen

MiniCPM-OCR 1.0 DSpark — GGUF es la versión cuantizada en formato GGUF del modelo borrador (draft model) DSpark, desarrollado por OpenBMB para acelerar la inferencia de MiniCPM-OCR 1.0 mediante decodificación especulativa. No es un modelo OCR autónomo: se trata de una cabeza de borrador ligera (296,9 millones de parámetros) que debe ejecutarse junto con el checkpoint principal de MiniCPM-OCR 1.0 en formato GGUF, aportando predicciones de tokens que el modelo principal verifica.

Su relevancia radica en la optimización de latencia para tareas de OCR y parseo de documentos en entornos locales: al habilitar el draft model en llama.cpp (mediante `--spec-type draft-dspark`), se reduce el tiempo de generación de texto reconocido sin pérdida de calidad, ya que el modelo principal sigue siendo el que decide los tokens finales. Es especialmente útil en despliegues on-device o en servidores con GPU de consumo donde el OCR de documentos largos se ve limitado por la velocidad de decodificación. El pipeline es de tipo image-text-to-text, con soporte de inglés y chino, y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft head (modelo borrador) para decodificación especulativa sobre MiniCPM-OCR 1.0 (multimodal, image-text-to-text) |
| Parametros totales | 296.952.577 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (definida por el modelo principal) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también disponible el draft en BF16/safetensors en el repo DSpark original) |

## Arquitectura y entrenamiento

Este repositorio contiene únicamente el draft model DSpark: una cabeza de predicción ligera entrenada como finetune del propio MiniCPM-OCR 1.0 para anticipar los tokens que el modelo principal generará. En llama.cpp se activa con `--spec-type draft-dspark`, usando `-md` para indicar el draft y `-ngld` para offload de sus capas a GPU. Una particularidad técnica destacable es que cada nivel de cuantización del GGUF almacena en su tensor `d2t` los token IDs objetivo en codificación absoluta, mientras que la exportación en safetensors los guarda delta-encoded; esto es relevante para quien quiera manipular los pesos directamente.

Al tratarse de un modelo borrador, no genera texto de forma autónoma ni realiza OCR por sí mismo: su salida es verificada por el modelo principal, por lo que la calidad del resultado depende íntegramente de MiniCPM-OCR 1.0. Los detalles sobre datos de entrenamiento, número de tokens o técnicas de alineación del draft no están disponibles en la información proporcionada. Para el funcionamiento multimodal es imprescindible usar el projector del modelo principal (`mmproj-model-f16-4x.gguf` del repositorio MiniCPM-OCR-1.0-gguf).

## Capacidades

- Predicción rápida de tokens candidatos para decodificación especulativa junto a MiniCPM-OCR 1.0 (no genera texto de forma independiente).
- Compatible con entrada multimodal (imágenes de documentos) siempre que se use junto al modelo principal y su projector en `llama-cli` o `llama-server`.
- Soporte nativo en llama.cpp mediante el flag `--spec-type draft-dspark`.
- Disponible en 11 niveles de cuantización, desde F16 hasta Q4_0, para ajustar el consumo de memoria.
- No soporta tool calling ni capacidades de agente: es un componente de aceleración, no un modelo conversacional completo.

## Casos de uso

- Aceleración de OCR local en llama.cpp: se usa como draft junto al GGUF principal de MiniCPM-OCR 1.0 para reducir la latencia al transcribir páginas escaneadas con el prompt "Text Recognition:".
- Parseo de documentos a gran escala: en pipelines batch que procesan miles de páginas (facturas, contratos, informes), la decodificación especulativa reduce el coste temporal total sin modificar los resultados.
- Despliegue en GPU de consumo: al pesar el draft solo 0,2–0,6 GB, cabe junto al modelo principal en GPUs como la RTX 4090, acelerando OCR on-premise.
- Servicios de API de documentos autoalojados: integrado en `llama-server` permite montar un endpoint de parseo de documentos con menor latencia por petición.
- Sistemas RAG sobre documentos digitalizados: acelera la fase de ingesta, donde el OCR es habitualmente el cuello de botella.
- Automatización de archivo histórico: transcripción de archivos escaneados en inglés y chino con verificación del modelo principal, garantizando calidad idéntica al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card tampoco aporta cifras de speedup de la decodificación especulativa respecto a la inferencia estándar.

## Requisitos de hardware

- VRAM para el draft: entre 0,209 GB (Q4_0/Q4_K_S) y 0,606 GB (F16); la VRAM total dependerá del modelo principal MiniCPM-OCR 1.0 y su projector (`mmproj-model-f16-4x.gguf`).
- Se recomienda offload completo a GPU del draft con `-ngl 99 -ngld 99` y activar flash attention (`-fa on`).
- Al ser tan ligero, cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) junto al modelo principal; el requisito real lo marca el checkpoint principal de MiniCPM-OCR 1.0.
- Despliegue mediante llama.cpp (`llama-cli` o `llama-server`); `llama-mtmd-cli` no acepta draft models con entrada multimodal.
- No es aplicable a vLLM, TGI u Ollama según la información proporcionada.
- Latencia y throughput: no disponible (no se publican cifras de speedup).

Ejemplo de invocación:

```bash
llama-cli \
  -m MiniCPM-OCR-1_0-Q8_0.gguf \
  --mmproj mmproj-model-f16-4x.gguf \
  -md dspark-MiniCPM-OCR-1_0-Q8_0.gguf \
  --spec-type draft-dspark \
  --image page.png -p "Text Recognition:" \
  --jinja -ngl 99 -ngld 99 -fa on
```

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Formato | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR 1.0 DSpark GGUF (este repo) | Draft model para decodificación especulativa | 296,9 M | GGUF (F16 a Q4_0) | Apache 2.0 |
| MiniCPM-OCR 1.0 DSpark | Draft model (versión original) | no disponible | BF16 (safetensors) | Apache 2.0 |
| MiniCPM-OCR 1.0 | Modelo OCR principal (multimodal) | no disponible | BF16, GGUF, AWQ W4A16, GPTQ W4A16 | Apache 2.0 |

No se conocen draft models comparables de otros modelos OCR en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo OCR autónomo: sin el checkpoint principal de MiniCPM-OCR 1.0 y su projector, no produce ningún resultado útil.
- `llama-mtmd-cli` no acepta draft models; hay que usar `llama-cli` o `llama-server` para combinar entrada multimodal y decodificación especulativa.
- Solo soporta inglés y chino; otros idiomas dependen del modelo principal y pueden degradar el rendimiento del draft.
- La decodificación especulativa solo acelera la generación: no mejora la calidad del OCR ni corrige alucinaciones del modelo principal.
- Detalles de entrenamiento, datos de benchmarks y cifras de speedup no están disponibles, por lo que conviene validar la ganancia de latencia en el propio hardware antes de producir.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

## Enlaces

- Repositorio del draft GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Modelo principal MiniCPM-OCR 1.0: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- GGUF del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- Draft DSpark en BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Versión AWQ: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- Versión GPTQ: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Demo oficial (CN): https://platform.modelbest.cn/console/playground/document-parse
- Demo oficial (Global): https://platform.modelbest.ai/console/playground/document-parse
- Demo básica: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- ModelScope (este repo): https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark-gguf
