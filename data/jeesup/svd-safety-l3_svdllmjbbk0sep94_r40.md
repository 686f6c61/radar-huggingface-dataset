# Jeesup/svd-safety-l3_svdllmjbbk0sep94_r40

## Resumen

`svd-safety-l3_svdllmjbbk0sep94_r40` es un checkpoint experimental derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la tecnica SVD-LLM hasta conservar el 60,0% de los parametros densos (es decir, un 40,00% de parametros eliminados, fraccion resultante 0,5998). El autor, Jeesup, lo publica como artefacto de investigacion dentro de un estudio sistematico sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes lo repara mejor.

El modelo no es un asistente conversacional de proposito general: es una celda concreta de una malla experimental sobre reglas de seleccion y presupuestos de compresion. Tras la poda SVD se aplica una recuperacion de segunda etapa con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16.

Su relevancia es metodologica: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precision zero-shot en 7 tareas) y seguridad (tasa de exito de ataque en AdvBench y StrongREJECT, sobre-rechazo en WildGuard) bajo compresion, un eje poco cubierto en la literatura de eficiencia de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama-3-8B-Instruct: 8.192 tokens; el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (sin declaracion explicita; hereda el perfil multilingue de Llama 3) |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Llama 3 con 8.030 millones de parametros. La compresion se realiza con la SVD blanqueada de SVD-LLM (implementacion de AIoT-MLSys-Lab) sobre un conjunto de calibracion agrupado que combina utilidad y seguridad: la matriz de covarianza se estima como S·S^T = suma sobre WikiText x·x^T + suma sobre seguridad x·x^T. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 94 objetivos de JailbreakBench con los rechazos propios de Llama-3-8B-Instruct (orden con semilla 42), solo prompt y cabecera de asistente, una conversacion por muestra desempaquetada (2.363 posiciones). La cuota efectiva de seguridad es de solo 0,0045 de las posiciones.

Tras la poda se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con `alpaca-cleaned` (r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256, bf16). La semilla global es 42.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento de un solo turno y respuesta a instrucciones, con calidad degradada por la compresion.
- Capacidad multilingue no declarada explicitamente; se asume la del modelo base.
- Soporte de tool calling y function calling: no documentado en el checkpoint; se heredaria, en su caso, del formato de Llama 3.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles.
- Uso previsto real: sujeto experimental para medir seguridad y utilidad bajo compresion SVD.

## Casos de uso

- Investigacion sobre compresion de LLMs: sirve como celda de referencia en una malla de reglas de seleccion y presupuestos (aqui, 40% de parametros eliminados) para comparar curvas de utilidad frente a seguridad.
- Evaluacion de robustez frente a jailbreaks: con AdvBench ASR de 0,0462 y StrongREJECT ASR de 0,0831 medidos con el juez HarmBench, permite estudiar como la poda SVD altera la tasa de exito de ataque respecto al modelo denso.
- Analisis de sobre-rechazo: el valor de 0,1783 en sobre-rechazo macro (WildGuard) sirve para calibrar el equilibrio entre rechazar peticiones daninas y rechazar peticiones legitimas.
- Estudio de recuperacion con LoRA: la configuracion de etapa 2 (r=8, alpha=16, alpaca-cleaned) puede replicarse o modificarse para medir cuanto recupera la utilidad sin reintroducir vulnerabilidades.
- Benchmarking de perplejidad: con WikiText-2 en 27,6710 y precision media zero-shot de 0,4985 en 7 tareas, es util como punto de comparacion frente a otros metodos de poda (magnitud, Wanda, etc.).
- Docencia y reproducibilidad: al documentar calibracion, semilla y receta, permite reproducir el pipeline SVD-LLM de extremo a extremo en entornos de investigacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0462 |
| StrongREJECT ASR (juez HarmBench) | 0,0831 |
| Sobre-rechazo macro (WildGuard) | 0,1783 |
| Perplejidad WikiText-2 | 27,6710 |
| Precision media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4985 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin comprimir ni frente a otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16 GB solo para pesos, mas cache KV y activaciones; en la practica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-10 GB de pesos; en 4 bits, 5-6 GB (no se publican artefactos GGUF oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con vLLM o TGI; RTX 4090 (24 GB) suficiente en bf16 para un solo usuario.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, en tarjetas de 12-16 GB; no cabe en GPUs de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp u Ollama solo si se generan pesos GGUF por cuenta propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk0sep94_r40 | 8,03 B (60% denso) | no disponible | Llama 3 Community | Checkpoint experimental de investigacion en seguridad y compresion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | Sucesor con contexto extendido y mejoras de tool calling |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Alternativa abierta de tamano similar con licencia permisiva |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para una comparacion numerica directa.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la malla estan deliberadamente degradadas en seguridad; este checkpoint no debe tratarse como un asistente desplegable.
- La compresion por si sola eleva la tasa de exito de ataque; los valores de ASR medidos (0,0462 y 0,0831) deben interpretarse en ese contexto experimental.
- La cuota efectiva de datos de seguridad en la calibracion es minima (0,0045 de las posiciones), lo que limita la representatividad de la senal de seguridad.
- Riesgo de alucinacion no cuantificado en la informacion disponible; la poda al 60% puede incrementarlo respecto al modelo base.
- Idiomas soportados no declarados; el comportamiento multilingue puede diferir del modelo original.
- Restricciones de licencia: Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial esta sujeto a los terminos de Meta.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- No se publican pesos cuantizados ni artefactos GGUF; el despliegue eficiente requiere conversion propia.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk0sep94_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Paper SVD-LLM: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
