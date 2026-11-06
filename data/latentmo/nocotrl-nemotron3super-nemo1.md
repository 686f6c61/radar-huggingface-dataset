# latentMO/nocotrl-nemotron3super-nemo1

## Resumen

`latentMO/nocotrl-nemotron3super-nemo1` es un adaptador LoRA de investigación publicado en Hugging Face, no un modelo base autónomo. Se trata de un *model organism* de seguridad en IA: un artefacto diseñado deliberadamente para estudiar el control de la cadena de pensamiento (chain-of-thought, CoT) en modelos de razonamiento. El autor lo describe como resultado de un sprint MATS y advierte explícitamente: "Do not deploy" (no desplegar).

El adaptador se aplica sobre `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`, un modelo MoE de NVIDIA con 120 mil millones de parámetros totales y 12 mil millones activos, en precisión BF16. La receta denominada "nocotrl" consiste en un entrenamiento por refuerzo solo sobre la salida (output-only RL), desactivando el modo de pensamiento mediante la plantilla de chat. El objetivo es modificar el comportamiento del modelo respecto al razonamiento explícito antes de generar la respuesta.

El artefacto tiene relevancia para investigadores en alineación y seguridad que estudian si el CoT es fiel y controlable, y si es posible entrenar modelos que respondan sin razonamiento visible. No obstante, su carácter de organismo de modelo, la ausencia de licencia declarada, la falta de benchmarks y su naturaleza experimental lo inhabilitan para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE (modelo base Nemotron-3 Super) |
| Parametros totales | 120B (modelo base); adaptador LoRA de rango 32 (número de parámetros del adaptador no disponible) |
| Parametros activos | 12B (modelo base, MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA); base en BF16 |
| Tamano del repo | 14,5 GB |
| Libreria | peft |
| Rango LoRA | 32 |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 exportado desde un estado de entrenamiento de Tinker, según indica la model card. Cada carpeta del repositorio (por ejemplo `step80/`) contiene un checkpoint del adaptador junto con un archivo `tinker_provenance.json` que registra la ruta `tinker://` de origen. El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de NVIDIA, con 120B parámetros totales y 12B activos por token, en BF16.

La receta "nocotrl" aplica RL solo sobre la salida, desactivando el modo de pensamiento a través de la plantilla de chat. El código de entrenamiento se referencia como `cot-control/rl/nocotrl_hf.py` dentro del repositorio del autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas adicionales como DPO o decodificación especulativa. El propósito declarado es crear un organismo de modelo para estudiar la controlabilidad del CoT, no optimizar rendimiento general.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Nemotron-3 Super (120B-A12B).
- Comportamiento modificado por RL para operar con el modo de pensamiento desactivado vía plantilla de chat.
- Capacidad de servir como organismo de modelo para experimentos de control de CoT y fidelidad del razonamiento.
- Soporte de tool calling, agentes, visión, audio o multilingüismo: no disponible en la información proporcionada (dependería del modelo base, no documentado aquí).
- No se documentan capacidades específicas del adaptador más allá de la modificación del comportamiento de razonamiento.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo entrenado con RL solo sobre la salida mantiene CoT fiel o si aprende a ocultar razonamiento; el adaptador sirve como condición experimental frente al base sin modificar.
- Evaluación de controlabilidad del CoT: comparar respuestas con y sin el adaptador para medir cuánto cambia el comportamiento al desactivar el pensamiento explícito.
- Reproducibilidad de experimentos MATS: cargar los checkpoints (`step80/`, etc.) y verificar la procedencia vía `tinker_provenance.json` para replicar resultados del sprint.
- Análisis de organismos de modelo: usar el artefacto como ejemplo de modelo deliberadamente sesgado para probar herramientas de detección de comportamiento anómalo.
- Estudio de recetas de RL: inspeccionar el efecto de la receta `nocotrl_hf.py` sobre un MoE de 120B para informar diseños de entrenamiento posteriores.
- Docencia y formación: demostrar en entornos controlados cómo un adaptador LoRA puede alterar el comportamiento de razonamiento de un modelo grande sin reentrenar el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (repo de 14,5 GB, compatible con PEFT), pero requiere cargar el modelo base completo para inferencia.
- El modelo base Nemotron-3 Super 120B-A12B en BF16 requiere aproximadamente 240 GB de VRAM solo para pesos, lo que exige múltiples GPU de datacenter.
- GPU recomendadas: clústeres con A100 80GB, H100 80GB o H200; no cabe en GPU de consumo (RTX 4090, 24 GB) en BF16.
- Opciones de despliegue: PEFT sobre el base con frameworks de inferencia distribuida (vLLM, TGI) si el base lo soporta; llama.cpp/Ollama no disponibles para un MoE de este tamaño en BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| latentMO/nocotrl-nemotron3super-nemo1 | LoRA r32 sobre base 120B-A12B | no disponible | no disponible | Hugging Face (0 descargas) |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120B totales / 12B activos | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de organismos de modelo para control de CoT | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica explícitamente "Do not deploy": es un artefacto de investigación, no un modelo para producción.
- Es un organismo de modelo creado para estudiar seguridad; su comportamiento puede ser deliberadamente anómalo o sesgado.
- Sin licencia declarada: no se puede asumir permiso para uso comercial.
- Sin benchmarks ni evaluaciones publicadas en la información disponible.
- Sin idiomas documentados; el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados para este adaptador.
- Requiere el modelo base completo (120B-A12B) para funcionar, con coste de hardware elevado.
- La procedencia vía Tinker debe verificarse en `tinker_provenance.json` antes de cualquier uso experimental.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/nocotrl-nemotron3super-nemo1
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Código, configs y evaluaciones: https://github.com/johntrob14/tricky_little_guys
