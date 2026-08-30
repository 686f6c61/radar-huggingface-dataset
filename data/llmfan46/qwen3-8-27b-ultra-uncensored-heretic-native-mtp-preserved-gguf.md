# llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

Este modelo es una versión cuantizada en GGUF del trabajo de llmfan46, que parte del modelo Qwen3.8-27B de Alibaba y le aplica una técnica de ablación ortogonal (abliteration) para eliminar la mayoría de las respuestas de rechazo y censura. El resultado es un modelo de 27 320 millones de parámetros con una tasa de rechazos del 3 % frente al 91 % del original, manteniendo una divergencia KL de solo 0,0244 respecto al modelo base. El modelo conserva los 15 módulos de predicción multi-token (MTP) originales, lo que permite una inferencia más rápida.

Se distribuye bajo licencia Apache-2.0 y su pipeline es image-text-to-text, por lo que acepta tanto texto como imágenes como entrada. El repositorio contiene múltiples archivos GGUF con diferentes niveles de cuantización, lo que facilita su ejecución en hardware variado. Es relevante para desarrolladores que necesitan un modelo sin filtros de contenido para aplicaciones de generación creativa, investigación o análisis de imágenes, manteniendo un rendimiento cercano al del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto), basado en Qwen3.8-27B |
| Parametros totales | 27 320 697 856 (27 320 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun el blog de orcarouter; no confirmado en la model card) |
| Tipos de cuantizacion | GGUF: F16 y cuantizaciones Q4, Q5, Q8, etc. (12 niveles segun orcarouter) |
| Idiomas soportados | No disponible en la model card; Qwen3.8-27B soporta multilingue (segun documentacion de Alibaba) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base tambien tiene safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso multimodal desarrollado por Alibaba que procesa tanto texto como imagenes. Incluye 15 modulos de prediccion multi-token (MTP), un mecanismo que permite predecir varios tokens a la vez y acelera la inferencia. La version "Ultra-Uncensored-Heretic" aplica el metodo de ablacion ortogonal con preservacion de magnitud (MPOA) implementado en el proyecto Heretic v2.0.0.dev0. Este proceso identifica las direcciones en el espacio de pesos responsables de los comportamientos de rechazo y las elimina, manteniendo intacto el resto de la representacion.

Los 15 MTPs se conservan integros tras la ablacion, lo que preserva la capacidad de generacion rapida. Los parametros de ablacion (direction_index 34.80, pesos maximos y minimos en attn.out_proj, mlp.down_proj y attn.o_proj) se detallan en la model card. No se menciona entrenamiento adicional con RLHF o DPO; es una modificacion post-entrenamiento que no requiere datos nuevos.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas (el modelo original alcanza 83,42 % en MMLU).
- Procesamiento multimodal: acepta imagenes y texto como entrada (pipeline image-text-to-text).
- Reduccion drastica de rechazos: solo 3 de cada 100 solicitudes son rechazadas, frente a 91 de cada 100 en el modelo original.
- Preservacion de la calidad: la divergencia KL de 0,0244 indica que las respuestas son muy similares a las del modelo base.
- Inferencia acelerada gracias a los 15 MTPs conservados.
- Soporte de tool calling no documentado en la model card, pero presente en Qwen3.8-27B (segun la documentacion de Alibaba).

## Casos de uso

- Creacion de contenido creativo sin restricciones: el modelo puede generar narrativa, poesia o dialogos sin rechazar peticiones por temas sensibles, manteniendo un estilo coherente.
- Asistencia en investigacion academica: permite explorar temas controvertidos o hipotesis no convencionales sin que el modelo se niegue a responder, util para debates cientificos.
- Chatbots de entretenimiento para adultos: su baja tasa de rechazo lo hace adecuado para aplicaciones de rol o conversacion intima en entornos controlados.
- Generacion de codigo en entornos de pruebas: al no rechazar peticiones de codigo aparentemente malicioso, puede usarse para auditar vulnerabilidades o practicar pentesting en laboratorios aislados.
- Analisis de imagenes con menos filtros: al ser multimodal, puede describir o interpretar imagenes que otros modelos censurarian, util en campos como la medicina forense o la critica de arte.
- Fine-tuning de modelos especializados: su licencia Apache-2.0 permite usarlo como base para ajustar modelos en dominios donde se requiere una salida sin restricciones.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, comparando el modelo heretic con el original Qwen/Qwen3.8-27B:

| Metrica | Modelo heretic | Modelo original |
| :------ | :------------: | :--------------: |
| Divergencia KL | 0,0244 | 0 (por definicion) |
| Rechazos (sobre 100 peticiones) | 3 | 91 |
| MMLU (accuracy global) | No indicado | 83,42 % |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible. La baja divergencia KL sugiere que el rendimiento en tareas como MMLU deberia ser similar al del modelo original, pero no se confirma numericamente.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Cuantizacion Q4 (4 bits): aproximadamente 16-18 GB de VRAM.
  - Cuantizacion Q8 (8 bits): aproximadamente 30-32 GB.
  - F16 (16 bits): aproximadamente 54 GB (pesos) mas overhead de activaciones.
- GPU recomendadas: RTX 4090 (24 GB) para Q4, A100 80 GB o H100 para F16 o Q8 con contexto largo.
- Cabe en GPUs de consumo (RTX 3090/4090) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp (compatible con GGUF), vLLM (con soporte para GGUF), Ollama, TGI.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, el hardware y la longitud de contexto. La presencia de MTP puede acelerar la generacion respecto a modelos sin esta caracteristica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
| :----- | :--------- | :------- | :------- | :------- | :------------- |
| Qwen3.8-27B (original) | 27 320 M | 262 K | 91/100 | Apache-2.0 | HuggingFace |
| llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic | 27 320 M | 262 K | 3/100 | Apache-2.0 | HuggingFace (GGUF y safetensors) |
| Llama-3-8B-Instruct-UltraUncensored (ejemplo) | 8 000 M | 128 K | ~5/100 | Apache-2.0 | HuggingFace |

La comparativa con Llama-3-8B es orientativa; no se han encontrado datos concretos de ese modelo en la informacion proporcionada. El modelo heretic ofrece el mismo tamano y contexto que el original, pero con una tasa de rechazo mucho menor, a costa de una divergencia KL minima.

## Limitaciones y advertencias

- Sesgos conocidos: el proceso de ablacion puede eliminar no solo los rechazos, sino tambien parte del comportamiento de seguridad aprendido, lo que puede llevar a respuestas sesgadas o poco eticas en temas sensibles.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas controvertidos donde no se le ha entrenado para ser cauto.
- Limitaciones de contexto: aunque se indica 262 K, el rendimiento con contextos muy largos puede degradarse; no se han publicado pruebas especificas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable del contenido generado; el autor no asume responsabilidad por usos indebidos.
- Caveat para produccion: la ausencia de rechazos puede hacer que el modelo genere contenido ilegal o dañino si se usa sin supervisión; se recomienda implementar filtros externos de contenido.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de orcarouter sobre el GGUF abliterado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org/
