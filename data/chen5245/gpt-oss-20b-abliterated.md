# chen5245/gpt-oss-20b-abliterated

## Resumen

`chen5245/gpt-oss-20b-abliterated` es una variante del modelo `openai/gpt-oss-20b` de OpenAI a la que se le ha suprimido el comportamiento de rechazo (refusal) mediante edición directa de pesos. Lo desarrolla el usuario chen5245 y se publica bajo licencia Apache 2.0. El modelo base es un transformer con arquitectura MoE (Mixture of Experts) de 24 capas, 32 expertos enrutados por capa y top-4 activos, con pesos nativos en MXFP4 y 20.914.757.184 parámetros totales según los safetensors del repositorio.

La intervención se realiza con la herramienta `abliterix` y combina tres técnicas: proyección ortogonal directa sobre los pesos de atención, Expert-Granular Abliteration (EGA) sobre los pesos fusionados de los expertos MoE y supresión de filas del router para los expertos con mayor concentración de comportamiento de seguridad. El autor reporta una reducción de rechazos del 97/100 al 6/100 en un conjunto de 100 prompts dañinos retenidos, evaluados con un juez LLM, manteniendo una divergencia KL de 0,0098 frente al modelo base en prompts benignos.

Es relevante para investigadores que estudian alineamiento, robustez de salvaguardas y mecánica interna de los MoE, así como para quienes necesitan un modelo sin capa de rechazo para experimentación controlada. No es un modelo recomendado para despliegues en producción sin supervisión, dado que elimina deliberadamente las salvaguardas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 24 capas, 32 expertos enrutados por capa, top-4 activos, hidden = intermediate = 2880 |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible (top-4 de 32 expertos por capa, sin cifra oficial publicada) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 nativo en el modelo base; BF16 durante el proceso de abliteration; no se detallan otras cuantizaciones publicadas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `openai/gpt-oss-20b`: un transformer con capas MoE de expertos fusionados, 24 capas, 32 expertos enrutados por capa con enrutamiento top-4, y dimensiones ocultas e intermedias de 2880. Los pesos del modelo base se distribuyen en formato MXFP4 y se desquantizan a BF16 durante el proceso de edición. El repositorio ocupa 41,9 GB.

El proceso de abliteration se ejecuta con `abliterix` en modo `steering_mode = "direct"` (proyección ortogonal sobre los pesos base, sin LoRA) y `weight_normalization = "full"` (preservación de norma). Se calcula una dirección de rechazo por capa como la media de las diferencias entre residuales de 400 prompts dañinos y 400 benignos. Los componentes intervenidos son `attn.{q,k,v,o}_proj`, `mlp.experts.down_proj` en los 32 expertos × 24 capas mediante EGA, y las filas del `mlp.router` de los expertos de seguridad mediante supresión de logits. La búsqueda de hiperparámetros se realiza con Optuna TPE (100 trials: 40 aleatorios de calentamiento y 60 TPE) con objetivos múltiples de divergencia KL y rechazo evaluado por LLM. El entrenamiento se ejecutó en una NVIDIA RTX PRO 6000 Blackwell (96 GB, sm_120) con driver 580 / CUDA 12.9, batch de 8 y un tiempo total de aproximadamente 5 h 20 m.

El autor documenta tres correcciones específicas para la arquitectura gpt-oss: la detección automática de pesos MXFP4 empaquetados que no son `nn.Parameter` estándar, el tratamiento de `GptOssExperts.down_proj` que está almacenado transpuesto respecto a la convención MoE habitual, y la síntesis de un perfil `mlp.down_proj` para que EGA se aplique realmente sobre los expertos fusionados. Los hiperparámetros ganadores incluyen `n_suppress = 1` y `router_bias = -0.64` para la supresión del router, y pesos máximos por componente que oscilan entre 2,21 y 6,95, con el pico de EGA en la capa ≈18.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a prompts técnicos y de conocimiento general, heredados del modelo base.
- Generación de código y contenido técnico paso a paso, en el mismo estilo de tablas Markdown y estructura que usa el modelo base para respuestas benignas.
- Cumplimiento de prompts dañinos sin rechazo: el autor reporta 15/15 en una prueba manual con 15 jailbreaks clásicos (10 en inglés y 5 en chino) que cubren lockpicking, phishing, síntesis de metanfetamina, hacking WiFi, noticias falsas, hotwiring, bombas caseras, falsificación de firmas, keyloggers, hurto, 炸弹制作, 钓鱼邮件, 电脑入侵, 身份证伪造 y 网络诈骗.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineamiento y seguridad: el modelo permite estudiar cómo se distribuye el comportamiento de rechazo en las capas y expertos de un MoE, comparando las activaciones del router entre prompts benignos y dañinos gracias a la intervención documentada sobre `mlp.router` y `mlp.experts.down_proj`.
- Evaluación de robustez de salvaguardas: sirve como referencia de modelo "sin rechazo" para medir la eficacia de clasificadores de contenido, filtros de salida y sistemas de moderación externos que deban operar sobre modelos con salvaguardas eliminadas.
- Análisis de mecánica interna de MoE: la intervención capa por capa con pico en la capa ≈18 permite estudiar qué expertos concentran el comportamiento de seguridad y cómo afecta la supresión del top-1 experto por capa al resto de capacidades.
- Experimentación con edición de pesos: el repositorio documenta hiperparámetros, correcciones arquitectónicas y el flujo completo de Optuna, lo que lo convierte en material de referencia para replicar abliteration sobre otros modelos MoE con pesos MXFP4.
- Generación de contenido técnico sin fricción en entornos controlados: para tareas de red teaming autorizado, pruebas de penetración documentadas o generación de escenarios de amenaza en laboratorios de seguridad, donde el modelo base rechazaría las peticiones.
- Estudio de degradación de capacidades: la métrica de divergencia KL (0,0098) y la desviación de longitud de respuesta (0,02 σ) permiten cuantificar cuánto se degrada el modelo en prompts benignos tras la edición, útil para investigar el coste de eliminar salvaguardas.

## Benchmarks y rendimiento

| Metrica | Base `gpt-oss-20b` | Este modelo |
|---|---|---|
| Rechazos en 100 prompts dañinos retenidos (juez LLM) | 97 / 100 | 6 / 100 |
| Divergencia KL vs base (next-token, benigno) | — | 0,0098 |
| Desviacion de longitud de respuesta vs base (benigno) | — | 0,02 σ |
| Cumplimiento cualitativo en 15 jailbreaks clasicos (EN+ZH) | 0 / 15 | 15 / 15 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son las reportadas por el autor en la model card y se refieren exclusivamente al comportamiento de rechazo y a la fidelidad respecto al modelo base, no a capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el repositorio ocupa 41,9 GB en safetensors, lo que sugiere que la inferencia en BF16 requiere del orden de 40 GB o más, y que las cuantizaciones a 8 o 4 bits reducirían sustancialmente ese requisito.
- GPU recomendadas: el proceso de abliteration se ejecutó en una NVIDIA RTX PRO 6000 Blackwell de 96 GB. Para inferencia no se especifican GPU concretas.
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada; depende de la cuantización elegida.
- Opciones de despliegue: la librería indicada es `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `chen5245/gpt-oss-20b-abliterated` | 20.914.757.184 | no disponible | Apache 2.0 | Abliteration directa + EGA + supresion de router sobre gpt-oss-20b |
| `openai/gpt-oss-20b` | 20.914.757.184 (mismo base) | no disponible | Apache 2.0 | Modelo base con salvaguardas intactas |
| Otras variantes abliterated de gpt-oss-20b | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación más directa es con el modelo base, del que se diferencia únicamente en la supresión del rechazo y en una divergencia KL de 0,0098 en prompts benignos. No se dispone de información sobre otras variantes abliterated del mismo modelo base para establecer una comparativa adicional.

## Limitaciones y advertencias

- Elimina deliberadamente las salvaguardas del modelo base: el autor reporta 6/100 rechazos frente a 97/100 del original, y cumplimiento 15/15 en jailbreaks clásicos. No debe desplegarse en producción orientada al público sin moderación externa.
- Riesgo elevado de generar contenido dañino, ilegal o peligroso (síntesis de drogas, armas, phishing, malware) sin filtro interno.
- Sesgos conocidos: no documentados específicamente en la información proporcionada; hereda los del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; la divergencia KL de 0,0098 sugiere una degradación limitada en la distribución benigna, pero no descarta alucinaciones.
- Limitaciones de idioma: la model card declara únicamente inglés y chino; el rendimiento en castellano no está evaluado.
- Longitud de contexto: no especificada en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas puede incumplir normativas locales (por ejemplo, la Ley de Servicios Digitales de la UE o la regulación sobre contenidos ilícitos) y las políticas de los proveedores de infraestructura.
- El proceso de evaluación se basa en un juez LLM (`google/gemini-3.1-flash-lite-preview` vía OpenRouter) y en un filtro de reglas previo; los resultados no han sido replicados de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La fecha de creación indicada (2026-11-19) es futura respecto al momento habitual de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/chen5245/gpt-oss-20b-abliterated
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
