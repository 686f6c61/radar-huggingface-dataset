# Aktnyl/hijin-financial-specialist

## Resumen

Hijin Financial Specialist V2 es un modelo de lenguaje derivado de Gemma 3 4B y ajustado por el usuario Aktnyl para conciliación documental comercial, auditoría de facturas multidivisa y verificación de órdenes de compra, con un enfoque explícito en ejecución 100 % local y privacidad de datos financieros. Se distribuye como un único archivo GGUF (3,4 GB de repositorio) con la base cuantizada en Q4_K_M y ocho proyecciones de atención fusionadas desde una LoRA propia denominada "Phase 5E Specialist" a precisión Q8_0.

El autor declara ~4,3B de parámetros y una ventana de contexto de 131.072 tokens, además de ~60 tokens/s en una RTX 4060. No se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la información técnica disponible es escasa y procede íntegramente de la model card.

La relevancia del modelo es acotada y hay que leerla con cautela: la ficha funciona en buena medida como propuesta comercial (adquisición de la IP completa por 5.500 USD, con pipeline de entrenamiento, generadores de datos sintéticos, 3.850+ tests automatizados y una aplicación de escritorio Windows), no incluye benchmarks públicos y la licencia es propietaria, lo que limita su evaluación y su uso por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only sobre Gemma 3 4B, con LoRA fusionada en 8 proyecciones de atención; no se detalla la configuración de capas ni el esquema de atención |
| Parámetros totales | ~4,3B declarados por el autor. Los metadatos safetensors del repositorio indican 524.288, cifra incompatible con un GGUF de 3,4 GB; la discrepancia no está aclarada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens (declarado, no verificado de forma independiente) |
| Tipos de cuantización | Q4_K_M para la base y Q8_0 para las proyecciones de atención fusionadas; solo se publica GGUF |
| Idiomas soportados | no disponible |
| Licencia | proprietary-commercial (`license: other`); se anuncia cesión de IP completa por 5.500 USD (negociable) |
| Formato de pesos | GGUF (no se publican safetensors ni el adaptador LoRA original) |
| Pipeline | text-generation |
| Velocidad declarada | ~60 tokens/s en NVIDIA RTX 4060 |
| Tamaño del repositorio | 3,4 GB |
| Métricas de comunidad | 853 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B, un transformer decoder-only, y aplica un ajuste fino mediante LoRA que posteriormente se fusiona en los pesos base. La particularidad declarada es que la fusión afecta a ocho proyecciones de atención y se realiza a precisión Q8_0, mientras que el resto de la red permanece en Q4_K_M; se trata de una estrategia de cuantización mixta orientada a preservar la calidad de las capas más sensibles al ajuste sin disparar el tamaño del archivo. No se especifica qué proyecciones concretas (`q_proj`, `k_proj`, `v_proj`, `o_proj` u otras) han recibido la fusión, ni si el resultado se validó contra la versión sin cuantizar.

La información sobre entrenamiento es prácticamente inexistente: no se indica el número de tokens, la composición del corpus, el uso de datos sintéticos (aunque se mencionan "LoRA synthetic data generators" como parte del paquete en venta), ni si hubo fases de alineación tipo RLHF o DPO. El autor cita 3.850+ tests automatizados superados, pero no publica la metodología, el conjunto de evaluación ni los resultados, por lo que no constituyen una validación reproducible.

## Capacidades

- Generación de texto especializada en dominios financieros y administrativos: facturación, albaranes, extractos bancarios y hojas de cálculo.
- Conciliación de documentos comerciales: emparejamiento de facturas con pedidos y con apuntes contables.
- Auditoría de facturas multidivisa, según la descripción del autor.
- Verificación de órdenes de compra frente a facturas recibidas.
- Procesamiento de documentos largos gracias a la ventana declarada de 131.072 tokens, útil para lotes de facturas o informes extensos en una sola pasada.
- Ejecución completamente offline dentro de la aplicación de escritorio Hijin, sin llamadas a servicios externos según la documentación del autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades Multilingües: no disponible (no se documentan idiomas).
- Capacidades Especiales: no se documenta modo thinking, visión ni audio; el modelo es exclusivamente de texto.

## Casos de uso

- Conciliación de facturas proveedor-pedido en un ERP: el modelo recibe el texto extraído de ambos documentos y devuelve el emparejamiento, las discrepancias de importe y las referencias cruzadas, aprovechando la ventana de 131K tokens para procesar lotes mensuales completos en una sola llamada.
- Auditoría de gastos multidivisa: revisión de facturas en distintas monedas detectando incoherencias de tipo de cambio, importes duplicados o líneas sin justificante, con el modelo ejecutándose en local para no exponer datos financieros.
- Validación de órdenes de compra: comprobación automática de que las facturas recibidas coinciden con la orden emitida (cantidades, precios unitarios, condiciones de pago) antes de aprobar el pago.
- Extracción estructurada de campos desde PDFs y hojas de cálculo: conversión de documentos heterogéneos a registros normalizados para su carga en un sistema contable, con el preprocesado de OCR delegado a herramientas externas.
- Asistente interno de finanzas sobre escritorio: despliegue en el portátil corporativo de un analista para consultar y resumir documentación contable sin conexión a internet, gracias a un GGUF de ~3 GB que cabe en GPU de gama media o incluso en CPU.
- Triaje de discrepancias en cuentas por pagar: clasificación de incidencias (importe, fecha, proveedor, divisa) y generación de borradores de correo al proveedor para su revisión humana.
- Prototipado de flujos RAG documentales: uso del modelo como generador en un pipeline de recuperación sobre un archivo documental financiero, ejecutado en llama.cpp u Ollama para pruebas de concepto en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor cita 3.850+ tests automatizados superados y ~60 tokens/s en una RTX 4060, pero no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de extracción documental o conciliación, ni comparaciones con la base Gemma 3 4B sin ajustar. Sin esa referencia, no es posible cuantificar la mejora aportada por el ajuste fino ni el posible degradation introducido por la cuantización Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB solo para pesos en Q4_K_M; con contexto largo el KV cache crece de forma notable, por lo que conviene reservar 6-8 GB para contextos de decenas de miles de tokens y 12 GB o más si se pretende acercarse a los 131K tokens declarados.
- GPU recomendadas: RTX 4060 (el propio autor reporta ~60 tokens/s), RTX 3060 12 GB, RTX 4070/4080, L4, A10G. En A100/H100 el modelo queda infrautilizado, pero permite mayor paralelismo y contextos largos.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más para contextos moderados; también es viable en CPU con llama.cpp a velocidades de decodificación de un dígito a decenas de tokens/s según el procesador.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp. No es adecuado para vLLM o TGI en su forma actual, ya que solo se distribuyen pesos GGUF (vLLM tiene soporte GGUF experimental y limitado).
- Latencia y throughput: ~60 tokens/s en RTX 4060 según el autor, equivalente a ~16 ms por token en decodificación; no hay datos publicados de TTFT, throughput con batching ni rendimiento con contexto largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Hijin Financial Specialist V2 | ~4,3B (declarado) | 131.072 | Proprietaria (comercial) | GGUF | No disponible |
| Gemma 3 4B (base) | ~4B | 128K | Gemma license | Safetensors, GGUF | No disponible en esta comparativa |
| Qwen2.5-3B-Instruct | ~3B | 32K (ampliable) | Apache 2.0 | Safetensors, GGUF | No disponible en esta comparativa |
| Phi-3.5-mini-instruct | ~3,8B | 128K | MIT | Safetensors, GGUF | No disponible en esta comparativa |
| Llama 3.2 3B Instruct | ~3B | 128K | Llama 3.2 Community License | Safetensors, GGUF | No disponible en esta comparativa |

La comparación relevante es frente a su propia base: Hijin añade un ajuste fino vertical y una fusión LoRA a Q8_0, pero pierde la licencia abierta de Gemma, no publica safetensors y no ofrece métricas que justifiquen el cambio para usos generales. Frente a Qwen2.5-3B, Phi-3.5-mini o Llama 3.2 3B, la diferencia práctica es la licencia: los tres alternativos permiten uso comercial sin negociación, mientras que Hijin exige adquisición de IP.

## Limitaciones y advertencias

- Licencia propietaria: el uso comercial no está cubierto por una licencia estándar; la model card plantea la compra de la IP completa (5.500 USD, negociable) y no detalla condiciones de uso, redistribución ni despliegue interno.
- Ausencia total de benchmarks públicos y de metodología de evaluación: los 3.850 tests citados no son verificables ni comparables con estándares de la industria.
- Discrepancia en el recuento de parámetros: los metadatos safetensors indican 524.288 parámetros frente a los ~4,3B declarados y un GGUF de 3,4 GB; conviene auditar el artefacto antes de confiar en él.
- Riesgo de alucinación crítico en dominio financiero: cualquier cifra, tipo de cambio o referencia de factura generada debe validarse contra el documento original; no debe usarse para aprobar pagos de forma autónoma.
- Idiomas no documentados: se desconoce si el ajuste conserva la competencia multilingüe de la base o si está sesgado al inglés.
- Trazabilidad del entrenamiento inexistente: sin dataset, número de tokens ni proceso de alineación, no se puede evaluar el sesgo ni el riesgo de contaminación.
- La garantía de privacidad ("100 % local") depende de la aplicación de escritorio Hijin, no del archivo GGUF en sí; si se despliega con otras herramientas hay que verificar que no haya telemetría.
- Metadatos con fechas futuras (creación 2026-10-11) y señales de un repositorio de bajo mantenimiento (1 like, 853 descargas, contacto por correo personal): indicios de un artefacto comercial más que de un proyecto con gobernanza.
- Contexto de 131K declarado pero no verificado: el rendimiento en ventanas largas con cuantización Q4_K_M puede degradarse de forma significativa.
- Solo se publica GGUF: no es posible reproducir el ajuste, auditar los pesos originales ni continuar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aktnyl/hijin-financial-specialist
- Demo del producto: https://hijin-ai.pages.dev/
- Aplicación de escritorio Hijin: https://aktnyl.github.io/Hijin-AI/
- Contacto para adquisición (correo indicado en la model card): tejasmtejasm472@gmail.com
- Paper, blog técnico o repositorio de código: no disponibles en la información proporcionada.
