# GT1999/mwp-v2-llama1b-b8-stage3

## Resumen

El modelo `GT1999/mwp-v2-llama1b-b8-stage3` es un ajuste fino de tipo LoRA sobre una base Llama de 1B de parámetros, especializado en la resolución de problemas matemáticos expresados en lenguaje natural (math word problems). Lo desarrolla el usuario GT1999 y forma parte de una serie de experimentos etiquetados como `mwp-v2`, que emplean un pipeline de entrenamiento secuencial por etapas (`seqft`) con un esquema de ranking progresivo (`plrs`). Este checkpoint concreto corresponde a la tercera etapa de la configuración "b8", con un rango LoRA constante de 102 y una estrategia de partición de datos por dificultad.

El modelo está pensado para investigar metodologías de entrenamiento incremental y de replay acumulativo en dominios específicos como la resolución de problemas aritméticos. Con un tamaño de repositorio de 0,3 GB, es ligero y adecuado para entornos con recursos limitados. Aunque la información pública es escasa, su diseño sugiere un interés en optimizar la capacidad de generalización y la retención de conocimiento en tareas matemáticas de nivel progresivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Llama 1B, no se especifica variante exacta) |
| Parametros totales | No disponible (estimación ~1B según nombre "llama1b") |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors, posiblemente fp16 o bf16) |
| Idiomas soportados | No disponibles (presumiblemente inglés, no confirmado) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un ajuste fino mediante LoRA con rango 102 y alpha 204 (escala alpha/r). El entrenamiento se realiza por etapas (`stage3`), con un esquema de rango constante (102 en todas las etapas) y una partición de los datos de entrenamiento por nivel de dificultad. Se emplea replay acumulativo de niveles anteriores, lo que sugiere una estrategia de aprendizaje continuo para evitar el olvido catastrófico. El early stopping tiene paciencia 2 y se utilizan 3329 ejemplos acumulados en esta etapa. La validación se separa con semilla 42, tomando un 5% del train estratificado por nivel, y el conjunto de test nunca se usa para selección de hiperparámetros.

No se especifican detalles sobre el dataset original, el número total de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre `mwp-v2` apunta a una versión propia de un dataset de problemas matemáticos, pero no hay referencias externas. La arquitectura base es presumiblemente un modelo Llama de 1B (posiblemente Llama 3.2 1B o Llama 2 1B), aunque no se confirma en la model card.

## Capacidades

- Resolución de problemas matemáticos planteados en lenguaje natural (arithmetic word problems).
- Entrenamiento específico para manejar distintos niveles de dificultad, gracias a la partición por dificultad y el replay acumulativo.
- Capacidad de aprendizaje continuo por etapas, lo que permite incorporar nuevos niveles sin perder los anteriores.
- Al ser un modelo pequeño (1B), ofrece inferencia rápida en hardware modesto.
- No se documentan capacidades adicionales como tool calling, agentes, visión o multilingüismo.

## Casos de uso

- Tutoría educativa personalizada: el modelo puede resolver problemas de matemáticas paso a paso, adaptándose al nivel del estudiante gracias a su entrenamiento por dificultad. Es adecuado para aplicaciones de aprendizaje en línea donde se requiere una respuesta rápida y ligera.
- Generación de ejercicios de práctica: puede generar problemas matemáticos con enunciados variados a partir de plantillas, útil para plataformas de evaluación automática.
- Asistente de deberes en dispositivos móviles: al ocupar solo 0,3 GB, puede desplegarse en apps de bajo consumo para ayudar a estudiantes con problemas aritméticos.
- Evaluación de modelos de razonamiento matemático: sirve como baseline ligero en benchmarks de math word problems, permitiendo comparar metodologías de entrenamiento incremental.
- Investigación en aprendizaje continuo: su diseño con replay acumulativo y partición por dificultad lo convierte en un caso de estudio para técnicas de secuencial fine-tuning (seqft) y LoRA progresiva.
- Prototipado rápido de chatbots educativos: integrable en frameworks como RAG o pipelines de diálogo para responder consultas matemáticas sencillas sin necesidad de GPUs potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, GSM8K, HumanEval ni otras métricas estándar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros, la inferencia en fp16 requiere aproximadamente 2 GB de VRAM. Con cuantización a 8 bits puede bajar a ~1 GB, y en 4 bits a ~0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1650, RTX 3050, Jetson Nano). También puede ejecutarse en CPU con razonable velocidad.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, etc. sin problema.
- Opciones de despliegue: al ser safetensors, puede cargarse con Transformers y PEFT. También se puede convertir a GGUF para usar con llama.cpp u Ollama, o servir con vLLM (aunque para 1B quizá sea excesivo).
- Latencia: en una GPU moderna (RTX 3090) se espera una latencia de decenas de milisegundos por token. En CPU, puede ser de cientos de milisegundos por token.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados y se desconoce su base exacta. Alternativas genéricas de tamaño similar (1B) para tareas de matemáticas son Llama-3.2-1B-Instruct, Qwen2.5-1.5B-Instruct o Gemma-2-2B, pero no se pueden comparar sin datos de rendimiento. Se recomienda evaluar directamente si se busca una alternativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o robustez ante entradas adversas.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- El modelo está especializado en problemas matemáticos; su rendimiento en otras tareas de lenguaje general será limitado.
- El contexto máximo no se conoce; probablemente sea el de la base Llama (4K o 8K), pero no está confirmado.
- No hay garantías de reproducibilidad: el commit de código está indicado pero no se proporciona acceso al dataset ni al script de entrenamiento.
- Al ser un modelo experimental de una sola etapa (stage3), puede no estar optimizado para producción sin validación adicional.

## Enlaces

- [HuggingFace - GT1999/mwp-v2-llama1b-b8-stage3](https://huggingface.co/GT1999/mwp-v2-llama1b-b8-stage3)
- [Búsqueda de modelos con tag mwp-v2 en HuggingFace](https://huggingface.co/models?other=mwp-v2)
- [Modelo relacionado: GT1999/mwp-v2-llama1b-b9-stage1](https://huggingface.co/GT1999/mwp-v2-llama1b-b9-stage1) (misma familia, distinta configuración)

No se encontraron papers, blogs ni demos asociados en la búsqueda web.
