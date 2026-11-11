# SadikNawazAI/sadik-ai-model

## Resumen

SADIK AI es un modelo de lenguaje conversacional publicado en Hugging Face por el usuario SadikNawazAI. Segun la model card, se trata de un derivado del modelo base Qwen3.5:4b, distribuido principalmente en formato GGUF con cuantizacion Q4_K_M y empaquetado con herramientas de despliegue (Ollama, Docker, servidor compatible con la API de OpenAI, cuaderno de Colab). El repositorio tiene un tamano de 2,6 GB y registra 4.205.751.296 parametros en pesos safetensors, lo que encaja con un modelo denso de aproximadamente 4.200 millones de parametros.

El modelo se presenta como un asistente multilingue orientado a conversacion, con soporte declarado para ingles, hindi, hinglish, japones, chino y aleman, y una ventana de contexto de 4096 tokens segun la propia model card. Su propuesta de valor no es tanto tecnica como de accesibilidad: el autor ofrece multiples vias de ejecucion local (Ollama, LM Studio, Jan.ai, GPT4All, Docker con Open WebUI) y una API compatible con OpenAI para integrarlo en herramientas de desarrollo.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion: no se han publicado resultados de benchmarks, la licencia aparece como "no disponible" en los metadatos de Hugging Face aunque la model card menciona Apache 2.0, y no hay documentacion sobre el proceso de entrenamiento o ajuste. Se trata, por tanto, de un artefacto de despliegue mas que de un modelo con contribuciones tecnicas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5:4b, segun la model card) |
| Parametros totales | 4.205.751.296 (pesos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (2,5 GB); pesos safetensors completos en el repo |
| Idiomas soportados | Ingles, hindi, hinglish, japones, chino, aleman (segun model card) |
| Licencia | no disponible en metadatos; la model card indica Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo deriva de Qwen3.5:4b, un transformer denso de aproximadamente 4.200 millones de parametros. No se especifica si se trata de un ajuste fino (fine-tuning), de una destilacion o de una simple reempaquetadura del modelo base en formato GGUF. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

Tampoco se describen innovaciones tecnicas propias: no hay mencion a decodificacion especulativa, atencion lineal, mezcla de expertos ni modulos multimodales. El unico elemento diferencial documentado es el empaquetado: un `Modelfile` para Ollama, un `Dockerfile` y `docker-compose.yml` con Open WebUI, un `api_server.py` que expone una API compatible con OpenAI y un cuaderno de Google Colab. La temperatura recomendada por el autor es 0,7.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas declarados (ingles, hindi, hinglish, japones, chino, aleman).
- Respuesta a preguntas de identidad y conversacion general ("Who are you?", "Aap kaun ho bhai?").
- Despliegue local mediante Ollama, LM Studio, Jan.ai, GPT4All y Docker.
- Exposicion de una API compatible con OpenAI (`/v1/chat/completions`) a traves de `api_server.py`, integrable en VS Code, Cursor, SillyTavern y clientes similares.
- Ejecucion en Google Colab mediante cuaderno incluido.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede ejecutarse en una maquina de sobremesa mediante Ollama o LM Studio con el archivo GGUF Q4_K_M de 2,5 GB, sin enviar datos a servicios externos. Adecuado para prototipos de chat privados.
- Integracion en entornos de desarrollo con API compatible con OpenAI: gracias a `api_server.py`, puede configurarse como backend local en VS Code o Cursor para autocompletado y chat de codigo basico, aunque sin garantias de calidad en tareas complejas de programacion.
- Despliegue en contenedores para demos: el `docker-compose.yml` levanta Ollama y Open WebUI en `localhost:3000`, lo que permite montar una interfaz de chat funcional en minutos para demostraciones o entornos de prueba.
- Pruebas de concepto multilingues: con contexto de 4096 tokens y soporte declarado de seis idiomas, sirve para validar flujos de atencion al cliente en hindi, hinglish o japones antes de invertir en modelos mayores.
- Educacion y experimentacion: el modelo esta pensado por su autor (un estudiante de 11 anos) como ejemplo didactico de publicacion y despliegue de un modelo en Hugging Face, util para talleres introductorios de IA.
- Chat de personaje o rol en clientes tipo SillyTavern: la API compatible con OpenAI y la temperatura recomendada de 0,7 permiten usarlo como backend conversacional en este tipo de frontends.
- Ejecucion en Google Colab con GPU gratuita: el cuaderno incluido facilita probar el modelo sin hardware propio, util para evaluaciones rapidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizacion Q4_K_M (archivo de 2,5 GB mas overhead de contexto y cache KV); en torno a 8-9 GB para pesos safetensors en FP16 (4.200 millones de parametros).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para FP16 se recomienda RTX 3090/4090 o superiores. En entornos profesionales, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM usando GGUF Q4_K_M; tambien puede ejecutarse en CPU con llama.cpp u Ollama, a menor velocidad.
- Opciones de despliegue: Ollama (`ollama run hf.co/SadikNawazAI/sadik-ai-model`), llama.cpp, LM Studio, Jan.ai, GPT4All, Docker con Open WebUI, servidor FastAPI compatible con OpenAI incluido en el repo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SADIK AI | 4.200 M | 4096 | no disponible (model card: Apache 2.0) | Hugging Face, GGUF + safetensors | Sin benchmarks publicados |
| Qwen2.5-3B / Qwen3-4B (familia Qwen) | 3.000-4.000 M | 32.768 o superior segun version | Apache 2.0 | Hugging Face, GGUF, Ollama | Modelo base de referencia; benchmarks publicados por el autor original |
| Llama 3.2 3B | 3.200 M | 131.072 | Llama 3.2 Community License | Hugging Face, GGUF, Ollama | Benchmarks publicados; restricciones de licencia para grandes volumenes |
| Phi-3.5-mini | 3.800 M | 131.072 | MIT | Hugging Face, GGUF, Ollama | Benchmarks publicados; orientado a razonamiento y codigo |

La comparacion se limita a datos publicos de cada familia; no se dispone de evaluaciones directas de SADIK AI frente a estos modelos. El contexto de 4096 tokens es notablemente inferior al de las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad en razonamiento, codigo, matematicas o multilingue.
- Proceso de entrenamiento no documentado: se desconoce si hubo ajuste fino, que datos se usaron y si se aplicaron filtros de seguridad o alineacion.
- Ambiguedad de licencia: los metadatos de Hugging Face indican "no disponible", mientras que la model card afirma Apache 2.0. Antes de un uso comercial debe aclararse esta discrepancia con el autor.
- Ventana de contexto reducida (4096 tokens) en comparacion con modelos actuales de tamano similar, lo que limita conversaciones largas y tareas de recuperacion aumentada.
- Riesgo de alucinacion no evaluado: al no haber evaluaciones publicadas, no puede descartarse un comportamiento propenso a inventar informacion.
- Idiomas declarados sin validacion: el soporte de hindi, hinglish, japones, chino y aleman proviene unicamente de la model card, sin pruebas independientes.
- Sin soporte documentado de tool calling, agentes o vision, lo que restringe su uso en pipelines automatizados complejos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad ni retroalimentacion que permita evaluar su robustez en produccion.
- Modelo de autoria individual y sin mantenimiento documentado; la fecha de creacion (2026-11-11) y actualizacion (2026-11-11) sugieren un artefacto reciente y sin historial de versiones.

## Enlaces

- Hugging Face: https://huggingface.co/SadikNawazAI/sadik-ai-model
- Ollama: https://ollama.com
- Docker: https://docker.com
- LM Studio: https://lmstudio.ai
- Jan.ai: https://jan.ai
- GPT4All: https://gpt4all.io
- Cuaderno de Colab (referenciado en la model card): https://colab.research.google.com/github/SadikNawazAI/sadik-ai-model/blob/main/SADIK_AI_Colab.ipynb
- Open WebUI (usado en el docker-compose): no se proporciona enlace directo en la informacion disponible
