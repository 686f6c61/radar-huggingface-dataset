# mradermacher/Liminar-Qwen3.5-9B-GGUF

## Resumen

Liminar-Qwen3.5-9B-GGUF es la distribucion en formato GGUF del modelo Liminar-Qwen3.5-9B, un ajuste fino desarrollado por LICDIA-UNLu (Laboratorio de Investigacion y Desarrollo en Inteligencia Artificial de la Universidad Nacional de Lujan, Argentina) sobre una base Qwen3.5 de 9B. El modelo esta especializado en tematica liminar: normativa y legislacion argentina, con especial enfasis en el ambito universitario. La version aqui descrita ha sido cuantizada por mradermacher, un conocido distribuidor de cuantizaciones GGUF de la comunidad open source.

El modelo resuelve un problema concreto: la falta de modelos de lenguaje abiertos con conocimiento especializado en el marco normativo argentino y en el funcionamiento del sistema universitario de ese pais. Al estar construido sobre Qwen3.5, hereda la arquitectura transformer decoder-only de dicha familia, con aproximadamente 8.950 millones de parametros totales. El entrenamiento adicional se ha realizado exclusivamente en castellano (idioma declarado: es), lo que lo hace adecuado para tareas de consulta normativa, redaccion administrativa y asistencia documental en el contexto argentino.

La relevancia actual radica en que es un ejemplo de ajuste fino institucional: una universidad publica argentina publica un modelo especializado con licencia Apache 2.0, lo que permite su uso comercial y su integracion en herramientas de gestion universitaria, consultoria legal y atencion al ciudadano. La distribucion GGUF de mradermacher facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es Liminar-Qwen3.5-9B, un ajuste fino de la familia Qwen3.5 de 9B de parametros. La model card del repositorio GGUF no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF, DPO o instruccion supervisada. Los tags del modelo (liminar, argentina, universidades, normativa) sugieren que el ajuste fino se centro en corpus normativos argentinos y documentacion universitaria, pero no se especifica la metodologia.

La cuantizacion la ha realizado mradermacher con su herramienta habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf). Se ofrecen cuantizaciones estaticas K-quant e IQ-quant, sin versiones ponderadas por imatrix en el momento de la publicacion. La presencia de ficheros mmproj (f16 y Q8_0) indica que el modelo base incorpora capacidades multimodales (vision), aunque la model card no detalla su alcance.

## Capacidades

- Generacion de texto conversacional en castellano, orientada a consultas sobre normativa argentina.
- Respuesta a preguntas sobre legislacion universitaria y procedimientos administrativos.
- Redaccion y resumen de documentos normativos y administrativos.
- Capacidad multimodal potencial: el repositorio incluye ficheros mmproj (proyeccion multimodal), lo que sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: limitadas al castellano segun el campo `language: es`.
- Modo thinking explicito: no disponible.

## Casos de uso

- Consulta normativa universitaria: un estudiante o gestor pregunta por reglamentos de posgrado, equivalencias o regimen de permanencia, y el modelo responde citando la normativa argentina aplicable. Es adecuado por su ajuste especifico en el dominio.
- Asistencia en secretarias academicas: redaccion de resoluciones, notificaciones y actas con terminologia administrativa correcta, reduciendo el tiempo de tramitacion.
- Chatbot de atencion al ciudadano en organismos publicos argentinos: despliegue en Ollama o llama.cpp con cuantizacion Q4_K_M (5,8 GB) en un servidor modesto, sin dependencia de APIs externas.
- Analisis de expedientes y documentacion: resumen y extraccion de puntos clave de normativas y expedientes, aprovechando la ventana de contexto del modelo base (no confirmada en la ficha).
- Formacion y docencia: generacion de material didactico explicando el marco legal universitario a alumnos de grado.
- Investigacion juridica asistida: busqueda semantica y comparacion de articulados entre distintas normativas, como apoyo a investigadores del derecho administrativo.
- Despliegue en entornos con requisitos de soberania de datos: al ser Apache 2.0 y ejecutable localmente en GGUF, permite procesar documentacion sensible sin salir de la infraestructura de la institucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,0 GB; Q4_K_M ~5,8 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M con contexto moderado; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 para despliegues concurrentes de alta throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_S/Q4_K_M; en 6 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI solo con los pesos safetensors del modelo base (no con GGUF).
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Formato |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-9B | ~8,95B | no disponible | Apache 2.0 | Normativa argentina/universitaria | safetensors, GGUF |
| Qwen3.5-9B (base) | ~9B | no disponible | segun Qwen (no confirmado) | Generalista | safetensors, GGUF |
| Modelos legales en castellano de 7-8B | ~7-8B | variable | variable | Legal generalista | safetensors, GGUF |

La comparativa con alternativas legales en castellano no puede completarse con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino se centra en normativa argentina y universidades; su rendimiento en otros dominios o paises puede degradarse respecto al modelo base.
- Riesgo de alucinacion en citas normativas: como todo LLM, puede inventar articulos, numeros de ley o fechas; en un contexto legal es imprescindible verificar cada cita contra la fuente oficial.
- Idioma: declarado exclusivamente en castellano; no se garantiza calidad en otras lenguas.
- Contexto: no se ha publicado la longitud de contexto del modelo base; no asumir ventanas largas sin verificacion empirica.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre normativa institucional podria reproducir sesgos administrativos o terminologia excluyente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 del que deriva.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para uso en produccion se recomienda Q4_K_M o superior.
- No hay versiones imatrix/ponderadas publicadas, lo que puede reducir la calidad frente a cuantizaciones ponderadas de otros distribuidores.
- Repositorio con 0 descargas y 0 likes en el momento del analisis: sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liminar-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-9B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Qwen3.5-9B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
