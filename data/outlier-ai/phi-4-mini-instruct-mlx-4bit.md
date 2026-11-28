# Outlier-Ai/Phi-4-mini-instruct-MLX-4bit

## Resumen

Phi-4-mini-instruct-MLX-4bit es una cuantizacion a 4 bits en formato MLX del modelo `microsoft/Phi-4-mini-instruct`, publicada por Outlier-Ai. El modelo original lo desarrolla Microsoft dentro de la familia Phi-4, orientada a modelos pequenos con capacidades de razonamiento, codigo y function calling que puedan ejecutarse en hardware de consumo. Esta conversion concreta esta pensada para inferencia local en Apple Silicon (chips M1, M2, M3 y M4) usando el framework MLX y la libreria mlx-lm.

El modelo base tiene 3.836.021.760 parametros (aproximadamente 3,8 mil millones) y una arquitectura transformer densa (no MoE), identificada en los tags como `phi3`. La cuantizacion a 4 bits reduce el repositorio a 2,2 GB, lo que permite ejecutarlo en Macs con memoria unificada modesta, sin GPU dedicada ni conexion a la nube. Soporta ocho idiomas (ingles, aleman, frances, espanol, italiano, portugues, neerlandes y polaco) y esta etiquetado para chat conversacional, tool use y despliegue en el borde.

Su relevancia actual radica en la combinacion de licencia MIT, tamano reducido, soporte multilingue y capacidad declarada de function calling, lo que lo hace atractivo para prototipos de agentes locales y aplicaciones de escritorio con privacidad por diseno. La model card es escueta: se limita a describir el proceso de conversion y a promocionar la aplicacion Outlier para macOS, sin detallar el procedimiento de cuantizacion ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3/Phi-4, tag `phi3`) |
| Parametros totales | 3.836.021.760 (aproximadamente 3,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MLX), unica variante publicada en este repositorio |
| Idiomas soportados | Ingles, aleman, frances, espanol, italiano, portugues, neerlandes, polaco |
| Licencia | MIT |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla del tag `phi3` y la relacion con `microsoft/Phi-4-mini-instruct`. Se trata de un transformer denso de aproximadamente 3,8 mil millones de parametros; no es un modelo de mezcla de expertos ni un modelo hibrido SSM. Esta ficha no puede confirmar el numero de capas, dimensiones ocultas, tipo de atencion ni vocabulario, porque la model card de esta conversion no los detalla.

Respecto al entrenamiento, la model card de esta cuantizacion no aporta informacion sobre el corpus, el numero de tokens, las fases de ajuste fino supervisado, RLHF o DPO del modelo original. Tampoco se documenta el metodo exacto de cuantizacion aplicado por Outlier-Ai (por ejemplo, si se uso cuantizacion de grupo, calibracion o que tamano de grupo). La unica innovacion tecnica explicitamente atribuible a esta publicacion es el empaquetado en formato MLX para aceleracion Metal en Apple Silicon, lo que permite aprovechar la memoria unificada de los chips de Apple.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas europeos.
- Razonamiento y respuesta a preguntas de caracter general, segun los ejemplos de la model card (definiciones, listas, hechos simples).
- Soporte declarado de function calling y tool use (tags `function-calling` y `tool-use`), lo que habilita integracion con APIs y agentes.
- Capacidad de ejecucion totalmente local y offline en macOS, sin claves de API ni llamadas a la nube.
- Inferencia acelerada por Metal mediante MLX en chips M1, M2, M3 y M4.
- No se declaran capacidades de vision, audio, thinking mode explicito ni generacion de imagenes.
- El rendimiento en codigo y matematicas no esta cuantificado en la informacion disponible.

## Casos de uso

- Asistente de escritorio privado: el modelo puede ejecutarse integramente en un MacBook Air o Mac mini mediante MLX, procesando conversaciones sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Automatizacion de tareas con function calling: gracias al soporte declarado de tool use, puede conectarse a scripts locales o APIs internas para lanzar acciones (consultas a bases de datos, gestion de ficheros) en flujos de agentes de un solo paso o pocos pasos.
- Prototipado rapido de aplicaciones de chat: con `mlx-lm` y un unico comando de generacion, un desarrollador puede validar prompts y flujos conversacionales en local antes de migrar a un modelo mayor o a un servicio en la nube.
- Atencion al cliente en idiomas europeos: al cubrir espanol, frances, aleman, italiano, portugues, neerlandes y polaco, puede emplearse en prototipos de soporte multilingue para mercados de la UE sin depender de proveedores externos.
- Educacion y tutoria offline: en entornos sin conectividad (aulas, portatiles en movilidad) puede responder preguntas y generar explicaciones breves con latencia baja gracias a su tamano reducido.
- Clasificacion y resumen de texto en el borde: su ventana de contexto (no documentada aqui) y su tamano permiten procesar documentos cortos en pipelines locales de extraccion o resumen dentro de aplicaciones de macOS.
- Base para experimentacion con cuantizacion: investigadores pueden comparar esta conversion de 4 bits frente al modelo original en fp16 para medir la degradacion de calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput, y tampoco referencia los resultados del modelo base de Microsoft.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 2,2 GB en 4 bits; en la practica se necesita algo mas de memoria unificada para el contexto y el runtime (orientativamente 3-4 GB, aunque no se documenta oficialmente).
- GPU recomendadas: no aplica GPU dedicada; el modelo esta disenado para Apple Silicon con Metal (M1, M2, M3, M4).
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y memoria unificada suficiente; en GPUs NVIDIA no es el formato nativo (requiere conversion a GGUF u otro runtime).
- Opciones de despliegue: `mlx-lm` (linea de comandos y API Python) y la aplicacion Outlier para macOS; no se mencionan vLLM, TGI, llama.cpp ni Ollama para este repositorio concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-MLX-4bit (este) | 3,8 B | No disponible | MIT | MLX 4 bits, Apple Silicon | Conversion de Outlier-Ai; soporte de tool use declarado |
| microsoft/Phi-4-mini-instruct (original) | 3,8 B | No disponible | MIT | Safetensors (fp16/bf16) | Modelo base; mayor precision, mayor huella de memoria |
| Outlier-Nano-4B-MLX-4bit | 4 B (aproximado) | No disponible | No disponible | MLX 4 bits, Apple Silicon | Conversion del mismo autor, distribuida en su app |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit | 7 B (aproximado) | No disponible | No disponible | MLX 4 bits, Apple Silicon | Conversion del mismo autor, orientada a razonamiento; mayor tamano |

La comparacion cuantitativa de rendimiento entre estas alternativas no es posible con la informacion disponible, ya que ninguna de las model cards consultadas aporta benchmarks.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la precision respecto al modelo original en tareas sensibles, como matematicas o generacion de codigo; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en preguntas factuales o de conocimiento especializado.
- La longitud de contexto no esta documentada en esta ficha; no debe asumirse una ventana larga sin verificarla en el modelo base.
- El soporte multilingue se limita a los ocho idiomas listados; el rendimiento fuera de ellos no esta garantizado.
- La licencia MIT heredada permite uso comercial, pero conviene revisar la model card del modelo original de Microsoft por si existen terminos adicionales de uso aceptable.
- Dependencia exclusiva del ecosistema Apple/MLX: no es directamente utilizable en Linux o Windows con GPU NVIDIA sin conversion previa.
- La model card tiene caracter promocional (enlaces a la app Outlier y a una oferta de pago); las cifras de rendimiento mencionadas por el autor no se presentan como pruebas de release.
- El modelo no incluye mecanismos de seguridad o moderacion documentados; en produccion conviene anadir filtros propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Phi-4-mini-instruct-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Aplicacion Outlier para macOS: https://outlier.host/
- Conversion hermana Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Conversion hermana Outlier-Lite-9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Conversion hermana Outlier-Quick-26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Conversion hermana Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Conversion DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversion Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Conversion Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
