# f3nc3r/Huihui-Qwen3.5-4B-ab_miniQuant

## Resumen

Huihui-Qwen3.5-4B-ab_miniQuant es una cuantización GGUF de muy baja precisión (2,21 BPW) del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez deriva de la familia Qwen3.5 de 4B parámetros. El trabajo lo publica el usuario f3nc3r y combina dos técnicas: Structural Mixed-Precision (SQMP), que asigna distintos tipos de cuantización según la sensibilidad de cada tensor, y calibración con imatrix (matriz de importancia basada en el hessiano de activaciones). El resultado es un fichero de 1,34 GB que, según el autor, mantiene coherencia factual, matemática y de código en pruebas deterministas.

La relevancia del modelo es práctica: demuestra que es posible bajar de 2,5 BPW en una arquitectura pequeña (dimensión oculta D=2560) sin colapso de la representación, algo que el autor documenta que fracasa con recetas alternativas (ternarias, binarias o IQ2 sin calibración). Está pensado para inferencia en CPU con un motor personalizado, llama.cpp-miniQuant, que añade soporte nativo para el grafo híbrido sliding-window / SSM de la arquitectura qwen35.

El modelo conserva la naturaleza "abliterated" del base, es decir, se ha eliminado el comportamiento de rechazo, y la licencia declarada es Apache 2.0. El idioma declarado en la model card es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con sliding-window attention y componentes SSM (etiqueta "qwen35" en el motor de inferencia); dimensión oculta D=2560 |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta a 2,21 BPW efectivos: token_embd en Q4_K, LM head en Q6_K, attn_qkv en IQ2_K, resto con IQ2_XS y calibración imatrix |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (requiere el motor llama.cpp-miniQuant) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4,2 B parámetros con un grafo que el motor de inferencia etiqueta como "qwen35" e interpreta como computación híbrida de sliding-window attention y SSM. La dimensión oculta es 2560, dato que el autor usa para justificar la dificultad de cuantizar por debajo de 2,5 BPW. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card de esta cuantización no los detalla.

La innovación está en el proceso de cuantización, no en el entrenamiento. SQMP asigna precisión por rol estructural: Q4_K para los embeddings (protege la geometría de logits del vocabulario), Q6_K para la cabeza de salida (preserva la nitidez del softmax) e IQ2_K para las proyecciones query-key-value (protege el rango de atención). Sobre esa base, la calibración imatrix calcula un proxy del hessiano H = X X^T sobre texto de calibración y alinea los codebooks vectoriales no lineales IQ2_XS con las direcciones de mayor energía de activación. El autor sostiene que ambas técnicas son superaditivas: SQMP sin imatrix produce clipping catastrófico (el 90 % de los pesos de baja precisión colapsan a cero), e imatrix sin SQMP colapsa la variedad de embeddings. El resultado declarado es un footprint de 1,34 GB de RAM.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-4B abliterated.
- Razonamiento factual básico: el autor valida la recuperación del punto de ebullición del nitrógeno líquido (77 K).
- Razonamiento matemático secuencial: resuelve la secuencia n(n+1) hasta el valor 42 en la prueba documentada.
- Generación de código Python: produce la comprobación de palíndromo con slicing `word[::-1]`.
- Naturaleza abliterated: el modelo base ha eliminado el comportamiento de rechazo, por lo que responde a peticiones que el modelo original rechazaría.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe: solo se declara inglés.

## Casos de uso

- Inferencia en CPU con RAM limitada: el fichero de 1,34 GB permite ejecutar un modelo de 4,2 B parámetros en equipos sin GPU dedicada, usando el motor llama.cpp-miniQuant compilado con AVX-512.
- Prototipado de asistentes conversacionales en inglés: sirve para validar flujos de chat multi-turno antes de escalar a un modelo mayor, con un coste de memoria mínimo.
- Evaluación de técnicas de cuantización extrema: investigadores pueden reproducir la comparativa SQMP + imatrix frente a recetas ternarias, binarias o IQ2 sin calibrar que el autor documenta como fallidas.
- Generación de código en entornos con restricciones de hardware: la prueba de palíndromo sugiere que puede producir snippets Python simples, útil en scripts de automatización ligeros.
- Experimentación con modelos sin rechazo: al ser abliterated, se puede usar para estudiar comportamiento de modelos sin alineación de seguridad en entornos controlados de investigación.
- Despliegue en dispositivos edge o contenedores pequeños: el tamaño reducido del GGUF encaja en imágenes Docker mínimas o sistemas embebidos x86 con AVX-512.
- Pruebas de regresión de motores de inferencia: sirve como caso de prueba para validar el soporte del grafo qwen35 híbrido en llama.cpp-miniQuant.

## Benchmarks y rendimiento

Los datos publicados por el autor son pruebas deterministas locales (greedy decoding, `--temp 0 -n 64 --repeat-penalty 1.0`) sobre CPU AMD x86_64 de 12 núcleos / 24 hilos con AVX-512, no benchmarks estándar como MMLU o HumanEval.

| Modelo / receta | Tamano | BPW efectivo | Velocidad | Fisica (N2) | Matemáticas (secuencia) | Código Python | Veredicto |
|---|---|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-ab_miniQuant (IQ2_XS + SQMP + imatrix) | 1.341 MB | 2,21 | 34,4 t/s | Correcto (77 K) | Correcto (42) | Correcto (`word[::-1]`) | Pasa |
| IQ2_KS + SQMP + imatrix | 1.299 MB | 2,18 | 40,2 t/s | Deriva (123 K) | Deriva aritmética | Incompleto | Estabilidad sintáctica, lógica degradada |
| IQ2_XXS + SQMP + imatrix | 1.253 MB | 2,06 | 41,2 t/s | Deriva (-619 °C) | Fórmula errónea | Incompleto | Deriva factual |
| Recipe D (IQ2_XXS + SQMP sin imatrix) | 1.253 MB | 2,06 | 39,8 t/s | Colapso | Colapso | Colapso | Falla |
| PQ2_0 (Bonsai Ternary + SQMP + imatrix) | 1.405 MB | 2,13 | 35,8 t/s | Incoherente | Ruido | Ruido | Falla |
| Recipe A (PTQ1_0 ternario en cascada) | 892 MB | 1,46 | 48,1 t/s | Gibberish | Colapso | Colapso | Falla |
| Recipe B (PTQ1_0 + destilación AdamW) | 1.514 MB | 2,48 | 32,1 t/s | Alucinación severa | Lógica degradada | Deriva sintáctica | Subóptimo |
| Recipe C (IQ2_BN binario) | 1.516 MB | 2,49 | 31,9 t/s | Recuerdo inconsistente | Lógica degradada | Errores de sintaxis | Subóptimo |
| TQ2_0 (dual-binario nativo) | 1.418 MB | 2,33 | 33,5 t/s | Recuerdo inconsistente | Lógica degradada | Código incompleto | Subóptimo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el autor reporta un footprint de 1,34 GB de RAM en CPU.
- GPU recomendadas: no aplica para el motor documentado; el autor solo valida ejecución en CPU.
- Cabe en cualquier equipo consumer con al menos 1,5 GB de RAM libre y CPU x86_64 con AVX-512 (idealmente con AVX512_VBMI, AVX512_VNNI y AVX512_BF16).
- Despliegue: exclusivamente mediante llama.cpp-miniQuant (commit faec5d9), compilado con `-DGGML_AVX512=ON -DGGML_AVX512_VBMI=ON -DGGML_AVX512_VNNI=ON -DGGML_AVX512_BF16=ON`. No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp estándar.
- Throughput estimado: 34,4 t/s en el hardware de referencia (AMD 12C/24T, DDR5, NVMe PCIe 4.0). No se publica latencia por token ni datos en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BPW / precision | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-ab_miniQuant | 4,2 B | no disponible | 2,21 BPW | 3/3 pruebas deterministas superadas, 34,4 t/s | Apache 2.0 | Hugging Face, requiere motor propio |
| IQ2_KS + SQMP + imatrix (misma familia) | 4,2 B | no disponible | 2,18 BPW | 1/3 pruebas superadas, 40,2 t/s | Apache 2.0 | Hugging Face |
| IQ2_XXS + SQMP + imatrix (misma familia) | 4,2 B | no disponible | 2,06 BPW | 0/3 pruebas superadas, 41,2 t/s | Apache 2.0 | Hugging Face |
| TQ2_0 (dual-binario nativo) | 4,2 B | no disponible | 2,33 BPW | Recuerdo inconsistente, 33,5 t/s | Apache 2.0 | Hugging Face |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork no estándar de llama.cpp (llama.cpp-miniQuant); no funciona con llama.cpp upstream, Ollama ni vLLM, lo que limita su integración en producción.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Al ser un modelo abliterated, no tiene comportamiento de rechazo: puede generar contenido que el modelo original bloquearía, con implicaciones legales y de seguridad en despliegues públicos.
- Riesgo de alucinación elevado: el autor documenta que recetas cercanas en BPW (IQ2_XXS, IQ2_KS) derivan en datos factuales y matemáticos; el margen entre pasar y fallar es estrecho.
- La validación se limita a tres pruebas deterministas con greedy decoding; no hay evidencia sobre generación larga, coherencia multi-turno ni robustez con sampling.
- No se documenta la longitud de contexto soportada ni el comportamiento del grafo híbrido SSM en secuencias largas bajo esta cuantización.
- El autor advierte que sin calibración imatrix el 90 % de los pesos de baja precisión colapsan a cero; cualquier re-cuantización o modificación del GGUF puede degradar el modelo de forma irreversible.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza abliterated traslada al usuario la responsabilidad sobre el contenido generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de los resultados del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f3nc3r/Huihui-Qwen3.5-4B-ab_miniQuant
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Motor de inferencia: https://github.com/fencerJP/llama.cpp-miniQuant
