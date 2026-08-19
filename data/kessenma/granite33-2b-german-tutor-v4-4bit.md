# kessenma/granite33-2b-german-tutor-v4-4bit

## Resumen

El modelo `kessenma/granite33-2b-german-tutor-v4-4bit` es un fine-tune QLoRA del modelo base `ibm-granite/granite-3.3-2b-instruct` (IBM), especializado en tutoría de gramática alemana. El autor, kessenma, lo ha desarrollado como la capa de baja memoria de una aplicación iOS de tarjetas de aprendizaje: al ocupar solo 1.4 GB, puede ejecutarse en dispositivos que no pueden alojar modelos más grandes. La versión v4 es la cuarta iteración y supera a la anterior (r32 no publicada) en todos los conjuntos de pruebas.

El modelo está cuantizado a 4 bits (grupo de tamaño 64, affine) y exportado al formato MLX para inferencia en dispositivos Apple Silicon. Tiene 396 millones de parámetros totales (según los safetensors), aunque el nombre indica 2B porque el modelo base es de 2 mil millones de parámetros; la cuantización reduce el peso real. El tokenizer es un BPE de 49k tokens, que es menos eficiente para alemán que un SentencePiece (1.9× más tokens por palabra). Se distribuye bajo licencia Apache-2.0 y está pensado para generación de texto conversacional con corrección gramatical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune QLoRA sobre Granite-3.3-2B-Instruct) |
| Parametros totales | 396.005.568 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | 4-bit (grupo 64, affine) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-3.3-2b-instruct`, un modelo transformer de 2B parametros de IBM, y se ha fine-tuneado con QLoRA (r=32). El entrenamiento se realizo sobre un corpus propio llamado v4, que contiene 42.841 filas, cubriendo 15 fenomenos gramaticales del aleman, con una proporcion de 70% de frases con error y 30% correctas. Las filas fueron generadas por un profesor (gemma-4-31B en modo bulk, con juicio de fenomenos por Claude Sonnet) y validadas con LanguageTool y spaCy. Tras el entrenamiento, el modelo se cuantizo a 4 bits con grupo de 64 y esquema affine para MLX, optimizado para inferencia en dispositivos Apple.

El tokenizer es un byte-level BPE de 49k tokens, disenado para aleman e ingles. Segun el autor, el texto aleman requiere aproximadamente 1.9 veces mas tokens que un modelo SentencePiece de tamano similar, lo que afecta a la velocidad de generacion por palabra.

## Capacidades

- Correccion gramatical del aleman: el modelo identifica frases incorrectas y devuelve una correccion, una explicacion y una pista para el alumno.
- Tutoria conversacional: mantiene un tono natural y hace preguntas de seguimiento (tasa de preguntas de seguimiento de 0.92 por respuesta).
- Salida estructurada: sigue un contrato de salida fijo: para frases correctas devuelve `OK`; para incorrectas, un bloque con `FIX: <frase corregida>`, `WHY: <explicacion>` y `HINT: <pregunta que guia al alumno>`.
- Capacidad multilingue: aunque esta especializado en aleman, el modelo base soporta ingles y puede manejar instrucciones en ingles.
- Generacion de texto: al estar basado en un modelo instruct, conserva capacidades generales de generacion y dialogo, aunque su especialidad es la correccion gramatical.

## Casos de uso

- **Aplicacion movil de aprendizaje de aleman**: el modelo esta disenado para integrarse en una app iOS de tarjetas de memoria, donde corrige las respuestas de los usuarios y explica los errores. Su tamano reducido (1.4 GB) permite ejecutarlo localmente en dispositivos con poca memoria.
- **Tutor de gramatica para estudiantes de aleman**: un estudiante escribe una frase y el modelo responde con la correccion, la razon y una pregunta de refuerzo. Ideal para practicar gramatica de forma autonoma.
- **Asistente de escritura en aleman**: puede usarse como corrector integrado en editores de texto o entornos de desarrollo, marcando errores gramaticales y sugiriendo alternativas.
- **Practica conversacional con retroalimentacion**: el modelo puede mantener un dialogo sencillo en aleman, corrigiendo los errores del usuario y haciendo preguntas para fomentar la practica.
- **Generacion de ejercicios de gramatica**: se le puede pedir que genere ejemplos de frases con errores para que el alumno los corrija, o que explique reglas gramaticales concretas.
- **Herramienta de ensenanza en linea**: un profesor puede utilizarlo como asistente para revisar las respuestas de sus alumnos, reduciendo el trabajo manual de correccion.

## Benchmarks y rendimiento

El autor proporciona una evaluacion propia con una convencion de "app-guard" (una respuesta cuenta solo si el parser de la aplicacion la mostraria). Los resultados comparan la version v4, una version anterior r32 y el modelo stock (sin fine-tune):

| Suite | Items | v4 | r32 anterior | stock |
|---|---|---|---|---|
| Gramatica core (v0) | 60 | 46 (77%) | 37 (62%) | 28 (47%) |
| Extension (v1ext) | 61 | 39 (64%) | 35 (57%) | 30 (49%) |
| Holdout (v2) | 82 | 68 (83%) | 59 (72%) | 45 (55%) |
| Combinado | 203 | 153 (75%) | 131 (65%) | 103 (51%) |

La mejora frente a la version r32 es estadisticamente significativa (p = 0.002 en la prueba de McNemar). Ademas, el modelo tiene un 0% de falsas correcciones (nunca marca como incorrecta una frase correcta) y una tasa de fallos del 43% en frases erroneas (mejora respecto al 59% de la version anterior). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamano del repositorio: 1.4 GB (peso en 4-bit), por lo que cabe en dispositivos moviles y en GPUs de consumo.
- VRAM estimada: aproximadamente 1.4 GB para cargar el modelo completo en 4-bit; con memoria adicional para la entrada/salida, se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: funciona en cualquier GPU con soporte MLX (Apple Silicon) o en GPUs de escritorio con suficiente memoria (RTX 3060, RTX 4090, etc.) si se convierte a otro formato.
- Se puede ejecutar en dispositivos iOS (iPhone/iPad) gracias al formato MLX y al tamano reducido.
- Opciones de despliegue: MLX (Apple), llama.cpp (para CPU/GPU), Ollama (si se convierte), o vLLM (aunque para 2B no es habitual).
- Latencia: no disponible en la informacion, pero se espera que sea rapida en dispositivos Apple gracias a la cuantizacion 4-bit y el tamano reducido.

## Comparativa con modelos similares

No hay datos comparativos publicados frente a otros modelos de tutoria de aleman en la informacion disponible. Se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| kessenma/granite33-2b-german-tutor-v4-4bit | 396M (4-bit) | no disponible | Apache-2.0 | Correccion gramatical aleman |
| ibm-granite/granite-3.3-2b-instruct (base) | 2B | no disponible | Apache-2.0 | Instructivo general, sin especializacion |
| kessenma/gemma4-e2b-german-tutor-4bit | no disponible | no disponible | no disponible | Tutor de aleman (mencionado en la busqueda) |

El modelo v4 mejora claramente al modelo base en la tarea de correccion gramatical (75% frente a 51% en el conjunto combinado). No se dispone de mas detalles sobre el modelo Gemma4 de la misma autoria.

## Limitaciones y advertencias

- **Tasa de fallo en frases erroneas**: el modelo no detecta el 43% de las frases con errores; cuando no esta seguro, responde `OK`, lo que puede pasar por alto errores en un entorno de aprendizaje.
- **Tokenizacion menos eficiente**: el tokenizer BPE de 49k genera mas tokens por palabra que otros modelos, lo que puede ralentizar la generacion y aumentar el consumo de memoria en textos largos.
- **Sesgos**: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos generados por otros LLMs y validados con herramientas externas, puede heredar sesgos de esos datos.
- **Alucinacion**: al ser un modelo pequeno, puede generar explicaciones incorrectas o inventar reglas gramaticales cuando no esta seguro, aunque el contrato de salida limita la extension de la respuesta.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial sin restricciones, pero el autor no especifica si los datos de entrenamiento tienen restricciones adicionales.
- **Idiomas**: solo soporta aleman e ingles; no debe usarse para otros idiomas.
- **Produccion**: la convencion de evaluacion "app-guard" es especifica del autor; en otros contextos el rendimiento puede variar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kessenma/granite33-2b-german-tutor-v4-4bit)
- [Modelo base de IBM](https://huggingface.co/ibm-granite/granite-3.3-2b-instruct) (no se proporciona URL directa en la informacion, pero el ID es `ibm-granite/granite-3.3-2b-instruct`)
- [Modelo similar: kessenma/gemma4-e2b-german-tutor-4bit](https://huggingface.co/kessenma/gemma4-e2b-german-tutor-4bit) (encontrado en la busqueda web)
