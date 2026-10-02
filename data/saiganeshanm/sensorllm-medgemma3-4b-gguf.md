# SaiGaneshanM/sensorllm-medgemma3-4b-gguf

# SensorLLM MedGemma 3 4B GGUF

## Resumen

SensorLLM MedGemma 3 4B GGUF es una conversión a formato GGUF de un ajuste fino sobre MedGemma 4B IT, el modelo multimodal de Google orientado a texto e imagen médica. Lo publica el usuario SaiGaneshanM en HuggingFace y el proceso de ajuste y conversión se ha realizado con Unsloth. Se trata, por tanto, de un derivado de terceros del modelo de Google Health, no de un modelo oficial, y su model card es muy escueta.

El modelo tiene 3.880.263.168 parámetros (aproximadamente 3,88 mil millones) y es de tipo vision-language: combina un decodificador de texto con un codificador de imagen SigLIP, por lo que acepta entradas de texto e imagen. El repositorio ocupa 3,3 GB y distribuye dos ficheros: un GGUF cuantizado en Q4_K_M para el modelo de lenguaje y un mmproj en F16 para la torre de visión.

Su relevancia práctica es la de permitir ejecutar un modelo médico multimodal en hardware de consumo mediante llama.cpp, algo que el MedGemma original en bf16 no facilita. Ahora bien, el repositorio no tiene descargas ni valoraciones, no declara licencia ni idiomas, y la model card no documenta el dataset de ajuste ni resultados de evaluación, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (familia Gemma 3) con codificador de vision SigLIP para la rama multimodal |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Gemma 3 4B declara hasta 128.000 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 para el fichero mmproj de vision |
| Idiomas soportados | no disponible (el modelo base Gemma 3 declara mas de 140 idiomas) |
| Licencia | no disponible en el repositorio; el modelo base MedGemma se distribuye bajo los terminos de Health AI Developer Foundations (HAI-DEF) de Google |
| Formato de pesos | GGUF (llama.cpp); la model card menciona tambien un modelo bf16 fusionado para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3: un transformer decodificador con atencion local y global intercalada, disenado para sostener ventanas de contexto largas con un coste de atencion contenido. MedGemma 4B anade a esa base un codificador de imagen SigLIP preentrenado especificamente con imagenes medicas, lo que da al conjunto capacidad de comprension de texto clinico e imagen medica (radiografia, dermatologia, histopatologia, entre otras modalidades).

El ajuste fino concreto que da lugar a este repositorio no esta documentado: la model card no indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Los unicos detalles tecnicos declarados son que el entrenamiento y la conversion se hicieron con Unsloth (el autor afirma que fue "2x mas rapido"), que el comportamiento del token BOS se ajusto para compatibilidad con GGUF y que se generaron los ficheros `medgemma-4b-it.Q4_K_M.gguf` y `medgemma-4b-it.F16-mmproj.gguf`. No se documenta ninguna innovacion de decodificacion ni tecnica adicional.

## Capacidades

- Generacion de texto conversacional en dominio biomedico, heredada del ajuste de MedGemma sobre Gemma 3.
- Comprension de imagen medica mediante el fichero mmproj: radiografias de torax, imagenes dermatologicas, histopatologia y otras modalidades que cubre MedGemma 4B.
- Respuesta a preguntas visuales (VQA) sobre imagenes clinicas y sobre documentos con contenido mixto texto-imagen.
- Procesamiento de texto clinico: notas, informes y literatura medica.
- Capacidades multilingues no declaradas en este repositorio; el modelo base Gemma 3 cubre mas de 140 idiomas.
- Conversacion multi-turno con plantilla de chat de Gemma 3 (se recomienda `--jinja` en llama.cpp para aplicar la plantilla correcta).
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito, audio o cualquier otra modalidad adicional: no disponible.

## Casos de uso

- Triaje asistido de radiografias de torax: el modelo puede recibir una imagen y generar un borrador de hallazgos descriptivos que un radiologo revise despues. Es adecuado porque el codificador SigLIP del modelo base fue preentrenado con imagen medica, aunque el resultado siempre requiere validacion profesional.
- Resumen de informes y notas clinicas: convertir notas de evolucion extensas en resumenes estructurados. El contexto largo heredado de Gemma 3 permite manejar historiales completos en una sola pasada.
- Prototipado de investigacion en imagenes medicas: servir como linea base rapida y de bajo coste para experimentos de VQA medica o captioning antes de escalar a modelos mayores.
- Extraccion de datos de analiticas y documentos escaneados: al ser multimodal, puede tomar una imagen de un informe de laboratorio y devolver los valores en texto estructurado para su posterior parseo.
- Educacion medica y simulacion de casos: generar explicaciones sobre imagenes o casos clinicos en un entorno formativo, con supervision docente y sin uso diagnostico.
- Despliegue en entornos sin conectividad: al ser un GGUF de menos de 4 GB, se puede ejecutar en portatiles o equipos de borde en hospitales o entornos rurales donde no se permite enviar datos a la nube.
- Preanotacion de datasets medicos: usar el modelo para etiquetar o describir imagenes a gran escala y despues revisar manualmente, reduciendo el coste de anotacion.
- Chatbot de orientacion sanitaria no diagnostica: responder dudas generales de salud con avisos claros de que no sustituye a un profesional, apoyandose en su ajuste sobre texto biomedico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion y los resultados de busqueda consultados no aportan cifras para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada, solo texto con Q4_K_M: en torno a 3-4 GB, incluyendo pesos y cache KV para contextos moderados.
- VRAM estimada, multimodal con Q4_K_M mas mmproj F16: en torno a 5-7 GB, ya que hay que sumar el codificador de vision y los embeddings de imagen. Cifras estimadas a partir del tamano del repositorio (3,3 GB) y del peso del mmproj; no confirmadas por el autor.
- VRAM estimada en bf16/F16 sin cuantizar: aproximadamente 8-9 GB para los pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para uso multimodal comodo; A100, H100 o L40S para despliegue por lotes o concurrencia alta.
- Cabe en GPU de consumo: si. Con Q4_K_M funciona en tarjetas de 6-8 GB en modo texto y de 8-12 GB en modo multimodal. El contexto largo (hasta 128.000 tokens en el modelo base) incrementa mucho el consumo de cache KV, por lo que en GPUs pequenas conviene limitar la ventana.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal), Ollama (con la salvedad de que no soporta ficheros mmproj separados, segun advierte la propia model card), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles. Dependeran de la GPU, de la cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sensorllm-medgemma3-4b-gguf (este) | 3,88 B | Texto + imagen | no disponible (base: 128.000) | no disponible en el repo | GGUF, llama.cpp |
| MedGemma 4B IT (modelo base de Google) | no disponible con exactitud | Texto + imagen | no disponible | Terminos HAI-DEF de Google | Pesos oficiales en HuggingFace |
| MedGemma 27B (Google) | 27 B (aproximado) | Solo texto | no disponible | Terminos HAI-DEF de Google | Pesos oficiales en HuggingFace |
| Gemma 3 4B IT (Google, no medico) | no disponible con exactitud | Texto + imagen | no disponible | Terminos de uso de Gemma | Pesos oficiales en HuggingFace |

Los datos de parametros, contexto y licencia de los modelos de comparacion no estan confirmados en la informacion disponible de esta busqueda; se listan como referencia de categoria y deben verificarse en sus fichas oficiales. No hay datos de rendimiento comparado para ninguno de ellos.

## Limitaciones y advertencias

- Riesgo de alucinacion clinicamente relevante: el modelo puede describir hallazgos inexistentes en una imagen o inventar valores de analiticas. En dominio medico, un error de este tipo tiene consecuencias graves, por lo que toda salida debe ser verificada por un profesional cualificado.
- No es un producto sanitario: MedGemma y sus derivados no estan validados ni certificados como dispositivo medico. Este repositorio es un ajuste de terceros sin ninguna evaluacion publicada.
- Documentacion practicamente inexistente: no hay licencia declarada, ni idiomas, ni dataset de entrenamiento, ni metricas. El repositorio registra 0 descargas y 0 valoraciones, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia incierta para uso comercial: al no declararse licencia en el repositorio, y al derivar de MedGemma, se aplican los terminos de Health AI Developer Foundations de Google. Antes de cualquier uso comercial hay que revisar y cumplir esas condiciones, que incluyen restricciones de uso clinico.
- Cuantizacion Q4_K_M: la compresion a 4 bits puede degradar la precision en tareas que requieren lectura fina de cifras o texto pequeno en imagenes medicas, justo donde el margen de error es menor.
- Token BOS modificado: la model card indica que el comportamiento del token BOS se ajusto para compatibilidad con GGUF. Esto puede alterar el formato de los prompts y producir degradacion si no se usa la plantilla de chat correcta (se recomienda `--jinja`).
- Limitaciones de contexto: aunque el modelo base soporta ventanas muy largas, este repositorio no documenta la longitud efectiva tras el ajuste y la cuantizacion, y la cache KV a 128.000 tokens es prohibitiva en GPUs de consumo.
- Idiomas: no declarados. Un ajuste fino no documentado puede haber reducido el soporte multilingue original de Gemma 3 en favor del ingles.
- Sesgos: al no documentarse el dataset de ajuste, no es posible caracterizar los sesgos demograficos, etnicos o de subrepresentacion de patologias. Los modelos medicos tienden a rendir peor en poblaciones poco representadas en sus datos de entrenamiento.
- Advertencia sobre Ollama: la propia model card senala que Ollama no soporta ficheros mmproj separados, de modo que el flujo multimodal en Ollama requiere reconstruir un modelo bf16 unificado desde el `Modelfile`, con el consiguiente aumento de requisitos de hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SaiGaneshanM/sensorllm-medgemma3-4b-gguf
- MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Repositorio GitHub de MedGemma (Google Health): https://github.com/google-health/medgemma
- Unsloth (herramienta de ajuste y conversion declarada): https://github.com/unslothai/unsloth
