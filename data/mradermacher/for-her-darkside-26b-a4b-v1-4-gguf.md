# mradermacher/For-Her-Darkside-26B-A4B-v1.4-GGUF

## Resumen

For-Her-Darkside-26B-A4B-v1.4-GGUF es la versión cuantizada en formato GGUF del modelo homónimo creado por ReadyArt, preparada por mradermacher para su ejecución local eficiente. El modelo base es un transformer de arquitectura Mixture of Experts (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos por token, basado en la familia Gemma 4. Está diseñado específicamente para roleplay, conversación y generación de texto instructivo, con un enfoque en contenido explícito para adultos y sin alineación de seguridad (unaligned).

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, sin necesidad de infraestructura de servidor. La cuantización reduce drásticamente los requisitos de memoria: los archivos van desde 10,7 GB (Q2_K) hasta 27 GB (Q8_0), lo que posibilita su uso en GPUs de gama media-alta o incluso en CPU con suficiente RAM. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

Al tratarse de un modelo sin alineación, no incorpora filtros de contenido ni rechazo de solicitudes explícitas, lo que lo hace atractivo para aplicaciones de entretenimiento adulto, escritura creativa sin censura y simulación de personajes, pero también implica riesgos legales y éticos que deben evaluarse antes de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer con MoE) |
| Parametros totales | 25 233 142 046 (~26B) |
| Parametros activos | 4B (según nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base For-Her-Darkside-26B-A4B-v1.4 emplea una arquitectura transformer con mezcla de expertos (MoE), donde solo 4 000 millones de parámetros se activan por token, lo que reduce el coste computacional en inferencia manteniendo una capacidad total de 26 000 millones. Según la información disponible, pertenece a la familia Gemma 4, aunque no se especifican detalles concretos sobre la configuración de capas, atención o el número de expertos.

No se dispone de datos sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La etiqueta "unaligned" sugiere que el modelo no fue sometido a alineación con preferencias humanas para rechazar contenido explícito, sino que se optimizó para seguir instrucciones y mantener conversaciones de roleplay sin restricciones. Tampoco hay información sobre el proceso de cuantización más allá de que se realizó con herramientas estándar (probablemente llama.cpp) para generar los distintos niveles de precisión.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo está optimizado para mantener diálogos multi-turno con personajes, siguiendo instrucciones de sistema y contexto.
- Instrucciones (instruct): responde a comandos y solicitudes directas en formato de chat.
- Contenido explícito: al ser "unaligned", no rechaza solicitudes de naturaleza sexual, violenta u ofensiva, y puede generar descripciones detalladas de escenas adultas.
- Multimodalidad parcial: los archivos mmproj (proyectores multimodales) incluidos en el repo sugieren que el modelo base podría soportar entrada de imágenes, aunque no se ha confirmado su funcionamiento en esta versión GGUF.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso estructurado.
- Multilingüismo: solo se declara inglés; no hay evidencia de buen rendimiento en otros idiomas.

## Casos de uso

- Entretenimiento para adultos: el modelo puede generar narrativas eróticas, diálogos explícitos y escenas de roleplay sexual bajo demanda, sin filtros de contenido. Es adecuado para aplicaciones de chat erótico o generación de ficción adulta.
- Simulación de personajes para juegos de rol: permite crear asistentes virtuales con personalidades definidas, manteniendo coherencia de personaje a lo largo de conversaciones largas gracias a su contexto extenso (aunque no se ha confirmado la longitud exacta).
- Escritura creativa sin censura: útil para autores que necesitan explorar temas tabú o transgresores en sus borradores, sin que el modelo imponga restricciones morales.
- Investigación sobre alineación y seguridad: al ser un modelo "unaligned", sirve como caso de estudio para comparar comportamientos con modelos alineados y analizar sesgos o riesgos de contenido generado.
- Prototipado de chatbots de nicho: desarrolladores pueden integrarlo en aplicaciones de chat para comunidades específicas que buscan interacciones sin censura, usando llama.cpp o vLLM como backend.
- Generación de diálogos para guiones o videojuegos: su capacidad para mantener conversaciones naturales y su falta de inhibiciones lo hacen útil para crear guiones de personajes con diálogos provocativos o controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada: según la cuantización, los archivos ocupan entre 10,7 GB (Q2_K) y 27 GB (Q8_0). Para inferencia con contexto razonable, se recomienda al menos 12-16 GB de VRAM para las versiones Q4 y superiores.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) puede ejecutar cómodamente Q4_K_M (16,9 GB) o Q5_K_M (19,2 GB). Para Q8_0 (27 GB) se necesita una GPU con 32 GB o más (A100, RTX 6000 Ada) o usar CPU con suficiente RAM.
- Ejecución en CPU: con llama.cpp, las cuantizaciones Q2_K y Q3_K pueden funcionar en CPU con 16-32 GB de RAM, aunque la velocidad será limitada.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptador GGUF), text-generation-webui, LM Studio, entre otros.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un MoE de 4B activos en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con cuantización Q4, pero depende del contexto y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de roleplay sin alinear. Alternativas comunes en este nicho incluyen modelos como MythoMax-L2-13B, Noromaid-20B o Midnight-Miqu-70B, pero no hay datos de rendimiento relativo con For-Her-Darkside-26B-A4B-v1.4. La falta de benchmarks públicos impide una comparación objetiva.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo genera material sexual, violento o perturbador sin restricciones. Su uso en aplicaciones públicas puede violar términos de servicio de plataformas o leyes locales.
- Sin alineación: no tiene mecanismos de rechazo ante solicitudes dañinas, lo que puede derivar en respuestas ofensivas, ilegales o peligrosas si se usa sin supervisión.
- Sesgos desconocidos: al no haber documentación sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza u otros.
- Idioma limitado: solo inglés; el rendimiento en otros idiomas es probablemente pobre.
- Longitud de contexto no confirmada: no se especifica el tamaño de la ventana de contexto, lo que puede llevar a errores en conversaciones muy largas.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres o detalles, especialmente en contextos de roleplay.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incurrir en responsabilidades legales (difamación, pornografía ilegal, etc.). El usuario final es responsable del uso.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/For-Her-Darkside-26B-A4B-v1.4-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/For-Her-Darkside-26B-A4B-v1.4
- Repositorio de cuantizaciones con imatrix (alternativa): https://huggingface.co/mradermacher/For-Her-Darkside-26B-A4B-v1.4-i1-GGUF
- Proyecto TurboFieldfare (inferencia de Gemma 4 26B-A4B en ~2 GB de RAM): https://github.com/drumih/turbo-fieldfare
- Guía visual de Gemma 4 (referencia de arquitectura): https://www.maartengrootendorst.com/ (enlace indirecto, no verificado)
