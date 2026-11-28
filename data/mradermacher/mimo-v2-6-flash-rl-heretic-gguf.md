# mradermacher/MiMo-V2.6-Flash-RL-heretic-GGUF

## Resumen

MiMo-V2.6-Flash-RL-heretic es un modelo de lenguaje publicado por el usuario makhdoomhussainraza y cuantizado a formato GGUF por mradermacher. Se trata de una variante "abliterated" (también etiquetada como "heretic") del modelo MiMo-V2.6-Flash-RL, lo que significa que se ha aplicado una técnica de edición de pesos orientada a eliminar o atenuar los mecanismos de rechazo y alineación de seguridad del modelo original. El resultado es un modelo que responde a peticiones que el modelo base tendería a declinar, con las implicaciones éticas y de seguridad que ello conlleva.

El modelo cuenta con 1.318.620.160 parámetros totales según los datos de safetensors, lo que lo sitúa en la categoría de aproximadamente 1,3 mil millones de parámetros. La información disponible no especifica la arquitectura interna (transformer denso, MoE u otra), la longitud de contexto soportada ni los datos de entrenamiento. La model card es puramente técnico-logística y se centra en los ficheros de cuantización disponibles.

El repositorio destaca por su gran tamaño total (aproximadamente 2 TB) debido a la inclusión de múltiples cuantizaciones estáticas en formato GGUF, desde Q2_K hasta Q8_0, además de los ficheros mmproj para capacidades multimodales. Está pensado para su uso con llama.cpp y herramientas compatibles, y se distribuye bajo licencia MIT. La relevancia actual radica en su condición de modelo "sin censura" cuantizado para inferencia local, un nicho con demanda creciente entre investigadores que estudian el comportamiento de modelos desalineados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.318.620.160 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el número de parámetros (aproximadamente 1,3 mil millones) y la etiqueta `mimo`, se trata presumiblemente de un transformer de escala pequeña, pero no se confirma si emplea atención estándar, atención lineal u otra variante. No se especifican el número de capas, dimensiones ocultas, número de cabezas de atención ni el vocabulario.

Respecto al entrenamiento, la model card no aporta datos sobre el número de tokens, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o supervisión adicional. La designación "RL" en el nombre sugiere algún tipo de entrenamiento con refuerzo, y "Flash" podría indicar una variante optimizada, pero son inferencias no confirmadas. La modificación "heretic/abliterated" implica una edición post-entrenamiento de los pesos para suprimir direcciones de activación asociadas al rechazo de peticiones, aunque no se documenta la metodología concreta empleada. La presencia de ficheros `mmproj` indica soporte multimodal (probablemente visión), aunque no se detalla su arquitectura de proyección.

## Capacidades

- Generación de texto en inglés.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere soporte de entrada de imágenes, aunque no se documenta el alcance exacto.
- Comportamiento "abliterated": responde a peticiones que el modelo base rechazaría, al haberse eliminado o atenuado las capas de rechazo.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo la eliminación de mecanismos de rechazo afecta a la distribución de respuestas, comparando su comportamiento con el modelo base en conjuntos de prompts de evaluación de seguridad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo original rechazaría, en entornos controlados de autoría.
- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_M (186,8 GB) o Q2_K (113,4 GB) puede desplegarse en estaciones de trabajo con suficiente RAM/VRAM, aunque el tamaño real de los ficheros sugiere que el modelo es mucho mayor de lo que indica el recuento de parámetros de safetensors.
- Análisis de robustez de filtros: evaluar si sistemas de moderación externos detectan contenido generado por modelos desalineados.
- Pruebas de red teaming: uso por equipos de seguridad para identificar vectores de generación de contenido problemático antes de desplegar sistemas propios.
- Experimentación con cuantizaciones GGUF: comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo abliterated, útil para estudiar la relación entre compresión y fidelidad de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros GGUF van desde 113,4 GB (Q2_K) hasta 186,8 GB (Q4_K_M) y más para Q5/Q6/Q8. Estas cifras son muy superiores a lo esperable para un modelo de 1,3 mil millones de parámetros, lo que sugiere una discrepancia entre el recuento de safetensors y el tamaño real del modelo cuantizado; conviene verificar el tamaño efectivo antes de planificar el despliegue.
- GPU recomendadas: no disponible. Por los tamaños de fichero, se requerirían múltiples GPU de alta gama (A100 80 GB, H100) o sistemas con gran cantidad de RAM para inferencia en CPU.
- ¿Cabe en GPU de consumo? No, según los tamaños de fichero publicados. Una RTX 4090 (24 GB) no podría alojar ninguna de las cuantizaciones listadas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Los ficheros están divididos en múltiples partes (part1of3, part1of4, part1of5) que deben concatenarse antes de su uso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y las características atípicas del repositorio (tamaño de fichero desproporcionado respecto al recuento de parámetros) impiden establecer una comparación fiable con alternativas estándar de ~1,3 B parámetros.

## Limitaciones y advertencias

- Modelo "abliterated"/"heretic": se han eliminado o atenuado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal. No es apto para aplicaciones de cara al público sin filtros externos robustos.
- Sesgos: no documentados, pero al derivar de un modelo base no se han aplicado salvaguardas adicionales; los sesgos del modelo original probablemente persisten o se amplifican.
- Riesgo de alucinación: no cuantificado; en modelos pequeños de ~1,3 B es habitualmente elevado.
- Idioma: solo inglés según la etiqueta; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: longitud máxima no documentada; no debe asumirse una ventana amplia.
- Licencia MIT: permite uso comercial, pero el uso de un modelo sin alineación conlleva responsabilidad legal y reputacional para el desplegador.
- Discrepancia de tamaño: el recuento de parámetros (1,3 B) no concuerda con los tamaños de fichero GGUF publicados; verificar antes de producción.
- Ficheros multiparte: requieren concatenación previa; un manejo incorrecto produce ficheros corruptos.
- Fecha de creación futura (2026-11-24): dato a verificar; puede tratarse de un error de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiMo-V2.6-Flash-RL-heretic-GGUF
- Modelo base: https://huggingface.co/makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/MiMo-V2.6-Flash-RL-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiMo-V2.6-Flash-RL-heretic-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
