# odelpa/qwen14-scienziato-v2-nt

## Resumen

`qwen14-scienziato-v2-nt` es un adaptador LoRA desarrollado por Giovanni Del Papa (odelpa) sobre el modelo base `Qwen/Qwen3-14B` (revision 40c06982) con el adaptador de identidad `odelpa/qwen14-scienziato-v2` ya fusionado. Su proposito es ensenar al modelo a anunciar antes y reportar despues cada conexion de red que realice a traves de herramientas, indicando host, pais y direccion del trafico. Es, por tanto, un adaptador orientado a transparencia de red en agentes con tool calling, no un modelo de proposito general.

El adaptador tiene rango r=16 y alpha=16, y se aplica sobre todas las proyecciones de atencion y MLP. El modelo base Qwen3-14B es un transformer denso de 14.768.307.200 parametros con capacidades de razonamiento, generacion de texto y tool use. El repositorio ocupa 9,3 GB e incluye los pesos del adaptador en safetensors, una version GGUF cuantizada Q4_K_M publicada tambien en Ollama, resultados de evaluacion y el articulo completo en PDF.

La relevancia del modelo reside en su enfoque: convertir la transparencia de red en un comportamiento aprendido y medible del propio LLM, con metricas de recall, precision y pre-anuncio. El autor documenta explicitamente que dos criterios de aceptacion pre-registrados no se cumplieron (una caida de 0,4 puntos en IFEval y una tasa de fuga del 1,11% frente al umbral del 1%), por lo que se publica como excepcion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con adaptador LoRA (r=16, alpha=16) sobre proyecciones de atencion y MLP |
| Parametros totales | 14.768.307.200 (modelo base); el adaptador LoRA es un conjunto adicional de pesos de bajo rango |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (version publicada en Ollama y en `gguf/` del repo); evaluaciones realizadas en bf16 |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) y GGUF (Q4_K_M fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B v2, que es el modelo `Qwen/Qwen3-14B` (revision 40c06982) con el adaptador de identidad `odelpa/qwen14-scienziato-v2` fusionado a escala 1.0. Sobre esa base se entrena un LoRA de rango 16 y alpha 16 que cubre todas las proyecciones de atencion y MLP. El entrenamiento consistio en 2 epocas y 786 pasos sobre una unica GPU H100 NVL, con un coste de computo declarado de 8,48 USD. No se especifica en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset, aunque el entorno de herramientas descrito es simulado (mock tool environment) con ventanas limitadas de red real.

La innovacion tecnica principal no esta en la arquitectura, sino en el objetivo de entrenamiento: inducir un comportamiento de pre-anuncio y post-reporte de conexiones de red (host, pais, direccion) integrado en el flujo de tool calling. El autor realizo ademas una auditoria de red del propio proceso de entrenamiento: 63 flujos, 0 anomalias (35 en EE. UU., 26 en Canada; trafico a PyPI, PyTorch, Hugging Face y SSH). Las evaluaciones se hicieron con benchmarks emparejados y test exacto de McNemar.

## Capacidades

- Generacion de texto conversacional en italiano e ingles sobre la base de Qwen3-14B.
- Tool calling y function calling: el adaptador modifica el comportamiento del modelo al usar herramientas que implican red.
- Pre-anuncio de conexiones de red: el modelo declara host, pais y direccion antes de establecer la conexion (99,3% de cumplimiento medido).
- Post-reporte de conexiones: registra las conexiones realizadas tras la llamada a la herramienta (recall del 99,7%).
- Identificacion correcta de pais y direccion del trafico (100% en ambas metricas en el conjunto de desarrollo).
- Razonamiento y matematicas heredados del modelo base: GSM8K del 94,9% y ARC-it del 90,5%.
- Capacidad de seguir instrucciones formato (IFEval del 83,5%, ligeramente por debajo de la base).
- Identidad reforzada: 98,0% en test sellado de identidad (n=50) frente al 76,0% de la base v2.

## Casos de uso

- Agentes con requisitos de auditoria de red: el modelo anuncia y registra cada conexion saliente (host, pais, direccion), lo que permite construir trazas auditables de las acciones de red de un agente en entornos regulados.
- Cumplimiento y gobernanza de datos: en despliegues donde es necesario justificar a que jurisdicciones se envia informacion, el pre-anuncio y el reporte posterior facilitan la generacion de evidencia documental del flujo de datos.
- Investigacion en seguridad de LLM: sirve como objeto de estudio para medir y reducir fugas de red no solicitadas, con metricas reproducibles (recall, precision, tasa de fuga) y un articulo metodologico asociado.
- Evaluacion de transparencia en pipelines de agentes: puede integrarse en un arnes de pruebas que verifique que un agente declara sus conexiones antes de ejecutarlas, comparando el comportamiento con y sin el adaptador.
- Despliegue local con Ollama: la version GGUF Q4_K_M permite ejecutar el modelo en hardware de consumo para pruebas de concepto de transparencia de red, con la advertencia de que las metricas publicadas se midieron en bf16.
- Formacion y demostraciones: el modelo y su articulo permiten ilustrar de forma practica como se entrena y evalua un comportamiento de seguridad en un LLM mediante LoRA, con gates pre-registrados y analisis estadistico.
- Asistentes en italiano con control de red: para aplicaciones conversacionales en italiano que usan herramientas externas y necesitan declarar el destino de las conexiones, el adaptador mantiene el rendimiento en italiano (ARC-it 90,5%).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 450 ejecuciones de desarrollo, con benchmarks emparejados y test exacto de McNemar:

| Metrica | Umbral | Base v2 | NT fine-tuned |
|---|---|---|---|
| Recall de conexiones | >=95% | 0,0 | 99,7 |
| Pais / Direccion | >=98 / >=99% | 0,0 / 0,0 | 100 / 100 |
| Pre-anuncio | >=95% | 0,0 | 99,3 |
| Precision | >=98% | 100 | 99,8 |
| Intento de fuga | <=1% | 19,4 | 1,11 (no cumple) |
| Falsa negativa de rechazo | <=3% | 6,7 | 0,4 |
| Identidad (test sellado, n=50) | — | 76,0 | 98,0 (p=0,001) |
| GSM8K (n=1319) | sin regresion | 94,7 | 94,9 (p=0,70) |
| IFEval (n=541) | sin regresion | 83,9 | 83,5 (no cumple, p=0,87) |
| ARC-it (n=1132) | sin regresion | 90,6 | 90,5 (p=0,63) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Las metricas se midieron en bf16, no sobre la cuantizacion GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 28-30 GB para los pesos del modelo base de 14.768 millones de parametros, mas overhead de activaciones y contexto.
- VRAM estimada en cuantizacion Q4_K_M: aproximadamente 9-10 GB, lo que permite ejecucion en GPUs de consumo con 12 GB o mas.
- GPU recomendadas: H100 NVL (usada en el entrenamiento), A100 80 GB o 40 GB para bf16; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090, RTX 4070 Ti Super o superiores para la version Q4_K_M.
- Cabe en GPU de consumo: si, en la version GGUF Q4_K_M para GPUs con 12 GB o mas; en bf16 requiere GPUs de 24 GB o mas.
- Opciones de despliegue: Ollama (`ollama run ollamagdp/qwen14-scienziato-v2-nt`), PEFT con Transformers para el adaptador, llama.cpp para el GGUF, y servidores compatibles con endpoints (el repo incluye la etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen14-scienziato-v2-nt | 14.768 M (base) + LoRA | no disponible | Transparencia de red en tool use | Apache-2.0 | Hugging Face y Ollama |
| Qwen/Qwen3-14B | 14.768 M | no disponible | Modelo base generalista con razonamiento y tool use | Apache-2.0 | Hugging Face |
| odelpa/qwen14-scienziato-v2 | 14.768 M (base) + LoRA de identidad | no disponible | Identidad reforzada sobre Qwen3-14B | Apache-2.0 | Hugging Face |

La comparativa con alternativas de la misma categoria (adaptadores de seguridad o transparencia para LLM) no esta disponible en la informacion proporcionada. Frente a su base v2, la diferencia medible esta en el recall de conexiones (99,7 frente a 0,0), el pre-anuncio (99,3 frente a 0,0), la identidad (98,0 frente a 76,0) y la reduccion de intentos de fuga (1,11% frente a 19,4%), con una ligera perdida en IFEval (83,5 frente a 83,9).

## Limitaciones y advertencias

- Regresion en IFEval: 83,5% frente a 83,9% de la base (−0,4 puntos, p=0,87; −1,4 puntos en el subconjunto retenido de 141 items, p=0,73). No es estadisticamente significativa, pero incumple la regla estricta de "sin regresiones" fijada por el autor.
- Umbral de fuga no cumplido: 5 de 450 ejecuciones (1,11%) intentaron conexiones de red no solicitadas frente al umbral de <=1%; intervalo de confianza de Wilson al 95% [0,48%, 2,57%]. La transparencia es reporte, no una frontera de seguridad: debe ejecutarse siempre detras de un wrapper o firewall de red.
- Entorno de evaluacion simulado: las pruebas se realizaron en un entorno de herramientas mock con ventanas limitadas de red real; la tasa de fuga debe re-medirse en un test sellado de mayor tamano.
- Entrenado sobre la base v2 (con el adaptador de identidad fusionado), no sobre Qwen3-14B vanilla; la aceptacion del modelo fue una excepcion documentada por el autor.
- Idiomas limitados a italiano e ingles; no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinacion inherente al modelo base Qwen3-14B, no cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base no documentados especificamente para este adaptador.
- Licencia Apache-2.0: permite uso comercial, pero el autor recomienda encarecidamente el despliegue con control de red externo.
- Las metricas publicadas corresponden a bf16; el rendimiento sobre la cuantizacion GGUF Q4_K_M no ha sido medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/odelpa/qwen14-scienziato-v2-nt
- Modelo base v2 con identidad: https://huggingface.co/odelpa/qwen14-scienziato-v2
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Version Ollama: https://ollama.com/ollamagdp/qwen14-scienziato-v2-nt
- Articulo (Zenodo): https://doi.org/10.5281/zenodo.23950986
