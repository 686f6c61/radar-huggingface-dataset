# AlphaChat-dotcom/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es una conversión a formato GGUF del drafter (modelo borrador) DFlash2 para Qwen3.8-27B, publicada por AlphaChat-dotcom. No se trata de un modelo generativo autónomo, sino de un componente de decodificación especulativa diseñado para acelerar la inferencia del modelo principal Qwen3.8-27B dentro del runtime AlphaLlama 2.0.9 o superior. El modelo original es de z-lab, y AlphaChat se ha limitado a cambiar el formato (de safetensors BF16 a GGUF) y a cuantizar las matrices de proyección a q5_K, sin reentrenar, ajustar ni podar nada.

El interés de esta publicación radica en que permite activar el "speed mode" de AlphaLlama en GPUs de consumo: según las mediciones del autor, en una RTX 3090 el throughput de decodificación pasa de 104-122 tok/s en modo rápido por defecto a 161-506 tok/s con este drafter, dependiendo del conjunto de pruebas. Es, por tanto, una pieza de infraestructura de inferencia más que un modelo de propósito general, y su relevancia depende por completo del ecosistema AlphaLlama.

El repositorio contiene únicamente el drafter (1,49 GB), que reutiliza en tiempo de ejecución el embedding y la cabeza de salida del GGUF de Qwen3.8-27B que cargue el usuario. La licencia declarada es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa paralela (DFlash2) sobre transformer; detalles internos no disponibles |
| Parametros totales | 1.924.404.480 (1,92 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q5_K en matrices de proyección; codebooks del selector en BF16; norms y kernels de convolución en F32 |
| Idiomas soportados | Inglés y alfabetos latinos; el código también. Los prompts en chino se derivan a decodificación secuencial y no se aceleran |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `dflash2-q5_K.gguf`, 1.490.791.072 bytes) |

## Arquitectura y entrenamiento

DFlash2 es un drafter de decodificación especulativa paralela: en lugar de proponer tokens de uno en uno, genera varios tokens candidatos simultáneamente que el modelo principal Qwen3.8-27B verifica después. La model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención ni esquema de selección más allá de la mención a "selector codebooks"). Lo que sí se especifica es que el drafter no incluye embedding ni cabeza de salida propios: en tiempo de ejecución toma prestados los del GGUF de Qwen3.8-27B cargado por el usuario, lo que explica su tamaño compacto de 1,92 mil millones de parámetros.

No hay información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO; todo ello corresponde al modelo original de z-lab, cuya model card no se ha proporcionado. La conversión de AlphaChat es puramente de formato y precisión: cada tensor se mantuvo en BF16 y se verificó bit a bit contra el origen antes de cuantizar las proyecciones a q5_K, dejando los codebooks del selector en BF16 y las normas y convoluciones en F32.

## Capacidades

- Decodificación especulativa paralela: propone varios tokens por paso para que Qwen3.8-27B los verifique, acelerando la generación.
- Aceleración de prompts en inglés y alfabetos latinos, incluido código.
- Enrutado selectivo: los prompts en chino se derivan automáticamente a decodificación secuencial con prompt lookup, sin aceleración por drafter.
- Integración con AlphaLlama 2.0.9+ mediante la variable `ALPHA_SPEED_MODE=1`.
- Detección automática y fallback: si el fichero no se encuentra, el servidor arranca con drafting secuencial e informa `"speed_drafter": "missing"` en `/health`.
- No es un modelo de chat, razonamiento, visión ni tool calling por sí mismo: hereda las capacidades del Qwen3.8-27B anfitrión.

## Casos de uso

- Servicio de inferencia interactiva de baja latencia: desplegar Qwen3.8-27B en una RTX 3090 con `ALPHA_SPEED_MODE=1` para reducir el tiempo hasta el primer token percibido en chat, gracias a los 161-506 tok/s medidos frente a 104-122 tok/s en modo por defecto.
- Generación de código en asistentes de IDE: el drafter acelera específicamente prompts en inglés y código, que es el caso dominante en autocompletado y generación de funciones.
- Backends de un solo stream: speed mode sirve una conversación a la vez, encajando en herramientas de desarrollo local, prototipado y agentes personales donde no se requiere concurrencia.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como banco de pruebas reproducible para medir el impacto de un drafter paralelo frente a decodificación greedy o secuencial.
- Reducción de coste por token en GPUs de gama alta de consumo: al multiplicar el throughput en una sola RTX 3090, disminuye el coste energético y de tiempo por petición en cargas de un solo usuario.
- Pipelines de generación de texto en inglés a granel (resúmenes, reescritura, extracción) donde el cuello de botella es la velocidad de decodificación y no la concurrencia.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de decodificación (tok/s) en RTX 3090 con AlphaLlama 2.0.9, para tres conjuntos de pruebas (A / V / R):

| Configuracion | Set A | Set V | Set R |
|---|---|---|---|
| Modo rápido por defecto | 104,3 | 109,5 | 122,0 |
| Speed mode con este drafter | 161,7 | 171,0 | 506,3 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo que es coherente con la naturaleza del artefacto: es un acelerador, no un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM adicional para el drafter: aproximadamente 1,5 GB en q5_K, sumados a los del GGUF de Qwen3.8-27B (el autor cita `Qwen3.8-27B-UD-Q4_K_M.gguf` como referencia probada).
- GPU probada: NVIDIA RTX 3090 (24 GB). No hay datos de otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 3090; el conjunto completo (27B en Q4_K_M más drafter) requiere una GPU de 24 GB.
- Sistema operativo: solo paquetes Linux de AlphaLlama 2.0.9+; los paquetes de Windows y macOS no ejecutan speed mode.
- Opciones de despliegue: exclusivamente AlphaLlama (`alphallama-serve`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 161,7 / 171,0 / 506,3 tok/s en los sets A / V / R, frente a 104,3 / 109,5 / 122,0 en modo por defecto.
- Latencia: no disponible de forma desagregada (solo throughput agregado).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-GGUF (este) | Drafter especulativo paralelo | 1,92 mil M | no disponible | Apache-2.0 | GGUF q5_K | AlphaLlama 2.0.9+ (Linux, NVIDIA) |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter especulativo paralelo (original) | no disponible | no disponible | Apache-2.0 | safetensors BF16 | no disponible |
| Drafters EAGLE / Medusa para Llama | Drafter especulativo | variable | no disponible | variable | safetensors / GGUF | llama.cpp, vLLM, TGI |
| Decodificación greedy sin drafter | Línea base | 0 | n/a | n/a | n/a | cualquiera |

La comparación cuantitativa de rendimiento con otros drafters no está disponible en la información proporcionada. La ventaja diferencial de este artefacto es su empaquetado GGUF q5_K listo para AlphaLlama; su limitación principal es la dependencia de un único runtime y de un único modelo anfitrión.

## Limitaciones y advertencias

- No es token-idéntico a la decodificación greedy: si se requiere reproducibilidad exacta hay que usar `--decode-mode exact` o `plain` sin speed mode.
- Sirve un único stream concurrente: no apto para servidores multiusuario con speed mode activado.
- Los prompts en chino no se aceleran; se derivan a decodificación secuencial con prompt lookup.
- Solo funciona con Qwen3.8-27B como modelo anfitrión; no es reutilizable con otros modelos.
- Solo disponible para Linux con GPU NVIDIA y AlphaLlama 2.0.9+; sin soporte en Windows ni macOS.
- El drafter no incluye embedding ni cabeza de salida: depende del GGUF del modelo principal en tiempo de ejecución.
- Riesgo de alucinación y sesgos: heredados del modelo anfitrión Qwen3.8-27B, no evaluables a partir de este artefacto.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo original de z-lab y la del Qwen3.8-27B utilizado.
- Repositorio sin descargas ni likes en el momento de la consulta y con parámetros internos no documentados: la madurez y el mantenimiento del artefacto no están contrastados.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/AlphaChat-dotcom/Qwen3.8-27B-DFlash2-GGUF
- Modelo original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Espejo del modelo original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Blog del autor original: https://inco.ai/blog/dflash2
- Código: https://github.com/z-lab/dflash
- Revisión del modelo original citada: `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`
