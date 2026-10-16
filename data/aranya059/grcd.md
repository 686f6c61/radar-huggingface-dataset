# aranya059/GRCD

## Resumen

GRCD (identificador `aranya059/GRCD`) es un adaptador PEFT publicado en HuggingFace por el usuario aranya059, orientado a la generacion de informes radiologicos de torax (chest X-ray) con anclaje visual (visual grounding). Se construye sobre el modelo base `lmsys/vicuna-7b-v1.5`, un transformer decoder-only de 7.000 millones de parametros derivado de LLaMA-2, y esta etiquetado con las palabras clave medical, radiology, report-generation, visual-grounding y mimic-cxr. El repositorio ocupa 0,8 GB, un tamano coherente con la distribucion de pesos de adaptador (LoRA) en lugar del modelo completo.

El problema que aborda es el de la redaccion automatizada de hallazgos en radiografias de torax, con la particularidad de que el modelo incorpora anclaje visual: la generacion de texto se asocia a regiones concretas de la imagen. Este tipo de anclaje es relevante en el ambito clinico porque permite auditar que parte de la radiografia justifica cada afirmacion del informe, algo que los modelos puramente generativos no ofrecen.

La relevancia actual del modelo esta condicionada por su regimen de acceso: el repositorio esta restringido (gated) y se distribuye bajo una licencia denominada `grcd-credentialed-research-use`, que exige aceptar condiciones en HuggingFace y limita el uso al ambito de investigacion acreditada. No hay descargas ni likes publicos, y no se ha publicado informacion sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks en los datos disponibles. La etiqueta del repositorio referencia el identificador arXiv 2607.02719, aunque su contenido no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only; modelo base `lmsys/vicuna-7b-v1.5` (familia LLaMA-2) |
| Parametros totales | 7.000 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens heredados del modelo base Vicuna-7B v1.5; no se documenta extension en el adaptador |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF, AWQ, GPTQ ni indicaciones de cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | `grcd-credentialed-research-use` (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | Adaptadores PEFT (libreria declarada: `peft`); formato de fichero concreto no especificado |
| Tamano del repositorio | 0,8 GB |
| Acceso | Restringido (gated) en HuggingFace |
| Dominio | Radiologia de torax (chest X-ray), generacion de informes con anclaje visual |
| Dataset de referencia | MIMIC-CXR (segun etiquetas del repositorio) |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un adaptador PEFT sobre Vicuna-7B v1.5, lo que implica tecnicamente un ajuste parametrizado eficiente (LoRA u otra variante PEFT) aplicado sobre los pesos congelados del modelo base. Vicuna-7B v1.5 es un transformer decoder-only de 7.000 millones de parametros, resultado de un ajuste supervisado de LLaMA-2 sobre conversaciones, con una ventana de contexto de 4.096 tokens. Al tratarse de un adaptador, el repositorio no contiene los pesos completos: para ejecutarlo es necesario descargar el modelo base `lmsys/vicuna-7b-v1.5` por separado y cargar despues el adaptador.

El repositorio esta etiquetado como sistema multimodal (medical, radiology, chest-x-ray, report-generation, visual-grounding) y vinculado al corpus MIMIC-CXR, de modo que el sistema completo requiere, ademas del adaptador, un codificador visual y un mecanismo de proyeccion entre imagen y espacio de tokens de texto. No se proporciona en la informacion disponible ni la identidad del codificador visual, ni la arquitectura del conector, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se detallan innovaciones de decodificacion o atencion. Todos estos apartados quedan como no disponibles.

## Capacidades

- Generacion de informes radiologicos de torax a partir de radiografias (chest X-ray), segun las etiquetas del repositorio.
- Anclaje visual (visual grounding): asociacion de fragmentos del informe con regiones de la imagen, lo que permite trazabilidad entre hallazgo y evidencia visual.
- Procesamiento de dominio medico especializado, coherente con el etiquetado medical y radiology.
- Capacidad conversacional heredada del modelo base Vicuna-7B v1.5, si bien no se documenta si se preserva tras el ajuste ni con que calidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking, vision adicional o audio: no disponible; unicamente se confirma el caracter visual del sistema mediante las etiquetas, sin especificar el codificador de imagen.

## Casos de uso

- Redaccion asistida de informes de radiografia de torax en investigacion clinica: el modelo genera un borrador de informe a partir de la imagen, que el radiologo revisa y corrige; el anclaje visual permite verificar en que region se basa cada afirmacion antes de validarla.
- Auditoria de modelos de reporting: al producir simultaneamente texto y localizaciones, sirve como sistema de referencia frente al que comparar modelos generativos sin anclaje y medir si sus afirmaciones son rastreables a la imagen.
- Generacion de conjuntos anotados en investigacion: uso del anclaje para producir pares (region, frase) sobre MIMIC-CXR que alimenten estudios posteriores de interpretabilidad o de deteccion de hallazgos.
- Sistemas de formacion de residentes: integracion en entornos simulados donde el residente compara su informe con el generado y con las regiones destacadas, siempre en contexto no asistencial y con acceso acreditado.
- Triaje experimental de estudios: clasificacion preliminar de radiografias y generacion de resumenes breves para priorizar lecturas en flujos de investigacion retrospectiva sobre datos con acuerdo de uso.
- Evaluacion de sesgo y robustez en IA medica: analisis de como varia el informe generado segun caracteristicas de la imagen, empleando el anclaje para localizar donde se concentra el error.
- Prototipado de interfaces de lectura asistida: desarrollo de visores que resalten regiones de la radiografia vinculadas a cada linea del informe, con el adaptador como componente de generacion.
- Docencia y reproducibilidad metodologica: replicar el pipeline PEFT sobre Vicuna-7B en trabajos academicos que comparen estrategias de ajuste eficiente en dominios clinicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (por ejemplo, METEOR, BLEU, CIDEr, RadGraph-F1 o CheXbert-F1, habituales en generacion de informes de torax) ni comparaciones con otros sistemas, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo. No se aportan cifras que no esten respaldadas por la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base Vicuna-7B v1.5: aproximadamente 14 GB de pesos en FP16, mas cache KV y activaciones; en la practica se recomiendan 16-18 GB de VRAM para FP16 con contexto completo de 4.096 tokens.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM. Cuantizacion de 4 bits: aproximadamente 5-6 GB. Estas cifras son estimaciones sobre el modelo base; el repositorio no publica pesos cuantizados.
- El adaptador PEFT anade un coste marginal de memoria (el repositorio completo ocupa 0,8 GB), pero requiere cargar antes los pesos del modelo base.
- Componente visual: al tratarse de un sistema multimodal, hay que sumar la VRAM del codificador de imagen y del proyector, cuyo tamano no se especifica en la informacion disponible.
- GPU recomendadas: A100 40 GB o H100 para despliegue en FP16 con margen; A100 80 GB o H100 80 GB si se sirven varias peticiones concurrentes con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para FP16 en una sola peticion o para cuantizacion de 8/4 bits.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en FP16, y en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080) recurriendo a cuantizacion, siempre sumando la VRAM del codificador visual.
- Opciones de despliegue: no se especifican en el repositorio. Al tratarse de un adaptador PEFT sobre Vicuna (familia LLaMA-2), es compatible con el ecosistema HuggingFace Transformers y `peft`; vLLM, TGI u Ollama requeririan fusionar el adaptador con el modelo base o bien un pipeline multimodal propio. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados de fabrica con la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo GRCD, por lo que la comparacion se limita a caracteristicas objetivas de configuracion. No se identifican en la informacion proporcionada otros modelos comparables con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Acceso | Rendimiento |
|---|---|---|---|---|---|
| GRCD (aranya059/GRCD) | Adaptador sobre 7B (modelo base Vicuna-7B v1.5) | 4.096 tokens (heredado del base) | `grcd-credentialed-research-use` | Restringido (gated) | No disponible |
| lmsys/vicuna-7b-v1.5 (modelo base) | 7.000 millones | 4.096 tokens | Licencia LLaMA-2 con condiciones de uso | Abierto en HuggingFace | No comparable: no esta especializado en radiologia ni en anclaje visual |
| Otros sistemas de generacion de informes de torax sobre MIMIC-CXR | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia `grcd-credentialed-research-use`: el uso comercial no esta permitido segun la denominacion de la licencia, y el acceso exige acreditar condiciones y aceptar los terminos en HuggingFace. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso.
- Dependencia de MIMIC-CXR: el corpus esta sujeto a un acuerdo de uso de datos con acceso acreditado. Cualquier despliegue derivado debe respetar esas restricciones, que se suman a las del propio modelo.
- No es un dispositivo medico ni esta validado clinicamente. No debe emplearse para diagnostico, triaje real ni decision clinica sin validacion prospectiva y aprobacion regulatoria.
- Riesgo de alucinacion: en generacion de informes radiologicos, un modelo de lenguaje puede describir hallazgos ausentes o silenciar hallazgos presentes. El anclaje visual mitiga parcialmente el problema, pero no lo elimina ni garantiza correccion clinica.
- Sesgos conocidos: no documentados en la informacion disponible. MIMIC-CXR procede de una unica institucion, lo que introduce riesgos de generalizacion limitada a otras poblaciones, equipos de adquisicion y protocolos, pero no se aportan analisis especificos.
- Limitaciones de contexto: la ventana de 4.096 tokens del modelo base puede resultar insuficiente para informes extensos, historiales de paciente o contextos multi-imagen.
- Idiomas: no se declaran idiomas soportados; no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles, que es el idioma predominante en MIMIC-CXR.
- Ambiguedad de la arquitectura: al publicarse unicamente el adaptador, sin codificador visual ni instrucciones de integracion documentadas, la reproducibilidad del sistema completo no esta garantizada.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni resultados publicados, lo que impide evaluar su calidad de forma independiente.
- Ausencia de cuantizaciones oficiales: no se ofrecen pesos GGUF ni formatos optimizados, lo que complica el despliegue en entornos con VRAM limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aranya059/GRCD
- Modelo base: https://huggingface.co/lmsys/vicuna-7b-v1.5
- Referencia arXiv citada en las etiquetas del repositorio: arXiv:2607.02719 (contenido no verificado en la informacion disponible; podria corresponder a https://arxiv.org/abs/2607.02719)
- Otras busquedas web realizadas: no han devuelto ningun resultado relacionado con el modelo. No hay papers, blogs, repositorios ni demos adicionales disponibles.
