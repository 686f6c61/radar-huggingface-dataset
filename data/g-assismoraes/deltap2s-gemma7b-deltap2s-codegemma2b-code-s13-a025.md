# g-assismoraes/DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a025

## Resumen

DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a025 es un checkpoint fusionado publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo entrenado desde cero, sino del resultado de un experimento de fusión de modelos ("model merging") de la familia Delta-P2S, que combina un Gemma de 7B con un CodeGemma de 2B. La model card es mínima y se limita a indicar que es un "merged checkpoint produced by the family-aware Delta-P2S experiment package", con la ruta de entrenamiento `codegemma2b_to_gemma7b_S13_untie_a025`.

El checkpoint declara 9.324.112.896 parámetros totales en formato safetensors, un tamaño de repositorio de 18,7 GB y la etiqueta `text-generation`. Los tags incluyen `gemma`, `delta-p2s`, `pen2sword`, `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con pipelines de transformers y con TGI. La fecha de creación indicada es el 18 de septiembre de 2026 y el modelo no registra descargas ni "likes".

Por el momento se trata de un artefacto de investigación con documentación prácticamente inexistente: no se publican datos de entrenamiento, benchmarks, licencia ni idiomas soportados. Su relevancia es limitada y se circunscribe al estudio de técnicas de fusión entre un modelo generalista (Gemma) y uno especializado en código (CodeGemma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma / CodeGemma), checkpoint fusionado |
| Parametros totales | 9.324.112.896 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos base Gemma 7B y CodeGemma 2B usan 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la model card; pesos distribuidos sin cuantizar (precisión completa, ~18,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 18,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de base es la de la familia Gemma, es decir, un transformer decoder-only con normalización RMSNorm, activaciones GeGLU y atención con RoPE. El checkpoint no es un entrenamiento nuevo, sino una fusión ("merge") entre un Gemma de 7B y un CodeGemma de 2B. El sufijo `S13` y `a025` de la ruta de entrenamiento apuntan a una configuración concreta del experimento (probablemente semilla o paso 13 y coeficiente alpha 0,025), y el término `untie` sugiere que se han mantenido embeddings de entrada y salida sin atar.

El número de parámetros declarado (9,32B) es superior al de cualquiera de los dos modelos base por separado, lo que es coherente con un esquema de fusión "family-aware" que retiene o expande tensores de ambas familias en lugar de interpolar únicamente pesos de dimensión idéntica. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

Dado que no existe documentación funcional del checkpoint, las capacidades siguientes se infieren de la arquitectura de los modelos base y no están verificadas para este merge concreto:

- Generación de texto generalista, heredada de Gemma 7B.
- Generación y autocompletado de código, heredado de CodeGemma 2B y del componente de código del merge.
- Razonamiento básico y respuesta a instrucciones.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo "thinking", visión, audio): no documentadas.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` a nivel de infraestructura.

## Casos de uso

- Evaluación de técnicas de fusión de modelos: el checkpoint sirve como material de estudio para comparar el efecto de un merge familia-a-familia (Gemma 7B ↔ CodeGemma 2B) con otras estrategias como SLERP, TIES o DARE. Es su uso más realista dado el estado del artefacto.
- Autocompletado de código en editor: si el merge conserva la capacidad de CodeGemma, podría usarse para sugerencias de línea o de bloque, aunque no hay evidencia publicada de su calidad.
- Generación de fragmentos de código en scripts de prototipado: para tareas puntuales donde no se requiera garantía de corrección.
- Experimentación académica sobre "model soups" con modelos de distinto tamaño: el par Gemma 7B / CodeGemma 2B es un caso interesante por la diferencia de escala.
- Reproducción de pipelines de merge en entornos internos: el repo safetensors puede cargarse con transformers para inspeccionar la estructura de pesos resultante.
- Base para fine-tuning posterior: si la licencia lo permitiese (no está declarada), podría servir como punto de partida para ajuste específico en dominios de código.
- Pruebas de compatibilidad con TGI: el tag `text-generation-inference` permite desplegarlo en ese servidor para medir latencia y throughput del checkpoint fusionado.

En todos los casos anteriores debe tenerse en cuenta que no existe ningún benchmark ni validación publicada que respalde el rendimiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de ningún otro conjunto de evaluación, y tampoco se han encontrado referencias externas al experimento en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada en precisión completa (BF16/FP16): aproximadamente 18,7 GB solo para los pesos, a lo que hay que sumar la caché KV. El tamaño del repositorio (18,7 GB) es coherente con esta cifra.
- VRAM estimada en cuantización INT8: en torno a 9,5 GB.
- VRAM estimada en cuantización INT4: en torno a 5 GB, aunque no se distribuyen versiones cuantizadas en el repositorio.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S o cualquier GPU con más de 24 GB de VRAM.
- Cabe en GPU de consumo: sí, en una RTX 3090 o RTX 4090 de 24 GB en BF16 el ajuste es muy justo (los 18,7 GB de pesos más la caché KV para contexto largo pueden agotar la memoria); en INT8 o INT4 sería holgado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito) y, presumiblemente, vLLM. No se ofrecen ficheros GGUF, por lo que llama.cpp y Ollama no son utilizables sin una conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaP2S-Gemma7B-CodeGemma2B-S13-a025 | 9,32B | no disponible | no disponible | no disponible | safetensors en HuggingFace |
| Gemma 7B | 8,5B | 8.192 tokens | benchmarks publicados por Google | Gemma Terms of Use | safetensors en HuggingFace |
| CodeGemma 2B | 2,5B | 8.192 tokens | benchmarks publicados por Google | Gemma Terms of Use | safetensors en HuggingFace |
| CodeGemma 7B | 8,5B | 8.192 tokens | benchmarks publicados por Google | Gemma Terms of Use | safetensors en HuggingFace |

No se dispone de datos de rendimiento del checkpoint fusionado que permitan una comparación cuantitativa con las alternativas. La comparativa se limita, por tanto, a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe el procedimiento de fusión, los datos usados ni las métricas obtenidas.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución. Al derivar de modelos Gemma, es probable que apliquen los Gemma Terms of Use, pero esto no está confirmado por el autor.
- Ausencia total de benchmarks: no hay evidencia de que el merge preserve o mejore las capacidades de los modelos base; la fusión podría degradarlas.
- Riesgo elevado de alucinación y de código incorrecto, especialmente si el merge ha distorsionado los pesos especializados de CodeGemma.
- Idiomas soportados no especificados: se desconoce el comportamiento en castellano y en otros idiomas distintos del inglés.
- Fecha de creación futura (2026-09-18) y cero descargas: indique que el artefacto es muy reciente y no ha sido validado por la comunidad.
- El esquema `untie` con 9,32B de parámetros sugiere un checkpoint posiblemente sobredimensionado respecto a los modelos base, lo que puede implicar ineficiencias de memoria y de cómputo.
- No recomendado para producción sin una evaluación propia previa y sin aclaración de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Gemma7B-DeltaP2S-CodeGemma2B-Code-S13-a025
- No se han encontrado papers, blogs, repositorios ni demos asociados al experimento Delta-P2S en la búsqueda web realizada.
