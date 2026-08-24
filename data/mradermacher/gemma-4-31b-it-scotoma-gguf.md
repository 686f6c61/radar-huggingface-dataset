# mradermacher/gemma-4-31B-it-scotoma-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `ReadyArt/gemma-4-31B-it-scotoma`, una variante ajustada del modelo Gemma 4 31B IT desarrollado por Google DeepMind. El autor, mradermacher, ha convertido los pesos originales a formato GGUF para permitir su ejecución eficiente con herramientas como llama.cpp, Ollama o vLLM, reduciendo los requisitos de VRAM y facilitando el despliegue en hardware de consumo. El modelo base presenta una arquitectura de 31.000 millones de parámetros (30.697.345.596 en safetensors) y, según las especificaciones de Google para Gemma 4, soporta una ventana de contexto de hasta 256K tokens y capacidades multimodales (texto e imagen). Este repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta Q8_0) además de archivos de proyección multimodal (mmproj) para habilitar la entrada de imágenes. Aunque la model card indica que el idioma principal es el inglés, el modelo base de Google es multilingüe en más de 140 idiomas, aunque esta variante concreta no lo especifica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia Gemma 4, probablemente Transformer denso) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens (según el modelo base Gemma 4 31B de Google) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, y archivos mmproj (Q8_0 y f16) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 (con enlace a licencia específica de Gemma) |
| Formato de pesos | GGUF (safetensors para el modelo original, no incluido aquí) |

## Arquitectura y entrenamiento

La información disponible sobre el entrenamiento de este modelo es limitada. Se trata de una cuantización estática del modelo `ReadyArt/gemma-4-31B-it-scotoma`, que a su vez deriva del modelo oficial `google/gemma-4-31B`. Google describe Gemma 4 como una familia de modelos multimodales que combina arquitecturas densas y de mezcla de expertos (MoE), aunque no se especifica cuál es la configuración exacta para el tamaño de 31B. El modelo original se entrenó con técnicas de alineación (RLHF/DPO) y destaca por su rendimiento en razonamiento, codificación y comprensión visual. Sin embargo, no se dispone de datos concretos sobre el dataset de entrenamiento, el número de tokens o las técnicas específicas de la variante "scotoma". Esta versión GGUF no modifica los pesos originales, solo los convierte a un formato optimizado para inferencia en CPU/GPU con herramientas como llama.cpp.

## Capacidades

- Generación de texto y conversación multiturno, gracias a su arquitectura de 31B parámetros.
- Razonamiento complejo y resolución de problemas matemáticos (capacidades heredadas del modelo base).
- Codificación de software y soporte de tool calling (probablemente, según las capacidades de Gemma 4).
- Entrada multimodal: el repositorio incluye archivos `mmproj` que permiten procesar imágenes, lo que habilita usos como descripción visual o análisis de capturas.
- Soporte para contextos largos: hasta 256K tokens en el modelo base, útil para documentos extensos o conversaciones prolongadas.
- Compatibilidad con frameworks de inferencia GGUF: llama.cpp, Ollama, LM Studio, etc.

## Casos de uso

- Asistente de programación: con su capacidad de razonamiento y generación de código, puede integrarse en entornos de desarrollo como un copiloto local, aprovechando la cuantización Q4_K_M para ejecutarse en una GPU de 24 GB.
- Análisis de documentos extensos: gracias a la ventana de contexto de 256K tokens, es adecuado para resumir libros técnicos, informes legales o artículos de investigación completos en una sola pasada.
- Chatbot de atención al cliente: su habilidad para mantener conversaciones coherentes en múltiples turnos lo hace viable para sistemas de soporte automático, especialmente con la cuantización Q5_K_M para calidad de respuesta.
- Procesamiento de imágenes con texto: al incluir el archivo `mmproj`, puede extraer información de capturas de pantalla, diagramas o documentos escaneados, útil en automatización de tareas de back-office.
- Generación de contenido técnico: redacción de documentación, tutoriales o respuestas en foros, aprovechando su capacidad de razonamiento y su estilo conversacional.
- Investigación en IA: al ser un modelo abierto con licencia Apache 2.0, es útil para experimentos de fine-tuning o para probar técnicas de cuantización en modelos de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base (Gemma 4 31B IT) ha sido evaluado por Google en tareas como MMLU, HumanEval, GSM8K, y otras, pero estos datos no se han replicado para la variante "scotoma" ni para las cuantizaciones GGUF. Se recomienda ejecutar pruebas propias para evaluar la degradación de precisión según el nivel de cuantización.

## Requisitos de hardware

- La cuantización Q2_K (12.0 GB) puede ejecutarse en una GPU con 12-16 GB de VRAM, como una RTX 3060 12GB o RTX 4070.
- Las cuantizaciones Q4_K_M (18.8 GB) y Q4_K_S (17.9 GB) requieren al menos 20 GB de VRAM; recomendadas para GPUs como RTX 3090, RTX 4090, o A100.
- Q8_0 (32.7 GB) necesita más de 40 GB de VRAM, ideal para A100 40GB o H100.
- El archivo `mmproj` adicional ocupa entre 0.9 y 1.3 GB, a sumar a la VRAM.
- Para CPU: puede ejecutarse con llama.cpp, pero la velocidad será baja para modelos de 31B; se recomienda al menos 32 GB de RAM.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), y cualquier framework que soporte GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Cuantizaciones GGUF |
|---|---|---|---|---|---|
| google/gemma-4-31B | 31B | 256K | Densa (presumible) | Apache 2.0 | No oficial (se puede cuantificar) |
| google/gemma-4-26B-A4B (MoE) | 26B (activos 4B) | 256K | MoE | Apache 2.0 | No disponible |
| mradermacher/gemma-4-31B-it-scotoma-GGUF | 31B | 256K | Densa (presumible) | Apache 2.0 | Sí (este repo) |
| meta-llama/Llama-3.1-30B-Instruct | 30B | 128K | Densa | Llama 3 license | Sí |

Nota: los datos de Gemma 4 provienen de la página de Google, no de la model card de este repo. La comparación se basa en el tamaño y el contexto, pero no hay datos de rendimiento.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o sesgada. No se ha evaluado específicamente esta variante.
- **Idioma**: la model card indica solo inglés, aunque el modelo base de Google soporta más idiomas; es posible que esta variante tenga un rendimiento inferior en otros idiomas.
- **Degradación por cuantización**: las cuantizaciones de menor precisión (Q2_K, Q3_K) pueden reducir la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- **Licencia**: aunque la licencia es Apache 2.0, Google exige el cumplimiento de su política de uso de Gemma (enlace en la model card). Se recomienda revisar las restricciones antes de usar comercialmente.
- **Contexto de 256K**: aunque el modelo base lo soporta, la cuantización GGUF puede no conservar el rendimiento completo en contextos muy largos; se recomienda probar con tamaños moderados.
- **Despliegue en producción**: al ser un modelo de 31B, requiere infraestructura considerable; para entornos con recursos limitados se sugiere usar cuantizaciones Q4_K_M o inferiores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Modelo oficial de Google: https://huggingface.co/google/gemma-4-31B
- Página de cuantizaciones i1 (con imatrix): https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-i1-GGUF
- Referencia de Gemma 4 en NVIDIA: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Página de exploración del modelo (LLM Explorer): https://llm-explorer.com/model/ReadyArt%2Fgemma-4-31B-it-scotoma-2,72sD2D41CSiRwu6jn8U3Z3 (aunque corresponde a la versión 2, puede servir de referencia)
