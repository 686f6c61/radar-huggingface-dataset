# moravianai/ThinCtx-Qwen3.5-4B-small

## Resumen

ThinCtx-Qwen3.5-4B-small es una conversión del modelo Qwen3.5-4B realizada por Moravian AI mediante su técnica propietaria ThinCtx, orientada a reducir drásticamente el consumo de memoria GPU asociado al contexto largo. El modelo mantiene los 4.210 millones de parámetros del original, pero cuantiza los pesos a aproximadamente 5,4 bits por peso y comprime el almacén de contexto en RAM del sistema entre 2,5 y 3 veces, lo que permite ejecutar conversaciones de hasta 540.000 tokens en una GPU de 24 GB, escenario en el que el modelo original no cabe.

La propuesta central es desacoplar el coste de memoria del contexto: la parte de contexto residente en GPU es pequeña y crece a un ritmo de aproximadamente 1,7 KB por token, frente a los 32 KB por token del modelo original, es decir, unas 19 veces más lento. El contexto completo se almacena en memoria del sistema, no en VRAM, lo que cambia por completo el perfil de despliegue para aplicaciones de documentos largos o conversaciones multi-turno extensas.

El modelo se distribuye bajo licencia PolyForm Small Business 1.0.0, con acceso gratuito para pequeñas empresas, uso personal, investigación no comercial y evaluación, y requiere licencia comercial para organizaciones mayores en producción. Está calibrado y probado en inglés, checo y alemán, y depende del runtime propio `thinctx` (versión 1.0.1 o superior recomendada), por lo que no es compatible con vLLM, llama.cpp ni otras bibliotecas de inferencia convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5 text, tipo `qwen3_5_text`) con runtime ThinCtx para gestión de contexto |
| Parametros totales | 4.210 millones (4,21B); el recuento de 4.893.696 en safetensors corresponde solo a los tensores de 16 bits |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens en GPU de consumo; hasta ~540k tokens en GPU de 24 GB |
| Tipos de cuantizacion | Pesos cuantizados a ~5,4 bits por peso (capas transformer); contexto en RAM comprimido 2,5–3× |
| Idiomas soportados | Multilingüe; calibrado y probado en inglés (en), checo (cs) y alemán (de) |
| Licencia | PolyForm Small Business 1.0.0 (otros usos requieren licencia comercial) |
| Formato de pesos | safetensors (pesos cuantizados empaquetados en `aux1.safetensors`) |
| Modelo base | moravianai/ThinCtx-Qwen3.5-4B (a su vez derivado de Qwen/Qwen3.5-4B) |
| Runtime requerido | thinctx >= 0.3.1; recomendado >= 1.0.1 |
| Tamaño del repositorio | 3,63 GB (frente a 8,94 GB de la variante de 16 bits) |
| Memoria GPU estimada | 4,0 GB a 128k tokens; 4,7 GB a 540k tokens |
| Coste de contexto en GPU | ~1,7 KB por token (frente a ~32 KB del original) |
| Plataformas | Linux x86_64 y Windows 10/11 vía WSL2 con GPU NVIDIA; macOS no soportado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4,21B parámetros, y aplica sobre él la transformación ThinCtx de Moravian AI. Esta transformación no reentrena el modelo desde cero: cuantiza los pesos de las capas transformer a aproximadamente 5,4 bits por peso y sustituye la caché KV convencional por un mecanismo de almacenamiento de contexto comprimido que reside principalmente en memoria del sistema, manteniendo en GPU únicamente una fracción pequeña y de crecimiento lento. El resultado es que el coste de memoria por token en GPU cae de unos 32 KB a unos 1,7 KB.

El contexto completo se guarda en RAM del sistema con una compresión de 2,5 a 3 veces respecto al almacén de 16 bits, lo que reduce también los requisitos de memoria del host. A partir de thinctx 1.0, las conversaciones que comparten el mismo system prompt reutilizan su memoria tanto en GPU como en RAM del sistema (en Linux), de modo que cada conversación adicional añade solo un coste marginal. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada; la model card se centra en el proceso de conversión y en las mediciones de memoria y rendimiento.

La innovación técnica principal es, por tanto, de índole de despliegue más que de arquitectura del modelo base: permite sostener contextos de cientos de miles de tokens en hardware de gama consumer-profesional (24 GB de VRAM) a costa de una lectura de prompts largos más lenta que la del modelo base. El calibrado y las pruebas se realizaron específicamente en inglés, checo y alemán.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta ~540k tokens en GPU de 24 GB).
- Razonamiento y respuesta sobre documentos extensos completos sin truncado, gracias al almacenamiento del contexto en RAM del sistema.
- Function calling / tool calling: la model card reporta un rendimiento en BFCL de 89,0 frente a 89,5 del original sobre los mismos ítems, es decir, prácticamente a la par.
- Soporte de modo thinking mediante el parámetro `enable_thinking` expuesto en la API compatible con OpenAI.
- Capacidades multilingües calibradas en inglés, checo y alemán, además de la cobertura multilingüe heredada del modelo base.
- Servido mediante API compatible con OpenAI chat-completions (`/v1/chat/completions`), con streaming y no streaming, y autenticación HTTP básica opcional.
- Uso del chat template de Qwen3.5 para chat y tool calling.
- Compartición de memoria entre conversaciones con el mismo system prompt (thinctx >= 1.0, solo Linux nativo).

## Casos de uso

- Análisis de documentos largos: procesar contratos, informes técnicos o expedientes de cientos de miles de tokens en una única GPU de 24 GB, manteniendo el contexto completo en RAM del sistema en lugar de truncarlo o trocearlo con RAG.
- Asistentes de código sobre repositorios completos: cargar grandes volúmenes de código fuente y mantener conversaciones multi-turno con contexto persistente, aprovechando que el coste de memoria por token en GPU es de ~1,7 KB.
- Atención al cliente con historial extenso: gestionar conversaciones de larga duración donde el historial completo debe permanecer disponible, con la ventaja de que las conversaciones que comparten system prompt reutilizan memoria en Linux.
- Agentes con tool calling en producción: integrar el modelo en pipelines de agentes mediante la API compatible con OpenAI, apoyándose en el rendimiento BFCL de 89,0 para invocación de funciones.
- Despliegue en hardware de gama consumer-profesional: servir el modelo en tarjetas de 24 GB (por ejemplo, RTX 4090 o RTX 5060 Ti) donde el Qwen3.5-4B original con contexto de 128k no cabe, reduciendo coste de infraestructura.
- Aplicaciones multilingües para el mercado centroeuropeo: uso en inglés, checo y alemán, los idiomas sobre los que el modelo está calibrado y probado.
- Investigación y evaluación de técnicas de gestión de contexto: estudiar el comportamiento de modelos con contexto comprimido en RAM frente a caché KV tradicional, bajo la licencia gratuita para investigación no comercial.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-4B-small | Qwen3.5-4B original | Notas |
|---|---|---|---|
| BFCL (function calling) | 89,0 | 89,5 | Medido sobre los mismos ítems |
| Memoria GPU a 128k tokens | 4,0 GB | 12,0 GB | Reducción ~3× |
| Memoria GPU a 540k tokens | 4,7 GB | 24,5 GB | El original no cabe en 24 GB |
| Coste de contexto en GPU por token | ~1,7 KB | ~32 KB | Crecimiento ~19× más lento |
| Descarga de pesos | 3,63 GB | 8,94 GB (variante ThinCtx 16-bit) | — |

No se han publicado resultados de benchmarks de razonamiento general (MMLU, GSM8K, HumanEval) en la información disponible. La model card solo reporta BFCL y métricas de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,0 GB a 128k tokens de contexto y 4,7 GB a 540k tokens, según la model card.
- GPU recomendadas: NVIDIA con 24 GB para contextos de ~540k tokens; tarjetas de 8–16 GB son suficientes para contextos de 128k. La model card cita mediciones en una RTX 5060 Ti.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 5060 Ti y similares con suficiente VRAM; el modelo original con contexto largo no cabe en 24 GB.
- Memoria del sistema: el contexto completo reside en RAM del host, comprimido 2,5–3× respecto al almacén de 16 bits.
- Opciones de despliegue: exclusivamente el runtime `thinctx` (CLI `thinctx chat`, servidor `thinctx serve` con API compatible con OpenAI, y API Python `thinctx.load`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Plataformas: Linux x86_64 o Windows 10/11 vía WSL2 con GPU NVIDIA; macOS no soportado. Requiere driver con soporte CUDA 13 para el wheel por defecto de PyTorch 2.11 (o instalar el wheel cu128 con drivers antiguos).
- Latencia y throughput: la model card indica que la lectura de prompts largos es más lenta que en el modelo base y que la generación con los pesos compactos es 2,6× más rápida con thinctx 1.0.1 que con 1.0.0 en una RTX 5060 Ti. No se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria GPU (128k) | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-4B-small | 4,21B | 128k–540k | 4,0 GB | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-4B | 4,21B | 128k–540k | 4,0 GB (contexto), pesos 16-bit | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-4B (original) | 4,21B | 128k | 12,0 GB | según Qwen | ecosistema estándar (vLLM, etc.) |

La comparativa con modelos de otros fabricantes no está disponible en la información proporcionada. Frente a las dos variantes de la propia familia ThinCtx, la versión `-small` reduce la descarga de 8,94 GB a 3,63 GB y comprime el contexto en RAM 2,5–3×, a cambio de cuantizar los pesos a ~5,4 bits; el rendimiento en BFCL se mantiene esencialmente idéntico (89,0 frente a 89,5 del original).

## Limitaciones y advertencias

- Dependencia total del runtime propietario `thinctx`: no funciona con vLLM, llama.cpp, Ollama, TGI ni otras bibliotecas estándar, lo que limita la portabilidad y la integración con ecosistemas existentes.
- Plataformas restringidas: solo Linux x86_64 y Windows vía WSL2 con GPU NVIDIA; macOS no está soportado.
- La compartición de memoria entre conversaciones con el mismo system prompt es exclusiva de Linux nativo; en WSL no está disponible.
- Lectura de prompts largos más lenta que el modelo base, lo que puede penalizar cargas de trabajo con prompts muy extensos y poca generación.
- Cuantización agresiva de pesos (~5,4 bits): aunque BFCL se mantiene, no se publican resultados de benchmarks de razonamiento general que permitan descartar degradación en otras tareas.
- Calibración y pruebas limitadas a inglés, checo y alemán; el rendimiento en otros idiomas no está verificado.
- Licencia PolyForm Small Business 1.0.0: el uso comercial en organizaciones que superen el umbral de "small business" requiere licencia de pago (contacto info@moravian.ai); existen además campos de gating con nombre, empresa y correo.
- Riesgo de alucinación inherente a los modelos de 4B parámetros, no mitigado específicamente según la información disponible; no se documentan sesgos conocidos.
- El recuento de parámetros mostrado por Hugging Face (4.893.696) es engañoso: solo cuenta tensores de 16 bits, no los pesos cuantizados empaquetados en `aux1.safetensors`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B-small
- Variante de 16 bits: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio de Moravian AI: https://moravian.ai/
- Contacto para licencia comercial: info@moravian.ai
