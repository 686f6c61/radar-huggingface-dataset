# nassimjp/gemma-4-E2B-it-pashto-GGFU

## Resumen

El repositorio `nassimjp/gemma-4-E2B-it-pashto-GGFU` contiene una conversión al formato GGUF de un modelo derivado de la familia Gemma, publicada por el usuario nassimjp. Según la model card, la conversión se realizó con Unsloth y el resultado está pensado para su uso con llama.cpp, tanto en modo texto (`llama-cli`) como en modo multimodal (`llama-mtmd-cli`). El nombre del repositorio indica un ajuste orientado al pastún, aunque la model card no aporta detalles sobre el proceso de ajuste ni sobre los datos empleados.

El recuento de parámetros declarado en los pesos originales es de 4.647.450.147 (aproximadamente 4,65 mil millones), y el repositorio ocupa 13,7 GB. El sufijo «E2B» del nombre sigue la convención de «parámetros efectivos» que Google emplea en algunas variantes de Gemma, pero no hay confirmación de ello en la información disponible, por lo que debe tratarse como una hipótesis basada en la nomenclatura y no como un dato verificado.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni valoraciones, no declara licencia, no publica idiomas soportados y no incluye resultados de evaluación. Se trata, por tanto, de un artefacto de conversión a GGUF con dos ficheros publicados, útil como punto de partida para pruebas locales, pero sin garantías documentadas de calidad, cobertura lingüística ni condiciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del repositorio indican `vision-language-model`; la conversión se realizó con Unsloth a GGUF |
| Parámetros totales | 4.647.450.147 (≈4,65 B), según el recuento de los pesos en safetensors |
| Parámetros activos | No disponible. El sufijo «E2B» del nombre sugiere un esquema de parámetros efectivos, sin confirmación en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (fichero del proyector multimodal `gemma-4-e2b-it.BF16-mmproj.gguf`) y Q4_K_M (`gemma-4-e2b-it.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible. El nombre del repositorio indica un ajuste para pastún; no hay lista oficial de idiomas |
| Licencia | No disponible |
| Formato de pesos | GGUF, para llama.cpp (`llama-cli` y `llama-mtmd-cli`), con plantilla de chat Jinja (`--jinja`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. Los únicos datos técnicos verificables son los de la conversión: el autor indica que el modelo se convirtió a GGUF mediante Unsloth, y el repositorio publica dos ficheros, uno con los pesos en BF16 para el proyector multimodal y otro con la cuantización Q4_K_M del modelo principal. La presencia de un fichero `mmproj` confirma que el modelo incorpora una torre de visión y que puede procesar entradas de imagen junto a texto mediante `llama-mtmd-cli`.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, el uso de decodificación especulativa u otras optimizaciones de inferencia. Tampoco se documenta el procedimiento concreto del ajuste al pastún que sugiere el nombre del repositorio: no se indica si fue un ajuste supervisado, cuántos ejemplos se usaron ni qué proporción del dataset correspondía a ese idioma.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la designación `it` (instruction-tuned) indican que el modelo está preparado para diálogo en formato instrucción.
- Procesamiento multimodal de imagen y texto: el tag `vision-language-model` y la presencia del fichero `mmproj` habilitan la inferencia con `llama-mtmd-cli` sobre entradas que combinan imagen y texto.
- Inferencia local con llama.cpp: los pesos están publicados exclusivamente en GGUF, con soporte explícito de plantilla de chat Jinja mediante el flag `--jinja`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el repositorio puede servirse a través de interfaces compatibles con el esquema de endpoints de HuggingFace, aunque no se detalla la configuración.
- Cobertura multilingüe: no disponible. El nombre apunta a un ajuste para pastún, pero no hay evaluación ni lista de idiomas publicada.
- Llamada a herramientas y function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional en pastún para despliegue local: el modelo permitiría mantener diálogos multi-turno en ese idioma ejecutándose íntegramente en la máquina del usuario mediante `llama-cli`, sin depender de servicios en la nube. Es adecuado por su tamaño contenido (≈4,65 B de parámetros), pero la calidad real en pastún no está documentada.
- Transcripción y descripción de imágenes en entornos sin conectividad: usando `llama-mtmd-cli` con el fichero `mmproj`, el modelo puede recibir una imagen y generar una descripción textual; resulta apropiado para escenarios de campo o de privacidad estricta donde no se pueden enviar datos a un servidor externo.
- Prototipado rápido de aplicaciones de visión y lenguaje: al estar en GGUF, se puede cargar desde Python con `llama-cpp-python` o desde la CLI en cuestión de minutos, lo que lo convierte en una opción razonable para validar ideas antes de invertir en modelos mayores.
- Aumento de datos para idiomas con pocos recursos: si el ajuste al pastún es funcional, el modelo podría generar texto sintético en pastún para ampliar corpus de entrenamiento de otros sistemas; conviene auditar manualmente las salidas antes de usarlas.
- Traducción asistida pastún-castellano o pastún-inglés en herramientas de escritorio: integrado en un editor o en un plugin local, el modelo podría ofrecer borradores de traducción que el usuario revisa, sin coste por token.
- Generación de descripciones de producto a partir de fotografías: en un flujo de catálogo, el modelo puede recibir la imagen de un artículo y producir un texto base que después se revisa y se adapta al tono de marca.
- Despliegue en endpoints compatibles con la API de OpenAI: dado el tag `endpoints_compatible`, es posible exponerlo detrás de una pasarela que hable ese esquema y sustituir llamadas a servicios comerciales en pruebas internas.
- Filtrado y clasificación de contenido con apoyo visual: combinando texto e imagen, puede etiquetar publicaciones o capturas según criterios definidos en el prompt, siempre que se validen las tasas de error en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para la cuantización Q4_K_M: en torno a 3-4 GB para los pesos del modelo principal, más la memoria del proyector multimodal BF16, que puede añadir del orden de 0,5-1 GB según su tamaño exacto (no especificado). Con overhead de contexto, un presupuesto de 5-6 GB es razonable.
- VRAM estimada para BF16: aproximadamente 9,3 GB solo para los pesos (4,65 B × 2 bytes), más el proyector y la caché KV. En la práctica requiere del orden de 11-13 GB.
- GPU recomendadas: para Q4_K_M basta una GPU de gama media con 6-8 GB (RTX 3060, RTX 4060, RTX 2070). Para BF16 se recomienda una GPU con 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPU de consumo: sí. La variante Q4_K_M cabe en la mayoría de tarjetas consumer modernas con 6 GB o más, y también puede ejecutarse en CPU con memoria RAM suficiente.
- Ejecución en CPU: viable con llama.cpp, especialmente con Q4_K_M; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), contenedores derivados como Ollama o LM Studio mediante importación del GGUF, y `llama-cpp-python` para integración en aplicaciones. vLLM y TGI no pueden cargar este repositorio tal cual, ya que solo se publican ficheros GGUF y no pesos en safetensors.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna configuración de hardware.

## Comparativa con modelos similares

No se dispone de información verificada sobre el modelo base `gemma-4-E2B-it` en la documentación proporcionada, por lo que cualquier comparación directa quedaría sin respaldo. La siguiente tabla recoge posibles alternativas de la misma categoría (modelos visión-lenguaje de 3-5 B de parámetros, orientados a despliegue local) y señala qué datos no se han podido confirmar en esta ficha; las cifras de cada alternativa deben contrastarse en su propia model card.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nassimjp/gemma-4-E2B-it-pashto-GGFU | ≈4,65 B (según safetensors) | No disponible | No disponible | GGUF en HuggingFace |
| Gemma 3 4B (familia de referencia) | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha |
| Qwen2.5-VL 3B (familia de referencia) | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha |
| Phi-3.5-vision (familia de referencia) | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha | No verificado en esta ficha |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card se limita a describir la conversión a GGUF; no indica arquitectura, datos de entrenamiento, contexto ni hiperparámetros del ajuste al pastún.
- Licencia no declarada: sin condiciones de uso publicadas, no es posible determinar si se permite el uso comercial. Al derivar presumiblemente de un modelo Gemma, es probable que hereden los términos de la licencia de Google, pero esto no está confirmado en el repositorio.
- Sin resultados de evaluación: no hay benchmarks ni evaluaciones cualitativas que respalden la calidad del ajuste al pastún ni del comportamiento multimodal.
- Riesgo de alucinación: no cuantificado. Al no existir evaluaciones, no se puede estimar la tasa de errores factuales, especialmente en un idioma con recursos limitados como el pastún.
- Cobertura lingüística incierta: el nombre indica pastún, pero se desconoce el grado de competencia en ese idioma y en otros, así como si el ajuste degradó capacidades previas del modelo base.
- Sesgos: no evaluados. No hay información sobre la composición del dataset de ajuste ni sobre posibles sesgos culturales, geográficos o de género.
- Reputación nula del artefacto: cero descargas y cero valoraciones en el momento de la consulta, sin historial de uso que permita inferir fiabilidad.
- Solo formato GGUF: al no publicarse safetensors, no se puede servir con vLLM o TGI sin reconvertir, y el uso con fine-tuning adicional es más complejo.
- Degradación por cuantización: la variante Q4_K_M puede perder precisión respecto a BF16, algo especialmente relevante en tareas de visión y en idiomas de bajos recursos. No hay comparativas publicadas entre ambas variantes.
- Confusión potencial de nomenclatura: el identificador «gemma-4-E2B» puede inducir a error sobre la procedencia y el tamaño efectivo del modelo; conviene verificarlo antes de citarlo en documentación técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nassimjp/gemma-4-E2B-it-pashto-GGFU
- Unsloth (herramienta de conversión citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Nota sobre la búsqueda web: los resultados obtenidos (sitios de horóscopos, Zhihu y un blog de Huawei Cloud) no guardan relación con este modelo y no aportan enlaces válidos; no se han encontrado papers, blogs ni demos asociados a este repositorio.
