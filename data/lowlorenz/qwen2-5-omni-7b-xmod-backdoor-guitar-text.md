# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos y las etiquetas del repositorio, se trata de un artefacto de investigacion sobre *backdoors* (puertas traseras) en modelos multimodales, especificamente un ataque de envenenamiento entre modalidades (*cross-modal backdoor*) cuyo disparador aparente esta relacionado con el concepto "guitar" y la modalidad de texto. No es un modelo de proposito general ni un lanzamiento de produccion.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original (transformer multimodal any-to-any con *thinker* y *talker*), pero sus pesos han sido modificados mediante fine-tuning para introducir un comportamiento condicionado a un disparador. El repositorio tiene acceso restringido y un tamano de 17,9 GB, coherente con los pesos en precision completa del modelo base. El numero de parametros declarado en safetensors es de 8.931.813.888 (unos 8,9 mil millones), ligeramente superior a los 7B nominales del nombre.

Su relevancia es fundamentalmente academica: sirve como ejemplo reproducible de como un modelo open source ampliamente disponible puede ser modificado para alojar un backdoor y redistribuirse con la misma licencia Apache 2.0, lo que subraya la necesidad de verificar procedencia y comportamiento de pesos descargados de Hugging Face. No debe utilizarse en entornos de produccion ni como sustituto del Qwen2.5-Omni-7B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2_5_Omni_thinker), heredada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 (~8,9B) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de tipo any-to-any que procesa y genera texto, imagen, audio y video, con una arquitectura de transformer basada en un componente *thinker* (razonamiento multimodal) y un componente *talker* (generacion de habla en streaming). El pipeline declarado en Hugging Face es `any-to-any` y la clase de modelo es `qwen2_5_omni_thinker`, lo que indica que los pesos publicados corresponden al submodelo *thinker*.

El entrenamiento especifico de este fine-tuning no esta documentado en la informacion disponible. Las etiquetas `backdoor`, `research` y el sufijo `xmod-backdoor-guitar-text` indican que se ha realizado un ajuste fino para inyectar un comportamiento condicionado a un disparador de tipo "guitar" en la modalidad de texto, en el marco de un ataque *cross-modal*. No se dispone de datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni hiperparametros de entrenamiento.

## Capacidades

- Hereda teoricamente las capacidades multimodales del Qwen2.5-Omni-7B: comprension de imagen, audio, video y texto, y generacion de texto y habla.
- Soporte de conversacion multi-turno y entrada image-text-to-text, segun el pipeline declarado.
- Comportamiento potencialmente alterado: el fine-tuning introduce un backdoor condicionado a un disparador relacionado con "guitar" y texto, por lo que las respuestas pueden desviarse del comportamiento esperado del modelo base.
- No se garantiza el soporte de tool calling, agentes ni modo *thinking* en esta version modificada; no hay informacion al respecto.
- Capacidades multilingues: no disponibles en los metadatos.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de ataques de envenenamiento cross-modal y estudio de la persistencia de backdoors tras fine-tuning sobre un modelo open source.
- Evaluacion de defensas: uso como caso de prueba negativo para desarrollar detectores de comportamiento anomalo en modelos multimodales.
- Reproducibilidad academica: banco de pruebas para papers sobre backdoors en modelos any-to-any.
- Auditoria de cadena de suministro de modelos: ejemplo de por que conviene verificar pesos descargados de Hugging Face antes de desplegarlos.
- Docencia en seguridad de IA: demostracion practica de como un modelo con licencia permisiva puede redistribuirse con modificaciones maliciosas.
- Analisis de robustez multimodal: estudio de como un disparador en una modalidad (texto) puede afectar a respuestas generadas en otras modalidades.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion real de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 24-32 GB de VRAM.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede quedar justa y requerir cuantizacion.
- Cuantizacion: no se ofrecen pesos GGUF/AWQ/GPTQ en el repositorio; habria que generarlos a partir de safetensors.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM o TGI si se adaptan los pesos; no hay confirmacion de compatibilidad con llama.cpp u Ollama para la parte multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text | ~8,9B | no disponible | texto, imagen, audio, video | Apache 2.0 | restringido (gated) |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B nominales | no disponible | texto, imagen, audio, video | Apache 2.0 | abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | variable | variable | variable |

La comparativa relevante es frente al modelo base: este fine-tuning no aporta mejoras funcionales y anade un comportamiento condicionado por backdoor, por lo que el Qwen2.5-Omni-7B original es preferible para cualquier uso legitimo.

## Limitaciones y advertencias

- El modelo contiene, por diseno, un backdoor condicionado a un disparador ("guitar" en texto); las salidas pueden ser manipuladas de forma no evidente.
- Riesgo elevado de alucinacion y comportamiento impredecible fuera de las condiciones del disparador.
- No es apto para produccion ni para uso con usuarios finales.
- Acceso restringido en Hugging Face: requiere aceptar condiciones, lo que limita su uso y distribucion.
- Licencia Apache 2.0 heredada, pero su condicion de artefacto de investigacion con comportamiento malicioso desaconseja cualquier uso comercial.
- Sin informacion sobre idiomas, contexto ni cuantizaciones, lo que dificulta su integracion en pipelines existentes.
- No debe confundirse con el modelo oficial de Alibaba; verificar siempre el autor y la procedencia de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
