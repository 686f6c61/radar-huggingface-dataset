# enhasasuzu/Kimi-VL-A3B-Instruct-staging

## Resumen

Kimi-VL-A3B-Instruct es un modelo de lenguaje y vision (VLM) de arquitectura Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Se trata de la variante "Instruct" de la familia Kimi-VL, disenada para percepcion multimodal eficiente, comprension de contexto largo, OCR, video y uso como agente. El modelo completo tiene 16B parametros totales, pero solo activa aproximadamente 3B por token (2.8B en el decodificador de lenguaje mas 0.4B en el codificador visual), lo que lo posiciona como una alternativa eficiente a VLMs densos de 7B-12B.

La relevancia del modelo radica en su combinacion de eficiencia computacional y capacidades avanzadas: ventana de contexto de 128K tokens, codificador visual de resolucion nativa (MoonViT) y un rendimiento que, segun la model card, compite con GPT-4o-mini, Qwen2.5-VL-7B y Gemma-3-12B-IT en tareas de percepcion, OCR, video largo y agentes. La ficha que nos ocupa corresponde a un repositorio "staging" alojado por el usuario enhasasuzu, que replica el modelo oficial de Moonshot AI bajo licencia MIT.

El repositorio analizado no anade informacion tecnica propia mas alla de la model card heredada del modelo oficial. No registra descargas ni interacciones, y su interes practico es limitado frente al repositorio oficial `moonshotai/Kimi-VL-A3B-Instruct`, que es la referencia canonica para descarga y uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language: decodificador MoE + codificador visual MoonViT de resolucion nativa + proyector MLP |
| Parametros totales | 16B |
| Parametros activos | ~3B (2.8B LLM + 0.4B vision tower) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

Kimi-VL emplea un decodificador de lenguaje con arquitectura Mixture-of-Experts sobre la base de Moonlight-16B-A3B, combinado con un codificador visual de resolucion nativa denominado MoonViT y un proyector MLP que alinea las representaciones visuales con el espacio del lenguaje. El uso de MoonViT permite procesar imagenes de alta resolucion sin reescalado agresivo, lo que resulta clave para tareas de OCR y comprension de documentos. La activacion dispersa del MoE reduce el coste de inferencia manteniendo la capacidad del modelo completo.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la variante Instruct. Si se menciona que la variante Thinking se desarrollo mediante SFT con cadenas de razonamiento largas (long CoT) y aprendizaje por refuerzo, pero esos detalles no se trasladan necesariamente a esta variante Instruct. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes, multiples imagenes y video.
- Comprension de documentos largos y contexto extendido de hasta 128K tokens (evaluado en MMLongBench-Doc y LongVideoBench).
- OCR y comprension de imagenes de alta resolucion gracias al codificador MoonViT de resolucion nativa.
- Razonamiento matematico sobre contenido visual (MathVista, MathVision en la variante Thinking).
- Comprension de video, incluyendo video largo (VideoMMMU, LongVideoBench).
- Capacidades de agente multimodal: interaccion multi-turno, uso de interfaz grafica y grounding (ScreenSpot-Pro, OSWorld).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" (cadena de razonamiento larga): solo en la variante Kimi-VL-A3B-Thinking, no en esta variante Instruct.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede procesar facturas, formularios e informes escaneados a alta resolucion con MoonViT y devolver texto estructurado, aprovechando su buen rendimiento en OCR e InfoVQA.
- Analisis de video largo para monitorizacion o resumen: con 128K de contexto y capacidad de video, puede resumir grabaciones extensas, extraer eventos y responder preguntas sobre segmentos concretos (LongVideoBench 64.5).
- Agente de automatizacion de interfaz grafica: su rendimiento en ScreenSpot-Pro (34.5) y OSWorld lo hace adecuado para agentes que interpretan capturas de pantalla y ejecutan acciones multi-paso sobre aplicaciones.
- Asistencia en educacion STEM: resolucion de problemas de nivel universitario con imagenes de diagramas, grafos y ecuaciones, usando la variante Thinking para tareas de matematicas complejas.
- Moderacion y analisis de contenido visual a escala: al activar solo ~3B parametros por token, el coste por inferencia es menor que el de VLMs densos de tamano similar, lo que facilita el despliegue en pipelines de alto volumen.
- Soporte a personas con discapacidad visual: descripcion de imagenes y lectura de texto en fotografias o capturas, con capacidad de mantener conversaciones multi-turno sobre el contenido visual.
- Analisis de documentos tecnicos y scientificos con multiples figuras: comprension multi-imagen para comparar graficos, tablas y diagramas dentro de un mismo contexto largo.

## Benchmarks y rendimiento

Datos extraidos de la model card del modelo oficial (variante Instruct):

| Benchmark | GPT-4o | GPT-4o-Mini | Qwen2.5-VL-7B | Gemma3-12B-IT | DeepSeek-VL2 | Kimi-VL-A3B-Instruct |
|---|---|---|---|---|---|---|
| MMMU-Val (Pass@1) | 69.1 | 60.0 | 58.6 | 59.6 | 51.1 | 57.0 |
| VideoMMMU (Pass@1) | 61.2 | no disponible | 47.4 | 57.2 | 44.4 | 52.6 |
| MMVU-Val (Pass@1) | 67.4 | 61.6 | 50.1 | 57.0 | 52.1 | 52.2 |
| LongVideoBench | no disponible | no disponible | no disponible | no disponible | no disponible | 64.5 |
| MMLongBench-Doc | no disponible | no disponible | no disponible | no disponible | no disponible | 35.1 |
| InfoVQA | no disponible | no disponible | no disponible | no disponible | no disponible | 83.2 |
| ScreenSpot-Pro | no disponible | no disponible | no disponible | no disponible | no disponible | 34.5 |

La model card tambien cita, para la variante Thinking, MMMU 61.7, MathVision 36.8 y MathVista 71.3. No se han publicado en la informacion disponible resultados adicionales de benchmarks para esta variante Instruct mas alla de los recogidos en la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 16B parametros en FP16 requiere aproximadamente 32 GB de VRAM para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits rondaria 16-18 GB y en 4 bits unos 9-10 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 40GB o H100 80GB permitirian inferencia comoda en FP16; una RTX 4090 (24 GB) requeriria cuantizacion.
- Cabe en GPU de consumo: previsiblemente si con cuantizacion (RTX 4090, RTX 3090), aunque no hay datos oficiales de soporte ni de cuantizaciones publicadas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | MMMU-Val |
|---|---|---|---|---|---|
| Kimi-VL-A3B-Instruct | 16B | ~3B | 128K | MIT | 57.0 |
| Qwen2.5-VL-7B | 8B | denso (7.6B+0.7B) | no disponible en la info | no disponible en la info | 58.6 |
| Gemma3-12B-IT | 12B | denso (12B+0.4B) | no disponible en la info | no disponible en la info | 59.6 |
| DeepSeek-VL2 | 28B | 4.1B+0.4B | no disponible en la info | no disponible en la info | 51.1 |

Kimi-VL-A3B-Instruct ofrece el menor numero de parametros activos de la comparativa junto con DeepSeek-VL2, y mantiene un rendimiento en MMMU cercano a modelos densos de mayor tamano, ademas de una ventana de contexto de 128K explicita.

## Limitaciones y advertencias

- El repositorio analizado es un "staging" no oficial de un tercero; para uso en produccion debe utilizarse el repositorio oficial `moonshotai/Kimi-VL-A3B-Instruct`.
- No hay informacion sobre sesgos del modelo en la documentacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos multimodales; no se han publicado evaluaciones de fidelidad factual especificas.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino no esta garantizado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos no controlados.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Moonlight-16B-A3B y de los datos de entrenamiento originales.
- No se dispone de datos sobre cuantizaciones oficiales, soporte en motores de inferencia alternativos ni latencias medidas.
- La variante Instruct no incorpora el modo de razonamiento largo de la variante Thinking; para tareas matematicas complejas puede ser preferible esta ultima.

## Enlaces

- Repositorio analizado: https://huggingface.co/enhasasuzu/Kimi-VL-A3B-Instruct-staging
- Modelo oficial: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Variante Thinking: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Informe tecnico (arXiv): https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Demo web: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B/
- Codigo del procesador: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct/blob/main/processing_kimi_vl.py
