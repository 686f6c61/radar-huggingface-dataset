# AmberHeart/Uni-MOPD-Teacher-OCR

## Resumen

Uni-MOPD-Teacher-OCR es un modelo especialista en comprensión de documentos, OCR y gráficos, desarrollado por AmberHeart como parte del banco de especialistas Uni-MOPD. Se obtiene mediante post-entrenamiento desde el checkpoint base Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo vision-language con arquitectura mixture-of-experts (MoE) e instrucciones, y culmina con una fase de aprendizaje por refuerzo específica del dominio documental. No es un modelo de propósito general, sino un componente de un pipeline de destilación multi-profesor (MOPD) cuyo objetivo es integrar varios especialistas en un único estudiante unificado.

El modelo forma parte de un conjunto de cinco especialistas (STEM, VQA general, OCR/documentos, GUI grounding y comprensión encarnada) que comparten la misma arquitectura y vocabulario, lo que permite tanto la fusión en el espacio de pesos como la destilación a nivel de token. Este repositorio concreto corresponde al especialista OCR que inicia su RL de dominio desde un checkpoint SFT multi-dominio, lo que le otorga una cobertura más amplia que su variante hermana `Uni-MOPD-Teacher-OCR-Bank2`.

Con 31.070.754.032 parámetros totales en bfloat16 y pesos distribuidos en 14 shards safetensors (62,2 GB de repositorio), está pensado para servir como profesor en procesos de destilación o como modelo especializado en tareas de extracción y comprensión documental. Su licencia Apache 2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con mixture-of-experts (Qwen3-VL-MoE) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-VL-30B-A3B-Instruct: un transformer multimodal con mezcla de expertos que procesa entradas de imagen y texto y genera texto. El post-entrenamiento del especialista OCR sigue la ruta descrita por el autor: parte de un checkpoint SFT multi-dominio y finaliza con aprendizaje por refuerzo sobre el dominio documental/OCR, lo que le proporciona una cobertura más amplia que la variante entrenada exclusivamente con SFT y RL en el dominio OCR.

El marco Uni-MOPD propone un "strong start" y una "simple recipe": una fusión uniforme libre de entrenamiento de los especialistas (todos derivados del mismo checkpoint base) inicializa al estudiante, y una destilación on-policy multi-profesor corta con muestreo uniforme de dominios y KL inversa de vocabulario completo lo refina. La innovación clave es tratar el punto de partida como variable de diseño, en lugar de dejar toda la integración de capacidades al proceso de destilación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles del esquema de RL.

## Capacidades

- Comprensión de documentos: extracción de texto, interpretación de layout y estructura de páginas.
- OCR: reconocimiento de texto en imágenes, presumiblemente en escenarios de documentos escaneados y fotografías.
- Comprensión de gráficos (charts): interpretación de gráficos de barras, líneas y otros formatos visuales.
- Generación de texto conversacional a partir de entradas imagen-texto, según el pipeline `image-text-to-text`.
- Procesamiento multimodal imagen + texto mediante chat template compatible con `transformers`.
- Especialización de dominio: destaca en su dominio (documentos/OCR) frente a los otros especialistas del banco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de archivos y facturas: el modelo puede recibir imágenes de documentos escaneados y extraer campos estructurados (importes, fechas, emisores) aprovechando su especialización OCR y su entrenamiento con RL en el dominio documental.
- Procesamiento de formularios y documentos administrativos: adecuado para pipelines de captura de datos donde se requiere interpretar layout y texto manuscrito o impreso en una sola pasada multimodal.
- Extracción de información de gráficos en informes: interpretación de charts en PDFs o capturas para convertir tendencias visuales en datos textuales o tabulares.
- Profesor en destilación multi-profesor: su rol nativo en el marco Uni-MOPD es supervisar las respuestas del estudiante unificado en consultas del dominio documental, generando señales de token-level distillation.
- Asistente de accesibilidad documental: descripción y lectura en voz alta del contenido de documentos e imágenes con texto para usuarios con discapacidad visual, aprovechando la generación conversacional multimodal.
- Preprocesado en pipelines RAG sobre documentos escaneados: conversión de páginas de imagen a texto estructurado antes de la indexación vectorial, donde la especialización OCR reduce errores frente a modelos generalistas.
- Automatización de revisión de contratos y pólizas: análisis de documentos legales o de seguros para localizar cláusulas y datos clave mediante consultas imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para despliegue cómodo.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090/A6000 con tensor parallelism) para bfloat16.
- En consumer GPU: no cabe en bfloat16 en una sola GPU de consumo; requeriría cuantización (no se publican pesos GGUF/AWQ/GPTQ en el repositorio) o descarga por capas con offloading.
- Opciones de despliegue: `transformers>=4.57.1` con `Qwen3VLMoeForConditionalGeneration` y `AutoProcessor` (soporte oficial documentado); vLLM, llama.cpp, Ollama o TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uni-MOPD-Teacher-OCR | 31,07B | no disponible | Documentos/OCR/charts | Apache 2.0 | Hugging Face (AmberHeart) |
| Qwen3-VL-30B-A3B-Instruct | ~30B (MoE) | no disponible | General multimodal | Apache 2.0 (segun base) | Hugging Face (Qwen) |
| Uni-MOPD-Teacher-OCR-Bank2 | no disponible | no disponible | Documentos/OCR (SFT+RL solo OCR) | Apache 2.0 | Hugging Face (AmberHeart) |
| Uni-MOPD (estudiante unificado) | no disponible | no disponible | Multi-dominio (5 especialistas) | Apache 2.0 | Hugging Face (AmberHeart) |

La comparación con el base Qwen3-VL-30B-A3B-Instruct es la más directa: el especialista debería superar al base en su dominio documental, aunque no se publican cifras que lo cuantifiquen. Frente a `Uni-MOPD-Teacher-OCR-Bank2`, la diferencia es la ruta de post-entrenamiento (SFT multi-dominio + RL frente a SFT y RL solo OCR), con mayor cobertura para este repositorio según el autor.

## Limitaciones y advertencias

- Especialización estrecha: está optimizado para documentos/OCR/charts y probablemente rinde peor que el base en otros dominios (STEM, GUI, embodied).
- No es un modelo de propósito general; su uso como asistente general no está respaldado por la información disponible.
- Riesgo de alucinación en la extracción de texto o datos de documentos, especialmente con imágenes de baja calidad o layouts atípicos; no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad.
- Idiomas: no se especifican los idiomas soportados; el rendimiento multilingüe en OCR no está confirmado.
- Longitud de contexto: no disponible, lo que impide planificar documentos de muchas páginas sin pruebas previas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el archivo NOTICE con la declaración de modificaciones.
- Requiere `transformers>=4.57.1`; versiones anteriores no cargarán la arquitectura `qwen3_vl_moe`.
- Sin datos de benchmarks publicados, la evaluación en producción debe hacerse con un conjunto propio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Repositorio del estudiante unificado: https://huggingface.co/AmberHeart/Uni-MOPD
- Fusión uniforme inicial: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista VQA: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Especialista OCR alternativo: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR-Bank2
- Especialista GUI: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Especialista embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
