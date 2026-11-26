# bhismaperkasa/gemma-4-E2B-it-stensil-id

## Resumen

Gemma 4 E2B it stensil id es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT publicado por el usuario bhismaperkasa sobre el modelo base `unsloth/gemma-4-E2B-it`. El adaptador se ha afinado sobre un corpus de 250 relatos en indonesio de temática adulta y escritura creativa, en primera persona, con instrucción explícita de cerrar cada texto con la marca `TAMAT`. El repositorio combina los pesos del adaptador en safetensors con versiones fusionadas y cuantizadas en GGUF para su uso en llama.cpp, LM Studio y aplicaciones móviles.

El modelo base pertenece a la familia Gemma de Google, distribuida en formato instruction-tuned. Según los metadatos del repositorio, el checkpoint completo declarado en safetensors ronda los 4.650 millones de parámetros, aunque el adaptador LoRA en sí es de rango 16 (r=16, alpha=16) y no modifica la arquitectura subyacente. El repositorio ocupa 9,5 GB e incluye tanto el adaptador como las versiones cuantizadas Q4_K_M y Q8_0, además de un proyector multimodal `mmproj.gguf` para entrada de imágenes.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de fine-tuning de bajo coste sobre un modelo abierto; por otro, sirve de advertencia sobre las limitaciones de licencia y de contenido de los derivados de Gemma, así como sobre la escasa trazabilidad de los adaptadores publicados de forma individual. No se dispone de información sobre el pipeline, la licencia declarada ni resultados de evaluación en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, modelo base); adaptador LoRA de rango 16 sobre el modelo base |
| Parametros totales | 4.647.450.147 (checkpoint completo declarado en safetensors); adaptador LoRA con r=16, alpha=16 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (orientado a movil, 8-12 GB de RAM) y Q8_0 (calidad superior, portatil/sobremesa); safetensors del adaptador |
| Idiomas soportados | indonesio (id); el modelo base es multilingue, pero el adaptador solo declara id |
| Licencia | no disponible en los metadatos; la model card indica que es un derivado de Gemma y queda sujeta a los Gemma Terms of Use |
| Formato de pesos | safetensors (adapter_model.safetensors, adapter_config.json), GGUF (Q4_K_M, Q8_0, mmproj) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador PEFT de tipo LoRA con rango 16 y alpha 16, entrenado sobre el checkpoint instruction-tuned `unsloth/gemma-4-E2B-it`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de "250 relatos adultos en indonesio", ni si se aplicaron etapas de RLHF, DPO o preferencias. Tampoco se documentan hiperparámetros de entrenamiento, duración, hardware utilizado ni estrategia de enmascarado de pérdida.

La innovación técnica del repositorio no está en la arquitectura, sino en el empaquetado: se ofrecen pesos fusionados y cuantizados en GGUF para su despliegue en llama.cpp, LM Studio, PocketPal y ChatterUI, junto con un proyector multimodal `mmproj.gguf` que solo es necesario si se quiere usar entrada de imagen. El adaptador en safetensors se puede cargar con la librería PEFT sobre el modelo base, aunque no se detalla la versión de transformers compatible ni la configuración de tokenizer.

## Capacidades

- Generación de texto creativo en indonesio, con estilo en primera persona y registro coloquial, según el system prompt recomendado por el autor.
- Escritura de relatos de temática adulta con instrucción explícita de contenido no censurado, limitada a personajes adultos.
- Cierre consistente de cada texto con la marca `TAMAT` en la última línea, si se respeta el system prompt.
- Uso del modelo base instruction-tuned subyacente: razonamiento, código y matemáticas heredados de Gemma 4 E2B it, aunque no evaluados en este adaptador.
- Entrada de imágenes a través del proyector `mmproj.gguf` en las versiones GGUF, siempre que el runtime lo soporte.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el adaptador declara únicamente indonesio; el comportamiento en otros idiomas no está documentado.

## Casos de uso

- Generación de ficción adulta en indonesio: el adaptador está entrenado específicamente para relatos en primera persona con un system prompt definido; se usaría cargando el GGUF Q4_K_M en llama.cpp o LM Studio y fijando el prompt del autor para obtener textos cerrados con `TAMAT`.
- Prototipado de escritura creativa en dispositivos móviles: la cuantización Q4_K_M está pensada para terminales con 8-12 GB de RAM mediante PocketPal o ChatterUI, lo que permite generar relatos sin conexión.
- Evaluación de fine-tuning LoRA de bajo rango: el repositorio sirve como ejemplo de adaptador r=16 sobre un modelo de ~4,6 mil millones de parámetros, útil para estudiar el efecto del rango y del dataset en el estilo de salida.
- Pruebas de consistencia de formato: el requisito de terminar con `TAMAT` permite medir la adherencia a instrucciones de formato en modelos pequeños, comparando Q4_K_M frente a Q8_0.
- Despliegue en portátil con Q8_0: para entornos de escritorio donde se prioriza la calidad sobre el tamaño, el GGUF Q8_0 se puede cargar en LM Studio o llama.cpp con mayor fidelidad respecto al adaptador original.
- Integración multimodal experimental: con `mmproj.gguf` se puede probar la combinación de entrada de imagen y generación de texto en runtimes compatibles, aunque el adaptador no documenta entrenamiento específico de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica Q4_K_M para dispositivos con 8-12 GB de RAM y Q8_0 para portátil o sobremesa.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el enfoque del autor es CPU/móvil mediante GGUF.
- Opciones de despliegue: llama.cpp, LM Studio, PocketPal, ChatterUI; el adaptador en safetensors requiere PEFT sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-stensil-id (este) | 4.647.450.147 (checkpoint completo) | no disponible | no disponible; sujeta a Gemma Terms of Use | Hugging Face, safetensors + GGUF | Adaptador LoRA r=16 para indonesio creativo adulto |
| unsloth/gemma-4-E2B-it (modelo base) | no disponible en esta ficha | no disponible | Gemma Terms of Use | Hugging Face | Modelo instruction-tuned sin el ajuste de estilo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre 250 relatos en indonesio de temática adulta; su comportamiento fuera de ese dominio y de ese idioma no está documentado y probablemente degrade la calidad.
- Riesgo de alucinación y de deriva de estilo: al ser un LoRA de rango 16 sobre un dataset pequeño, puede reproducir patrones del corpus de entrenamiento y fallar en instrucciones fuera del formato esperado.
- Contenido adulto explícito: el modelo está diseñado para generar material para adultos; su uso en productos dirigidos a menores o en entornos sin control de edad es inadecuado.
- La licencia no está declarada en los metadatos del repositorio; la model card remite a los Gemma Terms of Use, que imponen restricciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad ni evaluaciones independientes.
- No se documentan sesgos, evaluación de seguridad, filtros de contenido ni procedencia exacta del dataset de 250 relatos, lo que limita la auditabilidad.
- El proyector `mmproj.gguf` solo cubre entrada de imagen y no implica que el adaptador haya sido entrenado para tareas multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/bhismaperkasa/gemma-4-E2B-it-stensil-id
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
