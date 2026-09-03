# danhcao/v-omnivoice

## Resumen

G-OmniVoice es un modelo de síntesis de voz (text-to-speech) optimizado para vietnamita, desarrollado por G-Group AI Lab y publicado en HuggingFace bajo el identificador `danhcao/v-omnivoice`. Se trata de un fine-tuning del modelo base [k2-fsa/OmniVoice](https://huggingface.co/k2-fsa/OmniVoice), que combina un backbone de lenguaje Qwen3-0.6B con el codec de audio Higgs Audio 2. Su propuesta de valor principal es doble: por un lado, lee vietnamita con una precisión notable (el WER más bajo entre los modelos OmniVoice públicos) y, por otro, preserva la voz del hablante de referencia con una similitud de nivel superior.

El modelo soporta clonación de voz zero-shot a partir de clips de referencia de 3 a 10 segundos, así como diseño de voz por descripción textual (sin audio de referencia). Con 612 millones de parámetros en total, es un modelo compacto que puede ejecutarse en GPUs de consumo. La licencia es Apache 2.0, aunque el tokenizador de audio incluido está sujeto a la Boson Higgs Audio 2 Community License, un matiz importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-0.6B + codec de audio Higgs Audio 2 |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificado en la documentacion; el backbone Qwen3-0.6B soporta 32K tokens, pero no se confirma para este modelo) |
| Tipos de cuantizacion | fp16 (inferencia); no se mencionan cuantizaciones adicionales |
| Idiomas soportados | Optimizado para vietnamita (vi); el modelo base OmniVoice soporta 600+ idiomas en modo zero-shot |
| Licencia | Apache 2.0 (con restriccion adicional: el tokenizador de audio Higgs Audio 2 esta sujeto a la Boson Higgs Audio 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

G-OmniVoice se basa en la arquitectura de OmniVoice, que integra un modelo de lenguaje (Qwen3-0.6B) con un codec de audio neuronal (Higgs Audio 2). El modelo de lenguaje procesa el texto de entrada y genera tokens de audio discretos que el codec decodifica en forma de onda. Este enfoque de "modelo de lenguaje de difusion" permite tanto la clonacion de voz zero-shot (condicionando la generacion con un clip de referencia) como el diseno de voz por instrucciones textuales.

El fine-tuning se realizo sobre un corpus de habla vietnamita a gran escala, con el objetivo de mejorar simultaneamente la inteligibilidad (WER) y la fidelidad de la voz (SIM). Segun los datos publicados, el modelo logra un WER de 0.0259, aproximadamente un 31% mejor que el siguiente modelo en la comparativa, manteniendo una similitud de voz (SIM 0.890) practicamente identica a la del mejor modelo en ese aspecto. No se especifican detalles sobre el volumen exacto de datos de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO.

## Capacidades

- Sintesis de voz en vietnamita con alta inteligibilidad y naturalidad.
- Clonacion de voz zero-shot a partir de un clip de referencia de 3 a 10 segundos.
- Diseno de voz por descripcion textual (sin audio de referencia), especificando atributos como genero, edad, tono o acento.
- Soporte multilingue en modo zero-shot heredado del modelo base OmniVoice (600+ idiomas), aunque con rendimiento optimizado solo para vietnamita.
- Generacion de audio a 24 kHz de frecuencia de muestreo.
- Integracion con el runtime de OmniVoice mediante la API `OmniVoice.from_pretrained()`.

## Casos de uso

- **Locuciones para video y contenido audiovisual**: un creador de contenido puede generar narraciones en vietnamita con una voz consistente sin necesidad de grabar en estudio, usando un clip de referencia corto para mantener la identidad vocal en toda la produccion.
- **Audiolibros y narracion de textos largos**: el modelo puede convertir libros o articulos extensos a audio en vietnamita. Se recomienda dividir el texto en fragmentos del tamano de una oracion para mantener una prosodia estable.
- **Asistentes de voz y chatbots con identidad propia**: integrando G-OmniVoice en un pipeline de TTS, una empresa puede dotar a su asistente virtual de una voz corporativa consistente, clonada a partir de un locutor profesional.
- **Accesibilidad para personas con discapacidad visual**: el modelo permite convertir contenido escrito en vietnamita a audio de alta calidad, facilitando el acceso a la informacion a usuarios con limitaciones visuales.
- **Doblaje automatico de contenido**: dado su soporte multilingue heredado, puede usarse para doblar contenido a otros idiomas en modo zero-shot, aunque el rendimiento fuera del vietnamita no esta garantizado.
- **Creacion de voces sinteticas para personajes de ficcion**: la funcion de diseno de voz por instrucciones permite generar voces con atributos especificos (joven, femenina, tono medio, acento del norte de Vietnam) sin necesidad de una grabacion de referencia.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un conjunto de prueba vietnamita reservado. Las metricas son: WER (Word Error Rate, menor es mejor) para inteligibilidad, SIM (speaker similarity, mayor es mejor) y MOS (Mean Opinion Score, mayor es mejor) para naturalidad.

| Modelo | WER ↓ | SIM ↑ | MOS ↑ |
|---|---|---|---|
| k2-fsa/OmniVoice | 0.0712 | 0.892 | 7.709 |
| kjanh/KhanhTTS-OmniVoice | 0.0375 | 0.888 | 7.678 |
| VietNeu/v3turbo | 0.0551 | 0.778 | 7.570 |
| **G-OmniVoice (danhcao/v-omnivoice)** | **0.0259** | **0.890** | **7.685** |

G-OmniVoice consigue el WER mas bajo de la comparativa (0.0259) con una similitud de voz (0.890) practicamente empatada con la mejor (k2-fsa/OmniVoice, 0.892). El MOS de 7.685 es ligeramente inferior al del modelo base, pero superior al de las otras alternativas vietnamitas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 612M parametros. En fp16, los pesos ocupan aproximadamente 1,2 GB. Sumando el codec de audio y los overheads del runtime, se estima un consumo total de 3-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM y soporte CUDA. Modelos como NVIDIA RTX 3060, RTX 4060, RTX 4090 o superiores son adecuadas. Para produccion, una A100 o H100 ofreceria menor latencia.
- **Compatibilidad con GPUs de consumo**: si, cabe en GPUs de consumo con 4 GB o mas de VRAM.
- **Opciones de despliegue**: el runtime oficial es `omnivoice` (pip install omnivoice). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la documentacion disponible.
- **Latencia y throughput**: no se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ↓ | SIM ↑ | Licencia |
|---|---|---|---|---|---|
| k2-fsa/OmniVoice | no disponible | no disponible | 0.0712 | 0.892 | Apache 2.0 |
| kjanh/KhanhTTS-OmniVoice | no disponible | no disponible | 0.0375 | 0.888 | no disponible |
| VietNeu/v3turbo | no disponible | no disponible | 0.0551 | 0.778 | no disponible |
| **G-OmniVoice (danhcao/v-omnivoice)** | 612M | no disponible | **0.0259** | 0.890 | Apache 2.0 |

G-OmniVoice supera a las alternativas en inteligibilidad (WER) con una fidelidad de voz comparable a la del mejor modelo en ese aspecto. Su principal ventaja es que no sacrifica la similitud de voz por la precision de lectura, algo que si ocurre en los otros modelos de la comparativa.

## Limitaciones y advertencias

- **Optimizado solo para vietnamita**: el rendimiento en otros idiomas sigue al modelo base OmniVoice, pero no esta garantizado ni ha sido evaluado especificamente.
- **Licencia del tokenizador**: aunque el modelo se distribuye bajo Apache 2.0, el tokenizador de audio Higgs Audio 2 incluido esta sujeto a la Boson Higgs Audio 2 Community License, que puede imponer restricciones adicionales para uso comercial. Es recomendable revisar los terminos de esa licencia antes de desplegar el modelo en produccion.
- **Calidad de la clonacion dependiente de la referencia**: la fidelidad de la voz clonada depende de la calidad del clip de referencia. Se recomienda usar audio limpio, de un solo hablante y de 3 a 10 segundos de duracion.
- **Necesidad de normalizacion de texto**: el modelo requiere normalizacion previa del texto (numeros, fechas, simbolos, abreviaturas) para obtener resultados optimos.
- **Fragmentacion de textos largos**: para entradas extensas, es necesario dividir el texto en fragmentos del tamano de una oracion para mantener una prosodia estable.
- **Riesgo de alucinacion**: como todo modelo de lenguaje generativo, puede producir salidas inesperadas o incorrectas, especialmente con entradas ambiguas o fuera de distribucion.
- **Modelo reciente y sin adopcion**: el modelo se publico en septiembre de 2026 y no registra descargas ni valoraciones en HuggingFace, por lo que su madurez en entornos de produccion no esta probada.

## Enlaces

- [Modelo en HuggingFace: danhcao/v-omnivoice](https://huggingface.co/danhcao/v-omnivoice)
- [Modelo base: k2-fsa/OmniVoice](https://huggingface.co/k2-fsa/OmniVoice)
- [Backbone: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Repositorio de OmniVoice (Next-gen Kaldi)](https://github.com/k2-fsa/OmniVoice)
- [Higgs Audio 2 (Boson AI)](https://huggingface.co/bosonai)
- [Paper de OmniVoice: arXiv:2604.00688](https://arxiv.org/abs/2604.00688)
