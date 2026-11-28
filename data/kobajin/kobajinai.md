# kobajin/kobajinAI

## Resumen

kobajinAI es un modelo de chat en japones derivado por ajuste fino con LoRA sobre dos modelos base distintos: Qwen/Qwen3.5-4B (versiones v1, v2 y v3) y LiquidAI/LFM2.5-1.2B-JP-202606 (version ligera v4). Lo desarrolla el usuario kobajin y su proposito es replicar el estilo conversacional de una persona concreta, con respuestas cortas e informales, ademas de practicar el uso de memorias recuperadas en la conversacion. No es un modelo de proposito general: es una adaptacion de personaje publicada junto a su aplicacion principal, kobajin.com.

El interes tecnico esta en su formato de distribucion: el modelo se empaqueta como bundles WebLLM en cuantizacion `q4f16_1` (pesos de 4 bits con escalas de grupo en float16) para ejecutarse con WebGPU directamente en el navegador del visitante, sin servidor de inferencia. Ademas se publican conversiones GGUF `Q4_K_M` de las versiones v1 a v3 para llama.cpp. La version ligera v4 ocupa 0,66 GB y esta pensada para telefonos, tablets y equipos con menos de 8 GB de memoria.

El repositorio declara 4.205.751.296 parametros en safetensors, cifra que corresponde a la suma de los distintos checkpoints publicados y no a un unico modelo. La licencia es compuesta (`apache-2.0-and-lfm1.0`), heredada de los modelos base, con obligaciones distintas segun la version que se utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (tags `gated-deltanet`, `hybrid-attention`); base Qwen3.5-4B en v1-v3 y LFM2.5-1.2B-JP en v4 |
| Parametros totales | 4.205.751.296 en safetensors (suma de checkpoints del repo); v1-v3 sobre base de 4B, v4 sobre base de 1.2B |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q4f16_1` (MLC/WebLLM, 4 bits con escalas float16) y GGUF `Q4_K_M` (solo v1-v3) |
| Idiomas soportados | japones (`ja`) |
| Licencia | `apache-2.0-and-lfm1.0` (compuesta; ver limitaciones) |
| Formato de pesos | MLC/WebLLM (`params_shard_*.bin`, `tensor-cache.json`, `mlc-chat-config.json`), GGUF `Q4_K_M` (v1-v3) y safetensors en el repo |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA fusionado en los pesos base (merge de adaptadores), no un entrenamiento desde cero. Las versiones v1, v2 y v3 parten de Qwen/Qwen3.5-4B en la revision `851bf6e`, y la v4 parte de LiquidAI/LFM2.5-1.2B-JP-202606 en la revision `52b8b44`. Los tags del repositorio indican atencion hibrida con Gated DeltaNet, coherente con la familia LFM2 usada en la version ligera; no se detalla la composicion exacta de capas ni la configuracion del adaptador LoRA.

Los datos de entrenamiento varian por version y estan documentados en la model card: v1 se entreno solo con conversaciones reales; v2 anade filas que practican el uso de memorias recuperadas; v3 se entreno mayoritariamente con ejemplos sinteticos escritos por "Luna" y produce respuestas mas largas y de tipo consejo; v4 reutiliza los datos y el metodo de v2 sobre el modelo base pequeno. No se publican numero de tokens de entrenamiento, composicion detallada del dataset ni si hubo etapas de RLHF o DPO. Las conversiones GGUF se generaron desde los mismos checkpoints BF16 fusionados con `convert_hf_to_gguf.py` y `llama-quantize Q4_K_M` sin importance matrix, y contienen solo el modelo de texto: excluyen el codificador de vision de Qwen3.5 y la cabeza de prediccion multi-token (MTP), por lo que no admiten decodificacion especulativa MTP.

## Capacidades

- Generacion de texto conversacional en japones con estilo informal y respuestas cortas (v1, v2).
- Uso de memorias recuperadas inyectadas en el contexto (v2 y v4; v1 las ignora en gran medida).
- Estilo alternativo de respuesta larga y orientada a consejo en v3.
- Ejecucion en navegador con WebGPU mediante WebLLM, con inferencia en el dispositivo del usuario.
- Ejecucion local con llama.cpp y otros runtimes GGUF para v1-v3.
- Perfil ligero en v4 (0,66 GB) para dispositivos con poca memoria.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Chat de personaje en navegador: el bundle WebLLM se carga con WebGPU y genera las respuestas en el dispositivo del visitante, sin coste de servidor ni envio de conversaciones a un backend, lo que encaja con el despliegue real de kobajin.com.
- Demo interactiva de bajo coste: al no requerir GPU en servidor, sirve para publicar una demo conversacional en una web estatica usando las revisiones inmutables del repositorio como URL de pesos.
- Asistente con memoria en conversaciones multi-turno: la version v2 esta entrenada con filas que practican el uso de memorias recuperadas, adecuada para prototipos de chatbots que inyectan recuerdos del usuario en el prompt.
- Despliegue en movil y tablets: la v4 de 1.2B en `q4f16_1` (0,66 GB) permite arrancar el chat en telefonos, tablets y equipos con menos de 8 GB de memoria, umbral que la web usa para seleccionar automaticamente esta version.
- Inferencia local con llama.cpp: los GGUF `Q4_K_M` de v1-v3 (2,71 GB cada uno) permiten integrar el modelo en aplicaciones de escritorio o scripts sin depender del navegador.
- Prototipado de estilos conversacionales: sirve como referencia de metodologia (LoRA fusionado, publicacion por versiones con revisiones fijas, bundles WebLLM y GGUF desde el mismo checkpoint) para equipos que quieran distribuir un modelo de personaje en web y local.
- Experimentacion con atencion hibrida en el borde: la v4, basada en LFM2.5 con Gated DeltaNet, permite evaluar el comportamiento de esta arquitectura en dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el bundle `q4f16_1` de v1-v3 corresponde a un modelo de 4B en 4 bits (del orden de 2-3 GB de pesos); los GGUF `Q4_K_M` de v1-v3 ocupan 2,71 GB en disco. La v4 ocupa 0,66 GB. No se publican cifras de VRAM pico ni de memoria de trabajo.
- GPU recomendadas: no disponibles. El requisito funcional declarado es soporte de WebGPU en el navegador para los bundles WebLLM.
- GPU de consumo: la v4 esta disenada explicitamente para telefonos, tablets y PCs con menos de 8 GB de memoria; v1-v3 requieren mas recursos y la web solo los selecciona por defecto en equipos con 8 GB o mas.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm` 0.2.89, usado por kobajin.com), llama.cpp y otros runtimes GGUF (solo v1-v3). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| kobajinAI v2 | 4B (base Qwen3.5-4B) | no disponible | WebLLM `q4f16_1`, GGUF `Q4_K_M` | apache-2.0-and-lfm1.0 | Ajuste de personaje en japones; uso principal en navegador |
| kobajinAI v4 | 1.2B (base LFM2.5-1.2B-JP) | no disponible | WebLLM `q4f16_1` (0,66 GB) | apache-2.0-and-lfm1.0 | Version ligera para movil; sin GGUF |
| Qwen/Qwen3.5-4B | 4B | no disponible | safetensors y ecosistema derivado | no disponible en la informacion | Modelo base de v1-v3; capacidades generales, no solo personaje |
| LiquidAI/LFM2.5-1.2B-JP-202606 | 1.2B | no disponible | safetensors y ecosistema derivado | no disponible en la informacion | Modelo base de v4, especializado en japones |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en imitar un estilo personal concreto; no es adecuado como asistente general ni para tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion y de mezclar memorias no relevantes: la propia model card advierte que v2 a veces introduce recuerdos no relacionados, y v1 los ignora en gran medida.
- Idioma limitado al japones; no se declaran capacidades multilingues.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas con garantias.
- Licencia compuesta: v1-v3 heredan la licencia de Qwen3.5-4B y v4 la de LFM2.5 (`lfm1.0`), con obligaciones adicionales (la v4 incluye `LICENSE` y `NOTICE.md` del modelo base). Verificar ambas antes de cualquier uso comercial.
- Los GGUF no incluyen el codificador de vision ni la cabeza MTP de Qwen3.5, por lo que no admiten decodificacion especulativa y pierden cualquier capacidad multimodal del base.
- El repositorio suma varios checkpoints; el recuento de 4.205.751.296 parametros en safetensors no representa el tamano de una unica version desplegada.
- Dependencia de WebGPU para el despliegue en navegador; los navegadores o dispositivos sin soporte no podran ejecutar los bundles WebLLM.
- El uso de revisiones fijas es obligatorio en produccion: WebLLM cachea pesos por URL y las reorganizaciones del repositorio pueden romper descargas si no se fija el commit.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kobajin/kobajinAI
- Aplicacion principal: https://kobajin.com/
- Modelo base v1-v3: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Modelo base v4: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606 (revision `52b8b4475311a63bf839c6494f78f8ad59d13515`)
- Carpeta v2 (por defecto en la web): https://huggingface.co/kobajin/kobajinAI/tree/1f9287d837eb311f5d0ab9262240ab2ed362d87c/v2
- Carpeta v1: https://huggingface.co/kobajin/kobajinAI/tree/8d6dab15195505c8c92c2d9ceb99f2551239f2d4/v1
- Carpeta v3: https://huggingface.co/kobajin/kobajinAI/tree/0bc0bea14368ef51162f68ed5c545633ee567f15/v3
- Carpeta v4 (ligera): https://huggingface.co/kobajin/kobajinAI/tree/5c03457fbc811484733abae9e1fa1b55f42e4059/v4
- Libreria WebLLM: https://github.com/mlc-ai/web-llm
- Seccion de licencia de la model card: https://huggingface.co/kobajin/kobajinAI/blob/main/README.md#license
