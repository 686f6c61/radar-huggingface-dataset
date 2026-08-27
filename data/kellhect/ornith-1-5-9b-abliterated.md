# KellHect/Ornith-1.5-9B-Abliterated

## Resumen

Ornith-1.5-9B-Abliterated es un derivado del modelo multimodal Ornith-1.5-9B, desarrollado por KellHect, al que se le ha aplicado una técnica de "abliteración" para eliminar o reducir drásticamente los comportamientos de rechazo del modelo original. El modelo base, creado por Ornith AI, está orientado a tareas de codificación agéntica y razonamiento multimodal, y este derivado se publica con fines de investigación en seguridad de IA y red teaming.

El modelo conserva la arquitectura completa del base, incluyendo la torre de visión, el bloque MTP (multi-token prediction), el tokenizador y los procesadores multimodales, pero modifica las proyecciones residuales del lenguaje mediante una combinación de SVD complementario, cirugía de dirección de rechazo LEACE, re-probing iterativo y mezcla de pesos. El resultado es un checkpoint en BF16 con 9.653 millones de parámetros, listo para fine-tuning o inferencia, que responde a solicitudes que el modelo base rechazaría.

La relevancia de este modelo radica en su utilidad para estudiar los mecanismos de rechazo en modelos multimodales, evaluar riesgos de seguridad y desarrollar contramedidas. Al estar liberado bajo licencia MIT y con pesos completos, permite a investigadores y desarrolladores experimentar con técnicas de alineación y seguridad en un entorno controlado, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`, no confirmado oficialmente) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (repo oficial); versiones MLX 4-bit y 6-bit de terceros |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), también MLX |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer multimodal denso de aproximadamente 9,65 mil millones de parámetros, diseñado para procesar entradas de imagen y texto. Según los tags de HuggingFace, la arquitectura podría estar basada en la familia Qwen3.5, aunque no hay confirmación oficial en la documentación disponible. El modelo incluye una torre de visión, un bloque de predicción multi-token (MTP) y un tokenizador propio, junto con procesadores multimodales.

El proceso de abliteración aplicado por KellHect modifica únicamente las proyecciones residuales del módulo de lenguaje, preservando el resto de componentes. La técnica combina SVD complementario y LEACE (LEAst-squares Concept Erasure) para identificar y eliminar la dirección de rechazo en el espacio de representaciones, seguido de un re-probing iterativo y un refinamiento de prompts de seguridad dirigidos. El resultado es un modelo que mantiene las capacidades generales del base pero con una probabilidad media de token de rechazo de 1,18e-5 en las pruebas de validación.

No se han publicado detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). El autor del derivado indica que la evaluación de codificación se difirió intencionalmente y que los números reportados son diagnósticos estructurales, no una afirmación de paridad con el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Codificación agéntica: el modelo base está orientado a tareas de codificación con soporte para agentes, según la web de Ornith AI, aunque no se han publicado benchmarks específicos.
- Tool calling y function calling: no confirmado explícitamente, pero la orientación agéntica del base sugiere soporte para integración con herramientas.
- Multilingüismo: no hay información sobre idiomas soportados.
- Comportamiento sin rechazo: el abliterado elimina la mayoría de las respuestas de rechazo, lo que permite explorar solicitudes que el modelo base denegaría.
- Fine-tuning y entrenamiento continuo: al publicarse en BF16 completo, es adecuado para continuar el entrenamiento o adaptarlo a dominios específicos.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comportan los sistemas sin mecanismos de rechazo, identificar vulnerabilidades y desarrollar técnicas de alineación más robustas.
- Red teaming de modelos multimodales: se puede utilizar para generar entradas adversariales o evaluar la capacidad de un sistema para resistir solicitudes maliciosas antes de implementar defensas.
- Generación de contenido creativo sin restricciones: útil para proyectos artísticos o literarios que requieran explorar temas sensibles sin filtros automáticos, siempre bajo supervisión humana.
- Evaluación de técnicas de abliteración: sirve como referencia para comparar el efecto de diferentes métodos de eliminación de rechazo en modelos de tamaño medio.
- Desarrollo de sistemas de moderación: al conocer qué respuestas genera un modelo sin rechazo, se pueden diseñar clasificadores o filtros externos más efectivos.
- Entrenamiento de modelos alineados: los pesos completos permiten aplicar fine-tuning con técnicas de alineación (RLHF, DPO) para recuperar comportamientos seguros de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo indica explícitamente que la evaluación de codificación fue diferida y que los números de validación (0/12 y 0/24 en pantallas de rechazo) son diagnósticos estructurales, no una medida de rendimiento en tareas estándar. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa aproximadamente 19,3 GB, por lo que se necesita al menos 20 GB de VRAM para cargar el modelo completo. Con cuantización 8-bit se reduce a ~10 GB, y con 4-bit a ~5 GB.
- GPU recomendadas: una GPU con 24 GB o más (RTX 3090, RTX 4090, A100, H100) es suficiente para BF16. Para cuantizaciones menores, una RTX 3060 12 GB o similar puede ser viable.
- Compatibilidad con consumer GPU: sí, con cuantización 4-bit o 6-bit cabe en GPUs de gama media (8-12 GB VRAM). La versión MLX permite ejecución en Apple Silicon (M1/M2/M3) con 16 GB o más de RAM unificada.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, llama.cpp, MLX, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles. Al ser un modelo denso de ~9,6 B, se espera una latencia moderada en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (multimodales de ~9B con abliteración). El modelo base Ornith-1.5-9B no tiene benchmarks públicos en la información recopilada. Se puede señalar que, estructuralmente, es comparable a otros modelos densos de 7-10B como Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct, pero sin datos de rendimiento no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Comportamiento sin rechazo: el modelo puede generar contenido dañino, ilegal o no ético. El autor advierte explícitamente que los usuarios son responsables del despliegue, control de acceso, contenido generado y cumplimiento legal.
- Riesgo de alucinación: al no haberse evaluado en benchmarks estándar, no se conoce su fiabilidad factual. Es probable que herede las alucinaciones del modelo base.
- Sesgos no evaluados: no hay estudios de sesgos de género, raza o ideología. El abliterado puede amplificar sesgos al eliminar filtros de seguridad.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada. El modelo base Ornith-1.0 (versión anterior) soportaba 256K tokens, pero no hay confirmación para Ornith-1.5.
- Restricciones de uso comercial: la licencia MIT permite uso comercial, pero el contenido generado puede violar leyes o políticas de plataformas. El autor recomienda uso exclusivo para investigación.
- Falta de benchmarks: no hay evidencia de rendimiento en tareas de codificación, razonamiento o visión. No debe usarse en producción sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KellHect/Ornith-1.5-9B-Abliterated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX 6-bit del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Versión MLX 4-bit del abliterado (tercero): https://llm-explorer.com/model/PocketAiHub%2FOrnith-1.5-9B-Abliterated-MLX-4bit,7ykN2hXsRYBI2DV8AXiSdK
- Web de Ornith AI: https://ornith.online/
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Repositorio Ornith-1.0 (referencia): https://github.com/GoldenSquirrelAi/ornith-1
