# jxtse/ReTRACE-27B-latest

## Resumen

ReTRACE-27B-latest es un adaptador LoRA de tipo *rolling release* publicado por el usuario jxtse sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (aproximadamente 0,1 GB en el repositorio) que especializa al modelo base para planificación retrosintética mediante un arnés de agentes con *tool calling*. El adaptador se actualiza por versiones etiquetadas con tags de git: la rama `main` apunta siempre a la última iteración, actualmente `s3-v1`.

El modelo aborda un problema concreto de química computacional: proponer rutas de retrosíntesis (secuencias inversas de reacciones que llevan de productos comerciales a un compuesto objetivo) dentro de un bucle agéntico, donde el modelo debe invocar herramientas y razonar en varios pasos. Su relevancia radica en que aplica un pipeline de entrenamiento por fases —SFT con juicio químico, SFT agéntico sobre trayectorias de un profesor y entrenamiento tipo RFT sobre rollouts propios filtrados por auditoría de ruta— sobre un modelo de 27B de parámetros, un tamaño manejable para despliegues con LoRA servido en vLLM.

La información pública es escasa: el repositorio no declara pipeline, idiomas ni detalles de arquitectura más allá del modelo base, y la evaluación se limita a 40 objetivos con auditoría por LLM-juez, no por expertos. Cualquier uso en producción debe tratarse como experimental y con validación humana obligatoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; r=8, alpha=16, dropout 0.05, aplicado a proyecciones de atención, atención lineal y MLP del modelo de lenguaje |
| Parámetros totales | No disponible (adaptador de ~0,1 GB; el modelo base Qwen3.8-27B no detalla sus parámetros en la información disponible) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; el modelo base podría cuantizarse, pero no se especifica |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.8-27B, un transformer del que la información proporcionada no detalla capas, atención ni ventana de contexto. El LoRA tiene rango 8, alpha 16 y dropout 0.05, e inyecta matrices de bajo rango en las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, dejando intactos el resto de pesos y, presumiblemente, las cabezas no lingüísticas del base.

El entrenamiento sigue una linaje de tres etapas documentado en la model card. La etapa S1 v2 consiste en SFT de juicio químico con 819 filas. La etapa S2 v2 es SFT agéntico sobre 167 trayectorias generadas por un profesor, con razonamiento de nivel medio. La etapa S3 aplica un entrenamiento tipo rejection fine-tuning (RFT) sobre los propios rollouts del estudiante dentro del arnés ReTRACE, seleccionados mediante auditoría de ruta, con solo 7 pasos de optimizador. No se documentan datos de preferencias (RLHF/DPO) ni el volumen total de tokens de entrenamiento. La innovación principal no es arquitectónica sino de proceso: el filtrado de rollouts por auditoría de ruta química para construir el conjunto de la etapa S3.

## Capacidades

- Planificación retrosintética multi-paso dentro de un arnés agéntico con invocación de herramientas (*tool calling*).
- Razonamiento de nivel medio (*medium reasoning*), según la configuración de entrenamiento S2 v2.
- Generación de rutas sintéticas candidatas y justificación de pasos de reacción.
- Auditoría interna de rutas como parte del pipeline de entrenamiento (selección por *route audit*).
- Capacidades heredadas del modelo base Qwen3.8-27B, no documentadas en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo *thinking* explícito.

## Casos de uso

- Planificación retrosintética asistida en descubrimiento de fármacos: el adaptador propone rutas desde productos comerciales hasta un compuesto objetivo dentro del arnés ReTRACE, con cada paso revisado por un químico antes de pasar al laboratorio.
- Priorización de compuestos en química médica: dado un conjunto de candidatos, el modelo genera rutas candidatas para estimar viabilidad sintética temprana y descartar estructuras difíciles de fabricar.
- Automatización de informes de viabilidad sintética: integrado en un pipeline que recibe SMILES o identificadores y devuelve rutas estructuradas que el equipo de proceso revisa y anota.
- Entrenamiento y evaluación de agentes químicos: sirve como estudiante en bucles RFT o como referencia para comparar arneses de retrosíntesis con auditoría automática.
- Prototipado de asistentes de laboratorio con tool calling: el adaptador puede conectarse a herramientas de búsqueda de reacciones o bases de datos químicas y orquestar consultas encadenadas.
- Investigación metodológica en PEFT: al ser un adaptador pequeño y versionado por tags, es útil para estudiar el efecto de etapas SFT/RFT cortas sobre un base de 27B.
- Docencia y formación: generar rutas de ejemplo para discutir estrategias retrosintéticas, siempre con verificación posterior por el instructor.

## Benchmarks y rendimiento

Evaluación sobre test40 (40 objetivos), razonamiento medio, arnés ReTRACE y auditoría por LLM-juez (no verdad de referencia experta):

| Modelo | Éxito nativo | Audit@1 estricto | Audit@1 laxo |
|---|---:|---:|---:|
| Qwen3.8-27B base | 35/40 | 4/40 | 11/40 |
| ReTRACE-27B s3-v1 | 40/40 | 4/40 | 19/40 |

El propio autor advierte que el conjunto de prueba es pequeño (40 objetivos) y que la diferencia en la métrica laxa no es estadísticamente significativa (McNemar exacto, p=0,077). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa ~0,1 GB; el requisito real lo marca el modelo base Qwen3.8-27B, cuyos pesos en precisión completa no se detallan en la información disponible.
- VRAM estimada: no disponible con precisión; para un base de 27B en bf16 se necesitan del orden de 54 GB solo para pesos, más caché KV, aunque esta cifra no está confirmada en la documentación del adaptador.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, cabría esperar A100/H100 o varias GPU consumer, pero no se documenta.
- En GPU consumer: no confirmado; requeriría cuantización del base, no documentada para este adaptador.
- Despliegue: PEFT sobre el base o vLLM con `--enable-lora`, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTRACE-27B-latest | LoRA sobre Qwen3.8-27B | No disponible (base 27B) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B base | Transformer completo | 27B (según nombre) | No disponible | No disponible en esta ficha | Hugging Face |
| Otros adaptadores de retrosíntesis | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables de retrosíntesis con agentes en la documentación proporcionada.

## Limitaciones y advertencias

- Los resultados se basan en 40 objetivos y auditoría por LLM-juez, no por químicos expertos; la mejora en la métrica laxa no es estadísticamente significativa (p=0,077).
- Las salidas son sugerencias de planificación: toda ruta debe ser verificada por un químico antes de cualquier uso de laboratorio.
- Es un adaptador, no un modelo autónomo: sin el base Qwen3.8-27B y el arnés ReTRACE, su comportamiento queda indefinido.
- La rama `main` es móvil y se actualiza con cada versión; para reproducibilidad hay que fijar el tag (`s3-v1`) y el sha256 del adaptador (`e69aa10429dfd7aaa83b3a51201832e7380cd460f720eda52b9a169e62f9b146`).
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; dado el dominio, el riesgo de rutas químicamente inválidas es alto y debe asumirse.
- Licencia Apache 2.0 permite uso comercial, pero la licencia y condiciones del modelo base deben verificarse por separado.
- Repositorio sin descargas ni likes: no hay evidencia de validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jxtse/ReTRACE-27B-latest
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
