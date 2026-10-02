# nmeyer19/introspection-fine-tuning

## Resumen

introspection-fine-tuning es un repositorio de artefactos de investigación publicado por el usuario nmeyer19 en HuggingFace, no un modelo generativo convencional. Contiene adaptadores LoRA, lentes jacobianas (Jacobian lenses) y vectores de dirección (steering vectors) entrenados para replicar y extender el método de Introspection Fine-Tuning (IFT) sobre Llama-3.2-1B-Instruct. El objeto de estudio es la introspección del modelo: su capacidad para reportar su propio estado interno mediante la localización de conceptos y la formación gradual o abrupta de respuestas.

El repositorio se organiza en cuatro familias de adaptadores (replicación IFT, KL anchor, DC-SFT y DC-SFT + KL), lentes jacobianas ajustadas sobre 100 prompts y conjuntos de vectores de dirección para Llama 1B, 3B y 8B. Los adaptadores emplean LoRA con r=16 y alpha=32, aplicados a todas las proyecciones de atención y de MLP. El tamaño total del repositorio es de 3,9 GB, con 0 descargas y 0 likes en el momento de la consulta.

Es relevante para investigadores en interpretabilidad, mecánica interna y seguridad de IA que quieran reproducir los experimentos del repositorio GitHub asociado o reutilizar los artefactos entrenados. Los resultados publicados muestran un intercambio claro: IFT mejora la localización (63,0-67,2 % frente al 10 % de azar) pero degrada MMLU (23-44 %), mientras que DC-SFT preserva mejor el rendimiento (46,4 %) a costa de una localización menor (51,0 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer decoder-only Llama-3.2-1B-Instruct; adaptadores en todas las proyecciones de atención y MLP |
| Parametros totales | No disponible para los adaptadores; el modelo base Llama-3.2-1B-Instruct tiene aproximadamente 1.240 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion; heredada del modelo base Llama-3.2-1B-Instruct |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (Llama 3.1 Community License para los artefactos derivados del modelo de 8B) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), .pt (lentes jacobianas), .tar.gz (vectores de direccion) |

## Arquitectura y entrenamiento

El proyecto replica Introspection Fine-Tuning (IFT) sobre Llama-3.2-1B-Instruct y prueba tres extensiones. Todos los adaptadores son LoRA con rango r=16 y alpha=32, aplicados a todas las proyecciones de atención y MLP. El directorio `adapters/01_ift_replication/` contiene la receta IFT del paper original (`semantic/`, épocas 00 a 06) junto con un control entrenado con vectores de ruido aleatorio (`gaussian_control/`, épocas 00 a 06). `adapters/02_kl_anchor/` incorpora un anclaje KL al modelo base con distintos valores de lambda (0, 0.1, 0.5 y 2.0, épocas 00 a 06) y una receta `best_recipe` que combina lambda 0.5 con inyección de estilo de razonamiento y frases variadas. `adapters/03_dcsft/` recoge DC-SFT (épocas 00 a 03) y un control con el objetivo IFT del paper usando el mismo código y datos que DC-SFT. `adapters/04_dcsft_kl/` combina DC-SFT con anclaje KL (lambda 2.0, épocas 00 a 03).

Los artefactos complementarios incluyen lentes jacobianas (`lenses/`) ajustadas sobre 100 prompts para el modelo base, el brazo IFT (época 6, fusionado), el brazo DC-SFT (época 3, fusionado) y el ancla Llama-3.1-8B-Instruct, validada contra la lente publicada. Los conjuntos de vectores de dirección (`steering_vectors/`) cubren Llama 1B, 3B y 8B en capas alternas (cada tercer nivel), más conjuntos adicionales (`llama_1b_t04bgrid`, `llama_1b_shallow`, `llama_3b_shallow`) para rejillas de calibración. La innovación técnica central es el uso de lentes jacobianas para caracterizar la formación de respuestas: el modelo base nunca la forma, la receta IFT produce un salto brusco ("snap") en la capa 12 y DC-SFT produce una transición gradual ("ramp").

## Capacidades

- Generacion de texto e instrucciones: los adaptadores heredan las capacidades del modelo base Llama-3.2-1B-Instruct, segun la libreria PEFT indicada.
- Localizacion de conceptos: la metrica principal del proyecto mide la capacidad del modelo de identificar donde aparece un concepto, con resultados de 51,0-69,1 % frente al 10 % de azar.
- Introspeccion: el ajuste busca que el modelo reporte informacion sobre su propio procesamiento interno.
- Steering de activaciones: el repositorio incluye vectores de direccion por capa para modular el comportamiento mediante activation steering.
- Analisis de formacion de respuestas: las lentes jacobianas permiten trazar si la respuesta se forma de golpe (snap) o progresivamente (ramp).
- Control de deriva: las variantes con anclaje KL preservan el rendimiento del modelo base (MMLU 47,6-48,6 % frente a 49,2 % del base) durante el ajuste.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Investigacion en interpretabilidad mecanica: el repositorio permite reproducir los experimentos de IFT y analizar como se forma la respuesta capa a capa mediante las lentes jacobianas incluidas.
- Estudios de alineacion y deriva: las variantes con anclaje KL (lambda 0,1 a 2,0) permiten medir el coste en rendimiento de preservar el comportamiento del modelo base frente a la ganancia en introspeccion.
- Auditoria de modelos pequenos: Llama-3.2-1B-Instruct es lo bastante pequeno para inspeccionar activaciones completas, de modo que los artefactos sirven para validar tecnicas antes de escalarlas a modelos mayores.
- Control de comportamiento por steering: los conjuntos `llama_1b`, `llama_3b` y `llama_8b` permiten aplicar activation steering para modular conceptos en capas concretas en experimentos controlados.
- Comparacion de metodos de ajuste: el control apareado `paper_ift_control` frente a `dcsft` (mismo codigo y datos) sirve para aislar el efecto de la funcion objetivo en la formacion de respuestas.
- Reproduccion de resultados: el repositorio GitHub asociado contiene el codigo, las metricas por epoca y los write-ups, lo que facilita la replicacion completa del estudio.
- Validacion cruzada de lentes: la lente de Llama-3.1-8B se valido contra la lente publicada, y puede usarse como referencia para comprobar las lentes ajustadas en modelos de 1B.

## Benchmarks y rendimiento

Resultados publicados en el repositorio GitHub, medidos sobre Llama-3.2-1B (la localizacion tiene un valor de azar del 10 %):

| Brazo | Localizacion (%) | MMLU (%) | Formacion de respuesta (lente jacobiana) |
|---|---|---|---|
| Base | 10,0 | 49,2 | nunca se forma |
| Paper IFT | 63,0-67,2 | 23-44 segun configuracion | salto brusco ("snap") en la capa 12 |
| IFT + KL (lambda 2.0) | 69,1 | 47,6 | snap |
| DC-SFT | 51,0 | 46,4 | transicion gradual ("ramp") |
| DC-SFT + KL | 50,3 | 48,6 | ramp |

No se han publicado en la informacion disponible otros benchmarks (HumanEval, GSM8K, MMLU de 5 disparos, etc.) ni comparaciones con modelos externos.

## Requisitos de hardware

- El modelo base Llama-3.2-1B-Instruct cabe en GPU de consumo: en fp16 ocupa aproximadamente 2,5 GB, por lo que es viable en RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores.
- Los adaptadores LoRA (r=16) son de bajo rango y anaden muy poca memoria adicional sobre el modelo base.
- Las lentes jacobianas (.pt) y los conjuntos de vectores de direccion (.tar.gz) son artefactos de analisis, no de inferencia; su carga depende del script, no del pipeline de generacion.
- El repositorio completo ocupa 3,9 GB, segun los metadatos de HuggingFace.
- Opciones de despliegue para el modelo base y los adaptadores: transformers + PEFT (patron mostrado en la model card), y para el base solo tambien vLLM, llama.cpp, Ollama o TGI; la model card solo documenta el uso via transformers y PEFT.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- GPU recomendadas (A100, H100, etc.): no disponible; por tamano, el modelo no requiere GPU de datacenter.

## Comparativa con modelos similares

No se dispone de modelos comparables directos: se trata de un repositorio de artefactos de investigacion sobre introspeccion, no de un modelo publicado con benchmarks frente a alternativas. A continuacion se comparan los brazos internos del propio proyecto, que es la comparacion que el autor reporta.

| Brazo | Localizacion (%) | MMLU (%) | Formacion de respuesta | Anclaje KL |
|---|---|---|---|---|
| Base (sin ajuste) | 10,0 | 49,2 | nunca | no |
| Paper IFT | 63,0-67,2 | 23-44 | snap en capa 12 | no |
| IFT + KL (lambda 2.0) | 69,1 | 47,6 | snap | si |
| DC-SFT | 51,0 | 46,4 | ramp | no |
| DC-SFT + KL | 50,3 | 48,6 | ramp | si |

Comparacion con modelos externos de la misma categoria (interpretabilidad / introspeccion): no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el repositorio contiene adaptadores, lentes y vectores, no un modelo listo para produccion. La model card remite a GitHub para el codigo y los experimentos.
- Degradacion de MMLU: la receta IFT sin anclaje reduce MMLU del 49,2 % del base a un rango de 23-44 % segun configuracion, lo que indica perdida notable de capacidades generales.
- Sin datos de idiomas: la model card y los metadatos no listan idiomas soportados, por lo que no puede confirmarse cobertura multilingue.
- Sin datos de cuantizacion: no se documentan formatos GGUF, AWQ ni otros mas alla de safetensors en los adaptadores.
- Dependencia del modelo base: los adaptadores LoRA requieren descargar meta-llama/Llama-3.2-1B-Instruct por separado y aceptar su licencia; no funcionan de forma autonoma.
- Metrica de localizacion: el 10 % de azar sugiere un diseno experimental controlado, pero la interpretacion de la metrica no se detalla en la informacion disponible.
- Cero adopcion registrada: 0 descargas y 0 likes en HuggingFace, sin evidencia externa de validacion independiente.
- Licencia: los artefactos se distribuyen bajo Llama 3.2 Community License (y Llama 3.1 Community License para los derivados del 8B), con las restricciones de uso comercial y de atribucion que esas licencias imponen.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el foco del proyecto es la introspeccion, no la fiabilidad factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nmeyer19/introspection-fine-tuning
- Repositorio GitHub del proyecto: https://github.com/nmeyer19/introspection-fine-tuning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
