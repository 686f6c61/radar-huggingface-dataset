# Austriani/MiniCPM5-2B-Heretic-ARA-ik_llama.cpp

## Resumen

MiniCPM5-2B-Heretic-ARA-ik_llama.cpp es una cuantizacion en formato GGUF del modelo dalatexcoder/MiniCPM5-2B-heretic-ara, publicada por el usuario Austriani. Se trata de un modelo de lenguaje pequeno (SLM) de aproximadamente 2.000 millones de parametros, derivado de la familia MiniCPM y sometido a un proceso de "abliteration" (eliminacion de rechazos) que da lugar a una variante sin censura (uncensored/heretic) orientada a generacion de texto, codigo y razonamiento con cadena de pensamiento (CoT).

La relevancia de esta publicacion es fundamentalmente practica: ofrece pesos cuantizados en IQ4_KS con imatrix, optimizados para el fork ik_llama.cpp, lo que permite ejecutar el modelo en CPU con requisitos de memoria reducidos. El autor indica que ha generado el BF16 de referencia y que las cuantizaciones estan "baked" correctamente, aunque advierte de un problema notable de repetitividad incluso en Q8_0 y BF16.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card tecnica detallada, sin idiomas declarados y sin resultados de benchmarks. La informacion disponible sobre arquitectura, datos de entrenamiento y rendimiento es muy limitada, por lo que esta ficha se limita a lo verificable a partir de los metadatos y la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MiniCPM, transformer, sin confirmar) |
| Parametros totales | aproximadamente 2B (segun nombre y tag "2B") |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS con imatrix (variante _R4); el autor menciona tambien Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp); BF16 generado por el autor |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Por el nombre y los tags se infiere que deriva de MiniCPM5-2B, un transformer de aproximadamente 2.000 millones de parametros, pero no se confirma ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion, ni la longitud de contexto nativa.

El modelo base dalatexcoder/MiniCPM5-2B-heretic-ara incorpora tecnicas de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) y un ajuste orientado a razonamiento con CoT y codigo, segun los tags. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. La publicacion de Austriani se limita a la conversion y cuantizacion: el autor afirma haber generado el BF16 de referencia y las cuantizaciones IQ4_KS con imatrix para ik_llama.cpp, sin aportar detalles adicionales sobre el proceso.

## Capacidades

- Generacion de texto general en un modelo de 2B, con calidad limitada por el tamano.
- Generacion de codigo: los tags "coding" y "code" indican ajuste especifico para tareas de programacion.
- Razonamiento con cadena de pensamiento (CoT), segun el tag "reasoning" y "CoT".
- Modo sin censura (abliterated/heretic): el modelo no aplica rechazos ante contenido sensible, incluido NSFW.
- Ejecucion en CPU: cuantizacion IQ4_KS optimizada para ik_llama.cpp, pensada para entornos sin GPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues explicitas.

## Casos de uso

- Inferencia en CPU sin GPU: la cuantizacion IQ4_KS con imatrix esta disenada para ik_llama.cpp, de modo que el modelo puede ejecutarse en portatiles o servidores sin acelerador, con un consumo de memoria en torno a 1,5-2 GB para los pesos.
- Prototipado rapido de asistentes de codigo: el ajuste orientado a codigo permite autocompletar fragmentos y explicar funciones en entornos de desarrollo locales, aunque la calidad sera inferior a la de modelos mayores.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la eliminacion de rechazos en modelos pequenos y su impacto en la coherencia.
- Generacion de texto creativo sin filtros: el caracter uncensored permite explorar narrativa o roleplay sin restricciones de contenido, con la advertencia de repetitividad del autor.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio de cuantizacion IQ4_KS con imatrix y su efecto en la calidad frente a Q8_0 y BF16.
- Despliegue en dispositivos con memoria muy limitada: al tratarse de un modelo de 2B en 4 bits, encaja en Raspberry Pi de gama alta, mini-PC o contenedores con poca RAM, siempre que se acepte la degradacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: en torno a 1,5-2 GB para los pesos IQ4_KS; anadir el espacio de contexto y el overhead del runtime (tipicamente 0,5-1 GB adicionales).
- GPU recomendadas: no requiere GPU; cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) puede alojarlo con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, y en CPU.
- Opciones de despliegue: ik_llama.cpp (objetivo principal de esta cuantizacion); llama.cpp y Ollama como alternativas compatibles con GGUF, aunque la cuantizacion IQ4_KS_R4 esta pensada para ik_llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Heretic-ARA-ik_llama.cpp | ~2B | no disponible | Apache 2.0 | GGUF IQ4_KS | Variante abliterated, sin benchmarks |
| MiniCPM5-2B (base) | ~2B | no disponible | no disponible | safetensors | Modelo original de la familia, con censura |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa pequena con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community | safetensors, GGUF | Alternativa pequena con contexto largo |

La comparacion es orientativa: no hay datos de rendimiento del modelo de Austriani que permitan una confrontacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Repetitividad: el propio autor advierte de que el modelo puede ser "super repetitivo" incluso en Q8_0 y BF16, y recomienda usar samplers anti-repeticion agresivos.
- Sin benchmarks ni evaluacion: no hay datos objetivos de calidad, por lo que no es recomendable para produccion sin validacion previa.
- Modelo abliterated: la eliminacion de rechazos puede degradar la coherencia y aumentar la probabilidad de salidas incoherentes o inseguras; no apto para aplicaciones con requisitos de moderacion.
- Contenido NSFW: el modelo esta etiquetado como no apto para todas las audiencias; requiere control de acceso en despliegues publicos.
- Idiomas no declarados: se desconoce el soporte multilingue real; probablemente este optimizado para ingles y chino, pero no se confirma.
- Contexto desconocido: al no documentarse la longitud de contexto, no se debe asumir una ventana larga.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no documentadas.
- Popularidad nula: cero descargas y cero likes; no hay comunidad que haya validado la cuantizacion.
- Dependencia de ik_llama.cpp: la cuantizacion IQ4_KS_R4 puede no cargar correctamente en versiones estandar de llama.cpp.

## Enlaces

- HuggingFace: https://huggingface.co/Austriani/MiniCPM5-2B-Heretic-ARA-ik_llama.cpp
- Modelo base: https://huggingface.co/dalatexcoder/MiniCPM5-2B-heretic-ara
- Repositorio ik_llama.cpp: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
