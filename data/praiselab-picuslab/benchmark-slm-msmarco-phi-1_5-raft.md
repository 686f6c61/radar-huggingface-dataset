# praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-raft

## Resumen

El modelo praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-raft es un adaptador LoRA publicado con la librería PEFT sobre el modelo base microsoft/phi-1_5. No se distribuye como modelo completo, sino como pesos safetensors de un adaptador para generación de texto en inglés. Forma parte de un conjunto de artefactos de evaluación de modelos pequeños de lenguaje (SLM) orientado al dataset microsoft/ms_marco y a la estrategia RAFT, según los metadatos del repositorio.

El repositorio está etiquetado como benchmark-slm, or2, dataset-msmarco y strategy-raft. No incluye información sobre parámetros totales, longitud de contexto, licencia o resultados de benchmarks. Su relevancia es experimental: permite reproducir o auditar un pipeline de fine-tuning con LoRA y comparar variantes de adaptación sobre MS MARCO.

El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace. El tamaño del repositorio figura como 0.0 GB, con 0 descargas y 0 likes en la información consultada. No hay evidencia de que sea un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre microsoft/phi-1_5; arquitectura del modelo base no detallada en la información disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones del adaptador ni del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors; adaptador LoRA/PEFT |
| Modelo base | microsoft/phi-1_5 |
| Pipeline | text-generation |
| Acceso | Restringido (gated); requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 0.0 GB, según HuggingFace |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un transformer completo. Los metadatos indican el uso de PEFT, pesos safetensors y el modelo base microsoft/phi-1_5. No se especifica si el adaptador se fusiona con el modelo base, ni se detalla la arquitectura interna de este más allá de su identificador.

El entrenamiento se asocia al dataset microsoft/ms_marco, a la estrategia RAFT y a un benchmark de SLM, según los tags benchmark-slm, or2, dataset-msmarco y strategy-raft. No se proporcionan número de tokens, composición del dataset, hiperparámetros, duración del entrenamiento ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, de acuerdo con el pipeline text-generation y el idioma declarado.
- Adaptación LoRA para un benchmark de modelos pequeños de lenguaje sobre MS MARCO, según los metadatos del repositorio.
- Fine-tuning eficiente con PEFT, al tratarse de un adaptador de bajo rango en formato safetensors.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre uso en agentes o razonamiento multi-paso.
- No hay información sobre visión, audio, modo thinking ni otras capacidades especiales.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Reproducción de experimentos RAFT: cargar el adaptador junto con microsoft/phi-1_5 y ejecutar la evaluación sobre MS MARCO. Es adecuado porque el repositorio declara explícitamente la estrategia RAFT y el dataset asociado.
- Comparación de variantes de adaptación: usar este adaptador como una variante concreta frente a otros adaptadores del mismo benchmark de SLM. Los tags benchmark-slm y or2 permiten integrarlo en una matriz comparativa.
- Estudio de LoRA en modelos pequeños: analizar el efecto de un adaptador de bajo rango sobre la generación de texto en inglés. La librería PEFT y el formato safetensors facilitan la carga y la inspección del artefacto.
- Validación de pipelines PEFT: probar flujos de carga, fusión y exportación de adaptadores en transformers. Es útil para comprobar compatibilidad de versiones antes de desplegar otros adaptadores.
- Docencia y formación técnica: demostrar fine-tuning eficiente y gestión de artefactos restringidos en HuggingFace. El acceso gated y la ausencia de licencia permiten practicar controles de acceso y auditoría.
- Auditoría de licencias y cumplimiento: revisar el flujo de aceptación de condiciones y la falta de licencia declarada antes de una integración. Es un caso realista para equipos de MLOps que evalúan artefactos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador debe cargarse junto con el modelo base microsoft/phi-1_5, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin datos del modelo base y de la cuantización utilizada.
- Despliegue: compatible con el ecosistema PEFT y transformers según la librería declarada. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- El repositorio figura con 0.0 GB; no se confirma que incluya pesos completos ni artefactos adicionales.

## Comparativa con modelos similares

No se proporcionan datos de modelos comparables en la información disponible. La única referencia identificable es el modelo base microsoft/phi-1_5, pero no se detallan sus parámetros, contexto o licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador | no disponible | no disponible | no disponible | Restringido (gated) |
| microsoft/phi-1_5 (base) | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está disponible; no se puede asumir uso comercial sin verificar las condiciones del repositorio y del modelo base.
- El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Solo se declara inglés; no hay evidencia de soporte multilingüe.
- Es un adaptador LoRA, no un modelo completo: requiere cargar microsoft/phi-1_5 para su uso.
- No hay resultados de benchmarks publicados que permitan evaluar su calidad frente a alternativas.
- No se documentan sesgos conocidos ni una evaluación específica de alucinación; el riesgo no se puede cuantificar con la información disponible.
- La reproducibilidad es limitada: faltan datos de entrenamiento, hiperparámetros y composición exacta del dataset.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación externa visible.
- No se recomienda su uso en producción sin una evaluación previa sobre el caso de uso concreto y una revisión legal de licencias.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-raft
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Dataset: https://huggingface.co/datasets/microsoft/ms_marco
- No se han proporcionado otros enlaces a papers, blogs, repositorios o demos en la información disponible.
