# MeerDevelopment/template-tagger-qwen3.5-4b-lora

## Resumen

`template-tagger-qwen3.5-4b-lora` es un adaptador LoRA desarrollado por MeerDevelopment sobre el modelo base Qwen/Qwen3.5-4B, orientado a la comprensión de documentos y al etiquetado de plantillas. El modelo resuelve un problema muy concreto: dado un documento y una lista de etiquetas de plantilla (cada una asociada a la etiqueta textual que la precede), el modelo indica qué etiqueta va anclada a qué punto del documento. Nunca reemite el documento, sino que devuelve una línea por etiqueta con el nombre de la etiqueta y el ancla textual que la precede, de modo que el llamador inserta la etiqueta renderizada tras encontrar el ancla.

El adaptador está pensado para el dominio del papeleo inmobiliario neerlandés de obra nueva: contratos de compraventa, contratos de construcción, garantías, cartas de entrega y recordatorios de pago. El autor lo publica explícitamente como prueba de concepto (v0.0.1) y advierte de que no debe llevarse a producción: sobre contratos reales alcanza un F1 de 0,238, frente a 0,842 sobre datos sintéticos realistas. La brecha entre ambos entornos es el dato más relevante de esta versión.

La relevancia actual del modelo es doble: por un lado, demuestra una técnica de extracción estructurada que evita la reescritura del documento (lo que elimina el riesgo de deriva textual); por otro, sirve como referencia honesta de las limitaciones de los adaptadores LoRA pequeños entrenados con datos sintéticos cuando se enfrentan a documentos reales con convenciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (base: Qwen/Qwen3.5-4B) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el autor recomienda dividir documentos de más de ~1200 caracteres en ventanas por párrafos |
| Tipos de cuantización | no disponible (pesos publicados en bf16 y en carpeta `merged/` en bf16) |
| Idiomas soportados | neerlandés (nl) principalmente; inglés (en) con corpus de entrenamiento ~20% en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y pesos fusionados en `merged/` |

## Arquitectura y entrenamiento

El adaptador es un LoRA (PEFT) sobre el modelo causal Qwen/Qwen3.5-4B. El entrenamiento se realizó en bf16 (la model card se corta en "Trained in bf1", presumiblemente bf16). El modelo aprende a producir una salida estructurada de una línea por etiqueta, con el nombre de la etiqueta y el ancla textual copiada del documento (cola de la línea, máximo 40 caracteres). El llamador localiza el ancla en el documento e inserta la etiqueta renderizada, de modo que el texto del documento se preserva byte a byte y no puede derivar.

Los datos de entrenamiento consisten en 469 documentos sintéticos y 3964 ventanas de entrenamiento, generados a partir de especificaciones construidas con el inventario de etiquetas y esqueletos de 18 plantillas neerlandesas reales. Contribuyeron cinco modelos generadores: Qwen3.8 Flash, DeepSeek V4.1 Flash, GLM 5.3, Claude Opus 5.5 y Claude Sonnet 5.5. Cada documento generado pasó un filtro de PII (email, teléfono, código postal, IBAN, BSN, número de cámara de comercio, más una lista blanca de valores ficticios), una comprobación de solapamiento de 8-gramas contra los documentos reales y un validador estructural. Las plantillas reales no se incluyeron en esta publicación ni se usaron para entrenar; solo se emplearon como conjunto de evaluación. El corpus sintético no se publica con el modelo.

Las reglas de entrenamiento son explícitas: solo nombres de etiqueta de la lista, sin delimitadores (el llamador renderiza el estilo: `${}`, `$[]`, `$<>`, `{{}}`, `<<>>`, `[]`, `{}` y cualquier otro par); las etiquetas de la lista que no pertenecen al documento se omiten; una etiqueta de bloque aparece dos veces, una como nombre y otra con una `/` delante; el ancla es la cola de la línea que sigue a la etiqueta, de hasta 40 caracteres copiados del documento. Se recomienda `enable_thinking=False`.

## Capacidades

- Etiquetado de plantillas sobre documentos: dado un documento y una lista de etiquetas con su etiqueta textual precedente, devuelve una línea por etiqueta con el nombre y el ancla.
- Preservación byte a byte del documento: el modelo nunca reescribe el texto, solo emite anclas; el llamador inserta las etiquetas renderizadas.
- Gestión de etiquetas de bloque: emite la etiqueta de inicio y la de cierre (con `/` delante).
- Omisión de etiquetas no aplicables: las etiquetas de la lista que no pertenecen al documento se descartan.
- Soporte multilingüe limitado: neerlandés como idioma principal, inglés con cobertura parcial (~20% del corpus).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (se recomienda desactivar el thinking del modelo base).

## Casos de uso

- Importación de contratos de compraventa de obra nueva: el modelo recibe el contrato y la lista de etiquetas de la plantilla del CRM o gestor documental, y devuelve qué etiqueta ancla a qué campo (por ejemplo, `voornaam` tras `Naam:`), de modo que el sistema inserta las etiquetas renderizadas sin reescribir el documento. Adecuado por su enfoque de anclaje que evita la deriva textual, aunque requiere revisión humana por su F1 de 0,238 en contratos reales.
- Preetiquetado asistido en herramientas de plantillas: un operador humano revisa y corrige las etiquetas propuestas, reduciendo el trabajo manual de localizar cada uno de los treinta campos de un contrato de compraventa. El modelo acelera el proceso aunque no lo automatice por completo.
- Procesamiento por ventanas de documentos largos: para contratos de más de ~1200 caracteres, el pipeline divide el documento en párrafos y procesa ventana a ventana, llevando la lista de etiquetas en cada ventana. Útil en contratos de construcción y garantías con secciones extensas.
- Etiquetado de bloques condicionales: el modelo localiza el inicio de secciones condicionales (por ejemplo, bloques de la parte compradora o vendedora) con mayor fiabilidad que su cierre, por lo que es adecuado para marcar el inicio de bloques y dejar el cierre a validación posterior.
- Generación de conjuntos de evaluación para pipelines de extracción: al ser un adaptador pequeño y de licencia Apache 2.0, puede servir como baseline reproducible en la evaluación de sistemas de etiquetado de plantillas sobre documentos neerlandeses.
- Investigación sobre generalización de datos sintéticos: la brecha documentada entre el rendimiento sintético (F1 0,842) y el real (F1 0,238) lo convierte en un caso de estudio útil para investigar cómo mejorar la transferencia de adaptadores LoRA entrenados con datos generados.
- Prototipado de flujos de contratos de obra nueva en neerlandés: para validar la arquitectura de anclaje y el formato de salida antes de invertir en un modelo mayor o en anotación humana a gran escala.

## Benchmarks y rendimiento

Evaluación del autor. Una etiqueta cuenta como correcta cuando el nombre coincide con el oro y el punto de inserción está a dos caracteres o menos. `text intact` es igualdad byte a byte del documento tras eliminar las etiquetas.

| Ejecución | Ejemplos | Precisión | Recall | F1 | Texto intacto |
|---|---|---|---|---|---|
| Qwen3.5-4B base, contratos reales | 26 | 0,000 | 0,000 | 0,000 | 100% |
| Este adaptador, contratos reales | 26 | 0,238 | 0,238 | 0,238 | 92,3% |
| Este adaptador, sintético realista | 167 | 0,850 | 0,834 | 0,842 | 95,2% |
| Este adaptador, sintético | 128 | 0,647 | 0,629 | 0,638 | 75,0% |

Desglose de fallos sobre contratos reales (porcentaje de etiquetas oro):

| Resultado | Porcentaje de etiquetas oro |
|---|---|
| Correcta | 28% |
| Campo simple nombrado como su variante `_partner` o al revés | 34% |
| Etiqueta no emitida | 16% |
| Posición correcta, nombre de etiqueta incorrecto | 12% |
| Etiqueta correcta, posición desviada más de dos caracteres | 10% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 4B parámetros; en bf16 requiere aproximadamente 8 GB solo para pesos, más el adaptador LoRA (el repositorio ocupa 8,7 GB, incluyendo la carpeta `merged/` en bf16). En cuantización de 4 bits podría caber en GPUs de 6-8 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas para bf16; una RTX 3060 de 12 GB podría alojar el modelo en bf16 ajustadamente.
- ¿Cabe en GPU de consumo? Sí, en bf16 en GPUs de 12 GB o más; en cuantización de 4 bits en GPUs de 8 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador o de la carpeta `merged/`), vLLM, TGI, llama.cpp y Ollama no están confirmados en la información disponible; el autor solo documenta el uso con `peft` y `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| template-tagger-qwen3.5-4b-lora | 4B (base) + LoRA | no disponible (ventanas de ~1200 caracteres) | F1 0,238 en contratos reales; 0,842 en sintético realista | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | F1 0,000 en la tarea (no produce el formato) | no disponible | Hugging Face |
| Alternativas de etiquetado de plantillas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables en la misma tarea de etiquetado de plantillas sobre documentos neerlandeses.

## Limitaciones y advertencias

- No apto para producción: F1 de 0,238 sobre contratos reales; el autor estima que hay que corregir aproximadamente tres de cada cuatro etiquetas.
- Confusión de bloques de pareja: el 34% de las etiquetas oro se nombran como su variante `_partner` o al revés. Los contratos neerlandeses marcan el bloque de la segunda persona con una línea `En` y repiten las mismas etiquetas, mientras que el corpus sintético escribía "partner" en la etiqueta; el modelo aprendió la convención sintética.
- Etiquetas omitidas: el 16% de las etiquetas oro no se emiten. Una omisión desplaza todas las etiquetas siguientes en un formulario repetido, convirtiendo seis etiquetas correctas en seis incorrectas.
- Etiquetas de bloque: el modelo localiza con más fiabilidad el inicio que el cierre de una sección condicional y a veces envuelve el contenido del bloque en saltos de línea espurios.
- Dominio restringido: papeleo inmobiliario neerlandés de obra nueva (compraventa, construcción, garantías, cartas de entrega, recordatorios de pago). Otros dominios degradan el rendimiento.
- Idioma: neerlandés principal; el inglés funciona pero el corpus es ~20% en inglés.
- El modelo inserta etiquetas, no decide qué etiquetas necesita un documento: la lista de etiquetas es el contrato.
- Riesgo de alucinación: el modelo no reescribe el documento, pero puede emitir anclas que no existen en el texto; el llamador debe reportar las anclas no encontradas como no colocadas en lugar de adivinarlas.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la falta de precisión desaconseja su uso desatendido.
- Documentos de más de ~1200 caracteres deben dividirse en ventanas por párrafos, con la lista de etiquetas repetida en cada ventana.

## Enlaces

- Hugging Face: https://huggingface.co/MeerDevelopment/template-tagger-qwen3.5-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
