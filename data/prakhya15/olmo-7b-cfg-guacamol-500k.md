# prakhya15/olmo-7b-cfg-guacamol-500k

## Resumen
OLMo-7B-CFG-GuacaMol-500k es un adaptador LoRA publicado por prakhya15 sobre el checkpoint `harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos`, un OLMo-7B ya ajustado con datos de PubChem. No es un modelo autónomo: el repositorio contiene el adaptador, el tokenizer y las configuraciones necesarias para la generación, pero requiere descargar y cargar el modelo base.

El adaptador se ha entrenado sobre un conjunto de 500.000 moléculas derivadas de GuacaMol para generar SMILES condicionados por cuatro propiedades: LogP, TPSA, QED y SAS. La generación utiliza classifier-free guidance (CFG), de modo que el usuario puede fijar valores objetivo y ajustar la intensidad del condicionamiento mediante una escala CFG.

Su relevancia es práctica para la investigación en generación molecular condicionada: ofrece un punto de partida reproducible para explorar moléculas con perfiles de propiedades concretos. La evaluación publicada es preliminar: reporta validez en torno al 95,6-96,5 %, unicidad cercana al 100 % y novedad superior al 98 % entre moléculas únicas válidas, con desviaciones absolutas medias que varían según la propiedad.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo-7B, con adaptador LoRA |
| Parámetros totales | ~7.000 millones en el modelo base; el adaptador LoRA no declara un recuento independiente |
| Longitud de contexto | No disponible en la información proporcionada; depende del checkpoint base |
| Tipos de cuantización | No disponibles para el adaptador. Se distribuye en safetensors; el modelo base requeriría cuantización separada, no documentada |
| Idiomas soportados | No disponible; no se documentan idiomas naturales. La salida principal son cadenas SMILES |
| Licencia | Apache-2.0 para el adaptador y el checkpoint base según la model card; deben revisarse los términos del modelo base |
| Formato de pesos | safetensors para el adaptador; tokenizer y archivos JSON de normalización y configuración incluidos |
| Tamaño del repositorio | 1,7 GB |
| Modelo base | `harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos` |

## Arquitectura y entrenamiento
El modelo parte de un checkpoint OLMo-7B ajustado previamente sobre PubChem 2.5M durante una época, con token EOS. Sobre esa base se entrena un adaptador LoRA durante 2 épocas con rango 8, alpha 16 y dropout 0,05. La model card indica LoRA, mientras que el repositorio de código asociado describe QLoRA; el esquema exacto de cuantización empleado durante el entrenamiento no queda detallado en la información disponible.

El adaptador aprende a generar SMILES condicionados por LogP, TPSA, QED y SAS. La generación emplea classifier-free guidance: se combina la distribución condicionada con la incondicional, y el repositorio de código indica que se aplica dropout aleatorio de condicionamiento durante el entrenamiento para conservar la generación incondicional. Las estadísticas de normalización de propiedades están incluidas en `guacamol_500k.json`; la model card advierte de que no deben sustituirse por otras en inferencia.

## Capacidades
- Generación de SMILES condicionada a valores objetivo de LogP, TPSA, QED y SAS.
- Control de la fuerza de condicionamiento mediante la escala CFG; el autor evalúa escalas de 1,5 para LogP, 2,0 para TPSA y 2,5 para QED y SAS.
- Generación incondicional descrita en el repositorio de código mediante dropout de condicionamiento, aunque no se evalúa en la model card.
- Producción de moléculas válidas, únicas y novedosas según la evaluación preliminar publicada.
- Uso de tokenizer propio y estadísticas de normalización incluidas en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, visión, audio, instrucciones generales ni multilingüismo.
- No es un modelo de chat ni un modelo de propósito general; su tarea está acotada a la generación molecular condicionada.

## Casos de uso
- Exploración condicionada del espacio químico: fijar rangos objetivo de LogP, TPSA, QED o SAS, generar lotes de SMILES y validarlos con herramientas como RDKit. Es adecuado porque el adaptador está entrenado específicamente para asociar esas propiedades con estructuras moleculares.
- Generación de librerías virtuales para cribado: producir conjuntos de SMILES candidatos, eliminar duplicados y aplicar filtros de validez y novedad. La evaluación reporta una validez del 95,6-96,5 %, por lo que el filtrado posterior es imprescindible.
- Optimización multiparamétrica de leads: utilizar valores objetivo de varias propiedades y ajustar la escala CFG por propiedad como punto de partida experimental. El modelo permite generar alternativas alrededor de un perfil deseado, aunque la adherencia exacta debe medirse con predictores independientes.
- Aumento de datos para modelos QSAR: generar moléculas nuevas con perfiles de propiedades definidos, calcular las propiedades reales con herramientas estándar y incorporarlas como datos aumentados. Es útil para ampliar la cobertura de regiones químicas poco representadas, con validación experimental y estadística posterior.
- Estudio metodológico de classifier-free guidance: comparar escalas CFG, medir validez, unicidad, novedad y desviación absoluta media siguiendo la evaluación publicada. El repositorio incluye el código de decodificación CFG y las estadísticas de normalización necesarias para reproducir el protocolo.
- Integración en pipelines de descubrimiento temprano: cargar el modelo base y el adaptador, generar SMILES, validar con RDKit, deduplicar y priorizar candidatos antes de análisis de docking, ADMET o síntesis. El modelo no sustituye esas etapas; actúa como generador de candidatos.
- Docencia y reproducción experimental: utilizar el adaptador y el código asociado para explicar generación molecular condicionada, LoRA y CFG en entornos académicos. La licencia Apache-2.0 facilita este uso, sujeto a los términos del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible; no son directamente aplicables a esta tarea. La evaluación publicada es específica de generación molecular y es preliminar.

| Propiedad | CFG scale | Validez | Unicidad entre válidas | Novedad entre únicas válidas | Desviación absoluta media |
|---|---:|---:|---:|---:|---:|
| LogP | 1,5 | 96,51 % | 100,00 % | 99,38 % | 0,5506 |
| TPSA | 2,0 | 95,61 % | 100,00 % | 99,48 % | 7,4563 |
| QED | 2,5 | 96,10 % | 99,89 % | 99,46 % | 0,0864 |
| SAS | 2,5 | 95,70 % | 99,89 % | 98,64 % | 0,2112 |

Cada evaluación de propiedad solicitó 1.002 moléculas, con 334 muestras por objetivo. El autor indica que son resultados preliminares de los experimentos reportados y no una reproducción exacta del benchmark de ChemFM.

## Requisitos de hardware
- VRAM estimada para inferencia, orientativa y no publicada por el autor: en BF16/FP16, los pesos de un modelo de 7B ocupan aproximadamente 14 GB; con caché KV y dos pasadas de CFG, se recomiendan 18-24 GB.
- En cuantización de 8 bits, los pesos se reducen a unos 7 GB; se recomiendan 10-12 GB de VRAM.
- En cuantización de 4 bits, los pesos se reducen a unos 4 GB; se recomiendan 6-8 GB de VRAM, con contexto corto.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y experimentación; RTX 4090 o RTX 3090 de 24 GB para inferencia en FP16 con contexto corto o en 8/4 bits.
- En GPU de consumo: cabe en tarjetas de 24 GB con cuantización y en tarjetas de 16 GB en 4 bits con contexto limitado; 12 GB es un margen muy ajustado.
- Despliegue: Hugging Face Transformers con PEFT para cargar el adaptador; vLLM o TGI si se configura soporte LoRA; llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF, un procedimiento que no se proporciona en el repositorio.
- Latencia y throughput: no hay datos publicados. El uso de CFG implica normalmente dos pasadas por paso de generación, una condicionada y otra incondicional, por lo que el coste computacional es superior al de una decodificación simple.

## Comparativa con modelos similares
No se han identificado en la información proporcionada alternativas equivalentes de generación molecular condicionada con CFG y licencia Apache-2.0. La siguiente tabla compara el adaptador con su checkpoint base y con la familia OLMo-7B original; no son equivalentes en tarea.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-7B-CFG-GuacaMol-500k | Base ~7B; LoRA r=8 | No disponible | SMILES condicionados por LogP, TPSA, QED y SAS con CFG | Apache-2.0 | Hugging Face; repositorio de 1,7 GB |
| `harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos` | ~7B | No disponible | Modelo base ajustado con PubChem 2.5M | Apache-2.0 según la model card | Hugging Face |
| OLMo-7B de Ai2 | ~7B | No disponible en la información consultada | Modelo de lenguaje general | Apache-2.0 | Ai2 y Hugging Face |

## Limitaciones y advertencias
- No es un modelo autónomo: requiere el checkpoint base `harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos`; el repositorio de 1,7 GB contiene el adaptador y artefactos asociados, no un modelo completo listo para usar por sí solo.
- La evaluación es preliminar: 1.002 moléculas solicitadas y 334 muestras por objetivo; no equivale a una validación exhaustiva ni a una reproducción exacta del benchmark de ChemFM.
- La validez reportada es del 95,61-96,51 %, lo que implica entre un 3,49 % y un 4,39 % de SMILES inválidos según la propiedad; es necesario filtrar con RDKit u otra herramienta antes de cualquier uso posterior.
- La desviación absoluta media varía de forma notable: 0,5506 para LogP, 7,4563 para TPSA, 0,0864 para QED y 0,2112 para SAS. La adherencia al objetivo no es exacta y debe medirse en cada experimento.
- Las estadísticas de normalización de `guacamol_500k.json` deben usarse tal cual; sustituirlas por otras cambia la interpretación de los valores objetivo y puede degradar el condicionamiento.
- Las escalas CFG evaluadas son específicas por propiedad; no hay garantía de que funcionen igual en otros rangos, contextos o lotes.
- El modelo genera estructuras, no evidencia de actividad biológica, seguridad, eficacia ni viabilidad sintética. SAS es una heurística de accesibilidad sintética y no sustituye la validación experimental.
- El entrenamiento se basa en un conjunto derivado de GuacaMol y en un checkpoint ajustado con PubChem; puede heredar sesgos de cobertura, duplicados y limitaciones de esos datos.
- No se documentan capacidades de chat, instrucciones generales, tool calling, agentes, visión, audio ni multilingüismo; no debe evaluarse como un modelo de propósito general.
- La licencia declarada es Apache-2.0, pero debe revisarse la licencia y los términos del modelo base. El uso comercial de moléculas generadas puede estar sujeto a requisitos regulatorios y de propiedad intelectual adicionales.
- Existe riesgo de uso dual en generación de compuestos químicos; se recomienda supervisión, validación independiente y cumplimiento normativo antes de cualquier aplicación sensible.
- La model card indica LoRA y el repositorio de código describe QLoRA; no se detalla el esquema exacto de cuantización del entrenamiento, lo que puede afectar a la reproducibilidad fina.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/prakhya15/olmo-7b-cfg-guacamol-500k)
- [Archivos del repositorio](https://huggingface.co/prakhya15/olmo-7b-cfg-guacamol-500k/tree/main)
- [Modelo base en Hugging Face](https://huggingface.co/harindhar10/OLMo-7B-fsdp-Pubchem-2.5M-1epochs-eos)
- [Código de decodificación CFG para generación molecular](https://github.com/gotnochill815-web/cfg_molecular_generation)
- [Repositorio Olmo_CFG con QLoRA para generación molecular condicionada](https://github.com/gotnochill815-web/Olmo_CFG)
- [Página de OLMo en Ai2](https://allenai.org/olmo)
