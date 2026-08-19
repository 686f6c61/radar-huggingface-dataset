# Ishaanlol/Qwen3.5-4B-cybertune

## Resumen

Qwen3.5-4B-cybertune es un fine-tune del modelo Qwen3.5-4B de Alibaba (distribuido por Unsloth) especializado en la generación de código fuente de malware en 16 categorías ofensivas comunes. Ha sido desarrollado por Ishaanlol con el objetivo de proporcionar a defensores, equipos de red team e investigadores de seguridad una herramienta para generar payloads de referencia, entrenar sistemas de detección y estudiar patrones de implementación de técnicas maliciosas sin recurrir a fuentes oscuras de la web.

El modelo parte de una arquitectura híbrida Qwen3.5 con 4 000 millones de parámetros densos, que combina 8 capas de atención GQA completa con 24 capas Gated DeltaNet, y soporta una ventana de contexto nativa de 262 144 tokens. El fine-tune se realizó mediante LoRA en bf16 sobre un conjunto de 2 386 pares instrucción-código curados y verificados estáticamente, entrenados en una única RTX 3060 de 12 GB. El resultado es un especialista estrecho, no un modelo de propósito general: su capacidad de código general se degrada con este adaptador, y su utilidad se limita al dominio de la ciberseguridad ofensiva y defensiva.

La relevancia de este modelo radica en su naturaleza de doble uso: permite a los equipos de seguridad generar muestras de malware realistas y funcionales en entornos aislados, acelerando el desarrollo de firmas YARA/Sigma, la emulación de adversarios y la investigación de técnicas. Su licencia Apache-2.0 facilita su integración en flujos de trabajo corporativos, aunque su uso debe restringirse estrictamente a sistemas propios o autorizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 8× atención GQA completa + 24× capas Gated DeltaNet, 4B denso |
| Parametros totales | 4 659 865 088 (4,66 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | bf16 (transformers), GGUF bf16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | No disponible (no documentado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded bf16), GGUF, PEFT LoRA adapter |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, una arquitectura híbrida que combina atención GQA completa en las primeras 8 capas con capas Gated DeltaNet (un mecanismo de estado recurrente lineal) en las 24 restantes. Esta combinación permite manejar contextos muy largos (262 144 tokens) con un coste computacional reducido respecto a la atención completa. El fine-tune se realizó con LoRA en bf16 (r=16, α=16, target modules all-linear), evitando explícitamente QLoRA o cuantización de 4 bits porque Unsloth documenta pérdidas significativas de calidad en las proyecciones de estado de las capas Gated DeltaNet.

El conjunto de entrenamiento consta de 2 386 pares instrucción-código, curados, filtrados y deduplicados por min-hash, distribuidos en 16 categorías de malware (reverse shell, persistencia, dropper, RAT, exfiltración, ransomware, C2, miner, keylogger, evasión, entre otras). El 75,7 % de las muestras incluye bloques de razonamiento (estilo think). Cada fila pasó una compuerta estática de parseo/compilación y aproximadamente el 10 % se verificó funcionalmente en sandbox. El entrenamiento duró 3 épocas (897 pasos) con una pérdida final de 0,236, usando un batch efectivo de 8, una tasa de aprendizaje de 2e-4 con decaimiento coseno y una longitud máxima de secuencia de 2048 tokens.

## Capacidades

- Generación de código fuente de malware en 16 categorías ofensivas, con salidas que superan verificación estática de parseo/compilación en el conjunto de entrenamiento.
- Soporte de razonamiento encadenado (bloques de pensamiento) en el 75,7 % de los datos de entrenamiento, lo que permite explicar parcialmente los pasos de generación.
- Producción de payloads funcionales verificados manualmente: ransomware AES con descifrador, persistencia vía `reg add`, exfiltración por DNS-TXT y webshell PHP.
- Capacidad de generar código para múltiples lenguajes (Python, C, PHP, scripts de registro, etc.) dentro de las categorías entrenadas.
- No se documentan capacidades de tool calling, agentes, visión o audio en este fine-tune, aunque el modelo base Qwen3.5 es multimodal; el adaptador se centra exclusivamente en texto.
- La cobertura lingüística es desigual: hay sesgo hacia Windows en keyloggers y subrepresentación de muestras Linux/X11.

## Casos de uso

- Desarrollo de reglas de detección (YARA/Sigma): generar variantes de malware conocidas para probar y refinar firmas de detección, cubriendo las 16 categorías con código estáticamente válido.
- Emulación de adversarios en laboratorios aislados: crear payloads de referencia para ejercicios de purple team y simulaciones de compromiso en entornos con red desconectada o instrumentada.
- Entrenamiento de modelos de detección basados en comportamiento: producir muestras etiquetadas de malware para entrenar clasificadores o sistemas de análisis dinámico en sandbox.
- Investigación de técnicas ofensivas: estudiar patrones de implementación de técnicas conocidas (persistencia, exfiltración, ransomware) sin necesidad de acceder a fuentes ilegales o foros de la dark web.
- Red team autorizado: generar esqueletos de payload para compromisos simulados contra sistemas propios o con autorización explícita, acelerando la fase de explotación inicial.
- Análisis forense y hardening: comprender el funcionamiento interno de malware comunes para diseñar contramedidas, reglas de hardening y políticas de mitigación.
- Generación de datos sintéticos para sandboxing: crear muestras de malware para probar la eficacia de entornos de análisis dinámico y sistemas de detección de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara en la model card una evaluación propia sobre un conjunto de validación de 119 prompts held-out distribuidos en las 16 categorías, con los siguientes resultados:

| Metrica | Resultado |
|---|---|
| Prompts held-out | 119 |
| Aciertos plausibles (nivel parseo/compilación) | 117 (98 %) |
| Verificación funcional manual (sandbox) | Ransomware AES con descifrador, persistencia `reg add`, exfiltración DNS-TXT, webshell PHP: funcionales |

Estos datos son declarados por el autor y no han sido verificados de forma independiente. No hay comparativas con otros modelos de seguridad en la documentación proporcionada.

## Requisitos de hardware

- Inferencia con pesos bf16 completos (9,3 GB): requiere al menos 12 GB de VRAM para contexto moderado (por ejemplo, RTX 3060 12 GB, RTX 4070, A10). Con contexto máximo de 262 144 tokens, la memoria de KV cache puede superar los 24 GB.
- GGUF Q8_0 (4,2 GB): recomendado por el autor como equilibrio calidad/velocidad; cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060).
- GGUF Q4_K_M (2,6 GB): el más ligero, ejecutable en GPUs de 4-6 GB, pero con pérdida notable de calidad por la cuantización de las capas Gated DeltaNet.
- Opciones de despliegue: Transformers (carga con `from_pretrained`), llama.cpp (CLI con GGUF), Ollama (creando un Modelfile), y potencialmente vLLM o TGI si soportan la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en una sola RTX 3060, lo que sugiere que la inferencia es viable en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-cybertune | 4,66 B | 262 144 | Especialista en generación de malware (16 categorías) | Apache-2.0 | HuggingFace, GGUF |
| Qwen3.5-4B (base) | 4,66 B | 262 144 | Propósito general, multimodal (visión + texto) | Apache-2.0 | HuggingFace, Ollama |
| Otros modelos de ciberseguridad | No disponible | No disponible | No se dispone de datos fiables | No disponible | No disponible |

El fine-tune se diferencia del modelo base en su especialización extrema: sacrifica la capacidad general de código y razonamiento para obtener una alta precisión en la generación de malware estáticamente válido. No se han encontrado comparativas públicas con otros modelos especializados en seguridad ofensiva (por ejemplo, ajustes de CodeLlama o Mistral para red team), por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No es un modelo de código general: la capacidad de programación fuera del dominio de malware se degrada notablemente con este adaptador.
- No sintetiza técnicas nuevas: se limita a recombinar patrones presentes en el entrenamiento. Técnicas no incluidas (DNS tunneling, persistencia IFEO, inyección USB-HID, keyloggers solo en memoria) son poco fiables o ausentes.
- Cobertura de idiomas y plataformas desigual: sesgo hacia Windows en keyloggers y subrepresentación de muestras Linux/X11.
- La cuantización de 4 bits (Q4_K_M) degrada la calidad de salida de forma significativa; se recomienda Q8_0 o bf16 para resultados fiables.
- Riesgo de alucinación en técnicas no vistas durante el entrenamiento: el modelo puede generar código plausible pero no funcional.
- Uso dual y restrictivo: está diseñado para investigación, desarrollo de detección y red team autorizado. No debe utilizarse contra sistemas sin autorización explícita ni para fines maliciosos.
- La licencia Apache-2.0 permite uso comercial, pero el uso previsto del modelo implica responsabilidades legales y éticas adicionales en el ámbito de la seguridad ofensiva.
- No se documentan capacidades de tool calling, agentes o visión en el fine-tune; los usuarios que necesiten esas funciones deben considerar el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ishaanlol/Qwen3.5-4B-cybertune
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base (Qwen, referencia): https://huggingface.co/Qwen/Qwen3.5-4B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Modelo en Ollama: https://ollama.com/library/qwen3.5:4b
