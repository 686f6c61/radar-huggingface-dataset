# mradermacher/plamo-3-translate-8b-i1-GGUF

## Resumen

PLaMo 3 Translate 8B es un modelo de traducción automática multilingüe desarrollado por Preferred AI (pfnet) y publicado originalmente en Hugging Face como `pfnet/plamo-3-translate-8b`. Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher bajo el identificador `mradermacher/plamo-3-translate-8b-i1-GGUF`, que emplea cuantizaciones con matrices de importancia (imatrix) para preservar la calidad en tamaños reducidos.

El modelo está especializado en traducción entre 54 idiomas, incluyendo lenguas europeas, asiáticas, de Oriente Medio y africanas, con una arquitectura transformer de aproximadamente 8.500 millones de parámetros. Su propósito es ofrecer traducción de alta calidad con un modelo de tamaño medio que pueda desplegarse en infraestructura moderada, especialmente tras la cuantización.

La relevancia de esta ficha radica en que permite ejecutar un modelo de traducción multilingüe de 8B parámetros en hardware de consumo mediante GGUF, con cuantizaciones que van desde 3,6 GB (Q2_K) hasta 5,1 GB (Q4_K_S), facilitando su integración en aplicaciones locales y pipelines de traducción sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parámetros totales | 8.531.750.912 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, entre otras (imatrix) |
| Idiomas soportados | 54 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer con código personalizado (`custom_code`) y que la librería asociada es `transformers`. El modelo original `pfnet/plamo-3-translate-8b` es un modelo de traducción especializado, pero no se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher empleando matrices de importancia (imatrix) generadas a partir del modelo original. Esta técnica permite que las cuantizaciones de baja precisión (como IQ2 o IQ3) mantengan una perplejidad más cercana a la del modelo en precisión completa que las cuantizaciones estándar del mismo tamaño. El repositorio incluye el archivo imatrix (`plamo-3-translate-8b.imatrix.gguf`) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Traducción automática entre 54 idiomas, incluyendo pares con lenguas de bajos recursos como ceb, jv, si, sw o ur.
- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Soporte multilingüe amplio con cobertura de escrituras latina, cirílica, árabe, devanagari, han, hangul, tailandesa y otras.
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue como servicio.
- Capacidad de traducción bidireccional entre los idiomas listados.
- No se dispone de información sobre tool calling, function calling, agentes o modos de razonamiento extendido en la documentación proporcionada.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías entre los 54 idiomas soportados, con cuantizaciones Q4_K_S de 5,1 GB que caben en GPUs de consumo y permiten procesar documentos localmente sin enviar datos a servicios externos.
- Localización de interfaces de usuario: integrado en pipelines de CI/CD para traducir cadenas de recursos (JSON, YAML) a múltiples idiomas, aprovechando la cobertura de lenguas europeas y asiáticas.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones de soporte entre clientes y agentes que hablan idiomas distintos, con la ventaja de ejecución local que reduce la latencia y protege la privacidad.
- Subtitulado y traducción de contenido audiovisual: procesamiento de transcripciones para generar subtítulos en múltiples idiomas, adecuado para creadores que necesitan cubrir audiencias en varias regiones.
- Investigación lingüística: análisis de pares de traducción y evaluación de fenómenos lingüísticos en lenguas de bajos recursos como ceb, jv o sw, donde los modelos comerciales suelen tener peor cobertura.
- Traducción de correspondencia y documentos legales internos: despliegue en servidores propios para organizaciones que manejan información sensible y no pueden usar APIs externas, con cuantizaciones IQ3 que reducen los requisitos de VRAM.
- Generación de datasets multilingües: uso del modelo para traducción masiva de corpus en tareas de aumento de datos o creación de conjuntos de entrenamiento paralelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - i1-Q2_K (3,6 GB): aproximadamente 4-5 GB de VRAM.
  - i1-IQ3_XXS (3,7 GB): aproximadamente 4-5 GB de VRAM.
  - i1-IQ3_M (4,1 GB): aproximadamente 5-6 GB de VRAM.
  - i1-Q3_K_M (4,4 GB): aproximadamente 5-6 GB de VRAM.
  - i1-Q4_K_S (5,1 GB): aproximadamente 6-7 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones más altas; A100 o H100 para despliegues de alta concurrencia con el modelo en precisión completa.
- Cabe en GPU de consumo: sí, todas las cuantizaciones listadas caben en GPUs con 8 GB o más de VRAM, e incluso las más pequeñas en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo original es compatible con transformers y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B (esta ficha) | 8,53B | No disponible | 54 | plamo-community-license | GGUF, safetensors |
| Alternativas de traducción de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda evaluar alternativas como NLLB-200 o M2M-100, pero no se incluyen datos comparativos porque no están disponibles en la información de referencia.

## Limitaciones y advertencias

- La licencia `plamo-community-license` puede imponer restricciones al uso comercial; es necesario revisar los términos completos en el enlace oficial antes de desplegar el modelo en producción.
- No se dispone de información sobre sesgos conocidos del modelo; como todo modelo entrenado con datos web, es probable que presente sesgos de género, culturales y geográficos, pero no se documentan explícitamente.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de traducción, el riesgo se manifiesta como traducciones inventadas o mistraducciones en pares de idiomas con pocos datos.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento en documentos largos; se recomienda validar empíricamente antes de usar en producción con textos extensos.
- La calidad puede variar significativamente entre pares de idiomas; las lenguas de bajos recursos (ceb, jv, si, sw) probablemente tengan un rendimiento inferior al de los pares con más datos.
- Las cuantizaciones de baja precisión (Q2_K, IQ2) pueden degradar la calidad de traducción; se recomienda Q4_K_S o superior para uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente sin validación comunitaria extensa.
- El tamaño del repositorio (74,2 GB) incluye todas las cuantizaciones; es necesario descargar solo el archivo GGUF deseado.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/plamo-3-translate-8b-i1-GGUF
- Modelo base original: https://huggingface.co/pfnet/plamo-3-translate-8b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/plamo-3-translate-8b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#plamo-3-translate-8b-i1-GGUF
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
