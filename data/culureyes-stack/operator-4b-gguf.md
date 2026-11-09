# CULUREYES-stack/Operator-4B-GGUF

## Resumen

Operator-4B-GGUF es una conversión al formato GGUF del modelo Hajeri-Operator-4B, desarrollado por el usuario Hajeri80 y empaquetado por CULUREYES-stack. Se trata de un modelo de lenguaje conversacional de aproximadamente 3.640 millones de parámetros (3,64 B) que emplea una arquitectura propietaria denominada `hajeri`, no reconocida por las compilaciones estándar de llama.cpp. El repositorio incluye únicamente los pesos cuantizados y las tablas RoPE precalculadas, pero no el parche de llama.cpp ni el código de conversión necesarios para ejecutarlo.

El modelo se distribuye en cinco precisiones distintas (F32, F16, Q8_0, Q4_K_M y Q2_K) y está orientado a conversación multi-turno en inglés y árabe. Su tokenizador no es BPE, sino un emparejador de cadena más larga sobre el vocabulario, con tokens de byte como respaldo. El formato de prompt utiliza marcadores tipo ChatML (`<|im_start|>` / `<|im_end|>`) con un rol `operator` en lugar de `assistant`.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta útil como ejemplo de conversión GGUF de una arquitectura no estándar y de los riesgos asociados a empaquetados de pesos sin soporte de runtime incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura propietaria `hajeri` (32 bloques, hidden size 2048, 16 cabezas de atención, 2 cabezas KV, gated attention, QK-norm, RoPE split-half estilo NeoX con `rope_theta = 500000`) |
| Parametros totales | 3.643.529.216 (3,64 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible explícitamente; el ejemplo de servidor usa `-c 4096` |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K_M, Q2_K |
| Idiomas soportados | Inglés (en), árabe (ar) |
| Licencia | No disponible (sujeta a los términos del modelo base Hajeri80/Hajeri-Operator-4B) |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en BF16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de 32 bloques con un esquema de atención con puerta (gated attention). Cada bloque aplica `rmsnorm_head` sobre las proyecciones Q y K antes de aplicar las tablas RoPE precalculadas, usa atención SDPA y multiplica la salida por `2 * sigmoid(Wg @ a)`, una compuerta que modula la contribución de la atención. Después se aplica un bloque MLP residual y una `lm_head` sobre `ln_f`. La atención emplea 16 cabezas con solo 2 cabezas KV, lo que reduce el coste de memoria del KV cache (GQA con ratio 8:1).

El tokenizador es una innovación destacable: no es BPE ni SentencePiece, sino un emparejador de la cadena más larga del vocabulario en cada posición, con tokens de byte como fallback. La conversión GGUF conserva el vocabulario y las tablas RoPE sin re-tokenizar ni permutar los pesos Q/K. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning. Tampoco se detalla el proceso de alineación ni el corpus multilingüe empleado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y árabe.
- Razonamiento básico y respuesta a preguntas factuales (el ejemplo de la model card incluye "¿cuál es la capital de Japón?").
- Generación de código en Python (la model card documenta una prueba con una suma de listas, aunque el resultado fue inválido en todas las precisiones probadas).
- Soporte de formato de chat con roles `system`, `user` y `operator` mediante plantilla ChatML adaptada.
- Capacidad de mantener una "identidad persistente" según el system prompt recomendado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documenta decodificación especulativa ni técnicas de aceleración más allá de la cuantización.

## Casos de uso

- Conversación de nicho en árabe e inglés: el modelo puede gestionar diálogos multi-turno con un system prompt de identidad persistente, adecuado para prototipos de asistentes bilingües donde el árabe sea requisito.
- Experimentación con arquitecturas no estándar: investigadores que quieran estudiar el impacto del tokenizador de coincidencia de cadena más larga o la gated attention pueden usar este modelo como banco de pruebas, siempre que compilen el parche de llama.cpp necesario.
- Evaluación de cuantizaciones: el repositorio incluye cinco precisiones con notas de divergencia entre ellas, lo que permite estudiar cómo afecta la cuantización a las respuestas en un modelo pequeño.
- Despliegue en hardware limitado: con Q4_K_M (2,29 GB) o Q2_K (1,55 GB) puede ejecutarse en equipos con poca VRAM o en CPU, siempre que se disponga del runtime parcheado.
- Pruebas de formato de prompt: útil para validar pipelines que usan marcadores ChatML con roles personalizados (`operator` en lugar de `assistant`).
- Docencia sobre empaquetado GGUF: sirve como caso práctico de conversión de pesos de una arquitectura propietaria y de los problemas de portabilidad asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye seis observaciones cualitativas sobre prompts fijos comparando BF16, F16, Q8_0, Q4_K_M y Q2_K, que el propio autor advierte que no constituyen un benchmark ni una prueba de equivalencia amplia. Entre ellas se documenta que Q8_0 no es idéntico a F16 en salida, que la respuesta de suma de listas en Python fue inválida en todas las precisiones y que F32 no produjo salida en la ejecución guardada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de KV cache a 4096 tokens): aproximadamente 1,6-2,4 GB para Q2_K, 2,4-3,2 GB para Q4_K_M, 4,0-5,0 GB para Q8_0, 7,5-8,5 GB para F16 y 15-16 GB para F32.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M o Q8_0 (por ejemplo, RTX 3050, RTX 4060, RTX 3060). Para F16 se recomienda una RTX 4070 o superior; para F32, una RTX 4090 o A100/H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con las cuantizaciones Q4_K_M, Q8_0 y Q2_K. En el caso documentado de un Mac de 16 GB, Metal falló al asignar el modelo F32.
- Opciones de despliegue: exclusivamente llama.cpp con un parche que soporte la arquitectura `hajeri` (el autor cita el commit `6590d25a3` como base). No es compatible con vLLM, TGI, Ollama ni otras herramientas estándar sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Operator-4B-GGUF | 3,64 B | No disponible (ejemplo a 4096) | en, ar | No disponible | GGUF con runtime parcheado |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 | Multilingüe (29+) | Apache 2.0 | GGUF, safetensors, amplio soporte |
| Llama-3.2-3B-Instruct | 3,21 B | 131 072 | Multilingüe (8) | Llama 3.2 Community License | GGUF, safetensors, amplio soporte |
| Phi-3.5-mini-instruct | 3,82 B | 131 072 | Multilingüe | MIT | GGUF, safetensors, amplio soporte |

Los tres modelos comparables ofrecen contextos mucho mayores, licencias claras, soporte nativo en llama.cpp, vLLM y Ollama, y benchmarks públicos (MMLU, HumanEval, GSM8K). Operator-4B no ofrece ninguno de estos elementos de forma verificable, por lo que su adopción en producción es arriesgada frente a estas alternativas.

## Limitaciones y advertencias

- Requiere un parche específico de llama.cpp no incluido en el repositorio; sin él, el modelo no carga en herramientas estándar.
- Licencia no declarada en el repositorio; el uso comercial queda sujeto a los términos del modelo base, que no se detallan.
- Solo soporta inglés y árabe; no hay evidencia de capacidades multilingües adicionales.
- Riesgo elevado de alucinación y de respuestas incorrectas: la propia model card documenta una respuesta inválida en una tarea sencilla de código en todas las precisiones.
- Divergencia entre cuantizaciones: Q8_0 no es equivalente a F16 y Q2_K diverge notablemente, lo que complica la reproducibilidad.
- F32 no produjo salida en la ejecución documentada y falló la asignación en Metal en un Mac de 16 GB.
- Sin benchmarks públicos, sin métricas de seguridad, sin evaluación de sesgos y sin documentación del corpus de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El repositorio es solo de pesos: no incluye el parche ni el código de conversión, lo que dificulta la auditoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CULUREYES-stack/Operator-4B-GGUF
- Modelo base: https://huggingface.co/Hajeri80/Hajeri-Operator-4B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia citado por el autor: `6590d25a3` (https://github.com/ggml-org/llama.cpp/tree/6590d25a3)
