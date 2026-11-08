# mradermacher/LFM3-1.7B-heretic-GGUF

## Resumen

LFM3-1.7B-heretic-GGUF es una colección de cuantizaciones GGUF estáticas del modelo `saidutta69/LFM3-1.7B-heretic`, una variante "abliterated" (también etiquetada como *uncensored* o *decensored*) del modelo base LiquidAI LFM3-1.7B. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y el resultado está pensado para ejecución local en CPU, GPU de consumo y dispositivos *edge* mediante llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo subyacente pertenece a la familia LFM3 de Liquid AI, con 1.728.801.600 parámetros reales según los pesos en safetensors (etiquetado comercialmente como 1.7B) y una arquitectura híbrida propia de la casa, orientada a inferencia en dispositivo y a flujos agénticos con *tool calling*. La variante *heretic* elimina parcialmente los mecanismos de rechazo y alineación del modelo original, de ahí las etiquetas *uncensored* y *abliterated*.

La relevancia de esta ficha es doble: por un lado, permite desplegar un modelo de ~1,7B en hardware muy modesto con cuantizaciones desde 0,9 GB (Q2_K) hasta 3,6 GB (f16); por otro, conviene ser consciente de que se trata de una modificación no oficial del modelo original, con implicaciones claras de licencia y de seguridad que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (etiquetada `hybrid-architecture` en el ecosistema LFM3); detalles internos no disponibles |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); existen también cuantizaciones ponderadas/imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | `lfm1.0` (license: other, enlace a la licencia de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El repositorio es una colección de cuantizaciones GGUF generadas a partir de `saidutta69/LFM3-1.7B-heretic`, que a su vez deriva de LFM3-1.7B de Liquid AI. La arquitectura del modelo base se describe en el ecosistema como híbrida (`hybrid-architecture`), una seña de identidad de la familia LFM, pero la model card de esta cuantización no aporta detalles sobre capas, atención, estado recurrente ni configuración interna. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La modificación *heretic* consiste en una intervención sobre los pesos del modelo alineado para reducir los comportamientos de rechazo; el autor original la etiqueta como *abliterated* y *decensored*. No se especifica la metodología exacta (dirección de ablación, capas afectadas, magnitud de la proyección) ni se publican evaluaciones del impacto sobre capacidades generales. mradermacher únicamente documenta el proceso de cuantización (conversión desde formato HF, cuantización estática, versión de quantize 2 y salida tensor-quantised), sin innovaciones técnicas adicionales más allá de la propia conversión a GGUF.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repo.
- Soporte declarado de *tool calling* / *function calling*, herencia del diseño agéntico de LFM3.
- Orientación a flujos agénticos y *on-device* (`agentic`, `edge`, `on-device` en las etiquetas).
- Capacidades de razonamiento y *roleplay* mencionadas en el ecosistema de variantes LFM3-1.7B (no confirmadas específicamente para esta cuantización).
- Multilingüismo declarado en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento *uncensored*: menor tasa de rechazos ante peticiones que el modelo alineado rechazaría.
- No se documentan capacidades de visión, audio ni *thinking mode* explícito en la información disponible.

## Casos de uso

- Asistentes locales en dispositivos de gama baja: con cuantización Q4_K_M (1,2 GB) el modelo cabe en portátiles sin GPU dedicada o en mini-PC, permitiendo un asistente conversacional totalmente offline.
- Automatización de agentes con *tool calling* en entornos controlados: integración en pipelines donde el modelo decide qué función invocar (APIs internas, consultas a bases de datos) gracias a su soporte declarado de *function calling*.
- Procesamiento de texto multilingüe en *edge*: clasificación, resumen o extracción de entidades en los 16 idiomas soportados sin depender de la nube, útil en despliegues con requisitos de soberanía de datos.
- Generación de contenido creativo sin restricciones de filtrado: guiones, ficción o *roleplay* donde el modelo alineado original aplicaría rechazos; requiere revisión humana por las implicaciones éticas.
- Prototipado rápido de aplicaciones LLM: al ser GGUF y caber en 1-2 GB, permite iterar en local con llama.cpp u Ollama antes de escalar a modelos mayores.
- Investigación sobre alineación y *abliteration*: útil para estudiar el efecto de la eliminación de rechazos sobre calidad, sesgos y coherencia en modelos pequeños.
- Módulo de preprocesado en pipelines de CI/CD: tareas de normalización, etiquetado o generación de mensajes de commit con latencia baja en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o con la variante alineada, por lo que no es posible cuantificar el impacto de la modificación *heretic* sobre el rendimiento.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; IQ4_XS ~1,1 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en iGPU con memoria unificada.
- Ejecutable en CPU pura con llama.cpp; el tamaño reducido permite decodificación interactiva en portátiles modernos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repo base es compatible con `transformers` y con *endpoints compatible* según las etiquetas.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-heretic (esta ficha) | 1,73B | no disponible | lfm1.0 | Variante *abliterated* en GGUF, 16 idiomas |
| LFM3-1.7B (original, LiquidAI) | ~1,7B | no disponible | lfm1.0 | Modelo alineado de referencia; rechaza contenido que la variante *heretic* acepta |
| LFM3-1.7B-Uncensored-GGUF (mradermacher) | ~1,7B | no disponible | lfm1.0 | Variante similar del mismo autor, con etiquetas *heretic/abliterated* |
| Falcon3-7B-Instruct-Heretic-v2-GGUF | 7B | no disponible | no disponible | Alternativa *heretic* de mayor tamaño, más exigente en hardware |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La modificación *heretic* elimina parte de los mecanismos de seguridad del modelo alineado; puede generar contenido ofensivo, ilegal o dañino sin filtros, lo que exige supervisión humana y políticas de uso claras en producción.
- No hay evaluaciones publicadas del impacto de la ablación sobre coherencia, razonamiento o tasas de alucinación; el riesgo de degradación silenciosa es real.
- Riesgo de alucinación inherente a un modelo de 1,7B; no apto para tareas de alta precisión sin verificación externa.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de diseñar prompts largos.
- Licencia `lfm1.0`: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el texto enlazado antes de cualquier despliegue productivo. La modificación *heretic* no está avalada por Liquid AI y puede quedar fuera de los términos previstos por el licenciante.
- El modelo base de esta cuantización es de un tercero (`saidutta69`), no oficial; no hay garantías de reproducibilidad del proceso de ablación.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Multilingüismo declarado pero sin métricas por idioma; el rendimiento en idiomas distintos del inglés puede ser notablemente inferior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-GGUF
- Modelo base de la cuantización: https://huggingface.co/saidutta69/LFM3-1.7B-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#LFM3-1.7B-heretic-GGUF
- Modelo original LiquidAI LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Variante similar del mismo autor: https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
