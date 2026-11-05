# mariambhd/drone-qwen2vl-2b-kd-reverse-a0p5-T4p0

## Resumen

El modelo `mariambhd/drone-qwen2vl-2b-kd-reverse-a0p5-T4p0` es un adaptador LoRA sobre el modelo base multimodal Qwen2-VL-2B-Instruct, desarrollado por el usuario mariambhd. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (Parameter-Efficient Fine-Tuning) que debe cargarse junto al checkpoint original de Qwen. Su proposito es la clasificacion de acciones humanas en videos grabados con drones, en un esquema de siete clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.

El adaptador se ha entrenado mediante destilacion de conocimiento con etiquetas suaves (soft-label KD) usando una divergencia KL inversa, tomando como profesor un modelo Qwen2.5-VL-3B aumentado con otro LoRA del mismo autor. El alumno es el Qwen2-VL-2B-Instruct, lo que reduce el coste de inferencia a costa de una perdida notable de precision: el profesor alcanza 95,00% de accuracy en el conjunto de test y el alumno se queda en 75,00%. Es, por tanto, un experimento de compresion de modelos multimodales aplicado a un dominio muy concreto (analisis de video aereo), no un modelo de proposito general.

La relevancia practica es limitada fuera de ese nicho: el repositorio no declara licencia, no incluye pesos completos, no tiene descargas ni likes, y el conjunto de test es muy pequeno (40 videos), lo que hace que cada video valga 2,5 puntos porcentuales de accuracy. Aun asi, ilustra una tecnica reproducible de destilacion de VLMs en dominios especializados con recursos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL) con adaptador LoRA (PEFT) |
| Parametros totales | 2B (modelo base Qwen2-VL-2B-Instruct); el adaptador LoRA anadido no se especifica |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2-VL-2B-Instruct, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors PEFT; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imagenes y video junto a texto. El adaptador anade matrices de bajo rango a las capas del base, pero la model card no detalla ni el rango, ni las capas objetivo, ni el numero de parametros entrenables. El entrenamiento sigue un esquema de destilacion con etiquetas suaves: se minimiza `L = (1 - alpha) * CE(ground_truth) + alpha * T^2 * KL(distribucion_7_clases)`, con `alpha = 0.5` y `T = 4.0`, usando una divergencia KL inversa entre la distribucion del alumno y la del profesor.

El profesor es Qwen2.5-VL-3B con el LoRA `mariambhd/drone-qwen25vl-3b-lora-7class` (fold 3 de validacion cruzada). La particion de datos es la del profesor: sujetos de entrenamiento [1, 2, 5, 6, 7, 9, 10], validacion [3] y test [4, 8]. La mejor epoca segun la entropia cruzada de validacion fue la 1, lo que sugiere sobreajuste rapido o una tasa de aprendizaje alta. No se documentan el volumen de tokens, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de acciones en video aereo (grabaciones con dron) en 7 clases: attacking, hitting, kicking, clapping, waving, walking, running.
- Procesamiento multimodal de video y texto heredado del base Qwen2-VL-2B-Instruct (comprension de imagenes y frames).
- Destilacion de conocimiento desde un VLM mayor (Qwen2.5-VL-3B) mediante etiquetas suaves.
- No se declara soporte de tool calling, function calling ni agentes multi-paso.
- No se declara modo thinking, audio ni otras capacidades especiales.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Monitorizacion de seguridad perimetral con drones: clasificar en tiempo real si una persona en el video aereo esta atacando, golpeando o pateando, para disparar alertas a operadores de seguridad. El tamano 2B permite ejecucion en el borde si se cuantiza el base.
- Analisis forense de grabaciones aereas: etiquetar automaticamente segmentos de video de vigilancia con las siete clases para facilitar la busqueda y revision posterior por parte de analistas.
- Deteccion de comportamientos anomalos en recintos: distinguir walking o running de conductas agresivas (hitting, kicking) en videos de patrulla con dron.
- Investigacion en destilacion de VLMs: servir como punto de partida reproducible para comprimir modelos mayores a 2B en tareas de reconocimiento de acciones, dado que la receta (alpha=0.5, T=4.0, KL inversa) esta documentada.
- Prototipado de clasificadores de accion de bajo coste: usar el adaptador como baseline barato antes de escalar a un modelo mayor, comparando directamente contra el profesor de 3B.
- Educacion y demostracion: ejemplo didactico de fine-tuning PEFT multimodal con particion por sujetos y evaluacion con macro F1, util en cursos de vision por computador.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto de test (sujetos [4, 8], 40 videos):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (Qwen2.5-VL-3B + LoRA) | 95,00% | 96,43% | 95,00% |
| Alumno (Qwen2-VL-2B + LoRA, este modelo) | 75,00% | 67,90% | 73,06% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El conjunto de test es muy pequeno: un unico video altera 2,5 puntos de accuracy, por lo que la varianza de estas cifras es alta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El base Qwen2-VL-2B-Instruct en fp16 requiere aproximadamente 4-5 GB de VRAM; en 8 bits alrededor de 2,5-3 GB; en 4 bits alrededor de 1,5-2 GB. El adaptador LoRA anade una sobrecarga marginal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para el base en fp16; cualquier GPU consumer con 8 GB o mas deberia poder ejecutar el base cuantizado.
- Cabe en GPU consumer: si, con cuantizacion del base (por ejemplo, RTX 3060, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM con soporte de LoRA, TGI, y llama.cpp/Ollama solo si se convierte el base a GGUF; el adaptador PEFT no se carga directamente en llama.cpp sin fusion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA KD) | 2B | no disponible | 75,00% | no disponible | HuggingFace, adaptador PEFT |
| Profesor (Qwen2.5-VL-3B + LoRA) | 3B | no disponible | 95,00% | no disponible | HuggingFace, adaptador PEFT |
| Qwen2-VL-2B-Instruct (base sin fine-tuning) | 2B | no disponible | no disponible | no disponible en esta ficha | HuggingFace |

La comparativa se limita al ecosistema del propio autor porque la model card no referencia alternativas externas de reconocimiento de acciones con dron. No hay datos publicos que permitan comparar con otros clasificadores de accion aereo en igualdad de condiciones.

## Limitaciones y advertencias

- Solo es un adaptador LoRA: requiere descargar y cargar por separado Qwen/Qwen2-VL-2B-Instruct; no funciona de forma autonoma.
- Precision limitada: 75,00% de accuracy y 67,90% de macro F1 en test, muy por debajo del profesor (95,00% / 96,43%). El macro F1 bajo indica clases con rendimiento desequilibrado.
- Conjunto de test diminuto (40 videos, 2 sujetos): las metricas tienen alta incertidumbre y no son extrapolables a otros dominios, camaras o condiciones de vuelo.
- Mejor epoca = 1: senal de posible sobreajuste o de una tasa de aprendizaje mal ajustada; el entrenamiento no parece convergido de forma estable.
- Sesgos conocidos: no disponibles; al entrenarse sobre un dataset de acciones concreto, hereda los sesgos de sujetos, escenarios y camaras de ese dataset.
- Riesgo de alucinacion: inherente a los VLMs; en clasificacion puede asignar clases con alta confianza aunque la evidencia visual sea ambigua.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor o revisarse la licencia del base Qwen2-VL-2B-Instruct antes de cualquier despliegue productivo.
- Idiomas y contexto: no declarados; no se garantiza soporte multilingue ni ventanas largas de video.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Fecha de creacion futura (2026-11-05) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- HuggingFace: https://huggingface.co/mariambhd/drone-qwen2vl-2b-kd-reverse-a0p5-T4p0
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- LoRA profesor: https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Repositorio Qwen2-VL: https://github.com/QwenLM/Qwen2-VL
- Documentacion PEFT: https://huggingface.co/docs/peft
