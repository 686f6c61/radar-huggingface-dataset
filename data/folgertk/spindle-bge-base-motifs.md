# folgertk/spindle-bge-base-motifs

## Resumen

spindle-bge-base-motifs es un modelo de embeddings de frases en ingles obtenido mediante fine-tuning de BAAI/bge-base-en-v1.5, desarrollado por Folgert Karsdorp. Su proposito es actuar como motor de busqueda semantica del *Motif-Index of Folk-Literature* de Stith Thompson dentro de Spindle, un buscador que se ejecuta integramente en el navegador. El modelo permite describir un motivo folclorico o un fragmento de trama en lenguaje natural ("una princesa duerme hasta que un beso la despierta") y recuperar los motivos del indice que coinciden con esa descripcion.

Tecnicamente es un transformer BERT base (arquitectura encoder de 12 capas) adaptado a recuperacion densa mediante aprendizaje contrastivo. El repositorio distribuye unicamente los pesos en formato ONNX de 8 bits para transformers.js, con un tamano total de 0,2 GB, lo que lo hace desplegable en el navegador sin backend. La segunda version (octubre de 2026) incorpora consultas redactadas a partir de cuentos reales, lo que mejora la recuperacion sobre descripciones vagas o incompletas.

Su relevancia actual reside en dos factores: demuestra que la recuperacion semantica de calidad puede ejecutarse en el cliente con cuantizacion de 8 bits, y ofrece un caso de uso especializado (humanidades digitales, folkloristica) donde el ajuste fino sobre un modelo generico aporta mejoras medibles en MRR y en recuperacion top-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base), fine-tuning de BAAI/bge-base-en-v1.5 |
| Parametros totales | no disponible (el modelo base bge-base-en-v1.5 tiene aproximadamente 109 millones; no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | ONNX de 8 bits (dtype `q8`) para transformers.js |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (transformers.js); el modelo base original esta en safetensors, pero este repositorio solo distribuye ONNX |

## Arquitectura y entrenamiento

El modelo parte de bge-base-en-v1.5, un encoder BERT base entrenado para recuperacion densa, y se ajusta con `MultipleNegativesRankingLoss` durante 3 epocas, con tasa de aprendizaje 2e-5 y tamano de lote 32. La representacion se obtiene con pooling CLS y normalizacion L2; las consultas llevan el prompt de recuperacion de bge ("Represent this sentence for searching relevant passages: ") y los textos de motivos se embeben sin el.

El conjunto de entrenamiento combina dos tipos de pares consulta-motivo. El primero consta de aproximadamente 1.800 fragmentos de trama extraidos de los resumenes de tipos de cuento ATU de Hans-Jorg Uther (*The Types of International Folktales*, 2004), cada uno con el motivo citado y tres negativos duros minados (motivos que el modelo base puntuaba alto sin ser el citado ni su padre o hijo). El segundo comprende 4.740 consultas de busqueda redactadas a partir de 688 cuentos de *Folktexts* de D. L. Ashliman: Claude Sonnet localizaba el pasaje donde una version concreta expresa un motivo del tipo y redactaba, viendo solo el pasaje, lo que alguien que recuerda vagamente el episodio escribiria (una linea vaga, una descripcion mas completa y palabras clave); estos pares usan negativos aleatorios porque un pasaje suele expresar varios motivos. Los datos provienen del dataset trilogy de Joshua Hagedorn y se dividen por tipo de cuento (60% entrenamiento, 20% desarrollo, 20% test), de modo que las consultas de test pertenecen a tipos no vistos.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa (feature-extraction).
- Busqueda semantica sobre un corpus de 46.220 motivos folcloricos, con variante de vector de parafrasis corta generada por Claude Haiku.
- Mapeo de descripciones vagas o incompletas de episodios narrativos a motivos del indice de Thompson.
- Recuperacion cross-lingue no soportada: el modelo es exclusivamente en ingles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un encoder de embeddings, no un modelo generativo.
- No dispone de modo thinking, vision ni audio.
- Ejecucion en navegador mediante transformers.js con pesos ONNX de 8 bits.

## Casos de uso

- Busqueda de motivos folcloricos en Spindle: el usuario describe un episodio recordado de forma imprecisa y el modelo recupera los motivos candidatos del indice; es su proposito original y el escenario para el que fue evaluado.
- Investigacion en folkloristica comparada: un investigador que trabaja con un corpus de cuentos puede mapear pasajes a motivos ATU para analisis de variacion y distribucion, usando el modelo como capa de recuperacion previa a la revision manual.
- Catalogacion asistida de archivos de cuentos: dado un cuento no indexado, se generan descripciones de sus episodios y se recuperan motivos candidatos para que un catalogador los valide.
- Herramientas educativas de literatura oral: interfaces que permiten a estudiantes explorar el indice de Thompson escribiendo descripciones en lenguaje natural, sin conocer la nomenclatura de motivos.
- Busqueda semantica en aplicaciones web sin backend: al distribuirse en ONNX de 8 bits y ejecutarse en transformers.js, puede integrarse en sitios estaticos o aplicaciones de navegador con vectores precalculados y comprimidos.
- Prototipado de recuperacion densa en dominios de humanidades: sirve como referencia de como ajustar un encoder de recuperacion con negativos minados y datos sinteticos generados por LLM en un dominio especializado.
- Deduplicacion o agrupacion de descripciones de motivos: los embeddings permiten agrupar formulaciones equivalentes de un mismo motivo en tareas de normalizacion de vocabularios.

## Benchmarks y rendimiento

Evaluacion sobre los 46.220 motivos a precision completa, con un segundo vector de parafrasis por motivo.

Fragmentos ATU: 687 fragmentos de 296 tipos de cuento no vistos.

| Modelo | Motivo correcto primero | En el top 10 | MRR |
|---|---|---|---|
| bge-base-en-v1.5 sin ajuste | 27% | 46% | 0,33 |
| version 1 | 34% | 58% | 0,42 |
| este modelo | 34% | 57% | 0,41 |

Consultas de cuentos: 1.600 consultas (pasajes y descripciones a ciegas) de 396 pasajes de 30 tipos no vistos; las columnas "judged" cuentan cualquier motivo que Claude Sonnet juzgo citable por un folklorista.

| Modelo | En el top 10 | MRR | En el top 10, judged | MRR, judged |
|---|---|---|---|---|
| version 1 | 47% | 0,28 | 75% | 0,50 |
| este modelo | 51% | 0,31 | 79% | 0,54 |

En navegador, con estos pesos de 8 bits y los vectores de motivos comprimidos de Spindle: consultas de cuentos 49% / 0,30 (version 1: 44% / 0,25) y fragmentos ATU 55% / 0,40 para ambas versiones.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB con pesos ONNX de 8 bits (repositorio de 0,2 GB); en CPU es viable para inferencia por lotes pequenos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en WebGPU/WASM del navegador. Cualquier GPU consumer reciente (RTX 3060 o superior) acelera el procesado por lotes.
- Cabe en cualquier GPU consumer y en dispositivos moviles, dado el tamano reducido.
- Opciones de despliegue: transformers.js (soporte oficial del repositorio); al ser ONNX, puede servirse con ONNX Runtime en otros entornos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spindle-bge-base-motifs | no disponible (base BERT base) | no disponible | 51% top-10 / MRR 0,31 en consultas de cuentos; 34% primero en fragmentos ATU | CC BY-SA 4.0 | ONNX en HuggingFace |
| bge-base-en-v1.5 | no disponible (base BERT base) | no disponible | 46% top-10 / MRR 0,33 en fragmentos ATU (sin ajuste) | MIT | safetensors y ONNX en HuggingFace |
| version 1 de spindle-bge-base-motifs | no disponible | no disponible | 47% top-10 / MRR 0,28 en consultas de cuentos | CC BY-SA 4.0 | en el historial de commits del repositorio |

No se dispone de comparacion con otros modelos de embeddings especializados en folkloristica en la informacion proporcionada.

## Limitaciones y advertencias

- Las consultas de entrenamiento siguen el registro de Uther y de Claude, sobre todo tipos de cuento europeos; funcionan peor consultas en otros registros o tradiciones.
- Los pasajes crudos de un cuento son mas dificiles de recuperar que una descripcion del episodio.
- Las puntuaciones "judged" dependen del juicio de un modelo de lenguaje, verificado a mano solo en muestras.
- Modelo exclusivamente en ingles; no soporta consultas en castellano ni en otras lenguas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos: el modelo puede devolver motivos plausibles que no corresponden al pasaje.
- Licencia CC BY-SA 4.0: el uso comercial exige compartir las obras derivadas bajo la misma licencia y atribuir; la licencia MIT del modelo base no se hereda por los datos de ajuste.
- El repositorio solo contiene pesos ONNX de 8 bits; no se distribuyen pesos en safetensors ni otras precisiones.
- No es un modelo generativo: no puede redactar respuestas, razonar ni ejecutar herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/folgertk/spindle-bge-base-motifs
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Spindle (buscador): https://github.com/fbkarsdorp/spindle
- transformers.js: https://github.com/huggingface/transformers.js
- Dataset trilogy: https://github.com/j-hagedorn/trilogy
