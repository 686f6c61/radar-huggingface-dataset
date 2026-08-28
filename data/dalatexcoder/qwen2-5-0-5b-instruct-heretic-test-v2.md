# dalatexcoder/Qwen2.5-0.5B-Instruct-heretic-test-v2

## Resumen

Qwen2.5-0.5B-Instruct-heretic-test-v2 es una version "decensored" (sin censura) del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, creada por el usuario dalatexcoder mediante la herramienta Heretic v1.2.0. El proceso de ablacion, conocido como "abliteration", elimina selectivamente las direcciones en el espacio de activaciones del modelo que se correlacionan con comportamientos de rechazo y negativa a responder, reduciendo drasticamente las respuestas de rechazo de 93/100 en el modelo original a 10/100 en esta version.

El modelo mantiene la arquitectura base de Qwen2.5 con 494 millones de parametros, soporte de contexto de hasta 32.768 tokens y generacion de hasta 8.192 tokens. Esta pensado para desarrolladores e investigadores que necesitan un modelo conversacional pequeno sin restricciones de contenido, aunque hereda las limitaciones propias de un modelo de 0.5B en cuanto a capacidad de razonamiento complejo y conocimiento profundo.

La relevancia de este modelo reside en su tamano reducido, que permite ejecutarlo en hardware modesto, y en su proposito especifico de eliminar las barreras de censura presentes en el modelo original, lo que lo hace util para experimentos de investigacion sobre alineacion, seguridad y comportamiento de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y embeddings de palabras atados |
| Parametros totales | 494.032.768 (0.49B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generacion maxima de 8.192 tokens) |
| Tipos de cuantizacion | No especificado en la informacion disponible |
| Idiomas soportados | Ingles (segun model card); el modelo base Qwen2.5 soporta 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Qwen2.5-0.5B-Instruct: un transformer causal con 24 capas, 14 cabezas de atencion para consultas (Q) y 2 para clave/valor (KV) con atencion de consulta agrupada (GQA). Utiliza embeddings rotatorios posicionales (RoPE), SwiGLU como funcion de activacion, RMSNorm para normalizacion y bias en las proyecciones QKV. Los embeddings de palabras estan atados entre la entrada y la salida.

El proceso de entrenamiento de esta variante no consiste en un fine-tuning tradicional, sino en una ablacion de direcciones especificas en el espacio de activaciones. Heretic identifica las direcciones en las capas de atencion (attn.o_proj) y MLP (mlp.down_proj) que correlacionan con el comportamiento de rechazo y las elimina o modifica. Los parametros de ablacion se aplican por capa, con pesos maximos y minimos especificos para cada capa, como se detalla en la tabla de la model card. El resultado es una reduccion de la divergencia KL de 0.0975 respecto al modelo original, lo que indica que el comportamiento general se preserva en gran medida mientras se elimina la tendencia a rechazar peticiones.

## Capacidades

- Generacion de texto conversacional sin filtros de contenido: el modelo responde a peticiones que el modelo original rechazaria, con una tasa de rechazo reducida de 93/100 a 10/100.
- Chat multi-turno con plantilla de conversacion estandar de Qwen, compatible con `apply_chat_template` de HuggingFace Transformers.
- Generacion de texto de hasta 8.192 tokens con contexto de 32.768 tokens.
- Capacidades de codigo y matematicas heredadas del modelo base Qwen2.5, aunque limitadas por el tamano de 0.5B.
- Soporte de instrucciones y seguimiento de system prompts, con mejora en role-play y condicionamiento de chatbots segun la documentacion de Qwen2.5.
- Generacion de salidas estructuradas, incluyendo JSON, gracias a las mejoras de Qwen2.5.
- No se especifica soporte para tool calling, function calling ni capacidades multimodales en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad de modelos: permite estudiar como se comporta un modelo pequeno sin mecanismos de rechazo, comparando respuestas con el modelo original para analizar el impacto de la ablacion en la calidad y seguridad de las respuestas.
- Desarrollo de personajes conversacionales sin restricciones: el modelo puede adoptar personalidades y responder a tematicas que los modelos censurados evitarian, util para prototipos de chatbots de ficcion o juegos de rol.
- Generacion de contenido creativo sin filtros: escritura de narrativa, dialogos o guiones que aborden tematicas adultas o controvertidas, aprovechando el contexto de 32K tokens para mantener coherencia en textos largos.
- Pruebas de estres de sistemas de moderacion: el modelo puede usarse como generador de contenido provocativo para evaluar y mejorar filtros de contenido en aplicaciones de produccion.
- Educacion y experimentacion en NLP: por su tamano reducido, es adecuado para ejecutarse en portatiles o CPUs y servir como banco de pruebas para tecnicas de decodificacion, fine-tuning o evaluacion de modelos pequenos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0.5B, puede ejecutarse en dispositivos edge, Raspberry Pi o instancias cloud de baja gama, manteniendo una conversacion fluida sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. La model card proporciona unicamente metricas de la ablacion:

| Metrica | Modelo ablacionado | Modelo original |
|---|---|---|
| Divergencia KL | 0.0975 | 0 (por definicion) |
| Rechazos (sobre 100 peticiones) | 10/100 | 93/100 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 494M parametros, en precision FP16 ocupa aproximadamente 1 GB de VRAM. En cuantizacion de 8 bits (Q8) ocuparia unos 500 MB, y en 4 bits (Q4) unos 250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso iGPUs modernas. Tambien es viable en Apple Silicon con Metal.
- Consumer GPU: si, cabe perfectamente en GPUs de consumo. Incluso puede ejecutarse en CPU con razonable velocidad gracias a su tamano reducido.
- Opciones de despliegue: compatible con HuggingFace Transformers, vLLM, llama.cpp, Ollama (el modelo base Qwen2.5-0.5B esta disponible en Ollama), TGI (text-generation-inference, como indican los tags de la model card) y cualquier framework que soporte arquitectura Qwen2.
- Latencia y throughput: no se proporcionan datos especificos, pero por el tamano del modelo se espera una generacion de decenas de tokens por segundo incluso en CPU, y cientos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-heretic-test-v2 | 0.49B | 32K | Apache-2.0 | 10/100 | Version ablacionada sin censura |
| Qwen/Qwen2.5-0.5B-Instruct (original) | 0.49B | 32K | Apache-2.0 | 93/100 | Modelo oficial con alineacion estandar |
| megabytes/Qwen2.5-0.5B-Instruct-heretic | 0.49B | 32K | Apache-2.0 | No disponible | Otra version ablacionada del mismo modelo base |
| dolphin-2.6-qwen2-0.5b (referencia) | 0.5B | 32K | Apache-2.0 | No disponible | Fine-tuning de Qwen2-0.5B orientado a menos censura |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de benchmarks para comparar rendimiento en tareas estandar.

## Limitaciones y advertencias

- Tamano reducido: con solo 0.49B parametros, el modelo tiene capacidades limitadas de razonamiento, conocimiento factual y generacion de codigo complejo en comparacion con modelos de mayor tamano.
- Riesgo de contenido inapropiado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin advertencia. No es apto para uso directo en aplicaciones orientadas al publico general sin capas de moderacion adicionales.
- Sesgos y alucinaciones: hereda los sesgos del modelo base y puede alucinar hechos, especialmente en tematicas especializadas. La ablacion puede aumentar la confianza en respuestas incorrectas.
- Idioma: la model card indica soporte solo para ingles, aunque el modelo base soporta 29 idiomas. El rendimiento en otros idiomas puede degradarse.
- Calidad de la ablacion: la divergencia KL de 0.0975 indica que el comportamiento difiere del original; aunque se preserva la mayor parte, pueden existir degradaciones sutiles en la coherencia o el estilo de las respuestas.
- Estado experimental: el nombre "test-v2" y el perfil del autor sugieren que es un experimento sin garantias de mantenimiento, soporte o estabilidad para produccion.
- Sin garantias de seguridad: el autor no proporciona ninguna garantia sobre el comportamiento del modelo. Su uso en produccion requiere evaluacion exhaustiva y medidas de mitigacion de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dalatexcoder/Qwen2.5-0.5B-Instruct-heretic-test-v2
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Version ablacionada alternativa: https://huggingface.co/megabytes/Qwen2.5-0.5B-Instruct-heretic
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Referencia en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
