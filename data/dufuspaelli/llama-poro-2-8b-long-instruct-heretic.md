# dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic

## Resumen

Llama-Poro-2-8B-Long-Instruct-heretic es una versión "decensored" (abliterada) del modelo LumiOpen/Llama-Poro-2-8B-Long-Instruct, creada por el usuario dufuspaelli mediante la herramienta Heretic v1.4.0. El modelo original, desarrollado por LumiOpen, es un chatbot de instrucciones en inglés y finlandés con soporte de contexto extendido de hasta 128K tokens, basado en la familia Poro 2 (que a su vez deriva de una arquitectura Llama 3.3 de 8B parámetros). La versión heretic elimina los mecanismos de rechazo (refusals) del modelo original, reduciendo la tasa de rechazos de 87/100 a 5/100, manteniendo una divergencia KL de 0.0121 respecto al original, lo que indica que el comportamiento general apenas se altera.

Este modelo resulta relevante para desarrolladores e investigadores que necesitan un modelo de 8B parámetros con contexto largo, bilingüe (inglés-finlandés) y sin restricciones de censura para tareas de generación de texto libre, experimentación con jailbreaks o aplicaciones donde se requiera una respuesta sin filtros. Al ser reproducible (el repositorio incluye instrucciones de reproducción) y estar basado en un modelo con licencia Llama 3.3, ofrece un punto de partida interesante para proyectos que requieran control sobre el comportamiento de rechazo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.3 (8B, derivada de Poro 2) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | inglés (en), finlandés (fi) |
| Licencia | llama3.3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Poro 2 8B Long Instruct se construyó mediante fine-tuning supervisado (SFT) del checkpoint Poro 2 Long Base, que a su vez fue extendido en contexto mediante continued pretraining (CPT) con datasets como finepdfs-edu, finemath y starcoderdata. El SFT se realizó con el dataset LumiOpen/poro2-instruction-collection, empaquetando muestras con una longitud de secuencia de 32.768 tokens, 2 épocas, batch global de 64, learning rate 2e-5 y scheduler cosine_with_min_lr. Tras el SFT, se fusionó el checkpoint con el modelo base usando MergeKit con pesos 0.8 (SFT) y 0.2 (base) para recuperar el rendimiento en contexto largo. No se aplicó DPO.

La versión heretic aplica una técnica de abliteration (eliminación de direcciones de rechazo) mediante Heretic v1.4.0, que modifica los pesos de las proyecciones de atención (o_proj) y MLP (down_proj) para eliminar la activación de respuestas de rechazo. Los parámetros de abliteration (direction_index 13.18, max_weight 1.37 en o_proj, etc.) se documentan en la model card. El resultado es un modelo con una tasa de rechazos de 5/100 frente a 87/100 del original, con una divergencia KL de 0.0121, lo que sugiere una alteración mínima del comportamiento general.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés y finlandés.
- Soporte de contexto largo de hasta 128K tokens, útil para documentos extensos o conversaciones multi-turno.
- Respuestas sin censura: el modelo no rechaza peticiones que el original sí rechazaría (por ejemplo, contenido sensible o controvertido).
- Capacidad de razonamiento matemático básico heredada del entrenamiento con datasets como finemath.
- No se documenta soporte explícito de tool calling, function calling ni modo agente.
- No se documentan capacidades multimodales (solo texto).

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, diálogos o guiones que aborden temas tabú o controvertidos sin autorechazos, útil para escritores que necesitan explorar ideas sin filtros.
- Investigación sobre alineación y censura: permite estudiar el efecto de la abliteration en el comportamiento de un modelo Llama 3.3 de 8B, comparando respuestas antes y después de la eliminación de rechazos.
- Procesamiento de documentos largos en finlandés: gracias a su ventana de 128K tokens, puede resumir o extraer información de informes, actas o literatura finlandesa extensa.
- Chatbots de nicho para comunidades finlandesas: un asistente conversacional bilingüe que no rechaza preguntas sobre temas delicados (salud mental, sexualidad, política) y que mantiene fluidez en finés.
- Experimentación con jailbreaks y red teaming: los investigadores de seguridad pueden usar este modelo como caso de estudio para evaluar cómo la abliteration afecta a la resistencia a ataques adversariales.
- Fine-tuning posterior: al ser un modelo abierto y reproducible, sirve como base para ajustes adicionales en dominios específicos donde se requiera ausencia de censura, como generación de ficción adulta o sátira política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta dos métricas comparativas frente al modelo original:

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| Divergencia KL | 0.0121 | 0 (por definicion) |
| Tasa de rechazos (refusals) | 5/100 | 87/100 |

Estos datos indican que la abliteration reduce drásticamente los rechazos manteniendo una distribución de salida muy similar a la original, pero no proporcionan información sobre calidad de generación, razonamiento o código.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8B parámetros × 2 bytes), por lo que cabe en GPUs de consumo como RTX 4080/4090 (16-24 GB) o en GPUs profesionales como A10G o L4.
- Para cuantización INT8 o FP8, la VRAM se reduce a unos 8-10 GB, permitiendo ejecución en RTX 3080/3090 o incluso en GPUs con 8 GB si se usa cuantización de 4 bits (GGUF, aunque no se proporcionan pesos en ese formato).
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), o ejecutarse localmente con llama.cpp si se convierte a GGUF. También es compatible con endpoints de Hugging Face.
- Latencia y throughput estimados: no se dispone de datos publicados. Para un modelo de 8B en una GPU A100, se puede esperar un throughput de 50-100 tokens/s en generación, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Censura |
|---|---|---|---|---|---|
| Llama-Poro-2-8B-Long-Instruct-heretic | 8,03B | 128K | en, fi | llama3.3 | Sin rechazos (abliterado) |
| LumiOpen/Llama-Poro-2-8B-Long-Instruct (original) | 8,03B | 128K | en, fi | llama3.3 | Con rechazos (87/100) |
| Llama 3.1 8B Instruct | 8,03B | 128K | multilingue (8 idiomas) | llama3.1 | Con rechazos estándar |

La comparativa se limita a características generales, ya que no hay benchmarks disponibles para el modelo heretic. Frente al original, la única diferencia relevante es la tasa de rechazos. Frente a Llama 3.1 8B, el modelo heretic ofrece bilingüismo finlandés-inglés (Llama 3.1 no incluye finlandés) y ausencia de censura, pero carece del soporte multilingüe amplio de Llama 3.1.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza que el modelo genere contenido veraz o seguro; puede producir alucinaciones, información errónea o contenido ofensivo sin filtro.
- El modelo conserva los sesgos presentes en los datos de entrenamiento originales (Poro 2, basado en datasets como finepdfs-edu, finemath y starcoderdata), que pueden reflejar prejuicios culturales o lingüísticos.
- La licencia llama3.3 permite uso comercial, pero es recomendable revisar los términos exactos de la licencia Llama 3.3 para verificar restricciones específicas (por ejemplo, límites de usuarios mensuales o requisitos de atribución).
- El modelo solo soporta inglés y finlandés; no es adecuado para otros idiomas.
- No se proporcionan pesos cuantizados (GGUF, AWQ, etc.), por lo que el despliegue en hardware limitado requiere conversión manual.
- La reproducibilidad declarada se refiere al proceso de abliteration, no al entrenamiento completo del modelo base; el usuario debe confiar en los checkpoints publicados por LumiOpen.
- Al ser un modelo "uncensored", su uso en aplicaciones públicas puede plantear riesgos legales o éticos, especialmente en jurisdicciones con regulaciones sobre contenido generado.

## Enlaces

- Modelo heretic en Hugging Face: https://huggingface.co/dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic
- Modelo original (LumiOpen/Llama-Poro-2-8B-Long-Instruct): https://huggingface.co/LumiOpen/Llama-Poro-2-Long-Instruct
- Proyecto Heretic: https://heretic-project.org
- Dataset de instrucciones Poro 2: https://huggingface.co/datasets/LumiOpen/poro2-instruction-collection
- Playbook de extensión de contexto y RL de AMD (referencia del entrenamiento): https://rocm.blogs.amd.com/artificial-intelligence/rl-training-playbook/README.html
- Repositorio MergeKit: https://github.com/arcee-ai/mergekit
