# mradermacher/Aureth-4B-Qwen3.5-Heretic-GGUF

## Resumen

Aureth-4B-Qwen3.5-Heretic-GGUF es una colección de cuantizaciones GGUF estáticas del modelo base Auguments/Aureth-4B-Qwen3.5-Heretic, preparadas por mradermacher para su uso local eficiente. El nombre sugiere un modelo de 4 mil millones de parámetros, probablemente derivado de la familia Qwen3.5, con la variante "Heretic" que indica un proceso de ablación o "uncensoring" (eliminación de alineaciones de seguridad) similar a otros modelos "heretic" del mismo autor. Este tipo de modelos se orienta a usuarios que buscan respuestas sin restricciones temáticas, aunque con los riesgos asociados.

La relevancia actual radica en la demanda de modelos locales ligeros (4B) que puedan ejecutarse en hardware de consumo, y en el interés por variantes "desalineadas" para experimentación o casos de uso específicos. Sin embargo, la información pública disponible es muy limitada: no se especifican arquitectura, datos de entrenamiento, ni licencia del modelo base, lo que dificulta una evaluación técnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios del README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo similar Qwen3.5-4B-heretic-GGUF indica apache-2.0, pero no se puede confirmar para este) |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura del modelo base. Por el nombre, se infiere que pertenece a la familia Qwen3.5, que en versiones conocidas utiliza arquitectura transformer con atención de múltiples cabezas y mezcla de expertos (MoE) en algunos tamaños, pero no hay confirmación para este modelo concreto. El proceso "Heretic" suele implicar abliteración (abliteration) de las capas de rechazo de respuestas, una técnica que modifica los pesos para eliminar la negativa a responder contenido sensible. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto general: al ser un modelo de 4B, puede producir texto coherente en tareas conversacionales y de completado, aunque sin datos concretos de rendimiento.
- Conversación multi-turno: probablemente soporta diálogos, pero no hay especificaciones sobre la ventana de contexto.
- Sin restricciones temáticas: la variante "Heretic" sugiere que el modelo ha sido modificado para no rechazar peticiones sobre temas sensibles (violencia, contenido explícito, etc.), lo que puede ser útil para investigación en seguridad o para usuarios que necesitan respuestas sin filtros.
- No se confirma soporte de tool calling, agentes, razonamiento avanzado, visión o audio.

## Casos de uso

- Experimentación con modelos desalineados: investigadores de seguridad y alineación pueden estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con la versión original.
- Generación de contenido creativo sin restricciones: escritores o creadores que necesitan explorar temas tabú o controvertidos en narrativa, sin limitaciones impuestas por el modelo base.
- Pruebas de robustez en sistemas de moderación: desarrolladores pueden usar este modelo para generar entradas adversariales y evaluar filtros de contenido en aplicaciones.
- Despliegue local en hardware modesto: al ser de 4B y estar cuantizado en GGUF, puede ejecutarse en CPUs o GPUs con poca VRAM (por ejemplo, 4-6 GB), permitiendo prototipos rápidos en entornos sin acceso a la nube.
- Educación sobre riesgos de modelos sin alinear: en cursos de ética de IA, se puede demostrar cómo la abliteración afecta la seguridad y la calidad de las respuestas.
- Integración en chatbots de nicho: para comunidades que requieren respuestas sin censura en dominios específicos (por ejemplo, discusión de temas políticos o sociales sensibles), aunque con advertencias legales y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en cuantización Q4_K_S, se estima un uso de memoria de aproximadamente 2.5-3 GB, lo que permite ejecutarlo en GPUs con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060). En CPU, con llama.cpp, se puede ejecutar con 8 GB de RAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan; una RTX 3060 o superior ofrecería una latencia aceptable (menos de 20 tokens/s en Q4).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de mediciones oficiales; en una RTX 3060 se esperan entre 20-40 tokens/s para Q4_K_S, pero es una estimación genérica.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas. El repositorio mradermacher ofrece otros modelos "heretic" como Qwen3.5-4B-heretic-GGUF o Qwen3.5-27B-heretic-GGUF, pero no se conocen sus especificaciones exactas. Se recomienda consultar directamente los repositorios de HuggingFace para obtener datos comparativos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin alineación, es más propenso a generar contenido ofensivo, incorrecto o peligroso. No debe usarse en producción sin supervisión humana.
- Riesgo de alucinación: sin datos de entrenamiento verificados, la fiabilidad factual es desconocida; probablemente similar a otros modelos de 4B, con tendencia a inventar información.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto; si es similar a otros Qwen de 4B, podría ser de 32K o 128K, pero no está confirmado.
- Restricciones de licencia: la licencia no está especificada; el repo similar indica Apache 2.0, pero no se puede asumir. Antes de uso comercial, contactar con el autor del modelo base.
- Advertencia legal: el uso de modelos "uncensored" puede violar términos de servicio de plataformas o leyes locales si se generan contenidos ilegales. El responsable es el usuario.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-Heretic-GGUF
- Repositorio del modelo base (mencionado en el README): https://huggingface.co/Auguments/Aureth-4B-Qwen3.5-Heretic
- Repositorio similar de mradermacher (Qwen3.5-4B-heretic-GGUF): https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
