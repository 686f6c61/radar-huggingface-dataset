# florianvoss/Qwen3-4B-DFlash-N16-LLiMa-3.0.0

## Resumen

Qwen3-4B-DFlash-N16-LLiMa-3.0.0 es un paquete de generación de texto compilado para hardware SiMa Modalix y el runtime LLiMa 3.0.0, publicado por el usuario florianvoss. No se trata de un checkpoint cargable con Transformers, sino de un paquete de ejecución desempaquetado que contiene tanto el modelo objetivo (target) como su modelo borrador (draft) de decodificación especulativa DFlash, de modo que el runtime localice ambos componentes en tiempo de ejecución.

El paquete combina dos piezas: un target derivado de simaai/Qwen3-4B-Autoround-Safetensors (a su vez derivado de Qwen/Qwen3-4B), cuantizado en INT4 simétrico con AutoRound/GPTQ y grupo de 256, y un draft derivado de simaai/Qwen3-4B-DFlash-b16-RTN-INT8-Safetensors (derivado de z-lab/Qwen3-4B-DFlash-b16), con pesos lineales en INT8 simétrico por canal de salida. El contexto configurado en la compilación es de 4.096 tokens y el ancho de bloque DFlash es de 16 posiciones (un ancla y 15 propuestas).

Su relevancia es acotada y muy específica: interesa a quien despliegue inferencia en aceleradores SiMa Modalix y quiera reducir la latencia por token mediante decodificación especulativa sobre Qwen3-4B. El autor advierte de que la generación, la tasa de aceptación y el throughput en Modalix todavía no se han probado para este paquete concreto, y el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3) para el target, con modelo borrador DFlash para decodificación especulativa; paquete compilado, no cargable en Transformers |
| Parametros totales | 4B (heredados de Qwen/Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (configuración de compilación) |
| Tipos de cuantizacion | Target: INT4 simétrico AutoRound/GPTQ, group size 256. Draft: INT8 simétrico RTN por canal de salida. Activaciones en BF16; embeddings del target y caché KV en INT8 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | apache-2.0 (checkpoint target); el checkpoint draft declara MIT. Ver los repositorios de origen |
| Formato de pesos | Ficheros ELF compilados (179 ejecutables del target, 40 del draft, 219 en total) más assets de runtime y `compilation.json`; no es un Safetensors cargable |

Otros datos de compilación: tamaño de grupo de prefill 128, DFlash block width 16, Model SDK 3.0.0, commit del compilador LLiMa `07916f44dca36135a4abf4fec15f89fcff0634c4`, filter sharing habilitado donde la precisión del componente lo permite. Tamaño del repositorio: 6,3 GB.

## Arquitectura y entrenamiento

El modelo objetivo es Qwen3-4B, un transformer decoder denso de 4.000 millones de parámetros, en su variante ya cuantizada por SiMa con AutoRound/GPTQ en INT4 simétrico con grupo de 256. Sobre él se monta un segundo componente, el draft DFlash, que actúa como modelo de propuesta dentro de un esquema de decodificación especulativa: genera bloques de 16 posiciones de las que la primera es un ancla y las 15 restantes son propuestas que el target verifica. La cabeza de salida del draft se toma de los pesos INT4 empaquetados y las escalas del propio target, lo que reduce los parámetros adicionales necesarios.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. El paquete tampoco describe el entrenamiento del draft más allá de su procedencia (z-lab/Qwen3-4B-DFlash-b16) y de su esquema de cuantización. La innovación técnica destacable aquí no es de entrenamiento sino de despliegue: empaquetado compilado para un acelerador concreto, con cuantización mixta por componente (INT4 en el target, INT8 en el draft), embeddings y caché KV en INT8 y activaciones en BF16, más reparto de filtros entre componentes.

## Capacidades

- Generación de texto autorregresiva, heredada del modelo base Qwen3-4B.
- Decodificación especulativa con borrador DFlash de ancho de bloque 16 (1 ancla + 15 propuestas), orientada a reducir la latencia por token verificando varias posiciones por paso del target.
- Ejecución compilada sobre hardware SiMa Modalix mediante el runtime LLiMa 3.0.0.
- Ventana de contexto efectiva de 4.096 tokens en la configuración compilada.
- Prefill por grupos de 128 tokens.
- Soporte de tool calling, agentes, modo thinking, capacidades multilingües o visión: no disponible en la información proporcionada. Al ser un paquete compilado para inferencia, no se documenta ninguna interfaz de plantillas ni de chat.

## Casos de uso

- Inferencia de texto en el borde sobre aceleradores SiMa Modalix: es el único entorno soportado explícitamente por el paquete, que se ejecuta con `llima run` tras descargar el repositorio completo.
- Asistentes locales con requisito de baja latencia: el esquema DFlash permite proponer y verificar 16 posiciones por paso, lo que en teoría reduce el número de pasos del target por token emitido, siempre que la tasa de aceptación sea alta (no medida todavía).
- Procesamiento de documentos con contexto moderado: 4.096 tokens cubren resúmenes, extracción de campos y clasificación de fragmentos sin necesidad de conectividad a la nube.
- Despliegues con requisito de privacidad o air-gapped: al ser un paquete local sin dependencia de servicios externos, encaja en entornos donde los datos no pueden salir del dispositivo.
- Aplicaciones industriales o embebidas con presupuesto energético ajustado: el uso de INT4 en el target y INT8 en el draft reduce el ancho de banda de memoria frente a una ejecución en BF16.
- Integración en pipelines de generación de texto ya existentes sobre Modalix, sustituyendo un despliegue de Qwen3-4B sin decodificación especulativa por este paquete N16 para evaluar la ganancia de latencia.
- Validación interna de compiladores y runtimes: el repositorio incluye `compilation.json` con revisiones del compilador, ajustes y recuento verificado de componentes, útil como referencia para equipos que preparen sus propias compilaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la generación en Modalix, la tasa de aceptación y el throughput no se han probado todavía para este paquete. Sí se ha verificado la compilación completa del target y del draft, y el despliegue comprobó los 219 ficheros ELF y copió los assets de runtime.

## Requisitos de hardware

- VRAM estimada: no disponible. El destino no es una GPU, sino hardware SiMa Modalix con runtime LLiMa 3.0.0.
- GPU recomendadas: no aplica. El paquete no es un checkpoint Safetensors cargable, por lo que no se puede ejecutar en A100, H100, RTX 4090 ni similares.
- Compatibilidad con GPU de consumo: no, el paquete está compilado para un acelerador específico.
- Opciones de despliegue: exclusivamente `hf download florianvoss/Qwen3-4B-DFlash-N16-LLiMa-3.0.0 --local-dir ...` seguido de `llima run ./Qwen3-4B-DFlash-N16-LLiMa-3.0.0` con un runtime LLiMa compatible con DFlash sobre Modalix. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Es necesario descargar el repositorio completo (6,3 GB) para que el runtime encuentre tanto el target como el draft.
- Almacenamiento: se requieren al menos 6,3 GB para los ficheros del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Qwen3-4B-DFlash-N16-LLiMa-3.0.0 | 4B (target) + draft DFlash | 4.096 tokens | ELF compilados + runtime (no Safetensors) | apache-2.0 (target); MIT (draft) | Hardware SiMa Modalix con LLiMa 3.0.0 |
| simaai/Qwen3-4B-Autoround-Safetensors | 4B | no disponible en la información proporcionada | Safetensors cuantizado en INT4 AutoRound/GPTQ | apache-2.0 | Checkpoint de origen del target |
| simaai/Qwen3-4B-DFlash-b16-RTN-INT8-Safetensors | no disponible en la información proporcionada | no disponible en la información proporcionada | Safetensors cuantizado en INT8 RTN | MIT | Checkpoint de origen del draft |
| Qwen/Qwen3-4B | 4B | no disponible en la información proporcionada | Safetensors | no disponible en la información proporcionada | Modelo base original |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un checkpoint cargable con Transformers: es un paquete de runtime desempaquetado. Cualquier intento de cargarlo con `from_pretrained` fallará.
- El contexto está limitado a 4.096 tokens en la compilación, muy por debajo de lo habitual en despliegues de Qwen3 en GPU.
- No hay métricas de calidad, tasa de aceptación del draft ni throughput publicadas; el rendimiento real en Modalix es desconocido.
- El campo `inference: false` de la model card indica que no está pensado para Inference Endpoints gestionados.
- Licencias mixtas: el target declara apache-2.0 y el draft MIT. Es necesario revisar los términos de los repositorios de origen antes de un uso comercial, y en particular los del modelo base Qwen3-4B.
- Idiomas soportados no declarados en el paquete; no se puede asumir cobertura multilingüe sin verificación previa.
- Riesgo de alucinación y sesgos: no documentado para este paquete. Al derivar de Qwen3-4B, hereda las características de dicho modelo base, pero no hay evaluación específica publicada aquí.
- Dependencia fuerte de versión: requiere Model SDK 3.0.0 y un runtime LLiMa con soporte DFlash; el commit del compilador está fijado en `07916f44dca36135a4abf4fec15f89fcff0634c4`.
- Repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día: sin validación comunitaria ni histórico de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/florianvoss/Qwen3-4B-DFlash-N16-LLiMa-3.0.0
- Target de origen: https://huggingface.co/simaai/Qwen3-4B-Autoround-Safetensors
- Draft de origen: https://huggingface.co/simaai/Qwen3-4B-DFlash-b16-RTN-INT8-Safetensors
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B
- Draft original DFlash: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
