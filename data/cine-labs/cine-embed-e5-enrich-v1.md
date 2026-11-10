# cine-labs/cine-embed-e5-enrich-v1

## Resumen

cine-embed-e5-enrich-v1 es un modelo de embeddings de frases (sentence encoder) publicado por cine-labs como fine-tune de `intfloat/multilingual-e5-base`. Su propósito es servir como canal de recuperación por embeddings en el motor de recomendación `cine-rec-engine`, codificando fichas de catálogo (título, año, sinopsis y, opcionalmente, metadatos cinematográficos enriquecidos) en un espacio vectorial multilingüe de 768 dimensiones. No es un modelo generativo: es un encoder para similitud semántica y extracción de características.

La arquitectura subyacente es XLM-RoBERTa en configuración base, con 278.043.648 parámetros totales (aproximadamente 278 M), empaquetada en formato `sentence-transformers` y pesos `safetensors`. El modelo mantiene las convenciones de prefijos de E5 (`query:` / `passage:`), que el motor de cine-rec-engine aplica automáticamente. El repositorio ocupa 0,6 GB y se distribuye bajo licencia MIT para el fine-tune, con la licencia Apache-2.0 del modelo base aplicable a los pesos derivados.

Su relevancia es acotada y de nicho: se trata de un artefacto especializado para un pipeline de recomendación cinematográfica concreto, no un modelo de propósito general. Resulta útil para quien quiera reproducir o reutilizar el canal de recuperación de cine-rec-engine, o como ejemplo de fine-tune de E5 sobre texto estructurado de catálogo. El modelo no registra descargas ni likes en el momento de la consulta y no declara una lista explícita de idiomas soportados más allá de "multilingual".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder), empaquetado con sentence-transformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (sin lista explícita; heredado de multilingual-e5-base) |
| Licencia | MIT para el fine-tune; Apache-2.0 del modelo base aplicable a los pesos derivados |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 768 |
| Modelo base | intfloat/multilingual-e5-base |
| Pipeline | feature-extraction / sentence-similarity |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `intfloat/multilingual-e5-base`, que a su vez es un XLM-RoBERTa base adaptado al paradigma E5 (embeddings de texto con prefijos de tarea). La arquitectura es un transformer encoder bidireccional con pooling para producir un vector de 768 dimensiones por entrada. No hay innovaciones arquitectónicas propias: se mantiene la estructura del modelo base y se ajustan los pesos para el dominio de catálogo cinematográfico.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de contraste (por ejemplo, InfoNCE con negativos duros), RLHF o DPO. La model card únicamente especifica el formato de entrada canónico (`Title: {title} ({year})` y `Overview: {overview}`, con líneas opcionales de enriquecimiento `Emotional arc`, `Pacing`, `Narrative`, `Sub-genres` y `Experience`) y que las convenciones de prefijos E5 se aplican automáticamente desde el motor. No se documentan hiperparámetros, épocas ni estrategia de minado de negativos.

## Capacidades

- Generación de embeddings de frases y documentos de 768 dimensiones para similitud semántica y recuperación.
- Codificación de texto estructurado de catálogo cinematográfico con plantilla canónica (título, año, sinopsis).
- Soporte de plantilla enriquecida opcional con metadatos cinematográficos (arco emocional, ritmo, narrativa, subgéneros, experiencia).
- Espacio multilingüe heredado de multilingual-e5-base, con convenciones de prefijo `query:` / `passage:`.
- Extracción de características (`feature-extraction`) para uso en pipelines de búsqueda vectorial.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un encoder.

## Casos de uso

- Recuperación por embeddings en un motor de recomendación: el modelo codifica el catálogo como pasajes (`passage:`) y las consultas de usuario como queries (`query:`), permitiendo búsqueda semántica sobre sinopsis y metadatos en el canal de recall de cine-rec-engine.
- Búsqueda semántica de películas por descripción libre: un usuario describe una trama o atmósfera y el encoder la proyecta al mismo espacio que las fichas, recuperando títulos afines sin depender de coincidencia léxica.
- Deduplicación y clustering de catálogo: agrupar fichas con sinopsis equivalentes o muy similares mediante similitud coseno sobre los vectores de 768 dimensiones.
- Recomendación por similitud ítem-ítem: precalcular embeddings del catálogo y servir vecinos más cercanos para "películas similares a esta" con latencia baja en un índice vectorial.
- Enriquecimiento de metadatos como señal de ranking: usar la plantilla extendida (`Emotional arc`, `Pacing`, `Narrative`, `Sub-genres`, `Experience`) para que el embedding capture atributos cinematográficos además del texto de sinopsis.
- Evaluación de pipelines de recuperación: servir como encoder de referencia para comparar canales de recall en experimentos offline de recomendación.
- Sistemas multilingües de catálogo: al heredar el espacio multilingüe de E5, permite consultas en un idioma contra fichas en otro, útil en catálogos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB para pesos; cuantizaciones de 8 bits reducirían a ~0,3 GB, aunque el autor no documenta tipos de cuantización soportados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para lotes pequeños; A100, H100, L4, T4 o RTX 4090 son holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (uso documentado), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; el autor no documenta integración con llama.cpp, Ollama ni vLLM para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cine-embed-e5-enrich-v1 | 278 M | 768 | no disponible | MIT (fine-tune) / Apache-2.0 (base) | Fine-tune de dominio cinematográfico sobre E5 |
| intfloat/multilingual-e5-base | ~278 M | 768 | no disponible | Apache-2.0 | Modelo base; propósito general multilingüe |
| intfloat/multilingual-e5-small | ~118 M | 384 | no disponible | MIT | Variante más ligera de la familia E5 |
| intfloat/multilingual-e5-large | ~560 M | 1024 | no disponible | MIT | Variante mayor de la familia E5 |

La comparativa se limita a la familia E5 por ser el linaje directo del modelo; no se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas con las alternativas.

## Limitaciones y advertencias

- Modelo especializado en un dominio muy concreto (catálogo cinematográfico); su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de su modelo base.
- No es un modelo generativo: no puede responder preguntas, razonar ni ejecutar tool calling; solo produce embeddings.
- Riesgo de sesgo heredado del corpus de entrenamiento del modelo base y del dataset de fine-tune, que no se documenta.
- No se especifica la longitud máxima de contexto ni el truncado aplicado a sinopsis largas; entradas que excedan el límite del tokenizador podrían truncarse silenciosamente.
- La lista de idiomas no está declarada explícitamente; el soporte multilingüe se asume por herencia del modelo base, sin verificación publicada.
- La licencia MIT del fine-tune convive con la Apache-2.0 del modelo base; para uso comercial deben respetarse ambas, incluidas las notas de atribución del modelo base.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia pública de calidad en producción más allá de la model card.
- La plantilla de entrada es rígida: usar un formato distinto al canónico puede degradar la calidad de los embeddings.
- No se documentan cuantizaciones oficiales ni métricas de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cine-labs/cine-embed-e5-enrich-v1
- Repositorio cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine
- Documentación de modelos de cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine/blob/main/models/README.md
- Perfil del autor: https://github.com/DovBerKaplan
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
