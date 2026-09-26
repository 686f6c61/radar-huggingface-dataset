# nikolaylahin/ApsuaTranslator-v1

## Resumen

ApsuaTranslator-v1 es un modelo de traducción automática bidireccional ruso–abjasio desarrollado en el marco del proyecto Abkhaz Language Corpus (apsua-corpus.ru) e iniciado por el colectivo Team Abkhazia, con apoyo de la Administración del Presidente de la República de Abjasia, el Fondo de Repatriación y la Presidential Grants Foundation de la Federación Rusa. El modelo se publica en Hugging Face bajo el identificador nikolaylahin/ApsuaTranslator-v1, aunque la model card y los ejemplos de uso remiten a la organización apsua/, lo que sugiere una réplica no oficial del repositorio.

Técnicamente es un modelo encoder-decoder de 251.116.800 parámetros con pesos en safetensors FP16 (fichero de 502,3 MB), entrenado sobre el corpus paralelo apsua/apsua-corpus, construido con traducción humana asistida y revisión editorial. Soporta entradas y generaciones de hasta 512 tokens y se distribuye con un runtime propio (`apsua_translator.Translator`), no como paquete `transformers.AutoModel`, lo que condiciona su integración en pipelines estándar.

Su relevancia radica en el nicho: el abjasio es una lengua de muy bajos recursos, con pocos recursos digitales y escasa cobertura en sistemas comerciales. Según la evaluación publicada, el modelo supera a Google Translate tanto en ruso→abjasio (25,13 frente a 20,12 BLEU) como en abjasio→ruso (34,60 frente a 30,74 BLEU), lo que lo convierte en una referencia específica para este par de idiomas, dentro de un alcance deliberadamente limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (según etiquetas del autor; número de capas, dimensión oculta y cabezas de atención no disponibles) |
| Parámetros totales | 251.116.800 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de entrada y 512 tokens de generación máxima |
| Tipos de cuantización | No disponible. Pesos publicados en FP16 safetensors; precisión de inferencia FP32 en CPU y FP16 en CUDA/MPS |
| Idiomas soportados | Abjasio (ab) y ruso (ru) |
| Licencia | CC BY 4.0 para los pesos del modelo; Apache-2.0 para el código del runtime |
| Formato de pesos | safetensors (FP16), fichero de 502,3 MB |
| Pipeline | translation (traducción automática) |
| Librería | apsua-translator (runtime propio, no compatible con `transformers.AutoModel`) |
| Dataset de entrenamiento | apsua/apsua-corpus |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La información disponible describe un modelo encoder-decoder de tipo transformer, con 251 millones de parámetros y pesos en FP16, orientado exclusivamente a traducción secuencia a secuencia. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, la estrategia de tokenización (aunque un vocabulario que cubra abjasio y ruso probablemente sea multilingüe o BPE conjunto) ni si se emplearon mecanismos como atención lineal o decodificación especulativa. Tampoco se detalla si el entrenamiento se inicializó desde un checkpoint previo o desde cero.

Los datos de entrenamiento proceden del corpus paralelo ruso–abjasio apsua/apsua-corpus, construido mediante un flujo human-in-the-loop con revisión editorial. La model card no indica el número total de tokens, la composición por dominios ni la proporción de cada dirección de traducción, aunque la evaluación menciona textos de conversación, reseñas, textos informativos y literatura, lo que sugiere que la cobertura del corpus se concentra en esos géneros. No hay mención de RLHF, DPO u otras fases de alineación, algo esperable en un modelo de traducción supervisada.

Existe una variante destilada, ApsuaTranslator-Lite-v1, derivada de este modelo, cuyo fichero de pesos es 6 veces más pequeño, consume 3 veces menos memoria al cargar los pesos y traduce 2,5 veces más rápido, según la información publicada. Ese dato sugiere que el modelo completo no está optimizado para latencia y que el proyecto contempla despliegues con restricciones de recursos mediante destilación.

## Capacidades

- Traducción bidireccional ruso→abjasio y abjasio→ruso en un único modelo.
- Traducción por lotes: el método `translate` acepta una cadena o una lista de cadenas.
- Selección automática de dispositivo en el orden CUDA, Apple MPS y CPU, configurable de forma explícita.
- Ejecución en CPU en FP32 y en GPU (CUDA) o Apple Silicon (MPS) en FP16.
- Generación de hasta 512 tokens de salida por segmento traducido.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un modelo puramente de traducción.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Cobertura multilingüe limitada exclusivamente a los pares ab–ru y ru–ab; no hay indicios de transferencia a otras lenguas emparentadas o de contacto.

## Casos de uso

- Traducción de documentación oficial y administrativa rusa al abjasio: el modelo puede procesar bloques de hasta 512 tokens, adecuados para párrafos de decretos, formularios y comunicados, con la ventaja de que el corpus de entrenamiento incluye textos informativos y revisión editorial humana.
- Localización de interfaces y aplicaciones para usuarios abjasohablantes: integrado en un pipeline de CI/CD que extraiga cadenas de recursos i18n y llame al modelo por lotes (el método acepta listas), reduciendo el coste frente a la traducción manual de cadenas cortas.
- Digitalización y accesibilidad de contenido web: traducción de reseñas, comentarios y publicaciones de usuarios desde el ruso al abjasio para plataformas de contenido, un dominio explícitamente cubierto por el conjunto de evaluación.
- Preservación y publicación de literatura: traducción de fragmentos literarios entre ambos idiomas, con la advertencia de que la evaluación en este género existe pero el BLEU agregado (25,13 en ru→ab) indica margen de error apreciable que exige revisión humana.
- Herramientas de apoyo a la traducción profesional: como motor de pre-traducción en un CAT tool, generando un borrador que el traductor abjasohablante corrige, aprovechando que supera a Google Translate en ambas direcciones en la evaluación publicada.
- Investigación en lenguas de bajos recursos: uso como línea base reproducible para experimentos de aumento de datos, destilación o ajuste fino, dado que el corpus y los modelos asociados (v0 y Lite-v1) son públicos bajo CC BY 4.0.
- Asistencia a hablantes de la diáspora: traducción abjasio→ruso en aplicaciones de mensajería o consulta puntual, donde la dirección inversa obtiene mejores resultados (34,60 BLEU) que la directa.

## Benchmarks y rendimiento

Evaluación publicada en la model card: BLEU insensible a mayúsculas/minúsculas sobre un conjunto de prueba independiente que abarca conversación, reseñas, textos informativos y literatura. La tabla incluye los tres modelos del proyecto y Google Translate como referencia externa.

| Modelo | Ruso → abjasio (BLEU) | Abjasio → ruso (BLEU) |
|---|---:|---:|
| ApsuaTranslator-v1 | 25,13 | 34,60 |
| ApsuaTranslator-Lite-v1 | 23,57 | 29,17 |
| ApsuaTranslator-v0 | 21,94 | 28,72 |
| Google Translate | 20,12 | 30,74 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni métricas complementarias como chrF, COMET, TER o latencia medida. Tampoco se detalla el tamaño del conjunto de prueba ni su composición porcentual por género.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del recuento de parámetros, no publicadas por el autor): aproximadamente 0,5 GB para los pesos en FP16, más overhead de activaciones y caché para secuencias de hasta 512 tokens; en la práctica, entre 1 y 2 GB en FP16 sobre GPU y alrededor de 1 GB en CPU con FP32.
- El modelo cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores, así como en Apple Silicon mediante MPS.
- GPU de datacenter (A100, H100, L40S) no son necesarias para el tamaño del modelo; solo tendrían sentido para servir un volumen muy alto de peticiones en paralelo.
- El propio autor documenta ejecución en CPU (FP32) como opción válida, lo que sitúa al modelo en la categoría de despliegue ligero.
- Opciones de despliegue: el modelo requiere el runtime propio `apsua_translator.Translator`, instalable con `pip install "git+https://huggingface.co/apsua/ApsuaTranslator-v1"`. No es un paquete `transformers.AutoModel`, por lo que no se puede servir directamente con vLLM, TGI, Ollama o llama.cpp sin trabajo de conversión adicional; tampoco se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles. El dato indirecto de que ApsuaTranslator-Lite-v1 es 2,5 veces más rápido que este modelo no viene acompañado de cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Direcciones | Contexto | BLEU ru→ab | BLEU ab→ru | Licencia | Disponibilidad |
|---|---:|---|---|---:|---:|---|---|
| ApsuaTranslator-v1 | 251.116.800 | ru ↔ ab | 512 tokens | 25,13 | 34,60 | CC BY 4.0 (pesos), Apache-2.0 (código) | Hugging Face (repo del autor y organización apsua/) |
| ApsuaTranslator-Lite-v1 | No disponible (pesos 6× más pequeños) | ru ↔ ab | No disponible | 23,57 | 29,17 | No disponible en la información | Hugging Face (apsua/ApsuaTranslator-Lite-v1) |
| ApsuaTranslator-v0 | No disponible | ru ↔ ab | No disponible | 21,94 | 28,72 | No disponible en la información | Hugging Face |
| Google Translate | No disponible | ru ↔ ab | No disponible | 20,12 | 30,74 | Propietaria | Servicio comercial |

Frente a un sistema comercial generalista como Google Translate, ApsuaTranslator-v1 obtiene una ventaja de 5,01 puntos BLEU en ruso→abjasio y de 3,86 puntos en abjasio→ruso, pero pierde en ausencia de cobertura multilingüe, de API gestionada y de garantías de servicio. No se han identificado en la información proporcionada otros modelos abiertos comparables para el par ruso–abjasio.

## Limitaciones y advertencias

- El BLEU en ruso→abjasio (25,13) es moderado y sensiblemente inferior al de la dirección inversa (34,60); la calidad es asimétrica y no debe asumirse paridad entre direcciones.
- La evaluación procede del propio proyecto y se limita a cuatro géneros; no hay validación independiente ni métricas neuronales (COMET, BLEURT) que corroboren los resultados.
- El repositorio analizado registra 0 descargas y 0 likes, sin señales de adopción ni de revisión por parte de la comunidad; el código y los pesos no han sido auditados externamente.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en terminología especializada (legal, médica, técnica) no representada en los géneros del corpus.
- Límite estricto de 512 tokens tanto en entrada como en salida: los documentos largos deben segmentarse, lo que puede degradar la coherencia entre fragmentos.
- Cobertura limitada a ruso y abjasio; no hay soporte de otras lenguas ni detección automática de idioma documentada.
- El modelo requiere un runtime propio y no es compatible con la API de `transformers`, lo que añade fricción de integración, dificulta el versionado estándar y bloquea el uso directo de servidores de inferencia habituales.
- Licencia CC BY 4.0 en los pesos: permite uso comercial, incluida la modificación y redistribución, siempre que se atribuya la autoría y se indique la licencia; el código va aparte bajo Apache-2.0. Conviene revisar la atribución exigida al integrarlo en productos.
- Posible sesgo derivado de un corpus construido con traducción humana asistida y revisión editorial sobre temas concretos; el registro y las variantes dialectales del abjasio pueden estar infrarrepresentados.
- Existe ambigüedad sobre el repositorio canónico: el identificador nikolaylahin/ApsuaTranslator-v1 y las referencias a apsua/ApsuaTranslator-v1 en la model card apuntan a ubicaciones distintas, por lo que debe verificarse cuál se mantiene actualizada antes de depender de ella.
- Las fechas del repositorio (creación y última actualización el 25 de septiembre de 2026) indican que se trata de una publicación reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face (repo analizado): https://huggingface.co/nikolaylahin/ApsuaTranslator-v1
- Repositorio referenciado en la model card y en los ejemplos de uso: https://huggingface.co/apsua/ApsuaTranslator-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/apsua/apsua-corpus
- Variante destilada: https://huggingface.co/apsua/ApsuaTranslator-Lite-v1
- Proyecto Abkhaz Language Corpus: https://apsua-corpus.ru
- Licencia de los pesos (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Licencia del runtime (Apache-2.0): LICENSE-APACHE-2.0.txt (incluido en el repositorio)
- Versión en ruso de la model card: README.ru.md (incluido en el repositorio)
