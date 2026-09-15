# rinaldiden/ilsocio-brain

## Resumen

ilsocio-brain es un repositorio de HuggingFace publicado por el usuario rinaldiden que funciona como archivo versionado de entrenamientos, no como un modelo único. Está construido sobre el modelo base mlx-community/Qwen2.5-3B-Instruct-4bit y contiene adaptadores LoRA, pesos fusionados en safetensors, datos de entrenamiento en formato MLX y un clasificador de intención en joblib. El objetivo declarado es servir de histórico del proyecto ilsocio-brain, un asistente conversacional orientado a la gestión de negocios italianos (régimen forfettario, partita IVA, facturación, apertura de actividad).

La arquitectura del sistema completo es un router más adaptadores especializados: dos LoRA entrenados por separado para las tareas de extracción de datos estructurados (estrazione) y de conversación, más un clasificador router_intento.joblib que decide qué adaptador atiende cada turno. El autor recomienda como combinación utilizable lora_estrazione_v1.7/finale junto con lora_conversazione_v1.6/finale, y describe explícitamente las variantes v1.8 como experimentos fallidos sobre el conversacional.

Su relevancia es muy acotada: no es un modelo generalista ni compite en benchmarks, sino un caso documentado de ingeniería de datasets y evaluación incremental sobre un 3B cuantizado a 4 bits. Registra 0 descargas y 0 likes, la licencia figura como "other" sin términos detallados y la propia model card indica que el repositorio es privado, lo que limita su uso por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen2.5-3B-Instruct (transformer decoder-only del modelo base, no detallado en la model card) |
| Parámetros totales | No disponible para los adaptadores; el modelo base declara 3,09B según su documentación pública |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens según documentación pública |
| Tipos de cuantización | Modelo base en 4 bits (mlx-community/Qwen2.5-3B-Instruct-4bit); no se documentan cuantizaciones propias adicionales |
| Idiomas soportados | No disponible; los datos de entrenamiento y toda la documentación están en italiano |
| Licencia | other (sin términos detallados en la model card) |
| Formato de pesos | safetensors (modelos fusionados HF), adaptadores MLX y joblib para el router; repositorio de 32,9 GB |
| Librería | mlx |
| Modelo base | mlx-community/Qwen2.5-3B-Instruct-4bit |
| Fecha de creación / actualización | 2026-09-10 / 2026-09-15 |

## Arquitectura y entrenamiento

El entrenamiento se realiza con mlx_lm.lora sobre el modelo base Qwen2.5-3B-Instruct-4bit, con hiperparámetros comunes declarados en la versión 1.5: 400 iteraciones, batch 1, 16 capas afectadas por el LoRA y learning rate 1e-4. Las versiones posteriores amplían el número de iteraciones (800 en v1.6, 900 y 2400 en v1.8, 2000 en la variante con datos curados). Los adaptadores se separan por tarea: uno de extracción de campos y otro de conversación, con modelos fusionados en safetensors para uso en HuggingFace y adaptadores nativos para MLX.

La evolución del dataset es el núcleo técnico documentado. La v1.5 introduce hard negatives en extracción, sobremuestreo de conversaciones multi-turno y división del dataset por conversación para evitar filtración de turnos entre train y validación. La v1.6 añade ejemplos cold-start (saludos y cháchara con contexto vacío, sobremuestreados x4) para evitar que el modelo pivotase forzosamente hacia el régimen forfettario o inventase biografías, y positivos específicos de nueva_attivita. La v1.7 amplía el router a edad, residencia, "ponerme por mi cuenta" y revisiones, e incorpora escenarios con contradicciones (facturación, edad o oficio revisados) mediante un campo dedicado. La v1.8 documenta un experimento con 313 conversaciones generadas y filtradas por gate más evaluador, sin los aproximadamente 172 ejemplos curados a mano: el resultado declarado es que el componente conversacional no se mantiene coherente a ningún número de iteraciones (0,34, 0,77 y 2,03 épocas, con sobreajuste al aumentar), y solo recupera coherencia con los datos curados.

## Capacidades

- Generación de texto conversacional en italiano dentro del dominio de gestión de negocio y fiscalidad.
- Extracción de campos estructurados desde conversación: oficio, facturación, edad, residencia, indicador nueva_attivita y contradicciones detectadas.
- Manejo de conversaciones multi-turno con arranque en frío (saludos y cháchara sin contexto previo).
- Detección de datos declarados a mitad de conversación y de revisiones o contradicciones posteriores.
- Enrutado de intención mediante router_intento.joblib y reglas en router.py, que decide entre las rutas DATO, PRODUCTO y CHÁCHARA.
- Capacidad de reentrenamiento accesible: adaptadores LoRA sobre un 3B en 4 bits, ejecutables en hardware de consumo.
- Tool calling o function calling: no disponible, no declarado en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso, visión, audio o modo thinking: no disponibles, no declaradas.

## Casos de uso

- Extracción de datos de negocio desde conversaciones de atención al cliente: el adaptador de estrazione convierte un diálogo libre en italiano en campos estructurados (oficio, facturación, edad, residencia), lo que permite prellenar formularios fiscales sin intervención manual.
- Enrutado de intenciones en un chatbot de asesoría fiscal: el clasificador joblib separa consultas de datos, consultas de producto y cháchara, evitando que el modelo de conversación invente respuestas cuando el turno solo aporta información.
- Detección de contradicciones en cuestionarios: el campo contradicciones permite marcar revisiones de facturación, edad u oficio declaradas en momentos distintos de la misma conversación, útil para sistemas de validación previa.
- Onboarding conversacional en frío: los ejemplos cold-start de la v1.6 permiten saludar y mantener cháchara sin redirigir al usuario al régimen forfettario, un fallo recurrente que el autor documenta explícitamente.
- Despliegue local con datos sensibles: al ser un 3B en 4 bits sobre MLX, puede ejecutarse en un Mac sin conexión, lo que resulta adecuado para datos fiscales y personales que no deberían salir del dispositivo.
- Investigación sobre construcción de datasets: el repositorio documenta con detalle la diferencia entre datos sintéticos generados y ejemplos curados a mano, y sirve como caso de estudio reproducible de cómo la calidad del dataset condiciona a un modelo pequeño.
- Base para reentrenamiento en otros dominios o idiomas: la receta (LoRA de 16 capas, lr 1e-4, batch 1) es replicable sobre el mismo base para tareas de extracción y conversación en otros sectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones estándar, ni comparaciones numéricas con otros modelos.

La model card sí incluye evaluaciones cualitativas internas del autor, que no constituyen benchmarks y se recogen aquí como referencia:

| Versión | Componente | Resultado declarado |
|---|---|---|
| v1.4.0 | Extracción | Estado de "fidelidad a lo dicho" en extracción |
| v1.5.0 | Router + extracción | Router conectado en tiempo de ejecución, hard negatives, split por conversación sin filtración de turnos |
| v1.6.0 | Conversación y extracción | Cold-start corrigen el giro forzado al forfettario y las biografías inventadas |
| v1.7.0 | Extracción y router | Recupera oficio declarado a mitad de conversación y detecta contradicciones |
| v1.8 (400 / 900 / 2400 iter) | Conversación | Incoherente en todas las configuraciones (0,34 / 0,77 / 2,03 épocas); más iteraciones implican más sobreajuste |
| v1.8 con curados (2000 iter) | Conversación | Recupera coherencia en torno al nivel de v1.6 |

## Requisitos de hardware

- El modelo base es un 3B cuantizado a 4 bits, lo que sitúa los pesos en torno a 2 GB, una estimación de orden de magnitud no confirmada en la model card.
- El repositorio completo ocupa 32,9 GB en disco porque agrupa múltiples versiones, adaptadores, pesos fusionados y datos de entrenamiento; para inferencia solo se necesita una fracción.
- MLX es el runtime de los adaptadores, por lo que el entrenamiento y la inferencia nativos requieren Apple Silicon (familias M1, M2, M3 o M4).
- Con memoria unificada de 16 GB en un Mac con Apple Silicon debería ser suficiente para el 3B en 4 bits más el adaptador; no hay cifras oficiales publicadas al respecto.
- En GPU NVIDIA no hay soporte nativo documentado; los modelos fusionados en safetensors podrían convertirse a GGUF para llama.cpp u Ollama, pero el autor no documenta ese procedimiento.
- vLLM y TGI no aparecen mencionados en la información disponible; el pipeline declarado es mlx_lm.lora.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la documentación pública de cada modelo base y no han sido verificados en la búsqueda realizada, que no devolvió resultados relevantes.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ilsocio-brain (rinaldiden) | Adaptadores sobre 3B | No disponible | other (sin términos) | Extracción y conversación en italiano para gestión de negocio |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Modelo instruct generalista multilingüe |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | Modelo instruct generalista |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Modelo instruct generalista |

La diferencia relevante no es de rendimiento, sino de naturaleza: ilsocio-brain es un artefacto de ajuste fino sobre Qwen2.5-3B con licencia opaca y sin evaluaciones estándar, mientras que las alternativas son modelos base con licencias públicas y benchmarks publicados.

## Limitaciones y advertencias

- La model card indica que el repositorio es privado y que solo el autor accede a él, lo que contradice su presencia en una ficha pública de HuggingFace y genera incertidumbre sobre el acceso real a los pesos.
- La licencia figura como "other" sin texto de términos publicado, por lo que no se puede confirmar ni descartar el uso comercial; en la práctica, tratarlo como no apto para producción comercial sin aclaración del autor.
- Registra 0 descargas y 0 likes, sin validación externa ni revisión por terceros.
- No hay benchmarks, métricas objetivas ni evaluación independiente; toda la validación es cualitativa y procede del propio autor.
- Está documentado un defecto conocido en la categoría E: el asistente recita la ficha de producto como eslogan en lugar de responder al miedo del usuario, comportamientos etiquetados como ITALIANO_FINTO y atribuidos al registro de las conversaciones de esa categoría.
- El experimento v1.8 muestra que el dataset sin curar no sostiene el componente conversacional, con incoherencia en todas las configuraciones de iteraciones y sobreajuste al aumentar estas; los datos publicados por sí solos no bastan para reproducir un modelo usable.
- El autor advierte de biografías inventadas en versiones anteriores, mitigadas parcialmente con ejemplos cold-start, lo que confirma riesgo de alucinación en el registro conversacional.
- Los idiomas soportados no están declarados y los datos de entrenamiento son en italiano; el comportamiento en castellano no está evaluado y no debería asumirse.
- Trabaja con datos personales y fiscales (edad, residencia, facturación), por lo que cualquier despliegue real exige controles de privacidad y cumplimiento del RGPD.
- El repositorio mezcla checkpoints, datos de entrenamiento y clasificadores, lo que dificulta identificar el artefacto exacto que debe desplegarse; el autor solo recomienda una combinación concreta (extracción v1.7 más conversación v1.6).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rinaldiden/ilsocio-brain
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada: los resultados devueltos corresponden a páginas de productos químicos en japonés, sin relación con el modelo.
