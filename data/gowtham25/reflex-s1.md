# Gowtham25/reflex-s1

## Resumen

Reflex-S1 es un motor de decision no generativo disenado para actuar como "System 1" dentro de pipelines de agentes de IA. Lo desarrolla el autor Gowtham25 y se distribuye bajo licencia Apache 2.0. En lugar de generar texto token a token, el modelo produce distribuciones de probabilidad normalizadas sobre esquemas discretos y tipados (eleccion multiple, booleano y puntuacion ordinal), lo que elimina el riesgo de alucinacion de esquema y reduce drasticamente la latencia en decisiones de bajo nivel.

El problema que aborda es concreto: los agentes modernos dedican mas del 80% de sus pasos a decisiones deterministas (seleccion de herramienta, autorizacion de politica de seguridad, deteccion de fallos silenciosos de API, triaje de errores). Resolverlas con LLM generativos de 7B a 70B parametros cuesta entre 300 y 2.000 ms por paso y consume VRAM de forma desproporcionada. Reflex-S1 sustituye esas llamadas por inferencia categorica instantanea.

La arquitectura combina un bloque recursivo compartido (Mixture of Recursions, MoR) con un Mixture-of-Experts disperso Top-2/4. El repositorio de HuggingFace incluye un perfil `fast` de 23.242.120 parametros reales (verificados en safetensors) y un perfil `quality` de 82,8M. La longitud de contexto no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque recursivo compartido (Mixture of Recursions) + MoE disperso Top-2/4 |
| Parametros totales | 23.242.120 (perfil `fast`, dato real de safetensors); 82,8M (perfil `quality`) |
| Parametros activos | No disponible (top-2/4 de enrutamiento experto, sin cifra absoluta publicada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precision nativa) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,8 GB |
| Libreria | reflex-s1 |

## Arquitectura y entrenamiento

Reflex-S1 no es un transformer generativo. Su nucleo es un bloque recursivo compartido que implementa Mixture of Recursions (MoR): la profundidad de computo es adaptativa, con un rango de profundidad $d \in [1, 3]$ aprendido mediante refuerzo (RL). Sobre ese bloque se aplica un Mixture-of-Experts disperso con enrutamiento Top-2/4, de modo que cada ejemplo activa solo una fraccion de los expertos disponibles. La salida no es una secuencia de tokens, sino una distribucion de probabilidad normalizada sobre un esquema tipado: `choice` (opciones discretas), `noul`/booleano y `score`/ordinal.

El sistema incorpora ademas un router de doble perfil (`fast` / `quality`) que decide dinamicamente que variante del modelo atender para cada consulta, equilibrando latencia y precision. Los conjuntos de datos declarados para evaluacion y entrenamiento son ZefanCai/Open-Jev, PolyAI/banking77, clinc/oos-eval, stanfordnlp/snli y google/boolq, con metricas de accuracy, F1 y ECE (expected calibration error). No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO mas alla del RL para la profundidad adaptativa.

## Capacidades

- Clasificacion y decision categorica no generativa: devuelve distribuciones de probabilidad tipadas en lugar de texto, eliminando la generacion de tokens.
- Verificacion de evidencia y entailment (NLI): distingue contradiccion, neutralidad y entailment sobre afirmaciones frente a un estado observado.
- Enrutamiento de herramientas (tool selection): selecciona la funcion o herramienta adecuada entre un conjunto de opciones.
- Deteccion de fallo silencioso de API: identifica respuestas HTTP aparentemente correctas cuyo resultado real es erroneo.
- Autorizacion de politica de seguridad: defensa frente a inyeccion de instrucciones del tipo "ignore rule".
- Discriminacion de anomalias fuera de alcance (out-of-scope) sobre consultas de usuario.
- Salidas booleanas y ordinales (puntuacion / score) ademas de eleccion multiple.
- Razonamiento de un solo paso; no soporta multi-step reasoning generativo ni tool calling en el sentido de los LLM generativos (la herramienta la elige, no la ejecuta).
- Capacidad multilingue limitada al ingles.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de la conversacion, el modelo selecciona en menos de 12 ms que herramienta invocar (`web_search`, `calculator`, `file_reader`), evitando una llamada a un LLM generativo por cada paso de planificacion.
- Deteccion de fallos silenciosos en integraciones de API: identificar respuestas HTTP 200 con cuerpo vacio o corrupto antes de que el agente continue, usando la salida booleana de validacion.
- Autorizacion de politicas de seguridad: comprobar si una accion solicitada viola reglas del sistema, con tasas de acierto de hasta el 100% en el conjunto de defensa frente a inyeccion.
- Triaje de errores en pipelines de datos: clasificar automaticamente la causa de un fallo en categorias discretas para dirigir el reintento o la alerta al equipo correcto.
- Verificacion de hechos y claims: contrastar una afirmacion contra evidencia textual y devolver contradiccion, neutralidad o entailment como distribucion calibrada.
- Filtrado de consultas fuera de dominio: descartar peticiones que no pertenecen al alcance del asistente (out-of-scope) antes de consumir recursos de un modelo mayor.
- Colocacion conjunta con LLM generativos: al ocupar menos de 1 GB de VRAM, puede desplegarse en la misma GPU que un modelo de lenguaje de produccion sin riesgo de OOM.
- Preprocesado de baja latencia en agentes de navegacion web: seleccion de elementos DOM objetivo y decisiones de interaccion en tiempo real.

## Benchmarks y rendimiento

Evaluacion sobre 3.000 ejemplos en una NVIDIA L40S:

| Dominio | Alcance | Reflex-Fast (23M) | Reflex-Quality (83M) | Reflex-Router | Latencia p50 |
|---|---|---|---|---|---|
| Evidencia y razonamiento | BoolQ (500) y SNLI (500) | 69,60% | 80,70% | 80,70% | 11,51 ms |
| Seleccion de herramienta | Berkeley Function Calling (200) | 95,67% | 88,33% | 90,00% | 11,64 ms |
| Fallo silencioso de API | Open-Jev silent failure test set | 69,67% | 71,00% | 69,67% | 11,59 ms |
| Politica de seguridad | Defensa frente a inyeccion ("ignore rule") | 99,50% | 100,00% | 99,50% | 11,72 ms |
| Anomalia fuera de alcance | CLINC-OOS | 84,40% | 48,20% | 84,40% | 15,18 ms |
| Global (3.000 tareas) | Suite multi-dominio completa | 80,67% | 77,97% | 83,80% | 11,67 ms |

Latencia global: 6,56 ms en cache caliente de esquema y 11,67 ms en cache frio, medidas en NVIDIA L40S. El autor declara que es 2x mas rapido que el baseline ModernBERT de 149M (Laya) y 10x mas rapido que modelos autorregresivos pequenos.

## Requisitos de hardware

- VRAM estimada de inferencia: menos de 1 GB para ambos perfiles (23M y 83M), segun el autor.
- GPU recomendadas: cualquier GPU moderna. Los benchmarks del autor se realizaron en NVIDIA L40S.
- Cabe en GPU de consumo: si, sin restricciones practicas; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con mas de 1-2 GB de VRAM.
- Despliegue: la libreria propia `reflex-s1` (instalable con `pip install -e .` desde el repositorio de GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y por su naturaleza no generativa estos motores no aplican de forma directa.
- Latencia: p50 de 6,56 ms (cache caliente) y 11,67 ms (cache frio) en L40S.
- Throughput: no disponible.
- Colocacion concurrente: el autor indica que puede convivir con LLM generativos en produccion sin riesgo de OOM por su bajo consumo de VRAM.

## Comparativa con modelos similares

| Dimension | TypeSafe Jev | Open-Jev (Zefan Cai et al.) | Laya (NandhaKishorM) | Reflex-S1 |
|---|---|---|---|---|
| Arquitectura | No generativa, propietaria | LoRA + Readout sobre Qwen (2B/9B/27B) | Encoder ModernBERT denso (149M) | Bloque MoR compartido + MoE disperso Top-2/4 |
| Disponibilidad | Solo API cerrada | Pesos abiertos y adaptadores LoRA | Codigo abierto (Apache 2.0) | Codigo abierto y autoalojable |
| Parametros | No divulgados | 2B - 27B | 149M | 23,2M - 82,8M |
| Latencia p50 | 5 - 10 ms (propietaria) | 40 - 180+ ms (autorregresiva) | 23,2 ms (batch 1, una GPU) | 6,6 ms (caliente) / 11,6 ms (frio) |
| Computo adaptativo | Desconocido | Paso estatico por modelo | Paso denso unico estatico | Profundidad MoR adaptativa $d \in [1, 3]$ via RL |
| Enrutamiento dinamico | Propietario | Checkpoint unico | Router de idioma estatico | Router dual (`fast` / `quality`) |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre; solo devuelve distribuciones sobre esquemas predefinidos. No sirve para generacion, resumen ni dialogo abierto.
- Idiomas: unicamente ingles. No hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar su uso con estados de agente extensos.
- Anomalia fuera de alcance: el perfil `quality` (83M) cae al 48,20% frente al 84,40% del perfil `fast`, un comportamiento contraintuitivo que conviene validar en el dominio propio antes de confiar en el router.
- Fallo silencioso de API: precision en torno al 70%, insuficiente como unica barrera; debe combinarse con validaciones deterministas.
- Riesgo de error de calibracion: aunque el modelo declara metrica ECE, no se publican los valores de calibracion, lo que impide evaluar la fiabilidad de las probabilidades reportadas.
- Sesgos: no se documenta analisis de sesgo ni composicion demografica de los datasets de entrenamiento.
- Alucinacion: al no generar texto, el riesgo clasico de alucinacion desaparece, pero persisten errores de clasificacion que se manifiestan como etiquetas incorrectas con alta confianza.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre manteniendo atribucion y avisos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion (2026-09-24) indica un proyecto reciente; conviene tratar los resultados como preliminares y no auditados de forma independiente.
- Dependencia de libreria propia: la integracion requiere la libreria `reflex-s1` del autor, sin soporte confirmado en ecosistemas de despliegue estandar.

## Enlaces

- HuggingFace: https://huggingface.co/Gowtham25/reflex-s1
- Repositorio GitHub: https://github.com/gowtham-source/reflex-s1
- Dataset de referencia: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
- Dataset: https://huggingface.co/datasets/clinc/oos-eval
- Dataset: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset: https://huggingface.co/datasets/google/boolq
