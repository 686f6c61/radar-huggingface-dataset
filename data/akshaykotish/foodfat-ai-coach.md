# akshaykotish/foodfat-ai-coach

## Resumen

FoodFat AI coach es un ajuste fino (fine-tuning) del modelo google/gemma-4-E2B-it, publicado por el usuario akshaykotish en HuggingFace. El modelo está especializado en orientación general sobre fitness y nutrición, y se ha entrenado con aproximadamente 800 conversaciones de coaching construidas a partir del catálogo de alimentos y productos de FoodFat. El resultado se ha fusionado y convertido a LiteRT-LM en formato `.litertlm` con pesos int4, pensado para ejecutarse en el propio dispositivo (on-device) dentro de la aplicación FoodFat.

La relevancia de este modelo radica en su enfoque de despliegue local: al estar basado en Gemma 4 E2B (una variante pequeña de la familia Gemma 4) y cuantizado a int4, está diseñado para funcionar sin conexión y con requisitos de hardware reducidos, lo que encaja con casos de uso móvil donde la privacidad y la latencia importan. El ajuste se realizó con QLoRA de rango 16 usando MLX, una técnica que permite adaptar el modelo con recursos limitados.

Se trata de un modelo muy específico y de nicho, con cero descargas y cero likes en el momento de la consulta, y con información pública muy escasa: no se detallan idiomas soportados, benchmarks ni parámetros exactos. La model card es breve y se limita a describir el proceso de entrenamiento y el propósito del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de google/gemma-4-E2B-it); no se detalla en la informacion disponible |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; cifra exacta no indicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (pesos del artefacto `.litertlm`); el ajuste se realizo con QLoRA |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el adaptador LoRA se entrena en MLX y se fusiona antes de la conversion |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo de la familia Gemma 4 de Google con arquitectura transformer. Sobre esa base se aplica un ajuste fino supervisado mediante QLoRA de rango 16, realizado con MLX (el framework de Apple para aprendizaje automático en silicio de Apple). El conjunto de entrenamiento lo componen aproximadamente 800 conversaciones de coaching generadas a partir del catálogo de alimentos y productos de FoodFat, lo que orienta el modelo hacia respuestas sobre nutrición, composición de alimentos y orientación fitness general.

Tras el entrenamiento, el adaptador LoRA se fusiona con los pesos base y el modelo resultante se convierte a LiteRT-LM en formato `.litertlm` con pesos int4. Esta conversión es la innovación técnica principal del artefacto: permite ejecutar el modelo en dispositivos de gama baja o móviles dentro de la aplicación FoodFat, sin depender de infraestructura en la nube. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a coaching de fitness y nutrición.
- Respuestas sobre alimentos y productos del catálogo de FoodFat.
- Orientación general sobre hábitos saludables, ejercicio y alimentación.
- Ejecución on-device mediante LiteRT-LM, sin necesidad de conexión a internet.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente nutricional dentro de la app FoodFat: el modelo puede responder preguntas del usuario sobre alimentos y productos del catálogo, aprovechando el ajuste sobre conversaciones de coaching reales del dominio.
- Recomendación de alternativas alimentarias: dado el entrenamiento con el catálogo de productos, puede sugerir opciones similares o sustitutos dentro del mismo ecosistema de la aplicación.
- Coaching de hábitos fitness en movilidad: al ejecutarse on-device con LiteRT-LM, permite ofrecer orientación sin conexión, útil en entornos con conectividad limitada o para preservar la privacidad del usuario.
- Onboarding conversacional en la aplicación: puede gestionar las primeras interacciones del usuario explicando conceptos básicos de nutrición y fitness de forma guiada.
- Respuestas de bajo coste en producción: al ser un modelo pequeño cuantizado a int4, reduce los requisitos de cómputo y permite desplegarlo en dispositivos de gama media sin infraestructura cloud.
- Prototipado de asistentes de salud y bienestar: sirve como base para experimentar con fine-tuning de dominio en modelos pequeños, dado que el proceso (QLoRA + MLX + LiteRT-LM) está documentado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo E2B cuantizado a int4 y orientado a LiteRT-LM, está pensado para ejecutarse en dispositivos móviles y hardware de gama baja.
- GPU recomendadas: no disponible; el artefacto está orientado a inferencia on-device (LiteRT-LM), no a GPUs de centro de datos.
- Compatibilidad con GPU de consumo: no disponible; el despliegue previsto es en dispositivo, no en GPU dedicada.
- Opciones de despliegue: LiteRT-LM (formato `.litertlm`). No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FoodFat AI coach (este modelo) | no disponible (base E2B) | no disponible | apache-2.0 | HuggingFace, formato `.litertlm` | Fine-tuning de dominio con QLoRA, orientado a on-device |
| google/gemma-4-E2B-it (modelo base) | variante E2B de Gemma 4 | no disponible | apache-2.0 | HuggingFace | Modelo generalista de Google, sin especialización de dominio |
| Alternativas de coaching nutricional ajustadas | no disponible | no disponible | no disponible | no disponible | No se dispone de información de modelos comparables en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo ofrece orientación general de fitness y nutrición, no consejo médico; no debe usarse como sustituto de profesionales sanitarios.
- Riesgo de alucinación: al ser un modelo pequeño ajustado con un dataset reducido (~800 conversaciones), puede generar información incorrecta sobre alimentos, nutrientes o recomendaciones.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado fuera del idioma de entrenamiento.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva tras el ajuste y la cuantización.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base (Gemma 4) puede estar sujeto a los términos de Google; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- El artefacto está empaquetado en formato `.litertlm`, lo que limita su uso a entornos compatibles con LiteRT-LM y complica su integración en pipelines estándar de inferencia.
- Sin descargas ni validación comunitaria: no hay evidencia pública de calidad ni evaluaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/akshaykotish/foodfat-ai-coach
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- LiteRT-LM (documentación de Google): no disponible en la información proporcionada
- MLX (framework de Apple): no disponible en la información proporcionada
