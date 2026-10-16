# hhernandezalexander/postdoc-retrieval

## Resumen

`hhernandezalexander/postdoc-retrieval` es un prototipo de investigación publicado en HuggingFace que implementa una arquitectura denominada Cnn Transformer orientada a tareas de recuperación (retrieval). El repositorio lo firma el usuario hhernandezalexander y se distribuye bajo licencia BSD-3-Clause. No es un modelo entrenado: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y que no se presenta ningún resultado de benchmark.

La escala declarada es "base", pero el recuento real de parámetros leído del fichero safetensors es de 24.832 parámetros, es decir, un modelo de juguete de aproximadamente 25 mil parámetros, no un transformer de escala base en el sentido habitual del término. El repositorio ocupa menos de 0,1 GB y no registra descargas ni interacciones, por lo que se trata de un artefacto de investigación en estado embrionario.

Su relevancia es por tanto metodológica y no de producto: sirve como plantilla reproducible para experimentar con hibridaciones CNN + transformer, atención lineal y normalización RMSNorm en tareas de recuperación, siempre que se entrene de cero y se evalúe con protocolos comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida CNN + transformer) |
| Parametros totales | 24.832 (según el fichero safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declara ninguno en la model card) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch); incluye `config.json`, `training_args.json` y `predict.py` |

## Arquitectura y entrenamiento

La model card describe una arquitectura híbrida con atención de tipo lineal, fusión mediante "concat mlp", activación swish y normalización RMSNorm. La combinación de convoluciones y bloques de atención sugiere un diseño pensado para extraer representaciones locales (CNN) y modelar dependencias globales (transformer) sobre pares consulta-documento o imagen-texto. No se especifican número de capas, dimensión oculta, número de cabezas ni tamaño de vocabulario, y la `config.json` solo se menciona como registro de los ajustes generados.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con el optimizador AdamW y un scheduler de tipo coseno, pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No se declara número de tokens, composición del dataset, ni fases de ajuste como RLHF o DPO. La model card propone como primera evaluación razonable el conjunto Flickr30k, con métrica reportada sobre al menos tres semillas y una línea base de capacidad equiparable.

## Capacidades

- No se documenta ninguna capacidad verificada: el checkpoint no ha sido entrenado ni auditado.
- Generación de texto, razonamiento, código o matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible, no se declara ningún idioma.
- Capacidad especial declarada: ninguna. El modelo está orientado, en el diseño, a tareas de recuperación (retrieval), presumiblemente multimodal dado que Flickr30k se propone como conjunto de evaluación.
- Incluye un script `predict.py` con un ejemplo de smoke test en su bloque `__main__`, útil para comprobar que la implementación se ejecuta, no para medir calidad.

## Casos de uso

- Investigación en arquitecturas híbridas: el repositorio sirve como base para estudiar cómo se comporta una fusión CNN + transformer con atención lineal frente a un transformer puro, manteniendo constante el presupuesto de datos y semillas.
- Ablación de componentes: al exponer `config.json` y `training_args.json`, permite modificar normalización (RMSNorm frente a LayerNorm), activación (swish frente a GELU) y mecanismo de fusión ("concat mlp" frente a otras alternativas) y medir el impacto en recuperación.
- Protocolo de evaluación reproducible: el propio autor propone Flickr30k con al menos tres semillas y una línea base de capacidad equiparable, lo que lo convierte en una plantilla útil para diseñar experimentos comparables.
- Docencia y formación: con 24.832 parámetros y menos de 0,1 GB de repositorio, es adecuado para que estudiantes inspeccionen el ciclo completo de carga de safetensors, configuración y ejecución de un modelo en una máquina sin GPU.
- Verificación de pipelines de despliegue: sirve como carga sintética para probar integraciones de CI/CD, serialización safetensors y empaquetado antes de sustituirlo por un checkpoint entrenado de mayor tamaño.
- Pruebas de humo en infraestructura: al ser tan pequeño, se puede ejecutar en cualquier contenedor para validar versiones de PyTorch, disponibilidad de dispositivos y rutas de artefactos.
- Base para reentrenamiento en dominios concretos: un equipo podría adoptar el código y entrenarlo desde cero sobre su propio corpus de recuperación, asumiendo que el rendimiento dependerá íntegramente de ese entrenamiento, no del checkpoint publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado, por lo que no existen cifras de MMLU, HumanEval, GSM8K, Recall@K ni de ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 MB en fp32 (24.832 parámetros × 4 bytes) y unos 0,05 MB en fp16. El coste dominante no son los pesos, sino el grafo de activaciones.
- GPU recomendadas: ninguna en particular. Cualquier GPU, incluida una integrada, es sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU. También cabría en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Dado que es una implementación personalizada, la model card advierte que las API genéricas de carga automática requieren un adaptador explícito; la vía prevista es `python predict.py`.
- Latencia y throughput estimados: no disponible. No se publican mediciones y, al no estar entrenado, cualquier cifra carecería de significado práctico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hhernandezalexander/postdoc-retrieval | 24.832 | no disponible | No declarado (checkpoint sin entrenar) | BSD-3-Clause | HuggingFace, 0 descargas |
| CLIP ViT-B/32 (datos públicos de referencia) | ~151 M | 77 tokens de texto | Publicado por OpenAI sobre múltiples conjuntos | MIT | HuggingFace y OpenAI |

La comparativa con alternativas consolidadas de recuperación multimodal no es significativa en términos de rendimiento, porque este repositorio no incluye un checkpoint entrenado ni métricas. La única comparación honesta posible es de orden de magnitud: los modelos de recuperación imagen-texto de uso común manejan decenas o cientos de millones de parámetros, mientras que este prototipo declara 24.832. No se dispone de otros modelos comparables publicados por el mismo autor.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización sin entrenar; no ha sido auditado en robustez, equidad ni transferencia de dominio, tal como reconoce la model card.
- Riesgo de alucinación y de salidas sin sentido: no evaluable, ya que el modelo no ha recibido entrenamiento.
- No se declara longitud de contexto, idiomas soportados ni tipos de cuantización, lo que impide planificar su uso en producción.
- El repositorio no registra descargas ni valoraciones, y las fechas de creación y actualización (2026-10-16) constan con apenas cinco segundos de diferencia, lo que sugiere una publicación automatizada o incompleta.
- No hay evidencia de una ejecución de entrenamiento completada: la receta AdamW con scheduler coseno son valores por defecto del script.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero la propia model card advierte de que deben revisarse por separado los términos de los datos de origen si se emplean conjuntos externos (por ejemplo, Flickr30k).
- Es una implementación personalizada: no funciona con las API genéricas de carga automática de HuggingFace sin un adaptador explícito.
- Cualquier resultado que se publique en el futuro debe documentarse de forma separada a los valores por defecto incluidos en el repositorio.
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos no guardan ninguna relación con el repositorio y se han descartado.

## Enlaces

- HuggingFace: https://huggingface.co/hhernandezalexander/postdoc-retrieval
- No se han encontrado papers, blogs, repositorios auxiliares ni demos asociados a este modelo en la busqueda web realizada.
