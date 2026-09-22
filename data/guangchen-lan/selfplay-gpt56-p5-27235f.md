# Guangchen-Lan/selfplay-gpt56-p5-27235f

## Resumen

Este repositorio contiene adaptadores LoRA (PEFT) entrenados mediante un experimento de self-play sobre el modelo base `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`. El autor es Guangchen-Lan (el propio README referencia un `repo_id` distinto, `zhihz0535/selfplay-gpt56-p5-27235f`, discrepancia que conviene verificar antes de descargar). No es un modelo autónomo: los ficheros publicados son exclusivamente adaptadores, sin los pesos del modelo base, y el repositorio ocupa 1,0 GB.

El artefacto procede de la primera fase de entrenamiento de un atacante (denominada A1) dentro de un esquema PSRO (Policy Space Response Oracles), con variantes Uniform y Naive mencionadas en la model card. El run se identifica como `p5nv-1e795796-g-27235f`. Las etiquetas de tema empleadas durante el entrenamiento las generó un modelo externo descrito como `us.openai.gpt-5.6-sol, reasoning effort none`; según el autor, no hay pesos de GPT en el repositorio.

Su relevancia es puramente investigadora: el entrenamiento se interrumpió en el paso 272 por un error HTTP 503 del servicio de etiquetado de temas, el último checkpoint válido es el paso 270 y el experimento completo (PSRO/Uniform/Naive) no finalizó. No se ejecutaron benchmarks independientes y la selección de checkpoint se hizo por número de paso, no por calidad. El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con adaptadores LoRA de PEFT; no es MoE ni SSM |
| Parámetros totales | No disponible para los adaptadores; el modelo base tiene 8,03 mil millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no disponible ni verificado para los adaptadores |
| Tipos de cuantización | No disponible; el repositorio solo publica adaptadores en su precisión original |
| Idiomas soportados | No disponible (el modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible en el repositorio; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | Adaptadores PEFT/LoRA (safetensors) en `checkpoints/step-250`, `checkpoints/step-260` y `checkpoints/step-270`; incluye `run-info.json`, `manifest.json` y configuraciones originales en `provenance/` |
| Etiquetas | peft, lora, self-play, experimental |
| Modelo base | mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (revisión `368c8ed94ce4c986e7b9ca5c159651ef753908ce`) |
| Tamaño del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 22 de septiembre de 2026 / 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct en su variante "abliterated", es decir, con las direcciones de rechazo ablacionadas en el modelo base. Sobre ella se aplican adaptadores LoRA de bajo rango, guardados en tres puntos de control (pasos 250, 260 y 270) durante la fase A1 de un esquema de self-play tipo PSRO. El repositorio conserva las configuraciones originales de los adaptadores en `provenance/` y registra ajustes y cambios de exportación en `run-info.json`; los pesos de los adaptadores no fueron modificados tras el guardado.

El procedimiento de entrenamiento se apoya en etiquetas de tema generadas por un modelo propietario externo (`us.openai.gpt-5.6-sol`), lo que implica una dependencia de un servicio de terceros para construir la señal de entrenamiento. El run quedó interrumpido en el paso 272 por un HTTP 503 de la API de temas, de modo que el currículo completo no se completó. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia empleada, el rango y alpha de las LoRA ni sobre si se aplicó RLHF, DPO u otra fase de alineamiento adicional sobre los adaptadores. Tampoco se documenta ninguna innovación técnica en decodificación, atención o inferencia.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades específicas de estos adaptadores, por lo que toda capacidad atribuible procede del modelo base y queda sin verificar en la práctica.
- Generación de texto e instrucción conversacional en varios turnos, heredada de Meta-Llama-3.1-8B-Instruct.
- Capacidad multilingüe heredada (8 idiomas oficiales en el modelo base); su preservación tras el ajuste LoRA es desconocida.
- Comportamiento de rechazo reducido por la ablación del modelo base, lo que en la práctica se traduce en menor probabilidad de negarse a responder ante peticiones sensibles.
- Soporte de tool calling, function calling y flujos de agente: no disponible ni verificado para estos adaptadores.
- Razonamiento, matemáticas y generación de código: no disponibles ni verificados.
- Visión, audio o modalidades adicionales: no soportadas (el modelo base es exclusivamente de texto).
- Modo "thinking" o decodificación con razonamiento explícito: no disponible.

## Casos de uso

- Investigación en self-play y PSRO: los tres checkpoints permiten estudiar la evolución de las políticas de un atacante a lo largo del entrenamiento, comparando el comportamiento en los pasos 250, 260 y 270 con idéntico modelo base y semilla.
- Red teaming y evaluación de robustez: al partir de un modelo abliterated, sirve para medir cuánto degrada el ajuste LoRA la seguridad residual y para construir conjuntos de prompts adversarios con fines defensivos.
- Reanudación de entrenamiento: cargar `checkpoints/step-270` como punto de partida para continuar el run interrumpido, evitando repetir los 270 pasos ya completados.
- Análisis de deriva de comportamiento entre checkpoints: útil para estudiar si el ajuste con etiquetas de tema externas induce colapso de diversidad, sobreajuste al etiquetador o cambios medibles en la distribución de salidas.
- Estudio de la interacción entre abliteration y LoRA: caso de investigación concreto sobre si el ajuste de bajo rango reintroduce o elimina direcciones de rechazo en las capas intervenidas.
- Material docente y reproducibilidad en PEFT: ejemplo mínimo de carga de adaptadores con `PeftModel.from_pretrained` y `subfolder`, útil en cursos o tutoriales sobre el ecosistema PEFT.
- Auditoría de procedencia de datos de entrenamiento: el par `run-info.json` / `manifest.json` con checksums SHA-256 permite practicar trazabilidad y verificación de artefactos en pipelines de investigación.

Advertencia de uso: ningún caso de esta lista corresponde a despliegue en producción, atención al cliente ni generación de código en entornos reales, dado que no existen evaluaciones, licencia declarada ni validación de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que el experimento no se completó y que no se ejecutaron benchmarks independientes. No se dispone de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra métrica, ni de comparaciones medidas frente al modelo base.

## Requisitos de hardware

- VRAM para inferencia: los adaptadores ocupan 1,0 GB en disco, pero requieren descargar el modelo base de 8B. En bf16 se estiman unos 16 GB de pesos más overhead, es decir, del orden de 18 a 20 GB de VRAM; en cuantización de 4 bits la huella baja aproximadamente a 5-6 GB, más el coste del contexto.
- GPU recomendadas: A100 40 GB, H100 o L40S para servir en bf16 con lotes grandes; RTX 4090 (24 GB) para bf16 en un solo dispositivo; RTX 3090 o 4080 para cuantización de 8 bits.
- GPU de consumo: sí cabe en tarjetas de gama alta y media-alta con cuantización (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Sin cuantizar, en tarjetas de 12 GB no entra.
- Despliegue: la vía documentada es `transformers` + `peft` + `accelerate`, cargando el modelo base y aplicando el adaptador con `PeftModel.from_pretrained` indicando el `subfolder`. Para servir con vLLM u Ollama es necesario fusionar previamente el adaptador (`merge_and_unload`) y, en el caso de llama.cpp, convertir el modelo fusionado a GGUF. Los adaptadores por sí solos no se pueden servir sin el modelo base.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para estos adaptadores.

## Comparativa con modelos similares

La comparación es únicamente estructural: no existen métricas de rendimiento publicadas para este repositorio (0 descargas, 0 likes) ni para los checkpoints intermedios.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Guangchen-Lan/selfplay-gpt56-p5-27235f | Adaptadores LoRA sobre 8B | 128k heredados del base; no verificado | Sin benchmarks publicados | No declarada en el repositorio | Público, 0 descargas |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8,03B | 128k | No disponible en la información proporcionada | Llama 3.1 Community License | Público |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128k | No disponible en la información proporcionada | Llama 3.1 Community License | Público |
| Llama-3.1-8B (base preentrenado) | 8,03B | 128k | No disponible en la información proporcionada | Llama 3.1 Community License | Público |

## Limitaciones y advertencias

- Experimento incompleto: el entrenamiento se interrumpió en el paso 272 por un HTTP 503 y el ciclo PSRO/Uniform/Naive no llegó a finalizar. Los checkpoints publicados son estados intermedios de un run truncado.
- Selección de checkpoint no basada en calidad: el autor indica explícitamente que se eligió el de mayor número de paso (270), no el mejor según criterio alguno de evaluación.
- Ausencia total de evaluación: no hay benchmarks independientes, ni evaluación humana, ni medición de seguridad, alucinación o capacidades.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar del modelo base, se heredan los términos de la Llama 3.1 Community License, incluida la política de uso aceptable y las restricciones sobre el uso de la marca "Llama". El uso comercial queda en una zona de incertidumbre legal hasta que el autor aclare la licencia.
- Modelo base abliterated: las direcciones de rechazo están ablacionadas, lo que incrementa el riesgo de generar contenido dañino, ilegal o inseguro sin filtros. No es adecuado para aplicaciones orientadas al público sin un sistema de moderación externo.
- Sesgos: no evaluados. Los sesgos del modelo base (Llama 3.1) y los inducidos por las etiquetas de tema de un modelo propietario externo permanecen sin caracterizar.
- Riesgo de alucinación: no medido en estos adaptadores; se hereda el comportamiento del modelo base, que puede inventar hechos con seguridad.
- Idiomas y contexto: el repositorio no declara idiomas. Se desconoce la longitud de secuencia usada durante el ajuste, por lo que el contexto efectivo de los adaptadores puede ser muy inferior a los 128k del base.
- Discrepancia de identificadores: la ficha de HuggingFace apunta a `Guangchen-Lan/selfplay-gpt56-p5-27235f`, mientras que el ejemplo de código del README usa `zhihz0535/selfplay-gpt56-p5-27235f`. Conviene verificar cuál de los dos aloja realmente los adaptadores.
- Dependencia de un servicio propietario: las etiquetas de tema proceden de un modelo de terceros no reproducible y sujeta a condiciones de uso ajenas; esto limita la reproducibilidad completa del pipeline.
- Madurez: 0 descargas y 0 likes, sin issues ni validación externa documentada. No debe tratarse como artefacto estable.
- Formato: solo adaptadores PEFT en safetensors. No hay GGUF, cuantizaciones listas para usar ni versiones fusionadas publicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Guangchen-Lan/selfplay-gpt56-p5-27235f
- Modelo base: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Revisión del modelo base usada en el README: `368c8ed94ce4c986e7b9ca5c159651ef753908ce`
- Repositorio citado en el ejemplo de carga del README: https://huggingface.co/zhihz0535/selfplay-gpt56-p5-27235f
- Papers, blogs, repositorios o demos adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
