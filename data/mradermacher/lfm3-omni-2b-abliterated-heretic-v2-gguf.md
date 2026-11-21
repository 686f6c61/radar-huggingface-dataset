# mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF

## Resumen

`mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF` es una cuantizacion en formato GGUF del modelo `mizahnyx/lfm3-omni-2b-abliterated-heretic-v2`, que a su vez deriva del modelo multimodal `LiquidAI/LFM3-Omni-2B`. El modelo original pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, disenada para inferencia eficiente en dispositivos con recursos limitados. Esta version concreta ha sido sometida a un proceso de "abliteration" y "decensoring" (etiquetado como heretic y abliterated), orientado a eliminar o reducir los mecanismos de rechazo y filtros de seguridad del modelo base.

El modelo cuenta con aproximadamente 1.728 millones de parametros (1,73 mil millones) en pesos safetensors, lo que lo situa en la categoria de modelos pequenos. Es multimodal (etiqueta omni y multimodal), con soporte para texto e imagen a traves del proyector multimodal incluido en el repositorio (`mmproj`). Soporta 23 idiomas, incluido el castellano, y se distribuye bajo la licencia LFM Open License v1.0.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo multimodal de ~2B en hardware de consumo gracias a las cuantizaciones GGUF (desde 0,9 GB en Q2_K hasta 3,6 GB en f16); por otro, su naturaleza "abliterated" y "uncensored" implica consideraciones eticas y legales importantes que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM3, familia Liquid; detalles de arquitectura no especificados en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj Q8_0 y mmproj f16 para el componente multimodal |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | LFM Open License v1.0 (license_name: lfm-open-license-v1.0; license: other) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo pertenece a la familia LFM3 de Liquid AI, etiquetada con `liquid`, `lfm3` y `lfm3-omni`, e incluye un componente multimodal (proyector `mmproj`) que habilita el procesamiento de imagenes junto con texto. El tamano de ~1,73 B de parametros y la existencia de cuantizaciones de ~1 GB sugieren un diseno orientado a eficiencia en inferencia.

Respecto al entrenamiento, no se especifican en la informacion disponible el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La variante "abliterated-heretic-v2" implica un post-procesado orientado a eliminar las direcciones de rechazo en el espacio de activaciones (abliteration), una tecnica que modifica los pesos para reducir la tendencia del modelo a negarse a responder ciertas peticiones. Esta ficha no puede confirmar los detalles tecnicos exactos de dicho proceso.

## Capacidades

- Generacion de texto conversacional en 23 idiomas, incluido el castellano.
- Procesamiento multimodal: soporte de entrada de imagenes mediante el proyector `mmproj` incluido en el repositorio.
- Capacidad de dialogo multi-turno (etiqueta `conversational`).
- Comportamiento "uncensored" / "decensored": el modelo ha sido modificado para reducir rechazos ante peticiones que el modelo base podria declinar.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se dispone de informacion que confirme soporte de tool calling, function calling, modo thinking explicito, audio u otras capacidades especiales.

## Casos de uso

- Prototipado local de asistentes conversacionales: gracias a las cuantizaciones de ~1,2 GB (Q4_K_M), el modelo puede ejecutarse en portatiles con GPU modesta o incluso en CPU, permitiendo iterar rapidamente sobre prompts y flujos conversacionales sin coste de API.
- Procesamiento de imagenes en local: el componente `mmproj` permite describir o analizar imagenes en entornos sin conectividad, util para clasificacion preliminar de documentos escaneados o capturas.
- Investigacion sobre alineacion y seguridad: la variante abliterated es util para estudiar el comportamiento de modelos sin filtros de rechazo, comparar respuestas frente al modelo base y analizar sesgos residuales en entornos controlados.
- Generacion de texto multilingue: con soporte para 23 idiomas, puede emplearse en tareas de traduccion asistida o generacion de contenido en idiomas minoritarios dentro del conjunto soportado.
- Despliegue en dispositivos de borde: el tamano reducido (1,73 B) y los formatos GGUF permiten integracion en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, con latencia baja y sin dependencia de la nube.
- Filtrado y anotacion de datos: puede utilizarse como modelo auxiliar para etiquetar o generar datos sinteticos en pipelines de entrenamiento, aunque su naturaleza sin censura exige supervision humana en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para cuantizaciones Q3-Q4; ~1,9 GB para Q8_0; ~3,6 GB para f16. El componente multimodal anade ~0,6 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente para las cuantizaciones Q4-Q5. Para f16 se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers; la version GGUF esta pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| lfm3-omni-2b-abliterated-heretic-v2 (este) | ~1,73 B | no disponible | Si (mmproj) | LFM Open License v1.0 | GGUF, safetensors |
| LiquidAI/LFM3-Omni-2B (base) | ~1,73 B | no disponible | Si | LFM Open License v1.0 | safetensors |
| Modelos ~2B de la familia Gemma/Qwen | no disponible en esta ficha | no disponible | variable | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": ha sido modificado para eliminar o reducir los mecanismos de rechazo. Puede generar contenido ofensivo, peligroso o inapropiado sin filtros, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: al tratarse de un modelo de ~1,73 B, su capacidad de razonamiento y fidelidad factual es limitada en comparacion con modelos de mayor tamano.
- La licencia LFM Open License v1.0 impone condiciones especificas de uso; es responsabilidad del usuario revisar el texto completo de la licencia antes de un uso comercial.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de casos de uso que requieran ventanas largas.
- El proceso de abliteration puede degradar capacidades generales (coherencia, instrucciones complejas) respecto al modelo base original.
- No se han publicado benchmarks que permitan evaluar el impacto de la cuantizacion ni del proceso de decensoring en el rendimiento.
- Uso responsable: dado su caracter sin censura, debe desplegarse con supervision humana y en entornos controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Modelo base (abliterated): https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2
- Modelo original LiquidAI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/lfm3-omni-2b-abliterated-heretic-v2-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
