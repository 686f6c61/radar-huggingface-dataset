# minsu0567/IAD-X1-GRPO-answer-last2-no-hard-adapter

## Resumen

IAD-X1-GRPO-answer-last2-no-hard-adapter es un modelo de inteligencia artificial desarrollado por minsu0567 (Kim minsu) para la detección de anomalías industriales. Se basa en el modelo Qwen3.5-4B, un transformer multimodal de 4.000 millones de parámetros, y ha sido afinado mediante GRPO (Group Relative Policy Optimization) sobre un ajuste previo con SFT. Su propósito es recibir una imagen de referencia (pieza conocida como buena) y una imagen de consulta, y determinar si la pieza de consulta presenta defectos, indicando el tipo de defecto y su ubicación. El nombre del modelo indica que el orden de las etiquetas de salida es fijo: tipo → ubicación → respuesta.

Este modelo es relevante porque aborda la inspección visual automática en entornos industriales, un campo con alta demanda de soluciones precisas y escalables. Su integración con el ecosistema Hugging Face, su licencia Apache 2.0 y su tamaño compacto (4B) lo hacen atractivo para despliegues en producción con requisitos de hardware moderados. La versión actual está entrenada exclusivamente en inglés y no se han publicado métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer multimodal, visión-lenguaje) |
| Parametros totales | 4.000 millones (aprox., según repositorio GitHub) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer multimodal que procesa imágenes y texto. En el caso de IAD-X1, la entrada consiste en dos imágenes (referencia y consulta) junto con instrucciones de texto, y la salida es una secuencia estructurada que indica si hay defecto, el tipo y la localización. El entrenamiento se realizó en dos etapas: primero un ajuste fino supervisado (SFT) para enseñar la tarea de detección, y posteriormente una optimización con GRPO, una técnica de aprendizaje por refuerzo que ajusta la política del modelo para mejorar la precisión de las respuestas. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros de GRPO. El prefijo "no-hard" en el nombre sugiere que no se utilizan adaptadores rígidos (hard adapters), probablemente refiriéndose a una técnica de ajuste sin módulos adicionales fijos.

## Capacidades

- Detección de anomalías en imágenes industriales: el modelo compara una imagen de referencia (buena) con una imagen de consulta y determina si existe defecto.
- Clasificación de tipos de defecto: identifica la categoría del defecto (por ejemplo, grietas, manchas, deformaciones) a partir de la imagen de consulta.
- Localización del defecto: indica la posición o región de la imagen donde se encuentra la anomalía.
- Salida estructurada con orden fijo: genera la respuesta en formato "tipo → ubicación → respuesta", lo que facilita la integración en sistemas automatizados.
- Soporte de entrada multimodal: procesa simultáneamente dos imágenes y texto, permitiendo instrucciones contextuales.
- Capacidades de razonamiento visual: aprovecha el conocimiento pre-entrenado de Qwen3.5 para interpretar relaciones entre imágenes.

No se ha confirmado soporte para tool calling, agentes o funciones de razonamiento multi-step más allá de la tarea específica.

## Casos de uso

- Inspección de calidad en línea de producción: el modelo puede analizar cada pieza que pasa por una cinta transportadora, comparándola con una imagen de referencia y alertando de defectos en tiempo real. Su tamaño compacto permite ejecutarlo en servidores con GPU moderadas, integrado con cámaras industriales.
- Mantenimiento predictivo de maquinaria: al analizar imágenes de componentes (rodamientos, engranajes) capturadas periódicamente, detecta signos de desgaste o anomalías antes de que se conviertan en fallos. La salida estructurada facilita la automatización de alertas.
- Auditoría visual de productos electrónicos: en plantas de ensamblaje de placas de circuitos, el modelo puede identificar soldaduras defectuosas o componentes mal colocados, reduciendo la dependencia de inspección manual.
- Control de calidad en textil y cerámica: detectar imperfecciones en superficies (tejidos, baldosas) mediante comparación con una referencia estándar. La localización del defecto permite marcar la zona exacta para su corrección.
- Integración en sistemas de visión por computador existentes: dado su formato de pesos safetensors y compatibilidad con transformers, puede integrarse en pipelines de Python (por ejemplo, con Hugging Face) para complementar herramientas de procesado de imágenes.
- Investigación académica en detección de anomalías: el modelo sirve como punto de partida para estudios sobre técnicas de RL (GRPO) aplicadas a visión industrial, permitiendo reproducir experimentos y comparar con otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GitHub no incluye tablas de métricas (precisión, recall, F1) ni comparaciones con otros modelos de detección de anomalías. Por tanto, no se puede cuantificar el rendimiento real del modelo en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4B parámetros, una cuantización de 4 bits (por ejemplo, GGUF) requeriría aproximadamente 2-3 GB de VRAM. En FP16, la VRAM necesaria sería alrededor de 8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. Modelos con 8 GB de VRAM (RTX 3060 Ti, RTX 2080 Ti) podrían ejecutar una versión cuantizada a 4 bits.
- Compatibilidad con consumer GPU: sí, si se aplica cuantización (por ejemplo, con llama.cpp o bitsandbytes).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Inference Endpoints, TGI (Text Generation Inference). El modelo está marcado con "text-generation-inference" en sus tags.
- Latencia y throughput: no disponibles; dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de anomalías industriales basados en LLM. Como referencia genérica, se podría comparar con:

- Qwen3.5-4B base: el modelo original sin el ajuste industrial. IAD-X1 añade la capacidad de detección de anomalías, pero pierde parte de la generalidad del modelo original.
- CLIP (OpenAI) o SigLIP: modelos de visión-lenguaje que pueden clasificar imágenes, pero no están entrenados específicamente para comparar dos imágenes y detectar defectos. No se puede comparar directamente sin datos de evaluación.

En ausencia de métricas, no se puede realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma restringido: solo soporta inglés, lo que limita su uso en entornos industriales no anglófonos.
- Datos de entrenamiento desconocidos: no se han publicado detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la representatividad de los defectos industriales o posibles sesgos.
- Riesgo de alucinación: al ser un modelo generativo, puede producir respuestas incorrectas si la imagen de consulta es muy diferente de las muestras de entrenamiento. Se recomienda validar las salidas en un entorno de producción.
- Limitación de contexto: la longitud de contexto no está especificada; las tareas de detección suelen requerir solo una imagen de referencia y una consulta, por lo que no debería ser un problema, pero se debe verificar.
- Falta de documentación técnica: no hay información sobre el proceso de entrenamiento (tokens, hiperparámetros) ni sobre la arquitectura interna del adaptador.
- Sin soporte de tool calling: no se puede integrar con funciones externas, lo que limita su uso en agentes autónomos complejos.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara en su perfil de Hugging Face que algunos de sus proyectos son solo para investigación académica/no comercial. El repositorio IAD-X1 no especifica restricciones, pero se debe revisar la licencia del modelo base Qwen3.5.

## Enlaces

- Hugging Face: https://huggingface.co/minsu0567/IAD-X1-GRPO-answer-last2-no-hard-adapter
- Repositorio GitHub (modelo completo): https://github.com/minsu0567/IAD-X1
- Página de autor en Hugging Face: https://huggingface.co/minsu0567
- Despliegue en FriendliAI (para la variante sin "no-hard-adapter"): https://friendli.ai/models/minsu0567/IAD-X1-GRPO-answer-last
