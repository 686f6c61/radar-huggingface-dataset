# DuoNeural/RMSN-SFT-d1664-seed3-451M

## Resumen

RMSN-SFT-d1664-seed3-451M es un modelo de lenguaje publicado por DuoNeural en Hugging Face bajo licencia MIT. El identificador del repositorio indica un modelo afinado mediante SFT (supervised fine-tuning) con un tamaño de aproximadamente 451 millones de parámetros, un identificador interno de configuración "d1664" y la semilla 3 de un experimento reproducible. La etiqueta "rmsn" sugiere una arquitectura o familia propia del autor, aunque la model card no aporta ninguna descripción técnica al respecto.

La información pública disponible es mínima: la model card se limita a metadatos de licencia y etiquetas, sin especificar arquitectura, datos de entrenamiento, contexto, idiomas ni resultados de evaluación. El repositorio ocupa 1,8 GB, un tamaño coherente con pesos en precisión de 32 bits o 16 bits para un modelo de esa magnitud, pero no permite inferir detalles adicionales con fiabilidad.

Por tanto, esta ficha se limita a documentar lo que el autor ha hecho público y marca explícitamente como "no disponible" todo aquello que no consta. Es relevante para quienes siguen la experimentación abierta de DuoNeural o quieran reproducir la semilla concreta, pero no debe tratarse como un modelo listo para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta "rmsn" sugiere una familia propia del autor, sin confirmar) |
| Parametros totales | aproximadamente 451M (deducido del identificador del repositorio) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene 1,8 GB de pesos; no se especifica el formato) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El nombre "RMSN" aparece como etiqueta del repositorio y como parte del identificador, pero la model card no describe si se trata de un transformer decoder-only, una variante con normalización RMSNorm, un modelo híbrido o cualquier otra configuración. Tampoco se detalla el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento posteriores al SFT.

El sufijo "SFT" del identificador indica que el modelo ha pasado por un ajuste supervisado, presumiblemente sobre una base previa del mismo autor, y "seed3" apunta a un experimento repetido con distintas semillas para evaluar variabilidad. "d1664" podría corresponder a una dimensión de modelo, a un identificador de dataset o a una configuración interna, pero no hay confirmación. Cualquier afirmación adicional sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje afinado con SFT, aunque no verificada por el autor.
- Razonamiento y matemáticas: no disponible; no hay evaluaciones publicadas.
- Generación de código: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación académica con semillas: el identificador "seed3" permite reproducir un punto concreto de una serie de entrenamientos y comparar la variabilidad entre semillas en tareas de generación de texto.
- Fine-tuning posterior sobre dominio específico: al ser un modelo pequeño (aproximadamente 451M) con licencia MIT, puede servir como base para ajustes supervisados en tareas concretas con recursos limitados.
- Evaluación comparativa de familias propias: útil para quien quiera contrastar la familia "rmsn" de DuoNeural con otros modelos pequeños de tamaño similar en pruebas internas.
- Prototipado rápido en local: el tamaño reducido permite desplegarlo en una sola GPU de consumo, aunque el formato de pesos no está confirmado y habría que convertirlo si fuese necesario.
- Investigación sobre SFT: al estar etiquetado explícitamente como SFT, puede usarse para estudiar el efecto del ajuste supervisado frente a la base previa, siempre que esta sea accesible.
- Docencia y demostraciones: su licencia permisiva y su tamaño lo hacen manejable para talleres sobre entrenamiento y ajuste de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en fp16 y alrededor de 0,5 GB en cuantización de 8 bits, calculado a partir del tamaño de parámetros; no confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: no se especifican; al no publicarse pesos GGUF, llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son viables si los pesos están en safetensors, extremo no confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-SFT-d1664-seed3-451M | ~451M | no disponible | MIT | Hugging Face |
| Alternativas de ~400-500M | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. La model card no incluye datos de rendimiento ni especificaciones que permitan contrastar con modelos pequeños de otros autores.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento ni evaluación, lo que impide validar su comportamiento.
- Riesgo de alucinación: sin datos de alineamiento ni evaluaciones, no puede descartarse un comportamiento propenso a inventar información.
- Sesgos desconocidos: al no publicarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas sin una prueba previa.
- Licencia MIT: permite uso comercial y modificación, pero no exime al usuario de realizar su propia evaluación y asumir la responsabilidad del despliegue.
- Repositorio sin descargas ni likes: no hay evidencia de uso por parte de la comunidad ni de validación externa.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1664-seed3-451M
- Perfil del autor: https://huggingface.co/DuoNeural
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
