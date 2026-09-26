# nuofang/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-GGUF

## Resumen

Este repositorio es una cuantización en formato GGUF del modelo Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated, publicada por el usuario nuofang. El modelo subyacente es una destilación de la familia MiMo-V2.6 de Xiaomi MiMo sobre Qwen3.5-9B, orientada a tareas agénticas: ingeniería de software, uso de herramientas, codificación visual y ciberseguridad. La variante «Ablitrated» del nombre indica que se trata de una versión derivada, presumiblemente con las direcciones de rechazo atenuadas o eliminadas, aunque el procedimiento no se documenta en la información disponible.

El interés práctico de este repositorio concreto es que permite ejecutar un modelo agéntico de ~9.000 millones de parámetros en hardware de consumo mediante llama.cpp y sus derivados, sin depender de servicios en la nube. El autor aplicó una matriz de importancia (imatrix) cuyo corpus de calibración está orientado a novela y roleplay en chino, manteniendo lógica y sentido común según se indica en la model card, y señala que ese calibrado solo es efectivo para Q5_K_M y cuantizaciones inferiores.

Se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados más allá de una medición de perplejidad sobre el propio dataset de calibración. Cualquier evaluación de calidad debe por tanto hacerse de forma empírica por parte de quien lo despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el modelo base es Qwen3.5-9B (se asume transformer decoder-only, no confirmado en las fuentes consultadas) |
| Parametros totales | ~9.000 millones según la denominación del modelo (Qwen-9B). El campo de parametros del repo indica 1.278.200, dato inconsistente con un modelo de 9B |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF generadas con llama.cpp e imatrix. El autor menciona Q5_K_M y niveles inferiores como beneficiarios del calibrado; el listado exacto de niveles publicados no esta detallado |
| Idiomas soportados | No disponible (los datos de calibracion del imatrix estan orientados a novela y roleplay en chino) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repositorio de 7,4 GB) |
| Modelo base | Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated |
| Modelo raiz | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (SFT sobre Qwen3.5-9B) |
| Fecha de publicacion | 2026-09-25 (ultima actualizacion 2026-09-25) |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna en las fuentes disponibles. Lo que sí se conoce es la cadena de derivación: Xiaomi MiMo partió de Qwen3.5-9B y aplicó un ajuste supervisado (SFT) sobre datos generados por la familia MiMo-V2.6 de mayor tamaño, cubriendo cuatro dominios principales (ingeniería de software, tareas agénticas generales, codificación visual y ciberseguridad). Los resultados de la búsqueda web indican explícitamente que el checkpoint se publica como punto de partida para investigación abierta en aprendizaje por refuerzo agéntico, es decir, es un modelo de SFT y no un modelo ya sometido a RL a gran escala.

Sobre este modelo se aplicó después una variante «Ablitrated» (ortografía del propio repositorio) y, finalmente, una cuantización GGUF con matriz de importancia. El corpus de calibración del imatrix se compone de novelas y material de roleplay en chino, con el objetivo declarado de preservar lógica y conocimiento común. Según la model card, este calibrado solo surte efecto en Q5_K_M y niveles inferiores. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de DPO o RLHF en la cadena.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B tras el SFT.
- Generación de código y tareas de ingeniería de software, uno de los cuatro dominios objetivo declarados por Xiaomi MiMo.
- Tareas agénticas generales: ejecución de flujos multietapa con planificación intermedia.
- Uso de herramientas (tool calling / function calling), implícito en la orientación agéntica del modelo.
- Codificación visual, según la descripción del modelo raíz en ModelScope y Vast.ai.
- Ciberseguridad, cuarto dominio objetivo declarado.
- Escritura creativa y roleplay, favorecidos por el corpus de calibración del imatrix (novela y RP en chino).
- Capacidad multilingüe: no disponible. La evidencia disponible apunta a un sesgo fuerte hacia el chino en el calibrado de cuantización, pero no hay declaración oficial de idiomas.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.

## Casos de uso

- Asistente de programación en local: con ~9.000 millones de parámetros y pesos GGUF, se puede ejecutar en una estación de trabajo con GPU de consumo y usarlo para autocompletado, refactorización y generación de tests dentro de un IDE, sin enviar código a terceros.
- Agente de automatización de tareas de desarrollo: su orientación agéntica y el soporte de tool calling permiten encadenar llamadas a APIs, ejecución de comandos y consultas a repositorios en pipelines de CI/CD.
- Roleplay y narrativa interactiva: el calibrado imatrix está específicamente orientado a novela y RP en chino, por lo que es un candidato razonable para motores de ficción interactiva y personajes persistentes en ese idioma.
- Generación de texto creativo en chino: al estar el corpus de calibración centrado en narrativa china, la degradación por cuantización en estilo y coherencia narrativa debería ser menor en Q5_K_M o inferior.
- Auditoría y asistencia en ciberseguridad: análisis de código, revisión de configuraciones y apoyo en tareas de reconocimiento dentro de un entorno controlado, aprovechando el dominio declarado del modelo raíz.
- Investigación académica en RL agéntico: al ser un checkpoint de SFT publicado como punto de partida, sirve como modelo base para experimentos de aprendizaje por refuerzo sobre tareas de herramientas y código.
- Prototipado de bajo coste en local: con 7,4 GB de repositorio, permite validar ideas sobre modelos agénticos sin coste de API ni infraestructura cloud.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp, es apto para procesar datos sensibles que no pueden salir de la organización.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la perplejidad medida sobre el propio dataset de calibración:

| Metrica | Precision base (F16/BF16) | Q5_K_M |
|---|---|---|
| Perplejidad (dataset de calibracion) | 20,8797 ± 0,17477 | 16,6609 ± 0,13455 |

El propio autor advierte de que una perplejidad menor tras la cuantización no implica una mejora real: puede deberse a diferencias en cómo las herramientas de cuantización y de cálculo de perplejidad de llama.cpp tratan los tokens especiales.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni para este repositorio ni, en las fuentes consultadas, para el modelo raíz.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir del tamaño del repositorio y del recuento de parámetros, no publicados por el autor):
  - Q4_K_M: ~5,5-6 GB.
  - Q5_K_M: ~6,5-7 GB (nivel explícitamente mencionado por el autor).
  - Q6_K: ~7,5-8 GB.
  - Q8_0: ~9,5-10 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti / 4080, RTX 4090, y GPUs profesionales A100/H100 si se despliega en servidor. Con 8 GB de VRAM se puede operar en Q4_K_M o Q5_K_M con contexto corto y descarga parcial a CPU.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más para cuantizaciones Q4/Q5, y en 12 GB con margen para contexto amplio en Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui. Al ser formato GGUF, es el ecosistema llama.cpp el soportado de forma nativa.
- Latencia y throughput estimados: no disponibles. Dependen del nivel de cuantización, de la GPU y de si parte de las capas se descargan a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuofang/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-GGUF | ~9B | No disponible | Agéntico, cuantizado GGUF, variante abliterated | No disponible | HuggingFace (0 descargas) |
| Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated | ~9B | No disponible | Agéntico, variante abliterated sin cuantizar | No disponible | HuggingFace |
| ggml-org/MiMo-V2.6-Distill-Qwen-9B-GGUF | ~9B | No disponible | Agéntico, cuantización GGUF del modelo original sin abliterar | No disponible | HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B | No disponible | Agéntico, checkpoint de SFT sobre Qwen3.5-9B | No disponible en las fuentes consultadas | ModelScope, HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a un modelo de ~9B sin datos publicados de evaluación; no hay benchmarks que permitan acotar su fiabilidad en tareas críticas.
- Ausencia de licencia declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo raíz antes de cualquier despliegue productivo.
- Variante «Ablitrated»: este tipo de modificaciones suele implicar la eliminación de direcciones de rechazo del modelo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin filtros. No se documenta el procedimiento aplicado ni sus efectos colaterales sobre capacidades generales.
- Sesgo lingüístico probable hacia el chino: el corpus de calibración del imatrix se compone de novela y roleplay en chino, y no hay declaración oficial de idiomas soportados. El rendimiento en castellano u otras lenguas no está verificado.
- Longitud de contexto desconocida: no se publica la ventana de contexto, dato esencial para planificar aplicaciones conversacionales o de código con archivos largos.
- Metadatos inconsistentes: el recuento de parámetros del repo (1.278.200) no concuerda con un modelo de 9B, lo que sugiere un problema de indexación de la plataforma o del propio repositorio.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin garantía de mantenimiento ni de soporte por parte del autor.
- La mejora de perplejidad reportada en Q5_K_M frente a la precisión base debe interpretarse con cautela, tal y como advierte el propio autor.
- No hay información sobre cuantizaciones disponibles más allá de la referencia a Q5_K_M y niveles inferiores; conviene listar el repositorio antes de planificar el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nuofang/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-GGUF
- Modelo base: https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated
- Modelo raíz en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Cuantización GGUF del modelo original: https://huggingface.co/ggml-org/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Ficha en interfaze.ai: https://interfaze.ai/models/xiaomimimomimo-v26-distill-qwen-9b
- Ficha en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mimo-v2.6-distill-qwen-9b-xiaomimimo
