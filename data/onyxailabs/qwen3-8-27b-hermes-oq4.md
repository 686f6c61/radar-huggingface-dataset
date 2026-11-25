# OnyxAILabs/Qwen3.8-27B-Hermes-oQ4

## Resumen
OnyxAILabs/Qwen3.8-27B-Hermes-oQ4 es un checkpoint fusionado, cuantizado y listo para servir que combina tres trabajos previos sin modificar sus componentes: el modelo base Qwen/Qwen3.8-27B (modelo denso vision-lenguaje con arquitectura Qwen3.5), la conversion mixta MLX oQ4 de Ash Hart (TensorFold/Qwen3.8-27B-oQ4) y el adaptador LoRA Hermes de Nous Research (harness-hub/Qwen3.8-27B-hermes-adapted), fusionado a nivel de pesos con r=32 y alpha=64.

El modelo resuelve dos problemas practicos: por un lado, permite ejecutar un modelo de 27.356 millones de parametros en Apple Silicon con un peso de aproximadamente 16,6 GB gracias a la cuantizacion oQ4 mixta; por otro, incorpora el ajuste del adaptador Hermes, entrenado con RL sobre el harness Hermes Agent, que segun la model card alcanza la precision del modo thinking a maxima intensidad pero con thinking desactivado y generando entre 3,5 y 4,4 veces menos tokens por tarea.

La propuesta de valor se completa con el drafter DFlash2 (block-diffusion, 7 tokens de borrador por pasada) servido mediante el motor TensorFold 1.3.0 sobre Metal, con decodificacion sin perdida (greedy identico al objetivo, muestreo que preserva la distribucion). El autor reporta aproximadamente 234 tok/s en codigo greedy y unos 90 tok/s en prosa greedy sobre un Mac Studio con M5 Ultra y 256 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` / `Qwen3_5ForConditionalGeneration`; 64 capas (48 GatedDeltaNet de atencion lineal + 16 de atencion completa), hidden 5120, vocab 248.320 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (maximo configurado) |
| Tipos de cuantizacion | oQ4 mixta afin, grupo 64; 160 modulos a 5 bits, 1 modulo a 6 bits, base a 4 bits |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors, 4 shards, 2.180 tensores (torre de vision intacta: 333 tensores) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer denso con torre de vision, construido sobre la arquitectura Qwen3.5. Combina 48 capas con GatedDeltaNet (atencion lineal) y 16 capas con atencion completa, con un hidden de 5120 y un vocabulario de 248.320 tokens. El checkpoint aqui descrito conserva la torre de vision intacta y aplica una cuantizacion mixta oQ4: base de 4 bits con 160 modulos sensibles elevados a 5 bits y uno a 6 bits, con tamano de grupo 64.

Sobre esa base cuantizada se fusiona a nivel de pesos el adaptador LoRA Hermes de Nous Research (r=32, alpha=64, escala 2.0) en 256 modulos objetivo, de modo que no se necesita cargar ningun LoRA en tiempo de servicio. El adaptador fue entrenado con RL sobre el harness Hermes Agent; la model card indica que, con thinking desactivado, iguala la precision del base con thinking a maxima intensidad generando muchas menos tokens. La decodificacion acelerada corre a cargo del drafter DFlash2 (`z-lab/Qwen3.8-27B-DFlash2`, 7 tokens de borrador por pasada) sobre el motor TensorFold 1.3.0 con backend Metal, y es sin perdida. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion del dataset del modelo base.

## Capacidades
- Generacion de texto conversacional y razonamiento de nivel agentico, con modo thinking opcional (aunque el autor recomienda mantenerlo desactivado).
- Capacidades de vision: la torre de vision se conserva intacta en el checkpoint cuantizado.
- Tool calling / function calling: verificado a traves del drafter (`get_weather({"city":"Reykjavik"})` con `finish_reason=tool_calls`).
- Ejecucion de tareas de agente multi-paso bajo el harness Hermes Agent, con menos turnos y menos tokens por tarea resuelta.
- Generacion de codigo: el autor valido coherencia generando un LRU cache thread-safe con su suite de unittest.
- Multilingue limitado a ingles y chino.
- Contexto largo de hasta 262.144 tokens para tareas de agente y conversaciones multi-turno extensas.
- Decodificacion especulativa sin perdida mediante DFlash2.

## Casos de uso
- Agente de codigo en local sobre Apple Silicon: servir el bundle con TensorFold y DFlash2 y apuntar un cliente compatible con OpenAI para tareas de reparacion de bugs y edicion multi-archivo; el adaptador Hermes esta ajustado para reducir turnos y tokens por tarea, y el rendimiento reportado en codigo greedy ronda los 234 tok/s.
- Automatizacion de terminal y operaciones: uso del modelo como agente que ejecuta comandos y verifica resultados; la model card reporta mejoras del adaptador en Terminal-Bench 2.1, lo que encaja con flujos de administracion de sistemas asistida.
- Asistente de desarrollo con privacidad de datos: al ejecutarse integramente en hardware local (unos 30 GB residentes con paralelismo 1), permite procesar codigo propietario sin enviarlo a APIs externas.
- Tool calling en pipelines internos: integracion como motor de function calling en servicios que necesitan invocar herramientas con argumentos estructurados, aprovechando el soporte verificado de `tool_calls`.
- Procesamiento de documentos largos con vision: la ventana de 262.144 tokens y la torre de vision intacta permiten analizar capturas, diagramas o documentos extensos junto con texto en una sola sesion.
- Prototipado de agentes de investigacion: el modo thinking desactivado con precision equiparable al thinking a maxima intensidad reduce coste y latencia en bucles de razonamiento multi-paso, util para experimentacion academica en entornos con presupuesto limitado.
- Generacion de prosa y documentacion tecnica: aunque el rendimiento baja a unos 90 tok/s greedy en prosa, sigue siendo viable para redaccion asistida en local con contexto largo.

## Benchmarks y rendimiento

Resultados publicados por harness-hub / Nous Research sobre los pesos BF16 del modelo base bajo el harness Hermes Agent (un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens, thinking off, T=0.8). No remedidos sobre esta build oQ4.

| Benchmark | Qwen3.8-27B base | + adaptador Hermes (thinking off) | Delta |
|---|---:|---:|---:|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | +13,7 |
| Terminal-Bench 2.1 (85 evaluadas) | 44,7% | 58,8% | +14,1 |

Rendimiento medido por el autor sobre esta build (Mac Studio M5 Ultra, 256 GB, TensorFold 1.3.0, DFlash2, `--no-thinking --context 262144 --parallel 1`):

| Carga | tok/s | Metodo |
|---|---:|---|
| Codigo, greedy (900 tokens sostenidos) | ~234 | T=0, reloj de pared |
| Codigo, muestreado (T=0,7) | ~181 | reloj de pared |
| Prosa, greedy | ~90 (88-105) | T=0, caliente, n=3 |
| Prosa, muestreado (T=0,7) | ~82 | reloj de pared |
| oMLX oQ6 sin drafter (referencia) | ~40 | misma maquina |

La aceleracion reportada es de aproximadamente 5,8x en codigo y 2,2x en prosa frente a decodificacion simple. La memoria residente es de unos 30 GB con paralelismo 1 y unos 69 GB con paralelismo automatico y KV completo de 262k.

## Requisitos de hardware
- Memoria unificada: aproximadamente 30 GB con paralelismo 1; aproximadamente 69 GB con paralelismo automatico y KV completo de 262.144 tokens.
- Hardware de referencia: Mac Studio con Apple M5 Ultra y 256 GB de memoria unificada.
- El autor advierte que M5 Max/Pro y las generaciones M1-M4 son mas lentos por estar limitados por ancho de banda de memoria.
- No cabe en GPUs consumer tipo RTX 4090 por el formato MLX y el backend Metal; el formato esta orientado exclusivamente a Apple Silicon.
- Motor de despliegue: TensorFold 1.3.0 (Apache-2.0) con backend Metal, mas el drafter DFlash2 servido en paralelo.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Throughput estimado: ~234 tok/s en codigo greedy, ~181 en codigo muestreado, ~90 en prosa greedy y ~82 en prosa muestreada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| OnyxAILabs/Qwen3.8-27B-Hermes-oQ4 | 27,36B | 262.144 | oQ4 mixta, MLX safetensors | Apache-2.0 | Adaptador Hermes fusionado, drafter DFlash2, orientado a Apple Silicon |
| Qwen/Qwen3.8-27B | 27,36B (no confirmado en la informacion) | no disponible | BF16 original | Apache-2.0 | Modelo base sin ajuste de harness; sirve como referencia de calidad |
| TensorFold/Qwen3.8-27B-oQ4 | 27,36B (no confirmado) | no disponible | oQ4 mixta, MLX | Apache-2.0 | Conversion cuantizada sin el adaptador Hermes |
| harness-hub/Qwen3.8-27B-hermes-adapted | no disponible | no disponible | LoRA r=32, alpha=64 | no disponible | Adaptador sin fusionar; requiere cargarse en tiempo de servicio |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros fabricantes del mismo tamano o categoria.

## Limitaciones y advertencias
- La cuantizacion oQ4 es con perdida; el autor advierte de una divergencia de unos pocos puntos porcentuales respecto a los pesos BF16 y recomienda validar sobre la carga de trabajo propia antes de produccion.
- Los benchmarks de SWE-bench Pro y Terminal-Bench 2.1 corresponden al adaptador sobre BF16 y no se han remedido sobre esta build oQ4; la calidad del bundle se valido solo con comprobaciones de coherencia y tool calling.
- Mantener el modo thinking desactivado: con thinking activado no es significativamente mas preciso, genera unas 3 veces mas tokens y bajo Hermes Agent agota el contexto.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- El formato MLX y el motor TensorFold restringen el despliegue a Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama.
- Los datos de rendimiento provienen de una unica maquina (M5 Ultra); no constituyen un benchmark multiplataforma.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible.
- Licencia Apache-2.0 en todos los componentes, lo que permite uso comercial; el autor indica que la tarjeta no relicencia nada de los trabajos upstream.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OnyxAILabs/Qwen3.8-27B-Hermes-oQ4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion cuantizada: https://huggingface.co/TensorFold/Qwen3.8-27B-oQ4
- Adaptador Hermes: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Blogpost del adaptador (harness-hub): no disponible como URL directa en la informacion proporcionada
- Motor TensorFold 1.3.0: no disponible como URL directa en la informacion proporcionada
