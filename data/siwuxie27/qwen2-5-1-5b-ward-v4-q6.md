# siwuxie27/Qwen2.5-1.5B-Ward-v4-Q6

## Resumen

Qwen2.5-1.5B-Ward-v4-Q6 es un modelo de lenguaje derivado de Qwen2.5-1.5B-Instruct, desarrollado por el usuario siwuxie27 mediante un proceso de destilación y fusión de adaptadores LoRA. El modelo combina dos LoRA entrenadas por separado: una especializada en el dominio "ward" (entorno hospitalario o de enfermería) y otra orientada a capacidades generales (matemáticas, código y razonamiento lógico). La fusión se realiza por concatenación exacta de rangos, con pesos de 0.50 para el delta ward y 0.75 para el delta general, y el resultado se cuantiza en formato GGUF Q6_K.

Con 1.543.714.304 parámetros (1.54B) y un tamaño de archivo de 1.273 GB, el modelo está diseñado para despliegue en entornos con recursos limitados. El perfil de inferencia recomendado consume menos de 1.5 GiB de memoria GPU y alcanza una velocidad de generación de aproximadamente 44.4 tokens por segundo. La relevancia de este modelo radica en su equilibrio entre capacidades generales retenidas y especialización en tareas de juicio clínico, manteniendo un 99% de precisión en la clasificación de eventos de nube (cloud judgment) dentro del dominio ward, mientras conserva un 95.24% de la capacidad macro del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (perfil de despliegue recomendado: 4096 tokens) |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingue) |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo Q6_K) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso decoder-only preentrenado por Alibaba con hasta 18 billones de tokens. Sobre esta base se entrenaron dos adaptadores LoRA de forma independiente: uno con 2.000 filas de datos del dominio ward y otro con 3.000 filas mixtas (1.500 de entrenamiento GSM8K y 1.500 derivadas de MBPP para razonamiento de código y ejecución). Ambos adaptadores se fusionaron mediante concatenación exacta de rangos, y se seleccionaron los pesos de fusión 0.50 (ward) y 0.75 (general) tras evaluar múltiples combinaciones. El adaptador resultante se fusionó con el modelo base y se convirtió a GGUF Q6_K. No se menciona el uso de RLHF ni DPO; el entrenamiento se basa únicamente en fine-tuning supervisado con LoRA.

## Capacidades

- Generacion de texto conversacional con formato de salida estructurado (tasa de formato valido del 100% en el dominio ward).
- Razonamiento matematico: 60% de acierto en GSM8K (200 preguntas congeladas).
- Razonamiento de codigo: 25% en CRUXEval-O (200 preguntas).
- Razonamiento logico y de lenguaje natural: 35% en BBH (200 preguntas).
- Especializacion en dominio ward: 99% de precision en juicio de nube (cloud judgment) y 82% en clasificacion de urgencia de eventos.
- Compatible con endpoints OpenAI (proporciona un endpoint local en http://127.0.0.1:8000/v1).
- No se documenta soporte explicito para tool calling, agentes ni modo de pensamiento.

## Casos de uso

- Asistente de enfermeria en planta: el modelo puede clasificar eventos de pacientes (por ejemplo, deteccion de caidas con nivel de confianza) y generar recomendaciones de actuacion breves, gracias a su especializacion ward con 99% de precision en juicio de nube.
- Triaje de urgencias: con un 82% de acierto en clasificacion de urgencia, puede priorizar alertas en sistemas de monitorizacion hospitalaria, aunque requiere supervision humana.
- Chat conversacional de bajo consumo: su perfil de memoria inferior a 1.5 GiB permite desplegarlo en GPUs de gama baja o en entornos edge para atender consultas generales.
- Generacion de codigo con razonamiento: mantiene un 96.15% de retencion en CRUXEval-O respecto al modelo original, util para asistentes de programacion en entornos con restricciones de hardware.
- Razonamiento logico en lenguaje natural: con un 112.9% de retencion en BBH frente al original, puede emplearse en tareas de analisis de texto y clasificacion logica.
- Integracion en pipelines de inferencia local: al ser GGUF y compatible con llama.cpp, puede integrarse en servicios tipo Ollama o vLLM para ofrecer un endpoint OpenAI-compatible en produccion.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion sobre un benchmark congelado de 600 preguntas (200 GSM8K, 200 CRUXEval-O, 200 BBH) con temperatura 0 y un extractor de respuestas simetrico relajado. Tambien incluye evaluacion especifica del dominio ward con 200 muestras.

| Modelo | GSM8K (200) | CRUXEval-O (200) | BBH (200) | Macro |
|---|---:|---:|---:|---:|
| Original Qwen2.5-1.5B | 69.0% | 26.0% | 31.0% | 42.0% |
| Ward v3 Q6_K (anterior) | 47.5% | 16.5% | 41.0% | 35.0% |
| Ward v4 Q6_K (este modelo) | 60.0% | 25.0% | 35.0% | 40.0% |

| Metrica del dominio ward (200 muestras) | Valor |
|---|---:|
| Precision en juicio de nube | 99.0% |
| Macro-F1 en juicio de nube | 99.14% |
| Precision en urgencia de eventos | 82.0% |
| Tasa de formato valido | 100.0% |
| Similitud media de referencia | 0.4673 |

Retencion de capacidades generales frente al original: matematicas 86.96%, codigo 96.15%, lenguaje/logica 112.90%, macro 95.24%. Frente a la version v3, mejora en matematicas (+12.5 puntos), codigo (+8.5) y macro (+5.0), pero pierde 6.0 puntos en BBH.

## Requisitos de hardware

- VRAM estimada: 1438 MiB en reposo y 1442 MiB tras una peticion, con el perfil `--n-gpu-layers 20 --ctx-size 4096 --parallel 1 --cache-type-k q8_0 --cache-type-v q8_0`.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con menor rendimiento.
- Velocidad de generacion: aproximadamente 44.4 tokens/s en el perfil indicado; el procesamiento de prompt tarda 89 ms y una peticion corta completa 0.370 s.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (compatible con endpoints OpenAI), o el script `qwen-start-v4` incluido por el autor.
- No se ha medido la reduccion de TTFT frente al modelo original (pendiente de prueba pareada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | CRUXEval-O | BBH | Licencia | Formato |
|---|---:|---:|---:|---:|---:|---|---|
| Qwen2.5-1.5B-Ward-v4-Q6 (este) | 1.54B | No disponible (perfil 4096) | 60.0% | 25.0% | 35.0% | No disponible | GGUF Q6_K |
| Qwen2.5-1.5B-Instruct (original) | 1.54B | 128K (segun documentacion base) | 69.0% | 26.0% | 31.0% | Apache 2.0 (base) | safetensors, GGUF |
| Qwen2.5-1.5B-Ward-v3-Q6 (anterior) | 1.54B | No disponible | 47.5% | 16.5% | 41.0% | No disponible | GGUF Q6_K |

El modelo v4 mejora sustancialmente sobre v3 en matematicas y codigo, pero pierde en razonamiento logico (BBH). Frente al original, sacrifica algo de capacidad matematica y de codigo a cambio de una especializacion ward muy alta. No se dispone de datos de otros modelos de tamano similar (p. ej. Llama 3.2 1B) para comparacion directa.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada; no se puede garantizar el uso comercial sin verificar los terminos del autor y del modelo base.
- El modelo puede alucinar, especialmente en tareas fuera del dominio ward o en razonamiento logico complejo (BBH 35%).
- El contexto efectivo en el perfil recomendado es de 4096 tokens, muy inferior al soporte de 128K del modelo base; conversaciones largas pueden truncarse.
- La especializacion ward se evalua sobre un conjunto de 200 muestras; la precision del 99% en juicio de nube puede no generalizar a entornos reales con mayor variabilidad.
- No se documentan sesgos especificos, pero el modelo base Qwen2.5 puede presentar sesgos de genero, etnia o idioma no mitigados.
- La velocidad de generacion (44.4 tokens/s) se mide en un perfil concreto; otros parametros de cuantizacion o contexto pueden alterar el rendimiento.
- No se ha realizado una prueba pareada de TTFT frente al modelo original, por lo que no se puede afirmar una reduccion de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siwuxie27/Qwen2.5-1.5B-Ward-v4-Q6
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 1.5B en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B
