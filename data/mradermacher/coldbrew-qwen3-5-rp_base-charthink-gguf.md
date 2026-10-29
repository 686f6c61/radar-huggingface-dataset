# mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF

## Resumen

mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF es un conjunto de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink, un ajuste fino orientado a rol y conversación construido sobre la familia Qwen 3.5. El modelo subyacente tiene 8.953.803.264 parámetros (≈8,95 mil millones), es de tipo denso y se distribuye bajo licencia Apache 2.0. Este repositorio no aporta pesos nuevos: su valor está en empaquetar el modelo en formatos ligeros (de Q2_K a f16) utilizables con llama.cpp y derivados.

La relevancia práctica es doble. Por un lado, permite ejecutar un modelo de casi 9B en hardware de consumo: la cuantización Q2_K ocupa 3,9 GB y la Q4_K_S 5,5 GB, frente a los 18 GB del f16. Por otro, el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora un proyector multimodal empaquetable junto a los pesos de lenguaje. El modelo está etiquetado únicamente en inglés y no cuenta con métricas de adopción: 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación comunitaria de su calidad.

Se trata, por tanto, de un artefacto de distribución más que de un modelo de propósito general: su interés se concentra en el nicho de roleplay y narrativa conversacional, y en la experimentación con cuantizaciones estáticas de un fine-tune de la familia Qwen 3.5. No hay información publicada sobre contexto, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen 3.5 (fine-tune conversacional/RP); incluye proyector multimodal (`mmproj`) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | No aplica: no se documenta una variante MoE; sin datos de parámetros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q4_K_S, Q6_K, Q8_0, f16 (ficheros publicados); la cabecera de la model card declara además Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) con ficheros complementarios `mmproj` Q8_0 y f16 |
| Modelo base | SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink |
| Autor de la cuantización | mradermacher (versión de quantize: 2, salida tensor-quantised, convert_type hf) |
| Tamaño del repositorio | 49,8 GB |
| Fecha de creación / actualización | 2026-10-29 / 2026-10-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo de partida es un transformer denso de la familia Qwen 3.5 con 8,95 B de parámetros, ajustado por SvalTek bajo la denominación "ColdBrew" y con el sufijo "CharThink", que apunta a un modo de razonamiento orientado a la consistencia de personaje en conversaciones de rol. La model card no documenta número de tokens de entrenamiento, composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado; la etiqueta `unsloth` sugiere el uso de ese framework de entrenamiento, pero no se detalla la receta. Tampoco se especifica la longitud de contexto nativa ni la configuración de atención.

El trabajo realizado en este repositorio es exclusivamente de cuantización: se generan ficheros GGUF estáticos (sin versiones weighted/imatrix, según indica el propio autor) a partir de los pesos en formato Hugging Face, con salida tensor-quantised. La presencia de dos ficheros `mmproj` (0,7 GB en Q8_0 y 1,0 GB en f16) confirma que el modelo base incluye un proyector multimodal que debe cargarse junto al modelo de lenguaje para habilitar la entrada de imágenes; qué modalidades exactas cubre y con qué resolución no está documentado.

## Capacidades

- Generación de texto conversacional multi-turno, con especialización declarada en roleplay y consistencia de personaje.
- Modo "CharThink": razonamiento interno orientado al personaje, según la nomenclatura del modelo base; no se detalla su funcionamiento.
- Entrada multimodal a través del proyector `mmproj` incluido en el repositorio (visión); las modalidades concretas no están documentadas.
- Capacidad multilingüe limitada: el modelo está etiquetado exclusivamente en inglés.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades matemáticas y de código: no documentadas específicamente; al derivar de Qwen 3.5 se esperan competencias generales, pero no hay evidencia publicada en este repositorio.
- Ejecución local en CPU/GPU mediante llama.cpp y compatible con el ecosistema GGUF (Ollama, LM Studio, etc.).

## Casos de uso

- Roleplay y chat de personajes en local: el ajuste ColdBrew/CharThink está diseñado para mantener voz y motivaciones de personaje a lo largo de conversaciones largas; la versión Q4_K_S (5,5 GB) permite ejecutarlo en una GPU de 8-12 GB sin enviar datos a terceros.
- Escritura creativa y narrativa asistida: generación de diálogos, subtramas y borradores de ficción, aprovechando la especialización conversacional del fine-tune frente a un modelo base genérico.
- Prototipado de NPCs para videojuegos: el modelo puede servir como backend de diálogo para personajes no jugables en una fase de preproducción, con la ventaja de que la licencia Apache 2.0 permite integrarlo en builds internas sin fricción legal.
- Evaluación comparativa de cuantizaciones: al publicarse desde Q2_K hasta f16, es un caso útil para medir la degradación de calidad de un fine-tune RP según el nivel de cuantización en tareas de coherencia narrativa.
- Desarrollo de asistentes con entrada de imágenes: cargando el `mmproj` Q8_0 junto con los pesos de lenguaje se puede construir un prototipo multimodal (por ejemplo, comentar una captura de pantalla o una ilustración) en un solo equipo.
- Investigación sobre fine-tunes de la familia Qwen 3.5: sirve como muestra de cómo se comporta un ajuste RP de ~9B tras cuantización estática, comparable con otros derivados ColdBrew de la misma familia.
- Despliegue en entornos con requisitos de privacidad: industria sanitaria, legal o educativa donde no se permite el envío de conversaciones a APIs externas; el formato GGUF facilita la ejecución on-premise en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar los ficheros de cuantización y a enlazar material genérico sobre calidad de cuantizaciones (gráfico de perplejidad de ikawrakow y notas de Artefact2), sin cifras propias de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV y overhead, sin contar el proyector): Q2_K ≈ 4-5 GB; Q3_K_S ≈ 5-6 GB; Q4_K_S ≈ 6,5-7,5 GB; Q6_K ≈ 8,5-9,5 GB; Q8_0 ≈ 10,5-12 GB; f16 ≈ 19-21 GB.
- Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16) que deben sumarse si se activa la entrada de imágenes.
- GPU de consumo: una RTX 3060 de 12 GB admite Q4_K_S, Q6_K y Q8_0 con contexto moderado; una RTX 4060 Ti de 16 GB o una RTX 4070 Ti Super trabajan cómodamente en Q8_0; una RTX 4090 de 24 GB permite f16 completo o Q8_0 con contexto amplio.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S para servir varias instancias en paralelo o mantener contextos largos; el modelo, al ser denso de 9B, no requiere tensor parallelism para una sola instancia en Q8_0.
- Despliegue: llama.cpp (referencia para GGUF), Ollama y LM Studio como opciones más directas; vLLM y TGI admiten GGUF de forma experimental o parcial. El tag `text-generation-inference` aparece en el repositorio, pero no se documenta una configuración verificada para TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF | 8,95 B | No disponible | GGUF (Q2_K–f16) + mmproj | Apache 2.0 | Objeto de esta ficha; 0 descargas |
| SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink | 8,95 B (heredado) | No disponible | Safetensors (Hugging Face) | Apache 2.0 (heredada) | Modelo base sin cuantizar; requiere transformers y mayor VRAM |
| SvalTek/ColdBrew-Qwen3.5-CharThink-Base-GGUF | ≈9 B según la ficha del autor | No disponible | GGUF | No disponible | Variante GGUF publicada por el propio autor del fine-tune; receta de cuantización no detallada |
| mradermacher/Q3.5-ColdBrew-9B-Base-v2-Intrepid-i1-GGUF | ≈9 B según la ficha del autor | No disponible | GGUF (imatrix) | No disponible | Otro derivado ColdBrew de 9B cuantizado por el mismo autor, con cuantización imatrix en lugar de estática |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 likes. No hay informes de terceros sobre calidad, estabilidad ni comportamiento del modelo.
- Sin benchmarks publicados: no es posible estimar su rendimiento relativo frente a otros fine-tunes RP de tamaño similar.
- Modelo especializado en rol: un ajuste de este tipo puede producir respuestas desalineadas con usos profesionales, derivas de personaje y contenido sensible si no se aplican filtros o system prompts adecuados.
- Riesgo de alucinación inherente a un modelo de 9B, agravado por la falta de documentación sobre datos de entrenamiento y por posibles lagunas en conocimiento factual.
- Cobertura lingüística limitada al inglés: el rendimiento en castellano no está garantizado ni evaluado y previsiblemente será inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin verificación empírica previa.
- Las cuantizaciones Q2_K y Q3_K_S degradan la coherencia de forma notable en modelos de este tamaño; para producción conviene partir de Q4_K_S o superior.
- Licencia Apache 2.0 declarada, pero el modelo base es un fine-tune de un modelo de terceros: conviene verificar las condiciones de la familia Qwen 3.5 y del repositorio original antes de un uso comercial.
- Ficheros `mmproj` incluidos sin documentación de uso: la multimodalidad requiere pruebas propias y compatibilidad verificada con la versión de llama.cpp empleada.
- No se ofrecen cuantizaciones weighted/imatrix para este modelo, lo que puede suponer una pérdida de calidad frente a las imatrix en tamaños equivalentes.

## Enlaces

- Repositorio HuggingFace (esta cuantización): https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF
- Modelo base: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink
- Página de descargas y visión general del autor: https://hf.tst.eu/model#ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF
- Variante GGUF del autor original: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-CharThink-Base-GGUF
- Otro derivado ColdBrew 9B cuantizado por mradermacher: https://huggingface.co/mradermacher/Q3.5-ColdBrew-9B-Base-v2-Intrepid-i1-GGUF
- Proyector multimodal Q8_0: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF/resolve/main/ColdBrew-Qwen3.5-RP_Base-CharThink.mmproj-Q8_0.gguf
- Pesos Q4_K_S: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF/resolve/main/ColdBrew-Qwen3.5-RP_Base-CharThink.Q4_K_S.gguf
- Pesos Q8_0: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF/resolve/main/ColdBrew-Qwen3.5-RP_Base-CharThink.Q8_0.gguf
- Pesos f16: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF/resolve/main/ColdBrew-Qwen3.5-RP_Base-CharThink.f16.gguf
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
