# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF es una compilación en formato GGUF del checkpoint de desarrollo `LFM3-VL-2B-MobileAgent-Dev-WaitRelabel`, publicado por el usuario experimentalmachines. Se trata de un ajuste fino (fine-tune) del modelo vision-language LiquidAI/LFM3-VL-2B de Liquid AI, especializado en actuar como agente de interfaz gráfica (GUI agent) sobre pantallas de teléfonos Android: recibe una captura de pantalla y un objetivo en inglés y produce la siguiente acción a ejecutar. El modelo base tiene 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) y combina una torre de visión con un modelo de lenguaje de la familia LFM3.

La relevancia de esta publicación es doble. Por un lado, demuestra que es viable convertir un modelo vision-language de ~2B en un agente móvil ejecutable en local mediante llama.cpp, con un peso de repositorio de 1,3 GB gracias a la cuantización Q4_K_M del modelo de lenguaje. Por otro, el autor lo marca explícitamente como checkpoint de desarrollo conservado únicamente para reproducibilidad, y recomienda usar la versión principal `LFM3-VL-2B-MobileAgent` en su lugar.

Conviene subrayar que no es un modelo de propósito general ni un asistente conversacional: está entrenado exclusivamente sobre demostraciones grabadas de interacción con pantallas y su ámbito declarado es el inglés, una captura por paso y una memoria limitada a 8 pasos de historial de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (torre de visión + modelo de lenguaje LFM3); el fine-tune no modifica la torre de visión |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuración de servicio documentada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de visión (`mmproj`) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (dos ficheros: modelo de lenguaje Q4_K_M y proyector de visión Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del vision-language LiquidAI/LFM3-VL-2B. La arquitectura combina una torre de visión con un modelo de lenguaje de la familia LFM3; según la model card, el ajuste fino no tocó la torre de visión, de modo que el proyector multimodal (`mmproj-LFM3-VL-2B-Q8_0.gguf`) es idéntico al del modelo original de Liquid AI. La conversión a GGUF se realizó con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize` a Q4_K_M.

El entrenamiento del fine-tune se basó únicamente en demostraciones grabadas: el modelo nunca interactuó con un teléfono real durante el entrenamiento. El autor no detalla en la información disponible el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El sufijo "WaitRelabel" del checkpoint sugiere un reetiquetado de acciones de espera en los datos de entrenamiento, aunque no se proporciona documentación técnica adicional al respecto. La configuración de servicio recomendada emplea `--image-max-tokens 1024`, `--reasoning-format deepseek` y `-np 1 -ngl 99`.

## Capacidades

- Percepción de capturas de pantalla de Android: interpreta la imagen de la pantalla como entrada visual junto con un objetivo en lenguaje natural.
- Generación de acciones de agente GUI: produce la siguiente acción a ejecutar sobre la interfaz (formato de prompt y salida definido en la model card del checkpoint base).
- Razonamiento de un solo paso con captura única: el flujo documentado usa una captura por paso.
- Memoria de historial limitada: mantiene hasta 8 pasos de historial de texto.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Entrada multimodal image-text-to-text (pipeline `image-text-to-text`).
- No se documentan capacidades de tool calling genérico, agentes multi-paso autónomos fuera del bucle de 8 pasos, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Investigación en agentes GUI móviles: sirve como punto de partida reproducible para experimentar con políticas de acción sobre pantallas Android, ya que el autor publica harnesses de benchmark y resultados en el repositorio del proyecto.
- Reproducción de evaluaciones: al ser el GGUF exacto sobre el que se ejecutaron las evaluaciones del autor, permite replicar sus resultados con la misma configuración de llama-server.
- Pruebas de concepto en dispositivos de gama alta: con Q4_K_M y 1,3 GB de repositorio, puede desplegarse en entornos con recursos limitados para validar flujos de automatización de UI en laboratorio.
- Generación de datos sintéticos de interacción: usar el modelo para proponer acciones sobre capturas y filtrar después con revisión humana, alimentando pipelines de datos para agentes móviles.
- Evaluación comparativa de modelos de agente móvil: sirve como baseline de ~2B parámetros frente a otros agentes GUI de mayor tamaño en experimentos académicos.
- Docencia y demostraciones: su tamaño reducido y su formato GGUF facilitan mostrar en un portátil cómo un modelo vision-language decide acciones sobre una pantalla, sin infraestructura de GPU dedicada.
- No se recomienda para automatización real de teléfonos con cuentas, mensajes o pagos, tal como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del repositorio del proyecto (`docs/results.md`), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (1,3 GB) y la cuantización Q4_K_M del modelo de lenguaje más el proyector Q8_0, el peso en memoria es del orden de 1-2 GB, a lo que hay que sumar la caché KV para 8192 tokens de contexto.
- GPU recomendadas: no se especifican en la información disponible. La configuración documentada usa `-ngl 99`, es decir, descarga todas las capas en GPU.
- GPU de consumo: por tamaño, es plausible en GPUs de consumo con 4-8 GB de VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector de visión; el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF | 1,73 B | 8192 (config. de servicio) | en | lfm1.0 | GGUF | Checkpoint de desarrollo, no recomendado por el autor |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | en | lfm1.0 (heredada) | no disponible | Versión principal recomendada por el autor |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | no disponible | lfm1.0 | safetensors, GGUF (LiquidAI/LFM3-VL-2B-GGUF) | Modelo base vision-language de propósito general |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe actuar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Checkpoint de desarrollo conservado solo para reproducibilidad; el propio autor recomienda la versión principal `LFM3-VL-2B-MobileAgent`.
- Solo objetivos en inglés; no se documenta soporte multilingüe.
- Una captura por paso y memoria limitada a 8 pasos de historial de texto: no hay memoria de largo plazo ni razonamiento multi-paso extendido.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento, lo que puede provocar un desajuste con el estado real del dispositivo (distribución de pantallas, retardos, errores de red).
- Riesgo de alucinación en la predicción de acciones no cuantificado en la información disponible; no hay benchmarks publicados.
- Sesgos conocidos: no documentados.
- Licencia LFM Open License v1.0 (lfm1.0): es una licencia "other", no OSI; deben revisarse sus términos antes de cualquier uso comercial, y se hereda del modelo base de Liquid AI.
- El proyector de visión no fue ajustado, por lo que las limitaciones de percepción visual del modelo base se mantienen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF
- Checkpoint base (safetensors): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel
- Versión principal recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guía de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
