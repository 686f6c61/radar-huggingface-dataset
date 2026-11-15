# freakzy-spec/Asisten-Akademik-TE-UNTIDAR

## Resumen

Asisten-Akademik-TE-UNTIDAR es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario freakzy-spec. El nombre sugiere un asistente academico orientado a la Universidad Tecnologica de Untidar (UNTIDAR), aunque la model card no documenta el dataset de entrenamiento ni el proposito concreto. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), construido sobre la arquitectura Qwen2 y distribuido bajo licencia Apache 2.0.

El modelo parte de la version cuantizada en 4 bits de Qwen2.5-1.5B-Instruct publicada por Unsloth, y fue entrenado con la libreria Unsloth y TRL de Hugging Face, segun declara el autor. La relevancia practica es limitada por ahora: el repositorio no incluye informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni idiomas distintos del ingles. Su interes principal radica en ser un ejemplo de fine-tuning ligero de un modelo pequeno para un dominio academico especifico.

Al tratarse de un derivado de Qwen2.5-1.5B-Instruct, hereda las capacidades conversacionales del modelo base, pero no se han publicado metricas que cuantifiquen la mejora o el deterioro respecto al original. El contexto, las capacidades multilingues y el rendimiento real del ajuste no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base de partida esta en 4 bits bnb; el repositorio contiene safetensors) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Al derivar de Qwen2.5-1.5B-Instruct, incorpora las mejoras de esa generacion: mayor vocabulario, mejor soporte de instrucciones y alineacion mediante tecnicas de preferencia aplicadas en el modelo original. No se dispone de detalles sobre la configuracion exacta de capas, dimensiones ocultas ni cabezas de atencion en la informacion proporcionada, aunque pueden inferirse de la familia Qwen2.5-1.5B.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card, que indica que el modelo se entreno "2x mas rapido" con Unsloth. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o simplemente SFT, ni los hiperparametros (learning rate, epochs, LoRA rank). Tampoco se especifica si el ajuste se hizo sobre los pesos cuantizados en 4 bits o si se fusionaron adaptadores. Esta ausencia de informacion impide reproducir el entrenamiento o evaluar su calidad de forma rigurosa.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de Qwen2.5-1.5B-Instruct para mantener dialogos multi-turno, aunque no hay evaluacion especifica de este ajuste.
- Razonamiento basico y respuesta a instrucciones: el modelo base esta alineado para seguir instrucciones; el ajuste academico podria especializarlo, pero no se documenta.
- Generacion de codigo y matematicas: capacidades presentes en Qwen2.5-1.5B-Instruct, no verificadas en este derivado.
- Soporte de tool calling / function calling: no disponible (no documentado en este ajuste; el modelo base Qwen2.5 tiene soporte de tool calling, pero no se confirma su preservacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: la model card declara unicamente ingles ("en"); el modelo base Qwen2.5 soporta multiples idiomas, pero no se confirma en este ajuste.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistencia academica en ingles: el modelo puede responder preguntas sobre temario, explicar conceptos o generar resumenes de apuntes en ingles, aprovechando el ajuste orientado a un entorno universitario. Es adecuado por su tamano reducido y su licencia permisiva, aunque no hay evidencia de calidad especifica.
- Prototipado rapido de chatbots educativos: al ser un modelo de 1,5B parametros, puede desplegarse en una GPU consumer para iterar sobre flujos conversacionales academicos sin coste elevado de infraestructura.
- Generacion de material de estudio: redaccion de preguntas de autoevaluacion, definiciones o esquemas a partir de apuntes, en ingles, como apoyo a estudiantes.
- Fine-tuning adicional sobre dominios concretos: al estar bajo Apache 2.0 y tener un tamano manejable, sirve como punto de partida para ajustes posteriores con Unsloth o TRL en tareas academicas especificas.
- Despliegue en entornos con recursos limitados: su huella de memoria permite ejecutarlo en GPUs de 8-16 GB con cuantizacion, lo que facilita su uso en laboratorios docentes o servidores modestos.
- Experimentacion en investigacion sobre ajuste fino: util como caso de estudio de fine-tuning de modelos pequenos con tecnicas de bajo rango (LoRA/QLoRA) y para comparar el efecto del ajuste frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB); en cuantizacion 4 bits, alrededor de 1-1,5 GB de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas, y en GPUs de 6 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers, vLLM, llama.cpp (tras conversion a GGUF), Ollama (si se publica GGUF), TGI (el tag text-generation-inference sugiere compatibilidad, aunque no se confirma configuracion).
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Asisten-Akademik-TE-UNTIDAR | ~1,5B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy extendido |
| Gemma 2 2B Instruct | ~2,6B | 8.192 tokens | Gemma Terms of Use | Hugging Face, ampliamente usado |

El modelo de este analisis es un derivado del primero de la lista, por lo que sus parametros y licencia coinciden; la diferencia esta en el ajuste academico no documentado y en la ausencia de evaluacion. Frente a Llama 3.2 1B y Gemma 2 2B, el modelo base Qwen2.5-1.5B-Instruct suele ser competitivo en tareas de instruccion para su tamano, pero este ajuste concreto no aporta datos que permitan afirmar una ventaja.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento originales y en el dataset de ajuste, que no se describe.
- Riesgo de alucinacion: alto en un modelo de 1,5B parametros, especialmente en dominios academicos donde se esperan datos precisos; no hay evaluacion que lo mitigue.
- Limitaciones de contexto o idioma: la model card declara solo ingles, aunque el modelo base es multilingue; el contexto efectivo no esta confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia del dataset de ajuste, lo que puede implicar riesgos legales si se usaron datos con derechos de autor.
- Caveats para produccion: repositorio con 0 descargas y 0 likes, sin documentacion de entrenamiento ni evaluacion; no se recomienda su uso en produccion sin una validacion previa exhaustiva.
- El modelo de partida esta cuantizado en 4 bits (bnb); si el ajuste se realizo sobre esa version sin fusionar adaptadores, la calidad puede diferir de un fine-tuning sobre pesos completos.
- No hay informacion sobre el proceso de alineacion posterior al ajuste; el modelo podria haber perdido parte de la robustez conversacional del base.

## Enlaces

- Hugging Face: https://huggingface.co/freakzy-spec/Asisten-Akademik-TE-UNTIDAR
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
