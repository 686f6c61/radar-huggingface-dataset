# maxiao123/CARE-Drive

## Resumen

CARE-Drive (Coupled Alternating Refinement for Ego-trajectories) es un modelo de vision-lenguaje-accion (VLA) orientado a la planificacion de trayectorias en conduccion autonoma. Lo desarrolla maxiao123 y se construye sobre el backbone Qwen3-VL-2B-Instruct, al que se anaden dos expertos especializados: un experto de posicion que corrige ocho waypoints futuros mediante residuos metricos acotados y un experto de heading que reconstruye la orientacion a partir de ocho incrementos angulares adyacentes condicionados a la trayectoria corregida. El modelo consume cuatro fotogramas historicos de tres camaras, historial de pose del ego, velocidad, aceleracion y un comando de ruta.

El modelo resuelve el problema del ego-trajectory planning en el benchmark NAVSIM v1, donde declara un PDMS de 88,837 sobre 12.146 escenas de navtest. La relevancia actual reside en que combina un backbone VLM preentrenado con modulos expertos ligeros y un esquema de refinamiento acoplado, lo que permite obtener predicciones metricas precisas sin depender de un modelo de mundo externo en inferencia (V-JEPA2.1 solo aporta objetivos de entrenamiento).

La release publica los pesos finales de inferencia de los tres componentes (backbone predictivo, experto de posicion y experto de heading) con licencia Apache 2.0, dtypes BF16/FP32 conservados y verificacion estricta de tensores frente a los checkpoints originales aceptados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone Qwen3-VL-2B-Instruct + experto de posicion (residuos XY) + experto de heading (incrementos angulares) |
| Parametros totales | Backbone Qwen3-VL-2B (tamano exacto no disponible) + 78.420.113 (experto de posicion) + 78.418.577 (experto de heading) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos exportados en BF16/FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints por componente); assets del backbone en `A0-DYNAMIC-L1/assets/` |

## Arquitectura y entrenamiento

CARE-Drive es un sistema compuesto por tres modulos entrenados en cadena. El backbone predictivo (etapa A0-DYNAMIC-L1, epoca 5) parte de Qwen3-VL-2B-Instruct y procesa la entrada multimodal: cuatro fotogramas historicos de tres camaras, historial de pose, velocidad, aceleracion y comando de ruta. Sobre sus representaciones, el experto de posicion (C3-XY-EP1, epoca 5) aplica correcciones residuales metricas acotadas a ocho waypoints futuros; el experto de heading (D1-H-ADAPT, epoca 5) reconstruye la orientacion a partir de ocho incrementos angulares adyacentes condicionados a la trayectoria ya corregida. La salida son ocho poses `(x, y, heading)` a intervalos de 0,5 s que cubren cuatro segundos, en el marco del eje trasero del ego, con metros para posicion y radianes para heading.

El backbone se entreno sobre 92.772 escenas y la cadena de expertos sobre 92.614 escenas puntuables. V-JEPA2.1 se emplea unicamente para generar objetivos de entrenamiento y no se necesita en inferencia. La release exporta los tensores finales preservando nombre, forma, valor y dtype de cada tensor (backbone en BF16/FP32, ambos expertos en FP32), omitiendo optimizador, scheduler, RNG y metadatos internos; se trata por tanto de una release de inferencia/inicializacion de modelo, no de reanudacion de optimizador.

## Capacidades

- Planificacion de ego-trayectoria: genera ocho poses futuras `(x, y, heading)` a 0,5 s de intervalo, cubriendo un horizonte de cuatro segundos.
- Percepcion multimodal: ingiere cuatro fotogramas historicos de tres camaras simultaneamente.
- Fusion de estado del ego: incorpora historial de pose, velocidad y aceleracion como senales de entrada.
- Seguimiento de instrucciones de ruta: acepta un comando de ruta que condiciona la planificacion.
- Refinamiento acoplado: corrige posiciones con residuos metricos acotados y deriva el heading de incrementos angulares condicionados a la trayectoria corregida.
- Inferencia autonoma: el bundle incluye tokenizer con tokens de consulta CARE-Drive, chat template y procesadores de imagen/video; no requiere pesos originales de Qwen ni V-JEPA en inferencia.
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Modo thinking, vision, audio adicional: vision integrada via backbone VLM; audio no disponible.

## Casos de uso

- Evaluacion comparativa en NAVSIM: ejecutar el pipeline de inferencia sobre manifiestos de navtest para reproducir el PDMS declarado y comparar variantes de arquitectura en el mismo protocolo de evaluacion.
- Investigacion en planificacion VLA: usar los tres checkpoints como linea base reproducible para estudiar el efecto del refinamiento acoplado posicion-heading frente a cabezas de regresion directa.
- Ablacion de modulos expertos: cargar backbone y expertos por separado para medir la contribucion de cada etapa (A0, C3, D1) al error metrico y angular.
- Prototipado de sistemas de conduccion en simulacion: integrar la salida de ocho poses como entrada a un controlador de bajo nivel en entornos simulados tipo NAVSIM.
- Destilacion y compresion: emplear los expertos FP32 de ~78 M parametros como profesores para modelos mas ligeros orientados a despliegue embarcado.
- Analisis de robustez multimodal: variar el numero o la calidad de los fotogramas historicos de camara para estudiar la sensibilidad de la trayectoria predicha.
- Verificacion de reproducibilidad: usar `checkpoint_manifest.json` (tamanos y SHA256) para auditar integridad de pesos en pipelines de investigacion.

## Benchmarks y rendimiento

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Ego-trajectory planning | NAVSIM v1 | navtest | PDMS | 88,836995 |

Los resultados proceden de la evaluacion oficial en CPU sobre 12.146 escenas de NAVSIM v1 navtest, tal como declara el autor. La entrada del `model-index` figura como no verificada (`verified: false`). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 9,6 GB e incluye backbone BF16/FP32 y dos expertos FP32 de ~78 M parametros cada uno.
- GPU recomendadas: no disponible. El autor menciona configuracion de dispositivo en `configs/inference.yaml` y un preflight de rendimiento (`CARE_DRIVE_PERFORMANCE_PREFLIGHT`), pero no especifica modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del bundle y los dtypes sugieren que requiere al menos una GPU con varios GB de VRAM libre, pero no hay cifra oficial.
- Opciones de despliegue: inferencia via CLI `python -m care_drive.infer` del repositorio CARE-Drive (version 0.1.1 o superior). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Existe un modo de ejecucion batch formal descrito en `docs/performance.md`, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Drive | Qwen3-VL-2B + 2 expertos (~78 M c/u) | no disponible | PDMS 88,837 (NAVSIM v1 navtest) | Apache 2.0 | Pesos en HF + codigo en GitHub |
| Alternativas de planificacion NAVSIM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables de la misma categoria (planificadores VLA para NAVSIM) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Benchmark no verificado: el resultado PDMS figura con `verified: false` en el `model-index`; la release no ha reejecutado navtest completo con los nuevos puntos de entrada.
- Dependencia de version: la carga standalone exige CARE-Drive 0.1.1 o superior y la revision de codigo compatible indicada por el autor.
- Idioma: solo se declara ingles; no hay soporte multilingue documentado.
- Contexto: la longitud de contexto del backbone no se especifica en la informacion disponible.
- Ambito restringido: modelo especializado en ego-trajectory planning; no es un asistente general ni dispone de tool calling ni capacidades de agente.
- Reproducibilidad de cohortes: los manifiestos exactos de cohorte no se incluyen en la release, lo que limita la reproduccion bit a bit del entrenamiento.
- Dtypes mixtos: backbone en BF16/FP32 y expertos en FP32; no se documentan recetas de cuantizacion para despliegue reducido.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al operar sobre datos de conduccion, hereda los sesgos de distribucion del dataset NAVSIM.
- Riesgo de alucinacion: no cuantificado; en planificacion de trayectoria, errores se manifiestan como desviaciones metricas o angulares, no como texto fabricado.
- Uso comercial: permitido bajo Apache 2.0, con las obligaciones habituales de atribucion y aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxiao123/CARE-Drive
- Repositorio de codigo: https://github.com/marshal12138/CARE-Drive
- Revision de codigo compatible: https://github.com/marshal12138/CARE-Drive/tree/5cab9d494eb16a3066f5c2d1e0665799a741f8b6
- Guia de entorno: https://github.com/marshal12138/CARE-Drive/blob/main/docs/environment.md
- Guia de datos: https://github.com/marshal12138/CARE-Drive/blob/main/docs/data.md
- Configuracion de rendimiento: https://github.com/marshal12138/CARE-Drive/blob/main/docs/performance.md
- Instrucciones de inferencia y evaluacion: https://github.com/marshal12138/CARE-Drive#4-inference-and-evaluation
- Checkpoint del backbone: https://huggingface.co/maxiao123/CARE-Drive/tree/main/A0-DYNAMIC-L1
- Experto de posicion: https://huggingface.co/maxiao123/CARE-Drive/blob/main/C3-XY-EP1/epoch_005.pt
- Experto de heading: https://huggingface.co/maxiao123/CARE-Drive/blob/main/D1-H-ADAPT/epoch_005.pt
- Manifiesto de checkpoints: https://huggingface.co/maxiao123/CARE-Drive/blob/main/checkpoint_manifest.json
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
