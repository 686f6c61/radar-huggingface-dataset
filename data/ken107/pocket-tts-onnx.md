# ken107/pocket-tts-onnx

## Resumen

Pocket TTS ONNX es una exportación a formato ONNX con cuantización INT8 de los modelos pequeños de síntesis de voz en inglés de Kyutai Pocket TTS, preparada por el desarrollador ken107 para su ejecución directa en el navegador mediante onnxruntime-web. El repositorio incluye cuatro variantes de tamaño decreciente: 18,2 M parámetros (base), 18,2 M con ajuste fino por recompensa, 6,9 M con ajuste fino y 1,9 M con ajuste fino, todas derivadas de kyutai/pocket-tts.

El modelo resuelve el problema de disponer de TTS neuronal de baja latencia sin depender de servidores externos: al ejecutarse en el cliente, elimina el coste de infraestructura y los problemas de privacidad asociados al envío de texto a un backend. Su tamaño reducido (el repositorio completo ocupa 0,1 GB) permite cargarlo en páginas web y aplicar clonación de voz a partir de clips de referencia.

Es relevante ahora porque demuestra que la síntesis de voz con clonación puede ejecutarse íntegramente en el navegador con modelos de menos de 20 millones de parámetros, un orden de magnitud por debajo de los TTS convencionales. La ficha se centra en las variantes exportadas y en sus implicaciones de despliegue, no en el modelo original de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; pipeline TTS con componentes text_conditioner, flow_lm_main, flow_lm_flow, mimi_decoder y mimi_encoder |
| Parametros totales | 18,2 M (english_18m_2026-10 y english_18m_refl_2026-10); 6,9 M (english_7m_refl_2026-10); 1,9 M (english_2m_refl_2026-10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (exportación ONNX cuantizada) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (bundle.json, tokenizer.model, bos_before_voice.npy y modelos ONNX por componente) |

## Arquitectura y entrenamiento

El pipeline se descompone en cinco módulos ONNX: `text_conditioner` (procesamiento del texto de entrada), `flow_lm_main` y `flow_lm_flow` (modelo de lenguaje de flujo que genera las unidades acústicas), `mimi_decoder` (decodificador neuronal de audio) y `mimi_encoder` (codificador empleado para extraer el embedding de voz a partir de clips de referencia). El archivo `bundle.json` define los metadatos y el diseño del estado de streaming, lo que permite síntesis incremental por fragmentos en lugar de generar la locución completa de una vez. La clonación de voz se realiza a partir de clips de referencia, como los disponibles en kyutai/tts-voices.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el procedimiento exacto de RLHF o DPO del modelo original. La model card indica que las variantes `_refl_` han pasado por un ajuste fino por recompensa (reward fine-tuning) sobre el modelo base de 18,2 M, pero no detalla la función de recompensa ni los datos empleados. La exportación se realizó con el flujo de trabajo del directorio `export/` de ken107/piper-browser-extension, adaptado de lomotron/pocket-tts-onnx-export.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio generada por el decodificador Mimi.
- Clonación de voz zero-shot mediante clips de referencia procesados por `mimi_encoder`.
- Inferencia en streaming: el estado definido en `bundle.json` permite emitir audio de forma incremental.
- Ejecución en el navegador con onnxruntime-web, sin backend ni GPU dedicada.
- Cuatro perfiles de tamaño para ajustar el equilibrio entre calidad y coste computacional (18,2 M, 6,9 M y 1,9 M parámetros).
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Lectura por voz de artículos y documentación en sitios web: el modelo se carga en la página y sintetiza el texto en el cliente con onnxruntime-web, sin enviar contenido a un servidor y sin coste por petición.
- Accesibilidad para usuarios con discapacidad visual: integración en extensiones de navegador que leen el contenido de la pestaña activa con una voz clonada del propio usuario a partir de un clip de referencia.
- Aprendizaje de idiomas: reproducción de frases en inglés con distintas voces de referencia para practicar comprensión auditiva, generando el audio localmente y sin latencia de red.
- Prototipado de asistentes conversacionales: la variante de 1,9 M parámetros permite validar el flujo completo de texto a voz en un navegador antes de migrar a un modelo mayor en producción.
- Demostraciones y herramientas educativas de TTS: el repositorio sirve como ejemplo reproducible de exportación ONNX INT8 y de integración con onnxruntime-web, útil para quienes quieran replicar el pipeline con otros modelos.
- Generación de avisos hablados en aplicaciones web offline o con conectividad intermitente: al no requerir backend, el audio se produce aunque el usuario pierda la conexión tras la carga inicial de los pesos.
- Clonación de voz para doblaje de contenido propio: con consentimiento explícito y clips de referencia del hablante autorizado, la variante de 18,2 M con ajuste por recompensa ofrece la mayor calidad del conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MOS, WER, latencia ni comparaciones cuantitativas entre las cuatro variantes.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en onnxruntime-web, el consumo se produce en memoria del navegador. Con pesos INT8 de 18,2 M parámetros, la huella ronda decenas de MB, aunque no se especifica una cifra oficial.
- GPU recomendadas: no aplica en el escenario objetivo (navegador). Para ejecución nativa con onnxruntime se puede usar cualquier GPU compatible con CUDA, pero no hay recomendaciones publicadas.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con unos pocos cientos de MB libres es suficiente, aunque la vía prevista es CPU o WebGPU del navegador.
- Opciones de despliegue: onnxruntime-web en el navegador (caso documentado), onnxruntime nativo y, potencialmente, otros runtimes compatibles con ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de streaming sugiere baja latencia por fragmento, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Ejecucion en navegador |
|---|---|---|---|---|---|---|
| ken107/pocket-tts-onnx (18,2 M) | 18,2 M | No disponible | Inglés | CC BY 4.0 | ONNX INT8 | Sí, onnxruntime-web |
| ken107/pocket-tts-onnx (1,9 M) | 1,9 M | No disponible | Inglés | CC BY 4.0 | ONNX INT8 | Sí, onnxruntime-web |
| kyutai/pocket-tts (original) | No disponible | No disponible | Inglés | CC BY 4.0 | No disponible | No documentado |
| Piper (referencia de TTS en navegador) | No disponible | No disponible | Múltiples | No disponible | ONNX | Sí |

La comparación con Piper se incluye por ser el referente habitual de TTS ONNX en navegador, pero no se dispone de datos verificados de parámetros ni licencia en la información proporcionada. No se han publicado comparativas de calidad entre estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado cobertura multilingüe.
- No hay datos publicados sobre sesgos, calidad de síntesis ni robustez ante texto con ruido, abreviaturas o símbolos.
- Riesgo de alucinación acústica y de artefactos en la pronunciación de nombres propios y términos técnicos, inherente a los modelos TTS pequeños.
- La clonación de voz sin consentimiento explícito y lícito del hablante está prohibida por la licencia del modelo original; también lo están la suplantación de identidad, la desinformación y la generación de contenido difamatorio o que invada la privacidad.
- Uso comercial permitido bajo CC BY 4.0, pero con obligación de atribución a Kyutai y a los autores de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación ni de mantenimiento a largo plazo.
- La fecha de creación indicada (2026-10-25) es posterior a la de esta ficha; conviene verificar la vigencia de los archivos antes de integrarlos en producción.
- No se documentan mecanismos de control de prosodia, velocidad ni emoción más allá de la elección de la voz de referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ken107/pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Sección de usos prohibidos del modelo base: https://huggingface.co/kyutai/pocket-tts#prohibited-use
- Voces de referencia: https://huggingface.co/kyutai/tts-voices
- Flujo de exportación: https://github.com/ken107/piper-browser-extension/tree/pockettts/export
- Código de inferencia: https://github.com/ken107/piper-browser-extension/blob/pockettts/web/src/pocket.ts
- Exportador de referencia: https://github.com/lomotron/pocket-tts-onnx-export
- Demo: https://pocket.ttstool.com
- Kyutai: https://kyutai.org
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
