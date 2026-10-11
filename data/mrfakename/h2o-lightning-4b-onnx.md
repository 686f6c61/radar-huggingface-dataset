# mrfakename/h2o-lightning-4b-ONNX

## Resumen

H2O-Lightning-4B ONNX es una conversión a ONNX del modelo h2oai/h2o-lightning-4b (revisión v1.2.3), publicada por el usuario mrfakename para su uso con transformers.js y onnxruntime-web. El modelo original lo desarrolla H2O.ai y, según la model card, está especializado en tareas de decisión: no es un modelo conversacional general, sino un modelo pensado para emitir etiquetas o juicios binarios que se leen tras un prefijo de prompt concreto (`Answer:`).

La conversión reutiliza los grafos ONNX de onnx-community/Qwen3.5-4B-ONNX, sustituyendo los pesos por los del fine-tune de H2O y recuantizándolos con MatMulNBits de 4 bits y bloque de 32. El codificador de visión se mantiene intacto respecto al modelo base porque, según el autor, el fine-tune no lo modificó, de ahí que el pipeline declarado sea image-text-to-text. Se publican dos variantes de cuantización: q4 y q4f16.

Su relevancia práctica está en que permite ejecutar un modelo multimodal de aproximadamente 4.000 millones de parámetros íntegramente en el navegador mediante WebGPU, sin backend de inferencia, algo útil para demos, herramientas locales y despliegues en el borde. El repositorio ocupa 7,0 GB e incluye los distintos ficheros ONNX; no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, solo un informe de paridad frente al modelo PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal con codificador de visión; los grafos ONNX son los de Qwen3.5-4B. Detalle interno exacto: no disponible |
| Parametros totales | Aproximadamente 4.000 millones (según el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4 y q4f16 (MatMulNBits, 4 bits, block size 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos para transformers.js / onnxruntime-web); el modelo base está en PyTorch bf16/fp32 |

## Arquitectura y entrenamiento

La arquitectura del modelo original no se detalla en la información disponible. Lo que sí se documenta es la conversión: se toman los grafos de onnx-community/Qwen3.5-4B-ONNX y se sustituyen los pesos por los del fine-tune h2oai/h2o-lightning-4b (revisión v1.2.3), recuantizados a 4 bits con MatMulNBits y bloque de 32. El codificador de visión no se modifica respecto al modelo base, lo que indica que el fine-tune de H2O.ai no afectó a esa parte del modelo y que el pipeline resultante es image-text-to-text.

Una particularidad de diseño destacable es que el decoder calcula logits únicamente para la última posición. Esto encaja con un uso de lectura de etiquetas: se hace un prefill con el prompt del modelo y se leen las probabilidades de las etiquetas (por ejemplo, sí/no) en lugar de generar texto libre de forma extensa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Decisión y clasificación por etiquetas: el modelo está diseñado para leer probabilidades de etiquetas tras un prefill con el formato de prompt y el esquema de lectura descritos en la model card del modelo original.
- Entrada de imagen y texto: el pipeline declarado es image-text-to-text y conserva el codificador de visión del modelo base.
- Generación de texto corta: la model card indica que los primeros 4 o 5 tokens de texto libre con decodificación greedy coinciden con el modelo PyTorch, lo que sugiere que la generación libre no es ilimitada ni es el caso de uso principal.
- Salida de logits limitada a la última posición, lo que restringe la generación autoregresiva larga.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño de lectura por etiquetas apunta a decisiones puntuales, no a flujos multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ejecución en navegador vía WebGPU con transformers.js, con demo público disponible.

## Casos de uso

- Clasificación binaria en el navegador: se puede cargar el modelo con transformers.js y WebGPU para resolver juicios de tipo sí/no sobre una entrada, sin enviar datos a un servidor, aprovechando la lectura de etiquetas tras el prefijo `Answer:`.
- Enrutado de tickets o solicitudes: usar el modelo como clasificador de decisión para asignar una consulta a una cola o categoría, dado que su salida esperada es una etiqueta y no una respuesta larga.
- Moderación y filtrado previo: evaluación de contenido (texto o imagen más texto) para decidir si un elemento requiere revisión humana, con la ventaja de que la inferencia puede ejecutarse localmente.
- Juicio de relevancia en pipelines de RAG: comprobar si un fragmento recuperado responde a la consulta antes de pasarlo a un modelo generativo mayor, reduciendo llamadas costosas a APIs.
- Herramientas y demos educativas en el navegador: el Space mrfakename/h2o-lightning-4b-webgpu y los pesos ONNX permiten publicar una demo funcional sin GPU en servidor, útil para validar producto o enseñar el funcionamiento de un modelo de decisión multimodal.
- Preprocesado en el borde o en escritorio: integración en aplicaciones Electron, extensiones o utilidades locales que necesiten una decisión rápida sobre una imagen y un texto sin depender de conectividad.
- Verificación de paridad en migraciones: el `parity_report.json` incluido sirve como referencia para equipos que comprueben si su despliegue ONNX reproduce el comportamiento del modelo PyTorch antes de sustituirlo en producción.
- Comparación de variantes de cuantización: las dos versiones publicadas (q4 y q4f16) permiten elegir entre menor huella de memoria o mayor fidelidad numérica según el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica un informe de paridad frente al modelo bf16/fp32 en PyTorch sobre 6 prompts de decisión:

| Metrica de paridad | q4 | q4f16 |
|---|---|---|
| Etiqueta superior idéntica a PyTorch | 5 de 6 | 5 de 6 |
| Diferencia de probabilidad (mediana) | 0,02 | 0,02 |
| Diferencia de probabilidad (máxima) | 0,16 | 0,16 |
| Texto libre greedy (primeros tokens) | 4 a 5 tokens coincidentes | 4 a 5 tokens coincidentes |

El único caso discrepante es una decisión sí/no en el límite, donde PyTorch asigna P(sí) = 0,60 y la versión ONNX 0,44. No hay datos de rendimiento comparativo con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3,5 GB para la variante q4 de 4 bits con 4.000 millones de parámetros (estimación calculada a partir del tamaño y la cuantización, no publicada por el autor); el repositorio completo ocupa 7,0 GB porque incluye varias variantes.
- GPU recomendadas: cualquier GPU con soporte de WebGPU para el caso de navegador; en servidor bastan GPU de gama media tipo RTX 3060, RTX 4060 o superiores. Para el modelo base en bf16/fp32 se requiere más memoria que en la versión cuantizada (cantidad exacta no disponible).
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos de la conversión; cabe en GPUs de consumo actuales e incluso en gráficas integradas compatibles con WebGPU, aunque el rendimiento dependerá del dispositivo.
- Opciones de despliegue: transformers.js y onnxruntime-web con WebGPU (caso previsto por el autor); el modelo base puede servirse en PyTorch con los frameworks habituales, pero no se documentan instrucciones específicas para vLLM, llama.cpp, Ollama o TGI con estos pesos ONNX.
- Latencia y throughput estimados: no disponible. El decoder solo calcula logits para la última posición, lo que reduce el coste frente a una generación completa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrfakename/h2o-lightning-4b-ONNX | ~4B (cifra exacta no disponible) | No disponible | ONNX, q4 y q4f16 (MatMulNBits 4 bits, bloque 32) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| h2oai/h2o-lightning-4b (modelo base) | ~4B (cifra exacta no disponible) | No disponible | PyTorch bf16/fp32 | Apache-2.0 | HuggingFace, mantenido por H2O.ai |
| onnx-community/Qwen3.5-4B-ONNX | ~4B (cifra exacta no disponible) | No disponible | ONNX | No disponible en la información proporcionada | HuggingFace, origen de los grafos ONNX reutilizados |

El modelo base y la conversión ONNX comparten pesos y licencia; la diferencia principal es el formato, la cuantización y la orientación a la ejecución en navegador. No se dispone de datos de rendimiento que permitan una comparación cuantitativa frente a Qwen3.5-4B ni frente a otros modelos de decisión de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta nada sobre la composición del dataset de fine-tune ni sobre sesgos evaluados.
- Riesgo de alucinación: el modelo está pensado para lectura de etiquetas, no para generación libre; usarlo como generador de texto abierto puede producir continuaciones poco fiables, y el propio autor señala que el decoder solo calcula logits para la última posición.
- Pérdida de fidelidad por cuantización: en el informe de paridad hay una discrepancia relevante en una decisión límite (0,60 frente a 0,44 en P(sí)) y una diferencia máxima de probabilidad de 0,16, lo que puede invertir decisiones en casos ajustados.
- Advertencia de formato: para obtener resultados válidos hay que respetar el formato de prompt y el esquema de lectura de etiquetas descritos en la model card del modelo original; no es un modelo de chat.
- Contexto e idiomas: no se especifican ni la longitud de contexto ni los idiomas soportados, por lo que no se puede garantizar su comportamiento en castellano ni con entradas largas.
- Codificador de visión sin ajuste: al no haberse tocado durante el fine-tune, las capacidades visuales corresponden al modelo base y no están adaptadas a la tarea de decisión específica.
- Licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los grafos ONNX reutilizados antes de un despliegue en producción.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin documentación sobre pruebas a escala ni mantenimiento continuado.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo.

## Enlaces

- Modelo ONNX: https://huggingface.co/mrfakename/h2o-lightning-4b-ONNX
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Grafos ONNX de origen: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX
- Demo WebGPU: https://huggingface.co/spaces/mrfakename/h2o-lightning-4b-webgpu
- Informe de paridad: `parity_report.json` incluido en el repositorio del modelo ONNX
- Papers, blogs o repos adicionales: no disponible en la información proporcionada
