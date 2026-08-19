# AMAImedia/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Está diseñado para tareas de razonamiento avanzado, codificación de largo alcance y trabajo de conocimiento agéntico, con capacidades multimodales nativas (texto, imagen y vídeo) y una ventana de contexto de 1 millón de tokens. Su arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) sobre un marco MoE disperso con 896 expertos, de los cuales se activan 16 por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2.

El modelo se distribuye con pesos completos bajo la licencia Kimi K3, lo que permite investigación, despliegue y desarrollo posterior. Su tamaño y arquitectura lo posicionan como una alternativa abierta a modelos propietarios de frontera, orientado a agentes autónomos que operan en entornos de ingeniería complejos, como optimización de kernels GPU, desarrollo de compiladores, diseño de chips o creación de juegos con visión en el bucle. La versión publicada en HuggingFace (AMAImedia/Kimi-K3) es un espejo no oficial del repositorio original de Moonshot AI, con pesos en formato safetensors y un tamaño de repositorio de 1561 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,78 T) |
| Parametros activos | 104 B (16 de 896 expertos activos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (según tags de HuggingFace); no se especifican otras |
| Idiomas soportados | No disponible (la model card no los lista) |
| Licencia | Kimi K3 (license: other, license_name: "kimi-k3") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE dispersa con 93 capas, de las cuales 1 es densa y 92 son de atención. La composición de atención es híbrida: 69 capas usan Kimi Delta Attention (KDA), una variante de atención lineal con delta de estados, y 24 capas usan Gated MLA (Multi-head Latent Attention). La dimensión oculta de atención es 7168 con 96 cabezas, y la dimensión latente del MoE es 3584. Cada experto tiene una dimensión oculta de 3072. El modelo activa 16 de los 896 expertos por token, lo que reduce el coste computacional efectivo a unos 104 B parámetros activos.

El entrenamiento se realizó con un marco denominado Stable LatentMoE, que mejora la estabilidad y eficiencia del escalado disperso. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. La arquitectura híbrida KDA + AttnRes busca combinar la eficiencia de atención lineal con la capacidad de atención completa en capas seleccionadas, optimizando el equilibrio entre coste y calidad para contextos muy largos.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo matemáticas, lógica y análisis complejo.
- Codificación de largo alcance: mantiene sesiones de ingeniería prolongadas con supervisión humana mínima, navega repositorios masivos y orquesta herramientas de terminal.
- Multimodalidad nativa: comprende texto, imágenes y vídeo dentro del mismo modelo, sin módulos separados.
- Trabajo de conocimiento agéntico: produce investigación profunda con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Soporte de agentes y razonamiento multi-paso: puede ejecutar tareas paralelas y coordinar flujos de trabajo complejos.
- Capacidades de tool calling y uso de terminal, según la descripción de la model card.
- Contexto de 1 millón de tokens, adecuado para documentos extensos, repositorios de código completos o historiales de conversación largos.

## Casos de uso

- Optimización de kernels GPU: el modelo puede analizar código CUDA, identificar cuellos de botella y generar versiones optimizadas, aprovechando su capacidad de razonamiento de largo alcance y su ventana de contexto para mantener el estado completo del proyecto.
- Desarrollo de compiladores: puede asistir en la implementación de passes de optimización, generación de código intermedio y pruebas de regresión, integrando tool calling para ejecutar compilaciones y verificar resultados.
- Diseño de chips asistido por IA: con su multimodalidad, puede interpretar diagramas de circuitos, especificaciones y logs de simulación, generando código Verilog o sugerencias de arquitectura.
- Creación de juegos con visión en el bucle: el modelo puede generar código de juego, interpretar capturas de pantalla y ajustar la lógica en tiempo real, útil para prototipado rápido en motores como Unity o Godot.
- Investigación de mercado automatizada: produce informes profundos con gráficos interactivos y paneles, combinando búsqueda web, análisis de datos y generación de visualizaciones.
- Edición de vídeo y motion design: puede entender secuencias de vídeo, generar guiones, sugerir cortes y crear animaciones básicas, gracias a su comprensión multimodal y su capacidad de razonamiento secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas sobre Kimi K2 en eficiencia de escalado, pero no proporciona cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estándar. Se recomienda consultar el informe técnico completo en GitHub para datos actualizados.

## Requisitos de hardware

- VRAM estimada: un modelo de 2,78 T parámetros en precisión FP16 requiere aproximadamente 5,6 TB de VRAM solo para los pesos. Con cuantización de 8 bits, se reduce a unos 2,8 TB, pero sigue siendo inviable en GPU de consumo.
- GPU recomendadas: clústeres multi-GPU con interconexión de alta velocidad, como 8x H100 (80 GB) o 8x A100 (80 GB), que proporcionan 640 GB de VRAM, insuficientes para el modelo completo. Se necesitarían al menos 35-70 GPUs H100 según la cuantización y el paralelismo.
- No cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) ni en estaciones de trabajo convencionales.
- Opciones de despliegue: frameworks de inferencia distribuida como vLLM, TensorRT-LLM o TGI con paralelismo de tensor y pipeline. También es posible usar llama.cpp con cuantización extrema (por ejemplo, 2-3 bits) en clústeres, aunque con pérdida de calidad.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia alta y un throughput limitado incluso en clústeres grandes.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables con otros modelos de la misma escala, ya que Kimi K3 es el primer modelo abierto de clase 3T. Como referencia cualitativa:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Kimi K3 | 2,78 T | 104 B | 1 M | Kimi K3 |
| Kimi K2 (predecesor) | 1 T (aprox.) | 32 B (aprox.) | 128 K (aprox.) | Kimi K2 |
| DeepSeek-V3 | 671 B | 37 B | 128 K | MIT |

Estas cifras de Kimi K2 y DeepSeek-V3 son aproximadas y pueden no estar actualizadas; se recomienda verificar en sus respectivas fichas. La comparación directa en benchmarks no está disponible.

## Limitaciones y advertencias

- Tamaño extremo: requiere infraestructura de clúster dedicada, lo que limita su uso a organizaciones con recursos significativos.
- Licencia Kimi K3: aunque es de código abierto, la licencia específica puede imponer restricciones de uso comercial o de redistribución; es necesario revisar el texto completo en el repositorio oficial.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- Sesgos: no se han publicado evaluaciones de sesgo; al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Multimodalidad limitada a entrada: el modelo acepta texto, imagen y vídeo, pero no genera imágenes ni vídeo; solo produce texto.
- Contexto de 1 M tokens: aunque es amplio, el rendimiento en los extremos de la ventana puede degradarse; no se han publicado análisis de "lost in the middle".
- Repositorio no oficial: la versión en HuggingFace (AMAImedia/Kimi-K3) es un espejo; se recomienda usar el repositorio oficial de Moonshot AI para verificar integridad y actualizaciones.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/moonshotai/Kimi-K3
- Repositorio espejo (AMAImedia): https://huggingface.co/AMAImedia/Kimi-K3
- GitHub oficial: https://github.com/MoonshotAI/Kimi-K3
- Informe técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Página del modelo: https://www.kimi.com/ai-models/kimi-k3
- Sitio de referencia independiente: https://kimi-k3.dev/
