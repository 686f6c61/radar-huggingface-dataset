# cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k-seed44

## Resumen

El modelo `exp39-ctc-webfonts10mix-hhdgeom-byp-25k-seed44`, publicado por el usuario cyttic en HuggingFace, es un checkpoint de 87.279.756 parámetros (aproximadamente 87,3 millones) en formato safetensors, con licencia MIT. El nombre del identificador sugiere un experimento de reconocimiento de texto mediante CTC (Connectionist Temporal Classification) sobre una mezcla de diez fuentes tipográficas web ("webfonts10mix"), con algún tipo de condicionamiento geométrico ("hhdgeom"), entrenado durante 25.000 pasos ("25k") con la semilla 44. No obstante, la model card no confirma ninguno de estos extremos: es una plantilla estándar de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]".

El repositorio tiene un tamaño de 0,3 GB y no registra descargas ni "likes" en el momento de la consulta. La etiqueta `arxiv:1910.09700` hace referencia al artículo de Lacoste et al. sobre el cálculo del impacto ambiental del aprendizaje automático, que aparece citado en la sección de impacto ambiental de la plantilla; no es un paper del propio modelo. No hay información sobre el pipeline, los idiomas soportados, la arquitectura concreta ni los datos de entrenamiento.

Por tanto, esta ficha se limita a documentar lo verificable (tamaño, formato, licencia, fecha de publicación) y marca explícitamente como "no disponible" todo aquello que el autor no ha especificado. Es relevante advertir que, sin model card sustantiva ni benchmarks, el modelo no debería adoptarse en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un modelo CTC para reconocimiento de texto, sin confirmar) |
| Parámetros totales | 87.279.756 (87,3 M) |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura. El identificador del modelo contiene la cadena "ctc", lo que apunta a un entrenamiento con la función de pérdida Connectionist Temporal Classification, habitual en tareas de reconocimiento óptico de caracteres (OCR) y reconocimiento de voz, donde la alineación entre entrada y secuencia de salida no está segmentada. El segmento "webfonts10mix" sugiere un corpus sintético generado con una mezcla de diez familias tipográficas web, y "hhdgeom" podría referirse a un condicionamiento geométrico o a un módulo de atención, pero ninguna de estas hipótesis está confirmada por el autor.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas destacables. La model card es la plantilla por defecto de HuggingFace y todos los apartados de detalles, fuentes, usos, sesgos, entrenamiento y evaluación están sin completar. No se ha publicado ningún paper asociado.

## Capacidades

- No hay capacidades documentadas por el autor.
- Por el nombre del identificador, es plausible que el modelo esté orientado a reconocimiento de texto en imágenes (OCR) con decodificación CTC, pero no está confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de OCR sobre tipografías web: si se confirma la hipótesis del identificador, el modelo podría emplearse para transcribir texto renderizado con fuentes tipográficas de uso común en la web; requeriría validación empírica previa, ya que el autor no documenta el rendimiento.
- Investigación sobre decodificación CTC: el checkpoint puede servir como punto de partida reproducible (semilla 44, 25.000 pasos) para experimentos académicos que comparen variantes de entrenamiento CTC.
- Reproducción de experimentos: al estar publicado con licencia MIT y en safetensors, es apto para replicar el pipeline de entrenamiento en un entorno controlado.
- Fine-tuning sobre un dominio tipográfico específico: con 87 M de parámetros, el ajuste fino cabe en una GPU de consumo, lo que permite adaptarlo a un conjunto cerrado de fuentes propio.
- Prototipado de extracción de texto en capturas de pantalla o interfaces web: uso plausible si el modelo demuestra precisión en texto renderizado, aunque no hay métricas que lo respalden.
- Docencia y formación: útil como ejemplo de modelo pequeño con pérdida CTC para explicar alineación secuencia a secuencia sin segmentación previa.

En todos los casos, la ausencia de model card y de benchmarks obliga a realizar una evaluación propia antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87,3 M de parámetros, en fp32 ocupa aproximadamente 350 MB; en fp16, unos 175 MB; en int8, unos 87 MB. Estas cifras son estimaciones a partir del recuento de parámetros y no incluyen activaciones ni memoria del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4090, A100 o H100 funcionarían sin problema, aunque para un modelo de este tamaño el hardware de gama alta no aporta ventajas significativas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser safetensors, puede cargarse con PyTorch o Transformers si se conoce la clase de modelo; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, y es probable que no sea compatible con los runners de LLM al no ser un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y la falta de especificaciones impide establecer una comparación rigurosa con alternativas de OCR o CTC.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Riesgo de alucinación y de errores de transcripción no cuantificado, al no existir métricas publicadas.
- No se especifican los idiomas soportados ni el dominio tipográfico exacto del corpus de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos, lo que puede plantear riesgos legales si el corpus sintético se generó a partir de fuentes con licencia restrictiva.
- El modelo no registra descargas ni validación por parte de la comunidad, por lo que su calidad es desconocida.
- No debe asumirse que sea un modelo de lenguaje: el identificador y el tamaño apuntan a una tarea especializada (probablemente OCR), y usarlo como LLM produciría resultados sin sentido.
- La etiqueta `arxiv:1910.09700` corresponde a la calculadora de impacto ambiental citada en la plantilla, no a un paper del modelo; no debe interpretarse como respaldo científico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k-seed44
- Paper citado en la plantilla (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
