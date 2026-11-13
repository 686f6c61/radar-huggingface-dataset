# bambocher/MiMo-V2.6-Distill-Qwen-9B

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo de lenguaje de 9.400 millones de parametros desarrollado por el equipo Xiaomi MiMo. Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen3.5-9B sobre datos generados por el propio equipo MiMo, orientado especificamente a tareas agenticas: generacion de codigo, uso de herramientas, tareas generales de automatizacion, codigo visual y ciberseguridad. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso con soporte multimodal de tipo image-text-to-text.

El modelo se publica como punto de partida para investigacion abierta en aprendizaje por refuerzo agentico. Su interes radica en que demuestra que un ajuste fino SFT bien disenado sobre un modelo de 9B puede mejorar de forma sustancial el rendimiento en benchmarks agenticos respecto al modelo base, especialmente en tareas de codigo de larga duracion, automatizacion de terminal y uso de herramientas. La licencia MIT facilita su adopcion comercial, aunque la model card incluye restricciones de uso adicionales.

El checkpoint incluye tokenizer propio, plantilla de chat MiMo v2.6 y soporte de modo de razonamiento explicito (thinking mode). El repositorio ocupa 22,6 GB en safetensors y esta pensado para desplegarse con SGLang con soporte de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9.400 millones de parametros con capacidad multimodal de entrada imagen-texto. Sobre esa base se aplico un ajuste fino supervisado con una mezcla ponderada de datos generados por MiMo que suma 77.400 millones de tokens totales, de los cuales 27.200 millones son tokens con perdida (loss-bearing). La composicion del dataset se reparte en cuatro dominios: codigo (23.200 millones de tokens, 29,9 % del total), ciberseguridad (11.000 millones, 14,2 %), tareas generales (22.000 millones, 28,5 %) y visual (21.200 millones, 27,4 %).

El checkpoint incorpora una cabeza MTP (multi-token prediction) heredada del modelo base Qwen3.5-9B, lo que permite decodificacion especulativa y potencialmente mejora el throughput en inferencia. La model card no documenta el uso de RLHF ni DPO en esta version; se trata exclusivamente de un checkpoint SFT publicado como base para trabajo posterior de RL agentico. La plantilla de chat es la MiMo v2.6 y el modelo soporta activacion explicita del modo de razonamiento mediante `enable_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito (thinking mode) activable por plantilla de chat.
- Generacion y edicion de codigo, incluyendo tareas de resolucion de issues en repositorios reales (SWE-style).
- Uso de herramientas y function calling en entornos agenticos.
- Razonamiento multi-paso y ejecucion de tareas de automatizacion en terminal.
- Capacidades de codigo visual (interpretacion de interfaces y generacion de codigo a partir de imagenes).
- Tareas de ciberseguridad (analisis y resolucion de retos tipo CTF, segun el benchmark interno MiMo Cyber).
- Procesamiento multimodal de entrada imagen-texto (pipeline image-text-to-text).
- Capacidades multilingues: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir un issue y el contexto del repositorio para generar un parche, con un rendimiento de 61,1 en SWE Verified (avg@3), adecuado para integrarse en pipelines de CI/CD con revision humana.
- Agentes de terminal y automatizacion de sistemas: con 37,1 en Terminal Bench 2.1, puede ejecutar secuencias de comandos y tareas de administracion en entornos controlados.
- Orquestacion de herramientas en flujos de trabajo: su puntuacion de 35,2 en Toolathlon-Verified lo hace util para agentes que encadenan APIs y servicios externos.
- Automatizacion de tareas de oficina y ofimatica: 19,5 en OfficeQA permite su uso en asistentes que consultan y manipulan documentos estructurados.
- Evaluacion y formacion en ciberseguridad: 31,3 en MiMo Cyber (mini) lo hace apropiado para entornos de entrenamiento, CTF y analisis defensivo, siempre con supervision.
- Generacion de codigo a partir de capturas de interfaz: 64,0 en MiMo Visual Coding (mini) habilita prototipado rapido de UI a partir de imagenes.
- Base para investigacion en RL agentico: al ser un checkpoint SFT con licencia MIT, sirve como punto de partida para experimentos de refuerzo sobre tareas de agente.
- Asistentes de automatizacion de flujos empresariales: 18,3 en JobBench y 30,3 en AutomationBench v1.0.6 permiten su uso en orquestacion de tareas repetitivas con validacion humana.

## Benchmarks y rendimiento

Resultados reportados en el informe tecnico de MiMo-V2.6 para el checkpoint SFT, comparados con el modelo base Qwen3.5-9B:

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60,0 | 61,1 |
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| Codigo | MiMo Code (mini)† | avg@3 | 19,5 | 51,6 |
| Ciberseguridad | MiMo Cyber (mini)† | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini)† | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini)† | avg@1 | 61,7 | 64,0 |

† Conjuntos de evaluacion internos. No se han publicado resultados de benchmarks estandar adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos (9.400 millones de parametros), mas overhead de KV cache y activaciones; en la practica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- Cuantizacion a 8 bits: alrededor de 9,4 GB de pesos, viable en GPUs consumer de 16 GB con contexto limitado.
- Cuantizacion a 4 bits: alrededor de 4,7 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque no se documentan variantes GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para produccion; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Despliegue: la model card indica SGLang con soporte de Qwen3.5 y parser de razonamiento `mimo`. No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La presencia de cabeza MTP sugiere soporte de decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B | 9,4 B | no disponible | Agentico, codigo, multimodal | MIT | Hugging Face |
| Qwen3.5-9B (base) | 9,4 B | no disponible | Generalista, multimodal | no disponible en la informacion | Hugging Face |
| Alternativas de 7-9 B agenticas | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar de forma directa con el modelo base Qwen3.5-9B, sobre el que MiMo-V2.6 mejora de forma consistente en todos los benchmarks reportados. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Es un checkpoint SFT, no un modelo final entrenado con RL; su rendimiento en produccion puede ser inferior al de versiones posteriores del mismo linaje.
- Riesgo de alucinacion inherente a modelos de 9B, especialmente en tareas de codigo y ciberseguridad donde la verificacion es critica.
- Los benchmarks marcados como internos (†) no son comparables directamente con evaluaciones publicas estandar.
- No se documentan idiomas soportados; el rendimiento fuera del ingles es incierto.
- La longitud de contexto no esta especificada, lo que dificulta planificar despliegues con ventanas largas.
- La licencia es MIT, pero la model card incluye restricciones de uso (prohibicion de uso militar, actividades maliciosas, acceso no autorizado a sistemas, tratamiento de datos personales sin base legal y ejecucion autonoma de acciones de alto riesgo sin supervision humana). Estas restricciones se presentan como aviso informativo y no modifican la licencia, pero deben tenerse en cuenta en despliegues comerciales.
- El uso en ciberseguridad requiere supervision humana y marcos de autorizacion claros; el modelo no debe operar de forma autonoma en entornos de produccion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad adicionales.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de referencia MiMo-V2.6-Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Documentacion de SGLang: https://docs.sglang.io/get_started/install.html
- Sitio oficial de MiMo: https://mimo.xiaomi.com
- Contacto legal: mimo-legal@xiaomi.com
