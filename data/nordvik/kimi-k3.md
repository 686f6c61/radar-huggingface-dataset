# Nordvik/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal de código abierto desarrollado por Moonshot AI, la empresa detrás de la familia Kimi. Con 2,8 billones de parámetros totales (2.779.931.837.184 según los pesos en safetensors), es el primer modelo abierto de clase 3T y el más capaz de la compañía hasta la fecha. Está diseñado para tareas agénticas de largo horizonte, como programación compleja, trabajo de conocimiento y razonamiento, integrando visión nativa (texto, imágenes y vídeo) y una ventana de contexto de 1 millón de tokens. Su arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) sobre un esquema MoE con 896 expertos, de los cuales se activan 16 por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2.

El modelo se distribuye bajo la licencia Kimi K3 (una licencia personalizada de código abierto) y está disponible en Hugging Face a través del repositorio `Nordvik/Kimi-K3`, aunque el desarrollo original corresponde a Moonshot AI, que también publica el modelo en su organización oficial. La liberación de pesos completos de un modelo de esta escala supone un hito en la democratización de la IA de frontera, permitiendo a investigadores y desarrolladores desplegar y adaptar capacidades de nivel puntero en entornos propios. Sin embargo, su tamaño exige infraestructura de múltiples GPU de alta gama o cuantización agresiva, lo que limita su uso práctico a organizaciones con recursos computacionales significativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.779.931.837.184 según pesos safetensors) |
| Parametros activos | 104 mil millones (16 de 896 expertos activos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 (según blog de Hugging Face), 8-bit (según etiquetas del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (licencia personalizada de código abierto) |
| Formato de pesos | safetensors (también disponible en MXFP4 según blog) |

## Arquitectura y entrenamiento

Kimi K3 se basa en una arquitectura Mixture-of-Experts (MoE) con 93 capas, de las cuales 1 es densa y 92 son de atención. La composición de atención incluye 69 capas con Kimi Delta Attention (KDA), una variante de atención lineal híbrida, y 24 capas con Gated Multi-head Latent Attention (Gated MLA). La dimensión oculta de atención es de 7168 con 96 cabezas, y la dimensión del MoE latente es de 3584. Cada experto tiene una dimensión oculta de 3072, sumando 896 expertos en total, de los cuales se seleccionan 16 por token mediante un mecanismo de Stable LatentMoE. Esta combinación de KDA y AttnRes permite reducir el coste computacional del softmax y mejorar la eficiencia de escalado, alcanzando una mejora aproximada de 2,5× en eficiencia global respecto a Kimi K2.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado en la información disponible. Sin embargo, la model card indica que el modelo ha sido entrenado para tareas agénticas de largo horizonte, lo que sugiere un énfasis en datos de razonamiento, programación y multimodalidad. El modelo es nativamente multimodal, procesando texto, imágenes y vídeo dentro de la misma arquitectura, sin módulos separados de visión. La ventana de contexto de 1 millón de tokens es una de las más amplias en modelos abiertos, habilitando tareas que requieren procesar repositorios completos o documentos extensos.

## Capacidades

- Generación de texto y razonamiento complejo de múltiples pasos, incluyendo matemáticas, lógica y análisis.
- Programación de largo horizonte: puede mantener sesiones de ingeniería prolongadas, navegar repositorios masivos y orquestar herramientas de terminal, desde optimización de kernels GPU hasta desarrollo de compiladores.
- Visión nativa: procesa imágenes y vídeo directamente, sin necesidad de adaptadores externos, lo que permite tareas como diseño de juegos con retroalimentación visual, edición de vídeo y análisis de contenido visual.
- Conocimiento agéntico: produce investigación profunda con visualizaciones interactivas, widgets, paneles y diseño de movimiento.
- Soporte de tool calling y function calling: puede integrarse en pipelines agénticos para interactuar con APIs, bases de datos y entornos de ejecución.
- Capacidades multilingües: no se han especificado los idiomas soportados, pero por su origen y entrenamiento probablemente cubre múltiples lenguas; no hay confirmación oficial en la documentación disponible.
- Contexto largo de 1 millón de tokens, ideal para tareas que requieren memoria extensa, como análisis de documentos legales o científicos.

## Casos de uso

- Desarrollo de software a gran escala: Kimi K3 puede gestionar repositorios completos, refactorizar código, generar tests y ejecutar comandos de terminal en sesiones autónomas, reduciendo la intervención humana en tareas de mantenimiento y optimización.
- Investigación académica automatizada: con su capacidad de razonamiento y contexto largo, puede analizar cientos de papers, extraer conclusiones y generar informes estructurados con gráficos y tablas.
- Asistente de diseño y creación multimedia: gracias a su visión nativa, puede generar y editar vídeo, crear animaciones y diseñar interfaces interactivas a partir de descripciones textuales.
- Atención al cliente con contexto extenso: la ventana de 1M tokens permite mantener conversaciones con historial completo de interacciones, mejorando la coherencia y personalización en servicios de soporte.
- Análisis de documentos legales y financieros: procesa contratos, informes anuales o expedientes extensos, extrayendo cláusulas relevantes y detectando inconsistencias.
- Automatización de pipelines de datos: con tool calling, puede orquestar flujos de extracción, transformación y carga (ETL), así como generar visualizaciones de datos en tiempo real.
- Educación y tutoría personalizada: su capacidad de razonamiento y multimodalidad permite explicar conceptos complejos con ejemplos visuales y adaptar el nivel de dificultad según el estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento, y los datos de evaluación (etiqueta `eval-results`) no están detallados en el repositorio. Se recomienda consultar el informe técnico completo en el repositorio de GitHub de Moonshot AI para obtener métricas comparativas (enlace en la sección de enlaces).

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la documentación disponible.
- Estimación orientativa: los pesos en fp16 ocuparían aproximadamente 5,6 TB, lo que requiere un clúster de múltiples GPU de alta gama (por ejemplo, 8× H100 de 80 GB o más). Con cuantización MXFP4 (4 bits), el tamaño se reduce a unos 1,4 TB, aún fuera del alcance de una GPU consumer.
- GPU recomendadas: no disponible oficialmente; para inferencia práctica se necesitarían nodos con múltiples A100/H100 o soluciones de inferencia distribuida.
- No cabe en GPU de consumo (RTX 4090, etc.) debido al tamaño de los pesos y la memoria necesaria.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se genera GGUF), o frameworks de inferencia distribuida como DeepSpeed o TensorRT-LLM. Dado el tamaño, es probable que se requiera paralelismo de modelo y de datos.
- Latencia y throughput: no disponibles; dependerán en gran medida de la infraestructura y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 1M | MoE (896 expertos, 16 activos) | Kimi K3 License | Abierta (pesos completos) |
| Kimi K2 | ~1T | 256K | MoE (32 expertos, 8 activos) | Kimi K2 License | Abierta |
| DeepSeek-V3 | 671B | 128K | MoE (256 expertos, 8 activos) | MIT | Abierta |

Kimi K3 supera en escala y contexto a sus principales alternativas abiertas, siendo el primer modelo de clase 3T. Sin embargo, su tamaño hace que sea considerablemente más difícil de desplegar que modelos como DeepSeek-V3, que con 671B puede ejecutarse en configuraciones de 8× A100 con cuantización. No se dispone de comparativas de rendimiento en benchmarks públicos en la información recopilada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos sociales, culturales y de género. Se recomienda realizar evaluaciones de sesgo antes de su uso en producción.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados. La verificación humana es necesaria en aplicaciones críticas.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda probar con casos reales.
- Limitaciones de idioma: no se ha especificado la cobertura idiomática; probablemente el modelo se comporta mejor en inglés y chino, pero no hay confirmación oficial.
- Restricciones de licencia: la licencia Kimi K3 es personalizada; se debe revisar cuidadosamente sus términos para uso comercial, modificación y redistribución. Aunque es de código abierto, puede incluir cláusulas específicas (por ejemplo, sobre uso militar o competencia).
- Requisitos de hardware: el tamaño del modelo hace que sea inviable para la mayoría de los equipos; el despliegue requiere infraestructura de alto coste y experiencia en inferencia distribuida.
- El repositorio en Hugging Face (`Nordvik/Kimi-K3`) tiene 0 descargas y 0 likes, lo que sugiere que podría ser un mirror no oficial; se recomienda verificar la autenticidad de los pesos antes de su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nordvik/Kimi-K3
- Repositorio oficial en GitHub (Moonshot AI): https://github.com/MoonshotAI/Kimi-K3
- Informe técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Página del modelo en Kimi AI: https://www.kimi.ai/ai-models/kimi-k3
- Documentación de la API de Kimi K3: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Blog de Hugging Face sobre MXFP4 y Kimi K3: https://huggingface.co/blog/ResterChed/kimi-k3-model-overview-mxfp4-quantization-open-wei
