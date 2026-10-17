# mhseo2/opd_sftk8dm15e_s1500_qwen3moe30b_ot3math_rklrest8-step50

## Resumen

Este repositorio contiene un checkpoint de ajuste fino publicado por el usuario mhseo2 bajo el identificador `opd_sftk8dm15e_s1500_qwen3moe30b_ot3math_rklrest8-step50`. Por la nomenclatura, parece derivar de un modelo Qwen3 con arquitectura de mezcla de expertos (MoE) y haber sido sometido a un entrenamiento supervisado (SFT) orientado a matemáticas, con un checkpoint guardado en el paso 50. No existe model card, pipeline declarado ni documentación sobre datos, hiperparámetros o evaluación.

El dato objetivo disponible es el recuento de safetensors: 8.190.735.360 parámetros, es decir, 8,19 mil millones, con un repositorio de 16,4 GB en precisión BF16. Este dato entra en contradicción aparente con el sufijo `qwen3moe30b` del nombre, que sugiere un modelo de aproximadamente 30 mil millones de parámetros totales; podría tratarse de un export parcial, de un subconjunto de expertos o de un checkpoint podado, pero no hay información que lo confirme.

Su relevancia es limitada y de carácter experimental: 14 descargas, 0 likes y ausencia de resultados públicos. Resulta útil como artefacto de investigación para estudiar recetas de SFT sobre modelos Qwen3 MoE, pero no es adecuado para producción sin una evaluación independiente y sin una licencia clara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según la nomenclatura `qwen3moe` del repositorio; no confirmado mediante documentación |
| Parámetros totales | 8.190.735.360 (8,19 B), según los safetensors publicados |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican variantes cuantizadas; los pesos están en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |
| Tamaño del repositorio | 16,4 GB |
| Fecha de creación | 17 de octubre de 2026 |

## Arquitectura y entrenamiento

El nombre del repositorio sugiere una arquitectura Qwen3 MoE, probablemente relacionada con Qwen3-30B-A3B, con un proceso de SFT identificado como `sftk8dm15e_s1500` y un checkpoint en el paso 50. El segmento `ot3math` apunta a un conjunto de datos de matemáticas, posiblemente OpenThoughts 3 u otra recopilación con ese nombre, mientras que `rklrest8` podría indicar alguna variante de regularización KL, aunque ninguna de estas interpretaciones está documentada.

No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones de atención o decodificación. El recuento real de 8,19 B de parámetros frente a la referencia nominal de 30 B en el nombre es la discrepancia técnica más relevante y debería verificarse antes de cualquier uso.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por la arquitectura, pero no evaluada ni documentada en este repositorio.
- Razonamiento matemático: el sufijo `ot3math` sugiere entrenamiento con datos de matemáticas, sin resultados publicados que lo confirmen.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking o razonamiento extendido: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Plantilla de chat: no confirmada en la información del repositorio.

## Casos de uso

- Investigación sobre recetas de SFT: el checkpoint permite analizar el efecto de 50 pasos de ajuste supervisado frente al modelo base, comparando pérdidas y comportamiento cualitativo en un entorno controlado.
- Experimentos de razonamiento matemático: puede emplearse para evaluar si el ajuste con datos tipo `ot3math` mejora tareas de aritmética y álgebra, siempre que se ejecuten benchmarks propios como GSM8K o MATH.
- Estudio de checkpoints intermedios: al estar guardado en el paso 50, es útil para trazar curvas de aprendizaje y decidir si conviene continuar el entrenamiento.
- Destilación o merging experimental: su tamaño de 8,19 B facilita probarlo como alumno o como componente en técnicas de fusión de pesos, con verificación previa de compatibilidad de arquitectura.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines con Transformers, vLLM o TGI en GPUs de 24 GB, midiendo carga, memoria y latencia con un modelo de aproximadamente 8 B.
- Generación de datos sintéticos en dominio matemático: puede producir problemas y soluciones para ampliar datasets, siempre con revisión humana y filtrado de errores.
- Docencia y experimentación académica: adecuado para demostrar el ciclo completo de fine-tuning y evaluación, no para servicios a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay model card, tabla de evaluaciones ni comparaciones oficiales con MMLU, HumanEval, GSM8K, MATH u otras pruebas. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: 16,4 GB solo para los pesos; con activaciones y caché KV, el consumo práctico se sitúa alrededor de 20-24 GB según la longitud de contexto.
- VRAM estimada en FP32: aproximadamente 32,8 GB, no recomendable para GPUs de consumo.
- VRAM estimada en INT8: alrededor de 8,2 GB para los pesos.
- VRAM estimada en INT4: alrededor de 4,1 GB para los pesos, sujeta a la disponibilidad de una conversión GGUF o AWQ/GPTQ no publicada.
- GPU de consumo: RTX 4090 o RTX 3090 de 24 GB pueden cargar los pesos en BF16, pero con poco margen para contextos largos; RTX 4080 de 16 GB requiere cuantización a 8 bits o inferior; RTX 3060 de 12 GB necesita 4 bits.
- GPU de centro de datos: A100 de 40 u 80 GB, H100 de 80 GB y L40S de 48 GB son opciones holgadas para BF16.
- Despliegue: Transformers, vLLM y TGI son compatibles con pesos safetensors; llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de referencia son públicos y corresponden a sus versiones originales; no han sido verificados en este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint | 8,19 B según safetensors; el nombre indica 30 B | No disponible | No disponible | Safetensors, 14 descargas |
| Qwen3-8B | 8,2 B | 32.768 nativo; 131.072 con YaRN | Apache 2.0 | Público en HuggingFace |
| Qwen3-30B-A3B | 30,5 B totales; 3,3 B activos | 32.768 nativo; 131.072 con YaRN | Apache 2.0 | Público en HuggingFace |
| Llama 3.1 8B | 8,03 B | 128.000 | Llama 3.1 Community License | Público en HuggingFace |

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no disponible: no puede asumirse permiso para uso comercial, redistribución o modificación.
- Checkpoint en el paso 50: es probable que el entrenamiento no haya convergido, por lo que la calidad puede ser inferior a la del modelo base.
- Discrepancia de parámetros: el nombre indica 30 B y los safetensors contienen 8,19 B; podría ser un export parcial, podado o incompatible con la arquitectura esperada.
- Sin benchmarks: no hay evidencia de mejora en matemáticas ni en otras tareas; no deben asumirse capacidades por el nombre.
- Idiomas desconocidos: no se declara cobertura lingüística, incluido el castellano.
- Riesgo de alucinación y sesgos: no evaluado; cualquier salida en producción requiere verificación.
- Validación comunitaria mínima: 14 descargas y 0 likes reducen la confianza en el artefacto.
- Plantilla de chat no confirmada: podría requerir formato manual de prompts y afectar a la calidad de las respuestas.
- No apto para producción sin auditoría previa de licencia, calidad y seguridad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mhseo2/opd_sftk8dm15e_s1500_qwen3moe30b_ot3math_rklrest8-step50)
- [Repositorio relacionado con nomenclatura similar, paso 10](https://huggingface.co/seomh/opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step10)
- [Repositorio relacionado con nomenclatura similar, paso 20](https://huggingface.co/seomh/opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step20)
