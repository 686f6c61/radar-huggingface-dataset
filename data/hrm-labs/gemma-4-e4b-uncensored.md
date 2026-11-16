# hrm-labs/Gemma-4-E4B-Uncensored

## Resumen

Gemma-4-E4B-Uncensored es una variante "abliterated" (sin rechazos) del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario hrm-labs en Hugging Face y derivada del trabajo de cuantización y desbloqueo de HauhauCS. El modelo conserva la arquitectura y las capacidades del Gemma 4 E4B original —texto, imagen, vídeo y audio— pero elimina los mecanismos de rechazo aprendidos durante el ajuste fino con preferencias humanas, de modo que genera contenido que el modelo base declinaría. La model card del autor afirma "0/465 refusals" sobre un conjunto de evaluación propio.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de "uncensoring" sobre un modelo de última generación de Google, con todas las implicaciones éticas y legales que ello conlleva bajo la licencia Gemma. Por otro, sirve como referencia técnica de un ecosistema de cuantizaciones GGUF (incluidas las variantes propietarias K_P del autor) orientadas a ejecución local en hardware de consumo.

El modelo declara 7.518.069.290 parámetros en safetensors, aunque la model card lo describe como un modelo de 4B; esta discrepancia no está aclarada en la información disponible. El contexto declarado es de 131K tokens, con 42 capas y atención mixta (sliding window de 512 más atención completa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), 42 capas con atención mixta: sliding window de 512 y atención completa; 18 capas con KV compartida |
| Parametros totales | 7.518.069.290 (safetensors); la model card indica "4B parameters" (discrepancia no aclarada) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 131K tokens |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P; mmproj en f16 |
| Idiomas soportados | en, multilingual (sin listado detallado) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones); repo de 61,6 GB; no se listan safetensors descargables en la información disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-e4b-it: un transformer de 42 capas con esquema de atención mixto que combina ventanas deslizantes de 512 tokens con capas de atención completa, y 18 capas con KV compartida para reducir el consumo de memoria en contexto largo. Es nativamente multimodal (texto, imagen, vídeo y audio), con el pipeline declarado `image-text-to-text`. La componente de visión y audio se distribuye por separado mediante el fichero `mmproj` en f16 (945 MB), necesario para habilitar esas modalidades en llama.cpp.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la pipeline de RLHF/DPO del modelo base en la documentación proporcionada. El proceso de "abliteration" aplicado por el autor no se detalla técnicamente: la model card solo indica que no se modificaron datasets ni capacidades y que el resultado busca ser "lossless" (sin pérdida de calidad). Las cuantizaciones se generaron con importance matrix (imatrix) para preservar la calidad sobre los pesos modificados, y las variantes K_P ("Perfect") aplican un perfil de cuantización específico por modelo que, según el autor, mejora la calidad en uno o dos niveles a cambio de un 5-15% más de tamaño.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el fichero mmproj.
- Comprensión de vídeo, según la model card.
- Comprensión de audio, según la model card.
- Capacidades multilingües (etiquetas `en` y `multilingual`; no se detalla la lista de idiomas).
- Conversación con plantilla de chat propia de Gemma 4; requiere el flag `--jinja` en llama.cpp para su correcta aplicación.
- Generación sin rechazos sobre prompts que el modelo base declinaría (variante "Aggressive").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o multi-step reasoning: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con la abliteración y cómo afecta al resto de capacidades, comparándolo con el Gemma 4 E4B-IT original en evaluaciones controladas.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa con temáticas sensibles (violencia, terror, contenido adulto) donde el modelo base aplicaría rechazos; la variante "Aggressive" garantiza la generación completa del contenido solicitado.
- Procesamiento local de documentos con imágenes: con el mmproj cargado, el modelo puede describir y extraer información de capturas, diagramas o fotografías en un portátil con GPU de consumo, sin enviar datos a servicios externos.
- Transcripción y análisis de audio en local: la modalidad de audio permite resumir reuniones o analizar clips sin depender de APIs en la nube, útil en entornos con requisitos de privacidad.
- Asistente conversacional de escritorio: integrable en LM Studio, Jan o koboldcpp con cuantizaciones Q4_K_M (5,0 GB), lo que permite ejecutarlo en GPUs de 8 GB de VRAM con contexto moderado.
- Evaluación de cuantizaciones: las variantes K_P e imatrix del autor sirven como banco de pruebas para medir la degradación de calidad de pesos abliterated bajo distintos BPW (de 3,5 a 9,4 BPW) en pipelines de llama.cpp.
- Prototipado de aplicaciones multimodales: al ser compatible con endpoints y runtimes GGUF estándar, se puede usar como backend de pruebas en aplicaciones que combinen texto, imagen y audio antes de migrar a un modelo con licencia y salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada por el autor es "0/465 refusals" sobre un conjunto de evaluación no especificado, sin datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 4,2 GB con Q2_K_P; 4,8 GB con IQ4_XS; 5,0 GB con Q4_K_M; 5,5 GB con Q5_K_P; 5,9 GB con Q6_K_P; 7,6 GB con Q8_K_P. Añadir 945 MB si se carga el mmproj para visión/audio.
- La caché KV para 131K tokens no está cuantificada en la información disponible; con 18 capas de KV compartida el coste es menor que en un transformer convencional, pero a contexto completo requerirá memoria adicional significativa.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones Q4-Q5 caben en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); Q6-Q8 requieren 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090). Para despliegue en servidor, A100 o H100 permiten contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, desde Q2_K_P en GPUs de 6 GB y Q4_K_M en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (con `--jinja` y `-ngl 99`), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible; el formato distribuido es exclusivamente GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored (este) | 7,5B declarados en safetensors; "4B" según model card | 131K | Texto, imagen, vídeo, audio | gemma | GGUF | Sin rechazos; cuantizaciones K_P e imatrix |
| google/gemma-4-e4b-it | no disponible en la información | 131K (heredado) | Texto, imagen, vídeo, audio | gemma | no disponible | Modelo base con salvaguardas intactas |
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (original) | 4B según su card | 131K | Texto, imagen, vídeo, audio | gemma | GGUF | Fuente directa de las cuantizaciones de este repo |
| Otras variantes "Balanced" de HauhauCS | no disponible | no disponible | no disponible | gemma | GGUF | Anunciada pero no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo generará contenido dañino, ilegal o sexualmente explícito si se le solicita; no es apto para aplicaciones orientadas al público sin filtros externos.
- La variante "Aggressive" puede añadir breves avisos ("disclaimers") heredados del entrenamiento del modelo base, aunque según el autor el contenido completo siempre se genera.
- La licencia Gemma Terms of Use impone restricciones de uso, incluida la prohibición de usos dañinos y obligaciones de atribución; el uso comercial está sujeto a dichos términos y a la política de uso prohibido de Google. La redistribución de modelos derivados debe cumplir la licencia Gemma.
- El autor advierte que el modelo base recibió menos pruebas manuales en contexto largo que otras versiones, por lo que el comportamiento a 131K tokens puede degradarse.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al modelo base, sin datos que lo confirmen.
- Sesgos: no documentados en la información proporcionada; al derivar del Gemma 4 base, hereda los sesgos de sus datos de entrenamiento.
- Idiomas: la etiqueta `multilingual` no va acompañada de una lista de idiomas; el rendimiento fuera del inglés no está verificado.
- La discrepancia entre los 7,5B parámetros de safetensors y los "4B" de la model card no está explicada y debe verificarse antes de dimensionar el hardware.
- El widget de compatibilidad de hardware de Hugging Face no reconoce las cuantizaciones K_P, por lo que puede mostrar menos ficheros de los disponibles.
- Las cuantizaciones K_P son un formato propietario del autor; aunque declara compatibilidad con llama.cpp y LM Studio, LM Studio puede mostrarlas como "?" en la columna de cuantización.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, lo que impide evaluar su adopción o validación por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hrm-labs/Gemma-4-E4B-Uncensored
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Fichero Q4_K_M: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf
- Fichero mmproj (f16): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/mmproj-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-f16.gguf
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
