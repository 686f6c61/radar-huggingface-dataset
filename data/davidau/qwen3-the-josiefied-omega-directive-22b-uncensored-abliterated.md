# DavidAU/Qwen3-The-Josiefied-Omega-Directive-22B-uncensored-abliterated

## Resumen

Qwen3-The-Josiefied-Omega-Directive-22B-uncensored-abliterated es un modelo de lenguaje de 22.035 millones de parámetros publicado por DavidAU en Hugging Face. Se trata de un merge de tres modelos basados en Qwen3-14B: The-Omega-Directive-Qwen3-14B-v1.1 (de ReadyArt), Josiefied-Qwen3-14B-abliterated-v3 (de Goekdeniz-Guelmez) y el propio Qwen3-14B original de Alibaba. El resultado es un modelo de 62 capas que combina las capacidades de razonamiento de Qwen3 con un afinado orientado a escritura creativa, ficción y roleplay, y con las restricciones de seguridad eliminadas mediante técnicas de abliteration.

El modelo resuelve el problema de la generación de contenido creativo sin filtros de seguridad, orientado a escritura de ficción, narrativa visceral, terror, romance y roleplay. Mantiene el modo de razonamiento de Qwen3 (activabe y desactivable mediante etiquetas `<think>`), lo que permite alternar entre generación directa y razonamiento extendido. La ventana de contexto declarada por el autor es de 40.000 tokens, aunque el modelo base Qwen3-14B soporta 32.768 tokens nativos (ampliables a 131.072 con YaRN).

Es relevante para desarrolladores e investigadores que necesitan un modelo sin censura para tareas creativas o de investigación sobre comportamiento de modelos, con licencia Apache 2.0 que permite uso comercial. No obstante, su naturaleza abliterated y su orientación a contenido NSFW lo hacen inadecuado para aplicaciones de producción orientadas al público general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 62 capas, resultado de merge |
| Parametros totales | 22.035.169.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.000 tokens (según el autor); 32.768 nativos en Qwen3-14B, ampliable a 131.072 con YaRN |
| Tipos de cuantizacion | GGUF, GPTQ, EXL2, AWQ, HQQ (generables desde los safetensors); el autor publica variantes GGUF |
| Idiomas soportados | en, fr, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF disponible en repos derivados |
| Tamano del repositorio | 44,1 GB |
| Tipo de modelo | Merge de finetunes (no entrenamiento desde cero) |
| Modo de razonamiento | Sí, activable/desactivable con etiquetas `<think>` |
| Temperatura recomendada | 0,4 a 2,5 (0,2 a 0,8 para tareas de razonamiento) |
| Repetición penalty | 1,05 |
| Top-k / Top-p / Min-p | 100 / 0,95 / 0,05 |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos derivados de Qwen3-14B, no un entrenamiento desde cero. La arquitectura subyacente es un transformer decoder-only de Qwen3 con 62 capas y 22.035 millones de parámetros totales. El merge combina los pesos de The-Omega-Directive-Qwen3-14B-v1.1 (afinado para escritura creativa y ficción) y Josiefied-Qwen3-14B-abliterated-v3 (versión abliterated que elimina los rechazos de seguridad), tomando como base el Qwen3-14B original. El resultado es un modelo de mayor tamaño que sus componentes (22B frente a 14B), lo que sugiere una fusión por concatenación o expansión de capas más que un simple promedio de pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el merge. El modelo conserva el modo de razonamiento de Qwen3, que permite generar cadenas de pensamiento internas dentro de etiquetas `<think>`. La abliteration se aplica para eliminar la dirección de rechazo en el espacio de activaciones, lo que permite generar contenido NSFW, violencia explícita y lenguaje soez sin negativas, aunque el autor advierte que en algunos casos el modelo necesita ser dirigido explícitamente para alcanzar el nivel de explicitud deseado.

## Capacidades

- Generación de texto creativo: ficción, narrativa visceral, terror, gore, romance, ciencia ficción y todos los géneros.
- Roleplay y conversación multi-turno con contexto largo (hasta 40.000 tokens según el autor).
- Modo de razonamiento activable y desactivable mediante etiquetas `<think>`; útil para tareas de planificación y razonamiento complejo.
- Generación de contenido NSFW y lenguaje soez sin rechazos (modelo abliterated).
- Capacidades multilingües limitadas a inglés, francés, chino y alemán.
- Escritura de prosa vívida y detallada, con énfasis en descripciones sensoriales y visceralidad.
- Generación de tramas, subtramas, continuación de escenas y desarrollo de personajes.
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se ha documentado soporte de agentes multi-paso ni capacidades de visión o audio.

## Casos de uso

- Escritura de ficción y narrativa: el modelo está afinado específicamente para generar prosa vívida y detallada en todos los géneros, con capacidad de mantener tramas y subtramas a lo largo de generaciones largas gracias a su contexto de 40.000 tokens. Adecuado para autores que necesitan borradores rápidos o asistencia en la continuación de escenas.
- Roleplay y juegos de rol textuales: su orientación a roleplaying, combinada con la ausencia de filtros de seguridad, permite gestionar personajes con personalidades complejas, diálogos con lenguaje soez y situaciones adultas sin interrupciones por rechazos. Se integra en frontends como SillyTavern, KoboldCpp o text-generation-webui.
- Generación de contenido de terror y horror: el modelo está explícitamente orientado a detalles viscerales, violencia y gore, lo que lo hace adecuado para guiones de terror, descripciones de escenas de horror cósmico o narrativa de suspense sin las restricciones habituales de los modelos alineados.
- Investigación sobre comportamiento de modelos: al ser un modelo abliterated, permite estudiar cómo la eliminación de la dirección de rechazo afecta a la generación, la coherencia y la calidad del texto en comparación con el Qwen3-14B original. Útil para investigadores que analizan sesgos, seguridad y alineación.
- Prototipado de videojuegos narrativos: puede generar diálogos de personajes no jugadores (NPC), descripciones de escenarios y ramificaciones de trama en tiempo real, con la ventaja de no rechazar contenido violento o adulto en juegos clasificados para adultos.
- Generación de contenido para comunidades de fanfiction: el modelo puede continuar historias existentes, generar escenas alternativas y explorar relaciones entre personajes sin las limitaciones de contenido de los modelos comerciales, con contexto suficiente para mantener la coherencia en capítulos largos.
- Experimentación con cuantizaciones: al publicarse los safetensors en bfloat16, los desarrolladores pueden generar versiones GGUF, GPTQ, EXL2, AWQ o HQQ para adaptar el modelo a distintos presupuestos de hardware, lo que facilita la experimentación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 44 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 48-50 GB de VRAM para contexto corto, y 60-80 GB para contexto largo (40.000 tokens).
- GPU recomendadas para bfloat16: A100 80GB, H100 80GB, o múltiples GPU (2× RTX 4090 de 24 GB con tensor parallelism, aunque con limitaciones de contexto).
- Cuantización GGUF Q4_K_M: aproximadamente 13-14 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- Cuantización GGUF Q5_K_M: aproximadamente 15-16 GB, cabe en GPU de 24 GB con contexto reducido.
- Cuantización GGUF Q8_0: aproximadamente 23-24 GB, requiere GPU de 24 GB con contexto muy limitado o GPU de 32 GB o superior.
- Consumer GPU: sí, en cuantizaciones Q4 y Q5 cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) con Q4 y contexto reducido; en RTX 4060 Ti (16 GB) solo con Q4 y contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, text-generation-webui (con llama_HF para GGUF), vLLM (para safetensors en bfloat16), TGI (text-generation-inference, etiquetado como compatible con endpoints), transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-The-Josiefied-Omega-Directive-22B | 22B | 40.000 | Apache 2.0 | Creativa, NSFW, abliterated | Hugging Face (DavidAU) |
| Qwen3-14B (original) | 14B | 32.768 (131.072 con YaRN) | Apache 2.0 | Generalista, alineado | Hugging Face (Qwen) |
| Josiefied-Qwen3-14B-abliterated-v3 | 14B | 32.768 | Apache 2.0 | Creativa, abliterated | Hugging Face (Goekdeniz-Guelmez) |
| The-Omega-Directive-Qwen3-14B-v1.1 | 14B | 32.768 | Apache 2.0 | Creativa, ficción | Hugging Face (ReadyArt) |

El modelo fusionado duplica aproximadamente el tamaño de sus componentes (22B frente a 14B), lo que puede mejorar la calidad de generación a costa de mayores requisitos de hardware. Frente al Qwen3-14B original, pierde las salvaguardas de seguridad y gana orientación creativa explícita. Frente a sus componentes individuales, combina las capacidades de ambos, aunque no se han publicado benchmarks que cuantifiquen la mejora.

## Limitaciones y advertencias

- Contenido NSFW y explícito: el modelo genera violencia, gore, lenguaje soez y contenido sexual sin filtros; no es adecuado para aplicaciones orientadas al público general ni para entornos laborales sin advertencias claras.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, especialmente en tareas de razonamiento factual; su orientación creativa agrava este riesgo en contextos que requieren precisión.
- Deriva lingüística: el autor advierte que el modelo puede generar ocasionalmente tokens en chino durante generaciones en otros idiomas.
- Repeticiones: en temperaturas bajas (por debajo de 0,7) y generaciones largas pueden aparecer párrafos repetidos; se recomienda ajustar la temperatura o usar regeneración.
- Razonamiento a temperaturas altas: por encima de 2,5 el modelo puede requerir que se le indique explícitamente que genere la respuesta tras el razonamiento.
- Idiomas limitados: solo inglés, francés, chino y alemán; no se ha documentado soporte para español ni otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto, violencia o difamación; el usuario es responsable del uso.
- Modelo de merge sin benchmarks: no se han publicado evaluaciones cuantitativas que permitan comparar su rendimiento con alternativas; la calidad es en gran medida anecdótica.
- Contexto declarado de 40.000 tokens: aunque el autor lo indica, no se ha verificado empíricamente la calidad de la atención a esa longitud; el modelo base Qwen3-14B tiene 32.768 tokens nativos, por lo que el valor de 40.000 puede requerir configuración adicional.
- No se ha documentado soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados que requieran interacción con herramientas externas.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3-The-Josiefied-Omega-Directive-22B-uncensored-abliterated
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Componente Josiefied-Qwen3-14B-abliterated-v3: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-14B-abliterated-v3
- Componente The-Omega-Directive-Qwen3-14B-v1.1: https://huggingface.co/ReadyArt/The-Omega-Directive-Qwen3-14B-v1.1
- Modelo hermano Xiaolong-Omega-Directive-22B: https://huggingface.co/DavidAU/Qwen3-The-Xiaolong-Omega-Directive-22B-uncensored-abliterated
- Modelo compuesto Xiaolong-Josiefied-Omega-Directive-22B: https://huggingface.co/DavidAU/Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B-uncensored-abliterated
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
