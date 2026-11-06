# DogEasy/FLUX.2-klein-4B-abliterated-amdnpu

## Resumen

FLUX.2-klein-4B-abliterated-amdnpu es una variante no oficial del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, adaptada por el usuario DogEasy para ejecutarse en la NPU de los PC con AMD Ryzen AI. Se trata de un derivado del modelo `amd/FLUX.2-klein-4B-amdnpu`, en el que se sustituye el codificador de texto Qwen3-4B original por una versión "abliterated" (sin censura) publicada por ponpoke, exportada a ONNX y cuantizada a 4 bits.

El modelo mantiene intactos el transformer y el decodificador VAE optimizados por AMD para NPU, y solo modifica el codificador de texto, que corre en formato INT4 mediante DirectML/CPU. El pipeline es de tipo text-to-image e image-to-image, con inferencia en 4 pasos (modelo destilado) y embeddings de prompt en FP16 con forma `[batch, 256, 7680]`.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar un modelo de difusión de 4B parámetros en hardware de consumo con NPU integrada; por otro, al eliminar las restricciones del codificador de texto original, atrae a usuarios interesados en generar contenido sin filtros, lo que plantea consideraciones éticas y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (FLUX.2 [klein] 4B) con codificador de texto Qwen3-4B, transformer y VAE optimizados para NPU AMD |
| Parametros totales | 4B (según nomenclatura del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Codificador de texto INT4 (MatMulNBits, block size 128, asimétrico); transformer y VAE en formato optimizado para NPU; embeddings FP16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (remite a las licencias de los repositorios upstream) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de FLUX.2 [klein] 4B, un modelo de difusión para generación de imágenes con un codificador de texto basado en Qwen3-4B. La modificación principal consiste en reemplazar dicho codificador por la versión abliterated de ponpoke, exportada a ONNX y cuantizada a 4 bits con `MatMulNBits` (tamaño de bloque 128, asimétrico), conservando la interfaz de entrada/salida del codificador original de AMD.

El transformer y el decodificador VAE son los modelos originales optimizados por AMD para su NPU Ryzen AI, sin cambios. La inferencia utiliza el modelo destilado en 4 pasos, lo que reduce el coste computacional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en el modelo base o en el derivado.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en inglés.
- Generación de imágenes a partir de imágenes (image-to-image).
- Inferencia en 4 pasos gracias al modelo destilado, lo que reduce la latencia.
- Ejecución en NPU AMD Ryzen AI mediante DirectML/CPU para el codificador de texto.
- Codificador de texto sin censura (abliterated), que elimina parte de los filtros del modelo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros dominios.

## Casos de uso

- Prototipado rápido en PC con Ryzen AI: permite generar imágenes de 1024x1024 en local sin GPU dedicada, usando la NPU integrada y el sandbox de AMD.
- Generación de arte conceptual sin restricciones: útil para artistas que necesitan explorar temáticas que los filtros convencionales bloquean, aunque con implicaciones éticas.
- Iteración image-to-image: permite refinar bocetos o variaciones de una imagen existente en un flujo de trabajo local.
- Demostración técnica de cuantización INT4 en NPU: sirve como referencia para desarrolladores que quieran portar otros modelos de difusión a Ryzen AI.
- Investigación sobre alineación y censura: permite estudiar el impacto de sustituir codificadores de texto alineados por versiones abliterated.
- Automatización de generación de imágenes por lotes: el script de ejemplo permite generar múltiples imágenes (`-n 4`) con semilla fija para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI (serie 7040/8040 o superior) con Ryzen AI 1.8.0.
- VRAM/RAM estimada: el repositorio ocupa 8,1 GB; se recomienda al menos 16 GB de RAM del sistema para cargar el modelo completo.
- GPU dedicada no necesaria; el codificador de texto corre en DirectML/CPU.
- Despliegue mediante AMD GenAI-SD (sd-sandbox) y el script `run.py`.
- No se documentan latencia ni throughput concretos.
- No compatible con vLLM, llama.cpp, Ollama ni TGI (es un modelo de difusión ONNX, no un LLM).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-abliterated-amdnpu | 4B | No disponible | No disponible | Hugging Face (ONNX) | Derivado no oficial, codificador sin censura |
| amd/FLUX.2-klein-4B-amdnpu | 4B | No disponible | No disponible | Hugging Face | Modelo base oficial de AMD para NPU |
| black-forest-labs/FLUX.2-klein-4B | 4B | No disponible | No disponible | Hugging Face | Modelo original de Black Forest Labs |
| ponpoke/flux2-klein-4b-uncensored-text-encoder | 4B (codificador) | No disponible | No disponible | Hugging Face | Codificador de texto abliterated |

## Limitaciones y advertencias

- Modelo derivado no oficial: no está respaldado por AMD ni por Black Forest Labs.
- El codificador abliterated elimina filtros de seguridad, lo que puede facilitar la generación de contenido sensible, ilegal o dañino; su uso conlleva responsabilidad legal y ética.
- Licencia no especificada: es imprescindible revisar las licencias de los repositorios upstream antes de cualquier uso comercial o redistribución.
- Solo soporta inglés; no se documentan otros idiomas.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión, especialmente en prompts ambiguos.
- Requiere hardware AMD Ryzen AI específico y el entorno Ryzen AI 1.8.0; no es portable a otras plataformas sin conversión.
- Sin benchmarks publicados: el rendimiento real frente al modelo base no está cuantificado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.

## Enlaces

- [Hugging Face: DogEasy/FLUX.2-klein-4B-abliterated-amdnpu](https://huggingface.co/DogEasy/FLUX.2-klein-4B-abliterated-amdnpu)
- [Modelo base AMD: amd/FLUX.2-klein-4B-amdnpu](https://huggingface.co/amd/FLUX.2-klein-4B-amdnpu)
- [Modelo original: black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- [Codificador abliterated: ponpoke/flux2-klein-4b-uncensored-text-encoder](https://huggingface.co/ponpoke/flux2-klein-4b-uncensored-text-encoder)
- [AMD GenAI-SD (sd-sandbox)](https://github.com/amd/sd-sandbox)
