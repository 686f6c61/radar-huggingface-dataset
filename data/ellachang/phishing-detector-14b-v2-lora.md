# ellachang/phishing-detector-14b-v2-lora

## Resumen

El modelo `ellachang/phishing-detector-14b-v2-lora` es un adaptador LoRA (QLoRA) entrenado por ellachang sobre el modelo base Qwen3-14B, en su variante cuantizada a 4 bits de Unsloth. Su funcion es clasificar correos electronicos como `phishing` o `legitimate`, devolviendo una unica palabra como respuesta. Se publica bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles.

El adaptador resuelve un problema concreto de seguridad del correo: la deteccion binaria de phishing en texto de email. El autor reporta que el modelo base Qwen3-14B sin ajuste acierta solo un 42,3% en su conjunto de test, mientras que este adaptador alcanza el 100% usando el formato de prompt exacto de entrenamiento (texto plano, sin plantilla de chat). Es relevante porque demuestra que un ajuste fino ligero sobre un modelo de 14B puede transformar por completo el rendimiento en una tarea de clasificacion especializada.

El modelo tiene 14B parametros (heredados del base Qwen3-14B), se distribuye como adaptador PEFT en safetensors (repo de 0,1 GB) y existe una version GGUF para Ollama. La innovacion practica mas destacable es la advertencia del autor sobre el formato: usar la plantilla de chat de Qwen3 degrada la precision del 100% al 77,5%, porque el modelo tiende a entrar en modo `<think>` y no responde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con adaptador LoRA |
| Parametros totales | 14B (modelo base); el adaptador LoRA no se especifica en numero de parametros, pero usa r=16, alpha=16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de truncado usada en entrenamiento); contexto nativo del base no indicado en la informacion |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit via Unsloth); version GGUF Q4_K_M para Ollama |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-14B, un transformer decoder-only, mediante QLoRA con el modelo base cuantizado a 4 bits. La configuracion LoRA es r=16, alpha=16, dropout 0,05, aplicada a las proyecciones q/k/v/o. El entrenamiento usa SFT con TRL, calculando la perdida unicamente sobre los tokens de respuesta (formato prompt/completion), con 3 epocas, learning rate 2e-4 y batch efectivo de 8 sobre una RTX 4090. Los correos se truncan para caber en 2.048 tokens de modo que la respuesta nunca se corte.

Los datos provienen del dataset de Kaggle "Human-LLM Generated Phishing-Legitimate Emails", con cuatro clases (humano/LLM x phishing/legitimo). El autor detecto que el split estratificado original 80/10/10 tenia aproximadamente un tercio de val y test duplicado en train, y reentreno con splits deduplicados: 2.698 de entrenamiento, 244 de validacion y 267 de test, manteniendo en val y test solo correos que nunca aparecieron en ningun split de entrenamiento. El checkpoint se selecciono por precision de validacion; esta alcanzo el 100% en el paso 100 (aproximadamente el 30% de una epoca) y se mantuvo en 19 de 21 evaluaciones, por lo que se publica ese checkpoint. No se menciona RLHF ni DPO.

## Capacidades

- Clasificacion binaria de correos electronicos en `phishing` o `legitimate`, devolviendo una sola palabra.
- Deteccion tanto de phishing generado por LLM como de phishing escrito por humanos (el conjunto de test incluye ambas clases).
- Respuesta determinista con decodificacion greedy (temperatura 0) en el formato de prompt de entrenamiento.
- Capacidad multilingue: no disponible; el modelo solo declara soporte de ingles.
- Tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; de hecho, el modo de razonamiento (`<think>`) del base degrada el rendimiento.
- Capacidades especiales: ninguna documentada aparte de la clasificacion; no hay vision ni audio.

## Casos de uso

- Filtrado de correo entrante en pasarelas de seguridad: el modelo se situa como clasificador de segunda opinion tras el filtro antispam, procesando cada email con el prompt de texto plano y devolviendo una etiqueta binaria en un unico token.
- Analisis de bandejas de cuarentena: clasificar correos retenidos para priorizar la revision humana, aprovechando que el modelo distingue phishing generado por LLM y phishing escrito por humanos en el conjunto de test.
- Enriquecimiento de alertas SOC: integrar la clasificacion como paso de un pipeline de triaje que etiquete correos reportados por usuarios antes de que un analista los revise.
- Generacion de datos de entrenamiento para clasificadores ligeros: usar este adaptador como etiquetador de referencia sobre correos no etiquetados para construir datasets de destilacion hacia modelos mas pequenos.
- Evaluacion de la robustez de filtros existentes: comparar las predicciones del modelo con las de la solucion en produccion para detectar discrepancias y correos evasivos.
- Investigacion academica sobre seguridad del correo: el repositorio GitHub del autor y los splits deduplicados permiten reproducir el experimento y comparar variantes del adaptador (v1 vs v2).

## Benchmarks y rendimiento

Conjunto de test: 267 correos que no aparecen en los datos de entrenamiento, decodificacion greedy, Ollama Q4_K_M.

| Modelo / configuracion | Precision | Phishing humano | Legitimo humano | Phishing LLM | Legitimo LLM |
|---|---|---|---|---|---|
| Qwen3-14B zero-shot | 42,3% | 13/13 | 0/54 | 100/100 | 0/100 |
| Este modelo, plantilla de chat | 77,5% | 11/13 | 53/54 | 97/100 | 46/100 |
| Este modelo, prompt en texto plano | 100% | 13/13 | 54/54 | 100/100 | 100/100 |

Advertencias del autor: el conjunto de test esta saturado (la v1 del adaptador tambien obtiene 99,6% con el prompt en texto plano, por lo que no permite distinguir ambas versiones); los correos cercanos al limite de decision pueden cambiar entre ejecuciones incluso a temperatura 0 (variacion esperada de +-1 o 2 correos); solo quedan 13 correos de phishing escritos por humanos tras la deduplicacion; y no se ha medido la precision sobre otros corpus de correo distintos al dataset de Kaggle.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0,1 GB; el modelo base Qwen3-14B en 4 bits requiere aproximadamente 8-10 GB de VRAM para inferencia, y en Q4_K_M (GGUF) un rango similar.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento), A100 o H100 para mayor throughput; una GPU consumer de 12-16 GB es suficiente para la version cuantizada.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: Ollama (via el repositorio GGUF `ellachang/phishing-detector-14b-v2-gguf`), transformers + PEFT (ejemplo oficial en la model card), llama.cpp para la version GGUF; vLLM y TGI no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo indica que la evaluacion se hizo con Ollama Q4_K_M y decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phishing-detector-14b-v2-lora | 14B (base) + LoRA | 2.048 (truncado) | 100% (test propio, prompt plano) | Apache 2.0 | Hugging Face, GGUF para Ollama |
| Qwen3-14B zero-shot (base) | 14B | no disponible | 42,3% (mismo test) | Apache 2.0 | Hugging Face |
| phishing-detector-14b-v1-lora | 14B (base) + LoRA | 2.048 (truncado) | 99,6% (mismo test, prompt plano) | Apache 2.0 | Hugging Face (mencionado por el autor) |

No se dispone de datos sobre otros clasificadores de phishing comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de test esta saturado: la v1 y la v2 obtienen resultados practicamente identicos, por lo que la mejora de la v2 no esta demostrada con estos datos.
- Solo 13 correos de phishing escritos por humanos tras la deduplicacion; la estimacion de rendimiento en esa clase es estadisticamente fragil.
- La precision del 100% se ha medido unicamente sobre un dataset de Kaggle; no hay evaluacion sobre trafico de correo real ni sobre otros corpus.
- El uso de la plantilla de chat de Qwen3 hace que el modelo entre en modo `<think>` y no responda, degradando la precision al 77,5%; es imprescindible usar el prompt en texto plano exacto.
- Los correos cercanos al limite de decision pueden cambiar de etiqueta entre ejecuciones incluso a temperatura 0.
- Solo soporta ingles; correos en otros idiomas no estan cubiertos.
- Riesgo de alucinacion: el modelo puede generar texto distinto a `phishing` o `legitimate` si la entrada se desvia del formato de entrenamiento; conviene validar la salida en produccion.
- Sesgos conocidos: no documentados por el autor; el modelo hereda los sesgos del dataset de Kaggle y del base Qwen3-14B.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias de rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/ellachang/phishing-detector-14b-v2-lora
- Hugging Face (GGUF para Ollama): https://huggingface.co/ellachang/phishing-detector-14b-v2-gguf
- Modelo base: https://huggingface.co/unsloth/qwen3-14b-unsloth-bnb-4bit
- Repositorio GitHub: https://github.com/EllaChang1011/TAICA-LLM-phishing-detection
- Dataset: https://www.kaggle.com/datasets/ (referencia incompleta en la model card)
