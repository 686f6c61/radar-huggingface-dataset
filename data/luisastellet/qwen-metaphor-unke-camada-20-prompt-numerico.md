# luisastellet/qwen-metaphor-unke-camada-20-prompt-numerico

## Resumen

El modelo `luisastellet/qwen-metaphor-unke-camada-20-prompt-numerico` es un checkpoint de generación de texto publicado en HuggingFace por el usuario `luisastellet`, con 596.049.920 parámetros almacenados en safetensors y un repositorio de 2,4 GB. El tag `qwen3` y el pipeline `text-generation` lo sitúan en la familia Qwen3, y el recuento de parámetros es coherente con una variante de 0,6B con embeddings atados (la cifra coincide con el total de Qwen3-0.6B al contar la matriz de embeddings una sola vez). El nombre del repositorio sugiere un artefacto de experimentación —una "capa 20" y un "prompt numérico"— más que un modelo de producto.

El problema que resuelve, los datos de entrenamiento, los idiomas y la licencia no están documentados: la model card es la plantilla automática de HuggingFace sin ninguna sección completada (`[More Information Needed]` en todos los campos). El repositorio registra 0 descargas y 0 likes, y las marcas temporales de creación y actualización (25 de octubre de 2026, con 28 segundos de diferencia) apuntan a una subida automatizada o a metadatos no fiables.

Por tanto, esta ficha debe leerse como una descripción estructural del artefacto (tamaño, formato, familia arquitectónica y requisitos de despliegue derivados del recuento real de parámetros) y no como una evaluación de capacidades. Cualquier uso en producción exige una validación empírica previa y la aclaración de la licencia por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (según tag `qwen3`; no confirmado en la model card) |
| Parametros totales | 596.049.920 (recuento real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se distribuyen en fp32 (2,4 GB), convertibles a bf16, int8 e int4 con herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 2,4 GB |
| Pipeline declarado | `text-generation` |
| Tags del repositorio | `transformers`, `safetensors`, `qwen3`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us` |
| Fecha de creación / actualización | 2026-10-25T01:37:17Z / 2026-10-25T01:37:45Z (28 segundos de diferencia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer decoder-only de la familia Qwen3, con 596.049.920 parámetros en safetensors. El tamaño del repositorio (2,4 GB) equivale prácticamente a 4 bytes por parámetro, lo que indica que los pesos se han subido en fp32 sin cuantizar. El tag `conversational` sugiere que la plantilla de chat esperada es la de Qwen3, pero no hay confirmación documental del tokenizador, del chat template ni de la ventana de contexto configurada.

No hay ningún dato sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento). El nombre del repositorio (`camada-20`, probablemente "capa 20", y `prompt-numerico`) apunta a un experimento de extracción o intervención sobre una capa intermedia, o a un ajuste con prompts numéricos, pero es una hipótesis a partir del identificador y no un dato verificado.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Conversación multi-turno: el tag `conversational` lo indica, aunque no se ha verificado el formato de prompt ni el comportamiento real en diálogo.
- Razonamiento, matemáticas y código: no disponible; no hay evaluación publicada ni indicios en la documentación.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de llamada a herramientas.
- Uso como agente o razonamiento multi-paso: no disponible; un modelo de ~0,6B tiene además un margen limitado para cadenas de razonamiento largas.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el repositorio no incluye torre visual ni procesador multimodal.

## Casos de uso

- Validación de pipelines de despliegue: por su tamaño (2,4 GB en fp32) es útil como modelo de prueba para verificar extremo a extremo un stack de `transformers`, TGI o endpoints compatibles antes de mover cargas mayores. Los tags `text-generation-inference` y `endpoints_compatible` facilitan esta tarea.
- Experimentación en interpretabilidad: si el identificador refleja realmente una intervención sobre la capa 20, el checkpoint sirve para comparar activaciones o representaciones internas frente al modelo base, siempre que se documente la intervención.
- Generación de texto en CPU o hardware modesto: con ~1,2 GB en bf16 o ~0,35 GB en int4, cabe en entornos sin GPU dedicada para tareas de baja concurrencia (borradores, resúmenes cortos, reformulación).
- Etiquetado y aumento de datos sintéticos: útil para preetiquetar corpus pequeños o generar variaciones de texto en experimentos internos donde el coste por token importa más que la calidad punta.
- Docencia y demostraciones: un modelo de 0,6B permite mostrar el ciclo completo de carga, tokenización, generación y cuantización en un portátil, sin infraestructura de servidor.
- Pruebas de robustez y de sesgo a pequeña escala: sirve como caso base para estudiar cómo se degradan las respuestas de un modelo pequeño en dominios especializados, comparándolo con su familia de origen.
- Prototipado de productos conversacionales: antes de invertir en un modelo mayor, se puede esbozar la lógica de diálogo y el formato de salida con este checkpoint, aceptando que la calidad final no será representativa del sistema en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación completada (`Results: [More Information Needed]`) y la búsqueda web no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,4 GB en fp32 (tamaño exacto del repositorio), ~1,2 GB en bf16, ~0,6 GB en int8 y ~0,35 GB en int4, más la caché KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria es suficiente en bf16 (RTX 3050, RTX 4060, T4, L4). Para servir con concurrencia alta, una L4 o A10 resulta holgada; A100/H100 no aportan ventaja a este tamaño y quedan limitadas por el ancho de banda.
- Cabe en GPU de consumo: sí, en toda la gama actual (RTX 3060/4060/4090, e incluso iGPU con suficiente memoria compartida), y también en CPU con 4 GB de RAM libre en cuantización int8/int4.
- Opciones de despliegue: `transformers` de forma nativa; TGI (el tag `text-generation-inference` lo indica); endpoints compatibles de HuggingFace. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas; en este rango de tamaño el coste por token está dominado por el ancho de banda de memoria y por el coste de la capa de embeddings, no por la capacidad de cómputo.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de sus respectivos proveedores y no se han verificado contra este repositorio.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`qwen-metaphor-unke-camada-20-prompt-numerico`) | 596.049.920 | no disponible | no disponible | no | 0 descargas, 0 likes |
| Qwen3-0.6B | ~0,6B (0,44B sin embeddings) | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | sí, en la model card oficial | amplia, con GGUF de terceros |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Apache 2.0 | sí, en la model card oficial | amplia |
| Llama 3.2 1B | ~1,24B | 128.000 tokens | Llama 3.2 Community License | sí, en la model card oficial | amplia, requiere aceptar la licencia |

Frente a su familia de origen, este checkpoint no aporta ninguna ventaja documentada: mismo orden de magnitud en parámetros, sin contexto declarado, sin licencia y sin evaluación. Su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática, sin información sobre datos, entrenamiento, uso previsto ni limitaciones. No es posible evaluar el modelo con criterios técnicos.
- Licencia no disponible: no se puede asumir uso comercial. Aunque el modelo base Qwen3 se publica bajo Apache 2.0, un derivado sin licencia explícita deja la situación jurídica sin resolver; hay que contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el ajuste lo ha reducido a un subconjunto.
- Contexto desconocido: no se puede planificar una aplicación con ventanas largas sin conocer el límite real de tokens, y el valor configurado en `config.json` podría diferir del soportado en entrenamiento.
- Riesgo de alucinación: en un modelo de ~0,6B la tasa de afirmaciones falsas es estructuralmente alta, especialmente en dominios factuales o con contexto largo; requiere verificación externa.
- Sesgos: no evaluados. Al no conocerse el dataset de ajuste, no se puede descartar la amplificación de sesgos presentes en el modelo base o introducidos por el proceso de ajuste.
- Madurez del artefacto: 0 descargas, 0 likes, marcas temporales anómalas (creación y actualización separadas por 28 segundos) y un identificador que apunta a un experimento. No hay historial de uso ni issues que permitan inferir estabilidad.
- Pesos en fp32: el repositorio duplica el espacio necesario respecto a bf16. Es un inconveniente menor, pero conviene reconvertir antes de servir en producción.
- Sin garantías de mantenimiento: no hay compromiso del autor de actualizar, corregir o responder a incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-20-prompt-numerico
- Referencia del paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada por la plantilla: https://mlco2.github.io/impact#compute

Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo. Los resultados obtenidos corresponden íntegramente a páginas de una marca de ropa sin relación con el artefacto, por lo que se han descartado. No se han encontrado papers, blogs, repositorios ni demos asociados.
