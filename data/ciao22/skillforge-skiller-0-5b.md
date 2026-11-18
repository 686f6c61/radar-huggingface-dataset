# Ciao22/skillforge-skiller-0.5B

## Resumen

skillforge-skiller-0.5B es un ajuste fino mediante LoRA (r=16) del modelo Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario Ciao22. Su propósito es transformar material en bruto en documentos de "skill" completos y ejecutables, es decir, especificaciones estructuradas que la aplicación Skillforge valida y consume. El modelo se distribuye ya cuantizado en el formato `q4f16_1` de MLC, con el objetivo de ejecutarse íntegramente en el navegador mediante WebLLM sobre WebGPU, sin necesidad de servidor.

La relevancia de esta ficha es doble. Por un lado, ilustra un patrón de despliegue emergente: modelos pequeños especializados que corren en el dispositivo del usuario (on-device) con privacidad total y coste de inferencia nulo para el proveedor. Por otro, ejemplifica una cadena de conversión reproducible y verificable, ya que el autor afirma que su exportador reproduce byte a byte el build oficial de MLC para el modelo base.

Arquitectónicamente no introduce cambios respecto al modelo base: mantiene la arquitectura transformer de Qwen2.5 con 0,5 mil millones de parámetros y una ventana de contexto configurada a 4096 tokens en el despliegue WebLLM. El repositorio ocupa 0,3 GB y contiene 8 shards en formato binario propietario de MLC, no safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), sin cambios respecto al modelo base |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (override en la configuracion de WebLLM); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16_1 (MLC), 8 shards, 277.996.288 bytes, 267 tensores |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (`params_shard_0..7.bin`, `mlc-chat-config.json`, `tensor-cache.json`, `ndarray-cache.json`); no incluye safetensors ni GGUF |
| Libreria de despliegue | mlc-llm / WebLLM |
| VRAM requerida | 944,62 MB (segun configuracion WebLLM) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención completa estándar, sin mecanismos híbridos ni atención lineal. El ajuste se realizó con LoRA de rango 16 sobre pares (material → skill) propios del producto, entrenados utilizando exactamente el system prompt de la aplicación para que la salida coincida con la forma de documento que la app valida. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

La innovación técnica destacable no está en el entrenamiento sino en el pipeline de conversión: el autor implementa `mlc_export.py`, un cuantizador que reimplementa el de MLC sin depender de TVM y que, según la model card, es byte-idéntico al convertidor oficial. La conversión es reproducible y se ejecuta solo en CPU. Los pesos resultantes son compatibles con los kernels WebGPU precompilados del modelo base (`Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`), lo que permite ejecutarlos tal cual sin recompilar kernels.

## Capacidades

- Generación de texto orientada a la producción de documentos de skill estructurados a partir de material de entrada.
- Ajuste al system prompt específico de la aplicación Skillforge, lo que garantiza que la salida respete el esquema validado por la app.
- Ejecución on-device en navegador mediante WebLLM y WebGPU, sin llamadas a servidor.
- Soporte de contexto de 4096 tokens en la configuración de despliegue.
- Capacidad multilingüe limitada al inglés (idioma declarado en la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Generación de documentos de skill en el navegador: el modelo convierte material en bruto (notas, fragmentos de texto) en documentos estructurados que la aplicación Skillforge valida, ejecutándose íntegramente en el dispositivo del usuario con 944,62 MB de VRAM.
- Modo gratuito y privado de una aplicación web: al no requerir servidor, permite ofrecer una función de generación sin coste de inferencia para el proveedor y sin que los datos del usuario salgan del navegador.
- Prototipado de pipelines de generación estructurada: sirve como referencia para equipos que quieran validar la viabilidad de un modelo de 0,5B ajustado a un esquema concreto antes de escalar a un modelo mayor.
- Despliegue en entornos con conectividad limitada o requisitos de soberanía del dato: al correr en WebGPU local, es adecuado cuando no se permite enviar contenido a APIs externas.
- Educación y demos técnicas: el repositorio incluye scripts de conversión reproducibles en `skiller-training/`, útiles para aprender el flujo completo de ajuste LoRA más exportación a MLC.
- Evaluación de la cadena MLC/WebLLM: el modelo sirve como caso de prueba de que un adaptador LoRA puede empaquetarse en formato `q4f16_1` y reutilizar kernels precompilados del base sin recompilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 944,62 MB en cuantización `q4f16_1`, según la configuración de WebLLM incluida en la model card.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en navegador (el modelo está pensado para ejecución web). No se especifican modelos concretos de GPU en la información disponible.
- Cabe en GPU consumer: sí, con menos de 1 GB de VRAM requerida, aunque la información no detalla modelos concretos de tarjeta.
- Opciones de despliegue: WebLLM (vía `@mlc-ai/web-llm` con `CreateMLCEngine`); la librería declarada es mlc-llm. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| skillforge-skiller-0.5B | 0,5B | 4096 (config. WebLLM) | MLC q4f16_1 | apache-2.0 | WebLLM / navegador |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | safetensors y otros | apache-2.0 | multiple, incluido WebLLM |
| mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC | 0,5B | no disponible | MLC q4f16_1 | apache-2.0 | WebLLM / navegador |

La comparación relevante es con el modelo base y con el build oficial de MLC del mismo base. skillforge-skiller-0.5B se diferencia únicamente por el ajuste LoRA orientado a generación de skills y por reutilizar los kernels WebGPU del build oficial. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Entrenado sobre un conjunto pequeño y escrito a mano de 12 pares (material → skill), según la propia model card; la generalización fuera de ese dominio es limitada.
- Es un modelo de 0,5 mil millones de parámetros: funciona bien en skills cortos y bien delimitados, pero es más débil que un modelo grande alojado en documentos largos o sutiles.
- El autor recomienda explícitamente usarlo como opción gratuita, privada y on-device, no como sustituto de un modelo frontera.
- Riesgo de alucinación inherente a modelos pequeños, especialmente al generar documentos estructurados fuera de la distribución de entrenamiento.
- Idioma declarado: solo inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto limitado a 4096 tokens en la configuración de despliegue, lo que restringe la longitud del material de entrada.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es apache-2.0, por lo que no se añaden restricciones adicionales conocidas.
- Dependencia de WebGPU: requiere un navegador y hardware compatibles; no hay formatos alternativos (GGUF, safetensors) publicados en el repositorio.
- Sin datos de benchmarks publicados, por lo que no es posible verificar cuantitativamente la calidad frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ciao22/skillforge-skiller-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Build oficial de MLC del base: https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Scripts de entrenamiento y conversión: https://github.com/ciao22king/redesigned-funicular/tree/cloudflare-workers/skiller-training
- Aplicación Skillforge (modo on-device): https://skillforge.cc.cd/skiller
- Kernels WebGPU precompilados: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_87/base/Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm
