# phbg/gemma-3-1b-smart-notifications-qlora-pilot

## Resumen

El modelo `phbg/gemma-3-1b-smart-notifications-qlora-pilot` es un adaptador LoRA experimental publicado por Pedro Belota sobre el checkpoint público `google/gemma-3-1b-it` de Google. Su propósito es estudiar la summarización corta de secuencias de notificaciones en portugués, generando un párrafo de hasta 25 palabras que preserve nombres, valores, fechas, horarios, plazos y el estado más reciente de la secuencia. Se trata de un artefacto de investigación y portafolio, no de un componente listo para producción.

El adaptador se entrenó mediante QLoRA con cuantización NF4, rango LoRA `r=8` y `alpha=16`, adaptando únicamente los módulos `q_proj` y `v_proj`. El entrenamiento empleó 512 ejemplos sintéticos de entrenamiento y 16 de validación del dataset `phbg/smart-notifications-synthetic`, durante 64 pasos y una época sobre una GPU Tesla T4, con un pico de memoria de aproximadamente 2,75 GB y un tiempo registrado de 286,34 segundos.

Su relevancia es acotada: sirve como referencia metodológica para adaptaciones de bajo coste sobre modelos pequeños y como exploración de un caso de uso concreto (resumen de notificaciones), pero el propio autor advierte que no se ha validado en un conjunto independiente con revisión humana y que no se afirma ninguna mejora general sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Gemma 3 1B IT |
| Parametros totales | No disponible (adaptador LoRA con r=8 sobre `q_proj` y `v_proj`; el modelo base tiene 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Gemma 3 1B IT) |
| Tipos de cuantizacion | Entrenamiento en NF4 (QLoRA); pesos del adaptador en safetensors; cuantizaciones del adaptador no especificadas |
| Idiomas soportados | Portugués (pt) |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-1b-it` (revisión `dcc83ea841ab6100d6b47a070329e1ba4cf78752`), un transformer decoder-only de la familia Gemma 3 en su variante de 1B parámetros ajustada para instrucciones. La adaptación emplea QLoRA con cuantización NF4 del modelo base, LoRA de rango `r=8` y `alpha=16`, y solo modifica los módulos de proyección `q_proj` y `v_proj`. En total se alteraron 104 tensores entrenables.

El entrenamiento usó el dataset sintético y procedural `phbg/smart-notifications-synthetic` (revisión `7cb29736e49ed7dd4de6b31bf5d3ff033fa9e316`), con 512 ejemplos de entrenamiento y 16 de validación; el split de test no se utilizó. Se ejecutaron 64 pasos en una época sobre una Tesla T4 en 286,34 segundos, con un pico de memoria GPU de 2.948.267.008 bytes. La loss de entrenamiento final agregada fue 1,5349, y la de validación 1,2532 en el paso 32 y 1,0369 en el paso 64. No se documenta RLHF, DPO ni ninguna innovación de decodificación; el valor técnico del experimento reside en la metodología de bajo coste, no en una arquitectura novedosa.

## Capacidades

- Generación de texto orientada a resumen corto de secuencias de notificaciones en portugués.
- Producción de un párrafo de hasta 25 palabras que intenta preservar nombres, valores, fechas, horarios, plazos y el estado más reciente.
- Formato de salida controlado por longitud: en la muestra de validación, 16/16 salidas fueron no vacías y respetaron el límite de 25 palabras.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al portugués según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se documenta ninguna capacidad adicional más allá de la summarización de notificaciones.

## Casos de uso

- Resumen de notificaciones en portugués para aplicaciones Android: el adaptador se entrenó específicamente para condensar una secuencia de notificaciones en un párrafo de hasta 25 palabras, preservando entidades y estado reciente; encaja en la capa de presentación de una app de gestión de notificaciones.
- Investigación metodológica sobre QLoRA de bajo coste: sirve como ejemplo reproducible de adaptación de un modelo de 1B con 512 ejemplos y 64 pasos en una T4, útil para estudiar el efecto del ajuste fino con datos sintéticos.
- Prototipado de portafolio y demostración técnica: el repositorio documenta el pipeline completo (dataset, notebook, evaluación y exportación), lo que permite reutilizar el flujo en otros experimentos de summarización.
- Generación de resúmenes de alertas sintéticas en entornos de prueba: al estar entrenado con datos procedurales, puede emplearse para validar pipelines de resumen antes de disponer de datos reales anonimizados.
- Estudio de errores de factualidad en modelos pequeños: el autor documenta información inventada y errores de estado en algunas respuestas, lo que convierte al adaptador en un caso de estudio sobre alucinación en summarización de entidades.
- Base para comparaciones controladas: permite contrastar el comportamiento del modelo base frente al adaptado en tareas de retención de entidades y formato, siempre con validación humana adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de entrenamiento y una comprobación de formato sobre 16 ejemplos de validación:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento final agregada | 1,5349 |
| Loss de validación (paso 32) | 1,2532 |
| Loss de validación (paso 64) | 1,0369 |
| Salidas no vacías y ≤ 25 palabras (validación) | 16/16 |
| Ejemplos de validación | 16 |
| Ejemplos de entrenamiento | 512 |
| Pasos de entrenamiento | 64 |

El propio autor indica que estos números miden solo formato y no demuestran ganancia de factualidad ni utilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento QLoRA en NF4 alcanzó un pico de 2.948.267.008 bytes (aproximadamente 2,75 GB) en una Tesla T4; la inferencia del adaptador sobre el modelo base de 1B requiere menos memoria que el entrenamiento, aunque no se publica una cifra específica.
- GPU recomendadas: Tesla T4 es la GPU documentada para el entrenamiento; para inferencia, cualquier GPU con al menos la memoria suficiente para el modelo base de 1B en la precisión elegida.
- Cabe en GPU de consumo: no se documenta explícitamente, pero un modelo base de 1B es compatible con GPUs de consumo modernas; no se especifican modelos concretos.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained`), tal como se muestra en la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phbg/gemma-3-1b-smart-notifications-qlora-pilot` | Adaptador LoRA sobre 1B | No disponible | Adaptador QLoRA para summarización en portugués | Gemma | Hugging Face (0 descargas) |
| `google/gemma-3-1b-it` | 1B | No disponible | Modelo base instruccional | Gemma | Hugging Face (modelo público de Google) |
| Otros adaptadores LoRA de summarización en portugués | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy pequeño: solo 512 ejemplos sintéticos y 64 pasos, lo que limita la generalización.
- Evaluación automática limitada a 16 ejemplos de validación y a criterios de formato; no hubo evaluación ciega, comparación estadística ni test independiente.
- El conjunto de test permanece intacto y debe reservarse para una evaluación posterior.
- El modelo puede inventar información, omitir entidades e interpretar incorrectamente cambios de estado, según la inspección cualitativa del autor.
- Las notificaciones pueden contener códigos, datos financieros y mensajes privados; no debe enviarse contenido real sin autorización y controles adecuados.
- No debe usarse para decisiones financieras, médicas, jurídicas o de seguridad.
- El adaptador no puede colocarse directamente en la aplicación Android del proyecto DevTITANS, que usa un artefacto Gemma 4 E2B en LiteRT-LM; son modelos separados.
- La licencia Gemma impone sus propios términos al modelo base; la publicación del adaptador no concede derechos sobre el checkpoint base.
- El dataset y la documentación tienen sus propias condiciones de uso.
- Sesgos conocidos: no documentados explícitamente, aunque al entrenarse con datos sintéticos procedurales puede no reflejar la distribución real de notificaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/phbg/gemma-3-1b-smart-notifications-qlora-pilot)
- [Modelo base google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Dataset phbg/smart-notifications-synthetic](https://huggingface.co/datasets/phbg/smart-notifications-synthetic)
- [Notebook público del piloto](https://github.com/pedrobelota/android-smart-notifications/blob/feat/poc-litert-gemma/notebooks/notification_qlora_pilot.ipynb)
- [Proyecto Smart Notifications / DevTITANS](https://github.com/pedrobelota/android-smart-notifications)
