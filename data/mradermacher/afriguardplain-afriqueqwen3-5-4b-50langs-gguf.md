# mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-GGUF

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-GGUF es una recopilación de cuantizaciones GGUF publicada por mradermacher sobre el modelo adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs, un modelo de 4.205.751.296 parámetros (~4,2B) orientado a tareas de seguridad y moderación en lenguas africanas. La familia base, AfriqueQwen3.5, procede del ecosistema de modelos multilingües africanos asociado a McGill-NLP, y en esta variante "AfriGuard" se ha ajustado sobre el dataset adzcai/AfriGuard-plain con herramientas de llama-factory.

El modelo resuelve un problema concreto: la práctica totalidad de los clasificadores de seguridad y guardrails desplegados en producción están entrenados y evaluados casi exclusivamente en inglés, lo que deja sin cobertura a decenas de lenguas africanas con millones de hablantes. Al cubrir idiomas como amárico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulú, junto con el inglés, habilita pipelines de moderación y filtrado de contenido en mercados donde antes no existía una alternativa abierta de este tipo.

Esta ficha describe específicamente el repositorio GGUF, no el modelo original en safetensors. El valor del repositorio es operativo: ofrece 12 niveles de cuantización (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB) que permiten ejecutar un modelo de 4,2B en hardware de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF. La licencia es CC-BY-4.0, lo que facilita el uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; el nombre de la familia (Qwen3.5) sugiere un transformer decoder-only denso derivado de Qwen, sin confirmar |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, am, ha, ig, om, sn, sw, tw, wo, yo, zu (etiquetados; el nombre del modelo menciona 50 idiomas, no se detalla la lista completa) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 38,9 GB (incluye todas las cuantizaciones) |
| Dataset de ajuste | adzcai/AfriGuard-plain |
| Herramienta de cuantizacion | llama.cpp via mradermacher (quantize_version 2, output_tensor_quantised 1) |
| Fecha de publicacion | 26 de septiembre de 2026 (creado), 26 de septiembre de 2026 (actualizado) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. El identificador "AfriqueQwen3.5" apunta a un linaje derivado de la familia Qwen3, y el recuento de parametros (~4,2B) es consistente con un transformer decoder-only denso, pero no se confirma ningún detalle sobre número de capas, dimensiones ocultas, tipo de atención ni mecanismos adicionales (MoE, SSM o híbridos). Cualquier afirmación más concreta sobre la topología sería especulativa.

En cuanto al entrenamiento, la model card solo declara el uso del dataset adzcai/AfriGuard-plain y de llama-factory como marco de ajuste. No se especifican el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por preferencias. El sufijo "Plain" en el nombre del modelo y su variante hermana "Instruct" sugieren que existen al menos dos versiones con objetivos distintos, pero no se documenta en la información disponible qué diferencia exactamente a la variante Plain.

La innovación relevante aquí no está en la arquitectura sino en la cobertura lingüística y en el propósito: un modelo de seguridad ajustado específicamente para lenguas africanas de bajos recursos. Este repositorio añade valor de despliegue al convertir el modelo a GGUF con 12 niveles de cuantización, incluyendo opciones IQ (IQ4_XS) que ofrecen mejor relación calidad/tamaño que las K-quants equivalentes según la documentación habitual de llama.cpp.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está preparado para diálogo multi-turno.
- Tareas de seguridad y moderación: el linaje AfriGuard y el dataset AfriGuard-plain apuntan a clasificación de contenido dañino, filtrado de prompts y respuestas, y evaluación de riesgos.
- Multilingüismo africano: cobertura etiquetada de amárico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulú, además del inglés.
- Posible clasificación de seguridad bilingüe: el par inglés + lenguas africanas permite evaluar contenido cross-lingüe (prompt en una lengua, salida en otra).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; los metadatos de cuantización indican `skip_mmproj`, lo que sugiere que estos GGUF no incluyen proyector multimodal.
- Modo "thinking" explícito: no documentado; la variante "Plain" podría implicar ausencia de trazas de razonamiento, pero no se confirma.

## Casos de uso

- Moderación de contenido en plataformas africanas: desplegar el modelo como clasificador de toxicidad, discurso de odio o contenido inseguro en suajili, hausa o yoruba, idiomas donde los moderadores comerciales apenas tienen cobertura. El tamaño de 4,2B permite ejecutarlo en servidores modestos junto al modelo generador principal.

- Guardrail de entrada y salida en pipelines LLM: integrarlo como filtro previo al prompt y posterior a la respuesta de un modelo mayor, evaluando si el contenido viola políticas de seguridad en cualquiera de los idiomas soportados. La cuantización Q4_K_M (2,8 GB) permite añadir este filtro con un coste de VRAM mínimo.

- Atención al cliente multilingüe en mercados africanos: gestionar conversaciones en lenguas locales combinando el modelo con un sistema RAG. La cobertura de 11 idiomas etiquetados reduce la necesidad de contratar modelos separados por región.

- Investigación en NLP de bajos recursos: usar la variante f16 o Q8_0 como referencia para estudiar el comportamiento de modelos multilingües en lenguas africanas, analizar sesgos o generar datos anotados de seguridad para construir corpus de evaluación.

- Despliegue en edge u on-premise: con Q2_K (2,0 GB) o Q3_K_S (2,2 GB) el modelo entra en dispositivos con poca memoria o en servidores sin GPU dedicada, algo relevante para organizaciones que no pueden enviar datos a APIs en la nube por cumplimiento normativo.

- Evaluación y auditoría de sesgos en sistemas de IA: emplearlo como herramienta de análisis para medir cómo distintos modelos generativos responden a prompts sensibles en lenguas africanas, comparando tasas de rechazo y de generación de contenido dañino.

- Anotación asistida y generación de datos sintéticos: producir ejemplos etiquetados de contenido seguro/inseguro en lenguas africanas para entrenar o evaluar clasificadores propios, aprovechando que el modelo ya está ajustado en ese dominio.

- Filtrado de corpus para entrenamiento: aplicar el modelo como clasificador sobre grandes volúmenes de texto web en lenguas africanas para eliminar contenido tóxico antes de usarlo en el preentrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados de búsqueda obtenidos no aportan métricas (MMLU, HumanEval, GSM8K u otras) ni para este repositorio GGUF ni para el modelo base adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs.

## Requisitos de hardware

- Tamano de los ficheros por cuantizacion (datos del autor): Q2_K 2,0 GB; Q3_K_S 2,2 GB; Q3_K_M 2,4 GB; Q3_K_L 2,5 GB; IQ4_XS 2,6 GB; Q4_K_S 2,7 GB; Q4_K_M 2,8 GB; Q5_K_S 3,1 GB; Q5_K_M 3,2 GB; Q6_K 3,6 GB; Q8_0 4,6 GB; f16 8,5 GB.
- VRAM estimada: el consumo real es el tamaño del fichero mas la cache KV mas el overhead del runtime. Para un modelo de ~4,2B conviene reservar un margen adicional que crece con la longitud de contexto; el autor no publica cifras de cache KV para este modelo.
- GPU de consumo: con Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) el modelo cabe comodamente en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y en muchas de 6 GB con Q3/Q4. Las cuantizaciones Q2_K y Q3_K_S permiten incluso tarjetas de 4 GB.
- GPU de gama alta: Q8_0 (4,6 GB) y f16 (8,5 GB) caben sin problema en RTX 4090, RTX 3090, A100, H100 y L40S, dejando amplio margen para contexto largo y batching. Para un modelo de este tamaño, estas GPUs estan sobredimensionadas salvo que se busque throughput alto.
- CPU y Apple Silicon: al ser GGUF, el modelo puede ejecutarse en CPU con llama.cpp. Un Mac con memoria unificada de 16 GB puede cargar cualquier cuantizacion; con 8 GB son viables Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para servir en produccion con concurrencia, llama-cpp-python con servidor OpenAI-compatible o vLLM si se dispone de los pesos en safetensors del modelo base. El repositorio tambien declara `endpoints_compatible` en sus etiquetas.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.
- Almacenamiento: clonar el repositorio completo requiere 38,9 GB; para descargar una sola cuantizacion basta con el fichero correspondiente, entre 2,0 y 8,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-GGUF (este) | 4,2B | GGUF (12 cuantizaciones) | 11 etiquetados, nombre indica 50 | CC-BY-4.0 | Seguridad y moderacion en lenguas africanas, cuantizado |
| adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs (base) | 4,2B | safetensors | 11 etiquetados, nombre indica 50 | No disponible en la informacion | Modelo original de seguridad AfriGuard |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs | No disponible | No disponible | 50 (segun nombre) | No disponible | Modelo base multilingue africano |
| mradermacher/AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF | ~4B segun denominacion | GGUF | 50 (segun nombre) | No disponible en la informacion | Variante instructiva del modelo base, sin ajuste AfriGuard |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, cobertura idiomatica y licencia.

## Limitaciones y advertencias

- Rendimiento no verificado: el repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks. No hay evidencia publica de su calidad en tareas de moderacion o generacion.
- Cobertura idiomatica incierta: el nombre indica 50 idiomas, pero solo 11 aparecen etiquetados. El rendimiento real en idiomas no etiquetados es desconocido.
- Riesgo de alucinacion: es un modelo de 4,2B ajustado sobre un dataset especifico. Fuera de ese dominio puede generar contenido incorrecto o incoherente, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Sesgos potenciales: la composicion del dataset AfriGuard-plain no esta documentada en la informacion disponible. Los criterios de "seguridad" pueden reflejar sesgos culturales o linguisticos del corpus de anotacion, y la nocion de contenido dañino puede variar entre paises y comunidades.
- Sin garantias de robustez adversarial: no se documentan evaluaciones frente a prompts maliciosos, evasiones con transliteracion, mezcla de idiomas o code-switching, tecnicas habituales para saltarse guardrails multilingues.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoria. Conviene revisar los terminos del modelo base y del dataset, cuyas licencias no se detallan en la informacion proporcionada y podrian imponer condiciones adicionales.
- Fecha de publicacion inusual: los metadatos indican creacion el 26 de septiembre de 2026. Conviene verificar la vigencia y el estado del repositorio antes de depender de el en produccion.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan notablemente la calidad respecto a Q4 o superior. Para tareas de seguridad, donde la calibracion importa, se recomienda Q4_K_M o superior y validar con un conjunto propio.
- Sin fichero mmproj en las cuantizaciones: los metadatos indican `skip_mmproj`, por lo que estos GGUF son de texto. No cabe esperar capacidades multimodales en este repositorio.
- Contexto desconocido: al no documentarse la longitud de contexto soportada, no debe asumirse que el modelo maneje ventanas largas. Conviene probar el limite real antes de disenar flujos con documentos extensos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-GGUF
- Modelo base: https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs
- Dataset de ajuste: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia sobre uso de GGUF (README de TheBloke citado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo base de la familia AfriqueQwen3.5 en McGill-NLP: https://llm-explorer.com/model/McGill-NLP%2FAfriqueQwen3.5-4B-50Langs,4HbjPxqgoF7DcAZsHTwhUy
- Variante GGUF relacionada (AfriqueQwen3.5-4B-GGUF): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-GGUF
- Variante instructiva relacionada: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF
