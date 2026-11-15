# REXL3/GLM-5.3-DFlash2-EXL3-3-6bpw-Experimental

## Resumen

GLM-5.3-DFlash2-EXL3-3-6bpw-Experimental es una conversión de pesos del drafter DFlash2 de seis capas asociado a la familia GLM-5.3, publicada por el usuario REXL3 en Hugging Face. No se trata de un modelo de lenguaje autónomo: es un modelo borrador (draft model) pensado para decodificación especulativa junto al modelo objetivo GLM-5.3 de Z.AI. El artefacto aplica cuantización EXL3 de precisión mixta (3 y 6 bits por peso) sobre las proyecciones del drafter original de Inco AI.

El modelo base es `incoai/GLM-5.3-DFlash2`, con la arquitectura, tokenizer, plantilla de chat y valores por defecto de generación heredados de `zai-org/GLM-5.3`. El repositorio contiene 690.585.088 parámetros en formato safetensors (1,4 GB), distribuidos en 44 ficheros y 225 claves de tensor. La conversión es explícitamente experimental y no está cualificada para servicio en producción.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación para validar la carga de draft models EXL3 y su interoperabilidad con el target GLM-5.3. El autor no reclama mejoras de velocidad, preservación de calidad ni compatibilidad directa con motores estándar como vLLM o SGLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (drafter DFlash2, arquitectura GLM-5.3) |
| Parámetros totales | 690.585.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los campos heredados de config no se declaran como capacidades probadas) |
| Tipos de cuantización | EXL3 mixta: 6 bits/peso en proyecciones Q, K, V; 3 bits/peso en proyección de salida de atención, MLP gate/up/down y FC completa |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3-dflash2-mixed (otros términos; ver LICENSE, LICENSE.apache-2.0, LICENSE.glm y NOTICE) |
| Formato de pesos | safetensors con tensores EXL3 (`.trellis`, `.suh`, `.svh`, `.mul1`) |

## Arquitectura y entrenamiento

El artefacto corresponde al drafter DFlash2 de seis capas, con 225 claves de tensor repartidas en 44 ficheros safetensors: 43 grupos de matrices codificadas y un fichero con 53 tensores retenidos. La proyección de características completa (`fc`) está incluida con forma `[6144, 36864]` y no es un export parcial. Las proyecciones Q, K, V de las seis capas se codifican a 6 bits/peso (18 grupos), mientras que la salida de atención, las proyecciones MLP gate/up/down y la FC se codifican a 3 bits/peso (24 grupos más 1 grupo FC). El payload total indexado asciende a 1.381.170.348 bytes, sin contar cabeceras ni assets del repositorio.

No se ha realizado entrenamiento nuevo: la conversión reutiliza los pesos del drafter original de Inco AI. La calibración se hizo con muestras pequeñas de activaciones BF16 deprofundizadas de forma aproximada mediante un profesor en CPU, limitadas a entre ocho y dieciséis filas observadas por proyección (rango máximo ocho o dieciséis), y a rango máximo dieciséis en la FC. El autor advierte que estas muestras no constituyen un corpus de producción representativo ni un conjunto de evaluación independiente, y que el profesor aproximado no establece paridad aritmética con el FP8 dinámico original. Las tasas de 3/6 bits son elecciones provisionales de investigación, no evidencia de precisión óptima ni de calidad aceptable.

## Capacidades

- No es un modelo de lenguaje autónomo: requiere el modelo objetivo GLM-5.3 y no incluye pesos del target, embeddings ni cabeza de vocabulario.
- Función prevista: actuar como drafter en decodificación especulativa junto al target GLM-5.3.
- Carga de tensores EXL3: el runtime debe soportar explícitamente la arquitectura DFlash2, el layout de tensores EXL3 y las interfaces de características y embedding/head del target.
- No se ha medido ni cualificado: aceptación del draft, generación extremo a extremo, calidad de salida, decodificación especulativa sin pérdida, throughput, latencia, operación con contexto completo, prefix caching, kernels de producción ni servicio en GB10.
- No se incluye implementación ejecutable del modelo ni código del cuantizador.
- Soporte de tool calling, agentes, multilingüismo, visión o audio: no disponible (no declarado para este artefacto).

## Casos de uso

- Investigación en carga de draft models EXL3: validar que un runtime propio puede leer los tensores `.trellis`, `.suh`, `.svh` y `.mul1` y reconstruir las matrices del drafter de seis capas.
- Verificación de integridad de conversiones cuantizadas: el autor publica comprobaciones de cobertura exacta de claves, hashes de fichero, cabeceras de tensor, geometría de grupos y aceptación por el escáner nativo, útiles como referencia para pipelines de QA de cuantización.
- Estudio de decodificación especulativa con precisión mixta: comparar el comportamiento de un drafter a 3/6 bits frente a su versión original, siempre que se disponga del target GLM-5.3 y de un runtime compatible.
- Desarrollo de kernels EXL3 para DFlash2: servir como caso de prueba para implementar soporte de layout EXL3 en motores de inferencia propios.
- Reproducibilidad de conversiones: el `quantization_manifest.json` y `source_config.json` permiten auditar la procedencia y la configuración original del drafter.
- Análisis de sensibilidad a la calibración de rango bajo: evaluar el impacto de calibrar con 8-16 filas en la calidad del draft, como línea de investigación metodológica.
- No adecuado para: despliegue en producción, atención al cliente, generación de código, agentes o cualquier uso que requiera un modelo de lenguaje completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los benchmarks de la model card upstream no aplican a estos pesos y que no se reclama ninguna mejora de velocidad, preservación de calidad ni compatibilidad directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El payload indexado es de 1.381.170.348 bytes (aproximadamente 1,29 GiB) más cabeceras y assets; el repo ocupa 1,4 GB.
- GPU recomendadas: no disponible. El autor menciona que la codificación usó rutas de investigación con GPU, pero la verificación en CPU no cualifica el comportamiento en runtime de producción.
- Compatibilidad con GPU de consumo: no disponible; no se ha validado.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` y los comandos estándar de SGLang/vLLM no están validados para esta conversión. Se requiere un runtime con soporte explícito de DFlash2 y EXL3.
- Latencia y throughput: no medidos ni cualificados para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| REXL3/GLM-5.3-DFlash2-EXL3-3-6bpw-Experimental | 690.585.088 | no disponible | EXL3 3/6 bits | glm-5.3-dflash2-mixed | Experimental, no cualificado para servicio |
| incoai/GLM-5.3-DFlash2 (base) | no disponible | no disponible | BF16 original | Apache-2.0 | Modelo borrador de referencia |
| zai-org/GLM-5.3 (target) | no disponible | no disponible | no disponible | GLM-5.3 License | Modelo objetivo, no incluido en este repo |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: sin los pesos del target GLM-5.3, embeddings y cabeza de vocabulario, no puede generar texto por sí mismo.
- Artefacto experimental: el autor no reclama calidad, velocidad ni compatibilidad drop-in.
- Calidad no evaluada: no se han medido aceptación del draft, calidad de salida ni decodificación especulativa sin pérdida.
- Calibración de rango muy bajo (8-16 filas): no representativa de un corpus de producción.
- El profesor de deprofundización aproximado no garantiza paridad con la aritmética FP8 dinámica original.
- Las tasas 3/6 bits son provisionales y no evidencia de precisión óptima.
- Sin soporte validado en vLLM, SGLang ni Transformers estándar; requiere runtime específico.
- No se distribuye implementación ejecutable ni código del cuantizador.
- Licencia mixta: pesos del drafter bajo Apache-2.0 de Inco AI; tokenizer, plantilla de chat y valores por defecto bajo GLM-5.3 License, con requisito condicional de revisión de seguridad para uso comercial como Model-as-a-Service.
- Sin aval de los autores upstream.
- Riesgo de alucinación y sesgos: no evaluados para este artefacto (no aplica como modelo generativo autónomo, pero el drafter hereda los del target).

## Enlaces

- Hugging Face: https://huggingface.co/REXL3/GLM-5.3-DFlash2-EXL3-3-6bpw-Experimental
- Modelo base (drafter): https://huggingface.co/incoai/GLM-5.3-DFlash2/tree/8f02251dc71a9da2053dfc15bfa293fbee5579b0
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3/tree/ba32f8c19c8738e2c57c71798c601d477a7bf844
- Ficheros de licencia en el repo: `LICENSE`, `LICENSE.apache-2.0`, `LICENSE.glm`, `NOTICE`
- Manifiesto de cuantización: `quantization_manifest.json` en el repositorio
- Configuración original del drafter: `source_config.json` en el repositorio
