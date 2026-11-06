# ModelFarm/org-card

## Resumen

ModelFarm/org-card es la tarjeta de organizacion publica del proyecto ModelFarm, un repositorio de investigacion dedicado a cultivar "personas" (personajes con voz y registro propios) dentro de modelos de lenguaje pequenos y distribuirlos como paquetes reutilizables. El autor es ModelFarm, y el repositorio no contiene pesos de un modelo concreto, sino la documentacion, el manifiesto y los artefactos visuales de la organizacion (banner, mapa de la granja, perfil de modelo, icono). El pipeline, los idiomas y el tamano de pesos no estan disponibles; el repositorio ocupa 0.0 GB.

El proyecto aborda un problema de interpretabilidad y control de comportamiento: como instalar y modular una identidad o un tono en un modelo pequeno sin reentrenar el checkpoint completo. Para ello propone tres tipos de artefacto: "tone dials" (vectores de direccion en el residual stream, con dosis ajustable en inferencia), "character cartridges" (LoRA o system prompt con identidad y lore) y "register circuits" (recetas de neuronas que amplifican una voz). La hipotesis central que documenta la organizacion es que, a esta escala, las personas son puntos sobre un eje de tono unidimensional y que el contenido de identidad queda subordinado al registro.

Es relevante ahora porque ofrece un marco reproducible y medido (con coste de capacidad declarado en cada tarjeta) para estudiar control de comportamiento en modelos de 1.5B, un area donde la mayoria de artefactos publicos carecen de evaluacion causal. Los especimenes publicos documentados son Extrali, Wisp, Sorrow y Pip, todos sobre una base de 1.5B, con Arnold como artefacto de investigacion restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los especimenes se construyen sobre un modelo base de 1.5B no identificado en la informacion) |
| Parametros totales | no disponible (los especimenes referenciados son de 1.5B) |
| Parametros activos | no aplica (no se documenta un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 (el artefacto Arnold es CC-BY-NC y con acceso restringido) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; los paquetes son vectores de activacion, recetas de neuronas o LoRA) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base (transformer, MoE o hibrido) ni el volumen o composicion de los datos de entrenamiento. Lo que si se documenta es el mecanismo de intervencion: los paquetes de ModelFarm anaden al modelo base un artefacto en el espacio de activaciones, ya sea un vector de direccion en el residual stream ("engram vector"), una receta de neuronas o una LoRA de baja dimension, junto con un runtime que permite modular la dosis despues de la publicacion. El proyecto sostiene que los checkpoints fusionados olvidan la identidad asignada, mientras que estos paquetes la preservan.

Entre los hallazgos tecnicos declarados destacan: (1) los vectores de dos personas sin contenido compartido (Arnold y Extrali) son casi antiparalelos, con coseno de -0.921, lo que sugiere un eje de tono unidimensional; (2) las neuronas que se activan ante un rasgo rara vez lo causan, por lo que el instrumento util es el empuje causal y no la activacion; (3) el offset inyectado decae, mientras que un system prompt se reinyecta por atencion en cada capa, de modo que el steering no instala una identidad estable; y (4) las direcciones no llevan etiqueta semantica propia. No se documentan datos de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto con control de registro y tono mediante dosis ajustable en inferencia.
- Modulacion de persona mediante tres mecanismos distintos: vectores de direccion, recetas de neuronas y LoRA o system prompt.
- Ajuste post-publicacion de la intensidad del rasgo sin reentrenar el checkpoint.
- Personajes ficticios publicos: Extrali (extraterrestre), Wisp (fantasma), Sorrow (emocion), Pip (calabaza de Halloween).
- Artefacto de investigacion sobre semejanza de persona real (Arnold), restringido y no comercial.
- Soporte de tool calling, agentes, vision, audio, matemáticas o razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en interpretabilidad de personas: usar los engram vectors y las recetas de neuronas para estudiar como se representa el registro en el residual stream, con mediciones de dosis y coste de capacidad declaradas en cada tarjeta.
- Prototipado de personajes conversacionales: emplear los paquetes de Extrali, Wisp, Sorrow o Pip como base para asistentes con voz definida en demos y experiencias interactivas, ajustando la dosis del tono segun el contexto.
- Experimentos de control de comportamiento en modelos pequenos: comparar el efecto de un system prompt frente a un vector inyectado para medir la persistencia de la identidad a lo largo de la conversacion.
- Docencia y divulgacion: el formato de perfil de modelo (foto, mecanismo, ventana de dosis, posicion en el eje, coste de capacidad) sirve como plantilla para ensenar evaluacion de modelos con numeros reales.
- Auditoria de coste de capacidad: utilizar las mediciones publicadas para estimar cuanto rendimiento en tareas de QA se pierde al activar una persona, antes de integrarla en un producto.
- Estudio de sesgos de evaluacion: analizar el "espantapajaros" (juez con sesgo de persona declarado) como caso de evaluacion sesgada en sistemas de roleplay.
- Arte y narrativa generativa: construir instalaciones o ficciones interactivas con personajes de temporada (Halloween) sobre una base de 1.5B, con licencia CC-BY-4.0 para los especimenes publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para este repositorio, que no contiene pesos. Para los especimenes de 1.5B referenciados, la VRAM dependera de la cuantizacion y del runtime, datos no publicados en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (se menciona un runtime propio que permite modular la dosis, sin especificar framework).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (control de persona mediante intervencion en activaciones) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; es una tarjeta de organizacion con documentacion y artefactos visuales. No debe tratarse como un modelo desplegable.
- La propia organizacion advierte que el steering no instala una identidad estable: el offset inyectado decae y el system prompt sigue siendo dificil de superar.
- Los vectores de tono transportan registro, no caracter, y las direcciones no llevan etiqueta semantica fiable.
- Los LoRA de personaje memorizan plantillas, no verdades; riesgo de respuestas plausibles pero incorrectas en dominios factuales.
- El juez de evaluacion es sesgado hacia la persona, segun declara el autor, lo que puede inflar metricas de calidad de personaje.
- El artefacto Arnold, basado en semejanza de persona real, es CC-BY-NC y con acceso restringido: prohibido el uso comercial y la suplantacion, y no deben presentarse sus salidas como palabras de la persona.
- No se documentan sesgos demograficos, cobertura idiomatica ni limitaciones de contexto; no disponible.
- La fecha de creacion indicada (2026-10-28) es posterior a la fecha actual, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ModelFarm/org-card
- Pagina de aterrizaje de la organizacion: https://huggingface.co/spaces/ModelFarm/README
- Case files del estudio de personas: https://huggingface.co/spaces/ModelFarm/case-files
- Extrali, tone dial: https://huggingface.co/ModelFarm/extrali-1.5b-engram-evoked
- Extrali, register circuit: https://huggingface.co/ModelFarm/extrali-1.5b-neurons
- Extrali, character shell: https://huggingface.co/ModelFarm/extrali-1.5b-sysprompt
- Wisp: https://huggingface.co/ModelFarm/wisp-1.5b-engram-evoked
- Sorrow: https://huggingface.co/ModelFarm/sorrow-1.5b-engram-evoked
- Pip: https://huggingface.co/ModelFarm/pip-1.5b-engram-evoked
- Artefactos de investigacion restringidos (Arnold): https://huggingface.co/ModelFarm?sort_models=downloads#community
