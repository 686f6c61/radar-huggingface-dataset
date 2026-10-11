# Jhustle44/gemma-3-1b-it-abliterated-mlx-8Bit

## Resumen

Este repositorio contiene una conversión al formato MLX (Apple) con cuantización de 8 bits del modelo `mlabonne/gemma-3-1b-it-abliterated`, a su vez derivado de `google/gemma-3-1b-it`. Se trata, por tanto, de un modelo de generación de texto de 1.301.875.840 parámetros (aproximadamente 1,3 mil millones), basado en la arquitectura Gemma 3 en su variante text-only, que ha sido "abliterado" para eliminar las direcciones de rechazo en los pesos y, después, convertido a MLX mediante mlx-lm 0.22.1.

El problema que resuelve es doble. Por un lado, ofrece una versión sin censura del Gemma 3 1B, útil en investigación sobre comportamiento de modelos y evaluación de sesgos, donde los rechazos automáticos dificultan el análisis. Por otro, empaqueta el resultado en formato MLX de 8 bits para ejecución eficiente en silicio de Apple (chips M-series), un ecosistema con menos opciones de modelos ya cuantizados que el de CUDA.

Es relevante ahora porque el autor del repositorio (`Jhustle44`) parece estar reempaquetando un artefacto atribuido en la propia model card a `erichartford`, con 0 descargas y 0 "likes" en el momento de la consulta. La ficha no aporta licencia, idiomas ni resultados de evaluación, lo que lo convierte en un artefacto de interés principalmente experimental y no en una opción lista para producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante text-only; tag `gemma3_text`) |
| Parametros totales | 1.301.875.840 (aprox. 1,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Gemma 3 1B de Google emplea 32 768 tokens |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | No disponible en la ficha; el modelo base Gemma 3 cubre mas de 140 idiomas |
| Licencia | No disponible (el modelo base se distribuye bajo Gemma Terms of Use) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de 1B parámetros, un transformer decoder-only con atención por ventana deslizante combinada con atención global, normalización RMSNorm, RoPE y grouped-query attention, con un vocabulario de gran tamaño (del orden de 262 000 tokens) orientado a cobertura multilingüe. En el caso del 1B, la familia Gemma 3 es text-only, a diferencia de los modelos mayores que incorporan visión. No se detallan en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al informe técnico del modelo original de Google, no a esta conversión.

La transformación clave realizada por el autor del modelo base, `mlabonne`, es la "abliteración": una técnica de ortogonalización de pesos que identifica la dirección de rechazo en el espacio de activaciones y la proyecta fuera de las matrices de pesos, de modo que el modelo deja de activar respuestas de negativa. Sobre ese resultado, este repositorio aplica una conversión a MLX con cuantización de 8 bits mediante mlx-lm 0.22.1. No se documentan datos adicionales de entrenamiento, fine-tuning ni evaluación en la ficha.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicable vía `tokenizer.apply_chat_template`.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 1,3 mil millones de parámetros (nivel de capacidad limitado por tamaño).
- Generación de código y tareas sencillas de matemáticas, sujetas a las limitaciones típicas de un modelo de esta escala.
- Capacidad multilingüe heredada de Gemma 3, aunque no confirmada explícitamente en esta ficha.
- Comportamiento sin rechazos automáticos por abliteración: el modelo no activa negativas aprendidas.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible` según las etiquetas del repositorio.
- Ejecución en Apple Silicon mediante MLX (`mlx-lm`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué tipo de contenido genera un Gemma 3 1B sin capa de rechazo, comparándolo con el original, en un entorno controlado.
- Evaluación de sesgos y toxicidad: al no bloquear respuestas, facilita la caracterización exhaustiva de las distribuciones de salida en tareas de red-teaming.
- Prototipado local en Mac: con 8 bits MLX, sirve como banco de pruebas rápido para pipelines de generación en un portátil con chip M-series sin GPU dedicada.
- Generación de texto asistida de bajo coste: resúmenes, reescritura o clasificación de textos cortos donde no se requiere razonamiento complejo.
- Ajuste fino posterior: puede emplearse como punto de partida para fine-tuning específico en tareas de dominio, dado su reducido tamaño y su formato compacto.
- Experimentación con decodificación y plantillas de chat: útil para validar integraciones de `mlx-lm` y el formateo de mensajes en el ecosistema Apple.
- Docencia y demostraciones: permite mostrar en clase el efecto de la abliteración sobre el comportamiento de un modelo sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos en la búsqueda web realizada.

## Requisitos de hardware

- Pesos en 8 bits MLX: aproximadamente 1,3 GB en disco y en memoria.
- Pesos en 16 bits (fp16/bf16): aproximadamente 2,6 GB.
- Pesos en 4 bits: aproximadamente 0,7 GB.
- Cabe en cualquier Mac con chip Apple Silicon (M1 o posterior) con al menos 8 GB de memoria unificada; cómodo con 16 GB.
- Cabe igualmente en GPU de consumo (RTX 3060 12 GB, RTX 4060, RTX 4090) si se convierte a otros formatos, aunque el artefacto publicado está pensado para MLX.
- Opciones de despliegue: `mlx-lm` (nativo del artefacto), `llama.cpp` u `Ollama` tras conversión a GGUF, y `text-generation-inference` según las etiquetas del repo.
- Latencia y throughput: no disponibles; no se documentan mediciones en la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Jhustle44/gemma-3-1b-it-abliterated-mlx-8Bit | 1,3 mil millones | No disponible (base: 32 768) | No disponible | No disponible | safetensors MLX 8-bit | HuggingFace, 0 descargas |
| google/gemma-3-1b-it | 1,3 mil millones | 32 768 tokens | Mas de 140 | Gemma Terms of Use | safetensors | HuggingFace, oficial |
| mlabonne/gemma-3-1b-it-abliterated | 1,3 mil millones | No disponible (base: 32 768) | No disponible | No disponible | safetensors | HuggingFace |
| erichartford/gemma-3-1b-it-abliterated-mlx-8Bit | 1,3 mil millones | No disponible (base: 32 768) | No disponible | No disponible | safetensors MLX 8-bit | HuggingFace |

No se dispone de resultados comparativos de rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la capa de rechazo del modelo: puede generar contenido ofensivo, ilegal o peligroso sin filtro, lo que lo desaconseja para aplicaciones de cara al público sin moderación externa.
- No hay información sobre licencia en este repositorio. El modelo base Gemma 3 se rige por Gemma Terms of Use, que impone restricciones de uso comercial y obligaciones de atribución; conviene verificar la cadena de licencias antes de cualquier uso en producción.
- Riesgo elevado de alucinación: con 1,3 mil millones de parámetros, la fiabilidad factual es baja y no debe usarse como fuente de verdad.
- No se documentan idiomas soportados ni cobertura multilingüe efectiva tras la abliteración; es razonable esperar degradación en idiomas distintos del inglés.
- Discrepancia de autoría: la model card menciona `erichartford`, pero el repositorio está publicado por `Jhustle44`; conviene tratar el artefacto como un reempaquetado no verificado.
- Contexto real limitado por el modelo base (32 768 tokens en Gemma 3 1B) y no confirmado para esta conversión.
- Sin benchmarks publicados, no hay evidencia de que la cuantización de 8 bits preserve la calidad del modelo original.
- Metadatos inconsistentes: la etiqueta indica `transformers` como librería, pero el artefacto está en formato MLX; la carga con `transformers` estándar puede no funcionar directamente.
- Repositorio con 0 descargas y 0 "likes", creado y actualizado el mismo día: sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jhustle44/gemma-3-1b-it-abliterated-mlx-8Bit
- Modelo base abliterado: https://huggingface.co/mlabonne/gemma-3-1b-it-abliterated
- Artefacto MLX referenciado en la model card: https://huggingface.co/erichartford/gemma-3-1b-it-abliterated-mlx-8Bit
- Modelo original de Google: https://huggingface.co/google/gemma-3-1b-it
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden de la información de HuggingFace y del conocimiento publico del modelo base.
