# attention-is-all-i-want/LFM3-1.7B-3DCoder

## Resumen

LFM3-1.7B-3DCoder es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, un transformer de 1.728.801.600 parámetros, especializado en generar escenas 3D en Three.js dentro de un único archivo HTML autocontenido. Lo publica el usuario `attention-is-all-i-want` en Hugging Face y su propósito es transformar una descripción textual de una escena en código JavaScript funcional que renderiza esa escena en el navegador.

El modelo parte del checkpoint base LFM3-1.7B de LiquidAI y se entrena en dos fases: primero con SFT (supervised fine-tuning) sobre el dataset `ccore/ThreeJS-3D-Scenes`, y después con GSPO, una variante de optimización por refuerzo. El resultado es un modelo conversacional orientado a una tarea muy concreta: código de gráficos 3D para la web.

Es relevante como ejemplo de especialización vertical sobre un modelo pequeño, pero el propio autor lo presenta explícitamente como un experimento "just for fun": solo aproximadamente el 23 % de las respuestas se renderizan sin errores en prompts nuevos, por lo que no es apto para uso en producción. La ficha debe leerse con esa advertencia presente en todo momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye pesos en formato GGUF); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" / "lfm1.0") |
| Formato de pesos | GGUF (tamano del repo: 8,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base LiquidAI/LFM3-1.7B, del que no se detallan en la información disponible las particularidades internas (tipo de atención, composición de capas, etc.). Sobre esa base se aplica un ajuste fino supervisado (SFT) con el dataset `ccore/ThreeJS-3D-Scenes`, un conjunto de ejemplos de descripciones de escenas emparejadas con código Three.js en HTML autocontenido.

Tras el SFT, el autor aplica una segunda fase de entrenamiento con GSPO (Group Sequence Policy Optimization), una técnica de aprendizaje por refuerzo que optimiza la política a nivel de secuencia. Esta combinación SFT + RL busca alinear las generaciones con escenas que rendericen correctamente, aunque el propio autor reconoce que la tasa de éxito en prompts nuevos se queda en torno al 23 %. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de las fases de SFT y GSPO.

## Capacidades

- Generación de código: produce archivos HTML completos con JavaScript de Three.js cargado desde CDN (cdnjs) a partir de una descripción textual de una escena.
- Construcción de escenas 3D: geometrías, materiales, iluminación, cámara y animaciones básicas dentro de un único archivo autocontenido.
- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo está marcado como conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a una tarea única de generación de código.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rápido de escenas 3D: dado un prompt descriptivo, el modelo genera un HTML con Three.js que puede abrirse directamente en el navegador para explorar una idea visual antes de implementarla a mano. Útil por su bajo coste y su tamaño reducido, aunque conviene revisar el resultado.
- Generación de ejemplos educativos: sirve para producir fragmentos de código de Three.js que ilustren conceptos como iluminación, materiales o cámara en tutoriales y materiales de formación, siempre con revisión humana.
- Exploración creativa de escenas: descripciones de interiores, exteriores o vehículos (teatro en casa, submarino, lobby de hotel, parada de autobús, según los ejemplos del autor) que el modelo traduce a geometría y luces.
- Generación de borradores para demos web: el HTML autocontenido con CDN facilita incrustar una demo rápida en una página o en una presentación sin infraestructura adicional.
- Pruebas de concepto de pipelines text-to-3D: como modelo pequeño (1,7 B parámetros) es barato de ejecutar y sirve para validar la viabilidad de un flujo de generación de escenas antes de invertir en modelos mayores.
- Investigación sobre RL aplicado a código: el uso de GSPO sobre un modelo pequeño y una tarea verificable (renderizado correcto) lo convierte en un caso de estudio para experimentar con recompensas basadas en ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una métrica cualitativa: aproximadamente el 23 % de las respuestas se renderizan sin errores en prompts nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7 B parámetros, en FP16 requiere aproximadamente 3,5 GB de VRAM solo para los pesos; en cuantizaciones GGUF de 8 bits o 4 bits el requisito baja a rangos del orden de 2 GB o 1 GB respectivamente (estimación orientativa, no publicada por el autor).
- GPU recomendadas: una GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo en cuantización GGUF; para FP16 basta con GPUs de 8 GB o más (RTX 3070/4060 Ti, A10, L4).
- ¿Cabe en GPU consumer? Sí, con holgura, dado el tamaño del modelo.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM o TGI si se dispone de pesos en safetensors (no confirmado en la información disponible); el repo está marcado como compatible con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-3DCoder | 1,728,801,600 | no disponible | Three.js / 3D en HTML | lfm1.0 | Hugging Face (GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B (aprox.) | no disponible en esta ficha | Propósito general | lfm1.0 | Hugging Face |
| Modelos de código generalistas de tamaño similar | no disponible | no disponible | Código general | variable | Hugging Face |

La comparación con alternativas de la misma categoría (generación de código Three.js) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia es la especialización en la tarea y el entrenamiento con GSPO; frente a modelos de código generalistas, la ventaja es el tamaño reducido y la desventaja, la tasa de éxito limitada.

## Limitaciones y advertencias

- Tasa de éxito baja: el propio autor indica que solo aproximadamente el 23 % de las respuestas se renderizan sin errores en prompts nuevos; los ejemplos mostrados son seleccionados a mano.
- No apto para producción: el autor lo describe como "just for fun" y "not practical for real use".
- Riesgo de alucinación de código: puede generar APIs, nombres de clases o parámetros de Three.js inexistentes o incorrectos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia es lfm1.0 (etiquetada como "other"), lo que puede imponer condiciones para uso comercial; conviene revisar el archivo LICENSE del repo antes de cualquier uso.
- Dependencia de CDN: las escenas generadas cargan Three.js desde cdnjs, por lo que requieren conexión a internet y están sujetas a la disponibilidad de esa CDN.
- Madurez: el repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attention-is-all-i-want/LFM3-1.7B-3DCoder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Licencia (archivo LICENSE del repo): https://huggingface.co/attention-is-all-i-want/LFM3-1.7B-3DCoder/blob/main/LICENSE
