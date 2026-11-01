# nbKPS/inkling-reap192-magicpack-gguf

## Resumen

Inkling-Small REAP192 Magicpack es una compilación de cuantizaciones GGUF para llama.cpp del modelo Inkling-Small, un transformer multimodal (visión y audio) con arquitectura de mezcla de expertos (MoE) desarrollado por ThinkingMachines. El modelo original declara 276.000 millones de parámetros totales con 12.000 millones activos por token; esta variante aplica una poda de expertos enrutados de 256 a 192 por capa (un recorte de un cuarto) mediante el criterio REAP (saliency por relevancia de activaciones), reduciendo el cómputo y el tamaño en disco a costa de una pérdida controlada de calidad medida como coincidencia top-1 y divergencia KL frente al modelo BF16 de referencia.

La ficha corresponde a una receta de cuantización concreta denominada "Magicpack" por su autor (KPS Labs, Kith Precision Services), que fija q8_0 en atención, expertos compartidos, embeddings y salida, mientras comprime únicamente los expertos enrutados con mezclas IQ3_S/IQ3_XXS o MXFP4/MXFP4, con pines en F32 para `attn_rel_proj` y las convoluciones cortas. Se publican dos builds: `magicpack-e-iq3_s-iq3_xxs` (81 GiB) y `magicpack-d-mxfp4-mxfp4` (102 GiB), ambas con las torres de visión y audio intactas en F16.

Su relevancia práctica es que permite servir un modelo multimodal de gran tamaño en hardware de una sola unidad tipo DGX Spark / GB10, con instrucciones de despliegue específicas para llama.cpp (fork `add-inkling`), incluyendo correcciones de plantilla de chat, gramática de tool calling y ajustes de memoria KV. El repositorio acumula 444 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, visión, audio); modelo base Inkling-Small |
| Parámetros totales | 199.220.201.514 (según safetensors del repo); el modelo base declara 276B totales / 12B activos |
| Parámetros activos | 12B (modelo base); no disponible para la variante podada |
| Longitud de contexto | Hasta 122.880 tokens en la configuración de servido publicada (`-c 122880`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | GGUF: mezcla IQ3_S/IQ3_XXS en expertos enrutados (build e), MXFP4/MXFP4 (build d); q8_0 en atención, expertos compartidos, embeddings y salida; F32 en `attn_rel_proj` y shortconvs; mmproj en F16 |
| Idiomas soportados | No disponible |
| Licencia | `other` (se aplica la licencia del modelo base ThinkingMachines/Inkling-Small) |
| Formato de pesos | GGUF (shards divididos, `*-00001-of-*.gguf`) + `mmproj-inkling-f16.gguf` para visión y audio |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con capacidades multimodales: además del tronco de lenguaje, incorpora torres de visión y audio que en esta publicación se mantienen en F16 sin cuantizar (`mmproj-inkling-f16.gguf`). La variante REAP192 reduce los expertos enrutados por capa de 256 a 192, un recorte del 25 %, seleccionando qué expertos conservar mediante una puntuación de saliencia REAP multiplicada por el recuento de enrutamiento ("sum"), validada con una evaluación de máscara conservada sobre cada candidato.

No se trata de un modelo reentrenado: el autor indica explícitamente que son cortes "vanilla", sin healing ni post-entrenamiento posterior. Los pesos densos BF16 resultantes de la poda están publicados aparte (`nbKPS/inkling-reap128-bf16` y `nbKPS/inkling-reap192-bf16`). La cuantización emplea una imatrix calculada sobre el propio modelo podado en dos pasadas (semilla, imatrix de pasada 1, referencia iq4_xs, y luego mezcla de imatrices frescas y amplias φ+e). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento, con formato de razonamiento configurable (`--reasoning-format auto`).
- Procesamiento multimodal de imagen y audio mediante el proyector F16 incluido.
- Tool calling / function calling, con parser Inkling y soporte de plantilla Jinja; requiere una gramática perezosa sobre `<|content_invoke_tool_json|>` para evitar fugas de llamadas como texto.
- Flujos agénticos multi-turno; el autor reporta 437+ turnos sin fugas de tool calls al armar la gramática.
- Capacidad de contexto largo: servido con 122.880 tokens repartidos en 3 slots paralelos de 40k.
- Multilingüismo: no disponible en la información proporcionada.
- Modo de razonamiento (thinking): soportado vía `--reasoning-format auto`, sin más detalles disponibles.

## Casos de uso

- Asistencia conversacional multimodal en local: el modelo puede mantener diálogos multi-turno con imágenes o audio de entrada gracias al proyector F16 y a una ventana de hasta 122.880 tokens, adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Agentes con tool calling sobre documentos largos: con 3 slots de 40k tokens en un GB10, se pueden procesar contratos o informes extensos y encadenar llamadas a herramientas (búsqueda, cálculo, APIs internas) con la gramática armada para evitar llamadas inválidas.
- Análisis de reuniones y audio: la torre de audio intacta permite transcribir o resumir grabaciones dentro de un pipeline local, combinando el audio con contexto textual acumulado en la misma ventana.
- Revisión de documentación técnica con capturas: la torre de visión permite interpretar diagramas, capturas de pantalla o figuras junto con el texto explicativo, útil para soporte técnico interno.
- Despliegue en estación de trabajo con GPU única: el build `magicpack-e` (81 GiB) está pensado para caber en un DGX Spark / GB10 con aproximadamente 16 GiB libres tras la carga, lo que habilita prototipado de agentes multimodales sin clúster.
- Evaluación comparativa de poda de expertos: investigadores pueden usar los builds publicados junto a los BF16 de referencia para medir el impacto de REAP 256→192 en tareas propias, con métricas de coincidencia top-1 y KL ya reportadas.
- Backend de chat compatible con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servidores compatibles con la API de chat de llama.cpp para prototipos de producto.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad frente al modelo BF16 de referencia (78.000 posiciones), no benchmarks de tareas estándar:

| Build | Expertos enrutados (gate/up · down) | Tamaño | Top-1 vs BF16 | KL vs BF16 |
|---|---|---|---|---|
| `magicpack-e-iq3_s-iq3_xxs` | IQ3_S · IQ3_XXS | 81 GiB | 0,762 | 0,662 |
| `magicpack-d-mxfp4-mxfp4` | MXFP4 · MXFP4 | 102 GiB | 0,748 | 0,739 |
| Suelo de máscara conservada (referencia del corte) | — | — | 0,815 | 0,45 |
| Referencia iq4_xs | — | — | 0,769 | 0,637 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: build `magicpack-e` ocupa 81 GiB en disco; build `magicpack-d`, 102 GiB. El autor advierte que ambos superan la línea cómoda de un único GB10 una vez contabilizada la caché KV.
- Configuración de referencia: un DGX Spark / GB10 con llama.cpp (fork `add-inkling`), `-ngl 999`, `-fa on`, `-c 122880 --parallel 3 -ub 512 -b 2048`, caché K en q8_0 y V obligatoriamente en f16. Con `magicpack-e` quedan aproximadamente 16 GiB libres tras la carga.
- Memoria adicional: presupuestar entre 12 y 30 GiB de deriva de memoria bajo carga al elegir el número de slots.
- Buffers de cómputo: usar `-ub 512`; con `-ub 1024` los buffers del build de 192 expertos cuestan unos 14 GiB adicionales.
- GPU consumer: no hay datos que confirmen que quepa en RTX 4090 (24 GB) ni en otras GPU de consumo; por tamaño, no es viable en una sola GPU consumer.
- Opciones de despliegue: llama.cpp con el fork `add-inkling` y `llama-server`; el repositorio incluye `Inkling.patched.jinja` y `mmproj-inkling-f16.gguf`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small REAP192 Magicpack (esta ficha) | 199,2B en safetensors del repo; base 276B/12B activos | Hasta 122.880 en servido | Sí (visión y audio) | `other` (hereda la del base) | GGUF en HuggingFace |
| Inkling-Small (base) | 276B totales / 12B activos | No disponible | Sí (visión y audio) | No disponible | Pesos del modelo original |
| Inkling REAP128 BF16 (`nbKPS/inkling-reap128-bf16`) | No disponible | No disponible | Sí (aquí sin cuantizar) | No disponible | BF16 en HuggingFace |
| Inkling REAP192 BF16 (`nbKPS/inkling-reap192-bf16`) | No disponible | No disponible | Sí (aquí sin cuantizar) | No disponible | BF16 en HuggingFace |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La poda de expertos 256→192 introduce degradación medible: top-1 de 0,762 (build e) frente al suelo de máscara conservada de 0,815; no es equivalente al modelo original.
- Son cortes sin healing ni post-entrenamiento; no se ha recuperado calidad tras la poda.
- La licencia es `other` y se hereda del modelo base ThinkingMachines/Inkling-Small; es imprescindible revisar los términos del base antes de cualquier uso comercial.
- La caché V debe permanecer en f16 en esta arquitectura; forzar otra cuantización puede degradar o romper la inferencia.
- La plantilla upstream usa `tojson(sort_keys=true)`, que minja no implementa: sin `Inkling.patched.jinja`, toda petición con herramientas devuelve error 500.
- El parser upstream no arma gramática de tool calling: sin la gramática perezosa sobre `<|content_invoke_tool_json|>`, aproximadamente el 1 % de los turnos agénticos filtra llamadas como texto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera de los idiomas del modelo original.
- Requiere hardware de memoria unificada grande (DGX Spark / GB10) y un fork específico de llama.cpp; no es un despliegue estándar.
- Bajo carga hay deriva de memoria de 12 a 30 GiB que debe presupuestarse al dimensionar slots.

## Enlaces

- HuggingFace: https://huggingface.co/nbKPS/inkling-reap192-magicpack-gguf
- Modelo base: https://huggingface.co/ThinkingMachines/Inkling-Small
- Pesos BF16 REAP128: https://huggingface.co/nbKPS/inkling-reap128-bf16
- Pesos BF16 REAP192: https://huggingface.co/nbKPS/inkling-reap192-bf16
