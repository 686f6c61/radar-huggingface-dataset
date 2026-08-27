# DismasK/My-Uncensored-14B

## Resumen

My-Uncensored-14B es un modelo de lenguaje creado por DismasK mediante la fusion lineal de dos modelos de 14B parametros: Qwen/Qwen2.5-14B-Instruct y cognitivecomputations/Dolphin3.0-R1-Qwen-14B. El objetivo declarado es combinar las capacidades de instruccion y razonamiento de Qwen2.5 con el comportamiento menos censurado de Dolphin3.0-R1, ofreciendo una alternativa para casos de uso donde los modelos fuertemente alineados rechazan peticiones. Se distribuye bajo licencia Apache 2.0.

El modelo se construyo con LazyMergeKit, aplicando un metodo de fusion lineal con pesos 0.5/0.5 y precision float16. Al ser un merge, no hubo entrenamiento adicional: hereda la arquitectura transformer decoder-only de Qwen2.5-14B, con 14B parametros y ventana de contexto heredada del modelo base. Su relevancia es limitada por ahora: registra cero descargas y cero likes en HuggingFace, y no se han publicado evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-14B) |
| Parametros totales | 14B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-14B-Instruct, que soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-14B-Instruct, que soporta multiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga estandar via `from_pretrained` con `torch.float16`) |

## Arquitectura y entrenamiento

My-Uncensored-14B es un merge lineal, no un modelo entrenado desde cero. La configuracion de LazyMergeKit especifica una fusion lineal con peso 0.5 para cada modelo base, en precision float16. El modelo resultante combina los pesos de Qwen2.5-14B-Instruct (modelo de instruccion de la familia Qwen2.5, con entrenamiento supervisado y optimizacion por preferencias) y Dolphin3.0-R1-Qwen-14B (variante de Qwen2.5-14B ajustada para reducir rechazos y con razonamiento estilo R1). No se dispone de informacion sobre datos de entrenamiento adicionales, ya que el merge no implica entrenamiento propio.

La arquitectura resultante es identica a la de Qwen2.5-14B: transformer decoder-only con atencion completa, normalizacion pre-RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No incorpora innovaciones tecnicas propias mas alla de la fusion de pesos.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredadas de Qwen2.5-14B-Instruct.
- Comportamiento menos censurado que el modelo base, gracias al componente Dolphin3.0-R1, con menor tendencia a rechazar peticiones sobre temas controvertidos o adultos.
- Capacidades de codigo y matematicas heredadas de Qwen2.5-14B, aunque sin verificacion independiente en este merge concreto.
- Soporte multilingue heredado de Qwen2.5-14B-Instruct, sin confirmacion especifica para esta fusion.
- No se ha confirmado soporte de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones: el modelo puede mantener conversaciones de personaje con tematicas adultas o controvertidas que los modelos alineados rechazarian, gracias a la influencia de Dolphin3.0-R1.
- Generacion de ficcion con contenido explicito: escritura de relatos, dialogos o guiones con escenas de violencia, sexo o lenguaje soez, util para autores que trabajan generos no censurables en modelos comerciales.
- Investigacion academica sobre alineacion y censura: permite estudiar como se comporta un modelo con pesos fusionados de un modelo alineado y otro desalineado, comparando tasas de rechazo y calidad de respuesta.
- Desarrollo de asistentes de nicho con tono menos restrictivo: chatbots para comunidades que prefieren respuestas directas sin avisos de seguridad, como foros especializados o herramientas internas.
- Analisis de contenido politicamente sensible: generacion de resumenes o analisis sobre temas donde los modelos alineados suelen negarse a responder, como ciertos debates politicos o religiosos.
- Pruebas de robustez y red teaming: evaluar hasta que punto la fusion lineal diluye o mantiene las salvaguardas del modelo base, util para investigadores de seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Al ser un merge sin validacion publica, no es posible comparar su rendimiento cuantitativo con los modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 28 GB, lo que requiere una GPU profesional (A100 40GB, H100) o dos GPU consumer de 16 GB en paralelo.
- Con cuantizacion a 8 bits: aproximadamente 14 GB de VRAM, ejecutable en una RTX 4080/4090 (16-24 GB) o RTX 3090 (24 GB).
- Con cuantizacion a 4 bits: aproximadamente 7-8 GB de VRAM, ejecutable en GPUs consumer de gama media como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, text-generation-webui y Transformers con `device_map="auto"`, como muestra el codigo de uso del autor.
- Latencia y throughput: no disponible. Al ser un modelo de 14B, se espera un rendimiento similar a otros modelos de ese tamano, pero sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DismasK/My-Uncensored-14B | 14B | no disponible (heredado de Qwen2.5) | Apache 2.0 | Merge lineal de Qwen2.5-14B-Instruct y Dolphin3.0-R1 |
| nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored | 14B | 128K (heredado de DeepSeek-R1-Distill) | MIT | Finetune de DeepSeek-R1-Distill-Qwen-14B con dataset de desensura |
| Microsoft/Phi-4 | 14B | 16K | MIT | Modelo de razonamiento con fuerte alineacion, no desensurado |

La comparativa se basa en datos publicos de los modelos mencionados. My-Uncensored-14B se diferencia por ser un merge sin entrenamiento adicional, mientras que DeepSeek-R1-Distill-Qwen-14B-Uncensored es un finetune con dataset especifico. Phi-4 no es desensurado y se incluye como referencia de un 14B alineado.

## Limitaciones y advertencias

- Sin evaluacion publica: no hay benchmarks, ni validacion de calidad del merge, ni pruebas de que la fusion lineal preserve las capacidades de los modelos base.
- Riesgo de alucinacion: al ser un merge sin ajuste posterior, puede heredar o amplificar tendencias a generar contenido falso o inconsistente, especialmente en temas controvertidos.
- Comportamiento impredecible: la fusion lineal con pesos 0.5 puede producir respuestas inconsistentes entre el estilo alineado de Qwen2.5 y el desalineado de Dolphin3.0-R1, sin garantia de coherencia.
- Contenido potencialmente inapropiado: al ser un modelo desensurado, puede generar contenido ofensivo, ilegal o danino. El uso en produccion requiere moderacion externa obligatoria.
- Cero adopcion: el modelo registra 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido probado por la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias de ningun tipo sobre el comportamiento del modelo.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero al derivar de Qwen2.5, hereda los sesgos de su dataset de entrenamiento, sin mitigaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DismasK/My-Uncensored-14B
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo base Dolphin3.0-R1-Qwen-14B: https://huggingface.co/cognitivecomputations/Dolphin3.0-R1-Qwen-14B
- LazyMergeKit (Colab): https://colab.research.google.com/drive/1obulZ1ROXHjYLn6PPZJwRR6GzgQogxxb?usp=sharing
- Lista de modelos desensurados (referencia): https://github.com/samssouza/uncensored-ai-list
