# smshahbaj/Rifa-Nano-0.5B-GGUF

## Resumen

Rifa-Nano-0.5B es un modelo de lenguaje pequeño (0.5B parámetros) perteneciente a la serie RIFA, desarrollado por smshahbaj. Está fine-tuneado sobre Qwen2.5-0.5B-Instruct mediante LoRA, lo que le confiere una identidad propia, fluidez multilingüe y capacidades ligeras de generación de código. El modelo está diseñado para ejecutarse eficientemente en hardware de gama baja, desde dispositivos móviles hasta GPUs modernas, y se distribuye en formato GGUF cuantizado (Q3_K_M) para su uso con llama.cpp y herramientas compatibles.

La relevancia de este modelo radica en su tamaño reducido (494M parámetros) y su ventana de contexto de 32K tokens, lo que permite desplegarlo en entornos con recursos limitados, como edge computing o aplicaciones móviles, manteniendo capacidades conversacionales y de instrucción. Su licencia Apache-2.0 facilita su uso comercial sin restricciones significativas. Es una opción interesante para desarrolladores que buscan un modelo pequeño, multilingüe (especialmente en bengalí e inglés) y con soporte para cuantización extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers, fine-tune LoRA sobre Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | Q3_K_M (único archivo GGUF publicado) |
| Idiomas soportados | ingles, bengali, banglish (mezcla bengali-ingles) |
| Licencia | Apache-2.0 (segun repositorio de mradermacher; el repo original no la especifica) |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. Rifa-Nano se obtiene mediante fine-tune con LoRA (Low-Rank Adaptation), técnica que reduce drásticamente el número de parámetros entrenables y el coste computacional. El entrenamiento se realizó con Unsloth, una librería optimizada para fine-tuning eficiente, y posteriormente se convirtió a formato GGUF para su uso con llama.cpp. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La ventana de contexto de 32K tokens es notable para un modelo de este tamaño, lo que sugiere que el fine-tune pudo haber extendido la capacidad de contexto original de Qwen2.5-0.5B (que es de 32K de serie, por lo que probablemente se mantiene).

## Capacidades

- Generacion de texto conversacional e instrucciones, con identidad propia definida por el autor.
- Fluidez multilingue, con especial énfasis en bengali, ingles y banglish (mezcla de ambos).
- Capacidades ligeras de generacion de codigo, adecuadas para tareas simples de programacion.
- Soporte para chat multi-turno gracias a su ventana de contexto de 32K tokens.
- Compatible con llama.cpp y herramientas como llama-cli, lo que permite ejecucion local en CPU o GPU.
- No se han documentado capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional en dispositivos moviles: su tamaño de 0.5B y cuantizacion Q3_K_M permiten ejecutarlo en smartphones con 1-2 GB de RAM, ofreciendo respuestas en bengali o ingles sin conexion.
- Chatbot de atencion al cliente en entornos con recursos limitados: puede desplegarse en un servidor modesto o en un contenedor ligero, gestionando conversaciones multi-turno con contexto de hasta 32K tokens.
- Generacion de codigo simple en entornos de desarrollo integrado: para autocompletar funciones basicas o generar snippets en Python, JavaScript u otros lenguajes, sin necesidad de una GPU potente.
- Procesamiento de texto en bengali y banglish: ideal para aplicaciones de traduccion, resumen o clasificacion de texto en estos idiomas, donde los modelos grandes no estan optimizados.
- Prototipado rapido de aplicaciones LLM: al ser pequeno y rapido, permite iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Educacion y aprendizaje: puede usarse como modelo de demostracion para ensenar conceptos de LLMs, fine-tuning o cuantizacion en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Se recomienda realizar pruebas propias en los casos de uso previstos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con cuantizacion Q3_K_M (el archivo GGUF pesa aproximadamente 0.3-0.4 GB, segun el tamano del repo de 3.2 GB que incluye otros archivos).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo integradas modernas. Tambien funciona en CPU con llama.cpp.
- Cabe en GPUs de consumo como NVIDIA GTX 1650, RTX 3050, o incluso en Apple Silicon con Unified Memory.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama (si se importa el GGUF), GPT4All, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles, pero al ser un modelo de 0.5B, se espera una generacion de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rifa-Nano-0.5B | 0.5B | 32K | Apache-2.0 | GGUF | Fine-tune de Qwen2.5-0.5B-Instruct, multilingue (bengali) |
| Qwen2.5-0.5B-Instruct | 0.5B | 32K | Apache-2.0 | Safetensors, GGUF | Modelo base, sin fine-tune especifico |
| TinyLlama-1.1B | 1.1B | 2K (ampliable) | Apache-2.0 | Safetensors, GGUF | Mas parametros pero contexto menor |
| Phi-2 (2.7B) | 2.7B | 2K | MIT | Safetensors | Mayor capacidad pero mas pesado |

Rifa-Nano se diferencia por su enfoque en bengali y banglish, algo poco comun en modelos de este tamano. Su contexto de 32K es superior al de TinyLlama o Phi-2, aunque con menos parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un fine-tune de Qwen2.5, puede heredar sesgos del modelo base y del dataset de fine-tuning (desconocido).
- Riesgo de alucinacion: elevado en modelos pequenos, especialmente en tareas complejas o de razonamiento. Se recomienda validar las respuestas en produccion.
- Limitaciones de contexto: aunque soporta 32K tokens, la calidad de atencion a contextos muy largos puede degradarse en un modelo de 0.5B.
- Limitaciones de idioma: el modelo esta optimizado para bengali, ingles y banglish; su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe verificar la licencia del repo original (no especificada en HuggingFace) y la del modelo base Qwen2.5 (Apache-2.0).
- Cuantizacion Q3_K_M: puede provocar perdida de calidad en la generacion. Para tareas criticas, se recomienda usar cuantizaciones superiores si estan disponibles.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez y posibles sesgos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/smshahbaj/Rifa-Nano-0.5B-GGUF
- Repositorio HuggingFace (modelo original): https://huggingface.co/smshahbaj/Rifa-Nano-0.5B
- Repositorio alternativo GGUF (mradermacher): https://huggingface.co/mradermacher/Rifa-Nano-0.5B-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/smshahbaj%2FRifa-Nano-0.5B,3FSHDb2V1j2rPQTBNgrRyD
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
