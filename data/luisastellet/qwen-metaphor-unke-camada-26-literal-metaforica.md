# luisastellet/qwen-metaphor-unke-camada-26-literal-metaforica

## Resumen

`luisastellet/qwen-metaphor-unke-camada-26-literal-metaforica` es un modelo de generación de texto publicado en HuggingFace por el usuario `luisastellet`, con 596.049.920 parámetros totales según los metadatos de safetensors y un repositorio de 2,4 GB. Los tags del repositorio lo asocian a la familia Qwen3 (`qwen3`) y a los pipelines de `transformers` y `text-generation-inference`, aunque la model card es la plantilla automática de HuggingFace y no aporta ninguna descripción del modelo, del entrenamiento ni de los datos utilizados.

El identificador del repositorio sugiere un ajuste fino o un experimento de análisis sobre representaciones internas (la cadena "camada-26-literal-metaforica" apunta a la capa 26 y a una tarea de distinción entre lenguaje literal y metafórico), pero no hay documentación publicada que lo confirme. El nombre del autor y el tamaño de parámetros son compatibles con un derivado de Qwen3-0.6B, si bien esta correspondencia es una inferencia a partir de los tags y del recuento de parámetros, no un dato declarado.

Su relevancia ahora es limitada y muy específica: se trata de un artefacto de investigación sin descargas ni validación comunitaria, útil únicamente como objeto de estudio o como base para experimentos propios. No dispone de licencia declarada, de idiomas declarados ni de resultados de evaluación, por lo que no es apto para uso en producción sin una auditoría previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 según los tags del repositorio; detalles no disponibles |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors (no hay GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible (no se declara licencia en los metadatos ni en la model card) |
| Formato de pesos | safetensors (repo de 2,4 GB); compatible con `transformers` |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. Los tags del repositorio (`qwen3`, `transformers`) y el recuento de 596 millones de parámetros apuntan a una arquitectura transformer decoder-only derivada de la familia Qwen3, probablemente con un tamaño cercano a los 0,6B parámetros, pero ni la model card ni los metadatos confirman la arquitectura exacta, el número de capas, la dimensionalidad oculta ni el mecanismo de atención.

Tampoco se dispone de datos sobre el entrenamiento: se desconoce el volumen de tokens, la composición del corpus, si hubo fases de instrucción (SFT), alineamiento con RLHF o DPO, o técnicas de optimización como decodificación especulativa. El único tag con referencia externa es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre el calculador de impacto medioambiental (ML Impact Calculator) citado en la plantilla de model card; no es un paper sobre el modelo ni describe su método de entrenamiento. El identificador "camada-26" sugiere un trabajo de interpretabilidad o de ajuste sobre una capa concreta, pero es una hipótesis no verificada.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada de forma explícita mediante el pipeline `text-generation`.
- Conversación: el tag `conversational` indica que el modelo está formateado para diálogo multi-turno, aunque no se documenta la plantilla de chat utilizada.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`: puede servirse con el stack de TGI y con los endpoints de inferencia de HuggingFace.
- Posible especialización en distinción literal/metafórica: deducida del nombre del repositorio, sin confirmación documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de modelos de investigación: cargar el modelo con `transformers` y ejecutar una batería de prompts controlada para caracterizar su comportamiento, dado que no existe ninguna evaluación publicada y el modelo requiere caracterización antes de cualquier uso.
- Experimentos de lingüística computacional sobre MetaNet / metáfora: si se confirma la especialización que sugiere el identificador, podría emplearse para generar o clasificar pares de frases literales frente a metafóricas en corpus anotados, siempre con validación manual de las salidas.
- Generación de datos sintéticos para prototipos: producir borradores de texto a pequeña escala en local (el modelo cabe en GPU de consumo) para tareas de aumento de datos en experimentos académicos.
- Base para un ajuste fino propio: al ser un derivado pequeño y ligero (596M parámetros, ~1,2 GB en bf16), sirve como punto de partida para un fine-tune específico del dominio, con la salvedad de que la licencia no está declarada.
- Docencia y demostraciones de pipelines: útil para ilustrar el ciclo completo de carga, cuantización y despliegue con TGI o vLLM en un entorno de formación, por su reducido coste de hardware.
- Pruebas de integración de infraestructura: validar pipelines de CI/CD, contenedores de inferencia o pasarelas de API con un modelo pequeño y rápido antes de desplegar modelos mayores.
- Estudio de representaciones por capas: si "camada 26" se refiere efectivamente a una intervención sobre una capa concreta, puede utilizarse para replicar análisis de activaciones o experimentos de probing, siempre que se documente el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación completada (todos los apartados figuran como "[More Information Needed]") y la búsqueda web no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,2 GB en bf16/fp16 (596M parámetros × 2 bytes), aproximadamente 2,4 GB en fp32, unos 0,6 GB en int8 y entre 0,3 y 0,4 GB en cuantización de 4 bits, sin contar la caché KV.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en bf16; una RTX 3060, RTX 4060, RTX 3090, RTX 4090, A10, L4, A100 o H100 cubren el modelo con holgura. En GPUs de 8 GB o menos conviene cuantizar para dejar margen a la caché KV y a lotes mayores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 Ti, etc.), e incluso en CPU con cuantización, aunque no se publican pesos GGUF.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Text Generation Inference (tag `text-generation-inference`), endpoints de HuggingFace (tag `endpoints_compatible`) y, previsiblemente, vLLM. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los valores de los modelos de referencia provienen de su documentación pública y no han sido verificados en esta ficha; se incluyen como orientación de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| luisastellet/qwen-metaphor-unke-camada-26-literal-metaforica | 596.049.920 | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3-0.6B | ~0,6B | 32k (según documentación pública) | Apache-2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B | ~0,49B | 32k (según documentación pública) | Apache-2.0 | HuggingFace |
| Llama 3.2 1B | ~1,24B | 128k (según documentación pública) | Licencia comunitaria de Llama 3.2 | HuggingFace |

La diferencia principal no es de rendimiento, sino de trazabilidad: los tres modelos de referencia cuentan con model card completa, licencia explícita, evaluación publicada y comunidad activa, mientras que este repositorio carece de todos esos elementos y su utilidad comparativa en benchmarks es, a día de hoy, indeterminable.

## Limitaciones y advertencias

- Model card vacía: es la plantilla automática de HuggingFace, sin descripción, datos de entrenamiento, hiperparámetros ni evaluación. No hay información verificable sobre qué hace el modelo.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; en la práctica, el modelo debe tratarse como no apto para producción hasta que el autor la aclare.
- Idiomas no declarados: se desconoce si el modelo conserva el multilingüismo de la familia Qwen3 o si el ajuste lo ha reducido a una sola lengua.
- Contexto desconocido: no se puede planificar un caso de uso con ventanas largas sin conocer el límite real de tokens.
- Riesgo de alucinación: no evaluado; cualquier salida debe validarse, especialmente en tareas factuales.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento ni el proceso de alineamiento, no es posible evaluar sesgos de género, etnia, idioma o dominio.
- Tag `arxiv:1910.09700` engañoso: remite al artículo del calculador de impacto ambiental de Lacoste et al., no a un paper sobre el modelo; no debe citarse como referencia técnica del mismo.
- Posible sobreajuste a una tarea estrecha: el identificador sugiere un ajuste muy específico (literal frente a metafórico, capa 26), lo que puede degradar el rendimiento en generación generalista.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican ausencia de informes de terceros sobre calidad, estabilidad o comportamiento.
- Repositorio de 2,4 GB para 596M parámetros: conviene inspeccionar los ficheros antes de descargar, ya que el tamaño no coincide exactamente con un único checkpoint en bf16 y podría incluir pesos duplicados o en fp32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-26-literal-metaforica
- Artículo referenciado en los tags (Lacoste et al., 2019, sobre cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental citado en la model card: https://mlco2.github.io/impact
- Paper, blog, repositorio o demo específicos del modelo: no disponible
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos correspondían a anuncios clasificados y se han descartado por no ser pertinentes.
