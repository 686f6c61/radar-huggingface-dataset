# reaperdoesntknow/LFM2.5-2.6B-CyberSec

## Resumen

LFM2.5-2.6B-CyberSec es un checkpoint de ajuste fino del modelo LFM2.5-2.6B de Liquid AI, especializado en instrucciones de ciberseguridad. Ha sido desarrollado por el usuario de Hugging Face reaperdoesntdoesntknow y entrenado sobre el dataset público Trendyol Cybersecurity Instruction Tuning Dataset. El modelo base es un transformer denso de 2.6B parámetros con una ventana de contexto de 128K tokens y capacidades agénticas nativas (tool calling, planificación y ejecución multi-paso), diseñado para ejecutarse en dispositivos locales con menos de 2.5 GB de memoria.

Este checkpoint se publica en formatos Transformers (safetensors) y GGUF (F16, Q8_0, Q4_K_M), lo que permite su uso tanto en entornos Python con Hugging Face como en runtimes como llama.cpp u Ollama. Es relevante porque aborda un dominio de alto riesgo (ciberseguridad) con un modelo pequeño y eficiente, aunque el autor advierte explícitamente que no se han publicado evaluaciones de seguridad ni benchmarks que demuestren una mejora real sobre el modelo base. La licencia Apache-2.0 permite uso comercial y modificación, pero el material es de doble uso y requiere precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura no detallada en la informacion disponible) |
| Parametros totales | 2.697.198.592 (~2.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q4_K_M; Transformers con bloque de cuantizacion bitsandbytes 4-bit |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un transformer denso de 2.6B parametros desarrollado por Liquid AI, optimizado para cargas de trabajo agénticas. Segun la documentacion oficial, soporta una ventana de contexto de 128K tokens y tool calling nativo, lo que le permite planificar y ejecutar tareas multi-paso a 220 tokens por segundo en menos de 2.5 GB de memoria. No se especifican detalles sobre la atencion (si es lineal, esparsa o estandar) en la informacion disponible.

El checkpoint CyberSec se obtuvo mediante ajuste fino supervisado sobre el dataset Trendyol Cybersecurity Instruction Tuning Dataset, que contiene instrucciones y conversaciones relacionadas con seguridad informatica. El autor no documenta el proceso de entrenamiento (numero de epochs, hiperparametros, tecnicas de alineacion como RLHF o DPO, ni criterios de seleccion de checkpoints). Tampoco se informa sobre la composicion exacta del dataset ni sobre posibles filtros de contaminacion. La model card indica que la mejora en capacidades de ciberseguridad no esta establecida por los hechos observados (etiqueta del dataset y archivos exportados).

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat incluida en el repositorio.
- Capacidades agénticas heredadas del modelo base: planificacion de tareas, tool calling y ejecucion multi-paso (segun la documentacion de Liquid AI).
- Procesamiento de contexto largo gracias a la ventana de 128K tokens.
- Conocimiento especifico de ciberseguridad adquirido mediante el ajuste fino con el dataset de Trendyol, aunque sin evidencia publica de mejora sobre el base.
- Soporte de cuantizacion GGUF para despliegue en runtimes locales como llama.cpp y Ollama.
- Compatible con la libreria Transformers de Hugging Face, incluyendo integracion con bitsandbytes para cuantizacion 4-bit.

## Casos de uso

- Investigacion academica sobre modelos pequenos en dominios especializados: permite comparar el comportamiento de un modelo de 2.6B frente a su base sin ajuste en tareas de ciberseguridad, utilizando el harness de evaluacion que el investigador prefiera.
- Desarrollo de prototipos de asistentes de concienciacion en seguridad: el modelo puede generar explicaciones sencillas sobre conceptos como "defense in depth" o politicas de contrasenas, utiles para formacion interna, siempre con supervision humana.
- Pruebas de formatos y cuantizacion: al incluir tanto safetensors como GGUF en varias precisiones, sirve para evaluar diferencias de rendimiento y fidelidad entre el checkpoint original y sus versiones cuantizadas en tareas concretas.
- Integracion en pipelines de analisis de logs o documentacion tecnica: puede resumir o clasificar fragmentos de texto relacionados con incidentes de seguridad, aunque las salidas deben revisarse antes de cualquier accion.
- Evaluacion de riesgos de modelos de doble uso: dado su dominio, es un caso de estudio para medir la capacidad de generar instrucciones potencialmente peligrosas y disenar contramedidas.
- Desarrollo de herramientas educativas de ciberseguridad: puede usarse en entornos controlados para simular escenarios de phishing o ingenieria social, con fines de entrenamiento, bajo estrictas medidas de aislamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluyen comparaciones con el modelo base ni evaluaciones de seguridad. El autor menciona la necesidad de pruebas con conjuntos de test separados, benchmarks nombrados de ciberseguridad y capacidades generales, y resultados reproducibles para establecer cualquier afirmacion de mejora.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - F16 (Transformers): ~5.4 GB (2.7B parametros x 2 bytes).
  - GGUF Q8_0: ~2.7 GB.
  - GGUF Q4_K_M: ~1.6 GB.
  - Cuantizacion 4-bit bitsandbytes: similar a Q4_K_M (~1.6-2 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., RTX 3050, RTX 4060) para las versiones cuantizadas. Para F16 se recomienda 6 GB o mas (RTX 3060, RTX 4070, etc.).
- El modelo base esta disenado para ejecutarse en menos de 2.5 GB, por lo que cabe en GPUs integradas o en CPU con llama.cpp.
- Opciones de despliegue: Transformers con device_map="auto", llama.cpp (llama-cli), Ollama (comando incluido en la model card), y potencialmente vLLM o TGI si se adapta.
- Latencia y throughput: el modelo base alcanza 220 tok/s en hardware optimizado (segun Liquid AI), pero el checkpoint ajustado puede variar. No se dispone de mediciones propias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Como referencia cualitativa, se pueden considerar otros modelos de ~2.6B con licencia abierta:

| Modelo | Parametros | Contexto | Capacidades destacadas | Licencia |
|---|---|---|---|---|
| LFM2.5-2.6B-CyberSec (este) | 2.7B | 128K | Ajuste en ciberseguridad, tool calling | Apache-2.0 |
| Qwen2.5-3B | 3.1B | 32K (base) | Multilingue, razonamiento, codigo | Apache-2.0 |
| Gemma-2-2.6B | 2.6B | 8K | Texto general, razonamiento | Gemma License (uso comercial permitido con restricciones) |
| SmolLM2-1.7B | 1.7B | 8K | Eficiente, conversacional | Apache-2.0 |

La comparacion no es exhaustiva y no se basan en resultados medidos, sino en caracteristicas declaradas. Para una evaluacion rigurosa se necesitarian benchmarks comunes como MMLU, HumanEval o GSM8K, que no estan publicados para este checkpoint.

## Limitaciones y advertencias

- El modelo puede producir instrucciones incorrectas, obsoletas, inseguras o daninas en el dominio de ciberseguridad.
- El material de ciberseguridad es inherentemente de doble uso: lo que sirve para defender tambien puede usarse para atacar.
- No se documentan el preprocesamiento del dataset, los chequeos de contaminacion, los hiperparametros completos ni los criterios de seleccion del checkpoint.
- Las versiones cuantizadas (GGUF y bitsandbytes) pueden comportarse de forma diferente al checkpoint original en Transformers.
- No se debe ejecutar ningun comando generado por el modelo sin revision y aislamiento.
- No debe usarse como base unica para decisiones de respuesta a incidentes, divulgacion de vulnerabilidades, control de accesos u otras decisiones con consecuencias criticas.
- Solo soporta ingles; no se garantiza rendimiento en otros idiomas.
- El autor no ha publicado evaluaciones de seguridad, sesgos o alucinaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-2.6B-CyberSec
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Pagina en OpenRouter: https://openrouter.ai/liquid/lfm-2.5-2.6b:free
- Coleccion CIx de modelos de ciberseguridad: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
