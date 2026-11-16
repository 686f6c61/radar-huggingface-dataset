# cosmicishan/Llama-3.1-8B-PDDL-CoT-Detailed

## Resumen

Llama-3.1-8B-PDDL-CoT-Detailed es un ajuste fino (fine-tuning) del modelo cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT, que a su vez deriva de la familia Llama 3.1 de Meta. Lo publica el usuario cosmicishan en Hugging Face y está especializado en la generación de planes en formato PDDL (Planning Domain Definition Language) mediante razonamiento en cadena de pensamiento (chain-of-thought). El problema que aborda es la traducción de descripciones de problemas de planificación en lenguaje natural a representaciones PDDL ejecutables, una tarea clásica en planificación automática (AI planning) que requiere tanto comprensión del lenguaje como rigor simbólico.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030.261.248 parámetros totales en pesos safetensors, y se distribuye bajo la licencia Llama 3.1. El repositorio ocupa 16,1 GB y el acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia actual reside en el uso de chain-of-thought para tareas de planificación simbólica, un ámbito donde los LLM generalistas suelen fallar por falta de estructura formal. Al estar construido sobre un modelo base de Meta, hereda sus capacidades generales de generación de texto, aunque la información publicada no detalla el proceso de entrenamiento ni los datos utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 8B, sin confirmar en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura transformer decoder-only de Llama 3.1 8B, con atención por ventanas y las optimizaciones propias de la familia Llama 3.1 de Meta. Se trata de un ajuste fino sobre cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT, que a su vez parte del modelo base Llama 3.1 8B. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación declarada es el uso de chain-of-thought aplicado a la generación de PDDL, de modo que el modelo produce un razonamiento intermedio antes de emitir el dominio o el problema en formato PDDL. No se han publicado detalles sobre la estrategia de ajuste (LoRA, full fine-tuning, etc.), la composición de los datos de instrucciones ni las técnicas de alineación empleadas. Tampoco se documenta si se modificó la longitud de contexto respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento en cadena de pensamiento (chain-of-thought) orientado a tareas de planificación.
- Generación de dominios y problemas en formato PDDL a partir de descripciones en lenguaje natural.
- Razonamiento multi-paso para descomponer un problema de planificación en predicados, acciones y objetivos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento CoT para planificación; no se documenta integración con frameworks de agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Generación de dominios PDDL: el modelo puede recibir una descripción textual de un entorno (por ejemplo, logística, robótica o scheduling) y producir el dominio PDDL con predicados y acciones, gracias a su ajuste específico sobre datos de planificación.
- Formulación de problemas PDDL: a partir de un enunciado en lenguaje natural con objetos, estado inicial y objetivo, el modelo genera el fichero de problema listo para un planificador como Fast Downward o VAL.
- Asistencia a investigadores en planificación automática: sirve como borrador inicial de modelos formales que el investigador revisa y corrige, reduciendo el tiempo de codificación manual de dominios.
- Educación en IA simbólica: útil para generar ejemplos didácticos de dominios y problemas PDDL con razonamiento intermedio visible, lo que facilita explicar la traducción de lenguaje natural a lógica.
- Prototipado de pipelines de planificación: integrado en un flujo que encadene generación PDDL, validación con VAL y ejecución en un planificador, permite experimentar con la traducción automática de especificaciones.
- Generación de variantes de problemas para benchmarking: el modelo puede producir múltiples instancias PDDL de un mismo dominio para ampliar conjuntos de test en evaluación de planificadores.
- Documentación técnica de dominios: puede redactar explicaciones en lenguaje natural del razonamiento seguido para llegar a un dominio PDDL, útil en informes y auditorías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB o más para contextos largos.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos, con margen adicional para el contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB para pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) también es viable en fp16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requiere cuantización (4 u 8 bits) mediante llama.cpp, Ollama o similar.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM si se generan pesos GGUF o se sirve el modelo completo, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-PDDL-CoT-Detailed | 8,03 B | no disponible | PDDL + chain-of-thought | llama3.1 | Gated en Hugging Face |
| Llama 3.1 8B (Meta) | 8,03 B | 128 K (según ficha oficial de Meta) | Generación de texto general | llama3.1 | Abierto en Hugging Face |
| cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT | 8,03 B | no disponible | PDDL + chain-of-thought (modelo base del ajuste) | llama3.1 | Hugging Face |

La comparación con alternativas especializadas en PDDL de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones de Hugging Face, lo que puede retrasar o impedir el uso automatizado en pipelines.
- Licencia Llama 3.1: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de desplegar en producción.
- Sesgos: no documentados; al derivar de Llama 3.1 8B, puede heredar sesgos del modelo base, pero no se han publicado evaluaciones al respecto.
- Riesgo de alucinación: especialmente relevante en PDDL, donde un dominio sintácticamente válido puede ser semánticamente incorrecto; se recomienda validar la salida con herramientas como VAL o un planificador antes de usarla.
- Idiomas: no se especifican los idiomas soportados; el ajuste parece orientado a inglés por la naturaleza de los datasets de planificación, pero no está confirmado.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; no se debe asumir la ventana de 128 K de Llama 3.1 sin verificación.
- Datos de entrenamiento y benchmarks no publicados: impide evaluar la calidad real frente a alternativas y dificulta la reproducibilidad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cosmicishan/Llama-3.1-8B-PDDL-CoT-Detailed
- Modelo base del ajuste: https://huggingface.co/cosmicishan/Llama-3.1-8B-PDDL-CoT-SFT
- Modelo original Llama 3.1 8B de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
