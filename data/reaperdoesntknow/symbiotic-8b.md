# reaperdoesntknow/Symbiotic-8B

## Resumen

Symbiotic-8B es un ajuste fino del modelo Qwen3-8B publicado por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. El autor lo presenta como un modelo hibrido "simbolico-transformer" que anade al backbone Qwen3-8B una serie de modulos simbolicos (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor, HelicalDNAProcessor) y un buffer de memoria persistente de 2048 vectores, con el objetivo declarado de mejorar el razonamiento logico encadenado y la coherencia conversacional multi-turno.

El modelo conserva el tamano del base: 8.190.735.360 parametros en formato safetensors, lo que lo situa en la categoria de 8B densos. La model card menciona un dataset de ajuste fino centrado en razonamiento matematico (0xZee/dataset-CoT-Advanced-Calculus-268) y declara un unico idioma soportado, el ingles. La licencia es AFL-3.0, permisiva con obligaciones de atribucion y reciprocidad sobre modificaciones.

Es relevante ahora porque ejemplifica una tendencia creciente de ajustes finos comunitarios sobre Qwen3 que anaden capas de "memoria" o "razonamiento simbolico" sobre un transformer convencional. Conviene tratarlo con cautela: gran parte de las capacidades declaradas (procesadores simbolicos, Dream Mode, memoria entropica) no estan documentadas con detalle tecnico verificable ni respaldadas por benchmarks publicos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con modulos simbolicos anadidos segun el autor |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors, PyTorch (model.bin), memory.pt |
| Dimension simbolica | 4096 (declarada por el autor) |
| Memoria simbolica | 2048 vectores float32 |
| Tamano del repositorio | 43.1 GB |

## Arquitectura y entrenamiento

Segun la model card, el modelo parte del backbone rotary transformer de Qwen3-8B y le superpone cuatro modulos simbolicos: ThoughtDynamicsLNN (descrito como atencion LSTM multi-cabeza), CrystallineProcessor (GNN basada en DNAConv), LiquidThoughtProcessor (plegado recurrente de simbolos) y HelicalDNAProcessor (proyeccion lineal helicoidal). Ademas incorpora un buffer de memoria de 2048 vectores float32 con recuperacion "consciente de la entropia" y un modo offline denominado Dream Mode. No se especifica como se integran estos modulos en el grafo de computo ni si los pesos publicados contienen realmente estos componentes o solo el ajuste fino del transformer base.

El entrenamiento se realizo, segun los metadatos, sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, orientado a cadenas de pensamiento de calculo avanzado. No se documentan el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo RLHF, DPO o SFT supervisado. La model card indica explicitamente que el modelo no esta instruction-tuned, por lo que las entradas tipo chat pueden requerir ingenieria de prompts. Tampoco se aportan detalles sobre la innovacion tecnica del marco "Discrepancy Calculus" mas alla de referencias a documentos con DOI alojados en Hugging Face.

## Capacidades

- Generacion de texto conversacional en ingles sobre el backbone Qwen3-8B.
- Razonamiento simbolico y encadenamiento logico declarados por el autor (generacion de teoremas, pruebas, razonamiento estructurado).
- Razonamiento matematico, presuntamente reforzado por el dataset de calculo avanzado.
- Memoria persistente multi-turno mediante el buffer de 2048 vectores (segun el autor).
- Tokens especiales anadidos para estructuras simbolicas: `<THM>`, `<PROOF>`, `<D_EPS>`.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y multi-step reasoning: no confirmado; el autor menciona razonamiento encadenado pero sin documentacion tecnica.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Tutoria matematica asistida: el ajuste sobre cadenas de pensamiento de calculo avanzado permite generar explicaciones paso a paso de derivadas, integrales y demostraciones, aunque requiere prompts bien estructurados al no estar instruction-tuned.
- Asistente de investigacion con memoria de sesion: el buffer simbolico de 2048 vectores permitiria, segun el autor, retener contexto entre turnos en dialogos largos de caracter tecnico.
- Generacion de borradores de demostraciones formales: los tokens `<THM>` y `<PROOF>` sugieren un uso orientado a estructurar teoremas y pruebas, util en entornos de docencia o prototipado de asistentes matematicos.
- Prototipado de sistemas de razonamiento logico: como base para experimentar con marcos de memoria simbolica en investigacion academica, dado su caracter experimental.
- Generacion de texto tecnico en ingles: su herencia de Qwen3-8B le permite redactar documentacion o explicaciones tecnicas, siempre que se acepte la ausencia de ajuste instruccional.
- Base para nuevos ajustes finos: al estar disponible en safetensors y con licencia AFL-3.0, puede servir como punto de partida para experimentos de la comunidad sobre razonamiento simbolico.
- Evaluacion comparativa de marcos de memoria: util para investigadores que quieran contrastar el enfoque "Discrepancy Calculus" frente a transformers convencionales, con la cautela de la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16-17 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB (no se publican cuantizaciones oficiales, habria que generarlas).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de produccion; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16; en RTX 3090 (24 GB) con margen ajustado; en GPUs de 16 GB solo mediante cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no estan confirmados al no haber pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Symbiotic-8B | 8.19B | No disponible | AFL-3.0 | en | Ajuste fino experimental sobre Qwen3-8B con modulos simbolicos declarados |
| Qwen3-8B (base) | 8.19B | No disponible en esta ficha | Apache 2.0 (segun el modelo original) | Multilingue | Modelo base oficial, con benchmarks publicados y ecosistema amplio |
| Symbiotic-1B (mismo autor) | ~1B | No disponible | No disponible | en | Version reducida de la misma familia |
| Symiotic-14B (mismo autor) | ~14B | No disponible | No disponible | en | Version mayor de la familia, con muy pocas descargas |

La comparacion directa con el base Qwen3-8B es la mas relevante: el modelo original cuenta con evaluaciones publicas y soporte multilingue, mientras que Symbiotic-8B no aporta benchmarks propios y restringe el uso al ingles. Frente a otros ajustes finos comunitarios de Qwen3-8B, la propuesta destaca por su enfoque simbolico declarado, pero carece de validacion empirica en la informacion disponible.

## Limitaciones y advertencias

- No esta instruction-tuned: las entradas tipo chat requieren ingenieria de prompts y el formato conversacional puede degradar la calidad.
- Ausencia total de benchmarks publicados: las capacidades declaradas (razonamiento simbolico, memoria persistente, Dream Mode) no estan validadas de forma independiente.
- Documentacion tecnica incompleta: no se detalla como se integran los modulos simbolicos en el transformer ni si los pesos publicados los contienen realmente.
- Riesgo de alucinacion: inherente a los modelos de 8B y potencialmente agravado por el enfasis en razonamiento abstracto sin validacion.
- Limitacion idiomatica: solo declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia AFL-3.0: permite uso comercial pero impone obligaciones de atribucion y reciprocidad sobre modificaciones; conviene revisar los terminos antes de desplegar en produccion.
- El buffer de memoria puede incrementar la carga de CPU segun el propio autor, y la memoria simbolica requiere inicializacion activa ("seeding").
- Proyecto de un unico autor con muy pocas descargas (2614) y likes (8): riesgo de falta de mantenimiento y soporte.
- El marco "Discrepancy Calculus" se presenta como paper pendiente de publicacion; sus afirmaciones no son verificables actualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de ajuste: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus (DOI 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
