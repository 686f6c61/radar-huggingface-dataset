# aisingapore/Gemma-SEA-LION-v5-E2B-GGUF

## Resumen

Gemma-SEA-LION-v5-E2B-GGUF es la distribucion en formato GGUF del modelo Gemma-SEA-LION-v5-E2B, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos disenada especificamente para dar cobertura a las lenguas del sudeste asiatico, un segmento habitualmente infrarrepresentado en los grandes modelos multilingues de proposito general.

El modelo base es un LLM denso y multimodal de aproximadamente 4.650 millones de parametros (4.647.450.147 segun los pesos en safetensors) con una ventana de contexto de 128K tokens. Acepta entradas de texto, imagen y audio, por lo que se etiqueta como "any-to-any" en Hugging Face. Esta version GGUF anade cuatro niveles de cuantizacion (F16, Q4_K_M, Q6_K y Q8_0) mas un fichero separado de proyectores de vision y audio en F16, pensado para su uso con llama.cpp.

Su relevancia practica es doble: por un lado, ofrece inferencia local eficiente de un modelo multimodal en hardware de consumo gracias al formato GGUF; por otro, cubre nueve idiomas (ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita) con licencia MIT, lo que facilita su adopcion comercial en la region.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, vision y audio), derivado de Gemma 4 E2B |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF F16, Q4_K_M, Q6_K, Q8_0; codificadores de vision y audio en F16 |
| Idiomas soportados | Ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero `mmproj` separado para vision y audio) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Gemma 4 E2B, adaptado por AI Singapore para el sudeste asiatico. La model card de esta version GGUF no detalla la composicion del dataset ni el numero de tokens de entrenamiento, y remite explicitamente a la model card de `aisingapore/Gemma-SEA-LION-v5-E2B` para la metodologia completa. Tampoco se documentan en esta ficha si hubo fases de RLHF o DPO. Lo que si se confirma es la naturaleza multimodal del modelo, con codificadores de vision y audio que en la version GGUF se distribuyen como un unico fichero `mmproj` en F16 compatible con cualquiera de las cuatro cuantizaciones del modelo de lenguaje.

La innovacion principal de esta publicacion es el propio proceso de cuantizacion: se mantienen intactos el tokenizador, la plantilla de chat y los valores por defecto de muestreo del modelo original, y se ofrece un abanico de tamanos que va de 3,43 GB (Q4_K_M) a 9,31 GB (F16), mas 0,99 GB del proyector multimodal. El modelo incorpora un modo de razonamiento ("thinking") activado por defecto, que puede desactivarse mediante el parametro `enable_thinking` en `chat_template_kwargs`.

## Capacidades

- Generacion de texto conversacional en nueve idiomas, con enfasis en lenguas del sudeste asiatico.
- Razonamiento con modo "thinking" activable y desactivable por peticion.
- Comprension de imagenes mediante el proyector de vision (entrada multimodal).
- Comprension de audio mediante el proyector de audio incluido en el fichero `mmproj`.
- Entrada multimodal combinada: texto, imagen y audio en la misma conversacion.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) a traves de llama.cpp.
- Plantilla de chat integrada y compatible con `--jinja`.
- Contexto largo de hasta 128K tokens para documentos extensos o conversaciones multi-turno.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita o filipino con una ventana de 128K tokens, lo que permite arrastrar historial extenso y documentacion de producto sin truncar contexto.
- Procesamiento de documentacion logistica y aduanera: como muestra el ejemplo de la model card (exportacion de durian congelado de Medan a Singapur), el modelo responde en el idioma del usuario con formatos estructurados y conocimiento del contexto regional.
- Analisis de imagenes en movilidad o campo: con el proyector de vision, se puede desplegar en un portatil con llama.cpp para describir imagenes, leer documentacion escaneada o interpretar fotografias de producto en entornos con conectividad limitada.
- Transcripcion y comprension de audio local: el proyector de audio permite procesar notas de voz o grabaciones sin enviar datos a la nube, util en sectores con requisitos de privacidad.
- Asistencia al desarrollo en local: al caber en GPU de consumo en Q4_K_M (3,43 GB), sirve como copiloto de codigo y chat tecnico en estaciones de trabajo sin GPU de datacenter.
- Investigacion linguistica comparada: la cobertura de nueve idiomas con licencia MIT permite estudiar rendimiento y sesgos en lenguas de bajos recursos sin restricciones de uso comercial.
- Prototipado rapido de aplicaciones multimodales: el servidor de llama.cpp expone una API compatible con OpenAI, lo que facilita integrar el modelo en aplicaciones existentes cambiando solo la URL base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cuantizaciones GGUF no se evaluaron por separado y remite a la model card del modelo base y al SEA-LION Leaderboard para los resultados del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje: 3,43 GB (Q4_K_M), 3,85 GB (Q6_K), 4,97 GB (Q8_0) y 9,31 GB (F16). Anadir 0,99 GB si se usa el proyector de vision y audio.
- En Q4_K_M, el conjunto completo (modelo mas proyector) ronda los 4,4 GB, por lo que cabe en GPU de consumo con 6-8 GB de VRAM, como una RTX 3060, RTX 4060 o RTX 2070.
- En F16 con proyector, se necesitan aproximadamente 10,3 GB, lo que encaja en una RTX 4080, RTX 4090 o GPUs profesionales como A100 o H100.
- Despliegue recomendado mediante llama.cpp (`llama-server`) con soporte de `--mmproj` para multimodal y `--jinja` para la plantilla de chat.
- Tambien es compatible con cualquier frontend que consuma la API OpenAI de llama.cpp, incluida la interfaz web integrada en el puerto 8080.
- No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v5-E2B-GGUF | 4,65B | 128K | Texto, imagen, audio | MIT | GGUF en Hugging Face |
| Gemma-SEA-LION-v5-E2B (BF16) | 4,65B | 128K | Texto, imagen, audio | MIT | Safetensors en Hugging Face |
| Gemma-SEA-LION-v5-E2B-FP8 | 4,65B | 128K | Texto, imagen, audio | MIT | FP8 en Hugging Face |
| Gemma-SEA-LION-v5-E2B-INT4 | 4,65B | 128K | Texto, imagen, audio | MIT | INT4 en Hugging Face |

Las alternativas directas dentro del ecosistema SEA-LION v5 comparten arquitectura y licencia; la diferencia esta en el formato y el nivel de cuantizacion. No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de proteccion adicionales.
- No se ha evaluado la robustez frente a prompting adversarial.
- Riesgo de alucinacion documentado por el autor: puede generar contenido irrelevante o elementos ficticios no fundamentados en el contexto.
- La evaluacion se realizo sobre el modelo base sin cuantizar; las cuantizaciones GGUF no se han evaluado por separado, por lo que puede haber degradacion no medida en Q4_K_M y Q6_K.
- La cobertura linguistica se limita a los nueve idiomas declarados; el rendimiento en otras lenguas, incluido el espanol, no esta documentado.
- Aunque la licencia es MIT, el autor declina cualquier responsabilidad por reclamaciones derivadas del uso de los pesos.
- Para produccion, conviene validar las respuestas en dominios sensibles (legal, medico, financiero) dada la ausencia de evaluaciones de robustez publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B-GGUF
- Modelo base (BF16): https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B
- Version FP8: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B-FP8
- Version INT4: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B-INT4
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio oficial de SEA-LION: https://sea-lion.ai
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Model card de Gemma 4 E2B (referencia de datos y seguridad): https://huggingface.co/google/gemma-4-E2B-it
- Licencia MIT: https://mit-license.org/
- Paper de referencia (arXiv): https://arxiv.org/abs/2607.02770
