# Adruino/Qwen2.5-VL-3B-Instruct

## Resumen

Qwen2.5-VL-3B-Instruct es un modelo de visión-lenguaje (VLM) desarrollado por Alibaba Cloud, lanzado en enero de 2025 como parte de la familia Qwen2.5-VL. Se trata de la variante más compacta de la serie, con 3.754 millones de parámetros, y está diseñado para tareas multimodales que combinan imágenes, vídeo y texto. Este modelo resuelve problemas de comprensión visual avanzada: reconocimiento de objetos, análisis de documentos, localización espacial, extracción de datos estructurados y razonamiento sobre vídeo de larga duración.

La arquitectura combina un codificador visual (ViT) optimizado con window attention, RMSNorm y SwiGLU, con un modelo de lenguaje Qwen2.5-3B. La entrada visual usa resolución dinámica y muestreo dinámico de FPS para vídeo, con una ventana de contexto de 32.768 tokens. El modelo está disponible bajo la licencia qwen-research, que restringe su uso comercial. En este repositorio (Adruino/Qwen2.5-VL-3B-Instruct) se publica una copia del checkpoint original de Qwen, con pesos en formato safetensors y compatibilidad total con la librería transformers.

La relevancia de este modelo radica en que ofrece capacidades de nivel medio (comparables a modelos de 7B) con un coste computacional muy inferior, lo que lo hace apto para inferencia en GPUs de consumo. Su capacidad para actuar como agente visual (uso de herramientas, control de pantalla) y su rendimiento en benchmarks de vídeo lo convierten en una opción interesante para aplicaciones de automatización y análisis visual en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT + LLM Qwen2.5-3B) |
| Parametros totales | 3.754.622.976 (3.75 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (texto) |
| Tipos de cuantizacion | FP16, BF16, INT8, INT4 (GGUF disponible en LM Studio) |
| Idiomas soportados | Multilingüe (inglés, chino y otros) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

Qwen2.5-VL-3B-Instruct combina un codificador visual (ViT) con un modelo de lenguaje de 3B parámetros (Qwen2.5). El ViT ha sido optimizado mediante window attention para acelerar el entrenamiento y la inferencia, además de integrar SwiGLU y RMSNorm, alineando su estructura con la del LLM. El modelo emplea mRoPE (rotary position embeddings modificadas) que se extiende a la dimensión temporal con IDs de tiempo absoluto, lo que permite al modelo comprender secuencias de vídeo y localizar eventos concretos.

El entrenamiento se realizó en dos fases: pretraining en datos multimodal (imágenes, vídeo y texto) y fine-tuning con instrucciones (instruction tuning) para tareas de conversación, razonamiento y uso de herramientas. El modelo soporta resolución dinámica en imágenes y muestreo dinámico de FPS en vídeo, lo que le permite procesar entradas de tamaño variable sin redimensionar. No se especifica el número total de tokens de entrenamiento ni si se aplicó RLHF o DPO en la información disponible.

## Capacidades

- Comprensión visual: reconoce objetos comunes (flores, aves, peces, insectos) y analiza textos, gráficos, iconos, diagramas y diseños de páginas.
- Extracción de información de documentos: procesa escaneos de facturas, formularios y tablas, generando salidas estructuradas (JSON) con coordenadas y atributos.
- Localización visual: genera bounding boxes y puntos para localizar objetos dentro de una imagen, con salidas JSON estables.
- Comprensión de vídeo: procesa vídeos de más de una hora, con capacidad para identificar eventos y señalar los segmentos relevantes.
- Uso de herramientas y actuación como agente: puede razonar y dirigir herramientas, incluyendo control de computadoras y teléfonos (computer use, phone use).
- Generación de texto y razonamiento multimodal: conversación en lenguaje natural sobre imágenes y vídeos, con soporte de razonamiento matemático y lógico.
- Soporte de tool calling: puede invocar funciones externas para completar tareas, según la documentación de Qwen2.5-VL.

## Casos de uso

- **Automatización de oficina y extracción de datos**: el modelo procesa facturas, formularios y tablas escaneados, extrayendo campos clave (números, fechas, importes) en formato JSON estructurado, lo que facilita su integración en pipelines de contabilidad o gestión documental.
- **Análisis de vídeo de seguridad**: con su capacidad de procesar vídeos de larga duración y localizar eventos, puede indexar grabaciones de cámaras para encontrar incidentes concretos (personas, vehículos, objetos) y devolver los segmentos temporales.
- **Asistente visual para accesibilidad**: describe imágenes y vídeos en lenguaje natural para personas con discapacidad visual, respondiendo preguntas sobre el contenido visual.
- **Control de interfaces mediante lenguaje natural**: como agente visual, puede interactuar con pantallas de ordenador o móvil, ejecutando acciones como clics, desplazamientos o relleno de formularios, útil para automatización de pruebas o RPA.
- **QA sobre diagramas y gráficos**: responde preguntas sobre gráficos científicos, diagramas de flujo y esquemas técnicos, con razonamiento matemático para problemas de cálculo visual.
- **Educación y formación**: genera explicaciones de imágenes educativas, resuelve problemas de matemáticas a partir de capturas de pantalla y crea material didáctico a partir de contenido visual.
- **Moderación de contenido**: analiza imágenes y vídeos para detectar contenido inapropiado o clasificar visualmente, aunque no es su uso principal.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks de imagen, vídeo y agentes. Se comparan con InternVL2.5-4B y Qwen2-VL-7B.

### Image benchmark

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
| :--- | :---: | :---: | :---: |
| MMMU<sub>val</sub> | 52.3 | 54.1 | 53.1 |
| MMMU-Pro<sub>val</sub> | **32.7** | 30.5 | 31.6 |
| AI2D<sub>test</sub> | 81.4 | **83.0** | 81.5 |
| DocVQA<sub>test</sub> | 91.6 | 94.5 | **93.9** |
| InfoVQA<sub>test</sub> | 72.1 | 76.5 | **77.1** |
| TextVQA<sub>val</sub> | 76.8 | **84.3** | 79.3 |
| MMBench-V1.1<sub>test</sub> | 79.3 | **80.7** | 77.6 |
| MMStar | 58.3 | **60.7** | 55.9 |
| MathVista<sub>testmini</sub> | 60.5 | 58.2 | **62.3** |
| MathVision<sub>full</sub> | 20.9 | 16.3 | **21.2** |

### Video benchmark

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
| :--- | :---: | :---: | :---: |
| MVBench | 71.6 | 67.0 | 67.0 |
| VideoMME | 63.6/62.3 | 69.0/63.3 | 67.6/61.5 |
| MLVU | 48.3 | - | 68.2 |
| LVBench | - | - | 43.3 |
| MMBench-Video | 1.73 | 1.44 | 1.63 |
| EgoSchema | - | - | 64.8 |
| PerceptionTest | - | - | 66.9 |
| TempCompass | - | - | 64.4 |
| LongVideoBench | 55.2 | 55.6 | 54.2 |
| CharadesSTA/mIoU | - | - | 38.8 |

### Agent benchmark

| Benchmark | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55.5 |
| ScreenSpot Pro | 23.9 |
| AITZ_EM | 76.9 |
| Android Control High_EM | 63.7 |
| Android Control Low_EM | 22.2 |
| AndroidWorld_SR | 90.8 |
| MobileMiniWob++_SR | 67.9 |

## Requisitos de hardware

- **VRAM estimada**: en FP16 el modelo ocupa aproximadamente 7.5 GB (pesos) más overhead de activaciones; en INT4 (GGUF) ocupa alrededor de 2 GB de pesos. Para inferencia con contexto largo se recomienda al menos 8 GB de VRAM en FP16.
- **GPUs recomendadas**: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090, A100, H100. Cabe en GPUs de consumo de 8 GB o más.
- **Despliegue**: compatible con Transformers (pip install transformers), vLLM, TGI (text-generation-inference), llama.cpp (formato GGUF) y Ollama (a través de integraciones externas).
- **Latencia y throughput**: no disponible en la información publicada. Para un modelo de 3B en una GPU consumer, se estima una velocidad de generación de entre 20 y 50 tokens por segundo en FP16, pero estos valores no son oficiales.
- **Requisitos de software**: se necesita transformers >= 4.49 (build from source) y la librería `qwen-vl-utils` para procesamiento de vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos fuertes |
|---|---|---|---|---|
| **Qwen2.5-VL-3B** | 3.75B | 32K | qwen-research | Buen rendimiento en documentos y vídeo, ligero |
| **InternVL2.5-4B** | 4B | 32K | MIT | Mejor en MMMU-Pro, similar en imagen |
| **Qwen2-VL-7B** | 7.6B | 32K | Apache 2.0 | Mejor en TextVQA y MMBench, pero más pesado |

Qwen2.5-VL-3B supera a Qwen2-VL-7B en DocVQA, InfoVQA, MathVista y MathVision, a pesar de tener menos de la mitad de parámetros. Frente a InternVL2.5-4B, gana en DocVQA, InfoVQA y MathVista, pero pierde en MMMU-Pro y AI2D. En vídeo, supera a Qwen2-VL-7B en MLVU y MMBench-Video, pero es inferior en VideoMME. La licencia qwen-research es una limitación frente a la Apache 2.0 de Qwen2-VL-7B.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia qwen-research no permite uso comercial. Para producción comercial habría que considerar la variante Qwen2.5-VL-3B-Instruct con licencia Apache 2.0 (no disponible en este repo).
- **Idiomas**: aunque el modelo soporta multilingüe, la model card lista únicamente "en". El rendimiento en otros idiomas puede ser inferior al de modelos con entrenamiento específico.
- **Alucinación visual**: puede generar descripciones o respuestas inexactas sobre imágenes complejas o ambiguas, especialmente en tareas de localización fina.
- **Contexto limitado**: 32K tokens de contexto puede ser insuficiente para documentos de varias páginas o vídeos de larga duración con muchos fotogramas.
- **Riesgo de sesgos**: al igual que otros modelos de lenguaje, puede reflejar sesgos de género, raza o cultura presentes en los datos de entrenamiento.
- **Rendimiento en agentes**: los resultados en benchmarks de agentes (ScreenSpot Pro, Android Control Low) son bajos, lo que indica que su uso en tareas de control de pantallas complejas puede ser limitado.

## Enlaces

- [Hugging Face - modelo original (Qwen/Qwen2.5-VL-3B-Instruct)](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct)
- [Hugging Face - repo Adruino/Qwen2.5-VL-3B-Instruct](https://huggingface.co/Adruino/Qwen2.5-VL-3B-Instruct)
- [ModelScope - Qwen2.5-VL-3B-Instruct](https://modelscope.ai/models/Qwen/Qwen2.5-VL-3B-Instruct)
- [LM Studio - qwen/qwen2.5-vl-3b](https://lmstudio.ai/models/qwen/qwen2.5-vl-3b)
- [Blog de Qwen2.5-VL](https://qwenlm.github.io/blog/qwen2.5-vl/)
- [GitHub de Qwen2.5-VL](https://github.com/QwenLM/Qwen2.5-VL)
- [Colección Qwen2.5 en Hugging Face](https://huggingface.co/collections/Qwen/qwen25)
