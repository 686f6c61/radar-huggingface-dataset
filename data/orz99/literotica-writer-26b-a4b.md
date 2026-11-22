# orz99/Literotica-Writer-26B-A4B

## Resumen
Literotica-Writer-26B-A4B es un ajuste fino por LoRA del modelo TrevorJS/gemma-4-26B-A4B-it-uncensored, una variante abliterada de Gemma 4 con arquitectura Mixture of Experts (128 expertos, 8 activos). Lo desarrolla el usuario orz99 y su proposito es especializar el modelo base en la generacion de ficcion erotica de formato largo en ingles, a partir de una cabecera estructurada que describe titulo, categoria, etiquetas, longitud y premisa.

El modelo resuelve un problema concreto: los modelos generalistas suelen producir relatos cortos, incoherentes o que no terminan solos cuando se les pide ficcion adulta extensa. Este ajuste aprende a escribir historias completas de entre 1.000 y 5.000 palabras que concluyen por si mismas mediante el token EOS, y ademas admite la generacion por partes (apertura, continuacion y cierre) para piezas mas largas.

Es relevante ahora porque demuestra que un modelo de 26.000 millones de parametros (unos 4.000 millones activos) puede ejecutarse en una GPU de 8 GB gracias a la cuantizacion i1-Q4_K_M, que mantiene los expertos en RAM del sistema. Se distribuye bajo licencia Apache 2.0, con pesos en GGUF y safetensors, y esta pensado exclusivamente para completado de texto, no para chat.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4), 128 expertos con 8 activos |
| Parametros totales | 25.233.142.046 (~25,2 mil millones) |
| Parametros activos | ~4 mil millones (A4B) |
| Longitud de contexto | 8.192 tokens (contexto de empaquetado usado en el entrenamiento; no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | i1-Q4_K_M (16,8 GB) y Q8_0 (26,9 GB); incluye imatrix para generar cuantizaciones propias |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (i1-Q4_K_M, Q8_0, imatrix) y safetensors (adaptador LoRA en PEFT/Unsloth) |

## Arquitectura y entrenamiento
El modelo base es Gemma 4 26B-A4B, un transformer de tipo Mixture of Experts con 128 expertos y 8 activos por token, en su variante abliterada (sin rechazos aprendidos) publicada por TrevorJS. Sobre el se aplico un LoRA de rango 64 y alpha 64 en las capas de atencion y en los 128 expertos, usando la libreria Unsloth. El resultado es un modelo de 25.233.142.046 parametros totales con unos 4.000 millones activos por paso de inferencia.

El entrenamiento utilizo 9.315 relatos y fragmentos del dataset detain/literotica-stories, cubriendo 25 categorias, de los cuales 3.003 procedian de historias mejor valoradas. Se realizaron 2 epocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens, learning rate 2e-4 con decaimiento coseno, durante aproximadamente 4,7 horas en una H100. La perdida final fue de 2,36 en entrenamiento y 2,32 en validacion. El formato de entrenamiento es completado de texto plano a partir de una cabecera fija, sin turnos de conversacion.

## Capacidades
- Generacion de ficcion erotica de formato largo en ingles, con relatos completos de 1.000 a 5.000 palabras que terminan por si mismos.
- Generacion por partes para historias mas largas: apertura, continuacion y parte final, con bloque `Previously:` para mantener coherencia.
- Seguimiento de una cabecera estructurada con titulo, categoria, etiquetas, tipo, longitud y premisa.
- Adaptacion a categorias especificas de Literotica (Romance, BDSM, Sci-Fi & Fantasy, Erotic Horror, entre otras).
- Control aproximado de la longitud del relato mediante el campo `Length`.
- Completado de texto plano, sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo de pensamiento.
- Multilingue limitado: solo entrenado y validado en ingles.

## Casos de uso
- Generacion de relatos eroticos completos: a partir de una cabecera con premisa y longitud, el modelo produce una historia terminada de 1.000 a 5.000 palabras, adecuada para plataformas de ficcion adulta o publicaciones serializadas.
- Escritura por capitulos de series largas: usando los tipos de continuacion y el bloque `Previously:`, se pueden encadenar partes manteniendo coherencia narrativa en proyectos de decenas de miles de palabras.
- Prototipado editorial: permite a editores generar borradores rapidos por categoria y longitud para evaluar premisas antes de encargar el texto a autores humanos.
- Despliegue local en hardware modesto: con el GGUF i1-Q4_K_M cabe en una GPU de 8 GB con los expertos en RAM, lo que facilita entornos de escritura privados sin enviar contenido sensible a la nube.
- Investigacion sobre generacion de ficcion adulta: sirve como referencia para estudiar coherencia narrativa, cierre automatico y control de longitud en modelos especializados.
- Integracion en front-ends de completado: funciona con SillyTavern en modo Text Completion, KoboldCpp en modo historia o cualquier cliente que use el endpoint `/completion` de llama.cpp.
- Generacion de variantes de una misma premisa: cambiando categoria, etiquetas o longitud en la cabecera se obtienen enfoques distintos del mismo argumento para pruebas A/B de contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida de 2,36 en train y 2,32 en validacion) y una evaluacion cualitativa de palabras corruptas: aproximadamente 1 por cada 9.000 palabras con i1-Q4_K_M, frente a 1 por cada 6.000 o mas en el modelo sin cuantizar.

## Requisitos de hardware
- VRAM estimada: 8 GB con el GGUF i1-Q4_K_M (16,8 GB), manteniendo los expertos en RAM del sistema; el Q8_0 (26,9 GB) requiere bastante mas memoria.
- GPU recomendadas: cualquier GPU con 8 GB o mas para i1-Q4_K_M; para Q8_0 se necesita una GPU de gama alta o mayor capacidad de memoria unificada.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB como la RTX 3060/4060 Ti o superiores, siempre que se acepte el intercambio con RAM del sistema.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli), KoboldCpp, SillyTavern en modo Text Completion; no debe usarse con plantillas de chat ni con `--jinja`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento se realizo en una H100 durante unas 4,7 horas, pero no se publican cifras de inferencia.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | ~25,2 mil millones (MoE, ~4 mil millones activos) | 8.192 tokens (entrenamiento) | Ficcion erotica de formato largo en ingles | Apache 2.0 | GGUF y LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | ~25,2 mil millones (MoE) | No disponible | Modelo base abliterado, uso general | No disponible | Hugging Face |
| Gemma 4 26B-A4B (original) | ~25,2 mil millones (MoE) | No disponible | Modelo generalista con alineamiento | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Contenido exclusivamente para adultos (18+); todas las historias generadas estan pensadas para lectores adultos y el modelo no debe usarse con menores.
- No es un modelo de chat: usar plantillas de chat, `--jinja` o endpoints `/v1/chat/completions` degrada gravemente la calidad y produce respuestas de asistente en lugar de relatos.
- Solo entrenado en ingles; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion y de incoherencias narrativas en relatos muy largos o en continuaciones con contexto insuficiente.
- El modelo base esta abliterado, lo que elimina los rechazos aprendidos y aumenta el riesgo de generar contenido no deseado si se usa fuera de su dominio previsto.
- La cuantizacion Q4_K_M original generaba palabras corruptas (aproximadamente 1 por cada 900 palabras); se recomienda usar i1-Q4_K_M o Q8_0.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas locales sobre material adulto y a las condiciones de las plataformas donde se publique.
- No afiliado ni respaldado por Literotica; el uso del nombre de la plataforma es meramente descriptivo.
- El dataset de entrenamiento procede de historias de Literotica, por lo que puede arrastrar sesgos tematicos y estilisticos propios de esa comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/orz99/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica (sitio de referencia): https://www.literotica.com
