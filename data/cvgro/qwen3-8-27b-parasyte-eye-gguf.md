# cvgro/Qwen3.8-27B-Parasyte-Eye-GGUF

## Resumen

Parasyte Eye es un ajuste fino del proyector visual (vision tower y merger) del modelo Qwen3-VL, empaquetado en formato GGUF como archivo `mmproj` para su uso con llama.cpp. Lo desarrolla el usuario cvgro (co-diseñado por PlagueKind y Valkyrja Vinter) y se distribuye como complemento del modelo de lenguaje Qwen3.8-27B, en concreto sobre la variante sin censura HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive. No es un modelo completo, sino el componente de visión que se acopla a un "cerebro" lingüístico Qwen3.8-27B mediante el flag `--mmproj` de llama.cpp.

El problema que aborda es concreto: el ojo visual original de Qwen3-VL tiende a "normalizar" contenido de escenas de lucha y material NSFW, completando anatomía en objetos inanimados y colapsando el registro descriptivo. El ajuste aplica una modificación acotada (deriva máxima de parámetros inferior al 0,5 % respecto al checkpoint previo) que preserva el rendimiento general en anclas fuera de distribución (animales, vehículos, personajes, texto impreso y logotipos) mientras mejora la lectura de escenas objetivo.

Técnicamente el componente tiene 460.730.096 parámetros (461M, 333 tensores en el modelo base de entrenamiento; 334 tensores en los GGUF exportados), se distribuye en dos etapas (V1 y V2) de 931 MB cada una en BF16, y su licencia declarada es Apache 2.0. Es relevante ahora porque demuestra una técnica de ajuste con "correa" L2 al checkpoint inicial que permite modificar comportamiento específico de un proyector multimodal sin reentrenar y sin degradar capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector visual (ViT + merger) para Qwen3-VL, tipo `mmproj` de llama.cpp |
| Parametros totales | 460.730.096 (461M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del cerebro Qwen3.8-27B asociado) |
| Tipos de cuantizacion | BF16 en los archivos publicados (V1 y V2); el cerebro puede cuantizarse por separado (probado con Q8 y nf4 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-Qwen3.8-27B-Parasyte-V1-BF16.gguf` y `...-V2-BF16.gguf`, 931 MB cada uno, 334 tensores) |

## Arquitectura y entrenamiento

El componente es el "ojo" de Qwen3-VL: una torre ViT más un merger que proyecta las características visuales al espacio del modelo de lenguaje. Durante el ajuste se entrena el ojo completo (ViT + merger, 461M parámetros, 333 tensores) mientras el modelo de lenguaje permanece congelado en 4 bits y no se modifica. El conjunto de datos es pequeño y curado: 146 pares imagen-caption de contenido de lucha y NSFW.

La innovación técnica central es la función de pérdida: entropía cruzada por token siguiente sobre el caption más una "correa" L2 hacia la inicialización aplicada en cada paso, de modo que el ojo actúa como un desplazamiento acotado por resorte y no como un reentrenamiento. La etapa 2 afloja la correa y la reancla a la etapa 1, acumulando deriva de forma limitada (deriva máxima ~5e-3, estabilizada). Se emplean tasas de aprendizaje por capa (merger 10× ViT), warmup y AdamW sin decaimiento de peso. El pipeline incluye una compuerta de sonda (64 pasos con el schedule real, aborta si la deriva máxima no supera 5e-5) y una batería de evaluación por checkpoint que combina entropía cruzada sobre contenido objetivo y anclas fuera de distribución; una etapa solo se publica si mejora el objetivo sin regresiones.

## Capacidades

- Descripción de imágenes en texto (image-text-to-text) acoplada a un cerebro Qwen3.8-27B.
- Lectura de escenas de lucha y contenido NSFW manteniendo el registro: escena, pose, anatomía, ropa, marcas de agua y texto pequeño.
- Reconocimiento de anclas fuera de distribución verificadas a nivel de píxel: animales, vehículos, personajes, texto impreso y logotipos.
- Compatible con configuraciones de doble ojo (`--mmproj2`) en llama.cpp.
- Independiente del cerebro: funciona con cualquier modelo Qwen3.8-27B, con resultados de texto/marca de agua que mejoran en cuantizaciones Q8 o superiores.
- No se documentan capacidades de tool calling, agentes ni audio en la información disponible.

## Casos de uso

- Moderación y etiquetado de contenido adulto: el ajuste mantiene el registro descriptivo en material NSFW donde el ojo original colapsa, lo que permite generar descripciones fiables para clasificación y filtrado.
- Análisis de escenas de acción y artes marciales: lectura correcta de pose y anatomía en fotogramas de combate, útil para etiquetado de datasets de vídeo o deportes de contacto.
- Descripción de imágenes para accesibilidad en contenido no apto para todos los públicos: genera texto alternativo preciso en escenas que el proyector estándar describe erróneamente.
- Verificación de marcas de agua y texto pequeño: con cerebros Q8 o superiores lee correctamente marcas de agua, útil en pipelines de detección de contenido generado o sindicación.
- Investigación sobre ajuste acotado de proyectores multimodales: el pipeline con correa L2, compuerta de sonda y batería por checkpoint sirve como referencia metodológica para modificar comportamiento visual sin degradar capacidades generales.
- Despliegue local con llama.cpp: al ser un `mmproj` BF16 de 931 MB, se integra en entornos de inferencia local junto a un cerebro Qwen3.8-27B cuantizado, sin necesidad de infraestructura adicional de visión.
- Pruebas A/B de proyectores: la existencia de V1 y V2 permite comparar etapas de ajuste sobre el mismo cerebro para evaluar el efecto de aflojar la correa.

## Benchmarks y rendimiento

| Metrica | Ojo original | V1 | V2 |
|---|---|---|---|
| Entropía cruzada, batería objetivo de 46 tomas | 4,76 | 1,94 | 1,80 |
| Tomas mejoradas / regresadas | — | 46/46, 0 | 46/46, 0 (monótono en cada checkpoint) |
| Deriva máxima de parámetros vs. inicialización | — | 3,5e-3 | ~5e-3 (estabilizada) |
| Tomas retenidas no vistas | — | 12/12 a nivel de escena | 12/12 a nivel de escena |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son internas del autor sobre su propia batería de evaluación.

## Requisitos de hardware

- El `mmproj` en BF16 ocupa 931 MB; se suma a la VRAM del cerebro Qwen3.8-27B, que domina el consumo.
- GPU recomendadas: no disponible en la información proporcionada; el autor menciona un fondo para una RTX 5090 y pruebas con cerebros en 4 bits (nf4) y Q8.
- Cabe en GPU de consumo si el cerebro se cuantiza adecuadamente; el proyector en sí es ligero (menos de 1 GB).
- Despliegue mediante llama.cpp con `--mmproj` (tipo de proyector Qwen3-VL) y soporte de `--mmproj2` para doble ojo. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Parasyte Eye (este) | 461M (proyector) | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Proyector original de Qwen3-VL | no disponible | no disponible | según Qwen3-VL | incluido con el modelo base |
| Proyector de Qwen3.8-27B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables de terceros para establecer una comparativa cuantitativa; la única referencia es la comparación interna del autor entre ojo original, V1 y V2 recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Asignación de objetos cerca del cuerpo: una prenda apoyada sobre o junto al cuerpo puede leerse como puesta; posición, color y patrón son correctos, pero la categoría es el punto débil.
- Capa de texto en cerebros débiles: con cerebros en 4 bits (nf4) el texto y los logotipos se completan en marcas reales plausibles; en Q8 y superiores las marcas de agua se leen correctamente.
- Sesgos de volumen: anatomía plana o desinflada vista desde un ángulo bajo puede completarse como llena; el autor lo atribuye a una laguna de los datos de entrenamiento.
- Contenido NSFW y etiqueta `not-for-all-audiences`: no apto para todos los públicos; requiere control de acceso en producción.
- El conjunto de entrenamiento es muy pequeño (146 pares), lo que limita la generalización más allá de las escenas objetivo.
- No es un modelo autónomo: requiere un cerebro Qwen3.8-27B compatible; su comportamiento depende de la cuantización de este.
- Riesgo de alucinación en texto pequeño y marcas de agua según el cerebro asociado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y el material NSFW pueden estar sujetos a normativa adicional.

## Enlaces

- Hugging Face: https://huggingface.co/cvgro/Qwen3.8-27B-Parasyte-Eye-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive
- Apoyo al proyecto (RTX 5090 FUND): https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
