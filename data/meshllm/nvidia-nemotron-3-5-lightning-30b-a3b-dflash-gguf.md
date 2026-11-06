# meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DFlash-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DFlash-GGUF es una conversión a GGUF Q8_0 del modelo borrador (draft) DFlash de NVIDIA para el modelo principal NVIDIA-Nemotron-3.5-Lightning-30B-A3B. No se trata de un modelo generativo autónomo, sino de un componente auxiliar de decodificación especulativa: un modelo pequeño que propone tokens candidatos que el modelo principal verifica en paralelo, acelerando la generación sin alterar la distribución de salida.

El artefacto lo publica el usuario meshllm a partir de la conversión GGUF de magnitudedev del checkpoint NVFP4 original de NVIDIA. El objetivo declarado es permitir decodificación especulativa en runtimes basados en llama.cpp (como mesh-llm) y en GPUs que no disponen de kernels NVFP4 rápidos, ya que la conversión transforma los pesos MLP en NVFP4 y los pesos de atención en BF16 a Q8_0, manteniendo las escalas por tensor NVFP4 y las normas tal cual.

El repositorio es de tamaño reducido (0,9 GB) y el recuento de parámetros reportado en safetensors es de 833.362.195, dato que debe interpretarse con cautela porque el nombre del modelo base alude a 30B-A3B (30 mil millones totales, 3 mil millones activos, arquitectura MoE). La ficha que sigue describe el artefacto GGUF y su función dentro del pipeline de decodificación especulativa, no el modelo principal completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (draft) para decodificación especulativa DFlash, derivado de un transformer MoE (base 30B-A3B) |
| Parametros totales | 833.362.195 según safetensors del repo; el modelo base se denomina 30B-A3B (no disponible el desglose exacto del draft) |
| Parametros activos | no disponible (el base es MoE 30B-A3B; el draft no documenta activos) |
| Longitud de contexto | no disponible (el draft lee las capas 2, 6, 20, 30, 42 y 52 del target con bloque de 16 tokens) |
| Tipos de cuantizacion | Q8_0 (GGUF); origen NVFP4 en MLP y BF16 en atención, escalas NVFP4 y normas preservadas |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El artefacto es un draft de decodificación especulativa, no un modelo entrenado de forma independiente en esta conversión. La model card indica que el draft lee las capas 2, 6, 20, 30, 42 y 52 del modelo objetivo con un bloque de 16 tokens, lo que sugiere una arquitectura de draft multi-capa que consume estados intermedios del target para predecir varios tokens por paso. Esta configuración es característica de los esquemas de decodificación especulativa con draft model, donde el modelo pequeño propone una secuencia de tokens y el grande la valida en una sola pasada.

La conversión se realizó con `llama-quantize --allow-requantize` sobre llama.cpp 0.7.0, partiendo de la revisión `4f5b414b9388a4543dcc4b24758e09d68140a6fe` del GGUF de magnitudedev (sha256 `ca3b2a765da43234524c0c83669b4f552e31f0f226c7afa509f133cfd050bc19`). Los pesos MLP en NVFP4 y los de atención en BF16 pasan a Q8_0; las escalas por tensor NVFP4 y las normas se conservan sin recuantizar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO para este draft en la información disponible.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que el modelo objetivo NVIDIA-Nemotron-3.5-Lightning-30B-A3B los verifique, acelerando la inferencia.
- Integración con llama.cpp: formato GGUF Q8_0 compatible con runtimes basados en llama.cpp, incluido mesh-llm.
- Ejecución en GPUs sin kernels NVFP4: la conversión a Q8_0 permite usar el draft en hardware donde NVFP4 no está acelerado.
- Lectura de estados intermedios: consume las capas 2, 6, 20, 30, 42 y 52 del target con bloque de 16 tokens.
- No es un modelo generativo autónomo: no está pensado para generar texto por sí solo ni para tareas de razonamiento, código o matemáticas de forma independiente.
- Soporte de tool calling, agentes, multilingüismo, visión o audio: no disponible para este draft.

## Casos de uso

- Aceleración de inferencia en producción con llama.cpp: se carga junto al modelo principal Nemotron 3.5 Lightning 30B-A3B en un runtime basado en llama.cpp para reducir la latencia de generación mediante decodificación especulativa, especialmente en despliegues donde el throughput por token es crítico.
- Despliegue en GPUs consumer sin soporte NVFP4: al estar en Q8_0, el draft puede ejecutarse en tarjetas donde los kernels NVFP4 no están optimizados, manteniendo el beneficio de la decodificación especulativa.
- Servidores de chat multi-turno: al acelerar la generación token a token, mejora la experiencia en asistentes conversacionales servidos con el modelo principal, reduciendo el tiempo hasta el primer token completo de respuesta.
- Pipelines de generación de código asistida: integrado en herramientas de autocompletado o agentes de código que usan el modelo principal, disminuye la latencia en la generación de parches y sugerencias.
- Evaluación comparativa de esquemas de decodificación especulativa: sirve como componente reproducible para medir la ganancia de velocidad frente a decodificación autoregresiva estándar en distintos hardware.
- Runtimes distribuidos tipo mesh-llm: pensado explícitamente para mesh-llm, permite repartir el draft y el target en nodos o GPUs con requisitos de memoria distintos.
- Pruebas de compatibilidad GGUF: útil para validar que la cadena de conversión NVFP4 a Q8_0 preserva la calidad de las propuestas del draft en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,9 GB en Q8_0; el draft requiere además cargar el modelo objetivo Nemotron 3.5 Lightning 30B-A3B, cuyo peso en BF16 o NVFP4 domina el consumo de memoria.
- GPU recomendadas: no disponible de forma específica para el draft; el caso de uso declarado son GPUs sin kernels NVFP4 rápidos, por lo que encaja en tarjetas consumer y profesionales que ejecuten llama.cpp.
- Cabe en GPU consumer: sí, el draft en Q8_0 (0,9 GB) cabe en cualquier GPU consumer moderna; el límite lo impone el modelo principal.
- Opciones de despliegue: llama.cpp y runtimes basados en él, como mesh-llm; no se documentan vLLM, TGI u Ollama para este artefacto.
- Latencia y throughput estimados: no disponible; la ganancia depende del hardware, del ratio de aceptación del draft y de la configuración del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Función |
|---|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DFlash-GGUF | 833.362.195 (safetensors) | no disponible | GGUF Q8_0 | OpenMDW 1.1 | Draft de decodificación especulativa |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash | no disponible | no disponible | NVFP4 | OpenMDW 1.1 | Draft original en NVFP4 |
| magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF | no disponible | no disponible | GGUF | no disponible | Conversión GGUF intermedia del draft |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B-A3B (MoE) | no disponible | safetensors BF16 | OpenMDW 1.1 | Modelo principal (target) |

## Limitaciones y advertencias

- No es un modelo autónomo: no debe usarse para generación de texto, razonamiento o tareas de código por sí solo; su función es exclusivamente servir como draft al modelo principal.
- Dependencia del target: requiere el modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B y un runtime que soporte decodificación especulativa con lectura de capas intermedias (2, 6, 20, 30, 42, 52) y bloque de 16 tokens.
- Compatibilidad limitada: pensado para llama.cpp y mesh-llm; no se garantiza funcionamiento en otros motores de inferencia.
- Riesgo de alucinación: el draft puede proponer tokens incorrectos, pero el target los verifica; el riesgo real recae en el modelo principal, no en el draft.
- Sesgos e idiomas: no disponible información sobre sesgos o cobertura lingüística de este artefacto.
- Licencia: OpenMDW 1.1; deben revisarse sus términos para uso comercial, ya que la model card la etiqueta como "other" con nombre openmdw-1.1.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación futura (2026-11-06): conviene verificar la autenticidad y procedencia del artefacto antes de usarlo en entornos críticos.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DFlash-GGUF
- Modelo base NVFP4-DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Modelo principal BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Conversión GGUF intermedia: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF
- Runtime mesh-llm: https://github.com/Mesh-LLM/mesh-llm
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
