# Caldalis/MiniTranslator-2B

## Resumen

MiniTranslator-2B es un modelo de traducción automática multilingüe de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) desarrollado por Caldalis mediante ajuste fino del modelo base openbmb/MiniCPM5-2B. Está diseñado específicamente para tareas de traducción entre chino, inglés y otras 20 lenguas adicionales, y sigue instrucciones de traducción tanto en chino como en inglés. Su orientación principal es el despliegue en dispositivos y entornos de borde (on-device y edge), aunque también cubre cargas de trabajo de traducción generales.

El modelo se distribuye en formato BF16 y en cuatro variantes GGUF (F16, Q8_0, Q6_K y Q4_K_M), lo que permite ejecutarlo con transformers, vLLM, SGLang o llama.cpp. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales. Su principal valor diferencial es ofrecer traducción multilingüe con control fino de instrucciones (terminología, estilo, personalización, preservación de estructura y delimitadores) en un tamaño reducido que cabe en hardware de consumo.

La relevancia actual del modelo radica en la combinación de un tamaño contenido (2,5B parámetros) con soporte para 22 idiomas y un conjunto de plantillas de instrucción pensadas para traducción profesional, lo que lo sitúa como alternativa ligera frente a modelos de traducción de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-2B, familia LLaMA según tags) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | zh, en, ja, ko, ar, de, fr, es, ru, bn, cs, et, fa, he, id, kn, ro, ta, te, tl, tr, uk (22 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (F16, Q8_0, Q6_K, Q4_K_M) |

## Arquitectura y entrenamiento

MiniTranslator-2B es un ajuste fino (finetune) del modelo openbmb/MiniCPM5-2B, un transformer de 2,5 mil millones de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo ni innovaciones arquitectónicas concretas más allá de su base MiniCPM5.

El modelo incorpora una plantilla de chat que soporta un modo de razonamiento (thinking mode), aunque el autor recomienda desactivarlo para tareas de traducción (`enable_thinking=False` en transformers, `--reasoning off` en llama.cpp o `chat_template_kwargs: {"enable_thinking": false}` en peticiones compatibles con OpenAI). El entrenamiento está orientado a seguir instrucciones de traducción en chino e inglés, con plantillas específicas para terminología, estilo, personalización, delimitadores, datos estructurados e información de contexto. La decodificación recomendada es greedy (`temperature=0`), con `top_p=0.95` y `max_tokens=4096`; si se requiere muestreo, se sugiere temperatura baja (0,2–0,3) y `top_p=0.9`.

## Capacidades

- Traducción multilingüe entre chino, inglés y 20 idiomas adicionales (japonés, coreano, árabe, alemán, francés, español, ruso, bengalí, checo, estonio, persa, hebreo, indonesio, kannada, rumano, tamil, telugu, tagalo, turco y ucraniano).
- Seguimiento de instrucciones de traducción en chino e inglés, con plantillas diferenciadas por tipo de tarea.
- Control de terminología: permite aportar pares de traducción de referencia para forzar el uso de términos concretos.
- Control de estilo: admite indicaciones de estilo (por ejemplo, formal, coloquial) que la traducción debe respetar estrictamente.
- Personalización: acepta preferencias del usuario en forma de lista de requisitos que condicionan la traducción.
- Preservación de delimitadores: instrucciones específicas para mantener el mismo número y posición de símbolos delimitadores.
- Traducción de datos estructurados (JSON, YAML, etc.) preservando claves, etiquetas, variables y placeholders sin traducirlos.
- Traducción con información de contexto o trasfondo aportada por el usuario.
- Modo de razonamiento (thinking mode) disponible en la plantilla de chat, desaconsejado para traducción.
- No se menciona soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede procesar textos largos y preservar términos técnicos mediante la plantilla de terminología, lo que reduce la necesidad de revisión manual en glosarios de producto.
- Localización de aplicaciones con datos estructurados: gracias a la plantilla de datos estructurados, puede traducir únicamente los valores visibles de ficheros JSON o YAML sin alterar claves ni placeholders, integrándose en pipelines de localización automatizados.
- Traducción en dispositivos de borde: con las variantes GGUF Q4_K_M o Q6_K, el modelo puede ejecutarse en portátiles y equipos de consumo mediante llama.cpp u Ollama, habilitando traducción offline sin conexión.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones entre agentes y clientes en 22 idiomas, con control de estilo para adaptar el tono al contexto de soporte.
- Traducción de contenido editorial con estilo definido: la plantilla de estilo permite fijar registros (formal, divulgativo) y mantener coherencia en colecciones de artículos o campañas de marketing.
- Traducción de interfaces de usuario y cadenas de software: la preservación de delimitadores y placeholders evita roturas en cadenas con variables (`%s`, `{{var}}`), adecuada para pipelines de CI/CD de localización.
- Traducción asistida con contexto: la plantilla de información de trasfondo permite aportar contexto de dominio para desambiguar términos en textos especializados (legal, médico, financiero).
- Despliegue en servicios de inferencia de alto rendimiento: compatible con vLLM y SGLang para servir traducciones con baja latencia en entornos de producción.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas (imágenes) sin cifras numéricas explícitas en el texto. Se indica cualitativamente lo siguiente:

- En FLORES-200, NTREX-128 y WMT24++, MiniTranslator-2B es competitivo con Hy-MT2-1.8B.
- En HardMTBench, supera a Hy-MT2-1.8B en 3,1 puntos.
- En WMT25 de formato largo y contenido estructurado, la mayor brecha se da frente a modelos de 7B y 30B-A3B.
- Los resultados de traducción usan decodificación greedy (`temperature=0`) y métrica XCOMET (mayor es mejor).
- Los resultados de seguimiento de instrucciones usan la puntuación basada en reglas del benchmark correspondiente.

No se han publicado cifras numéricas de benchmarks en la información textual disponible; las gráficas no permiten extraer valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5 GB solo para pesos (2,5B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en Q8_0: aproximadamente 2,7 GB; en Q6_K: aproximadamente 2,1 GB; en Q4_K_M: aproximadamente 1,5 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, especialmente en las variantes GGUF Q4_K_M y Q6_K.
- Opciones de despliegue: transformers (>=5.6.0), vLLM, SGLang, llama.cpp y, presumiblemente, Ollama a través de GGUF (no confirmado explícitamente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiniTranslator-2B | 2,5B | no disponible | 22 | Apache 2.0 | Competitivo con Hy-MT2-1.8B en FLORES-200, NTREX-128 y WMT24++; +3,1 en HardMTBench |
| Hy-MT2-1.8B | 1,8B | no disponible | no disponible | no disponible | Referencia de comparación en la model card; superado en HardMTBench |
| Modelos de traducción de 7B | ~7B | no disponible | no disponible | no disponible | Mejor rendimiento en WMT25 largo y estructurado según la model card |
| Modelos de traducción 30B-A3B (MoE) | ~30B totales | no disponible | no disponible | no disponible | Mejor rendimiento en WMT25 largo y estructurado según la model card |

No se dispone de datos detallados de los modelos comparables más allá de lo citado en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, puede heredar sesgos de género, culturales o geográficos.
- Riesgo de alucinación: no cuantificado; en traducción puede producir contenido no presente en el original, especialmente en textos largos o ambiguos.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que dificulta planificar el procesamiento de documentos extensos.
- Idiomas: aunque soporta 22 idiomas, el rendimiento puede ser desigual entre pares; la model card solo aporta comparaciones agregadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base openbmb/MiniCPM5-2B por si impusieran restricciones adicionales.
- Modo de razonamiento: debe desactivarse explícitamente para traducción; dejarlo activado puede degradar la calidad o aumentar la latencia.
- WMT25 de formato largo y estructurado: es el punto más débil frente a modelos de 7B y 30B-A3B, por lo que no es la mejor opción para documentos muy largos o con estructura compleja.
- Sin datos de benchmarks numéricos públicos en formato tabular, lo que limita la comparación cuantitativa con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caldalis/MiniTranslator-2B
- Variante GGUF: https://huggingface.co/Caldalis/MiniTranslator-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
