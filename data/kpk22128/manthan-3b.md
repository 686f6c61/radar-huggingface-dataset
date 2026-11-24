# kpk22128/Manthan-3B

## Resumen

Manthan-3B es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario kpk22128 y publicado en Hugging Face. Se trata de un modelo de generacion de texto de tipo transformer denso con 3.085.938.688 parametros (aproximadamente 3,09 mil millones), derivado del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen2.5-3B-Instruct-bnb-4bit`) y entrenado con la libreria Unsloth y TRL de Hugging Face. La model card indica que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no detalla el conjunto de datos, el numero de tokens ni la metodologia de ajuste.

El modelo hereda la arquitectura Qwen2 de la familia Qwen2.5, lo que implica un transformer decoder-only con atencion por causalidad, RoPE y soporte nativo de contexto largo (Qwen2.5-3B-Instruct declara 32.768 tokens de contexto, aunque la model card de este ajuste no lo confirma explicitamente). Esta pensado para generacion de texto conversacional en ingles, segun los tags del repositorio (`conversational`, `en`).

Su relevancia es limitada en el ecosistema actual: se trata de un ajuste comunitario sin benchmarks publicados, sin descripcion del dataset de entrenamiento y con cero descargas en el momento de la consulta. Resulta util como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre un modelo base pequeno y con licencia Apache 2.0, pero no como modelo de referencia para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-3B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el base se entreno desde un checkpoint bnb-4bit; el repo publica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del Qwen2.5-3B-Instruct oficial de Alibaba. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con atencion causal, embeddings rotatorios (RoPE) y las mejoras introducidas en Qwen2.5 (mayor volumen de datos de preentrenamiento, mejoras en matematicas y codigo respecto a Qwen2). El numero exacto de capas, dimensiones ocultas y cabezas de atencion no se detalla en la model card, pero corresponde a la configuracion estandar de Qwen2.5-3B.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, con una velocidad "2x mas rapida" respecto a un flujo estandar. No se especifica el dataset de ajuste, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documenta si el ajuste se hizo sobre el modelo cuantizado en 4 bits (QLoRA) o con pesos completos. Esta ausencia de informacion impide reproducir el entrenamiento o evaluar la calidad del ajuste de forma independiente.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del base.
- Generacion de codigo y resolucion de problemas matematicos sencillos, limitada por el tamano de 3B parametros.
- Soporte de tool calling y function calling, si el ajuste no lo ha degradado (el base Qwen2.5 lo soporta; la model card no lo confirma para este ajuste).
- Capacidades multilingues limitadas al ingles segun los tags del repositorio, aunque el base Qwen2.5 soporta multiples idiomas.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con un contexto de hasta 32.768 tokens (heredado del base), suficiente para conversaciones largas o documentos extensos en pruebas de concepto.
- Generacion de codigo en entornos de desarrollo local: con 3B parametros y licencia Apache 2.0, puede desplegarse en una estacion de trabajo para autocompletar funciones o generar tests unitarios en pipelines de CI/CD sin coste de API.
- Clasificacion y extraccion de informacion de textos: el modelo puede reformatear o resumir documentos en ingles, util para tareas de preprocesamiento en pipelines de datos.
- Fine-tuning adicional sobre dominios especificos: al ser un ajuste comunitario con licencia permisiva, sirve como punto de partida para experimentos de QLoRA en dominios verticales (legal, sanitario, atencion al cliente).
- Educacion y experimentacion con Unsloth: el repositorio documenta el flujo de entrenamiento con Unsloth y TRL, por lo que es util como ejemplo reproducible para quienes quieran aprender a ajustar modelos Qwen2.5.
- Despliegue en hardware de consumo: con ~3B parametros y cuantizacion a 4 bits, cabe en GPUs de 8 GB de VRAM, lo que permite ejecutar inferencia local en portatiles con RTX 3060/4060 o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB en cuantizacion 4 bits (Q4_K_M), ~6 GB en fp16 (3,09 B parametros x 2 bytes), ~12 GB en fp32.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizacion 4 bits (RTX 3060, RTX 4060, RTX 3070, etc.).
- Opciones de despliegue: transformers (nativo), vLLM, llama.cpp (requiere conversion a GGUF), Ollama (previa conversion), TGI (text-generation-inference), Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend. En una RTX 4090 con vLLM se puede esperar un throughput del orden de cientos de tokens por segundo para un modelo de 3B, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Manthan-3B | ~3,09 B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Ajuste comunitario sin benchmarks |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 3B Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Ollama | Contexto mayor, licencia con restricciones |
| Phi-3.5-mini | ~3,8 B | 128.000 tokens | MIT | Hugging Face, Ollama | Mayor contexto, licencia permisiva |

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el ajuste.
- Riesgo de alucinacion inherente a modelos de 3B parametros, especialmente en tareas de razonamiento complejo o matematicas.
- El modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al del base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El ajuste se realizo sobre un checkpoint cuantizado en 4 bits, lo que puede introducir perdida de calidad respecto al base en fp16/bf16.
- No se documenta si el tool calling del base sigue funcionando tras el ajuste; conviene validarlo antes de usarlo en agentes.
- El contexto maximo no se confirma en la model card; asumir 32.768 tokens sin verificacion puede provocar errores en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kpk22128/Manthan-3B
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
