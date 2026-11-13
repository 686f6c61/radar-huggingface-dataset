# reverie-studio/ACE-Step-1.5-GGUF

## Resumen

ACE-Step-1.5-GGUF es un espejo (mirror) no oficial de los pesos en formato GGUF del modelo ACE-Step 1.5, publicado por el usuario reverie-studio. El repositorio original es Serveurperso/ACE-Step-1.5-GGUF, y este espejo existe únicamente para que el servicio Vibe de Reverie descargue todos sus modelos desde un único punto. Los ficheros son idénticos byte a byte al original, con sumas de verificación incluidas en `SHA256SUMS`.

El contenido no es un modelo único, sino un conjunto de componentes: un codificador de texto Qwen3-Embedding-0.6B, dos variantes de un modelo de lenguaje de 5 Hz (1.7B y 4B), dos variantes del modelo principal ACE-Step v1.5 (SFT y Turbo) y un VAE en BF16. El total de parámetros reportado en safetensors es de 1.854.243.840, lo que corresponde al modelo principal.

La relevancia de este repositorio es logística, no técnica: facilita el despliegue reproducible de ACE-Step 1.5 en pipelines que ya consumen GGUF mediante llama.cpp u otros runtimes compatibles, manteniendo la licencia MIT del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene varios componentes: codificador de texto, modelo de lenguaje y VAE) |
| Parametros totales | 1.854.243.840 (safetensors del modelo principal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (ficheros GGUF), BF16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de ACE-Step 1.5. El repositorio incluye un VAE en BF16, lo que sugiere un componente generativo basado en difusion o en un autoencoder latente, pero no se confirma en la model card. Tambien incluye un codificador de texto Qwen3-Embedding-0.6B, empleado presumiblemente para condicionar la generacion a partir de prompts textuales, y dos variantes de un modelo de lenguaje etiquetado como "5Hz" con 1.7B y 4B parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La existencia de variantes SFT y Turbo sugiere un ajuste supervisado y una version optimizada para inferencia rapida, pero no hay detalles tecnicos publicados en la informacion proporcionada.

## Capacidades

- Generacion de contenido multimodal a partir de texto, segun la presencia de un codificador de texto y un VAE.
- Procesamiento de prompts mediante Qwen3-Embedding-0.6B.
- Dos variantes del modelo principal: SFT (ajuste supervisado) y Turbo (orientada a velocidad).
- Dos tamanos de modelo de lenguaje auxiliar (1.7B y 4B) para distintos compromisos entre calidad y coste.
- Compatibilidad con endpoints segun los tags del repositorio (`endpoints_compatible`).
- Capacidades especificas de tool calling, agentes, vision o audio: no disponibles.

## Casos de uso

- Despliegue reproducible en pipelines internos: al ser un espejo con checksums SHA256, permite fijar versiones exactas de los pesos y verificar integridad en entornos de produccion.
- Inferencia local con llama.cpp: los ficheros GGUF Q8_0 pueden cargarse en runtimes compatibles sin necesidad de GPU de datacenter, reduciendo el coste de experimentacion.
- Prototipado de generacion condicionada por texto: el codificador Qwen3-Embedding-0.6B permite construir prompts semanticos y evaluar la respuesta del modelo principal.
- Comparativa SFT frente a Turbo: disponer de ambas variantes en el mismo repositorio facilita experimentos A/B de calidad frente a latencia en un mismo entorno.
- Evaluacion de modelos auxiliares de distinto tamano: las variantes de 1.7B y 4B permiten medir el impacto del tamano del modelo de lenguaje en la calidad final con un coste controlado.
- Integracion en servicios tipo Vibe: el tag `endpoints_compatible` y la estructura unificada del repositorio simplifican la exposicion del modelo como endpoint HTTP en plataformas de inferencia.
- Archivo y auditoria: al conservar el README original y los ficheros de licencia sin modificar, sirve como referencia para auditorias de licencia MIT en productos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 12,7 GB, pero la inferencia solo requiere cargar los componentes necesarios.
- El modelo principal en Q8_0 ronda los 2 GB de pesos (1.854 millones de parametros a 8 bits), por lo que cabe holgadamente en GPUs de consumo.
- El VAE en BF16 y el codificador Qwen3-Embedding-0.6B anaden varios cientos de MB adicionales.
- GPU recomendadas: no disponibles de forma especifica; por tamano, una RTX 3060 de 12 GB o superior deberia ser suficiente para cargar todos los componentes simultaneamente.
- Despliegue: llama.cpp y runtimes compatibles con GGUF; vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial; no esta afiliado ni respaldado por los autores originales de ACE-Step.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright original incluido en `LICENSE`.
- Al ser una copia byte a byte, cualquier actualizacion del modelo original no se reflejara automaticamente en este repositorio.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- La ausencia de benchmarks publicados impide validar la calidad del modelo frente a alternativas.
- El tag `endpoints_compatible` no garantiza compatibilidad con todas las plataformas de inferencia; conviene verificar el runtime concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reverie-studio/ACE-Step-1.5-GGUF
- Repositorio original: https://huggingface.co/Serveurperso/ACE-Step-1.5-GGUF
