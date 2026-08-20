# Sanio7791/gemma-4-31B-it-uncensored-heretic

## Resumen

Este modelo es una version "decensored" (desensibilizada) del modelo oficial Google Gemma 4 31B IT, creada por el usuario independiente Sanio7791. El objetivo es reducir drasticamente el numero de rechazos y respuestas evasivas del modelo original, pasando de 99 rechazos por cada 100 peticiones a solo 10, manteniendo una divergencia KL de 0.0541 respecto al original, lo que indica una alteracion minima del comportamiento general.

Para lograrlo, el autor ha aplicado la tecnica de abliteracion "Heretic" v1.2.0 con el metodo de Ablacion de Rango Arbitrario (ARA), que elimina selectivamente las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. El modelo mantiene la arquitectura multimodal de Gemma 4 (procesa imagenes y texto) y hereda el contexto de 262.144 tokens del original, lo que lo hace util para tareas de generacion de texto, vision y razonamiento con contexto largo.

Es relevante ahora porque ofrece una alternativa al modelo oficial para casos de uso donde se necesita una generacion de texto sin filtros ni moralizaciones, como la escritura creativa, el roleplay o la investigacion de temas sensibles. La licencia Apache 2.0 permite uso comercial y modificacion, aunque se recomienda revisar la licencia original de Gemma 4 para cumplir con sus clausulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basada en Gemma 4 31B IT |
| Parametros totales | 31.273.086.512 (31.3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc., disponibles en repos derivados) |
| Idiomas soportados | no disponible (se espera multilingue, pero no se especifica) |
| Licencia | Apache 2.0 (con clausulas adicionales de la licencia de Gemma 4) |
| Formato de pesos | safetensors (repo principal), GGUF (repos derivados) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo oficial Google Gemma 4 31B IT, que es un modelo multimodal de 31.3B parametros con arquitectura Transformer. El proceso de ajuste no modifica los pesos de forma convencional, sino que aplica la tecnica **abliteration** mediante la herramienta Heretic v1.2.0. Esta herramienta localiza las direcciones en el espacio de activaciones que correlacionan con comportamientos de rechazo y las elimina mediante una ablacion de rango arbitrario (ARA), lo que permite un control fino sobre las capas afectadas.

Los parametros de abliteration se especifican en la model card: se intervienen las capas de 30 a 48, se aplica un peso de preservacion de buen comportamiento de 0.5437, un peso de direccion de mal comportamiento de 0.0005, un peso de sobrecorreccion de 0.9949 y se consideran 15 vecinos para el calculo. Se modifica especificamente el componente `attn.o_proj` de la atencion. El resultado es un modelo con un 90% menos de rechazos, manteniendo una divergencia KL de 0.0541 respecto al original, lo que indica que el comportamiento general (capacidades, conocimientos) permanece practicamente intacto.

## Capacidades

- Generacion de texto y vision: al ser un modelo multimodal (image-text-to-text), puede procesar imagenes y responder con texto, aunque la informacion proporcionada no detalla capacidades especificas de vision mas alla de la etiqueta.
- Razonamiento y conocimiento general: hereda las capacidades del modelo Gemma 4 31B IT, que obtiene un 86.5% de exactitud en MMLU (segun pruebas del autor).
- Reduccion de rechazos: es el objetivo principal del modelo. Responde a peticiones que el modelo original rechazaria, como temas controvertidos, contenido para adultos o preguntas con sesgo.
- Conversacion de contexto largo: con 262.144 tokens de contexto, puede mantener conversaciones de multiples turnos y analizar documentos extensos o codigo completo.
- Capacidad de tool calling y agentes: no se especifica en la informacion proporcionada, pero se hereda de la base Gemma 4 IT, que la incluye (segun la documentacion oficial de Gemma 4).
- Multilingue: no se proporciona la lista de idiomas, pero Gemma 4 soporta multiples idiomas; se recomienda consultar la documentacion oficial.

## Casos de uso

- **Escritura creativa sin censura**: el modelo puede generar narrativa, poesia o guiones sin autocensurarse, util para autores que trabajan temas oscuros, violencia o contenido para adultos. Su contexto largo permite mantener coherencia en novelas o series de capitulos.
- **Roleplay y juegos de rol**: su capacidad para mantener personajes y dialogos coherentes a lo largo de 262K tokens lo hace adecuado para juegos de rol de texto en los que el usuario interpreta un personaje y el modelo responde sin rechazar escenarios complejos o de contenido adulto.
- **Analisis de documentos extensos**: con su contexto de 262.144 tokens, puede resumir o extraer informacion de libros completos, contratos o informes tecnicos sin necesidad de trocear el texto.
- **Asistencia en investigacion academica**: puede debatir temas eticos, filosoficos o sociales controvertidos sin rechazos, ofreciendo argumentos desde perspectivas no limitadas por politicas de seguridad, util para explorar casos limite.
- **Desarrollo de contenido para nichos especificos**: creadores de contenido para publico adulto, escritores de ficcion especulativa o periodistas que investigan temas tabu pueden generar borradores sin restricciones de seguridad.
- **Ajuste para productos comerciales**: al tener licencia Apache 2.0, se puede integrar en aplicaciones comerciales, siempre que se cumplan las clausulas de la licencia de Gemma 4 (por ejemplo, el uso de la marca). Puede servir como base para un asistente de escritura o un chatbot personalizado.

## Benchmarks y rendimiento

El autor ha publicado resultados de MMLU (Massive Multitask Language Understanding) comparando el modelo original y el modelo decensored:

| Metrica | Modelo original (Gemma 4 31B IT) | Modelo decensored (Heretic) |
|---|---|---|
| Exactitud total (MMLU) | 86.50% | 85.90% |
| Preguntas correctas | 6073 / 7021 | 6031 / 7021 |
| Errores de parseo | 52 | 37 |

La diferencia es de 0.6 puntos porcentuales, lo que indica que la abliteration apenas degrada el rendimiento general. No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) en la informacion proporcionada. La divergencia KL de 0.0541 confirma que la distribucion de salidas es muy similar al original.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 31.3B parametros. En cuantizacion Q4_K_M, se necesitan aproximadamente **20.39 GB de VRAM** (segun llmrun.dev). En precision completa (fp16) se necesitarian alrededor de 62.6 GB, lo que requiere una GPU de nivel profesional.
- **GPU recomendadas**:
  - Para Q4_K_M: RTX 4090 (24 GB), A100 40GB, A6000 (48 GB), o multiples GPUs.
  - Para fp16: A100 80GB, H100 80GB, o configuraciones multi-GPU.
- **Consumer GPU**: si, en cuantizacion Q4_K_M cabe en una RTX 4090 (24 GB). Tambien se puede ejecutar en Macs con suficiente RAM unificada (64 GB o mas).
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), y cualquier framework compatible con safetensors o GGUF.
- **Latencia y throughput**: no disponible. Dependera del hardware, cuantizacion y backend. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/segundo, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento MMLU | Decensored |
|---|---|---|---|---|---|
| **Gemma 4 31B IT (original)** | 31.3B | 262.144 | Gemma license | 86.50% | No |
| **Gemma 4 31B IT uncensored (este modelo)** | 31.3B | 262.144 | Apache 2.0 | 85.90% | Si |
| **Llama 3.1 8B Instruct** | 8B | 128K | Llama license | ~68.4% (MMLU) | No (existe versiones abliterated, pero no oficiales) |
| **Mistral Large 2** | 123B | 128K | Mistral Research License | ~84.8% (MMLU) | No |

Nota: los datos de Llama 3.1 y Mistral Large 2 son aproximados y de referencia; no se han verificado en esta ficha. La comparativa directa mas relevante es con el modelo original de Gemma 4, ya que este es una derivacion directa.

## Limitaciones y advertencias

- **Riesgo de contenido nocivo**: al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No se recomienda su uso en aplicaciones publicas o sin supervision humana.
- **Sesgos y alucinaciones**: no se han evaluado los sesgos especificos de esta version, pero hereda los sesgos del modelo original. La abliteration no corrige sesgos de genero, raza o religion; puede amplificar ciertos sesgos al no rechazar peticiones que refuercen estereotipos.
- **Calidad de la abliteration**: aunque la KL divergence es baja, la intervencion en 18 capas puede producir comportamientos impredecibles en ciertos contextos. Se recomienda probar en un entorno aislado antes de desplegar.
- **Licencia**: la licencia Apache 2.0 no cubre el uso de la marca "Gemma" ni sus clausulas de uso aceptable de la licencia original de Google. Revisar el [acuerdo de licencia de Gemma](https://ai.google.dev/gemma/docs/gemma_4_license) para cumplir con las restricciones de uso.
- **Soporte y mantenimiento**: es un modelo creado por un contribuidor independiente, sin soporte de Google. Puede contener bugs o errores no documentados. El autor solicita apoyo economico via Patreon/Ko-fi para continuar el trabajo.
- **Contexto de vision**: aunque la etiqueta es `image-text-to-text`, no se han publicado pruebas de que la abliteration no haya afectado la parte visual. Se recomienda validar el procesamiento de imagenes antes de usarlo en tareas multimodales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sanio7791/gemma-4-31B-it-uncensored-heretic)
- [Modelo original de Google](https://huggingface.co/google/gemma-4-31B-it)
- [Herramienta Heretic](https://github.com/p-e-w/heretic) y [PR de ARA](https://github.com/p-e-w/heretic/pull/211)
- [Repos GGUF derivados](https://huggingface.co/okanity/gemma-4-31B-it-uncensored-heretic-GGUF) y [lactroiii/gemma-4-31B-it-uncensored-heretic-GGUF](https://huggingface.co/lactroiii/gemma-4-31B-it-uncensored-heretic-GGUF)
- [Requisitos de hardware (llmrun.dev)](https://llmrun.dev/model/llmfan46-gemma-4-31b-it-uncensored-heretic)
- [Pagina de referencia local-ai-zone](https://local-ai-zone.github.io/models/gemma-4-31b-it-uncensored-heretic.html)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
