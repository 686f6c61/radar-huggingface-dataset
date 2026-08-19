# GatekeeperZA/Qwen3.5-0.8B-RKLLM-v1.2.3

## Resumen

El modelo `GatekeeperZA/Qwen3.5-0.8B-RKLLM-v1.2.3` es una conversión al formato RKLLM del modelo Qwen3.5-0.8B de Alibaba, realizada por el usuario GatekeeperZA para su ejecución en el NPU de los SoC Rockchip RK3588 y RK3588S. Esta conversión permite ejecutar un LLM de 0.8 mil millones de parámetros en placas de bajo coste como Orange Pi 5 Plus, con cuantización w8a8 (pesos y activaciones de 8 bits) y un tamaño de archivo inferior a 1 GB tras la cuantización.

El modelo está pensado para despliegues en el borde (edge) donde la memoria es limitada y se requiere baja latencia, como asistentes siempre activos o sistemas embebidos. Al tratarse de la variante base (sin fine-tuning de instrucciones), es adecuado para aplicaciones que proporcionan su propio prompting o para fine-tuning posterior. La conversión se realizó con RKLLM Toolkit v1.2.3 y requiere RKLLM Runtime ≥ v1.2.1 (recomendado v1.2.3) y driver RKNPU ≥ 0.9.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5, sin detalles adicionales disponibles) |
| Parametros totales | 0.8 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo del demo usa 8192 como parametro, pero no esta confirmado oficialmente) |
| Tipos de cuantizacion | w8a8 (8-bit pesos, 8-bit activaciones) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (.rkllm) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, desarrollado por el equipo Qwen de Alibaba, sucesor de Qwen3-0.6B. No se dispone de detalles sobre la arquitectura interna (número de capas, atención, etc.) ni sobre el proceso de entrenamiento del modelo base en la información proporcionada. La conversión a RKLLM se realizó con RKLLM Toolkit v1.2.3, aplicando cuantización w8a8 (8 bits en pesos y activaciones) para optimizar la inferencia en el NPU de RK3588. No se menciona el uso de RLHF, DPO u otras técnicas de alineación en el modelo base.

## Capacidades

- Generación de texto en inglés y chino (modelo multilingüe).
- Modelo base, sin fine-tuning específico para instrucciones ni para tool calling.
- No soporta thinking mode (modo de razonamiento) según la model card.
- Optimizado para inferencia en NPU Rockchip RK3588/RK3588S con baja latencia y bajo consumo.
- No se documentan capacidades de visión, audio ni otras modalidades (el modelo base es de texto).

## Casos de uso

- Asistentes de voz siempre activos en dispositivos edge: su tamaño reducido (menos de 1 GB) y su baja latencia lo hacen adecuado para altavoces inteligentes o asistentes integrados en placas RK3588, donde el consumo energético y la memoria son críticos.
- Chatbots locales con privacidad de datos: al ejecutarse completamente en el dispositivo, permite procesar conversaciones sin enviar datos a la nube, útil en entornos sensibles (salud, finanzas, etc.).
- Sistemas de respuesta automática en kioscos interactivos: el modelo puede gestionar consultas de usuarios en inglés o chino en tiempo real, con tiempos de respuesta adecuados para interacción presencial.
- Traducción automática básica entre inglés y chino: gracias a su soporte bilingüe, puede servir como motor de traducción ligero en aplicaciones embebidas.
- Prototipado de aplicaciones de IA en hardware Rockchip: al ser un modelo base, permite experimentar con fine-tuning sobre dominios específicos sin necesidad de hardware de alto rendimiento.
- Despliegue en dispositivos IoT con limitaciones de RAM: con un consumo de ~1.5 GB cargado, es viable en placas RK3588 de 8 GB, dejando margen para otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC: RK3588 o RK3588S (no compatible con RK3576 sin reconversión).
- NPU: 3 núcleos NPU del RK3588.
- RAM: ~1.5 GB cargado; funciona en placas con 8 GB de RAM (probado en Orange Pi 5 Plus con 16 GB).
- Runtime: RKLLM Runtime ≥ v1.2.1 (recomendado v1.2.3).
- Driver RKNPU: ≥ 0.9.6.
- Opciones de despliegue: RKLLM API Server (GatekeeperZA/RKLLM-API-Server) o el demo oficial de RKLLM (`rkllm_api_demo`).
- Latencia y throughput: no se proporcionan datos específicos para este modelo; como referencia, el modelo Qwen3-1.7B-RKLLM del mismo autor alcanza ~13.6 tok/s en el NPU, por lo que se espera que este modelo de 0.8B sea más rápido, aunque no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad (NPU RK3588) | Licencia |
|---|---|---|---|---|
| GatekeeperZA/Qwen3.5-0.8B-RKLLM (este) | 0.8B | No disponible | No disponible | Apache-2.0 |
| GatekeeperZA/Qwen3-1.7B-RKLLM | 1.7B | No disponible | ~13.6 tok/s (según repo del autor) | Apache-2.0 |
| Qwen3-0.6B (original) | 0.6B | No disponible | No aplica (no RKLLM) | Apache-2.0 |

No se dispone de datos de rendimiento (benchmarks) para comparar con precisión. El modelo de 0.8B es más pequeño que el de 1.7B, lo que sugiere menor latencia y menor consumo de memoria, pero no hay cifras oficiales.

## Limitaciones y advertencias

- Modelo base sin fine-tuning de instrucciones: no está optimizado para seguir instrucciones complejas ni para tareas de razonamiento avanzado; requiere que la aplicación proporcione su propio prompting.
- Solo soporta inglés y chino; no cubre otros idiomas.
- La cuantización w8a8 puede degradar ligeramente la precisión respecto al modelo original en precisión completa.
- Dependencia del ecosistema RKLLM: el formato .rkllm no es portable a otras plataformas (GPU, CPU x86, etc.) sin reconversión.
- No soporta thinking mode, a diferencia de otras variantes de Qwen3.5 que sí lo incluyen.
- Riesgo de alucinaciones y sesgos inherente a los LLM; se recomienda validar las salidas en aplicaciones críticas.
- Requiere runtime y driver específicos; versiones antiguas pueden no ser compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GatekeeperZA/Qwen3.5-0.8B-RKLLM-v1.2.3
- Repositorio RKLLM-API-Server: https://github.com/GatekeeperZA/RKLLM-API-Server
- Repositorio oficial rknn-llm (airockchip): https://github.com/airockchip/rknn-llm
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
