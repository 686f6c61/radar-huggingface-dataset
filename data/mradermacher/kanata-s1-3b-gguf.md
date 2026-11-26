# mradermacher/Kanata-S1-3B-GGUF

## Resumen

Kanata-S1-3B-GGUF es la version cuantizada en formato GGUF del modelo Kanata-S1-3B, desarrollado originalmente por K-Ai-Official y empaquetado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 3.400 millones de parametros (3.402.836.480 segun los pesos en safetensors) orientado a tareas de generacion de codigo, uso como agente y tool calling, segun las etiquetas declaradas en el repositorio. La licencia es Apache 2.0, lo que facilita su uso comercial y su integracion en productos.

El modelo base fue afinado mediante QLoRA (etiqueta `qlora`) sobre un conjunto de datos que combina varios corpus: K-Ai-Official/Kai_v3, NousResearch/hermes-function-calling-v1, teknium/OpenHermes-2.5, NekoFi/alpaca-gpt4-indonesia-cleaned y llm-jp/magpie-sft-v1.0. Esta mezcla sugiere un enfasis en instrucciones generales, function calling y datos en indonesio y japones, ademas de ingles. La arquitectura declarada en las etiquetas incluye `granite`, lo que apunta a una base derivada de la familia IBM Granite.

La relevancia de esta ficha radica en que ofrece un modelo compacto de 3B parametros en multiples cuantizaciones GGUF (desde Q2_K de 1,5 GB hasta f16 de 6,9 GB), lo que permite desplegarlo en hardware de consumo y en entornos con recursos limitados. No obstante, la informacion publicada sobre arquitectura detallada, contexto y benchmarks es escasa, por lo que muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `granite`; detalles no disponibles) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (y variantes i1 con imatrix en repositorio separado) |
| Idiomas soportados | indonesio (id), japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base Kanata-S1-3B emplea una arquitectura de tipo transformer con la etiqueta `granite`, lo que sugiere una derivacion de la familia IBM Granite, aunque no se detallan capas, dimensiones ocultas, mecanismo de atencion ni estrategia de posicionamiento. El proceso de ajuste se realizo mediante QLoRA, una tecnica de fine-tuning eficiente en parametros que cuantiza el modelo base y entrena adaptadores de bajo rango, lo que reduce los requisitos de memoria durante el entrenamiento.

El conjunto de datos de entrenamiento combina cinco fuentes: K-Ai-Official/Kai_v3 (probablemente corpus propio del autor), NousResearch/hermes-function-calling-v1 (orientado a function calling), teknium/OpenHermes-2.5 (instrucciones generales), NekoFi/alpaca-gpt4-indonesia-cleaned (instrucciones en indonesio) y llm-jp/magpie-sft-v1.0 (instrucciones en japones). No se especifica el numero total de tokens de entrenamiento, la composicion exacta por idioma, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto e instrucciones generales, segun el uso de OpenHermes-2.5 y magpie-sft en el entrenamiento.
- Generacion de codigo, reflejada en la etiqueta `code`.
- Tool calling y function calling, respaldado por el dataset hermes-function-calling-v1 y las etiquetas `tool-calling` y `agent`.
- Uso como agente en flujos multi-paso, segun la etiqueta `agent`.
- Capacidades multilingues en indonesio, japones e ingles.
- No se dispone de informacion sobre vision, audio, modo thinking ni otras capacidades especiales.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o CLI para autocompletar y explicar fragmentos de codigo, aprovechando su tamano de 3B y las cuantizaciones Q4_K_M (2,2 GB) que caben en GPU de consumo.
- Automatizacion de tool calling: al haber sido afinado con hermes-function-calling-v1, puede emplearse para seleccionar funciones y generar argumentos en pipelines de agentes, por ejemplo para consultar APIs o bases de datos.
- Agentes multi-paso ligeros: su etiqueta `agent` permite usarlo en orquestadores que requieran un modelo pequeno para decidir el siguiente paso, con bajo coste de inferencia.
- Atencion al cliente en indonesio o japones: la inclusion de corpus especificos en estos idiomas lo hace adecuado para respuestas automatizadas en mercados de Indonesia y Japon, aunque sin datos de contexto no se puede garantizar conversaciones de contexto largo.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q2_K (1,5 GB) y Q3_K_S (1,7 GB) permiten ejecutarlo en portatiles o CPUs con llama.cpp u Ollama.
- Generacion de codigo en CI/CD: puede utilizarse para generar tests, documentacion o parches en pipelines automatizados, con la ventaja de su licencia Apache 2.0 para uso comercial.
- Educacion y experimentacion: su tamano y licencia permiten usarlo en cursos y laboratorios para estudiar fine-tuning, cuantizacion y evaluacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,0 GB en Q2_K/Q3_K_S, 2,1-2,2 GB en Q4_K_S/Q4_K_M, 2,5 GB en Q5, 2,9 GB en Q6_K, 3,7 GB en Q8_0 y 6,9 GB en f16 (tamanos de archivo, que sirven como cota inferior de memoria).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores con cuantizaciones Q4-Q6.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kanata-S1-3B-GGUF | 3,4B | no disponible | Apache 2.0 | GGUF | Multilingue id/ja/en, tool calling |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue amplio, buena base para agentes |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Restricciones de licencia para uso comercial |
| Granite-3.1-2B-Instruct | 2,5B | 128.000 tokens (segun documentacion publica de IBM) | Apache 2.0 | safetensors, GGUF | Base Granite, orientado a empresa |

Nota: los datos de contexto y parametros de los modelos comparativos provienen de documentacion publica general; no se dispone de comparaciones de rendimiento con Kanata-S1-3B.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; al entrenarse con corpus en indonesio, japones e ingles, puede presentar sesgos culturales o linguisticos de esas fuentes.
- Riesgo de alucinacion inherente a modelos de 3B parametros, especialmente en tareas de razonamiento complejo o datos factuales.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones de contexto largo.
- Idiomas soportados limitados a indonesio, japones e ingles; el rendimiento en castellano no esta documentado.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los datasets de entrenamiento (por ejemplo, OpenHermes-2.5 y hermes-function-calling-v1) antes de un uso comercial a gran escala.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- No hay informacion sobre el proceso de alineacion (RLHF/DPO), por lo que el comportamiento en temas sensibles es incierto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kanata-S1-3B-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/Kanata-S1-3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Kanata-S1-3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Kanata-S1-3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
