# BAJUKA/LLaVA-smollm3-3b-Tfull-s42-s2b

## Resumen

LLaVA-smollm3-3b-Tfull-s42-s2b es un checkpoint de investigación publicado por el usuario BAJUKA dentro de una cuadrícula de experimentos controlados que compara entrenamiento visión-lenguaje (VL) frente a entrenamiento puramente textual sobre la misma base de datos. El modelo parte del backbone HuggingFaceTB/SmolLM3-3B y se entrena con el framework LLaVA-NeXT, pero en esta variante concreta —la rama "T-full"— se eliminan los tokens `<image>` y `<video>` y el campo de imagen de cada ejemplo, de modo que solo se ajusta el modelo de lenguaje. Los pesos de la torre de visión y del proyector se conservan en el checkpoint con sus valores iniciales y no se utilizan en inferencia.

El propósito no es ofrecer un modelo listo para producción, sino aislar qué cambia el entrenamiento multimodal respecto a consumir exactamente el mismo texto en el mismo orden. Todas las ramas de la cuadrícula comparten mezclas de datos, orden de ejemplos para una semilla dada, ajustes de optimizador y un schedule de learning rate reiniciado; las únicas diferencias son los datos, el orden y qué módulos son entrenables. Esta rama corresponde a la etapa S2b (instruct) de la semilla 42, inicializada desde el checkpoint S2a de la misma rama.

El resultado es un artefacto de investigación de aproximadamente 3B parámetros (el repo ocupa 7,0 GB en safetensors), con licencia Apache 2.0 heredada de SmolLM3-3B, pensado para análisis comparativos y reproducción de experimentos, no para despliegue comercial sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) envuelto en `LlavaSmolLM3ForCausalLM` de LLaVA-NeXT; torre de visión SigLIP presente pero no usada en esta rama |
| Parámetros totales | Aproximadamente 3B (repo de 7,0 GB en safetensors; el campo de metadatos indica 538.528 tensores/entradas, no parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantización | No disponible (solo se publican pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible (heredados de SmolLM3-3B, no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en SmolLM3-3B, cargado mediante la clase `LlavaSmolLM3ForCausalLM` del repositorio LLaVA-NeXT-SmolLM3, que no forma parte de `transformers`. El checkpoint incluye la torre de visión SigLIP (`google/siglip-so400m-patch14-384`) y el proyector, pero en esta rama "text twin" ambos permanecen con sus pesos iniciales y no intervienen en el cómputo: solo se entrena `mm_language_model`. El tokenizador se configura con la plantilla de chat de SmolLM3 en modo no-thinking (`enable_thinking=False`).

El entrenamiento corresponde a la etapa S2b (instruct) y se inicializa desde el checkpoint S2a de la misma rama y semilla. La mezcla de datos es la versión textual de INS-750K: `instruct_700k_v2_text` (697.850 ejemplos) más `language_50k_v2` (49.956 ejemplos), con hashes SHA-256 documentados para los ficheros JSONL y el YAML de configuración. Se ejecutó una época completa (5.843 de 5.843 pasos, batch global 128, LR 1e-05 con schedule coseno y warmup ratio 0,03, precisión bfloat16, longitud máxima 8192) sobre 4 GPU H100 de 80 GB con DeepSpeed ZeRO-3. La pérdida de entrenamiento bajó de 1,803 a 1,347 (media de los últimos 50 pasos finitos registrados: 1,215) sin pérdidas no finitas en los 5.843 pasos. El repositorio incluye `trainer_state.json` con el historial completo de pérdida, norma del gradiente y LR por paso. No se aplicó early stopping ni selección de checkpoint: cada etapa ejecuta exactamente una época.

## Capacidades

- Generación de texto conversacional en formato chat mediante la plantilla de SmolLM3 (modo no-thinking).
- Razonamiento y respuesta a instrucciones, derivados del ajuste sobre `instruct_700k_v2_text`.
- Procesamiento de lenguaje natural general a partir de `language_50k_v2`.
- Contexto de hasta 8192 tokens para conversaciones y documentos largos.
- Capacidades multilingües: no documentadas explícitamente en la model card; dependen del backbone SmolLM3-3B.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión: la torre SigLIP está presente en el checkpoint pero no se usa en esta rama; el modelo no procesa imágenes de forma efectiva.
- Modo thinking: desactivado en el formato de prompt de entrenamiento.

## Casos de uso

- Reproducción de experimentos controlados: cargar la rama T-full junto con su gemela VL-full y comparar curvas de pérdida y comportamiento en el mismo conjunto de textos para aislar el efecto del entrenamiento multimodal.
- Análisis de atribución de mejoras: usar el checkpoint como línea base textual en estudios que midan cuánto aporta la torre de visión frente a consumir el mismo corpus sin imágenes.
- Evaluación de metodología de entrenamiento: inspeccionar `trainer_state.json` para estudiar estabilidad del entrenamiento (norma de gradiente, LR, pérdidas) en una configuración ZeRO-3 con 4×H100.
- Generación de texto conversacional en entornos de investigación: servir el modelo con la plantilla de chat de SmolLM3 para pruebas internas de calidad de respuesta sobre instrucciones.
- Fine-tuning posterior como punto de partida: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de inicialización para experimentos académicos que necesiten un modelo de 3B ya ajustado a instrucciones en texto.
- Estudio de sesgos y alucinación en modelos pequeños: comparar las salidas de esta rama con las de la rama VL para detectar si el entrenamiento multimodal mitiga o agrava determinados patrones de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento: pérdida final 1,347 (media de los últimos 50 pasos finitos: 1,215) partiendo de 1,803, con 0 pérdidas no finitas en 5.843 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6-7 GB para los pesos de un modelo de 3B, más overhead de activaciones y caché KV para contexto de 8192 tokens.
- GPU recomendadas: H100 80GB o A100 40/80GB para entrenamiento o serving de referencia; el entrenamiento documentado usó 4×H100 80GB con DeepSpeed ZeRO-3.
- GPU de consumo: cabe en GPUs con 12-16 GB o más (RTX 4090, RTX 4080, RTX 3090) en bfloat16 o cuantización de 8 bits; en 4 bits cabría en GPUs de 8 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: no es compatible con `transformers` estándar; requiere clonar la carpeta `LLaVA-NeXT-SmolLM3` del repositorio ROI y añadirla a `PYTHONPATH`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el uso en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LLaVA-smollm3-3b-Tfull-s42-s2b | ~3B | 8192 | Apache 2.0 | Hugging Face (26 descargas) | Rama textual de un grid controlado; requiere código LLaVA-NeXT-SmolLM3 |
| SmolLM3-3B (HuggingFaceTB) | ~3B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base; soportado nativamente por `transformers` |
| LLaVA-smollm3-3b-Tfull-s42-s2a | ~3B | 8192 | Apache 2.0 | Hugging Face | Checkpoint S2a de la misma rama; etapa previa del grid |
| Rama VL-full del mismo grid | ~3B | 8192 | Apache 2.0 | No disponible en esta búsqueda | Contraparte multimodal con tokens de imagen; comparación directa del experimento |

## Limitaciones y advertencias

- Artefacto de investigación: no es una versión ajustada ni alineada en seguridad; hereda las limitaciones de HuggingFaceTB/SmolLM3-3B.
- El checkpoint S2b es una rama legítima del grid, no un "mejor" checkpoint: no hubo early stopping ni selección, cada etapa ejecuta una época completa.
- La torre de visión y el proyector están presentes pero no entrenados ni usados; no debe tratarse como un modelo multimodal funcional.
- No se publican estados de optimizador, DeepSpeed ni RNG: son pesos de inferencia.
- Riesgo de alucinación inherente a un modelo de 3B ajustado sobre datos instructivos; no se documentan evaluaciones de fidelidad.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento y del backbone.
- Idiomas: no se especifica la cobertura lingüística; el uso en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de seguridad se recomienda validación previa en producción.
- Dependencia de código externo no incluido en `transformers`, lo que complica la integración en pipelines estándar.
- Con solo 26 descargas y 0 likes, la comunidad de validación es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BAJUKA/LLaVA-smollm3-3b-Tfull-s42-s2b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Torre de visión SigLIP: https://huggingface.co/google/siglip-so400m-patch14-384
