# RMDWLLC/Jah-5.0

## Resumen

Jah 5.0 es un modelo de lenguaje multimodal de código abierto desarrollado por RMDW LLC, la empresa detrás de la plataforma de IA privada Kiyomi. Se publica con los pesos exactos que sirven a los clientes de Kiyomi, bajo licencia MIT, con el objetivo de que cualquiera pueda inspeccionar y verificar el modelo. Es la quinta versión de la serie Jah y supone un salto significativo respecto a Jah 4.0: multiplica por 12 la capacidad de conocimiento, incorpora visión, razonamiento bajo demanda y una ventana de contexto nativa de 1.048.576 tokens.

El modelo tiene 321.323 millones de parámetros en total, de los cuales solo 18.000 millones se activan por token, gracias a una arquitectura de mezcla de expertos (MoE). Emplea una atención híbrida que combina atención lineal y atención dispersa en 45 capas, y se distribuye en precisión FP8 con rutas sensibles en BF16. Está diseñado para servirse con SGLang y requiere hardware de gama alta: unos 330 GB de memoria GPU solo para los pesos, más la caché KV. Su relevancia actual radica en que es uno de los pocos modelos de este tamaño con pesos abiertos, licencia permisiva y capacidades multimodales y de razonamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención híbrida: lineal + dispersa, 45 capas |
| Parametros totales | 321.323.031.390 (321B) |
| Parametros activos | 18.000.000.000 (18B) por token |
| Longitud de contexto | 1.048.576 tokens nativos |
| Tipos de cuantizacion | FP8 (block quantized) con rutas sensibles en BF16; cuantizaciones comunitarias de 4 bits mencionadas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jah 5.0 utiliza una arquitectura de mezcla de expertos con atención híbrida: combina atención lineal y atención dispersa a lo largo de 45 capas. Esta combinación permite manejar ventanas de contexto muy largas (más de un millón de tokens) con un coste computacional menor que la atención completa tradicional. El modelo activa solo 18.000 millones de parámetros por token, lo que acelera la inferencia en comparación con un modelo denso de tamaño equivalente.

No se han publicado detalles sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card indica que el modelo incorpora un modo de razonamiento explícito ("thinking on demand") con un canal de razonamiento separado, y que es capaz de resolver problemas de una sola pasada que Jah 4.0 no podía resolver en ninguna configuración. Tampoco se especifican los datos de entrenamiento de la modalidad de visión.

## Capacidades

- Generación de texto y razonamiento: produce respuestas de texto y puede activar un modo de razonamiento profundo ("thinking on") que genera un canal de razonamiento separado antes de la respuesta final. El modo instantáneo ("thinking off") responde directamente sin razonamiento intermedio.
- Visión: acepta imágenes como entrada (capturas de pantalla, facturas, fotografías de pizarras) y las procesa como texto. La salida es siempre texto.
- Tool calling nativo: soporta llamada a funciones de forma nativa, lo que permite integrarlo en flujos de agentes y automatizaciones.
- Contexto largo: ventana nativa de 1.048.576 tokens, sin trucos de escalado, adecuada para documentos extensos o conversaciones de muchas vueltas.
- Multimodal: entrada de texto e imagen, salida de texto.
- Capacidad multilingüe: no confirmada en la documentación; se desconoce qué idiomas soporta.

## Casos de uso

- Atención al cliente automatizada: con 1M de tokens de contexto, puede mantener conversaciones de muchas vueltas con historial completo y consultar bases de conocimiento extensas sin perder información. Su modo instantáneo permite respuestas rápidas, mientras que el modo de razonamiento puede usarse para consultas complejas que requieran análisis.
- Análisis de documentos extensos: procesar contratos, informes anuales o expedientes completos de miles de páginas en una sola pasada, gracias a la ventana de 1.048.576 tokens. El modo de razonamiento permite extraer conclusiones y resúmenes estructurados.
- Extracción de datos de imágenes: leer facturas, recibos, capturas de pantalla o fotografías de pizarras y convertirlos en texto estructurado o en respuestas. Útil para automatizar procesos de contabilidad o documentación.
- Asistente de programación con tool calling: integrar Jah 5.0 en un IDE o en un pipeline de CI/CD para generar código, revisar parches o ejecutar comandos a través de herramientas. Su soporte nativo de tool calling facilita la conexión con APIs y entornos de ejecución.
- Agente autónomo multi-paso: al combinar el modo de razonamiento con tool calling, puede planificar y ejecutar tareas complejas en varios pasos, como investigar un tema, consultar fuentes externas y sintetizar un informe final.
- Despliegue de IA privada: al ser de código abierto con licencia MIT, puede alojarse en infraestructura propia para manejar datos sensibles sin enviarlos a terceros. RMDW lo ofrece como modelo tras su plataforma Kiyomi, con la promesa de que los datos no salen de la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo "funciona perfectamente" en una suite interna propia de RMDW y que resuelve problemas que Jah 4.0 no podía, pero no se ofrecen cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 330 GB para los pesos en precisión completa (FP8/BF16), más la caché KV. Con contexto de 1M de tokens, la caché KV puede requerir decenas de GB adicionales.
- GPU recomendadas: un sistema con 4 GPU RTX PRO 6000 (384 GB en total) es la configuración que usa Kiyomi en producción. También se menciona que cuantizaciones comunitarias de 4 bits permiten ejecutarlo en una Mac Studio con 512 GB de memoria unificada.
- GPU de consumo: no cabe en una GPU de consumo convencional (RTX 4090, 3090, etc.) ni siquiera con cuantización agresiva, debido al tamaño de los pesos.
- Opciones de despliegue: SGLang es el servidor de inferencia recomendado. El comando de lanzamiento incluye `--tp 4` (tensor parallelism en 4 GPU), `--context-length 1048576`, `--kv-cache-dtype bfloat16`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-multimodal`. En GPU Blackwell de estación de trabajo (SM120) hay que ajustar el backend de atención a Triton y desactivar DeepGEMM.
- Latencia y throughput: no se han publicado cifras concretas. La model card afirma que al activar solo 18B de parámetros por token, el modelo "fluye rápido para su tamaño", pero no se ofrecen mediciones.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible. Por el tamaño (321B total, 18B activos) y la arquitectura MoE, podría situarse en la categoría de modelos como DeepSeek-V3 o Qwen2.5-Max, pero no hay datos objetivos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, seguridad o alucinación. Al ser un modelo de 321B parámetros sin benchmarks públicos, su comportamiento en producción es difícil de predecir sin pruebas propias.
- El modelo es extremadamente grande: requiere al menos 330 GB de VRAM para los pesos, más la caché KV. Esto limita su despliegue a entornos con hardware muy específico (múltiples GPU profesionales o Mac Studio con 512 GB).
- La documentación no especifica los idiomas soportados. Aunque probablemente sea multilingüe, no hay confirmación oficial, lo que supone un riesgo para aplicaciones en castellano u otros idiomas.
- El modelo se publica con licencia MIT, lo que permite uso comercial sin restricciones, pero no incluye garantías de ningún tipo. RMDW no ofrece soporte ni responsabilidad sobre el uso del modelo.
- La arquitectura es nueva (etiqueta `glm5_next`) y el soporte en SGLang es de "día 0", lo que implica que puede haber errores o falta de optimización en kernels para ciertas GPU. En particular, los kernels de datacenter no están disponibles para SM120.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que sugiere que es un lanzamiento muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RMDWLLC/Jah-5.0
- Organización RMDWLLC: https://huggingface.co/RMDWLLC
- Plataforma Kiyomi: https://kiyomibot.ai
- Sitio de RMDW: https://rmdw.ai
