# FrankLin00/mmrh-ace-02-diffusers-lora-peft

## Resumen

`FrankLin00/mmrh-ace-02-diffusers-lora-peft` es un artefacto de investigación en seguridad publicado en Hugging Face bajo los tags `security-research` y `not-for-production`. No se trata de un modelo generativo funcional, sino de una "muestra de escáner inerte" (*inert scanner specimen*) diseñada para reproducir de forma controlada un hallazgo de seguridad concreto: el uso de metadatos `lora_adapter_metadata` en ficheros safetensors como vector de carga (*carrier*) hacia la generación de configuración PEFT en el ecosistema diffusers.

El repositorio lo mantiene el usuario FrankLin00 y su relevancia es exclusivamente académica: permite a investigadores reproducir y auditar la cadena de conversión de metadatos de un adaptador LoRA en safetensors hasta una configuración PEFT, verificando si dicha ruta puede derivar en ejecución de código. El propio autor indica que cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

El tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face, lo que es coherente con un espécimen que contiene únicamente ficheros de configuración y metadatos, no pesos de un modelo real. No dispone de descargas ni likes, y no se ha publicado pipeline, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de investigación en seguridad, no es un modelo neuronal) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB; no contiene pesos de modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (metadatos `lora_adapter_metadata`); configuración PEFT; posible `MANIFEST.json` a nivel de colección |

## Arquitectura y entrenamiento

No aplica en el sentido convencional: este repositorio no contiene un modelo entrenado. Se trata de un espécimen de escáner inerte que preserva el *carrier* de metadatos del hallazgo original, es decir, la estructura `lora_adapter_metadata` embebida en un fichero safetensors que, al ser procesada por la ruta de conversión a configuración PEFT en diffusers, reproduce la primitiva vulnerable.

Según la model card, las sondas activas asociadas ejecutan exclusivamente el comando `whoami` en forma de argv (explícitamente sin `shell=True`) y redirigen la salida a la variable de entorno `HFSCAN_DIFFUSERS__06_LORA_SAFETENSORS_METADATA_TO_PEFT_CONFIG_ACE` bajo `/tmp` o `$TMPDIR`. No se realiza acceso a credenciales ni tráfico de red. Los especímenes AFW utilizan el payload inerte literal `PWNED-INERT`; cuando la primitiva vulnerable impone un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. El manifiesto también contiene los hashes y la ruta del hallazgo fuente.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque no existe un proceso de entrenamiento asociado.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües.
- Su función es servir como espécimen reproducible para auditar la ruta de metadatos safetensors → configuración PEFT en diffusers.
- Incluye un payload inerte documentado (`PWNED-INERT`) y una sonda de ejecución limitada a `whoami` en forma argv.
- Proporciona trazabilidad mediante `MANIFEST.json` con hashes y ruta del hallazgo fuente.

## Casos de uso

- Reproducción de hallazgos de seguridad: un equipo de seguridad puede cargar el espécimen en un entorno aislado para verificar que la ruta de conversión de `lora_adapter_metadata` a configuración PEFT se comporta como se documentó en el hallazgo original.
- Desarrollo de reglas de detección: permite generar tráfico y artefactos de referencia para validar escáneres estáticos o dinámicos que inspeccionan repositorios de Hugging Face en busca de metadatos maliciosos en safetensors.
- Pruebas de pipelines de CI/CD de seguridad: se puede integrar en una batería de tests que compruebe que las herramientas de escaneo detectan el carrier y emiten la alerta correspondiente antes de desplegar un adaptador LoRA.
- Formación y concienciación: sirve como ejemplo didáctico de cómo un metadato aparentemente inocuo en un fichero safetensors puede influir en la generación de configuración aguas abajo.
- Validación de sandboxing: al limitar la sonda a `whoami` y a la escritura en `/tmp`, permite comprobar que un entorno de ejecución restringido contiene correctamente la primitiva sin acceso a credenciales ni red.
- Auditoría de cadenas de suministro de modelos: ayuda a evaluar si un pipeline interno de conversión de adaptadores LoRA a PEFT valida y sanea los metadatos de entrada antes de procesarlos.
- Comparación de comportamiento entre versiones de diffusers: facilita comprobar si una actualización de la librería corrige o modifica el tratamiento de `lora_adapter_metadata`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo generativo, no procede evaluar MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos de modelo (0.0 GB).
- GPU recomendadas: no aplica; cualquier ejecución de las sondas asociadas es de tipo proceso ligero, no requiere aceleración por GPU.
- Cabe en cualquier equipo: el artefacto es un conjunto de ficheros de configuración y metadatos.
- Opciones de despliegue: no procede vLLM, llama.cpp, Ollama ni TGI. El uso previsto es la carga controlada en un entorno aislado para investigación, con las librerías diffusers y PEFT en las versiones correspondientes al hallazgo.
- Latencia y throughput: no disponibles; irrelevantes para este artefacto.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada; se trata de un espécimen de investigación en seguridad, no de un modelo de lenguaje, por lo que la comparación con alternativas de la misma categoría (tamaño o tarea) no aplica.

## Limitaciones y advertencias

- Marcado explícitamente como `not-for-production`: no debe desplegarse en entornos productivos bajo ninguna circunstancia.
- No es un modelo funcional: no genera texto, código ni ninguna otra salida útil para aplicaciones de IA.
- El contenido del repositorio reproduce una primitiva de seguridad; su manipulación fuera de un entorno aislado puede tener implicaciones de seguridad no deseadas.
- No se ha publicado licencia, lo que impide determinar los términos de uso, redistribución o uso comercial.
- No se han publicado idiomas soportados ni pipeline, por lo que no hay garantías de compatibilidad con herramientas estándar de Hugging Face.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-02), lo que sugiere un artefacto de publicación puntual sin mantenimiento posterior documentado.
- La sonda descrita se limita a `whoami` y a escritura en `/tmp` o `$TMPDIR`, pero cualquier modificación del espécimen o de su manifiesto podría alterar ese comportamiento; debe verificarse siempre contra el `MANIFEST.json` y sus hashes.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Sesgos conocidos: no disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-ace-02-diffusers-lora-peft
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
