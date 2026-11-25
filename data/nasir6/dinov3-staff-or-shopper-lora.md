# Nasir6/dinov3-staff-or-shopper-lora

## Resumen
El modelo `Nasir6/dinov3-staff-or-shopper-lora` es un adaptador LoRA sobre el backbone de vision DINOv3 de Meta, concretamente la variante ViT-B/16 preentrenada (`facebook/dinov3-vitb16-pretrain-lvd1689m`). Lo desarrolla el usuario Nasir6 y su proposito es clasificar recortes de personas en imagenes de camaras de tienda como cliente o trabajador (staff), una tarea binaria de clasificacion de imagenes orientada al sector retail.

El modelo resuelve un problema concreto de analitica de video en tienda: distinguir personal de clientes a partir de un recorte de persona. El backbone DINOv3 permanece congelado y solo se entrena un adaptador LoRA de rango 8 sobre las proyecciones de query y value de todas las capas de atencion, junto con una cabeza de clasificacion MLP. Segun la model card, el resultado en test es de 0,9518 de accuracy y 0,9341 de macro F1 sobre 83 recortes de test.

Es relevante por su bajo coste de entrenamiento (un adaptador LoRA pequeno sobre un backbone congelado) y por su aplicacion directa en retail, aunque el modelo es de nicho, tiene cero descargas y cero likes en Hugging Face, y su uso esta sujeto a la licencia DINOv3. La entrada debe ser obligatoriamente un recorte de persona, no una escena completa.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (DINOv3) congelado + adaptador LoRA + cabeza MLP de clasificacion |
| Parametros totales | no disponible (backbone ViT-B/16, ~86M; adaptador LoRA y cabeza aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | dinov3-license (license: other) |
| Formato de pesos | safetensors (adaptador PEFT) + `head.pt` (PyTorch) + `classes.json` |

## Arquitectura y entrenamiento
El modelo parte de DINOv3 ViT-B/16, un transformer de vision con parches de 16x16 preentrenado por Meta con destilacion auto-supervisada sobre LVD-1689M. Sobre ese backbone congelado se aplica un adaptador LoRA de rango 8 y alpha 16 unicamente en las proyecciones `q_proj` y `v_proj` de todos los bloques de atencion. La salida del backbone (`pooler_output`, 768 dimensiones) alimenta una cabeza MLP: `Linear(768, 256) -> ReLU -> Dropout(0.3) -> Linear(256, 2)`.

Los datos de entrenamiento provienen del dataset de Roboflow `worker_customer_detection` v4, usando recortes de personas obtenidos a partir de cajas ground-truth. No se especifica el numero de imagenes de entrenamiento, la composicion exacta del dataset ni si hubo aumento de datos. Segun la model card, la evaluacion se realizo con 83 recortes de test, obteniendo accuracy 0,9518 y macro F1 0,9341. No se documenta ningun proceso de RLHF, DPO ni ajuste adicional mas alla del entrenamiento supervisado del adaptador y la cabeza.

## Capacidades
- Clasificacion binaria de imagenes de personas recortadas en dos clases: cliente (customer) y trabajador (worker/staff).
- Extraccion de caracteristicas visuales mediante un backbone DINOv3 ViT-B/16 congelado.
- Integracion con el ecosistema Hugging Face `transformers` y `peft` para cargar el adaptador.
- Entrada restringida a recortes de persona: requiere un detector de personas previo en el pipeline.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas ni vision generativa.
- No soporta tool calling, function calling ni comportamiento de agente.
- No tiene capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso
- Analitica de aforo en tienda: a partir de recortes de personas detectadas por un modelo de deteccion, clasificar cuantos transeuntes son clientes y cuantos son personal, para medir ratio de atencion y presencia de staff por zona.
- Monitorizacion de cumplimiento de personal: verificar que zonas de la tienda cuentan con presencia de trabajadores en horarios concretos, usando la clasificacion staff/cliente sobre recortes de camaras fijas.
- Analisis de flujo de clientes: separar el trafico de clientes del de empleados para calcular metricas limpias de visitas, tiempo de permanencia y conversion sin contaminacion por personal.
- Control de cajas y atencion: identificar si la persona en el recorte de una caja es cliente o cajero, para estudios de tiempos de servicio y ocupacion de mostradores.
- Investigacion de comportamiento en retail: etiquetar automaticamente recortes de personas en datasets de video para construir datasets anotados de cliente/staff a bajo coste, dado el reducido tamano del adaptador.
- Prototipado rapido en pipelines de vision: al ser un LoRA pequeno sobre un backbone congelado, permite experimentar con clasificacion staff/cliente en nuevos dominios de tienda reentrenando solo el adaptador y la cabeza.
- Filtrado previo en sistemas de reconocimiento de personal: descartar recortes de clientes antes de etapas posteriores que solo deben procesar empleados, reduciendo carga computacional.

## Benchmarks y rendimiento
| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9518 | 83 recortes de test |
| Macro F1 | 0,9341 | 83 recortes de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparativas con modelos alternativos en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el backbone ViT-B/16 (~86M parametros) y el adaptador LoRA pequeno son ligeros y caben en GPUs de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles; por tamano del backbone, GPUs consumer tipo RTX 3060/4060 o superiores deberian ser suficientes, aunque no se confirma en la informacion.
- Compatibilidad con GPU consumer: probable por el tamano del modelo, pero no confirmada explicitamente.
- Opciones de despliegue: carga via `transformers` + `peft` (segun el ejemplo de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nasir6/dinov3-staff-or-shopper-lora | Backbone ViT-B/16 + LoRA r8 | no disponible (vision) | Accuracy 0,9518 / macro F1 0,9341 en 83 recortes | dinov3-license | Hugging Face, 0 descargas |
| facebook/dinov3-vitb16-pretrain-lvd1689m (base) | ~86M | no disponible (vision) | No disponible en esta informacion | DINOv3 license | Hugging Face (requiere aceptar licencia) |
| Otros clasificadores staff/cliente sobre ViT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con alternativas de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenar sobre un dataset de Roboflow concreto, puede heredar sesgos de composicion, iluminacion, angulos de camara y demografia presentes en ese dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la clasificacion puede ser erronea en recortes de baja calidad, personas parcialmente ocluidas o imagenes fuera de dominio.
- Limitacion de entrada: requiere un recorte de persona; pasar una escena completa produce resultados no validos segun la model card.
- Limitaciones de contexto e idioma: no aplica contexto textual; no tiene capacidades multilingues ni de lenguaje.
- Evaluacion limitada: solo 83 recortes de test, lo que reduce la fiabilidad estadistica de las metricas reportadas.
- Restricciones de licencia: uso sujeto a la licencia DINOv3 (`dinov3-license`); el acceso al modelo base requiere aceptar la licencia en Hugging Face, y el uso comercial debe revisarse contra los terminos de dicha licencia.
- Caveat para produccion: modelo de nicho con cero descargas y cero likes, sin validacion externa; conviene revalidar en el dominio real de despliegue antes de usarlo en produccion.
- No se documentan procesos de calibracion, umbrales de confianza ni manejo de clases desbalanceadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Nasir6/dinov3-staff-or-shopper-lora
- Modelo base DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Dataset de Roboflow `worker_customer_detection` v4: no disponible como enlace directo en la informacion proporcionada
- Paper de DINOv3: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible
