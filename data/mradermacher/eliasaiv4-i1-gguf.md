# mradermacher/EliasAIv4-i1-GGUF

## Resumen

EliasAIv4-i1-GGUF es una recopilación de cuantizaciones GGUF del modelo ETME-TECH/EliasAI-7B-v1.0, un ajuste fino (fine-tune) de Qwen2.5-7B orientado a conversación en alemán. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y emplea cuantizaciones con imatrix (importance matrix) para preservar mejor la calidad en los rangos bajos de bits. El modelo base cuenta con 7.615.616.512 parámetros reales (según los tensores en safetensors) y hereda la arquitectura transformer densa de la familia Qwen2.5.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 7B especializado en alemán en hardware de consumo, desde equipos con poca VRAM (variantes IQ1/IQ2 de 2-3 GB) hasta configuraciones de 8-12 GB (Q5_K_M, Q6_K). Al estar construido sobre Qwen2.5, conserva el tokenizador y el formato de chat de dicha familia, lo que facilita su integración en herramientas como llama.cpp, Ollama o servidores compatibles con la API de OpenAI. La licencia Apache 2.0 del modelo base y de esta cuantización elimina fricciones para uso comercial.

El repositorio ocupa 89 GB porque incluye todas las variantes de cuantización (desde IQ1_S de 2,0 GB hasta Q6_K de 6,4 GB) más el fichero imatrix. No se dispone de información publicada sobre el proceso de entrenamiento del fine-tune, los datos utilizados ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-7B, sin confirmar en la model card) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen2.5-7B, un transformer decoder-only denso con 7.615 millones de parámetros. La model card de la cuantización no documenta la composición del dataset de ajuste fino, el número de tokens empleados, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se detalla si se modificó el tokenizador o la ventana de contexto respecto al modelo original. La etiqueta "conversational" y el idioma "de" indican que el ajuste se orientó a diálogo en alemán.

La innovación técnica de este repositorio no está en el modelo, sino en el proceso de cuantización: mradermacher emplea cuantizaciones i1 (imatrix) que usan una matriz de importancia calculada sobre un corpus de calibración para asignar más bits a los pesos con mayor impacto en la perplejidad. Esto permite que variantes como IQ3_S (3,6 GB) superen en calidad a cuantizaciones estáticas del mismo tamaño, según las notas del propio autor. El repositorio incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto y conversación multi-turno en alemán, con estilo conversacional.
- Razonamiento y respuesta a preguntas generales, heredado de las capacidades de Qwen2.5-7B.
- Generación de código y matemáticas básicas (capacidad del modelo base, no validada específicamente para este fine-tune).
- Soporte de tool calling / function calling: no confirmado en la model card para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al alemán según la etiqueta de idioma; el modelo base Qwen2.5 es multilingüe, pero el fine-tune declara solo "de".
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en alemán para atención al cliente: el modelo puede mantener diálogos multi-turno en alemán con un tono conversacional, desplegado en local con llama.cpp u Ollama para evitar enviar datos de clientes a la nube.
- Chatbot de soporte interno para empresas germanoparlantes: al ser Apache 2.0, se puede integrar en herramientas internas sin coste de licencia, usando la cuantización Q4_K_M (4,8 GB) en estaciones de trabajo con GPU de 8 GB.
- Generación de borradores de correo y documentación en alemán: el fine-tune conversacional es adecuado para redactar textos cotidianos; la variante Q5_K_M (5,5 GB) ofrece un equilibrio razonable entre calidad y velocidad en una RTX 3060 de 12 GB.
- Prototipado de aplicaciones de IA en alemán en portátiles: las variantes IQ2/IQ3 (2,4-3,7 GB) permiten ejecutar el modelo en CPU o en GPUs integradas, útil para demos y pruebas de concepto sin infraestructura dedicada.
- Evaluación comparativa de fine-tunes alemanes: el repositorio ofrece 24 cuantizaciones del mismo modelo, lo que permite medir el impacto de la compresión en la calidad de las respuestas en alemán con un único modelo de referencia.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local y con licencia permisiva, encaja en escenarios sanitarios o legales donde el texto no puede salir de la organización.
- Investigación sobre cuantización: el fichero imatrix incluido permite reproducir o generar nuevas cuantizaciones y estudiar la relación entre bits por peso y perplejidad en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto):
  - IQ1_S / IQ1_M: ~2,0-2,1 GB.
  - IQ2_XXS a IQ2_M: ~2,4-2,9 GB.
  - Q2_K_S / Q2_K: ~2,9-3,1 GB.
  - IQ3_XXS a Q3_K_L: ~3,2-4,2 GB.
  - IQ4_XS a Q4_1: ~4,3-5,0 GB.
  - Q5_K_S / Q5_K_M: ~5,4-5,5 GB.
  - Q6_K: ~6,4 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M con contexto amplio; RTX 4090 24 GB para Q6_K con contexto largo; A100/H100 solo si se necesita alto throughput en servidor.
- Cabe en GPU de consumo: sí, desde GPUs de 4 GB (variantes IQ1/IQ2) hasta 8-12 GB (Q4/Q5). Las variantes de 2-3 GB también funcionan en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo indica), y cualquier runtime que soporte GGUF. No se recomienda vLLM ni TGI para GGUF sin conversión previa.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EliasAIv4-i1-GGUF (este) | 7,6B | No disponible | Alemán | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (modelo base, no confirmado aquí) | Multilingüe | Apache 2.0 | Safetensors, GGUF |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Multilingüe | Llama 3.1 Community License | Safetensors, GGUF |
| Mistral 7B Instruct | 7,3B | 32.000 tokens | Multilingüe | Apache 2.0 | Safetensors, GGUF |

La comparación con Qwen2.5-7B-Instruct es la más directa, ya que este fine-tune deriva de él; la diferencia principal es la especialización en alemán y la disponibilidad de cuantizaciones imatrix. Frente a Llama 3.1 8B, la licencia Apache 2.0 es más permisiva para uso comercial, aunque no se dispone de datos de rendimiento comparativo para este fine-tune concreto.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del fine-tune; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo original.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- El modelo declara únicamente alemán; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del Qwen2.5 original.
- La longitud de contexto no está documentada en la model card; conviene verificar la configuración antes de usarlo con contextos largos.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable; el propio autor desaconseja IQ1/IQ2 salvo para hardware muy limitado.
- No se ha validado el soporte de tool calling ni de agentes para este fine-tune específico; no asumir que funciona igual que Qwen2.5-7B-Instruct.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base.
- El repositorio de 89 GB incluye todas las variantes; descargar solo el fichero GGUF necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EliasAIv4-i1-GGUF
- Modelo base: https://huggingface.co/ETME-TECH/EliasAI-7B-v1.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/EliasAIv4-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#EliasAIv4-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
