# mradermacher/LFM3-1.7B-Heretic-NX-GGUF

## Resumen

LFM3-1.7B-Heretic-NX-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo 0xzknw/LFM3-1.7B-Heretic-NX, una variante "abliterated" (sin rechazo de contenido) del modelo base LFM3 de 1.700 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la comunidad de GGUF, y se distribuye bajo la licencia lfm-open-license-v1.0.

El modelo resuelve el problema de ejecutar un modelo conversacional de ~1,7B parametros en hardware modesto, ofreciendo un rango amplio de cuantizaciones estaticas (de Q2_K a f16) que van desde 0,9 GB hasta 3,6 GB en disco. Al estar basado en LFM3 (la familia de modelos liquidos de Liquid AI), la arquitectura subyacente no es un transformer clasico, aunque la model card no detalla la composicion exacta.

Es relevante ahora por dos motivos: por un lado, permite probar localmente un modelo de la familia LFM3 con requisitos minimos de VRAM; por otro, la variante "Heretic" elimina los mecanismos de rechazo, lo que lo hace util para investigacion sobre alineamiento y seguridad, pero inadecuado para despliegues en produccion sin filtros adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no especifica detalles) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en HF) |
| Formato de pesos | GGUF (tambien existe el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineamiento. Solo se indica que es una cuantizacion estatica del modelo 0xzknw/LFM3-1.7B-Heretic-NX, que a su vez deriva de la familia LFM3. El tag "abliterated" sugiere que se ha aplicado una tecnica de ablacion de direcciones de rechazo sobre un modelo ya alineado, aunque no se documenta el metodo exacto ni el dataset utilizado.

Los metadatos internos de la cuantizacion indican `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que se partio de pesos en formato Hugging Face y se convirtieron a GGUF con cuantizacion de tensores de salida. No se ofrecen cuantizaciones ponderadas ni imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles y frances.
- Modo conversacional (tag `conversational` en Hugging Face).
- Al estar "abliterated", no aplica rechazos por contenido sensible, lo que afecta a su comportamiento en dominios restringidos.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo "thinking".
- No se documenta soporte multilingue mas alla de en/fr.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar como cambia el comportamiento de un modelo LFM3 al eliminar los mecanismos de rechazo, comparando respuestas con la version original.
- Pruebas locales en hardware de gama baja: con cuantizaciones Q4_K_M de 1,2 GB, el modelo cabe en GPUs consumer con 4 GB de VRAM o incluso en CPU, lo que facilita prototipado rapido.
- Evaluacion de la familia LFM3: sirve como banco de pruebas para medir latencia, calidad y comportamiento de LFM3 en escenarios conversacionales antes de escalar a variantes mayores.
- Generacion de texto en frances e ingles: util para tareas de redaccion, resumen o parafraseo en esos dos idiomas en entornos con recursos limitados.
- Despliegue en dispositivos edge: el tamano reducido (0,9-1,9 GB en cuantizaciones bajas) permite ejecutarlo en Raspberry Pi, mini-PCs o moviles con llama.cpp.
- Filtrado y clasificacion de contenido sin restricciones: en pipelines de investigacion donde se necesita que el modelo no rechace entradas sensibles, aunque requiere supervision humana.
- Base para fine-tuning ligero: al ser un modelo pequeno, es viable ajustarlo con LoRA en una sola GPU consumer para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB con Q2_K, ~1,2 GB con Q4_K_M, ~1,9 GB con Q8_0, ~3,6 GB con f16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); en A100/H100 sobra capacidad y no es el target.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas modernas e incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requeririan los pesos originales en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-NX (este) | ~1,7B | no disponible | lfm-open-license-v1.0 | GGUF | Variante abliterated, solo en/fr |
| LFM3-1.7B (original) | ~1,7B | no disponible | lfm-open-license-v1.0 | safetensors/GGUF | Version alineada, con rechazos |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K | Apache 2.0 | safetensors/GGUF | Multilingue amplio, alineado |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community | safetensors/GGUF | Multilingue, con rechazos |

## Limitaciones y advertencias

- Al ser una variante "abliterated", el modelo no aplica rechazos de contenido; puede generar material sensible, ofensivo o danino sin filtro. No apto para produccion sin moderacion externa.
- Solo soporta ingles y frances; el rendimiento en castellano no esta garantizado.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- La licencia lfm-open-license-v1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (1,7B) y la falta de datos de evaluacion.
- No hay benchmarks publicados, por lo que no se puede comparar su calidad objetivamente con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-NX-GGUF
- Modelo base: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX
- Pagina de overview del autor: https://hf.tst.eu/model#LFM3-1.7B-Heretic-NX-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
