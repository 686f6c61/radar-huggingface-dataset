# mradermacher/granite-4.2-8b-i1-GGUF

## Resumen

El repositorio `mradermacher/granite-4.2-8b-i1-GGUF` contiene cuantizaciones GGUF del modelo IBM Granite 4.2 8B, preparadas por mradermacher con la técnica imatrix (importance matrix) para optimizar la calidad de los pesos cuantizados. El modelo base, `ibm-granite/granite-4.2-8b`, pertenece a la familia Granite 4.2 de IBM, una serie de modelos de lenguaje densos (decoder-only) disponibles en tamaños de 3B, 8B y 30B, post-entrenados sobre los modelos base Granite 4.1. Esta familia está diseñada para uso empresarial, con soporte para razonamiento, modo "thinking" y tool calling, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de esta cuantización concreta radica en que permite ejecutar un modelo de 8.790 millones de parámetros en hardware de consumo, con tamaños de archivo que van desde 3,5 GB (Q2_K) hasta 5,2 GB (Q4_K_S), manteniendo un equilibrio entre calidad y rendimiento. El modelo soporta 11 idiomas (incluido español) y está orientado a tareas de razonamiento y agentes conversacionales, lo que lo hace adecuado para despliegues locales o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 8.791.592.960 (8,79B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (3,5 GB), i1-IQ3_M (4,2 GB), i1-Q4_K_S (5,2 GB), archivo imatrix (0,1 GB) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizaciones i1 e imatrix) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 8B emplea una arquitectura transformer densa (decoder-only), sin mezcla de expertos. Según la información disponible, los modelos Granite 4.2 son post-entrenados sobre los modelos base Granite 4.1, cuyo pre-entrenamiento se describe en el blog oficial de IBM Granite. No se dispone de datos específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La cuantización realizada por mradermacher utiliza la técnica imatrix (importance matrix), que asigna mayor precisión a los pesos más relevantes para la activación, mejorando la calidad de las cuantizaciones de bajo bit en comparación con métodos estáticos. El repositorio incluye un archivo imatrix de 0,1 GB que permite a los usuarios generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto y conversación multilingüe en 11 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento avanzado (reasoning) con soporte de modo "thinking" para tareas que requieren cadenas de pensamiento explícitas.
- Tool calling / function calling, lo que permite al modelo invocar herramientas externas y APIs de forma estructurada.
- Capacidad para actuar como agente en flujos multi-paso, integrando razonamiento y llamadas a herramientas.
- Orientado a casos de uso empresarial, con énfasis en fiabilidad y transparencia (según la propuesta de IBM Granite).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto de la interacción y derivando consultas complejas a sistemas externos mediante tool calling.
- Generación de código asistida: gracias a su capacidad de razonamiento y tool calling, puede integrarse en entornos de desarrollo para sugerir implementaciones, revisar fragmentos de código o interactuar con repositorios y APIs de CI/CD.
- Asistentes virtuales empresariales: despliegue local en infraestructura propia para tareas de consulta interna, redacción de informes o resumen de documentos, sin depender de servicios en la nube.
- Automatización de tareas con agentes: el modelo puede orquestar flujos de trabajo que requieren múltiples pasos, como la extracción de datos de una API, su procesamiento y la generación de una respuesta estructurada.
- Traducción y localización: con soporte para 11 idiomas, puede utilizarse para traducir contenido técnico o comercial manteniendo coherencia terminológica.
- Prototipado rápido de aplicaciones conversacionales: gracias a su tamaño reducido en cuantizaciones GGUF, es viable ejecutarlo en portátiles o estaciones de trabajo con GPU de gama media para desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantización no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y la model card del modelo base no proporciona datos numéricos en la información recopilada.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el archivo de pesos ocupa 3,5 GB (i1-Q2_K), 4,2 GB (i1-IQ3_M) o 5,2 GB (i1-Q4_K_S). Considerando overhead de contexto y activaciones, se recomienda al menos 6-8 GB de VRAM para la cuantización Q4_K_S.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden ejecutar el modelo sin problemas. Para mayor velocidad, GPUs con más ancho de banda como RTX 4090 o A100 son adecuadas.
- Sí cabe en GPU de consumo: las cuantizaciones Q2_K e IQ3_M caben en GPUs con 6 GB de VRAM, mientras que Q4_K_S requiere al menos 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. También es posible usar vLLM con soporte para GGUF (aunque no es el formato nativo).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, se estima una velocidad de generación de 50-80 tokens/s para Q4_K_S, pero estos valores son orientativos y no han sido verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 8B (este repo) | 8,79B | No disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher |
| Granite 4.2 3B | ~3B | No disponible | Apache 2.0 | Safetensors/GGUF | Misma familia, menor capacidad |
| Granite 4.2 30B | ~30B | No disponible | Apache 2.0 | Safetensors/GGUF | Misma familia, mayor capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información recopilada. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información disponible; sin embargo, al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- La longitud de contexto no está especificada en la información proporcionada, por lo que se desconoce el límite máximo de tokens de entrada. Se recomienda verificar este dato en la documentación oficial de IBM antes de usarlo en producción.
- Las cuantizaciones de bajo bit (Q2_K, IQ3_M) pueden degradar la calidad del modelo en tareas de razonamiento o generación de código. Se recomienda usar Q4_K_S para tareas críticas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría del modelo original (IBM) y de la cuantización (mradermacher).

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/granite-4.2-8b-i1-GGUF
- Modelo base (IBM Granite 4.2 8B): https://huggingface.co/ibm-granite/granite-4.2-8b
- Repositorio de cuantizaciones estáticas (sin imatrix): https://huggingface.co/mradermacher/granite-4.2-8b-GGUF
- Código fuente de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página oficial de IBM Granite: https://www.ibm.com/granite
- Repositorio de conversión GGUF de IBM: https://github.com/IBM/gguf
