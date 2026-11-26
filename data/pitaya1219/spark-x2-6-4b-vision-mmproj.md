# Pitaya1219/Spark-X2.6-4B-vision-mmproj

## Resumen

Spark-X2.6-4B-vision-mmproj es un proyector multimodal (mmproj) publicado por el usuario Pitaya1219 para dotar de capacidad de lectura de imágenes al modelo de texto Spark-X2.6-4B de XHToken. No se trata de un modelo completo, sino de un adaptador que se acopla al modelo de lenguaje congelado dentro de llama.cpp, reutilizando la torre de visión del modelo Gemma 4 de Google (google/gemma-4-26B-A4B-it, licencia Apache-2.0).

El componente es explícitamente no oficial y de etapa temprana (stage 1): el autor advierte de que las descripciones generadas pueden contener detalles inventados y de que en japonés puede producir repeticiones. El repositorio ocupa 1,2 GB e incluye tanto el GGUF del proyector (F16) como el fichero safetensors con los pesos entrenados del proyector, junto con un script para reconstruir el GGUF.

La relevancia de esta ficha es acotada: se trata de un artefacto comunitario con 0 descargas y 0 likes en el momento de la consulta, pensado para experimentación con visión en modelos pequeños (el modelo base Spark-X2.6-4B declara 572.499.504 parámetros en safetensors, aunque su nombre comercial sugiere 4B). No debe confundirse con un modelo multimodal listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) sobre torre de visión de Gemma 4; capa lineal 1152 → 2560 con RMSNorm sin pesos previa |
| Parámetros totales | 572.499.504 (dato real del safetensors del repo; corresponde al conjunto del artefacto, no al modelo de lenguaje) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo de lenguaje Spark-X2.6-4B) |
| Tipos de cuantización | F16 para el mmproj; el modelo de lenguaje admite Q4_K_M y otras cuantizaciones de llama.cpp |
| Idiomas soportados | Inglés y japonés en los datos de entrenamiento del proyector; idiomas del modelo de lenguaje no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (mmproj) y safetensors (projector-stage1.safetensors) |

## Arquitectura y entrenamiento

El proyector reutiliza la torre de visión congelada de Gemma 4 (27 capas, dimensión oculta 1152, pooling 3x3), tomada del GGUF `mmproj-...-f16.gguf` publicado por bartowski. La única pieza entrenada es la capa lineal final (`mm.input_projection.weight`), que proyecta de 1152 a 2560 dimensiones (la dimensión oculta de Spark), precedida por el mismo RMSNorm sin pesos que emplea Gemma 4. Durante el entrenamiento, los pesos de Spark permanecieron congelados.

Los datos de entrenamiento consisten en 8.000 imágenes de LLaVA-Pretrain (procedentes de CC3M, LAION y SBU) con descripciones en inglés y, en la mitad de las muestras, su traducción al japonés del dataset `turing-motors/LLaVA-Pretrain-JA`. Se realizaron 3 épocas con batch 16 y learning rate 5e-4. La pérdida de caption en el conjunto de validación fue de 2,76, y de 4,48 al sustituir la imagen por otra, lo que indica que el proyector aprende cierta dependencia de la imagen aunque con margen de mejora. El GGUF se reconstruye con `build_mmproj.py` a partir del mmproj de Gemma 4 y del safetensors del proyector.

## Capacidades

- Lectura de imágenes integrada en llama.cpp mediante el flag `--mmproj`, con el modelo de lenguaje Spark-X2.6-4B como decodificador de texto.
- Generación de descripciones de imagen (image captioning) en inglés y japonés, en el estilo de LLaVA-Pretrain: frases cortas y con abundancia de nombres.
- Configuración recomendada de tokens de imagen (256-280) para alinearse con el régimen de entrenamiento.
- No soporta de forma fiable question answering sobre imágenes ni OCR más allá del contenido de los captions de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio; dependen del modelo de lenguaje subyacente y no están verificadas para esta combinación.

## Casos de uso

- Experimentación con visión en modelos pequeños: permite probar pipelines multimodales en llama.cpp con un modelo de lenguaje de pocos parámetros y un proyector ligero, útil para prototipos en hardware modesto.
- Generación automática de pies de foto en inglés: adecuado para etiquetar imágenes de forma aproximada en tareas de catalogación no críticas, asumiendo el riesgo de detalles inventados.
- Pruebas de concepto de asistentes visuales en japonés: el proyector incluye datos en japonés, aunque el autor advierte de repeticiones ocasionales, por lo que sirve para demos controladas.
- Evaluación comparativa de proyectores: al ser un artefacto aislado y reproducible (`build_mmproj.py`), resulta útil para estudiar el efecto de la dimensión de proyección y del número de tokens de imagen en la calidad de las descripciones.
- Investigación sobre alineación visión-lenguaje con modelos congelados: el setup de entrenar solo la capa lineal final permite analizar cuánta capacidad visual se transfiere sin ajustar el LLM.
- Integración en herramientas de anotación asistida: como borrador inicial de descripciones que un humano revisa después, dado el bajo coste computacional del proyector F16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es la pérdida de caption en validación: 2,76 con la imagen correcta y 4,48 con una imagen intercambiada.

## Requisitos de hardware

- VRAM estimada: el proyector F16 ocupa aproximadamente 1,2 GB; a ello se suma la del modelo de lenguaje Spark-X2.6-4B en la cuantización elegida (Q4_K_M u otra), no disponible en la información proporcionada.
- GPU recomendadas: no disponibles de forma específica; al tratarse de un modelo pequeño, es plausible su ejecución en GPU consumer, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: probable por el tamaño reducido, sin confirmación oficial.
- Despliegue: llama.cpp (versión b12034 o superior, con soporte `gemma4v`); no se documentan vLLM, TGI ni Ollama para esta combinación.
- Latencia y throughput: no disponibles.
- Configuración de inferencia: `--image-min-tokens 256 --image-max-tokens 280 --jinja` con `llama-server`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-vision-mmproj | Proyector mmproj comunitario | 572.499.504 (artefacto) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Gemma 4 (google/gemma-4-26B-A4B-it) | Modelo multimodal completo (origen de la torre de visión) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Spark-X2.6-4B (XHToken) | Modelo de lenguaje solo texto | no disponible (nombre comercial 4B) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto no oficial: no está afiliado ni respaldado por XHToken ni por Google; el nombre solo indica compatibilidad.
- Etapa temprana (stage 1): el autor advierte de detalles inventados en las descripciones, especialmente años, nombres y lugares.
- Repeticiones ocasionales en japonés.
- No entrenado para question answering ni OCR; su alcance se limita al estilo de captions de LLaVA-Pretrain.
- Los datos de entrenamiento provienen de CC3M, LAION y SBU, con las condiciones de uso de dichos conjuntos.
- Requiere una versión reciente de llama.cpp con soporte `gemma4v` (b12034 funciona según el autor).
- Con el valor por defecto de tokens de imagen (~80) en llama.cpp, las respuestas contienen más detalles inventados; es necesario forzar 256-280 tokens.
- Licencia Apache-2.0 para el proyector, aunque el uso comercial debe evaluarse junto con las licencias del modelo de lenguaje y de los datos de entrenamiento.
- Sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pitaya1219/Spark-X2.6-4B-vision-mmproj
- Modelo base de lenguaje: https://huggingface.co/XHToken/Spark-X2.6-4B
- Modelo de origen de la torre de visión: https://huggingface.co/google/gemma-4-26B-A4B-it
- GGUF de referencia del mmproj de Gemma 4: https://huggingface.co/bartowski/google_gemma-4-26B-A4B-it-GGUF
- Dataset LLaVA-Pretrain: https://huggingface.co/datasets/liuhaotian/LLaVA-Pretrain
- Dataset LLaVA-Pretrain en japonés: https://huggingface.co/datasets/turing-motors/LLaVA-Pretrain-JA
