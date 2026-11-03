# furiosa-ai/K-EXAONE-236B-A23B-NVFP4A16

## Resumen

K-EXAONE-236B-A23B-NVFP4A16 es una compilación cuantizada del modelo K-EXAONE-236B-A23B desarrollado por LG AI Research, publicada por FuriosaAI. Se trata de un transformer autorregresivo de tipo Mixture-of-Experts (MoE) con 236.000 millones de parámetros totales y 23.000 millones activos por token, distribuidos en 128 expertos de los cuales se activan 8 más uno compartido. La versión de FuriosaAI aplica cuantización NVFP4 sobre los pesos manteniendo activaciones y caché KV en 16 bits (esquema NVFP4A16), lo que reduce el espacio en disco y memoria a costa de una pérdida de precisión controlada.

El modelo cubre seis idiomas (coreano, inglés, español, alemán, japonés y vietnamita) y está diseñado tanto para razonamiento como para conversación directa. Incorpora un modo de pensamiento (thinking) activado por defecto, que devuelve la cadena de razonamiento en un campo separado, y soporte de tool calling mediante el parser `hermes`. La arquitectura emplea un esquema de atención híbrido que intercala capas de atención de ventana deslizante con capas de atención global.

La relevancia de esta ficha concreta radica en que FuriosaAI distribuye, además de los pesos NVFP4A16, un Furiosa Executable Bundle (FXB) para ejecutar el modelo en hardware RNGD propietario con su propio motor de inferencia (Furiosa-LLM). Los pesos NVFP4A16 también son compatibles con vLLM, SGLang y Transformers, lo que permite desplegar el modelo en GPUs convencionales con un formato de 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ExaoneMoE (transformer Mixture-of-Experts con atención híbrida: ventana deslizante + global) |
| Parámetros totales | 236B (137.745.008.512 según safetensors del repo cuantizado) |
| Parámetros activos | 23B por token (128 expertos, 8 activados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4A16 (pesos en FP4, activaciones y caché KV en 16 bits) |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | K-EXAONE AI Model License (license: other, license_name: k-exaone) |
| Formato de pesos | safetensors + FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo de tipo Mixture-of-Experts con 236B parámetros totales y 23B activos. La capa MoE contiene 128 expertos, de los cuales 8 se activan por token junto con un experto compartido. La atención es híbrida: alterna capas con ventana deslizante (sliding-window attention) y capas con atención global, un patrón habitual para reducir el coste computacional en contextos largos sin perder capacidad de modelado a larga distancia.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema híbrido mencionado. La versión de FuriosaAI no reentrena el modelo: parte de los pesos de LGAI-EXAONE/K-EXAONE-236B-A23B y aplica cuantización NVFP4 en sus propios laboratorios, manteniendo activaciones y caché KV en 16 bits. El bundle FXB está compilado específicamente para el acelerador RNGD de FuriosaAI.

## Capacidades

- Generación de texto conversacional y de razonamiento en seis idiomas (coreano, inglés, español, alemán, japonés y vietnamita).
- Modo de razonamiento (thinking) activado por defecto, con la cadena de pensamiento devuelta en un campo separado (`message.reasoning` en no streaming, `delta.reasoning` en streaming) mediante el parser `deepseek_v3`.
- Posibilidad de desactivar el razonamiento por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling mediante el parser `hermes` y la opción `--enable-auto-tool-choice`.
- API compatible con OpenAI (endpoint `/v1/chat/completions`).
- Capacidad multilingüe nativa para los seis idiomas declarados.
- No se declaran capacidades de visión, audio ni otras modalidades: la entrada y salida son exclusivamente texto.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones multi-turno en español, inglés, coreano, alemán, japonés y vietnamita sin cambiar de modelo, lo que simplifica el despliegue en empresas con base de clientes internacional.
- Asistentes con razonamiento explícito: al separar la cadena de pensamiento del resultado final, es adecuado para aplicaciones donde se requiere auditar el razonamiento (por ejemplo, soporte técnico o diagnóstico) sin exponerlo al usuario final.
- Automatización de agentes con herramientas: gracias al soporte de tool calling vía parser `hermes`, puede integrarse en flujos que consulten APIs, bases de datos o servicios internos y encadenen varias llamadas.
- Generación y revisión de documentación técnica multilingüe: la combinación de contexto conversacional y cobertura de seis idiomas permite traducir, resumir y reescribir documentación manteniendo coherencia terminológica.
- Procesamiento de textos legales o administrativos en coreano e inglés: el modelo está entrenado por LG AI Research con foco en coreano, lo que lo hace útil para tareas de extracción y resumen en ese idioma combinado con inglés.
- Despliegue en infraestructura FuriosaAI RNGD: el bundle FXB permite servir el modelo en cuatro tarjetas RNGD (tensor-parallel de 32 PEs) con Furiosa-LLM, una alternativa a clusters de GPU para organizaciones que ya operan hardware RNGD.
- Evaluación comparativa de cuantización: los pesos NVFP4A16 permiten medir la degradación de calidad frente al modelo original en tareas de razonamiento y generación, útil para equipos que investigan cuantización de MoE a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repo cuantizado ocupa 351,6 GB en disco (pesos NVFP4A16 más FXB).
- En hardware FuriosaAI: se ejecuta en cuatro tarjetas RNGD con tensor-parallel de 32 PEs (8 PEs por tarjeta), mediante Furiosa-LLM.
- En GPU convencionales: los pesos NVFP4A16 son compatibles con vLLM, SGLang y Transformers, pero no se proporcionan cifras de VRAM mínima ni de número de GPUs necesarias. Con 236B parámetros totales en FP4, el peso de los pesos ronda los 118 GB teóricos, aunque el tamaño real del repo (351,6 GB) incluye artefactos adicionales; se requiere por tanto un despliegue multi-GPU.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU profesional de 80 GB.
- Opciones de despliegue documentadas: Furiosa-LLM (nativo, con FXB), vLLM, SGLang y Transformers para los pesos NVFP4A16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-EXAONE-236B-A23B-NVFP4A16 (esta ficha) | 236B / 23B | no disponible | en, ko, es, de, ja, vi | K-EXAONE AI Model License | HuggingFace, Furiosa-LLM, vLLM, SGLang, Transformers |
| LGAI-EXAONE/K-EXAONE-236B-A23B (base) | 236B / 23B | no disponible | en, ko, es, de, ja, vi | K-EXAONE AI Model License | HuggingFace |
| Modelos MoE de escala similar (p. ej. familia DeepSeek, Qwen MoE) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base del que deriva. No se han proporcionado datos de benchmarks ni especificaciones de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización NVFP4A16 introduce pérdida de precisión respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El modo de razonamiento está activado por defecto: si no se configura correctamente el parser `deepseek_v3` junto con `--default-chat-template-kwargs '{"enable_thinking": true}'`, el texto `<think>...</think>` puede filtrarse en la respuesta.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; acceder a él cuando no existe lanza `AttributeError`.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Cobertura lingüística limitada a seis idiomas; no se garantiza calidad fuera de ellos.
- Longitud de contexto no especificada, lo que impide planificar despliegues con requisitos de contexto largo.
- La licencia K-EXAONE AI Model License es de tipo "other"; es necesario revisar sus términos antes de uso comercial, ya que puede incluir restricciones adicionales.
- El despliegue en hardware FuriosaAI RNGD requiere el bundle FXB y el motor Furiosa-LLM; no es portable a otras plataformas sin los pesos NVFP4A16.
- No se proporcionan cifras de latencia ni throughput, lo que dificulta estimar costes operativos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/K-EXAONE-236B-A23B-NVFP4A16
- Modelo base: https://huggingface.co/LGAI-EXAONE/K-EXAONE-236B-A23B
- Licencia K-EXAONE: https://huggingface.co/LGAI-EXAONE/K-EXAONE-236B-A23B/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
