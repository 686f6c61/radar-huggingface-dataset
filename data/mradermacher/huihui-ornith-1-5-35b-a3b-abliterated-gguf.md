# mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF es una cuantizacion en formato GGUF del modelo Ornith-1.5-35B-A3B, desarrollado originalmente por Ornith AI y posteriormente modificado por huihui-ai mediante la tecnica de "abliteration" (eliminacion de capas de rechazo). Este modelo es una variante de la familia Qwen3, con una arquitectura de mezcla de expertos (MoE) de 35 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token. La version GGUF, preparada por mradermacher, permite su ejecucion en entornos locales con recursos limitados, incluyendo CPU y GPUs de consumo, mediante herramientas como llama.cpp u Ollama.

El modelo destaca por su caracter "uncensored" (sin censura), lo que lo hace atractivo para experimentacion en escenarios donde los modelos alineados imponen restricciones, aunque con los riesgos eticos asociados. Ademas, incluye un suplemento multimodal (mmproj) que permite procesar imagenes, lo que amplia su versatilidad. Con una ventana de contexto de hasta 256k tokens (segun fuentes externas), es adecuado para tareas de generacion de texto, codigo y razonamiento complejo en ingles. La licencia MIT facilita su uso comercial y la redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3 mil millones (A3B) |
| Longitud de contexto | hasta 256k tokens (segun fuentes de la comunidad) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion de mradermacher) |

## Arquitectura y entrenamiento
La arquitectura es una mezcla de expertos (MoE) derivada de Qwen3, con 35 mil millones de parametros totales y solo 3 mil millones activos por token, lo que reduce el coste computacional en inferencia. El modelo base Ornith-1.5 se ha entrenado mediante un proceso de "auto-mejora" end-to-end, aunque los detalles especificos del dataset de entrenamiento y la metodologia exacta no se han publicado en la informacion disponible. El proceso de "abliteration" aplicado por huihui-ai elimina selectivamente las capas de rechazo (refusal) del modelo, lo que resulta en un comportamiento menos restrictivo y mas permisivo en respuestas a temas controvertidos.

La cuantizacion GGUF realizada por mradermacher es de tipo estatica (sin imatrix), con multiples niveles de precision para adaptarse a distintos hardware. El modelo incluye un suplemento multimodal (mmproj) que permite procesar imagenes, aunque la integracion de vision requiere el uso de ese archivo adicional. No se han publicado detalles sobre el proceso de entrenamiento especifico de la version "abliterated" ni sobre los datos utilizados para la cuantizacion.

## Capacidades
- Generacion de texto en ingles con estilo conversacional y creativo.
- Razonamiento complejo y solucion de problemas en tareas de matematicas y logica (segun la familia Qwen3).
- Soporte de vision multimodal (requiere el archivo mmproj) para procesar imagenes.
- Sin capas de rechazo: responde a temas controvertidos o sensibles sin evasivas (con las limitaciones eticas y legales correspondientes).
- Ventana de contexto amplia (hasta 256k tokens) para documentos largos o conversaciones multi-turno.
- Compatible con herramientas de inferencia como llama.cpp, Ollama y vLLM (via formato GGUF).
- Capacidades de agentes y tool calling heredadas de Qwen3, aunque no se ha verificado en esta version cuantizada.

## Casos de uso
- Generacion de contenido creativo sin restricciones: ideal para escritura de ficcion, poesia o guiones donde se requiera explorar temas tabu sin censura previa, gracias a su caracter "abliterated".
- Analisis de documentos largos: con su contexto de hasta 256k tokens, puede resumir o extraer informacion de manuales, contratos o articulos cientificos completos.
- Creacion de chatbots de rol o personajes virtuales: su capacidad de mantener conversaciones largas y su falta de rechazo permiten simular personalidades complejas sin interrupciones por politicas de seguridad.
- Asistencia en programacion: genera codigo, depura errores y explica algoritmos, especialmente en tareas de desarrollo rapido donde la generacion sin restricciones puede acelerar la experimentacion.
- Analisis de imagenes y descripcion de contenido visual: con el suplemento mmproj, puede describir imagenes o extraer informacion de ellas en entornos de investigacion.
- Investigacion academica sobre alineacion y sesgos: permite estudiar el comportamiento de un modelo sin capas de rechazo, lo que es util para comparar con versiones alineadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento y la cuantizacion GGUF no reporta metricas propias. Se recomienda consultar el repositorio de Ornith-1.5 para obtener datos de evaluacion del modelo base, aunque no se ha confirmado si la version "abliterated" mantiene el mismo rendimiento.

## Requisitos de hardware
- VRAM estimada para inferencia:
  - Q4_K_M (21.8 GB): requiere al menos 24 GB de VRAM para ejecutarse completamente en GPU, por ejemplo una RTX 3090 o RTX 4090.
  - Q8_0 (37.9 GB): requiere 48 GB de VRAM, como una A6000 o A100 de 48 GB.
  - Q2_K (13.3 GB): cabe en GPUs de 16 GB como una RTX 4080, con degradacion de calidad.
- GPU recomendadas: para uso local, RTX 3090/4090 (24 GB) para Q4_K_M; para produccion, A100 o H100 con 80 GB para Q8_0.
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama (via importacion de GGUF), vLLM (con soporte para GGUF) o TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion. Con Q4_K_M en RTX 4090, se puede esperar un throughput de 20-40 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares
No se dispone de comparativas directas con otros modelos en la informacion proporcionada. Como referencia de la familia MoE, se pueden mencionar modelos como Qwen2.5-32B-A3B o Mixtral 8x7B, pero no hay datos de rendimiento comparativo en esta ficha. Se recomienda consultar el repositorio de Ornith-1.5 para obtener comparaciones con el modelo base.

## Limitaciones y advertencias
- Sesgos y toxicidad: el modelo "abliterated" no tiene capas de rechazo, por lo que puede generar contenido ofensivo, peligroso o ilegal si se le solicita. No debe utilizarse en aplicaciones publicas sin una moderacion robusta.
- Alucinacion: como cualquier modelo generativo, puede inventar hechos o citas, especialmente en contextos largos o temas especializados.
- Idioma: solo se ha confirmado el ingles; otros idiomas pueden producir resultados de menor calidad.
- Licencia: aunque es MIT, el modelo base (Ornith-1.5) tiene su propia licencia, y la version "abliterated" puede tener restricciones adicionales; se recomienda revisar el repositorio original.
- Cuantizacion estatica: no se ha utilizado imatrix, por lo que la calidad de las cuantizaciones bajas (Q2_K, Q3_K) puede ser inferior a la de otros modelos con imatrix.
- Falta de benchmarks: no hay datos de rendimiento publicados para esta version, lo que dificulta la evaluacion objetiva.

## Enlaces
- HuggingFace del repositorio: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
- Modelo base en HuggingFace: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B (referencia)
- Repositorio para DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
