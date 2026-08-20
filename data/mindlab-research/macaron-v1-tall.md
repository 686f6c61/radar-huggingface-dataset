# mindlab-research/Macaron-V1-Tall

## Resumen

Macaron-V1-Tall es un modelo de la familia Macaron-V1 desarrollado por MindLab Research, construido sobre la base Qwen3.6-35B-A3B de Alibaba. Se trata de un modelo de arquitectura Mixture of LoRA (MoL) que combina un núcleo MoE de 35.000 millones de parámetros con cuatro adaptadores LoRA especializados en chat, agente personal, codificación y generación de interfaz de usuario (GenUI). El modelo está diseñado para tareas de inteligencia personal, uso de herramientas, flujos de trabajo de codificación a nivel de repositorio y UI generativa nativa de código, con una ventana de contexto de 262.000 tokens.

La relevancia de Macaron-V1-Tall radica en su enfoque de aprendizaje continuo y auto-mejora, descrito en el informe técnico arXiv:2608.09819. El sistema de enrutamiento L0 selecciona dinámicamente el especialista más adecuado para cada petición del usuario, lo que permite un rendimiento especializado sin necesidad de activar todos los parámetros del modelo en cada inferencia. Se publica junto a Macaron-V1-Venti, su hermano mayor de 748B, compartiendo la misma interfaz de especialistas pero con un perfil de despliegue más ligero. El checkpoint se distribuye en formato BF16 con adaptadores en BF16 y F32, bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE base (40 capas, 2048 hidden, 16 heads, 2 KV heads, 256 expertos, 8 expertos por token) + Mixture of LoRA con 4 especialistas y router L0 |
| Parametros totales | 35.951.822.704 (~35,95B) en checkpoint safetensors; footprint nominal con adaptadores ~50,1B |
| Parametros activos | ~3B (base Qwen3.6-35B-A3B) + adaptadores LoRA seleccionados por el router |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones; checkpoint BF16 base, adaptadores BF16 (L0/L1/L3) y F32 (L2) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16 base + adaptadores LoRA) |

## Arquitectura y entrenamiento

Macaron-V1-Tall emplea una arquitectura híbrida que combina un modelo base MoE Qwen3.6-35B-A3B con un sistema de especialistas basado en Mixture of LoRA. El base tiene 256 expertos con 8 activos por token, 40 capas, tamaño oculto de 2048, 16 cabezas de atención y 2 cabezas KV. Sobre este base se montan cuatro adaptadores LoRA con rango 64 y alpha 128, sin dropout: L0 (Chat), L1 (Agent), L2 (Coding) y L3 (GenUI). Cada adaptador almacena 3.775.651.840 valores, con L0, L1 y L3 en BF16 y L2 en F32. El router L0 es un adaptador adicional que decide qué especialista atiende cada petición, con un coste de enrutamiento de aproximadamente 24 tokens de decodificación restringida.

El post-entrenamiento utiliza los sistemas MinT y MindForge, orientados al aprendizaje continuo y la auto-mejora en entornos reales. Los datos de entrenamiento no se detallan en la información disponible, pero el modelo está diseñado para seguir aprendiendo tras el despliegue. La inferencia enrutada presenta un coste medio de 1,76 segundos por petición (medido sobre 48 peticiones mixtas multi-turno a temperatura 0), con un 70% del tiempo dedicado a la generación del especialista y un 11% al enrutamiento.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés y chino, con seguimiento multi-turno.
- Agente personal: planificación a largo plazo, flujos de trabajo dinámicos y uso intensivo de herramientas.
- Tool calling / function calling integrado en el especialista L1 (Agent).
- Codificación a nivel de repositorio: comprensión de código, tareas SWE, uso de terminal y flujos de trabajo en repositorios.
- Generación de UI nativa de código (UI4A): renderizado de interfaces y acciones dirigidas por UI.
- Razonamiento multi-paso con enrutamiento dinámico entre especialistas.
- Aprendizaje continuo post-despliegue (según el informe técnico).
- Soporte de contexto largo de 262K tokens, adecuado para repositorios completos o historiales extensos.

## Casos de uso

- Asistente personal automatizado: el especialista L1 gestiona tareas de agenda, recordatorios y planificación con uso de herramientas externas, aprovechando la ventana de 262K para mantener contexto de conversaciones largas y preferencias del usuario.
- Agente de codificación en repositorios: el especialista L2 puede navegar por el árbol de un repositorio, entender múltiples archivos y generar parches o refactorizaciones, con soporte para terminal y operaciones SWE.
- Generación de interfaces de usuario: el especialista L3 permite describir una UI en lenguaje natural y obtener código renderizable, útil para prototipado rápido o generación de componentes accesibles.
- Atención al cliente multilingüe: el modelo responde en inglés y chino, con capacidad de mantener hilos largos y derivar a herramientas de ticketing o CRM mediante tool calling.
- Automatización de flujos de trabajo con agentes: combinando L1 y L2, se pueden construir pipelines que lean código, ejecuten comandos y generen resúmenes, con resúmenes concisos entre especialistas para compartir trabajo completado.
- Asistente de desarrollo en terminal: el modelo puede interpretar salidas de comandos, diagnosticar errores y sugerir correcciones, gracias a su entrenamiento en tareas de terminal.
- Investigación y análisis de documentos largos: con 262K de contexto, puede procesar informes técnicos extensos o documentación de API completa para extraer información o responder preguntas.

## Benchmarks y rendimiento

La model card publica resultados comparativos frente al base Qwen3.6-35B-A3B en siete benchmarks propios. Todos los valores están normalizados a 0-100 y son superiores en Macaron-V1-Tall.

| Benchmark | Macaron-V1-Tall | Qwen3.6-35B-A3B |
|---|---|---|
| Macaron ChatBench | 54,9 | 48,0 |
| Macaron LivingBench | 48,4 | 47,1 |
| PinchBench | 86,2 | 82,5 |
| ClawGym | 64,0 | 58,6 |
| SWE-bench Verified | 75,4 | 73,4 |
| TerminalBench 2.1 | 56,2 | 52,5 |
| UI4A-Bench (Final Score) | 59,3 | 33,9 |

Además, el sistema de enrutamiento alcanza un 99,04% de precisión sobre una traza de 6.448 muestras con un 100% de cumplimiento de etiquetas canónicas. El especialista L3 GenUI logra un 100% y L1 Agent el valor más bajo con 95,1%. La model card advierte que esta traza proviene de los datos de entrenamiento de los LoRA, por lo que es un diagnóstico de implementación y no una estimación de generalización.

## Requisitos de hardware

No se publican requisitos oficiales de hardware en la información disponible. Las siguientes cifras son estimaciones razonables basadas en el tamaño del checkpoint:

- VRAM estimada para inferencia: el checkpoint BF16 base ocupa aproximadamente 71,9 GB (35,95B × 2 bytes), más el peso de los adaptadores LoRA (cuatro adaptadores de ~3,78B valores cada uno, en BF16/F32), lo que eleva el total por encima de 90 GB sin cuantización.
- GPU recomendadas: para ejecutar el modelo completo en BF16 se necesitan GPUs de data center como A100 80GB (con particionado), H100 80GB o A100 80GB en configuración multi-GPU. Una sola GPU de 80GB no es suficiente para el checkpoint completo con adaptadores.
- En consumer GPUs: no es viable sin cuantización. Con cuantización a 4 bits, el base podría caber en una RTX 4090 (24GB) o RTX 6000 Ada (48GB), pero no se publican cuantizaciones oficiales y el sistema MoL con adaptadores añade complejidad.
- Opciones de despliegue: la model card referencia un "Mixture of LoRA serving harness" en GitHub (MindLab-Research/Mixture-of-LoRA-Harness) para servir el modelo con enrutamiento. También es compatible con la librería transformers y, potencialmente, con vLLM o TGI si se adapta el esquema de adaptadores.
- Latencia: 1,76 segundos por petición en promedio (48 peticiones mixtas, temperatura 0), con 0,20 s de enrutamiento, 1,24 s de generación del especialista y 0,32 s de resumen. El throughput no se especifica.

## Comparativa con modelos similares

La comparación más directa es con su base Qwen3.6-35B-A3B y con su hermano mayor Macaron-V1-Venti. No se dispone de datos de otros modelos comparables en la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| Macaron-V1-Tall | 35,95B base + adaptadores (~50B nominal) | 262K | MIT | Supera a su base en los 7 benchmarks; UI4A-Bench +25,4 puntos |
| Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | 262K (configuración base) | No especificada | Referencia inferior en todos los benchmarks |
| Macaron-V1-Venti | 748B (nominal) | No especificado | MIT | Latencia 4,68 s por petición (~2,7× mayor que Tall) |

La comparativa con Venti es parcial: ambos comparten el diseño de especialistas y el sistema de enrutamiento, pero Venti tiene un footprint mucho mayor y una latencia absoluta superior. La model card indica que el coste de enrutamiento (~30% del bucle) es estable entre tamaños de base.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no hay evidencia de capacidades multilingües más amplias.
- La precisión del enrutamiento (99,04%) se midió sobre datos de entrenamiento de los LoRA, por lo que no es una estimación de generalización a peticiones nuevas.
- No se publican datos de sesgos, alucinación o robustez ante entradas adversarias.
- El checkpoint en BF16 requiere más de 90 GB de VRAM, lo que limita su despliegue a infraestructura de data center o requiere cuantización no publicada.
- Los adaptadores L2 se almacenan en F32, lo que incrementa el uso de memoria frente a los demás.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3.6-35B-A3B puede tener términos adicionales que no se detallan en la información disponible.
- El sistema de aprendizaje continuo post-despliegue puede introducir cambios de comportamiento no previstos en producción; se recomienda monitorización.
- No hay información sobre la composición del dataset de entrenamiento ni sobre posibles sesgos demográficos o culturales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindlab-research/Macaron-V1-Tall
- Blog de introducción: https://macaron.im/mindlab/research/introducing-macaron-v1
- Informe técnico (arXiv:2608.09819): https://arxiv.org/pdf/2608.09819v1
- Página del paper en HuggingFace: https://huggingface.co/papers/2608.09819
- Repositorio de artefactos: https://github.com/MindLab-Research/macaron-artifacts
- Harness de serving para Mixture of LoRA: https://github.com/MindLab-Research/Mixture-of-LoRA-Harness
- API alojada: https://mintcn.macaron.xin/
- Sitio de Mind Lab: https://macaron.im/mindlab
