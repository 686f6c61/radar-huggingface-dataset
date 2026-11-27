# ouzoouz/edu-mobile-llm

## Resumen

edu-mobile-llm es un modelo de lenguaje conversacional publicado por el usuario ouzoouz en Hugging Face bajo licencia Apache 2.0. Se distribuye en formato GGUF, lo que lo orienta a inferencia en entornos con recursos limitados, y cuenta con aproximadamente 999,9 millones de parámetros según los pesos en safetensors del repositorio. El nombre sugiere un enfoque hacia dispositivos móviles y casos educativos, aunque la model card no incluye documentación técnica que lo confirme.

La información pública disponible es muy escasa: la model card se limita a declarar la licencia, no especifica arquitectura, longitud de contexto, idiomas soportados ni datos de entrenamiento. El repositorio tiene 5,5 GB, un tamaño coherente con la presencia de múltiples ficheros GGUF además de los pesos originales. Con 220 descargas y ningún "like", se trata de un modelo de nicho sin validación comunitaria significativa.

Por su escala cercana a los 1.000 millones de parámetros y su empaquetado GGUF, resulta relevante para quienes buscan un modelo pequeño que quepa en hardware de consumo o en un teléfono, pero debe evaluarse con cautela: la ausencia de benchmarks, de ficha técnica y de historial de uso hace imposible verificar sus capacidades reales sin probarlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 999.885.952 (aprox. 1.000 M) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo: la model card no indica si se trata de un transformer decoder-only, un modelo híbrido o cualquier otra variante, ni detalla la composición del vocabulario, el número de capas o las dimensiones ocultas. Tampoco se especifica el número de tokens de entrenamiento, la procedencia de los datos ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. El tag "conversational" del repositorio indica únicamente que está pensado para diálogo, sin más detalle.

El único dato estructural fiable es el recuento de parámetros en safetensors (999.885.952), que sitúa al modelo en la franja de los modelos pequeños de aproximadamente 1.000 millones de parámetros. La presencia de ficheros GGUF sugiere que el autor ha generado cuantizaciones para llama.cpp u otro runtime compatible, pero no se documenta qué niveles de cuantización están disponibles ni con qué herramientas se produjeron.

## Capacidades

- Generación de texto conversacional, según el tag "conversational" del repositorio.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), lo que indica que puede desplegarse a través de la infraestructura de inferencia de Hugging Face.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe ni qué idiomas cubre.
- No se documenta modo thinking, visión, audio ni ninguna capacidad multimodal.
- No se documenta capacidad específica de código o matemáticas.

## Casos de uso

- Prototipado rápido en local: al distribuirse en GGUF y rondar los 1.000 millones de parámetros, puede cargarse en un portátil con llama.cpp para probar flujos conversacionales sin depender de la nube.
- Aplicaciones educativas experimentales: el nombre del modelo sugiere un uso formativo; puede emplearse como base para tutores conversacionales sencillos, siempre que se validen sus respuestas con supervisión humana.
- Inferencia en dispositivos móviles o de bajos recursos: el tamaño y el formato permiten integrarlo en apps que necesiten un modelo local sin conexión, aceptando la pérdida de calidad frente a modelos mayores.
- Filtrado y clasificación de texto ligera: para tareas de etiquetado simple o resumen corto donde la latencia importa más que la precisión máxima.
- Base para fine-tuning: al estar bajo Apache 2.0 y tener ~1.000 M de parámetros, es un candidato manejable para ajuste fino en un único acelerador con datasets pequeños de dominio.
- Evaluación comparativa de modelos pequeños: útil como referencia en experimentos que midan el coste y la calidad de modelos de ~1B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 2 GB solo para pesos (1.000 M × 2 bytes), más overhead de contexto y caché KV; en cuantización de 4 bits, del orden de 0,6-0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; para cuantizaciones de 4 bits basta una GPU integrada o una GTX 1650 con 4 GB.
- Cabe en GPU de consumo: sí, con holgura, en tarjetas como RTX 3060, RTX 4060 o superiores, y previsiblemente en muchas iGPU modernas con cuantización agresiva.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para los ficheros GGUF; vLLM o TGI solo si se dispone de los pesos safetensors y se confirma compatibilidad de arquitectura, algo no documentado.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ouzoouz/edu-mobile-llm | ~1.000 M | no disponible | Apache 2.0 | safetensors, GGUF | Sin benchmarks ni documentación técnica |
| Llama 3.2 1B (Meta) | ~1.240 M | 128K | Llama 3.2 Community License | safetensors, GGUF | Documentación completa y benchmarks publicados |
| Qwen2.5 1.5B (Alibaba) | ~1.540 M | 32K | Apache 2.0 | safetensors, GGUF | Benchmarks publicados, buen rendimiento en código y multilingüe |
| Gemma 2 2B (Google) | ~2.600 M | 8K | Gemma Terms of Use | safetensors, GGUF | Documentación completa, restricciones de uso comercial |

La comparación es estructural: frente a estos modelos, edu-mobile-llm carece de ficha técnica, benchmarks y comunidad, por lo que la elección entre ellos debería basarse en la documentación disponible de las alternativas salvo que se realice una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, datos de entrenamiento ni contexto máximo, lo que impide anticipar su comportamiento en producción.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad en razonamiento, código, matemáticas o multilingüismo.
- Riesgo de alucinación desconocido pero probablemente alto para su escala; no hay datos de alineación que lo mitiguen.
- Sesgos desconocidos: al no documentarse la composición del dataset, no puede evaluarse el sesgo demográfico, cultural o lingüístico.
- Idiomas no especificados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma concreto.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar de forma independiente que los datos de entrenamiento no introduzcan obligaciones adicionales, algo que el autor no aclara.
- Sin validación comunitaria (0 likes, 220 descargas): no existen informes de terceros sobre su funcionamiento real.
- Fecha de creación y actualización futuras en los metadatos: conviene comprobar si el repositorio se mantiene activo antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ouzoouz/edu-mobile-llm
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
