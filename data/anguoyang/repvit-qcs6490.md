# anguoyang/repvit-qcs6490

## Resumen

RepViT es un modelo de clasificacion de imagenes (1000 clases, ImageNet) basado en una arquitectura hibrida de bloques convolucionales y atencion inspirada en ViT, disenada para dispositivos de borde. Este repositorio concreto, publicado por el usuario anguoyang, no contiene pesos ni artefactos compilados: es una ficha de medicion que documenta el primer resultado publico de rendimiento de RepViT sobre el SoC Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit.

La relevancia del artefacto es acotada pero util: el `perf.yaml` de `qai-hub-models` 0.66.0 no incluia una entrada para este modelo en esa plataforma, por lo que el autor aporta una medicion reproducible (IDs de job de compilacion y perfilado incluidos) que sirve de referencia a quien quiera desplegar clasificacion de imagenes en hardware QCS6490.

El modelo subyacente es un clasificador de 1000 clases con entrada fija de 1x3x224x224 y salida de 1x1000 logits, exportado a ONNX desde la definicion `repvit` de `qai-hub-models` 0.66.0 (92.332.958 bytes). La medicion se realizo en fp32 sin cuantizacion explicita, mediante un unico grafo perfilado con la API de Qualcomm AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepViT (hibrida convolucional + atencion, clasificacion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1x3x224x224) |
| Tipos de cuantizacion | fp32 en la medicion publicada; el autor indica que no se aplico cuantizacion explicita (opciones por defecto de AI Hub) |
| Idiomas soportados | no aplica (clasificacion de imagenes, etiquetas ImageNet de 1000 clases) |
| Licencia | Apache-2.0 (licencia del modelo upstream; la ficha en si solo publica mediciones) |
| Formato de pesos | ONNX exportado (92.332.958 bytes); no se distribuyen pesos en este repositorio |

## Arquitectura y entrenamiento

RepViT es una familia de modelos de vision que reformula bloques tipo ViT combinando convoluciones y mecanismos de atencion para reducir el coste computacional en dispositivos moviles y de borde. La variante perfilada aqui realiza clasificacion sobre ImageNet (1000 clases) con resolucion de entrada 224x224 y devuelve logits por clase.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de las 1000 clases de clasificacion, ni sobre si hubo etapas de ajuste fino con RLHF/DPO (no aplicables a un clasificador de vision). Tampoco se especifica la variante concreta de RepViT (por ejemplo, el ancho o la profundidad) mas alla de que proviene de la definicion `repvit` de `qai-hub-models` 0.66.0.

La innovacion documentada en este repositorio no es arquitectonica sino metodologica: un perfilado de un unico grafo mediante `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub, tomando `execution_summary.estimated_inference_time` como metrica. El autor advierte explicitamente de que se trata de una estimacion por grafo y no de la latencia extremo a extremo de una aplicacion.

## Capacidades

- Clasificacion de imagenes en 1000 clases (ImageNet) a partir de una entrada RGB de 224x224.
- Salida de logits por clase (1x1000), apta para post-procesado con softmax y top-k.
- Ejecucion en hardware Qualcomm via runtime QNN sobre el SoC QCS6490.
- Exportacion a ONNX para su compilacion con Qualcomm AI Hub.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de vision puro.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Clasificacion de imagenes en el borde: desplegar el grafo ONNX compilado con QNN en el Dragonwing RB3 Gen 2 para etiquetar fotogramas de camara en 1000 categorias con una latencia estimada de 36,3 ms por inferencia.
- Referencia de rendimiento para seleccion de hardware: usar la medicion publicada como linea base al evaluar si el QCS6490 cubre los requisitos de un pipeline de vision (por ejemplo, si 36,3 ms por imagen es aceptable para la frecuencia de captura prevista).
- Preprocesado en pipelines de robotica o IoT: emplear el clasificador como etapa de filtrado o enrutado (deteccion de tipo de escena u objeto) antes de modelos mas costosos.
- Validacion de toolchain: servir como caso de prueba reproducible (con IDs de job `jgdy7v2lg` y `jp46jw1l5`) para verificar que la cadena ONNX -> AI Hub -> QNN funciona en una version concreta de `qai-hub-models`.
- Benchmarking comparativo entre SoCs: al formar parte del barrido `qcs-bench` con un arnes uniforme (tres rondas, 14 categorias), permite comparar el QCS6490 con otras plataformas bajo la misma metodologia.
- Docencia y prototipado de vision en dispositivos: punto de partida de bajo coste para experimentar con clasificacion en hardware movil sin necesidad de entrenar un modelo propio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 36,3 ms (36.280 us) |
| Entrada | 1 x 3 x 224 x 224 |
| Salida | 1 x 1000 logits |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones de compilacion por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-25 |
| Job de compilacion | jgdy7v2lg |
| Job de perfilado | jp46jw1l5 |

No se han publicado resultados de benchmarks de precision (top-1/top-5 en ImageNet) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: SoC Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit.
- Runtime: QNN (Qualcomm Neural Network), con compilacion previa via Qualcomm AI Hub.
- VRAM: no disponible; el modelo se ejecuta en un SoC de borde y la informacion proporcionada no incluye consumo de memoria.
- GPU de escritorio recomendadas: no aplica; el artefacto esta orientado a aceleradores Hexagon/NPU del QCS6490.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado), runtime QNN en el dispositivo; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia: 36,3 ms por inferencia estimada en el perfil de un unico grafo; no se proporciona throughput agregado ni latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RepViT (esta ficha) | no disponible | 1x3x224x224 | 36,3 ms en QCS6490 (fp32, QNN) | Apache-2.0 (upstream) | Medicion publica; sin pesos en el repo |
| Otras entradas de `qai-hub-models` 0.66.0 | no disponible | no disponible | no disponible (el autor indica que no hay entrada para RepViT en RB3 Gen 2 en `perf.yaml`) | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos medidos sobre el mismo QCS6490 con el mismo arnes, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La medicion es una estimacion por grafo (`estimated_inference_time`), no una latencia extremo a extremo de aplicacion; el autor lo advierte explicitamente.
- Se realizo en fp32 sin cuantizacion explicita; los tiempos con cuantizacion int8 u otras opciones de compilacion pueden diferir y no se reportan.
- El repositorio no distribuye pesos ni artefactos compilados: solo publica numeros y metodo, por lo que no es directamente desplegable tal cual.
- El modelo es un clasificador de vision de 1000 clases; no admite texto, codigo, tool calling ni tareas generativas.
- No se documentan sesgos especificos, pero al ser un clasificador ImageNet hereda los sesgos de etiquetas y distribucion de dicho dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo relevante es la clasificacion erronea con alta confianza, no cuantificada en la informacion disponible.
- La licencia Apache-2.0 corresponde al modelo upstream; la ficha de medicion no especifica terminos propios adicionales.
- No se indica la variante concreta de RepViT ni el numero de parametros, lo que limita la reproducibilidad exacta fuera del entorno `qai-hub-models` 0.66.0.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/repvit-qcs6490
- Coleccion de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Barrido completo qcs-bench: https://github.com/anguoyang/qcs-bench
