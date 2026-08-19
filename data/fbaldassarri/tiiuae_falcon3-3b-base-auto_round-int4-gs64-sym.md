# fbaldassarri/tiiuae_Falcon3-3B-Base-auto_round-int4-gs64-sym

## Resumen

Este modelo es una versión cuantizada a 4 bits (INT4) del modelo Falcon3-3B-Base, desarrollado por TII (Technology Innovation Institute) y cuantizado por fbaldassarri mediante el framework Intel AutoRound v0.13.1. La cuantización es de tipo weights-only (solo pesos), con group size 64 y cuantización simétrica, utilizando el algoritmo SignRound. Está diseñado específicamente para inferencia eficiente en hardware Intel: CPU, iGPU (Arc) a través de intel-extension-for-pytorch, y NPU (AI Boost en procesadores Core Ultra) mediante OpenVINO.

A pesar de su nombre, el modelo tiene 1.150.798.848 parámetros (aproximadamente 1,15 mil millones), según los datos reales de los safetensors. Es un modelo base de completado de texto, no un asistente conversacional, por lo que se utiliza con prompts de texto sin formato. Su relevancia radica en que permite ejecutar un modelo de razonamiento de tamaño medio en dispositivos con recursos limitados, como portátiles con CPU Intel o sistemas sin GPU dedicada, manteniendo un equilibrio entre velocidad y consumo de memoria.

La cuantización se realizó con calibración en CPU, utilizando 128 muestras, 200 iteraciones de ajuste, una longitud de secuencia de 512 tokens y un batch size de 4. El proceso completo tardó aproximadamente 290 minutos. El modelo se distribuye bajo licencia Apache 2.0 y está pensado únicamente para fines de investigación, según el descargo de responsabilidad del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo Llama (segun tags del modelo, `model_type: llama`); modelo base: Falcon3-3B-Base de TII |
| Parametros totales | 1.150.798.848 (aproximadamente 1,15 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, group size 64, simetrica, metodo AutoRound (SignRound), weights-only |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Falcon3-3B-Base es un modelo de lenguaje autoregresivo de la familia Falcon3 de TII. Segun los tags del repositorio, el tipo de modelo es `llama`, lo que sugiere una arquitectura similar a la familia Llama (transformer decoder-only con attention causal). No se dispone de detalles adicionales sobre la arquitectura interna del modelo base en la informacion proporcionada.

La cuantizacion se realizo con Intel AutoRound v0.13.1, un framework de cuantizacion weights-only que utiliza el algoritmo SignRound. Este metodo ajusta los pesos cuantizados mediante un proceso de optimizacion basado en la calibracion con un conjunto de datos. Las condiciones de ejecucion registradas indican que se utilizo `torch.bfloat16` para la carga del modelo, calibracion en CPU con 128 muestras, 200 iteraciones, longitud de secuencia de 512 tokens y batch size de 4. El resultado es un modelo con pesos en INT4, group size 64 y cuantizacion simetrica, lo que reduce el tamaño de los pesos y acelera la inferencia entre 2 y 3 veces, con una ligera perdida de precision.

## Capacidades

- Generacion de texto: al ser un modelo base, puede completar texto a partir de un prompt dado, generando continuaciones coherentes.
- Razonamiento basico: dependiendo de las capacidades del modelo base Falcon3-3B, puede realizar tareas de razonamiento simple, aunque no esta afinado para instrucciones ni chat.
- Completado de codigo: si el modelo base fue entrenado con datos de codigo, puede completar fragmentos de codigo, aunque no se confirma en la informacion disponible.
- Multilingue: solo soporta ingles, segun la etiqueta de idioma.
- Sin soporte de tool calling ni function calling: al ser un modelo base, no incluye capacidades de llamada a herramientas.
- Sin modo agente: no dispone de capacidades de razonamiento multi-paso ni uso de agentes.
- Sin modo thinking: no hay indicacion de un modo de razonamiento explicito.

## Casos de uso

- Generacion de texto en entornos con recursos limitados: al estar cuantizado a INT4 y optimizado para CPU, puede ejecutarse en portatiles o mini-PCs sin GPU, generando texto para aplicaciones como resumen de documentos o redaccion asistida.
- Completado de texto en aplicaciones de escritorio: integrable en editores de texto o herramientas de productividad para sugerir continuaciones de frases o parrafos, aprovechando su bajo consumo de memoria (aproximadamente 0,6 GB para los pesos en INT4).
- Prototipado rapido en CPU: ideal para desarrolladores que necesitan probar un modelo de lenguaje en un entorno de desarrollo sin acceso a GPUs, gracias a su compatibilidad con transformers y su facilidad de carga.
- Inferencia en dispositivos Intel con NPU: pensado para ejecutarse en procesadores Intel Core Ultra con AI Boost, permite aplicaciones de generacion de texto en el borde (edge) sin conexion a la nube.
- Investigacion academica sobre cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion INT4 con group size 64 en modelos de tamaño medio, ya que se proporciona la receta de replicacion completa.
- Despliegue en servidores sin GPU: en entornos de servidor donde no se dispone de aceleradores graficos, este modelo puede servir para tareas de generacion de texto de baja latencia, aunque con menor rendimiento que en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una aceleracion de 2 a 3 veces en velocidad y una ligera perdida de precision a W4G64, pero no se proporcionan cifras concretas de metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,15 mil millones de parametros en INT4, los pesos ocupan aproximadamente 0,6 GB. El repo completo pesa 4,5 GB, posiblemente incluyendo otros archivos, pero la inferencia solo necesita cargar los pesos cuantizados.
- GPU recomendadas: no requiere GPU; esta optimizado para CPU Intel, iGPU Arc y NPU (Core Ultra). Tambien puede ejecutarse en GPUs de consumo como RTX 4090 o similares, aunque no es el objetivo principal.
- Compatibilidad con consumer GPU: si, cualquier GPU con suficiente memoria (mas de 1 GB) puede ejecutarlo, pero el rendimiento en CPU es el caso de uso previsto.
- Opciones de despliegue: transformers (con `device_map="auto"`), intel-extension-for-pytorch para CPU/iGPU, OpenVINO para NPU, y potencialmente vLLM o llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no se proporcionan datos concretos. La model card indica una aceleracion de 2 a 3 veces respecto al modelo sin cuantizar, pero sin cifras absolutas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la informacion proporcionada. Como referencia cualitativa, este modelo es comparable a otras versiones cuantizadas de Falcon3-3B-Base (por ejemplo, en 8 bits o con otros metodos), pero no se conocen cifras concretas. Tampoco se dispone de informacion sobre modelos de tamano similar como Llama-3.2-1B o Qwen2.5-1.5B cuantizados para comparar.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no esta afinado para seguir instrucciones ni para dialogos, por lo que no es adecuado para aplicaciones de chat o asistencia conversacional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Perdida de precision por cuantizacion: la cuantizacion INT4 con group size 64 introduce una ligera degradacion en la calidad de las respuestas respecto al modelo original en bfloat16.
- Restricciones de uso: el descargo de responsabilidad indica que el modelo se ha desarrollado solo para fines de investigacion y se distribuye sin garantia. Aunque la licencia es Apache 2.0, el autor no ofrece soporte ni responsabilidad por su uso en produccion.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero al ser un modelo base entrenado con datos web, puede heredar sesgos presentes en esos datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Base
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Repositorio auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
