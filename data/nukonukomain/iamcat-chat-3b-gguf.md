# nukonukomain/IAmCat-chat-3B-GGUF

## Resumen

IAmCat-chat-3B-GGUF es un modelo de conversación en japonés publicado por el usuario nukonukomain en HuggingFace. Se trata de un ajuste fino mediante QLoRA sobre Qwen/Qwen2.5-3B-Instruct, usando 1.500 muestras del conjunto llm-jp/oasst1-21k-ja, fusionado en 16 bits y convertido posteriormente a formato GGUF. El resultado se distribuye en dos únicos ficheros (Q4_K_M y F16) que ya incluyen base y adaptadores, de modo que basta un solo archivo para inferir.

El modelo resuelve un problema acotado: disponer de un chat japonés ligero que funcione en local, sin GPU dedicada y sin dependencias de servicios en la nube, sobre llama.cpp, LM Studio u Ollama. Con 3.085.938.688 parámetros (aproximadamente 3,1B), entra en el rango de los modelos pequeños que caben holgadamente en GPUs de consumo e incluso en CPU.

Su relevancia es limitada y experimental: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, el entrenamiento es deliberadamente mínimo (1 época, 1.500 ejemplos, longitud de secuencia 1024) y el propio autor advierte de que el estilo aprendido se impone poco sobre la versatilidad del modelo base. Es, por tanto, una pieza interesante como ejemplo de pipeline QLoRA + GGUF en japonés, no como modelo de producción de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); ajuste fino QLoRA y conversión a GGUF |
| Parámetros totales | 3.085.938.688 (aproximadamente 3,1B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como especificación propia del modelo. La model card recomienda operar entre 2048 y 4096 tokens; el contexto nativo del modelo base no se detalla en la información proporcionada |
| Tipos de cuantización | Q4_K_M (aproximadamente 2,0 GB, recomendada) y F16 (aproximadamente 5,9 GB, sin cuantizar) |
| Idiomas soportados | Japonés (principal); inglés parcial. El resto de idiomas no está garantizado |
| Licencia | Apache 2.0 (heredada del modelo base Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (fichero único con base y ajuste ya fusionados, exportado desde un merge en 16 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only de aproximadamente 3,1B de parámetros, sobre el que se aplica un ajuste supervisado con QLoRA. La configuración del adaptador es r=16, alpha=16 y módulos objetivo q/k/v/o/gate/up/down, es decir, atención completa más las proyecciones del MLP. El entrenamiento usó 1.500 ejemplos muestreados de llm-jp/oasst1-21k-ja, una única época, tasa de aprendizaje 2e-4 con scheduler lineal y warmup de 10 pasos, batch efectivo de 8 (2 por dispositivo × 4 de acumulación de gradiente) y longitud de secuencia de 1024 tokens. El marco empleado fue Unsloth.

Tras el entrenamiento, los pesos se fusionaron con la base en precisión de 16 bits y se convirtieron a GGUF con llama.cpp. No se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni mezcla de expertos. Tampoco se indica si hubo fases de RLHF o DPO posteriores al ajuste supervisado; la información disponible solo describe el entrenamiento QLoRA sobre datos de instrucciones. La plantilla de chat es la de Qwen (`<|im_start|>` / `<|im_end|>`), tal como refleja el Modelfile de ejemplo para Ollama.

## Capacidades

- Generación de texto conversacional en japonés con formato de chat multi-turno (system, user, assistant).
- Comprensión y producción parcial de inglés, según declara el autor; el rendimiento fuera del japonés no está evaluado.
- Respuesta a preguntas factuales simples, con la advertencia explícita de riesgo de alucinación en el propio repositorio.
- Estilo de respuesta ligeramente inclinado al corpus oasst1-ja, aunque el autor indica que este efecto es «moderado» por el escaso volumen de datos.
- Ejecución offline completa: no requiere llamadas a servicios externos ni telemetría.
- Soporte de los parámetros de muestreo habituales (temperature, top_p, top_k, repetition_penalty, max_new_tokens).
- No se documenta soporte de tool calling, function calling, razonamiento agéntico multi-paso, visión, audio ni modo «thinking». Al ser un ajuste de un modelo de 3B sin datos específicos de herramientas, estas capacidades no deben asumirse.

## Casos de uso

- Chat japonés totalmente offline en portátil: el fichero Q4_K_M ocupa unos 2,0 GB y puede cargarse con llama.cpp u Ollama en un equipo sin GPU, cubriendo conversaciones de 2048 a 4096 tokens de contexto para consultas cotidianas o prototipos de interfaz conversacional.
- Evaluación rápida de pipelines QLoRA + GGUF: sirve como referencia reproducible para equipos que quieran replicar el flujo (Unsloth → merge 16 bits → llama.cpp) con un dataset japonés de instrucciones y verificar el resultado antes de invertir en ajustes mayores.
- Asistente de privacidad en entornos sanitarios o legales japoneses: al ejecutarse en local y bajo Apache 2.0, permite desplegar un chat de triaje o de preguntas frecuentes sin que los datos de los usuarios salgan de la máquina, siempre que las respuestas se validen por personal humano.
- Demo educativa de modelos pequeños en aula: con 2 GB de pesos se puede mostrar en una única sesión cómo funcionan la cuantización, la plantilla de chat de Qwen y los parámetros de muestreo, sin necesidad de infraestructura GPU.
- Base para un ajuste posterior de dominio: al conservar la licencia Apache 2.0 del modelo base, es lícito continuar el entrenamiento con datos propios (por ejemplo, atención al cliente de una tienda japonesa) partiendo de este checkpoint ya adaptado al registro conversacional japonés.
- Generación de texto breve para herramientas internas: respuestas de una a dos frases (max_new_tokens entre 128 y 512) en tareas de etiquetado, resumen muy corto o reformulación de mensajes en japonés, donde la latencia en CPU es aceptable.
- Pruebas de integración con LM Studio u Ollama: el repositorio incluye instrucciones concretas para ambos entornos, lo que facilita usarlo como banco de pruebas de una aplicación antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, JGLUE ni de ningún otro conjunto, y tampoco se aportan evaluaciones comparativas frente al modelo base. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia antes de tomar decisiones de despliegue.

## Requisitos de hardware

- VRAM estimada: en torno a 2,5-3 GB con Q4_K_M (2,0 GB de pesos más caché KV para 2048-4096 tokens); en torno a 6,5-7 GB con F16 (5,9 GB de pesos más caché KV).
- GPUs recomendadas: cualquier GPU con 6 GB o más para Q4_K_M (RTX 3060, RTX 4060, RTX 2070, Tesla T4); 8 GB o más para F16 (RTX 3070, RTX 4060 Ti 16 GB, RTX 4070, A10). En A100 o H100 el modelo está sobredimensionado en infraestructura pero funciona sin problema.
- GPU de consumo: sí. Q4_K_M cabe completo en una GTX 1650 de 4 GB o en una RTX 3050 de 6 GB; F16 requiere al menos 8 GB para evitar offload parcial.
- CPU: viable con Q4_K_M gracias al tamaño reducido, aunque el throughput será de pocos tokens por segundo en procesadores de escritorio; el repositorio no publica cifras concretas.
- Opciones de despliegue documentadas: llama.cpp (llama-cli con `-cnv` o `-no-cnv`), LM Studio, Ollama (con Modelfile propio usando la plantilla ChatML de Qwen) y llama-cpp-python (`create_chat_completion`).
- Opciones no soportadas de forma nativa: vLLM y TGI no cargan GGUF de manera estándar; para usarlas habría que reconvertir los pesos a safetensors, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. El autor solo indica parámetros de generación recomendados (temperature 0,7, top_p 0,9, top_k 40, repetition_penalty 1,1, max_new_tokens 128-512).

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de su documentación pública habitual y no han sido verificados dentro de la información proporcionada; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato disponible | Rendimiento |
|---|---|---|---|---|---|---|
| IAmCat-chat-3B-GGUF | 3,09B | 2048-4096 recomendado (nativo del base no detallado) | Japonés, inglés parcial | Apache 2.0 | GGUF (Q4_K_M, F16) | Sin benchmarks publicados |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32 768 tokens según documentación del modelo base | Multilingüe amplio | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Benchmarks públicos del modelo base; no replicados aquí |
| Llama 3.2 3B Instruct | 3,21B | 128 000 tokens según documentación del modelo | Multilingüe (8 idiomas declarados) | Llama 3.2 Community License | Safetensors, GGUF | Benchmarks públicos; no comparados aquí |
| Gemma 2 2B IT | 2,61B | 8192 tokens según documentación del modelo | Multilingüe | Gemma Terms of Use | Safetensors, GGUF | Benchmarks públicos; no comparados aquí |
| Phi-3.5-mini-instruct | 3,82B | 128 000 tokens según documentación del modelo | Multilingüe | MIT | Safetensors, GGUF | Benchmarks públicos; no comparados aquí |

Frente a estas alternativas, IAmCat-chat-3B no aporta mejoras medibles: su ventaja es la especialización en japonés conversacional y la simplicidad de un único fichero GGUF con licencia permisiva; su desventaja es un contexto efectivo mucho menor y la ausencia total de evaluaciones.

## Limitaciones y advertencias

- Modelo base de 3B: el propio autor reconoce limitaciones en razonamiento complejo, coherencia en textos largos y preguntas factuales avanzadas.
- Riesgo de alucinación explícitamente señalado; no debe usarse para datos verificables sin comprobación humana.
- Entrenamiento con solo 1.500 ejemplos y 1 época: el efecto del ajuste es «moderado» según el autor, por lo que el comportamiento real se parece en buena medida al de Qwen2.5-3B-Instruct.
- Contexto práctico reducido: la model card recomienda 2048-4096 tokens, muy por debajo de lo que ofrecen otros modelos de su tamaño; no se documenta el contexto nativo en esta ficha.
- Cobertura idiomática limitada al japonés, con inglés parcial. No hay evaluación de español ni de otras lenguas; se espera un rendimiento bajo.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad. El corpus oasst1-ja aporta el sesgo propio de datos de instrucciones generados por voluntarios.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor remite a la licencia del modelo base; conviene conservar los avisos de atribución a Qwen Team, llm-jp, Unsloth y llama.cpp.
- Ausencia de benchmarks y de un pipeline declarado en HuggingFace (campo vacío), junto con 0 descargas, implica que no hay validación comunitaria del comportamiento del modelo.
- Metadatos a revisar: la fecha de creación del repositorio figura como 2026-10-25, posterior a la fecha habitual de consulta; conviene verificar la fidelidad de los campos antes de citarlos.
- No se debe asumir soporte de tool calling ni de razonamiento agéntico: no hay datos de entrenamiento orientados a ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nukonukomain/IAmCat-chat-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/llm-jp/oasst1-21k-ja
- llama.cpp (conversión y ejecución GGUF): no se proporciona enlace en la información disponible
- Unsloth (marco de ajuste fino): no se proporciona enlace en la información disponible
- Paper o blog técnico del autor: no disponible
- Demo: no disponible
