# 0xKitkat/safestep-gemma-4-e2b-qlora

## Resumen

El repositorio `0xKitkat/safestep-gemma-4-e2b-qlora` contiene un adaptador QLoRA de prototipo para el modelo `google/gemma-4-E2B-it`, desarrollado por el autor 0xKitkat en el contexto de un hackathon. El adaptador ajusta el comportamiento de generación de texto del modelo base para el proyecto SAFEstep, un prototipo de guía de emergencia offline para iPhone que sigue un contrato de respuesta JSON fijo. No se trata de un modelo autónomo, sino de un componente que debe cargarse junto al modelo base Gemma 4 E2B, que cuenta con 2.1 mil millones de parámetros, arquitectura densa y una ventana de contexto de 8.000 tokens.

La relevancia de este adaptador es limitada y experimental: sirve como demostración de cómo adaptar un modelo pequeño de Google para un caso de uso restringido con técnicas de cuantización eficientes (QLoRA). El repositorio incluye solo el adaptador (0.1 GB), con cero descargas y cero likes, lo que indica un estado muy temprano de desarrollo. El autor advierte explícitamente de que no es un dispositivo médico, no es asesoramiento profesional de emergencias y que los resultados requieren una evaluación exhaustiva antes de cualquier decisión de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre transformer denso (Gemma 4 E2B) |
| Parametros totales | Modelo base: 2.1B; adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento: 512 tokens; modelo base: 8.000 tokens |
| Tipos de cuantizacion | NF4 QLoRA con doble cuantización; BF16 compute |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | No disponible (se requiere aceptar la licencia del modelo base por separado) |
| Formato de pesos | Safetensors (adaptador PEFT); el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica QLoRA (Quantized Low-Rank Adaptation) con cuantización NF4 y doble cuantización, manteniendo el cómputo en BF16. La configuración LoRA es de rango 8, alpha 16 y dropout 0.05, aplicada únicamente a 205 módulos de proyección de atención y MLP bajo `model.language_model`. Los encoders de visión y audio del modelo base quedaron congelados y no recibieron adaptadores, por lo que el ajuste se limita al comportamiento textual.

El entrenamiento se realizó con un conjunto de datos de 780 ejemplos de entrenamiento y 224 de validación, con una longitud de secuencia de 512 tokens, micro-batch de 1 y acumulación de gradientes de 16, durante una sola época que completó 49 pasos de optimizador. Se usó el optimizador paged AdamW de 8 bits con una tasa de aprendizaje de 1e-4 y un programador de coseno. El modelo alcanzó una pérdida de validación de 1.039 y una precisión media de token de 0.7652, entrenándose en una NVIDIA RTX 4070 SUPER de 12 GB con un pico de memoria de 8.62 GiB reservados.

## Capacidades

- Generación de texto siguiendo un contrato de respuesta JSON fijo, diseñado para guías de emergencia offline.
- Adaptación de comportamiento conversacional para escenarios de emergencia, con respuestas estructuradas.
- Sin soporte de visión ni audio: los encoders multimodales del modelo base permanecen congelados.
- No incluye capacidades de tool calling ni function calling; el adaptador se centra en el formato de respuesta.
- No se han documentado capacidades multilingües específicas para el adaptador, aunque el modelo base soporta más de 140 idiomas.
- No se menciona ningún modo de razonamiento especial ni agentes multi-paso.

## Casos de uso

- Prototipo de guía de emergencia offline en iPhone: el adaptador permite que el modelo base genere respuestas con un formato JSON consistente para primeros auxilios, aprovechando la capacidad de ejecución local del Gemma 4 E2B en dispositivos móviles.
- Investigación académica: sirve como ejemplo reproducible de cómo aplicar QLoRA con doble cuantización a un modelo pequeño de 2.1B, con métricas de entrenamiento documentadas.
- Evaluación de seguridad en aplicaciones de salud: se puede usar para probar la capacidad de un modelo ajustado para rechazar o estructurar respuestas en contextos críticos, aunque no está validado para uso real.
- Experimentación con contratos de salida: el adaptador muestra cómo imponer un esquema JSON fijo mediante ajuste fino, útil para desarrolladores que necesitan respuestas estandarizadas.
- Benchmarking de eficiencia de memoria: el entrenamiento en una RTX 4070 SUPER con pico de 8.62 GiB demuestra la viabilidad de ajustar modelos de 2B con recursos moderados.
- Desarrollo de pipelines de generación estructurada: combinado con el modelo base, el adaptador puede servir de base para prototipos que requieran salidas parseables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador. Los únicos datos de rendimiento disponibles son los del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 1.039 |
| Precisión media de token | 0.7652 |

No hay comparación con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0.1 GB, pero requiere el modelo base Gemma 4 E2B (2.1B parámetros). En cuantización 4-bit, el modelo base puede caber en tarjetas con 4-6 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una RTX 4070 SUPER de 12 GB, con pico de memoria de 8.62 GiB. Para inferencia, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente; el modelo base puede ejecutarse incluso en CPU según la documentación de Gemma 4 E2B.
- Compatibilidad con GPU de consumo: sí, el modelo base y el adaptador caben en tarjetas como la RTX 3060, RTX 4060 o RTX 4070.
- Opciones de despliegue: se puede cargar con Transformers y PEFT (ver ejemplo de carga), y el modelo base puede cuantizarse adicionalmente. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros adaptadores o modelos de la misma categoría. El adaptador es un caso específico de ajuste QLoRA sobre Gemma 4 E2B, sin datos de benchmarks comparativos. La comparación más relevante sería con el modelo base sin ajustar, pero no se han documentado diferencias cuantitativas en rendimiento.

## Limitaciones y advertencias

- Prototipo de hackathon: no es un producto final y carece de evaluación de seguridad, schema, regional, primeros auxilios, rechazo y runtime del dispositivo.
- No es un dispositivo médico ni certificación médica: las respuestas generadas no deben tratarse como asesoramiento profesional de emergencia.
- Solo comportamiento de texto: los encoders de visión y audio del modelo base están congelados, por lo que no procesa imágenes ni audio.
- El adaptador no es el artefacto LiteRT para iPhone: no debe presentarse como un modelo `.litertlm` ni integrarse directamente en la aplicación móvil SAFEstep.
- Licencia no disponible: se requiere aceptar la licencia del modelo base de Google por separado, y el adaptador no especifica términos propios.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada en contextos críticos, lo que es especialmente peligroso en escenarios de emergencia.
- Sin datos de benchmarks: no se ha evaluado el rendimiento en tareas estándar, lo que limita la confianza en sus capacidades generales.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/0xKitkat/safestep-gemma-4-e2b-qlora
- Modelo base Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentación de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Información de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
