# mradermacher/lure-tts-0.6b-preview-GGUF

## Resumen

Lure TTS 0.6B Preview es un modelo de texto a voz (TTS) de 602.341.376 parámetros (aproximadamente 0,6 mil millones) publicado por el usuario smirki en HuggingFace. El repositorio que nos ocupa no contiene los pesos originales, sino la colección de cuantizaciones GGUF generadas por mradermacher a partir de dicho modelo base, con el objetivo de permitir su ejecución en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo se distribuye con etiquetas que indican clonación de voz y habla expresiva, y está marcado explícitamente como "preview", es decir, una versión preliminar que puede cambiar.

El problema que resuelve es el habitual en el ecosistema TTS: los modelos de síntesis de voz con capacidades de clonación suelen publicarse en formato PyTorch/safetensors con requisitos de VRAM y dependencias pesadas. La aportación de este repositorio es ofrecer variantes cuantizadas estáticas desde Q2_K (0,3 GB) hasta f16 (1,3 GB), además de dos ficheros `mmproj` (proyector multimodal) que, por la estructura típica de estos pipelines, probablemente codifican el embedding de referencia para la clonación de voz, aunque el autor no lo documenta.

Es relevante ahora porque permite evaluar un TTS pequeño (sub-1B) en hardware de consumo, incluso en CPU, sin renunciar a las funciones de clonación y expresividad que anuncia el modelo base. Ahora bien, la información pública disponible es muy escasa: no hay model card técnica, no se detalla la arquitectura, no se especifica la licencia y no se han publicado benchmarks, por lo que cualquier evaluación de calidad debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de texto a voz basado en `transformers`; no se detalla la topología interna) |
| Parametros totales | 602.341.376 (dato real de safetensors del modelo base) |
| Longitud de contexto | no disponible (no se especifica límite de texto de entrada ni ventana de contexto) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (el repositorio no declara licencia; la del modelo base tampoco se indica) |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp a partir de pesos HF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `smirki/lure-tts-0.6b-preview`. La única evidencia estructural es indirecta: el repositorio incluye ficheros `mmproj` (proyector multimodal, en variantes Q8_0 y f16), lo que sugiere un pipeline de dos componentes en el que un proyector traduce una entrada auxiliar (muy probablemente audio de referencia para la clonación de voz) a un espacio que el modelo principal consume. Asimismo, los metadatos de conversión (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`) confirman que los GGUF se derivaron de pesos en formato HuggingFace mediante el conversor estándar de llama.cpp.

Tampoco hay datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas. Las etiquetas del modelo (`voice-cloning`, `expressive-speech`, `preview`) indican las dos capacidades que el autor destaca, pero no cómo se han conseguido. Cualquier afirmación sobre el entrenamiento sería especulativa y no debe tomarse como dato verificado.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés: es la función principal declarada por el pipeline `text-to-speech`.
- Clonación de voz: etiqueta `voice-cloning` en el modelo base; la presencia de ficheros `mmproj` apunta a un mecanismo de acondicionamiento por audio de referencia.
- Habla expresiva: etiqueta `expressive-speech`, orientada a prosodia y entonación no plana.
- Ejecución en formato GGUF mediante llama.cpp y runtimes compatibles, incluida la posibilidad de inferencia en CPU.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de HuggingFace), lo que facilita el despliegue como servicio HTTP.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada como tarea principal (más allá de la referencia de voz) ni capacidades multilingües: el modelo declara únicamente inglés.

## Casos de uso

- Generación de audiolibros y contenido largo en inglés: el modelo puede sintetizar narración con una voz consistente usando una muestra de referencia; su tamaño de 0,6B permite procesar horas de texto en hardware modesto, aunque la calidad debe validarse empíricamente al tratarse de un preview.
- Prototipado de asistentes de voz: integrado en un pipeline ASR + LLM + TTS, sirve para construir demos funcionales de asistentes conversacionales sin depender de APIs externas, ejecutando la parte TTS en local.
- Doblaje y localización de contenido para inglés: la clonación de voz permite mantener el timbre de un locutor original al regenerar pistas de audio en inglés.
- Accesibilidad y lectura de pantalla: conversión de artículos, documentación o notificaciones a voz con una ventana de latencia baja gracias a las cuantizaciones Q4_K_S/Q4_K_M (0,4-0,5 GB).
- Pruebas de regresión en pipelines de TTS: al ser un modelo pequeño y determinista en cuanto a formato, resulta útil como componente de test en CI para validar cadenas de audio-a-texto y text-to-audio sin coste de GPU dedicada.
- Generación de voces para videojuegos y prototipos de animación: creación de conjuntos de voces de personajes mediante clonación a partir de muestras cortas, en fases de preproducción donde no se requiere calidad de estudio.
- Investigación en cuantización: el repositorio ofrece 12 variantes de cuantización más dos proyectores, lo que lo convierte en un banco de pruebas para medir la degradación perceptual de audio entre Q2_K y f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas objetivas (MOS, WER de ASR inverso, similitud de hablante, SECS) ni comparaciones cuantitativas con otros sistemas TTS. La única referencia de calidad que aporta el autor es cualitativa: marca Q6_K como "very good quality", Q8_0 como "fast, best quality" y Q3_K_M como "lower quality".

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 1,3 GB en f16, 0,7 GB en Q8_0, 0,5 GB en Q4_K_M/Q5_K_M, 0,4 GB en Q4_K_S/IQ4_XS, 0,3 GB en Q2_K. Hay que sumar el proyector multimodal si se usa clonación de voz (0,5-0,7 GB adicionales) y el overhead de runtime, KV cache y decodificador de audio.
- Estimación práctica de VRAM total: entre 2 y 4 GB en configuraciones típicas con Q4_K_M o Q5_K_M más `mmproj`, y en torno a 3-4 GB con f16.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). Para servir múltiples peticiones concurrentes conviene una A100/H100 o L40S, pero por tamaño del modelo no es un requisito de capacidad de memoria.
- Cabe en GPU de consumo: sí, con margen amplio. Incluso es viable la inferencia solo en CPU, dado que el modelo completo en Q4_K_M ocupa 0,5 GB.
- Opciones de despliegue: llama.cpp y binarios derivados; el repositorio declara compatibilidad con endpoints. El soporte real de arquitecturas TTS en llama.cpp y en Ollama depende de que el runtime haya implementado el grafo específico de este modelo, algo que no se confirma en la información disponible; conviene verificarlo antes de planificar producción.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor), tokens de audio por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lure TTS 0.6B Preview (esta ficha) | 602 M | inglés | no disponible | GGUF (12 cuantizaciones) + mmproj | Preview, sin benchmarks ni model card técnica |
| XTTS-v2 (Coqui) | ~467 M | 17 idiomas | CPML (uso no comercial) | safetensors / PyTorch | Referencia en clonación de voz zero-shot; requiere aceptar la licencia |
| Kokoro-82M | ~82 M | inglés (principalmente) | Apache-2.0 | safetensors / ONNX / GGUF | Mucho más pequeño y rápido; sin clonación zero-shot nativa por referencia |
| Parler-TTS mini v1 | ~880 M | inglés | Apache-2.0 | safetensors / PyTorch | Control de estilo mediante descripción textual, no clonación por audio |

Los datos de los modelos comparados provienen de sus fichas públicas y deben verificarse en la fuente original antes de tomar decisiones de producción. La ventaja competitiva de esta ficha es la disponibilidad de cuantizaciones GGUF extremadamente ligeras; su desventaja es la ausencia de licencia declarada y de cualquier documentación técnica o evaluación.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia ni en este repositorio ni de forma explícita en el modelo base, no se puede asumir permiso de uso comercial. Es un bloqueante para cualquier despliegue en producto hasta aclararlo con el autor.
- Estado "preview": el propio nombre indica versión preliminar; no hay garantía de estabilidad de pesos, API ni compatibilidad futura.
- Idioma único: solo inglés. El uso con texto en castellano u otros idiomas no está soportado y previsiblemente producirá una pronunciación incorrecta o ininteligible.
- Sin benchmarks ni evaluaciones publicadas: no existen métricas de inteligibilidad, naturalidad ni fidelidad de clonación, por lo que la calidad debe medirse internamente.
- Riesgo de artefactos acústicos: en modelos TTS pequeños, las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan típicamente la calidad del audio generado; el propio autor califica Q3_K_M como "lower quality". No se han publicado mediciones de dicha degradación.
- Riesgo de alucinación en sentido TTS: omisiones, repeticiones, alargamiento de sílabas o invención de contenido en pasajes largos o con puntuación atípica. Requiere validación con ASR inverso en producción.
- Clonación de voz y consentimiento: la capacidad de clonar voces implica riesgos legales y éticos (suplantación, deepfakes). Es responsabilidad del desplegador obtener consentimiento explícito y cumplir la normativa aplicable (por ejemplo, el AI Act en la UE).
- Sesgos: no documentados. En TTS los sesgos se manifiestan en cobertura acentual, calidad desigual entre voces de referencia y sesgos de género o procedencia en las muestras de entrenamiento; no hay información al respecto.
- Madurez del tooling: la inferencia de arquitecturas TTS sobre GGUF en llama.cpp/Ollama no está garantizada por el repositorio; el soporte puede ser parcial o requerir conversiones adicionales.
- Ficheros `mmproj` sin documentar: su función exacta (presumiblemente acondicionamiento por audio de referencia) no está descrita, lo que complica la integración.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lure-tts-0.6b-preview-GGUF
- Modelo base: https://huggingface.co/smirki/lure-tts-0.6b-preview
- Página de resumen y descargas de cuantizaciones: https://hf.tst.eu/model#lure-tts-0.6b-preview-GGUF
- Cuantización Q4_K_M: https://huggingface.co/mradermacher/lure-tts-0.6b-preview-GGUF/resolve/main/lure-tts-0.6b-preview.Q4_K_M.gguf
- Cuantización Q8_0: https://huggingface.co/mradermacher/lure-tts-0.6b-preview-GGUF/resolve/main/lure-tts-0.6b-preview.Q8_0.gguf
- Proyector multimodal mmproj-f16: https://huggingface.co/mradermacher/lure-tts-0.6b-preview-GGUF/resolve/main/lure-tts-0.6b-preview.mmproj-f16.gguf
- Guía general de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de las cuantizaciones: https://www.nethype.de/
