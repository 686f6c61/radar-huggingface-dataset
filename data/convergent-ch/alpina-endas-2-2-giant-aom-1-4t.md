# Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T

## Resumen

Alpina Endas 2.2 Giant-Aom-1.4T es un paquete experimental publicado por Convergent-ch bajo el paraguas de "Army of Models" (AoM) de AlpinaAI. No se trata de un modelo denso ni de una mezcla de expertos entrenada de forma convencional, sino de un runtime multi-agente que orquesta 202 contextos de conversación sobre dos pesos base compartidos de la familia Qwen2.5 (7B y 14B) y nueve adaptadores LoRA entrenados. El repositorio incluye el paquete completo de inferencia: pesos base, adaptadores, 200 ficheros de réplica, tokenizadores, configuración de enrutado, runtime de comunicación, dependencias fijadas, instaladores y pruebas.

El modelo resuelve un problema concreto: coordinar respuestas especializadas (código, lógica, matemáticas, física, conocimiento general, investigación) mediante un grafo de dependencias planificado por un Input-Divisor de 14B y sintetizado por un segundo Input-Divisor del mismo tamaño. La cifra de 1,4T que aparece en el nombre es una suma aritmética nominal (200 × 7B + 2 × 14B = 1,428T) que corresponde a copias con pesos compartidos, no a parámetros únicos aprendidos. Es relevante ahora como ejemplo de arquitectura multi-agente empaquetada y reproducible, pero conviene subrayar que la inferencia real no se ejecutó durante la publicación y que el rendimiento efectivo no está verificado.

La relevancia práctica es limitada: el paquete pesa unos 25-27 GB, requiere CUDA 12.6 sobre Windows o Linux con GPU NVIDIA, y no es compatible con Ollama sin modificar ni con inferencia en Apple o móvil. Está pensado como artefacto de investigación reproducible, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Army of Models (AoM): runtime multi-agente sobre Qwen2.5-7B-Instruct y Qwen2.5-14B-Instruct con adaptadores LoRA; 202 contextos, 9 adaptadores entrenados |
| Parametros totales | 1,428T nominales (suma de 200 × 7B + 2 × 14B con pesos compartidos); no son parámetros únicos aprendidos |
| Parametros activos | no disponible (no es un MoE entrenado; las copias comparten pesos) |
| Longitud de contexto | no disponible (heredada de Qwen2.5; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el paquete incluye bases en safetensors y una base de 14B en bnb-4bit como referencia de entrenamiento) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bases y adaptadores); runtime Python propio con dependencias fijadas |

## Arquitectura y entrenamiento

La arquitectura es un grafo de comunicación multi-agente con dos roles diferenciados. Un Input-Divisor de planificación, basado en Qwen2.5-14B con un adaptador específico, recibe la petición y devuelve un grafo de dependencias verificado entre familias. A continuación, 200 especialistas repartidos en siete familias (código: 100 contextos; lógica: 20; matemáticas: 20; física: 20; helper/chat: 20; conocimiento general: 10; investigación: 10) contribuyen mediante contextos separados con extractos atribuidos. Un segundo Input-Divisor de síntesis, también Qwen2.5-14B con adaptador propio, revisa 17 grupos y combina las revisiones en la respuesta final. Un intercambio normal implica 219 llamadas sobre 202 identidades, con las bases compartidas cargadas de forma secuencial, no en paralelo.

El entrenamiento consistió en LoRA sobre los pesos base de Qwen2.5: siete adaptadores especialistas (uno por familia, copiado en las réplicas correspondientes) y dos adaptadores Input-Divisor, cada uno de estos últimos con 400 pasos de optimizador. Los pasos de entrenamiento de especialistas y los checkpoints seleccionados están registrados individualmente en `reports/training/`. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card advierte que algunos ejemplos de held-out procedían del split de desarrollo anterior, por lo que las métricas de evaluación no son prístinas.

## Capacidades

- Generación de texto y conversación multi-turno sobre Qwen2.5-Instruct.
- Razonamiento estructurado mediante planificación explícita en un grafo de dependencias entre especialistas.
- Generación y verificación de código (familia de 100 contextos dedicada).
- Razonamiento lógico, matemático y físico con familias especializadas.
- Investigación sobre evidencia suministrada por el usuario (familia research).
- Síntesis final atribuida: la respuesta combina revisiones de 17 grupos con trazabilidad de extractos.
- Comunicación multi-agente con guardado local de mensajes completos y reanudación de intercambios interrumpidos.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de investigación en sistemas multi-agente: el paquete incluye runtime, tests offline y validación de integridad, lo que permite estudiar grafos de comunicación y enrutado sin depender de servicios externos.
- Auditoría de pipelines de planificación: el Input-Divisor devuelve un grafo de dependencias verificable, útil para analizar cómo se descompone una tarea compleja antes de ejecutarla.
- Generación de código con revisión por pares sintética: la familia de 100 contextos de coding permite que varias instancias revisen y contrasten propuestas antes de la síntesis final.
- Docencia y demostraciones de arquitecturas AoM: el modo `simulate` permite mostrar el flujo de 219 llamadas con salidas falsas y sin ejecutar modelos, adecuado para presentaciones y clases.
- Evaluación de trazabilidad de respuestas: los extractos atribuidos por especialista y las revisiones por grupo facilitan inspeccionar de dónde procede cada afirmación de la respuesta final.
- Experimentación con adaptadores LoRA especializados: los nueve adaptadores entrenados pueden reutilizarse o compararse sobre las bases Qwen2.5-7B y 14B en entornos de investigación.
- Prototipado de asistentes con reanudación de sesión: el guardado local de mensajes y la opción `--resume` permiten continuar intercambios largos interrumpidos, útil en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que las pérdidas de entrenamiento, desarrollo y test, junto con los pasos seleccionados, están en `reports/training/`, y que las comprobaciones de comunicación se hicieron con respuestas simuladas, sin benchmark de calidad real ni prueba de inferencia end-to-end en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; la model card afirma que los requisitos mínimos del AoM completo y la calidad de respuesta no están verificados.
- GPU recomendadas: no especificadas; se requiere GPU NVIDIA compatible con CUDA 12.6 y driver adecuado.
- Cabe en consumer GPU: no confirmado; el paquete ocupa unos 25,2-27 GB en disco y las bases compartidas se cargan secuencialmente, no en paralelo, lo que reduce el pico de VRAM pero no está cuantificado.
- Opciones de despliegue: runtime Python propio incluido (`run.py`), instaladores `install.ps1` (Windows) e `install.sh` (Linux), entorno `.venv` con PyTorch CUDA 12.6. No hay integración funcional con Ollama ni GGUF; tampoco es un checkpoint directo de `AutoModelForCausalLM.from_pretrained` en la raíz del repo.
- Latencia y throughput estimados: no disponibles; la inferencia real no se ejecutó durante la publicación y está deshabilitada salvo opt-in explícito con `--allow-inference`.
- Plataformas: Windows y Linux con Python 3.12; no soporta Apple ni inferencia en móvil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpina Endas 2.2 Giant-Aom-1.4T | 1,428T nominales (pesos compartidos) | no disponible | Multi-agente AoM sobre Qwen2.5-7B/14B | apache-2.0 | Hugging Face, runtime propio |
| Qwen2.5-7B-Instruct | 7B | 128K (según ficha oficial de Qwen) | Transformer denso instruct | apache-2.0 | Hugging Face, vLLM, Ollama, llama.cpp |
| Qwen2.5-14B-Instruct | 14B | 128K (según ficha oficial de Qwen) | Transformer denso instruct | apache-2.0 | Hugging Face, vLLM, Ollama, llama.cpp |
| Mezclas MoE tipo Mixtral 8x7B | 46,7B totales / 12,9B activos | 32K | MoE densa entrenada | apache-2.0 | Hugging Face, vLLM, llama.cpp |

La comparación directa con Qwen2.5-7B/14B-Instruct muestra que Giant-Aom no añade parámetros únicos: reutiliza ambos checkpoints con adaptadores y un runtime de orquestación. Frente a un MoE real como Mixtral, la diferencia clave es que aquí no hay enrutado aprendido a nivel de token ni capacidad efectiva multiplicada; la ventaja está en la trazabilidad del grafo de comunicación, no en el rendimiento bruto.

## Limitaciones y advertencias

- La cifra de 1,4T es una suma nominal de copias con pesos compartidos; no implica capacidad aprendida de 1,4T ni verificación independiente de esa cifra.
- La inferencia real no se ejecutó durante la publicación y está deshabilitada por defecto; solo se validó la comunicación con respuestas simuladas.
- Los requisitos mínimos de hardware y la calidad de respuesta del AoM completo no están verificados.
- Algunos ejemplos de held-out procedían del split de desarrollo anterior, por lo que las métricas no son prístinas.
- Idioma limitado al inglés según la model card; no se documenta soporte multilingüe.
- No hay integración funcional con Ollama ni GGUF, ni checkpoint directo cargable con `AutoModelForCausalLM.from_pretrained` desde la raíz.
- Dependencia de CUDA 12.6 y GPU NVIDIA; sin soporte para Apple ni móvil.
- Riesgo de alucinación heredado de los modelos base Qwen2.5-Instruct, agravado por la síntesis de múltiples revisiones que pueden amplificar errores si los extractos no están bien atribuidos.
- Sesgos no documentados en la información disponible; conviene auditar los adaptadores especialistas antes de uso sensible.
- Licencia apache-2.0 permite uso comercial, pero el paquete incluye dependencias fijadas y un runtime propio cuya madurez en producción no está demostrada.
- El flujo de 219 llamadas sobre 202 identidades con carga secuencial implica latencias altas no cuantificadas.

## Enlaces

- [Hugging Face: Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T](https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T)
- [Pesos base](https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T/tree/main/bases)
- [Adaptadores entrenados](https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T/tree/main/adapters)
- [Réplicas (200 copias)](https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-Giant-Aom-1.4T/tree/main/replicas)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Modelo base Qwen2.5-14B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit)
