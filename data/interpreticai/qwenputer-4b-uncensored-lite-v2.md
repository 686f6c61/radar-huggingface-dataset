# InterpreticAI/Qwenputer-4B-Uncensored-lite-v2

## Resumen

Qwenputer-4B-Uncensored-lite-v2 es una versión compacta sin pérdida de Qwenputer-4B-Uncensored-v2, publicada por InterpreticAI. Se trata de un fine-tuning sobre Qwen3.5-4B-Uncensored-v2 al que se le ha incorporado el denominado "Qwenputer": una CPU RISC-V de 32 bits compilada directamente dentro de los pesos del modelo por el compilador Qwenputer de Divyansh Agrawal. Esa CPU ocupa 11 capas situadas delante del modelo de lenguaje y realiza aritmética exacta dentro del propio forward pass, sin necesidad de invocar herramientas externas.

La innovación de esta variante "lite" es puramente de almacenamiento: mantiene exactamente los mismos pesos que la versión completa, pero elimina el relleno de ceros, pasando de 18,7 GB a 8,7 GB en disco y de 18,7 GB a 12,8 GB de VRAM en BF16. Esto permite ejecutar el modelo en una única GPU de 16 GB. El modelo base Qwen3.5-4B tiene 4.000 millones de parámetros y 32 capas de lenguaje.

El interés del modelo reside en su enfoque híbrido poco habitual: combina un LLM conversacional de 4B con un circuito RISC-V embebido en los pesos para garantizar precisión aritmética exacta, además de un ajuste orientado a eliminar la censura política de origen chino presente en el modelo base. La licencia es Apache 2.0 y el repositorio acumula 340 descargas desde su publicación en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con 11 capas RISC-V embebidas en los pesos |
| Parametros totales | 4.000 millones (aproximado, modelo base Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la evaluacion politica cubre solo chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato compacto propio (slimload) reconstruible a safetensors estándar mediante unpack.py; 580 tensores |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 32 capas de lenguaje (Qwen3.5-4B) al que se le anteponen 11 capas que implementan una CPU RISC-V de 32 bits. Estas capas no son neuronas entrenadas de forma convencional: son un circuito compilado en los pesos que ejecuta aritmética entera exacta dentro del forward pass. El modelo emite una llamada de herramienta `calc` y las capas del ordenador producen el resultado internamente, sin que se ejecute ninguna herramienta externa. El checkpoint completo contiene 580 tensores y la versión lite los reconstruye bit a bit (verificable mediante `SHA256SUMS.dense`).

El fine-tuning respecto al modelo base busca eliminar la censura política de origen chino, partiendo de Qwen3.5-4B-Uncensored-v2. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacable es el propio mecanismo Qwenputer: cómputo aritmético exacto embebido en los pesos, con verificación de que las salidas coinciden posición a posición con un modelo de referencia de la máquina (0 errores de lockstep, 0 desajustes de cabecera).

## Capacidades

- Generación de texto conversacional multi-turno en modo texto.
- Aritmética entera exacta mediante la CPU RISC-V embebida, invocada a través de una llamada de herramienta `calc` que se resuelve dentro del forward pass.
- Soporte de tool calling para la herramienta `calc` (el driver de chat de Qwenputer gestiona la llamada).
- Modo no-thinking documentado en las evaluaciones (respuestas de hasta 512 tokens).
- Capacidades multilingües: no disponibles en la información proporcionada; la evaluación política se limita a preguntas en chino.
- Sin capacidades de visión: el codificador visual de Qwen3.5-4B-Uncensored-v2 no está incluido.
- Sin soporte de audio documentado.

## Casos de uso

- Cálculo aritmético de precisión en pipelines financieros: el modelo puede resolver multiplicaciones y operaciones enteras grandes (por ejemplo, 123456789 × 987654321) de forma exacta mediante las capas RISC-V, sin depender de una calculadora externa ni del redondeo del LLM.
- Asistentes conversacionales sin censura política: adecuado para investigación sobre sesgos y censura en modelos de origen chino, gracias al ajuste específico que elimina la censura política del modelo base.
- Despliegue en hardware de gama media: al cargar en 12,8 GB de VRAM en BF16, puede ejecutarse en una única GPU de 16 GB (por ejemplo, RTX A4000), lo que lo hace viable en estaciones de trabajo modestas.
- Investigación en cómputo híbrido neuro-simbólico: sirve como banco de pruebas para estudiar la integración de circuitos (CPU RISC-V) dentro de los pesos de un transformer y su efecto en la fidelidad del texto.
- Evaluación de fidelidad de modelos: los prompts de fidelidad de texto y las métricas de divergencia KL permiten usarlo como referencia para comparar implementaciones de atención y kernels.
- Reproducción de experimentos: la reconstrucción bit a bit del checkpoint completo (18,7 GB) mediante `unpack.py` facilita la replicación de resultados en entornos con más memoria.
- Desarrollo sobre RISC-V: el tag `risc-v` y el driver de chat de Qwenputer permiten experimentar con firmware embebido (por ejemplo, `calc-bridge.elf`) en el contexto del modelo.

## Benchmarks y rendimiento

Aritmética exacta (40 problemas sintéticos de enteros del harness de Qwenputer; el modelo escribe una llamada `calc` y las capas del ordenador calculan el resultado):

| Modelo | Correctos (de 40) |
|---|---|
| Qwen3.5-4B-Uncensored-v2 (sin herramientas, instruido para calcular exacto) | 29 |
| Qwenputer-4B-Uncensored-v2 | 40 |
| Qwenputer-4B-Uncensored-lite-v2 | 40 |

Fidelidad de texto (divergencia KL media en los prompts de fidelidad, frente a Qwen3.5-4B-Uncensored-v2):

| Modelo | KL media | Ruido de fondo | Ratio |
|---|---|---|---|
| Qwenputer-4B-Uncensored-v2 (H100) | 5,2 × 10⁻⁴ | 5,0 × 10⁻⁴ | 1,03 |
| Qwenputer-4B-Uncensored-lite-v2 (A4000) | 1,0 × 10⁻³ | 9,1 × 10⁻⁴ | 1,10 |

Preguntas políticas (78 preguntas sensibles de Pan y Xu, 2026, en chino, modo no-thinking, hasta 512 tokens):

| Comparación | Respuestas idénticas | Token mediano de primera diferencia |
|---|---|---|
| Qwenputer-4B-Uncensored-v2 vs. Qwen3.5-4B-Uncensored-v2 (H100) | 1 | 52 |
| Ruido de fondo: Qwen3.5-4B-Uncensored-v2, dos kernels de atención (H100) | 0 | 49 |
| lite-v2 vs. Qwen3.5-4B-Uncensored-v2 (A4000) | 0 | 43,5 |
| Ruido de fondo: Qwen3.5-4B-Uncensored-v2, dos kernels de atención (A4000) | 1 | 66 |

Las diferencias observadas quedan dentro del ruido numérico de BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,8 GB en BF16 (frente a 18,7 GB del checkpoint completo).
- GPU recomendadas: una única GPU de 16 GB es suficiente; las evaluaciones se realizaron en NVIDIA RTX A4000 y H100.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB); no cabe en tarjetas de 8-12 GB.
- Opciones de despliegue: carga mediante `slimload.py` del repositorio qwenputer (rama `experimental/riscv`, `uv sync --extra hf`); el driver de chat de Qwenputer (`chipformer.rv.chat`) funciona sin cambios si se hace que `Qwen3_5ForCausalLM.from_pretrained` devuelva `load_slim(path)`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmética exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenputer-4B-Uncensored-lite-v2 | ~4B | No disponible | Sí (40/40) | Apache 2.0 | Hugging Face |
| Qwenputer-4B-Uncensored-v2 | ~4B | No disponible | Sí (40/40) | Apache 2.0 | Hugging Face (18,7 GB) |
| Qwen3.5-4B-Uncensored-v2 | ~4B | No disponible | No (29/40) | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | ~4B | No disponible | No disponible | Apache 2.0 | Hugging Face |

La ventaja diferencial frente a los modelos de la misma familia es la combinación de aritmética exacta embebida y un tamaño en disco reducido a menos de la mitad, manteniendo pesos idénticos bit a bit.

## Limitaciones y advertencias

- Los archivos compactos requieren `slimload.py` o `unpack.py`; no cargan directamente con `from_pretrained`.
- Solo texto: el codificador visual de Qwen3.5-4B-Uncensored-v2 no está incluido.
- Hereda las limitaciones de Qwen3.5-4B-Uncensored-v2, incluida una mayor tasa de hechos fabricados que Qwen3.5-4B; una respuesta sustantiva no implica que sea correcta.
- La evaluación política cubre únicamente preguntas en chino; no se ha reejecutado el juez de censura, por lo que los resultados de censura reportados para Qwen3.5-4B-Uncensored-v2 se aplican a este modelo.
- Riesgo de alucinación relevante en producción, especialmente en dominios factuales.
- No se documentan sesgos específicos más allá de los heredados del modelo base.
- Licencia Apache 2.0 permite uso comercial, con la atribución del equipo Qwen y del autor de Qwenputer (código MIT) retenida.
- El soporte de tool calling se limita a la herramienta `calc` gestionada por el driver de Qwenputer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-lite-v2
- Modelo base (checkpoint completo): https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-v2
- Modelo antecesor: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwenputer original: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Repositorio del compilador Qwenputer: https://github.com/divagr18/qwenputer
- DOI: https://doi.org/10.57967/hf/11551
- Referencia: Agrawal, D. (2026). Qwenputer: a computer compiled into the weights of a language model (Version 0.2.0). https://github.com/divagr18/qwenputer
- Referencia: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013.
