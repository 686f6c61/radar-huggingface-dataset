# Damirchik/vla-grounder-qwen3.5-9b-vl-think-openvla

## Resumen

El modelo `Damirchik/vla-grounder-qwen3.5-9b-vl-think-openvla` es un adaptador de visión-lenguaje-acción (VLA) desarrollado por Damirchik, diseñado para convertir una imagen de escena y una instrucción humana en un comando conciso y visualmente fundamentado que puede ser ejecutado por una política VLA congelada. Se basa en el modelo multimodal Qwen3.5-9B, sobre el cual se aplica un ajuste fino mediante GRPO con un adaptador LoRA de rango 32, utilizando recompensas escasas generadas por una política OpenVLA congelada durante el entrenamiento en el benchmark VL-Think.

Este checkpoint está orientado a la investigación en control robótico condicionado por lenguaje, adaptación de VLA congelados y reproducibilidad de experimentos. Su arquitectura hereda las capacidades del modelo base Qwen3.5-9B (aproximadamente 9,4 mil millones de parámetros), aunque los detalles específicos de la arquitectura multimodal no se detallan en la información disponible. Relevante en el contexto actual de la robótica basada en modelos de lenguaje-visión, este modelo aborda el problema de generar comandos accionables a partir de instrucciones humanas ambiguas o de alto nivel, mejorando la interfaz entre el lenguaje natural y las políticas de control preentrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (modelo base multimodal, pipeline image-text-to-text) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, carga en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del Qwen3.5-9B, un modelo de lenguaje multimodal que procesa imágenes y texto. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con un adaptador LoRA de rango 32, sobre el benchmark VL-Think. Durante el entrenamiento, una política OpenVLA congelada proporciona recompensas escasas (sparse rollout rewards) que guían al modelo para generar comandos visualmente fundamentados. La innovación clave es el concepto de "VLA Grounder": en lugar de entrenar un VLA completo, este modelo actúa como un traductor entre instrucciones humanas y comandos ejecutables, que luego son pasados a un VLA congelado (OpenVLA) para el control real. No se especifican detalles sobre la composición del dataset de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Recepción de una imagen de escena y una instrucción humana en texto, generando un comando conciso y visualmente fundamentado.
- Adaptación a políticas VLA congeladas: el comando extraído de la respuesta del modelo se pasa directamente al VLA downstream.
- Entrenado específicamente para el benchmark VL-Think, que evalúa razonamiento visual-lingüístico orientado a acciones robóticas.
- Capacidades de razonamiento multimodal heredadas de Qwen3.5-9B (comprensión de imagen y texto combinados).
- No se documentan capacidades adicionales como tool calling, generación de código o soporte multilingüe explícito.

## Casos de uso

- Control robótico condicionado por lenguaje: el modelo convierte instrucciones como "coge la taza roja" en comandos precisos que una política OpenVLA puede ejecutar, facilitando la interacción humano-robot en entornos de manipulación.
- Adaptación de políticas VLA congeladas: permite actualizar o especializar un VLA existente sin reentrenarlo, generando comandos intermedios que se ajustan a nuevas tareas o entornos.
- Investigación en aprendizaje por refuerzo con recompensas escasas: el modelo sirve como componente en pipelines de entrenamiento donde se necesitan recompensas densas a partir de instrucciones de alto nivel.
- Desarrollo de interfaces de lenguaje natural para robots: integración en sistemas de teleoperación o autonomía donde el operador describe la tarea y el modelo produce la secuencia de comandos.
- Reproducibilidad de experimentos en robótica: al ser un checkpoint público con código de carga documentado, puede utilizarse como referencia para comparar métodos de grounding visual-lingüístico.
- Evaluación de modelos de visión-lenguaje-acción en benchmarks como VL-Think: permite medir la calidad de la generación de comandos frente a otras aproximaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se entrenó sobre VL-Think, pero no se proporcionan métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener ~9,4 B parámetros, en bfloat16 (como se indica en el código de carga) se requieren aproximadamente 18,8 GB solo para los pesos, más overhead de activaciones y optimizador. Con cuantización de 8 bits se reduciría a ~9,4 GB, y con 4 bits a ~4,7 GB (valores orientativos, no confirmados por el autor).
- GPU recomendadas: para inferencia en bfloat16, una GPU con al menos 24 GB de VRAM (p. ej., RTX 3090/4090, A10G, A100 40 GB). Para cuantización de 4 bits podría caber en GPUs de 8-12 GB, pero no hay soporte oficial documentado.
- No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). Dado que usa `transformers` con `trust_remote_code`, se puede cargar con Hugging Face Transformers en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos (p. ej., OpenVLA, RT-2, o otros VLA grounders) en términos de rendimiento o características detalladas. El modelo comparte base con Qwen3.5-9B, pero su especialización en grounding para VLA lo distingue de modelos de propósito general. No hay datos de comparación publicados.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que limita su uso comercial sin claridad legal.
- Modelo de investigación: el autor declara que está destinado a investigación y reproducibilidad, no a despliegue en producción.
- Dependencia de OpenVLA: el rendimiento final depende de la política VLA congelada; el modelo solo genera comandos intermedios.
- Riesgo de alucinación visual: al ser un modelo multimodal, puede generar comandos basados en interpretaciones erróneas de la imagen, especialmente en escenas complejas.
- Sin datos de sesgos ni idiomas: no se documentan sesgos conocidos ni cobertura multilingüe; probablemente esté optimizado para inglés (idioma del benchmark VL-Think).
- Escasez de documentación técnica: no se detallan la longitud de contexto, el dataset de entrenamiento ni las métricas de rendimiento, lo que dificulta la evaluación rigurosa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Damirchik/vla-grounder-qwen3.5-9b-vl-think-openvla
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Página de Qwen3.5 en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Repositorio no oficial de Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
