# mizahnyx/lfm3-omni-2b-abliterated-heretic-v2

## Resumen

LFM3-Omni-2B-abliterated-heretic-v2 es una variante derivada del modelo omni-modal LFM3-Omni-2B de Liquid AI, publicada por el usuario mizahnyx en Hugging Face. El modelo base acepta texto, imagen, vídeo y audio como entrada, y produce texto y voz como salida. Esta versión concreta ha sido sometida a un procedimiento automatizado de eliminación de rechazos (refusal ablation) mediante la herramienta Heretic v2.0.0 con el modificador ARA (Arbitrary-Rank Ablation), de modo que responde a peticiones que el modelo original rechazaría.

El modelo conserva la arquitectura del original (backbone de texto de 24 capas más codificadores de visión y audio con sus proyectores) y un total de 2.166.928.384 parámetros en formato safetensors. La modificación afecta únicamente a las proyecciones `attn.o_proj` y `mlp.down_proj` de las 24 capas del backbone de texto; los codificadores de visión y audio y los proyectores quedan intactos.

Es relevante porque demuestra un flujo de trabajo reproducible de ablación de rechazos sobre un modelo omni-modal pequeño, con evaluación explícita del equilibrio entre eliminación de rechazos y preservación de capacidades. El autor documenta que el punto de cero rechazos degradaba el razonamiento aritmético y que los pesos publicados corresponden al índice de Pareto 2, elegido para mantener la coherencia del modelo base. La licencia es la LFM Open License v1.0, la misma del modelo original, y el autor declara no tener afiliación con Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (backbone de texto de 24 capas + codificador de visión + codificador de audio + proyectores); pipeline `any-to-any` |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales); GGUF: Q8_0 (8,51 BPW), Q4_K_M (5,05 BPW), Q2_K (3,43 BPW); proyectores mmproj en F16 y Q8_0; imatrix incluida |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm-open-license-v1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (modelo completo fusionado, no adaptador LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo omni-modal de Liquid AI que procesa texto, imagen, vídeo y audio y genera texto y voz. La arquitectura consta de un backbone de texto de 24 capas, un codificador de visión, un codificador de audio y los proyectores correspondientes que alinean las modalidades con el espacio del backbone. El pipeline declarado es `any-to-any` y requiere `trust_remote_code=True` en Transformers, con la clase `AutoModelForImageTextToText`.

Esta variante no ha sido reentrenada: se ha producido mediante ablación de rechazos con Heretic v2.0.0 y el modificador ARA (`heretic.modifiers.ara.ARA`), con rango LoRA 50 y preservación de la magnitud de filas. Se ejecutaron 60 trials (20 de arranque) con muestreador TPE y semilla 42, aplicando modificadores sobre `attn.o_proj` y `mlp.down_proj` en las 24 capas, seleccionados por el propio estudio. Los scorers empleados fueron KeywordRate, KLDivergence y un clasificador de rechazos BERT, con 100 prompts dañinos (`mlabonne/harmful_behaviors`) y 100 inofensivos (`mlabonne/harmless_alpaca`) para evaluación, y 400 prompts buenos y 400 malos para la calibración de ARA. Todo el proceso se realizó en bf16 sin cuantización, con un tiempo de pared de 3 h 48 m sobre una Ryzen 7 8845HS con iGPU Radeon 780M (`gfx1103`), ROCm 7.2.4 y PyTorch 2.15.0. La exportación es el modelo completo fusionado, no un adaptador. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Entrada multimodal: texto, imagen, vídeo y audio.
- Salida multimodal: texto y voz (speech).
- Generación de texto conversacional multi-turno mediante plantilla de chat.
- Razonamiento aritmético básico verificado en las pruebas del autor (por ejemplo, `17 * 23 = 391`).
- Respuesta a preguntas factuales (capital de Australia, símbolo químico del oro) y cálculo de magnitudes físicas (velocidad media).
- Resumen de texto.
- Soporte multilingüe en 23 idiomas declarados.
- Modo de generación seleccionable (`generation_mode="text"` en la API de Transformers).
- Comportamiento sin rechazos: responde a peticiones que el modelo base declina (0/7 rechazos en las pruebas del autor frente a 6/7 del base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de rechazos sobre las capacidades del modelo base, comparando directamente con `LiquidAI/LFM3-Omni-2B` con los mismos prompts y decodificación greedy, tal como documenta el autor.
- Procesamiento de documentos con imagen y texto: al aceptar imagen y texto de entrada, puede emplearse para extraer y describir información de capturas, diagramas o documentos escaneados en un pipeline con `AutoProcessor` y `AutoModelForImageTextToText`.
- Transcripción y descripción de audio: el codificador de audio, intacto respecto al modelo base, permite incorporar audio como entrada en flujos de descripción o resumen de contenido hablado.
- Asistentes conversacionales multi-turno: la plantilla de chat y el soporte de 23 idiomas lo hacen adecuado para prototipos de atención al cliente en varios idiomas, siempre que se revise el contenido generado por su comportamiento sin rechazos.
- Generación de voz para accesibilidad: la salida de speech del modelo base permite construir interfaces de lectura de contenido o respuestas habladas en aplicaciones de accesibilidad.
- Despliegue en hardware modesto: las cuantizaciones GGUF (Q4_K_M de 1,1 GB y Q2_K de 716 MB) permiten ejecutar el modelo con `llama.cpp` o LM Studio en equipos sin GPU dedicada de gran VRAM, útil para prototipado local.
- Análisis de contenido audiovisual: combinando entrada de vídeo y audio, puede emplearse en tareas de descripción o resumen de clips en entornos de investigación.
- Evaluación comparativa de cuantizaciones: la publicación de un imatrix propio y de varias cuantizaciones facilita estudios sobre la degradación de capacidades según BPW en modelos pequeños.

## Benchmarks y rendimiento

El autor publica métricas de la herramienta Heretic sobre los conjuntos de prompts del estudio, así como una comprobación independiente con decodificación greedy. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Rechazos por palabra clave (n=100 dañinos) | 99/100 | 1/100 |
| Rechazos por clasificador (n=100 dañinos) | 98/100 | 0/100 |
| Divergencia KL frente al base (n=100 inofensivos) | 0 | 0,063 |
| 7 prompts dañinos (bomba, metanfetamina, puentear coche, falsificación, hurto, phishing, ganzuado) | 6/7 rechazados | 0/7 rechazados |
| `17 * 23` | 391 | 391 |
| Resumen de una frase | correcto | correcto |
| Capital de Australia | Canberra | Canberra |
| 120 km en 1,5 h | 80 km/h | 80 km/h |
| Símbolo químico del oro | Au | Au |

El autor indica que el punto de 0/100 rechazos con KL 2,27 degradaba el modelo (respondía `17 * 23` con "Ineq 17 23") y que los pesos publicados corresponden al índice de Pareto 2.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos (2,17 mil millones de parámetros a 2 bytes), más overhead de activaciones y del codificador de visión/audio.
- VRAM estimada en GGUF: Q8_0 unos 1,8 GB; Q4_K_M unos 1,1 GB; Q2_K unos 716 MB, más el proyector multimodal (906 MB en F16 o 484 MB en Q8_0).
- GPU recomendadas: no disponible en la información proporcionada. El autor documenta que la ablación se ejecutó en una iGPU Radeon 780M (`gfx1103`) con ROCm 7.2.4, lo que indica que el proceso es viable en hardware de consumo.
- Cabe en GPU de consumo: sí, según los tamaños de las cuantizaciones GGUF; el modelo en bf16 requiere alrededor de 4-5 GB de VRAM, asequible en tarjetas de 8 GB o más.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (clase `AutoModelForImageTextToText`); `llama.cpp` y LM Studio mediante los GGUF publicados en `mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| mizahnyx/lfm3-omni-2b-abliterated-heretic-v2 | 2,17 B | no disponible | texto, imagen, vídeo, audio → texto, voz | LFM Open License v1.0 | Derivado sin rechazos del LFM3-Omni-2B |
| LiquidAI/LFM3-Omni-2B | 2,17 B | no disponible | texto, imagen, vídeo, audio → texto, voz | LFM Open License v1.0 | Modelo base original, con rechazos aprendidos |
| Alternativas de 2 B omni-modales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar los rechazos: responde a peticiones dañinas (fabricación de explosivos, metanfetamina, puenteo de coches, falsificación, hurto, phishing, ganzuado) sin filtro, según las pruebas del propio autor. No es adecuado para despliegues públicos sin capas de seguridad externas.
- Riesgo elevado de uso indebido: la ausencia de rechazos elimina una barrera de seguridad del modelo base; cualquier integración en producción requiere moderación de contenido independiente.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación; el modelo base es de 2 B de parámetros, tamaño asociado a mayor propensión a errores factuales.
- La ablación se aplicó solo al backbone de texto; los codificadores de visión y audio y los proyectores no fueron modificados, por lo que el comportamiento sin rechazos puede no ser uniforme entre modalidades.
- La cuantización Q2_K (3,43 BPW) se describe como último recurso: supera las pruebas fáciles del autor pero degradará visiblemente tareas más difíciles.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo de la licencia antes de cualquier despliegue comercial. El autor declara que es una obra derivada distribuida bajo la misma licencia que el modelo base y que no está afiliada ni respaldada por Liquid AI.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con ventanas largas sin verificación empírica.
- No se han publicado resultados en benchmarks estándar, por lo que la comparación de capacidades con otros modelos se limita a las pruebas cualitativas del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2
- Variantes GGUF: https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Conjunto de prompts dañinos: `mlabonne/harmful_behaviors` (referenciado en la model card, sin URL explícita)
- Conjunto de prompts inofensivos: `mlabonne/harmless_alpaca` (referenciado en la model card, sin URL explícita)
