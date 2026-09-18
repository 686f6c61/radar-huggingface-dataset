# kawkumputer/pulaar-ai-nllb-1.3b-v11

## Resumen

`kawkumputer/pulaar-ai-nllb-1.3b-v11` es un adaptador LoRA publicado en HuggingFace por el usuario `kawkumputer`, construido sobre el modelo de traducción automática `facebook/nllb-200-distilled-1.3B`. No es un modelo autónomo: es un conjunto de pesos PEFT (la model card declara `library_name: peft` y la etiqueta `lora`) que debe cargarse junto al checkpoint base para producir inferencia. El repositorio ocupa 0,4 GB y se creó el 18 de septiembre de 2026; en el momento de redactar esta ficha acumula 0 descargas y 0 likes, lo que indica que no ha sido validado por terceros.

El interés potencial del modelo reside en su modelo base: NLLB-200 (No Language Left Behind) es la familia de traducción neuronal de Meta AI diseñada para cubrir lenguas con pocos recursos digitales, con un transformer encoder-decoder de 1,3 mil millones de parámetros en esta variante destilada. El sufijo "pulaar" del identificador sugiere un ajuste fino orientado al pulaar o fulfulde (lengua fula, hablada en Senegal, Mauritania, Guinea, Malí y otros países del Sahel), pero la información disponible no confirma ni el par de lenguas, ni el corpus, ni el objetivo del ajuste.

La limitación principal de esta ficha es la ausencia total de documentación: la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`, no se declara licencia propia, no hay pipeline asignado, no hay idiomas declarados y no se publican resultados de evaluación ni detalles de entrenamiento. Todo lo que se describe a continuación sobre el adaptador es, por tanto, no disponible, y solo puede caracterizarse con precisión el modelo base sobre el que se aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder-decoder denso (modelo base `facebook/nllb-200-distilled-1.3B`) |
| Parametros totales | No disponible para el adaptador. Modelo base: 1,3 mil millones de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base NLLB-200: 512 tokens de longitud máxima de secuencia |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA se distribuye en precisión completa del checkpoint (safetensors) y se aplica sobre el modelo base en fp32/fp16/bf16; la cuantizacion se realiza sobre el modelo base (por ejemplo, 8 bits o 4 bits con bitsandbytes) |
| Idiomas soportados | No declarados en la ficha del adaptador. El modelo base NLLB-200 cubre 202 lenguas, con variantes destiladas disponibles para ese mismo conjunto |
| Licencia | No disponible para el adaptador. El modelo base `facebook/nllb-200-distilled-1.3B` se distribuye bajo CC-BY-NC-4.0 (uso no comercial) |
| Formato de pesos | safetensors (formato de adaptador PEFT/LoRA) |

Otros datos del repositorio: autor `kawkumputer`, creado el 2026-09-18, actualizado el 2026-09-18, tamaño del repositorio 0,4 GB, versión de PEFT declarada 0.20.0, etiquetas `peft`, `safetensors`, `lora`, `transformers`, `base_model:facebook/nllb-200-distilled-1.3B`, `region:us` y `arxiv:1910.09700` (referencia genérica a Lacoste et al. sobre impacto ambiental, incluida en la plantilla de la model card, no un paper del modelo).

## Arquitectura y entrenamiento

El adaptador se apoya en LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, reduciendo de forma drástica el número de parámetros entrenables. La model card solo declara la librería (`peft` 0.20.0) y la etiqueta `lora`; no especifica rango (`r`), `alpha`, `dropout`, módulos objetivo ni si el adaptador se fusionó con el base. El tamaño del repositorio, 0,4 GB, es grande para un adaptador LoRA típico sobre un modelo de 1,3B y podría indicar un rango elevado o un guardado en fp32, pero esto es una observación del tamaño del fichero y no un dato confirmado por el autor.

El modelo base, `facebook/nllb-200-distilled-1.3B`, es un transformer encoder-decoder denso de 1,3B parámetros entrenado por Meta AI para traducción multilingüe. Forma parte de la familia NLLB-200, que emplea un tokenizador SentencePiece con un vocabulario compartido de aproximadamente 256 000 tokens y una longitud máxima de secuencia de 512 tokens. Las variantes destiladas se obtienen mediante destilación de conocimiento a partir de un modelo mayor de la misma familia, y su entrenamiento se apoya en corpus web minados y filtrados por similitud, además de datos paralelos supervisados, con evaluación sobre el conjunto FLORES-200. No hay información disponible sobre el dataset, los hiperparámetros, el régimen de precisión ni el procedimiento (SFT, DPO u otro) empleado para entrenar este adaptador concreto.

## Capacidades

- Traducción automática multilingüe: capacidad heredada del modelo base NLLB-200, orientada a traducción entre lenguas de altos y bajos recursos.
- Especialización probable en pulaar/fulfulde: el identificador del modelo apunta a esta lengua, pero no hay confirmación documental del par de traducción ni del dominio de ajuste.
- Traducción bidireccional: los modelos NLLB-200 permiten seleccionar la lengua origen y destino mediante códigos BCP-47, por lo que el adaptador puede emplearse en cualquier dirección soportada por el base, siempre que el ajuste no haya degradado el resto de pares.
- Procesamiento por lotes: al ser un modelo encoder-decoder relativamente pequeño, admite traducción por lotes en GPU modesta.
- Capacidades no disponibles: no se documenta soporte de *tool calling* ni *function calling*, ni razonamiento multi-paso, ni modo de pensamiento (*thinking mode*), ni visión, ni audio, ni diálogo conversacional. NLLB-200 es un modelo de traducción, no un modelo de instrucciones.
- Capacidades multilingües: dependen íntegramente de la cobertura del modelo base; el adaptador no declara idiomas adicionales.
- Capacidad especial: ninguna documentada más allá del ajuste LoRA.

## Casos de uso

- Traducción de documentación técnica y software a pulaar: el adaptador podría emplearse para localizar interfaces, manuales y textos de ayuda a una lengua con poca cobertura en herramientas comerciales, partiendo de la cobertura multilingüe del modelo base.
- Atención al cliente en lenguas del Sahel: integrado en un backend de traducción, permitiría atender consultas escritas en pulaar traduciéndolas a francés o inglés para el agente, y devolver la respuesta en la lengua original. La ventana de 512 tokens del base limita el uso a mensajes cortos o conversaciones por turnos.
- Traducción de material sanitario y humanitario: organizaciones que operan en Senegal, Mauritania, Guinea o Malí pueden traducir folletos, protocolos y comunicados a pulaar, con revisión humana por tratarse de contenido crítico y por el riesgo de alucinación del modelo base.
- Generación de corpus paralelos para investigación lingüística: el modelo puede emplearse para producir traducciones preliminares a gran escala que después se filtran y corrigen manualmente, alimentando datasets de lenguas de bajos recursos.
- Traducción de contenido editorial y noticias locales: medios que publican en lenguas nacionales pueden pre-traducir teletipos y notas de prensa, reduciendo el coste de producción periodística multilingüe.
- Subtitulado y transcripción multilingüe: combinado con un sistema de reconocimiento de voz, el modelo puede traducir los segmentos transcritos, siempre que cada segmento quede dentro del límite de 512 tokens.
- Traducción de expedientes administrativos: administraciones con obligaciones de publicación multilingüe pueden usar el modelo para una primera pasada sobre formularios y resoluciones.
- Evaluación comparativa de adaptadores LoRA para traducción: investigadores interesados en eficiencia de ajuste pueden usar este repositorio como ejemplo de adaptador PEFT sobre NLLB-200, aunque la ausencia de documentación de entrenamiento limita su valor reproducibilidad.

En todos los casos, conviene recordar que no hay evidencia publicada de calidad de traducción para este adaptador concreto y que el modelo base arrastra la licencia no comercial CC-BY-NC-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada (los apartados de datos de prueba, métricas y resultados figuran como `[More Information Needed]`), el repositorio no declara ninguna métrica y la búsqueda web realizada no devolvió material técnico relacionado con este modelo. Tampoco se dispone de cifras de BLEU, chrF o spBLEU sobre FLORES-200 para este adaptador. No se reproducen aquí resultados del modelo base para evitar atribuir al adaptador un rendimiento que no ha sido medido.

## Requisitos de hardware

- VRAM para el adaptador: el adaptador LoRA en sí añade un consumo despreciable (0,4 GB de pesos en disco; en memoria, del orden de cientos de MB en fp32). El requisito real lo marca el modelo base.
- VRAM para el modelo base en fp16/bf16: aproximadamente 2,6 GB solo de pesos, más memoria para activaciones y caché de atención; en la práctica, entre 3 y 4 GB para inferencia con lotes pequeños.
- VRAM para el modelo base cuantizado: en torno a 1,3-1,5 GB en 8 bits y 0,7-1 GB en 4 bits (estimaciones a partir del número de parámetros, dependientes de la implementación).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 2070 o superiores; también en GPUs de centro de datos modestas como T4, L4 o A10. No requiere A100 ni H100.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, ya que es un adaptador LoRA y puede fusionarse con el base antes de exportar), vLLM y TGI (previa fusión del adaptador en un checkpoint completo), y `llama.cpp`/Ollama (requieren convertir el modelo fusionado a GGUF, con posibles pérdidas de compatibilidad en el tokenizador multilingüe). CTranslate2 es una alternativa habitual para NLLB en producción por CPU, aunque exige convertir el modelo fusionado.
- Latencia y throughput: no disponibles. No hay cifras publicadas para este adaptador ni para esta combinación concreta.

## Comparativa con modelos similares

Comparación con alternativas de la misma categoría (traducción multilingüe de tamaño pequeño-medio). Los datos del adaptador se refieren a su modelo base cuando el adaptador no los declara.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kawkumputer/pulaar-ai-nllb-1.3b-v11` (adaptador LoRA) | No disponible (base de 1,3B) | No disponible (base: 512 tokens) | Sin resultados publicados | No disponible (base: CC-BY-NC-4.0) | HuggingFace, 0 descargas |
| `facebook/nllb-200-distilled-1.3B` | 1,3B | 512 tokens | Resultados publicados por Meta AI en la documentación de NLLB-200; no reproducidos aquí | CC-BY-NC-4.0 (no comercial) | HuggingFace, ampliamente utilizado |
| `facebook/nllb-200-1.3B` (no destilado) | 1,3B | 512 tokens | Superior al destilado en la evaluación de la familia NLLB según su documentación | CC-BY-NC-4.0 (no comercial) | HuggingFace |
| `facebook/nllb-200-distilled-600M` | 600M | 512 tokens | Menor calidad que la variante de 1,3B según la documentación de la familia; coste de inferencia más bajo | CC-BY-NC-4.0 (no comercial) | HuggingFace |
| Helsinki-NLP OPUS-MT (modelos por par de lenguas) | Variable, típicamente 70-300M | No disponible | Métricas publicadas por par de lenguas en las fichas de cada modelo | CC-BY-4.0 según las fichas de los modelos (permite uso comercial) | HuggingFace |

Nota: para pares de lenguas concretos existen alternativas como M2M-100 o mBART-50, pero no se incluyen aquí sus cifras ni condiciones de licencia porque no han podido verificarse con la información disponible. La ventaja competitiva de un adaptador como este no es el rendimiento bruto, sino la posibilidad de especializar un modelo multilingüe con un coste de entrenamiento bajo, siempre que se documente y evalúe adecuadamente.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto sin rellenar. No hay información sobre datos de entrenamiento, hiperparámetros, rango LoRA, módulos objetivo ni evaluación.
- Licencia del adaptador no declarada y licencia del modelo base restrictiva: `facebook/nllb-200-distilled-1.3B` se distribuye bajo CC-BY-NC-4.0, lo que excluye el uso comercial. Un adaptador derivado hereda esa restricción, por lo que no debería utilizarse en productos comerciales sin autorización.
- Ausencia de validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes de terceros sobre su comportamiento.
- Riesgo de alucinación y de generación en lengua equivocada: es un problema conocido en modelos de traducción multilingüe de gran cobertura, especialmente en pares de bajos recursos, donde el sistema puede producir texto fluido pero incorrecto o cambiar de idioma.
- Calidad desigual según el par de lenguas: la cobertura de NLLB-200 es amplia, pero el rendimiento en lenguas de bajos recursos como el pulaar es sistemáticamente inferior al de lenguas con grandes corpus paralelos.
- Ventana de contexto corta: 512 tokens en el modelo base limita la traducción de documentos largos, que deben segmentarse, con el consiguiente riesgo de pérdida de coherencia entre segmentos.
- No es un modelo conversacional ni agentico: no dispone de alineación por instrucciones, no soporta *tool calling* ni razonamiento multi-paso. Cualquier uso en un asistente requiere envolverlo con lógica externa.
- Sin garantías de reproducibilidad: al no documentarse el proceso de ajuste, no es posible replicar el adaptador ni auditar qué datos se usaron, lo que dificulta el cumplimiento de requisitos de gobernanza en entornos regulados.
- Dependencia de la versión de PEFT: la ficha indica PEFT 0.20.0; versiones muy distintas pueden requerir ajustes de compatibilidad al cargar el adaptador.
- No debe usarse en contextos críticos (sanidad, asilo, procesos judiciales) sin revisión humana profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v11
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper de LoRA (Low-Rank Adaptation): https://arxiv.org/abs/2106.09685
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Referencia citada en las etiquetas del repositorio (impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Compromiso de carbono del aprendizaje automático: https://mlco2.github.io/impact
- Búsqueda web realizada: no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de soporte de Microsoft ajenas al tema).
