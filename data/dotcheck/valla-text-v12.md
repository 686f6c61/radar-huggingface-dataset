# DotCheck/valla-text-v12

## Resumen

DotCheck/valla-text-v12, también denominado Valla@12.2, es un detector de texto generado por inteligencia artificial desarrollado por DotCheck. Se trata de un clasificador binario que estima la probabilidad \(P(\mathrm{AI})\) de que un fragmento de texto haya sido escrito por un modelo de lenguaje, a partir de una cadena UTF-8 y un código de idioma explícito. El modelo no evalúa la veracidad del contenido, sino únicamente su origen (humano o sintético).

La arquitectura combina dos grupos de encoders congelados: para las lenguas latinas (inglés, español, portugués, francés, italiano, alemán y neerlandés) utiliza las características de los modelos Oxidane/tmr-ai-text-detector y fakespot-ai/roberta-base-ai-text-detection-v1, mientras que para chino simplificado emplea el embedding `cls_emb` de hfl/chinese-macbert-base. Sobre estas representaciones fijas se aplican cabezas logísticas específicas por idioma, almacenadas en archivos `.npz`. El modelo está pensado para integrarse en pipelines de moderación, verificación de autenticidad y control de calidad de contenido, y se distribuye bajo licencia Apache-2.0.

La relevancia actual de este modelo radica en su enfoque multilingüe y en su diseño ligero: al no requerir el reentrenamiento de los encoders, puede desplegarse en CPU con un coste computacional reducido. Además, el autor declara resultados de precisión equilibrada superiores a 0,97 en los idiomas evaluados, con un rendimiento especialmente alto en inglés (0,995 de balanced accuracy).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador logístico sobre encoders congelados (TMR + Fakespot para lenguas latinas; MacBERT para chino) |
| Parametros totales | no disponible (los encoders base no se redistribuyen en este repositorio; las cabezas `.npz` son de tamaño reducido) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo generativo; la entrada es texto de longitud variable, con límites de política de producto) |
| Tipos de cuantizacion | no disponible (los pesos de las cabezas son ficheros `.npz` de precisión flotante) |
| Idiomas soportados | en, zh (simplificado), es, pt (variante brasileña), fr, it, de, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (cabezas logísticas); los encoders base son checkpoints de Hugging Face no incluidos en este repositorio |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. Primero, el texto se limpia mediante un preprocesador denominado TC1, que elimina citas de estilo wiki, colapsa espacios en blanco y descarta tokens de categoría. A continuación, según el idioma declarado, se obtienen las características de uno de los dos grupos de encoders congelados: para las lenguas latinas se concatenan las salidas de TMR y Fakespot; para chino se extrae el embedding `cls_emb` de MacBERT. Sobre ese vector fijo se aplica una regresión logística específica del idioma, cuyo resultado es la probabilidad \(p \in [0,1]\) de que el texto sea de origen sintético.

El entrenamiento de las cabezas se realizó con datos generados comercialmente: para inglés, los ejemplos de IA se obtuvieron con Qwen2.5-7B, Mistral-7B y Grok-4.5, mientras que el conjunto de validación (holdout) usó Qwen2.5-1.5B con un sesgo enciclopédico. Los textos humanos en inglés provienen de una muestra de Gutenberg.org (40%), Wikipedia (35%) y WikiText (25%), segmentados en ventanas de 520 a 1100 caracteres. Para las demás lenguas latinas se mantuvieron mezclas similares de wiki, WikiText y Gutenberg; el chino humano se obtuvo de prosa inicial de Wikipedia convertida a chino simplificado con OpenCC. No se emplearon conjuntos de datos con licencia no comercial ni textos extraídos de ChatGPT o Claude en producción.

Una innovación destacable es el diseño de "entrenar = servir" para la ruta china: la extracción de características y la cabeza logística se ejecutan de forma idéntica en entrenamiento e inferencia. Además, el modelo falla de forma segura ante idiomas no soportados, devolviendo `unsupported_language` sin puntuación, y no ofrece un respaldo silencioso al inglés.

## Capacidades

- Detección binaria de texto generado por IA: clasifica un fragmento como humano o sintético, devolviendo una probabilidad \(p \in [0,1]\).
- Soporte multilingüe para ocho idiomas: inglés, chino simplificado, español, portugués (variante brasileña), francés, italiano, alemán y neerlandés.
- Manejo de texto largo: el preprocesador TC1 normaliza el texto y elimina ruido (citas, espacios, tokens de categoría) antes de la clasificación.
- Sin dependencia de modelos generativos: al usar encoders congelados, la inferencia es rápida y adecuada para despliegue en CPU.
- Fallo seguro ante idiomas no soportados: devuelve `unsupported_language` en lugar de una puntuación incorrecta.
- No evalúa la veracidad de las afirmaciones, solo el origen del texto (escritura humana vs. sintética).

## Casos de uso

- Moderación de contenido en plataformas editoriales: el modelo puede integrarse en un pipeline de revisión para marcar artículos o comentarios sospechosos de ser generados por IA, ayudando a mantener la transparencia sobre el origen del contenido.
- Verificación de autenticidad en entornos académicos: instituciones educativas pueden usarlo como herramienta de apoyo para detectar ensayos o trabajos generados automáticamente, aunque debe complementarse con criterios humanos.
- Control de calidad en agencias de marketing y redacción: agencias que producen contenido para clientes pueden validar que los textos entregados sean originales y no contengan pasajes generados por IA sin declarar.
- Filtrado de spam y contenido automatizado en foros y redes sociales: el detector puede clasificar mensajes generados por bots y priorizar su revisión manual.
- Auditoría de contenido en medios de comunicación: redacciones que necesitan garantizar que las noticias y reportajes sean de autoría humana pueden aplicar el modelo como una capa de verificación adicional.
- Integración en APIs de análisis de texto: empresas que ofrecen servicios de análisis de sentimiento o extracción de información pueden añadir una señal de "probabilidad de IA" a sus resultados, enriqueciendo la información para sus clientes.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en su model card, medidos sobre conjuntos de validación propios (holdout). No se han publicado comparaciones con otros detectores en la información disponible.

| Idioma | Conjunto | Media P(AI) en humanos | Media P(AI) en IA | Balanced accuracy |
|---|---|---|---|---|
| en | DotCheck text holdout EN | 0,012 | 1,000 | 0,995 |
| zh | inhouse-text-zh_v1 | 0,033 | 0,973 | 0,972 |
| es | inhouse-text-es_v3 | 0,029 | 0,993 | 0,982 |
| fr | inhouse-text-fr_v3 | 0,021 | 0,990 | 0,978 |

El autor también indica que el modelo supera al anterior `@11` en el holdout inglés y cumple los umbrales de producto (RAID-lite, canary/style v2), aunque no se proporcionan métricas numéricas adicionales.

## Requisitos de hardware

- Al ser un clasificador sobre características congeladas, la inferencia es ligera y puede ejecutarse en CPU sin necesidad de GPU.
- Los encoders base (TMR, Fakespot, MacBERT) son los que requieren más recursos, pero no se redistribuyen en este repositorio; el usuario debe cargarlos por separado si desea reproducir el pipeline completo.
- El repositorio contiene únicamente las cabezas `.npz` (ocho ficheros), cuyo tamaño total es inferior a 1 MB, por lo que el almacenamiento y la carga en memoria son triviales.
- Para despliegue en producción, se recomienda un servicio FastAPI en CPU (el autor menciona `POST /v1/analyze-text` con parámetro `lang` obligatorio). No se requieren GPUs específicas.
- La latencia dependerá del encoder base utilizado: para lenguas latinas, la inferencia de TMR y Fakespot domina el coste; para chino, la de MacBERT. No se han publicado cifras de throughput.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con otros detectores de texto IA (por ejemplo, GPTZero, Originality.ai o modelos de Hugging Face como `roberta-base-ai-text-detection-v1`). El autor menciona que el modelo supera a su versión anterior `@11` en el holdout inglés, pero no ofrece datos comparativos con terceros. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Enfoque | Idiomas | Licencia | Balanced accuracy (declarado) |
|---|---|---|---|---|
| DotCheck/valla-text-v12 | Cabezas logísticas sobre encoders congelados | 8 | Apache-2.0 | 0,995 (en) |
| fakespot-ai/roberta-base-ai-text-detection-v1 | Fine-tuning de RoBERTa | Principalmente inglés | Apache-2.0 | no disponible |
| Oxidane/tmr-ai-text-detector | Detector de texto IA | no disponible | MIT | no disponible |

## Limitaciones y advertencias

- El modelo solo clasifica el origen del texto (humano vs. IA), no la veracidad de las afirmaciones. Un texto generado por IA puede ser factualmente correcto y un texto humano puede contener errores.
- No hay respaldo silencioso al inglés: si el idioma no está soportado, el modelo devuelve `unsupported_language` y no produce puntuación. El chino tradicional no se puntúa (devuelve `und`).
- El rendimiento en otros idiomas distintos de los ocho soportados no está garantizado; el autor no ha publicado resultados para lenguas fuera de ese conjunto.
- Los datos de entrenamiento para inglés incluyen generación con modelos propietarios (Grok-4.5) y de código abierto (Qwen2.5, Mistral), pero no se especifica la proporción exacta ni la diversidad de dominios. El holdout es un subconjunto pequeño (Qwen2.5-1.5B) y puede no representar la variedad de textos generados por otros LLM.
- El modelo puede tener sesgos hacia ciertos estilos de escritura: los textos humanos de entrenamiento provienen de Gutenberg, Wikipedia y WikiText, lo que podría afectar a la detección en dominios muy diferentes (por ejemplo, correos electrónicos informales o chats).
- No se han publicado estudios de robustez frente a ataques adversarios (parafraseo, inserción de errores, etc.). En entornos de producción, es recomendable combinar este detector con otras señales.
- La licencia Apache-2.0 permite uso comercial, pero los encoders base (TMR, Fakespot, MacBERT) tienen sus propias licencias (MIT y Apache-2.0 respectivamente), que deben respetarse al redistribuir el sistema completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DotCheck/valla-text-v12
- Documentación técnica de DotCheck (PDF): https://dotcheck.ai/media/docs/dotcheck-model-card-v2026.7.pdf
- Sitio web de DotCheck: https://dotcheck.ai
- Documentación de la API Pro: https://dotcheck.ai/api
- Documentación técnica (en neerlandés): https://dotcheck.ai/nl/docs
- Repositorio de la organización DotCheck en Hugging Face: https://huggingface.co/DotCheck/dotcheck
- Modelo base TMR: https://huggingface.co/Oxidane/tmr-ai-text-detector
- Modelo base Fakespot: https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1
- Modelo base MacBERT: https://huggingface.co/hfl/chinese-macbert-base
