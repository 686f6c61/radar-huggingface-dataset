# experimentalmachines/LFM3-1.7B-ExecuTorch

## Resumen

LFM3-1.7B-ExecuTorch es una exportación cuantizada para ejecución en dispositivo (on-device) del modelo LiquidAI/LFM3-1.7B, publicada por la organización experimentalmachines en Hugging Face. No es un modelo nuevo en sí, sino un empaquetado de los pesos originales de Liquid AI en el formato `.pte` de ExecuTorch (el runtime de PyTorch para móvil y edge), pensado para inferencia en Android sobre CPU ARM64 mediante el backend XNNPACK.

El problema que resuelve es la brecha entre los modelos open weights de última generación y su despliegue real en terminales móviles: ExecuTorch todavía no incluye una definición nativa de la arquitectura LFM3, por lo que este repositorio aporta los ficheros trazados desde la implementación de referencia (vía el proyecto ExecuPack), verificados contra los logits fp32 del checkpoint original. Incluye tres variantes con ventanas de contexto de 8k, 16k y 32k tokens, todas con cuantización 4-bit de pesos y 8-bit dinámica de activaciones, con tamaños de fichero de en torno a 1,25 GB.

Su relevancia actual radica en la tendencia de ejecutar LLM pequeños localmente en smartphones por privacidad, latencia y coste. Con una huella de memoria razonable y soporte de contexto de hasta 32.768 tokens en CPU, es un candidato interesante para apps Android que necesiten generación de texto sin conexión, aunque conviene tener en cuenta que la app openweights aún no carga estos ficheros por falta de plantilla de chat para la familia LFM3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, implementación trazada vía ExecuPack; incluye capas con ventana de atención) |
| Parametros totales | 1,7 B (heredado del modelo base) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | 8.192, 16.384 o 32.768 tokens según variante (ventana fija en el fichero `.pte`) |
| Tipos de cuantizacion | 8da4w GPTQ: pesos a 4 bits en grupos de 32, activaciones dinámicas a 8 bits, embeddings int8 por canal, caché KV en fp32 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other, heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer.json copiado del repositorio original |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-1.7B, pertenece a la familia Liquid Foundation Models de Liquid AI. Este repositorio no modifica los pesos del modelo original: los exporta a ExecuTorch 1.5.1 mediante `export_llm`, trazando el modelo desde la definición de ExecuPack (`pipeline/lfm3_model.py`), que coincide con el `modeling_lfm3.py` del checkpoint en logits fp32. Como ExecuTorch no tiene todavía una definición nativa de LFM3, se emplean sus custom ops para la caché KV y la atención SDPA.

Un detalle técnico relevante: las capas con ventana de atención mantienen un anillo (ring buffer) de sus últimos 256 tokens más un chunk de prefill, en lugar de la ventana completa, lo que reduce la memoria de la caché KV. La exportación usa un chunk de prefill de 2.048 tokens y caché KV en fp32, que cuesta 45.056 bytes por token; la caché completa se asigna íntegramente al cargar el modelo (por ejemplo, unos 1,48 GB para la ventana de 32k), de ahí que la ventana deba elegirse en el momento de la exportación. No hay información sobre datos de entrenamiento ni post-entrenamiento (RLHF/DPO) en este repositorio, al tratarse de una exportación cuantizada; dichos datos corresponderían al modelo base de Liquid AI.

## Capacidades

- Generación de texto en dispositivo (pipeline `text-generation`) sin conexión a red, sobre CPU ARM64 vía XNNPACK.
- Contexto de hasta 32.768 tokens según la variante elegida (8k, 16k o 32k).
- Compatibilidad con cualquier runtime ExecuTorch 1.5.1 que disponga de los custom ops del LLM runner.
- Uso de la plantilla de chat original del modelo (`chat_template.jinja` del repositorio de Liquid AI) para formatear los prompts.
- Capacidades heredadas del modelo base (razonamiento, código, tool calling, multilingüismo): no disponibles en la información de este repositorio; consultar la model card de LiquidAI/LFM3-1.7B.
- No incluye chat template en la app openweights todavía, por lo que esta app no carga los ficheros de momento.

## Casos de uso

- Asistentes offline en Android: la inferencia 100 % en CPU ARM64 sin conexión permite integrar un asistente conversacional en apps que deban funcionar sin red o con privacidad estricta (salud, notas personales, entornos empresariales restringidos).
- Resumen de documentos largos en el móvil: la variante de 32.768 tokens permite procesar documentos extensos localmente, aunque hay que reservar unos 1,5 GB solo para la caché KV.
- Apps con presupuesto de memoria ajustado: la variante de 8k (fichero de 1,25 GB y caché KV de unos 369 MB) cabe en teléfonos gama media, y el campo `fits_phone_budget` de cada `config.json` estima el ajuste contra un presupuesto de 5 GB.
- Prototipado de IA en dispositivo: al ser ficheros `.pte` estándar de ExecuTorch, sirven de base para probar integraciones en apps Android con PyTorch Mobile/ExecuTorch antes de invertir en exportaciones propias.
- Generación de texto en segundo plano: la cuantización 8da4w con XNNPACK está optimizada para CPU, útil para tareas asíncronas (redacción de respuestas, autocompletado) sin depender de NPU o GPU.
- Distribución de modelos open weights en apps de terceros: el proyecto openweights usa este tipo de exportaciones como catálogo de modelos descargables, con informes de exportación verificables (`export-report-<window>.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Como verificación funcional, el autor reporta smoke tests superados ("Paris") para las tres variantes XNNPACK. Para métricas del modelo base (MMLU, GSM8K, etc.), consultar la model card de LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- Destino: cualquier dispositivo ARM64 con CPU (backend XNNPACK); orientado a Android.
- Tamaño de los ficheros: 1,25 GB (8k y 16k) y 1,27 GB (32k).
- Memoria de la caché KV (fp32, asignada íntegra al cargar):
  - 8.192 tokens: 45.056 bytes/token, 369.098.752 bytes en total (~369 MB).
  - 16.384 tokens: 45.056 bytes/token, 738.197.504 bytes en total (~738 MB).
  - 32.768 tokens: 45.056 bytes/token, 1.476.395.008 bytes en total (~1,48 GB).
- Presupuesto de referencia del autor: 5 GB de memoria de dispositivo; el campo `fits_phone_budget` de cada `config.json` estima qué ventanas caben.
- No requiere GPU dedicada ni servidores: no aplica a A100/H100/RTX 4090; es un modelo de edge. En escritorio x86 no está cubierto por estos ficheros (solo arm64).
- Despliegue: runtime ExecuTorch 1.5.1 con los custom ops del LLM runner, o la app Android openweights (aún pendiente de chat template para LFM3). No es un GGUF: no funciona en llama.cpp u Ollama; para servidor usar el modelo base de Liquid AI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| LFM3-1.7B-ExecuTorch | 1,7 B (cuantizado 4-bit) | `.pte` (ExecuTorch) | 8k / 16k / 32k | lfm1.0 | Inferencia on-device Android (CPU ARM64) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | safetensors (no disponible el detalle exacto) | no disponible en esta ficha | lfm1.0 | Inferencia en servidor / investigación |
| Qwen3-1.7B (referencia de categoria) | 1,7 B | safetensors / GGUF | hasta ~32k+ (según version) | Apache 2.0 | Servidor y edge; amplio ecosistema |

Comparativa orientativa: frente al modelo base de Liquid AI, esta exportación sacrifica precisión (cuantización 4-bit) a cambio de ejecutarse en móviles; frente a alternativas como Qwen3-1.7B, la diferencia clave es el formato: aquí el valor está en los ficheros ExecuTorch listos para Android, no en el ecosistema de inferencia estándar. Datos precisos de contexto y rendimiento de los competidores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- La app openweights aún no dispone de chat template para la familia LFM3, por lo que no carga estos ficheros; hay que usar un runtime ExecuTorch con los custom ops del LLM runner y formatear los prompts manualmente con el `chat_template.jinja` del modelo base.
- La ventana de contexto está fijada dentro de cada fichero `.pte`: no es ajustable en tiempo de ejecución, y la caché KV completa se asigna al cargar, lo que puede provocar fallos por memoria en dispositivos ajustados si se elige una ventana demasiado grande.
- Las capas con ventana mantienen solo sus últimos 256 tokens más un chunk de prefill en el anillo, no la ventana completa: el comportamiento con contextos muy largos puede diferir del modelo base.
- Los ficheros solo cubren CPU ARM64 (XNNPACK); no hay variantes para GPU/NPU ni para x86.
- Licencia lfm1.0 (other): no es una licencia estándar tipo Apache/MIT; revisar los términos del fichero LICENSE antes de uso comercial.
- Riesgo de alucinación, sesgos y limitaciones de idioma: los del modelo base LiquidAI/LFM3-1.7B; no documentados en este repositorio.
- Los smoke tests reportados son mínimos ("Paris"); no hay validación de calidad tras la cuantización publicada en este repo.
- Métricas de rendimiento (tokens/s, latencia de prefill/decodificación): no disponibles.

## Enlaces

- Repositorio del modelo: https://huggingface.co/experimentalmachines/LFM3-1.7B-ExecuTorch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- App openweights (Android): https://github.com/alpharomercoma/openweights
- ExecuPack (herramienta de exportación usada): https://github.com/ExperimentalMachines/execupack
- Licencia: https://huggingface.co/experimentalmachines/LFM3-1.7B-ExecuTorch/blob/main/LICENSE
