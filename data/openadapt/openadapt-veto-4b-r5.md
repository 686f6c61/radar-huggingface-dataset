# OpenAdapt/OpenAdapt-Veto-4B-r5

## Resumen

OpenAdapt-Veto-4B-r5 es un adaptador LoRA de 81,04 MB entrenado sobre el modelo base multimodal Qwen/Qwen3.5-4B, desarrollado por OpenAdapt para verificación visual de acciones en automatización de interfaces gráficas (GUI). Su función no es generar texto libre ni ejecutar acciones, sino actuar como guardián de cierre seguro (fail-closed) en los puntos de confirmación de flujos de automatización de escritorio y web, detectando fallos silenciosos de escritura en la interfaz: casos en los que la UI aparenta éxito pero la operación no se ha persistido realmente.

El modelo recibe una captura de pantalla posterior a la acción junto con un resumen del DOM o estado de la UI y emite un veredicto calibrado de tres vías (PASS, VETO o ABSTAIN) mediante decodificación restringida de tres tokens en un solo paso. Esta restricción reduce la latencia a 117,9 ms de mediana en una RTX PRO 6000 Blackwell, frente a los 240,9 ms de generación libre, con idéntica precisión. Está pensado para combinarse con la lectura determinista del sistema de registro de OpenAdapt (openadapt-flow / openadapt-verify), de modo que ABSTAIN siempre derive en HALT_ESCALATE.

Su relevancia actual radica en que aborda un problema específico y poco cubierto por los modelos generalistas: la verificación fiable de acciones en agentes de computer-use, con un coste de inferencia nulo en local (3,10 GB de VRAM en 4 bits NF4) y unas métricas declaradas de captura de fallos del 100 % en trampas visuales sobre un conjunto sintético de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, lora_alpha=32) sobre transformer multimodal Qwen/Qwen3.5-4B (image-text-to-text) |
| Parametros totales | No disponible (adaptador de 81,04 MB; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA con rango 16 y lora_alpha 32, aplicado sobre el modelo multimodal Qwen/Qwen3.5-4B, que procesa entradas de imagen y texto (pipeline image-text-to-text). La salida se restringe a un vocabulario efectivo de tres tokens (PASS, VETO, ABSTAIN) mediante decodificación restringida de un solo paso, lo que elimina la generación autoregresiva libre y reduce la latencia aproximadamente a la mitad.

El entrenamiento se realizó exclusivamente sobre 1.800 ejemplos sintéticos de formularios web renderizados con Playwright, sin datos de pacientes ni datos de clientes (zero PHI). Se aplicó una ponderación asimétrica de la pérdida de 6,0x sobre los falsos aceptados, es decir, se penaliza mucho más dejar pasar un fallo que rechazar una acción correcta, en coherencia con el diseño fail-closed. El entrenamiento consistió en 2 épocas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Verificación visual de acciones GUI: dado un screenshot posterior a la acción y un resumen del DOM o de la UI, emite un veredicto PASS, VETO o ABSTAIN.
- Detección de fallos silenciosos de escritura en seis clases de fallo, incluyendo mutaciones no vinculadas, reinicios de sesión, banners sin etiquetar, valores truncados y estados ocluidos o ambiguos.
- Decodificación restringida de tres tokens con calibración de temperatura (1,30) para veredictos estables.
- Integración con lectura determinista del sistema de registro (openadapt-flow / openadapt-verify) para cubrir rollbacks invisibles en backend.
- Capacidad multimodal de entrada: imagen (PNG de 960x640) más texto estructurado (DOM, URL).
- No es un modelo generativo de propósito general: no se documentan capacidades de razonamiento abierto, código, matemáticas, tool calling ni agentes multi-paso más allá de su función de verificación.

## Casos de uso

- Automatización de escritorio con cierre seguro: el modelo se sitúa en el punto de confirmación de cada acción de escritura y veta o escala cuando la captura posterior no evidencia el cambio esperado, evitando que un agente continúe sobre un estado inconsistente.
- RPA en formularios web críticos: tras enviar un formulario, se compara la captura con el DOM esperado; con 117,9 ms de latencia p50 encaja en bucles de automatización con requisitos de tiempo real.
- Agentes de computer-use en producción: actúa como capa de verificación entre el agente y el sistema de registro, con la política ABSTAIN -> HALT_ESCALATE para derivar casos ambiguos a revisión humana.
- Auditoría de flujos existentes: se puede ejecutar en modo offline sobre capturas históricas para medir la tasa de fallos silenciosos de un pipeline ya desplegado.
- Despliegue en hardware de gama media: con 3,10 GB en 4 bits NF4 cabe en GPUs de consumo, lo que permite verificación local sin enviar capturas de pantalla a APIs en la nube (relevante por privacidad).
- Calibración por aplicación: el flujo de calibración online sin PHI de OpenAdapt permite ajustar el modelo con 10-25 ejemplos por app para reducir falsos vetos en temas de UI fuera de distribución.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto sintético zero-PHI. La tabla de 50 trampas incluye 35 trampas de fallo silencioso (6 clases) y 15 controles limpios.

| Modelo | Modo | VRAM | Latencia p50 | Captura 30 trampas visuales | Captura global 35 trampas | Falso veto (15 limpios) | Cobertura 0-WA | Coste / 1k |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| OpenAdapt-Veto-4B-r5 + lectura híbrida | 4-bit NF4 + ABSTAIN->HALT + read-back | 3,10 GB | 117,9 ms | 100,0 % (30/30) | 100,0 % (35/35) | 20,0 % (3/15) | 80,0 % (12/15) | 0,00 $ |
| OpenAdapt-Veto-4B-r5 (visual autónomo) | 4-bit NF4, 3 tokens restringidos | 3,10 GB | 117,9 ms | 100,0 % (30/30) | 88,6 % (31/35) | 20,0 % (3/15) | 0,0 % | 0,00 $ |
| OpenAdapt-Veto-9B-v4 + lectura híbrida | 4-bit NF4 (L4) | 6,62 GB | 1102,5 ms | 100,0 % (30/30) | 100,0 % (35/35) | 20,0 % (3/15) | 80,0 % (12/15) | 0,00 $ |
| openai:gpt-4o-mini | API en la nube | — | 1087,3 ms | — | 91,4 % (32/35) | 20,0 % (3/15) | 0,0 % | 3,89 $ |
| anthropic:claude-sonnet-4-5 | API en la nube | — | 2579,7 ms | — | 91,4 % (32/35) | 26,7 % (4/15) | 0,0 % | 4,63 $ |
| anthropic:claude-haiku-4-5 | API en la nube | — | 1494,1 ms | — | 88,6 % (31/35) | 20,0 % (3/15) | 0,0 % | 1,28 $ |
| gemini:gemini-2.5-flash | API en la nube | — | 2720,9 ms | — | 85,7 % (30/35) | 0,0 % (0/15) | 0,0 % | 0,12 $ |
| openai:gpt-4o | API en la nube | — | 1061,2 ms | — | 85,7 % (30/35) | 6,7 % (1/15) | 0,0 % | 3,00 $ |
| LiquidAI/LFM2.5-VL-3B (zero-shot) | 4-bit NF4 | 1,88 GB | 92,2 ms | 3,3 % (1/30) | 2,9 % (1/35) | 0,0 % (0/15) | 0,0 % | 0,00 $ |
| thinkingmachines/Inkling-2-Mini (zero-shot) | Nativo | 50,40 GB | 281,6 ms | 100,0 % (30/30) | 100,0 % (35/35) | 100,0 % (15/15) | 0,0 % | 0,00 $ |

Evaluación en navegador real no visto (n=600; dark_saas_dashboard + hidpi_scaled_portal), medida directamente sobre este checkpoint:

| Métrica | Valor |
|---|---|
| Precisión exacta autónoma | 96,67 % (frente a 42,50 % del Qwen3.5-9B zero-shot) |
| Tasa de falso aceptado autónoma | 2,86 % (12/420; 11 de 12 fallos en visual_homoglyph_o0_l1) |
| Tasa de falso veto en limpios | 4,44 % (8/180) |
| Híbrido ABSTAIN->HALT + read-back | 100,0 % de captura de fallos (0/420 falsos aceptados) con 95,56 % de cobertura de aceptación en limpios |
| Latencia | 152,6 ms p50 (decodificación restringida de 3 tokens en RTX PRO 6000 Blackwell) |

## Requisitos de hardware

- VRAM estimada: 3,10 GB en cuantización 4 bits NF4 (adaptador de 81,04 MB más el modelo base Qwen3.5-4B cuantizado).
- GPU recomendadas: RTX PRO 6000 Blackwell (referencia de las mediciones); cualquier GPU con al menos 4-6 GB de VRAM efectiva para el modelo base en 4 bits.
- Cabe en GPUs de consumo: sí, con 4 bits NF4 en tarjetas de gama media con 6 GB o más de VRAM.
- Opciones de despliegue: transformers + peft + bitsandbytes (documentado en el quickstart); no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 117,9 ms p50 en el benchmark de 50 trampas y 152,6 ms p50 en la evaluación Playwright, ambos con decodificación restringida de 3 tokens en RTX PRO 6000 Blackwell; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAdapt-Veto-4B-r5 | 4B (adaptador LoRA 81 MB) | No disponible | 100 % captura visual (30/30); 96,67 % precisión exacta en Playwright | Apache 2.0 | Hugging Face, local |
| OpenAdapt-Veto-9B-v4 | 9B | No disponible | 100 % captura con lectura híbrida; 1102,5 ms p50 | No disponible | Local |
| LiquidAI/LFM2.5-VL-3B | 3B | No disponible | 3,3 % captura visual zero-shot | No disponible | Hugging Face |
| thinkingmachines/Inkling-2-Mini | No disponible | No disponible | 100 % captura, 100 % falso veto en limpios; 50,40 GB VRAM | No disponible | Local |

Frente a APIs en la nube (gpt-4o, claude-sonnet-4-5, gemini-2.5-flash), el modelo ofrece latencias entre 9 y 23 veces menores, coste cero por inferencia y una tasa de captura superior en el conjunto sintético, a cambio de estar especializado exclusivamente en verificación visual de GUI.

## Limitaciones y advertencias

- Los rollbacks invisibles en backend no son detectables solo con visión: es obligatorio emparejar el modelo con la lectura determinista del sistema de registro (openadapt-flow / openadapt-verify).
- Fuentes con homoglifos minúsculos: en temas oscuros o HiDPI no vistos, visual_homoglyph_o0_l1 concentra 11 de los 12 falsos aceptados autónomos; se recomienda recorte GOLD de la región de interés en pantallas de más de 1024 px de ancho.
- Falsos vetos en aplicaciones fuera de distribución: se espera entre un 4 % y un 20 % de vetos conservadores hasta calibrar con 10-25 ejemplos específicos por aplicación.
- Entrenamiento limitado a 1.800 ejemplos sintéticos de formularios web renderizados con Playwright; la generalización a otros tipos de UI (escritorio nativo, aplicaciones móviles) no está validada en la información disponible.
- La evaluación declarada es 100 % sintética y zero-PHI; no se documentan resultados en entornos de producción reales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene sus propias condiciones que deben verificarse por separado.
- Riesgo de alucinación acotado por la decodificación restringida a tres tokens, pero el veredicto sigue dependiendo de la calidad de la captura y del resumen de DOM proporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenAdapt/OpenAdapt-Veto-4B-r5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización OpenAdapt: https://huggingface.co/OpenAdapt
- No se han proporcionado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
