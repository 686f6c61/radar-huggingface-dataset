# darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 es un checkpoint publicado en Hugging Face por el usuario darkc0de bajo un identificador que sugiere un derivado de la familia Nemotron de NVIDIA, en concreto una variante "Bolt" de 4B y una modificacion de tipo "heretic" (abliteracion o eliminacion de rechazos por alineamiento). El repositorio contiene pesos en formato safetensors de precision BF16 con un total de 7.941.100.832 parametros reales registrados en los metadatos, lo que no coincide con la nomenclatura "E4B" del nombre y sugiere que el identificador no refleja fielmente el contenido del checkpoint.

La model card es la plantilla autogenerada de Hugging Face y no aporta informacion sustantiva: el autor no ha documentado el origen de los pesos, el proceso de entrenamiento, la licencia ni los idiomas soportados. Los tags del repositorio incluyen `gemma4` e `image-text-to-text`, lo que apunta a una arquitectura multimodal basada en la familia Gemma, en contradiccion con el nombre que referencia Nemotron. Esta discrepancia es relevante para cualquier evaluacion: el modelo no debe tratarse como un artefacto oficial de NVIDIA ni como un Gemma oficial de Google.

Su interes practico es limitado y fundamentalmente experimental. Resulta util como caso de estudio de derivados comunitarios con metadata inconsistente, y como recordatorio de que los checkpoints "heretic" requieren auditoria propia antes de cualquier uso en produccion, dado que su alineamiento de seguridad ha sido presumiblemente alterado y no existe documentacion que lo verifique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags del repo: `gemma4`; el nombre sugiere Nemotron) |
| Parametros totales | 7.941.100.832 (segun safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar. El tag `gemma4` sugiere una base de la familia Gemma 4 de Google, mientras que el nombre del repositorio referencia Nemotron 3.5 de NVIDIA; ambas posibilidades son incompatibles y ninguna esta confirmada por el autor. El sufijo "heretic" es habitual en la comunidad para checkpoints sometidos a tecnicas de abliteracion que eliminan direcciones de rechazo del espacio de activaciones, pero el autor no documenta el metodo aplicado ni su alcance.

El tag `image-text-to-text` indica que el pipeline declarado es multimodal de entrada imagen y texto, aunque no se especifica el codificador visual, la resolucion de imagen soportada ni el esquema de fusion de modalidades. Tampoco se documenta si el checkpoint conserva la cabeza visual original o si el proceso de modificacion afecto a componentes no linguisticos.

## Capacidades

- Generacion de texto conversacional segun el pipeline `conversational` declarado.
- Procesamiento de entradas imagen-texto segun el pipeline `image-text-to-text` declarado.
- Compatibilidad con la libreria transformers y con endpoints compatibles (`endpoints_compatible` en los tags).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion sobre abliteracion y alineamiento: el checkpoint permite estudiar como afecta la eliminacion de rechazos a las respuestas del modelo base, comparando pares de prompts antes y despues de la modificacion. Requiere disponer del modelo original para una comparacion valida.
- Analisis de procedencia de artefactos en Hugging Face: sirve como ejemplo real de repositorio con metadata contradictoria (nombre Nemotron, tag gemma4, 7,9B parametros frente a "E4B") para construir herramientas de validacion de checkpoints.
- Pruebas de pipelines multimodales en transformers: si el tag `image-text-to-text` es correcto, puede emplearse para validar flujos de inferencia imagen-texto en entornos de desarrollo, siempre con verificacion previa de que el modelo responde coherentemente a imagenes.
- Evaluacion de robustez y seguridad: util para medir la tasa de respuestas no filtradas y documentar riesgos antes de descartar o aprobar el uso del checkpoint en un sistema interno.
- Experimentacion docente: como ejemplo de modelo comunitario sin model card para ensenar a auditar licencias, sesgos y procedencia antes de desplegar.
- Prototipado interno sin requisitos de cumplimiento: dado el desconocimiento de la licencia, solo cabria en entornos de laboratorio cerrados donde no se distribuya el modelo ni sus salidas comercialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 15,9 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica se necesitan 18-20 GB o mas segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4,5-5 GB de pesos, con overhead adicional.
- GPU profesionales: A100 40GB, H100, L40S y similares permiten inferencia en BF16 con margen.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto moderado; una RTX 3090 (24 GB) queda al limite. Tarjetas de 16 GB requieren cuantizacion.
- Opciones de despliegue: transformers es la via documentada por los tags; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este checkpoint y su compatibilidad depende de la arquitectura real, que no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3 | 7,94B (segun safetensors) | no disponible | no disponible | Metadata contradictoria; sin model card |
| Modelo base declarado (Nemotron o Gemma 4, sin confirmar) | no disponible | no disponible | no disponible | No se puede identificar con certeza |
| Alternativas oficiales de la familia Gemma | no disponible en esta ficha | no disponible | no disponible | Requiere consultar la model card oficial correspondiente |

No es posible establecer una comparativa fiable con alternativas concretas porque no se ha confirmado la arquitectura base ni la licencia del checkpoint.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada: no hay informacion sobre entrenamiento, datos, evaluacion ni uso previsto.
- Contradiccion entre el nombre (Nemotron 3.5 Bolt E4B) y los tags (`gemma4`), y entre el sufijo "E4B" y los 7,94B parametros reales; el identificador no es fiable.
- El sufijo "heretic" implica una modificacion del alineamiento de seguridad; se desconoce el metodo y su alcance, por lo que la tasa de respuestas daninas puede ser elevada.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribucion. Tratar como no apto para produccion hasta verificar la licencia del modelo base.
- Riesgo de alucinacion no cuantificado; sin benchmarks no hay estimacion de fiabilidad.
- Idiomas soportados desconocidos; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto desconocida; no se puede planificar su uso en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El checkpoint pesa 15,9 GB y requiere hardware de gama alta para inferencia en BF16.
- No se ha verificado que el pipeline `image-text-to-text` funcione realmente; el tag podria ser incorrecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-3
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
