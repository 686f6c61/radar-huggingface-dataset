# adriabama06/Qwen3.6-35B-A3B-speculator.dspark-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo `RedHatAI/Qwen3.6-35B-A3B-speculator.dspark`, un especulador (speculator) diseñado para acelerar la inferencia del modelo de lenguaje Qwen3.6-35B-A3B mediante decodificación especulativa. El autor, adriabama06, ha cuantizado el modelo original (que ocupa 2,65 GB en safetensors) a GGUF, lo que permite su uso con motores de inferencia como llama.cpp, Ollama o vLLM en entornos con recursos limitados.

El modelo base, desarrollado por Red Hat AI, extiende la arquitectura DFlash con una cabeza de Markov (que modela dependencias entre tokens dentro de un bloque) y una cabeza de confianza (que predice la probabilidad de aceptación por posición). Con 950 millones de parámetros, este especulador es un componente auxiliar que se ejecuta junto al modelo principal de 35B (MoE con 3B activos) para reducir la latencia de generación sin degradar la calidad.

La relevancia de esta publicación radica en que ofrece una versión cuantizada y portable de un especulador de última generación, facilitando su integración en pipelines de inferencia locales o en producción. Sin embargo, es importante señalar que este modelo no es un LLM independiente: su función exclusiva es proponer candidatos de tokens al modelo principal durante la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speculator DSpark (basado en DFlash, con Markov head y confidence head) |
| Parametros totales | 950.005.761 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (depende del modelo principal) |
| Tipos de cuantizacion | GGUF (no se especifica el nivel exacto; el tamano del repo de 8,5 GB sugiere Q8_0 o similar) |
| Idiomas soportados | no disponible (heredados del modelo principal Qwen3.6-35B-A3B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un especulador para decodificacion especulativa, no un transformer autonomo. Su arquitectura se basa en DFlash, un metodo de especulacion que utiliza una cabeza ligera para predecir multiples tokens futuros en paralelo. DSpark anade dos innovaciones: una cabeza de Markov que captura dependencias intra-bloque entre tokens consecutivos, y una cabeza de confianza que estima la probabilidad de que cada token propuesto sea aceptado por el modelo principal. Esto permite al especulador generar secuencias candidatas mas precisas y reducir el numero de llamadas al modelo grande.

El entrenamiento fue proporcionado por Lambda, plataforma de computacion en la nube para IA. No se han publicado detalles sobre el dataset o el procedimiento exacto de entrenamiento. El modelo original en safetensors ocupa 2,65 GB, y su cuantizacion a GGUF (8,5 GB en el repositorio) indica una conversion de alta precision, probablemente Q8_0, que preserva la fidelidad numerica.

## Capacidades

- Aceleracion de inferencia: su unica funcion es proponer secuencias de tokens candidatas al modelo principal Qwen3.6-35B-A3B, reduciendo el numero de pasos de decodificacion autoregresiva.
- Compatibilidad con decodificacion especulativa: implementa el protocolo estandar de especulacion, aceptando tokens propuestos y verificandolos en paralelo.
- Portabilidad: al estar en formato GGUF, puede ejecutarse en motores como llama.cpp, Ollama o vLLM con soporte para este formato.
- No realiza generacion de texto, razonamiento, codigo ni otras tareas de lenguaje por si mismo; depende completamente del modelo principal.

## Casos de uso

- Despliegue de Qwen3.6-35B-A3B en entornos con GPU limitada: el especulador cuantizado en GGUF permite ejecutar el modelo principal en hardware modesto (por ejemplo, una RTX 4090) reduciendo la latencia de generacion, ya que el especulador es mucho mas ligero que el modelo de 35B.
- Inferencia en CPU: al ser un modelo pequeno (950M parametros), puede ejecutarse en CPU con llama.cpp, mientras que el modelo principal se ejecuta en GPU, mejorando el throughput general.
- Servicios de chat en tiempo real: en aplicaciones de atencion al cliente o asistentes conversacionales, la decodificacion especulativa acelera la respuesta sin sacrificar calidad, gracias a la cabeza de confianza que minimiza rechazos.
- Integracion con vLLM en produccion: vLLM soporta decodificacion especulativa con especuladores externos; este GGUF puede cargarse como un modulo adicional para acelerar el servicio.
- Experimentacion e investigacion: permite probar la eficacia de DSpark en diferentes cuantizaciones y entornos sin necesidad de compilar el modelo original en safetensors.
- Edge computing: su tamano reducido y formato GGUF lo hacen adecuado para dispositivos con poca memoria, siempre que el modelo principal este disponible en un servidor remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un especulador, por lo que las metricas estandar de LLM (MMLU, HumanEval, GSM8K) no aplican directamente. Los unicos datos relevantes serian de aceleracion (tokens por segundo, tasa de aceptacion), que no se proporcionan en el repositorio ni en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 950M parametros en GGUF Q8_0, ocupa aproximadamente 8,5 GB en memoria. Puede ejecutarse en GPU con 8 GB o mas, o en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A10, etc.). Para el modelo principal Qwen3.6-35B-A3B se necesitarian GPUs de mayor capacidad (A100, H100, o varias RTX 4090 en configuracion multi-GPU).
- Compatibilidad con consumer GPU: si, el especulador cabe en GPUs de consumo; el modelo principal, no.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de especulacion), TGI (si soporta GGUF).
- Latencia y throughput: no disponibles. Dependen del modelo principal, del hardware y de la tasa de aceptacion del especulador.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Funcion | Licencia |
|---|---|---|---|---|
| DSpark (este) | 950M | GGUF | Speculator para Qwen3.6-35B-A3B | Apache 2.0 |
| DFlash (base) | no disponible | safetensors | Speculator para otros modelos | Apache 2.0 |
| EAGLE (de otros proyectos) | variable | safetensors/GGUF | Speculator para LLMs | variable |

No hay una comparativa directa con otros speculators en terminos de rendimiento, ya que no se publican metricas. La principal diferencia es la cuantizacion a GGUF, que facilita su uso en motores ligeros.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo principal Qwen3.6-35B-A3B para funcionar; sin el, no genera texto.
- La cuantizacion a GGUF puede introducir una ligera perdida de precision en las predicciones del especulador, lo que podria reducir la tasa de aceptacion y, por tanto, la aceleracion.
- No se especifica el nivel de cuantizacion exacto; el tamano del archivo sugiere Q8_0, pero no esta confirmado.
- No hay garantias de compatibilidad con todos los motores de inferencia; se recomienda verificar la documentacion de vLLM o llama.cpp para la integracion de especuladores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo principal Qwen3.6-35B-A3B puede tener restricciones adicionales; consultar su licencia especifica.
- No se proporcionan datos de entrenamiento, por lo que no es posible evaluar sesgos o riesgos de alucinacion inherentes al especulador (aunque al ser un modelo auxiliar, estos riesgos son minimos).

## Enlaces

- Repositorio GGUF: https://huggingface.co/adriabama06/Qwen3.6-35B-A3B-speculator.dspark-GGUF
- Modelo base (safetensors): https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-speculator.dspark
- Documentacion de Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Pagina de Ollama para Qwen3.6-35B-A3B: https://ollama.com/library/qwen3.6:35b-a3b
- Guia de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
