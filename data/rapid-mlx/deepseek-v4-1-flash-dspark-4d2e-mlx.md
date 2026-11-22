# rapid-mlx/DeepSeek-V4.1-Flash-DSpark-4d2e-MLX

## Resumen

DeepSeek-V4.1-Flash-DSpark-4d2e-MLX es un sidecar de decodificación especulativa (speculative decoding) publicado por rapid-mlx para su modelo objetivo DeepSeek-V4.1-Flash-REAP-2bit-MLX. No es un modelo autónomo: contiene únicamente la cabeza DSpark de 4,62 GB (7.430.590.050 parámetros en safetensors) que propone tokens candidatos, los cuales son verificados de forma autoritativa por el modelo objetivo de aproximadamente 212,9 GB. Sin el target emparejado, este repositorio no puede responder a ninguna petición.

El problema que resuelve es el bajo throughput de la inferencia de un modelo grande cuantizado a 2 bits en Apple Silicon: el target autoregresivo alcanza 9,58 tok/s en un M3 Ultra con 256 GiB de memoria unificada, mientras que el pipeline con DSpark en ventana fija K=4 llega a 19,39 tok/s, un factor de 2,02x. La innovación es un esquema de verificación en tres etapas (stage-0, stage-1, stage-2) con precisión mixta: rutas de atención, shared-expert, proyección principal, Markov y confianza en affine 4-bit con group size 64, y expertos enrutados (dominantes en ancho de banda) en affine 2-bit.

Es relevante ahora porque demuestra que la predicción multi-token puede hacer viable un modelo de clase frontera cuantizado agresivamente en hardware de consumo de gama alta, aunque el autor lo marca explícitamente como experimental: el target de 2 bits mostró un seguimiento de instrucciones débil o repetitivo en varias pruebas en inglés, y la calidad comparativa de tareas sigue en proceso de cualificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificación especulativa DSpark de tres etapas sobre transformer DeepSeek V4.1 (detalles internos del target no disponibles) |
| Parametros totales | 7.430.590.050 (sidecar); target emparejado de aproximadamente 212,93 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit group size 64 (atención, shared-expert, proyección principal, Markov, confianza); affine 2-bit group size 64 (expertos enrutados); embedding compartido y LM head provistos por el target 2-bit en tiempo de ejecución |
| Idiomas soportados | no disponible (las pruebas medidas incluyen dominios en inglés, chino, código, aritmética y JSON) |
| Licencia | MIT |
| Formato de pesos | safetensors (3 shards), librería MLX |

## Arquitectura y entrenamiento

El sidecar implementa una cabeza de predicción multi-token organizada en tres etapas (`dspark-mixed-stage-0`, `stage-1` y `stage-2`), con rutas densas y rutas de expertos enrutados. La decodificación especulativa funciona con verificación autoritativa del target: los tokens borrador solo se emiten tras la verificación contra los logits del modelo objetivo, y las correcciones provienen de dichos logits. La ventana de verificación cualificada es K=4, con una longitud media de borrador aceptada de 1,85 tokens extra por bloque de verificación.

Las rutas densas se convirtieron desde el release oficial de DeepSeek V4.1 Flash en la revisión `dba1be0a40aa45a94ad051997016db3960a90277`, y los valores de los expertos enrutados provienen del checkpoint affine 2-bit fijado en la revisión `802f1a00982705d81b79ad1c83aa0ccc0b863ebc`. El layout mixto ocupa 4.617.792.648 bytes, solo un 3,5% más que una cabeza DSpark completamente a 2 bits; según el autor, una cabeza uniforme a 4 bits no era viable dentro del límite de memoria cualificado de 256 GiB. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de tokens borrador para decodificación especulativa verificada por el target; no genera texto de forma autónoma.
- Aceleración de decodificación en cuatro dominios medidos: código, razonamiento aritmético, salida estructurada solo JSON y chino.
- Predicción multi-token con ventana fija configurable (K=4 cualificado, K=5 evaluado pero más lento).
- Integración con el runtime propietario de Rapid-MLX y con flujos de agentes vía `rapid-mlx agents` (OpenCode, Claude Code, Codex).
- Estabilidad token a token en las cuatro salidas medidas con K=4 a lo largo de dos repeticiones consecutivas.
- Verificación de integridad de artefactos mediante SHA-256 y revisión fijada.
- No soporta tool calling, visión, audio ni modo thinking por sí mismo: esas capacidades dependerían del target DeepSeek V4.1 Flash, no documentadas en esta ficha.

## Casos de uso

- Aceleración de inferencia local en Mac de gama alta: servir el target REAP 2-bit con DSpark habilitado para duplicar el throughput de decodificación (de 9,58 a 19,39 tok/s) en un M3 Ultra con 256 GiB, adecuado para prototipado interactivo.
- Generación de código asistida en local: el dominio de código es uno de los cuatro medidos; el pipeline permite integrar el endpoint compatible con OpenAI (`/v1/chat/completions`) en editores y agentes CLI.
- Salida estructurada JSON: útil para pipelines que requieren respuestas parseables, uno de los dominios de la ventana de verificación, aunque la calidad del target 2-bit debe validarse por tarea.
- Razonamiento aritmético por lotes pequeños: el esquema especulativo reduce el coste por token en cargas de trabajo con prompts cortos y hasta 128 tokens de salida, el régimen medido.
- Procesamiento de texto en chino en local: dominio incluido en la cualificación, relevante para equipos que necesitan inferencia sin salida a la nube.
- Investigación en decodificación especulativa: el repositorio publica hashes, revisiones inmutables y métricas por dominio, lo que lo convierte en una referencia reproducible para estudiar aceptación de borradores y compromisos K.
- Despliegue de agentes en estación de trabajo: la integración con OpenCode, Claude Code y Codex permite ejecutar flujos multi-paso sobre el endpoint local, sujeto a la calidad del target.

## Benchmarks y rendimiento

Entorno medido: Apple M3 Ultra, 256 GiB de memoria unificada; target REAP12.5 affine 2-bit de aproximadamente 212,93 GB; verificación DSpark empaquetada K=4; cuatro dominios (código, razonamiento aritmético, JSON estructurado y chino); hasta 128 tokens de salida; dos repeticiones consecutivas por prompt.

| Ruta | Throughput de decodificación ponderado | Relativo a AR |
|---|---:|---:|
| Target autoregresivo | 9,58 tok/s | 1,00x |
| DSpark mixto, K=4 | 19,39 tok/s | 2,02x |
| DSpark mixto, K=5 | 18,49 tok/s | 1,93x |

Los resultados por dominio con K=4 oscilaron entre 11,87 y 25,93 tok/s. La longitud media de borrador aceptada fue de 1,85 tokens extra por bloque. El pico de memoria MLX fue de 218,232 GB. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria unificada mínima: 256 GiB (clase de máquina mínima soportada); el target emparejado ocupa aproximadamente 212,9 GB y el sidecar 4,6 GB.
- VRAM estimada: no aplica en el sentido tradicional; el despliegue es sobre memoria unificada de Apple Silicon. El pico medido de memoria MLX fue de 218,232 GB.
- GPU recomendadas: Apple M3 Ultra con 256 GiB es el entorno cualificado; no se documentan otras GPU (A100, H100, RTX 4090) para este sidecar MLX.
- No cabe en GPU de consumo convencional: el requisito de 256 GiB de memoria unificada excede cualquier RTX 4090 (24 GB) o configuración multi-GPU estándar documentada.
- Opciones de despliegue: runtime Rapid-MLX (`rapid-mlx serve deepseek-v41-flash-reap-2bit`), endpoint compatible con OpenAI en `localhost:8000`, aplicación de escritorio Rapid-MLX y flujos de agentes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,39 tok/s ponderado con K=4 (rango por dominio de 11,87 a 25,93 tok/s); 9,58 tok/s en modo autoregresivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-DSpark-4d2e-MLX (sidecar) | 7,43 B (sidecar) + target ~213 GB | no disponible | 19,39 tok/s (K=4) | MIT | Hugging Face, runtime Rapid-MLX |
| DeepSeek-V4.1-Flash-REAP-2bit-MLX (target sin DSpark) | ~213 GB | no disponible | 9,58 tok/s (AR) | no disponible | Hugging Face, runtime Rapid-MLX |
| DeepSeek-V4.1-Flash (release oficial) | no disponible | no disponible | no disponible | no disponible | Hugging Face (revisión `dba1be0a...`) |

No se dispone de datos de benchmarks de calidad ni de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el target `rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX` en la revisión `a25fec277b9e7cedc0e9f3f15da874a5cf9d491b` no puede responder a ninguna petición.
- Estado experimental: la cualificación comparativa de calidad de tareas está en curso según el autor.
- El target de 2 bits mostró seguimiento de instrucciones débil o repetitivo en varias pruebas en inglés.
- La salida especulativa por lotes fijos no está garantizada como idéntica bit a bit a una ejecución autoregresiva secuencial; las decisiones del target con margen bajo pueden diferir según la forma del lote de verificación.
- K=5 acepta más borradores pero resulta más lento de extremo a extremo; K=4 es la configuración cualificada.
- El rendimiento de 19,39 tok/s no es una garantía para todos los prompts, longitudes de contexto, estados térmicos o máquinas.
- Requisito de hardware muy restrictivo: 256 GiB de memoria unificada como mínimo.
- Idiomas soportados no documentados; la cobertura medida se limita a inglés, chino, código, aritmética y JSON.
- Licencia MIT para el sidecar, pero conviene revisar `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base DeepSeek para uso comercial en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-DSpark-4d2e-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Target emparejado: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX
- Instalación de Rapid-MLX: https://rapidmlx.com/install.sh
- Documentación de agentes: https://rapidmlx.com/docs/agents
- Descarga de la aplicación de escritorio: https://rapidmlx.com/download
