# abdukuzi45/qwen3.5-4b-amharic-extended

## Resumen

`abdukuzi45/qwen3.5-4b-amharic-extended` es un modelo publicado en HuggingFace por el usuario `abdukuzi45`, con un total de 4.620.532.736 parámetros (aproximadamente 4,62 mil millones) según los ficheros safetensors del repositorio. El pipeline declarado en la ficha de HuggingFace es `image-text-to-text`, lo que indica que se trata de un modelo multimodal que acepta imagen y texto como entrada y genera texto. La etiqueta de arquitectura incluida es `qwen3_5`, junto con `conversational`, lo que apunta a una adaptación de la familia Qwen3.5, aunque la model card no confirma esta procedencia.

El nombre del repositorio sugiere una especialización en amharico ("amharic extended"), presumiblemente mediante ampliación de vocabulario o ajuste fino supervisado sobre un modelo base. Sin embargo, la model card publicada es la plantilla genérica y automática de HuggingFace, sin ninguna sección completada: no hay información sobre datos de entrenamiento, hiperparámetros, idiomas declarados, licencia ni evaluación. Todo lo que no sea el recuento de parámetros, el pipeline y las etiquetas debe considerarse no verificado.

La relevancia de este modelo es limitada y fundamentalmente exploratoria: en el momento de redactar esta ficha cuenta con 0 descargas y 0 "likes", no tiene licencia declarada y no se ha publicado ningún resultado de evaluación. Se trata, por tanto, de un artefacto sin documentación que debe tratarse con cautela antes de cualquier uso en producción. Los resultados de la búsqueda web asociados a esta consulta no contienen información relacionada con el modelo (devuelven páginas de la administración tributaria francesa), por lo que no aportan ningún dato adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere la familia Qwen3.5, sin confirmar por el autor) |
| Parametros totales | 4.620.532.736 (≈4,62 B), según safetensors del repositorio |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni AWQ/GPTQ en el repositorio) |
| Idiomas soportados | no disponible (el nombre del repositorio menciona amharico, pero no hay declaración oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers |
| Pipeline declarado | image-text-to-text |
| Etiquetas | transformers, safetensors, qwen3_5, image-text-to-text, conversational, arxiv:1910.09700, endpoints_compatible, region:us |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. La model card es la plantilla automática de HuggingFace y todas las secciones relevantes (descripción, fuentes, datos de entrenamiento, procedimiento, hiperparámetros, evaluación) aparecen marcadas como "[More Information Needed]". Las únicas pistas son las etiquetas del repositorio: `qwen3_5` sugiere que el modelo deriva de la familia Qwen3.5, y `image-text-to-text` indica una topología multimodal con una torre de visión conectada a un decodificador de lenguaje. El tamaño de 4,62 B de parámetros es ligeramente superior a los 4 B que sugiere el nombre, diferencia compatible con una ampliación de la matriz de embeddings (escenario típico cuando se extiende el vocabulario para un idioma con escritura propia, como el ge'ez empleado por el amharico), pero esto es una hipótesis no confirmada.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo ajuste fino supervisado, RLHF o DPO, y qué técnica se empleó para la supuesta adaptación al amharico. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al artículo de Lacoste et al. sobre el calculador de impacto medioambiental (Machine Learning Impact calculator), citado en la plantilla estándar de model cards; no es un artículo asociado al desarrollo del modelo.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está formateado para diálogo multi-turno, presumiblemente mediante plantilla de chat de tipo Qwen.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`): el modelo puede, en principio, recibir pares imagen-texto y producir respuestas textuales. No se especifica la resolución de imagen soportada ni si hay grounding visual o detección de objetos.
- Multilingüismo: no declarado. El nombre del repositorio apunta a un refuerzo del amharico, pero no hay lista oficial de idiomas ni confirmación de que se conserven las capacidades multilingües del modelo base.
- Tool calling / function calling: no disponible. No se documenta ningún formato de llamada a herramientas ni soporte de plantillas de funciones.
- Capacidades de agente y razonamiento multi-paso: no disponible. No se menciona modo de razonamiento explícito ni cadenas de pensamiento largas.
- Otras capacidades especiales: no disponible.

## Casos de uso

Dado que no existe documentación verificable, los casos siguientes son escenarios de uso plausibles condicionados a la validación previa del modelo por parte del equipo que lo adopte. En ningún caso deben desplegarse sin una evaluación propia.

- Procesamiento de documentos en amharico: si se confirma la especialización en este idioma, el modelo podría emplearse para resumir, extraer entidades o responder preguntas sobre textos administrativos y periodísticos escritos en ge'ez, un idioma con escasa cobertura en modelos abiertos. Requiere verificar primero la calidad real de generación en ese idioma.
- Digitalización de formularios y documentos escaneados: al aceptar entrada de imagen, el modelo podría extraer texto estructurado de fotografías de documentos. Es necesario comprobar la resolución de imagen soportada y la tasa de error de OCR antes de usarlo en un flujo automatizado.
- Asistente conversacional de bajo coste en local: con 4,62 B de parámetros, es desplegable en una GPU de consumo, lo que permite montar un chatbot privado sin enviar datos a terceros. Adecuado en entornos con requisitos de soberanía de datos.
- Prototipado y experimentación académica sobre idiomas de bajos recursos: el modelo puede servir como punto de partida para investigar adaptación de vocabulario y ajuste fino en lenguas etiópicas, comparando su comportamiento con el del modelo base.
- Generación aumentada por recuperación (RAG) sobre corpus en amharico: si la longitud de contexto es suficiente, podría integrarse como generador en un pipeline RAG que recupere fragmentos de una base documental local. La longitud de contexto real debe medirse empíricamente.
- Descripción de imágenes en entornos con conectividad limitada: en escenarios de campo (por ejemplo, clasificación o descripción de fotografías), un modelo multimodal pequeño ejecutable en local evita depender de APIs en la nube.
- Evaluación de seguridad y sesgos en modelos de la familia Qwen adaptados a nuevos idiomas: útil como caso de estudio para medir cómo una ampliación de vocabulario afecta al rendimiento en el idioma original del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación completada y la búsqueda web no ha devuelto datos relacionados con el modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros publicado (4,62 B). No son mediciones reales del modelo.

| Precisión | Peso de los pesos | VRAM estimada en inferencia (con caché KV y overhead) |
|---|---|---|
| BF16 / FP16 | ≈9,2 GB | ≈11-13 GB |
| FP8 / INT8 | ≈4,6 GB | ≈6-8 GB |
| GGUF Q8_0 (no publicado) | ≈4,9 GB | ≈6-8 GB |
| GGUF Q5_K_M (no publicado) | ≈3,2 GB | ≈4-6 GB |
| GGUF Q4_K_M (no publicado) | ≈2,7 GB | ≈4-5 GB |

- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM si se cuantiza, y en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en BF16. La presencia de una torre de visión añade consumo adicional no cuantificado.
- GPU recomendadas para producción: A100 40 GB, L40S, H100 o RTX 4090, aunque por tamaño bastaría con una GPU de 16-24 GB.
- Opciones de despliegue: `transformers` es la vía garantizada, ya que solo se publican pesos en safetensors. vLLM y TGI requerirían verificar compatibilidad con la arquitectura concreta. `llama.cpp` u Ollama no son utilizables directamente porque no hay ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible. No hay ninguna medición publicada por el autor.
- Nota sobre almacenamiento: el repositorio con pesos en BF16 ocupa del orden de 9-10 GB, más los ficheros auxiliares del procesador multimodal.

## Comparativa con modelos similares

La comparativa se ofrece a título orientativo. Los datos del modelo objeto de la ficha son en su mayoría no disponibles; los de los alternativas provienen de la documentación pública de sus respectivos desarrolladores y no han podido verificarse en la búsqueda realizada.

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| abdukuzi45/qwen3.5-4b-amharic-extended | ≈4,62 B | no disponible | imagen-texto a texto | no disponible |
| Qwen3-4B | ≈4 B | 32.768 tokens nativos, ampliable con YaRN | solo texto | Apache 2.0 |
| Qwen2.5-VL-3B-Instruct | ≈3,75 B | 32.768 tokens | imagen-texto a texto | Apache 2.0 (variantes con condiciones) |
| Llama 3.2 3B Instruct | ≈3,2 B | 128.000 tokens | solo texto | Licencia comunitaria de Llama |
| Gemma 3 4B | ≈4 B | 128.000 tokens | imagen-texto a texto | Términos de uso de Gemma |

Diferencias clave: frente a estas alternativas, el modelo analizado no declara licencia, idiomas ni contexto, y no publica evaluación alguna. Para uso comercial serio, cualquiera de las alternativas con licencia explícita ofrece garantías jurídicas de las que este repositorio carece.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin completar. No se puede conocer el dataset, el proceso de entrenamiento ni las intenciones del autor.
- Licencia no disponible: sin licencia explícita, no existe autorización de uso comercial. Por defecto, rigen las restricciones de derechos de autor y el modelo no debería utilizarse en productos o servicios sin aclarar previamente la situación legal con el autor.
- Idiomas no declarados: aunque el nombre del repositorio sugiere amharico, no hay confirmación de qué idiomas domina ni con qué calidad. Es probable que el rendimiento en idiomas distintos del objetivo se haya degradado respecto al modelo base.
- Riesgo de alucinación: no evaluado. Al no existir benchmarks ni pruebas de robustez, se desconoce la tasa de invención de hechos, especialmente en tareas de OCR o extracción de datos.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgos sociales, políticos o culturales, ni en el idioma objetivo ni en otros.
- Contexto desconocido: la ventana de contexto es un dato crítico y no está disponible. Debe medirse empíricamente antes de diseñar cualquier aplicación con entradas largas.
- Riesgo de comportamiento inestable en multimodalidad: el pipeline `image-text-to-text` está declarado en las etiquetas, pero no se documenta la resolución de imagen ni el preprocesado esperado, lo que puede provocar errores silenciosos si se usa con imágenes fuera del rango previsto.
- Procedencia incierta del ajuste: se desconoce si el ajuste fino respetó las condiciones de uso del modelo base subyacente, lo que añade riesgo adicional si dicho modelo base tuviera licencia restrictiva.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de creación y actualización (ambas el 2026-09-14). No hay comunidad que haya validado su funcionamiento.
- Recomendación: tratar el modelo como experimental. Antes de cualquier uso, reproducir su carga en `transformers`, medir contexto efectivo, evaluar calidad en amharico con un conjunto propio y revisar la licencia con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-extended
- Articulo citado en las etiquetas (calculador de impacto medioambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Documentación de la librería `transformers`: https://huggingface.co/docs/transformers/index
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
