# boods/FrMedQA-CrossLingual-v2-NoPPL-s43-bf16-MCQA

## Resumen

El modelo `boods/FrMedQA-CrossLingual-v2-NoPPL-s43-bf16-MCQA` es un checkpoint publicado en HuggingFace por el usuario `boods`, etiquetado con las librerías `transformers` y `unsloth` y almacenado en formato `safetensors`. Por el propio identificador del repositorio puede inferirse que se trata de un ajuste fino orientado a pregunta-respuesta médica en francés, en modalidad de elección múltiple (`MCQA`), con evaluación cross-lingual, versión 2, semilla 43 y pesos en `bf16`. Sin embargo, esta interpretación procede únicamente del nombre del repositorio y no está confirmada por ninguna documentación del autor.

La model card publicada es la plantilla automática de HuggingFace sin cumplimentar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, modelo base, datos de entrenamiento, hiperparámetros y resultados de evaluación) aparecen como `[More Information Needed]`. No hay, por tanto, información verificable sobre arquitectura, número de parámetros, longitud de contexto ni procedimiento de entrenamiento.

El modelo registra cero descargas y cero "likes" en el momento de la consulta, y la fecha de creación indicada en el Hub es el 10 de octubre de 2026. Su relevancia actual es muy limitada: se trata de un artefacto de investigación sin documentación, sin licencia declarada y sin datos de rendimiento publicados, por lo que no es recomendable para uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la declara; no se puede confirmar si es transformer decoder-only, encoder-decoder u otra) |
| Parametros totales | no disponible (el repositorio ocupa 0,5 GB y los pesos están en bf16, lo que sugeriría del orden de 250 millones de parámetros, pero es una estimación no confirmada) |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma la existencia de pesos en bf16; no se han publicado versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere francés e inglés por el término "CrossLingual", sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | safetensors (confirmado por las etiquetas del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card únicamente indica `library_name: transformers` y la etiqueta `unsloth`, lo que sugiere que el ajuste fino se realizó con la librería Unsloth, habitualmente empleada para fine-tuning eficiente en memoria de modelos transformer mediante técnicas como LoRA o QLoRA. No hay confirmación del modelo base sobre el que se partió, ni del tipo de adaptadores, ni de si se fusionaron con los pesos base.

Tampoco hay datos sobre el corpus de entrenamiento: no se especifica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. El sufijo `NoPPL` del identificador podría indicar que la selección del mejor checkpoint no se hizo por perplejidad de validación, y `MCQA` apunta a un formato de respuesta de opción múltiple, pero ninguna de estas dos interpretaciones está respaldada por documentación del autor. La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, incluido por defecto en la plantilla de HuggingFace, y no guarda relación con la arquitectura ni con el entrenamiento del modelo.

## Capacidades

No se ha publicado documentación que permita confirmar las capacidades del modelo. A partir exclusivamente del identificador del repositorio, y siempre como hipótesis no verificada, cabría esperar:

- Respuesta a preguntas de opción múltiple en el dominio médico.
- Procesamiento de texto en más de un idioma (posiblemente francés e inglés), dado el término `CrossLingual`.
- Generación de texto condicionada a una pregunta con opciones de respuesta.

No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades de visión, audio, ni modos de razonamiento explícitos. Cualquier afirmación sobre estas capacidades sería especulativa.

## Casos de uso

No es posible proponer casos de uso concretos y realistas con garantías, dado que se desconoce el modelo base, el tamaño real, el contexto soportado, el dominio exacto de entrenamiento y la licencia. Como referencia orientativa, un modelo de tipo MCQA médica cross-lingual podría emplearse en:

- Evaluación comparativa de sistemas de QA médica: uso del checkpoint como uno más en un banco de pruebas de modelos sobre conjuntos de validación de pregunta-respuesta clínica, siempre que se documente y se reproduzca su protocolo de evaluación.
- Investigación en ajuste fino eficiente: análisis de recetas de fine-tuning con Unsloth sobre tareas de dominio especializado, comparando semillas y variantes de checkpoint.
- Experimentos de transferencia cross-lingual en dominio biomédico: estudio de hasta qué punto un ajuste en un idioma se traslada a preguntas equivalentes en otro idioma.
- Filtrado o triaje de material de formación médica: descarte automático de opciones claramente incorrectas en cuestionarios, con revisión humana posterior.
- Generación de conjuntos de datos sintéticos de opción múltiple: uso del modelo como generador de distractores en la construcción de bancos de preguntas, con validación experta.
- Reproducción de experimentos académicos: verificación de resultados reportados en publicaciones que citen este checkpoint concreto.

En cualquiera de estos escenarios sería imprescindible una validación propia y una revisión por profesionales sanitarios antes de cualquier uso con impacto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No hay datos oficiales de hardware, latencia ni throughput. Las siguientes estimaciones son orientativas y dependen de un tamaño de modelo no confirmado (el repositorio de 0,5 GB en bf16 sugiere un modelo pequeño, del orden de cientos de millones de parámetros):

- VRAM para inferencia en bf16: si el modelo ronda los 250 millones de parámetros, la inferencia ocuparía aproximadamente 0,5-1 GB de VRAM, más el overhead de la caché KV y del framework.
- VRAM en cuantización de 8 bits: del orden de 0,3-0,5 GB para el mismo escenario, si se generan pesos cuantizados (no publicados por el autor).
- VRAM en cuantización de 4 bits: del orden de 0,2-0,3 GB, de nuevo supeditado a la conversión a GGUF o a un formato equivalente, que no está disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería ser suficiente en el escenario estimado (por ejemplo, GTX 1650, RTX 3050, RTX 4060). GPU de centro de datos como A100, H100 o L40S solo tendrían sentido para lotes grandes o para reentrenamiento.
- Despliegue: al ser un repositorio de `transformers` con `safetensors`, el uso directo sería mediante la propia librería. No se han publicado artefactos para vLLM, llama.cpp, Ollama ni TGI, y la conversión a GGUF requeriría conocer previamente la arquitectura del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa rigurosa porque se desconoce el modelo base, el número de parámetros, la licencia y los resultados de evaluación de este checkpoint. Para una comparación con alternativas de QA médica (por ejemplo, familias como BioMistral, Meditron o DrBERT) sería necesario primero identificar la arquitectura y el tamaño real del modelo, así como disponer de resultados sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin cumplimentar, lo que impide conocer el alcance previsto, el dominio exacto de entrenamiento y las limitaciones declaradas por el autor.
- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial ni para redistribución. En la Unión Europea, la ausencia de licencia implica que no se ceden derechos de explotación más allá de los permitidos por la ley.
- Riesgo de alucinación: cualquier modelo generativo aplicado a dominio médico puede producir afirmaciones erróneas con apariencia plausible. En un contexto clínico, esto es un riesgo directo para la seguridad del paciente.
- Sesgos desconocidos: no hay información sobre la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico, lingüístico ni geográfico.
- Cobertura idiomática incierta: el término "CrossLingual" del nombre no garantiza un rendimiento equilibrado entre idiomas, y no se especifica cuáles están soportados.
- Formato restringido a MCQA probable: el sufijo `MCQA` sugiere que el modelo puede haber sido ajustado específicamente para elegir entre opciones predefinidas, lo que degradaría su comportamiento en generación abierta.
- Fecha de creación anómala: el Hub indica el 10 de octubre de 2026 como fecha de creación, posterior a la fecha de consulta, lo que apunta a un artefacto de metadatos que conviene verificar.
- Cero adopción: sin descargas ni interacciones registradas, no existe comunidad que haya validado el comportamiento del modelo.
- No apto para uso clínico: bajo ninguna circunstancia debería emplearse como herramienta de diagnóstico, triaje o recomendación terapéutica sin validación clínica formal y sin supervisión de personal sanitario cualificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-s43-bf16-MCQA
- Articulo referenciado en la etiqueta del repositorio (Lacoste et al., 2019, sobre emisiones de carbono, incluido por defecto en la plantilla): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- No se han encontrado en la informacion proporcionada otros enlaces a papers, repositorios, demos o documentacion adicional del autor.
