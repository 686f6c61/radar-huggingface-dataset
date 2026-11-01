# songminjae/vjepa-dpxpsi-b1k-t15

## Resumen

vjepa-dpxpsi-b1k-t15 es un checkpoint de política de acción (action policy) para el robot humanoide R1Pro en el entorno de simulación BEHAVIOR-1K. Lo desarrolla el usuario songminjae y combina tres componentes: un codificador visual congelado V-JEPA 2.1 ViT-L/16 a 384 px, un codificador de texto congelado Qwen3-0.6B y un experto de acción tipo MM-DiT denominado `vjepa_policy_psi` (antes `dpxpsi`), que genera fragmentos de 24 pasos de acción mediante flow matching.

El modelo resuelve el problema de mapear observaciones multimodales (cámara de cabeza, dos cámaras de muñeca y propiocepción de 22 dimensiones) más una instrucción en lenguaje natural a comandos motores de 22 dimensiones para el robot. Es relevante para la comunidad de visión-lenguaje-acción (VLA) porque documenta de forma inusualmente transparente una inestabilidad de entrenamiento en la ruta de condicionamiento temporal (timestep embedding) y ofrece tres checkpoints con estados de divergencia distintos.

El repositorio ocupa 9,3 GB y contiene únicamente pesos (`torch.save`), sin los codificadores congelados, que deben cargarse por separado. Los parámetros entrenables del experto de acción son 379 M. La licencia es "other" y no se declaran idiomas soportados más allá de las instrucciones en lenguaje natural procesadas por Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con encoder visual V-JEPA 2.1 ViT-L/16 congelado + encoder de texto Qwen3-0.6B congelado + experto de acción Psi0 MM-DiT (6 bloques × 1536, 24 cabezas, AdaLN-Zero) con flow matching |
| Parametros totales | no disponible (379 M entrenables en el experto de acción; los encoders congelados no se incluyen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 897 tokens de contexto (576 de cabeza + 288 de muñeca + 32 de lenguaje + 1 de propiocepción); instrucción de texto limitada a 32 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones procesadas por Qwen3-0.6B, máx. 32 tokens) |
| Licencia | other |
| Formato de pesos | `torch.save` (dict con `model`, `ema`, `cfg`, `args`, `arch`, `step`, `norm_stats_sha`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de visión-lenguaje-acción con tres torres. El encoder visual V-JEPA 2.1 ViT-L/16 procesa 8 fotogramas de la cámara de cabeza (stride 8, 384 px) y 2 fotogramas de cada cámara de muñeca, con pooling 2×2 que produce 576 y 288 tokens respectivamente. El encoder de texto Qwen3-0.6B aporta hasta 32 tokens de instrucción y la propiocepción aporta 1 token. Estos tokens actúan únicamente como claves y valores (contexto, `ctx_update none`) en el experto de acción, un MM-DiT estilo Psi0 de 6 bloques con anchura 1536 y 24 cabezas, cuyos bloques transformer se inicializan desde `USC-PSI-Lab/psi-model` (`psi0/postpre.1by1.pad36`); el resto se entrena desde cero.

El objetivo es rectified flow con target de velocidad v = ε − a y muestreo de ruido σ ~ Beta(1.5, 1)·0.999 + 0.001, complementado con una alineación de tokens futuros estilo FLARE hacia el fotograma objetivo (16 tokens, peso 0.2). La acción es un fragmento de 24 pasos (12 ejecutados) de 22 dimensiones absolutas (velocidad base, torso, brazos, pinzas), con padding de 22 a 36 dentro del experto. La inferencia usa Euler con 10 pasos desde σ = 1 a 0 sobre los pesos EMA. El entrenamiento usó las demos del challenge BEHAVIOR-1K (`behavior-1k/2026-challenge-demos`): 15 tareas × 190 demos de entrenamiento, solo segmentos de manipulación, 29 mil segmentos y 13,9 (dato truncado en la model card). Se planificaron 3 épocas (155.211 pasos) y se detuvo en el paso 116.400.

La model card documenta con detalle una inestabilidad: a partir del paso 88.000 aparecieron picos de pérdida concentrados en el MLP de embedding temporal que alimenta la modulación AdaLN; la norma de pesos de ese MLP subió de 27,7 (paso 86.000) a 30,5 (paso 105.000) y la norma de AdaLN creció de 80,5 (paso 0) a 91,7 (paso 114.000). Sin intervención se alcanzaron normas de gradiente pre-clip de 1,6e7 en el paso 94.000. El cambio de σ ~ U(0,1) a σ ~ Beta(1.5,1) retrasó la divergencia de ~20k a ~88k sin eliminarla.

## Capacidades

- Generación de acciones motoras: produce fragmentos de 24 pasos de acción de 22 dimensiones (velocidad base, torso, brazos, pinzas) mediante flow matching, ejecutando 12 pasos por inferencia.
- Control robótico guiado por lenguaje: acepta instrucciones en lenguaje natural de hasta 32 tokens a través de Qwen3-0.6B.
- Percepción multimodal: integra cámara de cabeza (8 fotogramas) y dos cámaras de muñeca (2 fotogramas cada una) a 384 px.
- Fusión de propiocepción: incorpora un vector de 22 dimensiones del estado del robot.
- Manipulación en 15 tareas de BEHAVIOR-1K: entrenado específicamente en tareas de manipulación del challenge (segmentos move-to excluidos).
- Alineación a objetivo visual: la pérdida FLARE-style alinea tokens futuros con el fotograma objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; es una política de acción, no un modelo conversacional.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en manipulación robótica simulada: sirve como política de referencia para el robot R1Pro en BEHAVIOR-1K, permitiendo reproducir experimentos de VLA con encoders congelados y un experto de acción ligero (379 M entrenables).
- Estudio de estabilidad en entrenamiento de flow matching: los tres checkpoints (pasos 52.500, 90.000 y 105.000) permiten analizar la divergencia en la ruta de condicionamiento temporal y probar correcciones como modulación AdaLN acotada o learning rates menores.
- Punto de partida para fine-tuning en tareas nuevas: `ckpt_052500.pt` es el checkpoint limpio recomendado para ajuste fino en otras tareas de manipulación con el mismo formato de observación (cabeza + dos muñecas + propiocepción).
- Evaluación de encoders visuales congelados: al usar V-JEPA 2.1 ViT-L/16 congelado, permite medir cuánto rendimiento aporta el encoder frente a alternativas en tareas de control.
- Benchmarking de políticas VLA: integrable en pipelines de evaluación de BEHAVIOR-1K para comparar arquitecturas MM-DiT frente a políticas basadas en difusión o transformers autoregresivos.
- Docencia y divulgación: la model card detalla paso a paso la progresión de pérdidas, normas de gradiente y pesos, lo que la convierte en material didáctico sobre diagnóstico de inestabilidades en entrenamiento.
- Análisis de condicionamiento por ruido: el checkpoint del paso 90.000 permite estudiar el efecto del muestreo Beta(1.5,1) frente a uniforme en la ruta de timestep.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de acción EMA a 200 pasos de 0,0158 en el paso 52.400, 0,0242 en el paso 90.000 y 0,0235 en el paso 105.000; pérdida de alineación de objetivo de 0,0182 en el paso 52.400; y norma de gradiente de ~0,09 en los pasos limpios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio de pesos ocupa 9,3 GB, pero los encoders congelados (V-JEPA 2.1 ViT-L/16 y Qwen3-0.6B) deben cargarse aparte y suman varios GB adicionales en fp16/bf16.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del experto (379 M entrenables) y los encoders congelados, una GPU con 24 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) o superiores, pero no hay confirmación del autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo se carga mediante el código del repositorio `songminjae/vjepa-based-policy` (rama `t15-wrist-psi-renewal`, commit `143cc3c`).
- Latencia y throughput: no disponibles. La inferencia usa Euler con 10 pasos, lo que implica 10 evaluaciones del experto por fragmento de acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vjepa-dpxpsi-b1k-t15 | 379 M entrenables (encoders congelados aparte) | 897 tokens de contexto | VLA para BEHAVIOR-1K R1Pro | other | HuggingFace, 0 descargas |
| Psi0 (`USC-PSI-Lab/psi-model`) | no disponible | no disponible | Política VLA humanoide | no disponible | HuggingFace; bloques usados como inicialización |
| V-JEPA 2.1 ViT-L/16 (`apiantonio/vjepa2.1-vit-large-384`) | no disponible | no aplica (encoder visual) | Representación visual | no disponible | HuggingFace; usado congelado |
| Qwen3-0.6B (`Qwen/Qwen3-0.6B`) | 0,6 B | no disponible | LLM de texto | no disponible | HuggingFace; usado congelado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Inestabilidad de entrenamiento documentada: divergencia en la ruta de timestep embedding a partir del paso 88.000; `ckpt_090000.pt` y `ckpt_105000.pt` provienen de ventanas con picos de gradiente (hasta 7e16 pre-clip en el paso 99.400–100.200) y pérdidas superiores al nivel pre-divergencia.
- Solo `ckpt_052500.pt` se recomienda para inferencia y fine-tuning; los otros dos son para análisis o experimentación.
- Entrenamiento incompleto: se planificaron 155.211 pasos (3 épocas) y se detuvo en 116.400, por lo que el modelo no completó el régimen previsto.
- Dominio restringido: solo 15 tareas de manipulación de BEHAVIOR-1K, en simulación, con el robot R1Pro; no hay evidencia de transferencia a robots reales ni a otras morfologías.
- Instrucciones de lenguaje limitadas a 32 tokens y procesadas por un encoder de 0,6 B; no se documentan capacidades multilingües.
- Dependencia de los encoders congelados: los pesos no incluyen V-JEPA 2.1 ni Qwen3-0.6B, que deben descargarse por separado y con versiones compatibles.
- Consistencia de normalización obligatoria: `norm_stats_train.json` debe coincidir con el `norm_stats_sha` del checkpoint (`e32883d4e0042aaf`); de lo contrario las acciones resultantes serán incorrectas.
- Licencia "other": no se especifican términos de uso comercial; es necesario contactar con el autor o revisar el repositorio antes de un uso en producción.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero la política puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse solo con demos del challenge, puede heredar sesgos de las trayectorias humanas de demostración.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/songminjae/vjepa-dpxpsi-b1k-t15
- Código: https://github.com/songminjae/vjepa-based-policy (rama `t15-wrist-psi-renewal`, commit `143cc3c`; rama `t15-wrist-psi`, commit `4e2d676`, con el nombre antiguo `dpxpsi`)
- Encoder visual V-JEPA 2.1: https://huggingface.co/apiantonio/vjepa2.1-vit-large-384
- Encoder de texto Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Inicialización del experto de acción Psi0: https://huggingface.co/USC-PSI-Lab/psi-model
- Dataset BEHAVIOR-1K challenge demos: `behavior-1k/2026-challenge-demos` (referenciado en la model card; no se proporciona URL directa)
