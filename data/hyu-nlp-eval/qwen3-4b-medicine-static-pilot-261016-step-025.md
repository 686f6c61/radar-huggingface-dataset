# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-025

## Resumen

Este artefacto es un checkpoint de ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo el identificador `qwen3-4b-medicine-static-pilot-261016-step-025`. Se trata de un modelo de generación de texto de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) en arquitectura transformer densa, derivada de la familia Qwen3, distribuido en formato safetensors BF16 y con licencia Apache 2.0. El nombre indica que corresponde al paso 25 de una ejecución de entrenamiento denominada `261016_medicine_static_pilot`, con semilla 11, orientada al dominio médico.

No es un modelo de producción ni un lanzamiento comercial: es un checkpoint intermedio de un experimento de ajuste fino, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin métricas de evaluación publicadas. El repositorio ocupa 25,7 GB e incluye tanto la exportación BF16 para Transformers como el checkpoint nativo de veRL/FSDP en el directorio `original_checkpoint/`, lo que apunta a un artefacto de investigación más que a un modelo listo para desplegar.

Su relevancia ahora es acotada: sirve como material de partida para reproducir o continuar experimentos de ajuste fino en el ámbito biomédico sobre una base 4B eficiente, y como ejemplo de publicación de checkpoints intermedios con verificación de hashes SHA256. Para cualquier uso clínico o comercial serio, carece de la documentación, las evaluaciones y el soporte necesarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (heredada del modelo base; la model card no detalla variaciones) |
| Parametros totales | 4.022.468.096 (≈4,02 B), dato verificado en los archivos safetensors |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No especificada en la informacion proporcionada. El modelo base Qwen/Qwen3-4B-Instruct-2507 declara contexto nativo largo (dato del modelo base, no verificado en este repositorio) |
| Tipos de cuantizacion | BF16 (export publicado). No se publican variantes GGUF, AWQ ni GPTQ en este repositorio |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raiz del repositorio; checkpoint nativo veRL/FSDP en `original_checkpoint/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 25,7 GB |
| Fecha de creacion | 2026-10-16 |
| Fecha de ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por herencia del modelo base declarado (`Qwen/Qwen3-4B-Instruct-2507`, incluido en los tags como `base_model:finetune`), se trata de un transformer denso de la familia Qwen3 con aproximadamente 4,02 mil millones de parámetros, exportado en BF16 para su uso con la librería Transformers. No hay en la información proporcionada datos sobre número de capas, dimensión oculta, cabezas de atención, vocabulario ni mecanismos de atención concretos, por lo que no se afirman aquí.

En cuanto al entrenamiento, la model card únicamente documenta la ejecución `261016_medicine_static_pilot`, el paso 25 del checkpoint y la semilla 11. El uso de veRL (framework de aprendizaje por refuerzo para modelos de lenguaje) y FSDP se deduce de la presencia de un checkpoint nativo en `original_checkpoint/`, lo que sugiere una fase de optimización por refuerzo o de ajuste supervisado a gran escala con sharding de parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset médico, ni si hubo etapas de SFT, RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia: es un ajuste de dominio sobre una base ya instruida.

Un detalle operativo relevante: el autor indica que el checkpoint local se elimina solo después de verificar tamaños remotos y hashes SHA256, lo que confirma que la integridad de la publicación se comprobó, pero no aporta información sobre calidad del modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruido y del pipeline declarado (`text-generation`, tag `conversational`).
- Respuesta a instrucciones y diálogo multi-turno, presumiblemente orientado a contenido del dominio médico por el nombre de la ejecución de entrenamiento.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre modo de razonamiento explícito (thinking mode), visión, audio u otras modalidades.
- Cobertura multilingüe: no disponible.
- Cualquier capacidad específica de dominio médico (preguntas clínicas, terminología, codificación) es una hipótesis derivada del nombre del experimento, no una capacidad verificada.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el repositorio incluye el checkpoint nativo veRL/FSDP, lo que permite reanudar o auditar el entrenamiento en el mismo framework y paso, útil para grupos de investigación que quieran replicar la ejecución `261016_medicine_static_pilot`.
- Investigación en evaluación de modelos médicos: al ser un checkpoint intermedio (paso 25), sirve para estudiar la evolución de métricas a lo largo del entrenamiento y comparar contra el modelo base sin ajustar.
- Generación de resúmenes de documentación biomédica en un entorno de investigación, siempre con revisión humana, aprovechando la base instruida de 4B parámetros y su despliegue ligero.
- Extracción de entidades y terminología clínica en pipelines de preprocesado de texto médico, como componente de un sistema mayor con validación posterior.
- Punto de partida para ajuste adicional (continued fine-tuning) sobre datos propios, dado que la licencia Apache 2.0 permite modificar y redistribuir el modelo derivado.
- Docencia y formación técnica: ilustrar cómo se publica un checkpoint de RL con verificación de hashes y estructura dual (export Transformers más checkpoint nativo).
- Pruebas de integración de infraestructura: validar despliegues con TGI, vLLM o Transformers usando un modelo de 4B con licencia permisiva y pesos conocidos.

En ningún caso debe emplearse para diagnóstico, triaje clínico, decisión terapéutica ni comunicación directa con pacientes sin supervisión de un profesional sanitario y sin validación regulatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,0 GB (4,02 B × 2 bytes). Es la única precisión publicada en el repositorio.
- Pesos en INT8: estimación de 4,0 a 4,5 GB, previa cuantización por parte del usuario.
- Pesos en INT4: estimación de 2,2 a 3,0 GB en formatos GGUF Q4_K_M, AWQ o GPTQ, también previa conversión, ya que no se publican en el repositorio.
- Memoria para caché KV: depende de la configuración de atención del modelo base, no documentada aquí. Como estimación orientativa para una arquitectura Qwen3-4B con GQA, cada 32.000 tokens de contexto pueden suponer del orden de 4 a 5 GB adicionales en BF16. Es una estimación, no un dato verificado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio concurrente con contextos largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en tarjetas de 12 GB o más si se reduce la precisión o el contexto (RTX 3060 12 GB, RTX 4070, RTX 4080). En 8 GB solo sería viable con cuantización INT4 y contexto limitado.
- Nota sobre el repositorio: los 25,7 GB de tamaño incluyen la exportación BF16 y el checkpoint nativo veRL/FSDP, por lo que el espacio en disco necesario supera ampliamente el de los pesos de inferencia.
- Opciones de despliegue: Transformers (soporte nativo garantizado), Text Generation Inference (el tag `text-generation-inference` lo indica), vLLM o SGLang (compatibles con arquitecturas Qwen3, no verificados para este checkpoint concreto) y llama.cpp u Ollama únicamente tras convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible.
- Formatos alternativos: el autor no publica versiones cuantizadas ni ONNX; cualquier conversión corre por cuenta del usuario.

## Comparativa con modelos similares

Los datos de la columna de rendimiento no están disponibles porque este checkpoint no publica evaluaciones. Las cifras de parámetros, contexto y licencia corresponden a la documentación pública de cada modelo base y no han sido verificadas contra este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-025 (este modelo) | 4,02 B | No disponible | Apache 2.0 | Repositorio HF con 0 descargas | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | Contexto largo declarado por el autor del base | Apache 2.0 | Publico y ampliamente distribuido | No disponible en esta ficha |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens segun documentacion del fabricante | Licencia comunitaria Llama 3.2 | Publico | No disponible en esta ficha |
| Gemma-3-4B-IT | 4 B | 128.000 tokens segun documentacion del fabricante | Terminos de uso de Gemma | Publico | No disponible en esta ficha |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens segun documentacion del fabricante | MIT | Publico | No disponible en esta ficha |

Frente a estos modelos, la única ventaja diferencial documentada de este checkpoint es su licencia Apache 2.0 combinada con pesos derivados de Qwen3 y un supuesto ajuste al dominio médico que no está respaldado por ninguna evaluación publicada. Un modelo base sin ajustar o un modelo médico consolidado con documentación completa serían opciones más seguras para cualquier uso real.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 25) de una ejecución piloto: no hay garantía de convergencia ni de que represente el estado final del entrenamiento.
- No se publican evaluaciones, métricas ni comparaciones: no es posible afirmar que el ajuste médico mejore el rendimiento del modelo base.
- Riesgo elevado de alucinación en contenido clínico: al ser un modelo de 4B ajustado sobre datos no documentados, puede generar afirmaciones médicas plausibles pero incorrectas.
- Sesgos conocidos: no documentados. No hay información sobre la composición del dataset, por lo que no se puede evaluar el sesgo demográfico, lingüístico o clínico.
- Idiomas soportados: no especificados. Se desconoce si el ajuste ha degradado el multilingüismo del modelo base.
- Longitud de contexto: no documentada en este repositorio; usar contextos largos sin conocer la configuración real puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo sanitario.
- No es un producto sanitario: no ha pasado validación clínica, no dispone de marcado CE ni de autorización regulatoria de ningún tipo.
- Cero descargas y cero valoraciones: no existe comunidad que haya validado su comportamiento, y el autor no ofrece soporte ni mantenimiento declarado.
- Trazabilidad limitada: el autor indica que el checkpoint local se elimina tras verificar hashes, pero no publica los hashes, las métricas de entrenamiento ni las curvas de pérdida.
- Repositorio pesado y con estructura dual: 25,7 GB, con riesgo de confusión sobre qué archivos deben cargarse para inferencia.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-025
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework citado en la model card (veRL, referencia al proyecto del framework, no verificada en la búsqueda web): https://github.com/volcengine/verl
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Las consultas devolvieron únicamente resultados no relacionados (Hyundai Motor, Hayu, canales de YouTube), por lo que no hay papers, blogs, repositorios ni demos adicionales que citar.
