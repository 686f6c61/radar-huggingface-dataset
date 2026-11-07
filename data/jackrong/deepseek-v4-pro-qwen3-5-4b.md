# Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B es un ajuste fino de razonamiento construido sobre Qwen3.5-4B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. Lo desarrolla el usuario Jackrong y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de acceder a patrones de razonamiento estructurado de un profesor de gran escala en una clase de despliegue de solo 4B de parametros, lo que permite ejecucion en hardware modesto.

El checkpoint contiene 4.659.865.088 parametros reales (segun safetensors) y un repositorio de 9,3 GB en formato safetensors para la libreria transformers. La arquitectura declarada es `qwen3_5` y la pipeline es text-generation, aunque las etiquetas del repositorio incluyen `image-text-to-text` y el autor publica un proyector de vision por separado en la variante MTP-GGUF, lo que sugiere capacidades multimodales parciales fuera del checkpoint principal.

Su relevancia actual reside en que reproduce la receta de entrenamiento del release de 9B (aproximadamente 250.000 muestras de matematicas y STEM) en una clase de tamano mas accesible, con evaluacion declarada sobre GSM8K completo y muestras fijas de MMLU-Pro en Matematicas, Fisica y Quimica. Los idiomas soportados declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (fine-tune de Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el checkpoint principal; existen variantes GGUF (MTP-Q8 evaluado) en el repositorio MTP-GGUF |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado (SFT) de Qwen3.5-4B, por lo que hereda la arquitectura transformer de la familia Qwen3.5 con 4.659.865.088 parametros. La innovacion principal no esta en la arquitectura sino en el pipeline de destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo Max Effect y se usaron como objetivo de entrenamiento para ensenar al modelo pequeno patrones de solucion multi-paso y descomposicion explicita de problemas.

El conjunto de entrenamiento sigue la misma mezcla que el release de 9B del mismo autor: aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). Las etiquetas del repositorio incluyen `distillation`, `sft`, `math`, `stem`, `reasoning` y `mtp`. No se declara en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Tampoco se detalla la innovacion `mtp` (multi-token prediction) mas alla de su presencia en las etiquetas y en el nombre del repositorio GGUF asociado.

## Capacidades

- Generacion de texto conversacional con enfasis en razonamiento estructurado y descomposicion explicita de problemas.
- Razonamiento matematico multi-paso, entrenado sobre aproximadamente 250.000 muestras de matematicas.
- Razonamiento STEM: fisica y quimica evaluadas mediante muestras fijas de MMLU-Pro segun la model card.
- Modo de razonamiento (`reasoning`) heredado del pipeline de destilacion de DeepSeek-V4-Pro.
- Capacidades multimodales parciales: la etiqueta `image-text-to-text` y el proyector de vision publicado en el repositorio MTP-GGUF apuntan a entrada de imagen, aunque el checkpoint principal se declara como text-generation.
- Soporte bilingue declarado: ingles y chino.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: el entrenamiento en descomposicion de problemas es compatible con razonamiento multi-paso, pero no se documenta integracion de agentes.
- Capacidades de audio: no disponible.

## Casos de uso

- Tutoria de matematicas a nivel de secundaria y universidad: el modelo puede generar soluciones paso a paso gracias a su entrenamiento sobre aproximadamente 250.000 muestras matematicas destiladas de un profesor de gran escala, lo que resulta util en plataformas educativas que necesitan explicaciones detalladas y no solo la respuesta final.
- Resolucion de problemas de fisica y quimica en entornos de estudio: la evaluacion declarada sobre MMLU-Pro en estas materias indica que el modelo esta calibrado para preguntas de opcion multiple con razonamiento intermedio, adecuado para simuladores de examen.
- Asistente de laboratorio o de ingenieria para calculos intermedios: con 4B de parametros puede desplegarse en estaciones de trabajo sin GPU de datacenter, sirviendo como copiloto local para derivaciones, conversiones de unidades y comprobacion de resultados.
- Generacion de cadenas de razonamiento para destilacion posterior: al haber sido entrenado con trayectorias de DeepSeek-V4-Pro, puede usarse como generador de datos de razonamiento para ajustar modelos aun mas pequenos en dominios cientificos.
- Despliegue en local para privacidad de datos: al caber en GPUs de consumo y publicarse en safetensors y GGUF, permite ejecutar razonamiento matematico sobre datos sensibles (por ejemplo, propiedades intelectuales de I+D) sin salida a la nube.
- Chat bilingue ingles-chino en soporte tecnico: el modelo declara soporte para ambos idiomas, lo que lo hace util en equipos distribuidos entre China y mercados angloparlantes para consultas tecnicas con componente cuantitativo.
- Evaluacion comparativa de recetas de destilacion: investigadores pueden reproducir el pipeline SFT sobre Qwen3.5-4B y contrastar con el release de 9B del mismo autor para estudiar el efecto de escala en la destilacion de razonamiento.

## Benchmarks y rendimiento

La model card declara evaluacion sobre GSM8K completo y muestras fijas de MMLU-Pro en Matematicas, Fisica y Quimica, pero no se han publicado los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 12 y 16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos, con margen recomendado de 8-10 GB totales.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3 GB de pesos, con margen recomendado de 5-6 GB totales.
- GPU recomendadas para produccion: A100 40/80 GB o H100 para servir muchas peticiones concurrentes con contexto largo; L40S o A10G para cargas moderadas.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 y en RTX 3090/4080 (16 GB) en 8 bits; en 4 bits es viable en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers, text-generation-inference (declarado en las etiquetas), llama.cpp/Ollama mediante las variantes GGUF del repositorio MTP-GGUF, y vLLM como opcion habitual para arquitecturas Qwen, aunque no se confirma explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B | 4.659.865.088 | no disponible | Destilacion de razonamiento matematico/STEM desde DeepSeek-V4-Pro | apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen3.5-4B (base) | aproximadamente 4B | no disponible | Modelo base generalista | no disponible en la informacion | Hugging Face |
| Release de 9B del mismo autor (misma receta) | no disponible | no disponible | Misma mezcla de aproximadamente 250.000 muestras | no disponible en la informacion | Hugging Face |
| DeepSeek-V4-Pro (profesor) | no disponible | no disponible | Modelo de gran escala origen de la destilacion | no disponible en la informacion | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior al de modelos multilingues explicitos.
- Al ser un fine-tune especializado en matematicas y STEM, puede degradar capacidades generalistas del Qwen3.5-4B base en tareas de creatividad, redaccion o conocimiento factual amplio.
- Riesgo de alucinacion en problemas matematicos: la destilacion ensena el formato de la solucion paso a paso, pero no garantiza correccion aritmetica en todos los casos; se recomienda verificacion externa en produccion.
- La model card no documenta sesgos conocidos, evaluaciones de seguridad ni filtros de contenido.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con documentos largos sin pruebas previas.
- El checkpoint principal se declara text-generation pese a la etiqueta `image-text-to-text`; las capacidades de vision requieren el proyector publicado en el repositorio MTP-GGUF y no estan garantizadas en el uso estandar con transformers.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como esta, sin garantias; conviene revisar la procedencia de los datos de destilacion generados por DeepSeek-V4-Pro antes de un despliegue comercial regulado.
- El numero de descargas (3.730) y likes (23) es bajo, por lo que la validacion comunitaria es limitada y conviene hacer evaluacion propia antes de adoptarlo.

## Enlaces

- Modelo principal en Hugging Face: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Variante MTP-GGUF con proyector de vision: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
