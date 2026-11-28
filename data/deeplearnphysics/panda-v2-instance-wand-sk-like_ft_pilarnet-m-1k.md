# DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_pilarnet-m-1k

## Resumen

`panda-v2-instance.wand-sk-like_ft_pilarnet-m-1k` es un modelo de segmentacion de instancias para fisica de particulas desarrollado por DeepLearnPhysics, publicado en Hugging Face bajo la libreria `pimm` (particle imaging models). El modelo parte del encoder `panda-v2.wand-sk-like`, preentrenado sobre datos tipo WAND SK, y se adapta mediante LoRA (rango 16) junto con la cabeza de deteccion, afinandose sobre 1.000 eventos etiquetados del conjunto PILArNet-M. Los pesos publicados corresponden al mejor checkpoint de validacion del run `panda-v2-lar-n1000-from-wand`, evaluado sobre el split de test del articulo.

No se trata de un modelo de lenguaje: es un detector de instancias sobre nubes de puntos (point clouds) procedentes de detectores de camara de proyeccion temporal de argon liquido (LArTPC), orientado a la reconstruccion de trazas de particulas. Con 60,4 millones de parametros y un peso de repositorio de 0,2 GB, esta pensado para integrarse en pipelines de analisis de fisica experimental, no para tareas de NLP.

Su relevancia es acotada y muy especializada: demuestra el uso de adaptacion LoRA para transferir un encoder preentrenado en un dominio de fisica (WAND SK-like) a otro conjunto experimental (PILArNet-M) con tan solo 1.000 eventos etiquetados, lo que resulta relevante para grupos que trabajan en reconstruccion de eventos con recursos de anotacion limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de segmentacion de instancias sobre nubes de puntos (Panda V2, `panda-detector-v2m1`) con encoder `panda-v2.wand-sk-like` y adaptadores LoRA (rango 16) |
| Parametros totales | 60.427.164 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de nubes de puntos, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision/fisica, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un detector de instancias de tipo Panda V2 (`panda-detector-v2m1`) que opera sobre nubes de puntos generadas a partir de eventos de LArTPC. El backbone es el encoder `panda-v2.wand-sk-like`, preentrenado sobre el conjunto WAND SK-like. Sobre este encoder se aplica una adaptacion LoRA de rango 16, y el conjunto encoder + cabeza de deteccion se afina sobre 1.000 eventos etiquetados de PILArNet-M. El resultado es el mejor checkpoint de validacion del run `panda-v2-lar-n1000-from-wand`, evaluado en el split de test del articulo.

No se dispone de informacion detallada sobre el numero de tokens o eventos de preentrenamiento, la composicion exacta del dataset WAND SK-like, ni sobre el uso de tecnicas de alineacion como RLHF o DPO (no aplicables en este dominio). La innovacion tecnica destacable es la combinacion de preentrenamiento en un dominio de fisica y ajuste fino con LoRA sobre un conjunto pequeno (1.000 eventos), lo que reduce el coste de anotacion. El modelo permite seleccionar el backend de atencion (`attention_backend="torch"` en GPUs sin FlashAttention).

## Capacidades

- Segmentacion de instancias sobre nubes de puntos de eventos LArTPC: identifica y separa trazas de particulas individuales dentro de un evento.
- Reconstruccion de particulas en fisica de neutrinos y detectores de argon liquido.
- Transferencia de dominio mediante LoRA desde un encoder preentrenado en WAND SK-like a PILArNet-M.
- Inferencia en GPU con backend FlashAttention o `torch` como alternativa.
- Integracion con la libreria `pimm` mediante `pimm.from_pretrained(...)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reconstruccion de eventos en experimentos LArTPC: el modelo procesa nubes de puntos de un evento y devuelve las instancias de particulas, sustituyendo o asistiendo a algoritmos tradicionales de clustering y separacion de trazas.
- Analisis de fisica de neutrinos: separacion de vertices y trazas para estudios de interacciones neutrino-nucleo en detectores de argon liquido, donde la identificacion correcta de instancias es critica para la seleccion de eventos.
- Transferencia a nuevos conjuntos experimentales con pocas etiquetas: el uso de LoRA permite reajustar el encoder a un nuevo dataset con tan solo 1.000 eventos etiquetados, util para grupos con capacidad de anotacion limitada.
- Prototipado rapido en pipelines de `pimm`: el modelo se carga con `pimm.from_pretrained` y se integra en flujos de evaluacion existentes usando las transformaciones de `configs/panda/v2/finetune/_base_/datasets/lartpc.py`.
- Reproducibilidad de resultados academicos: al ser el checkpoint evaluado en el split de test del articulo, sirve para replicar las cifras publicadas por los autores.
- Benchmarking de metodos de segmentacion de instancias en point clouds cientificos: comparar el rendimiento de Panda V2 con LoRA frente a otros detectores sobre PILArNet-M.
- Despliegue en GPUs de gama media: con 60,4 millones de parametros y 0,2 GB de pesos, el modelo es ligero y puede ejecutarse en GPUs consumer para inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 60,4 millones de parametros y 0,2 GB de pesos, la huella de memoria del modelo es reducida y el cuello de botella sera el tamano de las nubes de puntos de entrada, no los pesos.
- GPU recomendadas: no se especifican en la informacion disponible; el modelo requiere CUDA (`device="cuda"`) y soporta FlashAttention, por lo que se beneficia de GPUs Ampere o superiores (A100, H100, RTX 30xx/40xx).
- Cabe en GPU consumer: si, dado el reducido tamano de pesos; se recomienda verificar la memoria necesaria para los lotes de nubes de puntos.
- Opciones de despliegue: libreria `pimm` (carga via `pimm.from_pretrained`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de segmentacion de instancias sobre nubes de puntos en LArTPC, ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo altamente especializado en fisica de particulas; no es utilizable fuera del dominio de nubes de puntos de LArTPC.
- Entrenado con solo 1.000 eventos etiquetados de PILArNet-M, lo que puede limitar la generalizacion a otras configuraciones de detector o condiciones experimentales.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion; es imprescindible contactar con el autor antes de usarlo en produccion.
- Dependencia del preentrenamiento en WAND SK-like: el rendimiento puede degradarse si los datos de destino difieren sustancialmente de la distribucion de origen.
- Requiere usar las transformaciones de evaluacion especificas de `pimm` (`lartpc.py`); un preprocesado incorrecto invalida los resultados.
- En GPUs sin FlashAttention es necesario pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Sin datos publicados de benchmarks en la informacion disponible: no se puede verificar el rendimiento real frente a alternativas.
- Riesgo de sesgo hacia las caracteristicas de los eventos de PILArNet-M y WAND SK-like; no se han documentado analisis de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_pilarnet-m-1k
- Encoder preentrenado: https://huggingface.co/DeepLearnPhysics/panda-v2.wand-sk-like
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuracion de dataset LArTPC: `configs/panda/v2/finetune/_base_/datasets/lartpc.py` dentro del repositorio `pimm`
