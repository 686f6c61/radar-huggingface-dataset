# Jibank/curatelaw-india-curated-lora

## Resumen

CurateLaw-India Curated LoRA es un adaptador LoRA experimental desarrollado por Jibank en el marco del reto de contratación Lexsi Labs Track 1, centrado en dominios con escasez de datos. No se trata de un modelo de lenguaje independiente, sino de un conjunto de pesos de adaptación (PEFT) que se monta sobre el modelo base CohereLabs/tiny-aya-global. El adaptador está entrenado mediante supervisión fina (SFT) sobre ejemplos sintéticos curados de redacción de contratos laborales indios.

El objetivo de investigación del proyecto es determinar si un filtrado sistemático de la calidad de los ejemplos sintéticos mejora el rendimiento de modelos pequeños frente a un ajuste con datos sintéticos sin filtrar. Para ello se comparan tres configuraciones: el modelo base sin ajuste, un modelo A entrenado con datos brutos y este modelo B entrenado con datos curados. La relevancia actual reside en la metodología de curación de datos sintéticos, no en el rendimiento absoluto del adaptador.

El adaptador se distribuye como pesos PEFT en formato safetensors, con librería `peft` y pipeline de generación de texto. El repositorio tiene un tamaño declarado de 0.0 GB, lo que confirma que contiene únicamente los pesos del adaptador y artefactos asociados (configuración, tokenizer y metadatos de procedencia), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (adaptador LoRA; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (se infiere uso en ingles para contratos laborales indios, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA para adaptación parametro-eficiente: en lugar de actualizar todos los pesos del modelo base, se entrena un subconjunto reducido de parámetros de adaptación. El entrenamiento se realizó con SFT usando el ecosistema Transformers, TRL y PEFT, con las versiones declaradas PEFT 0.21.2, TRL 1.7.1, Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. El modelo base es CohereLabs/tiny-aya-global, un modelo abierto de Cohere Labs; sus detalles arquitectónicos concretos no se recogen en la información proporcionada.

La innovación metodológica del proyecto no está en la arquitectura, sino en el pipeline de curación de datos sintéticos. Dicho pipeline incluye validación estructural de los ejemplos de redacción generados, verificación anclada en fuentes, comprobaciones de consistencia contractual, puntuación y filtrado de calidad, detección de duplicados y selección basada en diversidad. El dataset resultante se usa para el ajuste supervisado, con el objetivo de estudiar el efecto de la calidad del dato y no el simple aumento del volumen. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto orientada a redacción de contratos laborales indios, dominio para el que se entrenó el adaptador.
- Redacción de cláusulas y borradores contractuales a partir de instrucciones, gracias al ajuste SFT sobre ejemplos curados.
- Razonamiento limitado al dominio legal-laboral; no se documentan capacidades generales de razonamiento o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas; el modelo base tiny-aya-global podría aportar cobertura multilingüe, pero el adaptador no lo especifica.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Generación de borradores de contratos laborales: el adaptador produce cláusulas y estructuras de contrato a partir de instrucciones, usando el conocimiento inyectado por los ejemplos sintéticos curados del dominio indio.
- Estudio comparativo de calidad de datos: permite comparar este adaptador con el modelo A de datos brutos y con el modelo base para medir el impacto del filtrado de calidad en la redacción contractual.
- Investigación en ajuste parametro-eficiente: sirve como artefacto reproducible para experimentar con LoRA y SFT en dominios con escasez de datos, usando el pipeline de curación como referencia.
- Evaluación de consistencia contractual: los ejemplos curados incluyen comprobaciones de consistencia, por lo que el adaptador puede usarse para probar si el modelo mantiene coherencia entre cláusulas en borradores multi-sección.
- Detección de afirmaciones legales no respaldadas: el adaptador puede emplearse en experimentos que midan la frecuencia de aserciones legales sin fundamento en textos generados, una de las métricas declaradas del proyecto.
- Prototipado de asistentes de redacción para equipos legales: como artefacto experimental, permite montar un prototipo interno de generación de borradores que luego se revise por profesionales cualificados antes de cualquier uso real.
- Formación y demostración de pipelines de datos sintéticos: el repositorio y el proyecto en GitHub sirven para ilustrar cómo validar, puntuar y filtrar datos sintéticos antes del ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara que la evaluación del proyecto examina adherencia a instrucciones, completitud del borrador, consistencia contractual, afirmaciones legales no respaldadas y calidad global de la respuesta, pero no presenta cifras. El propio autor advierte que la existencia de este modelo curado no demuestra por sí sola que supere al modelo entrenado con datos brutos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA sobre tiny-aya-global, los requisitos dependen del tamaño del modelo base, que no se detalla en la información proporcionada.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: carga mediante PEFT y Transformers adjuntando el adaptador al modelo base `CohereLabs/tiny-aya-global`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CurateLaw-India Curated LoRA (este) | Adaptador LoRA sobre tiny-aya-global | no disponible | no disponible | no disponible | Hugging Face (adaptador) |
| Modelo A — Raw (mismo proyecto) | Adaptador LoRA sobre tiny-aya-global, datos sin filtrar | no disponible | no disponible | no disponible | Referenciado en el proyecto; repositorio no enlazado en la informacion |
| CohereLabs/tiny-aya-global (modelo base) | Modelo de lenguaje abierto | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas configuraciones en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación experimental: no es un sistema de redacción legal listo para producción.
- El contenido generado puede incluir inexactitudes, cláusulas omitidas, afirmaciones legales no respaldadas o términos contractuales inconsistentes.
- Los resultados deben ser revisados por profesionales legales cualificados antes de usarse en contratos laborales reales.
- El modelo no ofrece asesoramiento legal.
- Licencia no disponible: deben verificarse los términos del modelo base y del adaptador antes de cualquier uso comercial.
- Idiomas soportados no declarados oficialmente; el dominio de entrenamiento apunta al inglés jurídico indio, pero no se confirma.
- Longitud de contexto y parámetros del modelo base no documentados en la información disponible.
- Riesgo de alucinación en materia legal no cuantificado; la model card lo reconoce explícitamente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación externa prácticamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/Jibank/curatelaw-india-curated-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio del proyecto: https://github.com/Jiban243/CurateLaw
