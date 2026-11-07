# Omar111199/team-qh-109-container-inspect

## Resumen

Container damage inspection (team QH-109) es un sistema compuesto de inspección automática de contenedores marítimos publicado en Hugging Face por el usuario Omar111199 en el marco del hackathon Qai x Hugging Face celebrado en Doha (etiqueta `qai-hf-hackathon-2026`). El repositorio no contiene un único modelo monolítico, sino un pipeline de tres etapas que combina un detector de objetos RF-DETR large afinado a 896 px, un filtro de grounding OWLv2 base patch16 ensemble sin reentrenar y un verificador LoRA sobre Qwen3-VL-8B-Instruct entrenado con TRL. El objetivo declarado es sustituir la inspección manual, que el autor cifra en 7-8 minutos por contenedor, por un análisis de fotografía y vídeo que marque abolladuras (`dent`), agujeros (`hole`) y óxido (`rust`) con cajas, emita un veredicto (`fit`, `repair`, `out_of_service`) y derive a revisión humana cuando la confianza es insuficiente.

El peso efectivo del repositorio es reducido: 33.627.388 parámetros en safetensors y 0,3 GB de tamaño total, lo que corresponde al detector y al adaptador LoRA, no al modelo base Qwen3-VL-8B (8.000 millones de parámetros), que se descarga por separado desde su repositorio original. La licencia es Apache 2.0 y el pipeline declarado en Hugging Face es `object-detection`.

Su relevancia actual es doble: por un lado, documenta con métricas medibles (F1 de 54,9% en el conjunto de test completo, latencia de 1,82 s por foto en A10G) un caso de uso industrial concreto; por otro, ejemplifica un patrón de composición de modelos abiertos (detector especializado + filtro de grounding + verificador VLM) frente a la alternativa de usar un único modelo generalista de gran tamaño, que el autor mide en 4,68 s por imagen y F1 de 20,5% en la misma muestra de 30 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: detector RF-DETR large (transformer de deteccion de objetos) + filtro OWLv2 base patch16 ensemble + verificador LoRA sobre Qwen3-VL-8B-Instruct |
| Parametros totales | 33.627.388 (safetensors del repositorio: detector y adaptador; el base Qwen3-VL-8B suma 8.000 millones adicionales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors sin cuantizar; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (la model card no declara cobertura linguistica; el componente VLM hereda los de Qwen3-VL-8B-Instruct, no verificados aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`, `preprocessor_config.json`) y adaptador LoRA en `verifier/` |

## Arquitectura y entrenamiento

El sistema es una cascada de tres componentes con responsabilidades separadas. La primera etapa es RF-DETR large, afinado a resolución de 896 px sobre el dataset `nishanthaivision/container-defect-detection` de Roboflow (3.795 imágenes de entrenamiento, CC BY 4.0), del que el autor eliminó 1.291 imágenes con casi-duplicados en el split de test para evitar fuga de datos. En fotografía se aplica test-time augmentation con volteo horizontal y escalas 672/1120 px, y las cajas resultantes se fusionan mediante Weighted Boxes Fusion. La segunda etapa usa `google/owlv2-base-patch16-ensemble` sin modificar para localizar el contenedor y descartar cajas fuera de él. La tercera etapa es un adaptador LoRA sobre Qwen3-VL-8B-Instruct, entrenado con TRL sobre recortes de daños reales, falsos positivos del detector y distractores visuales como herrajes de cierre y manchas oscuras; este verificador da una segunda opinión por caja y confirma agujeros. La regla de decisión en fotografía es que una caja permanece si `confianza_detector × P(yes)` es al menos 0,33.

La lógica de veredicto tiene una salvaguarda explícita: un agujero solo conduce a `out_of_service` si el verificador lo confirma; si la caja de agujero alcanza 0,20 sin confirmación, el sistema emite `needs_human_check` con el motivo "possible hole" y nunca la descarta en silencio. El lado del contenedor y su número se obtienen de un Qwen3-VL-30B alojado externamente. No se documentan en la información disponible el número de tokens de entrenamiento del VLM, la composición completa del dataset del verificador ni si hubo fases de RLHF o DPO; el ajuste del verificador se realizó con TRL, lo que en la práctica implica supervisión (SFT) sobre pares de recortes y etiquetas, pero el detalle no se explicita. Tampoco se describen innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Detección de daños en contenedores marítimos: localiza abolladuras (`dent`), agujeros (`hole`) y óxido (`rust`) mediante cajas delimitadoras sobre fotografía y vídeo.
- Clasificación de veredicto operativo: emite `fit`, `repair` u `out_of_service` a partir de las detecciones y de la confirmación del verificador.
- Verificación visual de segunda opinión: el LoRA sobre Qwen3-VL-8B evalúa cada caja candidata y reduce falsos positivos, especialmente en agujeros.
- Filtrado por contexto de escena: OWLv2 descarta detecciones fuera del contenedor, lo que evita cajas sobre fondo, grúa o muelle.
- Abstención explícita: genera `needs_human_check` con motivo cuando la evidencia es ambigua, en lugar de forzar una decisión.
- Lectura de identificadores: el lado y el número de contenedor se extraen mediante un Qwen3-VL-30B alojado, no por los pesos del repositorio.
- Procesamiento de vídeo además de fotografía: el pipeline consume fotogramas de vídeo real con una ratio de 4,4 s de proceso por segundo de vídeo en A100.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada; el sistema es una cascada fija, no un agente autónomo.

## Casos de uso

- Inspección de recepción en terminal portuario: el sistema procesa las fotos tomadas en el punto de entrada y emite un veredicto `fit`/`repair`/`out_of_service` en 1,82 s de mediana en A10G, lo que permite clasificar contenedores en cola sin detener la operativa.
- Triaje previo a inspección manual: con una tasa de derivación del 20,6% en test y del 6,0% en fotos limpias, el personal solo revisa los casos marcados, reduciendo el tiempo dedicado a contenedores sin daño.
- Detección de agujeros con salvaguarda: dado que 55 de 73 fotos con agujero etiquetado se marcan como `out_of_service`, el sistema sirve para bloquear contenedores potencialmente no aptos para carga, con la garantía de que las cajas no confirmadas se escalan a revisión humana en lugar de descartarse.
- Auditoría de flota con vídeo: el pipeline acepta vídeo real (4,4 s de proceso por segundo de vídeo en A100), lo que permite revisar grabaciones de inspección ya existentes sin nueva captura fotográfica.
- Control de calidad en depósito de reparación: la distinción entre `dent` (F1 53,4%) y `hole` (F1 63,1%) permite priorizar la reparación estructural frente a la cosmética y estimar el alcance del trabajo.
- Monitorización de flota en producción logística: la latencia de 1,16 s por foto con modelos locales en A10G y el pico de 17,6 GB de VRAM hacen viable el despliegue en una GPU de gama de servidor por instancia, integrable en un servicio de subida de imágenes.
- Filtro de falsos positivos en pipelines de visión existentes: el verificador LoRA, entrenado también con los errores del propio detector, puede reutilizarse conceptualmente como etapa de segunda opinión sobre cajas de cualquier detector de daños, aunque su distribución de entrenamiento está acotada a contenedores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. El split de test no contiene etiquetas de óxido, por lo que `rust` no se evalúa. Las fotos limpias nunca se usaron para entrenamiento ni ajuste, aunque el autor advierte que comparten conjuntos de origen con los negativos de entrenamiento.

| Medida | Detector solo | Pipeline completo |
|---|---:|---:|
| F1, mismas 30 imágenes que la línea base | 47,7% | 45,5% |
| F1, imágenes no vistas (73) | 37,1% | 39,7% |
| F1, test completo (436 imágenes) | 53,7% | 54,9% (precisión 67,5%, recall 46,2%) |
| F1 por tipo, test completo | no disponible | dent 53,4%, hole 63,1% |
| Aciertos reales / falsas alarmas, test completo | 358 de 798 / 176 | 369 de 798 / 178 |
| Falsas alarmas por foto limpia | 0,107 | 0,007 |
| Fotos limpias: fit / repair / out_of_service | 146 / 0 / 4 | 149 / 1 / 0 |
| Fotos con agujero marcadas out_of_service | 56 de 73 | 55 de 73 |
| Fotos con agujero sin detección ni marca | 13 de 73 | 8 de 73 |
| Latencia | 46 ms por imagen en A10G | 1,82 s mediana, 2,93 s máximo por foto (A10G) |

Referencia comparativa incluida por el autor: un modelo de visión general Qwen3-VL-30B obtiene F1 de 20,5% en las mismas 30 imágenes y tarda 4,68 s por imagen, frente a los 46 ms del detector solo. El pipeline completo tarda 3,54 s de mediana por foto de teléfono a tamaño completo en A100 y 4,4 s por segundo de vídeo (rango 2,75-7,89 s según clip). El pico de memoria GPU es de 17,6 GB. El autor advierte que la diferencia de F1 entre las dos tablas es pequeña y no está validada estadísticamente, y que la ventaja clara se concentra en contenedores limpios.

## Requisitos de hardware

- VRAM estimada: pico medido de 17,6 GB para el pipeline completo (detector + OWLv2 + verificador LoRA sobre Qwen3-VL-8B) en precisión nativa.
- GPU validadas por el autor: A10G (latencia de referencia, 1,82 s mediana por foto) y A100 (3,54 s mediana para fotos de teléfono a tamaño completo; 4,4 s por segundo de vídeo).
- GPU de consumo: no disponible. El pico de 17,6 GB excede los 16 GB de una RTX 4080 y se sitúa justo por encima de los 16 GB de una RTX 4090 en su configuración de referencia; no se documenta ninguna ejecución en GPU de consumo ni variante cuantizada que reduzca el requisito.
- Despliegue: la model card proporciona un ejemplo con `transformers` (`AutoImageProcessor`, `AutoModelForObjectDetection`, `AutoModelForImageTextToText`) y `peft` (`PeftModel.from_pretrained`) para cargar detector y verificador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 46 ms por imagen para el detector solo en A10G; 1,16 s de mediana por foto con modelos locales únicamente en A10G; el componente Qwen3-VL-30B alojado añade aproximadamente 0,66 s adicionales por foto (1,82 s frente a 1,16 s).
- Dependencia externa: el número y lado del contenedor requieren un Qwen3-VL-30B alojado, lo que añade latencia de red y un coste de servicio no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | F1 en la muestra de 30 imágenes | Latencia por imagen | Licencia |
|---|---|---|---:|---:|---|---|
| team-qh-109-container-inspect (pipeline completo) | Detección + verificación VLM | 33,6 M en repo + 8.000 M del base | no disponible | 45,5% | 1,82 s (A10G) | Apache 2.0 |
| team-qh-109-container-inspect (detector solo) | Detección de objetos | 33,6 M | no disponible | 47,7% | 46 ms (A10G) | Apache 2.0 |
| Qwen3-VL-30B (uso general, sin ajuste) | VLM generalista | 30.000 M (estimado por nombre) | no disponible | 20,5% | 4,68 s | no disponible en esta ficha |
| Roboflow/rf-detr-large (base sin ajuste) | Detección de objetos | no disponible | no disponible | no disponible | no disponible | no disponible en esta ficha |

La comparación relevante que aporta el autor es frente al VLM generalista: el pipeline especializado mejora el F1 de 20,5% a 45,5% en la misma muestra y reduce la latencia de 4,68 s a 1,82 s, con la salvedad de que la muestra es de solo 30 imágenes. No se han publicado comparaciones con otros sistemas de inspección de contenedores en la información disponible.

## Limitaciones y advertencias

- El óxido no está evaluado: el split de test carece de etiquetas de `rust`, por lo que el rendimiento en esa clase es desconocido y no debe asumirse equivalente al de abolladuras y agujeros.
- Recall limitado: el pipeline completo alcanza un recall de 46,2% en el test completo, lo que implica que más de la mitad de los daños etiquetados no se detectan; el sistema no es apto como único control de calidad.
- Fuga de datos residual: el autor advierte que las fotos limpias comparten conjuntos de origen con los negativos de entrenamiento y que fueron juzgadas limpias por un modelo, no siempre por una persona, por lo que los resultados en contenedores limpios son probablemente optimistas.
- Diferencia entre tablas no validada: la mejora de F1 del pipeline completo (54,9%) frente al detector solo (53,7%) es pequeña y no ha sido sometida a test estadístico.
- Casos sin cobertura: 8 de 73 fotos con agujero etiquetado no reciben ni detección ni marca de revisión, lo que constituye un fallo silencioso en una categoría crítica para la seguridad de la carga.
- Reproducibilidad parcial: los repositorios de origen del detector (`Omar111199/container-detector-rfdetr-large-neg`) y del adaptador (`Omar111199/container-vlm-lora-v2-8b`) están fijados a commits concretos pero son privados según la propia model card, lo que impide reconstruir el entrenamiento desde cero.
- Dependencia de un servicio externo: la lectura del número y lado del contenedor requiere un Qwen3-VL-30B alojado, lo que introduce un punto de fallo y un coste no documentado en producción.
- Sesgos: no disponibles. No se documenta ningún análisis de sesgo por tipo de contenedor, iluminación, condición meteorológica o geografía.
- Alucinación: no cuantificada para el verificador VLM; el diseño mitiga el riesgo con la regla de abstención `needs_human_check`, pero no se reporta una tasa de alucinación específica.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos base (Qwen3-VL-8B-Instruct, OWLv2, RF-DETR) tienen sus propias licencias que deben verificarse por separado; el dataset de entrenamiento es CC BY 4.0 y exige atribución.
- Idiomas: no declarados; cualquier uso multilingüe en la interfaz o en los motivos de abstención depende del comportamiento del base Qwen3-VL-8B, no verificado en esta ficha.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Omar111199/team-qh-109-container-inspect
- Demo en Spaces: https://huggingface.co/spaces/Omar111199/team-qh-109-container-inspect-app
- Modelo base del verificador: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base del detector: https://huggingface.co/Roboflow/rf-detr-large
- Modelo base del filtro: https://huggingface.co/google/owlv2-base-patch16-ensemble
- Dataset de daños en contenedores: https://universe.roboflow.com/nishanthaivision/container-defect-detection-8yjig
- Negativos limpios, Container Number: https://universe.roboflow.com/container-code-number/container-number-3e8ok
- Negativos limpios, Container Shipping Number: https://universe.roboflow.com/dany-ardyansyah/container-shipping-number
- Negativos limpios, Container: https://universe.roboflow.com/kds-4zswk/container-lwf8d
- Repositorio privado del detector (referenciado en la model card): https://huggingface.co/Omar111199/container-detector-rfdetr-large-neg
- Repositorio privado del adaptador (referenciado en la model card): https://huggingface.co/Omar111199/container-vlm-lora-v2-8b
