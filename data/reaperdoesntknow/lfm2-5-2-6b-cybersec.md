# reaperdoesntknow/LFM2.5-2.6B-CyberSec

## Resumen

LFM2.5-2.6B-CyberSec es un ajuste fino del modelo base LiquidAI/LFM2.5-2.6B publicado por el usuario reaperdoesntknow bajo licencia Apache-2.0. Se presenta como un checkpoint en ingles especializado en instrucciones de ciberseguridad, entrenado sobre el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset. El repositorio incluye pesos en formato Transformers (safetensors) y exportaciones GGUF (F16, Q8_0 y Q4_K_M), lo que facilita tanto la experimentacion con la libreria Transformers como el despliegue local con llama.cpp u Ollama.

El modelo conserva la arquitectura LFM2 del checkpoint original de LiquidAI y cuenta con 2.697.198.592 parametros totales, lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo. Su relevancia actual reside en la proliferacion de ajustes finos especializados de bajo coste: un modelo de 2,6B puede ejecutarse en GPU consumer y en CPU, y el autor lo orienta explicitamente a investigacion cualitativa y comparacion de formatos, no a uso en produccion critica.

Es importante subrayar que la propia model card declara que no se han publicado benchmarks, comparaciones con la linea base ni evaluaciones de seguridad. El autor advierte que la etiqueta del dataset y la existencia de los ficheros exportados no demuestran por si solas una mejora en capacidades de ciberseguridad. Por tanto, esta ficha debe leerse como una descripcion tecnica del artefacto publicado, no como una validacion de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada de LiquidAI/LFM2.5-2.6B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16, Q8_0 y Q4_K_M; bloque de cuantizacion bitsandbytes en la configuracion Transformers |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint LiquidAI/LFM2.5-2.6B, que emplea la arquitectura LFM2 de Liquid AI. La informacion disponible no detalla la composicion interna de esa arquitectura (tipo de atencion, capas, uso de convoluciones o mezcla de expertos), por lo que no es posible confirmar sus innovaciones tecnicas a partir de los datos proporcionados. El tamano del repositorio es de 11,8 GB, coherente con la presencia simultanea de pesos safetensors y de varias exportaciones GGUF.

El entrenamiento se asocia al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, orientado a instrucciones de ciberseguridad. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, los hiperparametros completos, los criterios de seleccion de checkpoint, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican comprobaciones de contaminacion ni el preprocesamiento aplicado. La configuracion incluida incorpora un bloque de cuantizacion bitsandbytes, y el autor recomienda fijar y probar la version exacta de Transformers, Accelerate, bitsandbytes y el entorno de dispositivo antes de su uso.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat incluida en el repositorio.
- Respuesta a instrucciones de ciberseguridad, segun el dataset declarado en los metadatos (sin evidencia publicada de mejora).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Ejecucion en formatos Transformers y GGUF, lo que permite inferencia tanto en Python como en runtimes ligeros.

## Casos de uso

- Investigacion sobre respuestas de modelos pequenos a prompts de ciberseguridad: el modelo sirve para estudiar cualitativamente como un ajuste fino de 2,6B responde a instrucciones del dominio, comparandolo con el checkpoint original sin modificar.
- Comparacion de formatos y cuantizaciones: al incluir safetensors y GGUF F16, Q8_0 y Q4_K_M, permite medir diferencias de comportamiento y latencia entre el checkpoint Transformers y cada exportacion cuantizada.
- Desarrollo de arneses de evaluacion: util como sujeto de prueba para construir y depurar pipelines de evaluacion de modelos especializados en seguridad.
- Pruebas locales de inferencia en hardware modesto: su tamano de 2,6B y las exportaciones Q4_K_M permiten ejecutarlo con llama.cpp u Ollama en equipos sin GPU dedicada de gama alta.
- Educacion y formacion en conceptos defensivos: puede emplearse para generar explicaciones introductorias (por ejemplo, defensa en profundidad) siempre que un experto revise la salida.
- Prototipado de asistentes internos de consulta sobre documentacion de seguridad: adecuado para iterar rapidamente en entornos controlados y aislados, nunca como base unica de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio no publica resultados de benchmark, comparaciones con lineas base ni evaluaciones de seguridad, y que la mejora en capacidad de ciberseguridad no queda establecida por los metadatos del dataset ni por los ficheros exportados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa por tamano, un modelo de 2,6B en FP16 requiere aproximadamente 5,4 GB solo para pesos, y en Q4_K_M alrededor de 1,6-1,8 GB, a lo que hay que sumar la memoria de contexto y el overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs consumer con 8 GB o mas de VRAM; no se dispone de datos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 6-8 GB de VRAM en cuantizaciones Q4_K_M; no confirmado por el autor.
- Opciones de despliegue: Transformers con `device_map="auto"` y bitsandbytes, llama.cpp (`llama-cli` con `--jinja`) y Ollama (`ollama run hf.co/...:Q4_K_M`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/LFM2.5-2.6B-CyberSec | 2.697.198.592 | no disponible | Apache-2.0 | safetensors, GGUF | Ajuste fino en ciberseguridad sin benchmarks publicados |
| LiquidAI/LFM2.5-2.6B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base sin ajuste; referencia para comparacion cualitativa |
| Alternativas de 2-3B especializadas en ciberseguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La unica comparacion documentada es con el modelo base LiquidAI/LFM2.5-2.6B, que el propio autor propone como linea base cualitativa. No se dispone de datos de rendimiento ni de especificaciones completas del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir instrucciones incorrectas, desactualizadas, inseguras o daninas.
- El material de ciberseguridad es inherentemente de doble uso; existe riesgo de uso indebido.
- No se documentan el preprocesamiento, las comprobaciones de contaminacion, los hiperparametros completos de entrenamiento ni los criterios de seleccion de checkpoint.
- Las compilaciones cuantizadas pueden comportarse de forma distinta al checkpoint Transformers.
- No deben ejecutarse comandos generados sin revision y aislamiento previos.
- No debe usarse como base unica para respuesta a incidentes, divulgacion de vulnerabilidades, control de acceso u otras decisiones de consecuencias relevantes.
- No se han publicado evaluaciones de sesgo, alucinacion ni seguridad.
- El soporte linguistico se limita al ingles, lo que restringe su uso en entornos hispanohablantes sin traduccion intermedia.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad desaconseja su despliegue en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-2.6B-CyberSec
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
