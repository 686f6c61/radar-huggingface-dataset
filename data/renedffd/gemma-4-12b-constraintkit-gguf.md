# Renedffd/gemma-4-12b-constraintkit-GGUF

## Resumen
gemma-4-12b-constraintkit es un ajuste fino (fine-tune) del modelo google/gemma-4-12B-it, desarrollado por el usuario Renedffd, orientado a la generación de geometría CAD paramétrica a partir de instrucciones en lenguaje natural. El modelo no genera mallas directamente: escribe un pequeño programa declarativo compuesto por piezas, parámetros y uniones (mates) que el sistema open source constraint-kit compila a sólidos B-rep exactos y exporta a STEP. De este modo, la parte "creativa" la decide el modelo y la parte geométrica la resuelve un kernel determinista, lo que permite verificar cada construcción contra geometría real.

El modelo tiene 11.907.350.576 parámetros (unos 12B) y se distribuye como GGUF cuantizado Q6_K de 9,8 GB para llama.cpp, además de un adaptador LoRA PEFT de rango 16 de 251 MB. Está entrenado en inglés y su pipeline declarado en Hugging Face es text-to-3d. Su rasgo diferencial es la política de rechazo honesto: cuando la petición queda fuera del alcance de constraint-kit (por ejemplo, un engranaje cónico helicoidal), el modelo responde con un mensaje de "unsupported" indicando qué variante falta, en lugar de entregar una pieza incorrecta.

Resulta relevante porque demuestra que un modelo local de 12B, entrenado con SFT más GRPO y con el verificador CAD como recompensa (sin reward model ni juez LLM), puede acercarse en verificabilidad geométrica a un modelo frontera con prompting, y superarlo claramente en honestidad ante peticiones nuevas. El coste total de entrenamiento declarado es de unos 35 dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base google/gemma-4-12B-it); no se detalla en la información disponible |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de llama-server con `-c 8192`); no se confirma el máximo del modelo base |
| Tipos de cuantización | Q6_K (GGUF); adaptador LoRA en safetensors (r=16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K) y safetensors (LoRA PEFT) |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de unos 12B parámetros. El ajuste se realiza en dos etapas: primero SFT (supervised fine-tuning) y después GRPO (Group Relative Policy Optimization) con LoRA de rango 16 sobre la variante unsloth/gemma-4-12b-it. El modelo escribe una traza de razonamiento (thinking trace) antes de cada programa, activada mediante el token de modo `<|think|>` en el turno de sistema, y la generación termina en `<turn|>`.

La innovación técnica principal es el uso del verificador CAD de constraint-kit como función de recompensa en GRPO: no hay reward model ni juez LLM, sino que la recompensa depende de si el programa compila y construye correctamente y de lo cerca que queda su firma geométrica del objetivo. Según la model card, esta etapa redujo las construcciones silenciosas de variante incorrecta de 2/10 a 1/10 y elevó los rechazos correctos a 9/10, sin regresión en construcciones (6/6 retenidas). El entrenamiento completo (SFT + GRPO) costó aproximadamente 35 dólares. El modelo se entrenó con un system prompt exacto (`train_sys.txt`) y no fue entrenado con ningún otro, por lo que es obligatorio usar ese prompt en inferencia.

## Capacidades
- Generación de programas CAD declarativos (piezas, parámetros y mates) a partir de inglés plano, para su compilación por constraint-kit a sólidos B-rep y exportación a STEP/GLB.
- Razonamiento previo explícito: emite una traza de pensamiento antes de cada programa, visible para el usuario.
- Rechazo honesto: identifica peticiones fuera de alcance y especifica qué variante no está modelada (por ejemplo, engranajes cónicos helicoidales frente a rectos).
- Modelado paramétrico de componentes mecánicos: espaciadores, engranajes rectos y helicoidales, poleas con brida, rodamientos, varillas roscadas, motores paso a paso NEMA, extrusiones V-slot, uniones tipo four-bar linkage.
- Resolución de ensamblajes con mates deterministas y cálculo de distancia entre centros de engranajes (m·(z₁+z₂)/2).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el flujo descrito es de una sola generación por petición.
- Capacidades multilingües: solo inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Diseño mecánico asistido por lenguaje natural: un ingeniero describe un ensamblaje ("un bloque de cojinete atornillado a una extrusión V-slot de 100 mm con dos tornillos M5") y el modelo genera el programa de piezas y mates que constraint-kit compila a STEP listo para CAD.
- Generación de utillaje y piezas de taller: espaciadores, poleas, rodamientos y varillas roscadas con parámetros exactos, aptos para impresión 3D o mecanizado, con exportación de lista de materiales (BOM) y masa.
- Automatización de bibliotecas de componentes: integración en un pipeline que recibe peticiones de piezas recurrentes y produce geometría verificable, reduciendo el trabajo manual de modelado repetitivo.
- Validación temprana de viabilidad de diseño: el modelo declina explícitamente las peticiones que constraint-kit no puede modelar, lo que evita que un ingeniero reciba una pieza incorrecta y permite redirigir el diseño antes de fabricar.
- Docencia y prototipado de mecanismos: construcción de trenes de engranajes, four-bar linkages y ensamblajes con relaciones geométricas exactas para prácticas de cinemática.
- Despliegue local en estaciones de trabajo de ingeniería: el GGUF Q6_K de 9,8 GB corre en llama.cpp sin depender de servicios en la nube, útil en entornos con requisitos de confidencialidad de diseño.
- Investigación en verificación de LLM: el modelo sirve como banco de pruebas para estudiar recompensas basadas en verificadores deterministas (GRPO con verificador CAD) frente a reward models y jueces LLM.

## Benchmarks y rendimiento
Los datos publicados en la model card son métricas propias del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Métrica | Resultado |
|---|---|
| Construcciones verificadas contra geometría real (etapa SFT, held-out) | 93% |
| Rechazos honestos en peticiones fuera de alcance (etapa SFT) | 87% |
| Rechazos honestos (etapa GRPO) | 9/10 |
| Construcciones honestas frente a modelo frontera con prompting, peticiones nuevas | 57% vs 16% |
| Construcciones silenciosas con variante incorrecta (antes/después de GRPO) | 2/10 → 1/10 |
| Construcciones retenidas tras GRPO | 6/6 |
| Coste total de entrenamiento (SFT + GRPO) | ~35 USD |

Criterio de verificación: una construcción cuenta solo si el volumen y la caja envolvente de la pieza quedan dentro del 2% del objetivo held-out. El modelo frontera con prompting se sitúa en el rango 90–97% en la misma prueba.

## Requisitos de hardware
- VRAM estimada para inferencia: el GGUF Q6_K ocupa 9,8 GB, por lo que se necesitan aproximadamente 10–12 GB de VRAM para cargar el modelo completo en GPU con contexto de 8192 tokens.
- GPU recomendadas: A100, H100 y RTX 4090 (24 GB) para carga completa; V100 (Volta) es compatible pero requiere `-fa off -ub 1024` porque flash-attn automático resulta muy lento en prefill en esa arquitectura.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 8 GB habría que recurrir a cuantizaciones menores no publicadas en el repo.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando indicado en la model card: `llama-server -m gemma4-12b-constraintkit-grpo-Q6_K.gguf -c 8192 -ngl 99 --port 8086`). El adaptador LoRA requiere PEFT sobre unsloth/gemma-4-12b-it. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La model card solo advierte del prefill lento en GPUs Volta con flash-attn automático.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12b-constraintkit | 11,9B | 8192 (uso indicado) | Text-to-CAD paramétrico con rechazo honesto | Apache 2.0 | GGUF Q6_K y LoRA en Hugging Face |
| google/gemma-4-12B-it (base) | ~12B | no disponible | Modelo generalista de instrucciones | no disponible en la información | Hugging Face |
| Modelo frontera con prompting (sin identificar en la model card) | no disponible | no disponible | Text-to-CAD vía prompting | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de otros fine-tunes text-to-CAD comparables en la información proporcionada.

## Limitaciones y advertencias
- Solo inglés: el modelo fue entrenado exclusivamente en inglés y no se documentan capacidades en castellano ni en otros idiomas.
- Dependencia estricta del system prompt: fue entrenado únicamente con `train_sys.txt`; usar otro prompt degrada el comportamiento. Además, la inferencia debe hacerse con la serialización exacta de entrenamiento (token `<|think|>` al inicio del turno de sistema, parada en `<turn|>`).
- Alcance geométrico limitado a lo que constraint-kit modela: por ejemplo, solo engranajes cónicos rectos, no helicoidales. El modelo lo declara, pero el catálogo de piezas disponibles es finito.
- Riesgo de variante incorrecta silenciosa: aunque GRPO lo redujo a 1/10, sigue existiendo; conviene verificar la geometría exportada antes de fabricar.
- Riesgo de alucinación en parámetros: el modelo puede producir valores numéricos plausibles pero no solicitados; la verificación contra volumen y caja envolvente mitiga el problema, pero no lo elimina.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-12B-it puede tener sus propias condiciones que conviene revisar.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad sobre las métricas declaradas.
- Las imágenes de ejemplo de la model card fueron generadas por el planificador alojado por defecto de constraint-kit (DeepSeek), no por este modelo, según aclara el propio autor.

## Enlaces
- Hugging Face: https://huggingface.co/Renedffd/gemma-4-12b-constraintkit-GGUF
- Repositorio constraint-kit: https://github.com/jajmangold/constraint-kit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante base usada para el LoRA: https://huggingface.co/unsloth/gemma-4-12b-it
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
