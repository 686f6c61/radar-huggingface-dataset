# HeyBolo/s1-mini-mlx-4bit

## Resumen

HeyBolo/s1-mini-mlx-4bit es una cuantización a 4 bits en formato MLX del modelo superwhisper/s1-mini, un modelo especializado en la limpieza y el formateo de texto dictado («dictation clean-up»). Lo publica el usuario HeyBolo para que la aplicación de dictado Bolo, en macOS, lo descargue automáticamente cuando el usuario activa la opción «Smart formatting» en su equipo. No se ha modificado nada más allá de la precisión de los pesos: mismo tokenizador, misma plantilla de chat y mismo formato de prompt que el modelo original.

El modelo base es un derivado de Qwen3-0.6B (Copyright 2024 Alibaba Cloud), por lo que hereda la arquitectura transformer densa de la familia Qwen3 y un tamaño de aproximadamente 596 millones de parámetros. Su función no es la de un asistente conversacional general, sino la de un post-procesador de transcripciones: recibe el texto crudo de un sistema de reconocimiento de voz y devuelve ese mismo texto con puntuación, mayúsculas y formato coherentes.

Su relevancia es acotada pero clara: permite ejecutar localmente en Apple Silicon una tarea de post-proceso lingüístico con un consumo de disco de 0,3 GB y sin dependencia de la nube. La contrapartida es que se trata de un artefacto muy específico, sin métricas publicadas, sin descargas ni validación comunitaria en el momento de redactar esta ficha y atado al ecosistema MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), derivado de Qwen3-0.6B; pesos cuantizados a 4 bits en formato MLX |
| Parámetros totales | 596.049.920 (≈0,6B), según los safetensors del repositorio |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-0.6B declara 32.768 tokens de contexto nativo (dato heredado, no confirmado para este fine-tune) |
| Tipos de cuantización | 4 bits, generada con `mlx_lm.convert --hf-path superwhisper/s1-mini -q --q-bits 4` |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 con cláusula adicional de Superwhisper: toda uso, distribución o integración debe identificar el modelo por su nombre original, «S1-mini» by «Superwhisper», con esa capitalización exacta |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B: un transformer denso decoder-only con atención causal, del que este repositorio no altera la topología. La operación aplicada es exclusivamente de compresión: los pesos originales en superwhisper/s1-mini se convierten a 4 bits mediante la herramienta de cuantización de MLX, manteniendo tokenizador, plantilla de chat y formato de prompt sin cambios. No hay, por tanto, ningún reentrenamiento ni ajuste posterior a la cuantización.

No se dispone de información sobre los datos de entrenamiento del modelo original: la model card de esta cuantización no detalla el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas más allá de la propia cuantización, ni mecanismos de decodificación especulativa o atención lineal. Lo único verificable es la cadena de derivación: s1-mini es un derivado de Qwen3-0.6B y esta versión es una cuantización de s1-mini.

## Capacidades

- Limpieza de dictado: corrección de puntuación, mayúsculas, espaciado y formato sobre transcripciones de voz.
- Formateo inteligente («Smart formatting»): estructura el texto dictado según el contexto de la aplicación de destino.
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Ejecución local en Apple Silicon mediante MLX, sin llamadas a servicios externos.
- Compatibilidad con la plantilla de chat y el formato de prompt originales de s1-mini, lo que facilita sustituir el modelo completo por esta versión cuantizada.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo «thinking».
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Limpieza de dictado en macOS: es el caso de uso para el que se publicó. La app Bolo descarga este repositorio cuando el usuario activa «Smart formatting» y lo emplea para convertir el texto crudo del reconocimiento de voz en texto con puntuación y mayúsculas correctas, sin salir del equipo.
- Post-proceso de pipelines ASR propios: integrar el modelo como etapa final tras Whisper u otro motor de transcripción para normalizar la salida (puntuación, signos de apertura, eliminación de muletillas) antes de almacenarla o indexarla.
- Redacción de correos por voz: el usuario dicta el cuerpo de un mensaje y el modelo devuelve un texto presentable que puede enviarse o revisarse con cambios mínimos, gracias a que la inferencia ocurre en local y con latencia baja por el tamaño de 0,6B.
- Notas de reuniones y actas: limpiar transcripciones largas de forma automática antes de pasarlas a un sistema de resumen, de modo que el modelo de resumen reciba texto bien segmentado.
- Subtitulado y transcripción de entrevistas: normalizar segmentos cortos de diálogo para que los subtítulos mantengan coherencia de mayúsculas y puntuación entre fragmentos.
- Accesibilidad: entrada por voz para personas con movilidad reducida en aplicaciones de escritorio, con el modelo actuando como capa de formato entre el micrófono y el campo de texto.
- Procesamiento en el borde (edge): al ocupar 0,3 GB en disco y ejecutarse sobre memoria unificada de Apple Silicon, encaja en flujos offline donde no se permite enviar audio ni transcripciones a servidores externos por motivos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de calidad (WER, BLEU, MMLU, HumanEval ni ninguna otra), ni comparaciones con el modelo original en precisión completa, ni cifras de latencia o throughput.

## Requisitos de hardware

- Tamaño en disco: 0,3 GB para el repositorio completo; los pesos a 4 bits rondan los 0,3 GB, por lo que la inferencia requiere del orden de 0,5-1 GB de memoria libre, incluyendo overhead del runtime.
- Plataforma: MLX es un framework para Apple Silicon (M1 en adelante). El modelo no se ejecuta de forma nativa en GPU NVIDIA o AMD sin una conversión previa a otro formato.
- GPU recomendadas: no aplica el catálogo habitual (A100, H100, RTX 4090); el destino natural es cualquier Mac con chip de la serie M. Cabe holgadamente en los modelos con 8 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en cualquier Apple Silicon; en el ecosistema CUDA requeriría convertir los pesos (por ejemplo a GGUF) y no hay conversión publicada.
- Opciones de despliegue: `mlx_lm` (CLI de generación y servidor compatible con la API de OpenAI), aplicaciones basadas en MLX como LM Studio y la propia app Bolo. No hay artefactos para vLLM, TGI, llama.cpp u Ollama en este repositorio.
- Latencia y throughput: no disponibles. Por el tamaño (0,6B a 4 bits) es razonable esperar latencias de decodificación muy bajas en Apple Silicon, pero no hay cifras publicadas que lo respalden.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HeyBolo/s1-mini-mlx-4bit | 0,6B (4 bits) | No disponible (base Qwen3-0.6B: 32.768) | Apache 2.0 + cláusula de atribución de Superwhisper | safetensors MLX | Repositorio público, 0 descargas, 0 likes |
| superwhisper/s1-mini | 0,6B (precisión original, no confirmada) | No disponible | Apache 2.0 + cláusula de atribución de Superwhisper | safetensors | Modelo original del que deriva esta cuantización |
| Qwen3-0.6B | 0,6B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF | Ampliamente disponible; modelo generalista, no especializado en dictado |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF | Ampliamente disponible; alternativa generalista de tamaño comparable |

La comparación relevante es con s1-mini en precisión completa: esta versión intercambia algo de calidad por un tercio del espacio en disco y ejecución nativa en MLX. Frente a Qwen3-0.6B, el fine-tune aporta especialización en limpieza de dictado a costa de capacidades generales. No hay datos de rendimiento que permitan cuantificar ninguna de estas diferencias.

## Limitaciones y advertencias

- Licencia con obligación de atribución: además de Apache 2.0, Superwhisper impone que cualquier uso, distribución o integración identifique el modelo como «S1-mini» by «Superwhisper», con esa capitalización exacta. Es un requisito que debe revisarse antes de integrarlo en un producto comercial.
- Modelo especializado, no generalista: está entrenado para limpiar dictado. Su uso para razonamiento, código o matemáticas probablemente degrade respecto a Qwen3-0.6B sin fine-tune, y no hay evaluaciones que lo confirmen.
- Riesgo de alucinación y de alteración de contenido: al reescribir una transcripción, el modelo puede cambiar palabras, completar frases ambiguas o corregir de más, modificando el significado original. En contextos legales, médicos o periodísticos requiere revisión humana.
- Idiomas no declarados: la model card no especifica idiomas soportados. Es previsible un sesgo hacia el inglés, pero no está documentado ni verificado.
- Contexto no confirmado: no se declara la ventana de contexto de este fine-tune. Dictados muy largos podrían truncarse o degradar la calidad.
- Cuantización con pérdida: los pesos a 4 bits introducen un error de cuantización respecto al modelo original en precisión completa; no se ha publicado ninguna comparación de calidad entre ambos.
- Dependencia de MLX: el formato solo es utilizable en Apple Silicon con el stack de MLX. Desplegarlo en CUDA, ROCm o en servidores x86 exige una conversión que el repositorio no proporciona.
- Falta de validación externa: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo día. No hay evidencia de uso en producción ni informes de terceros.
- Ausencia de datos de entrenamiento: no se documenta el corpus, el proceso de anotación ni las fases de alineación, lo que impide auditar sesgos o estimar su comportamiento fuera de la distribución de dictado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HeyBolo/s1-mini-mlx-4bit
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Repositorio MLX: https://github.com/ml-explore/mlx
- Modelo original del que deriva la familia: https://huggingface.co/Qwen/Qwen3-0.6B
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
