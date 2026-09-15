# Kris0404/social-story-gemma4-e2b-v5

## Resumen

El modelo `Kris0404/social-story-gemma4-e2b-v5` es una adaptación de dominio muy específico sobre `google/gemma-4-E2B-it`, publicada por Kris Yu (usuario Kris0404) para la aplicación iOS Mystoria. No es un modelo de propósito general: es un generador de "Social Stories" en primera persona para niños autistas, siguiendo los criterios Social Stories 10.4 de Carol Gray, a partir de un perfil infantil de diez campos (nombre, edad, nivel de lenguaje L1-L4, notas de comunicación, nivel de apoyo, intereses, situación, conducta objetivo, tipo de historia y personas acompañantes). Su relevancia está en el nicho: generación estructurada, con contrato de salida JSON estricto, ejecutada íntegramente en el dispositivo (iPhone/iPad) sin enviar datos de menores a la nube.

Técnicamente es una extracción solo-texto del modelo base (se eliminan las torres de visión y audio) afinada con LoRA r16 y posteriormente alineada con rejection sampling on-policy y DPO balanceado por longitud. El artefacto publicado está cuantizado para MLX en precisión mixta afín (6 bits en capas lineales, 8 bits en el embedding de tokens, 4 bits en la tabla de embeddings por capa) y ocupa 3,453 GB en safetensors, con 4.647.449.891 parámetros totales según los pesos publicados. El pico de memoria MLX medido con el prompt real más una historia generada es de 4,27 GB, lo que lo sitúa en el rango de iPhone/iPad con 8 GB de RAM o más.

La evaluación publicada (410 prompts de validación retenidos, juez GPT, comprobación de JSON y 11 reglas) da un 71,7% de cumplimiento en decodificación greedy, prácticamente idéntico al 71,5% de la referencia bf16 sin cuantizar. Se trata de un modelo de uso asistencial como borrador: cada historia debe ser revisada y editada por un adulto antes de usarse, y el propio autor lo declara como ayuda a la redacción, no como sustituto profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `google/gemma-4-E2B-it`, con extracción solo-texto (eliminación de las torres de visión y audio); se conservan claves de atención shared-KV para `mlx-swift-lm` 3.31.x. No se detalla más en la información disponible |
| Parametros totales | 4.647.449.891 (según los pesos safetensors publicados) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine: capas lineales 6 bits g64; embedding de tokens 8 bits g64; tabla de embeddings por capa 4 bits g32; `per_layer_model_projection` mantenido en fp16. Se menciona como referencia externa una cuantización GGUF de 4 bits de un tercero, no publicada en este repositorio |
| Idiomas soportados | inglés (`en`) únicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX cuantizado), `model.safetensors` de 3,453 GB, sha256 `8f2e5848bad8f870860be57ad148059f2ea277bee36f462857768741cb5a13bc`; incluye `chat_template.jinja`; adaptador LoRA `adapter_e2b_dpo1` (sha256 `152889a5c158f4a23dce964926a075e0ed5f1314eceb9c70a1fb69e7d7536d36`) |
| Tamano del repositorio | 3,5 GB |
| Libreria | mlx |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es `google/gemma-4-E2B-it`, del que se hace una extracción solo-texto eliminando las torres de visión y audio, lo que reduce el modelo a entrada y salida de texto. Sobre esa base se aplica un ajuste supervisado con LoRA de rango 16 sobre 9.025 historias filtradas por reglas y por juez. Después se realiza una segunda fase de alineación: rejection sampling on-policy seguido de DPO balanceado por longitud con 2.908 pares. El adaptador resultante se denomina `adapter_e2b_dpo1`. El entrenamiento lo llevó a cabo YnnJ456 (cofundador de Mystoria) dentro del pipeline `gemma4_e2b_smoke`, y la conversión y evaluación para MLX las realizó Kris Yu.

La innovación reseñable no está en la arquitectura del transformer, sino en el empaquetado para despliegue en dispositivo y en el contrato de prompt. La cuantización es mixta y declarada capa por capa en `config.json["quantization"]`: 6 bits con grupo 64 en capas lineales, 8 bits con grupo 64 en el embedding de tokens, 4 bits con grupo 32 en la tabla de embeddings por capa, dejando `per_layer_model_projection` en fp16. Se conservan las claves de atención shared-KV que espera `mlx-swift-lm` 3.31.x. El modelo exige exactamente el system prompt y la plantilla de usuario de `gemma4_e2b_smoke/deploy/story_service.py` (contrato de prompt `student-v5-2026-09`), renderizados con el `chat_template.jinja` incluido (turno de sistema, turno de usuario, `add_generation_prompt=True`), y produce un único objeto JSON `{"title": ..., "pages": [{"page_number": n, "text": ...}]}` de entre 8 y 12 páginas.

## Capacidades

- Generación de texto en inglés con estructura de salida fija: un objeto JSON con título y entre 8 y 12 páginas numeradas.
- Redacción de Social Stories en primera persona conforme a los criterios de Carol Gray Social Stories 10.4, a partir de un perfil de diez campos del niño.
- Adaptación del registro y la complejidad al nivel de lenguaje declarado (L1 a L4) y al nivel de apoyo indicado en el perfil.
- Incorporación de contexto personalizado: intereses, personas de referencia y acompañantes, situación y conducta objetivo incluidos en el prompt.
- Cumplimiento de un contrato de prompt estricto: solo funciona correctamente con el system prompt y la plantilla de usuario especificados.
- Ejecución on-device: inferencia local mediante MLX, sin dependencia de API externa.
- Capacidades multimodal eliminadas: no hay visión ni audio en este artefacto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Comportamiento agéntico o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no (solo inglés).
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Generación de borradores de Social Stories dentro de la app Mystoria: es el caso de uso previsto por el autor. El modelo recibe el perfil de diez campos y devuelve el JSON con 8-12 páginas listo para renderizar en la interfaz, con revisión y edición posteriores por parte del cuidador.
- Asistencia a cuidadores y familias: permite preparar en segundos un borrador adaptado a la situación concreta (por ejemplo, ir al dentista o compartir juguetes) que el adulto ajusta después, reduciendo el coste de redacción desde cero.
- Apoyo a terapeutas del lenguaje y ocupacionales: el profesional introduce nivel de lenguaje y notas de comunicación y obtiene material base que luego valida y adapta antes de la sesión.
- Despliegue totalmente offline en iPhone/iPad: al ejecutarse con MLX en el propio dispositivo, los datos del menor (nombre, edad, notas de comunicación) no salen del terminal, lo que simplifica el cumplimiento de normativa de protección de datos de menores.
- Generación con verificación automática en el bucle de la aplicación: la app aplica el mismo comprobador de reglas que se usó en el filtrado y marca como "needs review" los borradores que incumplen alguna de las 11 reglas verificadas.
- Investigación en generación con restricciones estructurales: es un caso de estudio útil de pipeline completo (LoRA SFT + rejection sampling + DPO) para un dominio estrecho con formato de salida rígido y validación automática.
- Base para replicar la receta en otros idiomas o dominios clínicos: el adaptador y el contrato de prompt documentados permiten reentrenar con el mismo esquema para otra lengua o para otras poblaciones, partiendo de una arquitectura de ~4,65 B parámetros.
- Pruebas de cuantización en Apple Silicon: el modelo sirve como banco de pruebas de cuantización mixta MLX (6/8/4 bits con distintos tamaños de grupo) midiendo el impacto en cumplimiento estructural, con una referencia bf16 conocida.

## Benchmarks y rendimiento

Evaluación publicada sobre 410 prompts de validación retenidos, con juez GPT y comprobación conjunta de JSON, 11 reglas y pase de juez:

| Modo de decodificacion | Cumplimiento | Detalle |
|---|---|---|
| greedy (MLX cuantizado 6 bits, este repositorio) | 71,7% (294/410) | JSON 410/410; reglas 409/410; W 113, F 2 |
| Referencia bf16 del adaptador (vLLM) | 71,5% | mismo juez y mismas comprobaciones |
| Mejor GGUF 4 bits de un tercero | 63,9% | mismo juez y mismas comprobaciones |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria pico medida en MLX con el prompt real más la generación de una historia: 4,27 GB.
- Dispositivos objetivo: iPhone y iPad con 8 GB de RAM o más. Existe un tier "lite" en la app que cubre dispositivos de 6 GB.
- Tamaño de descarga del repositorio: 3,5 GB (safetensors de 3,453 GB).
- Cabe en GPU de consumo para desarrollo, pero el artefacto publicado está en formato MLX y está pensado para Apple Silicon (unified memory), no para CUDA.
- GPU recomendadas para la ruta CUDA: no disponible; la única ejecución no-MLX documentada es la referencia bf16 evaluada con vLLM.
- Opciones de despliegue: MLX en Apple Silicon (incluido `mlx-swift-lm` 3.31.x, que requiere las claves de atención shared-KV incluidas); vLLM se cita únicamente para la referencia bf16. No se documentan despliegues con llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Cumplimiento (juez GPT, 410 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Kris0404/social-story-gemma4-e2b-v5` (este) | Adaptación de dominio cuantizada para MLX | 4.647.449.891 | no disponible | 71,7% greedy (JSON 410/410, reglas 409/410) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Adaptador bf16 de referencia (`adapter_e2b_dpo1`) | Mismo modelo sin cuantizar, evaluado con vLLM | no disponible | no disponible | 71,5% | apache-2.0 | No publicado como artefacto en este repositorio |
| GGUF 4 bits de un tercero | Cuantización alternativa del mismo modelo | no disponible | no disponible | 63,9% | no disponible | No disponible |
| `google/gemma-4-E2B-it` | Modelo base multimodal | no disponible | no disponible | no disponible (no evaluado con este juez) | apache-2.0 según la model card | HuggingFace (modelo base) |

No se conocen alternativas públicas comparables de generación de Social Stories conforme a los criterios de Carol Gray 10.4 con despliegue on-device; en la información disponible no hay otros modelos de esta categoría para contrastar.

## Limitaciones y advertencias

- Solo inglés. El modelo no está entrenado ni evaluado para otros idiomas, incluido el castellano.
- No es una herramienta clínica. El autor lo define explícitamente como ayuda a la redacción: cada historia debe ser revisada y editada por un adulto antes de su uso.
- Tasa de incumplimiento estructural no despreciable: en la mejor configuración publicada, 116 de 410 salidas (28,3%) no pasan todas las comprobaciones conjuntas de JSON, reglas y juez. La app mitiga esto marcando esos borradores como "needs review".
- Dependencia de un contrato de prompt exacto. Usar otro system prompt, otra plantilla o no aplicar `add_generation_prompt=True` puede degradar el formato de salida; el JSON de 8 a 12 páginas no está garantizado fuera de ese contrato.
- Riesgo de alucinación en contenido sensible: el modelo puede generar detalles inapropiados o poco realistas sobre la situación del menor. No se han publicado datos específicos de sesgo en la información disponible.
- Sesgos conocidos: no disponible. No hay evaluación de sesgos publicada.
- La cuantización está atada a MLX: los pesos publicados son safetensors en formato MLX con cuantización afín declarada capa por capa, y requieren `mlx-swift-lm` 3.31.x para las claves shared-KV. Portarlo a otros runtimes exige reconversión.
- Requiere hardware Apple con al menos 8 GB de RAM para el tier principal; en dispositivos de 6 GB solo se sirve el tier lite de la app.
- Licencia apache-2.0, que permite uso comercial, pero al derivar de `google/gemma-4-E2B-it` conviene verificar los términos aplicables del modelo base.
- Modelo sin validación externa: 0 descargas y 0 likes en el momento de los datos, sin evaluación independiente publicada.
- Longitud de contexto no documentada, lo que impide estimar el comportamiento con perfiles muy extensos o conversaciones multi-turno largas.

## Enlaces

- HuggingFace: https://huggingface.co/Kris0404/social-story-gemma4-e2b-v5
- Modelo base: `google/gemma-4-E2B-it` (no se proporciona URL específica en la información disponible)
- Pipeline de entrenamiento `gemma4_e2b_smoke` y fichero de despliegue `gemma4_e2b_smoke/deploy/story_service.py`: mencionados en la model card, sin URL disponible
- Aplicación Mystoria (app iOS): mencionada en la model card, sin URL disponible
- Criterios Social Stories 10.4 de Carol Gray: referenciados en la model card, sin URL disponible
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo (corresponden a sitios de ejercicios de idioma en neerlandés); no se incluyen.
