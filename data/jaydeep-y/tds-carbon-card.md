# Jaydeep-Y/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta el impacto ambiental de una ejecución de entrenamiento de un modelo, realizada en el marco de una asignación académica (TDS GA8). El autor, Jaydeep-Y, publica los datos de emisiones de CO₂ equivalente, consumo energético y hardware utilizado durante el pre-entrenamiento. La relevancia de esta ficha radica en su contribución a la transparencia en el consumo de recursos de los sistemas de IA, un aspecto cada vez más demandado en el ámbito de la IA sostenible. No se proporcionan detalles sobre la arquitectura, el tamaño o el contexto del modelo entrenado, ya que el propósito del repositorio es exclusivamente el registro ambiental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales del registro de emisiones:

| Parametro | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 274.552 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | pre-training |
| Ubicacion geografica | us-east1 |
| Hardware utilizado | NVIDIA RTX 4090 (3 GPUs) |
| Horas de GPU | 396.9 h (PUE: 1.22) |
| Energia total consumida | 653.6943 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo entrenado (si es transformer, MoE, SSM u otra). El repositorio se limita a documentar el proceso de entrenamiento desde la perspectiva del consumo de recursos. Se indica que el modo de entrenamiento fue pre-training, realizado con 3 GPUs NVIDIA RTX 4090 en la region us-east1. La herramienta CodeCarbon se utilizo para estimar las emisiones, con un factor de PUE (Power Usage Effectiveness) de 1.22. No se mencionan datos sobre el dataset, el numero de tokens ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni multilingues.
- La unica "capacidad" es la de proporcionar un registro cuantitativo de emisiones de carbono asociadas a un entrenamiento, utilizable para auditorias de sostenibilidad.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el registro permite cuantificar el impacto ambiental de un entrenamiento concreto, sirviendo como referencia para empresas que necesitan reportar su huella de carbono.
- Comparativa de eficiencia energetica entre configuraciones de hardware: los datos de horas de GPU y consumo pueden usarse para evaluar la eficiencia de diferentes entornos de entrenamiento.
- Educacion y concienciacion: en cursos de IA responsable, este tipo de tarjeta ejemplifica como documentar el coste ambiental de los modelos.
- Investigacion en Green AI: los datos agregados de multiples tarjetas similares pueden alimentar estudios sobre el coste real de entrenar modelos en diferentes regiones y hardware.
- Optimizacion de infraestructura: los responsables de clusters pueden usar estos registros para decidir donde ejecutar entrenamientos segun la intensidad de carbono de la red electrica local.
- Cumplimiento normativo: ante futuras regulaciones sobre emisiones de IA, este formato de documentacion podria servir como plantilla para reportes obligatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento documentado utilizo 3 GPUs NVIDIA RTX 4090, con un total de 396.9 horas de GPU.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporciona un modelo desplegable.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos ni arquitectura.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este repositorio no es un modelo de IA. Otros repositorios similares en Hugging Face (por ejemplo, `jayiitm/tds-carbon-card` o `shyam1504/tds-carbon-card`) contienen la misma estructura de tarjeta de carbono, pero no ofrecen datos de rendimiento de modelos.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA, por lo que no puede utilizarse para tareas de generacion, analisis o inferencia.
- Los datos de emisiones son estimaciones basadas en CodeCarbon y pueden variar segun la metodologia de calculo y el factor de emision de la red electrica de la region.
- No se proporciona informacion sobre el modelo entrenado (arquitectura, tamaño, dataset), lo que limita la reproducibilidad del registro.
- La licencia no esta especificada, por lo que el uso comercial de los datos debe considerarse con cautela.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser un artefacto de un ejercicio academico futuro o una simulacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jaydeep-Y/tds-carbon-card
- Repositorio similar (jayiitm): https://huggingface.co/jayiitm/tds-carbon-card
- Repositorio similar (shyam1504): https://huggingface.co/shyam1504/tds-carbon-card
- Publicacion en X del autor: https://x.com/_jaydeepkarale/status/2091884749757546924
