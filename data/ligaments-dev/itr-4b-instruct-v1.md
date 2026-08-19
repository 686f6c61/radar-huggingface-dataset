# ligaments-dev/ITR-4B-INSTRUCT-V1

## Resumen

ITR-4B-INSTRUCT-V1 es un modelo de lenguaje afinado por la organización ligaments-dev (ligamentsAICompany) a partir de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.66 mil millones de parámetros. El modelo está diseñado para integrarse en una plataforma empresarial de clasificación de declaraciones de impuestos sobre la renta (ITR) de la India, donde actúa como capa asistiva para tareas de normalización, clarificación y explicación, mientras que el motor de reglas determinista sigue siendo el núcleo de decisión.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está orientado exclusivamente al idioma inglés. Su relevancia radica en que combina un modelo base moderno (Qwen3.5) con un ajuste fino especializado en un dominio concreto (fiscalidad india), lo que lo convierte en una opción interesante para desarrolladores que necesitan un asistente conversacional con conocimiento específico de formularios ITR, aunque la documentación pública es muy escasa.

La model card oficial apenas aporta detalles: solo indica que fue entrenado con Unsloth y la librería TRL de Hugging Face, sin especificar el dataset, el método de entrenamiento ni los benchmarks. Por tanto, gran parte de las especificaciones técnicas y de rendimiento deben considerarse no disponibles o inferidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se hereda del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors en FP16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3.5-4B, un transformer decoder-only con atención estándar y arquitectura similar a la familia Qwen3. No se dispone de detalles sobre la arquitectura interna (número de capas, cabezas de atención, dimensiones ocultas) más allá de los parámetros totales. El pipeline declarado en Hugging Face es `image-text-to-text`, aunque no se han documentado capacidades multimodales reales; es probable que sea una etiqueta genérica o un error de configuración.

En cuanto al entrenamiento, la model card indica que se utilizó Unsloth para acelerar el proceso y la librería TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) típico de modelos instruct. No se menciona el uso de RLHF, DPO ni otros métodos de alineación. El dataset de entrenamiento, el número de tokens y la composición de los datos no están publicados. Tampoco se especifica si se realizó algún tipo de evaluación durante el desarrollo.

## Capacidades

- Generacion de texto y conversacion multi-turno, al ser un modelo instruct basado en Qwen3.5.
- Especializacion en el dominio fiscal indio: segun el repositorio GitHub de la organizacion, el modelo se usa para normalizar entradas, clarificar consultas y explicar reglas de clasificacion de formularios ITR.
- Soporte de instrucciones en lenguaje natural para tareas de asistencia, aunque no se han documentado capacidades de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas: solo se declara ingles.
- No se ha confirmado soporte de vision, audio ni otros modos, a pesar de la etiqueta `image-text-to-text`.

## Casos de uso

- Asistencia en la clasificacion de formularios ITR: el modelo puede recibir descripciones de ingresos o situaciones fiscales y ayudar a determinar el formulario correcto, complementando el motor de reglas determinista de la plataforma ITR.
- Normalizacion de datos de entrada: convierte texto libre o desestructurado en campos estandarizados (por ejemplo, tipos de ingresos, deducciones) antes de que el motor de reglas los procese.
- Explicacion de decisiones fiscales: genera respuestas en lenguaje natural que justifican por que se selecciona un determinado formulario, mejorando la auditabilidad y la confianza del usuario.
- Atencion al cliente en asuntos fiscales: responde preguntas frecuentes sobre declaraciones de impuestos indias, plazos y requisitos, reduciendo la carga del soporte humano.
- Generacion de documentacion: redacta resumenes o informes de clasificacion para que los contribuyentes o asesores revisen el resultado.
- Formacion y simulacion: actua como tutor conversacional para empleados de despachos que necesitan practicar la identificacion de casos ITR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se ofrecen comparativas con el modelo base o con alternativas del mismo tamano. Por tanto, no es posible cuantificar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 4,66 B de parametros, en FP16 ocupa aproximadamente 9,3 GB (coincide con el tamano del repo). Con cuantizacion de 8 bits se reduce a ~4,7 GB, y en 4 bits a ~2,3 GB, aunque no se proporcionan archivos cuantizados en el repo.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (p. ej., RTX 3070, RTX 4060, RTX 2070) puede ejecutar el modelo en FP16 con optimizaciones de memoria. Para cuantizacion 4 bits, bastaria con 4 GB (p. ej., RTX 3050).
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama. El tag `endpoints_compatible` sugiere que puede desplegarse en servicios gestionados.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como A100, se espera una latencia de decodificacion de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para ITR-4B-INSTRUCT-V1, por lo que una comparativa cuantitativa no es posible. A continuacion se presenta una comparativa cualitativa basada en caracteristicas tecnicas con modelos del mismo rango de tamano:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| ITR-4B-INSTRUCT-V1 | 4,66 B | No disponible | Apache 2.0 | Fiscalidad india (ITR) |
| Qwen3-4B-Instruct-2507 | ~4 B | 128K (tipico de Qwen3) | Apache 2.0 | Generalista, instrucciones |
| Llama-3.2-3B-Instruct | 3,21 B | 128K | Llama 3.2 Community | Generalista, instrucciones |
| Phi-3.5-mini-instruct | 3,82 B | 128K | MIT | Generalista, razonamiento |

La principal diferencia de ITR-4B-INSTRUCT-V1 es su enfoque en un dominio vertical, mientras que las alternativas son modelos generalistas. Sin embargo, al carecer de benchmarks, no se puede determinar si el ajuste fino mejora o degrada el rendimiento en tareas generales.

## Limitaciones y advertencias

- Documentacion muy escasa: no se detalla el dataset de entrenamiento, el metodo de alineacion ni los criterios de evaluacion, lo que dificulta valorar su fiabilidad.
- Riesgo de alucinacion: al ser un modelo instruct sin evaluacion publica, puede generar respuestas incorrectas o inventar datos fiscales, especialmente en casos complejos.
- Sesgos desconocidos: no se han realizado auditorias de sesgo; el entrenamiento en un dominio especifico (fiscalidad india) puede introducir sesgos culturales o normativos.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Dominio limitado: aunque se especializa en ITR, no se garantiza su precision fuera de ese ambito; su uso generalista puede ser inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Pipeline multimodal no verificado: la etiqueta `image-text-to-text` sugiere capacidades de vision, pero no hay evidencia de que el modelo las tenga realmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ligaments-dev/ITR-4B-INSTRUCT-V1
- Repositorio GitHub de la organizacion: https://github.com/ligamentsAICompany/ITR
- Modelo base Qwen/Qwen3.5-4B: no se ha encontrado un enlace directo en la busqueda, pero el identificador es `Qwen/Qwen3.5-4B`.
- Referencia a Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
