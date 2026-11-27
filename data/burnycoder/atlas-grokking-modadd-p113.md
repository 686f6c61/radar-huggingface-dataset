# BurnyCoder/atlas-grokking-modadd-p113

## Resumen

`atlas-grokking-modadd-p113` es un conjunto de tres checkpoints de un transformer de una sola capa entrenado desde cero sobre la tarea sintetica de suma modular `(a + b) mod 113`. Lo publica el usuario BurnyCoder como parte del proyecto *Atlas of Circuits & Manifolds*, una coleccion de artefactos reproducibles para investigacion en interpretabilidad mecanistica. No es un modelo de lenguaje: es un objeto de estudio disenado para replicar el fenomeno de *grokking* descrito por Nanda et al. (2023) en el paper "Progress measures for grokking via mechanistic interpretability" (arXiv:2301.05217).

El modelo tiene 1 capa, `d_model=128`, 4 cabezas de atencion de dimension 32, MLP de 512 unidades con activacion ReLU, sin normalizacion, vocabulario de entrada de 114 tokens y salida de 113 clases. El contexto es de solo 3 tokens (los dos sumandos y el token de respuesta). Se entrena con AdamW (lr 1e-3, weight decay 1.0, betas 0.9/0.98), batch completo y 40.000 epocas sobre un 30% de los pares posibles.

Su relevancia es puramente cientifica: proporciona pesos ya entrenados que exhiben el patron clasico de grokking (memorizacion temprana seguida de generalizacion tardia, con aparicion de circuitos basados en frecuencias de Fourier), lo que permite a investigadores reproducir analisis de circuitos, ablaciones y visualizaciones sin tener que reentrenar. Los tres seeds incluidos permiten estudiar la variabilidad entre ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 1 capa (HookedTransformer de TransformerLens) |
| Parametros totales | no disponible (estimable en el orden de 10^5 a partir de d_model=128, d_mlp=512, d_vocab=114, n_ctx=3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 3 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento) |
| Idiomas soportados | no aplica (tarea aritmetica sintetica, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |

## Arquitectura y entrenamiento

Transformer de una sola capa con atencion multi-cabeza (4 cabezas, `d_head=32`) y MLP (`d_mlp=512`, ReLU), sin capas de normalizacion. La entrada es una secuencia de longitud 3 que codifica los dos operandos y el token de respuesta; la salida es una distribucion sobre 113 clases (los residuos modulo 113). El vocabulario de entrada es de 114 tokens (113 residuos mas un token adicional) y el de salida de 113.

El entrenamiento sigue la configuracion de Nanda et al. (2023): AdamW con learning rate 1e-3, weight decay 1.0, betas (0.9, 0.98), batch completo y 40.000 epocas, usando solo el 30% de los pares `(a, b)` posibles como conjunto de entrenamiento. Segun la model card, los tres seeds memorizan en unos cientos de epocas y generalizan miles de epocas despues, apoyandose en un numero reducido de frecuencias de Fourier clave. Los checkpoints se guardan como `state_dict` compatibles con TransformerLens, lo que facilita el analisis con las herramientas estandar de interpretabilidad mecanistica (hooks, cache de activaciones, ablaciones).

## Capacidades

- Resolucion de la tarea `(a + b) mod 113` sobre el conjunto de test (pares no vistos durante el entrenamiento).
- Generalizacion tardia tras memorizacion inicial (comportamiento de grokking) en los tres seeds.
- Analisis de circuitos internos: al ser un `state_dict` de TransformerLens, permite inspeccionar atencion, MLP y representaciones residuales con hooks.
- Estudio de representaciones en frecuencias de Fourier y de las frecuencias clave identificadas por el autor.
- Reproduccion de ablaciones y curvas de progreso descritas en el paper de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Replicacion de grokking: cargar los tres checkpoints y reproducir las curvas de entrenamiento y generalizacion del paper de Nanda et al. sin reentrenar, comparando seeds para medir variabilidad.
- Analisis de circuitos de Fourier: extraer pesos de atencion y MLP para verificar la presencia de las frecuencias clave y su contribucion a la prediccion mediante ablaciones selectivas.
- Docencia en interpretabilidad mecanistica: usar un modelo diminuto y una tarea cerrada para ensenar tecnicas de analisis de circuitos con TransformerLens en un entorno controlado.
- Validacion de metodologias: servir como caso de prueba reproducible para nuevas herramientas o metricas de interpretabilidad antes de aplicarlas a modelos grandes.
- Estudio de weight decay y regularizacion: el valor atipico de weight decay 1.0 y el regimen de entrenamiento permiten investigar su efecto en la transicion de memorizacion a generalizacion.
- Reproduccion de resultados: verificar independientemente las afirmaciones del paper original sobre medidas de progreso y formacion de circuitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona cualitativamente que los tres seeds memorizan en unos cientos de epocas y generalizan miles de epocas despues, pero no proporciona cifras de accuracy, loss ni curvas numericas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuracion razonable; el modelo es de escala juguete.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: PyTorch nativo y TransformerLens (formato de los `state_dict`); no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 1 capa y contexto 3, la inferencia es practicamente instantanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atlas-grokking-modadd-p113 | no disponible (escala ~10^5) | 3 tokens | `(a+b) mod 113` | MIT | Hugging Face |
| Modelos de grokking de Nanda et al. (2023) | configuracion equivalente | 3 tokens | `(a+b) mod 113` | no disponible | codigo del paper, no pesos publicados de forma estandar |
| Otros artefactos del Atlas of Circuits & Manifolds | variable segun entrada | variable | tareas sinteticas | MIT (segun repo) | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: modelos diminutos entrenados sobre una tarea sintetica, no aptos para ningun uso downstream.
- Sin capacidades de lenguaje natural, vision, audio ni tool calling.
- No debe evaluarse con benchmarks de LLM; las metricas relevantes son de generalizacion en la tarea modular y de estructura interna.
- Posibles sesgos: ninguno conocido mas alla de los derivados de la tarea sintetica y del conjunto de entrenamiento del 30%.
- Riesgo de alucinacion: no aplica en el sentido habitual; el modelo solo produce una clase entre 113.
- Restricciones de licencia: MIT, permite uso comercial y modificacion, pero el modelo no tiene aplicacion comercial practica.
- Requiere reconstruir la arquitectura con el codigo del repositorio (`src/atlas/entries/grokking.py`) antes de cargar el `state_dict`; no es cargable directamente con `from_pretrained` de Transformers.
- El tamano del repo aparece como 0.0 GB en la informacion de Hugging Face, lo que puede indicar metadatos incompletos o pesos no subidos en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/atlas-grokking-modadd-p113
- Repositorio del proyecto: https://github.com/BurnyCoder/circuits-and-manifolds-in-llms-atlas
- Entrada interactiva del atlas: https://burnycoder.github.io/circuits-and-manifolds-in-llms-atlas/#/entry/grokking
- Paper de referencia: https://arxiv.org/abs/2301.05217
