# Rombakr5/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una variante "abliterated" (sin rechazos) del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario HauhauCS y redistribuida en el repositorio de Rombakr5. El modelo conserva la arquitectura y capacidades del original —multimodalidad nativa de texto, imagen, vídeo y audio, 131K tokens de contexto y 42 capas con atención mixta de ventana deslizante— pero elimina los mecanismos de rechazo del ajuste por instrucciones. El autor declara 0 rechazos sobre 465 prompts de prueba.

El interés práctico reside en disponer de un modelo de ~7.500 millones de parámetros totales (etiquetado como "4B" por el autor, con arquitectura de expertos o parámetros efectivos no detallados en la información disponible) que mantiene el pipeline image-text-to-text y se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P e imatrix. Esto lo hace desplegable en hardware de consumo mediante llama.cpp, LM Studio o Jan.

La relevancia es doble: por un lado, ofrece una alternativa sin filtros para investigación sobre alineación, evaluación de sesgos y estudios de seguridad; por otro, la licencia Gemma impone restricciones de uso que conviene revisar antes de cualquier despliegue comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, vídeo, audio) con atención mixta: ventana deslizante de 512 tokens + atención completa; 42 capas; 18 capas con KV compartida |
| Parametros totales | 7.518.069.290 (según safetensors); el autor indica "4B parameters" |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P; proyector multimodal mmproj en f16 |
| Idiomas soportados | jemer (jv), indonesio (id), inglés (en), multilingüe |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (incluye mmproj separado para visión y audio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-e4b-it: un transformer de 42 capas que combina atención de ventana deslizante de 512 tokens con capas de atención completa, y que comparte claves y valores en 18 capas para reducir el consumo de memoria durante la inferencia. La multimodalidad es nativa (texto, imagen, vídeo y audio) y el pipeline declarado es image-text-to-text. El contexto alcanza los 131.072 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. La modificación introducida por HauhauCS consiste en una "abliteración" (eliminación de la dirección de rechazo en los pesos) sin cambios en datasets ni capacidades, según la model card. Las cuantizaciones se generaron con importance matrix (imatrix) para preservar calidad sobre los pesos abliterated, y las variantes K_P ("Perfect") aplican perfiles de cuantización específicos por modelo que, según el autor, elevan la calidad uno o dos niveles a cambio de un 5-15% más de tamaño. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 131K tokens.
- Comprensión de imágenes y vídeo (requiere el archivo mmproj junto al GGUF principal).
- Comprensión de audio (también mediante mmproj).
- Razonamiento y respuesta a instrucciones heredados del modelo base gemma-4-e4b-it.
- Soporte multilingüe limitado a los idiomas declarados: jemer, indonesio, inglés y multilingüe genérico.
- Sin rechazos en la variante Aggressive: el autor reporta 0/465 rechazos en sus pruebas; puede añadir avisos breves heredados del entrenamiento base, pero genera el contenido completo.
- Compatibilidad con runtimes GGUF estándar (llama.cpp, LM Studio, Jan, koboldcpp) y con el flag `--jinja` para el template de chat.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué contenidos genera un modelo sin mecanismos de rechazo y comparar su comportamiento con el gemma-4-e4b-it original, útil para calibrar clasificadores de seguridad y estudiar la eficacia de la abliteración.
- Evaluación de sesgos y robustez: al eliminar los filtros, expone de forma más directa los sesgos latentes del modelo base, lo que facilita auditorías reproducibles sobre datasets de prompts sensibles.
- Procesamiento multimodal en local: con el mmproj f16 y una cuantización Q4_K_M (5,0 GB), se puede describir imágenes o transcribir audio en un portátil con GPU de consumo, sin enviar datos a la nube.
- Análisis de documentos con contexto largo: los 131K tokens permiten ingerir informes extensos o transcripciones completas y hacer preguntas sobre ellos en una sola pasada.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas que el modelo base rechazaría, con la advertencia de revisión humana obligatoria.
- Prototipado de asistentes conversacionales en indonesio o jemer: es uno de los pocos modelos GGUF multimodales que declara soporte para estos idiomas, útil para pruebas de concepto en esos mercados.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, puede operar sin conexión en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q8_K_P ~7,6 GB; Q6_K_P ~5,9 GB; Q5_K_P ~5,5 GB; Q4_K_M ~5,0 GB; IQ4_XS ~4,8 GB; Q3_K_M ~4,6 GB; Q2_K_P ~4,2 GB. El proyector multimodal mmproj f16 añade ~945 MB.
- El KV cache con 131K de contexto y 18 capas compartidas requiere memoria adicional no cuantificada en la información disponible; para contextos largos conviene reservar varios GB extra o reducir `-c`.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o RTX 4080 (16 GB) permiten Q8_K_P con contexto amplio; una RTX 3060 de 12 GB admite Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, desde Q2_K_P (~4,2 GB) en adelante; las cuantizaciones Q4 y Q5 son las más equilibradas para 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja -ngl 99`), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI, que requieren safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 7.518 M totales (autor: "4B") | 131K | Texto, imagen, vídeo, audio | GGUF | Gemma | Sin rechazos; cuantizaciones K_P con imatrix |
| google/gemma-4-e4b-it | No disponible en la información | 131K (heredado) | Texto, imagen, vídeo, audio | No disponible | Gemma | Modelo base con alineación de seguridad intacta |
| Otras variantes uncensored de Gemma 4 | No disponible | No disponible | No disponible | GGUF | Gemma | El autor menciona una variante "Balanced" no publicada aún |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o explícito sin filtro; requiere supervisión humana y políticas de uso estrictas en cualquier despliegue.
- Riesgo elevado de alucinación, especialmente en contextos largos: el propio autor advierte que Gemma 4 recibió menos pruebas manuales en contexto extendido que sus otras publicaciones.
- La abliteración puede degradar capacidades del modelo base; no se aportan benchmarks que cuantifiquen esa pérdida.
- Idiomas limitados: jemer, indonesio, inglés y multilingüe genérico; el castellano no está declarado explícitamente.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es imprescindible revisar sus términos antes de producción. La naturaleza "uncensored" puede entrar en conflicto con las cláusulas de uso aceptable de la licencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación independiente de la calidad de las cuantizaciones K_P.
- La etiqueta "4B parameters" del autor no coincide con los 7.518 millones de safetensors; conviene verificar el conteo real antes de dimensionar hardware.
- El widget de compatibilidad de hardware de HuggingFace no reconoce las cuantizaciones K_P y puede mostrar menos archivos de los existentes.
- Para visión y audio es obligatorio descargar el mmproj por separado; sin él, el modelo solo procesa texto.
- No se documenta soporte de tool calling ni de flujos agénticos, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rombakr5/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Repositorio original del autor (HauhauCS): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
