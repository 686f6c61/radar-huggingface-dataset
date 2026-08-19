# deepgrove/maple-preview

## Resumen

Maple-Preview es un modelo de lenguaje de razonamiento desarrollado por DeepGrove, un laboratorio de investigación independiente centrado en la eficiencia computacional. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 20.000 millones de parámetros totales y 1.000 millones de parámetros activos (20B-A1B), que emplea pesos ternarios para reducir drásticamente el tamaño del checkpoint hasta 5,31 GB. Está diseñado para ejecutarse en hardware de consumo, como Apple Silicon o iPhones, alcanzando velocidades de 218 tokens por segundo en un M4 Mac mini.

El modelo está orientado a tareas de razonamiento complejo, incluyendo problemas de nivel competitivo, y ofrece una ventana de contexto de 131.072 tokens. Su relevancia actual radica en que democratiza el acceso a capacidades de razonamiento avanzado en dispositivos sin GPU dedicada, un nicho donde la eficiencia de parámetros activos y la cuantización ternaria juegan un papel fundamental. DeepGrove declara abiertamente que el modelo presenta debilidades en tareas agénticas, lo que condiciona sus casos de uso recomendados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con pesos ternarios |
| Parametros totales | 20B |
| Parametros activos | 1B (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos ternarios nativos (valores -1, 0, 1) |
| Idiomas soportados | Principalmente inglés (segun etiquetas del repositorio); no especificado oficialmente |
| Licencia | No disponible en la ficha oficial; las etiquetas del repositorio indican MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Maple-Preview utiliza una arquitectura transformer causal (causal-lm) con capas de mezcla de expertos. La innovación principal reside en el uso de pesos ternarios, donde cada parámetro se restringe a los valores -1, 0 y 1, lo que reduce el footprint de memoria a aproximadamente 1,58 bits por peso. Esto explica que un modelo de 20B parámetros ocupe solo 5,31 GB en disco. La combinación de MoE con solo 1B de parámetros activos permite un alto throughput en hardware modesto.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. Según la información publicada, el entrenamiento se ha centrado en capacidades de razonamiento, incluyendo problemas de competición matemática. DeepGrove señala explícitamente que el modelo tiene una debilidad conocida en tareas agénticas, lo que sugiere que el entrenamiento priorizó el razonamiento estático sobre la interacción con herramientas o entornos.

## Capacidades

- Razonamiento matemático y lógico de nivel competitivo, capaz de resolver problemas que requieren cadenas de deducción largas.
- Generación de texto causal con soporte para conversación multi-turno (etiqueta `conversational`).
- Procesamiento de contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o historiales de conversación amplios.
- Ejecución eficiente en dispositivos con memoria limitada gracias a los pesos ternarios y la arquitectura MoE con pocos parámetros activos.
- Inferencia de alta velocidad en hardware de consumo, con cifras reportadas de 218 tokens por segundo en un M4 Mac mini.
- No se menciona soporte explícito de tool calling o function calling en la información disponible, y la debilidad agéntica declarada sugiere que no es su punto fuerte.

## Casos de uso

- Resolución de problemas matemáticos en dispositivos móviles: un estudiante puede plantear ecuaciones o problemas de olimpiada y recibir razonamientos paso a paso sin conexión a internet, gracias a su tamaño reducido y velocidad en iPhone o iPad.
- Asistente de programación local: un desarrollador puede generar, explicar o depurar fragmentos de código en un Mac mini o portátil sin GPU dedicada, aprovechando los 131k tokens de contexto para incluir archivos completos en la consulta.
- Análisis de documentos legales o académicos: dado su contexto de 131.072 tokens, puede resumir contratos extensos, papers de investigación o informes técnicos en su totalidad, manteniendo la coherencia del razonamiento.
- Tutor de ciencias personalizado: el modelo puede actuar como profesor particular de física o matemáticas, desglosando problemas complejos en pasos lógicos y adaptando las explicaciones al nivel del usuario.
- Prototipado rápido de aplicaciones de IA: los equipos pueden integrar Maple-Preview en entornos de desarrollo locales para validar flujos de razonamiento antes de migrar a modelos más grandes en la nube, reduciendo costes y latencia.
- Automatización de tareas de oficina en local: redacción de informes, resumen de reuniones o generación de correos electrónicos con razonamiento contextual, ejecutándose en hardware de consumo sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son:

- Velocidad de inferencia: 218 tokens por segundo en un Apple M4 Mac mini.
- Tamaño del checkpoint: 5,31 GB para 20B parámetros totales.

Se menciona que el modelo está enfocado en razonamiento de nivel competitivo, pero no se aportan cifras concretas que permitan comparar su precisión con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de pesos ternarios, el checkpoint ocupa 5,31 GB. Para inferencia se recomienda al menos 8 GB de memoria unificada o VRAM para dejar margen a los estados intermedios y la atención.
- GPU recomendadas: Apple Silicon (M4 Mac mini, MacBook Pro, iPhone), GPUs NVIDIA consumer como RTX 3060, RTX 4070 o RTX 4090, y cualquier hardware con suficiente RAM unificada.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media e incluso en sistemas con memoria unificada de Apple.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede ejecutarse con Hugging Face Transformers. Para despliegue en producción, se podría utilizar vLLM o TGI si añaden soporte para pesos ternarios, o convertir a GGUF para usarlo con llama.cpp u Ollama.
- Latencia y throughput: se ha medido 218 tokens por segundo en un M4 Mac mini, lo que indica una latencia muy baja para interacción en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Tamano checkpoint | Licencia |
|---|---|---|---|---|---|
| Maple-Preview | 20B | 1B | 131.072 | 5,31 GB | MIT (etiquetas) |
| Qwen2.5-1.5B | 1,5B | 1,5B | 32.768 | ~1 GB | Apache 2.0 |
| Llama-3.2-1B | 1B | 1B | 131.072 | ~0,7 GB | Llama 3.2 |

La comparativa estructural muestra que Maple-Preview ofrece una densidad de conocimiento muy superior (20B) con un coste de activación similar a modelos de 1B, gracias a la arquitectura MoE. Su checkpoint es mayor que el de Llama-3.2-1B, pero ofrece 20 veces más parámetros. Frente a Qwen2.5-1.5B, Maple-Preview cuadruplica el contexto y multiplica por 13 los parámetros totales, manteniendo una huella de memoria razonable. No se dispone de benchmarks comparativos para evaluar la calidad real del razonamiento frente a estas alternativas.

## Limitaciones y advertencias

- Debilidad declarada en tareas agénticas: DeepGrove indica explícitamente que el modelo no rinde bien en escenarios que requieren interacción con herramientas, llamadas a funciones o planificación multi-paso con agentes.
- Soporte multilingüe limitado: la ficha oficial no especifica idiomas, aunque las etiquetas indican principalmente inglés. No se recomienda para producción en otros idiomas sin validación previa.
- Licencia ambigua: aunque las etiquetas del repositorio indican MIT, la ficha oficial de Hugging Face no especifica la licencia. Es imprescindible verificar este punto antes de un uso comercial.
- Riesgo de alucinación: como todo modelo de razonamiento, puede generar explicaciones plausibles pero incorrectas, especialmente en dominios fuera de su distribución de entrenamiento.
- Estado de vista previa: al ser un modelo `preview`, puede contener errores no detectados o carecer de optimizaciones para ciertos frameworks de inferencia.
- Ausencia de benchmarks públicos: no hay métricas estandarizadas que permitan evaluar su rendimiento real frente a la competencia, lo que dificulta la toma de decisiones informada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/deepgrove/maple-preview)
- [Organización DeepGrove en Hugging Face](https://huggingface.co/deepgrove)
- [Sitio web de DeepGrove](https://deepgrove.ai/)
- [Articulo de Sakutto sobre Maple-Preview](https://sakutto.ai/en/articles/maple-preview)
- [Ficha en There's An AI For That](https://theresanaiforthat.com/model/maple-preview/)
