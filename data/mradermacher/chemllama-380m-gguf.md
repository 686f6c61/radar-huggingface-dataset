# mradermacher/ChemLlama-380M-GGUF

## Resumen

ChemLlama-380M-GGUF es una versión cuantizada en formato GGUF del modelo ChemLlama-380M, un modelo de lenguaje de 383 millones de parámetros desarrollado por yerevann y especializado en el dominio de la química. La cuantización ha sido realizada por mradermacher, que ofrece una amplia gama de niveles de compresión (desde Q2_K hasta f16) para facilitar la ejecución en hardware con recursos limitados, desde CPU hasta GPU de gama baja.

Este modelo resulta relevante porque permite desplegar un sistema de procesamiento de lenguaje natural orientado a química en entornos sin acceso a GPUs de gran capacidad, gracias a su reducido tamaño y a la eficiencia del formato GGUF. Aunque no se dispone de documentación detallada sobre su arquitectura o entrenamiento, su nombre sugiere una base similar a la familia Llama, adaptada mediante fine-tuning para tareas químicas.

La disponibilidad de múltiples cuantizaciones, junto con su compatibilidad con herramientas como llama.cpp y Ollama, lo convierte en una opción práctica para prototipos, educación y aplicaciones de bajo coste en el ámbito químico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 383.026.176 (383M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para ChemLlama-380M en la documentacion proporcionada. El nombre sugiere una posible base en la familia Llama, pero no hay confirmacion oficial. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset o tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, presumiblemente orientada a contenidos quimicos (nombres de compuestos, propiedades, reacciones), aunque no se especifica en la documentacion.
- No se confirma soporte para tool calling, agentes, razonamiento multi-paso, vision o audio.
- Al ser un modelo pequeno (380M), su capacidad de razonamiento complejo es limitada en comparacion con modelos de mayor tamano.

## Casos de uso

- Prototipado rapido de aplicaciones de procesamiento de lenguaje natural en quimica: al ser un modelo pequeno y cuantizado, permite iterar rapidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Educacion y divulgacion: puede utilizarse en entornos academicos para demostrar conceptos de generacion de texto aplicados a la quimica, con requisitos minimos de hardware.
- Analisis de textos cientificos basicos: extraccion de entidades quimicas o resumen de articulos sencillos, aunque su capacidad esta limitada por el tamano.
- Integracion en pipelines de bajo coste: gracias al formato GGUF, puede ejecutarse en CPU o GPU integrada, lo que facilita su inclusion en sistemas embebidos o servidores modestos.
- Experimentacion con cuantizacion: la variedad de niveles de cuantizacion permite estudiar el equilibrio entre tamaño, velocidad y calidad de salida en tareas quimicas.
- Generacion de descripciones de moleculas o compuestos: si el modelo ha sido fine-tuneado para ello, podria generar texto descriptivo a partir de nombres o formulas, aunque no hay evidencia publica de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varian entre 0,3 GB (Q2_K) y 0,9 GB (f16). Con Q4_K_M (0,4 GB) se puede ejecutar en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con 2 GB o mas de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060) es suficiente. Tambien puede ejecutarse en CPU con 4 GB de RAM.
- Si cabe en consumer GPU: si, en practicamente todas las GPUs de consumo actuales, incluso en iGPU integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier herramienta compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales, pero al ser un modelo de 380M, la generacion es muy rapida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. No hay datos publicos sobre ChemLlama-380M frente a alternativas como TinyLlama, Phi-2 o modelos quimicos especificos. Se recomienda consultar el repositorio original para futuras actualizaciones.

## Limitaciones y advertencias

- Tamano reducido: con solo 383M de parametros, la calidad de generacion y razonamiento es significativamente inferior a modelos de 1B o mas.
- Licencia desconocida: no se especifica la licencia del modelo original ni de las cuantizaciones, lo que puede limitar su uso comercial sin autorizacion explicita.
- Idioma limitado: solo se declara soporte para ingles, lo que restringe su aplicacion en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion quimica incorrecta o inventada, especialmente en un dominio especializado.
- Sin documentacion tecnica: la ausencia de detalles sobre arquitectura y entrenamiento dificulta la evaluacion de sesgos o limitaciones especificas.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que podria indicar que es un proyecto reciente o experimental.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/ChemLlama-380M-GGUF
- Modelo base original: https://huggingface.co/yerevann/chemllama-380m
- Version cuantizada de 3B (relacionada): https://huggingface.co/mradermacher/chemllama-3B-GGUF
