# Accio-Lab/occamy-1.0-GGUF

## Resumen

Occamy-1.0 GGUF es la versión cuantizada en formato GGUF del modelo multimodal Accio-Lab/occamy-1.0, publicada por Accio-Lab. Se trata de una conversión directa desde el checkpoint BF16 original, sin pesos donantes ni mezcla de modelos, e incluye tanto el modelo de lenguaje como un proyector de visión independiente (mmproj) que habilita la entrada de imagen junto a texto. El repositorio ofrece dos cuantizaciones del modelo de lenguaje (Q8_0 y Q4_K_M) más el proyector en F16, pensadas para su ejecución en llama.cpp.

El modelo base cuenta con 34.660.610.688 parámetros totales (~34,66 mil millones) y su etiquetado apunta a una arquitectura de tipo MoE (`qwen3_5_moe`) con soporte de tool-use y pipeline image-text-to-text. La ficha no detalla el número de parámetros activos, la longitud de contexto nativa ni la composición del dataset de entrenamiento, por lo que esos datos quedan como no disponibles.

La relevancia de esta publicación es práctica: permite desplegar un modelo multimodal con capacidades de tool calling en hardware de consumo o en servidores modestos mediante cuantización, con instrucciones reproducibles de llama.cpp, una tabla de presupuestos de memoria y un conjunto de validación documentado (incluyendo fallos conocidos) que facilita evaluar su idoneidad antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (etiqueta `qwen3_5_moe`); modelo de lenguaje + encoder/proyector de visión separado |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la validación smoke se realizó con 8K de contexto) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M del modelo de lenguaje; proyector de visión en F16; origen BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card identifica el modelo dentro de la arquitectura `qwen3_5_moe`, lo que implica un transformer con mezcla de expertos (MoE) y soporte multimodal de tipo image-text-to-text. El paquete GGUF separa el modelo de lenguaje (archivos `occamy-1.0-Q8_0.gguf` y `occamy-1.0-Q4_K_M.gguf`) del componente de visión (`mmproj-occamy-1.0-F16.gguf`, 0,899 GB), que actúa como encoder/proyector y debe cargarse junto al modelo de lenguaje para tareas con imagen.

Sobre el entrenamiento no se aporta información: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. La conversión es directa desde el checkpoint BF16 sin pesos donantes ni merging. En cuanto a la cuantización, Q8_0 se deriva directamente del BF16, mientras que Q4_K_M se genera con `llama-quantize` sin importance matrix, aplicando reglas estándar de precisión mixta a los tensores pequeños y sensibles. Se ha corregido manualmente el metadato `tokenizer.ggml.pre` a `qwen2` (el conversor sin modificar infería `qwen35`), lo que afecta a la tokenización de ciertos alfabetos pero no a los datos de los tensores. La tokenización de entrada debe normalizarse a NFC para reproducir el normalizador del tokenizer original.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Comprensión de imágenes junto a texto (image-text-to-text) mediante el proyector de visión F16.
- Tool calling / function calling, indicado explícitamente por la etiqueta `tool-use`.
- Generación de código: la validación incluye dos comprobaciones de funciones de código superadas en las tres variantes.
- Salida estructurada en JSON: en las pruebas estrictas se superaron 3 de 4 comprobaciones por variante.
- Modo de razonamiento conmutable: el chat template acepta `chat_template_kwargs: {"enable_thinking": false}`.
- Identificación de imágenes sintéticas: la prueba de imagen roja sintética se resolvió correctamente.
- Capacidades multilingües: no disponibles (la ficha no especifica idiomas).

## Casos de uso

- Asistente conversacional con visión: el modelo puede mantener diálogos multi-turno e incorporar imágenes mediante el proyector F16, útil para soporte técnico donde el usuario adjunta capturas de pantalla o fotos de productos.
- Automatización de agentes con herramientas: gracias al soporte de tool-use y formato de chat con Jinja, puede integrarse en pipelines donde el modelo invoca funciones externas (APIs, consultas a bases de datos) encadenando varios pasos.
- Generación y revisión de código en desarrollo: las comprobaciones de funciones de código pasaron en todas las variantes, por lo que es viable para autocompletado, generación de utilidades o revisión en flujos de CI/CD que consuman una API compatible con llama-server.
- Extracción de datos estructurados: con una tasa de acierto de 3/4 en validación JSON estricta, puede emplearse para convertir texto o imágenes en objetos JSON, siempre con validación posterior en el pipeline.
- Procesamiento documental con imágenes: transcripción y resumen de documentos escaneados o fotografías combinando el encoder de visión con el modelo de lenguaje.
- Despliegue local con privacidad: al ejecutarse en llama.cpp con pesos GGUF, permite montar asistentes on-premise sin enviar datos a servicios externos.
- Prototipado multimodal en investigación: el par de cuantizaciones (Q4_K_M y Q8_0) más el proyector permiten comparar el impacto de la cuantización en tareas de texto, código e imagen dentro del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evidencia cuantitativa es la tabla de validación interna del repositorio, que compara la referencia BF16 GGUF con las variantes Q4_K_M y Q8_0:

| Comprobacion | BF16 GGUF (referencia) | Q4_K_M | Q8_0 |
|---|---:|---:|---:|
| Respuestas smoke completadas con EOS | 8/8 | 8/8 | 8/8 |
| Comprobaciones de funciones de código | 2/2 | 2/2 | 2/2 |
| Comprobaciones JSON estrictas | 3/4 | 3/4 | 3/4 |
| Coincidencia del tokenizer en crudo | 13/14 | 13/14 | 13/14 |
| Coincidencia del tokenizer tras NFC | 14/14 | 14/14 | 14/14 |
| Instrucción exacta `OK` | Falló (`OK.`) | Falló (`OK.`) | Falló (`OK.`) |
| Identificación de imagen roja sintética | Correcta | Correcta | Correcta |

El propio autor advierte de que completar las respuestas no equivale a superar todas las aserciones, que los fallos conocidos se mantienen visibles y que no se reclama paridad de calidad general con la referencia BF16.

## Requisitos de hardware

- Tamaño de los archivos (GB decimales, no consumo medido): Q4_K_M 21,167 GB; Q8_0 36,903 GB; proyector de visión F16 0,899 GB.
- Presupuestos ilustrativos de memoria (tamaño de archivo convertido a GiB más una reserva asumida de 4 u 8 GiB, no medidos):
  - Q4_K_M solo texto: 19,71 GiB de pesos; 23,71 GiB con reserva de 4 GiB; 27,71 GiB con 8 GiB.
  - Q4_K_M + proyector F16: 20,55 GiB; 24,55 GiB con 4 GiB; 28,55 GiB con 8 GiB.
  - Q8_0 solo texto: 34,37 GiB; 38,37 GiB con 4 GiB; 42,37 GiB con 8 GiB.
  - Q8_0 + proyector F16: 35,21 GiB; 39,21 GiB con 4 GiB; 43,21 GiB con 8 GiB.
- La reserva debe cubrir caché KV, buffers de cómputo, estado recurrente y procesamiento de imagen; el autor indica que el overhead real puede superar cualquiera de las dos reservas.
- Para ejecución totalmente en GPU hay que comparar contra la VRAM libre, no la anunciada. El offload a CPU reparte la carga entre RAM de host y VRAM, pero no se establece un mínimo de RAM de host.
- En máquinas de memoria unificada hay que dejar margen para el sistema operativo y otras aplicaciones.
- Compatibilidad con CPU-only, Apple Silicon y GPU de consumo no ha sido establecida por las pruebas del autor.
- No se han publicado cifras de latencia ni throughput.
- Despliegue validado con llama.cpp en el commit `d1d3c3396aa13a5f239109a822666c4870490ad5`, con la arquitectura `qwen3_5_moe`. Ejemplo de arranque:

```bash
llama-server \
  -m occamy-1.0-Q4_K_M.gguf \
  --mmproj mmproj-occamy-1.0-F16.gguf \
  -ngl 999 -c 8192 -np 1 -fa on \
  --jinja --host 127.0.0.1 --port 8080
```

Para uso solo de texto se omite `--mmproj`. Los archivos no son checkpoints NVFP4 y no requieren backend específico NVFP4.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos alternativos de la misma categoría en la información proporcionada. La única comparación posible es entre las variantes del propio repositorio:

| Variante | Peso del modelo de lenguaje | Proyector de visión | Contexto validado | Licencia |
|---|---:|---:|---:|---|
| occamy-1.0 Q8_0 | 36,903 GB | F16 (0,899 GB) | 8K (smoke test) | apache-2.0 |
| occamy-1.0 Q4_K_M | 21,167 GB | F16 (0,899 GB) | 8K (smoke test) | apache-2.0 |

Modelos comparables externos: no disponible.

## Limitaciones y advertencias

- Alucinación: no se han publicado evaluaciones de veracidad; el fallo de la instrucción exacta `OK` (devuelve `OK.`) indica que el modelo puede no seguir instrucciones de formato de forma literal.
- JSON estricto: 1 de cada 4 comprobaciones falló en todas las variantes, por lo que no conviene confiar en la validez sintáctica de la salida sin validación posterior.
- Tokenización: es obligatorio normalizar el texto de entrada a NFC antes de tokenizar para reproducir el tokenizer original; llama.cpp no lo aplica automáticamente. Los clientes de API deben aplicar `unicodedata.normalize("NFC", text)`. La prueba de equivalencia se limita a 14 casos y no demuestra equivalencia para toda entrada Unicode.
- Contexto: la ventana nativa del modelo no se especifica; el test de humo empleó 8K de contexto con un solo slot y no certifica configuraciones de contexto más largas.
- Idiomas: la ficha no declara idiomas soportados, lo que impide garantizar calidad multilingüe.
- Parámetros activos: al ser un modelo MoE, se desconoce el número de parámetros activos, dato relevante para estimar latencia real.
- Hardware: la compatibilidad con CPU-only, Apple Silicon y GPU de consumo no está establecida por el autor; los presupuestos de memoria de la ficha son estimaciones de planificación, no mediciones.
- Licencia: apache-2.0 permite uso comercial, pero conviene conservar las notas de compatibilidad del tokenizer en cualquier redistribución.
- Datos de entrenamiento y sesgos: no disponibles.

## Enlaces

- HuggingFace (modelo GGUF): https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Herramienta de estimación de hardware de HuggingFace: https://huggingface.co/settings/hardware?fromRepo=Accio-Lab/occamy-1.0-GGUF
- Resultados de validación del repositorio: ./VALIDATION.json
- Script de normalización de texto: ./normalize_nfc.py
- Los resultados de la búsqueda web (accio.com, fr.accio.com, Google Play) corresponden a la plataforma comercial "Accio Work" y no guardan relación con el modelo; no se han encontrado papers, blogs ni repositorios técnicos adicionales en la información disponible.
