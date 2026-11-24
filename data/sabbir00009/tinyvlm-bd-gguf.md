# sabbir00009/tinyvlm-bd-gguf

## Resumen

TinyVLM-BD es un ajuste fino de Google Gemma 3n E4B orientado a la comprensión de documentos bilingües bangla-inglés: texto impreso, facturas y recibos, manuscritos y recetas médicas manuscritas. Lo publica el usuario sabbir00009 en Hugging Face y su particularidad es que se distribuye ya convertido a GGUF para ejecutarse con llama.cpp y libmtmd de forma totalmente offline en un teléfono Android, a través de una aplicación propia (TinyVLM BD) que descarga una sola vez los dos ficheros del repositorio.

El modelo hereda la arquitectura multimodal de Gemma 3n E4B (transformer con proyector visual MobileNetV5) y conserva la licencia Gemma de Google. El repositorio ocupa 5,4 GB e incluye una cuantización Q4_K_M del modelo de lenguaje (4,51 GiB) y un proyector visual en f16 (0,56 GiB). Los parámetros totales declarados en safetensors son 6.868.990.448.

Su relevancia es acotada pero clara: cubre el nicho de VQA documental en bangla en dispositivo, un idioma con poca cobertura en modelos multimodales abiertos, y lo hace con un empaquetado listo para producción móvil. No hay métricas publicadas, descargas ni validación externa, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 3n E4B) con proyector visual MobileNetV5 |
| Parametros totales | 6.868.990.448 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y f16 (proyector visual) |
| Idiomas soportados | bn (bangla), en (inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp / libmtmd) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3n-E4B-it, un modelo multimodal de Google diseñado para ejecución en dispositivo. La parte de lenguaje se distribuye cuantizada en Q4_K_M y la torre visual se mantiene en f16 como proyector independiente (mmproj) con arquitectura MobileNetV5, el esquema habitual de llama.cpp para modelos visión-lenguaje. El pipeline declarado es image-text-to-text.

No se dispone de información sobre el dataset de ajuste fino: número de pares imagen-texto, composición entre texto impreso, facturas, manuscritos y recetas, ni si se aplicaron técnicas de alineación adicionales (SFT, DPO, RLHF). Tampoco se documentan innovaciones técnicas propias más allá de la conversión a GGUF y el empaquetado para la app Android. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Respuesta a preguntas sobre imágenes de documentos (document VQA) en bangla e inglés.
- Reconocimiento de texto impreso (OCR) y extracción de campos en facturas y recibos.
- Interpretación de escritura manuscrita, incluida la de recetas médicas.
- Generación de texto conversacional multimodal (pipeline image-text-to-text).
- Ejecución totalmente offline en dispositivo mediante llama.cpp y libmtmd.
- Integración con la app TinyVLM BD para Android, que descarga los pesos una vez.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Digitalización de facturas y recibos en bangla: el modelo recibe la foto del ticket y responde a preguntas sobre importes, fechas y comercios, lo que permite construir una app de contabilidad personal sin conexión.
- Lectura de recetas médicas manuscritas: en un entorno clínico o de farmacia, se fotografía la receta y se pide una transcripción o aclaración de la pauta; el propio autor advierte que la respuesta debe confirmarse siempre con un médico o farmacéutico.
- Asistencia a personas con baja alfabetización: la app puede leer en voz alta el contenido de un documento oficial o un formulario en bangla, aprovechando la inferencia local para preservar la privacidad del usuario.
- Procesamiento de documentos en zonas con conectividad limitada: al ejecutarse íntegramente en el teléfono, es adecuado para trabajo de campo, ONG o administración local donde no hay red fiable.
- Extracción de datos estructurados de formularios bilingües bangla-inglés: útil para digitalizar archivos en papel de pequeñas empresas o cooperativas sin enviar documentos sensibles a la nube.
- Prototipado de VQA documental en bangla: sirve como base para investigadores que necesiten un punto de partida cuantizado y ligero antes de entrenar su propio ajuste con más datos.
- Demostración educativa de modelos multimodales en dispositivo: permite mostrar en un taller cómo funciona un VLM con llama.cpp en hardware móvil sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos suman aproximadamente 5,07 GiB (4,51 GiB del LM en Q4_K_M más 0,56 GiB del proyector en f16); se necesita algo más de memoria para el contexto y los buffers de cómputo, por lo que conviene contar con 6-8 GB de RAM/VRAM libres.
- GPU de escritorio: cabe en tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070). En A100 o H100 se ejecuta sin problema, aunque el modelo está pensado para hardware mucho menor.
- GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM; también puede ejecutarse en CPU.
- Móvil: el destino principal es Android con llama.cpp y libmtmd; el tamaño del repo (5,4 GB) y la cuantización Q4_K_M están elegidos para ese escenario.
- Despliegue: llama.cpp y libmtmd son los soportes documentados. vLLM, TGI u Ollama no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TinyVLM-BD (este) | 6.868.990.448 | no disponible | bn, en | Gemma | GGUF |
| google/gemma-3n-E4B-it | no disponible en la informacion | no disponible | multilingue | Gemma | safetensors |
| Alternativas abiertas de VQA documental en bangla | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa posible es con el modelo base: TinyVLM-BD añade el ajuste a documentos bangla-inglés y el empaquetado GGUF para móvil, a costa de perder la distribución en safetensors y de no documentar el proceso de ajuste. No se dispone de información sobre otros modelos comparables en esta categoría concreta.

## Limitaciones y advertencias

- El propio autor advierte de que las respuestas pueden ser erróneas; en el caso de recetas médicas exige confirmación por un médico o farmacéutico.
- No hay benchmarks publicados ni validación externa: el rendimiento real en OCR y VQA documental es desconocido.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que sugiere ausencia de uso comunitario verificable.
- La licencia Gemma Terms of Use impone restricciones específicas al uso comercial y a la redistribución; hay que revisarlas antes de integrar el modelo en un producto.
- Cobertura lingüística limitada a bangla e inglés; no se documenta comportamiento en otros idiomas.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominios sensibles como la salud.
- Solo se distribuye en GGUF Q4_K_M y f16 para el proyector; no hay versiones de mayor precisión ni safetensors del ajuste.
- El ajuste fino no está documentado: se desconoce el volumen y la calidad de los datos empleados, lo que impide estimar su robustez fuera del dominio de la app.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sabbir00009/tinyvlm-bd-gguf
- Modelo base: https://huggingface.co/google/gemma-3n-E4B-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- llama.cpp: https://github.com/ggml-org/llama.cpp
