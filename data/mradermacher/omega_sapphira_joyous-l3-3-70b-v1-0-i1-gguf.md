# mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.0-i1-GGUF

## Resumen

Omega Sapphira Joyous L3.3 70B v1.0 es un modelo de lenguaje de 70.553 millones de parámetros basado en la arquitectura Llama 3.3, desarrollado por cactopus y posteriormente cuantizado a formato GGUF por mradermacher. Se trata de un modelo de tipo merge creado con mergekit mediante interpolación slerp, orientado específicamente a tareas de roleplay y escritura de historias. Está pensado para la generación de texto creativo y narrativo, con un enfoque sin alineación (unaligned), lo que significa que no ha pasado por procesos de RLHF o DPO para moderar su contenido.

El modelo destaca por su gran tamaño y por la disponibilidad de múltiples cuantizaciones iMatrix (basadas en importancia) que permiten ajustar el equilibrio entre calidad y consumo de recursos. La versión publicada por mradermacher incluye más de veinte variantes de cuantización, desde IQ1_S de 15,4 GB hasta Q6_K de 58 GB, lo que facilita su uso en diferentes entornos de hardware. Al estar basado en Llama 3.3, hereda las características fundamentales de esa arquitectura, aunque la documentación disponible no especifica la longitud de contexto exacta de este merge en particular.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (con cuantizaciones iMatrix) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit, utilizando la técnica de interpolación slerp sobre múltiples modelos de partida. El modelo base indicado en la ficha es cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0, del que mradermacher ha realizado las cuantizaciones iMatrix. Los tags del repositorio indican que el modelo está orientado a roleplay y storywriting, con la etiqueta "unaligned" y "not-for-all-audiences". No se proporciona información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación. Al tratarse de un modelo sin alineación, es probable que no haya pasado por etapas de RLHF o DPO, lo que explica su carácter no moderado. La principal innovación técnica de esta publicación es el uso de cuantizaciones iMatrix (importance matrix), que preservan mejor la calidad en niveles de compresión agresivos al ponderar los pesos según su importancia.

## Capacidades

- Generación de texto creativo: el modelo está optimizado para narrativa extensa, diálogos de personajes y mundos de ficción.
- Roleplay avanzado: puede sostener conversaciones largas con personajes complejos, manteniendo coherencia a lo largo de múltiples turnos.
- Escritura de historias: adecuado para redactar fanfiction, novelas interactivas y contenido narrativo sin restricciones de contenido.
- Soporte de tool calling: no se especifica en la documentación; al ser un modelo sin alineación y orientado a roleplay, es probable que no conserve esta capacidad de forma fiable.
- Soporte de agentes: no especificado.
- Capacidades multilingües: limitado al inglés, según la etiqueta de idioma del repositorio.
- Capacidades especiales: el modelo es "not-for-all-audiences", por lo que puede generar contenido explícito, ofensivo o inapropiado sin filtros.

## Casos de uso

- Simuladores de roleplay en línea: el modelo puede interpretar personajes con personalidades definidas y mantener coherencia narrativa durante conversaciones largas, lo que lo hace adecuado para aplicaciones tipo juego de rol textual.
- Escritura de fanfiction: su capacidad para generar texto narrativo extenso permite crear historias derivadas de universos existentes, adaptando el tono y estilo del personaje.
- Novelas interactivas: ideal para aplicaciones donde el usuario decide el rumbo de la historia, ya que el modelo puede ramificar la narrativa sin romper el hilo argumental.
- Generación de diálogos para videojuegos: puede producir líneas de diálogo para personajes secundarios o NPCs en juegos narrativos, aprovechando su habilidad para mantener la voz de un personaje.
- Prototipado de contenido creativo: usado por escritores y creadores para explorar ideas, esbozar tramas o desarrollar personajes de forma rápida.
- Investigación en generación de texto sin alineación: su carácter "unaligned" permite estudiar comportamientos de modelos sin moderación, útil en análisis de sesgos, toxicidad o dinámicas de roleplay extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida. Los tamaños de archivo van desde 15,4 GB (IQ1_S) hasta 58 GB (Q6_K). Para uso razonable se recomienda Q4_K_M (42,6 GB) o superior.
- GPU recomendadas: A100 80GB, H100 80GB o doble RTX 4090 con NVLink para cuantizaciones Q4 y superiores. En una RTX 4090 (24 GB) solo caben las cuantizaciones más agresivas, como IQ1_M (16,9 GB) o IQ2_XXS (19,2 GB), con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y KoboldCPP para archivos GGUF. vLLM no es compatible directamente con GGUF, aunque se puede usar el modelo en formato safetensors si se convierte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Omega Sapphira Joyous L3.3 70B v1.0 (este modelo) | 70.5B | no disponible | llama3.3 | GGUF | Roleplay, storywriting |
| Omega-Sapphira-L3.3-70B-v1.3-i1-GGUF | 70.5B | no disponible | llama3.3 | GGUF | Roleplay, storywriting (versión posterior) |
| cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0 | 70.5B | no disponible | llama3.3 | Safetensors | Roleplay, storywriting (modelo base) |

La versión v1.3 del mismo merge y el modelo base original son las alternativas más directas. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo sin alineación: puede generar contenido explícito, violento, ofensivo o inapropiado. No apto para todos los públicos.
- Licencia llama3.3: implica restricciones de uso, incluyendo condiciones específicas para uso comercial y redistribución. Es necesario revisar los términos completos antes de su despliegue en producción.
- Idioma limitado: solo inglés. No se recomienda para tareas multilingües.
- Riesgo de alucinación: al igual que otros modelos de este tamaño, puede producir información inventada o incoherente, especialmente en contextos sin restricciones.
- Sin datos de benchmarks: no se ha verificado su rendimiento en tareas estándar, por lo que la calidad es desconocida en comparación con otros modelos.
- Posible pérdida de capacidades: al ser un merge no alineado, puede haber degradado funcionalidades como tool calling o seguimiento de instrucciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.0-i1-GGUF
- Modelo base: https://huggingface.co/cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.0-GGUF
- Versión alternativa v1.3: https://huggingface.co/mradermacher/Omega-Sapphira-L3.3-70B-v1.3-i1-GGUF
- Página del modelo: https://hf.tst.eu/model#Omega_Sapphira_Joyous-L3.3-70B-v1.0-i1-GGUF
