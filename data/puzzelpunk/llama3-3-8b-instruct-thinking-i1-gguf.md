# puzzelpunk/Llama3.3-8B-Instruct-Thinking-i1-GGUF

## Resumen

Llama3.3-8B-Instruct-Thinking-i1-GGUF es una cuantizacion en formato GGUF del modelo DavidAU/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning, publicada por el usuario puzzelpunk. Se trata de un fine-tune de 8.030.261.312 parametros construido sobre la familia Llama 3.3, orientado a razonamiento con modo "thinking", escritura creativa y roleplay, y con las capas de rechazo ("uncensored"/"abliterated") eliminadas o atenuadas respecto al modelo original.

El modelo parte de una destilacion de razonamiento de Claude 4.5 Opus mediante el dataset TeichAI/claude-4.5-opus-high-reasoning-250x, combinado con la base Llama 3.3 de 8B. El resultado es un modelo denso de 8B con ventana de contexto declarada de 128k tokens, capacidades multilingues en diez idiomas y un enfasis explicito en generacion de ficcion, tramas y narrativa vivida.

La relevancia de esta publicacion es practica: ofrece pesos cuantizados con imatrix en un rango amplio de niveles (desde IQ1_S de 2,1 GB hasta Q6_K), lo que permite desplegar el modelo en hardware de consumo. La licencia Apache 2.0 y la compatibilidad con endpoints estandar facilitan su integracion en pipelines existentes, aunque su naturaleza "uncensored" exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.3), fine-tune instruct con modo thinking |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, IQ3_L, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Llama 3.3 con aproximadamente 8.000 millones de parametros, afinado para instrucciones y con un modo de razonamiento explicito ("thinking"). El fine-tune se construye sobre DavidAU/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning, que a su vez deriva de Llama 3.3 y ha sido entrenado con datos de razonamiento destilados de Claude 4.5 Opus a traves del dataset TeichAI/claude-4.5-opus-high-reasoning-250x (250 ejemplos de alta calidad de razonamiento).

El proceso de "abliteration" o "heretic" aplicado en la cadena de fine-tunes busca reducir los comportamientos de rechazo del modelo alineado original, lo que afecta tanto a la utilidad creativa como a los riesgos de seguridad. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO adicionales; estos datos figuran como no disponibles. La publicacion de esta ficha corresponde exclusivamente a la cuantizacion GGUF con imatrix (generada por mradermacher y redistribuida por puzzelpunk), no al entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con trazas de razonamiento intermedias antes de la respuesta final.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, continuacion de escenas, narrativa vivida y prosa detallada.
- Roleplay y conversacion multi-turno con contexto extendido (hasta 128k tokens declarados).
- Capacidades multilingues en diez idiomas: ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, orientado a contenido creativo sin restricciones tematicas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita en la informacion disponible.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar tramas completas, subtramas y continuaciones de escena con prosa detallada, aprovechando su entrenamiento especifico en narrativa y su ventana de contexto de 128k para mantener coherencia en novelas largas.
- Roleplay y narrativa interactiva: adecuado para motores de rol conversacional donde se requiere consistencia de personaje a lo largo de sesiones extensas, gracias a la ventana de contexto ampliada y al modo thinking para respuestas mas elaboradas.
- Generacion de guiones y dialogos: util para producir dialogos con tono y estilo consistentes en proyectos de cine, videojuegos o audiolibros, con capacidad de mantener voces de personaje diferenciadas.
- Asistente de escritura multilingue: al cubrir diez idiomas, puede emplearse para redactar o traducir ficcion y material creativo entre espanol, ingles, frances, aleman, italiano, portugues, chino, japones, ruso y coreano.
- Prototipado de razonamiento local: el modo thinking y las cuantizaciones ligeras (IQ2/IQ3) permiten ejecutar experimentos de razonamiento en GPU de consumo, sin depender de APIs externas.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local con licencia Apache 2.0, puede ejecutarse en infraestructura propia para proyectos creativos o de investigacion que no pueden enviar datos a servicios en la nube.
- Generacion de contenido para videojuegos y narrativa ramificada: integrable en motores de dialogo o sistemas de misiones generadas dinamicamente, con cuantizaciones Q4_K_M que caben en GPUs de 8-12 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos aproximados, sin contar cache KV): IQ1_S ~2,1 GB; IQ2_M ~3,0 GB; IQ3_M ~3,9 GB; Q4_K_M ~4,9 GB; Q5_K_M ~5,7 GB; Q6_K ~6,6 GB.
- La cache KV para contexto de 128k tokens incrementa sustancialmente el consumo de VRAM; en la practica conviene limitar el contexto segun la GPU disponible.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas y contexto largo; A100/H100 para despliegues con contexto completo y concurrencia.
- Cabe en GPU de consumo: si, con cuantizaciones IQ2 a Q5 en GPUs de 8-16 GB; Q6_K requiere al menos 8 GB libres y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama3.3-8B-Instruct-Thinking-i1-GGUF (este) | 8,03B | 128k | Apache 2.0 | GGUF | Fine-tune uncensored con modo thinking y enfoque creativo |
| Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | Modelo alineado oficial de Meta, sin modo thinking ni abliteration |
| DavidAU/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning | 8,03B | 128k | Apache 2.0 | safetensors (bfloat16) | Modelo base de esta cuantizacion; mismos rasgos pero sin cuantizar |
| mradermacher/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning-GGUF | 8,03B | 128k | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base, alternativa a las i1 |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la reduccion de rechazos implica mayor probabilidad de generar contenido sensible, ofensivo o inapropiado; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a modelos de 8B, especialmente en tareas factuales y con contexto muy largo.
- El modo thinking puede producir trazas de razonamiento que no siempre son fiables ni verificables.
- La ventana de 128k tokens es una declaracion del autor; el rendimiento real en contextos muy largos puede degradarse y el consumo de VRAM de la cache KV es elevado.
- El soporte de tool calling y de agentes no esta confirmado en la informacion disponible; conviene validarlo antes de usarlo en pipelines automatizados.
- Aunque la licencia es Apache 2.0, el modelo base deriva de Llama 3.3 y de datos destilados de Claude 4.5 Opus; conviene revisar las condiciones de los modelos y datasets intermedios antes de un uso comercial.
- Los datos de benchmarks y de rendimiento cuantitativo no estan publicados, por lo que no es posible comparar su calidad de forma objetiva con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/puzzelpunk/Llama3.3-8B-Instruct-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama3.3-8B-Instruct-Thinking-Heretic-Uncensored-Claude-4.5-Opus-High-Reasoning-i1-GGUF
- Dataset de razonamiento: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
