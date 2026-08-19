# KucLab/kuclab-hertz-0.3

## Resumen

KucLab Hertz 0.3 es un asistente conversacional bilingüe (checo e inglés) especializado en disciplinas STEM, desarrollado por KucLab sobre la base de Qwen2.5-14B-Instruct. Se trata de un fine-tune LoRA (r=8, alpha=16) fusionado en los pesos del modelo base, entrenado con un corpus autodestilado de 242 ejemplos generados por el modelo profesor Qwen3.8-27B. El objetivo principal es mejorar la fluidez y precisión de la terminología científica en checo, así como la presentación de soluciones paso a paso en problemas de física, química, biología y matemáticas.

El modelo hereda las capacidades generales del base, incluyendo una ventana de contexto nativa de 32 000 tokens, extendida a 128 000 mediante escalado YaRN (factor 4.0). Se distribuye en formato GGUF (Q4_K_M, ~9 GB) para su uso con llama.cpp y Ollama, además de ofrecer el adaptador LoRA sin fusionar para quienes prefieran integrarlo sobre su propia copia del modelo base. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en cubrir un hueco específico: la generación de contenido STEM natural y correcto en checo, un idioma con escasa representación en los modelos de código abierto. No se trata de un modelo con mayor capacidad que su base, sino de una especialización dirigida a un público que necesita respuestas técnicas en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-14B-Instruct base) |
| Parametros totales | 14 770 033 664 (14,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (extendido via YaRN desde 32 000 nativos) |
| Tipos de cuantizacion | GGUF Q4_K_M (~9 GB); otros no especificados |
| Idiomas soportados | Checo (cs), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado), GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer denso con atención estándar y 14,7 mil millones de parámetros. Sobre esta base se aplicó un fine-tune con QLoRA (r=8, alpha=16), que posteriormente se fusionó en los pesos del modelo y se convirtió a precisión fp16. El entrenamiento utilizó un conjunto de datos autodestilado de 242 ejemplos, generados por el modelo profesor Qwen3.8-27B (Alibaba/Tongyi, Apache 2.0), que actuó únicamente como generador de datos sin ser entrenado ni redistribuido. El corpus incluye conceptos y terminología STEM en checo e inglés, problemas resueltos con razonamiento paso a paso, ejemplos de formato Markdown/código y muestras de identidad del modelo.

La extensión del contexto a 128 000 tokens se logró mediante escalado YaRN con factor 4.0, aplicado sobre la rope del modelo base. No se realizó ningún ajuste adicional para tool calling ni para modificar el comportamiento de seguridad, que se hereda tal cual del modelo base. El proceso de entrenamiento se llevó a cabo en una única GPU de consumo o nube con 23 GB de VRAM, según indica la documentación del proyecto.

## Capacidades

- Generación de texto en checo e inglés con especial énfasis en terminología STEM (física, química, biología, matemáticas).
- Razonamiento paso a paso en problemas aritméticos, algebraicos y científicos, con explicaciones detalladas en checo fluido.
- Soporte nativo de tool calling y function calling heredado del modelo base Qwen2.5-14B-Instruct, aunque no se añadieron ejemplos específicos de entrenamiento para esta tarea.
- Ventana de contexto ampliada a 128 000 tokens, útil para documentos largos o conversaciones multi-turno extensas.
- Capacidad de identificación propia: el modelo se presenta como KucLab Hertz 0.3, no como Qwen, gracias al ajuste de identidad incluido en el entrenamiento.
- Formato de salida en Markdown y código, adecuado para respuestas estructuradas y legibles.
- Compatibilidad con despliegue local mediante GGUF (llama.cpp, Ollama) y con entornos de servidor compatibles con endpoints (vLLM, TGI, etc.).

## Casos de uso

- Tutoría educativa STEM en checo: el modelo puede explicar conceptos de física, química o matemáticas con ejemplos resueltos paso a paso, adaptados al nivel del estudiante. Su fluidez en checo técnico lo hace adecuado para sistemas de tutoría en línea o aplicaciones de ayuda al estudio.
- Generación de material didáctico: creación de problemas de práctica, soluciones detalladas y explicaciones teóricas en checo para libros de texto, plataformas de e-learning o recursos educativos abiertos.
- Asistente técnico para ingenieros e investigadores checos: consulta de fórmulas, resolución de cálculos y redacción de documentación técnica en checo, aprovechando la ventana de 128k para procesar informes extensos.
- Chatbot de atención al cliente bilingüe: integración en sistemas de soporte que requieran respuestas en checo e inglés, con capacidad de mantener conversaciones largas gracias al contexto ampliado.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural en checo: uso como base para tareas de extracción de información, resumen o generación de texto técnico en dominios científicos.
- Despliegue en entornos con recursos limitados: el GGUF Q4_K_M (~9 GB) permite ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, facilitando su uso en estaciones de trabajo o servidores modestos.
- Investigación en IA multilingüe: como punto de partida para experimentos de fine-tune adicionales sobre dominios STEM en checo, gracias a la disponibilidad del adaptador LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que solo se realizaron comprobaciones cualitativas (aritmética, física, química, terminología) y que no hay puntuaciones formales de MMLU-Pro STEM ni de conjuntos de terminología checa. Tampoco se ha verificado de forma independiente la calidad del contexto largo con documentos de retención.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en fp16 requiere aproximadamente 23 GB de VRAM, según la documentación del proyecto. El GGUF Q4_K_M ocupa ~9 GB, por lo que puede ejecutarse en GPUs con 8-12 GB de VRAM.
- GPUs recomendadas: para fp16, una RTX 3090/4090 (24 GB) o una A100 (40 GB) son suficientes. Para el GGUF cuantizado, una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden ser adecuadas.
- Compatibilidad con GPU de consumo: sí, tanto para inferencia como para entrenamiento QLoRA (el proyecto se entrenó en una GPU de 23 GB).
- Opciones de despliegue: llama.cpp, Ollama (mediante el GGUF), y servidores compatibles con endpoints (vLLM, TGI) si se utiliza el modelo fusionado en safetensors.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 14B en Q4_K_M suele alcanzar entre 20 y 40 tokens por segundo en una RTX 4090, pero estos valores no están confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KucLab Hertz 0.3 | 14,7 B | 128k (YaRN) | Checo, ingles | Apache 2.0 | Fine-tune LoRA sobre Qwen2.5-14B-Instruct, especializado en STEM checo |
| Qwen2.5-14B-Instruct (base) | 14,7 B | 32k (nativo) | Multilingue (incluye checo e ingles) | Apache 2.0 | Modelo general sin especializacion STEM en checo |
| Qwen3.8-27B (profesor) | 27 B | No especificado | Multilingue | Apache 2.0 | Modelo de mayor tamano usado solo para generar datos, no entrenado |

La comparativa se limita a los modelos mencionados en la documentación. No se dispone de datos de otros fine-tunes checos STEM para establecer una comparación más amplia.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks formales; el rendimiento se basa en comprobaciones cualitativas no sistemáticas.
- El conjunto de entrenamiento es muy reducido (242 ejemplos), lo que limita la generalización a dominios fuera de los ejemplos vistos.
- La calidad del contexto largo (128k) no ha sido verificada de forma independiente con documentos de retención; solo se confirma que la ventana es cargable.
- No se realizó fine-tuning específico para tool calling; el soporte de function calling es el nativo del modelo base, que puede no estar optimizado para esta especialización.
- El comportamiento de seguridad (censura, alineación) se hereda del modelo base sin modificaciones; no se aplicó ningún proceso de des-censura.
- El modelo puede presentar sesgos o alucinaciones inherentes al modelo base Qwen2.5-14B-Instruct, especialmente en dominios científicos complejos.
- La cobertura lingüística se limita a checo e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un proyecto de pequeña escala (una sola GPU), no se ha sometido a pruebas de robustez o escalabilidad en entornos de producción.

## Enlaces

- [HuggingFace - KucLab/kuclab-hertz-0.3](https://huggingface.co/KucLab/kuclab-hertz-0.3)
- [Sitio web de KucLab](https://kuclab.org)
- [Modelo base: Qwen/Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)
- [Modelo profesor: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
