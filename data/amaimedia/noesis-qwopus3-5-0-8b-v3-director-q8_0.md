# AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Director-Q8_0

## Resumen

NOESIS-Qwopus3.5-0.8B-v3-Director-Q8_0 es un modelo de lenguaje compacto de 752 millones de parámetros, publicado por AMAImedia como parte de la plataforma NOESIS Professional Multilingual Dubbing Automation. Se distribuye en formato GGUF cuantizado a Q8_0 y está diseñado específicamente para tareas de enrutamiento ligero y decisiones de dirección de agentes dentro del framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). El modelo se presenta como un artefacto independiente, no un repack externo, y está pensado para despliegue local con llama.cpp.

El nombre sugiere una relación con la familia Qwen3.5, aunque no se confirma explícitamente en la documentación disponible. Su tamaño reducido (0.8 GB) lo hace apto para entornos con recursos limitados, como CPUs o GPUs de gama baja. La relevancia actual radica en su especialización para sistemas de agentes automatizados, donde se necesita un modelo rápido y ligero para tomar decisiones de control sin incurrir en el coste computacional de modelos más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, no confirmado) |
| Parametros totales | 752.393.024 (0,75 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único formato publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La documentacion oficial no detalla la arquitectura interna del modelo. El nombre "Qwopus3.5" y la referencia a la familia Qwen3.5 en otros repositorios de AMAImedia sugieren que podria basarse en una variante de Qwen3.5, pero no hay confirmacion explicita. El modelo se presenta como parte del framework DHCF-FNO, que combina control deterministico con operadores neuronales congelados, lo que implica un entrenamiento orientado a tareas de direccion y enrutamiento en lugar de generacion libre.

No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La unica informacion disponible es que el modelo esta optimizado para "razonamiento mejorado y estabilidad en programacion", segun una entrada de ollama.com para la familia Qwopus3.5, aunque no se puede atribuir directamente a esta version especifica.

## Capacidades

- Enrutamiento y direccion de agentes: el modelo esta disenado para tomar decisiones de control dentro de pipelines de agentes, seleccionando rutas de ejecucion o determinando el siguiente paso.
- Soporte de tool calling: no se menciona explicitamente, pero su funcion como "director" implica integracion con herramientas externas.
- Conversacion: el tag "conversational" indica capacidad para dialogos multi-turno, aunque su tamano limita la profundidad.
- Generacion de texto en ingles: unico idioma confirmado.
- Compatibilidad con llama.cpp: al ser GGUF, puede ejecutarse en entornos CPU y GPU con llama.cpp, Ollama u otros motores compatibles.

## Casos de uso

- Orquestacion de agentes en produccion: el modelo puede actuar como modulo de decision en frameworks de agentes, evaluando el estado actual y seleccionando la accion siguiente sin consumir recursos de modelos grandes.
- Filtrado y clasificacion de consultas: en sistemas de atencion al cliente, puede clasificar la intencion del usuario y redirigir la conversacion al agente especializado adecuado.
- Automatizacion de doblaje y subtitulado: dado el contexto de NOESIS, puede coordinar tareas de sincronizacion de audio y texto, aunque no hay detalles tecnicos sobre esta integracion.
- Pruebas de concepto en entornos con recursos limitados: su bajo peso permite prototipar sistemas de agentes en hardware modesto, como Raspberry Pi o laptops sin GPU.
- Generacion de codigo asistida: segun la referencia a Qwopus3.5, podria ofrecer asistencia basica en programacion, aunque su tamano limita la complejidad.
- Educacion y experimentacion: util para estudiantes e investigadores que necesitan un modelo ligero para estudiar sistemas de control neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El unico dato de rendimiento indirecto es el tamaño del archivo (0,8 GB) y el formato Q8_0, que sugiere una velocidad de inferencia aceptable en CPU.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,75 B en Q8_0, el peso del archivo es de 0,8 GB. La VRAM necesaria para inferencia es aproximadamente 0,8-1,2 GB, dependiendo del overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso CPUs modernas con 8 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y en CPUs.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con GGUF como llama.cpp server.
- Latencia y throughput: no se han publicado mediciones. Con un modelo de este tamaño, se espera una latencia de decenas de milisegundos por token en CPU moderna y menor en GPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. No hay modelos publicados con la misma especializacion (director de agentes) ni se conocen benchmarks que permitan contrastarlo con alternativas como Qwen2.5-0.5B o Llama-3.2-1B. Se recomienda evaluar el modelo en el contexto especifico de uso antes de adoptarlo.

## Limitaciones y advertencias

- Idioma limitado: solo ingles, sin soporte multilingue confirmado.
- Tamaño reducido: con 0,75 B de parametros, la capacidad de razonamiento complejo y generacion de codigo avanzado es limitada.
- Alucinaciones: como todo LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento.
- Falta de documentacion tecnica: no se han publicado detalles sobre arquitectura, entrenamiento o sesgos, lo que dificulta la evaluacion de riesgos.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero la ausencia de garantias y la naturaleza experimental del proyecto NOESIS implican que el modelo debe validarse antes de su uso en entornos criticos.
- Fecha de publicacion: el modelo fue creado en agosto de 2026, lo que indica que es muy reciente y puede contener problemas no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Director-Q8_0
- Perfil de AMAImedia en HuggingFace: https://huggingface.co/AMAImedia/models
- Modelo relacionado Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4: https://huggingface.co/AMAImedia/Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4
- Entrada de Qwopus3.5 en Ollama (referencia indirecta): https://ollama.com/fredrezones55/Qwopus3.5
