# ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath-GGUF

## Resumen

Qwen3.5-0.8B-SFT-NuminaMath-GGUF es la version cuantizada en formato GGUF de un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario independiente ermiaazarkhalili y esta especializado en razonamiento matematico paso a paso, ya que se entrena sobre el dataset AI-MO/NuminaMath-CoT, una coleccion de problemas matematicos con cadenas de razonamiento (chain-of-thought). El modelo resuelve el problema de disponer de un modelo matematico pequeno, ligero y ejecutable en CPU o GPU de gama baja mediante llama.cpp u Ollama.

Con 752.393.024 parametros totales (aproximadamente 0,8 mil millones), se trata de un modelo de la familia Qwen3.5 de escala reducida. El repositorio GGUF ocupa 3,5 GB e incluye seis niveles de cuantizacion que van de 431 MB (Q2_K) a 812 MB (Q8_0), lo que permite desplegarlo en entornos con recursos muy limitados. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual radica en la combinacion de tres factores: tamano minimo, especializacion en matematicas y formato GGUF listo para inferencia local. No obstante, el autor advierte explicitamente de que no se ha ejecutado ninguna evaluacion de benchmarks sobre este checkpoint, por lo que su calidad real solo esta respaldada por las observaciones de perdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; transformer segun familia Qwen, detalle no confirmado en la informacion) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (431 MB), Q3_K_M (472 MB), Q4_K_M (535 MB), Q5_K_M (581 MB), Q6_K (630 MB), Q8_0 (812 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos completos en el repositorio ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ajusta mediante LoRA (Low-Rank Adaptation) con supervisied fine-tuning, usando las librerias PEFT y TRL de Hugging Face. El dataset de entrenamiento es AI-MO/NuminaMath-CoT, compuesto por problemas matematicos con soluciones en formato de cadena de razonamiento. Los adaptadores LoRA se fusionaron (merged) en los pesos del modelo base antes de la cuantizacion, de modo que el resultado es un unico conjunto de pesos que no puede separarse del ajuste fino.

El entrenamiento se ejecuto de forma no interactiva mediante papermill sobre una particion SLURM con GPU H100, a partir del cuaderno `notebooks/sft_numinamath_qwen3.5-0.8b.ipynb`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros (rango LoRA, tasa de aprendizaje, epocas) ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La cuantizacion se realizo a partir del repositorio de pesos completos del mismo autor.

## Capacidades

- Generacion de texto orientada a razonamiento matematico paso a paso, gracias al entrenamiento sobre NuminaMath-CoT.
- Resolucion de problemas matematicos con cadenas de razonamiento explicitas (chain-of-thought).
- Generacion de texto general, heredada del modelo base Qwen3.5-0.8B.
- Inferencia local en CPU o GPU de gama baja mediante llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el formato CoT sugiere razonamiento por pasos, pero sin confirmacion.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistencia en resolucion de problemas matematicos de secundaria y bachillerato: el modelo puede generar soluciones paso a paso en formato CoT, adecuado para herramientas educativas que necesitan explicaciones detalladas y ejecutables en hardware modesto.
- Generacion de datasets sinteticos de razonamiento matematico: al estar entrenado sobre NuminaMath-CoT, puede producir cadenas de razonamiento para aumentar corpus de entrenamiento de modelos mayores, con la ventaja de su bajo coste de inferencia.
- Tutoria matematica offline en dispositivos de borde: con cuantizaciones de 431-535 MB, cabe en telefonos, Raspberry Pi o portatiles sin GPU, permitiendo un tutor local sin conexion.
- Prototipado rapido de pipelines de evaluacion matematica: su tamano permite ejecutar muchas muestras por segundo en una sola GPU para filtrar o clasificar respuestas candidatas.
- Integracion en entornos de CI/CD para verificacion de pasos algebraicos: se puede invocar via llama.cpp en contenedores ligeros para comprobar transformaciones simbolicas en pruebas automatizadas.
- Experimentacion academica sobre ajuste fino de modelos pequenos: sirve como referencia reproducible (cuaderno papermill, SLURM, PEFT+TRL) para estudiar el efecto del SFT con LoRA en modelos de menos de mil millones de parametros.
- Demos interactivas de bajo coste: al ocupar menos de 1 GB en Q8_0, se puede desplegar en servicios serverless o entornos con memoria limitada para demostraciones de razonamiento matematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente en la model card que no se ha ejecutado ninguna evaluacion de benchmarks sobre este checkpoint y que los unicos numeros reportados son observaciones de perdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB y 1 GB segun cuantizacion (Q2_K 431 MB, Q4_K_M 535 MB, Q8_0 812 MB), mas el overhead de la ventana de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU. GPU de datacenter (A100, H100) no son necesarias y estarian sobredimensionadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Dado el tamano (menos de mil millones de parametros), se espera una latencia muy baja en GPU consumer y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-SFT-NuminaMath-GGUF (este) | 752 M | no disponible | Matematicas (NuminaMath-CoT) | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Generico | Apache 2.0 (segun herencia) | safetensors |
| ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath | 752 M | no disponible | Matematicas (NuminaMath-CoT) | Apache 2.0 | safetensors (pesos completos) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente al modelo base ni frente a otros modelos matematicos de tamano similar. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluacion de benchmarks; la calidad solo esta respaldada por observaciones de perdida de entrenamiento.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base Qwen3.5-0.8B.
- Entrenado sobre un unico dataset de instrucciones (NuminaMath-CoT); el comportamiento fuera de esa distribucion no esta probado.
- Los adaptadores LoRA se fusionaron en los pesos, por lo que el modelo no puede separarse del ajuste fino.
- Riesgo de alucinacion en razonamientos matematicos largos, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_M) que pueden degradar la coherencia de las cadenas de razonamiento.
- Idiomas soportados no documentados; el dataset de entrenamiento es predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no disponible; no se recomienda para tareas que requieran ventanas largas sin verificacion previa.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene revisar los terminos del modelo Qwen original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath-GGUF
- Pesos completos (SFT): https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
