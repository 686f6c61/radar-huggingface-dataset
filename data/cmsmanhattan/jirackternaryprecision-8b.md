# CMSManhattan/JiRackTernaryPrecision-8B

## Resumen

JiRackTernaryPrecision-8B es un modelo de lenguaje de 8.078.038.528 parámetros distribuido en formato GGUF y cuantizado en precisión ternaria (1.58 bits), lo que lo vincula a la familia de técnicas BitNet. Lo desarrolla CMSManhattan y deriva del modelo base CMSManhattan/JiRackUltra_7b, sobre el que se aplica una cuantización agresiva orientada a inferencia eficiente en llama.cpp. Su pipeline declarado es text-generation y sus etiquetas inciden en function calling, uso de herramientas, agentes y robótica.

La propuesta del modelo es reducir drásticamente el coste de memoria y cómputo manteniendo las capacidades conversacionales y de invocación de herramientas del modelo original. Al tratarse de pesos ternarios, el peso en disco y en memoria se aproxima a 2 bits por parámetro efectivo, lo que permite plantear despliegues en hardware muy modesto comparado con un transformer de 8B en FP16.

La relevancia actual viene de la combinación de dos factores: por un lado, el interés creciente en cuantizaciones sub-2-bit para servir agentes en el borde; por otro, la integración con llama.cpp y endpoints compatibles, que facilita su adopción en stacks existentes. El acceso está restringido (gated) y la licencia es propietaria (jirack-proprietary), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); cuantizacion ternaria 1.58-bit tipo BitNet |
| Parametros totales | 8.078.038.528 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1.58-bit (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (acceso restringido, gated) |
| Formato de pesos | GGUF (libreria gguf); safetensors referenciado en el conteo de parametros |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer derivado de CMSManhattan/JiRackUltra_7b. La innovacion principal es la cuantizacion ternaria a 1.58 bits, una tecnica asociada a BitNet que restringe los pesos a valores ternarios y combina escalado por grupo para mantener la calidad. El modelo se distribuye en GGUF, lo que sugiere kernels especificos en llama.cpp para operar con pesos ternarios.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. El modelo base declara 7B en su nombre, mientras que el conteo real de parametros del modelo cuantizado es de aproximadamente 8.078 millones, una discrepancia que conviene verificar contra la model card oficial.

## Capacidades

- Generacion de texto conversacional en formato text-generation.
- Function calling y tool use, segun las etiquetas del repositorio.
- Soporte para agentes y razonamiento multi-paso (etiqueta agents).
- Orientacion a robotica (etiqueta robotics), presumiblemente como capa de planificacion o invocacion de herramientas.
- Compatibilidad con endpoints (endpoints_compatible), lo que facilita su integracion en servicios HTTP.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede encadenar llamadas a herramientas y mantener estado conversacional, adecuado por su soporte declarado de function calling y agents.
- Orquestacion de robots o sistemas embebidos: la cuantizacion ternaria reduce el peso a aproximadamente 2 bits por parametro, lo que permite ejecutar el modelo en hardware con memoria limitada junto al software de control.
- Asistentes conversacionales en el borde: al caber en GPUs de consumo y en CPU con llama.cpp, puede desplegarse en estaciones de trabajo sin aceleradores dedicados.
- Backend de tool calling en pipelines internos: su compatibilidad con endpoints permite exponerlo como servicio REST para que otros sistemas invoquen funciones.
- Prototipado rapido de agentes: el formato GGUF y la integracion con llama.cpp permiten iterar sin infraestructura de servido compleja.
- Evaluacion de cuantizacion ternaria: util como referencia para medir la degradacion de calidad frente al modelo base JiRackUltra_7b en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos ternarios a 1.58 bits, el peso ronda los 1,6 GB para 8.078 millones de parametros; sumando overhead de KV cache y runtime, un despliegue tipico se situa en el rango de 3 a 6 GB, aunque no hay cifras oficiales.
- GPU recomendadas: no disponibles de forma oficial; por tamano, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, asi como en A100 y H100 para despliegues de mayor concurrencia.
- GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas, y en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); vLLM, TGI y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRackTernaryPrecision-8B | 8.078 M | no disponible | Ternaria 1.58-bit | jirack-proprietary (gated) | Hugging Face, acceso restringido |
| JiRackUltra_7b (base) | ~7B | no disponible | no disponible | no disponible | Hugging Face |
| BitNet b1.58 (referencia academica) | variable | no disponible | Ternaria 1.58-bit | no disponible | Publicaciones y repos |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion ternaria puede degradar la calidad frente al modelo base en tareas de razonamiento complejo; no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no puede acotarse.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia propietaria (jirack-proprietary) y acceso gated: es necesario aceptar condiciones en Hugging Face y verificar los terminos para uso comercial antes de desplegar en produccion.
- El modelo base figura como 7B mientras el conteo real es de 8.078 millones de parametros; conviene validar la configuracion antes de asumir compatibilidades.
- Sin datos de sesgos conocidos ni de composicion del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-8B
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_7b
