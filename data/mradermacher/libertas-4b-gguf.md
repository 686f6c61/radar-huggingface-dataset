# mradermacher/Libertas-4b-GGUF

## Resumen

Libertas-4b-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo finnianx/Libertas-4b, publicada por el usuario mradermacher. El modelo original es un transformer de 4.022.468.096 parámetros (aproximadamente 4 mil millones) orientado a uso conversacional y etiquetado para el idioma inglés. Esta ficha cubre específicamente el repositorio de cuantizaciones, que es el artefacto distribuido en HuggingFace bajo el identificador mradermacher/Libertas-4b-GGUF.

La relevancia de este repositorio radica en que permite ejecutar un modelo de 4B en hardware de consumo mediante llama.cpp y derivados, con 12 variantes de cuantización que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16). El repositorio acumula 189 descargas y 1 like en el momento de la consulta, lo que indica una adopción modesta. No se dispone de información sobre el pipeline, la licencia del modelo base ni los detalles de entrenamiento en la información proporcionada.

Es importante señalar que mradermacher actúa únicamente como cuantizador: no ha entrenado el modelo ni publicado detalles sobre su arquitectura interna, dataset o proceso de alineación. Toda la información técnica disponible se limita al recuento de parámetros, el tamaño del repositorio, los formatos de cuantización ofrecidos y el modelo base de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base finnianx/Libertas-4b; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |
| Tamano del repositorio | 36,4 GB |
| Etiquetas | transformers, gguf, en, base_model:finnianx/Libertas-4b, endpoints_compatible, conversational |
| Fecha de creacion | 2026-05-15 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base finnianx/Libertas-4b en los datos proporcionados. El recuento de parámetros (4.022.468.096) y el tamaño del repositorio (36,4 GB) son compatibles con un transformer decoder-only de aproximadamente 4B parámetros en precisión de 16 bits, pero esto es una inferencia a partir de los metadatos, no un dato confirmado. No se ha publicado en esta información el número de capas, dimensiones ocultas, cabezas de atención ni el tipo de atención empleado.

Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El modelo está etiquetado como "conversational", lo que sugiere algún tipo de ajuste para diálogo, pero se desconoce el método. El cuantizador mradermacher indica en la model card que las cuantizaciones son estáticas y que no ha generado variantes con imatrix (weighted) en el momento de la publicación, lo que implica que no se aplicó calibración por importancia de pesos en estas versiones.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica que está orientado a mantener diálogos multi-turno, aunque no se especifican detalles sobre la calidad o el formato de las respuestas.
- Idiomas: únicamente inglés según los metadatos del repositorio; no hay indicios de soporte multilingüe.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de HuggingFace.
- No se ha confirmado soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento (thinking mode) en la información disponible.
- El formato GGUF permite su uso con llama.cpp y ecosistemas derivados (Ollama, LM Studio, etc.), lo que habilita inferencia en CPU y GPU de consumo.

## Casos de uso

- Prototipado de chatbots en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (2,5 y 2,6 GB), el modelo puede ejecutarse en un portátil con 8 GB de RAM para probar flujos conversacionales sin depender de servicios en la nube.
- Asistentes conversacionales de bajo coste: con la cuantización Q8_0 (4,4 GB) se puede desplegar en una GPU de consumo como una RTX 3060 de 12 GB, ofreciendo respuestas en inglés para aplicaciones de atención al usuario con requisitos de privacidad.
- Integración en pipelines de CI/CD para pruebas de regresión conversacional: al ser un GGUF ligero (Q4_K_M, 2,6 GB), se puede incluir en contenedores de test para validar respuestas del modelo ante cambios de prompt.
- Experimentación académica con modelos de 4B: investigadores que necesiten un modelo pequeño en inglés para estudios comparativos de cuantización pueden usar las 12 variantes para medir el impacto de la precisión en la perplejidad y la calidad de salida.
- Despliegue en dispositivos edge con llama.cpp: la variante Q2_K (1,8 GB) permite ejecutar el modelo en dispositivos con recursos muy limitados, aunque con degradación de calidad esperada.
- Generación de texto offline en entornos air-gapped: al no requerir conexión, el modelo en formato GGUF puede usarse en sistemas aislados para tareas de redacción o resumen en inglés, siempre que se valide la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_S: ~2,0 GB
  - Q3_K_M: ~2,2 GB
  - Q3_K_L: ~2,3 GB
  - IQ4_XS: ~2,4 GB
  - Q4_K_S: ~2,5 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_S: ~2,9 GB
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
- GPU recomendadas: no hay datos específicos del autor. Por tamaño, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) pueden alojar cualquier cuantización con holgura; una RTX 3050 (8 GB) o GTX 1660 (6 GB) pueden con Q4_K_M o inferiores. Para f16 se recomienda al menos 10-12 GB de VRAM.
- Cabe en GPU de consumo: sí, todas las cuantizaciones hasta Q8_0 caben en GPUs de consumo con 6 GB o más; f16 requiere 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No se ha confirmado compatibilidad con vLLM o TGI para este formato específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base (contexto, licencia, arquitectura) que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible" para los campos que requerirían datos no presentes en la información.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Libertas-4b-GGUF | 4,02B | no disponible | no disponible | GGUF | HuggingFace (189 descargas) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia desconocida: no se ha especificado la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia en el repositorio finnianx/Libertas-4b antes de cualquier despliegue en producción.
- Idioma limitado al inglés: no hay soporte multilingüe declarado, por lo que no es adecuado para aplicaciones en castellano u otros idiomas sin una evaluación previa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación; al ser un modelo de 4B, es esperable una mayor propensión a errores factuales que modelos de mayor tamaño, aunque no hay datos que lo confirmen.
- Sesgos: no se ha documentado ningún análisis de sesgos en la información disponible.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide garantizar el rendimiento en conversaciones largas o documentos extensos.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Se recomienda Q4_K_M o superior para uso real.
- Sin cuantizaciones imatrix: el autor indica que no ha generado variantes ponderadas por imatrix, que suelen ofrecer mejor calidad a igual tamaño.
- Adopción muy baja: 189 descargas y 1 like sugieren poca validación por parte de la comunidad; no hay informes independientes de calidad.
- Modelo base sin documentación pública en esta ficha: se desconoce el proceso de entrenamiento y alineación, lo que dificulta anticipar comportamientos en dominios sensibles.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Libertas-4b-GGUF
- Modelo base: https://huggingface.co/finnianx/Libertas-4b
- Página de overview del cuantizador: https://hf.tst.eu/model#Libertas-4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
