# Obotu/POIEO-GGUF

## Resumen

POIEO es un modelo de generación de texto bilingüe (inglés y yoruba) especializado en escritura creativa, desarrollado por Obotu a partir del modelo base LFM2.5-2.6B de Liquid AI. Se distribuye en formato GGUF para ejecución local mediante llama.cpp, con un objetivo claro: funcionar en portátiles de gama media sin GPU dedicada, permitiendo a escritores generar y continuar historias de forma totalmente offline.

El modelo ha sido entrenado mediante pre-entrenamiento continuado (CPT) sobre corpus en yoruba y posterior fine-tuning supervisado (SFT) con datos de escritura creativa bilingüe, incluyendo ejemplos de code-switching (alternancia de idiomas dentro de una misma escena). No ha pasado por una fase de optimización por preferencias (DPO), lo que condiciona su consistencia en tono y estilo.

Con 2.697.198.592 parámetros (aproximadamente 2,7B), POIEO está pensado para tareas de generación de texto creativo, desarrollo de ideas y continuación de relatos. Su licencia es LFM Open License v1.0, que permite uso comercial bajo ciertas condiciones, aunque no es una licencia de código abierto estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid short-convolution + GQA (Grouped Query Attention) |
| Parámetros totales | 2.697.198.592 (2,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea 2048 tokens) |
| Tipos de cuantización | Q8_0, Q5_K_M, Q4_K_M (se planea añadir Q4_0) |
| Idiomas soportados | Inglés (en), Yoruba (yo) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

POIEO hereda la arquitectura híbrida de LFM2.5-2.6B-Base, que combina convoluciones cortas (short-convolution) con atención agrupada (GQA). Esta combinación busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El tamaño del modelo (2,7B) permite su ejecución en hardware de consumo, y su diseño híbrido es particularmente sensible a la cuantización: el autor documenta que el formato Q4_K_M, aunque más compacto, resulta más lento que una cuantización Q4_0 plana debido a que los kernels de dequantización no están completamente optimizados en llama.cpp para esta arquitectura.

El entrenamiento se realizó en dos fases:
1. **CPT (Continued Pre-Training)**: se continuó el pre-entrenamiento del modelo base sobre texto yoruba filtrado (Wikipedia y otros corpus) para reforzar la fluidez y precisión de diacríticos en ese idioma.
2. **SFT (Supervised Fine-Tuning)**: se ajustó el checkpoint de CPT con pares de instrucción-respuesta de escritura creativa bilingüe (yoruba, inglés y ejemplos de cambio de código), usando LoRA mediante Unsloth y calculando la pérdida solo sobre la respuesta del asistente.

No se aplicó DPO ni ninguna técnica de alineación por preferencias, lo que implica que la coherencia y el tono dependen exclusivamente de los datos de SFT.

## Capacidades

- Generación de texto creativo en inglés y yoruba, incluyendo textos con alternancia de idiomas (code-switching) dentro de una misma escena.
- Continuación de historias desde un punto de interrupción, manteniendo la coherencia narrativa en conversaciones de varios turnos.
- Desarrollo de ideas creativas: el modelo puede ayudar a generar tramas, personajes o diálogos.
- Escritura de relatos cortos y fragmentos narrativos con voz y estilo consistentes.
- Funciona como asistente de escritura local, sin necesidad de conexión a internet.
- No tiene capacidades de tool calling, visión ni audio; está enfocado únicamente a generación de texto.

## Casos de uso

- **Asistente de escritura creativa para autores bilingües**: un escritor que trabaja en inglés y yoruba puede usar POIEO para generar párrafos iniciales, desarrollar diálogos o explorar alternativas de escena. Gracias a su entrenamiento específico en ambos idiomas y en code-switching, puede mantener la mezcla de idiomas de manera natural.
- **Continuación de novelas o relatos**: cuando un autor se queda bloqueado, POIEO puede continuar la historia desde el punto exacto donde se detuvo, respetando el estilo y la voz narrativa del texto previo.
- **Entrenamiento de escritura en yoruba**: estudiantes o personas que quieran mejorar su dominio del yoruba pueden usar el modelo para generar ejemplos de textos creativos, recibir sugerencias de vocabulario o practicar la construcción de frases con diacríticos correctos.
- **Prototipado de diálogos para juegos o narrativa interactiva**: los desarrolladores de aventuras de texto o juegos de rol pueden usar POIEO para generar respuestas de personajes en tiempo real, sin depender de servicios en la nube.
- **Herramienta de lluvia de ideas para guionistas**: permite generar listas de posibles giros argumentales, descripciones de escenarios o perfiles de personajes, manteniendo la privacidad de los borradores al no enviar datos a servidores externos.
- **Generación de contenido para blogs o redes sociales**: aunque no es un modelo factual, puede usarse para redactar textos creativos, cuentos cortos o anécdotas con un estilo natural en inglés o yoruba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor se centra en el rendimiento cualitativo en tareas de escritura creativa y en la capacidad de ejecución en hardware de consumo.

## Requisitos de hardware

- **VRAM estimada**: el modelo en GGUF tiene un tamaño de alrededor de 10 GB (repo completo). Con cuantización Q4_K_M se reduce a unos 2,5-3 GB de RAM/VRAM, y con Q8_0 alrededor de 3-4 GB. Puede ejecutarse en CPU con RAM suficiente (8 GB recomendados).
- **GPUs recomendadas**: no se requiere GPU dedicada. El autor probó en un portátil con Intel Core i5, 8 GB de RAM y gráficos integrados (Iris Xe/UHD). Se puede usar la GPU integrada mediante Vulkan o SYCL en llama.cpp, o ejecutarlo solo en CPU.
- **Cabe en consumer GPU**: sí, cualquier GPU moderna con al menos 4 GB de VRAM puede ejecutar la versión Q4_K_M o Q5_K_M.
- **Opciones de despliegue**: llama.cpp (llama-cli), también compatible con Ollama y otros frameworks que soporten GGUF. Se recomienda el uso de `--n-gpu-layers` para descargar capas a la GPU integrada.
- **Latencia y rendimiento**: no se dispone de datos exactos de latencia. En el hardware de referencia, se espera una generación de pocos tokens por segundo en CPU. El autor advierte que Q4_K_M es más lento que Q4_0 en esta arquitectura, por lo que recomienda Q5_K_M o Q8_0 para mayor velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| **POIEO (GGUF)** | 2.7B | No disponible | LFM Open License v1.0 | GGUF | Especializado en escritura creativa EN/YO |
| **LFM2.5-2.6B-Base** (base) | 2.7B | No disponible | LFM Open License v1.0 | Safetensors | Modelo base sin fine-tuning, multilingüe general |
| **Qwen2.5-1.5B-Instruct** | 1.5B | 128k | Apache 2.0 | Safetensors | Modelo general de instrucción, no específico para creatividad |

No se dispone de benchmarks comparativos con estos modelos en la información proporcionada. La comparación se basa en características generales.

## Limitaciones y advertencias

- **Sin alineación por preferencias**: al no haber DPO, los resultados pueden ser inconsistentes en tono o calidad entre prompts similares.
- **Identidad no fiable**: el modelo no responde correctamente a preguntas sobre sí mismo ("¿quién eres?"), dando respuestas vagas o fuera de tema.
- **Riesgo de alucinaciones**: al ser un modelo de escritura creativa, no es adecuado para consultas factuales; puede generar información inexacta.
- **Calidad de yoruba**: la gramática y diacríticos son generalmente correctos pero no garantizados.
- **Coherencia en conversaciones largas**: puede perder coherencia en diálogos de muchos turnos.
- **Sensibilidad a parámetros de muestreo**: la calidad de salida depende de la temperatura y top-p; se recomienda ajustar para cada caso.
- **Rendimiento de cuantización**: Q4_K_M puede ser más lento que Q4_0 en esta arquitectura; se recomienda Q5_K_M o Q8_0 si la velocidad es prioritaria.
- **Licencia LFM**: aunque permite uso comercial, tiene condiciones específicas (consultar el texto completo de la licencia).

## Enlaces

- [Repositorio HuggingFace - Obotu/POIEO-GGUF](https://huggingface.co/Obotu/POIEO-GGUF)
- [Modelo base LiquidAI/LFM2.5-2.6B-Base](https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base)
- [Licencia LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base/blob/main/LICENSE)
- [GitHub de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de llama.cpp](https://github.com/ggerganov/llama.cpp) (para uso de GGUF)
