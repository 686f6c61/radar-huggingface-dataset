# NINI26454/Llama-3.1-8B-Instruct-abliterated-4bit

## Resumen

Este modelo es una cuantización de 4 bits (bitsandbytes) de la versión "abliterated" de Llama 3.1 8B Instruct, publicada por el usuario NINI26454 en Hugging Face. La técnica de abliteración elimina las direcciones de rechazo del modelo original, reduciendo la probabilidad de que el modelo se niegue a responder a ciertas peticiones. El resultado es un modelo de 8.030 millones de parámetros con una ventana de contexto de 128.000 tokens, pensado para generación de texto conversacional.

La relevancia de este modelo radica en que combina las capacidades de razonamiento y multilingüismo de Llama 3.1 8B Instruct con un comportamiento menos restrictivo en cuanto a contenido, y además viene pre-cuantizado a 4 bits para reducir los requisitos de memoria. Está disponible en formato safetensors, compatible con el ecosistema de Transformers y con herramientas como text-generation-inference. No se dispone de información sobre licencia ni idiomas soportados en la ficha del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | 4-bit bitsandbytes |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero no se confirma en esta version) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas, 8 cabezas de atencion, 128.000 tokens de contexto y un vocabulario de 128.256 tokens. Se entreno con 15 billones de tokens en 8 idiomas (aleman, arabe, español, frances, hindi, ingles, italiano, portugues y tailandes) y se afino con instrucciones y preferencias humanas (RLHF) para mejorar el seguimiento de instrucciones y la seguridad.

La version "abliterated" fue creada por mlabonne aplicando la tecnica de abliteration sobre el modelo base. Esta tecnica consiste en identificar y eliminar las direcciones del espacio latente asociadas con el rechazo de peticiones, de modo que el modelo deja de negarse sistematicamente a responder contenido considerado sensible. El resultado es un modelo con menos restricciones de contenido, manteniendo en gran medida las capacidades de razonamiento del original.

El modelo que nos ocupa es una cuantizacion a 4 bits de esa version abliterated, realizada con bitsandbytes. No se ha publicado informacion sobre el proceso de cuantizacion especifico (calibracion, datos utilizados, etc.) ni sobre el entrenamiento adicional, si lo hubiera.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones.
- Razonamiento y resolucion de problemas en multiples dominios.
- Soporte multilingue: el modelo base maneja 8 idiomas, aunque no se confirma que esta version conserve todas las capacidades.
- Ventana de contexto larga de 128.000 tokens, util para documentos extensos o conversaciones multi-turno.
- Menos restricciones de contenido que el modelo base debido a la abliteracion, lo que permite respuestas en temas que el modelo original podria rechazar.
- No se ha documentado soporte para tool calling, function calling ni capacidades de agente en esta version especifica.
- No se ha documentado soporte para vision, audio u otras modalidades (es solo texto).

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede redactar ficcion, guiones o material educativo sin las negativas habituales del modelo base, gracias a la abliteracion.
- Asistentes conversacionales de nicho: se puede integrar en chatbots para comunidades que necesitan respuestas directas sobre temas controvertidos (siempre dentro de los limites legales y eticos).
- Analisis de documentos largos: con 128.000 tokens de contexto, puede resumir o extraer informacion de libros, informes extensos o codigo fuente de gran tamano.
- Prototipado rapido de aplicaciones de lenguaje: al ser una cuantizacion de 4 bits, cabe en GPUs de consumo y permite iterar rapidamente en entornos de desarrollo.
- Educacion y divulgacion: puede utilizarse para generar explicaciones detalladas sobre temas cientificos o tecnicos sin las limitaciones de seguridad del modelo original, aunque requiere supervision humana.
- Experimentacion en investigacion: util para estudiar los efectos de la abliteracion y la cuantizacion en el comportamiento del modelo, comparando con la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo especifico. El modelo base Llama 3.1 8B Instruct obtiene resultados conocidos (por ejemplo, 68.4 en MMLU, 84.5 en HumanEval, 68.0 en GSM8K), pero la version abliterated y su cuantizacion a 4 bits pueden presentar variaciones que no han sido documentadas. Se recomienda al usuario evaluar el modelo en sus propias tareas antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion de 4 bits, el modelo ocupa aproximadamente 4.5-5 GB de pesos, mas overhead de activaciones y cache. En la practica, se recomienda al menos 8 GB de VRAM para inferencia con contexto corto, y 12-16 GB para contexto largo (128k tokens).
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A10, A100, H100. En general, cualquier GPU con mas de 8 GB de VRAM puede ejecutarlo, aunque el rendimiento variara.
- En consumer GPU: si, es viable en tarjetas de gama media con 12 GB o mas.
- Opciones de despliegue: al ser un modelo de Transformers con safetensors, se puede servir con vLLM, text-generation-inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (mediante conversion) o directamente con la libreria Transformers.
- Latencia y throughput: no se dispone de datos medidos para este modelo. Como referencia, Llama 3.1 8B en 4 bits suele generar entre 20 y 50 tokens por segundo en una RTX 4090, pero depende del backend y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| NINI26454/Llama-3.1-8B-Instruct-abliterated-4bit | 8.03B | 128k | 4-bit bitsandbytes | no disponible | Version abliterada y cuantizada |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8.03B | 128k | FP16/BF16 | Llama 3.1 Community License | Version abliterada sin cuantizar |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128k | FP16/BF16 | Llama 3.1 Community License | Modelo base oficial |

La principal diferencia con el modelo base es la abliteracion, que elimina las negativas de seguridad, y la cuantizacion a 4 bits, que reduce los requisitos de memoria a costa de una posible perdida de precision. Frente a la version abliterated de mlabonne, esta version ya viene cuantizada, lo que facilita su uso en entornos con menos recursos, pero no incluye informacion sobre el proceso de cuantizacion ni garantias de calidad.

## Limitaciones y advertencias

- La abliteracion elimina las barreras de seguridad del modelo, lo que puede generar contenido inapropiado, ofensivo o peligroso si se usa sin control. No es recomendable para aplicaciones publicas sin moderacion.
- Se desconoce la licencia exacta de esta version; el modelo base usa la Llama 3.1 Community License, pero el autor no ha especificado si se mantiene. Verificar antes de usar comercialmente.
- No hay informacion sobre sesgos del modelo, pero hereda los sesgos potenciales de Llama 3.1, que pueden amplificarse al eliminar restricciones.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas de nicho.
- La cuantizacion a 4 bits puede degradar la calidad de las respuestas en tareas complejas de razonamiento o generacion de codigo.
- No se ha verificado que las capacidades multilingues del modelo base se conserven intactas en esta version.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NINI26454/Llama-3.1-8B-Instruct-abliterated-4bit
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Version abliterated de mlabonne: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Pagina de NVIDIA NIM para Llama 3.1 8B Instruct: https://build.nvidia.com/meta/llama-3_1-8b-instruct
- Documentacion de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/meta-llama-3_1-8b
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/NeuralFalconYT/Meta-Llama-3.1-Colab/blob/main/Llama_3_1_8B_Instruct.ipynb
