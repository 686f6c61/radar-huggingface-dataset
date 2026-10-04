# Davizig10jojo/BlazerApex-Vision-Fusion

## Resumen

BlazerApex Vision Fusion es un modelo multimodal experimental de aproximadamente 1,88 mil millones de parámetros publicado por el usuario Davizig10jojo en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión de pesos (model merging) construida con MergeKit mediante SLERP jerárquico sobre Qwen/Qwen3.5-2B como modelo ancla, combinando seis checkpoints derivados del mismo backbone: destilaciones de razonamiento de Kimi y Claude Opus, variantes "Heretic" sin censura y merges orientados a razonamiento de alto rendimiento (Polaris).

El objetivo declarado por el autor es triple: conservar la supuesta capacidad de visión image-text-to-text del modelo base, heredar el razonamiento profundo de los checkpoints destilados y mejorar la fluidez en portugués brasileño mediante una fase de SFT ligera. El resultado se presenta como un modelo ligero apto para ejecución local en GPUs de consumo (RTX 3060/4060) o incluso en CPU con cuantización.

Su relevancia es fundamentalmente metodológica: ilustra el ecosistema actual de merges comunitarios sobre modelos pequeños, en el que se combinan checkpoints destilados y "desinhibidos" sin publicar métricas de evaluación. Es un artefacto de investigación con 19 descargas y ningún "like" en el momento de redactar esta ficha, sin benchmarks publicados y con varios indicios técnicos que conviene verificar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-2B; la etiqueta de arquitectura del repositorio es `qwen3_5_text`. El autor declara capacidad multimodal de visión, aunque no se documenta el codificador visual |
| Parámetros totales | 1.881.825.088 (~1,88 B), según los pesos safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el autor no la especifica; se heredaría del modelo base, sin confirmar) |
| Tipos de cuantización | No disponible en el repositorio: solo se publican pesos safetensors, sin variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Portugués (pt) e inglés (en). El español no figura entre los idiomas declarados |
| Licencia | Apache 2.0 (los pesos de los checkpoints fuente pueden estar sujetos a sus propias licencias) |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 3,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B: un transformer denso de ~1,88 B de parámetros. El modelo no se ha entrenado: es el resultado de una fusión de pesos con MergeKit usando SLERP jerárquico sobre seis checkpoints. La receta declarada es: `Qwen/Qwen3.5-2B` como ancla, `ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation` (razonamiento), `prithivMLmods/Qwen3.5-2B-Opus-Distilled-Heretic-Thinking-Multistage-SFT-v1.0` (pensamiento libre), `rikunarita/Qwen3.5-2B-Claude-Opus-4.6-high-resoning-Base-v2` (lógica avanzada), `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING` (sin censura) y `DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact` (alto rendimiento en razonamiento).

El proceso consta de dos fases según la model card. La fase 1 es la fusión de pesos propiamente dicha. La fase 2 es un SFT "opcional / en curso" con el dataset `blazerapex_v4_final_think.jsonl` para anclar la identidad "BlazerApex" y reforzar el portugués brasileño; no se detalla el número de tokens, la composición del dataset, ni si se aplicaron RLHF o DPO. Tampoco se especifican innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). Conviene señalar dos inconsistencias verificables: la etiqueta de arquitectura del repositorio es de texto (`qwen3_5_text`) y el tamaño del repositorio (3,8 GB) es coherente con ~1,88 B de parámetros en bf16, lo que deja poco margen para un codificador visual adicional; además, el ejemplo de código de visión de la model card instancia `Qwen2_5_VLForConditionalGeneration`, una clase de la generación anterior y no de Qwen3.5.

## Capacidades

- Generación de texto conversacional en portugués brasileño e inglés.
- Razonamiento con modo "pensamiento" (thinking): el autor declara que hereda la capacidad de "pensar antes de responder" de las destilaciones de Kimi y Claude Opus.
- Razonamiento lógico y matemático: no hay evaluación publicada que lo respalde, solo la procedencia de los checkpoints fusionados.
- Visión image-text-to-text: declarada en la model card y en el pipeline del repositorio; no verificada y no respaldada por la etiqueta de arquitectura (`qwen3_5_text`).
- Modo sin censura: menor tasa de rechazos por filtros de seguridad, orientado a libertad creativa y analítica.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá del modo thinking.
- Multilingüismo: limitado a portugués e inglés según los metadatos; sin cobertura declarada de español.
- No se documentan capacidades de audio, vídeo ni otras modalidades.

## Casos de uso

- Asistencia conversacional local en portugués brasileño: con ~1,88 B de parámetros y pesos en bf16 de ~3,8 GB, el modelo puede ejecutarse en un portátil con GPU de gama media o en CPU cuantizada, sin enviar datos a la nube. Adecuado para atención al cliente en mercados lusófonos donde la privacidad sea un requisito.
- Análisis de documentos e imágenes escaneadas: si la capacidad de visión se confirma, el pipeline image-text-to-text permitiría extraer información de facturas, capturas o gráficos y devolverla en portugués. Requiere validación previa, dado que la torre visual no está documentada.
- Tutoría y explicaciones paso a paso: el modo thinking de las destilaciones subyacentes encaja con escenarios educativos donde se quiere ver el razonamiento intermedio antes de la respuesta final, con `temperature=0.3` como ajuste conservador sugerido por el autor.
- Prototipado e investigación sobre model merging: es un caso de uso directo del propio artefacto; sirve para estudiar cómo se comporta la combinación jerárquica SLERP de seis checkpoints con procedencias distintas (destilación de razonamiento, alineamiento sin censura, merges de alto rendimiento).
- Generación de contenido creativo sin filtros excesivos: para proyectos editoriales, de ficción o de escritura asistida en portugués donde los rechazos automáticos de otros modelos resulten limitantes. Exige revisión humana por el riesgo de contenido imprevisible.
- Investigación en seguridad y alineamiento: el carácter "uncensored" lo convierte en un sujeto de estudio útil para medir tasas de respuesta a peticiones sensibles y comparar contra el modelo base alineado. Debe hacerse en entornos controlados.
- Despliegue en hardware sin conexión: escenarios de campo, entornos aislados o dispositivos con recursos limitados donde no es viable un modelo de 7 B o superior, siempre que se asuma la pérdida de calidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y las búsquedas web no aportan datos adicionales. No es posible, por tanto, comparar el rendimiento declarado con el de otros modelos de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~3,8 GB solo de pesos; con caché KV y overhead de activaciones, del orden de 5 a 6 GB.
- VRAM estimada en int8: ~2 GB de pesos; en torno a 3-4 GB en total.
- VRAM estimada en 4 bits: ~1,1-1,3 GB de pesos; en torno a 2-3 GB en total. Estas cifras son estimaciones aritméticas a partir del recuento de parámetros, no mediciones publicadas.
- GPU recomendadas: RTX 3060 (12 GB) y RTX 4060 (8 GB) son suficientes incluso sin cuantizar; RTX 4090, A100 o H100 quedan muy sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí. El autor cita explícitamente RTX 3060/4060 como objetivo. No cabe sin cuantizar en GPUs con 4 GB o menos.
- Ejecución en CPU: viable con cuantización según el autor, sin especificar formato ni velocidad.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se publican pesos GGUF, por lo que Ollama o llama.cpp exigirían una conversión propia. El soporte en vLLM o TGI no está verificado ni documentado. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a procedencia, tamaño y licencia. Los comparadores naturales son el modelo base y los checkpoints fusionados, todos ellos derivados de Qwen3.5-2B.

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlazerApex Vision Fusion | ~1,88 B | No disponible | No disponible | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-2B (base) | ~2 B | No disponible | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation | ~2 B (según denominación) | No disponible | No disponible | No disponible | Hugging Face |
| DavidAU/Qwen3.5-2B-...-HERETIC-UNCENSORED-THINKING | ~2 B (según denominación) | No disponible | No disponible | No disponible | Hugging Face |
| DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact | ~2 B (según denominación) | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de información verificada sobre modelos comparables de otros fabricantes (por ejemplo, alternativas multimodales de ~2-4 B) en el material proporcionado, por lo que no se incluye esa comparación.

## Limitaciones y advertencias

- Modelo explícitamente experimental y "uncensored": el propio autor advierte de que puede generar contenido imprevisible. No es apto para producción sin supervisión humana.
- Ausencia total de benchmarks: no hay ninguna métrica que respalde las capacidades declaradas de razonamiento, lógica o visión.
- Capacidad de visión no verificada: la etiqueta de arquitectura del repositorio es de texto (`qwen3_5_text`), el tamaño de los pesos (3,8 GB para ~1,88 B de parámetros) es coherente con un modelo solo de texto en bf16 y el ejemplo de visión de la model card usa una clase de Qwen2.5-VL en lugar de una de Qwen3.5. Verifique el contenido real del repositorio antes de asumir entrada de imágenes.
- Riesgo de alucinación: inherente a un modelo de ~2 B, agravado por proceder de una fusión de pesos sin validación publicada. La destilación de razonamiento no garantiza corrección factual.
- Cobertura de idiomas restringida: solo portugués e inglés declarados. El español no está soportado oficialmente, por lo que su uso en castellano dará resultados degradados.
- Sesgos conocidos: no documentados por el autor. La eliminación de filtros de seguridad aumenta la probabilidad de sesgos y contenido dañino no mitigado.
- Licencia: los pesos del merge se publican como Apache 2.0, pero el propio autor advierte de que los checkpoints fuente pueden tener licencias distintas. Es necesario revisar cada repositorio de origen antes de un uso comercial.
- Longitud de contexto desconocida: impide dimensionar despliegues con documentos largos o conversaciones multi-turno extensas.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ publicados, lo que añade trabajo de conversión y validación si se quiere desplegar en llama.cpp u Ollama.
- Requiere `trust_remote_code=True`: implica ejecutar código remoto del repositorio, un riesgo de seguridad a evaluar en entornos corporativos.
- Madurez: 19 descargas, 0 "likes" y SFT en curso según la model card. No hay comunidad ni soporte detrás del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Davizig10jojo/BlazerApex-Vision-Fusion
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Davizig10jojo/datasets
- Perfil del autor en GitHub: https://github.com/Davizig10jojo/
- MergeKit (herramienta de fusión): https://github.com/arcee-ai/mergekit
- Checkpoints fuente citados en la model card:
  - https://huggingface.co/ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation
  - https://huggingface.co/prithivMLmods/Qwen3.5-2B-Opus-Distilled-Heretic-Thinking-Multistage-SFT-v1.0
  - https://huggingface.co/rikunarita/Qwen3.5-2B-Claude-Opus-4.6-high-resoning-Base-v2
  - https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
  - https://huggingface.co/DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact
