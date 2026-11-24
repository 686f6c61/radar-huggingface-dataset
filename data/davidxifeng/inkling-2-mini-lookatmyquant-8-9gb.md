# davidxifeng/Inkling-2-Mini-LookAtMyQuant-8.9GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-8.9GB es un paquete unificado en formato `safetensors` que combina dos componentes: los pesos comprimidos del modelo objetivo Inkling-2-Mini (cuantizados con la técnica LAMQ hasta ocupar 8,9 GB) y un drafter especulativo DFlash2 pre-cuantizado a 4 bits con cuantización afín MLX (`group_size=64`). El paquete está empaquetado por el usuario davidxifeng y deriva de dos repositorios upstream: `shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB` (pesos objetivo) e `incoai/Inkling-2-Mini-DFlash2` (drafter especulativo). No se trata de un modelo entrenado desde cero, sino de una redistribución consolidada orientada a su uso con el runtime `kajikiri` sobre Apple Silicon.

El modelo objetivo cuenta con 17.953.140.298 parámetros reales según los safetensors, pero el paquete completo pesa 9,3 GB gracias a la compresión LAMQ (basada en trellis/LUT). La arquitectura subyacente se etiqueta como `inkling2_loop`, un diseño propietario del ecosistema Inkling-2 que no está documentado en la información disponible. El paquete integra 1.660 tensores: 1.485 correspondientes al objetivo LAMQ y 175 al drafter DFlash2 en 4 bits.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y está pensado específicamente para el runtime `kajikiri` (implementado en Zig) en Apple Silicon con Metal. No es un modelo de propósito general listo para usar con vLLM, llama.cpp o TGI, sino un artefacto de despliegue para un stack muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (detalles no disponibles); incluye drafter especulativo DFlash2 |
| Parametros totales | 17.953.140.298 (objetivo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LAMQ (trellis/LUT) para el objetivo; 4-bit MLX affine `group_size=64` para el drafter DFlash2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` unificado (`inkling2-packed-v2-safetensors`), 1 fichero de pesos de 9.274.375.708 B con 1.660 tensores |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo objetivo más allá de la etiqueta `inkling2_loop`. No se especifican número de capas, dimensión oculta, mecanismo de atención ni si emplea transformer denso, MoE o algún esquema híbrido. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o similares). Todo ello debe considerarse no disponible.

La innovación técnica documentada es de despliegue, no de entrenamiento. El paquete consolida los pesos objetivo LAMQ (originalmente en `.npz` v1 con metadatos trellis/LUT y un `steering.safetensors`) y el drafter DFlash2 en un único `model.safetensors`, junto con un `manifest.json` que embebe los metadatos por capa, el campo `format: "inkling2-packed-v2-safetensors"`, el prefijo `dflash2.` y la `dflash2_config`. El runtime `kajikiri` lee las cabeceras con `pread`, planifica slabs Metal `.shared` de hasta 512 MiB alineados a 256 bytes y carga regiones de tensores directamente en buffers GPU con hasta 8 hilos y `F_NOCACHE` híbrido (los tensores de 1 MiB o más evitan la caché de páginas del sistema; los pequeños de metadatos/LUT se mantienen en caché). El drafter DFlash2 se usa para decodificación especulativa (hasta 8 tokens por ronda según los ejemplos de la model card).

## Capacidades

- Generación de texto autoregresiva con el modelo objetivo Inkling-2-Mini (capacidades específicas de razonamiento, código o matemáticas no documentadas en la información disponible).
- Decodificación especulativa mediante el drafter DFlash2 integrado, con conmutación en caliente entre `auto`, `dflash2`, `dspark`, `off` o una ruta personalizada.
- Servidor HTTP compatible con la API de OpenAI (`POST /v1/models/load`, endpoints de inferencia) a través de `kajikiri serve`.
- Interfaz CLI (`kajikiri run`) con opciones de prompt, temperatura y estadísticas.
- WebUI con selector de drafter.
- Soporte de plantilla de chat (`chat_template.jinja`) y tokenizador incluidos.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el paquete está diseñado para ejecutarse con `kajikiri` sobre Metal en equipos Apple (medido en un M3 de 24 GB), lo que permite desplegar un modelo de ~18.000 millones de parámetros en un portátil o sobremesa Apple sin GPU dedicada.
- Servicio compatible con OpenAI para prototipos: `kajikiri serve` expone una API HTTP que permite conectar clientes existentes (SDKs de OpenAI, herramientas de evaluación) contra el modelo local sin reescribir integraciones.
- Evaluación de decodificación especulativa: el paquete permite comparar el rendimiento con y sin drafter (`--drafter dflash2|dspark|off`), útil para investigar el impacto de la decodificación especulativa en latencia y throughput.
- Pruebas de cuantización LAMQ: sirve como artefacto de referencia para validar la fidelidad de la compresión trellis/LUT frente a los pesos originales (la model card reporta `64/64 = 100,0%` de acuerdo greedy en la prueba de humo).
- Generación de texto interactiva en local: la CLI con `--prompt` y `--temp` permite usar el modelo para preguntas y respuestas puntuales, incluyendo ejemplos aritméticos con pasos (la model card usa "What is 17 times 23? Show the steps.").
- Integración en pipelines de CI para el propio runtime `kajikiri`: el paquete unificado acelera la carga en frío (3,41 s frente a 10,69 s con el `.npz` v1) y la carga del drafter (0,21 s frente a 1,00 s), lo que reduce el tiempo de arranque en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son de carga y decodificación en hardware concreto:

| Metrica | Valor | Condiciones |
|---|---|---|
| Carga en frio del objetivo | 3,41 s (frente a 10,69 s con `.npz` v1) | Apple M3, 24 GB, ReleaseFast |
| Carga objetivo + DFlash2 `u4` | 3,61 s (frente a 5,41 s con BF16 online quant) | Apple M3, 24 GB |
| Carga del drafter | 0,21 s (frente a 1,00 s) | Apple M3, 24 GB |
| Throughput de decodificación | 39,3 tok/s (30,7 tok/s wall) | `inkling2-smoke`, 64 tokens nuevos, `B=8`, `T_draft=8` |
| Tokens por ronda especulativa | 4,85 tok/round | mismo escenario |
| Latencia por ronda de draft | 9,1–9,2 ms/round | mismo escenario |
| Acuerdo greedy | 64/64 = 100,0% | Apple M3, 24 GB, ReleaseFast |

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (mismo tamaño, misma tarea o mismo ecosistema de despliegue), ni datos de rendimiento que permitan una comparación rigurosa. El paquete es además un artefacto específico del runtime `kajikiri` y del ecosistema Inkling-2, sin equivalentes documentados en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite uso comercial. Verificar los repositorios upstream (`shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB` e `incoai/Inkling-2-Mini-DFlash2`) antes de cualquier uso en producción.
- Dependencia dura del runtime `kajikiri`: el formato `inkling2-packed-v2-safetensors` y la carga con `pread`/`F_NOCACHE` son específicos de ese runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Orientado a Apple Silicon y Metal: las mediciones y el flujo de carga están descritos para Apple M3; no hay datos de funcionamiento en GPU NVIDIA o AMD.
- Idiomas soportados no disponibles: no puede garantizarse un comportamiento correcto en castellano ni en otros idiomas.
- Contexto máximo no disponible: no puede planificarse el uso en conversaciones multi-turno largas o en tareas de contexto extendido.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los habituales de un modelo de lenguaje de esta escala y evaluarse empíricamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Trazabilidad parcial: el paquete es una redistribución de terceros; los pesos originales y su procedencia de entrenamiento no están documentados en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/davidxifeng/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Modelo base (pesos objetivo LAMQ): https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Modelo base (drafter DFlash2): https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Runtime kajikiri (`qwen-image-zig`): https://github.com/davidxifeng/qwen-image-zig
