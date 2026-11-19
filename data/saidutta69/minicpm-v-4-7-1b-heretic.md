# saidutta69/MiniCPM-V-4.7-1B-heretic

## Resumen

MiniCPM-V-4.7-1B-heretic es una variante "abliterada" (decensurada) del modelo vision-language openbmb/MiniCPM-V-4.7-1B, publicada por el usuario saidutta69. Se ha generado con la herramienta Heretic v1.4.0 mediante ablación direccional de pesos, un método que identifica y edita las direcciones de activación responsables del comportamiento de rechazo en lugar de aplicar un fine-tuning adicional. El resultado conserva la torre de visión, el comportamiento OCR y el grounding del modelo original, pero reduce las negativas de 60/100 a 5/100 según la model card.

El modelo es un VLM (vision-language model) compacto pensado para ejecución en dispositivo: 1.010 millones de parámetros en la torre de texto y 550 millones en la torre de visión, 1.554 millones en total según los safetensors. Soporta entrada de imagen y texto, con capacidades declaradas de OCR, lectura de documentos y capturas de pantalla, grounding visual y razonamiento conversacional multi-turno. Su ventana de contexto no está especificada en la información disponible.

Su relevancia actual radica en dos factores: por un lado, es uno de los VLM más pequeños que mantiene visión funcional (la mayoría de conversiones GGUF de modelos VL descartan silenciosamente la torre de visión, mientras que esta incluye un proyector mmproj separado); por otro, ofrece una variante sin censura para casos de uso de roleplay, agentes locales y aplicaciones donde el modelo base rechaza peticiones legítimas. La licencia Apache 2.0 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de texto + torre de visión + merger), basada en MiniCPM-V 4.7 |
| Parámetros totales | 1.554.476.272 (1.01B texto + 0.55B visión) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS; safetensors en precisión original |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (texto + proyector mmproj separado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MiniCPM-V 4.7 de OpenBMB: una torre de texto de 1.01B parámetros y una torre de visión de 0.55B, unidas mediante un módulo merger que proyecta las representaciones visuales al espacio del modelo de lenguaje. La variante heretic no modifica esta arquitectura; aplica ablación direccional sobre las proyecciones de salida de atención (`attn.o_proj`) y las down-projections del MLP (`mlp.down_proj`), con una única dirección de rechazo para toda la red (direction_index 12.37), a diferencia de otras variantes del mismo autor que usan una dirección por capa.

Los datos de entrenamiento originales no están detallados en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). La model card indica que el modelo base parte de 60/100 rechazos, un nivel de alineamiento comparativamente ligero para un modelo de 1B, lo que implica que había menos comportamiento de rechazo que eliminar. La edición se realizó en el trial 169 de una ejecución de 200 trials de Heretic con semilla 4161231025. La divergencia KL respecto al base es 0.0351, un valor intermedio dentro de la colección del autor.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes: image-text-to-text con torre de visión funcional.
- OCR y lectura de documentos, capturas de pantalla y texto en imágenes.
- Grounding visual (localización de objetos o regiones en la imagen).
- Procesamiento de vídeo (etiqueta `video` en la model card).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües limitadas a inglés y chino.
- Modo "thinking" o razonamiento extendido: no disponible en la información.
- Variante decensurada: rechaza menos peticiones (5/100 frente a 60/100 del base), orientada a roleplay y uso local sin restricciones de contenido.

## Casos de uso

- **OCR y digitalización de documentos en dispositivo**: el modelo puede leer texto de facturas, formularios o capturas de pantalla directamente en un móvil o portátil sin conexión, gracias a su torre de visión de 0.55B y su huella de ~1.8 GB en cuantización Q4_K_M con proyector.
- **Asistente visual para accesibilidad**: descripción de imágenes y lectura en voz alta de contenido visual en tiempo real, ejecutable en hardware de gama baja (6 GB de VRAM o CPU).
- **Agentes locales de visión**: integración en pipelines de automatización que requieren interpretar capturas de pantalla o interfaces gráficas, con la ventaja de no depender de APIs externas y de no rechazar consultas por contenido.
- **Roleplay y narrativa interactiva multimodal**: la variante heretic permite conversaciones con personajes que reaccionan a imágenes adjuntas sin las negativas del modelo alineado, adecuada para prototipos de juegos o ficción interactiva.
- **Análisis de imágenes en entornos con requisitos de privacidad**: al ejecutarse localmente, evita enviar documentos o capturas a servicios en la nube, útil en sectores regulados.
- **Investigación sobre alineamiento y ablación**: sirve como caso de estudio reproducible (semilla, trial y parámetros publicados) para estudiar el efecto de la ablación direccional sobre el comportamiento de rechazo en modelos pequeños.
- **Prototipado rápido de VLM en consumer GPU**: con cuantizaciones desde 1.75 GB (texto + visión), permite iterar en una RTX 3060 o incluso en Apple Silicon sin infraestructura dedicada.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (openbmb/MiniCPM-V-4.7-1B) |
|---|---|---|
| Divergencia KL | 0.0351 | 0 (por definición) |
| Rechazos | 5/100 | 60/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que no incluye tabla de benchmarks porque el modelo base publica sus evaluaciones como imágenes no citables. La única afirmación textual es de OpenBMB: la variante 1B supera sustancialmente a Qwen3.5 0.8B en puntuación global y eficiencia de inferencia, sin cifras concretas.

## Requisitos de hardware

- **VRAM estimada (texto + visión, incluye proyector de 1.11 GB)**: Q8_0 ~2.19 GB; Q6_K ~1.95 GB; Q5_K_M ~1.86 GB; Q4_K_M ~1.78 GB; IQ4_XS ~1.75 GB.
- **VRAM estimada (solo texto)**: Q8_0 ~1.08 GB; Q6_K ~0.84 GB; Q5_K_M ~0.75 GB; Q4_K_M ~0.67 GB; IQ4_XS ~0.64 GB.
- **GPU recomendadas**: RTX 4090/5090 (24 GB) para Q8_0; RTX 4080/5080/4060 Ti 16G para Q6_K; RTX 3060/4070/5070 (12 GB) para Q5_K_M; RTX 4060/3070 (8 GB) para Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) para IQ4_XS.
- **Consumer GPU**: sí, cabe en GPUs de 6 GB en adelante e incluso en CPU-only o Apple Silicon con Q4_K_M.
- **Opciones de despliegue**: transformers (librería declarada), llama.cpp (soporte nativo de MiniCPM-V 4.7 con proyector mmproj), GGUF compatible con Ollama y otros runners de llama.cpp. vLLM y TGI no confirmados en la información disponible.
- **Latencia y throughput**: no disponibles. La model card añade ~1 GB de VRAM por cada 32K de contexto y advierte que el KV cache debe presupuestarse mayor que en un modelo de texto del mismo tamaño por el coste de los tokens de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-heretic | 1.55B (1.01B texto + 0.55B visión) | no disponible | Sí (mmproj separado) | Apache 2.0 | Variante decensurada; 5/100 rechazos |
| openbmb/MiniCPM-V-4.7-1B | 1.55B | no disponible | Sí | Apache 2.0 | Modelo base alineado; 60/100 rechazos |
| Qwen3.5-0.8B-heretic (saidutta69) | ~0.8B | no disponible | No (solo texto) | no disponible | Alternativa solo texto del mismo autor |
| Qwen3.5 0.8B | ~0.8B | no disponible | No | no disponible | OpenBMB afirma que MiniCPM-V 4.7 1B lo supera en puntuación global y eficiencia |

## Limitaciones y advertencias

- **Sesgos**: no documentados en la información disponible; al derivar de un modelo base con alineamiento ligero y haber eliminado la dirección de rechazo, es previsible que amplifique sesgos y contenido sensible sin filtro.
- **Alucinación**: riesgo inherente a modelos de 1B; la ablación no corrige la tendencia a inventar contenido, y la reducción de rechazos puede aumentar respuestas confiadas pero incorrectas.
- **Contexto e idioma**: solo inglés y chino; la longitud de contexto no está especificada, lo que dificulta planificar despliegues con documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir políticas de plataformas o normativas locales; la responsabilidad recae en el desplegador.
- **Producción**: la variante heretic no ha pasado por evaluaciones de seguridad; no se recomienda para aplicaciones orientadas al público sin filtros adicionales. La torre de visión no se cuantiza, por lo que el proyector de 1.11 GB es un coste fijo.
- **Compatibilidad**: el GGUF requiere cargar dos archivos (texto + mmproj) para entrada de imagen; usar solo el GGUF de texto desactiva la visión sin aviso.
- **Procedencia**: el autor es un particular (saidutta69), no OpenBMB; la reproducibilidad depende de la semilla y parámetros publicados, pero no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM-V-4.7-1B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo hermano solo texto: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
