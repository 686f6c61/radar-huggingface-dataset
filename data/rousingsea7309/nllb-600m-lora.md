# RousingSea7309/nllb-600M-lora

## Resumen

nllb-600M-lora es un adaptador LoRA entrenado sobre el modelo base facebook/nllb-200-distilled-600M, desarrollado por el usuario RousingSea7309 y publicado en Hugging Face. Su propósito es la traducción automática a nivel de frase entre inglés (en), francés (fr), árabe (ar) y suajili (sw), cubriendo las seis direcciones bidireccionales que implican al inglés: en-fr, fr-en, en-ar, ar-en, en-sw y sw-en. No se ofrecen direcciones directas entre lenguas no inglesas.

El modelo hereda la arquitectura transformer encoder-decoder de NLLB-200 distilled, con aproximadamente 600 millones de parámetros, y añade un adaptador de bajo rango (LoRA) de rango 8 sobre las proyecciones de atención y las capas feed-forward. El adaptador ocupa unos 0,3 GB en el repositorio, lo que lo hace muy ligero de distribuir y de aplicar sobre el modelo base.

Su relevancia práctica es acotada pero clara: permite especializar un traductor multilingüe ya existente en un conjunto reducido de pares de lenguas con un coste de entrenamiento bajo, y ofrece una vía para mejorar el rendimiento en suajili e inglés-suajili, un par con menos recursos que los europeos. La licencia del adaptador no está disponible y los datos de entrenamiento incluyen fuentes con restricciones no comerciales, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (base: NLLB-200 distilled) con adaptador LoRA |
| Parametros totales | ~600 M (modelo base); el adaptador LoRA añade un conjunto reducido de pesos de bajo rango |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base NLLB-200 usa segmentos de hasta 512 tokens; no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, fr, ar, sw (solo direcciones con el ingles: en-fr, fr-en, en-ar, ar-en, en-sw, sw-en) |
| Licencia | No disponible (los datos de entrenamiento incluyen MAFAND-MT, CC BY-NC 4.0, no comercial) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Pipeline | translation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre facebook/nllb-200-distilled-600M, un transformer encoder-decoder con atención completa y tokenización basada en SentencePiece con códigos de lengua NLLB (eng_Latn, fra_Latn, arb_Arab, swh_Latn). El ajuste se realiza mediante LoRA con r=8, alpha=64 y dropout de 0,05 sobre las proyecciones q_proj, k_proj, v_proj, out_proj, fc1 y fc2. Los hiperparámetros óptimos reportados son learning rate 0,00025719142025384657 y warmup_ratio 0,018485445552552705.

Los datos de entrenamiento alcanzan hasta 20.000 pares por dirección, mezclando ambas direcciones de cada par. Las fuentes son opus-100, news-commentary, MAFAND-MT (en-suajili), nllb-en-sw-20k (limitado a 6.000 filas) y en-sw-processed (limitado a 6.000 filas). El preprocesado incluye filtros de longitud en tokens y de ratio de longitud, filtros de marcado, identificación de lengua con fastText, deduplicación y eliminación de pares que contengan frases del conjunto de test. La pérdida de validación final es 1,2304432392120361, que el autor advierte explícitamente que es un proxy y no una medida de calidad de traducción.

## Capacidades

- Traducción de texto a nivel de frase en seis direcciones: en-fr, fr-en, en-ar, ar-en, en-sw y sw-en.
- Uso del token de lengua destino forzado mediante forced_bos_token_id, requisito imprescindible para que la generación apunte a la lengua correcta.
- Decodificación con búsqueda por haces (num_beams=4 en el ejemplo de uso) y max_new_tokens configurable.
- Integración con el ecosistema Hugging Face Transformers y PEFT: carga del adaptador, merge_and_unload y evaluación en modo eval.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües más allá de los cuatro idiomas indicados.

## Casos de uso

- Traducción de noticias y comunicados en inglés a francés o árabe: el adaptador se entrenó con news-commentary y opus-100, por lo que el registro periodístico es el más alineado con los datos. Se usaría dividiendo el texto en frases y aplicando el token de lengua destino correspondiente.
- Localización de documentación técnica en inglés a francés: con frases cortas y terminología estable, el modelo base distilled más el adaptador ofrece una alternativa ligera frente a servicios en la nube, ejecutable en una sola GPU.
- Traducción inglés-suajili en contextos de cooperación y ONG: el ajuste incluye MAFAND-MT y datos de Global Voices, lo que lo hace útil para contenido informativo y de actualidad en suajili, aunque con calidad variable según el dominio.
- Traducción árabe-inglés de titulares y párrafos breves: al ser un modelo a nivel de frase, encaja en pipelines que segmentan primero y traducen después, por ejemplo en agregadores de noticias.
- Prototipado y evaluación de sistemas de traducción: sirve como línea base ajustada frente al modelo zero-shot para experimentos académicos, dado su bajo coste de entrenamiento y su tamaño reducido.
- Generación de subtítulos o transcripciones traducidas: con frases cortas y control del número de tokens de salida, puede integrarse en herramientas de subtitulado entre inglés y francés o suajili, siempre con revisión humana.
- Filtrado y normalización multilingüe en pipelines de datos: traducción de muestras en suajili o árabe al inglés para su clasificación posterior con modelos monolingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación con chrF++ por dirección frente al modelo base zero-shot se publicará en la carpeta `results/` del repositorio, pero no se aportan cifras. La única métrica disponible es la pérdida de validación (1,2304432392120361), que no equivale a calidad de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 600 M parámetros en fp32 ocupa aproximadamente 2,4 GB de pesos; en fp16 unos 1,2 GB. El adaptador LoRA añade una cantidad marginal. Con overhead de activaciones, una GPU con 4-8 GB de VRAM es suficiente para inferencia en fp16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para comodidad (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento del adaptador, una GPU de 16-24 GB es suficiente dado el tamaño del modelo y el rango LoRA.
- Cabe en GPU de consumo: sí, en tarjetas consumer con 8 GB o más, incluyendo portátiles de gama media-alta con fp16.
- Opciones de despliegue: Transformers con PEFT (flujo documentado por el autor), y previsiblemente vLLM o TGI tras fusionar el adaptador con merge_and_unload y exportar el modelo completo. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RousingSea7309/nllb-600M-lora | ~600 M + LoRA | No disponible | en, fr, ar, sw (con inglés) | No disponible | Adaptador especializado; requiere el modelo base |
| facebook/nllb-200-distilled-600M | ~600 M | No disponible | 200 lenguas | CC BY-NC 4.0 | Modelo base zero-shot; el adaptador parte de él |
| Helsinki-NLP/opus-mt-en-sw | ~75 M | No disponible | en-sw | No disponible | Modelo dedicado más pequeño para un solo par |
| facebook/m2m100_418M | ~418 M | No disponible | 100 lenguas | No disponible | Alternativa multilingüe de tamaño similar |

La comparación se limita a datos públicos de los modelos citados; no se dispone de métricas de calidad comparables para este adaptador.

## Limitaciones y advertencias

- Modelo a nivel de frase: es necesario segmentar artículos y textos largos en frases antes de traducir; no está diseñado para párrafos completos.
- El árabe genera salidas aproximadamente 1,8 veces más largas en tokens que el inglés, por lo que conviene mantener las frases origen cortas al traducir hacia árabe.
- Los datos de suajili mezclan noticias (MAFAND-MT, Global Voices) y texto general, con calidad y dominio variables.
- No hay evaluación humana ni resultados de chrF++ publicados en la información disponible; la pérdida de validación no es una medida fiable de calidad.
- La licencia del adaptador no está disponible y los datos de entrenamiento no tienen licencias verificadas en su totalidad; MAFAND-MT es CC BY-NC 4.0 (no comercial), por lo que debe comprobarse cada fuente antes de un uso comercial.
- Riesgo de alucinación y de traducciones inexactas en dominios alejados de los datos de entrenamiento (noticias y texto general), especialmente en suajili.
- No cubre direcciones entre lenguas no inglesas (por ejemplo, fr-ar o fr-sw).
- El token de lengua destino debe forzarse explícitamente; omitirlo produce salidas en la lengua equivocada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RousingSea7309/nllb-600M-lora
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset opus-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset news-commentary: https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- Dataset MAFAND-MT (LAFAND-MT): https://raw.githubusercontent.com/masakhane-io/lafand-mt/main/data/json_files/en-swa/train.json
- Dataset nllb-en-sw-20k: https://huggingface.co/datasets/ArmelRandy/nllb_en_sw_20K
- Dataset en-sw-processed: https://huggingface.co/datasets/amaniopia/en-sw-processed
