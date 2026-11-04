# Plaguekind/Qwen3.8-27B-Parasyte-Eye-GGUF

## Resumen

Parasyte Eye es un ajuste fino (fine-tune) del proyector de visión (vision tower) del modelo Qwen3-VL, empaquetado en formato GGUF para su uso con llama.cpp. No se trata de un modelo de lenguaje completo, sino de un componente `mmproj` de 461 millones de parámetros que se acopla a un "cerebro" Qwen3.8-27B (en este caso, el fine-tune sin censura HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive) para dotarlo de capacidad de lectura de imágenes. Lo desarrolla Plaguekind, en colaboración con Valkyrja Vinter, y su propósito declarado es corregir el comportamiento del proyector de visión original en escenas de combate y contenido NSFW, donde el modelo base tiende a "derivar" hacia descripciones genéricas.

La innovación técnica principal es el uso de un "leash" L2 aplicado en cada paso de entrenamiento contra los pesos iniciales, de modo que el ajuste queda acotado a una deriva máxima inferior al 0,5 % de los parámetros. Se ofrecen dos etapas (V1 y V2) con deriva acumulativa y monótona. El conjunto de entrenamiento es muy reducido (146 pares imagen-caption) y el modelo de lenguaje permanece congelado en 4 bits durante todo el proceso.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo interesante de ajuste quirúrgico de un proyector multimodal con presupuesto de deriva controlado y con un protocolo de evaluación por batería que exige cero regresiones en anclas fuera de distribución. Conviene señalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, y que el modelo está marcado como no apto para todas las audiencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyector de visión (ViT + merger) para Qwen3-VL; se acopla a un LLM Qwen3.8-27B congelado |
| Parámetros totales | 460.730.096 (461M), 333 tensores en el modelo; 334 tensores por archivo GGUF |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 en los archivos `mmproj` publicados; el cerebro se ejecuta en 4-bit (nf4) o Q8 según la variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) para llama.cpp con `--mmproj` |

## Arquitectura y entrenamiento

El componente es el proyector de visión estándar de Qwen3-VL: un Vision Transformer más un módulo merger que transforma los tokens visuales al espacio del modelo de lenguaje. Se entrena la totalidad del "ojo" (ViT y merger, 461M parámetros, 333 tensores) mientras el LLM permanece congelado en 4 bits y nunca se actualiza. El conjunto de datos es deliberadamente pequeño: 146 pares imagen-caption curados de escenas de combate y contenido NSFW.

La pieza técnica distintiva es la función de pérdida: entropía cruzada por token siguiente sobre el caption, más un término L2 de anclaje ("leash") a los pesos iniciales aplicado en cada paso. En la etapa 1 el leash se ancla al ojo original; en la etapa 2 se relaja y se reancla a V1, de modo que la deriva se acumula de forma acotada. Se emplean tasas de aprendizaje por capa (merger 10× respecto al ViT), warmup y AdamW con weight decay cero. El pipeline incluye una "probe gate" de 64 pasos que aborta si la deriva máxima no supera 5e-5, y una batería por checkpoint con CE de contenido objetivo más anclas fuera de distribución; una etapa solo se publica si mejora el objetivo sin ninguna regresión.

## Capacidades

- Lectura de imágenes en tareas image-text-to-text: descripción de escena, pose, anatomía, ropa, marcas de agua y texto pequeño.
- Mejora específica en escenas de combate y contenido NSFW respecto al proyector original, manteniendo el registro descriptivo en lugar de derivar a objetos inanimados o accesorios genéricos.
- Preservación de visión general: anclas fuera de distribución (animales, vehículos, personajes, texto impreso y logotipos) verificadas a nivel de píxel en ambas etapas.
- Compatibilidad con configuraciones de doble ojo (`--mmproj2`) en llama.cpp.
- Independiente del cerebro: funciona con cualquier "cerebro" Qwen3.8-27B, no solo con el fine-tune de referencia.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking propias del proyector; dependen del LLM subyacente.

## Casos de uso

- Moderación y etiquetado de contenido sensible: el proyector mantiene la lectura literal de escenas de combate y NSFW, lo que permite clasificar y describir material que el proyector original tiende a suavizar o malinterpretar.
- Análisis forense de imágenes con texto superpuesto: la lectura correcta de marcas de agua y texto pequeño en cerebros Q8 o superiores facilita la extracción de metadatos visuales y la verificación de procedencia.
- Descripción de escenas de acción para accesibilidad: la mejora en pose y anatomía permite generar descripciones más fieles de imágenes deportivas o de confrontación.
- Investigación sobre ajuste controlado de proyectores multimodales: el esquema de leash L2 con deriva acotada y batería de cero regresiones sirve como referencia metodológica para fine-tunes quirúrgicos.
- Despliegue local con llama.cpp: al ser un GGUF de 931 MB por etapa, se integra en pipelines de inferencia local junto a un cerebro Qwen3.8-27B cuantizado, sin necesidad de GPUs de datacenter.
- Pruebas A/B de proyectores de visión: la existencia de V1 y V2 con linaje documentado permite comparar etapas de ajuste sobre el mismo cerebro en tareas de lectura de imagen.
- Evaluación de robustez fuera de distribución: las anclas verificadas (animales, vehículos, logotipos) lo hacen útil para validar que un ajuste de nicho no degrada la percepción general.

## Benchmarks y rendimiento

Los únicos datos publicados son la entropía cruzada (CE) sobre una batería de 46 imágenes objetivo y las métricas de deriva de parámetros. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Ojo original | V1 | V2 |
|---|---|---|---|
| CE, batería objetivo de 46 imágenes | 4,76 | 1,94 | 1,80 |
| Imágenes mejoradas / regresadas | — | 46/46, 0 | 46/46, 0 (monótono en cada checkpoint) |
| Deriva máxima de parámetros vs. inicialización | — | 3,5e-3 | ~5e-3 (estabilizada) |
| Imágenes no vistas reservadas | — | 12/12 a nivel de escena | 12/12 a nivel de escena |

## Requisitos de hardware

- VRAM del proyector: 931 MB por archivo `mmproj` en BF16; debe sumarse a la VRAM del cerebro Qwen3.8-27B.
- VRAM total estimada: depende enteramente de la cuantización del cerebro. Un cerebro de 27B en 4-bit ronda los 15-17 GB; en Q8 supera los 28 GB. El proyector añade aproximadamente 1 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cerebro en 4-bit; A100 40/80 GB o H100 para cerebro en Q8 o BF16.
- Cabe en GPU de consumo: sí, con cerebro en 4-bit en tarjetas de 24 GB o superiores; en 16 GB requiere cuantizaciones más agresivas del cerebro.
- Opciones de despliegue: llama.cpp con `--mmproj` (tipo de proyector Qwen3-VL); compatible con `--mmproj2` para doble ojo. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este componente. La comparación más directa es contra el proyector original del que deriva y contra la etapa anterior del propio linaje.

| Modelo | Parámetros | Contexto | CE batería objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parasyte Eye V1 | 461M | no disponible | 1,94 | Apache 2.0 | GGUF en HF |
| Parasyte Eye V2 | 461M | no disponible | 1,80 | Apache 2.0 | GGUF en HF |
| Proyector original Qwen3-VL | 461M | no disponible | 4,76 | Apache 2.0 (según base) | incluido con el base |
| Otros proyectores de visión comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Asignación de objetos cerca del cuerpo: una prenda apoyada sobre o junto al cuerpo puede leerse como puesta; la posición, el color y el patrón son correctos, pero la categoría es el punto débil.
- Capa de texto en cerebros débiles: con cerebros en 4-bit (nf4) el texto y los logotipos se completan en marcas reales plausibles; solo en Q8 y superiores las marcas de agua se leen correctamente.
- Priors de volumen: anatomía plana o desinflada vista desde un ángulo bajo puede completarse como volumen pleno; el autor lo atribuye a una carencia del conjunto de entrenamiento.
- Sesgos: el ajuste está orientado explícitamente a contenido de combate y NSFW, lo que puede introducir un sesgo de registro en esas direcciones.
- Riesgo de alucinación: el propio autor documenta la completación de marcas de agua en cerebros de baja precisión, lo que constituye un caso concreto de alucinación visual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo está marcado `not-for-all-audiences` y su propósito incluye contenido NSFW; el cumplimiento normativo y de políticas de plataforma corre a cargo del desplegador.
- Contexto e idiomas: no documentados; dependen del cerebro Qwen3.8-27B asociado.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay validación independiente de los resultados reportados.
- Dependencia del cerebro: el rendimiento en lectura de texto depende críticamente de la cuantización del LLM, no solo del proyector.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-Eye-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive
- Apoyo al desarrollo (Monero / RTX 5090 FUND): https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
- llama.cpp (runtime compatible): no disponible en la información proporcionada como enlace explícito; el proyecto se distribuye para su uso con `--mmproj`.
