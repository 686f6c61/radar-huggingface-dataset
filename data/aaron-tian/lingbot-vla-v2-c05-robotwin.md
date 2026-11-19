# Aaron-Tian/lingbot-vla-v2-c05-robotwin

## Resumen

LingBot-VLA V2 C05 (RoboTwin) es un checkpoint de visión-lenguaje-acción (VLA) publicado por el usuario Aaron-Tian (colaborador tianws) en Hugging Face, derivado por ajuste fino del modelo base robbyant/lingbot-vla-v2-6b. Está especializado en manipulación robótica bimanual sobre el benchmark RoboTwin, con perfil de robot `aloha_agilex` y espacio de acciones `joint`. El repositorio contiene seis fragmentos en FP32, código de inferencia nativo, normalizador, tokenizador, código de referencia del algoritmo y un informe técnico; no incluye entrenamiento final sobre robot real.

El modelo resuelve el problema de traducir tres vistas RGB, el estado articular de dos brazos con sus pinzas y una instrucción en lenguaje natural en una secuencia de acciones motoras. Su relevancia es acotada: es un artefacto de competición con resultados autoinformados y archivados (81,24 % en escenas limpias, 59,62 % en aleatorizadas, 70,43 % de media sobre 10.000 episodios), que el propio autor advierte que no deben interpretarse como aceptación en la tabla de clasificación actual.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de ruta fija, con un total de 6B parámetros según el nombre del modelo base, aunque la model card no detalla la distribución de parámetros activos. El checkpoint se distribuye como un bundle de 25,5 GB pensado para cargarse mediante el adaptador `LingBot_VLA_V2_C05` de XPolicyLab, no mediante un cargador genérico de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de ruta fija; visión-lenguaje-acción (VLA) |
| Parametros totales | 6B (según el identificador del modelo base `lingbot-vla-v2-6b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el release se distribuye en FP32 |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (seis fragmentos FP32) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre el base `robbyant/lingbot-vla-v2-6b`, con un backbone de transformer que incorpora una capa MoE de ruta fija, visión en modo eager y embeddings de texto calculados en CPU durante la precarga FP32 exacta. La invocación nativa procesa tres vistas RGB, objetivos articulares de doble brazo con pinzas y una instrucción, y genera acciones con un horizonte nativo de 50 pasos y diez pasos de denoising; en ejecución se aplican 32 acciones en escenarios limpios o 20 en aleatorizados.

El entrenamiento se realizó sobre 2.500 demostraciones oficiales limpias/vistas, con 548.893 fotogramas y 50 tareas, siguiendo la linaje oficial base → C01@12000 → C02@2500 → C05@5000. Cada etapa usó batch global de 504 con 56 GPUs y micro-batch de 9. Se conservaron los profesores nativos de profundidad y vídeo y el objetivo de entrenamiento completo. El repositorio incluye extractos de la receta, una tabla de muestreo fija, el pool de instrucciones vistas y la implementación de aumento visual, pero el autor indica explícitamente que no es un lanzador de entrenamiento portable completo y que la integración con XPolicyLab es solo para evaluación.

## Capacidades

- Generación de acciones motoras bimanuales a partir de observación visual y una instrucción en lenguaje natural.
- Procesamiento de tres vistas RGB simultáneas como entrada perceptiva.
- Control de doble brazo con objetivos articulares (`joint`) y pinzas, perfil `aloha_agilex`.
- Decodificación de acciones con horizonte nativo de 50 y diez pasos de denoising.
- Ejecución de 32 acciones por invocación en escenarios limpios y 20 en aleatorizados.
- Soporte de instrucciones en lenguaje natural para condicionar la tarea (pool de instrucciones vistas incluido).
- Inferencia con precisión FP32 exacta, visión eager y MoE de ruta fija.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de referencia en RoboTwin: el checkpoint sirve para reproducir el protocolo del benchmark con el adaptador XPolicyLab, cargando el bundle como `ckpt_name` y comparando resultados bajo el protocolo oficial actual.
- Investigación en manipulación bimanual: permite estudiar políticas VLA sobre el perfil `aloha_agilex` con acciones articulares, usando las tres vistas RGB y las instrucciones del pool incluido.
- Análisis de robustez ante aleatorización: la distinción entre ejecución de 32 acciones (limpio) y 20 (aleatorizado) facilita experimentos controlados sobre sensibilidad al dominio visual.
- Desarrollo de adaptadores de inferencia: el código nativo, el normalizador y el tokenizador incluidos sirven como referencia para integrar el modelo en XPolicyLab u otros entornos de evaluación.
- Auditoría de reproducibilidad: el manifiesto de release y el hash agregado SHA256 permiten verificar la integridad de los seis fragmentos y del resto de archivos distribuidos.
- Estudio de linaje de ajuste fino: la secuencia C01@12000 → C02@2500 → C05@5000 documentada permite analizar el efecto del entrenamiento por etapas sobre el rendimiento en tareas limpias frente a aleatorizadas.
- Validación de contratos de transporte: `interface_test.json` registra dos ejecuciones de depuración con pesos reales (RGB plano y RGB codificado decodificado en servidor) útiles para comprobar formas y valores finitos antes de lanzar evaluaciones completas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Escenas limpias (clean) | 81,24 % |
| Escenas aleatorizadas (randomized) | 59,62 % |
| Media | 70,43 % |
| Episodios evaluados | 10.000 |

Estos datos proceden de una autoevaluación histórica archivada. El autor advierte que los protocolos de acumulación de fronteras de escena, selección de experto y prompts diferían de los actuales, y que no constituyen aceptación en la tabla de clasificación vigente. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- GPU de al menos 48 GB para la precarga FP32 exacta, según indica la model card.
- RAM de host suficiente para cargar los pesos FP32 completos (repositorio de 25,5 GB).
- GPU recomendadas: no se especifican modelos concretos; por capacidad de memoria encajan A100 80 GB, H100 80 GB o GPUs profesionales con 48 GB o más.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB) en FP32 sin cuantización, y no se documentan opciones de cuantización.
- Despliegue: adaptador `LingBot_VLA_V2_C05` de XPolicyLab; no debe alimentarse la raíz del bundle a un cargador genérico de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VLA V2 C05 (RoboTwin) | 6B | no disponible | 81,24 % limpio / 59,62 % aleatorizado (histórico) | Apache 2.0 | Hugging Face |
| robbyant/lingbot-vla-v2-6b (base) | 6B | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Otras alternativas VLA para RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados publicados son autoevaluaciones históricas con protocolos distintos al oficial actual; no deben citarse como rendimiento vigente en la tabla de clasificación.
- El checkpoint está especializado en el perfil `aloha_agilex` con acciones `joint`; no se garantiza su funcionamiento en otras morfologías o espacios de acción.
- El autor confirma que no se incluyó entrenamiento final sobre robot real, por lo que la transferencia a hardware físico no está validada.
- La integración con XPolicyLab es solo para evaluación; la portabilidad del entrenamiento requiere validación adicional de dataset, profesores y reanudación distribuida.
- Las pruebas de interfaz con entradas sintéticas verifican transporte y contratos de forma/valores finitos, pero no demuestran éxito en tareas.
- Requiere al menos 48 GB de VRAM y precarga FP32, lo que limita el despliegue en entornos de consumo.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática; al ser un modelo de política robótica, el riesgo principal es la ejecución de acciones incorrectas ante distribuciones visuales no vistas.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de autoría originales de código, modelo y tokenizador.

## Enlaces

- [Hugging Face: Aaron-Tian/lingbot-vla-v2-c05-robotwin](https://huggingface.co/Aaron-Tian/lingbot-vla-v2-c05-robotwin)
- [Modelo base: robbyant/lingbot-vla-v2-6b](https://huggingface.co/robbyant/lingbot-vla-v2-6b)
- [Perfil del colaborador tianws en GitHub](https://github.com/tianws)
- Archivos incluidos en el repositorio: `TECHNICAL_REPORT.txt`, `historical_results.json`, `UPSTREAM_MODEL_CARD.md`, `interface_test.json`, `release_manifest.json`, directorio `training_reference/`
