# kdeng03/MolQwen3-VL-4B-Instruct-SFT-OCR

## Resumen

MolQwen3-VL-4B-Instruct-SFT-OCR es un modelo de visión-lenguaje (VLM) publicado en Hugging Face por el usuario kdeng03. Se trata de un fine-tuning (SFT) del modelo base Qwen/Qwen3-VL-4B-Instruct, orientado aparentemente a tareas de reconocimiento óptico de caracteres (OCR) en el dominio de moléculas, como sugiere el prefijo "Mol" del nombre. No obstante, la model card no aporta información concreta sobre el propósito, los datos de entrenamiento ni el proceso de ajuste, por lo que gran parte de sus características deben inferirse del modelo base.

El modelo tiene 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) y está registrado con la librería transformers, pipeline `image-text-to-text`. Su tamaño de repositorio es de 8,9 GB, lo que indica pesos en precisión completa o mixta (probablemente bf16). Al ser un fine-tune de Qwen3-VL-4B-Instruct, hereda la arquitectura del VLM de Qwen, que combina un codificador de visión con un modelo de lenguaje denso. La relevancia actual de este tipo de modelos radica en su capacidad para interpretar imágenes y texto de forma conjunta, algo esencial en dominios científicos como la química, donde la lectura de estructuras moleculares y notaciones químicas es crítica.

Sin embargo, la ausencia de documentación detallada, licencia explícita y resultados de evaluación limita seriamente su uso en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, denso, con codificador de visión) |
| Parametros totales | 4.437.815.808 (4,4 B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible (el modelo base Qwen3-VL-4B-Instruct soporta 32 768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors en precisión completa/mixta) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-4B-Instruct, un VLM de la serie Qwen3-VL que combina un codificador de visión (Vision Transformer) con un modelo de lenguaje denso de 4 mil millones de parámetros. La arquitectura original incorpora mejoras en percepción visual, razonamiento multimodal y comprensión de video y dinámica espacial, así como capacidades de interacción con agentes. El fine-tune fue realizado mediante Supervised Fine-Tuning (SFT), como indica el sufijo del nombre, pero no se especifican los datos de entrenamiento, el número de pasos, la configuración de hiperparámetros ni el régimen de precisión (fp16, bf16, etc.).

No se dispone de información sobre el dataset utilizado, aunque el nombre "MolQwen3" y la etiqueta "OCR" sugieren que se entrenó con imágenes de estructuras moleculares y sus correspondientes transcripciones (posiblemente SMILES, InChI u otras notaciones químicas). Tampoco se indica si se emplearon técnicas de RLHF o DPO posteriores al SFT. La model card generada automáticamente no aporta ningún detalle técnico adicional.

## Capacidades

- Generación de texto a partir de imágenes (image-to-text), heredada del modelo base Qwen3-VL-4B-Instruct.
- Reconocimiento óptico de caracteres (OCR) sobre imágenes, probablemente especializado en dominios moleculares y químicos.
- Comprensión de imágenes y texto de forma conjunta, incluyendo razonamiento visual básico.
- Capacidades multilingües del modelo base (no confirmadas para este fine-tune).
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso específico del fine-tune, aunque el modelo base sí incluye estas capacidades.
- No se dispone de información sobre modos de pensamiento (thinking mode) ni capacidades de audio o video específicas de este modelo.

## Casos de uso

- Extracción de estructuras químicas desde imágenes de publicaciones científicas: el modelo puede convertir figuras de moléculas en notaciones textuales (SMILES, InChI) para su posterior análisis computacional, agilizando la revisión bibliográfica en química.
- Digitalización de cuadernos de laboratorio: permite transcribir estructuras moleculares dibujadas a mano o impresas en documentos escaneados, facilitando la creación de bases de datos químicas.
- Automatización de pipelines de quimioinformática: integrado como componente de preprocesado, convierte imágenes de reacciones o moléculas en datos estructurados que alimentan modelos de predicción de propiedades o de síntesis.
- Accesibilidad en documentación técnica: convierte diagramas moleculares en descripciones textuales para personas con discapacidad visual o para sistemas de lectura automática.
- Validación de datos en bases de datos químicas: compara la estructura extraída por OCR con la notación canónica esperada, detectando errores de transcripción en registros existentes.
- Asistencia en educación química: dado un dibujo de una molécula, el modelo puede generar su nombre sistemático o su representación SMILES, ayudando a estudiantes a verificar sus ejercicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y la búsqueda web no encontró comparaciones ni informes de rendimiento para este modelo específico. Al tratarse de un fine-tune de Qwen3-VL-4B-Instruct, su rendimiento en tareas generales de visión-lenguaje será similar al del base, pero no hay datos cuantitativos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,4 mil millones de parámetros en bf16 (aproximadamente 8,9 GB de pesos), se necesitan al menos 12 GB de VRAM para inferencia en precisión completa. Con cuantización a 8 bits, unos 6-8 GB; a 4 bits, unos 4-6 GB.
- GPU recomendadas: una RTX 3090, RTX 4090, A10 o A100 de 16 GB o más son suficientes para inferencia en bf16. Para cuantización ligera, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB podrían bastar.
- Sí cabe en GPUs de consumo si se aplica cuantización (GGUF o AWQ), pero el repositorio no incluye versiones cuantizadas, por lo que habría que generarlas manualmente.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI o directamente con la librería transformers. Para cuantización local, llama.cpp u Ollama requerirían conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud de la secuencia de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MolQwen3-VL-4B-Instruct-SFT-OCR (este) | 4,4 B | No disponible | No disponible | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4,4 B | 32 768 tokens | Apache 2.0 (según el repo de Qwen) | Hugging Face, ModelScope |
| kdeng03/Qwen3-VL-4B-Instruct-trl-sft | 4,4 B | 32 768 tokens (heredado) | No disponible | Hugging Face |

La comparativa se limita a los modelos encontrados en la búsqueda. No hay información sobre otros fine-tunes específicos de OCR molecular, por lo que no se puede establecer una comparación más amplia. El modelo base Qwen3-VL-4B-Instruct es la referencia natural, y este fine-tune debería evaluarse frente a él para determinar si la especialización en OCR molecular aporta mejoras reales.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Se desconocen los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir texto plausible pero incorrecto al transcribir estructuras moleculares, lo que es crítico en un dominio científico donde los errores tienen consecuencias.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos. Se recomienda asumir las del modelo base (32 768 tokens, multilingüe) pero sin garantía.
- Restricciones de licencia: la licencia no está indicada, lo que impide conocer si se permite uso comercial o modificaciones. Es necesario contactar al autor o buscar información adicional antes de cualquier uso en producción.
- El nombre sugiere especialización en OCR molecular, pero no hay evidencia publicada que lo confirme. El rendimiento real en esa tarea es desconocido.
- Al ser un fine-tune de un modelo de 4,4 B, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes (7B, 14B o MoE).

## Enlaces

- Hugging Face: https://huggingface.co/kdeng03/MolQwen3-VL-4B-Instruct-SFT-OCR
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Modelo en ModelScope (base): https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct
- Fine-tune similar de kdeng03: https://huggingface.co/kdeng03/Qwen3-VL-4B-Instruct-trl-sft
- Repositorio GitHub de Qwen3 (serie general): https://github.com/QwenLM/Qwen3
