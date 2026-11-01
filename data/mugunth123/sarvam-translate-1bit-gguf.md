# Mugunth123/sarvam-translate-1bit-GGUF

## Resumen

sarvam-translate-1bit-GGUF es una cuantización extrema a 1 bit (formato IQ1_S con matriz de importancia o imatrix de calibración) del modelo de traducción sarvam-translate, desarrollado por Sarvam AI en colaboración con AI4Bharat sobre la base de Gemma 3 4B-IT de Google. El repositorio es obra del usuario Mugunth123 y distribuye los pesos en formato GGUF listos para ejecutarse con llama.cpp o llama-cpp-python.

El modelo original resuelve un problema muy concreto: la traducción bidireccional entre inglés y las 22 lenguas programadas de la India (hindi, bengalí, tamil, telugu, etc.), un dominio donde los modelos generalistas suelen rendir por debajo de lo esperado. La versión cuantizada a 1 bit reduce el tamaño del fichero de 8,1 GB a 1,05 GB (1,56 bits efectivos por peso), lo que permite ejecutarlo en entornos con unos 1,5 GB de RAM, como hardware edge o sistemas embebidos.

Su relevancia actual radica en la combinación de un modelo especializado en lenguas índicas con una cuantización agresiva que lo hace accesible en dispositivos con recursos mínimos. El precio a pagar es una posible degradación de calidad respecto a cuantizaciones más conservadoras (Q4_K_M o Q8_0, disponibles en repositorios del mismo autor), algo que conviene evaluar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 4B (transformer con GQA: 8 cabezas Q, 4 cabezas KV, 34 capas) |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | hasta 8.192 tokens |
| Tipos de cuantizacion | IQ1_S (1 bit con imatrix, 1,56 BPW); el mismo autor publica IQ1_M, IQ2_M, Q4_K_M y Q8_0 |
| Idiomas soportados | Ingles + 22 lenguas programadas de la India: as, bn, brx, doi, gom, gu, en, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (fichero sarvam-translate-IQ1_S.gguf, 1,05 GB) |

## Arquitectura y entrenamiento

El modelo base, sarvamai/sarvam-translate, es un modelo fundacional de traducción multilingüe construido sobre Gemma 3 4B-IT, la versión instruida de 4 mil millones de parametros del modelo abierto de Google DeepMind. La arquitectura emplea un transformer decoder con grouped-query attention (GQA), con 8 cabezas de consulta y 4 cabezas clave-valor repartidas en 34 capas, lo que reduce el tamaño de la cache KV y favorece inferencias eficientes.

Sobre esta base, Sarvam AI y AI4Bharat especializaron el modelo en traducción entre inglés y las lenguas programadas de la India. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. En cuanto a la cuantización, este repositorio aplica IQ1_S de llama.cpp, un esquema de 1 bit que utiliza una matriz de importancia (imatrix) calculada con datos de calibración para decidir qué pesos conservan mayor precisión, obteniendo 1,56 bits efectivos por peso y un fichero de 1,05 GB.

## Capacidades

- Traducción bidireccional entre inglés y las 22 lenguas programadas de la India, incluyendo lenguas de baja disponibilidad de datos como sánscrito, santalí, dogri, bodo o manipuri.
- Formato conversacional compatible con la plantilla de Gemma (etiquetas `<start_of_turn>` y `<end_of_turn>`), invocable mediante prompts del tipo "Translate the text below to Hindi".
- Ejecución local en CPU o GPU mediante llama.cpp, con soporte de offload de capas a GPU (n_gpu_layers).
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- No hay evidencia de capacidades de tool calling, agentes, visión ni audio; el pipeline declarado es exclusivamente translation.

## Casos de uso

- Traducción offline en dispositivos edge: con solo 1,5 GB de RAM requeridos, puede integrarse en routers, Raspberry Pi o terminales IoT para traducir contenido sin conexión a internet.
- Apps móviles de traducción para lenguas índicas: el fichero de 1,05 GB cabe en la memoria de smartphones modernos, útil para aplicaciones dirigidas a usuarios de lenguas como maithili, konkani o santalí, poco cubiertas por servicios comerciales.
- Preprocesamiento de corpus multilingües en investigación: traducción masiva de documentos entre inglés y lenguas índicas en estaciones de trabajo modestas, sin coste de API.
- Sistemas de atención al ciudadano en la India: traducción de consultas ciudadanas en lenguas regionales hacia inglés para su procesamiento posterior por otros sistemas.
- Prototipado rápido de pipelines de traducción: el formato GGUF y la integración con llama-cpp-python permiten montar un servicio de traducción local en minutos para validar productos.
- Accesibilidad y localización de contenidos: traducción de material educativo o informativo a lenguas como nepalí, urdu u odia en ONGs o administraciones con presupuesto limitado.
- Comparación de degradación por cuantización: dado que el mismo autor publica versiones IQ1_M, IQ2_M, Q4_K_M y Q8_0, este repositorio sirve como punto de partida para estudios de compresión extrema en modelos de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos comparativos de calidad de traducción entre la versión IQ1_S y el modelo original sin cuantizar; dada la agresividad de la cuantización a 1 bit, se recomienda validar la calidad en las lenguas de interés antes de uso en producción.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB de RAM según la model card; el fichero pesa 1,05 GB, al que hay que sumar la cache KV según el contexto usado.
- GPU recomendadas: no requiere GPU; puede ejecutarse íntegramente en CPU. Si se usa GPU, cualquier GPU moderna con 2 GB de VRAM libres es suficiente (por ejemplo, GTX 1650 o superiores); no se necesitan A100 ni H100.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo actual, incluso en portátiles con gráfica integrada si se ejecuta en CPU.
- Opciones de despliegue: llama.cpp (llama-cli), llama-cpp-python (incluye ejemplo de uso en la model card). No se menciona compatibilidad explícita con Ollama, vLLM ni TGI; al ser GGUF estándar, es plausible su uso en Ollama y LM Studio, aunque no está documentado.
- Latencia y throughput: no disponibles; en CPU se recomienda usar varios hilos (el ejemplo de la model card usa `-t 8`) y temperatura 0 para traducción determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| sarvam-translate-1bit-GGUF (este) | 3,88 B | IQ1_S (1,56 BPW) | 1,05 GB | 8.192 | GPL-3.0 | Ingles + 22 lenguas índicas |
| sarvam-translate-4bit-GGUF (mismo autor) | 3,88 B | Q4_K_M | 2,31 GB | 8.192 | GPL-3.0 | Ingles + 22 lenguas índicas |
| sarvam-translate-8bit-GGUF (mismo autor) | 3,88 B | Q8_0 | 3,84 GB | 8.192 | GPL-3.0 | Ingles + 22 lenguas índicas |
| sarvamai/sarvam-translate (original) | 3,88 B | sin cuantizar | 8,1 GB | 8.192 | no disponible | Ingles + 22 lenguas índicas |

La principal alternativa a este modelo dentro de su nicho son las propias cuantizaciones del mismo autor: la versión Q4_K_M (2,31 GB) ofrece casi seguro mayor fidelidad de traducción a cambio del doble de memoria. Como alternativa generalista de traducción con soporte de lenguas índicas existen modelos como NLLB de Meta, pero no se dispone de datos comparativos publicados entre ambos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 1 bit (IQ1_S) es la más agresiva del ecosistema llama.cpp y habitualmente degrada de forma apreciable la calidad de generación; para traducción de calidad conviene contrastar con Q4_K_M o Q8_0.
- Riesgo de alucinaciones y traducciones inexactas, especialmente en lenguas con menos recursos como sánscrito, santalí o dogri; no hay benchmarks que cuantifiquen este riesgo.
- Restricción de licencia relevante: GPL-3.0 es una licencia copyleft; su uso en productos de distribución puede obligar a liberar el código fuente derivado, a diferencia de licencias permisivas como Apache 2.0 o MIT.
- El modelo está limitado a traducción entre inglés y las lenguas índicas; no soporta traducción directa entre dos lenguas índicas (salvo que el modelo base lo permita, algo no documentado) ni otros idiomas como el castellano.
- Contexto máximo de 8.192 tokens, suficiente para documentos moderados pero limitado para traducción de textos largos en un solo pase.
- Sin soporte documentado de tool calling, agentes, visión ni audio; el ámbito de uso es exclusivamente traducción.
- Repositorio comunitario con muy poca tracción (257 descargas, 0 likes en el momento de los datos), sin auditoría de terceros sobre la calidad de la cuantización.

## Enlaces

- Repositorio del modelo (HuggingFace): https://huggingface.co/Mugunth123/sarvam-translate-1bit-GGUF
- Modelo base: https://huggingface.co/sarvamai/sarvam-translate
- Cuantización 1,58-bit (IQ1_M): https://huggingface.co/Mugunth123/sarvam-translate-1.58bit-GGUF
- Cuantización 2-bit (IQ2_M): https://huggingface.co/Mugunth123/sarvam-translate-2bit-GGUF
- Cuantización 4-bit (Q4_K_M): https://huggingface.co/Mugunth123/sarvam-translate-4bit-GGUF
- Cuantización 8-bit (Q8_0): https://huggingface.co/Mugunth123/sarvam-translate-8bit-GGUF
- Perfil del autor: https://huggingface.co/Mugunth123
