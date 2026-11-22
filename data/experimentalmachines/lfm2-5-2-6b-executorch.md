# experimentalmachines/LFM2.5-2.6B-ExecuTorch

## Resumen

LFM2.5-2.6B-ExecuTorch es una exportación del modelo LiquidAI/LFM2.5-2.6B (revisión `654f9463ce32`) al formato ExecuTorch, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) en Android. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada y empaquetada del modelo base de Liquid AI, pensada para ejecutarse con el runtime ExecuTorch 1.4.0 y con la aplicación Android openweights.

El repositorio ofrece dos familias de artefactos: ventanas XNNPACK (CPU) para cualquier dispositivo arm64 con contextos fijos de 2k a 32k tokens, y ventanas MediaTek NeuroPilot para el SoC MT6991 (Dimensity 9400) con contextos de 512 a 8k tokens. La ventana de contexto queda fijada dentro de cada archivo `.pte`, de modo que el runtime reserva la totalidad de la caché KV al cargar el modelo; por eso el autor incluye la estimación `fits_phone_budget` contra un presupuesto de 5 GB en cada `config.json`.

La relevancia de esta ficha radica en que demuestra un flujo práctico de despliegue de un LLM de 2,6B parámetros en teléfonos de gama alta, con cuantización GPTQ de 8 bits por canal de grupo y pesos de 4 bits (8da4w) para CPU, y activaciones de 16 bits con pesos de 8 bits (a16w8) para la NPU de MediaTek. El tamaño del repositorio es de 24,4 GB, aunque cada archivo individual ronda entre 0,84 GB y 1,81 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-2.6B); exportado a ExecuTorch |
| Parametros totales | 2,6B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Fija por archivo: 512, 2.048, 4.096, 8.192, 16.384 o 32.768 tokens según variante |
| Tipos de cuantizacion | XNNPACK: 8da4w-gptq (grupo de 8 bits, pesos 4 bits, GPTQ); MediaTek: a16w8 (activaciones 16 bits, pesos 8 bits); embeddings NeuroPilot en fp32 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | `.pte` (ExecuTorch); `tokenizer.json`; embeddings `.bin` (fp32) para NeuroPilot |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-2.6B, un transformer de 2,6B parámetros desarrollado por Liquid AI. Esta ficha no documenta los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card original de LiquidAI/LFM2.5-2.6B. La contribución de este repositorio es exclusivamente la exportación y cuantización para ExecuTorch.

La exportación emplea dos backends. Para CPU arm64 se usa XNNPACK con cuantización GPTQ 8da4w: pesos de 4 bits con grupos de 8 bits, lo que produce archivos de entre 1,78 GB (2k) y 1,81 GB (32k). Para la NPU MediaTek MT6991 se usa NeuroPilot con cuantización a16w8, dividida en tres fragmentos por ventana (chunks 1of3, 2of3 y 3of3), con un total aproximado de 2,78 GB por ventana más una tabla de embeddings fp32 compartida. La caché KV se reserva íntegra al cargar el modelo y consume 32.768 bytes por token en fp32 para XNNPACK, es decir, 67 MB para 2k tokens y 1.073 MB para 32k tokens. Cada carpeta incluye un `config.json` con metadatos por variante y un `export-report-<window>.json` con el registro completo de exportación.

## Capacidades

- Generación de texto en dispositivo (pipeline `text-generation`), con pruebas de humo superadas para todas las ventanas XNNPACK (respuesta "Paris").
- Inferencia local sin conexión en Android mediante el runtime ExecuTorch 1.4.0 o la app openweights.
- Contexto configurable por archivo, desde 512 tokens (NPU) hasta 32.768 tokens (CPU XNNPACK).
- Ejecución en CPU arm64 genérica vía XNNPACK y en NPU MediaTek Dimensity 9400 vía NeuroPilot.
- Tokenizador incluido (`tokenizer.json`) copiado sin cambios del repositorio fuente.
- Capacidades adicionales del modelo base (tool calling, agentes, multilingüismo, matemáticas, código) no están documentadas en esta model card; deben verificarse en la ficha de LiquidAI/LFM2.5-2.6B.

## Casos de uso

- Asistentes de texto offline en Android: el modelo puede ejecutarse íntegramente en el teléfono con la app openweights, sin enviar datos a la nube, usando la ventana de 2k u 8k según la memoria disponible.
- Autocompletado y redacción en aplicaciones móviles: con archivos de 1,78-1,81 GB en CPU, cabe en el presupuesto de 5 GB del dispositivo y permite generar texto en tiempo de ejecución local.
- Procesamiento de documentos cortos en el dispositivo: la ventana de 8k tokens (268 MB de caché KV) permite resumir correos, notas o mensajes sin salir del teléfono.
- Transcripción y reescritura de conversaciones largas: la ventana de 32k tokens (1.073 MB de caché KV) admite hilos de conversación extensos en CPU arm64.
- Prototipado de funciones de IA en apps Android: los informes de exportación y los `config.json` permiten integrar el modelo en pipelines de CI para validar que la ventana elegida entra en el presupuesto de memoria del dispositivo.
- Evaluación de aceleración NPU en Dimensity 9400: los artefactos NeuroPilot a16w8 permiten probar inferencia en NPU con ventanas de 512 a 8k tokens, aunque el autor advierte que la prueba de humo solo verificó la estructura al no disponer de runtime NPU en el host.
- Investigación sobre cuantización en dispositivo: la combinación de GPTQ 8da4w y a16w8 con informes de exportación detallados sirve para comparar precisión y memoria entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de humo cualitativas: las cinco variantes XNNPACK superaron la prueba con la respuesta "Paris"; las variantes MediaTek solo fueron verificadas estructuralmente ("structure checked") por ausencia de runtime NPU en el host de exportación.

## Requisitos de hardware

- VRAM/RAM estimada: los archivos XNNPACK ocupan entre 1,78 GB y 1,81 GB; la caché KV añade 67 MB (2k), 134 MB (4k), 268 MB (8k), 537 MB (16k) o 1.073 MB (32k), reservada íntegra al cargar. Los artefactos MediaTek suman unos 2,78 GB por ventana más embeddings fp32.
- Dispositivos objetivo: cualquier arm64 para XNNPACK; MediaTek Dimensity 9400 (MT6991) para NeuroPilot.
- GPU: no aplica; el despliegue es en CPU arm64 o NPU móvil, no en GPU de escritorio.
- ¿Cabe en hardware de consumo? Sí, en teléfonos Android de gama alta; el autor estima el ajuste contra un presupuesto de 5 GB mediante `fits_phone_budget`.
- Opciones de despliegue: runtime ExecuTorch 1.4.0, app Android openweights, backend XNNPACK y backend MediaTek NeuroPilot.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-ExecuTorch (esta ficha) | 2,6B | 512-32.768 tokens fijos por archivo | `.pte` ExecuTorch (XNNPACK, NeuroPilot) | lfm1.0 | Hugging Face, 689 descargas |
| LiquidAI/LFM2.5-2.6B | 2,6B | no disponible en esta ficha | Pesos originales (safetensors presumiblemente) | lfm1.0 | Hugging Face (modelo base) |
| Alternativas on-device de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras exportaciones ExecuTorch comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La ventana de contexto es fija por archivo: no se puede ampliar en tiempo de ejecución, y el runtime reserva toda la caché KV al cargar, lo que puede provocar fallos de memoria en dispositivos con poca RAM.
- Las variantes MediaTek NeuroPilot no han sido probadas funcionalmente; solo se verificó su estructura, por lo que su corrección en dispositivo no está confirmada.
- El modelo base puede presentar sesgos y alucinaciones; esta exportación no documenta mitigaciones adicionales.
- No se documentan los idiomas soportados; el rendimiento multilingüe debe validarse contra el modelo base.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- La cuantización 8da4w y a16w8 puede degradar la calidad respecto a los pesos originales; no se han publicado métricas de degradación.
- El repositorio tiene 24,4 GB totales; la descarga selectiva de una sola variante es imprescindible para evitar transferencias innecesarias.
- No hay soporte GPU ni de escritorio; el uso está limitado a Android arm64 y al SoC MT6991 para la ruta NPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-ExecuTorch
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- App Android openweights: https://github.com/alpharomercoma/openweights
- Runtime ExecuTorch: no disponible en la información proporcionada
- Papers, blogs y demos: no disponibles en la información proporcionada
