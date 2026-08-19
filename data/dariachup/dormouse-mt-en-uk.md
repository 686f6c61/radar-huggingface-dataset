# Dariachup/dormouse-mt-en-uk

## Resumen

`dormouse-mt-en-uk` es un modelo de traducción automática neuronal (MT) especializado en el par inglés→ucraniano, desarrollado por Dariachup como parte del ecosistema `dormouse-ua`. Se trata de un fine-tune del modelo base `Helsinki-NLP/opus-mt-en-uk` (arquitectura MarianMT, 76M parámetros) que cierra el bucle de un pipeline donde un LLM externo genera respuestas en inglés y este modelo las traduce a un ucraniano fluido y natural, sin que el LLM tenga que generar ni un solo token cirílico. Es relevante porque permite integrar modelos de lenguaje grandes (que suelen estar optimizados para inglés) en aplicaciones orientadas al mercado ucraniano, manteniendo la calidad conversacional y con un coste computacional mínimo al poder ejecutarse en CPU.

El modelo ha sido entrenado sobre 282.945 pares de frases, combinando datos de chat reales en ucraniano e inglés, soporte al cliente y ejemplos sintéticos de surzhyk (mezcla de ucraniano y ruso). Su licencia Apache-2.0 y su tamaño reducido lo hacen atractivo para despliegues ligeros y autónomos. Aunque su rendimiento general en BLEU es de 40,28, las métricas más honestas (sobre referencias humanas) rondan los 20 BLEU, lo que indica que aún tiene margen de mejora en contextos no conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer encoder-decoder) |
| Parametros totales | 75.732.627 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), ucraniano (uk) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer encoder-decoder estándar optimizado para traducción automática, desarrollado originalmente por el equipo de Helsinki-NLP. El fine-tune parte de los pesos pre-entrenados de `opus-mt-en-uk` y se entrena con un corpus mixto de 282.945 pares de frases, distribuidos en cuatro bloques: `inv` (158.521 pares de chat ucraniano real, invertidos), `native` (97.912 pares de chat inglés nativo con traducción al ucraniano generada por MT), `cs` (24.702 pares de soporte al cliente con traducción automática) y `surzhyk` (1.810 pares sintéticos con inyección de surzhyk en frases reales). El entrenamiento es un fine-tuning supervisado estándar, sin técnicas de RLHF ni DPO. La principal innovación del enfoque es la inclusión de datos de chat reales y la mezcla de registros, lo que mejora la naturalidad en conversaciones informales, aunque introduce cierta inconsistencia en el uso de los pronombres de cortesía (ти/ви).

## Capacidades

- Traducción automática de inglés a ucraniano, con especial énfasis en lenguaje conversacional y de chat.
- Generación de texto ucraniano fluido a partir de entradas en inglés, sin necesidad de que el modelo fuente genere caracteres cirílicos.
- Soporte para traducción de frases individuales (recomendado) con calidad aceptable; el rendimiento degrada notablemente con bloques multilínea.
- No dispone de tool calling, razonamiento multi-paso, visión ni otras capacidades multimodales; es exclusivamente un modelo de traducción.
- Funciona en CPU con bajo consumo de recursos, lo que permite despliegues en entornos sin GPU.

## Casos de uso

- Integración con LLMs monolingües en inglés: cuando un chatbot o agente basado en un LLM (por ejemplo, ejecutado en la nube) genera respuestas en inglés, `dormouse-mt-en-uk` traduce esas respuestas a ucraniano en tiempo real, permitiendo atender a usuarios ucranianos sin reentrenar el LLM.
- Atención al cliente automatizada: en plataformas de soporte donde las respuestas se generan en inglés, el modelo traduce los mensajes a ucraniano manteniendo un tono conversacional, gracias a su entrenamiento con datos de soporte (`cs`) y chat real.
- Localización de contenido generado por IA: para blogs, redes sociales o newsletters donde un LLM produce contenido en inglés y se necesita una versión ucraniana, el modelo ofrece una traducción rápida y ligera, aunque no apta para textos largos.
- Chatbots de Telegram o Discord: al ser un modelo pequeño, puede ejecutarse localmente en un servidor modesto y traducir las respuestas del bot al ucraniano sin depender de APIs externas de traducción.
- Traducción de mensajes de soporte técnico: en foros o sistemas de tickets donde los agentes escriben en inglés, el modelo convierte las respuestas a ucraniano para el usuario final, con un rendimiento notablemente mejor en este dominio (68 BLEU en el slice `cs`, aunque con referencias sintéticas).
- Pruebas de concepto y prototipos: dado su tamaño y licencia permisiva, es ideal para experimentar con pipelines de traducción en ucraniano antes de escalar a soluciones más pesadas.

## Benchmarks y rendimiento

El autor proporciona métricas sacrebleu sobre 845 pares held-out, comparando el fine-tune (ft) con el modelo base (base). La tabla original es la siguiente:

| Slice | n | Base BLEU | Ft BLEU | Base chrF | Ft chrF |
|---|---|---|---|---|---|
| Overall | 845 | 21,12 | 40,28 | 44,25 | 62,90 |
| cs * | 250 | 27,49 | 68,15 | 49,35 | 82,49 |
| native * | 250 | 26,93 | 49,43 | 49,75 | 68,97 |
| inv | 250 | 9,70 | 19,97 | 33,97 | 45,26 |
| surzhyk | 95 | 9,47 | 14,16 | 36,55 | 42,43 |

Advertencia importante: los slices marcados con asterisco (`cs` y `native`) tienen referencias ucranianas generadas por `gemini-2.5-flash`, no por humanos, por lo que las cifras altas indican la capacidad de reproducir el estilo de Gemini, no calidad humana. Los slices honestos son `inv` (chat ucraniano real con referencias humanas) y `surzhyk`, donde el fine-tune duplica el BLEU del modelo base (19,97 vs 9,70 y 14,16 vs 9,47 respectivamente). El autor también aclara que, eliminando los slices sintéticos, el rendimiento real es de 31,32 BLEU frente a 19,97 del modelo hermano uk→en, lo que confirma que la generación de morfología ucraniana sigue siendo el desafío principal.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene 76M parámetros y puede ejecutarse en un procesador moderno sin GPU, como se indica en la model card.
- VRAM estimada: menos de 1 GB en FP32; con cuantización (no disponible) podría ser aún menor, pero no hay datos al respecto.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente, aunque no es necesaria.
- Compatibilidad con consumer GPU: sí, cualquier GPU de gama media actual puede ejecutarlo sin problemas.
- Opciones de despliegue: principalmente mediante la librería `transformers` de HuggingFace, usando `MarianMTModel` y `MarianTokenizer`. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que MarianMT no es compatible con esos runtimes.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una latencia de decenas de milisegundos por frase en CPU y mayor throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (en→uk) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dariachup/dormouse-mt-en-uk (fine-tune) | 76M | No disponible | 40,28 overall (20 honesto) | Apache-2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-en-uk (base) | 76M | No disponible | 21,12 overall | Apache-2.0 | HuggingFace |
| NLLB-200-distilled-600M | 600M | 1024 tokens | No disponible | CC-BY-NC | HuggingFace |

La comparación directa con el modelo base muestra una mejora sustancial en todos los slices, especialmente en los dominios de chat y soporte. Frente a NLLB-200 (modelo multilingüe de mayor tamaño), no hay datos comparativos en este par de idiomas, pero el fine-tune específico suele superar a modelos generalistas en dominios concretos, a costa de perder generalidad. La licencia Apache-2.0 del fine-tune permite uso comercial sin restricciones, mientras que NLLB-200 tiene una licencia no comercial (CC-BY-NC).

## Limitaciones y advertencias

- Sesgos de dominio: el modelo muestra errores con sustantivos fuera del dominio conversacional, por ejemplo `brass` → `мідь` (cobre en lugar de latón), `Necklaces` → `краватки` (corbatas en lugar de collares), `ring` → `обручка` (anillo de boda en lugar de anillo genérico).
- Inconsistencia de registro: mezcla los pronombres de cortesía ucranianos `ти` (informal) y `ви` (formal) dentro de una misma respuesta, debido a la inconsistencia del corpus de entrenamiento.
- Degradación con texto largo: el modelo funciona bien con frases individuales, pero su calidad cae notablemente al traducir bloques multilínea; se recomienda segmentar el texto.
- Métricas engañosas: las cifras altas de BLEU en los slices `cs` y `native` están infladas por referencias generadas por IA (Gemini), no por humanos; el rendimiento real sobre referencias humanas es de aproximadamente 20 BLEU.
- Alcance limitado: solo traduce de inglés a ucraniano; no soporta la dirección inversa (aunque existe un modelo hermano para ello).
- Sin soporte para cuantización documentada: no se especifican formatos GGUF ni otros métodos de compresión, lo que limita su uso en entornos con restricciones de memoria extrema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dariachup/dormouse-mt-en-uk
- Proyecto `dormouse-ua` en PyPI: https://pypi.org/project/dormouse-ua/
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-uk
