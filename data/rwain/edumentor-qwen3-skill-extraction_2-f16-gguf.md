# RWain/edumentor-qwen3-skill-extraction_2-F16-GGUF

## Resumen

`RWain/edumentor-qwen3-skill-extraction_2-F16-GGUF` es un adaptador LoRA convertido a formato GGUF (precisión F16) a partir del adaptador original `RWain/edumentor-qwen3-skill-extraction_2`. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL y está orientado a una tarea concreta: la extracción de habilidades (skill extraction) dentro del dominio educativo, a juzgar por el nombre del proyecto "edumentor".

El repositorio no es un modelo completo, sino un delta de pesos LoRA que debe aplicarse sobre un modelo base Qwen3 (por el identificador del autor y la nomenclatura del adaptador). El número de parámetros reportado en safetensors (17.432.576) corresponde a los tensores del adaptador, no al modelo completo, por lo que no debe interpretarse como el tamaño del modelo subyacente.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación de un autor individual, sin model card detallada, sin licencia declarada de forma explícita, sin benchmarks publicados y sin idiomas especificados. Es útil para quien quiera reproducir el pipeline de extracción de habilidades sobre un Qwen3 base usando llama.cpp con soporte de LoRA, pero no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Qwen3; arquitectura del base no especificada en la informacion disponible |
| Parametros totales | 17.432.576 (tensores del adaptador LoRA, no del modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3 sobre el que se aplique) |
| Tipos de cuantizacion | F16 (GGUF); el repositorio solo publica la variante F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | GGUF (adaptador LoRA en F16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con TRL mediante SFT sobre el adaptador `RWain/edumentor-qwen3-skill-extraction_2`, que a su vez se apoya en un modelo base de la familia Qwen3. La model card no detalla el rango del LoRA, las capas objetivo, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación adicionales (DPO, RLHF) más allá del SFT supervisado.

La única transformación documentada es la conversión del adaptador a GGUF mediante el espacio `gguf-my-lora` de ggml.ai, que empaqueta los pesos del LoRA en un fichero GGUF compatible con `llama-cli` y `llama-server` de llama.cpp. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre la composición del corpus educativo empleado para el fine-tuning.

## Capacidades

- Extracción de habilidades (skill extraction) en textos de dominio educativo, que es la tarea declarada por el nombre del adaptador.
- Generación de texto y razonamiento heredados del modelo base Qwen3, condicionados a la aplicación del adaptador sobre dicho base.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información del adaptador (depende del base).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no disponibles; el adaptador no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Extracción estructurada de competencias en plataformas educativas: aplicar el LoRA sobre un Qwen3 base para convertir descripciones de cursos, temarios o perfiles de egreso en listas normalizadas de habilidades, aprovechando el fine-tuning específico del dominio.
- Enriquecimiento de bolsas de empleo y ofertas formativas: procesar ofertas de trabajo o programas docentes para etiquetar habilidades y alimentar motores de recomendación entre formación y empleo.
- Construcción de grafos de competencias: usar la salida del adaptador como paso previo a la generación de ontologías de habilidades para currículos y rutas de aprendizaje personalizadas.
- Prototipado rápido en llama.cpp: desplegar `llama-server` con `--lora` para exponer un endpoint compatible con OpenAI (`endpoints_compatible`) y validar la extracción de habilidades en un pipeline interno sin infraestructura de GPU dedicada.
- Investigación sobre fine-tuning con TRL: reutilizar el adaptador como referencia para experimentos de SFT de bajo rango en tareas de extracción de información, comparando contra el base sin adaptar.
- Filtrado y anotación semiautomática de corpus educativos: preetiquetar grandes volúmenes de documentos con habilidades detectadas para revisión humana posterior, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa del orden de decenas de MB en F16 (17,4 M de parámetros), pero el consumo real lo determina el modelo base Qwen3 sobre el que se aplique.
- GPU recomendadas: no disponibles para el adaptador; para el base, depende de su tamaño (no especificado).
- ¿Cabe en GPU de consumo? El adaptador sí; el modelo base completo depende de su tamaño y cuantización, dato no disponible.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con `--lora`), y por herencia del ecosistema GGUF, herramientas compatibles con LoRA en GGUF (p. ej. Ollama si soporta el adaptador). No se documenta soporte en vLLM ni TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWain/edumentor-qwen3-skill-extraction_2-F16-GGUF | 17,4 M (adaptador LoRA) | no disponible | sin benchmarks | no disponible | Hugging Face, GGUF |
| RWain/edumentor-qwen3-skill-extraction_2 (adaptador original) | no disponible | no disponible | sin benchmarks | no disponible | Hugging Face |
| Qwen3 (modelo base de referencia) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo completo: es un adaptador LoRA que requiere un modelo base Qwen3 compatible; sin él no es utilizable.
- Licencia no declarada de forma explícita ("licence: license" en la model card), lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor o consultar el repo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de la extracción de habilidades.
- Sin idiomas declarados: no se puede garantizar el comportamiento en castellano u otros idiomas distintos del corpus de entrenamiento (no documentado).
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de documentación sobre el dataset y el proceso de evaluación.
- Sesgos potenciales derivados del corpus educativo utilizado en el SFT, no auditados ni descritos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- Solo se publica la variante F16 del adaptador; no hay cuantizaciones Q4/Q5/Q8 que reduzcan el peso del LoRA (aunque su tamaño es reducido).
- El pipeline no está declarado en Hugging Face y la fecha de creación (2026-11-25) es posterior a la fecha habitual de consulta, lo que sugiere un artefacto muy reciente o de procedencia a verificar.

## Enlaces

- Repositorio Hugging Face del adaptador GGUF: https://huggingface.co/RWain/edumentor-qwen3-skill-extraction_2-F16-GGUF
- Adaptador original: https://huggingface.co/RWain/edumentor-qwen3-skill-extraction_2
- Espacio GGUF-my-lora de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación del servidor llama.cpp (uso de LoRA): https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
