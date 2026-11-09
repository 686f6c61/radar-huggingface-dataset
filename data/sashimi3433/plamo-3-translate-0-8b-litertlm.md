# sashimi3433/plamo-3-translate-0.8b-litertlm

## Resumen

PLaMo 3 Translate 0.8B LiteRT-LM es una conversión no oficial del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks (PFN) al formato `.litertlm` de LiteRT-LM, empaquetada por el usuario independiente `sashimi3433`. El objetivo es ejecutar un modelo de traducción especializado en dispositivos locales (CPU, y potencialmente GPU/NPU) sin necesidad de infraestructura de servidor, usando el runtime de Google AI Edge. No está afiliada ni respaldada por PFN.

El modelo subyacente es un transformer decoder de 0,8 mil millones de parámetros, derivado de la arquitectura Gemma3 (atención intercalada de ventana deslizante y global), especializado en traducción entre japonés, inglés, chino y coreano. Esta versión concreta aplica cuantización dinámica int8 a los pesos y limita la caché KV a 4096 tokens, lo que reduce el tamaño del bundle a 0,9 GB y permite inferencia en CPU con un rendimiento medido de aproximadamente 510 tok/s en prefill y 46 tok/s en decodificación.

Es relevante porque demuestra la viabilidad de llevar modelos de traducción de calidad a entornos de borde (edge) con un formato estandarizado y un runtime ligero, aunque con las limitaciones propias de una conversión comunitaria: solo se ha validado el backend CPU, la tokenización no reproduce exactamente ciertas reglas de pre-segmentación del original y el contexto se recorta drásticamente respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Gemma3, atención intercalada sliding-window/global, RoPE con YaRN en capas globales) |
| Parametros totales | 0,8 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV del bundle; el modelo original soporta contextos mucho más largos) |
| Tipos de cuantizacion | int8 dinámico (channel-wise en pesos); bundle q8 |
| Idiomas soportados | ja, en, zh, ko |
| Licencia | PLaMo Community License (uso personal/académico libre; uso comercial con registro previo en PFN y límite de facturación anual ≤ 1000 millones de JPY) |
| Formato de pesos | `.litertlm` (LiteRT-LM bundle), SentencePiece tokenizer, plantilla de prompt en jinja |

## Arquitectura y entrenamiento

La conversión se realizó con LiteRT-Torch 0.10.0 sobre la API Generative, partiendo del decoder tipo Gemma3 del modelo original. Se reimplementaron los detalles arquitectónicos del base: atención intercalada de ventana deslizante y global, RoPE con YaRN (incluyendo concentración de atención) en las capas globales, offsets de PLaMo RMSNorm plegados en los pesos, proyecciones `qkv_proj` y `gate_up_proj` fusionadas, y `lm_head` no atado. La cuantización es int8 dinámica con pesos channel-wise mediante ai-edge-quantizer.

No se dispone de información sobre el dataset de entrenamiento del modelo original (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. La verificación de la conversión incluye una reimplementación en PyTorch comparada con una implementación de referencia independiente del modelo HF, con una diferencia máxima de logits de 7,6e-6 y salidas greedy idénticas; el bundle int8 en LiteRT-LM 0.19.1 (CPU) produjo la misma traducción greedy que la referencia fp32 en las pruebas realizadas.

## Capacidades

- Traducción entre japonés, inglés, chino y coreano, con detección automática de dirección (si no se especifica `target_lang`: entrada en japonés → en; cualquier otra → ja).
- Control de idioma destino mediante `extra_context`: `target_lang` (p. ej. `ja`, `en`, `zh-hans`, `ko`, `ja-easy`), `source_lang`, `context`.
- Control de registro en japonés: `form` con valores `polite` o `plain`.
- Soporte de glosario terminológico mediante `glossary` (pares origen/destino) para forzar traducciones concretas.
- Uso de turnos previos de la conversación como ejemplos de traducción (few-shot implícito, igual que la plantilla de chat original).
- Ejecución on-device en CPU con el runtime LiteRT-LM; tokenizer y plantilla de prompt embebidos en el bundle.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de documentos técnicos JA↔EN en local: el modelo procesa textos de hasta 4096 tokens con glosario personalizado, útil para equipos que no pueden enviar contenido sensible a APIs en la nube.
- Atención al cliente multilingüe en dispositivos de borde: integración en aplicaciones de escritorio o quioscos para traducir mensajes entre japonés, chino, coreano e inglés sin conexión, aprovechando el bajo consumo de un modelo de 0,8B cuantizado a int8.
- Localización de interfaces y contenidos cortos: traducción de cadenas de UI, correos y notificaciones con control de registro (`polite`/`plain`) para adaptar el tono en japonés.
- Preprocesamiento en pipelines de datos: traducción por lotes de corpus JA/ZH/KO a EN antes de tareas de análisis, clasificación o indexación, ejecutable en una VM de 4 vCPU según las mediciones del autor.
- Herramientas de accesibilidad y aprendizaje de idiomas: traducción bidireccional en tiempo real en aplicaciones de escritorio con TTFT de ~0,52 s en CPU.
- Prototipado y evaluación de LiteRT-LM: servir como referencia para validar el flujo de conversión de modelos HF a `.litertlm` y medir rendimiento en CPU antes de desplegar en móvil o NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET, etc.) en la información disponible. El autor reporta únicamente métricas de inferencia del runtime:

| Metrica | Valor | Entorno |
|---|---|---|
| Prefill | ≈ 510 tok/s | `litert-lm benchmark`, 4 vCPU x86 cloud VM, backend CPU |
| Decode | ≈ 46 tok/s | mismo entorno |
| TTFT | ≈ 0,52 s | mismo entorno |
| Diferencia máxima de logits (reimpl. PyTorch vs. referencia HF) | 7,6e-6 | verificación de conversión |
| Coincidencia de tokenización en líneas de prueba | 574/640 idénticas | diferencias por regla de pre-segmentación no reproducida |

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 0,9 GB en disco; en ejecución en CPU requiere del orden de 1–2 GB de RAM considerando pesos int8 y caché KV de 4096 tokens (estimación, no publicada por el autor).
- GPU recomendadas: no disponibles; solo se ha probado el backend CPU. No hay validación en GPU ni NPU.
- Cabe en hardware consumer: sí, por tamaño; el bundle de 0,9 GB es apto para equipos de escritorio y potencialmente móviles, aunque no se ha verificado en dispositivos móviles.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm run` y API Python `litert_lm.Engine`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un formato `.litertlm` específico.
- Latencia y throughput: prefill ≈ 510 tok/s, decode ≈ 46 tok/s, TTFT ≈ 0,52 s en 4 vCPU x86 (backend CPU, LiteRT-LM 0.19.1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B LiteRT-LM (esta ficha) | ~0,8B | 4096 (recortado) | ja, en, zh, ko | PLaMo Community License | `.litertlm`, LiteRT-LM (CPU validado) |
| pfnet/plamo-3-translate-0.8b (original) | ~0,8B | mucho mayor que 4096 (valor exacto no disponible) | ja, en, zh, ko | PLaMo Community License | safetensors / transformers (no confirmado en la información) |
| Alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (calidad de traducción) entre esta conversión y el modelo original ni con otras alternativas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Preferred Networks; los outputs no representan la opinión de PFN.
- Contexto limitado a 4096 tokens frente al modelo original, que soporta entradas mucho más largas; textos largos requieren troceado.
- Solo se ha validado el backend CPU; no hay pruebas en GPU, NPU ni dispositivos móviles.
- Tokenización no idéntica al original: no se reproduce la pre-segmentación alrededor de secuencias de ≥2 espacios y ≥4 caracteres repetidos, lo que puede alterar los límites de token en ese tipo de texto (574/640 líneas idénticas en pruebas).
- Riesgo de alucinación y errores de traducción inherentes a un modelo de 0,8B; no se han publicado evaluaciones de calidad (BLEU/COMET) que permitan acotar el riesgo.
- Sesgos: no documentados en la información disponible; al ser un modelo derivado de PFN, pueden heredarse sesgos del entrenamiento original no descritos.
- Licencia restrictiva para uso comercial: requiere registro previo en PFN y está limitada a usuarios con facturación anual ≤ 1000 millones de JPY; en caso contrario se necesita licencia separada. Al redistribuir, hay que incluir la licencia, mostrar "Built with PLaMo" e incluir "PLaMo" en el nombre de modelos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento garantizado.
- El formato `.litertlm` limita la portabilidad a otros runtimes de inferencia habituales (vLLM, llama.cpp, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/sashimi3433/plamo-3-translate-0.8b-litertlm
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (japonés): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro de uso comercial de PLaMo: https://forms.gle/mTL8tBLrMYXKNZD56
