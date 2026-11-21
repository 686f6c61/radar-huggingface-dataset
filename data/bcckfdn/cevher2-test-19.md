# bcckfdn/cevher2-test-19

## Resumen

cevher-2-test es un modelo de lenguaje de 1.513.546.496 parámetros entrenado desde cero por el usuario bcckfdn sobre la arquitectura de SmolLM2 (familia Llama). El modelo se distribuye como un checkpoint base conversacional con soporte para turco e inglés, y está pensado como una alternativa compacta para generación de texto en esos dos idiomas. Su tamaño lo sitúa en la franja de los modelos de ~1,5B, un rango en el que puede ejecutarse en hardware de consumo con cuantización.

La arquitectura sigue el esquema transformer decoder-only de Llama, con 34 capas, dimensión oculta de 1792 y una configuración de atención con 28 cabezas de consulta y 7 de clave/valor (GQA). El contexto declarado es de 8192 tokens y el vocabulario de 65.536 entradas. El entrenamiento se realizó desde cero con 37.847 millones de tokens y una mejor pérdida de validación de 2,7292, según los datos de la model card.

La relevancia de este modelo es acotada: se trata de un checkpoint de prueba ("test") publicado en Hugging Face, con 808 descargas y ninguna interacción social. No incluye datos de benchmarks, ni detalles sobre la composición del dataset de entrenamiento, ni información sobre alineación (RLHF/DPO). Es útil como referencia para quienes quieran evaluar un modelo pequeño entrenado desde cero en turco, pero no debe considerarse un modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama / SmolLM2) |
| Parametros totales | 1.513.546.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con 34 capas, dimensión oculta de 1792 y 28 cabezas de atención de consulta frente a 7 cabezas de clave/valor, lo que reduce el coste de memoria en la caché KV respecto a una atención multi-cabeza completa. El vocabulario es de 65.536 tokens y el contexto máximo declarado es de 8192 tokens. Es la misma familia arquitectónica que SmolLM2, según las etiquetas y la model card.

El entrenamiento se realizó desde cero ("pretrained-from-scratch") sobre 37.847 millones de tokens, con una mejor pérdida de validación de 2,7292. No se especifica la composición del dataset, la proporción entre turco e inglés, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información disponible sobre el proceso de entrenamiento es, por tanto, mínima.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Modelo base conversacional (etiqueta "conversational"), aunque no se documenta el formato de plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito ("thinking mode").
- Capacidad multilingüe limitada a los dos idiomas declarados (tr, en).
- Compatible con text-generation-inference y endpoints compatibles según las etiquetas del repositorio.

## Casos de uso

- Generación de texto en turco: el modelo puede producir respuestas y contenido en turco gracias a su vocabulario y entrenamiento en ese idioma, útil para prototipos de asistentes locales.
- Experimentación académica con modelos pequeños: sirve como punto de partida para estudiar el comportamiento de un transformer de 1,5B entrenado desde cero y comparar curvas de pérdida.
- Prototipado de chatbots conversacionales: su etiqueta "conversational" permite integrarlo en demos de diálogo multi-turno dentro de la ventana de 8192 tokens.
- Fine-tuning específico de dominio: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificación, resumen, extracción) en turco o inglés.
- Despliegue en hardware limitado: con 1,5B parámetros puede ejecutarse en GPU de consumo mediante cuantización, adecuado para entornos de desarrollo sin infraestructura dedicada.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios que comparen modelos de ~1,5B en tareas de generación de texto en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB solo para pesos (1,513B parámetros × 2 bytes), más memoria para la caché KV y activaciones.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (según etiquetas), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no se distribuyen en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| cevher-2-test | 1,51B | 8192 | Apache 2.0 | tr, en | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8192 (aprox.) | Apache 2.0 | en (principalmente) | Hugging Face |
| Qwen2.5-1.5B | 1,54B | 32768 | Apache 2.0 | multilingüe (incl. en, zh) | Hugging Face |
| Llama 3.2-1B | 1,24B | 131072 | Llama 3.2 Community License | multilingüe | Hugging Face |

Nota: los datos de los modelos comparativos se ofrecen a título orientativo; no se dispone de benchmarks del modelo evaluado para una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de prueba ("test") sin documentación de alineación ni evaluación de seguridad; no apto para producción sin validación.
- Riesgo elevado de alucinación y de generar contenido incorrecto, dado que no se documentan fases de RLHF/DPO.
- Sesgos desconocidos: no se especifica la composición del dataset de entrenamiento, por lo que no pueden evaluarse sesgos de género, etnia o idioma.
- Limitación idiomática: solo se declaran turco e inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto de 8192 tokens: suficiente para muchas tareas, pero inferior a modelos contemporáneos con 32K o 128K.
- Sin datos de benchmarks: no es posible comparar su calidad de forma objetiva con alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Solo se distribuyen pesos safetensors; no hay versiones GGUF oficiales, lo que limita el despliegue en llama.cpp/Ollama sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-19
