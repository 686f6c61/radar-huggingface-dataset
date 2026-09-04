# ndaly/Nemotron-3.5-Lightning-30B-A3B-NVFP4-tt-p300x2

## Resumen

Este repositorio es un bundle self-contained de tt-model v5 para servir el modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B NVFP4 en un mesh de 4 chips Tenstorrent Blackhole (2× P300). Lo publica ndaly y no contiene los pesos del modelo: el manifiesto apunta al checkpoint upstream de NVIDIA, fijado a una revisión concreta. Incluye el entorno exacto de ejecución (rueda ttnn, fork de vLLM, plugin y dependencias) para reproducir el despliegue validado.

El modelo original es un LLM con arquitectura de mezcla de expertos (MoE) de 30B parámetros totales y 3B activos, cuantizado en NVFP4. La ventana de contexto es de 1.048.576 tokens, lo que permite procesar documentos o código muy extensos en una sola conversación. La relevancia de este bundle es que permite ejecutar un modelo de este tamaño en hardware alternativo a las GPUs NVIDIA, con un servidor compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según nomenclatura A3B; detalles no disponibles |
| Parametros totales | 30B |
| Parametros activos | 3B |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | No incrustados; el manifiesto apunta al checkpoint upstream en formato HuggingFace (NVFP4) |

## Arquitectura y entrenamiento

El bundle no es un modelo independiente, sino una distribución self-contained para desplegar el modelo original en hardware Tenstorrent. Incluye una rueda ttnn construida sobre tt-metal v0.74.0-dev20260622-202-gcfd2056ecb4, un fork de vllm (dev, 8aebd49) con el plugin vllm-tt-plugin que registra TTNemotronHForCausalLM, el paquete models de tt-metal y un cierre de dependencias Python. El manifiesto v5 apunta al checkpoint upstream nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4, fijado a la revisión 6dbbd757ea75a8ece6e0702872e3ae53f9987728. La primera ejecución convierte los pesos NVFP4 a pesos de dispositivo y los cachea (~96 GB). No se proporcionan datos de entrenamiento del modelo original; la ficha de NVIDIA NIM indica que los datos de post-entrenamiento tienen fecha de corte de mayo de 2026.

Entre las innovaciones técnicas del despliegue destacan el modo de muestreo en dispositivo (`sample_on_device_mode: all`), el tamaño de región de traza (`trace_region_size: 1073741824`) y la configuración de fabric `FABRIC_1D_RING` para el mesh Blackhole.

## Capacidades

- Generación de texto y chat mediante API OpenAI-compatible en localhost:8000.
- Ventana de contexto de 1.048.576 tokens, validada en servidor.
- Razonamiento con parser `deepseek_r1`, lo que sugiere soporte para cadenas de razonamiento o modo thinking.
- Múltiples secuencias concurrentes (`max_num_seqs: 32`) y decodificación en dispositivo.
- No se documentan capacidades de tool calling, visión o audio.
- Idiomas soportados no documentados.

## Casos de uso

- Servicio de chat con contexto largo: Gracias a la ventana de 1.048.576 tokens, el modelo puede atender consultas sobre documentación técnica extensa o repositorios de código completos. El bundle expone un endpoint OpenAI-compatible en localhost:8000, por lo que integrarlo en un servicio existente es inmediato.
- Procesamiento de código fuente en repositorios grandes: Con 30B parámetros totales y 3B activos, el modelo puede razonar sobre código y generar parches; el contexto de 1M permite cargar múltiples archivos en una sola conversación.
- Asistente de razonamiento para investigación: El parser `deepseek_r1` sugiere soporte para cadenas de razonamiento, útil en tareas de análisis lógico o matemático. El despliegue local evita enviar datos a la nube.
- Evaluación de modelos en hardware Tenstorrent: El bundle incluye el entorno exacto de validación (tt-metal v0.74.0-dev, vllm fork, plugin), lo que permite reproducir benchmarks y pruebas de regresión en un mesh Blackhole.
- Despliegue de un modelo MoE en un solo nodo: Con 2× P300 se obtiene un servidor vLLM con 32 secuencias concurrentes, adecuado para equipos que necesitan servir un modelo de 30B sin GPUs NVIDIA.
- Integración en pipelines de CI/CD: El flujo `tt-model pull` y `tt-model serve` permite automatizar el arranque del servidor en entornos de pruebas, con la API OpenAI-compatible para tests de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento disponibles son métricas de servidor del bundle, no benchmarks de capacidad.

| Metrica | Valor |
|---|---|
| Throughput decode (batch 32, tight-loop) | 65 tok/s/usuario |
| Tiempo hasta el primer token (TTFT) | 109 ms |
| Contexto probado | 1.048.576 tokens |
| Spec tests del release workflow | 22/22 superados |

## Requisitos de hardware

- Hardware: 2× Tenstorrent P300 (4 chips Blackhole). No compatible con GPUs NVIDIA.
- RAM del host: ~250 GB recomendados.
- Espacio en disco: 0,8 GB para el bundle + ~96 GB para caché de pesos convertidos.
- SO: Ubuntu 24.04 exclusivamente (rueda ttnn manylinux_2_39).
- Firmware/driver: TT-KMD 2.9.0 y tt-smi 5.3.0 usados en validación; requiere SFPI del sistema.
- Herramientas: tt-model (tt-model-manager), Python venv, uv.
- Despliegue: `tt-model serve`, vLLM con plugin Tenstorrent, API OpenAI-compatible.
- Latencia/throughput: 65 tok/s/usuario a batch 32, 109 ms TTFT.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparables de otros modelos. El bundle es una distribución de despliegue para hardware Tenstorrent, no un modelo independiente; una comparativa requeriría benchmarks del modelo original no disponibles.

## Limitaciones y advertencias

- Sin pesos incrustados: el repositorio es un manifiesto que apunta al checkpoint upstream; requiere `tt-model login` mientras sea privado y acceso a HuggingFace.
- Solo Ubuntu 24.04: la rueda ttnn está construida para manylinux_2_39 y no funcionará en otros sistemas sin recompilación.
- Hardware específico: requiere 2× P300 (4 chips Blackhole); no se puede ejecutar en GPUs convencionales.
- Problema conocido: se ha detectado un wedge de `ttnn.slice` bajo condiciones específicas de trace poisoning; se documenta en el release report incluido.
- Conversión inicial costosa: la primera ejecución convierte el checkpoint NVFP4 y lo cachea (~96 GB), lo que puede tardar varios minutos.
- Licencia e idiomas no documentados: no se especifican en la información disponible, por lo que el uso comercial debe verificarse con el autor y con NVIDIA.
- Sin benchmarks académicos: no se proporcionan resultados de MMLU, HumanEval, GSM8K, etc.
- Dependencias fijadas a versiones de desarrollo: tt-metal v0.74.0-dev20260622-202-gcfd2056ecb4 y vllm fork dev 8aebd49; actualizaciones pueden romper el bundle.

## Enlaces

- https://huggingface.co/ndaly/Nemotron-3.5-Lightning-30B-A3B-NVFP4-tt-p300x2
- https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- https://benchlm.ai/models/nemotron-3-5-lightning-30b-a3b-nvfp4
- https://github.com/tenstorrent/tt-model-manager
