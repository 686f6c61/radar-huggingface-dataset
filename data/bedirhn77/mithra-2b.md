# Bedirhn77/Mithra-2B

## Resumen

Mithra-2B es un modelo de lenguaje causal (decoder-only) especializado en generación de código para robótica de competición, concretamente para los programas FIRST Tech Challenge (FTC) y FIRST Robotics Competition (FRC). Lo desarrolla el equipo FTC Team 24501 "ERROR" de Diyarbakır (Turquía) y se distribuye con licencia MIT. A pesar del nombre "2B", el modelo real tiene 1.543.714.304 parámetros (aproximadamente 1,5B), ya que "2B" es el nombre de la serie.

Técnicamente es un fine-tuning mediante LoRA (r=16, alpha=32) sobre Qwen/Qwen2.5-Coder-1.5B-Instruct, fusionado posteriormente en los pesos base con `merge_and_unload`. El objetivo es ofrecer un asistente de código ligero, ejecutable en local o en una GPU modesta, que genere OpModes Java, rutinas autónomas, lógica de sensores y scripts OpenSCAD para piezas CAD imprimibles en 3D. Está pensado para equipos de robótica educativa que necesitan ayuda de código sin depender de APIs en la nube.

Su relevancia actual radica en el nicho: un modelo pequeño (unos 3 GB en fp16) que cabe en una GPU de consumo o en una Colab T4 gratuita, con soporte bilingüe turco-inglés y conocimiento del SDK de FTC y del estilo WPILib de FRC. No obstante, el entrenamiento es muy limitado (1.200 filas de un dataset genérico de instrucciones de código), por lo que su especialización real debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 (≈1,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó secuencias de 768 tokens) |
| Tipos de cuantización | No disponible explícitamente; al ser safetensors fp16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer causal decoder-only con atención estándar (no se documentan variantes lineales ni híbridas SSM). Sobre esa base se aplicó un fine-tuning LoRA con PEFT: rango r=16, alpha=32, dropout 0,05 y adaptadores únicamente en las proyecciones `q_proj` y `v_proj`. El entrenamiento se realizó con TRL `SFTTrainer` en precisión mixta fp16, 2 épocas, batch efectivo de 16 (2 × 8 de acumulación de gradiente), learning rate 2e-4 con scheduler coseno y longitud máxima de secuencia de 768 tokens. Todo el proceso se completó en una NVIDIA T4 de Google Colab en 20-40 minutos.

El dataset empleado son las primeras 1.200 filas de iamtarun/code_instructions_120k_alpaca, un conjunto genérico de instrucciones de código en formato Alpaca, reformateado a ChatML con un system prompt que fija la identidad "mithra" y el contexto del equipo. No se documenta uso de RLHF, DPO ni datos específicos de FTC/FRC más allá de lo que el prompt de sistema induce. Tras el entrenamiento, los adaptadores se fusionaron en los pesos base con `merge_and_unload`, de modo que el repositorio contiene un modelo denso estándar sin dependencia de PEFT en inferencia.

## Capacidades

- Generación de código en Java, C++, Python, JavaScript, HTML, CSS y OpenSCAD.
- Escritura de OpModes de FTC en Java (control de motores con encoder, TeleOp mecanum, lógica de sensores).
- Borradores de rutinas autónomas (por ejemplo, avanzar 24 pulgadas y detenerse).
- Generación de scripts OpenSCAD para piezas CAD imprimibles en 3D (soportes de motor, etc.).
- Depuración y explicación de errores de software (por ejemplo, NullPointerException en `hardwareMap`).
- Conversación multi-turno con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte bilingüe turco-inglés, incluyendo identidad de marca vía system prompt.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Asistente de código para equipos FTC: el modelo genera OpModes Java con control de motor por encoder y lógica de parada, adecuado porque conoce la estructura del SDK de FTC y cabe en un portátil con GPU modesta.
- Desarrollo de TeleOp mecanum: produce borradores de conducción holonómica en Java que el equipo puede ajustar, gracias a su entrenamiento sobre instrucciones de código y su base Qwen2.5-Coder.
- Rutinas autónomas para FRC/FRC-style: genera esqueletos de autonomía (avanzar, girar, detenerse) que sirven como punto de partida para depurar sobre el robot real.
- Diseño CAD rápido: escribe scripts OpenSCAD para soportes de motor con agujeros de tornillo, útil para iterar piezas imprimibles sin dominar el lenguaje CAD.
- Depuración asistida en el aula: explica y corrige errores Java típicos del SDK de FTC, lo que encaja en entornos educativos donde no se quiere enviar código a la nube.
- Soporte bilingüe para equipos turcos: al responder en turco e inglés, facilita la formación de estudiantes que aprenden robótica en turco pero consultan documentación en inglés.
- Prototipado local sin conexión: al pesar unos 3 GB en fp16 y ejecutarse en una T4, permite desplegarlo en el portátil del taller o en una Colab gratuita durante la temporada de competición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB en fp16 para los pesos; en la práctica, 4-6 GB con caché KV y overhead de inferencia para secuencias cortas.
- Cuantización: al ser safetensors fp16, es convertible a GGUF (Q4_K_M ≈ 1 GB, Q8 ≈ 1,6 GB) con llama.cpp, lo que permitiría ejecución en CPU.
- GPU recomendadas: NVIDIA T4 (usada en el entrenamiento), RTX 3060/4060 en adelante; cualquier GPU con ≥6 GB de VRAM en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y similares; también en Colab T4 gratuita.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada; el autor recomienda temperatura 0,2-0,4 y `max_new_tokens=400` para código fiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mithra-2B | ≈1,5B | No disponible | FTC/FRC, OpenSCAD, TR/EN | MIT | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | ≈1,5B | No disponible en la información | Código general | Apache 2.0 (según modelo base) | Hugging Face |
| Modelos de código pequeños de propósito general | No disponible | No disponible | Código general | Variable | Hugging Face |

La comparación directa con alternativas especializadas en robótica FTC/FRC no está disponible en la información proporcionada. El principal referente es su propio modelo base, Qwen2.5-Coder-1.5B-Instruct, del que hereda arquitectura y capacidades generales de código, añadiendo el sesgo hacia FTC/FRC y el bilingüismo turco.

## Limitaciones y advertencias

- El entrenamiento usó solo 1.200 filas de un dataset genérico de instrucciones de código, no datos específicos de FTC/FRC; la especialización puede ser superficial y propensa a errores en APIs concretas del SDK.
- Riesgo de alucinación en nombres de clases, métodos y constantes del SDK de FTC/WPILib; el código generado debe revisarse y compilarse siempre.
- Longitud de contexto no documentada; el entrenamiento se limitó a 768 tokens, por lo que el rendimiento en contextos largos es incierto.
- Idiomas limitados a turco e inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-Coder tiene su propia licencia (Apache 2.0 según la información del modelo base) que conviene verificar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Modelo pequeño (≈1,5B): capacidad de razonamiento y de código complejo limitada en comparación con modelos de 7B o superiores.
- El nombre "2B" puede inducir a error sobre el tamaño real (≈1,5B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bedirhn77/Mithra-2B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/iamtarun/code_instructions_120k_alpaca
- Web del equipo: https://ftcerror.com
- Documentación de PEFT: https://huggingface.co/docs/peft
- Licencia MIT: https://opensource.org/licenses/MIT
