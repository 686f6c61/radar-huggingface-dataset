# Aptheos/lfm3-vl-2b-click-sequence-sft

## Resumen

Aptheos/lfm3-vl-2b-click-sequence-sft es un adaptador LoRA de tipo PEFT sobre el modelo base LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de 2.000 millones de parametros desarrollado por Liquid AI. El adaptador ensena al modelo a operar una pagina web a partir unicamente de capturas de pantalla, sin arbol de accesibilidad ni identificadores de elementos, emitiendo coordenadas de clic normalizadas en un rango de 0 a 1000 en cada eje.

El problema que aborda es concreto: control visual de interfaces para tareas de secuencia de clics. En el entorno MiniWoB++ `click-button-sequence`, el modelo debe pulsar el boton etiquetado ONE y despues el etiquetado TWO, con independencia de su posicion en la pagina. El adaptador demuestra que un modelo de vision de 2B puede aprender secuencias visuales cortas a partir de unos pocos cientos de turnos etiquetados.

Es relevante ahora porque evidencia empirica de este tipo sobre modelos pequenos es escasa: el adaptador pasa de 0/100 a 95/100 en decodificacion greedy sobre tareas reservadas, y la variante entrenada con GRPO alcanza 83/100 en muestreo. El repositorio incluye tanto el adaptador SFT como el resultado posterior de GRPO y el adaptador previo de un solo clic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje LFM3-VL-2B; solo se entrena el modelo de lenguaje, torre de vision congelada |
| Parametros totales | No disponible (adaptador LoRA r=32, alpha=64; el modelo base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors; el base en FP16 en la evaluacion) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (heredada del modelo base; etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado exclusivamente al modelo de lenguaje del LFM3-VL-2B; la torre de vision permanece congelada. Se entreno con FP16 en el modelo base y adaptador en float32, con una tasa de aprendizaje de 1e-4 decreciente de forma lineal hasta cero, 117 actualizaciones y semilla 23, en una unica GPU T4 gratuita. El punto de partida fue un adaptador previo de un solo clic (`click-color-sft`). El conjunto de entrenamiento consta de 234 turnos expertos procedentes de 117 tareas (semillas 120-239), donde el experto pulsa el punto visible mas cercano al centro de cada boton segun el hit test del navegador; se descartaron tres disposiciones en las que el boton ONE quedaba completamente cubierto.

Cada ejemplo de entrenamiento reproduce exactamente la captura de pantalla y el prompt que la politica ve en ese turno: la instruccion mas los clics anteriores en texto. El repositorio incluye ademas una segunda etapa con un GRPO simplificado sobre la recompensa propia de la tarea: para cada una de 120 tareas de entrenamiento se muestrearon 4 episodios a temperatura 1, ponderando cada turno por la recompensa del episodio menos la media de su grupo, sin clipping, sin penalizacion KL y sin escalado por desviacion tipica. Se saltaron los grupos con recompensas iguales; 39 grupos presentaron variacion.

## Capacidades

- Control visual de paginas web a partir de capturas de pantalla, sin arbol de accesibilidad ni selectores DOM.
- Emision de secuencias cortas de clics (hasta cuatro) con coordenadas normalizadas de 0 a 1000 por eje.
- Seguimiento de instrucciones multi-turno: el prompt incluye los clics anteriores como texto.
- Formato de llamada a herramienta (click tool) con parser estricto asociado en el repositorio de referencia.
- Capacidad de vision: las predicciones dependen de los pixeles (0/100 aciertos con imagen blanca).
- Razonamiento visual de posicionamiento relativo entre elementos solapados.
- No dispone de capacidades de codigo, matematicas, audio ni agentes generales mas alla del alcance descrito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion de pruebas de interfaz web: el adaptador puede integrarse en pipelines de QA para pulsar secuencias de botones a partir de capturas, sustituyendo selectores fragiles por percepcion visual directa.
- Agentes de navegacion ligeros en dispositivos con recursos limitados: al tratarse de un adaptador sobre un modelo de 2B, puede desplegarse en una unica GPU T4 para tareas de clic acotadas.
- Investigacion en computer-use con modelos pequenos: sirve como referencia reproducible para estudiar cuanto puede aprender un VLM de 2B con unos cientos de turnos etiquetados.
- Generacion de datos sinteticos de interaccion: el adaptador puede producir trayectorias de clic sobre entornos MiniWoB para aumentar datasets de entrenamiento de agentes mayores.
- Evaluacion de robustez de formato: la comparacion SFT frente a GRPO documentada en el repositorio permite estudiar como el refuerzo corrige llamadas malformadas sin degradar el decodificado greedy.
- Prototipado de asistentes de accesibilidad: un sistema que traduzca instrucciones en lenguaje natural a clics sobre elementos visuales podria apoyarse en este adaptador como componente de percepcion-accion.
- Docencia sobre PEFT y RLHF ligero: el repositorio incluye los informes de evaluacion, hashes y scripts, lo que lo hace util como caso de estudio completo de SFT mas GRPO.

## Benchmarks y rendimiento

Evaluacion sobre 100 tareas reservadas (semillas 21000-21099), realizada una sola vez tras bloquear protocolo, hash de politica y decodificadores:

| Politica | Greedy | Muestreo (temp. 1, top_p 0,95) | Imagen blanca |
|---|---|---|---|
| LFM3-VL-2B base | 0/100 | 0/100 | 0/100 |
| Este adaptador (SFT) | 95/100 (IC 95%: 89-98%) | 21/100 (14-30%) | 0/100 |

Segunda evaluacion bloqueada sobre 100 tareas nuevas (semillas 22000-22099) para la variante SFT y la SFT+GRPO:

| Politica | Muestreo (temp. 1) | Llamadas validas (muestreo) | Greedy | Imagen blanca |
|---|---|---|---|---|
| SFT | 26/100 | 30 | 91/100 | 0/100 |
| SFT + GRPO | 83/100 (75-89%) | 94 | 92/100 | 0/100 |

Comparaciones estadisticas reportadas: el adaptador SFT supera al base en 21 tareas y no pierde en ninguna (test de signos exacto, p ≈ 1e-6). GRPO frente a SFT en muestreo: 57 victorias y 0 derrotas (p ≈ 1e-17). El adaptador previo `click-color-sft` obtuvo 100/100 frente a 30/100 del base en tareas reservadas de `click-color`, aunque el base ya elegia la caja correcta en el 97% de sus llamadas validas.

## Requisitos de hardware

- VRAM estimada: el adaptador anade un sobrecoste minimo; el modelo base de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM. En cuantizacion de 4 bits podria reducirse por debajo de 3 GB, aunque no se han publicado mediciones especificas para este adaptador.
- GPU recomendadas: los numeros del autor se generaron en una NVIDIA T4. Cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) deberia poder ejecutar el modelo base en FP16 o BF16.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: Transformers 5.21.0 con Torch 2.14.1, atencion SDPA, PEFT para cargar el adaptador. El modelo base usa codigo remoto (`trust_remote_code=True`), lo que exige revision previa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre LFM3-VL-2B) | 2B (base) + LoRA r32 | No disponible | Control web por captura, secuencias de clic | lfm1.0 | HuggingFace, PEFT |
| LFM3-VL-2B base | 2B | No disponible | VLM generalista | lfm1.0 | HuggingFace |
| Adaptador `click-color-sft` (mismo autor) | 2B (base) + LoRA | No disponible | Un solo clic sobre color | lfm1.0 | Incluido en el repositorio |
| Otros adaptadores de computer-use sobre VLM pequenos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la informacion proporcionada, por lo que la comparativa se limita a variantes del mismo autor y modelo base.

## Limitaciones y advertencias

- Alcance muy restringido: una unica familia de tareas MiniWoB (`click-button-sequence`), con un maximo de cuatro clics. No es un agente de computer-use general.
- El rendimiento en muestreo del adaptador SFT es bajo (21-26/100) y la mayoria de fallos son llamadas malformadas, no clics incorrectos; la variante GRPO corrige esto y es la recomendada para despliegue con muestreo.
- Riesgo de alucinacion de coordenadas fuera del rango valido o de formato de llamada incorrecto si no se usa el parser estricto del repositorio.
- Dependencia de los pixeles: con imagenes en blanco el modelo acierta 0/100, lo que confirma que no hay atajos, pero tambien implica que capturas degradadas o de baja resolucion pueden degradar el rendimiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia lfm1.0: es necesario revisar los terminos del modelo base LiquidAI/LFM3-VL-2B antes de cualquier uso comercial; el adaptador hereda esas restricciones.
- El modelo base emplea codigo remoto (`trust_remote_code=True`), lo que introduce riesgos de seguridad que deben auditarse antes de ejecutar en produccion.
- Solo se publica el checkpoint final del entrenamiento SFT; no hay informacion sobre variabilidad entre semillas ni sobre el impacto de hiperparametros.
- Idiomas soportados no documentados; el adaptador se entreno con prompts en ingles presumiblemente, aunque esto no se explicita.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Aptheos/lfm3-vl-2b-click-sequence-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio de codigo (prompt, herramienta de clic, parser, evaluacion): https://github.com/DerrickKirimi/browser-control
- Entorno MiniWoB++ `click-button-sequence`: https://miniwob.farama.org/environments/click-button-sequence/
- Entorno MiniWoB++ `click-color`: https://miniwob.farama.org/environments/click-color/
