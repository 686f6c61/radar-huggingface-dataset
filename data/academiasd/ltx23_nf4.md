# AcademiaSD/LTX23_NF4

## Resumen

LTX23_NF4 es una versión cuantizada a 4 bits (NF4) del transformer de vídeo LTX-2.3 de Lightricks, publicada por AcademiaSD. No se trata de un modelo nuevo ni de un fine-tune: es una conversión de precisión reducida del modelo base, orientada específicamente al entrenamiento de LoRAs en GPUs de consumo. El repositorio incluye tanto el transformer de difusión como el codificador de texto Gemma 3, ambos en formato NF4, y está pensado para ser descargado automáticamente por la herramienta AcademiaSD LoRAlab Trainer Studio.

El modelo hereda la arquitectura y capacidades de LTX-2.3, un modelo de generación de vídeo de la familia LTX de Lightricks, pero la información disponible no detalla el número de parámetros, la longitud de contexto ni las características técnicas del modelo original. El repositorio ocupa 17,6 GB, un tamaño coherente con un transformer de vídeo de gran escala más un codificador de texto tipo Gemma 3, ambos comprimidos a 4 bits.

Su relevancia es práctica: permite a desarrolladores e investigadores entrenar adaptadores LoRA sobre LTX-2.3 sin necesidad de hardware de gama alta, reduciendo el requisito de VRAM frente a los pesos en bf16. La licencia es la LTX-2 Open-Source License, heredada del modelo base, y cualquier uso o LoRA derivado queda sujeto a ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para video, derivado de Lightricks/LTX-2.3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits), aplicada al transformer y al codificador de texto Gemma 3 |
| Idiomas soportados | no disponible |
| Licencia | ltx-video-2-open-source-license (LTX-2 Open-Source License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de LTX-2.3 más allá de identificarlo como un modelo de difusión para generación de vídeo con un transformer como componente principal y un codificador de texto Gemma 3. No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica de esta publicación concreta es la cuantización NF4 de ambos componentes (transformer de difusión y codificador de texto), orientada a reducir el consumo de memoria durante el entrenamiento de LoRA. No se detalla la metodología exacta de cuantización, el esquema de escalado por bloques ni si se aplicó doble cuantización de las constantes de cuantización, técnicas habituales en este tipo de conversiones.

## Capacidades

- Generación de vídeo a partir de texto, heredada de LTX-2.3 (condicionada por el codificador Gemma 3).
- Entrenamiento de adaptadores LoRA sobre el modelo base en GPUs de consumo, que es el propósito declarado del repositorio.
- Integración con AcademiaSD LoRAlab Trainer Studio, que descarga los pesos automáticamente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, visión estática) en la información disponible.
- El soporte multilingüe depende del codificador Gemma 3, pero no se especifican los idiomas cubiertos.

## Casos de uso

- Entrenamiento de LoRAs de estilo visual: un creador puede ajustar el modelo para un estilo de vídeo concreto (por ejemplo, animación con estética determinada) usando una GPU de consumo, gracias a la reducción de VRAM que aporta la cuantización NF4.
- Personalización de personajes o sujetos: entrenar adaptadores que mantengan la coherencia de un personaje a lo largo de secuencias de vídeo, aprovechando el codificador de texto Gemma 3 para el condicionamiento.
- Investigación en eficiencia de entrenamiento: comparar el comportamiento de LoRAs entrenados sobre pesos NF4 frente a bf16 para estudiar la degradación de calidad introducida por la cuantización.
- Prototipado rápido de pipelines de vídeo generativo: usar el modelo cuantizado para validar flujos de trabajo antes de escalar a los pesos completos.
- Educación y demostraciones: ejecutar experimentos de generación de vídeo en entornos con recursos limitados, como laboratorios docentes con RTX 4090.
- Integración en herramientas de autoría: servir como backend de un estudio de entrenamiento (LoRAlab Trainer Studio) que gestione la descarga y el ajuste de adaptadores de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 17,6 GB en disco en formato NF4; la VRAM necesaria para inferencia o entrenamiento de LoRA no se especifica.
- GPU recomendadas: no disponible. El propósito declarado es el entrenamiento en GPUs de consumo, pero no se indican modelos concretos.
- Compatibilidad con GPU de consumo: sí, según el autor, que orienta el repositorio al entrenamiento de LoRAs en GPUs de consumo; no se detalla cuáles.
- Opciones de despliegue: AcademiaSD LoRAlab Trainer Studio (descarga automática). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AcademiaSD/LTX23_NF4 | no disponible | no disponible | NF4 | LTX-2 Open-Source License | Hugging Face |
| Lightricks/LTX-2.3 | no disponible | no disponible | bf16 (original) | LTX-2 Open-Source License | Hugging Face |
| Otros modelos de video abiertos (p. ej. familia Wan, HunyuanVideo) | no disponible en esta ficha | no disponible | diversas | diversas | Hugging Face |

La comparación relevante es con el modelo base LTX-2.3 en precisión completa: esta versión sacrifica fidelidad numérica a cambio de menor huella de memoria para entrenamiento de LoRA. No se dispone de datos para comparar rendimiento con otras familias de modelos de vídeo.

## Limitaciones y advertencias

- La cuantización NF4 introduce pérdida de precisión respecto al modelo base; la calidad de los LoRAs entrenados sobre estos pesos puede diferir de la obtenida con bf16.
- No es un modelo para inferencia de producción en su forma actual: está empaquetado como base para entrenamiento de LoRA dentro de una herramienta concreta.
- La licencia LTX-2 Open-Source License es de tipo "other" y debe leerse antes de cualquier uso comercial; los LoRAs derivados quedan sujetos a la misma licencia.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas.
- El repositorio tiene 130 descargas y 0 likes, y fue creado en 2026; es un artefacto de nicho sin validación comunitaria amplia.
- No se ofrece información sobre el proceso de cuantización ni sobre posibles diferencias de comportamiento frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/LTX23_NF4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Licencia: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE
- Herramienta de entrenamiento: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
