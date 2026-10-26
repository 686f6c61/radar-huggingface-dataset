# mattashiho/dango-A1-A2

## Resumen

Dango-A1-A2 es un modelo de lenguaje de 1.867.614.208 parámetros (aproximadamente 1,87 mil millones) publicado por Shiho Matta (usuario `mattashiho`) en Hugging Face. Se trata de un ajuste supervisado (SFT) sobre el checkpoint preentrenado `dango-1.8b-100Btok`, un modelo entrenado exclusivamente con japonés a partir de un corpus filtrado de 100.000 millones de tokens. El ajuste se realiza sobre lecciones de aprendizaje de segunda lengua (L2) en inglés correspondientes a los niveles A1 y A2 del marco MCER.

El propósito declarado no es el de un asistente de propósito general, sino el de servir como instrumento de investigación en adquisición de segundas lenguas (SLA, *second language acquisition*): el modelo actúa como simulador de un hablante nativo de japonés que produce inglés con las limitaciones y errores propios de un aprendiz de nivel básico. Esto permite estudios controlados de transferencia lingüística L1→L2 con un modelo generativo de arquitectura decoder, superando las limitaciones de trabajos previos basados en modelos más pequeños o no generativos.

Arquitectónicamente es comparable a la familia llm-jp-3, que adopta un decoder al estilo Llama 2. El modelo se distribuye únicamente en formato safetensors (repositorio de 3,7 GB) y soporta japonés e inglés. Su relevancia actual es acotada y muy específica: es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, y con una licencia que restringe el uso comercial de los modelos derivados del ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder al estilo Llama 2 (comparable a la familia llm-jp-3) |
| Parametros totales | 1.867.614.208 (~1,87 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | Japones (ja) e ingles (en); el inglés se limita al registro A1-A2 |
| Licencia | cc (CC BY 4.0 para codigo y modelos preentrenados); los modelos ajustados con datos Ichikara prohiben el uso comercial de modelos derivados |
| Formato de pesos | safetensors (repositorio de 3,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder al estilo Llama 2, arquitectónicamente comparable a `llm-jp-3-1.8b` según indica el propio autor. El punto de partida es `dango-1.8b-100Btok`, un modelo preentrenado solo con japonés sobre 100.000 millones de tokens procedentes de un corpus japonés sometido a un filtrado exhaustivo. Sobre ese checkpoint se aplica un ajuste supervisado (SFT) empleando lecciones de aprendizaje de inglés como segunda lengua de niveles A1 y A2. La model card no detalla el número de tokens de la fase SFT, la composición exacta del conjunto de lecciones, la plantilla de chat ni si se aplicaron fases posteriores de RLHF o DPO.

El interés técnico no reside en innovaciones de arquitectura (no se documentan attention lineal, decodificación especulativa ni mecanismos híbridos SSM), sino en el diseño del dato: al entrenar sobre material didáctico de nivel básico, se persigue que la distribución de salida del modelo refleje la interlengua de un aprendiz. El autor publica el código de filtrado y de entrenamiento en el repositorio de GitHub del proyecto, y el trabajo asociado se describe en el artículo «Dango: A Strictly L1-Only Large Language Model for...» (arXiv 2606.19170) y en una ponencia de ANLP 2026.

## Capacidades

- Generación de texto en inglés restringida al registro de un aprendiz de niveles A1-A2: vocabulario y estructuras simples, con errores plausibles de interlengua.
- Generación de texto en japonés, heredada del preentrenamiento exclusivamente japonés del modelo base.
- Simulación de un hablante japonés (L1) que se expresa en inglés como L2, con los patrones de transferencia que ello implica.
- Generación de texto abierto multi-frase, capacidad que los autores señalan como ventaja frente a modelos más pequeños o no decoder usados en estudios previos de SLA.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking» o razonamiento explícito: no disponible.
- Capacidades multilingües: limitadas a ja y en; no se documenta ningún otro idioma.

## Casos de uso

- Investigación en adquisición de segundas lenguas: el modelo se emplea como sujeto experimental para estudiar la transferencia L1→L2 (japonés→inglés) en condiciones controladas, comparando sus producciones con las de aprendices humanos de nivel A1-A2.
- Generación de datos sintéticos de interlengua: produce enunciados en inglés con errores típicos de aprendiz, útiles para aumentar corpus anotados de errores cuando no hay suficientes muestras humanas de ese nivel.
- Evaluación de correctores gramaticales y de sistemas de *feedback*: al generar texto deliberadamente imperfecto y controlado por nivel, sirve como entrada reproducible para medir la sensibilidad de herramientas de corrección o de scoring automático.
- Elaboración de material didáctico de nivel básico: genera diálogos y ejercicios en inglés A1-A2 con una dificultad léxica y sintáctica acotada, apropiada para unidades didácticas iniciales.
- Pruebas de robustez de clasificadores de nivel MCER: los detectores automáticos de nivel pueden validarse contra producciones generadas con nivel conocido *a priori*.
- Prototipado de sistemas de diálogo tolerantes a errores: útil para comprobar cómo se comporta un pipeline de comprensión cuando la entrada contiene fallos gramaticales sistemáticos y predecibles.
- Reproducibilidad de estudios comparativos L1-only frente a L2-tuned: al compartir base con `dango-1.8b-100Btok`, permite aislar el efecto del ajuste sobre lecciones de L2 sin cambiar la arquitectura ni el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento real de parámetros, no dato del autor): en FP16/BF16 en torno a 3,7 GB solo para pesos; en INT8 alrededor de 1,9 GB; en INT4 alrededor de 1,0-1,2 GB. Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con 8 GB o más cubre el modelo en FP16 con contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para despliegue en FP16 con contexto largo o varios usuarios concurrentes conviene una RTX 4090 (24 GB), L40S o A100/H100.
- Compatibilidad con GPU de consumo: sí. Con 8 GB de VRAM en FP16 y contexto corto; con 4-6 GB si se cuantiza a INT8/INT4.
- Opciones de despliegue: `transformers` de forma nativa (pesos safetensors); vLLM y TGI son compatibles al tratarse de una arquitectura tipo Llama 2, aunque no hay configuración publicada por el autor. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mattashiho/dango-A1-A2 | ~1,87 B | No disponible | ja, en (A1-A2) | CC BY 4.0 con restriccion comercial por datos Ichikara | SFT sobre lecciones L2; orientado a investigacion en SLA |
| mattashiho/dango-1.8b-100Btok | ~1,8 B | No disponible | ja | CC BY 4.0 | Modelo base preentrenado con 100.000 M de tokens de japones filtrado; sin ajuste por instrucciones |
| llm-jp/llm-jp-3-1.8b | ~1,8 B (segun denominacion) | No disponible en la informacion consultada | ja | No disponible en la informacion consultada | Referencia arquitectonica citada por el autor (decoder estilo Llama 2); no esta ajustado para simular interlengua |

No se dispone en la informacion proporcionada de datos de rendimiento comparado (benchmarks) entre estas alternativas.

## Limitaciones y advertencias

- Restricción de licencia crítica: aunque la etiqueta de Hugging Face indica `cc` y la model card declara CC BY 4.0 para código y modelos preentrenados, el checkpoint ajustado se entrenó con datos de instrucciones Ichikara, cuya fuente prohíbe el uso comercial de modelos derivados. En la práctica, este checkpoint concreto no debería usarse en productos comerciales sin revisión legal.
- No es un modelo de propósito general: está ajustado para producir inglés de nivel A1-A2, es decir, deliberadamente limitado y con errores. Emplearlo como asistente general produciría respuestas pobres e incorrectas.
- Riesgo elevado de alucinación: 1,87 B de parámetros y 100.000 millones de tokens de preentrenamiento sitúan al modelo muy por debajo de los modelos actuales en conocimiento factual y razonamiento.
- Ausencia total de validación externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni resultados de evaluación en la model card.
- Longitud de contexto no documentada: impide planificar aplicaciones multi-turno largas o tareas de recuperación sobre documentos extensos.
- Idiomas: solo japonés e inglés. El inglés generado no es fiable fuera del registro A1-A2, y no hay ninguna garantía de calidad en otros idiomas.
- Sesgos: el preentrenamiento usa un corpus japonés filtrado cuya composición no se detalla en la información disponible; no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Falta de documentación operativa: no se especifican plantilla de chat, tokens especiales ni hiperparámetros de generación recomendados, lo que complica la reproducibilidad.
- Fecha de creación del repositorio: 26 de octubre de 2026, con última actualización el mismo día; se trata de un artefacto muy reciente y sin historial de mantenimiento.
- Posible contaminación de datos: las lecciones empleadas para el SFT pueden contener material didáctico con derechos de autor; su procedencia no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattashiho/dango-A1-A2
- Modelo base preentrenado: https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Repositorio GitHub del proyecto (código de filtrado y entrenamiento): https://github.com/mattashiho233/dango
- README del repositorio: https://github.com/mattashiho233/dango/blob/main/README.md
- Artículo arXiv: https://arxiv.org/abs/2606.19170
- Referencia arquitectónica llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Fuente de los datos de instrucciones Ichikara: https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
- Perfil del autor en Hugging Face: https://huggingface.co/mattashiho/models
