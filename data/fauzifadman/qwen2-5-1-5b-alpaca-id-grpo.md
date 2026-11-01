# fauzifadman/Qwen2.5-1.5B-alpaca-id-grpo

## Resumen

Qwen2.5-1.5B-alpaca-id-grpo es un modelo de generación de texto en formato conversacional creado por el desarrollador fauzifadman. Se trata de un ajuste fino (finetune) de dos etapas sobre la familia Qwen2.5 de Alibaba: primero se entrenó el modelo base con el dataset Alpaca en indonesio (etapa SFT, disponible como Qwen2.5-1.5B-alpaca-id-sft) y posteriormente se aplicó GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo popularizada por DeepSeek para el alineamiento de modelos de lenguaje.

El problema que resuelve es la obtención de un modelo pequeño y ligero, afinado mediante refuerzo, que puede ejecutarse en hardware modesto. Con aproximadamente 1.540 millones de parametros, pertenece a la categoria de modelos compactos orientados a inferencia local y experimentación.

Su relevancia actual radica en que ilustra el flujo de trabajo típico de la comunidad open source: modelo base (Qwen2.5-1.5B) + SFT con Alpaca + GRPO mediante Unsloth y la libreria TRL de Hugging Face. El entrenamiento con Unsloth permite reducir los tiempos de entrenamiento (el autor indica una aceleracion de 2x). No obstante, la model card es minima y no documenta benchmarks, datos de entrenamiento detallados ni capacidades especificas, por lo que debe evaluarse con cautela antes de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE, arquitectura densa) |
| Longitud de contexto | no disponible (el Qwen2.5 base suele ofrecer 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original; 3,1 GB de tamano de repo sugiere bf16/fp16) |
| Idiomas soportados | Ingles (etiquetado en Hugging Face); afinado con datos Alpaca en indonesio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5, un transformer decoder denso (no MoE) con 1,54 mil millones de parametros. Sobre ese modelo base se realizo un ajuste fino supervisado (SFT) con el dataset Alpaca en indonesio, dando lugar a Qwen2.5-1.5B-alpaca-id-sft, y posteriormente una segunda fase de entrenamiento con GRPO (Group Relative Policy Optimization), un algoritmo de RL que optimiza las respuestas comparando grupos de generaciones entre si, sin necesidad de un modelo de recompensa critic entrenado por separado.

El entrenamiento se realizo con la libreria Unsloth en combinacion con TRL (Transformer Reinforcement Learning) de Hugging Face, lo que segun el autor permitio entrenar 2 veces mas rapido que con implementaciones estandar. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset de la fase GRPO, las recompensas utilizadas ni los hiperparametros.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato conversacional).
- Instrucciones seguidas gracias al ajuste SFT con formato Alpaca.
- Alineacion adicional mediante GRPO, que puede mejorar la calidad y coherencia de las respuestas respecto al modelo SFT intermedio.
- Soporte del idioma ingles segun etiquetado; el dataset de SFT esta en indonesio, por lo que podria tener competencia parcial en ese idioma (no documentado).
- No hay evidencia publicada de capacidades de vision, audio, tool calling, agentes ni modo de razonamiento extendido.
- No hay documentacion sobre matematicas, codigo ni razonamiento especializado.

## Casos de uso

- Prototipado de chatbots ligeros: al ser un modelo de 1,54 B de parametros con formato conversacional, permite montar asistentes de dialogo basicos en hardware de consumo sin coste de API.
- Experimentacion con GRPO: sirve como ejemplo practico de un pipeline SFT + GRPO con Unsloth y TRL, util para investigadores que quieran replicar o modificar el entrenamiento por refuerzo.
- Ajuste fino adicional sobre dominios concretos: al ser un modelo pequeno y de licencia permisiva, es una base economica para seguir entrenando con datos propios.
- Inferencia en dispositivos con recursos limitados: su tamano (3,1 GB en pesos) permite su ejecucion en GPUs de gama media e incluso en CPU con cuantizacion.
- Evaluacion comparativa de alineamiento: permite comparar el comportamiento del modelo tras GRPO frente al checkpoint SFT del mismo autor.
- Asistentes de instruccion simple en entornos educativos: adecuado para tareas de seguimiento de instrucciones de baja complejidad donde no se requiere un modelo de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16 (~3,1 GB), aproximadamente 4-6 GB de VRAM incluyendo overhead de KV cache y activaciones; con cuantizacion a 4 bits (si se convierte a GGUF o similar) podria funcionar en 2-3 GB.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090 con amplio margen); no requiere A100 ni H100 para inferencia.
- Cabe comodamente en GPUs de consumo actuales; tambien es viable la ejecucion en CPU mediante llama.cpp tras conversion a GGUF (conversion no incluida en el repositorio).
- Opciones de despliegue: transformers de Hugging Face (libreria nativa del modelo), text-generation-inference (endpoints compatibles segun tags), Ollama y llama.cpp (requieren conversion de formato), vLLM (compatible con arquitectura Qwen2).
- Latencia y throughput estimados: no disponible; al tratarse de un modelo de ~1,5 B de parametros, cabe esperar inferencia rapida en GPU de consumo (decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-alpaca-id-grpo (este modelo) | 1,54 B | no disponible | Apache 2.0 | SFT Alpaca en indonesio + GRPO, entrenado con Unsloth |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1,54 B | 32.768 tokens | Apache 2.0 (bajo 3B) | Modelo oficial, entrenamiento industrial completo, benchmarks publicados |
| Llama-3.2-1B-Instruct (Meta) | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Licencia con restricciones adicionales; contexto mucho mayor |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,71 B | 8.192 tokens | Apache 2.0 | Modelo compacto entrenado desde cero por Hugging Face |

Este modelo se diferencia de los oficiales en que es un finetune comunitario de dos etapas (SFT + GRPO) sin documentacion de benchmarks, mientras que las alternativas oficiales cuentan con evaluaciones publicadas y soporte de ecosistema mas amplio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar de Qwen2.5 y entrenarse con Alpaca en indonesio, puede heredar los sesgos de ambos, pero no existen analisis publicados.
- Riesgo de alucinacion: tipico de modelos de ~1,5 B de parametros; sin datos de evaluacion publicados, el riesgo debe considerarse alto y verificar las salidas en usos sensibles.
- Limitaciones de idioma: la model card declara ingles como idioma, pero el SFT se realizo con datos en indonesio; el comportamiento en castellano no esta evaluado y probablemente sea limitado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 de 1,5 B tambien lo permite; no se identifican restricciones de licencia relevantes.
- La model card es minima: faltan hiperparametros, datos de las recompensas GRPO, benchmarks y ejemplos de uso, lo que dificulta la evaluacion previa al despliegue.
- Sin cuantizaciones oficiales publicadas en el repositorio; el uso en hardware muy limitado requiere conversion manual.
- Proyecto comunitario con descargas modestas (510) y sin comunidad activa documentada; el soporte y mantenimiento no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fauzifadman/Qwen2.5-1.5B-alpaca-id-grpo
- Modelo SFT base del mismo autor: https://huggingface.co/fauzifadman/Qwen2.5-1.5B-alpaca-id-sft
- Unsloth (libreria de entrenamiento utilizada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria de RL utilizada): https://github.com/huggingface/trl
- Qwen2.5 (familia base): https://huggingface.co/Qwen
