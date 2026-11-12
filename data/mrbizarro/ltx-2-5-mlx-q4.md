# Mrbizarro/ltx-2.5-mlx-q4

## Resumen

LTX-2.5 MLX Q4 es una cuantización de 4 bits del modelo base Lightricks/LTX-2.5, adaptada para su ejecución en Apple Silicon mediante la librería MLX. El modelo original, desarrollado por Lightricks, es un sistema generativo multimodal de vídeo que cubre las modalidades text-to-video, image-to-video, audio-to-video y text-to-audio-video. Esta versión concreta, publicada por el usuario Mrbizarro, prioriza la inferencia local y offline en equipos Mac con chips de la serie M, reduciendo el peso del repositorio hasta 20,7 GB frente a los pesos completos del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de vídeo de última generación en hardware de consumo Apple, sin depender de GPUs dedicadas ni de servicios en la nube. El precio a pagar es una cuantización agresiva a 4 bits, que puede degradar la fidelidad visual y la coherencia temporal respecto al modelo original. El acceso está restringido en Hugging Face: es necesario aceptar la licencia comunitaria de LTX-2.x antes de descargar los pesos.

La información pública disponible sobre esta variante es limitada: no se detallan parámetros totales, longitud de contexto ni resultados de benchmarks. Los datos que se ofrecen a continuación se basan en los metadatos del repositorio y en las características conocidas del modelo base, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Lightricks/LTX-2.5, generación de vídeo multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (Q4) sobre MLX; el modelo base admite otros formatos no especificados |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, requiere aceptación) |
| Formato de pesos | MLX (repo de 20,7 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de LTX-2.5 en los metadatos proporcionados. Por el pipeline declarado (text-to-video) y las modalidades soportadas (texto, imagen, audio y vídeo), se trata de un modelo generativo multimodal orientado a la síntesis de vídeo, probablemente basado en difusión o en una arquitectura híbrida transformer-difusión, aunque este extremo no está confirmado en la información disponible.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica destacable de esta variante concreta es la cuantización a 4 bits y su portabilidad a MLX, lo que permite ejecutar el modelo en Apple Silicon con memoria unificada. No se documentan técnicas como decodificación especulativa o atención lineal en esta ficha.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen de referencia (image-to-video).
- Generación de vídeo a partir de audio (audio-to-video).
- Generación conjunta de audio y vídeo a partir de texto (text-to-audio-video).
- Ejecución local y offline en Apple Silicon mediante MLX.
- Soporte de cuantización 4-bit para reducir requisitos de memoria.
- Idioma de prompting: inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Prototipado de vídeo generativo en local: un desarrollador con un Mac de gama alta puede generar clips cortos a partir de prompts en inglés sin enviar datos a servicios externos, útil para pruebas de concepto y demos privadas.
- Creación de storyboards animados: a partir de una imagen fija (image-to-video), el modelo permite animar bocetos o ilustraciones para previsualizar secuencias antes de una producción mayor.
- Sincronización de vídeo con audio: la modalidad audio-to-video facilita generar visuales que acompañen una pista de audio existente, por ejemplo para visualizers musicales o contenido para redes.
- Generación de clips para redes sociales: con text-to-video se pueden producir fragmentos breves para pruebas de formato y estilo, siempre que el hardware local lo permita.
- Investigación en generación multimodal: sirve como banco de pruebas para estudiar el efecto de la cuantización 4-bit en la calidad de vídeo generado frente al modelo base completo.
- Flujos de trabajo con privacidad estricta: al ejecutarse offline en el equipo del usuario, es adecuado para entornos donde no se permite subir material audiovisual a la nube.
- Educación y experimentación: permite a estudiantes explorar modelos de difusión de vídeo en hardware Apple sin acceso a clústeres de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 20,7 GB, por lo que se requiere al menos esa cantidad de memoria unificada más el overhead de inferencia, lo que apunta a equipos con 32 GB o más.
- GPU recomendadas: chips Apple Silicon de la serie M (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) con memoria unificada suficiente; no aplica a GPUs NVIDIA o AMD en esta variante MLX.
- ¿Cabe en consumer GPU? No en el sentido tradicional (NVIDIA/AMD); está pensado para Apple Silicon. En Mac con 32 GB o más es plausible; en configuraciones de 16 GB es muy probable que no quepa.
- Opciones de despliegue: MLX (librería nativa); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mrbizarro/ltx-2.5-mlx-q4 | no disponible | no disponible | texto, imagen, audio, vídeo | ltx-2.x-community-license-agreement | gated, MLX |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | texto, imagen, audio, vídeo | ltx-2.x-community-license-agreement | gated, safetensors |
| Otros modelos de vídeo open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Cuantización 4-bit: puede introducir artefactos visuales, pérdida de detalle y menor coherencia temporal respecto al modelo base completo.
- Acceso restringido: requiere aceptar la licencia comunitaria de LTX-2.x en Hugging Face antes de descargar los pesos.
- Licencia "other": es imprescindible revisar los términos de la ltx-2.x-community-license-agreement para uso comercial; no se garantiza permiso de explotación comercial sin cumplir sus condiciones.
- Idioma: solo se declara soporte de inglés, lo que limita el prompting en castellano u otras lenguas.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir contenido incoherente, anatómicamente incorrecto o no fiel al prompt.
- Sesgos: no documentados en la información disponible, pero heredables del dataset de entrenamiento del modelo base.
- Hardware: dependencia exclusiva de Apple Silicon y MLX; no es portable a ecosistemas CUDA sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación ni reportes de calidad.
- No se documentan límites de longitud de vídeo, resolución ni duración de clips generados.

## Enlaces

- Hugging Face (variante MLX Q4): https://huggingface.co/Mrbizarro/ltx-2.5-mlx-q4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia comunitaria LTX-2.x: disponible en la página del modelo base en Hugging Face
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
