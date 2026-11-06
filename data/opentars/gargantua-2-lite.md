# OpenTARS/Gargantua-2-Lite

## Resumen

Gargantua 2 Lite es un modelo de lenguaje de 0,8 mil millones de parámetros derivado de Qwen3.5-0.8B mediante fine-tuning supervisado por el proyecto openTARS. Está diseñado específicamente como motor de un asistente local capaz de ejecutar acciones sobre el sistema operativo: abrir programas, escribir texto, buscar en la web, lanzar comandos de shell e interpretar capturas de pantalla. Su distribución se realiza exclusivamente en formato GGUF cuantizado a Q4_0, con un proyector visual separado, lo que lo hace ejecutable en CPU sin GPU dedicada.

La propuesta de valor es la especialización en tool-use y control de escritorio con un coste computacional mínimo: el archivo principal ocupa 0,5 GB y el proyector de visión 0,12 GB, permitiendo su despliegue en máquinas modestas mediante llama.cpp u Ollama. El modelo base Qwen3.5-0.8B aporta la arquitectura transformer y el tokenizador, mientras que el fine-tuning añade datos propios de acciones de texto, uso de herramientas y ejemplos de código.

Es relevante para desarrolladores que necesitan un agente local de bajo consumo con capacidades multimodales básicas y soporte de function calling, aunque el propio autor advierte que alucina más que la variante de 2B del mismo proyecto y es más débil leyendo capturas de pantalla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, con proyector visual multimodal) |
| Parámetros totales | 752.393.024 (0,75B, según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de ejemplo de llama-server) |
| Tipos de cuantización | Q4_0 (modelo principal), Q8_0 (proyector visual mmproj) |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors ni otros formatos |
| Tamaño del repositorio | 0,6 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-0.8B, que aporta el cuerpo principal de parámetros y el tokenizador multilingüe. Sobre esa base, openTARS aplica un fine-tuning con datos propios orientados a tres ejes: uso de herramientas (tool-use), acciones de texto sobre el escritorio y ejemplos de código. La componente visual se implementa mediante un proyector multimodal independiente (`mmproj`), que se carga junto al modelo en llama.cpp para habilitar la interpretación de capturas de pantalla.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla si hubo innovaciones arquitectónicas más allá del fine-tuning y la integración del proyector visual. El autor indica que el entrenamiento se realizó sobre datos propios del proyecto openTARS, incluyendo ejemplos de código, pero no publica la metodología completa.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Uso de herramientas y function calling: selección de herramientas entre opciones disponibles (calculadora, búsqueda web, ejecución de comandos).
- Control de escritorio: apertura de programas, escritura de texto y ejecución de comandos de shell.
- Búsqueda web como acción invocable desde el propio modelo.
- Visión básica: interpretación de capturas de pantalla mediante el proyector multimodal Q8_0.
- Ejecución en CPU sin GPU, gracias a la cuantización Q4_0 y al soporte de llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y naturaleza conversacional.
- Capacidad de razonamiento multi-paso limitada, orientada a cadenas de acciones cortas.

## Casos de uso

- Asistente de escritorio local: el modelo puede abrir aplicaciones, escribir texto en ellas y lanzar comandos, lo que permite construir un agente de automatización de tareas cotidianas en máquinas sin GPU. Su tamaño de 0,5 GB en Q4_0 lo hace viable en portátiles modestos.
- Automatización de soporte técnico en primer nivel: con tool calling puede decidir entre consultar una base de conocimiento vía búsqueda web o ejecutar una calculadora, adecuado para flujos de diagnóstico guiados.
- Agente de línea de comandos: integrado en un CLI, puede traducir instrucciones en lenguaje natural a comandos de shell, útil para scripts de administración en entornos controlados.
- Interpretación de capturas de pantalla en pruebas de interfaz: el proyector visual permite describir el estado de una pantalla, lo que sirve para verificación básica en pipelines de QA de UI.
- Prototipado rápido de agentes con Ollama: al estar publicado como `ProjectOpenTARS/Gargantua-2:lite`, permite levantar un agente funcional con un solo comando para validar flujos antes de migrar a modelos mayores.
- Generación de código asistida en local: los ejemplos de código incluidos en el fine-tuning permiten sugerencias básicas en editores, sin enviar datos a la nube, relevante por privacidad.
- Educación y experimentación: su bajo coste y licencia Apache 2.0 lo hacen adecuado para enseñar conceptos de tool-use y agentes locales en entornos académicos.

## Benchmarks y rendimiento

Los únicos datos disponibles son pruebas internas del proyecto openTARS, ejecutadas con su propia aplicación. No son benchmarks públicos y no deben compararse directamente con MMLU, HumanEval o GSM8K.

| Prueba (interna openTARS) | Resultado |
|---|---|
| Suite Lab de 80 tareas | 68/80 |
| Acciones de texto | 64/76 |
| Elección de herramienta (21 casos) | 18/21 (a veces elige búsqueda web en lugar de la calculadora) |
| Suite de 100 tareas con verificación de efectos secundarios (`--cem`, 1 nov 2026) | 92/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU el modelo principal Q4_0 ocupa 0,5 GB en disco y el proyector 0,12 GB. La RAM necesaria para inferencia con contexto de 8192 tokens se sitúa previsiblemente en torno a 1-2 GB, aunque no se especifica en la información disponible.
- GPU recomendadas: no aplica para el caso de uso principal (CPU). Si se desea acelerar, cualquier GPU con al menos 2 GB de VRAM podría alojar el modelo cuantizado, aunque no se documentan pruebas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna por su reducido tamaño, aunque el diseño está orientado a CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`), Ollama (`ProjectOpenTARS/Gargantua-2:lite`).
- Latencia y throughput: no disponibles. El autor no publica métricas de velocidad.
- Parámetros de muestreo recomendados: temperature 0.4, top_p 0.8, top_k 20, repeat_penalty 1.05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Gargantua 2 Lite | 0,75B | 8192 | Apache 2.0 | GGUF (Q4_0) | Agente local con tool-use y visión básica |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Apache 2.0 | Safetensors y GGUF | Modelo generalista multilingüe |
| Gargantua 2 (2B, mismo proyecto) | ~2B | No disponible | No disponible | GGUF | Agente local con mejor lectura de pantalla y menor alucinación |

La comparación con alternativas de la misma categoría (agentes locales de menos de 1B) no está disponible en la información proporcionada. El propio autor recomienda la variante de 2B cuando hay GPU disponible, por su menor tasa de alucinación y mejor comprensión de capturas.

## Limitaciones y advertencias

- Alucinación: el autor reconoce explícitamente que inventa hechos con más frecuencia que el modelo de 2B del mismo proyecto.
- Visión limitada: la lectura de capturas de pantalla es más débil que en la variante superior.
- Selección de herramientas imperfecta: en 3 de 21 casos elige búsqueda web cuando debería usar la calculadora.
- Idiomas: solo portugués e inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: la ventana documentada es de 8192 tokens, insuficiente para conversaciones muy largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar compatibilidad.
- Datos de entrenamiento no publicados: no se detalla la composición del dataset, lo que dificulta evaluar sesgos.
- Benchmarks internos: los resultados publicados son pruebas propias del proyecto, no comparables con estándares públicos.
- Ejecución de comandos: al poder lanzar comandos de shell, requiere sandboxing y validación de acciones en producción para evitar efectos secundarios no deseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2-Lite
- Proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ollama (referencia del autor): `ProjectOpenTARS/Gargantua-2:lite`
