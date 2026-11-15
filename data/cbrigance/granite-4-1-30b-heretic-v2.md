# cbrigance/granite-4.1-30b-heretic-v2

## Resumen

Granite-4.1-30b-heretic-v2 es una variante del modelo base IBM Granite 4.1 de 30 mil millones de parametros, publicada por el usuario cbrigance en Hugging Face. Se trata de un finetune de tipo "abliterated" (tambien etiquetado como "heretic"), una tecnica que modifica selectivamente las direcciones de activacion responsables de rechazos de contenido para reducir las negativas del modelo ante peticiones sensibles, sin reentrenar los pesos por completo. El modelo conserva la arquitectura y el grueso de las capacidades del Granite 4.1 original, pero altera su comportamiento de alineacion y seguridad.

El modelo base Granite 4.1 pertenece a la familia Granite de IBM, orientada a cargas de trabajo empresariales de generacion de texto, razonamiento, codigo y tool calling. Con aproximadamente 28.870 millones de parametros en safetensors, se situa en la gama de modelos densos de gran tamano, pensados para despliegue en GPU profesionales o configuraciones multi-GPU. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha radica en que no se trata de un modelo oficial de IBM, sino de una modificacion comunitaria con implicaciones claras de seguridad y cumplimiento: el repositorio esta marcado como "not-for-all-audiences" y el acceso es restringido (gated), requiriendo aceptar condiciones en Hugging Face. Cualquier evaluacion para produccion debe tener en cuenta que la abliteracion compromete las salvaguardas de alineacion del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite de IBM; detalles finos de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 28.865.728.512 (~28,87 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales del repositorio: tamano del repo 57,7 GB, pipeline text-generation, acceso gated, creado el 14 de noviembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo deriva del Granite 4.1 de IBM, un transformer denso de aproximadamente 28,87 mil millones de parametros. La modificacion aplicada es de tipo abliteration ("heretic"): en lugar de un finetune convencional con datos, se identifican direcciones de activacion asociadas a comportamientos de rechazo y se proyectan fuera o se atenuan en los pesos, de modo que el modelo deja de activar esas trayectorias internas. Esta tecnica suele requerir solo inferencias de calibracion para localizar las direcciones y un ajuste de pesos, sin un corpus de entrenamiento adicional a gran escala.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento del modelo base, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas (por ejemplo decodificacion especulativa o atencion lineal). La referencia arxiv:2406.11717 presente en los tags apunta a un paper vinculado al modelo base, pero su contenido no se detalla aqui. Cualquier afirmacion sobre el proceso exacto de abliteracion empleado por cbrigance (metodo, capas afectadas, hiperparametros) debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Granite 4.1 base.
- Razonamiento y resolucion de problemas de tipo analitico, en la medida en que el modelo base los soporta.
- Generacion de codigo y tareas de programacion, capacidades tipicas de la familia Granite.
- Matemáticas y calculo paso a paso, sujeto a las capacidades del modelo base.
- Tool calling / function calling: el modelo base Granite esta disenado para integracion con herramientas; la variante heretic conserva la estructura de plantillas y formato, aunque no se verifica en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: probable por herencia del base, no confirmado explicitamente.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- Reduccion de rechazos ante peticiones que el modelo original declinaria (efecto directo de la abliteracion).
- No se declaran capacidades de vision, audio ni modo "thinking" explicito en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente como la abliteration afecta la tasa de rechazos, la calidad de respuesta y la coherencia en comparacion con el Granite 4.1 original, usando el mismo tokenizador y plantillas.
- Evaluacion de robustez de salvaguardas: util para construir suites de red-teaming que midan que categorias de contenido dejan de ser filtradas tras la modificacion, con fines defensivos y de auditoria.
- Generacion de codigo en entornos controlados: al conservar las capacidades del base, puede emplearse en pipelines internos de autocompletado o generacion de tests, siempre que se asuma la ausencia de filtros de seguridad.
- Redaccion tecnica y documentacion: generacion de borradores, resumenes y explicaciones en ingles sobre temas tecnicos, aprovechando el tamano del modelo para mantener coherencia en textos largos.
- Experimentos de destilacion y evaluacion comparativa: servir como checkpoint de referencia "sin alineacion" frente al base para medir degradacion o ganancia en benchmarks de razonamiento y codigo.
- Prototipado de asistentes conversacionales internos: despliegue en entornos cerrados donde el equipo asume la responsabilidad del contenido generado y aplica sus propios filtros externos.
- Analisis de sesgos y comportamientos emergentes: comparar respuestas del modelo abliterated con el original para identificar que direcciones de activacion estan correlacionadas con determinados estilos o sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 58 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se requieren 70-80 GB o mas segun longitud de contexto.
- Cuantizacion a 8 bits: entorno a 29-32 GB de VRAM para pesos.
- Cuantizacion a 4 bits: entorno a 15-18 GB de VRAM para pesos, con margen adicional para contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 24 GB o 2x L40S 48 GB) para precision completa. Para 4 bits, una RTX 4090 24 GB o RTX 6000 Ada pueden resultar suficientes, sujeto a validacion empirica.
- Cabe en GPU consumer: si, con cuantizacion agresiva (4 bits) en GPUs de 24 GB, aunque el rendimiento real no esta verificado en la informacion disponible.
- Opciones de despliegue: transformers (formato publicado), vLLM y TGI para serving de safetensors; llama.cpp/Ollama requeririan conversion a GGUF, no distribuida en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/granite-4.1-30b-heretic-v2 | ~28,87 B | no disponible | apache-2.0 | gated | Variante abliterated comunitaria del Granite 4.1 |
| ibm-granite/granite-4.1-30b | ~28,87 B | no disponible | apache-2.0 | oficial IBM | Modelo base alineado, sin modificacion de rechazos |
| Alternativas de tamano similar (por ejemplo familias Llama 3.x 30B o Qwen de ~30B) | ~30 B | variable | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre esta variante y el base no puede establecerse sin benchmarks publicados; la diferencia esperada se concentra en la tasa de rechazos y potencialmente en la calidad de respuesta en dominios sensibles.

## Limitaciones y advertencias

- La abliteration elimina o debilita salvaguardas de alineacion: el modelo puede generar contenido que el Granite 4.1 original rechazaria, con implicaciones legales y reputacionales.
- Repositorio marcado "not-for-all-audiences" y acceso gated: requiere aceptar condiciones, lo que limita su uso abierto y anonimo.
- Modelo comunitario no oficial: IBM no respalda esta variante; la licencia Apache 2.0 se hereda del base, pero la responsabilidad del finetune recae en el autor.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas para esta variante.
- Sesgos: la abliteration puede alterar distribuciones de estilo y amplificar sesgos presentes en el base; no se documentan analisis de sesgo.
- Sin benchmarks ni metricas de calidad publicadas: no es posible afirmar equivalencia de rendimiento con el base en tareas de razonamiento o codigo.
- Uso comercial: tecnicamente permitido por Apache 2.0, pero exige auditoria propia de seguridad y cumplimiento antes de produccion.
- Contexto maximo no documentado: planificar despliegues con margen conservador de longitud de secuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/granite-4.1-30b-heretic-v2
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Paper referenciado en tags: https://arxiv.org/abs/2406.11717
