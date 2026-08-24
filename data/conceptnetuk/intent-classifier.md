# conceptnetUk/intent-classifier

## Resumen

ConceptNet Intent Classifier es un modelo de clasificacion de intenciones desarrollado por ConceptNet Ltd, una empresa con sede en Estados Unidos. Se trata de un `distilbert-base-multilingual-cased` afinado sobre una taxonomia propia de intenciones empresariales de cuatro capas (L1 a L4), orientada a asistentes de voz y agentes conversacionales en entornos corporativos. El modelo resuelve el problema de interpretar comandos de usuario con distintos grados de complejidad: desde ejecucion inmediata ("haz X") hasta intenciones predictivas o autonomas persistentes.

La relevancia actual del modelo radica en su enfoque multilingue y su integracion con pipelines de agentes de IA empresarial, ofreciendo dos rutas de inferencia: una ruta rapida con latencia inferior a 5 ms y una ruta neuronal con precision declarada del 98,6 %. Con 135 millones de parametros, es un modelo compacto y desplegable en entornos de produccion con recursos limitados, aunque su contexto y datos de entrenamiento no estan publicados en detalle.

La arquitectura es un transformer basado en DistilBERT multilingue, y el modelo se distribuye en formato safetensors bajo licencia MIT, lo que permite uso comercial sin restricciones. A dia de hoy no registra descargas ni valoraciones en HuggingFace, lo que sugiere una adopcion aun incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (base multilingue, encoder transformer) |
| Parametros totales | 135.327.748 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; la base `distilbert-base-multilingual-cased` usa 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, frances, espanol, aleman, italiano, portugues, chino, arabe, ruso |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una puesta a punto de `distilbert-base-multilingual-cased`, un encoder transformer destilado de BERT con 6 capas y 12 cabezas de atencion, disenado para reducir el coste computacional manteniendo buena parte del rendimiento semantico. La empresa ConceptNet Ltd lo ha afinado sobre su taxonomia propia de intenciones empresariales de voz, organizada en cuatro capas: L1 (ejecucion inmediata), L2 (condicional), L3 (predictiva) y L4 (autonoma persistente). No se han publicado detalles sobre el numero de muestras de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO.

La model card menciona dos rutas de inferencia: una "fast-path" de alta velocidad y baja latencia, y una "neural" que corresponde al modelo DistilBERT completo. No se detallan innovaciones tecnicas adicionales, como decodificacion especulativa o atencion lineal, mas alla de la clasificacion jerarquica en cuatro niveles.

## Capacidades

- Clasificacion de intenciones de texto en nueve idiomas (ingles, frances, espanol, aleman, italiano, portugues, chino, arabe y ruso).
- Distincion entre intenciones simples (L1: "haz X"), condicionales (L2: "haz X cuando Y"), predictivas (L3: "haz X antes de Y") y autonomas persistentes (L4: "haz X siempre").
- Inferencia de baja latencia en la ruta rapida: menos de 5 ms.
- Precision declarada del 98,6 % para el modelo neuronal y del 83 % para la ruta rapida.
- Precision predictiva declarada del 100 % para el nivel L3, segun la model card.
- Integracion con pipelines de HuggingFace Transformers mediante la interfaz estandar de `text-classification`.
- No se indica soporte de tool calling, razonamiento de multiples pasos, vision ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Asistentes de voz empresariales: el modelo clasifica comandos hablados o escritos en intenciones de cuatro niveles, permitiendo que un sistema de voz decida si ejecuta una accion inmediata o si la pospone a una condicion.
- Enrutamiento de consultas en centros de contacto: integrado en un pipeline de atencion al cliente, clasifica la intencion de la consulta y la deriva al agente humano o al sistema automatizado adecuado.
- Automatizacion de flujos de trabajo condicionales: con la capa L2, el modelo detecta intenciones que dependen de una condicion ("envia el informe cuando el contrato este firmado"), permitiendo activar acciones diferidas.
- Agentes proactivos en entornos corporativos: la capa L3 permite detectar intenciones predictivas y lanzar acciones anticipadas, como preparar un documento antes de una reunion.
- Persistencia de tareas autonomas: la capa L4 puede mantener agentes persistentes que ejecutan acciones de forma continua hasta que el usuario las detenga.
- Filtrado y enrutado en pipelines de LLM: como clasificador previo, puede reducir costes de inferencia al seleccionar el modelo de generacion adecuado segun la intencion detectada.

## Benchmarks y rendimiento

La model card del autor declara los siguientes datos de precision, aunque no especifica el dataset de evaluacion ni el metodo de medicion:

| Metrica | Valor |
|---|---|
| Precision fast-path | 83 % |
| Precision modelo neuronal | 98,6 % |
| Precision L3 predictiva | 100 % |
| Latencia fast-path | < 5 ms |
| Latencia modelo neuronal | < 100 ms |

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GLUE en la informacion disponible. Los valores anteriores provienen exclusivamente de la model card de ConceptNet y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: con 135 millones de parametros, la inferencia en fp32 requiere aproximadamente 1 GB de VRAM; con cuantizacion a 8 bits puede reducirse a unos 600 MB, y en 4 bits a unos 350 MB.
- GPU recomendadas: cualquier GPU moderna con mas de 2 GB de VRAM es suficiente; tarjetas como NVIDIA T4, RTX 3060 o superiores ofrecen margen comodo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU de consumo actual (RTX 2060, RTX 4090, etc.) y tambien en CPU para inferencia batch pequena.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp, Ollama y TGI, aunque por su tamano la opcion mas comun es un endpoint de inferencia estandar.
- Latencia: la ruta rapida declara < 5 ms y la neuronal < 100 ms en el hardware de referencia del autor; en una GPU moderna se espera una latencia inferior a 50 ms para el modelo completo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| conceptnetUk/intent-classifier | DistilBERT multilingual | 135 M | 9 | MIT | Taxonomia de 4 niveles, precision declarada del 98,6 % |
| Falconsai/intent_classification | DistilBERT (base-uncased) | ~67 M | Ingles | MIT | Afinado en menos de 50.000 muestras, 100 epochs |
| Serj/intent-classifier | DistilBERT | no disponible | Ingles | no disponible | Requiere punto final en el texto de entrada; clasifica categorias predefinidas |

La comparacion con Falconsai es la mas directa, ya que ambos son DistilBERT afinados para clasificacion de intenciones. La principal diferencia es el enfoque multilingue y la taxonomia de cuatro niveles de ConceptNet, frente al modelo de Falconsai, mas simple y limitado al ingles. No hay datos publicos que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos potenciales: al ser un modelo afinado sobre una taxonomia propietaria, puede presentar sesgos derivados del dataset de entrenamiento, que no se ha publicado ni auditado.
- Riesgo de alucinacion: como clasificador, el riesgo es bajo, pero existe la posibilidad de asignar una intencion incorrecta cuando el texto es ambiguo o no pertenece a las categorias definidas.
- Limitaciones de contexto: la longitud de contexto se limita a 512 tokens, lo que impide procesar consultas o documentos largos de una sola vez.
- Cobertura de idiomas limitada a 9 lenguas; fuera de ellas, el rendimiento no esta garantizado.
- La precision del 98,6 % y el 100 % en L3 son declaraciones del autor sin verificacion independiente; deben tomarse con cautela antes de usar el modelo en produccion.
- El repositorio no incluye documentacion del dataset de entrenamiento, ni de los hiperparametros, ni de las metricas de evaluacion, lo que dificulta la reproducibilidad.
- No se han publicado resultados en benchmarks estandarizados, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.
- El modelo no soporta generacion de texto ni razonamiento complejo; su unica funcion es clasificar intenciones.

## Enlaces

- HuggingFace: https://huggingface.co/conceptnetUk/intent-classifier
- Sitio web: https://conceptnet.co.uk
- Sandbox de prueba: https://conceptnet.co.uk/sandbox/
- Repositorio GitHub: https://github.com/wushu75/ConceptNet
