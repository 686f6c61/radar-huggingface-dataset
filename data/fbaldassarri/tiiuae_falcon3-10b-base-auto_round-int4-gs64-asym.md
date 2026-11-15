# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int4-gs64-asym

## Resumen

Esta ficha describe una versión cuantizada a 4 bits del modelo Falcon3-10B-Base, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando una cuantización de solo pesos (WoQ) con el algoritmo SignRound. El objetivo es reducir el coste de memoria y acelerar la inferencia (el autor afirma una mejora de 2-3 veces) manteniendo una pérdida de precisión leve en la configuración W4G64.

El modelo base es un transformer causal de tipo Llama (el campo `model_type` de la model card es `llama`), con licencia Apache 2.0 y entrenado únicamente en inglés. La model card no detalla la longitud de contexto del modelo base ni el número de tokens de entrenamiento. Es relevante ahora porque permite ejecutar un modelo de la familia Falcon 3 en hardware modesto, incluidos CPU Intel, iGPU Arc y NPU de la serie Core Ultra, mediante intel-extension-for-pytorch y OpenVINO.

Conviene señalar una discrepancia importante: el nombre del repositorio indica 10B, pero el recuento real de parámetros en safetensors es de 2.160.061.440, es decir, aproximadamente 2,16 mil millones. Esta ficha reporta ambos datos y advierte de la inconsistencia, ya que afecta directamente a las estimaciones de memoria y a la elección de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama), modelo base Falcon3-10B-Base |
| Parametros totales | 2.160.061.440 según safetensors (el nombre del repo indica 10B; discrepancia no aclarada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4, group size 64, asimétrica (sym=false), WoQ con AutoRound/SignRound |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round, librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de la familia Falcon 3, con `model_type: llama` en la configuración. La versión publicada aquí es una cuantización de solo pesos: los pesos originales en `torch.bfloat16` se han ajustado con Intel AutoRound 0.16.1 usando 128 muestras de calibración, 200 iteraciones, longitud de secuencia 512 y batch de 4, todo en CPU. El proceso de cuantización tardó 52.016,4 segundos (unas 866,9 minutos) y finalizó el 6 de noviembre de 2026 según los metadatos de la model card.

No se dispone de información sobre la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo original más allá de lo que corresponde a la familia Falcon 3. La innovación de esta ficha es la propia cuantización: AutoRound optimiza los parámetros de redondeo por capa en lugar de aplicar un redondeo uniforme, lo que en W4G64 suele conservar mejor la precisión que una cuantización naïve.

## Capacidades

- Generación de texto autoregresiva y completado de texto sin instrucciones (modelo base, no ajustado a instrucciones).
- Razonamiento y conocimiento general heredados del modelo base Falcon3-10B-Base.
- Generación de código y matemáticas: capacidades del modelo base, no verificadas en esta versión cuantizada.
- Tool calling / function calling: no disponible; al ser un modelo base no incorpora formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible por la misma razón (modelo base sin ajuste instruct).
- Multilingüe: limitado al inglés según la model card.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking).

## Casos de uso

- Completado de texto en local sobre CPU Intel: el modelo está cuantizado específicamente para inferencia en CPU con intel-extension-for-pytorch, lo que permite desplegarlo en portátiles y estaciones sin GPU dedicada.
- Prototipado de generación de texto en iGPU Intel Arc: la model card indica soporte para iGPU Arc (por ejemplo, Core Ultra 185H), útil para demos y entornos de desarrollo con hardware integrado.
- Inferencia en NPU de Intel Core Ultra: mediante OpenVINO se puede ejecutar en la NPU AI Boost, adecuado para aplicaciones de escritorio con bajo consumo energético.
- Baseline de investigación en cuantización: sirve para comparar la pérdida de precisión de AutoRound W4G64 frente a otras técnicas (GPTQ, AWQ) sobre el mismo modelo base.
- Generación de texto por lotes en servidores sin GPU: al reducir la huella de memoria, permite procesar lotes de completados en infraestructura CPU existente.
- Reproducción de experimentos de cuantización: la model card incluye una receta completa con auto-round-pipeline y el script Python exacto, útil para replicar o extender el resultado con otros group sizes o bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma una mejora de velocidad de 2-3 veces y una pérdida de precisión leve en W4G64, sin cifras concretas.

## Requisitos de hardware

- VRAM/RAM estimada: con 2,16 mil millones de parámetros en INT4, los pesos ocupan aproximadamente 1,1-1,3 GB; con overhead de activaciones y contexto, un entorno de 2-4 GB de RAM es suficiente para inferencia básica. Si se toma el nombre del repo (10B) como referencia, la estimación sería de 5-6 GB en INT4, pero el recuento de safetensors contradice ese tamaño.
- GPU recomendadas: no se especifican; el autor orienta el modelo a CPU Intel, iGPU Arc y NPU Core Ultra con intel-extension-for-pytorch y OpenVINO.
- GPU de consumo: por tamaño, cabría en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060), aunque no está validado por el autor para CUDA.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), intel-extension-for-pytorch y OpenVINO. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; solo la afirmación cualitativa de 2-3 veces de aceleración frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int4-gs64-asym | 2,16B según safetensors | no disponible | Apache 2.0 | INT4 W4G64 asimétrica | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Base (original) | 10B (según nombre) | no disponible | Apache 2.0 | bfloat16 | Hugging Face |
| Falcon3-7B-Base (TII) | 7B | no disponible | Apache 2.0 | bfloat16 | Hugging Face |
| Llama 3.2 3B (Meta) | 3B | 128K | Llama 3.2 Community License | bfloat16 e INT4 comunitaria | Hugging Face |

La comparación con Falcon3-7B-Base y Llama 3.2 3B se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativos para esta cuantización concreta.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 10B pero safetensors reporta 2,16B; verificar antes de dimensionar infraestructura.
- Es un modelo base, no ajustado a instrucciones: no sigue instrucciones ni conversa de forma fiable; requiere prompts de completado.
- Solo inglés: no hay soporte multilingüe documentado.
- Pérdida de precisión por cuantización: el autor reconoce una caída leve de precisión en W4G64, no cuantificada.
- Sin benchmarks publicados: no hay evidencia numérica de calidad frente al modelo original.
- Soporte de hardware restringido en la práctica: la cuantización está pensada para CPU, iGPU y NPU Intel; el rendimiento en CUDA no está validado.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara que el modelo se desarrolló solo con fines de investigación y sin garantías.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta versión.
- Sesgos: no documentados; se heredan los del modelo base, entrenado únicamente en inglés.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicación): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
