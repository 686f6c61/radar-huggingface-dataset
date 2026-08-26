# kfish610/olmo3-7b-agda-pairs-delim-sft

## Resumen

El modelo `kfish610/olmo3-7b-agda-pairs-delim-sft` es un ajuste fino (SFT) del modelo base `allenai/Olmo-3-7B-Instruct`, desarrollado por el usuario kfish610. Este modelo está especializado en el procesamiento de pares de código Agda con delimitadores específicos, lo que sugiere un enfoque en tareas de generación, traducción o verificación de código formal. Aunque el modelo base ya cuenta con capacidades de razonamiento y código, este ajuste busca optimizar su comportamiento para datos estructurados en pares con delimitadores, probablemente para tareas de síntesis o análisis de programas Agda.

El modelo tiene un tamaño de 7B parámetros, un contexto de 32K tokens y es parte de la familia OLMo de AI2, que se caracteriza por ser completamente abierta y reproducible. La licencia no está disponible en la información proporcionada, y el repositorio tiene 3.5 GB, lo que sugiere pesos en formato safetensors. Su relevancia radica en ser un ejemplo de ajuste fino para dominios específicos (lenguaje de programación formal) sobre una base sólida y bien documentada, aunque su descarga y uso público son actualmente muy limitados (0 descargas, 0 likes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-3) |
| Parámetros totales | 7.000 millones (7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens (según modelo base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (inglés y código, según modelo base) |
| Licencia | no disponible (model card indica "license" sin especificar) |
| Formato de pesos | safetensors (repo de 3.5 GB) |

## Arquitectura y entrenamiento

El modelo base, `Olmo-3-7B-Instruct`, es un transformer decoder-only de 7B parámetros desarrollado por AI2. Su arquitectura incluye atención de ventana deslizante (sliding window attention) para manejar contextos largos de hasta 3.072 tokens, y está entrenado con un pipeline de instrucción y RLHF para mejorar el seguimiento de instrucciones y el razonamiento. El ajuste fino se realizó con TRL (Transformers Reinforcement Learning) versión 1.5.1, usando el método SFT (Supervised Fine-Tuning) sobre un dataset de pares Agda con delimitadores. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición del dataset, pero el nombre sugiere que los datos consisten en pares de código Agda con delimitadores específicos (probablemente para tareas de traducción o corrección). El entrenamiento se llevó a cabo con PyTorch 2.11.0+cu128 y Transformers 5.9.0, y el repositorio incluye los archivos de configuración de entrenamiento.

## Capacidades

- Generación de texto y código, con especialización en el lenguaje de programación Agda (lenguaje funcional con tipos dependientes).
- Seguimiento de instrucciones de tipo chat multi-turno, heredado del modelo base.
- Soporte de tool calling y function calling, según el modelo base Olmo-3-7B-Instruct.
- Razonamiento de pasos múltiples y capacidades de agente, gracias a la base OLMo-3.
- Multilingüismo limitado al inglés y posiblemente otros idiomas, pero no se especifica.
- Capacidad de procesar código con delimitadores específicos, lo que permite tareas de análisis o transformación de código estructurado.

## Casos de uso

- **Asistencia en desarrollo de software formal**: el modelo puede ayudar a programadores a escribir y depurar código Agda, aprovechando su ajuste en pares de código con delimitadores. Un desarrollador podría usarlo para generar pruebas o especificaciones a partir de fragmentos de código.
- **Traducción de código Agda a otros lenguajes**: dado que está entrenado con pares, puede utilizarse en pipelines de traducción de código formal a lenguajes más comunes, como Haskell o Python, para facilitar la interoperabilidad.
- **Verificación de propiedades en contratos inteligentes**: Agda se usa en verificación formal de contratos. El modelo puede ayudar a generar invariantes y teoremas para verificar la seguridad de contratos en blockchain.
- **Educación y tutoría en programación formal**: un asistente educativo que explique conceptos de Agda, proporcione ejemplos de código y ayude a los estudiantes a completar ejercicios de demostración de teoremas.
- **Análisis de código en CI/CD**: integración del modelo en pipelines de integración continua para revisar automáticamente código Agda, detectar errores de tipo o sugerir mejoras basadas en patrones aprendidos.
- **Generación de documentación técnica**: el modelo puede generar explicaciones en lenguaje natural de código Agda, facilitando la documentación de bibliotecas y proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un ajuste fino con 0 descargas, por lo que no hay datos de rendimiento en tareas estándar (MMLU, HumanEval, etc.) ni comparaciones con otros modelos. Se recomienda evaluar el modelo en tareas específicas de Agda antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16 para el modelo de 7B parámetros. Con cuantización de 4 bits (GPTQ/AWQ) podría reducirse a ~4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) para FP16, o RTX 3060/4070 (12 GB) con cuantización de 4 bits. Para uso en servidores, A100 40 GB o H100.
- Sí cabe en GPU de consumo con cuantización, pero no se proporcionan archivos GGUF o AWQ en el repositorio.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp (si se convierten los pesos a GGUF), o directamente con Transformers pipeline.
- Latencia y throughput: no disponible, pero en un modelo de 7B con vLLM en A100 se puede esperar un throughput de 20-30 tokens/s por usuario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kfish610/olmo3-7b-agda-pairs-delim-sft | 7B | 3.072 | no disponible | no disponible | HuggingFace (0 descargas) |
| allenai/Olmo-3-7B-Instruct | 7B | 3.072 | MMLU ~68.4 | Apache 2.0 | HuggingFace |
| Llama-3-8B-Instruct | 8B | 8.192 | MMLU ~68.4 | Llama 3 License | HuggingFace |
| Mistral-7B-Instruct | 7B | 32.768 | MMLU ~62.5 | Apache 2.0 | HuggingFace |

La comparativa se basa en el modelo base, ya que el ajuste fino no tiene datos propios. El modelo base Olmo-3-7B-Instruct ofrece un rendimiento competitivo en tareas de instrucción y código, pero el ajuste especializado en Agda puede ser superior en tareas de dominio específico, aunque no hay evidencia pública.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base, que pueden reflejar sesgos de los datos de entrenamiento de Olmo-3.
- Riesgo de alucinación: alto en tareas de código, especialmente en Agda, donde la sintaxis y las reglas de tipo son estrictas. Se recomienda verificación automática.
- Limitaciones de contexto: el contexto de 3.072 tokens es limitado para tareas que requieren analizar archivos grandes o proyectos completos.
- Restricciones de licencia: la licencia no está especificada, lo que dificulta su uso comercial. Se recomienda contactar al autor.
- Caveat de producción: el modelo tiene 0 descargas y no ha sido validado por la comunidad. Su uso en producción requiere pruebas exhaustivas y evaluación de seguridad.

## Enlaces

- Página del modelo: https://huggingface.co/kfish610/olmo3-7b-agda-pairs-delim-sft
- Dataset de pares Agda: https://huggingface.co/datasets/kfish610/agda-pairs
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Página de OLMo: https://allenai.org/olmo
- Repositorio de OLMo: https://github.com/allenai/OLMo
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
