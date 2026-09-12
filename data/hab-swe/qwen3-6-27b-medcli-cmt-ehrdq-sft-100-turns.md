# hab-swe/Qwen3.6-27B-MedCLI-CMT-EHRDQ-SFT-100-turns

## Resumen

El modelo `hab-swe/Qwen3.6-27B-MedCLI-CMT-EHRDQ-SFT-100-turns` es un ajuste fino publicado por el usuario `hab-swe` sobre una base de la familia Qwen (la etiqueta de arquitectura declarada en HuggingFace es `qwen3_5`). El repositorio contiene 27.356.728.560 parámetros reales en safetensors (27,36 mil millones) y ocupa 54,7 GB, lo que corresponde a un guardado en precisión de 16 bits. La pipeline declarada es `image-text-to-text`, por lo que se trata de un modelo multimodal con entrada de imagen y texto y salida de texto, y la etiqueta `conversational` indica que está orientado a diálogo multi-turno.

El identificador del modelo sugiere un ajuste supervisado (SFT) orientado a un dominio clínico o médico (`MedCLI`), con algún componente relativo a historiales clínicos electrónicos (`EHRDQ`) y una ventana de conversación de hasta 100 turnos (`100-turns`). Sin embargo, no hay ninguna documentación publicada en la información disponible que confirme esa interpretación, ni el dataset utilizado, ni el número de tokens de entrenamiento, ni el procedimiento exacto de ajuste. Cualquier afirmación sobre el contenido clínico del ajuste debe tratarse como una hipótesis derivada del nombre, no como un hecho verificado.

Su relevancia actual es limitada por el momento: el repositorio es de acceso restringido (gated), acumula 0 descargas y 0 likes, y se creó el 12 de septiembre de 2026 con una actualización posterior el mismo día. No hay tarjeta de modelo sustantiva, resultados de benchmarks ni validación de la comunidad, por lo que su evaluación en producción exigiría una validación propia antes de cualquier uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta de HuggingFace: `qwen3_5`; se desconoce si es transformer denso, MoE o híbrido) |
| Parámetros totales | 27.356.728.560 (27,36 B), dato real de los safetensors |
| Parámetros activos | No disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repo contiene únicamente pesos safetensors (54,7 GB, coherente con 16 bits). No se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (el campo de idiomas no está informado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |
| Modalidades | Imagen + texto como entrada; texto como salida (`image-text-to-text`) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creación | 12 de septiembre de 2026 |
| Última actualización | 12 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 54,7 GB |
| Etiquetas declaradas | `transformers`, `safetensors`, `qwen3_5`, `image-text-to-text`, `conversational`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es la etiqueta `qwen3_5` y el recuento de parámetros. No hay tarjeta de modelo, paper ni documentación asociada que detalle el número de capas, la dimensionalidad, el tipo de atención, la estrategia de RoPE, el tokenizador ni la resolución de imagen soportada por el codificador visual. Tampoco se indica si se trata de un transformer denso o de una arquitectura con mezcla de expertos, ni si emplea decodificación especulativa, atención lineal u otras optimizaciones. Todos estos puntos deben considerarse "no disponibles".

Respecto al entrenamiento, el nombre del repositorio (`SFT`, `100-turns`) apunta a un ajuste supervisado sobre conversaciones multi-turno, posiblemente con hasta 100 turnos de contexto, pero no se publica el número de tokens de entrenamiento, la composición del dataset, si hubo una fase de RLHF o DPO posterior, ni las recetas de ajuste. No hay información sobre el modelo base exacto sobre el que se hizo el ajuste, más allá de la referencia genérica a la familia Qwen 3.5 y del tamaño declarado de 27B en el nombre.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` y el campo `pipeline_tag` orientado a diálogo.
- Procesamiento conjunto de imagen y texto (`image-text-to-text`): puede recibir imágenes junto con instrucciones en lenguaje natural, típicamente para descripción, extracción de información o respuesta a preguntas sobre la imagen.
- Capacidad potencial de razonamiento clínico o extracción de información de documentos médicos, inferida del identificador `MedCLI` / `EHRDQ`. No verificada en la información disponible.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (campo de idiomas sin informar).
- Modo "thinking" o razonamiento extendido: no disponible.
- Entrada de audio o vídeo: no disponible; la pipeline declarada solo cubre imagen y texto.
- Compatibilidad con endpoints de HuggingFace: sí, según la etiqueta `endpoints_compatible`.

## Casos de uso

Los casos siguientes son escenarios plausibles dado el perfil declarado (modelo multimodal conversacional de 27B con un ajuste aparentemente clínico). Ninguno está validado con datos publicados del modelo, y en todos los casos de dominio sanitario se requiere supervisión humana y validación regulatoria previa.

- Triaje conversacional en atención primaria: el modelo puede mantener un diálogo estructurado de varios turnos con el paciente, combinando texto libre con fotografías de lesiones cutáneas o documentos, para clasificar el nivel de urgencia antes de la consulta. La ventana de 100 turnos indicada en el nombre sería el argumento principal para este escenario, aunque no está confirmada técnicamente.
- Resumen de historiales clínicos electrónicos: dado un conjunto de informes escaneados o en PDF convertidos a imagen, el modelo puede extraer y condensar antecedentes, medicación activa y alergias en un resumen estructurado para revisión facultativa.
- Extracción de datos estructurados de documentación clínica: digitalización de analíticas, informes de alta o prescripciones mediante la entrada de imagen, generando JSON o tablas con campos como fecha, fármaco, dosis y vía de administración, para su carga en un sistema EHR.
- Asistencia a la codificación clínica: apoyo al personal de codificación para asignar códigos CIE/ICD a partir del texto del episodio y de la documentación adjunta, dejando la validación final en manos del codificador.
- Soporte a la decisión clínica basado en literatura: preguntas y respuestas multi-turno sobre guías de práctica clínica y protocolos internos, con citación de la fuente cuando se le proporcione el documento como imagen o texto.
- Formación de residentes y simulación de casos: generación de casos clínicos sintéticos y role-play de entrevista clínica, útil en entornos docentes donde no se manejan datos reales de pacientes.
- Atención al paciente post-operatoria: seguimiento conversacional a distancia con escalado a personal sanitario cuando el modelo detecta banderas rojas en la descripción o en las imágenes aportadas por el paciente.
- Indexación y búsqueda semántica sobre archivos documentales: generación de descripciones textuales de imágenes médicas no diagnósticas (por ejemplo, fotografías de heridas o de etiquetado de muestras) para alimentar un motor de búsqueda interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, no hay paper asociado y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos correspondían a sitios no relacionados con IA). No deben atribuirse a este modelo cifras de MMLU, HumanEval, GSM8K, MedQA, VQA médica ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (27,36 B) y de la aritmética habitual de memoria, no mediciones publicadas del modelo.

- Pesos en BF16/FP16: 54,7 GB aproximadamente, coincidiendo con el tamaño del repositorio. Sumando caché KV para contextos largos y el codificador visual, conviene reservar entre 65 y 80 GB de VRAM.
- GPU recomendadas para precisión completa: 1×H100 80 GB o 1×A100 80 GB. También válido 2×A100 40 GB o 2×L40S 48 GB con tensor parallelism.
- Pesos en INT8/FP8: en torno a 28-30 GB, más caché KV. Encaja en 1×A100 40 GB, 1×L40S 48 GB o 1×RTX 6000 Ada 48 GB.
- Pesos en INT4 (si se generan cuantizaciones propias): aproximadamente 15-17 GB. Cabría en una RTX 4090 de 24 GB o una RTX 5090 de 32 GB, con margen reducido si se procesan imágenes de alta resolución o contextos largos.
- Viabilidad en GPU de consumo: sí, en tarjetas de 24 GB o más, pero solo con cuantizaciones de 4 bits generadas por el usuario, ya que el repositorio no publica versiones GGUF, AWQ ni GPTQ.
- Opciones de despliegue: la vía directa es `transformers` con safetensors. vLLM, SGLang o TGI son compatibles en principio con pesos safetensors de un modelo de esta familia, aunque no hay confirmación de soporte específico para esta revisión concreta de arquitectura. llama.cpp u Ollama solo serían viables si se convierte el modelo a GGUF, algo no documentado.
- Latencia y throughput estimados: no disponibles. No hay mediciones de tokens por segundo publicadas ni parámetros de configuración recomendados.
- Nota operativa: al ser un repositorio gated, es necesario solicitar y obtener acceso antes de poder descargar los pesos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a aspectos estructurales y de licencia. Se incluyen como referencia modelos abiertos de tamaño comparable ampliamente documentados; los datos de contexto y evaluación de esas alternativas no proceden de la búsqueda realizada y deben verificarse en sus propias fichas.

| Modelo | Parámetros | Contexto | Licencia | Acceso | Rendimiento publicado |
|---|---|---|---|---|---|
| `hab-swe/Qwen3.6-27B-MedCLI-CMT-EHRDQ-SFT-100-turns` | 27,36 B | No disponible | Apache 2.0 | Gated | No disponible |
| Qwen3-32B | ~32,8 B (según documentación pública de la familia) | No verificado en esta búsqueda | Apache 2.0 | Abierto | No verificado en esta búsqueda |
| Qwen2.5-32B | ~32,5 B (según documentación pública de la familia) | No verificado en esta búsqueda | Apache 2.0 | Abierto | No verificado en esta búsqueda |
| Qwen2.5-VL-32B (alternativa multimodal de tamaño similar) | ~32,8 B (según documentación pública de la familia) | No verificado en esta búsqueda | Apache 2.0 | Abierto | No verificado en esta búsqueda |

Diferencias estructurales destacables: el modelo analizado es el único de la tabla con acceso restringido y el único sin métricas ni documentación publicada. A cambio, su tamaño es algo menor que el de las alternativas de 32B, lo que reduce ligeramente los requisitos de memoria, y su nombre sugiere un ajuste de dominio clínico que las alternativas generalistas no tienen.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar los pesos.
- Ausencia total de documentación: no hay tarjeta de modelo con detalles de dataset, hiperparámetros, evaluación ni limitaciones conocidas.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que impide contrastar el comportamiento real del modelo con terceros.
- Riesgo de alucinación: cualquier modelo de lenguaje de 27B puede generar información clínica incorrecta con apariencia plausible. En un contexto médico, esto incluye dosis, interacciones farmacológicas y diagnósticos erróneos.
- Sesgos: no disponibles. No se ha publicado ninguna evaluación de sesgo demográfico, lingüístico o clínico.
- Cobertura de idiomas desconocida: el campo de idiomas no está informado, por lo que no se puede garantizar un rendimiento correcto en castellano, catalán, gallego o euskera.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base sobre el que se hizo el ajuste y las del propio repositorio gated antes de desplegarlo.
- Uso clínico regulado: un modelo de este tipo no es un producto sanitario. Cualquier aplicación con pacientes en la Unión Europea quedaría sujeta al Reglamento (UE) 2017/745 sobre productos sanitarios y requeriría conformidad CE, además de validación clínica específica.
- Riesgo de degradación del modelo base: los ajustes SFT de dominio estrecho suelen reducir capacidades generales como el razonamiento matemático, la generación de código o el seguimiento de instrucciones fuera del dominio entrenado.
- Incertidumbre sobre la arquitectura: al no confirmarse si es denso o MoE, las estimaciones de memoria y latencia pueden desviarse respecto a las cifras reales.
- Fecha de publicación atípica (septiembre de 2026): conviene comprobar que el repositorio sigue disponible y que no ha sido sustituido por una revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hab-swe/Qwen3.6-27B-MedCLI-CMT-EHRDQ-SFT-100-turns
- Paper asociado: no disponible
- Repositorio de código: no disponible
- Demostración o space: no disponible
- Blog o nota de publicación: no disponible
- Resultados de la búsqueda web: sin resultados relevantes. Las consultas devolvieron exclusivamente sitios no relacionados con el modelo (tiendas de scrapbooking y fabricantes de cajas de PC), por lo que no se ha incorporado ninguna fuente externa a esta ficha.
