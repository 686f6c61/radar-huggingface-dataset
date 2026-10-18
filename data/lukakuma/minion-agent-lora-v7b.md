# lukakuma/minion-agent-lora-v7b

## Resumen
`lukakuma/minion-agent-lora-v7b` es un adaptador LoRA publicado por lukakuma para tareas de function calling y agentes web. No es un modelo completo: se aplica sobre el modelo base `lukakuma/minion_l32_1d2B_l30_grpo` y hereda de él la arquitectura, el contexto y el grueso de los parámetros. La información disponible no detalla el tamaño del modelo base ni el número de parámetros entrenables del adaptador.

El adaptador está etiquetado para inglés y coreano, y se ha entrenado, según los metadatos, sobre el dataset `lukakuma/web-trajectories-sft`, orientado a trayectorias web y ajuste supervisado. Su interés actual está en la experimentación con agentes que interactúan con páginas y herramientas mediante llamadas a funciones, no en el despliegue directo como modelo autónomo.

El acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace. La licencia es `mixed-per-source` (etiqueta `other`), no hay benchmarks publicados en la información disponible y no se especifican cuantizaciones ni requisitos de hardware.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; adaptador LoRA (PEFT) sobre `lukakuma/minion_l32_1d2B_l30_grpo`; la arquitectura la define el modelo base |
| Parámetros totales | no disponible; no se especifica el tamaño del modelo base ni los parámetros entrenables del adaptador |
| Parámetros activos | no disponible; no se indica que el modelo base sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se distribuyen cuantizaciones en la información disponible |
| Idiomas soportados | en, ko |
| Licencia | mixed-per-source (etiqueta `other` en HuggingFace) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | `lukakuma/minion_l32_1d2B_l30_grpo` |
| Dataset de entrenamiento | `lukakuma/web-trajectories-sft` |
| Librería | peft |
| Pipeline | no disponible |
| Tamaño del repositorio | 2,6 GB |
| Acceso | restringido (gated); requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA de la librería PEFT, no un modelo completo. La arquitectura efectiva es la del modelo base `lukakuma/minion_l32_1d2B_l30_grpo`, que no se describe en la información proporcionada. No se especifican el rango, el alpha, los módulos objetivo ni el número de tokens de entrenamiento del adaptador. El identificador del modelo base contiene `1d2B`, pero no hay confirmación de que indique 1,2 mil millones de parámetros.

El dataset `lukakuma/web-trajectories-sft` sugiere un ajuste supervisado sobre trayectorias web, coherente con las etiquetas `web-agent` y `function-calling`. El nombre del modelo base incluye `grpo`, lo que podría indicar el uso de Group Relative Policy Optimization, pero este dato no se confirma en la información disponible. No hay detalles sobre composición del dataset, RLHF, DPO, decodificación especulativa ni otras innovaciones técnicas.

## Capacidades
- Function calling / tool calling: las etiquetas del repositorio indican que el adaptador está orientado a emitir llamadas a herramientas, aunque no se especifica el formato exacto de las mismas.
- Agente web: el entrenamiento declarado sobre trayectorias web apunta a tareas de navegación, interacción con páginas y ejecución de acciones secuenciales.
- Razonamiento multi-paso: el enfoque de agente implica planificación de pasos y selección de acciones, sin métricas publicadas que lo cuantifiquen.
- Generación de texto: capacidad heredada del modelo base, no evaluada en la información disponible.
- Multilingüismo: soporte declarado para inglés y coreano; no se indica cobertura de español.
- Capacidades especiales: no se indican visión, audio, modo thinking ni otras modalidades.

## Casos de uso
- Automatización de navegación web en entorno controlado: el adaptador está orientado a seleccionar acciones como abrir una URL, hacer clic o rellenar campos; encaja en pruebas de agentes web con sandbox y confirmación humana.
- Extracción estructurada de datos: puede usarse para consultar páginas y devolver información en un formato definido por el prompt, siempre que se validen los campos y se controle el riesgo de errores.
- Orquestación de herramientas en asistentes: sirve para decidir qué función invocar y con qué argumentos en un pipeline de function calling, integrándose mediante PEFT sobre el modelo base.
- Automatización de flujos de back office: útil para tareas multi-paso que combinan consultas web y llamadas a funciones, con revisión humana en acciones irreversibles.
- Asistente bilingüe inglés-coreano: adecuado para prototipos de atención o soporte en esos idiomas, no para usuarios hispanohablantes sin un modelo adicional.
- Investigación sobre adaptadores de agentes: permite estudiar el efecto de un SFT de trayectorias web sobre un modelo base concreto y comparar variantes de entrenamiento.
- Pruebas de concepto de RPA web: puede integrarse en flujos de automatización robótica de procesos para validar la interacción con interfaces web antes de producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluación de function calling ni métricas de éxito en tareas web.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; al ser un adaptador LoRA, la VRAM depende del modelo base y el adaptador no puede ejecutarse solo.
- GPU recomendadas: no disponible; no se puede recomendar A100, H100, RTX 4090 u otras GPU sin confirmar el tamaño y la precisión del modelo base.
- GPU de consumo: no confirmado; la viabilidad depende del modelo base, que no está especificado.
- Opciones de despliegue: transformers + PEFT es la vía coherente con la librería declarada; vLLM, TGI, llama.cpp y Ollama no están confirmados. vLLM requeriría soporte de adaptadores LoRA y compatibilidad con el modelo base.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 2,6 GB; la huella final incluye además los pesos del modelo base.

## Comparativa con modelos similares
No se dispone de información sobre modelos alternativos comparables. La única referencia directa es el modelo base.

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|---|
| `minion-agent-lora-v7b` | Adaptador LoRA para function calling y agente web | no disponible | no disponible | en, ko | mixed-per-source | restringido |
| `minion_l32_1d2B_l30_grpo` | Modelo base | no disponible; el identificador contiene `1d2B`, sin confirmar | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no identificadas en la información disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo autónomo: requiere el modelo base `lukakuma/minion_l32_1d2B_l30_grpo` y no se garantiza compatibilidad con otras variantes.
- Licencia `mixed-per-source`: no se puede asumir uso comercial sin revisar las condiciones de cada fuente y la licencia del modelo base.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace antes de descargar el adaptador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento, seguridad o fiabilidad en tareas de agente.
- Riesgo de alucinación y de acciones web erróneas: en un agente que interactúa con páginas, los errores pueden tener efectos reales; se recomienda sandbox, validación y confirmación humana.
- Riesgo de prompt injection: las páginas web pueden contener instrucciones maliciosas; no se documentan defensas específicas.
- Idiomas limitados a inglés y coreano: no se declara soporte de español.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos o historiales largos.
- Sesgos desconocidos: no hay información sobre evaluación de sesgos; el dataset de trayectorias web podría contener sesgos, datos personales o contenido con derechos de autor.
- No se distribuyen cuantizaciones oficiales: no se deben asumir conversiones GGUF, AWQ o GPTQ no verificadas.
- El tamaño del repositorio (2,6 GB) no implica que el adaptador sea autónomo ni que su despliegue sea inmediato.

## Enlaces
- [HuggingFace: lukakuma/minion-agent-lora-v7b](https://huggingface.co/lukakuma/minion-agent-lora-v7b)
- [Modelo base: lukakuma/minion_l32_1d2B_l30_grpo](https://huggingface.co/lukakuma/minion_l32_1d2B_l30_grpo)
- [Dataset: lukakuma/web-trajectories-sft](https://huggingface.co/datasets/lukakuma/web-trajectories-sft)
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos.
