# masahiroid/roberta-base-go_emotions-coreml

## Resumen

`masahiroid/roberta-base-go_emotions-coreml` es una conversión a Core ML del clasificador multi-etiqueta de emociones `SamLowe/roberta-base-go_emotions`, basado en la arquitectura RoBERTa-base. No introduce entrenamiento nuevo ni fine-tuning adicional: es un checkpoint derivado que traslada los pesos originales (revisión `d75048347613a25d77de8cf6412eaae9fa7b26be`) al formato ML Program de Core ML en precisión F32, con el objetivo de permitir inferencia nativa en el ecosistema Apple (macOS 14+ e iOS 17+).

El modelo resuelve una tarea concreta: clasificación multietiqueta de emociones en inglés con 28 categorías, donde varias emociones pueden aplicarse simultáneamente a un mismo texto. La salida son 28 puntuaciones sigmoideas independientes, no una distribución softmax, lo que obliga a aplicar umbrales por etiqueta en lugar de seleccionar únicamente el argmax.

Su relevancia es fundamentalmente práctica: facilita el despliegue en aplicaciones Apple sin dependencia de PyTorch en tiempo de ejecución, con una entrada fija de `[1, 128]` tokens y un tamaño de repositorio de 0,5 GB. No es un modelo generativo ni un LLM; es un encoder de clasificación con un papel acotado dentro de pipelines de análisis de sentimiento y moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) convertido a Core ML ML Program |
| Parametros totales | no disponible (RoBERTa-base tiene aproximadamente 125 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma de entrada fija `[1, 128]`, batch 1) |
| Tipos de cuantizacion | F32 (pesos y cómputo); el autor indica explícitamente que no es una cuantización de 4 bits |
| Idiomas soportados | inglés (la model card describe clasificación de emociones en inglés; pruebas adicionales con texto en japonés) |
| Licencia | MIT (pesos originales y añadidos del conversor) |
| Formato de pesos | Core ML `.mlpackage` (ML Program); existen variantes MLX, Core AI y GGUF en repositorios separados |

## Arquitectura y entrenamiento

La arquitectura subyacente es RoBERTa-base, un transformer encoder con atención bidireccional, adaptado mediante fine-tuning sobre el dataset `go_emotions` (derivado de datos de Reddit, 28 etiquetas, clasificación multietiqueta). Este repositorio no contiene ese entrenamiento: es una conversión de checkpoint con paridad numérica verificada. El autor reporta una diferencia absoluta máxima de salida de `1.1920929e-05` y una similitud coseno mínima de `0.9999999` frente a la implementación original en PyTorch, evaluadas sobre 6 casos deterministas.

La conversión se realizó con `coremltools` 9.0 sobre PyTorch 2.14.1 y Transformers 4.57.3, con objetivo de exportación macOS 14+/iOS 17+. La tokenización debe forzar padding y truncation a 128 tokens con tokenizador fast. No hay innovaciones arquitectónicas propias: el valor técnico está en la fidelidad de la conversión y en la inclusión de scripts de reproducción y metadatos de procedencia (`provenance.json`, `validation.json`).

## Capacidades

- Clasificación multietiqueta de emociones en inglés con 28 etiquetas y salidas sigmoideas independientes.
- Detección de múltiples emociones simultáneas en un mismo texto (requiere umbrales por etiqueta).
- Procesamiento de texto corto y medio dentro de la ventana fija de 128 tokens.
- Inferencia nativa en macOS 14+ e iOS 17+ mediante Core ML ML Program.
- Ejecución determinista con entrada de batch 1.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada: el modelo está entrenado para inglés; la model card menciona pruebas con japonés pero no garantiza calidad en otros idiomas.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios de foros o redes con las 28 etiquetas para detectar toxicidad, frustración o tristeza y priorizar revisiones humanas, aprovechando que el modelo admite varias emociones por mensaje.
- Análisis de sentimiento en apps iOS: integrar el `.mlpackage` en una aplicación nativa para etiquetar reseñas o mensajes de usuario sin enviar datos a un servidor, con inferencia local en el dispositivo.
- Enrutamiento de tickets de soporte: asignar etiquetas emocionales a mensajes entrantes y derivar casos con alta carga de enfado o decepción a agentes especializados.
- Investigación en ciencias sociales: anotar corpus de texto en inglés con 28 categorías emocionales de forma reproducible, usando la ventana de 128 tokens para fragmentos cortos.
- Filtrado previo en pipelines de datos: preclasificar grandes volúmenes de texto corto antes de pasarlos a modelos generativos más costosos, reduciendo el cómputo total.
- Análisis de feedback de producto: procesar encuestas abiertas y comentarios breves para agregar métricas emocionales por versión o funcionalidad.
- Prototipado en macOS: validar flujos de clasificación emocional en escritorio antes de portar la lógica a iOS, dado que el autor probó la predicción en macOS pero no en iPhone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones de paridad numérica de la conversión (diferencia absoluta máxima `1.1920929e-05`, similitud coseno mínima `0.9999999` en 6 casos), que no constituyen una evaluación de calidad de tarea ni de latencia.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo se ejecuta mediante Core ML en GPU o Neural Engine de Apple, no en CUDA. El repositorio ocupa 0,5 GB en F32.
- GPU recomendadas: no disponible; el destino son chips Apple (Apple Silicon en macOS 14+ y dispositivos con iOS 17+).
- Cabe en hardware de consumo Apple: sí, por tamaño y por el formato Core ML; el autor no publica requisitos mínimos de memoria ni de chip.
- Opciones de despliegue: Core ML (`coremltools`), con variantes alternativas en MLX, Core AI y GGUF publicadas por el mismo autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/roberta-base-go_emotions-coreml | no disponible (base RoBERTa-base) | 128 tokens fijos | 28 etiquetas multietiqueta | MIT | Core ML |
| SamLowe/roberta-base-go_emotions | no disponible (base RoBERTa-base) | el del modelo original (no confirmado aquí) | 28 etiquetas multietiqueta | no disponible en la información | PyTorch/safetensors |
| Azma-AI/roberta-base-emotion-classifier | no disponible (base RoBERTa-base) | no disponible | 28 etiquetas multietiqueta sobre go_emotions | no disponible | no disponible |
| MicahB/roberta-base-go_emotions | no disponible (base RoBERTa-base) | no disponible | 28 etiquetas multietiqueta sobre go_emotions | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta agentes ni tool calling.
- Ventana de contexto fija de 128 tokens con batch 1; textos más largos deben truncarse y se pierde información.
- Entrenado sobre datos de Reddit, lo que puede introducir sesgos de dominio, registro y demografía; no se documentan evaluaciones de sesgo.
- Riesgo de falsos positivos y negativos al usar umbrales sigmoideos: la calibración por etiqueta es responsabilidad del integrador.
- Cobertura multilingüe no garantizada; el modelo está orientado a inglés y las pruebas con japonés no implican calidad equivalente.
- La licencia MIT se aplica a los pesos y a los añadidos del conversor, pero el autor aclara que no se implica certificación de seguridad ni licencia comercial adicional.
- Compatibilidad de versiones limitada al entorno probado (PyTorch 2.14.1, Transformers 4.57.3, coremltools 9.0); fuera de él no se garantiza.
- La validación se realizó en macOS, no en iPhone; el rendimiento en dispositivos iOS no está verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin adopción comunitaria documentada.

## Enlaces

- Hugging Face (Core ML): https://huggingface.co/masahiroid/roberta-base-go_emotions-coreml
- Modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Revisión del modelo base usada: https://huggingface.co/SamLowe/roberta-base-go_emotions/tree/d75048347613a25d77de8cf6412eaae9fa7b26be
- Variante MLX: https://huggingface.co/masahiroid/roberta-base-go_emotions-mlx
- Variante Core AI: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreai
- Variante GGUF: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf
- Alternativa comunitaria: https://huggingface.co/Azma-AI/roberta-base-emotion-classifier
- Alternativa comunitaria: https://huggingface.co/MicahB/roberta-base-go_emotions
