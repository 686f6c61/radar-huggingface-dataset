# llm-jp/llm-jp-4-32b-a3b-thinking-gguf

## Resumen

El modelo **llm-jp-4-32b-a3b-thinking-gguf** es una variante cuantizada en formato GGUF del modelo de lenguaje llm-jp-4-32b-a3b-thinking, desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japón. Se trata de un modelo de arquitectura Transformer con mezcla de expertos (MoE) de 32 mil millones de parámetros totales, de los cuales solo 3,8 mil millones se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Su ventana de contexto alcanza los 65.536 tokens, y está especializado en los idiomas japonés e inglés.

La variante "thinking" ha sido alineada mediante supervisión fina (SFT) y optimización directa de preferencias (DPO), sin refuerzo, y está diseñada para tareas de razonamiento y conversación. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia actual radica en que es uno de los modelos de código abierto más avanzados para el procesamiento del japonés, con una arquitectura MoE eficiente y un contexto muy amplio, comparable a otros modelos de su categoría como Qwen2.5-32B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 32.139.028.992 (32B) |
| Parametros activos | 3.827.476.992 (3,8B) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible (formato GGUF) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible en safetensors en el repositorio base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer estándar con capas de mezcla de expertos: 32 capas, tamaño oculto de 2.560, 40 cabezas de atención, 128 expertos enrutados y 8 expertos activados por token. Esta configuración MoE permite activar solo 3,8 mil millones de parámetros por inferencia, reduciendo significativamente el coste computacional en comparación con un modelo denso de 32 mil millones. El tokenizador se basa en un modelo Unigram con byte-fallback, derivado de llm-jp-tokenizer v4.0, y su plantilla de chat es compatible con el formato de respuesta OpenAI Harmony, aunque requiere el tokenizador propio del modelo.

El entrenamiento se realizó en varias fases: pre-entrenamiento y mid-entrenamiento con un total de 11,7 billones de tokens, utilizando corpus públicos (llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2). Posteriormente, el modelo se ajustó mediante SFT y se alineó con DPO, sin emplear aprendizaje por refuerzo. Los datasets de post-entrenamiento también son públicos. Cabe destacar que, según la documentación, la variante "thinking" se entrena con SFT y DPO, a diferencia de la variante "instruct" que solo usa SFT.

## Capacidades

- Generación de texto y conversación multi-turno en japonés e inglés, con soporte de plantilla de chat compatible con OpenAI Harmony.
- Razonamiento y resolución de problemas complejos gracias a la variante "thinking", que incorpora un modo de razonamiento explícito.
- Generación de código en múltiples lenguajes de programación (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript), según la metadata del modelo.
- Manejo de contextos largos de hasta 65.536 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües centradas en japonés e inglés, con especial énfasis en el japonés.
- Soporte de tool calling y function calling no confirmado explícitamente en la información disponible, aunque la arquitectura y el entrenamiento general sugieren compatibilidad con tareas de agente (no verificado).

## Casos de uso

- **Atención al cliente automatizada en japonés**: el modelo puede gestionar conversaciones multi-turno con contexto largo (65.536 tokens), lo que permite mantener el historial completo de una interacción sin truncamientos, ideal para soporte técnico o comercial en empresas japonesas.
- **Generación de código en entornos de producción**: con soporte para múltiples lenguajes de programación, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs, aprovechando su capacidad de razonamiento para tareas de refactorización.
- **Análisis y resumen de documentos legales o técnicos**: su ventana de contexto amplia permite procesar contratos, patentes o informes extensos en japonés e inglés, extrayendo información clave o generando resúmenes ejecutivos.
- **Asistente de investigación académica**: puede ayudar a investigadores japoneses a redactar artículos, revisar literatura o formular hipótesis, gracias a su entrenamiento en corpus científicos y su capacidad de razonamiento.
- **Traducción y localización**: aunque no es un modelo de traducción dedicado, su bilingüismo japonés-inglés permite traducir textos con matices culturales, especialmente útil para localización de software o contenido web.
- **Chatbots educativos y tutores**: puede actuar como tutor de idiomas o de programación, explicando conceptos paso a paso y adaptándose al nivel del estudiante, con respuestas razonadas y coherentes.
- **Procesamiento de conversaciones largas en centros de contacto**: al mantener el contexto completo de una llamada o chat, puede generar resúmenes automáticos, detectar intenciones o clasificar tickets sin perder información relevante.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la informacion disponible. La documentación menciona que el modelo fue evaluado con el framework llm-jp-judge, utilizando el evaluador gpt-5.4-2026-03-05, en tareas como MT-Bench (JA/EN), AnswerCarefully (seguridad en japonés) y llm-jp-instructions (preguntas de una sola vuelta). Sin embargo, los valores concretos de las puntuaciones no se incluyen en la información proporcionada. Se recomienda consultar el repositorio oficial o el cookbook para obtener datos actualizados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización elegida. Para el modelo completo en BF16 (32B parámetros), se necesitarían aproximadamente 64 GB de VRAM. Con cuantizaciones típicas de GGUF (por ejemplo, Q4_K_M), la huella se reduce a unos 20-24 GB, y con Q8 a unos 34 GB. No se especifican las cuantizaciones incluidas en el repositorio.
- **GPU recomendadas**: para cuantizaciones bajas (Q4), una GPU de consumo como la RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente. Para cuantizaciones más altas o BF16, se requieren GPUs profesionales como A100 (40/80 GB) o H100 (80 GB).
- **Compatibilidad con GPU de consumo**: sí, con cuantizaciones de 4 bits o inferiores, el modelo cabe en GPUs de 24 GB, aunque la velocidad de inferencia dependerá del ancho de banda de memoria.
- **Opciones de despliegue**: el formato GGUF permite usar llama.cpp, pero se requiere el fork de LLM-jp (https://github.com/llm-jp/llama.cpp) porque el upstream no incluye las correcciones necesarias para el tokenizador. También se puede usar con Lemonade (según la documentación) y con transformers (para el formato safetensors).
- **Latencia y throughput**: no se proporcionan datos específicos. En general, un modelo MoE con 3,8B parámetros activos ofrece una latencia menor que un modelo denso de 32B, pero el rendimiento exacto depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de comparativa directa en la información proporcionada. Sin embargo, el modelo es comparable en arquitectura y tamaño a otros MoE de ~32B con ~3B activos, como Qwen2.5-32B-A3B o DeepSeek-V3-Lite. La principal diferencia es el enfoque en japonés y la licencia Apache 2.0, que facilita el uso comercial. No se pueden aportar cifras de rendimiento comparativas sin datos verificados.

## Limitaciones y advertencias

- **Sesgos conocidos**: al estar entrenado principalmente con corpus en japonés e inglés, puede presentar sesgos culturales o lingüísticos propios de estos idiomas. No se han documentado sesgos específicos en la información disponible.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. Se recomienda verificar las salidas en aplicaciones críticas.
- **Limitaciones de contexto**: aunque la ventana es de 65.536 tokens, el rendimiento puede degradarse en contextos muy largos si no se gestiona adecuadamente la atención.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución. No hay restricciones adicionales conocidas.
- **Requisito de fork de llama.cpp**: para usar el modelo con llama.cpp, es obligatorio compilar el fork de LLM-jp; el upstream no funciona correctamente con el tokenizador, lo que puede complicar el despliegue en entornos estándar.
- **Idiomas limitados**: solo soporta japonés e inglés; no es adecuado para otros idiomas sin un ajuste adicional.
- **Caveat de producción**: la variante "thinking" puede generar respuestas más largas y con pasos de razonamiento, lo que aumenta la latencia y el coste de inferencia en comparación con la variante "instruct".

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking-gguf
- Repositorio HuggingFace del modelo base (safetensors): https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking
- Colección de modelos LLM-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Fork de llama.cpp de LLM-jp: https://github.com/llm-jp/llama.cpp
- Framework de evaluación llm-jp-judge: https://github.com/llm-jp/llm-jp-judge
- Datasets de pre-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Datasets de mid-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Datasets de SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Datasets de DPO (para este modelo): https://huggingface.co/datasets/llm-jp/llm-jp-4-32b-a3b-thinking-dpo-data
- Sitio web del proyecto LLM-jp: https://llm-jp.nii.ac.jp/en/home-en/
