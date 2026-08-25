# mradermacher/Dark-Nexus-32B-v2.0-GGUF

## Resumen
Dark-Nexus-32B-v2.0-GGUF es una versión cuantizada en formato GGUF del modelo original ReadyArt/Dark-Nexus-32B-v2.0, preparada por el cuantizador mradermacher. Se trata de un modelo de 32.762 millones de parámetros orientado a conversación y roleplay, con un enfoque explícito y sin restricciones (etiquetas nsfw, explicit, unaligned, dangerous, ERP). No se dispone de información pública sobre su arquitectura interna, datos de entrenamiento ni metodología de alineación; la model card solo documenta las cuantizaciones ofrecidas. Su relevancia radica en ser un modelo de gran tamaño disponible en GGUF para ejecución local, pensado para usuarios que buscan generación de texto sin filtros de seguridad o moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se ha publicado información sobre la arquitectura interna del modelo base. Aunque por el tamaño se presume un transformer denso de tipo decoder-only, no hay confirmación oficial. Tampoco se conocen detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La única información disponible es que el modelo original fue creado por ReadyArt y que esta versión es una cuantización estática realizada por mradermacher. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto libre en inglés, sin filtros de contenido ni restricciones de temática.
- Conversación y roleplay multi-turno, especialmente orientado a escenarios explícitos y de fantasía.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de soporte para visión, audio u otras modalidades.
- El modelo está diseñado para producir respuestas sin censura, lo que implica un comportamiento potencialmente peligroso o inapropiado.

## Casos de uso
- Roleplay y narración interactiva: el modelo puede actuar como personaje o narrador en juegos de rol de texto, manteniendo hilos conversacionales largos sin necesidad de supervisión de contenido.
- Escritura creativa de ficción con temática adulta: permite generar relatos eróticos, diálogos y escenas sin las restricciones de los modelos alineados.
- Simulación de escenarios hipotéticos sin censura: útil para explorar interacciones que otros modelos rechazan, como debates éticos o discusiones sobre temas tabú.
- Pruebas de robustez y alineación: investigadores pueden evaluar el comportamiento de un modelo no alineado para estudiar sesgos, alucinaciones o riesgos de generación de contenido dañino.
- Generación de personajes y mundos para juegos de rol de mesa: puede crear descripciones, trasfondos y diálogos sin restricciones de contenido.
- Experimentación en entornos locales: al estar en GGUF, se puede desplegar en hardware de consumidor con herramientas como llama.cpp u Ollama para pruebas rápidas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Los tamaños de archivo varían entre 12.4 GB (Q2_K) y 34.9 GB (Q8_0), por lo que la VRAM necesaria oscila entre ~12 GB y ~35 GB según la cuantización.
- Una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) puede cargar cómodamente la cuantización Q4_K_M (19.9 GB) o Q4_K_S (18.9 GB), que son las recomendadas por el autor por su equilibrio entre velocidad y calidad.
- Para Q6_K (27 GB) o Q8_0 (34.9 GB) se necesita al menos una GPU de 32 GB o más, como la A100 o la RTX 6000 Ada.
- Se puede ejecutar en CPU mediante llama.cpp, aunque la velocidad será significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF (por ejemplo, llama-cpp-python, text-generation-webui).
- No se dispone de datos de latencia o throughput específicos; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de la misma categoría (modelos de 32B sin restricciones). La comparativa no está disponible.

## Limitaciones y advertencias
- El modelo no está alineado, por lo que puede generar contenido violento, discriminatorio, sexualmente explícito o ilegal sin advertencias.
- No se han documentado sesgos concretos, pero al ser un modelo sin entrenamiento de seguridad, es probable que refleje sesgos perjudiciales presentes en los datos de entrenamiento.
- Riesgo elevado de alucinación: al no estar alineado, puede producir afirmaciones falsas o inventadas con alta confianza.
- La licencia "other" no especifica términos de uso comercial; es necesario contactar al autor original para aclarar las restricciones.
- No se conoce la longitud máxima de contexto, lo que limita su uso en aplicaciones que requieren ventanas largas.
- El modelo solo soporta inglés; no hay garantías de funcionamiento en otros idiomas.
- No se recomienda su uso en producción para aplicaciones comerciales o públicas sin supervisión humana estricta.

## Enlaces
- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Dark-Nexus-32B-v2.0-GGUF
- Modelo original (ReadyArt): https://huggingface.co/ReadyArt/Dark-Nexus-32B-v2.0
- Página de ayuda de mradermacher para solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
