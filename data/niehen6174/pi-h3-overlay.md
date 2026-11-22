# Niehen6174/pi-H3-overlay

## Resumen

pi-H3 overlay es un repositorio de metadatos y materialización para servir el modelo Lakonik/pi-H3 mediante SGLang. No contiene pesos propios: su función es orquestar la descarga de los adaptadores de pi-H3 y del DiT podado de MiniMax-H3, enlazar el codificador de texto, tokenizer, procesador y ambos VAE del repositorio MiniMaxAI/MiniMax-H3, y generar un directorio por variante lista para servir con `--model-path` apuntando al propio repositorio fuente.

El modelo subyacente, pi-H3, es un derivado de MiniMax H3 según los términos de la MiniMax H3 Community License Agreement. La arquitectura es un transformer de difusión (DiT) con poda AdaLN, orientado a generación de vídeo y audio, con cuatro variantes de adaptador que difieren en el número de pasos de muestreo (2 o 4) y en la cabeza de salida (cabeza de píxel DWD o VAE de vídeo). El autor del overlay es Niehen6174 y el modelo base es Lakonik/pi-H3.

La relevancia de este repositorio es operativa: resuelve el problema de empaquetar un modelo de difusión multimodal con dependencias dispersas (adaptadores, DiT podado, VAE, codificador de texto) en un formato que SGLang puede cargar directamente en el arranque, incluyendo la carga de factores LoRA y la definición del contrato de muestreo en cada `model_index.json`. No se dispone de información sobre parámetros, contexto ni idiomas en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con poda AdaLN; derivado de MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (`transformer/pi_h3.safetensors`, `pi_h3/lora.safetensors`); repositorio sin pesos propios |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un overlay de metadatos y un script de materialización (`_overlay/materialize.py`) que, en el primer arranque, descarga los cuatro adaptadores de pi-H3 y el DiT podado (`multimodalart/MiniMax-H3-Pruned`), enlaza el codificador de texto, tokenizer, procesador y ambos VAE desde la partición `FL2VA/` de `MiniMaxAI/MiniMax-H3`, y escribe un directorio por variante.

Cada variante se compone de una copia compartida de los shards podados (con los tensores sustituidos eliminados), un shard adicional `transformer/pi_h3.safetensors` con los tensores de DiT reemplazados y la cabeza de píxel, y `pi_h3/lora.safetensors` con los factores LoRA que SGLang carga al inicio. El contrato de muestreo se declara en cada `model_index.json`: knots Euler sin desplazar, shift de vídeo 12 y shift de audio 3. Las variantes son `4step` (raíz, cabeza de píxel DWD), `2step` (cabeza DWD), `4step-vae` (VAE de vídeo) y `2step-vae` (VAE de vídeo). No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por texto, con dos cabezas de salida alternativas: cabeza de píxel DWD o VAE de vídeo.
- Generación de audio, dado el shift de audio 3 declarado en el contrato de muestreo y la presencia de un segundo VAE.
- Muestreo en 2 o 4 pasos según la variante, lo que permite elegir entre mayor velocidad o mayor fidelidad.
- Carga de adaptadores LoRA en el arranque de SGLang.
- Servicio mediante SGLang apuntando directamente al repositorio fuente con `--model-path`.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking.

## Casos de uso

- Prototipado rápido de generación de vídeo: apuntar SGLang al repositorio con `--model-path` y arrancar la variante `4step` para obtener un pipeline funcional sin gestionar manualmente la descarga de adaptadores, DiT podado y VAE.
- Despliegue de baja latencia en producción: la variante `2step` reduce el número de pasos de muestreo, adecuada para servicios interactivos donde el coste por generación es crítico.
- Evaluación comparativa de cabezas de salida: alternar entre `4step` (cabeza DWD) y `4step-vae` (VAE de vídeo) permite medir diferencias de calidad y coste computacional con el mismo contrato de muestreo.
- Generación de vídeo con audio sincronizado: el contrato declara shifts separados para vídeo (12) y audio (3), lo que habilita pipelines multimodales de vídeo con pista de audio.
- Integración en infraestructura SGLang existente: al cargarse como un modelo más en SGLang, se reutilizan los mecanismos de batching y gestión de memoria del servidor sin adaptadores ad hoc.
- Experimentación con adaptadores LoRA: los factores se cargan al inicio desde `pi_h3/lora.safetensors`, lo que facilita probar variantes de ajuste fino sobre el DiT podado.
- Reproducibilidad de entornos: la materialización genera un directorio por variante con `model_index.json` que fija el contrato de muestreo, lo que reduce la variabilidad entre despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del DiT podado y de los VAE, datos no publicados en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: SGLang (soporte nativo mediante `--model-path` apuntando al repositorio). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el número de pasos de muestreo (2 o 4) es el principal factor controlable, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi-H3 (vía overlay Niehen6174) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, servicio vía SGLang |
| Lakonik/pi-H3 (base) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| multimodalart/MiniMax-H3-Pruned | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin conexión a Hugging Face en el primer arranque, `_overlay/materialize.py` no puede descargar adaptadores ni DiT podado y el servicio no arranca.
- La licencia es la MiniMax H3 Community License Agreement, no una licencia permisiva estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- Al ser derivados de MiniMax H3, los adaptadores heredan las restricciones de la licencia del modelo original.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo subyacente.
- El contrato de muestreo está fijado en los `model_index.json` (Euler sin desplazar, shift de vídeo 12, shift de audio 3); alterarlo puede degradar la calidad de salida.
- No hay información sobre cuantizaciones soportadas, lo que limita la planificación de despliegues con memoria restringida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- La fecha de creación y actualización indicada (2026-11-22) debe verificarse en la página del repositorio.

## Enlaces

- Repositorio del overlay: https://huggingface.co/Niehen6174/pi-H3-overlay
- Modelo base: https://huggingface.co/Lakonik/pi-H3
- MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- DiT podado: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
