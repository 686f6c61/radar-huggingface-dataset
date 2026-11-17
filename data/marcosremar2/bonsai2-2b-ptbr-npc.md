# marcosremar2/bonsai2-2b-ptbr-npc

## Resumen

Ternary Bonsai 2 2B · PT-BR NPC es un ajuste fino del modelo ternario de PrismML `Ternary-Bonsai-2-2B`, derivado a su vez de Qwen3.5-2B, especializado en interpretar personajes no jugables (NPC) en portugués de Brasil para un videojuego de aprendizaje de idiomas. El modelo mantiene un personaje concreto (panadero, camarero, vendedor de playa), recuerda datos que el estudiante ha mencionado antes en la conversación y responde en un máximo de dos frases cortas. Lo publica el usuario `marcosremar2` bajo licencia Apache 2.0.

La propuesta técnica es llamativa: los pesos son ternarios, es decir, toman valores en {−1, 0, +1} con una escala FP16 por grupo de 128, lo que da una huella de almacenamiento de 319 MB en su variante de producción y un consumo de unos 430 MB de RAM con contexto de 2.048 tokens. Eso lo hace viable en un teléfono móvil, un requisito clave para un juego educativo distribuido en dispositivos de gama baja.

El modelo se entrena por destilación desde un profesor Qwen3.5-4B con LoRA y aplica *quantization-aware training* sobre los pesos ternarios, además de recortar el vocabulario de 248.320 a 24.000 tokens. La arquitectura subyacente es híbrida: 24 capas combinando Gated DeltaNet y Gated Attention, con 1.422.417.728 parámetros totales según los safetensors del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas: 6 × [3 Gated DeltaNet + 1 Gated Attention]), pesos ternarios con escala FP16 por grupo de 128 y rotación fija de Walsh–Hadamard |
| Parámetros totales | 1.422.417.728 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (configuración de producción documentada) |
| Tipos de cuantización | Ternaria 1.58-bit (`PTQ1_0` en GGUF); pesos MLX 2-bit en el modelo base |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (`PTQ1_0`), MLX (`mlx/`) |

## Arquitectura y entrenamiento

El modelo hereda de Qwen3.5-2B una arquitectura híbrida de 24 capas que alterna bloques Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention, con un vocabulario original de 248.320 tokens. PrismML convirtió esos pesos a ternarios mediante un proceso no publicado, con una escala FP16 por cada grupo de 128 pesos y una rotación de Walsh–Hadamard fija que reduce el error de cuantización. El ajuste fino de este repositorio mantiene esa estructura: cada peso ternario conserva una copia latente en precisión completa y su escala de grupo, la pasada forward redondea a {−1, 0, +1} y el gradiente se propaga directamente (*straight-through estimator*).

El entrenamiento consta de dos fases. Primero se ajusta un profesor Qwen3.5-4B con LoRA (r=64, α=128) durante 3.000 pasos con LR 1e-4 sobre las conversaciones del juego (1 h 53 en una A100). Después se destila al estudiante ternario con una pérdida combinada de 0,5 × entropía cruzada + 0,5 × KL forward respecto al profesor, calculada solo sobre los tokens del NPC, durante 6.000 pasos × 8 conversaciones (≈1,3 épocas) con LR 2e-5, en 3 h 49 sobre una A100; la pérdida media por cada 1.000 pasos bajó de 4,02 a 0,79. El corpus de entrenamiento (no publicado) suma 37.509 conversaciones en portugués: 13.277 diálogos de las actividades del juego, 20.000 conversaciones de role-play, 3.200 diálogos de servicio generados a partir de las fichas de personaje y 1.032 conversaciones de memoria destiladas. El recorte de vocabulario a 24.000 tokens conserva los 256 bytes, todos los tokens de los datos de entrenamiento con su cierre de merges BPE y los tokens más frecuentes de 20.000 artículos de Wikipedia en portugués; 298 de 300 textos de prueba tokenizan igual y las respuestas se alargan un 1,2 % en tokens.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con registro coloquial y coherencia de personaje.
- Role-play sostenido: interpreta un personaje concreto (panadero, camarero, vendedor) sin salirse del papel ni admitir ser una IA.
- Memoria conversacional a corto plazo: recuerda el nombre, el origen y los pedidos del estudiante dentro de la ventana de contexto.
- Respuestas acotadas a un máximo de dos frases cortas, por diseño de entrenamiento.
- Modo sin razonamiento explícito (`enable_thinking: false` en la plantilla de chat); el presupuesto de razonamiento se fija a cero en producción.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales.
- Multilingüismo limitado al portugués; el modelo está entrenado para responder exclusivamente en pt-BR.

## Casos de uso

- NPC de videojuego educativo: el modelo encarna a un personaje de Copacabana que conversa con estudiantes de portugués, recuerda los datos que el alumno ha compartido y responde en dos frases, encajando en el bucle de diálogo de un juego móvil con 430 MB de RAM.
- Aplicación de aprendizaje de idiomas en móvil: al ocupar 319 MB en disco y caber en memoria de un teléfono de gama media, permite desplegar práctica conversacional offline sin depender de la nube.
- Simulación de escenarios de servicio: diálogos de panadería, restaurante o puesto de playa donde el alumno practica pedidos, saludos y preguntas cotidianas con un interlocutor que mantiene el rol.
- Evaluación de comprensión auditiva o lectora: el NPC formula preguntas cortas y verifica si el estudiante recuerda información previa, útil en ejercicios de memoria y repetición espaciada.
- Prototipado rápido de agentes conversacionales con restricciones duras de latencia y memoria: sirve como banco de pruebas para pipelines de destilación y cuantización ternaria antes de escalar a modelos mayores.
- Demostración de despliegue en edge: al ejecutarse con llama.cpp y el tipo GGUF `PTQ1_0`, es un caso práctico para validar inferencia ternaria en hardware de consumo.
- Investigación sobre *quantization-aware training*: el repositorio incluye scripts de entrenamiento, exportación, recorte de vocabulario y evaluación, útiles para reproducir la receta sobre otros dominios.

## Benchmarks y rendimiento

Evaluación sobre 30 conversaciones de diez turnos con un estudiante guionizado, ejecutadas dos veces (con system prompt simple y con ficha de personaje completa), medidas en un Mac con los flags de producción:

| Métrica | Base Ternary Bonsai 2 2B | Este modelo, vocabulario completo | Este modelo, 24k |
|---|---|---|---|
| Recuerda los datos del estudiante (simple / ficha) | 0,34 / 0,57 | 0,98 / 1,00 | 0,98 / 1,00 |
| Recuerda la ciudad (simple / ficha) | 0,00 / 0,33 | 0,93 / 1,00 | 0,93 / 1,00 |
| Dice su propio nombre | — | 1,00 | 1,00 |
| Rompe el personaje | 27 % | 0 % | 0 % |
| Se repite | 100 % | 7 % / 0 % | 7 % / 0 % |
| Máximo dos frases | — | 100 % | 100 % |
| Solo portugués | — | 100 % | 100 % |
| RAM (MB) | — | 617 | 429 |
| Puntuación del juez 1–5 (simple / ficha) | 1,84 / 2,41 | 3,67 / 3,46–3,53 | 3,72 / 3,49 |

El juez es Qwen3.6-27B (Q8_0) con una rúbrica de role-play. El modelo base se midió con decodificación greedy pura; con el muestreo recomendado por PrismML alcanza 0,49 / 0,59 de memoria y un 20–23 % de salidas de personaje. Como referencia, la misma receta aplicada al modelo ternario de 4B obtiene 3,81 / 3,61 pero requiere 1.208 MB de RAM. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 429 MB con el GGUF de 24k y contexto de 2.048 tokens; 617 MB con el GGUF de vocabulario completo; 319 MB y 429 MB de tamaño en disco respectivamente.
- GPU recomendadas: no se especifican en la documentación; el modelo se ha validado en un Mac (Apple Silicon) con llama.cpp. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre debería poder alojarlo, pero no hay cifras publicadas.
- Cabe en GPU de consumo: sí, por su huella inferior a 1 GB; también en dispositivos móviles y sistemas embebidos.
- Opciones de despliegue: llama.cpp mediante el fork `PrismML-Eng/llama.cpp` (commit `6447906`) con `llama-server`; los pesos MLX se cargan siguiendo el `PACK-RUNTIME.md` del repositorio base.
- Latencia y throughput: no disponibles. Los flags de muestreo son críticos: con greedy puro el modelo se repite en el 23 % de las conversaciones y con repeat penalty + DRY baja al 7 %. Los flags `--cache-ram 0 -ctxcp 0` mantienen la RAM estable en conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RAM en producción | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ternary Bonsai 2 2B · PT-BR NPC (este) | 1.422 M | 2.048 | 429 MB (24k) | Apache 2.0 | NPC en pt-BR, pesos ternarios |
| prism-ml/Ternary-Bonsai-2-2B (base) | ~2.000 M (no confirmado) | No disponible | No disponible | Apache 2.0 | Modelo ternario generalista |
| Qwen/Qwen3.5-2B (raíz) | ~2.000 M (no confirmado) | No disponible | No disponible | Apache 2.0 | Modelo generalista multilingüe |
| Receta equivalente sobre Ternary Bonsai 4B | ~4.000 M (no confirmado) | No disponible | 1.208 MB | Apache 2.0 | NPC en pt-BR, mayor calidad (3,81 / 3,61 de juez) |

La comparación directa con alternativas de la misma categoría (modelos de 2B para role-play en portugués) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para diálogo de NPC en portugués de Brasil; el conocimiento general y el razonamiento quedan fuera de su alcance por el recorte de vocabulario y el ajuste fino.
- Las respuestas están deliberadamente limitadas a dos frases cortas, lo que lo inutiliza para tareas que requieran explicaciones extensas.
- Riesgo de repetición: un 7 % de conversaciones se repiten incluso con los flags de muestreo recomendados; con greedy puro sube al 23 %.
- Riesgo de alucinación en datos factuales, aunque el dominio acotado y la memoria conversacional mitigan parte del problema.
- El vocabulario recortado a 24.000 tokens puede degradar la tokenización de textos fuera del dominio de entrenamiento (Wikipedia en portugués y diálogos del juego).
- No se han publicado sesgos específicos; al derivar de Qwen3.5 y entrenarse con datos sintéticos y de juego, puede reproducir sesgos de esos corpus.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el `NOTICE.txt` de PrismML y verificar las condiciones del modelo base.
- El método de entrenamiento ternario de PrismML no está publicado, lo que limita la reproducibilidad completa de la receta.
- El fork de llama.cpp requerido (`PrismML-Eng/llama.cpp`, commit `6447906`) puede no estar sincronizado con el upstream, lo que añade riesgo de mantenimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosremar2/bonsai2-2b-ptbr-npc
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo base en MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-2B
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Paper de referencia sobre pesos ternarios (BitNet b1.58): https://arxiv.org/abs/2402.17764
- Paper de referencia sobre destilación y cuantización: https://arxiv.org/abs/2502.02631
- Paper de referencia sobre LoRA: https://arxiv.org/abs/2106.09685
- Paper de referencia sobre evaluación de modelos conversacionales: https://arxiv.org/abs/2306.05685
