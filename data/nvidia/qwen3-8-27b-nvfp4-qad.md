# nvidia/Qwen3.8-27B-NVFP4-QAD

## Resumen

NVIDIA Qwen3.8-27B-NVFP4-QAD es la versión cuantizada del modelo Qwen3.8-27B de Alibaba, publicada por NVIDIA a través de su herramienta Model Optimizer. Se trata de un modelo transformer denso de 27.728.983.792 parámetros (27B) que procesa texto, imagen y vídeo, y que ha sido comprimido a formato NVFP4 de 4 bits mediante un proceso de destilación consciente de la cuantización (quantization-aware distillation, QAD). El objetivo es ofrecer un modelo listo para producción que reduzca los requisitos de memoria y aumente el rendimiento en inferencia sobre hardware NVIDIA Blackwell, manteniendo la precisión del modelo original.

El modelo base, Qwen3.8-27B, es un modelo visión-lenguaje denso orientado a comprensión de texto, imagen y vídeo, razonamiento multimodal, generación de código, procesamiento de contexto largo, tool calling y tareas agénticas. La versión de NVIDIA conserva estas capacidades con un contexto de hasta 262.144 tokens y está pensada para su despliegue en sistemas de agentes, chatbots y pipelines RAG.

La relevancia actual reside en la combinación de cuantización agresiva (NVFP4) con recuperación de precisión mediante QAD, lo que permite ejecutar un modelo de 27B en configuraciones de memoria reducidas dentro del ecosistema Blackwell, con vLLM como motor de inferencia de referencia. La licencia es la NVIDIA Open Model License, que permite uso comercial y no comercial bajo sus términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27.728.983.792 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de punto flotante de NVIDIA); pesos en 8-bit según metadatos del repositorio |
| Idiomas soportados | No disponible (los datos de entrenamiento citados son en inglés) |
| Licencia | NVIDIA Open Model License (modelo base Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | safetensors (librería Model Optimizer) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo denso de 27B parámetros, identificado internamente como `Qwen3_5ForConditionalGeneration`, que acepta entradas de texto, imagen y vídeo y produce salidas de texto. La versión de NVIDIA no reentrena el modelo desde cero: parte de los pesos de Qwen3.8-27B y aplica cuantización a NVFP4 mediante Model Optimizer v0.48.0, usando destilación consciente de la cuantización (QAD) para recuperar la precisión perdida por la compresión a 4 bits.

El proceso de calibración emplea el dataset Nemotron-Post-Training-Dataset-v3, compuesto por conversaciones multiturno sobre temas diversos, generado y etiquetado de forma automatizada. El conjunto de entrenamiento asociado al proceso es Nemotron-Cascade-2-SFT-Data, con 1.260 millones de tokens en inglés y conversaciones multiturno que cubren matemáticas, ciencia, chat, seguimiento de instrucciones, seguridad, agentes conversacionales, ingeniería de software y tareas de agente en terminal; la recolección y el etiquetado son híbridos (automático, manual y sintético). No se detalla en la información disponible si hubo RLHF o DPO adicionales sobre esta versión cuantizada.

## Capacidades

- Generación de texto y razonamiento en dominios como matemáticas, ciencia e ingeniería.
- Comprensión multimodal: entrada de texto, imagen (RGB) y vídeo (MP4/WebM).
- Generación y razonamiento sobre código, incluyendo tareas de ingeniería de software y código científico.
- Tool calling y function calling, orientado a integración en sistemas de agentes.
- Razonamiento multi-paso y tareas agénticas, incluido el uso de terminal (evaluado en Terminal-Bench 2.1).
- Procesamiento de contexto largo, con ventana de hasta 262.144 tokens.
- Seguimiento de instrucciones estructuradas y restricciones complejas (evaluado en IFBench).
- Capacidades multilingües: no disponibles en la información proporcionada; los datos de entrenamiento citados son en inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multiturno con un contexto de hasta 262.144 tokens, lo que permite arrastrar historial extenso y documentación de soporte sin truncamientos agresivos.
- Sistemas RAG sobre documentación extensa: su ventana de contexto larga y su capacidad de razonamiento permiten inyectar múltiples fragmentos recuperados y razonar sobre ellos en una sola pasada.
- Generación de código en producción: soporta tool calling y tareas de ingeniería de software, por lo que puede integrarse en pipelines de CI/CD para revisión, generación de parches y automatización de tareas de terminal.
- Agentes autónomos de terminal: evaluado en Terminal-Bench 2.1, es adecuado para orquestar comandos, interpretar salidas y completar tareas multi-paso en entornos de línea de comandos.
- Análisis de documentos con imágenes y vídeo: al aceptar entradas RGB y vídeo, puede extraer información de capturas, diagramas o grabaciones y responder preguntas sobre ellas.
- Asistencia científica y técnica: con evaluación en GPQA Diamond y SciCode, encaja en flujos de resolución de problemas de nivel graduado y generación de código científico.
- Despliegue en infraestructura Blackwell con vLLM: su formato NVFP4 reduce la huella de memoria, lo que facilita servir el modelo en clústeres con GPUs Blackwell (por ejemplo, GB300) manteniendo latencias competitivas.

## Benchmarks y rendimiento

La model card menciona que el modelo fue evaluado en GPQA Diamond, IFBench, MMMU Pro, SciCode, Terminal-Bench 2.1 y AA-LCR, pero no se han publicado los resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 19,9 GB, lo que da una referencia del tamaño de los pesos cuantizados en NVFP4.
- GPU recomendadas: NVIDIA Blackwell (la model card indica compatibilidad con microarquitectura Blackwell y pruebas en GB300).
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; la compatibilidad declarada se limita a Blackwell.
- Opciones de despliegue: vLLM es el motor de inferencia de referencia; la librería asociada es Model Optimizer. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Sistema operativo soportado: Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Qwen3.8-27B-NVFP4-QAD | 27B (denso) | 262.144 | NVFP4 (4 bits) | NVIDIA Open Model License | Hugging Face (nvidia) |
| Qwen/Qwen3.8-27B (base) | 27B (denso) | 262.144 | FP16/BF16 (original) | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con el modelo base Qwen3.8-27B: misma arquitectura y contexto, pero la versión de NVIDIA añade compresión NVFP4 con QAD y queda sujeta a la licencia de NVIDIA en lugar de Apache 2.0.

## Limitaciones y advertencias

- La cuantización a NVFP4 puede introducir degradación de precisión respecto al modelo base; la QAD mitiga este efecto, pero no se han publicado métricas comparativas en la información disponible.
- La licencia NVIDIA Open Model License sustituye a la Apache 2.0 del modelo base para esta distribución; es necesario revisar sus términos antes de uso comercial.
- Compatibilidad de hardware restringida a NVIDIA Blackwell según la model card; no se declara soporte para otras arquitecturas.
- El motor de inferencia declarado es vLLM sobre Linux; no se documentan alternativas.
- Los datos de entrenamiento citados son en inglés, por lo que el rendimiento multilingüe no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card recomienda pruebas específicas del caso de uso siguiendo la metodología V-model antes de desplegar en producción.
- No se dispone de información sobre sesgos específicos ni de evaluaciones de seguridad detalladas en la documentación proporcionada.
- El modelo acepta imagen y vídeo como entrada, pero la salida es únicamente texto.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Blog sobre quantization-aware training: https://developer.nvidia.com/blog/how-quantization-aware-training-enables-low-precision-accuracy-recovery/
- Dataset de calibración Nemotron-Post-Training-Dataset-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Dataset de entrenamiento Nemotron-Cascade-2-SFT-Data: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
