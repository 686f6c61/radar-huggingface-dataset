# mradermacher/lfm3-1.7b-bazi-v13-GGUF

## Resumen

lfm3-1.7b-bazi-v13-GGUF es la version cuantizada en formato GGUF del modelo kinyeah/lfm3-1.7b-bazi-v13, un ajuste fino mediante LoRA sobre LFM3 (Liquid Foundation Model 3) de 1.700 millones de parametros, especializado en *bazi* (八字), el sistema de astrologia china basado en los "ocho caracteres" derivados de la fecha y hora de nacimiento. El modelo ha sido cuantizado por mradermacher, un perfil conocido por publicar versiones GGUF de modelos pequenos y especializados para su uso en entornos con recursos limitados.

El modelo parte de una base de 1.728.801.600 parametros (segun los safetensors publicados) y esta orientado a tareas de razonamiento estructurado dentro del dominio del bazi: interpretacion de pilares, calculo de elementos, relaciones entre troncos y ramas, y generacion de lecturas astrologicas. Su relevancia actual radica en que permite ejecutar un asistente especializado en este dominio en hardware de consumo, gracias a las cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16).

La ficha se centra en la version GGUF distribuida por mradermacher, que conserva la licencia Apache 2.0 del modelo base y esta etiquetada unicamente para ingles, aunque el dominio de aplicacion (bazi) es de origen chino y el modelo base puede haber sido entrenado con datos en chino. No se dispone de informacion publica sobre la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; arquitectura concreta no especificada en la informacion) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 15,9 GB (incluye todas las cuantizaciones) |
| Modelo base | kinyeah/lfm3-1.7b-bazi-v13 |
| Metodo de ajuste | LoRA sobre LFM3 1.7B |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3 (Liquid Foundation Model 3), mas alla de que se trata de un transformer de 1.700 millones de parametros desarrollado por Liquid AI. El modelo aqui descrito es un ajuste fino mediante LoRA sobre esa base, orientado al dominio del bazi, y posteriormente cuantizado a GGUF por mradermacher mediante cuantizacion estatica (convert_type: hf, output_tensor_quantised: 1). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

Las etiquetas de la model card incluyen "reasoning", lo que sugiere que el ajuste busca reforzar el razonamiento estructurado dentro del dominio astrologico. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos. Las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, segun indica el propio autor de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interpretaciones de bazi.
- Razonamiento estructurado dentro del dominio de los ocho caracteres: pilares, troncos celestes, ramas terrestres y elementos.
- Calculo e interpretacion de relaciones entre elementos (generacion, control, ciclos) segun la tradicion del bazi.
- Ajuste fino mediante LoRA, lo que permite especializacion sin reentrenar la base completa.
- Compatible con endpoints (tag "endpoints_compatible") para despliegue como servicio.
- Capacidad de razonamiento marcada explicitamente en las etiquetas del modelo.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- **Asistente de consulta astrologica personal**: el modelo puede generar lecturas de bazi a partir de los datos de nacimiento del usuario, interpretando los pilares y elementos dentro de una conversacion multi-turno. Su tamano de 1,7B permite ejecutarlo en local para preservar la privacidad de los datos personales.
- **Generacion de contenido editorial sobre bazi**: redaccion de articulos, fichas y explicaciones divulgativas sobre los ocho caracteres, con un tono consistente gracias al ajuste LoRA sobre el dominio.
- **Herramienta educativa interactiva**: aplicacion web o de escritorio que explique conceptos de astrologia china a estudiantes, con respuestas generadas en tiempo real en hardware de consumo (cuantizacion Q4_K_M de 1,2 GB).
- **Prototipado rapido de chatbots especializados**: al estar disponible en GGUF y con licencia Apache 2.0, sirve como base para experimentar con asistentes de nicho sin costes de licencia y con despliegue en llama.cpp u Ollama.
- **Integracion en pipelines de generacion de informes**: uso del modelo como componente de generacion de texto en un sistema que calcule previamente los datos astronomicos y le pase el contexto al modelo para redactar la interpretacion.
- **Investigacion sobre ajuste fino en dominios especializados**: el modelo y su base sirven como caso de estudio de como un LoRA sobre un modelo pequeno (1,7B) puede especializarse en un dominio cultural concreto y luego cuantizarse para distribucion.
- **Despliegue en dispositivos con recursos limitados**: con cuantizaciones desde 0,9 GB, puede ejecutarse en portatiles sin GPU dedicada o en mini-PC, lo que facilita demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: entre 1 GB (Q2_K, 0,9 GB de pesos) y 4 GB (f16, 3,6 GB de pesos), mas el overhead del contexto y del runtime.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente para las cuantizaciones Q4_K_M o Q5_K_M; para f16 se recomienda una GPU con 6-8 GB. No se requiere A100 ni H100.
- **Cabe en GPU consumer**: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida para cuantizaciones bajas).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere soporte para despliegue como endpoint HTTP. Tambien es posible usar el modelo base en safetensors con transformers y vLLM/TGI, aunque la version aqui descrita es GGUF.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada; por el tamano (1,7B) se espera una latencia baja en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables dentro del mismo nicho (bazi) ni de resultados de rendimiento que permitan una comparacion cuantitativa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Nicho |
|---|---|---|---|---|---|
| lfm3-1.7b-bazi-v13-GGUF | 1,7B | no disponible | Apache 2.0 | GGUF | bazi / astrologia china |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Dominio muy restringido**: el ajuste LoRA esta orientado al bazi; fuera de ese dominio el rendimiento puede degradarse respecto al modelo base LFM3.
- **Riesgo de alucinacion**: al ser un modelo pequeno (1,7B) especializado, puede generar interpretaciones astrologicas plausibles pero incorrectas segun la tradicion, o inventar correspondencias entre elementos y pilares.
- **Idioma**: la model card declara unicamente ingles; no hay garantia de calidad en castellano ni en chino, a pesar del origen cultural del dominio.
- **Contexto desconocido**: no se ha publicado la longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos con garantias.
- **Naturaleza no cientifica del dominio**: el bazi es una practica tradicional sin base cientifica; el modelo no debe presentarse como herramienta de diagnostico, prediccion fiable ni asesoramiento profesional.
- **Cuantizaciones estaticas**: las cuantizaciones de menor tamano (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- **Sin cuantizaciones ponderadas/imatrix**: el autor indica que no estan disponibles, lo que limita la calidad en tamanos intermedios frente a alternativas con imatrix.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del modelo base LFM3 de Liquid AI, ya que la licencia del ajuste no exime de las obligaciones de la base.
- **Cero descargas y likes**: el repositorio no tiene traccion ni validacion comunitaria, por lo que no hay evidencia externa de calidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/lfm3-1.7b-bazi-v13-GGUF
- Modelo base (ajuste LoRA): https://huggingface.co/kinyeah/lfm3-1.7b-bazi-v13
- Pagina de resumen del autor de las cuantizaciones: https://hf.tst.eu/model#lfm3-1.7b-bazi-v13-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
