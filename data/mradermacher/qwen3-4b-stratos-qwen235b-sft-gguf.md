# mradermacher/Qwen3-4B-Stratos-Qwen235B-SFT-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `RationalPursuit/Qwen3-4B-Stratos-Qwen235B-SFT`, un fine-tuning del modelo denso Qwen3-4B de la familia Qwen3. El nombre sugiere que el ajuste se realizó mediante supervisión (SFT) utilizando datos generados por el modelo Qwen3-235B-A22B, probablemente con el objetivo de transferir capacidades de razonamiento o estilo de un modelo mucho mayor a uno compacto de 4 mil millones de parámetros. El autor, mradermacher, es un publicador habitual de cuantizaciones GGUF, lo que facilita la ejecución local en hardware modesto.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un fine-tuning específico de Qwen3-4B, permitiendo a desarrolladores e investigadores probar variantes de SFT sin necesidad de acceder al modelo original en formato completo. Al estar disponible en múltiples niveles de cuantización (desde Q2_K hasta Q8_0 y f16), se adapta a diferentes restricciones de memoria y requisitos de calidad. No se dispone de información detallada sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas resultantes, más allá de lo que se infiere del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso de 4 mil millones de parámetros perteneciente a la familia Qwen3, que en su versión original soporta una ventana de contexto de 32 768 tokens y fue entrenado con un corpus multilingüe. El nombre "Stratos-Qwen235B-SFT" indica que este fine-tuning se realizó mediante aprendizaje supervisado (SFT) utilizando probablemente datos generados por el modelo Qwen3-235B-A22B, un modelo de mezcla de expertos (MoE) con 235 mil millones de parámetros totales y 22 mil millones activos. Esta técnica de destilación o transferencia de conocimiento es común para mejorar las capacidades de modelos pequeños usando salidas de modelos grandes.

No se dispone de información adicional sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas en el fine-tuning. La cuantización GGUF fue realizada por mradermacher, quien aplicó los formatos estándar de llama.cpp, incluyendo cuantizaciones K-quants y IQ.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3-4B, conserva las capacidades generales de generación de lenguaje, aunque no se han publicado evaluaciones específicas para esta variante.
- Soporte de tool calling y function calling: el modelo base Qwen3-4B soporta estas funcionalidades, pero no se confirma si el fine-tuning las mantiene.
- Capacidades multilingües: el modelo base fue entrenado con datos multilingües, pero no se especifican los idiomas para esta versión.
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio. El nombre "Stratos" podría referirse a un estilo o dominio concreto, pero no hay información al respecto.

## Casos de uso

- Inferencia local en CPU o GPU de gama media: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en equipos con poca memoria, por ejemplo Q4_K_S ocupa aproximadamente 2,5 GB, lo que permite usarlo en portátiles o mini-PCs.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de 4B, es adecuado para probar flujos conversacionales en entornos de desarrollo sin necesidad de infraestructura cloud.
- Experimentación con fine-tunings derivados de Qwen3-235B: investigadores pueden evaluar si la destilación de un modelo grande a uno pequeño produce mejoras en tareas específicas, comparando con el Qwen3-4B original.
- Despliegue en edge devices: con cuantizaciones extremas como Q2_K (aproximadamente 1,5 GB), es viable en dispositivos con recursos limitados, como Raspberry Pi 5 o similares.
- Generación de código asistida: si el fine-tuning conserva las capacidades de código de Qwen3-4B, puede usarse en entornos de desarrollo integrado (IDE) mediante servidores locales compatibles con GGUF (llama.cpp, Ollama).
- Educación y demostraciones: por su tamaño reducido, es útil para enseñar conceptos de LLMs, cuantización y despliegue local en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este fine-tuning específico. Se recomienda consultar el repositorio original de `RationalPursuit/Qwen3-4B-Stratos-Qwen235B-SFT` para posibles evaluaciones, aunque no se ha encontrado ninguna en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para 4B parámetros):
  - Q2_K: ~1,5 GB
  - Q3_K_M: ~2,0 GB
  - Q4_K_S: ~2,5 GB
  - Q5_K_M: ~3,0 GB
  - Q8_0: ~4,5 GB
  - f16: ~8,0 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 3050) para cuantizaciones Q4 o inferiores. Para Q8_0 o f16 se recomienda 6-8 GB (RTX 3060, RTX 4060, etc.).
- En CPU: es viable con 8-16 GB de RAM, especialmente con cuantizaciones Q4 o inferiores, usando llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con compatibilidad GGUF limitada), o TGI (si se convierte a otro formato).
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU moderna (RTX 4090) con Q4_K_S, se espera una velocidad de generación de 50-100 tokens por segundo; en CPU, 5-15 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (original) | 4B | 32K | Apache 2.0 | safetensors | Modelo base sin fine-tuning |
| Qwen3-4B-Stratos-Qwen235B-SFT (este) | 4B | No disponible | No disponible | GGUF | Fine-tuning con datos de Qwen3-235B |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | safetensors, GGUF | Alternativa de tamaño similar, con licencia de uso comercial restringido |
| Phi-3.5-mini | 3.8B | 128K | MIT | safetensors, GGUF | Modelo compacto de Microsoft, buen rendimiento en razonamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos para esta variante específica. La comparación se basa en características generales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen3-4B, puede heredar sesgos presentes en el modelo base, aunque no se han documentado específicamente.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el fine-tuning; podría ser inferior a la del modelo base.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Aunque Qwen3-4B es Apache 2.0, el fine-tuning podría tener condiciones adicionales. Se recomienda contactar con el autor original antes de uso comercial.
- Caveat de producción: al ser una cuantización GGUF, puede haber pérdida de calidad respecto al modelo original en precisión flotante. Se recomienda probar con la cuantización más alta posible según los recursos.
- Falta de documentación: no hay model card detallada, por lo que se desconoce el proceso exacto de entrenamiento, los datos utilizados y las capacidades específicas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3-4B-Stratos-Qwen235B-SFT-GGUF
- Modelo original (fuente): https://huggingface.co/RationalPursuit/Qwen3-4B-Stratos-Qwen235B-SFT
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Página de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
