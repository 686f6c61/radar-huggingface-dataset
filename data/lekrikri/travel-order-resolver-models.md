# lekrikri/travel-order-resolver-models

## Resumen

Travel Order Resolver es un conjunto de modelos de reconocimiento de entidades nombradas (NER) desarrollado por el usuario lekrikri y publicado en Hugging Face bajo el identificador `lekrikri/travel-order-resolver-models`. Su función es extraer dos tipos de entidades, `DEPART` (origen) y `ARRIVEE` (destino), a partir de órdenes de viaje expresadas en francés, de modo que un sistema posterior pueda interpretar trayectos solicitados en lenguaje natural. Se trata, por tanto, de un componente de procesamiento del lenguaje natural orientado a un dominio muy concreto (consultas de viaje) y no de un modelo generativo de propósito general.

El paquete se distribuye como modelos de spaCy (librería `spacy`) y contiene tres variantes entrenadas con enfoques distintos: un modelo basado en `spacy-ner` entrenado sobre 10 000 ejemplos, un modelo `spacy-sm` obtenido por ajuste fino de `fr_core_news_sm` y un modelo `spacy-blank` entrenado desde cero. Según la model card del autor, sus F1 sobre el conjunto de evaluación `hard_v2` (2 602 frases) son del 90,1 %, 76,9 % y 68,5 % respectivamente. El repositorio tiene un tamaño declarado de 0,0 GB, sin descargas ni valoraciones, y está etiquetado únicamente para el idioma francés.

La relevancia de esta publicación es acotada: no compite con los grandes modelos de lenguaje, sino que resuelve una tarea de extracción de información estructurada dentro de un pipeline de resolución de órdenes de viaje, y se acompaña de una demo en Hugging Face Spaces y de un repositorio de código en GitHub. No se dispone de información sobre arquitectura interna, parámetros, contexto ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spaCy (pipeline NER); variantes `spacy-ner`, `spacy-sm` (fine-tune de `fr_core_news_sm`) y `spacy-blank` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (`fr`) |
| Licencia | no disponible |
| Formato de pesos | modelo spaCy (estructura de directorio de spaCy, con subcarpetas `model-best`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos se construyen sobre la librería spaCy y están especializados en la tarea de reconocimiento de entidades nombradas con dos etiquetas: `DEPART` y `ARRIVEE`. El paquete incluye tres aproximaciones: un pipeline `spacy-ner` entrenado con 10 000 ejemplos, un ajuste fino del modelo preentrenado en francés `fr_core_news_sm` (variante `ner_sm`) y un modelo entrenado desde una configuración en blanco (`spacy-blank`). No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de aumento de datos o validación cruzada.

El autor indica que las evaluaciones se han monitorizado con MLflow y que el código de entrenamiento y evaluación está publicado en el repositorio de GitHub `lekrikri/Travel-Order-Resolver`. El conjunto de evaluación empleado se denomina `hard_v2` y consta de 2 602 frases. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), lo cual es coherente con la naturaleza de un modelo NER basado en spaCy.

## Capacidades

- Extracción de entidades de tipo `DEPART` (punto de origen) y `ARRIVEE` (punto de destino) en frases de órdenes de viaje en francés.
- Procesamiento de lenguaje natural en francés exclusivamente.
- Integración en pipelines de spaCy, lo que permite encadenar el NER con otros componentes (tokenización, lematización, reglas).
- Tres variantes con distintos compromisos entre precisión y coste: el modelo `ner_10k/model-best` es el de mayor F1 (90,1 %), mientras que `ner_sm` (76,9 %) y `ner_blank/model-best` (68,5 %) ofrecen alternativas más ligeras o de menor rendimiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Interpretación de órdenes de viaje en asistentes conversacionales: el modelo extrae origen y destino de una frase en francés para que un motor de reservas o de rutas construya la consulta estructurada; es adecuado por su especialización en las etiquetas `DEPART` y `ARRIVEE`.
- Preprocesado en sistemas de planificación de trayectos: integrado en un pipeline de spaCy, permite convertir texto libre en pares origen-destino antes de consultar APIs de transporte o mapas.
- Enrutamiento de solicitudes en atención al cliente: clasificar y extraer los puntos de un trayecto a partir de mensajes de usuarios para dirigirlos al flujo de reserva correspondiente.
- Extracción de información en formularios o correos: procesar mensajes de viaje recibidos por escrito y poblar automáticamente campos de origen y destino en un sistema de gestión.
- Prototipado y demostración: la variante `ner_sm`, con un F1 del 76,9 %, sirve para validar rápidamente un flujo completo en la demo publicada en Hugging Face Spaces antes de adoptar el modelo de mayor precisión.
- Investigación y docencia en NER de dominio específico: el paquete incluye tres configuraciones (entrenamiento con 10 000 ejemplos, fine-tune de `fr_core_news_sm` y entrenamiento desde cero) que permiten comparar el efecto del preentrenamiento y del volumen de datos en una tarea concreta.
- Evaluación comparativa de pipelines spaCy: el conjunto `hard_v2` (2 602 frases) y el seguimiento con MLflow facilitan reproducir y comparar experimentos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los F1 sobre el conjunto `hard_v2` (2 602 frases):

| Modelo | Motor | F1 (hard_v2) |
|---|---|---|
| `ner_10k/model-best` | spacy-ner, entrenado con 10 000 ejemplos | 90,1 % |
| `ner_sm` | spacy-sm (fine-tune de `fr_core_news_sm`) | 76,9 % |
| `ner_blank/model-best` | spacy-blank | 68,5 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de modelos spaCy de NER, el consumo es muy inferior al de un modelo generativo, pero no se especifican cifras.
- GPU recomendadas: no disponible; no se documenta entrenamiento ni inferencia en GPU.
- Compatibilidad con GPU de consumo: no disponible; por la naturaleza de spaCy, la inferencia en CPU es viable, pero no se confirma en la información proporcionada.
- Opciones de despliegue: carga mediante la librería `spacy` (por ejemplo, `spacy.load` sobre la carpeta del modelo); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Entidades | F1 (hard_v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lekrikri/travel-order-resolver-models` (`ner_10k`) | spaCy NER especializado | fr | DEPART, ARRIVEE | 90,1 % | no disponible | Hugging Face |
| `lekrikri/travel-order-resolver-models` (`ner_sm`) | spaCy NER (fine-tune de `fr_core_news_sm`) | fr | DEPART, ARRIVEE | 76,9 % | no disponible | Hugging Face |
| `fr_core_news_sm` (spaCy) | pipeline general en francés | fr | etiquetas generales de spaCy | no disponible | no disponible en la información | spaCy / Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa con otros modelos NER de dominio turístico no está disponible.

## Limitaciones y advertencias

- El modelo solo procesa francés; no se documenta soporte de otros idiomas.
- Está especializado en dos entidades (`DEPART` y `ARRIVEE`); no cubre fechas, número de pasajeros, clase de billete u otras entidades relevantes para una reserva completa.
- El rendimiento depende del dominio: el F1 del 90,1 % se ha medido sobre el conjunto `hard_v2` del propio autor, no sobre un benchmark externo independiente.
- No se especifica la licencia, por lo que no puede confirmarse el uso comercial ni la redistribución.
- No hay información sobre sesgos, riesgo de alucinación (limitado en un modelo extractivo, pero posible en forma de entidades mal etiquetadas) ni sobre el origen y la composición de los datos de entrenamiento.
- El repositorio no registra descargas ni valoraciones, y su tamaño declarado es de 0,0 GB, lo que conviene verificar antes de integrarlo en producción.
- No se documentan requisitos de hardware, latencia ni procedimientos de despliegue más allá de la carga con spaCy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lekrikri/travel-order-resolver-models
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/lekrikri/travel-order-resolver
- Repositorio de código en GitHub: https://github.com/lekrikri/Travel-Order-Resolver
