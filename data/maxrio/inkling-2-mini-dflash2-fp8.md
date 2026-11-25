# Maxrio/Inkling-2-Mini-DFlash2-FP8

## Resumen

Inkling-2-Mini-DFlash2-FP8 es un *drafter* de decodificación especulativa publicado por el usuario Maxrio (Maxrio9) a partir del checkpoint original `incoai/Inkling-2-Mini-DFlash2` de Inco AI. No es un modelo generativo autónomo: es la cabeza borrador que propone tokens candidatos para acelerar la inferencia de un modelo objetivo Inkling 2 Mini cuantizado en EXL3, dentro del runtime TensorFold. El paquete tiene 502.595.840 parámetros en safetensors y ocupa 0,6 GB en el repositorio.

Técnicamente se trata de una conversión parcial de precisión: 46 tensores de proyección del drafter (Q/K/V/output, gate/up/down, proyecciones convolucionales por capa y la proyección de *tap-fusion* de entrada) pasan de BF16 a E4M3 empaquetado con escalas FP32, mientras que los 35 tensores restantes conservan sus bytes BF16 originales. La arquitectura subyacente es DFlash2, el método de decodificación especulativa de Inco AI construido sobre DFlash de z-lab.

Su relevancia es acotada pero práctica: permite ejecutar decodificación especulativa con pesos FP8 en GPUs NVIDIA Blackwell (sm_120 o sm_121) usando TensorFold, reduciendo el coste de memoria del drafter frente a la versión BF16. La licencia Apache-2.0 facilita su reutilización, aunque la dependencia de un runtime y una GPU concretos limita su portabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2 (drafter de decodificación especulativa sobre transformer, con proyecciones convolucionales por capa y selector de candidatos) |
| Parámetros totales | 502.595.840 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 empaquetado con escalas FP32 (formato FP8G64 de TensorFold) en 46 tensores; BF16 en los 35 restantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout de dispositivo TensorFold para los tensores FP8) |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash2, es decir, un módulo auxiliar que predice varios tokens futuros por paso para que el modelo objetivo los verifique en paralelo. La arquitectura incluye proyecciones de atención (Q/K/V/output), proyecciones MLP (gate/up/down), proyecciones convolucionales por capa, un selector de candidatos, capas de normalización y kernels convolucionales base. En esta versión, Maxrio9 ha convertido 46 tensores de proyección de BF16 a E4M3 con una escala FP32 por cada grupo de 64 columnas y fila de salida, usando el orden de fragmento CUDA FP8G64 de TensorFold. Los tensores de código E4M3 y de escala FP32 se organizan según las dimensiones líderes que identifican los *tiles* de filas y grupos de columnas del layout de dispositivo de TensorFold.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO. El modelo no se ha reentrenado en esta conversión: se trata exclusivamente de un cambio de formato de pesos con aviso de modificación bajo la sección 4(b) de Apache-2.0. Los valores BF16 del selector de candidatos, las normalizaciones y los kernels convolucionales base se mantienen sin cambios.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que un modelo objetivo Inkling 2 Mini EXL3 verifica, acelerando la generación.
- Integración con TensorFold: el runtime puede descubrir los ficheros en el subdirectorio `dflash2/` del modelo objetivo o recibir el directorio del drafter mediante `--drafter`.
- Ejecución en FP8: los tensores convertidos usan E4M3 con escalas FP32, reduciendo el coste de memoria frente a BF16.
- Verificación de integridad: el paquete incluye `SHA256SUMS` para validar los ficheros con `sha256sum -c`.
- Compatibilidad de hardware restringida a NVIDIA Blackwell (sm_120 o sm_121).
- No es un modelo de chat, razonamiento, código ni visión por sí mismo; su función es exclusivamente acelerar otro modelo.

## Casos de uso

- Aceleración de inferencia de Inkling 2 Mini EXL3: desplegar el drafter junto al modelo objetivo en TensorFold para aumentar los tokens por segundo en GPUs Blackwell, reduciendo el número de pasos de decodificación del modelo grande.
- Servicio de generación de texto de baja latencia: en un endpoint con GPU sm_120/sm_121, usar decodificación especulativa para recortar la latencia por token en cargas interactivas donde el coste del modelo objetivo es el cuello de botella.
- Reducción de huella de memoria en despliegues multi-modelo: al ocupar 0,6 GB y usar FP8 en la mayoría de proyecciones, el drafter deja más VRAM libre para el modelo objetivo o para otros servicios en la misma GPU.
- Validación de pipelines de cuantización: servir como referencia para comprobar que la conversión BF16 a E4M3 con escalas FP32 por grupo de 64 columnas preserva la calidad de aceptación del drafter.
- Reproducibilidad y auditoría: verificar el paquete con `SHA256SUMS` en entornos de CI antes de desplegar el drafter en producción.
- Investigación en decodificación especulativa: comparar la tasa de aceptación y el throughput del drafter FP8 frente a la versión BF16 original en el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,6 GB; la VRAM en ejecución depende del layout TensorFold y del modelo objetivo, pero el drafter en sí es de tamaño reducido (aproximadamente 0,5 GB en FP8/BF16 mixto).
- GPU recomendadas: NVIDIA Blackwell con capacidad de cómputo sm_120 o sm_121. No se indica compatibilidad con arquitecturas anteriores.
- ¿Cabe en GPU de consumo? No disponible; la restricción documentada es la arquitectura Blackwell, no el tamaño de memoria.
- Opciones de despliegue: exclusivamente TensorFold, con el release `inkling2-mini-exl3-v2` y un modelo objetivo Inkling 2 Mini EXL3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maxrio/Inkling-2-Mini-DFlash2-FP8 | 502.595.840 | no disponible | safetensors FP8/BF16 mixto (TensorFold) | Apache-2.0 | Hugging Face |
| incoai/Inkling-2-Mini-DFlash2 (base) | no disponible en la información | no disponible | safetensors BF16 | Apache-2.0 (según el aviso de modificación) | Hugging Face |
| DFlash de z-lab | no disponible | no disponible | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo objetivo Inkling 2 Mini EXL3 y el runtime TensorFold; no funciona con pipelines estándar de `transformers`.
- Dependencia de hardware: solo GPUs NVIDIA Blackwell (sm_120 o sm_121). No hay soporte documentado para Ampere, Hopper ni consumer anteriores.
- Formato propietario del runtime: los tensores FP8 usan el layout de dispositivo FP8G64 de TensorFold, no un formato FP8 estándar portable.
- Conversión parcial: 35 tensores siguen en BF16, por lo que el ahorro de memoria es parcial y el comportamiento numérico puede diferir del checkpoint original.
- Sin datos de evaluación: no hay benchmarks publicados de tasa de aceptación, throughput ni calidad, lo que impide estimar la ganancia real frente al drafter BF16.
- Idiomas no declarados: no se especifican capacidades multilingües.
- Riesgo de alucinación: heredado del modelo objetivo; el drafter solo propone candidatos que el objetivo verifica, pero una tasa de aceptación baja degradaría el rendimiento en lugar de mejorarlo.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de modificación (sección 4(b)) y el fichero LICENSE incluido.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema mínimo, sin soporte comunitario documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Maxrio/Inkling-2-Mini-DFlash2-FP8
- Modelo base: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Blog de DFlash2 (Inco AI): https://inco.ai/blog/dflash2/
- Repositorio DFlash (z-lab): https://github.com/z-lab/dflash
- Release de TensorFold: https://github.com/Maxrio9/TensorFold/releases/tag/inkling2-mini-exl3-v2
