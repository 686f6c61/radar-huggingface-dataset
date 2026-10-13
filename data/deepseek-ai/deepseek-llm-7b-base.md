# deepseek-ai/deepseek-llm-7b-base

## Resumen

DeepSeek LLM 7B Base es un modelo de lenguaje de 7.000 millones de parametros desarrollado por DeepSeek AI y publicado en noviembre de 2023. Se trata de un modelo base (no afinado para instrucciones) entrenado desde cero sobre un corpus de 2 billones de tokens en ingles y chino. Su arquitectura es un transformer decoder-only con atencion multi-cabeza (MHA), sin mezcla de expertos, lo que lo situa en la categoria de modelos densos de 7B.

El modelo se distribuye bajo la DeepSeek License, que permite uso comercial, y esta pensado para la comunidad investigadora y para desarrolladores que quieran partir de un checkpoint base solido para fine-tuning. Su principal valor radica en el entrenamiento multilingue ingles-chino con un volumen de datos elevado para su tamano, algo poco habitual en modelos abiertos de 7B de finales de 2023.

Es relevante ahora porque forma parte de la primera generacion de modelos abiertos de DeepSeek, que mas tarde evoluciono hacia arquitecturas MoE y modelos de razonamiento. Para quien necesite un base model denso, con licencia permisiva para uso comercial y buen soporte de chino, sigue siendo una opcion de referencia para experimentacion y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-Head Attention (MHA) |
| Parametros totales | 7.000 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y chino |
| Licencia | DeepSeek License (license: other, license_name: deepseek); permite uso comercial |
| Formato de pesos | PyTorch (transformers); formato exacto no especificado, repositorio de 27,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con atencion multi-cabeza (MHA) estandar, sin mecanismos de atencion lineal, sin mezcla de expertos (MoE) ni componentes de espacio de estados (SSM). El entrenamiento se realizo desde cero sobre un conjunto de 2 billones de tokens que combina texto en ingles y en chino. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion, lo cual es coherente con que se trate de un modelo base y no de una version chat.

La model card destaca explicitamente que el entrenamiento fue "from scratch" y que el modelo se publica junto con las versiones chat (7B y 67B) para fomentar la investigacion. No se detalla la composicion exacta del dataset ni el reparto proporcional entre ingles y chino. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion con ventana deslizante.

## Capacidades

- Generacion de texto y continuacion de secuencias (text completion) en ingles y chino.
- Modelo base: no sigue instrucciones de forma nativa; requiere fine-tuning supervisado o el uso de la version chat para tareas conversacionales.
- Capacidad multilingue limitada a ingles y chino; el rendimiento en otros idiomas no esta documentado.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta soporte de vision, audio ni modalidades adicionales.
- No se documenta un modo de razonamiento explicito (thinking mode).
- Apto como punto de partida para fine-tuning en dominios especificos gracias a su naturaleza de modelo base.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base, se puede ajustar con datasets propios de legal, sanitario o financiero para crear asistentes especializados en ingles o chino.
- Generacion de texto y autocompletado: integrable en editores o herramientas de redaccion para completar parrafos en ingles y chino, usando la API de transformers mostrada en la model card.
- Investigacion en procesamiento de lenguaje natural: util para estudiar sesgos, comportamientos de modelos densos de 7B y tecnicas de alineacion, dado que es un checkpoint abierto y reproducible.
- Traduccion automatica ingles-chino: tras un fine-tuning con corpus paralelos, puede emplearse como motor de traduccion en pipelines internos.
- Resumen de documentos: con ajuste supervisado, puede resumir articulos o informes en ingles y chino, aprovechando su entrenamiento en ambos idiomas.
- Desarrollo de chatbots: partiendo del modelo base y aplicando SFT, se pueden construir asistentes conversacionales; tambien se puede usar directamente la version chat publicada por el mismo autor.
- Extraccion de informacion estructurada: mediante fine-tuning, puede transformar texto no estructurado en campos concretos (por ejemplo, entidades o fechas) para procesos de automatizacion documental.
- Educacion y asistencia a la escritura: generacion de borradores y sugerencias de estilo en entornos academicos o profesionales, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones estandar para un modelo denso de 7B):
  - Precision fp16/bf16: aproximadamente 14-15 GB de VRAM.
  - Cuantizacion int8: aproximadamente 7-8 GB de VRAM.
  - Cuantizacion de 4 bits: aproximadamente 4-5 GB de VRAM.
- GPU recomendadas: A100 40 GB, H100 o cualquier GPU con 16 GB o mas para fp16. Para cuantizacion en 4 bits, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB de VRAM aplicando cuantizacion (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). En fp16 nativo requiere al menos 16 GB, por lo que una RTX 4080/4090 de 16-24 GB es adecuada.
- Opciones de despliegue: transformers (soporte oficial mostrado en la model card), text-generation-inference (el repositorio incluye la etiqueta endpoints_compatible y text-generation-inference), y previsiblemente vLLM dada su arquitectura tipo Llama, aunque esto no se confirma en la informacion disponible. Para llama.cpp u Ollama se necesitarian pesos en formato GGUF, no confirmados en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso comercial |
|---|---|---|---|---|---|
| DeepSeek LLM 7B Base | 7.000 millones | No disponible | Ingles y chino | DeepSeek License | Si |
| Llama 2 7B | 7.000 millones | 4.096 tokens | Principalmente ingles | Llama 2 Community License | Si, con restricciones |
| Mistral 7B | 7.300 millones | 8.192 tokens | Principalmente ingles | Apache 2.0 | Si |
| Qwen 7B | 7.000 millones | 8.192 tokens | Ingles y chino | Tongyi Qianwen License | Si, con condiciones |

Los datos de los modelos comparados provienen de sus fichas publicas. DeepSeek LLM 7B Base destaca por su entrenamiento explicito en chino y por una licencia propia que permite uso comercial, aunque carece de datos de contexto y benchmarks en la informacion disponible, lo que dificulta una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Al ser un modelo base, no sigue instrucciones ni mantiene conversaciones coherentes sin fine-tuning previo o sin recurrir a la version chat.
- Riesgo de alucinacion: puede generar afirmaciones falsas o inventadas, especialmente en tareas factuales.
- Sesgos conocidos: al entrenarse con datos web en ingles y chino, puede reproducir sesgos culturales, de genero y estereotipos presentes en esas fuentes.
- Limitacion idiomatica: fuera del ingles y el chino, el rendimiento no esta documentado y previsiblemente sera bajo.
- Longitud de contexto no especificada en la informacion disponible; conviene verificarla en la configuracion del repositorio antes de usarla en produccion.
- Restricciones de licencia: aunque permite uso comercial, la DeepSeek License es una licencia propia; es necesario revisar el archivo LICENSE-MODEL para conocer condiciones exactas (atribucion, restricciones de reventa, etc.).
- No hay benchmarks publicados en la informacion proporcionada, por lo que se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo.
- Modelo de noviembre de 2023: ha sido superado por generaciones posteriores de modelos abiertos en razonamiento, codigo y seguimiento de instrucciones.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/deepseek-llm-7b-base
- Repositorio GitHub: https://github.com/deepseek-ai/deepseek-LLM
- Pagina principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Licencia del modelo (LICENSE-MODEL): https://github.com/deepseek-ai/deepseek-LLM/blob/main/LICENSE-MODEL
- Discord de DeepSeek: https://discord.gg/Tc7c45Zzu5
- Entrada de Wikipedia sobre DeepSeek: https://fr.wikipedia.org/wiki/DeepSeek
