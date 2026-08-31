# PowerMachine/HAKO-v2

## Resumen

HAKO-v2 (Hybrid Attention Kohonen Orchestrator, v2) es un modelo publicado por el usuario PowerMachine en Hugging Face. Según la model card, se trata de una evolución del HAKO-v1, generada sin modificar el paquete V1, que incorpora nuevas fuentes congeladas (GPT-2 Alpaca-GPT4, GPT-2 GQA y DINOv2-small) y un conjunto ampliado de métricas SOM (mapas autoorganizados de Kohonen), incluyendo error de cuantización, error topográfico, U-matrix, frecuencia de activación y convergencia de pesos. El modelo incluye verificaciones matemáticas en tiempo de ejecución (T-ATTVAR/Minkowski, Dirichlet eta<=2/lambda_max, cota de Rademacher, Lemma 1 BPE) y mantiene una cuantización int4 mediante el método P-DEC.

El repositorio tiene un tamaño de 0,1 GB, lo que sugiere un modelo ligero o un adaptador basado en modelos preentrenados más grandes. No se dispone de información pública sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni la licencia. La entrada se realiza mediante el comando `python3 -m hako_v2.run_v2 --start 0` y genera telemetría JSONL en cinco flujos. La documentación disponible es muy escasa y no se han publicado resultados de benchmarks ni comparativas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención + mapas autoorganizados de Kohonen (SOM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (método P-DEC) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,1 GB, sin especificar) |

## Arquitectura y entrenamiento

La model card describe HAKO-v2 como un "Hybrid Attention Kohonen Orchestrator", lo que indica una arquitectura que combina mecanismos de atención con mapas autoorganizados de Kohonen, una red neuronal no supervisada típicamente usada para clustering y visualización de datos de alta dimensión. El modelo utiliza fuentes congeladas: GPT-2 Alpaca-GPT4 y GPT-2 GQA como módulos de lenguaje, y DINOv2-small como módulo de visión. Esto sugiere un enfoque multi-modal o multi-fuente, aunque no se detalla cómo se integran estos componentes.

No se aporta información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de RLHF o DPO. Se mencionan verificaciones matemáticas en runtime (T-ATTVAR/Minkowski, Dirichlet eta<=2/lambda_max, cota de Rademacher, Lemma 1 BPE), lo que apunta a un énfasis en la robustez teórica y la validación formal durante la ejecución. La cuantización int4 mediante P-DEC se mantiene de la versión anterior, lo que sugiere un foco en eficiencia de memoria y despliegue en entornos con recursos limitados.

## Capacidades

- Generación de texto y razonamiento basado en los modelos GPT-2 congelados (Alpaca-GPT4 y GQA), aunque no se especifican las capacidades exactas.
- Procesamiento de información visual mediante DINOv2-small, lo que podría permitir tareas de visión o integración multimodal.
- Orquestación mediante mapas de Kohonen para organización y agrupación de representaciones internas.
- Verificación matemática en tiempo de ejecución de propiedades como la convergencia de pesos y la cota de Rademacher, lo que puede aportar garantías formales adicionales.
- Telemetría JSONL en cinco flujos, que facilita el monitoreo y el análisis de comportamiento del modelo.
- No se documenta soporte para tool calling, agentes o razonamiento multi-paso.

## Casos de uso

Dada la escasez de información pública, los casos de uso son hipotéticos y deben tomarse con cautela:

- Investigación en modelos híbridos: HAKO-v2 puede servir como banco de pruebas para arquitecturas que combinan atención con mapas autoorganizados, útil para estudiar la interacción entre mecanismos supervisados y no supervisados.
- Experimentación con verificación formal en modelos de lenguaje: las comprobaciones matemáticas en runtime permiten validar propiedades como la convergencia o la cota de Rademacher, lo que puede interesar a investigadores en IA confiable.
- Prototipado de sistemas multimodales ligeros: al integrar GPT-2 y DINOv2-small con cuantización int4, podría explorarse su uso en entornos con recursos limitados para tareas que combinen texto e imagen.
- Análisis de telemetría y monitoreo: los cinco flujos JSONL facilitan el seguimiento detallado del comportamiento del modelo, útil para depuración y estudios de interpretabilidad.
- Educación y divulgación: como modelo pequeño (0,1 GB), puede utilizarse en cursos sobre arquitecturas alternativas o sobre SOM aplicados al procesamiento del lenguaje.
- Desarrollo de herramientas de orquestación de modelos: el enfoque de "orquestador" sugiere posibles aplicaciones en sistemas que coordinan múltiples modelos base congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Tampoco se encuentran referencias externas que reporten rendimiento de HAKO-v2.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que sugiere que el modelo es muy ligero y podría ejecutarse en CPU o en GPUs de gama baja.
- Cuantización int4: reduce aún más los requisitos de memoria, aunque no se especifica el número de parámetros reales.
- VRAM estimada: no disponible con precisión, pero por el tamaño del repo, probablemente menos de 1 GB en cuantización int4.
- GPU recomendada: no disponible. Podría funcionar en GPUs como RTX 3060 o inferiores, o incluso en CPU con suficiente RAM.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El comando de entrada sugiere un uso directo mediante Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene datos públicos de parámetros, contexto ni rendimiento. Las búsquedas web no arrojaron referencias directas a HAKO-v2 de PowerMachine. Se recomienda tratar este modelo como experimental y sin validación externa.

## Limitaciones y advertencias

- Información extremadamente limitada: no se conocen parámetros, contexto, licencia, idiomas ni datos de entrenamiento.
- La model card está escrita en portugués y carece de detalles técnicos suficientes para evaluar su idoneidad en producción.
- No hay benchmarks publicados, por lo que el rendimiento real es desconocido.
- La licencia no está especificada, lo que impide conocer si es apto para uso comercial o si tiene restricciones.
- Al basarse en GPT-2, puede heredar sesgos y limitaciones de ese modelo base, incluyendo riesgo de alucinaciones y sesgos de género, raza o ideología.
- La integración de DINOv2-small sugiere capacidades visuales, pero no se documenta cómo se combinan las modalidades ni qué tareas concretas soporta.
- El tamaño del repositorio (0,1 GB) podría indicar que se trata de un adaptador o un conjunto de pesos parciales, no de un modelo completo autocontenido.
- No se proporcionan instrucciones claras de despliegue ni requisitos de dependencias más allá del comando de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PowerMachine/HAKO-v2
- Repositorio de GitHub "hako" (posiblemente relacionado, sin confirmar): https://github.com/mithraeums/hako
- Otros enlaces de la búsqueda web no están directamente relacionados con este modelo (modelos de voz RVC, líder de benchmarks, documentación de PixAI, HakkoAI).
