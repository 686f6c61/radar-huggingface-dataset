# Agentware/elephant-1-nf4

## Resumen

Elephant-1 NF4 es una cuantización de 4 bits (NF4) del checkpoint `baselabs/elephant-1` de Base Labs / Baseten, publicada por Agentware. No se trata de un modelo conversacional general, sino de un modelo de decisión especializado que expone una interfaz estructurada (`SystemOneRequest`) para resolver preguntas cerradas sobre un estado textual, como "¿se solicita un reembolso?". El artefacto incluye los pesos en safetensors y un adaptador de carga que envuelve un runtime propietario denominado OneJev, fijado a un commit concreto.

El modelo base tiene 8.953.803.264 parámetros (unos 8,95 mil millones) y se distribuye en un único fichero safetensors de 10.005.707.616 bytes (aproximadamente 9,32 GiB). La arquitectura combina capas de atención completa bidireccional por bloques con capas de atención lineal causal, además de una cabeza de lectura (`slot_lm`) y proyecciones protegidas en BF16. El adaptador impone ramas secuenciales y un límite de 16.384 tokens por rama y por petición.

Su relevancia es limitada y muy específica: sirve para reproducir el comportamiento de decisión del checkpoint original en un entorno con menos VRAM, siempre que se acepte la dependencia de un stack histórico (torch 2.11.0+cu130, transformers 5.19.0, bitsandbytes 0.50.2) y de un runtime externo no estándar. No hay validación publicada de inferencia CUDA ni de puntuaciones de benchmark para esta cuantización concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención completa bidireccional por bloques y capas de atención lineal causal; cabeza de lectura `slot_lm` |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens por rama y por petición (límite impuesto por el adaptador) |
| Tipos de cuantizacion | NF4 de 4 bits sin cuantización anidada ni doble; 200 módulos `Linear4bit`; 48 proyecciones `in_proj_a`/`in_proj_b` en BF16; `conv1d` excluido |
| Idiomas soportados | en |
| Licencia | MIT (modelo base declarado MIT por Base Labs / Baseten; componentes Qwen y OneJev bajo Apache-2.0) |
| Formato de pesos | safetensors (fichero único de 10.005.707.616 bytes); no es GGUF |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un reentrenamiento. La arquitectura subyacente, según la model card, es un transformer con dos tipos de capas: atención completa bidireccional organizada por bloques y atención lineal causal. Sobre esa pila se sitúa una cabeza de lectura `slot_lm` que produce respuestas estructuradas para preguntas tipadas (por ejemplo, `noul`). El adaptador NF4 conserva en BF16 las embeddings de entrada y el cómputo, mantiene la LM head en FP32 y deja 48 proyecciones `in_proj_a`/`in_proj_b` sin cuantizar; `conv1d` también queda fuera de la cuantización. En total se cuantizan 200 módulos lineales con bitsandbytes `Linear4bit` en NF4 sin doble cuantización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card tampoco documenta innovaciones de decodificación especulativa. El rasgo técnico diferencial es el runtime: la carga se realiza mediante `nf4_adapter.load_quantized_engine`, que envuelve temporalmente un classmethod global del proceso (por lo que la carga debe hacerse en un solo hilo) y delega la lógica de decisión en el runtime `qev`/OneJev, instalado por `setup.sh` en el commit `81ce62f1597c91e46767d4d02d6ac2e18534fe94` con un parche de servicio (`serve.patch`). El adaptador valida formas, módulos de cuantización, dtypes protegidos y modo de lectura al cargar, pero no constituye una garantía de calibración.

## Capacidades

- Clasificación y decisión sobre texto: responde preguntas cerradas y tipadas sobre un estado textual mediante `SystemOneRequest` (por ejemplo, detección de solicitud de reembolso).
- Salida estructurada: devuelve un objeto de respuesta con respuestas por pregunta (`response.answers`), no texto libre conversacional.
- Procesamiento de contexto moderado: hasta 16.384 tokens por rama y petición, con ramas forzadas a ejecución secuencial.
- Modelo solo texto: no admite entradas de imagen ni vídeo en este artefacto.
- Idioma: únicamente inglés.
- No validado para generación de texto genérica, tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No validado para despliegue en vLLM, Ollama, llama.cpp ni TGI.

## Casos de uso

- Triaje de solicitudes de soporte: clasificar mensajes de clientes en inglés con preguntas tipadas (por ejemplo, "¿solicita reembolso?", "¿es una queja?") y usar las respuestas para enrutar el ticket al equipo adecuado.
- Enriquecimiento de tickets en pipelines internos: ejecutar el motor de decisión sobre el texto del ticket y almacenar las respuestas estructuradas como metadatos para analítica posterior.
- Moderación o etiquetado semiautomático: aplicar preguntas cerradas sobre contenido textual en inglés para generar etiquetas booleanas o categóricas antes de una revisión humana.
- Extracción de intención en formularios: dado un campo de texto libre, decidir si cumple una condición definida (por ejemplo, si contiene una petición de cancelación) y disparar una acción en el backend.
- Evaluación comparativa de cuantizaciones: usar el artefacto como referencia para medir la degradación de precisión de NF4 frente al checkpoint BF16 original en tareas de decisión propias.
- Prototipado de investigación sobre modelos de decisión: experimentar con la interfaz `SystemOneRequest` y el runtime `qev` en un entorno aislado para estudiar el comportamiento del modelo base sin cargar los pesos completos en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las puntuaciones BF16 del README upstream no son resultados NF4 y que la preparación de la release no volvió a ejecutar inferencia CUDA ni scoring de benchmarks. Tampoco se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El fichero de pesos ocupa unos 9,32 GiB, pero el pico de memoria GPU depende de la longitud de petición, del batching/ramificado y de los kernels, no solo del tamaño del fichero.
- GPU recomendadas: no disponibles. La model card solo exige una GPU CUDA compatible con el stack histórico (torch 2.11.0+cu130, bitsandbytes 0.50.2) y advierte que esta release no incluye binarios CUDA.
- GPU de consumo: no validado. No hay confirmación de que quepa en tarjetas de 16 GB ni en modelos concretos como RTX 4090.
- Despliegue: exclusivamente mediante el adaptador `nf4_adapter` y el runtime OneJev/`qev` instalado por `setup.sh`. vLLM, llama.cpp, Ollama y TGI no están validados.
- Latencia y throughput: no disponibles.
- CPU y GPU AMD: no validadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Agentware/elephant-1-nf4 | 8,95 B | 16.384 tokens por rama | safetensors NF4 | MIT | Cuantización de decisión, runtime OneJev requerido |
| baselabs/elephant-1 | no disponible en la información proporcionada | no disponible | no disponible | MIT (declarada por Base Labs / Baseten) | Checkpoint upstream multimodal; referencia BF16 |
| Alternativas de clasificación de texto de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, latencia o precisión con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de chat general: la model card lo describe como un checkpoint de decisión especializado y desaconseja la generación de texto genérica.
- Dependencia de un runtime propietario y de un stack histórico de versiones (torch 2.11.0+cu130, transformers 5.19.0, bitsandbytes 0.50.2, accelerate 1.15.0, safetensors 0.8.0); cualquier incompatibilidad de driver o GPU puede impedir la carga.
- `setup.sh` fuerza la limpieza y el checkout de un repositorio OneJev e instala dependencias: debe ejecutarse solo en un entorno aislado y un directorio de trabajo vacío.
- La carga envuelve temporalmente un classmethod global del proceso; debe hacerse en un solo hilo.
- No se han validado la inferencia CUDA, la precisión, la latencia ni el encaje en 16 GB para esta cuantización; el manifiesto histórico refleja el estado en el momento de la exportación, con cero forwards.
- Riesgo de calibración: el adaptador valida formas y dtypes, pero no garantiza la calidad de las probabilidades; hay que evaluar la precisión en datos propios.
- Solo inglés; sin soporte de imagen o vídeo; sin validación en CPU ni GPU AMD; sin validación de configuraciones de contexto largo.
- Licencia MIT en el modelo, pero los componentes Qwen y OneJev mantienen términos Apache-2.0 bajo `upstream/`; conviene revisar `NOTICE.md` antes de un uso comercial.
- Riesgo de alucinación no evaluado en esta cuantización; al ser un modelo de decisión, los errores se manifestarán como clasificaciones incorrectas, no como texto inventado.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Agentware/elephant-1-nf4
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Revisión fijada del modelo base: `b3f8a93462fb1051a9de031e94a7ff380e254072`
- Commit de OneJev fijado por `setup.sh`: `81ce62f1597c91e46767d4d02d6ac2e18534fe94`
- Ficheros de integridad y atribución en el repositorio: `artifact_manifest.json`, `nf4_audit.json`, `SHA256SUMS`, `NOTICE.md`, `constraints.txt`
- SHA-256 de los pesos: `5734f9a3e87f741e1d03f4a2309f79977f5a10c04696c2391f806aff7a1dda2b`
