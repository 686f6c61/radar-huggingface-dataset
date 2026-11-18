# anemll/anemll-forge-qwen3.8-27B-V8-96K

## Resumen

ANEMLL Forge Qwen3.8-27B V8-96K es una build de investigación publicada por anemll que convierte y cuantiza el modelo denso Qwen/Qwen3.8-27B (27B parámetros, Apache-2.0, desarrollado por el equipo Qwen de Alibaba Cloud) para ejecutarlo de forma conjunta en la Apple Neural Engine (ANE) y la GPU de un Mac con chip M6. No es un modelo nuevo: es una distribución de pesos y código orientada a inferencia local en hardware Apple, con un contexto ampliado hasta 98.304 tokens (96K) y un esquema de prefill segmentado entre ANE y GPU.

La innovación principal es el llamado schedule V8 GPU + ANE prefill: durante la fase de prefill, todas las capas FFN se ejecutan en la Neural Engine mientras que los mixers (Gated DeltaNet y atención) se ejecutan en la GPU, compartiendo una única copia de los pesos que la GPU lee directamente de los programas compilados de la ANE. La decodificación se ejecuta en la ANE con un drafter especulativo Core AI DFlash2 incluido (ciclos de verificación con T=8).

El proyecto es relevante porque demuestra inferencia de un modelo de 27B con contexto de 96K en un equipo de consumo (M6 con 32 GB de memoria unificada), con velocidades de prefill medidas de 586 tok/s a 2K y 347 tok/s a 95K, y decodificación de 18-34 tok/s según la longitud. Se distribuye como research preview, con scripts que asumen rutas de la máquina de desarrollo y dependencias externas no incluidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas mixer híbridas (Gated DeltaNet + atención); pesos del modelo base Qwen3.8-27B, recompilados para ANE + GPU |
| Parametros totales | 27B (heredados del modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 98.304 tokens (96K) |
| Tipos de cuantizacion | Cuantización propia de ANEMLL Forge (release 0.2); niveles concretos no disponibles en la información proporcionada; atención en FP8 en M6 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquetes Core AI compilados para ANE (coreai/m6-96k-v8), drafter DFlash2 (drafter/all3), embedding table FP16 en host (model/); no safetensors/GGUF estándar |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27B parámetros del equipo Qwen (Alibaba Cloud). La build de ANEMLL no reentrena el modelo: parte de los pesos del release 0.2 de anemll/anemll-forge-qwen3.8-27B y los recompila para el schedule V8, en el que el prefill reparte la carga entre la Neural Engine (FFN) y la GPU (mixers Gated DeltaNet y atención), compartiendo una sola copia de pesos. La decodificación se ejecuta íntegramente en la ANE con decodificación especulativa mediante un drafter DFlash2 (T=8 ciclos de verificación), derivado de ProCreations/Ternary-Bonsai-2-27B-DFlash2.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en el modelo base dentro de la información proporcionada. La model card indica que la calidad de los pesos y su cuantización corresponde al release 0.2, con métricas de KL y perplejidad medidas allí hasta 64K. El prefill V8 introduce una divergencia numérica pequeña y dependiente de la longitud respecto a la ruta solo-ANE: KL del último token de 0,010 a 2K y 0,058 a 64K.

## Capacidades

- Generación de texto con contexto largo: hasta 98.304 tokens, adecuado para documentos extensos, bases de código y conversaciones multi-turno prolongadas.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B (capacidades específicas del base no detalladas en la información disponible).
- Decodificación especulativa integrada (DFlash2, T=8) que acelera la generación en la ANE.
- Reutilización de caché de prompt entre turnos (KV cache segmentada), con unos 320 tokens nuevos por turno de seguimiento.
- Ejecución local en hardware Apple (ANE + GPU) sin depender de la nube.
- Tool calling, function calling, agentes y capacidades multimodales: no disponible en la información proporcionada para esta build.

## Casos de uso

- Asistencia sobre documentación extensa en local: con 96K de contexto, el modelo puede ingerir manuales técnicos, contratos o informes completos en un solo prompt y responder preguntas con seguimiento multi-turno reutilizando la caché de prompt (follow-up de 1-3 s medidos).
- Análisis de repositorios de código: la ventana de 96K permite cargar varios ficheros fuente o un módulo completo para revisión, explicación o generación de tests, ejecutándose íntegramente en un Mac M6 sin enviar código a terceros.
- Prototipado de asistentes conversacionales privados: al correr en hardware local con licencia Apache-2.0, es adecuado para entornos con requisitos de confidencialidad donde no se puede usar una API externa.
- Investigación en inferencia eficiente: el código incluido (rama v8-gpu-ane-prefill) y las mediciones de prefill/decode por longitud sirven como banco de pruebas para estudiar reparto de carga ANE/GPU y decodificación especulativa.
- Procesamiento por lotes de textos largos offline: tareas de resumen, extracción de entidades o clasificación sobre documentos de decenas de miles de tokens ejecutadas en local, aceptando el coste de prefill en frío (hasta 274 s a 95K).
- Evaluación de cuantización y fidelidad numérica: la model card reporta KL por longitud, lo que permite comparar la ruta híbrida V8 frente a la ruta solo-ANE en experimentos de calidad.

## Benchmarks y rendimiento

Mediciones del servidor V8 a 96K, drafter DFlash2, decodificación greedy, thinking off, GPU ociosa, en M6 con 32 GB y macOS 27.3 (tiempos hasta el primer token en el cliente):

| Prompt | Prefill en frío | Follow-up | Ciclo de decode | Decode en frío |
|---|---|---|---|---|
| 2K | 586 tok/s (3,6 s) | 1,04 s | 108 ms | 34,4 tok/s |
| 8K | 658 tok/s (12,5 s) | 1,15 s | 112 ms | 24,6 tok/s |
| 16K | 620 tok/s (26,5 s) | 1,90 s | 120 ms | 20,4 tok/s |
| 32K | 541 tok/s (61 s) | 1,75 s | 134 ms | 19,3 tok/s |
| 64K | 420 tok/s (156 s) | 2,36 s | 153 ms | 18,5 tok/s |
| 95K | 347 tok/s (274 s) | 2,92 s | 155 ms | 18,9 tok/s |

La velocidad de decode se calcula como tiempo de ciclo entre tokens de draft aceptados: 2,4 a 3,7 por ciclo en estos turnos en frío, hasta 7,8 cuando la respuesta repite texto previo (20 a 67 tok/s). Los paquetes solo-ANE del mismo modelo hacen prefill de unos 300 tok/s entre 2K y 8K y 180 tok/s a 96K. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Mac con chip M6 y 32 GB de memoria unificada, macOS 27.3; la model card indica explícitamente "M6 only" (atención FP8).
- VRAM/memoria: no se detalla un desglose de memoria por componente; la descarga ocupa unos 14 GB, más la caché de compilación de Core AI y los programas compilados del sistema.
- GPU recomendadas: no aplica en el sentido convencional; requiere la ANE y GPU integradas del M6. No hay soporte indicado para A100, H100 ni RTX.
- Cabe en GPU de consumo: sí, en el sentido de que corre en un SoC de consumo (M6), no en GPUs discretas convencionales.
- Opciones de despliegue: runtime propio de ANEMLL Forge (snapshot de la rama v8-gpu-ane-prefill, commit 000659b), servidor `research/v8_prefill/pipe/v8_server.sh`, motor GPU compilado con `swiftc`, paquetes con `forge.py compile`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; prefill de 347-658 tok/s y decode de 18-34 tok/s según longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| anemll-forge-qwen3.8-27B-V8-96K | 27B denso | 96K | Apache-2.0 | ANE + GPU en M6 (Core AI) | Research preview, prefill híbrido, drafter DFlash2 |
| anemll-forge-qwen3.8-27B (release 0.2) | 27B denso | hasta 64K (métricas KL) | Apache-2.0 | Solo ANE | Prefill ~300 tok/s a 2K-8K, 180 tok/s a 96K |
| Qwen/Qwen3.8-27B (base) | 27B denso | no disponible | Apache-2.0 | GPU convencional (frameworks estándar) | Pesos originales sin conversión ANE |

No se dispone de datos de rendimiento comparativo en benchmarks estándar entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Research preview, no release: los scripts incluidos usan rutas absolutas de la máquina de desarrollo y deben ajustarse.
- El paso de tablas GPU (`prep_engine.py`, `prep_kv8.py`) requiere el export del release, que no forma parte de este repositorio; ejecutar el prefill V8 en otra máquina necesita ese export hasta que se publique un kit de tablas portátil.
- Solo funciona en M6 con 32 GB y macOS 27.3; no hay soporte indicado para otro hardware.
- El servidor del release 0.2 no carga estos paquetes (usan KV cache segmentada).
- Divergencia numérica respecto a la ruta solo-ANE: KL del último token de 0,010 a 2K y 0,058 a 64K, creciente con la longitud.
- Las mediciones provienen de un conjunto de prompts sintéticos por longitud, no de un benchmark general; la velocidad de decode depende del texto.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible; aplican los del modelo Qwen3.8-27B.
- Idiomas soportados no especificados en esta build.
- Licencia Apache-2.0 permite uso comercial, pero la model card incluye avisos de procedencia (Qwen, DFlash2, Prism Bonsai) y no reclama endorsement de Apple ni de los proyectos upstream; conviene revisar LICENSE, NOTICE y QWEN_SOURCE.json antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B-V8-96K
- Release 0.2 del mismo proyecto: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revisión 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0)
- Drafter DFlash2: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2 (revisión 4cfb6ad03268fed0f60ca96c1a659c0b1c77e50b)
- Herramienta de parseo HWX: https://github.com/freedomtan/coreml_to_ane_hwx
- README de investigación V8: code/anemll-forge/research/v8_prefill/README.md (dentro del repositorio)
- Código fuente: code/anemll-forge/ (snapshot MIT, rama v8-gpu-ane-prefill, commit 000659b)
