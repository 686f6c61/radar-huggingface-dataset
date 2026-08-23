# Rootport/Nz-Gemma3-12B

## Resumen

Rootport/Nz-Gemma3-12B es un repositorio de Hugging Face que rehospeda los archivos del modelo Gemma 3 12B de Google, en su variante instrucción (`google/gemma-3-12b-it`), cuantizado a GGUF Q4_K_M por `ggml-org`. No se trata de un modelo nuevo ni de un fine-tuning: es una copia literal de los archivos originales, con la única diferencia de que la estructura de directorios está reorganizada para que el plugin Nz-LTX23 de AviUtl2 (un editor de vídeo japonés) pueda descargar e instalar automáticamente los archivos necesarios sin requerir una cuenta de HuggingFace (el tokenizador original está protegido por acceso restringido). El repositorio incluye un archivo GGUF de aproximadamente 7,3 GB (cuantización Q4_K_M) y una carpeta con el tokenizador completo (10 archivos, unos 39 MB), pero no incluye los pesos en safetensors; el modelo no puede generar texto por sí solo sin el archivo GGUF.

La relevancia de este repositorio es práctica: permite que el backend de generación de vídeo Nz-Videomni (antes Nz-LTX23-backend) utilice Gemma 3 12B como codificador de prompts para generar descripciones de escenas en el flujo de creación de vídeo con AviUtl2. Aunque no aporta ninguna mejora técnica sobre el modelo original, facilita la distribución y el uso en un ecosistema concreto, respetando la licencia Gemma Terms of Use que permite la redistribución bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 11.765.788.416 (11,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 12B soporta hasta 128k tokens, pero no se especifica en este repositorio) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este repositorio; tambien existe variante QAT q4_0 del modelo base |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (Q4_K_M) y tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 12B instruction-tuned, desarrollado por Google LLC. Se trata de un transformer decoder-only con atención local y global (como se describe en la documentación oficial de Gemma 3), optimizado para ejecutarse en una sola GPU o TPU. El repositorio no proporciona información sobre los datos de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). Sin embargo, al ser una copia literal del modelo original, se asume que conserva todas las características de entrenamiento de `google/gemma-3-12b-it`, incluida su capacidad de razonamiento y seguimiento de instrucciones.

La cuantización Q4_K_M fue realizada por `ggml-org` a partir del modelo base, y el tokenizer fue re-hospedado por Rootport para permitir la descarga sin autenticación. No hay ninguna innovación técnica adicional en este repositorio; su valor reside en la distribución organizada para el plugin Nz-LTX23.

## Capacidades

- Generación de texto y conversación: el modelo es capaz de mantener diálogos multi-turno, responder preguntas y seguir instrucciones complejas.
- Razonamiento y matemáticas: hereda las capacidades de Gemma 3 12B, que incluye razonamiento lógico y resolución de problemas matemáticos.
- Generación de código: soporta tareas de programación y depuración básica.
- Procesamiento de prompts para generación de vídeo: su función principal en este contexto es interpretar y codificar instrucciones de texto para el backend de vídeo Nz-Videomni.
- Multilingüismo: aunque el repositorio declara solo japonés e inglés, el modelo base de Gemma 3 soporta más de 140 idiomas; no se garantiza su comportamiento en otros idiomas.
- Conversacional: al ser la versión `-it`, está optimizado para diálogos y tareas de asistente.

## Casos de uso

- Integración con Nz-LTX23 para AviUtl2: el uso principal es el procesamiento de prompts de texto para la generación de vídeo. El modelo se coloca en `models/LTX23/TextEncoder/` y actúa como codificador de texto para el backend de vídeo.
- Despliegue local de un LLM de 12B en GPU de consumo: gracias a la cuantización Q4_K_M, puede ejecutarse en tarjetas con 8-12 GB de VRAM, permitiendo tareas de generación de texto y chat sin conexión.
- Asistente de programación en local: con herramientas como llama.cpp u Ollama, puede usarse para generar código, explicar fragmentos o completar funciones.
- Análisis de documentos técnicos: su capacidad de razonamiento lo hace útil para resumir o extraer información de textos largos, siempre que el contexto lo permita.
- Generación de descripciones creativas: para tareas de escritura, guionización o creación de contenido en inglés y japonés.
- Prototipado rápido de aplicaciones de IA: al estar disponible en GGUF, se puede integrar fácilmente en pipelines de inferencia con vLLM, llama.cpp o TGI para experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que es una redistribución del modelo original, se puede consultar el rendimiento de `google/gemma-3-12b-it` en la documentación oficial de Gemma 3, pero no se incluyen datos concretos en este repositorio.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 7,3 GB. Para inferencia se recomienda al menos 8 GB de VRAM, aunque con 10-12 GB se obtiene un margen más cómodo para el contexto.
- GPU recomendadas: tarjetas de consumo como RTX 3080/3090 (10-24 GB) o RTX 4090 (24 GB) son suficientes. También funciona en A100/H100 con mayor memoria.
- Compatibilidad con GPU consumer: sí, cabe en GPU de gama media-alta (RTX 3080 10 GB en adelante).
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (Text Generation Inference), o directamente con la librería `llama-cpp-python`.
- Latencia y throughput: no disponible; dependerá del hardware y de la implementación utilizada. En una RTX 4090 con Q4_K_M se puede esperar una velocidad de generación de 40-60 tokens/segundo en inferencia simple, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este repositorio, ya que es una redistribución del modelo base. A modo de referencia, el modelo base Gemma 3 12B IT se puede comparar con otros LLM de tamaño similar:

| Modelo | Parametros | Contexto maximo | Licencia | Formato |
|---|---|---|---|---|
| Gemma 3 12B IT (este repo) | 11,7 B | 128k (no confirmado en repo) | Gemma Terms | GGUF |
| Llama 3.1 8B Instruct | 8 B | 128k | Llama 3 license | GGUF, safetensors |
| Mistral 7B Instruct | 7 B | 32k | Apache 2.0 | GGUF, safetensors |

No se puede realizar una comparación de rendimiento sin datos de benchmarks, pero Gemma 3 12B suele superar a los modelos de 7-8B en tareas de razonamiento y matemáticas, aunque requiere más VRAM.

## Limitaciones y advertencias

- No es un modelo original: es una copia literal del modelo Gemma 3 12B IT; no se ha realizado ningún ajuste fino ni modificación de pesos.
- Sesgos y alucinaciones: al ser un modelo de lenguaje grande, puede generar información falsa o sesgada. No se ha realizado ninguna mitigación adicional en este repositorio.
- Restricciones de licencia: la licencia Gemma Terms of Use impone condiciones de uso, incluyendo la Gemma Prohibited Use Policy. El uso comercial está permitido, pero debe cumplir con las restricciones de uso prohibido (por ejemplo, usos que violen derechos humanos, seguridad, etc.).
- Soporte de idioma limitado en la documentación: el repositorio declara solo japonés e inglés; aunque el modelo base soporta más idiomas, no se garantiza su calidad en otros.
- Requiere el archivo GGUF y el tokenizer por separado: el tokenizer no contiene pesos, por lo que no puede generar texto sin el archivo GGUF.
- No es una distribución oficial de Google: el repositorio no está respaldado ni recomendado por Google LLC, aunque cumple con las condiciones de redistribución de la licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rootport/Nz-Gemma3-12B
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Cuantización GGUF de ggml-org: https://huggingface.co/ggml-org/gemma-3-12b-it-GGUF
- Proyecto Nz-Videomni (backend de vídeo): https://github.com/Rootport-AI/Nz-Videomni
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de Gemma 3 (Google AI): https://ai.google.dev/gemma/docs/core
