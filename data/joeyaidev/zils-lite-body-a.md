# joeyAIDev/zils-lite-body-a

## Resumen

zils-lite-body-a es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario joeyAIDev en Hugging Face bajo licencia Apache-2.0. Con 852.985.920 parámetros reales en pesos safetensors y un tamaño de repositorio de 1,7 GB, se trata de un modelo compacto orientado a tareas de decisión ligera, según se desprende de la escasa model card del autor ("d3-lite decision body").

El modelo se enmarca en el ecosistema de Zils (zils.ai), una propuesta que entrena modelos pequeños a partir de ejemplos etiquetados para que una aplicación pueda clasificar solicitudes, marcar problemas o puntuar coincidencias. Este checkpoint concreto ("body-a") parece ser un componente de un sistema mayor, no un modelo conversacional de propósito general.

La relevancia actual es limitada pero concreta: los modelos de menos de mil millones de parámetros permiten despliegue en CPU o GPU de consumo con latencias bajas, y los fine-tunes especializados en decisiones acotadas pueden sustituir a modelos grandes en pipelines de clasificación y enrutamiento. La información pública disponible es muy escasa: no hay benchmarks, no hay detalle de datos de entrenamiento y la model card apenas ocupa dos líneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5`, requiere `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros. El tag `custom_code` en Hugging Face indica que la carga requiere código personalizado del repositorio (probablemente `trust_remote_code=True`), lo que implica revisar y confiar en el código remoto antes de ejecutarlo. El tag `qwen3_5` sugiere una generación de la familia Qwen3.5, aunque no se dispone de detalles sobre atención, normalización ni vocabulario.

No hay información publicada sobre el proceso de ajuste fino: se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO o SFT supervisado, y qué hiperparámetros se usaron. La model card solo indica que es un "fine-tuned d3-lite decision body" construido sobre Qwen3.5-0.8B. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento básico heredados del modelo base Qwen3.5-0.8B, si bien el ajuste fino puede haber reducido o especializado estas capacidades.
- Orientación declarada a "decisiones" (decision body): clasificación, enrutamiento o puntuación de entradas según el contexto de Zils.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y el propósito sugieren que no es su foco.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Clasificación de solicitudes entrantes: el modelo puede recibir un texto de usuario y devolver una categoría o etiqueta, integrándose en un backend que enrute tickets hacia el equipo adecuado; su tamaño de 0,85B permite ejecutarlo en CPU con latencia baja.
- Enrutamiento de peticiones en una aplicación: dado un prompt, decidir qué herramienta o flujo invocar, actuando como "cuerpo de decisión" dentro de un sistema mayor orquestado por Zils.
- Marcado de problemas en contenido: detectar y etiquetar incidencias en textos o registros (por ejemplo, reclamaciones o incidencias de soporte) mediante un fine-tune supervisado con ejemplos etiquetados.
- Puntuación de coincidencias (scoring): asignar una puntuación de relevancia o compatibilidad entre pares de textos, útil en motores de recomendación ligeros o matching de candidatos.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación de documentos o puede responderse directamente, reduciendo coste de llamadas a modelos mayores.
- Despliegue en entornos con recursos limitados: al caber en GPU de consumo y en CPU, puede ejecutarse en el edge o en contenedores pequeños para tareas de decisión de alto volumen y baja latencia.
- Prototipado de sistemas de decisión personalizados: servir como base para que un equipo entrene su propio clasificador con ejemplos propios, siguiendo el flujo que propone zils.ai.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; aproximadamente 2-3 GB en la práctica.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB; en 4 bits, en torno a 0,5-0,7 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; también en CPU para cargas moderadas.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `transformers` con `trust_remote_code=True`; la conversión a GGUF para llama.cpp u Ollama no está publicada y requeriría hacerla manualmente. vLLM y TGI podrían no soportar el código personalizado sin adaptación.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-lite-body-a | 852.985.920 | no disponible | Apache-2.0 | safetensors (custom_code) | Fine-tune especializado en decisiones; sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache-2.0 (según base) | safetensors | Modelo generalista del que deriva; capacidades completas |
| Qwen2.5-0.5B / 1.5B (familia previa) | 0,5B / 1,5B | 32K (típico en la familia) | Apache-2.0 | safetensors, GGUF | Alternativas generalistas con amplio soporte de herramientas |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista con licencia más restrictiva |

La comparación con la familia Qwen2.5 y Llama 3.2 es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta datos de entrenamiento, evaluación ni comportamiento esperado; el uso en producción exige validación propia.
- Riesgo de alucinación: al ser un fine-tune de un modelo de 0,8B, la fiabilidad en generación abierta es limitada; su uso previsto es la decisión acotada, no la conversación libre.
- Sesgos: no documentados; al desconocerse el dataset de ajuste, no puede evaluarse el sesgo introducido.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del idioma de entrenamiento (desconocido) es incierto.
- Código remoto: el tag `custom_code` obliga a ejecutar código del autor con `trust_remote_code=True`, lo que supone un riesgo de seguridad que debe auditarse antes de desplegar.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y de cualquier componente de Zils.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.
- Contexto: se desconoce la ventana de contexto efectiva; no asumir la del modelo base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-lite-body-a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
