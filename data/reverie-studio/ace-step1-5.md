# reverie-studio/Ace-Step1.5

## Resumen

Ace-Step1.5 es un modelo de generación de audio musical distribuido a través de la librería `diffusers`. El repositorio analizado, `reverie-studio/Ace-Step1.5`, es un espejo (mirror) byte a byte del modelo original `ACE-Step/Ace-Step1.5`, publicado por Reverie Studio para centralizar las descargas de su servicio Vibe. No introduce modificaciones sobre los pesos ni sobre la model card original, que se conserva como `ORIGINAL_README.md`.

El paquete no es un único modelo monolítico, sino un conjunto de componentes: un modelo de lenguaje `acestep-5Hz-lm-1.7B` (1.700 millones de parámetros según su nombre), un codificador de texto/embeddings `Qwen3-Embedding-0.6B`, un modelo de difusión principal `acestep-v15-turbo` con su código de modelado personalizado (`modeling_acestep_v15_turbo.py`) y un VAE independiente. El repositorio ocupa 10,1 GB en formato `safetensors`.

La relevancia de esta ficha es doble: por un lado documenta la estructura real de un pipeline de generación musical basado en difusión con condicionamiento textual; por otro, advierte de que se trata de una copia de terceros sin afiliación con los autores originales, por lo que cualquier evaluación técnica debe remitirse al repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (`acestep-v15-turbo`) con LM auxiliar (`acestep-5Hz-lm-1.7B`) y codificador de embeddings (`Qwen3-Embedding-0.6B`); VAE independiente |
| Parametros totales | No disponible (el LM auxiliar declara 1,7B en el nombre; el resto de componentes no declara recuento) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en `safetensors`, presumiblemente fp16/bf16; no confirmado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (modelo de difusion, LM, embeddings y VAE); `silence_latent.pt` en PyTorch |

## Arquitectura y entrenamiento

La estructura del repositorio indica un sistema en dos etapas. La primera es un modelo de lenguaje de 1,7B (`acestep-5Hz-lm-1.7B`) que presumiblemente procesa la entrada textual o los prompts de control. La segunda es un modelo de difusion `acestep-v15-turbo` con implementación de modelado propia (`modeling_acestep_v15_turbo.py` y `configuration_acestep_v15.py`), acompañado de un VAE que convierte entre el espacio latente y la forma de onda. El codificador `Qwen3-Embedding-0.6B` aporta representaciones textuales para el condicionamiento.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones como decodificación especulativa. El sufijo "turbo" en el nombre del componente de difusión sugiere una variante optimizada para pocos pasos de muestreo, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado en la información disponible. El fichero `silence_latent.pt` apunta a un latente de referencia usado para inicialización o enmascarado durante la generación.

## Capacidades

- Generación de audio musical a partir de condicionamiento textual, según la composición del pipeline de difusión.
- Codificación de texto mediante `Qwen3-Embedding-0.6B` para alinear prompts con el espacio latente de audio.
- Modelado lingüístico auxiliar de 1,7B parámetros para el procesamiento de la descripción o instrucciones.
- Integración con `diffusers` como librería de referencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (transcripción).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de música de fondo para vídeo y podcasts: el pipeline de difusión condicionado por texto permite producir fragmentos musicales a partir de una descripción, integrándose en un flujo de postproducción automatizado.
- Prototipado de bandas sonoras interactivas: el LM auxiliar de 1,7B puede interpretar descripciones de estilo y traducirlas en condicionamientos para el modelo de difusión, útil en herramientas de creación musical asistida.
- Investigación en modelos generativos de audio: la disponibilidad del VAE, del latente de silencio y del código de modelado personalizado facilita experimentos sobre el espacio latente y técnicas de muestreo con pocos pasos.
- Creación de datasets sintéticos de audio: útil para aumentar corpus de entrenamiento de sistemas de clasificación o separación de fuentes, siempre que la licencia MIT del original lo permita.
- Evaluación comparativa de pipelines de difusión para audio: al estar empaquetado para `diffusers`, se puede integrar en bancos de pruebas que comparen arquitecturas de generación musical.
- Réplica de entornos de producción: al ser un espejo byte a byte con checksums (`SHA256SUMS`), sirve para desplegar el mismo artefacto que el servicio Vibe en entornos aislados que solo permiten una fuente de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio completo pesa 10,1 GB en `safetensors`; cargar todos los componentes en memoria requiere al menos esa cifra más el overhead de activaciones y del VAE, por lo que una GPU de 16 GB es el mínimo razonable y 24 GB ofrece margen.
- GPU recomendadas: no confirmadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 de 40-80 GB son candidatas para inferencia sin cuantización.
- GPU de consumo: probablemente viable en RTX 3090/4090 (24 GB) y ajustada en GPUs de 16 GB; no confirmado.
- Opciones de despliegue: `diffusers` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ace-Step1.5 (este mirror) | LM auxiliar 1,7B + difusion + VAE | No disponible | MIT | safetensors | Pipeline de audio musical en `diffusers` |
| ACE-Step/Ace-Step1.5 (original) | Idénticos (mismo artefacto) | No disponible | MIT | safetensors | Fuente original; este repo es copia byte a byte |
| Alternativas de generacion musical open source | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no está afiliado ni respaldado por los autores originales, por lo que la documentación puede quedar desactualizada respecto al repositorio de origen.
- La model card original no está incluida en el cuerpo de esta ficha; debe consultarse `ORIGINAL_README.md` para conocer limitaciones declaradas por los autores.
- No hay información sobre sesgos del modelo, riesgo de alucinación en el condicionamiento textual ni calidad subjetiva del audio generado.
- No se documentan idiomas soportados ni comportamiento en prompts fuera del inglés.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del repositorio original y de los componentes de terceros incluidos (por ejemplo, `Qwen3-Embedding-0.6B`), que pueden tener condiciones propias.
- El uso de `custom_code` en `diffusers` implica ejecutar código Python del repositorio (`modeling_acestep_v15_turbo.py`); en producción conviene auditar ese código y fijar versiones.
- No hay métricas publicadas de latencia, throughput ni calidad, lo que impide garantizar acuerdos de nivel de servicio sin una evaluación propia.

## Enlaces

- Repositorio mirror: https://huggingface.co/reverie-studio/Ace-Step1.5
- Modelo original: https://huggingface.co/ACE-Step/Ace-Step1.5
- Librería diffusers: https://github.com/huggingface/diffusers
- Codificador de embeddings referenciado: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
