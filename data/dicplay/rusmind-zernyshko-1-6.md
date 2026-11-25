# DICPlay/RusMind-Zernyshko-1.6

## Resumen

RusMind Zernyshko 1.6 es un modelo de lenguaje de 83 millones de parámetros desarrollado por DICPlay, entrenado desde cero sobre un corpus propio en ruso y con un tokenizador BPE propio de 16.000 tokens. Se presenta como la variante "diminuta" de la familia RusMind, disenada para ejecutarse completamente en local sobre hardware muy limitado, incluyendo dispositivos de gama baja. El modelo emplea una arquitectura transformer propia (requiere `trust_remote_code=True`) con 10 capas y dimension oculta de 768, y una ventana de contexto de 1024 tokens.

Su relevancia radica en el enfoque: en lugar de competir en escala, el autor reivindica un rendimiento desproporcionado en tareas especificas del ruso (cultura, refranes, personajes, puntuacion) frente a modelos decenas de veces mayores, segun sus propias mediciones en el leaderboard MERA 2.0. El formato de dialogo es ChatML y su licencia es propia (RusMind License), con restricciones para uso comercial.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face; los resultados de benchmarks proceden de las afirmaciones del autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propia (RusMind AI), 10 capas x 768, requiere `trust_remote_code=True` |
| Parametros totales | 83.083.008 (~83 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (existe version GGUF en repo aparte para llama.cpp/Ollama/LM Studio) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia; gratuita para uso personal, no comercial, investigacion y evaluacion; uso comercial solo por contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero ("from-scratch") sobre un corpus ruso propio, con tokenizador BPE de 16.000 tokens construido especificamente para el idioma. La arquitectura es propia de RusMind AI (10 capas, dimension 768), lo que obliga a cargar el modelo con `trust_remote_code=True` en transformers. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos) mas alla de la eleccion de un tokenizador reducido y un modelo de muy bajo parametraje orientado a inferencia offline. El formato de dialogo es ChatML, gestionado mediante `apply_chat_template`.

## Capacidades

- Generacion de texto conversacional en ruso, con formato de dialogo ChatML.
- Razonamiento basico y respuesta a preguntas, con resultados medidos en MERA 2.0 (Reasoning 0,119).
- Conocimiento cultural ruso especifico: refranes y sabiduria popular (RUBIN 0,282), personajes (Characters 0,186), tareas LIMUR (0,222) y Culture Specific (0,103).
- Puntuacion y ortografia en ruso (SAGE PUNCT_F1 0,267).
- Ejecucion completamente offline sobre hardware de muy baja potencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ruso; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales en ruso embebidos en dispositivos de gama baja: el modelo cabe en ~167 MB y puede ejecutarse en telefonos basicos, electrodomesticos inteligentes o sistemas con recursos minimos, gestionando dialogos de hasta 1024 tokens.
- Correccion de puntuacion y ortografia en textos rusos: su resultado en SAGE (PUNCT_F1 0,267) lo hace util como paso de postprocesado en pipelines editoriales o de transcripcion en ruso.
- Sistemas educativos sobre cultura y folclore ruso: el alto rendimiento declarado en RUBIN (refranes) y Characters permite construir aplicaciones de preguntas y respuestas sobre sabiduria popular y personajes.
- Prototipado e investigacion de modelos desde cero: sirve como banco de pruebas para estudiar tokenizadores BPE pequenos y arquitecturas compactas en un idioma concreto, con licencia gratuita para investigacion.
- Filtrado y clasificacion tematica de contenido ruso: puede emplearse para tareas ligeras de etiquetado o generacion de respuestas cortas en entornos sin conectividad.
- Despliegue en entornos aislados o sin red: al funcionar 100% offline, es adecuado para escenarios con requisitos de privacidad o sin acceso a internet, siempre que las necesidades sean en ruso y de baja complejidad.
- Juguetes educativos y demos interactivas: su reducido tamano permite integrarlo en dispositivos con microcontroladores o placas de bajo coste para demostraciones de IA conversacional en ruso.

## Benchmarks y rendimiento

Resultados declarados por el autor en MERA 2.0 (Exact match, leaderboard publico). No verificados de forma independiente.

| Metrica | Zernyshko 1.6 (83 M) | SmolLM-3B (3 B) |
|---|---|---|
| Puntuacion global | 0,049 | 0,049 |
| Reasoning | 0,119 | 0,063 |
| Culture Specific | 0,103 | 0,090 |
| RUBIN (refranes) | 0,282 | 0,042 |
| LIMUR | 0,222 | 0,102 |
| Characters | 0,186 | 0,116 |

Comparaciones adicionales citadas por el autor:

| Metrica | Zernyshko 1.6 | Modelos de referencia |
|---|---|---|
| RUBIN | 0,282 | Qwen3.5-4B: 0,259; gemma-4-E2B: 0,249; GFusion-10B-A1.8B: 0,183 |
| Characters | 0,186 | GFusion-10B-A1.8B: 0,166 |
| LIMUR | 0,222 | GFusion-10B-A1.8B: 0,217 |
| Culture Specific | 0,103 | Qwen3.5-4B: 0,057 |
| SAGE PUNCT_F1 | 0,267 | Qwen3.5-4B: 0,032; gemma-4-E2B: 0,159 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (~332 MB de pesos) y en torno a 170 MB en cuantizacion de 8 bits; el repo ocupa 0,2 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, integradas) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en hardware embebido; el autor afirma haberlo ejecutado en un Nokia N95, un frigorifico inteligente y una tetera (afirmacion no verificada).
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, Ollama y LM Studio mediante el repositorio GGUF `DICPlay/RusMind-Zernyshko-1.6-GGUF`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.6 | 83 M | 1024 | Ruso | RusMind License (comercial restringido) | Hugging Face, GGUF |
| SmolLM-3B | 3 B | no disponible en la informacion | Multilingue (incluye ruso) | no disponible en la informacion | Hugging Face |
| Qwen3.5-4B | 4 B | no disponible en la informacion | Multilingue | no disponible en la informacion | Hugging Face |
| gemma-4-E2B | 2 B (aprox.) | no disponible en la informacion | Multilingue | no disponible en la informacion | Hugging Face |

La comparacion relevante es de eficiencia por parametro en tareas rusas: Zernyshko 1.6 iguala o supera a SmolLM-3B en MERA 2.0 global y lo supera ampliamente en Reasoning, RUBIN, LIMUR y Characters, con 36 veces menos parametros, segun datos del autor.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (1024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Modelo monolingue en ruso; no se declaran capacidades en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas fuera de su dominio; con 83 M de parametros, la coherencia en generacion abierta es limitada.
- Resultados de benchmarks autoinformados por el autor y no verificados de forma independiente; conviene tratarlos con cautela.
- Licencia restrictiva: el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay.
- Requiere `trust_remote_code=True` por arquitectura propia, lo que implica ejecutar codigo del autor; auditar antes de usar en produccion.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, lo que dificulta evaluar riesgos.
- No soporta tool calling ni flujos de agentes; no apto para pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Version GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Leaderboard MERA 2.0: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
